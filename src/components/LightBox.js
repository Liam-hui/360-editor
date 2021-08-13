import React, { useState, useEffect } from 'react';

const LightBox = ({ isVisible, children, close }) => {

  const [isHidden, setIsHidden] = useState(!isVisible)

  useEffect(() => {
    let loop;
    if (isVisible) 
      loop = setTimeout( () => setIsHidden(false), 0 );
    else 
      loop = setTimeout( () => setIsHidden(true), 500 );
    
    return () => {
      clearTimeout(loop);
    };
  }, [isVisible])

  if (isHidden) return null
  else return (
    <div className={`light-box ${isVisible ? 'is-visible' : ''}`}>
      <div onClick={close} className='dark-click-area'/>
      {children}
    </div>
  )

}

export default LightBox




