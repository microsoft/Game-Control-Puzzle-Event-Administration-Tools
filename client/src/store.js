import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import thunk from 'redux-thunk'
import createHistory from 'history/createBrowserHistory'
import rootReducer from './modules'
import createSignalMiddleware from './modules/signalr/middleware'
export const history = createHistory()

const enhancers = [] 
const middleware = [
    thunk,
    routerMiddleware(history),
    createSignalMiddleware(history)
]

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsCreators, serialize...
    }) : compose;

const enhancer = composeEnhancers(
    applyMiddleware(...middleware),
    ...enhancers
);

export default createStore(
    rootReducer,
    enhancer
)