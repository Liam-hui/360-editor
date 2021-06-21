import React, { useState, useEffect, useRef } from 'react';
import store from '@/store';
import GreyBox from '@/components/GreyBox';
import { Swiper, SwiperSlide } from "swiper/react";
import { imagePath } from '@/utils/MyUtils';
import 'swiper/swiper-bundle.css';
import "swiper/components/pagination/pagination.min.css"
import SwiperCore, {
  Thumbs,
  Controller,
  Pagination
} from 'swiper/core';
SwiperCore.use([Pagination, Thumbs, Controller]);

const Slides = ({ images }) => {

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

  const scrollRef = useRef()

  return (
    <>
      {images.length > 0 && 
        <>

          <Swiper
            controller={{ control: thumbsSwiper }}
            onSwiper={setSwiper}
            loop
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
              loop
              loopedSlides={4}
            >
              {slides}
            </Swiper>
          </div>
          <img style={{ left: -50 }} onClick={() => swiper.slidePrev(700)} className="slider-arrow pointer" src={imagePath('icon-arrow.svg')}/>
          <img style={{ right: -50, transform: `scaleX(-1)` }} onClick={() => swiper.slideNext(400)} className="slider-arrow pointer" src={imagePath('icon-arrow.svg')}/>
        </>
      }
    </>

  )

}

const Detail = ({ data }) => {

  const { id } = data;
  
  const item = store.getState().threeDItems.data[id]

  if (item.type == 'image') return (
    <GreyBox style={{ width: 600 }} innerStyle={{ padding: '40px 80px'}}>
      <div className="detail-container">

        <Slides images={item.images.map(x => x.url)}/>

        {item.title != '' &&
          <span style={{ fontSize: '1.1em' }}>{item.title}</span>
        }

        {item.description != '' &&
          <p>{item.description}</p>
        }

        {item.link != '' &&
           <a href={item.link.includes('http') ? item.link : 'http://' + item.link} target="_blank">
            <span style={{ borderBottom: '1px solid white' }}>
              View More
              <img style={{ marginLeft: 5, height: '0.9em', width: 'auto' }} src={imagePath('icon-right-bottom-arrow.svg')}/>
            </span>
          </a>
        }

      </div>
    </GreyBox>
  )

  else if (item.type == 'video') return (
    <div className="detail-container" style={{ width: 700 }}>

      <video autoPlay src={window.cdn + item.url} controls/>

      {item.title != '' &&
        <span style={{ fontSize: '1.1em' }}>{item.title}</span>
      }

      {item.description != '' &&
        <p>{item.description}</p>
      }

      {item.link != '' &&
          <a href={item.link.includes('http') ? item.link : 'http://' + item.link} target="_blank">
          <span style={{ borderBottom: '1px solid white' }}>
            View More
            <img style={{ marginLeft: 5, height: '0.9em', width: 'auto' }} src={imagePath('icon-right-bottom-arrow.svg')}/>
          </span>
        </a>
      }

    </div>
  )
}

export default Detail;



