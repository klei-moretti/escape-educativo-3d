"use strict";

/*=========================================================
PASILLOS
=========================================================*/

function crearPasillos(){

    crearPasillo(

        0,
        -120,
        320,
        12

    );

    crearPasillo(

        0,
        120,
        320,
        12

    );

    crearPasillo(

        0,
        0,
        20,
        240

    );

}

/*=========================================================
CREAR PASILLO
=========================================================*/

function crearPasillo(x,z,ancho,largo){

    const geometria = new THREE.BoxGeometry(

        ancho,
        1,
        largo

    );

    const material = new THREE.MeshStandardMaterial({

        color:0x303030

    });

    const pasillo = new THREE.Mesh(

        geometria,
        material

    );

    pasillo.position.set(

        x,
        0.51,
        z

    );

    pasillo.receiveShadow = true;

    Juego.escena.add(pasillo);

}
