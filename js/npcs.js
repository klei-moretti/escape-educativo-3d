"use strict";

/*=========================================================
SISTEMA DE NPCs - VERSIÓN OPTIMIZADA (MENOS ALMAS, MÁS LUZ)
=========================================================*/

let npc1 = null;
let npc2 = null;
let almasDecorativas = [];
let npc1Aparecio = false;

let npc1Estado = {
    altura: 3, velocidad: 0.45, activo: false, hablando: false, tiempoHablando: 0, ultimaFrase: "", tiempoUltimaFrase: 0, balanceo: 0, offsetX: 4, offsetZ: 0
};
let npc2Estado = {
    altura: 3, velocidad: 0.45, activo: false, hablando: false, tiempoHablando: 0, ultimaFrase: "", tiempoUltimaFrase: 0, balanceo: 0, offsetX: -4, offsetZ: 0
};

const FRASES_BUENAS = [
    "Mejor vamos por el otro lado.",
    "No entres por ahí, parece un callejón.",
    "Por aquí podemos llegar más rápido.",
    "Ten cuidado, el suelo está roto.",
    "Sigue por este pasillo, hay un aula cerca.",
    "Ya casi encontramos una llave.",
    "Creo que esa puerta lleva a la salida."
];

const FRASES_DECORATIVAS = [
    "Nunca logré escapar...",
    "¿Cuándo podré salir de aquí?",
    "Tengo frío... mucho frío...",
    "Ayúdame... por favor..."
];

/*=========================================================
CREAR ALMA (CON MÁS LUZ)
=========================================================*/
function crearAlma(color, tamano){
    if(!color) color = 0x4A90E2;
    const alma = new THREE.Group();
    const tam = tamano || 1.2;
    
    // 🔴 ESFERA
    const esfera = new THREE.Mesh(
        new THREE.SphereGeometry(tam, 16, 16), 
        new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 2.5, // 🔴 MÁS BRILLO
            transparent: true, 
            opacity: 0.9 
        })
    );
    alma.add(esfera);
    
    // 🔴 HALO
    const halo = new THREE.Mesh(
        new THREE.SphereGeometry(tam * 1.5, 16, 16), 
        new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 1.0, // 🔴 MÁS BRILLO
            transparent: true, 
            opacity: 0.3 
        })
    );
    alma.add(halo);
    
    // 🔴 LUZ (AJUSTADA PARA QUE ILUMINE MÁS Y SE NOTE MENOS LA REDUCCIÓN)
    const luz = new THREE.PointLight(
        color, 
        1.5,  // 🔴 Intensidad subida un poco
        30    // 🔴 Alcance subido de 20 a 30 para que cubra más espacio
    );
    alma.add(luz);
    
    return alma;
}

function crearNPC1(){ npc1 = crearAlma(0x4A90E2); npc1.position.set(0, 3, 400); npc1.visible = false; Juego.escena.add(npc1); }
function crearNPC2(){ npc2 = crearAlma(0x60A5FA); npc2.position.set(0, 3, 400); npc2.visible = false; Juego.escena.add(npc2); }

/*=========================================================
CREAR TODAS LAS ALMAS (8 DE LABERINTO + 40 DE BIBLIOTECA)
=========================================================*/
function crearAlmasDecorativas(){
    // 🔴 DETECTAR CELULAR
    const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 🔴 CELULAR: 4 afuera + 20 biblioteca | PC: 8 afuera + 33 biblioteca (como está ahora)
    const cantidadLaberinto = esMovil ? 4 : 8;
    const cantidadBiblioteca = esMovil ? 20 : 33;

    const colores = [0x9B59B6, 0xE67E22, 0x1ABC9C, 0xF1C40F, 0xE74C3C, 0x3498DB, 0x2ECC71, 0xE91E63];
    
    // 🔴 ALMAS EN EL MAPA
    for(let i = 0; i < cantidadLaberinto; i++){
        let posX, posZ, intentos = 0;
        do { posX = (Math.random() - 0.5) * 550; posZ = (Math.random() - 0.5) * 550; intentos++; } while(hayColision(posX, posZ) && intentos < 20);
        
        const alma = crearAlma(colores[i % colores.length], 1.0);
        alma.position.set(posX, 3, posZ);
        alma.visible = true;
        alma.userData = { fase: Math.random() * Math.PI * 2, direccion: Math.random() * Math.PI * 2, tiempoCambio: 60 + Math.random() * 120, contador: 0, velocidad: 0.04 + Math.random() * 0.04, centroX: posX, centroZ: posZ, radioDeambular: 80 + Math.random() * 120, tiempoFrase: 300 + Math.random() * 600, contadorFrase: 0 };
        Juego.escena.add(alma);
        almasDecorativas.push(alma);
    }

    // 🔴 ALMAS EN LA BIBLIOTECA
    const coloresBiblio = [0x9B59B6, 0xE67E22, 0x1ABC9C, 0xF1C40F, 0x3498DB, 0xE91E63, 0x8E44AD, 0xD35400, 0x16A085, 0xF39C12, 0xC0392B, 0x2980B9, 0x27AE60, 0xE74C3C, 0x9B59B6, 0x1ABC9C, 0xE67E22, 0x3498DB, 0xF1C40F, 0xE91E63, 0x8E44AD, 0xD35400, 0x16A085, 0xF39C12, 0xC0392B, 0x2980B9, 0x27AE60, 0xE74C3C, 0x9B59B6, 0x1ABC9C, 0xE67E22, 0x3498DB, 0xF1C40F];
    
    for(let i = 0; i < cantidadBiblioteca; i++){
        const alma = crearAlma(coloresBiblio[i % coloresBiblio.length], 0.9);
        const posX = -80 + Math.random() * 160;
        const posZ = -60 + Math.random() * 120;
        alma.position.set(posX, 3, posZ);
        alma.visible = true;
        const tiempoFraseInicial = esMovil ? 2000 + Math.random() * 1000 : 300 + Math.random() * 500;
        alma.userData = { fase: Math.random() * Math.PI * 2, direccion: Math.random() * Math.PI * 2, tiempoCambio: 60 + Math.random() * 120, contador: 0, velocidad: 0.03 + Math.random() * 0.03, centroX: posX, centroZ: posZ, radioDeambular: 30 + Math.random() * 40, tiempoFrase: tiempoFraseInicial, contadorFrase: 0 };
        Juego.escena.add(alma);
        almasDecorativas.push(alma);
    }
    
    console.log("👻 Almas: " + (esMovil ? "Celular (2 seguidoras + 4 mapa + 20 biblioteca)" : "PC (2 seguidoras + 8 mapa + 33 biblioteca)"));
}

function hacerAparecerNPC1(){
    if(npc1Aparecio || !npc1 || !npc2 || !Juego.jugador) return;
    npc1Aparecio = true;
    const px = Juego.jugador.position.x;
    const pz = Juego.jugador.position.z;
    npc1.position.set(px + 4, 3, pz + 5); npc1.visible = true; npc1Estado.activo = true;
    npc2.position.set(px - 4, 3, pz + 5); npc2.visible = true; npc2Estado.activo = true;
    setTimeout(() => { if(npc1Estado.activo && !npc1Estado.hablando) hablarAlmaBuena(npc1, npc1Estado); }, 1500);
}

function actualizarAlmaBuena(npc, estado, offsetX, offsetZ){
    if(!npc || !estado.activo || !Juego.jugador) return;
    estado.balanceo += 0.08;
    const alturaFlotante = estado.altura + Math.sin(estado.balanceo) * 0.4;
    const objetivoX = Juego.jugador.position.x + offsetX;
    const objetivoZ = Juego.jugador.position.z + offsetZ;
    const dx = objetivoX - npc.position.x;
    const dz = objetivoZ - npc.position.z;
    const distancia = Math.sqrt(dx*dx + dz*dz);
    
    let velocidad = estado.velocidad;
    if(distancia > 15) velocidad = estado.velocidad * 2.5;
    else if(distancia > 8) velocidad = estado.velocidad * 1.5;
    
    if(distancia > 0.5){
        npc.position.x += (dx / distancia) * velocidad;
        npc.position.z += (dz / distancia) * velocidad;
    }
    npc.position.y = alturaFlotante;
    
    // 🔴 EN CELULAR: las 2 almas seguidoras NO hablan (solo iluminan)
    if(Juego.esMovil) return;

    estado.tiempoUltimaFrase++;
    if(estado.tiempoUltimaFrase > 1200 && !estado.hablando){
        hablarAlmaBuena(npc, estado);
        estado.tiempoUltimaFrase = 0;
    }
}

function actualizarNPC1(){
    if(!npc1 || !Juego.jugador) return;
    if(!npc1Aparecio){
        if(Juego.jugador.position.z > 75 && Juego.guiaVista && GameManager.llaves >= 1) hacerAparecerNPC1();
        return;
    }
    actualizarAlmaBuena(npc1, npc1Estado, npc1Estado.offsetX, npc1Estado.offsetZ);
    actualizarAlmaBuena(npc2, npc2Estado, npc2Estado.offsetX, npc2Estado.offsetZ);
}

function actualizarAlmasDecorativas(){
    if(!Juego.jugador) return;
    for(const alma of almasDecorativas){
        alma.userData.fase += 0.05;
        alma.position.y = 3 + Math.sin(alma.userData.fase) * 0.5;
        
        alma.userData.contador++;
        if(alma.userData.contador > alma.userData.tiempoCambio){
            alma.userData.direccion = Math.random() * Math.PI * 2;
            alma.userData.contador = 0;
            alma.userData.tiempoCambio = 60 + Math.random() * 120;
        }
        
        const nuevaX = alma.position.x + Math.sin(alma.userData.direccion) * alma.userData.velocidad;
        const nuevaZ = alma.position.z + Math.cos(alma.userData.direccion) * alma.userData.velocidad;
        const distCentro = Math.sqrt(Math.pow(nuevaX - alma.userData.centroX, 2) + Math.pow(nuevaZ - alma.userData.centroZ, 2));
        
        if(distCentro < alma.userData.radioDeambular){
            alma.position.x = nuevaX;
            alma.position.z = nuevaZ;
        } else {
            alma.userData.direccion = Math.atan2(alma.userData.centroX - alma.position.x, alma.userData.centroZ - alma.position.z);
        }
        
        alma.userData.contadorFrase++;
        if(alma.userData.contadorFrase > alma.userData.tiempoFrase){
            mostrarTextoFlotante(alma, FRASES_DECORATIVAS[Math.floor(Math.random() * FRASES_DECORATIVAS.length)]);
            alma.userData.contadorFrase = 0;
            alma.userData.tiempoFrase = Juego.esMovil 
                ? 2000 + Math.random() * 1000 
                : 400 + Math.random() * 800;  
        }
    }
}

function mostrarSubtitulo(nombre, frase, color){
    const anterior = document.getElementById("subtituloNPC"); if(anterior) anterior.remove();
    const colorHex = "#" + color.toString(16).padStart(6, '0');
    const subtitulo = document.createElement("div");
    subtitulo.id = "subtituloNPC";
    subtitulo.style.cssText = `position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); max-width: 600px; background: rgba(0, 0, 0, 0.85); color: white; padding: 15px 25px; border-radius: 10px; font-family: Arial, sans-serif; font-size: 17px; z-index: 9996; border: 2px solid ${colorHex}; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6); text-align: center; animation: fadeInSubtitulo 0.3s;`;
    subtitulo.innerHTML = `<div style="color: ${colorHex}; font-weight: bold; margin-bottom: 6px; font-size: 14px;">👻 ${nombre}</div><div style="color: #fff;">${frase}</div>`;
    document.body.appendChild(subtitulo);
    setTimeout(() => { if(subtitulo && subtitulo.parentNode){ subtitulo.style.opacity = "0"; subtitulo.style.transition = "opacity 0.5s"; setTimeout(() => subtitulo.remove(), 500); } }, 5000);
}

function mostrarTextoFlotante(alma, frase){
    if(!Juego.camara) return;
    const vector = new THREE.Vector3(); vector.copy(alma.position); vector.y += 2.5; vector.project(Juego.camara);
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth; const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
    if(vector.z > 1) return;
    const texto = document.createElement("div"); texto.className = "textoFlotanteAlma";
    texto.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; transform: translate(-50%, -100%); background: rgba(0, 0, 0, 0.75); color: white; padding: 6px 12px; border-radius: 8px; font-family: Arial, sans-serif; font-size: 12px; z-index: 9995; pointer-events: none; white-space: nowrap; opacity: 0; transition: opacity 0.5s;`;
    texto.innerText = frase; document.body.appendChild(texto);
    setTimeout(() => { texto.style.opacity = "1"; }, 50);
    setTimeout(() => { texto.style.opacity = "0"; setTimeout(() => texto.remove(), 500); }, 3000);
}

function hablarAlmaBuena(npc, estado){
    if(estado.hablando) return;
    let frase, intentos = 0;
    do { frase = FRASES_BUENAS[Math.floor(Math.random() * FRASES_BUENAS.length)]; intentos++; } while(frase === estado.ultimaFrase && intentos < 5);
    estado.ultimaFrase = frase;
    mostrarSubtitulo("Alma Perdida", frase, 0x4A90E2);
    estado.hablando = true;
    setTimeout(() => { estado.hablando = false; }, 5000);
}

function crearNPCs(){ crearNPC1(); crearNPC2(); crearAlmasDecorativas(); }
function actualizarNPCs(){ actualizarNPC1(); actualizarAlmasDecorativas(); }

const estilosAlmas = document.createElement("style");
estilosAlmas.innerHTML = `@keyframes fadeInSubtitulo { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } } .textoFlotanteAlma { pointer-events: none; user-select: none; }`;
document.head.appendChild(estilosAlmas);
console.log("👻 Sistema de almas cargado (menos almas, más luz)");
