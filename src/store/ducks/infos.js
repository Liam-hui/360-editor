import { createReducer, createActions } from 'reduxsauce';
import { panorama } from '@/components/Panorama'

const THREE = window.THREE;

const { Types, Creators } = createActions({
  initInfos : ['data'],
  addInfo: ['position'],
  updateInfoText: ['id', 'text'],
  removeInfo: ['id'],
});

export const InfosTypes = Types;
export default Creators;

export const INITIAL_STATE = {
  data: [],
  nextId: 0,
};

const initInfos = (state, { data } ) => {

  let newData = {};
  let nextId = 0;

  for (const info of data) {
    const position = new THREE.Vector3(info.position.x, info.position.y, info.position.z)
    const newInfo = createInfo(position, info.text);
    newData[nextId] = newInfo;
    nextId ++;
  }

  return {
    ...state,
    data: newData,
    nextId: nextId
  };
}

const addInfo = (state, { position } ) => {

  const newInfo = createInfo(position);

  return {
    ...state,
    data: {
      ...state.data,
      [state.nextId]: newInfo
    },
    nextId: state.nextId + 1
  };
}

const updateInfoText = (state, { id, text } ) => {
  return {
    ...state,
    data: {
      ...state.data,
      [id]: {
        ...state.data[id],
        text: text
      }
    },
  };
}

const removeInfo = (state, { id } ) => {

  const data_ = {...state.data}
  delete data_[id];
  return {
    ...state,
    data: data_
  };
}

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT_INFOS]: initInfos,
  [Types.ADD_INFO]: addInfo,
  [Types.UPDATE_INFO_TEXT]: updateInfoText,
  [Types.REMOVE_INFO]: removeInfo,
});

const createInfo = (position, text) => {

  const material = new THREE.MeshStandardMaterial();
  const object = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  object.position.copy( position );

  panorama.add(object);

  const newInfo = {  
    text: text?? '',
    object: object,
  }

  return newInfo;
 
}