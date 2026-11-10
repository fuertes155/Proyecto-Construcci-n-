// Archivo externo para respetar la política de seguridad del servidor de producción.
(function () {
  try {
    var pref = localStorage.getItem('construapp.theme');
    var dark =
      pref === 'dark' ||
      (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]').setAttribute('content', '#12100e');
    }
  } catch (e) {
    /* almacenamiento bloqueado: se queda el tema claro */
  }
})();
