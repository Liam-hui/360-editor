import { call, put, select } from 'redux-saga/effects';
import { panorama } from '@/components/Panorama'

import ThreeDImagesActions from '@/store/ducks/threeDImages';

export function* removeThreeDImageRequest( {id} ) {
  try {
    const state = yield select();

    panorama.remove(state.threeDImages.data[id].object);

    yield put(ThreeDImagesActions.removeThreeDImage(id));

    yield put({type: 'UPDATE_SCENE'});

  } catch (error) {
    // console.log(error);
  }
}
