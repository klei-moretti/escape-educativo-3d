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

function crearSalonCompleto(x, z){
    
    // 🔴 PIZARRA DESGASTADA
    crearPizarra(x, z - 15);
    
    // 🔴 ESCRITORIO DEL PROFESOR ROTO
    crearEscritorioProfesor(x, z - 11);
    
    // 🔴 PUPITRES DESPARRAMADOS Y ROTOS
    // En vez de una cuadrícula perfecta, los ponemos al azar
    const posicionesPupitres = [
        { x: x - 10, z: z - 5,  rot: 0.3 },
        { x: x - 5,  z: z - 3,  rot: -0.8 },
        { x: x + 2,  z: z - 6,  rot: 1.2 },
        { x: x + 8,  z: z - 4,  rot: -0.5 },
        { x: x - 12, z: z + 2,  rot: 2.1 },
        { x: x - 3,  z: z + 1,  rot: 0.7 },
        { x: x + 5,  z: z + 3,  rot: -1.5 },
        { x: x + 12, z: z + 5,  rot: 0.9 },
        { x: x - 8,  z: z + 7,  rot: -2.3 },
        { x: x + 1,  z: z + 8,  rot: 1.8 },
        { x: x - 15, z: z - 8,  rot: 3.0 },
        { x: x + 15, z: z + 1,  rot: 0.2 }
    ];
    
    for(const pos of posicionesPupitres){
        crearPupitreRoto(pos.x, pos.z, pos.rot);
    }
    
    // 🔴 RESTOS EN EL SUELO (papeles, escombros)
    crearRestosEnSuelo(x, z);
    
    // 🔴 GRIETAS EN EL PISO
    crearGrietasPiso(x, z);
}

/*=========================================================
PUPITRE ROTO
=========================================================*/

function crearPupitreRoto(x, z, rotacion){
    
    const grupo = new THREE.Group();
    grupo.position.set(x, 0, z);
    grupo.rotation.y = rotacion;
    
    // 🔴 TABLERO CAÍDO O INCLINADO
    const inclinacion = (Math.random() - 0.5) * 0.4;
    
    const tablero = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.1, 0.8),
        new THREE.MeshStandardMaterial({
            color: 0x6B4C3B,
            roughness: 0.95,
            metalness: 0
        })
    );
    tablero.position.y = 0.8;
    tablero.rotation.z = inclinacion;
    tablero.castShadow = true;
    grupo.add(tablero);
    
    // 🔴 SOLO 2 PATAS (las otras 2 están rotas)
    const patasActivas = Math.floor(Math.random() * 3) + 1; // 1 a 3 patas
    
    const posicionesPatas = [
        [-0.5, -0.3], [0.5, -0.3],
        [-0.5, 0.3], [0.5, 0.3]
    ];
    
    for(let i = 0; i < patasActivas; i++){
        const pata = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.8, 0.08),
            new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.9,
                metalness: 0.3
            })
        );
        pata.position.set(posicionesPatas[i][0], 0.4, posicionesPatas[i][1]);
        pata.rotation.z = (Math.random() - 0.5) * 0.3;
        grupo.add(pata);
    }
    
    // 🔴 A VECES, PATA ROTA AL LADO
    if(Math.random() > 0.5){
        const pataRota = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.8, 0.08),
            new THREE.MeshStandardMaterial({
                color: 0x3a3a3a,
                roughness: 0.9,
                metalness: 0.3
            })
        );
        pataRota.position.set(
            (Math.random() - 0.5) * 1.5,
            0.05,
            (Math.random() - 0.5) * 1.5
        );
        pataRota.rotation.z = Math.PI / 2;
        grupo.add(pataRota);
    }
    
    Juego.escena.add(grupo);
}

/*=========================================================
RESTOS EN EL SUELO
=========================================================*/

function crearRestosEnSuelo(x, z){
    
    // 🔴 PAPELES ARRUGADOS
    for(let i = 0; i < 6; i++){
        const papel = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, 0.5),
            new THREE.MeshStandardMaterial({
                color: 0xD4C4A8,
                roughness: 0.9,
                side: THREE.DoubleSide
            })
        );
        papel.rotation.x = -Math.PI / 2;
        papel.rotation.z = Math.random() * Math.PI;
        papel.position.set(
            x + (Math.random() - 0.5) * 40,
            0.02,
            z + (Math.random() - 0.5) * 30
        );
        Juego.escena.add(papel);
    }
    
    // 🔴 TROZOS DE MADERA
    for(let i = 0; i < 4; i++){
        const trozo = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.3 + Math.random() * 0.5,
                0.1,
                0.2 + Math.random() * 0.3
            ),
            new THREE.MeshStandardMaterial({
                color: 0x4A3520,
                roughness: 0.95
            })
        );
        trozo.rotation.y = Math.random() * Math.PI;
        trozo.position.set(
            x + (Math.random() - 0.5) * 40,
            0.05,
            z + (Math.random() - 0.5) * 30
        );
        Juego.escena.add(trozo);
    }
    
    // 🔴 LIBROS TIRADOS
    for(let i = 0; i < 3; i++){
        const libro = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.15, 0.6),
            new THREE.MeshStandardMaterial({
                color: 0x3D2415,
                roughness: 0.9
            })
        );
        libro.rotation.y = Math.random() * Math.PI;
        libro.position.set(
            x + (Math.random() - 0.5) * 35,
            0.1,
            z + (Math.random() - 0.5) * 25
        );
        Juego.escena.add(libro);
    }
}

/*=========================================================
GRIETAS EN EL PISO
=========================================================*/

function crearGrietasPiso(x, z){
    
    // 🔴 GRIETAS (líneas oscuras en el piso)
    for(let i = 0; i < 8; i++){
        
        const largo = 2 + Math.random() * 4;
        
        const grieta = new THREE.Mesh(
            new THREE.PlaneGeometry(largo, 0.15),
            new THREE.MeshBasicMaterial({
                color: 0x0a0a0a,
                transparent: true,
                opacity: 0.8
            })
        );
        
        grieta.rotation.x = -Math.PI / 2;
        grieta.rotation.z = Math.random() * Math.PI;
        grieta.position.set(
            x + (Math.random() - 0.5) * 45,
            0.01,
            z + (Math.random() - 0.5) * 35
        );
        
        Juego.escena.add(grieta);
    }
}
