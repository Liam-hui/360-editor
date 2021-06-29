import React from 'react'
import { useSelector } from "react-redux"

import LightBox from '@/components/LightBox'

const Loader = () => {

  const loader = useSelector(state => state.loader)

  return (
    <LightBox isVisible={loader.isShown}>
      <div className="loader"><div></div><div></div><div></div><div></div></div>
    </LightBox>
  )

}

export default Loader




