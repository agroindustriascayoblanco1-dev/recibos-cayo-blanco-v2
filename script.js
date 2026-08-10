// ======================================================
// COA - RECIBOS DE PAGO - VERSIÓN 2
// ======================================================

// ------------------------------------------------------
// ARCHIVOS PDF
// ------------------------------------------------------

const PDFS = {
    q1: "recibos-q1.pdf.pdf",
    q2: "recibos-q2.pdf.pdf"
};


// ------------------------------------------------------
// CONFIGURACIÓN DE PDF.JS
// ------------------------------------------------------

if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}


// ------------------------------------------------------
// ELEMENTOS HTML
// ------------------------------------------------------

const codigoInput = document.getElementById("codigo");
const botonBuscar = document.getElementById("buscar");
const mensaje = document.getElementById("mensaje");

const resultado = document.getElementById("resultado");

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


// ------------------------------------------------------
// VARIABLES
// ------------------------------------------------------

let empleadoActual = null;

let paginasEncontradas = {
    q1: null,
    q2: null
};


// ------------------------------------------------------
// NORMALIZAR TEXTO
// ------------------------------------------------------

function normalizarTexto(texto) {

    return String(texto || "")
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9]/g, "");

}


// ------------------------------------------------------
// MOSTRAR MENSAJE
// ------------------------------------------------------

function mostrarMensaje(texto, tipo = "normal") {

    mensaje.textContent = texto;

    if (tipo === "error") {

        mensaje.style.color = "#c62828";

    } else {

        mensaje.style.color = "#08743b";

    }

}


// ------------------------------------------------------
// CARGAR PDF
// ------------------------------------------------------

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


// ------------------------------------------------------
// BUSCAR EMPLEADO EN PDF
// ------------------------------------------------------

async function buscarEnPDF(url, codigo) {

    console.log(
        "Buscando código:",
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
                .map(item => item.str || "")
                .join(" ");


        const textoNormalizado =
            normalizarTexto(texto);


        // ------------------------------------------
        // COMPROBAR CÓDIGO
        // ------------------------------------------

        if (
            textoNormalizado.includes(
                codigoNormalizado
            )
        ) {


            console.log(
                "✓ ENCONTRADO",
                codigo,
                "Página:",
                paginaNumero
            );


            // --------------------------------------
            // OBTENER NOMBRE
            // --------------------------------------

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

                pagina: paginaNumero,

                nombre: nombre

            };

        }


        // ------------------------------------------
        // PROGRESO
        // ------------------------------------------

        if (
            paginaNumero % 25 === 0
        ) {

            console.log(
                "Revisadas:",
                paginaNumero,
                "/",
                pdf.numPages
            );

        }

    }


    return null;

}


// ------------------------------------------------------
// BUSCAR EMPLEADO
// ------------------------------------------------------

async function buscarEmpleado() {

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
            "error"
        );

        return;

    }


    // ------------------------------------------
    // PREPARAR INTERFAZ
    // ------------------------------------------

    botonBuscar.disabled = true;

    botonBuscar.textContent =
        "Buscando...";


    resultado.classList.add(
        "oculto"
    );


    visor.classList.add(
        "oculto"
    );


    paginasEncontradas = {

        q1: null,

        q2: null

    };


    try {


        // --------------------------------------
        // QUINCENA 1
        // --------------------------------------

        mostrarMensaje(
            "🔎 Buscando en Quincena 1..."
        );


        const q1 =
            await buscarEnPDF(
                PDFS.q1,
                codigo
            );


        // --------------------------------------
        // QUINCENA 2
        // --------------------------------------

        mostrarMensaje(
            "🔎 Buscando en Quincena 2..."
        );


        const q2 =
            await buscarEnPDF(
                PDFS.q2,
                codigo
            );


        // --------------------------------------
        // NO ENCONTRADO
        // --------------------------------------

        if (!q1 && !q2) {

            mostrarMensaje(
                "❌ No encontramos un recibo con ese código.",
                "error"
            );

            return;

        }


        // --------------------------------------
        // GUARDAR PÁGINAS
        // --------------------------------------

        paginasEncontradas.q1 =
            q1
                ? q1.pagina
                : null;


        paginasEncontradas.q2 =
            q2
                ? q2.pagina
                : null;


        // --------------------------------------
        // DATOS DEL EMPLEADO
        // --------------------------------------

        empleadoActual = {

            codigo: codigo,

            nombre:
                q1
                    ? q1.nombre
                    : q2.nombre

        };


        nombreEmpleado.textContent =
            empleadoActual.nombre;


        codigoEmpleado.textContent =
            empleadoActual.codigo;


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

            behavior: "smooth",

            block: "start"

        });


    } catch (error) {


        console.error(
            "ERROR:",
            error
        );


        mostrarMensaje(
            "❌ Ocurrió un error al leer los recibos.",
            "error"
        );


    } finally {


        botonBuscar.disabled = false;

        botonBuscar.textContent =
            "Consultar";

    }

}


// ------------------------------------------------------
// MOSTRAR SOLO LA PÁGINA DEL RECIBO
// ------------------------------------------------------

async function abrirRecibo(quincena) {

    const paginaNumero =
        paginasEncontradas[
            quincena
        ];


    // ------------------------------------------
    // COMPROBAR EXISTENCIA
    // ------------------------------------------

    if (!paginaNumero) {

        alert(
            "Este empleado no tiene recibo disponible para esta quincena."
        );

        return;

    }


    // ------------------------------------------
    // TÍTULO
    // ------------------------------------------

    if (
        quincena === "q1"
    ) {

        visorTitulo.textContent =
            "Recibo — Quincena 1";

    } else {

        visorTitulo.textContent =
            "Recibo — Quincena 2";

    }


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

            🔄 Cargando recibo...

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


        // --------------------------------------
        // CARGAR PDF
        // --------------------------------------

        const pdf =
            await cargarPDF(
                PDFS[quincena]
            );


        // --------------------------------------
        // OBTENER SOLAMENTE LA PÁGINA
        // --------------------------------------

        const page =
            await pdf.getPage(
                paginaNumero
            );


        // --------------------------------------
        // CALCULAR TAMAÑO
        // --------------------------------------

        const viewportOriginal =
            page.getViewport({

                scale: 1

            });


        const anchoDisponible =
            Math.min(
                visorPDF.clientWidth || 1000,
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

                scale: escala

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
        // LIMPIAR
        // --------------------------------------

        visorPDF.innerHTML = "";


        // --------------------------------------
        // INSERTAR CANVAS
        // --------------------------------------

        visorPDF.appendChild(
            canvas
        );


        // --------------------------------------
        // RENDERIZAR
        // --------------------------------------

        await page.render({

            canvasContext:
                contexto,

            viewport:
                viewport

        }).promise;


        console.log(
            "✓ Mostrada solamente la página:",
            paginaNumero
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


// ------------------------------------------------------
// BOTONES DE QUINCENA
// ------------------------------------------------------

const botonesRecibo =
    document.querySelectorAll(
        ".ver-recibo"
    );


botonesRecibo.forEach(
    boton => {


        boton.addEventListener(
            "click",
            function () {


                const quincena =
                    boton.dataset.quincena;


                if (
                    quincena === "1"
                ) {

                    abrirRecibo(
                        "q1"
                    );

                } else {

                    abrirRecibo(
                        "q2"
                    );

                }

            }
        );

    }
);


// ------------------------------------------------------
// CERRAR VISOR
// ------------------------------------------------------

cerrarVisor.addEventListener(
    "click",
    function () {

        visor.classList.add(
            "oculto"
        );

    }
);


// ------------------------------------------------------
// NUEVA CONSULTA
// ------------------------------------------------------

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


        paginasEncontradas = {

            q1: null,

            q2: null

        };


        empleadoActual =
            null;


        codigoInput.focus();


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }
);


// ------------------------------------------------------
// BOTÓN CONSULTAR
// ------------------------------------------------------

botonBuscar.addEventListener(
    "click",
    buscarEmpleado
);


// ------------------------------------------------------
// ENTER
// ------------------------------------------------------

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
