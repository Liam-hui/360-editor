import { createReducer, createActions } from 'reduxsauce';

/* Types & Action Creators */

const { Types, Creators } = createActions({
  initScenesRequest: [ 'data', 'firstSceneId' ],
  initScenes: [ 'data' ],

  addSceneRequest: ['image'],
  addScene: ['id', 'scene'],

  removeSceneRequest: ['id'],
  removeScene: ['id'],

  changeSceneRequest: ['id', 'angle', 'isChangeScene'],
  changeScene: ['id', 'angle', 'isChangeScene'],
  changeSceneFinish: [],

  setFirstScene: ['id', 'angle'],

  enterScene: ['isEntered'],

  showSceneItems: ['id'],

  setAngleFinish: []
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

const changeScene = ( state, { id, angle, isChangeScene } ) => {
  return {
    ...state,
    previousId: state.currentId,
    currentId: id,
    angle: angle,
    isChangeScene: Boolean(isChangeScene)
  };
}

const changeSceneFinish = (state) => {
  return {
    ...state,
    isChangeScene: false
  };
}

const setFirstScene = ( state, { id, angle } ) => {
  return {
    ...state,
    firstSceneId: id,
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

const setAngleFinish = ( state ) => {
  return {
    ...state,
    angle: null
  };
}


/* Reducers to types */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT_SCENES]: initScenes,
  [Types.ADD_SCENE]: addScene,
  [Types.REMOVE_SCENE]: removeScene,
  [Types.CHANGE_SCENE]: changeScene,
  [Types.CHANGE_SCENE_FINISH]: changeSceneFinish,
  [Types.SET_FIRST_SCENE]: setFirstScene,
  [Types.ENTER_SCENE]: enterScene,
  [Types.SET_ANGLE_FINISH]: setAngleFinish,
});
