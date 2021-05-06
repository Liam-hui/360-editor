import {
  all,
  takeLatest,
} from 'redux-saga/effects';

import { ThreeDImagesTypes } from '../ducks/threeDImages';
import { removeThreeDImageRequest } from './threeDImages';

export default function* rootSaga() {
  yield all([
    takeLatest(ThreeDImagesTypes.REMOVE_THREE_D_IMAGE_REQUEST, removeThreeDImageRequest),
  ]);
}
