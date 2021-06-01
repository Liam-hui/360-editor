import { call, put, select } from 'redux-saga/effects';
import store from '@/store';
import { uniqueId } from '@/utils/MyUtils';
import { createObject } from '@/components/Panorama'

import TwoDItemsActions from '@/store/ducks/twoDItems';

const THREE = window.THREE;

export function* initTwoDItemsRequest({ data, scenes }) {

  let twoDItems = {};

  for (const [id, item] of Object.entries(data)) {

    const position = new THREE.Vector3(item.position.x, item.position.y, item.position.z);

    const twoDItem = {
      'info': createInfo({ 
        position, 
        text: item.text, 
        scene: item.scene, 
        panorama: scenes[item.scene].panorama 
      })
    } [item.type] || null;

    twoDItems[id] = twoDItem;

  }

  yield put(TwoDItemsActions.initTwoDItems(twoDItems));
}

export function* addTwoDItemRequest({ payload }) {
  try {

    const { type, position } = payload;

    const id = uniqueId();

    const item = {
      'info': createInfo({ position })
    } [type] || null;

    if (item != null) {
      yield put( TwoDItemsActions.addTwoDItem(id, item) );
    }

  } catch (error) {
    // console.log(error);
  }
}

export function* removeTwoDItemRequest({ id, sceneId }) {
  try {
    const state = yield select();

    let ids = [];

    if (id) {
      const twoDItem = state.twoDItems.data[id];
      const panorama = state.scenes.data[twoDItem.scene].panorama;

      panorama.remove(twoDItem.object);
      twoDItem.object.geometry.dispose();
      twoDItem.object.material.dispose();

      ids = [id];
    }

    if (sceneId) {

      for (let id in state.twoDItems.data) {
       
        if (state.twoDItems.data[id].scene == sceneId) {

          // const twoDItem = state.twoDItems.data[id];
          // twoDItem.object.geometry.dispose();
          // twoDItem.object.material.dispose();
          // no need dispose, will cause error

          ids.push(id);
        }
      }
    }

    yield put( TwoDItemsActions.removeTwoDItem(ids) );
    yield put({ type: 'UPDATE_SCENE' });

  } catch (error) {
    // console.log(error);
  }
}

const createInfo = ({ position, text, scene, panorama }) => {

  const object = createObject(position);

  if (scene == undefined)
    scene = store.getState().scenes.currentId;

  if (panorama == undefined)
    panorama = store.getState().scenes.data[scene].panorama;
  panorama.add(object);

  const info = {  
    type: 'info',
    text: text ?? '',
    object: object,
    scene: scene,
  }

  return info;
 
}