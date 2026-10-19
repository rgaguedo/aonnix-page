// Aviso de cookies y Google Analytics de aonnix.com.
//
// Google Analytics solo se carga si la persona acepta, como pide la Ley 29733. La elección se guarda
// en este navegador y se puede cambiar desde /legal/cookies/. El Libro de Reclamaciones no incluye
// este archivo: esa página recibe datos personales y no se mide.
(function () {
    'use strict';

    var ID = 'G-9JL2RHHJX9';
    var CLAVE = 'aonnix-cookies';
    var ACEPTADO = 'aceptado';
    var RECHAZADO = 'rechazado';
    var cargado = false;
    var aviso = null;

    function leer() {
        try { return localStorage.getItem(CLAVE); } catch (e) { return null; }
    }

    function guardar(valor) {
        try { localStorage.setItem(CLAVE, valor); } catch (e) { /* Sin almacenamiento, el aviso vuelve en cada página. */ }
    }

    function cargarAnalitica() {
        if (cargado) return;
        cargado = true;
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        // Solo medición: nada de publicidad ni de Google Signals.
        window.gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
        window.gtag('js', new Date());
        window.gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
        document.head.appendChild(script);
    }

    // Al rechazar después de haber aceptado, se borran las cookies que dejó Google Analytics.
    function borrarCookies() {
        if (cargado) window.gtag('consent', 'update', { analytics_storage: 'denied' });
        document.cookie.split(';').forEach(function (cookie) {
            var nombre = cookie.split('=')[0].trim();
            if (nombre.indexOf('_ga') !== 0) return;
            var vencida = nombre + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            document.cookie = vencida;
            document.cookie = vencida + '; domain=.' + location.hostname.replace(/^www\./, '');
        });
    }

    function elegir(valor) {
        guardar(valor);
        if (valor === ACEPTADO) cargarAnalitica(); else borrarCookies();
        ocultarAviso();
        mostrarEstado();
    }

    function mostrarAviso() {
        if (aviso) { aviso.hidden = false; return; }
        aviso = document.createElement('div');
        aviso.className = 'aviso-cookies';
        aviso.setAttribute('role', 'region');
        aviso.setAttribute('aria-label', 'Aviso de cookies');
        aviso.innerHTML =
            '<p>Usamos Google Analytics para contar las visitas y saber qué páginas sirven. Solo se activa si aceptas. ' +
            '<a href="/legal/cookies/">Detalles</a></p>' +
            '<div class="aviso-cookies-botones">' +
            '<button type="button" data-eleccion="' + RECHAZADO + '">Rechazar</button>' +
            '<button type="button" data-eleccion="' + ACEPTADO + '">Aceptar</button>' +
            '</div>';
        aviso.addEventListener('click', function (evento) {
            var boton = evento.target.closest('button[data-eleccion]');
            if (boton) elegir(boton.getAttribute('data-eleccion'));
        });
        document.body.appendChild(aviso);
    }

    function ocultarAviso() {
        if (aviso) aviso.hidden = true;
    }

    // En /legal/cookies/ se muestra la elección actual y un botón para cambiarla.
    function mostrarEstado() {
        var estado = document.querySelector('[data-cookies="estado"]');
        if (!estado) return;
        var valor = leer();
        estado.textContent = valor === ACEPTADO ? 'Aceptaste la analítica en este navegador.'
            : valor === RECHAZADO ? 'Rechazaste la analítica en este navegador.'
            : 'Todavía no elegiste en este navegador.';
    }

    document.addEventListener('click', function (evento) {
        if (!evento.target.closest) return;
        if (evento.target.closest('[data-cookies="cambiar"]')) { mostrarAviso(); return; }
        // Clic en un botón de tienda: qué app y qué tienda, para comparar App Store con Google Play.
        var enlace = evento.target.closest('a.appstore-badge');
        if (!enlace || !cargado) return;
        var tarjeta = enlace.closest('.app-card');
        window.gtag('event', 'clic_tienda', {
            app: tarjeta && tarjeta.id ? tarjeta.id : location.pathname,
            tienda: enlace.href.indexOf('apple.com') !== -1 ? 'app_store' : 'google_play'
        });
    });

    var eleccion = leer();
    if (eleccion === ACEPTADO) cargarAnalitica();
    else if (eleccion !== RECHAZADO) mostrarAviso();
    mostrarEstado();
})();
