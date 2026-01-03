/**
 * ADViser 백엔드 서버
 * Express 기반 REST API 서버
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
// CORS 설정: 개발 환경에서는 localhost/127.0.0.1의 모든 포트 허용
const corsOptions = {
    origin: function (origin, callback) {
        // 개발 환경
        if (process.env.NODE_ENV !== 'production') {
            // localhost나 127.0.0.1의 모든 포트 허용
            if (!origin || 
                origin.startsWith('http://localhost:') || 
                origin.startsWith('http://127.0.0.1:') ||
                origin === 'file://') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        } else {
            // 프로덕션 환경에서는 특정 origin만 허용
            const allowedOrigins = [
                'https://yourdomain.com',
                // 프로덕션 도메인 추가
            ];
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/api/auth', authRoutes);

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ADViser API Server is running' });
});

// 404 핸들러
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 데이터베이스 초기화 및 서버 시작
const startServer = async () => {
    try {
        // 데이터베이스 연결 테스트
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ 데이터베이스 연결 실패. 서버를 시작할 수 없습니다.');
            process.exit(1);
        }

        // 데이터베이스 테이블 생성 (없으면 생성)
        await sequelize.sync({ alter: false }); // alter: true는 프로덕션에서 주의
        console.log('✅ 데이터베이스 테이블 동기화 완료');

        // 서버 시작
        app.listen(PORT, () => {
            console.log(`🚀 ADViser API Server is running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ 서버 시작 실패:', error);
        process.exit(1);
    }
};

startServer();

