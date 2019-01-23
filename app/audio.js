// knowledge sources:
// http://pages.mtu.edu/~suits/notefreqs.html
// http://marcgg.com/blog/2016/11/01/javascript-audio/
// https://www.agiletrailblazers.com/blog/quick-start-to-generate-tones-in-javascript

export default (function() {

  let context = null;
  let buzzSound = null;
  let thudSound = null;
  let popSound = null;
  let arrayUnfoldSound = null;
  let secondSound = null;
  let proceeding1Sound = null;
  let proceeding2Sound = null;
  let departureSound = null;
  let blink1Sound = null;
  let blink2Sound = null;
  let musicVolume = 0.7;
  let musicMuted = false;
  let queueCounter = 0;
  let startedQueue = null;
  let canceledQueues = [];

  const noOp = () => {};

  const TONE_MAP = {
    'NULL': { hz: 0, cm: 0 },
    'C0': { hz: 16.35, cm: 2109.89 },
    'C#0': { hz: 17.32, cm: 1991.47 },
    'D0': { hz: 18.35, cm: 1879.69 },
    'D#0': { hz: 19.45, cm: 1774.20 },
    'E0': { hz: 20.60, cm: 1674.62 },
    'F0': { hz: 21.83, cm: 1580.63 },
    'F#0': { hz: 23.12, cm: 1491.91 },
    'G0': { hz: 24.50, cm: 1408.18 },
    'G#0': { hz: 25.96, cm: 1329.14 },
    'A0': { hz: 27.50, cm: 1254.55 },
    'A#0': { hz: 29.14, cm: 1184.13 },
    'B0': { hz: 30.87, cm: 1117.67 },
    'C1': { hz: 32.70, cm: 1054.94 },
    'C#1': { hz: 34.65, cm: 995.73 },
    'D1': { hz: 36.71, cm: 939.85 },
    'D#1': { hz: 38.89, cm: 887.10 },
    'E1': { hz: 41.20, cm: 837.31 },
    'F1': { hz: 43.65, cm: 790.31 },
    'F#1': { hz: 46.25, cm: 745.96 },
    'G1': { hz: 49.00, cm: 704.09 },
    'G#1': { hz: 51.91, cm: 664.57 },
    'A1': { hz: 55.00, cm: 627.27 },
    'A#1': { hz: 58.27, cm: 592.07 },
    'B1': { hz: 61.74, cm: 558.84 },
    'C2': { hz: 65.41, cm: 527.47 },
    'C#2': { hz: 69.30, cm: 497.87 },
    'D2': { hz: 73.42, cm: 469.92 },
    'D#2': { hz: 77.78, cm: 443.55 },
    'E2': { hz: 82.41, cm: 418.65 },
    'F2': { hz: 87.31, cm: 395.16 },
    'F#2': { hz: 92.50, cm: 372.98 },
    'G2': { hz: 98.00, cm: 352.04 },
    'G#2': { hz: 103.83, cm: 332.29 },
    'A2': { hz: 110.00, cm: 313.64 },
    'A#2': { hz: 116.54, cm: 296.03 },
    'B2': { hz: 123.47, cm: 279.42 },
    'C3': { hz: 130.81, cm: 263.74 },
    'C#3': { hz: 138.59, cm: 248.93 },
    'D3': { hz: 146.83, cm: 234.96 },
    'D#3': { hz: 155.56, cm: 221.77 },
    'E3': { hz: 164.81, cm: 209.33 },
    'F3': { hz: 174.61, cm: 197.58 },
    'F#3': { hz: 185.00, cm: 186.49 },
    'G3': { hz: 196.00, cm: 176.02 },
    'G#3': { hz: 207.65, cm: 166.14 },
    'A3': { hz: 220.00, cm: 156.82 },
    'A#3': { hz: 233.08, cm: 148.02 },
    'B3': { hz: 246.94, cm: 139.71 },
    'C4': { hz: 261.63, cm: 131.87 },
    'C#4': { hz: 277.18, cm: 124.47 },
    'D4': { hz: 293.66, cm: 117.48 },
    'D#4': { hz: 311.13, cm: 110.89 },
    'E4': { hz: 329.63, cm: 104.66 },
    'F4': { hz: 349.23, cm: 98.79 },
    'F#4': { hz: 369.99, cm: 93.24 },
    'G4': { hz: 392.00, cm: 88.01 },
    'G#4': { hz: 415.30, cm: 83.07 },
    'A4': { hz: 440.00, cm: 78.41 },
    'A#4': { hz: 466.16, cm: 74.01 },
    'B4': { hz: 493.88, cm: 69.85 },
    'C5': { hz: 523.25, cm: 65.93 },
    'C#5': { hz: 554.37, cm: 62.23 },
    'D5': { hz: 587.33, cm: 58.74 },
    'D#5': { hz: 622.25, cm: 55.44 },
    'E5': { hz: 659.25, cm: 52.33 },
    'F5': { hz: 698.46, cm: 49.39 },
    'F#5': { hz: 739.99, cm: 46.62 },
    'G5': { hz: 783.99, cm: 44.01 },
    'G#5': { hz: 830.61, cm: 41.54 },
    'A5': { hz: 880.00, cm: 39.20 },
    'A#5': { hz: 932.33, cm: 37.00 },
    'B5': { hz: 987.77, cm: 34.93 },
    'C6': { hz: 1046.50, cm: 32.97 },
    'C#6': { hz: 1108.73, cm: 31.12 },
    'D6': { hz: 1174.66, cm: 29.37 },
    'D#6': { hz: 1244.51, cm: 27.72 },
    'E6': { hz: 1318.51, cm: 26.17 },
    'F6': { hz: 1396.91, cm: 24.70 },
    'F#6': { hz: 1479.98, cm: 23.31 },
    'G6': { hz: 1567.98, cm: 22.00 },
    'G#6': { hz: 1661.22, cm: 20.77 },
    'A6': { hz: 1760.00, cm: 19.60 },
    'A#6': { hz: 1864.66, cm: 18.50 },
    'B6': { hz: 1975.53, cm: 17.46 },
    'C7': { hz: 2093.00, cm: 16.48 },
    'C#7': { hz: 2217.46, cm: 15.56 },
    'D7': { hz: 2349.32, cm: 14.69 },
    'D#7': { hz: 2489.02, cm: 13.86 },
    'E7': { hz: 2637.02, cm: 13.08 },
    'F7': { hz: 2793.83, cm: 12.35 },
    'F#7': { hz: 2959.96, cm: 11.66 },
    'G7': { hz: 3135.96, cm: 11.00 },
    'G#7': { hz: 3322.44, cm: 10.38 },
    'A7': { hz: 3520.00, cm: 9.80 },
    'A#7': { hz: 3729.31, cm: 9.25 },
    'B7': { hz: 3951.07, cm: 8.73 },
    'C8': { hz: 4186.01, cm: 8.24 },
    'C#8': { hz: 4434.92, cm: 7.78 },
    'D8': { hz: 4698.63, cm: 7.34 },
    'D#8': { hz: 4978.03, cm: 6.93 },
    'E8': { hz: 5274.04, cm: 6.54 },
    'F8': { hz: 5587.65, cm: 6.17 },
    'F#8': { hz: 5919.91, cm: 5.83 },
    'G8': { hz: 6271.93, cm: 5.50 },
    'G#8': { hz: 6644.88, cm: 5.19 },
    'A8': { hz: 7040.00, cm: 4.90 },
    'A#8': { hz: 7458.62, cm: 4.63 },
    'B8': { hz: 7902.13, cm: 4.37 },
  };

  const PAD = { tone: 'NULL', duration: 50 };

  const MELODY_0_BAR = [
    { tone: 'E4', duration: 221 }, // B1
    { tone: 'C4', duration: 212 }, // B1
    { tone: 'A3', duration: 221 }, // F2
    { tone: 'C4', duration: 114 }, // b2
  ];

  const MELODY_0 = [
    ...MELODY_0_BAR,
    { tone: 'E4', duration: 221 }, // B1
    { tone: 'C4', duration: 212 }, // B1
    { tone: 'E4', duration: 221 }, // F2
    { tone: 'C4', duration: 114 }, // B1

    ...MELODY_0_BAR,
    { tone: 'E4', duration: 221 }, // B1
    { tone: 'C4', duration: 212 }, // B1
    { tone: 'G4', duration: 221 }, // F2
    { tone: 'C4', duration: 114 }, // B1
  ];

  // Duration: 3 sec
  const MELODY_1_BAR = [
    { tone: 'F#4', duration: 221 }, // B1
    { tone: 'D4', duration: 212 }, // F2
    { tone: 'C#4', duration: 221 }, // b2
    { tone: 'D4', duration: 114 }, // F2
  ];

  const MELODY_1 = [
    ...MELODY_1_BAR,
    { tone: 'F#4', duration: 221 }, // B1
    { tone: 'D4', duration: 212 }, // F2
    { tone: 'F#4', duration: 221 }, // b2
    { tone: 'D4', duration: 114 }, // F2
    ...MELODY_1_BAR,
    { tone: 'F#4', duration: 221 }, // B1
    { tone: 'D4', duration: 212 }, // F2
    { tone: 'A4', duration: 221 }, // b2
    { tone: 'D4', duration: 114 }, // F2
  ];

  const MELODY_2 = [
    { tone: 'F#4', duration: 110 }, // B1
    { tone: 'F#4', duration: 110 }, // B1
    { tone: 'D4', duration: 212 }, // F2
    { tone: 'C#4', duration: 221 }, // b2
    { tone: 'D4', duration: 114 }, // F2

    { tone: 'F#4', duration: 110 }, // B1
    { tone: 'F#4', duration: 110 }, // B1
    { tone: 'D4', duration: 212 }, // F2
    { tone: 'F#4', duration: 110 }, // B1
    { tone: 'F#4', duration: 110 }, // B1
    { tone: 'D4', duration: 114 }, // F2

    { tone: 'F#4', duration: 221 }, // B1
    { tone: 'D4', duration: 212 }, // F2
    { tone: 'C#4', duration: 221 }, // b2
    { tone: 'D4', duration: 114 }, // F2

    { tone: 'F#4', duration: 110 }, // B1
    { tone: 'F#4', duration: 110 }, // B1
    { tone: 'D4', duration: 212 }, // F2
    { tone: 'A4', duration: 110 }, // B1
    { tone: 'A4', duration: 110 }, // B1
    { tone: 'D4', duration: 114 }, // F2
  ];

  const BASS_A_BAR = [
    { tone: 'B1', duration: 221 },
    { tone: 'F2', duration: 212 },
    { tone: 'B2', duration: 221 },
    { tone: 'F2', duration: 114 },
  ];

  const BASS_A = [
    ...BASS_A_BAR,
    ...BASS_A_BAR,
    ...BASS_A_BAR,
    ...BASS_A_BAR,
  ];

  const BASS_B_BAR = [
    { tone: 'G1', duration: 221 },
    { tone: 'D2', duration: 212 },
    { tone: 'G2', duration: 221 },
    { tone: 'D2', duration: 114 },
  ];

  const BASS_B = [
    ...BASS_B_BAR,
    ...BASS_B_BAR,
    ...BASS_B_BAR,
    ...BASS_B_BAR,
  ];


  const BASS_C_BAR = [
    { tone: 'A1', duration: 221 },
    { tone: 'E2', duration: 212 },
    { tone: 'A2', duration: 221 },
    { tone: 'E2', duration: 114 },
  ];
  const BASS_C = [
    ...BASS_C_BAR,
    ...BASS_C_BAR,
    ...BASS_C_BAR,
    ...BASS_C_BAR,
  ];


  const BASS_A0_BAR = [
    { tone: 'A1', duration: 221 },
    { tone: 'E2', duration: 212 },
    { tone: 'A2', duration: 221 },
    { tone: 'E2', duration: 114 },
  ];

  const BASS_A0 = [
    ...BASS_A0_BAR,
    ...BASS_A0_BAR,
    ...BASS_A0_BAR,
    ...BASS_A0_BAR,
  ];

  const BASS_B0_BAR = [
    { tone: 'F1', duration: 221 },
    { tone: 'C2', duration: 212 },
    { tone: 'F2', duration: 221 },
    { tone: 'C2', duration: 114 },
  ];

  const BASS_B0 = [
    ...BASS_B0_BAR,
    ...BASS_B0_BAR,
    ...BASS_B0_BAR,
    ...BASS_B0_BAR,
  ];


  const BASS_C0_BAR = [
    { tone: 'G1', duration: 221 },
    { tone: 'D2', duration: 212 },
    { tone: 'G2', duration: 221 },
    { tone: 'D2', duration: 114 },
  ];
  const BASS_C0 = [
    ...BASS_C0_BAR,
    ...BASS_C0_BAR,
    ...BASS_C0_BAR,
    ...BASS_C0_BAR,
  ];

  let oscilator = null;
  let gain = null;

  const oscilatorTypes = {
    sine: 'sine',
    square: 'square',
    triangle: 'triangle',
    sawtooth: 'sawtooth',
  };

  function playFrequency(frequency, duration, type) { // eslint-disable-line consistent-return
    if (musicMuted || !document.hasFocus()) return null;
    oscilator = context.createOscillator();
    gain = context.createGain();

    oscilator.type = type || oscilatorTypes.sine;
    oscilator.connect(gain);
    oscilator.frequency.value = frequency;
    gain.gain.value = musicVolume;

    gain.connect(context.destination);
    oscilator.start(context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (duration / 1000));
    oscilator.stop(context.currentTime + (duration / 1000));
  }

  function playSequence(tones, i, doneCallback, durationModifier = 1, oscilatorType, queueId) {
    const toneData = tones[i];
    if (!canceledQueues.includes(queueId) && toneData) {
      playFrequency(TONE_MAP[toneData.tone].hz, toneData.duration * durationModifier, oscilatorType);
      setTimeout(
        () => ((i) => playSequence(tones, i, doneCallback, durationModifier, oscilatorType, queueId))(i + 1),
        toneData.duration * durationModifier
      );
    } else {
      (doneCallback || (() => {}))();
    }
  }

  const MELODY_0_TRACK = [...MELODY_0, ...MELODY_0, ...MELODY_0, ...MELODY_0];
  const MELODY_1_TRACK = [...MELODY_1, ...MELODY_1, ...MELODY_1, ...MELODY_1];
  const MELODY_2_TRACK = [...MELODY_2, ...MELODY_2, ...MELODY_2, ...MELODY_2];

  const MELODY_BASS_0 = [...BASS_A0, ...BASS_B0, ...BASS_C0, ...BASS_A0];
  const MELODY_BASS_1 = [...BASS_A, ...BASS_B, ...BASS_C, ...BASS_A];


  function playMelody(queueId, melodies, loops, speed, oscilatorType, doneCallback, doneLoops = 0) { // eslint-disable-line consistent-return
    if (doneLoops === loops) return (doneCallback || noOp)();

    const cb = () => playMelody(queueId, melodies, loops, speed, oscilatorType, doneCallback, doneLoops + 1);
    const addPad = doneLoops === 0 ? [PAD] : [];
    melodies.forEach((melody, i) => {
      playSequence([...addPad, ...melody], 0, i === 0 ? cb : noOp, speed, oscilatorType, queueId);
    });
  }

  function startMelodySequence() {
    queueCounter++;

    const speed1 = 2;
    const speed2 = 1.5;
    const speed3 = 1.2;
    const speed4 = 0.8;

    const melodyStage8 = () => playMelody(queueCounter, [MELODY_2_TRACK, MELODY_BASS_1], 6, speed3, oscilatorTypes.sine);
    const melodyStage7 = () => playMelody(queueCounter, [MELODY_1_TRACK, MELODY_BASS_1], 2, speed2, oscilatorTypes.sine, () => melodyStage8());
    const melodyStage6 = () => playMelody(queueCounter, [MELODY_2_TRACK, MELODY_BASS_1], 2, speed2, oscilatorTypes.triangle, () => melodyStage7());
    const melodyStage5 = () => playMelody(queueCounter, [MELODY_1_TRACK, MELODY_BASS_1], 1, speed2, oscilatorTypes.triangle, () => melodyStage6());
    const melodyStage4 = () => playMelody(queueCounter, [MELODY_2_TRACK, MELODY_BASS_1], 1, speed1, oscilatorTypes.triangle, () => melodyStage5());
    const melodyStage3 = () => playMelody(queueCounter, [MELODY_1_TRACK, MELODY_BASS_1], 1, speed1, oscilatorTypes.sine, () => melodyStage4());
    const melodyStage2 = () => playMelody(queueCounter, [MELODY_0_TRACK, MELODY_BASS_0], 2, speed1, oscilatorTypes.sine, () => melodyStage3());

    playMelody(queueCounter, [MELODY_0_TRACK], 1, speed1, oscilatorTypes.sine, () => melodyStage2());
    return queueCounter;
  }

  function init() {
    context = new AudioContext();

    const powerOn = document.querySelector('.power-on-sound');
    powerOn.volume = 0.4;

    buzzSound = document.querySelector('.buzz-sound');
    powerOn.volume = 1;

    thudSound = document.querySelector('.thud-sound');
    popSound = document.querySelector('.pop-sound');
    arrayUnfoldSound = document.querySelector('.array-unfold-sound');
    secondSound = document.querySelector('.second-sound');
    proceeding1Sound = document.querySelector('.proceeding-1-sound');
    proceeding2Sound = document.querySelector('.proceeding-2-sound');
    departureSound = document.querySelector('.departure-sound');
    blink1Sound = document.querySelector('.blink-1-sound');
    blink2Sound = document.querySelector('.blink-2-sound');
    blink1Sound.volume = 0.5;
    blink2Sound.volume = 0.5;
  }

  init();

  return {
    playBuzz: () => buzzSound && buzzSound.play(),
    pauseBuzz: () => buzzSound && buzzSound.pause(),
    playThud: () => thudSound && thudSound.play(),
    playPop: () => popSound && popSound.play(),
    playArrayUnfoldSound: () => arrayUnfoldSound && arrayUnfoldSound.play(),
    playSecondSound: () => secondSound && secondSound.play(),

    playProceeding1Sound: () => proceeding1Sound && proceeding1Sound.play(),
    playProceeding2Sound: () => proceeding2Sound && proceeding2Sound.play(),
    playDepartureSound: () => departureSound && departureSound.play(),
    playBlink1Sound: () => blink1Sound && blink1Sound.play(),
    playBlink2Sound: () => blink2Sound && blink2Sound.play(),

    startMusic: () => {
      if (startedQueue) canceledQueues.push(startedQueue);
      musicVolume = 0.5;
      startedQueue = startMelodySequence();
    },

    toggleMusic: () => {
      musicMuted = !musicMuted;
    },
  };
}());
