import React, { useState, useEffect } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import './style.css';

const Popup = (props) => {

  const popup = useSelector(state => state.popup);
  const data = popup.data;

  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    setTimeout(
      () => setIsShown(popup.isShown),
      popup.isShown ? 10 : 500
    )
  }, [popup.isShown]);

  return (
    <>
      { (popup.isShown || isShown) ?
        <div className={"darkOverlay" + ( popup.isShown && isShown ? ' isShown' : '') }>
          <div className="popupContainer">
            {
              {
                'upload3dImage': <UploadImage data={data}/>,
                'update3dImage': <UploadImage data={data}/>,
                'uploadImage': <UploadImage data={data}/>,
                'editInfo':  <EditInfo data={data}/>,
              }[data.mode] || null
            }       
          </div>
        </div>
      :
        null
      }
    </>
  )

}

const Buttons = ({confirm}) => {

  return (
    <div className='row' style={{marginTop: 20}}>

      <div 
        className="coloredButton popupButton centerFlex"
        onClick={ () => { 
          confirm(); 
          store.dispatch({type: 'HIDE_POPUP'}); 
        }} 
      >
        CONFIRM
      </div>

      <div 
        className="coloredButton popupButton centerFlex"
        onClick={ () => 
          store.dispatch({type: 'HIDE_POPUP'}) 
        } 
      >
        CANCEL
      </div>

    </div>
  )
}

const UploadImage = ({data}) => {

  const [image, setImage] = useState(null)

  const afterUpload = (images) => {
    setImage(images[0])
  }

  return (
    <>
      <div className="popupTitle">UPLOAD IMAGE</div>

      {image && 
        <img className='imagePreview' src={image.base64}/>
      }

      <div className='row'>

        {!image? 
          <label
            htmlFor="uploadImage"
            className="coloredButton popupButton centerFlex"
          >
            SELECT IMAGE
          </label>
        :
          <div
            className="coloredButton popupButton centerFlex"
            onClick={ () => {

              store.dispatch({
                type: {
                  'upload3dImage': 'ADD_THREE_D_IMAGE',
                  'uploadImage': 'ADD_IMAGE',
                  'update3dImage': 'UPDATE_THREE_D_IMAGE',
                }[data.mode],
                // image: image,
                image: {
                  ...image,
                  url: 'https://media.comicbook.com/2018/03/avengers-infinity-war-poster-1093756.jpeg'
                },
                ... data.position? {position: data.position} : {},
                ... data.id? {id: data.id} : {},
              })

              store.dispatch({type: 'HIDE_POPUP'}) 
            }} 
          >
            CONFIRM
          </div>
        }

        <div 
          className="coloredButton popupButton centerFlex"
          onClick={ () => 
            store.dispatch({type: 'HIDE_POPUP'}) 
          } 
        >
          CANCEL
        </div>

      </div>

      <input onChange={(e) => handleUploadImages(e, afterUpload)} type="file" id="uploadImage" accept="image/*" multiple={false}/>

    </>
  )
}

const handleUploadImages = async(e, afterUpload) => {
  try {
    const files = e.target.files;
    if (!files) return;

    let images = [];
    for (const [index, file] of Array.from(files).entries()) {

      let image = await load(file);
      // images = images.concat( [ {...image, file: file} ] );
      images = images.concat( image );

      function load(file) {
        return new Promise((resolve, reject) => {
          let reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async function () {
            resolve(await loadImage(reader.result));
          };
          reader.onerror = ()=>reject()
        })
      }

      function loadImage(src) {
        return new Promise((resolve, reject) => {
          let image = new Image();
          image.onload = function () {
            // let temp_id = Math.random().toString(36).substr(2, 9);
            resolve({
              // id: temp_id,
              base64: src,
              width: this.width,
              height: this.height,
            });
          };
          image.onerror = ()=>reject()
          image.src = src;
        })
      }
      
    };

    afterUpload(images)

  } catch (error) {
    alert(error);
    console.log("Catch Error: ", error);
  } finally {
    e.target.value = '';  // reset input file
  }
}

const EditInfo = ({data}) => {

  const [text, setText] = useState(data?.text??'')

  return (
    <>
      <div className="popupTitle">EDIT INFO</div>
      <textarea className="infoTextInput" type="text" id="lname" value={text} onChange={(e) => setText(e.target.value)}/>
      <Buttons confirm={() => store.dispatch({type: 'UPDATE_INFO_TEXT', id: data.id, text: text}) }/>
    </>
  )
}


export default Popup;

