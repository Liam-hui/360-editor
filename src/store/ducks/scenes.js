import { createReducer, createActions } from 'reduxsauce'
import { uniqueId } from '@/utils/MyUtils'

/* Types & Action Creators */

const { Types, Creators } = createActions({
  initScenes: ['data'],
  addScene: ['baseImage'],
  removeScene: ['id'],
  setFirstScene: ['cameraPosition'],
  updateScene: ['id', 'data'],
  changeSceneRequest: ['id'],
  changeSceneStart: [],
  changeSceneFinish: [],
  changeSceneWithoutTransition: ['id'],
  changeSceneWithoutTransitionFinish: []
})

export const ScenesTypes = Types
export default Creators

/* Initial State */

export const INITIAL_STATE = {
  data: {},
  layer0Id: null,
  layer1Id: null,
  currentLayer: 0,
  isTransitioning: false,
  transitionCenter: null,
  cameraPosition: null
}

/* Reducers */

const initScenes = ( state, { data } ) => {
  
  let firstSceneId = null
  let cameraPosition = null
  for (const [id, scene] of Object.entries(data)) {
    if (scene.isFirst) {
      firstSceneId = id
      cameraPosition = scene.cameraPosition
      delete scene.isFirst
      delete scene.cameraPosition
      break
    }
    if (firstSceneId == null)
      firstSceneId = id
  }

  return {
    ...state,
    data: data,
    firstScene: { id: firstSceneId, cameraPosition: cameraPosition },
    layer0Id: firstSceneId,
    currentLayer: 0,
    cameraPosition: cameraPosition
  }
}

const addScene = ( state, { name, baseImage } ) => {
  const id = uniqueId()

  return {
    ...state,
    data: {
      ...state.data,
      [id]: { name, baseImage }
    },
  }
}

const removeScene = ( state, { id } ) => {
  const data_ = { ...state.data }
  delete data_[id]

  const nextSceneId = Object.keys(data_).length > 0 ? Object.keys(data_)[0] : null

  return {
    ...state,
    data: data_,
    ...state.currentLayer == 0 && { layer0Id: nextSceneId },
    ...state.currentLayer == 1 && { layer1Id: nextSceneId },
  }
}

const setFirstScene = ( state, { cameraPosition } ) => {
  const id = state.currentLayer == 0 ? state.layer0Id : state.layer1Id
  return {
    ...state,
    firstScene: { id: id, cameraPosition: cameraPosition },
  }
}

const updateScene = ( state, { data } ) => {
  const id = state.currentLayer == 0 ? state.layer0Id : state.layer1Id;
  return {
    ...state,
    data: {
      ...state.data,
      [id]: {
        ...state.data[id],
        ...data,
      }
    },
  }
}

const changeSceneRequest = ( state, { id, cameraPosition, transitionCenter } ) => {

  const currentId = state.currentLayer == 0 ? state.layer0Id : state.layer1Id
  document.getElementById("root").classList.add('is-transitioning')

  return {
    ...state,
    ...currentId != id && {
      layer0Id: state.currentLayer == 0 ? state.layer0Id : id,
      layer1Id: state.currentLayer == 1 ? state.layer1Id : id,
      cameraPosition: cameraPosition ?? null,
      transitionCenter: transitionCenter ?? null,
      isTransitionRequested: true,
    }
  }
}

const changeSceneStart = ( state ) => {
  return {
    ...state,
    isTransitioning: true,
    isTransitionRequested: false,
  }
}

const changeSceneFinish = ( state ) => {
  document.getElementById("root").classList.remove('is-transitioning')

  return {
    ...state,
    layer0Id: state.currentLayer == 0 ? null : state.layer0Id,
    layer1Id: state.currentLayer == 1 ? null : state.layer1Id,
    currentLayer: state.currentLayer == 0 ? 1 : 0,
    isTransitioning: false,
    transitionCenter: null
  }
}

const changeSceneWithoutTransition = ( state, { id, cameraPosition } ) => {
  console.log(id, 'asdfasdf', cameraPosition)
  return {
    ...state,
    layer0Id: state.currentLayer == 0 ? id : null,
    layer1Id: state.currentLayer == 1 ? id : null,
    isTransitioning: false,
    transitionCenter: null,
    newCameraPosition: cameraPosition
  }
}

const changeSceneWithoutTransitionFinish = ( state ) => {
  return {
    ...state,
    newCameraPosition: null
  }
}

/* Reducers to types */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT_SCENES]: initScenes,
  [Types.ADD_SCENE]: addScene,
  [Types.REMOVE_SCENE]: removeScene,
  [Types.SET_FIRST_SCENE]: setFirstScene,
  [Types.UPDATE_SCENE]: updateScene,
  [Types.CHANGE_SCENE_REQUEST]: changeSceneRequest,
  [Types.CHANGE_SCENE_START]: changeSceneStart,
  [Types.CHANGE_SCENE_FINISH]: changeSceneFinish,
  [Types.CHANGE_SCENE_WITHOUT_TRANSITION]: changeSceneWithoutTransition,
  [Types.CHANGE_SCENE_WITHOUT_TRANSITION_FINISH]: changeSceneWithoutTransitionFinish
})