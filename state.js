import { lessons, getLesson, totalCheckpoints } from './curriculum.js';
import { defaultPlayground, validatePlayground } from './chords.js';

export const STORAGE_KEY = 'little-keys.progress.v1';
export const freshState = () => ({ version: 1, completed: {}, review: {}, tempos: {}, playground: defaultPlayground(), last: { lessonId: lessons[0].id, step: 0 }, practiceSeconds: 0, days: [], updatedAt: null });
export const countDone = state => Object.values(state.completed).reduce((n, steps) => n + steps.length, 0);
export const isDone = (state, lessonId) => (state.completed[lessonId]?.length || 0) === getLesson(lessonId)?.steps.length;
export const completedLessons = state => lessons.filter(l => isDone(state, l.id)).length;
export const progressPercent = state => Math.round(countDone(state) / totalCheckpoints * 100);
export const firstUnfinishedStep = (state, id) => Math.max(0, getLesson(id).steps.findIndex((_, i) => !state.completed[id]?.includes(i)));
export const nextLesson = state => lessons.find(l => !isDone(state, l.id));
export function completeStep(state, id, index) {
  const l = getLesson(id);
  if (!l || !Number.isInteger(index) || index < 0 || index >= l.steps.length) throw new Error('Unknown checkpoint');
  state.completed[id] = [...new Set([...(state.completed[id] || []), index])].sort((a, b) => a - b);
  const unfinished = l.steps.findIndex((_, i) => !state.completed[id].includes(i));
  if (unfinished >= 0) state.last = { lessonId: id, step: unfinished };
  else {
    const next = nextLesson(state);
    state.last = next ? { lessonId: next.id, step: firstUnfinishedStep(state, next.id) } : { lessonId: id, step: index };
  }
  return isDone(state, id);
}
export function validateState(raw) {
  if (!raw || typeof raw !== 'object' || raw.version !== 1 || !raw.completed || typeof raw.completed !== 'object' || Array.isArray(raw.completed)) throw new Error('This is not a Little Keys progress backup.');
  const clean = freshState();
  clean.playground = validatePlayground(raw.playground);
  for (const [id, indices] of Object.entries(raw.completed)) {
    const l = getLesson(id);
    if (!l || !Array.isArray(indices) || indices.some(i => !Number.isInteger(i) || i < 0 || i >= l.steps.length)) throw new Error('The backup contains an unknown lesson or checkpoint.');
    clean.completed[id] = [...new Set(indices)].sort((a, b) => a - b);
  }
  if (raw.last) {
    const l = getLesson(raw.last.lessonId);
    if (!l || !Number.isInteger(raw.last.step) || raw.last.step < 0 || raw.last.step >= l.steps.length) throw new Error('The saved resume point is invalid.');
    clean.last = { lessonId: l.id, step: raw.last.step };
  }
  for (const l of lessons) {
    if (raw.review?.[l.id] === true) clean.review[l.id] = true;
    if (Number.isFinite(raw.tempos?.[l.id]) && raw.tempos[l.id] >= 40 && raw.tempos[l.id] <= 100) clean.tempos[l.id] = Math.round(raw.tempos[l.id]);
  }
  clean.practiceSeconds = Number.isFinite(raw.practiceSeconds) ? Math.max(0, Math.min(raw.practiceSeconds, 315360000)) : 0;
  clean.days = Array.isArray(raw.days) ? [...new Set(raw.days.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))].slice(-3650) : [];
  clean.updatedAt = typeof raw.updatedAt === 'string' && !isNaN(Date.parse(raw.updatedAt)) ? raw.updatedAt : null;
  return clean;
}
export function loadState(storage) {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    return { state: saved ? validateState(JSON.parse(saved)) : freshState(), error: null };
  } catch { return { state: freshState(), error: 'Saved progress could not be read. Your existing data has not been overwritten. You can import a backup or start a new session.' }; }
}
export function saveState(storage, state) {
  state.updatedAt = new Date().toISOString();
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
