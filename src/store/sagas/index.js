import {
  all,
  takeLatest,
} from 'redux-saga/effects';

import { ScenesTypes } from '../ducks/scenes';
import { initScenesRequest, addSceneRequest, removeSceneRequest, changeSceneRequest, showSceneItems, setFirstScene } from './scenes';

import { ThreeDItemsTypes } from '../ducks/threeDItems';
import { initThreeDItemsRequest, addThreeDItemRequest, removeThreeDItemRequest, updateThreeDItemRequest, highlightThreeDItemRequest } from './threeDItems';

import { TwoDItemsTypes } from '../ducks/twoDItems';
import { initTwoDItemsRequest, addTwoDItemRequest, removeTwoDItemRequest } from './twoDItems';

import { LinksTypes } from '../ducks/links';
import { addLinkRequest } from './links';

export default function* rootSaga() {
  yield all([

    takeLatest(ScenesTypes.INIT_SCENES_REQUEST, initScenesRequest),
    takeLatest(ScenesTypes.ADD_SCENE_REQUEST, addSceneRequest),
    takeLatest(ScenesTypes.REMOVE_SCENE_REQUEST, removeSceneRequest),
    takeLatest(ScenesTypes.CHANGE_SCENE_REQUEST, changeSceneRequest),
    takeLatest(ScenesTypes.SHOW_SCENE_ITEMS, showSceneItems),
    takeLatest(ScenesTypes.SET_FIRST_SCENE, setFirstScene),

    takeLatest(ThreeDItemsTypes.INIT_THREE_D_ITEMS_REQUEST, initThreeDItemsRequest),
    takeLatest(ThreeDItemsTypes.ADD_THREE_D_ITEM_REQUEST, addThreeDItemRequest),
    takeLatest(ThreeDItemsTypes.REMOVE_THREE_D_ITEM_REQUEST, removeThreeDItemRequest),
    takeLatest(ThreeDItemsTypes.UPDATE_THREE_D_ITEM_REQUEST, updateThreeDItemRequest),
    takeLatest(ThreeDItemsTypes.HIGHLIGHT_THREE_D_ITEM_REQUEST, highlightThreeDItemRequest),

    takeLatest(TwoDItemsTypes.INIT_TWO_D_ITEMS_REQUEST, initTwoDItemsRequest),
    takeLatest(TwoDItemsTypes.ADD_TWO_D_ITEM_REQUEST, addTwoDItemRequest),
    takeLatest(TwoDItemsTypes.REMOVE_TWO_D_ITEM_REQUEST, removeTwoDItemRequest),

    takeLatest(LinksTypes.ADD_LINK_REQUEST, addLinkRequest),

  ]);
}
