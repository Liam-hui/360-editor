import React, { useState, useEffect } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import GreyBox from '@/components/GreyBox';
import Upload from "@/components/Upload";
import Detail from "@/components/Detail";


const Popup = () => {

  const popup = useSelector(state => state.popup);
  const { mode, payload } = popup;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let loop;
    if (popup.isShown) 
      loop = setTimeout( () => setIsVisible(true), 20 );
    else 
      loop = setTimeout( () => setIsVisible(false), 500 );
    
    return () => {
      clearTimeout(loop);
    };
  }, [popup.isShown]);

  return (
    <>
      { (popup.isShown || isVisible) ?
        <div className={`dark-overlay ${popup.isShown && isVisible ? ' is-visible' : ''}`}>
          <div 
            className={"dark-overlay-click-area" }
            onClick={() => store.dispatch({type: 'HIDE_POPUP'})}
          />
          {
            {
              'uploadVideo': <Upload data={payload} mode='video' />,
              'uploadImage': <Upload data={payload} mode='image'/>,
              'showItem':  <Detail data={payload}/>,
              'showWarning':  <Message data={payload} mode='warning'/>,
              'showMessage':  <Message data={payload} mode='message'/>,
            } [mode] || null
          }       
        </div>
      :
        null
      }
    </>
  )

}

const Message = ({ data, mode }) => {
  return (
    <GreyBox style={{ width: 600 }} innerStyle={{ padding: '40px'}}>
      <div className="center-flex column">
        <div className="message-text">{data.text}</div>

        {mode == 'warning' &&
          <div className="center-flex row">
            <div 
              className="border-box-small pointer"
              style={{ margin: '2px 10px'}}
              onClick={ () => { 
                data.confirm(); 
                store.dispatch({ type: 'HIDE_POPUP' }); 
              }} 
            >
              Confirm
            </div>

            <div 
              className="border-box-small pointer"
              style={{ margin: '2px 10px'}}
              onClick={ () => 
                store.dispatch({ type: 'HIDE_POPUP' }) 
              } 
            >
              Cancel
            </div>
          </div>
        }

        {mode == 'message' &&
          <div 
            className="border-box-small pointer"
            style={{ margin: '2px 10px'}}
            onClick={ () => 
              store.dispatch({ type: 'HIDE_POPUP' }) 
            } 
          >
            OK
          </div>
        }
    </div>

    </GreyBox>
  )
}

export default Popup;

