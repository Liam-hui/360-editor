import React, { useState, useEffect, useRef, useMemo } from 'react'
import store from '@/store'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { imagePath } from '@/utils/MyUtils'

const Info = () => {

  const [isShown, setIsShown] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    window.addEventListener('contextmenu', e => e.preventDefault())
    window.addEventListener("mousedown", onMouseDown)
    return () => window.removeEventListener("mousedown", onMouseDown)
  } ,[])

  const onMouseDown = (e) => {
    if (e.which == 3) { 
      e.preventDefault()
      setIsShown(true)
      setPos({ x: e.clientX, y: e.clientY })
    }
    else 
      setIsShown(false)
    }

  return (
    <>
      {isShown &&
        <div 
          className="info-container"
          style={{
            top: pos.y,
            left: pos.x
          }}
        >
          <p>{window.company}</p>
          <p>Produced by Solution Forest Ltd</p>
        </div>
      }
    </>
  )
}

export default Info