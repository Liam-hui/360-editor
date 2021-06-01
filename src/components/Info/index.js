import React, { useState, useEffect, useRef } from 'react';
import store from '@/store';

import './style.css';

const Info = ({ id, data }) => {

  const { text } = data;

  const innerRef = useRef();
  const [innerHeight, setInnerHeight] = useState(40);

  useEffect(() => {
    setInnerHeight(innerRef.current.clientHeight)
  }, [innerRef.current?.clientHeight]);

  const deleteItem = () => {
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'showWarning',
      payload: {
        text: 'Are you sure you want to delete this item？',
        confirm: () => store.dispatch({ type: 'REMOVE_TWO_D_ITEM_REQUEST', id: id })
      }
    }) 
  }

  return (
    <div className="info-wrapper">
      <div className="info-container" style={{"--inner-height": `${innerHeight}px`}}>
        <div className="info-icon center-flex">
          <i class='fas fa-info' style={{fontSize: 22, color: '#5793fb'}}></i>
        </div>
        <div className="info-inner" ref={innerRef}>
     
          <div className="info-text">{text == '' ? 'Press the edit button to add text' : text}</div>
 
          <div class="info-button-wrapper">
            <i 
              onClick={ () => 
                store.dispatch({
                  type: 'SHOW_POPUP',
                  mode: 'editInfo',
                  payload: {
                    id: id,
                    text: text,
                  }
                }) 
              }
              class="info-button material-icons"
            >
              edit
            </i>
            <i onClick={deleteItem} class="info-button material-icons">delete</i>
          </div>
    
        </div>
      </div>
    </div>
  )

}

export default Info;

