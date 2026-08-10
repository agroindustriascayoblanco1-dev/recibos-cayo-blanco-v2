// ==========================================
// RECIBOS COA - VERSIÓN 2
// ==========================================

// ------------------------------------------
// DATOS TEMPORALES PARA LA PRUEBA
// ------------------------------------------
//
// Por ahora utilizaremos un empleado de prueba.
// Más adelante aquí conectaremos los datos reales.
//

const empleados = {

    "CBEP0000": {
        nombre: "Empleado de Prueba",
        quincena1: true,
        quincena2: true
    }

};


// ==========================================
// ELEMENTOS DE LA PÁGINA
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
// BUSCAR EMPLEADO
// ==========================================

function buscarEmpleado() {

    const codigo = codigoInput.value
        .trim()
        .toUpperCase();


    // --------------------------------------
    // Validar que se haya escrito algo
    // --------------------------------------

    if (codigo === "") {

        mostrarMensaje(
            "⚠️ Ingresa tu código de empleado.",
            "error"
        );

        return;
    }


    // --------------------------------------
    // Buscar empleado
    // --------------------------------------

    const empleado = empleados[codigo];


    if (!empleado) {

        mostrarMensaje(
            "❌ No encontramos un empleado con ese código.",
            "error"
        );

        resultado.classList.add("oculto");

        return;
    }


    // --------------------------------------
    // Empleado encontrado
    // --------------------------------------

    mostrarMensaje(
        "✓ Empleado encontrado correctamente.",
        "exito"
    );


    nombreEmpleado.textContent =
        empleado.nombre;

    codigoEmpleado.textContent =
        codigo;


    resultado.classList.remove("oculto");


    // Ir automáticamente al resultado

    resultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// MOSTRAR MENSAJES
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
// ABRIR RECIBO
// ==========================================

function abrirRecibo(quincena) {

    if (quincena === "1") {

        visorTitulo.textContent =
            "Recibo — Quincena 1";

    }

    if (quincena === "2") {

        visorTitulo.textContent =
            "Recibo — Quincena 2";

    }


    visor.classList.remove("oculto");


    visor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================
// BOTONES DE QUINCENA
// ==========================================

const botonesRecibo =
    document.querySelectorAll(".ver-recibo");


botonesRecibo.forEach(function (boton) {

    boton.addEventListener(
        "click",
        function () {

            const quincena =
                boton.dataset.quincena;

            abrirRecibo(quincena);

        }
    );

});


// ==========================================
// CERRAR VISOR
// ==========================================

cerrarVisor.addEventListener(
    "click",
    function () {

        visor.classList.add("oculto");

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

        resultado.classList.add("oculto");

        visor.classList.add("oculto");

        codigoInput.focus();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


// ==========================================
// BOTÓN BUSCAR
// ==========================================

botonBuscar.addEventListener(
    "click",
    buscarEmpleado
);


// ==========================================
// ENTER EN EL CÓDIGO
// ==========================================

codigoInput.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Enter") {

            buscarEmpleado();

        }

    }
);
