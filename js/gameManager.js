"use strict";

/*=========================================================
GAME MANAGER
=========================================================*/

const GameManager = {

    llaves:0,

    totalLlaves:13,

    aulasResueltas:[],

    juegoTerminado:false,

    tiempoInicio:Date.now(),

    // /// 🚪 EVITA MOSTRAR MUCHOS MENSAJES
    mensajePuerta:false

};

/*=========================================================
AGREGAR LLAVE
=========================================================*/

function agregarLlave(){

    // 🔴 SI EL JUEGO TERMINÓ NO HACER NADA
    if(GameManager.juegoTerminado){
        return;
    }

    // 🔑 SUMAR LLAVE
    GameManager.llaves++;

    console.log("LLAVES =", GameManager.llaves);

    // 🟢 ACTUALIZAR HUD
    actualizarHUD();

    // 💾 GUARDAR PROGRESO EN SUPABASE
    guardarProgreso(
        GameManager.llaves,
        GameManager.llaves * 100, // puntaje (100 por llave)
        Juego.aulasCompletadas
    );

    // 🚪 SI YA TIENE TODAS LAS LLAVES
    if(GameManager.llaves >= GameManager.totalLlaves){
        desbloquearSalida();
    }
}

/*=========================================================
DESBLOQUEAR PUERTA FINAL
=========================================================*/

function desbloquearSalida(){

    // /// 🚪 SI NO EXISTE LA PUERTA
    if(!Juego.salida) return;

    // /// 🔴 SI YA ESTABA ABIERTA
    if(Juego.salida.userData.abierta) return;

    // /// 🔓 MARCAR ABIERTA
    Juego.salida.userData.abierta = true;

    // /// 🟢 CAMBIAR COLOR
    Juego.salida.userData.izquierda.material.color.set(0x00aa00);

    Juego.salida.userData.derecha.material.color.set(0x00aa00);

    console.log("🚪 Puerta desbloqueada");
}

/*=========================================================
ACTUALIZAR HUD
=========================================================*/

function actualizarHUD(){

    const contador = document.getElementById("contadorLlaves");
    if(contador){
        contador.innerHTML = "🔑 Llaves: " + GameManager.llaves + " / " + GameManager.totalLlaves;
        contador.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.7);
            color: #ffd700;
            padding: 12px 25px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 20px;
            z-index: 9999;
            border: 2px solid #ffd700;
            text-align: center;
        `;
    }

}

/*=========================================================
ABRIR SALIDA
=========================================================*/

function abrirSalida(){

    alert(

        "🚪 ¡La salida está abierta!\nVe a la puerta principal."

    );

    if(Juego.salida){

        Juego.salida.material.color.set(0x00ff00);

    }

}

/*=========================================================
VICTORIA FINAL
=========================================================*/

function ganarJuego(){

    // 🔴 evitar repetir victoria
    if(GameManager.juegoTerminado) return;

    GameManager.juegoTerminado = true;

    // 🎮 mostrar pantalla de victoria
    document.getElementById("victoria").style.display = "flex";

    // 🧠 detener movimiento del jugador
    Juego.velocidad = 0;
}

/*=========================================================
ABRIR PUERTA DEL AULA
=========================================================*/

function abrirPuerta(indice){

    /// 🔴 SI NO EXISTEN PUERTAS
    if(!Juego.puertas) return;

    /// 🔴 SI NO EXISTE ESA PUERTA
    if(!Juego.puertas[indice]) return;

    const puerta=Juego.puertas[indice];

    /// 🟢 CAMBIAR COLOR
    puerta.material.color.set(0x00aa00);

    /// 🔓 ABRIR
    puerta.userData.abierta=true;

    /// ▶️ ANIMAR
    puerta.userData.animando=true;

}
