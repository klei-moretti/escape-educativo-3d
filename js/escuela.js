"use strict";

/*=========================================================
ESCUELA
=========================================================*/

function crearEscuela(){
    // crearMurosExteriores(); // eliminar
    crearLaberintoSimple();   // <--- AHORA USA ESTA que no este en comentario
    crearBiblioteca();
    crearAulas();
    // crearPasillos(); //
    crearSalida();
    crearEntradaPrincipal();
}

/*=========================================================
CREAR EDIFICIO
=========================================================*/

function crearEdificio(x, z, ancho, largo){

    // Pared Norte
    crearPared(
        x,
        ALTURA_PARED / 2,
        z - largo / 2,
        ancho,
        ALTURA_PARED,
        GROSOR_PARED
    );

    // Sur izquierda
    crearPared(

        x-12,
        ALTURA_PARED/2,
        z+largo/2,
        16,
        ALTURA_PARED,
        GROSOR_PARED
    );

    // Sur derecha
    crearPared(

        x+12,
        ALTURA_PARED/2,
        z+largo/2,
        16,
        ALTURA_PARED,
        GROSOR_PARED

    );

    // Pared Oeste
    crearPared(
        x - ancho / 2,
        ALTURA_PARED / 2,
        z,
        GROSOR_PARED,
        ALTURA_PARED,
        largo
    );

    // Pared Este
    crearPared(
        x + ancho / 2,
        ALTURA_PARED / 2,
        z,
        GROSOR_PARED,
        ALTURA_PARED,
        largo
    );

}

/*=========================================================
CREAR BIBLIOTECA
=========================================================*/

function crearEdificioBiblioteca(x, z, ancho, largo){

    // Norte
    crearPared(
        x,
        ALTURA_PARED / 2,
        z - largo / 2,
        ancho,
        ALTURA_PARED,
        GROSOR_PARED
    );

    // Oeste
    crearPared(
        x - ancho / 2,
        ALTURA_PARED / 2,
        z,
        GROSOR_PARED,
        ALTURA_PARED,
        largo
    );

    // Este
    crearPared(
        x + ancho / 2,
        ALTURA_PARED / 2,
        z,
        GROSOR_PARED,
        ALTURA_PARED,
        largo
    );

        // =============================================
    // PARED SUR - Dividida en 2 (deja hueco para puerta)
    // =============================================
    // Parte IZQUIERDA de la pared sur
    crearPared(
        x - (ancho / 2 + 5) / 2,
        ALTURA_PARED / 2,
        z + largo / 2,
        (ancho - 10) / 2,
        ALTURA_PARED,
        GROSOR_PARED
    );

    // Parte DERECHA de la pared sur
    crearPared(
        x + (ancho / 2 + 5) / 2,
        ALTURA_PARED / 2,
        z + largo / 2,
        (ancho - 10) / 2,
        ALTURA_PARED,
        GROSOR_PARED
    );

    // =============================================
    // PUERTA DE LA BIBLIOTECA
    // =============================================
    crearPuertaBiblioteca(x, z + largo / 2);

}

/*=========================================================
CREAR AULA
=========================================================*/

function crearAula(x, z, ancho, largo){

    // =============================================
    // PARED NORTE (completa, sin agujeros)
    // =============================================
    crearPared(
        x,
        ALTURA_PARED / 2,
        z - largo / 2,
        ancho + GROSOR_PARED,   // ← + grosor para cubrir esquina
        ALTURA_PARED,
        GROSOR_PARED
    );

    // =============================================
    // PARED SUR - Dividida en 2 (deja hueco para puerta)
    // =============================================
    // La puerta mide 6 de ancho, así que el hueco debe ser 6

    // Parte IZQUIERDA de la pared sur
    crearPared(
        x - (ancho / 2 + 3) / 2,     // ← Centro entre el borde y la puerta
        ALTURA_PARED / 2,
        z + largo / 2,
        (ancho - 6) / 2,             // ← Ancho correcto
        ALTURA_PARED,
        GROSOR_PARED
    );

    // Parte DERECHA de la pared sur
    crearPared(
        x + (ancho / 2 + 3) / 2,
        ALTURA_PARED / 2,
        z + largo / 2,
        (ancho - 6) / 2,
        ALTURA_PARED,
    GROSOR_PARED
);

    // =============================================
    // PARED OESTE (completa)
    // =============================================
    crearPared(
        x - ancho / 2,
        ALTURA_PARED / 2,
        z,
        GROSOR_PARED,
        ALTURA_PARED,
        largo + GROSOR_PARED   // ← + grosor para cubrir esquina
    );

    // =============================================
    // PARED ESTE (completa)
    // =============================================
    crearPared(
        x + ancho / 2,
        ALTURA_PARED / 2,
        z,
        GROSOR_PARED,
        ALTURA_PARED,
        largo + GROSOR_PARED
    );

    // Ventanas
    crearVentanasAula(x, z, ancho, largo);

    // =============================================
    // PUERTA DEL AULA
    // =============================================
    // El índice se pasa desde crearAulas()
    crearPuertaAula(x, z + largo / 2, arguments[4] || 0);

}

/*=========================================================
MUROS EXTERIORES
=========================================================*/

function crearMurosExteriores(){

    // Norte
    crearPared(
        0,
        4,
        -300,
        600,
        8,
        2
    );

    // Sur
    crearPared(
        0,
        4,
        300,
        600,
        8,
        2
    );

    // Oeste
    crearPared(
        -300,
        4,
        0,
        2,
        8,
        600
    );

    // Este
    crearPared(
        300,
        4,
        0,
        2,
        8,
        600
    );

}




/*=========================================================
CREAR TECHO
=========================================================*/

function crearTecho(x, z, ancho, largo){

    const geometria = new THREE.BoxGeometry(

        ancho,
        1,
        largo

    );

    const material = new THREE.MeshStandardMaterial({

        color:0x3a3a3a

    });

    const techo = new THREE.Mesh(

        geometria,
        material

    );

    techo.position.set(

        x,
        ALTURA_PARED + 0.5,
        z

    );

    techo.castShadow = true;

    techo.receiveShadow = true;

    Juego.escena.add(techo);

}

/*=========================================================
AULAS
=========================================================*/

function crearAulas(){

    // 12 AULAS DISPERSAS (DENTRO DE LÍMITES)
    const aulas = [
        // ESQUINA INFERIOR
        { x: -200, z: -220, id: 0, nombre: "Matemáticas" },
        { x: -60,  z: -240, id: 1, nombre: "Lenguaje" },
        { x: 200,  z: -220, id: 2, nombre: "Inglés" },

        // ZONA MEDIA IZQUIERDA
        { x: -240, z: -120, id: 3, nombre: "Biología" },
        { x: -200, z: 0,    id: 4, nombre: "Química" },
        { x: -240, z: 120,  id: 5, nombre: "Física" },

        // ZONA MEDIA DERECHA
        { x: 200,  z: 0,    id: 6, nombre: "Literatura" },
        { x: 240,  z: 120,  id: 7, nombre: "Música" },

        // ZONA SUPERIOR IZQUIERDA
        { x: -100, z: 140,  id: 8, nombre: "Geografía" },
        { x: -160, z: -150, id: 9, nombre: "Arte" },

        // ZONA SUPERIOR DERECHA
        { x: 220,  z: 220,  id: 10, nombre: "Historia" },
        { x: 240,  z: -120, id: 11, nombre: "Religión" }
    ];

    for(const aula of aulas){

        crearAula(aula.x, aula.z, ANCHO_AULA, LARGO_AULA, aula.id);
        crearSalonCompleto(aula.x, aula.z);
        crearZonaPregunta(aula.x, aula.z, aula.id);
        // crearPuertaAula(aula.x, aula.z - LARGO_AULA/2); para que no me perj. pared
        console.log(`📚 Aula ${aula.id}: ${aula.nombre} en (${aula.x}, ${aula.z})`);
    }

    console.log("✅ 12 aulas creadas - Dentro de límites");
}

/*=========================================================
CREAR PUERTA FINAL DOBLE
=========================================================*/

function crearSalida(){

    console.log("🚪 PUERTA CREADA");

    const grupo = new THREE.Group();

    // Hoja izquierda - color madera oscura
    const izquierda = new THREE.Mesh(
        new THREE.BoxGeometry(4,8,0.5),
        new THREE.MeshStandardMaterial({ 
            color: 0x3D2415,  // Madera muy oscura
            roughness: 0.6,
            metalness: 0.1
        })
    );
    izquierda.position.set(-2,4,0);
    grupo.add(izquierda);

    // Hoja derecha
    const derecha = new THREE.Mesh(
        new THREE.BoxGeometry(4,8,0.5),
        new THREE.MeshStandardMaterial({ 
            color: 0x3D2415,
            roughness: 0.6,
            metalness: 0.1
        })
    );
    derecha.position.set(2,4,0);
    grupo.add(derecha);

    // Marco superior - dorado brillante
    const marcoSuperior = new THREE.Mesh(
        new THREE.BoxGeometry(10,1,1),
        new THREE.MeshStandardMaterial({ 
            color: 0xDDAA33,  // Dorado más fuerte
            roughness: 0.2,
            metalness: 0.8
        })
    );
    marcoSuperior.position.set(0,8.5,0);
    grupo.add(marcoSuperior);

    // Marco izquierdo
    const marcoIzq = new THREE.Mesh(
        new THREE.BoxGeometry(1,9,1),
        new THREE.MeshStandardMaterial({ 
            color: 0xDDAA33,
            roughness: 0.2,
            metalness: 0.8
        })
    );
    marcoIzq.position.set(-4.5,4.5,0);
    grupo.add(marcoIzq);

    // Marco derecho
    const marcoDer = new THREE.Mesh(
        new THREE.BoxGeometry(1,9,1),
        new THREE.MeshStandardMaterial({ 
            color: 0xDDAA33,
            roughness: 0.2,
            metalness: 0.8
        })
    );
    marcoDer.position.set(4.5,4.5,0);
    grupo.add(marcoDer);

    grupo.position.set(-250, 0, 220);

    grupo.userData.abierta = false;
    grupo.userData.izquierda = izquierda;
    grupo.userData.derecha = derecha;
    Juego.escena.add(grupo);
    Juego.salida = grupo;

}

/*=========================================================
PUERTA DEL AULA
=========================================================*/

function crearPuertaAula(x, z, indiceAula){

    const puerta = new THREE.Mesh(
        new THREE.BoxGeometry(6,8,0.6),
        new THREE.MeshStandardMaterial({ 
            color: 0xDD3333,
            roughness: 0.4,
            metalness: 0.3
        })
    );

    puerta.position.set(x, 4, z);
    puerta.castShadow = true;
    puerta.receiveShadow = true;
    puerta.userData.abierta = false;
    puerta.userData.animando = false;
    puerta.userData.indiceAula = indiceAula;
    puerta.userData.esPuerta = true;

    Juego.escena.add(puerta);

    // 🔴 AÑADIR A PAREDES PARA COLISIÓN
    Juego.paredes.push(puerta);

    if(!Juego.puertas){
        Juego.puertas=[];
    }
    Juego.puertas.push(puerta);

    console.log("🚪 Puerta de aula " + indiceAula + " creada");

}

/*=========================================================
VENTANAS
=========================================================*/

function crearVentanasAula(x,z,ancho,largo){

    const material = new THREE.MeshStandardMaterial({

        color:0x87ceeb,

        transparent:true,

        opacity:0.6

    });

    for(let i=-1;i<=1;i++){

        const ventana = new THREE.Mesh(

            new THREE.BoxGeometry(4,3,0.3),

            material

        );

        ventana.position.set(

            x + i*10,

            6,

            z - largo/2 + 0.3

        );

        Juego.escena.add(ventana);

    }

}

/*=========================================================
ENTRADA PRINCIPAL
=========================================================*/

function crearEntradaPrincipal(){

    // Plataforma

    const base = new THREE.Mesh(

        new THREE.BoxGeometry(18,1,10),

        new THREE.MeshStandardMaterial({

            color:0x909090

        })

    );

    base.position.set(0,0.5,170);

    Juego.escena.add(base);

    // Columna izquierda

    crearColumna(-6,170);

    // Columna derecha

    crearColumna(6,170);

    // Techo

    const techo = new THREE.Mesh(

        new THREE.BoxGeometry(18,1,8),

        new THREE.MeshStandardMaterial({

            color:0x777777

        })

    );

    techo.position.set(0,9,170);

    Juego.escena.add(techo);

}

/*=========================================================
COLUMNA
=========================================================*/

function crearColumna(x,z){

    const columna = new THREE.Mesh(

        new THREE.BoxGeometry(1,8,1),

        new THREE.MeshStandardMaterial({

            color:0xe8e8e8

        })

    );

    columna.position.set(x,4,z);

    Juego.escena.add(columna);

}

/*=========================================================
LABERINTO ALREDEDOR DE LOS CUARTOS
=========================================================*/



/*=========================================================
LABERINTO SIMPLE (SIN SUPERPOSICIÓN)
=========================================================*/

function crearLaberintoSimple(){

    // =============================================
    // MAPA DEL LABERINTO (1 = muro, 0 = pasillo)
    // MÁS GRANDE - 60x60 celdas
    // =============================================

    const laberinto = [
        "111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
        "100011001100110010000010101001011010000101001010100000110000111001010101111100000001111100000000011",
        "100000101001010001010010010101000000011110000000000000000000111111100010101001000010011010000110111",
        "100000101010001000011000010110100010101010101010001111111000000000000000000000000000000000011111111",
        "111111111111110000000000000011111000101001010110100100101010010101010010011111110000000011001010011",
        "111110010010101010101010101001010101000111110010010100101001001000101001011100000000000000000000111",
        "111111001010010101010101010100111111000000001110100100101111000101001010001010010100010010010111111",
        "111111100101010010100100101001111111000000001111111110000000000000000000000111111111111111111111111",
        "100010101000010011000011110100010011000000001000010000001010100101001010010100100101010101001001111",
        "110101010101000000000111111111111111000000001111100110101001010000101010100000110110100101010000001",
        "101010100101000000000111111111111111000000001111010100101111000000000000000111100000000011111000001",
        "100000101011000000000000101000101011000000001110100100100101010011111111111111100000000011001001001",
        "100000000100000000000100000000000011000000001000100100101000100010010001111111100000000011000000001",
        "100100010101000000000110010010010111000000001111100100011110000000000000011111100000000011110010001",
        "100100000001000000000111000010100100000001111111111100000000000000111111111111100000000011010100101",
        "100010001011000000000111100101010000000011100000000011110010010100001010100111100000000011100110001",
        "101010100101000000000100000001010010101001010100100101001000000010100010100000100000000011001010011",
        "100100000101000000000111111110000000000000000000000000000000000011010000100000101110000100100010011",
        "100000000000011001001010000011010010010010100101001010010001000010000010100100001001000100000000001",
        "110001001010010101010001010010100110000011111000000000000000000000100010000000000000000001111111111",
        "110000100001001000000000000001110000000000000000000000000000000000000000000000000000110100101001001",
        "100100000010001001100000000010101010101011000111100000001111110000000000000001000001010101001010011",
        "101010010101001101100000000010010110010110101010101001001010101001001010010011010101011100001100001",
        "100100000100001000100000000011001100101001101010111111101000000000100000111010100001001000011111111",
        "101000100010010000100000000011111110000000000000000000000000000000111111000001111110000001111110001",
        "100101010010100000100000000010100101000010101001010000100101001000101010101001001010100100000000001",
        "101010000000000111100000000011111001001010101001011110001011111111110000001100000111110000000010011",
        "100010000000000111100000000011111110000111101010110100001100010100010011111111111111110000000010011",
        "101010000000000111100000000010010010000100001010100000000000000000000000000000001111110000000011001",
        "100110000000000111100000000010010010010010000010000100001010010000100000101010010000010000000010001",
        "100010000000000111100000000000000000000000000000011100101010001001001011011111000001110000000011001",
        "100010000000000100100000100010001001000100010100100001001000100010100100010000101000010000000010011",
        "100110000000000100000001010010000001100000000000000000000000000000000000000000001111110000000010011",
        "101010000000000111110000000000000010010100100100100000101010100010100000000000010010010000000011001",
        "100101100001100101010000001000001010010010000101001000101001001001001000000101010110001110011111111",
        "101000100000000000000001111001010101000100000000000000001100001010100100100100101000010101001010011",
        "100000000000111001010000010101010100001010100010100100000010001000101001111110000000000000000001111",
        "100101010010100011100000000011100000000000000000111100010101110100001011010100010010010101111111111",
        "100101001000010000000010010010010000000000000000000000000000000000010010101010010101000000010100101",
        "101001000010010000101001001010010000000000000000000000000000000001000000100000100101101010101010011",
        "111110000000000000000001111000000000000000000000000000000000000001000100000000001100010101010010001",
        "100101001100000010001100000000000110000000000000000000000000000001001001010000101010110101000000001",
        "100101000100001000001000001100000000000000000000000000000000000001000000011001010010101111100000001",
        "100101010100101010010101001010000100000000000000000000000000000000000001100101010001001000000001011",
        "110000000000111110000000000000000110000000000000000000000000000001110001010010010100010010100101111",
        "100001100001000000000100101010010100000000000000000000000000000000000000000010100010001001000001011",
        "100010000111000000000100001000100000000000000000000000000000000000101001010001100000000010010100001",
        "100100000001000000000101000000100100000000000000000000000000000001110000000001010100101010100100001",
        "111000111001000000000101010100010100000000000000000000000000000000010101001010000000000000000001111",
        "100000100011000000000101010010010010000000000000000000000000000000010010100100000000000010100101001",
        "111100000011000000000100000101000000000000000000000000000000000001100100100100000000000000010100101",
        "110001110001000000000100000000000110000000000000000000000000000000000101001000100000000000000000001",
        "110001000111000000000110001010001110000000000000000000000000000001000010100101100000000000010100011",
        "100000110011000000000100011111000010000000000000000000000000000000100100100001100000000010101000011",
        "100000000000111000111100000000000110000000000000000000000000000001101001001001011100000101010000001",
        "111100000000011100000001111000011110000000000000000000000000000001110000000011100000001110000000011",
        "111111111000000000110010100101010110000000000000000000000000000001000001110000000001100000000100001",
        "101000011011111100000000001111111110000000000000000000000000000001111100000111111100000111000000011",
        "100011111000000000111100000000001110000000000000000000000000000001111111111110000000000011111000001",
        "100111100000011111111000000011000110000000000000000000000000000001100000000000111110000000000000111",
        "100011111000111111000001100000001110000000000000000000000000000000000000111111100000000000100000011",
        "101001111110000011110000011111010100101000000000000000000110100000111000000000001111111110000110001",
        "101101111111110000000000111100000000000000000000000001000010101001010111111000000000111111000000111",
        "101001111000000000000001111100100000110000000000000000000000000010000000000011111111111111111100001",
        "101100111111111111110000000000000011111110111000010000100000000000011111100000001111110000000011001",
        "10101000000000111111110000000000001111110011000000000000000111110000000000001111111110000000011101",
        "110011000000000100000000001111100000000000010010000000000100000011100101001001001000110000000010001",
        "100100000000000000100000000001111100000001110111000000000000000000001110010101001101110000000011011",
        "101010000000001100000001100110000000001111111011000000000001111110000000001110000000010000000011001",
        "111000000000000111100001000011000000000100000011110100001110000011111100000000001111110000000010011",
        "111110000000001111110000011110000000001111111100001111111111000001111111110000000111110000000011001",
        "111110000000001100000111000010000000001111111111100000000000000000000000111111111111110000000010001",
        "111110000000001111110000111110000000001111110000000111111111110000000000000000000011110000000010001",
        "111110000000000000000000011110000000001100000000111110000000000001111000001111000000000000000001111",
        "100000000011111001111000001110000000001111111000010000000000111100000000000000000000000000001100001",
        "100000001111100011110000001110000000001000001110000110011100000000001001110000000011110000000000011",
        "110000011110000000000011000000000000011111111110000110001111000000001101000000000000001111111111111",
        "100001100000011110000111100001100000010000011110000110000011001001000000000001111111000000000000001",
        "100011110001111111111111100100010110000100000111111111111110011001101111111000001100000000000011111",
        "101011111100000000000000111111000111000000011110000001111001110001101111100000000001111111000000011",
        "101011111110000011000000111000000001111110001111111111111001110000101111000000000000000000000000011",
        "101011111000110011111100000011111111110000111100000011111000000011100000000000000000011110000000001",
        "101011111110100111111110001111000000001111111100000111110011111111101100000000011100000000011000011",
        "101000011110111111000111000000011111110000111111110011001111110111101111110000001100000000011000101",
        "101010000010100111000110001111000000111111111110000111000000000000001100000000111100000000010010011",
        "101011000110101100000011000000011000000001111111100111111111110111101111100000000100000000010011001",
        "101000000110000111000111000011110001111111111111000110000000010111101100000000011100000000010001101",
        "101011110000011111111000000111111100000000000000000000111111110111101100000001111100000000011001001",
        "101011000011000000000011111100000011111111000111100000000111110111101100000001111100000000011100001",
        "101000011000011110000000000001000111100000000011111100000000110111101111111000000100000000000000011",
        "101111000011111101111111110000000111000001110000000000011110000110000000000001100010000000001100011",
        "101011011000011011111000000001111111000000000000000001111111110111111000000011100000111111111110001",
        "101000011111000000001011011011010100001111100000000000000011110111111111111111111111100010101010101",
        "111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111"
    ];

    const tamaño = 6;      // MUROS MÁS DELGADOS (antes 6)
    const inicioX = -297;  // Ajustado para 60 celdas 
    const inicioZ = -297;  // Ajustado para 60 celdaslññ

    // =============================================
    // CREAR LOS MUROS DEL LABERINTO
    // =============================================
    for(let fila = 0; fila < laberinto.length; fila++){
        for(let columna = 0; columna < laberinto[fila].length; columna++){
            
            if(laberinto[fila][columna] === "1"){
                
                const x = inicioX + columna * tamaño;
                const z = inicioZ + fila * tamaño;
                
                // Zona de aulas (NO crear muro aquí)
                const enZonaAulas = (
                    x > -70 && x < 70 && //  -170   +170
                    z > -70 && z < 70  //
                );
                
                if(!enZonaAulas){
                    const geometria = new THREE.BoxGeometry(tamaño, ALTURA_PARED, tamaño);
                    const material = new THREE.MeshStandardMaterial({
                        color: 0x8B7D6B,
                        roughness: 0.9,
                        metalness: 0.1
                    });
                    const pared = new THREE.Mesh(geometria, material);
                    pared.position.set(x, ALTURA_PARED/2, z);
                    pared.castShadow = true;
                    pared.receiveShadow = true;
                    Juego.escena.add(pared);
                    Juego.paredes.push(pared);
                }
            }
        }
    }

    console.log("🏗️ Laberinto delgado creado - 60x60 celdas");
}

/*=========================================================
PUERTA DE LA BIBLIOTECA
=========================================================*/

function crearPuertaBiblioteca(x, z){

    const puerta = new THREE.Mesh(
        new THREE.BoxGeometry(10, 8, 0.6),
        new THREE.MeshStandardMaterial({ 
            color: 0x8B5A2B,
            roughness: 0.5,
            metalness: 0.2
        })
    );

    puerta.position.set(x, 4, z);
    puerta.castShadow = true;
    puerta.receiveShadow = true;
    puerta.userData.abierta = false;
    puerta.userData.esBiblioteca = true;

    Juego.escena.add(puerta);

    // 🔴 AÑADIR A PAREDES PARA COLISIÓN
    Juego.paredes.push(puerta);

    // Guardar referencia
    Juego.puertaBiblioteca = puerta;

    console.log("🚪 Puerta de biblioteca creada");

}
