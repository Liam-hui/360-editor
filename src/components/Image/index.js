import React, { useState, useEffect } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import './style.css';
import { getElementStyle } from '@/components/Panorama'

const TRANSLATION_MAX = 500;
const ROTATION_MAX = 180;

const Slider = (props) => {

  const { mode, data, axis, direction } = props;
  const { object, position, rotation } = data;

  const [value, setValue] = useState(0);

  useEffect(() => {

    if (mode == 'translate') {
      object.position[axis] = position[axis] + direction * value/100 * TRANSLATION_MAX;
    }
    else if (mode == 'rotate') {
      object.rotation[axis] = ( rotation[axis] * (180/Math.PI) + direction * value/100 * ROTATION_MAX ) * (Math.PI/180) ;
    }
    else if (mode == 'scale') {
      const scale = value <= 0 ? ( value/100 + 1 ) : value/100 * 1.5 + 1;
      object.scale.set(
        axis=='x' ? 1 : scale,
        axis=='y' ? 1 : scale,
        axis=='z' ? 1 : scale,
      )
    }

  }, [value]);
    
  const onChange = (e) => {
    setValue(e.target.value);
  }

  return(
    <input className="slider" type="range" min="-100" max="100" value={value} onChange={onChange}></input>
  )
}

const Image = (props) => {

  const { id, data } = props;
  const { object, width, height, base64 } = data;

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

  return (

    <div className="imageWrapper" style={style}>

      <img src={base64} style={{width: width * 0.2, height: height * 0.2}}/>

    </div>
  )

}

export default Image;

