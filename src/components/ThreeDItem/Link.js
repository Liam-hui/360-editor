import React, { useEffect, useMemo, useRef } from 'react'
import store from '@/store'
import * as THREE from 'three'
import { cursorVideo, setCursorVideo } from '@/utils/MyUtils'
import ItemShader from '@/shaders/ItemShader'

export default function Link({ meshProps, data }) {

  const { target, cameraPosition } = data
  const materialRef = useRef()
  const shader = useMemo(() => { return JSON.parse(JSON.stringify(ItemShader)) }, [])

  useEffect(async() => {
    if (cursorVideo == null)
      await setCursorVideo(updateTexture)
    else
      updateTexture()
  }, [])

  const updateTexture = () => {
    const texture = new THREE.VideoTexture(cursorVideo)
    materialRef.current.uniforms.tex.value = texture
  }

  const onClick = (e) => {
    if (e.which == 1 && target) {
      const center = new THREE.Vector2(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
      store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: target, cameraPosition: cameraPosition, transitionCenter: center })
    }
  }

  return (
    <mesh {...meshProps} onClick={onClick}>
      <planeBufferGeometry args={[90.1, 122.9]}/>
      <shaderMaterial ref={materialRef} args={[shader]} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/>
    </mesh>
  )
}




