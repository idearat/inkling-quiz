// ========================================================================
// NAME: inkling_test.js
// AUTH: Scott Shattuck

/**
 * @fileoverview Basic unit test harness and simple unit tests for the Web
 * Application Engineer Challenge.
 *
 * The test functions here are a simple implementation of a rudimentary test
 * framework built specifically for this challenge. The inspiration for this
 * comes from the QUnit testing harness from jQuery, although there is no
 * jQuery code or dependency here. These are _very simple_ but sufficient to
 * ensure that the Path code meets the requirements of the specification.
 */

// ========================================================================
// Path Test Infrastructure (ala QUnit)
// ------------------------------------------------------------------------

/**
 * Invokes a test embodied as a function to invoke. The test name is output,
 * followed by the results produced by the test function itself.
 * @param {string} name The visible output name of the test.
 * @param {Function} func The function embodying the test itself.
 */
function test(name, func) {
  try {
    func();
  } catch (e) {
    ok(false, e.message);
  }

  // The methods called by test functions merely queue output. Call
  // the report function to empty that queue into the output stream.
  report(name);
}


/**
 * An object for capturing test summary information on number of tests, how
 * many passed, how many failed, how long it all took etc. The queue()
 * function will update the count/pass/fail data while the runTests() call
 * manages start/end times.
 */
test.summary = {
  count: 0,
  pass: 0,
  fail: 0,
  start: null,
  end: null
};


/**
 * A comparison (equality) check routine that can manage testing whether a
 * pair of arrays are equal. This is necessary for properly testing the
 * various pathToPointArray invocations.
 * @param {Object} actual The actual value, or first value if you prefer.
 * @param {Object} expected The expected, or second value.
 * @param {string} message The message to output when the test fails.
 */
function compare(actual, expected, message) {
  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    queue(actual == expected, actual, expected, message);
    return;
  }

  // Simplistic, but probably sufficient for now.
  queue(actual.toString() == expected.toString(), actual, expected, message);
}


/**
 * Tests whether actual and expected values are equal in the == sense as
 * it relates to JavaScript. Type conversion is performed. If the test fails
 * the message is output along with the actual and expected values.
 * @param {Object} actual The actual value, or first value if you prefer.
 * @param {Object} expected The expected, or second value.
 * @param {string} message The message to output when the test fails.
 */
function equal(actual, expected, message) {
  queue(actual == expected, actual, expected, message);
}


/**
 * Tests whether actual and expected values are identical in the === sense as
 * it relates to JavaScript. Type conversion is performed. If the test fails
 * the message is output along with the actual and expected values.
 * @param {Object} actual The actual value, or first value if you prefer.
 * @param {Object} expected The expected, or second value.
 * @param {string} message The message to output when the test fails.
 */
function identical(actual, expected, message) {
  queue(actual === expected, actual, expected, message);
}


/**
 * Tests whether actual and expected values are not equal in the == sense as
 * it relates to JavaScript. Type conversion is performed. If the test fails
 * the message is output along with the actual and expected values.
 * @param {Object} actual The actual value, or first value if you prefer.
 * @param {Object} expected The expected, or second value.
 * @param {string} message The message to output when the test fails.
 */
function notEqual(actual, expected, message) {
  queue(actual != expected, actual, expected, message);
}


/**
 * Tests whether actual and expected values are not identical in the === sense
 * as it relates to JavaScript. Type conversion is performed. If the test
 * fails the message is output along with the actual and expected values.
 * @param {Object} actual The actual value, or first value if you prefer.
 * @param {Object} expected The expected, or second value.
 * @param {string} message The message to output when the test fails.
 */
function notIdentical(actual, expected, message) {
  queue(actual !== expected, actual, expected, message);
}


/**
 * Tests whether a value is true, otherwise outputs message.
 * @param {Boolean} check The value to test for boolean "trueness".
 * @param {string} message The message to output when the test fails.
 */
function ok(check, message) {
  equal(check, true, message);
}


/**
 * Tests whether a value is false, otherwise outputs message.
 * @param {Boolean} check The value to test for boolean "falseness".
 * @param {string} message The message to output when the test fails.
 */
function not(check, message) {
  equal(check, false, message);
}


/**
 * Verifies that a test function raises an exception. If so, the test passes,
 * otherwise the message is output.
 * @param {Function} func The function embodying the test itself.
 * @param {string} message The message to output when the test fails.
 */
function raises(func, message) {
  try {
    func();
    ok(false, message);
  } catch (e) {
    ok(true);
  }
}


/**
 * Outputs a test name along with any queued test result information. The
 * various functions such as equal, identical, ok, not, raises, etc. push
 * their output into a queue via the queue() function. The report function
 * iterates over that queue, produces HTML output for a test, and clears the
 * queue for the next set of tests.
 * @param {string} name The publicly visible output name for the test.
 */
function report(name) {
  // Create a DIV of class 'test' to contain any queued test results.
  var report = document.createElement('div');
  report.setAttribute('class', 'test');
  report = document.getElementById('background').appendChild(report);

  // Build the 'name' span for outputting the test name.
  var html = '<div class="assert">';
  html += '<div class="name">' + name + '</div>';

  // Access our function-associated queue of pending report data. Since
  // report is a named function we could also use report.queued here.
  var queued = arguments.callee.queued;
  var len = queued.length;

  if (len === 0) {
    // No content? No tests...a banner invocation.
    report.setAttribute('class', 'note');
  } else {
    // Append queued test result output from within the test function(s).
    for (var i = 0; i < len; i++) {
      html += queued[i];
    }
  }

  // Close the assert DIV and inject the report into the DOM.
  html += '</div>';
  report.innerHTML = html;

  // Reset the queue for next report cycle.
  queued.length = 0;
}


/**
 * A property of the report function used to track queued report output. The
 * report function will access this via arguments.callee (or report.queued).
 */
report.queued = [];


/**
 * Queues HTML output for a specific test. When the check value is true the
 * output is a simple 'pass'. When the check value is false the output is a
 * fail message including the actual and expected values.
 * @param {Boolean} check The value to test for boolean "falseness".
 * @param {Object} actual The actual value, or first value if you prefer.
 * @param {Object} expected The expected, or second value.
 * @param {string} message The message to output when the test fails.
 */
function queue(check, actual, expected, message) {
  test.summary.count += 1;

  // The non-breaking space ensures we get consistent heights on pass/fail.
  var html = '<div class="result ' + (check ? 'pass' : 'fail') + '">&nbsp;';
  if (!check) {
    test.summary.fail += 1;
    html += message || '';
    html += ' actual: ' + actual + ' expected: ' + expected;
  } else {
    test.summary.pass += 1;
  }
  html += '</div>';

  report.queued.push(html);
}


// ========================================================================
// Path Tests
// ------------------------------------------------------------------------

/**
 * A simple invocation function for the unit tests. This is invoked via a
 * simple onload handler on the index.html file's <body> element.
 */
function runTests() {

  // An empty array, which should fail to produce a path.
  var noPoints = [];

  // An array which should also fail to produce a path.
  var emptyPoints = [[], [], []];

  // Sneaky/ugly 'points'.
  var badPoints = [
    [100, 100],
    [100, NaN],
    [200, 200],
    [200, 100],
    [100, 100]
  ];

  // An array representing a 100x100 box at top/left 100x100. We reuse this
  // to create valid Path objects for many of the tests.
  var goodPoints = [
    [100, 100],
    [100, 200],
    [200, 200],
    [200, 100],
    [100, 100]
  ];

  test.summary.start = (new Date()).getTime();

  // ---
  // Testing tests.
  // ---

  report('Test Harness Tests');

  test('Fail on purpose...and ignore in totals :)', function() {
    not(true, 'Fail, so we see what failure looks like.');
  });

  test('ok()', function() {
    ok(true, 'ok(true) not true?!');
  });

  test('not()', function() {
    not(false, 'not(false) not true?!');
  });

  test('raises()', function() {
    raises(function() {
      throw new Error();
    },
    'Raise not seen or trapped when expected.');
  });


  // ---
  // isPathString tests.
  // ---

  report('Path.isPathString() Tests');

  // incomplete paths

  test('!!! Path.isPathString("m100")', function() {
    not(Path.isPathString('m100'),
      'Path string \'m100\' should not pass.');
  });

  test('!!! Path.isPathString("l100 100")', function() {
    not(Path.isPathString('l100 100'),
      'Path string \'l100 100\' should not pass.');
  });

  test('!!! Path.isPathString("m100z")', function() {
    not(Path.isPathString('m100z'),
      'Path string \'m100z\' should not pass.');
  });

  test('!!! Path.isPathString("M100Z")', function() {
    not(Path.isPathString('M100Z'),
      'Path string \'M100Z\' should not pass.');
  });

  test('!!! Path.isPathString("m100 100l")', function() {
    not(Path.isPathString('m100 100l'),
      'Path string \'m100 100l\' should not pass.');
  });

  test('!!! Path.isPathString("m100 100l100")', function() {
    not(Path.isPathString('m100 100l100'),
      'Path string \'m100 100l100\' should not pass.');
  });

  test('!!! Path.isPathString("m100 100l100 z")', function() {
    not(Path.isPathString('m100 100l100 z'),
      'Path string \'m100 100l100 z\' should not pass.');
  });

  test('!!! Path.isPathString("z")', function() {
    not(Path.isPathString('z'), 'Path string \'z\' should not pass.');
  });

  test('!!! Path.isPathString("Z")', function() {
    not(Path.isPathString('Z'), 'Path string \'Z\' should not pass.');
  });

  // moveto then lineto

  test('Path.isPathString("m100 100l0 100")', function() {
    ok(Path.isPathString('m100 100l0 100'),
      'Path string \'m100 100l0 100\' failed to pass.');
  });

  test('Path.isPathString("m100 100 l0 100")', function() {
    ok(Path.isPathString('m100 100 l0 100'),
      'Path string \'m100 100 l0 100\' failed to pass.');
  });

  test('Path.isPathString("m100 100L100 200")', function() {
    ok(Path.isPathString('m100 100L100 200'),
      'Path string \'m100 100L100 200\' failed to pass.');
  });

  test('Path.isPathString("m100 100 L100 200")', function() {
    ok(Path.isPathString('m100 100 L100 200'),
      'Path string \'m100 100 L100 200\' failed to pass.');
  });

  // moveto then lineto (multiple)

  test('Path.isPathString("m100 100l0 100l200 100")', function() {
    ok(Path.isPathString('m100 100l0 100l200 100'),
      'Path string \'m100 100l0 100l200 100\' failed to pass.');
  });

  test('Path.isPathString("m100 100 l0 100 l200 100")', function() {
    ok(Path.isPathString('m100 100 l0 100 l200 100'),
      'Path string \'m100 100 l0 100 l200 100\' failed to pass.');
  });

  test('Path.isPathString("m100 100L100 200L200 100")', function() {
    ok(Path.isPathString('m100 100L100 200L200 100'),
      'Path string \'m100 100L100 200L200 100\' failed to pass.');
  });

  test('Path.isPathString("m100 100 L100 200 L200 100")', function() {
    ok(Path.isPathString('m100 100 L100 200 L200 100'),
      'Path string \'m100 100 L100 200 L200 100\' failed to pass.');
  });

  // closed paths

  test('Path.isPathString("m100 100l0 100z")', function() {
    ok(Path.isPathString('m100 100l0 100z'),
      'Path string \'m100 100l0 100z\' failed to pass.');
  });

  test('Path.isPathString("m100 100 l0 100 z")', function() {
    ok(Path.isPathString('m100 100 l0 100 z'),
      'Path string \'m100 100 l0 100 z\' failed to pass.');
  });

  test('Path.isPathString("m100 100L100 200Z")', function() {
    ok(Path.isPathString('m100 100L100 200Z'),
      'Path string \'m100 100L100 200Z\' failed to pass.');
  });

  test('Path.isPathString("m100 100 L100 200 Z")', function() {
    ok(Path.isPathString('m100 100 L100 200 Z'),
      'Path string \'m100 100 L100 200 Z\' failed to pass.');
  });

  test('Path.isPathString("m100 100l0 100l200 100z")', function() {
    ok(Path.isPathString('m100 100l0 100l200 100z'),
      'Path string \'m100 100l0 100l200 100z\' failed to pass.');
  });

  test('Path.isPathString("m100 100 l0 100 l200 100 z")', function() {
    ok(Path.isPathString('m100 100 l0 100 l200 100 z'),
      'Path string \'m100 100 l0 100 l200 100 z\' failed to pass.');
  });

  test('Path.isPathString("m100 100L100 200L200 100Z")', function() {
    ok(Path.isPathString('m100 100L100 200L200 100Z'),
      'Path string \'m100 100L100 200L200 100Z\' failed to pass.');
  });

  test('Path.isPathString("m100 100 L100 200 L200 100 Z")', function() {
    ok(Path.isPathString('m100 100 L100 200 L200 100 Z'),
      'Path string \'m100 100 L100 200 L200 100 Z\' failed to pass.');
  });

  // floating point points

  test('!!! Path.isPathString("m100.0 100l0 100")', function() {
    not(Path.isPathString('m100.0 100l0 100'),
      'Path string \'m100.0 100l0 100\' has ., should not pass.');
  });

  test('!!! Path.isPathString("m100 100.0 l0 100")', function() {
    not(Path.isPathString('m100 100.0 l0 100'),
      'Path string \'m100 100.0 l0 100\' has ., should not pass.');
  });

  test('!!! Path.isPathString("m100 100L100.0 200")', function() {
    not(Path.isPathString('m100 100L100.0 200'),
      'Path string \'m100 100L100.0 200\' has ., should not pass.');
  });

  test('!!! Path.isPathString("m100 100 L100 200.0")', function() {
    not(Path.isPathString('m100 100 L100 200.0'),
      'Path string \'m100 100 L100 200.0\' has ., should not pass.');
  });


  // ---
  // isPointArray tests.
  // ---

  report('Path.isPointArray() Tests');

  test('Path.isPointArray(goodPoints)', function() {
    ok(Path.isPointArray(goodPoints),
      'Point array \'goodPoints\' failed to pass.');
  });

  test('Path.isPointArray([[0, 0], [0, 100])', function() {
    ok(Path.isPointArray(goodPoints),
      'Point array \'[[0, 0], [0, 100]]\' failed to pass.');
  });

  test('Path.isPointArray([[-0, 0], [0, -100])', function() {
    ok(Path.isPointArray(goodPoints),
      'Point array \'[[-0, 0], [0, -100]]\' failed to pass.');
  });


  test('!!! Path.isPointArray(badPoints)', function() {
    not(Path.isPointArray(badPoints),
      'Point array \'badPoints\' should have failed on NaN.');
  });

  test('!!! Path.isPointArray(noPoints)', function() {
    not(Path.isPointArray(noPoints),
      'Point array \'noPoints\' should have failed with no points.');
  });

  test('!!! Path.isPointArray(emptyPoints)', function() {
    not(Path.isPointArray(emptyPoints),
      'Point array \'emptyPoints\' should have failed w/empty points.');
  });


  // ---
  // Path-to-Points tests.
  // ---

  report('Path.pathAsPointArray() Tests');

  // simple paths

  test('Path.pathAsPointArray(\'M100 100L100 200\')', function() {
    compare(Path.pathAsPointArray('M100 100L100 200'),
      [[100, 100], [100, 200]],
      'Path \'M100 100L100 200\' not equal to [[100, 100], [100, 200]]');
  });

  test('Path.pathAsPointArray(\'M100 100l100 200\')', function() {
    compare(Path.pathAsPointArray('M100 100l100 200'),
      [[100, 100], [200, 300]],
      'Path \'M100 100l100 200\' not equal to [[100, 100], [200, 300]]');
  });

  // multi-lineto paths

  test('Path.pathAsPointArray(\'M100 100L100 200L200 200\')', function() {
    compare(Path.pathAsPointArray('M100 100L100 200L200 200'),
      [[100, 100], [100, 200], [200, 200]],
      'Path \'M100 100L100 200L200 200\' not equal to ' +
      '[[100, 100], [100, 200], [200, 200]]');
  });

  test('Path.pathAsPointArray(\'M100 100L100 200L200 200l0 -100\')',
      function() {
    compare(Path.pathAsPointArray('M100 100L100 200L200 200l0 -100'),
      [[100, 100], [100, 200], [200, 200], [200, 100]],
      'Path \'M100 100L100 200L200 200l0 -100\' not equal to ' +
      '[[100, 100], [100, 200], [200, 200], [200, 100]]');
  });

  // closed paths

  test('Path.pathAsPointArray()', function() {
    compare(Path.pathAsPointArray('M100 100L100 200z'),
      [[100, 100], [100, 200], [100, 100]],
      'Path \'M100 100L100 200z\' not equal to ' +
      '[[100, 100], [100, 200], [100, 100]]');
  });

  test('Path.pathAsPointArray()', function() {
    compare(Path.pathAsPointArray('M100 100L100 200 Z'),
      [[100, 100], [100, 200], [100, 100]],
      'Path \'M100 100L100 200 Z\' not equal to ' +
      '[[100, 100], [100, 200], [100, 100]]');
  });

  // multi-lineto closed paths

  test('Path.pathAsPointArray(\'M100 100L100 200L200 200z\')', function() {
    compare(Path.pathAsPointArray('M100 100L100 200L200 200z'),
      [[100, 100], [100, 200], [200, 200], [100, 100]],
      'Path \'M100 100L100 200L200 200z\' not equal to ' +
      '[[100, 100], [100, 200], [200, 200], [100, 100]]');
  });

  test('Path.pathAsPointArray(\'M100 100L100 200L200 200l0 -100 Z\')',
      function() {
    compare(Path.pathAsPointArray('M100 100L100 200L200 200l0 -100 Z'),
      [[100, 100], [100, 200], [200, 200], [200, 100], [100, 100]],
      'Path \'M100 100L100 200L200 200l0 -100 Z\' not equal to ' +
      '[[100, 100], [100, 200], [200, 200], [200, 100], [100, 100]]');
  });


  // ---
  // Points-to-Path tests.
  // ---

  report('Path.pointArrayAsPath() Tests');

  // simple paths

  test('Path.pointArrayAsPath([[100, 100], [100, 200]])', function() {
    compare(Path.pointArrayAsPath([[100, 100], [100, 200]]),
      'M100 100 L100 200',
      'Path \'M100 100 L100 200\' not equal to [[100, 100], [100, 200]]');
  });

  // multi-lineto paths

  test('Path.pointArrayAsPath([[100, 100], [100, 200], [200, 200]])',
      function() {
    compare(Path.pointArrayAsPath([[100, 100], [100, 200], [200, 200]]),
    'M100 100 L100 200 L200 200',
      'Path \'M100 100 L100 200 L200 200\' not equal to ' +
      '[[100, 100], [100, 200], [200, 200]]');
  });

  // closed paths

  test('Path.pointArrayAsPath([[100, 100], [100, 200], [100, 100]])',
      function() {
    compare(Path.pointArrayAsPath([[100, 100], [100, 200], [100, 100]]),
    'M100 100 L100 200 Z',
      'Path \'M100 100 L100 200 Z\' not equal to ' +
      '[[100, 100], [100, 200], [100, 100]]');
  });

  // multi-lineto closed paths

  test(
  'Path.pointArrayAsPath([[100, 100], [100, 200], [200, 200], [100, 100]])',
      function() {
    compare(Path.pointArrayAsPath(
      [[100, 100], [100, 200], [200, 200], [100, 100]]),
      'M100 100 L100 200 L200 200 Z',
      'Path \'M100 100 L100 200 L200 200 Z\' not equal to ' +
      '[[100, 100], [100, 200], [200, 200], [100, 100]]');
  });


  // ---
  // Constructor tests.
  // ---

  report('new Path() Tests');

  test('!!! new Path()', function() {
    raises(function() {
      var path = new Path();
    }, 'Path constructor failed to raise with empty input.');
  });

  test('new Path(goodPoints)', function() {
    var path = new Path(goodPoints);
    notEqual(path, null);
  });

  test('!!! new Path(badPoints)', function() {
    raises(function() {
      var path = new Path(badPoints);
    }, 'Path constructor failed to raise with bad points.');
  });

  test('!!! new Path(noPoints)', function() {
    raises(function() {
      var path = new Path(noPoints);
    }, 'Path constructor failed to raise with empty point array.');
  });


  // ---
  // instanceof tests.
  // ---

  report('instanceof Tests');

  test('(new Path(...)) instanceof Array', function() {
    var path = new Path(goodPoints);
    ok(path instanceof Path, 'Path not an instanceof Array');
  });

  test('(new Path(...)) instanceof Path', function() {
    var path = new Path(goodPoints);
    ok(path instanceof Path, 'Path not an instanceof Path');
  });

  test('!!! (new Path(...)) instanceof Number', function() {
    var path = new Path(goodPoints);
    not(path instanceof Number, 'Path is an instanceof Number!');
  });


  // ---
  // clone() tests.
  // ---

  report('clone() Tests');

  test('path.clone().toString() === path.toString()', function() {
    var path = new Path(goodPoints);
    var path2 = path.clone();
    identical(path2.toString(), path.toString(),
      'Cloned path data strings not equal.');
  });

  test('path.clone().length === path.length', function() {
    var path = new Path(goodPoints);
    var path2 = path.clone();
    identical(path2.length, path.length, 'Cloned path length not equal.');
  });


  // ---
  // filter() tests.
  // ---

  report('filter() Tests');

  // filter(function(point) { return true } is another way to clone.
  test('path.filter(identity_func).length === path.length', function() {
    var path = new Path(goodPoints);
    var path2 = path.filter(function() {
        return true;
      });
    identical(path2.length, path.length,
      'Filtered identity path length not equal.');
  });

  test('path.filter(identity_func).toString() === path.toString()',
      function() {
    var path = new Path(goodPoints);
    var path2 = path.filter(function() {
        return true;
      });
    identical(path2.toString(), path.toString(),
      'Filtered identity path data strings not equal.');
  });

  // filter(function(point, index, list) { return index != list.length - 1 }
  // should remove tail.
  test('path.filter(...) remove tail',
      function() {
    var path = new Path(goodPoints);
    var path2 = path.filter(function(point, index, list) {
        return index !== list.length - 1;
      });
    equal(path2.toString(), 'M100 100 L100 200 L200 200 L200 100',
      'Filtered tail path string does not match.');
  });

  test('path.filter(...) remove head and tail',
      function() {
    var path = new Path(goodPoints);
    var path2 = path.filter(function(point, index, list) {
        return index != 0 && index !== list.length - 1;
      });
    equal(path2.toString(), 'M100 200 L200 200 L200 100',
      'Filtered tail path string does not match.');
  });

  // ---
  // map() tests.
  // ---

  report('map() Tests');

  // map(function(point) { return point } is another way to clone.
  test('path.map(identity_func).length === path.length', function() {
    var path = new Path(goodPoints);
    var path2 = path.map(function(point) {
        return point;
      });
    identical(path2.length, path.length,
      'Mapped identity path length not equal.');
  });

  test('path.map(identity_func).toString() === path.toString()',
      function() {
    var path = new Path(goodPoints);
    var path2 = path.filter(function(point) {
        return point;
      });
    identical(path2.toString(), path.toString(),
      'Mapped identity path data strings not equal.');
  });

  // map(function(point) { return [point[1], point[0]] } is an invert of
  // sorts.
  test('path.map(...) invert x/y',
      function() {
    var path = new Path(goodPoints);
    var path2 = path.map(function(point, index, list) {
        return [point[1], point[0]];
      });
    equal(path2.toString(), 'M100 100 L200 100 L200 200 L100 200 Z',
      'Inverted map path string does not match.');
  });


  // ---
  // slice() tests.
  // ---

  report('slice() Tests');

  // slice(0) should be a clone...
  test('path.slice(0).length === path.length', function() {
    var path = new Path(goodPoints);
    var path2 = path.slice(0);
    identical(path2.length, path.length,
      'Sliced identity path length not equal.');
  });

  test('path.slice(0).toString() === path.toString()',
      function() {
    var path = new Path(goodPoints);
    var path2 = path.slice(0);
    identical(path2.toString(), path.toString(),
      'Sliced identity path data strings not equal.');
  });

  // slice(0, -1) should take a closed path and "open it" by removing the
  // tail.
  test('path.slice(0, -1) remove tail',
      function() {
    var path = new Path(goodPoints);
    var path2 = path.slice(0, -1);
    equal(path2.toString(), 'M100 100 L100 200 L200 200 L200 100',
      'Sliced tail path string does not match.');
  });

  // should be able to create a new starting point, slice out center, and
  // close to create a new path.
  test('path.slice(1, -1) remove head and tail',
      function() {
    var path = new Path(goodPoints);
    var path2 = path.slice(1, -1);
    equal(path2.toString(), 'M100 200 L200 200 L200 100',
      'Sliced head/tail path string does not match.');
  });


  // ---
  // toString() tests.
  // ---

  report('toString() Tests');

  test('new Path(goodPoints).toString()', function() {
    var path = new Path(goodPoints);
    identical(path.toString(),
      'M100 100 L100 200 L200 200 L200 100 Z',
      'toString() not equal to M100 100 L100 200 L200 200 L200 100 Z');
  });


  // ---
  // Wrapup
  // ---

  // Close off our time.
  test.summary.end = (new Date()).getTime();

  // Write out a summary record...but note that we cheat the numbers a bit
  // here to account for our explicit fail and we treat it as a "pass".
  var summary = 'Totals: ' + (test.summary.end - test.summary.start) + 'ms' +
    ' pass: ' + (test.summary.pass + 1) +
    ' fail: ' + (test.summary.fail - 1);

  report(summary);
}

// ========================================================================
