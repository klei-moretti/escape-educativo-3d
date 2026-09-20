"use strict";

/*=========================================================
SISTEMA MAESTRO DE AULAS
=========================================================*/

const SistemaAulas = {

    aulas: [],

    inicializar(){

        this.crearAulas();

    },

    crearAulas(){

        const posiciones = [

            [-180,-120],
            [-60,-120],
            [60,-120],
            [180,-120],

            [-180,120],
            [-60,120],
            [60,120],
            [180,120],

            [-120,220],
            [0,220],
            [120,220]

        ];

        for(let i = 0; i < posiciones.length; i++){

            const aula = {

                id: i,

                x: posiciones[i][0],

                z: posiciones[i][1],

                completada: false,

                llaveTomada: false

            };

            this.aulas.push(aula);

            this.crearLlave(aula.x, aula.z);

        }

    },

    crearLlave(x, z){

        const grupo = new THREE.Group();

        const aro = new THREE.Mesh(

            new THREE.TorusGeometry(0.4,0.08,8,20),

            new THREE.MeshStandardMaterial({ color:0xffd700 })

        );

        aro.rotation.x = Math.PI/2;

        const mango = new THREE.Mesh(

            new THREE.BoxGeometry(0.15,0.6,0.08),

            new THREE.MeshStandardMaterial({ color:0xffd700 })

        );

        mango.position.y = -0.5;

        grupo.add(aro);
        grupo.add(mango);

        grupo.position.set(x,2,z);

        grupo.userData.recogida = false;

        Juego.escena.add(grupo);

    }

};
