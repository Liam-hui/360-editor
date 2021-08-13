import React from 'react'
import store from '@/store'
import { useSelector } from "react-redux"
import api from '@/services/api'
import { imagePath } from '@/utils/MyUtils'

const ControlBar = () => {

  const camera = useSelector(state => state.camera)
  const scenes = useSelector(state => state.scenes)
  const threeDItems = useSelector(state => state.threeDItems.data)
  const setTarget = useSelector(state => state.setTarget)

  const sceneId = scenes.currentLayer == 0 ? scenes.layer0Id : scenes.layer1Id

  const setFirstScene = () => { 
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'showWarning',
      data: {
        text: 'Do you want to set this scene as the first scene, and current camera angle as the default angle？',
        confirm: () => store.dispatch({
          type: 'SET_FIRST_SCENE',
          id: sceneId,
          cameraPosition: camera.position.toArray()
        }) 
      }
    })  
  }

  const goToScene = (id) => {
    store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: id })
  }

  const addScene = () => {
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'uploadImage',
      data: {
        action: 'addScene', 
      }
    }) 
  }

  const removeScene = () => {
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'showWarning',
      data: {
        text: 'Are you sure you want to delete this scene？',
        confirm: () => store.dispatch({ type: 'REMOVE_SCENE', id: sceneId }) 
      }
    }) 
  }

  const handleSave = () => {

    const data = {
      scenes: { ...scenes.data },
      threeDItems: { ...threeDItems },
    }

    if (data.scenes[scenes.firstScene.id]) {
      data.scenes[scenes.firstScene.id].isFirst = true
      data.scenes[scenes.firstScene.id].cameraPosition = scenes.firstScene.cameraPosition
    }

    for (const id in data.threeDItems) {
        const item = { ...data.threeDItems[id] }
  
        if (!item.rotation)
          data.threeDItems[id].rotation = [0, 0, 0]
    }


    // let body = new FormData();
    // body.append('uuid', window.uuid);
    // body.append('user', window.user);
    // body.append('name', window.name);
    // body.append('data', JSON.stringify(data) );
    // api.post(
    //   'scenes/save', 
    //   body
    // )
    //   .then( (response) => {
    //     // console.log(response.data);
    //     store.dispatch({
    //       type: 'SHOW_POPUP' ,
    //       mode: 'showMessage',
    //       payload: {
    //         text: 'Save Success!', 
    //       }
    //     }) 
    //   }, (error) => {
    //     console.error(error);
    //     store.dispatch({
    //       type: 'SHOW_POPUP' ,
    //       mode: 'showMessage',
    //       payload: {
    //         text: 'Save Failed!', 
    //       }
    //     }) 
    //   });

    console.log(data)
    saveToLocalText(data)
  }

  return (
    <div className={`control-bar ${setTarget.isOn ? 'is-hidden' : ''}`}>

      {
        Object.keys(scenes.data).map( 
          (sceneId) => 
            <img
              key={sceneId}
              className='control-bar-button control-bar-circle' 
              src={imagePath('icon-circle.png')}
              style={
                sceneId == scenes.currentId ?
                  { width: 21, height: 21 }
                :
                  { width: 13, height: 13, opacity: 0.8 }
               }
              onClick={() => goToScene(sceneId)}
            /> 
        )
      }

      <div className='control-bar-button' style={{ '--tipText': "'Set First Scene'" }} onClick={setFirstScene}>
        <img src={imagePath('icon-camera.png')} />
      </div>

      <div className='control-bar-button' style={{ '--tipText': "'Delete Scene'", fontSize: 27 }} onClick={removeScene}>
        <img src={imagePath('icon-trash.png')} />
      </div>

      <div className='control-bar-button' style={{ '--tipText': "'Add Scene'" }} onClick={addScene}>
        <img  src={imagePath('icon-plus.png')} />
      </div>
      
      <div className='control-bar-button' style={{ '--tipText': "'Save'" }} onClick={handleSave}>
        <img src={imagePath('icon-save.png')}  />
      </div>

    </div>
  )
}



const saveToLocalText = ( data ) => {

  const a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( JSON.stringify(data, null, 2) ));
  a.setAttribute('download', 'data.json');
  a.click()

}

export default ControlBar

