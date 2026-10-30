export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'iantbuild:theme';

/** Script que se ejecuta en <head> ANTES de pintar la página: aplica el tema
 * guardado (o el del sistema si no hay ninguno) para que no haya un destello
 * del tema equivocado al cargar. Es texto estático, sin datos del usuario. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})();`;
