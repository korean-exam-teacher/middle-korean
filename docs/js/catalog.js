/* 과목 목록(2022 개정 국어과 교육과정)과 데이터 등록소 */
(function () {
  var SUBJECTS = [
    { id: "ms-korean",         school: "middle", kind: "공통 교육과정", name: "국어",            grade: "중학교 1~3학년", desc: "듣기·말하기, 읽기, 쓰기, 문법, 문학, 매체의 여섯 영역을 중학교 수준에서 다룹니다." },
    { id: "hs-common1",        school: "common", kind: "공통 과목",     name: "공통국어1",        grade: "고등학교 1학년", desc: "고등학교 국어 학습의 기초가 되는 공통 과목(1학기)." },
    { id: "hs-common2",        school: "common", kind: "공통 과목",     name: "공통국어2",        grade: "고등학교 1학년", desc: "공통국어1에 이어지는 공통 과목(2학기)." },
    { id: "hs-speech-lang",    school: "elective", kind: "일반 선택",   name: "화법과 언어",      grade: "고등학교 2~3학년", desc: "화법의 원리와 국어의 체계를 통합적으로 탐구합니다." },
    { id: "hs-read-write",     school: "elective", kind: "일반 선택",   name: "독서와 작문",      grade: "고등학교 2~3학년", desc: "읽기와 쓰기를 연계하여 깊이 있게 읽고 쓰는 능력을 기릅니다." },
    { id: "hs-literature",     school: "elective", kind: "일반 선택",   name: "문학",            grade: "고등학교 2~3학년", desc: "한국 문학의 흐름과 작품을 감상·비평·창작합니다." },
    { id: "hs-topic-reading",  school: "elective", kind: "진로 선택",   name: "주제 탐구 독서",   grade: "고등학교 2~3학년", desc: "관심 주제를 정해 여러 글을 탐구적으로 읽습니다." },
    { id: "hs-lit-media",      school: "elective", kind: "진로 선택",   name: "문학과 영상",      grade: "고등학교 2~3학년", desc: "문학과 영상의 관계를 이해하고 감상·창작합니다." },
    { id: "hs-job-comm",       school: "elective", kind: "진로 선택",   name: "직무 의사소통",    grade: "고등학교 2~3학년", desc: "직무 상황에서 필요한 의사소통 능력을 기릅니다." },
    { id: "hs-reading-debate", school: "elective", kind: "융합 선택",   name: "독서 토론과 글쓰기", grade: "고등학교 2~3학년", desc: "책을 읽고 토론하며 생각을 글로 표현합니다." },
    { id: "hs-media-comm",     school: "elective", kind: "융합 선택",   name: "매체 의사소통",    grade: "고등학교 2~3학년", desc: "매체 환경에서의 비판적 수용과 소통 능력을 기릅니다." },
    { id: "hs-lang-life",      school: "elective", kind: "융합 선택",   name: "언어생활 탐구",    grade: "고등학교 2~3학년", desc: "실제 언어생활의 문제를 탐구하고 개선합니다." }
  ];
  var SCHOOLS = [
    { id: "middle",   name: "중학교",              note: "1~3학년군 국어" },
    { id: "common",   name: "고등학교 공통 과목",   note: "공통국어1·2" },
    { id: "elective", name: "고등학교 선택 과목",   note: "일반·진로·융합 선택" }
  ];

  var byId = {};
  SUBJECTS.forEach(function (s) { s.areas = []; byId[s.id] = s; });

  var stdIndex = {};   // code -> { std, subject, area }
  var stdOrder = [];   // 전체 순서

  window.KOREAN = {
    SUBJECTS: SUBJECTS,
    SCHOOLS: SCHOOLS,
    subject: function (id) { return byId[id]; },
    addArea: function (subjectId, area) {
      var s = byId[subjectId];
      if (!s) { console.warn("알 수 없는 과목:", subjectId); return; }
      var ex = null;
      for (var i = 0; i < s.areas.length; i++) if (s.areas[i].code === area.code) ex = s.areas[i];
      if (ex) {
        ex.standards = ex.standards.concat(area.standards || []);
        if (!ex.intro && area.intro) ex.intro = area.intro;
      } else {
        s.areas.push({ code: area.code, name: area.name, intro: area.intro || "", standards: (area.standards || []).slice() });
      }
    },
    /* 모든 데이터 로드 후 정렬·색인 */
    finalize: function () {
      stdIndex = {}; stdOrder = [];
      SUBJECTS.forEach(function (s) {
        s.areas.sort(function (a, b) { return a.code < b.code ? -1 : 1; });
        s.count = 0;
        s.areas.forEach(function (a) {
          a.standards.sort(function (x, y) { return cmpCode(x.code, y.code); });
          a.standards.forEach(function (std) {
            stdIndex[std.code] = { std: std, subject: s, area: a };
            stdOrder.push(std.code);
            s.count++;
          });
        });
      });
    },
    find: function (code) { return stdIndex[code]; },
    order: function () { return stdOrder; },
    all: function () { return stdOrder.map(function (c) { return stdIndex[c]; }); }
  };

  function cmpCode(a, b) {
    var na = (a.match(/\d+/g) || []).map(Number), nb = (b.match(/\d+/g) || []).map(Number);
    for (var i = 0; i < Math.max(na.length, nb.length); i++) {
      var d = (na[i] || 0) - (nb[i] || 0);
      if (d) return d;
    }
    return a < b ? -1 : a > b ? 1 : 0;
  }
})();
