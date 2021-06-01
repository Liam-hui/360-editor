import React, { useState, useEffect } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import './style.css';
import { getElementStyle } from '@/components/Panorama'

const Link = (props) => {

  const { id, data } = props;
  const { object, targetId } = data;

  // update position
  const updateScene = useSelector( state => state.updateScene );
  const [ style, setStyle ] = useState( {} );
  useEffect( () => {
    if ( object != null ) {
      const newStyle = getElementStyle( object );
      if ( newStyle != null ) 
        setStyle( newStyle );
    }
  }, [ updateScene ] );

  const onClick = () => {
    store.dispatch( { type: 'CHANGE_SCENE_REQUEST', id: targetId } )
  }

  return (
    <div className="LinkWrapper" style={ style } onClick={ onClick }>
      
    </div>
  )

}

export default Link;

