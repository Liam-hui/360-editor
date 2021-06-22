import React from 'react';
import store from '@/store';
import { useSelector } from "react-redux";
import api from '@/services/api';
import { camera } from '@/components/Panorama'
import { imagePath } from '@/utils/MyUtils';

const ControlBar = () => {

  const config = useSelector(state => state.config);
  const scenes = useSelector(state => state.scenes);
  const threeDItems = useSelector(state => state.threeDItems.data);
  const setTargetMode = useSelector(state => state.setTargetMode);

  const setFirstScene = () => { 
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'showWarning',
      payload: {
        text: 'Do you want to set this scene as the first scene, and current camera angle as the default angle？',
        confirm: () => store.dispatch({
          type: 'SET_FIRST_SCENE',
          id: scenes.currentId,
          angle: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
          },
        }) 
      }
    })    
  }

  const goToScene = ( id ) => {
    store.dispatch({ type: 'CHANGE_SCENE_REQUEST', id: id })
  }

  const addNewScene = () => {
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'uploadImage',
      payload: {
        action: 'addScene', 
      }
    }) 
  }

  const removeScene = () => {
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'showWarning',
      payload: {
        text: 'Are you sure you want to delete this scene？',
        confirm: () => store.dispatch({ type: 'REMOVE_SCENE_REQUEST', id: scenes.currentId }) 
      }
    }) 
  }

  const handleSave = () => {

    let data = {
      scenes: { ...scenes.data },
      threeDItems: { ...threeDItems },
      // twoDItems: { ...twoDItems }
    };

    for (const id in data.scenes) {
      const item = { ...data.scenes[id] };

      data.scenes[id] = {
        baseImage: item.baseImage,
        ... scenes.firstSceneId == id && { 
          isFirst: true,
          angle: item.angle,
        }
      }
    }

    for (const id in data.threeDItems) {
      const item = { ...data.threeDItems[id] };

      data.threeDItems[id] = {
        scene: item.scene,
        type: item.type,
        url: item.url,
        width: item.width,
        height: item.height,
        position: item.object.position,
        rotation: {
          x: item.object.rotation.x,
          y: item.object.rotation.y,
          z: item.object.rotation.z
        },
        scale: item.object.scale.x,
        ... item.type == 'link' && { 
          target: item.target,
          angle: item.angle,
        },
        ... item.type == 'image' && { 
          images: item.images
        },
        ... (item.type == 'image' || item.type == 'video' ) && { 
          title: item.title,
          description: item.description,
          link: item.link,
        }
      }
    }

    // for (const id in data.twoDItems) {
    //   const item = { ...data.twoDItems[id] };
  
    //   data.twoDItems[id] = {
    //     ...data.twoDItems[id],
    //     position: item.object.position,
    //   }

    //   delete data.twoDItems[id].object;
    // }

    let body = new FormData();
    body.append('uuid', window.uuid);
    body.append('user', window.user);
    body.append('name', window.name);
    body.append('data', JSON.stringify(data) );
    api.post(
      'scenes/save', 
      body
    )
      .then( (response) => {
        // console.log(response.data);
        store.dispatch({
          type: 'SHOW_POPUP' ,
          mode: 'showMessage',
          payload: {
            text: 'Save Success!', 
          }
        }) 
      }, (error) => {
        console.error(error);
        store.dispatch({
          type: 'SHOW_POPUP' ,
          mode: 'showMessage',
          payload: {
            text: 'Save Failed!', 
          }
        }) 
      });

    // console.log(data);
    // saveToLocalText(data);
  }

  if (config.mode != 'admin' || setTargetMode.isOn) return null
  else return (

    <div className="control-bar">

      {
        Object.keys(scenes.data).map( 
          (sceneId, index) => 
            <img
              className='control-bar-button control-bar-circle' 
              src={imagePath('icon-circle.svg')}
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
        <img src={imagePath('icon-camera.svg')} />
      </div>

      <div className='control-bar-button' style={{ '--tipText': "'Delete Scene'", fontSize: 27 }} onClick={removeScene}>
        <img src={imagePath('icon-trash.svg')} />
      </div>

      <div className='control-bar-button' style={{ '--tipText': "'Add Scene'" }} onClick={addNewScene}>
        <img  src={imagePath('icon-plus.svg')} />
      </div>
      
      <div className='control-bar-button' style={{ '--tipText': "'Save'" }} onClick={handleSave}>
        <img src={imagePath('icon-save.svg')}  />
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

export default ControlBar;

