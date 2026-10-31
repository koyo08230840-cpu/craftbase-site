/*
 * CRAFT BASE — イベント申込フォーム（依存なし）
 * 送信先は form の data-endpoint（Google Apps Script のウェブアプリURL）。
 * data-endpoint が空のあいだは送信せず、送られる内容を画面に表示する（プレビュー）。
 */
(function () {
  'use strict';

  var form = document.getElementById('entry-form');
  if (!form) return;

  var endpoint = (form.dataset.endpoint || '').trim();
  var statusBox = form.querySelector('.form__status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var thanks = document.getElementById('entry-thanks');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var TEL_RE = /^[0-9０-９+\-－ー()（）\s]{10,20}$/;
  var AGE_RE = /^(1[5-9]|[2-9][0-9])$/; // 15〜99歳
  function toHalfWidth(s) {
    return String(s).replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); }).trim();
  }

  // ---- 業種「その他」 ----
  var industry = document.getElementById('f-industry');
  var otherWrap = document.getElementById('f-industry-other-wrap');
  var otherInput = document.getElementById('f-industry-other');
  function syncOther() {
    var on = industry.value === 'その他';
    otherWrap.hidden = !on;
    otherInput.required = on;
  }
  industry.addEventListener('change', syncOther);
  syncOther();

  // ---- 文字数カウンター ----
  form.querySelectorAll('[data-count-for]').forEach(function (el) {
    var target = document.getElementById(el.getAttribute('data-count-for'));
    var update = function () { el.textContent = target.value.length; };
    target.addEventListener('input', update);
    update();
  });

  // ---- 入力チェック ----
  function setError(field, message) {
    var holder = field.type === 'checkbox' ? field.closest('.ev-check') : field.closest('.form__row');
    if (!holder) return;
    holder.classList.toggle('is-invalid', !!message);
    var err = holder.querySelector('.form__error');
    if (message) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'form__error';
        var host = field.type === 'checkbox' ? holder
          : field.type === 'radio' ? field.closest('.form__radios').parentNode
          : field.closest('.form__age') ? field.closest('.form__age').parentNode
          : field.parentNode;
        host.appendChild(err);
      }
      err.textContent = message;
    } else if (err) {
      err.remove();
    }
  }

  function validateField(field) {
    if (field.type === 'radio') {
      var picked = form.querySelector('input[name="' + field.name + '"]:checked');
      setError(field, picked ? '' : '選択してください。');
      return !!picked;
    }
    var v = field.type === 'checkbox' ? field.checked : field.value.trim();
    var msg = '';
    if (field.required && !v) {
      msg = field.type === 'checkbox' ? '確認のうえ、チェックを入れてください。'
        : field.tagName === 'SELECT' ? '選択してください。' : '入力してください。';
    } else if (field.type === 'email' && v && !EMAIL_RE.test(v)) {
      msg = 'メールアドレスの形式をご確認ください。';
    } else if (field.type === 'tel' && v && !TEL_RE.test(v)) {
      msg = '電話番号の形式をご確認ください（ハイフン可）。';
    } else if (field.name === 'age' && v && !AGE_RE.test(toHalfWidth(v))) {
      msg = '年齢は数字でご記入ください（例：28）。';
    }
    setError(field, msg);
    return !msg;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll('input:not([type="hidden"]):not([name="website"]), select, textarea'));
  fields.forEach(function (f) {
    var onChange = f.type === 'checkbox' || f.type === 'radio' || f.tagName === 'SELECT';
    f.addEventListener(onChange ? 'change' : 'blur', function () { validateField(f); });
  });
  // ラジオボタンはグループごとに1回だけチェックする
  var seenRadio = {};
  fields = fields.filter(function (f) {
    if (f.type !== 'radio') return true;
    if (seenRadio[f.name]) return false;
    return (seenRadio[f.name] = true);
  });

  // ---- 送信データ ----
  function deviceType() {
    var w = window.innerWidth;
    return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  }

  function buildPayload() {
    var get = function (n) { var el = form.elements[n]; return el ? String(el.value).trim() : ''; };
    var ind = get('industry');
    if (ind === 'その他' && get('industry_other')) ind = 'その他：' + get('industry_other');

    var attr = (window.CBAttribution && window.CBAttribution.get()) || {};
    var first = attr.first || {};
    var last = attr.last || {};
    var ref = attr.ref || {};

    return {
      event_id: form.dataset.eventId || '',
      event_name: form.dataset.eventName || '',
      entry_type: get('entry_type'),
      name: get('name'),
      company: get('company'),
      industry: ind,
      position: get('position'),
      age: toHalfWidth(get('age')),
      email: get('email'),
      tel: get('tel'),
      intro: get('intro'),
      agree_use: form.elements.agree_use.checked ? 'yes' : '',
      agree_rules: form.elements.agree_rules.checked ? 'yes' : '',
      // 流入経路（直近の外部流入）
      utm_source: last.source || '',
      utm_medium: last.medium || '',
      utm_campaign: last.campaign || '',
      utm_content: last.content || '',
      utm_term: last.term || '',
      last_touch_at: last.at || '',
      referrer: last.referrer || '',
      landing_page: last.landing || '',
      // 初回接点
      first_source: first.source || '',
      first_medium: first.medium || '',
      first_campaign: first.campaign || '',
      first_touch_at: first.at || '',
      // サイト内導線
      entry_ref: ref.value || '',
      entry_ref_page: ref.page || '',
      page_url: location.origin + location.pathname + location.search,
      device: deviceType(),
      client_submitted_at: new Date().toISOString(),
      website: get('website') // honeypot
    };
  }

  function showStatus(type, html) {
    statusBox.hidden = false;
    statusBox.className = 'form__status is-' + type;
    statusBox.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstInvalid = null;
    fields.forEach(function (f) {
      if (f.offsetParent === null && f.type !== 'checkbox') return; // 非表示の欄（その他未選択時）は対象外
      if (!validateField(f) && !firstInvalid) firstInvalid = f;
    });
    if (firstInvalid) {
      showStatus('error', '未入力・確認が必要な項目があります。赤字の項目をご確認ください。');
      firstInvalid.focus();
      return;
    }

    var payload = buildPayload();

    if (!endpoint) {
      showStatus('preview',
        '<strong>プレビュー表示：</strong>送信先（スプレッドシート）が未設定のため、実際には送信していません。以下の内容が1行として記録されます。' +
        '<pre>' + escapeHtml(JSON.stringify(payload, null, 2)) + '</pre>');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '送信中…';
    statusBox.hidden = true;

    fetch(endpoint, { method: 'POST', body: new URLSearchParams(payload) })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.ok) throw new Error((data && data.error) || 'unknown');
        form.hidden = true;
        thanks.hidden = false;
        thanks.focus();
        thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'この内容で申し込む';
        showStatus('error', '送信できませんでした。通信環境をご確認のうえ、もう一度お試しください。解決しない場合は<a href="/contact.html?type=event#form">お問い合わせ</a>からご連絡ください。');
      });
  });

  // ---- スマホ用の固定申込ボタン（ヒーローを過ぎてからフォームに着くまで表示） ----
  var sticky = document.querySelector('.ev-sticky');
  var hero = document.querySelector('.ev-hero');
  var entry = document.getElementById('entry');
  if (sticky && hero && entry) {
    var syncSticky = function () {
      var pastHero = hero.getBoundingClientRect().bottom < 0;
      var beforeEntry = entry.getBoundingClientRect().top > window.innerHeight;
      sticky.classList.toggle('is-shown', pastHero && beforeEntry);
    };
    window.addEventListener('scroll', syncSticky, { passive: true });
    window.addEventListener('resize', syncSticky);
    syncSticky();
  }
})();
