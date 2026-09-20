"use strict";

/*=========================================================
PUPITRE
=========================================================*/

function crearPupitre(x,z){

    const grupo = new THREE.Group();

    // Mesa
    const tablero = new THREE.Mesh(

        new THREE.BoxGeometry(1.2,0.1,0.8),

        new THREE.MeshStandardMaterial({

            color:0xc58b45

        })

    );

    tablero.position.y=0.8;

    grupo.add(tablero);

    // Patas
    for(let px of [-0.5,0.5]){

        for(let pz of [-0.3,0.3]){

            const pata=new THREE.Mesh(

                new THREE.BoxGeometry(0.08,0.8,0.08),

                new THREE.MeshStandardMaterial({

                    color:0x555555

                })

            );

            pata.position.set(

                px,

                0.4,

                pz

            );

            grupo.add(pata);

        }

    }

    grupo.position.set(

        x,

        0,

        z

    );

    Juego.escena.add(grupo);

}

/*=========================================================
PIZARRA
=========================================================*/

function crearPizarra(x,z){

    const grupo = new THREE.Group();

    // Pizarra
    const pizarra = new THREE.Mesh(

        new THREE.BoxGeometry(6,2.5,0.15),

        new THREE.MeshStandardMaterial({

            color:0x1b3d1b

        })

    );

    pizarra.position.y = 2.5;

    grupo.add(pizarra);

    // Marco
    const marco = new THREE.Mesh(

        new THREE.BoxGeometry(6.2,2.7,0.2),

        new THREE.MeshStandardMaterial({

            color:0x8b5a2b

        })

    );

    marco.position.y = 2.5;

    grupo.add(marco);

    grupo.position.set(

        x,

        0,

        z

    );

    Juego.escena.add(grupo);

}

/*=========================================================
ESCRITORIO DEL PROFESOR
=========================================================*/

function crearEscritorioProfesor(x,z){

    const escritorio = new THREE.Mesh(

        new THREE.BoxGeometry(

            2.5,

            1,

            1.2

        ),

        new THREE.MeshStandardMaterial({

            color:0x7a4a21

        })

    );

    escritorio.position.set(

        x,

        0.5,

        z

    );

    escritorio.castShadow = true;

    escritorio.receiveShadow = true;

    Juego.escena.add(escritorio);

}

/*=========================================================
SALÓN COMPLETO
=========================================================*/

function crearSalonCompleto(x,z){

    // Pizarra
    crearPizarra(

        x,

        z-15

    );

    // Escritorio
    crearEscritorioProfesor(

        x,

        z-11

    );

    // Pupitres
    for(let fila=0;fila<3;fila++){

        for(let col=0;col<4;col++){

            crearPupitre(

                x-8+(col*5),

                z-3+(fila*5)

            );

        }

    }

}
