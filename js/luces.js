"use strict";

/*=========================================================
LUCES MEJORADAS
=========================================================*/

function crearLucesMejoradas(){

    // 🔴 LUZ AMBIENTE MUY BAJA (oscuridad para el juego)
    const ambiente = new THREE.AmbientLight(0x1a1a2e, 0.15);
    ambiente.name = "ambienteJuego";
    Juego.escena.add(ambiente);

    // 🔴 LUZ DIRECCIONAL MUY DÉBIL
    const luna = new THREE.DirectionalLight(0x8899bb, 0.2);
    luna.position.set(200, 300, 200);
    luna.castShadow = false;
    Juego.escena.add(luna);

    // 🔴 LUZ ESPECIAL PARA VISTA PANORÁMICA (empieza apagada)
    const ambientePanoramica = new THREE.AmbientLight(0xffffff, 0);
    ambientePanoramica.name = "ambientePanoramica";
    Juego.escena.add(ambientePanoramica);
    
    // 🔴 GUARDAR REFERENCIA
    Juego.luzAmbiente = ambiente;
    Juego.luzPanoramica = ambientePanoramica;

    console.log("💡 Ambiente oscuro + luz panorámica lista");
}
