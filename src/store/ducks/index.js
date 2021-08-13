import { combineReducers } from 'redux'
import { reducer as scenes } from './scenes'
import { reducer as threeDItems} from './threeDItems'
import { reducer as popup } from './popup'

const configReducer = ( state = {}, action ) => {
  switch( action.type ) {
    case 'SET_CONFIG':
      return {
        ...action.payload
      };
    default: return state
  }
}

const cameraReducer = ( state = null, { type, camera } ) => {
  switch(type) {
    case 'SET_CAMERA':
      return camera
    default: return state
  }
}

const loaderReducer = ( state = { isShown: false }, action ) => {
  switch( action.type ) {
    case 'SHOW_LOADER':
      return {
        isShown: true
      }
    case 'HIDE_LOADER':
      return {
        isShown: false
      }
    default: return state;
  }
}

const setTargetReducer = ( state = { isOn: false }, action ) => {
  switch( action.type ) {
    case 'SET_TARGET_START':
      return {
        isOn: true,
        ...action.payload
      }
    case 'SET_TARGET_FINISH':
      return {
        isOn: false
      }
    default: return state
  }
}

export default () =>
  combineReducers({
    camera: cameraReducer,
    config: configReducer,
    loader: loaderReducer,
    setTarget: setTargetReducer,
    scenes,
    threeDItems,
    popup
  })
