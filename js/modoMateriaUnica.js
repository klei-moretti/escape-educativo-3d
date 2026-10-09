"use strict";

/*=========================================================
SISTEMA DE MODO MATERIA ÚNICA
Cuando se elige una materia específica (o modo examen),
TODAS las aulas usan SOLO esa materia
=========================================================*/

// Variables globales
window.modoMateriaUnica = false;
window.materiaUnicaActual = "general";

/*=========================================================
ACTIVAR MODO MATERIA ÚNICA
=========================================================*/

function activarModoMateriaUnica(nombreMateria){
    
    window.modoMateriaUnica = true;
    window.materiaUnicaActual = nombreMateria;
    
    console.log("🎯 MODO MATERIA ÚNICA ACTIVADO:", nombreMateria);
    
    // Cambiar el HUD
    const contador = document.getElementById("contadorLlaves");
    if(contador){
        contador.innerHTML = `🔑 ${nombreMateria.toUpperCase()}: 0 / 13`;
    }
}

/*=========================================================
DESACTIVAR MODO MATERIA ÚNICA
=========================================================*/

function desactivarModoMateriaUnica(){
    
    window.modoMateriaUnica = false;
    window.materiaUnicaActual = "general";
    
    console.log("🎓 Modo materia única DESACTIVADO");
}

/*=========================================================
OBTENER PREGUNTAS DE LA MATERIA ÚNICA
=========================================================*/

async function obtenerPreguntasMateriaUnica(){
    
    if(!window.modoMateriaUnica) return null;
    if(!window.materiaUnicaActual) return null;
    
    try {
        const { data, error } = await supabaseClient
            .from('preguntas')
            .select('*')
            .eq('materia', window.materiaUnicaActual);
        
        if(error) throw error;
        
        console.log("📚 Preguntas de materia única:", data.length);
        return data;
        
    } catch(error){
        console.error("❌ Error:", error.message);
        return [];
    }
}