import React, { useState, useEffect, useMemo } from 'react'
import store from '@/store'
import * as THREE from 'three'
import ItemShader from '@/shaders/ItemShader'

import Label from './Label'

export default function Video({ meshProps, data, isHover, isAdmin }) {

  const { url, title } = data
  const [video, setVideo] = useState(null)

  useEffect(async() => {
    const video = await videoElement(window.cdn + url)
    setVideo(video)

    return () => video.remove()
  }, [])

  const videoElement = (url) => {
    return new Promise(resolve => {
      const vid = document.createElement('video')
      vid.crossOrigin = "anonymous"
      // vid.src = url
      vid.src = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  
      vid.onloadedmetadata = () => {
        vid.autoplay = true;
        vid.loop = true
        vid.muted = true
        vid.setAttribute("muted", true)
        vid.setAttribute("playsinline", true)
        vid.play().then(
          () => {
            resolve(vid)
          }
        )
      }
    })
  }

  const texture = useMemo(() => {
    if (video != null) 
      return new THREE.VideoTexture(video)
    else return null
  }, [video])  

  const shader = useMemo(() => { return JSON.parse(JSON.stringify(ItemShader)) }, [])

  const onClick = (e) => {
    if (e.which == 1 || e.button == 0) {
      store.dispatch({
        type: 'SHOW_POPUP',
        mode: 'showItem',
        data: data
      })
    }
  }

  if (video != null) return (
    <>  
      <mesh {...meshProps} onClick={onClick} >
        <planeBufferGeometry args={[video.videoWidth, video.videoHeight]}/>
        <shaderMaterial args={[shader]} uniforms-tex-value={texture} uniforms-isHover-value={isHover} transparent side={THREE.DoubleSide}/>
      </mesh>
      {!isAdmin &&
        <Label position={meshProps.position} labelText={title} onClick={onClick} role='img' />
      }
    </>
  )
  else return null
}

