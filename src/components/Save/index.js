import React, { useState, useEffect } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import './style.css';
import { getElementStyle } from '@/components/Panorama'


const Save = () => {

  const [isEditorShown, setIsEditorShown] = useState(false);

  const threeDImages = useSelector(state => state.threeDImages.data);
  const images = useSelector(state => state.images.data);
  const infos = useSelector(state => state.infos.data);

  const handleSave = () => {
    let data = {};

    data.threeDImages = Object.values(threeDImages).map(x => { 
      return {
        url: x.url,
        width: x.width,
        height: x.height,
        position: x.object.position,
        rotation: {
          x: x.object.rotation.x,
          y: x.object.rotation.y,
          z: x.object.rotation.z
        },
        scale: x.object.scale.x,
      };
    })

    data.infos = Object.values(infos).map(x => { 
      return {
        position: x.object.position,
        text: x.text,
      };
    })

    saveToLocalText(data);
  }

  return (

    <div className="saveWrapper">

      <i className='saveButton fas fa-save' onClick={handleSave}></i>

    </div>
  )

}

const saveToLocalText = (data) => {

  const a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( JSON.stringify(data, null, 2) ));
  a.setAttribute('download', 'data.json');
  a.click()

}

export default Save;

