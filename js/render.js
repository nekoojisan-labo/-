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

  var typeInfo = CONFIG.SLIDE_TYPES.find(function(t) { return t.id === slide.type; });
  var visualInfo = CONFIG.VISUAL_TYPES.find(function(v) { return v.id === slide.visual; });
  var artInfo = CONFIG.ART_STYLES.find(function(a) { return a.id === slide.artStyle; });
  var frameInfo = CONFIG.FRAME_STYLES.find(function(f) { return f.id === slide.frameStyle; });
  var structureInfo = CONFIG.STRUCTURE_TEMPLATES.find(function(s) { return s.id === slide.structure; });

  // 基本スタイル
  var baseStyle = 'width:100%;height:100%;box-sizing:border-box;';

  // 背景スタイルを生成
  var bgStyle = generateBgStyle(slide);

  // フレームスタイル
  var frameStyle = generateFrameStyle(slide);

  var html = '';
  var labels = [(STATE.currentSlide + 1) + '/' + STATE.slides.length];
  if (typeInfo) labels.push(typeInfo.name);

  // スライドタイプ別のレンダリング
  html = renderSlideByType(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels);

  // 追加ラベル
  if (structureInfo && structureInfo.id !== 'none') labels.push(structureInfo.name.split(' ')[0]);
  if (artInfo && artInfo.id !== 'none') labels.push(artInfo.name.split(' ')[0]);
  if (frameInfo && frameInfo.id !== 'none') labels.push(frameInfo.name.split(' ')[0]);

  html += '<div class="preview-label">' + labels.join(' ') + '</div>';
  container.innerHTML = html;
}

// 背景スタイル生成
function generateBgStyle(slide) {
  var bg = STATE.cBg;

  if (slide.bgType === 'gradient') {
    bg = 'linear-gradient(135deg, ' + STATE.cBg + ', ' + STATE.cSub + '33)';
  } else if (slide.bgType === 'geometric') {
    bg = STATE.cBg + ';background-image:repeating-linear-gradient(45deg,' + STATE.cSub + '11 0,' + STATE.cSub + '11 10px,transparent 10px,transparent 20px)';
  } else if (slide.bgType === 'dots') {
    bg = STATE.cBg + ';background-image:radial-gradient(' + STATE.cSub + '22 1px,transparent 1px);background-size:8px 8px';
  } else if (slide.bgType === 'lines') {
    bg = STATE.cBg + ';background-image:repeating-linear-gradient(0deg,' + STATE.cSub + '11 0,' + STATE.cSub + '11 1px,transparent 1px,transparent 8px)';
  } else if (slide.bgType === 'wave') {
    bg = 'linear-gradient(180deg, ' + STATE.cBg + ' 0%, ' + STATE.cSub + '22 100%)';
  }

  return bg;
}

// フレームスタイル生成
function generateFrameStyle(slide) {
  var frameStyle = '';
  if (slide.frameStyle && slide.frameStyle !== 'none') {
    if (slide.frameStyle === 'simple') frameStyle = 'border:2px solid ' + STATE.cMain + ';';
    else if (slide.frameStyle === 'rounded') frameStyle = 'border:2px solid ' + STATE.cMain + ';border-radius:12px;';
    else if (slide.frameStyle === 'double') frameStyle = 'border:4px double ' + STATE.cMain + ';';
    else if (slide.frameStyle === 'japanese') frameStyle = 'border:3px solid ' + STATE.cMain + ';box-shadow:inset 0 0 0 4px ' + STATE.cBg + ', inset 0 0 0 6px ' + STATE.cMain + ';';
    else if (slide.frameStyle === 'ornate') frameStyle = 'border:3px solid ' + STATE.cAccent + ';border-radius:8px;';
    else if (slide.frameStyle === 'shadow') frameStyle = 'box-shadow:4px 4px 12px rgba(0,0,0,0.3);';
    else if (slide.frameStyle === 'neon') frameStyle = 'border:2px solid ' + STATE.cAccent + ';box-shadow:0 0 8px ' + STATE.cAccent + ';';
    else if (slide.frameStyle === 'ribbon') frameStyle = 'border:2px solid ' + STATE.cMain + ';';
    else if (slide.frameStyle === 'cloud') frameStyle = 'border:2px solid ' + STATE.cSub + ';border-radius:20px;';
    else if (slide.frameStyle === 'torn') frameStyle = 'border:1px dashed ' + STATE.cText + '44;';
    else if (slide.frameStyle === 'stamp') frameStyle = 'border:3px dashed ' + STATE.cMain + ';';
  }
  return frameStyle;
}

function renderSlideByType(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels) {
  var html = '';

  // ===== 表紙スライド =====
  if (slide.type === 'title') {
    // タイトル配置のスタイルを計算
    var titleAlign = 'center';
    var titleJustify = 'center';
    var titlePadding = 'padding:0 10%;';
    if (slide.titlePosition === 'left') { titleAlign = 'flex-start'; titlePadding = 'padding:0 8% 0 8%;text-align:left;'; }
    else if (slide.titlePosition === 'right') { titleAlign = 'flex-end'; titlePadding = 'padding:0 8% 0 8%;text-align:right;'; }
    else if (slide.titlePosition === 'top-left') { titleAlign = 'flex-start'; titleJustify = 'flex-start'; titlePadding = 'padding:12% 8%;text-align:left;'; }
    else if (slide.titlePosition === 'top-center') { titleJustify = 'flex-start'; titlePadding = 'padding:12% 10%;'; }
    else if (slide.titlePosition === 'bottom-left') { titleAlign = 'flex-start'; titleJustify = 'flex-end'; titlePadding = 'padding:12% 8%;text-align:left;'; }
    else if (slide.titlePosition === 'bottom-center') { titleJustify = 'flex-end'; titlePadding = 'padding:12% 10%;'; }

    // タイトルサイズ
    var titleSize = '16px';
    if (slide.titleSize === 'small') titleSize = '12px';
    else if (slide.titleSize === 'medium') titleSize = '14px';
    else if (slide.titleSize === 'xlarge') titleSize = '20px';

    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;align-items:' + titleAlign + ';justify-content:' + titleJustify + ';background:' + bgStyle + ';position:relative;' + frameStyle + '">';

    // ビジュアル（背景またはサイド）
    if (slide.coverVisualPos && slide.coverVisualPos !== 'none') {
      var vStyle = 'position:absolute;background:' + STATE.cSub + '33;border:2px dashed ' + STATE.cSub + ';display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:16px;';
      var vSize = slide.coverVisualSize || 'medium';
      var sizePercent = vSize === 'small' ? '20%' : (vSize === 'large' ? '35%' : (vSize === 'full' ? '45%' : '28%'));
      var heightPercent = vSize === 'small' ? '35%' : (vSize === 'large' ? '70%' : (vSize === 'full' ? '80%' : '55%'));

      if (slide.coverVisualPos === 'background') {
        vStyle += 'inset:8%;opacity:0.4;border-radius:8px;';
      } else if (slide.coverVisualPos === 'right') {
        vStyle += 'right:5%;top:50%;transform:translateY(-50%);width:' + sizePercent + ';height:' + heightPercent + ';border-radius:8px;';
      } else if (slide.coverVisualPos === 'left') {
        vStyle += 'left:5%;top:50%;transform:translateY(-50%);width:' + sizePercent + ';height:' + heightPercent + ';border-radius:8px;';
      } else if (slide.coverVisualPos === 'bottom-right') {
        vStyle += 'right:5%;bottom:8%;width:' + sizePercent + ';height:40%;border-radius:8px;';
      } else if (slide.coverVisualPos === 'bottom-left') {
        vStyle += 'left:5%;bottom:8%;width:' + sizePercent + ';height:40%;border-radius:8px;';
      } else if (slide.coverVisualPos === 'top-right') {
        vStyle += 'right:5%;top:8%;width:' + sizePercent + ';height:40%;border-radius:8px;';
      } else if (slide.coverVisualPos === 'top-left') {
        vStyle += 'left:5%;top:8%;width:' + sizePercent + ';height:40%;border-radius:8px;';
      } else if (slide.coverVisualPos === 'scattered') {
        vStyle += 'right:10%;top:15%;width:18%;height:25%;border-radius:8px;';
        html += '<div style="' + vStyle + '">🎨<div style="font-size:7px;color:' + STATE.cText + '88;margin-top:2px;">イラスト</div></div>';
        vStyle = vStyle.replace('right:10%;top:15%', 'left:8%;bottom:20%').replace('width:18%;height:25%', 'width:15%;height:22%');
      }
      html += '<div style="' + vStyle + '">🎨<div style="font-size:7px;color:' + STATE.cText + '88;margin-top:2px;">イラスト</div></div>';
    }

    html += '<div style="z-index:1;' + titlePadding + '">';
    html += '<div style="font-size:' + titleSize + ';font-weight:700;color:' + STATE.cText + ';margin-bottom:6px;border:1px dashed ' + STATE.cMain + '44;padding:4px 8px;border-radius:4px;background:' + STATE.cBg + 'cc;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
    if (slide.subtitle) {
      html += '<div style="font-size:9px;color:' + STATE.cText + '99;padding:2px 4px;">' + escapeHtml(slide.subtitle) + '</div>';
    } else {
      html += '<div style="font-size:8px;color:' + STATE.cText + '55;padding:2px 4px;border:1px dashed ' + STATE.cText + '33;border-radius:2px;">サブタイトル</div>';
    }
    html += '</div>';
    html += '<div style="position:absolute;bottom:6px;left:8px;font-size:7px;color:' + STATE.cText + '55;background:' + STATE.cBg + '99;padding:1px 4px;border-radius:2px;">📘 表紙 / タイトル:' + (slide.titlePosition || 'center') + '</div>';
    html += '</div>';
  }

  // ===== セクション区切り =====
  else if (slide.type === 'section') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;align-items:center;justify-content:center;background:' + bgStyle + ';position:relative;' + frameStyle + '">';
    html += '<div style="width:50px;height:3px;background:' + STATE.cMain + ';margin-bottom:10px;border-radius:2px;"></div>';
    html += '<div style="text-align:center;padding:0 12%;max-width:90%;">';
    var secTitle = slide.title || '【セクションタイトル】';
    var shortSecTitle = secTitle.length > 30 ? secTitle.substring(0, 30) + '...' : secTitle;
    html += '<div style="font-size:12px;font-weight:700;color:' + STATE.cText + ';line-height:1.4;border:1px dashed ' + STATE.cMain + '44;padding:4px 8px;border-radius:4px;">' + escapeHtml(shortSecTitle) + '</div>';
    if (slide.subtitle) {
      html += '<div style="font-size:8px;color:' + STATE.cText + '99;margin-top:6px;">' + escapeHtml(slide.subtitle) + '</div>';
    }
    html += '</div>';
    html += '<div style="width:50px;height:3px;background:' + STATE.cMain + ';margin-top:10px;border-radius:2px;"></div>';
    html += '<div style="position:absolute;bottom:6px;left:8px;font-size:7px;color:' + STATE.cText + '55;background:' + STATE.cBg + '99;padding:1px 4px;border-radius:2px;">📑 セクション</div>';
    html += '</div>';
  }

  // ===== まとめスライド =====
  else if (slide.type === 'summary') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + bgStyle + ';padding:8px;position:relative;' + frameStyle + '">';
    html += '<div style="background:' + STATE.cMain + ';color:#fff;padding:6px 10px;border-radius:4px;font-size:10px;font-weight:600;margin-bottom:6px;">📌 ' + escapeHtml(slide.title || 'まとめ') + '</div>';
    html += '<div style="flex:1;display:flex;flex-direction:column;gap:3px;overflow:hidden;">';
    var pts = slide.points && slide.points.length > 0 ? slide.points : [];
    if (pts.length > 0) {
      for (var i = 0; i < Math.min(pts.length, 5); i++) {
        var shortPt = pts[i].length > 40 ? pts[i].substring(0, 40) + '...' : pts[i];
        html += '<div style="display:flex;align-items:center;gap:4px;font-size:8px;color:' + STATE.cText + ';padding:2px 4px;background:' + STATE.cSub + '11;border-radius:2px;"><span style="color:' + STATE.cAccent + ';">✓</span>' + escapeHtml(shortPt) + '</div>';
      }
    } else {
      html += '<div style="flex:1;border:1px dashed ' + STATE.cText + '33;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;color:' + STATE.cText + '55;">まとめポイント（改行区切りで入力）</div>';
    }
    html += '</div>';
    html += '</div>';
  }

  // ===== 2カラム =====
  else if (slide.type === 'two-column') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + bgStyle + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;border-left:3px solid ' + STATE.cMain + ';padding-left:6px;border:1px dashed ' + STATE.cMain + '33;border-left:3px solid ' + STATE.cMain + ';border-radius:0 4px 4px 0;padding:3px 6px;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
    html += '<div style="flex:1;display:flex;gap:6px;">';
    html += '<div style="flex:1;background:' + STATE.cSub + '15;border:2px dashed ' + STATE.cSub + '44;border-radius:4px;padding:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:7px;color:' + STATE.cText + '88;">📝 左カラム</div><div style="font-size:6px;color:' + STATE.cText + '55;margin-top:2px;">テキスト/画像</div></div>';
    html += '<div style="flex:1;background:' + STATE.cSub + '15;border:2px dashed ' + STATE.cSub + '44;border-radius:4px;padding:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:7px;color:' + STATE.cText + '88;">📝 右カラム</div><div style="font-size:6px;color:' + STATE.cText + '55;margin-top:2px;">テキスト/画像</div></div>';
    html += '</div></div>';
  }

  // ===== 4パネル =====
  else if (slide.type === 'four-panel') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + bgStyle + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;text-align:center;border:1px dashed ' + STATE.cMain + '33;padding:3px 6px;border-radius:4px;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
    html += '<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:4px;">';
    var panelLabels = ['①', '②', '③', '④'];
    for (var i = 0; i < 4; i++) {
      html += '<div style="background:' + STATE.cSub + '15;border:2px dashed ' + STATE.cSub + '44;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:12px;">' + panelLabels[i] + '</div><div style="font-size:6px;color:' + STATE.cText + '77;">パネル</div></div>';
    }
    html += '</div></div>';
  }

  // ===== 画像+テキスト =====
  else if (slide.type === 'image-text') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;background:' + bgStyle + ';padding:8px;gap:8px;' + frameStyle + '">';
    html += '<div style="width:45%;background:' + STATE.cSub + '22;border:2px dashed ' + STATE.cSub + ';border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:20px;">🖼️</div><div style="font-size:7px;color:' + STATE.cText + '77;margin-top:4px;">画像エリア</div></div>';
    html += '<div style="flex:1;display:flex;flex-direction:column;">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:4px;border:1px dashed ' + STATE.cMain + '33;padding:3px 6px;border-radius:4px;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
    html += '<div style="flex:1;border:1px dashed ' + STATE.cText + '33;border-radius:4px;padding:4px;font-size:7px;color:' + STATE.cText + '77;display:flex;align-items:center;justify-content:center;">📝 テキストエリア</div>';
    html += '</div></div>';
  }

  // ===== 図解中心 =====
  else if (slide.type === 'diagram') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + bgStyle + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;text-align:center;border:1px dashed ' + STATE.cMain + '33;padding:3px 6px;border-radius:4px;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
    html += '<div style="flex:1;background:' + STATE.cSub + '15;border:2px dashed ' + STATE.cSub + ';border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
    html += '<div style="font-size:24px;">📊</div>';
    html += '<div style="font-size:7px;color:' + STATE.cText + '77;margin-top:4px;">図解・フローチャート</div>';
    html += '</div></div>';
  }

  // ===== データ・統計 =====
  else if (slide.type === 'data') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + bgStyle + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;border:1px dashed ' + STATE.cMain + '33;padding:3px 6px;border-radius:4px;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
    html += '<div style="flex:1;display:flex;gap:6px;">';
    html += '<div style="flex:1;background:' + STATE.cMain + '22;border:2px dashed ' + STATE.cMain + '44;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:14px;font-weight:700;color:' + STATE.cMain + ';">📈</div><div style="font-size:6px;color:' + STATE.cText + '77;margin-top:2px;">数値/グラフA</div></div>';
    html += '<div style="flex:1;background:' + STATE.cSub + '22;border:2px dashed ' + STATE.cSub + '44;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:14px;font-weight:700;color:' + STATE.cSub + ';">📊</div><div style="font-size:6px;color:' + STATE.cText + '77;margin-top:2px;">数値/グラフB</div></div>';
    html += '</div></div>';
  }

  // ===== タイムライン =====
  else if (slide.type === 'timeline') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + bgStyle + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;border:1px dashed ' + STATE.cMain + '33;padding:3px 6px;border-radius:4px;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
    html += '<div style="flex:1;display:flex;align-items:center;position:relative;">';
    html += '<div style="position:absolute;left:8%;right:8%;height:3px;background:' + STATE.cMain + ';border-radius:2px;"></div>';
    var timeLabels = ['STEP1', 'STEP2', 'STEP3', 'STEP4'];
    for (var i = 0; i < 4; i++) {
      var left = 8 + i * 28;
      html += '<div style="position:absolute;left:' + left + '%;display:flex;flex-direction:column;align-items:center;transform:translateX(-50%);">';
      html += '<div style="width:14px;height:14px;background:' + STATE.cMain + ';border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:7px;color:#fff;">' + (i + 1) + '</div>';
      html += '<div style="font-size:6px;color:' + STATE.cText + '77;margin-top:2px;">' + timeLabels[i] + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
  }

  // ===== 比較・Before/After =====
  else if (slide.type === 'comparison') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + bgStyle + ';padding:8px;' + frameStyle + '">';
    html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;text-align:center;border:1px dashed ' + STATE.cMain + '33;padding:3px 6px;border-radius:4px;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
    html += '<div style="flex:1;display:flex;gap:4px;align-items:stretch;">';
    html += '<div style="flex:1;background:#fee2e2;border:2px dashed #dc262644;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:9px;color:#dc2626;font-weight:600;">Before</div><div style="font-size:6px;color:#dc262699;margin-top:2px;">変更前</div></div>';
    html += '<div style="display:flex;align-items:center;font-size:16px;color:' + STATE.cMain + ';">→</div>';
    html += '<div style="flex:1;background:#dcfce7;border:2px dashed #16a34a44;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:9px;color:#16a34a;font-weight:600;">After</div><div style="font-size:6px;color:#16a34a99;margin-top:2px;">変更後</div></div>';
    html += '</div></div>';
  }

  // ===== 引用・強調 =====
  else if (slide.type === 'quote') {
    html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;align-items:center;justify-content:center;background:' + bgStyle + ';padding:16px;' + frameStyle + '">';
    html += '<div style="font-size:24px;color:' + STATE.cMain + '66;">"</div>';
    html += '<div style="font-size:10px;color:' + STATE.cText + ';text-align:center;font-style:italic;padding:4px 10%;border:1px dashed ' + STATE.cMain + '33;border-radius:4px;max-width:80%;">' + escapeHtml(slide.title || '【引用テキスト】') + '</div>';
    html += '<div style="font-size:24px;color:' + STATE.cMain + '66;">"</div>';
    if (slide.subtitle) {
      html += '<div style="font-size:7px;color:' + STATE.cText + '77;margin-top:4px;">— ' + escapeHtml(slide.subtitle) + '</div>';
    }
    html += '</div>';
  }

  // ===== 箇条書き（デフォルト） =====
  else {
    html = renderBulletSlide(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels);
  }

  return html;
}

function renderBulletSlide(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels) {
  var html = '';
  var hasVisual = slide.visual && slide.visual !== 'none';
  var isLeft = slide.visualPosition === 'left';
  var isRight = slide.visualPosition === 'right';
  var isTop = slide.visualPosition === 'top';
  var isBottom = slide.visualPosition === 'bottom';
  var isBg = slide.visualPosition === 'background';
  var isScattered = slide.visualPosition === 'scattered';

  // 構造テンプレートの適用
  var structure = slide.structure || 'none';

  // テキスト配置
  var textAlign = 'left';
  var textJustify = 'flex-start';
  if (slide.textPosition === 'center') textAlign = 'center';
  else if (slide.textPosition === 'right') textAlign = 'right';
  else if (slide.textPosition === 'top') textJustify = 'flex-start';
  else if (slide.textPosition === 'bottom') textJustify = 'flex-end';

  // 本文スタイル
  var textStyleClass = '';
  if (slide.textStyle === 'speech') textStyleClass = 'border-radius:12px;background:' + STATE.cBg + ';border:2px solid ' + STATE.cSub + ';position:relative;';
  else if (slide.textStyle === 'thought') textStyleClass = 'border-radius:20px;background:' + STATE.cBg + ';border:2px dotted ' + STATE.cSub + ';';
  else if (slide.textStyle === 'banner') textStyleClass = 'background:' + STATE.cMain + '22;border-left:4px solid ' + STATE.cMain + ';';
  else if (slide.textStyle === 'box') textStyleClass = 'border:2px solid ' + STATE.cMain + ';border-radius:4px;';
  else if (slide.textStyle === 'handwritten') textStyleClass = 'font-style:italic;border-bottom:2px wavy ' + STATE.cText + '44;';
  else if (slide.textStyle === 'chalk') textStyleClass = 'background:' + STATE.cText + '11;border-radius:2px;';

  var flexDir = hasVisual && (isLeft || isRight) ? 'row' : 'column';

  // 構造テンプレートによるレイアウト変更
  if (structure === 'three-panel') {
    return renderThreePanelLayout(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels);
  } else if (structure === 'four-grid') {
    return renderFourGridLayout(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels);
  } else if (structure === 'sidebar') {
    return renderSidebarLayout(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels);
  } else if (structure === 'header-body') {
    return renderHeaderBodyLayout(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels);
  }

  html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:' + flexDir + ';background:' + bgStyle + ';padding:10px;position:relative;gap:6px;' + frameStyle + '">';

  // 背景ビジュアル
  if (hasVisual && isBg) {
    html += '<div style="position:absolute;inset:8px;background:' + STATE.cSub + '22;border:2px dashed ' + STATE.cSub + '44;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0.4;">';
    html += '<div style="font-size:28px;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
    html += '<div style="font-size:6px;color:' + STATE.cText + '88;">背景ビジュアル</div>';
    html += '</div>';
  }

  // 散りばめビジュアル
  if (hasVisual && isScattered) {
    html += '<div style="position:absolute;right:8%;top:10%;width:18%;height:22%;background:' + STATE.cSub + '22;border:2px dashed ' + STATE.cSub + '44;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
    html += '<div style="font-size:14px;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
    html += '</div>';
    html += '<div style="position:absolute;left:5%;bottom:12%;width:15%;height:18%;background:' + STATE.cSub + '22;border:2px dashed ' + STATE.cSub + '44;border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
    html += '<div style="font-size:12px;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
    html += '</div>';
  }

  // 左ビジュアル
  if (hasVisual && isLeft) {
    html += '<div style="width:30%;min-height:60px;background:' + STATE.cSub + '22;border:2px dashed ' + STATE.cSub + ';border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;">';
    html += '<div style="font-size:18px;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
    html += '<div style="font-size:6px;color:' + STATE.cText + '77;margin-top:2px;">' + (visualInfo ? visualInfo.name.replace(/^[^\s]+\s/, '') : 'ビジュアル') + '</div>';
    html += '</div>';
  }

  // 上ビジュアル
  if (hasVisual && isTop) {
    html += '<div style="width:100%;height:28%;min-height:30px;background:' + STATE.cSub + '22;border:2px dashed ' + STATE.cSub + ';border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;">';
    html += '<div style="font-size:16px;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
    html += '<div style="font-size:6px;color:' + STATE.cText + '77;">' + (visualInfo ? visualInfo.name.replace(/^[^\s]+\s/, '') : 'ビジュアル') + '</div>';
    html += '</div>';
  }

  // メインコンテンツ
  html += '<div style="flex:1;display:flex;flex-direction:column;justify-content:' + textJustify + ';overflow:hidden;z-index:1;min-width:0;">';

  // タイトル
  if (slide.title) {
    var shortTitle = slide.title.length > 40 ? slide.title.substring(0, 40) + '...' : slide.title;
    html += '<div style="font-size:11px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;padding:4px 8px;background:' + STATE.cMain + '15;border-left:3px solid ' + STATE.cMain + ';border-radius:0 4px 4px 0;border:1px dashed ' + STATE.cMain + '33;border-left:3px solid ' + STATE.cMain + ';text-align:' + textAlign + ';">' + escapeHtml(shortTitle) + '</div>';
  } else {
    html += '<div style="font-size:9px;color:' + STATE.cText + '55;margin-bottom:6px;padding:4px 8px;border:1px dashed ' + STATE.cMain + '44;border-radius:4px;text-align:' + textAlign + ';">【タイトル】</div>';
  }

  // ポイント
  html += '<div style="flex:1;display:flex;flex-direction:column;gap:2px;overflow:hidden;' + textStyleClass + 'padding:4px;">';
  var pts = slide.points && slide.points.length > 0 ? slide.points : [];
  var noteLines = slide.notes ? slide.notes.split('\n').filter(function(l){ return l.trim(); }) : [];
  var displayItems = pts.length > 0 ? pts : noteLines;

  if (displayItems.length > 0) {
    var maxItems = Math.min(displayItems.length, 4);
    for (var i = 0; i < maxItems; i++) {
      var shortText = displayItems[i].length > 45 ? displayItems[i].substring(0, 45) + '...' : displayItems[i];
      html += '<div style="font-size:8px;color:' + STATE.cText + ';padding:3px 6px;background:' + STATE.cSub + '11;border-radius:3px;text-align:' + textAlign + ';">• ' + escapeHtml(shortText) + '</div>';
    }
    if (displayItems.length > 4) {
      html += '<div style="font-size:7px;color:' + STATE.cText + '77;padding:2px 6px;text-align:' + textAlign + ';">... 他 ' + (displayItems.length - 4) + ' 件</div>';
    }
  } else {
    html += '<div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:8px;color:' + STATE.cText + '55;border:1px dashed ' + STATE.cText + '33;border-radius:4px;">📝 ポイント（改行区切りで入力）</div>';
  }
  html += '</div></div>';

  // 右ビジュアル
  if (hasVisual && isRight) {
    html += '<div style="width:30%;min-height:60px;background:' + STATE.cSub + '22;border:2px dashed ' + STATE.cSub + ';border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;">';
    html += '<div style="font-size:18px;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
    html += '<div style="font-size:6px;color:' + STATE.cText + '77;margin-top:2px;">' + (visualInfo ? visualInfo.name.replace(/^[^\s]+\s/, '') : 'ビジュアル') + '</div>';
    html += '</div>';
  }

  // 下ビジュアル
  if (hasVisual && isBottom) {
    html += '<div style="width:100%;height:28%;min-height:30px;background:' + STATE.cSub + '22;border:2px dashed ' + STATE.cSub + ';border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;">';
    html += '<div style="font-size:16px;">' + (visualInfo ? visualInfo.name.split(' ')[0] : '🎨') + '</div>';
    html += '<div style="font-size:6px;color:' + STATE.cText + '77;">' + (visualInfo ? visualInfo.name.replace(/^[^\s]+\s/, '') : 'ビジュアル') + '</div>';
    html += '</div>';
  }

  html += '</div>';

  if (hasVisual && visualInfo) labels.push(visualInfo.name.split(' ')[0]);

  return html;
}

// 3パネルレイアウト
function renderThreePanelLayout(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels) {
  var html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + bgStyle + ';padding:8px;' + frameStyle + '">';
  html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;border:1px dashed ' + STATE.cMain + '33;padding:3px 6px;border-radius:4px;text-align:center;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
  html += '<div style="flex:1;display:flex;gap:4px;">';
  for (var i = 0; i < 3; i++) {
    html += '<div style="flex:1;background:' + STATE.cSub + '15;border:2px dashed ' + STATE.cSub + '44;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
    html += '<div style="font-size:10px;">📋</div>';
    html += '<div style="font-size:6px;color:' + STATE.cText + '77;">パネル' + (i + 1) + '</div>';
    html += '</div>';
  }
  html += '</div></div>';
  labels.push('3パネル');
  return html;
}

// 4グリッドレイアウト
function renderFourGridLayout(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels) {
  var html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + bgStyle + ';padding:8px;' + frameStyle + '">';
  html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;border:1px dashed ' + STATE.cMain + '33;padding:3px 6px;border-radius:4px;text-align:center;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
  html += '<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:4px;">';
  for (var i = 0; i < 4; i++) {
    html += '<div style="background:' + STATE.cSub + '15;border:2px dashed ' + STATE.cSub + '44;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
    html += '<div style="font-size:10px;">📦</div>';
    html += '<div style="font-size:6px;color:' + STATE.cText + '77;">グリッド' + (i + 1) + '</div>';
    html += '</div>';
  }
  html += '</div></div>';
  labels.push('4グリッド');
  return html;
}

// サイドバーレイアウト
function renderSidebarLayout(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels) {
  var html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;background:' + bgStyle + ';padding:8px;gap:6px;' + frameStyle + '">';
  html += '<div style="flex:1;display:flex;flex-direction:column;">';
  html += '<div style="font-size:10px;font-weight:600;color:' + STATE.cText + ';margin-bottom:6px;border:1px dashed ' + STATE.cMain + '33;padding:3px 6px;border-radius:4px;">' + escapeHtml(slide.title || '【タイトル】') + '</div>';
  html += '<div style="flex:1;border:1px dashed ' + STATE.cText + '33;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;color:' + STATE.cText + '55;">📝 メインコンテンツ</div>';
  html += '</div>';
  html += '<div style="width:25%;background:' + STATE.cSub + '15;border:2px dashed ' + STATE.cSub + '44;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
  html += '<div style="font-size:10px;">📌</div>';
  html += '<div style="font-size:6px;color:' + STATE.cText + '77;">サイドバー</div>';
  html += '</div>';
  html += '</div>';
  labels.push('サイドバー');
  return html;
}

// ヘッダー+本文レイアウト
function renderHeaderBodyLayout(slide, baseStyle, frameStyle, bgStyle, visualInfo, labels) {
  var html = '<div class="preview-slide" style="' + baseStyle + 'display:flex;flex-direction:column;background:' + bgStyle + ';padding:8px;' + frameStyle + '">';
  html += '<div style="background:' + STATE.cMain + '22;border:2px dashed ' + STATE.cMain + '44;border-radius:4px;padding:8px;margin-bottom:6px;display:flex;align-items:center;justify-content:center;">';
  html += '<div style="font-size:11px;font-weight:600;color:' + STATE.cText + ';">' + escapeHtml(slide.title || '【ヘッダータイトル】') + '</div>';
  html += '</div>';
  html += '<div style="flex:1;border:1px dashed ' + STATE.cText + '33;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px;color:' + STATE.cText + '55;">';
  html += '📝 本文コンテンツエリア';
  html += '</div>';
  html += '</div>';
  labels.push('ヘッダー型');
  return html;
}

function update() {
  updateColors();
  renderSlideNav();
  renderSlideEditor();
  renderPreview();
  renderPrompt();
}
