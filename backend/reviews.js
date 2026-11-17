// Small helpers for course ratings. Used by the catalogue and the reviews routes.
function ratingSummary(data, courseId) {
  const list = (data.reviews || []).filter(r => r.courseId === courseId);
  if (!list.length) return { average: null, count: 0 };
  const total = list.reduce((sum, r) => sum + r.rating, 0);
  return { average: Math.round((total / list.length) * 10) / 10, count: list.length };
}

// "Asha Patel" becomes "Asha P." so public reviews do not show full names
function publicName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'Student';
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

module.exports = { ratingSummary, publicName };
