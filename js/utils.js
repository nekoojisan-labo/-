// ============================================
// ユーティリティ
// ============================================
function $(id) { return document.getElementById(id); }

function createOption(items, placeholder) {
  var html = '<option value="">' + placeholder + '</option>';
  for (var i = 0; i < items.length; i++) {
    html += '<option value="' + items[i].id + '">' + items[i].name + '</option>';
  }
  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 文字数から推奨スライド数を計算
function suggestSlideCount(text) {
  var chars = text.length;
  if (chars < 500) return 3;
  if (chars < 1000) return 5;
  if (chars < 2000) return 8;
  if (chars < 4000) return 12;
  if (chars < 8000) return 18;
  return Math.min(30, Math.ceil(chars / 400));
}

// スライドのデフォルト構造を作成
function createSlide(overrides) {
  var defaults = {
    type: 'bullet',
    title: '',
    subtitle: '',
    points: [],
    notes: '',
    visual: 'none',
    visualPosition: 'right',
    layout: 'simple',
    decoration: 'none',
    charGender: 'none',
    charAge: 'none',
    charOutfit: 'none',
    charExpression: 'none',
    charPose: 'none',
    bgType: 'none',
    bgMood: 'none',
    // 表紙専用
    titlePosition: 'center',
    titleSize: 'large',
    coverVisualPos: 'none',
    coverVisualSize: 'medium',
    // 新規追加：スタイル・構造
    artStyle: 'none',
    structure: 'none',
    frameStyle: 'none',
    textPosition: 'center',
    textStyle: 'none'
  };
  if (overrides) {
    for (var key in overrides) {
      defaults[key] = overrides[key];
    }
  }
  return defaults;
}

// テキストをスライドに分割
function splitContentToSlides(content, count) {
  var lines = content.split('\n');
  var slides = [];

  // 区切り線パターン（───、===、---）
  var dividerPattern = /^[─=\-]{5,}$/;
  // 章タイトルパターン（第X章、Chapter X、■、★など）
  var chapterPattern = /^(第\d+章|Chapter\s*\d+|■|★|【|◆|●|▼|▶)/;
  // マークダウン見出し
  var mdHeadingPattern = /^#{1,3}\s/;

  // セクションを抽出
  var sections = [];
  var currentSection = { title: '', content: [], isChapter: false };
  var pendingTitle = '';

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var trimmed = line.trim();

    // 空行はスキップ（ただしコンテンツの区切りとして認識）
    if (!trimmed) continue;

    // 区切り線の場合
    if (dividerPattern.test(trimmed)) {
      // 次の行がタイトルの可能性
      if (i + 1 < lines.length && lines[i + 1].trim()) {
        pendingTitle = lines[i + 1].trim();
      }
      continue;
    }

    // 章タイトルまたはマークダウン見出し
    var isNewSection = chapterPattern.test(trimmed) || mdHeadingPattern.test(trimmed);

    // pending titleがある場合、現在の行がそれに一致したらセクション開始
    if (pendingTitle && trimmed === pendingTitle) {
      isNewSection = true;
      pendingTitle = '';
    }

    if (isNewSection) {
      // 前のセクションを保存
      if (currentSection.title || currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: trimmed.replace(/^#{1,3}\s*/, ''),
        content: [],
        isChapter: chapterPattern.test(trimmed)
      };
    } else {
      currentSection.content.push(trimmed);
    }
  }

  // 最後のセクションを追加
  if (currentSection.title || currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  // デバッグ用：セクション数を確認
  console.log('Sections found:', sections.length);

  // 表紙スライドを作成
  slides.push(createSlide({ type: 'title' }));

  // 最初のセクションから表紙情報を取得
  if (sections.length > 0) {
    var firstSection = sections[0];
    if (firstSection.title) {
      slides[0].title = firstSection.title;
      if (firstSection.content.length > 0) {
        slides[0].subtitle = firstSection.content[0];
      }
    } else if (firstSection.content.length > 0) {
      slides[0].title = firstSection.content[0];
      if (firstSection.content.length > 1) {
        slides[0].subtitle = firstSection.content[1];
      }
    }
  }

  // 残りのスライド数と処理するセクション
  var remainingSlides = count - 1;
  var sectionsToProcess = sections.length > 1 ? sections.slice(1) :
    (sections.length === 1 && sections[0].content.length > 2 ? [{ title: '', content: sections[0].content.slice(2) }] : []);

  if (sectionsToProcess.length === 0) {
    // セクションがない場合、全内容を均等分割
    var allLines = [];
    for (var i = 0; i < sections.length; i++) {
      allLines = allLines.concat(sections[i].content);
    }
    var linesPerSlide = Math.ceil(allLines.length / remainingSlides);

    for (var i = 0; i < remainingSlides && allLines.length > 0; i++) {
      var chunk = allLines.splice(0, linesPerSlide);
      slides.push(createSlide({
        type: 'bullet',
        points: chunk.slice(0, 6),
        notes: chunk.slice(6).join('\n')
      }));
    }
  } else {
    // 各セクションの内容量を計算
    var totalContent = 0;
    for (var i = 0; i < sectionsToProcess.length; i++) {
      totalContent += sectionsToProcess[i].content.length + (sectionsToProcess[i].isChapter ? 1 : 0);
    }

    // スライドをセクションに配分
    for (var s = 0; s < sectionsToProcess.length && slides.length < count; s++) {
      var sec = sectionsToProcess[s];
      var secWeight = (sec.content.length + (sec.isChapter ? 1 : 0)) / Math.max(1, totalContent);
      var slidesForSection = Math.max(1, Math.round(remainingSlides * secWeight));

      // 章タイトルスライド
      if (sec.isChapter && sec.title) {
        slides.push(createSlide({
          type: 'section',
          title: sec.title
        }));
        slidesForSection--;
      }

      // コンテンツを分割
      if (sec.content.length > 0 && slidesForSection > 0) {
        var linesPerSlide = Math.ceil(sec.content.length / slidesForSection);
        var contentCopy = sec.content.slice();

        while (contentCopy.length > 0 && slides.length < count) {
          var chunk = contentCopy.splice(0, linesPerSlide);

          // タイトルを抽出（最初の短い行か、セクションタイトル）
          var slideTitle = sec.title || '';
          if (chunk.length > 0 && chunk[0].length < 50 && !chunk[0].match(/^[・\-\*]/)) {
            slideTitle = chunk.shift();
          }

          slides.push(createSlide({
            type: 'bullet',
            title: slideTitle,
            points: chunk.slice(0, 6),
            notes: chunk.slice(6).join('\n')
          }));
        }
      }
    }
  }

  // まとめスライド
  if (slides.length < count) {
    slides.push(createSlide({
      type: 'summary',
      title: 'まとめ'
    }));
  }

  // 足りない分を埋める
  while (slides.length < count) {
    slides.push(createSlide());
  }

  return slides.slice(0, count);
}

function updateStats() {
  var content = STATE.sourceContent;
  var chars = content.length;
  var lines = content.split('\n').filter(function(l) { return l.trim(); }).length;
  var suggested = suggestSlideCount(content);

  $('char-count').textContent = chars;
  $('line-count').textContent = lines;
  $('suggested-slides').textContent = suggested;
}

function updateColors() {
  $('c-main-v').textContent = STATE.cMain;
  $('c-sub-v').textContent = STATE.cSub;
  $('c-accent-v').textContent = STATE.cAccent;
  $('c-bg-v').textContent = STATE.cBg;
  $('c-text-v').textContent = STATE.cText;

  $('c-main').value = STATE.cMain;
  $('c-sub').value = STATE.cSub;
  $('c-accent').value = STATE.cAccent;
  $('c-bg').value = STATE.cBg;
  $('c-text').value = STATE.cText;
}

function showNotice(msg) {
  var notice = $('reset-notice');
  notice.textContent = '✓ ' + msg;
  notice.style.display = 'block';
  setTimeout(function() { notice.style.display = 'none'; }, 1500);
}
