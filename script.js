// ======================================================
// COA - RECIBOS DE PAGO
// SCRIPT ESTABLE
// ======================================================


// ======================================================
// CONFIGURACIÓN DE LOS PDF
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

let pdfActual = null;


// ======================================================
// COMPROBAR QUE PDF.JS ESTÉ CARGADO
// ======================================================

function pdfJSDisponible() {

    return (
        typeof window.pdfjsLib !== "undefined"
    );

}


// ======================================================
// CONFIGURAR PDF.JS
// ======================================================

function configurarPDFJS() {

    if (!pdfJSDisponible()) {

        console.error(
            "PDF.js no está disponible."
        );

        return false;

    }


    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


    return true;

}


// ======================================================
// MOSTRAR MENSAJE
// ======================================================

function mostrarMensaje(
    texto,
    error = false
) {

    if (!mensaje) {
        return;
    }


    mensaje.textContent =
        texto;


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
// LIMPIAR RESULTADOS
// ======================================================

function limpiarResultados() {

    empleadoActual = null;

    paginaEncontrada = null;

    paginaActual = null;

    pdfActual = null;


    if (resultado) {

        resultado.classList.add(
            "oculto"
        );

        resultado.style.display =
            "none";

    }


    if (visor) {

        visor.classList.add(
            "oculto"
        );

        visor.style.display =
            "none";

    }


    if (nombreEmpleado) {

        nombreEmpleado.textContent =
            "—";

    }


    if (codigoEmpleado) {

        codigoEmpleado.textContent =
            "—";

    }


    if (visorPDF) {

        visorPDF.innerHTML = `

            <div class="visor-mensaje">

                Selecciona tu recibo para visualizarlo.

            </div>

        `;

    }

}


// ======================================================
// CARGAR PDF
// ======================================================

async function cargarPDF(
    archivo
) {

    if (!configurarPDFJS()) {

        throw new Error(
            "PDF.js no está cargado."
        );

    }


    console.log(
        "Intentando cargar:",
        archivo
    );


    const pdf =
        await pdfjsLib.getDocument({

            url: archivo,

            disableAutoFetch: false,

            disableStream: false

        }).promise;


    console.log(
        "PDF cargado correctamente:",
        archivo
    );


    console.log(
        "Número de páginas:",
        pdf.numPages
    );


    return pdf;

}


// ======================================================
// BUSCAR CÓDIGO EN PDF
// ======================================================

async function buscarEnPDF(
    archivo,
    codigo
) {

    const codigoBuscado =
        normalizarTexto(
            codigo
        );


    if (!codigoBuscado) {

        return null;

    }


    const pdf =
        await cargarPDF(
            archivo
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
            normalizarTexto(
                texto
            );


        console.log(
            "Revisando página:",
            numeroPagina
        );


        // ==================================================
        // COINCIDENCIA DEL CÓDIGO
        // ==================================================

        if (
            textoNormalizado.includes(
                codigoBuscado
            )
        ) {

            let nombre =
                "Colaborador";


            // ==================================================
            // INTENTAR OBTENER NOMBRE
            // ==================================================

            const encontrado =
                texto.match(
                    /Empleado\s*:\s*(.*?)\s+Sueldo\s+Mensual\s*:/i
                );


            if (encontrado) {

                nombre =
                    encontrado[1]
                        .trim();

            }


            // ==================================================
            // SEGUNDO MÉTODO PARA EL NOMBRE
            // ==================================================

            if (
                nombre === "Colaborador"
            ) {

                const encontrado2 =
                    texto.match(
                        /Empleado\s*:\s*(.+)/i
                    );


                if (encontrado2) {

                    nombre =
                        encontrado2[1]
                            .trim()
                            .split(
                                "Sueldo"
                            )[0]
                            .trim();

                }

            }


            console.log(
                "================================"
            );

            console.log(
                "CÓDIGO ENCONTRADO"
            );

            console.log(
                "Código:",
                codigo
            );

            console.log(
                "Nombre:",
                nombre
            );

            console.log(
                "Página:",
                numeroPagina
            );

            console.log(
                "================================"
            );


            return {

                pagina:
                    numeroPagina,

                nombre:
                    nombre

            };

        }


        // ==================================================
        // MOSTRAR AVANCE
        // ==================================================

        if (
            numeroPagina === 1 ||
            numeroPagina % 10 === 0
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

    console.log(
        "================================"
    );

    console.log(
        "BOTÓN CONSULTAR PRESIONADO"
    );

    console.log(
        "================================"
    );


    const codigo =
        codigoInput.value
            .trim()
            .toUpperCase();


    // ==================================================
    // VALIDAR CÓDIGO
    // ==================================================

    if (!codigo) {

        mostrarMensaje(
            "⚠️ Ingresa tu código de empleado.",
            true
        );

        codigoInput.focus();

        return;

    }


    // ==================================================
    // VALIDAR LONGITUD MÍNIMA
    // ==================================================

    if (
        codigo.length < 6
    ) {

        mostrarMensaje(

            "⚠️ Debes ingresar el código completo.",

            true

        );

        codigoInput.focus();

        return;

    }


    // ==================================================
    // QUINCENA
    // ==================================================

    quincenaSeleccionada =
        obtenerQuincena();


    const periodo =
        PERIODOS[
            quincenaSeleccionada
        ];


    if (!periodo) {

        mostrarMensaje(
            "❌ No se encontró la quincena seleccionada.",
            true
        );

        return;

    }


    // ==================================================
    // LIMPIAR RESULTADOS ANTERIORES
    // ==================================================

    empleadoActual = null;

    paginaEncontrada = null;

    paginaActual = null;


    if (resultado) {

        resultado.classList.add(
            "oculto"
        );

        resultado.style.display =
            "none";

    }


    if (visor) {

        visor.classList.add(
            "oculto"
        );

        visor.style.display =
            "none";

    }


    // ==================================================
    // DESACTIVAR BOTÓN
    // ==================================================

    botonBuscar.disabled =
        true;

    botonBuscar.textContent =
        "Buscando...";


    mostrarMensaje(

        "🔎 Buscando en " +
        periodo.nombre +
        "..."

    );


    try {

        // ==================================================
        // COMPROBAR PDF.JS
        // ==================================================

        if (
            !pdfJSDisponible()
        ) {

            throw new Error(
                "PDF.js no está cargado en la página."
            );

        }


        // ==================================================
        // BUSCAR
        // ==================================================

        const encontrado =
            await buscarEnPDF(

                periodo.archivo,

                codigo

            );


        // ==================================================
        // NO ENCONTRADO
        // ==================================================

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


        // ==================================================
        // GUARDAR DATOS
        // ==================================================

        paginaEncontrada =
            encontrado.pagina;


        empleadoActual = {

            codigo:
                codigo,

            nombre:
                encontrado.nombre

        };


        // ==================================================
        // MOSTRAR NOMBRE
        // ==================================================

        if (nombreEmpleado) {

            nombreEmpleado.textContent =
                empleadoActual.nombre;

        }


        // ==================================================
        // MOSTRAR CÓDIGO
        // ==================================================

        if (codigoEmpleado) {

            codigoEmpleado.textContent =
                empleadoActual.codigo;

        }


        // ==================================================
        // MOSTRAR QUINCENA
        // ==================================================

        if (textoQuincena) {

            textoQuincena.textContent =
                (
                    periodo.nombre +
                    " · " +
                    periodo.mes
                ).toUpperCase();

        }


        if (periodoSeleccionado) {

            periodoSeleccionado.textContent =
                (
                    periodo.nombre +
                    " · " +
                    periodo.mes
                ).toUpperCase();

        }


        // ==================================================
        // MOSTRAR TARJETA
        // ==================================================

        resultado.classList.remove(
            "oculto"
        );

        resultado.style.display =
            "block";


        mostrarMensaje(
            "✓ Colaborador encontrado correctamente."
        );


        // ==================================================
        // IR A LA TARJETA
        // ==================================================

        resultado.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });


    } catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "ERROR EN LA CONSULTA"
        );

        console.error(
            error
        );

        console.error(
            "================================"
        );


        mostrarMensaje(

            "❌ No se pudo realizar la consulta. Revisa la consola para ver el error.",

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

    if (
        !empleadoActual ||
        !paginaEncontrada
    ) {

        alert(
            "Primero debes consultar un empleado."
        );

        return;

    }


    const periodo =
        PERIODOS[
            quincenaSeleccionada
        ];


    // ==================================================
    // MOSTRAR VISOR
    // ==================================================

    visor.classList.remove(
        "oculto"
    );

    visor.style.display =
        "block";


    // ==================================================
    // OCULTAR TARJETA
    // ==================================================

    resultado.classList.add(
        "oculto"
    );

    resultado.style.display =
        "none";


    visorTitulo.textContent =
        periodo.nombre +
        " · " +
        periodo.mes;


    visorPDF.innerHTML = `

        <div
            class="visor-mensaje"
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


        pdfActual =
            pdf;


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
                class="visor-mensaje"
                style="color:#c62828;"
            >

                ❌ No se pudo mostrar el recibo.

            </div>

        `;

    }

}


// ======================================================
// CERRAR RECIBO
// ======================================================

function cerrarRecibo() {

    visor.classList.add(
        "oculto"
    );

    visor.style.display =
        "none";


    paginaActual =
        null;


    pdfActual =
        null;


    // ==================================================
    // VOLVER A MOSTRAR TARJETA
    // ==================================================

    if (empleadoActual) {

        resultado.classList.remove(
            "oculto"
        );

        resultado.style.display =
            "block";

    }


    visorPDF.innerHTML = `

        <div
            class="visor-mensaje"
        >

            Selecciona tu recibo para visualizarlo.

        </div>

    `;

}


// ======================================================
// NUEVA CONSULTA
// ======================================================

function iniciarNuevaConsulta() {

    codigoInput.value =
        "";


    mostrarMensaje(
        ""
    );


    limpiarResultados();


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


                    codigoInput.value =
                        "";


                    mostrarMensaje(
                        ""
                    );


                    limpiarResultados();

                }

            );

        }

    );


// ======================================================
// BOTÓN BUSCAR
// ======================================================

if (
    botonBuscar
) {

    botonBuscar.addEventListener(

        "click",

        function() {

            consultarEmpleado();

        }

    );

}


// ======================================================
// ENTER EN EL CAMPO
// ======================================================

if (
    codigoInput
) {

    codigoInput.addEventListener(

        "keydown",

        function(evento) {

            if (
                evento.key === "Enter"
            ) {

                evento.preventDefault();

                consultarEmpleado();

            }

        }

    );

}


// ======================================================
// VER RECIBO
// ======================================================

if (
    verRecibo
) {

    verRecibo.addEventListener(

        "click",

        mostrarRecibo

    );

}


// ======================================================
// CERRAR VISOR
// ======================================================

if (
    cerrarVisor
) {

    cerrarVisor.addEventListener(

        "click",

        cerrarRecibo

    );

}


// ======================================================
// NUEVA CONSULTA
// ======================================================

if (
    nuevaConsulta
) {

    nuevaConsulta.addEventListener(

        "click",

        iniciarNuevaConsulta

    );

}


// ======================================================
// INICIO
// ======================================================

console.log(
    "======================================"
);

console.log(
    "COA - RECIBOS DE PAGO"
);

console.log(
    "SCRIPT CARGADO CORRECTAMENTE"
);

console.log(
    "PDF.JS disponible:",
    pdfJSDisponible()
);

console.log(
    "======================================"
);


if (
    !pdfJSDisponible()
) {

    mostrarMensaje(

        "⚠️ El visor de PDF no terminó de cargar. Recarga la página.",

        true

    );

}
