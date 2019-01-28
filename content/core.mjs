import dedent from '/vendor/dedent.mjs';

const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_P = 80;
const KEY_SPACE = 32;
const KEY_UP = 38;
const REMOTE_NEXT = 34;
const REMOTE_PREV = 33;

let interval = null;
let presenterMode = !!location.search.match(/\bpresenter\b/);
const notes = document.getElementById('notes');
const slides = document.querySelectorAll('#slides > section');
const timer = document.getElementById('timer');
const hash = parseInt(location.hash.slice(1), 10);
const currentSlideIndex = isNaN(hash) ?
  0 :
  Math.max(Math.min(slides.length, hash) - 1, 0);
let currentSlide = slides[currentSlideIndex];
showSlide(currentSlide);

if (presenterMode) {
  if (isNaN(hash)) {
    const slide = parseInt(localStorage.getItem('slide'), 10);
    if (!isNaN(slide)) {
      showSlide(slides[slide]);
      pushState(slides[slide]);
    }
  }
  document.getElementById('presenter').classList.remove('hidden');
  showTimer();
} else {
  notes.classList.add('hidden');
}

function zeroPad(number) {
  return number < 10 ? '0' + number : number;
}

let start = null;
function showTimer() {
  timer.classList.remove('hidden');
  if (!start) {
    // First time here.
    start = Date.now();
  }

  interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timer.innerText = zeroPad(minutes) + ':' + zeroPad(seconds);
  }, 250);
}

function hideTimer() {
  timer.classList.add('hidden');
  clearInterval(interval);
}

function resetBuilds(element) {
  element.querySelectorAll('.build.done').forEach(build => {
    build.classList.remove('done');
  });
}

function next() {
  const nextBuild = currentSlide.querySelector('.build:not(.done)');
  if (nextBuild) {
    nextBuild.classList.add('done');
  } else {
    const nextElement = currentSlide.nextElementSibling;
    if (nextElement) {
      resetBuilds(currentSlide);
      pushState(nextElement);
      showSlide(nextElement, true);
    }
  }
}

function previous() {
  const previousElement = currentSlide.previousElementSibling;
  if (previousElement) {
    resetBuilds(currentSlide);
    pushState(previousElement);
    showSlide(previousElement, true);
  }
}

function showSlide(slide, broadcast) {
  if (slide) {
    currentSlide.classList.remove('current');
    slide.classList.add('current');
    currentSlide = slide;
    if (presenterMode) {
      updatePresenterNotes(slide);
    }
    if (broadcast) {
      localStorage.setItem(
        'slide',
        Array.prototype.indexOf.call(slides, slide)
      );
    }
  }
}

function updatePresenterNotes(slide) {
  const comments = Array.prototype.filter.call(
    slide.childNodes,
    child => child.nodeType === Node.COMMENT_NODE
  );
  const content = comments.reduce((acc, comment) => {
    const p = document.createElement('p');
    p.innerHTML = comment.textContent.trim();
    return acc.concat(p);
  }, []);
  while (notes.firstChild) {
    notes.removeChild(notes.firstChild);
  }
  content.forEach(child => notes.appendChild(child));
  if (content.length) {
    notes.classList.remove('hidden');
  } else {
    notes.classList.add('hidden');
  }
}

function pushState(slide) {
  if (slide) {
    const index = Array.prototype.indexOf.call(slides, slide);
    history.pushState({index}, '', '#' + (index + 1));
  }
}

function setBackground(element) {
  const classList = element.classList;
  classList.add('photo');
  if (classList.contains('dark')) {
    const tint = `
      linear-gradient(
        rgba(0, 0, 0, 0.5),
        rgba(0, 0, 0, 0.5)
      )
    `;
    element.style.backgroundImage = `${tint}, url(${element.dataset.photo})`;
  } else if (classList.contains('light')) {
    const tint = `
      linear-gradient(
        rgba(255, 255, 255, 0.5),
        rgba(255, 255, 255, 0.5)
      )
    `;
    element.style.backgroundImage = `${tint}, url(${element.dataset.photo})`;
  } else {
    element.style.backgroundImage = `url(${element.dataset.photo})`;
  }
}

function dedentTextContent(element) {
  const text = element.textContent;
  element.textContent = dedent`${text}`;
}

function renderMarkdown(element, text) {
  text = text || dedent`${element.textContent}`;
  const rendered = markdownit().render(text);

  // Instead of just blowing everything away by setting innerHTML,
  // specifically find the text node(s) and replace only it
  // (them), thus preserving comments (and therefore presenter
  // notes).
  const textNodes = [];
  const visit = node => {
    if (!node) {
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    }
    visit(node.firstChild);
    if (node !== element) {
      visit(node.nextSibling);
    }
  };
  visit(element);
  const [first, ...rest] = textNodes;
  const target = first || element;
  const replacement = document.createElement('div');
  target.parentNode.replaceChild(replacement, target);
  replacement.outerHTML = rendered;
  rest.forEach(node =>  node.parentNode.removeChild(node));
}

window.onpopstate = ({state}) => {
  if (state && state.index != null) {
    showSlide(slides[state.index], true);
  }
};

window.onload = () => {
  document.querySelectorAll('[data-photo]').forEach(setBackground);
  adjustPreElements();
  document.querySelectorAll('script[type^="text/"]').forEach(loadContentInIframe);
  document.querySelectorAll('pre > code').forEach(element => {
    dedentTextContent(element);
    hljs.highlightBlock(element);
  });
  document.querySelectorAll('.markdown').forEach(element => {
    renderMarkdown(element);
  });
};

document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
  }
  const keyCode = event.keyCode;
  switch (keyCode) {
    case KEY_DOWN:
    case KEY_RIGHT:
    case KEY_SPACE:
    case REMOTE_NEXT:
      next();
      break;
    case KEY_LEFT:
    case KEY_UP:
    case REMOTE_PREV:
      previous();
      break;
    case KEY_P:
      togglePresenterMode();
      break;
    default:
      return;
  }
  event.preventDefault();
});

const body = document.getElementsByTagName('body')[0];

function loadContentInIframe(content) {
  const iframe = document.createElement('iframe');
  iframe.onload = function() {
    const extension = content.src.match(/\.([a-z]+)$/)[1];
    const text = iframe.contentDocument.body.innerText;
    if (extension === 'md') {
      const div = document.createElement('div');
      content.parentNode.replaceChild(div, content);
      renderMarkdown(div, text);
    } else {
      const code = document.createElement('code');
      code.innerText = text;
      if (extension === 'txt') {
        code.classList.add('nohighlight');
      } else {
        code.classList.add(extension);
      }
      const pre = document.createElement('pre');
      pre.appendChild(code);
      pre.className = content.className;
      content.parentElement.replaceChild(pre, content);
      adjustPreElement(pre, code);
      hljs.highlightBlock(pre);
    }
  };
  iframe.src = content.src;
  body.appendChild(iframe);
}

// Simplistic determination of available height (just looks at inner
// slide height, not at siblings).
function getAvailableHeight(element) {
  const {
    marginBottom,
    marginTop,
    paddingBottom,
    paddingTop,
  } = window.getComputedStyle(element);
  let parent = element;
  while ((parent = parent.parentNode)) {
    if (parent.tagName === 'SECTION') {
      return (
        parseInt(window.getComputedStyle(parent).height, 10) -
        parseInt(marginBottom, 10) -
        parseInt(marginTop, 10) -
        parseInt(paddingBottom, 10) -
        parseInt(paddingTop, 10)
      );
    }
  }
}

function adjustPreElement(pre, code) {
  if (
    pre.classList.contains('left') ||
    pre.classList.contains('center')
  ) {
    code.style.position = 'static';
    return;
  }
  const {width: preWidth} = window.getComputedStyle(pre);
  const codeWidth = code.offsetWidth;
  const {
    fontSize,
    height: codeHeight,
  } = window.getComputedStyle(code);
  const availableHeight = getAvailableHeight(pre);
  const adjustmentRatio = Math.min(
    availableHeight ? (availableHeight / parseInt(codeHeight, 10)) : Infinity,
    codeWidth ? (parseInt(preWidth, 10) / parseInt(codeWidth, 10)) : Infinity
  );
  code.style.position = 'static';
  if (!isFinite(adjustmentRatio)) {
    return;
  }
  const adjustedSize = parseFloat(fontSize) * adjustmentRatio;
  code.style.fontSize = adjustedSize + 'px';
}

function adjustPreElements() {
  document.querySelectorAll('pre > code').forEach(code => {
    const pre = code.parentElement;
    adjustPreElement(pre, code);
  });
}

function togglePresenterMode() {
  const toggle = document.getElementById('presenter-toggle');
  presenterMode = !presenterMode;
  if (presenterMode) {
    toggle.innerText = 'ON';
    updatePresenterNotes(currentSlide);
    notes.classList.remove('hidden');
    document.getElementById('presenter').classList.remove('hidden');
    showTimer();
  } else {
    toggle.innerText = 'OFF';
    notes.classList.add('hidden');
    hideTimer();
  }
}

body.addEventListener('click', event => {
  const target = event.target;
  if (target.id === 'presenter-toggle') {
    togglePresenterMode();
  }
});

window.addEventListener('storage', event => {
  if (event.key === 'slide') {
    const slide = slides[event.newValue];
    if (slide) {
      showSlide(slide);
      pushState(slide)
    } else {
      console.warn(
        'Unable to find slide for "slide" event value',
        event.newValue
      );
    }
  }
}, false);
