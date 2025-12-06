// --- Navigation Logic ---
function navigateTo(viewId) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    
    // Show target view
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.add('active');
    }

    // Init Diagnosis if entering for the first time or reset
    if (viewId === 'diagnosis') {
        if(diagnosisState.step === 'idle') {
            renderDiagnosisIdle();
        }
    }

    // Update Bottom Nav Highlighting
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(el => el.classList.remove('active'));
    
    // Find nav item with matching data-target
    const activeNav = document.querySelector(`.nav-item[data-target="${viewId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    } else if (viewId === 'diagnosis') {
        // If in diagnosis, maybe keep 'home' active or none. Let's keep none for clarity or Home.
        // Keeping none emphasizes fullscreen mode.
    }
    
    lucide.createIcons();
}

// --- Diagnosis Logic (Integrated) ---
const diagnosisState = {
    step: 'idle', // idle | analyzing | result
    data: {
        exposure: { label: '노출', count: 15400, rate: 100, status: 'good', icon: 'search' },
        click: { label: '클릭', count: 185, rate: 1.2, status: 'danger', icon: 'mouse-pointer-2' },
        purchase: { label: '주문', count: 45, rate: 24.3, status: 'normal', icon: 'shopping-bag' },
        repurchase: { label: '재주문', count: 12, rate: 26.6, status: 'normal', icon: 'heart-handshake' }
    }
};

const diagnosisContainer = document.getElementById('diagnosis-content');
const resetBtn = document.getElementById('reset-btn');

function renderDiagnosisIdle() {
    diagnosisState.step = 'idle';
    const html = `
        <div class="px-5 pt-10 animate-fade-in flex flex-col items-center h-full">
            <div class="bg-white rounded-[32px] p-8 shadow-sm text-center w-full">
                <div class="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <i data-lucide="search" class="w-10 h-10 text-[#3182F6]"></i>
                </div>
                <h2 class="text-2xl font-bold mb-3 text-[#191F28]">내 가게 상태<br>궁금하지 않으세요?</h2>
                <p class="text-[#8B95A1] mb-8 leading-relaxed">
                    30일간의 데이터를 분석해<br>
                    매출이 새는 곳을 찾아드릴게요.
                </p>
                <button onclick="startDiagnosis()" class="w-full bg-[#3182F6] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#286ee6] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20">
                    지금 바로 진단하기
                </button>
                <div class="mt-4 flex justify-center items-center gap-1.5 text-xs text-[#8B95A1] font-medium bg-[#F9FAFB] py-2 px-3 rounded-full w-fit mx-auto border border-[#F2F4F6]">
                    <i data-lucide="zap" class="w-3 h-3 text-yellow-500 fill-yellow-500"></i>
                    진단 시 50 XP 지급
                </div>
            </div>
            
            <div class="mt-8 px-4 text-center">
                <p class="text-[11px] text-[#B0B8C1] leading-relaxed">
                    Advisor 서비스는 AI 기술을 활용하여 데이터를 분석합니다.<br>
                    정확한 진단을 위해 최신 데이터를 연동해주세요.
                </p>
            </div>
        </div>
    `;
    diagnosisContainer.innerHTML = html;
    if (resetBtn) {
        resetBtn.classList.add('hidden');
    }
    lucide.createIcons();
}

function renderAnalyzing() {
    diagnosisState.step = 'analyzing';
    const html = `
        <div class="h-[60vh] flex flex-col items-center justify-center text-center px-6 animate-fade-in">
            <div class="relative mb-8">
                <div class="w-20 h-20 border-[6px] border-[#F2F4F6] border-t-[#3182F6] rounded-full animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center text-3xl">🧐</div>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-[#191F28]">꼼꼼하게 보는 중...</h3>
            <p class="text-[#8B95A1]">클릭률과 주문 데이터를 비교하고 있어요</p>
        </div>
    `;
    diagnosisContainer.innerHTML = html;
    if (resetBtn) {
        resetBtn.classList.add('hidden');
    }
}

function renderResult() {
    diagnosisState.step = 'result';
    const { data } = diagnosisState;
    
    const funnelItems = [
        createFunnelRow(data.exposure, 'blue', null),
        createFunnelRow(data.click, 'purple', data.exposure.count),
        createFunnelRow(data.purchase, 'pink', data.click.count),
        createFunnelRow(data.repurchase, 'green', data.purchase.count, true)
    ].join('');

    const html = `
        <div class="animate-fade-in pb-12">
            <!-- Score Section -->
            <div class="bg-white px-6 pb-10 pt-6 mb-3 rounded-b-[32px] shadow-sm relative z-10">
                <h3 class="text-center font-bold text-[#8B95A1] mb-[-10px] text-sm">종합 점수</h3>
                
                <div class="relative w-52 h-52 mx-auto my-6 flex items-center justify-center">
                    <svg class="w-full h-full transform -rotate-90">
                        <defs>
                            <linearGradient id="tossGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3182F6" />
                                <stop offset="100%" stopColor="#4CC2FF" />
                            </linearGradient>
                        </defs>
                        <circle cx="104" cy="104" r="88" stroke="#F2F4F6" strokeWidth="18" fill="none" stroke-linecap="round" />
                        <circle id="score-circle" cx="104" cy="104" r="88" stroke="url(#tossGradient)" strokeWidth="18" fill="none" stroke-dasharray="553" stroke-dashoffset="553" stroke-linecap="round" class="transition-all duration-[1500ms] ease-out" />
                    </svg>
                    <div class="absolute flex flex-col items-center">
                        <span id="score-text" class="text-[3.5rem] font-bold text-[#191F28] tracking-tighter leading-none">0</span>
                        <span class="text-lg font-bold text-[#191F28] mt-[-4px]">점</span>
                        <span class="text-sm font-medium text-[#8B95A1] mt-2 bg-[#F2F4F6] px-2 py-0.5 rounded">상위 34%</span>
                    </div>
                </div>

                <div class="text-center bg-red-50 py-3.5 px-5 rounded-2xl mx-2">
                    <p class="text-red-500 font-bold text-[15px]">
                        "주변 가게보다 <span class="underline decoration-2 underline-offset-4 decoration-red-200">방문객</span>이 적어요 😢"
                    </p>
                </div>
            </div>

            <!-- Funnel List -->
            <div class="px-5 mt-6">
                <h3 class="font-bold text-lg mb-4 ml-1 flex items-center gap-2 text-[#333D4B]">
                    <span class="w-1 h-5 bg-[#333D4B] rounded-full"></span>
                    고객 여정 분석
                </h3>
                
                <div class="bg-white p-6 rounded-[28px] shadow-sm border border-[#F2F4F6]">
                    ${funnelItems}
                </div>

                <!-- Action Card -->
                <div onclick="alert('대표 사진 변경 화면으로 이동합니다.')" class="mt-6 bg-white rounded-[28px] p-6 shadow-sm border border-[#F2F4F6] active:scale-[0.98] transition-transform cursor-pointer group">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📸</div>
                        <div>
                            <h4 class="text-lg font-bold text-[#191F28] leading-tight mb-1">손님이 그냥 지나치고 있어요</h4>
                            <p class="text-[15px] text-[#6B7684]">매력적인 대표 사진으로 바꾸면 클릭률이 2배 오를 수 있어요.</p>
                        </div>
                    </div>
                    <button class="w-full py-4 rounded-xl bg-[#3182F6] text-white font-bold text-[15px] hover:bg-[#1b64da] transition-colors flex items-center justify-center gap-1">
                        대표 사진 변경하기
                        <i data-lucide="chevron-right" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <!-- Disclaimer -->
            <footer class="mt-12 mb-6 px-6 text-center">
                <div class="border-t border-gray-200 w-full mb-6"></div>
                <p class="text-[11px] text-[#B0B8C1] leading-relaxed text-left">
                    <strong>[책임의 한계와 고지]</strong><br>
                    본 진단 서비스는 당사가 보유한 알고리즘과 귀하가 제공한 데이터를 기반으로 산출된 추정치입니다.<br><br>
                    1. 분석 결과는 단순 참고용이며, 실제 매출 증대나 사업 성공을 보장하지 않습니다.<br>
                    2. 데이터 수집 시점 및 연동 상태에 따라 실제 지표와 일부 오차가 발생할 수 있습니다.<br>
                    3. 본 결과를 바탕으로 실행한 경영상의 판단 및 그 결과에 대한 법적 책임은 이용자 본인에게 있습니다.
                </p>
                <p class="text-[10px] text-[#D1D6DB] mt-4">Copyright © Advisor Corp. All rights reserved.</p>
            </footer>
        </div>
    `;
    
    diagnosisContainer.innerHTML = html;
    if (resetBtn) {
        resetBtn.classList.remove('hidden');
    }
    lucide.createIcons();

    // Score Animation
    requestAnimationFrame(() => {
        const circle = document.getElementById('score-circle');
        if(circle) {
            const offset = 553 - (553 * 62) / 100;
            circle.style.strokeDashoffset = offset;
        }
        let currentScore = 0;
        const scoreText = document.getElementById('score-text');
        const interval = setInterval(() => {
            currentScore += 1;
            if(scoreText) scoreText.innerText = currentScore;
            if(currentScore >= 62) {
                clearInterval(interval);
                setTimeout(() => document.getElementById('reward-modal').classList.remove('hidden'), 500);
            }
        }, 20);
    });

    // Progress Bar Animation
    setTimeout(() => {
        document.querySelectorAll('.progress-bar').forEach(bar => {
            bar.style.width = bar.dataset.width;
        });
    }, 100);
}

// Funnel Row Creator (Helper)
function createFunnelRow(item, themeColor, prevCount, isLast = false) {
    const isDanger = item.status === 'danger';
    const themes = {
        blue: { bg: 'bg-blue-50', icon: 'text-blue-500', bar: 'bg-blue-500' },
        purple: { bg: 'bg-purple-50', icon: 'text-purple-500', bar: 'bg-purple-500' },
        pink: { bg: 'bg-pink-50', icon: 'text-pink-500', bar: 'bg-pink-500' },
        green: { bg: 'bg-emerald-50', icon: 'text-emerald-500', bar: 'bg-emerald-500' }
    };
    const theme = themes[themeColor];
    
    let widthPercent = '100%';
    if (item.label.includes('클릭')) widthPercent = '75%';
    if (item.label.includes('주문')) widthPercent = '45%';
    if (item.label.includes('재주문')) widthPercent = '20%';

    const lineHtml = !isLast ? `<div class="absolute left-[27px] top-12 bottom-[-12px] w-[2px] bg-[#F2F4F6] z-0"></div>` : '';

    return `
        <div class="relative py-3 group">
            ${lineHtml}
            <div class="flex items-center justify-between relative z-10">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-[20px] flex items-center justify-center ${isDanger ? 'bg-red-50' : theme.bg} transition-colors">
                        <i data-lucide="${item.icon}" class="w-6 h-6 ${isDanger ? 'text-red-500' : theme.icon} stroke-[2.5]"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-0.5">
                            <span class="text-sm font-bold ${isDanger ? 'text-red-500' : 'text-[#6B7684]'}">${item.label}</span>
                            ${isDanger ? '<span class="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-md font-bold">주의</span>' : ''}
                        </div>
                        <span class="text-xl font-bold text-[#191F28]">${item.count.toLocaleString()}</span>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-sm font-bold ${isDanger ? 'text-red-500' : 'text-[#B0B8C1]'}">
                        ${item.rate}% 전환
                    </span>
                </div>
            </div>
            <div class="mt-3 ml-[72px] h-2 bg-[#F2F4F6] rounded-full overflow-hidden w-[calc(100%-72px)]">
                <div class="progress-bar h-full rounded-full ${isDanger ? 'bg-red-500' : theme.bar}" style="width: 0%" data-width="${widthPercent}"></div>
            </div>
        </div>
    `;
}

// Functions
function startDiagnosis() {
    renderAnalyzing();
    setTimeout(() => { renderResult(); }, 2000);
}

function closeModal() { 
    document.getElementById('reward-modal').classList.add('hidden'); 
}

// Event Listeners - DOMContentLoaded 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // Init Layout (Icons)
    lucide.createIcons();
    
    // Reset button event listener
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', renderDiagnosisIdle);
    }
});

