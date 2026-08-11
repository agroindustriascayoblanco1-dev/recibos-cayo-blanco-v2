// ======================================================
// COA - RECIBOS DE PAGO
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
// ELEMENTOS DEL HTML
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

const textoQuincena =
    document.getElementById("textoQuincena");

const periodoSeleccionado =
    document.getElementById("periodoSeleccionado");

const visorPDF =
    document.querySelector(".visor-pdf");


// ======================================================
// VARIABLES
// ======================================================

let empleadoActual = null;

let paginaEncontrada = null;

let paginaActual = null;

let pdfActual = null;

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
// VALIDAR CÓDIGO
// ======================================================

function validarCodigo(codigo) {

    const codigoLimpio =
        codigo.trim().toUpperCase();


    // Debe tener contenido

    if (!codigoLimpio) {

        return {
            valido: false,
            mensaje:
                "⚠️ Ingresa tu código de empleado."
        };

    }


    // No permite espacios dentro del código

    if (/\s/.test(codigoLimpio)) {

        return {
            valido: false,
            mensaje:
                "⚠️ Escribe el código completo, sin espacios."
        };

    }


    // Solo permite letras y números

    if (!/^[A-Z0-9]+$/.test(codigoLimpio)) {

        return {
            valido: false,
            mensaje:
                "⚠️ El código solo debe contener letras y números."
        };

    }


    // No permite códigos formados únicamente por números

    if (/^\d+$/.test(codigoLimpio)) {

        return {
            valido: false,
            mensaje:
                "⚠️ Debes ingresar el código completo, incluyendo sus letras."
        };

    }


    // No permite códigos formados únicamente por letras

    if (/^[A-Z]+$/.test(codigoLimpio)) {

        return {
            valido: false,
            mensaje:
                "⚠️ Debes ingresar el código completo."
        };

    }


    return {

        valido: true,

        codigo:
            codigoLimpio

    };

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


    const documento =
        await pdfjsLib.getDocument({
            url: url
        }).promise;


    return documento;

}


// ======================================================
// BUSCAR CÓDIGO EXACTO DENTRO DEL PDF
// ======================================================

async function buscarEnPDF(
    url,
    codigo
) {

    const pdf =
        await cargarPDF(url);


    const codigoBuscado =
        normalizarTexto(codigo);


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


        // ------------------------------------------
        // OBTENER PALABRAS / ELEMENTOS DEL PDF
        // ------------------------------------------

        const elementos =
            contenido.items
                .map(
                    item =>
                        normalizarTexto(
                            item.str || ""
                        )
                )
                .filter(
                    item =>
                        item.length > 0
                );


        // ------------------------------------------
        // COMPROBAR COINCIDENCIA EXACTA
        // ------------------------------------------
        //
        // IMPORTANTE:
        //
        // Ya NO usamos includes().
        //
        // Por ejemplo:
        //
        // CBEP0016  -> encuentra CBEP0016
        //
        // 0016      -> NO encuentra CBEP0016
        //
        // CBEP      -> NO encuentra CBEP0016
        //
        // EP0016    -> NO encuentra CBEP0016
        //
        // ------------------------------------------

        const codigoEncontrado =
            elementos.some(
                elemento =>
                    elemento === codigoBuscado
            );


        if (
            codigoEncontrado
        ) {

            let nombre =
                "Colaborador";


            // --------------------------------------
            // INTENTAR OBTENER NOMBRE
            // --------------------------------------

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
                    numeroPagina,

                nombre:
                    nombre

            };

        }


        // ------------------------------------------
        // AVANCE
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
// BUSCAR EMPLEADO
// ======================================================

async function buscarEmpleado() {

    const codigoEscrito =
        codigoInput.value;


    // ----------------------------------------------
    // VALIDAR CÓDIGO
    // ----------------------------------------------

    const validacion =
        validarCodigo(
            codigoEscrito
        );


    if (
        !validacion.valido
    ) {

        mostrarMensaje(

            validacion.mensaje,

            "error"

        );

        codigoInput.focus();

        return;

    }


    const codigo =
        validacion.codigo;


    // ----------------------------------------------
    // OBTENER QUINCENA
    // ----------------------------------------------

    quincenaSeleccionada =
        obtenerQuincena();


    const nombreQuincena =
        quincenaSeleccionada === "q1"
            ? "Quincena 1"
            : "Quincena 2";


    // ----------------------------------------------
    // LIMPIAR DATOS ANTERIORES
    // ----------------------------------------------

    empleadoActual =
        null;

    paginaEncontrada =
        null;

    paginaActual =
        null;

    pdfActual =
        null;


    resultado.classList.add(
        "oculto"
    );


    visor.classList.add(
        "oculto"
    );


    // ----------------------------------------------
    // DESACTIVAR BOTÓN
    // ----------------------------------------------

    botonBuscar.disabled =
        true;


    botonBuscar.textContent =
        "Buscando...";


    try {

        mostrarMensaje(

            "🔎 Buscando en " +
            nombreQuincena +
            "..."

        );


        // ------------------------------------------
        // BUSCAR CÓDIGO EXACTO
        // ------------------------------------------

        const encontrado =
            await buscarEnPDF(

                PDFS[
                    quincenaSeleccionada
                ],

                codigo

            );


        // ------------------------------------------
        // NO ENCONTRADO
        // ------------------------------------------

        if (!encontrado) {

            mostrarMensaje(

                "❌ El código ingresado no coincide con un código completo registrado.",

                "error"

            );

            return;

        }


        // ------------------------------------------
        // GUARDAR INFORMACIÓN
        // ------------------------------------------

        paginaEncontrada =
            encontrado.pagina;


        empleadoActual = {

            codigo:
                codigo,

            nombre:
                encontrado.nombre

        };


        // ------------------------------------------
        // MOSTRAR INFORMACIÓN
        // ------------------------------------------

        nombreEmpleado.textContent =
            empleadoActual.nombre;


        codigoEmpleado.textContent =
            empleadoActual.codigo;


        textoQuincena.textContent =
            nombreQuincena.toUpperCase();


        periodoSeleccionado.textContent =
            nombreQuincena.toUpperCase();


        visorTitulo.textContent =
            "Recibo — " +
            nombreQuincena;


        // ------------------------------------------
        // OCULTAR TARJETA INTERMEDIA
        // ------------------------------------------

        resultado.classList.add(
            "oculto"
        );


        mostrarMensaje(

            "✓ Empleado encontrado correctamente."

        );


        // ------------------------------------------
        // ABRIR RECIBO AUTOMÁTICAMENTE
        // ------------------------------------------

        setTimeout(

            () => {

                abrirRecibo();

            },

            300

        );


    } catch (error) {

        console.error(
            "Error en búsqueda:",
            error
        );


        mostrarMensaje(

            "❌ Ocurrió un error al buscar el recibo.",

            "error"

        );

    } finally {

        botonBuscar.disabled =
            false;


        botonBuscar.textContent =
            "🔎 Consultar";

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


        pdfActual =
            pdf;


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


        await pagina.render({

            canvasContext:
                contexto,

            viewport:
                viewport

        }).promise;


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
// GUARDAR RECIBO
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

        const jsPDF =
            await cargarJsPDF();


        const viewport =
            paginaActual.getViewport({

                scale:
                    2

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


        const imagen =
            canvas.toDataURL(

                "image/jpeg",

                0.95

            );


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


        pdf.save(
            nombreArchivo
        );


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
            "Error guardando recibo:",
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
// NUEVA CONSULTA
// ======================================================

function nuevaConsultaFuncion() {

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


    empleadoActual =
        null;


    paginaEncontrada =
        null;


    paginaActual =
        null;


    pdfActual =
        null;


    codigoInput.focus();


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}


// ======================================================
// CERRAR VISOR
// ======================================================

function cerrarVisorFuncion() {

    visor.classList.add(
        "oculto"
    );


    paginaActual =
        null;


    pdfActual =
        null;

}


// ======================================================
// CAMBIO DE QUINCENA
// ======================================================

function cambioQuincena() {

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


    empleadoActual =
        null;


    paginaEncontrada =
        null;


    paginaActual =
        null;


    pdfActual =
        null;

}


// ======================================================
// EVENTOS
// ======================================================


// BOTÓN BUSCAR

botonBuscar.addEventListener(
    "click",
    buscarEmpleado
);


// ENTER EN EL CÓDIGO

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


// VER RECIBO

verRecibo.addEventListener(
    "click",
    abrirRecibo
);


// GUARDAR

guardarRecibo.addEventListener(
    "click",
    guardarReciboComoPDF
);


// CERRAR

cerrarVisor.addEventListener(
    "click",
    cerrarVisorFuncion
);


// NUEVA CONSULTA

nuevaConsulta.addEventListener(
    "click",
    nuevaConsultaFuncion
);


// CAMBIO DE QUINCENA

document
    .querySelectorAll(
        'input[name="quincena"]'
    )
    .forEach(

        function (radio) {

            radio.addEventListener(
                "change",
                cambioQuincena
            );

        }

    );


// ======================================================
// FIN
// ======================================================
