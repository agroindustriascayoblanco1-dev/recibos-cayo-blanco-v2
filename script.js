// ======================================================
// COA - RECIBOS DE PAGO - VERSIÓN 2
// ======================================================


// ======================================================
// ARCHIVOS PDF
// ======================================================

const PDFS = {

    q1: "recibos-q1.pdf.pdf",

    q2: "recibos-q2.pdf.pdf"

};


// ======================================================
// CONFIGURAR PDF.JS
// ======================================================

if (window.pdfjsLib) {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

}


// ======================================================
// ELEMENTOS HTML
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

const cerrarVisor =
    document.getElementById("cerrarVisor");

const verRecibo =
    document.getElementById("verRecibo");

const textoQuincena =
    document.getElementById("textoQuincena");

const periodoSeleccionado =
    document.getElementById("periodoSeleccionado");


// ======================================================
// VARIABLES
// ======================================================

let empleadoActual = null;

let paginaEncontrada = null;

let quincenaSeleccionada = "q1";


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
// MOSTRAR MENSAJE
// ======================================================

function mostrarMensaje(
    texto,
    tipo = "normal"
) {

    mensaje.textContent = texto;


    if (tipo === "error") {

        mensaje.style.color =
            "#c62828";

    } else {

        mensaje.style.color =
            "#08743b";

    }

}


// ======================================================
// OBTENER QUINCENA SELECCIONADA
// ======================================================

function obtenerQuincenaSeleccionada() {

    const seleccion =
        document.querySelector(
            'input[name="quincena"]:checked'
        );


    if (!seleccion) {

        return "q1";

    }


    return seleccion.value;

}


// ======================================================
// CARGAR PDF
// ======================================================

async function cargarPDF(url) {

    if (!window.pdfjsLib) {

        throw new Error(
            "PDF.js no está cargado."
        );

    }


    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


    const tarea =
        pdfjsLib.getDocument({

            url: url,

            disableAutoFetch: false,

            disableStream: false

        });


    return await tarea.promise;

}


// ======================================================
// BUSCAR CÓDIGO EN EL PDF
// ======================================================

async function buscarEnPDF(
    url,
    codigo
) {

    console.log(
        "Buscando:",
        codigo,
        "en:",
        url
    );


    const pdf =
        await cargarPDF(url);


    console.log(
        "PDF cargado:",
        pdf.numPages,
        "páginas"
    );


    const codigoNormalizado =
        normalizarTexto(codigo);


    // ------------------------------------------
    // RECORRER PÁGINAS
    // ------------------------------------------

    for (
        let paginaNumero = 1;

        paginaNumero <= pdf.numPages;

        paginaNumero++
    ) {


        const pagina =
            await pdf.getPage(
                paginaNumero
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


        // --------------------------------------
        // COMPROBAR CÓDIGO
        // --------------------------------------

        if (
            textoNormalizado.includes(
                codigoNormalizado
            )
        ) {


            console.log(
                "✓ Código encontrado",
                codigo,
                "Página:",
                paginaNumero
            );


            // ----------------------------------
            // OBTENER NOMBRE
            // ----------------------------------

            let nombre =
                "Colaborador";


            const encontrado =
                texto.match(
                    /Empleado\s*:\s*(.*?)\s+Sueldo\s+Mensual\s*:/i
                );


            if (encontrado) {

                nombre =
                    encontrado[1].trim();

            }


            return {

                pagina:
                    paginaNumero,

                nombre:
                    nombre

            };

        }


        // --------------------------------------
        // PROGRESO
        // --------------------------------------

        if (
            paginaNumero % 25 === 0
        ) {

            mostrarMensaje(

                "🔎 Revisando página " +
                paginaNumero +
                " de " +
                pdf.numPages +
                "..."

            );

        }

    }


    return null;

}


// ======================================================
// BUSCAR EMPLEADO
// ======================================================

async function buscarEmpleado() {


    const codigo =
        codigoInput.value

            .trim()

            .toUpperCase();


    // ------------------------------------------
    // VALIDAR CÓDIGO
    // ------------------------------------------

    if (!codigo) {

        mostrarMensaje(

            "⚠️ Ingresa tu código de empleado.",

            "error"

        );

        return;

    }


    // ------------------------------------------
    // OBTENER QUINCENA
    // ------------------------------------------

    quincenaSeleccionada =
        obtenerQuincenaSeleccionada();


    // ------------------------------------------
    // PREPARAR INTERFAZ
    // ------------------------------------------

    botonBuscar.disabled =
        true;


    botonBuscar.textContent =
        "Buscando...";


    resultado.classList.add(
        "oculto"
    );


    visor.classList.add(
        "oculto"
    );


    paginaEncontrada =
        null;


    // ------------------------------------------
    // NOMBRE DE QUINCENA
    // ------------------------------------------

    const nombreQuincena =
        quincenaSeleccionada === "q1"

            ? "Quincena 1"

            : "Quincena 2";


    try {


        mostrarMensaje(

            "🔎 Buscando en " +
            nombreQuincena +
            "..."

        );


        // --------------------------------------
        // BUSCAR SOLO EN LA QUINCENA ELEGIDA
        // --------------------------------------

        const resultadoBusqueda =
            await buscarEnPDF(

                PDFS[
                    quincenaSeleccionada
                ],

                codigo

            );


        // --------------------------------------
        // NO ENCONTRADO
        // --------------------------------------

        if (!resultadoBusqueda) {

            mostrarMensaje(

                "❌ No encontramos un recibo con ese código en " +
                nombreQuincena +
                ".",

                "error"

            );

            return;

        }


        // --------------------------------------
        // GUARDAR PÁGINA
        // --------------------------------------

        paginaEncontrada =
            resultadoBusqueda.pagina;


        // --------------------------------------
        // GUARDAR EMPLEADO
        // --------------------------------------

        empleadoActual = {

            codigo:
                codigo,

            nombre:
                resultadoBusqueda.nombre

        };


        // --------------------------------------
        // MOSTRAR EMPLEADO
        // --------------------------------------

        nombreEmpleado.textContent =
            empleadoActual.nombre;


        codigoEmpleado.textContent =
            empleadoActual.codigo;


        // --------------------------------------
        // ACTUALIZAR QUINCENA
        // --------------------------------------

        textoQuincena.textContent =
            nombreQuincena.toUpperCase();


        periodoSeleccionado.textContent =
            nombreQuincena.toUpperCase();


        verRecibo.dataset.quincena =
            quincenaSeleccionada === "q1"
                ? "1"
                : "2";


        visorTitulo.textContent =
            "Recibo — " +
            nombreQuincena;


        // --------------------------------------
        // MOSTRAR RESULTADO
        // --------------------------------------

        resultado.classList.remove(
            "oculto"
        );


        mostrarMensaje(

            "✓ Empleado encontrado correctamente."

        );


        resultado.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });


    } catch (error) {


        console.error(
            "ERROR:",
            error
        );


        mostrarMensaje(

            "❌ Ocurrió un error al leer el recibo.",

            "error"

        );


    } finally {


        botonBuscar.disabled =
            false;


        botonBuscar.textContent =
            "Consultar";

    }

}


// ======================================================
// MOSTRAR SOLO LA PÁGINA DEL RECIBO
// ======================================================

async function abrirRecibo() {


    // ------------------------------------------
    // COMPROBAR PÁGINA
    // ------------------------------------------

    if (!paginaEncontrada) {

        alert(

            "Primero debes consultar un código de empleado."

        );

        return;

    }


    // ------------------------------------------
    // OBTENER QUINCENA
    // ------------------------------------------

    const pdfSeleccionado =
        PDFS[
            quincenaSeleccionada
        ];


    const nombreQuincena =
        quincenaSeleccionada === "q1"

            ? "Quincena 1"

            : "Quincena 2";


    // ------------------------------------------
    // TÍTULO
    // ------------------------------------------

    visorTitulo.textContent =
        "Recibo — " +
        nombreQuincena;


    // ------------------------------------------
    // CONTENEDOR
    // ------------------------------------------

    const visorPDF =
        document.querySelector(
            ".visor-pdf"
        );


    visorPDF.innerHTML = `

        <div
            style="
                text-align:center;
                padding:50px;
                color:#08743b;
                font-size:18px;
            "
        >

            🔄 Cargando tu recibo...

        </div>

    `;


    visor.classList.remove(
        "oculto"
    );


    visor.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });


    try {


        // --------------------------------------
        // CARGAR PDF
        // --------------------------------------

        const pdf =
            await cargarPDF(
                pdfSeleccionado
            );


        // --------------------------------------
        // OBTENER SOLO LA PÁGINA
        // --------------------------------------

        const page =
            await pdf.getPage(
                paginaEncontrada
            );


        // --------------------------------------
        // TAMAÑO ORIGINAL
        // --------------------------------------

        const viewportOriginal =
            page.getViewport({

                scale:
                    1

            });


        // --------------------------------------
        // ANCHO DISPONIBLE
        // --------------------------------------

        const anchoDisponible =
            Math.min(

                1000,

                visorPDF.clientWidth ||
                1000

            );


        // --------------------------------------
        // ESCALA
        // --------------------------------------

        const escala =
            Math.max(

                1,

                anchoDisponible /
                viewportOriginal.width

            );


        const viewport =
            page.getViewport({

                scale:
                    escala

            });


        // --------------------------------------
        // CREAR CANVAS
        // --------------------------------------

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


        // --------------------------------------
        // ESTILOS
        // --------------------------------------

        canvas.style.display =
            "block";


        canvas.style.width =
            "100%";


        canvas.style.height =
            "auto";


        canvas.style.margin =
            "0 auto";


        canvas.style.background =
            "#ffffff";


        canvas.style.borderRadius =
            "12px";


        canvas.style.boxShadow =
            "0 5px 25px rgba(0,0,0,0.12)";


        // --------------------------------------
        // LIMPIAR CONTENEDOR
        // --------------------------------------

        visorPDF.innerHTML =
            "";


        // --------------------------------------
        // INSERTAR CANVAS
        // --------------------------------------

        visorPDF.appendChild(
            canvas
        );


        // --------------------------------------
        // RENDERIZAR SOLO ESTA PÁGINA
        // --------------------------------------

        await page.render({

            canvasContext:
                contexto,

            viewport:
                viewport

        }).promise;


        console.log(

            "✓ Recibo mostrado. Página:",

            paginaEncontrada

        );


    } catch (error) {


        console.error(

            "Error mostrando recibo:",

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
// BOTÓN VER RECIBO
// ======================================================

verRecibo.addEventListener(

    "click",

    abrirRecibo

);


// ======================================================
// CERRAR VISOR
// ======================================================

cerrarVisor.addEventListener(

    "click",

    function () {

        visor.classList.add(
            "oculto"
        );

    }

);


// ======================================================
// NUEVA CONSULTA
// ======================================================

nuevaConsulta.addEventListener(

    "click",

    function () {


        codigoInput.value =
            "";


        mensaje.textContent =
            "";


        resultado.classList.add(
            "oculto"
        );


        visor.classList.add(
            "oculto"
        );


        paginaEncontrada =
            null;


        empleadoActual =
            null;


        codigoInput.focus();


        window.scrollTo({

            top:
                0,

            behavior:
                "smooth"

        });

    }

);


// ======================================================
// BOTÓN CONSULTAR
// ======================================================

botonBuscar.addEventListener(

    "click",

    buscarEmpleado

);


// ======================================================
// ENTER
// ======================================================

codigoInput.addEventListener(

    "keydown",

    function (evento) {


        if (
            evento.key === "Enter"
        ) {

            buscarEmpleado();

        }

    }

);
