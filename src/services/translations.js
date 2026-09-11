import { EN, ES } from '../enums/languages';
import keys from '../enums/keys';

// ID del proyecto en Traducila (ver guía Módulo 5: crear proyecto,
// cargar las keys en español y validar con
// https://traducila.vercel.app/api/translations/PROJECT_ID/LANGUAGE_CODE).
// Pegar aquí el ID real del proyecto del juego.
const PROJECT_ID = '9869a4c6-2700-47d7-8e20-0dbfad88882b';
let translations = null;
let language = ES;

// Como en la guía: limpia caché, atajo para ES sin fetch,
// fetch a Traducila para el resto y guarda en localStorage + memoria.
// (Se usa removeItem en vez de clear() para no borrar el récord
// guardado en 'bounceBallBest'.)
export async function getTranslations (lang, callback)
{
    localStorage.removeItem('translations');
    translations = null;
    language = lang;
    if (language === ES)
    {
        return callback ? callback() : false;
    }

    return await fetch(
        `https://traducila.vercel.app/api/translations/${PROJECT_ID}/${language}`
    )
        .then((response) => response.json())
        .then((data) => {
            localStorage.setItem('translations', JSON.stringify(data));
            translations = data;
            if (callback) callback();
        });
}

// Como en la guía: recibe la key creada en el Admin y devuelve
// la traducción del mapa en localStorage. Sin traducción, la key.
export function getPhrase (key)
{
    if (!translations)
    {
        const locals = localStorage.getItem('translations');
        translations = locals ? JSON.parse(locals) : null;
    }

    let phrase = key;
    const words = translations && translations.data && translations.data.words;
    if (words && Array.isArray(words))
    {
        const translation = words.find((item) => item.key === key);
        if (translation && translation.translate)
        {
            phrase = translation.translate;
        }
    }

    return phrase;
}

// Reemplaza {0} por el valor (puntajes, récord). Solo formato,
// la traducción viene siempre de la API.
export function fill (template, value)
{
    return String(template).replace('{0}', String(value));
}

// Decodifica el '\n' literal del Admin a salto de línea real.
// Solo formato de pantalla: la búsqueda de la key sigue exacta.
export function ml (text)
{
    return String(text).replace(/\\n/g, '\n');
}

export function getLanguage ()
{
    return language;
}

function isAllowedLanguage (value)
{
    return value === ES || value === EN;
}

// Detección inicial (path > ?lang= > navegador > ES).
export function getLanguageConfig ()
{
    try
    {
        const path = window.location.pathname !== '/' ? window.location.pathname.replace(/^\/+|\/+$/g, '') : null;
        const params = new URL(window.location.href).searchParams;
        const queryLang = params.get('lang');
        const candidate = path || queryLang;
        if (candidate && isAllowedLanguage(candidate))
        {
            return candidate;
        }
        const browser = window.navigator.language || '';
        const short = browser.split('-')[0].toLowerCase();
        if (isAllowedLanguage(short))
        {
            return short;
        }
    }
    catch (e) { /* sin window, cae a ES */ }
    return ES;
}

// Reexporta las keys para tener a mano los textos exactos
// que deben cargarse en el Admin de Traducila.
export { keys };
export { EN, ES };
