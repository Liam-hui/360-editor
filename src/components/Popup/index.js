import React, { useState, useEffect } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import './style.css';

import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.css';
import "swiper/components/pagination/pagination.min.css"
import SwiperCore, {
  Pagination
} from 'swiper/core';
SwiperCore.use([Pagination]);


const Popup = () => {

  const popup = useSelector(state => state.popup);
  const { mode, data } = popup;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let loop;

    if (popup.isShown) {
      loop = setTimeout(
        () =>  setIsVisible(true)
      ,20)
    }
    else {
      loop = setTimeout(
        () =>  setIsVisible(false)
      ,500)
    }

    return () => {
      clearTimeout(loop);
    };

  }, [popup.isShown]);

  return (
    <>
      { ( popup.isShown || isVisible ) ?
        <div className={"darkOverlay" + ( popup.isShown && isVisible ? ' isVisible' : '') }>
          <div 
            className={"darkOverlayClickArea" }
            onClick={() => store.dispatch({type: 'HIDE_POPUP'})}
          />
          <div className="popupContainer">
            {
              {
                'uploadImage': <UploadImage data={data}/>,
                'uploadImages': <UploadImage data={data} multi/>,
                'editInfo':  <EditInfo data={data}/>,
                'imagesSlides':  <ImageSlides data={data}/>,
              }[mode] || null
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

const UploadImage = ( {data, multi} ) => {

  const [images, setImages] = useState([]);

  const afterUpload = (images) => {
    setImages(images)
  }

  return (
    <>
      <div className="popupTitle">{`UPLOAD IMAGE${multi? 'S' :''}`}</div>

      {images.length == 1 && 
        <img className='imagePreview' src={images[0].base64}/>
      }

      {images.length > 1 && 
        <Slides images={images}/>
      }

      <div className='row'>

        {images.length == 0 ? 
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

              switch (data.action) {

                case 'add3dImage':
                  store.dispatch({
                    type: 'ADD_THREE_D_IMAGE',
                    image: {
                      ...images[0],
                      url: 'https://media.comicbook.com/2018/03/avengers-infinity-war-poster-1093756.jpeg'
                    },
                    position: data.position
                  })
                break;

                case 'addImage':
                  store.dispatch({
                    type: 'ADD_IMAGE',
                    image: {
                      ...images[0],
                      url: 'https://media.comicbook.com/2018/03/avengers-infinity-war-poster-1093756.jpeg'
                    },
                    position: data.position
                  })
                break;

                case 'update3dImage':
                  store.dispatch({
                    type: 'UPDATE_THREE_D_IMAGE',
                    image: {
                      ...images[0],
                      url: 'https://media.comicbook.com/2018/03/avengers-infinity-war-poster-1093756.jpeg'
                    },
                    id: data.id
                  })
                break;

                case 'add3dImageSlides':
                  store.dispatch({
                    type: 'ADD_THREE_D_IMAGE_SLIDES',
                    images: images,
                    id: data.id
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
          className="coloredButton popupButton centerFlex"
          onClick={ () => 
            store.dispatch({type: 'HIDE_POPUP'}) 
          } 
        >
          CANCEL
        </div>

      </div>

      <input onChange={(e) => handleUploadImages(e, afterUpload)} type="file" id="uploadImage" accept="image/*" multiple={multi?? false}/>

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

const EditInfo = ( {data} ) => {

  const [text, setText] = useState(data?.text??'')

  return (
    <>
      <div className="popupTitle">EDIT INFO</div>
      <textarea className="infoTextInput" type="text" id="lname" value={text} onChange={(e) => setText(e.target.value)}/>
      <Buttons confirm={() => store.dispatch({type: 'UPDATE_INFO_TEXT', id: data.id, text: text}) }/>
    </>
  )
}

const Slides = ( {images} ) => {
  
  const slides = [];
  images.map(image => (
    slides.push(
      <SwiperSlide>
        <img className='sliderImage' src={image.base64}/>
      </SwiperSlide>
    )
  ));

  return (
    <>
      {images.length >0 && 
        <Swiper pagination={true} className="imageSlides">
          {slides}
        </Swiper>
      }
    </>

  )

}

const ImageSlides = ( {data} ) => {

  const { id } = data;

  const images = useSelector(state => state.threeDImages.data[id].slides);

  return (
    <>

      {images.length >0 && 
        <Slides images={images}/>
      }

      <div className='row'>

        <div 
          className="coloredButton popupButton centerFlex"
          onClick={ () => 
            store.dispatch({
              type: 'SHOW_POPUP',
              mode: 'uploadImages',
              data: {
                action: 'add3dImageSlides',
                id: id,
              }
            })  
          } 
        >
          ADD IMAGES
        </div>

        <div 
          className="coloredButton popupButton centerFlex"
          onClick={ () => 
            store.dispatch({type: 'HIDE_POPUP'}) 
          } 
        >
          CLOSE
        </div>
      
      </div>

    </>
    
  )
}



export default Popup;

