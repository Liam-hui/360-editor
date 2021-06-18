import React from 'react';

const GreyBox = ({ children, style, innerStyle }) => {

  return (
    <div className="grey-box" style={style}>
      <div className="scroll-wrapper">
        <div className="content-container" style={innerStyle}>
          {children}
        </div>
      </div>
      <img className="close-button" src={require('@/assets/icons/icon-close.svg').default}/>
    </div>
  )
}

export default GreyBox;



