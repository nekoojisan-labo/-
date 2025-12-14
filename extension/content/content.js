// Claude Assistant - Content Script

// ページ情報を抽出
function extractPageInfo() {
  const title = document.title;
  const url = window.location.href;
  const metaDescription = document.querySelector('meta[name="description"]')?.content || '';

  // 主要なテキストコンテンツを抽出
  const mainContent = extractMainContent();

  // リンクを抽出
  const links = extractLinks();

  // 画像を抽出
  const images = extractImages();

  // ヘッダー構造を抽出
  const headings = extractHeadings();

  return {
    title,
    url,
    metaDescription,
    content: mainContent,
    links,
    images,
    headings
  };
}

// 主要なテキストコンテンツを抽出
function extractMainContent() {
  // 優先度の高いコンテンツエリアを探す
  const contentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '.content',
    '#content',
    '.post-content',
    '.article-content'
  ];

  let contentElement = null;
  for (const selector of contentSelectors) {
    contentElement = document.querySelector(selector);
    if (contentElement) break;
  }

  // 見つからない場合はbodyを使用
  if (!contentElement) {
    contentElement = document.body;
  }

  return getTextContent(contentElement);
}

// 要素からテキストを抽出（スクリプトやスタイルを除外）
function getTextContent(element) {
  const clone = element.cloneNode(true);

  // 不要な要素を削除
  const unwantedSelectors = ['script', 'style', 'noscript', 'iframe', 'svg', 'nav', 'footer', 'header'];
  unwantedSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });

  let text = clone.textContent || '';
  // 空白を正規化
  text = text.replace(/\s+/g, ' ').trim();
  // 長すぎる場合は切り詰め
  return text.substring(0, 15000);
}

// リンクを抽出
function extractLinks() {
  const links = [];
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.href;
    const text = a.textContent?.trim();
    if (href && text && !href.startsWith('javascript:')) {
      links.push({ text, href });
    }
  });
  return links.slice(0, 100); // 最大100件
}

// 画像を抽出
function extractImages() {
  const images = [];
  document.querySelectorAll('img[src]').forEach(img => {
    const src = img.src;
    const alt = img.alt || '';
    if (src) {
      images.push({ src, alt });
    }
  });
  return images.slice(0, 50); // 最大50件
}

// ヘッダー構造を抽出
function extractHeadings() {
  const headings = [];
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
    const level = parseInt(h.tagName.substring(1));
    const text = h.textContent?.trim();
    if (text) {
      headings.push({ level, text });
    }
  });
  return headings;
}

// テキストを検索
function searchInPage(query) {
  const results = [];
  const regex = new RegExp(query, 'gi');
  const textNodes = getTextNodes(document.body);

  textNodes.forEach(node => {
    const matches = node.textContent.match(regex);
    if (matches) {
      results.push({
        text: node.textContent.trim(),
        count: matches.length
      });
    }
  });

  return results;
}

// テキストノードを取得
function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tagName = parent.tagName.toLowerCase();
        if (['script', 'style', 'noscript'].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (node.textContent.trim()) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    }
  );

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  return textNodes;
}

// テキストをハイライト
function highlightText(query) {
  removeHighlights();

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const textNodes = getTextNodes(document.body);
  let count = 0;

  textNodes.forEach(node => {
    if (node.textContent.match(regex)) {
      const span = document.createElement('span');
      span.innerHTML = node.textContent.replace(regex, '<mark class="claude-highlight">$1</mark>');
      node.parentNode.replaceChild(span, node);
      count++;
    }
  });

  // ハイライト用のスタイルを追加
  if (!document.getElementById('claude-highlight-style')) {
    const style = document.createElement('style');
    style.id = 'claude-highlight-style';
    style.textContent = `
      .claude-highlight {
        background-color: #ffff00;
        color: #000;
        padding: 2px;
        border-radius: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  return count;
}

// ハイライトを削除
function removeHighlights() {
  document.querySelectorAll('.claude-highlight').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
}

// 正規表現のエスケープ
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// メッセージハンドラー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch (request.action) {
      case 'extractPageInfo':
        sendResponse({ success: true, data: extractPageInfo() });
        break;

      case 'searchInPage':
        sendResponse({ success: true, data: searchInPage(request.query) });
        break;

      case 'highlightText':
        const count = highlightText(request.query);
        sendResponse({ success: true, count });
        break;

      case 'removeHighlights':
        removeHighlights();
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: '不明なアクション' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }

  return true;
});

// 初期化完了をログ
console.log('Claude Assistant content script loaded');
