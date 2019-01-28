/**
 * Custom JS.
 */

import {
  curve,
  line,
  polygon,
  rectangle,
  render,
  text,
} from '/lib/svg.mjs';

// Working with 400 x 300 viewbox.
const skill = [
  line(50, 0, 50, 200), // Y-axis.
  polygon([[50, 0], [40, 10], [60, 10]], {fill: 'black'}),
  text('value', 0, 115, {transform: 'rotate(270, 40, 100), translate(0, -20)'}),
  line(50, 200, 400, 200), // X-axis.
  polygon([[400, 200], [390, 190], [390, 210]], {fill: 'black'}),
  text('skill', 200, 250, {fill: 'green'}),
  curve([
    [50, 200], // No skill, no value.
    [75, 175],
    [100, 25], // Increasing skill, increased value.
    [150, 10],
    [375, 25], // Sustained plateau of high value.
    [400, 175] // Excessive skill, no value.
  ], {
    stroke: 'green',
  }),
];

render('#utility-chart-skill', skill);

render('#utility-chart-size', [
  ...skill,

  text('team/code size', 120, 280, {fill: 'red'}),
  curve([
    [50, 175], // No size, not so much value.
    [75, 170],
    [100, 165],
    [125, 160], // Increasing skill, increased value.
    [150, 155],
    [175, 150],
    [200, 145],
    [225, 140],
    [375, 100],
    [400, 10] // Exponential take-off.
  ], {
    stroke: 'red',
  }),
]);
