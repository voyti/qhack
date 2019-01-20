import AudioService from './audio.js';

const NODE_SIDE = 60;
const NODE_MARGIN = 1;
const NODE_SHIFT = NODE_SIDE + NODE_MARGIN;

const COLOR_OUT_OF_RANGE = '#011E29';
const COLOR_LOCKED = '#658D9D';
const COLOR_DISCOVERED_REGULAR = '#D1D3D0';
const COLOR_DISCOVERED_VULNERABLE = '#9ED5F1';

const PARTY_COLOR = '#C3E591';
const NODE_SIGNATURE_COLOR = '#FFFFFF';
const DISCOVERABILITY_RANGE = 2;
const MAX_VULNERABLE_NODES = 8;
const SECOND = 1000;

const chanceForDiscoverableSignature = 0;
const partyMoveSpeed = 1000;
let partyPosition = { col: 6, row: 5 };

let partyQueuedDestinations;
let currentPartyDestination;
let discoveredNodes;
let vulnerableNodes;
let isBoardLocked;
let gridFrequency;
let discoverableSignatures;
let onSolarArrayUnfold;
let lastPartyMoveTimestamp;
let boardPaused;

function resetGameStateValues() {
  partyQueuedDestinations = [];
  currentPartyDestination = {};
  discoveredNodes = [];
  vulnerableNodes = [];
  isBoardLocked = false;
  onSolarArrayUnfold = () => {};
  lastPartyMoveTimestamp = Date.now();
  partyPosition = { col: 6, row: 5 };
  boardPaused = false;
}

const isNodeOutOfRange = (node) => {
  const nodesInRange =
    discoveredNodes.filter((discNode) => Math.abs(discNode.col - node.col) <= DISCOVERABILITY_RANGE
    && Math.abs(discNode.row - node.row) <= DISCOVERABILITY_RANGE);
  return node.meta !== 'startingDiscoverable' && !nodesInRange.length;
};

const isNodeDiscovered = (node) => {
  return discoveredNodes.filter((discNode) => discNode.row === node.row && discNode.col === node.col).length;
};

const isDiscoveredNodeVulnerable = (node) => {
  return vulnerableNodes.filter((vulNode) => vulNode.row === node.row && vulNode.col === node.col).length;
};

const getNodeColor = (node) => {
  if (isNodeDiscovered(node)) {
    if (isDiscoveredNodeVulnerable(node)) {
      return COLOR_DISCOVERED_VULNERABLE;
    } else {
      return COLOR_DISCOVERED_REGULAR;
    }
  } else if (isNodeOutOfRange(node)) {
    return COLOR_OUT_OF_RANGE;
  } else {
    return COLOR_LOCKED;
  }
};
const getRandomSignature = () => Math.random().toString(36).toUpperCase()[2];
const getRandomFromArray = (array) => array[Math.floor(Math.random() * array.length)];

const getNodeSignature = (node, i) => {
  if (isBoardLocked) {
    return '';
  } else if (!isBoardLocked && !node.lastSignatureTimestamp || (Date.now() - node.lastSignatureTimestamp) > SECOND * 1 / gridFrequency) {

    if (!isNodeDiscovered(node) && !isNodeOutOfRange(node)) {
      const signature = Math.random() <= chanceForDiscoverableSignature ?
        getRandomFromArray(discoverableSignatures) :
        getRandomSignature();

      node.lastSignature = signature;
      node.lastSignatureTimestamp = Date.now();
      return signature;
    } else {
      return '';
    }
  } else {
    return node.lastSignature;
  }
};

const decorateNode = (node) =>
  Object.assign(node, { color: (node) => getNodeColor(node), signature: (node) => getNodeSignature(node) });

const NODE_MAP = [
  { col: 0, row: 3 },

  { col: 1, row: 0 },
  { col: 1, row: 1 },
  { col: 1, row: 2 },
  { col: 1, row: 3 },
  { col: 1, row: 4 },
  { col: 1, row: 5 },
  { col: 1, row: 6 },

  { col: 2, row: 3 },

  { col: 3, row: 0 },
  { col: 3, row: 1 },
  { col: 3, row: 2 },
  { col: 3, row: 3 },
  { col: 3, row: 4 },
  { col: 3, row: 5 },
  { col: 3, row: 6 },

  { col: 4, row: 3 },
  { col: 5, row: 3 },

  { col: 6, row: 2 },
  { col: 6, row: 3, meta: 'startingDiscoverable' },
  { col: 6, row: 4, meta: 'startingDiscoverable' },
  { col: 6, row: 5, meta: 'starting' },

  { col: 7, row: 3 },
  { col: 8, row: 3 },

  { col: 9, row: 0 },
  { col: 9, row: 1 },
  { col: 9, row: 2 },
  { col: 9, row: 3 },
  { col: 9, row: 4 },
  { col: 9, row: 5 },
  { col: 9, row: 6 },

  { col: 10, row: 3 },

  { col: 11, row: 0 },
  { col: 11, row: 1 },
  { col: 11, row: 2 },
  { col: 11, row: 3 },
  { col: 11, row: 4 },
  { col: 11, row: 5 },
  { col: 11, row: 6 },

  { col: 12, row: 3 },
].map(decorateNode);


const BOARD_TOP = 200;
const BOARD_LEFT = 100;

function getVulnerableNodes() {
  const vulNodeIdxes = Array.from(Array(MAX_VULNERABLE_NODES));
  const possibleVulnerableNodes = NODE_MAP.filter((node) => node.meta === 'starting');

  for (let i = 0; i < MAX_VULNERABLE_NODES; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * NODE_MAP.length);
      vulNodeIdxes[i] = randomIndex;
    } while (vulNodeIdxes.slice(0, i).filter((existingIdx) => existingIdx === randomIndex).length); // eslint-disable-line no-loop-func
  }
  return vulNodeIdxes.map((index) => NODE_MAP[index]);
}

function drawCharOnNode(ctx, char, col, row, color) {
  const x = (col * NODE_SHIFT) + BOARD_LEFT + (NODE_SIDE / 3);
  const y = (row * NODE_SHIFT) + BOARD_TOP + (NODE_SIDE / 1.5);

  ctx.fillStyle = color;
  ctx.strokeStyle = '#000000';
  ctx.font = '36px Courier New';
  ctx.strokeText(char, x, y);
  ctx.lineWidth = 2;
  ctx.fillText(char, x, y);
}

function findConnectedNodes(dest) {
  return NODE_MAP.filter((node) =>
    (Math.abs(node.col - dest.col) === 1 && node.row === dest.row) ||
    (Math.abs(node.row - dest.row) === 1 && node.col === dest.col));
}

function findNodeByPos(position) {
  return NODE_MAP.filter((node) =>
    position.col === node.col &&
    position.row === node.row)[0];
}

function findPartyPath(destNode) {
  const startNode = findNodeByPos(partyPosition);
  const routeMap = nodeConnectionLookup(startNode, NODE_MAP, destNode);
  return routeMap;
}

function nodeConnectionLookup(node, allNodes, destNode, path = [], paths = []) {
  const validPaths = paths.filter((v) => v);

  if (validPaths.length) {
    return validPaths[0];
  } else {
    const untraversedConnectedNodes = findConnectedNodes(node).filter((node) => !path.includes(node));
    if (node.col === destNode.col && node.row === destNode.row) {
      paths.push([...path, node]);
      return paths[0];
    } else if (untraversedConnectedNodes.length === 1 && untraversedConnectedNodes[0] === path[path.length - 1]) { // dead end
      return false;
    } else { // exit early if a route is found
      for (let i = 0; i < untraversedConnectedNodes.length; i++) {
        const result = nodeConnectionLookup(untraversedConnectedNodes[i], allNodes, destNode, [...path, node], paths);
        if (result) paths.push(result);
      }
      return paths[0];
    }
  }
}

function isSamePosition(posA, posB) {
  return posA.row === posB.row && posA.col === posB.col;
}

export default {
  initBoard: (frequencySelected, initialDiscoverableSignatures, onSolarArrayUnfoldCb) => {
    resetGameStateValues();
    onSolarArrayUnfold = onSolarArrayUnfoldCb;
    vulnerableNodes = getVulnerableNodes();
    discoveredNodes = NODE_MAP.filter((node) => node.meta === 'starting');
    gridFrequency = frequencySelected;
    discoverableSignatures = initialDiscoverableSignatures;
  },

  refreshBoard(ctx) { // eslint-disable-line consistent-return
    if (boardPaused) return false;
    NODE_MAP.forEach((node, i) => {
      ctx.fillStyle = node.color(node, i);
      ctx.fillRect((node.col * NODE_SHIFT) + BOARD_LEFT, (node.row * NODE_SHIFT) + BOARD_TOP, NODE_SIDE, NODE_SIDE);
      drawCharOnNode(ctx, node.signature(node), node.col, node.row, NODE_SIGNATURE_COLOR);
    });

    if (partyQueuedDestinations.length && !Object.keys(currentPartyDestination).length) {
      console.warn('UPDATED CURRENT DESTINATION:', partyQueuedDestinations[0]);

      currentPartyDestination = partyQueuedDestinations.shift();
    }

    if (Object.keys(currentPartyDestination).length &&
       !isSamePosition(currentPartyDestination, partyPosition)
      && Date.now() - lastPartyMoveTimestamp > partyMoveSpeed) {

      const possiblePath = findPartyPath(currentPartyDestination).filter((node) => !isSamePosition(node, partyPosition));
      const newWaypoint = possiblePath[0];
      lastPartyMoveTimestamp = Date.now();
      partyPosition.col = newWaypoint.col;
      partyPosition.row = newWaypoint.row;

    } else if (isSamePosition(currentPartyDestination, partyPosition)) {
      onSolarArrayUnfold();
      currentPartyDestination = {};
    }

    drawCharOnNode(ctx, 'X', partyPosition.col, partyPosition.row, PARTY_COLOR);
  },

  applyInput: (key, resultCallback) => {
    const upperKey = key.toUpperCase();
    let newlyDiscoveredNodes = [];
    let wrongInput = false;

    if (discoverableSignatures.includes(upperKey)) {
      newlyDiscoveredNodes = NODE_MAP.filter((node) => node.signature(node) === upperKey);

      if (newlyDiscoveredNodes.length) {
        AudioService.playPop();
        const vulnerableNodes = newlyDiscoveredNodes.filter((node) => isDiscoveredNodeVulnerable(node));
        if (vulnerableNodes.length) {
          const sound = Math.random() > 0.5 ? 'playProceeding1Sound' : 'playProceeding2Sound';
          AudioService[sound]();
        }

        partyQueuedDestinations = [
          ...partyQueuedDestinations,
          ...vulnerableNodes,
        ];

      } else {
        wrongInput = true;
        AudioService.playThud();
      }
    } else {
      wrongInput = true;
      AudioService.playThud();
    }

    discoveredNodes = [...discoveredNodes, ...newlyDiscoveredNodes];
    resultCallback(wrongInput);
  },

  applyDiscoverableSignatures: (newDiscoverableSignatures) => {
    discoverableSignatures = newDiscoverableSignatures;
  },

  lockSignatures: (lock) => {
    isBoardLocked = lock;
  },

  pauseBoard: (pause) => {
    boardPaused = pause;
  },
};
