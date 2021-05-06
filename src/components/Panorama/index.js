import React, { useState, useEffect, useRef } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import './style.css';
import Menu from '@/components/Menu';
import ThreeDImage from '@/components/ThreeDImage';
import Image from '@/components/Image';
import Info from '@/components/Info';

const THREE = window.THREE;
const PANOLENS = window.PANOLENS;

PANOLENS.Viewer.prototype.getPosition = function () {
  const intersects = this.raycaster.intersectObject( this.panorama, true );
  if ( intersects.length > 0 ) {
    const point = intersects[ 0 ].point.clone();
    const world = this.panorama.getWorldPosition( new THREE.Vector3() );
    point.sub( world );

    if ( point.length() === 0 ) 
      return; 
    return point;
  }
};

export let panorama = null;
export let viewer = null;
export let camera = null;
export const roomSize = 3500;

const mouse = new THREE.Vector2();
const frustum = new THREE.Frustum();

export const getElementStyle = (object) => {

  if (object != null) {
    if (frustum.intersectsObject(object)) {
      let v = new THREE.Vector3();

      object.getWorldPosition(v);
      v.project(viewer.getCamera());
      
      const x = (v.x *  .5 + .5) * viewer.renderer.domElement.clientWidth;
      const y = (v.y * -.5 + .5) * viewer.renderer.domElement.clientHeight;

      return {
        transform: `translate(-50%, -50%) translate(${x}px,${y}px)`
      };
    }
    else return {opacity: 0};
  }
  else return null;
}

const updateScene = () => {

  store.dispatch({type: 'UPDATE_CAMERA_DIRECTION', direction:'front'})

  camera.updateMatrix();
  camera.updateMatrixWorld();
  frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)); 
  store.dispatch({type: 'UPDATE_SCENE'})
}

const onMouseMove = (e) => {
  mouse.x = ( e.clientX / viewer.renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( e.clientY / viewer.renderer.domElement.clientHeight ) * 2 + 1;
  store.dispatch({type: 'UPDATE_MOUSE'})
}

const data = require('@/data.json'); 

export default function Panorama() {

  const init = () => {
  
    panorama = new PANOLENS.ImagePanorama('http://demo.solutionforest.net/360-test/pano_background.jpg');

    viewer = new PANOLENS.Viewer( { 
      output: 'console', 
      container: document.getElementById('panorama-container'),
      controlBar: false,
      renderer: new THREE.WebGLRenderer( { alpha: true, antialias: true } ),
    } );

    viewer.add( panorama );            
    viewer.renderer.sortObjects = true;

    camera = viewer.getCamera();

    if (data.threeDImages) 
      store.dispatch({type:'INIT_THREE_D_IMAGES', data: data.threeDImages});

    if (data.infos) 
      store.dispatch({type:'INIT_INFOS', data: data.infos});

    viewer.OrbitControls.addEventListener( 'change', updateScene );
    
    window.addEventListener( "resize", updateScene );

    document.addEventListener( 'mousemove', onMouseMove );

    // double click add item
    let clicked = false;
    let clickLoop;
    panorama.addEventListener( 'click', function( event ){

      menuRef.current.hide();
  
      // open image slider if click on 3d image
      const highlightedId = store.getState().threeDImages.highlightedId;
      if (highlightedId) {
        store.dispatch({
          type: 'SHOW_POPUP',
          mode: 'imagesSlides',
          data: {
            type: '3dImages',
            id: highlightedId,
          }
        }) 
      }
      else if(clicked) {
        menuRef.current.show()
      }
      else {
        clearTimeout(clickLoop)
        clicked = true;
        clickLoop = setTimeout(
          () => clicked = false,
          200,
        )
      }
      
    } );

  }

  useEffect(() => {
    init();
  }, []);

  const menuRef = useRef(null);

  const threeDImages = useSelector(state => state.threeDImages.data);
  const images = useSelector(state => state.images.data);
  const infos = useSelector(state => state.infos.data);

  // mouse picking
  const raycaster = new THREE.Raycaster();
  const updateMouse = useSelector(state => state.updateMouse);
  useEffect(() => {
  
    raycaster.setFromCamera( mouse, camera );

    const intersects = raycaster.intersectObjects( Object.values(threeDImages).map(x => x.object) );

    if ( intersects.length > 0 ) {
      const id = Object.keys(threeDImages).find(key => threeDImages[key].object === intersects[0].object);
      store.dispatch({type: 'HIGHLIGHT_THREE_D_IMAGE', id: id});
    }
    else
      store.dispatch({type: 'UNHIGHLIGHT_THREE_D_IMAGE'});
    
  }, [updateMouse]);

  return (
    <>
      <div id='panorama-container'></div>
      <div id='components-container'>
        {Object.entries(threeDImages).map( x => <ThreeDImage id={x[0]} data={x[1]}/>)}
        {Object.entries(images).map( x => <Image id={x[0]} data={x[1]}/>)}
        {Object.entries(infos).map( x => <Info id={x[0]} data={x[1]}/>)}
        <Menu ref={menuRef}/>
      </div>
    </>
  )

}
