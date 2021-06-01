import React, { useState, useEffect } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import { Menu, MenuItem } from '@material-ui/core';

import './style.css';
import { getElementStyle, limitPosition } from '@/components/Panorama'

const THREE = window.THREE;

const TRANSLATION_MAX = 800;
const ROTATION_MAX = 180;

const Slider = (props) => {

  const [value, setValue] = useState(0)

  const { update, onMouseDown, label } = props;

  const onChange = (e) => {
    setValue(e.target.value);
    update(e.target.value);
  }

  const onMouseUp = () => {
    setValue(0);
  }

  return(
    <div className='slider'>
      <input type="range" min="-100" max="100" value={value} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onChange={onChange}></input>
      {label &&
        <div className='slider-thumb' style={{ transform: `translate(${71 * value / 100}px` }}>
          <div>
            {label.toUpperCase()}
          </div>
        </div>
      }
    </div>
  )
}

const ThreeDItem = (props) => {

  const { id, data } = props;
  const { object, type, slides } = data;

  const isHighlighted = useSelector(state => state.threeDItems.highlightedId == id);

  const [isHover, setIsHover] = useState(false);
  const [isEditorShown, setIsEditorShown] = useState(false);

  // update position
  const updateScene = useSelector(state => state.updateScene);
  const [style, setStyle] = useState({});
  useEffect(() => {
    if (object != null) {
      const style = getElementStyle(object);
      if (style != null) setStyle(style);
    }
  }, [updateScene]);

  const [tempValue, setTempValue] = useState(null);
  const setTemp = (mode) => {
    let v;

    if (mode == 'translate') {
      v = new THREE.Vector3();
      v.copy(object.position)
    }
    else if (mode == 'rotate') {
      v = new THREE.Vector3();
      v.copy(object.rotation)
    }
    else if (mode == 'scale') {
      v = object.scale.x;
    }
      
    setTempValue(v);
  }

  const updateTranslate = ( value, axis ) => {

    object.position.x = tempValue.x;
    object.position.y = tempValue.y;
    object.position.z = tempValue.z;

    const amount =  value / 100 * TRANSLATION_MAX;

    if ( axis == 'x' )
      object.translateX( amount );
    else if ( axis == 'y' )
      object.translateY( amount );
    else if ( axis == 'z' )
      object.translateZ( amount );   
      
    object.position.copy( limitPosition( object, object.position ) )
  }

  const updateRotate = ( value, axis ) => {

    object.rotation.x = tempValue.x;
    object.rotation.y = tempValue.y;
    object.rotation.z = tempValue.z;

    const amount =  value / 100 * ROTATION_MAX  * Math.PI/180;

    if ( axis == 'x' )
      object.rotateX( amount );
    else if ( axis == 'y' )
      object.rotateY( amount );
    else if ( axis == 'z' )
      object.rotateZ( - amount );  
  }

  const updateScale = ( value ) => {

    const scale = Math.max( 0.1, tempValue + value / 100 );

    object.scale.set(
      scale,
      scale,
      1,
    )
  }

  const deleteItem = () => {
    store.dispatch({
      type: 'SHOW_POPUP' ,
      mode: 'showWarning',
      payload: {
        text: 'Are you sure you want to delete this item？',
        confirm: () => store.dispatch({ type: 'REMOVE_THREE_D_ITEM_REQUEST', id: id })
      }
    }) 
  }

  return (
    <div 
      className="three-d-editor-wrapper center-flex" 
      style={{
        ...style,
        ... type == 'link' && { marginBottom: 100 }
      }}
      onMouseEnter={() => { if (!isEditorShown) setIsHover(true); }}
      onMouseLeave={() => setIsHover(false)}
    >

      {isEditorShown &&
        <div className="three-d-editor-container">

          <div className="three-d-editor-label">Translate:</div>
          <Slider 
            onMouseDown={() => setTemp('translate')}
            update={(value) => updateTranslate(value, 'x')} 
            label='x'
          />
          <Slider 
            onMouseDown={() => setTemp('translate')}
            update={(value) => updateTranslate(value, 'y')} 
            label='y'
          />
          <Slider 
            onMouseDown={() => setTemp('translate')}
            update={(value) => updateTranslate(value, 'z')} 
            label='z'
          />

          <div className="three-d-editor-label">Rotate:</div>
          <Slider 
            onMouseDown={() => setTemp('rotate')}
            update={(value) => updateRotate(value, 'x')} 
            label='x'
          />
          <Slider 
            onMouseDown={() => setTemp('rotate')}
            update={(value) => updateRotate(value, 'y')} 
            label='y'
          />
          <Slider 
            onMouseDown={() => setTemp('rotate') }
            update={(value) => updateRotate(value, 'z')} 
            label='z'
          />

          <div className="three-d-editor-label">Scale:</div>
          <Slider 
            onMouseDown={() => setTemp('scale')}
            update={updateScale} 
          />

          {(type == 'image' || type == 'link') && 
            <div 
              className="colored-button three-d-editor-large-button center-flex"
              onClick={() => 
                store.dispatch({
                  type: 'SHOW_POPUP' ,
                  mode: 'uploadImage',
                  payload: {
                    action: 'change3dImage', 
                    id: id,
                  }
                }) 
              } 
            >
              CHANGE IMAGE
            </div>
          }

          {type == 'video' && 
            <div 
              className="colored-button three-d-editor-large-button center-flex"
              onClick={() => 
                store.dispatch({
                  type: 'SHOW_POPUP' ,
                  mode: 'uploadVideo',
                  payload: {
                    action: 'change3dVideo', 
                    id: id,
                  }
                }) 
              } 
            >
              CHANGE VIDEO
            </div>
          }

          {type == 'link' && 
            <LinkSelectTarget id={id} scene={data.scene} currentTarget={data.target} />
          }

          <i 
            class="closethree-d-editor-button material-icons"
            onClick={() => {
              setIsEditorShown(false);
              const style = getElementStyle(object);
              if (style != null) setStyle(style);
            }} 
          >
            close
          </i>

        </div> 
      }

      { (isHighlighted || isHover) && !isEditorShown &&
        <div class="three-d-editor-buttonWrapper">

          <i 
            class="three-d-editor-button material-icons"
            onClick={() => {
              setIsHover(false);
              setIsEditorShown(true);
            }} 
          >
            edit
          </i>

          <i
            class="three-d-editor-button material-icons" 
            onClick={deleteItem} 
          >
            delete
          </i>

        </div>
      }

    </div>
  )

}

const LinkSelectTarget = ({ id, scene, currentTarget }) => {

  const scenes = useSelector(state => state.scenes.data);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectTarget = (targetId) => {
    store.dispatch({
      type: 'UPDATE_THREE_D_ITEM_REQUEST',
      id: id,
      payload: {
        target: targetId
      }
    })
    setAnchorEl(null);
  }

  return (
    <>
      <div 
        className="colored-button three-d-editor-large-button center-flex"
        onClick={handleClick} 
      >
        SELECT TARGET
      </div>

      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {Object.keys(scenes)
          .map(
            (id, index) => {
              if (id != scene) return (
                <MenuItem 
                  style={{ fontWeight: id == currentTarget ? 'bold' : 'normal' }}
                  onClick={() => selectTarget(id)}
                >
                  {`Scene ${parseInt(index) + 1}`}
                </MenuItem>
              )
            }
          )
        }
      </Menu>
    </>
  )
}

export default ThreeDItem;

