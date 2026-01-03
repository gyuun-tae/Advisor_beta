/**
 * User 모델
 * 사용자 정보를 저장하는 데이터베이스 모델
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100] // 최소 6자
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 50]
        }
    },
    businessType: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    region: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    }
}, {
    tableName: 'users',
    timestamps: true, // createdAt, updatedAt 자동 생성
    hooks: {
        // 비밀번호 저장 전 자동 해싱
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// 인스턴스 메서드: 비밀번호 검증
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// 인스턴스 메서드: 사용자 정보 반환 (비밀번호 제외)
User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = User;

