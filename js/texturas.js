"use strict";

/*=========================================================
SISTEMA DE TEXTURAS
=========================================================*/

// 🔴 OBJETO GLOBAL DE TEXTURAS
let Texturas = {
    ladrillo: null,
    cemento: null,
    madera: null,
    yeso: null,
    cargadas: false
};

/*=========================================================
CARGAR TODAS LAS TEXTURAS
=========================================================*/

function cargarTexturas(callback){
    
    const loader = new THREE.TextureLoader();
    let cargadas = 0;
    const total = 4;
    
    function verificar(){
        cargadas++;
        if(cargadas >= total){
            Texturas.cargadas = true;
            console.log("✅ Todas las texturas cargadas");
            if(callback) callback();
        }
    }
    
    // 🔴 LADRILLO
    loader.load(
        "assets/ladrillo.jpg",
        function(textura){
            textura.wrapS = THREE.RepeatWrapping;
            textura.wrapT = THREE.RepeatWrapping;
            textura.repeat.set(2, 2);
            Texturas.ladrillo = textura;
            console.log("✅ Textura: ladrillo");
            verificar();
        },
        undefined,
        function(error){
            console.error("❌ Error cargando ladrillo:", error);
            verificar();
        }
    );
    
    // 🔴 CEMENTO
    loader.load(
        "assets/cemento.jpg",
        function(textura){
            textura.wrapS = THREE.RepeatWrapping;
            textura.wrapT = THREE.RepeatWrapping;
            textura.repeat.set(50, 50);
            Texturas.cemento = textura;
            console.log("✅ Textura: cemento");
            verificar();
        },
        undefined,
        function(error){
            console.error("❌ Error cargando cemento:", error);
            verificar();
        }
    );
    
    // 🔴 MADERA
    loader.load(
        "assets/madera.jpg",
        function(textura){
            textura.wrapS = THREE.RepeatWrapping;
            textura.wrapT = THREE.RepeatWrapping;
            textura.repeat.set(1, 1);
            Texturas.madera = textura;
            console.log("✅ Textura: madera");
            verificar();
        },
        undefined,
        function(error){
            console.error("❌ Error cargando madera:", error);
            verificar();
        }
    );
    
    // 🔴 YESO
    loader.load(
        "assets/yeso.jpg",
        function(textura){
            textura.wrapS = THREE.RepeatWrapping;
            textura.wrapT = THREE.RepeatWrapping;
            textura.repeat.set(3, 3);
            Texturas.yeso = textura;
            console.log("✅ Textura: yeso");
            verificar();
        },
        undefined,
        function(error){
            console.error("❌ Error cargando yeso:", error);
            verificar();
        }
    );
}