/*
 * CRAFT BASE — 流入経路の記録（依存なし）
 *
 * 外部からの流入元を localStorage に保存し、申込フォーム送信時に一緒に送れるようにする。
 *   first : 最初に来たときの流入元（初回接点）
 *   last  : 直近の外部流入元（直接アクセスでは上書きしない）
 *   ref   : サイト内のどのボタン・リンクから来たか（?ref=top_next_event など）
 *
 * 流入元の決め方（優先順）
 *   1. URL の utm_source / utm_medium / utm_campaign / utm_content / utm_term
 *   2. 外部サイトからの参照元（document.referrer）を主要サービス名に分類
 *   3. どちらもなければ (direct)
 *
 * 他ページで使うときは main.js より前に読み込むだけでよい。値は window.CBAttribution.get() で取得。
 */
(function () {
  'use strict';

  var KEY = 'cb_attr_v1';
  var TTL = 90 * 24 * 60 * 60 * 1000; // 90日で破棄
  var OWN_HOSTS = ['craftbase.biz', 'www.craftbase.biz', location.hostname];
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  // 参照元ホスト → [source, medium]
  var REFERRER_RULES = [
    [/(^|\.)instagram\.com$/, 'instagram', 'social'],
    [/(^|\.)facebook\.com$|(^|\.)fb\.me$/, 'facebook', 'social'],
    [/(^|\.)x\.com$|(^|\.)twitter\.com$|^t\.co$/, 'x', 'social'],
    [/(^|\.)line\.me$/, 'line', 'social'],
    [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'linkedin', 'social'],
    [/(^|\.)threads\.net$/, 'threads', 'social'],
    [/(^|\.)note\.com$/, 'note', 'referral'],
    [/(^|\.)google\.[a-z.]+$/, 'google', 'organic'],
    [/(^|\.)yahoo\.co\.jp$|(^|\.)yahoo\.com$/, 'yahoo', 'organic'],
    [/(^|\.)bing\.com$/, 'bing', 'organic'],
    [/(^|\.)duckduckgo\.com$/, 'duckduckgo', 'organic']
  ];

  function now() { return new Date().toISOString(); }
  function clip(v, n) { return String(v || '').slice(0, n); }

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (v && v.updated && Date.now() - v.updated < TTL) return v;
    } catch (e) { /* storage unavailable */ }
    return null;
  }
  function write(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
  }

  function classify(host) {
    for (var i = 0; i < REFERRER_RULES.length; i++) {
      if (REFERRER_RULES[i][0].test(host)) return { source: REFERRER_RULES[i][1], medium: REFERRER_RULES[i][2] };
    }
    return { source: host, medium: 'referral' };
  }

  var params = new URLSearchParams(location.search);
  var landing = clip(location.pathname + location.search, 300);
  var referrer = clip(document.referrer, 300);
  var refHost = '';
  try { refHost = referrer ? new URL(referrer).hostname : ''; } catch (e) { refHost = ''; }
  var isExternal = refHost && OWN_HOSTS.indexOf(refHost) === -1;

  var touch = null;
  if (params.get('utm_source')) {
    touch = {
      source: clip(params.get('utm_source'), 100),
      medium: clip(params.get('utm_medium'), 100),
      campaign: clip(params.get('utm_campaign'), 100),
      content: clip(params.get('utm_content'), 100),
      term: clip(params.get('utm_term'), 100)
    };
  } else if (isExternal) {
    var c = classify(refHost);
    touch = { source: c.source, medium: c.medium, campaign: '', content: '', term: '' };
  }
  if (touch) {
    touch.referrer = referrer;
    touch.landing = landing;
    touch.at = now();
  }

  var state = read() || {};
  if (touch) {
    if (!state.first) state.first = touch;
    state.last = touch;
  } else if (!state.first) {
    var direct = { source: '(direct)', medium: '(none)', campaign: '', content: '', term: '', referrer: referrer, landing: landing, at: now() };
    state.first = direct;
    state.last = direct;
  }
  if (params.get('ref')) {
    state.ref = { value: clip(params.get('ref'), 60), page: clip(location.pathname, 200), at: now() };
  }
  state.updated = Date.now();
  write(state);

  window.CBAttribution = {
    get: function () { return read() || state; },
    utmKeys: UTM_KEYS
  };
})();
