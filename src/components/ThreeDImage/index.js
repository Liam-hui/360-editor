import React, { useState, useEffect } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import './style.css';
import { getElementStyle } from '@/components/Panorama'

const THREE = window.THREE;

const TRANSLATION_MAX = 800;
const ROTATION_MAX = 180;

const Slider = (props) => {

  const [value, setValue] = useState(0)

  const { update, onMouseDown } = props;

  const onChange = (e) => {
    setValue(e.target.value);
    update(e.target.value);
  }

  const onMouseUp = (e) => {
    setValue(0);
  }


  return(
    <input className="slider" type="range" min="-100" max="100" value={value} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onChange={onChange}></input>
  )
}

const ThreeDImage = (props) => {

  const { id, data } = props;
  const { object } = data;
  const isHighlighted = useSelector(state => state.threeDImages.highlightedId == id);

  // update position
  const updateScene = useSelector(state => state.updateScene);
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (object != null ) {
      const newStyle = getElementStyle(object);
      if (newStyle != null) setStyle(newStyle);
    }
  }, [updateScene]);

  const [isEditorShown, setIsEditorShown] = useState(false);

  const [tempValue, setTempValue] = useState(null);
  const setTemp = (mode) => {
    let v;

    if (mode == 'translate') {
      v = new THREE.Vector3();
      v.copy(object.position)
    }
    else if (mode == 'rotate') {
      v = new THREE.Vector3();
      v.copy(object.rotation)
    }
    else if (mode == 'scale')
      v = object.scale.x;
      
    setTempValue(v);
  }

  const updateTranslate = (value, axis) => {
    object.position.x = tempValue.x;
    object.position.y = tempValue.y;
    object.position.z = tempValue.z;

    const amount =  value / 100 * TRANSLATION_MAX;

    if (axis == 'x')
      object.translateX(amount);
    else if (axis == 'y')
      object.translateY(amount);
    else if (axis == 'z')
      object.translateZ(amount);
  }

  const updateRotate = (value, axis) => {

    object.rotation.x = tempValue.x;
    object.rotation.y = tempValue.y;
    object.rotation.z = tempValue.z;

    const amount =  value / 100 * ROTATION_MAX  * Math.PI/180;

    if (axis == 'x')
      object.rotateX( amount );
    else if (axis == 'y')
      object.rotateY( amount );
    else if (axis == 'z')
      object.rotateZ( - amount );  
  }

  const updateScale = (value) => {

    const scale = Math.max(0.1, tempValue + value / 100);

    object.scale.set(
      scale,
      scale,
      1,
    )
  }

  return (

    <div className="threeDImageEditorWrapper centerFlex" style={style}>

    {isEditorShown &&
      <div className="threeDImageEditorContainer">

        <div className="threeDImageEditorLabel">Translate:</div>
        <Slider 
          onMouseDown={() => setTemp('translate')}
          update={(value) => updateTranslate(value, 'x')} 
        />
        <Slider 
          onMouseDown={() => setTemp('translate')}
          update={(value) => updateTranslate(value, 'y')} 
        />
        <Slider 
          onMouseDown={() => setTemp('translate')}
          update={(value) => updateTranslate(value, 'z')} 
        />

        <div className="threeDImageEditorLabel">Rotate:</div>
        <Slider 
          onMouseDown={() => setTemp('rotate')}
          update={(value) => updateRotate(value, 'x')} 
        />
        <Slider 
          onMouseDown={() => setTemp('rotate')}
          update={(value) => updateRotate(value, 'y')} 
        />
        <Slider 
          onMouseDown={() => setTemp('rotate')}
          update={(value) => updateRotate(value, 'z')} 
        />

        <div className="threeDImageEditorLabel">Scale:</div>
        <Slider 
          onMouseDown={() => setTemp('scale')}
          update={(value) => updateScale(value)} 
        />

        <div 
          className="coloredButton changeThreeDImageButton centerFlex"
          onClick={ () => 
            store.dispatch({
              type: 'SHOW_POPUP' ,
              data: {
                mode: 'update3dImage',
                id: id,
              }
            }) 
          } 
        >
          CHANGE IMAGE
        </div>

        <i onClick={ () => setIsEditorShown(false) } class="closethreeDImageEditorButton material-icons">close</i>

      </div> 
    }

    {isHighlighted && !isEditorShown&&
      <div class="threeDImageEditorButtonWrapper">
        <i onClick={ () => setIsEditorShown(true) } class="threeDImageEditorButton material-icons">edit</i>
        <i onClick={ () => store.dispatch({type: 'REMOVE_THREE_D_IMAGE', id: id}) } class="threeDImageEditorButton material-icons">delete</i>
      </div>
    }

    </div>
  )

}

export default ThreeDImage;

