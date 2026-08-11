// ======================================================
// COA - RECIBOS DE PAGO
// SISTEMA ESTABLE
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
// VARIABLES
// ======================================================

let empleadoActual = null;

let paginaEncontrada = null;

let pdfActual = null;

let paginaActual = null;

let quincenaSeleccionada = "q1";


// ======================================================
// INICIAR
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarSistema
);


// ======================================================
// INICIO DEL SISTEMA
// ======================================================

function iniciarSistema() {

    console.log(
        "COA: sistema iniciado"
    );


    if (
        typeof pdfjsLib === "undefined"
    ) {

        console.error(
            "PDF.js no está cargado."
        );

        mostrarMensaje(
            "❌ No se pudo cargar el sistema de recibos.",
            true
        );

        return;

    }


    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


    // BOTÓN BUSCAR

    const boton =
        document.getElementById(
            "buscar"
        );


    if (!boton) {

        console.error(
            "No existe el botón de búsqueda."
        );

        return;

    }


    boton.addEventListener(
        "click",
        consultarEmpleado
    );


    // ENTER

    const codigo =
        document.getElementById(
            "codigo"
        );


    if (codigo) {

        codigo.addEventListener(
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


    // QUINCENAS

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


    // VER RECIBO

    const ver =
        document.getElementById(
            "verRecibo"
        );


    if (ver) {

        ver.addEventListener(
            "click",
            mostrarRecibo
        );

    }


    // CERRAR VISOR

    const cerrar =
        document.getElementById(
            "cerrarVisor"
        );


    if (cerrar) {

        cerrar.addEventListener(
            "click",
            cerrarRecibo
        );

    }


    // NUEVA CONSULTA

    const nueva =
        document.getElementById(
            "nuevaConsulta"
        );


    if (nueva) {

        nueva.addEventListener(
            "click",
            nuevaConsulta
        );

    }


    // GUARDAR RECIBO

    const guardar =
        document.getElementById(
            "guardarRecibo"
        );


    if (guardar) {

        guardar.addEventListener(
            "click",
            guardarPDF
        );

    }


    console.log(
        "COA: eventos configurados correctamente"
    );

}


// ======================================================
// MOSTRAR MENSAJE
// ======================================================

function mostrarMensaje(
    texto,
    error = false
) {

    const elemento =
        document.getElementById(
            "mensaje"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        texto;


    elemento.style.color =
        error
            ? "#b54b4b"
            : "#4d8066";

}


// ======================================================
// NORMALIZAR TEXTO
// ======================================================

function normalizar(
    texto
) {

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
// LIMPIAR CONSULTA
// ======================================================

function limpiarConsulta() {

    empleadoActual = null;

    paginaEncontrada = null;

    pdfActual = null;

    paginaActual = null;


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
// CARGAR PDF
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

            url:
                archivo

        }).promise;


    console.log(
        "PDF cargado correctamente.",
        "Páginas:",
        pdf.numPages
    );


    return pdf;

}


// ======================================================
// CONSULTAR EMPLEADO
// ======================================================

async function consultarEmpleado() {

    console.log(
        "================================"
    );

    console.log(
        "CONSULTA INICIADA"
    );

    console.log(
        "================================"
    );


    const codigoInput =
        document.getElementById(
            "codigo"
        );


    const boton =
        document.getElementById(
            "buscar"
        );


    if (!codigoInput) {

        console.error(
            "No existe el campo de código."
        );

        return;

    }


    // ==================================================
    // OBTENER CÓDIGO
    // ==================================================

    const codigo =
        codigoInput.value
            .trim()
            .toUpperCase();


    console.log(
        "Código ingresado:",
        codigo
    );


    // ==================================================
    // VALIDACIÓN EXACTA
    // ==================================================

    if (!codigo) {

        mostrarMensaje(
            "⚠️ Escribe tu código completo.",
            true
        );

        codigoInput.focus();

        return;

    }


    // ==================================================
    // DEBE TENER EXACTAMENTE 8 CARACTERES
    // ==================================================

    if (
        codigo.length !== 8
    ) {

        mostrarMensaje(

            "⚠️ Debes ingresar el código completo de 8 caracteres.",

            true

        );

        codigoInput.focus();

        return;

    }


    // ==================================================
    // SOLO LETRAS Y NÚMEROS
    // ==================================================

    if (
        !/^[A-Z0-9]{8}$/.test(
            codigo
        )
    ) {

        mostrarMensaje(

            "⚠️ El código debe contener únicamente letras y números.",

            true

        );

        codigoInput.focus();

        return;

    }


    // ==================================================
    // OBTENER PERIODO
    // ==================================================

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

    limpiarConsulta();


    // ==================================================
    // DESACTIVAR BOTÓN
    // ==================================================

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

        // ==================================================
        // CARGAR PDF
        // ==================================================

        const pdf =
            await obtenerPDF(
                periodo.archivo
            );


        // ==================================================
        // NORMALIZAR CÓDIGO
        // ==================================================

        const codigoBuscado =
            normalizar(
                codigo
            );


        let encontrado =
            null;


        // ==================================================
        // BUSCAR EN CADA PÁGINA
        // ==================================================

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

                            return item.str || "";

                        }
                    )
                    .join(" ");


            const textoNormalizado =
                normalizar(
                    texto
                );


            // ==================================================
            // COINCIDENCIA
            // ==================================================

            if (
                textoNormalizado.includes(
                    codigoBuscado
                )
            ) {

                encontrado = {

                    pagina:
                        numero,

                    texto:
                        texto

                };


                break;

            }

        }


        // ==================================================
        // NO ENCONTRADO
        // ==================================================

        if (!encontrado) {

            mostrarMensaje(

                "❌ El código " +
                codigo +
                " no fue encontrado en " +
                periodo.nombre +
                ".",

                true

            );

            return;

        }


        // ==================================================
        // OBTENER NOMBRE
        // ==================================================

        const nombre =
            obtenerNombre(
                encontrado.texto
            );


        // ==================================================
        // GUARDAR INFORMACIÓN
        // ==================================================

        empleadoActual = {

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


        // ==================================================
        // MOSTRAR NOMBRE
        // ==================================================

        const elementoNombre =
            document.getElementById(
                "nombreEmpleado"
            );


        if (elementoNombre) {

            elementoNombre.textContent =
                nombre;

        }


        // ==================================================
        // MOSTRAR CÓDIGO
        // ==================================================

        const elementoCodigo =
            document.getElementById(
                "codigoEmpleado"
            );


        if (elementoCodigo) {

            elementoCodigo.textContent =
                codigo;

        }


        // ==================================================
        // MOSTRAR QUINCENA
        // ==================================================

        const textoQuincena =
            document.getElementById(
                "textoQuincena"
            );


        if (textoQuincena) {

            textoQuincena.textContent =

                (
                    periodo.nombre +
                    " · " +
                    periodo.mes
                ).toUpperCase();

        }


        const periodoSeleccionado =
            document.getElementById(
                "periodoSeleccionado"
            );


        if (periodoSeleccionado) {

            periodoSeleccionado.textContent =

                (
                    periodo.nombre +
                    " · " +
                    periodo.mes
                ).toUpperCase();

        }


        // ==================================================
        // MOSTRAR RESULTADO
        // ==================================================

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
            "ERROR DURANTE LA CONSULTA:",
            error
        );


        mostrarMensaje(

            "❌ No se pudo realizar la consulta. Verifica que el PDF esté disponible.",

            true

        );


    } finally {

        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "🔎 Consultar";

        }

    }

}


// ======================================================
// OBTENER NOMBRE
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
        !paginaEncontrada
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


    if (!visor || !resultado || !visorPDF) {

        return;

    }


    // MOSTRAR VISOR

    visor.classList.remove(
        "oculto"
    );


    // OCULTAR TARJETA

    resultado.classList.add(
        "oculto"
    );


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
            "Error mostrando recibo:",
            error
        );


        visorPDF.innerHTML = `

            <div
                class="visor-mensaje"
                style="color:#b54b4b;"
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

        codigo.focus();

    }


    mostrarMensaje("");


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

    if (
        !paginaActual
    ) {

        alert(
            "Primero abre el recibo."
        );

        return;

    }


    if (
        !window.jspdf
    ) {

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
                .95
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
            empleadoActual.nombre
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
