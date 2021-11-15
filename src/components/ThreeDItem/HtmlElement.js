import React, { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function HtmlElement({ position, element, zIndexRange }) {

  const htmlRef = useRef()
  const [isVisible, setIsVisible] = useState(false)

  useFrame(() => {
    let str = htmlRef.current.parentElement.style.transform
    str = str.substring(
      str.indexOf("(") + 1, 
      str.indexOf(")")
    ).split(',')
    const x = parseFloat(str[0].replace('px',''))
    const y = parseFloat(str[1].replace('px',''))
    setIsVisible(x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight)
  })

  return (
    <mesh position={position} >
      <planeBufferGeometry args={[0.1, 0.1]}/>
      <meshBasicMaterial transparent opacity={0} />
      <Html 
        ref={htmlRef} 
        {...zIndexRange && { zIndexRange }}
      >
        {React.cloneElement(element, { isVisible })}
      </Html>
    </mesh>
  )
}

