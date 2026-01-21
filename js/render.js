// ============================================
// 描画関数
// ============================================
function renderSelects() {
  $('design-theme').innerHTML = createOption(CONFIG.DESIGN_THEMES, 'テーマを選択');

  // 一括設定 - スライドタイプ（表紙・セクション以外）
  var contentTypes = CONFIG.SLIDE_TYPES.filter(function(t) {
    return t.id !== 'title' && t.id !== 'section';
  });
  $('batch-slide-type').innerHTML = createOption(contentTypes, '選択...');

  // 一括設定 - スタイル
  $('batch-art-style').innerHTML = createOption(CONFIG.ART_STYLES, '選択...');
  $('batch-structure').innerHTML = createOption(CONFIG.STRUCTURE_TEMPLATES, '選択...');
  $('batch-frame-style').innerHTML = createOption(CONFIG.FRAME_STYLES, '選択...');

  // 一括設定 - ビジュアル
  $('batch-visual').innerHTML = createOption(CONFIG.VISUAL_TYPES, '選択...');
  $('batch-visual-pos').innerHTML = createOption(CONFIG.VISUAL_POSITIONS, '選択...');

  // 一括設定 - キャラクター
  $('batch-char-gender').innerHTML = createOption(CONFIG.CHAR_GENDERS, '選択...');
  $('batch-char-age').innerHTML = createOption(CONFIG.CHAR_AGES, '選択...');
  $('batch-char-outfit').innerHTML = createOption(CONFIG.CHAR_OUTFITS, '選択...');
  $('batch-char-expression').innerHTML = createOption(CONFIG.CHAR_EXPRESSIONS, '選択...');
  $('batch-char-pose').innerHTML = createOption(CONFIG.CHAR_POSES, '選択...');

  // 一括設定 - 本文
  $('batch-text-position').innerHTML = createOption(CONFIG.TEXT_POSITIONS, '選択...');
  $('batch-text-style').innerHTML = createOption(CONFIG.TEXT_STYLES, '選択...');

  // 一括設定 - 背景・装飾
  $('batch-bg-type').innerHTML = createOption(CONFIG.BG_TYPES, '選択...');
  $('batch-bg-mood').innerHTML = createOption(CONFIG.BG_MOODS, '選択...');
  $('batch-decoration').innerHTML = createOption(CONFIG.DECORATIONS, '選択...');
}

function renderSlideNav() {
  var nav = $('slide-nav');
  var html = '';

  for (var i = 0; i < STATE.slides.length; i++) {
    var slide = STATE.slides[i];
    var hasContent = slide.title || slide.points.length > 0;
    var activeClass = i === STATE.currentSlide ? ' active' : '';
    var contentClass = hasContent ? ' has-content' : '';
    html += '<button type="button" class="slide-tab' + activeClass + contentClass + '" data-index="' + i + '">' + (i + 1) + '</button>';
  }

  nav.innerHTML = html;
  $('slide-info').textContent = '(' + STATE.slides.length + '枚)';
}

function renderSlideEditor() {
  var editor = $('slide-editor');

  if (STATE.slides.length === 0 || STATE.currentSlide >= STATE.slides.length) {
    editor.innerHTML = '<div style="text-align:center;color:#6b7280;padding:40px 0;">スライドを分割すると編集できます</div>';
    return;
  }

  var slide = STATE.slides[STATE.currentSlide];
  var isCover = (slide.type === 'title' || slide.type === 'section');

  // オプション生成関数
  function makeOptions(arr, val) {
    return arr.map(function(item) {
      var sel = item.id === val ? ' selected' : '';
      return '<option value="' + item.id + '"' + sel + '>' + item.name + '</option>';
    }).join('');
  }

  var html = '<div class="slide-editor-header">';
  html += '<span class="slide-editor-title">' + (STATE.currentSlide + 1) + '枚目</span>';
  html += '<select class="slide-type-select" id="slide-type">' + makeOptions(CONFIG.SLIDE_TYPES, slide.type) + '</select>';
  html += '</div>';

  // タイトル・サブタイトル
  html += '<div class="slide-content-row">';
  html += '<div class="slide-content-item"><label>タイトル</label><input type="text" id="slide-title" value="' + escapeHtml(slide.title) + '"></div>';
  html += '<div class="slide-content-item"><label>サブタイトル</label><input type="text" id="slide-subtitle" value="' + escapeHtml(slide.subtitle) + '"></div>';
  html += '</div>';

  // 表紙専用設定
  if (isCover) {
    html += '<div class="editor-section"><div class="editor-section-title">📐 表紙レイアウト</div>';
    html += '<div class="slide-content-row" style="grid-template-columns:1fr 1fr 1fr 1fr;">';
    html += '<div class="slide-content-item"><label>タイトル位置</label><select id="slide-title-pos" class="select-compact">' + makeOptions(CONFIG.TITLE_POSITIONS, slide.titlePosition) + '</select></div>';
    html += '<div class="slide-content-item"><label>タイトルサイズ</label><select id="slide-title-size" class="select-compact">' + makeOptions(CONFIG.TITLE_SIZES, slide.titleSize) + '</select></div>';
    html += '<div class="slide-content-item"><label>イラスト配置</label><select id="slide-cover-visual-pos" class="select-compact">' + makeOptions(CONFIG.COVER_VISUAL_POSITIONS, slide.coverVisualPos) + '</select></div>';
    html += '<div class="slide-content-item"><label>イラストサイズ</label><select id="slide-cover-visual-size" class="select-compact">' + makeOptions(CONFIG.COVER_VISUAL_SIZES, slide.coverVisualSize) + '</select></div>';
    html += '</div></div>';
  }

  // 🎨 スタイル
  html += '<div class="editor-section"><div class="editor-section-title">🎨 スタイル</div>';
  html += '<div class="slide-content-row" style="grid-template-columns:1fr 1fr 1fr;">';
  html += '<div class="slide-content-item"><label>アートスタイル</label><select id="slide-art-style" class="select-compact">' + makeOptions(CONFIG.ART_STYLES, slide.artStyle) + '</select></div>';
  html += '<div class="slide-content-item"><label>構造</label><select id="slide-structure" class="select-compact">' + makeOptions(CONFIG.STRUCTURE_TEMPLATES, slide.structure) + '</select></div>';
  html += '<div class="slide-content-item"><label>フレーム</label><select id="slide-frame-style" class="select-compact">' + makeOptions(CONFIG.FRAME_STYLES, slide.frameStyle) + '</select></div>';
  html += '</div></div>';

  // 🖼️ ビジュアル
  html += '<div class="editor-section"><div class="editor-section-title">🖼️ ビジュアル</div>';
  html += '<div class="slide-content-row" style="grid-template-columns:1fr 1fr;">';
  html += '<div class="slide-content-item"><label>ビジュアルタイプ</label><select id="slide-visual" class="select-compact">' + makeOptions(CONFIG.VISUAL_TYPES, slide.visual) + '</select></div>';
  html += '<div class="slide-content-item"><label>ビジュアル配置</label><select id="slide-visual-pos" class="select-compact">' + makeOptions(CONFIG.VISUAL_POSITIONS, slide.visualPosition) + '</select></div>';
  html += '</div></div>';

  // 👤 キャラクター
  html += '<div class="editor-section"><div class="editor-section-title">👤 キャラクター</div>';
  html += '<div class="slide-content-row" style="grid-template-columns:1fr 1fr 1fr 1fr 1fr;">';
  html += '<div class="slide-content-item"><label>性別</label><select id="slide-char-gender" class="select-compact">' + makeOptions(CONFIG.CHAR_GENDERS, slide.charGender) + '</select></div>';
  html += '<div class="slide-content-item"><label>年齢</label><select id="slide-char-age" class="select-compact">' + makeOptions(CONFIG.CHAR_AGES, slide.charAge) + '</select></div>';
  html += '<div class="slide-content-item"><label>服装</label><select id="slide-char-outfit" class="select-compact">' + makeOptions(CONFIG.CHAR_OUTFITS, slide.charOutfit) + '</select></div>';
  html += '<div class="slide-content-item"><label>表情</label><select id="slide-char-expression" class="select-compact">' + makeOptions(CONFIG.CHAR_EXPRESSIONS, slide.charExpression) + '</select></div>';
  html += '<div class="slide-content-item"><label>ポーズ</label><select id="slide-char-pose" class="select-compact">' + makeOptions(CONFIG.CHAR_POSES, slide.charPose) + '</select></div>';
  html += '</div></div>';

  // 📝 本文
  html += '<div class="editor-section"><div class="editor-section-title">📝 本文</div>';
  html += '<div class="slide-content-row" style="grid-template-columns:1fr 1fr;">';
  html += '<div class="slide-content-item"><label>本文配置</label><select id="slide-text-position" class="select-compact">' + makeOptions(CONFIG.TEXT_POSITIONS, slide.textPosition) + '</select></div>';
  html += '<div class="slide-content-item"><label>本文スタイル</label><select id="slide-text-style" class="select-compact">' + makeOptions(CONFIG.TEXT_STYLES, slide.textStyle) + '</select></div>';
  html += '</div></div>';

  // 🌄 背景・装飾
  html += '<div class="editor-section"><div class="editor-section-title">🌄 背景・装飾</div>';
  html += '<div class="slide-content-row" style="grid-template-columns:1fr 1fr 1fr;">';
  html += '<div class="slide-content-item"><label>背景タイプ</label><select id="slide-bg-type" class="select-compact">' + makeOptions(CONFIG.BG_TYPES, slide.bgType) + '</select></div>';
  html += '<div class="slide-content-item"><label>背景ムード</label><select id="slide-bg-mood" class="select-compact">' + makeOptions(CONFIG.BG_MOODS, slide.bgMood) + '</select></div>';
  html += '<div class="slide-content-item"><label>装飾</label><select id="slide-decoration" class="select-compact">' + makeOptions(CONFIG.DECORATIONS, slide.decoration) + '</select></div>';
  html += '</div></div>';

  // ポイント（表紙以外）
  if (!isCover) {
    html += '<div class="slide-content-item" style="margin-top:8px">';
    html += '<label>ポイント（改行区切り）</label>';
    html += '<textarea id="slide-points">' + escapeHtml(slide.points.join('\n')) + '</textarea>';
    html += '</div>';
  }

  html += '<div class="slide-content-item" style="margin-top:8px">';
  html += '<label>補足メモ</label>';
  html += '<textarea id="slide-notes" style="min-height:50px">' + escapeHtml(slide.notes) + '</textarea>';
  html += '</div>';

  editor.innerHTML = html;
}

function renderPreview() {
  var container = $('preview');

  // アスペクト比
  var ratio = '16/9';
  if (STATE.slideSize === '4:3') ratio = '4/3';
  else if (STATE.slideSize === '1:1') ratio = '1/1';
  else if (STATE.slideSize === '9:16') ratio = '9/16';
  container.style.aspectRatio = ratio;

  if (STATE.slides.length === 0 || STATE.currentSlide >= STATE.slides.length) {
    container.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:12px;">スライドを選択してください</div>';
    return;
  }

  var slide = STATE.slides[STATE.currentSlide];
  console.log('Rendering slide:', STATE.currentSlide, 'type:', slide.type, 'title:', slide.title);

  var typeInfo = CONFIG.SLIDE_TYPES.find(function(t) { return t.id === slide.type; });
  var visualInfo = CONFIG.VISUAL_TYPES.find(function(v) { return v.id === slide.visual; });
  var artInfo = CONFIG.ART_STYLES.find(function(a) { return a.id === slide.artStyle; });
  var frameInfo = CONFIG.FRAME_STYLES.find(function(f) { return f.id === slide.frameStyle; });

  // 基本スタイル
  var baseStyle = 'width:100%;height:100%;box-sizing:border-box;';

  // フレームスタイル
  var frameStyle = '';
  if (slide.frameStyle && slide.frameStyle !== 'none') {
    if (slide.frameStyle === 'simple') frameStyle = 'border:2px solid ' + STATE.cMain + ';';
    else if (slide.frameStyle === 'rounded') frameStyle = 'border:2px solid ' + STATE.cMain + ';border-radius:12px;';
    else if (slide.frameStyle === 'double') frameStyle = 'border:4px double ' + STATE.cMain + ';';
    else if (slide.frameStyle === 'japanese') frameStyle = 'border:3px solid ' + STATE.cMain + ';box-shadow:inset 0 0 0 4px ' + STATE.cBg + ', inset 0 0 0 6px ' + STATE.cMain + ';';
    else if (slide.frameStyle === 'ornate') frameStyle = 'border:3px solid ' + STATE.cAccent + ';border-radius:8px;';
    else if (slide.frameStyle === 'shadow') frameStyle = 'box-shadow:4px 4px 12px rgba(0,0,0,0.3);';
    else if (slide.frameStyle === 'neon') frameStyle = 'border:2px solid ' + STATE.cAccent + ';box-shadow:0 0 8px ' + STATE.cAccent + ';';
  }

  var html = '';
  var labels = [(STATE.currentSlide + 1) + '/' + STATE.slides.length];
  if (typeInfo) labels.push(typeInfo.name);

  // スライドタイプ別のレンダリング
  html = renderSlideByType(slide, baseStyle, frameStyle, visualInfo, labels);

  // 追加ラベル
  if (artInfo && artInfo.id !== 'none') labels.push(artInfo.name.split(' ')[0]);
  if (frameInfo && frameInfo.id !== 'none') labels.push(frameInfo.name.split(' ')[0]);

  html += '<div class="preview-label">' + labels.join(' ') + '</div>';
  container.innerHTML = html;
}

function renderSlideByType(slide, baseStyle, frameStyle, visualInfo, labels) {
  var html = '';

  // ===== 表紙スライド =====
  if (slide.type === 'title') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;align-items:center;justify-content:center;background:' + STATE.cBg + ';position:relative;' + frameStyle + '">';

    // ビジュアル（背景またはサイド）
    if (slide.coverVisualPos && slide.coverVisualPos !== 'none') {
      var vStyle = 'position:absolute;background:' + STATE.cSub + '33;display:flex;align-items:center;justify-content:center;font-size:20px;';
      if (slide.coverVisualPos === 'background') {
        vStyle += 'inset:0;opacity:0.3;';
      } else if (slide.coverVisualPos === 'right') {
        vStyle += 'right:5%;top:50%;transform:translateY(-50%);width:25%;height:60%;border-radius:8px;';
      } else if (slide.coverVisualPos === 'left') {
        vStyle += 'left:5%;top:50%;transform:translateY(-50%);width:25%;height:60%;border-radius:8px;';
      } else if (slide.coverVisualPos === 'bottom-right') {
        vStyle += 'right:5%;bottom:5%;width:25%;height:40%;border-radius:8px;';
      } else if (slide.coverVisualPos === 'bottom-left') {
        vStyle += 'left:5%;bottom:5%;width:25%;height:40%;border-radius:8px;';
      }
      html += '<div style="' + vStyle + '">🎨</div>';
    }

    html += '<div style="text-align:center;z-index:1;padding:0 10%;">';
    html += '<div style="font-size:16px;font-weight:700;color:' + STATE.cText + ';margin-bottom:6px;">' + escapeHtml(slide.title || '表紙タイトル') + '</div>';
    if (slide.subtitle) {
      html += '<div style="font-size:9px;color:' + STATE.cText + '99;">' + escapeHtml(slide.subtitle) + '</div>';
    }
    html += '</div>';
    html += '<div style="position:absolute;bottom:8px;font-size:7px;color:' + STATE.cText + '66;">📘 表紙</div>';
    html += '</div>';
  }

  // ===== セクション区切り =====
  else if (slide.type === 'section') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,' + STATE.cMain + '15,' + STATE.cSub + '15);position:relative;' + frameStyle + '">';
    html += '<div style="width:50px;height:3px;background:' + STATE.cMain + ';margin-bottom:10px;border-radius:2px;"></div>';
    html += '<div style="text-align:center;padding:0 12%;max-width:90%;">';
    var secTitle = slide.title || 'セクションタイトル';
    var shortSecTitle = secTitle.length > 30 ? secTitle.substring(0, 30) + '...' : secTitle;
    html += '<div style="font-size:12px;font-weight:700;color:' + STATE.cText + ';line-height:1.4;">' + escapeHtml(shortSecTitle) + '</div>';
    if (slide.subtitle) {
      var shortSubtitle = slide.subtitle.length > 40 ? slide.subtitle.substring(0, 40) + '...' : slide.subtitle;
      html += '<div style="font-size:8px;color:' + STATE.cText + '99;margin-top:6px;">' + escapeHtml(shortSubtitle) + '</div>';
    }
    html += '</div>';
    html += '<div style="width:50px;height:3px;background:' + STATE.cMain + ';margin-top:10px;border-radius:2px;"></div>';
    html += '<div style="position:absolute;bottom:6px;font-size:7px;color:' + STATE.cText + '55;">📑 セクション</div>';
    html += '</div>';
  }

  // ===== まとめスライド =====
  else if (slide.type === 'summary') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + STATE.cBg + ';padding:8px;position:relative;' + frameStyle + '">';
    html += '<div style="background:' + STATE.cMain + ';color:#fff;padding:6px 10px;border-radius:4px;font-size:11px;font-weight:600;margin-bottom:8px;">📌 ' + escapeHtml(slide.title || 'まとめ') + '</div>';
    html += '<div style="flex:1;display:flex;flex-direction:column;gap:3px;">';
    var pts = slide.points && slide.points.length > 0 ? slide.points : ['ポイント1', 'ポイント2', 'ポイント3'];
    for (var i = 0; i < Math.min(pts.length, 5); i++) {
      html += '<div style="display:flex;align-items:center;gap:4px;font-size:8px;color:' + STATE.cText + ';"><span style="color:' + STATE.cAccent + ';">✓</span>' + escapeHtml(pts[i]) + '</div>';
    }
    html += '</div>';
    html += '</div>';
  }

  // ===== 2カラム =====
  else if (slide.type === 'two-column') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + STATE.cBg + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;border-left:3px solid ' + STATE.cMain + ';padding-left:6px;">' + escapeHtml(slide.title || 'タイトル') + '</div>';
    html += '<div style="flex:1;display:flex;gap:6px;">';
    html += '<div style="flex:1;background:' + STATE.cSub + '15;border-radius:4px;padding:6px;font-size:7px;color:' + STATE.cText + ';">左カラム</div>';
    html += '<div style="flex:1;background:' + STATE.cSub + '15;border-radius:4px;padding:6px;font-size:7px;color:' + STATE.cText + ';">右カラム</div>';
    html += '</div></div>';
  }

  // ===== 4パネル =====
  else if (slide.type === 'four-panel') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + STATE.cBg + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;text-align:center;">' + escapeHtml(slide.title || 'タイトル') + '</div>';
    html += '<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:4px;">';
    for (var i = 0; i < 4; i++) {
      html += '<div style="background:' + STATE.cSub + '15;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:16px;">📦</div>';
    }
    html += '</div></div>';
  }

  // ===== 画像+テキスト =====
  else if (slide.type === 'image-text') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;background:' + STATE.cBg + ';padding:8px;gap:8px;' + frameStyle + '">';
    html += '<div style="width:45%;background:' + STATE.cSub + '22;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:24px;">🖼️</div>';
    html += '<div style="flex:1;display:flex;flex-direction:column;">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:4px;">' + escapeHtml(slide.title || 'タイトル') + '</div>';
    html += '<div style="flex:1;font-size:7px;color:' + STATE.cText + '99;">テキストエリア...</div>';
    html += '</div></div>';
  }

  // ===== 図解中心 =====
  else if (slide.type === 'diagram') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + STATE.cBg + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;text-align:center;">' + escapeHtml(slide.title || 'タイトル') + '</div>';
    html += '<div style="flex:1;background:' + STATE.cSub + '15;border-radius:4px;display:flex;align-items:center;justify-content:center;">';
    html += '<div style="font-size:24px;">📊</div>';
    html += '</div></div>';
  }

  // ===== データ・統計 =====
  else if (slide.type === 'data') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + STATE.cBg + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;">' + escapeHtml(slide.title || 'タイトル') + '</div>';
    html += '<div style="flex:1;display:flex;gap:6px;">';
    html += '<div style="flex:1;background:' + STATE.cMain + '22;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:16px;font-weight:700;color:' + STATE.cMain + ';">85%</div><div style="font-size:6px;color:' + STATE.cText + '99;">指標A</div></div>';
    html += '<div style="flex:1;background:' + STATE.cSub + '22;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:16px;font-weight:700;color:' + STATE.cSub + ';">+24</div><div style="font-size:6px;color:' + STATE.cText + '99;">指標B</div></div>';
    html += '</div></div>';
  }

  // ===== タイムライン =====
  else if (slide.type === 'timeline') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + STATE.cBg + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;">' + escapeHtml(slide.title || 'タイトル') + '</div>';
    html += '<div style="flex:1;display:flex;align-items:center;position:relative;">';
    html += '<div style="position:absolute;left:10%;right:10%;height:2px;background:' + STATE.cMain + ';"></div>';
    for (var i = 0; i < 4; i++) {
      var left = 10 + i * 26.6;
      html += '<div style="position:absolute;left:' + left + '%;width:12px;height:12px;background:' + STATE.cMain + ';border-radius:50%;"></div>';
    }
    html += '</div></div>';
  }

  // ===== 比較・Before/After =====
  else if (slide.type === 'comparison') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + STATE.cBg + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;text-align:center;">' + escapeHtml(slide.title || 'タイトル') + '</div>';
    html += '<div style="flex:1;display:flex;gap:4px;">';
    html += '<div style="flex:1;background:#fee2e2;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:8px;color:#dc2626;font-weight:600;">Before</div></div>';
    html += '<div style="display:flex;align-items:center;font-size:14px;">→</div>';
    html += '<div style="flex:1;background:#dcfce7;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:8px;color:#16a34a;font-weight:600;">After</div></div>';
    html += '</div></div>';
  }

  // ===== 引用・強調 =====
  else if (slide.type === 'quote') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;align-items:center;justify-content:center;background:' + STATE.cBg + ';padding:16px;' + frameStyle + '">';
    html += '<div style="font-size:24px;color:' + STATE.cMain + '44;margin-bottom:4px;">"</div>';
    html += '<div style="font-size:10px;color:' + STATE.cText + ';text-align:center;font-style:italic;padding:0 10%;">' + escapeHtml(slide.title || '引用テキスト') + '</div>';
    html += '<div style="font-size:24px;color:' + STATE.cMain + '44;margin-top:4px;">"</div>';
    html += '</div>';
  }

  // ===== 箇条書き（デフォルト） =====
  else {
    html = renderBulletSlide(slide, baseStyle, frameStyle, visualInfo, labels);
  }

  return html;
}

function renderBulletSlide(slide, baseStyle, frameStyle, visualInfo, labels) {
  var html = '';
  var hasVisual = slide.visual && slide.visual !== 'none';
  var isLeft = slide.visualPosition === 'left';
  var isRight = slide.visualPosition === 'right';
  var isTop = slide.visualPosition === 'top';
  var isBottom = slide.visualPosition === 'bottom';
  var isBg = slide.visualPosition === 'background';

  var flexDir = hasVisual && (isLeft || isRight) ? 'row' : 'column';
  html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:' + flexDir + ';background:' + STATE.cBg + ';padding:10px;position:relative;gap:6px;' + frameStyle + '">';

  // 背景ビジュアル
  if (hasVisual && isBg) {
    html += '<div style="position:absolute;inset:0;background:' + STATE.cSub + '22;display:flex;align-items:center;justify-content:center;font-size:32px;opacity:0.2;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
  }

  // 左ビジュアル
  if (hasVisual && isLeft) {
    html += '<div style="width:28%;min-height:60px;background:' + STATE.cSub + '22;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
  }

  // 上ビジュアル
  if (hasVisual && isTop) {
    html += '<div style="width:100%;height:25%;min-height:30px;background:' + STATE.cSub + '22;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
  }

  // メインコンテンツ
  html += '<div style="flex:1;display:flex;flex-direction:column;overflow:hidden;z-index:1;min-width:0;">';

  // タイトル
  if (slide.title) {
    var shortTitle = slide.title.length > 40 ? slide.title.substring(0, 40) + '...' : slide.title;
    html += '<div style="font-size:11px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;padding:4px 8px;background:' + STATE.cMain + '15;border-left:3px solid ' + STATE.cMain + ';border-radius:0 4px 4px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(shortTitle) + '</div>';
  }

  // ポイント
  html += '<div style="flex:1;display:flex;flex-direction:column;gap:2px;overflow:hidden;">';
  var pts = slide.points && slide.points.length > 0 ? slide.points : [];
  var noteLines = slide.notes ? slide.notes.split('\n').filter(function(l){ return l.trim(); }) : [];
  var displayItems = pts.length > 0 ? pts : noteLines;

  if (displayItems.length > 0) {
    var maxItems = Math.min(displayItems.length, 4);
    for (var i = 0; i < maxItems; i++) {
      var shortText = displayItems[i].length > 50 ? displayItems[i].substring(0, 50) + '...' : displayItems[i];
      html += '<div style="font-size:8px;color:' + STATE.cText + ';padding:3px 6px;background:' + STATE.cSub + '08;border-radius:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">• ' + escapeHtml(shortText) + '</div>';
    }
    if (displayItems.length > 4) {
      html += '<div style="font-size:7px;color:' + STATE.cText + '88;padding:2px 6px;">... 他 ' + (displayItems.length - 4) + ' 件</div>';
    }
  } else {
    html += '<div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:8px;color:' + STATE.cText + '66;background:' + STATE.cSub + '08;border-radius:4px;">（内容未入力）</div>';
  }
  html += '</div></div>';

  // 右ビジュアル
  if (hasVisual && isRight) {
    html += '<div style="width:28%;min-height:60px;background:' + STATE.cSub + '22;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
  }

  // 下ビジュアル
  if (hasVisual && isBottom) {
    html += '<div style="width:100%;height:25%;min-height:30px;background:' + STATE.cSub + '22;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
  }

  html += '</div>';

  if (hasVisual && visualInfo) labels.push(visualInfo.name.split(' ')[0]);

  return html;
}

function update() {
  updateColors();
  renderSlideNav();
  renderSlideEditor();
  renderPreview();
  renderPrompt();
}
