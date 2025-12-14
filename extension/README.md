# Claude Assistant - Chrome拡張機能

Claude AIを使ってブラウジングを支援するChrome拡張機能です。

## 機能

- **ページ分析**: 現在開いているページの内容を分析・要約
- **タブ管理**: 開いているタブの一覧表示、切り替え、閉じる
- **ブックマーク検索**: ブックマークの検索・管理
- **履歴検索**: 閲覧履歴の検索
- **一般的な質問**: Claudeに何でも質問

## インストール方法

### 1. アイコンを生成

1. `extension/icons/generate-icons.html` をブラウザで開く
2. 「全てのアイコンをダウンロード」をクリック
3. ダウンロードされた `icon16.png`, `icon48.png`, `icon128.png` を `extension/icons/` フォルダに移動

### 2. 拡張機能を読み込む

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `extension` フォルダを選択

### 3. APIキーを設定

1. 拡張機能アイコンをクリック
2. 設定（⚙️）ボタンをクリック
3. [Anthropic Console](https://console.anthropic.com/) でAPIキーを取得
4. APIキーを入力して保存

## 使い方

1. 任意のページで拡張機能アイコンをクリック
2. クイックアクションボタンを使用するか、直接メッセージを入力
3. Claudeが回答を生成

### クイックアクション

- **📄 ページ分析**: 現在のページを分析
- **🗂️ タブ一覧**: 開いているタブを表示
- **⭐ ブックマーク**: ブックマークを検索
- **📜 履歴**: 閲覧履歴を表示

## ディレクトリ構造

```
extension/
├── manifest.json          # 拡張機能マニフェスト
├── background/
│   └── service-worker.js  # バックグラウンドサービス
├── popup/
│   ├── popup.html         # ポップアップUI
│   ├── popup.css          # スタイル
│   └── popup.js           # ポップアップロジック
├── content/
│   └── content.js         # コンテンツスクリプト
├── options/
│   ├── options.html       # 設定ページ
│   └── options.js         # 設定ロジック
└── icons/
    ├── icon.svg           # SVGアイコン
    ├── generate-icons.html # アイコン生成ツール
    ├── icon16.png         # 16x16アイコン
    ├── icon48.png         # 48x48アイコン
    └── icon128.png        # 128x128アイコン
```

## 必要な権限

- `activeTab`: 現在のタブにアクセス
- `tabs`: タブ管理
- `bookmarks`: ブックマーク管理
- `history`: 履歴アクセス
- `storage`: 設定保存
- `scripting`: ページコンテンツ抽出

## セキュリティ

- APIキーはブラウザのローカルストレージに保存
- APIキーはAnthropic APIへの通信にのみ使用
- ページコンテンツはローカルで処理

## ライセンス

MIT License
