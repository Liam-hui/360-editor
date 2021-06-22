import React, { useState, useEffect, useRef } from 'react';
import store from '@/store';
import GreyBox from '@/components/GreyBox';
import { Swiper, SwiperSlide } from "swiper/react";
import { imagePath } from '@/utils/MyUtils';
import LightBox from '@/components/LightBox';
import 'swiper/swiper-bundle.css';
import "swiper/components/pagination/pagination.min.css"
import SwiperCore, {
  Thumbs,
  Controller,
  Pagination
} from 'swiper/core';
SwiperCore.use([Pagination, Thumbs, Controller]);

const Slides = ({ images, openImage }) => {

  const [swiper, setSwiper] = useState(null)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
 
  const slides = [];
  images.map(image => (
    slides.push(
      <SwiperSlide>
        <img src={window.cdn + image}/>
      </SwiperSlide>
    )
  ));

  return (
    <>
      {images.length > 1 ?
        <>
          <Swiper
            onClick={() => openImage(swiper.activeIndex - (images.length > 4 ? 4 : 0) )}
            controller={{ control: thumbsSwiper }}
            onSwiper={setSwiper}
            loop={images.length > 4}
            loopedSlides={4}
          >
            {slides}
          </Swiper>
          <div className="thumbs" style={{ marginTop: 10, marginBottom: 15 }}>
            <Swiper
              controller={{ control: swiper }}
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView='auto'
              touchRatio={0.2}
              centeredSlides
              slideToClickedSlide
              loop={images.length > 4}
              loopedSlides={4}
            >
              {slides}
            </Swiper>
          </div>
          <img style={{ left: -100 }} onClick={() => swiper.slidePrev(700)} className="slider-arrow pointer" src={imagePath('icon-arrow.svg')}/>
          <img style={{ right: -100, transform: `scaleX(-1)` }} onClick={() => swiper.slideNext(400)} className="slider-arrow pointer" src={imagePath('icon-arrow.svg')}/>
        </>
      :
        <img onClick={() => openImage(0)} style={{ width: '100%', height: 350, marginBottom: 15, cursor: 'pointer', objectFit: 'contain' }} src={window.cdn + images[0]}/>
      }
    </>

  )

}

const Detail = ({ data }) => {

  const { id } = data;
  
  const item = store.getState().threeDItems.data[id]

  const [enlargeIndex, setEnlargeIndex] = useState(0)
  const [isEnlarged, setIsEnlarged] = useState(false)

  const openImage = (index) => {
    setEnlargeIndex(index)
    setIsEnlarged(true)
  }

  if (item.type == 'image') return (
    <>
    <GreyBox style={{ width: 900 }} innerStyle={{ padding: '40px 130px'}}>
      <div className="detail-container">

        <Slides images={item.images.map(x => x.url)} openImage={openImage}/>

        {item.title != '' &&
          <span style={{ fontSize: '1.1em' }}>{item.title}</span>
        }

        {item.description != '' &&
          <p>{item.description}</p>
        }

        {item.link != '' &&
           <a href={item.link.includes('http') ? item.link : 'http://' + item.link} target="_blank">
            <div className='border-box-small view-more'>
              View Details
              <div className="view-more-arrow">
                <img src={imagePath('icon-right-arrow.svg')}/>
                <img src={imagePath('icon-right-arrow-grey.svg')}/>
              </div>
            </div>
          </a>
        }

      </div>
    </GreyBox>
    <LightBox isVisible={isEnlarged} close={() => setIsEnlarged(false)}>
      {item.images[enlargeIndex]?.url && <img style={{ width: 'auto', maxWidth: '85%', height: '85%', objectFit: 'contain', pointerEvents: 'none' }} src={window.cdn + item.images[enlargeIndex].url}/>}
    </LightBox>
    </>
  )

  else if (item.type == 'video') return (
    <div className="detail-container video-container">

      <video autoPlay src={window.cdn + item.url} controls/>

      {item.title != '' &&
        <span style={{ fontSize: '1.1em' }}>{item.title}</span>
      }

      {item.description != '' &&
        <p>{item.description}</p>
      }

      {item.link != '' &&
        <a href={item.link.includes('http') ? item.link : 'http://' + item.link} target="_blank">
          <div className='border-box-small view-more'>
            View Details
            <div className="view-more-arrow">
              <img src={imagePath('icon-right-arrow.svg')}/>
              <img src={imagePath('icon-right-arrow-grey.svg')}/>
            </div>
          </div>
        </a>
      }

    </div>
  )
}

export default Detail;



