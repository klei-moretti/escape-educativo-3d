"use strict";

/*=========================================================
SISTEMA DE AULAS
=========================================================*/

if(!Juego.zonasPreguntas){
    Juego.zonasPreguntas = [];
}

function crearZonaPregunta(x, z, id){
    Juego.zonasPreguntas.push({
        id: id,    // IDEN EL AULA
        x: x,      // posición en el eje X HO
        z: z,      // posición en el eje Z PROFUN
        radio: 8, // distancia en la que se activa
        activa: true
    });
}

/*=========================================================
REVISAR SI EL JUGADOR ENTRA A UN AULA
=========================================================*/

function revisarZonasPreguntas(){  // LLA NO

    if(!Juego.jugador) return;

    if(!Juego.zonasPreguntas) return;

    for(const zona of Juego.zonasPreguntas){

        if(!zona.activa) continue;

        const dx = Juego.jugador.position.x - zona.x;

        const dz = Juego.jugador.position.z - zona.z;

        const distancia = Math.sqrt(dx*dx + dz*dz);

        if(distancia <= zona.radio){  // RAD:8

            zona.activa = false;

            mostrarPregunta(zona.id);

            break;

        }

    }

}