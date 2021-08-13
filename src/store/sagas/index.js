import {
  all,
  takeLatest,
} from 'redux-saga/effects';

// import { ScenesTypes } from '../ducks/scenes';
// import { initScenesRequest } from './scenes';


export default function* rootSaga() {
  yield all([
    // takeLatest(ScenesTypes.INIT_SCENES_REQUEST, initScenesRequest),
  ])
}
