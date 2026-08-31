/* Configuración de la bandeja. Los tres valores salen de `sam deploy`:
 * DominioDeLogin, ClienteDeLogin y UrlDeLaBandeja. */
window.BANDEJA_CONFIG = {
    API: "https://494soi0jdj.execute-api.us-east-1.amazonaws.com/v1/admin/hojas",             // .../v1/admin/hojas
    LOGIN: "https://libro-reclamaciones-p1-773672342094.auth.us-east-1.amazoncognito.com",           // https://<dominio>.auth.<region>.amazoncognito.com
    CLIENTE: "1u8mfcm7p6jebvsmksodsal0tt",         // ID del cliente de Cognito
    REDIRECCION: window.location.origin + "/libro-de-reclamaciones/bandeja/"
};
