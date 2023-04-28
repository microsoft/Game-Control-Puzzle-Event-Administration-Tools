import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import store from './store'
import './index.css';
import App from './components/App';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';
import './theme/theme.scss';

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>, 
document.getElementById('root'));
unregisterServiceWorker();
