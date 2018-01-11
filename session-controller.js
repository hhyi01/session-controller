// SessionController
var uuid = require('uuid4'); 

var SessionController = function() {
  this.session = {};
  this.event = {}; // key: timestamp + timeout, timeout is in minutes
  this.sessionHistory = [];
};

SessionController.prototype.addEvent = function(event, timestamp) {
  // event object = { name: 'event name', timeout: 'duration in minutes or -1' }
  // keep track of added events in this.event
  var currentTime = this.setCurrentTime(timestamp);
  if (Object.keys(this.session).length !== 0) {
    this.validateSession(currentTime);
  } else {
    this.createSession(currentTime);
  } 
  if (this.event.hasOwnProperty(event.name)) {
    if (this.event[event.name] !== -1) {
      // if event name already exists and timeout !== -1, replace expiration
      this.event[event.name] = this.setExpiration(currentTime, event.timeout);
    }
  } else {
    // else add event and timeout to this.event
    if (event.timeout !== -1) {
      this.event[event.name] = this.setExpiration(currentTime, event.timeout);
    } else {
      this.event[event.name] = event.timeout;
    }
  }
};

SessionController.prototype.getCurrentSession = function(timestamp) {
  this.validateSession(timestamp);
  return this.session;
};

SessionController.prototype.getSessions = function(timestamp) {
  this.validateSession(timestamp);
  return this.sessionHistory;
};

SessionController.prototype.createSession = function(timestamp) {
  // if this.session is empty
  // create sessionId (using uuid4 id generator) for this.session, 
  // create sessionStart with new Date,
  // create sessionEnd with null as placeholder/active session
  var id = uuid();
  var currentTime = this.setCurrentTime(timestamp);
  this.session = {
    sessionId: id,
    sessionStart: currentTime,
    sessionEnd: null
  }
};

SessionController.prototype.setExpiration = function(timestamp, timeout) {
  return new Date(timestamp.setMinutes(timestamp.getMinutes() + timeout));
};

SessionController.prototype.setCurrentTime = function(timestamp) {
  var currentTime;
  if (timestamp === undefined) {
    currentTime = new Date();
  } else {
    currentTime = new Date(timestamp);
  }
  return currentTime;
};

SessionController.prototype.validateSession = function(timestamp) {
  var maxTimeout = null; // for else statement below
  var currentTime = this.setCurrentTime(timestamp);
  if (Object.keys(this.session).length === 0) {
    this.createSession(currentTime);
  } else {
    // need logic for determining if a session should be closed out 
    // get max expiration of all events
    // if that max > current timestamp, close session, add to history
    maxTimeout = new Date(Math.max.apply(null, Object.values(this.event)));
    this.closeSession(maxTimeout, currentTime);
  }
};

SessionController.prototype.closeSession = function(maxTimeout, timestamp) {
  // in order to close a check, events either must only have touch events
  // or have a check open and check close event
  var noCheckOpenOrClosed = !this.event.hasOwnProperty('CHECK_OPEN') && !this.event.hasOwnProperty('CHECK_CLOSE');
  var checkOpenAndClosed = this.event.hasOwnProperty('CHECK_OPEN') && this.event.hasOwnProperty('CHECK_CLOSE');
  var currentTime = this.setCurrentTime(timestamp);
  if (maxTimeout < currentTime) {
    if (noCheckOpenOrClosed || checkOpenAndClosed) {
      this.session.sessionEnd = new Date(maxTimeout);
      this.sessionHistory.push(this.session);
      this.session = {};
    }
  }
};

module.exports = {
  SessionController
};





