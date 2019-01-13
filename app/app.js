import AudioService from './audio.js';
import DrawingService from './drawing.js';

let gameState = 'preinit';

const availableFrequencies = [0.5, 1, 2];
let frequencySelected = availableFrequencies[0];

const basePower = 1; // in kW
let maxPower = 80; // in kW
let powerAvailable = basePower; // in kW

let maxCharge = 120000; // in Coulombs
let chargeAvailable = 0;

const maxQubits = 80;
const chargePerQubit = maxCharge / maxQubits;
let qubitsOperational = 0;

const powerPerSolarArray = 10;
let solarArraysOnline = 0;

const maxCrackChance = 80;
const maxCapacitorLevel = 12;
let capacitorLevel = 0;
let capacitorChargePerSecond = () => (0.1 * powerAvailable); // per second

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

function init() {
  DrawingService.setFrequencyData(frequencySelected, gameState);

  DrawingService.initDrawing();
  initializePowerManager();
  initializePhaseTerminal();
  // initializePhaseConfig();

  document.body.onkeydown = (e) => {

    const inputMap = {
      13: 'enter',
      38: 'up',
      40: 'down',
    };

    if (inputMap[e.keyCode] === 'enter' && gameState === 'postinit') {
      initializePhaseConfig();
    } else if (inputMap[e.keyCode] === 'enter' && e.altKey && gameState === 'preinit') {
      initializePhaseConfig();
    }

    if (gameState === 'config') {
      const input = inputMap[e.keyCode];
      // DrawingService.applyInput(input);
      frequencySelected = frequencyChange(input);
      console.warn('frequencySelected: ', frequencySelected);
      DrawingService.applyFrequencyData(frequencySelected, gameState);

      if (input) e.preventDefault();
    }
  };
}

function getPower() {
  const directPower = basePower + (solarArraysOnline * powerPerSolarArray);
  const randomOscilationValue = Math.random() * 0.1 * directPower * (Math.random() > 0.5 ? -1 : 1);
  return directPower + randomOscilationValue;
}

function initializePowerManager() {
  refreshPowerDataLoop();
}

function refreshPowerDataLoop() {
  powerAvailable = getPower();
  chargeAvailable += capacitorChargePerSecond();
  capacitorLevel = Math.floor(chargeAvailable / maxCharge * maxCapacitorLevel);

  const powerData = {
    power: powerAvailable,
    capacitorLevel: capacitorLevel,
    maxQubits: maxQubits,
    qubitsOperational: Math.floor(chargeAvailable / chargePerQubit),
    solarArraysOnline: solarArraysOnline,
    crackChance: maxCrackChance * (capacitorLevel / maxCapacitorLevel),
  };
  console.debug(powerData, gameState);

  DrawingService.applyPowerData(powerData, gameState);

  setTimeout(() => {
    refreshPowerDataLoop();
  }, 1000);
}

function setGameState(newState) {
  console.log('  -- SETTING GAME STATE: ', newState, '---');
  gameState = newState;
}

function initializePhaseTerminal() {
  gameState = 'preinit';
  const doneCallback = () => setGameState('postinit');

  DrawingService.drawInitConnection(doneCallback);
  setTimeout(() => DrawingService.setBigScreenStateLoaded(), 5000);
  setTimeout(() => DrawingService.setSmallScreenStateLoaded(), 3000);
}

function initializePhaseConfig() {
  const doneCallback = () => (setGameState('config'));

  DrawingService.clearScreens();
  DrawingService.drawConfig(doneCallback);
}

init();
