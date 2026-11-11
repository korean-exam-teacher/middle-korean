/*
 * 수업 코드 — 교사 화면 따라가기 · 교사 메모 · 정답 잠금/공개 (2026-11-09 v87)
 *
 * 교사('교사용 보기' 켬): 학습 화면의 '이 화면으로 수업 열기' → 6자리 코드.
 *   교사가 옮겨 다니는 화면(주제·단계 탭·펼친 기출·스크롤 위치)과 메모가 학생 화면에 그대로 나타난다.
 * 학생: 첫 화면 '수업 참여'에 코드를 넣는다(로그인 없음).
 *
 * 연결 방법
 * - SITE_CONFIG.LIVE_FIREBASE 에 Firebase 웹 앱 설정이 있으면: 기기 사이 실시간(Firestore + 교사만 익명 인증).
 *   보안 규칙은 firestore.rules (live/{코드} 문서만 쓰고, 고치기·지우기는 연 교사만).
 * - 없으면: 같은 컴퓨터·같은 브라우저의 다른 창끼리만 연결(화면 확인용).
 *
 * v91: 다른 갈래(수능·논술·곶·서논술·첫 화면)에서도 쓴다. 판서 도구의 '수업' 단추로 열고 참여한다(Live.menu).
 *   교사가 다른 갈래로 옮겨 가면 학생 화면도 그 주소로 따라간다(doc.url = 경로 + #).
 */
(function () {
  var cfg = window.SITE_CONFIG || {};
  var FB = cfg.LIVE_FIREBASE || null;
  var FB_VER = "10.12.5";
  var SS = "kme.live.me";             // 이 창의 역할·코드 (새로 고침해도 이어지게)
  var role = null, code = null, doc = null, unsub = null, follow = true, applying = false, lastHash = "", lastReveal = null, lastLock = false;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var KT = window.KME_TOOLS || {};
  /* v91: 갈래 사이를 오갈 때 브라우저에 남은 옛 화면(최대 10분)이 뜨지 않도록 주소에 판 번호(?v=)를 붙인다 */
  var VER = (function () { var s = document.currentScript && document.currentScript.src, m = s && /[?&]v=([^&]+)/.exec(s); return m ? m[1] : "91"; })();
  var SITES = /^\/(suneung|middle|nonsul|advanced|seonsul)-korean\/([^/]*\.html)?$/;
  function fresh(href) {
    try {
      var u = new URL(href, location.href);
      if (u.origin !== location.origin || !SITES.test(u.pathname) || u.searchParams.get("v") === VER) return null;
      u.searchParams.set("v", VER); return u.pathname + u.search + u.hash;
    } catch (e) { return null; }
  }
  function bustLinks() {
    document.querySelectorAll("a[href]").forEach(function (a) {
      var h = a.getAttribute("href"); if (!h || h.charAt(0) === "#") return;
      var u = new URL(h, location.href); if (u.pathname === location.pathname) return;
      var f = fresh(h); if (f) a.setAttribute("href", f);
    });
  }
  var bt = null;
  function bustSoon() { clearTimeout(bt); bt = setTimeout(bustLinks, 120); }
  if (document.readyState !== "loading") bustSoon(); else document.addEventListener("DOMContentLoaded", bustSoon);
  if (window.MutationObserver) new MutationObserver(bustSoon).observe(document.documentElement, { childList: true, subtree: true });
  function toast(m) { var t = document.getElementById("toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast kt-toast"; document.body.appendChild(t); } t.textContent = m; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 2200); }
  /* v105: 수업은 선생님·관리자 아이디로 로그인했을 때만 열 수 있다(account.js 가 확인해 둔 kma.role) */
  function canTeach() { try { var s = JSON.parse(localStorage.getItem("kma.s") || "null"), r = JSON.parse(localStorage.getItem("kma.role") || "null"); return !!(s && r && r.id === s.id && r.r && !(r.p && r.p.live === 0)); } catch (e) { return false; } }   /* v113: 관리자가 '수업 열기'를 꺼 둔 선생님은 열 수 없다 */
  function T() { return window.Auth ? Auth.teacherView() : canTeach(); }
  function path() { return location.pathname.replace(/index\.html$/, ""); }
  function here() { return path() + (KT.keyPath ? location.hash : (location.hash || "#/")); }
  function inkKey() { return window.Ink ? Ink.key() : ""; }
  function newCode() { var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = ""; for (var i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
  function ssGet() { try { return JSON.parse(sessionStorage.getItem(SS) || "null"); } catch (e) { return null; } }
  function ssSet(v) { try { if (v) sessionStorage.setItem(SS, JSON.stringify(v)); else sessionStorage.removeItem(SS); } catch (e) {} }

  /* ───────── 전달 방법 ───────── */
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = function () { rej(new Error("실시간 연결 모듈을 불러오지 못했습니다.")); }; document.head.appendChild(s); }); }
  var Fire = {
    ready: null,
    init: function () {
      if (this.ready) return this.ready;
      if (!FB) {   /* v113: 로그인에 쓰는 Firebase 앱을 함께 쓴다 — 선생님은 로그인한 계정으로 열고, 학생은 읽기만 */
        this.ready = KMA.fbApp().then(function (app) { if (!app) throw new Error("연결하지 못했습니다."); Fire.app = app; Fire.db = app.firestore(); Fire.kma = true; });
        return this.ready;
      }
      var base = "https://www.gstatic.com/firebasejs/" + FB_VER + "/";
      this.ready = loadScript(base + "firebase-app-compat.js").then(function () {
        return Promise.all([loadScript(base + "firebase-auth-compat.js"), loadScript(base + "firebase-firestore-compat.js")]);
      }).then(function () {
        var app = firebase.apps.filter(function (a) { return a.name === "live"; })[0] || firebase.initializeApp(FB, "live");
        Fire.app = app; Fire.db = app.firestore();
      });
      return this.ready;
    },
    me: function () {
      return this.init().then(function () {
        var a = Fire.app.auth();
        if (a.currentUser) return a.currentUser.uid;
        if (Fire.kma) throw new Error("선생님 아이디로 로그인해 주세요.");
        return a.signInAnonymously().then(function (c) { return c.user.uid; });
      });
    },
    ref: function (c) { return Fire.db.collection("live").doc(c); },
    create: function (c, data) {
      return this.me().then(function (uid) {
        return Fire.ref(c).get().then(function (s) {
          if (s.exists) throw new Error("dup");
          data.owner = uid; data.ts = Date.now();
          return Fire.ref(c).set(data);
        });
      });
    },
    update: function (c, part) { part.ts = Date.now(); return this.init().then(function () { return Fire.ref(c).update(part); }); },
    remove: function (c) { return this.init().then(function () { return Fire.ref(c).delete(); }); },
    watch: function (c, cb, err) {
      var off = null, stop = false;
      this.init().then(function () { if (!stop) off = Fire.ref(c).onSnapshot(function (s) { cb(s.exists ? s.data() : null); }, err); }).catch(err);
      return function () { stop = true; if (off) off(); };
    }
  };
  var bc = ("BroadcastChannel" in window) ? new BroadcastChannel("kme-live") : null;
  var Local = {
    key: function (c) { return "kme.live.doc." + c; },
    read: function (c) { try { return JSON.parse(localStorage.getItem(this.key(c)) || "null"); } catch (e) { return null; } },
    write: function (c, d) { try { if (d) localStorage.setItem(this.key(c), JSON.stringify(d)); else localStorage.removeItem(this.key(c)); } catch (e) {} if (bc) bc.postMessage({ code: c, doc: d }); },
    create: function (c, data) { if (this.read(c)) return Promise.reject(new Error("dup")); data.owner = "local"; data.ts = Date.now(); this.write(c, data); return Promise.resolve(); },
    update: function (c, part) { var d = this.read(c); if (!d) return Promise.reject(new Error("수업이 닫혔습니다.")); Object.assign(d, part, { ts: Date.now() }); this.write(c, d); return Promise.resolve(); },
    remove: function (c) { this.write(c, null); return Promise.resolve(); },
    watch: function (c, cb) {
      var self = this;
      function onMsg(e) { if (e.data && e.data.code === c) cb(e.data.doc); }
      function onSt(e) { if (e.key === self.key(c)) cb(self.read(c)); }
      if (bc) bc.addEventListener("message", onMsg);
      window.addEventListener("storage", onSt);
      setTimeout(function () { cb(self.read(c)); }, 0);
      return function () { if (bc) bc.removeEventListener("message", onMsg); window.removeEventListener("storage", onSt); };
    }
  };
  /* v115: 빠른 통로 — Firebase Realtime Database(읽기·쓰기 횟수 제한이 없고 바로 전해진다). 프로젝트에 만들어져 있고 규칙이 들어 있으면 쓴다.
     live/<코드> = { owner, d: {url, hash, scroll, …, ink: {h, s: {획 이름표: {c, a, p:"x,y,…"}}}}, c: 긋는 중인 획 {h, c, a, p: {n10000: "x,y,…", …}} } */
  var RT = {
    avail: null, ready: null, db: null, app: null, sent: null, inkH: null, cst: null, cl: 0, cn: 0, onCur: null,
    probe: function (u) {
      var ac = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ac) ac.abort(); }, 4000);
      return fetch(u + "/live/PROBE0/owner.json", ac ? { signal: ac.signal } : {}).then(function (r) { clearTimeout(t); return r.ok; }).catch(function () { clearTimeout(t); return false; });
    },
    available: function () {
      if (RT.avail) return RT.avail;
      var c = null; try { c = JSON.parse(sessionStorage.getItem("kme.rt") || "null"); } catch (e) {}
      if (c && Date.now() - c.t < (c.u ? 3600000 : 180000)) return (RT.avail = Promise.resolve(c.u || null));
      RT.avail = KMA.fbApp().then(function (app) {
        var pid = app && app.options && app.options.projectId; if (!pid) return null;
        var urls = (cfg.LIVE_RTDB ? [cfg.LIVE_RTDB] : []).concat(["https://" + pid + "-default-rtdb.asia-southeast1.firebasedatabase.app", "https://" + pid + "-default-rtdb.firebaseio.com", "https://" + pid + "-default-rtdb.europe-west1.firebasedatabase.app"]);
        var tryAt = function (i) { return i >= urls.length ? null : RT.probe(urls[i]).then(function (ok) { return ok ? urls[i] : tryAt(i + 1); }); };
        return tryAt(0);
      }).catch(function () { return null; }).then(function (u) { try { sessionStorage.setItem("kme.rt", JSON.stringify({ u: u, t: Date.now() })); } catch (e) {} return u; });
      return RT.avail;
    },
    init: function () {
      if (RT.ready) return RT.ready;
      RT.ready = RT.available().then(function (u) {
        if (!u) throw new Error("빠른 통로가 아직 없습니다.");
        return KMA.fbApp().then(function (app) {
          return (window.firebase && firebase.database ? Promise.resolve() : loadScript("https://www.gstatic.com/firebasejs/" + FB_VER + "/firebase-database-compat.js")).then(function () { RT.app = app; RT.db = app.database(u); });
        });
      });
      RT.ready.catch(function () { RT.ready = null; });
      return RT.ready;
    },
    ref: function (c) { return RT.db.ref("live/" + c); },
    exists: function (c) { return RT.init().then(function () { return RT.ref(c).child("owner").get(); }).then(function (x) { return x.exists(); }).catch(function () { return false; }); },
    pack: function (k, v) { if (k === "res") return v ? JSON.stringify(v) : null; return v === undefined ? null : v; },
    stroke: function (st) { var o = { c: st.c, p: st.p.join(",") }; if (st.a) o.a = st.a; return o; },
    inkAll: function (ink) {
      var o = { h: (ink && ink.h) || "" }, m = {}, n = 0; RT.sent = {}; RT.inkH = o.h;
      ((ink && ink.s) || []).forEach(function (st) { var id = st.i || ("z" + (n + 100000)); n++; m[id] = RT.stroke(st); RT.sent[id] = st; });
      if (n) o.s = m; return o;
    },
    create: function (c, data) {
      return RT.init().then(function () {
        var u = RT.app.auth().currentUser; if (!u) throw new Error("선생님 아이디로 로그인해 주세요.");
        return RT.ref(c).child("owner").get().then(function (x) {
          if (x.exists()) throw new Error("dup");
          var d = { ts: Date.now() }; Object.keys(data).forEach(function (k) { if (k !== "ink") d[k] = RT.pack(k, data[k]); });
          d.ink = RT.inkAll(data.ink);
          return RT.ref(c).set({ owner: u.uid, d: d });
        });
      });
    },
    /* 고친 칸만 보낸다. 필기는 더해진 획·없어진 획만 */
    update: function (c, part) {
      return RT.init().then(function () {
        var u = {};
        Object.keys(part).forEach(function (k) {
          if (k !== "ink") { u["d/" + k] = RT.pack(k, part[k]); return; }
          var ink = part.ink || { h: "", s: [] };
          if (!RT.sent || (ink.h || "") !== RT.inkH) { u["d/ink"] = RT.inkAll(ink); return; }
          var now = {}; (ink.s || []).forEach(function (st) { if (!st.i) return; now[st.i] = st; if (RT.sent[st.i] !== st) u["d/ink/s/" + st.i] = RT.stroke(st); });
          Object.keys(RT.sent).forEach(function (id) { if (!now[id]) u["d/ink/s/" + id] = null; });
          RT.sent = now;
        });
        u["d/ts"] = Date.now();
        return RT.ref(c).update(u);
      });
    },
    remove: function (c) { return RT.init().then(function () { return RT.ref(c).remove(); }); },
    /* 긋는 중인 획: 처음엔 통째로, 다음부터는 늘어난 점만 */
    cur: function (c, st, k) {
      if (!RT.db || !c) return;
      var r = RT.ref(c).child("c");
      if (!st) { if (RT.cst) { RT.cst = null; r.set(null); } return; }
      if (RT.cst !== st) { RT.cst = st; RT.cl = st.p.length; RT.cn = 1; var o = { h: k, c: st.c, p: { n10000: st.p.join(",") } }; if (st.a) o.a = st.a; r.set(o); return; }
      if (st.p.length > RT.cl) { var add = st.p.slice(RT.cl).join(","); RT.cl = st.p.length; r.child("p/n" + (10000 + RT.cn++)).set(add); }
    },
    unpack: function (d) {
      if (!d) return null;
      var o = Object.assign({}, d), ink = d.ink || {}, sm = ink.s || {};
      if (typeof o.res === "string") { try { o.res = JSON.parse(o.res); } catch (e) { o.res = null; } } else o.res = null;
      o.ink = { h: ink.h || "", s: Object.keys(sm).sort().map(function (id) { var x = sm[id] || {}, st = { c: x.c, i: id, p: String(x.p || "").split(",").map(Number) }; if (x.a) st.a = x.a; return st; }) };
      o.memo = o.memo || ""; o.kq = o.kq || ""; o.lock = !!o.lock; o.reveal = o.reveal || 0; o.scroll = o.scroll || 0;
      return o;
    },
    watch: function (c, cb, err) {
      var off = null, stop = false;
      RT.init().then(function () {
        if (stop) return;
        var r = RT.ref(c), f1 = r.child("d").on("value", function (x) { cb(RT.unpack(x.val())); }, err), f2 = r.child("c").on("value", function (x) { if (RT.onCur) RT.onCur(x.val()); });
        off = function () { r.child("d").off("value", f1); r.child("c").off("value", f2); };
      }).catch(err);
      return function () { stop = true; if (off) off(); };
    }
  };
  /* 서버로 잇는가: 따로 넣은 설정(LIVE_FIREBASE)이 있거나, 계정 서버(account.js)가 Firebase 일 때. 아니면 같은 컴퓨터 창끼리만 */
  function SRV() { return !!(FB || (window.KMA && KMA.fb && KMA.fbApp)); }
  /* 이 수업이 쓰는 통로: "rt"(빠른 통로) | "fs"(Firestore) | "local"(같은 컴퓨터 창끼리) */
  var TRN = "";
  function TR() { return TRN === "rt" ? RT : TRN === "fs" ? Fire : TRN === "local" ? Local : (SRV() ? Fire : Local); }
  var X = { create: function (c, d) { return TR().create(c, d); }, update: function (c, p) { return TR().update(c, p); },
    remove: function (c) { return TR().remove(c); }, watch: function (c, cb, err) { return TR().watch(c, cb, err); } };
  function pickOpen() { return !SRV() ? Promise.resolve("local") : RT.available().then(function (u) { return u ? "rt" : "fs"; }); }
  function pickJoin(c) { return !SRV() ? Promise.resolve("local") : RT.available().then(function (u) { return u ? RT.exists(c).then(function (e) { return e ? "rt" : "fs"; }) : "fs"; }); }

  /* ───────── 교사 ───────── */
  var pending = {}, timer = null;
  function push(part, now) {
    if (role !== "teacher" || !code) return;
    Object.assign(pending, part);
    if (TRN === "rt") { clearTimeout(timer); timer = setTimeout(flush, now ? 0 : 40); return; }   /* 빠른 통로: 바로 */
    if (SRV()) {   /* Firestore: 1초에 한 번까지만(무료 한도) */
      var wait = Math.max(now ? 0 : 350, lastSent + 1000 - Date.now());
      clearTimeout(timer); timer = setTimeout(flush, wait); return;
    }
    clearTimeout(timer);
    timer = setTimeout(flush, now ? 0 : 350);
  }
  var lastSent = 0;
  function flush() {
    var p = pending; pending = {}; lastSent = Date.now();
    if (!Object.keys(p).length) return;
    X.update(code, p).catch(function (e) { toast("수업 화면을 보내지 못했습니다: " + e.message); });
  }
  function scrollRatio() { var h = document.documentElement.scrollHeight - innerHeight; return h > 0 ? Math.round(scrollY / h * 1000) / 1000 : 0; }
  function resPayload(hash) {
    var m = /^#\/res\/([^/?]+)/.exec(hash || "");
    if (!m || !window.DB) return Promise.resolve(null);
    return DB.get("resources", decodeURIComponent(m[1])).then(function (r) { if (!r) return null; var c = Object.assign({}, r); delete c.file; return c; });
  }
  function sendHash() {
    var u = here(), h = KT.keyPath ? location.hash : (location.hash || "#/");
    if (u === lastHash) return; lastHash = u;
    var k = inkKey();
    resPayload(h).then(function (res) { push({ url: u, hash: h, kq: "", scroll: 0, res: res, vw: document.documentElement.clientWidth, ink: { h: k, s: window.Ink ? Ink.mine(k) : [] } }); });
  }
  function openSession() {
    if (!canTeach()) { toast("수업은 선생님 아이디로 로그인해야 열 수 있어요."); return; }
    if (!T()) { if (window.Auth && Auth.setTeacherView) Auth.setTeacherView(true); else { toast("'교사용 보기'를 켠 뒤 수업을 열 수 있습니다."); return; } }
    if (role === "teacher") { renderPanel(); return; }
    var c = newCode(), tries = 0;
    var k0 = inkKey();
    var data = { url: here(), hash: KT.keyPath ? location.hash : (location.hash || "#/"), memo: "", lock: false, reveal: 0, kq: "", scroll: 0, res: null, follow: true, title: document.title, vw: document.documentElement.clientWidth, ink: { h: k0, s: window.Ink ? Ink.mine(k0) : [] } };
    pickOpen().then(function (n) { TRN = n; attempt(); });
    function attempt() {
      X.create(c, Object.assign({}, data)).then(function () {
        role = "teacher"; code = c; doc = data; lastHash = data.url; ssSet({ role: role, code: code, tr: TRN });
        renderPanel(); chip(); toast("수업을 열었습니다. 학생에게 코드 " + c + "를 알려 주세요.");
      }).catch(function (e) {
        if (e.message === "dup" && tries++ < 5) { c = newCode(); return attempt(); }
        toast("수업을 열지 못했습니다: " + e.message);
      });
    }
  }
  function closeSession() {
    if (role === "teacher" && code) X.remove(code).catch(function () {});
    if (unsub) unsub(); unsub = null;
    if (TRN === "rt" && role === "teacher") { RT.cst = null; RT.sent = null; }
    role = null; code = null; doc = null; ssSet(null); TRN = ""; lastInk = null; fitView(0); if (window.Ink && Ink.showCur) Ink.showCur(null);
    document.body.classList.remove("live-lock", "live-on");
    var p = $("#live-panel"); if (p) p.remove();
    chip();
  }
  function renderPanel() {
    var p = $("#live-panel");
    if (!p) { p = document.createElement("aside"); p.id = "live-panel"; p.className = "live-panel no-print"; document.body.appendChild(p); }
    document.body.classList.add("live-on");
    if (role === "teacher") {
      p.className = "live-panel t no-print";
      p.innerHTML = '<div class="lp-head"><b>수업</b><span class="lp-code">' + esc(code) + '</span><button type="button" class="lp-min" data-lp="min" title="접기">–</button></div>' +
        '<div class="lp-body">' + (TRN === "rt" ? '<p class="lp-help">빠른 연결 · 필기가 바로 보여요</p>' : TRN === "fs" ? '<p class="lp-help warn">느린 연결 · 필기는 손을 뗀 뒤 1초쯤 뒤에 보여요</p>' : '<p class="lp-help warn">서버 연결 전 · 이 컴퓨터 창끼리만</p>') +
        '<label class="lp-ck"><input type="checkbox" data-lp="follow"' + (!doc || doc.follow !== false ? " checked" : "") + "> 학생 화면 따라오기</label>" +
        '<label class="lp-ck"><input type="checkbox" data-lp="lock"' + (doc && doc.lock ? " checked" : "") + "> 정답 잠금</label>" +
        '<div class="lp-btns"><button type="button" class="btn sm dark" data-lp="reveal">정답 공개</button><button type="button" class="btn sm line" data-lp="close">수업 닫기</button></div></div>';
      p.querySelector('[data-lp="follow"]').onchange = function (e) { push({ follow: e.target.checked }, true); };
      p.querySelector('[data-lp="lock"]').onchange = function (e) { if (doc) doc.lock = e.target.checked; push({ lock: e.target.checked }, true); };
      p.querySelector('[data-lp="reveal"]').onclick = function () {
        var n = ((doc && doc.reveal) || 0) + 1; if (doc) { doc.reveal = n; doc.lock = false; }
        p.querySelector('[data-lp="lock"]').checked = false;
        push({ reveal: n, lock: false }, true); toast("학생 화면에 정답을 공개했습니다.");
      };
      p.querySelector('[data-lp="close"]').onclick = function () { if (confirm("수업을 닫을까요? 학생 화면의 연결도 끝납니다.")) { closeSession(); toast("수업을 닫았습니다."); } };
    } else {
      p.className = "live-panel s no-print";
      p.innerHTML = '<div class="lp-head"><b>수업</b><span class="lp-code">' + esc(code) + '</span><label class="lp-ck sm"><input type="checkbox" data-lp="sfollow"' + (follow ? " checked" : "") + '> 따라가기</label>' + (COARSE ? '<label class="lp-ck sm" title="선생님 화면과 같은 크기·배치로 보여요(작게 보이면 두 손가락으로 키우세요)"><input type="checkbox" data-lp="sfit"' + (fitOn ? " checked" : "") + '> 선생님 화면 크기</label>' : "") + '<button type="button" class="lp-x" data-lp="leave">나가기</button></div>';
      var sf = p.querySelector('[data-lp="sfit"]'); if (sf) sf.onchange = function (e) { fitOn = e.target.checked; try { sessionStorage.setItem("kme.live.fit", fitOn ? "1" : "0"); } catch (x) {} fitView(doc && doc.vw); };
      p.querySelector('[data-lp="sfollow"]').onchange = function (e) { follow = e.target.checked; fitView(doc && doc.vw); if (follow && doc) apply(doc, true); };
      p.querySelector('[data-lp="leave"]').onclick = function () { closeSession(); toast("수업에서 나왔습니다."); };
    }
    var mn = p.querySelector('[data-lp="min"]'); if (mn) mn.onclick = function () { p.classList.toggle("min"); };
  }

  /* ───────── 학생 ───────── */
  function join(c) {
    c = String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (c.length !== 6) { toast("수업 코드 6자리를 넣어 주세요."); return; }
    if (role === "teacher") { toast("이 창에서는 이미 수업을 열었습니다."); return; }
    if (unsub) unsub();
    var first = true;
    pickJoin(c).then(function (n) { TRN = n; RT.onCur = onCur; start(); });
    function start() { unsub = X.watch(c, function (d) {
      if (!d) {
        if (first) toast("없는 수업 코드입니다. 다시 확인해 주세요."); else { toast("선생님이 수업을 닫았습니다."); }
        closeSession(); return;
      }
      if (first) { first = false; role = "student"; code = c; ssSet({ role: role, code: code, tr: TRN }); toast("수업에 들어왔습니다."); }
      doc = d; apply(d, false);
      if (!$("#live-panel")) renderPanel();
      chip();
    }, function (e) { toast("수업에 연결하지 못했습니다: " + e.message); closeSession(); }); }
  }
  /* 선생님이 지금 긋고 있는 획(빠른 통로) */
  function onCur(c) {
    if (role !== "student" || !window.Ink || !Ink.showCur) return;
    if (!c || !c.p) { Ink.showCur(null); return; }
    var nums = []; Object.keys(c.p).sort().forEach(function (k) { String(c.p[k]).split(",").forEach(function (v) { if (v !== "") nums.push(+v); }); });
    Ink.showCur({ c: c.c, a: c.a, p: nums }, c.h);
  }
  /* 휴대폰·태블릿: 선생님 화면과 같은 너비로 그려서(브라우저가 화면에 맞게 줄여 보여 줌) 배치·여백·필기 자리가 선생님 화면과 같게 */
  var COARSE = !!(window.matchMedia && matchMedia("(pointer: coarse)").matches), vpMeta = null, vpOrig = null, fitOn = true, lastInk = null;
  try { fitOn = sessionStorage.getItem("kme.live.fit") !== "0"; } catch (e) {}
  function fitView(vw) {
    if (!COARSE) return;
    if (!vpMeta) { vpMeta = document.querySelector('meta[name="viewport"]'); if (!vpMeta) return; vpOrig = vpMeta.getAttribute("content") || "width=device-width, initial-scale=1"; }
    var want = (role === "student" && follow && fitOn && vw > 300) ? "width=" + Math.round(vw) : vpOrig;
    if (vpMeta.getAttribute("content") !== want) vpMeta.setAttribute("content", want);
  }
  function apply(d, force) {
    if (role !== "student") return;
    var wasLock = lastLock;
    lastLock = !!d.lock;
    document.body.classList.toggle("live-lock", lastLock);
    if (wasLock && !lastLock) regradeAll();
    if (lastReveal !== null && d.reveal > lastReveal) revealAll();
    lastReveal = d.reveal || 0;
    /* 필기가 바뀌었을 때만 다시 그린다(내리기만 한 때는 그대로) */
    var sig = d.ink ? d.ink.h + "|" + (d.ink.s || []).map(function (x) { return x.i || x.p.length; }).join(",") : "", inkNew = sig !== lastInk || force; lastInk = sig;
    if (window.Ink && inkNew) Ink.showTeacher(d.ink ? d.ink.s : [], d.ink ? d.ink.h : "");
    fitView(d.follow === false ? 0 : d.vw);
    if (!follow || d.follow === false) return;
    if (d.url) {
      var tp = d.url.split("#")[0];
      if (tp !== path()) { if (!applying) { applying = true; location.href = fresh(d.url) || d.url; } return; }
    }
    /* v113: 선생님이 과제 화면(덧창)을 열어 두었으면 필기 열쇠가 host:asg:<과제> — 학생 화면에도 그 과제를 띄우고, 선생님이 내린 만큼 내린다(이때 scroll 은 과제 화면의 위치) */
    var am = /^host:asg:(.+)$/.exec((d.ink && d.ink.h) || ""), aid = am ? am[1] : "";
    var go = function () {
      if (window.KMA && KMA.liveAsg) KMA.liveAsg(aid, aid ? d.scroll : null);
      if (!aid) { openKq(d.kq); scrollTo(d.scroll); }
      if (window.Ink && d.ink && inkNew) setTimeout(function () { Ink.showTeacher(d.ink.s, d.ink.h); }, aid ? 500 : 0);
    };
    if ((d.hash || location.hash) && d.hash !== location.hash && !(!KT.keyPath && d.hash === "#/" && !location.hash)) {
      var nav = function () { applying = true; location.hash = d.hash; setTimeout(function () { applying = false; go(); }, 450); };
      var m = /^#\/res\/([^/?]+)/.exec(d.hash);
      if (m && d.res && window.DB) DB.set("resources", decodeURIComponent(m[1]), Object.assign({}, d.res, { fromLive: true })).then(nav); else nav();
    } else go();
  }
  function openKq(key) {
    if (!key) return;
    var el = document.querySelector('details.kq[data-key="' + (window.CSS && CSS.escape ? CSS.escape(key) : key) + '"]');
    if (el && !el.open) { el.open = true; }
  }
  function scrollTo(r) {
    if (r == null) return;
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0) window.scrollTo({ top: Math.round(r * h), behavior: "smooth" });
  }
  function regradeAll() { document.querySelectorAll("details.kq").forEach(function (d) { if (d._grade) d._grade(); }); }
  function revealAll() {
    if (window.KmeApp && KmeApp.revealAll) KmeApp.revealAll();
    regradeAll();
  }

  /* ───────── 판서 도구의 '수업' 단추 (학습소 밖 갈래) ───────── */
  function menu(btn) {
    if (role) { var p0 = $("#live-panel"); if (p0) p0.classList.toggle("min"); else renderPanel(); return; }
    var m = $("#live-menu");
    if (m) { m.remove(); return; }
    m = document.createElement("div"); m.id = "live-menu"; m.className = "live-menu no-print";
    m.innerHTML = '<form data-live-join><input name="code" maxlength="6" placeholder="수업 코드" autocomplete="off" aria-label="수업 코드"><button type="submit">참여</button></form>' +
      (canTeach() ? '<button type="button" class="lm-open" data-act="live-open">이 화면으로 수업 열기</button>' : "");
    document.body.appendChild(m);
    var r = btn.getBoundingClientRect();
    m.style.left = Math.max(8, r.left) + "px"; m.style.bottom = (innerHeight - r.top + 8) + "px";
    var inp = m.querySelector("input"); inp.focus();
    setTimeout(function () { document.addEventListener("click", function off(e) { if (!m.contains(e.target) && e.target !== btn) { m.remove(); document.removeEventListener("click", off, true); } }, true); }, 0);
  }
  document.addEventListener("submit", function () { var m = $("#live-menu"); if (m) setTimeout(function () { m.remove(); }, 0); }, true);
  document.addEventListener("click", function (e) { if (e.target.closest("#live-menu [data-act='live-open']")) { var m = $("#live-menu"); if (m) setTimeout(function () { m.remove(); }, 0); } }, true);

  /* ───────── 머리 줄의 '수업 중' 표시 ───────── */
  function chip() {
    if (window.Ink && Ink.refreshBar) Ink.refreshBar();
    var slot = document.getElementById("live-slot"); if (!slot) return;
    slot.innerHTML = role ? '<button type="button" class="live-chip" data-lp-show>수업 ' + esc(code) + "</button>" : (T() ? '<button type="button" class="live-chip off" data-act="live-open">수업 열기</button>' : "");
  }

  /* ───────── 연결 ───────── */
  var _rs = history.replaceState, _ps = history.pushState;
  history.replaceState = function () { var r = _rs.apply(this, arguments); setTimeout(onUrl, 0); return r; };
  history.pushState = function () { var r = _ps.apply(this, arguments); setTimeout(onUrl, 0); return r; };
  function onUrl() { if (role === "teacher") sendHash(); }
  window.addEventListener("hashchange", function () { if (role === "teacher") sendHash(); });
  var st = null;
  window.addEventListener("scroll", function () {
    if (role !== "teacher") return;
    clearTimeout(st); st = setTimeout(function () { push({ scroll: scrollRatio() }); }, TRN === "rt" ? 80 : 250);
  }, { passive: true });
  document.addEventListener("toggle", function (e) {
    var d = e.target; if (role !== "teacher" || !d.matches || !d.matches("details.kq")) return;
    push({ kq: d.open ? d.dataset.key : "" });
  }, true);
  document.addEventListener("click", function (e) {
    if (e.target.closest('[data-act="live-open"]')) { e.preventDefault(); openSession(); return; }
    if (e.target.closest("[data-lp-show]")) { var p = $("#live-panel"); if (p) p.classList.remove("min"); else renderPanel(); return; }
    if (role === "teacher" && e.target.closest('[data-act="reveal"]')) { var n = ((doc && doc.reveal) || 0) + 1; if (doc) doc.reveal = n; push({ reveal: n }, true); }
  });
  document.addEventListener("submit", function (e) {
    var f = e.target.closest("[data-live-join]"); if (!f) return;
    e.preventDefault(); join(new FormData(f).get("code"));
  });
  /* 화면이 새로 그려질 때마다 머리 줄 표시를 다시 */
  var app = document.getElementById("app");
  if (app && window.MutationObserver) new MutationObserver(function () { chip(); }).observe(app, { childList: true });

  /* 교사 판서 → 학생 화면 */
  if (window.Ink) Ink.onChange(function (strokes, k, final, cur) {
    if (role !== "teacher") return;
    if (TRN === "rt") { if (final || !cur) { RT.cur(code, null); push({ ink: { h: k, s: strokes } }, true); } else RT.cur(code, cur, k); return; }   /* 긋는 중인 획은 늘어난 점만 바로 */
    if (TRN === "fs") { if (final) push({ ink: { h: k, s: strokes } }, true); return; }                                                               /* Firestore: 손을 뗐을 때만 */
    push({ ink: { h: k, s: cur ? strokes.concat([cur]) : strokes } }, final);
  });
  var rzT = null;
  window.addEventListener("resize", function () { if (role !== "teacher") return; clearTimeout(rzT); rzT = setTimeout(function () { push({ vw: document.documentElement.clientWidth }); }, 400); });
  window.Live = {
    teacherInk: function (k) { return role === "student" && doc && doc.ink && doc.ink.h === k ? doc.ink.s : []; },
    locked: function () { return role === "student" && lastLock; },
    role: function () { return role; },
    /* v113: 과제 화면이 열리고 닫힐 때(account.js) — 필기 열쇠가 바뀌므로 그 열쇠와 필기를 바로 보낸다 */
    asg: function (id) { if (role !== "teacher") return; var k = inkKey(); push({ ink: { h: k, s: window.Ink ? Ink.mine(k) : [] }, scroll: id ? 0 : scrollRatio() }, true); },
    asgScroll: function (r) { if (role === "teacher") push({ scroll: r }); },
    code: function () { return code; },
    open: openSession, join: join, close: closeSession, menu: menu,
    server: SRV, via: function () { return TRN; }, fast: function () { return RT.available(); }
  };

  /* 새로 고침 뒤 이어 가기 — account.js 까지 다 읽힌 뒤에(서버로 이을지 그때 안다) */
  function resume() {
    var me = ssGet();
    if (!me || !me.code) return;
    TRN = me.tr || (SRV() ? "fs" : "local");
    if (me.role === "teacher") {
      role = "teacher"; code = me.code;
      X.watch(code, function (d) { if (d && role === "teacher") { var first = !doc; doc = d; if (first) { renderPanel(); if (d.url !== here()) { lastHash = ""; sendHash(); } } } else if (!d && role === "teacher") closeSession(); }, function () {});
      setTimeout(chip, 0);
    } else join(me.code);
  }
  if (document.readyState === "complete") setTimeout(resume, 0); else window.addEventListener("load", function () { setTimeout(resume, 0); });
})();
