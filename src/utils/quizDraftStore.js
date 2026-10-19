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
export function clearQuizDrafts() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.error("Failed to clear quiz drafts:", err);
  }
}
