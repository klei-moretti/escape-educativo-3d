"use strict";

/*=========================================================
REGISTRO Y LOGIN
=========================================================*/

async function registrarUsuario(nombre, correo, password, tipo = "estudiante"){
    
    if(!supabaseClient){
        console.error("❌ Supabase no está inicializado");
        return null;
    }

    try {
        // 1. Registrar en Auth
        const { data, error } = await supabaseClient.auth.signUp({
            email: correo,
            password: password
        });

        if(error) throw error;

        // 2. Determinar la materia (solo si es profesor)
        let materia = null;
        if(tipo === "profesor"){
            materia = nombre.toLowerCase();
        }

        // 3. Guardar en tabla usuarios
        const { error: errorUsuario } = await supabaseClient
            .from('usuarios')
            .insert([{
                id: data.user.id,
                nombre: nombre,
                rol: tipo,           // estudiante / profesor / tutor
                tipo: tipo,          // por si acaso
                materia: materia,    // solo profesores
                correo: correo
            }]);

        if(errorUsuario) throw errorUsuario;

        console.log("✅ Usuario registrado:", nombre, "como", tipo);
        return data.user;

    } catch(error){
        console.error("❌ Error al registrar:", error.message);
        return null;
    }
}

async function iniciarSesion(correo, password){
    
    if(!supabaseClient) return null;

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: correo,
            password: password
        });

        if(error) throw error;

        console.log("✅ Sesión iniciada");
        return data.user;

    } catch(error){
        console.error("❌ Error al iniciar sesión:", error.message);
        return null;
    }
}

async function cerrarSesion(){
    if(!supabaseClient) return;
    await supabaseClient.auth.signOut();
    console.log("👋 Sesión cerrada");
}

/*=========================================================
GUARDAR PROGRESO EN SUPABASE
=========================================================*/

async function guardarProgreso(llaves, puntaje, aulas){
    
    console.log("💾 Guardando progreso:", llaves, "llaves");
    
    if(!supabaseClient){
        console.error("❌ Supabase no está inicializado");
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if(!user){
        console.error("❌ No hay usuario logueado");
        return;
    }
    
    console.log("👤 Usuario:", user.id);

    // 🔴 Obtener la materia actual
    let materiaActual = "general";
    
    if(window.modoMateriaUnica && window.materiaUnicaActual){
        materiaActual = window.materiaUnicaActual;
        console.log("🎯 Modo materia única:", materiaActual);
    } else if(typeof window.materiaSeleccionada === "number"){
        const nombresMaterias = [
            "Matematicas", "Lenguaje", "Ingles", "Biologia",
            "Quimica", "Fisica", "Literatura", "Musica",
            "Geografia", "Arte", "Historia", "Religion"
        ];
        materiaActual = nombresMaterias[window.materiaSeleccionada];
        console.log("📚 Materia seleccionada:", materiaActual);
    }
    
    console.log("📝 Guardando con materia:", materiaActual);

    try {
        // 🔴 BUSCAR si ya existe progreso para este estudiante + materia
        const { data: existente, error: errorBuscar } = await supabaseClient
            .from('progreso')
            .select('id')
            .eq('estudiante_id', user.id)
            .eq('materia', materiaActual)
            .maybeSingle();
        
        console.log("🔍 Progreso existente:", existente);
        
        if(errorBuscar){
            console.error("Error buscando:", errorBuscar.message);
        }

        if(existente){
            // 🔄 ACTUALIZAR
            const { error } = await supabaseClient
                .from('progreso')
                .update({
                    llaves_obtenidas: llaves,
                    puntaje: puntaje,
                    aulas_completadas: aulas,
                    actualizado_en: new Date().toISOString()
                })
                .eq('id', existente.id);

            if(error) throw error;
            console.log("✅ Progreso ACTUALIZADO:", llaves, "llaves |", materiaActual);

        } else {
            // ➕ INSERTAR
            const { error } = await supabaseClient
                .from('progreso')
                .insert([{
                    estudiante_id: user.id,
                    llaves_obtenidas: llaves,
                    puntaje: puntaje,
                    aulas_completadas: aulas,
                    materia: materiaActual,
                    fecha_inicio: new Date().toISOString(),
                    actualizado_en: new Date().toISOString()
                }]);

            if(error) throw error;
            console.log("✅ Progreso INSERTADO:", llaves, "llaves |", materiaActual);
        }

    } catch(error){
        console.error("❌ Error al guardar progreso:", error.message);
    }
}

/*=========================================================
OBTENER PREGUNTAS DE SUPABASE
=========================================================*/

async function obtenerPreguntas(materia){
    
    if(!supabaseClient){
        console.error("❌ Supabase no está inicializado");
        return [];
    }

    try {
        const { data, error } = await supabaseClient
            .from('preguntas')
            .select('*')
            .eq('materia', materia);

        if(error) throw error;

        console.log("✅ Preguntas obtenidas:", data.length);
        return data;

    } catch(error){
        console.error("❌ Error al obtener preguntas:", error.message);
        return [];
    }
}

/*=========================================================
ASIGNAR ESTUDIANTE A PROFESOR
Cuando un estudiante elige una materia, se asigna
automáticamente al profesor de esa materia
=========================================================*/

async function asignarEstudianteAProfesor(materia){
    
    if(!supabaseClient) return;
    if(materia === "general") return; // Si es general, no se asigna a nadie

    try {
        // 🔴 Obtener el usuario actual
        const { data: { user } } = await supabaseClient.auth.getUser();
        if(!user) return;

        // 🔴 Buscar al profesor de esa materia
        const nombreMateria = materia.toLowerCase();
        
        const { data: profesor, error: errorProfesor } = await supabaseClient
            .from('usuarios')
            .select('id')
            .eq('tipo', 'profesor')
            .eq('materia', nombreMateria)
            .single();

        if(errorProfesor || !profesor){
            console.log("⚠️ No se encontró profesor para:", nombreMateria);
            return;
        }

        // 🔴 Verificar si ya está asignado
        const { data: existente } = await supabaseClient
            .from('estudiantes_profesor')
            .select('id')
            .eq('profesor_id', profesor.id)
            .eq('estudiante_id', user.id)
            .eq('materia', nombreMateria)
            .single();

        if(existente){
            console.log("✅ Estudiante ya asignado al profesor de", nombreMateria);
            return;
        }

        // 🔴 Insertar asignación
        const { error } = await supabaseClient
            .from('estudiantes_profesor')
            .insert([{
                profesor_id: profesor.id,
                estudiante_id: user.id,
                materia: nombreMateria,
                activo: true
            }]);

        if(error) throw error;
        console.log("✅ Estudiante asignado al profesor de:", nombreMateria);

    } catch(error){
        console.error("❌ Error al asignar estudiante:", error.message);
    }
}

/*=========================================================
VERIFICAR SI EL ESTUDIANTE TIENE MODO EXAMEN ACTIVADO
=========================================================*/

async function verificarModoExamenEstudiante(){
    
    if(!supabaseClient) return null;
    
    try {
        // Obtener el usuario actual
        const { data: { user } } = await supabaseClient.auth.getUser();
        if(!user) return null;
        
        // Buscar en estudiantes_profesor si el estudiante está asignado
        const { data: asignaciones, error } = await supabaseClient
            .from('estudiantes_profesor')
            .select('materia, profesor_id')
            .eq('estudiante_id', user.id)
            .eq('activo', true);
        
        if(error) throw error;
        if(!asignaciones || asignaciones.length === 0) return null;
        
        // Para cada asignación, verificar si el profesor tiene modo examen activado
        for(const asig of asignaciones){
            
            const { data: config } = await supabaseClient
                .from('configuracion_profesor')
                .select('*')
                .eq('profesor_id', asig.profesor_id)
                .eq('materia', asig.materia)
                .eq('modo_examen', true)
                .single();
            
            if(config && config.modo_examen){
                console.log("🎯 Modo examen detectado:", asig.materia);
                return {
                    materia: asig.materia,
                    profesor_id: asig.profesor_id
                };
            }
        }
        
        return null;
        
    } catch(error){
        console.error("❌ Error:", error.message);
        return null;
    }
}
