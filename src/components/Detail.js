import React, { useState } from 'react'
import store from '@/store'
import GreyBox from '@/components/GreyBox'
import { Swiper, SwiperSlide } from "swiper/react"
import { imagePath } from '@/utils/MyUtils'
import LightBox from '@/components/LightBox'

import 'swiper/swiper-bundle.css'
import "swiper/components/pagination/pagination.min.css"
import SwiperCore, {
  Thumbs,
  Controller,
  Pagination
} from 'swiper/core'
SwiperCore.use([Pagination, Thumbs, Controller])

const Slides = ({ images, openImage }) => {

  const [swiper, setSwiper] = useState(null)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
 
  const slides = (isLabel) => {
    return images.map(image => (
      <SwiperSlide>
        <img 
          tabIndex={isLabel ? 0 : -1} 
          aria-hidden={!isLabel}
          aria-label={image.text} 
          alt={image.text} 
          src={window.cdn + image.url}
        />
      </SwiperSlide>
    ))
  }


  return (
    <>
      {images.length > 1 ?
        <>
          <Swiper
            // onClick={() => openImage(swiper.activeIndex - (images.length > 4 ? 4 : 0) )}
            controller={{ control: thumbsSwiper }}
            onActiveIndexChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            onSwiper={setSwiper}
            loop={false}
            loopedSlides={false}
          >
            {slides(true)}
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
              loop={false}
              loopedSlides={false}
            >
              {slides(false)}
            </Swiper>
          </div>
          {activeIndex > 0 &&
            <img aria-hidden={true} style={{ left: -100 }} className="slider-arrow pointer" src={imagePath('icon-arrow.png')} onClick={() => swiper.slidePrev(700)} />
          }
          {activeIndex < (images.length - 1) &&
            <img aria-hidden={true} style={{ right: -100, transform: `scaleX(-1)` }} onClick={() => swiper.slideNext(400)} className="slider-arrow pointer" src={imagePath('icon-arrow.png')}/>
          }
        </>
      :
        <img 
          // onClick={() => openImage(0)} 
          style={{ width: '100%', height: 350, marginBottom: 15, cursor: 'pointer', objectFit: 'contain' }} 
          tabIndex={0}
          aria-label={images[0].text} 
          alt={images[0].text} 
          src={window.cdn + images[0].url}
        />
      }
    </>

  )

}

const Detail = ({ data }) => {

  const { id } = data
  
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

        <Slides images={item.images} openImage={openImage}/>

        {item.title != '' &&
          <>
            <span tabIndex={0} style={{ fontSize: '1.1em' }}>{item.title}</span>
            <br/>
          </>
        }

        {item.description != '' &&
          <p tabIndex={0} >{item.description}</p>
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
      {item.images[enlargeIndex]?.url && <img tabIndex={0} aria-label={item.images[enlargeIndex].description} alt={item.images[enlargeIndex].description} style={{ width: 'auto', maxWidth: '85%', height: '85%', objectFit: 'contain', pointerEvents: 'none' }} src={window.cdn + item.images[enlargeIndex].url}/>}
    </LightBox>
    </>
  )

  else if (item.type == 'video') return (
    <div className="detail-container video-container">

      <video autoPlay src={window.cdn + item.url} controls/>

      {item.title != '' &&
        <span tabIndex={0}  style={{ fontSize: '1.1em' }}>{item.title}</span>
      }

      {item.description != '' &&
        <p tabIndex={0} >{item.description}</p>
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

      <button tabIndex={0} aria-label="關閉" role="button" onClick={() => store.dispatch({type: 'HIDE_POPUP'})} className="close-button pointer" >
        <img alt="關閉" src={imagePath('icon-close.png')}/>
      </button>

    </div>
  )
}

export default Detail


