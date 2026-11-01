"use strict";

/*=========================================================
DECORACIÓN DE AULAS - VERSIÓN ULTRA LIGERA
=========================================================*/

const PARED = {
    NORTE_Z: -20, SUR_Z: 20, ESTE_X: 25, OESTE_X: -25
};

function decorarAulas(){
    registrarAulaDinamica("sociales",        -100, 140,  decorarAulaBasica);
    registrarAulaDinamica("fisica",          -240, 120,  decorarAulaBasica);
    registrarAulaDinamica("quimica",         -200, 0,    decorarAulaBasica);
    registrarAulaDinamica("biologia",        -240, -120, decorarAulaBasica);
    registrarAulaDinamica("lenguaje",        -60,  -240, decorarAulaBasica);
    registrarAulaDinamica("ingles",          200,  -220, decorarAulaBasica);
    registrarAulaDinamica("matematicas",     -200, -220, decorarAulaBasica);
    registrarAulaDinamica("filosofia",       200,  0,    decorarAulaBasica);
    registrarAulaDinamica("musica",          240,  120,  decorarAulaBasica);
    registrarAulaDinamica("arte",            -160, -150, decorarAulaBasica);
    registrarAulaDinamica("educacionfisica", 220,  220,  decorarAulaBasica);
    registrarAulaDinamica("religion",        240,  -120, decorarAulaBasica);
    console.log("🏫 12 aulas registradas (ultra ligera)");
}

function decorarAulaBasica(x, z){
    // 8 PUPITRES ROTOS
    for(let i = 0; i < 8; i++){
        const offsetX = (Math.random() - 0.5) * 36;
        const offsetZ = (Math.random() - 0.5) * 26;
        crearPupitreRoto(x + offsetX, z + offsetZ, Math.random() * Math.PI * 2);
    }
    
    // 4 ANTORCHAS
    crearAntorchasAula(x, z);
    console.log("📚 Aula básica decorada en:", x, z);
}

function crearPupitreRoto(x, z, rotacion){
    const grupo = new THREE.Group();
    grupo.position.set(x, 0, z);
    grupo.rotation.y = rotacion;
    
    const geoTablero = geometriaCompartida("box", 1.2, 0.1, 0.8);
    const geoPata = geometriaCompartida("box", 0.08, 0.7, 0.08);
    const matTablero = new THREE.MeshStandardMaterial({ color: 0x2a1a0f, roughness: 1 });
    const matPata = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95, metalness: 0.4 });
    
    const tablero = new THREE.Mesh(geoTablero, matTablero);
    tablero.position.y = 0.7;
    tablero.rotation.z = (Math.random() - 0.5) * 0.6;
    tablero.rotation.x = (Math.random() - 0.5) * 0.3;
    tablero.castShadow = true;
    grupo.add(tablero);
    
    const patasActivas = Math.floor(Math.random() * 3) + 1;
    const posicionesPatas = [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]];
    posicionesPatas.sort(() => Math.random() - 0.5);
    
    for(let i = 0; i < patasActivas; i++){
        const pata = new THREE.Mesh(geoPata, matPata);
        pata.position.set(posicionesPatas[i][0], 0.35, posicionesPatas[i][1]);
        pata.rotation.z = (Math.random() - 0.5) * 0.4;
        grupo.add(pata);
    }
    
    for(let i = patasActivas; i < 4; i++){
        const pataRota = new THREE.Mesh(geoPata, matPata);
        pataRota.position.set(posicionesPatas[i][0] + (Math.random() - 0.5) * 1.5, 0.05, posicionesPatas[i][1] + (Math.random() - 0.5) * 1.5);
        pataRota.rotation.set(Math.PI / 2, Math.random() * Math.PI, Math.random() * Math.PI);
        grupo.add(pataRota);
    }
    Juego.escena.add(grupo);
}

function crearAntorchasAula(x, z){
    const posiciones = [{ x: x - 22, z: z - 17 }, { x: x + 22, z: z - 17 }, { x: x - 22, z: z + 17 }, { x: x + 22, z: z + 17 }];
    if(!Juego.antorchasAulas) Juego.antorchasAulas = [];
    
    const grupoAula = { centroX: x, centroZ: z, radio: 30, encendidas: false, antorchas: [] };
    
    for(const pos of posiciones){
        const grupo = new THREE.Group();
        const geoPoste = geometriaCompartida("cylinder", 0.1, 0.15, 3, 8);
        const poste = new THREE.Mesh(geoPoste, new THREE.MeshStandardMaterial({ color: 0x3D2415, roughness: 0.95 }));
        poste.position.y = 1.5;
        grupo.add(poste);
        
        const geoLlama = geometriaCompartida("cone", 0.3, 0.8, 8);
        const llama = new THREE.Mesh(geoLlama, new THREE.MeshStandardMaterial({ color: 0xFF6600, emissive: 0xFF6600, emissiveIntensity: 2, transparent: true, opacity: 0.9 }));
        llama.position.y = 3.5;
        llama.visible = false;
        grupo.add(llama);
        
        const luz = new THREE.PointLight(0xFF8833, 0, 20);
        luz.position.y = 3.5;
        grupo.add(luz);
        
        grupo.position.set(pos.x, 0, pos.z);
        Juego.escena.add(grupo);
        grupoAula.antorchas.push({ grupo, llama, luz, fase: Math.random() * Math.PI * 2 });
    }
    Juego.antorchasAulas.push(grupoAula);
}

function actualizarAntorchasAulas(){
    if(!Juego.antorchasAulas || !Juego.jugador) return;
    const px = Juego.jugador.position.x;
    const pz = Juego.jugador.position.z;
    const tiempo = Date.now() * 0.005;
    
    for(const aula of Juego.antorchasAulas){
        const dx = px - aula.centroX;
        const dz = pz - aula.centroZ;
        const dentro = Math.sqrt(dx*dx + dz*dz) < aula.radio;
        
        if(dentro && !aula.encendidas) aula.encendidas = true;
        else if(!dentro && aula.encendidas) aula.encendidas = false;
        
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
