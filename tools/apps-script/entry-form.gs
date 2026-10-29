/**
 * CRAFT BASE イベント申込 受付スクリプト（Google Apps Script）
 *
 * 申込フォーム（/events/.../ の entry-form.js）から POST されたデータを、
 * このスクリプトを紐づけたスプレッドシートの「申込一覧」シートに1行ずつ追記する。
 * 複数のイベントで共用でき、イベントは「イベントID」列で区別する。
 *
 * 設置手順
 *   1. 管理用のスプレッドシートを開き、[拡張機能] → [Apps Script] にこのファイルの中身を貼り付けて保存
 *   2. エディタ上部の関数で「setup」を選んで実行（初回のみ権限の許可が出るので承認）→ 見出し行が作られる
 *   3. [デプロイ] → [新しいデプロイ] → 種類「ウェブアプリ」
 *        実行ユーザー: 自分 ／ アクセスできるユーザー: 全員
 *   4. 発行された「ウェブアプリのURL」（https://script.google.com/macros/s/.../exec）を
 *      申込ページの <form data-endpoint="..."> に設定する
 *   ※ スクリプトを書き換えたら [デプロイを管理] → 編集 → バージョン「新バージョン」で更新する（URLは変わらない）
 */

const CONFIG = {
  SHEET_NAME: '申込一覧',
  TIMEZONE: 'Asia/Tokyo',
  NOTIFY_TO: 'koyo08230840@gmail.com', // 新しい申込があったときの通知先（空文字にすると通知しない）
  SEND_AUTO_REPLY: true,               // 申込者へ受付メールを送るか
  FROM_NAME: '株式会社CRAFT BASE',
  REPLY_TO: '',                        // 受付メールの返信先（空ならスクリプト所有者のアドレス）
};

// [送信データのキー, シートの見出し]
const COLUMNS = [
  ['received_at', '受付日時'],
  ['entry_id', '申込ID'],
  ['event_id', 'イベントID'],
  ['event_name', 'イベント名'],
  ['name', 'お名前'],
  ['company', '会社名・団体名'],
  ['industry', '業種'],
  ['position', '役職'],
  ['email', 'メールアドレス'],
  ['tel', '電話番号'],
  ['intro', '自己紹介（当日話したいこと）'],
  ['agree_use', '利用目的への同意'],
  ['agree_rules', '注意事項への同意'],
  ['utm_source', '流入元（直近）'],
  ['utm_medium', 'メディア（直近）'],
  ['utm_campaign', 'キャンペーン（直近）'],
  ['utm_content', 'コンテンツ（直近）'],
  ['utm_term', 'キーワード（直近）'],
  ['last_touch_at', '直近の流入日時'],
  ['referrer', '参照元URL'],
  ['landing_page', '着地ページ'],
  ['first_source', '流入元（初回）'],
  ['first_medium', 'メディア（初回）'],
  ['first_campaign', 'キャンペーン（初回）'],
  ['first_touch_at', '初回の流入日時'],
  ['entry_ref', 'サイト内導線'],
  ['entry_ref_page', '導線のページ'],
  ['page_url', '申込ページURL'],
  ['device', '端末'],
  ['status', '対応状況'],
  ['memo', 'メモ'],
];

const REQUIRED = ['event_id', 'name', 'company', 'industry', 'email'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doGet() {
  return json_({ ok: true, service: 'craftbase-entry' });
}

function doPost(e) {
  const p = (e && e.parameter) || {};

  // honeypot に値がある＝ボット。成功したふりをして記録しない
  if (p.website) return json_({ ok: true });

  const error = validate_(p);
  if (error) return json_({ ok: false, error: error });

  const entryId = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyyMMdd-HHmmss') + '-' +
    Math.random().toString(36).slice(2, 6).toUpperCase();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const row = COLUMNS.map(function (c) {
      switch (c[0]) {
        case 'received_at': return new Date();
        case 'entry_id': return entryId;
        case 'status': return '未対応';
        case 'memo': return '';
        default: return clean_(p[c[0]]);
      }
    });
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  // メール送信の失敗で申込自体を失敗扱いにしない
  try { if (CONFIG.SEND_AUTO_REPLY) sendAutoReply_(p, entryId); } catch (err) { console.error(err); }
  try { if (CONFIG.NOTIFY_TO) notifyOwner_(p, entryId); } catch (err) { console.error(err); }

  return json_({ ok: true, entry_id: entryId });
}

/** 初回に一度だけ手動で実行：シートと見出し行を用意し、権限の承認を済ませる */
function setup() {
  getSheet_();
  MailApp.getRemainingDailyQuota();
}

function validate_(p) {
  for (var i = 0; i < REQUIRED.length; i++) {
    if (!String(p[REQUIRED[i]] || '').trim()) return 'missing:' + REQUIRED[i];
  }
  if (!EMAIL_RE.test(String(p.email).trim())) return 'invalid:email';
  if (p.agree_use !== 'yes' || p.agree_rules !== 'yes') return 'missing:agreement';
  if (String(p.intro || '').length > 1000) return 'too_long:intro';
  return '';
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(function (c) { return c[1]; }));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#f6f5f2');
    sheet.getRange('A:A').setNumberFormat('yyyy/mm/dd hh:mm:ss');
  }
  return sheet;
}

// 文字数を制限し、先頭が = + - @ の値は数式として解釈されないよう ' を付ける
function clean_(v) {
  let s = String(v == null ? '' : v).trim().slice(0, 2000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function sendAutoReply_(p, entryId) {
  const body = [
    p.name + ' 様',
    '',
    'このたびは「' + p.event_name + '」にお申し込みいただき、ありがとうございます。',
    '以下の内容で受け付けました。',
    '',
    '■ 申込ID：' + entryId,
    '■ お名前：' + p.name,
    '■ 会社名・団体名：' + p.company,
    '■ 業種：' + p.industry,
    '■ メールアドレス：' + p.email,
    '',
    '■ 開催概要',
    '日時：2026年11月20日（金）19:00 開場／19:30 スタート／21:00 終了',
    '場所：東京駅・八重洲エリア（東京駅 徒歩4分／日本橋駅 徒歩1分）',
    '　　　会場の詳細・お支払い方法は、追ってご案内いたします。',
    '',
    'ご不明な点は、本メールへの返信にてお問い合わせください。',
    '当日お会いできることを楽しみにしております。',
    '',
    '──────────────',
    '株式会社CRAFT BASE',
    'https://craftbase.biz',
  ].join('\n');

  const options = { name: CONFIG.FROM_NAME };
  if (CONFIG.REPLY_TO) options.replyTo = CONFIG.REPLY_TO;
  MailApp.sendEmail(String(p.email).trim(), '【受付完了】' + p.event_name + ' お申し込みありがとうございます', body, options);
}

function notifyOwner_(p, entryId) {
  const source = [p.utm_source, p.utm_medium, p.utm_campaign].filter(String).join(' / ') || '(不明)';
  const body = [
    '新しい申込がありました。',
    '',
    'イベント：' + p.event_name,
    '申込ID：' + entryId,
    'お名前：' + p.name + '（' + p.company + '）',
    '業種：' + p.industry + (p.position ? '／' + p.position : ''),
    'メール：' + p.email + (p.tel ? '／電話：' + p.tel : ''),
    '流入元：' + source + (p.entry_ref ? '（サイト内導線：' + p.entry_ref + '）' : ''),
    '',
    '自己紹介：',
    p.intro || '（なし）',
    '',
    '一覧：' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  ].join('\n');
  MailApp.sendEmail(CONFIG.NOTIFY_TO, '【申込】' + p.event_name + '：' + p.name + ' 様', body);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
