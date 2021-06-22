import React from 'react';
import store from '@/store';
import { useSelector } from "react-redux";
import api from '@/services/api';
import { camera } from '@/components/Panorama'

const ControlBar = () => {

  const scenes = useSelector(state => state.scenes);
  const threeDItems = useSelector(state => state.threeDItems.data);
  // const twoDItems = useSelector(state => state.twoDItems.data);

  const setCameraAngle = () => {    
    store.dispatch({
      type: 'SET_CAMERA_ANGLE',
      id: scenes.currentId,
      angle: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      },
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
        angle: item.angle,
        ... scenes.firstSceneId == id && { isFirst: true }
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
          target: item.target 
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

  return (

    <div className="control-bar">

      {
        Object.keys(scenes.data).map( 
          (sceneId, index) => 
            <i 
              className='control-bar-button fas fa-circle' 
              style={
                sceneId == scenes.currentId ?
                  { fontSize: 16 }
                :
                  { fontSize: 10, opacity: 0.8 }
               }
              onClick={() => goToScene(sceneId)}
            /> 
        )
      }
      <i className='control-bar-button fas fa-camera' style={{ '--tipText': "'Set Camera Position'" }} onClick={setCameraAngle}/>
      <i className='control-bar-button fas fa-trash' style={{ '--tipText': "'Delete Scene'", fontSize: 27 }} onClick={removeScene}/>
      <i className='control-bar-button fas fa-plus' style={{ '--tipText': "'Add Scene'" }} onClick={addNewScene}/>
      <i className='control-bar-button fas fa-save' style={{ '--tipText': "'Save'" }} onClick={handleSave}/>

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

