import React, { useState, useEffect, useRef, useCallback, Suspense, useMemo } from 'react'
import * as THREE from 'three'
import store from '@/store'
import { useSelector } from "react-redux"
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useProgress, OrbitControls } from '@react-three/drei'
import { ResizeObserver } from '@juggle/resize-observer'
import { isMobile } from 'react-device-detect'

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
    if (scenes.firstScene && !active && !isInited) {

      if (timeoutRef.current != null) 
        clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(
        () => {
          document.getElementById("root").classList.remove("not-ready");
          setIsInited(true)
        }
      , 700)

    }
  }, [active, scenes.firstScene])

  // change scenes
  useEffect(() => {
    if (!active && scenes.isTransitionRequested && !scenes.isTransitioning) {

      if (timeoutRef.current != null) 
        clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(
        () => store.dispatch({ type: 'CHANGE_SCENE_START' })
      ,500)
    }
  }, [active, scenes])
  
  return null
}

const Setup = ({ controlsRef, keyRef, setEnableRotate }) => {

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
    if (isMobile) {
      window.addEventListener("touchmove", onTouchMove)
      window.addEventListener("touchend", onTouchEnd)
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("wheel", onWheel)
      if (isMobile) {
        window.removeEventListener("touchmove", onTouchMove)
        window.removeEventListener("touchend", onTouchEnd)
      }
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
    if (!document.getElementById('root').classList.contains('popup-shown')) {
      camera.fov = Math.max(23, Math.min(camera.fov + deltaY * 0.005, 100))
      camera.updateProjectionMatrix()
    }
  }, [])

  // touch events on mobile
  const deltaStart = useRef(null)
  const fovStart = useRef(null)
  const onTouchMove = useCallback(e => {
    if (e.touches.length > 1) {
      setEnableRotate(false)
      const point0 = new THREE.Vector2(e.touches[0].clientX, e.touches[0].clientY)
      const point1 = new THREE.Vector2(e.touches[1].clientX, e.touches[1].clientY)
      const delta = point0.distanceTo(point1)
      if (deltaStart.current == null) {
        deltaStart.current = delta
        fovStart.current = camera.fov
      }
      else {
        camera.fov = Math.max(23, Math.min(fovStart.current * deltaStart.current / delta, 100))
        camera.updateProjectionMatrix()
      }
    }
  }, [])

  const onTouchEnd = useCallback(e => {
    setEnableRotate(true)
    deltaStart.current = null
    fovStart.current = null
  }, [])

  useFrame(() => {
    if (keyRef.current.ArrowLeft) 
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.01)
    else if (keyRef.current.ArrowRight) 
      camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.01)

    if ( (keyRef.current.ArrowUp && camera.position.y > -0.0995) || (keyRef.current.ArrowDown && camera.position.y < 0.0995) ) {
      let axis = new THREE.Vector3
      axis.copy(camera.position).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.5)
      axis.y = 0
      axis.normalize()

      if (keyRef.current.ArrowUp) 
        camera.position.applyAxisAngle(axis, 0.01)
      else if (keyRef.current.ArrowDown) 
        camera.position.applyAxisAngle(axis, -0.01)
    }
    controlsRef.current.update()
  })

  return null
}

const Locations = ({ setTargetToLookAt }) => {

  const scenes = useSelector(state => state.scenes)
  const currentSceneId = scenes.currentLayer == 0 ? scenes.layer0Id : scenes.layer1Id
  const threeDItems = useSelector(state => state.threeDItems.data)

  const locations = Object.entries(threeDItems).map(
    ([id, data]) => ({ id, ...data })).filter(x => x.scene == currentSceneId && (x.type == 'location' || (x.type == 'link' && x.target) ) 
  ).sort(function(a, b) {
    if (b.type == 'link' && a.type == 'location') return -1
    if (a.type == 'link' && b.type == 'location') return 1
    return 0
  })

  const [currentIndex, setCurrentIndex] = useState(null)

  const LocationButton = ({ index, location }) => {

    const label = location.type == 'link' ? 
      '前往' + store.getState().scenes.data[location.target].name 
    : location.type == 'location' ? 
      '移動至' + location.text
      :
        ''

    const goToLocation = () => {
      if (location.type == 'link') {
        setCurrentIndex(null);
        store.dispatch({ type: 'CHANGE_SCENE_WITHOUT_TRANSITION', id: location.target, cameraPosition: location.cameraPosition ?? null  })
      }
      if (location.type == 'location') {
        setCurrentIndex(index);
        setTargetToLookAt(location.position)
      }
    }

    return (
      <button className="location-button tab-item" tabIndex={2} aria-label={label} onClick={goToLocation}/>
    )
  }

  return (
    <>
      {locations
        .map((location, index) => <LocationButton location={location} index={index} />)
        .filter((_, index) => index != currentIndex)
      }
    </>
  )
}

const Scene = ({ layer, baseImage, items, isAdmin }) => {

  if (!isAdmin)
    items = items.filter(item => item.type != 'location')

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

const LookAtPosition = ({ targetToLookAt, setTargetToLookAt, controlsRef }) => {

  const cameraPosition = useMemo(() => {
    if (targetToLookAt) {
      const pos = new THREE.Vector3(0, 0, 0)
      const target = new THREE.Vector3().fromArray(targetToLookAt)
      const dir = new THREE.Vector3()
      dir.subVectors(pos, target).normalize()
      pos.add(dir.multiplyScalar(0.1))
      return pos
    }
    return null
  }, [targetToLookAt])

  useFrame((state) => {
    if (cameraPosition) {
      state.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
      controlsRef.current.update()
      setTargetToLookAt(null)
    }
  })

  return null
}

export default function ThreeCanvas() {

  const canvasRef = useRef()
  const keyRef = useRef({})

  const config = useSelector(state => state.config)
  const scenes = useSelector(state => state.scenes)
  const threeDItems = useSelector(state => state.threeDItems.data)
  const isSetTargetOn = useSelector(state => state.setTarget.isOn)
  const controlsRef = useRef()

  const [enableRotate, setEnableRotate] = useState(true)

  // const currentScene = scenes.data[scenes.currentLayer == 0 ? scenes.layer0Id : scenes.layer1Id]

  // useEffect(() => {
  //   canvasRef.current.setAttribute('tabIndex', 0)
  //   canvasRef.current.setAttribute("role", "img")
  // }, [])

  // useEffect(() => {
  //   canvasRef.current.setAttribute('aria-label', currentScene?.name ?? '')
  // }, [currentScene])

  const [targetToLookAt, setTargetToLookAt] = useState(null)

  return (
    <>
      <ThreeLoader/>   
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 0.1], fov: 72 }}
        resize={{ polyfill: ResizeObserver }}
        ref={canvasRef}
      >
        <Setup controlsRef={controlsRef} keyRef={keyRef} setEnableRotate={setEnableRotate} />
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
        <OrbitControls ref={controlsRef} enableRotate={enableRotate && !scenes.isTransitioning} enableZoom={false} enablePan={false} enableDamping dampingFactor={0.2} autoRotate={false} rotateSpeed={-0.2} /> 
        {config.mode == 'admin' && !scenes.isTransitioning && !isSetTargetOn && <Menu/>}
        {config.mode != 'admin' && <LookAtPosition targetToLookAt={targetToLookAt} setTargetToLookAt={setTargetToLookAt} controlsRef={controlsRef} />}
      </Canvas>
      {config.mode != 'admin' && <Locations setTargetToLookAt={setTargetToLookAt} />}
    </>
  )
}
