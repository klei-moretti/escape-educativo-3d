"use strict";

/*=========================================================
SISTEMA DE NPCs - VERSIÓN ALMAS
=========================================================
👻 2 ALMAS BUENAS (azules) - Te siguen
👻 1 ALMA MALA (roja) - Te persigue
👻 Varias ALMAS DECORATIVAS (colores variados) - Deambulan

💡 Todas las almas iluminan a su alrededor
💬 Texto sin botón (auto-desaparece)
=========================================================*/

// 🔴 REFERENCIAS
let npc1 = null;              // Alma buena 1
let npc2 = null;              // Alma buena 2
let npcMalo = null;           // Alma mala
let almasDecorativas = [];    // Almas que deambulan

// 🔴 CONTROL
let npc1Aparecio = false;

// 🔴 ESTADO DE ALMAS BUENAS
let npc1Estado = {
    altura: 3,
    velocidad: 0.24,
    activo: false,
    hablando: false,
    tiempoHablando: 0,
    ultimaFrase: "",
    tiempoUltimaFrase: 0,
    balanceo: 0,
    offsetX: 4,         // Va a la derecha del jugador
    offsetZ: 0
};

let npc2Estado = {
    altura: 3,
    velocidad: 0.24,
    activo: false,
    hablando: false,
    tiempoHablando: 0,
    ultimaFrase: "",
    tiempoUltimaFrase: 0,
    balanceo: 0,
    offsetX: -4,        // Va a la izquierda del jugador
    offsetZ: 0
};

// 🔴 ESTADO ALMA MALA
let npcMaloEstado = {
    altura: 3,
    velocidad: 0.18,
    activo: false,
    aparecio: false,
    umbralLlaves: 4,
    tiempoVisible: 0,
    balanceo: 0,
    cooldown: 0
};

// 🔴 AULAS
let aulasPosiciones = [];
let aulasVisitadas = [];

// 🔴 PREGUNTAS DIFÍCILES
const PREGUNTAS_CAPTURA = [
    { p: "¿Cuál es la raíz cuadrada de 144?", r: ["10", "12", "14", "16"], c: 1 },
    { p: "¿Cuál es el resultado de 15 × 12?", r: ["160", "170", "180", "190"], c: 2 },
    { p: "¿Cuál es el símbolo químico del oro?", r: ["Ag", "Au", "Go", "Or"], c: 1 },
    { p: "¿En qué año llegó el hombre a la Luna?", r: ["1965", "1969", "1972", "1958"], c: 1 },
    { p: "¿Cuál es el río más largo del mundo?", r: ["Nilo", "Amazonas", "Yangtsé", "Misisipi"], c: 1 },
    { p: "¿Cuántos huesos tiene el cuerpo humano adulto?", r: ["206", "208", "210", "200"], c: 0 },
    { p: "¿Quién escribió 'Cien años de soledad'?", r: ["Borges", "Cortázar", "García Márquez", "Vargas Llosa"], c: 2 },
    { p: "¿Cuál es el planeta más grande del sistema solar?", r: ["Saturno", "Neptuno", "Júpiter", "Urano"], c: 2 }
];

/*=========================================================
FRASES DE LAS ALMAS BUENAS (SUBTÍTULOS ABAJO)
=========================================================*/

const FRASES_BUENAS = [
    "¿Sabes? Yo estudiaba aquí antes del incendio...",
    "Nunca logré escapar. Espero que tú sí puedas.",
    "Este lugar está maldito desde esa noche...",
    "Ten cuidado, hay almas que no son amigables.",
    "Sigue buscando llaves, no te rindas.",
    "Yo conozco este lugar como la palma de mi mano.",
    "El aula más cercana está por aquí.",
    "Cuando encuentres todas las llaves, podrás irte.",
    "Escucho susurros... ¿tú también?",
    "A veces veo a otros como yo... pero se desvanecen."
];

/*=========================================================
FRASES DE LAS ALMAS DECORATIVAS (FLOTANTES)
=========================================================*/

const FRASES_DECORATIVAS = [
    "Nunca logré escapar...",
    "¿Cuándo podré salir de aquí?",
    "Tengo frío... mucho frío...",
    "Ayúdame... por favor...",
    "No recuerdo mi nombre...",
    "¿Dónde está mi familia?",
    "El fuego... no puedo olvidarlo...",
    "Solo quiero descansar...",
    "¿Alguien me escucha?",
    "Estoy perdido... muy perdido..."
];

/*=========================================================
FRASES DEL ALMA MALA
=========================================================*/

const FRASES_MALAS = [
    "¡No te dejaré escapar!",
    "¡Quedate aquí conmigo!",
    "¡Todos se van y me dejan!",
    "¡Si yo no puedo salir, tú tampoco!",
    "¡Vuelve aquí!",
    "¡Esa salida es mentira!",
    "¡Te voy a atrapar!"
];

/*=========================================================
CREAR UN ALMA (función reutilizable)
=========================================================*/

function crearAlma(color, tamano){
    
    // 🔴 PROTECCIÓN: Si color es undefined, usar azul por defecto
    if(color === undefined || color === null){
        color = 0x4A90E2;
        console.warn("⚠️ Alma con color undefined, usando azul por defecto");
    }
    
    const alma = new THREE.Group();
    
    const tam = tamano || 1.2;
    
    // ESFERA PRINCIPAL
    const esfera = new THREE.Mesh(
        new THREE.SphereGeometry(tam, 16, 16),
        new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.9
        })
    );
    alma.add(esfera);
    
    // HALO
    const halo = new THREE.Mesh(
        new THREE.SphereGeometry(tam * 1.5, 16, 16),
        new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.25
        })
    );
    alma.add(halo);
    
    // LUZ
    const luz = new THREE.PointLight(color, 3, 20);
    alma.add(luz);
    
    alma.userData.color = color;
    alma.userData.luz = luz;
    
    return alma;
}

/*=========================================================
CREAR TODAS LAS ALMAS
=========================================================*/

function crearNPC1(){
    npc1 = crearAlma(0x4A90E2);  // 🔵 Azul
    npc1.position.set(0, 3, 400);
    npc1.visible = false;
    Juego.escena.add(npc1);
    console.log("👻 Alma buena 1 creada");
}

function crearNPC2(){
    npc2 = crearAlma(0x60A5FA);  // 🔵 Azul más claro
    npc2.position.set(0, 3, 400);
    npc2.visible = false;
    Juego.escena.add(npc2);
    console.log("👻 Alma buena 2 creada");
}

function crearNpcMalo(){
    npcMalo = crearAlma(0xDC2626, 1.5);  // 🔴 Rojo más grande
    npcMalo.position.set(0, 3, 400);
    npcMalo.visible = false;
    Juego.escena.add(npcMalo);
    console.log("👻 Alma mala creada");
}

function crearAlmasDecorativas(){
    
    // 🔴 15 ALMAS DE COLORES VARIADOS
    const colores = [
        0x9B59B6,  // Morado
        0xE67E22,  // Naranja
        0x1ABC9C,  // Verde agua
        0xF1C40F,  // Amarillo
        0xE74C3C,  // Rojo claro
        0x3498DB,  // Azul claro
        0x2ECC71,  // Verde
        0xE91E63,  // Rosa
        0x8E44AD,  // Púrpura
        0xD35400,  // Naranja oscuro
        0x16A085,  // Verde oscuro
        0xF39C12,  // Amarillo oscuro
        0xC0392B,  // Rojo oscuro
        0x2980B9,  // Azul
        0x27AE60   // Verde claro
    ];
    
    // 🔴 POSICIONES ALEATORIAS POR TODO EL MAPA
    // Se generan al azar dentro de los límites del laberinto
    for(let i = 0; i < 15; i++){
        
        // 🔴 GENERAR POSICIÓN ALEATORIA EN TODO EL MAPA
        let posX, posZ;
        let intentos = 0;
        
        do {
            posX = (Math.random() - 0.5) * 550;  // Entre -275 y 275
            posZ = (Math.random() - 0.5) * 550;
            intentos++;
        } while(hayColision(posX, posZ) && intentos < 20);
        
        // 🔴 CREAR ALMA
        const alma = crearAlma(colores[i % colores.length], 1.0);
        
        alma.position.set(posX, 3, posZ);
        alma.visible = true;
        
        // 🔴 ESTADO INDIVIDUAL
        alma.userData.fase = Math.random() * Math.PI * 2;
        alma.userData.direccion = Math.random() * Math.PI * 2;
        alma.userData.tiempoCambio = 60 + Math.random() * 120;
        alma.userData.contador = 0;
        alma.userData.velocidad = 0.04 + Math.random() * 0.04;
        alma.userData.centroX = posX;
        alma.userData.centroZ = posZ;
        alma.userData.radioDeambular = 80 + Math.random() * 120;  // 🔴 MÁS GRANDE
        alma.userData.tiempoFrase = 300 + Math.random() * 600;
        alma.userData.contadorFrase = 0;
        
        Juego.escena.add(alma);
        almasDecorativas.push(alma);
    }

    // 🔴 MUCHAS ALMAS DENTRO DE LA BIBLIOTECA
    // La biblioteca está entre x=-85 y x=85, z=-65 y z=65

    const coloresBiblioteca = [
        0x9B59B6, 0xE67E22, 0x1ABC9C, 0xF1C40F,
        0x3498DB, 0xE91E63, 0x8E44AD, 0xD35400,
        0x16A085, 0xF39C12, 0xC0392B, 0x2980B9,
        0x27AE60, 0xE74C3C, 0x9B59B6, 0x1ABC9C,
        0xE67E22, 0x3498DB, 0xF1C40F, 0xE91E63,
        0x8E44AD, 0xD35400, 0x16A085, 0xF39C12,
        0xC0392B, 0x2980B9, 0x27AE60, 0xE74C3C,
        0x9B59B6, 0x1ABC9C, 0xE67E22, 0x3498DB,
        0xF1C40F, 0xE91E63, 0x8E44AD, 0xD35400,
        0x16A085, 0xF39C12, 0xC0392B, 0x2980B9,
        0x00CED1, 0xFF1493, 0x7FFF00, 0xFFD700,
        0x8A2BE2, 0xFF6347, 0x20B2AA, 0x9370DB,
        0xFF69B4, 0x00FA9A, 0xFF8C00, 0x6A5ACD,
        0xDC143C, 0x00BFFF, 0x32CD32, 0xFF4500,
        0xDA70D6, 0x40E0D0, 0xEE82EE, 0xFFB6C1
    ];

    // 🔴 20 ALMAS DENTRO DE LA BIBLIOTECA
    for(let i = 0; i < 60; i++){
        
        const alma = crearAlma(coloresBiblioteca[i], 0.9);
        
        // 🔴 POSICIÓN ALEATORIA DENTRO DE LA BIBLIOTECA
        // Biblioteca: x entre -80 y 80, z entre -60 y 60
        const posX = -80 + Math.random() * 160;  // -80 a 80
        const posZ = -60 + Math.random() * 120;  // -60 a 60
        
        alma.position.set(posX, 3, posZ);
        alma.visible = true;
        
        alma.userData.fase = Math.random() * Math.PI * 2;
        alma.userData.direccion = Math.random() * Math.PI * 2;
        alma.userData.tiempoCambio = 60 + Math.random() * 120;
        alma.userData.contador = 0;
        alma.userData.velocidad = 0.03 + Math.random() * 0.03;
        alma.userData.centroX = posX;
        alma.userData.centroZ = posZ;
        alma.userData.radioDeambular = 30 + Math.random() * 40;  // 🔴 MÁS GRANDE
        alma.userData.tiempoFrase = 300 + Math.random() * 500;  // 🔴 MÁS SEGUIDO
        alma.userData.contadorFrase = 0;
        
        Juego.escena.add(alma);
        almasDecorativas.push(alma);
    }
    
    console.log("👻 60 almas en la biblioteca creadas");
}

/*=========================================================
REGISTRAR AULAS
=========================================================*/

function registrarAulasParaNPC(){
    aulasPosiciones = [
        { x: -200, z: -220 }, { x: -60,  z: -240 },
        { x: 200,  z: -220 }, { x: -240, z: -120 },
        { x: -200, z: 0    }, { x: -240, z: 120  },
        { x: 200,  z: 0    }, { x: 240,  z: 120  },
        { x: -100, z: 140  }, { x: -160, z: -150 },
        { x: 220,  z: 220  }, { x: 240,  z: -120 }
    ];
}

/*=========================================================
HACER APARECER LAS ALMAS BUENAS
=========================================================*/

function hacerAparecerNPC1(){
    
    if(npc1Aparecio) return;
    if(!npc1 || !npc2) return;
    if(!Juego.jugador) return;
    
    npc1Aparecio = true;
    
    const px = Juego.jugador.position.x;
    const pz = Juego.jugador.position.z;
    
    // 🔴 ALMA 1 - Aparece al lado derecho
    npc1.position.set(px + 4, 3, pz + 5);
    npc1.visible = true;
    npc1Estado.activo = true;
    
    // 🔴 ALMA 2 - Aparece al lado izquierdo
    npc2.position.set(px - 4, 3, pz + 5);
    npc2.visible = true;
    npc2Estado.activo = true;
    
    console.log("👻 Almas buenas aparecieron");
    
    // 🔴 HABLAR DESPUÉS DE 1.5 SEG
    setTimeout(() => {
        if(npc1Estado.activo && !npc1Estado.hablando){
            hablarAlmaBuena(npc1, npc1Estado);
        }
    }, 1500);
}

/*=========================================================
ACTUALIZAR ALMAS BUENAS (SIGUEN AL JUGADOR)
=========================================================*/

function actualizarAlmaBuena(npc, estado, offsetX, offsetZ){
    
    if(!npc || !estado.activo) return;
    if(!Juego.jugador) return;
    
    // 🔴 ANIMACIÓN DE FLOTACIÓN
    estado.balanceo += 0.08;
    const alturaFlotante = estado.altura + Math.sin(estado.balanceo) * 0.4;
    
    // 🔴 POSICIÓN OBJETIVO (al lado del jugador)
    const jugadorX = Juego.jugador.position.x;
    const jugadorZ = Juego.jugador.position.z;
    
    const objetivoX = jugadorX + offsetX;
    const objetivoZ = jugadorZ + offsetZ;
    
    // 🔴 MOVER SUAVEMENTE HACIA EL OBJETIVO
    const dx = objetivoX - npc.position.x;
    const dz = objetivoZ - npc.position.z;
    const distancia = Math.sqrt(dx*dx + dz*dz);
    
    // 🔴 VELOCIDAD ADAPTATIVA (más rápido si está lejos)
    let velocidad = estado.velocidad;
    if(distancia > 15) velocidad = estado.velocidad * 2.5;
    else if(distancia > 8) velocidad = estado.velocidad * 1.5;
    
    if(distancia > 0.5){
        npc.position.x += (dx / distancia) * velocidad;
        npc.position.z += (dz / distancia) * velocidad;
    }
    
    npc.position.y = alturaFlotante;
    
    // 🔴 HABLAR CADA 20 SEGUNDOS (~1200 frames)
    estado.tiempoUltimaFrase++;
    
    if(estado.tiempoUltimaFrase > 1200 && !estado.hablando){
        hablarAlmaBuena(npc, estado);
        estado.tiempoUltimaFrase = 0;
    }
}

function actualizarNPC1(){
    
    if(!npc1) return;
    if(!Juego.jugador) return;
    
    // 🔴 VERIFICAR APARICIÓN
    if(!npc1Aparecio){
        const pz = Juego.jugador.position.z;
        if(pz > 75 && Juego.guiaVista && GameManager.llaves >= 1){
            hacerAparecerNPC1();
        }
        return;
    }
    
    // 🔴 ACTUALIZAR ALMA 1
    actualizarAlmaBuena(npc1, npc1Estado, npc1Estado.offsetX, npc1Estado.offsetZ);
    
    // 🔴 ACTUALIZAR ALMA 2
    actualizarAlmaBuena(npc2, npc2Estado, npc2Estado.offsetX, npc2Estado.offsetZ);
    
    // 🔴 VERIFICAR AULAS VISITADAS
    verificarAulaVisitada();
}

/*=========================================================
ACTUALIZAR ALMA MALA
=========================================================*/

function actualizarNpcMalo(){
    
    if(!npcMalo) return;
    if(!Juego.jugador) return;
    
    npcMaloEstado.balanceo += 0.06;
    const alturaFlotante = npcMaloEstado.altura + Math.sin(npcMaloEstado.balanceo) * 0.3;
    
    // 🔴 PRIMERA APARICIÓN (4 llaves)
    if(!npcMaloEstado.aparecio && GameManager.llaves >= npcMaloEstado.umbralLlaves){
        
        npcMaloEstado.aparecio = true;
        npcMaloEstado.activo = true;
        
        const px = Juego.jugador.position.x;
        const pz = Juego.jugador.position.z;
        
        npcMalo.position.set(
            px + (Math.random() - 0.5) * 40,
            3,
            pz + (Math.random() - 0.5) * 40
        );
        
        npcMalo.visible = true;
        npcMaloEstado.tiempoVisible = 900;
        
        mostrarSubtitulo("Alma Maligna", "¡NO CONFÍES EN NADIE!", 0xDC2626);
        
        console.log("👻 Alma mala apareció");
    }
    
    if(!npcMaloEstado.activo) return;
    
    // 🔴 PERSEGUIR AL JUGADOR
    const dx = Juego.jugador.position.x - npcMalo.position.x;
    const dz = Juego.jugador.position.z - npcMalo.position.z;
    const distancia = Math.sqrt(dx*dx + dz*dz);
    
    if(distancia > 3){
        const angulo = Math.atan2(dx, dz);
        
        npcMalo.position.x += Math.sin(angulo) * npcMaloEstado.velocidad;
        npcMalo.position.z += Math.cos(angulo) * npcMaloEstado.velocidad;
    }
    
    npcMalo.position.y = alturaFlotante;
    
    // 🔴 HABLAR DE VEZ EN CUANDO
    if(distancia < 15 && Math.random() < 0.008){
        const frase = FRASES_MALAS[Math.floor(Math.random() * FRASES_MALAS.length)];
        mostrarSubtitulo("Alma Maligna", frase, 0xDC2626);
    }
    
    // 🔴 CAPTURA
    if(distancia < 3 && npcMaloEstado.cooldown <= 0){
        iniciarCapturaNPC();
        npcMaloEstado.cooldown = 600;
    }
    
    if(npcMaloEstado.cooldown > 0) npcMaloEstado.cooldown--;
    
    // 🔴 DESAPARECER
    npcMaloEstado.tiempoVisible--;
    if(npcMaloEstado.tiempoVisible <= 0){
        npcMalo.visible = false;
        npcMaloEstado.activo = false;
    }
}

/*=========================================================
ACTUALIZAR ALMAS DECORATIVAS
=========================================================*/

function actualizarAlmasDecorativas(){
    
    if(!Juego.jugador) return;
    
    for(const alma of almasDecorativas){
        
        // 🔴 ANIMACIÓN DE FLOTACIÓN
        alma.userData.fase += 0.05;
        const alturaFlotante = 3 + Math.sin(alma.userData.fase) * 0.5;
        alma.position.y = alturaFlotante;
        
        // 🔴 DEAMBULAR ALEATORIO
        alma.userData.contador++;
        
        if(alma.userData.contador > alma.userData.tiempoCambio){
            alma.userData.direccion = Math.random() * Math.PI * 2;
            alma.userData.contador = 0;
            alma.userData.tiempoCambio = 60 + Math.random() * 120;
        }
        
        // 🔴 MOVER EN DIRECCIÓN
        const nuevaX = alma.position.x + Math.sin(alma.userData.direccion) * alma.userData.velocidad;
        const nuevaZ = alma.position.z + Math.cos(alma.userData.direccion) * alma.userData.velocidad;
        
        // 🔴 VERIFICAR QUE NO SE ALEJE DEMASIADO DE SU CENTRO
        const distCentro = Math.sqrt(
            Math.pow(nuevaX - alma.userData.centroX, 2) +
            Math.pow(nuevaZ - alma.userData.centroZ, 2)
        );
        
        if(distCentro < alma.userData.radioDeambular){
            alma.position.x = nuevaX;
            alma.position.z = nuevaZ;
        } else {
            // 🔴 VOLVER AL CENTRO
            alma.userData.direccion = Math.atan2(
                alma.userData.centroX - alma.position.x,
                alma.userData.centroZ - alma.position.z
            );
        }
        
        // 🔴 HABLAR DE VEZ EN CUANDO (texto flotante)
        alma.userData.contadorFrase++;
        
        if(alma.userData.contadorFrase > alma.userData.tiempoFrase){
            
            const frase = FRASES_DECORATIVAS[Math.floor(Math.random() * FRASES_DECORATIVAS.length)];
            mostrarTextoFlotante(alma, frase);
            
            alma.userData.contadorFrase = 0;
            alma.userData.tiempoFrase = 400 + Math.random() * 800;
        }
    }
}

/*=========================================================
MOSTRAR SUBTÍTULO (ABAJO, SIN BOTÓN)
=========================================================*/

function mostrarSubtitulo(nombre, frase, color){
    
    // 🔴 ELIMINAR SUBTÍTULO ANTERIOR
    const anterior = document.getElementById("subtituloNPC");
    if(anterior) anterior.remove();
    
    const colorHex = "#" + color.toString(16).padStart(6, '0');
    
    const subtitulo = document.createElement("div");
    subtitulo.id = "subtituloNPC";
    subtitulo.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        max-width: 600px;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        font-size: 17px;
        z-index: 9996;
        border: 2px solid ${colorHex};
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
        text-align: center;
        animation: fadeInSubtitulo 0.3s;
    `;
    
    subtitulo.innerHTML = `
        <div style="color: ${colorHex}; font-weight: bold; margin-bottom: 6px; font-size: 14px;">
            👻 ${nombre}
        </div>
        <div style="color: #fff;">${frase}</div>
    `;
    
    document.body.appendChild(subtitulo);
    
    // 🔴 DESAPARECER DESPUÉS DE 5 SEGUNDOS
    setTimeout(() => {
        if(subtitulo && subtitulo.parentNode){
            subtitulo.style.opacity = "0";
            subtitulo.style.transition = "opacity 0.5s";
            setTimeout(() => subtitulo.remove(), 500);
        }
    }, 5000);
}

/*=========================================================
MOSTRAR TEXTO FLOTANTE (AL LADO DEL ALMA)
=========================================================*/

function mostrarTextoFlotante(alma, frase){
    
    if(!Juego.camara) return;
    
    // 🔴 CALCULAR POSICIÓN EN PANTALLA
    const vector = new THREE.Vector3();
    vector.copy(alma.position);
    vector.y += 2.5;
    vector.project(Juego.camara);
    
    // 🔴 VERIFICAR SI ESTÁ EN PANTALLA
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
    
    if(vector.z > 1) return; // Detrás de la cámara
    
    const texto = document.createElement("div");
    texto.className = "textoFlotanteAlma";
    texto.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -100%);
        background: rgba(0, 0, 0, 0.75);
        color: white;
        padding: 6px 12px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        z-index: 9995;
        pointer-events: none;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.5s;
    `;
    
    texto.innerText = frase;
    document.body.appendChild(texto);
    
    // 🔴 FADE IN
    setTimeout(() => { texto.style.opacity = "1"; }, 50);
    
    // 🔴 FADE OUT Y ELIMINAR
    setTimeout(() => {
        texto.style.opacity = "0";
        setTimeout(() => texto.remove(), 500);
    }, 3000);
}

/*=========================================================
HABLAR ALMA BUENA
=========================================================*/

function hablarAlmaBuena(npc, estado){
    
    if(estado.hablando) return;
    
    let frase;
    let intentos = 0;
    
    do {
        frase = FRASES_BUENAS[Math.floor(Math.random() * FRASES_BUENAS.length)];
        intentos++;
    } while(frase === estado.ultimaFrase && intentos < 5);
    
    estado.ultimaFrase = frase;
    
    mostrarSubtitulo("Alma Perdida", frase, 0x4A90E2);
    
    estado.hablando = true;
    
    // 🔴 DURACIÓN DEL SUBTÍTULO
    setTimeout(() => {
        estado.hablando = false;
    }, 5000);
}

/*=========================================================
VERIFICAR AULAS VISITADAS
=========================================================*/

function verificarAulaVisitada(){
    
    if(!Juego.jugador) return;
    
    const px = Juego.jugador.position.x;
    const pz = Juego.jugador.position.z;
    
    for(let i = 0; i < aulasPosiciones.length; i++){
        const aula = aulasPosiciones[i];
        const dist = Math.sqrt(
            Math.pow(px - aula.x, 2) + Math.pow(pz - aula.z, 2)
        );
        
        if(dist < 8 && !aulasVisitadas.includes(i)){
            aulasVisitadas.push(i);
        }
    }
}

/*=========================================================
INICIAR CAPTURA
=========================================================*/

function iniciarCapturaNPC(){
    
    Juego.pausado = true;
    
    const pregunta = PREGUNTAS_CAPTURA[Math.floor(Math.random() * PREGUNTAS_CAPTURA.length)];
    
    const overlay = document.createElement("div");
    overlay.id = "capturaNPC";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,0.95);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:99999;color:white;font-family:Arial,sans-serif;text-align:center;padding:20px;";
    
    overlay.innerHTML = `
        <div style="max-width:600px;width:100%;">
            <h1 style="color:#DC2626;font-size:32px;margin-bottom:10px;">👻 ¡Te atrapé!</h1>
            <p style="color:#aaa;font-size:16px;margin-bottom:25px;">Responde bien o perderás puntos...</p>
            
            <div style="background:#1e293b;padding:15px;border-radius:10px;margin-bottom:20px;">
                <p style="color:#ffd700;font-size:14px;margin-bottom:8px;">⏱️ Tiempo:</p>
                <div id="temporizadorCaptura" style="color:#fff;font-size:32px;font-weight:bold;">15</div>
                <div style="width:100%;height:8px;background:#0f172a;border-radius:4px;margin-top:10px;overflow:hidden;">
                    <div id="barraTiempo" style="width:100%;height:100%;background:#22c55e;"></div>
                </div>
            </div>
            
            <div style="background:#1e293b;padding:25px;border-radius:12px;border:2px solid #ffd700;margin-bottom:20px;">
                <p style="color:#fff;font-size:20px;margin-bottom:20px;">${pregunta.p}</p>
                <div style="display:grid;gap:10px;">
                    <button onclick="responderCaptura(0,${pregunta.c})" style="padding:15px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;text-align:left;">A) ${pregunta.r[0]}</button>
                    <button onclick="responderCaptura(1,${pregunta.c})" style="padding:15px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;text-align:left;">B) ${pregunta.r[1]}</button>
                    <button onclick="responderCaptura(2,${pregunta.c})" style="padding:15px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;text-align:left;">C) ${pregunta.r[2]}</button>
                    <button onclick="responderCaptura(3,${pregunta.c})" style="padding:15px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;text-align:left;">D) ${pregunta.r[3]}</button>
                </div>
            </div>
            
            <p style="color:#ef4444;font-size:14px;">⚠️ Fallas: -2 pts | Sin tiempo: -1 llave</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    let tiempoRestante = 15;
    const temporizador = document.getElementById("temporizadorCaptura");
    const barra = document.getElementById("barraTiempo");
    
    window.temporizadorCapturaInterval = setInterval(() => {
        
        tiempoRestante--;
        
        if(temporizador) temporizador.innerText = tiempoRestante;
        if(barra) barra.style.width = (tiempoRestante / 15 * 100) + "%";
        
        if(barra){
            if(tiempoRestante > 10) barra.style.background = "#22c55e";
            else if(tiempoRestante > 5) barra.style.background = "#f59e0b";
            else barra.style.background = "#ef4444";
        }
        
        if(tiempoRestante <= 0){
            clearInterval(window.temporizadorCapturaInterval);
            tiempoAgotadoCaptura();
        }
        
    }, 1000);
}

/*=========================================================
RESPONDER CAPTURA
=========================================================*/

function responderCaptura(indice, correcta){
    
    if(window.temporizadorCapturaInterval){
        clearInterval(window.temporizadorCapturaInterval);
        window.temporizadorCapturaInterval = null;
    }
    
    const overlay = document.getElementById("capturaNPC");
    
    if(indice === correcta){
        
        if(overlay){
            overlay.innerHTML = `
                <div style="text-align:center;">
                    <h1 style="color:#22c55e;font-size:48px;margin-bottom:20px;">✅</h1>
                    <h2 style="color:#fff;font-size:28px;margin-bottom:15px;">¡Correcto!</h2>
                    <p style="color:#ffd700;font-size:18px;">El alma se aleja por ahora...</p>
                </div>
            `;
        }
        
        if(npcMalo){
            npcMalo.position.set(
                npcMalo.position.x + (Math.random() - 0.5) * 100,
                3,
                npcMalo.position.z + (Math.random() - 0.5) * 100
            );
        }
        
        setTimeout(cerrarCaptura, 2000);
        
    } else {
        
        const puntosQuitados = Math.floor(Math.random() * 2) + 2;
        GameManager.puntos = Math.max(0, GameManager.puntos - puntosQuitados);
        actualizarHUD();
        
        if(overlay){
            overlay.innerHTML = `
                <div style="text-align:center;">
                    <h1 style="color:#ef4444;font-size:48px;margin-bottom:20px;">❌</h1>
                    <h2 style="color:#fff;font-size:28px;margin-bottom:15px;">Incorrecto</h2>
                    <p style="color:#ef4444;font-size:18px;">-${puntosQuitados} puntos</p>
                </div>
            `;
        }
        
        if(npcMalo){
            npcMalo.position.set(
                npcMalo.position.x + (Math.random() - 0.5) * 100,
                3,
                npcMalo.position.z + (Math.random() - 0.5) * 100
            );
        }
        
        setTimeout(cerrarCaptura, 2500);
    }
}

/*=========================================================
TIEMPO AGOTADO
=========================================================*/

function tiempoAgotadoCaptura(){
    
    if(GameManager.llaves > 0){
        const llavesDisponibles = Juego.llaves.filter(l => l.userData.recogida);
        
        if(llavesDisponibles.length > 0){
            const llaveAleatoria = llavesDisponibles[Math.floor(Math.random() * llavesDisponibles.length)];
            llaveAleatoria.userData.recogida = false;
            llaveAleatoria.visible = true;
            GameManager.llaves--;
            actualizarHUD();
        }
    }
    
    const overlay = document.getElementById("capturaNPC");
    
    if(overlay){
        overlay.innerHTML = `
            <div style="text-align:center;">
                <h1 style="color:#ef4444;font-size:48px;margin-bottom:20px;">⏱️</h1>
                <h2 style="color:#fff;font-size:28px;margin-bottom:15px;">¡Tiempo agotado!</h2>
                <p style="color:#ef4444;font-size:18px;">Perdiste 1 llave</p>
            </div>
        `;
    }
    
    if(npcMalo){
        npcMalo.position.set(
            npcMalo.position.x + (Math.random() - 0.5) * 100,
            3,
            npcMalo.position.z + (Math.random() - 0.5) * 100
        );
    }
    
    setTimeout(cerrarCaptura, 3000);
}

/*=========================================================
CERRAR CAPTURA
=========================================================*/

function cerrarCaptura(){
    const overlay = document.getElementById("capturaNPC");
    if(overlay) overlay.remove();
    Juego.pausado = false;
    console.log("🔄 Juego reanudado");
}

/*=========================================================
CERRAR DIÁLOGO (compatibilidad)
=========================================================*/

function cerrarDialogoNPC(){
    const dialogo = document.getElementById("dialogoNPC");
    if(dialogo) dialogo.remove();
}

function ocultarDialogoNPC(){
    const dialogo = document.getElementById("dialogoNPC");
    if(dialogo) dialogo.remove();
}

/*=========================================================
INICIALIZAR NPCs
=========================================================*/

function crearNPCs(){
    crearNPC1();
    crearNPC2();
    crearNpcMalo();
    crearAlmasDecorativas();
    registrarAulasParaNPC();
}

/*=========================================================
ACTUALIZAR TODOS LOS NPCs
=========================================================*/

function actualizarNPCs(){
    actualizarNPC1();
    actualizarNpcMalo();
    actualizarAlmasDecorativas();
}

/*=========================================================
ESTILOS CSS PARA LOS TEXTOS FLOTANTES
=========================================================*/

const estilosAlmas = document.createElement("style");
estilosAlmas.innerHTML = `
    @keyframes fadeInSubtitulo {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    
    .textoFlotanteAlma {
        pointer-events: none;
        user-select: none;
    }
`;
document.head.appendChild(estilosAlmas);

console.log("👻 Sistema de almas cargado");