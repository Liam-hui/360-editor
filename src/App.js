import React, { useEffect } from 'react'
import { Provider, useSelector } from 'react-redux'
import store from './store'

import '@/styles/styles.css'

import ThreeCanvas from '@/components/ThreeCanvas'
import Popup from '@/components/Popup'
import Loader from '@/components/Loader'
import ControlBar from '@/components/ControlBar'
import SetTarget from '@/components/SetTarget'
import Info from '@/components/Info'

const App = () => {

  useEffect(() => {
    store.dispatch({ 
      type: 'SET_CONFIG', 
      payload: {
        mode: window.mode,
        functions: JSON.parse(window.allowed_function)
      } 
    })

    const data = window.data
    if (data?.scenes) {
      store.dispatch({ type: 'INIT_SCENES', data: data.scenes })
    }
    if (data?.threeDItems) {
      store.dispatch({ type: 'INIT_THREE_D_ITEMS', data: data.threeDItems })
    }

  }, [])

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
