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
ESTANTERÍA
=========================================================*/

function crearEstanteria(x, z, tipo, id){

    // =============================================
    // CUERPO DEL ESTANTE
    // =============================================
    const geometria = new THREE.BoxGeometry(4, 7, 14);
    const material = new THREE.MeshStandardMaterial({
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

    // =============================================
    // LIBROS EN LOS LADOS ANCHOS (IZQUIERDO Y DERECHO)
    // =============================================
    for(let fila = 0; fila < 4; fila++){
        for(let col = 0; col < 8; col++){

            // === LIBROS DEL LADO IZQUIERDO ===
            const colorLibroIzq = new THREE.Color().setHSL(
                Math.random(), 0.7, 0.4
            );

            const libroIzq = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 1.2, 0.8),
                new THREE.MeshStandardMaterial({ color: colorLibroIzq })
            );

            libroIzq.position.set(
                x - 2.2,                    // ← Lado izquierdo
                1 + fila * 1.5,
                z - 6.5 + col * 1.7         // ← A lo largo del estante
            );

            Juego.escena.add(libroIzq);

            // === LIBROS DEL LADO DERECHO ===
            const colorLibroDer = new THREE.Color().setHSL(
                Math.random(), 0.7, 0.4
            );

            const libroDer = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 1.2, 0.8),
                new THREE.MeshStandardMaterial({ color: colorLibroDer })
            );

            libroDer.position.set(
                x + 2.2,                    // ← Lado derecho
                1 + fila * 1.5,
                z - 6.5 + col * 1.7
            );

            Juego.escena.add(libroDer);

        }
    }

    // =============================================
    // CARTEL DEL ESTANTE
    // =============================================
    const nombreCartel = obtenerNombreEstante(tipo, id);

    const cartel = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1, 0.2),
        new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffd700,
            emissiveIntensity: 0.3
        })
    );
    cartel.position.set(x, 7.5, z + 7.2);
    Juego.escena.add(cartel);

    // =============================================
    // GUARDAR EN LISTA DE ESTANTES
    // =============================================
    if(!Juego.estanterias){
        Juego.estanterias = [];
    }
    Juego.estanterias.push(estanteria);

    console.log("📚 Estante " + tipo + " " + id + " en (" + x + ", " + z + ")");

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
        "Química", "Física", "Literatura", "Música",
        "Geografía", "Arte", "Historia", "Religión"
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
