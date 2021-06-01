import { createReducer, createActions } from 'reduxsauce';

const THREE = window.THREE;

const { Types, Creators } = createActions({
  addImage: ['image', 'position'],
  updateImage: ['id', 'image'],
  removeImage: ['id'],
});

export const ImagesTypes = Types;
export default Creators;

export const INITIAL_STATE = {
  data: [],
  nextId: 0,
};

const addImage = (state, { image, position } ) => {

  const newImage = createImage(image, position);

  return {
    ...state,
    data: {
      ...state.data,
      [state.nextId]: newImage
    },
    nextId: state.nextId + 1
  };
}

const updateImage = (state, { id, image } ) => {
  return {
    ...state,
    data: {
      ...state.data,
      [id]: image
    },
  };
}

const removeImage = (state, { id } ) => {

  // panorama.remove(state.data[id].object);

  const data_ = {...state.data}
  delete data_[id];
  return {
    ...state,
    data: data_
  };
}

export const reducer = createReducer(INITIAL_STATE, {
  [Types.ADD_IMAGE]: addImage,
  [Types.UPDATE_IMAGE]: updateImage,
  [Types.REMOVE_IMAGE]: removeImage,
});

const createImage = (image, position) => {

  const material = new THREE.MeshStandardMaterial();
  const object = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  object.position.copy( position );

  // panorama.add(object);

  const newImage = {  
    width: image.width,
    height: image.height,
    base64: image.base64,
    object: object,
  }

  return newImage;
 
}