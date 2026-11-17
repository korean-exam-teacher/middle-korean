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
 * v127: 화면 맞추기가 붙박이 칸·스스로 스크롤하는 칸을 기준으로 삼지 않음(inBox) · 칸 안에서 보는 곳 Ink.boxAnchor()/goBox()
 * v125: 글 위의 필기를 글자에 붙인다 · 수업에서 화면 맞추기
 *   - 글이 있는 칸에 쓴 획은 긋기 시작한 자리의 글자 하나에 붙인다(열쇠: "칸|번호|@글자 번호|그 자리의 글자 여덟"). 크기는 그 글의 글자 크기를 따른다(1000 = 글자 크기×40).
 *     기기마다 줄이 달리 나뉘어도(글꼴·글자 크기 설정·화면 너비) 그 글자를 따라가므로, 아래로 갈수록 어긋나던 일이 없다. 그림에 붙인 획과 예전 획은 그대로.
 *   - Ink.viewAnchor() / Ink.goAnchor(): 선생님 화면의 한 점 아래 있는 글·그림을 학생 화면의 같은 높이에 오게(live.js). 전에는 '전체 길이의 몇 %'로 맞춰 화면 크기가 다르면 다른 곳이 보였다.
 *   - 휴대폰이 넓은 화면에서 글자를 키우지 않게(text-size-adjust:100%).
 * v124: 필기 단추·가려지는 필기
 *   - 꺼져 있을 때는 왼쪽 아래 동그란 단추 하나. 켜면 그 자리에서 옆으로 도구가 펼쳐진다(좁은 화면에서는 위로 한 줄 더).
 *   - 화면을 손가락으로 확대해도(핀치) 단추는 지금 보이는 화면의 왼쪽 아래에 같은 크기로 있다(visualViewport).
 *   - 필기 층을 붙박이 머리·띠보다 아래에 둔다(층 번호 4, 낮은 머리·띠는 5로 올림). 지문이 머리 뒤로 올라가 숨으면 그 위의 필기도 숨는다.
 *     (전에는 머리 위에도 쓸 수 있게 54였다 — 이제 붙박이 머리·띠 위에는 쓰지 않는다.)
 *   - 스스로 스크롤하는 칸(지문과 함께 보기의 지문 칸 등) 안에 붙인 필기는 그 칸 밖으로 나간 만큼 잘라 낸다(붙인 곳마다 clipPath 하나).
 * v121: 덧창(과제 풀기·모아 풀기 등)에서 화면을 내리면 필기가 제자리에 남거나 늦게 따라오던 것을 고침
 *   - 전에는 필기 층을 화면에 붙박아 두고(position:fixed) 스크롤 알림이 올 때마다 그림을 옮겼다. 휴대폰은 화면을 먼저 내리고 알림을 늦게 줘서 필기가 남아 보였다.
 *   - 이제 필기 층을 덧창 안에 넣어(내용 전체 크기) 내용과 한 몸으로 움직인다. 덧창이 내용을 새로 그리며 필기 층을 지우면 바로 다시 넣는다(MutationObserver).
 *   - 그림 열쇠: <img data-ik="…">가 있으면 그 값을 쓴다(그림 주소가 바뀌어도 예전 필기가 그 그림에 그대로 붙어 있게).
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
    st.textContent = "html{-webkit-text-size-adjust:100%;text-size-adjust:100%}" +   /* v125: 휴대폰이 넓은 화면에서 글자를 키우면 줄이 달리 나뉘어 선생님 필기와 어긋난다 */
      ".ink-live{position:fixed;left:0;top:0;z-index:26;pointer-events:none}" +
      "body.ink-on{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}" +
      "body.ink-on .ink-layer{pointer-events:auto;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}" +
      "svg.ink-layer{z-index:4}" +   /* v124: 본문 위, 붙박이 머리·띠 아래 — 지문이 머리 뒤로 올라가 숨으면 그 위에 쓴 필기도 함께 숨는다(전에는 54라 머리 위에 필기만 남아 보였다) */
      ".ink-layer.ink-fixed{position:fixed!important}" +
      ".ink-layer.ink-in{position:absolute!important;margin:0!important;max-width:none!important;max-height:none!important}" +
      "body.ink-on.ink-hand .ink-layer{pointer-events:none!important}body.ink-on.ink-hand{-webkit-user-select:auto;user-select:auto;-webkit-touch-callout:default}" +
      ".ink-bar .ink-hand{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;padding:0;border-radius:50%}.ink-bar .ink-hand.sel{background:#2F4F7F;color:#fff}" +
      ".ink-bar{max-width:calc(100vw - 32px);flex-wrap:wrap-reverse;border-radius:26px!important}" +
      /* v124: 꺼져 있을 때는 동그란 단추 하나. 켜면 그 자리에서 옆으로 도구가 펼쳐진다(단추 가운데 자리는 그대로) */
      ".ink-bar:not(.on){background:none!important;border-color:transparent!important;box-shadow:none!important;padding:0!important;gap:8px}" +
      ".ink-bar .ink-pen{width:46px!important;height:46px!important;min-width:46px;padding:0!important;border-radius:50%!important;display:inline-flex;align-items:center;justify-content:center;background:#fff;border:1px solid #DCDCD7!important;box-shadow:0 4px 16px rgba(40,40,38,.12);color:#3A3A37!important}" +
      ".ink-bar.on .ink-pen{width:36px!important;height:36px!important;min-width:36px;background:#2F4F7F;border-color:#2F4F7F!important;box-shadow:none;color:#fff!important}" +
      ".ink-bar:not(.on) .ink-class{background:rgba(255,255,255,.94);box-shadow:0 4px 16px rgba(40,40,38,.08)}" +
      ".ink-bar.ink-pin{left:0!important;top:0!important;right:auto!important;bottom:auto!important;transform-origin:0 0;will-change:transform}" +
      "@media print{.ink-live{display:none!important}}";
    document.head.appendChild(st);
  })();

  /* v121: 덧창이 내용을 새로 그리면(innerHTML) 그 안에 넣어 둔 필기 층도 지워진다 → 바로 다시 넣고 크기를 다시 맞춘다 */
  var hostMO = null, hostW = null, hostT = 0;
  function watchHost(h) {
    if (hostW === h) return;
    if (hostMO) { hostMO.disconnect(); hostMO = null; }
    hostW = h;
    if (!h || !window.MutationObserver) return;
    hostMO = new MutationObserver(function () {
      if (!svg || hostW !== host || !host) return;
      if (svg.parentNode !== host) host.appendChild(svg);
      clearTimeout(hostT); hostT = setTimeout(function () { if (host && hostW === host) { ensure(); placeAll(); } }, 0);
    });
    hostMO.observe(h, { childList: true });
  }
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
    if (host) {
      var cs = getComputedStyle(host), z = parseInt(cs.zIndex, 10) || 0;
      if (bar) { bar.style.zIndex = z + 3; bar.style.bottom = (host.getAttribute("data-ink-bottom") || 16) + "px"; } if (live) live.style.zIndex = z + 2;
      if (cs.position !== "static") {   /* v121: 덧창 안에 넣는다 — 내용 전체 크기로 깔아, 스크롤하면 내용과 함께 움직인다 */
        watchHost(host);
        if (svg.parentNode !== host) host.appendChild(svg);
        svg.classList.remove("ink-fixed"); svg.classList.add("ink-in"); svg.style.zIndex = "";
        svg.style.left = "0px"; svg.style.top = "0px"; svg.style.width = "0px"; svg.style.height = "0px";   /* 필기 층이 덧창의 높이를 늘리지 않게, 먼저 접고 잰다 */
        var sw = Math.max(host.scrollWidth, host.clientWidth), sh = Math.max(host.scrollHeight, host.clientHeight), g = hostGeo();
        svg.style.width = sw + "px"; svg.style.height = sh + "px";
        svg.setAttribute("viewBox", ((g.L - host.scrollLeft - g.ox) / g.w * 1000) + " " + ((g.T - host.scrollTop - g.oy) / g.w * 1000) + " " + (sw / g.w * 1000) + " " + (sh / g.w * 1000));
        return true;
      }
      /* 자리를 잡지 않은(static) 덧창: 전처럼 보이는 칸에 붙박아 두고, 스크롤한 만큼 그림을 옮긴다 */
      watchHost(null);
      if (svg.parentNode !== document.body) document.body.appendChild(svg);
      var g2 = hostGeo();
      svg.classList.remove("ink-in"); svg.classList.add("ink-fixed");
      svg.style.left = g2.L + "px"; svg.style.top = g2.T + "px"; svg.style.width = g2.hw + "px"; svg.style.height = g2.hh + "px";
      svg.style.zIndex = z + 1;
      svg.setAttribute("viewBox", g2.vb);
      return true;
    }
    watchHost(null);
    if (svg.parentNode !== document.body) document.body.appendChild(svg);
    svg.classList.remove("ink-fixed"); svg.classList.remove("ink-in"); svg.style.zIndex = ""; if (bar) { bar.style.zIndex = ""; bar.style.bottom = ""; } if (live) live.style.zIndex = "";
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
    var ik = im.getAttribute("data-ik"); if (ik) return ik;
    var u = im.getAttribute("src") || "", n = u.length, k;
    if (im._ik && im._ikn === n) return im._ik;
    if (u.slice(0, 5) === "data:") { var h = 5381, step = Math.max(1, Math.floor(n / 4000)); for (var i = 0; i < n; i += step) h = ((h << 5) + h + u.charCodeAt(i)) | 0; k = "d" + n.toString(36) + "." + (h >>> 0).toString(36); }
    else { try { k = new URL(u, location.href).pathname; } catch (e) { k = u; } }
    im._ik = k; im._ikn = n; return k;
  }
  function sameSrc(sc, k) { var out = [], l = sc.getElementsByTagName("img"); for (var i = 0; i < l.length; i++) if (srcKey(l[i]) === k) out.push(l[i]); return out; }
  /* ───────── v125: 글자에 붙이기 ───────── */
  var EMW = 40, RNG = null;   /* 글자에 붙인 획의 좌표: 1000 = 그 글의 글자 크기 × 40 */
  /* 그 칸의 글자들(글 마디들을 차례로 이은 것): { n: 글 마디, c: 마디가 시작하는 번호, t: 이은 글 } */
  function textIndex(el, cache) {
    var m = cache ? (cache._ti || (cache._ti = new Map())) : null, v = m && m.get(el);
    if (v) return v;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n = [], c = [], t = "", x;
    while ((x = w.nextNode())) { n.push(x); c.push(t.length); t += x.data; }
    v = { n: n, c: c, t: t }; if (m) m.set(el, v); return v;
  }
  /* i번째 글자의 네모(줄바꿈처럼 자리가 없는 글자는 null) */
  function charRect(ti, i) {
    if (i < 0 || i >= ti.t.length) return null;
    var lo = 0, hi = ti.n.length - 1, m; while (lo < hi) { m = (lo + hi + 1) >> 1; if (ti.c[m] <= i) lo = m; else hi = m - 1; }
    var nd = ti.n[lo], off = i - ti.c[lo]; if (off >= nd.data.length) return null;
    RNG = RNG || document.createRange();
    try { RNG.setStart(nd, off); RNG.setEnd(nd, off + 1); } catch (e) { return null; }
    var rs = RNG.getClientRects(), r = rs.length ? rs[0] : null;
    return r && (r.width > 0 || r.height > 0) && r.height > 0 ? r : null;
  }
  function rectNear(ti, i) { var r = charRect(ti, i), d; for (d = 1; !r && d <= 16; d++) r = charRect(ti, i - d) || charRect(ti, i + d); return r; }
  /* (x, y)에 있는(없으면 읽는 차례로 가장 가까운) 글자의 번호. 글자가 없으면 -1 */
  function charSeek(ti, x, y) {
    var N = ti.t.length; if (!N) return -1;
    var lo = 0, hi = N - 1, guard = 0, mid, m, r;
    while (lo < hi && guard++ < 48) {
      mid = (lo + hi) >> 1; m = mid; r = null;
      while (m <= hi && !(r = charRect(ti, m))) m++;          /* 자리가 없는 글자는 건너뛴다 */
      if (!r) { hi = mid; continue; }
      if (r.bottom <= y || (r.top <= y && r.right < x)) lo = m + 1;    /* 그 글자보다 뒤(아랫줄이거나 같은 줄 오른쪽) */
      else if (r.top > y) hi = mid;                                     /* 그 글자보다 앞(윗줄) */
      else if (m === mid) hi = mid; else lo = hi = m;                   /* 같은 줄, 그 글자이거나 그 앞 */
    }
    var i = Math.min(lo, N - 1), c = charRect(ti, i), k;
    if (!c) { for (k = 1; !c && k <= 16; k++) { if ((c = charRect(ti, i - k))) i -= k; else if ((c = charRect(ti, i + k))) i += k; } if (!c) return -1; }
    return i;
  }
  function prevRect(ti, i) { for (var k = 1, p = null; k <= 16 && i - k >= 0; k++) if ((p = charRect(ti, i - k))) return [p, i - k]; return null; }
  function charAt(ti, x, y) {
    var i = charSeek(ti, x, y); if (i < 0) return -1;
    var c = charRect(ti, i), p, best, j, q;
    if (c && (y < c.top || y >= c.bottom)) {                 /* 줄 사이·줄 바깥: 가까운 줄(찾은 글자의 줄 또는 그 앞 글자의 줄)의 가운데 높이로 다시 찾는다 */
      p = prevRect(ti, i); best = c;
      if (p && Math.abs(y - (p[0].top + p[0].bottom) / 2) < Math.abs(y - (c.top + c.bottom) / 2)) best = p[0];
      j = charSeek(ti, x, (best.top + best.bottom) / 2);
      if (j >= 0) { i = j; c = charRect(ti, i); }
    }
    if (c && c.top > y + 1 && x > c.right) { q = prevRect(ti, i); if (q && q[0].top <= c.top - 2) i = q[1]; }   /* 줄 끝 오른쪽 빈 곳에서는 아랫줄 첫 글자가 잡힌다 → 그 줄의 마지막 글자로 */
    return i;
  }
  function fpOf(t, i) { return t.substr(i, 8).replace(/[|\n\r\t]/g, " "); }
  /* 글자에 붙인 열쇠("칸|번호|@글자 번호|그 자리의 글자 여덟") → { e: 칸, r: 좌표의 기준(그 글자의 왼쪽 위, 너비 = 글자 크기×40), er: 칸의 네모 }
     글이 조금 달라 번호가 밀렸으면 같은 글자열을 가까운 데서(이웃 칸까지) 찾는다 */
  function charGeo(key, at, cache) {
    var base = key.slice(0, at), rest = key.slice(at + 2), q = rest.indexOf("|"), ci = +(q < 0 ? rest : rest.slice(0, q)), fp = q < 0 ? "" : rest.slice(q + 1);
    var p = base.split("|"), sc = scopeEl(), list = BLOCKS.indexOf(p[0]) > 0 ? sc.querySelectorAll(p[0]) : [], idx = +p[1], e = list[idx] || null, i = -1, d, a2, b2;
    var probe = function (el) {
      if (!el) return -1; var t = textIndex(el, cache).t;
      if (!fp) return ci < t.length ? ci : -1;
      if (fpOf(t, ci) === fp) return ci;
      var nt = t.replace(/[|\n\r\t]/g, " "), best = -1, from = 0, j;
      while ((j = nt.indexOf(fp, from)) >= 0) { if (best < 0 || Math.abs(j - ci) < Math.abs(best - ci)) best = j; if (j > ci) break; from = j + 1; }
      return best;
    };
    i = probe(e);
    for (d = 1; i < 0 && d <= 8; d++) { a2 = list[idx - d]; b2 = list[idx + d]; if (a2 && (i = probe(a2)) >= 0) e = a2; else if (b2 && (i = probe(b2)) >= 0) e = b2; }
    if (i < 0) { e = list[idx] || null; if (!e) return null; i = Math.min(ci, textIndex(e, cache).t.length - 1); }
    var er = e.getBoundingClientRect(); if (er.width < 2) return null;
    var cr = rectNear(textIndex(e, cache), i); if (!cr) return null;
    return { e: e, r: { left: cr.left, top: cr.top, width: (parseFloat(getComputedStyle(e).fontSize) || 16) * EMW }, er: er };
  }
  /* 붙인 곳의 자리: 그림·칸이면 그 네모, 글자면 charGeo */
  function anchorGeo(key, cache) {
    var gk = "g:" + key; if (cache && gk in cache) return cache[gk];
    var at = key.indexOf("|@"), out = null, e, er;
    if (at < 0) { e = findAnchor(key, cache); er = e ? e.getBoundingClientRect() : null; out = er && er.width >= 2 ? { e: e, r: er, er: er } : null; }
    else out = charGeo(key, at, cache);
    if (cache) cache[gk] = out;
    return out;
  }
  /* 화면의 한 점 아래에서 필기를 붙일 곳 → { el, key, r } (없으면 null). r = 좌표의 기준 네모 */
  /* v127: 붙박이 머리·띠, 붙박이 칸(position:sticky), 스스로 스크롤하는 칸 안에 들어 있는가 — 화면 맞추기의 기준으로 삼지 않으려고 */
  function inBox(el) {
    var sc = scopeEl(), p, cs;
    for (p = el; p && p !== sc && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      if (p._inkBar) return true;
      cs = getComputedStyle(p);
      if (cs.position === "sticky" || cs.position === "fixed" || ((cs.overflowY === "auto" || cs.overflowY === "scroll") && p.scrollHeight > p.clientHeight + 2)) return true;
    }
    return false;
  }
  function anchorAt(x, y) {
    if (!svg) return null;
    svg.style.pointerEvents = "none"; if (live) live.style.display = "none";
    var t = document.elementFromPoint(x, y);
    svg.style.pointerEvents = ""; if (live) live.style.display = "";
    var sc = scopeEl();
    if (!t || !sc.contains(t) || (bar && bar.contains(t)) || !t.closest) return null;
    var a = t.closest(BSEL); if (!a || a === sc || !sc.contains(a)) return null;
    var r = a.getBoundingClientRect(); if (r.width < 24 || r.height < 8) return null;
    if (a.tagName === "IMG") { var k = srcKey(a), same = sameSrc(sc, k); return { el: a, key: "img|" + k + "|" + Math.max(0, same.indexOf(a)), r: r }; }
    for (var i = 1; i < BLOCKS.length; i++) if (a.matches(BLOCKS[i])) {
      var idx = Array.prototype.indexOf.call(sc.querySelectorAll(BLOCKS[i]), a); if (idx < 0) return null;
      /* v125: 글이 있는 칸이면 그 자리의 글자에 붙인다(줄이 달리 나뉘어도 그 글자를 따라간다) */
      var ti = textIndex(a, null), ci = ti.t.length ? charAt(ti, x, y) : -1, cr = ci >= 0 ? charRect(ti, ci) : null;
      if (cr) return { el: a, key: BLOCKS[i] + "|" + idx + "|@" + ci + "|" + fpOf(ti.t, ci), r: { left: cr.left, top: cr.top, width: (parseFloat(getComputedStyle(a).fontSize) || 16) * EMW } };
      return { el: a, key: BLOCKS[i] + "|" + idx, r: r };
    }
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
  /* v124: 붙인 곳이 스스로 스크롤하는 칸(모아 풀기의 지문 칸 등) 안에 있으면 그 칸의 보이는 네모 [왼, 위, 오른, 아래](화면 좌표). 없으면 null */
  function clipBox(e) {
    var sc = scopeEl(), box = null, p, cs, r, l, t, q;
    for (p = e.parentElement; p && p !== sc && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      if (p.scrollHeight <= p.clientHeight + 1 && p.scrollWidth <= p.clientWidth + 1) continue;   /* 넘치지 않는 칸은 볼 것 없다 */
      cs = getComputedStyle(p); if (cs.overflowY === "visible" && cs.overflowX === "visible") continue;
      r = p.getBoundingClientRect(); l = r.left + p.clientLeft; t = r.top + p.clientTop;
      q = [cs.overflowX === "visible" ? -1e6 : l, cs.overflowY === "visible" ? -1e6 : t, cs.overflowX === "visible" ? 1e6 : l + p.clientWidth, cs.overflowY === "visible" ? 1e6 : t + p.clientHeight];
      box = box ? [Math.max(box[0], q[0]), Math.max(box[1], q[1]), Math.min(box[2], q[2]), Math.min(box[3], q[3])] : q;
    }
    return box;
  }
  var cpIds = {}, cpN = 0, cpDefs = null;
  function clipRect(akey) {   /* 붙인 곳마다 자르는 틀 하나(<clipPath><rect>) */
    if (!cpDefs || cpDefs.parentNode !== svg) { cpDefs = document.createElementNS(NS, "defs"); svg.insertBefore(cpDefs, svg.firstChild); cpIds = {}; }
    var c = cpIds[akey];
    if (!c && cpDefs.childNodes.length > 240) { while (cpDefs.firstChild) cpDefs.removeChild(cpDefs.firstChild); cpIds = {}; [gT, gC, gM].forEach(function (g) { for (var n = g.firstChild; n; n = n.nextSibling) if (n._cp) { n._cp = ""; n.removeAttribute("clip-path"); } }); }
    if (!c) { var cp = document.createElementNS(NS, "clipPath"), rc = document.createElementNS(NS, "rect"); cp.setAttribute("id", "inkcp" + (++cpN)); cp.setAttribute("clipPathUnits", "userSpaceOnUse"); cp.appendChild(rc); cpDefs.appendChild(cp); c = cpIds[akey] = { id: "inkcp" + cpN, rc: rc, v: "" }; }
    return c;
  }
  /* 붙여 둔 획들을 지금 그것이 있는 자리로 옮긴다(배치가 바뀔 때마다) */
  function placeAll() {
    if (!svg || !main) return;
    var b = null, cache = {}, boxes = {};
    [gT, gC, gM].forEach(function (g) {
      for (var n = g.firstChild; n; n = n.nextSibling) {
        var st = n._s; if (!st || !st.a) continue;
        if (!b) b = baseGeo();
        var G = anchorGeo(st.a, cache);
        if (!G) { if (n.style.display !== "none") n.style.display = "none"; continue; }
        var e = G.e, r = G.r, er = G.er;
        /* v124: 스스로 스크롤하는 칸 밖으로 나간 부분은 보이지 않게 */
        var cb = st.a in boxes ? boxes[st.a] : (boxes[st.a] = clipBox(e)), want = "";
        if (cb && (er.left < cb[0] - 1 || er.top < cb[1] - 1 || er.right > cb[2] + 1 || er.bottom > cb[3] + 1)) {
          if (cb[2] <= cb[0] || cb[3] <= cb[1] || er.right <= cb[0] || er.left >= cb[2] || er.bottom <= cb[1] || er.top >= cb[3]) { if (n.style.display !== "none") n.style.display = "none"; continue; }   /* 통째로 칸 밖 */
          var c = clipRect(st.a), u = 1000 / r.width, x0 = Math.max(cb[0], er.left - 400), y0 = Math.max(cb[1], er.top - 400), x1 = Math.min(cb[2], er.right + 400), y1 = Math.min(cb[3], er.bottom + 400),
            v = [((x0 - r.left) * u).toFixed(1), ((y0 - r.top) * u).toFixed(1), ((x1 - x0) * u).toFixed(1), ((y1 - y0) * u).toFixed(1)].join(" ");
          if (c.v !== v) { c.v = v; var vs = v.split(" "); c.rc.setAttribute("x", vs[0]); c.rc.setAttribute("y", vs[1]); c.rc.setAttribute("width", vs[2]); c.rc.setAttribute("height", vs[3]); }
          want = "url(#" + c.id + ")";
        }
        if ((n._cp || "") !== want) { n._cp = want; if (want) n.setAttribute("clip-path", want); else n.removeAttribute("clip-path"); }
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
    var G = anchorGeo(s.a, cache), r = G ? G.r : null;
    if (!r) return null;
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
    var A = erasing ? null : anchorAt(e.clientX, e.clientY), AR = A ? A.r : null;
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
  var IC_PEN = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1.2-4.4L16.6 4.2a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.4 18.8z"/><path d="M14.5 6.3l3.2 3.2"/></svg>';
  /* v124: 화면을 손가락으로 확대하면(핀치) 붙박이 단추는 '확대하기 전 화면'의 왼쪽 아래에 남아 보이지 않게 된다.
     → 확대된 동안에는 지금 보이는 화면(visualViewport)의 왼쪽 아래로 옮기고, 크기도 확대한 만큼 줄여 늘 같은 크기로 보이게 한다. */
  var vv = window.visualViewport, pinRaf = 0;
  function pin() {
    if (!bar) return;
    var s = vv ? vv.scale : 1;
    if (!vv || s < 1.02) { if (bar.classList.contains("ink-pin")) { bar.classList.remove("ink-pin"); bar.style.transform = ""; } return; }
    bar.classList.add("ink-pin");
    var m = 16 / s, h = bar.offsetHeight / s, base = parseFloat(bar.style.bottom) || 16, yb = vv.offsetTop + vv.height - m;
    if (base > 16) yb = Math.min(yb, Math.max(document.documentElement.clientHeight, Math.round(vv.height * s)) - base);   /* 과제 화면 아래 띠(제출하기) 위로 */
    bar.style.transform = "translate(" + (vv.offsetLeft + m) + "px," + (yb - h) + "px) scale(" + (1 / s) + ")";
  }
  function pinSoon() { if (!pinRaf) pinRaf = requestAnimationFrame(function () { pinRaf = 0; pin(); }); }
  if (vv) { vv.addEventListener("resize", pinSoon); vv.addEventListener("scroll", pinSoon); }
  window.addEventListener("scroll", pinSoon, { passive: true });
  function renderBar() {
    if (!bar) { bar = document.createElement("div"); bar.className = "ink-bar no-print"; document.body.appendChild(bar); }
    bar.classList.toggle("on", on);
    bar.innerHTML = '<button type="button" class="ink-pen" data-ink="toggle" title="' + (on ? "필기 끄기" : "필기 — 화면 위에 펜으로 쓰기") + '" aria-label="' + (on ? "필기 끄기" : "필기") + '" aria-pressed="' + on + '">' + IC_PEN + "</button>" +
      (on ? '<button type="button" class="ink-hand' + (tool === "hand" ? " sel" : "") + '" data-ink="hand" aria-pressed="' + (tool === "hand") + '" title="손가락 — 필기는 그대로 두고 화면을 누르고 옮기기 (다시 누르면 펜)">' + IC_H + '</button>' + COLORS.map(function (c) { return '<button type="button" class="ink-c' + (tool === "pen" && c[0] === color ? " sel" : "") + '" data-ink-c="' + c[0] + '" title="' + c[1] + '" style="--c:' + (c[0] === "hl" ? "#F2D65C" : c[0]) + '"></button>'; }).join("") +
        '<span class="ink-sep"></span><button type="button" class="ink-t ink-e' + (tool === "serase" ? " sel" : "") + '" data-ink="serase" title="획 지우개 — 닿은 획을 통째로">' + IC_S + '</button>' +
        '<button type="button" class="ink-t ink-e' + (tool === "perase" ? " sel" : "") + '" data-ink="perase" title="부분 지우개 — 닿은 부분만">' + IC_P + "</button>" +
        '<span class="ink-sep"></span><button type="button" class="ink-t" data-ink="undo" title="되돌리기">↶</button><button type="button" class="ink-t" data-ink="clear" title="모두 지우기">모두 지우기</button>' : "") +
      (KT.classBtn ? '<button type="button" class="ink-class" data-ink="class" title="수업 열기·참여">' + (window.Live && Live.code() ? "수업 " + Live.code() : "수업") + "</button>" : "");
    pin();
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

  /* v124: 붙박이(sticky·fixed) 머리·띠 가운데 층 번호가 필기 층(4)보다 낮은 것은 5로 올린다 → 필기를 가린다.
     이름으로 후보를 고른 뒤(머리·띠·메뉴 같은 이름) 실제로 붙박이인 것만 건드린다. 한 번 본 것은 다시 보지 않는다. */
  var BARSEL = "header,nav,footer,.top,.foot,.gnb,[class*='bar'],[class*='foot'],[class*='sticky'],[class*='head'],[class*='gnb']";
  function liftBars() {
    var sc = scopeEl(), l, i, e, cs;
    try { l = sc.querySelectorAll(BARSEL); } catch (x) { return; }
    for (i = 0; i < l.length; i++) {
      e = l[i]; if (e._inkZ) continue; e._inkZ = 1;
      if (e === bar || e === svg || e === live || (bar && bar.contains(e))) continue;
      cs = getComputedStyle(e); if (cs.position !== "sticky" && cs.position !== "fixed") continue;
      e._inkBar = 1;
      if (cs.zIndex === "auto" || +cs.zIndex < 5) e.style.zIndex = "5";
    }
  }
  /* 화면이 바뀌면 그 화면의 판서를 불러오고, 크기가 바뀌면 다시 맞춘다 */
  function check() {
    host = findHost();
    var k = pageKey();
    if (k !== key) { key = k; mine = tagAll(lsGet(k)); hist = []; teacher = window.Live && Live.teacherInk ? Live.teacherInk(k) : []; cur = null; }
    liftBars();
    redraw();
  }
  var lastH = 0;
  setInterval(function () {
    var hs = findHost(), m = rootEl(), h;
    if (hs) { var ch = 0; for (var c = hs.firstElementChild; c; c = c.nextElementSibling) if (c !== svg) ch += c.offsetHeight;   /* 필기 층 자신은 높이에 넣지 않는다 */
      h = "H" + ch + "/" + hs.clientWidth + "/" + hs.clientHeight; }
    else h = m ? document.body.offsetHeight + "/" + m.scrollHeight + "/" + Math.round(m.getBoundingClientRect().width) + "/" + document.documentElement.clientWidth : "";   /* 필기 층 자신은 높이에 넣지 않는다 */
    if (hs !== host || pageKey() !== key || h !== lastH) { lastH = h; check(); }
    else placeAll();   /* 그림이 늦게 뜨거나 내용이 펼쳐져 자리가 바뀐 것을 따라간다 */
  }, 400);
  /* 덧창을 스크롤하면 필기도 함께 움직인다 */
  document.addEventListener("scroll", function (e) { if (host && e.target === host && svg && svg.classList.contains("ink-fixed")) svg.setAttribute("viewBox", hostGeo().vb); }, true);
  /* v121: 화면 안의 작은 칸(스스로 스크롤하는 지문 칸 등)을 내리면, 그 안의 글·그림에 붙인 필기를 바로 따라 옮긴다(전에는 0.4초마다 맞췄다) */
  var inRaf = 0;
  document.addEventListener("scroll", function (e) {
    var t = e.target; if (!svg || !t || t.nodeType !== 1 || t === host || t === document.documentElement || t === document.body) return;
    if (!inRaf) inRaf = requestAnimationFrame(function () { inRaf = 0; placeAll(); });
  }, true);
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
    key: function () { var h = findHost(); return h ? "host:" + h.getAttribute("data-ink-host") : baseKey(); },
    /* v125: 수업에서 화면 맞추기 — [붙인 곳 열쇠, 그 안에서의 높이(1000 = 기준 너비), 화면 높이에서의 비율] */
    viewAnchor: function () {
      if (!svg) return null;
      var top = 0, vh = innerHeight, cx, w, fr = [0.3, 0.5, 0.18, 0.7], xs, i, j, A, y;
      if (host) { var g = hostGeo(); top = g.T; vh = g.hh; cx = g.ox + g.w / 2; w = g.w; }
      else { var mr = main && main !== document.body ? main.getBoundingClientRect() : null; w = mr && mr.width > 40 ? mr.width : document.documentElement.clientWidth; cx = mr && mr.width > 40 ? mr.left + mr.width / 2 : w / 2; }
      xs = [cx, cx + w * 0.25, cx - w * 0.25];   /* v127: 가운데가 붙박이 지문 칸이면 오른쪽·왼쪽에서 찾는다 */
      for (j = 0; j < xs.length; j++) for (i = 0; i < fr.length; i++) {
        y = top + vh * fr[i]; A = anchorAt(xs[j], y); if (!A || inBox(A.el)) continue;   /* 붙박이 머리·띠, 붙박이 칸, 스스로 스크롤하는 칸에 든 것은 기준으로 삼지 않는다 */
        return [A.key, Math.round((y - A.r.top) / A.r.width * 1000), fr[i]];
      }
      return null;
    },
    /* v127: 스스로 스크롤하는 칸(과제 화면의 지문 칸) 안에서 보이는 곳 — [붙인 곳 열쇠, 그 안에서의 높이, 칸 높이에서의 비율] */
    boxAnchor: function (el) {
      if (!svg || !el) return null;
      var r = el.getBoundingClientRect(), fr = [0.3, 0.5, 0.15, 0.7], xs = [0.5, 0.3, 0.7], i, j, A, y;
      if (r.width < 40 || r.height < 40) return null;
      for (j = 0; j < xs.length; j++) for (i = 0; i < fr.length; i++) {
        y = r.top + r.height * fr[i]; if (y < 0 || y > innerHeight) continue;
        A = anchorAt(r.left + r.width * xs[j], y); if (!A || !el.contains(A.el)) continue;
        return [A.key, Math.round((y - A.r.top) / A.r.width * 1000), fr[i]];
      }
      return null;
    },
    goBox: function (el, sa, smooth) {
      if (!el || !sa || !sa[0] || !svg) return false;
      var G = anchorGeo(String(sa[0]), {}); if (!G || !el.contains(G.e)) return false;
      var r = el.getBoundingClientRect(), d = G.r.top + (+sa[1] || 0) / 1000 * G.r.width - (r.top + r.height * (+sa[2] || 0.3));
      if (Math.abs(d) >= 2) el.scrollBy({ top: d, behavior: smooth && Math.abs(d) < 2400 ? "smooth" : "auto" });
      return true;
    },
    goAnchor: function (sa, smooth) {
      if (!sa || !sa[0] || !svg) return false;
      var G = anchorGeo(String(sa[0]), {}); if (!G) return false;
      var top = 0, vh = innerHeight; if (host) { var g = hostGeo(); top = g.T; vh = g.hh; }
      var d = G.r.top + (+sa[1] || 0) / 1000 * G.r.width - (top + vh * (+sa[2] || 0.3));
      if (Math.abs(d) >= 2) (host || window).scrollBy({ top: d, behavior: smooth && Math.abs(d) < 2400 ? "smooth" : "auto" });
      return true;
    },   /* 덧창이 막 열리고 닫힌 때에도 맞는 열쇠 */
    refreshBar: function () { if (bar) renderBar(); }
  };
})();
