"use strict";

/*=========================================================
FLECHAS GUÍA INTELIGENTES (VERSIÓN BRÚJULA)
=========================================================
Sistema de flechas que siguen al jugador y apuntan hacia
el objetivo actual (puerta, guía o llave).

🔴 Las flechas están CERCA del jugador (no atraviesan paredes)
🔴 Se RECALCULAN cada segundo
🔴 Siguen al jugador a donde vaya
=========================================================*/

// 🔴 Array global para las flechas
let flechasGuia = [];

// 🔴 FASE ACTUAL (1, 2, 3 o 4)
let faseActual = 1;

// 🔴 TIEMPO DEL ÚLTIMO RECÁLCULO
let ultimoRecalculo = 0;

// 🔴 POSICIONES CLAVE
const POSICIONES_GUIA = {
    puertaBiblioteca: { x: 0, z: 65 },
    estanteGuia: { x: 0, z: 42 },
    llaveBiblioteca: { x: 0, z: -50 }
};

/*=========================================================
INICIAR FLECHAS GUÍA (FASE 1)
=========================================================*/

function crearFlechasGuia(){
    
    faseActual = 1;
    ultimoRecalculo = 0;
    
    // 🔴 PRIMER CÁLCULO INMEDIATO
    recalcularFlechas();
    
    console.log("🎯 FASE 1: Flechas hacia la PUERTA de la biblioteca");
}

/*=========================================================
ACTUALIZAR FLECHAS GUÍA (cada frame)
=========================================================
🔴 NUEVO:
- Verifica si el jugador YA RECOGIÓ la llave de la biblioteca
- Si la recogió, elimina TODAS las flechas
=========================================================*/

function actualizarFlechasGuia(){
    
    // 🔴 VERIFICAR SI YA TERMINÓ (FASE 4)
    if(faseActual === 4) return;
    
    // 🔴 VERIFICAR QUE EL JUGADOR EXISTE
    if(!Juego.jugador) return;
    
    // 🔴 VERIFICAR SI EL JUGADOR YA RECOGIÓ LA LLAVE DE LA BIBLIOTECA
    // Si Juego.llaves > 0 y es la primera llave, eliminar flechas
    if(GameManager && GameManager.llaves >= 1){
        console.log("🎯 Jugador ya recogió la llave de biblioteca → Eliminando flechas");
        faseActual = 4;
        eliminarFlechasGuia();
        return;
    }
    
    // 🔴 DETECTAR CAMBIO DE FASE
    const px = Juego.jugador.position.x;
    const pz = Juego.jugador.position.z;
    
    // FASE 1 → FASE 2: Jugador entró a la biblioteca
    if(faseActual === 1 && pz < 60){
        faseActual = 2;
        console.log("🎯 FASE 2: Apuntando al ESTANTE DE LA GUÍA");
    }
    
    // FASE 2 → FASE 3: Jugador leyó la guía
    if(faseActual === 2 && Juego.guiaVista === true){
        faseActual = 3;
        console.log("🎯 FASE 3: Apuntando a la LLAVE");
    }
    
    // 🔴 RECALCULAR FLECHAS CADA 0.5 SEGUNDOS
    const ahora = Date.now();
    if(ahora - ultimoRecalculo > 500){
        recalcularFlechas();
        ultimoRecalculo = ahora;
    }
    
    // 🔴 ANIMAR FLECHAS
    animarFlechas();
}

/*=========================================================
RECALCULAR FLECHAS
=========================================================
Elimina las flechas viejas y crea nuevas desde la posición
actual del jugador hacia el objetivo.
=========================================================*/

function recalcularFlechas(){

    // 🔴 VERIFICAR QUE EL JUGADOR EXISTE
    if(!Juego.jugador){
        console.log("⚠️ Jugador no existe todavía, esperando...");
        return;
    }    
    
    // 🔴 LIMPIAR FLECHAS VIEJAS
    eliminarFlechasGuia();
    
    // 🔴 OBTENER POSICIÓN DEL JUGADOR
    const px = Juego.jugador.position.x;
    const pz = Juego.jugador.position.z;
    
    // 🔴 DETERMINAR OBJETIVO SEGÚN LA FASE
    let objetivo;
    
    if(faseActual === 1){
        objetivo = POSICIONES_GUIA.puertaBiblioteca;
    } else if(faseActual === 2){
        objetivo = POSICIONES_GUIA.estanteGuia;
    } else if(faseActual === 3){
        objetivo = POSICIONES_GUIA.llaveBiblioteca;
    } else {
        return;
    }
    
    // 🔴 CALCULAR DIRECCIÓN
    const dx = objetivo.x - px;
    const dz = objetivo.z - pz;
    const distancia = Math.sqrt(dx*dx + dz*dz);
    
    // 🔴 SI YA LLEGÓ AL OBJETIVO, NO CREAR FLECHAS
    if(distancia < 5) return;
    
    // 🔴 ÁNGULO HACIA EL OBJETIVO
    const angulo = Math.atan2(dx, dz);
    
    // 🔴 CREAR FLECHAS CORTAS (cerca del jugador)
    // Solo 3 flechas, separadas por 3 unidades
    const NUM_FLECHAS = 3;
    const SEPARACION = 3.5;
    const DISTANCIA_INICIAL = 5;
    
    for(let i = 0; i < NUM_FLECHAS; i++){
        
        const distanciaFlecha = DISTANCIA_INICIAL + i * SEPARACION;
        
        // Si la flecha estaría más lejos que el objetivo, no crearla
        if(distanciaFlecha > distancia) break;
        
        // Calcular posición de la flecha
        const fx = px + Math.sin(angulo) * distanciaFlecha;
        const fz = pz + Math.cos(angulo) * distanciaFlecha;
        
        // Crear flecha
        crearFlechaIndividual(fx, fz, i / NUM_FLECHAS, angulo);
    }
}

/*=========================================================
CREAR UNA FLECHA INDIVIDUAL
=========================================================*/

function crearFlechaIndividual(x, z, t, angulo){
    
    const grupo = new THREE.Group();
    
    // 🔴 MATERIAL AMARILLO BRILLANTE
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        emissive: 0xFFD700,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.95
    });
    
    // 🔴 TRIÁNGULO (flecha)
    const cono = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 1.8, 3),
        material
    );
    
    // 🔴 APUNTAR HACIA ADELANTE
    cono.rotation.x = Math.PI / 2;
    cono.position.y = 0.15;
    grupo.add(cono);
    
    // 🔴 POSICIONAR
    grupo.position.set(x, 0.15, z);
    
    // 🔴 ROTAR HACIA EL OBJETIVO
    grupo.rotation.y = angulo;
    
    // 🔴 REFERENCIA
    grupo.userData.esFlechaGuia = true;
    grupo.userData.orden = t;
    
    // 🔴 AÑADIR
    Juego.escena.add(grupo);
    flechasGuia.push(grupo);
}

/*=========================================================
ANIMAR FLECHAS (pulso)
=========================================================*/

function animarFlechas(){
    
    if(flechasGuia.length === 0) return;
    
    const tiempo = Date.now() * 0.004;
    
    for(let i = 0; i < flechasGuia.length; i++){
        
        const flecha = flechasGuia[i];
        const orden = flecha.userData.orden;
        
        // 🔴 PULSO
        const escala = 1 + Math.sin(tiempo - orden * 0.8) * 0.15;
        flecha.scale.set(escala, escala, escala);
    }
}

/*=========================================================
ELIMINAR FLECHAS GUÍA
=========================================================*/

function eliminarFlechasGuia(){
    
    for(const flecha of flechasGuia){
        Juego.escena.remove(flecha);
        if(flecha.geometry) flecha.geometry.dispose();
        if(flecha.material) flecha.material.dispose();
    }
    
    flechasGuia = [];
}

/*=========================================================
MARCAR GUÍA COMO VISTA
=========================================================*/

function marcarGuiaVista(){
    
    Juego.guiaVista = true;
    console.log("📖 Guía marcada como VISTA");
    
    // 🔴 CAMBIAR A FASE 3 (apuntar a la llave)
    faseActual = 3;
    
    // 🔴 RECALCULAR INMEDIATAMENTE
    ultimoRecalculo = 0;
    
    // 🔴 FORZAR RECÁLCULO
    setTimeout(() => {
        recalcularFlechas();
    }, 100);
}