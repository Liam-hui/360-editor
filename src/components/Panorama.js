import React, { useState, useEffect, useRef } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";
import { isMobile } from "react-device-detect";

import Menu from '@/components/Menu';
import SetTarget from '@/components/SetTarget';
import ThreeDItem from '@/components/ThreeDItem';

const THREE = window.THREE;
const PANOLENS = window.PANOLENS;
PANOLENS.Viewer.prototype.getPosition = function () {
  const intersects = this.raycaster.intersectObject(this.panorama, true);
  if (intersects.length > 0) {
    const point = intersects[0].point.clone();
    const world = this.panorama.getWorldPosition( new THREE.Vector3() );
    point.sub(world);

    if (point.length() === 0) 
      return; 
    return point;
  }
};

export let viewer = null;
export let camera = null;
export const roomSize = 3500;
export const roomLimit = 3500;

const mouse = new THREE.Vector2();
const frustum = new THREE.Frustum();

export const getElementStyle = (object) => {

  if (object != null) {

    if ( frustum.intersectsObject(object) ) {
      let v = new THREE.Vector3();

      object.getWorldPosition( v );
      v.project( viewer.getCamera() );
      
      const x = ( v.x *  .5 + .5 ) * viewer.renderer.domElement.clientWidth;
      const y = ( v.y * -.5 + .5 ) * viewer.renderer.domElement.clientHeight;

      return {
        transform: `translate(-50%, -50%) translate(${x}px,${y}px)`
      };
    }
    else return { opacity: 0 };

  }
  else return null;
}

export const limitPosition = ( object, position ) => {

  // const size = Math.max ( object.geometry.parameters.width, object.geometry.parameters.height );
  // * object.scale.x;

  // const limit = roomLimit - size;
  const limit = roomLimit;

  position.clamp(
    new THREE.Vector3( -limit, -limit, -limit ),
    new THREE.Vector3( limit, limit, limit )
  ); 

  return position;
}

export const createObject = ( position ) => {

  const object = new THREE.Mesh(
    new THREE.BoxGeometry( 1, 1, 1 ), 
    new THREE.MeshStandardMaterial()
  );
  object.position.copy( position );

  return object;
}

const updateScene = () => {
  camera.updateMatrix();
  camera.updateMatrixWorld();
  frustum.setFromMatrix( 
    new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse )
  ); 
  store.dispatch({ type: 'UPDATE_SCENE' })
}

const onMouseMove = (e) => {
  mouse.x = ( e.clientX / viewer.renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( e.clientY / viewer.renderer.domElement.clientHeight ) * 2 + 1;
  store.dispatch({ type: 'UPDATE_MOUSE' });
}

export default function Panorama() {

  // init 
  const init = () => {
    viewer = new PANOLENS.Viewer({ 
      container: document.getElementById('panorama-container'),
      controlBar: false,
      renderer: new THREE.WebGLRenderer({ alpha: true, antialias: true }),
    });
    viewer.renderer.sortObjects = true;
    camera = viewer.getCamera();
    viewer.OrbitControls.addEventListener('change', updateScene);
    window.addEventListener('resize', updateScene);
    if (!isMobile) document.addEventListener('mousemove', onMouseMove);

    const data = window.data; 
    if (data?.scenes) {
      store.dispatch({ type:'INIT_SCENES_REQUEST', data: data });
    }
  }

  useEffect(() => {
    init();
  }, []);

  const config = useSelector(state => state.config);
  const scenes = useSelector(state => state.scenes);
  const threeDItems = useSelector(state => state.threeDItems);
  const currentPanorama = useSelector(state => state.scenes.data[scenes.currentId]?.panorama);
  const setTargetMode = useSelector(state => state.setTargetMode);
  const isPopupShown = useSelector(state => state.popup.isShown);

  const menuRef = useRef();

  // open scene after init
  useEffect(() => {
    if (scenes.isInited && threeDItems.isInited) {
      store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: scenes.firstSceneId })
    }
  }, [scenes.isInited, threeDItems.isInited]);

  // click event
  let clicked = false;
  let clickLoop;
  const onClick = (e) => {
    let threeDItemId = null;
    if (isMobile) {
      mouse.x = ( e.mouseEvent.clientX / viewer.renderer.domElement.clientWidth ) * 2 - 1
      mouse.y = - ( e.mouseEvent.clientY / viewer.renderer.domElement.clientHeight ) * 2 + 1
      threeDItemId = getIntersectId()
    }
    else 
      threeDItemId = store.getState().threeDItems.highlightedId;

    // 3d item onPress
    if (threeDItemId != null) {
      const threeDItem = store.getState().threeDItems.data[threeDItemId];
      if (threeDItem.type == 'link') {
        if (threeDItem.target)
          store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: threeDItem.target, angle: threeDItem.angle });
      }
      else
        // video or image
        store.dispatch( {
          type: 'SHOW_POPUP' ,
          mode: 'showItem',
          payload: {
            id: threeDItemId
          }
        }) 
    }

    if (config.mode == 'admin') {
      if (threeDItemId == null & clicked)
        menuRef.current.show();
      else {
        menuRef.current.hide();
        clearTimeout(clickLoop)
        clicked = true;
        clickLoop = setTimeout(
          () => clicked = false,
          200,
        )
      }
    }
  };

  // add event to current panorama
  useEffect(() => {
    if (currentPanorama && !setTargetMode.isOn) {
      currentPanorama.addEventListener('click', onClick);
    }

    return () => {
      if (currentPanorama) {
        currentPanorama.removeEventListener('click', onClick);
      }
    }
  }, [currentPanorama, setTargetMode.isOn]);

  // when enter scene 
  useEffect(() => {
    if (scenes.isEntered) {
      store.dispatch({ type: 'SHOW_SCENE_ITEMS', id: scenes.currentId })

      if (scenes.angle) {
        const angle = scenes.angle
        camera.position.set(angle.x, angle.y, angle.z)
        store.dispatch({ type: 'SET_ANGLE_FINISH' })
      }
      else if (scenes.data[scenes.currentId]?.angle) {
        const angle = scenes.data[scenes.currentId].angle;
        camera.position.set(angle.x, angle.y, angle.z);
      }
    }
  }, [scenes.isEntered]);

  // check mouse over item
  const raycaster = new THREE.Raycaster();
  const getIntersectId = () => {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects( 
      Object.values(threeDItems.data)
      .filter(x => x.scene == scenes.currentId)
      .map(x => x.object) 
      .filter(x => x.geometry)
    );

    if (intersects.length > 0) {
      const id = 
        Object.keys(threeDItems.data)
        .find(x => threeDItems.data[x].object === intersects[0].object);
      
      return id;
    }
    else return null;
      
  }

  // mouse picking
  const updateMouse = useSelector(state => state.updateMouse);
  useEffect(() => {
    if (!isPopupShown && !setTargetMode.isOn ) {
      const id = getIntersectId();

      document.getElementById("root").style.cursor = id == null ? "unset" : "pointer";

      if (id != null && id != threeDItems.highlightedId) {
        store.dispatch({ type: 'HIGHLIGHT_THREE_D_ITEM_REQUEST', isHighlight: true, id: id });
      }

      if (id == null && threeDItems.highlightedId != null) {
        store.dispatch({ type: 'HIGHLIGHT_THREE_D_ITEM_REQUEST', isHighlight: false });
      }
    }
  }, [updateMouse]);
  useEffect(() => {
    if (isPopupShown) 
      document.getElementById("root").style.cursor = "unset";

  }, [isPopupShown]);

  return (
    <>
      <div id='panorama-container'/>

      <div className='components-container'>

        <div id="loading-progress"/>

        { config.mode == 'admin' &&
          Object.entries(threeDItems.data)
            .filter(x => x[1].scene == scenes.currentId)
            .map(x => <ThreeDItem key={x[0]} id={x[0]} data={x[1]}/>) 
        }

        { config.mode == 'admin' &&
          <Menu ref={menuRef}/>
        }

        {setTargetMode.isOn &&
          <SetTarget/>
        }

        {/* { Object.keys(scenes.data).length == 0 &&
          <div className='start-text center-flex'>ADD A SCENE TO START</div>
        } */}

      </div>
    </>
  )

}

