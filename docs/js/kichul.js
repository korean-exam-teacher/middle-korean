/* 고등학교 성취기준 ↔ 평가원 기출 연결
 * data/kichul/bank.js (tools\build-kichul.ps1 로 생성)를 필요할 때만 불러온다.
 * 성취기준의 kichul 설정(areas/groups/any/items/max)이 없으면 영역 이름과 keywords·개념어로 자동 선택한다.
 * SITE_CONFIG.KICHUL_BASE 가 있으면 문제은행이 올려 둔 최신 데이터(data/kb.js·data/kb_explain.js·fig/)를 먼저 읽고,
 * 못 읽으면 data/kichul/ 사본을 쓴다.
 */
(function () {
  var loading = null, pool = null, byKey = {}, passages = {}, choices = {}, figs = { i: {}, p: {} };
  var expLoading = null;
  var cache = {};

  /* 교육과정 영역 → 문제은행 유형갈래 */
  var AREA_MAP = { "듣기·말하기": ["화법"], "읽기": ["독서"], "쓰기": ["작문"], "문법": ["문법"], "문학": ["문학"], "매체": ["매체"] };
  var SUBJECT_MAP = {
    "hs-speech-lang": ["화법", "문법"], "hs-read-write": ["독서", "작문"], "hs-literature": ["문학"], "hs-lit-media": ["문학", "매체"],
    "hs-topic-reading": ["독서"], "hs-job-comm": ["화법", "작문"], "hs-reading-debate": ["독서", "작문", "화법"],
    "hs-media-comm": ["매체"], "hs-lang-life": ["문법", "화법"]
  };
  /* 너무 흔해 변별력이 없는 낱말 */
  var STOP = ["글", "말", "국어", "이해", "표현", "활용", "내용", "자료", "태도", "과정", "방법", "의미", "읽기", "쓰기", "듣기", "말하기", "문학", "작품", "생각", "의사소통", "효과", "특성", "주제", "독자", "필자"];

  function script(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.onload = res;
      s.onerror = function () { rej(new Error(src + " 을(를) 불러오지 못했습니다.")); };
      document.body.appendChild(s);
    });
  }
  var BASE = ((window.SITE_CONFIG || {}).KICHUL_BASE || "").replace(/\/?$/, "/");
  if (BASE === "/") BASE = "";
  var figBase = BASE || "data/kichul/";
  /* 원격(문제은행)을 먼저, 안 되면 사본 */
  function remoteOr(remote, local) {
    if (!BASE) return script(local);
    return script(BASE + remote).catch(function () { figBase = "data/kichul/"; return script(local); });
  }
  function plain(s) { return String(s == null ? "" : s).replace(/[﷐-﷓]/g, ""); }

  function load() {
    if (loading) return loading;
    loading = Promise.all([remoteOr("data/kb.js", "data/kichul/bank.js"), script("data/kichul/brackets.js").catch(function () { window.KB_BRACKETS = {}; }),
      script("data/kichul/brackets-manual.js").catch(function () { window.KB_BRACKETS_MANUAL = {}; }),
      window.MAP2015 ? Promise.resolve() : script("data/mapping-2015.js")]).then(function () {
      /* 사람이 정한 범위가 자동 추출보다 우선(같은 표시면 덮어씀) */
      var M = window.KB_BRACKETS_MANUAL || {}, B = window.KB_BRACKETS = window.KB_BRACKETS || {};
      Object.keys(M).forEach(function (k) {
        var labs = M[k].map(function (x) { return x[0]; });
        B[k] = (B[k] || []).filter(function (x) { return labs.indexOf(x[0]) < 0; }).concat(M[k]);
      });
      var KB = window.KB;
      passages = Object.assign({}, KB.passages, KB.passages2028 || {});
      choices = Object.assign({}, KB.choices, KB.choices2028 || {});
      figs = KB.figs || figs;
      var items = KB.items.concat(KB.items2028 || []);
      pool = items.map(function (it) {
        var key = it.exam_id + "||" + it["영역"] + "||" + it["문항번호"];
        var ch = choices[key] || [];
        var pkey = it["지문범위"] !== "(독립 문항)" ? it.exam_id + "||" + it["영역"] + "||" + it["지문범위"] : null;
        var rec = {
          key: key, it: it, pkey: pkey,
          text: plain(it["발문"]) + " " + plain(it["보기"]) + " " + ch.map(plain).join(" "),
          ptext: pkey ? plain(passages[pkey]) : "",
          rank: Number(it["연도"]) * 100 + Number(it["시행월"])
        };
        byKey[key] = rec;
        return rec;
      });
      delete window.KB;
      buildMap();
    });
    return loading;
  }

  /* 2015 성취기준별 기출 → 매핑된 2022 성취기준으로 모으기 */
  var by2015 = {}, by2022 = {}, src2022 = {};
  function matches(p, m) {
    var it = p.it;
    if (m.exam && m.exam.length && m.exam.indexOf(it["영역"]) < 0) return false;
    if (m.kinds && m.kinds.length && m.kinds.indexOf(it["유형갈래"]) < 0) return false;
    if (m.groups && m.groups.length && m.groups.indexOf(it["유형묶음"]) < 0) return false;
    if (m.genres && m.genres.length && !(it["갈래"] || []).some(function (g) { return m.genres.indexOf(g) >= 0; })) return false;
    if (m.any && m.any.length && !m.any.some(function (w) { return p.text.indexOf(w) >= 0 || p.ptext.indexOf(w) >= 0; })) return false;
    return true;
  }
  function buildMap() {
    by2015 = {}; by2022 = {}; src2022 = {};
    (window.MAP2015 || []).forEach(function (s) {
      var keys = s.match ? pool.filter(function (p) { return matches(p, s.match); }).map(function (p) { return p.key; }) : [];
      by2015[s.code] = keys;
      (s.to || []).forEach(function (c) {
        var set = by2022[c] = by2022[c] || {};
        keys.forEach(function (k) { set[k] = 1; });
        (src2022[c] = src2022[c] || []).push({ code: s.code, subject: s.subject, text: s.text, n: keys.length, exam: !!s.match });
      });
    });
  }
  function loadExplain() {
    if (!expLoading) expLoading = remoteOr("data/kb_explain.js", "data/kichul/explain.js").then(function () { return window.KB_EXPLAIN.i || window.KB_EXPLAIN; });
    return expLoading;
  }

  function hits(text, words) {
    var n = 0;
    words.forEach(function (w) { var i = -1; while ((i = text.indexOf(w, i + 1)) >= 0) n++; });
    return n;
  }

  /* 성취기준 하나에 대한 기출 목록: { basic: [key], advanced: [key], extension: [key] } */
  function select(std, subject, area) {
    if (cache[std.code]) return cache[std.code];
    var k = std.kichul || {};
    var areas = (k.areas && k.areas.length) ? k.areas : (AREA_MAP[area.name] || SUBJECT_MAP[subject.id] || []);
    var groups = k.groups || [];
    var words = (k.any && k.any.length) ? k.any.slice() : [];
    if (!words.length) {
      (std.keywords || []).forEach(function (w) { words.push(w); });
      (std.concepts || []).forEach(function (c) { words.push(c.term); });
    }
    words = words.map(function (w) { return String(w).replace(/\(.*?\)/g, "").trim(); })
      .filter(function (w, i, a) { return w.length >= 2 && STOP.indexOf(w) < 0 && a.indexOf(w) === i; });
    var max = k.max || 9;

    /* 후보 = 이 2022 성취기준에 매핑된 2015 성취기준들의 기출(합집합). 매핑이 없으면 후보 없음.
       순서는 이 성취기준의 핵심 낱말이 많이 나오는 문항, 최신 시험 순. 성취기준의 kichul.exclude 로 뺄 수 있다. */
    var set = by2022[std.code] || {}, ex = k.exclude || [];
    var cands = [];
    Object.keys(set).forEach(function (key) {
      if (ex.indexOf(key) >= 0) return;
      var p = byKey[key]; if (!p) return;
      var h = 1 + hits(p.text, words) * 2 + Math.min(4, hits(p.ptext, words));
      cands.push({ key: key, score: h, rank: p.rank, set: p.pkey, pts: Number(p.it["배점"]) || 2 });
    });
    cands.sort(function (a, b) { return b.score - a.score || b.rank - a.rank; });

    var picked = (k.items || []).filter(function (x) { return byKey[x]; }).map(function (x) { return { key: x, pts: Number(byKey[x].it["배점"]) || 2 }; });
    var seen = {};
    picked.forEach(function (p) { if (byKey[p.key].pkey) seen[byKey[p.key].pkey] = 1; });
    for (var i = 0; i < cands.length && picked.length < max; i++) {
      var c = cands[i];
      if (picked.some(function (p) { return p.key === c.key; })) continue;
      if (c.set) { if (seen[c.set]) continue; seen[c.set] = 1; }
      picked.push(c);
    }
    /* 2점 → 기본, 3점 → 심화. 한쪽이 비면 나눠 담는다. 최신 시험 먼저 */
    var byRecent = function (a, b) { return byKey[b.key].rank - byKey[a.key].rank; };
    var two = picked.filter(function (p) { return p.pts < 3; }).sort(byRecent);
    var three = picked.filter(function (p) { return p.pts >= 3; }).sort(byRecent);
    if (!three.length && two.length > 3) three = two.splice(Math.ceil(two.length / 2));
    if (!two.length && three.length > 3) two = three.splice(0, Math.ceil(three.length / 2));
    var out = {
      basic: two.slice(0, 5).map(function (p) { return p.key; }),
      advanced: three.slice(0, 4).map(function (p) { return p.key; }),
      extension: three.slice(4).concat(two.slice(5)).map(function (p) { return p.key; })
    };
    cache[std.code] = out;
    return out;
  }

  function item(key) {
    var r = byKey[key]; if (!r) return null;
    var it = r.it, fi = (figs.i || {})[key], pf = r.pkey ? (figs.p || {})[r.pkey] : null;
    /* 지문 원본 그림은 여러 장 배열([{f,w,h,c}, …])로 들어 있다 */
    if (pf) pf = { f: (Array.isArray(pf) ? pf : [pf]).map(function (x) { return x.f; }).join(" ") };
    return {
      key: key, exam: it["명칭"], examId: it.exam_id, no: it["문항번호"], area: it["영역"], range: it["지문범위"],
      stem: it["발문"], bogi: it["보기"], choices: choices[key] || [], answer: Number(it["정답"]), score: Number(it["배점"]) || 2,
      group: it["유형묶음"], fig: fi || null,
      bogiBrackets: (window.KB_BRACKETS || {})["보기:" + key] || [],
      passage: r.pkey ? { text: passages[r.pkey] || "", fig: pf ? pf.f : null, brackets: (window.KB_BRACKETS || {})[r.pkey] || [] } : null
    };
  }

  window.Kichul = {
    load: load, loadExplain: loadExplain, figBase: function () { return figBase; }, select: select, item: item, ready: function () { return !!pool; },
    /* 교사용: 2022 성취기준의 연결 근거(2015 성취기준 목록)와 후보 문항 수 */
    sources: function (code) { return src2022[code] || []; },
    candidates: function (code) { return Object.keys(by2022[code] || {}).length; },
    count2015: function (code) { return (by2015[code] || []).length; }
  };
})();
