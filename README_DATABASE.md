# ADViser 데이터베이스 가이드

## 📋 개요

ADViser는 Sequelize ORM을 사용하여 SQLite(개발)와 PostgreSQL(프로덕션)을 모두 지원합니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 데이터베이스 초기화

```bash
npm run init-db
```

이 명령어는:
- 데이터베이스 테이블을 생성합니다
- 테스트 사용자를 생성합니다 (test@adviser.com / test123)

### 3. 서버 실행

```bash
npm start
# 또는 개발 모드
npm run dev
```

## 🗄️ 데이터베이스 설정

### SQLite (기본값 - 개발 환경)

`.env` 파일이 없거나 `DB_TYPE`이 설정되지 않으면 SQLite를 사용합니다.

데이터베이스 파일: `backend/database.sqlite`

### PostgreSQL (프로덕션)

`.env` 파일에 다음 설정을 추가하세요:

```env
DB_TYPE=postgres
DB_NAME=adviser_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

## 📁 프로젝트 구조

```
backend/
├── config/
│   └── database.js      # 데이터베이스 설정
├── models/
│   └── User.js          # User 모델
├── routes/
│   └── auth.js          # 인증 라우트 (Sequelize 사용)
├── scripts/
│   └── init-db.js       # 데이터베이스 초기화 스크립트
└── server.js            # 서버 메인 파일
```

## 🔄 SQLite → PostgreSQL 전환

### 1. 환경 변수 변경

`.env` 파일 수정:
```env
DB_TYPE=postgres
DB_NAME=adviser_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
```

### 2. 데이터 마이그레이션

SQLite 데이터를 PostgreSQL로 전환:

```bash
# SQLite 데이터 export (선택사항)
# 또는 직접 Sequelize 마이그레이션 사용
```

### 3. 코드 변경

**코드 변경 불필요!** Sequelize가 자동으로 처리합니다.

## 📊 User 모델 스키마

```javascript
{
  id: INTEGER (Primary Key, Auto Increment)
  email: STRING (Unique, Required)
  password: STRING (Required, Hashed)
  name: STRING (Required)
  businessType: STRING (Optional)
  region: STRING (Optional)
  createdAt: DATE (Auto)
  updatedAt: DATE (Auto)
}
```

## 🔐 보안 기능

- **비밀번호 해싱**: bcrypt를 사용하여 자동 해싱 (모델 훅)
- **비밀번호 검증**: `validatePassword()` 메서드
- **비밀번호 제외**: `toJSON()` 메서드로 자동 제외

## 🛠️ Sequelize 명령어

### 테이블 생성
```javascript
await sequelize.sync(); // 테이블 생성/업데이트
```

### 사용자 조회
```javascript
const user = await User.findByPk(1);
const user = await User.findOne({ where: { email } });
```

### 사용자 생성
```javascript
const user = await User.create({
  email: 'user@example.com',
  password: 'password123',
  name: '홍길동'
});
```

### 사용자 업데이트
```javascript
await user.update({ name: '새 이름' });
```

### 사용자 삭제
```javascript
await user.destroy();
```

## 📝 주의사항

1. **프로덕션 환경**에서는 `sequelize.sync({ force: true })`를 사용하지 마세요. 데이터가 삭제됩니다.
2. **마이그레이션**: 프로덕션에서는 Sequelize 마이그레이션을 사용하는 것을 권장합니다.
3. **백업**: 정기적으로 데이터베이스를 백업하세요.

## 🐛 문제 해결

### 데이터베이스 연결 실패
- SQLite: 파일 권한 확인
- PostgreSQL: 서버 실행 상태 및 연결 정보 확인

### 테이블이 생성되지 않음
- `npm run init-db` 실행
- 또는 서버 시작 시 자동 생성됨

### 비밀번호 검증 실패
- 모델의 `beforeCreate` 훅이 제대로 작동하는지 확인
- bcrypt 버전 확인

## 📚 추가 리소스

- [Sequelize 공식 문서](https://sequelize.org/)
- [SQLite 문서](https://www.sqlite.org/docs.html)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)

