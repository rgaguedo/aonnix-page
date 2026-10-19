// Año del pie de página. Va en un archivo propio porque la política de seguridad del sitio
// no deja correr scripts escritos dentro del HTML. El Libro de Reclamaciones lo hace en libro.js.
(function () {
    var anio = document.getElementById('year');
    if (anio) anio.textContent = new Date().getFullYear();
})();
