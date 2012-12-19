// ========================================================================
// Copyright 2011 Idearat (Scott Shattuck). All Rights Reserved.

/**
 * @fileoverview Implements the Web Application Engineer Challenge.
 *
 * Specifically:
 *
 * Without using any external libraries, create a 2D "Path" constructor 
 * that accepts either an array of points (which are arrays of length two) or
 * a subset of an SVG path string (see http://www.w3.org/TR/SVG/paths.html),
 * where only the moveto, closepath and lineto commands are accepted.
 *
 * The path must be connected, so the moveto command must only appear at the
 * beginning and the closepath may optionally appear only at the end. The
 * lineto must accept both absolute and relative integer coordinates.
 *
 * The Path objects must inherit from Arrays, so all array methods should
 * work on Path objects. This means that new Path instanceof Path and new
 * Path instanceof Array must both return true.
 *
 * A Path object must have a clone method that returns a new Path with the
 * same points and a toString method that returns an SVG path string
 * representing the Path. Additionally, the methods map, filter, and slice
 * must return Path objects rather than pure arrays.
 *
 * This implementation only needs to function in the latest versions of
 * Firefox and Safari.
 *
 * @author scott.shattuck@gmail.com
 */

// ========================================================================
// Utility / Compatibility
// ------------------------------------------------------------------------

// ECMAScript-5 defines Array.isArray but it's not available in FF3x.
if (typeof Array.isArray !== 'function') {

  /**
   * Returns true if the object provided is an instance of Array.
   * @param {Object} arg The object to test.
   * @return {Boolean} True if the argument is a valid JS Array.
   */
  Array.isArray = function(arg) {
    // Try to avoid objects which instanceof might lie about...like Path
    // instances :).
    return typeof arg === 'object' &&
        Object.prototype.toString.call(arg) === '[object Array]';
  };
}

// ========================================================================
// Path Type Definition
// ------------------------------------------------------------------------

/**
 * Constructs a new Path instance. The input to the constructor should be a
 * path string per (see http://www.w3.org/TR/SVG/paths.html) containing a
 * single moveto command, one to N lineto commands, and an optional closepath;
 * or an array of ordered pairs in [x, y] form.
 * @param {string|Array.<Array>} path  A path string or array of x,y pairs.
 * @constructor
 */
function Path(path) {

  if (Path.isPathString(path)) {
    this.setPath(path);
    return this;
  }

  if (Path.isPointArray(path)) {
    this.setPoints(path);
    return this;
  }

  // Handle error in a consistent fashion.
  Path.invalidPath(path);
}


/**
 * Message used when a path constructor fails to receive valid input.
 * @type {string}
 */
Path.INVALID_PATH_MSG = 'Invalid path.';


/**
 * A regular expression which verifies the specific svg:path string subset
 * our constructor will accept: moveto, lineto, and closepath commands using
 * integer values (which removes the \U0046 decimal from consideration):
 * Moveto commands: M or m followed by 2 integer values.
 * Lineto commands: L or l followed by multiples of 2 integer values.
 * Closepath commands: Z or z. Must be the last value in the string.
 * Note that for this challenge lineto variations are _not_ supported:
 * -- NO Horizontal lineto: H or h followed by 1 or more integer values.
 * -- NO Vertical lineto: V or v followed by 1 or more integer values.
 * @type {RegExp}
 */
Path.DATA_STRING_REGEX =
  /^([Mm][ ]*[+-]?\d+ [+-]?\d+)([ ]*[Ll][ ]*[+-]?\d+ [+-]?\d+){1,}([ ]*[Zz])*$/;


/**
 * A variation on the DATA_STRING_REGEX intended to slice out lineto
 * sequences. This regex will create 3 chunks for each component of the path
 * string: moveto, lineto sequence, and closepath.
 */
Path.DATA_SLICE_REGEX = /^([Mm][ ]*[+-]?\d+ [+-]?\d+)(.*?)([ ]*[Zz])*$/;


/**
 * A regular expression used to pull apart a lineto path component. Note that
 * this is a global regex. We'll leverage String.replace as an iterator to
 * work across sequences of lineto commands in the path.
 */
Path.LINETO_STRING_REGEX =
  /[ ]*([Ll])[ ]*([+-]?\d+) ([+-]?\d+)| ([+-]?\d+) ([+-]?\d+)/g;


/**
 * A regular expression used to pull apart moveto path components.
 */
Path.MOVETO_STRING_REGEX = /([Mm])[ ]*([+-]?\d+) ([+-]?\d+)/;


/**
 * Provides common error reporting for invalid path data.
 * @param {Object} arg The invalid path data.
 */
Path.invalidPath = function(arg) {
  throw new Error(Path.INVALID_PATH_MSG);
};


/**
 * A utility function which verifies that a String conforms to the
 * requirements for a valid "path string" for Path construction.
 * @param {Object} arg The argument to test.
 * @return {Boolean} True if the argument is a valid path string.
 */
Path.isPathString = function(arg) {
  return Path.DATA_STRING_REGEX.test(arg);
};


/**
 * A utility routine which verifies that an Array conforms to the requirements
 * for a "point array" for Path construction. Note that at least two points
 * are necessary to construct a line, and hence a path. Also note only integer
 * values are accepted in point arrays for the present time.
 * @param {Object} arg The argument to test.
 * @return {Boolean} True if the argument is a valid point array.
 */
Path.isPointArray = function(arg) {

  if (!Array.isArray(arg)) {
    return false;
  }

  // Require at least two points, otherwise it's not a "path".
  var len = arg.length;
  if (len < 2) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    var point = arg[i];
    if (!Array.isArray(point)) {
      return false;
    }

    // Points contain only X and Y integer values in our spec.
    if (point.length !== 2) {
      return false;
    }

    // Subtlety here. NaN will return typeof 'number'...but we won't
    // validate a potential point array containing NaN values.
    if (typeof point[0] !== 'number' || isNaN(point[0]) ||
        typeof point[1] !== 'number' || isNaN(point[1])) {
      return false;
    }

    // Verify integer values.
    if (parseInt(point[0]) !== parseFloat(point[0]) ||
        parseInt(point[1]) !== parseFloat(point[1])) {
      return false;
    }
  }

  return true;
};


/**
 * Converts a valid SVG data path string into an equivalent point array.
 * @param {Object} arg The presumed SVG data path to convert to points.
 * @return {Array.<Array>} An array of x,y pairs.
 */
Path.pathAsPointArray = function(arg) {
  if (!Path.isPathString(arg)) {
    return;
  }

  // Split the path into constituent parts. Should be 3, which the last can be
  // empty (closed path is optional).
  var parts = Path.DATA_SLICE_REGEX.exec(arg);

  var moveto = parts[1];
  var lineto = parts[2];
  var closed = parts[3];

  var points = [];

  // Partition the moveto component by slicing out the x,y via regex. Save
  // this point in case we're looking at a closed path...we'll need it again.
  var movetoParts = Path.MOVETO_STRING_REGEX.exec(moveto);
  var opener = [parseInt(movetoParts[2], 10), parseInt(movetoParts[3], 10)];
  points.push(opener);

  // Store whether we're relative outside our iteration function below so it
  // can "remember" that state as it iterates.
  var relative = false;

  // Reset the index on the regex so it works whenever we call it.
  Path.LINETO_STRING_REGEX.lastIndex = 0;

  // There can be multiple lineto commands, and in addition, only the first
  // truly requires a leading L or l to initialize the sequence. Here we'll
  // leverage String.replace to loop across all matches within the lineto
  // sequence, creating a new point for each chunk we find.
  lineto.replace(Path.LINETO_STRING_REGEX, function(whole, one, two, three) {
    // If three chunks matched there's a leading L or l. Use that to update
    // our conception of relative vs. absolute coordinates.
    if (three) {
      relative = (one === 'l');
      var x = parseInt(two, 10);
      var y = parseInt(three, 10);
    } else {
      var x = parseInt(one, 10);
      var y = parseInt(two, 10);
    }

    if (relative) {
      x += points[points.length - 1][0];
      y += points[points.length - 1][1];
    }
    points.push([x, y]);
  });

  // If the string is closed then we have to duplicate the initial point as
  // the last point to properly duplicate the path semantics in point form.
  if (closed) {
    points.push(opener);
  }

  return points;
};


/**
 * A utility function for producing a valid SVG data path from a point array.
 * Note that paths produced by this routine always use absolute references and
 * do not optimize for consecutive sequences of lineto commands.
 * @param {Object} arg The presumed array of x,y point pairs to convert.
 * @return {string} The SVG data path string representing the point array.
 */
Path.pointArrayAsPath = function(arg) {
  if (!Path.isPointArray(arg)) {
    return;
  }

  // Make a copy, in case we modify we don't want to affect the input.
  var points = arg.slice(0);

  // If the path is closed track that and eliminate the final point.
  var closed = false;
  if ((points[0][0] === points[points.length - 1][0]) &&
      (points[0][1] === points[points.length - 1][1])) {
    closed = true;
    points.length = points.length - 1;
  }

  // Inject a string value with each point representing the command.
  points = points.map(function(item, index) {
    return (index == 0 ? 'M' : 'L') + item[0] + ' ' + item[1];
  });
  var str = points.join(' ');

  // If it's a closed path add a final 'Z' to wrap things up.
  if (closed) {
    str += ' Z';
  }

  return str;
};

// ------------------------------------------------------------------------
// Path Instance Definition
// ------------------------------------------------------------------------

// Make the prototype of our Path constructor an array. This will allow
// instances of Path to behave like array instances for most operations.
Path.prototype = [];


/**
 * The internal representation of the path in string form.
 * @type {string}
 * @private
 */
Path.prototype.path_ = null;


/**
 * Returns a new Path instance with identical points to the receiver.
 * @return {Path} A new duplicate Path.
 */
Path.prototype.clone = function() {
  return this.slice(0);
};


/**
 * Iterates over the points in the current path, filtering them based on the
 * test logic in 'callback'. Points for which callback returns true will be
 * used to attempt to produce a new path instance.
 * @param {Function(Object, Number, Array)} callback A filtering function
 *     taking a value, index, and the Path itself. The filter function should
 *     return true if the value should be preserved in the result Path.
 * @param {Object} thisObject An optional binding context.
 * @return {Path} A new path based on the filtered point set.
 */
Path.prototype.filter = function(callback, thisObject) {
  return new Path(Array.prototype.filter.call(this, callback, thisObject));
};


/**
 * Iterates over the points in the current path and uses them to produce a new
 * set of points which form the basis of a new path. Note that for this
 * operation to function properly the callback function must return an array
 * containing two integer values representing a single point.
 * @param {Function(Object, Number, Array)} callback A processing function
 *     taking a value, index, and the Path itself. The function should return
 *     a new value which will be placed in the returned Array.
 * @param {Object} thisObject An optional binding context.
 * @return {Path} A new path created using the points returned by callback.
 */
Path.prototype.map = function(callback, thisObject) {
  return new Path(Array.prototype.map.call(this, callback, thisObject));
};


/**
 * Sets the receiver's path string to the path stringp provided. Any point
 * array information is also updated as a result of this call.
 * @param {Array.<Array>} arg A valid point array per Path.isPointArray.
 * @return {Path} The receiver.
 */
Path.prototype.setPath = function(arg) {
  if (!Path.isPathString(arg)) {
    Path.invalidPath(arg);
  }

  // Cache the original string representation provided.
  this.path_ = arg;

  // Truncate and then merge points into the receiver.
  this.length = 0;
  this.push.apply(this, Path.pathAsPointArray(arg));

  return this;
};


/**
 * Sets the receiver's point data set to the point array provided. Any path
 * string information is also updated as a result of this call.
 * @param {Array.<Array>} arg A valid point array per Path.isPointArray.
 * @return {Path} The receiver.
 */
Path.prototype.setPoints = function(arg) {
  if (!Path.isPointArray(arg)) {
    Path.invalidPath(arg);
  }

  // Update any existing and potentially conflicting path string data.
  this.path_ = Path.pointArrayAsPath(arg);

  // Truncate and then merge points into the receiver.
  this.length = 0;
  this.push.apply(this, arg);

  return this;
};


/**
 * Slices a subset of the points out of the current path and uses them to
 * create a new path.
 * @param {Number} start The starting index. Default is 0.
 * @param {Number} end The ending index. Default is the end of the path.
 * @return {Path} A new path created from the slices point subset.
 */
Path.prototype.slice = function(start, end) {
  return new Path(Array.prototype.slice.apply(this, arguments));
};


/**
 * Returns the string representation of the Path in a form suitable for use
 * in the 'd' attribute of an svg:path element.
 * @return {string} A string representation of the path.
 */
Path.prototype.toString = function() {
  return this.path_;
};

// ========================================================================
