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

let pdfActual = null;

let paginaActual = null;


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

    mensaje.style.color =
        tipo === "error"
            ? "#c62828"
            : "#08743b";

}


// ======================================================
// OBTENER QUINCENA
// ======================================================

function obtenerQuincenaSeleccionada() {

    const seleccion =
        document.querySelector(
            'input[name="quincena"]:checked'
        );

    return seleccion
        ? seleccion.value
        : "q1";

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
            url: url
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

    pdfActual =
        null;

    paginaActual =
        null;


    try {

        mostrarMensaje(
            "🔎 Buscando en " +
            nombreQuincena +
            "..."
        );


        const encontrado =
            await buscarEnPDF(
                PDFS[
                    quincenaSeleccionada
                ],
                codigo
            );


        if (!encontrado) {

            mostrarMensaje(
                "❌ No encontramos un recibo con ese código en " +
                nombreQuincena +
                ".",
                "error"
            );

            return;

        }


        paginaEncontrada =
            encontrado.pagina;


        empleadoActual = {

            codigo:
                codigo,

            nombre:
                encontrado.nombre

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
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(error);


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
        behavior: "smooth",
        block: "start"
    });


    try {

        const pdf =
            await cargarPDF(
                PDFS[
                    quincenaSeleccionada
                ]
            );


        pdfActual =
            pdf;


        const page =
            await pdf.getPage(
                paginaEncontrada
            );


        paginaActual =
            page;


        const viewportOriginal =
            page.getViewport({
                scale: 1
            });


        const anchoDisponible =
            Math.min(
                1000,
                visorPDF.clientWidth || 1000
            );


        const escala =
            Math.max(
                1,
                anchoDisponible /
                viewportOriginal.width
            );


        const viewport =
            page.getViewport({
                scale: escala
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


    } catch (error) {

        console.error(error);


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
// CARGAR jsPDF
// ======================================================

async function cargarJsPDF() {

    if (
        window.jspdf &&
        window.jspdf.jsPDF
    ) {

        return window.jspdf.jsPDF;

    }


    return new Promise(
        (resolve, reject) => {

            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";


            script.onload =
                function () {

                    if (
                        window.jspdf &&
                        window.jspdf.jsPDF
                    ) {

                        resolve(
                            window.jspdf.jsPDF
                        );

                    } else {

                        reject(
                            new Error(
                                "jsPDF no se pudo cargar."
                            )
                        );

                    }

                };


            script.onerror =
                function () {

                    reject(
                        new Error(
                            "No se pudo cargar jsPDF."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


// ======================================================
// GUARDAR RECIBO COMO PDF
// ======================================================

async function guardarReciboComoPDF() {

    if (!paginaActual) {

        alert(
            "Primero debes pulsar «Ver recibo»."
        );

        return;

    }


    if (!empleadoActual) {

        alert(
            "No se encontró la información del empleado."
        );

        return;

    }


    guardarRecibo.disabled =
        true;


    guardarRecibo.textContent =
        "⏳ Preparando...";


    try {

        // --------------------------------------
        // CARGAR jsPDF
        // --------------------------------------

        const jsPDF =
            await cargarJsPDF();


        // --------------------------------------
        // RENDERIZAR EN ALTA CALIDAD
        // --------------------------------------

        const viewport =
            paginaActual.getViewport({
                scale: 2
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


        await paginaActual.render({

            canvasContext:
                contexto,

            viewport:
                viewport

        }).promise;


        // --------------------------------------
        // CONVERTIR A IMAGEN
        // --------------------------------------

        const imagen =
            canvas.toDataURL(
                "image/jpeg",
                0.95
            );


        // --------------------------------------
        // ORIENTACIÓN
        // --------------------------------------

        const vertical =
            viewport.height >=
            viewport.width;


        const pdf =
            new jsPDF({

                orientation:
                    vertical
                        ? "portrait"
                        : "landscape",

                unit:
                    "mm",

                format:
                    "a4",

                compress:
                    true

            });


        // --------------------------------------
        // DIMENSIONES A4
        // --------------------------------------

        const paginaAncho =
            pdf.internal.pageSize.getWidth();


        const paginaAlto =
            pdf.internal.pageSize.getHeight();


        const margen =
            8;


        const anchoDisponible =
            paginaAncho -
            margen * 2;


        const altoDisponible =
            paginaAlto -
            margen * 2;


        const proporcion =
            Math.min(

                anchoDisponible /
                viewport.width,

                altoDisponible /
                viewport.height

            );


        const anchoImagen =
            viewport.width *
            proporcion;


        const altoImagen =
            viewport.height *
            proporcion;


        const posicionX =
            (
                paginaAncho -
                anchoImagen
            ) / 2;


        const posicionY =
            (
                paginaAlto -
                altoImagen
            ) / 2;


        // --------------------------------------
        // AGREGAR SOLO EL RECIBO
        // --------------------------------------

        pdf.addImage(

            imagen,

            "JPEG",

            posicionX,

            posicionY,

            anchoImagen,

            altoImagen,

            undefined,

            "FAST"

        );


        // --------------------------------------
        // NOMBRE DEL ARCHIVO
        // --------------------------------------

        const qNombre =
            quincenaSeleccionada === "q1"
                ? "Q1"
                : "Q2";


        const nombreLimpio =
            empleadoActual.nombre
                .replace(
                    /[\\/:*?"<>|]/g,
                    ""
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        const nombreArchivo =
            "Recibo de Pago - " +
            nombreLimpio +
            " - " +
            qNombre +
            ".pdf";


        // --------------------------------------
        // GUARDAR
        // --------------------------------------

        pdf.save(
            nombreArchivo
        );


        // --------------------------------------
        // CONFIRMACIÓN
        // --------------------------------------

        guardarRecibo.textContent =
            "✓ Recibo guardado";


        mostrarMensaje(
            "✓ Recibo guardado correctamente."
        );


        setTimeout(
            function () {

                guardarRecibo.textContent =
                    "📥 Guardar recibo";

            },
            2500
        );


    } catch (error) {

        console.error(
            "ERROR AL GUARDAR:",
            error
        );


        alert(
            "No se pudo guardar el recibo. Inténtalo nuevamente."
        );


        guardarRecibo.textContent =
            "📥 Guardar recibo";

    } finally {

        guardarRecibo.disabled =
            false;

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

        pdfActual =
            null;

        paginaActual =
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
