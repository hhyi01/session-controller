const SessionController = require('./session-controller.js').SessionController;

var controller = new SessionController();

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
  expect(test3Session1.sessionStart).toBe(JSON.stringify(test3Timestamp1));
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
  expect(lastSession.sessionStart).toBe(JSON.stringify(test4Timestamp1));
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
  // Assert that current (session5) is not empty
  expect(Object.keys(test5Session1).length !== 0).toBe(true);
  // Assert test 5 is on the right session
  expect(test5Session1.sessionId).toBe('session5');
});










