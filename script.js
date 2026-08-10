// ==========================================
// RECIBOS COA - VERSIÓN 2
// ==========================================

const PDFS = {
    q1: "recibos-q1.pdf.pdf",
    q2: "recibos-q2.pdf.pdf"
};


// ==========================================
// ELEMENTOS
// ==========================================

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


// ==========================================
// VARIABLES
// ==========================================

let empleadoActual = null;

let paginasEncontradas = {
    q1: null,
    q2: null
};


// ==========================================
// NORMALIZAR TEXTO
// ==========================================

function normalizarTexto(texto) {

    return texto
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9]/g, "");

}


// ==========================================
// MENSAJES
// ==========================================

function mostrarMensaje(texto, tipo) {

    mensaje.textContent = texto;

    if (tipo === "error") {

        mensaje.style.color = "#c62828";

    } else {

        mensaje.style.color = "#08743b";

    }

}


// ==========================================
// BUSCAR EN PDF
// ==========================================

async function buscarEnPDF(url, codigo) {

    console.log("Abriendo PDF:", url);

    const pdf =
        await pdfjsLib
            .getDocument({
                url: url,
                disableAutoFetch: false,
                disableStream: false
            })
            .promise;


    console.log(
        "PDF cargado. Páginas:",
        pdf.numPages
    );


    const codigoNormalizado =
        normalizarTexto(codigo);


    for (
        let paginaNumero = 1;
        paginaNumero <= pdf.numPages;
        paginaNumero++
    ) {

        const pagina =
            await pdf.getPage(paginaNumero);


        const contenido =
            await pagina.getTextContent();


        const texto =
            contenido.items
                .map(item => item.str)
                .join(" ");


        const textoNormalizado =
            normalizarTexto(texto);


        // ==================================
        // COMPROBAR CÓDIGO
        // ==================================

        if (
            textoNormalizado.includes(
                codigoNormalizado
            )
        ) {

            console.log(
                "ENCONTRADO:",
                codigo,
                "Página:",
                paginaNumero
            );


            // ==============================
            // OBTENER NOMBRE
            // ==============================

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


        // Mostrar progreso cada 25 páginas

        if (paginaNumero % 25 === 0) {

            console.log(
                "Revisadas",
                paginaNumero,
                "páginas de",
                pdf.numPages
            );

        }

    }


    return null;

}


// ==========================================
// BUSCAR EMPLEADO
// ==========================================

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


    botonBuscar.disabled = true;

    botonBuscar.textContent =
        "Buscando...";


    mostrarMensaje(
        "🔎 Buscando tu recibo...",
        "exito"
    );


    resultado.classList.add("oculto");

    paginasEncontradas = {
        q1: null,
        q2: null
    };


    try {

        // ==================================
        // QUINCENA 1
        // ==================================

        mostrarMensaje(
            "🔎 Revisando Quincena 1...",
            "exito"
        );


        const q1 =
            await buscarEnPDF(
                PDFS.q1,
                codigo
            );


        // ==================================
        // QUINCENA 2
        // ==================================

        mostrarMensaje(
            "🔎 Revisando Quincena 2...",
            "exito"
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
        // DATOS EMPLEADO
        // ==================================

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


        // ==================================
        // MOSTRAR RESULTADO
        // ==================================

        resultado.classList.remove(
            "oculto"
        );


        mostrarMensaje(
            "✓ Empleado encontrado correctamente.",
            "exito"
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
            "❌ Ocurrió un error al leer los PDF.",
            "error"
        );

    } finally {

        botonBuscar.disabled = false;

        botonBuscar.textContent =
            "Consultar";

    }

}


// ==========================================
// ABRIR RECIBO
// ==========================================

function abrirRecibo(quincena) {

    const pagina =
        paginasEncontradas[quincena];


    if (!pagina) {

        alert(
            "Este empleado no tiene recibo disponible para esta quincena."
        );

        return;

    }


    // ==================================
    // TÍTULO
    // ==================================

    if (quincena === "q1") {

        visorTitulo.textContent =
            "Recibo — Quincena 1";

    } else {

        visorTitulo.textContent =
            "Recibo — Quincena 2";

    }


    // ==================================
    // PDF
    // ==================================

    const visorPDF =
        document.querySelector(
            ".visor-pdf"
        );


    visorPDF.innerHTML = `

        <iframe
            src="${PDFS[quincena]}#page=${pagina}"
            style="
                width:100%;
                height:700px;
                border:none;
                border-radius:12px;
                background:white;
            "
            title="Recibo de pago"
        ></iframe>

    `;


    visor.classList.remove(
        "oculto"
    );


    visor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// BOTONES QUINCENA
// ==========================================

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


                if (quincena === "1") {

                    abrirRecibo("q1");

                } else {

                    abrirRecibo("q2");

                }

            }
        );

    }
);


// ==========================================
// CERRAR VISOR
// ==========================================

cerrarVisor.addEventListener(
    "click",
    function () {

        visor.classList.add(
            "oculto"
        );

    }
);


// ==========================================
// NUEVA CONSULTA
// ==========================================

nuevaConsulta.addEventListener(
    "click",
    function () {

        codigoInput.value = "";

        mensaje.textContent = "";

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


        empleadoActual = null;


        codigoInput.focus();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// ==========================================
// BOTÓN CONSULTAR
// ==========================================

botonBuscar.addEventListener(
    "click",
    buscarEmpleado
);


// ==========================================
// ENTER
// ==========================================

codigoInput.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Enter") {

            buscarEmpleado();

        }

    }
);
