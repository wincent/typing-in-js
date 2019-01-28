/**
 * Inappropriately "clever" (stupid) wrappers to make working with Rough
 * API a little more concise.
 */

function makeNamedFunction(name, body) {
  return {[name](...args) {return body(...args)}}[name];
}

function makeRoughFunction(name) {
  return makeNamedFunction(name, (...args) => {
    return function(context) {
      return context[name](...args);
    }
  });
}

export const curve = makeRoughFunction('curve');
export const line = makeRoughFunction('line');
export const polygon = makeRoughFunction('polygon');
export const rectangle = makeRoughFunction('rectangle');

export function render(selector, instructions) {
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

export function text(content, attributes) {
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
