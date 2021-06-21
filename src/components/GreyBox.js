import React from 'react';
import store from '@/store';
import { imagePath } from '@/utils/MyUtils';

const GreyBox = ({ children, style, innerStyle }) => {

  const closePopup = () => {
    store.dispatch({ type: 'HIDE_POPUP' }); 
  }

  return (
    <div className="grey-box" style={style}>
      <div className="scroll-wrapper">
        <div className="content-container" style={innerStyle}>
          {children}
        </div>
      </div>
      <img onClick={closePopup} className="close-button pointer" src={imagePath('icon-close.svg')}/>
    </div>
  )
}

export default GreyBox;



