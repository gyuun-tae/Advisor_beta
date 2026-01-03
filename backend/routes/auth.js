/**
 * 인증 라우트
 * 로그인, 회원가입, 토큰 검증 등 인증 관련 API
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

// JWT 시크릿 키
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

        // 사용자 찾기 (비밀번호 포함)
        const user = await User.findOne({ 
            where: { email },
            attributes: { include: ['password'] } // 비밀번호도 포함하여 가져오기
        });

        if (!user) {
            return res.status(401).json({ 
                message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
            });
        }

        // 비밀번호 확인
        const isValidPassword = await user.validatePassword(password);
        
        if (!isValidPassword) {
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

        // 사용자 정보 반환 (비밀번호 제외 - toJSON 메서드가 자동 처리)
        res.json({
            message: '로그인 성공',
            token,
            user: user.toJSON()
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
router.get('/validate', async (req, res) => {
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
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({ 
                message: '사용자를 찾을 수 없습니다.' 
            });
        }

        // 사용자 정보 반환 (비밀번호 제외)
        res.json({
            valid: true,
            user: user.toJSON()
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

        // 비밀번호 길이 검증
        if (password.length < 6) {
            return res.status(400).json({ 
                message: '비밀번호는 최소 6자 이상이어야 합니다.' 
            });
        }

        // 이메일 중복 확인
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ 
                message: '이미 등록된 이메일입니다.' 
            });
        }

        // 새 사용자 생성 (비밀번호는 모델의 beforeCreate 훅에서 자동 해싱)
        const newUser = await User.create({
            email,
            password, // 모델에서 자동으로 해싱됨
            name,
            businessType: businessType || '',
            region: region || ''
        });

        // JWT 토큰 생성
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 사용자 정보 반환 (비밀번호 제외)
        res.status(201).json({
            message: '회원가입 성공',
            token,
            user: newUser.toJSON()
        });
    } catch (error) {
        // Sequelize 유효성 검사 오류 처리
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            return res.status(400).json({ 
                message: messages 
            });
        }

        // 중복 키 오류 처리
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ 
                message: '이미 등록된 이메일입니다.' 
            });
        }

        console.error('Registration error:', error);
        res.status(500).json({ 
            message: '회원가입 중 오류가 발생했습니다.' 
        });
    }
});

module.exports = router;

