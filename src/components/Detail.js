import React, { useState, useEffect, useRef } from 'react';
import store from '@/store';
import GreyBox from '@/components/GreyBox';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.css';
import "swiper/components/pagination/pagination.min.css"
import SwiperCore, {
  Pagination
} from 'swiper/core';
SwiperCore.use([Pagination]);

const Slides = ({ images }) => {

  const [swiper, setSwiper] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  
  const slides = [];
  images.map(image => (
    slides.push(
      <SwiperSlide>
        <img src={window.cdn + image}/>
      </SwiperSlide>
    )
  ));

  const scrollRef = useRef()

  const onWheel = (e) => {

    scrollRef.current.scrollTo({
      top: 0,
      left: scrollRef.current.scrollLeft + e.deltaY,
    });
  }

  return (
    <>
      {images.length > 0 && 
        <>
          <Swiper
            onSlideChange={(e) => setActiveIndex(e.activeIndex)}
            onSwiper={(swiper) => setSwiper(swiper) }
          >
            {slides}
          </Swiper>
          <div ref={scrollRef} className="small-images-list" onWheel={onWheel}>
            <div>
              {images.map( (image, index) => 
                <div className="image-wrapper pointer" onClick={() => swiper.slideTo(index, 700)}>
                  <img src={window.cdn + image}/> 
                  {index == activeIndex &&
                    <div className="overlay"/>
                  }
                </div>
              )}
            </div>
          </div>
          <img style={{ left: 20 }} onClick={() => swiper.slidePrev(700)} className="slider-arrow pointer" src={require('@/assets/icons/icon-arrow.svg').default}/>
          <img style={{ right: 20, transform: `scaleX(-1)` }} onClick={() => swiper.slideNext(700)} className="slider-arrow pointer" src={require('@/assets/icons/icon-arrow.svg').default}/>
        </>
      }
    </>

  )

}

const Detail = ({ data }) => {

  const { id } = data;
  
  const item = store.getState().threeDItems.data[id]

  return (
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
              <img style={{ marginLeft: 5, height: '0.9em', width: 'auto' }} src={require('@/assets/icons/icon-right-bottom-arrow.svg').default}/>
            </span>
          </a>
        }

      </div>
    </GreyBox>
  )
}

export default Detail;



