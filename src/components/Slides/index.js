import React, { useState, useEffect } from 'react';

import './style.css';

import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.css';
import "swiper/components/pagination/pagination.min.css"
import SwiperCore, {
  Pagination
} from 'swiper/core';
SwiperCore.use([Pagination]);

const Slides = ({ images }) => {
  
  const slides = [];
  images.map(image => (
    slides.push(
      <SwiperSlide>
        <img src={image.base64 ?? image}/>
      </SwiperSlide>
    )
  ));

  return (
    <>
      {images.length > 0 && 
        <Swiper pagination={true} className="image-slides">
          {slides}
        </Swiper>
      }
    </>

  )

}

export default Slides;