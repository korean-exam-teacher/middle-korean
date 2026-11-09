/*
 * 학력평가(전국연합학력평가) 문항 (2026-11-09 v94)
 * - data/hakpyeong/index.js: 회차·문항·지문(원본 쪽 그림의 잘라 보일 범위)·성취기준 연결
 * - data/hakpyeong/explain.js: 해설(필요할 때만)
 * - data/hakpyeong/img/<회차(고→g)>_<쪽>.png: 원본 문제지 쪽 그림. 문항은 이 그림을 잘라 보여 준다(문항 모양 그대로).
 * 출처: 각 시·도 교육청 주관 전국연합학력평가 문제지·정답 및 해설(EBSi 제공)
 */
(function () {
  var BASE = "data/hakpyeong/";
  var loading = null, expLoading = null, D = null, EX = {};
  function script(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.onload = res;
      s.onerror = function () { rej(new Error(src + " 을(를) 불러오지 못했습니다.")); };
      document.body.appendChild(s);
    });
  }
  function load() {
    if (!loading) loading = script(BASE + "index.js?v=" + (window.HP_VER || "94")).then(function () {
      D = window.HP_DATA; delete window.HP_DATA;
      D.exams.forEach(function (e) { EX[e.id] = e; });
    });
    return loading;
  }
  function loadExplain() {
    if (!expLoading) expLoading = script(BASE + "explain.js?v=" + (window.HP_VER || "94")).then(function () { var E = window.HP_EXPLAIN; delete window.HP_EXPLAIN; return E; });
    return expLoading;
  }
  function crops(list, e) {
    return (list || []).map(function (c) {
      var pg = e.pages[c[0]] || [595, 842];
      return { src: BASE + "img/" + e.id.replace("고", "g") + "_" + c[0] + ".png", W: pg[0], H: pg[1], x0: c[1], y0: c[2], x1: c[3], y1: c[4] };
    });
  }
  function examName(e) { return e.y + "년 " + e.m + "월 고" + e.g + " 학력평가"; }
  function item(key) {
    var it = D && D.items[key]; if (!it) return null;
    var e = EX[it.e], p = it.p ? D.passages[it.p] : null;
    return {
      key: key, hp: true, exam: examName(e), examId: e.id, no: it.n, area: it.a, range: it.s, stem: it.st, bogi: "", choices: it.ch,
      answer: Number(it.ans) || 0, score: it.pts, group: it.gr, kind: it.k, intent: it.it,
      crops: crops(it.c, e), passage: p ? { crops: crops(p.c, e), head: p.head } : null
    };
  }
  window.HP = {
    load: load, loadExplain: loadExplain, item: item, ready: function () { return !!D; },
    exams: function (g) { return D.exams.filter(function (e) { return !g || e.g === g; }); },
    exam: function (id) { return EX[id] || null; },
    passage: function (pkey) { var p = D.passages[pkey]; if (!p) return null; var e = EX[pkey.split("||")[0]]; return { key: pkey, crops: crops(p.c, e), head: p.head, range: pkey.split("||")[2] }; },
    /* 성취기준 하나의 학력평가 문항: 단계(advanced·extension)별 키 */
    forStd: function (code, level) { var m = D && D.map[code]; return m ? (m[level] || []) : []; },
    count: function (code) { var m = D && D.map[code]; return m ? m.advanced.length + m.extension.length : 0; },
    name: examName
  };
})();
