import React, { useState, useEffect } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import { UploadImage, UploadVideo } from "@/components/Upload";
import Detail from "@/components/Detail";


const Popup = () => {

  const popup = useSelector(state => state.popup);
  const { mode, payload } = popup;

  const [isVisible, setIsVisible] = useState(false);
  const [noBackground, setNoBackground] = useState(false);

  useEffect(() => {
    setNoBackground(mode == 'showVideo');
  }, [mode]);

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
              'uploadVideo': <UploadVideo data={payload}/>,
              'uploadImage': <UploadImage data={payload}/>,
              'editInfo':  <EditInfo data={payload}/>,
              'showVideo': <VideoViewer data={payload}/>,
              'showImages':  <Detail data={payload}/>,
              'showWarning':  <Warning data={payload}/>,
              'showMessage':  <Message data={payload}/>,
            } [mode] || null
          }       
        </div>
      :
        null
      }
    </>
  )

}

const Warning = ({ data }) => {
  return (
    <>
      <div className="popup-title" style={{ marginBottom: 0 }}>{data.text}</div>
      <Buttons confirm={data.confirm}/>
    </>
  )
}

const Message = ({ data }) => {
  return (
    <>
      <div className="popup-title">{data.text}</div>
      <div 
        className="colored-button popup-button center-flex"
        onClick={() => store.dispatch({ type: 'HIDE_POPUP' })} 
      >
        OK
      </div>
    </>
  )
}

const Buttons = ({ confirm }) => {

  return (
    <div className='row' style={{ marginTop: 20 }}>

      <div 
        className="colored-button popup-button center-flex"
        onClick={ () => { 
          confirm(); 
          store.dispatch({ type: 'HIDE_POPUP' }); 
        }} 
      >
        CONFIRM
      </div>

      <div 
        className="colored-button popup-button center-flex"
        onClick={ () => 
          store.dispatch({ type: 'HIDE_POPUP' }) 
        } 
      >
        CANCEL
      </div>

    </div>
  )
}

const EditInfo = ({ data } ) => {

  const [text, setText] = useState(data?.text ?? '')

  return (
    <>
      <div className="popup-title">EDIT INFO</div>
      <textarea className="info-textinput" type="text" id="lname" value={text} onChange={(e) => setText(e.target.value)}/>
      <Buttons confirm={() => store.dispatch({ type: 'UPDATE_TWO_D_ITEM', id: data.id, data: { text: text } } ) }/>
    </>
  )
}

const VideoViewer = ({ data }) => {
  const { videoUrl } = data;

  return (
    <>
      <video autoPlay width="100%" height="100%" src={window.cdn + videoUrl} controls/>
    </>
  )
}


export default Popup;

