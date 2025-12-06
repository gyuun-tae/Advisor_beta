# ADviser.html 코드 구조 다이어그램

## 📐 전반적인 구조

```
ADviser.html (653줄)
│
├── HEAD (1-60줄)
│   ├── Meta 태그
│   ├── 외부 CSS/JS (Tailwind, Lucide, Pretendard)
│   └── 커스텀 스타일
│
├── BODY (61-377줄)
│   ├── App Container
│   │   ├── VIEW: HOME (67-135줄)
│   │   ├── VIEW: DIAGNOSIS (138-154줄)
│   │   ├── VIEW: ANALYTICS (157-221줄)
│   │   ├── VIEW: GROWTH (224-286줄)
│   │   ├── VIEW: MYINFO (289-336줄)
│   │   ├── Bottom Navigation (339-356줄)
│   │   └── Reward Modal (359-374줄)
│   └── JavaScript Logic (379-651줄)
│
└── </body></html> (652-653줄)
```

---

## 🔄 화면 전환 흐름

```
[홈 화면] ←→ [건강검진] ←→ [성과 분석] ←→ [성장] ←→ [내 정보]
   ↑                                                           ↓
   └─────────────────── [하단 네비게이션] ────────────────────┘
```

---

## 🎯 건강검진 프로세스 플로우

```
[대기 화면 (idle)]
    │
    │ startDiagnosis() 호출
    ↓
[분석 중 (analyzing)]
    │
    │ 2초 대기
    ↓
[결과 화면 (result)]
    │
    ├── 점수 표시 (0 → 62 카운트업)
    ├── 퍼널 차트 렌더링
    ├── 진행 바 애니메이션
    └── 500ms 후 보상 모달 표시
```

---

## 📊 데이터 구조

### diagnosisState 객체
```javascript
{
    step: 'idle' | 'analyzing' | 'result',
    data: {
        exposure: {
            label: '노출',
            count: 15400,
            rate: 100,
            status: 'good',
            icon: 'search'
        },
        click: {
            label: '클릭',
            count: 185,
            rate: 1.2,
            status: 'danger',  // ⚠️ 경고 상태
            icon: 'mouse-pointer-2'
        },
        purchase: {
            label: '주문',
            count: 45,
            rate: 24.3,
            status: 'normal',
            icon: 'shopping-bag'
        },
        repurchase: {
            label: '재주문',
            count: 12,
            rate: 26.6,
            status: 'normal',
            icon: 'heart-handshake'
        }
    }
}
```

---

## 🎨 CSS 클래스 구조

### View 전환
```css
.view-section {
    display: none;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}

.view-section.active {
    display: flex;
    flex-direction: column;
    opacity: 1;
}
```

### 애니메이션
- `animate-fade-in`: 페이드 인 애니메이션
- `progress-bar`: 진행 바 전환 (1초)
- `no-scrollbar`: 스크롤바 숨김

---

## 🔧 주요 JavaScript 함수

### 1. navigateTo(viewId)
```
입력: viewId (문자열)
처리:
  1. 모든 .view-section에서 'active' 제거
  2. view-{viewId} 요소에 'active' 추가
  3. 건강검진 화면이면 초기화 체크
  4. 하단 네비게이션 하이라이트 업데이트
  5. Lucide 아이콘 재생성
출력: 없음 (DOM 조작)
```

### 2. renderDiagnosisIdle()
```
처리:
  1. diagnosisState.step = 'idle'
  2. 대기 화면 HTML 생성
  3. diagnosisContainer에 삽입
  4. 리셋 버튼 숨김
  5. 아이콘 초기화
```

### 3. renderAnalyzing()
```
처리:
  1. diagnosisState.step = 'analyzing'
  2. 로딩 화면 HTML 생성
  3. diagnosisContainer에 삽입
```

### 4. renderResult()
```
처리:
  1. diagnosisState.step = 'result'
  2. 결과 화면 HTML 생성
     - 점수 섹션 (SVG 원형 차트)
     - 퍼널 리스트
     - 액션 카드
     - 면책 고지
  3. DOM 삽입
  4. 애니메이션 시작:
     - 점수 카운트업 (0→62)
     - 원형 프로그레스
     - 진행 바 애니메이션
  5. 500ms 후 보상 모달 표시
```

### 5. createFunnelRow(item, themeColor, prevCount, isLast)
```
입력:
  - item: 퍼널 아이템 객체
  - themeColor: 테마 색상 ('blue', 'purple', 'pink', 'green')
  - prevCount: 이전 단계 카운트 (전환율 계산용)
  - isLast: 마지막 아이템 여부

처리:
  1. 테마 색상 매핑
  2. 위험 상태 체크 (status === 'danger')
  3. 진행 바 너비 계산
  4. HTML 문자열 생성

출력: HTML 문자열
```

---

## 🎭 이벤트 흐름

### 진단 시작 이벤트
```
사용자 클릭: "지금 바로 진단하기" 버튼
    ↓
onclick="startDiagnosis()"
    ↓
renderAnalyzing() 호출
    ↓
2초 후 setTimeout
    ↓
renderResult() 호출
    ↓
애니메이션 시작
    ↓
500ms 후 모달 표시
```

### 네비게이션 이벤트
```
하단 네비게이션 버튼 클릭
    ↓
onclick="navigateTo('view-id')"
    ↓
navigateTo() 함수 실행
    ↓
뷰 전환 + 네비게이션 하이라이트 업데이트
```

---

## 📱 반응형 브레이크포인트

현재 코드는 **모바일 퍼스트**로 설계:

```css
max-w-md  /* 최대 너비: 28rem (448px) */
```

태블릿/데스크톱 지원은 없음 (개선 필요)

---

## 🔐 보안 고려사항

### 현재 상태
- ❌ XSS 방지: 없음 (외부 CDN 사용)
- ❌ CSRF 보호: 없음 (API 호출 없음)
- ❌ 입력 검증: 없음 (입력 없음)
- ⚠️ CDN 신뢰: 외부 CDN에 의존

### 권장사항
- Subresource Integrity (SRI) 추가
- Content Security Policy (CSP) 설정

---

## 🚀 성능 최적화 기회

### 현재
- 모든 뷰가 DOM에 존재 (메모리 사용)
- 인라인 스타일 다수
- 이미지 최적화 없음

### 개선안
1. **레이지 로딩**: 뷰를 필요할 때만 생성
2. **이미지 최적화**: WebP 포맷, lazy loading
3. **코드 스플리팅**: 필요시에만 로드
4. **캐싱**: Service Worker 활용

---

## 📋 체크리스트

### 기능 완성도
- [x] 홈 화면
- [x] 건강검진 (3단계)
- [x] 성과 분석
- [x] 성장 화면
- [x] 내 정보
- [x] 하단 네비게이션
- [x] 모달

### 데이터
- [ ] 실제 API 연동
- [ ] 데이터베이스 연결
- [ ] 사용자 인증
- [ ] 데이터 저장

### UX/UI
- [x] 애니메이션
- [x] 반응형 (모바일)
- [ ] 에러 처리
- [ ] 로딩 상태
- [ ] 빈 상태 처리

### 접근성
- [ ] 키보드 네비게이션
- [ ] ARIA 라벨
- [ ] 스크린 리더 지원
- [ ] 색상 대비

---

## 💡 코드 리뷰 요약

| 항목 | 평가 | 비고 |
|------|------|------|
| 구조 | ⭐⭐⭐⭐ | 명확한 섹션 분리 |
| 가독성 | ⭐⭐⭐⭐ | 주석 적절, 변수명 명확 |
| 유지보수성 | ⭐⭐⭐ | 단일 파일로 제한적 |
| 확장성 | ⭐⭐⭐ | 모듈화 필요 |
| 성능 | ⭐⭐⭐⭐ | 최적화 잘됨 |
| 보안 | ⭐⭐ | 기본 보안 부족 |
| 접근성 | ⭐⭐ | 개선 필요 |

**종합 평가**: ⭐⭐⭐⭐ (4/5)

