import React from 'react';
import store from '@/store';
import { imagePath } from '@/utils/MyUtils';

const GreyBox = ({ children, style, innerStyle, close }) => {

  const closePopup = () => {
    store.dispatch({ type: 'HIDE_POPUP' }); 
  }

  return (
    <div className="grey-box" style={style}>
      <div className="content-container" style={innerStyle}>
        {children}
      </div>
      <button tabIndex={0} aria-label="關閉" role="button" onClick={close?? closePopup} className="close-button pointer" >
        <img alt="關閉" src={imagePath('icon-close.png')}/>
      </button>
    </div>
  )
}

export default GreyBox;



