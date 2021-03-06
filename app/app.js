import React from 'react';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './store/configureStore';
import registerInterceptor from './interceptor';
import { makeRoutes } from './routes';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);
const unRegisterInterceptor = registerInterceptor(store, history);

class App extends React.Component {
  render () {
    return (<Provider store={store}>
      <Router children={makeRoutes(store)} history={history} />
    </Provider>)
  }
}

export default App;