/**
 * ADViser 백엔드 서버
 * Express 기반 REST API 서버
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:5500', 'file://'],
    credentials: true
}));
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

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 ADViser API Server is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

