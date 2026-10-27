/* CRAFT BASE Inc. — main script (no dependencies) */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // Header: border on scroll
  var header = document.querySelector('.header');
  var onScroll = function () {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var gnav = document.querySelector('.gnav');
  if (menuBtn && gnav) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      gnav.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
    };
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    gnav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  // Reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // News category filter
  var filterBtns = document.querySelectorAll('.filter__btn');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.dataset.filter;
      filterBtns.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      document.querySelectorAll('.news-item').forEach(function (item) {
        item.hidden = cat !== 'all' && item.dataset.cat !== cat;
      });
    });
  });

  // Contact form: preselect type from URL (?type=event) and toggle event fields
  var form = document.querySelector('.form');
  if (form) {
    var radios = form.querySelectorAll('input[name="type"]');
    var eventFields = form.querySelectorAll('.form__conditional');
    var sync = function () {
      var checked = form.querySelector('input[name="type"]:checked');
      var isEvent = checked && checked.value === 'event';
      eventFields.forEach(function (el) {
        el.hidden = !isEvent;
        el.querySelectorAll('input, select').forEach(function (f) { f.disabled = !isEvent; });
      });
    };
    var type = new URLSearchParams(location.search).get('type');
    if (type) {
      var target = form.querySelector('input[name="type"][value="' + type + '"]');
      if (target) target.checked = true;
    }
    radios.forEach(function (r) { r.addEventListener('change', sync); });
    sync();
  }

  // Footer year
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
