"use strict";

/*=========================================================
BIBLIOTECA
=========================================================*/

function crearBiblioteca(){

    crearPisoBiblioteca();

    crearEdificioBiblioteca(

        0,
        0,
        ANCHO_BIBLIOTECA,
        LARGO_BIBLIOTECA

    );

    crearMobiliarioBiblioteca();

}

/*=========================================================
PISO
=========================================================*/

function crearPisoBiblioteca(){

    // PISO DE LA BIBLIOTECA - COMENTADO (ya existe el piso general)
    // const geometria = new THREE.BoxGeometry(ANCHO_BIBLIOTECA, 1, LARGO_BIBLIOTECA);
    // const material = new THREE.MeshStandardMaterial({
    //     color: 0x7A7A6A,
    //     roughness: 0.8,
    //     metalness: 0
    // });
    // const piso = new THREE.Mesh(geometria, material);
    // piso.position.set(0, 0.5, 0);
    // piso.receiveShadow = true;
    // Juego.escena.add(piso);

    console.log("📖 Piso de biblioteca omitido - Usando piso general");

}

/*=========================================================
ESTANTERÍA (con texto en el cartel)
=========================================================
Crea un estante con libros a los lados y un cartel con
el nombre de la materia dibujado con Canvas (texto 3D).
=========================================================*/

function crearEstanteria(x, z, tipo, id){

    // Cuerpo del estante
    const geometria = new THREE.BoxGeometry(4, 7, 14);
    const material = Texturas.madera 
    ? new THREE.MeshStandardMaterial({
        map: Texturas.madera,
        roughness: 0.8,
        metalness: 0
    })
    : new THREE.MeshStandardMaterial({
        color: 0x6B4C3B,
        roughness: 0.8,
        metalness: 0
    });

    const estanteria = new THREE.Mesh(geometria, material);
    estanteria.position.set(x, 3.5, z);
    estanteria.castShadow = true;
    estanteria.receiveShadow = true;
    estanteria.userData.tipo = tipo;
    estanteria.userData.id = id;
    Juego.escena.add(estanteria);
    Juego.paredes.push(estanteria);

    // Libros
    for(let fila = 0; fila < 4; fila++){
        for(let col = 0; col < 8; col++){
            const colorLibroIzq = new THREE.Color().setHSL(Math.random(), 0.7, 0.4);
            const libroIzq = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 1.2, 0.8),
                new THREE.MeshStandardMaterial({ color: colorLibroIzq })
            );
            libroIzq.position.set(x - 2.2, 1 + fila * 1.5, z - 6.5 + col * 1.7);
            Juego.escena.add(libroIzq);

            const colorLibroDer = new THREE.Color().setHSL(Math.random(), 0.7, 0.4);
            const libroDer = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 1.2, 0.8),
                new THREE.MeshStandardMaterial({ color: colorLibroDer })
            );
            libroDer.position.set(x + 2.2, 1 + fila * 1.5, z - 6.5 + col * 1.7);
            Juego.escena.add(libroDer);
        }
    }

    // 🔴 CARTEL SEGÚN MODO
    let nombreCartel = "";
    
    if(window.modoMateriaUnica && window.materiaUnicaActual){
        // 🔴 MODO MATERIA ÚNICA
        if(tipo === "especial"){
            // Guía, Historia, Diario → NO cambian
            const especiales = ["Guía", "Historia", "Diario"];
            nombreCartel = especiales[id];
        } else {
            // Materias → TODAS dicen la materia única
            nombreCartel = window.materiaUnicaActual.charAt(0).toUpperCase() + 
                          window.materiaUnicaActual.slice(1);
        }
    } else {
        // 🔴 MODO GENERAL
        nombreCartel = obtenerNombreEstante(tipo, id);
    }
    
    crearCartelTexto(x, z, nombreCartel);

    if(!Juego.estanterias){
        Juego.estanterias = [];
    }
    Juego.estanterias.push(estanteria);

    console.log("📚 Estante " + tipo + " " + id + " → " + nombreCartel);
}

/*=========================================================
CREAR CARTEL CON TEXTO (usando Canvas)
=========================================================
Three.js no tiene texto nativo. Creamos un canvas HTML,
dibujamos el texto, y lo usamos como textura en un plano 3D.
=========================================================*/

function crearCartelTexto(x, z, texto){
    
    // 🔴 Crear canvas de 512x128 pixels
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    
    const ctx = canvas.getContext("2d");
    
    // 🔴 Fondo dorado del cartel
    ctx.fillStyle = "#FFD700";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 🔴 Borde marrón
    ctx.strokeStyle = "#8B5A2B";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    
    // 🔴 Texto negro en el centro
    ctx.fillStyle = "#000000";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2);
    
    // 🔴 Convertir canvas a textura de Three.js
    const textura = new THREE.CanvasTexture(canvas);
    
    // 🔴 Material con la textura
    const material = new THREE.MeshBasicMaterial({ 
        map: textura,
        transparent: true
    });
    
    // 🔴 Geometría del cartel (plano)
    const geometria = new THREE.PlaneGeometry(6, 1.5);
    const cartel = new THREE.Mesh(geometria, material);
    
    // 🔴 Posicionar sobre el estante mirando al frente
    cartel.position.set(x, 8.5, z + 7.2);
    
    Juego.escena.add(cartel);
}

/*=========================================================
OBTENER NOMBRE DEL ESTANTE
=========================================================*/

function obtenerNombreEstante(tipo, id){

    if(tipo === "especial"){
        const especiales = ["Guía", "Historia", "Diario"];
        return especiales[id];
    }

    const materias = [
        "Matemáticas", "Lenguaje", "Inglés", "Biología",
        "Química", "Física", "Filosofía", "Música",
        "Sociales", "Arte", "Educación Física", "Religión"
    ];

    return materias[id] || "Materia";
}

/*=========================================================
MOBILIARIO
=========================================================*/

function crearMobiliarioBiblioteca(){

    // =============================================
    // 15 ESTANTES CON CONTENIDO
    // =============================================

    // Estantes 1-12: Materias
    const posiciones = [
        // Fila 1 (z = -35) - 5 estantes
        { x: -50, z: -35, tipo: "materia", id: 0 },
        { x: -25, z: -35, tipo: "materia", id: 1 },
        { x:   0, z: -35, tipo: "materia", id: 2 },
        { x:  25, z: -35, tipo: "materia", id: 3 },
        { x:  50, z: -35, tipo: "materia", id: 4 },

        // Fila 2 (z = 0) - 5 estantes
        { x: -50, z: 0, tipo: "materia", id: 5 },
        { x: -25, z: 0, tipo: "materia", id: 6 },
        { x:   0, z: 0, tipo: "materia", id: 7 },
        { x:  25, z: 0, tipo: "materia", id: 8 },
        { x:  50, z: 0, tipo: "materia", id: 9 },

        // Fila 3 (z = 35) - 5 estantes
        { x: -50, z: 35, tipo: "materia", id: 10 },
        { x: -25, z: 35, tipo: "materia", id: 11 },
        { x:   0, z: 35, tipo: "especial", id: 0 },   // Guía
        { x:  25, z: 35, tipo: "especial", id: 1 },   // Historia
        { x:  50, z: 35, tipo: "especial", id: 2 }    // Diario
    ];

    for(const pos of posiciones){
        crearEstanteria(pos.x, pos.z, pos.tipo, pos.id);
    }

    console.log("📚 15 estantes creados");

}
