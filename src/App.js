import React from 'react';
import { Provider } from 'react-redux';

import store from './store';

import Panorama from '@/components/Panorama';
import Popup from '@/components/Popup';
import Save from '@/components/Save';

import './style.css';
import './animate.css';

function App() {

  return (
    <Provider store={store}>
      <Panorama/>
      <Save/>
      <Popup/>
    </Provider>
  );

}

export default App;
