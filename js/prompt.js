// ============================================
// プロンプト生成
// ============================================
function renderPrompt() {
  if (STATE.slides.length === 0 || STATE.currentSlide >= STATE.slides.length) {
    $('prompt').textContent = 'スライドを作成するとプロンプトが生成されます';
    $('prompt-slide-info').textContent = '';
    return;
  }

  var slide = STATE.slides[STATE.currentSlide];
  $('prompt-slide-info').textContent = '(' + (STATE.currentSlide + 1) + '/' + STATE.slides.length + '枚目)';

  var lines = [];

  // サイズ計算
  var width = parseInt(STATE.outputSize);
  var height = width;
  if (STATE.slideSize === '16:9') height = Math.round(width * 9 / 16);
  else if (STATE.slideSize === '4:3') height = Math.round(width * 3 / 4);
  else if (STATE.slideSize === '9:16') height = Math.round(width * 16 / 9);

  lines.push('Image Dimensions: ' + width + '×' + height + ' pixels');
  lines.push('');

  // 参照画像
  if (STATE.refChar || STATE.refBg || STATE.refIllust) {
    lines.push('=== REFERENCE IMAGES ===');
    if (STATE.refChar) lines.push('[Reference: character image - use as-is]');
    if (STATE.refBg) lines.push('[Reference: background image - use as-is]');
    if (STATE.refIllust) lines.push('[Reference: illustration - use as-is]');
    lines.push('');
  }

  // スライド情報
  var typeInfo = CONFIG.SLIDE_TYPES.find(function(t) { return t.id === slide.type; });
  var layoutInfo = CONFIG.LAYOUT_STYLES.find(function(l) { return l.id === slide.layout; });
  var decoInfo = CONFIG.DECORATIONS.find(function(d) { return d.id === slide.decoration; });
  var isCover = (slide.type === 'title' || slide.type === 'section');

  lines.push('=== SLIDE ===');
  lines.push('Type: ' + (typeInfo ? typeInfo.prompt : slide.type));
  if (layoutInfo && layoutInfo.prompt) {
    lines.push('Layout Style: ' + layoutInfo.prompt);
  }

  // アートスタイル・構造・フレーム
  if (slide.artStyle && slide.artStyle !== 'none') {
    var artInfo = CONFIG.ART_STYLES.find(function(x) { return x.id === slide.artStyle; });
    if (artInfo && artInfo.prompt) lines.push('Art Style: ' + artInfo.prompt);
  }
  if (slide.structure && slide.structure !== 'none') {
    var structInfo = CONFIG.STRUCTURE_TEMPLATES.find(function(x) { return x.id === slide.structure; });
    if (structInfo && structInfo.prompt) lines.push('Structure: ' + structInfo.prompt);
  }
  if (slide.frameStyle && slide.frameStyle !== 'none') {
    var frameInfo = CONFIG.FRAME_STYLES.find(function(x) { return x.id === slide.frameStyle; });
    if (frameInfo && frameInfo.prompt) lines.push('Frame: ' + frameInfo.prompt);
  }

  // 本文配置・スタイル
  if (slide.textPosition && slide.textPosition !== 'center') {
    var textPosInfo = CONFIG.TEXT_POSITIONS.find(function(x) { return x.id === slide.textPosition; });
    if (textPosInfo) lines.push('Text Position: ' + textPosInfo.name);
  }
  if (slide.textStyle && slide.textStyle !== 'none') {
    var textStyleInfo = CONFIG.TEXT_STYLES.find(function(x) { return x.id === slide.textStyle; });
    if (textStyleInfo && textStyleInfo.prompt) lines.push('Text Style: ' + textStyleInfo.prompt);
  }

  // 表紙専用設定
  if (isCover) {
    var titlePosInfo = CONFIG.TITLE_POSITIONS.find(function(x) { return x.id === slide.titlePosition; });
    var titleSizeInfo = CONFIG.TITLE_SIZES.find(function(x) { return x.id === slide.titleSize; });
    lines.push('Title Position: ' + (titlePosInfo ? titlePosInfo.name : slide.titlePosition));
    lines.push('Title Size: ' + (titleSizeInfo ? titleSizeInfo.name : slide.titleSize));

    if (slide.coverVisualPos && slide.coverVisualPos !== 'none') {
      var coverPosInfo = CONFIG.COVER_VISUAL_POSITIONS.find(function(x) { return x.id === slide.coverVisualPos; });
      var coverSizeInfo = CONFIG.COVER_VISUAL_SIZES.find(function(x) { return x.id === slide.coverVisualSize; });
      lines.push('Cover Illustration: position ' + (coverPosInfo ? coverPosInfo.name : slide.coverVisualPos) + ', size ' + (coverSizeInfo ? coverSizeInfo.name : slide.coverVisualSize));
    }
  }

  // ビジュアル要素（通常スライド）
  if (!isCover && slide.visual && slide.visual !== 'none') {
    var visualInfo = CONFIG.VISUAL_TYPES.find(function(v) { return v.id === slide.visual; });
    var posInfo = CONFIG.VISUAL_POSITIONS.find(function(p) { return p.id === slide.visualPosition; });
    if (visualInfo && visualInfo.prompt) {
      lines.push('Visual: ' + visualInfo.prompt + ' (position: ' + (posInfo ? posInfo.name : slide.visualPosition) + ')');
    }
  }

  // キャラクター設定
  if (slide.coverVisualPos !== 'none' || slide.visual === 'character') {
    var charParts = [];
    if (slide.charGender && slide.charGender !== 'none') {
      var g = CONFIG.CHAR_GENDERS.find(function(x) { return x.id === slide.charGender; });
      if (g) charParts.push(g.name.replace(/^[^\s]+\s/, ''));
    }
    if (slide.charAge && slide.charAge !== 'none') {
      var a = CONFIG.CHAR_AGES.find(function(x) { return x.id === slide.charAge; });
      if (a) charParts.push(a.name.replace(/^[^\s]+\s/, ''));
    }
    if (slide.charOutfit && slide.charOutfit !== 'none') {
      var o = CONFIG.CHAR_OUTFITS.find(function(x) { return x.id === slide.charOutfit; });
      if (o) charParts.push(o.name.replace(/^[^\s]+\s/, ''));
    }
    if (slide.charExpression && slide.charExpression !== 'none') {
      var e = CONFIG.CHAR_EXPRESSIONS.find(function(x) { return x.id === slide.charExpression; });
      if (e) charParts.push(e.name.replace(/^[^\s]+\s/, '') + '表情');
    }
    if (slide.charPose && slide.charPose !== 'none') {
      var p = CONFIG.CHAR_POSES.find(function(x) { return x.id === slide.charPose; });
      if (p) charParts.push(p.name.replace(/^[^\s]+\s/, '') + 'ポーズ');
    }
    if (charParts.length > 0) {
      lines.push('Character: ' + charParts.join(', '));
    }
  }

  // 背景設定
  var bgParts = [];
  if (slide.bgType && slide.bgType !== 'none') {
    var bt = CONFIG.BG_TYPES.find(function(x) { return x.id === slide.bgType; });
    if (bt) bgParts.push(bt.name.replace(/^[^\s]+\s/, ''));
  }
  if (slide.bgMood && slide.bgMood !== 'none') {
    var bm = CONFIG.BG_MOODS.find(function(x) { return x.id === slide.bgMood; });
    if (bm) bgParts.push(bm.name.replace(/^[^\s]+\s/, '') + 'な雰囲気');
  }
  if (bgParts.length > 0) {
    lines.push('Background: ' + bgParts.join(', '));
  }

  // 装飾
  if (decoInfo && slide.decoration !== 'none') {
    lines.push('Decoration: ' + decoInfo.name);
  }
  lines.push('');

  // コンテンツ
  lines.push('=== CONTENT ===');
  if (slide.title) lines.push('Title: ' + slide.title);
  if (slide.subtitle) lines.push('Subtitle: ' + slide.subtitle);
  if (slide.points.length > 0) {
    lines.push('Points:');
    for (var i = 0; i < slide.points.length; i++) {
      lines.push('- ' + slide.points[i]);
    }
  }
  if (slide.notes) {
    lines.push('Notes: ' + slide.notes);
  }
  lines.push('');

  // スタイル
  lines.push('=== STYLE ===');
  lines.push('Color Palette:');
  lines.push('  Main: ' + STATE.cMain);
  lines.push('  Sub: ' + STATE.cSub);
  lines.push('  Accent: ' + STATE.cAccent);
  lines.push('  Background: ' + STATE.cBg);
  lines.push('  Text: ' + STATE.cText);
  lines.push('');
  lines.push('Output size: ' + width + '×' + height + ' pixels');

  $('prompt').textContent = lines.join('\n');
}

// ============================================
// MD出力
// ============================================
function generateAllSlidesMarkdown() {
  if (STATE.slides.length === 0) return '';

  var lines = [];
  lines.push('# スライド資料プロンプト集');
  lines.push('');
  lines.push('生成日時: ' + new Date().toLocaleString('ja-JP'));
  lines.push('スライド数: ' + STATE.slides.length);
  lines.push('サイズ: ' + STATE.slideSize);
  lines.push('');
  lines.push('---');
  lines.push('');

  // 共通設定
  lines.push('## 共通設定');
  lines.push('');
  lines.push('```');
  var width = parseInt(STATE.outputSize);
  var height = width;
  if (STATE.slideSize === '16:9') height = Math.round(width * 9 / 16);
  else if (STATE.slideSize === '4:3') height = Math.round(width * 3 / 4);
  else if (STATE.slideSize === '9:16') height = Math.round(width * 16 / 9);
  lines.push('Image Dimensions: ' + width + '×' + height + ' pixels');
  lines.push('Color Palette:');
  lines.push('  Main: ' + STATE.cMain);
  lines.push('  Sub: ' + STATE.cSub);
  lines.push('  Accent: ' + STATE.cAccent);
  lines.push('  Background: ' + STATE.cBg);
  lines.push('  Text: ' + STATE.cText);
  if (STATE.refChar || STATE.refBg || STATE.refIllust) {
    lines.push('Reference Images:');
    if (STATE.refChar) lines.push('  - Character image');
    if (STATE.refBg) lines.push('  - Background image');
    if (STATE.refIllust) lines.push('  - Illustration');
  }
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');

  // 各スライド
  for (var i = 0; i < STATE.slides.length; i++) {
    var slide = STATE.slides[i];
    lines.push('## ' + (i + 1) + '枚目');
    lines.push('');
    lines.push('```');
    lines.push('Image Dimensions: ' + width + '×' + height + ' pixels');
    lines.push('');
    if (STATE.refChar || STATE.refBg || STATE.refIllust) {
      lines.push('=== REFERENCE IMAGES ===');
      if (STATE.refChar) lines.push('[Reference: character image - use as-is]');
      if (STATE.refBg) lines.push('[Reference: background image - use as-is]');
      if (STATE.refIllust) lines.push('[Reference: illustration - use as-is]');
      lines.push('');
    }

    var typeInfo = CONFIG.SLIDE_TYPES.find(function(t) { return t.id === slide.type; });
    var layoutInfo = CONFIG.LAYOUT_STYLES.find(function(l) { return l.id === slide.layout; });
    var decoInfo = CONFIG.DECORATIONS.find(function(d) { return d.id === slide.decoration; });
    var isCover = (slide.type === 'title' || slide.type === 'section');

    lines.push('=== SLIDE ===');
    lines.push('Type: ' + (typeInfo ? typeInfo.prompt : slide.type));
    if (layoutInfo && layoutInfo.prompt) {
      lines.push('Layout Style: ' + layoutInfo.prompt);
    }

    // アートスタイル・構造・フレーム
    if (slide.artStyle && slide.artStyle !== 'none') {
      var artInfo = CONFIG.ART_STYLES.find(function(x) { return x.id === slide.artStyle; });
      if (artInfo && artInfo.prompt) lines.push('Art Style: ' + artInfo.prompt);
    }
    if (slide.structure && slide.structure !== 'none') {
      var structInfo = CONFIG.STRUCTURE_TEMPLATES.find(function(x) { return x.id === slide.structure; });
      if (structInfo && structInfo.prompt) lines.push('Structure: ' + structInfo.prompt);
    }
    if (slide.frameStyle && slide.frameStyle !== 'none') {
      var frameInfo = CONFIG.FRAME_STYLES.find(function(x) { return x.id === slide.frameStyle; });
      if (frameInfo && frameInfo.prompt) lines.push('Frame: ' + frameInfo.prompt);
    }

    // 本文配置・スタイル
    if (slide.textPosition && slide.textPosition !== 'center') {
      var textPosInfo = CONFIG.TEXT_POSITIONS.find(function(x) { return x.id === slide.textPosition; });
      if (textPosInfo) lines.push('Text Position: ' + textPosInfo.name);
    }
    if (slide.textStyle && slide.textStyle !== 'none') {
      var textStyleInfo = CONFIG.TEXT_STYLES.find(function(x) { return x.id === slide.textStyle; });
      if (textStyleInfo && textStyleInfo.prompt) lines.push('Text Style: ' + textStyleInfo.prompt);
    }

    // 表紙専用設定
    if (isCover) {
      var titlePosInfo = CONFIG.TITLE_POSITIONS.find(function(x) { return x.id === slide.titlePosition; });
      var titleSizeInfo = CONFIG.TITLE_SIZES.find(function(x) { return x.id === slide.titleSize; });
      lines.push('Title Position: ' + (titlePosInfo ? titlePosInfo.name : slide.titlePosition));
      lines.push('Title Size: ' + (titleSizeInfo ? titleSizeInfo.name : slide.titleSize));

      if (slide.coverVisualPos && slide.coverVisualPos !== 'none') {
        var coverPosInfo = CONFIG.COVER_VISUAL_POSITIONS.find(function(x) { return x.id === slide.coverVisualPos; });
        var coverSizeInfo = CONFIG.COVER_VISUAL_SIZES.find(function(x) { return x.id === slide.coverVisualSize; });
        lines.push('Cover Illustration: position ' + (coverPosInfo ? coverPosInfo.name : slide.coverVisualPos) + ', size ' + (coverSizeInfo ? coverSizeInfo.name : slide.coverVisualSize));
      }
    }

    // ビジュアル要素（通常スライド）
    if (!isCover && slide.visual && slide.visual !== 'none') {
      var visualInfo = CONFIG.VISUAL_TYPES.find(function(v) { return v.id === slide.visual; });
      var posInfo = CONFIG.VISUAL_POSITIONS.find(function(p) { return p.id === slide.visualPosition; });
      if (visualInfo && visualInfo.prompt) {
        lines.push('Visual: ' + visualInfo.prompt + ' (position: ' + (posInfo ? posInfo.name : slide.visualPosition) + ')');
      }
    }

    // キャラクター設定
    if (slide.coverVisualPos !== 'none' || slide.visual === 'character') {
      var charParts = [];
      if (slide.charGender && slide.charGender !== 'none') {
        var g = CONFIG.CHAR_GENDERS.find(function(x) { return x.id === slide.charGender; });
        if (g) charParts.push(g.name.replace(/^[^\s]+\s/, ''));
      }
      if (slide.charAge && slide.charAge !== 'none') {
        var a = CONFIG.CHAR_AGES.find(function(x) { return x.id === slide.charAge; });
        if (a) charParts.push(a.name.replace(/^[^\s]+\s/, ''));
      }
      if (slide.charOutfit && slide.charOutfit !== 'none') {
        var o = CONFIG.CHAR_OUTFITS.find(function(x) { return x.id === slide.charOutfit; });
        if (o) charParts.push(o.name.replace(/^[^\s]+\s/, ''));
      }
      if (slide.charExpression && slide.charExpression !== 'none') {
        var e = CONFIG.CHAR_EXPRESSIONS.find(function(x) { return x.id === slide.charExpression; });
        if (e) charParts.push(e.name.replace(/^[^\s]+\s/, '') + '表情');
      }
      if (slide.charPose && slide.charPose !== 'none') {
        var p = CONFIG.CHAR_POSES.find(function(x) { return x.id === slide.charPose; });
        if (p) charParts.push(p.name.replace(/^[^\s]+\s/, '') + 'ポーズ');
      }
      if (charParts.length > 0) {
        lines.push('Character: ' + charParts.join(', '));
      }
    }

    // 背景設定
    var bgParts = [];
    if (slide.bgType && slide.bgType !== 'none') {
      var bt = CONFIG.BG_TYPES.find(function(x) { return x.id === slide.bgType; });
      if (bt) bgParts.push(bt.name.replace(/^[^\s]+\s/, ''));
    }
    if (slide.bgMood && slide.bgMood !== 'none') {
      var bm = CONFIG.BG_MOODS.find(function(x) { return x.id === slide.bgMood; });
      if (bm) bgParts.push(bm.name.replace(/^[^\s]+\s/, '') + 'な雰囲気');
    }
    if (bgParts.length > 0) {
      lines.push('Background: ' + bgParts.join(', '));
    }

    // 装飾
    if (decoInfo && slide.decoration !== 'none') {
      lines.push('Decoration: ' + decoInfo.name);
    }
    lines.push('');
    lines.push('=== CONTENT ===');
    if (slide.title) lines.push('Title: ' + slide.title);
    if (slide.subtitle) lines.push('Subtitle: ' + slide.subtitle);
    if (slide.points.length > 0) {
      lines.push('Points:');
      for (var j = 0; j < slide.points.length; j++) {
        lines.push('- ' + slide.points[j]);
      }
    }
    if (slide.notes) lines.push('Notes: ' + slide.notes);
    lines.push('');
    lines.push('=== STYLE ===');
    lines.push('Color Palette: Main ' + STATE.cMain + ', Sub ' + STATE.cSub + ', Accent ' + STATE.cAccent + ', BG ' + STATE.cBg + ', Text ' + STATE.cText);
    lines.push('Output size: ' + width + '×' + height + ' pixels');
    lines.push('```');
    lines.push('');
    if (i < STATE.slides.length - 1) {
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

function downloadMarkdown() {
  var content = generateAllSlidesMarkdown();
  if (!content) {
    alert('スライドがありません');
    return;
  }

  var blob = new Blob([content], { type: 'text/markdown' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'slides_prompt_' + new Date().toISOString().slice(0, 10) + '.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
