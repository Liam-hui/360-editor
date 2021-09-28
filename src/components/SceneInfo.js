import React, { useState } from 'react'
import { useSelector } from "react-redux"
import { imagePath } from '@/utils/MyUtils'

const SceneInfo = () => {

  const [isOpened, setIsOpened] = useState(false)
  const scenes = useSelector(state => state.scenes)
  const currentScene = scenes.data[scenes.currentLayer == 0 ? scenes.layer0Id : scenes.layer1Id]

  return (
    <div className={`scene-info ${isOpened ? 'is-opened' : ''}`} >
      <div>
        <p {...isOpened && { tabIndex: 0 }} >{currentScene?.description?? ''}</p>
      </div>
      <button {...!isOpened && { tabIndex: 0 }} aria-hidden={isOpened} aria-label="場景資訊" className="info-button" onClick={() => setIsOpened(true)} >
        <img alt='場景資訊' src={imagePath('icon-info.svg')} /> 
      </button>
      <button {...isOpened && { tabIndex: 0 }} aria-hidden={!isOpened} aria-label="關閉場景資訊" className="close-button" onClick={() => setIsOpened(false)} >
        <img alt='關閉' src={imagePath('icon-close-black.svg')} /> 
      </button>
    </div> 
  )
}

export default SceneInfo


