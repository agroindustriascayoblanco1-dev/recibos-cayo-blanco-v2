// ======================================================
// COA - RECIBOS DE PAGO
// VERSIÓN ESTABLE
// Compatible con el index.html actual
// ======================================================


// ======================================================
// CONFIGURACIÓN
// ======================================================

const PERIODOS = {

    q1: {
        nombre: "Quincena 1",
        mes: "Agosto 2026",
        archivo: "recibos-q1.pdf.pdf"
    },

    q2: {
        nombre: "Quincena 2",
        mes: "Agosto 2026",
        archivo: "recibos-q2.pdf.pdf"
    }

};


// ======================================================
// ELEMENTOS
// ======================================================

const codigoInput =
    document.getElementById("codigo");

const botonBuscar =
    document.getElementById("buscar");

const mensaje =
    document.getElementById("mensaje");

const resultado =
    document.getElementById("resultado");

const nombreEmpleado =
    document.getElementById("nombreEmpleado");

const codigoEmpleado =
    document.getElementById("codigoEmpleado");

const nuevaConsulta =
    document.getElementById("nuevaConsulta");

const visor =
    document.getElementById("visor");

const visorTitulo =
    document.getElementById("visorTitulo");

const verRecibo =
    document.getElementById("verRecibo");

const guardarRecibo =
    document.getElementById("guardarRecibo");

const cerrarVisor =
    document.getElementById("cerrarVisor");

const visorPDF =
    document.querySelector(".visor-pdf");

const textoQuincena =
    document.getElementById("textoQuincena");

const periodoSeleccionado =
    document.getElementById("periodoSeleccionado");


// ======================================================
// VARIABLES
// ======================================================

let quincenaSeleccionada = "q1";

let empleadoActual = null;

let paginaEncontrada = null;

let paginaActual = null;


// ======================================================
// PDF.JS
// ======================================================

if (window.pdfjsLib) {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

}


// ======================================================
// MENSAJES
// ======================================================

function mostrarMensaje(texto, error = false) {

    if (!mensaje) {
        return;
    }

    mensaje.textContent = texto;

    mensaje.style.color =
        error
            ? "#c62828"
            : "#08743b";

}


// ======================================================
// NORMALIZAR TEXTO
// ======================================================

function normalizarTexto(texto) {

    return String(texto || "")
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9]/g, "");

}


// ======================================================
// OBTENER QUINCENA
// ======================================================

function obtenerQuincena() {

    const seleccion =
        document.querySelector(
            'input[name="quincena"]:checked'
        );

    return seleccion
        ? seleccion.value
        : "q1";

}


// ======================================================
// LIMPIAR CONSULTA
// ======================================================

function limpiarConsulta() {

    empleadoActual = null;

    paginaEncontrada = null;

    paginaActual = null;


    if (nombreEmpleado) {

        nombreEmpleado.textContent = "—";

    }


    if (codigoEmpleado) {

        codigoEmpleado.textContent = "—";

    }


    if (resultado) {

        resultado.classList.add("oculto");

        resultado.style.display = "none";

    }


    if (visor) {

        visor.classList.add("oculto");

        visor.style.display = "none";

    }


    if (visorPDF) {

        visorPDF.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:50px;
                    color:#08743b;
                "
            >
                Selecciona tu recibo para visualizarlo.
            </div>

        `;

    }


    if (guardarRecibo) {

        guardarRecibo.disabled = false;

        guardarRecibo.textContent =
            "📥 Guardar recibo";

    }

}


// ======================================================
// CARGAR PDF
// ======================================================

async function cargarPDF(archivo) {

    if (!window.pdfjsLib) {

        throw new Error(
            "PDF.js no está cargado."
        );

    }


    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


    const documento =
        await pdfjsLib.getDocument(
            archivo
        ).promise;


    return documento;

}


// ======================================================
// BUSCAR CÓDIGO EN EL PDF
// ======================================================

async function buscarEnPDF(
    archivo,
    codigo
) {

    const pdf =
        await cargarPDF(archivo);


    const codigoBuscado =
        normalizarTexto(codigo);


    console.log(
        "PDF cargado:",
        archivo
    );


    console.log(
        "Páginas:",
        pdf.numPages
    );


    for (
        let numeroPagina = 1;
        numeroPagina <= pdf.numPages;
        numeroPagina++
    ) {

        const pagina =
            await pdf.getPage(
                numeroPagina
            );


        const contenido =
            await pagina.getTextContent();


        const texto =
            contenido.items
                .map(
                    item =>
                        item.str || ""
                )
                .join(" ");


        const textoNormalizado =
            normalizarTexto(texto);


        // ------------------------------------------
        // BUSCAR CÓDIGO
        // ------------------------------------------

        if (
            textoNormalizado.includes(
                codigoBuscado
            )
        ) {

            let nombre =
                "Colaborador";


            // --------------------------------------
            // OBTENER NOMBRE
            // --------------------------------------

            const encontrado =
                texto.match(
                    /Empleado\s*:\s*(.*?)\s+Sueldo\s+Mensual\s*:/i
                );


            if (encontrado) {

                nombre =
                    encontrado[1].trim();

            }


            console.log(
                "Empleado encontrado:",
                codigo,
                "Página:",
                numeroPagina
            );


            return {

                pagina:
                    numeroPagina,

                nombre:
                    nombre

            };

        }


        // ------------------------------------------
        // INFORMAR AVANCE
        // ------------------------------------------

        if (
            numeroPagina % 25 === 0
        ) {

            mostrarMensaje(

                "🔎 Revisando página " +
                numeroPagina +
                " de " +
                pdf.numPages +
                "..."

            );

        }

    }


    return null;

}


// ======================================================
// CONSULTAR EMPLEADO
// ======================================================

async function consultarEmpleado() {

    const codigo =
        codigoInput.value
            .trim()
            .toUpperCase();


    // ------------------------------------------
    // VALIDAR
    // ------------------------------------------

    if (!codigo) {

        mostrarMensaje(
            "⚠️ Ingresa tu código de empleado.",
            true
        );

        codigoInput.focus();

        return;

    }


    // ------------------------------------------
    // QUINCENA
    // ------------------------------------------

    quincenaSeleccionada =
        obtenerQuincena();


    const periodo =
        PERIODOS[
            quincenaSeleccionada
        ];


    if (!periodo) {

        mostrarMensaje(
            "❌ No se encontró la configuración de la quincena.",
            true
        );

        return;

    }


    // ------------------------------------------
    // LIMPIAR ANTERIOR
    // ------------------------------------------

    empleadoActual = null;

    paginaEncontrada = null;

    paginaActual = null;


    resultado.classList.add(
        "oculto"
    );

    resultado.style.display =
        "none";


    visor.classList.add(
        "oculto"
    );

    visor.style.display =
        "none";


    // ------------------------------------------
    // BOTÓN
    // ------------------------------------------

    botonBuscar.disabled = true;

    botonBuscar.textContent =
        "Buscando...";


    mostrarMensaje(

        "🔎 Buscando en " +
        periodo.nombre +
        "..."

    );


    try {

        // --------------------------------------
        // BUSCAR
        // --------------------------------------

        const encontrado =
            await buscarEnPDF(

                periodo.archivo,

                codigo

            );


        // --------------------------------------
        // NO ENCONTRADO
        // --------------------------------------

        if (!encontrado) {

            mostrarMensaje(

                "❌ No encontramos el código " +
                codigo +
                " en " +
                periodo.nombre +
                ".",

                true

            );

            return;

        }


        // --------------------------------------
        // GUARDAR INFORMACIÓN
        // --------------------------------------

        paginaEncontrada =
            encontrado.pagina;


        empleadoActual = {

            codigo:
                codigo,

            nombre:
                encontrado.nombre

        };


        // --------------------------------------
        // MOSTRAR EMPLEADO
        // --------------------------------------

        nombreEmpleado.textContent =
            empleadoActual.nombre;


        codigoEmpleado.textContent =
            empleadoActual.codigo;


        // --------------------------------------
        // MOSTRAR QUINCENA
        // --------------------------------------

        textoQuincena.textContent =
            periodo.nombre.toUpperCase();


        periodoSeleccionado.textContent =
            periodo.nombre.toUpperCase();


        // --------------------------------------
        // MOSTRAR RESULTADO
        // --------------------------------------

        resultado.classList.remove(
            "oculto"
        );

        resultado.style.display =
            "block";


        mostrarMensaje(
            "✓ Empleado encontrado correctamente."
        );


        resultado.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        );


    } catch (error) {

        console.error(
            "ERROR COMPLETO:",
            error
        );


        mostrarMensaje(

            "❌ No se pudo leer el PDF. Revisa el nombre del archivo.",

            true

        );

    } finally {

        botonBuscar.disabled =
            false;

        botonBuscar.textContent =
            "🔎 Consultar recibo";

    }

}


// ======================================================
// MOSTRAR RECIBO
// ======================================================

async function mostrarRecibo() {

    if (!paginaEncontrada) {

        alert(
            "Primero debes consultar un empleado."
        );

        return;

    }


    const periodo =
        PERIODOS[
            quincenaSeleccionada
        ];


    // ------------------------------------------
    // MOSTRAR VISOR
    // ------------------------------------------

    visor.classList.remove(
        "oculto"
    );

    visor.style.display =
        "block";


    // ------------------------------------------
    // OCULTAR TARJETA DEL COLABORADOR
    // ------------------------------------------

    resultado.classList.add(
        "oculto"
    );

    resultado.style.display =
        "none";


    visorTitulo.textContent =
        periodo.nombre;


    visorPDF.innerHTML = `

        <div
            style="
                text-align:center;
                padding:50px;
                color:#08743b;
                font-size:18px;
            "
        >
            🔄 Cargando recibo...
        </div>

    `;


    visor.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });


    try {

        const pdf =
            await cargarPDF(
                periodo.archivo
            );


        const pagina =
            await pdf.getPage(
                paginaEncontrada
            );


        paginaActual =
            pagina;


        const viewportOriginal =
            pagina.getViewport({

                scale:
                    1

            });


        const anchoDisponible =
            visorPDF.clientWidth ||
            900;


        const escala =
            Math.min(

                2,

                Math.max(

                    1,

                    anchoDisponible /
                    viewportOriginal.width

                )

            );


        const viewport =
            pagina.getViewport({

                scale:
                    escala

            });


        const canvas =
            document.createElement(
                "canvas"
            );


        const contexto =
            canvas.getContext(
                "2d"
            );


        canvas.width =
            Math.ceil(
                viewport.width
            );


        canvas.height =
            Math.ceil(
                viewport.height
            );


        canvas.style.width =
            "100%";

        canvas.style.height =
            "auto";

        canvas.style.display =
            "block";

        canvas.style.background =
            "#ffffff";

        canvas.style.borderRadius =
            "12px";


        visorPDF.innerHTML = "";

        visorPDF.appendChild(
            canvas
        );


        await pagina.render({

            canvasContext:
                contexto,

            viewport:
                viewport

        }).promise;


    } catch (error) {

        console.error(
            "ERROR MOSTRANDO RECIBO:",
            error
        );


        visorPDF.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:50px;
                    color:#c62828;
                "
            >
                ❌ No se pudo mostrar el recibo.
            </div>

        `;

    }

}


// ======================================================
// CERRAR VISOR
// ======================================================

function cerrarRecibo() {

    // ------------------------------------------
    // OCULTAR RECIBO
    // ------------------------------------------

    visor.classList.add(
        "oculto"
    );

    visor.style.display =
        "none";


    // ------------------------------------------
    // VOLVER A MOSTRAR COLABORADOR
    // ------------------------------------------

    if (empleadoActual) {

        resultado.classList.remove(
            "oculto"
        );

        resultado.style.display =
            "block";

    }


    paginaActual = null;


    visorPDF.innerHTML = `

        <div
            style="
                text-align:center;
                padding:50px;
                color:#08743b;
            "
        >
            Selecciona tu recibo para visualizarlo.
        </div>

    `;

}


// ======================================================
// NUEVA CONSULTA
// ======================================================

function iniciarNuevaConsulta() {

    codigoInput.value = "";

    mensaje.textContent = "";

    limpiarConsulta();

    codigoInput.focus();


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}


// ======================================================
// CAMBIO DE QUINCENA
// ======================================================

document
    .querySelectorAll(
        'input[name="quincena"]'
    )
    .forEach(

        function(radio) {

            radio.addEventListener(

                "change",

                function() {

                    quincenaSeleccionada =
                        this.value;


                    codigoInput.value = "";

                    mensaje.textContent = "";

                    limpiarConsulta();

                }

            );

        }

    );


// ======================================================
// BOTÓN CONSULTAR
// ======================================================

botonBuscar.addEventListener(

    "click",

    consultarEmpleado

);


// ======================================================
// ENTER
// ======================================================

codigoInput.addEventListener(

    "keydown",

    function(evento) {

        if (
            evento.key === "Enter"
        ) {

            consultarEmpleado();

        }

    }

);


// ======================================================
// VER RECIBO
// ======================================================

verRecibo.addEventListener(

    "click",

    mostrarRecibo

);


// ======================================================
// CERRAR
// ======================================================

cerrarVisor.addEventListener(

    "click",

    cerrarRecibo

);


// ======================================================
// NUEVA CONSULTA
// ======================================================

nuevaConsulta.addEventListener(

    "click",

    iniciarNuevaConsulta

);


// ======================================================
// INICIO
// ======================================================

mostrarMensaje("");


// ======================================================
// FIN
// ======================================================
