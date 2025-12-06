// --- Navigation Logic ---
function navigateTo(viewId) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    
    // Show target view
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.add('active');
    }

    // Init Channels if entering for the first time
    if (viewId === 'channels') {
        renderChannelsView();
    }

    // Init Traffic Input if entering
    if (viewId === 'traffic-input') {
        renderTrafficInputView();
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
    } else if (viewId === 'diagnosis' || viewId === 'channels' || viewId === 'traffic-input') {
        // If in diagnosis, channels, or traffic-input, keep none for clarity or Home.
        // Keeping none emphasizes fullscreen mode.
    }
    
    lucide.createIcons();
}

// --- Marketing Channels Logic ---
const selectedChannels = [];

const marketingChannels = [
    { 
        id: 'coupang-eats', 
        name: '쿠팡이츠', 
        logo: '🍽️',
        color: '#FF6B00'
    },
    { 
        id: 'baemin', 
        name: '배달의 민족', 
        logo: '🛵',
        color: '#00C73C'
    },
    { 
        id: 'yogiyo', 
        name: '요기요', 
        logo: '🍔',
        color: '#FF6B6B'
    },
    { 
        id: 'naver-place', 
        name: '네이버 플레이스', 
        logo: '📍',
        color: '#03C75A'
    },
    { 
        id: 'naver-powerlink', 
        name: '네이버 파워링크', 
        logo: '🔗',
        color: '#03C75A'
    }
];

function renderChannelsView() {
    const channelsList = document.getElementById('channels-list');
    if (!channelsList) return;

    channelsList.innerHTML = marketingChannels.map(channel => `
        <div 
            onclick="toggleChannel('${channel.id}')" 
            id="channel-${channel.id}"
            class="bg-white p-5 rounded-[24px] shadow-sm border-2 border-[#F2F4F6] cursor-pointer transition-all active:scale-[0.98] group hover:border-[#3182F6]/30"
        >
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-[16px] bg-[#F9FAFB] flex items-center justify-center text-2xl border border-[#F2F4F6] group-hover:bg-blue-50/50 transition-colors">
                        ${channel.logo}
                    </div>
                    <span class="text-lg font-bold text-[#191F28]">${channel.name}</span>
                </div>
                <div class="w-6 h-6 rounded-full border-2 border-[#E5E8EB] flex items-center justify-center transition-all" id="check-${channel.id}">
                    <i data-lucide="check" class="w-4 h-4 text-white hidden" id="check-icon-${channel.id}"></i>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
    
    // Reset continue button state
    const continueBtn = document.getElementById('channels-continue-btn');
    if (continueBtn && selectedChannels.length === 0) {
        continueBtn.classList.remove('bg-[#3182F6]', 'text-white');
        continueBtn.classList.add('bg-[#E5E8EB]', 'text-[#B0B8C1]');
        continueBtn.disabled = true;
    }
}

function toggleChannel(channelId) {
    const index = selectedChannels.indexOf(channelId);
    const channelCard = document.getElementById(`channel-${channelId}`);
    const checkBox = document.getElementById(`check-${channelId}`);
    const checkIcon = document.getElementById(`check-icon-${channelId}`);
    const continueBtn = document.getElementById('channels-continue-btn');

    if (!channelCard || !checkBox || !checkIcon) return;

    if (index === -1) {
        // 선택 추가
        selectedChannels.push(channelId);
        channelCard.classList.remove('border-[#F2F4F6]');
        channelCard.classList.add('border-[#3182F6]', 'bg-blue-50/30');
        checkBox.classList.remove('border-[#E5E8EB]');
        checkBox.classList.add('border-[#3182F6]', 'bg-[#3182F6]');
        checkIcon.classList.remove('hidden');
    } else {
        // 선택 제거
        selectedChannels.splice(index, 1);
        channelCard.classList.remove('border-[#3182F6]', 'bg-blue-50/30');
        channelCard.classList.add('border-[#F2F4F6]');
        checkBox.classList.remove('border-[#3182F6]', 'bg-[#3182F6]');
        checkBox.classList.add('border-[#E5E8EB]');
        checkIcon.classList.add('hidden');
    }

    // 다음 버튼 활성화/비활성화
    if (continueBtn) {
        if (selectedChannels.length > 0) {
            continueBtn.classList.remove('bg-[#E5E8EB]', 'text-[#B0B8C1]');
            continueBtn.classList.add('bg-[#3182F6]', 'text-white');
            continueBtn.disabled = false;
        } else {
            continueBtn.classList.remove('bg-[#3182F6]', 'text-white');
            continueBtn.classList.add('bg-[#E5E8EB]', 'text-[#B0B8C1]');
            continueBtn.disabled = true;
        }
    }

    lucide.createIcons();
}

function proceedToDiagnosis() {
    if (selectedChannels.length === 0) return;
    
    // 선택된 채널 저장 (이미 selectedChannels에 저장되어 있음)
    console.log('Selected channels:', selectedChannels);
    
    // 트래픽 입력 화면으로 이동
    navigateTo('traffic-input');
}

// --- Traffic Input Logic ---
const trafficData = {}; // { channelId: { method: 'upload' | 'manual', files: [] | dataByDate: {} } }

function renderTrafficInputView() {
    const sectionsContainer = document.getElementById('traffic-input-sections');
    if (!sectionsContainer) return;

    // 선택된 채널들만 필터링
    const selectedChannelsData = marketingChannels.filter(ch => 
        selectedChannels.includes(ch.id)
    );

    sectionsContainer.innerHTML = selectedChannelsData.map((channel, index) => `
        <div class="mb-6">
            <!-- Channel Title -->
            <h2 class="text-xl font-bold text-[#191F28] mb-2">${channel.name}</h2>
            <p class="text-[#8B95A1] text-sm mb-4">트래픽을 입력해주세요</p>
            
            <!-- Upload Area -->
            <div 
                class="bg-white border-2 border-dashed border-[#E5E8EB] rounded-[24px] p-8 mb-3 cursor-pointer hover:border-[#3182F6] hover:bg-blue-50/30 transition-all relative overflow-hidden"
                onclick="openFileInput('${channel.id}')"
                id="upload-area-${channel.id}"
            >
                <input 
                    type="file" 
                    id="file-input-${channel.id}" 
                    accept="image/*,.pdf,.xlsx,.xls" 
                    multiple
                    class="hidden"
                    onchange="handleFileUpload('${channel.id}', Array.from(this.files))"
                />
                <div class="flex flex-col items-center justify-center text-center">
                    <div class="w-16 h-16 bg-[#F2F4F6] rounded-full flex items-center justify-center mb-3">
                        <i data-lucide="plus" class="w-8 h-8 text-[#8B95A1]"></i>
                    </div>
                    <p class="text-[#8B95A1] text-sm mb-1">사진 또는 파일을 업로드하세요</p>
                    <p class="text-[#B0B8C1] text-xs">5장 이상 30장 이하 (최대 30장)</p>
                </div>
                <!-- File count display (hidden by default) -->
                <div id="file-count-${channel.id}" class="hidden mt-4 text-center">
                    <span class="text-sm text-[#3182F6] font-medium">
                        <span id="uploaded-count-${channel.id}">0</span>장 업로드됨
                    </span>
                </div>
            </div>
            
            <!-- Manual Input Button -->
            <button 
                onclick="openManualInput('${channel.id}')"
                class="w-full bg-[#3182F6] text-white font-bold py-4 rounded-xl text-base hover:bg-[#286ee6] active:scale-[0.98] transition-all"
            >
                직접입력
            </button>
            
            <!-- Manual Input Modal (hidden by default) -->
            <div id="manual-input-modal-${channel.id}" class="hidden fixed inset-0 z-[70] flex items-center justify-center px-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
                <div class="bg-white rounded-[32px] p-6 w-full max-w-sm my-8">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-bold text-[#191F28]">${channel.name} 트래픽 입력</h3>
                        <button onclick="closeManualInput('${channel.id}')" class="text-[#8B95A1] hover:text-[#191F28]">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    <!-- Date Selection -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-[#191F28] mb-2">날짜 선택</label>
                        <input 
                            type="date" 
                            id="manual-input-date-${channel.id}"
                            class="w-full px-4 py-3 border-2 border-[#F2F4F6] rounded-xl focus:border-[#3182F6] focus:outline-none text-[#191F28]"
                            onchange="showManualInputFields('${channel.id}')"
                        />
                    </div>
                    
                    <!-- Input Fields (hidden by default, shown when date is selected) -->
                    <div id="manual-input-fields-${channel.id}" class="hidden space-y-4 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-[#191F28] mb-2">노출률</label>
                            <input 
                                type="number" 
                                id="manual-exposure-${channel.id}"
                                placeholder="예: 10000"
                                class="w-full px-4 py-3 border-2 border-[#F2F4F6] rounded-xl focus:border-[#3182F6] focus:outline-none text-[#191F28]"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#191F28] mb-2">클릭률</label>
                            <input 
                                type="number" 
                                id="manual-click-${channel.id}"
                                placeholder="예: 500"
                                class="w-full px-4 py-3 border-2 border-[#F2F4F6] rounded-xl focus:border-[#3182F6] focus:outline-none text-[#191F28]"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#191F28] mb-2">전환율</label>
                            <input 
                                type="number" 
                                id="manual-conversion-${channel.id}"
                                placeholder="예: 100"
                                step="0.01"
                                class="w-full px-4 py-3 border-2 border-[#F2F4F6] rounded-xl focus:border-[#3182F6] focus:outline-none text-[#191F28]"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#191F28] mb-2">재구매율</label>
                            <input 
                                type="number" 
                                id="manual-repurchase-${channel.id}"
                                placeholder="예: 30"
                                step="0.01"
                                class="w-full px-4 py-3 border-2 border-[#F2F4F6] rounded-xl focus:border-[#3182F6] focus:outline-none text-[#191F28]"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[#191F28] mb-2">투자 비용 (원)</label>
                            <input 
                                type="number" 
                                id="manual-cost-${channel.id}"
                                placeholder="예: 50000"
                                class="w-full px-4 py-3 border-2 border-[#F2F4F6] rounded-xl focus:border-[#3182F6] focus:outline-none text-[#191F28]"
                            />
                        </div>
                    </div>
                    
                    <!-- Saved Dates List -->
                    <div id="saved-dates-list-${channel.id}" class="hidden mb-4 space-y-2">
                        <p class="text-sm font-medium text-[#191F28] mb-2">입력된 날짜</p>
                        <div id="saved-dates-${channel.id}" class="space-y-2">
                            <!-- Dates will be listed here -->
                        </div>
                    </div>
                    
                    <button 
                        onclick="saveManualInput('${channel.id}')"
                        class="w-full bg-[#3182F6] text-white font-bold py-4 rounded-xl hover:bg-[#286ee6] transition-all"
                    >
                        저장
                    </button>
                </div>
            </div>
            
            <!-- Saved Data Display (hidden by default) -->
            <div id="saved-data-${channel.id}" class="hidden mt-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <div class="flex items-center gap-2">
                    <i data-lucide="check-circle" class="w-5 h-5 text-green-500"></i>
                    <span class="text-sm text-green-700 font-medium">입력 완료</span>
                    <span id="saved-value-${channel.id}" class="text-sm text-green-700 ml-auto"></span>
                    <button onclick="clearTrafficData('${channel.id}')" class="text-green-700 hover:text-green-900">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
    
    // 기존 데이터가 있으면 표시 업데이트
    selectedChannelsData.forEach(channel => {
        const data = trafficData[channel.id];
        if (data) {
            if (data.method === 'upload') {
                updateUploadDisplay(channel.id);
            } else if (data.method === 'manual') {
                updateManualInputDisplay(channel.id);
            }
        }
    });
}

function openFileInput(channelId) {
    const fileInput = document.getElementById(`file-input-${channelId}`);
    if (fileInput) {
        fileInput.click();
    }
}

function handleFileUpload(channelId, files) {
    if (!files || files.length === 0) return;

    // 기존 파일이 있으면 합치기
    const existingFiles = trafficData[channelId]?.method === 'upload' 
        ? trafficData[channelId].files || []
        : [];
    
    const allFiles = [...existingFiles, ...Array.from(files)];
    
    // 30장 초과 시 잘라내기
    if (allFiles.length > 30) {
        alert('최대 30장까지 업로드 가능합니다. 처음 30장만 저장됩니다.');
        allFiles.splice(30);
    }

    // 5장 미만이면 경고만 하고 저장 (추가 업로드 가능)
    if (allFiles.length < 5) {
        // 경고는 나중에 저장 시점에 체크
    }

    // Save file data
    trafficData[channelId] = {
        method: 'upload',
        files: allFiles,
        count: allFiles.length
    };

    // Update UI
    updateUploadDisplay(channelId);
    lucide.createIcons();
}

function updateUploadDisplay(channelId) {
    const uploadArea = document.getElementById(`upload-area-${channelId}`);
    const fileCount = document.getElementById(`file-count-${channelId}`);
    const uploadedCount = document.getElementById(`uploaded-count-${channelId}`);
    const savedData = document.getElementById(`saved-data-${channelId}`);

    const data = trafficData[channelId];
    if (data && data.method === 'upload' && data.count > 0) {
        if (uploadArea) {
            uploadArea.classList.remove('border-dashed', 'border-[#E5E8EB]');
            uploadArea.classList.add('border-[#3182F6]', 'bg-blue-50/50');
        }
        if (fileCount && uploadedCount) {
            fileCount.classList.remove('hidden');
            uploadedCount.textContent = data.count;
        }
        if (savedData) {
            savedData.classList.remove('hidden');
            const savedValue = document.getElementById(`saved-value-${channelId}`);
            if (savedValue) {
                savedValue.textContent = `${data.count}장 업로드됨`;
            }
        }
    }
}

function removeFile(channelId) {
    delete trafficData[channelId];

    const uploadArea = document.getElementById(`upload-area-${channelId}`);
    const fileCount = document.getElementById(`file-count-${channelId}`);
    const savedData = document.getElementById(`saved-data-${channelId}`);
    const fileInput = document.getElementById(`file-input-${channelId}`);

    if (uploadArea) {
        uploadArea.classList.remove('border-[#3182F6]', 'bg-blue-50/50');
        uploadArea.classList.add('border-dashed', 'border-[#E5E8EB]');
    }

    if (fileCount) {
        fileCount.classList.add('hidden');
    }

    if (savedData) {
        savedData.classList.add('hidden');
    }

    if (fileInput) {
        fileInput.value = '';
    }

    lucide.createIcons();
}

function openManualInput(channelId) {
    const modal = document.getElementById(`manual-input-modal-${channelId}`);
    if (modal) {
        modal.classList.remove('hidden');
        // 기존 데이터가 있으면 표시
        updateManualInputDisplay(channelId);
    }
}

function closeManualInput(channelId) {
    const modal = document.getElementById(`manual-input-modal-${channelId}`);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showManualInputFields(channelId) {
    const dateInput = document.getElementById(`manual-input-date-${channelId}`);
    const fieldsContainer = document.getElementById(`manual-input-fields-${channelId}`);
    
    if (!dateInput || !fieldsContainer) return;
    
    if (dateInput.value) {
        fieldsContainer.classList.remove('hidden');
    } else {
        fieldsContainer.classList.add('hidden');
    }
    
    lucide.createIcons();
}

function saveManualInput(channelId) {
    const dateInput = document.getElementById(`manual-input-date-${channelId}`);
    if (!dateInput || !dateInput.value) {
        alert('날짜를 선택해주세요');
        return;
    }

    const exposure = document.getElementById(`manual-exposure-${channelId}`)?.value;
    const click = document.getElementById(`manual-click-${channelId}`)?.value;
    const conversion = document.getElementById(`manual-conversion-${channelId}`)?.value;
    const repurchase = document.getElementById(`manual-repurchase-${channelId}`)?.value;
    const cost = document.getElementById(`manual-cost-${channelId}`)?.value;

    // 모든 필드 검증
    if (!exposure || !click || !conversion || !repurchase || !cost) {
        alert('모든 항목을 입력해주세요');
        return;
    }

    // 숫자 검증
    if (isNaN(exposure) || isNaN(click) || isNaN(conversion) || isNaN(repurchase) || isNaN(cost)) {
        alert('올바른 수치를 입력해주세요');
        return;
    }

    // 데이터 저장
    if (!trafficData[channelId] || trafficData[channelId].method !== 'manual') {
        trafficData[channelId] = {
            method: 'manual',
            dataByDate: {}
        };
    }

    trafficData[channelId].dataByDate[dateInput.value] = {
        exposure: parseInt(exposure),
        click: parseInt(click),
        conversion: parseFloat(conversion),
        repurchase: parseFloat(repurchase),
        cost: parseInt(cost)
    };

    // UI 업데이트
    updateManualInputDisplay(channelId);
    
    // 입력 필드 초기화
    dateInput.value = '';
    document.getElementById(`manual-exposure-${channelId}`).value = '';
    document.getElementById(`manual-click-${channelId}`).value = '';
    document.getElementById(`manual-conversion-${channelId}`).value = '';
    document.getElementById(`manual-repurchase-${channelId}`).value = '';
    document.getElementById(`manual-cost-${channelId}`).value = '';
    document.getElementById(`manual-input-fields-${channelId}`).classList.add('hidden');

    lucide.createIcons();
}

function updateManualInputDisplay(channelId) {
    const data = trafficData[channelId];
    if (!data || data.method !== 'manual') return;

    const savedDatesList = document.getElementById(`saved-dates-list-${channelId}`);
    const savedDates = document.getElementById(`saved-dates-${channelId}`);
    const savedData = document.getElementById(`saved-data-${channelId}`);

    const dates = Object.keys(data.dataByDate);
    
    if (dates.length > 0) {
        if (savedDatesList && savedDates) {
            savedDatesList.classList.remove('hidden');
            savedDates.innerHTML = dates.map(date => {
                const dateData = data.dataByDate[date];
                const dateStr = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                return `
                    <div class="flex items-center justify-between bg-[#F9FAFB] rounded-xl p-3">
                        <div>
                            <span class="text-sm font-medium text-[#191F28]">${dateStr}</span>
                            <span class="text-xs text-[#8B95A1] ml-2">노출 ${dateData.exposure.toLocaleString()} | 비용 ${dateData.cost.toLocaleString()}원</span>
                        </div>
                        <button onclick="removeManualInputDate('${channelId}', '${date}')" class="text-[#8B95A1] hover:text-[#191F28]">
                            <i data-lucide="x" class="w-4 h-4"></i>
                        </button>
                    </div>
                `;
            }).join('');
        }

        if (savedData) {
            savedData.classList.remove('hidden');
            const savedValue = document.getElementById(`saved-value-${channelId}`);
            if (savedValue) {
                savedValue.textContent = `${dates.length}일 입력됨`;
            }
        }
    }

    lucide.createIcons();
}

function removeManualInputDate(channelId, date) {
    const data = trafficData[channelId];
    if (data && data.method === 'manual' && data.dataByDate[date]) {
        delete data.dataByDate[date];
        
        // 날짜가 모두 삭제되면 채널 데이터 제거
        if (Object.keys(data.dataByDate).length === 0) {
            delete trafficData[channelId];
        }
        
        updateManualInputDisplay(channelId);
        
        // savedData도 업데이트
        const savedData = document.getElementById(`saved-data-${channelId}`);
        if (savedData && (!trafficData[channelId] || Object.keys(trafficData[channelId].dataByDate || {}).length === 0)) {
            savedData.classList.add('hidden');
        }
    }
}

function clearTrafficData(channelId) {
    delete trafficData[channelId];

    const savedData = document.getElementById(`saved-data-${channelId}`);
    const uploadArea = document.getElementById(`upload-area-${channelId}`);
    const fileInput = document.getElementById(`file-input-${channelId}`);

    if (savedData) {
        savedData.classList.add('hidden');
    }

    if (uploadArea) {
        uploadArea.classList.remove('opacity-50', 'border-[#3182F6]', 'bg-blue-50/50');
        uploadArea.classList.add('border-dashed', 'border-[#E5E8EB]');
    }

    if (fileInput) {
        fileInput.value = '';
    }

    // Reset preview
    const preview = document.getElementById(`file-preview-${channelId}`);
    if (preview) {
        preview.classList.add('hidden');
    }

    lucide.createIcons();
}

function proceedToDiagnosisFromTraffic() {
    // 모든 선택된 채널에 대해 데이터가 입력되었는지 확인
    const allChannelsHaveData = selectedChannels.every(channelId => {
        const data = trafficData[channelId];
        if (!data) return false;
        
        if (data.method === 'upload') {
            // 5장 이상 30장 이하 업로드 확인
            if (!data.count || data.count < 5 || data.count > 30) {
                return false;
            }
            return true;
        } else if (data.method === 'manual') {
            // 최소 1일 이상 입력 확인
            const dates = Object.keys(data.dataByDate || {});
            return dates.length > 0;
        }
        return false;
    });

    if (!allChannelsHaveData) {
        alert('모든 채널의 트래픽 데이터를 입력해주세요.\n(사진: 5~30장, 직접입력: 최소 1일 이상)');
        return;
    }

    console.log('Traffic data:', trafficData);

    // 진단 화면으로 이동
    navigateTo('diagnosis');
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

