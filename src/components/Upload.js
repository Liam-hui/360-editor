import React, { useState, useEffect } from 'react';
import store from '@/store';
import { uploadFile } from '@/utils/MyUtils'
import GreyBox from '@/components/GreyBox';

export const UploadImage = ({ data }) => {

  const { action, id } = data;

  const [images, setImages] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')

  useEffect(() => {
    if (action == 'update3dImage') {
      const item = store.getState().threeDItems.data[id]
      setImages(item.images)
      setTitle(item.title)
      setDescription(item.description)
      setLink(item.link)
    }
  }, [])

  const handleUploadImages = async (files) => {
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
              });
            };
            image.onerror = () => reject()
            image.src = src;
          })
        }
        
      };
  
      setImages(images.concat(newImages));
  
    } catch (error) {
      alert(error);
      console.log("Catch Error: ", error);
    } 
  }

  const removeImage = (index) => {
    setImages(images.filter( (_, index_) => index_ != index) );
  }

  const confirmUpload = async () => {
    let imagesData = [];
    for (const image of images.filter(x => x.file)) {
      try {
        const url = await uploadFile(image.file);
        const image_ = {
          ... image,
          url
        };
        delete image_.base64;
        delete image_.file;
  
        imagesData.push(image_)

      } catch(e) {
        imagesData = null;
        store.dispatch({
          type: 'SHOW_POPUP' ,
          mode: 'showMessage',
          payload: {
            text: 'Upload Image Failed!', 
          }
        }) 
      }
    }

    if (imagesData) {
      switch (action) {
        case 'add3dImage':
          store.dispatch({
            type: 'ADD_THREE_D_ITEM_REQUEST',
            payload: {
              type: 'image',
              position: data.position,
              images: imagesData,
              title: title,
              description: description,
              link: link
            }
          })
        break;
        case 'update3dImage':
          store.dispatch({
            type: 'UPDATE_THREE_D_ITEM_REQUEST',
            id: id,
            payload: {
              images: images.filter(x => !x.file).concat(imagesData),
              title: title,
              description: description,
              link: link
            }
          })
        break;
        case 'addScene':
          store.dispatch({
            type: 'ADD_SCENE_REQUEST',
            image: imagesData[0].url,
          })
        break;
      }

      
      store.dispatch({ type: 'HIDE_POPUP' }) 
    }
  }

  const [isDragOver, setIsDragOver] = useState(false)
  const onDrop = (e) => {
    e.preventDefault();
    handleUploadImages(e.dataTransfer.files);
    setIsDragOver(false)
  }

  const onDragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }

  return (
    <GreyBox>
      <div className="upload-container">
        {images.length == 0 ?
          <div 
            className={`border-box center-flex column ${isDragOver ? 'is-drag-over' : ''}`}
            onDrop={onDrop} 
            onDragOver={onDragOver}
            onDragEnter={() => setIsDragOver(true)}
            onDragLeave={() => setIsDragOver(false)}
            style={{ padding: 20 }}
          >
            <img src={require('@/assets/icons/icon-upload.svg').default}/>
            <div style={{ fontSize: '1.8em' }}>Drag and drop your files here</div>
            <div style={{ fontSize: '0.9em', color: '#CDCDCD' }}>Files supported: jpg, png</div>
            <div style={{ fontSize: '0.95em' }}>or</div>
            <label className="border-box-small">
              Browse files
              <input onChange={(e) => handleUploadImages(e.target.files)} type="file" id="upload-image" accept="image/*" multiple/>
            </label>
            <div className="overlay" style={{ opacity: isDragOver ? 0.6 : 0 }}/>
          </div>
        :
          <div className="display-images">
            {images.map( (image, index) => 
              <div className="image-wrapper">
                <img src={image.base64 ?? (window.cdn + image.url)}/>
                <div className='overlay'/>
                <img onClick={() => removeImage(index)} className='delete-button center-absolute' src={require('@/assets/icons/icon-delete.svg').default}/>
              </div>
            )}
            <div className="image-wrapper">
              <label className="border-box-small column center-flex" style={{ width: '100%', height: '100%', padding: 10}}>
                <img style={{ width: 40, height: 'auto', marginBottom: 12 }} src={require('@/assets/icons/icon-upload-file.svg').default}/>
                Upload more
                <input onChange={(e) => handleUploadImages(e.target.files)} type="file" id="upload-image" accept="image/*" multiple/>
              </label>
            </div>
          </div>
        }

        <div className="heading">Title</div>
        <input type="text" className="border-box" style={{ height: 40, padding: 15, borderRadius: 12 }} value={title} onChange={(e) => setTitle(e.target.value)}/>

        <div className="heading">Description</div>
        <textarea className="border-box" type="text" style={{ height: 100, padding: 15 }} value={description} onChange={(e) => setDescription(e.target.value)}/>

        <div className="heading">Direct link</div>
        <input type="text" className="border-box" style={{ height: 40, padding: 15, borderRadius: 12 }} value={link} onChange={(e) => setLink(e.target.value)}/>

        <div 
          className="border-box-small pointer" 
          style={{ alignSelf: 'center', marginTop: 20 }}
          onClick={confirmUpload}
        >
          {action == 'update3dImage' ? 'Confirm' : 'Upload'}
        </div>
      </div>
    </GreyBox>
  )

}

export const UploadVideo = ({ data }) => {

  const { action } = data;

  const [videoUrl, setVideoUrl] = useState(null);

  const handleUploadVideo = async (e) => {
    
    try {
      const url = await uploadFile( Array.from(e.target.files)[0] );
      setVideoUrl(url);
    } catch(e) {
      store.dispatch({
        type: 'SHOW_POPUP' ,
        mode: 'showMessage',
        payload: {
          text: 'Upload Video Failed!', 
        }
      }) 
    }

  }

  return (
    <div className="popup-container">
      
    </div>
  )

  // return (
  //   <>
  //     <div className="popup-title">{`UPLOAD VIDEO`}</div>

  //     {videoUrl && 
  //       <video width="320" height="240" autoPlay muted>
  //         <source src={window.cdn + videoUrl} type="video/mp4"></source>
  //       </video>
  //     }

  //     <div className='row'>

  //       {!videoUrl ? 
  //         <label
  //           htmlFor="upload-video"
  //           className="colored-button popup-button center-flex"
  //         >
  //           SELECT VIDEO
  //         </label>
  //       :
  //         <div
  //           className="colored-button popup-button center-flex"
  //           onClick={ async() => {

  //             switch (action) {

  //               case 'add3dVideo':
  //                 store.dispatch({
  //                   type: 'ADD_THREE_D_ITEM_REQUEST',
  //                   payload: {
  //                     type: 'video',
  //                     position: data.position,
  //                     videoUrl
  //                   }
  //                 })
  //               break;

  //               case 'change3dVideo':
  //                 store.dispatch({
  //                   type: 'UPDATE_THREE_D_ITEM_REQUEST',
  //                   id: data.id,
  //                   payload: {
  //                     video: videoUrl
  //                   }
  //                 })
  //               break;

  //             }

  //             store.dispatch({type: 'HIDE_POPUP'}) 
  //           }} 
  //         >
  //           CONFIRM
  //         </div>
  //       }

  //       <div 
  //         className="colored-button popup-button center-flex"
  //         onClick={ () => 
  //           store.dispatch({type: 'HIDE_POPUP'}) 
  //         } 
  //       >
  //         CANCEL
  //       </div>

  //     </div>

  //     <input onChange={(e) => handleUploadVideo(e)} type="file" id="upload-video" accept="video/*"/>

  //   </>
  // )
}




