import React, { useState, useEffect } from 'react'
import store from '@/store'
import { useSelector } from "react-redux"

import LightBox from '@/components/LightBox'
import GreyBox from '@/components/GreyBox'
import Upload from "@/components/Upload"
import Detail from "@/components/Detail"

const Popup = () => {

  const popup = useSelector(state => state.popup)
  const { mode, data } = popup

  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    let loop;
    if (popup.isShown) 
      loop = setTimeout( () => setIsHidden(false), 0 );
    else 
      loop = setTimeout( () => setIsHidden(true), 500 );
    
    return () => {
      clearTimeout(loop);
    };
  }, [popup.isShown]);

  return (
    <>
      {isHidden ?
        null
      :
        <LightBox isVisible={popup.isShown} close={() => store.dispatch({type: 'HIDE_POPUP'})}>
          {
            {
              'uploadImage': <Upload data={data} mode='image'/>,
              'uploadVideo': <Upload data={data} mode='video' />,
              'showItem':  <Detail data={data}/>,
              'showWarning':  <Message data={data} mode='warning'/>,
              'showMessage':  <Message data={data} mode='message'/>,
            } [mode] || null
          }       
        </LightBox>
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

export default Popup

