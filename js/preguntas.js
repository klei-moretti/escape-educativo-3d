"use strict";

/*=========================================================
PREGUNTAS DEL JUEGO - NIVEL SECUNDARIA
=========================================================*/

const Preguntas = {

// =============================================
// 0 - MATEMÁTICAS
// =============================================
0:[
    {
        p: "¿Cuál es el resultado de 8 × 9?",
        r: ["72", "81", "64", "63"],
        c: 0
    },
    {
        p: "¿Cuál es la raíz cuadrada de 100?",
        r: ["5", "10", "15", "20"],
        c: 1
    }
],

// =============================================
// 1 - LENGUAJE
// =============================================
1:[
    {
        p: "¿Cuál es el sinónimo de 'feliz'?",
        r: ["Triste", "Alegre", "Enojado", "Cansado"],
        c: 1
    },
    {
        p: "¿Qué tipo de palabra es 'correr'?",
        r: ["Sustantivo", "Adjetivo", "Verbo", "Adverbio"],
        c: 2
    }
],

// =============================================
// 2 - INGLÉS
// =============================================
2:[
    {
        p: "How do you say 'hola' in English?",
        r: ["Goodbye", "Hello", "Thank you", "Please"],
        c: 1
    },
    {
        p: "What is the past of 'go'?",
        r: ["Goed", "Going", "Went", "Gone"],
        c: 2
    }
],

// =============================================
// 3 - BIOLOGÍA
// =============================================
3:[
    {
        p: "¿Cuál es el órgano principal del sistema circulatorio?",
        r: ["Pulmón", "Corazón", "Hígado", "Estómago"],
        c: 1
    },
    {
        p: "¿Qué proceso realizan las plantas para producir su alimento?",
        r: ["Respiración", "Fotosíntesis", "Digestión", "Transpiración"],
        c: 1
    }
],

// =============================================
// 4 - QUÍMICA
// =============================================
4:[
    {
        p: "¿Cuál es el símbolo químico del agua?",
        r: ["CO2", "H2O", "NaCl", "HCl"],
        c: 1
    },
    {
        p: "¿Cuál de estos es un metal?",
        r: ["Oxígeno", "Hierro", "Carbono", "Azufre"],
        c: 1
    }
],

// =============================================
// 5 - FÍSICA
// =============================================
5:[
    {
        p: "¿Cuál es la unidad de medida de la fuerza?",
        r: ["Newton", "Joule", "Watt", "Voltio"],
        c: 0
    },
    {
        p: "¿Cuántos grados tiene un ángulo recto?",
        r: ["45°", "90°", "180°", "360°"],
        c: 1
    }
],

// =============================================
// 6 - FILOSOFIA
// =============================================
6:[
    {
        p: "¿Quién dijo 'Pienso, luego existo'?",
        r: ["Platón", "Descartes", "Aristóteles", "Sócrates"],
        c: 1
    },
    {
        p: "¿Cuál es la rama de la filosofía que estudia el conocimiento?",
        r: ["Ética", "Estética", "Epistemología", "Lógica"],
        c: 2
    }
],

// =============================================
// 7 - MÚSICA
// =============================================
7:[
    {
        p: "¿Cuántas cuerdas tiene una guitarra clásica?",
        r: ["4", "5", "6", "7"],
        c: 2
    },
    {
        p: "¿Qué instrumento se toca con un arco?",
        r: ["Guitarra", "Violín", "Piano", "Flauta"],
        c: 1
    }
],

// =============================================
// 8 - SOCIALES
// =============================================
8:[
    {
        p: "¿Cuál es el continente más grande del mundo?",
        r: ["África", "América", "Asia", "Europa"],
        c: 2
    },
    {
        p: "¿Cuál es la capital de Bolivia?",
        r: ["La Paz", "Sucre", "Cochabamba", "Oruro"],
        c: 1
    }
],

// =============================================
// 9 - ARTE
// =============================================
9:[
    {
        p: "¿Cuál de estos es un color primario?",
        r: ["Verde", "Naranja", "Azul", "Violeta"],
        c: 2
    },
    {
        p: "¿Quién pintó 'La Mona Lisa'?",
        r: ["Van Gogh", "Picasso", "Da Vinci", "Miguel Ángel"],
        c: 2
    }
],

// =============================================
// 10 - EDUCACION FISICA
// =============================================
10:[
    {
        p: "¿Cuántos jugadores tiene un equipo de fútbol en la cancha?",
        r: ["9", "10", "11", "12"],
        c: 2
    },
    {
        p: "¿Cada cuántos años se celebran los Juegos Olímpicos?",
        r: ["2", "3", "4", "5"],
        c: 2
    }
],

// =============================================
// 11 - RELIGIÓN
// =============================================
11:[
    {
        p: "¿Cuál es el libro sagrado del Cristianismo?",
        r: ["Torá", "Corán", "Biblia", "Vedas"],
        c: 2
    },
    {
        p: "¿Cuántos mandamientos hay en la tradición judeocristiana?",
        r: ["5", "10", "12", "7"],
        c: 1
    }
]

};

/*=========================================================
MOSTRAR PREGUNTA
=========================================================*/

async function mostrarPregunta(id){

    // 🔴 LIBERAR MOUSE
    if(typeof liberarMouseParaPopup === "function"){
        liberarMouseParaPopup();
    }
    
    // 🔴 SI ESTAMOS EN MODO MATERIA ÚNICA
    if(window.modoMateriaUnica && window.materiaUnicaActual){
        
        console.log("🎯 Modo materia única:", window.materiaUnicaActual);
        
        // Obtener preguntas de SOLO esa materia
        const lista = await obtenerPreguntas(window.materiaUnicaActual);
        
        if(!lista || lista.length === 0){
            console.log("⚠️ No hay preguntas de:", window.materiaUnicaActual);
            return;
        }
        
        window.aulaActual = id;
        
        const p = lista[Math.floor(Math.random()*lista.length)];

        window.preguntaActualId = p.id;

        // 🔴 LIBERAR POINTER LOCK (para que aparezca el mouse)
        if(document.pointerLockElement){
            document.exitPointerLock();
        }
    
        // 🔴 PAUSAR MOVIMIENTO
        Juego.pausado = true;

        
        document.getElementById("popup").style.display = "block";
        Juego.teclas["e"] = false;
        
        document.getElementById("textoPregunta").innerText = p.pregunta;
        document.getElementById("respuestaA").innerText = p.respuesta_a;
        document.getElementById("respuestaB").innerText = p.respuesta_b;
        document.getElementById("respuestaC").innerText = p.respuesta_c;
        document.getElementById("respuestaD").innerText = p.respuesta_d;
        
        window.respuestaCorrecta = p.correcta;
        
        return;
    }
    
    // =============================================
    // MODO NORMAL (General)
    // =============================================
    
    const materias = [
        "Matemáticas", "Lenguaje", "Inglés", "Biología",
        "Química", "Física", "Literatura", "Música",
        "Geografía", "Arte", "Historia", "Religión"
    ];

    const nombreMateria = materias[id];

    let lista = await obtenerPreguntas(nombreMateria);

    if(!lista || lista.length === 0){
        console.log("⚠️ Usando preguntas locales para:", nombreMateria);
        lista = Preguntas[id];
    }

    window.aulaActual = id;

    if(!lista) return;

    const p = lista[Math.floor(Math.random()*lista.length)];

    document.getElementById("popup").style.display = "block";
    Juego.teclas["e"] = false;

    document.getElementById("textoPregunta").innerText = p.pregunta || p.p;
    document.getElementById("respuestaA").innerText = p.respuesta_a || p.r[0];
    document.getElementById("respuestaB").innerText = p.respuesta_b || p.r[1];
    document.getElementById("respuestaC").innerText = p.respuesta_c || p.r[2];
    document.getElementById("respuestaD").innerText = p.respuesta_d || p.r[3];

    window.respuestaCorrecta = p.correcta !== undefined ? p.correcta : p.c;
}

/*=========================================================
RESPONDER (con SISTEMA DE PENALIZACIÓN)
=========================================================
- Si acierta: Suma PUNTOS (no llave)
- La llave física se recoge manualmente
- Total del juego: 100 puntos
- Cada aula vale: 100 / 12 = 8 puntos
=========================================================*/

async function responder(op){

    if(!window.intentosPorAula){
        window.intentosPorAula = {};
    }
    
    if(!window.intentosPorAula[window.aulaActual]){
        window.intentosPorAula[window.aulaActual] = 0;
    }
    
    if(!window.puntosPorAula){
        window.puntosPorAula = {};
    }
    
    const esCorrecta = (op === window.respuestaCorrecta);
    
    await guardarRespuestaEstudiante(op, esCorrecta);
    
    if(esCorrecta){
        
        // 🔴 Calcular puntos según intentos
        const intentos = window.intentosPorAula[window.aulaActual];
        
        // 🔴 8 puntos por aula - 1 punto por cada fallo
        let puntosGanados = 8 - intentos;
        
        if(puntosGanados < 1){
            puntosGanados = 1;
        }
        
        window.puntosPorAula[window.aulaActual] = puntosGanados;
        
        GameManager.puntos += puntosGanados;
        
        console.log("🎯 Aula " + window.aulaActual + ": " + puntosGanados + " pts");
        console.log("📊 Total: " + GameManager.puntos + " pts");
        
        actualizarHUD();
        
        if(!Juego.aulasCompletadas.includes(window.aulaActual)){
            Juego.aulasCompletadas.push(window.aulaActual);
        }
        
        let mensaje = "✅ ¡Correcto!\n\n";
        mensaje += "🏆 Puntos ganados: " + puntosGanados + "\n";
        
        if(intentos > 0){
            mensaje += "⚠️ (Descontado " + intentos + " punto(s) por fallos)\n";
        }
        
        mensaje += "\n🔑 Recoge la llave que apareció en el aula.";
        
        alert(mensaje);
        
    }else{
        window.intentosPorAula[window.aulaActual]++;
        
        const intentosActuales = window.intentosPorAula[window.aulaActual];
        const puntosSiAcierta = Math.max(1, 8 - intentosActuales);
        
        let mensaje = "❌ Incorrecto. Vuelve a intentarlo.\n\n";
        mensaje += "⚠️ Llevas " + intentosActuales + " fallo(s).\n";
        mensaje += "💡 Si aciertas, ganarás " + puntosSiAcierta + " puntos.";
        
        alert(mensaje);
    }

    document.getElementById("popup").style.display = "none";
    
    // 🔴 REANUDAR JUEGO
    Juego.pausado = false;
    
    // 🔴 LIBERAR TECLAS
    Juego.teclas = {
        w: false, a: false, s: false, d: false,
        e: false, enter: false,
        arrowup: false, arrowdown: false,
        arrowleft: false, arrowright: false
    };
    
    // 🔴 PEDIR POINTER LOCK OTRA VEZ
    setTimeout(() => {
        if(Juego.renderer && Juego.renderer.domElement){
            try {
                const promesa = Juego.renderer.domElement.requestPointerLock();
                if(promesa && promesa.catch){
                    promesa.catch(() => {});
                }
            } catch(e) {}
        }
    }, 500);
}

/*=========================================================
GUARDAR RESPUESTA EN SUPABASE
=========================================================*/

async function guardarRespuestaEstudiante(respuestaElegida, esCorrecta){
    
    if(!supabaseClient){
        console.log("⚠️ Supabase no disponible");
        return;
    }
    
    try {
        // Obtener el usuario actual
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if(!user){
            console.log("⚠️ No hay usuario logueado");
            return;
        }
        
        // Obtener la materia actual
        let materiaActual = "general";
        if(window.modoMateriaUnica && window.materiaUnicaActual){
            materiaActual = window.materiaUnicaActual;
        } else if(typeof window.materiaSeleccionada === "number"){
            const nombresMaterias = [
                "Matematicas", "Lenguaje", "Ingles", "Biologia",
                "Quimica", "Fisica", "Literatura", "Musica",
                "Geografia", "Arte", "Historia", "Religion"
            ];
            materiaActual = nombresMaterias[window.materiaSeleccionada];
        }
        
        // Guardar la respuesta
        const { error } = await supabaseClient
            .from('respuestas_estudiante')
            .insert([{
                estudiante_id: user.id,
                pregunta_id: window.preguntaActualId || null,
                materia: materiaActual,
                respuesta_elegida: respuestaElegida,
                es_correcta: esCorrecta
            }]);
        
        if(error){
            console.error("❌ Error al guardar respuesta:", error.message);
        } else {
            console.log("✅ Respuesta guardada:", esCorrecta ? "Correcta" : "Incorrecta");
        }
        
    } catch(error){
        console.error("❌ Error:", error.message);
    }
}

/*=========================================================
EVENTOS DE BOTONES
=========================================================*/

document.getElementById("respuestaA").onclick = function(){ responder(0); };
document.getElementById("respuestaB").onclick = function(){ responder(1); };
document.getElementById("respuestaC").onclick = function(){ responder(2); };
document.getElementById("respuestaD").onclick = function(){ responder(3); };
