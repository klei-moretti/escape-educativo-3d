"use strict";

/*=========================================================
DECORACIÓN
=========================================================*/

function crearDecoracion(){

    // Árboles en las esquinas (más grandes)
    crearArbol(-280, -280);
    crearArbol(280, -280);
    crearArbol(-280, 280);
    crearArbol(280, 280);

    // Árboles en los lados
    crearArbol(-320, 0);
    crearArbol(320, 0);
    crearArbol(0, -320);
    crearArbol(0, 320);

    // Árboles intermedios
    crearArbol(-280, -150);
    crearArbol(280, -150);
    crearArbol(-280, 150);
    crearArbol(280, 150);
    crearArbol(-150, -280);
    crearArbol(150, -280);
    crearArbol(-150, 280);
    crearArbol(150, 280);

    console.log("🌳 16 árboles grandes creados");
}

/*=========================================================
ÁRBOL
=========================================================*/

function crearArbol(x, z){

    // TRONCO - más alto
    const tronco = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.2, 10, 8),  // Antes: 6
        new THREE.MeshStandardMaterial({
            color: 0x6b4423,
            roughness: 0.9,
            metalness: 0
        })
    );
    tronco.position.set(x, 5, z);  // Antes: 3
    tronco.castShadow = true;
    Juego.escena.add(tronco);

    // COPA PRINCIPAL - más grande
    const copa1 = new THREE.Mesh(
        new THREE.SphereGeometry(5, 8, 8),  // Antes: 3
        new THREE.MeshStandardMaterial({
            color: 0x2d7d2d,
            roughness: 0.8,
            metalness: 0
        })
    );
    copa1.position.set(x, 13, z);  // Antes: 8
    copa1.castShadow = true;
    Juego.escena.add(copa1);

    // COPA SECUNDARIA 1
    const copa2 = new THREE.Mesh(
        new THREE.SphereGeometry(4, 8, 8),
        new THREE.MeshStandardMaterial({
            color: 0x3a9d3a,
            roughness: 0.8,
            metalness: 0
        })
    );
    copa2.position.set(x + 3, 12, z + 2);
    copa2.castShadow = true;
    Juego.escena.add(copa2);

    // COPA SECUNDARIA 2
    const copa3 = new THREE.Mesh(
        new THREE.SphereGeometry(4, 8, 8),
        new THREE.MeshStandardMaterial({
            color: 0x3a9d3a,
            roughness: 0.8,
            metalness: 0
        })
    );
    copa3.position.set(x - 3, 12, z - 2);
    copa3.castShadow = true;
    Juego.escena.add(copa3);

    console.log(`🌳 Árbol grande creado en (${x}, ${z})`);
}