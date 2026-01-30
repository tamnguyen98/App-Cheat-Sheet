/**
 * i18n: English + Spanish. Auto-detect + settings selector.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const en = {
  search: {
    title: 'Tech Guide Helper',
    placeholder: 'Search guides…',
    searchHint: 'Type to find a guide',
    topInquiries: 'Top inquiries',
    browseAll: 'Browse all guides',
    browseAllHint: 'Open the full list of categories and guides',
    landingLabel: 'Search landing',
    openGuideHint: 'Open this guide',
    results: 'Results',
  },
  home: {
    headline: 'What do you need help with today?',
    searchPlaceholder: 'Search guides…',
    searchHint: 'Type or use voice to find a guide',
    categories: 'Categories',
    videoCalls: 'Video Calls',
    phoneBasics: 'Phone Basics',
    email: 'Email',
    photos: 'Photos',
    security: 'Security',
    homeButton: 'HOME',
    homeHint: 'Tap to go back to the start. Nothing breaks.',
  },
  guide: {
    step: 'Step {{number}}',
    done: 'Done',
    next: 'Next',
    previous: 'Previous',
    playTts: 'Play step aloud',
    pauseTts: 'Pause',
  },
  library: {
    title: 'Library',
    yourGuides: 'Your guides',
    noGuides: 'No guides yet. Search from Home.',
  },
  favorites: {
    title: 'Favorites',
    empty: 'No favorites. Tap the heart on a guide to save it.',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    ttsAutoPlay: 'Read steps aloud automatically',
    highContrast: 'High contrast',
    about: 'About Tech Guide Helper',
    homeButton: 'HOME',
    homeHint: 'Tap to go back to the start.',
  },
};

const es: typeof en = {
  search: {
    title: 'Tech Guide Helper',
    placeholder: 'Buscar guías…',
    searchHint: 'Escribe para encontrar una guía',
    topInquiries: 'Consultas frecuentes',
    browseAll: 'Ver todas las guías',
    browseAllHint: 'Abrir la lista completa de categorías y guías',
    landingLabel: 'Búsqueda',
    openGuideHint: 'Abrir esta guía',
    results: 'Resultados',
  },
  home: {
    headline: '¿Con qué necesitas ayuda hoy?',
    searchPlaceholder: 'Buscar guías…',
    searchHint: 'Escribe o usa la voz para encontrar una guía',
    categories: 'Categorías',
    videoCalls: 'Videollamadas',
    phoneBasics: 'Básicos del teléfono',
    email: 'Correo',
    photos: 'Fotos',
    security: 'Seguridad',
    homeButton: 'INICIO',
    homeHint: 'Toca para volver al inicio. No se rompe nada.',
  },
  guide: {
    step: 'Paso {{number}}',
    done: 'Hecho',
    next: 'Siguiente',
    previous: 'Anterior',
    playTts: 'Escuchar paso en voz alta',
    pauseTts: 'Pausar',
  },
  library: {
    title: 'Biblioteca',
    yourGuides: 'Tus guías',
    noGuides: 'Aún no hay guías. Busca desde Inicio.',
  },
  favorites: {
    title: 'Favoritos',
    empty: 'Sin favoritos. Toca el corazón en una guía para guardarla.',
  },
  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    ttsAutoPlay: 'Leer pasos en voz alta automáticamente',
    highContrast: 'Alto contraste',
    about: 'Acerca de Tech Guide Helper',
    homeButton: 'INICIO',
    homeHint: 'Toca para volver al inicio.',
  },
};

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, es: { translation: es } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
