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
privacy.html   プライバシーポリシー（一般的な内容。制定日 2026-10-28。スタイルは style.css の .policy）
events/tokyo-innovation-hub/index.html  11/20 イベントの紹介＋申込フォーム（ルート相対パス /assets/... を使用）
assets/css/style.css, assets/css/event.css（イベントLP用）, assets/js/main.js, assets/img/
assets/js/attribution.js  流入経路の記録（全ページで main.js より前に読み込む）
assets/js/entry-form.js   申込フォームの入力チェック・送信
tools/apps-script/entry-form.gs  申込データをスプレッドシートに書き込む Google Apps Script（公開対象外）
.assetsignore  Cloudflare に公開しないファイル（.git, CLAUDE.md など）。新しい非公開ファイルを置くときは必ず追記
```
- ヘッダー・フッターは6ページ（privacy.html 含む）に同じものをコピーしている。共通部分を変えるときは全ページを同じように直す。
- 画像はすべてローカル（`assets/img/`）。Unsplash の写真はダウンロード済み。ロゴは背景透過済み: `logo.png`（全体）、`logo-mark.png`（白背景用）、`logo-mark-light.png`（暗い背景用＝フッター）。

## 公開・デプロイ
- GitHub（非公開）: https://github.com/koyo08230840-cpu/craftbase-site （ブランチ `main`）
- Cloudflare Workers（静的アセット）プロジェクト名 `craftbase-site`。**main に push すると自動で本番デプロイ**（1〜2分）。
  - 確認用URL: https://craftbase-site.reverse-13816484.workers.dev
- Git: `C:\Program Files\Git\cmd\git.exe`（PATH に無いシェルではフルパスで呼ぶ）。作成者はリポジトリ設定で `陶山功陽 <koyo08230840@gmail.com>`。GitHub の認証情報は保存済みで、エージェントのシェルから push できる。
- Cloudflare は `/about.html` を `/about` に 307 でリダイレクトする（既定の動作で正常）。デプロイ確認は `/privacy` のように拡張子なしで 200 を見る。
- 初回デプロイで `.git` が公開されてしまった → `.assetsignore` で解決済み。push 後は `/.git/HEAD` などが 404 になることを確認する習慣を。
- 旧プレビュー: claude.ai アーティファクト https://claude.ai/artifact/CotWPjtRXc87Vb1wieL7ab （Version 4 時点の内容。今後は workers.dev / 本番で確認すればよい）

## ドメイン craftbase.biz（接続済み）
- 本番URL: https://craftbase.biz （https://www.craftbase.biz も同じサイト）。2026-10-28 に Workers & Pages → `craftbase-site` → Domains でカスタムドメインとして両方追加し、表示・`/.git/HEAD` と `/CLAUDE.md` の 404・MX 維持を確認済み。
- レジストラは Squarespace（旧 Google Domains）。DNSSEC オフ、ネームサーバーは `jack.ns.cloudflare.com` / `josephine.ns.cloudflare.com`。
- Cloudflare の DNS: **メール用の MX（smtp.google.com）・SPF・DKIM の TXT は絶対に消さない**（Google Workspace のメール）。
- カスタムドメイン追加時の注意: 入力欄はゾーン名（`craftbase.biz`）で検索し、サブドメインは次画面の Subdomain 欄に入れる。`www.craftbase.biz` と直接入れると「Onboard domain」（新規ゾーン登録）に進んでしまう。
- SSL/TLS → Edge Certificates の「Always Use HTTPS」をオン済み（2026-10-28）。`http://` は 301 で `https://` へリダイレクトされることを確認済み。
- Cloudflare から別件のアラート（Workers CPU limit exceeded ×3、KV daily operation limit 50% ×2）が届いている。craftbase-site は静的ファイルのみなので、同アカウントの別 Worker の件と思われる。未調査。

## 掲載している事実情報（ユーザー確認済み）
- 会社概要: 創業 2026年7月3日／法人番号 8010701049815／資本金 500,000円／所在地 東京都品川区南品川4丁目4番17号 品川サウスタワー（郵便番号は未提供のため未記載）
- 代表 陶山 功陽: 広島県出身、東京大学卒（都市工学専攻）、新卒で不動産ディベロッパー、上場IT企業でパートナーサクセス部門マネージャー（社内最年少で管理職）、2026年7月創業。代表メッセージ本文はユーザー指定の文章（勝手に書き換えない）。
- Instagram: 代表 @suyama_koyo／クラフトビール @craftbeer_community
- メディア: note「人とか、仕事とか。」#22（2026.08.26）https://note.com/knowwork/n/n679b85e82e85
- 活動実績: 2023 うまやど祭に参加者として初参加／2026.07.30 BREW & WHISKY NIGHT（西五反田）／2026.09.18 CRAFT BEER & PAIRING NIGHT（西五反田）／2026.10.12 第4回うまやど祭（大田区馬込）スポンサー協賛／2026.10.23 KAIGAN BREWERY コラボのクラフトビール会
- 次回イベント: 2026.11.20（金）東京イノベーションハブ（東京駅・八重洲エリア、19:00開場/19:30開始/21:00終了、参加費3,000円（事前決済割引は2026-10-30に廃止）、1分ピッチ6,000円（参加費込み）、主催 CRAFT BASE／共催 Nextive／協賛 Baku.LLC）
- 「実績紹介（数字）」はユーザーの希望で削除済み。
- ABOUT US の創業ストーリー本文（2026-10-28 作成）は上記の経歴・活動実績の事実だけで構成した。ユーザーから修正の指示があればそれに従う。

## イベント申込と流入経路の計測（2026-10-30 本番公開済み）
- 本番URL: https://craftbase.biz/events/tokyo-innovation-hub/ 。送信先は Apps Script ウェブアプリ `https://script.google.com/macros/s/AKfycbyHCEotN-N3oEuOQs2FqYvbqGcC3jAMKRTZWnvBUcLXQUExd_4ADArMhQ2B_ZkE7M1CFA/exec`（スプレッドシートに紐づくスクリプト、プロジェクトID 1KoWxDnjPQotQRW79P_QX6z7-viT8pxRqwlFzzHccIKh6FE6WasB9pcoh）。テスト申込で記録・受付メール・通知メールを確認済み、テスト行は削除済み。
- 会場（リノスペース東京日本橋／〒103-0027 東京都中央区日本橋2丁目1-17 丹生ビル 5階、地図 https://maps.app.goo.gl/BvrAaqXtUMTDRYYM8）は**受付メールにだけ載せる**（ユーザー指定。申込ページ・TOP・NEWS は「東京駅・八重洲エリア」のまま）。
- 受付メールはテキスト版が約40文字で自動改行されるため、1行を全角35文字程度までに保ち、HTML版（toHtml_）も一緒に送っている。
- gs を書き換えたら、エディタに貼り直したうえで「デプロイを管理」→ 編集 → 新バージョン（URLは変わらない）。リポジトリの `tools/apps-script/entry-form.gs` とエディタの中身を揃えておく。
- 配布用URLの例（utm_campaign=tih_20261120）: Instagram は utm_content でアカウントと投稿種類を区別（suyama_post / suyama_story / cbc_post / cbc_story / profile）。LINE は utm_source=line&utm_medium=social、メールは email/email、共催・協賛の告知は utm_source=nextive|baku&utm_medium=partner、チラシのQRは utm_source=flyer&utm_medium=offline。
- 申込ページ: `/events/tokyo-innovation-hub/`。フォームの `data-endpoint` に Apps Script のウェブアプリURLを入れると送信される。空の間は送信せず、送信内容を画面に表示するプレビュー動作。
- 受付: `tools/apps-script/entry-form.gs` をスプレッドシートに貼ってウェブアプリとしてデプロイ。シート「申込一覧」に1行ずつ追記、申込者へ受付メール・主催者へ通知メール（CONFIG で切替）。複数イベントで共用し「イベントID」列で区別。
- 流入経路: `attribution.js` が localStorage（`cb_attr_v1`、90日）に初回接点 first／直近の外部流入 last／サイト内導線 ref を保存し、申込時に一緒に送る。
  - 外部で配るURLには utm を付ける。例: `https://craftbase.biz/events/tokyo-innovation-hub/?utm_source=instagram&utm_medium=social&utm_campaign=tih_20261120&utm_content=story`
  - 命名ルール: utm_source＝媒体名（instagram / line / x / facebook / note / email / flyer / partner_nextive など小文字）、utm_medium＝social / email / referral / offline、utm_campaign＝`tih_20261120` のようにイベント単位、utm_content＝投稿の種類や配布者。
  - サイト内のボタンは utm ではなく `?ref=` を付ける（top_next_event / top_news / news_next_event / news_list）。
- 参加区分（一般参加 3,000円／1分ピッチ登壇 6,000円）は必須のラジオボタン。申込後も変更可能（受付メールへの返信で連絡）と明記。
- 受付メールは送信元が Apps Script の所有者の Gmail（koyo08230840@gmail.com）。差出人の表示名・件名・開催概要は gs の `EVENTS[イベントID]` で設定（11/20 は「11月20日(金)東京イノベーションハブ運営/(株)CRAFT BASE」）。`testAutoReply()` を手動実行すると自分宛てに見本が届く。個人の Gmail から Apps Script で送れるのは1日100通まで。
- 新しいイベントを足すときは events/ に同じ構成でフォルダを作り、`data-event-id` と `data-event-name` を変え、gs の `EVENTS` に設定を追加する。
- チラシ画像 `event-tokyo-innovation-hub.jpg` は、元の画像から「事前決済で500円引」の帯だけを背景で塗りつぶした版（2026-10-30）。ユーザーが作り直した版は文字化け・誤字が多かったため不採用。
- 申込管理用スプレッドシート「CRAFT BASE イベント申込管理」: https://docs.google.com/spreadsheets/d/1dpVWE1afW0HpVp6BbVZetabs98QEwJ-k0lh0mkCZkPg/edit （Apps Script の設置待ち）

## 残タスク
1. お問い合わせフォームの送信先が未設定（`action="#"`）。Cloudflare の仕組みかフォームサービスで実装
2. 11/20 申込: スプレッドシートと Apps Script の設置 → data-endpoint 設定 → 本番反映（feature/tih-entry を main にマージ）
3. OGP 画像 `assets/img/ogp.jpg` が未作成（meta では参照済み）
4. 10/23 の会、うまやど祭の写真はイメージ写真のまま（実写真が届いたら差し替え）

## 作業時の注意
- 変更後はスマホ幅（375px）でも表示と横スクロールの有無を確認する。
- このPCには Python・Node が無い。ローカル確認は `Claude Trial\.claude\launch.json` の `craftbase-local`（PowerShell の HttpListener、http://localhost:8787）をブラウザペインの preview_start で起動するか、push して確認する。`-ExecutionPolicy Bypass` 付きのスクリプト実行は権限で拒否されたことがある。
