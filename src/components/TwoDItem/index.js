import React, { useState, useEffect, useRef } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import Info from '@/components/Info'

import './style.css';
import { getElementStyle } from '@/components/Panorama'

const TwoDItem = (props) => {

  const { id, data } = props;
  const { object } = data;

  // update position
  const updateScene = useSelector(state => state.updateScene);
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (object != null ) {
      const newStyle = getElementStyle(object);
      if (newStyle != null) setStyle(newStyle);
    }
  }, [updateScene]);

  return (
    <div style={{...style, position: 'absolute'}}>
      <Info id={id} data={data}/>
    </div>
  )

}

export default TwoDItem;

