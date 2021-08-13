import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import * as THREE from 'three'
import store from '@/store'
import { useSelector } from "react-redux"
import { Canvas, useThree } from '@react-three/fiber'
import { useProgress, OrbitControls } from '@react-three/drei'

import Panorama from '@/components/Panorama'
import Menu from '@/components/Menu'
import ThreeDItem from '@/components/ThreeDItem'
import Effects from '@/components/Effects'

const ThreeLoader = () => {
  const [isInited, setIsInited] = useState(false)
  const scenes = useSelector(state => state.scenes)
  const { active } = useProgress()

  let timeoutRef = useRef(null)

  // init
  useEffect(() => {
    if (!active && !isInited) {

      if (timeoutRef.current != null) 
        clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(
        () => {
          document.getElementById("root").classList.remove("not-ready");
          setIsInited(true)
        }
      ,700)

    }
  }, [active])

  // change scenes
  useEffect(() => {
    if (!active && scenes.layer0Id != null && scenes.layer1Id != null && !scenes.isTransitioning) {

      if (timeoutRef.current != null) 
        clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(
        () => store.dispatch({ type: 'CHANGE_SCENE_START' })
      ,500)

    }
  }, [active, scenes])
  
  return null
}

const Setup = () => {

  const { camera, raycaster, scene, set, get } = useThree()

  const mouse = new THREE.Vector2()
  const myRaycaster = new THREE.Raycaster()

  useEffect(() => {
    store.dispatch({ type: 'SET_CAMERA', camera: camera })

    camera.layers.enable(0)
    camera.layers.enable(1)
    raycaster.layers.enable(0)
    raycaster.layers.enable(1)

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("wheel", onWheel)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("wheel", onWheel)
    }
  }, [camera.layers, raycaster.layers])

  const onMouseMove = useCallback(e => {
    if (!get().isTransitioning && !store.getState().popup.isShown) {
      
      mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1
      mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1

      myRaycaster.setFromCamera(mouse, camera)
      myRaycaster.layers.set(get().currentLayer)
      const intersects = myRaycaster.intersectObjects(scene.children)
      for (const intersect of intersects) {
        if (intersect.object.name == 'threeDItem') {
          set({ hovered: intersect.object.uid })
          document.getElementById("root").style.cursor = "pointer"
          return
        }
        if (intersect.object.name == 'panorama') {
          set({ point: intersect.point})
        }
      }

      document.getElementById("root").style.cursor = "unset"
      set({ hovered: null })
    }
  }, [])

  const onWheel = useCallback(({ deltaY }) => {
    camera.fov = Math.max(23, Math.min(camera.fov + deltaY * 0.005, 100))
    camera.updateProjectionMatrix()
  }, [])

  return null
}

const Scene = ({ layer, baseImage, items, isAdmin }) => {
  return (
    <>
      <Suspense fallback={null}>
        <Panorama layer={layer} baseImage={baseImage} />
      </Suspense>
      {items.map(item => 
        <Suspense key={item.id} fallback={null}>
          <ThreeDItem id={item.id} type={item.type} layer={layer} data={item} isAdmin={isAdmin}/> 
        </Suspense>
      )}
    </>
  )
}

export default function ThreeCanvas() {

  const config = useSelector(state => state.config)
  const scenes = useSelector(state => state.scenes)
  const threeDItems = useSelector(state => state.threeDItems.data)
  const isSetTargetOn = useSelector(state => state.setTarget.isOn)
  const controlsRef = useRef()

  return (
    <>
      <ThreeLoader/>      
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 0.1], fov: 55 }}
      >
        <Setup/>
        {scenes.layer0Id != null && 
          <Scene 
            id={scenes.layer0Id} 
            layer={0} 
            baseImage={scenes.data[scenes.layer0Id].baseImage}
            items={Object.entries(threeDItems).map(([id, data]) => ({ id, ...data })).filter(x => x.scene == scenes.layer0Id)} 
            isAdmin={config.mode == 'admin'}
          />
        }
        {scenes.layer1Id != null && 
          <Scene 
            id={scenes.layer1Id} 
            layer={1} 
            baseImage={scenes.data[scenes.layer1Id].baseImage}
            items={Object.entries(threeDItems).map(([id, data]) => ({ id, ...data })).filter(x => x.scene == scenes.layer1Id)} 
            isAdmin={config.mode == 'admin'}
          />
        }
        <Effects scenes={scenes} controlsRef={controlsRef} />
        {config.mode == 'admin' && !scenes.isTransitioning && !isSetTargetOn && <Menu/>}
        <OrbitControls ref={controlsRef} enableRotate={!scenes.isTransitioning} enableZoom={false} enablePan={false} enableDamping dampingFactor={0.2} autoRotate={false} rotateSpeed={-0.2} /> 
      </Canvas>
    </>
  )
}
