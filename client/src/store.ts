import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import rootReducer from './modules';
import createSignalMiddleware from './modules/signalr/middleware';
export const history = createHistory();

const middleware = [thunk, routerMiddleware(history), createSignalMiddleware(history)];

const enhancer = compose(applyMiddleware(...middleware));

export default createStore(rootReducer, enhancer);
