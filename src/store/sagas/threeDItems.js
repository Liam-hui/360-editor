import { call, put, select } from 'redux-saga/effects';
import store from '@/store';
import { roomSize, limitPosition } from '@/components/Panorama'
import { uniqueId } from '@/utils/MyUtils';

import ThreeDItemsActions from '@/store/ducks/threeDItems';

const THREE = window.THREE;
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = '*';

const DEFAULT_LINK_IMAGE_URL = 'http://www.freeiconspng.com/uploads/white-arrow-transparent-png-21.png';

export function* initThreeDItemsRequest({ data, scenes }) {

  let ThreeDItems = {};

  for ( const [id, item] of Object.entries(data) ) {

    const position = new THREE.Vector3(item.position.x, item.position.y, item.position.z);
    const rotation = new THREE.Vector3(item.rotation.x, item.rotation.y, item.rotation.z);

    let video;
    if (item.type == 'video') {
      console.log('here')
      video = yield call(createVideoElement, item.url);
    }

    const ThreeDItem = createThreeDItem( 
      {
        init: true,
        type: item.type,
        url: item.url,
        position,
        rotation,
        scale: item.scale,
        width: item.width,
        height: item.height,
        scene: item.scene,
        panorama: scenes[item.scene].panorama,
        ... item.type == 'video' && { video: video }
      } 
    );

    ThreeDItems[id] = {
      ...ThreeDItem,
      ... item.target && { target : item.target},
      ... item.slides && { slides: item.slides }
    };

  }

  yield put(ThreeDItemsActions.initThreeDItems(ThreeDItems));
}

export function* addThreeDItemRequest({ payload }) {
  try {


    const { type, position } = payload;

    const id = uniqueId();

    let video;
    if (type == 'video') {
      video = yield call(createVideoElement, payload.videoUrl);
    }

    const threeDItem = createThreeDItem({
      type: type,
      position,
      ... type == 'video' && { 
        url: payload.videoUrl,
        video: video, 
        width: video.videoWidth, 
        height: video.videoHeight 
      },
      ... type == 'image' && { 
        url: payload.image.url,
        width: payload.image.width, 
        height: payload.image.height 
      },
      ... type == 'link' && { 
        url: DEFAULT_LINK_IMAGE_URL,
        width: 1000, 
        height: 1000 
      }
    })

    yield put( ThreeDItemsActions.addThreeDItem(id, threeDItem) );

  } catch (error) {
    // console.log(error);
  }
}

export function* updateThreeDItemRequest({ id, payload }) {
  try {

    const state = yield select();
    const threeDItem = state.threeDItems.data[id];
    let data = {};

    if (payload.image) {

      threeDItem.object.geometry.dispose();
      threeDItem.object.geometry = 
        new THREE.BoxGeometry(
          payload.image.width,
          payload.image.height,
          1,
        );
      
      threeDItem.object.material = createMaterial( 
        createTexture(payload.image.url),
        0
      );
      
      data = {
        url: payload.image.url,
        width: payload.image.width, 
        height: payload.image.height 
      }
    }

    else if (payload.video) {
      threeDItem.video.remove();
      // const video = yield call(createVideoElement, payload.video);
      const video = yield call(createVideoElement, 'http://demo.solutionforest.net/dark-test/test_video.mp4');

      threeDItem.object.geometry.dispose();
      threeDItem.object.geometry = 
        new THREE.BoxGeometry(
          video.videoWidth,
          video.videoHeight,
          1,
        );

      threeDItem.object.material = createMaterial( 
        createVideoTexture(video), 
        0
      );

      data = {
        url: payload.video,
        width: video.videoWidth, 
        height: video.videoHeight,
        video: video,
      }
    }

    else data = payload;
    
    yield put( ThreeDItemsActions.updateThreeDItem(id, data) );

  } catch (error) {
    // console.log(error);
  }
}

export function* removeThreeDItemRequest({ id, sceneId }) {
  try {
    const state = yield select();

    let ids = [];

    if (id) {
      const threeDItem = state.threeDItems.data[id];
      const panorama = state.scenes.data[threeDItem.scene].panorama;

      panorama.remove(threeDItem.object);
      threeDItem.object.geometry.dispose();
      threeDItem.object.material.dispose();

      if (threeDItem.type == 'video') {
        threeDItem.video.remove();
      }

      ids = [id];
    }

    if (sceneId) {

      for (let id in state.threeDItems.data) {
       
        if (state.threeDItems.data[id].scene == sceneId) {

          const threeDItem = state.threeDItems.data[id];
          // threeDItem.object.geometry.dispose();
          // threeDItem.object.material.dispose();
           // no need dispose, will cause error
          
          if (threeDItem.type == 'video') {
            threeDItem.video.remove();
          }

          ids.push(id);
        }
      }
    }

    yield put( ThreeDItemsActions.removeThreeDItem(ids) );
    yield put({ type: 'UPDATE_SCENE' });

  } catch (error) {
    // console.log(error);
  }
}

export function* highlightThreeDItemRequest({ id, isHighlight }) {
  try {

    const state = yield select();
    const highlightedId = state.threeDItems.highlightedId;

    const threeDItem = isHighlight ? state.threeDItems.data[id] : state.threeDItems.data[highlightedId];
    const amount = isHighlight ? 0.4 : 0;

    if (threeDItem != undefined) {
      if (threeDItem.type == 'image' || threeDItem.type == 'link') {
        threeDItem.object.material = createMaterial( 
          createTexture(threeDItem.url),
          amount 
        );
      }
      else if (threeDItem.type == 'video') {
        threeDItem.object.material = createMaterial( 
          createVideoTexture(threeDItem.video), 
          amount 
        );
      }
    }
   
    yield put( ThreeDItemsActions.highlightThreeDItem(id ?? null) );

  } catch (error) {
    // console.log(error);
  }
}

const createThreeDItem = ({ init, type, url, width, height, position, rotation, scale, video, scene, panorama }) => {

  let material;
  if (type == 'video') {
    material = createMaterial( 
      createVideoTexture(video), 
      0
    );
  }
  else if (type == 'image' || type == 'link') {
    material = createMaterial( 
      createTexture(url),
      0
    );
  }

  const object = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      1,
    ), 
    material
  );

  if (init) object.visible = false;
  
  object.position.copy( limitPosition(object, position) );

  if (rotation) {
    object.rotation.x = rotation.x;
    object.rotation.y = rotation.y;
    object.rotation.z = rotation.z;
  }
  else {
    if (position.y > roomSize) {
      object.rotateX( Math.PI * 0.5 )
    }
    else if (position.y < -roomSize) {
      object.rotateX( - Math.PI * 0.5 )
    }
    else if (position.x < -roomSize) {
      object.rotateY( Math.PI * 0.5 )
    }
    else if (position.x > roomSize) {
      object.rotateY( - Math.PI * 0.5 )
    }
    else if (position.z > roomSize) {
      object.rotateY( Math.PI )
    }
    // else if (position.z < -roomSize) {
    // }
  }

  if (scale != undefined) 
    object.scale.set(
      scale,
      scale,
      1,
    )

  if (scene == undefined) 
    scene = store.getState().scenes.currentId;
    
  if (panorama == undefined) 
    panorama = store.getState().scenes.data[scene].panorama;
  panorama.add(object);

  const ThreeDItem = {  
    type: type,
    url: url,
    width: width,
    height: height,
    object: object,
    scene: scene,
    slides: [],
    ... type == 'video' && { video: video },
  }

  return ThreeDItem;
 
}

const createMaterial = ( texture, amount ) => new THREE.ShaderMaterial({

  uniforms: {  
    texture: { type: "t", value: texture },
    amount: { type: "f", value: amount },
  },
  vertexShader: `
    varying vec2 vUv;

    void main()
    {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `    
    uniform sampler2D texture;
    uniform float amount;
    
    varying vec2 vUv;
    
    void main(void)
    {
      vec3 c;
      vec3 white = vec3(1.0, 1.0, 1.0);
      vec4 ca = texture2D(texture, vUv);
      c = ca.rgb * ( 1.0 - amount ) + white * amount; 
      gl_FragColor= vec4(c, ca.a);
    }
  `,
  transparent: true
});

const createTexture = ( url ) => {
  const texture = textureLoader.load(url);
  texture.format = THREE.RGBAFormat;

  return texture;
}

const createVideoTexture = ( video ) => {
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.format = THREE.RGBAFormat;

  return videoTexture;
}

const createVideoElement = ( url ) => {
  return new Promise(resolve => {
    
    const video = document.createElement('video');

    video.crossOrigin = "anonymous";
    video.src = url;

    video.onloadedmetadata = () => {

      video.autoplay = true; 
      video.loop = true;
      video.muted = true;
      video.setAttribute("muted", true);
      video.setAttribute("playsinline", true);

      video.play().then(
        () => {
          resolve(video);
        }
      );
    }
    
  });
}