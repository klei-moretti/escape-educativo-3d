"use strict";

let usuarioRegistrado = false;

async function registrar(){
    const nombre = document.getElementById("nombre").value.trim();
    const pass = document.getElementById("password").value.trim();

    const soloLetras = /^[A-Za-z]{3,10}$/;
    const soloNumeros = /^[0-9]{6,10}$/;

    if(!soloLetras.test(nombre)){
        document.getElementById("errorLogin").innerText = "Nombre inválido";
        return;
    }

    if(!soloNumeros.test(pass)){
        document.getElementById("errorLogin").innerText = "Contraseña inválida";
        return;
    }

    // 🔗 REGISTRAR EN SUPABASE
    const correo = nombre + "@escape.com"; // correo temporal
    const usuario = await registrarUsuario(nombre, correo, pass);

    if(!usuario){
        document.getElementById("errorLogin").innerText = "Error al registrar";
        return;
    }

    usuarioRegistrado = true;
    document.getElementById("login").style.display = "none";
    document.getElementById("menuPrincipal").style.display = "flex";
    
    console.log("✅ Registrado en Supabase:", nombre);
}

async function iniciarSesionUsuario(){
    const nombre = document.getElementById("nombre").value.trim();
    const pass = document.getElementById("password").value.trim();

    const correo = nombre + "@escape.com";
    const usuario = await iniciarSesion(correo, pass);

    if(!usuario){
        document.getElementById("errorLogin").innerText = "Usuario o contraseña incorrectos";
        return;
    }

    usuarioRegistrado = true;
    document.getElementById("login").style.display = "none";
    document.getElementById("menuPrincipal").style.display = "flex";
    console.log("✅ Sesión iniciada:", nombre);
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
    rotacionOriginal: null
};

/*=========================================================
INICIAR JUEGO
=========================================================*/

function iniciarJuego(){

    document.getElementById("menuPrincipal").style.display = "none";
    document.getElementById("login").style.display = "none";
    document.getElementById("contenedorJuego").style.display = "block";

    crearEscena();
    crearCamara();
    crearRenderer();
    crearLucesMejoradas();
    crearPiso();
    crearEscuela();
    crearDecoracion();
    crearLlaves();
    crearJugador();
    ocultarPantallaCarga();

    // Inicializar controles táctiles
    inicializarControlesTactiles();   // ← ESTA LÍNEA ES NUEVA

    actualizar();

}

/*=========================================================
ESCENA
=========================================================*/

function crearEscena(){
    Juego.escena = new THREE.Scene();
    Juego.escena.background = new THREE.Color(0x87CEEB);
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

    // Piso grande que cubre toda la escena
    const geometria = new THREE.PlaneGeometry(1000, 1000);
    const material = new THREE.MeshStandardMaterial({
        color: 0x9E9E8E,
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide
    });
    const piso = new THREE.Mesh(geometria, material);
    piso.rotation.x = -Math.PI / 2;
    piso.position.y = -0.1;
    piso.receiveShadow = true;
    Juego.escena.add(piso);

    // NO HAY CUADRÍCULA - PISO LIMPIO

    console.log("🏗️ Piso creado - Sin cuadrícula");
}

/*=========================================================
CREAR PARED
=========================================================*/

function crearPared(x, y, z, ancho, alto, profundidad){

    const geometria = new THREE.BoxGeometry(ancho, alto, profundidad);
    const material = new THREE.MeshStandardMaterial({
        color: 0xE8E0D8,  // Color beige claro (diferente al piso)
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
ACTUALIZAR
=========================================================*/

function actualizar(){

    requestAnimationFrame(actualizar);
    
    if(!Juego.vistaPanoramica){
        moverJugador();
        revisarZonas();
        // revisarZonasEspeciales();   ← COMENTADA (ya no se usa)
        revisarSalida();
        revisarLlaves();
        revisarPuertasCercanas();
        revisarEstantesCercanos();   // ← NUEVO
        animarPuerta();
    }
    
    Juego.renderer.render(Juego.escena, Juego.camara);
}

/*=========================================================
RESPONSIVE
=========================================================*/

window.addEventListener("resize", () => {
    Juego.ancho = window.innerWidth;
    Juego.alto = window.innerHeight;
    
    if(Juego.camara){
        Juego.camara.aspect = Juego.ancho / Juego.alto;
        Juego.camara.updateProjectionMatrix();
    }
    
    // Si existe la cámara panorámica, actualizarla también
    if(Juego.camaraPanoramica){
        Juego.camaraPanoramica.aspect = Juego.ancho / Juego.alto;
        Juego.camaraPanoramica.updateProjectionMatrix();
    }
    
    if(Juego.renderer){
        Juego.renderer.setSize(Juego.ancho, Juego.alto);
    }
    
});

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
TECLADO
=========================================================*/

window.addEventListener("keydown", function(e){
    if(e.key){
        Juego.teclas[e.key.toLowerCase()] = true;
    }
});

window.addEventListener("keyup", function(e){
    if(e.key){
        Juego.teclas[e.key.toLowerCase()] = false;
    }
});

/*=========================================================
MOVIMIENTO
=========================================================*/

function moverJugador(){

    if(!Juego.jugador || Juego.vistaPanoramica) return;

    // 🔴 GUARDAR ÁNGULO ACTUAL
    const angulo = Juego.jugador.rotation.y;
    
    // 🔴 CALCULAR DIRECCIONES
    const adelanteX = -Math.sin(angulo);
    const adelanteZ = -Math.cos(angulo);
    const derechaX = Math.cos(angulo);
    const derechaZ = -Math.sin(angulo);

    let moveX = 0;
    let moveZ = 0;

    if(Juego.teclas["w"]){
        moveX += adelanteX;
        moveZ += adelanteZ;
    }
    if(Juego.teclas["s"]){
        moveX -= adelanteX;
        moveZ -= adelanteZ;
    }
    if(Juego.teclas["a"]){
        moveX -= derechaX;
        moveZ -= derechaZ;
    }
    if(Juego.teclas["d"]){
        moveX += derechaX;
        moveZ += derechaZ;
    }

    // 🔴 CONTROLES TÁCTILES (JOYSTICK)
    if(joystickActivo){
        // Y = adelante/atrás (invertido)
        moveX += adelanteX * (-joystickY);
        moveZ += adelanteZ * (-joystickY);
        
        // X = izquierda/derecha
        moveX += derechaX * joystickX;
        moveZ += derechaZ * joystickX;
    }

    // Normalizar
    const longitud = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if(longitud > 0){
        moveX = (moveX / longitud) * Juego.velocidad;
        moveZ = (moveZ / longitud) * Juego.velocidad;
    }

    // 🔴 PROBAR MOVIMIENTO EN CADA EJE POR SEPARADO
    // Eje X
    const nuevoX = Juego.jugador.position.x + moveX;
    if(!hayColision(nuevoX, Juego.jugador.position.z)){
        Juego.jugador.position.x = nuevoX;
    }

    // Eje Z
    const nuevoZ = Juego.jugador.position.z + moveZ;
    if(!hayColision(Juego.jugador.position.x, nuevoZ)){
        Juego.jugador.position.z = nuevoZ;
    }

    // Rotación con flechas
    if(Juego.teclas["arrowleft"]){
        Juego.jugador.rotation.y += 0.04;
    }
    if(Juego.teclas["arrowright"]){
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

    const nombres = [
        "Matemáticas", "Lenguaje", "Inglés", "Biología",
        "Química", "Física", "Educación Física", "Música",
        "Filosofía", "Artes Plásticas", "Historia", "Religión"
    ];

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
    indicador.innerHTML = `📚 <strong>${nombres[id]}</strong><br><span style="color: #88ff88; font-size: 14px;">Presiona <strong>E</strong> para responder</span>`;
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
REVISAR LLAVES
=========================================================*/

function revisarLlaves(){

    if(!Juego.llaves) return;

    for(const llave of Juego.llaves){
        if(llave.userData.recogida) continue;

        const dx = Juego.jugador.position.x - llave.position.x;
        const dz = Juego.jugador.position.z - llave.position.z;
        const distancia = Math.sqrt(dx*dx + dz*dz);

        if(distancia < 3 && Juego.teclas["e"]){
            llave.userData.recogida = true;
            llave.visible = false;
            agregarLlave();
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
VISTA PANORÁMICA
=========================================================*/

/*=========================================================
VISTA PANORÁMICA
=========================================================*/

function activarVistaPanoramica(){

    if(!Juego.jugador) return;

    // Guardar posición original
    Juego.posicionOriginal = Juego.jugador.position.clone();
    Juego.rotacionOriginal = Juego.jugador.rotation.y;

    // Crear cámara panorámica si no existe
    if(!Juego.camaraPanoramica){
        Juego.camaraPanoramica = new THREE.PerspectiveCamera(30, Juego.ancho / Juego.alto, 0.1, 10000);
        Juego.camaraPanoramica.position.set(0, 1200, 0);
        Juego.camaraPanoramica.lookAt(0, 0, 0);
    }

    // Guardar cámara actual y cambiar
    Juego.camaraAnterior = Juego.camara;
    Juego.camara = Juego.camaraPanoramica;
    Juego.vistaPanoramica = true;

    // Ocultar jugador
    Juego.jugador.visible = false;

    document.getElementById("btnVistaPanoramica").style.display = "none";
    document.getElementById("btnVolverJuego").style.display = "block";

    // Bloquear teclas
    Juego.teclas["w"] = false;
    Juego.teclas["s"] = false;
    Juego.teclas["a"] = false;
    Juego.teclas["d"] = false;

    console.log("🎥 Vista panorámica activada - Altura 1200");
}

function desactivarVistaPanoramica(){

    if(!Juego.jugador) return;

    // Restaurar cámara anterior
    if(Juego.camaraAnterior){
        Juego.camara = Juego.camaraAnterior;
        Juego.camaraAnterior = null;
    }

    // Restaurar posición del jugador
    if(Juego.posicionOriginal){
        Juego.jugador.position.copy(Juego.posicionOriginal);
        Juego.jugador.rotation.y = Juego.rotacionOriginal;
    }

    // Mostrar jugador
    Juego.jugador.visible = true;

    // Restaurar cámara
    Juego.camara.position.set(0, 1.7, 0);
    Juego.camara.lookAt(0, 5.5, -20);
    Juego.vistaPanoramica = false;

    document.getElementById("btnVistaPanoramica").style.display = "block";
    document.getElementById("btnVolverJuego").style.display = "none";

    // 🔴 RESETEAR ROTACIÓN DE LA CÁMARA
    if(Juego.camara){
        Juego.camara.rotation.set(0, 0, 0);
    }
    
    // 🔴 RESETEAR POSICIÓN DE LA CÁMARA
    Juego.camara.position.set(0, 1.7, 0);
    Juego.camara.lookAt(0, 5.5, -20);

    console.log("🎮 Volviendo al juego");
}

/*=========================================================
MOUSE FPS
=========================================================*/

document.addEventListener("click", function(){
    if(Juego.renderer && !Juego.vistaPanoramica){
        Juego.renderer.domElement.requestPointerLock();
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
                        // Abrir: verificar si tiene llave
                        if(GameManager.llaves > 0){
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
            const nombre = obtenerNombreEstante(tipo, id);

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

    if(tipo === "especial"){

        if(id === 0){
            // Guía de juego
            titulo = ContenidoBiblioteca.instrucciones.titulo;
            texto = ContenidoBiblioteca.instrucciones.texto;
        } else if(id === 1){
            // Historia
            titulo = ContenidoBiblioteca.historia.titulo;
            texto = ContenidoBiblioteca.historia.texto;
        } else if(id === 2){
            // Diario
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

        // Materia normal
        const materias = [
            "Matemáticas", "Lenguaje", "Inglés", "Biología",
            "Química", "Física", "Literatura", "Música",
            "Geografía", "Arte", "Historia", "Religión"
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

    if(!joystick || !base || !knob || !btnE) return;

    // =============================================
    // JOYSTICK
    // =============================================
    joystick.addEventListener("touchstart", function(e){
        e.preventDefault();
        joystickActivo = true;
        moverJoystick(e.touches[0]);
    });

    joystick.addEventListener("touchmove", function(e){
        e.preventDefault();
        if(joystickActivo){
            moverJoystick(e.touches[0]);
        }
    });

    joystick.addEventListener("touchend", function(e){
        e.preventDefault();
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

        // Limitar al radio del joystick
        const maxRadio = rect.width / 2 - 30;
        const distancia = Math.sqrt(dx*dx + dy*dy);

        if(distancia > maxRadio){
            dx = (dx / distancia) * maxRadio;
            dy = (dy / distancia) * maxRadio;
        }

        // Mover knob
        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        // Normalizar para movimiento
        joystickX = dx / maxRadio;
        joystickY = dy / maxRadio;
    }

    // =============================================
    // BOTÓN E
    // =============================================
    btnE.addEventListener("touchstart", function(e){
        e.preventDefault();
        Juego.teclas["e"] = true;
        
        // Simular pulsación breve
        setTimeout(() => {
            Juego.teclas["e"] = false;
        }, 150);
    });

    console.log("📱 Controles táctiles inicializados");

    // =============================================
    // ROTACIÓN TÁCTIL (GIRAR CON EL DEDO)
    // =============================================
    
    let dedoRotacion = null;
    let toqueXAnterior = 0;
    
    document.addEventListener("touchstart", function(e){
        
        // 🔴 Buscar un dedo que NO esté en el joystick ni en el botón E
        for(let i = 0; i < e.touches.length; i++){
            
            const touch = e.touches[i];
            const elemento = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if(!elemento) continue;
            if(elemento.closest("#joystick")) continue;
            if(elemento.closest("#btnInteractuar")) continue;
            
            // Este dedo es para rotar
            dedoRotacion = touch.identifier;
            toqueXAnterior = touch.clientX;
            break;
        }
        
    }, { passive: true });
    
    document.addEventListener("touchmove", function(e){
        
        if(dedoRotacion === null) return;
        if(!Juego.jugador) return;
        
        // Buscar el dedo de rotación
        for(let i = 0; i < e.touches.length; i++){
            
            const touch = e.touches[i];
            
            if(touch.identifier === dedoRotacion){
                
                const toqueXActual = touch.clientX;
                const diferenciaX = toqueXActual - toqueXAnterior;
                
                // Girar el jugador
                Juego.jugador.rotation.y -= diferenciaX * Juego.sensibilidad * 2;
                
                toqueXAnterior = toqueXActual;
                break;
            }
        }
        
    }, { passive: true });
    
    document.addEventListener("touchend", function(e){
        
        // Verificar si el dedo de rotación terminó
        let dedoRotacionSigue = false;
        
        for(let i = 0; i < e.touches.length; i++){
            if(e.touches[i].identifier === dedoRotacion){
                dedoRotacionSigue = true;
                break;
            }
        }
        
        if(!dedoRotacionSigue){
            dedoRotacion = null;
        }
        
    }, { passive: true });
    
    console.log("📱 Rotación táctil activada (2 dedos)");

    
}
