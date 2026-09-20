"use strict";

/*=========================================================
GUÍA DE BIBLIOTECA (VERSIÓN CORREGIDA)
=========================================================*/

function crearGuiaBiblioteca(){

    const panel = new THREE.Mesh(
        new THREE.BoxGeometry(12, 7, 0.5),
        new THREE.MeshStandardMaterial({
            color: 0xd4b48c,
            roughness: 0.7
        })
    );
    panel.position.set(0, 4, -65);
    Juego.escena.add(panel);

    const marco = new THREE.Mesh(
        new THREE.BoxGeometry(12.6, 7.6, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x8B5A2B })
    );
    marco.position.set(0, 4, -65.1);
    Juego.escena.add(marco);

    const letrero = new THREE.Mesh(
        new THREE.BoxGeometry(8, 2.5, 0.3),
        new THREE.MeshStandardMaterial({
            color: 0x2E8B57,
            emissive: 0x2E8B57,
            emissiveIntensity: 0.3
        })
    );
    letrero.position.set(0, 8, -65);
    Juego.escena.add(letrero);

    const zona = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 8, 8),
        new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.4,
            emissive: 0x00ff88,
            emissiveIntensity: 0.5
        })
    );
    zona.position.set(0, 0.5, -63);
    Juego.escena.add(zona);

    const anillo = new THREE.Mesh(
        new THREE.RingGeometry(1.5, 2.5, 32),
        new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        })
    );
    anillo.rotation.x = -Math.PI / 2;
    anillo.position.set(0, 0.1, -63);
    Juego.escena.add(anillo);

    console.log("📖 Guía de biblioteca creada");
}