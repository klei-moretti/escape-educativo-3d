"use strict";

/*=========================================================
DECORACIÓN DE AULAS - VERSIÓN OPTIMIZADA
=========================================================
Cada aula tiene POCOS objetos para que el juego no se trabe.

Objetos comunes por aula:
- 8 pupitres rotos
- 5 papeles en el piso
- 4 antorchas (se encienden al entrar)
- 1 esqueleto

Cada materia tiene 1-2 objetos temáticos GRANDES.
=========================================================*/

// 🔴 PAREDES DEL AULA
const PARED = {
    NORTE_Z: -20,
    SUR_Z:   20,
    ESTE_X:  25,
    OESTE_X: -25
};

/*=========================================================
DECORAR AULAS
=========================================================*/

function decorarAulas(){
    
    registrarAulaDinamica("sociales",        -100, 140,  decorarAulaSociales);
    registrarAulaDinamica("fisica",          -240, 120,  decorarAulaFisica);
    registrarAulaDinamica("quimica",         -200, 0,    decorarAulaQuimica);
    registrarAulaDinamica("biologia",        -240, -120, decorarAulaBiologia);
    registrarAulaDinamica("lenguaje",        -60,  -240, decorarAulaLenguaje);
    registrarAulaDinamica("ingles",          200,  -220, decorarAulaIngles);
    registrarAulaDinamica("matematicas",     -200, -220, decorarAulaMatematicas);
    registrarAulaDinamica("filosofia",       200,  0,    decorarAulaFilosofia);
    registrarAulaDinamica("musica",          240,  120,  decorarAulaMusica);
    registrarAulaDinamica("arte",            -160, -150, decorarAulaArte);
    registrarAulaDinamica("educacionfisica", 220,  220,  decorarAulaEducacionFisica);
    registrarAulaDinamica("religion",        240,  -120, decorarAulaReligion);
    
    console.log("🏫 12 aulas registradas");
}

/*=========================================================
DECORACIÓN COMÚN (todas las aulas)
=========================================================*/

function decorarAulaComun(x, z){
    
    // 8 PUPITRES ROTOS
    for(let i = 0; i < 8; i++){
        const offsetX = (Math.random() - 0.5) * 36;
        const offsetZ = (Math.random() - 0.5) * 26;
        crearPupitreRoto(x + offsetX, z + offsetZ, Math.random() * Math.PI * 2);
    }
    
    // 5 PAPELES
    const geoPapel = geometriaCompartida("plane", 0.4, 0.4);
    const matPapel = new THREE.MeshStandardMaterial({
        color: 0x8A7A5A,
        roughness: 1,
        side: THREE.DoubleSide
    });
    
    for(let i = 0; i < 5; i++){
        const papel = new THREE.Mesh(geoPapel, matPapel);
        papel.rotation.x = -Math.PI / 2;
        papel.rotation.z = Math.random() * Math.PI;
        papel.position.set(
            x + (Math.random() - 0.5) * 36,
            0.02,
            z + (Math.random() - 0.5) * 26
        );
        Juego.escena.add(papel);
    }
    
    // 4 ANTORCHAS
    crearAntorchasAula(x, z);
    
    // 1 ESQUELETO
    crearEsqueleto(x + (Math.random() - 0.5) * 20, z + (Math.random() - 0.5) * 15);
}

/*=========================================================
PUPITRE ROTO (optimizado)
=========================================================*/

function crearPupitreRoto(x, z, rotacion){
    
    const grupo = new THREE.Group();
    grupo.position.set(x, 0, z);
    grupo.rotation.y = rotacion;
    
    const geoTablero = geometriaCompartida("box", 1.2, 0.1, 0.8);
    const geoPata = geometriaCompartida("box", 0.08, 0.7, 0.08);
    
    const matTablero = new THREE.MeshStandardMaterial({
        color: 0x2a1a0f,
        roughness: 1
    });
    
    const matPata = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.95,
        metalness: 0.4
    });
    
    const tablero = new THREE.Mesh(geoTablero, matTablero);
    tablero.position.y = 0.7;
    tablero.rotation.z = (Math.random() - 0.5) * 0.6;
    tablero.rotation.x = (Math.random() - 0.5) * 0.3;
    tablero.castShadow = true;
    grupo.add(tablero);
    
    const patasActivas = Math.floor(Math.random() * 3) + 1;
    const posicionesPatas = [
        [-0.5, -0.3], [0.5, -0.3],
        [-0.5, 0.3], [0.5, 0.3]
    ];
    posicionesPatas.sort(() => Math.random() - 0.5);
    
    for(let i = 0; i < patasActivas; i++){
        const pata = new THREE.Mesh(geoPata, matPata);
        pata.position.set(posicionesPatas[i][0], 0.35, posicionesPatas[i][1]);
        pata.rotation.z = (Math.random() - 0.5) * 0.4;
        grupo.add(pata);
    }
    
    for(let i = patasActivas; i < 4; i++){
        const pataRota = new THREE.Mesh(geoPata, matPata);
        pataRota.position.set(
            posicionesPatas[i][0] + (Math.random() - 0.5) * 1.5,
            0.05,
            posicionesPatas[i][1] + (Math.random() - 0.5) * 1.5
        );
        pataRota.rotation.set(Math.PI / 2, Math.random() * Math.PI, Math.random() * Math.PI);
        grupo.add(pataRota);
    }
    
    Juego.escena.add(grupo);
}

/*=========================================================
ESQUELETO
=========================================================*/

function crearEsqueleto(x, z){
    
    const grupo = new THREE.Group();
    grupo.position.set(x, 0, z);
    grupo.rotation.y = Math.random() * Math.PI * 2;
    
    const geoHueso = geometriaCompartida("sphere", 0.5, 12, 12);
    const matHueso = new THREE.MeshStandardMaterial({
        color: 0xD4C8A8,
        roughness: 0.9
    });
    
    const craneo = new THREE.Mesh(geoHueso, matHueso);
    craneo.position.y = 0.5;
    craneo.scale.set(1, 0.9, 1.1);
    grupo.add(craneo);
    
    const geoCuerpo = geometriaCompartida("box", 0.6, 0.2, 0.5);
    const mandibula = new THREE.Mesh(geoCuerpo, matHueso);
    mandibula.position.set(0, 0.15, 0.1);
    grupo.add(mandibula);
    
    // Columna
    const geoVert = geometriaCompartida("cylinder", 0.15, 0.15, 0.15, 8);
    for(let i = 0; i < 4; i++){
        const vertebra = new THREE.Mesh(geoVert, matHueso);
        vertebra.position.set(0, 0.4 - i * 0.15, -0.3 - i * 0.1);
        vertebra.rotation.x = Math.PI / 2;
        grupo.add(vertebra);
    }
    
    Juego.escena.add(grupo);
}

/*=========================================================
ANTORCHAS DEL AULA (se encienden al entrar)
=========================================================*/

function crearAntorchasAula(x, z){
    
    const posiciones = [
        { x: x - 22, z: z - 17 },
        { x: x + 22, z: z - 17 },
        { x: x - 22, z: z + 17 },
        { x: x + 22, z: z + 17 }
    ];
    
    if(!Juego.antorchasAulas){
        Juego.antorchasAulas = [];
    }
    
    const grupoAula = {
        centroX: x,
        centroZ: z,
        radio: 30,
        encendidas: false,
        antorchas: []
    };
    
    for(const pos of posiciones){
        
        const grupo = new THREE.Group();
        
        const geoPoste = geometriaCompartida("cylinder", 0.1, 0.15, 3, 8);
        const poste = new THREE.Mesh(
            geoPoste,
            new THREE.MeshStandardMaterial({
                color: 0x3D2415,
                roughness: 0.95
            })
        );
        poste.position.y = 1.5;
        grupo.add(poste);
        
        const geoLlama = geometriaCompartida("cone", 0.3, 0.8, 8);
        const llama = new THREE.Mesh(
            geoLlama,
            new THREE.MeshStandardMaterial({
                color: 0xFF6600,
                emissive: 0xFF6600,
                emissiveIntensity: 2,
                transparent: true,
                opacity: 0.9
            })
        );
        llama.position.y = 3.5;
        llama.visible = false;
        grupo.add(llama);
        
        const luz = new THREE.PointLight(0xFF8833, 0, 20);
        luz.position.y = 3.5;
        grupo.add(luz);
        
        grupo.position.set(pos.x, 0, pos.z);
        Juego.escena.add(grupo);
        
        grupoAula.antorchas.push({
            grupo: grupo,
            llama: llama,
            luz: luz,
            fase: Math.random() * Math.PI * 2
        });
    }
    
    Juego.antorchasAulas.push(grupoAula);
}

/*=========================================================
ACTUALIZAR ANTORCHAS DE AULAS
=========================================================*/

function actualizarAntorchasAulas(){
    
    if(!Juego.antorchasAulas) return;
    if(!Juego.jugador) return;
    
    const px = Juego.jugador.position.x;
    const pz = Juego.jugador.position.z;
    const tiempo = Date.now() * 0.005;
    
    for(const aula of Juego.antorchasAulas){
        
        const dx = px - aula.centroX;
        const dz = pz - aula.centroZ;
        const distancia = Math.sqrt(dx*dx + dz*dz);
        
        const dentro = distancia < aula.radio;
        
        if(dentro && !aula.encendidas){
            aula.encendidas = true;
        } else if(!dentro && aula.encendidas){
            aula.encendidas = false;
        }
        
        for(const antorcha of aula.antorchas){
            
            if(aula.encendidas){
                antorcha.llama.visible = true;
                
                const ruido = Math.sin(tiempo * 3 + antorcha.fase) * 0.2;
                antorcha.luz.intensity = 2.5 * (1 + ruido);
                antorcha.llama.scale.set(1 + ruido, 1 + ruido * 0.5, 1 + ruido);
            } else {
                antorcha.llama.visible = false;
                antorcha.luz.intensity = 0;
            }
        }
    }
}

/*=========================================================
AULA DE SOCIALES
=========================================================*/

function decorarAulaSociales(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 MAPA en la pared
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#B8A078";
    ctx.fillRect(0, 0, 256, 180);
    ctx.fillStyle = "#7A6B4A";
    for(let i = 0; i < 8; i++){
        ctx.beginPath();
        ctx.ellipse(Math.random() * 256, Math.random() * 180, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const mapaTextura = new THREE.CanvasTexture(canvas);
    const mapa = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 3.5),
        new THREE.MeshStandardMaterial({
            map: mapaTextura,
            side: THREE.DoubleSide,
            roughness: 0.9
        })
    );
    mapa.position.set(x - 10, 4, z + PARED.NORTE_Z + 0.3);
    Juego.escena.add(mapa);
    
    // 1 BRÚJULA GIGANTE en el suelo
    const brujula = new THREE.Mesh(
        geometriaCompartida("torus", 1.2, 0.15, 8, 24),
        new THREE.MeshStandardMaterial({
            color: 0x8B7355,
            roughness: 0.5,
            metalness: 0.7
        })
    );
    brujula.rotation.x = -Math.PI / 2;
    brujula.position.set(x + 10, 0.2, z);
    Juego.escena.add(brujula);
    
    console.log("🗺️ Aula de Sociales decorada");
}

/*=========================================================
AULA DE FÍSICA
=========================================================*/

function decorarAulaFisica(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 PÉNDULO colgante
    const cuerda = new THREE.Mesh(
        geometriaCompartida("cylinder", 0.03, 0.03, 4, 6),
        new THREE.MeshStandardMaterial({ color: 0x2A1A0F, roughness: 1 })
    );
    cuerda.position.set(x, 4, z);
    Juego.escena.add(cuerda);
    
    const esfera = new THREE.Mesh(
        geometriaCompartida("sphere", 0.5, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0x5A5A5A,
            roughness: 0.4,
            metalness: 0.9
        })
    );
    esfera.position.set(x, 2, z);
    Juego.escena.add(esfera);
    
    // 1 IMÁN GIGANTE
    const iman = new THREE.Mesh(
        geometriaCompartida("box", 0.8, 2.5, 0.8),
        new THREE.MeshStandardMaterial({
            color: 0x8A3A2A,
            roughness: 0.8,
            metalness: 0.6
        })
    );
    iman.position.set(x - 15, 1.25, z);
    Juego.escena.add(iman);
    
    console.log("⚛️ Aula de Física decorada");
}

/*=========================================================
AULA DE QUÍMICA
=========================================================*/

function decorarAulaQuimica(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 MATRAZ GIGANTE
    const matraz = new THREE.Mesh(
        geometriaCompartida("cone", 1, 2, 8),
        new THREE.MeshStandardMaterial({
            color: 0x88CCAA,
            roughness: 0.3,
            transparent: true,
            opacity: 0.6
        })
    );
    matraz.position.set(x, 1, z);
    Juego.escena.add(matraz);
    
    // 1 TABLA PERIÓDICA en la pared
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#2A1A0F";
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#E8E8D0";
    ctx.font = "bold 14px Arial";
    const elementos = ["H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca"];
    for(let i = 0; i < 20; i++){
        ctx.fillText(elementos[i], 20 + (i % 10) * 48, 40 + Math.floor(i / 10) * 40);
    }
    
    const tablaTextura = new THREE.CanvasTexture(canvas);
    const tabla = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 3),
        new THREE.MeshStandardMaterial({ map: tablaTextura, side: THREE.DoubleSide })
    );
    tabla.position.set(x, 4, z + PARED.NORTE_Z + 0.3);
    Juego.escena.add(tabla);
    
    console.log("⚗️ Aula de Química decorada");
}

/*=========================================================
AULA DE BIOLOGÍA
=========================================================*/

function decorarAulaBiologia(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 ESQUELETO ANIMAL grande
    const grupo = new THREE.Group();
    grupo.position.set(x, 0, z);
    grupo.rotation.y = Math.random() * Math.PI * 2;
    
    const matHueso = new THREE.MeshStandardMaterial({ color: 0xD4C8A8, roughness: 0.9 });
    
    const craneo = new THREE.Mesh(
        geometriaCompartida("box", 1.2, 0.7, 0.5),
        matHueso
    );
    craneo.position.y = 1;
    grupo.add(craneo);
    
    for(let i = 0; i < 8; i++){
        const vert = new THREE.Mesh(
            geometriaCompartida("cylinder", 0.12, 0.12, 0.2, 8),
            matHueso
        );
        vert.position.set(0, 0.8, -0.8 - i * 0.3);
        vert.rotation.x = Math.PI / 2;
        grupo.add(vert);
    }
    
    Juego.escena.add(grupo);
    
    console.log("🧬 Aula de Biología decorada");
}

/*=========================================================
AULA DE LENGUAJE
=========================================================*/

function decorarAulaLenguaje(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 LIBRO GIGANTE abierto
    const grupo = new THREE.Group();
    grupo.position.set(x, 0, z);
    
    const matLibro = new THREE.MeshStandardMaterial({ color: 0x4A3520, roughness: 1 });
    const matPagina = new THREE.MeshStandardMaterial({ color: 0xD4C4A8, roughness: 1 });
    
    // Tapa
    const tapa = new THREE.Mesh(
        geometriaCompartida("box", 3, 0.2, 2),
        matLibro
    );
    tapa.position.y = 0.1;
    grupo.add(tapa);
    
    // Páginas
    const paginas = new THREE.Mesh(
        geometriaCompartida("box", 2.8, 0.4, 1.8),
        matPagina
    );
    paginas.position.y = 0.3;
    grupo.add(paginas);
    
    Juego.escena.add(grupo);
    
    console.log("📖 Aula de Lenguaje decorada");
}

/*=========================================================
AULA DE INGLÉS
=========================================================*/

function decorarAulaIngles(x, z){
    
    decorarAulaComun(x, z);
    
    // Bandera UK
    const canvasUK = document.createElement("canvas");
    canvasUK.width = 128;
    canvasUK.height = 80;
    const ctxUK = canvasUK.getContext("2d");
    ctxUK.fillStyle = "#012169";
    ctxUK.fillRect(0, 0, 128, 80);
    ctxUK.fillStyle = "#FFFFFF";
    ctxUK.fillRect(55, 0, 18, 80);
    ctxUK.fillRect(0, 30, 128, 20);
    ctxUK.fillStyle = "#C8102E";
    ctxUK.fillRect(60, 0, 8, 80);
    ctxUK.fillRect(0, 35, 128, 10);
    
    const banderaUK = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 2),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(canvasUK), side: THREE.DoubleSide })
    );
    banderaUK.position.set(x - 12, 4, z + PARED.NORTE_Z + 0.3);
    Juego.escena.add(banderaUK);
    
    // Bandera USA
    const canvasUSA = document.createElement("canvas");
    canvasUSA.width = 128;
    canvasUSA.height = 80;
    const ctxUSA = canvasUSA.getContext("2d");
    for(let i = 0; i < 13; i++){
        ctxUSA.fillStyle = i % 2 === 0 ? "#B22234" : "#FFFFFF";
        ctxUSA.fillRect(0, i * 6, 128, 6);
    }
    ctxUSA.fillStyle = "#3C3B6E";
    ctxUSA.fillRect(0, 0, 50, 32);
    
    const banderaUSA = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 2),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(canvasUSA), side: THREE.DoubleSide })
    );
    banderaUSA.position.set(x + 12, 4, z + PARED.NORTE_Z + 0.3);
    Juego.escena.add(banderaUSA);
    
    console.log("🇬🇧 Aula de Inglés decorada");
}

/*=========================================================
AULA DE MATEMÁTICAS
=========================================================*/

function decorarAulaMatematicas(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 PIZARRA con fórmulas
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1A2A1A";
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#E8E8D0";
    ctx.font = "bold 32px Arial";
    ctx.fillText("∫ f(x) dx", 30, 60);
    ctx.fillText("∑ n²", 30, 110);
    ctx.fillText("√(a² + b²)", 30, 160);
    ctx.fillText("π ≈ 3.14159", 30, 210);
    
    const pizarra = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 3),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(canvas), side: THREE.DoubleSide })
    );
    pizarra.position.set(x, 4, z + PARED.NORTE_Z + 0.3);
    Juego.escena.add(pizarra);
    
    console.log("📐 Aula de Matemáticas decorada");
}

/*=========================================================
AULA DE FILOSOFÍA
=========================================================*/

function decorarAulaFilosofia(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 BUSTO GRIEGO
    const busto = new THREE.Mesh(
        geometriaCompartida("sphere", 0.7, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xD4C8A8, roughness: 0.9 })
    );
    busto.position.set(x, 2, z);
    busto.scale.set(1, 1.2, 1);
    Juego.escena.add(busto);
    
    const base = new THREE.Mesh(
        geometriaCompartida("cylinder", 0.5, 0.7, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: 0x8A7A5A, roughness: 0.9 })
    );
    base.position.set(x, 0.6, z);
    Juego.escena.add(base);
    
    console.log("🤔 Aula de Filosofía decorada");
}

/*=========================================================
AULA DE MÚSICA
=========================================================*/

function decorarAulaMusica(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 PIANO ROTO
    const grupo = new THREE.Group();
    grupo.position.set(x, 0, z);
    
    const cuerpo = new THREE.Mesh(
        geometriaCompartida("box", 3, 1, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.6 })
    );
    cuerpo.position.y = 0.5;
    grupo.add(cuerpo);
    
    // Teclas
    const geoTecla = geometriaCompartida("box", 0.15, 0.05, 0.8);
    const matBlanca = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
    const matNegra = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.5 });
    
    for(let i = 0; i < 14; i++){
        const tecla = new THREE.Mesh(geoTecla, i % 2 === 0 ? matBlanca : matNegra);
        tecla.position.set(-1.3 + i * 0.2, 1.05, -0.2);
        grupo.add(tecla);
    }
    
    Juego.escena.add(grupo);
    
    console.log("🎵 Aula de Música decorada");
}

/*=========================================================
AULA DE ARTE
=========================================================*/

function decorarAulaArte(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 CABALLETE con cuadro
    const grupo = new THREE.Group();
    grupo.position.set(x, 0, z);
    grupo.rotation.y = Math.random() * Math.PI * 2;
    
    // 3 patas
    const geoPata = geometriaCompartida("cylinder", 0.04, 0.04, 2, 6);
    const matPata = new THREE.MeshStandardMaterial({ color: 0x3D2415, roughness: 1 });
    
    for(let i = 0; i < 3; i++){
        const pata = new THREE.Mesh(geoPata, matPata);
        const ang = (i / 3) * Math.PI * 2;
        pata.position.set(Math.sin(ang) * 0.5, 1, Math.cos(ang) * 0.5);
        pata.rotation.z = Math.sin(ang) * 0.15;
        pata.rotation.x = Math.cos(ang) * 0.15;
        grupo.add(pata);
    }
    
    // Lienzo
    const lienzo = new THREE.Mesh(
        geometriaCompartida("plane", 2, 1.5),
        new THREE.MeshStandardMaterial({
            color: 0xD4C4A8,
            side: THREE.DoubleSide,
            roughness: 1
        })
    );
    lienzo.position.set(0, 2, 0);
    lienzo.rotation.x = -0.2;
    grupo.add(lienzo);
    
    Juego.escena.add(grupo);
    
    console.log("🎨 Aula de Arte decorada");
}

/*=========================================================
AULA DE EDUCACIÓN FÍSICA
=========================================================*/

function decorarAulaEducacionFisica(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 BALÓN GIGANTE
    const balon = new THREE.Mesh(
        geometriaCompartida("sphere", 0.8, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x8A3A2A, roughness: 0.9 })
    );
    balon.position.set(x - 8, 0.8, z);
    balon.castShadow = true;
    Juego.escena.add(balon);
    
    // 1 TROFEO GIGANTE
    const trofeo = new THREE.Mesh(
        geometriaCompartida("cylinder", 0.4, 0.6, 1.5, 8),
        new THREE.MeshStandardMaterial({
            color: 0xC4A030,
            roughness: 0.4,
            metalness: 0.8
        })
    );
    trofeo.position.set(x + 8, 0.75, z);
    Juego.escena.add(trofeo);
    
    console.log("⚽ Aula de Educación Física decorada");
}

/*=========================================================
AULA DE RELIGIÓN
=========================================================*/

function decorarAulaReligion(x, z){
    
    decorarAulaComun(x, z);
    
    // 1 CRUZ GRANDE en la pared
    const cruzV = new THREE.Mesh(
        geometriaCompartida("box", 0.4, 3, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x3D2415, roughness: 0.9 })
    );
    cruzV.position.set(x, 4, z + PARED.NORTE_Z + 0.3);
    Juego.escena.add(cruzV);
    
    const cruzH = new THREE.Mesh(
        geometriaCompartida("box", 2, 0.4, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x3D2415, roughness: 0.9 })
    );
    cruzH.position.set(x, 4.8, z + PARED.NORTE_Z + 0.3);
    Juego.escena.add(cruzH);
    
    // 2 VELAS
    const geoVela = geometriaCompartida("cylinder", 0.1, 0.1, 0.5, 8);
    const matVela = new THREE.MeshStandardMaterial({ color: 0xE8E0C8, roughness: 0.9 });
    
    for(let i = 0; i < 2; i++){
        const vela = new THREE.Mesh(geoVela, matVela);
        vela.position.set(x + (i === 0 ? -10 : 10), 0.25, z);
        Juego.escena.add(vela);
        
        const luz = new THREE.PointLight(0xFFAA55, 0.5, 5);
        luz.position.set(vela.position.x, 0.6, vela.position.z);
        Juego.escena.add(luz);
    }
    
    console.log("✝️ Aula de Religión decorada");
}