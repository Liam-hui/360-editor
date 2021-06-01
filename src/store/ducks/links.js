import { createReducer, createActions } from 'reduxsauce';

const { Types, Creators } = createActions({
  initLinksRequest : ['data'],
  initLinks : ['links'],

  addLinkRequest: ['position'],
  addLink: ['link'],

  // updateLinkText: ['id', 'text'],
  removeLink: ['id'],
});

export const LinksTypes = Types;
export default Creators;

export const INITIAL_STATE = {
  data: [],
  nextId: 0,
  isInited: false,
};

const initLinks = (state, { links } ) => {

  return {
    ...state,
    data: links,
    nextId: Object.keys( links ).length,
    isInited: true,
  };
}

const addLink = (state, { link } ) => {

  return {
    ...state,
    data: {
      ...state.data,
      [state.nextId]: link
    },
    nextId: state.nextId + 1
  };
}

const updateLinkText = (state, { id, text } ) => {

  return {
    ...state,
    data: {
      ...state.data,
      [ id ]: {
        ...state.data[ id ],
        text: text
      }
    },
  };
}

const removeLink = (state, { id } ) => {

  const data_ = { ...state.data }
  delete data_[ id ];
  
  return {
    ...state,
    data: data_
  };
}

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT_LINKS]: initLinks,
  [Types.ADD_LINK]: addLink,
  // [Types.UPDATE_L_TEXT]: updateLinkText,
  [Types.REMOVE_LINK]: removeLink,
});

