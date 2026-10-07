import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-functions.js';

// 스트리머 게임시리즈가 사용하는 Firebase 프로젝트를 공유한다.
const firebaseConfig = {
  apiKey: 'AIzaSyAZcjQPHphENs-Bb7IfdL2qTtOMhJrRP54',
  authDomain: 'soop-stock-market.firebaseapp.com',
  databaseURL: 'https://soop-stock-market-default-rtdb.firebaseio.com',
  projectId: 'soop-stock-market',
  storageBucket: 'soop-stock-market.firebasestorage.app',
  messagingSenderId: '997788925900',
  appId: '1:997788925900:web:b58db2970489bf18a3a769'
};

const COLORS = ['#ff769b', '#76b7ff', '#ffbf56', '#8b82e9'];
const DIE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const LIBRARY = [
  { id: 'start', name: '출발', detail: '출발 칸이에요. 한 바퀴 완주 효과는 진행자가 방송 흐름에 맞춰 정해요.', icon: '🚩', effect: 'start' },
  { id: 'drink', name: '술 한잔', detail: '잔을 한 번 비워요. 방어권을 쓰면 이 벌칙을 넘길 수 있어요.', icon: '🍺', effect: 'attack' },
  { id: 'shield', name: '방어권', detail: '방어권 아이템을 한 장 얻어요. 보유 상한에 도달했다면 추가로 받지 않아요.', icon: '🛡️', effect: 'shield' },
  { id: 'snack', name: '안주 먹기', detail: '준비된 안주를 한 입 먹어요.', icon: '🍢' },
  { id: 'song', name: '노래 1절', detail: '원하는 노래의 1절을 불러요.', icon: '🎤' },
  { id: 'water', name: '물 마시기', detail: '물을 한 잔 마시고 다음 차례를 준비해요.', icon: '💧' },
  { id: 'viewerpick', name: '시청자 지목', detail: '진행자가 벌칙을 수행할 사람을 지목해요. 지목 대상에 스트리머도 포함할 수 있어요.', icon: '☝️', effect: 'pick' },
  { id: 'squat', name: '스쿼트 5회', detail: '자리에서 스쿼트를 다섯 번 해요.', icon: '🏋️' },
  { id: 'english', name: '영어 금지', detail: '다음 차례가 올 때까지 영어 단어를 쓰지 않아요.', icon: '🔇' },
  { id: 'reverse', name: '방향 전환', detail: '게임 진행 방향을 반대로 바꿔요.', icon: '🔄', effect: 'reverse' },
  { id: 'rollagain', name: '주사위 한 번 더', detail: '한 번 더 굴려요. 같은 참가자가 이어서 진행해요.', icon: '🎲', effect: 'again' },
  { id: 'back3', name: '뒤로 3칸', detail: '말을 세 칸 뒤로 옮겨요. 이동한 칸의 벌칙도 수행해요.', icon: '⬅️', effect: 'move', amount: -3 },
  { id: 'forward3', name: '앞으로 3칸', detail: '말을 세 칸 앞으로 옮겨요. 이동한 칸의 벌칙도 수행해요.', icon: '➡️', effect: 'move', amount: 3 },
  { id: 'aegyo', name: '애교 한줄', detail: '애교 섞인 한마디를 해요.', icon: '💗' },
  { id: 'tmi', name: 'TMI 한가지', detail: '시청자에게 TMI 한 가지를 공개해요.', icon: '💬' },
  { id: 'random', name: '랜덤 이동', detail: '주사위를 한 번 더 굴려 나온 숫자만큼 이동해요.', icon: '🌀', effect: 'again' },
  { id: 'qa', name: 'Q&A', detail: '시청자 질문 하나에 답해요.', icon: '❔' },
  { id: 'rest', name: '한 칸 쉬기', detail: '이번 칸에서는 벌칙 없이 잠깐 쉬어가요.', icon: '🫧' },
  { id: 'tip', name: '방송 TMI', detail: '방송과 관련된 이야기를 하나 들려줘요.', icon: '📡' },
  { id: 'dance', name: '춤 10초', detail: '좋아하는 노래에 맞춰 10초 동안 춤춰요.', icon: '💃' },
  { id: 'impression', name: '성대모사', detail: '캐릭터나 인물 한 명을 성대모사해요.', icon: '🎭' },
  { id: 'toast', name: '건배 제안', detail: '오늘 방송을 위한 건배사를 제안해요.', icon: '🥂' },
  { id: 'challenge', name: '도전 과제', detail: '진행자가 정한 짧은 도전 과제를 수행해요.', icon: '✨' },
  { id: 'free', name: '진행자 선택', detail: '진행자가 방송 상황에 맞는 벌칙을 정해요.', icon: '🎯' }
];
const DEFAULT_NAMES = ['출발', '술 한잔', '방어권', '안주 먹기', '노래 1절', '물 마시기', '시청자 지목', '스쿼트 5회', '영어 금지', '방향 전환', '술 한잔', 'TMI 한가지', '뒤로 3칸', '애교 한줄', '한 칸 쉬기', '주사위 한 번 더', 'Q&A', '술 한잔', '앞으로 3칸', '성대모사', '방어권', '안주 먹기', '춤 10초', '건배 제안'];
const ITEM_BY_NAME = new Map(LIBRARY.map((tile) => [tile.name, tile]));
const roomParam = new URLSearchParams(location.search).get('room');
const isObs = new URLSearchParams(location.search).get('view') === '1' && Boolean(roomParam);

const firebaseApp = initializeApp(firebaseConfig, isObs ? `jurumable-viewer-${roomParam}` : 'jurumable-host');
const auth = getAuth(firebaseApp);
const functions = getFunctions(firebaseApp, 'us-central1');
const callCreateRoom = httpsCallable(functions, 'jurumableCreateRoom');
const callUpdateRoom = httpsCallable(functions, 'jurumableUpdateRoom');
const callGetRoomState = httpsCallable(functions, 'jurumableGetRoomState');

const $ = (id) => document.getElementById(id);
let currentUser = null;
let roomId = roomParam || localStorage.getItem('jurumable.roomId') || '';
let hostKey = roomId ? localStorage.getItem(`jurumable.host.${roomId}`) || '' : '';
let viewKey = new URLSearchParams(location.search).get('key') || (roomId ? localStorage.getItem(`jurumable.view.${roomId}`) || '' : '');
let pendingReplacement = null;
let localDiceAnimating = false;
let toastTimer = 0;
let lastMoveAnimationKey = '';
let persistenceQueue = Promise.resolve();
let roomLocalDirty = false;
let lastServerUpdatedAt = 0;
let roomPollTimer = 0;
let roomPollFailed = false;
let roomPollingActive = false;
let state = makeInitialState();

function makeInitialState() {
  return {
    board: DEFAULT_NAMES.map((name) => ({ ...ITEM_BY_NAME.get(name) })),
    players: [], status: 'lobby', turnOrder: [], currentTurnIndex: 0,
    rollValue: 0, shieldCap: 2, pending: null, direction: 1,
    lastMove: null, diceRolling: false, updatedAt: Date.now()
  };
}

function setConnection(message, connected = false) {
  const node = $('connection');
  node.innerHTML = `<i></i>${escapeHTML(message)}`;
  node.classList.toggle('connected', connected);
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function tileIllustrationMarkup(tile) {
  const iconId = LIBRARY.find((item) => item.id === tile?.id)?.id || 'free';
  return `<svg viewBox="0 0 96 96" aria-hidden="true" focusable="false"><use href="assets/tile-illustrations.svg#tile-${iconId}"></use></svg>`;
}

function cloneState(value) { return JSON.parse(JSON.stringify(value)); }
function currentPlayer() { return state.players.find((player) => player.id === state.turnOrder[state.currentTurnIndex]) || null; }
function posAfter(position, amount) { return (position + amount % 24 + 24) % 24; }
function boardGridCoordinates(index) {
  if (index < 8) return { gridRow: 6, gridColumn: index + 1 };
  if (index < 12) return { gridRow: 13 - index, gridColumn: 8 };
  if (index < 20) return { gridRow: 1, gridColumn: 20 - index };
  return { gridRow: index - 18, gridColumn: 1 };
}

function movingPosition(player, now = Date.now()) {
  const movement = state.lastMove;
  if (!movement || movement.playerId !== player.id) return player.position;
  const progress = Math.max(0, now - movement.startedAt);
  const step = Math.min(Math.abs(movement.steps), Math.floor(progress / 180));
  if (step >= Math.abs(movement.steps)) return movement.to;
  return posAfter(movement.from, Math.sign(movement.steps) * step);
}

function renderBoard(targetId, interactive) {
  const grid = $(targetId);
  if (!grid) return;
  grid.replaceChildren();
  state.board.forEach((tile, index) => {
    const coordinates = boardGridCoordinates(index);
    const cell = document.createElement(interactive ? 'button' : 'div');
    cell.className = `board-cell${index === 0 ? ' is-start' : ''}${tile.effect === 'shield' ? ' is-shield' : ''}`;
    cell.style.gridRow = coordinates.gridRow;
    cell.style.gridColumn = coordinates.gridColumn;
    if (interactive) {
      cell.type = 'button';
      cell.dataset.tileIndex = String(index);
      cell.setAttribute('aria-label', `${index + 1}번 칸 ${tile.name}${pendingReplacement ? ', 항목 교체' : ', 클릭해 항목 교체'}`);
      cell.title = pendingReplacement ? `${tile.name} → ${pendingReplacement.name}로 교체` : '선택한 항목으로 교체';
      cell.addEventListener('click', () => replaceTile(index));
      cell.addEventListener('dragover', (event) => { if (pendingReplacement) { event.preventDefault(); cell.classList.add('edit-target'); } });
      cell.addEventListener('dragleave', () => cell.classList.remove('edit-target'));
      cell.addEventListener('drop', (event) => {
        event.preventDefault(); cell.classList.remove('edit-target');
        const id = event.dataTransfer.getData('text/jurumable-tile');
        const item = LIBRARY.find((entry) => entry.id === id);
        if (item) { pendingReplacement = item; replaceTile(index); }
      });
    }
    const current = currentPlayer();
    if (state.status === 'playing' && current && movingPosition(current) === index) cell.classList.add('current');
    const activePlayers = state.players.filter((player) => movingPosition(player) === index);
    cell.innerHTML = `<span class="tile-number">${String(index + 1).padStart(2, '0')}</span><span class="tile-illustration">${tileIllustrationMarkup(tile)}</span><span class="tile-name">${escapeHTML(tile.name)}</span><span class="tile-pawns">${activePlayers.map((player) => `<i class="pawn" title="${escapeHTML(player.name)}" style="background:${escapeHTML(player.color)}"></i>`).join('')}</span>`;
    grid.append(cell);
  });
}

function renderPlayers() {
  const list = $('playerList');
  const count = $('playerCount');
  if (!list || !count) return;
  count.textContent = `${state.players.length} / 4`;
  if (!state.players.length) list.innerHTML = '<p class="empty-state">참가자를 추가하면 출발 칸에서 시작해요.</p>';
  else {
    const order = state.status === 'playing' ? state.turnOrder : state.players.map((player) => player.id);
    list.innerHTML = order.map((id) => {
      const player = state.players.find((item) => item.id === id);
      if (!player) return '';
      const isTurn = state.status === 'playing' && currentPlayer()?.id === player.id;
      return `<div class="player-card"><i class="player-color" style="background:${escapeHTML(player.color)}"></i><span class="player-name">${escapeHTML(player.name)}${isTurn ? ' <small>· 차례</small>' : ''}</span><span class="player-meta">${player.shields ? `◇ ${player.shields}장` : '방어권 없음'}</span>${state.status === 'lobby' ? `<button class="player-remove" data-remove-player="${escapeHTML(player.id)}" aria-label="${escapeHTML(player.name)} 제외">×</button>` : '<span></span>'}</div>`;
    }).join('');
    list.querySelectorAll('[data-remove-player]').forEach((button) => button.addEventListener('click', () => removePlayer(button.dataset.removePlayer)));
  }
  const addButton = $('addPlayerButton');
  const nameInput = $('playerName');
  if (addButton) addButton.disabled = state.players.length >= 4 || state.status !== 'lobby';
  if (nameInput) nameInput.disabled = state.players.length >= 4 || state.status !== 'lobby';
  $('startButton').disabled = state.players.length < 1 || state.status !== 'lobby';
  $('rollButton').disabled = state.status !== 'playing' || Boolean(state.pending) || localDiceAnimating;
  $('newGameButton').disabled = !roomId;
  $('shieldLimit').value = String(state.shieldCap ?? 2);
  $('shieldSummary').textContent = `최대 ${state.shieldCap ?? 2}장까지 보관`;
  $('centerTurn').textContent = state.status === 'playing' ? `${currentPlayer()?.name || '참가자'}의 차례` : state.players.length ? '참가자 차례를 섞어 게임을 시작해요' : '방송 멤버를 추가해 시작하세요';
  $('roomBadge').textContent = roomId ? `ROOM ${roomId}` : '방 만들기';
  $('shareButton').disabled = !roomId;
  $('copyOverlayButton').disabled = !roomId;
  $('rollButton').title = state.status === 'playing' ? `${currentPlayer()?.name || ''} 차례` : '게임을 시작해 주세요';
}

function renderTileLibrary() {
  const container = $('tileLibrary');
  if (!container) return;
  container.innerHTML = LIBRARY.filter((item) => item.id !== 'start').map((item) => `<button class="library-chip${pendingReplacement?.id === item.id ? ' selected' : ''}" draggable="true" type="button" data-library-tile="${escapeHTML(item.id)}"><span class="library-illustration">${tileIllustrationMarkup(item)}</span><span>${escapeHTML(item.name)}</span></button>`).join('');
  container.querySelectorAll('[data-library-tile]').forEach((button) => {
    const item = LIBRARY.find((entry) => entry.id === button.dataset.libraryTile);
    button.addEventListener('click', () => { pendingReplacement = item; renderTileLibrary(); $('editSelection').textContent = `${item.name} 선택됨 · 바꿀 칸을 누르세요`; });
    button.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/jurumable-tile', item.id);
      event.dataTransfer.effectAllowed = 'copy';
      pendingReplacement = item;
    });
  });
}

function render() {
  renderBoard('boardGrid', true);
  renderBoard('obsBoardGrid', false);
  renderPlayers();
  renderTileLibrary();
  renderObs();
  if (state.lastMove) {
    const animationKey = `${state.lastMove.id}:${state.lastMove.playerId}`;
    if (animationKey !== lastMoveAnimationKey) {
      lastMoveAnimationKey = animationKey;
      const remaining = Math.max(0, Math.abs(state.lastMove.steps) * 180 - (Date.now() - state.lastMove.startedAt));
      if (remaining > 0) {
        const started = performance.now();
        const animate = () => {
          renderBoard('boardGrid', true);
          renderBoard('obsBoardGrid', false);
          if (performance.now() - started < remaining) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }
  }
}

function renderObs() {
  if (!$('obsLayout')) return;
  const now = Date.now();
  const next = currentPlayer();
  const movement = state.lastMove;
  const dice = state.rollValue ? DIE[state.rollValue - 1] : '⚄';
  $('obsDice').textContent = dice;
  $('obsDice').classList.toggle('rolling', Boolean(state.diceRolling));
  $('obsTurn').textContent = state.status === 'playing' ? `${next?.name || ''}의 차례` : '참가자와 함께 게임을 시작해요';
  $('obsPlayers').innerHTML = (state.status === 'playing' ? state.turnOrder : state.players.map((player) => player.id)).map((id) => {
    const player = state.players.find((item) => item.id === id);
    if (!player) return '';
    const pos = movement && movement.playerId === id ? movingPosition(player, now) : player.position;
    const tileName = state.board[pos]?.name || '';
    return `<span class="obs-player-chip"><i class="pawn" style="display:inline-block;vertical-align:middle;margin-right:5px;background:${escapeHTML(player.color)}"></i>${escapeHTML(player.name)} · ${escapeHTML(tileName)} · ◇ ${player.shields || 0}</span>`;
  }).join('');
  const landing = $('obsLanding');
  if (state.pending?.tile) {
    $('obsModalPlayer').textContent = `${state.pending.playerName || '참가자'} 도착`;
    $('obsModalName').textContent = state.pending.tile.name;
    $('obsModalDetail').textContent = state.pending.resultDetail || state.pending.tile.detail;
    landing.classList.remove('hidden');
  } else landing.classList.add('hidden');
}

function persistLocally() {
  if (!roomId || !hostKey || isObs) return;
  clearTimeout(window.__jurumableSaveTimer);
  window.__jurumableSaveTimer = setTimeout(async () => {
    const snapshot = cloneState(state);
    persistenceQueue = persistenceQueue.catch(() => undefined).then(() => callUpdateRoom({ roomId, hostKey, state: snapshot }));
    try {
      await persistenceQueue;
      if (state.updatedAt === snapshot.updatedAt) roomLocalDirty = false;
    } catch (error) {
      setConnection('저장 오류');
      showToast(humanError(error));
      console.error('게임 상태 저장 실패', error);
    }
  }, 80);
}

function setState(next, save = true) {
  state = next;
  state.updatedAt = Date.now();
  render();
  if (save && !isObs && roomId && hostKey) roomLocalDirty = true;
  if (save) persistLocally();
}

function showToast(message) {
  const node = $('toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 2600);
}

function humanError(error) {
  const code = error?.code || '';
  if (code.includes('permission-denied')) return '이 방을 편집할 권한이 없습니다. 방을 새로 만들어 주세요.';
  if (code.includes('not-found')) return '게임 방을 찾을 수 없습니다. 주소를 확인해 주세요.';
  if (code.includes('deadline-exceeded')) return '게임 방이 만료됐어요. 새 게임 방을 만들어 주세요.';
  if (code.includes('unauthenticated')) return '로그인 연결에 실패했습니다. 페이지를 새로고침해 주세요.';
  if (!navigator.onLine) return '인터넷 연결을 확인해 주세요.';
  return error?.message || '저장 중 문제가 생겼습니다.';
}

function replaceTile(index) {
  if (!pendingReplacement) { showToast('먼저 바꿀 항목을 선택해 주세요.'); return; }
  if (index === 0) { showToast('출발 칸은 그대로 두고 다른 칸을 편집해 주세요.'); return; }
  const next = cloneState(state);
  next.board[index] = { ...pendingReplacement };
  setState(next);
  $('editSelection').textContent = `${index + 1}번 칸을 ${pendingReplacement.name}(으)로 바꿨어요`;
  pendingReplacement = null;
  render();
}

function addPlayer(name) {
  const clean = name.trim().slice(0, 18);
  if (!clean || state.status !== 'lobby' || state.players.length >= 4) return;
  if (state.players.some((player) => player.name.toLocaleLowerCase() === clean.toLocaleLowerCase())) { showToast('같은 이름이 이미 있어요.'); return; }
  const next = cloneState(state);
  const id = crypto.randomUUID();
  next.players.push({ id, name: clean, color: COLORS[next.players.length], position: 0, shields: 0 });
  setState(next);
}

function removePlayer(playerId) {
  if (state.status !== 'lobby') return;
  const next = cloneState(state);
  next.players = next.players.filter((player) => player.id !== playerId);
  next.players.forEach((player, index) => { player.color = COLORS[index]; });
  setState(next);
}

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function beginGame() {
  if (!state.players.length || state.status !== 'lobby') return;
  const next = cloneState(state);
  next.turnOrder = shuffle(next.players.map((player) => player.id));
  next.currentTurnIndex = 0;
  next.players.forEach((player) => { player.position = 0; player.shields = 0; });
  next.status = 'playing';
  next.pending = null;
  next.direction = 1;
  next.rollValue = 0;
  setState(next);
  showToast(`차례 결정 완료 · ${next.players.find((player) => player.id === next.turnOrder[0]).name}부터 시작합니다`);
}

function showLanding(player, tile, extras = {}) {
  const next = cloneState(state);
  next.pending = { playerId: player.id, playerName: player.name, tile: { ...tile }, phase: 'landing', ...extras };
  setState(next);
  $('dialogIcon').innerHTML = tileIllustrationMarkup(tile);
  $('dialogPlayer').textContent = `${player.name} 도착`;
  $('dialogTileName').textContent = tile.name;
  $('dialogDetail').textContent = extras.resultDetail || tile.detail;
  $('dialogShield').classList.add('hidden');
  const actions = $('dialogActions');
  actions.replaceChildren();
  if (tile.effect === 'attack' || tile.effect === 'pick') {
    const explain = document.createElement('p');
    explain.className = 'dialog-detail';
    explain.textContent = tile.effect === 'pick' ? '벌칙을 수행할 사람을 선택해 주세요. 스트리머도 지목할 수 있어요.' : '술 마시기 공격 대상을 정해 주세요. 스트리머도 선택할 수 있어요.';
    actions.append(explain);
    const targets = [...state.players.map((item) => ({ id: item.id, label: item.name })), { id: 'streamer', label: '스트리머' }];
    targets.forEach((target) => {
      const button = document.createElement('button');
      button.className = 'secondary'; button.textContent = `${target.label} 지목`;
      button.addEventListener('click', () => resolveTarget(target));
      actions.append(button);
    });
  } else {
    const button = document.createElement('button');
    button.textContent = '안내 확인 · 벌칙 수행';
    button.addEventListener('click', acknowledgeLanding);
    actions.append(button);
  }
  const dialog = $('landingDialog');
  if (!dialog.open) dialog.showModal();
}

function resolveTarget(target) {
  const currentPending = state.pending;
  if (!currentPending) return;
  const next = cloneState(state);
  const pending = next.pending;
  pending.targetName = target.label;
  const isAttack = pending.tile.effect === 'attack';
  if (isAttack && target.id !== 'streamer') {
    const targetPlayer = next.players.find((player) => player.id === target.id);
    if (targetPlayer?.shields > 0) {
      pending.targetPlayerId = target.id;
      pending.phase = 'shield-choice';
      pending.resultDetail = `${target.label}에게 술 마시기 공격! 방어권 ${targetPlayer.shields}장을 가지고 있어요. 사용할까요?`;
      setState(next);
      $('dialogDetail').textContent = pending.resultDetail;
      $('dialogActions').replaceChildren();
      const use = document.createElement('button'); use.textContent = '방어권 사용'; use.addEventListener('click', () => consumeShield(true));
      const take = document.createElement('button'); take.className = 'secondary'; take.textContent = '사용 안 함'; take.addEventListener('click', () => consumeShield(false));
      $('dialogActions').append(use, take);
      $('dialogShield').textContent = `보유한 방어권 ${targetPlayer.shields}장 · 한 장 사용 시 공격을 막고 아이템은 소모돼요`;
      $('dialogShield').classList.remove('hidden');
      return;
    }
  }
  finishTarget(next, target, isAttack);
}

function finishTarget(next, target, isAttack, blocked = false) {
  const pending = next.pending;
  const who = target.label === '스트리머' ? '스트리머' : target.label;
  if (pending.tile.effect === 'pick') {
    pending.resultDetail = `${who}님이 지목됐어요. 진행자가 정한 벌칙을 수행해 주세요.`;
  } else if (blocked) {
    pending.resultDetail = `${who}님이 방어권을 사용해 술 마시기 공격을 막았어요.`;
  } else {
    pending.resultDetail = `${who}님이 지목됐어요. 술 한 잔을 수행해 주세요.`;
  }
  pending.phase = 'resolved';
  pending.canAdvance = true;
  setState(next);
  $('dialogPlayer').textContent = `${pending.playerName} 지목 결과`;
  $('dialogDetail').textContent = pending.resultDetail;
  $('dialogActions').replaceChildren();
  const done = document.createElement('button'); done.textContent = '확인 · 다음 차례'; done.addEventListener('click', acknowledgeLanding);
  $('dialogActions').append(done);
  if (isAttack && !blocked) $('dialogShield').classList.add('hidden');
}

function consumeShield(useShield) {
  if (!state.pending || state.pending.phase !== 'shield-choice') return;
  const next = cloneState(state);
  const target = next.players.find((player) => player.id === next.pending.targetPlayerId);
  const targetInfo = { id: target?.id || 'streamer', label: next.pending.targetName };
  if (useShield && target) target.shields = Math.max(0, target.shields - 1);
  finishTarget(next, targetInfo, true, useShield);
}

function acknowledgeLanding() {
  if (!state.pending) return;
  const pending = state.pending;
  const next = cloneState(state);
  const player = next.players.find((item) => item.id === pending.playerId);
  if (pending.tile.effect === 'shield' && player && pending.phase !== 'shield-granted') {
    if (player.shields < next.shieldCap) {
      player.shields += 1;
      pending.phase = 'shield-granted';
      pending.resultDetail = `방어권 한 장을 받았어요. 현재 ${player.shields}장 보유 · 상한 ${next.shieldCap}장`;
    } else {
      pending.phase = 'shield-granted';
      pending.resultDetail = `방어권 보유 상한(${next.shieldCap}장)에 도달해 있어 추가 아이템은 받지 않았어요.`;
    }
    setState(next);
    $('dialogDetail').textContent = pending.resultDetail;
    $('dialogActions').replaceChildren();
    const done = document.createElement('button'); done.textContent = '확인 · 다음 차례'; done.addEventListener('click', finalizeTurn);
    $('dialogActions').append(done);
    return;
  }
  if (pending.tile.effect === 'move' && !pending.followupDone) {
    const moveAmount = pending.tile.amount;
    const moveFrom = player.position;
    pending.followupDone = true;
    player.position = posAfter(moveFrom, moveAmount);
    const landingTile = next.board[player.position];
    pending.tile = { ...landingTile };
    pending.resultDetail = `추가 이동 결과, ${landingTile.name} 칸에 도착했어요. 칸 안내를 확인해 주세요.`;
    pending.phase = 'followup';
    pending.startedAt = Date.now();
    pending.id = crypto.randomUUID();
    next.lastMove = { id: pending.id, playerId: player.id, from: moveFrom, to: player.position, steps: moveAmount, startedAt: Date.now() };
    setState(next);
    $('dialogIcon').textContent = landingTile.icon || '✨';
    $('dialogPlayer').textContent = `${player.name} 추가 이동`;
    $('dialogTileName').textContent = landingTile.name;
    $('dialogDetail').textContent = pending.resultDetail;
    buildGenericContinueAction();
    return;
  }
  if (pending.tile.effect === 'reverse' && pending.phase !== 'resolved') next.direction *= -1;
  if (pending.tile.effect === 'again' && pending.phase !== 'resolved') {
    next.pending = null;
    next.rollValue = 0;
    setState(next);
    $('landingDialog').close();
    showToast(`${player.name}님 한 번 더 굴려요!`);
    return;
  }
  next.pending = null;
  setState(next);
  $('landingDialog').close();
  finalizeTurn();
}

function buildGenericContinueAction() {
  $('dialogActions').replaceChildren();
  const tile = state.pending?.tile;
  if (tile?.effect === 'shield') {
    const button = document.createElement('button'); button.textContent = '방어권 확인하기'; button.addEventListener('click', acknowledgeLanding); $('dialogActions').append(button);
  } else if (tile?.effect === 'attack' || tile?.effect === 'pick') {
    const detail = $('dialogDetail');
    detail.textContent += tile.effect === 'pick' ? '\n벌칙을 수행할 사람을 골라 주세요.' : '\n술 한 잔 대상을 선택해 주세요.';
    const targets = [...state.players.map((item) => ({ id: item.id, label: item.name })), { id: 'streamer', label: '스트리머' }];
    targets.forEach((target) => { const button = document.createElement('button'); button.className = 'secondary'; button.textContent = `${target.label} 지목`; button.addEventListener('click', () => resolveTarget(target)); $('dialogActions').append(button); });
  } else {
    const button = document.createElement('button'); button.textContent = '안내 확인 · 벌칙 수행'; button.addEventListener('click', acknowledgeLanding); $('dialogActions').append(button);
  }
}

function finalizeTurn() {
  const next = cloneState(state);
  const repeat = next.pending?.tile?.effect === 'again';
  next.pending = null;
  if (!repeat) next.currentTurnIndex = (next.currentTurnIndex + next.direction + next.turnOrder.length) % next.turnOrder.length;
  next.rollValue = 0;
  setState(next);
  if ($('landingDialog').open) $('landingDialog').close();
}

async function rollDice() {
  if (state.status !== 'playing' || state.pending || localDiceAnimating || !currentPlayer()) return;
  localDiceAnimating = true;
  renderPlayers();
  const stage = $('diceStage'); stage.classList.add('rolling');
  const face = $('diceFace');
  const rollingState = cloneState(state);
  rollingState.diceRolling = true;
  setState(rollingState);
  const actual = crypto.getRandomValues(new Uint32Array(1))[0] % 6 + 1;
  const start = performance.now();
  const interval = setInterval(() => { face.textContent = DIE[Math.floor(Math.random() * 6)]; }, 75);
  await new Promise((resolve) => setTimeout(resolve, 2050));
  clearInterval(interval);
  face.textContent = DIE[actual - 1];
  stage.classList.remove('rolling');

  const next = cloneState(state);
  next.diceRolling = false;
  const player = next.players.find((item) => item.id === next.turnOrder[next.currentTurnIndex]);
  const from = player.position;
  const steps = actual * next.direction;
  const to = posAfter(from, steps);
  player.position = to;
  next.rollValue = actual;
  next.lastMove = { id: crypto.randomUUID(), playerId: player.id, from, to, steps, startedAt: Date.now() };
  setState(next);
  localDiceAnimating = false;
  renderPlayers();
  const remaining = Math.max(0, Math.abs(steps) * 180);
  await new Promise((resolve) => setTimeout(resolve, remaining));
  if (!state.pending && state.players.some((item) => item.id === player.id)) showLanding(player, state.board[to]);
}

function setShieldCap(value) {
  const next = cloneState(state);
  next.shieldCap = Math.max(0, Math.min(9, Number(value) || 0));
  next.players.forEach((player) => { player.shields = Math.min(player.shields, next.shieldCap); });
  setState(next);
}

function overlayUrl() {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('room', roomId);
  url.searchParams.set('view', '1');
  url.searchParams.set('key', viewKey);
  return url.toString();
}

async function copyOverlayUrl() {
  try { await navigator.clipboard.writeText(overlayUrl()); showToast('OBS 브라우저 소스 주소를 복사했어요.'); }
  catch { showToast(`OBS 주소: ${overlayUrl()}`); }
}

async function createRoom() {
  $('newRoomButton').disabled = true;
  try {
    if (!auth.currentUser) await signInAnonymously(auth);
    const result = await callCreateRoom({ state: cloneState(state) });
    roomId = result.data.roomId;
    hostKey = result.data.hostKey;
    viewKey = result.data.viewKey;
    localStorage.setItem('jurumable.roomId', roomId);
    localStorage.setItem(`jurumable.host.${roomId}`, hostKey);
    localStorage.setItem(`jurumable.view.${roomId}`, viewKey);
    history.replaceState(null, '', `${location.pathname}?room=${encodeURIComponent(roomId)}`);
    setConnection('실시간 연결', true);
    setState(state);
    showToast('게임 방을 만들었어요. URL을 OBS 브라우저 소스에 복사하세요.');
    attachRoomPolling(false);
  } catch (error) {
    console.error('게임 방 생성 실패', error);
    showToast(`방을 만들지 못했어요 · ${humanError(error)}`);
  } finally { $('newRoomButton').disabled = false; }
}

function applyRoomState(value, viewOnly) {
  if (!value || !Array.isArray(value.board)) return;
  const localPending = state.pending;
  state = value;
  render();
  if (viewOnly) setConnection('실시간 방송 연결', true);
  if (!viewOnly && value.pending && (!localPending || localPending.id !== value.pending.id)) {
    showLanding(value.players.find((player) => player.id === value.pending.playerId) || { name: value.pending.playerName }, value.pending.tile, value.pending);
  } else if (!viewOnly && !value.pending && $('landingDialog').open) $('landingDialog').close();
}

async function pollRoomState(viewOnly) {
  if (!roomId || !roomPollingActive) return;
  try {
    const request = { roomId, since: lastServerUpdatedAt };
    request[viewOnly ? 'viewKey' : 'hostKey'] = viewOnly ? viewKey : hostKey;
    const result = await callGetRoomState(request);
    const data = result.data || {};
    if (Number.isFinite(data.updatedAt) && data.updatedAt > lastServerUpdatedAt) {
      lastServerUpdatedAt = data.updatedAt;
      if (data.state && (viewOnly || !roomLocalDirty)) applyRoomState(data.state, viewOnly);
    }
    roomPollFailed = false;
    if (viewOnly) setConnection('실시간 방송 연결', true);
    else if (hostKey) setConnection('실시간 연결', true);
  } catch (error) {
    console.error('공유 보드 갱신 실패', error);
    setConnection('연결 확인 중');
    if (!roomPollFailed) showToast(humanError(error));
    roomPollFailed = true;
    if (['functions/permission-denied', 'functions/not-found', 'functions/deadline-exceeded'].includes(error?.code)) roomPollingActive = false;
  } finally {
    if (roomPollingActive) roomPollTimer = setTimeout(() => pollRoomState(viewOnly), document.visibilityState === 'hidden' ? 2500 : 1000);
  }
}

function attachRoomPolling(viewOnly) {
  if (!roomId) return;
  clearTimeout(roomPollTimer);
  lastServerUpdatedAt = 0;
  roomPollFailed = false;
  roomPollingActive = true;
  pollRoomState(viewOnly);
}

async function initObs() {
  document.body.classList.add('obs-mode');
  $('hostLayout').classList.add('hidden');
  $('topbar').classList.add('hidden');
  $('obsLayout').classList.remove('hidden');
  setConnection('방송 보드 연결 중');
  try {
    await signInAnonymously(auth);
    attachRoomPolling(true);
  } catch (error) {
    console.error('OBS 보드 연결 실패', error);
    setConnection('방 주소 확인 필요');
    $('obsTurn').textContent = humanError(error);
  }
}

function restoreHostRoom() {
  if (!roomId || !hostKey || isObs) return false;
  $('newRoomButton').textContent = '새 방 만들기';
  attachRoomPolling(false);
  return true;
}

async function start() {
  try {
    if (isObs) {
      await initObs();
      return;
    }
    if (!auth.currentUser) await signInAnonymously(auth);
    setConnection('방을 만들거나 불러오세요', true);
    const restored = restoreHostRoom();
    if (restored) { $('newRoomButton').textContent = '새 방 만들기'; $('newGameButton').disabled = false; }
    else if (roomId) {
      showToast('이 브라우저에서 편집할 수 없는 공유 링크입니다. 새 방을 만들어 주세요.');
      roomId = '';
    }
  } catch (error) {
    console.error('초기 연결 실패', error);
    setConnection('연결 오류');
    showToast(`연결할 수 없습니다 · ${humanError(error)}`);
  }
}

$('addPlayerForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = $('playerName');
  addPlayer(input.value);
  input.value = '';
  input.focus();
});
$('startButton').addEventListener('click', beginGame);
$('rollButton').addEventListener('click', rollDice);
$('shareButton').addEventListener('click', copyOverlayUrl);
$('copyOverlayButton').addEventListener('click', copyOverlayUrl);
$('newRoomButton').addEventListener('click', createRoom);
$('newGameButton').addEventListener('click', () => {
  if (!confirm('참가자와 말 위치, 방어권, 벌칙 진행 상태를 초기화할까요? 보드 편집과 상한 설정은 유지됩니다.')) return;
  const next = cloneState(state);
  next.players.forEach((player) => { player.position = 0; player.shields = 0; });
  next.status = 'lobby'; next.turnOrder = []; next.currentTurnIndex = 0; next.pending = null; next.rollValue = 0; next.lastMove = null;
  setState(next);
  if ($('landingDialog').open) $('landingDialog').close();
  showToast('새 게임을 준비했어요.');
});
$('resetBoardButton').addEventListener('click', () => {
  const next = cloneState(state);
  next.board = makeInitialState().board;
  pendingReplacement = null;
  setState(next);
  $('editSelection').textContent = '기본 보드로 되돌렸어요';
});
$('shieldLimit').addEventListener('change', (event) => setShieldCap(event.target.value));
document.querySelectorAll('.number-control [data-step]').forEach((button) => button.addEventListener('click', () => {
  const input = $('shieldLimit');
  setShieldCap(Number(input.value) + Number(button.dataset.step));
}));
$('dialogClose').addEventListener('click', () => {
  if (state.pending) showToast('안내 확인 버튼을 눌러 진행해 주세요.');
  else $('landingDialog').close();
});
$('landingDialog').addEventListener('cancel', (event) => { if (state.pending) event.preventDefault(); });
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !isObs && !event.repeat && !event.target.matches('input,textarea,button')) { event.preventDefault(); rollDice(); }
});
window.addEventListener('online', () => setConnection('연결됨', true));
window.addEventListener('offline', () => setConnection('오프라인'));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && roomPollingActive) {
    clearTimeout(roomPollTimer);
    pollRoomState(isObs);
  }
});

render();
start();
