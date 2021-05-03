import { combineReducers } from 'redux';
import { reducer as threeDImages } from './threeDImages';
import { reducer as images } from './images';
import { reducer as infos } from './infos';

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

const menuReducer = ( state = { isShown: false, object: null }, action ) => {
  switch( action.type ) {
    case 'SHOW_MENU':
      return {
        object: action.object,
        isShown: true,
      };
    case 'HIDE_MENU':
      return {
        object: null,
        isShown: false,
      }
    default: return state;
  }
}

const popupReducer = ( state = { isShown: false, data: null}, action ) => {
  switch( action.type ) {
    case 'SHOW_POPUP':
      return {
        isShown: true,
        data: action.data,
      };
    case 'HIDE_POPUP':
      return {
        ...state,
        isShown: false,
      };
    default: return state;
  }
}

export default () =>
  combineReducers({
    updateScene: updateSceneReducer,
    updateMouse: updateMouseReducer,
    menu: menuReducer,
    popup: popupReducer,
    threeDImages,
    images,
    infos
  });
