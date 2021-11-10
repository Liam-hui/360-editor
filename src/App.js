import React, { useEffect, useLayoutEffect } from 'react'
import { Provider, useSelector } from 'react-redux'
import store from './store'

import '@/styles/styles.css'

import ThreeCanvas from '@/components/ThreeCanvas'
import Popup from '@/components/Popup'
import Loader from '@/components/Loader'
import ControlBar from '@/components/ControlBar'
import SetTarget from '@/components/SetTarget'
import Info from '@/components/Info'
// import SceneInfo from '@/components/SceneInfo'

const App = () => {

  useLayoutEffect(() => {
    init()
  }, [])

  const init = () => {
    if (window.mode && window.data && window.allowed_function && window.host_url && window.cdn) {
      store.dispatch({ 
        type: 'SET_CONFIG', 
        payload: {
          mode: window.mode,
          functions: JSON.parse(window.allowed_function)
        } 
      })

      if (window.data.scenes) {
        store.dispatch({ type: 'INIT_SCENES', data: window.data.scenes })
      }
      if (window.data.threeDItems) {
        store.dispatch({ type: 'INIT_THREE_D_ITEMS', data: window.data.threeDItems })
      }
    }
    else {
      setTimeout(init, 200);
    }
  }

  return (
    <Provider store={store}>
      <Components/>
    </Provider>
  )
}

const Components = () => {

  const config = useSelector(state => state.config)

  return (
    <>
      <ThreeCanvas/>
      <Popup/>
      <Info/>
      {/* <SceneInfo/> */}
      {config.mode == 'admin' &&
        <>
          <ControlBar/>
          <Loader/>
          <SetTarget/>
        </>
      }
    </>
  )
}

export default App
