import React from 'react';
import store from '@/store';
import { useSelector } from "react-redux";
import { camera } from '@/components/Panorama'

import GreyBox from '@/components/GreyBox';

const SetTarget = () => {

  const setTargetMode = useSelector(state => state.setTargetMode);

  const confirmSet = () => {
    store.dispatch({
      type: 'UPDATE_THREE_D_ITEM_REQUEST',
      id: setTargetMode.id,
      payload: {
        target: setTargetMode.targetScene,
        angle: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z
        },
      }
    })
    store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: setTargetMode.scene, angle: setTargetMode.prevAngle })
    store.dispatch({ type: 'SET_TARGET_FINISH' })
  }

  const cancelSet = () => {
    store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: setTargetMode.scene, angle: setTargetMode.prevAngle })
    store.dispatch({ type: 'SET_TARGET_FINISH' })
  }

  return (
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
}

export default SetTarget;




