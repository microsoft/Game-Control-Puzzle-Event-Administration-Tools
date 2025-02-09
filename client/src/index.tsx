import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from './store';
import './index.css';
import App from './components/App';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';
import './theme/theme.scss';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
    <Provider store={store}>
        <Router>
            <App />
        </Router>
    </Provider>
);

unregisterServiceWorker();
