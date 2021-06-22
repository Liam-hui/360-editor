import { combineReducers } from 'redux';
import { reducer as scenes } from './scenes';
import { reducer as threeDItems} from './threeDItems';
import { reducer as twoDItems} from './twoDItems';
import { reducer as links } from './links';

const configReducer = ( state = {}, action ) => {
  switch( action.type ) {
    case 'SET_CONFIG':
      return {
        ... action.payload
      };
    default: return state;
  }
}

const updateSceneReducer = ( state = 0, action ) => {
  switch( action.type ) {
    case 'UPDATE_SCENE':
      return ( state + 1 ) % 1000 ;
    default: return state;
  }
}

const updateMouseReducer = ( state = 0, action ) => {
  switch( action.type ) {
    case 'UPDATE_MOUSE':
      return ( state + 1 ) % 1000 ;
    default: return state;
  }
}

const popupReducer = ( state = { isShown: false, mode: null, payload: null }, action ) => {
  switch( action.type ) {
    case 'SHOW_POPUP':
      return {
        isShown: true,
        mode: action.mode,
        payload: action.payload,
      };
    case 'HIDE_POPUP':
      return {
        ...state,
        isShown: false,
      };
    default: return state;
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

const setTargetModeReducer = ( state = { isOn: false }, action ) => {
  switch( action.type ) {
    case 'SET_TARGET_START':
      return {
        isOn: true,
        ... action.payload
      }
    case 'SET_TARGET_FINISH':
      return {
        isOn: false
      }
    default: return state;
  }
}

export default () =>
  combineReducers({
    config: configReducer,
    updateScene: updateSceneReducer,
    updateMouse: updateMouseReducer,
    popup: popupReducer,
    loader: loaderReducer,
    setTargetMode: setTargetModeReducer,
    scenes,
    threeDItems,
    twoDItems,
    links
  });
