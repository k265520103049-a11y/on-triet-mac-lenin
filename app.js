/* Ôn tập Triết học Mác - Lênin (BAS 123)
 * Mã nguồn chuẩn - Giảng viên sửa đổi & nâng cấp Gameshow Truyền hình
 */
(function () {
  'use strict';

  var Q = window.QUESTIONS || [];
  var LETTERS = ['A', 'B', 'C', 'D'];
  var MIX_SIZE = 40;
  var STORE_KEY = 'mln-ontap-v1';

  /* ---------- Cấu trúc chương / mục ---------- */
  var CHAPTERS = {
    1: {
      title: 'Khái luận về triết học và triết học Mác – Lênin',
      sections: [
        { name: '1.1. Triết học và vấn đề cơ bản của triết học', from: 1, to: 49 },
        { name: '1.2. Triết học Mác - Lênin và vai trò trong đời sống xã hội', from: 50, to: 95 }
      ]
    },
    2: {
      title: 'Chủ nghĩa duy vật biện chứng',
      sections: [
        { name: '2.1. Vật chất, ý thức và mối quan hệ giữa vật chất và ý thức', from: 1, to: 79 },
        { name: '2.2. Phép biện chứng duy vật (2 nguyên lý, 6 cặp phạm trù, 3 quy luật)', from: 80, to: 199 },
        { name: '2.3. Lý luận nhận thức (nhận thức, thực tiễn, chân lý)', from: 200, to: 240 }
      ]
    },
    3: {
      title: 'Chủ nghĩa duy vật lịch sử',
      sections: [
        { name: '3.1. Học thuyết hình thái kinh tế - xã hội', from: 1, to: 74 },
        { name: '3.2. Giai cấp và dân tộc', from: 75, to: 139 },
        { name: '3.3. Nhà nước và cách mạng xã hội', from: 140, to: 188 },
        { name: '3.4. Ý thức xã hội', from: 189, to: 226 },
        { name: '3.5. Triết học Mác - Lênin về vấn đề con người', from: 227, to: 265 }
      ]
    }
  };

  var EXPLAIN = window.EXPLAIN || {};
  function explainBox(q) {
    return EXPLAIN[q.id] ? h('div', { class: 'explain' }, h('b', null, 'Giải thích: '), EXPLAIN[q.id]) : null;
  }

  var byId = {};
  Q.forEach(function (q) { byId[q.id] = q; });
  function chapterQs(ch) { return Q.filter(function (q) { return q.ch === ch; }); }

  /* ---------- Lưu trữ (localStorage) ---------- */
  function defaults() {
    return { wrong: {}, seen: {}, marks: {}, stats: {}, sessions: { practice: {}, mix: null }, settings: { shuffleOpts: true, theme: 'auto' } };
  }
  function norm(raw) {
    var d = defaults();
    raw = raw || {};
    d.wrong = raw.wrong || {};
    d.seen = raw.seen || {};
    d.marks = raw.marks || {};
    d.stats = raw.stats || {};
    if (raw.sessions) { d.sessions.practice = raw.sessions.practice || {}; d.sessions.mix = raw.sessions.mix || null; }
    d.settings = Object.assign(d.settings, raw.settings || {});
    return d;
  }
  function load() {
    try { return norm(JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); } catch (e) { return defaults(); }
  }
  var store = load();
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
    updateWrongBadge();
  }
  function record(q, ok) {
    if (ok) { store.seen[q.id] = 1; delete store.wrong[q.id]; }
    else store.wrong[q.id] = (store.wrong[q.id] || 0) + 1;
  }
  function stat(key) {
    if (!store.stats[key]) store.stats[key] = { runs: 0, completed: 0, bestStreak: 0, best: 0 };
    return store.stats[key];
  }

  /* ---------- Tiện ích ---------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function h(tag, attrs) {
    var e = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') e.className = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(e, arguments[i]);
    return e;
  }
  function append(parent, c) {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(parent, x); }); return; }
    parent.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }
  var app = document.getElementById('app');
  function mount(node, scroll) {
    app.replaceChildren(node);
    if (scroll !== false) window.scrollTo(0, 0);
  }
  function toast(msg) {
    var t = h('div', { class: 'toast', role: 'status' }, msg);
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }
  function fmtTime(ms) {
    var s = Math.floor(ms / 1000), m = Math.floor(s / 60);
    return (m < 10 ? '0' : '') + m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }
  function wrongIds() { return Object.keys(store.wrong).filter(function (id) { return byId[id]; }); }
  function updateWrongBadge() {
    var el = document.getElementById('wrongCount');
    if (el) el.textContent = wrongIds().length;
  }
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', store.settings.theme);
  }

  function noShuffle(q) {
    return q.o.some(function (t) {
      return /(tất cả|toàn bộ)\s*(các\s*)?(đáp án|phương án)|không có (đáp án|phương án)|cả hai|cả \d/i.test(t);
    });
  }
  function makeItem(q) {
    var order = [0, 1, 2, 3];
    if (store.settings.shuffleOpts && !noShuffle(q)) order = shuffle(order);
    return { q: q, order: order, picked: null };
  }
  function correctPos(it) { return it.order.indexOf(it.q.a); }

  /* ---------- Lưu / làm tiếp phần đang ôn dở ---------- */
  function serItems(items) {
    return items.map(function (it) { return { id: it.q.id, o: it.order, p: it.picked }; });
  }
  function desItems(arr) {
    return arr.filter(function (x) { return byId[x.id]; })
      .map(function (x) { return { q: byId[x.id], order: x.o, picked: x.p }; });
  }
  function answeredCount(items) {
    return items.filter(function (it) { return it.picked !== null; }).length;
  }
  function saveSession() {
    if (!S) return;
    if (S.view === 'practice' && answeredCount(S.items)) {
      store.sessions.practice[S.cfg.sid] = {
        cfg: { kind: S.cfg.kind, key: S.cfg.key, sid: S.cfg.sid, title: S.cfg.title,
               poolIds: S.cfg.pool.map(function (q) { return q.id; }) },
        items: serItems(S.items), i: S.i, right: S.right, wrong: S.wrong, streak: S.streak,
        best: S.best, wrongIds: S.wrongIds, runs: S.runs, ts: Date.now()
      };
      save();
    } else if (S.view === 'mix' && !S.submitted && answeredCount(S.items)) {
      store.sessions.mix = { items: serItems(S.items), i: S.i, elapsed: Date.now() - S.start, limit: S.limit || 0, ts: Date.now() };
      save();
    }
  }
  function dropPractice(sid) { delete store.sessions.practice[sid]; save(); }
  function dropMix() { store.sessions.mix = null; save(); }

  function resumePractice(sid) {
    var s = store.sessions.practice[sid];
    if (!s) return;
    var items = desItems(s.items);
    if (!items.length) { dropPractice(sid); toast('Dữ liệu cũ không còn hợp lệ.'); home(); return; }
    var cfg = { kind: s.cfg.kind, key: s.cfg.key, sid: s.cfg.sid, title: s.cfg.title, ordered: false,
                pool: s.cfg.poolIds.map(function (id) { return byId[id]; }).filter(Boolean) };
    S = { view: 'practice', cfg: cfg, items: items, i: Math.min(s.i, items.length - 1), right: s.right, wrong: s.wrong,
          streak: s.streak, best: s.best, wrongIds: s.wrongIds || [], runs: s.runs || 1 };
    renderPractice();
  }
  function resumeMix() {
    var s = store.sessions.mix;
    if (!s) return;
    var items = desItems(s.items);
    if (items.length !== MIX_SIZE) { dropMix(); toast('Đề cũ không còn hợp lệ.'); home(); return; }
    S = { view: 'mix', items: items, i: Math.min(s.i, items.length - 1), start: Date.now() - (s.elapsed || 0), submitted: false, limit: s.limit || 0 };
    renderMix();
    runMixTimer();
  }
  function pendingList(chOnly) {
    var list = [];
    Object.keys(store.sessions.practice).forEach(function (sid) {
      var s = store.sessions.practice[sid];
      if (chOnly && s.cfg.key !== 'ch' + chOnly) return;
      list.push({ type: 'practice', sid: sid, title: s.cfg.title, done: answeredCount(s.items), total: s.items.length,
                  extra: 'đúng ' + s.right + ' · sai ' + s.wrong, ts: s.ts || 0 });
    });
    if (!chOnly && store.sessions.mix) {
      var m = store.sessions.mix;
      list.push({ type: 'mix', title: 'Ôn tổng hợp ' + MIX_SIZE + ' câu', done: answeredCount(m.items), total: m.items.length,
                  extra: 'đã mất ' + fmtTime(m.elapsed || 0), ts: m.ts || 0 });
    }
    return list.sort(function (a, b) { return b.ts - a.ts; });
  }
  function pendingCard(p, after) {
    var go = function () { if (p.type === 'mix') resumeMix(); else resumePractice(p.sid); };
    var drop = function () {
      if (!confirm('Bỏ phần đang ôn dở "' + p.title + '"? Tiến độ của phần này sẽ mất.')) return;
      if (p.type === 'mix') dropMix(); else dropPractice(p.sid);
      after();
    };
    return h('div', { class: 'card pending' },
      h('div', { class: 'row between' },
        h('div', null,
          h('b', null, p.title),
          h('div', { class: 'meta muted small' }, 'Đã làm ' + p.done + '/' + p.total + ' câu · ' + p.extra)),
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', onclick: go }, '▶ Làm tiếp'),
          h('button', { class: 'btn ghost', onclick: drop, title: 'Bỏ phần này' }, 'Bỏ'))),
      h('div', { class: 'progress' }, h('span', { style: 'width:' + Math.round(p.done / p.total * 100) + '%' })));
  }

  function optionButton(it, k, state, onClick) {
    var cls = 'opt' + (state ? ' ' + state : '');
    return h('button', { class: cls, type: 'button', disabled: state.indexOf('locked') >= 0 ? true : null, onclick: onClick, 'data-k': k },
      h('span', { class: 'key' }, LETTERS[k]),
      h('span', { class: 'txt' }, it.q.o[it.order[k]]));
  }
  function qHeader(it, label) {
    return h('div', { class: 'qmeta' },
      h('span', { class: 'chip' }, 'Chương ' + it.q.ch + ' · Câu ' + it.q.n),
      h('span', { class: 'chip' }, 'Mức ' + it.q.lv),
      label ? h('span', { class: 'chip' }, label) : null,
      h('span', { class: 'spacer' }),
      markBtn(it.q));
  }

  /* ---------- Trạng thái hiện tại ---------- */
  var S = null;
  var timer = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  /* ---------- Cài đặt ---------- */
  function openSettings() {
    stopTimer();
    var themeSelect = h('select', { class: 'search', id: 'settingsTheme', onchange: function (e) {
      store.settings.theme = e.target.value;
      save();
      applyTheme();
    } },
      h('option', { value: 'light' }, 'Sáng'),
      h('option', { value: 'dark' }, 'Tối'),
      h('option', { value: 'auto' }, 'Theo thiết bị'));
    themeSelect.value = store.settings.theme || 'auto';
    var shuffleCheck = h('input', { type: 'checkbox', id: 'settingsShuffle', checked: store.settings.shuffleOpts ? true : null, onchange: function (e) {
      store.settings.shuffleOpts = e.target.checked;
      save();
    } });
    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' }, h('h1', null, '⚙️ Cài đặt'), h('button', { class: 'btn ghost', onclick: home }, '← Quay lại')),
      h('section', { class: 'card settings-card' },
        h('h2', null, 'Giao diện'),
        h('p', { class: 'muted' }, 'Chọn giao diện sáng, tối hoặc tự động theo thiết bị. Lựa chọn được lưu trên trình duyệt này.'),
        h('label', { class: 'settings-row', for: 'settingsTheme' }, h('span', null, 'Chế độ hiển thị'), themeSelect),
        h('div', { class: 'theme-preview-row' },
          h('button', { class: 'btn', onclick: function () { store.settings.theme = 'light'; save(); applyTheme(); themeSelect.value = 'light'; } }, '☀️ Sáng'),
          h('button', { class: 'btn', onclick: function () { store.settings.theme = 'dark'; save(); applyTheme(); themeSelect.value = 'dark'; } }, '🌙 Tối'),
          h('button', { class: 'btn', onclick: function () { store.settings.theme = 'auto'; save(); applyTheme(); themeSelect.value = 'auto'; } }, '💻 Theo thiết bị'))),
      h('section', { class: 'card settings-card' },
        h('h2', null, 'Cách làm bài'),
        h('label', { class: 'settings-row settings-check' }, shuffleCheck, h('span', null, h('b', null, 'Đảo thứ tự đáp án'), h('small', { class: 'muted' }, 'Mỗi lần làm bài, thứ tự các lựa chọn có thể thay đổi.')))),
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', onclick: home }, 'Hoàn tất'))));
  }

  /* ---------- Trang chủ ---------- */
  function home() {
    stopTimer(); S = null;
    var seenAll = Object.keys(store.seen).length;
    var cards = [1, 2, 3].map(function (ch) {
      var list = chapterQs(ch);
      var seen = list.filter(function (q) { return store.seen[q.id]; }).length;
      var st = stat('ch' + ch);
      return h('section', { class: 'card chapter' },
        h('div', { class: 'eyebrow' }, 'Chương ' + ch),
        h('h3', null, CHAPTERS[ch].title),
        h('div', { class: 'meta' }, list.length + ' câu · đã làm đúng ' + seen),
        h('div', { class: 'progress', title: seen + '/' + list.length },
          h('span', { style: 'width:' + Math.round(seen / list.length * 100) + '%' })),
        st.bestStreak ? h('div', { class: 'meta' }, 'Chuỗi đúng dài nhất: ' + st.bestStreak) : null,
        h('div', { class: 'actions' },
          h('button', { class: 'btn primary', onclick: function () { chapterMenu(ch); } }, 'Ôn chương ' + ch),
          pendingList(ch).length ? h('button', { class: 'btn', onclick: function () { chapterMenu(ch); } }, '▶ Có phần ôn dở') : null));
    });
    var mixStat = stat('mix');
    var limSel = h('select', { class: 'search', 'aria-label': 'Giới hạn thời gian', onchange: function (e) { store.settings.mixLimit = parseInt(e.target.value, 10); save(); } },
      h('option', { value: '0' }, 'Không giới hạn giờ'), h('option', { value: '20' }, 'Thi thử 20 phút'),
      h('option', { value: '30' }, 'Thi thử 30 phút'), h('option', { value: '45' }, 'Thi thử 45 phút'));
    limSel.value = String(store.settings.mixLimit || 0);
    var mix = h('section', { class: 'card mix' },
      h('div', { class: 'eyebrow' }, 'Ôn tổng hợp'),
      h('h3', null, MIX_SIZE + ' câu ngẫu nhiên từ cả 3 chương'),
      h('div', { class: 'meta' }, 'Làm như đi thi: chọn đáp án, nộp bài rồi xem điểm và đáp án. Mỗi lần bấm là một đề mới.' +
        (mixStat.runs ? ' · Đã làm ' + mixStat.runs + ' lần, điểm cao nhất ' + mixStat.best + '/' + MIX_SIZE : '')),
      h('div', { class: 'actions' },
        limSel,
        h('button', { class: 'btn primary big', onclick: function () { startMix(parseInt(limSel.value, 10)); } }, 'Bắt đầu đề ' + MIX_SIZE + ' câu')));

    var fun = h('section', { class: 'card wide' },
      h('div', { class: 'eyebrow' }, 'ĐẤU TRƯỜNG GAMESHOW TRUYỀN HÌNH'),
      h('h3', null, 'Thách thức tri thức - Chinh phục đỉnh cao'),
      h('div', { class: 'meta' }, 'Bốn gameshow: Ai là triệu phú, Đường lên đỉnh Olympia, Chiếc nón kỳ diệu và Jeopardy.'),
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary', onclick: function () { startMillionaire(); } }, '🏆 Ai là triệu phú'),
        h('button', { class: 'btn primary', onclick: function () { gameMenu(); } }, '📺 Chọn gameshow'),
        h('button', { class: 'btn primary', onclick: function () { startOlympia(); } }, '🏔️ Đỉnh Olympia')));
    var pend = pendingList();
    mount(h('div', { class: 'stack' },
      h('div', { class: 'hero' },
        h('h1', null, 'Ôn tập Triết học Mác - Lênin'),
        h('p', null, 'Ngân hàng ' + Q.length + ' câu trắc nghiệm, chia theo chương. Luyện tập theo chương, đề thi tổng hợp và Gameshow truyền hình kịch tính.'),
        h('div', { class: 'progress', title: 'Tiến độ chung' },
          h('span', { style: 'width:' + Math.round(seenAll / Q.length * 100) + '%' })),
        h('div', { class: 'small muted' }, 'Đã làm đúng ' + seenAll + '/' + Q.length + ' câu (lưu trên trình duyệt này)')),
      pend.length ? h('section', { class: 'stack' }, h('h2', null, 'Đang ôn dở'), pend.map(function (p) { return pendingCard(p, home); })) : null,
      h('div', { class: 'grid' }, cards, mix, fun)));
  }

  /* ---------- Menu chọn phạm vi ôn chương ---------- */
  function chapterMenu(ch) {
    stopTimer(); S = null;
    var info = CHAPTERS[ch];
    var list = chapterQs(ch);
    var choices = [{ label: 'Cả chương ' + ch, count: list.length, from: 1, to: 9999 }].concat(
      info.sections.map(function (s) { return { label: s.name, count: s.to - s.from + 1, from: s.from, to: s.to }; }));
    var chosen = 0;
    var orderRandom = true;
    var radios = choices.map(function (c, i) {
      return h('label', { class: 'choice' },
        h('input', { type: 'radio', name: 'scope', value: i, checked: i === 0 ? true : null, onchange: function () { chosen = i; } }),
        h('span', null, h('b', null, c.label), h('span', { class: 'muted' }, ' · ' + c.count + ' câu')));
    });
    var start = function () {
      var c = choices[chosen];
      var pool = list.filter(function (q) { return q.n >= c.from && q.n <= c.to; });
      var sid = 'ch' + ch + '-' + chosen;
      if (store.sessions.practice[sid] && !confirm('Phạm vi này đang ôn dở. Bắt đầu lại sẽ xoá tiến độ cũ. Tiếp tục bắt đầu lại?')) return;
      startPractice({ kind: 'chapter', key: 'ch' + ch, sid: sid, title: 'Chương ' + ch + (chosen ? ' · mục ' + info.sections[chosen - 1].name.split(' ')[0].replace(/\.$/, '') : ''), pool: pool, ordered: !orderRandom });
    };
    mount(h('div', { class: 'stack' },
      h('button', { class: 'btn ghost', onclick: home }, '← Trang chủ'),
      h('h1', null, 'Chương ' + ch + ': ' + info.title),
      pendingList(ch).length ? h('section', { class: 'stack' }, h('h3', null, 'Đang ôn dở'), pendingList(ch).map(function (p) { return pendingCard(p, function () { chapterMenu(ch); }); })) : null,
      h('div', { class: 'card' },
        h('h3', null, 'Chọn phạm vi'),
        h('div', { class: 'menu-list' }, radios),
        h('h3', null, 'Thứ tự câu hỏi'),
        h('div', { class: 'menu-list' },
          h('label', { class: 'choice' },
            h('input', { type: 'radio', name: 'order', checked: true, onchange: function () { orderRandom = true; } }),
            h('span', null, h('b', null, 'Ngẫu nhiên'), h('span', { class: 'muted' }, ' · xáo thứ tự mỗi lần làm'))),
          h('label', { class: 'choice' },
            h('input', { type: 'radio', name: 'order', onchange: function () { orderRandom = false; } }),
            h('span', null, h('b', null, 'Theo thứ tự đề'), h('span', { class: 'muted' }, ' · lần làm lại từ đầu vẫn sẽ xáo ngẫu nhiên')))),
        h('button', { class: 'btn primary big', onclick: start }, 'Bắt đầu ôn mới'))));
  }

  /* ---------- Ôn chương / ôn câu sai ---------- */
  function startPractice(cfg) {
    if (!cfg.pool.length) { toast('Không có câu nào để ôn.'); return; }
    var pool = cfg.ordered ? cfg.pool.slice() : shuffle(cfg.pool);
    S = { view: 'practice', cfg: cfg, items: pool.map(makeItem), i: 0, right: 0, wrong: 0, streak: 0, best: 0, wrongIds: [], runs: 1 };
    delete store.sessions.practice[cfg.sid];
    stat(cfg.key).runs++; save();
    renderPractice();
  }
  function restartPractice() {
    S.items = shuffle(S.cfg.pool).map(makeItem);
    S.i = 0; S.right = 0; S.wrong = 0; S.streak = 0; S.wrongIds = []; S.runs++;
    delete store.sessions.practice[S.cfg.sid];
    stat(S.cfg.key).runs++; save();
    renderPractice();
  }
  function pickPractice(k) {
    var it = S.items[S.i];
    if (it.picked !== null) return;
    it.picked = k;
    var ok = it.order[k] === it.q.a;
    record(it.q, ok);
    if (ok) {
      S.right++; S.streak++;
      if (S.streak > S.best) S.best = S.streak;
      var st = stat(S.cfg.key);
      if (S.best > st.bestStreak) st.bestStreak = S.best;
    } else {
      S.wrong++; S.streak = 0;
      if (S.wrongIds.indexOf(it.q.id) < 0) S.wrongIds.push(it.q.id);
    }
    save();
    renderPractice(false);
  }
  function nextPractice() {
    var it = S.items[S.i];
    if (it.picked === null) return;
    if (S.i + 1 < S.items.length) { S.i++; renderPractice(); }
    else finishPractice();
  }
  function renderPractice(scroll) {
    saveSession();
    var it = S.items[S.i];
    var total = S.items.length;
    var answered = it.picked !== null;
    var ok = answered && it.order[it.picked] === it.q.a;
    var cp = correctPos(it);

    var opts = [0, 1, 2, 3].map(function (k) {
      var state = '';
      if (answered) {
        if (k === cp) state = 'correct';
        else if (k === it.picked) state = 'wrong';
        else state = 'dim';
        state += ' locked';
      }
      var b = optionButton(it, k, state.trim(), function () { pickPractice(k); });
      if (answered) { b.setAttribute('disabled', ''); b.classList.remove('locked'); }
      return b;
    });

    var feedback = null;
    if (answered) {
      var isLast = S.i + 1 >= total;
      if (ok) {
        feedback = h('div', { class: 'feedback ok' },
          h('b', null, '✔ Chính xác!'), explainBox(it.q),
          h('div', { class: 'row' },
            h('button', { class: 'btn primary', id: 'nextBtn', onclick: nextPractice }, isLast ? 'Xem kết quả' : 'Câu tiếp theo →')));
      } else {
        feedback = h('div', { class: 'feedback bad' },
          h('b', null, '✘ Chưa đúng. Đáp án đúng là ' + LETTERS[cp] + '.'), explainBox(it.q),
          h('div', { class: 'row' },
            S.cfg.kind === 'chapter'
              ? h('button', { class: 'btn primary', id: 'restartBtn', onclick: restartPractice }, '↻ Làm lại từ đầu (xáo ngẫu nhiên)')
              : null,
            h('button', { class: 'btn', id: 'nextBtn', onclick: nextPractice }, isLast ? 'Xem kết quả' : (S.cfg.kind === 'chapter' ? 'Bỏ qua, làm tiếp →' : 'Câu tiếp theo →'))));
      }
    }

    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' },
        h('div', null, h('b', null, S.cfg.title), S.runs > 1 ? h('span', { class: 'muted' }, ' · lần ' + S.runs) : null),
        h('button', { class: 'btn ghost', onclick: function () { saveSession(); home(); toast('Đã lưu. Bạn có thể làm tiếp ở Trang chủ.'); } }, 'Lưu & thoát')),
      h('div', { class: 'progress' }, h('span', { style: 'width:' + Math.round(S.i / total * 100) + '%' })),
      h('div', { class: 'hud' },
        h('div', { class: 'stats' },
          h('span', null, 'Câu ', h('b', null, S.i + 1 + '/' + total)),
          h('span', { class: 'ok-t' }, 'Đúng ', h('b', null, S.right)),
          h('span', { class: 'bad-t' }, 'Sai ', h('b', null, S.wrong)),
          h('span', null, 'Chuỗi đúng ', h('b', null, S.streak)))),
      h('div', { class: 'card qcard' },
        qHeader(it),
        h('div', { class: 'qtext' }, it.q.q),
        h('div', { class: 'opts' }, opts),
        feedback)), scroll);
    var f = document.getElementById(answered && !ok && S.cfg.kind === 'chapter' ? 'restartBtn' : 'nextBtn');
    if (f && answered) f.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function finishPractice() {
    var st = stat(S.cfg.key);
    st.completed++;
    delete store.sessions.practice[S.cfg.sid]; save();
    var total = S.items.length;
    var perfect = S.wrong === 0;
    var wrongList = S.wrongIds.map(function (id) { return byId[id]; });
    mount(h('div', { class: 'stack' },
      h('div', { class: 'card score' },
        h('div', { class: 'muted' }, S.cfg.title),
        h('div', { class: 'big' }, S.right + '/' + total),
        h('p', null, perfect ? 'Tuyệt vời! Bạn làm đúng toàn bộ.' : 'Bạn sai ' + S.wrong + ' câu trong lượt này.'),
        h('div', { class: 'row', style: 'justify-content:center' },
          h('button', { class: 'btn primary', onclick: restartPractice }, '↻ Làm lại từ đầu (ngẫu nhiên)'),
          wrongList.length ? h('button', { class: 'btn', onclick: startWrongBank }, 'Ôn các câu sai') : null,
          h('button', { class: 'btn', onclick: home }, 'Trang chủ'))),
      wrongList.length ? h('h2', null, 'Các câu sai trong lượt này') : null,
      wrongList.map(function (q) { return reviewCard(q, null); })));
  }

  function startWrongBank() {
    var ids = wrongIds();
    if (!ids.length) { toast('Chưa có câu sai nào. Cứ làm tiếp nhé!'); return; }
    startPractice({ kind: 'wrong', key: 'wrong', sid: 'wrong', title: 'Ôn các câu đã sai (' + ids.length + ')', pool: ids.map(function (id) { return byId[id]; }), ordered: false });
  }

  /* ---------- Ôn tổng hợp (đề 40 câu) ---------- */
  function startMix(limitMin) {
    if (typeof limitMin !== 'number') limitMin = store.settings.mixLimit || 0;
    var pool = shuffle(Q).slice(0, MIX_SIZE);
    S = { view: 'mix', items: pool.map(makeItem), i: 0, start: Date.now(), submitted: false, limit: limitMin * 60000 };
    dropMix();
    renderMix();
    runMixTimer();
  }
  function runMixTimer() {
    stopTimer();
    timer = setInterval(function () {
      var el = document.getElementById('timer');
      if (!S || S.view !== 'mix' || S.submitted) return;
      if (el) el.textContent = mixClock();
      if (S.limit && Date.now() - S.start >= S.limit) { toast('Hết giờ! Bài được nộp tự động.'); submitMix(true); }
    }, 1000);
  }
  function mixClock() {
    var used = Date.now() - S.start;
    return S.limit ? fmtTime(Math.max(0, S.limit - used)) : fmtTime(used);
  }
  function pickMix(k) {
    S.items[S.i].picked = k;
    renderMix(false);
  }
  function mixNavDots() {
    return S.items.map(function (it, i) {
      var cls = 'nav-dot' + (it.picked !== null ? ' answered' : '') + (i === S.i ? ' current' : '');
      return h('button', { class: cls, type: 'button', title: 'Câu ' + (i + 1), onclick: function () { S.i = i; renderMix(); } }, i + 1);
    });
  }
  function renderMix(scroll) {
    saveSession();
    var it = S.items[S.i];
    var done = S.items.filter(function (x) { return x.picked !== null; }).length;
    var opts = [0, 1, 2, 3].map(function (k) {
      return optionButton(it, k, it.picked === k ? 'selected' : '', function () { pickMix(k); });
    });
    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' },
        h('div', null, h('b', null, 'Ôn tổng hợp · ' + MIX_SIZE + ' câu')),
        h('div', { class: 'stats' },
          h('span', { class: S.limit && S.limit - (Date.now() - S.start) < 300000 ? 'bad-t' : null }, S.limit ? '⏳ Còn ' : '⏱ ', h('b', { id: 'timer' }, mixClock())),
          h('span', null, 'Đã trả lời ', h('b', null, done + '/' + MIX_SIZE)))),
      h('div', { class: 'navgrid' }, mixNavDots()),
      h('div', { class: 'card qcard' },
        qHeader(it, 'Câu ' + (S.i + 1) + '/' + MIX_SIZE + ' của đề'),
        h('div', { class: 'qtext' }, it.q.q),
        h('div', { class: 'opts' }, opts)),
      h('div', { class: 'row between' },
        h('button', { class: 'btn', disabled: S.i === 0 ? true : null, onclick: function () { S.i--; renderMix(); } }, '← Câu trước'),
        S.i + 1 < MIX_SIZE
          ? h('button', { class: 'btn', onclick: function () { S.i++; renderMix(); } }, 'Câu sau →')
          : h('button', { class: 'btn primary', onclick: submitMix }, 'Nộp bài')),
      h('div', { class: 'row', style: 'justify-content:center' },
        h('button', { class: 'btn primary big', onclick: submitMix }, 'Nộp bài'),
        h('button', { class: 'btn', onclick: function () { saveSession(); home(); toast('Đã lưu đề. Bạn có thể làm tiếp ở Trang chủ.'); } }, 'Lưu & thoát'),
        h('button', { class: 'btn ghost', onclick: function () { if (confirm('Bỏ đề này? Tiến độ đề sẽ mất.')) { dropMix(); home(); } } }, 'Bỏ đề'))), scroll);
  }
  function submitMix(auto) {
    var left = S.items.filter(function (x) { return x.picked === null; }).length;
    if (auto !== true && left && !confirm('Còn ' + left + ' câu chưa trả lời (tính là sai). Vẫn nộp bài?')) return;
    S.submitted = true; stopTimer(); store.sessions.mix = null;
    var right = 0;
    S.items.forEach(function (it) {
      var ok = it.picked !== null && it.order[it.picked] === it.q.a;
      if (ok) right++;
      record(it.q, ok);
    });
    S.right = right; S.elapsed = S.limit ? Math.min(Date.now() - S.start, S.limit) : Date.now() - S.start;
    var st = stat('mix'); st.runs++; st.completed++; if (right > st.best) st.best = right;
    save();
    renderMixResult('all');
  }
  function renderMixResult(filter) {
    var list = S.items.filter(function (it) {
      var ok = it.picked !== null && it.order[it.picked] === it.q.a;
      return filter === 'all' || (filter === 'wrong' && !ok);
    });
    var score10 = (S.right / MIX_SIZE * 10).toFixed(2).replace(/\.?0+$/, '');
    var dots = S.items.map(function (it, i) {
      var ok = it.picked !== null && it.order[it.picked] === it.q.a;
      return h('span', { class: 'nav-dot ' + (ok ? 'r-ok' : 'r-bad'), style: 'display:grid;place-items:center;cursor:default', title: 'Câu ' + (i + 1) }, i + 1);
    });
    mount(h('div', { class: 'stack' },
      h('div', { class: 'card score' },
        h('div', { class: 'muted' }, 'Kết quả ôn tổng hợp · thời gian ' + fmtTime(S.elapsed)),
        h('div', { class: 'big' }, S.right + '/' + MIX_SIZE),
        h('p', null, 'Quy đổi thang 10: ', h('b', null, score10), ' điểm (mỗi câu 0,25 điểm)'),
        h('div', { class: 'navgrid', style: 'justify-content:center' }, dots),
        h('div', { class: 'row', style: 'justify-content:center' },
          h('button', { class: 'btn primary', onclick: function () { startMix(); } }, 'Làm đề mới'),
          h('button', { class: 'btn', onclick: startWrongBank }, 'Ôn các câu sai'),
          h('button', { class: 'btn', onclick: home }, 'Trang chủ'))),
      h('div', { class: 'row' },
        h('h2', { style: 'margin:0' }, 'Xem lại bài làm'),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn' + (filter === 'all' ? ' primary' : ''), onclick: function () { renderMixResult('all'); } }, 'Tất cả'),
        h('button', { class: 'btn' + (filter === 'wrong' ? ' primary' : ''), onclick: function () { renderMixResult('wrong'); } }, 'Chỉ câu sai')),
      list.length ? list.map(function (it) { return reviewCard(it.q, it); }) : h('p', { class: 'muted' }, 'Không có câu nào để hiển thị.')));
  }

  function reviewCard(q, it, extra) {
    var opts = [0, 1, 2, 3].map(function (k) {
      var cls = 'opt';
      var origIdx = it ? it.order[k] : k;
      if (origIdx === q.a) cls += ' correct';
      else if (it && it.picked === k) cls += ' wrong';
      return h('div', { class: cls },
        h('span', { class: 'key' }, LETTERS[k]),
        h('span', { class: 'txt' }, q.o[origIdx]));
    });
    var status = null;
    if (it) {
      var ok = it.picked !== null && it.order[it.picked] === q.a;
      status = h('span', { class: ok ? 'ok-t' : 'bad-t' }, it.picked === null ? '✘ Chưa trả lời' : (ok ? '✔ Đúng' : '✘ Sai'));
    }
    return h('div', { class: 'card review-item' },
      h('div', { class: 'qmeta' },
        h('span', { class: 'chip' }, 'Chương ' + q.ch + ' · Câu ' + q.n), status,
        h('span', { class: 'spacer' }), extra, markBtn(q)),
      h('div', { class: 'qtext' }, q.q),
      h('div', { class: 'opts' }, opts),
      explainBox(q));
  }

  /* ---------- Tra cứu ---------- */
  function normalize(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  var normCache = null;

  /* ---------- ÔN LÝ THUYẾT: mẹo nhớ và ví dụ trực quan ---------- */
  function theoryPage() {
    stopTimer(); S = null;
    var all = window.THEORY || [];
    var chapter = 0;
    var query = h('input', { class: 'search', type: 'search',
      placeholder: 'Tìm khái niệm, mẹo nhớ hoặc ví dụ...', 'aria-label': 'Tìm lý thuyết' });
    var tabs = h('div', { class: 'actions theory-tabs' });
    var results = h('div', { class: 'stack theory-list' });
    function render() {
      results.replaceChildren();
      var key = normalize(query.value.trim());
      var found = all.filter(function (item) {
        return (!chapter || item.ch === chapter) &&
          (!key || normalize(item.title + ' ' + item.summary + ' ' + item.tip + ' ' + item.example + ' ' + item.trap + ' ' + item.keywords).indexOf(key) >= 0);
      });
      results.appendChild(h('p', { class: 'muted small' },
        'Có ' + found.length + ' chủ đề phù hợp. Nội dung cô đọng theo các khái niệm thường xuất hiện trong ngân hàng 600 câu.'));
      found.forEach(function (item) {
        results.appendChild(h('article', { class: 'card theory-card' },
          h('div', { class: 'eyebrow' }, 'CHƯƠNG ' + item.ch),
          h('h3', null, item.title),
          h('p', null, item.summary),
          h('div', { class: 'theory-block tip' }, h('strong', null, '🧠 Mẹo dễ nhớ'), h('p', null, item.tip)),
          h('div', { class: 'theory-block example' }, h('strong', null, '💡 Ví dụ trực quan'), h('p', null, item.example)),
          h('div', { class: 'theory-block trap' }, h('strong', null, '⚠️ Dễ nhầm'), h('p', null, item.trap)),
          h('div', { class: 'meta small' }, 'Từ khóa: ' + item.keywords)));
      });
      if (!found.length) results.appendChild(h('div', { class: 'card' }, 'Không tìm thấy chủ đề. Thử từ khóa ngắn hơn hoặc chọn chương khác.'));
    }
    [0,1,2,3].forEach(function (ch) {
      var b = h('button', { class: 'btn ' + (chapter === ch ? 'primary' : 'ghost'), type: 'button',
        onclick: function () { chapter = ch; Array.prototype.forEach.call(tabs.children, function (el) {
          el.classList.toggle('primary', el.dataset.chapter === String(ch));
          el.classList.toggle('ghost', el.dataset.chapter !== String(ch));
        }); render(); } }, ch ? 'Chương ' + ch : 'Tất cả');
      b.dataset.chapter = String(ch);
      tabs.appendChild(b);
    });
    query.addEventListener('input', render);
    mount(h('div', { class: 'stack' },
      h('div', { class: 'card theory-intro' },
        h('div', { class: 'eyebrow' }, 'HỌC HIỂU · NHỚ LÂU · VẬN DỤNG'),
        h('h1', null, 'Ôn lý thuyết Triết học Mác – Lênin'),
        h('p', null, 'Mỗi chủ đề gồm ý cốt lõi, mẹo nhớ nhanh, ví dụ đời sống/kỹ thuật và điểm dễ nhầm khi làm trắc nghiệm. Đây là tài liệu ôn tập tóm lược, không thay thế giáo trình chính thức.')),
      h('div', { class: 'row theory-search' }, query),
      tabs, results));
    render();
  }

  function browse() {
    stopTimer(); S = null;
    if (!normCache) {
      normCache = Q.map(function (q) { return normalize(q.q + ' ' + q.o.join(' ')); });
    }
    var chSel = h('select', { class: 'search', 'aria-label': 'Lọc theo chương' },
      h('option', { value: '0' }, 'Tất cả chương'),
      h('option', { value: '1' }, 'Chương 1'), h('option', { value: '2' }, 'Chương 2'), h('option', { value: '3' }, 'Chương 3'));
    var input = h('input', { class: 'search', type: 'search', placeholder: 'Gõ từ khoá (ví dụ: vật chất, giai cấp...)', 'aria-label': 'Tìm câu hỏi' });
    var out = h('div', { class: 'stack' });
    var run = function () {
      var kw = normalize(input.value.trim());
      var ch = parseInt(chSel.value, 10);
      var res = [];
      for (var i = 0; i < Q.length && res.length < 40; i++) {
        if (ch && Q[i].ch !== ch) continue;
        if (kw && normCache[i].indexOf(kw) < 0) continue;
        res.push(Q[i]);
      }
      var nodes = [h('p', { class: 'muted small' }, kw || ch ? 'Hiển thị tối đa 40 kết quả đầu tiên: ' + res.length + ' câu.' : 'Nhập từ khoá hoặc chọn chương để xem câu hỏi cùng đáp án đúng.')];
      if (kw || ch) res.forEach(function (q) { nodes.push(reviewCard(q, null)); });
      out.replaceChildren.apply(out, nodes);
    };
    var tid = null;
    input.addEventListener('input', function () { clearTimeout(tid); tid = setTimeout(run, 150); });
    chSel.addEventListener('change', run);
    mount(h('div', { class: 'stack' },
      h('h1', null, 'Tra cứu câu hỏi'),
      h('div', { class: 'row' }, input, chSel),
      out));
    run();
    input.focus();
  }

  function markIds() { return Object.keys(store.marks).filter(function (id) { return byId[id]; }); }
  function markBtn(q) {
    var b = h('button', { class: 'btn ghost star' + (store.marks[q.id] ? ' on' : ''), type: 'button',
      title: 'Đánh dấu câu này để xem lại sau', 'aria-label': 'Đánh dấu câu hỏi',
      onclick: function (e) {
        e.stopPropagation();
        if (store.marks[q.id]) delete store.marks[q.id]; else store.marks[q.id] = 1;
        save();
        b.classList.toggle('on', !!store.marks[q.id]);
        b.textContent = store.marks[q.id] ? '★' : '☆';
        b.blur();
      } }, store.marks[q.id] ? '★' : '☆');
    return b;
  }
  function startMarks() {
    var ids = markIds();
    if (!ids.length) { toast('Chưa đánh dấu câu nào. Bấm ☆ ở góc câu hỏi để đánh dấu.'); return; }
    startPractice({ kind: 'marks', key: 'marks', sid: 'marks', title: 'Ôn câu đã đánh dấu (' + ids.length + ')',
      pool: ids.map(function (id) { return byId[id]; }), ordered: false });
  }
  function byOrder(a, b) { return a.ch - b.ch || a.n - b.n; }

  function reviewPage(tab, keepScroll) {
    stopTimer(); S = null;
    tab = tab || 'wrong';
    var isWrong = tab === 'wrong';
    var list = (isWrong ? wrongIds() : markIds()).map(function (id) { return byId[id]; }).sort(byOrder);
    var tabBtn = function (t, label, n) {
      return h('button', { class: 'btn' + (t === tab ? ' primary' : ''), onclick: function () { reviewPage(t); } }, label + ' (' + n + ')');
    };
    var cards = list.map(function (q) {
      var extra = isWrong
        ? [h('span', { class: 'chip' }, 'sai ' + store.wrong[q.id] + ' lần'),
           h('button', { class: 'btn', title: 'Xoá khỏi danh sách câu sai', onclick: function () {
             delete store.wrong[q.id]; save(); reviewPage('wrong', true); } }, 'Xoá')]
        : null;
      return reviewCard(q, null, extra);
    });
    mount(h('div', { class: 'stack' },
      h('h1', null, 'Câu sai & câu đã đánh dấu'),
      h('div', { class: 'row' }, tabBtn('wrong', 'Câu sai', wrongIds().length), tabBtn('marks', '★ Đã đánh dấu', markIds().length)),
      list.length
        ? h('div', { class: 'row' },
            h('button', { class: 'btn primary', onclick: isWrong ? startWrongBank : startMarks }, '▶ Ôn ' + list.length + ' câu này'),
            isWrong ? h('button', { class: 'btn', onclick: function () {
              if (confirm('Xoá toàn bộ ' + list.length + ' câu khỏi danh sách câu sai?')) { store.wrong = {}; save(); reviewPage('wrong', true); }
            } }, 'Xoá tất cả') : null)
        : null,
      isWrong ? h('p', { class: 'muted small' }, 'Làm đúng một câu từng sai sẽ tự động xoá câu đó khỏi danh sách.') : null,
      list.length ? cards : h('p', { class: 'muted' }, isWrong ? 'Chưa có câu sai nào. Tuyệt vời!' : 'Chưa đánh dấu câu nào. Bấm ☆ ở góc câu hỏi để đánh dấu.')),
      keepScroll ? false : true);
  }

  /* ---------- Thống kê ---------- */
  function barRow(label, a, b, extra) {
    var pct = b ? Math.round(a / b * 100) : 0;
    return h('div', { class: 'barrow' },
      h('div', { class: 'row between small' }, h('span', null, label), h('span', { class: 'muted' }, a + '/' + b + ' (' + pct + '%)' + (extra || ''))),
      h('div', { class: 'progress' }, h('span', { style: 'width:' + pct + '%' })));
  }
  function statsPage() {
    stopTimer(); S = null;
    var seenAll = Q.filter(function (q) { return store.seen[q.id]; }).length;
    var blocks = [1, 2, 3].map(function (ch) {
      var list = chapterQs(ch);
      var rows = CHAPTERS[ch].sections.map(function (s) {
        var pool = list.filter(function (q) { return q.n >= s.from && q.n <= s.to; });
        var seen = pool.filter(function (q) { return store.seen[q.id]; }).length;
        var wr = pool.filter(function (q) { return store.wrong[q.id]; }).length;
        return barRow(s.name, seen, pool.length, wr ? ' · đang sai ' + wr : '');
      });
      var st = stat('ch' + ch);
      return h('div', { class: 'card stack' },
        h('h3', null, 'Chương ' + ch + ': ' + CHAPTERS[ch].title),
        h('div', { class: 'muted small' }, 'Đã bắt đầu ôn ' + st.runs + ' lần · hoàn thành ' + st.completed + ' lần · chuỗi đúng dài nhất ' + st.bestStreak),
        rows);
    });
    var top = wrongIds().sort(function (a, b) { return store.wrong[b] - store.wrong[a]; }).slice(0, 10).map(function (id) {
      var q = byId[id];
      return h('div', { class: 'toprow' },
        h('span', { class: 'chip' }, 'C' + q.ch + '.' + q.n),
        h('span', { class: 'toptxt' }, q.q),
        h('span', { class: 'bad-t small' }, 'sai ' + store.wrong[id] + ' lần'));
    });
    var mx = stat('mix'), mil = stat('millionaire'), oly = stat('olympia'), wheel = stat('wheel'), jeopardy = stat('jeopardy');
    mount(h('div', { class: 'stack' },
      h('h1', null, 'Thống kê'),
      h('div', { class: 'card stack' },
        barRow('Tổng tiến độ (đã làm đúng)', seenAll, Q.length),
        h('div', { class: 'muted small' },
          'Đang có ' + wrongIds().length + ' câu sai · ' + markIds().length + ' câu đã đánh dấu · ' +
          'Triệu phú: kỷ lục ' + (mil.best ? mil.best.toLocaleString() + ' đ' : 'Chưa chơi') + ' · ' +
          'Olympia: kỷ lục ' + oly.best + ' điểm · ' +
          'Chiếc Nón: kỷ lục ' + wheel.best + ' điểm · Jeopardy: kỷ lục ' + jeopardy.best + ' điểm')),
      blocks,
      h('div', { class: 'card stack' },
        h('h3', null, 'Câu hay sai nhất'),
        top.length ? top : h('p', { class: 'muted' }, 'Chưa có dữ liệu.'))));
  }

  /* ==========================================================================
   * 🏆 ĐẤU TRƯỜNG GAMESHOW TRUYỀN HÌNH NỔI TIẾNG
   * ========================================================================== */

  function gameMenu() {
    stopTimer(); S = null;
    var mil = stat('millionaire'), oly = stat('olympia'), wheel = stat('wheel'), jeopardy = stat('jeopardy');
    mount(h('div', { class: 'stack' },
      h('button', { class: 'btn ghost', onclick: home }, '← Trang chủ'),
      h('h1', null, '📺 Đấu Trường Gameshow Triết Học'),
      h('p', { class: 'muted' }, 'Bốn gameshow với cách chơi khác nhau: chinh phục tiền thưởng, bốn vòng Olympia, vòng quay điểm thưởng/phạt và bảng câu hỏi Jeopardy.'),
      h('div', { class: 'grid game-grid' },
        gameCard('🏆 Ai Là Triệu Phú', '15 câu hỏi tăng dần độ khó, thang tiền thưởng và 3 quyền trợ giúp.',
          mil.best ? 'Kỷ lục: ' + mil.best.toLocaleString() + ' VNĐ · ' + mil.runs + ' lượt' : 'Chưa chơi', startMillionaire),
        gameCard('🏔️ Đường Lên Đỉnh Olympia', 'Đủ 4 phần: Khởi động, Vượt chướng ngại vật, Tăng tốc biến tấu và Về đích.',
          oly.best ? 'Kỷ lục: ' + oly.best + ' điểm · ' + oly.runs + ' lượt' : 'Chưa chơi', startOlympia),
        gameCard('🎡 Chiếc Nón Kỳ Diệu', 'Quay vòng để nhận điểm thưởng, điểm phạt hoặc lượt thêm rồi trả lời câu hỏi ngẫu nhiên.',
          wheel.best ? 'Kỷ lục: ' + wheel.best + ' điểm · ' + wheel.runs + ' lượt' : 'Chưa chơi', startWheel),
        gameCard('🟦 Jeopardy Triết Học', 'Chọn ô điểm trên bảng chủ đề. Trả lời đúng cộng điểm, sai bị trừ điểm.',
          jeopardy.best ? 'Kỷ lục: ' + jeopardy.best + ' điểm · ' + jeopardy.runs + ' lượt' : 'Chưa chơi', startJeopardy))));
  }

  function gameCard(title, desc, meta, fn) {
    return h('div', { class: 'card gcard' },
      h('h3', null, title), h('p', { class: 'muted small' }, desc),
      meta ? h('div', { class: 'meta small' }, meta) : null,
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', onclick: fn }, 'Bắt đầu tham gia')));
  }

  /* --------------------------------------------------------------------------
   * GAMESHOW 1: AI LÀ TRIỆU PHÚ TRIẾT HỌC
   * -------------------------------------------------------------------------- */
  var MIL_PRIZES = [
    200000, 400000, 600000, 1000000, 2000000,      // Mốc 5 (An toàn 1)
    3000000, 6000000, 10000000, 14000000, 22000000, // Mốc 10 (An toàn 2)
    30000000, 40000000, 60000000, 85000000, 150000000 // Mốc 15 (Vô địch)
  ];

  function startMillionaire() {
    stopTimer();
    // Tạo bộ câu hỏi 15 câu phân loại theo độ khó lv (1..6) trong questions.js
    var pool = [];
    var easy = shuffle(Q.filter(function (q) { return q.lv <= 2; }));
    var med = shuffle(Q.filter(function (q) { return q.lv >= 3 && q.lv <= 4; }));
    var hard = shuffle(Q.filter(function (q) { return q.lv >= 5; }));

    for (var i = 0; i < 5; i++) pool.push(easy[i] || Q[i]);
    for (var j = 0; j < 5; j++) pool.push(med[j] || Q[j + 5]);
    for (var k = 0; k < 5; k++) pool.push(hard[k] || Q[k + 10]);

    S = {
      view: 'millionaire',
      items: pool.map(makeItem),
      level: 0,
      lifelines: { f50: true, audience: true, expert: true },
      hiddenOpts: [],
      modalInfo: null,
      locked: false,
      won: false
    };
    renderMillionaire();
  }

  function renderMillionaire() {
    var it = S.items[S.level];
    var cp = correctPos(it);
    var prize = MIL_PRIZES[S.level];

    // Thang tiền thưởng
    var ladderNodes = MIL_PRIZES.map(function (p, idx) {
      var isMilestone = idx === 4 || idx === 9 || idx === 14;
      var cls = 'mil-step' + (idx === S.level ? ' active' : '') + (idx < S.level ? ' passed' : '') + (isMilestone ? ' milestone' : '');
      return h('div', { class: cls },
        h('span', { class: 'mil-num' }, (idx + 1)),
        h('span', { class: 'mil-val' }, p.toLocaleString() + ' VNĐ'));
    }).reverse();

    // Các nút trợ giúp
    var btn50 = h('button', {
      class: 'btn' + (!S.lifelines.f50 ? ' used' : ''),
      disabled: !S.lifelines.f50 || S.locked ? true : null,
      onclick: use5050
    }, '✂ 50:50');

    var btnAudience = h('button', {
      class: 'btn' + (!S.lifelines.audience ? ' used' : ''),
      disabled: !S.lifelines.audience || S.locked ? true : null,
      onclick: useAudience
    }, '📊 Khán giả');

    var btnExpert = h('button', {
      class: 'btn' + (!S.lifelines.expert ? ' used' : ''),
      disabled: !S.lifelines.expert || S.locked ? true : null,
      onclick: useExpert
    }, '☎ Chuyên gia');

    var btnWalk = h('button', {
      class: 'btn bad-t',
      disabled: S.locked ? true : null,
      onclick: walkawayMillionaire
    }, '🛑 Dừng chơi');

    // Đáp án
    var opts = [0, 1, 2, 3].map(function (k) {
      var isHidden = S.hiddenOpts.indexOf(k) >= 0;
      var state = isHidden ? 'dim locked' : '';
      if (S.locked) {
        if (k === cp) state = 'correct locked';
        else if (k === it.picked) state = 'wrong locked';
        else state = 'dim locked';
      }
      var btn = optionButton(it, k, state, function () { pickMillionaire(k); });
      if (isHidden) btn.style.visibility = 'hidden';
      return btn;
    });

    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' },
        h('b', null, '🏆 AI LÀ TRIỆU PHÚ TRIẾT HỌC'),
        h('div', { class: 'stats' },
          h('span', null, 'Câu ', h('b', null, (S.level + 1) + '/15')),
          h('span', { class: 'ok-t' }, 'Giá trị: ', h('b', null, prize.toLocaleString() + ' VNĐ'))),
        h('button', { class: 'btn ghost', onclick: gameMenu }, 'Thoát')),

      h('div', { class: 'mil-layout' },
        h('div', { class: 'mil-main' },
          h('div', { class: 'card qcard' },
            qHeader(it, 'Mức thưởng: ' + prize.toLocaleString() + ' VNĐ'),
            h('div', { class: 'qtext' }, it.q.q),
            h('div', { class: 'opts' }, opts)),

          h('div', { class: 'card row between' },
            h('div', { class: 'row' }, btn50, btnAudience, btnExpert),
            btnWalk),

          S.modalInfo ? h('div', { class: 'card explain' }, S.modalInfo) : null
        ),
        h('div', { class: 'card mil-ladder' }, h('h3', null, 'Thang Tiền Thưởng'), ladderNodes)
      )
    ));
  }

  function pickMillionaire(k) {
    if (S.locked) return;
    var it = S.items[S.level];
    it.picked = k;
    S.locked = true;
    var ok = it.order[k] === it.q.a;
    record(it.q, ok);
    save();
    renderMillionaire();

    setTimeout(function () {
      if (ok) {
        if (S.level + 1 >= 15) {
          finishMillionaire(true);
        } else {
          S.level++;
          S.hiddenOpts = [];
          S.modalInfo = null;
          S.locked = false;
          renderMillionaire();
        }
      } else {
        finishMillionaire(false);
      }
    }, 1800);
  }

  function use5050() {
    if (!S.lifelines.f50 || S.locked) return;
    S.lifelines.f50 = false;
    var it = S.items[S.level];
    var cp = correctPos(it);
    var wrongPositions = [0, 1, 2, 3].filter(function (p) { return p !== cp; });
    wrongPositions = shuffle(wrongPositions);
    S.hiddenOpts = [wrongPositions[0], wrongPositions[1]];
    toast('Đã loại bỏ 2 phương án sai!');
    renderMillionaire();
  }

  function useAudience() {
    if (!S.lifelines.audience || S.locked) return;
    S.lifelines.audience = false;
    var it = S.items[S.level];
    var cp = correctPos(it);
    var pCorrect = 55 + Math.floor(Math.random() * 25);
    var pRemain = 100 - pCorrect;
    var p1 = Math.floor(Math.random() * pRemain);
    var p2 = Math.floor(Math.random() * (pRemain - p1));
    var p3 = pRemain - p1 - p2;

    var percents = [0, 0, 0, 0];
    var wrongs = [0, 1, 2, 3].filter(function (x) { return x !== cp; });
    percents[cp] = pCorrect;
    percents[wrongs[0]] = p1;
    percents[wrongs[1]] = p2;
    percents[wrongs[2]] = p3;

    S.modalInfo = h('div', null,
      h('b', null, '📊 Ý kiến khán giả trường quay:'),
      h('div', { class: 'row', style: 'margin-top:8px;' },
        LETTERS.map(function (lettr, idx) {
          return h('div', { style: 'flex:1; text-align:center;' },
            h('div', { class: 'small' }, lettr),
            h('b', null, percents[idx] + '%')
          );
        })
      )
    );
    renderMillionaire();
  }

  function useExpert() {
    if (!S.lifelines.expert || S.locked) return;
    S.lifelines.expert = false;
    var it = S.items[S.level];
    var cp = correctPos(it);
    var correctLetter = LETTERS[cp];
    S.modalInfo = h('div', null,
      h('b', null, '☎ Tư vấn từ Chuyên gia Triết học (Nhà tư tưởng C.Mác & Ph.Ăng-ghen):'),
      h('p', { style: 'margin-top:6px;' }, '"Dựa trên quy luật mâu thuẫn và thực tiễn khách quan, chúng tôi tin tưởng phương án đúng chắc chắn là ' + correctLetter + '."')
    );
    renderMillionaire();
  }

  function walkawayMillionaire() {
    if (confirm('Bạn có chắc chắn muốn dừng cuộc chơi để bảo toàn tiền thưởng hiện tại không?')) {
      finishMillionaire('walkaway');
    }
  }

  function finishMillionaire(status) {
    stopTimer();
    var finalPrize = 0;
    var st = stat('millionaire');
    st.runs++;

    if (status === true) {
      finalPrize = MIL_PRIZES[14];
    } else if (status === 'walkaway') {
      finalPrize = S.level > 0 ? MIL_PRIZES[S.level - 1] : 0;
    } else {
      if (S.level >= 10) finalPrize = MIL_PRIZES[9];
      else if (S.level >= 5) finalPrize = MIL_PRIZES[4];
      else finalPrize = 0;
    }

    if (finalPrize > st.best) st.best = finalPrize;
    save();

    mount(h('div', { class: 'stack' },
      h('div', { class: 'card score' },
        h('div', { class: 'muted' }, 'KẾT QUẢ GAME "AI LÀ TRIỆU PHÚ TRIẾT HỌC"'),
        h('div', { class: 'big ok-t' }, finalPrize.toLocaleString() + ' VNĐ'),
        h('p', null, status === true ? '🎉 Xuất sắc! Bạn đã vượt qua 15 câu hỏi để trở thành TRIỆU PHÚ TRIẾT HỌC!' : (status === 'walkaway' ? 'Bạn đã quyết định dừng cuộc chơi an toàn.' : 'Rất tiếc! Bạn đã chọn sai ở câu ' + (S.level + 1))),
        h('div', { class: 'row', style: 'justify-content:center; margin-top:16px;' },
          h('button', { class: 'btn primary', onclick: startMillionaire }, '↻ Chơi lại'),
          h('button', { class: 'btn', onclick: gameMenu }, 'Gameshow khác'),
          h('button', { class: 'btn', onclick: home }, 'Trang chủ'))
      )
    ));
  }

  /* --------------------------------------------------------------------------
   * GAMESHOW 2: ĐƯỜNG LÊN ĐỈNH OLYMPIA - ĐỦ 4 VÒNG
   * -------------------------------------------------------------------------- */
  function startOlympia() {
    stopTimer();
    var pool = shuffle(Q).slice(0, 14).map(makeItem);
    S = { view: 'olympia', items: pool, round: 0, idx: 0, score: 0, locked: false,
      round1: pool.slice(0, 6), obstacle: pool[6], round3: pool.slice(7, 11), round4: pool.slice(11, 14),
      obstacleSolved: false, obstacleHints: 0, timeLeft: 15, finalStake: 20, starUsed: false, starActive: false };
    renderOlympiaRound();
  }

  function olympiaRoundTitle() {
    return ['Vòng 1 · Khởi động', 'Vòng 2 · Vượt chướng ngại vật', 'Vòng 3 · Tăng tốc', 'Vòng 4 · Về đích'][S.round];
  }

  function renderOlympiaRound() {
    stopTimer();
    if (S.round === 0) return renderOlympiaQuestionRound(S.round1, 'Khởi động', 10, 15, 'Mỗi câu đúng được 10 điểm. Trả lời nhanh trong 15 giây.');
    if (S.round === 1) return renderOlympiaObstacle();
    if (S.round === 2) return renderOlympiaQuestionRound(S.round3, 'Tăng tốc', null, 10, 'Vòng biến tấu: điểm tính theo tốc độ — đúng trong 3 giây được 30 điểm, 6 giây được 20 điểm, sau đó được 10 điểm.');
    if (S.round === 3) return renderOlympiaFinishRound();
    finishOlympia();
  }

  function renderOlympiaQuestionRound(items, title, base, seconds, description) {
    var it = items[S.idx];
    if (!it) { S.round++; S.idx = 0; renderOlympiaRound(); return; }
    var cp = correctPos(it);
    var opts = [0,1,2,3].map(function(k) {
      var state = '';
      if (S.locked) state = k === cp ? 'correct locked' : (k === it.picked ? 'wrong locked' : 'dim locked');
      return optionButton(it, k, state, function(){ pickOlympiaRound(k, title, base, seconds); });
    });
    mount(h('div', { class: 'stack olympia-game' },
      h('div', { class: 'hud' }, h('b', null, '🏔️ ĐƯỜNG LÊN ĐỈNH OLYMPIA'),
        h('div', { class: 'stats' }, h('span', null, 'Điểm: ', h('b', null, S.score)), h('span', null, 'Vòng ', h('b', null, (S.round+1)+'/4'))),
        h('button', { class: 'btn ghost', onclick: gameMenu }, 'Thoát')),
      olympiaProgress(),
      h('div', { class: 'card qcard' },
        h('div', { class: 'eyebrow' }, title.toUpperCase()),
        h('h2', null, title + ' · Câu ' + (S.idx+1) + '/' + items.length),
        h('p', { class: 'muted' }, description),
        h('div', { class: 'hud' }, qHeader(it, title), seconds ? h('span', { class: 'chip' }, '⏱ ' + S.timeLeft + ' giây') : null),
        h('div', { class: 'qtext' }, it.q.q), h('div', { class: 'opts' }, opts))));
    if (seconds) runOlympiaRoundTimer(title, base, seconds);
  }

  function olympiaProgress() {
    return h('div', { class: 'olympia-rounds' }, ['Khởi động','Vượt chướng ngại vật','Tăng tốc','Về đích'].map(function(t,i){
      return h('div', { class: 'olympia-round' + (i===S.round?' active':'') + (i<S.round?' done':'') }, h('b', null, (i+1)+'. '), t);
    }));
  }

  function runOlympiaRoundTimer(title, base, seconds) {
    stopTimer();
    timer = setInterval(function(){
      if (!S || S.view !== 'olympia' || S.locked) return;
      S.timeLeft--;
      var nodes = document.querySelectorAll('.chip');
      if (nodes.length) { var last = nodes[nodes.length-1]; if (last.textContent.indexOf('giây')>=0) last.textContent = '⏱ ' + S.timeLeft + ' giây'; }
      if (S.timeLeft <= 0) pickOlympiaRound(-1, title, base, seconds);
    },1000);
  }

  function pickOlympiaRound(k, title, base, seconds) {
    if (S.locked) return;
    stopTimer(); S.locked = true;
    var items = S.round===0 ? S.round1 : S.round3;
    var it = items[S.idx]; it.picked = k;
    var ok = k >= 0 && it.order[k] === it.q.a;
    var earned = 0;
    if (ok) {
      if (title === 'Tăng tốc') earned = S.timeLeft >= 7 ? 30 : (S.timeLeft >= 4 ? 20 : 10);
      else earned = base || 10;
      S.score += earned; record(it.q,true);
    } else if (k >= 0) record(it.q,false);
    save(); renderOlympiaQuestionRound(items, title, base, seconds, title === 'Tăng tốc' ? 'Tăng tốc: điểm theo thời gian còn lại.' : 'Kết quả: ' + (ok ? 'đúng, +' + earned + ' điểm.' : 'chưa đúng, không có điểm.'));
    setTimeout(function(){
      if (!S || S.view!=='olympia') return;
      S.idx++;
      if (S.idx >= items.length) { S.round++; S.idx=0; }
      S.locked=false; S.timeLeft=seconds || 10; renderOlympiaRound();
    }, 1000);
  }

  function renderOlympiaObstacle() {
    var it = S.obstacle;
    var answer = it.q.o[it.q.a];
    var hints = [
      'Gợi ý 1: Đáp án thuộc nội dung Triết học Mác – Lênin.',
      'Gợi ý 2: Đọc kỹ câu hỏi gốc; chú ý khái niệm trọng tâm và mối quan hệ được hỏi.',
      'Gợi ý 3: Đáp án có ' + answer.length + ' ký tự (tính cả khoảng trắng).'
    ];
    var opts = [0,1,2,3].map(function(k){
      var state = '';
      if (S.locked) state = k===correctPos(it) ? 'correct locked' : (k===it.picked?'wrong locked':'dim locked');
      return optionButton(it,k,state,function(){
        if (S.locked) return;
        S.locked=true; it.picked=k; var ok=it.order[k]===it.q.a;
        if(ok){S.score+=40;S.obstacleSolved=true;record(it.q,true);} else {S.score=Math.max(0,S.score-10);record(it.q,false);}
        save(); renderOlympiaObstacleResult(ok);
      });
    });
    mount(h('div',{class:'stack olympia-game'},
      h('div',{class:'hud'},h('b',null,'🏔️ ĐƯỜNG LÊN ĐỈNH OLYMPIA'),h('span',{class:'chip'},'Điểm: '+S.score),h('button',{class:'btn ghost',onclick:gameMenu},'Thoát')),
      olympiaProgress(),
      h('div',{class:'card qcard'},h('div',{class:'eyebrow'},'VÒNG 2 · VƯỢT CHƯỚNG NGẠI VẬT'),
        h('h2',null,'Giải mã chướng ngại vật'),
        h('p',{class:'muted'},'Trả lời câu hỏi để mở khóa chướng ngại vật. Đúng +40 điểm; sai -10 điểm. Bạn có thể mở từng gợi ý.'),
        h('div',{class:'qtext'},it.q.q),
        h('div',{class:'row'},h('button',{class:'btn',disabled:S.obstacleHints>=3?true:null,onclick:function(){S.obstacleHints++;toast(hints[S.obstacleHints-1]);}},'💡 Mở gợi ý ('+S.obstacleHints+'/3)'),h('span',{class:'chip'},'Chương '+it.q.ch)),
        h('div',{class:'opts'},opts),S.locked?h('div',{class:'feedback '+(S.obstacleSolved?'ok':'bad')},S.obstacleSolved?'Mở khóa thành công! +40 điểm.':'Chướng ngại vật vẫn còn. -10 điểm.'):null,
        S.locked?h('button',{class:'btn primary',onclick:function(){S.round=2;S.idx=0;S.locked=false;S.timeLeft=10;renderOlympiaRound();}},'Sang vòng Tăng tốc →'):null)));
  }
  function renderOlympiaObstacleResult() { renderOlympiaObstacle(); }

  function renderOlympiaFinishRound() {
    var items=S.round4, it=items[S.idx];
    if(!it){finishOlympia();return;}
    var cp=correctPos(it);
    var opts=[0,1,2,3].map(function(k){var state='';if(S.locked)state=k===cp?'correct locked':(k===it.picked?'wrong locked':'dim locked');return optionButton(it,k,state,function(){pickOlympiaFinish(k);});});
    var stakeBtns=[20,30].map(function(n){return h('button',{class:'btn'+(S.finalStake===n?' primary':''),disabled:S.locked?true:null,onclick:function(){S.finalStake=n;renderOlympiaFinishRound();}},n+' điểm');});
    mount(h('div',{class:'stack olympia-game'},h('div',{class:'hud'},h('b',null,'🏔️ ĐƯỜNG LÊN ĐỈNH OLYMPIA'),h('span',{class:'stats'},'Điểm: '+S.score),h('button',{class:'btn ghost',onclick:gameMenu},'Thoát')),olympiaProgress(),
      h('div',{class:'card qcard'},h('div',{class:'eyebrow'},'VÒNG 4 · VỀ ĐÍCH'),h('h2',null,'Câu '+(S.idx+1)+'/3'),h('p',{class:'muted'},'Chọn mức điểm cược trước khi trả lời. Đúng cộng điểm, sai trừ điểm cược.'),
      h('div',{class:'row'},h('b',null,'Mức cược:'),stakeBtns),qHeader(it,'Cược '+S.finalStake+' điểm'),h('div',{class:'qtext'},it.q.q),h('div',{class:'opts'},opts),
      h('button',{class:'btn'+(S.starUsed?' used':''),disabled:S.starUsed||S.locked?true:null,onclick:function(){S.starUsed=true;S.finalStake=30;toast('Ngôi sao hy vọng: câu này cược 30 điểm!');renderOlympiaFinishRound();}},'🌟 Ngôi sao hy vọng (cược 30 điểm)'))));
  }
  function pickOlympiaFinish(k) {
    if(S.locked)return;S.locked=true;var it=S.round4[S.idx];it.picked=k;var ok=k>=0&&it.order[k]===it.q.a;
    if(ok){S.score+=S.finalStake;record(it.q,true);}else{S.score-=S.finalStake;if(k>=0)record(it.q,false);}
    save();renderOlympiaFinishRound();setTimeout(function(){if(!S||S.view!=='olympia')return;S.idx++;S.locked=false;S.finalStake=20;if(S.idx>=S.round4.length)finishOlympia();else renderOlympiaFinishRound();},1200);
  }
  function finishOlympia() {
    stopTimer(); var st=stat('olympia'); st.runs++; if(S.score>st.best)st.best=S.score; save();
    mount(h('div',{class:'stack'},h('div',{class:'card score'},h('div',{class:'muted'},'KẾT QUẢ ĐƯỜNG LÊN ĐỈNH OLYMPIA'),h('div',{class:'big ok-t'},S.score+' ĐIỂM'),
      h('p',null,'Bạn đã hoàn thành đủ 4 vòng: Khởi động, Vượt chướng ngại vật, Tăng tốc và Về đích.'),
      h('div',{class:'row',style:'justify-content:center;margin-top:16px;'},h('button',{class:'btn primary',onclick:startOlympia},'↻ Thi đấu lại'),h('button',{class:'btn',onclick:gameMenu},'Gameshow khác'),h('button',{class:'btn',onclick:home},'Trang chủ')))));
  }

  /* --------------------------------------------------------------------------
   * GAMESHOW 3: CHIẾC NÓN KỲ DIỆU
   * -------------------------------------------------------------------------- */
  var WHEEL_SLICES = [
    {name:'Mất lượt',type:'lose'}, {name:'+100 điểm',type:'points',value:100},
    {name:'Nhân đôi',type:'double'}, {name:'+200 điểm',type:'points',value:200},
    {name:'Thêm lượt',type:'again'}, {name:'-100 điểm',type:'minus',value:100},
    {name:'+300 điểm',type:'points',value:300}, {name:'Phần thưởng bí mật',type:'mystery'}
  ];
  function startWheel(){stopTimer();S={view:'wheel',score:0,round:0,used:[],current:null,spinning:false,turns:0,finished:false,bonusTurn:false};renderWheel();}
  function renderWheel(){
    var done=S.round>=8;
    if(done && !S.finished){S.finished=true;var ws=stat('wheel');ws.runs++;if(S.score>ws.best)ws.best=S.score;save();}
    var body=done?h('div',{class:'card score'},h('h2',null,'Kết thúc vòng quay!'),h('div',{class:'big'},S.score+' điểm'),h('button',{class:'btn primary',onclick:startWheel},'Chơi lại')):
      h('div',{class:'card qcard stack'},h('div',{class:'wheel-wrap'},h('div',{class:'wheel-pointer'},'▼'),h('div',{class:'wheel-disc'+(S.spinning?' spinning':''),style:'--wheel-rotation:'+(S.turns*1440)+'deg'},WHEEL_SLICES.map(function(x,i){return h('span',{class:'wheel-label','style':'--slice:'+i},x.name);}))),
      h('div',{class:'row between'},h('span',{class:'chip'},'Lượt '+(S.round+1)+'/8'),h('span',{class:'chip'},'Điểm: '+S.score)),
      h('p',{class:'muted'},'Quay để nhận thử thách điểm số; sau đó trả lời câu hỏi Triết học để ghi điểm.'),
      h('button',{class:'btn primary big',disabled:S.spinning?true:null,onclick:spinWheel},S.spinning?'Đang quay…':'🎡 QUAY NÓN'));
    mount(h('div',{class:'stack'},h('div',{class:'hud'},h('b',null,'🎡 CHIẾC NÓN KỲ DIỆU'),h('span',{class:'chip'},'Điểm: '+S.score),h('button',{class:'btn ghost',onclick:gameMenu},'Thoát')),body));
  }
  function spinWheel(){if(S.spinning)return;S.spinning=true;S.turns++;renderWheel();setTimeout(function(){if(!S||S.view!=='wheel')return;S.spinning=false;var slice=WHEEL_SLICES[Math.floor(Math.random()*WHEEL_SLICES.length)];S.current=slice;
    if(slice.type==='lose'){toast('Ô Mất lượt! Điểm không đổi.');S.round++;renderWheel();return;}
    if(slice.type==='points')S.pending=slice.value;else if(slice.type==='minus')S.pending=-slice.value;else if(slice.type==='double')S.pending='double';else if(slice.type==='again'){S.pending=100;S.bonusTurn=true;}else S.pending=200;
    var q=shuffle(Q.filter(function(x){return !S.used.includes(x.id);}))[0]||Q[Math.floor(Math.random()*Q.length)];S.used.push(q.id);S.item=makeItem(q);renderWheelQuestion();},900);}
  function renderWheelQuestion(){var it=S.item;var cp=correctPos(it);var opts=[0,1,2,3].map(function(k){return optionButton(it,k,'',function(){answerWheel(k);});});
    mount(h('div',{class:'stack'},h('div',{class:'hud'},h('b',null,'🎡 CHIẾC NÓN KỲ DIỆU'),h('span',{class:'chip'},'Ô trúng: '+S.current.name),h('span',{class:'chip'},'Điểm: '+S.score),h('button',{class:'btn ghost',onclick:gameMenu},'Thoát')),
      h('div',{class:'card qcard'},h('div',{class:'eyebrow'},'THỬ THÁCH LƯỢT '+(S.round+1)),h('div',{class:'qtext'},it.q.q),h('div',{class:'opts'},opts))));}
  function answerWheel(k){var it=S.item;var ok=it.order[k]===it.q.a;record(it.q,ok);if(ok){var delta=S.pending==='double'?200:S.pending;S.score+=delta;toast('Chính xác! '+(delta>=0?'+':'')+delta+' điểm.');}else{if(typeof S.pending==='number'&&S.pending<0)S.score+=S.pending;toast('Chưa chính xác!');}save();if(!(ok&&S.bonusTurn)){S.round++;}else{toast('Bạn nhận thêm một lượt quay!');}S.bonusTurn=false;renderWheel();}

  /* --------------------------------------------------------------------------
   * GAMESHOW 4: JEOPARDY TRIẾT HỌC
   * -------------------------------------------------------------------------- */
  var JEOPARDY_CATS=['Chương 1','Chương 2','Chương 3','Thử thách tổng hợp'];
  function startJeopardy(){stopTimer();var board=[];JEOPARDY_CATS.forEach(function(cat,c){var pool=shuffle(Q.filter(function(q){return c===3||q.ch===c+1;}));for(var r=0;r<5;r++){var q=pool[r]||shuffle(Q)[0];board.push({cat:cat,value:(r+1)*100,item:makeItem(q),used:false});}});S={view:'jeopardy',board:board,score:0,current:null,answered:0,finished:false};renderJeopardy();}
  function renderJeopardy(){
    if(S.board.every(function(x){return x.used;}) && !S.finished){S.finished=true;var js=stat('jeopardy');js.runs++;if(S.score>js.best)js.best=S.score;save();}
    if(S.current){var cell=S.current,it=cell.item,cp=correctPos(it);var opts=[0,1,2,3].map(function(k){var state='';if(cell.locked)state=k===cp?'correct locked':(k===it.picked?'wrong locked':'dim locked');return optionButton(it,k,state,function(){answerJeopardy(k);});});
      mount(h('div',{class:'stack'},h('div',{class:'hud'},h('b',null,'🟦 JEOPARDY TRIẾT HỌC'),h('span',{class:'chip'},'Điểm: '+S.score),h('button',{class:'btn ghost',onclick:gameMenu},'Thoát')),
        h('div',{class:'card qcard'},h('div',{class:'eyebrow'},cell.cat+' · '+cell.value+' ĐIỂM'),h('div',{class:'qtext'},it.q.q),h('div',{class:'opts'},opts),cell.locked?h('button',{class:'btn primary',onclick:function(){S.current=null;renderJeopardy();}},'Trở lại bảng điểm'):null)));return;}
    var cats=JEOPARDY_CATS.map(function(cat,c){return h('div',{class:'jeopardy-cat'},cat);});
    var cells=[];for(var r=0;r<5;r++)for(var c=0;c<4;c++){var cell=S.board[c*5+r];cells.push(h('button',{class:'jeopardy-cell'+(cell.used?' used':''),disabled:cell.used?true:null,onclick:function(target){return function(){S.current=target;renderJeopardy();};}(cell)},cell.used?'✓':cell.value));}
    mount(h('div',{class:'stack'},h('div',{class:'hud'},h('b',null,'🟦 JEOPARDY TRIẾT HỌC'),h('span',{class:'chip'},'Điểm: '+S.score),h('button',{class:'btn ghost',onclick:gameMenu},'Thoát')),
      h('p',{class:'muted'},'Chọn một ô điểm. Mỗi ô chỉ được mở một lần; đúng cộng điểm, sai trừ điểm.'),
      h('div',{class:'jeopardy-board'},cats.concat(cells)),
      S.board.every(function(x){return x.used;})?h('div',{class:'card score'},h('h2',null,'Ván đấu kết thúc'),h('div',{class:'big'},S.score+' điểm'),h('button',{class:'btn primary',onclick:startJeopardy},'Chơi lại')):null));
  }
  function answerJeopardy(k){var cell=S.current;if(cell.locked)return;cell.locked=true;cell.item.picked=k;var ok=cell.item.order[k]===cell.item.q.a;cell.used=true;S.answered++;if(ok){S.score+=cell.value;record(cell.item.q,true);}else{S.score-=cell.value;record(cell.item.q,false);}var st=stat('jeopardy');if(S.score>st.best)st.best=S.score;save();renderJeopardy();}

  /* ---------- Khởi động ---------- */
  document.getElementById('navHome').addEventListener('click', home);
  document.getElementById('brand').addEventListener('click', function (e) { e.preventDefault(); home(); });
  document.getElementById('navBrowse').addEventListener('click', browse);
  document.getElementById('navTheory').addEventListener('click', theoryPage);
  document.getElementById('navWrong').addEventListener('click', function () { reviewPage('wrong'); });
  document.getElementById('navStats').addEventListener('click', statsPage);
  document.getElementById('navGame').addEventListener('click', gameMenu);
  document.getElementById('navSettings').addEventListener('click', openSettings);

  window.addEventListener('pagehide', saveSession);
  document.addEventListener('visibilitychange', function () { if (document.hidden) saveSession(); });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  applyTheme();
  updateWrongBadge();
  if (!Q.length) {
    mount(h('p', null, 'Không tải được dữ liệu câu hỏi (questions.js).'));
  } else {
    home();
  }
})();
