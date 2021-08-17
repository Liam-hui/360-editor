import React, { useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Menu, MenuItem } from '@material-ui/core'
import { imagePath, limitPosition, PANORAMA_SIZE } from '@/utils/MyUtils'
import store from '@/store'

import Image from './Image'
import Video from './Video'
import Link from './Link'

const TRANSLATION_MAX = 60
const ROTATION_STEP = 100

const Slider = (props) => {

  const [value, setValue] = useState(0)
  const { style, update, onMouseDown, onMouseUp } = props

  const onChange = (e) => {
    setValue(e.target.value)
    update(e.target.value)
  }

  const onMouseUp_ = () => {
    setValue(0)
    onMouseUp()
  }

  const offset = style?.width ? 64 : 71

  return(
    <div className='three-d-editor-slider' style={style}>
      <div className="three-d-editor-slider-track" style={{ transform: `scaleX(${value < 0 ? -1 : 1}) translateY(-50%)`}}>
        <div className="three-d-editor-slider-progress" style={{ width: `${Math.abs(value) * 0.5}%`}}/>
      </div>
      <div className="three-d-editor-slider-thumb" style={{ transform: `translateX(${offset * value / 100 - 8}px) translateY(-50%)`}}/>
      <input type="range" min="-100" max="100" value={value} onMouseDown={onMouseDown} onMouseUp={onMouseUp_} onChange={onChange}></input>
    </div>
  )
}

const Editor = ({ object, close, updateItem, children }) => {

  const vec = new THREE.Vector3()
  const [tempValue, setTempValue] = useState(null)
  const setTemp = (mode) => {
    if (mode == 'translate') {
      vec.copy(object.position)
      setTempValue(vec)
    }
    else if (mode == 'rotate') {
      vec.copy(object.rotation)
      setTempValue(vec)
    }
    else if (mode == 'scale') {
      setTempValue(object.scale.x)
    }
  }

  const updateTranslate = (value, axis) => {
    const amount = value / 100 * TRANSLATION_MAX

    object.position.x = tempValue.x
    object.position.y = tempValue.y
    object.position.z = tempValue.z

    if (axis == 'x')
      object.translateX(amount)
    else if (axis == 'y')
      object.translateY(amount)
    else if (axis == 'z')
      object.translateZ(amount)
    
    const pos = limitPosition(object.position.toArray())
    object.position.copy(vec.fromArray(pos))
  }

  const updateRotate = (value, axis) => {
    const amount = value / 100 * ROTATION_STEP * Math.PI / 180

    object.rotation.x = tempValue.x
    object.rotation.y = tempValue.y
    object.rotation.z = tempValue.z

    if (axis == 'x')
      object.rotateX(amount)
    else if (axis == 'y')
      object.rotateY(amount)
    else if (axis == 'z')
      object.rotateZ(-amount)
  }

  const updateScale = (value) => { 
    const scale = tempValue * (1 + value / 100 * 0.5 )
    object.scale.set(
      scale,
      scale,
      1,
    )
  }

  return (
    <div className="three-d-editor">

      <span>Translate:</span>
      <div className="row">
        <span className="three-d-editor-slider-label">x</span>
        <Slider 
          onMouseDown={() => setTemp('translate')}
          onMouseUp={updateItem}
          update={(value) => updateTranslate(value, 'x')} 
        />
      </div>
      <div className="row">
        <span className="three-d-editor-slider-label">y</span>
        <Slider 
          onMouseDown={() => setTemp('translate')}
          onMouseUp={updateItem}
          update={(value) => updateTranslate(value, 'y')} 
        />
      </div>
      <div className="row">
        <span className="three-d-editor-slider-label">z</span>
        <Slider 
          onMouseDown={() => setTemp('translate')}
          onMouseUp={updateItem}
          update={(value) => updateTranslate(value, 'z')} 
        />
      </div>

      <span>Rotate:</span>
      <div className="row">
        <span className="three-d-editor-slider-label">x</span>
        <Slider 
          onMouseDown={() => setTemp('rotate')}
          onMouseUp={updateItem}
          update={(value) => updateRotate(value, 'x')} 
        />
      </div>
      <div className="row">
        <span className="three-d-editor-slider-label">y</span>
        <Slider 
          onMouseDown={() => setTemp('rotate')}
          onMouseUp={updateItem}
          update={(value) => updateRotate(value, 'y')} 
        />
      </div>
      <div className="row">
        <span className="three-d-editor-slider-label">z</span>
        <Slider 
          onMouseDown={() => setTemp('rotate') }
          onMouseUp={updateItem}
          update={(value) => updateRotate(value, 'z')} 
        />
      </div>

      <span>Scale:</span>
      <div className="row">
        <span className="three-d-editor-slider-label" style={{ fontStyle: 'normal' }}>-</span>
        <Slider 
          style={{ width: 145 }}
          onMouseUp={updateItem}
          onMouseDown={() => setTemp('scale')}
          update={updateScale} 
        />
        <span className="three-d-editor-slider-label" style={{ fontStyle: 'normal', marginLeft: 8, marginRight: 0 }}>+</span>
      </div>

      {children}

      <img 
        alt="Close Editor"
        className="three-d-editor-close-button"
        onClick={close} 
        src={imagePath('icon-close.png')}
      />

    </div>
  )
}

const SelectScene = ({ id, data, camera }) => {

  const { target, cameraPosition } = data
  const [anchorEl, setAnchorEl] = useState(null)
  
  const scenes = useMemo(() => {
    return store.getState().scenes
  }, [anchorEl])
  const sceneId = scenes.currentLayer == 0 ? scenes.layer0Id : scenes.layer1Id

  const onClick = (e) => {
    setAnchorEl(e.currentTarget)
  }

  const close = () => {
    setAnchorEl(null)
  }

  const selectTarget = (targetSelected) => {
    store.dispatch({
      type: 'SET_TARGET_START',
      payload: {
        id: id,
        scene: sceneId,
        targetScene: targetSelected,
        prevPosition: camera.position.toArray(),
      }
    }) 
    store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: targetSelected, cameraPosition: target == targetSelected ? cameraPosition : null })
    setAnchorEl(null)
  }

  return (
    <>
      <div 
        className="border-box-small pointer"
        style={{ margin: '10px 0' }}
        onClick={onClick} 
      >
        Select Target
      </div>

      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={close}
      >
        {Object.keys(scenes.data).map((id, index) => {
          if (id != sceneId ) return (
            <MenuItem 
              key={id}
              style={{ fontWeight: id == target ? 'bold' : 'normal' }}
              onClick={() => selectTarget(id)}
            >
              {`Scene ${parseInt(index) + 1}`}
            </MenuItem>
          )
        }) }
      </Menu>
    </>
  )
}

const ThreeDItem = ({ id, type, data, layer, isAdmin }) => {

  const { camera, hovered, isTransitioning } = useThree()
  const isHover = hovered == id && !isTransitioning

  const { position, rotation, scale } = useMemo(() => {
    const data = store.getState().threeDItems.data[id]
    return {
      position: data.position,
      rotation: data.rotation,
      scale: data.scale
    }
  }, [])

  const meshRef = useRef()
  const editorRef = useRef()
  const [isEditorShown, setIsEditorShown] = useState(false)

  useEffect(() => {
    if (!rotation) {
      if (position[1] >= PANORAMA_SIZE) {
        meshRef.current.rotateX(Math.PI * 0.5)
      }
      else if (position[1] <= -PANORAMA_SIZE) {
        meshRef.current.rotateX(-Math.PI * 0.5)
      }
      else if (position[0] <= -PANORAMA_SIZE) {
        meshRef.current.rotateY(Math.PI * 0.5)
      }
      else if (position[0] >= PANORAMA_SIZE) {
        meshRef.current.rotateY(-Math.PI * 0.5)
      }
      else if (position[2] >= PANORAMA_SIZE) {
        meshRef.current.rotateY(Math.PI)
      }
      // else if (position[2] <= -PANORAMA_SIZE) {
      // }
    }
  } ,[])

  useEffect(() => {
    if (meshRef.current && editorRef.current) 
      editorRef.current.position.copy(meshRef.current.position)
  } ,[isEditorShown])

  const removeItem = () => {
    store.dispatch({ type: 'REMOVE_THREE_D_ITEM', id: id })
  }

  const updateItem = () => {
    store.dispatch({ 
      type: 'UPDATE_THREE_D_ITEM', 
      id: id, 
      data: {
        position: meshRef.current.position.toArray(),
        rotation: meshRef.current.rotation.toArray().slice(0, 3),
        scale: meshRef.current.scale.x
      } 
    })
  }

  const closeEditor = () => {
    setIsEditorShown(false)
  }

  const meshProps = {
    ref: meshRef,
    uid: id,
    name: 'threeDItem',
    position, 
    ...rotation && { rotation },
    scale,
    layers: layer
  }

  return (
    <>
      {type == 'image' &&
        <Image meshProps={meshProps} data={data} isHover={isHover} />
      }

      {type == 'video' &&
        <Video meshProps={meshProps} data={data} isHover={isHover} />
      }

      {type == 'link' &&
        <Link meshProps={meshProps} data={data} />
      }

      {isAdmin &&
        <mesh ref={editorRef} position={position} layers={layer}>
          <planeBufferGeometry args={[0.1, 0.1]}/>
          <meshBasicMaterial transparent opacity={0} />
          <Html>
            <div className="three-d-editor-wrapper center-flex" >
              {isHover && !isEditorShown && <>
                <img 
                  alt="Edit Item"
                  className="three-d-editor-button"
                  src={imagePath('icon-edit.svg')}
                  onClick={() => {
                    setIsEditorShown(true)
                  }} 
                />
                <img 
                  alt="Delete Item"
                  className="three-d-editor-button"
                  src={imagePath('icon-delete-circle.svg')}
                  onClick={removeItem} 
                />
              </>}
              {isEditorShown && !isTransitioning &&
                <Editor object={meshRef.current} close={closeEditor} updateItem={updateItem}>
                  {(type == 'image' || type == 'video') && 
                    <div 
                      className="border-box-small pointer"
                      style={{ margin: '10px 0' }}
                      onClick={() => {
                        closeEditor()
                        store.dispatch({
                          type: 'SHOW_POPUP' ,
                          mode: type == 'image' ? 'uploadImage' : 'uploadVideo',
                          data: {
                            action: 'updateItem',
                            id: id,
                          }
                        }) 
                      }} 
                    >
                      Edit Details
                    </div>
                  }
                  {type == 'link' && 
                    <SelectScene id={id} data={data} camera={camera} />
                  }
                </Editor>
              }
            </div>
          </Html>
        </mesh>
      }
    </>
  )
}

export default React.memo(ThreeDItem)
