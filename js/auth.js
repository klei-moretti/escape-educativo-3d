"use strict";

/*=========================================================
CONEXIÓN CON SUPABASE
=========================================================*/

// Credenciales de Supabase
const SUPABASE_URL = "https://ioywbtmfyoebmxgbsaar.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlveXdidG1meW9lYm14Z2JzYWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MjQ3MDcsImV4cCI6MjEwNTEwMDcwN30.kLBkadXzzZdDUvKXAyJFK7MAytVrknvtBtkO5fcVbK4"; // ← PON TU CLAVE COMPLETA

// Cliente de Supabase (renombrado para no chocar)
let supabaseClient = null;

function inicializarSupabase(){
    if(!window.supabase){
        console.error("❌ Librería de Supabase no cargada");
        return;
    }
    
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase conectado");
}

// Inicializar al cargar
inicializarSupabase();