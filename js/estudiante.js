"use strict";

/*=========================================================
PANEL DEL ESTUDIANTE
El estudiante ve su propio progreso
=========================================================*/

let estudianteActual = {
    id: null,
    nombre: ""
};

/*=========================================================
ABRIR PANEL DEL ESTUDIANTE
=========================================================*/

async function abrirPanelEstudiante(userId, nombre){
    
    estudianteActual.id = userId;
    estudianteActual.nombre = nombre;
    
    // Ocultar todo
    document.getElementById("login").style.display = "none";
    document.getElementById("menuPrincipal").style.display = "none";
    document.getElementById("seleccionMateria").style.display = "none";
    document.getElementById("panelProfesor").style.display = "none";
    document.getElementById("panelTutor").style.display = "none";
    
    // Mostrar panel
    document.getElementById("panelEstudiante").style.display = "flex";
    document.getElementById("nombreEstudiante").innerText = nombre.toUpperCase();
    
    // Mostrar progreso por defecto
    mostrarProgresoEstudiante();
    
    console.log("🎓 Panel del estudiante abierto:", nombre);
}

/*=========================================================
CERRAR SESIÓN DEL ESTUDIANTE
=========================================================*/

async function cerrarSesionEstudiante(){
    await cerrarSesion();
    document.getElementById("panelEstudiante").style.display = "none";
    document.getElementById("login").style.display = "flex";
    console.log("👋 Sesión cerrada");
}

/*=========================================================
MOSTRAR PROGRESO DEL ESTUDIANTE
=========================================================*/

async function mostrarProgresoEstudiante(){
    
    const contenedor = document.getElementById("contenidoEstudiante");
    contenedor.innerHTML = "<p style='color:#aaa; text-align:center; padding:40px;'>Cargando tu progreso...</p>";
    
    try {
        // 🔴 Obtener TODO el progreso del estudiante
        const { data: progresos, error } = await supabaseClient
            .from('progreso')
            .select('*')
            .eq('estudiante_id', estudianteActual.id)
            .order('actualizado_en', { ascending: false });
        
        if(error) throw error;
        
        if(!progresos || progresos.length === 0){
            contenedor.innerHTML = `
                <div style="text-align:center; padding:40px; background:#1e293b; border-radius:12px; max-width:600px; margin:0 auto;">
                    <p style="color:#aaa; font-size:18px;">📭 No has jugado ninguna partida todavía.</p>
                    <p style="color:#666; font-size:14px; margin-top:10px;">Haz clic en "🎮 Jugar" para comenzar.</p>
                </div>
            `;
            return;
        }
        
        // 🔴 Estadísticas generales
        let totalLlaves = 0;
        let totalPuntaje = 0;
        
        for(const p of progresos){
            totalLlaves += p.llaves_obtenidas || 0;
            totalPuntaje += p.puntaje || 0;
        }
        
        let html = `
            <h2 style="color:#ffd700; margin-bottom:20px;">📊 Mi Progreso</h2>
            
            <!-- Resumen general -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:15px; margin-bottom:25px;">
                <div style="background:#1e293b; padding:20px; border-radius:12px; text-align:center;">
                    <div style="color:#60a5fa; font-size:32px; font-weight:bold;">${progresos.length}</div>
                    <div style="color:#aaa; font-size:14px;">Materias jugadas</div>
                </div>
                <div style="background:#1e293b; padding:20px; border-radius:12px; text-align:center;">
                    <div style="color:#ffd700; font-size:32px; font-weight:bold;">${totalLlaves}</div>
                    <div style="color:#aaa; font-size:14px;">Llaves totales</div>
                </div>
                <div style="background:#1e293b; padding:20px; border-radius:12px; text-align:center;">
                    <div style="color:#22c55e; font-size:32px; font-weight:bold;">${totalPuntaje}</div>
                    <div style="color:#aaa; font-size:14px;">Puntaje total</div>
                </div>
            </div>
            
            <!-- Progreso por materia -->
            <h3 style="color:#ffd700; margin-bottom:15px;">📚 Progreso por Materia</h3>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:15px;">
        `;
        
        for(const p of progresos){
            
            const materia = p.materia || "general";
            const nombreMateria = materia.charAt(0).toUpperCase() + materia.slice(1);
            const llaves = p.llaves_obtenidas || 0;
            const puntaje = p.puntaje || 0;
            const aulas = p.aulas_completadas?.length || 0;
            const fecha = p.actualizado_en 
                ? new Date(p.actualizado_en).toLocaleDateString() 
                : "Nunca";
            
            // 🔴 Barra de progreso
            const porcentaje = Math.round((llaves / 13) * 100);
            
            html += `
                <div style="background:#1e293b; padding:20px; border-radius:12px; border-left:4px solid #ffd700;">
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <h4 style="color:#ffd700; margin:0; font-size:18px;">📚 ${nombreMateria}</h4>
                        <span style="color:#aaa; font-size:12px;">${fecha}</span>
                    </div>
                    
                    <div style="margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span style="color:#fff; font-size:14px;">🔑 Llaves</span>
                            <span style="color:#ffd700; font-weight:bold;">${llaves} / 13</span>
                        </div>
                        <div style="width:100%; height:8px; background:#0f172a; border-radius:4px; overflow:hidden;">
                            <div style="width:${porcentaje}%; height:100%; background:#ffd700; transition:0.3s;"></div>
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px;">
                        <div style="text-align:center; padding:8px; background:#0f172a; border-radius:6px;">
                            <div style="color:#22c55e; font-weight:bold;">${puntaje}</div>
                            <div style="color:#aaa; font-size:11px;">Puntaje</div>
                        </div>
                        <div style="text-align:center; padding:8px; background:#0f172a; border-radius:6px;">
                            <div style="color:#60a5fa; font-weight:bold;">${aulas} / 12</div>
                            <div style="color:#aaa; font-size:11px;">Aulas</div>
                        </div>
                    </div>
                    
                </div>
            `;
        }
        
        html += `</div>`;
        
        contenedor.innerHTML = html;
        console.log("✅ Progreso del estudiante cargado");
        
    } catch(error){
        console.error("❌ Error:", error.message);
        contenedor.innerHTML = `<p style="color:#ef4444; text-align:center;">Error: ${error.message}</p>`;
    }
}

/*=========================================================
JUGAR DE NUEVO
=========================================================*/

function jugarDeNuevo(){
    
    document.getElementById("panelEstudiante").style.display = "none";
    document.getElementById("menuPrincipal").style.display = "flex";
    
    console.log("🎮 Volviendo al menú principal");
}