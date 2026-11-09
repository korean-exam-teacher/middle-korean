KOREAN.addArea("ms-korean", {
  code: "01",
  name: "듣기·말하기",
  intro: "듣기·말하기는 말하는 이와 듣는 이가 함께 의미를 만들어 가는 소통 활동이다. 중학교에서는 말하는 이의 의도와 설득 전략을 따져 들으며, 대화·면담·발표·토의·토론처럼 여러 담화에서 상대와 상황에 맞게 효과적이고 윤리적으로 말하는 힘을 기른다.",
  standards: [
    {
      code: "[9국01-01]",
      text: "화자의 의도와 관점을 추론하며 듣는다.",
      verified: true,
      checked: "2026-11-09",
      sources: [
        { t: "표준국어대사전 '의도(意圖)'", u: "https://stdict.korean.go.kr/search/searchResult.do?pageSize=10&searchKeyword=%EC%9D%98%EB%8F%84", k: "사전" },
        { t: "표준국어대사전 '관점(觀點)'", u: "https://stdict.korean.go.kr/search/searchResult.do?pageSize=10&searchKeyword=%EA%B4%80%EC%A0%90", k: "사전" },
        { t: "표준국어대사전 '추론(推論)'", u: "https://stdict.korean.go.kr/search/searchResult.do?pageSize=10&searchKeyword=%EC%B6%94%EB%A1%A0", k: "사전" },
        { t: "2022 개정 국어과 교육과정(교육부 고시 제2022-33호 [별책 5]) [9국01-01] 성취기준 해설", u: "https://www.cku.ac.kr/bbs/korean/907/71198/download.do", k: "교육과정" },
        { t: "2022 개정 국어과 교육과정(교육부 고시 제2022-33호 [별책 5]) [4국01-03] 성취기준 해설(준언어적·비언어적 표현)", u: "https://www.cku.ac.kr/bbs/korean/907/71198/download.do", k: "교육과정" }
      ],
      title: "말하는 이의 의도와 관점",
      keywords: ["의도", "관점", "추론", "맥락", "비언어적 표현"],
      explain: [
        "말하는 이는 하고 싶은 말을 언제나 직접 드러내지는 않는다. 그래서 듣는 이는 들리는 말의 내용뿐 아니라 그 말을 **왜** 하는지(의도), 대상을 **어떤 입장에서** 바라보는지(관점)를 미루어 짐작하며 들어야 한다.",
        "**의도**는 무엇을 하고자 하는 생각이나 계획으로, 듣기에서는 말하는 이가 말을 통해 이루려는 목적을 가리킨다. '창문 쪽이 좀 춥네.'라는 말은 사실을 알리는 말처럼 보이지만, 상황에 따라서는 창문을 닫아 달라는 요청일 수 있다. **관점**은 사물이나 현상을 볼 때 그 사람이 보고 생각하는 태도나 방향, 처지로, 같은 사건이라도 누가 말하느냐에 따라 강조하는 점과 평가가 달라진다.",
        "의도와 관점을 추론할 때에는 담화의 상황 맥락, 반복하거나 강조하는 말, 고른 낱말의 느낌, 억양·어조·속도 같은 준언어적 표현, 표정·시선·몸동작 같은 비언어적 표현을 단서로 삼는다. 이렇게 하면 말하는 이의 숨겨진 의도와 관점, 가치관까지 짐작할 수 있다. 추론한 내용은 근거와 함께 확인해야 하며, 근거 없는 짐작은 오해를 낳는다."
      ],
      concepts: [
        { term: "의도", desc: "무엇을 하고자 하는 생각이나 계획. 듣기에서는 말하는 이가 말을 통해 이루려는 목적을 뜻하며, 정보 전달·설득 같은 담화의 목적과 이어진다.", src: 0 },
        { term: "관점", desc: "사물이나 현상을 볼 때 그 사람이 보고 생각하는 태도나 방향 또는 처지. 같은 사실도 관점에 따라 다르게 평가된다.", src: 1 },
        { term: "추론", desc: "미루어 생각하여 논함. 듣기에서는 드러난 말과 상황 맥락을 근거로 겉으로 드러나지 않은 의도나 관점을 짐작하는 일이다.", src: 2 },
        { term: "준언어적 표현", desc: "억양, 어조, 속도처럼 말소리에 실려 뜻을 전하는 요소.", src: 4 },
        { term: "비언어적 표현", desc: "표정, 시선, 몸동작, 자세처럼 말 없이 뜻을 전하는 요소.", src: 4 }
      ],
      levels: {
        basic: {
          goal: "여러 장면을 보고 말 속에 숨은 목적과 시각이 있다는 것을 스스로 발견한다.",
          points: ["겉으로 한 말과 속뜻이 다른 장면 찾기", "같은 대상을 다르게 말하는 장면 비교하기", "속뜻을 알아챈 단서 모으기"],
          blocks: [
            { kind: "video", title: "대한민국 듣기평가 편", url: "https://www.youtube.com/watch?v=U2NwHnKNwY8", source: "KOBACO 공익광고협의회", note: "60초 공익 광고. 광고 속 사람들이 정말 '들은' 것은 무엇인지, 말한 사람이 바란 것은 무엇이었는지 생각하며 본다." },
            { kind: "case", title: "사례 1. 창문 쪽이 좀 춥네", media: { type: "svg", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><rect x='300' y='20' width='80' height='90' fill='#fff' stroke='#333' stroke-width='2'/><line x1='340' y1='20' x2='340' y2='110' stroke='#333'/><path d='M310 40 q10 -6 20 0 M310 60 q10 -6 20 0' stroke='#9ab' fill='none' stroke-width='2'/><circle cx='90' cy='120' r='16' fill='#fff' stroke='#333' stroke-width='2'/><path d='M66 190 Q90 140 114 190 Z' fill='#e8f3ec' stroke='#333' stroke-width='2'/><circle cx='230' cy='120' r='16' fill='#fff' stroke='#333' stroke-width='2'/><path d='M206 190 Q230 140 254 190 Z' fill='#eee' stroke='#333' stroke-width='2'/><rect x='20' y='20' width='170' height='50' rx='12' fill='#fff' stroke='#333' stroke-width='1.5'/><text x='105' y='50' font-size='14' text-anchor='middle' fill='#333'>창문 쪽이 좀 춥네…</text><text x='230' y='90' font-size='18' text-anchor='middle' fill='#2e7d4f'>?</text></svg>" }, text: "할머니께서 창가 쪽 의자에 앉으시며 어깨를 움츠리고 말씀하신다. '창문 쪽이 좀 춥네…….'", think: ["할머니는 날씨를 알려 주려고 이 말을 하셨을까?", "손자가 어떻게 반응하면 할머니가 가장 반가워하실까?"] },
            { kind: "case", title: "사례 2. 시험 끝난 날 친구의 한마디", text: "민지가 시험지를 가방에 넣으며 작은 목소리로 말한다. '나 이번엔 진짜 열심히 했거든…….' 그리고 한숨을 쉬며 창밖만 바라본다.", think: ["민지의 말만 보면 기쁜 말일까, 속상한 말일까?", "그렇게 생각한 까닭은 말의 어느 부분, 어떤 몸짓 때문인가?"] },
            { kind: "case", title: "사례 3. 같은 공원, 다른 말", media: { type: "svg", svg: "<svg viewBox='0 0 400 210' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='210' fill='#f6f7f6'/><rect x='150' y='70' width='100' height='60' rx='8' fill='#e8f3ec' stroke='#333'/><text x='200' y='97' font-size='13' text-anchor='middle' fill='#333'>동네 공원에</text><text x='200' y='115' font-size='13' text-anchor='middle' fill='#333'>주차장 건설</text><rect x='10' y='10' width='140' height='56' rx='10' fill='#fff' stroke='#333'/><text x='80' y='34' font-size='12' text-anchor='middle' fill='#333'>드디어 주차 걱정</text><text x='80' y='52' font-size='12' text-anchor='middle' fill='#333'>끝이네요!</text><text x='80' y='84' font-size='11' text-anchor='middle' fill='#555'>차를 모는 주민</text><rect x='250' y='10' width='140' height='56' rx='10' fill='#fff' stroke='#333'/><text x='320' y='34' font-size='12' text-anchor='middle' fill='#333'>아이들 놀 곳이</text><text x='320' y='52' font-size='12' text-anchor='middle' fill='#333'>또 줄어드네요.</text><text x='320' y='84' font-size='11' text-anchor='middle' fill='#555'>아이를 키우는 주민</text><rect x='120' y='150' width='160' height='50' rx='10' fill='#fff' stroke='#333'/><text x='200' y='172' font-size='12' text-anchor='middle' fill='#333'>나무를 베어야 한다니</text><text x='200' y='190' font-size='12' text-anchor='middle' fill='#333'>안타깝습니다.</text><text x='60' y='180' font-size='11' text-anchor='middle' fill='#555'>환경 단체 회원</text></svg>" }, text: "같은 계획을 두고 세 사람이 서로 다른 말을 한다.", think: ["세 사람은 공원 주차장을 무엇을 기준으로 바라보고 있을까?", "누가 말하느냐에 따라 같은 일이 어떻게 달라 보이는가?"] },
            { kind: "note", title: "발견한 개념", text: "사례 1·2처럼 말에는 겉으로 드러난 뜻 너머에 말하는 이가 이루고 싶은 목적, 곧 **의도**가 숨어 있다. 사례 3처럼 같은 대상도 말하는 이의 처지와 생각에 따라 다르게 보이는데, 이 시각이 **관점**이다. 우리는 상황, 강조한 말, 낱말의 느낌, 말투와 표정을 단서로 의도와 관점을 **추론**한다." }
          ]
        },
        advanced: {
          goal: "여러 담화를 비교하며 의도와 관점을 추론하는 단서와 그 근거를 분석한다.",
          points: ["언어·준언어·비언어 단서 구분하기", "추론과 근거 없는 짐작 구별하기"],
          blocks: [
            { kind: "svg", title: "추론의 단서 세 갈래", svg: "<svg viewBox='0 0 400 190' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='190' fill='#f6f7f6'/><rect x='140' y='10' width='120' height='40' rx='10' fill='#2e7d4f'/><text x='200' y='35' font-size='14' text-anchor='middle' fill='#fff'>의도·관점 추론</text><line x1='200' y1='50' x2='70' y2='90' stroke='#333'/><line x1='200' y1='50' x2='200' y2='90' stroke='#333'/><line x1='200' y1='50' x2='330' y2='90' stroke='#333'/><rect x='10' y='90' width='120' height='90' rx='8' fill='#fff' stroke='#333'/><text x='70' y='112' font-size='13' text-anchor='middle' fill='#2e7d4f'>언어적 단서</text><text x='70' y='134' font-size='11' text-anchor='middle' fill='#333'>반복·강조한 말</text><text x='70' y='152' font-size='11' text-anchor='middle' fill='#333'>낱말의 느낌</text><text x='70' y='170' font-size='11' text-anchor='middle' fill='#333'>말하지 않은 것</text><rect x='140' y='90' width='120' height='90' rx='8' fill='#fff' stroke='#333'/><text x='200' y='112' font-size='13' text-anchor='middle' fill='#2e7d4f'>준언어적 단서</text><text x='200' y='134' font-size='11' text-anchor='middle' fill='#333'>억양·높낮이</text><text x='200' y='152' font-size='11' text-anchor='middle' fill='#333'>말의 빠르기</text><text x='200' y='170' font-size='11' text-anchor='middle' fill='#333'>목소리 크기</text><rect x='270' y='90' width='120' height='90' rx='8' fill='#fff' stroke='#333'/><text x='330' y='112' font-size='13' text-anchor='middle' fill='#2e7d4f'>비언어적 단서</text><text x='330' y='134' font-size='11' text-anchor='middle' fill='#333'>표정·시선</text><text x='330' y='152' font-size='11' text-anchor='middle' fill='#333'>몸짓·자세</text><text x='330' y='170' font-size='11' text-anchor='middle' fill='#333'>상황·장소</text></svg>", caption: "말의 속뜻을 짐작할 때 쓰는 단서를 세 갈래로 정리했다." },
            { kind: "case", title: "비교 자료 1. 교실 뒤편의 쓰레기", text: "(점심시간, 교실 뒤편에 쓰레기가 흩어져 있다.)\n반장: 얘들아, 오후에 교감 선생님께서 우리 반 수업을 보러 오신대. 그런데 교실 뒤쪽이 좀……. (쓰레기통 쪽을 바라보며 한숨을 쉰다.)", think: ["반장이 끝까지 말하지 않은 내용은 무엇일까?", "그렇게 짐작하게 하는 단서를 세 갈래(언어·준언어·비언어)로 나누어 찾아보자."] },
            { kind: "case", title: "비교 자료 2. 횡단보도 신호 시간 인터뷰", text: "학부모: 아이들 걸음으로는 신호가 바뀌기 전에 다 건너기가 어려워요. 위험한 순간을 여러 번 봤습니다.\n운전자: 신호가 길어지면 출근길 정체가 더 심해질 텐데요. 이미 이 구간은 상습 정체 구역이에요.", think: ["두 사람이 가장 중요하게 여기는 가치는 각각 무엇인가?", "두 관점을 모두 존중하는 방안이 있을까?"] },
            { kind: "note", title: "추론과 짐작은 어떻게 다를까", text: "추론은 담화 속에서 찾은 **근거**에 기대어 속뜻을 짐작하는 것이다. 근거 없이 내 기분이나 선입견으로 판단하면 오해가 생긴다. 추론이 확실하지 않을 때에는 '혹시 ~라는 뜻이야?'처럼 질문하여 확인하는 것이 좋은 듣기 태도이다." }
          ]
        },
        extension: {
          goal: "실제 매체와 생활 속 담화에서 의도와 관점을 추론하고 그 결과를 나눈다.",
          points: ["실제 담화 분석하기", "추론의 근거를 정리하여 발표하기"],
          blocks: [
            { kind: "activity", title: "속뜻 탐정 분석표", steps: ["뉴스 인터뷰, 학교 방송, 광고 영상 가운데 한 사람의 1분 남짓한 발화를 고른다.", "말한 사람과 상황, 핵심 발화를 적는다.", "언어·준언어·비언어 단서를 두 가지 이상 찾는다.", "단서를 바탕으로 의도와 관점을 추론하고, 다르게 해석될 가능성도 적는다.", "모둠에서 분석표를 돌려 읽고 서로의 근거를 평가한다."], output: "의도·관점 분석표(화자와 상황 / 핵심 발화 / 단서 / 추론한 의도 / 추론한 관점)", tip: "예: 학교 방송부장이 '올해는 여러분이 주인공입니다.'를 세 번 반복하며 밝은 억양으로 말함 → 의도는 축제 참여 신청 늘리기, 관점은 축제를 관람이 아닌 참여의 장으로 봄." },
            { kind: "activity", title: "우리 집 속뜻 사전", steps: ["일주일 동안 가족이나 친구가 겉뜻과 다른 속뜻으로 한 말을 모은다.", "그 말을 한 상황과 속뜻을 알아챈 단서를 적는다.", "내가 잘못 알아들었던 경험이 있다면 왜 오해했는지도 적는다."], output: "생활 속 속뜻 사전 5항목 이상", tip: "가족의 사생활이 드러나지 않도록 상황을 조금 바꾸어 써도 좋다." }
          ]
        }
      },
      teacherNote: "이 성취기준은 들은 내용을 그대로 받아들이는 데 그치지 않고 드러나지 않은 의도와 관점을 추론하는 능동적 듣기를 강조한다. 추론은 반드시 담화 속 근거에 기대야 함을 지도하여 자의적 해석을 경계하게 한다. 실제 대화·인터뷰·매체 자료를 활용하되, 준언어적·비언어적 표현을 함께 관찰할 수 있도록 영상 자료를 쓰면 효과적이다. 평가 시에는 추론 결과보다 근거 제시의 타당성에 비중을 둔다."
    },
    {
      code: "[9국01-02]",
      text: "설득 전략을 비판적으로 분석하며 듣는다.",
      verified: true,
      checked: "2026-11-09",
      sources: [
        { t: "2022 개정 국어과 교육과정(교육부 고시 제2022-33호 [별책 5]) 화법과 언어 [12화언01-10] 성취기준 해설(이성적·감성적 설득 전략, 화자의 공신력)", u: "https://www.cku.ac.kr/bbs/korean/907/71198/download.do", k: "교육과정" },
        { t: "2022 개정 국어과 교육과정(교육부 고시 제2022-33호 [별책 5]) 중학교 듣기·말하기 성취기준 적용 시 고려 사항", u: "https://www.cku.ac.kr/bbs/korean/907/71198/download.do", k: "교육과정" },
        { t: "우리말샘 '성급한 일반화의 오류'", u: "https://opendict.korean.go.kr/search/searchResult?query=%EC%84%B1%EA%B8%89%ED%95%9C%20%EC%9D%BC%EB%B0%98%ED%99%94", k: "사전" }
      ],
      title: "설득 전략과 비판적 듣기",
      keywords: ["설득 전략", "이성적 설득", "감성적 설득", "인성적 설득", "비판적 듣기"],
      explain: [
        "설득하는 말하기는 듣는 이의 생각이나 행동을 바꾸려는 말하기이다. 말하는 이는 이를 위해 여러 **설득 전략**을 쓰는데, 흔히 **이성적 설득**(논리와 근거), **감성적 설득**(감정에 호소), **인성적 설득**(말하는 이의 성품·평판·전문성 같은 공신력을 활용)으로 나누어 설명한다. 교육과정에서는 세 번째 전략을 '화자의 공신력을 활용한 설득 전략'이라고 부른다.",
        "비판적으로 듣는다는 것은 설득 전략에 무조건 끌려가지 않고, 그 전략이 타당하고 알맞게 쓰였는지 따져 보는 것이다. 근거가 사실인지, 주장과 근거가 이어지는지, 감정에 지나치게 기대어 판단을 흐리게 하지는 않는지, 말하는 이의 권위가 그 주제와 관련 있는지 등을 살핀다.",
        "광고, 연설, 선거 유세, 캠페인처럼 생활에는 설득 담화가 가득하다. 비판적 듣기는 합리적으로 판단하고 과장된 표현에 휘둘리지 않는 민주 시민의 기본 역량이다."
      ],
      concepts: [
        { term: "이성적 설득", desc: "통계, 사실 같은 객관적 근거와 논리로 듣는 이의 판단에 호소하는 설득 전략.", src: 0 },
        { term: "감성적 설득", desc: "듣는 이의 동정심, 두려움, 자부심 같은 감정에 호소하는 설득 전략.", src: 0 },
        { term: "인성적 설득", desc: "말하는 이의 성품, 평판, 전문성 같은 공신력을 바탕으로 설득하는 전략. 교육과정에서는 '화자의 공신력을 활용한 설득 전략'이라고 한다.", src: 0 },
        { term: "비판적 듣기", desc: "설득 전략에 그대로 끌려가지 않고 내용과 전략이 타당한지 따지며 합리적으로 판단하는 듣기.", src: 1 },
        { term: "논리적 오류", desc: "주장과 근거의 연결이 잘못된 추론. 예: 몇 가지 사례나 경험만으로 전체를 섣불리 단정하는 성급한 일반화의 오류.", src: 2 }
      ],
      levels: {
        basic: {
          goal: "여러 설득 장면을 비교하여 사람을 움직이는 방법이 세 갈래로 나뉜다는 것을 발견한다.",
          points: ["설득 장면 모아 보기", "무엇이 마음을 움직였는지 분류하기"],
          blocks: [
            { kind: "case", title: "사례 1. 마음의 문을 두드리는 광고", media: { type: "video", url: "https://www.youtube.com/watch?v=pDU_fuzAMM4", source: "KOBACO 공익광고협의회" }, text: "외로운 이웃에게 작은 안부를 건네자고 권하는 공익 광고이다.", think: ["이 광고를 보고 어떤 감정이 들었는가?", "광고는 통계와 감정 가운데 무엇으로 나를 움직이려 했을까?"] },
            { kind: "case", title: "사례 2. 유명인이 권하는 환경 실천", media: { type: "video", url: "https://www.youtube.com/watch?v=E01w3D4wQso", source: "KOBACO 공익광고협의회" }, text: "살림에 밝은 방송인이 나와 생활 속 환경 실천 방법을 알려 주는 30초 광고이다.", think: ["왜 이 사람을 광고에 출연시켰을까?", "같은 말을 낯선 사람이 했다면 느낌이 어떻게 달랐을까?"] },
            { kind: "case", title: "사례 3. 숫자로 말하는 급식 연설", media: { type: "svg", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><rect x='20' y='20' width='200' height='150' fill='#fff' stroke='#333'/><text x='120' y='42' font-size='13' text-anchor='middle' fill='#333'>급식 잔반량(1주)</text><line x1='45' y1='150' x2='205' y2='150' stroke='#333'/><rect x='60' y='70' width='40' height='80' fill='#bbb'/><rect x='140' y='110' width='40' height='40' fill='#2e7d4f'/><text x='80' y='165' font-size='11' text-anchor='middle' fill='#333'>배식 전</text><text x='160' y='165' font-size='11' text-anchor='middle' fill='#333'>먹을 만큼</text><text x='80' y='65' font-size='11' text-anchor='middle' fill='#333'>80kg</text><text x='160' y='105' font-size='11' text-anchor='middle' fill='#333'>40kg</text><circle cx='310' cy='110' r='16' fill='#fff' stroke='#333' stroke-width='2'/><path d='M286 185 Q310 135 334 185 Z' fill='#e8f3ec' stroke='#333' stroke-width='2'/><rect x='240' y='20' width='150' height='60' rx='10' fill='#fff' stroke='#333'/><text x='315' y='45' font-size='12' text-anchor='middle' fill='#333'>먹을 만큼 받으면</text><text x='315' y='63' font-size='12' text-anchor='middle' fill='#333'>잔반이 절반!</text></svg>" }, text: "학생회 후보가 시범 운영 결과 그래프를 보여 주며 '먹을 만큼 배식제'를 제안한다.", think: ["이 후보는 무엇을 근거로 설득하고 있는가?", "그래프를 보면 어떤 점을 더 묻고 싶어지는가?"] },
            { kind: "note", title: "발견한 개념", text: "사례 1은 듣는 이의 **감정**을 움직였고(감성적 설득), 사례 2는 말하는 사람에 대한 **믿음과 호감**을 활용했으며(인성적 설득), 사례 3은 **자료와 논리**로 설득했다(이성적 설득). 이처럼 말하는 이가 듣는 이를 움직이기 위해 쓰는 방법을 **설득 전략**이라고 한다." }
          ]
        },
        advanced: {
          goal: "설득 담화를 비교·분석하여 전략이 타당하고 공정하게 쓰였는지 판단하는 기준을 세운다.",
          points: ["전략별 점검 질문 만들기", "타당한 설득과 문제 있는 설득 비교하기"],
          blocks: [
            { kind: "svg", title: "설득 전략별 점검 질문", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><rect x='10' y='10' width='120' height='36' rx='8' fill='#2e7d4f'/><text x='70' y='33' font-size='13' text-anchor='middle' fill='#fff'>이성적 설득</text><rect x='140' y='10' width='120' height='36' rx='8' fill='#2e7d4f'/><text x='200' y='33' font-size='13' text-anchor='middle' fill='#fff'>감성적 설득</text><rect x='270' y='10' width='120' height='36' rx='8' fill='#2e7d4f'/><text x='330' y='33' font-size='13' text-anchor='middle' fill='#fff'>인성적 설득</text><rect x='10' y='54' width='120' height='136' rx='8' fill='#fff' stroke='#333'/><text x='70' y='80' font-size='11' text-anchor='middle' fill='#333'>근거가 사실인가?</text><text x='70' y='104' font-size='11' text-anchor='middle' fill='#333'>출처가 분명한가?</text><text x='70' y='128' font-size='11' text-anchor='middle' fill='#333'>주장과 이어지나?</text><text x='70' y='152' font-size='11' text-anchor='middle' fill='#333'>사례가 충분한가?</text><rect x='140' y='54' width='120' height='136' rx='8' fill='#fff' stroke='#333'/><text x='200' y='80' font-size='11' text-anchor='middle' fill='#333'>감정이 지나친가?</text><text x='200' y='104' font-size='11' text-anchor='middle' fill='#333'>두려움을 부풀리나?</text><text x='200' y='128' font-size='11' text-anchor='middle' fill='#333'>내용과 관련 있나?</text><rect x='270' y='54' width='120' height='136' rx='8' fill='#fff' stroke='#333'/><text x='330' y='80' font-size='11' text-anchor='middle' fill='#333'>그 분야 전문가인가?</text><text x='330' y='104' font-size='11' text-anchor='middle' fill='#333'>이해관계가 있나?</text><text x='330' y='128' font-size='11' text-anchor='middle' fill='#333'>인기와 실력을</text><text x='330' y='144' font-size='11' text-anchor='middle' fill='#333'>혼동하지 않나?</text></svg>", caption: "비판적으로 들을 때 전략마다 던져 볼 질문" },
            { kind: "case", title: "비교 자료 1. 학생회장 선거 연설", text: "여러분, 제가 회장이 되면 매점에 무료 간식을 매일 제공하겠습니다! 다른 후보는 그런 약속을 하지 않았습니다. 여러분을 진심으로 아끼는 사람은 오직 저뿐입니다. 저를 뽑지 않으면 우리 학교는 1년 내내 지루할 것입니다!", think: ["이 연설에 쓰인 전략은 무엇인가?", "점검 질문을 적용하면 어떤 문제가 보이는가?"] },
            { kind: "case", title: "비교 자료 2. 건강 음료 광고", text: "유명 축구 선수: 저는 매일 아침 이 음료를 마십니다. 그래서 90분 내내 지치지 않죠. 여러분도 오늘부터 챔피언이 되세요!", think: ["선수의 체력이 정말 음료 덕분이라고 말할 수 있을까?", "운동을 잘하는 사람은 음료 효능의 전문가일까?"] },
            { kind: "note", title: "정리: 좋은 설득과 문제 있는 설득", text: "감성적·인성적 설득이 그 자체로 나쁜 것은 아니다. 문제는 **근거 없이** 감정을 부풀리거나, 주제와 관계없는 인기·권위를 내세우거나, 상대를 부당하게 깎아내릴 때 생긴다. 비판적으로 듣는 사람은 '이 말을 믿을 근거가 무엇인가?'를 늘 묻는다." }
          ]
        },
        extension: {
          goal: "생활 속 광고와 연설을 분석·평가하여 비판적으로 받아들이는 태도를 기른다.",
          points: ["실제 설득 담화 분석하기", "평가 결과를 근거와 함께 나누기"],
          blocks: [
            { kind: "activity", title: "설득 전략 분석 보고서", steps: ["공익 광고, 상업 광고, 연설 영상 가운데 하나를 고른다.", "쓰인 설득 전략을 이성·감성·인성으로 나누어 장면별로 적는다.", "점검 질문을 적용해 각 전략의 효과와 문제점을 평가한다.", "이 담화를 듣는 사람이 가져야 할 태도를 한 문장으로 제안한다."], output: "설득 전략 분석 보고서 1쪽", tip: "예: 금연 광고의 폐 사진은 두려움에 호소하는 감성적 설득, 흡연자 폐암 발생률 통계는 이성적 설득이다. 통계 출처가 있으면 신뢰성이 높아진다." },
            { kind: "activity", title: "우리 반 공익 광고 만들기", steps: ["학교 문제 하나를 정해 30초 광고 대본을 쓴다.", "세 가지 전략을 모두 넣되, 근거는 사실만 쓴다.", "다른 모둠이 점검 질문으로 우리 광고를 평가해 준다."], output: "30초 공익 광고 대본 또는 영상", tip: "과장된 위협이나 특정인을 깎아내리는 표현은 쓰지 않기로 약속한다." }
          ]
        }
      },
      teacherNote: "설득 전략을 분류하는 데서 멈추지 않고 그 전략이 타당하고 공정하게 쓰였는지 평가하는 데 중점을 둔다. 광고, 연설, 캠페인처럼 학습자의 삶과 가까운 설득 담화를 자료로 활용하면 효과적이다. 감성적·인성적 설득 자체가 나쁜 것이 아니라 근거 없이 남용될 때 문제가 됨을 균형 있게 지도한다. 정치적 성향이 드러나는 자료를 쓸 경우 특정 입장에 치우치지 않도록 유의한다."
    },
    {
      code: "[9국01-03]",
      text: "담화 공동체에 따른 듣기·말하기 방식의 다양성을 고려하여 듣고 말한다.",
      verified: true,
      checked: "2026-11-09",
      sources: [
        { t: "2022 개정 국어과 교육과정(교육부 고시 제2022-33호 [별책 5]) [9국01-03] 성취기준 해설", u: "https://www.cku.ac.kr/bbs/korean/907/71198/download.do", k: "교육과정" },
        { t: "표준국어대사전 '사회 방언'", u: "https://stdict.korean.go.kr/search/searchResult.do?pageSize=10&searchKeyword=%EC%82%AC%ED%9A%8C%20%EB%B0%A9%EC%96%B8", k: "사전" },
        { t: "표준국어대사전 '지역 방언'", u: "https://stdict.korean.go.kr/search/searchResult.do?pageSize=10&searchKeyword=%EC%A7%80%EC%97%AD%20%EB%B0%A9%EC%96%B8", k: "사전" }
      ],
      title: "담화 공동체와 다양한 말하기 방식",
      keywords: ["담화 공동체", "언어문화", "세대", "지역 방언", "다양성 존중"],
      explain: [
        "**담화 공동체**란 같은 목적이나 관심, 생활 공간을 공유하며 비슷한 방식으로 의사소통하는 사람들의 집단이다. 가족, 학급, 동아리, 온라인 커뮤니티, 직업 집단, 지역 사회, 세대 등이 모두 담화 공동체가 될 수 있다.",
        "교육과정은 듣기·말하기 방식에 영향을 주는 요인으로 세대, 성, 직업, 지역, 공동체의 관심사나 이해관계, 공동체의 언어문화와 관습 등을 든다. 그래서 담화 공동체마다 즐겨 쓰는 낱말, 높임 표현, 말의 길이와 순서, 대화에 끼어드는 방식, 직접적·간접적 표현의 선호 등이 다르다. 운동부에서는 짧고 분명한 지시가 자연스럽지만, 어르신이 모인 자리에서는 공손하고 완곡한 표현이 기대된다. 다문화 가정의 구성원은 서로 다른 언어 문화의 영향을 받기도 한다.",
        "이런 다양성을 고려한다는 것은 내가 속한 공동체의 방식만을 기준으로 상대를 평가하지 않고, 상대가 속한 공동체의 방식을 이해하며 상황에 맞게 듣고 말하는 것이다. 이는 오해와 갈등을 줄이고 서로 다른 사람들이 존중하며 소통하는 바탕이 된다."
      ],
      concepts: [
        { term: "담화 공동체", desc: "목적, 관심, 생활을 함께하며 듣기·말하기 방식을 공유하는 사람들의 집단. 개인은 세대, 성, 직업, 지역 등에 따라 여러 담화 공동체에 속한다. 예: 학급, 동아리, 온라인 커뮤니티.", src: 0 },
        { term: "언어문화", desc: "한 공동체 안에서 공유되는 말하기의 관습과 방식. 교육과정은 이를 듣기·말하기 방식에 영향을 주는 요인의 하나로 든다.", src: 0 },
        { term: "사회 방언", desc: "한 언어 안에서 직업, 연령, 성별 따위에 따라 특징적으로 쓰는 말. 예: 청소년의 줄임말, 의료인의 전문어.", src: 1 },
        { term: "지역 방언", desc: "한 언어 안에서 지역에 따라 다르게 쓰는 말.", src: 2 }
      ],
      levels: {
        basic: {
          goal: "여러 집단의 말하기 장면을 보고 '함께 쓰는 말의 방식'이 집단마다 다르다는 것을 발견한다.",
          points: ["지역·세대·집단별 말 비교하기", "그 말이 생긴 까닭 생각하기"],
          blocks: [
            { kind: "case", title: "사례 1. 팔도의 말맛", media: { type: "video", url: "https://www.youtube.com/watch?v=GAHdStv5Xns", source: "국립한글박물관" }, text: "국립한글박물관 기획전 〈사투리는 못 참지!〉를 소개하는 영상이다.", think: ["같은 뜻을 지역마다 어떻게 다르게 말하는가?", "사투리에는 그 지역 사람들의 어떤 삶이 담겨 있을까?"] },
            { kind: "case", title: "사례 2. 할머니와 손자의 대화", media: { type: "svg", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><circle cx='80' cy='125' r='16' fill='#fff' stroke='#333' stroke-width='2'/><path d='M56 195 Q80 145 104 195 Z' fill='#e8f3ec' stroke='#333' stroke-width='2'/><circle cx='320' cy='120' r='18' fill='#fff' stroke='#333' stroke-width='2'/><path d='M70 112 q10 -8 20 0' stroke='#333' fill='none'/><path d='M294 195 Q320 142 346 195 Z' fill='#eee' stroke='#333' stroke-width='2'/><rect x='10' y='15' width='200' height='70' rx='12' fill='#fff' stroke='#333'/><text x='110' y='42' font-size='12' text-anchor='middle' fill='#333'>시험 망해서 현타 왔는데</text><text x='110' y='62' font-size='12' text-anchor='middle' fill='#333'>떡볶이 먹으니 개꿀!</text><rect x='230' y='15' width='160' height='70' rx='12' fill='#fff' stroke='#333'/><text x='310' y='42' font-size='12' text-anchor='middle' fill='#333'>현타가 뭐니?</text><text x='310' y='62' font-size='12' text-anchor='middle' fill='#333'>개가 꿀을 먹었다고?</text></svg>" }, text: "손자가 친구들끼리 쓰는 말로 하루 이야기를 하자 할머니가 고개를 갸웃하신다.", think: ["할머니가 알아듣지 못한 까닭은 무엇일까?", "손자는 친구와 이야기할 때와 할머니와 이야기할 때 말을 어떻게 바꾸면 좋을까?"] },
            { kind: "case", title: "사례 3. 운동부와 독서 모임", text: "축구부 훈련: '패스! 오른쪽! 라인 올려!'\n독서 모임: '저는 주인공의 선택이 조금 아쉬웠는데요, 혹시 다른 분들은 어떻게 보셨는지 궁금해요.'", think: ["두 집단의 말은 길이와 높임에서 어떻게 다른가?", "각 집단의 말하기 방식은 그 집단의 목적과 어떤 관계가 있을까?"] },
            { kind: "note", title: "발견한 개념", text: "지역, 세대, 동아리처럼 목적이나 생활을 함께하는 사람들은 그들만의 낱말과 말하는 방식을 공유한다. 이런 집단을 **담화 공동체**라고 한다. 공동체마다 말하기 방식이 다른 것은 옳고 그름의 문제가 아니라 **다양성**이며, 상대의 공동체를 이해하고 상황에 맞게 말을 조정할 줄 알아야 한다." }
          ]
        },
        advanced: {
          goal: "담화 공동체의 차이 때문에 생긴 소통 문제를 비교·분석하고 조정 방법을 찾는다.",
          points: ["오해의 원인을 공동체 차이에서 찾기", "상대를 고려한 표현으로 바꾸기"],
          blocks: [
            { kind: "video", title: "지역의 역사와 정서가 담긴 사투리", url: "https://www.youtube.com/watch?v=nMJ3r9sPzFc", source: "채널A 브레인 아카데미", note: "방언이 단순히 '틀린 말'이 아니라 지역의 역사와 삶의 방식을 담은 말이라는 점에 주목한다." },
            { kind: "case", title: "비교 자료 1. '생각해 볼게'의 두 가지 뜻", text: "(외국에서 온 지 얼마 안 된 전학생 민아와 반 친구의 대화)\n지수: 민아야, 이번 주말에 우리 집에서 같이 숙제할래?\n민아: 아, 생각해 볼게.\n지수: (속으로) 싫다는 뜻인가? 서운하네.\n(민아가 지냈던 곳에서는 '생각해 볼게'가 긍정적으로 검토하겠다는 뜻으로 흔히 쓰였다.)", think: ["같은 말이 왜 서로 다르게 해석되었을까?", "지수가 오해를 풀려면 어떤 질문을 하면 좋을까?"] },
            { kind: "svg", title: "한 사람이 속한 여러 담화 공동체", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><circle cx='200' cy='100' r='34' fill='#2e7d4f'/><text x='200' y='105' font-size='14' text-anchor='middle' fill='#fff'>나</text><g fill='#fff' stroke='#333'><ellipse cx='80' cy='45' rx='58' ry='24'/><ellipse cx='320' cy='45' rx='58' ry='24'/><ellipse cx='70' cy='155' rx='58' ry='24'/><ellipse cx='330' cy='155' rx='58' ry='24'/><ellipse cx='200' cy='175' rx='50' ry='18'/></g><g stroke='#999'><line x1='170' y1='85' x2='125' y2='60'/><line x1='230' y1='85' x2='275' y2='60'/><line x1='170' y1='115' x2='118' y2='142'/><line x1='230' y1='115' x2='282' y2='142'/><line x1='200' y1='134' x2='200' y2='157'/></g><g font-size='12' text-anchor='middle' fill='#333'><text x='80' y='49'>가족(높임말)</text><text x='320' y='49'>학급 친구(줄임말)</text><text x='70' y='159'>온라인 게임(전문어)</text><text x='330' y='159'>동네(지역 방언)</text><text x='200' y='179'>동아리</text></g></svg>", caption: "한 사람은 여러 공동체에 동시에 속하고, 자리에 따라 말을 바꾸어 쓴다." },
            { kind: "note", title: "정리: 조정하며 말하기", text: "소통 문제가 생기면 상대를 탓하기 전에 **서로 다른 공동체의 방식** 때문은 아닌지 살핀다. 낯선 말은 풀어서 말하고, 뜻이 애매하면 질문으로 확인하며, 상대의 말하기 방식을 낮추어 보지 않는 태도가 필요하다." }
          ]
        },
        extension: {
          goal: "다양한 담화 공동체의 소통 방식을 조사하고 서로 존중하는 소통 방법을 제안한다.",
          points: ["다른 공동체 사람 면담하기", "소통 안내 자료 만들기"],
          blocks: [
            { kind: "activity", title: "소통 안내 카드 만들기", steps: ["세대·지역·문화가 다른 사람(조부모, 다른 지역 출신 이웃, 다문화 가정 친구 등) 한 명을 면담한다.", "그 사람이 속한 공동체의 낱말, 높임, 부탁하는 방식 등을 조사한다.", "우리와 다른 점을 우열이 아닌 차이로 정리한다.", "서로 존중하며 소통하는 방법 세 가지를 카드로 만든다."], output: "소통 안내 카드(조사 내용 + 존중 방법 3가지)", tip: "예: 70대 할아버지는 부탁할 때 '~해 주면 고맙지'처럼 돌려 말씀하신다 → 돌려 말한 부탁을 알아차리고 반응하기." },
            { kind: "activity", title: "우리 반 말 사전", steps: ["우리 반에서만 통하는 말(별명, 유행어, 줄임말)을 모은다.", "각 말을 처음 듣는 사람도 알 수 있게 풀이한다.", "누군가를 상처 입히는 말은 사전에서 빼기로 함께 정한다."], output: "학급 말 사전", tip: "특정 지역이나 문화를 놀리는 말이 섞이지 않았는지 함께 점검한다." }
          ]
        }
      },
      teacherNote: "담화 공동체에 따라 소통 방식이 다양하다는 것을 이해하고, 이를 우열이 아닌 차이로 받아들이도록 지도한다. 세대, 지역, 성별, 문화, 온라인 공동체 등 학습자가 실제로 경험하는 공동체를 사례로 활용한다. 특정 지역 방언이나 다문화 배경을 희화화하지 않도록 자료 선정과 수업 분위기에 각별히 유의한다. 학습자가 자신이 속한 여러 공동체를 성찰해 보는 활동이 효과적이다."
    },
    {
      code: "[9국01-04]",
      text: "상대의 말을 경청하고 상대의 감정과 입장에 공감하는 반응을 보이며 대화한다.",
      verified: true,
      checked: "2026-11-09",
      sources: [
        { t: "표준국어대사전 '경청(傾聽)'", u: "https://stdict.korean.go.kr/search/searchResult.do?pageSize=10&searchKeyword=%EA%B2%BD%EC%B2%AD", k: "사전" },
        { t: "표준국어대사전 '공감(共感)'", u: "https://stdict.korean.go.kr/search/searchResult.do?pageSize=10&searchKeyword=%EA%B3%B5%EA%B0%90", k: "사전" },
        { t: "우리말샘 '적극적 경청'", u: "https://opendict.korean.go.kr/search/searchResult?query=%EC%A0%81%EA%B7%B9%EC%A0%81%20%EA%B2%BD%EC%B2%AD", k: "사전" },
        { t: "2022 개정 국어과 교육과정(교육부 고시 제2022-33호 [별책 5]) 중학교 듣기·말하기 성취기준 적용 시 고려 사항(공감적 대화하기)", u: "https://www.cku.ac.kr/bbs/korean/907/71198/download.do", k: "교육과정" }
      ],
      title: "경청과 공감하는 대화",
      keywords: ["경청", "공감", "공감적 듣기", "소극적 들어 주기", "적극적 들어 주기"],
      explain: [
        "**경청**은 귀를 기울여 듣는 것이고, **공감**은 남의 감정이나 의견 따위에 대하여 자기도 그렇다고 느끼는 것이다. 이 성취기준에서 공감하는 반응이란 상대의 상황과 처지에서 문제를 바라보며 그의 생각과 감정을 깊이 이해하려 애쓰는 반응을 말한다. 공감적 대화는 원만한 대인 관계를 맺고 유지하는 데 필요하고, 함께하는 듣기·말하기 활동에 협력적으로 참여하는 바탕이 된다.",
        "공감하며 듣는 반응은 흔히 두 가지로 나누어 설명한다. **소극적 들어 주기**는 고개 끄덕이기, 눈 맞추기, '그랬구나', '응, 그래서?' 같은 맞장구로 상대가 계속 말하도록 북돋는 것이다. **적극적 들어 주기**는 '시험 결과 때문에 많이 속상했겠다.'처럼 상대의 말을 요약하거나 감정을 짚어 되돌려 주어 이해했음을 드러내는 것으로, 상대가 하는 말의 의미를 파악하고 적극적으로 공감하며 듣는 **적극적 경청**의 태도와 통한다.",
        "공감은 상대의 말에 무조건 동의하는 것과 다르다. 섣불리 충고하거나 판단하기, 화제를 자기 이야기로 돌리기, 상대의 감정을 깎아내리기('그게 뭐 별일이라고')는 공감을 방해한다. 먼저 감정을 충분히 받아 준 뒤에 필요한 조언을 하는 것이 좋다."
      ],
      concepts: [
        { term: "경청", desc: "귀를 기울여 들음. 상대의 말에 주의를 모아 듣는 것.", src: 0 },
        { term: "공감", desc: "남의 감정, 의견, 주장 따위에 대하여 자기도 그렇다고 느낌. 공감하는 대화에서는 상대의 처지에서 그의 감정과 입장을 이해하려 애쓴다.", src: 1 },
        { term: "소극적 들어 주기", desc: "맞장구, 끄덕임, 눈 맞춤 등으로 상대가 계속 말하도록 북돋는 듣기.", src: 3 },
        { term: "적극적 들어 주기", desc: "상대의 말이나 감정을 요약하거나 다시 말해 주어 이해했음을 드러내는 듣기. 상대가 하는 말의 의미를 파악하고 적극적으로 공감하며 듣는 '적극적 경청'과 통한다.", src: 2 },
        { term: "공감의 방해 요소", desc: "섣부른 충고, 평가, 화제 돌리기, 감정 무시처럼 공감을 가로막는 반응.", src: 3 }
      ],
      levels: {
        basic: {
          goal: "여러 대화 장면을 비교하여 마음이 열리는 대답과 닫히는 대답의 차이를 발견한다.",
          points: ["같은 고민, 다른 대답 비교하기", "마음이 열린 대답의 공통점 찾기"],
          blocks: [
            { kind: "video", title: "최고의 대화 기술, 경청", url: "https://www.youtube.com/watch?v=Kax1dfsW5Ug", source: "EBS 평생학교", note: "아나운서가 알려 주는 경청의 기술. 잘 듣는 사람은 귀뿐 아니라 무엇을 함께 쓰는지 주목한다." },
            { kind: "case", title: "사례 1. 오디션에 떨어진 서윤 — 대답 A", media: { type: "svg", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><circle cx='80' cy='125' r='16' fill='#fff' stroke='#333' stroke-width='2'/><path d='M56 195 Q80 145 104 195 Z' fill='#eee' stroke='#333' stroke-width='2'/><circle cx='320' cy='125' r='16' fill='#fff' stroke='#333' stroke-width='2'/><path d='M296 195 Q320 145 344 195 Z' fill='#eee' stroke='#333' stroke-width='2'/><rect x='10' y='15' width='175' height='65' rx='12' fill='#fff' stroke='#333'/><text x='97' y='42' font-size='12' text-anchor='middle' fill='#333'>오디션에 떨어졌어.</text><text x='97' y='62' font-size='12' text-anchor='middle' fill='#333'>한 달 내내 연습했는데…</text><rect x='210' y='15' width='180' height='65' rx='12' fill='#fff' stroke='#333'/><text x='300' y='42' font-size='12' text-anchor='middle' fill='#333'>그게 뭐 대수야?</text><text x='300' y='62' font-size='12' text-anchor='middle' fill='#333'>나 어제 게임 1등 했다?</text><text x='80' y='112' font-size='14' text-anchor='middle' fill='#333'>…</text></svg>" }, text: "준호는 서윤의 말에 바로 자기 이야기를 꺼냈다.", think: ["서윤의 마음은 어떻게 되었을까?", "준호의 대답에서 서윤을 서운하게 한 부분은 어디일까?"] },
            { kind: "case", title: "사례 2. 오디션에 떨어진 서윤 — 대답 B", media: { type: "svg", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><circle cx='80' cy='125' r='16' fill='#fff' stroke='#333' stroke-width='2'/><path d='M56 195 Q80 145 104 195 Z' fill='#e8f3ec' stroke='#333' stroke-width='2'/><circle cx='320' cy='125' r='16' fill='#fff' stroke='#333' stroke-width='2'/><path d='M296 195 Q320 145 344 195 Z' fill='#e8f3ec' stroke='#333' stroke-width='2'/><rect x='10' y='15' width='175' height='65' rx='12' fill='#fff' stroke='#333'/><text x='97' y='42' font-size='12' text-anchor='middle' fill='#333'>오디션에 떨어졌어.</text><text x='97' y='62' font-size='12' text-anchor='middle' fill='#333'>한 달 내내 연습했는데…</text><rect x='200' y='10' width='190' height='75' rx='12' fill='#fff' stroke='#2e7d4f' stroke-width='2'/><text x='295' y='34' font-size='12' text-anchor='middle' fill='#333'>(고개를 끄덕이며)</text><text x='295' y='54' font-size='12' text-anchor='middle' fill='#333'>한 달이나 연습했는데</text><text x='295' y='72' font-size='12' text-anchor='middle' fill='#333'>정말 속상했겠다.</text></svg>" }, text: "지아는 서윤을 바라보며 고개를 끄덕이고 서윤의 마음을 말로 짚어 주었다.", think: ["대답 A와 B를 들은 서윤의 표정은 어떻게 다를까?", "대답 B에는 어떤 말과 몸짓이 들어 있는가?"] },
            { kind: "case", title: "사례 3. 동생의 고민", text: "동생: 형, 친구들이 단체 대화방에서 나만 빼고 이야기하는 것 같아.\n형 ①: 그런 애들이랑은 그냥 놀지 마.\n형 ②: 요즘 애들은 다 그래. 신경 쓰지 마.\n형 ③: 친구들이 너만 빼놓는 것 같아서 많이 서운했겠다. 무슨 일이 있었는지 더 얘기해 줄래?", think: ["동생이 더 이야기하고 싶어질 대답은 무엇일까?", "①과 ②는 동생을 도우려는 마음이었을 텐데, 왜 동생은 답답할까?"] },
            { kind: "note", title: "발견한 개념", text: "마음이 열린 대답에는 공통점이 있다. 상대의 말을 끝까지 **경청**하고, 끄덕임·맞장구로 관심을 보이며(**소극적 들어 주기**), 상대의 감정을 말로 짚어 준다(**적극적 들어 주기**). 이렇게 상대의 처지에서 감정을 이해하고 함께 느끼는 것을 **공감**이라고 한다. 섣부른 충고, 평가, 화제 돌리기는 공감을 막는다." }
          ]
        },
        advanced: {
          goal: "공감을 방해하는 반응과 돕는 반응을 비교·분석하고 정리한다.",
          points: ["반응 유형 분류하기", "공감 반응으로 고쳐 말하기"],
          blocks: [
            { kind: "svg", title: "공감을 돕는 반응과 막는 반응", svg: "<svg viewBox='0 0 400 210' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='210' fill='#f6f7f6'/><rect x='10' y='10' width='185' height='34' rx='8' fill='#2e7d4f'/><text x='102' y='32' font-size='13' text-anchor='middle' fill='#fff'>돕는 반응</text><rect x='205' y='10' width='185' height='34' rx='8' fill='#888'/><text x='297' y='32' font-size='13' text-anchor='middle' fill='#fff'>막는 반응</text><rect x='10' y='52' width='185' height='150' rx='8' fill='#fff' stroke='#333'/><rect x='205' y='52' width='185' height='150' rx='8' fill='#fff' stroke='#333'/><g font-size='12' fill='#333'><text x='22' y='78'>· 눈 맞추고 끄덕이기</text><text x='22' y='104'>· '그랬구나', '그래서?'</text><text x='22' y='130'>· 감정 짚어 주기</text><text x='22' y='156'>· 들은 말 요약하기</text><text x='22' y='182'>· 더 말하도록 묻기</text><text x='217' y='78'>· 섣부른 충고</text><text x='217' y='104'>· 잘잘못 평가하기</text><text x='217' y='130'>· 내 이야기로 돌리기</text><text x='217' y='156'>· '별일 아니야'</text><text x='217' y='182'>· 딴짓하며 듣기</text></g></svg>", caption: "공감 대화의 반응을 두 묶음으로 정리한 표" },
            { kind: "video", title: "또래상담: 경청과 공감 배우고 연습하기", url: "https://www.youtube.com/watch?v=O0VXhCWt7Ac", source: "구구의 세상(또래상담 교육 영상)", note: "또래 상담자가 경청하고 공감하는 장면을 보며, 표에 있는 '돕는 반응'을 몇 개나 찾을 수 있는지 세어 본다." },
            { kind: "case", title: "분석 자료. 성적표를 받은 날", text: "하린: 수학 점수가 또 떨어졌어. 엄마한테 뭐라고 말하지.\n도윤: 네가 공부를 안 해서 그렇지. 학원 다녀 봐.", think: ["도윤의 반응은 표의 어느 칸에 들어갈까?", "하린의 감정을 짚어 주는 대답으로 바꾸어 말해 보자."] },
            { kind: "note", title: "정리: 공감 다음에 조언", text: "상대가 해결책을 원할 때도 있다. 그럴 때에도 **감정을 먼저 받아 준 다음** 조언하면 상대가 조언을 더 잘 받아들인다. 공감하는 반응을 보인다고 해서 상대의 생각에 모두 찬성해야 하는 것은 아니다. 상대의 생각이 나와 달라도 그의 처지에서 감정을 이해할 수 있다." }
          ]
        },
        extension: {
          goal: "실제 대화에서 공감하는 듣기를 실천하고 자신의 듣기 습관을 성찰한다.",
          points: ["역할극으로 공감 대화 연습하기", "듣기 습관 성찰하기"],
          blocks: [
            { kind: "activity", title: "고민 상담 역할극", steps: ["짝과 가상의 고민(성적, 친구 관계, 진로 등)을 하나 정한다.", "한 사람은 고민을 말하고, 다른 사람은 소극적·적극적 들어 주기를 모두 써서 듣는다.", "역할을 바꾸어 다시 한다.", "관찰자는 '돕는 반응'과 '막는 반응'을 체크해 준다."], output: "역할극 관찰 체크리스트", tip: "실제 개인 고민 대신 가상 상황을 쓰면 부담 없이 연습할 수 있다." },
            { kind: "activity", title: "나의 공감 대화 일지", steps: ["일주일 동안 가족이나 친구와 나눈 대화 가운데 공감하려 애쓴 장면을 기록한다.", "내가 쓴 공감 반응, 잘된 점, 아쉬운 점을 적는다.", "다음 주 실천 목표 한 가지를 정한다."], output: "공감 대화 성찰 일지", tip: "예: 친구가 말을 마치기도 전에 '그럼 이렇게 해 봐'라고 말해 버림 → 다음에는 감정을 먼저 받아 주기." }
          ]
        }
      },
      teacherNote: "공감하는 대화는 기능 습득과 함께 상대를 존중하는 태도 형성이 중요하므로, 형식적인 맞장구 연습에 그치지 않도록 한다. 역할극에는 가상의 상황을 제시하여 개인의 민감한 사생활이 드러나지 않게 한다. 공감이 무조건적 동의와 다르다는 점을 분명히 한다. 교육과정은 다양한 사회·문화적 배경을 가진 상대의 상황과 처지에서 문제를 바라보는 포용적 태도를 함양하도록 안내하고, 공감적 대화를 갈등 조정하기([9국01-09])와 연계하여 지도할 수 있다고 밝힌다. 관찰 평가와 자기 성찰 평가를 함께 활용하면 좋다. (확인 필요: '소극적 들어 주기/적극적 들어 주기'라는 구분과 '공감의 방해 요소' 목록은 교과서·지도서에서 쓰는 설명으로, 이번 대조에서 국립국어원 사전이나 교육과정 원문에서는 확인하지 못했다. 사전에서 확인된 말은 '적극적 경청'(우리말샘)이다.)"
    },
    {
      code: "[9국01-05]",
      text: "면담의 다양한 목적과 상대를 고려하여 질문을 점검하고 효과적으로 면담한다.",
      verified: true,
      checked: "2026-11-09",
      sources: [
        { t: "표준국어대사전 '면담(面談)'", u: "https://stdict.korean.go.kr/search/searchResult.do?pageSize=10&searchKeyword=%EB%A9%B4%EB%8B%B4", k: "사전" },
        { t: "2022 개정 국어과 교육과정(교육부 고시 제2022-33호 [별책 5]) [9국01-05] 성취기준 해설 및 적용 시 고려 사항(면담하기)", u: "https://www.cku.ac.kr/bbs/korean/907/71198/download.do", k: "교육과정" },
        { t: "우리말샘 '개방형 질문'", u: "https://opendict.korean.go.kr/search/searchResult?query=%EA%B0%9C%EB%B0%A9%ED%98%95%20%EC%A7%88%EB%AC%B8", k: "사전" },
        { t: "우리말샘 '폐쇄형 질문'", u: "https://opendict.korean.go.kr/search/searchResult?query=%ED%8F%90%EC%87%84%ED%98%95%20%EC%A7%88%EB%AC%B8", k: "사전" }
      ],
      title: "면담과 좋은 질문",
      keywords: ["면담", "면담 목적", "질문 점검", "개방형 질문", "폐쇄형 질문"],
      explain: [
        "**면담**은 본래 서로 만나서 이야기한다는 뜻으로, 듣기·말하기에서는 특정한 목적을 가지고 대상자를 만나 질문과 대답으로 정보나 의견을 얻는 대화를 가리킨다. 교육과정은 면담의 목적으로 말하기나 글쓰기를 위한 자료 수집, 의사 결정, 상담, 선발 등을 든다. 진로 탐색을 위해 직업인을 만나거나, 기사 작성을 위해 관계자를 인터뷰하거나, 고민 해결을 위해 상담하는 것이 모두 면담이다.",
        "면담은 **준비 → 실행 → 정리**의 과정으로 진행된다. 준비 단계에서는 목적을 분명히 하고, 대상자에 대한 기본 정보를 조사하여 질문지를 만들며, 구조화 면담이나 반구조화 면담 같은 면담 유형에 맞게 수행 계획을 세운다. 이때 질문이 목적에 맞는지, 상대가 대답할 수 있는 것인지, 이미 공개된 정보를 묻는 것은 아닌지, 무례하거나 사생활을 침해하지 않는지 **점검**한다.",
        "질문에는 '네/아니요'처럼 짧게 답하는 **폐쇄형 질문**과 생각이나 경험을 자유롭게 말하게 하는 **개방형 질문**이 있다. 실행 단계에서는 상대의 대답을 경청하며 필요하면 **추가 질문**으로 내용을 구체화하고, 상대의 입장이나 반응에 따라 질문의 내용이나 순서를 조정한다. 정리 단계에서는 면담이 계획과 목적에 맞게 진행되었는지 점검하고, 질문의 의도와 답변자의 의도를 고려하여 내용을 정리한다. 녹음·인용 시에는 반드시 상대의 동의를 얻는다."
      ],
      concepts: [
        { term: "면담", desc: "서로 만나서 이야기함. 듣기·말하기에서는 자료 수집, 의사 결정, 상담, 선발 같은 목적을 가지고 대상자에게 질문하여 정보나 의견을 얻는 대화를 말한다.", src: 0 },
        { term: "개방형 질문", desc: "답하는 사람이 자유롭게 대답할 수 있도록 하는 질문. 예: '이 일을 하며 가장 보람 있던 순간은 언제인가요?'", src: 2 },
        { term: "폐쇄형 질문", desc: "미리 정한 선택지 가운데 고르게 하거나 몇 마디 짧은 말로 답하게 하는 질문. 예: '이 일을 하신 지 10년이 넘으셨나요?'", src: 3 },
        { term: "추가 질문", desc: "상대의 대답을 듣고 더 구체적인 내용을 얻기 위해 면담 중에 덧붙이는 질문.", src: 1 }
      ],
      levels: {
        basic: {
          goal: "여러 질문과 대답을 비교하여 대답을 풍부하게 끌어내는 질문의 특징을 발견한다.",
          points: ["짧은 대답과 긴 대답을 부른 질문 비교하기", "목적에 맞는 질문 골라내기"],
          blocks: [
            { kind: "case", title: "사례 1. 같은 사람, 다른 질문", media: { type: "svg", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><rect x='10' y='15' width='180' height='40' rx='10' fill='#fff' stroke='#333'/><text x='100' y='40' font-size='12' text-anchor='middle' fill='#333'>주말에도 일하세요?</text><rect x='210' y='15' width='180' height='40' rx='10' fill='#eee' stroke='#333'/><text x='300' y='40' font-size='12' text-anchor='middle' fill='#333'>네.</text><rect x='10' y='80' width='180' height='60' rx='10' fill='#fff' stroke='#2e7d4f' stroke-width='2'/><text x='100' y='104' font-size='12' text-anchor='middle' fill='#333'>이 일을 하며 가장</text><text x='100' y='124' font-size='12' text-anchor='middle' fill='#333'>보람찼던 순간은요?</text><rect x='210' y='70' width='180' height='120' rx='10' fill='#e8f3ec' stroke='#333'/><text x='300' y='96' font-size='11' text-anchor='middle' fill='#333'>작년 겨울에 화재 현장에서</text><text x='300' y='116' font-size='11' text-anchor='middle' fill='#333'>할머니 한 분을 구했는데요,</text><text x='300' y='136' font-size='11' text-anchor='middle' fill='#333'>나중에 손편지를 보내</text><text x='300' y='156' font-size='11' text-anchor='middle' fill='#333'>주셨어요. 그때…</text></svg>" }, text: "소방관과의 면담에서 두 질문을 했더니 대답의 길이가 크게 달랐다.", think: ["두 질문은 무엇이 다를까?", "직업을 깊이 알고 싶을 때는 어떤 질문이 더 쓸모 있을까?"] },
            { kind: "video", title: "인터뷰 질문의 유형", url: "https://www.youtube.com/watch?v=1cJvygKKzaw", source: "달빛요리사(국어 수업 영상)", note: "질문의 유형을 소개하는 수업 영상. 질문이 바뀌면 대답이 어떻게 바뀌는지 주목한다." },
            { kind: "case", title: "사례 2. 소방관 면담 질문 목록", text: "면담 목적: 소방관이라는 직업에 대해 알아보기\n(1) 소방관이 되려면 어떤 준비가 필요한가요?\n(2) 월급은 정확히 얼마나 받으세요?\n(3) 우리 동네 소방서 주소는 어디인가요?\n(4) 출동했을 때 가장 기억에 남는 순간은 언제였나요?", think: ["이 가운데 소방관이 대답하기 곤란한 질문은 무엇일까?", "인터넷으로 금방 찾을 수 있는 질문은 무엇일까?"] },
            { kind: "case", title: "사례 3. 이어 묻기", text: "학생: 작가님은 어떻게 작가가 되셨나요?\n작가: 어릴 때부터 일기를 꾸준히 썼어요. 그게 큰 도움이 되었죠.\n학생: 일기 쓰기가 구체적으로 어떤 점에서 도움이 되었나요?", think: ["학생의 두 번째 질문은 미리 준비한 질문일까?", "이런 질문을 하려면 면담 중에 무엇을 잘해야 할까?"] },
            { kind: "note", title: "발견한 개념", text: "목적을 가지고 사람을 만나 질문으로 정보와 생각을 얻는 대화를 **면담**이라고 한다. 짧은 대답을 부르는 질문은 **폐쇄형 질문**, 경험과 생각을 풀어 말하게 하는 질문은 **개방형 질문**이다. 좋은 면담을 하려면 질문을 미리 **점검**하고(목적에 맞는가, 예의 바른가, 상대만 답할 수 있는가), 대답을 잘 듣고 **추가 질문**을 해야 한다." }
          ]
        },
        advanced: {
          goal: "면담 목적과 상대에 따라 질문을 점검·수정하는 기준을 정리한다.",
          points: ["질문 점검 기준 세우기", "목적·상대에 맞게 질문 바꾸기"],
          blocks: [
            { kind: "svg", title: "면담의 흐름과 점검 기준", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><g fill='#fff' stroke='#333'><rect x='10' y='20' width='115' height='50' rx='10'/><rect x='142' y='20' width='115' height='50' rx='10'/><rect x='274' y='20' width='115' height='50' rx='10'/></g><g font-size='13' text-anchor='middle' fill='#2e7d4f'><text x='67' y='50'>준비</text><text x='200' y='50'>실행</text><text x='332' y='50'>정리</text></g><g stroke='#333'><line x1='125' y1='45' x2='142' y2='45'/><line x1='257' y1='45' x2='274' y2='45'/></g><rect x='10' y='85' width='380' height='105' rx='10' fill='#e8f3ec' stroke='#333'/><g font-size='12' fill='#333'><text x='24' y='108'>질문 점검 ① 면담 목적과 관련 있는가?</text><text x='24' y='130'>② 이 사람만 대답할 수 있는 질문인가?(검색으로 알 수 없는가)</text><text x='24' y='152'>③ 사생활을 침해하거나 무례하지 않은가?</text><text x='24' y='174'>④ 상대의 나이·직업에 맞는 말씨인가?</text></g></svg>", caption: "면담 과정과 질문 점검 기준" },
            { kind: "case", title: "비교 자료. 목적이 다른 세 면담", text: "① 진로 탐색: 웹툰 작가에게 하루 작업 과정 묻기\n② 학교 신문 기사: 급식 조리사께 새 메뉴 도입 배경 묻기\n③ 고민 상담: 상담 선생님께 친구 관계 고민 털어놓기", think: ["세 면담에서 질문의 내용과 말씨는 어떻게 달라야 할까?", "같은 질문 '힘든 점은 무엇인가요?'를 세 면담에 맞게 바꾸어 보자."] },
            { kind: "note", title: "정리: 면담 예절", text: "면담 약속을 미리 잡고, 시작할 때 목적을 밝히며, 녹음이나 사진 촬영·인용은 반드시 허락을 받는다. 끝난 뒤에는 감사 인사를 전하고, 정리한 내용을 보여 드릴 수 있다고 안내하면 좋다." }
          ]
        },
        extension: {
          goal: "실제 면담을 계획하고 수행하여 결과를 정리·공유한다.",
          points: ["면담 계획서 쓰기", "면담 수행과 보고하기"],
          blocks: [
            { kind: "activity", title: "진로 면담 프로젝트", steps: ["관심 있는 직업인 한 명을 정하고 면담 목적을 한 문장으로 쓴다.", "개방형 질문을 포함해 질문 5개 이상을 만들고 모둠에서 점검 기준으로 서로 고쳐 준다.", "실제 면담(대면·화상·전화)을 하고, 면담 중 떠오른 추가 질문을 기록한다.", "알게 된 점과 소감을 담아 면담 보고서를 쓴다."], output: "면담 계획서 + 면담 보고서", tip: "실제 면담이 어려우면 학교 교직원(행정실, 보건실, 도서관 선생님)을 면담해도 좋다." }
          ]
        }
      },
      teacherNote: "면담 목적(정보 수집, 진로 탐색, 문제 해결 등)과 상대(전문가, 어른, 또래 등)에 따라 질문과 말하기 방식이 달라져야 함을 강조한다. 질문지 작성 후 모둠별로 서로의 질문을 점검하는 활동이 효과적이다. 실제 면담이 어려울 경우 교내 교직원이나 화상 면담을 활용한다. 녹음·촬영·인용 시 동의를 받는 등 면담 윤리를 함께 지도한다."
    },
    {
      code: "[9국01-06]",
      text: "다양한 자료를 재구성하여 내용을 체계적으로 조직하고 청중이 이해하기 쉽게 발표한다.",
      verified: true,
      checked: "2026-11-09",
      sources: [
        { t: "2022 개정 국어과 교육과정(교육부 고시 제2022-33호 [별책 5]) [9국01-06] 성취기준 해설", u: "https://www.cku.ac.kr/bbs/korean/907/71198/download.do", k: "교육과정" },
        { t: "2022 개정 국어과 교육과정(교육부 고시 제2022-33호 [별책 5]) 듣기·말하기 내용 체계(청자와 매체 고려하기, 매체 활용하여 전달하기, 자료 재구성하기)", u: "https://www.cku.ac.kr/bbs/korean/907/71198/download.do", k: "교육과정" }
      ],
      title: "자료 재구성과 발표",
      keywords: ["발표", "자료 재구성", "내용 조직", "청중 분석", "매체 자료"],
      explain: [
        "**발표**는 여러 사람 앞에서 정보나 생각을 체계적으로 전달하는 공식적 말하기이다. 좋은 발표를 하려면 먼저 발표 목적, 청중의 수준과 관심, 발표 시간과 장소를 분석해야 한다.",
        "발표에 쓸 자료는 책, 통계, 신문 기사, 사진, 영상, 면담 결과 등 다양하다. 이런 자료를 그대로 옮기지 않고 목적과 청중에 맞게 **재구성**하는 것이 중요하다. 재구성이란 핵심 내용을 고르고, 어려운 내용을 쉽게 풀고, 긴 글을 표·그래프·도식으로 바꾸는 등 자료의 형태와 내용을 새롭게 짜는 것이다.",
        "교육과정은 발표 내용을 **도입부–전개부–정리부**로 나누어 체계적으로 구성하도록 한다. 도입부에서는 청중의 관심을 끌고 주제를 밝히며, 전개부에서는 발표 목적과 대상의 특성에 알맞은 설명 방법을 활용하여 시간 순서, 원인과 결과, 문제와 해결, 비교와 대조 등의 방식으로 내용을 배열하고, 정리부에서는 핵심을 요약하고 마무리한다. 발표할 때는 청중과 눈을 맞추고 알맞은 속도와 크기로 말하며, 매체 자료는 말을 돕는 수단으로 쓴다."
      ],
      concepts: [
        { term: "청중 분석", desc: "청중의 나이, 배경지식, 관심사, 태도 등을 파악하여 발표 내용과 방식을 정하는 일.", src: 0 },
        { term: "자료 재구성", desc: "수집한 여러 자료를 발표 목적과 청중이 이해하기 쉬운 방향으로 고르고 요약하고 바꾸어 새롭게 짜는 것. 예: 긴 통계 설명을 막대그래프로 바꾸기.", src: 0 },
        { term: "내용 조직 방식", desc: "발표 내용을 도입부–전개부–정리부로 나누고, 전개부에서 시간 순서, 원인–결과, 문제–해결, 비교–대조 등으로 내용을 배열하는 방법.", src: 0 },
        { term: "매체 자료", desc: "발표를 돕는 사진, 도표, 영상, 슬라이드 등. 이해를 돕되 말을 대신해서는 안 된다.", src: 1 }
      ],
      levels: {
        basic: {
          goal: "같은 내용을 담은 여러 발표 자료를 비교하여 청중이 이해하기 쉬운 자료의 특징을 발견한다.",
          points: ["글자 가득 슬라이드와 정리된 슬라이드 비교하기", "청중에 따라 자료가 달라지는 까닭 찾기"],
          blocks: [
            { kind: "case", title: "사례 1. 슬라이드 A와 B", media: { type: "svg", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><rect x='10' y='20' width='180' height='130' fill='#fff' stroke='#333'/><text x='100' y='14' font-size='12' text-anchor='middle' fill='#333'>A</text><g stroke='#bbb' stroke-width='3'><line x1='20' y1='35' x2='180' y2='35'/><line x1='20' y1='47' x2='175' y2='47'/><line x1='20' y1='59' x2='180' y2='59'/><line x1='20' y1='71' x2='170' y2='71'/><line x1='20' y1='83' x2='180' y2='83'/><line x1='20' y1='95' x2='178' y2='95'/><line x1='20' y1='107' x2='165' y2='107'/><line x1='20' y1='119' x2='180' y2='119'/><line x1='20' y1='131' x2='150' y2='131'/></g><rect x='210' y='20' width='180' height='130' fill='#fff' stroke='#333'/><text x='300' y='14' font-size='12' text-anchor='middle' fill='#333'>B</text><text x='300' y='42' font-size='13' text-anchor='middle' fill='#333'>하루 스마트폰 사용</text><rect x='230' y='110' width='25' height='25' fill='#bbb'/><rect x='265' y='70' width='25' height='65' fill='#bbb'/><rect x='300' y='78' width='25' height='57' fill='#2e7d4f'/><rect x='335' y='112' width='25' height='23' fill='#2e7d4f'/><line x1='225' y1='135' x2='370' y2='135' stroke='#333'/><text x='200' y='180' font-size='12' text-anchor='middle' fill='#333'>같은 설문 결과를 담은 두 장의 슬라이드</text></svg>" }, text: "두 모둠이 같은 설문 결과를 발표했다. A 모둠은 설문 내용을 문장으로 모두 옮겼고, B 모둠은 그래프 하나와 제목만 넣었다.", think: ["어느 슬라이드가 한눈에 들어오는가? 왜 그럴까?", "B 모둠은 A의 내용 가운데 무엇을 버리고 무엇을 바꾸었을까?"] },
            { kind: "case", title: "사례 2. 같은 주제, 다른 청중", text: "주제: 물 절약\n청중 ①: 초등학교 2학년 — '양치할 때 컵을 쓰면 물이 얼마나 줄까요?' 그림과 함께 설명\n청중 ②: 우리 학교 학부모 — 가정용 수도 요금 변화 표와 절약 기기 정보 제시", think: ["두 발표는 무엇을 기준으로 내용을 바꾸었을까?", "청중을 생각하지 않고 발표하면 어떤 일이 생길까?"] },
            { kind: "video", title: "말할 때 떨림을 줄이는 아이컨택 연습", url: "https://www.youtube.com/watch?v=EfVzSBBqEDg", source: "말버스(스피치 교육 채널)", note: "자료가 좋아도 전달이 중요하다. 발표자가 청중과 눈을 맞추는 방법에 주목한다." },
            { kind: "note", title: "발견한 개념", text: "좋은 발표 자료는 모은 자료를 그대로 옮기지 않고 **목적과 청중에 맞게** 고르고, 줄이고, 그래프·그림으로 바꾼 것이다. 이를 **자료 재구성**이라고 한다. 발표는 청중의 수준과 관심을 먼저 살피는 **청중 분석**에서 시작하며, 내용은 도입부–전개부–정리부로 **체계적으로 조직**한다." }
          ]
        },
        advanced: {
          goal: "여러 자료를 목적에 맞게 배치하고 재구성하는 방법을 비교·분석한다.",
          points: ["조직 방식에 따라 자료 배치하기", "자료를 다른 형태로 바꾸기"],
          blocks: [
            { kind: "svg", title: "문제–원인–해결 구조로 자료 배치하기", svg: "<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'><rect width='400' height='200' fill='#f6f7f6'/><g fill='#2e7d4f'><rect x='10' y='15' width='120' height='34' rx='8'/><rect x='140' y='15' width='120' height='34' rx='8'/><rect x='270' y='15' width='120' height='34' rx='8'/></g><g font-size='13' text-anchor='middle' fill='#fff'><text x='70' y='37'>문제</text><text x='200' y='37'>원인</text><text x='330' y='37'>해결</text></g><g fill='#fff' stroke='#333'><rect x='10' y='58' width='120' height='130' rx='8'/><rect x='140' y='58' width='120' height='130' rx='8'/><rect x='270' y='58' width='120' height='130' rx='8'/></g><g font-size='11' text-anchor='middle' fill='#333'><text x='70' y='86'>하천 오염 사진</text><text x='70' y='110'>5년간 수질</text><text x='70' y='126'>변화 그래프</text><text x='200' y='86'>환경 단체</text><text x='200' y='102'>면담 내용</text><text x='330' y='86'>다른 지역</text><text x='330' y='102'>하천 복원 사례</text></g><text x='200' y='160' font-size='11' text-anchor='middle' fill='#888'>하천의 옛이야기 → 주제와 멀어 제외</text></svg>", caption: "'우리 마을 하천 오염' 발표를 위해 모은 자료를 구조에 맞게 배치한 예" },
            { kind: "case", title: "분석 자료. 설문 결과 숫자", text: "우리 학교 학생 300명 설문: 하루 스마트폰 사용 1시간 미만 30명, 1~3시간 120명, 3~5시간 105명, 5시간 이상 45명. 3시간 이상 사용하는 학생 가운데 60%가 수면 부족을 겪는다고 답했다.", think: ["이 숫자들을 말로만 들으면 기억에 남을까?", "어떤 그래프로 바꾸면 '3시간 이상이 절반'이라는 점이 잘 보일까?"] },
            { kind: "note", title: "정리: 재구성의 네 가지 방법", text: "① **고르기**: 목적과 관련된 자료만 남긴다. ② **줄이기**: 긴 글은 핵심어로 요약한다. ③ **바꾸기**: 숫자는 그래프로, 과정은 도식으로 바꾼다. ④ **쉽게 풀기**: 어려운 낱말은 청중 수준에 맞게 풀어 말한다. 자료 출처는 슬라이드 아래에 꼭 밝힌다." }
          ]
        },
        extension: {
          goal: "여러 자료를 재구성하여 실제 발표를 하고 평가한다.",
          points: ["발표 계획·실행하기", "동료 평가와 자기 평가"],
          blocks: [
            { kind: "activity", title: "3분 발표 프로젝트", steps: ["'우리 지역의 자랑' 또는 '청소년이 알아야 할 생활 정보' 가운데 주제를 고른다.", "통계, 사진, 면담, 기사 등 세 종류 이상의 자료를 모은다.", "청중 분석표를 쓰고, 자료를 고르기·줄이기·바꾸기로 재구성한다.", "도입–전개–정리 개요와 슬라이드 3~5장을 만들어 발표한다.", "동료 평가표로 서로 평가하고 고칠 점을 정리한다."], output: "발표 개요, 슬라이드, 동료 평가표", tip: "슬라이드 한 장에 글자는 핵심어 위주로 넣고, 말로 설명할 내용은 발표 메모에 적는다." }
          ]
        }
      },
      teacherNote: "자료를 그대로 옮겨 읽는 발표가 되지 않도록 자료를 고르고, 요약하고, 바꾸는 과정을 명시적으로 지도한다. 청중 분석이 자료 재구성과 내용 조직의 기준이 됨을 강조한다. 슬라이드에 글자를 지나치게 많이 넣는 등 매체 자료가 발표를 대신하는 문제를 경계하게 한다. 출처 표시와 저작권 존중을 함께 지도한다."
    }
  ]
});
