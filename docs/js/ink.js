/*
 * 판서 — 화면 위에 펜으로 쓰기 (2026-11-09 v89)
 * - 누구나 ✎ 단추로 화면(본문) 위에 쓸 수 있다. 쓴 것은 이 브라우저에 화면마다 저장된다.
 * - 수업 코드로 수업을 연 교사의 판서는 학생 화면에 그대로 나타난다(js/live.js).
 * - 학생이 쓴 것은 학생 화면에만 남고 교사에게 가지 않는다.
 * 좌표는 본문(<main>) 너비를 1000으로 둔 값이라 화면 크기가 달라도 같은 자리에 놓인다.
 * v91: 다른 갈래(수능·논술·곶·서논술·첫 화면)에서도 쓴다 — window.KME_TOOLS = { root: "body", keyPath: true }
 *   root: 판서를 얹을 곳(없으면 학습소 본문 "#app main"), keyPath: 화면 키에 주소 경로까지 넣기
 * v102: 펜이 안 써지던 문제·지연을 없앰
 *   - 지금 긋는 획은 화면 크기 캔버스(desynchronized)에 바로 그리고, 손을 떼면 그 획 하나만 SVG에 붙인다(전체 다시 그리기 없음).
 *   - getCoalescedEvents(사이 점까지)·getPredictedEvents(앞질러 그리기)로 펜 끝을 바짝 따라간다.
 *   - 펜·손가락·마우스 모두 쓴다. 펜이 닿아 있거나 막 뗀 때(0.6초)만 손바닥(터치)을 무시하고, 펜을 쓰는 기기에서는 손가락으로 끌면 화면이 내려간다.
 *   - iPad: 길게 누름·확대경·글자 고르기를 막는다(touchstart 막기, user-select 끔).
 * v116: 필기를 시작하면 화면이 까맣게 되던 것을 고침
 *   - 긋는 중인 획을 그리는 캔버스(ink-live)의 크기에 위 한도를 둔다(가로·세로 4096, 넓이 400만 점). 수업 중 휴대폰이 선생님 화면 너비로 바뀌면 캔버스가 수천만 점이 되어 기기가 감당하지 못했다.
 *   - 안드로이드에서는 캔버스를 쓰지 않고 긋는 중인 획도 SVG 한 줄로 그린다(일부 기기에서 빠른 캔버스가 검게 나오는 일이 있어서).
 * v115: 수업에서 선생님이 긋는 중인 획도 바로 보이게 — 획마다 이름표(i, 만든 순서대로 늘어남)를 달고, 긋는 중인 획은 따로 알린다(onChange 넷째 값, showCur)
 * v114: 필기를 그 아래 있는 것에 붙여 둔다(획마다 a = 붙인 곳의 열쇠)
 *   - 획을 긋기 시작한 자리 아래의 문항 그림·문항 칸·문단을 찾아, 좌표를 그것의 왼쪽 위·너비(=1000) 기준으로 적는다.
 *   - 화면 크기가 다르거나(선생님 큰 화면 · 학생 태블릿) 위쪽 내용의 높이가 달라도 그 그림·칸 위 같은 자리에 나타난다. 접어서 안 보이면 필기도 숨는다.
 *   - 붙일 곳이 없는 빈 자리의 획과 예전 획(a 없음)은 전처럼 본문 너비 기준.
 * v111: 화면 전체에 쓴다 · 손가락 단추 · 과제 화면 같은 덧창에서도 쓴다
 *   - 필기 층이 문서 전체(머리·옆 여백 포함)를 덮는다. 좌표는 전처럼 본문 너비 1000 기준이라 예전 필기는 그 자리에 그대로.
 *   - 손가락 단추: 필기를 켠 채로 화면을 누르고 옮길 수 있다(필기는 보이기만 함). 다시 누르거나 색을 고르면 펜으로.
 *   - [data-ink-host="열쇠"]가 붙은 덧창(스스로 스크롤하는 화면: 과제 풀기 등)이 열려 있으면 그 덧창 위에 쓴다(필기는 열쇠마다 따로 저장).
 */
(function () {
  var COLORS = [["#2B2A28", "먹"], ["#2F5D9E", "청화"], ["#B5483B", "진사"], ["hl", "형광"]];
  var LSK = "kme.ink.";
  var on = false, color = COLORS[0][0], mine = [], teacher = [], cur = null, key = "", main = null, svg = null, gT = null, gM = null, bar = null;
  var listeners = [];
  var KT = window.KME_TOOLS || {};
  var ROOT = KT.root || "#app main";
  function rootEl() { return ROOT === "body" ? document.body : document.querySelector(ROOT); }
  var host = null;   /* v111: 지금 열려 있는 덧창(없으면 null) */
  function findHost() {
    var l = document.querySelectorAll("[data-ink-host]"), h = null;
    for (var i = 0; i < l.length; i++) { var e = l[i]; if (!e.hidden && e.getClientRects().length && e.clientWidth > 0) h = e; }
    return h;
  }
  /* v113: 덧창 안에 기준 칸(data-ink-ref, 예: 가운데 문제 칸)이 있으면 그 칸의 왼쪽 위가 (0,0), 그 너비가 1000 — 화면 크기가 달라도(선생님·학생) 문제 위 같은 자리에 놓인다 */
  function hostGeo() {
    var hr = host.getBoundingClientRect(), sel = host.getAttribute("data-ink-ref"), ref = sel ? host.querySelector(sel) : null;
    var L = hr.left + host.clientLeft, T = hr.top + host.clientTop, g = { L: L, T: T, hw: host.clientWidth || 1, hh: host.clientHeight };
    if (ref) { var rr = ref.getBoundingClientRect(); g.ox = rr.left; g.oy = rr.top; g.w = rr.width || 1; }
    else { g.ox = L - host.scrollLeft; g.oy = T - host.scrollTop; g.w = g.hw; }
    g.vb = ((L - g.ox) / g.w * 1000) + " " + ((T - g.oy) / g.w * 1000) + " " + (g.hw / g.w * 1000) + " " + (g.hh / g.w * 1000);
    return g;
  }
  function baseKey() { return (KT.keyPath ? location.pathname.replace(/index\.html$/, "") : "") + (location.hash || "#/"); }
  function pageKey() { return host ? "host:" + host.getAttribute("data-ink-host") : baseKey(); }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(LSK + k) || "[]"); } catch (e) { return []; } }
  function lsSet(k, v) { try { if (v.length) localStorage.setItem(LSK + k, JSON.stringify(v)); else localStorage.removeItem(LSK + k); } catch (e) {} }
  var NS = "http://www.w3.org/2000/svg";

  var live = null, lctx = null, LDPR = 1;
  function fitLive() {
    if (!live) return;
    var w = document.documentElement.clientWidth, h = window.innerHeight;
    LDPR = Math.max(0.5, Math.min(window.devicePixelRatio || 1, Math.sqrt(4e6 / Math.max(1, w * h)), 4096 / Math.max(1, w), 4096 / Math.max(1, h)));   /* 캔버스가 너무 커지지 않게 */
    live.style.width = w + "px"; live.style.height = h + "px";
    live.width = Math.round(w * LDPR); live.height = Math.round(h * LDPR);
    lctx.setTransform(LDPR, 0, 0, LDPR, 0, 0); lctx.lineCap = "round"; lctx.lineJoin = "round";
  }
  var NOCANVAS = /Android/i.test(navigator.userAgent || ""), liveEl = null;
  function ensureLive() {
    if (live || NOCANVAS) return;
    live = document.createElement("canvas"); live.className = "ink-live no-print"; live.setAttribute("aria-hidden", "true");
    document.body.appendChild(live);
    lctx = live.getContext("2d");
    fitLive();
  }
  (function css() {
    var st = document.createElement("style");
    st.textContent = ".ink-live{position:fixed;left:0;top:0;z-index:26;pointer-events:none}" +
      "body.ink-on{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}" +
      "body.ink-on .ink-layer{pointer-events:auto;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}" +
      "svg.ink-layer{z-index:54}" +   /* 붙박이 머리(메뉴) 위에도 쓸 수 있게 */
      ".ink-layer.ink-fixed{position:fixed!important}" +
      "body.ink-on.ink-hand .ink-layer{pointer-events:none!important}body.ink-on.ink-hand{-webkit-user-select:auto;user-select:auto;-webkit-touch-callout:default}" +
      ".ink-bar .ink-hand{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;padding:0;border-radius:50%}.ink-bar .ink-hand.sel{background:#2F4F7F;color:#fff}" +
      ".ink-bar{max-width:calc(100vw - 16px);flex-wrap:wrap}" +
      ".ink-bar .ink-pen{width:auto!important;min-width:36px;padding:0 14px 0 11px!important;border-radius:999px!important;display:inline-flex;align-items:center;gap:5px;font-size:14px!important;height:36px}" +
      ".ink-bar .ink-pen i{font-style:normal;font-size:17px;line-height:1}" +
      "@media print{.ink-live{display:none!important}}";
    document.head.appendChild(st);
  })();

  function ensure() {
    var m = rootEl();
    if (!m) { if (svg) svg.style.display = "none"; return false; }
    if (!svg) {
      svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "ink-layer no-print"); svg.setAttribute("aria-hidden", "true");
      gT = document.createElementNS(NS, "g"); gC = document.createElementNS(NS, "g"); gM = document.createElementNS(NS, "g");
      svg.appendChild(gT); svg.appendChild(gC); svg.appendChild(gM); document.body.appendChild(svg);
      svg.addEventListener("pointerdown", down);
      /* iPad: 펜·손가락이 닿자마자 확대경·글자 고르기·길게 누름 메뉴가 뜨지 않게 */
      ["touchstart", "touchmove"].forEach(function (t) { svg.addEventListener(t, function (e) { if (on) e.preventDefault(); }, { passive: false }); });
      svg.addEventListener("contextmenu", function (e) { if (on) e.preventDefault(); });
    }
    main = m; svg.style.display = "";
    if (host) {   /* 덧창: 덧창이 보이는 칸에 붙박아 두고, 스크롤한 만큼 그림을 옮긴다 */
      var g = hostGeo(), z = parseInt(getComputedStyle(host).zIndex, 10) || 0;
      svg.classList.add("ink-fixed");
      svg.style.left = g.L + "px"; svg.style.top = g.T + "px"; svg.style.width = g.hw + "px"; svg.style.height = g.hh + "px";
      svg.style.zIndex = z + 1; if (bar) { bar.style.zIndex = z + 3; bar.style.bottom = (host.getAttribute("data-ink-bottom") || 16) + "px"; } if (live) live.style.zIndex = z + 2;
      svg.setAttribute("viewBox", g.vb);
      return true;
    }
    svg.classList.remove("ink-fixed"); svg.style.zIndex = ""; if (bar) { bar.style.zIndex = ""; bar.style.bottom = ""; } if (live) live.style.zIndex = "";
    /* 문서 전체를 덮는다. 본문(main)의 왼쪽 위가 (0,0), 본문 너비가 1000 */
    var r = main.getBoundingClientRect(), w = r.width || 1, mx = r.left + scrollX, my = r.top + scrollY;
    if (main === document.body) { w = document.documentElement.clientWidth; mx = 0; my = 0; }
    svg.style.height = "0px"; svg.style.width = "0px";
    var dw = Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth), dh = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    svg.style.left = "0px"; svg.style.top = "0px"; svg.style.width = dw + "px"; svg.style.height = dh + "px";
    svg.setAttribute("viewBox", (-mx / w * 1000) + " " + (-my / w * 1000) + " " + (dw / w * 1000) + " " + (dh / w * 1000));
    return true;
  }
  function pt(e) {
    if (host) { var g = hostGeo(); return [Math.round((e.clientX - g.ox) / g.w * 1000), Math.round((e.clientY - g.oy) / g.w * 1000)]; }
    var r = main.getBoundingClientRect(), w = r.width;
    if (main === document.body) { r = { left: -scrollX, top: -scrollY }; w = document.documentElement.clientWidth; }
    return [Math.round((e.clientX - r.left) / w * 1000), Math.round((e.clientY - r.top) / w * 1000)];
  }
  var BLOCKS = ["img", ".q", ".gm-q", ".gm-pas", ".bk-sv-q", ".bk-sv-p", ".qb", ".bk-solve-item", "details.kq", ".pg-body", ".detail", ".pic", ".pas", ".ptext", ".bogi", ".choices", ".chs", ".nums", "table", "li", "p", "h1", "h2", "h3", "dd", "dt", "article", "section"];
  var BSEL = BLOCKS.join(",");
  function scopeEl() { return host || document.body; }
  /* 그림의 열쇠: 주소의 경로. 그림을 통째로 담은 주소(data:)는 길이와 짧은 요약값만(획마다 적어 두므로 짧아야 한다) */
  function srcKey(im) {
    var u = im.getAttribute("src") || "", n = u.length, k;
    if (im._ik && im._ikn === n) return im._ik;
    if (u.slice(0, 5) === "data:") { var h = 5381, step = Math.max(1, Math.floor(n / 4000)); for (var i = 0; i < n; i += step) h = ((h << 5) + h + u.charCodeAt(i)) | 0; k = "d" + n.toString(36) + "." + (h >>> 0).toString(36); }
    else { try { k = new URL(u, location.href).pathname; } catch (e) { k = u; } }
    im._ik = k; im._ikn = n; return k;
  }
  function sameSrc(sc, k) { var out = [], l = sc.getElementsByTagName("img"); for (var i = 0; i < l.length; i++) if (srcKey(l[i]) === k) out.push(l[i]); return out; }
  /* 화면의 한 점 아래에서 필기를 붙일 곳 → { el, key } (없으면 null) */
  function anchorAt(x, y) {
    if (!svg) return null;
    svg.style.pointerEvents = "none"; if (live) live.style.display = "none";
    var t = document.elementFromPoint(x, y);
    svg.style.pointerEvents = ""; if (live) live.style.display = "";
    var sc = scopeEl();
    if (!t || !sc.contains(t) || (bar && bar.contains(t)) || !t.closest) return null;
    var a = t.closest(BSEL); if (!a || a === sc || !sc.contains(a)) return null;
    var r = a.getBoundingClientRect(); if (r.width < 24 || r.height < 8) return null;
    if (a.tagName === "IMG") { var k = srcKey(a), same = sameSrc(sc, k); return { el: a, key: "img|" + k + "|" + Math.max(0, same.indexOf(a)) }; }
    for (var i = 1; i < BLOCKS.length; i++) if (a.matches(BLOCKS[i])) { var idx = Array.prototype.indexOf.call(sc.querySelectorAll(BLOCKS[i]), a); return idx < 0 ? null : { el: a, key: BLOCKS[i] + "|" + idx }; }
    return null;
  }
  function findAnchor(key, cache) {
    if (cache && key in cache) return cache[key];
    var sc = scopeEl(), p = key.split("|"), e = null;
    if (p[0] === "img") e = sameSrc(sc, p.slice(1, -1).join("|"))[+p[p.length - 1]] || null;
    else if (BLOCKS.indexOf(p[0]) > 0) e = sc.querySelectorAll(p[0])[+p[1]] || null;
    if (cache) cache[key] = e;
    return e;
  }
  /* 바탕 좌표(본문·덧창 기준 칸)의 원점과 너비 — 화면 좌표로 */
  function baseGeo() {
    if (host) { var g = hostGeo(); return { ox: g.ox, oy: g.oy, w: g.w }; }
    if (main === document.body) return { ox: -scrollX, oy: -scrollY, w: document.documentElement.clientWidth || 1 };
    var r = main.getBoundingClientRect(); return { ox: r.left, oy: r.top, w: r.width || 1 };
  }
  /* 붙여 둔 획들을 지금 그것이 있는 자리로 옮긴다(배치가 바뀔 때마다) */
  function placeAll() {
    if (!svg || !main) return;
    var b = null, cache = {};
    [gT, gC, gM].forEach(function (g) {
      for (var n = g.firstChild; n; n = n.nextSibling) {
        var st = n._s; if (!st || !st.a) continue;
        if (!b) b = baseGeo();
        var e = findAnchor(st.a, cache), r = e ? e.getBoundingClientRect() : null;
        if (!r || r.width < 2) { if (n.style.display !== "none") n.style.display = "none"; continue; }
        var k = r.width / b.w, tf = "translate(" + ((r.left - b.ox) / b.w * 1000).toFixed(2) + " " + ((r.top - b.oy) / b.w * 1000).toFixed(2) + ") scale(" + k.toFixed(5) + ")";
        if (n._tf !== tf) { n._tf = tf; n.setAttribute("transform", tf); n.setAttribute("stroke-width", ((st.c === "hl" ? 16 : 3.2) / k).toFixed(2)); }
        if (n.style.display === "none") n.style.display = "";
      }
    });
  }
  function pathD(p) {
    if (p.length < 4) return "M" + p[0] + " " + p[1] + "l0.1 0";
    var d = "M" + p[0] + " " + p[1];
    for (var i = 2; i < p.length - 2; i += 2) { var mx = (p[i] + p[i + 2]) / 2, my = (p[i + 1] + p[i + 3]) / 2; d += "Q" + p[i] + " " + p[i + 1] + " " + mx + " " + my; }
    return d + "L" + p[p.length - 2] + " " + p[p.length - 1];
  }
  function el(s) {
    var path = document.createElementNS(NS, "path"), hl = s.c === "hl";
    path.setAttribute("d", pathD(s.p)); path.setAttribute("fill", "none");
    path.setAttribute("stroke", hl ? "#F2D65C" : s.c); path.setAttribute("stroke-width", hl ? 16 : 3.2);
    path.setAttribute("stroke-linecap", "round"); path.setAttribute("stroke-linejoin", "round");
    if (hl) { path.setAttribute("stroke-opacity", ".38"); path.style.mixBlendMode = "multiply"; }
    path._s = s;
    return path;
  }
  function draw(g, list) { while (g.firstChild) g.removeChild(g.firstChild); list.forEach(function (s) { g.appendChild(el(s)); }); placeAll(); }
  function redraw() { if (!ensure()) return; draw(gT, teacher); draw(gM, mine); }   /* 긋는 중인 획은 캔버스(ink-live)에 있다 */
  var gC = null, ridN = 0;
  function rid() { return Date.now().toString(36) + (ridN++ % 1296).toString(36); }   /* 획 이름표: 만든 순서대로 늘어난다 */
  function tagAll(l) { l.forEach(function (x) { if (!x.i) x.i = rid(); }); return l; }
  /* 듣는 쪽(live.js)에: (끝난 획들, 화면 열쇠, 손을 뗐는가, 긋는 중인 획) */
  function emit(final) { listeners.forEach(function (f) { try { f(mine, key, final, cur); } catch (e) { console.error(e); } }); }

  var sendT = 0, tool = "pen", hist = [];
  var ER = { stroke: 14, part: 12 };   /* 지우개 반지름(본문 너비 1000 기준) */
  function snap() { hist.push(JSON.stringify(mine)); if (hist.length > 60) hist.shift(); }
  /* 점 하나와 선분 사이 거리 */
  function segDist(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0;
    var x = ax + t * dx - px, y = ay + t * dy - py; return Math.sqrt(x * x + y * y);
  }
  function hits(s, x, y, r, k) {
    var p = s.p, rr = (r + (s.c === "hl" ? 8 : 2)) / (k || 1);
    if (p.length < 4) return Math.hypot(p[0] - x, p[1] - y) <= rr;
    for (var i = 0; i < p.length - 2; i += 2) if (segDist(x, y, p[i], p[i + 1], p[i + 2], p[i + 3]) <= rr) return true;
    return false;
  }
  /* 화면의 한 점을 그 획의 좌표로: [x, y, 배율] (붙인 곳이 지금 안 보이면 null) */
  function locOf(s, cx, cy, b, cache) {
    if (!s.a) return [(cx - b.ox) / b.w * 1000, (cy - b.oy) / b.w * 1000, 1];
    var e = findAnchor(s.a, cache), r = e ? e.getBoundingClientRect() : null;
    if (!r || r.width < 2) return null;
    return [(cx - r.left) / r.width * 1000, (cy - r.top) / r.width * 1000, r.width / b.w];
  }
  /* 획 지우개: 닿은 획을 통째로 */
  function eraseStroke(cx, cy, b, cache) {
    var before = mine.length;
    mine = mine.filter(function (s) { var q = locOf(s, cx, cy, b, cache); return !(q && hits(s, q[0], q[1], ER.stroke, q[2])); });
    return mine.length !== before;
  }
  /* 부분 지우개: 닿은 부분만 잘라 내고 나머지는 남긴다 */
  function densify(p, step) {
    var out = [p[0], p[1]];
    for (var i = 2; i < p.length; i += 2) {
      var ax = p[i - 2], ay = p[i - 1], bx = p[i], by = p[i + 1], d = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(d / step));
      for (var k = 1; k <= n; k++) out.push(Math.round(ax + (bx - ax) * k / n), Math.round(ay + (by - ay) * k / n));
    }
    return out;
  }
  function erasePart(cx, cy, b, cache) {
    var changed = false, out = [];
    mine.forEach(function (s) {
      var q = locOf(s, cx, cy, b, cache);
      if (!q || !hits(s, q[0], q[1], ER.part, q[2])) { out.push(s); return; }
      changed = true;
      var x = q[0], y = q[1], p = densify(s.p, 3 / q[2]), run = [], r = (ER.part + (s.c === "hl" ? 8 : 2)) / q[2];
      var keep = function () { if (run.length >= 4) { var o = { c: s.c, p: run, i: rid() }; if (s.a) o.a = s.a; out.push(o); } run = []; };
      for (var i = 0; i < p.length; i += 2) { if (Math.hypot(p[i] - x, p[i + 1] - y) <= r) keep(); else run.push(p[i], p[i + 1]); }
      keep();
    });
    if (changed) mine = out;
    return changed;
  }
  var penAt = 0, penSeen = false, activeId = null;
  function W() { return host ? hostGeo().w : main === document.body ? document.documentElement.clientWidth : main.getBoundingClientRect().width; }
  /* 지금 긋는 획: 화면 좌표(cl)로 캔버스에 그린다. 예측 점(pr)은 꼬리로만 붙이고 저장하지 않는다 */
  function paintLive(cl, pr, c) {
    if (NOCANVAS) {   /* 캔버스 없이: 긋는 중인 획을 SVG 한 줄로 */
      if (!cur || !gM) return;
      if (!liveEl || !liveEl.parentNode || liveEl._s !== cur) { if (liveEl && liveEl.parentNode) liveEl.parentNode.removeChild(liveEl); liveEl = el(cur); gM.appendChild(liveEl); placeAll(); } else liveEl.setAttribute("d", pathD(cur.p));
      return;
    }
    if (!lctx) return;
    lctx.clearRect(0, 0, live.width / LDPR, live.height / LDPR);
    var p = pr && pr.length ? cl.concat(pr) : cl, hl = c === "hl", k = W() / 1000;
    lctx.strokeStyle = hl ? "rgba(242,214,92,.45)" : c; lctx.lineWidth = (hl ? 16 : 3.2) * k;
    lctx.beginPath(); lctx.moveTo(p[0], p[1]);
    if (p.length < 4) lctx.lineTo(p[0] + 0.1, p[1]);
    else {
      for (var i = 2; i < p.length - 2; i += 2) lctx.quadraticCurveTo(p[i], p[i + 1], (p[i] + p[i + 2]) / 2, (p[i + 1] + p[i + 3]) / 2);
      lctx.lineTo(p[p.length - 2], p[p.length - 1]);
    }
    lctx.stroke();
  }
  /* 펜·손가락으로 '톡' 누르면(거의 안 움직이고 짧게) 아래 단추·링크를 눌러 준다 — 필기를 켠 채로 답을 고를 수 있게 */
  function tapThrough(x, y) {
    svg.style.pointerEvents = "none"; if (live) live.style.display = "none";
    var t = document.elementFromPoint(x, y);
    svg.style.pointerEvents = ""; if (live) live.style.display = "";
    var c = t && t.closest && t.closest("button,a[href],label,input,select,textarea,summary,[role=button],[data-id]");
    if (!c || (bar && bar.contains(c))) return false;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(c.tagName) && c.type !== "checkbox" && c.type !== "radio") { c.focus(); return true; }
    c.click(); return true;
  }
  function clearLive() { if (liveEl) { if (liveEl.parentNode) liveEl.parentNode.removeChild(liveEl); liveEl = null; } if (lctx) lctx.clearRect(0, 0, live.width / LDPR, live.height / LDPR); }
  function down(e) {
    if (!on) return;
    e.preventDefault();
    var isPen = e.pointerType === "pen";
    if (isPen) { penSeen = true; penAt = Date.now(); }
    if (activeId !== null && activeId !== e.pointerId) return;                 /* 두 번째 손가락·손바닥 */
    if (e.pointerType === "touch" && (Date.now() - penAt < 600)) return;     /* 펜을 막 쓰는 중 닿은 손바닥 */
    /* 펜을 쓰는 기기에서 손가락으로 끌면: 쓰지 않고 화면을 내린다 */
    if (e.pointerType === "touch" && penSeen && tool === "pen") {
      var sy = e.clientY, sx = e.clientX, id0 = e.pointerId;
      try { svg.setPointerCapture(id0); } catch (x) {}
      var ox = sx, oy = sy, t0 = Date.now();
      var sm = function (ev) { if (ev.pointerId !== id0) return; (host || window).scrollBy(sx - ev.clientX, sy - ev.clientY); sx = ev.clientX; sy = ev.clientY; };
      var su = function (ev) { if (ev.pointerId !== id0) return; svg.removeEventListener("pointermove", sm); svg.removeEventListener("pointerup", su); svg.removeEventListener("pointercancel", su);
        if (ev.type === "pointerup" && Date.now() - t0 < 350 && Math.abs(ev.clientX - ox) + Math.abs(ev.clientY - oy) < 10) tapThrough(ev.clientX, ev.clientY); };
      svg.addEventListener("pointermove", sm); svg.addEventListener("pointerup", su); svg.addEventListener("pointercancel", su);
      return;
    }
    activeId = e.pointerId;
    try { svg.setPointerCapture(e.pointerId); } catch (x) {}
    snap();
    var erasing = tool !== "pen", changed = false, raf = 0;
    var eb = erasing ? baseGeo() : null, ec = {};
    var er = function (ev) {
      if (tool === "serase" ? eraseStroke(ev.clientX, ev.clientY, eb, ec) : erasePart(ev.clientX, ev.clientY, eb, ec)) {
        changed = true;
        if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(gM, mine); });
        var now = Date.now(); if (now - sendT > 250) { sendT = now; emit(false); }
      }
    };
    var cl = null, t0 = Date.now(), ox = e.clientX, oy = e.clientY, far = false;
    /* v114: 긋기 시작한 자리 아래의 그림·칸에 붙인다. 좌표는 그것의 왼쪽 위·너비 기준 */
    var A = erasing ? null : anchorAt(e.clientX, e.clientY), AR = A ? A.el.getBoundingClientRect() : null;
    var cpt = function (ev) { return AR ? [Math.round((ev.clientX - AR.left) / AR.width * 1000), Math.round((ev.clientY - AR.top) / AR.width * 1000)] : pt(ev); };
    var minStep = AR ? Math.max(1.2, 1.2 * W() / AR.width) : 1.2;
    if (erasing) er(e);
    else { ensureLive(); cur = { c: color, p: cpt(e) }; if (A) cur.a = A.key; cl = [e.clientX, e.clientY]; paintLive(cl, null, color); }
    var move = function (ev) {
      if (ev.pointerId !== activeId) return;
      if (ev.pointerType === "pen") penAt = Date.now();
      var list = ev.getCoalescedEvents ? ev.getCoalescedEvents() : null;
      if (!list || !list.length) list = [ev];
      for (var j = 0; j < list.length; j++) {
        if (erasing) { er(list[j]); continue; }
        var q = cpt(list[j]);
        var n = cur.p.length;
        if (Math.abs(q[0] - cur.p[n - 2]) + Math.abs(q[1] - cur.p[n - 1]) < minStep) continue;
        cur.p.push(q[0], q[1]); cl.push(list[j].clientX, list[j].clientY);
        if (Math.abs(list[j].clientX - ox) + Math.abs(list[j].clientY - oy) > 8) far = true;
      }
      if (erasing) return;
      var pr = [], pl = ev.getPredictedEvents ? ev.getPredictedEvents() : [];
      for (var t = 0; t < pl.length && t < 2; t++) pr.push(pl[t].clientX, pl[t].clientY);
      paintLive(cl, pr, cur.c);
      var now = Date.now(); if (now - sendT > 50) { sendT = now; emit(false); }   /* 긋는 중: 0.05초마다 알림(보내는 쪽에서 다시 걸러 보냄) */
    };
    var up = function (ev) {
      if (ev.pointerId !== activeId) return;
      activeId = null;
      if (ev.pointerType === "pen") penAt = Date.now();
      svg.removeEventListener("pointermove", move); svg.removeEventListener("pointerup", up); svg.removeEventListener("pointercancel", up);
      if (erasing) { if (raf) { cancelAnimationFrame(raf); raf = 0; draw(gM, mine); } if (changed) { setTimeout(function () { lsSet(key, mine); }, 0); emit(true); } else hist.pop(); return; }
      if (cur && !far && Date.now() - t0 < 300 && ev.type === "pointerup" && tapThrough(ev.clientX, ev.clientY)) { cur = null; clearLive(); hist.pop(); return; }
      if (cur) {
        var s0 = cur; s0.i = rid(); mine.push(s0); cur = null;
        if (ensure()) { gM.appendChild(el(s0)); placeAll(); }   /* 그 획 하나만 붙인다 */
        clearLive();
        setTimeout(function () { lsSet(key, mine); }, 0); emit(true);
      }
    };
    svg.addEventListener("pointermove", move); svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
  }

  /* ───────── 도구 ───────── */
  var IC_S = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18c3-6 6-10 9-10s1 6 4 6 2-3 3-4"/><path d="M3 21h18" opacity=".45"/></svg>';
  var IC_H = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10"/><path d="M12 10V8.5a1.5 1.5 0 0 1 3 0V11"/><path d="M15 11v-1a1.5 1.5 0 0 1 3 0v4.5c0 3.6-2.4 6-6 6h-.5c-2 0-3.3-.8-4.4-2.3L4.3 14.3a1.5 1.5 0 0 1 2.3-1.9L9 14.5"/></svg>';
  var IC_P = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4l5 5-9 9H6v-5z"/><path d="M6 18h14" opacity=".45"/></svg>';
  function renderBar() {
    if (!bar) { bar = document.createElement("div"); bar.className = "ink-bar no-print"; document.body.appendChild(bar); }
    bar.classList.toggle("on", on);
    bar.innerHTML = (KT.classBtn ? '<button type="button" class="ink-class" data-ink="class" title="수업 열기·참여">' + (window.Live && Live.code() ? "수업 " + Live.code() : "수업") + "</button>" : "") +
      '<button type="button" class="ink-pen" data-ink="toggle" title="' + (on ? "필기 끄기" : "필기 — 화면 위에 펜으로 쓰기") + '" aria-pressed="' + on + '"><i>✎</i>' + (on ? "끄기" : "필기") + "</button>" +
      (on ? '<button type="button" class="ink-hand' + (tool === "hand" ? " sel" : "") + '" data-ink="hand" aria-pressed="' + (tool === "hand") + '" title="손가락 — 필기는 그대로 두고 화면을 누르고 옮기기 (다시 누르면 펜)">' + IC_H + '</button>' + COLORS.map(function (c) { return '<button type="button" class="ink-c' + (tool === "pen" && c[0] === color ? " sel" : "") + '" data-ink-c="' + c[0] + '" title="' + c[1] + '" style="--c:' + (c[0] === "hl" ? "#F2D65C" : c[0]) + '"></button>'; }).join("") +
        '<span class="ink-sep"></span><button type="button" class="ink-t ink-e' + (tool === "serase" ? " sel" : "") + '" data-ink="serase" title="획 지우개 — 닿은 획을 통째로">' + IC_S + '</button>' +
        '<button type="button" class="ink-t ink-e' + (tool === "perase" ? " sel" : "") + '" data-ink="perase" title="부분 지우개 — 닿은 부분만">' + IC_P + "</button>" +
        '<span class="ink-sep"></span><button type="button" class="ink-t" data-ink="undo" title="되돌리기">↶</button><button type="button" class="ink-t" data-ink="clear" title="모두 지우기">모두 지우기</button>' : "");
    if (svg) svg.setAttribute("data-tool", tool);
    document.body.classList.toggle("ink-hand", on && tool === "hand");
  }
  function setOn(v) { on = v; if (!on && tool === "hand") tool = "pen"; document.body.classList.toggle("ink-on", on); ensure(); renderBar(); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ink], [data-ink-c]"); if (!b || !bar || !bar.contains(b)) return;
    if (b.dataset.inkC) { color = b.dataset.inkC; tool = "pen"; renderBar(); return; }
    var a = b.dataset.ink;
    if (a === "toggle") setOn(!on);
    else if (a === "class") { if (window.Live && Live.menu) Live.menu(b); }
    else if (a === "serase" || a === "perase" || a === "hand") { tool = tool === a ? "pen" : a; renderBar(); }
    else if (a === "undo") { if (hist.length) mine = JSON.parse(hist.pop()); else mine.pop(); lsSet(key, mine); redraw(); emit(true); }
    else if (a === "clear") { if (mine.length) { snap(); mine = []; lsSet(key, mine); redraw(); emit(true); } }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && on) setOn(false); });

  /* 화면이 바뀌면 그 화면의 판서를 불러오고, 크기가 바뀌면 다시 맞춘다 */
  function check() {
    host = findHost();
    var k = pageKey();
    if (k !== key) { key = k; mine = tagAll(lsGet(k)); hist = []; teacher = window.Live && Live.teacherInk ? Live.teacherInk(k) : []; cur = null; }
    redraw();
  }
  var lastH = 0;
  setInterval(function () {
    var hs = findHost(), m = rootEl(), h;
    if (hs) h = "H" + hs.scrollHeight + "/" + hs.clientWidth + "/" + hs.clientHeight;
    else h = m ? document.body.offsetHeight + "/" + m.scrollHeight + "/" + Math.round(m.getBoundingClientRect().width) + "/" + document.documentElement.clientWidth : "";   /* 필기 층 자신은 높이에 넣지 않는다 */
    if (hs !== host || pageKey() !== key || h !== lastH) { lastH = h; check(); }
    else placeAll();   /* 그림이 늦게 뜨거나 내용이 펼쳐져 자리가 바뀐 것을 따라간다 */
  }, 400);
  /* 덧창을 스크롤하면 필기도 함께 움직인다 */
  document.addEventListener("scroll", function (e) { if (host && e.target === host && svg) svg.setAttribute("viewBox", hostGeo().vb); }, true);
  window.addEventListener("resize", function () { redraw(); fitLive(); });
  setTimeout(function () { check(); renderBar(); }, 0);

  window.Ink = {
    /* 교사: 내 판서가 바뀔 때 (strokes, 화면 키, 끝났는지) */
    onChange: function (f) { listeners.push(f); },
    mine: function (k) { return k === key ? mine.slice() : tagAll(lsGet(k)); },
    /* 학생: 교사 판서 보이기 */
    showTeacher: function (strokes, k) { teacher = (k && k !== pageKey()) ? [] : (strokes || []); if (ensure()) draw(gT, teacher); },
    /* 학생: 선생님이 지금 긋고 있는 획 하나(없으면 지움) */
    showCur: function (st, k) {
      if (!gC && !ensure()) return;
      while (gC.firstChild) gC.removeChild(gC.firstChild);
      if (!st || !st.p || st.p.length < 2 || (k && k !== pageKey())) return;
      gC.appendChild(el(st)); placeAll();
    },
    key: function () { var h = findHost(); return h ? "host:" + h.getAttribute("data-ink-host") : baseKey(); },   /* 덧창이 막 열리고 닫힌 때에도 맞는 열쇠 */
    refreshBar: function () { if (bar) renderBar(); }
  };
})();
