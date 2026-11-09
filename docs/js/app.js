/* 국어의 모든 것 — 화면과 라우팅 */
(function () {
  var $app = document.getElementById("app");
  var K = window.KOREAN;
  var LV = [
    { key: "basic", s: "b", name: "기본", cls: "basic", sc: "s-basic", gc: "", ms: "사례를 보고 개념 찾기", hs: "개념 확인 · 기본 기출" },
    { key: "advanced", s: "a", name: "심화", cls: "adv", sc: "s-adv", gc: "adv", ms: "사례 비교·분석 자료", hs: "적용 · 심화 기출" },
    { key: "extension", s: "e", name: "발전", cls: "ext", sc: "s-ext", gc: "ext", ms: "삶과 매체에 적용하기", hs: "탐구 과제 · 도전 기출" }
  ];
  var LVBY = {}; LV.forEach(function (l) { LVBY[l.key] = l; LVBY[l.s] = l; });
  var CIRC = ["", "①", "②", "③", "④", "⑤"];
  var progress = { done: {}, recent: [], solved: {} };
  var myAssign = [];   // 학생: 내 과제 목록 [{a, cls, sub}]
  var dataReady = false, dataErrors = [];
  /* v88 시안: 문제은행과 같은 디자인(흰 바탕·남색·상단 메뉴·영상 머리). index_v88.html 의 <html data-skin="v88"> 일 때만 */
  var SKIN = document.documentElement.getAttribute("data-skin") || "";
  var V88 = !!SKIN, V89 = SKIN === "v89";   /* v89 시안: 조선 백자 — 더 담백하게, 설명 줄이기 */

  /* ───────── 유틸 ───────── */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>"); }
  function bank(s) { /* 문제은행 밑줄(U+FDD0~1)·글자 상자(U+FDD2~3) */
    var h = esc(s), out = "", u = false, b = false;
    if (!/[﷐-﷓]/.test(h)) return h;
    for (var i = 0; i < h.length; i++) {
      var c = h[i];
      if (c === "﷐") { if (!u) { out += '<u class="ul">'; u = true; } }
      else if (c === "﷑") { if (u) { out += "</u>"; u = false; } }
      else if (c === "﷒") { if (!b) { out += '<span class="bx">'; b = true; } }
      else if (c === "﷓") { if (b) { if (u) { out += "</u>"; u = false; } out += "</span>"; b = false; } }
      else out += c;
    }
    return out + (u ? "</u>" : "") + (b ? "</span>" : "");
  }
  function plain(s) { return String(s == null ? "" : s).replace(/[﷐-﷓]/g, ""); }
  /* 꺾쇠: brs = [[표시, 쪽(R/L), 첫 줄 앞 글자, 끝 줄 뒤 글자]] (data/kichul/brackets.js)
     시험지처럼 묶인 부분 옆에 꺾음선을 긋고 표시([A])를 선 가운데에 둔다. 따로 떠 있던 [A] 글자는 지운다. */
  /* 대화 지문: 화자 표시(학생1:, 진행자 :, 부원 2: 등) 앞에서 줄을 바꾼다(시험지처럼). 화자 표시가 3번 이상일 때만 */
  function speakers(t) {
    var re = /([.?!”’)…~])((?:\s+\[[A-E]\])?)\s+((?:[가-힣]{1,5}\s?\d{0,2})\s?:\s)/g;
    if ((t.match(/(?:^|[\s])[가-힣]{1,5}\s?\d{0,2}\s?:\s/g) || []).length < 3) return t;
    return t.replace(re, "$1$2\n$3");
  }
  function bankBr(text, brs) {
    text = speakers(String(text == null ? "" : text));
    brs = brs || [];
    /* 네모 빈칸([표시, "X", "wide"|""]): 표시 글자를 상자로 바꿀 자리표(U+E000)로 둔다 */
    var brLabs = brs.filter(function (b) { return b[1] !== "X"; }).map(function (b) { return b[0]; });
    var boxes = brs.filter(function (b) { return b[1] === "X" && brLabs.indexOf(b[0]) < 0; }), wide = {};
    boxes.forEach(function (b) { wide[b[0]] = b[2] === "wide"; text = text.split("[" + b[0] + "]").join("" + b[0]); });
    brs = brs.filter(function (b) { return b[1] !== "X"; });
    var html = bankBr2(text, brs);
    return boxes.length ? html.replace(/([A-E])/g, function (m, l) { return '<span class="blank' + (wide[l] ? " wide" : "") + '">[' + l + "]</span>"; }) : html;
  }
  function bankBr2(text, brs) {
    if (!brs || !brs.length) return bank(text);
    var masked = text.replace(/\[[A-E]\]/g, function (m) { return "\u0000\u0000\u0000"; });
    var map = [], buf = [];
    for (var i = 0; i < masked.length; i++) if (/[가-힣0-9A-Za-z]/.test(masked[i])) { buf.push(masked[i]); map.push(i); }
    var N = buf.join(""), ranges = [];
    brs.forEach(function (b) {
      var lab = "[" + b[0] + "]", li = text.indexOf(lab), best = -1, bd = 1e9, k = -1;
      while ((k = N.indexOf(b[2], k + 1)) >= 0) { var dd = Math.abs(map[k] - li); if (dd < bd) { bd = dd; best = k; } }
      if (best < 0) return;
      var ib = N.indexOf(b[3], best); if (ib < 0) return;
      var s = map[best], e = map[ib + b[3].length - 1] + 1;
      while (s > 0 && !/\s/.test(text[s - 1])) s--;                 // 앞쪽 따옴표·기호까지
      while (e < text.length && !/\s/.test(text[e]) && text[e] !== "[") e++;   // 뒤쪽 문장부호까지
      if (ranges.some(function (r) { return s < r.e && e > r.s; })) return;
      ranges.push({ s: s, e: e, l: b[0], side: b[1], lab: lab });
    });
    if (!ranges.length) return bank(text);
    var labs = ranges.map(function (r) { return r.lab; });
    ranges.sort(function (a, b) { return a.s - b.s; });
    var out = "", pos = 0;
    function seg(t) { /* 꺾쇠 표시 글자와 그 줄의 빈 줄바꿈 정리 */
      labs.forEach(function (lb) { t = t.split("\n" + lb + "\n").join("\n").split(" " + lb + "\n").join("\n").split(lb).join(""); });
      return t;
    }
    ranges.forEach(function (r) {
      var before = seg(text.slice(pos, r.s)).replace(/\n$/, "");
      var inner = seg(text.slice(r.s, r.e));
      out += bank(before) + '<span class="brk ' + (r.side === "L" ? "brk-l" : "brk-r") + '"><span class="brk-t">' + bank(inner) + '</span><span class="brk-lab">[' + r.l + "]</span></span>";
      pos = r.e;
      if (text[pos] === "\n") pos++;
    });
    return out + bank(seg(text.slice(pos)));
  }
  function h(html) { $app.innerHTML = html; window.scrollTo(0, 0); }
  function toast(m) { var t = document.getElementById("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 2000); }
  function user() { return Auth.current(); }
  function T() { var u = user(); return !!(u && u.isTeacher); }
  function link(code, lv) { return "#/learn/" + encodeURIComponent(code) + (lv ? "/" + lv : ""); }
  function isMiddle(subject) { return subject.school === "middle"; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function fmtDate(t) { if (!t) return ""; var d = new Date(t); return (d.getMonth() + 1) + "월 " + d.getDate() + "일"; }
  function dueText(due) {
    if (!due) return "기한 없음";
    var d = new Date(due + "T23:59:59"), now = new Date(), days = Math.ceil((d - now) / 86400000);
    return fmtDate(d) + (days < 0 ? " (마감)" : days === 0 ? " (오늘 마감)" : " (D-" + days + ")");
  }
  function doneOf(code) { return progress.done[code] || {}; }
  function pips(code) { var d = doneOf(code); return '<span class="pips" title="기본·심화·발전">' + LV.map(function (l) { return '<i class="pip ' + l.cls + (d[l.s] ? " on" : "") + '"></i>'; }).join("") + "</span>"; }
  function subjPct(s) { var t = 0, g = 0; s.areas.forEach(function (a) { a.standards.forEach(function (st) { t += 3; var d = doneOf(st.code); g += (d.b ? 1 : 0) + (d.a ? 1 : 0) + (d.e ? 1 : 0); }); }); return t ? Math.round(g / t * 100) : 0; }
  function saveProgress() { if (user()) Auth.saveProgress(progress).catch(function (e) { console.error(e); toast("학습 기록을 저장하지 못했습니다."); }); }
  function draftKey(k) { return "kme.draft." + (user() ? user().uid : "") + "." + k; }
  function getDraft(k) { try { return localStorage.getItem(draftKey(k)) || ""; } catch (e) { return ""; } }
  function setDraft(k, v) { try { localStorage.setItem(draftKey(k), v); } catch (e) {} }
  function schoolName(id) { var s = K.SCHOOLS.filter(function (x) { return x.id === id; })[0]; return s ? s.name : ""; }
  function kw(st) { return (st.keywords || []).slice(0, 5).join(" · "); }

  /* ───────── 틀 ───────── */
  function shell(active, inner) {
    var u = user();
    if (V88) return shell88(active, inner);
    var nav = [["home", "#/", "홈"], ["middle", "#/school/middle", "중학교"], ["common", "#/school/common", "고등 공통"], ["elective", "#/school/elective", "고등 선택"], ["standards", "#/standards", "성취기준"]];
    if (T()) { nav.push(["share", "#/share", "내 활동 자료"]); nav.push(["teacher", "#/teacher", "교사 자료실"]); }
    else nav.push(["my", "#/my", "내 학습"]);
    return '<header class="topbar"><div class="board"><div class="topbar-in">' +
      '<a class="brand" href="#/">국어의 <b>모든 것</b><small class="stage">1단계 · 개념 학습</small></a>' +
      '<nav class="nav">' + nav.map(function (n) { return '<a href="' + n[1] + '"' + (active === n[0] ? ' class="on"' : "") + ">" + n[2] + "</a>"; }).join("") + "</nav>" +
      '<div class="who"><span id="live-slot"></span><label class="tv-sw" title="성취기준 원문·지도 유의점·정답 보기·학습지 인쇄·수업 열기를 보여 줍니다."><input type="checkbox" data-act="tv"' + (T() ? " checked" : "") + '><span>교사용 보기</span></label>' +
      '<a class="hub" href="/suneung-korean/" title="국어의 모든 것 첫 화면(1~5단계)">첫 화면</a></div>' +
      "</div></div></header>" + inner +
      '<footer class="foot">국어의 모든 것 · 1단계 개념 학습 · 2022 개정 국어과 교육과정 기반 · 기출 문항 저작권: 한국교육과정평가원(비영리 학습용) · 학습 기록은 이 브라우저에만 저장됩니다</footer>';
  }
  function shell88(active, inner) {
    var nav = V89 ? [["middle", "#/school/middle", "중학교"], ["high", "#/school/high", "고등학교"], ["standards", "#/standards", "성취기준"]] :
      [["middle", "#/school/middle", "중학교"], ["common", "#/school/common", "고등 공통"], ["elective", "#/school/elective", "고등 선택"], ["standards", "#/standards", "성취기준"]];
    if (V89 && (active === "common" || active === "elective")) active = "high";
    if (!V89) nav.unshift(["home", "#/", "처음"]);
    if (T()) { nav.push(["share", "#/share", V89 ? "활동" : "내 활동 자료"]); nav.push(["teacher", "#/teacher", V89 ? "자료실" : "교사 자료실"]); }
    else nav.push(["my", "#/my", "내 학습"]);
    return '<header class="gnb"><div class="inner">' +
      '<a class="logo" href="#/" aria-label="1단계 개념 학습 처음 화면"><span class="logo-text"><span class="logo-old" lang="okm">내히 이러</span>' + (V89 ? "" : '<span class="logo-sub">개념 학습</span><span class="logo-gloss">냇물을 이루어</span>') + "</span></a>" +
      '<nav class="gnb-nav" aria-label="주 메뉴">' + nav.map(function (n) { return '<a class="gnb-link' + (active === n[0] ? " active" : "") + '" href="' + n[1] + '">' + n[2] + "</a>"; }).join("") +
      '<a class="gnb-link sub" href="/suneung-korean/">' + (V89 ? "전체" : "처음 화면") + "</a></nav>" +
      '<div class="gnb-tools"><span id="live-slot"></span><label class="tv-sw" title="교사용 내용 보기"><input type="checkbox" data-act="tv"' + (T() ? " checked" : "") + '><span>' + (V89 ? "교사" : "교사용 보기") + "</span></label></div>" +
      "</div></header>" + inner + (V89 ? '<footer class="foot89"><div class="inner"><span class="okm" lang="okm">ᄉᆡ미 기픈 므른 ᄀᆞᄆᆞ래 아니 그츨ᄊᆡ 내히 이러 바ᄅᆞ래 가ᄂᆞ니</span><span>국어의 모든 것 · 기출 저작권 한국교육과정평가원</span></div></footer>' : "") + (V89 ? "" :
      '<footer class="foot88"><div class="inner"><div class="foot-top"><span class="foot-name"><span class="okm" lang="okm">내히 이러</span> · 냇물을 이루어' +
      '<span class="foot-verse" lang="okm">ᄉᆡ미 기픈 므른 ᄀᆞᄆᆞ래 아니 그츨ᄊᆡ 내히 이러 바ᄅᆞ래 가ᄂᆞ니<small>「용비어천가」 제2장</small></span></span>' +
      "<span>국어의 모든 것 · 1단계 개념 학습 · 2022 개정 국어과 교육과정</span></div>" +
      '<p class="foot-copy">기출 문항의 저작권은 한국교육과정평가원에 있습니다(비영리 학습용). 학습 기록은 이 브라우저에만 저장됩니다.</p></div></footer>');
  }
  function hero88(w) {
    return '<section class="hero88"><div class="hero-media" aria-hidden="true"><video class="hv" muted playsinline loop autoplay preload="metadata" poster="/suneung-korean/media/hero3.jpg" src="/suneung-korean/media/hero3.mp4"></video><div class="hero-shade"></div></div>' +
      '<div class="inner hero-inner"><p class="hero-eyebrow">2022 개정 교육과정<i></i>중학교 · 고등학교 국어</p>' +
      '<p class="hero-copy">냇물을 이루어<br>바다에 이른다.</p>' +
      "<h1>국어 개념 학습</h1>" +
      '<p class="sub">성취기준 170개를 개념 → 기본 → 심화 → 발전으로 공부하고, 고등학교 주제는 평가원 기출로 확인합니다.</p>' +
      '<form class="search-form" data-search role="search"><input name="q" type="search" autocomplete="off" placeholder="개념어로 찾기 (예: 음운 변동, 비유, 논증)" aria-label="개념어 검색"><button type="submit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>찾기</button></form>' +
      (w ? '<p class="hero-word">오늘의 낱말 <a href="' + link(w.r.std.code) + '">' + esc(w.c.term) + "</a> — " + esc(plain(w.c.desc).replace(/\*\*/g, "").slice(0, 60)) + (w.c.desc.length > 60 ? "…" : "") + "</p>" : "") +
      "</div></section>";
  }
  function hero89() {
    return '<section class="hero89"><div class="inner"><span class="jar" aria-hidden="true"></span>' +
      "<h1>국어 개념 학습</h1>" +
      '<form class="search-form" data-search role="search"><input name="q" type="search" autocomplete="off" placeholder="개념어 찾기" aria-label="개념어 찾기"><button type="submit">찾기</button></form>' +
      '<form class="join89" data-live-join><input name="code" maxlength="6" placeholder="수업 코드" autocomplete="off" aria-label="수업 코드"><button>참여</button></form>' +
      "</div></section>";
  }
  function todayStr() { var d = new Date(); return (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + "일월화수목금토"[d.getDay()] + "요일"; }

  /* ───────── 로그인 ───────── */
  function viewAuth(tab) {
    document.title = "국어의 모든 것";
    var local = Auth.mode === "local";
    h('<div class="auth"><section class="auth-board board">' +
      '<div class="auth-date">' + todayStr() + "</div>" +
      "<div><h1>국어의<br><b>모든 것</b></h1>" +
      '<p class="lead">중학교부터 고등학교까지,<br>국어 시간에 배우는 모든 개념을 한 칠판에.</p>' +
      '<div class="auth-steps"><span class="c1">개념</span><span class="c2">기본</span><span class="c3">심화</span><span class="c4">발전</span></div></div>' +
      '<div class="auth-date" style="font-size:21px">교사와 학생 모두 로그인 후 이용합니다.</div></section>' +
      '<section class="auth-main"><div class="auth-form">' +
      "<h2>" + (tab === "signup" ? "회원 가입" : tab === "reset" ? "비밀번호 찾기" : "로그인") + "</h2>" +
      '<p class="muted small">' + (tab === "signup" ? "교사 계정은 관리자 승인 후 교사 기능이 열립니다." : "학교에서 안내받은 이메일로 로그인하세요.") + "</p>" +
      '<div class="auth-tabs"><button data-tab="login"' + (tab === "login" ? ' class="on"' : "") + '>로그인</button><button data-tab="signup"' + (tab === "signup" ? ' class="on"' : "") + ">회원 가입</button></div>" +
      (tab === "login" ? formLogin() : tab === "signup" ? formSignup() : formReset()) +
      (local ? '<div class="note"><b>체험 모드</b> — 계정·학급·과제가 이 브라우저에만 저장됩니다. 같은 브라우저에서 교사·학생 계정을 번갈아 로그인해 기능을 시험해 볼 수 있습니다.</div>' : "") +
      "</div></section></div>");
    $app.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { location.hash = "#/" + b.dataset.tab; }; });
    var f = $app.querySelector("form"), msg = $app.querySelector(".msg");
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var fd = new FormData(f), btn = f.querySelector("[type=submit]"), p;
      msg.className = "msg"; msg.textContent = ""; btn.disabled = true;
      function fail(t) { msg.className = "msg err"; msg.textContent = t; btn.disabled = false; }
      if (tab === "signup") {
        if (fd.get("password") !== fd.get("password2")) return fail("비밀번호 확인이 일치하지 않습니다.");
        if (!String(fd.get("name") || "").trim()) return fail("이름을 입력해 주세요.");
        p = Auth.signUp({ name: String(fd.get("name")).trim(), email: fd.get("email"), password: fd.get("password"), role: fd.get("role"), school: fd.get("school") });
      } else if (tab === "reset") {
        p = Auth.resetPassword(fd.get("email")).then(function () { msg.className = "msg ok"; msg.textContent = "재설정 메일을 보냈습니다."; });
      } else p = Auth.signIn(fd.get("email"), fd.get("password"));
      p.then(function () { btn.disabled = false; if (tab !== "reset") { var nx = ""; try { nx = sessionStorage.getItem("kme.next") || ""; sessionStorage.removeItem("kme.next"); } catch (e) {} location.hash = nx || "#/"; } }).catch(function (e) { fail(e.message); });
    };
  }
  function formLogin() {
    return '<form><label class="field"><span>이메일</span><input class="input" name="email" type="email" required autocomplete="username"></label>' +
      '<label class="field"><span>비밀번호</span><input class="input" name="password" type="password" required autocomplete="current-password"></label>' +
      '<div class="msg"></div><button class="btn dark block" type="submit">로그인</button>' +
      '<p class="small" style="margin-top:12px"><a class="muted" href="#/reset">비밀번호를 잊으셨나요?</a></p></form>';
  }
  function formSignup() {
    return '<form><div class="field"><span>구분</span><div class="seg"><label><input type="radio" name="role" value="student" checked>학생</label><label><input type="radio" name="role" value="teacher">교사</label></div></div>' +
      '<label class="field"><span>이름</span><input class="input" name="name" required></label>' +
      '<label class="field"><span>학교급</span><select class="input" name="school"><option value="middle">중학교</option><option value="high">고등학교</option><option value="etc">기타</option></select></label>' +
      '<label class="field"><span>이메일</span><input class="input" name="email" type="email" required autocomplete="username"></label>' +
      '<label class="field"><span>비밀번호 (6자 이상)</span><input class="input" name="password" type="password" minlength="6" required autocomplete="new-password"></label>' +
      '<label class="field"><span>비밀번호 확인</span><input class="input" name="password2" type="password" minlength="6" required autocomplete="new-password"></label>' +
      '<div class="msg"></div><button class="btn dark block" type="submit">가입하기</button></form>';
  }
  function formReset() {
    return '<form><label class="field"><span>가입한 이메일</span><input class="input" name="email" type="email" required></label>' +
      '<div class="msg"></div><button class="btn dark block" type="submit">재설정 메일 받기</button>' +
      '<p class="small" style="margin-top:12px"><a class="muted" href="#/login">로그인으로 돌아가기</a></p></form>';
  }

  /* ───────── 홈 ───────── */
  function wordOfDay() {
    var all = K.all(); if (!all.length) return null;
    var d = new Date(), seed = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
    for (var i = 0; i < 20; i++) {
      var r = all[(seed * 7 + i * 13) % all.length], c = (r.std.concepts || [])[(seed + i) % Math.max(1, (r.std.concepts || []).length)];
      if (c) return { r: r, c: c };
    }
    return null;
  }
  function subjCard(s) {
    var p = subjPct(s);
    return '<a class="subj c-' + s.school + (s.count ? "" : " empty") + '" href="#/subject/' + s.id + '"><span class="spine"></span><span class="in">' +
      (V89 ? "" : '<span class="kind">' + esc(s.kind) + " · " + esc(s.grade) + "</span>") + "<h3>" + esc(s.name) + "</h3>" +
      '<span class="meta">' + (s.count ? (V89 ? "주제 " + s.count : s.areas.length + "개 영역 · 학습 주제 " + s.count + "개") : "자료 준비 중") + "</span>" +
      (s.count && !T() ? '<div class="bar"><i style="width:' + p + '%"></i></div>' : "") + "</span></a>";
  }
  function viewHome() {
    document.title = "국어의 모든 것";
    var u = user(), w = wordOfDay();
    var html = V89 ? hero89() + '<main class="wrap">' : V88 ? hero88(w) + '<main class="wrap">' : '<main class="wrap"><section class="today board"><div class="today-top"><h1>오늘의 칠판,<br>개념부터 차근차근.</h1>' +
      '<div class="date">' + todayStr() + "<br>" + (T() ? "교사용 보기" : "1단계 · 개념 학습") + "</div></div>" +
      (w ? '<div class="word">오늘의 낱말 — <a href="' + link(w.r.std.code) + '"><em>' + esc(w.c.term) + '</em></a><span class="wd">' + esc(plain(w.c.desc).replace(/\*\*/g, "").slice(0, 70)) + (w.c.desc.length > 70 ? "…" : "") + "</span></div>" : "") +
      '<form data-search><input class="input" name="q" placeholder="개념어로 찾기 (예: 음운, 비유, 논증)"><button>찾기</button></form></section>';
    if (!V89) html += '<div class="live-join no-print"><b>수업 참여</b><span class="muted">선생님이 알려 준 수업 코드를 넣으면 선생님 화면과 메모를 함께 봅니다.</span><form data-live-join><input class="input" name="code" maxlength="6" placeholder="수업 코드 6자리" autocomplete="off" style="text-transform:uppercase"><button class="btn dark">참여</button></form></div>';
    if (!V89) html += '<div class="legend"><span><i class="dot basic"></i>기본</span><span><i class="dot adv"></i>심화</span><span><i class="dot ext"></i>발전</span><span class="muted">중학교는 사례·그림·영상으로 개념을 찾고, 고등학교는 평가원 기출로 확인합니다.</span></div>';
    html += '<div id="home-extra"></div>';
    var recent = (progress.recent || []).map(function (c) { return K.find(c); }).filter(Boolean).slice(0, 4);
    if (recent.length) html += '<h2 class="h2">' + (V89 ? "이어서" : "이어서 공부하기") + '</h2><div class="grid g4">' + recent.map(function (r) {
      return '<a class="subj c-' + r.subject.school + '" href="' + link(r.std.code) + '"><span class="spine"></span><span class="in"><span class="kind">' + esc(r.subject.name) + " · " + esc(r.area.name) + '</span><h3 style="font-size:17px">' + esc(r.std.title) + "</h3>" + pips(r.std.code) + "</span></a>";
    }).join("") + "</div>";
    if (V89) {
      html += '<h2 class="h2">중학교</h2><div class="grid g3">' + K.SUBJECTS.filter(function (s) { return s.school === "middle"; }).map(subjCard).join("") + "</div>" +
        '<h2 class="h2">고등학교</h2><div class="grid g3">' + highCards() + "</div>";
    } else K.SCHOOLS.forEach(function (sc) {
      html += '<h2 class="h2">' + esc(sc.name) + (V89 ? "" : " <small>" + esc(sc.note) + "</small>") + '</h2><div class="grid g3">' + K.SUBJECTS.filter(function (s) { return s.school === sc.id; }).map(subjCard).join("") + "</div>";
    });
    if (dataErrors.length) html += '<p class="small muted" style="margin-top:28px">불러오지 못한 자료: ' + esc(dataErrors.join(", ")) + "</p>";
    h(shell("home", html + "</main>"));
    homeExtra();
  }
  function homeExtra() {
    var box = document.getElementById("home-extra"); if (!box) return;
    return; /* 학급·과제는 사이트 전체 로그인 단계에서 다시 연다 */
    if (T()) {
      DB.where("classes", "teacherUid", user().uid).then(function (cls) {
        if (!cls.length) { box.innerHTML = '<h2 class="h2">내 학급</h2><div class="empty">아직 만든 학급이 없습니다. <a class="btn sm" href="#/classes">학급 만들기</a></div>'; return; }
        box.innerHTML = '<h2 class="h2">내 학급 <small><a href="#/classes">전체 보기</a></small></h2><div class="grid g4">' + cls.map(classCard).join("") + "</div>";
      });
    } else {
      loadMyAssign().then(function () {
        var open = myAssign.filter(function (x) { return !x.sub || x.sub.status !== "submitted"; });
        if (!open.length) return;
        box.innerHTML = '<h2 class="h2">해야 할 과제 <small>' + open.length + "개</small></h2>" + assignTable(open);
      });
    }
  }

  /* ───────── 학습 요소 ─────────
     성취기준마다 배우는 핵심 요소. 따로 적은 elements가 있으면 그것을, 없으면 근거 대조를 마친 개념어(concepts)를 쓴다. */
  function elemsOf(st) {
    if (st.elements && st.elements.length) return st.elements;
    var out = [];
    (st.concepts || []).forEach(function (c) { var t = String(c.term || "").trim(); if (t && out.indexOf(t) < 0) out.push(t); });
    if (!out.length) (st.keywords || []).forEach(function (k) { if (out.indexOf(k) < 0) out.push(k); });
    return out;
  }
  function elemHtml(st) {
    var e = elemsOf(st); if (!e.length) return "";
    return '<div class="elem"><span class="lb">학습 요소</span>' + e.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>";
  }
  /* 성취기준·학습 요소 한눈에 보기 (#/standards, #/standards/<과목>) */
  function viewStandards(sid) {
    document.title = "성취기준·학습 요소 · 국어의 모든 것";
    var subs = K.SUBJECTS.filter(function (s) { return s.count; }), t = T(), tot = 0;
    subs.forEach(function (s) { tot += s.count; });
    var cur = sid ? K.subject(sid) : null;
    var html = '<main class="wrap"><div class="crumbs"><a href="#/">홈</a><i>›</i>성취기준·학습 요소</div><h1 class="title">성취기준·학습 요소</h1>' +
      (V89 ? "" : '<p class="sub">2022 개정 국어과 교육과정 중학교 「국어」, 고등학교 공통국어1·2와 선택 과목 9개의 성취기준 ' + tot + '개를 모두 담았습니다. 주제를 누르면 개념 → 기본 → 심화 → 발전으로 공부합니다.' + (t ? "" : " (성취기준 원문은 '교사용 보기'를 켜면 보입니다.)") + "</p>") +
      '<div class="chips no-print"><a class="chip' + (cur ? "" : " on") + '" href="#/standards">전체</a>' + subs.map(function (s) { return '<a class="chip' + (cur === s ? " on" : "") + '" href="#/standards/' + s.id + '">' + esc(s.name) + " <small>" + s.count + "</small></a>"; }).join("") + "</div>";
    (cur ? [cur] : subs).forEach(function (s) {
      html += '<section class="std-sec"><h2 class="h2">' + esc(s.name) + " <small>" + esc(s.kind) + " · " + esc(s.grade) + " · " + s.count + "개</small></h2>";
      s.areas.forEach(function (a) {
        html += (s.areas.length > 1 ? '<h3 class="std-area">' + esc(a.name) + "</h3>" : "") + '<div class="scroll"><table class="tbl std-tbl"><thead><tr>' + (t ? '<th style="width:30%">성취기준</th>' : "") + '<th style="width:' + (t ? 26 : 36) + '%">학습 주제</th><th>학습 요소</th><th class="n">단계</th></tr></thead><tbody>' +
          a.standards.map(function (st) {
            return "<tr>" + (t ? '<td class="small"><b>' + esc(st.code) + "</b> " + esc(st.text) + "</td>" : "") + '<td><a href="' + link(st.code) + '"><b>' + esc(st.title) + "</b></a></td>" +
              '<td class="small">' + esc(elemsOf(st).join(" · ")) + '</td><td class="n">' + pips(st.code) + "</td></tr>";
          }).join("") + "</tbody></table></div>";
      });
      html += "</section>";
    });
    h(shell("standards", html + "</main>"));
  }

  /* ───────── 학교급·과목 ───────── */
  /* 고등학교: '공통'과 '선택'을 고르는 화면 */
  function highCards() {
    var com = K.SUBJECTS.filter(function (s) { return s.school === "common" && s.count; }), ele = K.SUBJECTS.filter(function (s) { return s.school === "elective" && s.count; });
    var n = function (l) { return l.reduce(function (t, s) { return t + s.count; }, 0); };
    var card = function (href, name, meta) { return '<a class="subj c-high" href="' + href + '"><span class="spine"></span><span class="in"><h3>' + name + '</h3><span class="meta">' + meta + "</span></span></a>"; };
    return card("#/school/common", "공통", com.map(function (s) { return esc(s.name); }).join(" · ") + " · 주제 " + n(com)) +
      card("#/school/elective", "선택", "일반 · 진로 · 융합 " + ele.length + "과목 · 주제 " + n(ele));
  }
  function viewHigh() {
    document.title = "고등학교 · 국어의 모든 것";
    h(shell("high", '<main class="wrap"><div class="crumbs"><a href="#/">홈</a><i>›</i>고등학교</div><h1 class="title">고등학교</h1><div class="grid g3">' + highCards() + "</div></main>"));
  }
  function viewSchool(id) {
    if (id === "high") return viewHigh();
    var sc = K.SCHOOLS.filter(function (x) { return x.id === id; })[0]; if (!sc) return notFound();
    document.title = sc.name + " · 국어의 모든 것";
    var groups = {}, order = [];
    K.SUBJECTS.filter(function (s) { return s.school === id; }).forEach(function (s) { if (!groups[s.kind]) { groups[s.kind] = []; order.push(s.kind); } groups[s.kind].push(s); });
    var high = id !== "middle";
    var html = '<main class="wrap"><div class="crumbs"><a href="#/">홈</a><i>›</i>' + (high ? '<a href="#/school/high">고등학교</a><i>›</i>' + (id === "common" ? "공통" : "선택") : esc(sc.name)) + '</div><h1 class="title">' + (V89 && high ? (id === "common" ? "공통" : "선택") : esc(sc.name)) + "</h1>" + (V89 ? "" : '<p class="sub">' + esc(sc.note) + "</p>");
    order.forEach(function (g) { html += (order.length > 1 || !V89 ? '<h2 class="h2">' + esc(g) + "</h2>" : "") + '<div class="grid g3">' + groups[g].map(subjCard).join("") + "</div>"; });
    h(shell(id, html + "</main>"));
  }
  function viewSubject(id, ac) {
    var s = K.subject(id); if (!s) return notFound();
    document.title = s.name + " · 국어의 모든 것";
    var html = '<main class="wrap narrow"><div class="crumbs"><a href="#/">홈</a><i>›</i>' + (s.school === "middle" ? "" : '<a href="#/school/high">고등학교</a><i>›</i>') + '<a href="#/school/' + s.school + '">' + (s.school === "middle" ? esc(schoolName(s.school)) : s.school === "common" ? "공통" : "선택") + "</a><i>›</i>" + esc(s.name) + "</div>" +
      '<h1 class="title">' + esc(s.name) + "</h1>" + (V89 ? "" : '<p class="sub">' + esc(s.kind) + " · " + esc(s.grade) + " — " + esc(s.desc) + "</p>");
    if (!s.count) html += '<div class="empty">이 과목의 학습 자료를 준비하고 있습니다.</div>';
    /* 영역이 여럿이면 탭으로 하나씩 (긴 스크롤 대신) */
    var areas = s.areas;
    if (areas.length > 1) {
      var cur = areas.filter(function (a) { return a.code === ac; })[0] || areas[0];
      html += '<nav class="area-tabs">' + areas.map(function (a) { return '<a href="#/subject/' + s.id + "/" + encodeURIComponent(a.code) + '"' + (a === cur ? ' class="on"' : "") + ">" + esc(a.name) + " <small>" + a.standards.length + "</small></a>"; }).join("") + "</nav>";
      areas = [cur];
    }
    areas.forEach(function (a) {
      html += '<section class="area">' + (s.areas.length > 1 ? "" : '<div class="area-head"><h2>' + esc(a.name) + "</h2></div>") +
        (a.intro && !V89 ? '<p class="area-intro">' + rich(a.intro) + "</p>" : "") +
        '<ul class="topics">' + a.standards.map(function (st) {
          return '<li><a class="topic" href="' + link(st.code) + '"><span><div class="t">' + esc(st.title) + '</div><div class="kw">' + esc(kw(st)) + "</div>" +
            (T() ? '<div class="std"><b>' + esc(st.code) + "</b>" + esc(st.text) + "</div>" : "") + "</span>" + (T() ? "" : pips(st.code)) + "</a></li>";
        }).join("") + "</ul></section>";
    });
    h(shell(s.school, html + "</main>"));
  }

  /* ───────── 학습 화면 ───────── */
  function viewLearn(code, tab) {
    var r = K.find(code); if (!r) return notFound();
    var st = r.std, s = r.subject, mid = isMiddle(s), d = doneOf(code), t = T();
    tab = tab || "concept";
    document.title = st.title + " · 국어의 모든 것";
    { progress.recent = [code].concat((progress.recent || []).filter(function (c) { return c !== code; })).slice(0, 8); saveProgress(); }
    var order = K.order(), i = order.indexOf(code);
    var prev = i > 0 && K.find(order[i - 1]).subject === s ? K.find(order[i - 1]) : null;
    var next = i < order.length - 1 && K.find(order[i + 1]).subject === s ? K.find(order[i + 1]) : null;
    var asg = [];

    var html = '<main class="wrap narrow"><div class="crumbs"><a href="#/">홈</a><i>›</i><a href="#/subject/' + s.id + '">' + esc(s.name) + "</a><i>›</i>" + esc(r.area.name) + "</div>";
    if (asg.length) html += '<div class="assign-banner">과제 <b>' + asg.map(function (x) { return '<a href="#/assignment/' + x.a.id + '">' + esc(x.a.title) + "</a>"; }).join(", ") + "</b>에 포함된 주제입니다. 단계 학습을 마치면 '완료'를 눌러 주세요.</div>";
    html += '<header class="lesson-head"><div class="area-tag">' + esc(s.name) + " · " + esc(r.area.name) + "</div><h1>" + esc(st.title) + "</h1>" +
      (V89 ? "" : '<div class="kw-list">' + (st.keywords || []).map(function (k) { return "<span>" + esc(k) + "</span>"; }).join("") + "</div>") + elemHtml(st);
    if (t) html += '<div class="std-box"><span class="lb">성취기준</span><b>' + esc(st.code) + "</b> " + esc(st.text) +
      (st.verified === false ? '<div class="warn">※ 공식 문서와 문장 대조가 필요합니다.</div>' : "") +
      (mid ? "" : '<details class="kq-src-box"><summary>기출 연결 근거</summary><div id="kq-src" class="small">불러오는 중…</div></details>') + "</div>" +
      '<div class="no-print" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px"><button class="btn sm dark" data-act="live-open">이 화면으로 수업 열기</button>' +
      '<a class="btn sm line" href="#/print/' + encodeURIComponent(code) + '">학습지 미리보기·인쇄</a><a class="btn sm line" href="#/res-new/' + encodeURIComponent(code) + '">활동 만들기</a><button class="btn sm line" data-act="reveal">답 모두 펼치기</button></div>';
    html += "</header>";

    html += '<nav class="steps"><button class="step' + (tab === "concept" ? " on" : "") + '" data-tab="concept">개념</button>' +
      LV.map(function (l) { return '<button class="step ' + l.sc + (tab === l.key ? " on" : "") + '" data-tab="' + l.key + '">' + l.name + (d[l.s] && !t ? '<span class="ck">✓</span>' : "") + "</button>"; }).join("") + "</nav>";

    /* 개념 */
    html += '<section class="pane" data-pane="concept"' + (tab === "concept" ? "" : ' hidden') + ">" +
      '<div class="panseo board"><div class="lb">오늘의 판서</div><h2>' + esc(st.title) + "</h2>" +
      ((st.concepts || []).length ? "<dl>" + st.concepts.map(function (c) { return "<dt>" + esc(c.term) + "</dt><dd>" + rich(c.desc) + srcMark(st, c.src) + "</dd>"; }).join("") + "</dl>" : "") + "</div>" +
      '<div class="prose">' + (st.explain || []).map(function (p) { return "<p>" + rich(p) + "</p>"; }).join("") + "</div>" +
      sourcesHtml(st) +
      '<div class="done-row"><span></span><button class="btn dark" data-tab="basic">기본 단계로 →</button></div></section>';

    LV.forEach(function (l, li) {
      var lv = (st.levels || {})[l.key] || {};
      html += '<section class="pane" data-pane="' + l.key + '"' + (tab === l.key ? "" : " hidden") + ">" +
        '<div class="goal ' + l.gc + '"><div class="lb">' + l.name + " — " + (mid ? l.ms : l.hs) + "</div><h3>" + esc(lv.goal || "") + "</h3>" +
        ((lv.points || []).length ? "<ul>" + lv.points.map(function (p) { return "<li>" + rich(p) + "</li>"; }).join("") + "</ul>" : "") + "</div>";
      html += mid ? renderBlocks(lv, code, l) : renderHigh(lv, code, l);
      html += '<div class="done-row">' + (t ? "<span></span>" : '<button class="btn' + (d[l.s] ? " line" : " dark") + '" data-done="' + l.s + '">' + (d[l.s] ? "✓ 완료함 (취소)" : l.name + " 단계 완료") + "</button>") +
        (li < 2 ? '<button class="btn text" data-tab="' + LV[li + 1].key + '">' + LV[li + 1].name + " 단계로 →</button>" : "<span></span>") + "</div></section>";
    });

    if (t && st.teacherNote) html += '<div class="tnote"><h4>지도 유의점</h4>' + rich(st.teacherNote) + "</div>";
    html += '<section id="res-box" class="no-print"></section>';
    html += '<nav class="pager">' + (prev ? '<a class="btn line" href="' + link(prev.std.code) + '"><span><small>이전</small>← ' + esc(prev.std.title) + "</span></a>" : "<span></span>") +
      (next ? '<a class="btn line" href="' + link(next.std.code) + '"><span><small>다음</small>' + esc(next.std.title) + " →</span></a>" : "<span></span>") + "</nav></main>";
    h(shell(s.school, html));
    bindLearn(r, tab);
    fillResources(code);
  }

  /* 근거 자료 표시 */
  function srcMark(st, i) {
    var s = (st.sources || [])[i];
    return s ? ' <a class="src-mark" href="' + esc(s.u) + '" target="_blank" rel="noopener" title="' + esc(s.t) + '">[' + (i + 1) + "]</a>" : "";
  }
  function sourcesHtml(st) {
    var S = st.sources || [];
    if (!S.length) return T() ? '<div class="sources warn-src">이 주제의 개념 설명은 아직 공식 자료와 대조 중입니다.</div>' : "";
    return '<details class="sources"><summary>근거 자료 <span class="muted small">' + S.length + "</span></summary><ol>" +
      S.map(function (s) { return '<li><a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + "</a>" + (s.k ? ' <span class="muted small">' + esc(s.k) + "</span>" : "") + "</li>"; }).join("") + "</ol>" + (st.checked ? '<p class="muted small">' + esc(st.checked) + " 대조</p>" : "") + "</details>";
  }

  /* 중학교: 사례·그림·영상 블록 */
  function ytId(u) { var m = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(u || ""); return m ? m[1] : null; }
  function cleanSvg(s) { return String(s || "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+\s*=\s*("[^"]*"|'[^']*')/gi, ""); }
  function mediaHtml(m) {
    if (!m) return "";
    var type = m.type || m.kind, cap = m.caption || m.note || "", src = m.source ? " — " + m.source : "", lic = m.license ? " (" + m.license + ")" : "";
    if (type === "video") {
      var id = ytId(m.url);
      return '<div class="media">' + (id ? '<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '" title="' + esc(m.title || "영상") + '" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>' : "") +
        '<div class="cap">' + (m.title ? "<b>" + esc(m.title) + "</b>" : "") + esc(src) + (cap ? "<br>" + rich(cap) : "") + ' <a href="' + esc(m.url) + '" target="_blank" rel="noopener">영상 열기 ↗</a></div></div>';
    }
    if (type === "image") return '<figure class="media" style="margin:0 0 10px"><img src="' + esc(m.src || m.url) + '" alt="' + esc(m.title || cap) + '" loading="lazy"><figcaption class="cap">' + rich(cap || m.title || "") + esc(src) + esc(lic) + "</figcaption></figure>";
    if (type === "svg") return '<figure class="media" style="margin:0 0 10px"><div class="svg">' + cleanSvg(m.svg) + "</div>" + (cap ? '<figcaption class="cap">' + rich(cap) + "</figcaption>" : "") + "</figure>";
    return "";
  }
  function renderBlocks(lv, code, l) {
    var blocks = lv.blocks;
    if (!blocks) { /* 이전 형식 자료: 문제는 빼고 과제만 */
      blocks = (lv.items || []).filter(function (it) { return it.kind === "task"; }).map(function (it) { return { kind: "activity", title: it.q, text: it.passage, steps: it.guide, output: "", sample: it.sample }; });
      if (!blocks.length) return '<div class="empty">이 단계의 사례 자료를 준비하고 있습니다.</div>';
    }
    var KN = { case: ["case", "사례"], video: ["video", "영상"], image: ["img", "그림"], svg: ["img", "그림"], note: ["note", "정리"], activity: ["act", "활동"] };
    return blocks.map(function (b, bi) {
      var key = code + "|" + l.key + "|" + bi, kn = KN[b.kind] || ["", "자료"];
      var out = '<div class="blk"><div class="blk-h"><span class="k ' + kn[0] + '">' + kn[1] + "</span>" + esc(b.title || "") + "</div>";
      if (b.kind === "video" || b.kind === "image" || b.kind === "svg") out += mediaHtml(b);
      if (b.media) out += mediaHtml(b.media);
      if (b.text) out += b.kind === "note" ? '<div class="prose"><p>' + rich(b.text) + "</p></div>" : '<div class="scene">' + rich(b.text) + "</div>";
      if (b.think && b.think.length) out += '<div class="think"><div class="lb">생각 열기</div><ol>' + b.think.map(function (q) { return "<li>" + rich(q) + "</li>"; }).join("") + "</ol>" +
        '<textarea class="input" data-draft="' + esc(key) + '" placeholder="떠오르는 생각을 자유롭게 적어 보세요."></textarea></div>';
      if (b.kind === "activity") {
        if (b.steps && b.steps.length) out += '<ol class="act-steps">' + b.steps.map(function (x) { return "<li>" + rich(x) + "</li>"; }).join("") + "</ol>";
        if (b.output) out += '<div class="act-meta">결과물: ' + rich(b.output) + "</div>";
        if (b.tip) out += '<div class="act-meta">도움말: ' + rich(b.tip) + "</div>";
        out += '<textarea class="input" style="margin-top:8px" data-draft="' + esc(key) + '" placeholder="활동 결과를 정리해 보세요."></textarea>';
        if (b.sample) out += '<div class="answer hidden"><b>참고 예시</b> <span class="muted small">(정답이 아니라 한 가지 예입니다)</span><br>' + rich(b.sample) + '</div><button class="btn sm line" style="margin-top:8px" data-reveal>참고 예시 보기</button>';
      }
      return out + "</div>";
    }).join("");
  }

  /* 고등학교: 기출 + 탐구 과제 */
  function renderHigh(lv, code, l) {
    var out = "";
    if (l.key === "extension") {
      var tasks = (lv.items || []).filter(function (it) { return it.kind === "task"; });
      if (tasks.length) out += '<h3 style="font-size:18px;margin:0 0 10px">탐구 과제</h3>' + tasks.map(function (it, k) {
        var key = code + "|extension|" + k;
        return '<div class="task">' + (it.passage ? '<div class="passage">' + rich(it.passage) + "</div>" : "") + '<div class="q">' + (k + 1) + ". " + rich(it.q) + "</div>" +
          (it.guide && it.guide.length ? '<div class="small"><b>평가 기준</b></div><ul class="guide">' + it.guide.map(function (g) { return "<li>" + rich(g) + "</li>"; }).join("") + "</ul>" : "") +
          '<textarea class="input" data-draft="' + esc(key) + '" placeholder="과제 수행 내용을 정리해 보세요."></textarea>' +
          (it.sample ? '<button class="btn sm line" style="margin-top:8px" data-reveal>참고 예시 답안 보기</button><div class="answer hidden"><b>참고 예시 답안</b> <span class="muted small">(정답이 아니라 한 가지 예입니다)</span><br>' + rich(it.sample) + "</div>" : "") + "</div>";
      }).join("");
    }
    out += '<h3 style="font-size:18px;margin:18px 0 10px">' + (l.key === "basic" ? "기출로 확인하기" : l.key === "advanced" ? "기출로 적용하기" : "도전 기출") + ' <small class="muted" style="font-weight:400;font-size:14px">평가원 수능·모의평가</small></h3>' +
      '<div class="kq-list" data-level="' + l.key + '"><div class="kq-empty">기출 문항을 불러오는 중…</div></div>';
    return out;
  }
  function kqSummary(it) {
    var s = progress.solved[it.key], ex = it.exam.replace("학년도 ", " ").replace("대학수학능력시험", "수능").replace("모의평가", "모평");
    return '<details class="kq" data-key="' + esc(it.key) + '"><summary><span class="src">' + esc(ex) + " " + it.no + "번</span>" +
      '<span class="st">' + esc(plain(it.stem).replace(/^\d+\.\s*/, "")) + '</span><span class="res' + (s ? (s.ok ? " o" : " x") : "") + '">' + (s ? (s.ok ? "맞힘" : "틀림") : "") + "</span></summary><div class=\"kq-body\"></div></details>";
  }
  function figImgs(f, alt) { return String(f).split(" ").map(function (x) { return '<img class="fig" src="' + esc(window.Kichul && Kichul.figBase ? Kichul.figBase() : "data/kichul/") + esc(x) + '" alt="' + esc(alt) + '" loading="lazy">'; }).join(""); }
  function kqBody(it) {
    var left = "", right = "";
    if (it.passage) {
      var ptxt = bankBr(it.passage.text, it.passage.brackets);
      /* 원본 문제지 그림이 있는 지문(그림·화면이 많은 지문): 그림을 먼저 보여 주고 글자로 바꿔 볼 수 있게 */
      left = it.passage.fig ?
        '<div class="pfig-bar"><span>원본 문제지 그림</span>' + (it.passage.text ? '<button type="button" class="btn sm line" data-pfig>글자로 보기</button>' : "") + "</div>" +
        '<div class="ptext pfig">' + figImgs(it.passage.fig, it.range + "번 지문") + "</div>" +
        (it.passage.text ? '<div class="ptext hidden" data-ptext>' + ptxt + "</div>" : "") :
        '<div class="ptext">' + ptxt + "</div>";
      left = "<div>" + left + "</div>";
    }
    right += '<p class="stem">' + bank(it.stem) + (it.score === 3 && !/3점/.test(it.stem) ? " [3점]" : "") + "</p>";
    if (it.fig && it.fig.m === "bogi") right += figImgs(it.fig.f, "보기");
    else if (it.bogi) { var m = /^<\s*([^<>]{1,12}?)\s*>\s*/.exec(plain(it.bogi)); right += '<div class="bogi">' + (m ? '<span class="bl">&lt; ' + esc(m[1]) + " &gt;</span>" + bankBr(it.bogi.slice(it.bogi.indexOf(">") + 1).replace(/^\s+/, ""), it.bogiBrackets) : bankBr(it.bogi, it.bogiBrackets)) + "</div>"; }
    if (it.fig && it.fig.m === "ch") right += figImgs(it.fig.f, "선택지");
    right += '<ul class="choices">';
    for (var n = 1; n <= 5; n++) right += '<li><button type="button" data-n="' + n + '"><span class="cn">' + CIRC[n] + "</span><span>" + bank(it.choices[n - 1] != null ? it.choices[n - 1] : "") + "</span></button></li>";
    right += '</ul><div class="verdict hidden"></div><div class="kq-tools"><button class="btn sm line" data-exp>해설 보기</button>' + '<button class="btn sm line tv-only" data-showans>정답 보기</button>' + '</div><div class="explain hidden"></div>';
    return { two: !!left, html: left ? left + "<div>" + right + "</div>" : right };
  }
  function fillKichul(r) {
    var lists = $app.querySelectorAll(".kq-list"); if (!lists.length) return;
    Kichul.load().then(function () {
      var sel = Kichul.select(r.std, r.subject, r.area);
      var srcBox = document.getElementById("kq-src");
      if (srcBox) {
        var src = Kichul.sources(r.std.code);
        srcBox.innerHTML = src.length ? "<b>기출 연결 근거(2015 성취기준)</b> — 후보 " + Kichul.candidates(r.std.code) + "문항 중 단계별로 골라 보여 줍니다.<br>" +
          src.map(function (s) { return esc(s.code) + " " + esc(s.text) + ' <span class="muted">(' + (s.exam ? s.n + "문항" : "수능 문항 대상 아님") + ")</span>"; }).join("<br>") +
          ' <a href="#/mapping">매핑 표 보기</a>' :
          "<b>기출 연결 근거</b> — 대응하는 2015 성취기준이 없어 기출을 연결하지 않았습니다. <a href=\"#/mapping\">매핑 표 보기</a>";
      }
      lists.forEach(function (box) {
        var keys = sel[box.dataset.level] || [];
        box.innerHTML = keys.length ? keys.map(function (k) { return kqSummary(Kichul.item(k)); }).join("") :
          '<div class="kq-empty">' + (box.dataset.level === "extension" ? "이 주제에 더 연결된 기출이 없습니다. 탐구 과제에 집중해 보세요." : "이 주제(2022 개정)에 맞는 평가원 기출이 아직 없습니다. 개념과 탐구 과제로 공부해 보세요.") + "</div>";
      });
      $app.querySelectorAll(".kq").forEach(function (d) {
        d.addEventListener("toggle", function () { if (d.open) openKq(d); });
      });
    }).catch(function (e) { lists.forEach(function (b) { b.innerHTML = '<div class="kq-empty">기출 자료를 불러오지 못했습니다: ' + esc(e.message) + "</div>"; }); });
  }
  function openKq(d) {
    var b = d.querySelector(".kq-body"); if (b.innerHTML) return;
    var it = Kichul.item(d.dataset.key), r = kqBody(it);
    b.className = "kq-body" + (r.two ? " two" : ""); b.innerHTML = r.html;
    var prev = progress.solved[it.key];
    function grade(n, silent) {
      if (!silent && window.Live && Live.locked()) {   /* 수업 중 '정답 잠금': 고른 것만 표시, 공개되면 채점 */
        d._sel = n;
        b.querySelectorAll(".choices button").forEach(function (x) { x.classList.remove("o", "x", "ans"); x.classList.toggle("sel", Number(x.dataset.n) === n); });
        var v0 = b.querySelector(".verdict"); v0.className = "verdict"; v0.textContent = CIRC[n] + "을(를) 골랐습니다. 선생님이 정답을 공개하면 채점됩니다.";
        return;
      }
      d._sel = null;
      var ok = n === it.answer;
      b.querySelectorAll(".choices button").forEach(function (x) {
        var k = Number(x.dataset.n); x.classList.remove("o", "x", "ans");
        if (k === n) x.classList.add(ok ? "o" : "x"); if (k === it.answer) x.classList.add("ans");
      });
      var v = b.querySelector(".verdict"); v.className = "verdict " + (ok ? "o" : "x");
      v.textContent = ok ? "정답입니다. (" + CIRC[it.answer] + ")" : "아쉬워요. 정답은 " + CIRC[it.answer] + "입니다. 해설을 확인해 보세요.";
      if (!silent && !T()) {
        progress.solved[it.key] = { ok: ok, n: n, t: Date.now() }; saveProgress();
        var res = d.querySelector("summary .res"); res.className = "res " + (ok ? "o" : "x"); res.textContent = ok ? "맞힘" : "틀림";
      }
    }
    d._grade = function () { if (d._sel) grade(d._sel); };
    if (prev) grade(prev.n, true);
    b.querySelectorAll(".choices button").forEach(function (x) { x.onclick = function () { grade(Number(x.dataset.n)); }; });
    var sa = b.querySelector("[data-showans]"); if (sa) sa.onclick = function () { grade(it.answer, true); };
    var pt = b.querySelector("[data-pfig]");
    if (pt) pt.onclick = function () {
      var fig = b.querySelector(".pfig"), txt = b.querySelector("[data-ptext]"), toText = txt.classList.contains("hidden");
      txt.classList.toggle("hidden", !toText); fig.classList.toggle("hidden", toText);
      pt.textContent = toText ? "원본 그림으로 보기" : "글자로 보기";
      b.querySelector(".pfig-bar span").textContent = toText ? "글자로 보는 중 (그림은 빠져 있음)" : "원본 문제지 그림";
    };
    b.querySelector("[data-exp]").onclick = function () {
      var ex = b.querySelector(".explain");
      if (!ex.classList.contains("hidden")) { ex.classList.add("hidden"); return; }
      ex.classList.remove("hidden"); ex.textContent = "해설을 불러오는 중…";
      Kichul.loadExplain().then(function (E) { ex.innerHTML = E[it.key] ? bank(E[it.key]) + '<div class="muted small" style="margin-top:6px">해설 출처: 문제은행 수록 「정답 및 해설」 원자료</div>' : "이 문항은 해설이 아직 없습니다. 정답: " + CIRC[it.answer]; });
    };
  }

  function bindLearn(r, tab) {
    var code = r.std.code;
    function show(t) {
      $app.querySelectorAll("[data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== t; });
      $app.querySelectorAll(".steps .step").forEach(function (b) { b.classList.toggle("on", b.dataset.tab === t); });
      history.replaceState(null, "", link(code, t === "concept" ? "" : t));
      var st = $app.querySelector(".steps"); if (st.getBoundingClientRect().top < 0) st.scrollIntoView({ behavior: "smooth" });
    }
    $app.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { show(b.dataset.tab); }; });
    $app.querySelectorAll("[data-draft]").forEach(function (ta) { ta.value = getDraft(ta.dataset.draft); ta.oninput = function () { setDraft(ta.dataset.draft, ta.value); }; });
    $app.querySelectorAll("[data-reveal]").forEach(function (b) { b.onclick = function () { var a = b.parentNode.querySelector(".answer"); a.classList.toggle("hidden"); }; });
    $app.querySelectorAll("[data-done]").forEach(function (b) {
      b.onclick = function () {
        var dd = progress.done[code] = progress.done[code] || {}, k = b.dataset.done;
        dd[k] = dd[k] ? 0 : 1; saveProgress(); syncAssign(code, k, dd[k]);
        toast(dd[k] ? "완료로 표시했습니다." : "완료 표시를 취소했습니다.");
        viewLearn(code, (location.hash.split("/")[3]) || "concept");
      };
    });
    var act = function (n, f) { var b = $app.querySelector('[data-act="' + n + '"]'); if (b) b.onclick = f; };
    act("reveal", function () {
      $app.querySelectorAll(".answer").forEach(function (x) { x.classList.remove("hidden"); });
      $app.querySelectorAll(".kq").forEach(function (d) { d.open = true; openKq(d); var s = d.querySelector("[data-showans]"); if (s) s.click(); });
    });
    function doPrint(ans) {
      $app.querySelectorAll(".kq").forEach(function (d) { openKq(d); d.open = true; });
      document.body.classList.add("print-all"); if (ans) document.body.classList.add("print-answers");
      setTimeout(function () { window.print(); document.body.classList.remove("print-all", "print-answers"); }, 300);
    }
    act("print", function () { doPrint(false); });
    act("print-ans", function () { doPrint(true); });
    if (!isMiddle(r.subject)) fillKichul(r);
  }

  /* 수업 코드: 교사가 '정답 공개'를 누르면 학생 화면에서도 답을 펼친다 (js/live.js) */
  window.KmeApp = {
    revealAll: function () {
      $app.querySelectorAll(".answer").forEach(function (x) { x.classList.remove("hidden"); });
      $app.querySelectorAll(".kq").forEach(function (d) { d.open = true; openKq(d); if (d._sel) return; var v = d.querySelector(".verdict"); if (v && /(^| )(o|x)( |$)/.test(v.className)) return; var s = d.querySelector("[data-showans]"); if (s) s.click(); });
    }
  };

  /* ───────── 검색 ───────── */
  function viewSearch(q) {
    q = (q || "").trim(); document.title = "찾기: " + q;
    var ql = q.toLowerCase().replace(/[\[\]\s]/g, "");
    var res = !ql ? [] : K.all().filter(function (r) {
      var st = r.std, hay = [st.title, (st.keywords || []).join(" "), (st.concepts || []).map(function (c) { return c.term; }).join(" "), r.area.name];
      if (T()) hay.push(st.code, st.text);
      return hay.join(" ").toLowerCase().replace(/[\[\]\s]/g, "").indexOf(ql) >= 0;
    });
    var html = '<main class="wrap narrow"><div class="crumbs"><a href="#/">홈</a><i>›</i>찾기</div><h1 class="title">“' + esc(q) + '”</h1><p class="sub">' + res.length + "개의 학습 주제</p>" +
      (res.length ? '<ul class="topics">' + res.map(function (r) {
        return '<li><a class="topic" href="' + link(r.std.code) + '"><span><div class="t">' + esc(r.std.title) + '</div><div class="kw">' + esc(r.subject.name + " · " + r.area.name + " — " + kw(r.std)) + "</div>" +
          (T() ? '<div class="std"><b>' + esc(r.std.code) + "</b>" + esc(r.std.text) + "</div>" : "") + "</span>" + (T() ? "" : pips(r.std.code)) + "</a></li>";
      }).join("") + "</ul>" : '<div class="empty">찾는 내용이 없습니다. 다른 낱말로 찾아보세요.</div>') + "</main>";
    h(shell("", html));
  }

  /* ───────── 학생: 내 학습 ───────── */
  function viewMy() {
    document.title = "내 학습";
    var lv = { b: 0, a: 0, e: 0 }, full = 0, ok = 0, tried = 0;
    K.all().forEach(function (r) { var d = doneOf(r.std.code); if (d.b) lv.b++; if (d.a) lv.a++; if (d.e) lv.e++; if (d.b && d.a && d.e) full++; });
    Object.keys(progress.solved || {}).forEach(function (k) { tried++; if (progress.solved[k].ok) ok++; });
    var html = '<main class="wrap"><h1 class="title">내 학습</h1><p class="sub">단계별로 완료한 주제와 기출 풀이 기록입니다.</p><div class="grid g4">' +
      '<div class="stat"><div class="v">' + full + '</div><div class="l">세 단계 모두 마친 주제</div></div>' +
      '<div class="stat"><div class="v" style="color:var(--basic)">' + lv.b + " · " + '<span style="color:var(--adv)">' + lv.a + "</span> · " + '<span style="color:var(--ext)">' + lv.e + '</span></div><div class="l">기본 · 심화 · 발전 완료</div></div>' +
      '<div class="stat"><div class="v">' + tried + '</div><div class="l">풀어 본 기출</div></div>' +
      '<div class="stat"><div class="v">' + (tried ? Math.round(ok / tried * 100) : 0) + '%</div><div class="l">기출 정답률</div></div></div>' +
      '<h2 class="h2">과목별 진도</h2><div class="scroll"><table class="tbl"><thead><tr><th>과목</th><th>구분</th><th class="n">주제</th><th style="width:40%">진도</th></tr></thead><tbody>' +
      K.SUBJECTS.filter(function (s) { return s.count; }).map(function (s) {
        var p = subjPct(s);
        return '<tr><td><a href="#/subject/' + s.id + '"><b>' + esc(s.name) + "</b></a></td><td>" + esc(s.kind) + '</td><td class="n">' + s.count + '</td><td><div style="display:flex;gap:10px;align-items:center"><div class="bar" style="flex:1;margin:0"><i style="width:' + p + '%"></i></div><span class="small">' + p + "%</span></div></td></tr>";
      }).join("") + "</tbody></table></div></main>";
    h(shell("my", html));
  }

  /* ───────── 학급·과제 공통 ───────── */
  function classCode() { var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = ""; for (var i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
  function classCard(c) {
    return '<a class="cls-card" href="#/class/' + c.id + '"><div class="top board"><h3>' + esc(c.name) + '</h3><div class="m">' + esc(c.year || "") + " · 참여 코드 " + esc(c.code) + '</div></div><div class="bot"><span>' + esc(c.note || "") + "</span><span>열기 →</span></div></a>";
  }
  /* 과제 항목: { code, level: "basic"|"advanced"|"extension" } 또는 공유 활동 { code, level: "res:<id>", res, title } */
  function isResItem(it) { return /^res:/.test(it.level || ""); }
  function itemHref(it) { return isResItem(it) ? "#/res/" + it.res : link(it.code, it.level); }
  function itemLabel(it) {
    var r = K.find(it.code), l = LVBY[it.level];
    if (isResItem(it)) return '<span class="chip">활동</span> ' + esc(it.title || "공유 활동") + (r ? ' <span class="muted small">' + esc(r.std.title) + "</span>" : "");
    return '<span class="chip ' + (l ? l.cls : "") + '">' + (l ? l.name : "") + "</span> " + (r ? esc(r.std.title) : esc(it.code)) + (r ? ' <span class="muted small">' + esc(r.subject.name) + "</span>" : "");
  }
  function subProgress(a, sub) {
    var items = a.items || [], n = 0;
    items.forEach(function (it) { if (sub && sub.done && sub.done[it.code + "|" + it.level]) n++; });
    return { n: n, total: items.length };
  }
  function statusHtml(a, sub) {
    if (sub && sub.status === "submitted") return '<span class="st-ok">제출함' + (sub.checked ? " · 확인됨" : "") + "</span>";
    var p = subProgress(a, sub);
    return p.n ? '<span class="st-mid">진행 중 ' + p.n + "/" + p.total + "</span>" : '<span class="st-no">시작 전</span>';
  }

  /* 학생: 내가 속한 학급의 과제 */
  function loadMyAssign() {
    var u = user(); if (!u || T()) { myAssign = []; return Promise.resolve(); }
    return DB.where("members", "uid", u.uid).then(function (ms) {
      return Promise.all(ms.map(function (m) {
        return Promise.all([DB.get("classes", m.classId), DB.where("assignments", "classId", m.classId)]).then(function (x) {
          return Promise.all(x[1].map(function (a) { return DB.get("submissions", a.id + "_" + u.uid).then(function (sub) { return { a: a, cls: x[0], sub: sub }; }); }));
        });
      }));
    }).then(function (arr) {
      myAssign = [].concat.apply([], arr).filter(function (x) { return x.cls; });
      myAssign.sort(function (p, q) { return (p.a.due || "9999") < (q.a.due || "9999") ? -1 : 1; });
    }).catch(function (e) { console.error(e); myAssign = []; });
  }
  function syncAssign(code, lvS, on) {
    var u = user(), lvKey = /^res:/.test(lvS) ? lvS : LVBY[lvS].key;
    myAssign.forEach(function (x) {
      if (!(x.a.items || []).some(function (it) { return it.code === code && it.level === lvKey; })) return;
      if (x.sub && x.sub.status === "submitted") return;
      var sub = x.sub || { assignmentId: x.a.id, classId: x.a.classId, teacherUid: x.a.teacherUid, uid: u.uid, name: u.name, done: {}, answers: {}, status: "doing" };
      sub.done = sub.done || {}; sub.done[code + "|" + lvKey] = on ? 1 : 0; sub.updatedAt = Date.now();
      x.sub = sub;
      DB.set("submissions", x.a.id + "_" + u.uid, stripId(sub));
    });
  }
  function stripId(o) { var c = {}; Object.keys(o).forEach(function (k) { if (k !== "id") c[k] = o[k]; }); return c; }
  function assignTable(list) {
    return '<div class="scroll"><table class="tbl"><thead><tr><th>과제</th><th>학급</th><th>마감</th><th>상태</th></tr></thead><tbody>' + list.map(function (x) {
      return '<tr><td><a href="#/assignment/' + x.a.id + '"><b>' + esc(x.a.title) + "</b></a></td><td>" + esc(x.cls.name) + "</td><td>" + esc(dueText(x.a.due)) + "</td><td>" + statusHtml(x.a, x.sub) + "</td></tr>";
    }).join("") + "</tbody></table></div>";
  }

  function viewMyClass() {
    document.title = "내 학급";
    h(shell("myclass", '<main class="wrap"><h1 class="title">내 학급</h1><p class="sub">선생님께 받은 참여 코드로 학급에 들어가면 과제를 받을 수 있습니다.</p>' +
      '<form class="box pad" id="join" style="max-width:480px;display:flex;gap:8px;align-items:flex-end"><label class="field" style="flex:1;margin:0"><span>참여 코드</span><input class="input" name="code" maxlength="6" placeholder="예: K7M2QP" style="text-transform:uppercase;letter-spacing:3px"></label><button class="btn dark">들어가기</button></form><div class="msg" id="jmsg"></div>' +
      '<div id="mc"><div class="loading">불러오는 중…</div></div></main>'));
    var f = document.getElementById("join"), msg = document.getElementById("jmsg");
    f.onsubmit = function (ev) {
      ev.preventDefault(); var code = String(new FormData(f).get("code") || "").trim().toUpperCase();
      if (code.length !== 6) { msg.className = "msg err"; msg.textContent = "참여 코드 6자리를 입력하세요."; return; }
      DB.where("classes", "code", code).then(function (cs) {
        if (!cs.length) throw new Error("코드에 맞는 학급이 없습니다.");
        var c = cs[0], u = user();
        return DB.set("members", c.id + "_" + u.uid, { classId: c.id, uid: u.uid, name: u.name, email: u.email, joinedAt: Date.now() }).then(function () { return c; });
      }).then(function (c) { toast(c.name + "에 들어갔습니다."); return loadMyAssign(); }).then(viewMyClass)
        .catch(function (e) { msg.className = "msg err"; msg.textContent = e.message; });
    };
    var u = user();
    Promise.all([DB.where("members", "uid", u.uid), loadMyAssign()]).then(function (x) {
      return Promise.all(x[0].map(function (m) { return DB.get("classes", m.classId); }));
    }).then(function (cls) {
      cls = cls.filter(Boolean);
      var box = document.getElementById("mc"); if (!box) return;
      if (!cls.length) { box.innerHTML = '<div class="empty" style="margin-top:20px">아직 들어간 학급이 없습니다.</div>'; return; }
      Promise.all(cls.map(function (c) { return DB.where("notices", "classId", c.id); })).then(function (ns) {
        box.innerHTML = cls.map(function (c, i) {
          var notes = ns[i].sort(function (a, b) { return b.createdAt - a.createdAt; }).slice(0, 3);
          var as = myAssign.filter(function (x) { return x.a.classId === c.id; });
          return '<h2 class="h2">' + esc(c.name) + " <small>" + esc(c.teacherName || "") + " 선생님</small></h2>" +
            (notes.length ? '<div class="box pad" style="margin-bottom:12px"><b class="small">알림</b>' + notes.map(function (n) { return '<p style="margin:6px 0 0">' + rich(n.text) + ' <span class="muted small">' + fmtDate(n.createdAt) + "</span></p>"; }).join("") + "</div>" : "") +
            (as.length ? assignTable(as) : '<div class="empty">받은 과제가 없습니다.</div>');
        }).join("");
      });
    });
  }

  /* 과제 상세 (학생·교사) */
  function viewAssignment(id) {
    document.title = "과제";
    h(shell(T() ? "classes" : "myclass", '<main class="wrap narrow"><div class="loading">불러오는 중…</div></main>'));
    DB.get("assignments", id).then(function (a) {
      if (!a) return notFound();
      return DB.get("classes", a.classId).then(function (c) { return T() ? teacherAssignment(a, c) : studentAssignment(a, c); });
    });
  }
  function studentAssignment(a, c) {
    var u = user();
    DB.get("submissions", a.id + "_" + u.uid).then(function (sub) {
      var submitted = sub && sub.status === "submitted";
      var html = '<main class="wrap narrow"><div class="crumbs"><a href="#/myclass">내 학급</a><i>›</i>' + esc(c ? c.name : "") + '</div><h1 class="title">' + esc(a.title) + "</h1>" +
        '<p class="sub">마감 ' + esc(dueText(a.due)) + " · " + statusHtml(a, sub) + "</p>" + (a.desc ? '<div class="box pad" style="margin-bottom:18px">' + rich(a.desc) + "</div>" : "") +
        '<h2 class="h2" style="margin-top:20px">할 일</h2><ul class="topics">' + (a.items || []).map(function (it) {
          var dn = sub && sub.done && sub.done[it.code + "|" + it.level];
          return '<li><a class="topic" href="' + itemHref(it) + '"><span>' + itemLabel(it) + "</span><span>" + (dn ? '<span class="st-ok">완료</span>' : '<span class="st-no">하러 가기 →</span>') + "</span></a></li>";
        }).join("") + "</ul>";
      if (sub && sub.scores) {
        var sk = Object.keys(sub.scores).filter(function (k) { return Object.keys(sub.scores[k] || {}).length; });
        if (sk.length) html += '<div class="tnote"><h4>서·논술형 점수</h4>' + sk.map(function (k) {
          var it = (a.items || []).filter(function (x) { return x.res === k; })[0] || {}, m = sub.scores[k], t = 0;
          Object.keys(m).forEach(function (i) { t += Number(m[i]); });
          return "<div><b>" + esc(it.title || "서·논술형") + "</b> — " + t + '점 <a class="small" href="#/res/' + esc(k) + '">채점 기준·예시 답안 보기</a></div>';
        }).join("") + "</div>";
      }
      if (sub && sub.feedback) html += '<div class="tnote"><h4>선생님 피드백</h4>' + rich(sub.feedback) + "</div>";
      html += '<div class="done-row"><span class="small muted">각 주제에서 단계를 마치고 \'완료\'를 누르면 여기에 표시됩니다. 적어 둔 생각·활동 결과도 함께 제출됩니다.</span>' +
        (submitted ? '<button class="btn line" data-unsubmit>제출 취소</button>' : '<button class="btn dark" data-submit>과제 제출</button>') + "</div></main>";
      h(shell("myclass", html));
      var sb = $app.querySelector("[data-submit]");
      if (sb) sb.onclick = function () {
        var answers = {}, done = {};
        (a.items || []).forEach(function (it) {
          if (isResItem(it)) {
            if (progress.done[it.level]) done[it.code + "|" + it.level] = 1;
            for (var j = 0; j < 30; j++) { var rk = "res|" + it.res + "|" + j, rv = getDraft(rk); if (rv.trim()) answers[rk.replace(/[.\/\[\]|]/g, "_")] = { k: rk, v: rv, q: (it.title || "공유 활동") + " — 질문 " + (j + 1) }; }
            return;
          }
          var d = doneOf(it.code), l = LVBY[it.level]; if (l && d[l.s]) done[it.code + "|" + it.level] = 1;
          for (var i = 0; i < 30; i++) { var k = it.code + "|" + it.level + "|" + i, v = getDraft(k); if (v.trim()) answers[k.replace(/[.\/\[\]]/g, "_")] = { k: k, v: v }; }
        });
        var p = subProgress(a, { done: done });
        if (p.n < p.total && !confirm("아직 완료하지 않은 단계가 있습니다(" + p.n + "/" + p.total + "). 그래도 제출할까요?")) return;
        var data = Object.assign(sub ? stripId(sub) : {}, { assignmentId: a.id, classId: a.classId, teacherUid: a.teacherUid, uid: u.uid, name: u.name, done: done, answers: answers, status: "submitted", submittedAt: Date.now() });
        DB.set("submissions", a.id + "_" + u.uid, data).then(function () { toast("제출했습니다."); return loadMyAssign(); }).then(function () { studentAssignment(a, c); });
      };
      var ub = $app.querySelector("[data-unsubmit]");
      if (ub) ub.onclick = function () { DB.update("submissions", a.id + "_" + u.uid, { status: "doing" }).then(function () { return loadMyAssign(); }).then(function () { studentAssignment(a, c); }); };
    });
  }
  function answerQuestion(k) {
    var p = k.split("|"), r = K.find(p[0]); if (!r) return k;
    var lv = (r.std.levels || {})[p[1]] || {}, i = Number(p[2]);
    var b = (lv.blocks || [])[i] || ((lv.items || []).filter(function (x) { return x.kind === "task"; })[i]) || {};
    return r.std.title + " · " + (LVBY[p[1]] || {}).name + " — " + (b.title || b.q || "");
  }
  function teacherAssignment(a, c) {
    Promise.all([DB.where("members", "classId", a.classId), DB.where("submissions", "assignmentId", a.id, "teacherUid", user().uid)]).then(function (x) {
      var subs = {}; x[1].forEach(function (s) { subs[s.uid] = s; });
      var members = x[0].sort(function (p, q) { return (p.number || 999) - (q.number || 999) || (p.name < q.name ? -1 : 1); });
      var nSub = members.filter(function (m) { return subs[m.uid] && subs[m.uid].status === "submitted"; }).length;
      var html = '<main class="wrap"><div class="crumbs"><a href="#/classes">학급 관리</a><i>›</i><a href="#/class/' + c.id + '">' + esc(c.name) + "</a><i>›</i>과제</div>" +
        '<h1 class="title">' + esc(a.title) + '</h1><p class="sub">마감 ' + esc(dueText(a.due)) + " · 제출 " + nSub + "/" + members.length + "명</p>" +
        (a.desc ? '<div class="box pad" style="margin-bottom:14px">' + rich(a.desc) + "</div>" : "") +
        '<div class="chips" style="margin-bottom:8px">' + (a.items || []).map(function (it) {
          if (isResItem(it)) return '<a class="chip" href="' + itemHref(it) + '">활동 · ' + esc(it.title || "") + "</a>";
          return '<a class="chip ' + LVBY[it.level].cls + '" href="' + link(it.code, it.level) + '">' + LVBY[it.level].name + " · " + esc((K.find(it.code) || { std: { title: it.code } }).std.title) + "</a>"; }).join("") + "</div>" +
        '<h2 class="h2">학생별 현황</h2><div class="scroll"><table class="tbl"><thead><tr><th class="n">번호</th><th>이름</th><th>상태</th>' +
        (a.items || []).map(function (it, i) { return '<th class="c" title="' + esc((K.find(it.code) || { std: { title: "" } }).std.title) + '">' + (i + 1) + "</th>"; }).join("") + "<th>제출일</th><th></th></tr></thead><tbody>" +
        members.map(function (m) {
          var s = subs[m.uid];
          return '<tr><td class="n">' + esc(m.number || "") + "</td><td>" + esc(m.name) + "</td><td>" + statusHtml(a, s) + "</td>" +
            (a.items || []).map(function (it) { var dn = s && s.done && s.done[it.code + "|" + it.level]; return '<td class="c">' + (dn ? '<span class="st-ok">●</span>' : '<span class="st-no">·</span>') + "</td>"; }).join("") +
            "<td>" + (s && s.submittedAt && s.status === "submitted" ? fmtDate(s.submittedAt) : "") + "</td><td>" + (s ? '<button class="btn sm line" data-open="' + esc(m.uid) + '">보기</button>' : "") + "</td></tr>";
        }).join("") + "</tbody></table></div>" + (members.length ? "" : '<div class="empty">학급에 학생이 없습니다.</div>') +
        '<div id="subview"></div><div class="done-row"><button class="btn danger sm" data-del>과제 삭제</button><span></span></div></main>';
      h(shell("classes", html));
      $app.querySelectorAll("[data-open]").forEach(function (b) {
        b.onclick = function () {
          var s = subs[b.dataset.open], box = document.getElementById("subview");
          var ans = Object.keys(s.answers || {}).map(function (k) { return s.answers[k]; });
          /* 서·논술형 문항은 채점 기준표로 채점 */
          var essayIds = (a.items || []).filter(isResItem).map(function (it) { return it.res; });
          Promise.all(essayIds.map(function (eid) { return DB.get("resources", eid); })).then(function (rs) {
            var essays = {}; rs.forEach(function (r) { if (r && r.kind === "essay") essays[r.id] = r; });
            var scores = s.scores || {};
            box.innerHTML = '<h2 class="h2">' + esc(s.name) + " 학생의 기록</h2>" +
              (ans.length ? ans.map(function (x) {
                var eid = (/^res\|([^|]+)\|/.exec(x.k) || [])[1], e = eid && essays[eid];
                if (!e) return '<div class="task"><div class="small muted">' + esc(x.q || answerQuestion(x.k)) + "</div><div>" + rich(x.v) + "</div></div>";
                var sc = scores[eid] || {}, cnt = charCount(x.v);
                return '<div class="task essay-grade" data-eid="' + esc(eid) + '"><div class="small muted">서·논술형 — ' + esc(e.title) + "</div>" +
                  '<div class="essay-ans">' + rich(x.v) + '</div><div class="small muted">공백 포함 ' + cnt.all + "자 · 공백 제외 " + cnt.nosp + "자" + lenNote(e, cnt) + "</div>" +
                  '<table class="tbl rubric" style="margin-top:8px"><thead><tr><th>채점 항목</th><th>채점 내용</th><th class="n">점수</th></tr></thead><tbody>' +
                  (e.rubric || []).map(function (rb, i) {
                    var opts = ""; for (var v = rb.max; v >= 0; v--) opts += '<option value="' + v + '"' + (Number(sc[i]) === v ? " selected" : "") + ">" + v + "</option>";
                    return "<tr><td><b>" + esc(rb.name) + "</b></td><td>" + rich(rb.desc) + '</td><td class="n"><select class="input" style="width:70px;padding:3px" data-ri="' + i + '"><option value="">-</option>' + opts + "</select> / " + rb.max + "</td></tr>";
                  }).join("") + '<tr><td colspan="2"><b>합계</b></td><td class="n"><b data-total>-</b> / ' + rubricMax(e) + "</td></tr></tbody></table></div>";
              }).join("") : '<div class="empty">적어 낸 글이 없습니다.</div>') +
              '<label class="field" style="margin-top:14px"><span>피드백</span><textarea class="input" id="fb">' + esc(s.feedback || "") + "</textarea></label>" +
              '<div style="display:flex;gap:8px"><button class="btn dark" id="fbsave">' + (Object.keys(essays).length ? "점수·피드백 저장" : "피드백 저장 · 확인 표시") + "</button>" + (s.status === "submitted" ? '<button class="btn line" id="fbreturn">다시 하도록 돌려주기</button>' : "") + "</div>";
            box.scrollIntoView({ behavior: "smooth" });
            function totals() {
              box.querySelectorAll(".essay-grade").forEach(function (g) {
                var t = 0, any = false; g.querySelectorAll("[data-ri]").forEach(function (sel) { if (sel.value !== "") { any = true; t += Number(sel.value); } });
                g.querySelector("[data-total]").textContent = any ? t : "-";
              });
            }
            box.querySelectorAll("[data-ri]").forEach(function (sel) { sel.onchange = totals; }); totals();
            document.getElementById("fbsave").onclick = function () {
              var part = { feedback: document.getElementById("fb").value, checked: true };
              var grades = box.querySelectorAll(".essay-grade");
              if (grades.length) {
                var sc2 = JSON.parse(JSON.stringify(scores));
                grades.forEach(function (g) { var m = {}; g.querySelectorAll("[data-ri]").forEach(function (sel) { if (sel.value !== "") m[sel.dataset.ri] = Number(sel.value); }); sc2[g.dataset.eid] = m; });
                part.scores = sc2;
              }
              DB.update("submissions", s.id, part).then(function () { toast("저장했습니다."); teacherAssignment(a, c); });
            };
            var rt = document.getElementById("fbreturn");
            if (rt) rt.onclick = function () { DB.update("submissions", s.id, { feedback: document.getElementById("fb").value, status: "doing", checked: false }).then(function () { toast("학생에게 돌려주었습니다."); teacherAssignment(a, c); }); };
          });
        };
      });
      $app.querySelector("[data-del]").onclick = function () {
        if (!confirm("이 과제를 삭제할까요? 학생 제출 기록도 함께 지워집니다.")) return;
        Promise.all(x[1].map(function (s) { return DB.remove("submissions", s.id); })).then(function () { return DB.remove("assignments", a.id); })
          .then(function () { toast("삭제했습니다."); location.hash = "#/class/" + c.id; });
      };
    });
  }

  /* 교사: 학급 목록 */
  function viewClasses() {
    if (!T()) return notFound();
    document.title = "학급 관리";
    h(shell("classes", '<main class="wrap"><h1 class="title">학급 관리</h1><p class="sub">학급을 만들고 참여 코드를 학생에게 알려 주세요. 학생이 코드로 들어오면 명단이 채워집니다.</p>' +
      '<div id="cls"><div class="loading">불러오는 중…</div></div>' +
      '<h2 class="h2">새 학급 만들기</h2><form class="box pad" id="newc" style="max-width:560px"><div class="grid g2"><label class="field"><span>학급 이름</span><input class="input" name="name" placeholder="예: 2학년 3반 국어" required></label>' +
      '<label class="field"><span>학년도</span><input class="input" name="year" value="' + new Date().getFullYear() + '학년도"></label></div>' +
      '<label class="field"><span>메모 (선택)</span><input class="input" name="note" placeholder="예: 화·목 3교시"></label><button class="btn dark">만들기</button></form></main>'));
    var u = user();
    DB.where("classes", "teacherUid", u.uid).then(function (cls) {
      var box = document.getElementById("cls");
      box.innerHTML = cls.length ? '<div class="grid g3">' + cls.sort(function (a, b) { return b.createdAt - a.createdAt; }).map(classCard).join("") + "</div>" : '<div class="empty">아직 만든 학급이 없습니다.</div>';
    });
    var f = document.getElementById("newc");
    f.onsubmit = function (ev) {
      ev.preventDefault(); var fd = new FormData(f), id = "c" + uid();
      DB.set("classes", id, { name: String(fd.get("name")).trim(), year: fd.get("year"), note: fd.get("note"), code: classCode(), teacherUid: u.uid, teacherName: u.name, createdAt: Date.now() })
        .then(function () { toast("학급을 만들었습니다."); location.hash = "#/class/" + id; });
    };
  }

  /* 교사: 학급 상세 */
  function viewClass(id, tab) {
    if (!T()) return notFound();
    tab = tab || "assign";
    Promise.all([DB.get("classes", id), DB.where("members", "classId", id), DB.where("assignments", "classId", id), DB.where("notices", "classId", id)]).then(function (x) {
      var c = x[0]; if (!c || c.teacherUid !== user().uid) return notFound();
      var members = x[1].sort(function (p, q) { return (Number(p.number) || 999) - (Number(q.number) || 999) || (p.name < q.name ? -1 : 1); });
      var asg = x[2].sort(function (p, q) { return q.createdAt - p.createdAt; }), notes = x[3].sort(function (p, q) { return q.createdAt - p.createdAt; });
      document.title = c.name;
      var tabs = [["assign", "과제 " + asg.length], ["members", "학생 명단 " + members.length], ["status", "학습 현황"], ["notice", "알림장"], ["settings", "설정"]];
      var html = '<main class="wrap"><div class="crumbs"><a href="#/classes">학급 관리</a><i>›</i>' + esc(c.name) + "</div>" +
        '<section class="today board" style="margin-bottom:0"><div class="today-top"><div><h1>' + esc(c.name) + '</h1><div class="date" style="text-align:left">' + esc(c.year || "") + (c.note ? " · " + esc(c.note) : "") + "</div></div>" +
        '<div style="text-align:right"><div class="date">참여 코드</div><div class="code-big">' + esc(c.code) + "</div></div></div></section>" +
        '<nav class="steps" style="margin-top:22px">' + tabs.map(function (t) { return '<a class="step' + (tab === t[0] ? " on" : "") + '" href="#/class/' + id + "/" + t[0] + '">' + t[1] + "</a>"; }).join("") + '</nav><div class="pane">';

      if (tab === "assign") {
        html += '<div style="margin-bottom:14px"><a class="btn dark" href="#/classes/new-assignment/?class=' + id + '">+ 새 과제 내기</a></div>';
        html += asg.length ? '<div class="scroll"><table class="tbl"><thead><tr><th>과제</th><th>주제 수</th><th>마감</th><th>낸 날</th></tr></thead><tbody>' + asg.map(function (a) {
          return '<tr><td><a href="#/assignment/' + a.id + '"><b>' + esc(a.title) + '</b></a></td><td class="n">' + (a.items || []).length + "</td><td>" + esc(dueText(a.due)) + "</td><td>" + fmtDate(a.createdAt) + "</td></tr>";
        }).join("") + "</tbody></table></div>" : '<div class="empty">아직 낸 과제가 없습니다.</div>';
      } else if (tab === "members") {
        html += members.length ? '<div class="scroll"><table class="tbl"><thead><tr><th class="n">번호</th><th>이름</th><th>이메일</th><th>들어온 날</th><th></th></tr></thead><tbody>' + members.map(function (m) {
          return '<tr><td class="n"><input class="input" style="width:64px;padding:3px 6px" data-num="' + esc(m.id) + '" value="' + esc(m.number || "") + '"></td><td>' + esc(m.name) + '</td><td class="muted">' + esc(m.email || "") + "</td><td>" + fmtDate(m.joinedAt) + '</td><td><button class="btn sm danger" data-kick="' + esc(m.id) + '">내보내기</button></td></tr>';
        }).join("") + "</tbody></table></div><p class=\"small muted\">번호 칸을 고치면 바로 저장됩니다.</p>" : '<div class="empty">아직 들어온 학생이 없습니다. 학생에게 참여 코드 <b>' + esc(c.code) + "</b>를 알려 주세요. 학생은 '내 학급' 메뉴에서 코드를 입력합니다.</div>";
      } else if (tab === "status") {
        html += '<div id="statusbox"><div class="loading">현황을 모으는 중…</div></div>';
      } else if (tab === "notice") {
        html += '<form class="box pad" id="nform" style="margin-bottom:16px"><label class="field"><span>새 알림</span><textarea class="input" name="text" required placeholder="학생들의 \'내 학급\' 화면에 보입니다."></textarea></label><button class="btn dark">올리기</button></form>' +
          (notes.length ? notes.map(function (n) { return '<div class="task"><div>' + rich(n.text) + '</div><div class="small muted" style="margin-top:6px">' + fmtDate(n.createdAt) + ' · <button class="btn text sm" data-delnote="' + esc(n.id) + '">지우기</button></div></div>'; }).join("") : '<div class="empty">올린 알림이 없습니다.</div>');
      } else {
        html += '<form class="box pad" id="sform" style="max-width:560px"><label class="field"><span>학급 이름</span><input class="input" name="name" value="' + esc(c.name) + '" required></label>' +
          '<label class="field"><span>메모</span><input class="input" name="note" value="' + esc(c.note || "") + '"></label>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn dark">저장</button><button type="button" class="btn line" data-newcode>참여 코드 새로 만들기</button><button type="button" class="btn danger" data-delclass>학급 삭제</button></div></form>';
      }
      h(shell("classes", html + "</div></main>"));
      bindClass(c, members, asg, tab);
    });
  }
  function bindClass(c, members, asg, tab) {
    $app.querySelectorAll("[data-num]").forEach(function (inp) { inp.onchange = function () { DB.update("members", inp.dataset.num, { number: inp.value.trim() }).then(function () { toast("저장했습니다."); }); }; });
    $app.querySelectorAll("[data-kick]").forEach(function (b) { b.onclick = function () { if (confirm("이 학생을 학급에서 내보낼까요?")) DB.remove("members", b.dataset.kick).then(function () { viewClass(c.id, "members"); }); }; });
    var nf = document.getElementById("nform");
    if (nf) nf.onsubmit = function (ev) { ev.preventDefault(); DB.set("notices", "n" + uid(), { classId: c.id, teacherUid: c.teacherUid, text: new FormData(nf).get("text"), createdAt: Date.now() }).then(function () { viewClass(c.id, "notice"); }); };
    $app.querySelectorAll("[data-delnote]").forEach(function (b) { b.onclick = function () { DB.remove("notices", b.dataset.delnote).then(function () { viewClass(c.id, "notice"); }); }; });
    var sf = document.getElementById("sform");
    if (sf) {
      sf.onsubmit = function (ev) { ev.preventDefault(); var fd = new FormData(sf); DB.update("classes", c.id, { name: fd.get("name"), note: fd.get("note") }).then(function () { toast("저장했습니다."); viewClass(c.id, "settings"); }); };
      $app.querySelector("[data-newcode]").onclick = function () { if (confirm("새 코드를 만들면 이전 코드로는 들어올 수 없습니다.")) DB.update("classes", c.id, { code: classCode() }).then(function () { viewClass(c.id, "settings"); }); };
      $app.querySelector("[data-delclass]").onclick = function () {
        if (!confirm("학급 '" + c.name + "'을(를) 삭제할까요? 명단·과제·알림이 모두 지워집니다.")) return;
        Promise.all([DB.where("members", "classId", c.id), DB.where("assignments", "classId", c.id), DB.where("notices", "classId", c.id), DB.where("submissions", "classId", c.id, "teacherUid", user().uid)]).then(function (x) {
          return Promise.all([].concat(x[0].map(function (d) { return DB.remove("members", d.id); }), x[1].map(function (d) { return DB.remove("assignments", d.id); }), x[2].map(function (d) { return DB.remove("notices", d.id); }), x[3].map(function (d) { return DB.remove("submissions", d.id); })));
        }).then(function () { return DB.remove("classes", c.id); }).then(function () { toast("삭제했습니다."); location.hash = "#/classes"; });
      };
    }
    if (tab === "status") {
      DB.where("submissions", "classId", c.id, "teacherUid", user().uid).then(function (subs) {
        var by = {}; subs.forEach(function (s) { by[s.assignmentId + "_" + s.uid] = s; });
        var box = document.getElementById("statusbox");
        if (!members.length || !asg.length) { box.innerHTML = '<div class="empty">학생과 과제가 있어야 현황이 보입니다.</div>'; return; }
        var A = asg.slice().reverse();
        box.innerHTML = '<p class="small muted">과제별 단계 완료율과 제출 여부입니다. 칸을 누르면 그 과제로 갑니다.</p><div class="scroll"><table class="tbl"><thead><tr><th class="n">번호</th><th>이름</th>' +
          A.map(function (a, i) { return '<th class="c" title="' + esc(a.title) + '"><a href="#/assignment/' + a.id + '">과제' + (i + 1) + "</a></th>"; }).join("") + '<th class="n">제출</th></tr></thead><tbody>' +
          members.map(function (m) {
            var nS = 0;
            return '<tr><td class="n">' + esc(m.number || "") + "</td><td>" + esc(m.name) + "</td>" + A.map(function (a) {
              var s = by[a.id + "_" + m.uid], p = subProgress(a, s); if (s && s.status === "submitted") nS++;
              var pct = p.total ? Math.round(p.n / p.total * 100) : 0;
              return '<td class="c">' + (s && s.status === "submitted" ? '<span class="st-ok">제출</span>' : pct ? '<span class="st-mid">' + pct + "%</span>" : '<span class="st-no">-</span>') + "</td>";
            }).join("") + '<td class="n">' + nS + "/" + A.length + "</td></tr>";
          }).join("") + "</tbody></table></div>" +
          '<p class="small muted" style="margin-top:10px">' + A.map(function (a, i) { return "과제" + (i + 1) + ": " + esc(a.title); }).join(" · ") + "</p>";
      });
    }
  }

  /* 교사: 과제 만들기 */
  function viewNewAssignment(pre, q) {
    if (!T()) return notFound();
    document.title = "새 과제";
    var classId = (/class=([\w-]+)/.exec(q || "") || [])[1], resId = (/res=([\w-]+)/.exec(q || "") || [])[1];
    Promise.all([DB.where("classes", "teacherUid", user().uid), resId ? DB.get("resources", resId) : Promise.resolve(null)]).then(function (x) {
      var cls = x[0], res = x[1];
      if (res && !pre) pre = res.code;
      if (!cls.length) { h(shell("classes", '<main class="wrap narrow"><div class="empty">먼저 학급을 만들어 주세요. <a class="btn sm" href="#/classes">학급 만들기</a></div></main>')); return; }
      var preR = pre ? K.find(pre) : null;
      var html = '<main class="wrap narrow"><div class="crumbs"><a href="#/classes">학급 관리</a><i>›</i>새 과제</div><h1 class="title">새 과제 내기</h1>' +
        '<p class="sub">학습 주제와 단계(기본·심화·발전)를 고르면, 학생은 해당 단계를 공부하고 완료 표시·활동 기록을 제출합니다.</p><form id="af">' +
        '<div class="grid g2"><label class="field"><span>학급 (여러 개 고르면 각 학급에 같은 과제가 나갑니다)</span><select class="input" name="cls" multiple size="' + Math.min(4, cls.length) + '" required>' +
        cls.map(function (c) { return '<option value="' + c.id + '"' + (c.id === classId || cls.length === 1 ? " selected" : "") + ">" + esc(c.name) + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>마감일</span><input class="input" type="date" name="due"></label></div>' +
        '<label class="field"><span>과제 이름</span><input class="input" name="title" required value="' + (res ? esc(res.title) : preR ? esc(preR.std.title + " 공부하기") : "") + '"></label>' +
        (res ? '<div class="field"><span>공유 활동</span><label class="box pad" style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="itr" value="' + esc(res.id) + '" checked> ' + esc(res.title) + ' <span class="muted small">' + esc(res.authorName || "") + " 선생님</span></label>" +
          (res.forStudents ? "" : '<p class="small" style="color:var(--adv)">※ 이 활동은 \'학생 화면에도 보이기\'가 꺼져 있어 학생이 열 수 없습니다. 자료 고치기에서 켜 주세요.</p>') + "</div>" : "") +
        '<label class="field"><span>안내 (선택)</span><textarea class="input" name="desc" placeholder="예: 기본 단계의 생각 열기 질문에 모두 답을 적어 오세요."></textarea></label>' +
        '<div class="field"><span>학습 주제 고르기 — 선택한 것 <b id="pcount">0</b>개</span><input class="input" id="pfilter" placeholder="주제 이름·개념어로 좁히기" style="margin-bottom:6px"><div class="picker">' +
        K.SUBJECTS.filter(function (s) { return s.count; }).map(function (s) {
          return "<details" + (preR && preR.subject === s ? " open" : "") + "><summary>" + esc(s.name) + ' <span class="muted small" style="font-weight:400">' + esc(s.kind) + "</span></summary>" +
            s.areas.map(function (a) {
              return '<div class="small muted plabel" style="padding:4px 12px 0 18px">' + esc(a.name) + "</div>" + a.standards.map(function (st) {
                return '<div class="row" data-txt="' + esc((st.title + " " + (st.keywords || []).join(" ") + " " + st.code).toLowerCase()) + '"><span>' + esc(st.title) + ' <span class="muted small">' + esc(st.code) + '</span></span><span class="lv">' +
                  LV.map(function (l) { return '<label><input type="checkbox" name="it" value="' + esc(st.code + "|" + l.key) + '"' + (preR && preR.std === st && l.key === "basic" && !res ? " checked" : "") + "> " + l.name + "</label>"; }).join("") + "</span></div>";
              }).join("");
            }).join("") + "</details>";
        }).join("") + '</div></div><div class="msg"></div><button class="btn dark">과제 내기</button></form></main>';
      h(shell("classes", html));
      var f = document.getElementById("af"), cnt = document.getElementById("pcount");
      function count() { cnt.textContent = f.querySelectorAll("[name=it]:checked").length; }
      f.querySelectorAll("[name=it]").forEach(function (x) { x.onchange = count; }); count();
      document.getElementById("pfilter").oninput = function () {
        var v = this.value.trim().toLowerCase();
        f.querySelectorAll(".picker .row").forEach(function (r) { r.style.display = !v || r.dataset.txt.indexOf(v) >= 0 ? "" : "none"; });
        f.querySelectorAll(".picker .plabel").forEach(function (lb) {
          var any = false, n = lb.nextElementSibling;
          while (n && n.classList.contains("row")) { if (n.style.display !== "none") any = true; n = n.nextElementSibling; }
          lb.style.display = any ? "" : "none";
        });
        f.querySelectorAll(".picker details").forEach(function (d) { var vis = !v || d.querySelector('.row:not([style*="none"])'); d.style.display = vis ? "" : "none"; if (v) d.open = true; });
      };
      f.onsubmit = function (ev) {
        ev.preventDefault();
        var fd = new FormData(f), items = fd.getAll("it").map(function (v) { var p = v.split("|"); return { code: p[0], level: p[1] }; });
        if (res && fd.get("itr")) items.unshift({ code: res.code, level: "res:" + res.id, res: res.id, title: res.title });
        var msg = f.querySelector(".msg"), sel = Array.prototype.map.call(f.querySelector("[name=cls]").selectedOptions, function (o) { return o.value; });
        if (!sel.length) { msg.className = "msg err"; msg.textContent = "학급을 고르세요."; return; }
        if (!items.length) { msg.className = "msg err"; msg.textContent = "학습 주제를 하나 이상 고르세요."; return; }
        var ids = [];
        Promise.all(sel.map(function (cid) {
          var id = "a" + uid(); ids.push(id);
          return DB.set("assignments", id, { classId: cid, teacherUid: user().uid, title: String(fd.get("title")).trim(), desc: fd.get("desc"), due: fd.get("due") || "", items: items, createdAt: Date.now() });
        })).then(function () { toast("과제를 냈습니다."); location.hash = sel.length === 1 ? "#/assignment/" + ids[0] : "#/classes"; });
      };
    });
  }

  /* ───────── 교사 자료실 ───────── */
  function viewTeacher() {
    if (!T()) return notFound();
    document.title = "교사 자료실";
    var u = user(), tot = 0, unv = [];
    var rows = K.SUBJECTS.map(function (s) {
      var n = 0, v = 0, media = 0, tasks = 0;
      s.areas.forEach(function (a) { a.standards.forEach(function (st) {
        n++; tot++; if (st.verified !== false) v++; else unv.push(st.code);
        LV.forEach(function (l) { var lv = (st.levels || {})[l.key] || {}; (lv.blocks || []).forEach(function (b) { if (b.kind === "video" || b.kind === "image" || b.kind === "svg" || b.media) media++; }); tasks += (lv.items || []).filter(function (x) { return x.kind === "task"; }).length; });
      }); });
      return '<tr><td><a href="#/subject/' + s.id + '"><b>' + esc(s.name) + "</b></a></td><td>" + esc(s.kind) + '</td><td class="n">' + s.areas.length + '</td><td class="n">' + n + '</td><td class="n">' + (s.school === "middle" ? media : "기출 자동") + '</td><td class="n">' + (n ? v + "/" + n : "-") + "</td></tr>";
    }).join("");
    var html = '<main class="wrap"><h1 class="title">교사 자료실</h1>' +
      '<p class="sub">학습 화면에서 성취기준 확인, <b>이 화면으로 수업 열기</b>(수업 코드), <b>학습지 인쇄</b>(답 포함/미포함), <b>지도 유의점</b>을 쓸 수 있습니다.</p>' +
      '<div class="grid g4"><div class="stat"><div class="v">' + tot + '</div><div class="l">성취기준(학습 주제)</div></div><div class="stat"><div class="v">' + K.SUBJECTS.filter(function (s) { return s.count; }).length + '/12</div><div class="l">자료가 있는 과목</div></div>' +
      '<div class="stat"><div class="v">' + unv.length + '</div><div class="l">원문 대조 필요</div></div><div class="stat"><div class="v"><a href="#/mapping">→</a></div><div class="l">2015↔2022 매핑 표</div></div></div>' +
      '<h2 class="h2">성취기준 전체 보기 <small>과목·영역별 성취기준 일람</small></h2><div class="box pad" style="max-height:420px;overflow:auto">' +
      K.SUBJECTS.filter(function (s) { return s.count; }).map(function (s) {
        return "<details><summary><b>" + esc(s.name) + '</b> <span class="muted small">' + s.count + "개</span></summary>" + s.areas.map(function (a) {
          return '<div class="small" style="margin:8px 0 2px"><b>' + esc(a.name) + "</b></div>" + a.standards.map(function (st) { return '<div class="small" style="padding-left:12px"><a href="' + link(st.code) + '"><b style="color:var(--board)">' + esc(st.code) + "</b> " + esc(st.text) + "</a></div>"; }).join("");
        }).join("") + "</details>";
      }).join("") + "</div>" +
      '<h2 class="h2">자료 현황</h2><div class="scroll"><table class="tbl"><thead><tr><th>과목</th><th>구분</th><th class="n">영역</th><th class="n">성취기준</th><th class="n">그림·영상 / 기출</th><th class="n">원문 확인</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
    if (false) html += '<h2 class="h2">교사 가입 승인 <small>' + (Auth.mode === "local" ? "체험 모드" : "관리자") + '</small></h2><div id="users"><div class="loading">불러오는 중…</div></div>';
    h(shell("teacher", html + "</main>"));
    var box = document.getElementById("users");
    if (box) Auth.listUsers().then(function (list) {
      list.sort(function (a, b) { return (a.role === "teacher" && !a.approved ? 0 : 1) - (b.role === "teacher" && !b.approved ? 0 : 1); });
      box.innerHTML = '<div class="scroll"><table class="tbl"><thead><tr><th>이름</th><th>이메일</th><th>구분</th><th>상태</th><th></th></tr></thead><tbody>' + list.map(function (x) {
        var t = x.role === "teacher";
        return "<tr><td>" + esc(x.name) + "</td><td>" + esc(x.email) + "</td><td>" + (t ? "교사" : "학생") + "</td><td>" + (t ? (x.approved ? "승인됨" : "<b>승인 대기</b>") : "-") + "</td><td>" +
          (t && !x.isAdmin && x.uid !== u.uid ? '<button class="btn sm line" data-ap="' + esc(x.uid) + '" data-v="' + (x.approved ? 0 : 1) + '">' + (x.approved ? "승인 취소" : "승인") + "</button>" : "") + "</td></tr>";
      }).join("") + "</tbody></table></div>";
      box.querySelectorAll("[data-ap]").forEach(function (b) { b.onclick = function () { Auth.setApproved(b.dataset.ap, b.dataset.v === "1").then(function () { toast("바꾸었습니다."); viewTeacher(); }); }; });
    }).catch(function (e) { box.innerHTML = '<div class="empty">회원 목록을 불러오지 못했습니다: ' + esc(e.message) + "</div>"; });
  }

  /* ───────── 교사: 2015 ↔ 2022 성취기준 매핑 표 ───────── */
  function viewMapping() {
    if (!T()) return notFound();
    document.title = "2015↔2022 성취기준 매핑";
    h(shell("teacher", '<main class="wrap"><div class="crumbs"><a href="#/teacher">교사 자료실</a><i>›</i>성취기준 매핑</div><h1 class="title">2015 ↔ 2022 성취기준 매핑</h1>' +
      '<p class="sub">평가원 기출은 2015 개정 교육과정 기반입니다. 2015 성취기준마다 해당 기출을 고르고, 매핑된 2022 성취기준에만 연결합니다(여러 2022 성취기준에 겹칠 수 있음). 매핑이 없는 기출은 연결하지 않습니다.</p>' +
      '<div id="mapbox"><div class="loading">문제은행을 불러오는 중…</div></div></main>'));
    Kichul.load().then(function () {
      var M = window.MAP2015 || [], subj = [], by = {};
      M.forEach(function (s) { if (!by[s.subject]) { by[s.subject] = []; subj.push(s.subject); } by[s.subject].push(s); });
      var used = {}; M.forEach(function (s) { (s.to || []).forEach(function (c) { used[c] = 1; }); });
      var orphan = K.all().filter(function (r) { return r.subject.school !== "middle" && !used[r.std.code]; });
      var html = '<div class="grid g4" style="margin-bottom:10px"><div class="stat"><div class="v">' + M.length + '</div><div class="l">2015 성취기준</div></div>' +
        '<div class="stat"><div class="v">' + M.filter(function (s) { return (s.to || []).length; }).length + '</div><div class="l">2022와 대응</div></div>' +
        '<div class="stat"><div class="v">' + M.filter(function (s) { return !s.match; }).length + '</div><div class="l">수능 문항 대상 아님</div></div>' +
        '<div class="stat"><div class="v">' + orphan.length + '</div><div class="l">2015 대응이 없는 2022(고등)</div></div></div>' +
        '<p class="small muted">원본 표: <code>2015-2022_성취기준_매핑.md</code> · 데이터: <code>data/mapping-2015.js</code> (to: 대응 2022 코드, match: 기출 고르는 조건). 특정 문항을 2022 성취기준에 더하려면 그 성취기준의 <code>kichul.items</code>, 빼려면 <code>kichul.exclude</code>에 문항 키를 적습니다.</p>';
      subj.forEach(function (sj) {
        html += '<h2 class="h2">' + esc(sj) + " <small>" + by[sj].length + '개</small></h2><div class="scroll"><table class="tbl"><thead><tr><th style="width:40%">2015 성취기준</th><th>대응 2022 성취기준</th><th class="n">기출</th></tr></thead><tbody>' +
          by[sj].map(function (s) {
            return "<tr><td><b>" + esc(s.code) + "</b> " + esc(s.text) + (s.why ? '<div class="small muted">' + esc(s.why) + "</div>" : "") + "</td><td>" +
              ((s.to || []).length ? s.to.map(function (c) { var r = K.find(c); return '<div><a href="' + link(c) + '">' + esc(c) + "</a> " + (r ? esc(r.std.title) : "") + "</div>"; }).join("") : '<span class="muted">대응 없음</span>') +
              '</td><td class="n">' + (s.match ? Kichul.count2015(s.code) : '<span class="muted">-</span>') + "</td></tr>";
          }).join("") + "</tbody></table></div>";
      });
      html += '<h2 class="h2">2015 대응이 없는 2022 성취기준 <small>기출 연결 없음</small></h2><ul class="topics">' + orphan.map(function (r) {
        return '<li><a class="topic" href="' + link(r.std.code) + '"><span><div class="t">' + esc(r.std.title) + '</div><div class="std"><b>' + esc(r.std.code) + "</b>" + esc(r.std.text) + "</div></span></a></li>";
      }).join("") + "</ul>";
      document.getElementById("mapbox").innerHTML = html;
    });
  }

  /* ───────── 교사 공유 자료: 활동 만들기 · 학습지 파일 · 링크 ─────────
     resources/{id}: { code, level, kind: activity|file|link, title, desc, steps[], questions[], sample,
                       file:{url,name,type,size}, url, forStudents, authorUid, authorName, school, createdAt, likes:{uid:1} } */
  var KIND = { activity: "활동", essay: "서·논술형", file: "학습지 파일", link: "링크" };
  /* 서·논술형: { etype: 서술형|논술형, passage, prompt, conditions[], minLen, maxLen, rubric:[{name,max,desc}], sample, origin } */
  function charCount(s) { s = String(s || ""); return { all: s.replace(/\n/g, "").length, nosp: s.replace(/\s/g, "").length }; }
  function lenNote(e, c) {
    if (!e.minLen && !e.maxLen) return "";
    var bad = (e.minLen && c.all < e.minLen) || (e.maxLen && c.all > e.maxLen);
    return ' <span style="color:' + (bad ? "var(--red)" : "var(--ok)") + '">(' + (e.minLen || 0) + "~" + (e.maxLen || "") + "자 " + (bad ? "벗어남" : "맞음") + ")</span>";
  }
  function rubricMax(e) { return (e.rubric || []).reduce(function (t, r) { return t + (Number(r.max) || 0); }, 0); }
  function parseRubric(txt) {
    return String(txt || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var p = l.split("|").map(function (x) { return x.trim(); });
      return { name: p[0] || "", max: Math.max(0, Math.min(100, parseInt(p[1], 10) || 0)), desc: p.slice(2).join(" | ") };
    }).filter(function (r) { return r.name && r.max; });
  }
  function rubricTable(e) {
    return '<table class="tbl rubric"><thead><tr><th>채점 항목</th><th>채점 내용</th><th class="n">배점</th></tr></thead><tbody>' +
      (e.rubric || []).map(function (r) { return "<tr><td><b>" + esc(r.name) + "</b></td><td>" + rich(r.desc) + '</td><td class="n">' + r.max + "</td></tr>"; }).join("") +
      '<tr><td colspan="2"><b>합계</b></td><td class="n"><b>' + rubricMax(e) + "</b></td></tr></tbody></table>";
  }
  function loadResources(code) {
    return (T() ? DB.where("resources", "code", code) : DB.where("resources", "code", code, "forStudents", true))
      .then(function (l) { return l.sort(function (a, b) { return likeN(b) - likeN(a) || b.createdAt - a.createdAt; }); })
      .catch(function (e) { console.error(e); return []; });
  }
  function likeN(r) { return Object.keys(r.likes || {}).length; }
  function resCard(r, showStd) {
    var std = K.find(r.code);
    return '<a class="res-card" href="#/res/' + r.id + '"><span class="res-k k-' + r.kind + '">' + KIND[r.kind] + "</span>" +
      '<span class="res-t">' + esc(r.title) + "</span>" +
      '<span class="res-m">' + (showStd && std ? esc(std.subject.name + " · " + std.std.title) + " · " : "") + (r.level && LVBY[r.level] ? LVBY[r.level].name + " · " : "") +
      esc(r.authorName || "") + " 선생님 · " + fmtDate(r.createdAt) + (likeN(r) ? " · ♥ " + likeN(r) : "") + (r.forStudents ? "" : " · 교사만") + "</span></a>";
  }
  function fillResources(code) {
    var box = document.getElementById("res-box"); if (!box) return;
    loadResources(code).then(function (list) {
      if (!document.getElementById("res-box")) return;
      if (!list.length && !T()) { box.innerHTML = ""; return; }
      box.innerHTML = '<h2 class="h2">' + (T() ? "내가 만든 활동·학습지" : "선생님이 만든 활동") + " <small>" + list.length + "개</small></h2>" +
        (T() ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px"><a class="btn sm dark" href="#/res-new/' + encodeURIComponent(code) + '?kind=activity">+ 활동 만들기</a><a class="btn sm dark" href="#/res-new/' + encodeURIComponent(code) + '?kind=essay">+ 서·논술형 문항</a><a class="btn sm line" href="#/res-new/' + encodeURIComponent(code) + '?kind=file">+ 학습지 파일 올리기</a><a class="btn sm line" href="#/res-new/' + encodeURIComponent(code) + '?kind=link">+ 링크</a><a class="btn sm text" href="#/share">공유 자료실 전체 보기</a></div>' : "") +
        (list.length ? '<div class="res-list">' + list.map(function (r) { return resCard(r); }).join("") + "</div>" : '<div class="empty">아직 공유된 자료가 없습니다. 이 주제로 만든 활동이나 학습지를 처음으로 나눠 주세요.</div>');
    });
  }

  /* 자료 만들기·고치기 */
  function viewResEdit(code, q, editId) {
    if (!T()) return notFound();
    var kind = (/kind=(\w+)/.exec(q || "") || [])[1] || "activity";
    var load = editId ? DB.get("resources", editId) : Promise.resolve(null);
    load.then(function (r) {
      if (editId && (!r || (r.authorUid !== user().uid && !user().isAdmin))) return notFound();
      if (r) { kind = r.kind; code = r.code; }
      r = r || {};
      var st = K.find(code);
      document.title = (editId ? "자료 고치기" : "활동 만들기");
      var stdOpts = K.SUBJECTS.filter(function (s) { return s.count; }).map(function (s) {
        return '<optgroup label="' + esc(s.name) + '">' + s.areas.map(function (a) { return a.standards.map(function (x) {
          return '<option value="' + esc(x.code) + '"' + (x.code === code ? " selected" : "") + ">" + esc(x.title) + " (" + esc(x.code) + ")</option>"; }).join(""); }).join("") + "</optgroup>";
      }).join("");
      var html = '<main class="wrap narrow"><div class="crumbs"><a href="#/share">내 활동 자료</a><i>›</i>' + (editId ? "고치기" : "새 자료") + "</div>" +
        '<h1 class="title">' + (editId ? "자료 고치기" : "활동·학습지 만들기") + '</h1><p class="sub">지금은 이 브라우저에 저장됩니다. 수업 코드로 수업 중에 이 화면을 열면 학생 화면에도 그대로 보입니다. (선생님끼리 공유는 사이트 전체 로그인 단계에서 엽니다.)</p>' +
        '<form id="rf" class="box pad">' +
        '<div class="field"><span>종류</span><div class="seg">' + ["activity", "essay", "file", "link"].map(function (k) { return '<label><input type="radio" name="kind" value="' + k + '"' + (k === kind ? " checked" : "") + (editId ? " disabled" : "") + ">" + KIND[k] + "</label>"; }).join("") + "</div></div>" +
        '<div class="grid g2"><label class="field"><span>학습 주제</span><select class="input" name="code">' + stdOpts + "</select></label>" +
        '<label class="field"><span>단계</span><select class="input" name="level"><option value="">단계 구분 없음</option>' + LV.map(function (l) { return '<option value="' + l.key + '"' + (r.level === l.key ? " selected" : "") + ">" + l.name + "</option>"; }).join("") + "</select></label></div>" +
        '<label class="field"><span>제목</span><input class="input" name="title" required value="' + esc(r.title || "") + '" placeholder="예: 광고 속 설득 전략 찾기 모둠 활동"></label>' +
        '<label class="field"><span>안내 (활동 목표, 준비물, 진행 방법 등)</span><textarea class="input" name="desc">' + esc(r.desc || "") + "</textarea></label>" +
        '<div data-k="activity"><label class="field"><span>활동 순서 (한 줄에 한 단계)</span><textarea class="input" name="steps" placeholder="1. 모둠별로 광고 3편을 고른다&#10;2. ...">' + esc((r.steps || []).join("\n")) + "</textarea></label>" +
        '<label class="field"><span>학생 질문 (한 줄에 한 문항 — 학생이 답을 적고 과제로 제출할 수 있습니다)</span><textarea class="input" name="questions">' + esc((r.questions || []).join("\n")) + "</textarea></label>" +
        '<label class="field"><span>참고 예시 답안 (선택, 교사·학생 모두 \'참고 예시\'로 표시)</span><textarea class="input" name="sample">' + esc(r.sample || "") + "</textarea></label></div>" +
        '<div data-k="file"><label class="field"><span>학습지 파일 (PDF, 한글, 워드, 파워포인트, 그림 · 최대 ' + Math.round(FileStore.limit / 1048576) + "MB" + (Auth.mode === "local" ? ", 체험 모드는 이 브라우저에만 저장" : "") + ')</span><input class="input" type="file" name="file" accept=".pdf,.hwp,.hwpx,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"></label>' +
        (r.file ? '<p class="small muted">현재 파일: ' + esc(r.file.name) + " (새 파일을 고르면 바뀝니다)</p>" : "") + "</div>" +
        '<div data-k="essay"><div class="grid g2"><label class="field"><span>유형</span><select class="input" name="etype">' + ["서술형", "논술형"].map(function (x) { return "<option" + (r.etype === x ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></label>" +
        '<label class="field"><span>분량 (공백 포함 글자 수, 선택)</span><span style="display:flex;gap:6px;align-items:center"><input class="input" name="minLen" type="number" min="0" value="' + esc(r.minLen || "") + '" placeholder="최소">~<input class="input" name="maxLen" type="number" min="0" value="' + esc(r.maxLen || "") + '" placeholder="최대"></span></label></div>' +
        '<label class="field"><span>제시문 (선택 — 저작권이 있는 글은 출처를 밝히고 필요한 부분만)</span><textarea class="input" name="passage">' + esc(r.passage || "") + "</textarea></label>" +
        '<label class="field"><span>발문 (문제)</span><textarea class="input" name="prompt" style="min-height:70px" placeholder="예: 제시문 (가)와 (나)의 관점을 비교하고, 자신의 견해를 밝히시오.">' + esc(r.prompt || "") + "</textarea></label>" +
        '<label class="field"><span>조건 (한 줄에 하나)</span><textarea class="input" name="conditions" style="min-height:70px" placeholder="(가)의 핵심 개념을 활용할 것&#10;두 문단으로 쓸 것">' + esc((r.conditions || []).join("\n")) + "</textarea></label>" +
        '<label class="field"><span>채점 기준 (한 줄에 한 항목: 항목 | 배점 | 채점 내용)</span><textarea class="input" name="rubric" placeholder="내용 이해 | 4 | 상(4) (가)의 관점을 정확히 요약 / 중(2) 일부만 요약 / 하(0) 요약 없음&#10;논증 | 4 | …&#10;표현·조건 | 2 | …">' + esc((r.rubric || []).map(function (x) { return x.name + " | " + x.max + " | " + x.desc; }).join("\n")) + "</textarea></label>" +
        '<label class="field"><span>예시 답안 (학생은 제출한 뒤에 볼 수 있음)</span><textarea class="input" name="esample">' + esc(r.kind === "essay" ? r.sample || "" : "") + "</textarea></label>" +
        '<label class="field"><span>출처 (자체 제작 / 대학 논술 문항카드·교육청 자료 등 — 기출을 옮길 때는 출처를 꼭 적어 주세요)</span><input class="input" name="origin" value="' + esc(r.origin || "") + '" placeholder="예: 자체 제작, 또는 2026학년도 ○○대 논술 문항카드"></label></div>' +
        '<div data-k="link"><label class="field"><span>링크 주소</span><input class="input" name="url" type="url" value="' + esc(r.url || "") + '" placeholder="https://"></label></div>' +
        '<label class="field" style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="forStudents"' + (r.forStudents ? " checked" : "") + "> <span style=\"margin:0\">학생 화면에도 보이기 (해당 주제의 학습 화면 아래에 나옵니다)</span></label>" +
        '<p class="small muted">출처가 있는 자료(교과서, 기관 자료 등)는 안내에 출처를 적어 주세요. 저작권이 있는 자료는 공유하지 않습니다.</p>' +
        '<div class="msg"></div><button class="btn dark">' + (editId ? "저장" : "저장하기") + "</button></form></main>";
      h(shell("teacher", html));
      var f = document.getElementById("rf");
      function sync() { var k = (f.querySelector("[name=kind]:checked") || {}).value || kind; f.querySelectorAll("[data-k]").forEach(function (d) { d.style.display = d.dataset.k === k ? "" : "none"; }); }
      f.querySelectorAll("[name=kind]").forEach(function (x) { x.onchange = sync; }); sync();
      f.onsubmit = function (ev) {
        ev.preventDefault();
        var fd = new FormData(f), msg = f.querySelector(".msg"), btn = f.querySelector("button");
        var k = editId ? kind : fd.get("kind");
        var data = { code: fd.get("code"), level: fd.get("level") || "", kind: k, title: String(fd.get("title")).trim(), desc: fd.get("desc") || "",
          forStudents: !!fd.get("forStudents"), updatedAt: Date.now() };
        if (k === "activity") {
          data.steps = String(fd.get("steps") || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
          data.questions = String(fd.get("questions") || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
          data.sample = fd.get("sample") || "";
          if (!data.steps.length && !data.questions.length && !data.desc.trim()) { msg.className = "msg err"; msg.textContent = "안내·활동 순서·질문 중 하나는 적어 주세요."; return; }
        }
        if (k === "essay") {
          data.etype = fd.get("etype"); data.passage = fd.get("passage") || ""; data.prompt = String(fd.get("prompt") || "").trim();
          data.conditions = String(fd.get("conditions") || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
          data.minLen = parseInt(fd.get("minLen"), 10) || 0; data.maxLen = parseInt(fd.get("maxLen"), 10) || 0;
          data.rubric = parseRubric(fd.get("rubric")); data.sample = fd.get("esample") || ""; data.origin = String(fd.get("origin") || "").trim();
          if (!data.prompt) { msg.className = "msg err"; msg.textContent = "발문을 적어 주세요."; return; }
          if (!data.rubric.length) { msg.className = "msg err"; msg.textContent = "채점 기준을 한 항목 이상 '항목 | 배점 | 내용' 형식으로 적어 주세요."; return; }
        }
        if (k === "link") { data.url = String(fd.get("url") || "").trim(); if (!/^https?:\/\//.test(data.url)) { msg.className = "msg err"; msg.textContent = "링크 주소를 확인해 주세요."; return; } }
        var file = fd.get("file");
        btn.disabled = true; msg.className = "msg"; msg.textContent = "저장 중…";
        var up = (k === "file" && file && file.size) ? FileStore.put(file) : Promise.resolve(null);
        up.then(function (fi) {
          if (k === "file" && !fi && !r.file) throw new Error("파일을 골라 주세요.");
          if (fi) data.file = fi;
          if (editId) return DB.update("resources", editId, data).then(function () { return editId; });
          var id = "r" + uid(), u = user();
          data.authorUid = u.uid; data.authorName = u.name; data.school = u.school || ""; data.createdAt = Date.now(); data.likes = {};
          return DB.set("resources", id, data).then(function () { return id; });
        }).then(function (id) { toast("저장했습니다."); location.hash = "#/res/" + id; })
          .catch(function (e) { btn.disabled = false; msg.className = "msg err"; msg.textContent = e.message || "저장하지 못했습니다(체험 모드는 브라우저 저장 공간이 작아 큰 파일을 담지 못할 수 있습니다)."; });
      };
    });
  }

  /* 자료 보기: 학생은 질문에 답을 적고(과제면 제출에 포함), 교사는 인쇄·과제 내기·좋아요 */
  function viewRes(id) {
    DB.get("resources", id).then(function (r) {
      if (!r || (!T() && !r.forStudents)) return notFound();
      var st = K.find(r.code), u = user(), mine = r.authorUid === u.uid || u.isAdmin, liked = (r.likes || {})[u.uid];
      document.title = r.title;
      var html = '<main class="wrap narrow"><div class="crumbs"><a href="#/">홈</a><i>›</i>' + (st ? '<a href="' + link(r.code) + '">' + esc(st.std.title) + "</a><i>›</i>" : "") + "공유 자료</div>" +
        '<div class="small muted">' + KIND[r.kind] + (r.level && LVBY[r.level] ? " · " + LVBY[r.level].name + " 단계" : "") + " · " + esc(r.authorName || "") + " 선생님 · " + fmtDate(r.createdAt) + "</div>" +
        '<h1 class="title">' + esc(r.title) + "</h1>" + (r.desc ? '<div class="prose"><p>' + rich(r.desc) + "</p></div>" : "");
      if (r.kind === "essay") {
        /* 학생이 제출했거나 교사이면 예시 답안 공개. 과제가 아닌 연습이면 글을 쓴 뒤 '비교하기'로 공개 */
        var asgs = myAssign.filter(function (x2) { return (x2.a.items || []).some(function (it) { return it.res === id; }); });
        var submitted = asgs.some(function (x2) { return x2.sub && x2.sub.status === "submitted"; });
        var graded = asgs.map(function (x2) { return x2.sub && x2.sub.scores && x2.sub.scores[id]; }).filter(function (m) { return m && Object.keys(m).length; })[0];
        html += '<div class="essay-meta"><span class="chip">' + esc(r.etype || "서·논술형") + "</span>" + (r.minLen || r.maxLen ? " 분량: 공백 포함 " + (r.minLen || 0) + "~" + (r.maxLen || "") + "자" : "") + " · 배점 " + rubricMax(r) + "점" + (r.origin ? ' · 출처: ' + esc(r.origin) : "") + "</div>";
        if (r.passage) html += '<div class="passage">' + rich(r.passage) + "</div>";
        html += '<div class="essay-prompt">' + rich(r.prompt) + "</div>";
        if ((r.conditions || []).length) html += '<div class="essay-cond"><b>조건</b><ul>' + r.conditions.map(function (c2) { return "<li>" + rich(c2) + "</li>"; }).join("") + "</ul></div>";
        if (!T()) html += '<textarea class="input essay-write" data-draft="res|' + esc(id) + '|0" placeholder="여기에 답안을 쓰세요. 쓴 내용은 이 브라우저에 저장되고, 과제로 받은 문항이면 과제 제출 때 함께 제출됩니다."' + (submitted ? " readonly" : "") + '></textarea><div class="small muted" data-count></div>';
        html += '<h3 style="font-size:17px;margin:18px 0 6px">채점 기준</h3>' + rubricTable(r);
        if (!T()) html += '<div class="think" style="margin-top:12px"><div class="lb">제출 전 스스로 점검</div>' + (r.rubric || []).map(function (rb, i) { return '<label class="small" style="display:block"><input type="checkbox" data-self="' + i + '"> ' + esc(rb.name) + " — " + esc(String(rb.desc).split("/")[0]) + "</label>"; }).join("") +
          (r.conditions || []).map(function (c2) { return '<label class="small" style="display:block"><input type="checkbox"> 조건: ' + esc(c2) + "</label>"; }).join("") + "</div>";
        if (graded) { var gt = 0; Object.keys(graded).forEach(function (i) { gt += Number(graded[i]); });
          html += '<div class="tnote"><h4>선생님 채점</h4>' + (r.rubric || []).map(function (rb, i) { return esc(rb.name) + " " + (graded[i] != null ? graded[i] : "-") + "/" + rb.max; }).join(" · ") + " → <b>" + gt + "/" + rubricMax(r) + "</b></div>"; }
        if (r.sample) {
          if (T() || submitted) html += '<h3 style="font-size:17px;margin:18px 0 6px">예시 답안</h3><div class="answer"><span class="muted small">(정답이 아니라 채점 기준을 만족하는 한 가지 예입니다)</span><br>' + rich(r.sample) + "</div>";
          else if (!asgs.length) html += '<button class="btn sm line" style="margin-top:12px" data-cmp>예시 답안과 비교하기</button><div class="answer hidden" data-cmpbox><span class="muted small">(정답이 아니라 채점 기준을 만족하는 한 가지 예입니다)</span><br>' + rich(r.sample) + "</div>";
          else html += '<p class="small muted" style="margin-top:12px">예시 답안은 과제를 제출한 뒤에 볼 수 있습니다.</p>';
        }
      } else if (r.kind === "activity") {
        if ((r.steps || []).length) html += '<h3 style="font-size:18px;margin:18px 0 6px">활동 순서</h3><ol class="act-steps">' + r.steps.map(function (s) { return "<li>" + rich(s.replace(/^\d+[.)]\s*/, "")) + "</li>"; }).join("") + "</ol>";
        (r.questions || []).forEach(function (qq, i) {
          html += '<div class="task"><div class="q">' + (i + 1) + ". " + rich(qq) + '</div><textarea class="input" data-draft="res|' + esc(id) + "|" + i + '" placeholder="답을 적어 보세요."></textarea></div>';
        });
        if (r.sample) html += '<button class="btn sm line" data-reveal>참고 예시 보기</button><div class="answer hidden"><b>참고 예시</b> <span class="muted small">(정답이 아니라 한 가지 예입니다)</span><br>' + rich(r.sample) + "</div>";
      } else if (r.kind === "file" && r.file) {
        var img = /^image\//.test(r.file.type || "");
        html += (img ? '<figure class="media" style="margin:0 0 10px"><img src="' + esc(r.file.url) + '" alt="' + esc(r.file.name) + '"></figure>' : "") +
          '<p><a class="btn dark" href="' + esc(r.file.url) + '" download="' + esc(r.file.name) + '" target="_blank" rel="noopener">파일 내려받기 — ' + esc(r.file.name) + "</a> <span class=\"muted small\">" + Math.max(1, Math.round((r.file.size || 0) / 1024)) + "KB</span></p>";
      } else if (r.kind === "link") {
        html += '<p><a class="btn dark" href="' + esc(r.url) + '" target="_blank" rel="noopener">링크 열기 ↗</a> <span class="muted small">' + esc(r.url) + "</span></p>";
      }
      if (!T() && (r.kind === "activity" || r.kind === "essay")) html += '<div class="done-row"><span class="small muted">적은 답은 이 브라우저에 저장되고, 과제로 받은 ' + (r.kind === "essay" ? "문항" : "활동") + "이면 과제 제출 때 함께 제출됩니다.</span><button class=\"btn dark\" data-resdone>" + (progress.done["res:" + id] ? "✓ 완료함 (취소)" : (r.kind === "essay" ? "답안 작성 완료" : "활동 완료")) + "</button></div>";
      if (T()) html += '<div class="done-row"><span style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm line" data-like>' + (liked ? "♥ 좋아요 취소" : "♡ 좋아요") + " " + likeN(r) + "</button>" +
        (r.kind === "activity" || r.kind === "essay" ? '<a class="btn sm line" href="#/print/' + encodeURIComponent(r.code) + "?res=" + id + '">학습지로 인쇄</a><a class="btn sm line" href="#/classes/new-assignment/?res=' + id + '">이 ' + (r.kind === "essay" ? "문항" : "활동") + "으로 과제 내기</a>" : "") + "</span>" +
        (mine ? '<span style="display:flex;gap:6px"><a class="btn sm line" href="#/res-edit/' + id + '">고치기</a><button class="btn sm danger" data-del>삭제</button></span>' : "<span></span>") + "</div>";
      h(shell(T() ? "teacher" : "", html + "</main>"));
      $app.querySelectorAll("[data-draft]").forEach(function (ta) { ta.value = getDraft(ta.dataset.draft); ta.oninput = function () { setDraft(ta.dataset.draft, ta.value); }; });
      $app.querySelectorAll("[data-reveal]").forEach(function (b) { b.onclick = function () { b.nextElementSibling.classList.toggle("hidden"); }; });
      var wr = $app.querySelector(".essay-write"), cntBox = $app.querySelector("[data-count]");
      function upd() { if (!wr) return; var c3 = charCount(wr.value); cntBox.innerHTML = "공백 포함 " + c3.all + "자 · 공백 제외 " + c3.nosp + "자" + lenNote(r, c3); }
      if (wr) { wr.addEventListener("input", upd); upd(); }
      var cmp = $app.querySelector("[data-cmp]");
      if (cmp) cmp.onclick = function () {
        if (wr && charCount(wr.value).nosp < 50) { toast("먼저 답안을 써 본 뒤에 비교해 보세요(공백 제외 50자 이상)."); return; }
        $app.querySelector("[data-cmpbox]").classList.toggle("hidden");
      };
      var dn = $app.querySelector("[data-resdone]");
      if (dn) dn.onclick = function () {
        var on = !progress.done["res:" + id]; progress.done["res:" + id] = on ? 1 : 0; saveProgress();
        syncAssign(r.code, "res:" + id, on); toast(on ? "완료로 표시했습니다." : "완료 표시를 취소했습니다."); viewRes(id);
      };
      var lk = $app.querySelector("[data-like]");
      if (lk) lk.onclick = function () { var L = r.likes || {}; if (L[u.uid]) delete L[u.uid]; else L[u.uid] = 1; DB.update("resources", id, { likes: L }).then(function () { viewRes(id); }); };
      var del = $app.querySelector("[data-del]");
      if (del) del.onclick = function () { if (confirm("이 자료를 삭제할까요?")) DB.remove("resources", id).then(function () { toast("삭제했습니다."); location.hash = st ? link(r.code) : "#/share"; }); };
    });
  }

  /* 공유 자료실: 모든 교사가 올린 자료 */
  function viewShare() {
    if (!T()) return notFound();
    document.title = "내 활동 자료";
    h(shell("teacher", '<main class="wrap"><h1 class="title">내 활동 자료</h1><p class="sub">이 브라우저에서 만든 활동·학습지·링크입니다. 학습 주제 화면에서도 바로 만들 수 있고, 수업 코드로 수업 중에 열면 학생 화면에도 보입니다.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><input class="input" id="sq" placeholder="제목·주제로 찾기" style="max-width:280px"><select class="input" id="ss" style="max-width:220px"><option value="">모든 과목</option>' +
      K.SUBJECTS.filter(function (s) { return s.count; }).map(function (s) { return '<option value="' + s.id + '">' + esc(s.name) + "</option>"; }).join("") + '</select><select class="input" id="sk" style="max-width:160px"><option value="">모든 종류</option>' +
      Object.keys(KIND).map(function (k) { return '<option value="' + k + '">' + KIND[k] + "</option>"; }).join("") + '</select><label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="sm"> 내 자료만</label></div>' +
      '<div id="slist"><div class="loading">불러오는 중…</div></div></main>'));
    DB.list("resources").then(function (all) {
      all.sort(function (a, b) { return b.createdAt - a.createdAt; });
      function draw() {
        var q = document.getElementById("sq").value.trim().toLowerCase(), s = document.getElementById("ss").value, k = document.getElementById("sk").value, m = document.getElementById("sm").checked;
        var list = all.filter(function (r) {
          var st = K.find(r.code);
          if (s && (!st || st.subject.id !== s)) return false;
          if (k && r.kind !== k) return false;
          if (m && r.authorUid !== user().uid) return false;
          return !q || (r.title + " " + (st ? st.std.title + " " + st.std.code : "") + " " + (r.authorName || "")).toLowerCase().indexOf(q) >= 0;
        });
        document.getElementById("slist").innerHTML = list.length ? '<div class="res-list">' + list.map(function (r) { return resCard(r, true); }).join("") + "</div>" : '<div class="empty">조건에 맞는 자료가 없습니다.</div>';
      }
      ["sq", "ss", "sk", "sm"].forEach(function (x) { document.getElementById(x).oninput = draw; document.getElementById(x).onchange = draw; });
      draw();
    });
  }

  /* ───────── 학습지 미리보기·인쇄 ───────── */
  function viewPrint(code, q) {
    if (!T()) return notFound();
    var r = K.find(code); if (!r) return notFound();
    var st = r.std, s = r.subject, mid = isMiddle(s);
    var qp = {}; String(q || "").split("&").forEach(function (p) { var kv = p.split("="); if (kv[0]) qp[kv[0]] = decodeURIComponent(kv[1] || ""); });
    document.title = "학습지 미리보기 — " + st.title;
    var html = '<main class="wrap print-wrap"><div class="crumbs no-print"><a href="' + link(code) + '">' + esc(st.title) + '</a><i>›</i>학습지 미리보기</div>' +
      '<div class="print-layout"><aside class="print-opts no-print box pad"><h3 style="font-size:17px;margin-bottom:10px">인쇄할 내용</h3>' +
      '<label><input type="checkbox" name="sec" value="concept" checked> 개념 정리</label>' +
      LV.map(function (l) { return '<label><input type="checkbox" name="sec" value="' + l.key + '"' + (qp.res ? "" : " checked") + "> " + l.name + " 단계</label>"; }).join("") +
      (mid ? "" : '<label><input type="checkbox" name="kq" checked> 기출 문항 포함</label>') +
      '<label><input type="checkbox" name="src" checked> 근거 자료 표시</label>' +
      '<label><input type="checkbox" name="ans"' + (qp.ans === "1" ? " checked" : "") + "> 정답·참고 예시 포함(교사용)</label>" +
      '<label><input type="checkbox" name="lines" checked> 답 쓰는 줄 넣기</label>' +
      '<label><input type="checkbox" name="big"> 글자 크게</label>' +
      '<div id="po-res" class="small" style="margin-top:8px"></div>' +
      '<label class="field" style="margin-top:10px"><span>학습지 머리말(선택)</span><input class="input" name="head" placeholder="예: 2학년 국어 3단원"></label>' +
      '<button class="btn dark block" data-print style="margin-top:6px">인쇄하기</button><p class="small muted" style="margin-top:8px">인쇄 창에서 \'PDF로 저장\'을 고르면 파일로도 받을 수 있습니다.</p></aside>' +
      '<div class="paper-stack"><div class="loading">학습지를 만드는 중…</div></div></div></main>';
    h(shell(s.school, html));
    var opts = $app.querySelector(".print-opts"), resList = [];
    var need = mid ? Promise.resolve() : Kichul.load();
    Promise.all([need, loadResources(code)]).then(function (x) {
      resList = (x[1] || []).filter(function (rr) { return rr.kind === "activity" || rr.kind === "essay"; });
      document.getElementById("po-res").innerHTML = resList.length ? "<b>공유 활동·서·논술형 넣기</b>" + resList.map(function (rr) {
        return '<label><input type="checkbox" name="res" value="' + rr.id + '"' + (qp.res === rr.id ? " checked" : "") + "> " + (rr.kind === "essay" ? "[서·논술형] " : "") + esc(rr.title) + "</label>"; }).join("") +
        (resList.some(function (rr) { return rr.kind === "essay"; }) ? '<label><input type="checkbox" name="rub" checked> 서·논술형 채점 기준 함께 인쇄</label>' : "") : "";
      opts.querySelectorAll("input").forEach(function (i) { i.onchange = draw; i.oninput = draw; });
      draw();
    });
    $app.querySelector("[data-print]").onclick = function () { window.print(); };
    function draw() {
      var on = {}; opts.querySelectorAll("[name=sec]:checked").forEach(function (i) { on[i.value] = 1; });
      var o = { ans: opts.querySelector("[name=ans]").checked, lines: opts.querySelector("[name=lines]").checked, kq: !mid && opts.querySelector("[name=kq]").checked, src: opts.querySelector("[name=src]").checked };
      var rs = {}; opts.querySelectorAll("[name=res]:checked").forEach(function (i) { rs[i.value] = 1; });
      var head = opts.querySelector("[name=head]").value;
      var p = '<article class="paper' + (opts.querySelector("[name=big]").checked ? " big" : "") + '">' +
        '<header class="paper-head"><div><div class="ph-sub">' + esc(head || (s.name + " · " + r.area.name)) + '</div><div class="ph-title">' + esc(st.title) + "</div>" +
        '<div class="ph-kw">' + esc((st.keywords || []).join(" · ")) + "</div></div>" +
        '<table class="ph-name"><tr><th>학년</th><td></td><th>반</th><td></td><th>번호</th><td></td></tr><tr><th>이름</th><td colspan="5"></td></tr></table></header>';
      if (on.concept) {
        p += '<section class="ps"><h2>개념 정리</h2>' + ((st.concepts || []).length ? '<table class="pc">' + st.concepts.map(function (c) { return "<tr><th>" + esc(c.term) + "</th><td>" + rich(c.desc) + (o.src && (st.sources || [])[c.src] ? ' <sup>[' + (c.src + 1) + "]</sup>" : "") + "</td></tr>"; }).join("") + "</table>" : "") +
          (st.explain || []).map(function (x) { return "<p>" + rich(x) + "</p>"; }).join("") + "</section>";
      }
      LV.forEach(function (l) {
        if (!on[l.key]) return;
        var lv = (st.levels || {})[l.key] || {}, n = 0;
        p += '<section class="ps"><h2>' + l.name + " 단계 <small>" + esc(lv.goal || "") + "</small></h2>";
        if (mid) {
          (lv.blocks || []).forEach(function (b) {
            p += '<div class="pb"><h3>' + esc(b.title || "") + "</h3>";
            var m = b.media || ((b.kind === "image" || b.kind === "svg" || b.kind === "video") ? b : null);
            if (m) { var tp = m.type || m.kind;
              if (tp === "image") p += '<img class="pimg" src="' + esc(m.src || m.url) + '" alt=""><div class="pcap">' + esc((m.caption || "") + (m.source ? " — " + m.source : "") + (m.license ? " (" + m.license + ")" : "")) + "</div>";
              else if (tp === "svg") p += '<div class="psvg">' + cleanSvg(m.svg) + "</div>";
              else if (tp === "video") p += '<div class="pcap">▶ 영상: ' + esc(m.title || "") + " — " + esc(m.url || "") + "</div>"; }
            if (b.text) p += '<div class="pscene">' + rich(b.text) + "</div>";
            (b.think || []).forEach(function (t2) { n++; p += '<div class="pq">' + n + ". " + rich(t2) + "</div>" + (o.lines ? '<div class="plines l3"></div>' : ""); });
            if (b.kind === "activity") { if ((b.steps || []).length) p += "<ol>" + b.steps.map(function (x) { return "<li>" + rich(x) + "</li>"; }).join("") + "</ol>"; if (o.lines) p += '<div class="plines l5"></div>'; if (o.ans && b.sample) p += '<div class="pans"><b>참고 예시</b> ' + rich(b.sample) + "</div>"; }
            p += "</div>";
          });
        } else {
          (lv.items || []).filter(function (it) { return it.kind === "task"; }).forEach(function (it) {
            n++; p += '<div class="pb">' + (it.passage ? '<div class="pscene">' + rich(it.passage) + "</div>" : "") + '<div class="pq">' + n + ". " + rich(it.q) + "</div>" +
              ((it.guide || []).length ? '<div class="pguide">평가 기준: ' + it.guide.map(esc).join(" / ") + "</div>" : "") + (o.lines ? '<div class="plines l6"></div>' : "") +
              (o.ans && it.sample ? '<div class="pans"><b>참고 예시 답안</b> ' + rich(it.sample) + "</div>" : "") + "</div>";
          });
          if (o.kq) {
            var sel = Kichul.select(st, s, r.area)[l.key] || [];
            sel.forEach(function (k) { p += printKq(Kichul.item(k), o.ans); });
          }
        }
        p += "</section>";
      });
      var rub = opts.querySelector("[name=rub]") && opts.querySelector("[name=rub]").checked;
      resList.filter(function (rr) { return rs[rr.id] && rr.kind === "essay"; }).forEach(function (e) {
        var rows = Math.max(6, Math.min(30, Math.ceil((e.maxLen || 600) / 38)));
        p += '<section class="ps"><h2>' + esc(e.etype || "서·논술형") + " — " + esc(e.title) + " <small>배점 " + rubricMax(e) + "점" + (e.minLen || e.maxLen ? " · 공백 포함 " + (e.minLen || 0) + "~" + (e.maxLen || "") + "자" : "") + "</small></h2>" +
          (e.passage ? '<div class="pscene">' + rich(e.passage) + "</div>" : "") + '<div class="pq">' + rich(e.prompt) + "</div>" +
          ((e.conditions || []).length ? '<div class="pguide">조건: ' + e.conditions.map(esc).join(" / ") + "</div>" : "") +
          '<div class="plines" style="height:' + rows * 8 + 'mm"></div>' +
          (rub ? '<table class="pc"><tr><th>채점 항목</th><td><b>채점 내용</b> (배점)</td></tr>' + (e.rubric || []).map(function (rb) { return "<tr><th>" + esc(rb.name) + "</th><td>" + rich(rb.desc) + " (" + rb.max + ")</td></tr>"; }).join("") + "</table>" : "") +
          (o.ans && e.sample ? '<div class="pans"><b>예시 답안</b> ' + rich(e.sample) + "</div>" : "") +
          (e.origin ? '<div class="pcap" style="text-align:left">출처: ' + esc(e.origin) + "</div>" : "") + "</section>";
      });
      resList.filter(function (rr) { return rs[rr.id] && rr.kind !== "essay"; }).forEach(function (rr) {
        p += '<section class="ps"><h2>활동 — ' + esc(rr.title) + ' <small>' + esc(rr.authorName || "") + " 선생님</small></h2>" + (rr.desc ? "<p>" + rich(rr.desc) + "</p>" : "") +
          ((rr.steps || []).length ? "<ol>" + rr.steps.map(function (x) { return "<li>" + rich(x.replace(/^\d+[.)]\s*/, "")) + "</li>"; }).join("") + "</ol>" : "") +
          (rr.questions || []).map(function (x, i) { return '<div class="pq">' + (i + 1) + ". " + rich(x) + "</div>" + (o.lines ? '<div class="plines l4"></div>' : ""); }).join("") +
          (o.ans && rr.sample ? '<div class="pans"><b>참고 예시</b> ' + rich(rr.sample) + "</div>" : "") + "</section>";
      });
      if (o.src && (st.sources || []).length) p += '<footer class="psrc"><b>근거 자료</b> ' + st.sources.map(function (x, i) { return "[" + (i + 1) + "] " + esc(x.t); }).join(" · ") + "</footer>";
      p += '<footer class="pfoot">국어의 모든 것 · 2022 개정 교육과정' + (o.kq ? " · 기출 문항 저작권: 한국교육과정평가원" : "") + "</footer></article>";
      $app.querySelector(".paper-stack").innerHTML = p;
    }
  }
  function printKq(it, ans) {
    if (!it) return "";
    var ex = it.exam.replace("학년도 ", " ").replace("대학수학능력시험", "수능").replace("모의평가", "모평");
    var o = '<div class="pkq">';
    if (it.passage) o += '<div class="ppass">' + (it.passage.fig ? figImgs(it.passage.fig, "지문") : bankBr(it.passage.text, it.passage.brackets)) + "</div>";
    o += '<div class="pq">' + bank(it.stem) + ' <span class="pex">(' + esc(ex) + " " + it.no + "번)</span></div>";
    if (it.fig && it.fig.m === "bogi") o += figImgs(it.fig.f, "보기");
    else if (it.bogi) o += '<div class="bogi">' + bankBr(it.bogi, it.bogiBrackets) + "</div>";
    if (it.fig && it.fig.m === "ch") o += figImgs(it.fig.f, "선택지");
    o += '<ol class="pch">' + [1, 2, 3, 4, 5].map(function (n) { return "<li>" + CIRC[n] + " " + bank(it.choices[n - 1] || "") + "</li>"; }).join("") + "</ol>";
    if (ans) o += '<div class="pans">정답 ' + CIRC[it.answer] + "</div>";
    return o + "</div>";
  }

  /* ───────── 내 정보 ───────── */
  function viewAccount() {
    var u = user(); document.title = "내 정보";
    h(shell("", '<main class="wrap narrow"><h1 class="title">내 정보</h1><p class="sub">' + esc(u.email) + " · " + (u.isTeacher ? "교사" : u.role === "teacher" ? "교사(승인 대기)" : "학생") + (u.isAdmin ? " · 관리자" : "") + "</p>" +
      '<form class="box pad" style="max-width:460px"><label class="field"><span>이름</span><input class="input" name="name" value="' + esc(u.name) + '" required></label>' +
      '<label class="field"><span>학교급</span><select class="input" name="school">' + [["middle", "중학교"], ["high", "고등학교"], ["etc", "기타"]].map(function (o) { return '<option value="' + o[0] + '"' + (u.school === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") +
      '</select></label><button class="btn dark">저장</button></form></main>'));
    var f = $app.querySelector("form");
    f.onsubmit = function (ev) { ev.preventDefault(); var fd = new FormData(f); Auth.updateProfile({ name: String(fd.get("name")).trim(), school: fd.get("school") }).then(function () { toast("저장했습니다."); viewAccount(); }); };
  }
  function notFound() { h(shell("", '<main class="wrap narrow"><div class="empty"><h2 style="margin-bottom:10px">페이지를 찾을 수 없습니다</h2><a class="btn" href="#/">홈으로</a></div></main>')); }

  /* ───────── 라우터 ───────── */
  function route() {
    var raw = location.hash.replace(/^#\/?/, ""), qi = raw.indexOf("?"), q = qi >= 0 ? raw.slice(qi + 1) : "";
    if (qi >= 0) raw = raw.slice(0, qi);
    var p = raw.split("/").map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } });
    /* 다른 갈래(문제은행의 '개념' 링크 등)에서 바로 들어온 주소는 로그인 뒤에 그대로 연다 */
    if (!user() && p[0] && ["login", "signup", "reset"].indexOf(p[0]) < 0) { try { sessionStorage.setItem("kme.next", location.hash); } catch (e) {} }
    /* 로그인 없음 (사이트 전체 로그인은 마지막 단계에서) */
    if (!dataReady) return h('<div class="loading">학습 자료를 펼치는 중…</div>');
    switch (p[0]) {
      case "": case "login": case "signup": case "reset": return viewHome();
      case "school": return viewSchool(p[1]);
      case "subject": return viewSubject(p[1], p[2]);
      case "learn": case "std": return viewLearn(p[1], p[2]);
      case "search": return viewSearch(p.slice(1).join("/"));
      case "my": return viewMy();
      case "teacher": return viewTeacher();
      case "print": return viewPrint(p[1], q);
      case "share": return viewShare();
      case "res": return viewRes(p[1]);
      case "res-new": return viewResEdit(p[1], q);
      case "res-edit": return viewResEdit(null, q, p[1]);
      case "mapping": return viewMapping();
      case "standards": return viewStandards(p[1]);
      case "account": return viewHome();
      default: return notFound();
    }
  }
  document.addEventListener("change", function (e) { if (e.target.matches('[data-act="tv"]')) { Auth.setTeacherView(e.target.checked); toast(e.target.checked ? "교사용 보기를 켰습니다." : "교사용 보기를 껐습니다."); } });
  document.addEventListener("submit", function (e) { var f = e.target.closest("[data-search]"); if (f) { e.preventDefault(); location.hash = "#/search/" + encodeURIComponent(new FormData(f).get("q")); } });
  window.addEventListener("hashchange", route);

  /* ───────── 시작 ───────── */
  function loadData() {
    return Promise.all((window.KOREAN_FILES || []).map(function (f) {
      return new Promise(function (res) { var s = document.createElement("script"); s.src = "data/subjects/" + f; s.onload = res; s.onerror = function () { dataErrors.push(f); res(); }; document.body.appendChild(s); });
    })).then(function () { K.finalize(); dataReady = true; });
  }
  window.addEventListener("error", function (e) { if (e.filename && e.filename.indexOf("/data/subjects/") >= 0) dataErrors.push(e.filename.split("/").pop() + " (" + e.message + ")"); });
  function loadUser() {
    return Auth.loadProgress().then(function (p) {
      p = p || {};
      progress = { done: p.done || {}, recent: p.recent || [], solved: p.solved || {} };
    });
  }
  Auth.onChange(function () { route(); });
  Promise.all([Auth.init(), loadData()]).then(loadUser).then(route).catch(function (e) {
    console.error(e); h('<div class="loading">사이트를 시작하지 못했습니다: ' + esc(e.message) + "</div>");
  });
})();
