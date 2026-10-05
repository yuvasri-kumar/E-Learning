// Experiment 1: per-course quiz draft (answers picked so far) saved in
// localStorage, keyed by course id so each course keeps its own quiz progress.

const DRAFT_KEY = "edusphere_quiz_drafts_v1";

function readAll() {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.error("Failed to load quiz draft:", err);
    return {};
  }
}

export function loadQuizDraft(courseId) {
  return readAll()[courseId] || {};
}

export function saveQuizDraft(courseId, answers) {
  try {
    const all = readAll();
    if (answers && Object.keys(answers).length > 0) {
      all[courseId] = answers;
    } else {
      delete all[courseId];
    }
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
  } catch (err) {
    console.error("Failed to save quiz draft:", err);
  }
}
