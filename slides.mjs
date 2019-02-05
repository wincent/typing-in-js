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
} from './lib/svg.mjs';

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

render('#pipeline', [
  rectangle(10, 10, 100, 90),
  text('*.ts', 20, 60, {transform: 'scale(.75)'}),
  text('*.js + Flow', 20, 100, {transform: 'scale(.75)'}),
  line(110, 50, 150, 50),
  polygon([[140, 40], [150, 50], [140, 60]], {fill: 'black'}),
  rectangle(150, 10, 100, 90),
  text('compiler', 220, 80, {transform: 'scale(.75)'}),
  line(250, 50, 290, 50),
  polygon([[280, 40], [290, 50], [280, 60]], {fill: 'black'}),
  rectangle(290, 10, 100, 90),
  text('JavaScript', 400, 80, {transform: 'scale(.75)'}),
]);

// Recompute the 4th quiz example 10 times per second because it is time
// dependent.
//
// Ideally, would have a simple event emitter that I could listen to for
// transition events, but in its absence, just observe the DOM and set-up and
// tear-down based on that.
let interval;
const quiz = document.getElementById('quiz-4');
const observer = new MutationObserver((mutationList) => {
  for (let mutation of mutationList) {
    if (mutation.attributeName === 'class') {
      if (quiz.classList.contains('done')) {
        const number = quiz.querySelector('.hljs-number');
        interval = setInterval(() => {
          number.textContent = 1 / new Date();
        }, 100);
      } else if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  }
});
observer.observe(quiz, {attributes: true});
