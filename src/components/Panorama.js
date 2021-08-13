import React from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

const Panorama = ({ layer, baseImage }) => {

  const texture = useTexture(window.cdn + baseImage)

  return (
    <mesh name='panorama' layers={layer} scale={[-1, 1, 1]} >
      <sphereBufferGeometry args={[800, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide}/>
    </mesh>
  )
}

export default Panorama