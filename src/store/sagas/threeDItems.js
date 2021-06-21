import { call, put, select } from 'redux-saga/effects';
import store from '@/store';
import { roomSize, limitPosition } from '@/components/Panorama'
import { uniqueId, imagePath } from '@/utils/MyUtils';
import ThreeDItemsActions from '@/store/ducks/threeDItems';

const THREE = window.THREE;
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = '*';

const LINK_IMAGE = imagePath('arrow.png')

export function* initThreeDItemsRequest({ data, scenes }) {

  let ThreeDItems = {};

  for ( const [id, item] of Object.entries(data) ) {

    const position = new THREE.Vector3(item.position.x, item.position.y, item.position.z);
    const rotation = new THREE.Vector3(item.rotation.x, item.rotation.y, item.rotation.z);

    let videoElement;
    if (item.type == 'video') {
      videoElement = yield call(createVideoElement, window.cdn + item.url);
    }

    const ThreeDItem = createThreeDItem( 
      {
        init: true,
        type: item.type,
        url: item.type == 'image' ? item.images[0].url : item.url,
        position,
        rotation,
        scale: item.scale,
        width: item.width,
        height: item.height,
        scene: item.scene,
        panorama: scenes[item.scene].panorama,
        ... item.type == 'video' && { videoElement: videoElement }
      } 
    );

    ThreeDItems[id] = {
      ... ThreeDItem,
      ... item.type == 'link' && { 
        target : item.target
      },
      ... item.type == 'video' && { 
        video: videoElement,
      },
      ... item.type == 'image' && { 
        images: item.images,
      },
      ... (item.type == 'image' || item.type == 'video') && { 
        title: item.title,
        description: item.description,
        link: item.link,
      }
    };

  }

  yield put(ThreeDItemsActions.initThreeDItems(ThreeDItems));
}

export function* addThreeDItemRequest({ payload }) {
  try {

    const { type, position } = payload;

    const id = uniqueId();

    let videoElement;
    if (type == 'video') {
      videoElement = yield call(createVideoElement, window.cdn + payload.url);
    }

    const threeDItem = createThreeDItem({
      type: type,
      position,
      ... type == 'video' && { 
        url: payload.url,
        videoElement: videoElement, 
        width: videoElement.videoWidth, 
        height: videoElement.videoHeight 
      },
      ... type == 'image' && { 
        url: payload.images[0].url,
        width: payload.images[0].width, 
        height: payload.images[0].height,
      },
    })

    if (type == 'image') {
      threeDItem.images = payload.images
    }

    if (type == 'video') {
      threeDItem.video = videoElement
    }

    if (type == 'image' || type == 'video') {
      threeDItem.title = payload.title
      threeDItem.description = payload.description
      threeDItem.link = payload.link
    }

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

    if (threeDItem.type == 'image') {

      // if image changed
      if (payload.images[0].url != threeDItem.images[0].url) {
        threeDItem.object.geometry.dispose();
        threeDItem.object.geometry = 
          new THREE.BoxGeometry(
            payload.images[0].width,
            payload.images[0].height,
            1,
          );
        
        threeDItem.object.material = createMaterial( 
          createTexture(window.cdn + payload.images[0].url),
          0
        );
      }

      data = {
        images: payload.images,
        width: payload.images[0].width, 
        height: payload.images[0].height,
        title: payload.title,
        description: payload.description,
        link: payload.link
      }
    }

    else if (threeDItem.type == 'video') {

      // if video changed
      if (payload.url != threeDItem.url) {
        threeDItem.video.remove();
        const video = yield call(createVideoElement, window.cdn + payload.url);

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
          url: payload.url,
          width: video.videoWidth, 
          height: video.videoHeight,
          video: video,
        }
      }

      data = {
        ... data,
        title: payload.title,
        description: payload.description,
        link: payload.link
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

    const highlightItem = (item, isHighlight) => {
      const amount = isHighlight ? 0.4 : 0;
      if (item != undefined) {
        if (item.type == 'image') {
          item.object.material = createMaterial( 
            createTexture(window.cdn + item.images[0].url),
            amount 
          );
        }
        else if (item.type == 'video') {
          item.object.material = createMaterial( 
            createVideoTexture(item.video), 
            amount 
          );
        }
        else if (item.type == 'link') {
          item.object.material = createMaterial( 
            createTexture(LINK_IMAGE), 
            amount 
          );
        }
      }
    }

    if (highlightedId != null && (!isHighlight || isHighlight && id != highlightedId) ) {
      const item = state.threeDItems.data[highlightedId];
      highlightItem(item, false)
    }

    if (isHighlight) {
      const item = state.threeDItems.data[id]
      highlightItem(item, true)
    }
   
    yield put( ThreeDItemsActions.highlightThreeDItem(id ?? null) );

  } catch (error) {
    // console.log(error);
  }
}

const createThreeDItem = ({ init, type, url, width, height, position, rotation, scale, videoElement, scene, panorama }) => {

  let material;
  if (type == 'video') {
    material = createMaterial( 
      createVideoTexture(videoElement), 
      0
    );
  }
  else if (type == 'image') {
    material = createMaterial( 
      createTexture(window.cdn + url),
      0
    );
  }
  else if (type == 'link') {
    const image = LINK_IMAGE
    width = 1124
    height = 536
    material = createMaterial( 
      createTexture(image),
      0
    )
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

const createTexture = (image) => {
  const texture = textureLoader.load(image)
  texture.format = THREE.RGBAFormat

  return texture
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