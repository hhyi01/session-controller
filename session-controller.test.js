const SessionController = require('./session-controller.js').SessionController;
const uuid = require('uuid4');

const controller = new SessionController();

// Test 1
test('Test 1: Submit a touch event', () => {
  const test1Event = { name: 'SWIPE', timeout: 5 };
  const test1Timestamp = new Date('2017-12-12 12:20:00');
  // Add one SWIPE event
  controller.addEvent(test1Event, test1Timestamp);
  // Set current time to 4 minutes after SWIPE event
  const test1Time1 = new Date('2017-12-12 12:24:00');
  const test1Session1 = controller.getCurrentSession(test1Time1);
  // Assert a session is in progress (currentSession1 object is not empty)
  expect(Object.keys(test1Session1).length !== 0).toBe(true);
  // Set current time to 10 minutes after SWIPE event
  const test1Time2 = new Date('2017-12-12 12:30:00');
  const test1Session2 = controller.getCurrentSession(test1Time2);
  // Assert that a session is not in progress (currentSession2 object is empty)
  expect(Object.keys(test1Session2).length === 0).toBe(true);
});

// Test 2
test('Test 2: Submit another touch event', () => {
  const test2Event1 = { name: 'TOUCH', timeout: 10 };
  const test2Timestamp = new Date('2017-12-12 16:20:00');
  // Add one TOUCH event
  controller.addEvent(test2Event1, test2Timestamp);
  // Get session at 9 minutes after TOUCH event
  const test2Session1 = controller.getCurrentSession(new Date('2017-12-12 16:29:00')); 
  // Assert a session is in progress
  expect(Object.keys(test2Session1).length !== 0).toBe(true);
  // Get session at 13 minutes after TOUCH event
  const test2Session2 = controller.getCurrentSession(new Date('2017-12-12 16:33:00'));
  // Assert that a session is not in progress
  expect(Object.keys(test2Session2).length === 0).toBe(true);
});

// Test 3
test('Submit overlapping touches', () => {
  const test3Event1 = { name: 'SWIPE', timeout: 5 };
  const test3Event2 = { name: 'TOUCH', timeout: 10 };
  const test3Timestamp1 = new Date('2017-12-12 17:50:00');
  const test3Timestamp2 = new Date('2017-12-12 17:52:00');
  const test3Event2Expiration = new Date('2017-12-12 18:02:00');
  // Add SWIPE event
  controller.addEvent(test3Event1, test3Timestamp1);
  // Add TOUCH event before SWIPE event expires
  controller.addEvent(test3Event2, test3Timestamp2);
  // Get most recent session after both events have timed out
  const test3Session1 = controller.getSessions(new Date('2017-12-12 18:05:00')).pop();
  // Assert most recent session starts at the same time of first touch event
  expect(JSON.stringify(test3Session1.sessionStart)).toBe(JSON.stringify(test3Timestamp1));
  // Assert most recent session ends at the expiration time of second touch event
  expect(JSON.stringify(test3Session1.sessionEnd)).toBe(JSON.stringify(test3Event2Expiration));
  // Add session back to history
  controller.sessionHistory.push(test3Session1);
});

// Test 4
test('Check does not expire', () => {
  const test4Event1 = { name: 'CHECK_OPEN', timeout: -1 };
  const test4Event2 = { name: 'CHECK_CLOSE', timeout: 0 };
  const test4Timestamp1 = new Date('2017-12-12 18:10:00');
  const test4Timestamp2 = new Date('2017-12-13 18:10:00'); // 24 hours later
  // Add CHECK_OPEN event
  controller.addEvent(test4Event1, test4Timestamp1);
  // Get current session after 5 minutes
  const test4Session1 = controller.getCurrentSession(new Date('2017-12-12 18:15:00'));
  // Get session after 8 hours
  const test4Session2 = controller.getCurrentSession(new Date('2017-12-13 02:10:00'));
  // Assert session at this point matches first session check
  expect(JSON.stringify(test4Session2)).toBe(JSON.stringify(test4Session1));
  // Submit a CHECK_CLOSE event
  controller.addEvent(test4Event2, test4Timestamp2);
  // Get current session one minute after submitting CHECK_CLOSE, which should be empty
  const test4Session3 = controller.getCurrentSession(new Date('2017-12-13 18:11:00'));
  expect(Object.keys(test4Session3).length === 0).toBe(true);
  // Check that most recent session starts at the same time of CHECK_OPEN 
  const lastSession = controller.getSessions(new Date('2017-12-13 18:11:00')).pop();
  // Assert that last session is closed
  // last session start should match timestamp of CHECK_OPEN event
  expect(JSON.stringify(lastSession.sessionStart)).toBe(JSON.stringify(test4Timestamp1));
  // last session end should match timestamp of CHECK_CLOSE event
  expect(JSON.stringify(lastSession.sessionEnd)).toBe(JSON.stringify(test4Timestamp2));
  // Add last session back to history
  controller.sessionHistory.push(lastSession);
});

// Test 5
test('Create session without timestamp', () => {
  const test5Event1 = { name: 'SWIPE', timeout: 5 };
  controller.addEvent(test5Event1);
  const test5Session1 = controller.getCurrentSession();
  // Assert that current is not empty
  expect(Object.keys(test5Session1).length !== 0).toBe(true);
});

// Create test for each method in isolation for expected behavior?

// Test 6 - addEvent(event, timestamp)
test('Added event shows in session controller\'s event object', () => {
  const test6Controller = new SessionController();
  const test6Event1 = { name: 'SWIPE', timeout: 5 };
  test6Controller.addEvent(test6Event1);
  expect(test6Controller.event.hasOwnProperty('SWIPE')).toBe(true);
});

// Test 7 - getCurrentSession(timestamp)
test('Current session returns expected session', () => {
  const test7Controller = new SessionController();
  const test7FakeSession = {
    sessionId: uuid(),
    sessionStart: new Date(),
    sessionEnd: null
  };
  test7Controller.session = test7FakeSession;
  const test7Session = test7Controller.getCurrentSession();
  expect(JSON.stringify(test7Session)).toBe(JSON.stringify(test7FakeSession));
});

// Test 8 - getSessions(timestamp)
test('Get sessions returns expected history', () => {
  const test8Controller = new SessionController();
  test8Controller.sessionHistory.push({ sessionId: uuid(), 
    sessionStart: new Date('2017-12-12 17:50:00'), 
    sessionEnd: new Date('2017-12-12 17:55:00') });
  test8Controller.sessionHistory.push({ sessionId: uuid(), 
    sessionStart: new Date('2017-12-12 18:00:00'), 
    sessionEnd: new Date('2017-12-12 18:50:00') });
  test8Controller.sessionHistory.push({ sessionId: uuid(), 
    sessionStart: new Date('2017-12-12 19:00:00'), 
    sessionEnd: new Date('2017-12-12 19:10:00') });
  const test8History = test8Controller.getSessions(new Date('2017-12-12 19:12:00'));
  expect(test8History.length).toBe(3);
  expect(JSON.stringify(test8Controller.sessionHistory)).toBe(JSON.stringify(test8History));
});

// Test 9 - createSession(timestamp)
test('Create session creates new session', () => {
  const test9Controller = new SessionController();
  expect(Object.keys(test9Controller.session).length === 0).toBe(true);
  test9Controller.createSession();
  expect(Object.keys(test9Controller.session).length !== 0).toBe(true);
});

// Test 10 - setExpiration(timestamp, timeout)
test('Set expiration returns date object with timestamp plus event timeout', () => {
  const test10Controller = new SessionController();
  const test10Expiration = test10Controller.setExpiration(new Date('2017-12-12 19:12:00'), 5);
  expect(JSON.stringify(test10Expiration)).toBe(JSON.stringify(new Date('2017-12-12 19:17:00')))
});

// Test 11 - setCurrentTime(timestamp)
test('Set current time returns expected timestamp', () => {
  const test11Controller = new SessionController();
  const test11Date1 = new Date('2017-12-12 19:12:00');
  const test11CurrentTime = test11Controller.setCurrentTime(test11Date1);
  expect(JSON.stringify(test11CurrentTime)).toBe(JSON.stringify(test11Date1));
});

// Test 12 - validateSession(timestamp)
test('Validate session confirms current session', () => {
  const test12Controller = new SessionController();
  test12Controller.event.SWIPE = new Date('2017-12-12 17:55:00');
  test12Controller.session = { sessionId: uuid(), 
    sessionStart: new Date('2017-12-12 17:50:00'), 
    sessionEnd: null };
  // Validate session after timed out touch event
  test12Controller.validateSession(new Date('2017-12-12 17:56:00'));
  // This session should have sessionEnd time now
  const test12LastSession = test12Controller.sessionHistory.pop();
  expect(JSON.stringify(test12LastSession.sessionEnd)).toBe(JSON.stringify(new Date('2017-12-12 17:55:00')));
  test12Controller.validateSession(new Date('2017-12-12 18:00:00'));
  // Should create new session
  expect(Object.keys(test12Controller.session).length !== 0).toBe(true);
});

// Test 13 - closeSession(maxTimeout, timestamp)
test('Close session closes session as expected', () => {
  const test13Controller = new SessionController();
  test13Controller.event.SWIPE = new Date('2017-12-12 17:55:00');
  test13Controller.session = { sessionId: uuid(), 
    sessionStart: new Date('2017-12-12 17:50:00'), 
    sessionEnd: null };  
  test13Controller.closeSession(test13Controller.event.SWIPE, new Date('2017-12-12 17:53:00'));
  // Session should still be open
  expect(JSON.stringify(test13Controller.session.sessionEnd)).toBe('null');
  test13Controller.closeSession(new Date('2017-12-12 17:56:00'));
  // Session should be closed
  expect(Object.keys(test13Controller.session).length === 0).toBe(true);
});

// Test 14 - a thousand overlapping touch events?
test('A thousand overlapping touch events yields one session', () => {
  const test14Controller = new SessionController();
  let startTime = new Date('2017-12-12 17:53:00');
  for (let i = 0; i < 1000; i++) {
    let ti = 4 + Math.floor(Math.random() * 3); // timeout should be between 4 and 7 minutes
    const test14Event = { name: 'SWIPE', timeout: ti };
    test14Controller.addEvent(test14Event, startTime);
    let interval = 2 + Math.floor(Math.random() * 2); // touch event every 2-4 minutes
    startTime = test14Controller.setExpiration(startTime, interval);
  }
  // There should only be one long session in session history
  const test14History = test14Controller.getSessions();
  expect(test14History.length).toBe(1);
});

// Test 15 - a check_open plus a thousand overlapping touch events?
test('A check open with a thousand touch events yields one ongoing session', () => {
  const test15Controller = new SessionController();
  let startTime2 = new Date('2017-12-12 17:53:00');
  for (let i = 0; i < 1000; i++) {
    if (i === 2) {
      const test15Event1 = { name: 'CHECK_OPEN', timeout: -1 };
      test15Controller.addEvent(test15Event1, startTime2); // add check open event
    } else {
      let ti2 = 4 + Math.floor(Math.random() * 3); // timeout should be between 4 and 7 minutes
      const test15Event2 = { name: 'SWIPE', timeout: ti2 };
      test15Controller.addEvent(test15Event2, startTime2);
      let interval2 = 2 + Math.floor(Math.random() * 2); // touch event every 2-4 minutes
      startTime2 = test15Controller.setExpiration(startTime2, interval2);
    }
  }
  // There should be one current session 
  const test15Session = test15Controller.getCurrentSession();
  expect(Object.keys(test15Session).length !== 0).toBe(true);
  // Current session should have no end time
  expect(JSON.stringify(test15Session.sessionEnd)).toBe('null');
  const test15History = test15Controller.getSessions();
  // There should be no history available
  expect(test15History.length).toBe(0);  
});

// Test 16 - a series of timed out touch events?
test('A series of 1000 timed out touch events yields 1000 sessions', () => {
  const test16Controller = new SessionController();
  let startTime3 = new Date('2017-12-12 17:53:00');
  for (let i = 0; i < 1000; i++) {
    let ti3 = 2 + Math.floor(Math.random() * 3); // timeout should be between 2 and 5 minutes
    const test16Event = { name: 'SWIPE', timeout: ti3 };
    test16Controller.addEvent(test16Event, startTime3);
    let interval3 = 8 + Math.floor(Math.random() * 2); // touch event every 8-10 minutes
    startTime3 = test16Controller.setExpiration(startTime3, interval3);
  }  
  const test16History = test16Controller.getSessions();
  expect(test16History.length).toBe(1000);
});









