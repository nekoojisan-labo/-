// ============================================
// イベントハンドラ
// ============================================
function setupEvents() {
  // カード折りたたみ
  document.querySelectorAll('.card-header').forEach(function(header) {
    header.addEventListener('click', function() {
      this.parentElement.classList.toggle('collapsed');
    });
  });

  // スライド設定
  $('slide-size').addEventListener('change', function() {
    STATE.slideSize = this.value;
    update();
  });
  $('output-size').addEventListener('change', function() {
    STATE.outputSize = this.value;
    update();
  });
  $('design-theme').addEventListener('change', function() {
    STATE.designTheme = this.value;
    var theme = CONFIG.DESIGN_THEMES.find(function(t) { return t.id === STATE.designTheme; });
    if (theme) {
      STATE.cMain = theme.main;
      STATE.cSub = theme.sub;
      STATE.cAccent = theme.accent;
      STATE.cBg = theme.bg;
      STATE.cText = theme.text;
    }
    update();
  });

  // カラー
  $('c-main').addEventListener('input', function() { STATE.cMain = this.value.toUpperCase(); update(); });
  $('c-sub').addEventListener('input', function() { STATE.cSub = this.value.toUpperCase(); update(); });
  $('c-accent').addEventListener('input', function() { STATE.cAccent = this.value.toUpperCase(); update(); });
  $('c-bg').addEventListener('input', function() { STATE.cBg = this.value.toUpperCase(); update(); });
  $('c-text').addEventListener('input', function() { STATE.cText = this.value.toUpperCase(); update(); });

  // 参照画像
  $('ref-char').addEventListener('click', function() {
    STATE.refChar = !STATE.refChar;
    this.classList.toggle('active', STATE.refChar);
    update();
  });
  $('ref-bg').addEventListener('click', function() {
    STATE.refBg = !STATE.refBg;
    this.classList.toggle('active', STATE.refBg);
    update();
  });
  $('ref-illust').addEventListener('click', function() {
    STATE.refIllust = !STATE.refIllust;
    this.classList.toggle('active', STATE.refIllust);
    update();
  });

  // 一括適用ボタン
  $('apply-batch-btn').addEventListener('click', function() {
    if (STATE.slides.length === 0) {
      alert('先にスライドを分割してください');
      return;
    }
    applyBatchSettings(false);
    update();
    showNotice('全スライドに適用しました');
  });

  $('apply-batch-empty-btn').addEventListener('click', function() {
    if (STATE.slides.length === 0) {
      alert('先にスライドを分割してください');
      return;
    }
    applyBatchSettings(true);
    update();
    showNotice('未設定項目に適用しました');
  });

  // 資料入力
  $('source-content').addEventListener('input', function() {
    STATE.sourceContent = this.value;
    updateStats();
  });

  $('slide-count').addEventListener('change', function() {
    STATE.slideCount = parseInt(this.value) || 5;
  });

  // 分割ボタン
  $('split-btn').addEventListener('click', function() {
    if (!STATE.sourceContent.trim()) {
      alert('資料を入力してください');
      return;
    }
    STATE.slides = splitContentToSlides(STATE.sourceContent, STATE.slideCount);
    STATE.currentSlide = 0;
    update();
  });

  // スライドナビゲーション
  $('slide-nav').addEventListener('click', function(e) {
    if (e.target.classList.contains('slide-tab')) {
      STATE.currentSlide = parseInt(e.target.getAttribute('data-index'));
      update();
    }
  });

  // スライドエディタ
  $('slide-editor').addEventListener('change', handleSlideEditorChange);
  $('slide-editor').addEventListener('input', handleSlideEditorInput);

  // コピー
  $('copy-btn').addEventListener('click', function() {
    var text = $('prompt').textContent;
    navigator.clipboard.writeText(text).then(function() {
      var btn = $('copy-btn');
      btn.textContent = '✓ コピー完了';
      setTimeout(function() { btn.textContent = 'コピー'; }, 1500);
    });
  });
  $('copy-fab').addEventListener('click', function() {
    var text = $('prompt').textContent;
    navigator.clipboard.writeText(text);
  });

  // MD一括DL
  $('dl-btn').addEventListener('click', downloadMarkdown);

  // リセット
  $('reset-btn').addEventListener('click', doReset);
}

function applyBatchSettings(onlyEmpty) {
  var slideType = $('batch-slide-type').value;
  var artStyle = $('batch-art-style').value;
  var structure = $('batch-structure').value;
  var frameStyle = $('batch-frame-style').value;
  var textPosition = $('batch-text-position').value;
  var textStyle = $('batch-text-style').value;
  var decoration = $('batch-decoration').value;
  var visual = $('batch-visual').value;
  var visualPos = $('batch-visual-pos').value;
  var charGender = $('batch-char-gender').value;
  var charAge = $('batch-char-age').value;
  var charOutfit = $('batch-char-outfit').value;
  var charExpression = $('batch-char-expression').value;
  var charPose = $('batch-char-pose').value;
  var bgType = $('batch-bg-type').value;
  var bgMood = $('batch-bg-mood').value;

  for (var i = 0; i < STATE.slides.length; i++) {
    var s = STATE.slides[i];

    if (onlyEmpty) {
      // 未設定のみ適用
      if (slideType && s.type !== 'title' && s.type !== 'section' && s.type === 'bullet') s.type = slideType;
      if (artStyle && s.artStyle === 'none') s.artStyle = artStyle;
      if (structure && s.structure === 'none') s.structure = structure;
      if (frameStyle && s.frameStyle === 'none') s.frameStyle = frameStyle;
      if (textPosition && s.textPosition === 'center') s.textPosition = textPosition;
      if (textStyle && s.textStyle === 'none') s.textStyle = textStyle;
      if (decoration && s.decoration === 'none') s.decoration = decoration;
      if (visual && s.visual === 'none') s.visual = visual;
      if (visualPos && s.visualPosition === 'right') s.visualPosition = visualPos;
      if (charGender && s.charGender === 'none') s.charGender = charGender;
      if (charAge && s.charAge === 'none') s.charAge = charAge;
      if (charOutfit && s.charOutfit === 'none') s.charOutfit = charOutfit;
      if (charExpression && s.charExpression === 'none') s.charExpression = charExpression;
      if (charPose && s.charPose === 'none') s.charPose = charPose;
      if (bgType && s.bgType === 'none') s.bgType = bgType;
      if (bgMood && s.bgMood === 'none') s.bgMood = bgMood;
    } else {
      // 全て適用
      if (slideType && s.type !== 'title' && s.type !== 'section') s.type = slideType;
      if (artStyle) s.artStyle = artStyle;
      if (structure) s.structure = structure;
      if (frameStyle) s.frameStyle = frameStyle;
      if (textPosition) s.textPosition = textPosition;
      if (textStyle) s.textStyle = textStyle;
      if (decoration) s.decoration = decoration;
      if (visual) s.visual = visual;
      if (visualPos) s.visualPosition = visualPos;
      if (charGender) s.charGender = charGender;
      if (charAge) s.charAge = charAge;
      if (charOutfit) s.charOutfit = charOutfit;
      if (charExpression) s.charExpression = charExpression;
      if (charPose) s.charPose = charPose;
      if (bgType) s.bgType = bgType;
      if (bgMood) s.bgMood = bgMood;
    }
  }
}

function handleSlideEditorChange(e) {
  if (STATE.slides.length === 0) return;
  var slide = STATE.slides[STATE.currentSlide];
  var id = e.target.id;

  if (id === 'slide-type') slide.type = e.target.value;
  else if (id === 'slide-title') slide.title = e.target.value;
  else if (id === 'slide-subtitle') slide.subtitle = e.target.value;
  else if (id === 'slide-points') slide.points = e.target.value.split('\n').filter(function(l) { return l.trim(); });
  else if (id === 'slide-notes') slide.notes = e.target.value;
  else if (id === 'slide-visual') slide.visual = e.target.value;
  else if (id === 'slide-visual-pos') slide.visualPosition = e.target.value;
  else if (id === 'slide-layout') slide.layout = e.target.value;
  else if (id === 'slide-decoration') slide.decoration = e.target.value;
  else if (id === 'slide-char-gender') slide.charGender = e.target.value;
  else if (id === 'slide-char-age') slide.charAge = e.target.value;
  else if (id === 'slide-char-outfit') slide.charOutfit = e.target.value;
  else if (id === 'slide-char-expression') slide.charExpression = e.target.value;
  else if (id === 'slide-char-pose') slide.charPose = e.target.value;
  else if (id === 'slide-bg-type') slide.bgType = e.target.value;
  else if (id === 'slide-bg-mood') slide.bgMood = e.target.value;
  else if (id === 'slide-title-pos') slide.titlePosition = e.target.value;
  else if (id === 'slide-title-size') slide.titleSize = e.target.value;
  else if (id === 'slide-cover-visual-pos') slide.coverVisualPos = e.target.value;
  else if (id === 'slide-cover-visual-size') slide.coverVisualSize = e.target.value;
  else if (id === 'slide-art-style') slide.artStyle = e.target.value;
  else if (id === 'slide-structure') slide.structure = e.target.value;
  else if (id === 'slide-frame-style') slide.frameStyle = e.target.value;
  else if (id === 'slide-text-position') slide.textPosition = e.target.value;
  else if (id === 'slide-text-style') slide.textStyle = e.target.value;

  renderSlideNav();
  renderPreview();
  renderPrompt();
}

function handleSlideEditorInput(e) {
  if (STATE.slides.length === 0) return;
  var slide = STATE.slides[STATE.currentSlide];

  if (e.target.id === 'slide-title') slide.title = e.target.value;
  else if (e.target.id === 'slide-subtitle') slide.subtitle = e.target.value;
  else if (e.target.id === 'slide-points') slide.points = e.target.value.split('\n').filter(function(l) { return l.trim(); });
  else if (e.target.id === 'slide-notes') slide.notes = e.target.value;

  renderPreview();
  renderPrompt();
}

function doReset() {
  STATE = {
    slideSize: '16:9',
    outputSize: '1920',
    designTheme: '',
    cMain: CONFIG.DEFAULT_COLORS.main,
    cSub: CONFIG.DEFAULT_COLORS.sub,
    cAccent: CONFIG.DEFAULT_COLORS.accent,
    cBg: CONFIG.DEFAULT_COLORS.bg,
    cText: CONFIG.DEFAULT_COLORS.text,
    refChar: false,
    refBg: false,
    refIllust: false,
    sourceContent: '',
    slideCount: 5,
    slides: [],
    currentSlide: 0
  };

  $('slide-size').value = '16:9';
  $('output-size').value = '1920';
  $('design-theme').value = '';
  $('source-content').value = '';
  $('slide-count').value = '5';

  document.querySelectorAll('.toggle-switch.active').forEach(function(sw) {
    sw.classList.remove('active');
  });

  updateStats();
  update();

  showNotice('リセット完了');
}
