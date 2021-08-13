import { createReducer, createActions } from 'reduxsauce'
import { uniqueId } from '@/utils/MyUtils'

/* Types & Action Creators */

const { Types, Creators } = createActions({
  initScenes: ['data'],
  addScene: ['baseImage'],
  removeScene: ['id'],
  setFirstScene: ['id', 'cameraPosition'],
  changeSceneRequest: ['id'],
  changeSceneStart: [],
  changeSceneFinish: [],
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

const addScene = ( state, { baseImage } ) => {
  const id = uniqueId()

  return {
    ...state,
    data: {
      ...state.data,
      [id]: { baseImage: baseImage }
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

const setFirstScene = ( state, { id, cameraPosition } ) => {
  return {
    ...state,
    firstScene: { id: id, cameraPosition: cameraPosition },
  }
}

const changeSceneRequest = ( state, { id, cameraPosition, transitionCenter } ) => {

  const currentId = state.currentLayer == 0 ? state.layer0Id : state.layer1Id

  return {
    ...state,
    ...currentId != id && {
      layer0Id: state.currentLayer == 0 ? state.layer0Id : id,
      layer1Id: state.currentLayer == 1 ? state.layer1Id : id,
      cameraPosition: cameraPosition ?? null,
      transitionCenter: transitionCenter ?? null
    }
  }
}

const changeSceneStart = ( state ) => {
  return {
    ...state,
    isTransitioning: true
  }
}

const changeSceneFinish = ( state ) => {
  return {
    ...state,
    layer0Id: state.currentLayer == 0 ? null : state.layer0Id,
    layer1Id: state.currentLayer == 1 ? null : state.layer1Id,
    currentLayer: state.currentLayer == 0 ? 1 : 0,
    isTransitioning: false,
    transitionCenter: null
  }
}

/* Reducers to types */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT_SCENES]: initScenes,
  [Types.ADD_SCENE]: addScene,
  [Types.REMOVE_SCENE]: removeScene,
  [Types.SET_FIRST_SCENE]: setFirstScene,
  [Types.CHANGE_SCENE_REQUEST]: changeSceneRequest,
  [Types.CHANGE_SCENE_START]: changeSceneStart,
  [Types.CHANGE_SCENE_FINISH]: changeSceneFinish,
})