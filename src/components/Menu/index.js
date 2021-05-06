import React, { useState, useEffect, useImperativeHandle } from 'react';
import store from '@/store';
import { useSelector } from "react-redux";

import './style.css';
import { panorama, viewer, getElementStyle } from '@/components/Panorama'

const THREE = window.THREE;

const DATA = [
  '3dImage',
  'image',
  'info',
]

const Menu = React.forwardRef( (props, ref) => {

  const updateScene = useSelector(state => state.updateScene);

  const [object, setObject] = useState(null);
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (object != null ) {
      const newStyle = getElementStyle(object);
      if (newStyle != null) setStyle(newStyle);
    }
  }, [updateScene]);

  useImperativeHandle(ref, () => ({
    show: () => {
      const material = new THREE.MeshStandardMaterial();
      const object = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
      const position = viewer.getPosition();
      object.position.copy( position );
      panorama.add( object );
      const newStyle = getElementStyle(object);
      if (newStyle != null) setStyle(newStyle)
      setObject(object);
    },
    hide: () => {
      if (object != null) {
        panorama.remove( object );
        setObject(null);
      }
    }
  }));

  const Button = ({type}) => {

    const label = {
      '3dImage': 'ADD 3D IMAGE',
      'image': 'ADD IMAGE',
      'info': 'ADD INFO',
    }[type]

    const onClick = () => {

      switch( type ) {
        case 'image':
          store.dispatch({
            type: 'SHOW_POPUP' ,
            mode: 'uploadImage',
            data: {
              action: 'addImage', 
              position: object.position,
            }
          }) 
          break;
        case '3dImage':
          store.dispatch({
            type: 'SHOW_POPUP' ,
            mode: 'uploadImage',
            data: {
              action: 'add3dImage', 
              position: object.position,
            }
          }) 
          break;
        case 'info':
          store.dispatch({
            type: 'ADD_INFO', 
            position: object.position
          })
          break;
      }

      ref.current.hide();
    }


    return (
      <div onClick={onClick} className="button centerFlex">{label}</div>
    )
  }

  return (
    <>
      {object != null && 
        <div id="menu" style={style}>
          <i className='far fa-dot-circle' style={{fontSize:15, color: '#5793fb'}}></i>
          <div id="menuContainer">
            {DATA.map(x => <Button type={x}/>)}
          </div>
        </div>
      }
    </>
  )

})


export default  React.memo(Menu);

