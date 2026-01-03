/**
 * 데이터베이스 초기화 스크립트
 * 테스트 사용자 생성 등 초기 데이터 설정
 */

const { sequelize, testConnection } = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const initDatabase = async () => {
    try {
        console.log('🔄 데이터베이스 초기화 시작...');

        // 데이터베이스 연결 테스트
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ 데이터베이스 연결 실패');
            process.exit(1);
        }

        // 테이블 생성
        await sequelize.sync({ force: false }); // force: true는 모든 데이터 삭제 후 재생성
        console.log('✅ 데이터베이스 테이블 생성 완료');

        // 테스트 사용자 확인 및 생성
        const testUser = await User.findOne({ where: { email: 'test@adviser.com' } });
        
        if (!testUser) {
            // 테스트 사용자 생성
            const hashedPassword = await bcrypt.hash('test123', 10);
            await User.create({
                email: 'test@adviser.com',
                password: hashedPassword,
                name: '김사장',
                businessType: '음식점',
                region: '서울'
            });
            console.log('✅ 테스트 사용자 생성 완료 (test@adviser.com / test123)');
        } else {
            console.log('ℹ️  테스트 사용자가 이미 존재합니다.');
        }

        console.log('✅ 데이터베이스 초기화 완료');
        process.exit(0);
    } catch (error) {
        console.error('❌ 데이터베이스 초기화 실패:', error);
        process.exit(1);
    }
};

initDatabase();

