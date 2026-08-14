// ======================================================
// COA - PORTAL DE EMPLEADOS
// ======================================================

const PERIODOS = {
    q1: {
        nombre: "Quincena 1",
        mes: "Julio 2026",
        periodoPago: "1 al 15 de julio de 2026",
        archivo: "RECIBOS QUINCENA 1.pdf"
    },
    q2: {
        nombre: "Quincena 2",
        mes: "Julio 2026",
        periodoPago: "16 al 31 de julio de 2026",
        archivo: "RECIBOS QUINCENA 2.pdf"
    }
};

// Documentos futuros. El nombre debe incluir el código.
// Ejemplo: documentos/CBEP1341_constancia.pdf
const TIPOS_DOCUMENTO = [
    { clave: "constancia", nombre: "Constancia de trabajo", icono: "📄" },
    { clave: "solicitud", nombre: "Solicitud", icono: "📝" },
    { clave: "salario", nombre: "Constancia de salario", icono: "💰" },
    { clave: "otros", nombre: "Otros documentos", icono: "📁" }
];

let empleadoActual = null;
let pdfActual = null;
let paginaEncontrada = null;
let quincenaActual = null;

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", iniciar);

function iniciar() {
    if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }

    $("mesQ1").textContent = PERIODOS.q1.mes;
    $("mesQ2").textContent = PERIODOS.q2.mes;

    $("buscar").addEventListener("click", acceder);
    $("codigo").addEventListener("keydown", e => {
        if (e.key === "Enter") acceder();
    });

    document.querySelectorAll(".periodo-card").forEach(btn => {
        btn.addEventListener("click", () => abrirRecibo(btn.dataset.q));
    });

    $("btnRecibos").addEventListener("click", () => mostrarPantalla("pantallaRecibos"));
    $("btnCarnet").addEventListener("click", () => mostrarCarnet());
    $("btnSolicitudes").addEventListener("click", () => mostrarSolicitudes());
    $("cerrarSesion").addEventListener("click", cerrarSesion);

    $("volverRecibos").addEventListener("click", () => mostrarPantalla("pantallaRecibos"));
    $("guardarRecibo").addEventListener("click", guardarRecibo);

    document.querySelectorAll("[data-volver]").forEach(btn => {
        btn.addEventListener("click", () => mostrarPantalla(btn.dataset.volver));
    });

    document.querySelectorAll("[data-modal]").forEach(btn => {
        btn.addEventListener("click", () => abrirModal(btn.dataset.modal));
    });

    document.querySelectorAll("[data-cerrar-modal]").forEach(btn => {
        btn.addEventListener("click", () => btn.closest(".modal").classList.add("oculto"));
    });

    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", e => {
            if (e.target === modal) modal.classList.add("oculto");
        });
    });
}

async function acceder() {
    const input = $("codigo");
    const codigo = normalizar(input.value);

    if (!codigo) {
        mostrarMensaje("Escribe tu código de empleado.", true);
        input.focus();
        return;
    }

    if (codigo.length < 6) {
        mostrarMensaje("Debes escribir el código completo.", true);
        input.focus();
        return;
    }

    $("buscar").disabled = true;
    $("buscar").textContent = "Buscando...";
    mostrarMensaje("🔎 Verificando código...");

    try {
        // Se consulta primero Quincena 1 para obtener los datos del empleado.
        // Si no está allí, se intenta Quincena 2.
        let encontrado = await buscarEmpleadoEnPeriodo(PERIODOS.q1, codigo);

        if (!encontrado) {
            encontrado = await buscarEmpleadoEnPeriodo(PERIODOS.q2, codigo);
        }

        if (!encontrado) {
            mostrarMensaje("El código no fue encontrado en los recibos disponibles.", true);
            return;
        }

        empleadoActual = {
            codigo,
            nombre: obtenerNombre(encontrado.texto),
            departamento: obtenerCampo(encontrado.texto, "Departamento"),
            puesto: obtenerCampo(encontrado.texto, "Puesto")
        };

        $("nombreEmpleado").textContent = empleadoActual.nombre;
        $("codigoEmpleado").textContent = empleadoActual.codigo;

        cargarDatosCarnet();
        mostrarPantalla("pantallaPortal");
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo consultar la información. Verifica que los PDF estén disponibles.", true);
    } finally {
        $("buscar").disabled = false;
        $("buscar").textContent = "Continuar";
    }
}

async function buscarEmpleadoEnPeriodo(periodo, codigo) {
    const pdf = await obtenerPDF(periodo.archivo);
    const buscado = normalizar(codigo);

    for (let paginaNumero = 1; paginaNumero <= pdf.numPages; paginaNumero++) {
        const pagina = await pdf.getPage(paginaNumero);
        const contenido = await pagina.getTextContent();

        const texto = contenido.items.map(item => item.str || "").join(" ");
        const normalizado = normalizar(texto);

        if (normalizado.includes(buscado)) {
            return {
                pdf,
                pagina: paginaNumero,
                texto,
                periodo
            };
        }
    }

    return null;
}

async function abrirRecibo(clave) {
    if (!empleadoActual) return;

    const periodo = PERIODOS[clave];
    quincenaActual = clave;

    mostrarPantalla("pantallaRecibo");
    $("visorTitulo").textContent = `${periodo.nombre} · ${periodo.mes}`;

    const visor = document.querySelector(".visor-pdf");
    visor.innerHTML = `<div class="visor-mensaje">🔄 Buscando tu recibo...</div>`;

    try {
        const encontrado = await buscarEmpleadoEnPeriodo(periodo, empleadoActual.codigo);

        if (!encontrado) {
            visor.innerHTML = `<div class="visor-mensaje error-box">No hay un recibo disponible para tu código en ${periodo.nombre}.</div>`;
            return;
        }

        pdfActual = encontrado.pdf;
        paginaEncontrada = encontrado.pagina;

        await renderizarPagina(encontrado.pdf, encontrado.pagina);
    } catch (error) {
        console.error(error);
        visor.innerHTML = `<div class="visor-mensaje error-box">No se pudo cargar el recibo.</div>`;
    }
}

async function renderizarPagina(pdf, numeroPagina) {
    const pagina = await pdf.getPage(numeroPagina);
    const contenedor = document.querySelector(".visor-pdf");

    const base = pagina.getViewport({ scale: 1 });
    const ancho = Math.min(contenedor.clientWidth || 900, 1000);
    const escala = Math.min(2, Math.max(1, ancho / base.width));
    const viewport = pagina.getViewport({ scale: escala });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    contenedor.innerHTML = "";
    contenedor.appendChild(canvas);

    await pagina.render({
        canvasContext: canvas.getContext("2d"),
        viewport
    }).promise;
}

async function guardarRecibo() {
    if (!pdfActual || !paginaEncontrada || !empleadoActual) return;

    try {
        const pagina = await pdfActual.getPage(paginaEncontrada);
        const viewport = pagina.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await pagina.render({
            canvasContext: canvas.getContext("2d"),
            viewport
        }).promise;

        const enlace = document.createElement("a");
        enlace.href = canvas.toDataURL("image/jpeg", 0.95);
        enlace.download = `${empleadoActual.codigo}_${quincenaActual}.jpg`;
        enlace.click();
    } catch (error) {
        console.error(error);
        alert("No fue posible guardar el recibo.");
    }
}

function mostrarCarnet() {
    cargarDatosCarnet();
    mostrarPantalla("pantallaCarnet");
}

function cargarDatosCarnet() {
    if (!empleadoActual) return;

    // El carnet queda limitado estrictamente a: nombre, código, departamento y puesto.
    const datos = document.querySelector(".carnet-datos");
    if (datos) {
        datos.innerHTML = `
            <span class="carnet-label">NOMBRE DEL COLABORADOR</span>
            <h3 id="carnetNombre">${escaparHTML(empleadoActual.nombre || "Colaborador")}</h3>
            <div class="carnet-linea">
                <div>
                    <span class="carnet-label">CÓDIGO</span>
                    <strong id="carnetCodigo">${escaparHTML(empleadoActual.codigo || "—")}</strong>
                </div>
                <div>
                    <span class="carnet-label">DEPARTAMENTO</span>
                    <strong id="carnetDepartamento">${escaparHTML(empleadoActual.departamento || "—")}</strong>
                </div>
            </div>
            <div class="carnet-puesto">
                <span class="carnet-label">PUESTO</span>
                <strong id="carnetPuesto">${escaparHTML(empleadoActual.puesto || "—")}</strong>
            </div>
        `;
    }

    cargarFotoCarnet(empleadoActual.codigo);
}

function cargarFotoCarnet(codigo) {
    const fotoBox = $("fotoCarnet") || document.querySelector(".foto-box");
    if (!fotoBox || !codigo) return;

    // Estado inicial: solo silueta. No se muestra ningún mensaje de "foto pendiente".
    fotoBox.innerHTML = `
        <div class="silueta" aria-label="Sin fotografía">
            <span>👤</span>
        </div>
    `;

    const extensiones = ["png", "jpg", "jpeg"];
    let indice = 0;

    function probarSiguiente() {
        if (indice >= extensiones.length) return;

        const imagen = new Image();
        const extension = extensiones[indice++];
        imagen.className = "foto-empleado";
        imagen.alt = `Fotografía de ${codigo}`;
        imagen.onload = () => {
            // Al existir la foto, reemplaza por completo la silueta.
            // No queda texto ni aviso debajo de la fotografía.
            fotoBox.innerHTML = "";
            fotoBox.appendChild(imagen);
        };
        imagen.onerror = probarSiguiente;
        imagen.src = `fotos/${encodeURIComponent(codigo)}.${extension}?v=40`;
    }

    probarSiguiente();
}

function mostrarSolicitudes() {
    mostrarPantalla("pantallaSolicitudes");
    cargarDocumentos();
}

async function cargarDocumentos() {
    const contenedor = $("listaDocumentos");
    const codigo = empleadoActual?.codigo;

    if (!codigo) {
        contenedor.innerHTML = "";
        return;
    }

    contenedor.innerHTML = `<div class="visor-mensaje">🔄 Buscando tus documentos...</div>`;

    // Esperamos a comprobar TODOS los documentos antes de mostrar
    // el mensaje de "sin documentos". Así un PDF válido no desaparece
    // por culpa de otro archivo que todavía no existe.
    const encontrados = await Promise.all(
        TIPOS_DOCUMENTO.map(async doc => {
            const archivo = `Documentos/${codigo}_${doc.clave}.pdf`;

            try {
                const respuesta = await fetch(archivo, {
                    method: "GET",
                    cache: "no-store"
                });

                if (!respuesta.ok) return null;

                return { doc, archivo };
            } catch (error) {
                return null;
            }
        })
    );

    const documentosDisponibles = encontrados.filter(Boolean);

    if (!documentosDisponibles.length) {
        contenedor.innerHTML = `
            <div class="sin-documentos">
                <span>📂</span>
                <h3>No tienes documentos disponibles</h3>
                <p>Cuando Recursos Humanos publique una constancia, solicitud u otro documento para tu código, aparecerá aquí.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = documentosDisponibles.map(({ doc, archivo }) => `
        <article class="documento-card">
            <span class="documento-icon">${doc.icono}</span>
            <div>
                <strong>${escaparHTML(doc.nombre)}</strong>
                <small>Documento asociado a ${escaparHTML(codigo)}</small>
            </div>
            <a href="${archivo}" target="_blank" rel="noopener" class="documento-boton">Abrir</a>
        </article>
    `).join("");
}

function obtenerPDF(archivo) {
    if (!window.pdfjsLib) throw new Error("PDF.js no está disponible.");
    return pdfjsLib.getDocument({ url: archivo }).promise;
}

function obtenerNombre(texto) {
    const m1 = texto.match(/Empleado\s*:\s*(.*?)\s+Sueldo\s+Mensual/i);
    if (m1?.[1]) return m1[1].trim();

    const m2 = texto.match(/Empleado\s*:\s*(.*?)(?=\s+(?:Departamento|Puesto|Sueldo))/i);
    if (m2?.[1]) return m2[1].trim();

    return "Colaborador";
}

function obtenerCampo(texto, campo) {
    const siguiente = "(?=\\s+(?:Departamento|Puesto|Días\\s+Trabajados|Días\\s+Incapacidad|Faltas|Renumerados|Vacaciones|Feriados|Séptimo|Sueldo\\s+Base|Sueldo\\s+Mensual|Salario|Ingreso|Deducciones|Total|Nombre\\s+Pago|Valor|$))";
    const regex = new RegExp(`${campo}\\s*:\\s*(.*?)${siguiente}`, "i");
    const match = texto.match(regex);
    return match?.[1]?.trim().replace(/\\s+/g, " ") || "";
}

function escaparHTML(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function normalizar(texto) {
    return String(texto || "")
        .toUpperCase()
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9]/g, "");
}

function mostrarMensaje(texto, error = false) {
    const elemento = $("mensaje");
    elemento.textContent = texto;
    elemento.className = `mensaje ${error ? "error" : "ok"}`;
}

function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
    const pantalla = $(id);
    if (pantalla) {
        pantalla.classList.remove("oculto");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function cerrarSesion() {
    empleadoActual = null;
    pdfActual = null;
    paginaEncontrada = null;
    quincenaActual = null;

    $("codigo").value = "";
    $("mensaje").textContent = "";
    mostrarPantalla("pantallaAcceso");
    $("codigo").focus();
}

function abrirModal(id) {
    const modal = $(id);
    if (modal) modal.classList.remove("oculto");
}
