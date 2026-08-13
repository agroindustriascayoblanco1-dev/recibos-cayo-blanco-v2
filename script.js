// ======================================================
// COA - PORTAL DE PERSONAL
// AGROINDUSTRIAS CAYO BLANCO
// ======================================================


// ======================================================
// CONFIGURACIÓN SUPABASE
// ======================================================

// IMPORTANTE:
// Reemplaza únicamente SUPABASE_URL por la URL de TU proyecto.
//
// Ejemplo:
// const SUPABASE_URL = "https://bbvposlhygsuijyuchxo.supabase.co";

const SUPABASE_URL = "PON_AQUI_TU_URL_DE_SUPABASE";

const SUPABASE_ANON_KEY =
    "sb_publishable_tB9XmIiq7uSW195GfJEzFg_KQbJGlzV";


// ======================================================
// CONFIGURACIÓN DE RECIBOS
// ======================================================

const PERIODOS = {

    q1: {
        nombre: "Quincena 1",
        mes: "Julio 2026",
        periodoPago:
            "11 de Junio al 25 de Junio de 2026",
        archivo:
            "RECIBOS QUINCENA 1.pdf"
    },

    q2: {
        nombre: "Quincena 2",
        mes: "Julio 2026",
        periodoPago:
            "26 de Junio al 10 de julio de 2026",
        archivo:
            "RECIBOS QUINCENA 2.pdf"
    }

};


// ======================================================
// VARIABLES
// ======================================================

let empleadoActual = null;
let paginaEncontrada = null;
let pdfActual = null;
let paginaActual = null;
let quincenaSeleccionada = "q1";

let audioContextCOA = null;


// ======================================================
// ACTUALIZAR SELECTOR DE QUINCENAS
// ======================================================

function actualizarSelectorQuincenas() {

    const q1 = PERIODOS.q1;
    const q2 = PERIODOS.q2;

    const nombreQ1 =
        document.getElementById("nombreQ1");

    const mesQ1 =
        document.getElementById("mesQ1");

    const nombreQ2 =
        document.getElementById("nombreQ2");

    const mesQ2 =
        document.getElementById("mesQ2");


    if (nombreQ1) {
        nombreQ1.textContent = q1.nombre;
    }

    if (mesQ1) {
        mesQ1.textContent = q1.mes;
    }

    if (nombreQ2) {
        nombreQ2.textContent = q2.nombre;
    }

    if (mesQ2) {
        mesQ2.textContent = q2.mes;
    }

}


// ======================================================
// INICIO
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarSistema
);


function iniciarSistema() {

    actualizarSelectorQuincenas();

    console.log(
        "COA: sistema iniciado"
    );


    // --------------------------------------------------
    // CONFIGURAR PDF.JS
    // --------------------------------------------------

    if (typeof pdfjsLib === "undefined") {

        console.error(
            "PDF.js no está cargado."
        );

        prepararAudio();
        reproducirSonidoError();

        mostrarMensaje(
            "❌ No se pudo cargar el sistema de recibos.",
            true
        );

        return;
    }


    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


    // --------------------------------------------------
    // BOTÓN BUSCAR
    // --------------------------------------------------

    const boton =
        document.getElementById("buscar");

    if (boton) {

        boton.addEventListener(
            "click",
            validarCodigoAcceso
        );

    }


    // --------------------------------------------------
    // ENTER
    // --------------------------------------------------

    const codigo =
        document.getElementById("codigo");

    if (codigo) {

        codigo.addEventListener(
            "keydown",
            function(evento) {

                if (evento.key === "Enter") {

                    evento.preventDefault();

                    validarCodigoAcceso();

                }

            }
        );

    }


    // --------------------------------------------------
    // QUINCENAS ANTIGUAS SI EXISTEN
    // --------------------------------------------------

    document
        .querySelectorAll(
            'input[name="quincena"]'
        )
        .forEach(
            function(radio) {

                radio.addEventListener(
                    "change",
                    cambiarQuincena
                );

            }
        );


    // --------------------------------------------------
    // BOTÓN VER RECIBO ANTIGUO
    // --------------------------------------------------

    const ver =
        document.getElementById("verRecibo");

    if (ver) {

        ver.addEventListener(
            "click",
            mostrarRecibo
        );

    }


    // --------------------------------------------------
    // CERRAR VISOR
    // --------------------------------------------------

    const cerrar =
        document.getElementById("cerrarVisor");

    if (cerrar) {

        cerrar.addEventListener(
            "click",
            cerrarRecibo
        );

    }


    // --------------------------------------------------
    // NUEVA CONSULTA
    // --------------------------------------------------

    const nueva =
        document.getElementById("nuevaConsulta");

    if (nueva) {

        nueva.addEventListener(
            "click",
            nuevaConsulta
        );

    }


    // --------------------------------------------------
    // CARNET
    // --------------------------------------------------

    const carnetPanel =
        document.getElementById("abrirCarnet");

    if (carnetPanel) {

        carnetPanel.addEventListener(
            "click",
            abrirCarnetDesdePanel
        );

    }


    // --------------------------------------------------
    // QUINCENA 1
    // --------------------------------------------------

    const q1Panel =
        document.getElementById("verQ1");

    if (q1Panel) {

        q1Panel.addEventListener(
            "click",
            function() {

                consultarQuincenaDesdePanel("q1");

            }
        );

    }


    // --------------------------------------------------
    // QUINCENA 2
    // --------------------------------------------------

    const q2Panel =
        document.getElementById("verQ2");

    if (q2Panel) {

        q2Panel.addEventListener(
            "click",
            function() {

                consultarQuincenaDesdePanel("q2");

            }
        );

    }


    // --------------------------------------------------
    // GUARDAR
    // --------------------------------------------------

    const guardar =
        document.getElementById("guardarRecibo");

    if (guardar) {

        guardar.addEventListener(
            "click",
            guardarPDF
        );

    }


    // --------------------------------------------------
    // MODALES DEL CENTRO
    // --------------------------------------------------

    iniciarCentroInformacion();


    console.log(
        "COA: eventos configurados correctamente"
    );

}


// ======================================================
// MENSAJES
// ======================================================

function mostrarMensaje(
    texto,
    error = false
) {

    const elemento =
        document.getElementById("mensaje");

    if (!elemento) {
        return;
    }

    elemento.textContent =
        texto;

    elemento.style.color =
        error
            ? "#c62828"
            : "#087a3f";

}


// ======================================================
// NORMALIZAR
// ======================================================

function normalizar(texto) {

    return String(
        texto || ""
    )
        .toUpperCase()
        .replace(
            /\s+/g,
            ""
        )
        .replace(
            /[^A-Z0-9]/g,
            ""
        );

}


// ======================================================
// CAMBIAR QUINCENA
// ======================================================

function cambiarQuincena() {

    const seleccion =
        document.querySelector(
            'input[name="quincena"]:checked'
        );

    quincenaSeleccionada =
        seleccion
            ? seleccion.value
            : "q1";

    limpiarConsulta();

    mostrarMensaje("");

}


// ======================================================
// CONSULTAR EMPLEADO EN SUPABASE
// ======================================================

async function consultarEmpleadoSupabase(codigo) {

    if (
        !SUPABASE_URL ||
        SUPABASE_URL.includes(
            "PON_AQUI"
        )
    ) {

        throw new Error(
            "Falta configurar SUPABASE_URL."
        );

    }


    const respuesta =
        await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/consultar_empleado`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "apikey":
                        SUPABASE_ANON_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_ANON_KEY}`

                },

                body: JSON.stringify({

                    p_codigo:
                        codigo

                })

            }
        );


    if (!respuesta.ok) {

        let detalle =
            "";

        try {

            const error =
                await respuesta.json();

            detalle =
                error.message ||
                error.details ||
                error.hint ||
                "";

        } catch (error) {

            console.warn(
                "No se pudo leer el error de Supabase.",
                error
            );

        }


        throw new Error(
            detalle ||
            "Supabase rechazó la consulta."
        );

    }


    const datos =
        await respuesta.json();


    console.log(
        "Respuesta de Supabase:",
        datos
    );


    return datos;

}


// ======================================================
// VALIDAR CÓDIGO
// ======================================================

async function validarCodigoAcceso() {

    prepararAudio();


    const input =
        document.getElementById("codigo");

    const boton =
        document.getElementById("buscar");


    if (!input) {
        return;
    }


    const codigo =
        input.value
            .trim()
            .toUpperCase();


    input.value =
        codigo;


    // --------------------------------------------------
    // VALIDACIÓN VACÍA
    // --------------------------------------------------

    if (!codigo) {

        reproducirSonidoError();

        mostrarMensaje(
            "⚠️ Escribe tu código completo.",
            true
        );

        input.focus();

        return;

    }


    // --------------------------------------------------
    // VALIDACIÓN FORMATO
    // --------------------------------------------------

    if (!/^CBEP\d{4}$/.test(codigo)) {

        reproducirSonidoError();

        mostrarMensaje(
            "⚠️ Ingresa tu código completo. Ejemplo: CBEP0000.",
            true
        );

        input.focus();

        return;

    }


    // --------------------------------------------------
    // BOTÓN
    // --------------------------------------------------

    if (boton) {

        boton.disabled =
            true;

        boton.textContent =
            "Consultando...";

    }


    mostrarMensaje(
        "🔎 Verificando código..."
    );


    try {

        // ------------------------------------------------
        // CONSULTAR SUPABASE
        // ------------------------------------------------

        const datos =
            await consultarEmpleadoSupabase(
                codigo
            );


        // ------------------------------------------------
        // EMPLEADO NO ENCONTRADO
        // ------------------------------------------------

        if (!datos) {

            reproducirSonidoError();

            mostrarMensaje(
                "⚠️ No se encontró un colaborador con ese código.",
                true
            );

            input.focus();

            return;

        }


        // ------------------------------------------------
        // GUARDAR EMPLEADO ACTUAL
        // ------------------------------------------------

        empleadoActual = {

            codigo:
                datos.code ||
                codigo,

            nombre:
                datos.name ||
                "",

            identidad:
                datos.identity ||
                datos.identidad ||
                "",

            puesto:
                datos.position ||
                datos.puesto ||
                "",

            departamento:
                datos.department ||
                datos.departamento ||
                "",

            division:
                datos.division ||
                "",

            sexo:
                datos.sex ||
                "",

            periodo:
                "",

            mes:
                "",

            archivo:
                ""

        };


        console.log(
            "Empleado autorizado:",
            empleadoActual
        );


        // ------------------------------------------------
        // MOSTRAR DATOS
        // ------------------------------------------------

        const nombreElemento =
            document.getElementById(
                "nombreEmpleado"
            );

        const codigoElemento =
            document.getElementById(
                "codigoEmpleado"
            );


        if (nombreElemento) {

            nombreElemento.textContent =
                empleadoActual.nombre ||
                "—";

        }


        if (codigoElemento) {

            codigoElemento.textContent =
                empleadoActual.codigo ||
                codigo;

        }


        // ------------------------------------------------
        // MOSTRAR PANEL
        // ------------------------------------------------

        const resultado =
            document.getElementById(
                "resultado"
            );


        if (resultado) {

            resultado.classList.remove(
                "oculto"
            );

        }


        mostrarMensaje(
            "✓ Acceso autorizado."
        );


        reproducirSonidoEncontrado();


        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "Continuar";

        }


        if (resultado) {

            resultado.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "start"
            });

        }


    } catch (error) {

        console.error(
            "Error consultando Supabase:",
            error
        );


        reproducirSonidoError();


        mostrarMensaje(
            "❌ No fue posible verificar tu código. Inténtalo nuevamente.",
            true
        );


    } finally {

        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "Continuar";

        }

    }

}


// ======================================================
// CONSULTAR QUINCENA DESDE PANEL
// ======================================================

function consultarQuincenaDesdePanel(
    quincena
) {

    if (
        !empleadoActual ||
        !empleadoActual.codigo
    ) {

        mostrarMensaje(
            "⚠️ Primero ingresa tu código de empleado.",
            true
        );

        return;

    }


    quincenaSeleccionada =
        quincena;


    consultarEmpleado();

}


// ======================================================
// CARNET
// ======================================================

function abrirCarnetDesdePanel() {

    if (
        !empleadoActual ||
        !empleadoActual.codigo
    ) {

        mostrarMensaje(
            "⚠️ Primero ingresa tu código de empleado.",
            true
        );

        return;

    }


    const modal =
        document.getElementById(
            "modalCarnet"
        );

    const resultado =
        document.getElementById(
            "carnetResultado"
        );

    const mensaje =
        document.getElementById(
            "carnetMensaje"
        );


    if (!modal || !resultado) {

        mostrarMensaje(
            "⚠️ No se pudo cargar el carnet del colaborador.",
            true
        );

        return;

    }


    // --------------------------------------------------
    // NOMBRE
    // --------------------------------------------------

    document.getElementById(
        "carnetNombre"
    ).textContent =
        empleadoActual.nombre ||
        "—";


    // --------------------------------------------------
    // CÓDIGO
    // --------------------------------------------------

    document.getElementById(
        "carnetCodigo"
    ).textContent =
        empleadoActual.codigo ||
        "—";


    // --------------------------------------------------
    // IDENTIDAD
    // --------------------------------------------------

    document.getElementById(
        "carnetIdentidad"
    ).textContent =
        empleadoActual.identidad ||
        "—";


    // --------------------------------------------------
    // PUESTO
    // --------------------------------------------------

    document.getElementById(
        "carnetPuesto"
    ).textContent =
        empleadoActual.puesto ||
        "—";


    // --------------------------------------------------
    // DEPARTAMENTO
    // --------------------------------------------------

    document.getElementById(
        "carnetDepartamento"
    ).textContent =
        empleadoActual.departamento ||
        "—";


    // --------------------------------------------------
    // DIVISIÓN
    // --------------------------------------------------

    document.getElementById(
        "carnetDivision"
    ).textContent =
        empleadoActual.division ||
        "—";


    if (mensaje) {

        mensaje.textContent =
            "";

    }


    resultado.classList.remove(
        "oculto"
    );

    modal.classList.remove(
        "oculto"
    );

    document.body.classList.add(
        "centro-modal-abierto"
    );

}


// ======================================================
// CERRAR CARNET
// ======================================================

document.addEventListener(
    "click",
    function(evento) {

        const boton =
            evento.target.closest(
                "[data-cerrar-modal]"
            );


        if (!boton) {
            return;
        }


        const modal =
            boton.closest(
                ".modal"
            );


        if (modal) {

            modal.classList.add(
                "oculto"
            );

        }


        document.body.classList.remove(
            "centro-modal-abierto"
        );

    }
);


// ======================================================
// CERRAR CARNET AL TOCAR FONDO
// ======================================================

document.addEventListener(
    "click",
    function(evento) {

        const modal =
            document.getElementById(
                "modalCarnet"
            );


        if (
            modal &&
            evento.target === modal
        ) {

            modal.classList.add(
                "oculto"
            );

            document.body.classList.remove(
                "centro-modal-abierto"
            );

        }

    }
);


// ======================================================
// LIMPIAR CONSULTA
// ======================================================

function limpiarConsulta() {

    empleadoActual =
        null;

    paginaEncontrada =
        null;

    pdfActual =
        null;

    paginaActual =
        null;


    const resultado =
        document.getElementById(
            "resultado"
        );

    const visor =
        document.getElementById(
            "visor"
        );


    if (resultado) {

        resultado.classList.add(
            "oculto"
        );

    }


    if (visor) {

        visor.classList.add(
            "oculto"
        );

    }

}


// ======================================================
// OBTENER PDF
// ======================================================

async function obtenerPDF(
    archivo
) {

    console.log(
        "Cargando PDF:",
        archivo
    );


    const pdf =
        await pdfjsLib.getDocument({
            url: archivo
        }).promise;


    console.log(
        "PDF cargado:",
        pdf.numPages,
        "páginas"
    );


    return pdf;

}


// ======================================================
// CONSULTAR RECIBO
// ======================================================

async function consultarEmpleado() {

    prepararAudio();


    const codigoInput =
        document.getElementById(
            "codigo"
        );

    const boton =
        document.getElementById(
            "buscar"
        );


    if (!codigoInput) {
        return;
    }


    let codigo =
        codigoInput.value
            .trim()
            .toUpperCase();


    if (
        empleadoActual &&
        empleadoActual.codigo
    ) {

        codigo =
            empleadoActual.codigo;

    }


    if (!codigo) {

        reproducirSonidoError();

        mostrarMensaje(
            "⚠️ Escribe tu código completo.",
            true
        );

        return;

    }


    if (!/^CBEP\d{4}$/.test(codigo)) {

        reproducirSonidoError();

        mostrarMensaje(
            "⚠️ Ingresa tu código completo. Ejemplo: CBEP0000.",
            true
        );

        return;

    }


    const periodo =
        PERIODOS[
            quincenaSeleccionada
        ];


    if (!periodo) {

        reproducirSonidoError();

        mostrarMensaje(
            "⚠️ No se encontró la quincena.",
            true
        );

        return;

    }


    if (boton) {

        boton.disabled =
            true;

        boton.textContent =
            "Buscando...";

    }


    mostrarMensaje(
        "🔎 Buscando en " +
        periodo.nombre +
        "..."
    );


    try {

        // ------------------------------------------------
        // CARGAR PDF
        // ------------------------------------------------

        const pdf =
            await obtenerPDF(
                periodo.archivo
            );


        // ------------------------------------------------
        // CÓDIGO
        // ------------------------------------------------

        const codigoBuscado =
            normalizar(
                codigo
            );


        let encontrado =
            null;


        // ------------------------------------------------
        // RECORRER PÁGINAS
        // ------------------------------------------------

        for (
            let numero = 1;
            numero <= pdf.numPages;
            numero++
        ) {

            mostrarMensaje(
                "🔎 Revisando página " +
                numero +
                " de " +
                pdf.numPages +
                "..."
            );


            const pagina =
                await pdf.getPage(
                    numero
                );


            const contenido =
                await pagina.getTextContent();


            const texto =
                contenido.items
                    .map(
                        function(item) {

                            return (
                                item.str ||
                                ""
                            );

                        }
                    )
                    .join(" ");


            const codigosEnPagina =
                texto.match(
                    /CBEP\s*([0-9]{4})/gi
                ) || [];


            const coincidenciaExacta =
                codigosEnPagina.some(
                    function(codigoPDF) {

                        return (
                            normalizar(
                                codigoPDF
                            ) ===
                            codigoBuscado
                        );

                    }
                );


            if (coincidenciaExacta) {

                encontrado = {

                    pagina:
                        numero,

                    texto:
                        texto

                };

                break;

            }

        }


        // ------------------------------------------------
        // NO ENCONTRADO
        // ------------------------------------------------

        if (!encontrado) {

            reproducirSonidoError();

            mostrarMensaje(
                "⚠️ El código " +
                codigo +
                " no fue encontrado en " +
                periodo.nombre +
                ".",
                true
            );

            return;

        }


        // ------------------------------------------------
        // NOMBRE DEL RECIBO
        // ------------------------------------------------

        let nombre =
            empleadoActual &&
            empleadoActual.nombre
                ? empleadoActual.nombre
                : obtenerNombre(
                    encontrado.texto
                );


        // ------------------------------------------------
        // GUARDAR DATOS
        // ------------------------------------------------

        empleadoActual = {

            ...empleadoActual,

            codigo:
                codigo,

            nombre:
                nombre,

            periodo:
                periodo.nombre,

            mes:
                periodo.mes,

            archivo:
                periodo.archivo

        };


        paginaEncontrada =
            encontrado.pagina;

        pdfActual =
            pdf;


        // ------------------------------------------------
        // MOSTRAR DATOS
        // ------------------------------------------------

        const nombreEmpleado =
            document.getElementById(
                "nombreEmpleado"
            );


        const codigoEmpleado =
            document.getElementById(
                "codigoEmpleado"
            );


        if (nombreEmpleado) {

            nombreEmpleado.textContent =
                nombre;

        }


        if (codigoEmpleado) {

            codigoEmpleado.textContent =
                codigo;

        }


        const textoQuincenaElemento =
            document.getElementById(
                "textoQuincena"
            );


        if (textoQuincenaElemento) {

            textoQuincenaElemento.textContent =
                (
                    periodo.nombre +
                    " · " +
                    periodo.mes
                ).toUpperCase();

        }


        const periodoSeleccionadoElemento =
            document.getElementById(
                "periodoSeleccionado"
            );


        if (periodoSeleccionadoElemento) {

            periodoSeleccionadoElemento.textContent =
                (
                    periodo.nombre +
                    " · " +
                    periodo.mes
                ).toUpperCase();

        }


        const periodoPagoElemento =
            document.getElementById(
                "periodoPago"
            );


        if (periodoPagoElemento) {

            periodoPagoElemento.textContent =
                periodo.periodoPago ||
                "";

        }


        const resultado =
            document.getElementById(
                "resultado"
            );


        if (resultado) {

            resultado.classList.remove(
                "oculto"
            );

        }


        mostrarMensaje(
            "✓ Colaborador encontrado correctamente."
        );


        reproducirSonidoEncontrado();


        // ------------------------------------------------
        // MOSTRAR RECIBO
        // ------------------------------------------------

        mostrarRecibo();


    } catch (error) {

        console.error(
            "ERROR:",
            error
        );


        reproducirSonidoError();

        mostrarMensaje(
            "❌ No se pudo cargar el recibo. Verifica que el PDF esté disponible.",
            true
        );


    } finally {

        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "Continuar";

        }

    }

}


// ======================================================
// OBTENER NOMBRE DEL PDF
// ======================================================

function obtenerNombre(
    texto
) {

    const resultado1 =
        texto.match(
            /Empleado\s*:\s*(.*?)\s+Sueldo\s+Mensual/i
        );


    if (
        resultado1 &&
        resultado1[1]
    ) {

        return resultado1[1]
            .trim();

    }


    const resultado2 =
        texto.match(
            /Empleado\s*:\s*(.*)/i
        );


    if (
        resultado2 &&
        resultado2[1]
    ) {

        return resultado2[1]
            .split(
                "Sueldo"
            )[0]
            .trim();

    }


    return "Colaborador";

}


// ======================================================
// MOSTRAR RECIBO
// ======================================================

async function mostrarRecibo() {

    if (
        !empleadoActual ||
        !paginaEncontrada ||
        !pdfActual
    ) {

        return;

    }


    const visor =
        document.getElementById(
            "visor"
        );

    const resultado =
        document.getElementById(
            "resultado"
        );

    const titulo =
        document.getElementById(
            "visorTitulo"
        );

    const visorPDF =
        document.querySelector(
            ".visor-pdf"
        );


    if (!visor || !visorPDF) {
        return;
    }


    visor.classList.remove(
        "oculto"
    );


    if (resultado) {

        resultado.classList.add(
            "oculto"
        );

    }


    if (titulo) {

        titulo.textContent =
            empleadoActual.periodo +
            " · " +
            empleadoActual.mes;

    }


    visorPDF.innerHTML = `

        <div class="visor-mensaje">

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

        const pagina =
            await pdfActual.getPage(
                paginaEncontrada
            );


        paginaActual =
            pagina;


        const viewportBase =
            pagina.getViewport({
                scale:
                    1
            });


        const ancho =
            visorPDF.clientWidth ||
            900;


        const escala =
            Math.min(
                2,
                Math.max(
                    1,
                    ancho /
                    viewportBase.width
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
            viewport.width;


        canvas.height =
            viewport.height;


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
            "Error mostrando PDF:",
            error
        );


        reproducirSonidoError();


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

    const visor =
        document.getElementById(
            "visor"
        );

    const resultado =
        document.getElementById(
            "resultado"
        );


    if (visor) {

        visor.classList.add(
            "oculto"
        );

    }


    if (
        resultado &&
        empleadoActual
    ) {

        resultado.classList.remove(
            "oculto"
        );

    }


    paginaActual =
        null;

}


// ======================================================
// NUEVA CONSULTA
// ======================================================

function nuevaConsulta() {

    const codigo =
        document.getElementById(
            "codigo"
        );


    limpiarConsulta();


    if (codigo) {

        codigo.value =
            "";

    }


    mostrarMensaje("");


    if (codigo) {

        codigo.focus();

    }


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}


// ======================================================
// GUARDAR RECIBO
// ======================================================

async function guardarPDF() {

    if (!paginaActual) {

        alert(
            "Primero abre el recibo."
        );

        return;

    }


    if (!window.jspdf) {

        alert(
            "No se pudo cargar la función para guardar el PDF."
        );

        return;

    }


    const boton =
        document.getElementById(
            "guardarRecibo"
        );


    try {

        if (boton) {

            boton.disabled =
                true;

            boton.textContent =
                "Guardando...";

        }


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
            viewport.width;


        canvas.height =
            viewport.height;


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


        const {
            jsPDF
        } =
            window.jspdf;


        const pdf =
            new jsPDF({

                orientation:
                    viewport.width >
                    viewport.height
                        ? "landscape"
                        : "portrait",

                unit:
                    "mm",

                format:
                    "a4"

            });


        const anchoPagina =
            pdf.internal.pageSize.getWidth();


        const altoPagina =
            pdf.internal.pageSize.getHeight();


        const margen =
            8;


        const anchoDisponible =
            anchoPagina -
            margen * 2;


        const altoDisponible =
            altoPagina -
            margen * 2;


        const escala =
            Math.min(

                anchoDisponible /
                viewport.width,

                altoDisponible /
                viewport.height

            );


        const anchoImagen =
            viewport.width *
            escala;


        const altoImagen =
            viewport.height *
            escala;


        const x =
            (
                anchoPagina -
                anchoImagen
            ) / 2;


        const y =
            (
                altoPagina -
                altoImagen
            ) / 2;


        pdf.addImage(

            imagen,

            "JPEG",

            x,

            y,

            anchoImagen,

            altoImagen,

            undefined,

            "FAST"

        );


        const nombre =
            (
                empleadoActual.nombre ||
                "Colaborador"
            )
            .replace(
                /[\\/:*?"<>|]/g,
                ""
            );


        const archivo =
            "Recibo - " +
            nombre +
            " - " +
            empleadoActual.periodo +
            ".pdf";


        pdf.save(
            archivo
        );


        if (boton) {

            boton.textContent =
                "✓ Guardado";


            setTimeout(
                function() {

                    boton.textContent =
                        "📥 Guardar recibo";

                },
                2000
            );

        }


    } catch (error) {

        console.error(
            "Error guardando:",
            error
        );


        alert(
            "No se pudo guardar el recibo."
        );


    } finally {

        if (boton) {

            boton.disabled =
                false;

        }

    }

}


// ======================================================
// CENTRO DE INFORMACIÓN
// ======================================================

function iniciarCentroInformacion() {

    const tarjetas =
        document.querySelectorAll(
            ".centro-card"
        );


    const modales =
        document.querySelectorAll(
            ".centro-modal"
        );


    tarjetas.forEach(
        function(tarjeta) {

            tarjeta.addEventListener(
                "click",
                function() {

                    const idModal =
                        tarjeta.dataset.modal;


                    const modal =
                        document.getElementById(
                            idModal
                        );


                    if (!modal) {

                        console.warn(
                            "No se encontró el modal:",
                            idModal
                        );

                        return;

                    }


                    modales.forEach(
                        function(otroModal) {

                            otroModal.classList.add(
                                "oculto"
                            );

                        }
                    );


                    modal.classList.remove(
                        "oculto"
                    );


                    document.body.classList.add(
                        "centro-modal-abierto"
                    );

                }
            );

        }
    );


    modales.forEach(
        function(modal) {

            const botonCerrar =
                modal.querySelector(
                    "[data-cerrar-modal]"
                );


            if (botonCerrar) {

                botonCerrar.addEventListener(
                    "click",
                    function() {

                        cerrarCentroModal(
                            modal
                        );

                    }
                );

            }


            modal.addEventListener(
                "click",
                function(evento) {

                    if (
                        evento.target ===
                        modal
                    ) {

                        cerrarCentroModal(
                            modal
                        );

                    }

                }
            );

        }
    );


    document.addEventListener(
        "keydown",
        function(evento) {

            if (
                evento.key !==
                "Escape"
            ) {

                return;

            }


            modales.forEach(
                function(modal) {

                    if (
                        !modal.classList.contains(
                            "oculto"
                        )
                    ) {

                        cerrarCentroModal(
                            modal
                        );

                    }

                }
            );

        }
    );

}


// ======================================================
// CERRAR MODAL
// ======================================================

function cerrarCentroModal(
    modal
) {

    if (!modal) {
        return;
    }


    modal.classList.add(
        "oculto"
    );


    document.body.classList.remove(
        "centro-modal-abierto"
    );

}


// ======================================================
// AUDIO
// ======================================================

function prepararAudio() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {
            return;
        }


        if (!audioContextCOA) {

            audioContextCOA =
                new AudioContext();

        }


        if (
            audioContextCOA.state ===
            "suspended"
        ) {

            audioContextCOA.resume();

        }


    } catch (error) {

        console.warn(
            "No se pudo preparar el audio:",
            error
        );

    }

}


// ======================================================
// SONIDO CORRECTO
// ======================================================

function reproducirSonidoEncontrado() {

    try {

        if (!audioContextCOA) {
            return;
        }


        if (
            audioContextCOA.state ===
            "suspended"
        ) {

            audioContextCOA.resume();

        }


        const tiempo =
            audioContextCOA.currentTime;


        const notas = [

            {
                frecuencia:
                    660,

                inicio:
                    0,

                duracion:
                    0.22
            },

            {
                frecuencia:
                    990,

                inicio:
                    0.16,

                duracion:
                    0.48
            }

        ];


        notas.forEach(
            function(nota) {

                const oscillator =
                    audioContextCOA.createOscillator();


                const gainNode =
                    audioContextCOA.createGain();


                oscillator.type =
                    "sine";


                const inicio =
                    tiempo +
                    nota.inicio;


                const final =
                    inicio +
                    nota.duracion;


                oscillator.frequency.setValueAtTime(
                    nota.frecuencia,
                    inicio
                );


                gainNode.gain.setValueAtTime(
                    0.0001,
                    inicio
                );


                gainNode.gain.exponentialRampToValueAtTime(
                    0.12,
                    inicio + 0.025
                );


                gainNode.gain.exponentialRampToValueAtTime(
                    0.0001,
                    final
                );


                oscillator.connect(
                    gainNode
                );


                gainNode.connect(
                    audioContextCOA.destination
                );


                oscillator.start(
                    inicio
                );


                oscillator.stop(
                    final
                );

            }
        );


    } catch (error) {

        console.warn(
            "No se pudo reproducir el sonido:",
            error
        );

    }

}


// ======================================================
// SONIDO ERROR
// ======================================================

function reproducirSonidoError() {

    try {

        if (!audioContextCOA) {
            return;
        }


        if (
            audioContextCOA.state ===
            "suspended"
        ) {

            audioContextCOA.resume();

        }


        const tiempo =
            audioContextCOA.currentTime;


        const oscillator =
            audioContextCOA.createOscillator();


        const gainNode =
            audioContextCOA.createGain();


        oscillator.type =
            "sine";


        oscillator.frequency.setValueAtTime(
            440,
            tiempo
        );


        oscillator.frequency.setValueAtTime(
            330,
            tiempo + 0.16
        );


        gainNode.gain.setValueAtTime(
            0.0001,
            tiempo
        );


        gainNode.gain.exponentialRampToValueAtTime(
            0.16,
            tiempo + 0.02
        );


        gainNode.gain.exponentialRampToValueAtTime(
            0.0001,
            tiempo + 0.14
        );


        gainNode.gain.exponentialRampToValueAtTime(
            0.16,
            tiempo + 0.17
        );


        gainNode.gain.exponentialRampToValueAtTime(
            0.0001,
            tiempo + 0.32
        );


        oscillator.connect(
            gainNode
        );


        gainNode.connect(
            audioContextCOA.destination
        );


        oscillator.start(
            tiempo
        );


        oscillator.stop(
            tiempo + 0.35
        );


    } catch (error) {

        console.warn(
            "No se pudo reproducir el sonido de error:",
            error
        );

    }

}


// ======================================================
// BLOQUEOS BÁSICOS
// ======================================================

document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();

    }
);


document.addEventListener(
    "keydown",
    function(event) {

        const key =
            (
                event.key ||
                ""
            ).toLowerCase();


        // F12

        if (
            event.key ===
            "F12"
        ) {

            event.preventDefault();

            event.stopPropagation();

            return false;

        }


        // Ctrl + Shift + I/J/C/K

        if (
            event.ctrlKey &&
            event.shiftKey &&
            [
                "i",
                "j",
                "c",
                "k"
            ].includes(key)
        ) {

            event.preventDefault();

            event.stopPropagation();

            return false;

        }


        // Ctrl + U

        if (
            event.ctrlKey &&
            key === "u"
        ) {

            event.preventDefault();

            event.stopPropagation();

            return false;

        }


        // Ctrl + S

        if (
            event.ctrlKey &&
            key === "s"
        ) {

            event.preventDefault();

            event.stopPropagation();

            return false;

        }


        // Ctrl + Shift + U

        if (
            event.ctrlKey &&
            event.shiftKey &&
            key === "u"
        ) {

            event.preventDefault();

            event.stopPropagation();

            return false;

        }

    },
    true
);


// ======================================================
// FIN
// ======================================================

console.log(
    "COA: script.js cargado correctamente."
);
