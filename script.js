// ============================================================
// PORTAL DE PERSONAL - AGROINDUSTRIAS CAYO BLANCO
// ============================================================

// ------------------------------------------------------------
// CONFIGURACIÓN SUPABASE
// ------------------------------------------------------------

const SUPABASE_URL = "TU_SUPABASE_URL";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY";

// ------------------------------------------------------------
// ELEMENTOS
// ------------------------------------------------------------

const pantallaAcceso = document.getElementById("pantallaAcceso");
const resultado = document.getElementById("resultado");
const visor = document.getElementById("visor");

const codigoInput = document.getElementById("codigo");
const buscarBtn = document.getElementById("buscar");
const mensaje = document.getElementById("mensaje");

const nombreEmpleado = document.getElementById("nombreEmpleado");
const codigoEmpleado = document.getElementById("codigoEmpleado");

const nuevaConsulta = document.getElementById("nuevaConsulta");

const abrirCarnet = document.getElementById("abrirCarnet");
const modalCarnet = document.getElementById("modalCarnet");
const carnetResultado = document.getElementById("carnetResultado");
const carnetMensaje = document.getElementById("carnetMensaje");

const carnetNombre = document.getElementById("carnetNombre");
const carnetCodigo = document.getElementById("carnetCodigo");
const carnetIdentidad = document.getElementById("carnetIdentidad");
const carnetPuesto = document.getElementById("carnetPuesto");
const carnetDepartamento = document.getElementById("carnetDepartamento");
const carnetDivision = document.getElementById("carnetDivision");

const verQ1 = document.getElementById("verQ1");
const verQ2 = document.getElementById("verQ2");

const visorTitulo = document.getElementById("visorTitulo");
const cerrarVisor = document.getElementById("cerrarVisor");
const guardarRecibo = document.getElementById("guardarRecibo");


// ------------------------------------------------------------
// ESTADO ACTUAL
// ------------------------------------------------------------

let empleadoActual = null;
let reciboActual = null;


// ------------------------------------------------------------
// UTILIDADES
// ------------------------------------------------------------

function mostrarMensaje(texto, tipo = "") {
    mensaje.textContent = texto;
    mensaje.className = "message";

    if (tipo) {
        mensaje.classList.add(tipo);
    }
}


function limpiarMensaje() {
    mensaje.textContent = "";
    mensaje.className = "message";
}


function normalizarCodigo(codigo) {
    return String(codigo || "")
        .trim()
        .toUpperCase();
}


function ocultar(elemento) {
    if (elemento) {
        elemento.classList.add("oculto");
    }
}


function mostrar(elemento) {
    if (elemento) {
        elemento.classList.remove("oculto");
    }
}


// ------------------------------------------------------------
// CONSULTAR EMPLEADO
// ------------------------------------------------------------

async function consultarEmpleado(codigo) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/consultar_empleado`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            },

            body: JSON.stringify({
                p_codigo: codigo
            })
        }
    );

    if (!response.ok) {

        let errorTexto = "No fue posible consultar el empleado.";

        try {
            const errorData = await response.json();

            if (errorData.message) {
                errorTexto = errorData.message;
            }

            if (errorData.hint) {
                console.error("Supabase hint:", errorData.hint);
            }

        } catch (e) {
            console.error(e);
        }

        throw new Error(errorTexto);
    }

    return await response.json();
}


// ------------------------------------------------------------
// BOTÓN BUSCAR
// ------------------------------------------------------------

buscarBtn.addEventListener("click", async () => {

    const codigo = normalizarCodigo(codigoInput.value);

    limpiarMensaje();

    if (!codigo) {

        mostrarMensaje(
            "Ingresa tu código de empleado.",
            "error"
        );

        codigoInput.focus();
        return;
    }


    buscarBtn.disabled = true;
    buscarBtn.innerHTML = "Consultando...";


    try {

        console.log("Consultando empleado:", codigo);

        const resultadoEmpleado = await consultarEmpleado(codigo);

        console.log("Respuesta Supabase:", resultadoEmpleado);


        // ----------------------------------------------------
        // LA FUNCIÓN DEVUELVE UN JSON
        // ----------------------------------------------------

        if (!resultadoEmpleado) {

            mostrarMensaje(
                "No se encontró ningún colaborador con ese código.",
                "error"
            );

            return;
        }


        empleadoActual = resultadoEmpleado;


        // ----------------------------------------------------
        // MOSTRAR DATOS PRINCIPALES
        // ----------------------------------------------------

        nombreEmpleado.textContent =
            resultadoEmpleado.name ||
            resultadoEmpleado.nombre ||
            "Colaborador";

        codigoEmpleado.textContent =
            resultadoEmpleado.code ||
            resultadoEmpleado.codigo ||
            codigo;


        // ----------------------------------------------------
        // OCULTAR ACCESO
        // ----------------------------------------------------

        ocultar(pantallaAcceso);

        // ----------------------------------------------------
        // MOSTRAR PANEL DEL EMPLEADO
        // ----------------------------------------------------

        mostrar(resultado);


        console.log(
            "Empleado encontrado:",
            empleadoActual
        );

    } catch (error) {

        console.error(
            "Error consultando empleado:",
            error
        );

        mostrarMensaje(
            "No fue posible consultar el código. Inténtalo nuevamente.",
            "error"
        );

    } finally {

        buscarBtn.disabled = false;
        buscarBtn.innerHTML = 'Continuar <span>→</span>';
    }

});


// ------------------------------------------------------------
// ENTER EN EL CAMPO DE CÓDIGO
// ------------------------------------------------------------

codigoInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        buscarBtn.click();
    }

});


// ------------------------------------------------------------
// CAMBIAR CÓDIGO
// ------------------------------------------------------------

nuevaConsulta.addEventListener("click", () => {

    empleadoActual = null;

    codigoInput.value = "";

    limpiarMensaje();

    ocultar(resultado);
    ocultar(visor);

    mostrar(pantallaAcceso);

    codigoInput.focus();

});


// ------------------------------------------------------------
// CARNET
// ------------------------------------------------------------

abrirCarnet.addEventListener("click", () => {

    if (!empleadoActual) {
        return;
    }

    carnetMensaje.textContent = "";

    // Mostrar información del empleado

    carnetNombre.textContent =
        empleadoActual.name ||
        empleadoActual.nombre ||
        "—";

    carnetCodigo.textContent =
        empleadoActual.code ||
        empleadoActual.codigo ||
        "—";

    carnetIdentidad.textContent =
        empleadoActual.identity ||
        empleadoActual.identidad ||
        "—";

    carnetPuesto.textContent =
        empleadoActual.position ||
        empleadoActual.puesto ||
        "—";

    carnetDepartamento.textContent =
        empleadoActual.department ||
        empleadoActual.departamento ||
        "—";

    carnetDivision.textContent =
        empleadoActual.division ||
        empleadoActual.finca ||
        "—";


    mostrar(carnetResultado);
    mostrar(modalCarnet);

});


// ------------------------------------------------------------
// CERRAR MODAL
// ------------------------------------------------------------

document.querySelectorAll("[data-cerrar-modal]").forEach((boton) => {

    boton.addEventListener("click", () => {
        ocultar(modalCarnet);
    });

});


// ------------------------------------------------------------
// CERRAR MODAL HACIENDO CLICK FUERA
// ------------------------------------------------------------

modalCarnet.addEventListener("click", (event) => {

    if (event.target === modalCarnet) {
        ocultar(modalCarnet);
    }

});


// ------------------------------------------------------------
// RECIBOS
// ------------------------------------------------------------

verQ1.addEventListener("click", () => {

    abrirRecibo(1);

});


verQ2.addEventListener("click", () => {

    abrirRecibo(2);

});


function abrirRecibo(numeroQuincena) {

    if (!empleadoActual) {
        return;
    }


    if (numeroQuincena === 1) {

        visorTitulo.textContent =
            "Recibo Quincena 1";

    } else {

        visorTitulo.textContent =
            "Recibo Quincena 2";

    }


    reciboActual = {
        codigo:
            empleadoActual.code ||
            empleadoActual.codigo,

        quincena: numeroQuincena
    };


    mostrar(resultado);
    mostrar(visor);


    const visorPDF =
        document.querySelector(".visor-pdf");

    if (visorPDF) {

        visorPDF.innerHTML = `
            <div class="visor-mensaje">
                El visor de recibos está preparado.
            </div>
        `;

    }

}


// ------------------------------------------------------------
// CERRAR VISOR
// ------------------------------------------------------------

cerrarVisor.addEventListener("click", () => {

    ocultar(visor);

    reciboActual = null;

});


// ------------------------------------------------------------
// GUARDAR RECIBO
// ------------------------------------------------------------

guardarRecibo.addEventListener("click", () => {

    if (!reciboActual) {
        return;
    }

    console.log(
        "Guardar recibo:",
        reciboActual
    );

});


// ------------------------------------------------------------
// INICIO
// ------------------------------------------------------------

console.log(
    "Portal de Personal iniciado correctamente."
);
