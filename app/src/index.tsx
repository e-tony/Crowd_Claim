import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import AddWizard from './AddWizard';
import Dashboard from './Dashboard';
import * as serviceWorker from './serviceWorker';
import store from './store';

const defaultTheme = createMuiTheme({
  palette: {
    // type: 'dark',
  },
});

ReactDOM.render(
  <Router>
    <ReduxProvider store={store}>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Switch>
          <Route exact path="/">
            <Dashboard />
          </Route>
          <Route path="/add">
            <AddWizard />
          </Route>
        </Switch>
      </ThemeProvider>
    </ReduxProvider>
  </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
