import React, { useState, useEffect, useImperativeHandle } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import { viewer, getElementStyle, createObject } from '@/components/Panorama'


const Menu = React.forwardRef( ( props, ref ) => {

  const [ object, setObject ] = useState( null );
  const [ style, setStyle ] = useState( {} );

  const currentSceneId = useSelector( state => state.scenes.currentId );
  const panorama = useSelector( state => state.scenes.data[ currentSceneId ]?.panorama );

  useImperativeHandle( ref, () => ( {
    show: () => {
      const object = createObject( viewer.getPosition() );

      panorama.add( object );

      const newStyle = getElementStyle( object );
      if ( newStyle != null ) {
        setStyle(newStyle)
      }

      setObject(object);
    },
    hide: () => {
      if ( object != null ) {
        panorama.remove( object );
        setObject( null );
      }
    }
  } ) );

  // update menu position
  const updateScene = useSelector( state => state.updateScene );
  useEffect( () => {
    if ( object != null ) {
      const newStyle = getElementStyle( object );
      if ( newStyle != null ) 
        setStyle( newStyle );
    }
  }, [ updateScene ] );


  const Option = ( { label, onClick } ) => {
    return (
      <div  
        className="option border-box-small animate center-flex" 
        onClick={ () => {
          onClick();
          ref.current.hide();
        } }
      >
        { label }
      </div>
    )
  }

  return (
    <>
      {object != null && 
        <div className="menu-wrapper" style={style}>

          <i 
            className='far fa-dot-circle' 
            style={{ fontSize: 15, color: '#black' }}
          />

          <div className="menu-container">

            <Option
              label='Add Image'
              onClick={() => {
                store.dispatch({
                  type: 'SHOW_POPUP' ,
                  mode: 'uploadImage',
                  payload: {
                    action: 'add3dImage', 
                    position: object.position,
                  }
                }) 
              }}
            />

            <Option
              label='Add Video'
              onClick={() => {
                store.dispatch( {
                  type: 'SHOW_POPUP' ,
                  mode: 'uploadVideo',
                  payload: {
                    action: 'add3dVideo', 
                    position: object.position,
                  }
                }) 
              }}
            />

            <Option
              label='Link to other scene'
              onClick={() => {
                store.dispatch({
                  type: 'ADD_THREE_D_ITEM_REQUEST',
                  payload: {
                    type: 'link',
                    position: object.position,
                  }
                })
              }}
            />

            {/* <Option
              label='ADD INFO'
              onClick={() => {
                store.dispatch( { 
                  type: 'ADD_TWO_D_ITEM_REQUEST', 
                  payload: {
                    type: 'info',
                    position: object.position
                  }
                })
              }}
            /> */}


          </div>
        </div>
      }
    </>
  )

})


export default React.memo(Menu);
