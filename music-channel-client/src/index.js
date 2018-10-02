import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import { ActionCableProvider } from 'react-actioncable-provider'
import { WS_URL } from "./components/RailsURL";


import './index.css';

import App from './components/App';
import 'semantic-ui-css/semantic.min.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <ActionCableProvider url={`${WS_URL}/cable`}>
    <Router>
      <App />
    </Router>
  </ActionCableProvider>
  , document.getElementById('root'));
registerServiceWorker();
