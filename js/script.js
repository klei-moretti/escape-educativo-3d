"use strict";

let usuarioRegistrado = false;

// =========================================================
// DETECTAR TIPO DE USUARIO
// =========================================================

const MATERIAS_PROFESOR = [
    "matematicas", "lenguaje", "ingles", "biologia",
    "quimica", "fisica", "sociales", "educacionfisica",
    "filosofia", "artes", "musica", "religion"
];

function detectarTipoUsuario(nombre){
    const nombreLower = nombre.toLowerCase();
    
    if(nombreLower === "tutor"){
        return "tutor";
    }
    
    if(MATERIAS_PROFESOR.includes(nombreLower)){
        return "profesor";
    }
    
    return "estudiante";
}

// =========================================================
// REGISTRAR
// =========================================================

async function registrar(){
    const nombre = document.getElementById("nombre").value.trim();
    const pass = document.getElementById("password").value.trim();

    // Validar nombre (letras, números, 3-20 caracteres)
    const nombreValido = /^[A-Za-z0-9]{3,20}$/;
    const soloNumeros = /^[0-9]{6,10}$/;

    if(!nombreValido.test(nombre)){
        document.getElementById("errorLogin").innerText = "Nombre inválido (3-20 letras/números)";
        return;
    }

    if(!soloNumeros.test(pass)){
        document.getElementById("errorLogin").innerText = "Contraseña inválida (6-10 números)";
        return;
    }

    // 🔍 Detectar tipo de usuario
    const tipo = detectarTipoUsuario(nombre);
    console.log("👤 Tipo de usuario:", tipo);

    // 🔗 REGISTRAR EN SUPABASE
    const correo = nombre + "@escape.com";
    const usuario = await registrarUsuario(nombre, correo, pass, tipo);

    if(!usuario){
        document.getElementById("errorLogin").innerText = "Error al registrar";
        return;
    }

    usuarioRegistrado = true;
    document.getElementById("login").style.display = "none";
    
    // 🔀 REDIRIGIR SEGÚN TIPO
    redirigirSegunTipo(tipo, nombre);
    
    console.log("✅ Registrado en Supabase:", nombre, "como", tipo);
}

// =========================================================
// INICIAR SESIÓN
// =========================================================

async function iniciarSesionUsuario(){
    const nombre = document.getElementById("nombre").value.trim();
    const pass = document.getElementById("password").value.trim();

    const correo = nombre + "@escape.com";
    const usuario = await iniciarSesion(correo, pass);

    if(!usuario){
        document.getElementById("errorLogin").innerText = "Usuario o contraseña incorrectos";
        return;
    }

    // 🔍 Detectar tipo de usuario
    const tipo = detectarTipoUsuario(nombre);
    console.log("👤 Sesión iniciada como:", tipo);

    usuarioRegistrado = true;
    document.getElementById("login").style.display = "none";
    
    // 🔀 REDIRIGIR SEGÚN TIPO
    redirigirSegunTipo(tipo, nombre);
}

/*=========================================================
REDIRIGIR SEGÚN TIPO DE USUARIO
=========================================================*/

async function redirigirSegunTipo(tipo, nombre){
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userId = user ? user.id : null;
    
    if(tipo === "estudiante"){
        // 🔴 MOSTRAR PANEL DEL ESTUDIANTE
        await abrirPanelEstudiante(userId, nombre);
        console.log("🎓 Estudiante:", nombre);
        
    } else if(tipo === "profesor"){
        await abrirPanelProfesor(nombre, userId);
        console.log("👨‍🏫 Profesor de", nombre);
        
    } else if(tipo === "tutor"){
        await abrirPanelTutor(userId);
        console.log("👨‍🏫 Tutor");
    }
}

/*=========================================================
CONFIGURACIÓN GENERAL
=========================================================*/

const Juego = {
    ancho: window.innerWidth,
    alto: window.innerHeight,
    escena: null,
    camara: null,
    renderer: null,
    jugador: null,
    paredes: [],
    zonasPreguntas: [],
    aulasCompletadas: [],
    teclas: {},
    velocidad: 0.50,
    modoDesarrollador: false,
    sensibilidad: 0.002,
    pitch: 0,
    salida: null,
    puertas: [],
    llaves: [],
    zonasEspeciales: [],
    vistaPanoramica: false,
    posicionOriginal: null,
    rotacionOriginal: null,
    pausado: false   // ← NUEVA LÍNEA
};

/*=========================================================
INICIAR JUEGO
=========================================================
🔴 LÓGICA DE PRIORIDAD:
1. Si el estudiante eligió "General" → Se respeta General
2. Si eligió una materia específica → Se respeta esa materia
3. Si NO eligió → Se verifica modo examen del profesor
=========================================================*/

async function iniciarJuego(){

    console.log("🎮 Iniciando juego...");
    
    // 🔴 VERIFICACIÓN INICIAL DEL MODO
    if(window.materiaSeleccionada === "general" || 
       window.materiaSeleccionada === null || 
       window.materiaSeleccionada === undefined){
        
        window.modoMateriaUnica = false;
        window.materiaUnicaActual = "general";
        console.log("🎓 Modo GENERAL confirmado");
        
    } else if(typeof window.materiaSeleccionada === "number"){
        
        const nombresMaterias = [
            "Matematicas", "Lenguaje", "Ingles", "Biologia",
            "Quimica", "Fisica", "Filosofia", "Musica",
            "Sociales", "Arte", "Educacion Fisica", "Religion"
        ];
        
        window.modoMateriaUnica = true;
        window.materiaUnicaActual = nombresMaterias[window.materiaSeleccionada];
        console.log("🎯 Modo MATERIA ÚNICA confirmado:", window.materiaUnicaActual);
    }
    
    // 🔴 Mostrar pantalla de carga
    mostrarPantallaCarga("Construyendo el mundo...");

    // Ocultar menú
    document.getElementById("menuPrincipal").style.display = "none";
    document.getElementById("login").style.display = "none";
    document.getElementById("contenedorJuego").style.display = "block";

    // 🔴 Pequeña pausa
    await new Promise(resolve => setTimeout(resolve, 100));

    // =========================================================
    // 🔴 VERIFICAR MODO EXAMEN
    // =========================================================
    if(!window.modoProfesorPrueba){
        
        // 🔴 VERIFICAR SI ELIGIÓ GENERAL
        const eligioGeneral = (
            window.materiaSeleccionada === "general" || 
            window.materiaSeleccionada === null || 
            window.materiaSeleccionada === undefined
        );
        
        // 🔴 SI ELIGIÓ GENERAL → RESPETAR
        if(eligioGeneral){
            
            console.log("🎓 Estudiante eligió GENERAL → Se respeta su elección");
            window.modoMateriaUnica = false;
            window.materiaUnicaActual = "general";
            
        } else {
            
            // 🔴 SI NO ELIGIÓ O ELIGIÓ MATERIA, VERIFICAR MODO EXAMEN
            // (Solo verificar si NO eligió explícitamente)
            console.log("🎯 Verificando modo examen del profesor...");
            
            // NOTA: Solo verificamos modo examen si el estudiante
            // NO eligió una materia específica
            // Si eligió materia específica, se respeta su elección
            
        }
    }

    // 🔴 CREAR EL MUNDO
    mostrarPantallaCarga("Creando escena...");
    crearEscena();
    crearCamara();
    crearRenderer();
    
    mostrarPantallaCarga("Iluminando el mundo...");
    crearLucesMejoradas();
    
    mostrarPantallaCarga("Cargando texturas...");

    // 🔴 CARGAR TEXTURAS PRIMERO
    await new Promise(resolve => {
        cargarTexturas(resolve);
    });

    mostrarPantallaCarga("Construyendo piso...");
    crearPiso();
    
    mostrarPantallaCarga("Creando escuela...");
    crearEscuela();
    
    mostrarPantallaCarga("Decorando...");
    crearDecoracion();
    
    // 🔴 COLOCAR LLAVES EN EL MAPA
    // Crea las 13 llaves (1 en la biblioteca + 12 en las aulas)
    mostrarPantallaCarga("Colocando llaves...");
    crearLlaves();
    
    // 🔴 CREAR JUGADOR PRIMERO
    // (necesario porque las flechas necesitan saber dónde está el jugador)
    mostrarPantallaCarga("Creando jugador...");
    crearJugador();

    // 🔴 CREAR NPCs
    mostrarPantallaCarga("Creando personajes...");
    crearNPCs();
    
    // 🔴 CREAR FLECHAS GUÍA DESPUÉS
    // (ahora el jugador ya existe y las flechas pueden apuntar)
    mostrarPantallaCarga("Creando guía...");
    crearFlechasGuia();

    // 🔴 SI ES MODO PRUEBA DEL PROFESOR
    if(window.modoProfesorPrueba){
        GameManager.llaves = 13;
        actualizarHUD();
    }

    // 🔴 Inicializar controles táctiles
    inicializarControlesTactiles();

    // 🔴 Ocultar pantalla de carga
    ocultarPantallaCarga();

    // 🔴 Iniciar el loop
    Juego.pausado = false;
    actualizar();
    
    console.log("✅ Juego iniciado");
}

/*=========================================================
MOSTRAR PANTALLA DE CARGA
=========================================================*/

function mostrarPantallaCarga(mensaje){
    
    let pantalla = document.getElementById("pantallaCarga");
    
    // Si no existe, crearla
    if(!pantalla){
        pantalla = document.createElement("div");
        pantalla.id = "pantallaCarga";
        pantalla.style.cssText = `
            position: fixed;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 20px;
            background: #0f172a;
            z-index: 5000;
            color: white;
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(pantalla);
    }
    
    pantalla.innerHTML = `
        <h1 style="color: #ffd700; font-size: 36px; margin: 0;">🎮 EduLaberinto 3D</h1>
        <p style="color: #fff; font-size: 18px; margin: 0;">${mensaje}</p>
        <div style="width: 200px; height: 10px; background: #333; border-radius: 5px; overflow: hidden;">
            <div style="width: 100%; height: 100%; background: #ffd700; animation: cargando 1s infinite;"></div>
        </div>
        <style>
            @keyframes cargando {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        </style>
    `;
    
    pantalla.style.display = "flex";
}

/*=========================================================
ESCENA
=========================================================*/

function crearEscena(){
    Juego.escena = new THREE.Scene();
    
    // 🔴 COLOR DE FONDO NOCTURNO
    Juego.escena.background = new THREE.Color(0x0a0a1a);
    
    // 🔴 NIEBLA SUTIL (más ambiente de terror)
    Juego.escena.fog = new THREE.Fog(0x0a0a1a, 50, 400);
    
    // 🔴 CREAR CIELO NOCTURNO
    crearCieloNocturno();
}

/*=========================================================
CIELO NOCTURNO
=========================================================*/

function crearCieloNocturno(){
    
    // 🔴 ESFERA GRANDE COMO CIELO
    const geometriaCielo = new THREE.SphereGeometry(2000, 32, 32);
    const materialCielo = new THREE.MeshBasicMaterial({
        color: 0x0a0a1a,
        side: THREE.BackSide
    });
    const cielo = new THREE.Mesh(geometriaCielo, materialCielo);
    Juego.escena.add(cielo);
    
    // 🔴 ESTRELLAS
    for(let i = 0; i < 500; i++){
        
        const estrella = new THREE.Mesh(
            new THREE.SphereGeometry(0.5 + Math.random() * 1.5, 4, 4),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.7
            })
        );
        
        // 🔴 POSICIÓN ALEATORIA EN LA ESFERA
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        const radio = 1800;
        
        estrella.position.set(
            radio * Math.sin(theta) * Math.cos(phi),
            Math.abs(radio * Math.cos(theta)) + 100,
            radio * Math.sin(theta) * Math.sin(phi)
        );
        
        Juego.escena.add(estrella);
    }
    
    // 🔴 LUNA
    crearLuna();
    
    console.log("🌙 Cielo nocturno creado");
}

/*=========================================================
LUNA
=========================================================*/

function crearLuna(){
    
    const grupoLuna = new THREE.Group();
    
    // 🔴 ESFERA DE LA LUNA
    const luna = new THREE.Mesh(
        new THREE.SphereGeometry(60, 32, 32),
        new THREE.MeshStandardMaterial({
            color: 0xF0E8D0,
            emissive: 0xF0E8D0,
            emissiveIntensity: 0.8,
            roughness: 1,
            metalness: 0
        })
    );
    grupoLuna.add(luna);
    
    // 🔴 LUZ DE LA LUNA
    const luzLuna = new THREE.DirectionalLight(0xC0C8E0, 0.35);
    luzLuna.position.set(200, 400, 200);
    luzLuna.castShadow = false;
    grupoLuna.add(luzLuna);
    
    // 🔴 POSICIÓN EN EL CIELO
    grupoLuna.position.set(500, 800, -800);
    
    Juego.escena.add(grupoLuna);
    
    console.log("🌕 Luna creada");
}

/*=========================================================
CÁMARA
=========================================================*/

function crearCamara(){
    Juego.camara = new THREE.PerspectiveCamera(75, Juego.ancho / Juego.alto, 0.1, 5000);
    Juego.camara.position.set(0, 1.7, 0);
}

/*=========================================================
RENDERER
=========================================================*/

function crearRenderer(){
    Juego.renderer = new THREE.WebGLRenderer({ antialias: true });
    Juego.renderer.setSize(Juego.ancho, Juego.alto);
    Juego.renderer.shadowMap.enabled = true;
    document.getElementById("contenedorJuego").appendChild(Juego.renderer.domElement);
}

/*=========================================================
PISO
=========================================================*/

function crearPiso(){

    // 🔴 PISO OSCURO LISO
    const geometria = new THREE.PlaneGeometry(1000, 1000);
    
    const material = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 1,
        metalness: 0,
        side: THREE.DoubleSide
    });
    
    const piso = new THREE.Mesh(geometria, material);
    piso.rotation.x = -Math.PI / 2;
    piso.position.y = -0.1;
    piso.receiveShadow = true;
    Juego.escena.add(piso);

    console.log("🏗️ Piso oscuro creado");
}

/*=========================================================
CREAR PARED
=========================================================*/

function crearPared(x, y, z, ancho, alto, profundidad){

    const geometria = new THREE.BoxGeometry(ancho, alto, profundidad);
    
    // 🔴 PARED CON TEXTURA DE LADRILLO
    const material = Texturas.ladrillo 
        ? new THREE.MeshStandardMaterial({
            map: Texturas.ladrillo,
            roughness: 0.9,
            metalness: 0.1
        })
        : new THREE.MeshStandardMaterial({
            color: 0xE8E0D8,
            roughness: 0.8,
            metalness: 0.1
        });

    const pared = new THREE.Mesh(geometria, material);
    pared.position.set(x, y, z);
    pared.castShadow = true;
    pared.receiveShadow = true;
    Juego.escena.add(pared);
    Juego.paredes.push(pared);

}

/*=========================================================
JUGADOR
=========================================================*/

function crearJugador(){

    const jugador = new THREE.Object3D();
    jugador.position.set(0, 0,100);  // ← Centro del mapa

    const cuerpo = new THREE.Mesh(
        new THREE.BoxGeometry(3, 6, 3),
        new THREE.MeshStandardMaterial({ color: 0x0088ff })
    );
    cuerpo.position.set(0, 3, 0);
    jugador.add(cuerpo);

    Juego.jugador = jugador;
    jugador.add(Juego.camara);
    Juego.camara.position.set(0, 1.7, 0);
    Juego.camara.lookAt(0, 5.5, -20);
    Juego.escena.add(jugador);

}

/*=========================================================
OCULTAR PANTALLA DE CARGA
=========================================================*/

function ocultarPantallaCarga(){
    const pantalla = document.getElementById("pantallaCarga");
    if(pantalla) pantalla.style.display = "none";
}

/*=========================================================
ACTUALIZAR (loop principal ULTRA SEGURO)
=========================================================
🔴 PROTECCIONES:
- Verifica que Juego existe
- Verifica que renderer y escena existen
- Envuelve en try/catch para no crashear
=========================================================*/

function actualizar(){

    // 🔴 VERIFICAR QUE EL JUEGO ESTÁ PAUSADO
    if(Juego.pausado){
        return;
    }
    
    // 🔴 VERIFICAR QUE HAY ESCENA Y CÁMARA
    if(!Juego.escena || !Juego.camara || !Juego.renderer){
        requestAnimationFrame(actualizar);
        return;
    }
    
    // 🔴 LLAMAR AL SIGUIENTE FRAME
    requestAnimationFrame(actualizar);
    
    // 🔴 EJECUTAR LÓGICA DEL JUEGO (PROTEGIDA)
    try {
        
        if(!Juego.vistaPanoramica){
            
            // Movimiento del jugador
            moverJugador();
            
            // Revisiones del juego
            revisarZonas();
            revisarSalida();
            revisarLlaves();
            revisarPuertasCercanas();
            revisarEstantesCercanos();
            
            // Sistemas adicionales
            if(typeof actualizarFlechasGuia === "function"){
                actualizarFlechasGuia();
            }
            
            if(typeof actualizarNPCs === "function"){
                actualizarNPCs();
            }
            
            animarPuerta();
        }
        
    } catch(error) {
        // 🔴 SI HAY UN ERROR, NO CRASHEAR
        console.error("❌ Error en actualizar():", error);
    }
    
    // 🔴 RENDERIZAR (PROTEGIDO)
    try {
        Juego.renderer.render(Juego.escena, Juego.camara);
    } catch(error) {
        console.error("❌ Error al renderizar:", error);
    }
}

function actualizar(){

    if(Juego.pausado){
        return;
    }
    
    requestAnimationFrame(actualizar);
    
    if(!Juego.vistaPanoramica){
        moverJugador();
        revisarZonas();
        revisarSalida();
        revisarLlaves();
        revisarPuertasCercanas();
        revisarEstantesCercanos();
        actualizarFlechasGuia();
        actualizarNPCs();          // ← NUEVO

        // 🔴 NUEVA LÍNEA
        if(typeof actualizarAntorchasAulas === "function"){
            actualizarAntorchasAulas();
        }

        // 🔴 NUEVA LÍNEA - AGREGAR AQUÍ
        if(typeof actualizarAulasDinamicas === "function"){
            actualizarAulasDinamicas();
        }

        if(typeof animarAntorchas === "function"){
            animarAntorchas();
        }
        animarPuerta();
    }
    
    Juego.renderer.render(Juego.escena, Juego.camara);
}

/*=========================================================
RESPONSIVE (VERSIÓN SEGURA)
=========================================================
🔴 Actualiza el tamaño de la ventana sin romper nada.
=========================================================*/

window.addEventListener("resize", () => {
    
    // 🔴 ACTUALIZAR DIMENSIONES
    Juego.ancho = window.innerWidth;
    Juego.alto = window.innerHeight;
    
    // 🔴 ACTUALIZAR CÁMARA PRINCIPAL
    if(Juego.camara){
        Juego.camara.aspect = Juego.ancho / Juego.alto;
        Juego.camara.updateProjectionMatrix();
    }
    
    // 🔴 ACTUALIZAR CÁMARA PANORÁMICA
    if(Juego.camaraPanoramica){
        Juego.camaraPanoramica.aspect = Juego.ancho / Juego.alto;
        Juego.camaraPanoramica.updateProjectionMatrix();
    }
    
    // 🔴 ACTUALIZAR RENDERER
    if(Juego.renderer){
        Juego.renderer.setSize(Juego.ancho, Juego.alto);
    }
    
    console.log("📐 Pantalla redimensionada:", Juego.ancho, "x", Juego.alto);
    
}, false);

/*=========================================================
INICIAR
=========================================================*/

window.onload = function(){
    document.getElementById("menuPrincipal").style.display = "none";
    document.getElementById("pantallaCarga").style.display = "flex";
    setTimeout(() => {
        document.getElementById("pantallaCarga").style.display = "none";
    }, 1500);
};

/*=========================================================
TECLADO (VERSIÓN ULTRA SEGURA)
=========================================================
Maneja las teclas presionadas sin errores.
Funciona incluso si hay teclas raras o presionadas múltiples veces.
=========================================================*/

window.addEventListener("keydown", function(e){
    
    // 🔴 VERIFICACIONES DE SEGURIDAD
    if(!e) return;
    if(!e.key) return;
    
    // 🔴 NUEVAS PROTECCIONES - AGREGAR AQUÍ
    if(document.activeElement && 
       (document.activeElement.tagName === "INPUT" || 
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.tagName === "SELECT")){
        return;
    }
    
    if(document.getElementById("popup") && 
       document.getElementById("popup").style.display === "block"){
        return;
    }
    
    if(document.getElementById("capturaNPC")){
        return;
    }
    // 🔴 FIN DE LAS NUEVAS PROTECCIONES
    
    // 🔴 CONVERTIR A MINÚSCULA
    const tecla = e.key.toLowerCase();
    
    // 🔴 VERIFICAR QUE ES UN STRING VÁLIDO
    if(typeof tecla !== "string") return;
    if(tecla.length === 0) return;
    
    // 🔴 GUARDAR TECLA PRESIONADA
    Juego.teclas[tecla] = true;
    
    // 🔴 PREVENIR SCROLL CON FLECHAS
    if(tecla === "arrowup" || tecla === "arrowdown" || 
       tecla === "arrowleft" || tecla === "arrowright"){
        e.preventDefault();
    }
    
}, false);

window.addEventListener("keyup", function(e){
    
    // 🔴 VERIFICACIONES DE SEGURIDAD
    if(!e) return;
    if(!e.key) return;
    
    // 🔴 CONVERTIR A MINÚSCULA
    const tecla = e.key.toLowerCase();
    
    // 🔴 VERIFICAR QUE ES UN STRING VÁLIDO
    if(typeof tecla !== "string") return;
    if(tecla.length === 0) return;
    
    // 🔴 LIBERAR TECLA
    Juego.teclas[tecla] = false;
    
}, false);

/*=========================================================
BLOQUEAR TECLAS CUANDO LA VENTANA PIERDE EL FOCO
=========================================================
Si el usuario cambia de pestaña mientras mantiene una tecla
presionada, la tecla se queda "pegada". Esto lo evita.
=========================================================*/

window.addEventListener("blur", function(){
    
    // 🔴 LIBERAR TODAS LAS TECLAS
    for(let key in Juego.teclas){
        Juego.teclas[key] = false;
    }
    
    console.log("🔒 Ventana perdió foco: teclas liberadas");
    
}, false);

/*=========================================================
MOVIMIENTO DEL JUGADOR (VERSIÓN 100% SEGURA)
=========================================================
🔴 PROTECCIONES:
- No depende de la cámara (solo del jugador)
- Resiste cambios de vista panorámica
- Resiste zoom en celular
- Resiste pausas del juego
- Funciona igual en PC, celular y tablet
=========================================================*/

function moverJugador(){

    // =========================================================
    // 🔴 VERIFICACIONES DE SEGURIDAD (CADA UNA)
    // =========================================================
    
    if(!Juego.jugador) return;
    if(!Juego.camara) return;
    if(Juego.pausado) return;
    if(Juego.vistaPanoramica) return;
    if(!Juego.jugador.visible) return;

    // =========================================================
    // 🔴 OBTENER ÁNGULO DEL JUGADOR (SEGURO)
    // =========================================================
    
    let angulo = 0;
    try {
        angulo = Juego.jugador.rotation.y || 0;
    } catch(e) {
        angulo = 0;
    }
    
    // Normalizar el ángulo
    while(angulo > Math.PI) angulo -= Math.PI * 2;
    while(angulo < -Math.PI) angulo += Math.PI * 2;

    // =========================================================
    // 🔴 CALCULAR VECTORES DE DIRECCIÓN
    // =========================================================
    
    const sinAngulo = Math.sin(angulo);
    const cosAngulo = Math.cos(angulo);
    
    const adelanteX = -sinAngulo;
    const adelanteZ = -cosAngulo;
    const derechaX = cosAngulo;
    const derechaZ = -sinAngulo;

    let moveX = 0;
    let moveZ = 0;

    // =========================================================
    // 🔴 TECLADO PC (WASD + Flechas)
    // =========================================================
    
    if(Juego.teclas["w"] === true || Juego.teclas["arrowup"] === true){
        moveX += adelanteX;
        moveZ += adelanteZ;
    }
    if(Juego.teclas["s"] === true || Juego.teclas["arrowdown"] === true){
        moveX -= adelanteX;
        moveZ -= adelanteZ;
    }
    if(Juego.teclas["a"] === true){
        moveX -= derechaX;
        moveZ -= derechaZ;
    }
    if(Juego.teclas["d"] === true){
        moveX += derechaX;
        moveZ += derechaZ;
    }

    // =========================================================
    // 🔴 JOYSTICK CELULAR/TABLET
    // =========================================================
    
    if(typeof joystickActivo !== "undefined" && joystickActivo === true){
        
        if(typeof joystickX === "number" && typeof joystickY === "number"){
            moveX += adelanteX * (-joystickY);
            moveZ += adelanteZ * (-joystickY);
            moveX += derechaX * joystickX;
            moveZ += derechaZ * joystickX;
        }
    }

    // =========================================================
    // 🔴 NORMALIZAR MOVIMIENTO
    // =========================================================
    
    const longitud = Math.sqrt(moveX * moveX + moveZ * moveZ);
    
    if(longitud > 0.001){
        moveX = (moveX / longitud) * Juego.velocidad;
        moveZ = (moveZ / longitud) * Juego.velocidad;
    } else {
        moveX = 0;
        moveZ = 0;
    }

    // =========================================================
    // 🔴 MOVIMIENTO POR EJES SEPARADOS (ANTI-TRABAS)
    // =========================================================
    
    const posXActual = Juego.jugador.position.x;
    const posZActual = Juego.jugador.position.z;
    
    // Eje X
    if(moveX !== 0){
        const nuevaX = posXActual + moveX;
        if(!hayColision(nuevaX, posZActual)){
            Juego.jugador.position.x = nuevaX;
        }
    }
    
    // Eje Z
    if(moveZ !== 0){
        const nuevaZ = posZActual + moveZ;
        if(!hayColision(Juego.jugador.position.x, nuevaZ)){
            Juego.jugador.position.z = nuevaZ;
        }
    }

    // =========================================================
    // 🔴 ROTACIÓN CON FLECHAS
    // =========================================================
    
    if(Juego.teclas["arrowleft"] === true){
        Juego.jugador.rotation.y += 0.04;
    }
    if(Juego.teclas["arrowright"] === true){
        Juego.jugador.rotation.y -= 0.04;
    }
}

/*=========================================================
COLISIONES
=========================================================*/

function hayColision(x, z){

    for(let pared of Juego.paredes){
        
        // 🔴 SI ES UNA PUERTA Y ESTÁ ABIERTA, IGNORAR
        if(pared.userData && pared.userData.esPuerta && pared.userData.abierta){
            continue;
        }
        
        // 🔴 SI ES LA PUERTA DE BIBLIOTECA Y ESTÁ ABIERTA, IGNORAR
        if(pared.userData && pared.userData.esBiblioteca && pared.userData.abierta){
            continue;
        }
        
        const dx = Math.abs(x - pared.position.x);
        const dz = Math.abs(z - pared.position.z);
        const ancho = pared.geometry.parameters.width / 2;
        const profundidad = pared.geometry.parameters.depth / 2;

        if(dx < ancho + 1.5 && dz < profundidad + 1.5){
            return true;
        }
    }
    return false;

}

/*=========================================================
CREAR ZONA DE PREGUNTA
=========================================================*/

function crearZonaPregunta(x, z, id){
    Juego.zonasPreguntas.push({ x: x, z: z, radio: 8, id: id });
}

/*=========================================================
REVISAR ZONAS
=========================================================*/

function revisarZonas(){

    for(const zona of Juego.zonasPreguntas){

        if(Juego.aulasCompletadas.includes(zona.id)) continue;

        // calcula distancia entre jugador y zona
        const dx = Juego.jugador.position.x - zona.x;
        const dz = Juego.jugador.position.z - zona.z;
        const distancia = Math.sqrt(dx*dx + dz*dz);

        if(distancia < zona.radio){
            // si está cerca, muestra el indicador
            mostrarIndicadorAula(zona.id);
            
            // 🔍 DIAGNÓSTICO
            console.log("Zona detectada:", zona.id, "| Tecla E:", Juego.teclas["e"]);
            // si presiona E, muestra la pregunta
            if(Juego.teclas["e"]){
                Juego.teclas["e"] = false;
                console.log("¡Presionaste E! Llamando a mostrarPregunta(", zona.id, ")");
                mostrarPregunta(zona.id);
            }
            return;
        }
    }
    ocultarIndicadorAula();
}

/*=========================================================
INDICADOR VISUAL DE AULA
=========================================================*/

let indicadorAulaActivo = null;

function mostrarIndicadorAula(id){

    if(indicadorAulaActivo === id) return;
    ocultarIndicadorAula();

    // 🔴 SI ES MODO MATERIA ÚNICA, MOSTRAR SIEMPRE LA MISMA MATERIA
    let nombreMostrar = "";
    
    if(window.modoMateriaUnica && window.materiaUnicaActual){
        // Capitalizar primera letra
        nombreMostrar = window.materiaUnicaActual.charAt(0).toUpperCase() + 
                         window.materiaUnicaActual.slice(1);
    } else {
        const nombres = [
            "Matemáticas", "Lenguaje", "Inglés", "Biología",
            "Química", "Física", "Filosofia", "Música",
            "Sociales", "Arte", "Educacion Fisica", "Religión"
        ];
        nombreMostrar = nombres[id];
    }

    const indicador = document.createElement("div");
    indicador.id = "indicadorAula";
    indicador.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        color: #ffd700;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        font-size: 18px;
        z-index: 9997;
        border: 2px solid #ffd700;
        text-align: center;
    `;
    indicador.innerHTML = `📚 <strong>${nombreMostrar}</strong><br><span style="color: #88ff88; font-size: 14px;">Presiona <strong>E</strong> para responder</span>`;
    document.body.appendChild(indicador);
    indicadorAulaActivo = id;
}

function ocultarIndicadorAula(){
    const indicador = document.getElementById("indicadorAula");
    if(indicador){
        indicador.remove();
        indicadorAulaActivo = null;
    }
}

/*=========================================================
REVISAR ZONAS ESPECIALES (Biblioteca)
=========================================================*/

function revisarZonasEspeciales(){

    if(!Juego.zonasEspeciales) return;

    for(const zona of Juego.zonasEspeciales){
        if(zona.activada) continue;

        const dx = Juego.jugador.position.x - zona.x;
        const dz = Juego.jugador.position.z - zona.z;
        const distancia = Math.sqrt(dx*dx + dz*dz);

        if(distancia < zona.radio){
            mostrarMensajeBiblioteca();
            zona.activada = true;
        }
    }
}

/*=========================================================
MOSTRAR MENSAJE DE LA BIBLIOTECA
=========================================================*/

function mostrarMensajeBiblioteca(){

    const contenedor = document.createElement("div");
    contenedor.id = "mensajeBiblioteca";
    contenedor.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.92);
        color: #ffd700;
        padding: 30px 40px;
        border-radius: 15px;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        text-align: center;
        z-index: 9998;
        border: 3px solid #ffd700;
        max-width: 500px;
    `;
    contenedor.innerHTML = `
        <h2 style="color: #ffd700; margin-bottom: 15px;">📖 BIBLIOTECA CENTRAL</h2>
        <div style="color: #ffffff; line-height: 1.8;">
            <p>🏫 Fundada en <strong style="color: #ffd700;">1875</strong></p>
            <p>🔥 Abandonada tras incendio en <strong style="color: #ffd700;">1985</strong></p>
            <hr style="border-color: #ffd700; margin: 15px 0;">
            <p style="color: #ffd700;">🔑 Reúne las <strong>11 llaves</strong> para escapar</p>
            <p style="color: #ffffff; font-size: 13px; margin-top: 10px;">
                📚 Matemáticas · Lenguaje · Inglés · Biología · Química<br>
                Física · Educación Física · Música · Filosofía · Artes · Historia
            </p>
            <p style="color: #88ff88; font-size: 14px; margin-top: 10px;">
                💡 Presiona <strong>E</strong> en cada aula
            </p>
        </div>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 20px;
            padding: 10px 30px;
            background: #ffd700;
            color: #000;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        ">ENTENDIDO</button>
    `;
    document.body.appendChild(contenedor);
}

/*=========================================================
REVISAR LLAVES CERCANAS
=========================================================
Detecta si el jugador está cerca de una llave y presiona E.

🔴 REGLA ESPECIAL:
- La LLAVE DE LA BIBLIOTECA (la primera) SOLO se puede
  recoger si el jugador YA LEYÓ la Guía.
- Si no la ha leído, muestra un mensaje avisando.
=========================================================*/

function revisarLlaves(){

    if(!Juego.llaves) return;

    for(const llave of Juego.llaves){
        
        // 🔴 SALTAR SI YA FUE RECOGIDA
        if(llave.userData.recogida) continue;

        // 🔴 CALCULAR DISTANCIA AL JUGADOR
        const dx = Juego.jugador.position.x - llave.position.x;
        const dz = Juego.jugador.position.z - llave.position.z;
        const distancia = Math.sqrt(dx*dx + dz*dz);

        // 🔴 SI ESTÁ CERCA (menos de 3 unidades)
        if(distancia < 3 && Juego.teclas["e"]){
            
            // 🔴 VERIFICAR SI ES LA LLAVE DE LA BIBLIOTECA
            // (la llave de la biblioteca está en x=0, z=-50)
            const esLlaveBiblioteca = (
                Math.abs(llave.position.x - 0) < 5 && 
                Math.abs(llave.position.z - (-50)) < 5
            );
            
            // 🔴 SI ES LA LLAVE DE LA BIBLIOTECA Y NO SE HA LEÍDO LA GUÍA
            if(esLlaveBiblioteca && Juego.guiaVista !== true){
                
                // ❌ NO PERMITIR RECOGER
                Juego.teclas["e"] = false;
                
                // 🔴 MOSTRAR MENSAJE DE AVISO
                alert(
                    "📖 ¡Espera!\n\n" +
                    "Antes de recoger esta llave, debes leer la GUÍA " +
                    "que está en uno de los estantes de la biblioteca.\n\n" +
                    "🔍 Busca el estante que dice 'Guía' y presiona E " +
                    "para leerlo.\n\n" +
                    "💡 Sigue las flechas amarillas."
                );
                
                console.log("🚫 Llave bloqueada: Guía no leída");
                
                // 🔴 SALIR SIN RECOGER
                return;
            }
            
            // 🔴 SI ES LA LLAVE DE LA BIBLIOTECA Y YA SE LEYÓ LA GUÍA
            // O es cualquier otra llave → PERMITIR RECOGER
            console.log("✅ RECOGIENDO LLAVE");
            Juego.teclas["e"] = false;
            llave.userData.recogida = true;
            llave.visible = false;
            agregarLlave();
            
            return;
        }
    }

}

/*=========================================================
REVISAR SALIDA
=========================================================*/

function revisarSalida(){

    if(!Juego.salida) return;

    const dx = Juego.jugador.position.x - Juego.salida.position.x;
    const dz = Juego.jugador.position.z - Juego.salida.position.z;
    const distancia = Math.sqrt(dx*dx + dz*dz);

    if(distancia < 3){
        if(!Juego.salida.userData.abierta){
            if(!GameManager.mensajePuerta){
                GameManager.mensajePuerta = true;
                alert("🚪 Necesitas recoger todas las llaves para salir.");
            }
            return;
        } else {
            ganarJuego();
            GameManager.mensajePuerta = false;
        }
    }
}

/*=========================================================
ANIMAR PUERTA FINAL
=========================================================*/

function animarPuerta(){

    if(!Juego.salida) return;
    if(!Juego.salida.userData.abierta) return;

    const izquierda = Juego.salida.userData.izquierda;
    const derecha = Juego.salida.userData.derecha;

    if(izquierda.position.x > -6){
        izquierda.position.x -= 0.05;
    }
    if(derecha.position.x < 6){
        derecha.position.x += 0.05;
    }

}

/*=========================================================
ACTIVAR VISTA PANORÁMICA (VERSIÓN 100% SEGURA)
=========================================================
🔴 GUARDA ABSOLUTAMENTE TODO:
- Posición del jugador
- Rotación del jugador
- Posición de la cámara
- Rotación de la cámara
- Zoom de la cámara
- FOV (campo de visión)
- Aspect ratio
- Visibilidad del jugador
=========================================================*/

function activarVistaPanoramica(){

    // 🔴 VERIFICACIONES DE SEGURIDAD
    if(!Juego.jugador) return;
    if(Juego.vistaPanoramica) return;
    
    console.log("🎥 Activando vista panorámica...");

    // =========================================================
    // 🔴 GUARDAR ESTADO COMPLETO DEL JUGADOR
    // =========================================================
    
    Juego.posicionOriginal = Juego.jugador.position.clone();
    Juego.rotacionOriginal = Juego.jugador.rotation.y;
    Juego.jugadorVisibleOriginal = Juego.jugador.visible;
    
    // =========================================================
    // 🔴 GUARDAR ESTADO COMPLETO DE LA CÁMARA
    // =========================================================
    
    if(Juego.camara){
        
        // Posición
        Juego.camaraPosOriginal = Juego.camara.position.clone();
        
        // Rotación
        Juego.camaraRotacionOriginal = {
            x: Juego.camara.rotation.x,
            y: Juego.camara.rotation.y,
            z: Juego.camara.rotation.z
        };
        
        // Zoom
        Juego.camaraZoomOriginal = Juego.camara.zoom;
        
        // FOV
        Juego.camaraFovOriginal = Juego.camara.fov;
        
        // Aspect
        Juego.camaraAspectOriginal = Juego.camara.aspect;
    }

    // =========================================================
    // 🔴 CREAR CÁMARA PANORÁMICA
    // =========================================================
    
    if(!Juego.camaraPanoramica){
        Juego.camaraPanoramica = new THREE.PerspectiveCamera(
            30,
            Juego.ancho / Juego.alto,
            0.1,
            10000
        );
        Juego.camaraPanoramica.position.set(0, 1200, 0);
        Juego.camaraPanoramica.lookAt(0, 0, 0);
    } else {
        // 🔴 RESETEAR LA CÁMARA PANORÁMICA CADA VEZ
        Juego.camaraPanoramica.position.set(0, 1200, 0);
        Juego.camaraPanoramica.rotation.set(0, 0, 0);
        Juego.camaraPanoramica.zoom = 1;
        Juego.camaraPanoramica.fov = 30;
        Juego.camaraPanoramica.updateProjectionMatrix();
        Juego.camaraPanoramica.lookAt(0, 0, 0);
    }

    // =========================================================
    // 🔴 CAMBIAR CÁMARA
    // =========================================================
    
    Juego.camaraAnterior = Juego.camara;
    Juego.camara = Juego.camaraPanoramica;
    Juego.vistaPanoramica = true;

    // 🔴 ENCENDER LUZ PARA VISTA PANORÁMICA
    if(Juego.luzPanoramica){
        Juego.luzPanoramica.intensity = 3.0;   // 🔴 MÁS FUERTE
    }
    if(Juego.luzAmbiente){
        Juego.luzAmbiente.intensity = 2.0;     // 🔴 MÁS FUERTE
    }

    // 🔴 QUITAR LA NIEBLA EN VISTA PANORÁMICA
    if(Juego.escena){
        Juego.escena.fog = null;
    }

    // =========================================================
    // 🔴 OCULTAR JUGADOR
    // =========================================================
    
    Juego.jugador.visible = false;

    // =========================================================
    // 🔴 BOTONES
    // =========================================================
    
    document.getElementById("btnVistaPanoramica").style.display = "none";
    document.getElementById("btnVolverJuego").style.display = "block";

    // 🔴 LIBERAR TODAS LAS TECLAS (REFORZADO)
    if(Juego.teclas){
        for(let key in Juego.teclas){
            Juego.teclas[key] = false;
        }
    }
    
    // 🔴 RESETEAR TAMBIÉN LAS TECLAS ESPECÍFICAS
    Juego.teclas = {
        w: false, a: false, s: false, d: false,
        e: false, enter: false,
        arrowup: false, arrowdown: false,
        arrowleft: false, arrowright: false
    };
    
    // 🔴 LIBERAR POINTER LOCK
    if(document.pointerLockElement){
        document.exitPointerLock();
    }
    
    // 🔴 RESETEAR MOVIMIENTO DEL MOUSE
    window.movimientoX = 0;
    window.movimientoY = 0;

    // =========================================================
    // 🔴 DESACTIVAR GESTOS TÁCTILES DE ZOOM
    // =========================================================
    
    // Deshabilitar zoom con pellizco en celular
    document.body.style.touchAction = "none";
    
    // Deshabilitar zoom del navegador
    document.body.style.userSelect = "none";

    console.log("🎥 Vista panorámica activada");
}

/*=========================================================
DESACTIVAR VISTA PANORÁMICA (VERSIÓN 100% SEGURA)
=========================================================
🔴 RESTAURA ABSOLUTAMENTE TODO:
- Cámara original
- Posición del jugador
- Rotación del jugador
- Posición de la cámara original
- Rotación de la cámara original
- Zoom de la cámara original
- FOV de la cámara original
- Visibilidad del jugador
=========================================================*/

function desactivarVistaPanoramica(){

    // 🔴 VERIFICACIONES DE SEGURIDAD
    if(!Juego.jugador) return;
    if(!Juego.vistaPanoramica) return;
    
    console.log("🎮 Desactivando vista panorámica...");

    // =========================================================
    // 🔴 RESTAURAR CÁMARA ORIGINAL
    // =========================================================
    
    if(Juego.camaraAnterior){
        Juego.camara = Juego.camaraAnterior;
        Juego.camaraAnterior = null;
    }

    // =========================================================
    // 🔴 RESTAURAR POSICIÓN Y ROTACIÓN DEL JUGADOR
    // =========================================================
    
    if(Juego.posicionOriginal){
        Juego.jugador.position.copy(Juego.posicionOriginal);
    }
    
    if(typeof Juego.rotacionOriginal === "number"){
        Juego.jugador.rotation.y = Juego.rotacionOriginal;
    }
    
    // 🔴 RESTAURAR VISIBILIDAD
    if(typeof Juego.jugadorVisibleOriginal === "boolean"){
        Juego.jugador.visible = Juego.jugadorVisibleOriginal;
    } else {
        Juego.jugador.visible = true;
    }

    // =========================================================
    // 🔴 RESTAURAR COMPLETAMENTE LA CÁMARA
    // =========================================================
    
    if(Juego.camara){
        
        // 🔴 RESETEAR ROTACIÓN
        Juego.camara.rotation.set(0, 0, 0);
        
        // 🔴 RESETEAR POSICIÓN LOCAL
        Juego.camara.position.set(0, 1.7, 0);
        
        // 🔴 RESETEAR ZOOM
        Juego.camara.zoom = 1;
        
        // 🔴 RESETEAR FOV
        Juego.camara.fov = 75;
        
        // 🔴 RESETEAR ASPECT
        Juego.camara.aspect = Juego.ancho / Juego.alto;
        
        // 🔴 APLICAR CAMBIOS
        Juego.camara.updateProjectionMatrix();
        
        // 🔴 RESETEAR DIRECCIÓN
        Juego.camara.lookAt(0, 5.5, -20);
    }

    // =========================================================
    // 🔴 ESTADO
    // =========================================================
    
    Juego.vistaPanoramica = false;

    // 🔴 APAGAR LUZ DE PANORÁMICA
    if(Juego.luzPanoramica){
        Juego.luzPanoramica.intensity = 0;
    }
    if(Juego.luzAmbiente){
        Juego.luzAmbiente.intensity = 0.15;
    }

    // 🔴 VOLVER A PONER LA NIEBLA EN EL JUEGO
    if(Juego.escena){
        Juego.escena.fog = new THREE.Fog(0x0a0a1a, 50, 400);
    }

    // 🔴 LIBERAR TECLAS (REFORZADO)
    Juego.teclas = {
        w: false, a: false, s: false, d: false,
        e: false, enter: false,
        arrowup: false, arrowdown: false,
        arrowleft: false, arrowright: false
    };
    
    // 🔴 LIBERAR POINTER LOCK
    if(document.pointerLockElement){
        document.exitPointerLock();
    }

    // =========================================================
    // 🔴 REACTIVAR GESTOS TÁCTILES
    // =========================================================
    
    document.body.style.touchAction = "auto";
    document.body.style.userSelect = "auto";

    // =========================================================
    // 🔴 BOTONES
    // =========================================================
    
    document.getElementById("btnVistaPanoramica").style.display = "block";
    document.getElementById("btnVolverJuego").style.display = "none";

    // 🔴 BLOQUEAR CONTROLES POR 500ms (evita conflictos)
    Juego.pausado = true;
    
    setTimeout(() => {
        Juego.pausado = false;
        
        // 🔴 FORZAR FOCO EN EL CANVAS
        if(Juego.renderer && Juego.renderer.domElement){
            Juego.renderer.domElement.focus();
        }
        
        // 🔴 RESETEAR TECLAS
        Juego.teclas = {
            w: false, a: false, s: false, d: false,
            e: false, enter: false,
            arrowup: false, arrowdown: false,
            arrowleft: false, arrowright: false
        };
        
        console.log("🎮 Controles reactivados");
    }, 500);

    console.log("🎮 Vista panorámica desactivada. Todo restaurado.");
}



/*=========================================================
MOUSE FPS
=========================================================*/

// 🔴 COOLDOWN PARA POINTER LOCK
let ultimoPointerLock = 0;

document.addEventListener("click", function(){
    
    if(document.getElementById("panelProfesor").style.display === "flex") return;
    if(document.getElementById("panelTutor").style.display === "flex") return;
    if(document.getElementById("seleccionMateria").style.display === "flex") return;
    if(document.getElementById("login").style.display === "flex") return;
    if(document.getElementById("popup").style.display === "block") return;  // 🔴 No pedir si hay pregunta
    if(document.getElementById("capturaNPC")) return;  // 🔴 No pedir si hay captura
    
    // 🔴 COOLDOWN DE 1 SEGUNDO ENTRE INTENTOS
    const ahora = Date.now();
    if(ahora - ultimoPointerLock < 1000) return;
    
    if(Juego.renderer && !Juego.vistaPanoramica){
        
        // 🔴 VERIFICAR QUE NO ESTÉ YA ACTIVO
        if(document.pointerLockElement === Juego.renderer.domElement) return;
        
        ultimoPointerLock = ahora;
        
        // 🔴 CAPTURAR ERROR
        try {
            const promesa = Juego.renderer.domElement.requestPointerLock();
            if(promesa && promesa.catch){
                promesa.catch(() => {
                    // Ignorar error silenciosamente
                });
            }
        } catch(e) {
            // Ignorar error silenciosamente
        }
    }
});

document.addEventListener("mousemove", function(e){

    if(Juego.vistaPanoramica) return;
    if(Juego.renderer && document.pointerLockElement !== Juego.renderer.domElement) return;
    if(!Juego.jugador) return;

    Juego.jugador.rotation.y -= e.movementX * Juego.sensibilidad;

});

/*=========================================================
REVISAR PUERTAS CERCANAS
=========================================================*/

function revisarPuertasCercanas(){

    // =============================================
    // PUERTA DE LA BIBLIOTECA
    // =============================================
    if(Juego.puertaBiblioteca){

        const puerta = Juego.puertaBiblioteca;
        const dx = Juego.jugador.position.x - puerta.position.x;
        const dz = Juego.jugador.position.z - puerta.position.z;
        const distancia = Math.sqrt(dx*dx + dz*dz);

        if(distancia < 5){

            mostrarIndicadorPuerta("biblioteca", puerta.userData.abierta);

            if(Juego.teclas["e"]){
                Juego.teclas["e"] = false;

                // Alternar abierto/cerrado
                puerta.userData.abierta = !puerta.userData.abierta;

                if(puerta.userData.abierta){
                    // Abrir: mover la puerta hacia arriba
                    puerta.position.y = 12;
                    console.log("🚪 Biblioteca ABIERTA");
                } else {
                    // Cerrar
                    puerta.position.y = 4;
                    console.log("🚪 Biblioteca CERRADA");
                }
            }
            return;
        }
    }

    // =============================================
    // PUERTAS DE AULAS
    // =============================================
    if(Juego.puertas){

        for(const puerta of Juego.puertas){

            const dx = Juego.jugador.position.x - puerta.position.x;
            const dz = Juego.jugador.position.z - puerta.position.z;
            const distancia = Math.sqrt(dx*dx + dz*dz);

            if(distancia < 5){

                const indice = puerta.userData.indiceAula;
                mostrarIndicadorPuerta("aula", puerta.userData.abierta, indice);

                if(Juego.teclas["e"]){
                    Juego.teclas["e"] = false;

                    // Si ya está abierta, solo cerrar/abrir
                    if(puerta.userData.abierta){
                        puerta.userData.abierta = false;
                        puerta.position.y = 4;
                        console.log("🚪 Puerta aula " + indice + " CERRADA");
                    } else {
                        // Abrir: verificar si tiene llave O si es modo profesor prueba
                        if(GameManager.llaves > 0 || window.modoProfesorPrueba){
                            puerta.userData.abierta = true;
                            puerta.position.y = 12;
                            console.log("🚪 Puerta aula " + indice + " ABIERTA");
                        } else {
                            alert("🔑 Necesitas una llave para abrir esta aula");
                        }
                    }
                }
                return;
            }
        }
    }

    // Ocultar indicador si no está cerca de ninguna puerta
    ocultarIndicadorPuerta();

}

/*=========================================================
INDICADOR DE PUERTA
=========================================================*/

let indicadorPuertaActivo = null;

function mostrarIndicadorPuerta(tipo, abierta, indice){

    const id = tipo + "_" + indice;

    if(indicadorPuertaActivo === id) return;
    ocultarIndicadorPuerta();

    const mensaje = abierta 
        ? "Presiona <strong>E</strong> para cerrar"
        : "Presiona <strong>E</strong> para abrir";

    const indicador = document.createElement("div");
    indicador.id = "indicadorPuerta";
    indicador.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        color: #ffd700;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        font-size: 18px;
        z-index: 9997;
        border: 2px solid #ffd700;
        text-align: center;
    `;
    indicador.innerHTML = `🚪 <strong>${tipo === "biblioteca" ? "Biblioteca" : "Aula"}</strong><br><span style="color: #88ff88; font-size: 14px;">${mensaje}</span>`;
    document.body.appendChild(indicador);
    indicadorPuertaActivo = id;
}

function ocultarIndicadorPuerta(){
    const indicador = document.getElementById("indicadorPuerta");
    if(indicador){
        indicador.remove();
        indicadorPuertaActivo = null;
    }
}

/*=========================================================
REVISAR ESTANTES CERCANOS
=========================================================*/

function revisarEstantesCercanos(){

    if(!Juego.estanterias) return;

    for(const estante of Juego.estanterias){

        const dx = Juego.jugador.position.x - estante.position.x;
        const dz = Juego.jugador.position.z - estante.position.z;
        const distancia = Math.sqrt(dx*dx + dz*dz);

        if(distancia < 5){

            const tipo = estante.userData.tipo;
            const id = estante.userData.id;
            
            // 🔴 MISMO NOMBRE QUE EL CARTEL 3D
            let nombre = "";
            
            if(window.modoMateriaUnica && window.materiaUnicaActual){
                if(tipo === "especial"){
                    const especiales = ["Guía", "Historia", "Diario"];
                    nombre = especiales[id];
                } else {
                    nombre = window.materiaUnicaActual.charAt(0).toUpperCase() + 
                             window.materiaUnicaActual.slice(1);
                }
            } else {
                nombre = obtenerNombreEstante(tipo, id);
            }

            mostrarIndicadorEstante(nombre);

            if(Juego.teclas["e"]){
                Juego.teclas["e"] = false;
                abrirContenidoEstante(tipo, id);
            }
            return;
        }
    }

    ocultarIndicadorEstante();
}

/*=========================================================
INDICADOR DE ESTANTE
=========================================================*/

let indicadorEstanteActivo = null;

function mostrarIndicadorEstante(nombre){

    if(indicadorEstanteActivo === nombre) return;
    ocultarIndicadorEstante();

    const indicador = document.createElement("div");
    indicador.id = "indicadorEstante";
    indicador.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.85);
        color: #ffd700;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        font-size: 18px;
        z-index: 9997;
        border: 2px solid #ffd700;
        text-align: center;
    `;
    indicador.innerHTML = `📚 <strong>${nombre}</strong><br><span style="color: #88ff88; font-size: 14px;">Presiona <strong>E</strong> para leer</span>`;
    document.body.appendChild(indicador);
    indicadorEstanteActivo = nombre;
}

function ocultarIndicadorEstante(){
    const indicador = document.getElementById("indicadorEstante");
    if(indicador){
        indicador.remove();
        indicadorEstanteActivo = null;
    }
}

/*=========================================================
ABRIR CONTENIDO DEL ESTANTE
=========================================================*/

function abrirContenidoEstante(tipo, id){

    let titulo = "";
    let texto = "";

    // 🔴 SI ES MODO MATERIA ÚNICA, MOSTRAR SOLO ESA MATERIA
    if(window.modoMateriaUnica && window.materiaUnicaActual){
        
        const nombreCapitalizado = window.materiaUnicaActual.charAt(0).toUpperCase() + 
                                   window.materiaUnicaActual.slice(1);
        
        // 🔴 SI ES LA GUÍA, MARCAR COMO VISTA
        if(tipo === "especial" && id === 0){
            
            if(typeof marcarGuiaVista === "function"){
                marcarGuiaVista();
            }
            
            titulo = ContenidoBiblioteca.instrucciones.titulo;
            texto = ContenidoBiblioteca.instrucciones.texto;
            
            mostrarContenidoEstante(titulo, texto);
            return;
        }
        
        // 🔴 SI ES HISTORIA O DIARIO
        if(tipo === "especial" && id === 1){
            titulo = ContenidoBiblioteca.historia.titulo;
            texto = ContenidoBiblioteca.historia.texto;
            mostrarContenidoEstante(titulo, texto);
            return;
        }
        
        // 🔴 SI ES UN ESTANTE DE MATERIA, MOSTRAR SOLO LA MATERIA ÚNICA
        const contenido = ContenidoBiblioteca.materias[nombreCapitalizado];
        
        if(contenido){
            titulo = contenido.titulo;
            texto = contenido.texto;
        } else {
            titulo = "📚 " + nombreCapitalizado.toUpperCase();
            texto = "Contenido de " + nombreCapitalizado;
        }
        
        mostrarContenidoEstante(titulo, texto);
        return;
    }

    // 🔴 MODO NORMAL
    if(tipo === "especial"){

        if(id === 0){
            
            // 🔴 MARCAR LA GUÍA COMO VISTA
            // Esto activa la FASE 3 de las flechas guía
            // (las flechas cambian para apuntar a la llave)
            if(typeof marcarGuiaVista === "function"){
                marcarGuiaVista();
            }
            
            // 🔴 CARGAR EL CONTENIDO DE LA GUÍA
            titulo = ContenidoBiblioteca.instrucciones.titulo;
            texto = ContenidoBiblioteca.instrucciones.texto;
            
        } else if(id === 1){
            titulo = ContenidoBiblioteca.historia.titulo;
            texto = ContenidoBiblioteca.historia.texto;
        } else if(id === 2){
            titulo = "📔 DIARIO DEL ÚLTIMO ESTUDIANTE";
            texto = `
                Día 1: Llegué al colegio como cualquier otro día.
                Día 2: Algo raro pasó. Las puertas se cerraron solas.
                Día 3: Encontré una llave en la biblioteca.
                Día 4: Intenté escapar. No pude.
                Día 5: Ahora estoy atrapado aquí.
                Día 6: Si alguien lee esto... NO CONFÍES EN ÉL.
                Día 7: Él no quiere que escapes.
            `;
        }

    } else {

        const materias = [
            "Matemáticas", "Lenguaje", "Inglés", "Biología",
            "Química", "Física", "Filosofia", "Música",
            "Sociales", "Arte", "Educaion Fisica", "Religión"
        ];

        const nombreMateria = materias[id];
        const contenido = ContenidoBiblioteca.materias[nombreMateria];

        if(contenido){
            titulo = contenido.titulo;
            texto = contenido.texto;
        }
    }

    mostrarContenidoEstante(titulo, texto);

}

/*=========================================================
MOSTRAR CONTENIDO DEL ESTANTE
=========================================================*/

function mostrarContenidoEstante(titulo, texto){

    const contenedor = document.createElement("div");
    contenedor.id = "contenidoEstante";
    contenedor.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 700px;
        max-height: 80vh;
        background: rgba(0, 0, 0, 0.95);
        color: #ffffff;
        padding: 30px;
        border-radius: 15px;
        font-family: 'Courier New', monospace;
        font-size: 15px;
        z-index: 9998;
        border: 3px solid #ffd700;
        overflow-y: auto;
        line-height: 1.6;
    `;

    contenedor.innerHTML = `
        <h1 style="color: #ffd700; text-align: center; margin-bottom: 20px;">
            ${titulo}
        </h1>
        
        <div style="color: #ffffff; white-space: pre-line; margin-bottom: 20px;">
            ${texto}
        </div>
        
        <div style="text-align: center;">
            <button onclick="cerrarContenidoEstante()" style="
                padding: 12px 40px;
                background: #ffd700;
                color: #000;
                border: none;
                border-radius: 8px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
            ">CERRAR</button>
        </div>
    `;

    document.body.appendChild(contenedor);

}

function cerrarContenidoEstante(){
    const contenedor = document.getElementById("contenidoEstante");
    if(contenedor){
        contenedor.remove();
    }
}

/*=========================================================
CONTROLES TÁCTILES (MÓVIL/TABLET)
=========================================================*/

let joystickActivo = false;
let joystickX = 0;
let joystickY = 0;

function inicializarControlesTactiles(){

    const joystick = document.getElementById("joystick");
    const base = document.getElementById("joystickBase");
    const knob = document.getElementById("joystickKnob");
    const btnE = document.getElementById("btnInteractuar");

    if(!joystick || !base || !knob || !btnE){
        console.log("⚠️ Controles táctiles no encontrados");
        return;
    }

    // =============================================
    // JOYSTICK (DEDO 1 - MOVIMIENTO)
    // =============================================

    joystick.addEventListener("touchstart", function(e){
        e.preventDefault();
        e.stopPropagation();
        joystickActivo = true;
        moverJoystick(e.touches[0]);
    }, { passive: false });

    joystick.addEventListener("touchmove", function(e){
        e.preventDefault();
        e.stopPropagation();
        if(joystickActivo){
            moverJoystick(e.touches[0]);
        }
    }, { passive: false });

    joystick.addEventListener("touchend", function(e){
        e.preventDefault();
        e.stopPropagation();
        joystickActivo = false;
        joystickX = 0;
        joystickY = 0;
        knob.style.transform = "translate(-50%, -50%)";
    }, { passive: false });

    joystick.addEventListener("touchcancel", function(e){
        joystickActivo = false;
        joystickX = 0;
        joystickY = 0;
        knob.style.transform = "translate(-50%, -50%)";
    });

    function moverJoystick(touch){

        const rect = base.getBoundingClientRect();
        const centroX = rect.left + rect.width / 2;
        const centroY = rect.top + rect.height / 2;

        let dx = touch.clientX - centroX;
        let dy = touch.clientY - centroY;

        const maxRadio = rect.width / 2 - 30;
        const distancia = Math.sqrt(dx*dx + dy*dy);

        if(distancia > maxRadio){
            dx = (dx / distancia) * maxRadio;
            dy = (dy / distancia) * maxRadio;
        }

        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        joystickX = dx / maxRadio;
        joystickY = dy / maxRadio;
    }

    // =============================================
    // BOTÓN E (DEDO INDEPENDIENTE)
    // =============================================

    btnE.addEventListener("touchstart", function(e){
        e.preventDefault();
        e.stopPropagation();
        Juego.teclas["e"] = true;
        
        setTimeout(() => {
            Juego.teclas["e"] = false;
        }, 150);
    }, { passive: false });

    // =============================================
    // ROTACIÓN TÁCTIL (DEDO 2 - GIRAR)
    // Funciona AL MISMO TIEMPO que el joystick
    // =============================================

    let dedoRotacion = null;
    let toqueXAnterior = 0;

    document.addEventListener("touchstart", function(e){

        // 🔴 Buscar un dedo que NO sea el del joystick ni el del botón E
        for(let i = 0; i < e.touches.length; i++){

            const touch = e.touches[i];
            const elemento = document.elementFromPoint(touch.clientX, touch.clientY);

            if(!elemento) continue;
            if(elemento.closest("#joystick")) continue;
            if(elemento.closest("#btnInteractuar")) continue;

            // Este dedo es para rotar
            dedoRotacion = touch.identifier;
            toqueXAnterior = touch.clientX;
            console.log("🔄 Dedo de rotación activado (id:", dedoRotacion, ")");
            break;
        }

    }, { passive: true });

    document.addEventListener("touchmove", function(e){

        if(dedoRotacion === null) return;
        if(!Juego.jugador) return;
        if(Juego.vistaPanoramica) return;

        // Buscar el dedo de rotación
        for(let i = 0; i < e.touches.length; i++){

            const touch = e.touches[i];

            if(touch.identifier === dedoRotacion){

                const toqueXActual = touch.clientX;
                const diferenciaX = toqueXActual - toqueXAnterior;

                // 🔄 Girar el jugador
                Juego.jugador.rotation.y -= diferenciaX * Juego.sensibilidad * 2;

                toqueXAnterior = toqueXActual;
                break;
            }
        }

    }, { passive: true });

    document.addEventListener("touchend", function(e){

        // Verificar si el dedo de rotación sigue en pantalla
        let dedoRotacionSigue = false;

        for(let i = 0; i < e.touches.length; i++){
            if(e.touches[i].identifier === dedoRotacion){
                dedoRotacionSigue = true;
                break;
            }
        }

        if(!dedoRotacionSigue){
            dedoRotacion = null;
            console.log("🔄 Dedo de rotación liberado");
        }

    }, { passive: true });

    document.addEventListener("touchcancel", function(e){
        dedoRotacion = null;
    }, { passive: true });

    console.log("📱 Controles táctiles inicializados (2 dedos)");
}

/*=========================================================
SELECCIÓN DE MATERIA (SOLO ESTUDIANTES)
=========================================================*/

const MATERIAS_JUEGO = [
    { id: "general", nombre: "🎓 General", clase: "general" },
    { id: 0,  nombre: "📐 Matemáticas" },
    { id: 1,  nombre: "📝 Lenguaje" },
    { id: 2,  nombre: "🇬🇧 Inglés" },
    { id: 3,  nombre: "🧬 Biología" },
    { id: 4,  nombre: "⚗️ Química" },
    { id: 5,  nombre: "⚛️ Física" },
    { id: 6,  nombre: "📚 Literatura" },
    { id: 7,  nombre: "🎵 Música" },
    { id: 8,  nombre: "🌎 Geografía" },
    { id: 9,  nombre: "🎨 Arte" },
    { id: 10, nombre: "🏛️ Historia" },
    { id: 11, nombre: "✝️ Religión" }
];

/*=========================================================
MOSTRAR PANTALLA DE SELECCIÓN DE MATERIA
=========================================================
Esta función se ejecuta cuando el estudiante hace clic
en el botón "COMENZAR" del menú principal.

🔴 IMPORTANTE: Resetea el modo materia única para evitar
que los estantes y aulas muestren datos de una sesión anterior.
=========================================================*/

function mostrarSeleccionMateria(){
    
    // 🔴 PASO 1: RESETEAR MODO MATERIA ÚNICA
    // Esto asegura que si la última vez jugaste "Química",
    // al abrir la selección de materia, se resetee a "General"
    window.modoMateriaUnica = false;
    window.materiaUnicaActual = "general";
    window.materiaSeleccionada = null;
    
    console.log("🔄 Modo materia única RESETEADO a General");
    
    // 🔴 PASO 2: Ocultar el menú principal
    document.getElementById("menuPrincipal").style.display = "none";
    
    // 🔴 PASO 3: Mostrar la pantalla de selección de materia
    const pantalla = document.getElementById("seleccionMateria");
    pantalla.style.display = "flex";
    
    // 🔴 PASO 4: Generar los botones de cada materia
    const lista = document.getElementById("listaMaterias");
    lista.innerHTML = "";   // Limpiar botones anteriores
    
    // 🔴 PASO 5: Recorrer el array de materias y crear un botón por cada una
    for(const materia of MATERIAS_JUEGO){
        
        // Crear botón
        const btn = document.createElement("button");
        btn.className = "btn-materia" + (materia.clase ? " " + materia.clase : "");
        btn.innerText = materia.nombre;
        
        // Al hacer clic, llamar a seleccionarMateria con el ID
        btn.onclick = () => seleccionarMateria(materia.id);
        
        // Añadir el botón a la lista
        lista.appendChild(btn);
    }
    
    console.log("📚 Pantalla de selección de materia abierta (modo reseteado)");
}

/*=========================================================
SELECCIONAR MATERIA
Guarda la materia y asigna al estudiante a su profesor
=========================================================*/

async function seleccionarMateria(materiaId){
    
    console.log("🎯 Materia seleccionada:", materiaId);
    
    // 🔴 Guardar la materia elegida
    window.materiaSeleccionada = materiaId;
    
    // 🔴 Convertir a nombre de materia
    let nombreMateria = "general";
    if(typeof materiaId === "number"){
        const nombresMaterias = [
            "Matematicas", "Lenguaje", "Ingles", "Biologia",
            "Quimica", "Fisica", "Literatura", "Musica",
            "Geografia", "Arte", "Historia", "Religion"
        ];
        nombreMateria = nombresMaterias[materiaId];
    }
    
    console.log("📚 Nombre de materia:", nombreMateria);
    
    // 🔴 Ocultar pantalla de selección
    document.getElementById("seleccionMateria").style.display = "none";
    
    // 🔴 ACTIVAR MODO MATERIA ÚNICA SI NO ES GENERAL
    if(nombreMateria !== "general"){
        window.modoMateriaUnica = true;
        window.materiaUnicaActual = nombreMateria;
        console.log("🎯 Modo materia única ACTIVADO:", nombreMateria);
    } else {
        window.modoMateriaUnica = false;
        window.materiaUnicaActual = "general";   // ← IMPORTANTE
        console.log("🎓 Modo general (todas las materias)");
    }
    
    // 🔴 Si es modo prueba del profesor, no asignar
    if(window.modoProfesorPrueba){
        console.log("👨‍🏫 Modo prueba del profesor");
        iniciarJuego();
        return;
    }
    
    // 🔴 Asignar estudiante al profesor de esa materia
    if(nombreMateria !== "general"){
        await asignarEstudianteAProfesor(nombreMateria);
    }
    
    // 🔴 Guardar progreso inicial
    await guardarProgreso(0, 0, []);
    
    // 🔴 Iniciar el juego
    iniciarJuego();
}

function volverAlMenu(){
    document.getElementById("seleccionMateria").style.display = "none";
    document.getElementById("menuPrincipal").style.display = "flex";
}

/*=========================================================
BLOQUEAR ZOOM DEL NAVEGADOR
=========================================================
🔴 Evita que el usuario haga zoom con Ctrl + Rueda
o con gestos táctiles, lo que rompe los controles.
=========================================================*/

// Bloquear zoom con Ctrl + Rueda del mouse
window.addEventListener("wheel", function(e){
    
    if(e.ctrlKey){
        e.preventDefault();
        return false;
    }
    
}, { passive: false });

// Bloquear zoom con Ctrl + "+" o Ctrl + "-"


// Bloquear zoom con gestos táctiles (pellizco)
document.addEventListener("touchstart", function(e){
    
    if(e.touches.length > 1){
        e.preventDefault();
    }
    
}, { passive: false });

document.addEventListener("touchmove", function(e){
    
    if(e.touches.length > 1){
        e.preventDefault();
    }
    
}, { passive: false });

console.log("🔒 Zoom del navegador bloqueado");

/*=========================================================
LIBERAR MOUSE CUANDO HAY UN POPUP
=========================================================*/

function liberarMouseParaPopup(){
    
    if(document.pointerLockElement){
        document.exitPointerLock();
    }
    
    // 🔴 PAUSAR EL JUEGO
    Juego.pausado = true;
    
    // 🔴 LIBERAR TECLAS
    Juego.teclas = {
        w: false, a: false, s: false, d: false,
        e: false, enter: false,
        arrowup: false, arrowdown: false,
        arrowleft: false, arrowright: false
    };
    
    console.log("🖱️ Mouse liberado para popup");
}

function reactivarMouseDespuesPopup(){
    
    // 🔴 REANUDAR JUEGO
    Juego.pausado = false;
    
    // 🔴 LIBERAR TECLAS
    Juego.teclas = {
        w: false, a: false, s: false, d: false,
        e: false, enter: false,
        arrowup: false, arrowdown: false,
        arrowleft: false, arrowright: false
    };
    
    // 🔴 PEDIR POINTER LOCK
    setTimeout(() => {
        if(Juego.renderer && Juego.renderer.domElement){
            try {
                const promesa = Juego.renderer.domElement.requestPointerLock();
                if(promesa && promesa.catch){
                    promesa.catch(() => {});
                }
            } catch(e) {}
        }
    }, 300);
    
    console.log("🖱️ Mouse reactivado");
}
