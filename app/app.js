const FONT_COLOR = '#C3E591';

const bigCanvas = {
  WIDTH: 1025,
  HEIGHT: 768,
};

const smallCanvas = {
  WIDTH: 721,
  HEIGHT: 484,
};

function init() {
  console.log('APP START');
  initDrawing();
  initializeTerminal();
}

function initDrawing() {
  const bigCanvasEl = document.getElementById('big-display');
  const smallCanvasEl = document.getElementById('small-display');
  bigCanvas.element = bigCanvasEl;
  smallCanvas.element = smallCanvasEl;

  if (bigCanvasEl.getContext) bigCanvas.ctx = bigCanvasEl.getContext('2d');
  if (smallCanvasEl.getContext) smallCanvas.ctx = smallCanvasEl.getContext('2d');
}

function initializeTerminal() {
  bigCanvas.ctx.font = '18px Courier New';
  bigCanvas.ctx.fillStyle = FONT_COLOR;

  // bigCanvas.ctx.fillText("Hello World", 10, 50);
  const initLines = [
    {text: '------ INITIALIZING ------', time: 2000 },
    {text: 'Requesting station base data...', time: 1000 },
    {text: 'Base data received with status: 200 OK', time: 100 },

    {text: '', time: 10 },
    {text: '############', time: 500 },
    {text: '', time: 10 },

    {text: 'Base: Lima Low Orbit Defense Station; Status: Lockdown Pending', time: 2000 },
    {text: 'Base Power Status 1/2: 0/8 Solar Arrays Online', time: 1000 },
    {text: 'Base Power Status 2/2: Power available: 1 kW, including 1kW from external source', time: 1000 },

    {text: '', time: 10 },
    {text: '############', time: 500 },
    {text: '', time: 10 },

    {text: 'Requesting station schematics...', time: 200},
    {text: 'Schematics received with status: 200 OK', time: 500 },

    {text: 'Parsing Station layout...', time: 300 },
    {text: 'Loading Station map with nav data...', time: 500 },

    {text: '', time: 10 },
    {text: '############', time: 500 },
    {text: '', time: 10 },

    {text: 'CRITICAL 1/2: The Master Password needs to be provided in: 5000ms', time: 1500 },
    {text: 'CRITICAL 2/2: to prevent lockdown, emergency decompression and data wipe', time: 1500 },
    {text: '', time: 1000 },
    {text: 'For details please contact your system administrator', time: 2000 },
  ];

  // _fillTextGradually(bigCanvas.ctx, initText, 4000, bigCanvas.WIDTH / 2 - 200, bigCanvas.HEIGHT / 2 - 14);

  const LINE_HEIGHT = 30;
  const displayLineAndQueueNext = (ctx, line, i) => {
    const textBottomMargin = (line.addMargin || 0);
    _fillTextGradually(ctx, line.text, line.time, bigCanvas.WIDTH / 2 - 400, (bigCanvas.HEIGHT / 10) - 14 + (i * LINE_HEIGHT));

    if (initLines[i + 1]) {
      setTimeout(() => ((line, i) => displayLineAndQueueNext(ctx, line, i++))(initLines[i + 1], i + 1), line.time);
    }
  };

  displayLineAndQueueNext(bigCanvas.ctx, initLines[0], 0);

  // _fillTextGradually(bigCanvas.ctx, initText, 4000, bigCanvas.WIDTH / 2 - 200, bigCanvas.HEIGHT / 2 - 14);

  setTimeout(() => bigCanvas.element.classList.add('loaded'), 5000);
  setTimeout(() => smallCanvas.element.classList.add('loaded'), 3000);
}

function onTerminalInitialized() {

}

function _fillTextGradually(ctx, text, fullTime, txtX, txtY, i) {
  let _i = i || 0;
  let curText = text.substring(0, _i + 1);

  setTimeout(() => {
    ctx.fillText(curText, txtX, txtY);
    _i++;
    if (_i < text.length) _fillTextGradually(ctx, text, fullTime, txtX, txtY, _i);
  }, fullTime / text.length);
}
