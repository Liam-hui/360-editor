import React, { useState, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import store from '@/store'
import { imagePath } from '@/utils/MyUtils'

import HtmlElement from './HtmlElement'

const SpotElement = ({ type, data }) => {

  const { id } = data
  const [text, setText] = useState(data.text)

  const [isOpened, setIsOpened] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const editInfo = () => {
    if (isEditing) {
      store.dispatch({
        type: 'UPDATE_THREE_D_ITEM',
        id: id,
        data: {
          text: text
        }
      })
    }
    setIsEditing(!isEditing)
  }

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const deleteInfo = () => {
    store.dispatch({ type: 'REMOVE_THREE_D_ITEM', id: id })
  }

  const inputRef = useRef()

  return (
    <div 
      className={`spot${isOpened ? ' is-opened' : ''}`} 
      onMouseEnter={() => setIsOpened(true)}
      onMouseLeave={() => setIsOpened(false)}
    >
      {isOpened &&
        <div>
          <textarea ref={inputRef} disabled={!isEditing} type="text" value={text} onChange={(e) => setText(e.target.value)}/>
          <div className="buttons-row">
            <button onClick={editInfo}>
              <img src={imagePath(isEditing ? 'icon-check.png' : 'icon-pencil.png')} />
            </button>
            <button onClick={deleteInfo}>
              <img src={imagePath('icon-trash.png')} />
            </button>
          </div>
        </div>
      }
      <button className="spot-button" aria-hidden={true} tabIndex={-1}
        onClick={() => setIsOpened(true)} 
      >
        <img alt={type == 'location' ? '位置圖示' : '資訊圖示'} src={imagePath(type == 'location' ? 'icon-location.svg' : 'icon-info.svg')} /> 
      </button>
    </div> 
  )
}

export default function Spot(props) {

  return (
    <HtmlElement
      position={props.meshProps.position}
      element={<SpotElement {...props} />}
    />
  )
}


