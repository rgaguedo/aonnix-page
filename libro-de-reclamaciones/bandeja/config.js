/* Configuración de la bandeja. Los tres valores salen de `sam deploy`:
 * DominioDeLogin, ClienteDeLogin y UrlDeLaBandeja. */
window.BANDEJA_CONFIG = {
    API: "https://979wzwkpm8.execute-api.us-east-1.amazonaws.com/v1/admin/hojas",             // .../v1/admin/hojas
    LOGIN: "https://libro-reclamaciones-prod-773672342094.auth.us-east-1.amazoncognito.com",           // https://<dominio>.auth.<region>.amazoncognito.com
    CLIENTE: "4g8f5e9j305g7elmgf58hoji0f",         // ID del cliente de Cognito
    REDIRECCION: window.location.origin + "/libro-de-reclamaciones/bandeja/",
    // "PRUEBA" o "PRODUCCION", igual que en el config.js del formulario y que el
    // parámetro `Modo` del despliegue. Aquí solo decide si se ofrece el filtro
    // de hojas de prueba: purgadas y en producción, ese filtro no puede devolver
    // nada nunca más, y un filtro que siempre sale vacío hace dudar de si falla.
    MODO: "PRODUCCION"
};
