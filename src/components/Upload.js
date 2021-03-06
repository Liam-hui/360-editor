import React, { useState, useEffect } from 'react';
import store from '@/store';
import { uploadFile, imagePath } from '@/utils/MyUtils'
import GreyBox from '@/components/GreyBox';

const Upload = ({ mode, data }) => {

  const { action, id } = data
  const multiple = mode == 'image' && action != 'addScene'
  const accept = mode == 'image' ? 'image/jpeg, image/png' : 'video/mp4'

  const [images, setImages] = useState([])
  const [video, setVideo] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [warning, setWarning] = useState('')

  useEffect(() => {
    if (action == 'updateItem') {
      const item = store.getState().threeDItems.data[id]
      if (item.type == 'image')
        setImages(item.images)
      else  
        setVideo(item.url)
      setTitle(item.title)
      setDescription(item.description)
      setLink(item.link)
    }
    else if (action == 'editScene') {
      const scenes = store.getState().scenes
      const currentScene = scenes.data[scenes.currentLayer == 0 ? scenes.layer0Id : scenes.layer1Id]
      setTitle(currentScene.name)
      setImages([currentScene.baseImage])
    }
  }, [])

  useEffect(() => {
    setWarning('')
  }, [images, video])

  const removeImage = (index) => {
    setImages(images.filter( (_, index_) => index_ != index) )
  }

  const handleUploadImages = async (files, index) => {
    try {
      if (!files) return;
  
      let newImages = [];
      for (const [index, file] of Array.from(files).entries()) {
  
        if (file.type == "image/jpeg" || file.type =="image/png") {
          let image = await load(file);
          newImages = newImages.concat(
            {
              ...image,
              file
            }
          );
        }
  
        function load(file) {
          return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async function () {
              resolve( await loadImage(reader.result) );
            };
            reader.onerror = () => reject()
          })
        }
  
        function loadImage(src) {
          return new Promise((resolve, reject) => {
            let image = new Image();
            image.onload = function (){
              resolve({
                base64: src,
                width: this.width,
                height: this.height,
                text: '????????????'
              });
            };
            image.onerror = () => reject()
            image.src = src;
          })
        }
        
      };

      if (action == 'editScene') {
        setImages(newImages)
      }
      else if (index != undefined) {
        setImages(images.slice(0, index).concat(newImages).concat(images.slice(index, images.length)) )
      }
      else
        setImages(images.concat(newImages))
  
    } catch (error) {
      alert(error);
      console.log("Catch Error: ", error);
    } 
  }

  const handleUploadVideo = async (files) => {
    try {
      if (!files) return;

      if (files[0].type == 'video/mp4') {
        const video = await load(files[0])
    
        function load(file) {
          return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async function () {
              resolve({ 
                file: file,
                base64: reader.result 
              })
            }
            reader.onerror = () => reject()
          })
        }

        setVideo(video);
      }
  
    } catch (error) {
      alert(error);
      console.log("Catch Error: ", error);
    } 
  }

  const confirmUploadImages = async () => {

    if (images.length == 0)
      setWarning('Please upload image first!')

    else {
      let imagesData = []
      store.dispatch({ type: 'SHOW_LOADER' })

      for (const image of images) {
        if (image.file) 
          try {
            const url = await uploadFile(image.file);
            const image_ = {
              ...image,
              url
            };
            delete image_.base64;
            delete image_.file;
      
            imagesData.push(image_)

          } catch(e) {
            imagesData = null;
            store.dispatch({ type: 'HIDE_LOADER' })
            store.dispatch({
              type: 'SHOW_POPUP' ,
              mode: 'showMessage',
              payload: {
                text: 'Upload Image Failed!', 
              }
            }) 
          }
        else imagesData.push(image)
      }

      switch (action) {
        case 'addImage':
          store.dispatch({
            type: 'ADD_THREE_D_ITEM',
            data: {
              type: 'image',
              scene: store.getState().scenes.currentLayer == 0 ? store.getState().scenes.layer0Id : store.getState().scenes.layer1Id,
              position: data.position,
              images: imagesData,
              title: title,
              description: description,
              link: link
            }
          })
        break
        case 'updateItem':
          store.dispatch({
            type: 'UPDATE_THREE_D_ITEM',
            id: id,
            data: {
              images: imagesData,
              title: title,
              description: description,
              link: link
            }
          })
        break
        case 'addScene':
          store.dispatch({
            type: 'ADD_SCENE',
            name: title,
            baseImage: imagesData[0].url,
          })
        break
        case 'editScene':
          store.dispatch({
            type: 'UPDATE_SCENE',
            data: {
              name: title,
              baseImage: imagesData[0],
            }
          })
        break
      }
        
      store.dispatch({ type: 'HIDE_LOADER' })
      store.dispatch({ type: 'HIDE_POPUP' }) 
    }
  }
  
  const confirmUploadVideo = async () => {

    if (video == null)
      setWarning('Please upload video first!')

    else {
      try {
        store.dispatch({ type: 'SHOW_LOADER' })
        const videoUrl = video.file ? await uploadFile(video.file) : video

        switch (action) {
          case 'addVideo':
            store.dispatch({
              type: 'ADD_THREE_D_ITEM',
              data: {
                type: 'video',
                scene: store.getState().scenes.currentLayer == 0 ? store.getState().scenes.layer0Id : store.getState().scenes.layer1Id,
                position: data.position,
                url: videoUrl,
                title: title,
                description: description,
                link: link
              }
            })
          break;
          case 'updateItem':
            store.dispatch({
              type: 'UPDATE_THREE_D_ITEM',
              id: data.id,
              data: {
                url: videoUrl,
                title: title,
                description: description,
                link: link
              }
            })
          break;
        }

        store.dispatch({ type: 'HIDE_LOADER' })
        store.dispatch({ type: 'HIDE_POPUP' }) 
      } catch(e) {
        store.dispatch({ type: 'HIDE_LOADER' })
        store.dispatch({
          type: 'SHOW_POPUP' ,
          mode: 'showMessage',
          payload: {
            text: 'Upload Video Failed!', 
          }
        }) 
      }
    }
  }

  const handleUpload = mode == 'image' ? handleUploadImages : handleUploadVideo  
  const confirmUpload =  mode == 'image' ? confirmUploadImages : confirmUploadVideo

  const [isDragOver, setIsDragOver] = useState(false)
  const onDrop = (e) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
    setIsDragOver(false)
  }

  const onDragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }

  const updateImageText = (index, text) => {
    const images_ = images.slice();
    images[index].text = text;
    setImages(images_);
  }

  return (
    <GreyBox style={{ width: 580 }} innerStyle={{ padding: '35px 55px' }}>
      <div className="upload-container" style={(action == 'addScene' || action == 'editScene') ? { minHeight: 300 } : {}}>
        
        { ( (mode == 'image' && images.length == 0) || (mode == 'video' && video == null) ) &&
          <div 
            className={`border-box center-flex column ${isDragOver ? 'is-drag-over' : ''}`}
            onDrop={onDrop} 
            onDragOver={onDragOver}
            onDragEnter={() => setIsDragOver(true)}
            onDragLeave={() => setIsDragOver(false)}
            style={{ padding: 20 }}
          >
            <img src={imagePath('icon-upload.svg')}/>
            <span style={{ fontSize: '1.8em' }}>{`Drag and drop your ${mode == 'image' ? 'image' + (multiple? 's' : '') : 'video'} here`}</span>
            <span style={{ fontSize: '0.9em', color: '#CDCDCD' }}>{`Files supported: ${mode == 'image' ? 'jpg, png' : 'mp4'}`}</span>
            <span style={{ fontSize: '0.95em' }}>or</span>
            <label className="border-box-small">
              Browse files
              <input onChange={(e) => handleUpload(e.target.files)} type="file" id="upload-image" accept={accept} multiple={multiple}/>
            </label>
            <div className="overlay" style={{ opacity: isDragOver ? 0.6 : 0 }}/>
          </div>
        }

        {mode == 'image' && images.length > 0 && action != 'addScene' && action != 'editScene' &&
          <div className="images-container">
            {images.map( (image, index) => 
              <div className="image-item">
                <div className="image-wrapper">
                  <img src={image.base64 ?? (window.cdn + image.url)}/>
                  <div className='overlay'/>
                  <div className='center-absolute center-flex'>
                    <label className='image-button'>
                      <img style={{ width: '100%', height: '100%' }} src={imagePath('icon-add.svg')}/>
                      <input onChange={(e) => handleUpload(e.target.files, index)} type="file" id="upload-image" accept={accept} multiple={multiple}/>
                    </label>
                    <img onClick={() => removeImage(index)} className='image-button' src={imagePath('icon-delete.svg')}/>
                  </div>
                </div>
                <input type="text" className="border-box" value={image.text} onChange={(e) => updateImageText(index, e.target.value)}/>
              </div>
            )}
            {/* <div className="image-wrapper" style={{ justifySelf: 'flex-end' }}>
              <label className="border-box-small column center-flex" style={{ width: '100%', height: '100%', padding: 10}}>
                <img style={{ width: 40, height: 'auto', marginBottom: 12 }} src={require('@/assets/icons/icon-upload-file.svg').default}/>
                Upload more
                <input onChange={(e) => handleUpload(e.target.files)} type="file" id="upload-image" accept="image/*" multiple/>
              </label>
            </div> */}
          </div>
        }

        {mode == 'image' && images.length > 0 && action == 'addScene' &&
          <img className='scene-image-preview' src={images[0].base64} />
        }

        {action == 'editScene' &&
          <div className="uploaded-wrapper">
            <img src={images[0]?.base64 ?? window.cdn + images[0]} />
            <div className='overlay center-flex column'>
              <label
                className="border-box-small pointer" 
                style={{ margin: 10, pointerEvents: 'auto' }}
              >
                Select another image
                <input onChange={(e) => handleUpload(e.target.files)} type="file" id="upload-image" accept={accept}/>
              </label>
            </div>
          </div>
        }

        {mode == 'video' && video != null &&
          <div className="uploaded-wrapper">
            <video muted autoPlay playsInline src={video.base64 ?? (window.cdn + video)}/>
            <div className='overlay center-flex column'>
              <label
                className="border-box-small pointer" 
                style={{ margin: 10, pointerEvents: 'auto' }}
              >
                Select another video
                <input onChange={(e) => handleUpload(e.target.files)} type="file" id="upload-image" accept={accept}/>
              </label>
              {/* <div 
                className="border-box-small pointer" 
                style={{ margin: 10, pointerEvents: 'auto' }}
                onClick={() => setVideo(null)}
              >
                Delete this video
              </div> */}
            </div>
          </div>
        }

        {(action == 'addScene' || action == 'editScene') && 
          <>
            <div className="heading">Title</div>
            <input type="text" className="border-box" style={{ height: 40, padding: 15, borderRadius: 12 }} value={title} onChange={(e) => setTitle(e.target.value)}/>
           </>
        }

        {(action == 'addImage' || action == 'updateItem') && 
          <>
            <div className="heading">Title</div>
            <input type="text" className="border-box" style={{ height: 40, padding: 15, borderRadius: 12 }} value={title} onChange={(e) => setTitle(e.target.value)}/>

            <div className="heading">Description</div>
            <textarea className="border-box" type="text" style={{ height: 100, padding: 15 }} value={description} onChange={(e) => setDescription(e.target.value)}/>

            <div className="heading">Direct link</div>
            <input type="text" className="border-box" style={{ height: 40, padding: 15, borderRadius: 12 }} value={link} onChange={(e) => setLink(e.target.value)}/>
           </>
        }

        {warning != '' &&
          <div 
            className="warning-text" 
            style={{ alignSelf: 'center', marginTop: 20 }}
          >
            {warning}
          </div>
        }

        {action == 'editScene' &&
          <div 
            className="border-box-small pointer" 
            style={{ alignSelf: 'center', marginTop: 20 }}
            onClick={() => 
              store.dispatch({
                type: 'SHOW_POPUP' ,
                mode: 'showWarning',
                data: {
                  text: 'Do you want to set this scene as the first scene, and current camera angle as the default angle???',
                  confirm: () => store.dispatch({
                    type: 'SET_FIRST_SCENE',
                    cameraPosition: store.getState().camera.position.toArray()
                  }) 
                }
              })  
            }
          >
            {'Set as first scene'}
          </div>
        }

        <div 
          className="border-box-small pointer" 
          style={{ alignSelf: 'center', marginTop: 20 }}
          onClick={confirmUpload}
        >
          {(action == 'addScene' || action == "addImage") ? 'Upload' : 'Confirm'}
        </div>

      </div>

    </GreyBox>
  )

}

export default Upload




