import { createReducer, createActions } from 'reduxsauce';

/* Types & Action Creators */

const { Types, Creators } = createActions({
  initScenesRequest: [ 'data', 'firstSceneId' ],
  initScenes: [ 'data' ],

  addSceneRequest: ['image'],
  addScene: ['id', 'scene'],

  removeSceneRequest: ['id'],
  removeScene: ['id'],

  changeSceneRequest: ['id'],
  changeScene: ['id'],

  setCameraAngle: ['id'],

  enterScene:['isEntered'],

  showSceneItems:['id'],
});

export const ScenesTypes = Types;
export default Creators;

/* Initial State */

export const INITIAL_STATE = {
  data: {},
  currentId: null,
  isInited: false,
  isEntered: false,
};

/* Reducers */

const initScenes = ( state, { data, firstSceneId } ) => {

  return {
    ...state,
    data: data,
    firstSceneId: firstSceneId,
    isInited: true,
  };

}

const addScene = ( state, { id, scene } ) => {
  return {
    ...state,
    data: {
      ...state.data,
      [id]: scene
    },
    currentId: id,
  };
}

const removeScene = ( state, { id } ) => {

  const data_ = {...state.data}
  delete data_[id];

  return {
    ...state,
    data: data_
  };
}

const changeScene = ( state, { id } ) => {
  return {
    ...state,
    previousId: state.currentId,
    currentId: id,
  };
}

const setCameraAngle = ( state, { id, angle } ) => {
  return {
    ...state,
    data: {
      ...state.data,
      [id]: {
        ...state.data[id],
        angle: angle
      }
    }
  };
}

const enterScene = ( state, { isEntered } ) => {
  return {
    ...state,
    isEntered: isEntered
  };
}

/* Reducers to types */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT_SCENES]: initScenes,
  [Types.ADD_SCENE]: addScene,
  [Types.REMOVE_SCENE]: removeScene,
  [Types.CHANGE_SCENE]: changeScene,
  [Types.SET_CAMERA_ANGLE]: setCameraAngle,
  [Types.ENTER_SCENE]: enterScene,
});
