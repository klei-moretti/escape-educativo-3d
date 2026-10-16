"use strict";

/*=========================================================
GAME MANAGER
=========================================================
Total del juego: 100 puntos
- Llave biblioteca: 4 puntos
- Cada aula: 8 puntos (sin fallos)
- Total: 4 + (8 × 12) = 100 puntos
=========================================================*/

const GameManager = {
    llaves: 0,
    totalLlaves: 13,
    
    // 🔴 PUNTOS ENTEROS
    puntos: 0,
    totalAulas: 12,
    puntosBiblioteca: 4,      // 4 puntos por llave de biblioteca
    puntosPorAula: 8,          // 8 puntos por aula (sin fallos)
    
    aulasResueltas: [],
    juegoTerminado: false,
    tiempoInicio: Date.now(),
    mensajePuerta: false,
    guiaVista: false           // 🔴 Requisito: ver guía antes de llave
};

/*=========================================================
AGREGAR LLAVE
=========================================================
Se llama cuando el usuario recoge una llave física.
Suma llave Y guarda el progreso.
=========================================================*/

function agregarLlave(){

    // 🔴 SI EL JUEGO TERMINÓ, NO HACER NADA
    if(GameManager.juegoTerminado){
        return;
    }

    // 🔑 SUMAR LLAVE
    GameManager.llaves++;
    
    // 🔴 SI ES LA LLAVE DE LA BIBLIOTECA (primera llave)
    // - Se le dan 4 puntos
    // - Se eliminan las flechas guía (ya cumplieron su función)
    if(GameManager.llaves === 1){
        
        // 🏆 SUMAR 4 PUNTOS POR LA LLAVE DE BIBLIOTECA
        GameManager.puntos += GameManager.puntosBiblioteca;
        console.log("📖 Llave de biblioteca: +" + GameManager.puntosBiblioteca + " pts");
        
        // 🎯 ELIMINAR FLECHAS GUÍA
        // El jugador ya encontró la primera llave, las flechas
        // ya no son necesarias. Ahora debe buscar las demás solo.
        if(typeof eliminarFlechasGuia === "function"){
            eliminarFlechasGuia();
            console.log("🎯 Flechas guía eliminadas (llave recogida)");
        }

        // 🔴 TAMBIÉN CAMBIAR LA FASE A 4
        if(typeof faseActual !== "undefined"){
            // No podemos modificar faseActual aquí directamente
            // pero la función actualizarFlechasGuia() lo detectará
        }


    }

    // 📊 MOSTRAR EN CONSOLA
    console.log("🔑 Llave " + GameManager.llaves);
    console.log("📊 Puntos: " + GameManager.puntos);

    // 🎨 ACTUALIZAR HUD (contador de llaves y puntos)
    actualizarHUD();

    // 💾 GUARDAR PROGRESO EN SUPABASE
    guardarProgreso(
        GameManager.llaves,
        GameManager.puntos,
        Juego.aulasCompletadas
    );

    // 🚪 SI YA TIENE TODAS LAS LLAVES, DESBLOQUEAR SALIDA
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
=========================================================
Muestra llaves Y puntos.
=========================================================*/

function actualizarHUD(){

    const contador = document.getElementById("contadorLlaves");
    if(contador){
        contador.innerHTML = "🔑 Llaves: " + GameManager.llaves + " / " + GameManager.totalLlaves + 
                             " | 🏆 Puntos: " + GameManager.puntos + " / 100";
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
            font-size: 18px;
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
GANAR JUEGO
=========================================================
Muestra la nota final y el desglose por aula.
=========================================================*/

function ganarJuego(){

    // 🔴 Evitar repetir victoria
    if(GameManager.juegoTerminado) return;

    GameManager.juegoTerminado = true;

    // 🔴 Calcular nota final (redondeada)
    const notaFinal = Math.round(GameManager.puntos);

    // 🔴 Mostrar nota final
    const elementoNota = document.getElementById("notaFinal");
    if(elementoNota){
        elementoNota.innerText = notaFinal;
    }

    // 🔴 Mostrar desglose por aula
    const desglose = document.getElementById("desglosePuntos");
    if(desglose && window.puntosPorAula){
        
        let html = "<h4 style='color:#ffd700; margin-bottom:10px;'>📊 Desglose por aula:</h4>";
        
        const nombresAulas = [
            "Matemáticas", "Lenguaje", "Inglés", "Biología",
            "Química", "Física", "Literatura", "Música",
            "Geografía", "Arte", "Historia", "Religión"
        ];
        
        for(let i = 0; i < 12; i++){
            
            const puntos = window.puntosPorAula[i] || 0;
            
            if(puntos > 0){
                html += `
                    <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #334155;">
                        <span style="color:#fff;">${nombresAulas[i]}</span>
                        <span style="color:#22c55e;">${puntos.toFixed(2)} pts</span>
                    </div>
                `;
            }
        }
        
        desglose.innerHTML = html;
    }

    // 🔴 Mostrar pantalla de victoria
    document.getElementById("victoria").style.display = "flex";

    // 🔴 Detener movimiento
    Juego.velocidad = 0;

    console.log("🏆 ¡JUEGO GANADO! Nota final: " + notaFinal);
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
