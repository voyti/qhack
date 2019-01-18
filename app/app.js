import AudioService from './audio.js';
import DrawingService from './drawing.js';
import BoardService from './board.js';

let gameState = 'preinit';

const availableFrequencies = [0.5, 1, 2];
const basePower = 1; // in kW
// const basePower = 100; // in kW

const maxCrackChance = 80;
const maxCapacitorLevel = 12;
const minOperationalCapacitorLevel = 5;
const maxCharge = 120000; // in Coulombs
const maxQubits = 80;
const chargePerQubit = maxCharge / maxQubits;
const powerPerSolarArray = 10;
const maxTimeToLockdown = 300000;
const penaltyPeriod = 1000;
const loopRefreshRateMillis = 1000;

let qubitsOperational;
let chargeAvailable;
let solarArraysOnline;
let powerAvailable;
let frequencySelected;
let capacitorLevel;
let capacitorChargePerSecond;
let accruedPenalty;
let timeElapsed;
let discoverableSignatures;
let crackChance;
let timePaused = false;

function resetGameStateValues() {
  qubitsOperational = 0;
  chargeAvailable = 0;
  solarArraysOnline = 0;
  powerAvailable = basePower; // in kW
  frequencySelected = availableFrequencies[0];
  capacitorLevel = 0;
  capacitorChargePerSecond = () => (10 * powerAvailable); // per second
  accruedPenalty = 0;
  timeElapsed = 0;
  discoverableSignatures = [];
  crackChance = 0;
}


function frequencyChange(direction) {
  const curIndex = availableFrequencies.indexOf(frequencySelected);
  let change = 0;
  if (direction === 'down') {
    change = 1;
  } else if (direction === 'up') {
    change = -1;
  }
  if (availableFrequencies[curIndex + change]) {
    return availableFrequencies[curIndex + change];
  } else {
    return frequencySelected;
  }
}

const getSignatureRecalibrationPeriod = () => 2000 * 1 / frequencySelected;

// TODO: all values unique, all values different than previous
function generateDiscoverablesignatures() {
  return Math.random().toString(36).slice(2, 5).toUpperCase().split('');
}

let boardLocked = false;

function init(startAtConfig) {
  resetGameStateValues();
  DrawingService.setFrequencyData(frequencySelected, gameState);

  DrawingService.initDrawing();
  DrawingService.clearScreens();

  initializePowerManager();
  initializePhaseTerminal();
  // initializePhaseConfig();
  if (startAtConfig) initializePhaseConfig();
  // initializePhaseDiscovery();

  const alphabeticalMatcher = (char) => char.match(/[A-Za-z0-9]/);

  document.body.onkeydown = (e) => {

    const inputMap = {
      13: 'enter',
      38: 'up',
      40: 'down',
    };

    if (inputMap[e.keyCode] === 'enter') {
      if (gameState === 'postinit') {
        initializePhaseConfig();
      } else if (gameState === 'config') {
        initializePhaseDiscovery();
      } else if (gameState === 'lose') {
        init(true);
      } else if (gameState === 'discovery') {
        attemptCracking();
      }
    }

    if (gameState === 'config') {
      const input = inputMap[e.keyCode];
      frequencySelected = frequencyChange(input);
      DrawingService.applyFrequencyData(frequencySelected, gameState);

      if (input) e.preventDefault();
    }

    if (gameState === 'discovery') {
      if (alphabeticalMatcher(e.key) && !boardLocked) {
        BoardService.applyInput(e.key, (wrongInput) => {
          if (wrongInput) accruedPenalty += penaltyPeriod;
          setBoardLocked(true);

          setTimeout(() => {
            setBoardLocked(false);

            discoverableSignatures = generateDiscoverablesignatures();
            BoardService.applyDiscoverableSignatures(discoverableSignatures);
            const gameData = getGameDataForDrawing();
            DrawingService.applyGameData(gameData, gameState);
          }, getSignatureRecalibrationPeriod());

          const gameData = getGameDataForDrawing();
          DrawingService.applyGameData(gameData, gameState);
        });
      }
    }
  };
}

function setBoardLocked(locked) {
  boardLocked = locked;
  BoardService.lockSignatures(locked);
  DrawingService.lockSignatures(locked);
}

function getPower() {
  const directPower = basePower + (solarArraysOnline * powerPerSolarArray);
  const randomOscilationValue = Math.random() * 0.1 * directPower * (Math.random() > 0.5 ? -1 : 1);
  return directPower + randomOscilationValue;
}

function initializePowerManager() {
  refreshGameDataLoop();
}

function getGameDataForDrawing() {
  powerAvailable = getPower();
  chargeAvailable += capacitorChargePerSecond();
  if (chargeAvailable > maxCharge) chargeAvailable -= chargeAvailable - maxCharge;
  capacitorLevel = Math.floor(chargeAvailable / maxCharge * maxCapacitorLevel);
  crackChance = maxCrackChance * (capacitorLevel / maxCapacitorLevel);

  return {
    power: powerAvailable,
    maxCapacitorLevel: maxCapacitorLevel,
    minOperationalCapacitorLevel: minOperationalCapacitorLevel,
    capacitorLevel: capacitorLevel,
    maxQubits: maxQubits,
    qubitsOperational: Math.floor(chargeAvailable / chargePerQubit),
    solarArraysOnline: solarArraysOnline,
    crackChance: maxCrackChance * (capacitorLevel / maxCapacitorLevel),
    discoverableSignatures: discoverableSignatures,
  };
}

function refreshGameDataLoop(loopCount) {
  const _loopCount = loopCount || 0;
  timeElapsed = gameState === 'discovery' ? loopRefreshRateMillis * loopCount + accruedPenalty : 0;
  if (timeElapsed > maxTimeToLockdown * 0.7) AudioService.playSecondSound();
  if (timeElapsed >= maxTimeToLockdown) initializePhaseLose();

  const gameData = getGameDataForDrawing();
  gameData.timeToLockDown = maxTimeToLockdown - timeElapsed;
  DrawingService.applyGameData(gameData, gameState);

  setTimeout(() => {
    ((prevLoopCount) => refreshGameDataLoop(prevLoopCount + 1))(_loopCount);
  }, loopRefreshRateMillis);
}

function setGameState(newState) {
  gameState = newState;
}

function attemptCracking() {
  if (capacitorLevel >= minOperationalCapacitorLevel) {
    timePaused = true;
    setGameState('cracking');
    const crackingSucceded = crackChance / 100 > Math.random();
    console.warn('Cracking: crackChance, ', crackChance, ', crackingSucceded: ', crackingSucceded);
    DrawingService.clearScreens();
    const gameData = getGameDataForDrawing();
    DrawingService.applyGameData(gameData, gameState);
    DrawingService.drawCracking(crackingSucceded, (crackingSucceded) => {
      if (crackingSucceded) {
        init(true);
      } else {
        resumeDiscovery();
      }
    }, gameState);
    // DrawingService.drawCracking(crackingSucceded, () => {}, gameState);
  }
}

function initializePhaseTerminal() {
  gameState = 'preinit';
  const doneCallback = (line) => {
    setGameState('postinit');
    // line.callback = () => {};
  };

  DrawingService.drawInitConnection(doneCallback);
  setTimeout(() => DrawingService.setBigScreenStateLoaded(), 5000);
  setTimeout(() => DrawingService.setSmallScreenStateLoaded(), 3000);
}

function initializePhaseConfig() {
  const doneCallback = () => { setGameState('config'); };

  DrawingService.clearScreens();
  DrawingService.drawConfig(doneCallback);
}

function initializePhaseDiscovery() {
  const doneCallback = (line) => {
    setGameState('discovery');
  };
  discoverableSignatures = generateDiscoverablesignatures();
  const gameData = getGameDataForDrawing();
  DrawingService.applyGameData(gameData, gameState);
  BoardService.registerOnSolarArrayUnfoldCallback(() => {
    solarArraysOnline++;
    DrawingService.unfoldNextSolarArray();
  });

  DrawingService.clearScreens();
  DrawingService.drawDiscovery(doneCallback, 'discovery');
}

function resumeDiscovery() {
  setGameState('discovery');
  DrawingService.clearScreens();
  const gameData = getGameDataForDrawing();
  DrawingService.applyGameData(gameData, gameState);

  DrawingService.drawDiscovery(() => {}, 'discovery');
}

function initializePhaseLose() {
  setGameState('prelose');

  const doneCallback = (line) => {
    setGameState('lose');
    // line.callback = () => {};
  };
  DrawingService.clearScreens();
  DrawingService.drawLose(doneCallback);
}

init();
