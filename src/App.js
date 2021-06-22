import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store';

import Panorama from '@/components/Panorama';
import Popup from '@/components/Popup';
import ControlBar from '@/components/ControlBar';
import Loader from '@/components/Loader';

import '@/styles/styles.css';

function App() {

  useEffect(() => {
    store.dispatch({ 
      type: 'SET_CONFIG', 
      payload: {
        mode: window.mode,
        functions: JSON.parse(window.allowed_function)
      } 
    })
  }, [])

  return (
    <Provider store={store}>
      <Panorama/>
      <ControlBar/>
      <Popup/>
      <Loader/>
    </Provider>
  );

}

export default App;
