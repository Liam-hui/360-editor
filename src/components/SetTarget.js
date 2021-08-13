import React from 'react'
import store from '@/store'
import { useSelector } from "react-redux"

import GreyBox from '@/components/GreyBox'

const SetTarget = () => {

  const { isOn, id, scene, targetScene, prevPosition }  = useSelector(state => state.setTarget)
  const camera = useSelector(state => state.camera)

  const confirmSet = () => {
    store.dispatch({
      type: 'UPDATE_THREE_D_ITEM',
      id: id,
      data: {
        target: targetScene,
        cameraPosition: camera.position.toArray()
      }
    })
    store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: scene, cameraPosition: prevPosition })
    store.dispatch({ type: 'SET_TARGET_FINISH' })
  }

  const cancelSet = () => {
    store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: scene, cameraPosition: prevPosition })
    store.dispatch({ type: 'SET_TARGET_FINISH' })
  }

  if (isOn) return (
    <div className='center-absolute' style={{ pointerEvents: 'auto'}} >
      <GreyBox close={cancelSet} style={{ width: 600 }} innerStyle={{ padding: '40px'}}>
        <div className="center-flex column">
          <div className="message-text">Select camera angle</div>
            <div 
              className="border-box-small pointer"
              style={{ margin: '2px 10px'}}
              onClick={confirmSet} 
            >
              Confirm
            </div>
          
        </div>

      </GreyBox>
    </div>
  )
  else return null
}

export default SetTarget