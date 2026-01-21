// ============================================
// 初期化
// ============================================
function init() {
  renderSelects();
  setupEvents();
  updateStats();
  update();
}

document.addEventListener('DOMContentLoaded', init);
