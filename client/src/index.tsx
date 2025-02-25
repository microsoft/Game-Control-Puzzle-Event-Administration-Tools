import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, BrowserRouterProps } from 'react-router-dom';

import store from './store';
import './index.css';
import App from './components/App';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';
import './theme/theme.scss';

const routerProps: BrowserRouterProps = {};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <Provider store={store}>
        <BrowserRouter {...routerProps}>
            <App />
        </BrowserRouter>
    </Provider>
);

unregisterServiceWorker();
