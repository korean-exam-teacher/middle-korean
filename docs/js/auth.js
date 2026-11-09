/*
 * 로그인·회원 관리 + 학습 기록 저장
 * - firebase 모드: Firebase Authentication + Cloud Firestore
 * - local 모드: 브라우저 localStorage (체험용)
 *
 * 사용자 객체: { uid, name, email, role: "student"|"teacher", school, approved, isAdmin }
 * 교사 권한은 role === "teacher" && approved 일 때만 적용됩니다.
 */
(function () {
  var cfg = window.SITE_CONFIG || {};
  var listeners = [];
  var current = null;
  var ready = false;

  function emit() { listeners.forEach(function (f) { try { f(current); } catch (e) { console.error(e); } }); }
  function isAdminEmail(email) {
    return (cfg.ADMIN_EMAILS || []).map(function (e) { return e.toLowerCase(); }).indexOf((email || "").toLowerCase()) >= 0;
  }
  function decorate(u) {
    if (!u) return null;
    u.isAdmin = isAdminEmail(u.email);
    if (u.isAdmin) u.approved = true;
    u.isTeacher = u.role === "teacher" && !!u.approved;
    return u;
  }
  function errMsg(e) {
    var c = (e && e.code) || "";
    var map = {
      "auth/invalid-email": "이메일 형식이 올바르지 않습니다.",
      "auth/user-not-found": "가입되지 않은 이메일입니다.",
      "auth/wrong-password": "비밀번호가 맞지 않습니다.",
      "auth/invalid-credential": "이메일 또는 비밀번호가 맞지 않습니다.",
      "auth/invalid-login-credentials": "이메일 또는 비밀번호가 맞지 않습니다.",
      "auth/email-already-in-use": "이미 가입된 이메일입니다.",
      "auth/weak-password": "비밀번호는 6자 이상이어야 합니다.",
      "auth/too-many-requests": "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
      "auth/network-request-failed": "네트워크에 연결할 수 없습니다."
    };
    return map[c] || (e && e.message) || "알 수 없는 오류가 발생했습니다.";
  }

  /* ───────────── local 모드 ───────────── */
  var LS_USERS = "kme.users", LS_SESSION = "kme.session", LS_PROG = "kme.progress.";
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function hash(s) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode("kme:" + s)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      });
    }
    var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return Promise.resolve("w" + (h >>> 0).toString(16));
  }
  function pub(u) { return decorate({ uid: u.uid, name: u.name, email: u.email, role: u.role, school: u.school, approved: u.approved }); }

  var Local = {
    mode: "local",
    init: function () {
      var sid = lsGet(LS_SESSION, null);
      var users = lsGet(LS_USERS, []);
      var u = users.filter(function (x) { return x.uid === sid; })[0];
      current = u ? pub(u) : null;
      return Promise.resolve();
    },
    signIn: function (email, pw) {
      email = (email || "").trim().toLowerCase();
      return hash(pw).then(function (h) {
        var u = lsGet(LS_USERS, []).filter(function (x) { return x.email === email; })[0];
        if (!u) throw { code: "auth/user-not-found" };
        if (u.pw !== h) throw { code: "auth/wrong-password" };
        lsSet(LS_SESSION, u.uid); current = pub(u); emit();
      });
    },
    signUp: function (d) {
      var email = (d.email || "").trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Promise.reject({ code: "auth/invalid-email" });
      if ((d.password || "").length < 6) return Promise.reject({ code: "auth/weak-password" });
      var users = lsGet(LS_USERS, []);
      if (users.some(function (x) { return x.email === email; })) return Promise.reject({ code: "auth/email-already-in-use" });
      return hash(d.password).then(function (h) {
        var u = { uid: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: d.name, email: email, pw: h,
          role: d.role, school: d.school, approved: true /* 체험 모드에서는 교사도 바로 승인 */, createdAt: Date.now() };
        users.push(u); lsSet(LS_USERS, users); lsSet(LS_SESSION, u.uid); current = pub(u); emit();
      });
    },
    signOut: function () { localStorage.removeItem(LS_SESSION); current = null; emit(); return Promise.resolve(); },
    resetPassword: function () { return Promise.reject({ message: "체험 모드에서는 비밀번호 재설정 메일을 보낼 수 없습니다." }); },
    updateProfile: function (p) {
      var users = lsGet(LS_USERS, []);
      users.forEach(function (x) { if (x.uid === current.uid) { x.name = p.name; x.school = p.school; } });
      lsSet(LS_USERS, users); current.name = p.name; current.school = p.school; emit();
      return Promise.resolve();
    },
    loadProgress: function () { return Promise.resolve(lsGet(LS_PROG + current.uid, {})); },
    saveProgress: function (p) { lsSet(LS_PROG + current.uid, p); return Promise.resolve(); },
    listUsers: function () { return Promise.resolve(lsGet(LS_USERS, []).map(pub)); },
    setApproved: function (uid, v) {
      var users = lsGet(LS_USERS, []);
      users.forEach(function (x) { if (x.uid === uid) x.approved = v; });
      lsSet(LS_USERS, users); return Promise.resolve();
    }
  };

  /* ───────────── firebase 모드 ───────────── */
  var FB_VER = "10.12.5";
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.onload = res;
      s.onerror = function () { rej(new Error("스크립트를 불러오지 못했습니다: " + src)); };
      document.head.appendChild(s);
    });
  }
  var auth, db;
  var Firebase = {
    mode: "firebase",
    init: function () {
      var base = "https://www.gstatic.com/firebasejs/" + FB_VER + "/";
      return loadScript(base + "firebase-app-compat.js")
        .then(function () { return Promise.all([loadScript(base + "firebase-auth-compat.js"), loadScript(base + "firebase-firestore-compat.js"), loadScript(base + "firebase-storage-compat.js")]); })
        .then(function () {
          firebase.initializeApp(cfg.FIREBASE_CONFIG);
          auth = firebase.auth(); db = firebase.firestore();
          return new Promise(function (res) {
            var first = true;
            auth.onAuthStateChanged(function (fu) {
              var p = fu ? Firebase._profile(fu) : Promise.resolve(null);
              p.then(function (u) { current = u; if (first) { first = false; res(); } else emit(); });
            });
          });
        });
    },
    _profile: function (fu) {
      return db.collection("users").doc(fu.uid).get().then(function (snap) {
        var d = snap.exists ? snap.data() : { name: fu.email, role: "student", school: "", approved: false };
        return decorate({ uid: fu.uid, email: fu.email, name: d.name, role: d.role, school: d.school, approved: !!d.approved });
      }).catch(function (e) {
        console.error(e);
        return decorate({ uid: fu.uid, email: fu.email, name: fu.email, role: "student", school: "", approved: false });
      });
    },
    signIn: function (email, pw) {
      return auth.signInWithEmailAndPassword(email.trim(), pw).then(function (cred) {
        return Firebase._profile(cred.user).then(function (u) { current = u; emit(); });
      });
    },
    signUp: function (d) {
      var created;
      return auth.createUserWithEmailAndPassword(d.email.trim(), d.password).then(function (cred) {
        created = cred.user;
        return db.collection("users").doc(created.uid).set({
          name: d.name, email: d.email.trim().toLowerCase(), role: d.role, school: d.school,
          approved: d.role === "student", createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }).then(function () { return Firebase._profile(created); }).then(function (u) { current = u; emit(); });
    },
    signOut: function () { return auth.signOut().then(function () { current = null; emit(); }); },
    resetPassword: function (email) { return auth.sendPasswordResetEmail(email.trim()); },
    updateProfile: function (p) {
      return db.collection("users").doc(current.uid).update({ name: p.name, school: p.school }).then(function () {
        current.name = p.name; current.school = p.school; emit();
      });
    },
    loadProgress: function () {
      return db.collection("progress").doc(current.uid).get().then(function (s) { return s.exists ? (s.data().done || {}) : {}; })
        .catch(function () { return {}; });
    },
    saveProgress: function (p) {
      return db.collection("progress").doc(current.uid).set({ done: p, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    },
    listUsers: function () {
      return db.collection("users").get().then(function (qs) {
        var out = []; qs.forEach(function (doc) { var d = doc.data(); out.push(decorate({ uid: doc.id, name: d.name, email: d.email, role: d.role, school: d.school, approved: !!d.approved })); });
        return out;
      });
    },
    setApproved: function (uid, v) { return db.collection("users").doc(uid).update({ approved: v }); }
  };

  /* ───────── 문서 저장소: 학급·과제·제출물 ─────────
   * DB.get(col, id) / DB.set(col, id, data) / DB.update(col, id, part) / DB.remove(col, id)
   * DB.where(col, field, value) → [{id, ...data}]
   */
  var LocalDB = {
    _all: function (col) { return lsGet("kme.db." + col, {}); },
    _save: function (col, m) { lsSet("kme.db." + col, m); },
    get: function (col, id) { var d = LocalDB._all(col)[id]; return Promise.resolve(d ? Object.assign({ id: id }, d) : null); },
    set: function (col, id, data) { var m = LocalDB._all(col); m[id] = JSON.parse(JSON.stringify(data)); LocalDB._save(col, m); return Promise.resolve(); },
    update: function (col, id, part) { var m = LocalDB._all(col); m[id] = Object.assign(m[id] || {}, JSON.parse(JSON.stringify(part))); LocalDB._save(col, m); return Promise.resolve(); },
    remove: function (col, id) { var m = LocalDB._all(col); delete m[id]; LocalDB._save(col, m); return Promise.resolve(); },
    list: function (col) { var m = LocalDB._all(col); return Promise.resolve(Object.keys(m).map(function (id) { return Object.assign({ id: id }, m[id]); })); },
    where: function (col, f, v, f2, v2) {
      var m = LocalDB._all(col), out = [];
      Object.keys(m).forEach(function (id) { if (m[id][f] === v && (!f2 || m[id][f2] === v2)) out.push(Object.assign({ id: id }, m[id])); });
      return Promise.resolve(out);
    }
  };
  var FireDB = {
    get: function (col, id) { return db.collection(col).doc(id).get().then(function (s) { return s.exists ? Object.assign({ id: s.id }, s.data()) : null; }); },
    set: function (col, id, data) { return db.collection(col).doc(id).set(data); },
    update: function (col, id, part) { return db.collection(col).doc(id).set(part, { merge: true }); },
    remove: function (col, id) { return db.collection(col).doc(id).delete(); },
    list: function (col) { return db.collection(col).get().then(function (qs) { var out = []; qs.forEach(function (d) { out.push(Object.assign({ id: d.id }, d.data())); }); return out; }); },
    where: function (col, f, v, f2, v2) {
      var q = db.collection(col).where(f, "==", v);
      if (f2) q = q.where(f2, "==", v2);
      return q.get().then(function (qs) { var out = []; qs.forEach(function (d) { out.push(Object.assign({ id: d.id }, d.data())); }); return out; });
    }
  };
  window.DB = cfg.FIREBASE_CONFIG ? FireDB : LocalDB;

  /* ───────── 파일 저장: 교사가 올린 학습지 ─────────
   * FileStore.put(file) → { url, name, type, size }
   * 체험 모드: 브라우저에 data URL로 저장(용량 한계 때문에 2MB까지)
   * Firebase: Cloud Storage(resources/<uid>/...)에 올리고 내려받기 주소를 돌려준다
   */
  window.FileStore = {
    limit: cfg.FIREBASE_CONFIG ? 20 * 1024 * 1024 : 2 * 1024 * 1024,
    put: function (file) {
      if (file.size > window.FileStore.limit) return Promise.reject(new Error("파일이 너무 큽니다(최대 " + Math.round(window.FileStore.limit / 1048576) + "MB)."));
      if (cfg.FIREBASE_CONFIG) {
        var ref = firebase.storage().ref("resources/" + current.uid + "/" + Date.now() + "_" + file.name.replace(/[^\w.가-힣-]/g, "_"));
        return ref.put(file, { contentType: file.type }).then(function () { return ref.getDownloadURL(); })
          .then(function (url) { return { url: url, name: file.name, type: file.type, size: file.size }; });
      }
      return new Promise(function (res, rej) {
        var r = new FileReader();
        r.onload = function () { res({ url: r.result, name: file.name, type: file.type, size: file.size }); };
        r.onerror = function () { rej(new Error("파일을 읽지 못했습니다.")); };
        r.readAsDataURL(file);
      });
    }
  };

  var impl = cfg.FIREBASE_CONFIG ? Firebase : Local;

  window.Auth = {
    mode: impl.mode,
    init: function () { return impl.init().then(function () { ready = true; }); },
    onChange: function (f) { listeners.push(f); },
    current: function () { return current; },
    signIn: function (e, p) { return impl.signIn(e, p).catch(function (e) { throw new Error(errMsg(e)); }); },
    signUp: function (d) { return impl.signUp(d).catch(function (e) { throw new Error(errMsg(e)); }); },
    signOut: function () { return impl.signOut(); },
    resetPassword: function (e) { return impl.resetPassword(e).catch(function (e) { throw new Error(errMsg(e)); }); },
    updateProfile: function (p) { return impl.updateProfile(p); },
    loadProgress: function () { return impl.loadProgress(); },
    saveProgress: function (p) { return impl.saveProgress(p); },
    listUsers: function () { return impl.listUsers(); },
    setApproved: function (u, v) { return impl.setApproved(u, v); }
  };
})();
