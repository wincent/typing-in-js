/**
 * Custom JS.
 */

/**
 * Inappropriately "clever" (stupid) wrappers to make working with Rough
 * API a little more concise.
 */

function makeNamedFunction(name, body) {
  return {[name](...args) {return body(...args)}}[name];
}

const [
  curve,
  line,
  polygon,
  rectangle,
] = [
  'curve',
  'line',
  'polygon',
  'rectangle',
].map(name => {
  return makeNamedFunction(name, (...args) => {
    return function(context) {
      return context[name](...args);
    }
  });
});

function render(selector, instructions) {
  const svg = document.querySelector(selector);
  if (svg) {
    const r = rough.svg(svg);
    instructions.forEach(step => {
      svg.appendChild(step(r));
    });
  }
}

/**
 * Other helpers.
 */

const namespace = 'http://www.w3.org/2000/svg';

function text(content, attributes) {
  return function () {
    const g = document.createElementNS(namespace, 'g');
    const t = document.createElementNS(namespace, 'text');
    Object.entries(attributes).forEach(([key, value]) => {
      t.setAttribute(key, value);
    });
    t.appendChild(document.createTextNode(content));
    g.appendChild(t);
    return g;
  }
}

// Working with 400 x 300 viewbox.
const skill = [
  line(100, 0, 100, 200), // Y-axis.
  polygon([[100, 0], [110, 10], [90, 10]], {fill: 'black'}),
  text('value', {x: 10, y: 100}),
  line(100, 200, 400, 200), // X-axis.
  polygon([[400, 200], [390, 190], [390, 210]], {fill: 'black'}),
  text('skill', {x: 225, y: 250, style: 'fill: green'}),
  curve([
    [100, 200], // No skill, no value.
    [125, 175],
    [150, 25], // Increasing skill, increased value.
    [200, 10],
    [375, 25], // Sustained plateau of high value.
    [400, 175] // Excessive skill, no value.
  ], {
    stroke: 'green',
  }),
];
render('#utility-chart-skill', skill);

render('#utility-chart-size', [
  ...skill,

  text('team/code size', {x: 135, y: 280, style: 'fill: red'}),
  curve([
    [100, 175], // No size, not so much value.
    [125, 170],
    [150, 165],
    [175, 160], // Increasing skill, increased value.
    [200, 155],
    [225, 150],
    [250, 145],
    [275, 140],
    [375, 100],
    [400, 10] // Exponential take-off.
  ], {
    stroke: 'red',
  }),
]);
