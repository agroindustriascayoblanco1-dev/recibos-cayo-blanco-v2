// ======================================================
// COA - RECIBOS DE PAGO
// SISTEMA NUEVO
// ======================================================


// ======================================================
// CONFIGURACIÓN
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


// ======================================================
// ACTUALIZAR SELECTOR DE QUINCENAS
// ======================================================

function actualizarSelectorQuincenas() {

    const q1 = PERIODOS.q1;

    const q2 = PERIODOS.q2;


    const nombreQ1 =
        document.getElementById(
            "nombreQ1"
        );


    const mesQ1 =
        document.getElementById(
            "mesQ1"
        );


    const nombreQ2 =
        document.getElementById(
            "nombreQ2"
        );


    const mesQ2 =
        document.getElementById(
            "mesQ2"
        );


    if (nombreQ1) {

        nombreQ1.textContent =
            q1.nombre;

    }


    if (mesQ1) {

        mesQ1.textContent =
            q1.mes;

    }


    if (nombreQ2) {

        nombreQ2.textContent =
            q2.nombre;

    }


    if (mesQ2) {

        mesQ2.textContent =
            q2.mes;

    }

}


// ======================================================
// INICIAR CUANDO EL HTML ESTÉ LISTO
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarSistema
);


// ======================================================
// INICIO
// ======================================================

function iniciarSistema() {

    actualizarSelectorQuincenas();


    console.log(
        "COA: sistema iniciado"
    );


    // --------------------------------------------------
    // CONFIGURAR PDF.JS
    // --------------------------------------------------

    if (
        typeof pdfjsLib === "undefined"
    ) {

        console.error(
            "PDF.js no está cargado."
        );        reproducirSonidoError();




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
        document.getElementById(
            "buscar"
        );


    if (!boton) {

        console.error(
            "No existe el botón buscar."
        );


        return;

    }


    boton.addEventListener(
        "click",
        validarCodigoAcceso
    );


    // --------------------------------------------------
    // ENTER
    // --------------------------------------------------

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


    // --------------------------------------------------
    // QUINCENAS
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
    // VER RECIBO
    // --------------------------------------------------

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


    // --------------------------------------------------
    // CERRAR
    // --------------------------------------------------

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


    // --------------------------------------------------
    // NUEVA CONSULTA
    // --------------------------------------------------

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

    const carnetPanel=document.getElementById("abrirCarnet");
    if(carnetPanel)carnetPanel.addEventListener("click",abrirCarnetDesdePanel);
    const q1Panel=document.getElementById("verQ1");
    if(q1Panel)q1Panel.addEventListener("click",function(){consultarQuincenaDesdePanel("q1");});
    const q2Panel=document.getElementById("verQ2");
    if(q2Panel)q2Panel.addEventListener("click",function(){consultarQuincenaDesdePanel("q2");});


    // --------------------------------------------------
    // GUARDAR
    // --------------------------------------------------

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


    // --------------------------------------------------
    // CENTRO DE INFORMACIÓN
    // --------------------------------------------------

    iniciarCentroInformacion();


    console.log(
        "COA: eventos configurados correctamente"
    );

}
// ======================================================
// MENSAJE
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
            ? "#c62828"
            : "#087a3f";

}


// ======================================================
// NORMALIZAR
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
// NUEVA DINÁMICA — VALIDAR CÓDIGO Y MOSTRAR OPCIONES
// ======================================================
function validarCodigoAcceso(){
    prepararAudio();
    const input=document.getElementById("codigo");
    const boton=document.getElementById("buscar");
    if(!input)return;
    const codigo=input.value.trim().toUpperCase();
    input.value=codigo;
    if(!codigo){reproducirSonidoError();mostrarMensaje("⚠️ Escribe tu código completo.",true);input.focus();return;}
    if(!/^CBEP\d{4}$/.test(codigo)){reproducirSonidoError();mostrarMensaje("⚠️ Ingresa tu código completo. Ejemplo: CBEP0000.",true);input.focus();return;}
    const empleado=BASE_EMPLEADOS_CARNET[codigo];
    if(!empleado){reproducirSonidoError();mostrarMensaje("⚠️ No se encontró un empleado con ese código.",true);input.focus();return;}
    empleadoActual={codigo,nombre:empleado.nombre||"",periodo:"",mes:"",archivo:""};
    document.getElementById("nombreEmpleado").textContent=empleado.nombre||"—";
    document.getElementById("codigoEmpleado").textContent=codigo;
    const resultado=document.getElementById("resultado");
    if(resultado)resultado.classList.remove("oculto");
    mostrarMensaje("✓ Acceso autorizado.");
    reproducirSonidoEncontrado();
    if(boton)boton.textContent="Continuar";
    if(resultado)resultado.scrollIntoView({behavior:"smooth",block:"start"});
}
function consultarQuincenaDesdePanel(quincena){
    if(!empleadoActual||!empleadoActual.codigo){mostrarMensaje("⚠️ Primero ingresa tu código de empleado.",true);return;}
    quincenaSeleccionada=quincena;
    consultarEmpleado();
}
function abrirCarnetDesdePanel(){
    if(!empleadoActual||!empleadoActual.codigo){mostrarMensaje("⚠️ Primero ingresa tu código de empleado.",true);return;}
    const modal=document.getElementById("modalCarnet");
    const input=document.getElementById("codigoCarnet");
    if(!modal||!input)return;
    input.value=empleadoActual.codigo;
    modal.classList.remove("oculto");
    document.body.classList.add("centro-modal-abierto");
    mostrarCarnetEmpleado();
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
        await pdfjsLib.getDocument(
            {
                url: archivo
            }
        ).promise;


    console.log(
        "PDF cargado:",
        pdf.numPages,
        "páginas"
    );


    return pdf;

}


// ======================================================
// BUSCAR EMPLEADO
// ======================================================

async function consultarEmpleado() {

    // ==================================================
    // 🔊 PREPARAR AUDIO DESDE LA ACCIÓN DEL USUARIO
    // ==================================================

    prepararAudio();


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
            "No existe el campo código."
        );


        return;

    }


    const codigo =
        codigoInput.value
            .trim()
            .toUpperCase();


    console.log(
        "Código:",
        codigo
    );


    // ==================================================
    // VALIDAR
    // ==================================================

    if (!codigo) {

                reproducirSonidoError();

mostrarMensaje(
            "⚠️ Escribe tu código completo.",
            true
        );


        codigoInput.focus();


        return;

    }


    if (!/^CBEP\d{4}$/.test(codigo)) {

        reproducirSonidoError();

        mostrarMensaje(
            "⚠️ Ingresa tu código completo de 8 caracteres. Ejemplo: CBEP0000.",
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

        

            reproducirSonidoError();

mostrarMensaje(
            "⚠️No se encontró la quincena.",
            true
        );


        return;

    }


    // ==================================================
    // LIMPIAR
    // ==================================================

    limpiarConsulta();


    // ==================================================
    // BOTÓN
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
        // CÓDIGO NORMALIZADO
        // ==================================================

        const codigoBuscado =
            normalizar(
                codigo
            );


        let encontrado =
            null;


        // ==================================================
        // RECORRER PÁGINAS
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
            // ==================================================
            // COINCIDENCIA EXACTA DEL CÓDIGO
            // ==================================================
            // PDF.js puede separar CBEP y los números con espacios.
            // Permitimos esos espacios, pero exigimos exactamente 4 dígitos.

            const codigosEnPagina =
                texto.match(
                    /CBEP\s*([0-9]{4})/gi
                ) || [];

            const coincidenciaExacta =
                codigosEnPagina.some(
                    function(codigoPDF) {

                        return (
                            normalizar(codigoPDF) ===
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


        // ==================================================
        // NO ENCONTRADO
        // ==================================================

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


        // ==================================================
        // OBTENER NOMBRE
        // ==================================================

        let nombre =
            obtenerNombre(
                encontrado.texto
            );


        // ==================================================
        // GUARDAR DATOS
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
        // MOSTRAR DATOS
        // ==================================================

        document
            .getElementById(
                "nombreEmpleado"
            )
            .textContent =
                nombre;


        document
            .getElementById(
                "codigoEmpleado"
            )
            .textContent =
                codigo;


        const textoQuincenaElemento = document.getElementById("textoQuincena");
        if (textoQuincenaElemento) textoQuincenaElemento.textContent =
                (
                    periodo.nombre +
                    " · " +
                    periodo.mes
                ).toUpperCase();


        const periodoSeleccionadoElemento = document.getElementById("periodoSeleccionado");
        if (periodoSeleccionadoElemento) periodoSeleccionadoElemento.textContent =
                (
                    periodo.nombre +
                    " · " +
                    periodo.mes
                ).toUpperCase();


        const periodoPagoElemento =
            document.getElementById(
                "periodoPago"
            );


        if (periodoPagoElemento) {

            periodoPagoElemento.textContent =
                periodo.periodoPago || "";

        }


        // ==================================================
        // MOSTRAR TARJETA
        // ==================================================

        const resultado =
            document.getElementById(
                "resultado"
            );


        resultado.classList.remove(
            "oculto"
        );


        mostrarMensaje(
            "✓ Colaborador encontrado correctamente."
        );

        // 🔊 SONIDO DE RECIBO ENCONTRADO
        reproducirSonidoEncontrado();


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
                "🔎 Consultar";

        }

    }

}
// ======================================================
// 🔊 AUDIO DE CONFIRMACIÓN
// ======================================================

let audioContextCOA = null;

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

        // ==================================================
        // 📄 SONIDO DE CONFIRMACIÓN DE DOCUMENTO
        // Dos tonos suaves: "tin... ding"
        // ==================================================

        const notas = [
            {
                frecuencia: 660,
                inicio: 0,
                duracion: 0.22
            },
            {
                frecuencia: 990,
                inicio: 0.16,
                duracion: 0.48
            }
        ];

        notas.forEach(function(nota) {

            const oscillator =
                audioContextCOA.createOscillator();

            const gainNode =
                audioContextCOA.createGain();

            oscillator.type =
                "sine";

            const inicio =
                tiempo + nota.inicio;

            const final =
                inicio + nota.duracion;

            oscillator.frequency.setValueAtTime(
                nota.frecuencia,
                inicio
            );

            // Entrada suave
            gainNode.gain.setValueAtTime(
                0.0001,
                inicio
            );

            gainNode.gain.exponentialRampToValueAtTime(
                0.12,
                inicio + 0.025
            );

            // Salida suave
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

        });

    } catch (error) {

        console.warn(
            "No se pudo reproducir el sonido de confirmación:",
            error
        );

    }

}

// ======================================================
// OBTENER NOMBRE
// ======================================================

function obtenerNombre(
    texto
) {

    // --------------------------------------------------
    // MÉTODO 1
    // --------------------------------------------------

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


    // --------------------------------------------------
    // MÉTODO 2
    // --------------------------------------------------

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


    // ==================================================
    // MOSTRAR VISOR
    // ==================================================

    visor.classList.remove(
        "oculto"
    );


    // ==================================================
    // OCULTAR TARJETA
    // ==================================================

    resultado.classList.add(
        "oculto"
    );


    titulo.textContent =
        empleadoActual.periodo +
        " · " +
        empleadoActual.mes;


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

        // ==================================================
        // CARGAR PÁGINA
        // ==================================================

        const pagina =
            await pdfActual.getPage(
                paginaEncontrada
            );


        paginaActual =
            pagina;


        // ==================================================
        // ESCALA
        // ==================================================

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


        // ==================================================
        // CANVAS
        // ==================================================

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


        // ==================================================
        // RENDER
        // ==================================================

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


    visor.classList.add(
        "oculto"
    );


    if (empleadoActual) {

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


    codigo.value =
        "";


    mostrarMensaje("");


    codigo.focus();


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

        boton.disabled =
            true;


        boton.textContent =
            "Guardando...";


        // ==================================================
        // CREAR CANVAS
        // ==================================================

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


        // ==================================================
        // CONVERTIR A IMAGEN
        // ==================================================

        const imagen =
            canvas.toDataURL(
                "image/jpeg",
                0.95
            );


        // ==================================================
        // CREAR PDF
        // ==================================================

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


        // ==================================================
        // TAMAÑO DE PÁGINA
        // ==================================================

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


        // ==================================================
        // AGREGAR IMAGEN
        // ==================================================

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


        // ==================================================
        // NOMBRE DEL ARCHIVO
        // ==================================================

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


        boton.textContent =
            "✓ Guardado";


        setTimeout(
            function() {

                boton.textContent =
                    "📥 Guardar recibo";

            },
            2000
        );


    } catch (error) {

        console.error(
            "Error guardando:",
            error
        );


        alert(
            "No se pudo guardar el recibo."
        );


    } finally {

        boton.disabled =
            false;

    }

}
// ======================================================
// CENTRO DE INFORMACIÓN
// VENTANAS MODALES
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


    // ==================================================
    // ABRIR VENTANA
    // ==================================================

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


                    // ------------------------------------------
                    // CERRAR TODAS LAS VENTANAS
                    // ------------------------------------------

                    modales.forEach(
                        function(otroModal) {

                            otroModal.classList.add(
                                "oculto"
                            );

                        }
                    );


                    // ------------------------------------------
                    // ABRIR LA SELECCIONADA
                    // ------------------------------------------

                    modal.classList.remove(
                        "oculto"
                    );


                    // ------------------------------------------
                    // BLOQUEAR SCROLL
                    // ------------------------------------------

                    document.body.classList.add(
                        "centro-modal-abierto"
                    );

                }
            );

        }
    );


    // ==================================================
    // CONFIGURAR CADA MODAL
    // ==================================================

    modales.forEach(
        function(modal) {

            // ----------------------------------------------
            // BOTÓN CERRAR
            // ----------------------------------------------

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


            // ----------------------------------------------
            // CERRAR AL TOCAR EL FONDO
            // ----------------------------------------------

            modal.addEventListener(
                "click",
                function(evento) {

                    if (
                        evento.target === modal
                    ) {

                        cerrarCentroModal(
                            modal
                        );

                    }

                }
            );

        }
    );


    // ==================================================
    // CERRAR CON ESC
    // ==================================================

    document.addEventListener(
        "keydown",
        function(evento) {

            if (
                evento.key !== "Escape"
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


    console.log(
        "COA: Centro de Información iniciado"
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
// 🔊 SONIDO DE ERROR - RECIBO NO ENCONTRADO
// ======================================================

function reproducirSonidoError() {

    try {

        if (!audioContextCOA) {
            return;
        }

        if (audioContextCOA.state === "suspended") {
            audioContextCOA.resume();
        }

        const tiempo = audioContextCOA.currentTime;

        const oscillator = audioContextCOA.createOscillator();
        const gainNode = audioContextCOA.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(440, tiempo);
        oscillator.frequency.setValueAtTime(330, tiempo + 0.16);

        gainNode.gain.setValueAtTime(0.0001, tiempo);

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

        oscillator.connect(gainNode);
        gainNode.connect(audioContextCOA.destination);

        oscillator.start(tiempo);
        oscillator.stop(tiempo + 0.35);

    } catch (error) {

        console.warn(
            "No se pudo reproducir el sonido de error:",
            error
        );

    }

}


/* =========================================================
   BLOQUEOS BÁSICOS CONTRA INSPECCIÓN ACCIDENTAL
   No afectan el funcionamiento normal del portal.
   ========================================================= */

document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

document.addEventListener("keydown", function (event) {
    const key = (event.key || "").toLowerCase();

    // F12
    if (event.key === "F12") {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    // Ctrl+Shift+I / J / C / K
    if (
        event.ctrlKey &&
        event.shiftKey &&
        ["i", "j", "c", "k"].includes(key)
    ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    // Ctrl+U — ver código fuente
    if (event.ctrlKey && key === "u") {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    // Ctrl+S — guardar página
    if (event.ctrlKey && key === "s") {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    // Ctrl+Shift+U — variantes de herramientas/inspección en algunos entornos
    if (
        event.ctrlKey &&
        event.shiftKey &&
        key === "u"
    ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
}, true);


// ======================================================
// CARNET DE EMPLEADO
// Base cargada desde la hoja RH_MAESTRO_EMPLEADOS
// ======================================================

const BASE_EMPLEADOS_CARNET = {"CBEP1392":{"nombre":"Andres Misael Zelaya Rodriguez","identidad":"0603-1974-00130","puesto":"Gerente de Producción","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0288":{"nombre":"Antoniel De Jesus Casco Zuniga","identidad":"1501-2003-00133","puesto":"Auxiliar de almacén central","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0124":{"nombre":"Carlos Eduardo Torres Montoya","identidad":"0801-1982-02208","puesto":"Gestor de Compras y Logistica","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP1437":{"nombre":"Carlos Orlando Garcia Rosales","identidad":"1518-1995-00032","puesto":"Auxiliar Administrativo","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0422":{"nombre":"Caterin Socorro Raudales Cáceres","identidad":"1501-1995-00552","puesto":"Administrador Planta De Empaque","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0096":{"nombre":"Cristhian  Osorio Acosta","identidad":"1501-2000-00465","puesto":"Auxiliar de RRHH","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0542":{"nombre":"Cristhian Ramon Lobo Ordoñez","identidad":"1518-2003-00135","puesto":"Auxiliar de almacén central","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0108":{"nombre":"Darwin Enrique Velasquez Medina","identidad":"0820-1996-00448","puesto":"Asistente de Producción","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP1404":{"nombre":"Dilcia Maribel Vazques Elias","identidad":"1518-1993-00248","puesto":"Auxiliar de Enfermería","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0664":{"nombre":"Elgar Elias Avila Munguia","identidad":"1519-1975-00027","puesto":"Administrador de taller","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0088":{"nombre":"Elmer Dario Palma Solorzano","identidad":"1501-1991-00710","puesto":"Motorista","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0607":{"nombre":"Elsy Amanda Duarte Hernandez","identidad":"1518-1992-00195","puesto":"Auditor de Calidad Finca","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0528":{"nombre":"Fanny Elizabeth Martinez Murillo","identidad":"0502-1999-00396","puesto":"Auxiliar de limpieza administración","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP1315":{"nombre":"Francisco Roberto Cruz Garcia","identidad":"1501-1999-02241","puesto":"Auxiliar de Logistica","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0457":{"nombre":"Jorge David Montoya Gomez","identidad":"0801-1970-08945","puesto":"Gerente Administrativo Financiero","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0016":{"nombre":"Juan Angel Osorio Acosta","identidad":"1707-1989-00117","puesto":"Asistente de almacén central","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0524":{"nombre":"Leonardo Jose Rivera Canales","identidad":"1501-1996-01078","puesto":"Auxiliar de almacén central","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0986":{"nombre":"Luis Fernando Mendoza Banegas","identidad":"1501-1980-01623","puesto":"Motorista","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP1371":{"nombre":"Marco Antonio Garcia MC. Carthy","identidad":"0801-1987-06331","puesto":"Coordinador de Inventarios","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP1144":{"nombre":"Mariano Alejandro Perez Mancebo","identidad":"1501-2005-01026","puesto":"Auxiliar de RRHH","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0112":{"nombre":"Mayda Yanely Palma Solorzano","identidad":"1501-2001-02252","puesto":"Auxiliar de RRHH","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP1454":{"nombre":"Miguel Edgardo Mejia Chavarria","identidad":"1201-1990-00157","puesto":"Administrador de finca","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0109":{"nombre":"Nancy Leticia Contreras Guerrero","identidad":"1518-1991-00048","puesto":"Asistente Administrativo","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP1090":{"nombre":"Nelson Johel Galindo Ordoñez","identidad":"1518-2006-00084","puesto":"Auxiliar de almacén central","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0741":{"nombre":"Oscar Antonio Castillo Torres","identidad":"0703-1993-01598","puesto":"Administrador de finca","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP1486":{"nombre":"Oscar Daniel Dominguez Rodas","identidad":"1809-2000-00527","puesto":"Administrador de finca","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP1395":{"nombre":"Tirsa Lizeth Paz Caceres","identidad":"0801-1998-07827","puesto":"Coordinadora RRHH","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0740":{"nombre":"Victor Noriel Cuellar Mejia","identidad":"0801-1992-03829","puesto":"Administrador de finca","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP0984":{"nombre":"Wuilberto  Mendoza Sandoval","identidad":"1501-1960-00732","puesto":"Motorista","departamento":"ADMINISTRACION","division":"ADMINISTRACIÓN"},"CBEP1393":{"nombre":"Abi Ernestina Molina Agurcia","identidad":"1518-2002-00052","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1341":{"nombre":"Abimael  Gutierrez Carranza","identidad":"1523-2000-00178","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0198":{"nombre":"Ada Lizeth Arevalo Murillo","identidad":"1501-1993-00570","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0201":{"nombre":"Adilia Mayeli Garcia Vasquez","identidad":"1501-2003-01651","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1345":{"nombre":"Alenny Sagrario Ortiz Reyes","identidad":"1510-1999-00297","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1272":{"nombre":"Alex Fabricio Carranza Corrales","identidad":"1501-2005-01520","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0431":{"nombre":"Alicia Zenayra Vasquez Corrales","identidad":"0716-1993-00396","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0820":{"nombre":"Ana Gabriela Cruz Talavera","identidad":"1501-2006-01727","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1060":{"nombre":"Arely Yamileth Moreno Zambrano","identidad":"0715-2002-00852","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0418":{"nombre":"Ariel Guillermo Moreno Zelaya","identidad":"0715-1997-01278","puesto":"Auxiliar de limpieza planta de empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0204":{"nombre":"Belkis Dalice Rivas Reyes","identidad":"1501-1998-01796","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1265":{"nombre":"Belkis Merary Matute Varela","identidad":"1523-2006-00989","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0231":{"nombre":"Bertha lidia Diaz Padilla","identidad":"1510-2001-00042","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1109":{"nombre":"Carmen Idalia Duron Hernandez","identidad":"1501-2004-02225","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0298":{"nombre":"Carmen Teresa Irias Vargas","identidad":"1501-1995-01880","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0193":{"nombre":"Carolina del Carmen Chacon Carias","identidad":"1501-1998-01797","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0125":{"nombre":"Cesar David Moreno","identidad":"1501-2003-02615","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0462":{"nombre":"Christian Ronaldo Moreno Lopez","identidad":"1518-2003-00101","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0715":{"nombre":"Cintia Yulissa Flores Moreno","identidad":"0208-2002-01452","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0211":{"nombre":"Claudia Selena Benitez Paguada","identidad":"1501-1997-00759","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0386":{"nombre":"Dania Ninoska Mendez Solorzano","identidad":"1518-1986-00157","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1394":{"nombre":"Dayana Michel Molina Agurcia","identidad":"1518-2004-00225","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0809":{"nombre":"Denixon Yoeni Aviles Rivera","identidad":"1501-2000-00153","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0888":{"nombre":"Deylin Yanira Ascencio","identidad":"0719-1997-01669","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0836":{"nombre":"Dilcia Marisela Aviles Rivera","identidad":"1501-1996-00156","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0208":{"nombre":"Dinora Bihaney Hernandez Alvarado","identidad":"1505-2003-00220","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0649":{"nombre":"Doris Karolina Ilias Rodriguez","identidad":"0715-2002-00057","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0383":{"nombre":"Doris Suyapa Matute Lainez","identidad":"1519-1991-00508","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0725":{"nombre":"Eduin Orlando Espinal Herrera","identidad":"1523-1998-00371","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0392":{"nombre":"Edwin Adalberto Mendez Solorzano","identidad":"1501-1982-01777","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0294":{"nombre":"Eli Jacob Calderon Montalvan","identidad":"1501-1992-03601","puesto":"Supervisor de Calidad","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0666":{"nombre":"Elkin Ernesto Reyes Castillo","identidad":"1501-2001-02375","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0285":{"nombre":"Elmer Ruperto Zuniga","identidad":"1501-2000-01405","puesto":"Auxiliar de limpieza planta de empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0619":{"nombre":"Enma Yolanda Talavera Murillo","identidad":"1501-1997-01776","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1177":{"nombre":"Enoc Jeremia Banegas Andrade","identidad":"1518-2003-00063","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0774":{"nombre":"Ervin Obdulio Padilla Romero","identidad":"0814-1980-00007","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1350":{"nombre":"Eskarleth Yulieth Calix Flores","identidad":"0705-2006-00186","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1199":{"nombre":"Evelin Gerardina Carranza Corrales","identidad":"1501-1981-00080","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0705":{"nombre":"Eymi Yamileth Ramirez Medina","identidad":"0803-1999-00225","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0651":{"nombre":"Fany Yaneth Funes Ramires","identidad":"0703-2008-03742","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0152":{"nombre":"Franklin Alexis Orellana Caceres","identidad":"1501-1994-00701","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0226":{"nombre":"Geidy Caina Rodas Inestroza","identidad":"1518-1997-00180","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0449":{"nombre":"Gerardo Antonio Mairena Palma","identidad":"1501-2004-01456","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1264":{"nombre":"Geydi Daneli Velasquez Gomez","identidad":"0715-1994-00045","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0720":{"nombre":"Glenda Yessenia Cruz Talavera","identidad":"1518-1986-00002","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0259":{"nombre":"Helin Roxana Calderon Benitez","identidad":"1501-1999-02041","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0479":{"nombre":"Ingris Edublina Guillen Vasquez","identidad":"1501-1988-00157","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0772":{"nombre":"Jairo Rubith Paz Rivas","identidad":"0703-1998-03489","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0286":{"nombre":"Jani Marbeli Ardon Torres","identidad":"1501-2003-01943","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0935":{"nombre":"Jerickson Abel Melendez Pineda","identidad":"1505-2006-00397","puesto":"Auxiliar de limpieza planta de empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0483":{"nombre":"Jonny Antonio Guillen Gavarrete","identidad":"1518-1994-00163","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0166":{"nombre":"Josafat Jesurin Hernandez Rojas","identidad":"1501-1991-02602","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0558":{"nombre":"Jose Elias Rodas Inestroza","identidad":"1501-1997-01898","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0927":{"nombre":"Jose Enrique Bernal Acosta","identidad":"1501-2002-01402","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0232":{"nombre":"Joselyn Gisela Matute Palma","identidad":"1501-2003-00714","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0047":{"nombre":"Juan Carlos Galeano Rodriguez","identidad":"1518-1997-00306","puesto":"Supervisor de Planta","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0178":{"nombre":"Juan Manuel Benitez Palada","identidad":"0715-1997-01363","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0237":{"nombre":"Julia Maria Benitez Paguada","identidad":"1501-1988-02191","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0939":{"nombre":"Karla Yojana Zapata","identidad":"1503-1999-01066","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1408":{"nombre":"Korina Leticia Avila Ordoñez","identidad":"0715-2000-00389","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0673":{"nombre":"Leila Danely Zambrano Martinez","identidad":"0715-1986-00004","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0322":{"nombre":"Leonardo Francisco Bustillo Rauda","identidad":"0801-1995-20132","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0228":{"nombre":"Lesbia Roselin Betanco Zambrano","identidad":"1501-2001-02208","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0319":{"nombre":"Lilian Karina Gonzales Inestroza","identidad":"1501-1996-00259","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1277":{"nombre":"Marbin Alonzo Montalvan Ramirez","identidad":"1501-1991-02272","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0497":{"nombre":"Maria Isabel Gebuarer Calderon","identidad":"1518-1983-00180","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0289":{"nombre":"Maria Issela Lanza Funez","identidad":"1508-1993-00182","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0493":{"nombre":"Maribel  Ramires Sanchez","identidad":"0703-2006-03179","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0202":{"nombre":"Mariela de Jesus Garcia Vasquez","identidad":"1518-1992-00225","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0630":{"nombre":"Mario Javier Turcios Sanchez","identidad":"1518-1967-00063","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0482":{"nombre":"Mario Joel Ponce Funes","identidad":"1501-2000-01569","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0154":{"nombre":"Marlon Alfredo Alvarez Medina","identidad":"1518-1995-00167","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0292":{"nombre":"Martha Johajana Cruz Talavera","identidad":"1501-1998-01593","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1354":{"nombre":"Martha Maria Lopez Palma","identidad":"1501-1987-02347","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1034":{"nombre":"Martha Robertina Benitez Paguada","identidad":"1501-1994-00809","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0327":{"nombre":"Mauricio Antonio Rodríguez Andrade","identidad":"1518-2000-00211","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0674":{"nombre":"Merary Sarahi Romero Romero","identidad":"0715-2007-00162","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1429":{"nombre":"Mileydi Nohely Verde Zelaya","identidad":"1501-2004-02583","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0238":{"nombre":"Mirian Yaneth Garcia Rosa","identidad":"1501-1990-03593","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0913":{"nombre":"Modesto Antonio Castillo Jimenez","identidad":"1501-2012-01798","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0301":{"nombre":"Nolvia Leticia Funes Sanchez","identidad":"1501-1979-00328","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0296":{"nombre":"Olga Rosalina Funez Hernandez","identidad":"1501-1996-02597","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0771":{"nombre":"Osmin Ariel Garcia Garcia","identidad":"1501-2003-00943","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1278":{"nombre":"Quewin Yuviny Colindres Carranza","identidad":"1523-1997-00340","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1279":{"nombre":"Rosny Ariel Colindres Calderon","identidad":"1501-2005-01522","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0219":{"nombre":"Rosy Margarita Moreno","identidad":"1501-1983-00093","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0161":{"nombre":"Santos Bernardo García Castillo","identidad":"1501-2001-01193","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0932":{"nombre":"Santos Ernesto Cruz Gonzales","identidad":"0806-1998-00669","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1096":{"nombre":"Sayra Pamela Rosales Murillo","identidad":"1501-2004-01821","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1042":{"nombre":"Sayra Yaquelin Benitez Pineda","identidad":"1501-1996-00807","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0438":{"nombre":"Seyda Suyapa Herrera Antunez","identidad":"1501-1989-00232","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0702":{"nombre":"Seyli Tatiana Ordoñez Garcia","identidad":"1501-2005-01076","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0458":{"nombre":"Sindy Dariela Mendoza Garcia","identidad":"1501-1998-01163","puesto":"Analista de Muestreos","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1415":{"nombre":"Sulma Yaquelin Herrera Antunez","identidad":"1501-1999-02112","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1095":{"nombre":"Vilma Suyapa Galo Soto","identidad":"0715-1991-00362","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1227":{"nombre":"Walter Reynerio Urbina Herrera","identidad":"1501-2005-01206","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1281":{"nombre":"Wil Misael Montalvan Ramirez","identidad":"1501-1989-02558","puesto":"Auxiliar de Carga PE","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1430":{"nombre":"Yaleny Anahi Turcios Reyes","identidad":"1501-2000-01448","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0344":{"nombre":"Yeimi Paola Garcia Garcia","identidad":"1518-2001-00099","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0844":{"nombre":"Yesilin Elizabeth Garcia Giron","identidad":"1518-1997-00043","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0701":{"nombre":"Yesli Yolibeth Calderon Benitez","identidad":"1501-2005-00992","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0236":{"nombre":"Yolanda Suyapa Guzman Alvarez","identidad":"1518-1989-00098","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0825":{"nombre":"Yolany Del Carmen Rodriguez Hernandez","identidad":"1518-1991-00076","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0716":{"nombre":"Yoselin Alexandra Moreno Lopez","identidad":"1518-2001-00033","puesto":"Colaborador de Planta de Empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP0197":{"nombre":"Yuri Liliana Galeas Rivera","identidad":"1501-1997-05593","puesto":"Auxiliar de limpieza planta de empaque","departamento":"PLANTA DE EMPAQUE","division":"EMPACADORA"},"CBEP1180":{"nombre":"Alda Maribel Carcamo Rivera","identidad":"1501-1990-01883","puesto":"Cirugía y Deshoje","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1208":{"nombre":"Arnol Javier Cruz Carranza","identidad":"1523-2005-01163","puesto":"Fitosanitario","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0173":{"nombre":"Carlos Jacobo Andrade Garcia","identidad":"1518-1993-00180","puesto":"Capataz Practicas Culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0892":{"nombre":"Darlin Geovanny Bolaños Chacón","identidad":"1523-1996-00174","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1257":{"nombre":"Darlin Josue Ordoñez Perez","identidad":"0719-1993-00034","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1204":{"nombre":"Dayani Jisel Godoy Lopez","identidad":"1523-2003-00678","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1066":{"nombre":"Derlin Joaquin Lobo Cantillano","identidad":"1514-1999-00088","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0838":{"nombre":"Ediee Raul Acosta Ordoñez","identidad":"1501-1992-03193","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1186":{"nombre":"Edilson Josue Rodriguez Pineda","identidad":"1501-2003-01271","puesto":"Fitosanitario","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1181":{"nombre":"Elizzon Ilybran Martinez Flores","identidad":"1501-2004-00052","puesto":"Deshije","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0817":{"nombre":"Ever Saul Acosta Ordoñez","identidad":"1501-2001-02331","puesto":"Capataz Fitosanitario","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0018":{"nombre":"Felipe Antonio Rosales Arevalo","identidad":"1501-1990-01859","puesto":"Capataz Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1036":{"nombre":"Franklin Bartolo Raudales Andrade","identidad":"1503-2005-00553","puesto":"Deshije","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1000":{"nombre":"Gisela Marilu Aviles Almendares","identidad":"1501-1979-02603","puesto":"Cirugía y Deshoje","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1401":{"nombre":"Jaime Bayardo Rosales Pacheco","identidad":"1501-1992-01421","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1309":{"nombre":"Jaime Neptali Sanchez Sanchez","identidad":"1501-1992-00807","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1040":{"nombre":"Jose Efrain Ortiz","identidad":"1501-1999-01925","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0910":{"nombre":"Jose Luis Najera Espinoza","identidad":"1501-1995-00597","puesto":"Auxiliar de almacén central","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1068":{"nombre":"Karla Patricia Guzman Leiva","identidad":"1622-2001-00222","puesto":"Cirugía y Deshoje","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1053":{"nombre":"Kelin Jissela Flores Ordoñez","identidad":"1523-2004-01010","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1089":{"nombre":"Kenia Yadira Martinez Blandin","identidad":"1501-1998-01347","puesto":"Cirugía y Deshoje","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1269":{"nombre":"Kerin Alexander Martinez Gomez","identidad":"1523-1999-01292","puesto":"Fitosanitario","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1009":{"nombre":"Keydi Daniela Euceda Espinoza","identidad":"1501-2002-02279","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1262":{"nombre":"Kimberli Nicoll Avilez Alvarado","identidad":"1501-2002-00233","puesto":"Cirugía y Deshoje","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1038":{"nombre":"Luis Alberto Sanchez Irias","identidad":"1501-1990-03206","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1046":{"nombre":"Luis Alonzo Sanchez Carranza","identidad":"0201-1993-00158","puesto":"Deshije","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1451":{"nombre":"Luis Carlos Carcamo Zelaya","identidad":"1501-1985-02821","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1310":{"nombre":"Luis Enrique Zeledon Ortiz","identidad":"1501-1997-04220","puesto":"Fitosanitario","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1258":{"nombre":"Luisa Marisol Aviles Almendarez","identidad":"1101-2007-00131","puesto":"Cirugía y Deshoje","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1032":{"nombre":"Marnia Nasaria Raudales Andrade","identidad":"1503-1992-00908","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1086":{"nombre":"Melbin Alexander Cruz Turcios","identidad":"1503-1995-01251","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1015":{"nombre":"Miriam Maribel Villeda","identidad":"1503-1976-01344","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0339":{"nombre":"Mirian Suyapa Talavera Varela","identidad":"1501-1996-01572","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1001":{"nombre":"Nolin Argentina Reyes Chirinos","identidad":"1514-1993-00053","puesto":"Cirugía y Deshoje","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1041":{"nombre":"Osman Enrique Palma Cardenas","identidad":"1501-2003-01232","puesto":"Deshije","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1039":{"nombre":"Raul Antonio Sanchez Sanchez","identidad":"1523-1993-00052","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0837":{"nombre":"Rodolfo  Reyes Martinez","identidad":"1501-1978-00884","puesto":"Rondin de Finca","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0819":{"nombre":"Ronal Daniel Raudales Caceres","identidad":"1501-1993-04425","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1031":{"nombre":"Saira Rosmery Ruiz Valladares","identidad":"1509-1987-00060","puesto":"Cirugía y Deshoje","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1259":{"nombre":"Suamy Prady Ramirez Matute","identidad":"1502-1996-00354","puesto":"Cirugía y Deshoje","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1075":{"nombre":"Sulmy Sagrario Benitez Pineda","identidad":"1501-2001-01256","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1185":{"nombre":"Walter  Pineda Isaguirre","identidad":"1501-1984-04387","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0995":{"nombre":"Walter Leonel Aleman Moran","identidad":"0710-1979-00034","puesto":"Riego","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0162":{"nombre":"William Geovanny Murillo Pineda","identidad":"1501-2002-01416","puesto":"Deshije","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1012":{"nombre":"Wilson Roberto Ordoñez Elias","identidad":"1501-1997-01089","puesto":"Fitosanitario","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1010":{"nombre":"Yolani Elizabeth Euceda Espinoza","identidad":"1501-2000-00643","puesto":"Prácticas culturales","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP1069":{"nombre":"Zoila Esperanza Leiva Murillo","identidad":"1622-1985-00073","puesto":"Cirugía y Deshoje","departamento":"BUENA VISTA","division":"PRODUCCION FINCA"},"CBEP0284":{"nombre":"Adan Enrique Pacheco Calderon","identidad":"1518-1996-00133","puesto":"Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0605":{"nombre":"Adolfo Adalid Alaniz Valladares","identidad":"1501-1986-00941","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0517":{"nombre":"Adolfo de Jesus Garcia Rosa","identidad":"1501-2005-01074","puesto":"Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1137":{"nombre":"Alejandro  Cruz Marroquin","identidad":"0317-1964-00002","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0111":{"nombre":"Alex Javier Mayen Cruz","identidad":"1501-1993-00539","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1479":{"nombre":"Ana Patricia Torres","identidad":"1503-1980-00632","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1138":{"nombre":"Angel David Inestroza","identidad":"1501-2005-01637","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0512":{"nombre":"Angel Donaldo Lagos Carcamo","identidad":"0715-1991-00855","puesto":"Riego","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0046":{"nombre":"Angel Esteban Vasquez Elias","identidad":"1518-1995-00122","puesto":"Capataz Riego","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1480":{"nombre":"Angela Roxana Torres","identidad":"1501-2001-00904","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1360":{"nombre":"Arlo Fauricio Montez Flores","identidad":"0801-2004-15741","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0767":{"nombre":"Bairon Abel Bonilla Matute","identidad":"1501-2005-02274","puesto":"Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1166":{"nombre":"Blanca Elibenia Herrera Cuello","identidad":"1501-1996-02309","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1338":{"nombre":"Carlos Abel Herrera Casco","identidad":"1501-1975-01687","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0698":{"nombre":"Carlos Adonay Hernandez Hernandez","identidad":"1707-1985-01399","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0748":{"nombre":"Carlos Ernesto Henrriquez Antunez","identidad":"1508-1986-00439","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0148":{"nombre":"Carlos Francisco Rodriguez Herrera","identidad":"0615-1987-00758","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1324":{"nombre":"Carlos Josue Torres Rodriguez","identidad":"1501-1994-00541","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0137":{"nombre":"Carlos Junior Martinez Corrales","identidad":"0719-2002-00216","puesto":"Capataz Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1213":{"nombre":"Carlos Roberto Matute Pineda","identidad":"1501-1985-03170","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1184":{"nombre":"Carlos Yobany Murillo Lopez","identidad":"1501-2003-01645","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0469":{"nombre":"Celio Alejandro Rodriguez Espinal","identidad":"1518-1999-00047","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1226":{"nombre":"Cesar Augusto Herrera Diaz","identidad":"1501-1970-00391","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0646":{"nombre":"Cristhyan Adoney Moreno Zambrano","identidad":"0715-2006-00538","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1121":{"nombre":"Cristian Armando Peralta Bonilla","identidad":"1501-2002-00757","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1372":{"nombre":"Dania Arely Castro Herrera","identidad":"1501-1986-02294","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1200":{"nombre":"Daysi Nohemi Carranza Corrales","identidad":"1501-1981-00079","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0468":{"nombre":"Denis Ariel Martinez Pineda","identidad":"0703-1995-03740","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1290":{"nombre":"Denis Josue Ponce Mejia","identidad":"1522-2002-00384","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1327":{"nombre":"Dilmer Eduardo Vargas Torres","identidad":"1503-2006-02013","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0192":{"nombre":"Dixiana Esther Solorzano Martinez","identidad":"1501-1997-01105","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1467":{"nombre":"Dunia Lizeth Palma Galindo","identidad":"0719-2004-01717","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0648":{"nombre":"Ector Yovany Vasquez Vasquez","identidad":"0712-1983-00114","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0367":{"nombre":"Edis Oswaldo Velásquez Betanco","identidad":"1501-1983-00578","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0070":{"nombre":"Edwin Ariel Ordoñez Pavon","identidad":"1518-1997-00186","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0114":{"nombre":"Edy Leonardo Peralta Solorzano","identidad":"1518-1994-00169","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1328":{"nombre":"Eliezer Martin Navarro Cuellar","identidad":"1518-2002-00214","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1289":{"nombre":"Elmer Manuel Ponce Mejia","identidad":"1522-1986-00158","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0461":{"nombre":"Elmer Ubence Hernandez Zelaya","identidad":"0715-1987-00570","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1318":{"nombre":"Elvin Alexis Rodriguez Benitez","identidad":"1501-1988-01501","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0032":{"nombre":"Elvin Ernesto Cruz Puerto","identidad":"1511-1987-00056","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1142":{"nombre":"Elvin Josue Salinas Herrera","identidad":"0801-1994-07330","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0463":{"nombre":"Elvin Leonel Herrera Rodriguez","identidad":"1501-1979-01137","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0509":{"nombre":"Emerson Abel Herrera Herrera","identidad":"1501-2001-00591","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0399":{"nombre":"Emir Anael Ilias Rodriguez","identidad":"0715-2004-00186","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1478":{"nombre":"Eufemia De Jesus Lainez Acosta","identidad":"1505-1981-00463","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1214":{"nombre":"Ever Guillermo Enrique Garcia Rivera","identidad":"1501-2006-00278","puesto":"Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1157":{"nombre":"Ever Orestes Murillo Lopez","identidad":"1501-2006-00450","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0175":{"nombre":"Francisco Armando Escobar Rodriguez","identidad":"1501-1981-00980","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1316":{"nombre":"Francisco Roberto Hernandez Ortiz","identidad":"1807-1997-00849","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1344":{"nombre":"Franis Moices Cadenas Herrera","identidad":"1523-2005-00237","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1487":{"nombre":"Franklin Natanael Mejia Zuniga","identidad":"0719-2008-00272","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1491":{"nombre":"Gelin Claribel Alonzo Munguia","identidad":"1519-1989-00607","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1153":{"nombre":"Gerardo Enrique Perez Mancebo","identidad":"1518-1998-00027","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0021":{"nombre":"German Reinaldo Torres Rodriguez","identidad":"1501-1988-00220","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0456":{"nombre":"Gerson Eduardo Burgos Mercado","identidad":"1501-1993-04093","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0667":{"nombre":"Gerson Samael Zambrano Martinez","identidad":"0715-2001-00929","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0106":{"nombre":"Guillermo Neptaly Ordoñez Vargas","identidad":"0615-1995-00236","puesto":"Capataz Practicas Culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0110":{"nombre":"Hector Vidal Velasquez Betanco","identidad":"1501-1990-00394","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1420":{"nombre":"Irma Yulisa Turcios Castillo","identidad":"1501-1995-01551","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1462":{"nombre":"Isael Antonio Casco Menjivar","identidad":"1501-1983-01743","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0515":{"nombre":"Isaias Leodan Herrera Guzman","identidad":"1518-1999-00156","puesto":"Riego","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1418":{"nombre":"Jamie Sarahi Zelaya Moncada","identidad":"0502-2003-02341","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1291":{"nombre":"Jarvin Manuel Ponce Almendarez","identidad":"1514-2007-00074","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0459":{"nombre":"Jefry Ramon Moreno Zambrano","identidad":"1501-2000-01628","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1128":{"nombre":"Jesus Antonio Castillo Palma","identidad":"0801-2006-17568","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0840":{"nombre":"Jesus Benigno Castillo Moreno","identidad":"1501-1983-02351","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1423":{"nombre":"Johana Mercedes Vaquedano Espinoza","identidad":"0801-1990-12683","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1286":{"nombre":"Jonathan Maudiel Martinez Castro","identidad":"1501-2004-00627","puesto":"Riego","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1402":{"nombre":"Jorge Ivan Urbina Matute","identidad":"1501-1986-02054","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0766":{"nombre":"Jose Adan Matute Diaz","identidad":"1501-2001-00864","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1325":{"nombre":"Jose Alexander Mendoza Tercero","identidad":"1501-1990-00303","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1455":{"nombre":"Jose Alexis Mendoza Guevara","identidad":"1501-2008-00625","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0073":{"nombre":"Jose Antonio Rosales Cruz","identidad":"1501-2001-01203","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1405":{"nombre":"Jose Ceferino Rodriguez Tercero","identidad":"1501-1993-03585","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1321":{"nombre":"Jose David Figueroa Vasquez","identidad":"1518-1995-00013","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1160":{"nombre":"Jose Eleazar Carranza Corrales","identidad":"1501-1986-00537","puesto":"Colaborador de Campo","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0071":{"nombre":"Jose Isai Espinal Izaguirre","identidad":"1501-1993-02180","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0140":{"nombre":"Jose Isaias Alvarez Medina","identidad":"1518-1997-00244","puesto":"Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1359":{"nombre":"Jose Luis Rodriguez Garcia","identidad":"1501-1994-00325","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1412":{"nombre":"Jose Manuel Espinal Izaguirre","identidad":"1501-1986-02397","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1320":{"nombre":"Jose Maria Sierra Escalante","identidad":"0615-1984-00622","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0181":{"nombre":"Jose Ruben Hernández Diaz","identidad":"1518-2003-00044","puesto":"Riego","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0555":{"nombre":"Josue Rafael Sandoval Valladares","identidad":"1501-1993-00279","puesto":"Capataz de Sacado de Cormo","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1169":{"nombre":"Juan Carlos Herrera Guzman","identidad":"1518-1983-00202","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0390":{"nombre":"Justo Nicolas Chacon Martinez","identidad":"1501-1990-02829","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1097":{"nombre":"Kevin Ariel Nuñez Martinez","identidad":"0802-2006-00071","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0017":{"nombre":"Kevin Josue Bonilla Figueroa","identidad":"1518-1994-00129","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0357":{"nombre":"Kleimer Donaldo Romero Castro","identidad":"1501-2003-01840","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0243":{"nombre":"Leonel Alonzo Lobo Ordoñez","identidad":"1518-1999-00224","puesto":"Riego","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1107":{"nombre":"Leonel Antonio Lopez Diaz","identidad":"0719-1999-01516","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0168":{"nombre":"Leonel de Jesus Rodrigues Rivera","identidad":"1518-1991-00036","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0268":{"nombre":"Levi Javier Mejia Valladares","identidad":"1502-1987-00197","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1008":{"nombre":"Lixsy Maria Torres Barahona","identidad":"1521-2000-00199","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0280":{"nombre":"Luis Alberto Torres Rodriguez","identidad":"1501-1986-02256","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0247":{"nombre":"Luis Javier Andrade Garcia","identidad":"1501-2000-02479","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1481":{"nombre":"Maria Angela Moreno Montoya","identidad":"1501-1986-01649","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1428":{"nombre":"Maria Elena Rodriguez Murillo","identidad":"1622-1998-00283","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1477":{"nombre":"Maria Elizabeth Reyes Espinal","identidad":"1501-2001-00822","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1489":{"nombre":"Maria Francisca Ramirez Vasquez","identidad":"0404-2002-01130","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0685":{"nombre":"Maria Socorro Lainez","identidad":"0703-1977-03054","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0023":{"nombre":"Mario Josue Guillen Ortega","identidad":"1501-2006-00789","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1170":{"nombre":"Melvin Leonel Ponce Mendez","identidad":"1519-1996-00093","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0035":{"nombre":"Melvin Roberto Matute Palma","identidad":"1501-2003-00715","puesto":"Riego","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1472":{"nombre":"Mercedes Carolina Ventura Ortiz","identidad":"1501-1985-05392","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1202":{"nombre":"Milda Susana Ortiz Alonzo","identidad":"1510-1972-00113","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1380":{"nombre":"Milton David Herrera Casco","identidad":"1501-2002-00593","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1482":{"nombre":"Milton Noel Medina Palacios","identidad":"1501-2000-00528","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1163":{"nombre":"Milton Orlando Ramos Gomez","identidad":"0703-1981-02459","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1342":{"nombre":"Milton Yovany Diaz Padilla","identidad":"1510-2003-00070","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1488":{"nombre":"Mireila Judith Calix Caceres","identidad":"1501-1983-00523","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1492":{"nombre":"Mirian Eloisa Canales Diaz","identidad":"1501-1991-01432","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0502":{"nombre":"Misael Ananias Sandoval Valladares","identidad":"1518-1994-00102","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0191":{"nombre":"Nely Yolany Rodriguez Herrrera","identidad":"0615-1993-00505","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0841":{"nombre":"Nerlin Emil Mairena Sierra","identidad":"0703-1998-00844","puesto":"Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1301":{"nombre":"Nixon Johnael Sanchez Rodriguez","identidad":"1501-2001-00792","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1027":{"nombre":"Noel Adalberto Ortiz Ortiz","identidad":"1510-2000-00260","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1305":{"nombre":"Nolvin Alfredo Perez Mancebo","identidad":"0709-1988-00079","puesto":"Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0053":{"nombre":"Olvin Alexander Martinez Betanco","identidad":"1501-2000-01766","puesto":"Capataz Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1243":{"nombre":"Orlin Gustavo Lopez Colindres","identidad":"0810-1997-00057","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0513":{"nombre":"Oscar Andres Herrera Pinel","identidad":"1501-2004-00653","puesto":"Riego","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1083":{"nombre":"Oscar Francisco Castro Echeverria","identidad":"1503-2004-02575","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1322":{"nombre":"Oscar Rubilio Torres Rodriguez","identidad":"1501-1985-02369","puesto":"Rondin de Finca","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1207":{"nombre":"Osman Jasiel Caballero Hernandez","identidad":"1506-2006-00020","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0420":{"nombre":"Osman Marin Hernandez Soto","identidad":"0703-1983-00139","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1456":{"nombre":"Ramon Antonio Gonzales Pagoada","identidad":"1501-1960-00353","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1026":{"nombre":"Ramon De Jesus Ortiz Abila","identidad":"1510-1975-00102","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0996":{"nombre":"Ricardo Anael Almendarez Miralda","identidad":"1522-1999-00008","puesto":"Riego","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0144":{"nombre":"Roberto Edelio Banegas","identidad":"0201-1982-00301","puesto":"Capataz cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1093":{"nombre":"Rony Geovanny Herrera Hernandez","identidad":"1518-2006-00036","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1417":{"nombre":"Roxana Alejandrina Rosales Turcios","identidad":"1501-1991-01728","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0153":{"nombre":"Santos Mateo Rodas Garcia","identidad":"1505-1993-00713","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0804":{"nombre":"Santos Ramon Henrriquez Veliz","identidad":"1518-1983-00195","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1469":{"nombre":"Sara Elizabeth Cruz Corrales","identidad":"1518-1989-00032","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1358":{"nombre":"Selvin Jaudiel Baca Andrade","identidad":"1518-1994-00141","puesto":"Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1074":{"nombre":"Sergio  Aguilera Mejia","identidad":"1501-1997-01278","puesto":"Deshije","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0533":{"nombre":"Silian Alfredo Velasquez Betanco","identidad":"1501-1988-00337","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1044":{"nombre":"Tayron Leonel Rodriguez Pineda","identidad":"1501-2003-01273","puesto":"Deshije","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1271":{"nombre":"Tony Emilson Ruiz Calix","identidad":"1512-1988-00087","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1369":{"nombre":"Victor Manuel Martinez Gaitan","identidad":"1501-1973-01192","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1073":{"nombre":"Vildahi  Carranza Corrales","identidad":"1501-1997-01333","puesto":"Deshije","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1476":{"nombre":"Wendi Carolina Gaitan Casco","identidad":"0801-1999-06563","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0797":{"nombre":"Wil Anael Zelaya Flores","identidad":"0715-1993-00443","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0100":{"nombre":"Wilber Leonel Martinez Betanco","identidad":"1501-1998-02390","puesto":"Fitosanitario","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0026":{"nombre":"Wilfredo  Hernandez Acosta","identidad":"0107-1980-03290","puesto":"Capataz siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0426":{"nombre":"Wilian Misael Turcios","identidad":"1501-1997-01305","puesto":"Cosecha","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1339":{"nombre":"Wilson Fernando Banegas Bustamante","identidad":"1523-1993-00110","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1490":{"nombre":"Yensy Dayany Betanco Zambrano","identidad":"1501-2008-02420","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0350":{"nombre":"Yerlin Gerardo Diaz Rios","identidad":"0703-2000-02193","puesto":"Riego","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1403":{"nombre":"Yery Ivan Maradiaga Vargas","identidad":"1523-1995-00640","puesto":"Prácticas culturales","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1432":{"nombre":"Yesica Ludibeth Sanchez Quiroz","identidad":"0601-1996-02791","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP0022":{"nombre":"Yimi Wilfredo Figueroa Matute","identidad":"1501-2003-00606","puesto":"Siembra","departamento":"CAYO BLANCO","division":"PRODUCCION FINCA"},"CBEP1357":{"nombre":"Anderson Leandro Turcios Argeñal","identidad":"1501-1995-01923","puesto":"Riego","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1220":{"nombre":"Andres Alfaro Flores Martinez","identidad":"1501-1986-02408","puesto":"Rondin de Finca","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1348":{"nombre":"Angel Humberto Turcios Turcios","identidad":"1501-2003-02270","puesto":"Riego","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1297":{"nombre":"Armando  Espinal Gonzalez","identidad":"0703-1978-03913","puesto":"Fitosanitario","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1388":{"nombre":"Carlos Aduardo Ulloa Castillo","identidad":"1505-2003-00049","puesto":"Fitosanitario","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1387":{"nombre":"Cristian Alexander Zelaya Mercado","identidad":"1516-2007-00026","puesto":"Fitosanitario","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1414":{"nombre":"Delmer Alejandro Hernandez Sanchez","identidad":"1523-1998-00923","puesto":"Riego","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1382":{"nombre":"Eber Josue Hernandez Figueroa","identidad":"1510-1993-00397","puesto":"Riego","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1347":{"nombre":"Edwin Onasis Vallecillo Maldonado","identidad":"1523-1994-00940","puesto":"Riego","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP0818":{"nombre":"Gerson David Ruiz Caceres","identidad":"1501-1998-01535","puesto":"Riego","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1056":{"nombre":"Joise Waleska Torrez Lopez","identidad":"1501-1997-04481","puesto":"Prácticas culturales","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP0388":{"nombre":"Jose Luis Matute Valladares","identidad":"1501-1993-04242","puesto":"Mantenimiento de finca","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1275":{"nombre":"Juan Manuel Melendez Avila","identidad":"1502-1994-00224","puesto":"Prácticas culturales","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP0967":{"nombre":"Luis Arturo Murillo Fernandez","identidad":"1502-1986-00413","puesto":"Fitosanitario","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP0815":{"nombre":"Oscar Armando Orellana Caceres","identidad":"1501-2000-00812","puesto":"Fitosanitario","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1051":{"nombre":"Osman Efrain Herrera","identidad":"0703-1974-02009","puesto":"Riego","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP0816":{"nombre":"Owen Xabier Ardon Montalvan","identidad":"1501-2005-00617","puesto":"Deshije","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1431":{"nombre":"Santos Isaul Escobar Padilla","identidad":"0209-1990-00660","puesto":"Prácticas culturales","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1206":{"nombre":"Teodoro  Bolaños Gomez","identidad":"1501-1993-01803","puesto":"Deshije","departamento":"GUANACASTALES","division":"PRODUCCION FINCA"},"CBEP1406":{"nombre":"Ariel Alberto Benitez Medina","identidad":"1501-1991-02438","puesto":"Ingenieria Agrícola","departamento":"INGENIERIA CIVIL","division":"PRODUCCION FINCA"},"CBEP1211":{"nombre":"Brayan Gerardo Cerna Calix","identidad":"0502-1999-00113","puesto":"Ingenieria Agrícola","departamento":"INGENIERIA CIVIL","division":"PRODUCCION FINCA"},"CBEP0455":{"nombre":"Rafael Antonio Solis Solis","identidad":"1506-1987-00111","puesto":"Ingenieria Agrícola","departamento":"INGENIERIA CIVIL","division":"PRODUCCION FINCA"},"CBEP0573":{"nombre":"Anderson Alexander Mayorquin Sanchez","identidad":"1518-1997-00106","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0561":{"nombre":"Brando Lean Pacheco Castro","identidad":"1501-1998-00881","puesto":"Capataz mantenimiento de finca","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP1175":{"nombre":"Carlos Anibal Flores Sandres","identidad":"1501-1977-00165","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0639":{"nombre":"Eduar David Paguada Erazo","identidad":"1518-2004-00163","puesto":"Fitosanitario","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0578":{"nombre":"Elias Omar Fino Colindres","identidad":"1518-1983-00079","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP1064":{"nombre":"Emilio  Lagos Martinez","identidad":"1501-1978-02026","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0872":{"nombre":"Fernanda Lizeth Vargas Lobo","identidad":"1503-2003-00231","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0689":{"nombre":"Gilder Nectaly Herrera Aviles","identidad":"1516-1985-00236","puesto":"Rondin de Finca","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP1019":{"nombre":"Jeferson Reynel Vasquez Casco","identidad":"1501-2000-01940","puesto":"Fitosanitario","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0724":{"nombre":"Jenis Adrian Mejia Cartagena","identidad":"1514-1996-00042","puesto":"Riego","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP1003":{"nombre":"Jose Francisco Lopez Borjas","identidad":"1517-1993-00101","puesto":"Riego","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0658":{"nombre":"Julian Ismael Ortiz Jiménez","identidad":"1518-1989-00011","puesto":"Fitosanitario","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0908":{"nombre":"Mabelin Sarai Escobar Rodriguez","identidad":"1503-2003-00190","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0671":{"nombre":"Marcos Antonio Rochez Funez","identidad":"0801-1988-10231","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0586":{"nombre":"Marlon Noe Pagoada Munguia","identidad":"1518-1983-00021","puesto":"Riego","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0878":{"nombre":"Milagro Lili Euceda Corea","identidad":"1503-1992-00598","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0590":{"nombre":"Nelson Nahun Flores Ortiz","identidad":"1518-1989-00180","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP1496":{"nombre":"Rosa Emilia Maradiaga Aplicano","identidad":"1503-1995-02051","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP1082":{"nombre":"Seily Maricela Escoto","identidad":"1503-1989-00165","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0618":{"nombre":"Sofia Elizabeth Garcia Velasquez","identidad":"1518-2000-00145","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0746":{"nombre":"Walter Joel Benitez Blanco","identidad":"1503-2004-02603","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP1192":{"nombre":"Yasnary Jaqueline Lagos Ventura","identidad":"1523-2004-00636","puesto":"Prácticas culturales","departamento":"SIBONEY","division":"PRODUCCION FINCA"},"CBEP0025":{"nombre":"Brandon Emanuel Solis Murillo","identidad":"1501-2002-02462","puesto":"Taller","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0143":{"nombre":"Carlos Daniel Murillo Torres","identidad":"1501-2002-00782","puesto":"Taller","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0010":{"nombre":"Carlos Roberto Moradel Mercado","identidad":"1501-1977-01616","puesto":"Tractorista","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0055":{"nombre":"Joel Fernando Rosales Murillo","identidad":"1501-1992-01955","puesto":"Taller","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0679":{"nombre":"Jose Daniel Breve Gonzales","identidad":"1518-2000-00139","puesto":"Taller","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0574":{"nombre":"Jose Luis Ortiz Jimenez","identidad":"1701-1976-01339","puesto":"Tractorista","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0430":{"nombre":"Jose Manuel Murillo Casco","identidad":"0801-1992-11768","puesto":"Tractorista","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0081":{"nombre":"Melvin Alexander Osorio Diaz","identidad":"1501-1997-05085","puesto":"Taller","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0777":{"nombre":"Melvin Jose Maldonado Cardona","identidad":"1503-2005-00409","puesto":"Tractorista","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0635":{"nombre":"Ramon Antonio Guevara Vasquez","identidad":"0601-1997-02866","puesto":"Yardero/taller","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0569":{"nombre":"Yelsin Oniel Ortiz Cisnado","identidad":"1518-1998-00220","puesto":"Tractorista","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0105":{"nombre":"Yohon Jairon Cruz Coellar","identidad":"1501-1996-00041","puesto":"Taller","departamento":"TALLER","division":"PRODUCCION FINCA"},"CBEP0419":{"nombre":"Elvin Ronaldo Herrera Hernandez","identidad":"1518-2005-00013","puesto":"Colaborador temporal","departamento":"TEMPORALES","division":"PRODUCCION FINCA"},"CBEP1453":{"nombre":"Gabriela Silohe Cruz Zelaya","identidad":"1501-2007-01197","puesto":"Colaborador temporal","departamento":"TEMPORALES","division":"PRODUCCION FINCA"},"CBEP1280":{"nombre":"Geremias Enrique Moya Andino","identidad":"1501-1981-00691","puesto":"Colaborador temporal","departamento":"TEMPORALES","division":"PRODUCCION FINCA"},"CBEP1438":{"nombre":"Ivanna Gisselle Garcia Solis","identidad":"1501-2006-00965","puesto":"Colaborador temporal","departamento":"TEMPORALES","division":"PRODUCCION FINCA"},"CBEP0891":{"nombre":"Jaime Eduardo Martinez Acosta","identidad":"1501-1999-01589","puesto":"Colaborador temporal","departamento":"TEMPORALES","division":"PRODUCCION FINCA"},"CBEP0275":{"nombre":"Jany Marisol Garcia Arce","identidad":"1518-1987-00090","puesto":"Colaborador temporal","departamento":"TEMPORALES","division":"PRODUCCION FINCA"},"CBEP1494":{"nombre":"Santos Keni Matute Diaz","identidad":"1501-2006-02245","puesto":"Colaborador temporal","departamento":"TEMPORALES","division":"PRODUCCION FINCA"},"CBEP1366":{"nombre":"Walter Misael Cadenas Herrera","identidad":"1523-2003-00661","puesto":"Colaborador temporal","departamento":"TEMPORALES","division":"PRODUCCION FINCA"},"CBEP0572":{"nombre":"Abel Antonio Betanco Montoya","identidad":"0605-1991-00045","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0904":{"nombre":"Abel Eduardo Hernandez Ruiz","identidad":"1518-2005-00041","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1409":{"nombre":"Alex David Hernandez Aleman","identidad":"1518-1986-00205","puesto":"Cirugía y Deshoje","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1498":{"nombre":"Alex Isaias Alvarado Alvarado","identidad":"1518-1994-00040","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0788":{"nombre":"Angelica Francisca Erazo Molina","identidad":"1520-1993-00286","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0760":{"nombre":"Blas Arturo Escobar Osorio","identidad":"1503-2000-02591","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0563":{"nombre":"Carlos Ramon Flores Ortiz","identidad":"1503-2002-00745","puesto":"Fitosanitario","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0853":{"nombre":"Carlos Selin Alvarado Alvarado","identidad":"1518-1995-00021","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0617":{"nombre":"Elsa Patricia Posada Vasquez","identidad":"1518-1990-00121","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0593":{"nombre":"Elvin Dario Zapata Erazo","identidad":"1518-1997-00160","puesto":"Capataz de Control de Malezas","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1191":{"nombre":"Elvis Alexi Alvarado Alvarado","identidad":"1518-1998-00076","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0565":{"nombre":"Ever Noel Sanchez Murillo","identidad":"1518-1988-00224","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1497":{"nombre":"Franklin Armando Ordoñez Duarte","identidad":"1518-2008-00017","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0615":{"nombre":"Fredy Fernando Sabonge Figueroa","identidad":"1518-1994-00059","puesto":"Fitosanitario","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0611":{"nombre":"Gerardo Gabriel Velasquez Pacheco","identidad":"1501-1989-01356","puesto":"Riego","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0789":{"nombre":"Gloria Del Carmen Jimenez Medina","identidad":"1505-1988-00686","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0957":{"nombre":"Hayder Samuel Zelaya Lobo","identidad":"1523-1999-01048","puesto":"Capataz Fitosanitario","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1190":{"nombre":"Idania Eliseth Ayala Godoy","identidad":"1518-1988-00033","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0854":{"nombre":"Jose Alexander Vargas Garcia","identidad":"1503-2001-02849","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0830":{"nombre":"Jose Ariel Garcia Martinez","identidad":"1503-1996-01749","puesto":"Riego","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1254":{"nombre":"Jose Joel Maldonado","identidad":"1518-2010-00078","puesto":"Riego","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0583":{"nombre":"Juan Pablo Erazo Rivera","identidad":"1503-1993-01050","puesto":"Capataz mantenimiento de finca","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1447":{"nombre":"Larissa Carolina Zelaya Lobo","identidad":"1523-2007-00801","puesto":"Colaborador de Campo","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0584":{"nombre":"Luis Fernando Espinal Moradel","identidad":"1518-1995-00045","puesto":"Riego","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1499":{"nombre":"Maria Dilcia Avila Martinez","identidad":"1518-1997-00215","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0587":{"nombre":"Miguel Gilberto Ruiz Motiño","identidad":"1501-1984-00012","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0722":{"nombre":"Nelton Hodimir Ulloa Montoya","identidad":"1507-1995-00229","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1385":{"nombre":"Nicolas  Melendez Garcia","identidad":"0306-1990-00485","puesto":"Fitosanitario","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0768":{"nombre":"Oneyda Diamantina Cruz","identidad":"1518-1974-00034","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0571":{"nombre":"Oscar Isidro Sánchez Castro","identidad":"1518-2006-00107","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0862":{"nombre":"Redin Omar Lobo Castro","identidad":"1503-1981-00568","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0898":{"nombre":"Reynaldo Noel Ulloa Montoya","identidad":"1507-1994-00132","puesto":"Fitosanitario","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0905":{"nombre":"Ronal Yohel Sanchez Erazo","identidad":"1518-2006-00028","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0621":{"nombre":"Rosa Carolina Alvarado Alvarado","identidad":"1518-2005-00054","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP0603":{"nombre":"Rosel Roberto Ulloa Montoya","identidad":"1507-1994-00130","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1495":{"nombre":"Yefri Josue Lagos Ventura","identidad":"1520-2006-01051","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"},"CBEP1194":{"nombre":"Yohana Banessa Sabonge Figueroa","identidad":"1518-2004-00142","puesto":"Prácticas culturales","departamento":"ZELVAS","division":"PRODUCCION FINCA"}};

function normalizarCodigoCarnet(valor) {
    return String(valor || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");
}

function mostrarCarnetEmpleado() {
    const input = document.getElementById("codigoCarnet");
    const resultado = document.getElementById("carnetResultado");
    const mensaje = document.getElementById("carnetMensaje");

    if (!input || !resultado || !mensaje) {
        return;
    }

    const codigo = normalizarCodigoCarnet(input.value);
    input.value = codigo;
    mensaje.textContent = "";

    if (!codigo) {
        resultado.classList.add("oculto");
        mensaje.textContent = "Ingresa tu código de empleado.";
        return;
    }

    const empleado = BASE_EMPLEADOS_CARNET[codigo];

    if (!empleado) {
        resultado.classList.add("oculto");
        mensaje.textContent = "No se encontró un empleado con ese código.";
        return;
    }

    const nombre = empleado.nombre || "SIN NOMBRE";

    document.getElementById("carnetNombre").textContent = nombre;
    document.getElementById("carnetCodigo").textContent = codigo;
    document.getElementById("carnetIdentidad").textContent =
        empleado.identidad || "—";
    document.getElementById("carnetPuesto").textContent =
        empleado.puesto || "—";
    document.getElementById("carnetDepartamento").textContent =
        empleado.departamento || "—";
    document.getElementById("carnetDivision").textContent =
        empleado.division || "—";

    resultado.classList.remove("oculto");
}

function iniciarCarnetEmpleado() {
    const boton = document.getElementById("btnConsultarCarnet");
    const input = document.getElementById("codigoCarnet");

    if (!boton || !input) {
        return;
    }

    boton.addEventListener("click", mostrarCarnetEmpleado);

    input.addEventListener("keydown", function(evento) {
        if (evento.key === "Enter") {
            evento.preventDefault();
            mostrarCarnetEmpleado();
        }
    });
}

document.addEventListener(
    "DOMContentLoaded",
    iniciarCarnetEmpleado
);

