import React, { useMemo } from 'react'
import store from '@/store'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import ItemShader from '@/shaders/ItemShader'

export default function Image({ meshProps, data, isHover }) {

  const { url, width, height } = data.images[0]
  
  const texture = useTexture(window.cdn + url)
  const shader = useMemo(() => { return JSON.parse(JSON.stringify(ItemShader)) }, [])

  const onClick = (e) => {
    if (e.which == 1) {
      store.dispatch({
        type: 'SHOW_POPUP',
        mode: 'showItem',
        data: data
      })
    }
  }

  return (
    <mesh {...meshProps} onClick={onClick} >
      <planeBufferGeometry args={[width, height]}/>
      <shaderMaterial args={[shader]} uniforms-tex-value={texture} uniforms-isHover-value={isHover} transparent side={THREE.DoubleSide}/>
    </mesh>
  )
}

