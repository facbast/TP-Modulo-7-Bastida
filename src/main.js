import StartGame from './game/main';

// Overlay de diagnóstico: muestra en pantalla cualquier error de JS
// (temporal, para cazar el congelamiento al entrar a Game).
function showErrorOverlay (msg)
{
    let box = document.getElementById('error-overlay');
    if (!box)
    {
        box = document.createElement('pre');
        box.id = 'error-overlay';
        box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;' +
            'max-width:95vw;max-height:40vh;overflow:auto;background:#7f0000;color:#fff;' +
            'font:12px monospace;padding:8px;white-space:pre-wrap;text-align:left;';
        document.body.appendChild(box);
    }
    box.textContent += msg + '\n';
}

window.addEventListener('error', (e) => {
    showErrorOverlay('ERROR: ' + (e.message || e.error));
});
window.addEventListener('unhandledrejection', (e) => {
    showErrorOverlay('PROMISE: ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
});

document.addEventListener('DOMContentLoaded', () => {

    StartGame('game-container');

});
