# ADViser 로그인 시스템 가이드

## 📋 개요

ADViser에 백엔드 API 기반 로그인 시스템이 구현되었습니다.

## 🚀 빠른 시작

### 1. 백엔드 서버 실행

```bash
# backend 폴더로 이동
cd backend

# 의존성 설치
npm install

# 서버 실행
npm start

# 또는 개발 모드 (nodemon 사용)
npm run dev
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

### 2. 프론트엔드 실행

브라우저에서 `login.html` 파일을 열거나, 로컬 서버를 통해 접속하세요.

## 🔐 테스트 계정

**이메일**: `test@adviser.com`  
**비밀번호**: `test123`

## 📁 프로젝트 구조

```
Advisor_beta/
├── login.html              # 로그인 페이지
├── login.css               # 로그인 페이지 스타일
├── home.html               # 홈 페이지 (인증 필요)
├── home.css                # 홈 페이지 스타일
├── js/
│   └── auth.js            # 인증 관리 클라이언트 로직
└── backend/
    ├── server.js          # Express 서버
    ├── package.json       # 백엔드 의존성
    ├── routes/
    │   └── auth.js        # 인증 라우트
    └── middleware/
        └── auth.js        # 인증 미들웨어
```

## 🔌 API 엔드포인트

### POST /api/auth/login
로그인 요청

**Request Body:**
```json
{
  "email": "test@adviser.com",
  "password": "test123"
}
```

**Response:**
```json
{
  "message": "로그인 성공",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": 1,
    "email": "test@adviser.com",
    "name": "김사장",
    "businessType": "음식점",
    "region": "서울"
  }
}
```

### GET /api/auth/validate
토큰 검증

**Headers:**
```
Authorization: Bearer JWT_TOKEN_HERE
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "email": "test@adviser.com",
    "name": "김사장",
    "businessType": "음식점",
    "region": "서울"
  }
}
```

### POST /api/auth/register
회원가입 (구현됨, 테스트 가능)

**Request Body:**
```json
{
  "email": "new@adviser.com",
  "password": "password123",
  "name": "홍길동",
  "businessType": "카페",
  "region": "부산"
}
```

## 🔒 인증 흐름

1. 사용자가 `login.html`에서 이메일과 비밀번호 입력
2. `auth.js`가 `/api/auth/login`으로 요청 전송
3. 서버가 JWT 토큰 생성 및 반환
4. 클라이언트가 토큰을 localStorage 또는 sessionStorage에 저장
5. 이후 요청 시 `Authorization: Bearer TOKEN` 헤더 포함
6. 보호된 페이지 접근 시 자동으로 인증 확인

## 🛠 기술 스택

### 프론트엔드
- HTML5, CSS3
- Vanilla JavaScript (ES6+)
- LocalStorage/SessionStorage

### 백엔드
- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcrypt (비밀번호 해싱)
- CORS

## 📝 주요 기능

- ✅ 로그인/로그아웃
- ✅ JWT 토큰 기반 인증
- ✅ 토큰 검증
- ✅ 자동 리다이렉트 (미인증 시 로그인 페이지로)
- ✅ 로그인 상태 유지 옵션
- ✅ 사용자 정보 동적 표시
- ✅ 회원가입 API (구현됨)

## 🔧 환경 변수 설정

`backend/.env` 파일 생성 (선택사항):

```env
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## ⚠️ 주의사항

1. **프로덕션 환경**에서는 반드시 `.env` 파일을 사용하여 JWT_SECRET을 설정하세요.
2. 현재는 메모리 기반 사용자 저장소를 사용합니다. 실제 프로덕션에서는 데이터베이스(MongoDB, PostgreSQL 등)를 사용해야 합니다.
3. CORS 설정은 개발 환경에 맞춰져 있습니다. 프로덕션에서는 적절히 수정하세요.

## 🐛 문제 해결

### CORS 오류
- 백엔드 서버가 실행 중인지 확인하세요.
- `backend/server.js`의 CORS 설정을 확인하세요.

### 로그인 실패
- 이메일과 비밀번호가 정확한지 확인하세요.
- 브라우저 콘솔에서 에러 메시지를 확인하세요.
- 백엔드 서버 로그를 확인하세요.

### 토큰 검증 실패
- 토큰이 만료되었을 수 있습니다. 다시 로그인하세요.
- localStorage/sessionStorage를 확인하세요.

## 📚 다음 단계

1. 데이터베이스 연동 (MongoDB 또는 PostgreSQL)
2. 비밀번호 재설정 기능
3. 소셜 로그인 (Google, Naver 등)
4. 이메일 인증
5. 세션 관리 개선

