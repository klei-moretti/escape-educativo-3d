"use strict";

/*=========================================================
SISTEMA DE OPTIMIZACIÓN - CARGA DINÁMICA
=========================================================
Las aulas se cargan SOLO cuando el jugador está cerca.
NO pre-carga todo al inicio (evita congelamiento).
=========================================================*/

// 🔴 CACHÉ DE GEOMETRÍAS
const CacheGeometrias = {};

function geometriaCompartida(tipo, ...args){
    
    const key = tipo + "_" + args.join("_");
    
    if(!CacheGeometrias[key]){
        
        switch(tipo){
            case "box":
                CacheGeometrias[key] = new THREE.BoxGeometry(...args);
                break;
            case "cylinder":
                CacheGeometrias[key] = new THREE.CylinderGeometry(...args);
                break;
            case "plane":
                CacheGeometrias[key] = new THREE.PlaneGeometry(...args);
                break;
            case "sphere":
                CacheGeometrias[key] = new THREE.SphereGeometry(...args);
                break;
            case "cone":
                CacheGeometrias[key] = new THREE.ConeGeometry(...args);
                break;
            case "torus":
                CacheGeometrias[key] = new THREE.TorusGeometry(...args);
                break;
            case "circle":
                CacheGeometrias[key] = new THREE.CircleGeometry(...args);
                break;
        }
    }
    
    return CacheGeometrias[key];
}

/*=========================================================
CARGA DINÁMICA POR PROXIMIDAD
=========================================================*/

// 🔴 RADIO DE CARGA (en unidades)
const RADIO_CARGA_AULA = 100;

// 🔴 AULAS REGISTRADAS
let aulasDecoradas = {};

// 🔴 BANDERA: ¿Ya se decoró esta aula?
let aulasYaDecoradas = {};

/*=========================================================
REGISTRAR AULA
=========================================================*/

function registrarAulaDinamica(id, x, z, funcionDecorar){
    
    aulasDecoradas[id] = {
        id: id,
        x: x,
        z: z,
        funcion: funcionDecorar,
        activa: false
    };
    
    aulasYaDecoradas[id] = false;
}

/*=========================================================
ACTUALIZAR AULAS DINÁMICAS (cada frame)
=========================================================
Si el jugador está a menos de RADIO_CARGA_AULA unidades,
se decora esa aula (una sola vez).
=========================================================*/

function actualizarAulasDinamicas(){
    
    if(!Juego.jugador) return;
    
    const px = Juego.jugador.position.x;
    const pz = Juego.jugador.position.z;
    
    for(const id in aulasDecoradas){
        
        const aula = aulasDecoradas[id];
        
        // 🔴 SALTAR SI YA ESTÁ DECORADA
        if(aulasYaDecoradas[id]) continue;
        
        const dx = px - aula.x;
        const dz = pz - aula.z;
        const distancia = Math.sqrt(dx*dx + dz*dz);
        
        // 🔴 SI ESTÁ CERCA → DECORAR (SOLO UNA VEZ)
        if(distancia < RADIO_CARGA_AULA){
            
            aulasYaDecoradas[id] = true;
            aula.activa = true;
            
            // 🔴 DECORAR SIN BLOQUEAR (con setTimeout)
            setTimeout(() => {
                try {
                    aula.funcion(aula.x, aula.z);
                    console.log("📚 Aula decorada:", id);
                } catch(e) {
                    console.error("❌ Error decorando:", id, e);
                }
            }, 50);
        }
    }
}

/*=========================================================
FUNCIONES VACÍAS (por compatibilidad)
=========================================================*/

function iniciarCargaAulas(){}
function cargarSiguienteAula(){}
function todasLasAulasCargadas(){ return true; }
function eliminarObjetosAula(id){}