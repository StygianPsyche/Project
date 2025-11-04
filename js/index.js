// Dashboard Buttons
document.getElementById('requestBtn').addEventListener('click',()=>window.location.href='request.html');
document.getElementById('statusBtn').addEventListener('click',()=>window.location.href='status.html');

// Idle Screen Logic
let idleTimer;
const idleTime = 10000; // 30 seconds
const idleScreen = document.getElementById('idleScreen');

function showIdleScreen() { idleScreen.style.display = 'flex'; }
function hideIdleScreen() { idleScreen.style.display = 'none'; resetIdleTimer(); }
function resetIdleTimer() { clearTimeout(idleTimer); idleTimer = setTimeout(showIdleScreen, idleTime); }

// Reset idle on any touch/mouse/keyboard
['mousemove','mousedown','touchstart','keypress'].forEach(evt => {
  document.addEventListener(evt, hideIdleScreen, false);
});

// Start idle timer
resetIdleTimer();
