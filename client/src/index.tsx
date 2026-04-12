import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, BrowserRouterProps } from 'react-router-dom';

import { queryClient } from './lib/queryClient';
import store from './store';
import './index.css';
import App from './components/App';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';
import './theme/theme.scss';

const routerProps: BrowserRouterProps = {};

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <QueryClientProvider client={queryClient}>
        {import.meta.env.DEV ? <ReactQueryDevtools /> : null}
        <Provider store={store}>
            <BrowserRouter {...routerProps}>
                <App />
            </BrowserRouter>
        </Provider>
    </QueryClientProvider>
);

unregisterServiceWorker();
