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
// CONFIGURACIÓN PDF.JS
// ======================================================

if (window.pdfjsLib) {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

}


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

const cerrarVisor =
    document.getElementById("cerrarVisor");

const verRecibo =
    document.getElementById("verRecibo");

const guardarRecibo =
    document.getElementById("guardarRecibo");

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

let canvasRecibo = null;


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
// MENSAJES
// ======================================================

function mostrarMensaje(
    texto,
    tipo = "normal"
) {

    mensaje.textContent =
        texto;


    if (tipo === "error") {

        mensaje.style.color =
            "#c62828";

    } else {

        mensaje.style.color =
            "#08743b";

    }

}


// ======================================================
// OBTENER QUINCENA
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
// BUSCAR CÓDIGO
// ======================================================

async function buscarEnPDF(
    url,
    codigo
) {

    const pdf =
        await cargarPDF(url);


    const codigoNormalizado =
        normalizarTexto(codigo);


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


        if (
            textoNormalizado.includes(
                codigoNormalizado
            )
        ) {


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


    if (!codigo) {

        mostrarMensaje(
            "⚠️ Ingresa tu código de empleado.",
            "error"
        );

        return;

    }


    quincenaSeleccionada =
        obtenerQuincenaSeleccionada();


    const nombreQuincena =
        quincenaSeleccionada === "q1"
            ? "Quincena 1"
            : "Quincena 2";


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


    canvasRecibo =
        null;


    try {


        mostrarMensaje(
            "🔎 Buscando en " +
            nombreQuincena +
            "..."
        );


        const resultadoBusqueda =
            await buscarEnPDF(

                PDFS[
                    quincenaSeleccionada
                ],

                codigo

            );


        if (!resultadoBusqueda) {

            mostrarMensaje(

                "❌ No encontramos un recibo con ese código en " +
                nombreQuincena +
                ".",

                "error"

            );

            return;

        }


        paginaEncontrada =
            resultadoBusqueda.pagina;


        empleadoActual = {

            codigo:
                codigo,

            nombre:
                resultadoBusqueda.nombre

        };


        nombreEmpleado.textContent =
            empleadoActual.nombre;


        codigoEmpleado.textContent =
            empleadoActual.codigo;


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

        );


    } catch (error) {


        console.error(
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
// MOSTRAR RECIBO
// ======================================================

async function abrirRecibo() {


    if (!paginaEncontrada) {

        alert(
            "Primero debes consultar un empleado."
        );

        return;

    }


    const visorPDF =
        document.querySelector(
            ".visor-pdf"
        );


    const nombreQuincena =
        quincenaSeleccionada === "q1"
            ? "Quincena 1"
            : "Quincena 2";


    visorTitulo.textContent =
        "Recibo — " +
        nombreQuincena;


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


        const pdf =
            await cargarPDF(

                PDFS[
                    quincenaSeleccionada
                ]

            );


        const page =
            await pdf.getPage(
                paginaEncontrada
            );


        const viewportOriginal =
            page.getViewport({

                scale:
                    1

            });


        const anchoDisponible =
            Math.min(

                1000,

                visorPDF.clientWidth ||
                1000

            );


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


        visorPDF.innerHTML =
            "";


        visorPDF.appendChild(
            canvas
        );


        await page.render({

            canvasContext:
                contexto,

            viewport:
                viewport

        }).promise;


        // Guardamos el canvas
        // para poder generar
        // el archivo posteriormente

        canvasRecibo =
            canvas;


    } catch (error) {


        console.error(
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
// GUARDAR RECIBO
// ======================================================

async function guardarReciboComoPDF() {


    if (!canvasRecibo) {

        alert(
            "Primero debes abrir el recibo."
        );

        return;

    }


    if (!empleadoActual) {

        alert(
            "No se encontró información del empleado."
        );

        return;

    }


    try {


        // --------------------------------------
        // CARGAR LIBRERÍA PDF
        // --------------------------------------

        if (!window.jspdf) {

            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";


            document.head.appendChild(
                script
            );


            await new Promise(
                (resolve, reject) => {


                    script.onload =
                        resolve;


                    script.onerror =
                        reject;

                }
            );

        }


        // --------------------------------------
        // OBTENER jsPDF
        // --------------------------------------

        const {
            jsPDF
        } =
            window.jspdf;


        // --------------------------------------
        // DATOS DEL CANVAS
        // --------------------------------------

        const imagen =
            canvasRecibo.toDataURL(
                "image/jpeg",
                0.95
            );


        const ancho =
            canvasRecibo.width;


        const alto =
            canvasRecibo.height;


        // --------------------------------------
        // TAMAÑO A4
        // --------------------------------------

        const pdf =
            new jsPDF({

                orientation:
                    alto > ancho
                        ? "portrait"
                        : "landscape",

                unit:
                    "mm",

                format:
                    "a4"

            });


        const paginaAncho =
            pdf.internal.pageSize.getWidth();


        const paginaAlto =
            pdf.internal.pageSize.getHeight();


        const margen =
            8;


        const anchoDisponible =
            paginaAncho -
            (margen * 2);


        const altoDisponible =
            paginaAlto -
            (margen * 2);


        const proporcion =
            Math.min(

                anchoDisponible /
                ancho,

                altoDisponible /
                alto

            );


        const imagenAncho =
            ancho *
            proporcion;


        const imagenAlto =
            alto *
            proporcion;


        const posicionX =
            (paginaAncho -
             imagenAncho) / 2;


        const posicionY =
            (paginaAlto -
             imagenAlto) / 2;


        // --------------------------------------
        // AGREGAR SOLO EL RECIBO
        // --------------------------------------

        pdf.addImage(

            imagen,

            "JPEG",

            posicionX,

            posicionY,

            imagenAncho,

            imagenAlto

        );


        // --------------------------------------
        // NOMBRE DEL ARCHIVO
        // --------------------------------------

        const qNombre =
            quincenaSeleccionada === "q1"
                ? "Q1"
                : "Q2";


        const nombreArchivo =
            "Recibo_" +
            empleadoActual.codigo +
            "_" +
            qNombre +
            ".pdf";


        // --------------------------------------
        // DESCARGAR
        // --------------------------------------

        pdf.save(
            nombreArchivo
        );


    } catch (error) {


        console.error(
            "Error guardando recibo:",
            error
        );


        alert(
            "No se pudo guardar el recibo."
        );

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
// BOTÓN GUARDAR
// ======================================================

guardarRecibo.addEventListener(

    "click",

    guardarReciboComoPDF

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


        canvasRecibo =
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
