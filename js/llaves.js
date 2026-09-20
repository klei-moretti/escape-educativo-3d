"use strict";

/*=========================================================
LLAVES - CREACIÓN
=========================================================*/

function crearLlave(x, z){

    const grupo = new THREE.Group();

    // Aro de la llave
    const aro = new THREE.Mesh(
        new THREE.TorusGeometry(0.4,0.08,8,20),
        new THREE.MeshStandardMaterial({ color:0xffd700 })
    );
    aro.rotation.x = Math.PI/2;
    grupo.add(aro);

    // Mango de la llave
    const mango = new THREE.Mesh(
        new THREE.BoxGeometry(0.15,0.6,0.08),
        new THREE.MeshStandardMaterial({ color:0xffd700 })
    );
    mango.position.y = -0.5;
    grupo.add(mango);

    // Posicionar en el mapa
    grupo.position.set(x, 2, z);

    // Marcar como no recogida
    grupo.userData.recogida = false;

    // Agregar al mundo 3D
    Juego.escena.add(grupo);

    // Crear arreglo si no existe
    if(!Juego.llaves){
        Juego.llaves = [];
    }

    // Guardar llave en lista
    Juego.llaves.push(grupo);
}

/*=========================================================
COLOCAR TODAS LAS LLAVES
=========================================================*/

function crearLlaves(){

    // =============================================
    // LLAVE INICIAL EN LA BIBLIOTECA
    // =============================================
    crearLlave(0, -50);   // Dentro de la biblioteca
    console.log("🔑 Llave inicial de biblioteca creada");

    // =============================================
    // LLAVES DE LAS AULAS
    // =============================================
    const posiciones = [
        [-200, -220],  // 0 - Matemáticas
        [-60,  -240],  // 1 - Lenguaje
        [200,  -220],  // 2 - Inglés
        [-240, -120],  // 3 - Biología
        [-200, 0],     // 4 - Química
        [-240, 120],   // 5 - Física
        [200, 0],      // 6 - Literatura
        [240, 120],    // 7 - Música
        [-100, 140],   // 8 - Geografía
        [-160, -150],  // 9 - Arte
        [220, 220],    // 10 - Historia
        [240, -120]    // 11 - Religión
    ];

    for(const pos of posiciones){
        crearLlave(pos[0], pos[1]);
    }

    console.log("🔑 13 llaves creadas (1 biblioteca + 12 aulas)");
}