// ======================================================
// RECIBOS COA - VERSIÓN 2
// ======================================================

// PDF ACTUALES EN GITHUB
const PDFS = {
    q1: "recibos-q1.pdf.pdf",
    q2: "recibos-q2.pdf.pdf"
};


// ======================================================
// ELEMENTOS DE LA PÁGINA
// ======================================================

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


// ======================================================
// VARIABLES
// ======================================================

let empleadoActual = null;

let paginasEncontradas = {
    q1: null,
    q2: null
};


// ======================================================
// NORMALIZAR TEXTO
// ======================================================

function normalizarTexto(texto) {

    return texto
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9]/g, "");

}


// ======================================================
// MOSTRAR MENSAJE
// ======================================================

function mostrarMensaje(texto, tipo = "normal") {

    mensaje.textContent = texto;


    if (tipo === "error") {

        mensaje.style.color = "#c62828";

    } else {

        mensaje.style.color = "#08743b";

    }

}


// ======================================================
// BUSCAR CÓDIGO DENTRO DEL PDF
// ======================================================

async function buscarEnPDF(url, codigo) {

    console.log("Abriendo:", url);


    const pdf =
        await pdfjsLib
            .getDocument({
                url: url
            })
            .promise;


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
                .map(item => item.str)
                .join(" ");


        const textoNormalizado =
            normalizarTexto(texto);


        // --------------------------------------
        // BUSCAR EL CÓDIGO
        // --------------------------------------

        if (
            textoNormalizado.includes(
                codigoNormalizado
            )
        ) {


            console.log(
                "Código encontrado:",
                codigo,
                "Página:",
                paginaNumero
            );


            // ----------------------------------
            // EXTRAER NOMBRE
            // ----------------------------------

            const encontrado =
                texto.match(
                    /Empleado:\s*(.*?)\s+Sueldo Mensual/i
                );


            const nombre =
                encontrado
                    ? encontrado[1].trim()
                    : "Colaborador";


            return {

                pagina: paginaNumero,

                nombre: nombre

            };

        }


        // --------------------------------------
        // MOSTRAR PROGRESO
        // --------------------------------------

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


// ======================================================
// BUSCAR EMPLEADO
// ======================================================

async function buscarEmpleado() {


    const codigo =
        codigoInput.value
            .trim()
            .toUpperCase();


    // --------------------------------------
    // VALIDAR
    // --------------------------------------

    if (!codigo) {

        mostrarMensaje(
            "⚠️ Ingresa tu código de empleado.",
            "error"
        );

        return;

    }


    // --------------------------------------
    // ESTADO DE BÚSQUEDA
    // --------------------------------------

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


    mostrarMensaje(
        "🔎 Buscando en Quincena 1...",
        "normal"
    );


    try {


        // ==================================
        // BUSCAR QUINCENA 1
        // ==================================

        const q1 =
            await buscarEnPDF(
                PDFS.q1,
                codigo
            );


        // ==================================
        // BUSCAR QUINCENA 2
        // ==================================

        mostrarMensaje(
            "🔎 Buscando en Quincena 2...",
            "normal"
        );


        const q2 =
            await buscarEnPDF(
                PDFS.q2,
                codigo
            );


        // ==================================
        // NO ENCONTRADO
        // ==================================

        if (!q1 && !q2) {

            mostrarMensaje(
                "❌ No encontramos un recibo con ese código.",
                "error"
            );

            return;

        }


        // ==================================
        // GUARDAR PÁGINAS
        // ==================================

        paginasEncontradas.q1 =
            q1
                ? q1.pagina
                : null;


        paginasEncontradas.q2 =
            q2
                ? q2.pagina
                : null;


        // ==================================
        // GUARDAR EMPLEADO
        // ==================================

        empleadoActual = {

            codigo: codigo,

            nombre:
                q1
                    ? q1.nombre
                    : q2.nombre

        };


        // ==================================
        // MOSTRAR DATOS
        // ==================================

        nombreEmpleado.textContent =
            empleadoActual.nombre;


        codigoEmpleado.textContent =
            empleadoActual.codigo;


        resultado.classList.remove(
            "oculto"
        );


        mostrarMensaje(
            "✓ Empleado encontrado correctamente.",
            "normal"
        );


        resultado.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {


        console.error(
            "Error:",
            error
        );


        mostrarMensaje(
            "❌ No se pudo leer el PDF. Inténtalo nuevamente.",
            "error"
        );


    } finally {


        botonBuscar.disabled = false;

        botonBuscar.textContent =
            "Consultar";

    }

}


// ======================================================
// ABRIR SOLO LA PÁGINA DEL RECIBO
// ======================================================

async function abrirRecibo(quincena) {


    const pagina =
        paginasEncontradas[quincena];


    // --------------------------------------
    // VALIDAR PÁGINA
    // --------------------------------------

    if (!pagina) {

        alert(
            "Este empleado no tiene recibo disponible para esta quincena."
        );

        return;

    }


    // --------------------------------------
    // TÍTULO
    // --------------------------------------

    if (quincena === "q1") {

        visorTitulo.textContent =
            "Recibo — Quincena 1";

    } else {

        visorTitulo.textContent =
            "Recibo — Quincena 2";

    }


    // --------------------------------------
    // MOSTRAR CARGANDO
    // --------------------------------------

    const visorPDF =
        document.querySelector(
            ".visor-pdf"
        );


    visorPDF.innerHTML = `

        <div
            style="
                text-align:center;
                padding:50px;
                font-size:18px;
                color:#08743b;
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


        // ==================================
        // CARGAR PDF
        // ==================================

        const pdf =
            await pdfjsLib
                .getDocument(
                    PDFS[quincena]
                )
                .promise;


        // ==================================
        // OBTENER SOLO LA PÁGINA
        // ==================================

        const page =
            await pdf.getPage(
                pagina
            );


        // ==================================
        // ESCALA
        // ==================================

        const viewport =
            page.getViewport({
                scale: 1.6
            });


        // ==================================
        // CREAR CANVAS
        // ==================================

        const canvas =
            document.createElement(
                "canvas"
            );


        const contexto =
            canvas.getContext(
                "2d"
            );


        canvas.width =
            viewport.width;


        canvas.height =
            viewport.height;


        // ==================================
        // ESTILOS DEL RECIBO
        // ==================================

        canvas.style.display =
            "block";


        canvas.style.width =
            "100%";


        canvas.style.height =
            "auto";


        canvas.style.maxWidth =
            "100%";


        canvas.style.margin =
            "0 auto";


        canvas.style.background =
            "#ffffff";


        canvas.style.borderRadius =
            "12px";


        canvas.style.boxShadow =
            "0 5px 25px rgba(0,0,0,0.12)";


        // ==================================
        // LIMPIAR CONTENEDOR
        // ==================================

        visorPDF.innerHTML = "";


        // ==================================
        // AGREGAR CANVAS
        // ==================================

        visorPDF.appendChild(
            canvas
        );


        // ==================================
        // RENDERIZAR SOLO LA PÁGINA
        // ==================================

        await page.render({

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
// BOTONES DE QUINCENA
// ======================================================

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
    function(evento) {


        if (
            evento.key === "Enter"
        ) {

            buscarEmpleado();

        }


    }
);
