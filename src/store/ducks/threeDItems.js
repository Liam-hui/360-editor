import { createReducer, createActions } from 'reduxsauce'
import { uniqueId, limitPosition } from '@/utils/MyUtils'

const { Types, Creators } = createActions({
  initThreeDItems : ['data'],
  addThreeDItem : ['data'],
  updateThreeDItem : ['id', 'data'],
  removeThreeDItem : ['id', 'ids'],
  removeScene: ['id'],
  // addThreeDImageSlides: ['id', 'images']
});

export const ThreeDItemsTypes = Types;
export default Creators;

export const INITIAL_STATE = {
  data: {},
}

const initThreeDItems = (state, { data } ) => {
  return {
    ...state,
    data: data,
  }
}

const addThreeDItem = (state, { data } ) => {
  const id = uniqueId()
  data.position = limitPosition(data.position.toArray())
  if (data.type == 'image') {
    data.scale = 100 / Math.max(data.images[0].width, data.images[0].height)
  }
  else if (data.type == 'video') {
    data.scale = 0.1
  }
  else if (data.type == 'link') {
    data.scale = 1
    data.target = null
  }

  return {
    ...state,
    data: {
      ...state.data,
      [id]: data
    },
  }
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
  }
}

const removeThreeDItem = (state, { id, ids } ) => {
  const data_ = { ...state.data }

  if (id)
    delete data_[id]

  if (ids)
    for (const id of ids) {
      delete data_[id]
    }

  return {
    ...state,
    data: data_
  }
}

const removeScene = ( state, { id } ) => {
  const data_ = { ...state.data }
  for (const id_ in data_) {
    if (data_[id_].scene == id)
      delete data_[id_]
  }

  return {
    ...state,
    data: data_,
  }
}

// const updateThreeDItem = (state, { id, data } ) => {

//   return {
//     ...state,
//     data: {
//       ...state.data,
//       [id]: {
//         ...state.data[id],
//         ...data,
//       }
//     },
//   };
// }

// const highlightThreeDItem = (state, { id } ) => {

//   return {
//     ...state,
//     highlightedId: id,
//   };

// }

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
  [Types.UPDATE_THREE_D_ITEM]: updateThreeDItem,
  [Types.REMOVE_THREE_D_ITEM]: removeThreeDItem,
  [Types.REMOVE_SCENE]: removeScene,
  // [Types.HIGHLIGHT_THREE_D_ITEM]: highlightThreeDItem,
  // [Types.UPDATE_THREE_D_IMAGE]: updateThreeDImage,
  // [Types.ADD_THREE_D_IMAGE_SLIDES]: addThreeDImageSlides,
});



