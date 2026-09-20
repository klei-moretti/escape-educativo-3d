"use strict";

/*=========================================================
REGISTRO Y LOGIN
=========================================================*/

async function registrarUsuario(nombre, correo, password){
    
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

        // 2. Guardar en tabla usuarios
        const { error: errorUsuario } = await supabaseClient
            .from('usuarios')
            .insert([{     // --- este es el request de escritura
                id: data.user.id,
                nombre: nombre,
                rol: 'estudiante',
                correo: correo
            }]);

        if(errorUsuario) throw errorUsuario;

        console.log("✅ Usuario registrado:", nombre);
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
    
    if(!supabaseClient){
        console.error("❌ Supabase no está inicializado");
        return;
    }

    // Obtener el usuario actual
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if(!user){
        console.error("❌ No hay usuario logueado");
        return;
    }

    try {
        // Verificar si ya existe progreso
        const { data: existente } = await supabaseClient
            .from('progreso')
            .select('id')
            .eq('estudiante_id', user.id)
            .single();

        if(existente){
            // Actualizar
            const { error } = await supabaseClient
                .from('progreso')
                .update({
                    llaves_obtenidas: llaves,
                    puntaje: puntaje,
                    aulas_completadas: aulas,
                    actualizado_en: new Date().toISOString()
                })
                .eq('estudiante_id', user.id);

            if(error) throw error;
            console.log("✅ Progreso actualizado:", llaves, "llaves");

        } else {
            // Insertar nuevo
            const { error } = await supabaseClient
                .from('progreso')
                .insert([{
                    estudiante_id: user.id,
                    llaves_obtenidas: llaves,
                    puntaje: puntaje,
                    aulas_completadas: aulas,
                    fecha_inicio: new Date().toISOString(),
                    actualizado_en: new Date().toISOString()
                }]);

            if(error) throw error;
            console.log("✅ Progreso guardado:", llaves, "llaves");
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