import React, { useEffect, useRef, useMemo } from 'react'
import store from '@/store'
import * as THREE from 'three'
import { useSpring } from 'react-spring'
import { easeQuadInOut } from "d3-ease"
import { useThree, useFrame, extend } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

import TransitionShader from '@/shaders/TransitionShader'
import MixShader from '@/shaders/MixShader'

extend({ EffectComposer, RenderPass, ShaderPass })

const Effects = ({ scenes, controlsRef }) => {

  const { gl, scene, camera, size, set, isTransitioning } = useThree()
  const composer = useRef()
  const transitionComposer = useRef()
  const transitionRenderTarget = useMemo(() => new THREE.WebGLRenderTarget(), [])
  const mixRef = useRef()

  useEffect(() => {
    composer.current.setSize(size.width, size.height)
    transitionComposer.current.setSize(size.width, size.height)
  }, [size])

  const [{ progress }, progressApi] = useSpring(() => ({ 
    progress: 0,
    config: { easing: easeQuadInOut, duration: 1000 }
  }))
  
  let prevPosition = null
  let targetPosition = null
  useEffect(() => {
    if (scenes.isTransitioning) {
      progressApi({ progress: 1 })
      document.getElementById("root").style.cursor = "unset"

      const center = scenes.transitionCenter ?? new THREE.Vector2(0.5, 0.5)
      transitionComposer.current.passes[1].uniforms.center.value = center
      composer.current.passes[1].uniforms.center.value = center
      set({ isTransitioning: true })
    }
    else {
      set({ isTransitionRequested: false, isTransitioning: false, currentLayer: scenes.currentLayer, sceneId: scenes.currentLayer == 0 ? scenes.layer0Id : scenes.layer1Id })

      const position = scenes.cameraPosition ?? prevPosition
      if (position) camera.position.set(position[0], position[1], position[2])
      controlsRef.current.update()
      camera.layers.set(scenes.currentLayer)
      composer.current.passes[1].uniforms.progress.value = 0
      composer.current.passes[1].uniforms.zoom.value = 1

      progressApi.set({ progress: 0 })
      prevPosition = null
      targetPosition = null
    }
  }, [scenes.isTransitioning])

  // change scene without transition
  useEffect(() => {
    if (scenes.newCameraPosition) {
      camera.position.set(scenes.newCameraPosition[0], scenes.newCameraPosition[1], scenes.newCameraPosition[2])
      controlsRef.current.update()
    }
  }, [scenes.newCameraPosition])

  useFrame(() => {
    if (isTransitioning) {

      if (prevPosition == null) 
        prevPosition = camera.position.toArray()

      if (targetPosition == null)
        targetPosition = scenes.cameraPosition ?? prevPosition

      const progress_ = progress.get()
      if (progress_ < 1) {
        mixRef.current.uniforms.progress.value = progress_

        camera.layers.set(scenes.currentLayer == 0 ? 1 : 0)
        camera.position.set(targetPosition[0], targetPosition[1], targetPosition[2])
        controlsRef.current.update()
        transitionComposer.current.passes[1].uniforms.progress.value = 1 - progress_
        transitionComposer.current.render()

        camera.layers.set(scenes.currentLayer)
        camera.position.set(prevPosition[0], prevPosition[1], prevPosition[2])
        controlsRef.current.update()
        composer.current.passes[1].uniforms.progress.value = progress_
        if (scenes.transitionCenter) composer.current.passes[1].uniforms.zoom.value = 1 - progress_ * 0.4
        composer.current.render()
      }
      else {
        store.dispatch({ type: 'CHANGE_SCENE_FINISH' })
      }
    }
    else {
      composer.current.render()
    }
  }, 1)

  return (
    <>
      <effectComposer ref={transitionComposer} args={[gl, transitionRenderTarget]} renderToScreen={true}>
        <renderPass attachArray="passes" args={[scene, camera]} />
        <shaderPass attachArray="passes" args={[TransitionShader]} />
        <shaderPass attachArray="passes" args={[GammaCorrectionShader]} />
      </effectComposer>
      <effectComposer ref={composer} args={[gl]}>
        <renderPass attachArray="passes" args={[scene, camera]} />
        <shaderPass attachArray="passes" args={[TransitionShader]} />
        <shaderPass ref={mixRef} attachArray="passes" args={[MixShader]} uniforms-isMix-value={scenes.isTransitioning} uniforms-tAdd-value={transitionRenderTarget.texture} />
        <shaderPass attachArray="passes" args={[FXAAShader]} material-uniforms-resolution-value={[1 / size.width, 1 / size.height]} />
        <shaderPass attachArray="passes" args={[GammaCorrectionShader]} />
      </effectComposer>
    </>
  )
}

export default Effects
