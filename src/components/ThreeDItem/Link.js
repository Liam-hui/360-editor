import React, { useMemo } from 'react'
import store from '@/store'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { imagePath } from '@/utils/MyUtils'
import ItemShader from '@/shaders/ItemShader'

export default function Link({ meshProps, data, isHover }) {

  const { target, cameraPosition } = data
  const texture = useTexture(imagePath('arrow.png'))
  const shader = useMemo(() => { return JSON.parse(JSON.stringify(ItemShader)) }, [])

  const onPointerDown = (e) => {
    if (target) {
      const center = new THREE.Vector2(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight)
      store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: target, cameraPosition: cameraPosition, transitionCenter: center })
    }
  }

  return (
    <mesh {...meshProps} onPointerDown={onPointerDown}>
      <planeBufferGeometry args={[90.1, 122.9]}/>
      <shaderMaterial args={[shader]} uniforms-tex-value={texture} uniforms-isHover-value={isHover} transparent side={THREE.DoubleSide}/>
    </mesh>
  )
}




