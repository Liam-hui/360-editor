import React, { useState, useEffect } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";
import { Menu, MenuItem } from '@material-ui/core';
import { getElementStyle, limitPosition } from '@/components/Panorama'

const THREE = window.THREE;

const TRANSLATION_MAX = 800;
const ROTATION_MAX = 180;

const Slider = (props) => {

  const [value, setValue] = useState(0)

  const { style, update, onMouseDown } = props;

  const onChange = (e) => {
    setValue(e.target.value);
    update(e.target.value);
  }

  const onMouseUp = () => {
    setValue(0);
  }

  const offset = style?.width? 64 : 71;

  return(
    <div className='three-d-editor-slider' style={style}>
      <div className="three-d-editor-slider-track" style={{ transform: `scaleX(${value < 0 ? -1 : 1}) translateY(-50%)`}}>
        <div className="three-d-editor-slider-progress" style={{ width: `${Math.abs(value) * 0.5}%`}}/>
      </div>
      <div className="three-d-editor-slider-thumb" style={{ transform: `translateX(${offset * value / 100 - 8}px) translateY(-50%)`}}/>
      <input type="range" min="-100" max="100" value={value} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onChange={onChange}></input>
    </div>
  )
}

const ThreeDItem = (props) => {

  const { id, data } = props;
  const { object, type } = data;

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

  const closeEditor = () => {
    setIsEditorShown(false);
    const style = getElementStyle(object);
    if (style != null) setStyle(style);
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
        <div className="three-d-editor">

          <span>Translate:</span>
          <div className="row">
            <span className="three-d-editor-slider-label">x</span>
            <Slider 
              onMouseDown={() => setTemp('translate')}
              update={(value) => updateTranslate(value, 'x')} 
            />
          </div>
          <div className="row">
            <span className="three-d-editor-slider-label">y</span>
            <Slider 
              onMouseDown={() => setTemp('translate')}
              update={(value) => updateTranslate(value, 'y')} 
            />
          </div>
          <div className="row">
            <span className="three-d-editor-slider-label">z</span>
            <Slider 
              onMouseDown={() => setTemp('translate')}
              update={(value) => updateTranslate(value, 'z')} 
            />
          </div>

          <span>Rotate:</span>
          <div className="row">
            <span className="three-d-editor-slider-label">x</span>
            <Slider 
              onMouseDown={() => setTemp('rotate')}
              update={(value) => updateRotate(value, 'x')} 
            />
          </div>
          <div className="row">
            <span className="three-d-editor-slider-label">y</span>
            <Slider 
              onMouseDown={() => setTemp('rotate')}
              update={(value) => updateRotate(value, 'y')} 
            />
          </div>
          <div className="row">
            <span className="three-d-editor-slider-label">z</span>
            <Slider 
              onMouseDown={() => setTemp('rotate') }
              update={(value) => updateRotate(value, 'z')} 
            />
          </div>

          <span>Scale:</span>
          <div className="row">
            <span className="three-d-editor-slider-label" style={{ fontStyle: 'normal' }}>-</span>
            <Slider 
              style={{ width: 145 }}
              onMouseDown={() => setTemp('scale')}
              update={updateScale} 
            />
            <span className="three-d-editor-slider-label" style={{ fontStyle: 'normal', marginLeft: 8, marginRight: 0 }}>+</span>
          </div>

          {type == 'image' && 
            <div 
              className="border-box-small pointer"
              style={{ margin: '10px 0' }}
              onClick={() => {
                closeEditor();
                store.dispatch({
                  type: 'SHOW_POPUP' ,
                  mode: 'uploadImage',
                  payload: {
                    action: 'update3dImage',
                    id: id,
                  }
                }) 
              }} 
            >
              Edit Details
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
            className="closethree-d-editor-button material-icons"
            onClick={closeEditor} 
          >
            close
          </i>

        </div> 
      }

      { (isHighlighted || isHover) && !isEditorShown &&
        <div className="three-d-editor-buttonWrapper">

          <i 
            className="three-d-editor-button material-icons"
            onClick={() => {
              setIsHover(false);
              setIsEditorShown(true);
            }} 
          >
            edit
          </i>

          {/* <img src={require('@/assets/icons/icon-edit.svg').default}/> */}

          <i
            className="three-d-editor-button material-icons" 
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

