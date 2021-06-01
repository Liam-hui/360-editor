import { createReducer, createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  initTwoDItemsRequest : ['data', 'scenes'],
  initTwoDItems : ['items'],

  addTwoDItemRequest: ['payload'],
  addTwoDItem: ['id', 'item'],

  updateTwoDItem: ['id', 'data'],

  removeTwoDItemRequest: ['id', 'sceneId'],
  removeTwoDItem: ['ids'],
});

export const TwoDItemsTypes = Types;
export default Creators;

export const INITIAL_STATE = {
  data: {},
  isInited: false,
};

const initTwoDItems = (state, { items } ) => {
  
  return {
    ...state,
    data: items,
    isInited: true,
  };
}

const addTwoDItem = (state, { id, item } ) => {

  return {
    ...state,
    data: {
      ...state.data,
      [id]: item
    },
  };
}

const updateTwoDItem = (state, { id, data } ) => {

  return {
    ...state,
    data: {
      ...state.data,
      [id]: {
        ...state.data[id],
        ...data
      }
    },
  };
}

const removeTwoDItem = (state, { ids } ) => {

  const data_ = { ...state.data }
  for (const id of ids) {
    delete data_[id];
  }
  
  return {
    ...state,
    data: data_
  };
}

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT_TWO_D_ITEMS]: initTwoDItems,
  [Types.ADD_TWO_D_ITEM]: addTwoDItem,
  [Types.UPDATE_TWO_D_ITEM]: updateTwoDItem,
  [Types.REMOVE_TWO_D_ITEM]: removeTwoDItem,
});



