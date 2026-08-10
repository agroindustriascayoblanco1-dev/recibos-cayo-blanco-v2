// ======================================================
// COA - RECIBOS DE PAGO
// SCRIPT ESTABLE - VERSIÓN 2
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
// ELEMENTOS DE LA PÁGINA
// ======================================================

const codigoInput = document.getElementById("codigo");
const botonBuscar = document.getElementById("buscar");
const mensaje = document.getElementById("mensaje");

const resultado = document.getElementById("resultado");
const nombreEmpleado = document.getElementById("nombreEmpleado");
const codigoEmpleado = document.getElementById("codigoEmpleado");

const nuevaConsulta = document.getElementById("nuevaConsulta");

const visor = document.getElementById("visor");
const visorTitulo = document.getElementById("visorTitulo");
const visorFecha = document.getElementById("visorFecha");
const visorPDF = document.querySelector(".visor-pdf");

const verRecibo = document.getElementById("verRecibo");
const guardarRecibo = document.getElementById("guardarRecibo");
const cerrarVisor = document.getElementById("cerrarVisor");

const textoQuincena = document.getElementById("textoQuincena");
const periodoSeleccionado = document.getElementById("periodoSeleccionado");
const fechaRecibo = document.getElementById("fechaRecibo");

const fechaQ1Selector = document.getElementById("fechaQ1Selector");
const fechaQ2Selector = document.getElementById("fechaQ2Selector");


// ======================================================
// VARIABLES
// ======================================================

let quincenaActual = "q1";

let paginaEncontrada = null;

let empleadoActual = null;

let paginaPDFActual = null;


// ======================================================
// CONFIGURAR PDF.JS
// ======================================================

if (window.pdfjsLib) {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

}


// ======================================================
// MOSTRAR LOS MESES
// ======================================================

function actualizarMeses() {

    if (fechaQ1Selector) {

        fechaQ1Selector.textContent =
            PERIODOS.q1.mes;

    }

    if (fechaQ2Selector) {

        fechaQ2Selector.textContent =
            PERIODOS.q2.mes;

    }

}


// ======================================================
// ACTUALIZAR INFORMACIÓN DE LA QUINCENA
// ======================================================

function actualizarInformacion() {

    const periodo =
        PERIODOS[quincenaActual];

    if (!periodo) {
        return;
    }


    if (periodoSeleccionado) {

        periodoSeleccionado.textContent =
            periodo.nombre.toUpperCase() +
            " · " +
            periodo.mes.toUpperCase();

    }


    if (textoQuincena) {

        textoQuincena.textContent =
            periodo.nombre.toUpperCase();

    }


    if (fechaRecibo) {

        fechaRecibo.textContent =
            periodo.mes;

    }


    if (visorFecha) {

        visorFecha.textContent =
            periodo.mes;

    }


    if (visorTitulo) {

        visorTitulo.textContent =
            "Recibo — " +
            periodo.nombre;

    }

}


// ======================================================
// NORMALIZAR TEXTO
// ======================================================

function normalizar(texto) {

    return String(texto || "")
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9]/g, "");

}


// ======================================================
// MENSAJE
// ======================================================

function mostrarMensaje(texto, error = false) {

    mensaje.textContent = texto;

    mensaje.style.color =
        error
            ? "#c62828"
            : "#08743b";

}


// ======================================================
// LIMPIAR CONSULTA
// ======================================================

function limpiarConsulta() {

    empleadoActual = null;

    paginaEncontrada = null;

    paginaPDFActual = null;


    nombreEmpleado.textContent = "—";

    codigoEmpleado.textContent = "—";


    resultado.classList.add("oculto");

    visor.classList.add("oculto");


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
            "PDF.js no está disponible."
        );

    }


    const tarea =
        pdfjsLib.getDocument({

            url: archivo,

            // Evita problemas con archivos almacenados
            // en GitHub Pages.
            withCredentials: false

        });


    return await tarea.promise;

}


// ======================================================
// BUSCAR EMPLEADO DENTRO DEL PDF
// ======================================================

async function buscarEnPDF(archivo, codigo) {

    const pdf =
        await cargarPDF(archivo);


    const codigoBuscado =
        normalizar(codigo);


    for (
        let numeroPagina = 1;
        numeroPagina <= pdf.numPages;
        numeroPagina++
    ) {

        const pagina =
            await pdf.getPage(numeroPagina);


        const contenido =
            await pagina.getTextContent();


        const texto =
            contenido.items
                .map(item => item.str || "")
                .join(" ");


        const textoNormalizado =
            normalizar(texto);


        // ------------------------------------------
        // BUSCAR EL CÓDIGO
        // ------------------------------------------

        if (
            textoNormalizado.includes(
                codigoBuscado
            )
        ) {


            // --------------------------------------
            // INTENTAR OBTENER EL NOMBRE
            // --------------------------------------

            let nombre =
                "Colaborador";


            const encontrado =
                texto.match(
                    /Empleado\s*:\s*(.*?)\s+Sueldo\s+Mensual/i
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
        // AVANCE DE BÚSQUEDA
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
// CONSULTAR
// ======================================================

async function consultar() {

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
            true
        );

        codigoInput.focus();

        return;

    }


    // ------------------------------------------
    // OBTENER QUINCENA
    // ------------------------------------------

    const seleccion =
        document.querySelector(
            'input[name="quincena"]:checked'
        );


    quincenaActual =
        seleccion
            ? seleccion.value
            : "q1";


    const periodo =
        PERIODOS[quincenaActual];


    // ------------------------------------------
    // LIMPIAR CONSULTA ANTERIOR
    // ------------------------------------------

    empleadoActual = null;

    paginaEncontrada = null;

    paginaPDFActual = null;

    resultado.classList.add("oculto");

    visor.classList.add("oculto");


    // ------------------------------------------
    // DESACTIVAR BOTÓN
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
        // BUSCAR EN EL PDF
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
        // MOSTRAR PERÍODO
        // --------------------------------------

        actualizarInformacion();


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
            "Error al consultar:",
            error
        );


        mostrarMensaje(

            "❌ No se pudo consultar el PDF. Revisa que el archivo de la quincena esté disponible.",

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
// VER RECIBO
// ======================================================

async function mostrarRecibo() {

    if (!paginaEncontrada) {

        alert(
            "Primero debes consultar un empleado."
        );

        return;

    }


    const periodo =
        PERIODOS[quincenaActual];


    visor.classList.remove(
        "oculto"
    );


    visorTitulo.textContent =
        "Recibo — " +
        periodo.nombre;


    visorFecha.textContent =
        periodo.mes;


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


        paginaPDFActual =
            pagina;


        // --------------------------------------
        // TAMAÑO
        // --------------------------------------

        const viewportBase =
            pagina.getViewport({

                scale:
                    1

            });


        const ancho =
            visorPDF.clientWidth ||
            900;


        const escala =
            Math.max(

                1,

                Math.min(
                    2,
                    ancho /
                    viewportBase.width
                )

            );


        const viewport =
            pagina.getViewport({

                scale:
                    escala

            });


        // --------------------------------------
        // CANVAS
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


        // --------------------------------------
        // MOSTRAR
        // --------------------------------------

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
// CERRAR VISOR
// ======================================================

function cerrarRecibo() {

    visor.classList.add(
        "oculto"
    );


    paginaPDFActual =
        null;


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

}


// ======================================================
// NUEVA CONSULTA
// ======================================================

function nuevaBusqueda() {

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

        radio => {

            radio.addEventListener(

                "change",

                function () {

                    codigoInput.value =
                        "";

                    mensaje.textContent =
                        "";

                    limpiarConsulta();


                    quincenaActual =
                        this.value;


                    actualizarInformacion();


                    codigoInput.focus();

                }

            );

        }

    );


// ======================================================
// BOTÓN CONSULTAR
// ======================================================

botonBuscar.addEventListener(

    "click",

    consultar

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

            consultar();

        }

    }

);


// ======================================================
// BOTÓN VER
// ======================================================

verRecibo.addEventListener(

    "click",

    mostrarRecibo

);


// ======================================================
// BOTÓN CERRAR
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

    nuevaBusqueda

);


// ======================================================
// INICIO
// ======================================================

actualizarMeses();

actualizarInformacion();


// ======================================================
// FIN
// ======================================================
