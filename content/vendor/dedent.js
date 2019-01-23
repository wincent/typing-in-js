"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dedent;

/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * 
 * @license MIT
 */

/**
 * Tagged template literal function that trims leading and trailing whitespace
 * and reduces the indent level back to column 0.
 */
function dedent(strings) {
  for (var _len = arguments.length, interpolations = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    interpolations[_key - 1] = arguments[_key];
  }

  // Insert interpolations in template.
  var output = strings.reduce(function (acc, string, i) {
    if (i < interpolations.length) {
      return acc + string + String(interpolations[i]);
    } else {
      return acc + string;
    }
  }, ''); // Collapse totally blank lines to empty strings.

  var lines = output.split('\n').map(function (line) {
    if (line.match(/^\s+$/)) {
      return '';
    } else {
      return line;
    }
  }); // Find minimum indent (ignoring empty lines).

  var minimum = lines.reduce(function (acc, line) {
    var indent = line.match(/^\s+/);

    if (indent) {
      var length = indent[0].length;
      return Math.min(acc, length);
    }

    return acc;
  }, Infinity); // Strip out minimum indent from every line.

  var dedented = isFinite(minimum) ? lines.map(function (line) {
    return line.replace(new RegExp("^".concat(' '.repeat(minimum)), 'g'), '');
  }) : lines; // Trim first and last line if empty.

  if (dedented[0] === '') {
    dedented.shift();
  }

  if (dedented[dedented.length - 1] === '') {
    dedented.pop();
  }

  return dedented.join('\n');
}