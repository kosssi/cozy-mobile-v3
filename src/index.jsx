import React from 'react';
import { render } from 'react-dom';
//import { Provider } from 'react-redux';
//import createStore from './stores/index.js';
//import reducer from './reducers/index.js';
import App from './components/App.jsx';
import Home from './components/Home.jsx';
import { Router, Route, createMemoryHistory } from 'react-router';
import PouchDB from 'pouchdb';

import './styles/index.css';

const history = createMemoryHistory('/');

//var store = createStore(reducer);

document.addEventListener('deviceready', () => {
  render(
//    <Provider store={store}>
      <Router history={history}>
        <Route component={App}>
          <Route path="/" component={Home}/>
        </Route>
      </Router>,
//    </Provider>,
    document.getElementById('root')
  );

}, false);

document.addEventListener('deviceready', () => {
  if (device.platform === 'iOS') {
    let Fetcher = window.BackgroundFetch;

    let fetchCallback = function() {
      console.log('[js] BackgroundFetch initiated');

      var PouchDB = require('pouchdb');
      let database = new PouchDB('local', {adapter: 'websql', location: 'default'});
      database.get('counter', (err, doc) => {
        if (err) {
          doc = {
            _id: 'counter',
            ios: 0
          }
        }
        doc.ios++;
        database.put(doc, (err, doc) => {
          console.log(err, doc);
          console.log('service finish');
          Fetcher.finish();
        });
      })
    };

    let failureCallback = function(error) {
      return console.log('- BackgroundFetch failed', error);
    };

    Fetcher.configure(fetchCallback, failureCallback, {
      stopOnTerminate: false
    });

    Fetcher.configure(fetchCallback, failureCallback, {
      stopOnTerminate: false
    });
  }
}, false);
