/* Libro de Reclamaciones — AONNIX E.I.R.L.
 *
 * Dos reglas gobiernan este archivo:
 *
 * 1. El número de hoja lo da el servidor y solo el servidor. Aquí no se genera,
 *    no se adivina y no se cachea. Un correlativo inventado en el navegador es
 *    una constancia falsa, que es peor que no tener libro.
 * 2. La validación de este lado es cortesía, no autoridad. Sirve para que no
 *    haya que ir y volver por un campo vacío; quien decide si la hoja se pone
 *    o «se considera no puesta» es el servidor.
 */
(function () {
    "use strict";

    var CONFIG = window.LIBRO_CONFIG || { ENDPOINT: "", MODO: "PRODUCCION", CORREO_SOPORTE: "soporte@aonnix.com" };

    var formulario = document.getElementById("formulario");
    var boton = document.getElementById("boton-enviar");
    var errorGeneral = document.getElementById("error-general");
    var vistaFormulario = document.getElementById("vista-formulario");
    var vistaConstancia = document.getElementById("vista-constancia");

    var anio = document.getElementById("year");
    if (anio) { anio.textContent = new Date().getFullYear(); }

    /* ---------- fase de prueba ---------- */
    // Se avisa antes de que nadie escriba nada. Que alguien redacte un reclamo
    // real y descubra al final que no valía sería el peor de los desenlaces.
    if (CONFIG.MODO === "PRUEBA") {
        document.getElementById("banda-prueba").hidden = false;
        document.body.classList.add("es-prueba");
    }

    /* ---------- estado de habilitación ---------- */
    if (!CONFIG.ENDPOINT) {
        var aviso = document.getElementById("aviso-sin-endpoint");
        aviso.hidden = false;
        boton.disabled = true;
        boton.textContent = "Registro en línea no disponible";
        formulario.setAttribute("aria-describedby", "aviso-sin-endpoint");
    }

    /* ---------- datos del apoderado, solo si hacen falta ---------- */
    var casillaMenor = document.getElementById("esMenorDeEdad");
    var bloqueApoderado = document.getElementById("bloque-apoderado");
    var camposApoderado = ["apoderadoNombre", "apoderadoDomicilio", "apoderadoTelefono", "apoderadoEmail"];

    function alternarApoderado() {
        var visible = casillaMenor.checked;
        bloqueApoderado.hidden = !visible;
        camposApoderado.forEach(function (id) {
            var campo = document.getElementById(id);
            // `required` se pone y se quita: un campo oculto y obligatorio
            // bloquea el envío sin decir dónde, y el usuario no ve nada.
            if (visible) { campo.setAttribute("required", "required"); }
            else { campo.removeAttribute("required"); campo.value = ""; }
        });
    }
    casillaMenor.addEventListener("change", alternarApoderado);
    alternarApoderado();

    /* ---------- contador de caracteres ---------- */
    Array.prototype.forEach.call(document.querySelectorAll("[data-cuenta-de]"), function (salida) {
        var campo = document.getElementById(salida.getAttribute("data-cuenta-de"));
        function refrescar() {
            var restan = campo.maxLength - campo.value.length;
            salida.textContent = restan < 200 ? "Quedan " + restan + " caracteres." : "";
        }
        campo.addEventListener("input", refrescar);
        refrescar();
    });

    /* ---------- errores por campo ---------- */
    var CAMPO_DE_CLAVE = {
        "consumidor.nombre": "nombre",
        "consumidor.tipoDocumento": "tipoDocumento",
        "consumidor.numeroDocumento": "numeroDocumento",
        "consumidor.domicilio": "domicilio",
        "consumidor.telefono": "telefono",
        "consumidor.email": "email",
        "apoderado.nombre": "apoderadoNombre",
        "apoderado.domicilio": "apoderadoDomicilio",
        "apoderado.telefono": "apoderadoTelefono",
        "apoderado.email": "apoderadoEmail",
        "bien.tipo": "bienTipo",
        "bien.descripcion": "bienDescripcion",
        "bien.montoReclamado": "montoReclamado",
        "bien.numeroPedido": "numeroPedido",
        "detalle.tipo": "tipoHoja",
        "detalle.detalle": "detalle",
        "detalle.pedido": "pedido",
        "conformidad": "conformidad",
        "aceptaTratamiento": "aceptaTratamiento"
    };

    function idDeFallo(clave) { return "fallo-" + clave.replace(".", "-"); }

    function limpiarFallos() {
        Array.prototype.forEach.call(document.querySelectorAll(".lr-fallo"), function (p) {
            p.hidden = true; p.textContent = "";
        });
        Array.prototype.forEach.call(document.querySelectorAll("[aria-invalid]"), function (c) {
            c.removeAttribute("aria-invalid");
        });
        errorGeneral.hidden = true;
        errorGeneral.textContent = "";
    }

    function pintarFallos(campos) {
        var primero = null;
        Object.keys(campos).forEach(function (clave) {
            var parrafo = document.getElementById(idDeFallo(clave));
            if (parrafo) {
                parrafo.textContent = campos[clave];
                parrafo.hidden = false;
            }
            var nombre = CAMPO_DE_CLAVE[clave];
            var control = nombre && (document.getElementById(nombre) ||
                          document.querySelector('[name="' + nombre + '"]'));
            if (control) {
                control.setAttribute("aria-invalid", "true");
                if (!primero) { primero = control; }
            }
        });
        if (primero) {
            primero.focus({ preventScroll: true });
            primero.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    function mostrarErrorGeneral(mensaje) {
        errorGeneral.textContent = mensaje;
        errorGeneral.hidden = false;
        errorGeneral.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    /* ---------- armado del envío ---------- */
    function valor(id) {
        var c = document.getElementById(id);
        return c ? c.value.trim() : "";
    }
    function marcado(nombre) {
        var c = document.querySelector('[name="' + nombre + '"]:checked');
        return c ? c.value : "";
    }

    function armarCuerpo() {
        var cuerpo = {
            companiaWeb: valor("companiaWeb"),
            consumidor: {
                nombre: valor("nombre"),
                tipoDocumento: valor("tipoDocumento"),
                numeroDocumento: valor("numeroDocumento"),
                domicilio: valor("domicilio"),
                telefono: valor("telefono"),
                email: valor("email")
            },
            esMenorDeEdad: casillaMenor.checked,
            bien: {
                tipo: marcado("bienTipo"),
                descripcion: valor("bienDescripcion"),
                montoReclamado: valor("montoReclamado"),
                numeroPedido: valor("numeroPedido")
            },
            detalle: {
                tipo: marcado("tipoHoja"),
                detalle: valor("detalle"),
                pedido: valor("pedido")
            },
            conformidad: document.getElementById("conformidad").checked,
            aceptaTratamiento: document.getElementById("aceptaTratamiento").checked,
            deseaCopiaPorCorreo: document.getElementById("deseaCopiaPorCorreo").checked
        };
        if (casillaMenor.checked) {
            cuerpo.apoderado = {
                nombre: valor("apoderadoNombre"),
                domicilio: valor("apoderadoDomicilio"),
                telefono: valor("apoderadoTelefono"),
                email: valor("apoderadoEmail")
            };
        }
        return cuerpo;
    }

    /* ---------- constancia ---------- */
    var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
                 "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

    function fechaLarga(iso) {
        var p = String(iso).split("-");
        if (p.length !== 3) { return iso; }
        return parseInt(p[2], 10) + " de " + MESES[parseInt(p[1], 10) - 1] + " de " + p[0];
    }

    function fila(lista, etiqueta, valorTexto) {
        if (!valorTexto) { return; }
        var div = document.createElement("div");
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.textContent = etiqueta;
        // textContent y no innerHTML: lo que escribió el consumidor se muestra,
        // no se interpreta.
        dd.textContent = valorTexto;
        div.appendChild(dt); div.appendChild(dd);
        lista.appendChild(div);
    }

    function mostrarConstancia(respuesta) {
        var hoja = respuesta.hoja;
        var esReclamo = hoja.detalle.tipo === "RECLAMO";

        // El sello lo decide el servidor, no la configuración del navegador: si
        // los dos se desalinearan, se ve aquí en lugar de pasar inadvertido.
        var sello = document.getElementById("sello-prueba");
        if (respuesta.esPrueba) {
            sello.textContent = respuesta.avisoPrueba;
            sello.hidden = false;
            document.body.classList.add("es-prueba");
        } else {
            sello.hidden = true;
        }

        document.getElementById("titulo-constancia").textContent =
            "Hoja de Reclamación — " + (esReclamo ? "Reclamo" : "Queja");
        document.getElementById("numero-hoja").textContent = hoja.numero;
        document.getElementById("intro-constancia").textContent =
            "Registramos tu " + (esReclamo ? "reclamo" : "queja") + " el " +
            fechaLarga(hoja.fechaRegistro) + " a las " + hoja.horaRegistro +
            " (hora de Perú). Esta es la copia de lo que declaraste; consérvala.";

        var lista = document.getElementById("detalle-constancia");
        lista.textContent = "";
        fila(lista, "Número de hoja", "N.° " + hoja.numero);
        fila(lista, "Fecha de registro", fechaLarga(hoja.fechaRegistro) + ", " + hoja.horaRegistro);
        fila(lista, "Tipo", esReclamo ? "Reclamo" : "Queja");
        fila(lista, "Proveedor", hoja.proveedor.razonSocial + " — RUC " + hoja.proveedor.ruc);
        fila(lista, "Libro de Reclamaciones", hoja.proveedor.libroVirtual);
        fila(lista, "Código de identificación", hoja.proveedor.codigoIdentificacion);
        fila(lista, "Contacto del proveedor", hoja.proveedor.contacto);
        fila(lista, "Consumidor", hoja.consumidor.nombre);
        fila(lista, "Documento", hoja.consumidor.tipoDocumento + " " + hoja.consumidor.numeroDocumento);
        fila(lista, "Domicilio", hoja.consumidor.domicilio);
        fila(lista, "Teléfono", hoja.consumidor.telefono);
        fila(lista, "Correo electrónico", hoja.consumidor.email);
        if (hoja.esMenorDeEdad && hoja.apoderado) {
            fila(lista, "Padre, madre o apoderado", hoja.apoderado.nombre);
            fila(lista, "Domicilio del apoderado", hoja.apoderado.domicilio);
            fila(lista, "Teléfono del apoderado", hoja.apoderado.telefono);
            fila(lista, "Correo del apoderado", hoja.apoderado.email);
        }
        fila(lista, "Bien contratado", hoja.bien.tipo === "PRODUCTO" ? "Producto" : "Servicio");
        fila(lista, "Descripción", hoja.bien.descripcion);
        fila(lista, "Monto reclamado", hoja.bien.montoReclamado ? "S/ " + hoja.bien.montoReclamado : "");
        fila(lista, "Número de pedido", hoja.bien.numeroPedido);
        fila(lista, "Detalle", hoja.detalle.detalle);
        fila(lista, "Pedido del consumidor", hoja.detalle.pedido);
        fila(lista, "Fecha límite de respuesta", fechaLarga(hoja.fechaLimiteRespuesta) +
             " (" + respuesta.diasHabilesDePlazo + " días hábiles)");

        document.getElementById("estado-correo").textContent = respuesta.constanciaEnviada
            ? "También enviamos una copia a " + hoja.consumidor.email + "."
            : "No pudimos enviar la copia por correo. Imprime o guarda esta página: tu hoja ya está registrada con el número de arriba.";

        vistaFormulario.hidden = true;
        vistaConstancia.hidden = false;
        document.title = (respuesta.esPrueba ? "[PRUEBA] " : "") +
            "Hoja de Reclamación N.° " + hoja.numero + " — AONNIX E.I.R.L.";
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.getElementById("numero-hoja").focus && document.getElementById("numero-hoja").focus();
    }

    document.getElementById("boton-imprimir").addEventListener("click", function () {
        window.print();
    });

    /* ---------- envío ---------- */
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();
        if (!CONFIG.ENDPOINT) { return; }
        limpiarFallos();

        if (!formulario.checkValidity()) {
            // Solo controles: un <fieldset> que contiene un campo inválido
            // también matchea :invalid, y no es enfocable — el foco se quedaba
            // en el botón y el usuario no sabía a qué campo ir.
            var invalido = formulario.querySelector(
                "input:invalid, select:invalid, textarea:invalid"
            );
            if (invalido) {
                invalido.focus();
                invalido.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            mostrarErrorGeneral("Faltan campos obligatorios. Revísalos y vuelve a intentarlo.");
            return;
        }

        boton.disabled = true;
        var textoOriginal = boton.textContent;
        boton.textContent = "Registrando…";

        fetch(CONFIG.ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(armarCuerpo())
        }).then(function (respuesta) {
            return respuesta.json().then(function (datos) {
                return { estado: respuesta.status, datos: datos };
            }).catch(function () {
                return { estado: respuesta.status, datos: {} };
            });
        }).then(function (r) {
            if (r.estado === 201 && r.datos.numero && !r.datos.descartado) {
                mostrarConstancia(r.datos);
                return;
            }
            if (r.estado === 422 && r.datos.campos) {
                pintarFallos(r.datos.campos);
                mostrarErrorGeneral(
                    "Falta información obligatoria, así que la hoja todavía no se registró. " +
                    "Completa lo señalado y vuelve a enviarla."
                );
            } else if (r.estado === 429) {
                mostrarErrorGeneral(
                    "Has hecho varios envíos seguidos. Espera un momento y vuelve a intentarlo. " +
                    "Si es urgente, escríbenos a " + CONFIG.CORREO_SOPORTE + "."
                );
            } else {
                mostrarErrorGeneral(
                    (r.datos.mensaje || "No pudimos registrar tu hoja.") +
                    " Vuelve a intentarlo o escríbenos a " + CONFIG.CORREO_SOPORTE + "."
                );
            }
            boton.disabled = false;
            boton.textContent = textoOriginal;
        }).catch(function () {
            // Sin respuesta no sabemos si la hoja entró o no. Decirlo es mejor
            // que dar por hecho cualquiera de las dos cosas: si entró y vuelve
            // a enviarla, tendrá dos hojas; si no entró y se va, no tiene ninguna.
            mostrarErrorGeneral(
                "No pudimos conectar con el servidor, así que no sabemos si tu hoja llegó a " +
                "registrarse. Antes de volver a enviarla, escríbenos a " + CONFIG.CORREO_SOPORTE +
                " y lo verificamos contigo."
            );
            boton.disabled = false;
            boton.textContent = textoOriginal;
        });
    });
})();
