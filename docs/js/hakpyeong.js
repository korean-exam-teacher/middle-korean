/*
 * 학력평가(전국연합학력평가) 문항 (2026-11-09 v95)
 * - data/hakpyeong/index.js: 회차·문항 목록·성취기준 연결
 * - data/hakpyeong/t/<회차(고→g)>.js: 그 회차의 글자 자료(지문·발문·<보기>·선지, 밑줄·글자 상자·꺾쇠) — 필요할 때만
 * - data/hakpyeong/explain.js: 해설(필요할 때만)
 * - data/hakpyeong/img/<회차(고→g)>_<쪽>.png: 원본 쪽 그림 — 그림·표가 있는 부분만 잘라 보여 준다
 * 출처: 각 시·도 교육청 주관 전국연합학력평가 문제지·정답 및 해설(EBSi 제공)
 */
(function () {
  var BASE = "data/hakpyeong/", VER = window.HP_VER || "95";
  var loading = null, expLoading = null, D = null, EX = {}, TEXT = {}, tLoading = {}, tWait = {};
  function script(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.onload = res;
      s.onerror = function () { rej(new Error(src + " 을(를) 불러오지 못했습니다.")); };
      document.body.appendChild(s);
    });
  }
  function load() {
    if (!loading) loading = script(BASE + "index.js?v=" + VER).then(function () {
      D = window.HP_DATA; delete window.HP_DATA;
      D.exams.forEach(function (e) { EX[e.id] = e; });
    });
    return loading;
  }
  window.HP_TEXT_LOADED = function (eid, t) { TEXT[eid] = t; if (tWait[eid]) tWait[eid](); };
  function loadText(eid) {
    if (TEXT[eid]) return Promise.resolve();
    if (!tLoading[eid]) tLoading[eid] = new Promise(function (res, rej) {
      tWait[eid] = res;
      script(BASE + "t/" + eid.replace("고", "g") + ".js?v=" + VER).catch(rej);
    });
    return tLoading[eid];
  }
  /* 문항 키 여럿 → 필요한 회차 글자 자료를 모두 불러온다 */
  function loadFor(keys) {
    var es = {}; keys.forEach(function (k) { es[k.split("||")[0]] = 1; });
    return Promise.all(Object.keys(es).map(loadText));
  }
  function loadExplain() {
    if (!expLoading) expLoading = script(BASE + "explain.js?v=" + VER).then(function () { var E = window.HP_EXPLAIN; delete window.HP_EXPLAIN; return E; });
    return expLoading;
  }
  function crops(list, e) {
    return (list || []).map(function (c) {
      var pg = e.pages[c[0]] || [595, 842];
      return { src: BASE + "img/" + e.id.replace("고", "g") + "_" + c[0] + ".png", W: pg[0], H: pg[1], x0: c[1], y0: c[2], x1: c[3], y1: c[4] };
    });
  }
  function examName(e) { return e.y + "년 " + e.m + "월 고" + e.g + " 학력평가"; }
  function passage(pkey) {
    var p = D.passages[pkey]; if (!p) return null;
    var e = EX[pkey.split("||")[0]], t = (TEXT[e.id] || { passages: {} }).passages[pkey] || {};
    return { key: pkey, head: t.head || p.head, text: t.pua ? "" : (t.text || ""), brackets: t.brs || null, poem: !!t.poem, figCrops: t.fig ? crops(t.pc, e) : null, range: pkey.split("||")[2] };
  }
  function note(nkey) {
    var e = EX[nkey.split("||")[0]], n = ((TEXT[e.id] || {}).notes || {})[nkey]; if (!n) return null;
    return { key: nkey, isNote: true, head: n.head, text: n.text || "", label: n.bl || "", brackets: null, poem: false, figCrops: n.fig ? crops(n.pc, e) : null, range: nkey.split("||")[2] };
  }
  function item(key) {
    var it = D && D.items[key]; if (!it) return null;
    var e = EX[it.e], t = (TEXT[e.id] || { items: {} }).items[key] || {};
    return {
      key: key, hp: true, exam: examName(e), examId: e.id, no: it.n, area: it.a, range: it.s,
      stem: t.st || it.st, stemCrops: t.stFig ? crops(t.stFig, e) : null, bogi: t.bogi || "", bogiLabel: t.bl || "", bogiBrackets: t.brs || null,
      bogiCrops: t.bogiFig ? crops(t.bogiFig, e) : null, choices: t.ch || [], choiceCrops: t.chFig ? crops(t.chFig, e) : null,
      answer: Number(it.ans) || 0, score: it.pts, group: it.gr, kind: it.k, intent: it.it,
      passage: it.p ? passage(it.p) : (t.nk ? note(t.nk) : null),
      note: it.p && t.nk ? note(t.nk) : null
    };
  }
  window.HP = {
    load: load, loadText: loadText, loadFor: loadFor, loadExplain: loadExplain, item: item, passage: passage, ready: function () { return !!D; },
    exams: function (g) { return D.exams.filter(function (e) { return !g || e.g === g; }); },
    exam: function (id) { return EX[id] || null; },
    /* 성취기준 하나의 학력평가 문항: 단계(advanced·extension)별 키 */
    forStd: function (code, level) { var m = D && D.map[code]; return m ? (m[level] || []) : []; },
    count: function (code) { var m = D && D.map[code]; return m ? m.advanced.length + m.extension.length : 0; },
    name: examName
  };
})();
