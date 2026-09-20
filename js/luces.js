"use strict";

/*=========================================================
LUCES MEJORADAS
=========================================================*/

function crearLucesMejoradas(){

    // =============================================
    // LUZ AMBIENTE (más brillante)
    // =============================================
    const ambiente = new THREE.AmbientLight(0xffffff, 0.9);
    Juego.escena.add(ambiente);

    // =============================================
    // LUZ DIRECCIONAL (sol)
    // =============================================
    const sol = new THREE.DirectionalLight(0xffffff, 1.5);
    sol.position.set(200, 300, 200);
    sol.castShadow = true;
    Juego.escena.add(sol);

    // =============================================
    // LUZ DESDE ABAJO
    // =============================================
    const luzAbajo = new THREE.DirectionalLight(0xffffff, 0.5);
    luzAbajo.position.set(0, -100, 0);
    Juego.escena.add(luzAbajo);

    // =============================================
    // LUCES EN CADA AULA
    // =============================================
    const aulas = [
        [-120, -120], [-60, -120], 
        [-120, 120], [-60, 120],
        [60, -120], [120, -120],
        [60, 120], [120, 120],
        [-120, 220], [0, 220], [120, 220]
    ];

    for(const pos of aulas){
        const luz = new THREE.PointLight(0xffffff, 1.0, 25);
        luz.position.set(pos[0], 9, pos[1]);
        Juego.escena.add(luz);
    }

    // =============================================
    // LUZ EN LA BIBLIOTECA
    // =============================================
    const luzBiblio = new THREE.PointLight(0xffd700, 1.5, 30);
    luzBiblio.position.set(0, 10, -50);
    Juego.escena.add(luzBiblio);

    // =============================================
    // LUZ CENTRAL
    // =============================================
    const luzCentral = new THREE.PointLight(0xffffff, 0.8, 50);
    luzCentral.position.set(0, 15, 0);
    Juego.escena.add(luzCentral);

    console.log("💡 Luces mejoradas creadas");
}