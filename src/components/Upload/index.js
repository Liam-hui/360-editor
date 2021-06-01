import React, { useState, useEffect } from 'react';
import store from '@/store';
import { uploadFiles } from '@/utils/MyUtils'

import Slides from "@/components/Slides";

import './style.css';

export const UploadImage = ({ data, multi }) => {

  const { action } = data;

  const [images, setImages] = useState([]);

  const afterUpload = (images) => {
    setImages(images)
  }

  const confirmAction = async () => {
    const imagesData = await uploadFiles(images);

    switch (action) {
      case 'add3dImage':
        store.dispatch({
          type: 'ADD_THREE_D_ITEM_REQUEST',
          payload: {
            type: 'image',
            position: data.position,
            image: imagesData[0],
          }
        })
      break;
      case 'add3dImageSlides':
        store.dispatch({
          type: 'UPDATE_THREE_D_ITEM_REQUEST',
          id: data.id,
          payload: {
            slides: imagesData.map(x => x.url),
          }
        })
      break;
      case 'change3dImage':
        store.dispatch({
          type: 'UPDATE_THREE_D_ITEM_REQUEST',
          id: data.id,
          payload: {
            image: imagesData[0],
          }
        })
      break;
      case 'addScene':
        store.dispatch({
          type: 'ADD_SCENE_REQUEST',
          // image: imageUrls[0],
          image: "http://demo.solutionforest.net/360-test/pano_background.jpg",
        })
      break;
    }

    if (action == 'add3dImageSlides')
      store.dispatch( {
        type: 'SHOW_POPUP' ,
        mode: 'showImages',
        payload: {
          id: data.id
        }
      }) 
    else 
      store.dispatch({ type: 'HIDE_POPUP' }) 
  }

  return (
    <>
      <div className="popup-title">{`UPLOAD ${action == 'addScene' ? "PANOARAMA " : ''}IMAGE${multi ? 'S' :''}`}</div>

      {images.length == 1 && 
        <img className='image-preview' src={images[0].base64}/>
      }

      {images.length > 1 && 
        <Slides images={images}/>
      }

      <div className='row'>

        {images.length == 0 ? 
          <label
            htmlFor="upload-image"
            className="colored-button popup-button center-flex"
          >
            SELECT IMAGE
          </label>
        :
          <div
            className="colored-button popup-button center-flex"
            onClick={confirmAction} 
          >
            CONFIRM
          </div>
        }

        <div 
          className="colored-button popup-button center-flex"
          onClick={() => store.dispatch({type: 'HIDE_POPUP'})} 
        >
          CANCEL
        </div>

      </div>

      <input onChange={(e) => handleUploadImages(e, afterUpload)} type="file" id="upload-image" accept="image/*" multiple={multi?? false}/>

    </>
  )
}

export const UploadVideo = ({ data }) => {

  const { action } = data;

  const [videoUrl, setVideoUrl] = useState(null);

  const handleUploadVideo = (e) => {
    setVideoUrl('http://simpl.info/videoalpha/video/dancer1.webm');
  }

  return (
    <>
      <div className="popup-title">{`UPLOAD VIDEO`}</div>

      {videoUrl && 
        <video width="320" height="240" autoPlay muted>
          <source src={videoUrl} type="video/mp4"></source>
        </video>
      }

      <div className='row'>

        {!videoUrl ? 
          <label
            htmlFor="upload-video"
            className="colored-button popup-button center-flex"
          >
            SELECT VIDEO
          </label>
        :
          <div
            className="colored-button popup-button center-flex"
            onClick={ async() => {

              switch (action) {

                case 'add3dVideo':
                  store.dispatch({
                    type: 'ADD_THREE_D_ITEM_REQUEST',
                    payload: {
                      type: 'video',
                      position: data.position,
                      videoUrl
                    }
                  })
                break;

                case 'change3dVideo':
                  store.dispatch({
                    type: 'UPDATE_THREE_D_ITEM_REQUEST',
                    id: data.id,
                    payload: {
                      video: videoUrl
                    }
                  })
                break;

              }

              store.dispatch({type: 'HIDE_POPUP'}) 
            }} 
          >
            CONFIRM
          </div>
        }

        <div 
          className="colored-button popup-button center-flex"
          onClick={ () => 
            store.dispatch({type: 'HIDE_POPUP'}) 
          } 
        >
          CANCEL
        </div>

      </div>

      <input onChange={(e) => handleUploadVideo(e)} type="file" id="upload-video" accept="video/*"/>

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
      images = images.concat(image);

      function load(file) {
        return new Promise((resolve, reject) => {
          let reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async function () {
            resolve( await loadImage(reader.result) );
          };
          reader.onerror = () => reject()
        })
      }

      function loadImage(src) {
        return new Promise((resolve, reject) => {
          let image = new Image();
          image.onload = function (){
            resolve({
              base64: src,
              width: this.width,
              height: this.height,
            });
          };
          image.onerror = () => reject()
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

const addVideo = () => {
  return new Promise(resolve => {
    
    const video = document.createElement('video');

    video.crossOrigin = "anonymous";
    video.src = `http://demo.solutionforest.net/dark-test/test_video.mp4`;

    video.onloadedmetadata = () => {

      video.autoplay = true; 
      video.loop = true;
      video.muted = true;
      video.setAttribute("muted", true);
      video.setAttribute("playsinline", true);

      video.play().then(
        () => {
          resolve(video);
        }
      );
    }
    
  });
}


