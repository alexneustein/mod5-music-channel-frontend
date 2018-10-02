import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import { ActionCableProvider } from 'react-actioncable-provider'

import './index.css';

import App from './components/App';
import 'semantic-ui-css/semantic.min.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <ActionCableProvider url='ws://10.39.111.2:3001/cable'>
    <Router>
      <App />
    </Router>
  </ActionCableProvider>
  , document.getElementById('root'));
registerServiceWorker();
