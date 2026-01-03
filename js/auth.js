/**
 * ADViser 인증 관리 시스템
 * 로그인, 로그아웃, 인증 상태 관리
 */

// API 기본 URL (개발 환경)
const API_BASE_URL = 'http://localhost:3000/api';

// 인증 상태 관리 클래스
class AuthManager {
    constructor() {
        this.isAuthenticated = this.checkAuth();
        this.currentUser = this.getCurrentUser();
    }

    /**
     * 로그인 처리
     * @param {string} email - 사용자 이메일
     * @param {string} password - 사용자 비밀번호
     * @param {boolean} rememberMe - 로그인 상태 유지 여부
     * @returns {Promise<Object>} 로그인 결과
     */
    async login(email, password, rememberMe = false) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '로그인에 실패했습니다.');
            }

            // 토큰 및 사용자 정보 저장
            if (rememberMe) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('user', JSON.stringify(data.user));
            }

            this.isAuthenticated = true;
            this.currentUser = data.user;

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 회원가입 처리
     * @param {string} email - 사용자 이메일
     * @param {string} password - 사용자 비밀번호
     * @param {string} name - 사용자 이름
     * @param {string} businessType - 업종 (선택사항)
     * @param {string} region - 지역 (선택사항)
     * @returns {Promise<Object>} 회원가입 결과
     */
    async register(email, password, name, businessType = '', region = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    name, 
                    businessType, 
                    region 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '회원가입에 실패했습니다.');
            }

            // 토큰 및 사용자 정보 저장
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));

            this.isAuthenticated = true;
            this.currentUser = data.user;

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 로그아웃 처리
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        this.isAuthenticated = false;
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    /**
     * 인증 상태 확인
     * @returns {boolean} 인증 여부
     */
    checkAuth() {
        return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
    }

    /**
     * 현재 사용자 정보 가져오기
     * @returns {Object|null} 사용자 정보
     */
    getCurrentUser() {
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    /**
     * 토큰 가져오기
     * @returns {string|null} JWT 토큰
     */
    getToken() {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    }

    /**
     * 인증된 요청을 위한 헤더 가져오기
     * @returns {Object} Authorization 헤더가 포함된 객체
     */
    getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    /**
     * 토큰 유효성 검증
     * @returns {Promise<boolean>} 토큰 유효성
     */
    async validateToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/validate`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                return true;
            } else {
                // 토큰이 유효하지 않으면 저장된 정보 삭제
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }
}

// 전역 인증 관리자 인스턴스
const authManager = new AuthManager();

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 로그인 페이지인 경우
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const rememberCheckbox = document.getElementById('remember');
        const errorMessage = document.getElementById('error-message');
        const loginBtn = loginForm.querySelector('.login-btn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 에러 메시지 숨기기
            errorMessage.style.display = 'none';
            
            // 버튼 비활성화 및 로딩 표시
            loginBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            const result = await authManager.login(email, password, rememberCheckbox.checked);

            if (result.success) {
                // 로그인 성공 - 홈으로 이동
                window.location.href = 'home.html';
            } else {
                // 로그인 실패 - 에러 메시지 표시
                errorMessage.textContent = result.error || '로그인에 실패했습니다.';
                errorMessage.style.display = 'block';
                
                // 버튼 활성화
                loginBtn.disabled = false;
                btnText.style.display = 'inline-block';
                btnLoader.style.display = 'none';
            }
        });

        // 이미 로그인된 경우 홈으로 리다이렉트
        if (authManager.isAuthenticated) {
            window.location.href = 'home.html';
        }
    }

    // 회원가입 페이지인 경우
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const passwordConfirmInput = document.getElementById('passwordConfirm');
        const businessTypeInput = document.getElementById('businessType');
        const regionInput = document.getElementById('region');
        const errorMessage = document.getElementById('error-message');
        const signupBtn = signupForm.querySelector('.login-btn');
        const btnText = signupBtn.querySelector('.btn-text');
        const btnLoader = signupBtn.querySelector('.btn-loader');

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 에러 메시지 숨기기
            errorMessage.style.display = 'none';
            
            // 입력값 가져오기
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;
            const businessType = businessTypeInput.value.trim();
            const region = regionInput.value.trim();

            // 입력 검증
            if (!name || !email || !password || !passwordConfirm) {
                errorMessage.textContent = '필수 정보를 모두 입력해주세요.';
                errorMessage.style.display = 'block';
                return;
            }

            // 비밀번호 확인 검증
            if (password !== passwordConfirm) {
                errorMessage.textContent = '비밀번호가 일치하지 않습니다.';
                errorMessage.style.display = 'block';
                return;
            }

            // 비밀번호 길이 검증
            if (password.length < 6) {
                errorMessage.textContent = '비밀번호는 최소 6자 이상이어야 합니다.';
                errorMessage.style.display = 'block';
                return;
            }

            // 버튼 비활성화 및 로딩 표시
            signupBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';

            const result = await authManager.register(
                email, 
                password, 
                name, 
                businessType, 
                region
            );

            if (result.success) {
                // 회원가입 성공 - 홈으로 이동
                window.location.href = 'home.html';
            } else {
                // 회원가입 실패 - 에러 메시지 표시
                errorMessage.textContent = result.error || '회원가입에 실패했습니다.';
                errorMessage.style.display = 'block';
                
                // 버튼 활성화
                signupBtn.disabled = false;
                btnText.style.display = 'inline-block';
                btnLoader.style.display = 'none';
            }
        });

        // 이미 로그인된 경우 홈으로 리다이렉트
        if (authManager.isAuthenticated) {
            window.location.href = 'home.html';
        }
    }

    // 홈 페이지나 다른 보호된 페이지인 경우
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('signup.html')) {
        
        // 인증 확인
        if (!authManager.isAuthenticated) {
            window.location.href = 'login.html';
        } else {
            // 토큰 유효성 검증 (선택적)
            authManager.validateToken().catch(err => {
                console.error('Token validation failed:', err);
            });
        }
    }
});

// 전역으로 authManager 노출 (다른 스크립트에서 사용 가능)
window.authManager = authManager;

