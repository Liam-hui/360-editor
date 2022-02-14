import React, { useMemo } from 'react'
import store from '@/store'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import ItemShader from '@/shaders/ItemShader'

import Label from './Label'

export default function Image({ meshProps, data, isHover, isAdmin, showEditor }) {

  const { title } = data
  const { url, width, height } = data.images[0]

  const texture = useTexture(window.cdn + url)
  // const texture = useTexture(process.env.PUBLIC_URL + 'pano_background.jpg')
  const shader = useMemo(() => { return JSON.parse(JSON.stringify(ItemShader)) }, [])

  const onClick = (e) => {
    if (e.which == 1 || e.button == 0) {
      isAdmin ? 
        showEditor()
      :
        store.dispatch({
          type: 'SHOW_POPUP',
          mode: 'showItem',
          data: data
        })
    }
  }

  return (
    <>
      <mesh {...meshProps} onClick={onClick} >
        <planeBufferGeometry args={[width, height]}/>
        <shaderMaterial args={[shader]} uniforms-tex-value={texture} uniforms-isHover-value={isHover} transparent side={THREE.DoubleSide}/>
      </mesh>

      {!isAdmin &&
        <Label position={meshProps.position} labelText={title} onClick={onClick} role='img' />
      }
    </>
  )
}

