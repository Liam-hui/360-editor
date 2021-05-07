import { createReducer, createActions } from 'reduxsauce';
import { panorama, roomSize } from '@/components/Panorama'

const THREE = window.THREE;
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = '*';

const { Types, Creators } = createActions({
  initThreeDImages : ['data'],
  addThreeDImage: ['image', 'position'],
  updateThreeDImage: ['id', 'image'],
  removeThreeDImageRequest: ['id'],
  removeThreeDImage: ['id'],
  highlightThreeDImage: ['id'],
  unhighlightThreeDImage: [],
  addThreeDImageSlides: ['id', 'images']
});

export const ThreeDImagesTypes = Types;
export default Creators;

export const INITIAL_STATE = {
  data: {},
  nextId: 0,
  highlightedId: null,
  editorShownId: null,
};

const initThreeDImages = (state, { data } ) => {

  let newData = {};
  let nextId = 0;

  for (const image of data) {
    const position = new THREE.Vector3(image.position.x, image.position.y, image.position.z)
    const rotation = new THREE.Vector3(image.rotation.x, image.rotation.y, image.rotation.z)
    const newImage = createThreeDImage(image, position, rotation, image.scale);
    newData[nextId] = {
      ...newImage,
      slides: image.slides
    };
    nextId ++;
  }

  return {
    ...state,
    data: newData,
    nextId: nextId
  };
}

const addThreeDImage = (state, { image, position } ) => {

  const newImage = createThreeDImage(image, position);

  return {
    ...state,
    data: {
      ...state.data,
      [state.nextId]: newImage
    },
    nextId: state.nextId + 1
  };
}

const updateThreeDImage = (state, { id, image } ) => {

  image.url = 'https://hatrabbits.com/wp-content/uploads/2018/10/risky-assumptions.jpg';

  state.data[id].object.material = material(image.url, 0);
  state.data[id].object.geometry.dispose();
  state.data[id].object.geometry = 
    new THREE.BoxGeometry(
      image.width,
      image.height,
      1,
    );

  return {
    ...state,
    data: {
      ...state.data,
      [id]: {
        ...state.data[id],
        width: image.width,
        height: image.height,
        url: image.url,
      }
    },
  };
}

const removeThreeDImage = (state, { id } ) => {

  const data_ = {...state.data}
  delete data_[id];

  return {
    ...state,
    data: data_
  };
}

const highlightThreeDImage = (state, { id } ) => {

  if (id != state.highlightedId)
    state.data[id].object.material = material(state.data[id].url, 0.4);

  return {
    ...state,
    highlightedId: id,
  };
}

const unhighlightThreeDImage = (state) => {

  if (state.highlightedId != null && state.data[state.highlightedId])
    state.data[state.highlightedId].object.material = material(state.data[state.highlightedId].url, 0);

  return {
    ...state,
    highlightedId: null,
  };
}

const addThreeDImageSlides = (state, {id, images} ) => {

  return {
    ...state,
    data: {
      ...state.data,
      [id]: {
        ...state.data[id],
        slides: state.data[id].slides.concat(images),
      }
    },
  };
}

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT_THREE_D_IMAGES]: initThreeDImages,
  [Types.ADD_THREE_D_IMAGE]: addThreeDImage,
  [Types.UPDATE_THREE_D_IMAGE]: updateThreeDImage,
  [Types.REMOVE_THREE_D_IMAGE]: removeThreeDImage,
  [Types.HIGHLIGHT_THREE_D_IMAGE]: highlightThreeDImage,
  [Types.UNHIGHLIGHT_THREE_D_IMAGE]: unhighlightThreeDImage,
  [Types.ADD_THREE_D_IMAGE_SLIDES]: addThreeDImageSlides,
});

const createThreeDImage = (image, position, rotation, scale) => {

  position.clamp(
    new THREE.Vector3(-4400, -4400, -4400),
    new THREE.Vector3(4400, 4400, 4400)
  ); 
   
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(
      image.width,
      image.height,
      1,
    ), 
    material(image.url, 0)
  );

  object.position.copy( position );

  if (rotation) {
    object.rotation.x = rotation.x;
    object.rotation.y = rotation.y;
    object.rotation.z = rotation.z;
  }
  else {
    if (position.y > roomSize) {
      object.rotateX( Math.PI * 0.5 )
    }
    else if (position.y < -roomSize) {
      object.rotateX( - Math.PI * 0.5 )
    }
    else if (position.x < -roomSize) {
      object.rotateY( Math.PI * 0.5 )
    }
    else if (position.x > roomSize) {
      object.rotateY( - Math.PI * 0.5 )
    }
    else if (position.z > roomSize) {
      object.rotateY( Math.PI )
    }
    // else if (position.z < -roomSize) {
    //   space = 'front';
    // }
  }

  if (scale) 
    object.scale.set(
      scale,
      scale,
      1,
    )

  panorama.add(object);

  const newImage = {  
    url: image.url,
    width: image.width,
    height: image.height,
    object: object,
    slides: [],
  }

  return newImage;
 
}


const material = ( imageUrl, lightenAmount ) => new THREE.ShaderMaterial({

  uniforms: {  
    texture: { type: "t", value: textureLoader.load(imageUrl) },
    lightenAmount: { type: "f", value: lightenAmount },
  },
  vertexShader: `
    varying vec2 vUv;

    void main()
    {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `    
    uniform sampler2D texture;
    uniform float lightenAmount;
    
    varying vec2 vUv;
    
    void main(void)
    {
      vec3 c;
      vec3 white = vec3(1.0, 1.0, 1.0);
      vec4 ca = texture2D(texture, vUv);
      c = ca.rgb * ( 1.0 - lightenAmount ) + white * lightenAmount; 
      gl_FragColor= vec4(c, 1.0);
    }
  `

});

