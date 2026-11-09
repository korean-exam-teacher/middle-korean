/*
 * 판서 — 화면 위에 펜으로 쓰기 (2026-11-09 v89)
 * - 누구나 ✎ 단추로 화면(본문) 위에 쓸 수 있다. 쓴 것은 이 브라우저에 화면마다 저장된다.
 * - 수업 코드로 수업을 연 교사의 판서는 학생 화면에 그대로 나타난다(js/live.js).
 * - 학생이 쓴 것은 학생 화면에만 남고 교사에게 가지 않는다.
 * 좌표는 본문(<main>) 너비를 1000으로 둔 값이라 화면 크기가 달라도 같은 자리에 놓인다.
 */
(function () {
  var COLORS = [["#2B2A28", "먹"], ["#2F5D9E", "청화"], ["#B5483B", "진사"], ["hl", "형광"]];
  var LSK = "kme.ink.";
  var on = false, color = COLORS[0][0], mine = [], teacher = [], cur = null, key = "", main = null, svg = null, gT = null, gM = null, bar = null;
  var listeners = [];
  function pageKey() { return location.hash || "#/"; }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(LSK + k) || "[]"); } catch (e) { return []; } }
  function lsSet(k, v) { try { if (v.length) localStorage.setItem(LSK + k, JSON.stringify(v)); else localStorage.removeItem(LSK + k); } catch (e) {} }
  var NS = "http://www.w3.org/2000/svg";

  function ensure() {
    var m = document.querySelector("#app main");
    if (!m) { if (svg) svg.style.display = "none"; return false; }
    if (!svg) {
      svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "ink-layer no-print"); svg.setAttribute("aria-hidden", "true");
      gT = document.createElementNS(NS, "g"); gM = document.createElementNS(NS, "g");
      svg.appendChild(gT); svg.appendChild(gM); document.body.appendChild(svg);
      svg.addEventListener("pointerdown", down);
    }
    main = m; svg.style.display = "";
    var r = main.getBoundingClientRect(), w = r.width || 1, hgt = Math.max(main.scrollHeight, r.height);
    svg.style.left = (r.left + scrollX) + "px"; svg.style.top = (r.top + scrollY) + "px";
    svg.style.width = w + "px"; svg.style.height = hgt + "px";
    svg.setAttribute("viewBox", "0 0 1000 " + Math.round(hgt / w * 1000));
    return true;
  }
  function pt(e) { var r = main.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * 1000), Math.round((e.clientY - r.top) / r.width * 1000)]; }
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
    return path;
  }
  function draw(g, list) { while (g.firstChild) g.removeChild(g.firstChild); list.forEach(function (s) { g.appendChild(el(s)); }); }
  function redraw() { if (!ensure()) return; draw(gT, teacher); draw(gM, cur ? mine.concat([cur]) : mine); }
  function emit(final) { listeners.forEach(function (f) { try { f(cur ? mine.concat([cur]) : mine, key, final); } catch (e) { console.error(e); } }); }

  var sendT = 0;
  function down(e) {
    if (!on) return;
    e.preventDefault(); svg.setPointerCapture(e.pointerId);
    cur = { c: color, p: pt(e) };
    var move = function (ev) {
      var q = pt(ev), n = cur.p.length;
      if (Math.abs(q[0] - cur.p[n - 2]) + Math.abs(q[1] - cur.p[n - 1]) < 3) return;
      cur.p.push(q[0], q[1]); draw(gM, mine.concat([cur]));
      var now = Date.now(); if (now - sendT > 250) { sendT = now; emit(false); }
    };
    var up = function () {
      svg.removeEventListener("pointermove", move); svg.removeEventListener("pointerup", up); svg.removeEventListener("pointercancel", up);
      if (cur) { mine.push(cur); cur = null; lsSet(key, mine); redraw(); emit(true); }
    };
    svg.addEventListener("pointermove", move); svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
  }

  /* ───────── 도구 ───────── */
  function renderBar() {
    if (!bar) { bar = document.createElement("div"); bar.className = "ink-bar no-print"; document.body.appendChild(bar); }
    bar.classList.toggle("on", on);
    bar.innerHTML = '<button type="button" class="ink-pen" data-ink="toggle" title="판서" aria-pressed="' + on + '">✎</button>' +
      (on ? COLORS.map(function (c) { return '<button type="button" class="ink-c' + (c[0] === color ? " sel" : "") + '" data-ink-c="' + c[0] + '" title="' + c[1] + '" style="--c:' + (c[0] === "hl" ? "#F2D65C" : c[0]) + '"></button>'; }).join("") +
        '<button type="button" class="ink-t" data-ink="undo" title="되돌리기">↶</button><button type="button" class="ink-t" data-ink="clear" title="모두 지우기">지우기</button>' : "");
  }
  function setOn(v) { on = v; document.body.classList.toggle("ink-on", on); ensure(); renderBar(); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ink], [data-ink-c]"); if (!b || !bar || !bar.contains(b)) return;
    if (b.dataset.inkC) { color = b.dataset.inkC; renderBar(); return; }
    var a = b.dataset.ink;
    if (a === "toggle") setOn(!on);
    else if (a === "undo") { mine.pop(); lsSet(key, mine); redraw(); emit(true); }
    else if (a === "clear") { mine = []; lsSet(key, mine); redraw(); emit(true); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && on) setOn(false); });

  /* 화면이 바뀌면 그 화면의 판서를 불러오고, 크기가 바뀌면 다시 맞춘다 */
  function check() {
    var k = pageKey();
    if (k !== key) { key = k; mine = lsGet(k); teacher = window.Live && Live.teacherInk ? Live.teacherInk(k) : []; cur = null; }
    redraw();
  }
  var lastH = 0;
  setInterval(function () {
    var m = document.querySelector("#app main"), h = m ? m.scrollHeight + "/" + Math.round(m.getBoundingClientRect().width) : "";
    if (pageKey() !== key || h !== lastH) { lastH = h; check(); }
  }, 400);
  window.addEventListener("resize", redraw);
  setTimeout(function () { check(); renderBar(); }, 0);

  window.Ink = {
    /* 교사: 내 판서가 바뀔 때 (strokes, 화면 키, 끝났는지) */
    onChange: function (f) { listeners.push(f); },
    mine: function (k) { return k === key ? mine.slice() : lsGet(k); },
    /* 학생: 교사 판서 보이기 */
    showTeacher: function (strokes, k) { teacher = (k && k !== pageKey()) ? [] : (strokes || []); if (ensure()) draw(gT, teacher); },
    key: pageKey
  };
})();
