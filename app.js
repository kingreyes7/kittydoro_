// ========== INIT ==========
emailjs.init("6azUPAB7x-KSDaXJL");

const mainContainer = document.getElementById('mainContainer');
const kittyImg      = document.getElementById('kittyImg');
const kittySound    = document.getElementById('kittySound');

// ========== PERSONAJES ==========
const charData = {
    hello: {
        inicio: "hello.png",
        estudio: "Kittyestudiosa.png",
        pausa:   "kittysentada.png",
        final:   "kitty20.png"
    },
    kuromi: {
        inicio: "kuromi_inicio.png",
        estudio: "kuromi_leyendo.png",
        pausa:   "kuromi_sentada.png",
        final:   "kuromi_inicio.png"
    },
    pompompurin: {
        inicio: "pompompurin_inicio.png",
        estudio: "pompompurin_leyendo.png",
        pausa:   "pompompurin_sentado.png",
        final:   "pompompurin_inicio.png"
    }
};

let currentCharacter = localStorage.getItem('kittydoro_char') || 'hello';

function selectCharacter(key) {
    currentCharacter = key;
    localStorage.setItem('kittydoro_char', key);
    resetPomodoro();
    closeModal('modalPersonalizar');
    alert("¡Personaje cambiado con éxito! 🐾");
}

function showCustomSection(section) {
    document.getElementById('pomo-custom-start').style.display  = section === 'start'  ? 'block' : 'none';
    document.getElementById('pomo-custom-chars').style.display  = section === 'chars'  ? 'block' : 'none';
    document.getElementById('pomo-custom-design').style.display = section === 'design' ? 'block' : 'none';
}

// ========== EDITABLE TIME ==========
function setupEditable(id) {
    const el = document.getElementById(id);
    el.addEventListener('keydown', (e) => {
        const isNumber  = /^[0-9]$/i.test(e.key);
        const isControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);
        if (isControl) {
            const sel    = window.getSelection();
            const offset = sel.anchorOffset;
            if (e.key === 'Backspace' && el.innerText[offset - 1] === ':') e.preventDefault();
            if (e.key === 'Delete'    && el.innerText[offset]     === ':') e.preventDefault();
            return;
        }
        if (!isNumber) e.preventDefault();
    });
    el.addEventListener('blur', () => {
        if (!el.innerText.includes(':')) el.innerText = "10:00";
    });
}

setupEditable('timer-display');
setupEditable('alarm-display');

// ========== FONDOS ==========
const DEFAULT_BG = {
    inicio:      "url('fondo2.png')",
    estudiando:  "url('fondo_biblioteca.png')",
    pausa:       "url('fondo2.png')"
};
let activeBg  = { ...DEFAULT_BG };
let pendingBg = {};

function loadSavedBgs() {
    Object.keys(DEFAULT_BG).forEach(key => {
        const saved = localStorage.getItem('kittydoro_v2_' + key);
        if (saved) {
            activeBg[key] = `url('${saved}')`;
            const img = document.getElementById('preview-' + key);
            if (img) {
                img.src = saved;
                img.parentElement.classList.add('has-image');
            }
        }
    });
}

function loadCustomBg(key, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        pendingBg[key] = e.target.result;
        const img = document.getElementById('preview-' + key);
        img.src = e.target.result;
        img.parentElement.classList.add('has-image');
    };
    reader.readAsDataURL(file);
}

function applyAndClose() {
    Object.keys(pendingBg).forEach(key => {
        localStorage.setItem('kittydoro_v2_' + key, pendingBg[key]);
        activeBg[key] = `url('${pendingBg[key]}')`;
    });
    pendingBg = {};
    applyBg('inicio');
    closeModal('modalPersonalizar');
}

function applyBg(state) {
    document.body.style.backgroundImage = activeBg[state] || DEFAULT_BG[state];
}

// ========== POMODORO ==========
let pomoSecs     = 25 * 60;
let initialPomo  = 25 * 60;
let pomoInterval = null;

function updatePomoButtons(state) {
    const status = document.getElementById('pomo-status');
    document.getElementById('btn-pomo-start').style.display = (state === 'start') ? 'inline-block' : 'none';
    document.getElementById('btn-pomo-pause').style.display = (state === 'running') ? 'inline-block' : 'none';
    document.getElementById('btn-pomo-resume').style.display = (state === 'paused') ? 'inline-block' : 'none';
    document.getElementById('btn-pomo-reset').style.display = (state === 'running' || state === 'paused') ? 'inline-block' : 'none';

    if (state === 'start') {
        status.innerText = '¡HOLA!';
    } else if (state === 'running') {
        status.innerText = 'MODO ESTUDIO';
    } else if (state === 'paused') {
        status.innerText = 'PAUSA ACTIVA';
    }
}

function updatePomoVisuals() {
    const progress = ((initialPomo - pomoSecs) / initialPomo) * 100;
    let color = "#ffffff";
    if      (progress <= 25) color = "#ff4757";
    else if (progress <= 50) color = "#ffa502";
    else if (progress <= 75) color = "#2ed573";
    else                     color = "#1e90ff";
    document.documentElement.style.setProperty('--led-color', color);
}

function startPomodoro() {
    if (pomoInterval) return;
    updatePomoButtons('running');
    kittyImg.src = charData[currentCharacter].estudio;
    applyBg('estudiando');
    pomoInterval = setInterval(() => {
        if (pomoSecs <= 0) {
            clearInterval(pomoInterval);
            pomoInterval = null;
            kittySound.play();
            kittyImg.src = charData[currentCharacter].final;
            updatePomoButtons('start');
            return;
        }
        pomoSecs--;
        document.getElementById('pomo-display').innerText = formatTime(pomoSecs);
        updatePomoVisuals();
    }, 1000);
}

function pausePomodoro() {
    clearInterval(pomoInterval);
    pomoInterval = null;
    updatePomoButtons('paused');
    kittyImg.src = charData[currentCharacter].pausa;
    applyBg('pausa');
}

function resetPomodoro() {
    clearInterval(pomoInterval);
    pomoInterval = null;
    pomoSecs = 25 * 60;
    document.getElementById('pomo-display').innerText = "25:00";
    updatePomoButtons('start');
    kittyImg.src = charData[currentCharacter].inicio;
    applyBg('inicio');
    document.documentElement.style.setProperty('--led-color', '#ffffff');
}

function formatTime(s) {
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

// ========== TEMPORIZADOR ==========
let timerInterval = null;

function updateTimerButtons(state) {
    document.getElementById('btn-timer-start').style.display = (state === 'start') ? 'inline-block' : 'none';
    document.getElementById('btn-timer-pause').style.display = (state === 'running') ? 'inline-block' : 'none';
    document.getElementById('btn-timer-resume').style.display = (state === 'paused') ? 'inline-block' : 'none';
    document.getElementById('btn-timer-reset').style.display = (state === 'running' || state === 'paused') ? 'inline-block' : 'none';
}

function startTimer() {
    if (timerInterval) return;
    updateTimerButtons('running');
    const parts = document.getElementById('timer-display').innerText.split(':');
    let s = (+parts[0] * 60) + (+parts[1]);
    timerInterval = setInterval(() => {
        if (s <= 0) { 
            clearInterval(timerInterval); 
            timerInterval = null; 
            kittySound.play(); 
            updateTimerButtons('start');
            return; 
        }
        s--;
        document.getElementById('timer-display').innerText = formatTime(s);
    }, 1000);
}

function pauseTimer() { 
    clearInterval(timerInterval); 
    timerInterval = null; 
    updateTimerButtons('paused');
}

function resetTimer()  { 
    pauseTimer(); 
    document.getElementById('timer-display').innerText = "10:00"; 
    updateTimerButtons('start');
}

// ========== CRONÓMETRO ==========
let swTime     = 0;
let swInterval = null;

function updateStopwatchButtons(state) {
    document.getElementById('btn-sw-start').style.display = (state === 'start') ? 'inline-block' : 'none';
    document.getElementById('btn-sw-pause').style.display = (state === 'running') ? 'inline-block' : 'none';
    document.getElementById('btn-sw-resume').style.display = (state === 'paused') ? 'inline-block' : 'none';
    document.getElementById('btn-sw-reset').style.display = (state === 'running' || state === 'paused') ? 'inline-block' : 'none';
}

function startStopwatch() {
    if (swInterval) return;
    updateStopwatchButtons('running');
    swInterval = setInterval(() => {
        swTime += 100;
        const s  = Math.floor(swTime / 1000);
        const ms = Math.floor((swTime % 1000) / 10);
        document.getElementById('stopwatch-display').innerText =
            formatTime(s) + ":" + ms.toString().padStart(2, '0');
    }, 100);
}

function pauseStopwatch() { 
    clearInterval(swInterval); 
    swInterval = null; 
    updateStopwatchButtons('paused');
}

function resetStopwatch()  { 
    pauseStopwatch(); 
    swTime = 0; 
    document.getElementById('stopwatch-display').innerText = "00:00:00"; 
    updateStopwatchButtons('start');
}

// ========== ALARMA ==========
let alarmTime    = null;
let alarmChecker = null;

function setAlarm() {
    const val = document.getElementById('alarm-display').innerText.trim();
    alarmTime = val;
    document.getElementById('alarm-status').innerText = `✅ Alarma activada a las ${val}`;
    if (alarmChecker) clearInterval(alarmChecker);
    alarmChecker = setInterval(() => {
        const now = new Date();
        const hh  = now.getHours().toString().padStart(2, '0');
        const mm  = now.getMinutes().toString().padStart(2, '0');
        if (`${hh}:${mm}` === alarmTime) {
            kittySound.play();
            document.getElementById('alarm-status').innerText = "⏰ ¡Es la hora!";
            clearInterval(alarmChecker);
        }
    }, 1000);
}

function clearAlarm() {
    alarmTime = null;
    clearInterval(alarmChecker);
    document.getElementById('alarm-status').innerText = "❌ Alarma desactivada";
}

// ========== RELOJ ==========
setInterval(() => {
    const now = new Date();
    document.getElementById('clock-display').innerText =
        now.toLocaleTimeString('es-ES', { hour12: false });
    document.getElementById('date-display').innerText =
        now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}, 1000);

// ========== UI GENERAL ==========
function toggleFab() {
    document.getElementById('fabMain').classList.toggle('active');
    document.getElementById('fabOptions').classList.toggle('show');
}

function showView(viewId, el) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    el.classList.add('active');
}

function toggleTheme() { document.body.classList.toggle('dark-mode'); }

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
    if (id === 'modalPersonalizar') showCustomSection('start');
    toggleFab();
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ========== FEEDBACK ==========
function setStars(n) {
    const spans = document.getElementById('starRating').children;
    for (let i = 0; i < 5; i++) spans[i].innerText = i < n ? '★' : '☆';
}

function sendFeedback() {
    const comment = document.getElementById('comment').value;
    if (!comment) return alert("Por favor escribe algo.");
    emailjs.send("service_xolynnx", "template_fdnigue", { message: comment })
        .then(() => { alert("¡Gracias por tu mensaje! 🐾"); closeModal('modalPuntuar'); });
}

// ========== INICIO ==========
loadSavedBgs();
applyBg('inicio');
kittyImg.src = charData[currentCharacter].inicio;
