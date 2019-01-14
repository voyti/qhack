import AudioService from './audio.js';
import BoardService from './board.js';

const LINE_HEIGHT = 30;
const FONT_COLOR = '#C3E591';
const LINE_MARGIN_Y = 50;
const LINE_DRAW_TIME_WARP = 5;

let frequencySelected;
let solarArraysOnline;
let powerAvailable;
let capacitorLevel;
let maxCapacitorLevel;
let minOperationalCapacitorLevel;
let maxQubits;
let qubitsOperational;
let crackChance;
let lastTimeToLockDown;
let lastTimeToLockDownUpdate; // timestamp of update
let discoverableSignatures;

let smallDisplayLocked = false;

let bigCanvas = {
  WIDTH: 1025,
  HEIGHT: 768,
};

let smallCanvas = {
  WIDTH: 721,
  HEIGHT: 484,
};

const getSpaces = (num) => Array.from(Array(num)).map(() => ' ').join('');

// \u25A0 = ■, \u25A1 = □, \u25D9 = ◙
const getCapacitorMarkAtLevel = (level) => {
  if (level < minOperationalCapacitorLevel) {
    return capacitorLevel <= level ? '\u25A1' : '\u25D9';
  } else {
    // return capacitorLevel <= level ? '\u200A\u200A\u25A1' : '\u25A3';
    return capacitorLevel <= level ? '\u25A1' : '\u25A0';
  }
};
const getCapacitorSpacePadding = () => getSpaces(38);

const getChanceText = () => crackChance > 10 ? crackChance.toFixed(0) : ` ${crackChance.toFixed(0)}`;

const getChanceMarkAtLevel = (level) => {
  if (capacitorLevel === level) {
    const chanceString = getChanceText();
    return `crack chance: ~${chanceString}%`;
  } else {
    const labelMap = { 1: ' 0%', 12: '80%' };
    return `${getSpaces(15)}${labelMap[level] || '   '}`;
  }
};
const getFrequencySelectionMark = (freq) => frequencySelected === freq ? '> ' : '  ';
const emptyLine = { text: '', time: 10 };
const hashLine = { text: '############', time: 500 };
const getTimeToLockDown = () => `${lastTimeToLockDown - (Date.now() - lastTimeToLockDownUpdate)} ms`;

const initLinesBig = [
  { text: '------ INITIALIZING UPLINK TO STATION TERMINAL ------', time: 2000 },
  { text: 'Station Hello; Permission Level: MAINTENANCE', time: 1000 },
  { text: 'Requesting station base data...', time: 1000 },
  { text: 'Base data received with status: 200 OK', time: 100 },
  emptyLine, hashLine, emptyLine,
  { text: 'Base: Lima Low Orbit Defense Station; Status: Emergecy Shutdown', time: 500 },
  { text: 'Base Power Status: Power available: 1 kW, including 1kW from external source', time: 500 },
  emptyLine, hashLine, emptyLine,
  { text: 'Accesing LODG Misson Data Store...', time: 500 },
  { text: 'Access Denied, Minimal Permission Level required: CRITICAL', time: 700, afterTime: 1000 },
  emptyLine,
  { text: 'WARN: Authorization request from "MLOS-2" received, denied.', time: 500, afterTime: 1000 },
  { text: 'WARN: Authorization request from "MLOS-2" received, denied.', time: 500, afterTime: 1000 },
  { text: 'WARN: Authorization request from "MLOS-2" received, denied.', time: 500 },
  { text: '', time: 1000 },
  { text: 'CRITICAL 1/2: The Master Password needs to be provided in: 300000ms', time: 1500 },
  { text: 'CRITICAL 2/2: to prevent lockdown, emergency decompression and data wipe', time: 1500 },
  { text: '', time: 1000 },
  { text: 'Accesing LODG Power Circuit Maintenance and Repair... Granted', time: 200 },
  { text: '', time: 1000 },
  { text: 'Press Enter to continue...', time: 1000 },
];

const initLinesSmall = [
  { text: '--- INITIALIZING UPLINK TO THE ONBOARD QUANTUM COMPUTER ---', time: 2000 },
  { text: 'Using external power grid "Lima Low Orbit Defense Station"', time: 1000 },
  { text: 'External Power Grid compatible, connection successful', time: 1000 },
  { text: 'Available Physical Qubits: 800', time: 500 },
  { text: 'Optimal Power Requirement: 80kW', time: 500 },
  emptyLine, hashLine,
  { text: '', time: 3000 },
  { text: 'Access Attempt 1/3... Denied', time: 500, afterTime: 1200 },
  { text: 'Access Attempt 2/3... Denied', time: 500, afterTime: 1200 },
  { text: 'Access Attempt 3/3... Denied', time: 500 },
  { text: 'Station Access Denied after 3 attempts', time: 1000 },
  { text: '', time: 2500 },
  { text: 'Key: RSA, 2048 bit', time: 1000 },
  { text: 'Opening UTIL: Quantum Key Cracking...', time: 1000 },
];

const configLinesBig = [
  { text: '------ LODG Power Circuit Maintenance and Repair ------', time: 1000 },
  { text: 'WARN: Malfunction - grid advanced node mapping failed', time: 1000 },
  { text: 'WARN: Falling back to the discoverable grid mode', time: 1000 },
  { text: 'Pick frequency for grid node discovery', time: 1000 },
  emptyLine, hashLine, emptyLine,
  { text: 'NOTE: Higher frequency will allow faster grid discovery', time: 1000 },
  { text: 'NOTE: Lower frequency can be easier for successful manual discovery', time: 1000 },
  { text: '', time: 100 },

  { text: 'Pick preferered frequency:', time: 1000 },
  { text: () => `${getFrequencySelectionMark(0.5)} 0.5Hz   (easy)`, time: 300 },
  { text: () => `${getFrequencySelectionMark(1)}   1Hz   (normal)`, time: 300 },
  { text: () => `${getFrequencySelectionMark(2)}   2Hz   (hard)`, time: 300 },
  { text: '', time: 100 },
  { text: 'Press Enter to confirm selection and proceed to grid discovery', time: 1000 },
];

const configLinesSmall = [
  { text: () => `MLOS OQC 1.1                         Solar Arrays Online: ${solarArraysOnline}/8`, time: 1000 },
  { text: () => `MODE: Space Station Link             Power Available : ${powerAvailable.toFixed(1)}kW`, time: 1000 },
  { text: () => `UTIL: Quantum Key Cracking           Qubits Operational: ${qubitsOperational}/${maxQubits}`, time: 1000 },
  { text: '', time: 1000 },
  { text: () => '                                                  Capacitor:', time: 500 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(12)} ${getCapacitorMarkAtLevel(12)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(11)} ${getCapacitorMarkAtLevel(11)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(10)} ${getCapacitorMarkAtLevel(10)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(9)} ${getCapacitorMarkAtLevel(9)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(8)} ${getCapacitorMarkAtLevel(8)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(7)} ${getCapacitorMarkAtLevel(7)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(6)} ${getCapacitorMarkAtLevel(6)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(5)} ${getCapacitorMarkAtLevel(5)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(4)} ${getCapacitorMarkAtLevel(4)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(3)} ${getCapacitorMarkAtLevel(3)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(2)} ${getCapacitorMarkAtLevel(2)}`, time: 50, lineHeight: 14 },
  { text: () => `${getCapacitorSpacePadding()}${getChanceMarkAtLevel(1)} ${getCapacitorMarkAtLevel(1)}`, time: 50, lineHeight: 14 },
];

const getCrackingCallText = () => capacitorLevel >= minOperationalCapacitorLevel ?
  `${getSpaces(20)}>>>  PRESS ENTER TO ATTEMPT CRACKING (${getChanceText()}%)  <<<` : `${getSpaces(20)}--- CHARGING... ---`;

const gameLinesSmall = [...configLinesSmall,
  emptyLine, emptyLine, emptyLine,
  { text: getCrackingCallText, time: 1000 },
];

const gameLinesBig = [
  { text: () => 'LODG Power Circuit Maintenance and Repair 1.0', time: 500, },
  emptyLine,
  { text: () => `Discoverable Signatures: ${discoverableSignatures.toString()}`, time: 500, callback: () => setLargeFontStyles() },
  emptyLine,
  { text: () => `Time To Lockdown: ${getTimeToLockDown()}`, time: 500, callback: () => setHugeFontStyles() },
  emptyLine, emptyLine, emptyLine, emptyLine, emptyLine, emptyLine,
  emptyLine, emptyLine, emptyLine, emptyLine, emptyLine, emptyLine,
  emptyLine, emptyLine, emptyLine, emptyLine, emptyLine, emptyLine,
  { text: () => `${getSpaces(70)}Grid frequency: ${frequencySelected}Hz`, time: 500, callback: () => setDefaultFontStyles() },
];

const displayLineAndQueueNext = (canvas, lines, i, fx, fy, noBuzz, noDelay) => {
  setDefaultFontStyles();
  if (i === 0 && !noDelay) canvas.isLocked = true;

  const delayTime = lines[i].time + (lines[i].afterTime || 0);
  const ctx = canvas.ctx;

  const curText = lines[i].text;
  const lineText = typeof curText === 'function' ? curText() : curText;

  const redrawPrevious = (i) => {
    const redrawPrev = (i) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      if (i > 0) displayLineAndQueueNext(canvas, lines.slice(0, i), 0, fx, fy, noBuzz, true);
    };
    redrawPrev(i);
  };

  (lines[i].callback || (() => {}))();
  if (!noDelay) fillTextGradually(ctx, lineText, lines[i].time, fx(i), fy(i, lines), 0, noBuzz, redrawPrevious, i);
  if (noDelay) fillTextImmediately(ctx, lineText, fx(i), fy(i, lines));

  if (lines[i + 1]) {
    if (!noDelay) {
      setTimeout(() =>
        ((i) => displayLineAndQueueNext(canvas, lines, i, fx, fy, noBuzz, noDelay))(i + 1), delayTime / LINE_DRAW_TIME_WARP);
    }
    if (noDelay) displayLineAndQueueNext(canvas, lines, i + 1, fx, fy, noBuzz, noDelay);
  } else if (!noDelay) {
    canvas.isLocked = false;
  }
};

function fillTextGradually(ctx, text, fullTime, txtX, txtY, charIdx, noBuzz, preDraw, lineIdx) {

  const operation = (_charIdx, _lineIdx) => {
    (preDraw || (() => {}))(_lineIdx);
    if (!noBuzz) AudioService.playBuzz();
    let _i = _charIdx || 0;
    let curText = text.substring(0, _i + 1);

    ctx.fillText(curText, txtX, txtY);
    _i++;

    if (_i < text.length) {
      fillTextGradually(ctx, text, fullTime, txtX, txtY, _i, noBuzz, preDraw, _lineIdx);
    } else if (!noBuzz) {
      AudioService.pauseBuzz();
    }
  };

  setTimeout(() => operation(charIdx, lineIdx), fullTime / text.length / LINE_DRAW_TIME_WARP);
}

function fillTextImmediately(ctx, text, txtX, txtY) {
  ctx.fillText(text, txtX, txtY);
}

const getBigLineX = () => bigCanvas.WIDTH / 2 - 500;
const getSmallLineX = () => smallCanvas.WIDTH / 2 - 340;

const getCumulY = (i, lines) =>
  lines.slice(0, i)
    .map((line) => line.lineHeight || LINE_HEIGHT)
    .reduce((sum, num) => (sum += num), 0); // eslint-disable-line no-param-reassign

const getLineBaseY = () => (bigCanvas.HEIGHT / 10) - LINE_MARGIN_Y;
const getLineY = (i, lines) => getLineBaseY() +
  (i > 0 ? getCumulY(i - 1, lines) + (lines[i - 1].lineHeight || LINE_HEIGHT) : 0);

function displayStationScheme() {
  const scheme = document.querySelector('.station-scheme');
  scheme.classList.add('loaded');
}

function clearBigScreen() {
  bigCanvas.ctx.clearRect(0, 0, bigCanvas.WIDTH, bigCanvas.HEIGHT);
}

function clearSmallScreen() {
  smallCanvas.ctx.clearRect(0, 0, smallCanvas.WIDTH, smallCanvas.HEIGHT);
}

function startRefreshInterval(interval, gameState) {
  setInterval(() => refreshScreens(gameState), interval);
}

function refreshScreens(gameState) {
  const refreshMap = {
    config: { small: configLinesSmall, big: configLinesBig },
    discovery: { small: gameLinesSmall, big: gameLinesBig, board: true },
  };

  const refreshRequirement = refreshMap[gameState] || {};
  if (refreshRequirement.small && !smallCanvas.isLocked) {
    clearSmallScreen();
    displayLineAndQueueNext(smallCanvas, refreshRequirement.small, 0, getSmallLineX, getLineY, true, true);
  }
  if (refreshRequirement.big && !bigCanvas.isLocked) {
    clearBigScreen();
    displayLineAndQueueNext(bigCanvas, refreshRequirement.big, 0, getBigLineX, getLineY, true, true);
  }

  if (refreshRequirement.board) {
    BoardService.refreshBoard(bigCanvas.ctx);
  }

}

function setDefaultFontStyles() {
  bigCanvas.ctx.font = '18px Courier New';
  bigCanvas.ctx.fillStyle = FONT_COLOR;

  smallCanvas.ctx.font = '18px Courier New';
  smallCanvas.ctx.fillStyle = FONT_COLOR;
}

function setLargeFontStyles() {
  bigCanvas.ctx.font = '22px Courier New';
  smallCanvas.ctx.font = '22px Courier New';
}

function setHugeFontStyles() {
  bigCanvas.ctx.font = '30px Courier New';
  smallCanvas.ctx.font = '30px Courier New';
}

export default {

  initDrawing: () => {
    const bigCanvasEl = document.getElementById('big-display');
    const smallCanvasEl = document.getElementById('small-display');
    bigCanvas.element = bigCanvasEl;
    smallCanvas.element = smallCanvasEl;

    if (bigCanvasEl.getContext) bigCanvas.ctx = bigCanvasEl.getContext('2d');
    if (smallCanvasEl.getContext) smallCanvas.ctx = smallCanvasEl.getContext('2d');
  },

  setBigScreenStateLoaded: () => bigCanvas.element.classList.add('loaded'),
  setSmallScreenStateLoaded: () => smallCanvas.element.classList.add('loaded'),

  drawInitConnection: (doneCallback) => {
    initLinesBig[initLinesBig.length - 1].callback = doneCallback;

    displayLineAndQueueNext(bigCanvas, initLinesBig, 0, getBigLineX, getLineY);
    displayLineAndQueueNext(smallCanvas, initLinesSmall, 0, getSmallLineX, getLineY, true);
  },

  drawConfig: (doneCallback) => {
    const configSmallLines = Object.assign([], configLinesSmall);
    configSmallLines[configSmallLines.length - 1].callback = doneCallback;

    displayLineAndQueueNext(bigCanvas, [...configLinesBig], 0, getBigLineX, getLineY);
    displayLineAndQueueNext(smallCanvas, configSmallLines, 0, getSmallLineX, getLineY, true);

    setTimeout(() => displayStationScheme(), 2000);
  },

  drawDiscovery: (doneCallback, gameState) => {
    const gameBigLines = Object.assign([], gameLinesBig);
    gameBigLines[gameBigLines.length - 1].callback = doneCallback;

    displayLineAndQueueNext(bigCanvas, [...gameBigLines], 0, getBigLineX, getLineY);
    displayLineAndQueueNext(smallCanvas, gameLinesSmall, 0, getSmallLineX, getLineY, true, true);
    BoardService.initBoard(frequencySelected, discoverableSignatures);
    // setTimeout(() => BoardService.refreshBoard(bigCanvas.ctx), 2000);
    startRefreshInterval(12, gameState);
  },

  clearScreens: () => {
    clearBigScreen();
    clearSmallScreen();
  },

  applyGameData: (gameData, gameState) => {
    powerAvailable = gameData.power;
    capacitorLevel = gameData.capacitorLevel;
    maxCapacitorLevel = gameData.maxCapacitorLevel;
    minOperationalCapacitorLevel = gameData.minOperationalCapacitorLevel;
    maxQubits = gameData.maxQubits;
    qubitsOperational = gameData.qubitsOperational;
    solarArraysOnline = gameData.solarArraysOnline;
    crackChance = gameData.crackChance;
    lastTimeToLockDown = gameData.timeToLockDown || lastTimeToLockDown;
    lastTimeToLockDownUpdate = Date.now();
    discoverableSignatures = gameData.discoverableSignatures;

    // capacitorLevel = Math.floor(Math.random() * 20);
    // crackChance = 13;
    refreshScreens(gameState);
  },
  setFrequencyData: (frequency) => {
    frequencySelected = frequency;
  },

  applyFrequencyData: (frequency, gameState) => {
    if (gameState === 'config') {
      frequencySelected = frequency;
      refreshScreens(gameState);
    }
  },
};
