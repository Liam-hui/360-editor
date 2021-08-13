import React, { useState, useEffect, useMemo } from 'react'
import store from '@/store'
import * as THREE from 'three'
import ItemShader from '@/shaders/ItemShader'

export default function Video({ meshProps, data, isHover }) {

  const { url } = data
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
      vid.src = url
  
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

  const onPointerDown = () => {
    store.dispatch({
      type: 'SHOW_POPUP',
      mode: 'showItem',
      data: data
    })
  }

  if (video != null) return (
    <mesh {...meshProps} onPointerDown={onPointerDown} >
      <planeBufferGeometry args={[video.videoWidth, video.videoHeight]}/>
      <shaderMaterial args={[shader]} uniforms-tex-value={texture} uniforms-isHover-value={isHover} transparent side={THREE.DoubleSide}/>
    </mesh>
  )
  else return null
}

