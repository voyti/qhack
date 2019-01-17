// source: http://pages.mtu.edu/~suits/notefreqs.html

const TONE_MAP = {
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

const MELODY = [
  { tone: 'F#4', duration: 212 },
  { tone: 'D4', duration: 212 },
  { tone: 'C#4', duration: 212 },
  { tone: 'D4', duration: 212 },
  { tone: 'F#4', duration: 221 },
  { tone: 'D4', duration: 212 },
  { tone: 'F#4', duration: 221 },
  { tone: 'D4', duration: 114 },
  { tone: 'F#4', duration: 314 },
  { tone: 'D4', duration: 259 },
  { tone: 'C#4', duration: 219 },
  { tone: 'D4', duration: 216 },
  { tone: 'F#4', duration: 218 },
  { tone: 'D4', duration: 212 },
  { tone: 'A4', duration: 221 },
  { tone: 'D4', duration: 212 },
];


const BASS = [
  { tone: 'B1', duration: 316 }, { tone: 'F2', duration: 310 }, { tone: 'B2', duration: 223 }, { tone: 'F2', duration: 223 },
  { tone: 'B1', duration: 316 }, { tone: 'F2', duration: 310 }, { tone: 'B2', duration: 223 }, { tone: 'F2', duration: 223 },
  { tone: 'G1', duration: 314 }, { tone: 'D2', duration: 214 }, { tone: 'G2', duration: 214 }, { tone: 'D2', duration: 212 },
  { tone: 'G1', duration: 314 }, { tone: 'D2', duration: 214 }, { tone: 'G2', duration: 214 }, { tone: 'D2', duration: 212 },
  { tone: 'A1', duration: 221 }, { tone: 'E2', duration: 219 }, { tone: 'A2', duration: 282 }, { tone: 'E2', duration: 210 },
  { tone: 'A1', duration: 221 }, { tone: 'E2', duration: 219 }, { tone: 'A2', duration: 282 }, { tone: 'E2', duration: 210 },
];
// source: https://www.agiletrailblazers.com/blog/quick-start-to-generate-tones-in-javascript

let audioContext = new AudioContext();
let buzzSound = null;
let thudSound = null;
let popSound = null;
let arrayUnfoldSound = null;
let secondSound = null;
let proceeding1Sound = null;
let proceeding2Sound = null;

function init() {
  const powerOn = document.querySelector('.power-on-sound');
  powerOn.volume = 0.3;

  buzzSound = document.querySelector('.buzz-sound');
  buzzSound.volume = 0.9;

  thudSound = document.querySelector('.thud-sound');
  popSound = document.querySelector('.pop-sound');
  arrayUnfoldSound = document.querySelector('.array-unfold-sound');
  secondSound = document.querySelector('.second-sound');
  proceeding1Sound = document.querySelector('.proceeding-1-sound');
  proceeding2Sound = document.querySelector('.proceeding-2-sound');
}

function playFrequency(frequency, duration) {
  const sampleRate = audioContext.sampleRate;
  const sampleDuration = duration / 1000 * sampleRate;
  const numChannels = 1;
  const buffer = audioContext.createBuffer(numChannels, sampleDuration, sampleRate);
  // fill the channel with the desired frequency's data
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < sampleRate; i++) {
    channelData[i] = Math.sin(2 * Math.PI * frequency * i / (sampleRate));
  }

  // create audio source node.
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);

  // finally start to play
  source.start(0);
}

function playSequence(tones, i) {
  const toneData = tones[i];
  if (toneData) {
    playFrequency(TONE_MAP[toneData.tone].hz, toneData.duration / 2);
    setTimeout(() => ((i) => playSequence(tones, i))(i + 1), toneData.duration);
  }
}

export default {
  playBuzz: () => buzzSound && buzzSound.play(),
  pauseBuzz: () => buzzSound && buzzSound.pause(),
  playThud: () => thudSound && thudSound.play(),
  playPop: () => popSound && popSound.play(),
  playArrayUnfoldSound: () => arrayUnfoldSound && arrayUnfoldSound.play(),
  playSecondSound: () => secondSound && secondSound.play(),

  playProceeding1Sound: () => proceeding1Sound && proceeding1Sound.play(),
  playProceeding2Sound: () => proceeding2Sound && proceeding2Sound.play(),

  playMelody: () => {
    playSequence([...MELODY, ...MELODY, ...MELODY, ...MELODY], 0);
    playSequence([...BASS, ...BASS, ...BASS, ...BASS], 0);
  },
};

init();
