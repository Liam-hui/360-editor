import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'connected-react-router';
import thunkMiddleware from 'redux-thunk';

import history from '@/routes/history';

import rootReducer from './ducks';
import sagas from './sagas';

const sagaMiddleware = createSagaMiddleware();
const middlewares = [
  sagaMiddleware,
  thunkMiddleware,
  routerMiddleware(history),
];

const store = createStore(
  rootReducer(history),
  compose(applyMiddleware(...middlewares)),
);

sagaMiddleware.run(sagas);

export default store;
