import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';

import store from './store';

import Panorama from '@/components/Panorama';
import Popup from '@/components/Popup';
import ControlBar from '@/components/ControlBar';
import Loader from '@/components/Loader';

import '@/styles/styles.css';
import './style.css';
import './animate.css';

function App() {

  const [mode, setMode] = useState('')

  useEffect(() => {
    setMode(window.mode)
  }, [])

  return (
    <Provider store={store}>
      <Panorama/>
      {mode == 'admin' && <ControlBar/>}
      <Popup/>
      <Loader/>
    </Provider>
  );

}

export default App;
