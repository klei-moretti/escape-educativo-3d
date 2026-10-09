"use strict";

/*=========================================================
PANEL DEL PROFESOR
=========================================================*/

let profesorActual = {
    nombre: "",
    materia: "",
    id: null
};

/*=========================================================
ABRIR PANEL DEL PROFESOR
=========================================================*/

async function abrirPanelProfesor(nombre, userId){
    
    // Guardar datos del profesor
    profesorActual.nombre = nombre;
    profesorActual.materia = nombre.toLowerCase();
    profesorActual.id = userId;
    
    // Ocultar login
    document.getElementById("login").style.display = "none";
    document.getElementById("menuPrincipal").style.display = "none";
    
    // Mostrar panel
    document.getElementById("panelProfesor").style.display = "flex";
    document.getElementById("profesorMateria").innerText = nombre.toUpperCase();
    
    // Mostrar pestaña de estudiantes por defecto
    mostrarPestanaProfesor("estudiantes");
    
    console.log("👨‍🏫 Panel del profesor abierto:", nombre);
}

/*=========================================================
CERRAR SESIÓN
=========================================================*/

async function cerrarSesionProfesor(){
    await cerrarSesion();
    document.getElementById("panelProfesor").style.display = "none";
    document.getElementById("login").style.display = "flex";
    console.log("👋 Sesión cerrada");
}

/*=========================================================
CAMBIAR PESTAÑA
=========================================================*/

function mostrarPestanaProfesor(pestana){
    
    // Cambiar color de los botones
    document.getElementById("tabEstudiantes").style.background = pestana === "estudiantes" ? "#2563eb" : "#333";
    document.getElementById("tabPreguntas").style.background = pestana === "preguntas" ? "#2563eb" : "#333";
    document.getElementById("tabProgreso").style.background = pestana === "progreso" ? "#2563eb" : "#333";
    document.getElementById("tabExamen").style.background = pestana === "examen" ? "#2563eb" : "#333";
    
    // Mostrar contenido según pestaña
    if(pestana === "estudiantes"){
        mostrarEstudiantesProfesor();
    } else if(pestana === "preguntas"){
        mostrarPreguntasProfesor();
    } else if(pestana === "progreso"){
        mostrarProgresoProfesor();
    } else if(pestana === "examen"){
        mostrarExamenProfesor();
    }
}

/*=========================================================
PESTAÑA: ESTUDIANTES (Con PROGRESO)
=========================================================*/

async function mostrarEstudiantesProfesor(){
    
    const contenedor = document.getElementById("contenidoProfesor");
    contenedor.innerHTML = "<p style='color:#aaa; text-align:center; padding:40px;'>Cargando estudiantes...</p>";
    
    try {
        // 🔴 Obtener SOLO estudiantes
        const { data: estudiantes, error } = await supabaseClient
            .from('usuarios')
            .select('id, nombre, correo, tipo, rol')
            .or('tipo.eq.estudiante,rol.eq.estudiante')
            .order('nombre');
        
        if(error) throw error;
        
        if(!estudiantes || estudiantes.length === 0){
            contenedor.innerHTML = `
                <div style="text-align:center; padding:40px; background:#1e293b; border-radius:12px;">
                    <p style="color:#aaa; font-size:18px;">📭 No hay estudiantes registrados todavía.</p>
                </div>
            `;
            return;
        }
        
        // 🔴 Obtener los estudiantes asignados a este profesor
        const { data: asignados } = await supabaseClient
            .from('estudiantes_profesor')
            .select('estudiante_id')
            .eq('profesor_id', profesorActual.id)
            .eq('materia', profesorActual.materia)
            .eq('activo', true);
        
        const idsAsignados = asignados ? asignados.map(a => a.estudiante_id) : [];
        
        // 🔴 Crear tabla CON progreso
        let html = `
            <h2 style="color:#ffd700; margin-bottom:15px;">👥 Estudiantes</h2>
            <p style="color:#aaa; margin-bottom:20px;">Marca los estudiantes que son TUYOS. Ve su progreso en tu materia.</p>
            
            <div style="background:#1e293b; border-radius:12px; overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; min-width:800px;">
                    <thead>
                        <tr style="background:#2563eb;">
                            <th style="padding:15px; text-align:center; width:60px;">✓</th>
                            <th style="padding:15px; text-align:left;">Estudiante</th>
                            <th style="padding:15px; text-align:center;">🔑 Llaves</th>
                            <th style="padding:15px; text-align:center;">🏆 Puntaje</th>
                            <th style="padding:15px; text-align:center;">📚 Aulas</th>
                            <th style="padding:15px; text-align:center;">⏱️ Última vez</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for(const est of estudiantes){
            
            const marcado = idsAsignados.includes(est.id);
            
            // 🔴 Obtener progreso SOLO si está asignado
            let llaves = 0;
            let puntaje = 0;
            let aulas = 0;
            let fecha = "—";
            
            if(marcado){
                const { data: progreso } = await supabaseClient
                    .from('progreso')
                    .select('*')
                    .eq('estudiante_id', est.id)
                    .eq('materia', profesorActual.materia)
                    .maybeSingle();
                
                if(progreso){
                    llaves = progreso.llaves_obtenidas || 0;
                    puntaje = progreso.puntaje || 0;
                    aulas = progreso.aulas_completadas?.length || 0;
                    fecha = progreso.actualizado_en 
                        ? new Date(progreso.actualizado_en).toLocaleDateString() 
                        : "—";
                }
            }
            
            html += `
                <tr style="border-bottom:1px solid #334155; ${marcado ? 'background:#1e3a8a;' : ''}">
                    <td style="padding:15px; text-align:center;">
                        <input 
                            type="checkbox" 
                            ${marcado ? 'checked' : ''}
                            onchange="toggleEstudiante('${est.id}', this.checked)"
                            style="width:22px; height:22px; cursor:pointer;"
                        >
                    </td>
                    <td style="padding:15px; color:#fff; font-weight:${marcado ? 'bold' : 'normal'};">${est.nombre}</td>
                    <td style="padding:15px; text-align:center; color:#ffd700; font-weight:bold;">${marcado ? llaves + ' / 13' : '—'}</td>
                    <td style="padding:15px; text-align:center; color:#22c55e; font-weight:bold;">${marcado ? puntaje : '—'}</td>
                    <td style="padding:15px; text-align:center; color:#60a5fa;">${marcado ? aulas + ' / 12' : '—'}</td>
                    <td style="padding:15px; text-align:center; color:#aaa; font-size:13px;">${fecha}</td>
                </tr>
            `;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top:15px; padding:15px; background:#1e3a8a; border-radius:8px; text-align:center;">
                <p style="color:#fff; margin:0; font-size:16px;">
                    ✅ <strong>${idsAsignados.length}</strong> estudiante(s) marcado(s) para tu materia
                </p>
            </div>
        `;
        
        contenedor.innerHTML = html;
        console.log("✅ Estudiantes cargados con progreso");
        
    } catch(error){
        console.error("❌ Error:", error.message);
        contenedor.innerHTML = `<p style="color:#ef4444; text-align:center;">Error: ${error.message}</p>`;
    }
}

/*=========================================================
PESTAÑA: PREGUNTAS (con edición)
=========================================================*/

async function mostrarPreguntasProfesor(){
    
    const contenedor = document.getElementById("contenidoProfesor");
    contenedor.innerHTML = "<p style='color:#aaa; text-align:center; padding:40px;'>Cargando preguntas...</p>";
    
    try {
        const { data: preguntas, error } = await supabaseClient
            .from('preguntas')
            .select('*')
            .eq('materia', profesorActual.materia);
        
        if(error) throw error;
        
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                <h2 style="color:#ffd700; margin:0;">📝 Preguntas de ${profesorActual.nombre.toUpperCase()}</h2>
                <button onclick="mostrarFormularioNuevaPregunta()" style="padding:12px 25px; background:#22c55e; color:white; border:none; border-radius:8px; cursor:pointer; font-size:16px; font-weight:bold;">
                    ➕ Nueva Pregunta
                </button>
            </div>
        `;
        
        if(!preguntas || preguntas.length === 0){
            html += `
                <div style="text-align:center; padding:40px; background:#1e293b; border-radius:12px;">
                    <p style="color:#aaa; font-size:18px;">📝 No hay preguntas para tu materia todavía.</p>
                    <p style="color:#666; font-size:14px; margin-top:10px;">Haz clic en "Nueva Pregunta" para crear la primera.</p>
                </div>
            `;
            contenedor.innerHTML = html;
            return;
        }
        
        for(let i = 0; i < preguntas.length; i++){
            const p = preguntas[i];
            
            html += `
                <div style="background:#1e293b; padding:20px; border-radius:12px; margin-bottom:15px; border-left:4px solid #ffd700;">
                    
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px;">
                        <p style="color:#fff; font-size:16px; margin:0; flex:1;"><strong>${i+1}.</strong> ${p.pregunta}</p>
                        
                        <div style="display:flex; gap:8px;">
                            <button onclick="editarPregunta('${p.id}')" style="padding:8px 15px; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px;">
                                ✏️ Editar
                            </button>
                            <button onclick="eliminarPregunta('${p.id}')" style="padding:8px 15px; background:#dc2626; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px;">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px;">
                        <div style="padding:8px; background:${p.correcta === 0 ? '#166534' : '#334155'}; border-radius:6px; color:#fff;">A) ${p.respuesta_a}</div>
                        <div style="padding:8px; background:${p.correcta === 1 ? '#166534' : '#334155'}; border-radius:6px; color:#fff;">B) ${p.respuesta_b}</div>
                        <div style="padding:8px; background:${p.correcta === 2 ? '#166534' : '#334155'}; border-radius:6px; color:#fff;">C) ${p.respuesta_c}</div>
                        <div style="padding:8px; background:${p.correcta === 3 ? '#166534' : '#334155'}; border-radius:6px; color:#fff;">D) ${p.respuesta_d}</div>
                    </div>
                    
                    <p style="color:#22c55e; margin-top:10px; font-size:14px;">✅ Respuesta correcta: ${["A", "B", "C", "D"][p.correcta]}</p>
                </div>
            `;
        }
        
        contenedor.innerHTML = html;
        console.log("✅ Preguntas cargadas:", preguntas.length);
        
    } catch(error){
        console.error("❌ Error al cargar preguntas:", error.message);
        contenedor.innerHTML = `<p style="color:#ef4444; text-align:center;">Error: ${error.message}</p>`;
    }
}

/*=========================================================
PESTAÑA: MODO EXAMEN
=========================================================*/

async function mostrarExamenProfesor(){
    
    const contenedor = document.getElementById("contenidoProfesor");
    
    contenedor.innerHTML = `
        <div style="background:#1e293b; padding:30px; border-radius:12px; max-width:600px; margin:0 auto; text-align:center;">
            <h2 style="color:#ffd700; margin-bottom:20px;">📋 Modo Examen</h2>
            <p style="color:#aaa; margin-bottom:20px;">Activa el modo examen para que TODAS las aulas sean de tu materia.</p>
            
            <div id="estadoExamen" style="padding:20px; background:#0f172a; border-radius:8px; margin-bottom:20px;">
                <p style="color:#aaa;">Cargando estado...</p>
            </div>
            
            <button onclick="activarModoExamen()" style="padding:15px 40px; background:#22c55e; color:white; border:none; border-radius:8px; cursor:pointer; font-size:18px; font-weight:bold; margin:5px;">
                ✅ Activar Modo Examen
            </button>
            
            <button onclick="desactivarModoExamen()" style="padding:15px 40px; background:#dc2626; color:white; border:none; border-radius:8px; cursor:pointer; font-size:18px; font-weight:bold; margin:5px;">
                ❌ Desactivar Modo Examen
            </button>
        </div>
    `;
    
    // Verificar estado actual
    try {
        const { data, error } = await supabaseClient
            .from('configuracion_profesor')
            .select('*')
            .eq('profesor_id', profesorActual.id)
            .eq('materia', profesorActual.materia)
            .single();
        
        const estado = document.getElementById("estadoExamen");
        if(data && data.modo_examen){
            estado.innerHTML = `<p style="color:#22c55e; font-size:20px;">🟢 MODO EXAMEN ACTIVADO</p>`;
        } else {
            estado.innerHTML = `<p style="color:#aaa; font-size:20px;">⚪ Modo Examen desactivado</p>`;
        }
        
    } catch(error){
        console.log("⚠️ No hay configuración previa");
    }
}

/*=========================================================
ACTIVAR MODO EXAMEN
=========================================================*/

async function activarModoExamen(){
    
    try {
        // Verificar si ya tiene estudiantes asignados
        const { data: asignados } = await supabaseClient
            .from('estudiantes_profesor')
            .select('estudiante_id')
            .eq('profesor_id', profesorActual.id)
            .eq('materia', profesorActual.materia)
            .eq('activo', true);
        
        if(!asignados || asignados.length === 0){
            alert("⚠️ Primero marca estudiantes en la pestaña 'Estudiantes'");
            return;
        }
        
        // Guardar o actualizar la configuración
        const { data: existente } = await supabaseClient
            .from('configuracion_profesor')
            .select('id')
            .eq('profesor_id', profesorActual.id)
            .eq('materia', profesorActual.materia)
            .single();
        
        if(existente){
            await supabaseClient
                .from('configuracion_profesor')
                .update({ 
                    modo_examen: true, 
                    fecha_actualizacion: new Date().toISOString() 
                })
                .eq('id', existente.id);
        } else {
            await supabaseClient
                .from('configuracion_profesor')
                .insert([{
                    profesor_id: profesorActual.id,
                    materia: profesorActual.materia,
                    modo_examen: true
                }]);
        }
        
        alert("✅ Modo Examen ACTIVADO\n\n" + asignados.length + " estudiante(s) verán TODAS las aulas de " + profesorActual.materia.toUpperCase());
        mostrarExamenProfesor();
        
    } catch(error){
        console.error("❌ Error:", error.message);
        alert("❌ Error al activar modo examen: " + error.message);
    }
}

/*=========================================================
DESACTIVAR MODO EXAMEN
=========================================================*/

async function desactivarModoExamen(){
    
    try {
        await supabaseClient
            .from('configuracion_profesor')
            .update({ 
                modo_examen: false, 
                fecha_actualizacion: new Date().toISOString() 
            })
            .eq('profesor_id', profesorActual.id)
            .eq('materia', profesorActual.materia);
        
        alert("❌ Modo Examen DESACTIVADO");
        mostrarExamenProfesor();
        
    } catch(error){
        console.error("❌ Error:", error.message);
        alert("❌ Error: " + error.message);
    }
}

/*=========================================================
PROBAR MI MATERIA (Modo Prueba del Profesor)
=========================================================*/

async function probarMiMateria(){
    
    console.log("🎮 Modo prueba activado para:", profesorActual.materia);
    
    // 🔴 Guardar que es modo prueba
    window.modoProfesorPrueba = true;
    
    // 🔴 ACTIVAR MODO MATERIA ÚNICA (esto faltaba)
    window.modoMateriaUnica = true;
    window.materiaUnicaActual = profesorActual.materia;
    
    // 🔴 Dar todas las llaves al profesor
    GameManager.llaves = 13;
    console.log("🔑 Profesor tiene acceso a todas las aulas");
    
    // 🔴 Buscar el ID de la materia
    const nombresMaterias = [
        "matematicas", "lenguaje", "ingles", "biologia",
        "quimica", "fisica", "literatura", "musica",
        "geografia", "arte", "historia", "religion"
    ];
    
    const idMateria = nombresMaterias.indexOf(profesorActual.materia);
    
    if(idMateria === -1){
        alert("⚠️ No se encontró la materia");
        return;
    }
    
    window.materiaSeleccionada = idMateria;
    console.log("📚 Materia seleccionada para prueba:", idMateria, profesorActual.materia);
    
    // 🔴 Ocultar panel del profesor
    document.getElementById("panelProfesor").style.display = "none";

    // 🔴 Despausar el juego al entrar al modo prueba
    if(typeof Juego !== "undefined"){
        Juego.pausado = false;
    }
    
    // 🔴 Iniciar juego
    iniciarJuego();
    
    // 🔴 Después de iniciar, mostrar botón "Volver al Panel"
    setTimeout(() => {
        mostrarBotonVolverAlPanel();
    }, 1000);
}

/*=========================================================
MOSTRAR BOTÓN VOLVER AL PANEL
=========================================================*/

function mostrarBotonVolverAlPanel(){
    
    // 🔴 Verificar si ya existe
    if(document.getElementById("btnVolverPanel")) return;
    
    // 🔴 Crear botón
    const btn = document.createElement("button");
    btn.id = "btnVolverPanel";
    btn.innerText = "◀ Volver al Panel";
    btn.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        padding: 12px 25px;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 99999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    `;
    btn.onclick = volverAlPanelProfesor;
    document.body.appendChild(btn);
    
    console.log("✅ Botón 'Volver al Panel' añadido");
}

/*=========================================================
VOLVER AL PANEL DEL PROFESOR
=========================================================*/

async function volverAlPanelProfesor(){
    
    console.log("🔙 Volviendo al panel del profesor...");

    // 🔴 PAUSAR EL JUEGO al volver al panel
    // (Evita que siga corriendo en segundo plano)
    if(typeof Juego !== "undefined"){
        Juego.pausado = true;
    }
    
    // 🔴 Eliminar botón
    const btn = document.getElementById("btnVolverPanel");
    if(btn) btn.remove();
    
    // 🔴 Ocultar juego
    const contenedor = document.getElementById("contenedorJuego");
    if(contenedor) contenedor.style.display = "none";
    
    // 🔴 Detener teclas
    if(typeof Juego !== "undefined" && Juego.teclas){
        for(let key in Juego.teclas){
            Juego.teclas[key] = false;
        }
    }
    
    // 🔴 Mostrar panel del profesor
    document.getElementById("panelProfesor").style.display = "flex";
    
    // 🔴 Resetear modo prueba
    window.modoProfesorPrueba = false;
    
    // 🔴 Recargar página para limpiar el juego (más seguro)
    // Si no quieres recargar, comenta esta línea:
    // location.reload();
    
    console.log("✅ Volviste al panel del profesor");
}

/*=========================================================
FORMULARIO: NUEVA PREGUNTA
=========================================================*/

function mostrarFormularioNuevaPregunta(){
    
    const contenedor = document.getElementById("contenidoProfesor");
    
    contenedor.innerHTML = `
        <div style="background:#1e293b; padding:30px; border-radius:12px; max-width:700px; margin:0 auto;">
            
            <h2 style="color:#ffd700; margin-bottom:20px;">➕ Nueva Pregunta</h2>
            
            <label style="display:block; color:#aaa; margin-bottom:5px;">Pregunta:</label>
            <textarea id="inputPregunta" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:15px; min-height:60px;" placeholder="Escribe la pregunta..."></textarea>
            
            <label style="display:block; color:#aaa; margin-bottom:5px;">Respuesta A:</label>
            <input id="inputA" type="text" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:15px;">
            
            <label style="display:block; color:#aaa; margin-bottom:5px;">Respuesta B:</label>
            <input id="inputB" type="text" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:15px;">
            
            <label style="display:block; color:#aaa; margin-bottom:5px;">Respuesta C:</label>
            <input id="inputC" type="text" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:15px;">
            
            <label style="display:block; color:#aaa; margin-bottom:5px;">Respuesta D:</label>
            <input id="inputD" type="text" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:15px;">
            
            <label style="display:block; color:#aaa; margin-bottom:5px;">Respuesta Correcta:</label>
            <select id="inputCorrecta" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:20px;">
                <option value="0">A</option>
                <option value="1">B</option>
                <option value="2">C</option>
                <option value="3">D</option>
            </select>
            
            <div style="display:flex; gap:10px;">
                <button onclick="guardarNuevaPregunta()" style="flex:1; padding:15px; background:#22c55e; color:white; border:none; border-radius:8px; cursor:pointer; font-size:18px; font-weight:bold;">
                    💾 Guardar
                </button>
                <button onclick="mostrarPreguntasProfesor()" style="flex:1; padding:15px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer; font-size:18px;">
                    ❌ Cancelar
                </button>
            </div>
            
        </div>
    `;
}

/*=========================================================
GUARDAR NUEVA PREGUNTA
=========================================================*/

async function guardarNuevaPregunta(){
    
    const pregunta = document.getElementById("inputPregunta").value.trim();
    const a = document.getElementById("inputA").value.trim();
    const b = document.getElementById("inputB").value.trim();
    const c = document.getElementById("inputC").value.trim();
    const d = document.getElementById("inputD").value.trim();
    const correcta = parseInt(document.getElementById("inputCorrecta").value);
    
    // Validar
    if(!pregunta || !a || !b || !c || !d){
        alert("⚠️ Todos los campos son obligatorios");
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('preguntas')
            .insert([{
                materia: profesorActual.materia,
                pregunta: pregunta,
                respuesta_a: a,
                respuesta_b: b,
                respuesta_c: c,
                respuesta_d: d,
                correcta: correcta,
                creado_por: profesorActual.id
            }]);
        
        if(error) throw error;
        
        alert("✅ Pregunta guardada");
        mostrarPreguntasProfesor();
        
    } catch(error){
        console.error("❌ Error:", error.message);
        alert("❌ Error al guardar: " + error.message);
    }
}

/*=========================================================
EDITAR PREGUNTA
=========================================================*/

async function editarPregunta(preguntaId){
    
    try {
        // Obtener la pregunta
        const { data: p, error } = await supabaseClient
            .from('preguntas')
            .select('*')
            .eq('id', preguntaId)
            .single();
        
        if(error) throw error;
        
        const contenedor = document.getElementById("contenidoProfesor");
        
        contenedor.innerHTML = `
            <div style="background:#1e293b; padding:30px; border-radius:12px; max-width:700px; margin:0 auto;">
                
                <h2 style="color:#ffd700; margin-bottom:20px;">✏️ Editar Pregunta</h2>
                
                <label style="display:block; color:#aaa; margin-bottom:5px;">Pregunta:</label>
                <textarea id="inputPregunta" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:15px; min-height:60px;">${p.pregunta}</textarea>
                
                <label style="display:block; color:#aaa; margin-bottom:5px;">Respuesta A:</label>
                <input id="inputA" type="text" value="${p.respuesta_a}" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:15px;">
                
                <label style="display:block; color:#aaa; margin-bottom:5px;">Respuesta B:</label>
                <input id="inputB" type="text" value="${p.respuesta_b}" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:15px;">
                
                <label style="display:block; color:#aaa; margin-bottom:5px;">Respuesta C:</label>
                <input id="inputC" type="text" value="${p.respuesta_c}" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:15px;">
                
                <label style="display:block; color:#aaa; margin-bottom:5px;">Respuesta D:</label>
                <input id="inputD" type="text" value="${p.respuesta_d}" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:15px;">
                
                <label style="display:block; color:#aaa; margin-bottom:5px;">Respuesta Correcta:</label>
                <select id="inputCorrecta" style="width:100%; padding:12px; border-radius:8px; border:2px solid #334155; background:#0f172a; color:#fff; font-size:16px; margin-bottom:20px;">
                    <option value="0" ${p.correcta === 0 ? 'selected' : ''}>A</option>
                    <option value="1" ${p.correcta === 1 ? 'selected' : ''}>B</option>
                    <option value="2" ${p.correcta === 2 ? 'selected' : ''}>C</option>
                    <option value="3" ${p.correcta === 3 ? 'selected' : ''}>D</option>
                </select>
                
                <input type="hidden" id="inputIdPregunta" value="${preguntaId}">
                
                <div style="display:flex; gap:10px;">
                    <button onclick="guardarEdicionPregunta()" style="flex:1; padding:15px; background:#22c55e; color:white; border:none; border-radius:8px; cursor:pointer; font-size:18px; font-weight:bold;">
                        💾 Guardar Cambios
                    </button>
                    <button onclick="mostrarPreguntasProfesor()" style="flex:1; padding:15px; background:#555; color:white; border:none; border-radius:8px; cursor:pointer; font-size:18px;">
                        ❌ Cancelar
                    </button>
                </div>
                
            </div>
        `;
        
    } catch(error){
        console.error("❌ Error:", error.message);
        alert("Error al cargar pregunta: " + error.message);
    }
}

/*=========================================================
GUARDAR EDICIÓN DE PREGUNTA
=========================================================*/

async function guardarEdicionPregunta(){
    
    const id = document.getElementById("inputIdPregunta").value;
    const pregunta = document.getElementById("inputPregunta").value.trim();
    const a = document.getElementById("inputA").value.trim();
    const b = document.getElementById("inputB").value.trim();
    const c = document.getElementById("inputC").value.trim();
    const d = document.getElementById("inputD").value.trim();
    const correcta = parseInt(document.getElementById("inputCorrecta").value);
    
    if(!pregunta || !a || !b || !c || !d){
        alert("⚠️ Todos los campos son obligatorios");
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('preguntas')
            .update({
                pregunta: pregunta,
                respuesta_a: a,
                respuesta_b: b,
                respuesta_c: c,
                respuesta_d: d,
                correcta: correcta
            })
            .eq('id', id);
        
        if(error) throw error;
        
        alert("✅ Pregunta actualizada");
        mostrarPreguntasProfesor();
        
    } catch(error){
        console.error("❌ Error:", error.message);
        alert("❌ Error al guardar: " + error.message);
    }
}

/*=========================================================
ELIMINAR PREGUNTA
=========================================================*/

async function eliminarPregunta(preguntaId){
    
    if(!confirm("¿Seguro que quieres eliminar esta pregunta?")) return;
    
    try {
        const { error } = await supabaseClient
            .from('preguntas')
            .delete()
            .eq('id', preguntaId);
        
        if(error) throw error;
        
        alert("✅ Pregunta eliminada");
        mostrarPreguntasProfesor();
        
    } catch(error){
        console.error("❌ Error:", error.message);
        alert("❌ Error al eliminar: " + error.message);
    }
}


/*=========================================================
MARCAR/DESMARCAR ESTUDIANTE
Cuando el profesor marca un checkbox, se guarda en Supabase
=========================================================*/

async function toggleEstudiante(estudianteId, marcado){
    
    try {
        if(marcado){
            // 🔴 Insertar asignación
            const { error } = await supabaseClient
                .from('estudiantes_profesor')
                .insert([{
                    profesor_id: profesorActual.id,
                    estudiante_id: estudianteId,
                    materia: profesorActual.materia,
                    activo: true
                }]);
            
            // Si el error es "ya existe", lo ignoramos
            if(error && error.code !== '23505'){
                throw error;
            }
            
            console.log("✅ Estudiante asignado:", estudianteId);
            
        } else {
            // 🔴 Eliminar asignación
            const { error } = await supabaseClient
                .from('estudiantes_profesor')
                .delete()
                .eq('profesor_id', profesorActual.id)
                .eq('estudiante_id', estudianteId)
                .eq('materia', profesorActual.materia);
            
            if(error) throw error;
            
            console.log("✅ Estudiante removido:", estudianteId);
        }
        
        // Recargar la lista para actualizar el contador
        mostrarEstudiantesProfesor();
        
    } catch(error){
        console.error("❌ Error:", error.message);
        alert("Error al guardar: " + error.message);
    }
}

/*=========================================================
PESTAÑA: PROGRESO
Muestra el progreso de los estudiantes marcados
=========================================================*/

async function mostrarProgresoProfesor(){
    
    const contenedor = document.getElementById("contenidoProfesor");
    contenedor.innerHTML = "<p style='color:#aaa; text-align:center; padding:40px;'>Cargando progreso...</p>";
    
    try {
        // 🔴 Obtener estudiantes asignados a este profesor
        const { data: asignaciones, error } = await supabaseClient
            .from('estudiantes_profesor')
            .select(`
                estudiante_id,
                usuarios:estudiante_id (nombre, correo)
            `)
            .eq('profesor_id', profesorActual.id)
            .eq('materia', profesorActual.materia)
            .eq('activo', true);
        
        if(error) throw error;
        
        let html = `
            <h2 style="color:#ffd700; margin-bottom:20px;">📊 Progreso de mis Estudiantes</h2>
        `;
        
        if(!asignaciones || asignaciones.length === 0){
            html += `
                <div style="text-align:center; padding:40px; background:#1e293b; border-radius:12px;">
                    <p style="color:#aaa; font-size:18px;">📭 No tienes estudiantes marcados.</p>
                    <p style="color:#666; font-size:14px; margin-top:10px;">Ve a la pestaña "Estudiantes" y marca quiénes son tuyos.</p>
                </div>
            `;
            contenedor.innerHTML = html;
            return;
        }
        
        // 🔴 Obtener progreso de cada estudiante
        const estudiantesConProgreso = [];
        
        for(const asig of asignaciones){
            
            const { data: progreso } = await supabaseClient
                .from('progreso')
                .select('*')
                .eq('estudiante_id', asig.estudiante_id)
                .eq('materia', profesorActual.materia)
                .maybeSingle();

            estudiantesConProgreso.push({
                nombre: asig.usuarios?.nombre || "Sin nombre",
                llaves: progreso?.llaves_obtenidas || 0,
                puntaje: progreso?.puntaje || 0,
                aulas: progreso?.aulas_completadas?.length || 0,
                fecha: progreso?.actualizado_en 
                    ? new Date(progreso.actualizado_en).toLocaleDateString() 
                    : "Nunca"
            });
        }
        
        // 🔴 Ordenar por puntaje (mayor a menor)
        estudiantesConProgreso.sort((a, b) => b.puntaje - a.puntaje);
        
        // 🔴 Estadísticas generales
        let totalLlaves = 0;
        let totalPuntaje = 0;
        
        for(const est of estudiantesConProgreso){
            totalLlaves += est.llaves;
            totalPuntaje += est.puntaje;
        }
        
        const promedioLlaves = (totalLlaves / estudiantesConProgreso.length).toFixed(1);
        const promedioPuntaje = Math.round(totalPuntaje / estudiantesConProgreso.length);
        
        html += `
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:15px; margin-bottom:25px;">
                <div style="background:#1e293b; padding:20px; border-radius:12px; text-align:center;">
                    <div style="color:#ffd700; font-size:32px; font-weight:bold;">${estudiantesConProgreso.length}</div>
                    <div style="color:#aaa; font-size:14px;">Estudiantes</div>
                </div>
                <div style="background:#1e293b; padding:20px; border-radius:12px; text-align:center;">
                    <div style="color:#22c55e; font-size:32px; font-weight:bold;">${promedioLlaves}</div>
                    <div style="color:#aaa; font-size:14px;">Promedio Llaves</div>
                </div>
                <div style="background:#1e293b; padding:20px; border-radius:12px; text-align:center;">
                    <div style="color:#60a5fa; font-size:32px; font-weight:bold;">${promedioPuntaje}</div>
                    <div style="color:#aaa; font-size:14px;">Promedio Puntaje</div>
                </div>
            </div>
        `;
        
        // 🔴 Tabla de progreso
        html += `
            <div style="background:#1e293b; border-radius:12px; overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; min-width:700px;">
                    <thead>
                        <tr style="background:#2563eb;">
                            <th style="padding:15px; text-align:center; width:50px;">#</th>
                            <th style="padding:15px; text-align:left;">Estudiante</th>
                            <th style="padding:15px; text-align:center;">🔑 Llaves</th>
                            <th style="padding:15px; text-align:center;">🏆 Puntaje</th>
                            <th style="padding:15px; text-align:center;">📚 Aulas</th>
                            <th style="padding:15px; text-align:center;">⏱️ Última vez</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for(let i = 0; i < estudiantesConProgreso.length; i++){
            
            const est = estudiantesConProgreso[i];
            
            // Medalla según posición
            let medalla = "";
            if(i === 0) medalla = "🥇";
            else if(i === 1) medalla = "🥈";
            else if(i === 2) medalla = "🥉";
            else medalla = (i + 1);
            
            // Color según progreso
            let colorLlaves = "#fff";
            if(est.llaves >= 10) colorLlaves = "#22c55e";
            else if(est.llaves >= 5) colorLlaves = "#ffd700";
            else colorLlaves = "#ef4444";
            
            html += `
                <tr style="border-bottom:1px solid #334155;">
                    <td style="padding:15px; text-align:center; color:#ffd700; font-weight:bold; font-size:18px;">${medalla}</td>
                    <td style="padding:15px; color:#fff;">${est.nombre}</td>
                    <td style="padding:15px; text-align:center; color:${colorLlaves}; font-weight:bold;">${est.llaves} / 13</td>
                    <td style="padding:15px; text-align:center; color:#22c55e; font-weight:bold;">${est.puntaje}</td>
                    <td style="padding:15px; text-align:center; color:#60a5fa;">${est.aulas} / 12</td>
                    <td style="padding:15px; text-align:center; color:#aaa; font-size:13px;">${est.fecha}</td>
                </tr>
            `;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        contenedor.innerHTML = html;
        console.log("✅ Progreso cargado:", estudiantesConProgreso.length);
        
    } catch(error){
        console.error("❌ Error:", error.message);
        contenedor.innerHTML = `<p style="color:#ef4444; text-align:center;">Error: ${error.message}</p>`;
    }
}
