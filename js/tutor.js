"use strict";

/*=========================================================
PANEL DEL TUTOR
El tutor ve TODAS las materias y sus estudiantes
NO puede editar nada
=========================================================*/

let tutorActual = {
    id: null,
    nombre: "tutor"
};

/*=========================================================
LISTA DE MATERIAS
=========================================================*/

const MATERIAS_TUTOR = [
    { id: "matematicas",    nombre: "Matemáticas",     icono: "📐" },
    { id: "lenguaje",       nombre: "Lenguaje",        icono: "📝" },
    { id: "ingles",         nombre: "Inglés",          icono: "🇬🇧" },
    { id: "biologia",       nombre: "Biología",        icono: "🧬" },
    { id: "quimica",        nombre: "Química",         icono: "⚗️" },
    { id: "fisica",         nombre: "Física",          icono: "⚛️" },
    { id: "literatura",     nombre: "Literatura",      icono: "📚" },
    { id: "musica",         nombre: "Música",          icono: "🎵" },
    { id: "geografia",      nombre: "Geografía",       icono: "🌎" },
    { id: "arte",           nombre: "Arte",            icono: "🎨" },
    { id: "historia",       nombre: "Historia",        icono: "🏛️" },
    { id: "religion",       nombre: "Religión",        icono: "✝️" }
];

/*=========================================================
ABRIR PANEL DEL TUTOR
=========================================================*/

async function abrirPanelTutor(userId){
    
    tutorActual.id = userId;
    
    // Ocultar todo
    document.getElementById("login").style.display = "none";
    document.getElementById("menuPrincipal").style.display = "none";
    document.getElementById("seleccionMateria").style.display = "none";
    document.getElementById("panelProfesor").style.display = "none";
    
    // Mostrar panel del tutor
    document.getElementById("panelTutor").style.display = "flex";
    
    // Mostrar las tarjetas de materias
    mostrarMateriasTutor();
    
    console.log("👨‍🏫 Panel del tutor abierto");
}

/*=========================================================
CERRAR SESIÓN
=========================================================*/

async function cerrarSesionTutor(){
    await cerrarSesion();
    document.getElementById("panelTutor").style.display = "none";
    document.getElementById("login").style.display = "flex";
    console.log("👋 Sesión cerrada");
}

/*=========================================================
MOSTRAR MATERIAS (TARJETAS)
=========================================================*/

async function mostrarMateriasTutor(){
    
    // Ocultar botón volver
    document.getElementById("btnVolverMaterias").style.display = "none";
    
    const contenedor = document.getElementById("contenidoTutor");
    
    // Encabezado
    let html = `
        <h2 style="color:#ffd700; margin-bottom:15px; text-align:center;">📚 Selecciona una Materia</h2>
        <p style="color:#aaa; text-align:center; margin-bottom:25px;">Toca una materia para ver el progreso de sus estudiantes</p>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:15px; max-width:900px; margin:0 auto;">
    `;
    
    // Obtener cuántos estudiantes hay por materia
    for(const materia of MATERIAS_TUTOR){
        
        // Contar estudiantes
        let totalEstudiantes = 0;
        try {
            const { count } = await supabaseClient
                .from('estudiantes_profesor')
                .select('*', { count: 'exact', head: true })
                .eq('materia', materia.id)
                .eq('activo', true);
            totalEstudiantes = count || 0;
        } catch(e) {
            console.log("Error contando:", materia.id);
        }
        
        html += `
            <div 
                onclick="verMateriaTutor('${materia.id}')"
                style="
                    background:#1e293b;
                    border:2px solid #ffd700;
                    border-radius:12px;
                    padding:25px 20px;
                    cursor:pointer;
                    transition:0.3s;
                    text-align:center;
                "
                onmouseover="this.style.background='#2563eb'; this.style.transform='scale(1.05)'"
                onmouseout="this.style.background='#1e293b'; this.style.transform='scale(1)'"
            >
                <div style="font-size:48px; margin-bottom:10px;">${materia.icono}</div>
                <div style="color:#ffd700; font-size:20px; font-weight:bold; margin-bottom:8px;">${materia.nombre}</div>
                <div style="color:#aaa; font-size:14px;">👥 ${totalEstudiantes} estudiante(s)</div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    contenedor.innerHTML = html;
}

/*=========================================================
VER UNA MATERIA (Con PROGRESO)
=========================================================*/

async function verMateriaTutor(materiaId){
    
    console.log("📖 Ver materia:", materiaId);
    
    document.getElementById("btnVolverMaterias").style.display = "block";
    
    const materia = MATERIAS_TUTOR.find(m => m.id === materiaId);
    const nombreMostrar = materia ? materia.nombre : materiaId;
    const iconoMostrar = materia ? materia.icono : "📚";
    
    const contenedor = document.getElementById("contenidoTutor");
    contenedor.innerHTML = "<p style='color:#aaa; text-align:center; padding:40px;'>Cargando estudiantes...</p>";
    
    try {
        const { data: asignaciones, error } = await supabaseClient
            .from('estudiantes_profesor')
            .select(`
                estudiante_id,
                materia,
                usuarios:estudiante_id (nombre, correo)
            `)
            .eq('materia', materiaId)
            .eq('activo', true);
        
        if(error) throw error;
        
        let html = `
            <h2 style="color:#ffd700; margin-bottom:20px; text-align:center;">
                ${iconoMostrar} ${nombreMostrar}
            </h2>
        `;
        
        if(!asignaciones || asignaciones.length === 0){
            html += `
                <div style="text-align:center; padding:40px; background:#1e293b; border-radius:12px; max-width:600px; margin:0 auto;">
                    <p style="color:#aaa; font-size:18px;">📭 No hay estudiantes en esta materia todavía.</p>
                </div>
            `;
            contenedor.innerHTML = html;
            return;
        }
        
        html += `
            <div style="background:#1e293b; border-radius:12px; overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; min-width:700px;">
                    <thead>
                        <tr style="background:#2563eb;">
                            <th style="padding:15px; text-align:left;">Estudiante</th>
                            <th style="padding:15px; text-align:center;">🔑 Llaves</th>
                            <th style="padding:15px; text-align:center;">🏆 Puntaje</th>
                            <th style="padding:15px; text-align:center;">📚 Aulas</th>
                            <th style="padding:15px; text-align:center;">⏱️ Última vez</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for(const asig of asignaciones){
            
            const nombreEst = asig.usuarios?.nombre || "Sin nombre";
            
            const { data: progreso } = await supabaseClient
                .from('progreso')
                .select('*')
                .eq('estudiante_id', asig.estudiante_id)
                .eq('materia', materiaId)
                .maybeSingle();
            
            const llaves = progreso?.llaves_obtenidas || 0;
            const puntaje = progreso?.puntaje || 0;
            const aulas = progreso?.aulas_completadas?.length || 0;
            const fecha = progreso?.actualizado_en 
                ? new Date(progreso.actualizado_en).toLocaleDateString() 
                : "Nunca";
            
            html += `
                <tr style="border-bottom:1px solid #334155;">
                    <td style="padding:15px; color:#fff;">${nombreEst}</td>
                    <td style="padding:15px; text-align:center; color:#ffd700; font-weight:bold;">${llaves} / 13</td>
                    <td style="padding:15px; text-align:center; color:#22c55e; font-weight:bold;">${puntaje}</td>
                    <td style="padding:15px; text-align:center; color:#60a5fa;">${aulas} / 12</td>
                    <td style="padding:15px; text-align:center; color:#aaa; font-size:13px;">${fecha}</td>
                </tr>
            `;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        contenedor.innerHTML = html;
        
    } catch(error){
        console.error("❌ Error:", error.message);
        contenedor.innerHTML = `<p style="color:#ef4444; text-align:center;">Error: ${error.message}</p>`;
    }
}

/*=========================================================
VOLVER AL INICIO DEL TUTOR
=========================================================*/

function volverAlInicioTutor(){
    mostrarMateriasTutor();
}