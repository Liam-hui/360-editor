import React from 'react';
import store from '@/store';
import { imagePath } from '@/utils/MyUtils';

const GreyBox = ({ children, style, innerStyle, close }) => {

  const closePopup = () => {
    store.dispatch({ type: 'HIDE_POPUP' }); 
  }

  return (
    <div className="grey-box" style={style}>
      {/* <div className="scroll-wrapper"> */}
        <div className="content-container" style={innerStyle}>
          {children}
        </div>
      {/* </div> */}
      <img onClick={close?? closePopup} className="close-button pointer" src={imagePath('icon-close.png')}/>
    </div>
  )
}

export default GreyBox;



