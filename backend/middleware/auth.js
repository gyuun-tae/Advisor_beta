/**
 * 인증 미들웨어
 * JWT 토큰 검증 미들웨어
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'adviser-secret-key-change-in-production';

/**
 * JWT 토큰 검증 미들웨어
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            message: '인증 토큰이 필요합니다.' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ 
                message: '유효하지 않은 토큰입니다.' 
            });
        }

        req.user = decoded;
        next();
    });
};

module.exports = { authenticateToken };

