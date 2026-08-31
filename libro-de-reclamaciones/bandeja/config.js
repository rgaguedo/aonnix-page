/* Configuración de la bandeja. Los tres valores salen de `sam deploy`:
 * DominioDeLogin, ClienteDeLogin y UrlDeLaBandeja. */
window.BANDEJA_CONFIG = {
    API: "",             // .../v1/admin/hojas
    LOGIN: "",           // https://<dominio>.auth.<region>.amazoncognito.com
    CLIENTE: "",         // ID del cliente de Cognito
    REDIRECCION: window.location.origin + "/libro-de-reclamaciones/bandeja/"
};
