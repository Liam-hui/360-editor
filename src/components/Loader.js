import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";

const Loader = () => {

  const loader = useSelector(state => state.loader);
  const [isHidden, setIsHidden] = useState(true)

  useEffect(() => {
    if (loader.isShown)
      setIsHidden(false)
    else
      setTimeout(
        () => setIsHidden(true)
      , 500)

  }, [loader.isShown])

  if (isHidden) 
    return null
  else return (
    <div className={`loader-container ${loader.isShown ? 'is-shown' : ''}`}>
      <div className="loader center-absolute"><div></div><div></div><div></div><div></div></div>
    </div>
  )

}

export default Loader;




