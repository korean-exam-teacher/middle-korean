/*
 * 사이트 설정 (2026-11-09 v87)
 * ─────────────────────────────────────────────
 * - 로그인은 없습니다. 학습 기록은 각자 브라우저에 저장되고, 교사용 내용은 화면 위 '교사용 보기' 스위치로 엽니다.
 *   (사이트 전체가 완성되면 첫 화면에 로그인 하나를 만들어 모든 단계를 함께 쓰게 할 예정)
 *
 * - LIVE_FIREBASE: 수업 코드(교사 화면 따라가기·교사 메모)를 여러 기기 사이에서 쓰려면
 *   Firebase 프로젝트의 웹 앱 설정 값을 넣습니다. 계정용이 아니라 이 실시간 연결에만 씁니다.
 *   비워 두면(null) 같은 컴퓨터의 다른 창끼리만 연결됩니다(확인용). 순서는 README.md '수업 코드 연결' 참고.
 *   예) LIVE_FIREBASE: { apiKey: "...", authDomain: "프로젝트ID.firebaseapp.com", projectId: "프로젝트ID", appId: "..." },
 *
 * - KICHUL_BASE: 기출 데이터를 문제은행(2단계)에서 바로 읽습니다. 못 읽으면 data/kichul/ 사본을 씁니다.
 */
window.SITE_CONFIG = {
  siteName: "국어의 모든 것",
  LIVE_FIREBASE: null,
  KICHUL_BASE: "https://korean-exam-teacher.github.io/suneung-korean/"
};
