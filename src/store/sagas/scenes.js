import { call, put, select } from 'redux-saga/effects';
import store from '@/store'
import api from '@/services/api';
import { viewer } from '@/components/Panorama'
import { uniqueId } from '@/utils/MyUtils';

const PANOLENS = window.PANOLENS;

export function* initScenesRequest({ data }) {
  try {

    let scenes = {};
    let firstSceneId = null;

    for ( const [id, scene] of Object.entries(data.scenes) ) {

      const panorama = createPanorama(scene.baseImage);
      scenes[id] = {
        baseImage: scene.baseImage,
        panorama: panorama,
        ... scene.angle && { angle: scene.angle }
      }

      if (firstSceneId == null || scene.isFirst)
        firstSceneId = id;

    }
    
    yield put({ type:'INIT_SCENES', data: scenes, firstSceneId });
    yield put({ type:'INIT_THREE_D_ITEMS_REQUEST', data: data.threeDItems, scenes });
    // yield put({ type:'INIT_TWO_D_ITEMS_REQUEST', data: data.twoDItems, scenes });
    
  } catch (error) {
    // console.log(error);
  }
}

export function* addSceneRequest({ image }) {
  try {

    const panorama = createPanorama(image);
    viewer.add(panorama);
    viewer.setPanorama(panorama);

    const id = uniqueId();
    
    yield put( { type: 'ADD_SCENE', id: id, scene: { baseImage: image, panorama: panorama } } );
    
  } catch (error) {
    // console.log(error);
  }
}

export function* removeSceneRequest({ id }) {
  try {

    const state = yield select();
    const panorama = state.scenes.data[id].panorama;

    const nextSceneId = Object.keys(state.scenes.data).find(x => x != id);
    if (nextSceneId)
      yield put({ type: 'CHANGE_SCENE_REQUEST', id: nextSceneId });

    viewer.remove(panorama);
    panorama.dispose();

    yield put({ type: 'REMOVE_SCENE', id: id });
    yield put({ type: 'REMOVE_THREE_D_ITEM_REQUEST', sceneId: id });
    // yield put({ type: 'REMOVE_TWO_D_ITEM_REQUEST', sceneId: id });
    
  } catch (error) {
    // console.log(error);
  }
}

export function* changeSceneRequest({ id }) {
  try {

    const state = yield select();
    const currentSceneId = state.scenes.currentId;

    if (id != currentSceneId) {

      yield put({ type: 'ENTER_SCENE', isEntered: false });

      const scene = state.scenes.data[id];
      viewer.add(scene.panorama);
      viewer.setPanorama(scene.panorama);

      yield put({ type: 'CHANGE_SCENE', id: id });
      yield put({ type: 'UPDATE_SCENE' });
    
    }
    
  } catch (error) {
    // console.log(error);
  }
}

export function* showSceneItems({ id }) {
  try {

    const state = yield select();
    const previousId = state.scenes.previousId;

    // hide previous threeDItems
    let threeDItems = 
      Object.values(state.threeDItems.data)
      .filter(x => x.scene == previousId)

    for (const threeDItem of threeDItems) {
      threeDItem.object.visible = false;
    }

    // show threeDItems
    threeDItems = 
      Object.values(state.threeDItems.data)
      .filter(x => x.scene == id)

    for (const threeDItem of threeDItems) {
      threeDItem.object.visible = true;
    }
    
  } catch (error) {
    // console.log(error);
  }
}

export function* setCameraAngle({ angle }) {
  try {

   if (angle) 
    yield put({
      type: 'SHOW_POPUP' ,
      mode: 'showMessage',
      payload: {
        text: 'Camera position set!', 
      }
    }) 
    
  } catch (error) {
    // console.log(error);
  }
}

const createPanorama = (baseImage) => {
  const panorama = new PANOLENS.ImagePanorama(window.cdn + baseImage);

  const onEnter = () => {
    store.dispatch({ type: 'ENTER_SCENE', isEntered: true });
  }

  const progressElement = document.getElementById('loading-progress');

  const onProgress = (event) => {
    const progress = event.progress.loaded / event.progress.total * 100;
    progressElement.style.width = progress + '%';
    if (progress == 100) {
      progressElement.classList.add('is-finished');
    }
    else {
      progressElement.classList.remove('is-finished');
    }
  }

  panorama.addEventListener('progress', onProgress);
  panorama.addEventListener('enter-fade-start', onEnter);

  return panorama;
}
