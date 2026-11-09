/*
 * 로그인 없이 쓰기 (2026-11-09 v87)
 * - 로그인 화면·Firebase 계정 기능을 뺐다. 학습 기록은 이 브라우저(localStorage)에만 저장된다.
 * - 교사용 내용(성취기준 원문, 지도 유의점, 답 모두 펼치기, 학습지 인쇄, 수업 열기)은 화면 위 '교사용 보기' 스위치로 연다.
 *   누구나 켤 수 있다. 나중에 사이트 전체 로그인이 생기면 교사 계정에만 열리게 바꾼다.
 * - 학급·과제·공유처럼 여러 기기가 함께 쓰는 기능은 그 로그인 단계에서 다시 연다(코드는 남겨 둠).
 *
 * 사용자 객체: { uid, name, role, isTeacher }
 */
(function () {
  var listeners = [];
  var LS_UID = "kme.guest", LS_TV = "kme.teacherView", LS_PROG = "kme.progress.";
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var uid = lsGet(LS_UID, null);
  if (!uid) { uid = "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); lsSet(LS_UID, uid); }
  var current = { uid: uid, name: "", role: "student", isTeacher: false };
  function applyTV() { var on = !!lsGet(LS_TV, false); current.isTeacher = on; current.role = on ? "teacher" : "student"; document.documentElement.classList.toggle("tv-on", on); }
  applyTV();
  function emit() { listeners.forEach(function (f) { try { f(current); } catch (e) { console.error(e); } }); }

  /* 여러 기기가 함께 쓰는 자료(학급·과제·공유 자료)는 지금은 이 브라우저에만 둔다 */
  var KEY = "kme.db.";
  function all(col) { return lsGet(KEY + col, {}); }
  function put(col, map) { lsSet(KEY + col, map); }
  window.DB = {
    get: function (col, id) { var m = all(col); return Promise.resolve(m[id] ? Object.assign({ id: id }, m[id]) : null); },
    set: function (col, id, data) { var m = all(col); m[id] = data; put(col, m); return Promise.resolve(); },
    update: function (col, id, part) { var m = all(col); m[id] = Object.assign(m[id] || {}, part); put(col, m); return Promise.resolve(); },
    remove: function (col, id) { var m = all(col); delete m[id]; put(col, m); return Promise.resolve(); },
    list: function (col) { var m = all(col); return Promise.resolve(Object.keys(m).map(function (id) { return Object.assign({ id: id }, m[id]); })); },
    where: function (col, f, v, f2, v2) {
      return this.list(col).then(function (l) { return l.filter(function (x) { return x[f] === v && (!f2 || x[f2] === v2); }); });
    }
  };
  /* 교사가 만든 활동에 붙이는 파일: 브라우저에 data URL로(2MB까지) */
  window.FileStore = {
    limit: 2 * 1024 * 1024,
    put: function (file) {
      if (file.size > window.FileStore.limit) return Promise.reject(new Error("파일이 너무 큽니다(최대 2MB)."));
      return new Promise(function (res, rej) {
        var r = new FileReader();
        r.onload = function () { res({ url: r.result, name: file.name, type: file.type, size: file.size }); };
        r.onerror = function () { rej(new Error("파일을 읽지 못했습니다.")); };
        r.readAsDataURL(file);
      });
    }
  };

  window.Auth = {
    mode: "open",
    init: function () { return Promise.resolve(); },
    onChange: function (f) { listeners.push(f); },
    current: function () { return current; },
    teacherView: function () { return current.isTeacher; },
    setTeacherView: function (on) { lsSet(LS_TV, !!on); applyTV(); emit(); },
    loadProgress: function () { return Promise.resolve(lsGet(LS_PROG + uid, {})); },
    saveProgress: function (p) { lsSet(LS_PROG + uid, p); return Promise.resolve(); },
    signOut: function () { return Promise.resolve(); }
  };
  /* 예전 체험 모드에서 쓰던 학습 기록이 있으면 한 번 옮겨 온다 */
  try {
    var sid = lsGet("kme.session", null);
    if (sid && !localStorage.getItem(LS_PROG + uid) && localStorage.getItem(LS_PROG + sid)) localStorage.setItem(LS_PROG + uid, localStorage.getItem(LS_PROG + sid));
  } catch (e) {}
})();
