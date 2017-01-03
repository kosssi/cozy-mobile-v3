import React from 'react';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import Badge from 'material-ui/Badge';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import PouchDB from 'pouchdb';

var Home = React.createClass({
  getInitialState() {
    let _this = this;
    let database = new PouchDB('local', {adapter: 'websql', location: 'default'});

    return {
      database: database,
      counter: 0,
      ios: 0
    }
  },
  getCounterFromDatabase(callback) {
    this.state.database.get('counter', callback);
  },
  setCounterOnDatabase(counter, callback) {
    let _this = this;
    this.getCounterFromDatabase((err, doc) => {
      if (err) {
        doc = {
          _id: 'counter',
          counter: 0
        }
      }
      doc.counter++;
      _this.state.database.put(doc, callback);
    })
  },
  increment() {
    let counter = this.state.counter + 1;
    this.setCounterOnDatabase(counter, (err, doc) => {
      console.log(err, doc);
    });
    this.setState({counter: counter});
  },
  componentWillMount() {
    let _this = this;
    this.getCounterFromDatabase((err, doc) => {
      if (err) { return console.log(err); }
      if (doc.counter !== undefined) {
        _this.setState({counter: doc.counter});
      }
    });
    this.getCounterFromDatabase((err, doc) => {
      if (err) { return console.log(err); }
      if (doc.ios !== undefined) {
        _this.setState({ios: doc.ios});
      }
    });
  },
  render() {
    return (
      <div>
        <AppBar
          title="Cozy"
          iconClassNameRight="muidocs-icon-navigation-expand-more"
        />
        <Badge badgeContent={this.state.counter} primary={true}>
          <NotificationsIcon />
        </Badge>
        <Badge badgeContent={this.state.ios} primary={true}>
          <ActionGrade />
        </Badge>
        <RaisedButton label="Increment" primary={true} onClick={this.increment} />
      </div>
    );
  }
})

export default Home;
