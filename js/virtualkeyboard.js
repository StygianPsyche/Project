
// js/virtualkeyboard.js
(function () {
  // Simple VirtualKeyboard shim for progressive enhancement.
  // Provides: window.VKShim.supports, .showNativeKeyboardFor(el), .hideNativeKeyboard(), .onGeometryChange(cb)
  const vk = (navigator && navigator.virtualKeyboard) ? navigator.virtualKeyboard : null;
  const supports = !!vk;

  

  function safeCall(fn) {
    try { fn(); } catch (e) { /* ignore */ }
  }

  function showNativeKeyboardFor(el) {
    if (!el) return;
    // Best-effort: ask UA to show the native soft keyboard
    if (supports) {
      try {
        // Let the page manage viewport via env() if desired
        if (typeof vk.overlaysContent !== 'undefined') {
          vk.overlaysContent = true;
        }
        if (vk.show) vk.show().catch(()=>{});
      } catch (e) { /* ignore */ }
    }
    // Ensure element focused (this normally triggers soft keyboard on mobiles)
    safeCall(() => el.focus({ preventScroll: true }));
    // fallback focus
    try { if (document.activeElement !== el) el.focus(); } catch {}
  }

  function hideNativeKeyboard() {
    if (supports) {
      safeCall(() => { if (vk.hide) vk.hide().catch(()=>{}); });
    } else {
      // nothing to do for native if unsupported
    }
  }

  function onGeometryChange(cb) {
    if (!supports || typeof cb !== 'function') return;
    try {
      vk.addEventListener('geometrychange', () => {
        const br = vk.boundingRect || {};
        cb(br);
      });
    } catch (e) { /* ignore */ }
  }

  // expose global
  window.VKShim = {
    vk,
    supports,
    showNativeKeyboardFor,
    hideNativeKeyboard,
    onGeometryChange
  };
})();



