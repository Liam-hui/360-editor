import { createReducer, createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  initThreeDItemsRequest : ['data', 'scenes'],
  initThreeDItems : ['threeDItems'],

  addThreeDItemRequest: ['payload'],
  addThreeDItem: ['id', 'threeDItem'],

  updateThreeDItemRequest: ['id', 'data'],
  updateThreeDItem: ['id', 'data'],

  removeThreeDItemRequest: ['id', 'sceneId'],
  removeThreeDItem: ['ids'],

  highlightThreeDItemRequest: ['id', 'isHighlight'],
  highlightThreeDItem: ['id'],

  // addThreeDImageSlides: ['id', 'images']
});

export const ThreeDItemsTypes = Types;
export default Creators;

export const INITIAL_STATE = {
  data: {},
  highlightedId: null,
  isInited: false,
};

const initThreeDItems = (state, { threeDItems } ) => {
  
  return {
    ...state,
    data: threeDItems,
    isInited: true,
  };
}

const addThreeDItem = (state, { id, threeDItem } ) => {

  return {
    ...state,
    data: {
      ...state.data,
      [id]: threeDItem
    },
  };
}

const removeThreeDItem = (state, { ids } ) => {

  const data_ = { ...state.data }
  for (const id of ids) {
    delete data_[id];
  }

  return {
    ...state,
    data: data_
  };
}

const updateThreeDItem = (state, { id, data } ) => {

  return {
    ...state,
    data: {
      ...state.data,
      [id]: {
        ...state.data[id],
        ...data,
      }
    },
  };
}

const highlightThreeDItem = (state, { id } ) => {

  return {
    ...state,
    highlightedId: id,
  };

}

// const addThreeDImageSlides = (state, {id, images} ) => {

//   return {
//     ...state,
//     data: {
//       ...state.data,
//       [id]: {
//         ...state.data[id],
//         slides: state.data[id].slides.concat(images),
//       }
//     },
//   };
// }

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT_THREE_D_ITEMS]: initThreeDItems,
  [Types.ADD_THREE_D_ITEM]: addThreeDItem,
  [Types.REMOVE_THREE_D_ITEM]: removeThreeDItem,
  [Types.UPDATE_THREE_D_ITEM]: updateThreeDItem,
  [Types.HIGHLIGHT_THREE_D_ITEM]: highlightThreeDItem,

  // [Types.UPDATE_THREE_D_IMAGE]: updateThreeDImage,
  // [Types.ADD_THREE_D_IMAGE_SLIDES]: addThreeDImageSlides,
});



