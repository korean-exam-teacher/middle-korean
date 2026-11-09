/*
 * 사이트 설정
 * ─────────────────────────────────────────────
 * 1) FIREBASE_CONFIG 가 null 이면 "로컬 체험 모드"로 동작합니다.
 *    계정과 학습 기록이 지금 쓰는 브라우저에만 저장됩니다(실제 서비스용 아님).
 * 2) 실제로 교사·학생이 로그인해서 쓰게 하려면 Firebase 프로젝트를 만들고
 *    (Authentication: 이메일/비밀번호 사용 설정, Firestore 데이터베이스 생성)
 *    웹 앱 설정 값을 아래에 붙여 넣으세요. 자세한 순서는 README.md 참고.
 * 3) ADMIN_EMAILS 에 적힌 계정은 관리자입니다. 교사 가입 신청을 승인할 수 있습니다.
 *    firestore.rules 안의 관리자 이메일도 같은 값으로 맞춰 주세요.
 */
window.SITE_CONFIG = {
  siteName: "국어의 모든 것",

  FIREBASE_CONFIG: null,
  /* 예시:
  FIREBASE_CONFIG: {
    apiKey: "...",
    authDomain: "프로젝트ID.firebaseapp.com",
    projectId: "프로젝트ID",
    appId: "..."
  },
  */

  ADMIN_EMAILS: [],

  /* 기출 데이터를 어디서 읽을지 (2026-11-09 추가)
   * 문제은행(불휘 기픈 남ᄀᆞᆫ)이 올려 둔 최신 데이터(data/kb.js, data/kb_explain.js, fig/)를 바로 읽는다.
   * 문제은행에서 고치면 여기에도 바로 반영된다. 읽지 못하면 이 폴더의 data/kichul/ 사본을 쓴다.
   * 사본만 쓰려면 "" 로 비운다. */
  KICHUL_BASE: "https://korean-exam-teacher.github.io/suneung-korean/"
};
