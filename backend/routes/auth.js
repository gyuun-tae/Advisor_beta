/**
 * 인증 라우트
 * 로그인, 회원가입, 토큰 검증 등 인증 관련 API
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// 임시 사용자 데이터베이스 (실제로는 DB 사용)
const users = [
    {
        id: 1,
        email: 'test@adviser.com',
        password: '$2b$10$rQZ8K5J5K5K5K5K5K5K5Ku5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K', // password: test123
        name: '김사장',
        businessType: '음식점',
        region: '서울'
    }
];

// JWT 시크릿 키 (실제로는 환경 변수로 관리)
const JWT_SECRET = process.env.JWT_SECRET || 'adviser-secret-key-change-in-production';

/**
 * POST /api/auth/login
 * 로그인
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 입력 검증
        if (!email || !password) {
            return res.status(400).json({ 
                message: '이메일과 비밀번호를 입력해주세요.' 
            });
        }

        // 사용자 찾기
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ 
                message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
            });
        }

        // 비밀번호 확인 (실제로는 해시된 비밀번호와 비교)
        // 데모용: test@adviser.com / test123
        const isValidPassword = email === 'test@adviser.com' && password === 'test123';
        
        if (!isValidPassword) {
            // 실제로는 bcrypt.compare 사용
            // const isValidPassword = await bcrypt.compare(password, user.password);
            return res.status(401).json({ 
                message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
            });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 사용자 정보 반환 (비밀번호 제외)
        const userInfo = {
            id: user.id,
            email: user.email,
            name: user.name,
            businessType: user.businessType,
            region: user.region
        };

        res.json({
            message: '로그인 성공',
            token,
            user: userInfo
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: '로그인 중 오류가 발생했습니다.' 
        });
    }
});

/**
 * GET /api/auth/validate
 * 토큰 검증
 */
router.get('/validate', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: '인증 토큰이 필요합니다.' 
            });
        }

        const token = authHeader.substring(7);
        
        // 토큰 검증
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 사용자 찾기
        const user = users.find(u => u.id === decoded.userId);
        if (!user) {
            return res.status(401).json({ 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }

        // 사용자 정보 반환
        const userInfo = {
            id: user.id,
            email: user.email,
            name: user.name,
            businessType: user.businessType,
            region: user.region
        };

        res.json({
            valid: true,
            user: userInfo
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: '유효하지 않은 토큰입니다.' 
            });
        }
        
        console.error('Token validation error:', error);
        res.status(500).json({ 
            message: '토큰 검증 중 오류가 발생했습니다.' 
        });
    }
});

/**
 * POST /api/auth/register
 * 회원가입 (추후 구현)
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, businessType, region } = req.body;

        // 입력 검증
        if (!email || !password || !name) {
            return res.status(400).json({ 
                message: '필수 정보를 모두 입력해주세요.' 
            });
        }

        // 이메일 중복 확인
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({ 
                message: '이미 등록된 이메일입니다.' 
            });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 새 사용자 생성
        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPassword,
            name,
            businessType: businessType || '',
            region: region || ''
        };

        users.push(newUser);

        // JWT 토큰 생성
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 사용자 정보 반환
        const userInfo = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            businessType: newUser.businessType,
            region: newUser.region
        };

        res.status(201).json({
            message: '회원가입 성공',
            token,
            user: userInfo
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: '회원가입 중 오류가 발생했습니다.' 
        });
    }
});

module.exports = router;

