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
// 6 - LITERATURA
// =============================================
6:[
    {
        p: "¿Quién escribió 'Don Quijote de la Mancha'?",
        r: ["Shakespeare", "Cervantes", "Borges", "García Márquez"],
        c: 1
    },
    {
        p: "¿Qué es una metáfora?",
        r: ["Comparación directa", "Exageración", "Personificación", "Descripción"],
        c: 0
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
// 8 - GEOGRAFÍA
// =============================================
8:[
    {
        p: "¿Cuál es el océano más grande del mundo?",
        r: ["Atlántico", "Índico", "Pacífico", "Ártico"],
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
// 10 - HISTORIA
// =============================================
10:[
    {
        p: "¿En qué año fue la independencia de Bolivia?",
        r: ["1809", "1825", "1810", "1826"],
        c: 1
    },
    {
        p: "¿Quién fue el libertador de Bolivia?",
        r: ["San Martín", "Bolívar", "Sucre", "O'Higgins"],
        c: 1
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

    // Nombres de las materias según el ID
    const materias = [
        "Matemáticas", "Lenguaje", "Inglés", "Biología",
        "Química", "Física", "Literatura", "Música",
        "Geografía", "Arte", "Historia", "Religión"
    ];

    const nombreMateria = materias[id];

    // 🔗 OBTENER PREGUNTAS DE SUPABASE
    let lista = await obtenerPreguntas(nombreMateria);

    // 🔄 SI NO HAY EN SUPABASE, USAR LAS LOCALES
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

    // Si viene de Supabase, usa respuesta_a, respuesta_b, etc.
    // Si viene local, usa r[0], r[1], etc.
    document.getElementById("respuestaA").innerText = p.respuesta_a || p.r[0];
    document.getElementById("respuestaB").innerText = p.respuesta_b || p.r[1];
    document.getElementById("respuestaC").innerText = p.respuesta_c || p.r[2];
    document.getElementById("respuestaD").innerText = p.respuesta_d || p.r[3];

    window.respuestaCorrecta = p.correcta !== undefined ? p.correcta : p.c;
}

/*=========================================================
RESPONDER
=========================================================*/

function responder(op){

    if(op === window.respuestaCorrecta){
        alert("✅ ¡Correcto!\nAhora recoge la llave que apareció en el aula.");
        
        if(!Juego.aulasCompletadas.includes(window.aulaActual)){
            Juego.aulasCompletadas.push(window.aulaActual);
            // ❌ NO dar llave automáticamente
            // La llave física está en el aula y se recoge con E
        }
    }else{
        alert("❌ Incorrecto. Vuelve a intentarlo.");
    }

    document.getElementById("popup").style.display = "none";
}

/*=========================================================
EVENTOS DE BOTONES
=========================================================*/

document.getElementById("respuestaA").onclick = function(){ responder(0); };
document.getElementById("respuestaB").onclick = function(){ responder(1); };
document.getElementById("respuestaC").onclick = function(){ responder(2); };
document.getElementById("respuestaD").onclick = function(){ responder(3); };