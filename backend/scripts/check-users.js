/**
 * 데이터베이스 사용자 조회 스크립트
 */

const { sequelize } = require('../config/database');
const User = require('../models/User');

const checkUsers = async () => {
    try {
        // 데이터베이스 연결
        await sequelize.authenticate();
        console.log('✅ 데이터베이스 연결 성공\n');

        // 모든 사용자 조회
        const users = await User.findAll({
            attributes: ['id', 'email', 'name', 'businessType', 'region', 'createdAt'],
            order: [['createdAt', 'DESC']] // 최신순 정렬
        });

        console.log(`📊 총 사용자 수: ${users.length}명\n`);

        if (users.length === 0) {
            console.log('❌ 등록된 사용자가 없습니다.');
        } else {
            console.log('👥 사용자 목록:');
            console.log('─'.repeat(80));
            users.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.id}`);
                console.log(`   이름: ${user.name}`);
                console.log(`   이메일: ${user.email}`);
                console.log(`   업종: ${user.businessType || '(없음)'}`);
                console.log(`   지역: ${user.region || '(없음)'}`);
                console.log(`   가입일: ${user.createdAt}`);
                console.log('─'.repeat(80));
            });

            // '국윤태' 사용자 검색
            const targetUser = users.find(u => u.name === '국윤태');
            if (targetUser) {
                console.log('\n✅ "국윤태" 사용자를 찾았습니다!');
                console.log(`   ID: ${targetUser.id}`);
                console.log(`   이메일: ${targetUser.email}`);
                console.log(`   업종: ${targetUser.businessType || '(없음)'}`);
                console.log(`   지역: ${targetUser.region || '(없음)'}`);
                console.log(`   가입일: ${targetUser.createdAt}`);
            } else {
                console.log('\n❌ "국윤태" 사용자를 찾을 수 없습니다.');
            }
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ 오류 발생:', error);
        process.exit(1);
    }
};

checkUsers();

