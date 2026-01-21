// ============================================
// 設定データ
// ============================================
var CONFIG = {
  // デザインテーマ (15種)
  DESIGN_THEMES: [
    { id: 'business', name: '💼 ビジネス', main: '#1E3A8A', sub: '#3B82F6', accent: '#F59E0B', bg: '#FFFFFF', text: '#1E293B' },
    { id: 'modern', name: '🔷 モダン', main: '#3B82F6', sub: '#10B981', accent: '#F59E0B', bg: '#FFFFFF', text: '#1F2937' },
    { id: 'tech', name: '🔮 テック', main: '#7C3AED', sub: '#818CF8', accent: '#22D3EE', bg: '#0F172A', text: '#E2E8F0' },
    { id: 'minimal', name: '⬜ ミニマル', main: '#18181B', sub: '#3F3F46', accent: '#3B82F6', bg: '#FFFFFF', text: '#18181B' },
    { id: 'nature', name: '🌿 ナチュラル', main: '#059669', sub: '#10B981', accent: '#F59E0B', bg: '#F0FDF4', text: '#1F2937' },
    { id: 'warm', name: '🌅 ウォーム', main: '#DC2626', sub: '#F97316', accent: '#FBBF24', bg: '#FFFBEB', text: '#1F2937' },
    { id: 'cool', name: '❄️ クール', main: '#0284C7', sub: '#38BDF8', accent: '#E0E7FF', bg: '#F0F9FF', text: '#0C4A6E' },
    { id: 'dark', name: '🌑 ダーク', main: '#60A5FA', sub: '#34D399', accent: '#FBBF24', bg: '#1E1E2E', text: '#E2E8F0' },
    { id: 'elegant', name: '👑 エレガント', main: '#18181B', sub: '#404040', accent: '#D4AF37', bg: '#FAFAFA', text: '#18181B' },
    { id: 'playful', name: '🎉 ポップ', main: '#EC4899', sub: '#8B5CF6', accent: '#14B8A6', bg: '#FFFFFF', text: '#1F2937' },
    { id: 'education', name: '📚 教育', main: '#2563EB', sub: '#059669', accent: '#DC2626', bg: '#FFFFFF', text: '#1E293B' },
    { id: 'medical', name: '🏥 医療', main: '#0891B2', sub: '#10B981', accent: '#F59E0B', bg: '#FFFFFF', text: '#0F172A' },
    { id: 'blackboard', name: '🖍️ 黒板', main: '#FFFFFF', sub: '#FFE066', accent: '#7DD3FC', bg: '#1A3C34', text: '#FFFFFF' },
    { id: 'notebook', name: '📓 ノート', main: '#1E40AF', sub: '#DC2626', accent: '#F59E0B', bg: '#FEF9E7', text: '#374151' },
    { id: 'startup', name: '🚀 スタートアップ', main: '#6366F1', sub: '#EC4899', accent: '#10B981', bg: '#FFFFFF', text: '#1F2937' }
  ],

  // アートスタイル (イラストの画風)
  ART_STYLES: [
    { id: 'none', name: '指定なし' },
    { id: 'ukiyoe', name: '🎎 浮世絵風', prompt: 'Ukiyo-e Japanese woodblock print style with traditional patterns and bold outlines' },
    { id: 'manga', name: '📖 マンガ風', prompt: 'Japanese manga comic style with screen tones, speech bubbles and dynamic lines' },
    { id: 'anime', name: '🌸 アニメ風', prompt: 'Modern anime illustration style with vibrant colors and expressive characters' },
    { id: 'watercolor', name: '🎨 水彩風', prompt: 'Soft watercolor painting style with gentle gradients and organic textures' },
    { id: 'flat', name: '📐 フラットデザイン', prompt: 'Clean flat design style with simple shapes and solid colors' },
    { id: 'isometric', name: '🔷 アイソメトリック', prompt: 'Isometric 3D illustration style with geometric perspective' },
    { id: 'retro', name: '📺 レトロ', prompt: 'Vintage retro style with nostalgic colors and classic design elements' },
    { id: 'cyberpunk', name: '🌃 サイバーパンク', prompt: 'Cyberpunk neon style with futuristic tech and glowing effects' },
    { id: 'minimalist', name: '⚪ ミニマリスト', prompt: 'Ultra minimalist style with essential elements only' },
    { id: 'kawaii', name: '🍬 かわいい系', prompt: 'Cute kawaii style with rounded shapes and pastel colors' },
    { id: 'corporate', name: '🏢 コーポレート', prompt: 'Professional corporate illustration style' },
    { id: 'sketch', name: '✏️ スケッチ風', prompt: 'Hand-drawn sketch style with pencil textures' },
    { id: 'papercut', name: '📄 切り絵風', prompt: 'Paper cut-out collage style with layered elements' },
    { id: 'pixel', name: '👾 ピクセルアート', prompt: 'Retro pixel art style with blocky graphics' }
  ],

  // 構造テンプレート (レイアウト構成)
  STRUCTURE_TEMPLATES: [
    { id: 'none', name: '指定なし' },
    { id: 'header-body', name: '📋 ヘッダー+本文', prompt: 'Header banner at top with main content below' },
    { id: 'three-panel', name: '📊 3パネル横並び', prompt: 'Three equal panels arranged horizontally' },
    { id: 'two-panel', name: '📑 2パネル横並び', prompt: 'Two equal panels side by side' },
    { id: 'four-grid', name: '🔲 4分割グリッド', prompt: 'Four-panel 2x2 grid layout' },
    { id: 'hero-content', name: '🎯 ヒーロー+コンテンツ', prompt: 'Large hero section at top with content cards below' },
    { id: 'sidebar', name: '📐 サイドバー型', prompt: 'Main content with sidebar on the side' },
    { id: 'scroll', name: '📜 巻物風', prompt: 'Traditional scroll style with decorative borders' },
    { id: 'card-stack', name: '🃏 カード重ね', prompt: 'Overlapping card stack design' },
    { id: 'timeline', name: '⏳ タイムライン', prompt: 'Vertical or horizontal timeline flow' },
    { id: 'magazine', name: '📰 雑誌風', prompt: 'Magazine editorial layout with mixed content blocks' },
    { id: 'poster', name: '🪧 ポスター風', prompt: 'Bold poster style with large typography' },
    { id: 'infographic', name: '📈 インフォグラフィック', prompt: 'Data-driven infographic layout with visual hierarchy' }
  ],

  // フレーム・枠スタイル
  FRAME_STYLES: [
    { id: 'none', name: 'なし' },
    { id: 'simple', name: '□ シンプル線', prompt: 'Simple line border' },
    { id: 'rounded', name: '⬜ 角丸', prompt: 'Rounded corner frame' },
    { id: 'double', name: '▣ 二重線', prompt: 'Double line border' },
    { id: 'japanese', name: '🎎 和風枠', prompt: 'Traditional Japanese decorative frame with patterns' },
    { id: 'ornate', name: '🖼️ 装飾枠', prompt: 'Ornate decorative frame with flourishes' },
    { id: 'ribbon', name: '🎀 リボン付き', prompt: 'Frame with ribbon banner decoration' },
    { id: 'cloud', name: '☁️ 雲形', prompt: 'Cloud-shaped soft border' },
    { id: 'torn', name: '📃 破れ紙風', prompt: 'Torn paper edge effect' },
    { id: 'stamp', name: '📮 スタンプ風', prompt: 'Postage stamp style border' },
    { id: 'neon', name: '💡 ネオン枠', prompt: 'Glowing neon border effect' },
    { id: 'shadow', name: '🌑 シャドウ', prompt: 'Drop shadow frame effect' }
  ],

  // 本文配置
  TEXT_POSITIONS: [
    { id: 'center', name: '中央' },
    { id: 'left', name: '左寄せ' },
    { id: 'right', name: '右寄せ' },
    { id: 'top', name: '上部' },
    { id: 'bottom', name: '下部' },
    { id: 'top-left', name: '左上' },
    { id: 'top-right', name: '右上' },
    { id: 'bottom-left', name: '左下' },
    { id: 'bottom-right', name: '右下' }
  ],

  // 本文スタイル
  TEXT_STYLES: [
    { id: 'none', name: '指定なし' },
    { id: 'speech', name: '💬 吹き出し', prompt: 'Text in speech bubble' },
    { id: 'thought', name: '💭 思考吹き出し', prompt: 'Text in thought bubble' },
    { id: 'banner', name: '🏷️ バナー', prompt: 'Text on ribbon banner' },
    { id: 'box', name: '📦 ボックス', prompt: 'Text in boxed container' },
    { id: 'handwritten', name: '✍️ 手書き風', prompt: 'Handwritten style text' },
    { id: 'typewriter', name: '⌨️ タイプライター', prompt: 'Typewriter style text' },
    { id: 'chalk', name: '🖍️ チョーク風', prompt: 'Chalk on blackboard style text' },
    { id: 'neon', name: '💡 ネオン文字', prompt: 'Glowing neon text effect' },
    { id: 'stamp', name: '📮 スタンプ文字', prompt: 'Rubber stamp style text' }
  ],

  // スライドタイプ (12種)
  SLIDE_TYPES: [
    { id: 'title', name: '表紙', prompt: 'Title slide with centered main title and subtitle' },
    { id: 'section', name: 'セクション区切り', prompt: 'Section divider slide with large section title' },
    { id: 'bullet', name: '箇条書き', prompt: 'Bullet point slide with title and 3-5 key points' },
    { id: 'two-column', name: '2カラム', prompt: 'Two-column layout slide for comparison or parallel content' },
    { id: 'four-panel', name: '4パネル', prompt: 'Four-panel grid layout (2x2) with icons and descriptions' },
    { id: 'image-text', name: '画像＋テキスト', prompt: 'Slide with image area and text content side by side' },
    { id: 'diagram', name: '図解中心', prompt: 'Diagram or flowchart focused slide with minimal text' },
    { id: 'data', name: 'データ・統計', prompt: 'Data visualization slide with charts, graphs or statistics' },
    { id: 'timeline', name: 'タイムライン', prompt: 'Timeline or process flow slide with connected steps' },
    { id: 'comparison', name: '比較・Before/After', prompt: 'Comparison layout slide (Before/After or A vs B)' },
    { id: 'quote', name: '引用・強調', prompt: 'Quote or key message slide with large text' },
    { id: 'summary', name: 'まとめ', prompt: 'Summary slide with key takeaways and call-to-action' }
  ],

  // ビジュアル要素 (8種)
  VISUAL_TYPES: [
    { id: 'none', name: 'なし', prompt: '' },
    { id: 'character', name: '👤 キャラクター', prompt: 'Include character/mascot illustration' },
    { id: 'diagram', name: '📊 図解', prompt: 'Include explanatory diagram or flowchart' },
    { id: 'icon', name: '🔣 アイコン', prompt: 'Include relevant icons for each point' },
    { id: 'photo', name: '📷 写真', prompt: 'Include relevant photograph' },
    { id: 'illustration', name: '🎨 イラスト', prompt: 'Include illustration' },
    { id: 'chart', name: '📈 グラフ', prompt: 'Include data chart or graph' },
    { id: 'infographic', name: '📋 インフォ要素', prompt: 'Include infographic visual elements' }
  ],

  // ビジュアル配置
  VISUAL_POSITIONS: [
    { id: 'right', name: '右' },
    { id: 'left', name: '左' },
    { id: 'top', name: '上' },
    { id: 'bottom', name: '下' },
    { id: 'background', name: '背景' },
    { id: 'scattered', name: '散りばめ' }
  ],

  // レイアウトスタイル
  LAYOUT_STYLES: [
    { id: 'simple', name: 'シンプル', prompt: 'Clean minimal slide layout' },
    { id: 'infographic', name: 'インフォグラフィック風', prompt: 'Rich infographic style with visual sections and icons' },
    { id: 'magazine', name: 'マガジン風', prompt: 'Magazine editorial style layout' },
    { id: 'blackboard', name: '黒板風', prompt: 'Blackboard/chalkboard style with handwritten elements' },
    { id: 'notebook', name: 'ノート風', prompt: 'Handwritten notebook style with casual elements' },
    { id: 'corporate', name: 'コーポレート', prompt: 'Professional corporate presentation style' }
  ],

  // 装飾要素
  DECORATIONS: [
    { id: 'none', name: 'なし' },
    { id: 'border', name: '枠線' },
    { id: 'shadow', name: '影' },
    { id: 'gradient', name: 'グラデ背景' },
    { id: 'pattern', name: 'パターン背景' },
    { id: 'ribbon', name: 'リボン' },
    { id: 'badge', name: 'バッジ' },
    { id: 'line-accent', name: 'ライン装飾' }
  ],

  // キャラクター性別
  CHAR_GENDERS: [
    { id: 'none', name: '指定なし' },
    { id: 'female', name: '👩 女性' },
    { id: 'male', name: '👨 男性' },
    { id: 'neutral', name: '🧑 中性的' }
  ],

  // キャラクター年齢層
  CHAR_AGES: [
    { id: 'none', name: '指定なし' },
    { id: 'child', name: '👒 子供' },
    { id: 'teen', name: '🧒 10代' },
    { id: 'young', name: '🧑 20-30代' },
    { id: 'middle', name: '🧔 40-50代' },
    { id: 'senior', name: '👴 シニア' }
  ],

  // キャラクター服装
  CHAR_OUTFITS: [
    { id: 'none', name: '指定なし' },
    { id: 'casual', name: '👕 カジュアル' },
    { id: 'business', name: '👔 ビジネス' },
    { id: 'suit', name: '🤵 スーツ' },
    { id: 'uniform', name: '🎽 制服' },
    { id: 'labcoat', name: '🥼 白衣' },
    { id: 'nurse', name: '👩‍⚕️ ナース服' },
    { id: 'sporty', name: '🏃 スポーツウェア' },
    { id: 'traditional', name: '👘 和装' }
  ],

  // キャラクター表情
  CHAR_EXPRESSIONS: [
    { id: 'none', name: '指定なし' },
    { id: 'smile', name: '😊 笑顔' },
    { id: 'serious', name: '😐 真剣' },
    { id: 'surprised', name: '😮 驚き' },
    { id: 'thinking', name: '🤔 考え中' },
    { id: 'happy', name: '😄 嬉しい' },
    { id: 'confident', name: '😎 自信' },
    { id: 'worried', name: '😟 心配' },
    { id: 'explain', name: '🗣️ 説明中' }
  ],

  // キャラクターポーズ
  CHAR_POSES: [
    { id: 'none', name: '指定なし' },
    { id: 'standing', name: '🧍 立ち' },
    { id: 'sitting', name: '🪑 座り' },
    { id: 'pointing', name: '👉 指差し' },
    { id: 'arms-crossed', name: '🙅 腕組み' },
    { id: 'thumbs-up', name: '👍 いいね' },
    { id: 'waving', name: '👋 手を振る' },
    { id: 'presenting', name: '🎤 プレゼン' },
    { id: 'thinking-pose', name: '🤷 考えポーズ' }
  ],

  // 背景タイプ
  BG_TYPES: [
    { id: 'none', name: '指定なし' },
    { id: 'solid', name: '■ 単色' },
    { id: 'gradient', name: '🌈 グラデーション' },
    { id: 'geometric', name: '🔷 幾何学模様' },
    { id: 'dots', name: '⚫ ドットパターン' },
    { id: 'lines', name: '📏 ラインパターン' },
    { id: 'wave', name: '🌊 ウェーブ' },
    { id: 'bokeh', name: '✨ ボケ' },
    { id: 'texture', name: '🧱 テクスチャ' }
  ],

  // 背景ムード
  BG_MOODS: [
    { id: 'none', name: '指定なし' },
    { id: 'bright', name: '☀️ 明るい' },
    { id: 'calm', name: '🌿 落ち着き' },
    { id: 'energetic', name: '⚡ エネルギッシュ' },
    { id: 'professional', name: '💼 プロフェッショナル' },
    { id: 'warm', name: '🔥 暖かい' },
    { id: 'cool', name: '❄️ クール' },
    { id: 'playful', name: '🎈 ポップ' },
    { id: 'elegant', name: '👑 エレガント' }
  ],

  // 表紙タイトル配置
  TITLE_POSITIONS: [
    { id: 'center', name: '中央' },
    { id: 'left', name: '左寄せ' },
    { id: 'right', name: '右寄せ' },
    { id: 'top-left', name: '左上' },
    { id: 'top-center', name: '上中央' },
    { id: 'bottom-left', name: '左下' },
    { id: 'bottom-center', name: '下中央' }
  ],

  // 表紙タイトルサイズ
  TITLE_SIZES: [
    { id: 'large', name: '大' },
    { id: 'medium', name: '中' },
    { id: 'small', name: '小' },
    { id: 'xlarge', name: '特大' }
  ],

  // 表紙イラスト配置
  COVER_VISUAL_POSITIONS: [
    { id: 'none', name: 'なし' },
    { id: 'right', name: '右側' },
    { id: 'left', name: '左側' },
    { id: 'bottom-right', name: '右下' },
    { id: 'bottom-left', name: '左下' },
    { id: 'top-right', name: '右上' },
    { id: 'top-left', name: '左上' },
    { id: 'background', name: '背景全体' },
    { id: 'scattered', name: '散りばめ' }
  ],

  // 表紙イラストサイズ
  COVER_VISUAL_SIZES: [
    { id: 'medium', name: '中' },
    { id: 'small', name: '小' },
    { id: 'large', name: '大' },
    { id: 'full', name: '全面' }
  ],

  // デフォルトカラー
  DEFAULT_COLORS: {
    main: '#3B82F6',
    sub: '#10B981',
    accent: '#F59E0B',
    bg: '#FFFFFF',
    text: '#1F2937'
  }
};
