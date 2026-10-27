/* Follow the theme chosen in the app (Settings > Application theme): 1 = Light, 2 = Dark, otherwise the system preference. */
try { const t = (JSON.parse(localStorage.getItem('pw.set') || '{}')).Theme; if (t === 1) document.documentElement.dataset.theme = 'light'; else if (t === 2) document.documentElement.dataset.theme = 'dark'; } catch (e) { }
