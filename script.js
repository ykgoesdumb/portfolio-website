// --- 1. Loading Animation & Provisioning Logic ---
document.addEventListener("DOMContentLoaded", () => {
    const loadingScreen = document.getElementById("loading-screen");
    const ideContainer = document.getElementById("ide-container");
    const statusBar = document.getElementById("status-bar");
    const progressBar = document.getElementById("progress-bar");
    const statusText = document.getElementById("status-text");
    const timeText = document.getElementById("time");

    // Simulated Provisioning Logs
    const statuses = [
        "Initializing provider...",
        "Authenticating AWS credentials...",
        "Creating VPC Network...",
        "Provisioning EC2 instances...",
        "Configuring Kubernetes cluster...",
        "Deploying CI/CD pipelines...",
        "Applying security policies (Wazuh)...",
        "Finalizing environment..."
    ];

    let currentStatusIdx = 0;
    let progress = 0;
    let timeRemaining = 4; // seconds

    // Advance Progress Bar smoothly
    const interval = setInterval(() => {
        progress += (100 / 40); // 100ms updates over 4000ms
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;

        // Update random status text aligned roughly with progress
        if (progress % 12.5 < 2) {
            if (currentStatusIdx < statuses.length) {
                statusText.innerText = statuses[currentStatusIdx];
                currentStatusIdx++;
            }
        }
    }, 100);

    // Countdown Timer Update
    const timeInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining >= 0) {
            timeText.innerText = `00:0${timeRemaining}`;
        }
    }, 1000);

    // After 4 seconds, reveal IDE
    setTimeout(() => {
        clearInterval(interval);
        clearInterval(timeInterval);

        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            ideContainer.classList.remove('hidden');
            statusBar.classList.remove('hidden');

            // Start Terminal Animation once the IDE is fully revealed
            setTimeout(startTerminalAnimation, 500);
        }, 800);
    }, 4000);

    // Form Submission Handler
    document.addEventListener('submit', (e) => {
        if (e.target && e.target.id === 'portfolio-contact-form') {
            e.preventDefault();
            const isKo = document.body.classList.contains('lang-ko');
            alert(isKo ? '메시지가 전송되었습니다! 곧 연락드리겠습니다.' : 'Message sent! I will get back to you soon.');
            e.target.reset();
        }
    });
});


// --- 2. IDE Interactions (Sidebar, Tabs, Content) ---
const fileTypes = {
    'home': 'Terminal',
    'whoami': 'Shell Script',
    'skills': 'Terraform',
    'projects': 'YAML',
    'certs': 'PEM',
    'contact': 'Environment Variables',
    'mailme': 'Markdown'
};

const fileIcons = {
    'home': '<span class="file-icon sh" style="color:#8ec07c;"><i class="fas fa-desktop"></i></span>',
    'whoami': '<span class="file-icon sh"><i class="fas fa-terminal"></i></span>',
    'skills': '<span class="file-icon tf" style="color:#5c4ee5;"><i class="fas fa-cube"></i></span>',
    'projects': '<span class="file-icon yml"><i class="fab fa-docker"></i></span>',
    'certs': '<span class="file-icon pem" style="color:#fabd2f;"><i class="fas fa-certificate"></i></span>',
    'contact': '<span class="file-icon env"><i class="fas fa-cog"></i></span>',
    'mailme': '<span class="file-icon md" style="color:#83a598;"><i class="fas fa-file-alt"></i></span>'
};

const fileExtensions = {
    'home': 'home.term',
    'whoami': 'whoami.sh',
    'skills': 'skills.tf',
    'projects': 'projects.yml',
    'certs': 'certs.pem',
    'contact': 'contact.env',
    'mailme': 'MAILME.md'
};

let openTabs = ['home'];

// On clicking a file in Explorer
function openFile(fileId, element) {
    // 1. Highlight clicked item
    document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // 2. Add Tab if not open
    if (!openTabs.includes(fileId)) {
        openTabs.push(fileId);
        const tabsContainer = document.getElementById('editor-tabs');

        const newTab = document.createElement('div');
        newTab.className = 'tab';
        newTab.setAttribute('data-target', fileId);
        newTab.onclick = () => switchTab(fileId);
        newTab.innerHTML = `${fileIcons[fileId]} ${fileExtensions[fileId]} <i class="fas fa-times close-icon" onclick="closeTab(event, '${fileId}')"></i>`;

        tabsContainer.appendChild(newTab);
    }

    // 3. Switch view to that file
    switchTab(fileId);

    // 4. On Mobile: Collapse Sidebar after choice
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
    }
}

// Switch Active Tab and Content
function switchTab(fileId) {
    // Top Tabs visual update
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    const targetTab = document.querySelector(`.tab[data-target="${fileId}"]`);
    if (targetTab) targetTab.classList.add('active');

    // Content Pane update
    document.querySelectorAll('.file-content').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });

    const contentPanel = document.getElementById(`content-${fileId}`);
    if (contentPanel) {
        contentPanel.classList.remove('hidden');
        contentPanel.classList.add('active');
    }

    // Breadcrumbs & Status Bar update
    document.getElementById('current-filename').innerText = fileExtensions[fileId];
    document.getElementById('file-type-indicator').innerText = fileTypes[fileId];

    // Sidebar highlight sync
    document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
    const allItems = Array.from(document.querySelectorAll('.file-item'));
    const match = allItems.find(el => el.innerText.includes(fileExtensions[fileId]));
    if (match) match.classList.add('active');
}

// Close an open tab
function closeTab(event, fileId) {
    event.stopPropagation(); // Stop parent Tab click event

    // Remove logically
    openTabs = openTabs.filter(tab => tab !== fileId);

    // Remove DOM
    const tabEl = document.querySelector(`.tab[data-target="${fileId}"]`);
    if (tabEl) tabEl.remove();

    // Reassign active view if closed tab was active
    const contentPanel = document.getElementById(`content-${fileId}`);
    if (contentPanel && contentPanel.classList.contains('active')) {
        contentPanel.classList.remove('active');
        contentPanel.classList.add('hidden');

        if (openTabs.length > 0) {
            // Re-open last tab in array
            switchTab(openTabs[openTabs.length - 1]);
        } else {
            // All tabs closed -> Empty view
            document.getElementById('current-filename').innerText = '';
            document.getElementById('file-type-indicator').innerText = '';
        }
    }
}

// Toggle Sidebar (Mobile / Activity Bar click)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const firstIcon = document.querySelector('.activity-bar .icon:first-child');

    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        firstIcon.classList.add('active');
    } else {
        sidebar.classList.add('collapsed');
        firstIcon.classList.remove('active');
    }
}

// Open PDF in a new IDE Tab
function openPdfTab(fileId, fileName, pdfPath) {
    // 1. Add to type/icon/extension dictionaries dynamically
    fileTypes[fileId] = 'PDF Document';
    fileExtensions[fileId] = fileName;
    fileIcons[fileId] = '<span class="file-icon pdf" style="color:#d3869b;"><i class="fas fa-file-pdf"></i></span>';

    // 2. Create Content Pane if not exists
    let contentPanel = document.getElementById(`content-${fileId}`);
    if (!contentPanel) {
        contentPanel = document.createElement('div');
        contentPanel.id = `content-${fileId}`;
        contentPanel.className = 'file-content hidden';

        // Setup iframe
        contentPanel.innerHTML = `<iframe src="${pdfPath}" style="width:100%; height:calc(100vh - 120px); border:none; border-radius:4px; background-color:#fff;"></iframe>`;
        document.querySelector('.editor-content').appendChild(contentPanel);
    }

    // 3. Highlight Sidebar items - we just turn off active state for files not in sidebar
    document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));

    // 4. Add Tab if not open
    if (!openTabs.includes(fileId)) {
        openTabs.push(fileId);
        const tabsContainer = document.getElementById('editor-tabs');

        const newTab = document.createElement('div');
        newTab.className = 'tab';
        newTab.setAttribute('data-target', fileId);
        newTab.onclick = () => switchTab(fileId);
        newTab.innerHTML = `${fileIcons[fileId]} ${fileName} <i class="fas fa-times close-icon" onclick="closeTab(event, '${fileId}')"></i>`;

        tabsContainer.appendChild(newTab);
    }

    // 5. Switch to that tab
    switchTab(fileId);
}

// --- 3. Terminal Animation ---
let terminalAnimated = false;

function startTerminalAnimation() {
    if (terminalAnimated) return;
    terminalAnimated = true;

    const initSequence = document.getElementById("init-sequence");
    if (!initSequence) return;

    // Initial clear
    initSequence.innerHTML = '';

    const lines = [
        '<div class="code-line"><span class="orange">    __ __      __        __ __ _          </span></div>',
        '<div class="code-line"><span class="orange">   / //_/_  __/ /__     / //_/(_)___ ___  </span></div>',
        '<div class="code-line"><span class="orange">  / ,&lt; / / / / / _ \\   / ,&lt; / / __ `__ \\ </span></div>',
        '<div class="code-line"><span class="orange"> / /| | /_/ / /  __/  / /| |/ / / / / / / </span></div>',
        '<div class="code-line"><span class="orange">/_/ |_|\\__, /_/\\___/ /_/ |_/_/_/ /_/ /_/  </span></div>',
        '<div class="code-line"><span class="orange">      /____/                              </span></div>',
        '<div class="code-line"><br></div>',
        '<div class="code-line"><span class="green">[OK]</span> <span class="lang-en">Kernel loaded.</span><span class="lang-ko">커널 로드 완료.</span></div>',
        '<div class="code-line"><span class="green">[OK]</span> <span class="lang-en">Checking file systems...</span><span class="lang-ko">파일 시스템 확인 중...</span></div>',
        '<div class="code-line"><span class="green">[OK]</span> <span class="lang-en">Mounted /home/kylekim1223</span><span class="lang-ko">/home/kylekim1223 마운트 완료.</span></div>',
        '<div class="code-line"><span class="blue">[INFO]</span> <span class="lang-en">Initializing Cloud Environment...</span><span class="lang-ko">클라우드 환경 초기화 중...</span></div>',
        '<div class="code-line"><span class="blue">[INFO]</span> <span class="lang-en">Establishing secure connection to AWS...</span><span class="lang-ko">AWS 보안 연결 설정 중...</span></div>',
        '<div class="code-line"><span class="blue">[INFO]</span> <span class="lang-en">Provisioning DevOps Pipeline...</span><span class="lang-ko">DevOps 파이프라인 프로비저닝 중...</span></div>',
        '<div class="code-line"><span class="green">[OK]</span> <span class="lang-en">DevSecOps policies applied successfully.</span><span class="lang-ko">DevSecOps 정책 적용 성공.</span></div>',
        '<div class="code-line"><br></div>',
        '<div class="code-line"><span class="green">kylekim@portfolio</span><span class="fg_muted">:</span><span class="blue">~</span><span class="fg"> $</span> tree .</div>',
        '<div class="code-line"><span class="blue">.</span></div>',
        '<div class="code-line">├── <span class="green">whoami.sh</span>       <span class="fg_muted"># <span class="lang-en">Self-introduction script</span><span class="lang-ko">자기소개 스크립트</span></span></div>',
        '<div class="code-line">├── <span class="purple">skills.tf</span>       <span class="fg_muted"># <span class="lang-en">My Skills</span><span class="lang-ko">보유 기술</span></span></div>',
        '<div class="code-line">├── <span class="blue">projects.yml</span>   <span class="fg_muted"># <span class="lang-en">Project definitions</span><span class="lang-ko">프로젝트 정의</span></span></div>',
        '<div class="code-line">├── <span class="yellow">certs.pem</span>      <span class="fg_muted"># <span class="lang-en">Certificates</span><span class="lang-ko">보유 자격증 검증서</span></span></div>',
        '<div class="code-line">└── <span class="orange">contact.env</span>    <span class="fg_muted"># <span class="lang-en">Contact info</span><span class="lang-ko">연락처 환경변수</span></span></div>',
        '<div class="code-line"><br></div>',
        '<div class="code-line"><span class="green">kylekim@portfolio</span><span class="fg_muted">:</span><span class="blue">~</span><span class="fg"> $</span> hostnamectl </div>',
        '<div class="code-line"><span class="fg_muted"><span class="lang-en">Booting up profile...</span><span class="lang-ko">프로필 부팅 중...</span></span></div>',
        '<div class="code-line"><span class="green">-></span> <span class="lang-en">Name: </span><span class="lang-ko">이름: </span><span class="lang-en">Kyle Yongkyun Kim</span><span class="lang-ko">김용균</span></div>',
        '<div class="code-line"><span class="green">-></span> <span class="lang-en">Role: Cloud & DevSecOps Engineer</span><span class="lang-ko">역할: Cloud & DevSecOps 엔지니어</span></div>',
        '<div class="code-line"><span class="green">-></span> <span class="lang-en">Status: Ready to build and automate.</span><span class="lang-ko">상태: 구축 및 자동화 준비 완료.</span></div>',
        '<div class="code-line"><br></div>',
        '<div class="code-line"><span class="green">kylekim@portfolio</span><span class="fg_muted">:</span><span class="blue">~</span><span class="fg"> $</span> <span class="terminal-cursor"></span></div>'
    ];

    let i = 0;
    function printNextLine() {
        if (i < lines.length) {
            initSequence.innerHTML += lines[i];
            i++;

            // Scroll editor down
            const editorContent = document.querySelector('.editor-content');
            editorContent.scrollTop = editorContent.scrollHeight;

            let delay = Math.random() * 40 + 20; // fast typing
            if (i === 6) delay = 400; // pause after banner
            if (i > 6 && i < 15) delay = 150 + Math.random() * 100; // pause for logs
            if (i === 16) delay = 500; // pause before tree output
            if (i > 16 && i < 23) delay = 40; // fast tree output
            if (i === 24) delay = 700; // pause before whoami output
            if (i === 25) delay = 400; // after Booting up...

            setTimeout(printNextLine, delay);
        }
    }

    printNextLine();
}

// --- 4. Settings Toggling ---
function toggleSettings() {
    const popover = document.getElementById('settings-popover');
    popover.classList.toggle('hidden');
}

function setLanguage(lang) {
    document.body.classList.remove('lang-en', 'lang-ko');
    document.body.classList.add(`lang-${lang}`);

    // Update active class
    document.querySelectorAll('[id^="lang-"]').forEach(el => el.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
}

function setTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-bright');
    document.body.classList.add(`theme-${theme}`);

    // Update active class
    document.querySelectorAll('[id^="theme-"]').forEach(el => el.classList.remove('active'));
    document.getElementById(`theme-${theme}`).classList.add('active');

    // We can expand this logic to swap CSS variables if needed
    if (theme === 'bright') {
        document.documentElement.style.setProperty('--bg0', '#D4C3A3'); // Main Beige Background
        document.documentElement.style.setProperty('--bg1', '#C5B494'); // Slightly darker beige for sidebar
        document.documentElement.style.setProperty('--bg2', '#B6A585'); // Even darker for activity bar
        document.documentElement.style.setProperty('--fg', '#282828');  // Dark Ink Text
        document.documentElement.style.setProperty('--fg_muted', '#5A544F'); // Muted text
        document.documentElement.style.setProperty('--activity-bar-bg', '#B6A585');
        document.documentElement.style.setProperty('--editor-bg', '#D4C3A3');
        document.documentElement.style.setProperty('--sidebar-bg', '#C5B494');

        // Tab adjustments for Bright Mode
        document.documentElement.style.setProperty('--tab-bg', '#B6A585'); // Darker tone for inactive tabs
        document.documentElement.style.setProperty('--tab-active-bg', '#D4C3A3'); // Match editor background
        // Tab text color for inactive tabs to match background tonality
        document.documentElement.style.setProperty('--tab-fg-inactive', '#D4C3A3');

        // Syntax adjustments for Bright Mode (Tone down bright colors)
        document.documentElement.style.setProperty('--orange', '#8B4513'); // Saddle Brown as Accent
        document.documentElement.style.setProperty('--green', '#4A5D4E');  // Olive Green as Point color
        document.documentElement.style.setProperty('--aqua', '#3E4B43');   // Toned down Aqua for projects.yml
        document.documentElement.style.setProperty('--yellow', '#705A2B'); // Toned down Yellow for functions (sleep)
        document.documentElement.style.setProperty('--border', '#A79676');
    } else {
        document.documentElement.style.setProperty('--bg0', '#282828');
        document.documentElement.style.setProperty('--bg1', '#3c3836');
        document.documentElement.style.setProperty('--bg2', '#504945');
        document.documentElement.style.setProperty('--fg', '#ebdbb2');
        document.documentElement.style.setProperty('--fg_muted', '#a89984');
        document.documentElement.style.setProperty('--activity-bar-bg', '#1d2021');
        document.documentElement.style.setProperty('--editor-bg', '#282828');
        document.documentElement.style.setProperty('--sidebar-bg', '#282828');

        // Restore dark mode defaults
        document.documentElement.style.setProperty('--tab-bg', '#1d2021');
        document.documentElement.style.setProperty('--tab-active-bg', '#282828');
        document.documentElement.style.setProperty('--tab-fg-inactive', '#a89984'); // Back to fg_muted

        document.documentElement.style.setProperty('--orange', '#fe8019');
        document.documentElement.style.setProperty('--green', '#b8bb26');
        document.documentElement.style.setProperty('--aqua', '#8ec07c');
        document.documentElement.style.setProperty('--yellow', '#fabd2f');
        document.documentElement.style.setProperty('--border', '#504945');
    }
}
