import React, { useEffect, useMemo, useRef } from 'react'
import store from '@/store'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { cursorVideo, setCursorVideo } from '@/utils/MyUtils'
import ItemShader from '@/shaders/ItemShader'

import HtmlElement from './HtmlElement'
import Label from './Label'

export default function Link({ meshProps, data, isAdmin }) {

  const { target, cameraPosition } = data
  const materialRef = useRef()
  const shader = useMemo(() => { return JSON.parse(JSON.stringify(ItemShader)) }, [])
  const { set, isTransitionRequested } = useThree()

  useEffect(async() => {
    if (cursorVideo == null)
      await setCursorVideo(updateTexture)
    else
      updateTexture()
  }, [])

  const updateTexture = () => {
    const texture = new THREE.VideoTexture(cursorVideo)
    if (materialRef.current) materialRef.current.uniforms.tex.value = texture
  }

  const onClick = (e) => {
    if (!isTransitionRequested && (e.which == 1 || e.button == 0) && target) {
      const center = new THREE.Vector2(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
      store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: target, cameraPosition: cameraPosition, transitionCenter: center })
      set({ isTransitionRequested: true })
    }
  }

  return (
    <>
      <mesh {...meshProps} onClick={onClick}>
        <planeBufferGeometry args={[90.1, 122.9]}/>
        <shaderMaterial ref={materialRef} args={[shader]} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/>
      </mesh>
    </>
  )
}




