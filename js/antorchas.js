"use strict";

/*=========================================================
ANTORCHAS REALISTAS EN EL LABERINTO
=========================================================
Solo se dejan las 2 antorchas de la puerta de la biblioteca.
El resto se eliminó para mejorar el rendimiento.
=========================================================*/

function crearAntorchas(){
    
    const posicionesAntorchas = [
        // 🔴 SOLO 2 ANTORCHAS AFUERA DE LA BIBLIOTECA
        { x: -15, z: 80 },
        { x: 15,  z: 80 }
    ];
    
    for(const pos of posicionesAntorchas){
        crearAntorcha(pos.x, pos.z);
    }
    
    console.log("🔥 Antorchas creadas (solo puerta biblioteca):", posicionesAntorchas.length);
}

/*=========================================================
CREAR UNA ANTORCHA REALISTA
=========================================================*/

function crearAntorcha(x, z){
    
    const grupo = new THREE.Group();
    
    // 🔴 POSTE DE MADERA
    const poste = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.2, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0x3D2415, roughness: 0.95 })
    );
    poste.position.y = 2;
    poste.castShadow = true;
    grupo.add(poste);
    
    // 🔴 BASE DE PIEDRA
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.9 })
    );
    base.position.y = 0.15;
    grupo.add(base);
    
    // 🔴 CUENCO DE METAL
    const cuenco = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.4, 0.3, 12),
        new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.6, metalness: 0.7 })
    );
    cuenco.position.y = 4.1;
    grupo.add(cuenco);
    
    // 🔴 TRES LLAMAS
    const llamaExterior = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0xFF6600, emissive: 0xFF6600, emissiveIntensity: 1.5, transparent: true, opacity: 0.6 })
    );
    llamaExterior.position.y = 4.8;
    grupo.add(llamaExterior);
    
    const llamaMedia = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFAA00, emissive: 0xFFAA00, emissiveIntensity: 2, transparent: true, opacity: 0.8 })
    );
    llamaMedia.position.y = 4.7;
    grupo.add(llamaMedia);
    
    const llamaInterior = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.6, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFEE88, emissive: 0xFFEE88, emissiveIntensity: 3, transparent: true, opacity: 1 })
    );
    llamaInterior.position.y = 4.6;
    grupo.add(llamaInterior);
    
    // 🔴 LUZ PRINCIPAL
    const luz = new THREE.PointLight(0xFF8833, 3, 30);
    luz.position.y = 4.8;
    grupo.add(luz);
    
    // 🔴 LUZ SECUNDARIA
    const luz2 = new THREE.PointLight(0xFFAA55, 1.5, 15);
    luz2.position.y = 5.5;
    grupo.add(luz2);
    
    // 🔴 CHISPAS
    const chispas = [];
    for(let i = 0; i < 5; i++){
        const chispa = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 4, 4),
            new THREE.MeshBasicMaterial({ color: 0xFFAA00, transparent: true, opacity: 0.8 })
        );
        chispa.position.y = 4.8;
        chispa.userData.offsetY = Math.random() * 1.5;
        chispa.userData.offsetX = (Math.random() - 0.5) * 0.3;
        chispa.userData.offsetZ = (Math.random() - 0.5) * 0.3;
        chispa.userData.velocidad = 0.01 + Math.random() * 0.02;
        chispa.userData.fase = Math.random() * Math.PI * 2;
        grupo.add(chispa);
        chispas.push(chispa);
    }
    
    grupo.position.set(x, 0, z);
    Juego.escena.add(grupo);
    
    if(!Juego.antorchas) Juego.antorchas = [];
    
    Juego.antorchas.push({
        grupo: grupo,
        llamaExterior: llamaExterior,
        llamaMedia: llamaMedia,
        llamaInterior: llamaInterior,
        luz: luz,
        luz2: luz2,
        chispas: chispas,
        fase: Math.random() * Math.PI * 2
    });
}

/*=========================================================
ANIMAR ANTORCHAS (parpadeo realista)
=========================================================*/

function animarAntorchas(){
    
    if(!Juego.antorchas) return;
    
    const tiempo = Date.now() * 0.005;
    
    for(const antorcha of Juego.antorchas){
        
        const ruido = Math.sin(tiempo * 3 + antorcha.fase) * 0.15
                    + Math.sin(tiempo * 7 + antorcha.fase * 2) * 0.1
                    + Math.random() * 0.05;
        
        const parpadeo = 1 + ruido;
        
        antorcha.luz.intensity = 3 * parpadeo;
        antorcha.luz2.intensity = 1.5 * parpadeo;
        
        const escalaX = 0.9 + ruido;
        const escalaY = 1 + ruido * 0.8;
        const escalaZ = 0.9 + ruido;
        
        antorcha.llamaExterior.scale.set(escalaX, escalaY, escalaZ);
        antorcha.llamaMedia.scale.set(escalaX * 0.95, escalaY * 0.95, escalaZ * 0.95);
        antorcha.llamaInterior.scale.set(escalaX * 1.05, escalaY * 1.05, escalaZ * 1.05);
        
        antorcha.llamaExterior.position.x = Math.sin(tiempo * 2 + antorcha.fase) * 0.05;
        antorcha.llamaExterior.position.z = Math.cos(tiempo * 2 + antorcha.fase) * 0.05;
        antorcha.llamaMedia.position.x = Math.sin(tiempo * 2.5 + antorcha.fase) * 0.04;
        antorcha.llamaMedia.position.z = Math.cos(tiempo * 2.5 + antorcha.fase) * 0.04;
        antorcha.llamaInterior.position.x = Math.sin(tiempo * 3 + antorcha.fase) * 0.03;
        antorcha.llamaInterior.position.z = Math.cos(tiempo * 3 + antorcha.fase) * 0.03;
        
        for(const chispa of antorcha.chispas){
            chispa.userData.fase += chispa.userData.velocidad;
            chispa.position.y = 4.8 + Math.sin(chispa.userData.fase) * 0.8;
            chispa.position.x = chispa.userData.offsetX + Math.sin(chispa.userData.fase * 2) * 0.1;
            chispa.position.z = chispa.userData.offsetZ + Math.cos(chispa.userData.fase * 2) * 0.1;
            chispa.material.opacity = 0.3 + Math.sin(chispa.userData.fase * 3) * 0.5;
            
            if(chispa.position.y > 5.8){
                chispa.position.y = 4.8;
                chispa.userData.fase = 0;
            }
        }
    }
}
