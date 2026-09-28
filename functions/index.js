'use strict';

const crypto = require('node:crypto');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { HttpsError, onCall } = require('firebase-functions/v2/https');

initializeApp();

const db = getDatabase();
const ROOM_ID_PATTERN = /^[A-Z0-9]{8}$/;
const MAX_STATE_BYTES = 80_000;
const ROOM_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function requireAnonymousOrSignedIn(request) {
  if (!request.auth || typeof request.auth.uid !== 'string') {
    throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
  }
  return request.auth.uid;
}

function roomRef(roomId) {
  if (typeof roomId !== 'string' || !ROOM_ID_PATTERN.test(roomId)) {
    throw new HttpsError('invalid-argument', '방 주소가 올바르지 않습니다.');
  }
  return db.ref(`streamerJurumable/rooms/${roomId}`);
}

function hashSecret(secret) {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function safeEqualHex(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || !/^[a-f0-9]{64}$/.test(left) || !/^[a-f0-9]{64}$/.test(right)) return false;
  return crypto.timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

function validatePublicState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    throw new HttpsError('invalid-argument', '게임 상태를 확인할 수 없습니다.');
  }
  const serialized = JSON.stringify(state);
  if (!serialized || Buffer.byteLength(serialized, 'utf8') > MAX_STATE_BYTES) {
    throw new HttpsError('invalid-argument', '게임 정보가 너무 큽니다.');
  }
  if (!Array.isArray(state.players) || state.players.length > 4 || !Array.isArray(state.board) || state.board.length !== 24) {
    throw new HttpsError('invalid-argument', '참가자 또는 보드 구성이 올바르지 않습니다.');
  }
  if (state.players.some((player) => !player || typeof player.id !== 'string' || typeof player.name !== 'string'
      || player.name.length > 18 || !Number.isInteger(player.position) || player.position < 0 || player.position > 23
      || !Number.isInteger(player.shields) || player.shields < 0 || player.shields > 9)) {
    throw new HttpsError('invalid-argument', '참가자 정보가 올바르지 않습니다.');
  }
  if (state.board.some((tile) => !tile || typeof tile.id !== 'string' || typeof tile.name !== 'string'
      || tile.name.length > 30 || typeof tile.detail !== 'string' || tile.detail.length > 500)) {
    throw new HttpsError('invalid-argument', '보드 항목이 올바르지 않습니다.');
  }
  if (!Number.isInteger(state.shieldCap) || state.shieldCap < 0 || state.shieldCap > 9) {
    throw new HttpsError('invalid-argument', '방어권 보유 상한이 올바르지 않습니다.');
  }
  return JSON.parse(serialized);
}

exports.jurumableCreateRoom = onCall({ maxInstances: 20 }, async (request) => {
  const uid = requireAnonymousOrSignedIn(request);
  const now = Date.now();
  const hostKey = crypto.randomBytes(32).toString('base64url');
  const viewKey = crypto.randomBytes(32).toString('base64url');
  const initialState = validatePublicState(request.data && request.data.state);
  const day = new Date(now).toISOString().slice(0, 10);
  const limitRef = db.ref(`streamerJurumable/roomCreationLimits/${uid}`);
  const limitResult = await limitRef.transaction((current) => {
    const existing = current && current.day === day ? current : { day, count: 0 };
    if (existing.count >= 8) return;
    return { day, count: existing.count + 1 };
  }, undefined, false);
  if (!limitResult.committed) throw new HttpsError('resource-exhausted', '하루에 만들 수 있는 게임 방 수를 초과했습니다.');
  let roomId;
  let created = false;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    roomId = crypto.randomBytes(4).toString('hex').toUpperCase();
    const ref = roomRef(roomId);
    const result = await ref.transaction((current) => current === null ? {
      ownerUid: uid,
      hostKeyHash: hashSecret(hostKey),
      viewKeyHash: hashSecret(viewKey),
      createdAt: now,
      expiresAt: now + ROOM_TTL_MS,
      public: { ...initialState, updatedAt: now }
    } : undefined, undefined, false);
    if (result.committed) {
      created = true;
      break;
    }
  }

  if (!created) throw new HttpsError('resource-exhausted', '방을 만들지 못했습니다. 다시 시도해 주세요.');

  return { roomId, hostKey, viewKey };
});

exports.jurumableUpdateRoom = onCall({ maxInstances: 20 }, async (request) => {
  const uid = requireAnonymousOrSignedIn(request);
  const roomId = request.data && request.data.roomId;
  const hostKey = request.data && request.data.hostKey;
  const nextState = validatePublicState(request.data && request.data.state);
  const ref = roomRef(roomId);
  const snapshot = await ref.get();
  if (!snapshot.exists()) throw new HttpsError('not-found', '게임 방을 찾을 수 없습니다.');

  const room = snapshot.val();
  if (room.ownerUid !== uid || !safeEqualHex(room.hostKeyHash, hashSecret(String(hostKey || '')))) {
    throw new HttpsError('permission-denied', '이 방을 수정할 수 없습니다.');
  }
  if (typeof room.expiresAt !== 'number' || room.expiresAt < Date.now()) {
    throw new HttpsError('deadline-exceeded', '만료된 게임 방입니다.');
  }

  const updatedAt = Math.max(Date.now(), (Number(room.public && room.public.updatedAt) || 0) + 1);
  await ref.child('public').set({ ...nextState, updatedAt });
  return { ok: true, updatedAt };
});

exports.jurumableGetRoomState = onCall({ maxInstances: 20 }, async (request) => {
  const uid = requireAnonymousOrSignedIn(request);
  const roomId = request.data && request.data.roomId;
  const hostKey = request.data && request.data.hostKey;
  const viewKey = request.data && request.data.viewKey;
  const since = Number.isFinite(request.data && request.data.since) ? request.data.since : 0;
  const ref = roomRef(roomId);
  const snapshot = await ref.get();
  if (!snapshot.exists()) throw new HttpsError('not-found', '공유 보드를 찾을 수 없습니다.');

  const room = snapshot.val();
  const canHostRead = room.ownerUid === uid && safeEqualHex(room.hostKeyHash, hashSecret(String(hostKey || '')));
  const canViewRead = safeEqualHex(room.viewKeyHash, hashSecret(String(viewKey || '')));
  if (!canHostRead && !canViewRead) {
    throw new HttpsError('permission-denied', 'OBS 주소가 올바르지 않습니다.');
  }
  if (typeof room.expiresAt !== 'number' || room.expiresAt < Date.now()) {
    throw new HttpsError('deadline-exceeded', '만료된 게임 방입니다.');
  }
  const publicState = room.public || {};
  const updatedAt = Number(publicState.updatedAt) || 0;
  if (updatedAt <= since) return { updatedAt, unchanged: true };
  return { updatedAt, state: publicState };
});
