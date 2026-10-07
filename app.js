/* Ôn tập Triết học Mác - Lênin
 * Không dùng thư viện ngoài. Dữ liệu câu hỏi nằm trong questions.js (window.QUESTIONS).
 * Mỗi câu: { id, ch (chương), n (số câu trong chương), lv (mức độ), q (đề), o [4 đáp án], a (chỉ số đáp án đúng 0-3) }
 */
(function () {
  'use strict';

  var Q = window.QUESTIONS || [];
  var LETTERS = ['A', 'B', 'C', 'D'];
  var MIX_SIZE = 40;
  var STORE_KEY = 'mln-ontap-v1';

  /* ---------- Cấu trúc chương / mục (theo đúng thứ tự trong ngân hàng câu hỏi) ---------- */
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
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* bỏ qua */ }
    updateWrongBadge();
  }
  /* Ghi nhận kết quả một câu: đúng thì xoá khỏi danh sách câu sai, sai thì thêm vào. */
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

  /* Một số câu có đáp án kiểu "Tất cả các đáp án đều đúng" nên không được xáo thứ tự đáp án. */
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
  /* Ghi trạng thái hiện tại vào localStorage (chỉ khi đã trả lời ít nhất 1 câu). */
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
      store.sessions.mix = { items: serItems(S.items), i: S.i, elapsed: Date.now() - S.start, ts: Date.now() };
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
    S = { view: 'mix', items: items, i: Math.min(s.i, items.length - 1), start: Date.now() - (s.elapsed || 0), submitted: false };
    renderMix();
    runMixTimer();
  }
  /* Danh sách các phần đang ôn dở (tuỳ chọn lọc theo chương). */
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
    return h('button', { class: cls, type: 'button', disabled: state === 'locked' ? true : null, onclick: onClick, 'data-k': k },
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
  var S = null;          // trạng thái phiên đang làm
  var timer = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

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
    var mix = h('section', { class: 'card mix' },
      h('div', { class: 'eyebrow' }, 'Ôn tổng hợp'),
      h('h3', null, MIX_SIZE + ' câu ngẫu nhiên từ cả 3 chương'),
      h('div', { class: 'meta' }, 'Làm như đi thi: chọn đáp án, nộp bài rồi xem điểm và đáp án. Mỗi lần bấm là một đề mới.' +
        (mixStat.runs ? ' · Đã làm ' + mixStat.runs + ' lần, điểm cao nhất ' + mixStat.best + '/' + MIX_SIZE : '')),
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary big', onclick: startMix }, 'Bắt đầu đề ' + MIX_SIZE + ' câu')));

    var fun = h('section', { class: 'card wide' },
      h('div', { class: 'eyebrow' }, 'Giải trí & ghi nhớ'),
      h('h3', null, 'Minigame và thẻ ghi nhớ'),
      h('div', { class: 'meta' }, 'Đua 60 giây, sinh tồn 3 mạng, thẻ ghi nhớ — học mà như chơi.'),
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary', onclick: function () { startGame('race'); } }, '⚡ Đua 60 giây'),
        h('button', { class: 'btn primary', onclick: function () { startGame('surv'); } }, '❤ Sinh tồn'),
        h('button', { class: 'btn', onclick: flashMenu }, '🃏 Thẻ ghi nhớ')));
    var pend = pendingList();
    mount(h('div', { class: 'stack' },
      h('div', { class: 'hero' },
        h('h1', null, 'Ôn tập Triết học Mác - Lênin'),
        h('p', null, 'Ngân hàng ' + Q.length + ' câu trắc nghiệm, chia theo chương. Ôn chương: làm từng câu, có đáp án ngay; chọn sai có thể làm lại từ đầu với thứ tự câu ngẫu nhiên.'),
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

  /* ---------- Ôn chương / ôn câu sai (có đáp án ngay) ---------- */
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
          h('b', null, '✔ Chính xác!'),
          h('div', { class: 'row' },
            h('button', { class: 'btn primary', id: 'nextBtn', onclick: nextPractice }, isLast ? 'Xem kết quả' : 'Câu tiếp theo →')));
      } else {
        feedback = h('div', { class: 'feedback bad' },
          h('b', null, '✘ Chưa đúng. Đáp án đúng là ' + LETTERS[cp] + '.'),
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

  /* ---------- Ôn câu sai ---------- */
  function startWrongBank() {
    var ids = wrongIds();
    if (!ids.length) { toast('Chưa có câu sai nào. Cứ làm tiếp nhé!'); return; }
    startPractice({ kind: 'wrong', key: 'wrong', sid: 'wrong', title: 'Ôn các câu đã sai (' + ids.length + ')', pool: ids.map(function (id) { return byId[id]; }), ordered: false });
  }

  /* ---------- Ôn tổng hợp (đề 40 câu) ---------- */
  function startMix() {
    var pool = shuffle(Q).slice(0, MIX_SIZE);
    S = { view: 'mix', items: pool.map(makeItem), i: 0, start: Date.now(), submitted: false };
    dropMix();
    renderMix();
    runMixTimer();
  }
  function runMixTimer() {
    stopTimer();
    timer = setInterval(function () {
      var el = document.getElementById('timer');
      if (el && S && S.view === 'mix' && !S.submitted) el.textContent = fmtTime(Date.now() - S.start);
    }, 1000);
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
          h('span', null, '⏱ ', h('b', { id: 'timer' }, fmtTime(Date.now() - S.start))),
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
  function submitMix() {
    var left = S.items.filter(function (x) { return x.picked === null; }).length;
    if (left && !confirm('Còn ' + left + ' câu chưa trả lời (tính là sai). Vẫn nộp bài?')) return;
    S.submitted = true; stopTimer(); store.sessions.mix = null;
    var right = 0;
    S.items.forEach(function (it) {
      var ok = it.picked !== null && it.order[it.picked] === it.q.a;
      if (ok) right++;
      record(it.q, ok);
    });
    S.right = right; S.elapsed = Date.now() - S.start;
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
          h('button', { class: 'btn primary', onclick: startMix }, 'Làm đề mới'),
          h('button', { class: 'btn', onclick: startWrongBank }, 'Ôn các câu sai'),
          h('button', { class: 'btn', onclick: home }, 'Trang chủ'))),
      h('div', { class: 'row' },
        h('h2', { style: 'margin:0' }, 'Xem lại bài làm'),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn' + (filter === 'all' ? ' primary' : ''), onclick: function () { renderMixResult('all'); } }, 'Tất cả'),
        h('button', { class: 'btn' + (filter === 'wrong' ? ' primary' : ''), onclick: function () { renderMixResult('wrong'); } }, 'Chỉ câu sai')),
      list.length ? list.map(function (it) { return reviewCard(it.q, it); }) : h('p', { class: 'muted' }, 'Không có câu nào để hiển thị.')));
  }

  /* Thẻ xem lại: hiện đủ 4 đáp án, tô đáp án đúng và lựa chọn của bạn (nếu có). */
  function reviewCard(q, it, extra) {
    var opts = [0, 1, 2, 3].map(function (k) {
      var cls = 'opt';
      var origIdx = it ? it.order[k] : k;   // vị trí gốc của đáp án đang hiển thị ở ô k
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
      h('div', { class: 'opts' }, opts));
  }

  /* ---------- Tra cứu ---------- */
  function normalize(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  var normCache = null;
  function browse() {
    stopTimer(); S = null;
    if (!normCache) {
      normCache = Q.map(function (q) { return normalize(q.q + ' ' + q.o.join(' ')); });
    }
    var chSel = h('select', { class: 'search', 'aria-label': 'Lọc theo chương' },
      h('option', { value: '0' }, 'Tất cả chương'),
      h('option', { value: '1' }, 'Chương 1'), h('option', { value: '2' }, 'Chương 2'), h('option', { value: '3' }, 'Chương 3'));
    var input = h('input', { class: 'search', type: 'search', placeholder: 'Gõ từ khoá, ví dụ: vật chất, giai cấp... (không cần gõ dấu)', 'aria-label': 'Tìm câu hỏi' });
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

  /* ---------- Câu đã đánh dấu (★) ---------- */
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

  /* ---------- Trang "Câu sai & đánh dấu" ---------- */
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
            h('button', { class: 'btn', onclick: function () { flashStart(list, isWrong ? 'Thẻ: câu sai' : 'Thẻ: câu đã đánh dấu', 9999); } }, '🃏 Học bằng thẻ'),
            isWrong ? h('button', { class: 'btn', onclick: function () {
              if (confirm('Xoá toàn bộ ' + list.length + ' câu khỏi danh sách câu sai?')) { store.wrong = {}; save(); reviewPage('wrong', true); }
            } }, 'Xoá tất cả') : null)
        : null,
      isWrong ? h('p', { class: 'muted small' }, 'Làm đúng một câu từng sai (ở bất kỳ chế độ nào) sẽ tự xoá câu đó khỏi danh sách. Bạn cũng có thể xoá thủ công.') : null,
      list.length ? cards : h('p', { class: 'muted' }, isWrong ? 'Chưa có câu sai nào. Tuyệt vời!' : 'Chưa đánh dấu câu nào. Bấm ☆ ở góc phải câu hỏi để đánh dấu.')),
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
    var mx = stat('mix'), rc = stat('race'), sv = stat('surv');
    mount(h('div', { class: 'stack' },
      h('h1', null, 'Thống kê'),
      h('div', { class: 'card stack' },
        barRow('Tổng tiến độ (đã làm đúng)', seenAll, Q.length),
        h('div', { class: 'muted small' },
          'Đang có ' + wrongIds().length + ' câu sai · ' + markIds().length + ' câu đã đánh dấu · ' +
          'Ôn tổng hợp: ' + mx.runs + ' đề, điểm cao nhất ' + mx.best + '/' + MIX_SIZE + ' · ' +
          'Đua 60s kỷ lục ' + rc.best + ' · Sinh tồn kỷ lục ' + sv.best)),
      blocks,
      h('div', { class: 'card stack' },
        h('h3', null, 'Câu hay sai nhất'),
        top.length ? top : h('p', { class: 'muted' }, 'Chưa có dữ liệu.'))));
  }

  /* ---------- Minigame ---------- */
  function gameCard(title, desc, meta, fn) {
    return h('div', { class: 'card gcard' },
      h('h3', null, title), h('p', { class: 'muted small' }, desc),
      meta ? h('div', { class: 'meta small' }, meta) : null,
      h('div', { class: 'actions' }, h('button', { class: 'btn primary', onclick: fn }, 'Chơi')));
  }
  function gameMenu() {
    stopTimer(); S = null;
    var r = stat('race'), s = stat('surv');
    mount(h('div', { class: 'stack' },
      h('button', { class: 'btn ghost', onclick: home }, '← Trang chủ'),
      h('h1', null, 'Minigame'),
      h('p', { class: 'muted' }, 'Câu hỏi lấy ngẫu nhiên từ cả ' + Q.length + ' câu. Làm đúng một câu từng sai sẽ xoá nó khỏi danh sách câu sai; làm sai thì câu đó được thêm vào.'),
      h('div', { class: 'grid' },
        gameCard('⚡ Đua 60 giây', 'Trả lời càng nhiều càng tốt trong 60 giây. Đúng +1 điểm, sai bị trừ 5 giây.',
          r.best ? 'Kỷ lục: ' + r.best + ' điểm · đã chơi ' + r.runs + ' lần' : 'Chưa chơi', function () { startGame('race'); }),
        gameCard('❤ Sinh tồn 3 mạng', 'Sai một câu mất một mạng, hết mạng là thua. Trụ được bao nhiêu câu?',
          s.best ? 'Kỷ lục: ' + s.best + ' câu · đã chơi ' + s.runs + ' lần' : 'Chưa chơi', function () { startGame('surv'); }),
        gameCard('🃏 Thẻ ghi nhớ', 'Lật thẻ xem đáp án, tự chấm "đã nhớ" hay "chưa nhớ"; thẻ chưa nhớ sẽ quay lại cuối bộ.',
          null, flashMenu))));
  }
  function startGame(mode) {
    stopTimer();
    S = { view: 'game', mode: mode, pool: shuffle(Q), idx: 0, score: 0, lives: 3, combo: 0, bestCombo: 0, missed: [],
          locked: false, over: false, cur: null, deadline: Date.now() + 60000 };
    if (mode === 'race') {
      var g = S;
      timer = setInterval(function () {
        if (S !== g || g.over) return;
        var left = g.deadline - Date.now();
        if (left <= 0) { endGame(); return; }
        var el = document.getElementById('gtime');
        if (el) el.textContent = Math.ceil(left / 1000) + 's';
      }, 250);
    }
    nextGameQ();
  }
  function nextGameQ() {
    if (S.idx >= S.pool.length) { S.pool = shuffle(Q); S.idx = 0; }
    S.cur = makeItem(S.pool[S.idx++]);
    S.locked = false;
    renderGame();
  }
  function renderGame(scroll) {
    var it = S.cur, cp = correctPos(it);
    var opts = [0, 1, 2, 3].map(function (k) {
      var state = '';
      if (S.locked) state = k === cp ? 'correct' : (k === it.picked ? 'wrong' : 'dim');
      var b = optionButton(it, k, state, function () { gamePick(k); });
      if (S.locked) b.setAttribute('disabled', '');
      return b;
    });
    var hud = S.mode === 'race'
      ? h('span', null, '⏱ ', h('b', { id: 'gtime' }, Math.max(0, Math.ceil((S.deadline - Date.now()) / 1000)) + 's'))
      : h('span', { class: 'hearts', title: 'Số mạng còn lại' }, new Array(Math.max(S.lives, 0) + 1).join('❤') + new Array(3 - Math.max(S.lives, 0) + 1).join('🖤'));
    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' },
        h('b', null, S.mode === 'race' ? '⚡ Đua 60 giây' : '❤ Sinh tồn'),
        h('div', { class: 'stats' }, hud,
          h('span', null, 'Điểm ', h('b', null, S.score)),
          h('span', null, 'Combo ', h('b', null, S.combo))),
        h('button', { class: 'btn ghost', onclick: function () { if (confirm('Thoát ván này?')) gameMenu(); } }, 'Thoát')),
      h('div', { class: 'card qcard' },
        qHeader(it),
        h('div', { class: 'qtext' }, it.q.q),
        h('div', { class: 'opts' }, opts),
        S.locked ? h('div', { class: 'feedback ' + (it.order[it.picked] === it.q.a ? 'ok' : 'bad') },
          it.order[it.picked] === it.q.a ? '✔ Chính xác!' : '✘ Đáp án đúng là ' + LETTERS[cp] + '.') : null)), scroll);
  }
  function gamePick(k) {
    var g = S;
    if (!g || g.view !== 'game' || g.locked || g.over) return;
    var it = g.cur;
    it.picked = k; g.locked = true;
    var ok = it.order[k] === it.q.a;
    record(it.q, ok);
    if (ok) { g.score++; g.combo++; if (g.combo > g.bestCombo) g.bestCombo = g.combo; }
    else {
      g.combo = 0;
      if (g.missed.indexOf(it.q.id) < 0) g.missed.push(it.q.id);
      if (g.mode === 'surv') g.lives--; else g.deadline -= 5000;
    }
    save();
    renderGame(false);
    var lost = !ok && g.mode === 'surv' && g.lives <= 0;
    setTimeout(function () {
      if (S !== g || g.over) return;
      if (lost || (g.mode === 'race' && Date.now() >= g.deadline)) endGame(); else nextGameQ();
    }, ok ? 600 : 1500);
  }
  function endGame() {
    var g = S;
    if (!g || g.over) return;
    g.over = true; stopTimer();
    var st = stat(g.mode);
    st.runs++;
    var record_ = g.score > st.best;
    if (record_) st.best = g.score;
    save();
    var again = function () { startGame(g.mode); };
    mount(h('div', { class: 'stack' },
      h('div', { class: 'card score' },
        h('div', { class: 'muted' }, g.mode === 'race' ? 'Hết giờ! · Đua 60 giây' : 'Hết mạng! · Sinh tồn'),
        h('div', { class: 'big' }, g.score),
        h('p', null, record_ && g.score > 0 ? '🏆 Kỷ lục mới!' : 'Kỷ lục hiện tại: ' + st.best, ' · Combo dài nhất: ' + g.bestCombo),
        h('div', { class: 'row', style: 'justify-content:center' },
          h('button', { class: 'btn primary', onclick: again }, '↻ Chơi lại'),
          h('button', { class: 'btn', onclick: gameMenu }, 'Minigame khác'),
          h('button', { class: 'btn', onclick: home }, 'Trang chủ'))),
      g.missed.length ? h('h2', null, 'Các câu sai trong ván này') : null,
      g.missed.map(function (id) { return reviewCard(byId[id], null); })));
  }

  /* ---------- Thẻ ghi nhớ ---------- */
  function flashMenu() {
    stopTimer(); S = null;
    var limit = 20;
    var sel = h('select', { class: 'search', 'aria-label': 'Số thẻ', onchange: function (e) { limit = parseInt(e.target.value, 10); } },
      h('option', { value: '20' }, '20 thẻ'), h('option', { value: '50' }, '50 thẻ'),
      h('option', { value: '100' }, '100 thẻ'), h('option', { value: '9999' }, 'Tất cả'));
    var src = function (label, pool) {
      return h('button', { class: 'btn', disabled: pool.length ? null : true,
        onclick: function () { flashStart(pool, 'Thẻ: ' + label, limit); } }, label + ' (' + pool.length + ')');
    };
    mount(h('div', { class: 'stack' },
      h('button', { class: 'btn ghost', onclick: gameMenu }, '← Minigame'),
      h('h1', null, '🃏 Thẻ ghi nhớ'),
      h('p', { class: 'muted' }, 'Đọc câu hỏi, tự nhớ đáp án rồi lật thẻ để kiểm tra. Phím tắt: Space lật thẻ, ← chưa nhớ, → đã nhớ.'),
      h('div', { class: 'card stack' },
        h('div', { class: 'row' }, h('b', null, 'Số thẻ mỗi lượt'), sel),
        h('b', null, 'Chọn nguồn thẻ'),
        h('div', { class: 'row' },
          src('Tất cả', Q), src('Chương 1', chapterQs(1)), src('Chương 2', chapterQs(2)), src('Chương 3', chapterQs(3)),
          src('Câu sai', wrongIds().map(function (id) { return byId[id]; })),
          src('Đã đánh dấu', markIds().map(function (id) { return byId[id]; }))))));
  }
  function flashStart(pool, title, limit) {
    stopTimer();
    var deck = shuffle(pool).slice(0, limit);
    if (!deck.length) { toast('Không có thẻ nào.'); return; }
    S = { view: 'flash', title: title, deck: deck, total: deck.length, known: 0, again: 0, flipped: false };
    renderFlash();
  }
  function flashFlip() { if (S && S.view === 'flash' && S.deck.length) { S.flipped = !S.flipped; renderFlash(false); } }
  function flashRate(known) {
    if (!S.flipped) return;
    var q = S.deck.shift();
    if (known) S.known++; else { S.again++; S.deck.push(q); }
    S.flipped = false;
    renderFlash();
  }
  function renderFlash(scroll) {
    if (!S.deck.length) {
      mount(h('div', { class: 'stack' },
        h('div', { class: 'card score' },
          h('div', { class: 'muted' }, S.title),
          h('div', { class: 'big' }, '🎉'),
          h('p', null, 'Bạn đã nhớ hết ' + S.total + ' thẻ (lật lại ' + S.again + ' lần).'),
          h('div', { class: 'row', style: 'justify-content:center' },
            h('button', { class: 'btn primary', onclick: flashMenu }, 'Bộ thẻ khác'),
            h('button', { class: 'btn', onclick: home }, 'Trang chủ')))));
      return;
    }
    var q = S.deck[0];
    var back = S.flipped
      ? h('div', { class: 'opts' }, [0, 1, 2, 3].map(function (k) {
          return h('div', { class: 'opt' + (k === q.a ? ' correct' : ' dim') },
            h('span', { class: 'key' }, LETTERS[k]), h('span', { class: 'txt' }, q.o[k]));
        }))
      : h('div', { class: 'muted small' }, 'Chạm vào thẻ hoặc bấm Space để lật xem đáp án');
    mount(h('div', { class: 'stack' },
      h('div', { class: 'hud' },
        h('b', null, S.title),
        h('div', { class: 'stats' }, h('span', null, 'Đã nhớ ', h('b', null, S.known + '/' + S.total)), h('span', null, 'Còn ', h('b', null, S.deck.length))),
        h('button', { class: 'btn ghost', onclick: flashMenu }, 'Thoát')),
      h('div', { class: 'progress' }, h('span', { style: 'width:' + Math.round(S.known / S.total * 100) + '%' })),
      h('div', { class: 'card flashcard' + (S.flipped ? ' back' : ''), tabindex: 0, role: 'button', onclick: function (e) { if (!S.flipped && e.target.closest('.star') === null) flashFlip(); } },
        qHeader({ q: q }),
        h('div', { class: 'qtext' }, q.q),
        back),
      S.flipped
        ? h('div', { class: 'row', style: 'justify-content:center' },
            h('button', { class: 'btn', onclick: function () { flashRate(false); } }, '✘ Chưa nhớ'),
            h('button', { class: 'btn primary', onclick: function () { flashRate(true); } }, '✔ Đã nhớ'))
        : h('div', { class: 'row', style: 'justify-content:center' }, h('button', { class: 'btn primary', onclick: flashFlip }, 'Lật thẻ'))), scroll);
  }

  /* ---------- Sao lưu / khôi phục ---------- */
  function exportData() {
    var d = new Date();
    var name = 'on-triet-tien-do-' + d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + '.json';
    var url = URL.createObjectURL(new Blob([JSON.stringify(store)], { type: 'application/json' }));
    var a = h('a', { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('Đã tải file sao lưu.');
  }
  function importData(file, done) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var raw = JSON.parse(fr.result);
        if (!raw || typeof raw !== 'object' || (!raw.wrong && !raw.seen && !raw.stats)) throw new Error('bad');
        if (!confirm('Thay toàn bộ tiến độ hiện tại bằng dữ liệu trong file sao lưu?')) return;
        store = norm(raw); save(); done(); toast('Đã khôi phục tiến độ.');
      } catch (e) { toast('File không hợp lệ.'); }
    };
    fr.readAsText(file);
  }

  /* ---------- Cài đặt ---------- */
  function openSettings() {
    var dlg = h('dialog', null);
    var shuf = h('input', { type: 'checkbox', checked: store.settings.shuffleOpts ? true : null, onchange: function (e) { store.settings.shuffleOpts = e.target.checked; save(); } });
    var theme = h('select', { class: 'search', onchange: function (e) { store.settings.theme = e.target.value; save(); applyTheme(); } },
      h('option', { value: 'auto' }, 'Theo hệ thống'), h('option', { value: 'light' }, 'Sáng'), h('option', { value: 'dark' }, 'Tối'));
    theme.value = store.settings.theme;
    var fileIn = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none', onchange: function (e) {
      var f = e.target.files[0];
      if (f) importData(f, function () { dlg.close(); home(); });
    } });
    dlg.append(
      fileIn,
      h('h2', null, 'Cài đặt'),
      h('label', { class: 'switch-row' }, h('span', null, 'Xáo thứ tự đáp án A, B, C, D (câu "Tất cả đáp án..." giữ nguyên)'), shuf),
      h('div', { class: 'switch-row' }, h('span', null, 'Giao diện'), theme),
      h('div', { class: 'switch-row' }, h('span', null, 'Sao lưu tiến độ (tải file .json)'),
        h('button', { class: 'btn', onclick: exportData }, 'Xuất')),
      h('div', { class: 'switch-row' }, h('span', null, 'Khôi phục từ file sao lưu'),
        h('button', { class: 'btn', onclick: function () { fileIn.click(); } }, 'Nhập')),
      h('div', { class: 'switch-row' }, h('span', null, 'Xoá toàn bộ tiến độ & câu sai'),
        h('button', { class: 'btn', onclick: function () {
          if (confirm('Xoá toàn bộ tiến độ và danh sách câu sai trên trình duyệt này?')) {
            var th = store.settings; store = defaults(); store.settings = th; save(); dlg.close(); home(); toast('Đã xoá tiến độ.');
          }
        } }, 'Xoá')),
      h('div', { class: 'row', style: 'justify-content:flex-end;margin-top:14px' },
        h('button', { class: 'btn primary', onclick: function () { dlg.close(); } }, 'Đóng')));
    dlg.addEventListener('close', function () { dlg.remove(); });
    document.body.appendChild(dlg);
    dlg.showModal();
  }

  /* ---------- Phím tắt ---------- */
  document.addEventListener('keydown', function (e) {
    if (!S || e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    var key = e.key.toLowerCase();
    var k = '1234'.indexOf(key);
    if (k < 0) k = 'abcd'.indexOf(key);
    if (S.view === 'practice') {
      if (k >= 0) pickPractice(k);
      else if (key === 'enter' || key === 'arrowright') {
        if (S.items[S.i].picked !== null) { e.preventDefault(); nextPractice(); }
      } else if (key === 'r' && S.cfg.kind === 'chapter' && S.items[S.i].picked !== null) restartPractice();
    } else if (S.view === 'game') {
      if (k >= 0) gamePick(k);
    } else if (S.view === 'flash') {
      if (tag === 'BUTTON' && (key === ' ' || key === 'enter')) return;
      if (key === ' ' || (key === 'enter' && !S.flipped)) { e.preventDefault(); flashFlip(); }
      else if (S.flipped && (key === 'arrowleft' || key === '1')) flashRate(false);
      else if (S.flipped && (key === 'arrowright' || key === '2')) flashRate(true);
    } else if (S.view === 'mix' && !S.submitted) {
      if (k >= 0) pickMix(k);
      else if (key === 'arrowright' && S.i + 1 < MIX_SIZE) { S.i++; renderMix(); }
      else if (key === 'arrowleft' && S.i > 0) { S.i--; renderMix(); }
    }
  });

  /* ---------- Khởi động ---------- */
  document.getElementById('navHome').addEventListener('click', home);
  document.getElementById('brand').addEventListener('click', function (e) { e.preventDefault(); home(); });
  document.getElementById('navBrowse').addEventListener('click', browse);
  document.getElementById('navWrong').addEventListener('click', function () { reviewPage('wrong'); });
  document.getElementById('navStats').addEventListener('click', statsPage);
  document.getElementById('navGame').addEventListener('click', gameMenu);
  document.getElementById('navSettings').addEventListener('click', openSettings);
  /* Đóng tab hoặc chuyển tab: tự lưu phần đang làm để lần sau bấm "Làm tiếp". */
  window.addEventListener('pagehide', saveSession);
  document.addEventListener('visibilitychange', function () { if (document.hidden) saveSession(); });
  applyTheme();
  updateWrongBadge();
  if (!Q.length) {
    mount(h('p', null, 'Không tải được dữ liệu câu hỏi (questions.js).'));
  } else {
    home();
  }
})();
