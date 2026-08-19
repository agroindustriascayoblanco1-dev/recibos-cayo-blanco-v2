const PERIODOS={
 q1:{nombre:"Quincena 1",mes:"Agosto 2026",archivo:"RECIBOS QUINCENA 1.pdf"},
 q2:{nombre:"Quincena 2",mes:"Julio 2026",archivo:"RECIBOS QUINCENA 2.pdf"}
};
let empleadoActual=null,pdfActual=null,paginaEncontrada=null,quincenaActual=null;
const $=id=>document.getElementById(id);
document.addEventListener("DOMContentLoaded",init);

function init(){
 if(window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
 $("mesQ1").textContent=PERIODOS.q1.mes;$("mesQ2").textContent=PERIODOS.q2.mes;
 $("buscar").onclick=acceder;$("codigo").onkeydown=e=>{if(e.key==="Enter")acceder()};
 document.querySelectorAll("[data-screen]").forEach(b=>b.onclick=()=>show(b.dataset.screen));
 document.querySelectorAll(".period-card").forEach(b=>b.onclick=()=>abrirRecibo(b.dataset.q));
 $("btnCarnet").onclick=()=>{cargarCarnet();show("pantallaCarnet")};
 $("btnRecibos").onclick=()=>show("pantallaRecibos");
 $("cerrarSesion").onclick=logout;
 document.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>window.open(b.dataset.open,"_blank"));
 $("btnContrato").onclick=buscarContrato;
 document.querySelectorAll("[data-info]").forEach(b=>b.onclick=()=>mostrarInfo(b.dataset.info));
}

function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active");window.scrollTo({top:0,behavior:"smooth"});if(id==="pantallaDocumentos")cargarDocumentos()}
function msg(t,error=false){$("mensajeAcceso").textContent=t;$("mensajeAcceso").className="message"+(error?" error":"")}
async function acceder(){
 const codigo=normalizar($("codigo").value);
 if(!codigo){msg("Escribe tu código de empleado.",true);return}
 if(codigo.length<6){msg("Debes escribir el código completo.",true);return}
 $("buscar").disabled=true;$("buscar").textContent="Buscando...";msg("🔎 Verificando código...");
 try{
  let r=await buscarEmpleado(PERIODOS.q1,codigo);if(!r)r=await buscarEmpleado(PERIODOS.q2,codigo);
  if(!r){msg("El código no fue encontrado en los recibos disponibles.",true);return}
  empleadoActual={codigo,nombre:obtenerNombre(r.texto),departamento:obtenerCampo(r.texto,"Departamento"),puesto:obtenerCampo(r.texto,"Puesto")};
  $("nombreEmpleado").textContent=empleadoActual.nombre;$("codigoEmpleado").textContent=codigo;
  cargarAvatar();cargarCarnet();show("pantallaPortal");
 }catch(e){console.error(e);msg("No se pudo consultar la información. Verifica que los PDF estén disponibles.",true)}
 finally{$("buscar").disabled=false;$("buscar").textContent="Continuar"}
}
async function buscarEmpleado(periodo,codigo){
 const pdf=await pdfjsLib.getDocument({url:periodo.archivo}).promise;
 for(let n=1;n<=pdf.numPages;n++){const p=await pdf.getPage(n),c=await p.getTextContent(),texto=c.items.map(x=>x.str||"").join(" ");if(normalizar(texto).includes(normalizar(codigo)))return{pdf,pagina:n,texto}}
 return null
}
async function abrirRecibo(key){
 if(!empleadoActual)return;quincenaActual=key;const periodo=PERIODOS[key];show("pantallaRecibo");$("visorTitulo").textContent=`${periodo.nombre} · ${periodo.mes}`;const v=document.querySelector(".pdf-viewer");v.innerHTML='<div class="viewer-message">🔄 Buscando tu recibo...</div>';
 try{const r=await buscarEmpleado(periodo,empleadoActual.codigo);if(!r){v.innerHTML=`<div class="viewer-message">No hay un recibo disponible para tu código en ${periodo.nombre}.</div>`;return}pdfActual=r.pdf;paginaEncontrada=r.pagina;await renderPage(r.pdf,r.pagina)}catch(e){console.error(e);v.innerHTML='<div class="viewer-message">No se pudo cargar el recibo.</div>'}
}
async function renderPage(pdf,n){const p=await pdf.getPage(n),v=document.querySelector(".pdf-viewer"),base=p.getViewport({scale:1}),scale=Math.min(2,Math.max(1,(v.clientWidth||900)/base.width)),vp=p.getViewport({scale}),c=document.createElement("canvas");c.width=vp.width;c.height=vp.height;c.style.width="100%";v.innerHTML="";v.appendChild(c);await p.render({canvasContext:c.getContext("2d"),viewport:vp}).promise}
async function guardarRecibo(){
 if(!pdfActual||!paginaEncontrada||!empleadoActual)return;
 try{const p=await pdfActual.getPage(paginaEncontrada),vp=p.getViewport({scale:2}),c=document.createElement("canvas");c.width=vp.width;c.height=vp.height;await p.render({canvasContext:c.getContext("2d"),viewport:vp}).promise;const a=document.createElement("a");a.href=c.toDataURL("image/jpeg",.95);a.download=`${empleadoActual.codigo}_${quincenaActual}.jpg`;a.click()}catch(e){alert("No fue posible guardar el recibo.")}
}
$("guardarRecibo").onclick=guardarRecibo;

function cargarCarnet(){
 if(!empleadoActual)return;
 $("carnetNombre").textContent=empleadoActual.nombre||"Colaborador";$("carnetCodigo").textContent=empleadoActual.codigo||"—";$("carnetDepartamento").textContent=empleadoActual.departamento||"—";$("carnetPuesto").textContent=empleadoActual.puesto||"—";cargarFoto(empleadoActual.codigo)
}
function cargarAvatar(){const a=$("avatarMini");const img=new Image();img.onload=()=>{a.innerHTML="";a.appendChild(img)};img.onerror=()=>{a.textContent="👤"};img.src=`fotos/${encodeURIComponent(empleadoActual.codigo)}.png?v=50`}
function cargarFoto(codigo){
 const box=$("fotoCarnet");box.innerHTML='<span>👤</span>';let i=0;
 const probar=()=>{if(i>=3)return;const ext=["png","jpg","jpeg"][i++],img=new Image();img.className="foto-empleado";img.alt="Fotografía del empleado";img.onload=()=>{box.innerHTML="";box.appendChild(img)};img.onerror=probar;img.src=`fotos/${encodeURIComponent(codigo)}.${ext}?v=50`};probar();
}
async function cargarDocumentos(){
 const box=$("listaDocumentos");if(!empleadoActual)return;
 box.innerHTML='<div class="empty">🔄 Buscando tus documentos...</div>';
 const tipos=[["constancia","📄","Constancia de trabajo"],["solicitud","📝","Solicitud"],["salario","💰","Constancia de salario"],["otros","📁","Otros documentos"]];
 const found=[];
 for(const [key,icon,name] of tipos){for(const dir of ["documentos","Documentos"]){const path=`${dir}/${empleadoActual.codigo}_${key}.pdf`;try{const r=await fetch(path,{cache:"no-store"});if(r.ok){found.push({icon,name,path});break}}catch(e){}}}
 if(!found.length){box.innerHTML='<div class="empty">📂 No tienes documentos personales disponibles por ahora.</div>';return}
 box.innerHTML=found.map(x=>`<article class="doc-card"><span>${x.icon}</span><div><strong>${x.name}</strong><small>Documento asociado a ${esc(empleadoActual.codigo)}</small></div><a class="outline link" href="${x.path}" target="_blank">Abrir</a></article>`).join("")
}
async function buscarContrato(){
 if(!empleadoActual)return;
 const rutas=[`documentos/${empleadoActual.codigo}_contrato.pdf`,`Documentos/${empleadoActual.codigo}_contrato.pdf`];
 for(const p of rutas){try{const r=await fetch(p,{cache:"no-store"});if(r.ok){window.open(p,"_blank");return}}catch(e){}}
 alert("Tu contrato todavía no está disponible en el portal.")
}
function mostrarInfo(tipo){
 const d=$("infoDetalle");d.classList.remove("hidden");
 const data={
 rap:["RAP","El Régimen de Aportaciones Privadas (RAP) administra aportaciones y servicios destinados a apoyar a los trabajadores. Consulta con Recursos Humanos si necesitas información sobre tus aportaciones, beneficios o trámites."],
 ihss:["IHSS","El Instituto Hondureño de Seguridad Social (IHSS) brinda servicios de seguridad social. Si necesitas orientación sobre atención, afiliación o trámites relacionados, consulta los canales oficiales o solicita apoyo a Recursos Humanos."],
 contactos:["Contactos de Recursos Humanos","Para consultas sobre recibos, permisos, documentación u otros procesos laborales, utiliza los canales de atención establecidos por Recursos Humanos. Esta sección puede actualizarse cuando RRHH publique nuevos contactos."]
 };
 const [title,text]=data[tipo]||[];d.innerHTML=`<h3>${title}</h3><p>${text}</p>`;
}
function obtenerNombre(t){let m=t.match(/Empleado\s*:\s*(.*?)\s+Sueldo\s+Mensual/i);if(m?.[1])return m[1].trim();m=t.match(/Empleado\s*:\s*(.*?)(?=\s+(?:Departamento|Puesto|Sueldo))/i);return m?.[1]?.trim()||"Colaborador"}
function obtenerCampo(t,campo){const next="(?=\\s+(?:Departamento|Puesto|Días\\s+Trabajados|Días\\s+Incapacidad|Faltas|Vacaciones|Feriados|Sueldo\\s+Base|Sueldo\\s+Mensual|Salario|Ingreso|Deducciones|Total|$))";const m=t.match(new RegExp(`${campo}\\s*:\\s*(.*?)${next}`,"i"));return m?.[1]?.trim().replace(/\s+/g," ")||""}
function normalizar(t){return String(t||"").toUpperCase().replace(/\s+/g,"").replace(/[^A-Z0-9]/g,"")}
function esc(t){return String(t??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function logout(){empleadoActual=null;pdfActual=null;paginaEncontrada=null;$("codigo").value="";msg("");show("pantallaAcceso")}
