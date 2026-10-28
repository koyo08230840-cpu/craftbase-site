# 株式会社CRAFT BASE コーポレートサイト — 引き継ぎメモ

最終更新: 2026-10-28。ユーザーとのやり取りは**日本語**で行うこと。

## 概要
- 会社: 株式会社CRAFT BASE（代表取締役 陶山 功陽）。ブランドメッセージ「Craft Your Own Base.」
- 設計方針: 「自分らしい人生を創る人を増やす」を軸に、人・企業・地域の可能性をつなぐ会社として一貫性を持たせる。将来の小売・ライフスタイル・地域創生事業へ拡張できる構成。
- デザイン: 白とダークグレー基調、差し色はロゴ由来のブラウン `#74472a`／オレンジ `#e8791c`／イエロー `#f0b414`。色・余白などは `assets/css/style.css` 冒頭の `:root` 変数で管理。
- 素の HTML/CSS/JS のみ（ビルド不要・依存なし）。フォントは Google Fonts（Montserrat / Noto Sans JP）。

## ファイル構成
```
index.html     TOP（ヒーロー／ミッション／事業概要／NEXT EVENT／代表メッセージ＋PROFILE＋Instagram／最新ニュース5件）
business.html  事業紹介（3事業＋FUTURE: 小売・ライフスタイル・地域創生）
about.html     会社紹介（VISION＋ロゴ／理念「先義後利・挑戦・共に勝つ」／創業ストーリー＋年表／会社概要）
news.html      NEXT EVENT／EVENT REPORT（活動報告）／NEWS一覧（カテゴリ絞り込み）／MEDIA
contact.html   問い合わせ種別6つ＋フォーム（?type=event 等で種別を初期選択、イベント選択時のみ追加項目表示）
assets/css/style.css, assets/js/main.js, assets/img/
.assetsignore  Cloudflare に公開しないファイル（.git, CLAUDE.md など）。新しい非公開ファイルを置くときは必ず追記
```
- ヘッダー・フッターは5ページに同じものをコピーしている。共通部分を変えるときは全ページを同じように直す。
- 画像はすべてローカル（`assets/img/`）。Unsplash の写真はダウンロード済み。ロゴは背景透過済み: `logo.png`（全体）、`logo-mark.png`（白背景用）、`logo-mark-light.png`（暗い背景用＝フッター）。

## 公開・デプロイ
- GitHub（非公開）: https://github.com/koyo08230840-cpu/craftbase-site （ブランチ `main`）
- Cloudflare Workers（静的アセット）プロジェクト名 `craftbase-site`。**main に push すると自動で本番デプロイ**（1〜2分）。
  - 確認用URL: https://craftbase-site.reverse-13816484.workers.dev
- Git: `C:\Program Files\Git\cmd\git.exe`（PATH に無いシェルではフルパスで呼ぶ）。作成者はリポジトリ設定で `陶山功陽 <koyo08230840@gmail.com>`。GitHub の認証情報は保存済みで、エージェントのシェルから push できる。
- 初回デプロイで `.git` が公開されてしまった → `.assetsignore` で解決済み。push 後は `/.git/HEAD` などが 404 になることを確認する習慣を。
- 旧プレビュー: claude.ai アーティファクト https://claude.ai/artifact/CotWPjtRXc87Vb1wieL7ab （Version 4 時点の内容。今後は workers.dev / 本番で確認すればよい）

## ドメイン craftbase.biz（作業中）
- レジストラは Squarespace（旧 Google Domains）。DNSSEC をオフにし、ネームサーバーを `jack.ns.cloudflare.com` / `josephine.ns.cloudflare.com` に変更済み（2026-10-28 に反映を確認）。
- Cloudflare の DNS: Squarespace 向けの A×4 と `www` CNAME は削除済み。**メール用の MX（smtp.google.com）・SPF・DKIM の TXT は絶対に消さない**（Google Workspace のメール）。
- **次の作業**: Cloudflare でゾーンが Active になったら、Workers & Pages → `craftbase-site` → Domains → Add → Custom domain で `craftbase.biz` と `www.craftbase.biz` を追加 → https://craftbase.biz の表示を確認。
- Active 通知メールはまだ未着（Gmail コネクタで `from:cloudflare.com craftbase.biz` を検索して確認できる）。
- Cloudflare から別件のアラート（Workers CPU limit exceeded ×3、KV daily operation limit 50% ×2）が届いている。craftbase-site は静的ファイルのみなので、同アカウントの別 Worker の件と思われる。未調査。

## 掲載している事実情報（ユーザー確認済み）
- 会社概要: 創業 2026年7月3日／法人番号 8010701049815／資本金 500,000円／所在地 東京都品川区南品川4丁目4番17号 品川サウスタワー（郵便番号は未提供のため未記載）
- 代表 陶山 功陽: 広島県出身、東京大学卒（都市工学専攻）、新卒で不動産ディベロッパー、上場IT企業でパートナーサクセス部門マネージャー（社内最年少で管理職）、2026年7月創業。代表メッセージ本文はユーザー指定の文章（勝手に書き換えない）。
- Instagram: 代表 @suyama_koyo／クラフトビール @craftbeer_community
- メディア: note「人とか、仕事とか。」#22（2026.08.26）https://note.com/knowwork/n/n679b85e82e85
- 活動実績: 2023 うまやど祭に参加者として初参加／2026.07.30 BREW & WHISKY NIGHT（西五反田）／2026.09.18 CRAFT BEER & PAIRING NIGHT（西五反田）／2026.10.12 第4回うまやど祭（大田区馬込）スポンサー協賛／2026.10.23 KAIGAN BREWERY コラボのクラフトビール会
- 次回イベント: 2026.11.20（金）東京イノベーションハブ（東京駅・八重洲エリア、19:00開場/19:30開始/21:00終了、参加費3,000円・11/18まで事前決済で500円引、1分ピッチ6,000円、主催 CRAFT BASE／共催 Nextive／協賛 Baku.LLC）
- 「実績紹介（数字）」はユーザーの希望で削除済み。

## 残タスク
1. ドメインを Active 後に接続（上記）
2. お問い合わせフォームの送信先が未設定（`action="#"`）。Cloudflare の仕組みかフォームサービスで実装
3. 11/20 申込ボタンのリンク先（`href="#"`、HTML に TODO コメントあり）
4. ABOUT US の創業ストーリー本文がダミー
5. プライバシーポリシーのページが未作成（リンクは `#`）
6. OGP 画像 `assets/img/ogp.jpg` が未作成（meta では参照済み）
7. 10/23 の会、うまやど祭の写真はイメージ写真のまま（実写真が届いたら差し替え）

## 作業時の注意
- 変更後はスマホ幅（375px）でも表示と横スクロールの有無を確認する。
- このPCには Python・Node が無い。ローカル確認は PowerShell の簡易サーバーを使うか、push して workers.dev で確認する。`-ExecutionPolicy Bypass` 付きのスクリプト実行は権限で拒否されたことがある。
