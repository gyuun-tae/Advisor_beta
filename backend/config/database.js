/**
 * 데이터베이스 설정
 * SQLite (개발) 및 PostgreSQL (프로덕션) 지원
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// 환경 변수로 데이터베이스 타입 선택
const dbType = process.env.DB_TYPE || 'sqlite'; // 'sqlite' 또는 'postgres'

let sequelize;

if (dbType === 'sqlite') {
    // SQLite 설정 (개발 환경)
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    });
} else {
    // PostgreSQL 설정 (프로덕션 환경)
    sequelize = new Sequelize(
        process.env.DB_NAME || 'adviser_db',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

// 데이터베이스 연결 테스트
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ 데이터베이스 연결 성공');
        return true;
    } catch (error) {
        console.error('❌ 데이터베이스 연결 실패:', error);
        return false;
    }
};

module.exports = { sequelize, testConnection };

