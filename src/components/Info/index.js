import React, { useState, useEffect, useRef } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import './style.css';
import { getElementStyle } from '@/components/Panorama'

const Info = (props) => {

  const { id, data } = props;
  const { object, text } = data;

  // update position
  const updateScene = useSelector(state => state.updateScene);
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (object != null ) {
      const newStyle = getElementStyle(object);
      if (newStyle != null) setStyle(newStyle);
    }
  }, [updateScene]);


  const innerRef = useRef();
  const [innerHeight, setInnerHeight] = useState(40);

  useEffect(() => {
    setInnerHeight(innerRef.current.clientHeight)
  }, [innerRef.current?.clientHeight]);

  return (
    <div className="infoWrapper" style={style}>
      <div className="infoContainer" style={{"--inner-height": `${innerHeight}px`}}>
        <div className="infoIcon centerFlex">
          <i class='fas fa-info' style={{fontSize: 22, color: '#5793fb'}}></i>
        </div>
        <div className="infoInner" ref={innerRef}>
     
          <div className="infoText">{text == '' ? 'Press the edit button to add text' : text}</div>
 
          <div class="infoButtonWrapper">
            <i 
              onClick={ () => 
                store.dispatch({
                  type: 'SHOW_POPUP',
                  mode: 'editInfo',
                  data: {
                    id: id,
                    text: text,
                  }
                }) 
              }
              class="infoButton material-icons"
            >
              edit
            </i>
            <i onClick={ () => store.dispatch({type: 'REMOVE_INFO', id: id}) } class="infoButton material-icons">delete</i>
          </div>
    
        </div>
      </div>
    </div>
  )

}

export default Info;

