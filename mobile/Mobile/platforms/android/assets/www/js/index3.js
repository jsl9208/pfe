/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with app work for additional information
 * regarding copyright ownership.  The ASF licenses app file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use app file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 /* Add animation to the UI using a WebGL Framework: Three.js */

var container;
var camera, group, particle;
var scene, sceneCss;
var renderer, cssRenderer;
//var mouseX = 0, mouseY = 0;
var iW = window.innerWidth;
var iH = window.innerHeight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var cssObject;
var planeMesh;
var planeMesh2;
var target;
var xPos, yPos;
var idAnimation;
var requestID; //requestAnimationFrame ID

var IPaddress = '192.168.42.1:8081';
//var port = '8081';
var oscPort;
var watchID;

function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    //calculate the visible rectangular region given the camera's field-of-view
    //mettre une bordure rouge pour bien visualiser sur écran
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
    camera.position.z = 600; //cas idéal boule=600; - pour bien visualiser planeMesh mettre =800

    scene = new THREE.Scene();
    sceneCss = new THREE.Scene();
    sceneCss2 = new THREE.Scene();

    group = new THREE.Group();
    scene.add( group );
    addSpritesInGroup(group);

    // target = new Image();
    // target.src = "../img/sprite.png";
    // xPos = (window.innerWidth-target.width)/2;
    // yPos = (window.innerHeight-target.height)/2;

    // create the plane mesh
    // note: - material: defining the object's appearance - geometry: defining the object's structure.
    var material = new THREE.MeshBasicMaterial({ wireframe: true });
    //var geometry = new THREE.PlaneGeometry(window.innerWidth , (2/3)*window.innerHeight); //le rajout dans dimensions permet de visualiser le plan
    var geometry = new THREE.PlaneGeometry(); //sans dim, on ne voit pas le plan sur l'écran
    planeMesh = new THREE.Mesh( geometry, material );
    // planeMesh.position.x = xPos;
    // planeMesh.position.y = (1/3)*window.innerHeight;
    //document.getElementById('motion').innerText = "xPlane:" + planeMesh.position.x + " yPlane:" + planeMesh.position.y;
    scene.add( planeMesh );

    // get the dom Element
    var element = document.getElementById('show');
    cssObject = new THREE.CSS2DObject( element );
    // we reference the same position and rotation
    cssObject.position.x = planeMesh.position.x;
    cssObject.position.y = planeMesh.position.y;
    //document.getElementById('motion2').innerText = "xObject:" + cssObject.position.x + " yObject:" + cssObject.position.y;
    //cssObject.rotation = planeMesh.rotation;
    // add it to the css scene
    sceneCss.add( cssObject );

    //second PlaneGeometry: obligatoire pour pouvoir appuyer sur le bouton !! 
    //var geometry2 = new THREE.PlaneGeometry(window.innerWidth , window.innerHeight/6);
    var geometry2 = new THREE.PlaneGeometry();
    planeMesh2 = new THREE.Mesh( geometry2, material );
    planeMesh2.position.y = -(2/3)*window.innerHeight;
    scene.add( planeMesh2 );
    
    //create button DOM element
    var button = document.createElement( 'button' );
    button.innerHTML = "Settings";
    cssObject2 = new THREE.CSS2DObject( button );
    cssObject2.position.x = planeMesh2.position.x;
    cssObject2.position.y = planeMesh2.position.y;
    sceneCss.add( cssObject2 );

    createRenderers();

    window.addEventListener( 'resize', onWindowResize, false );
    button.addEventListener("click", generatePopUp);
    //addEventListener to restart button in pop-up
    var restartButton = document.getElementById('restart');
    restartButton.addEventListener("click", restartApplication);

}

function addSpritesInGroup(group) {
    var PI2 = Math.PI * 2;
    var program = function ( context ) {
        context.beginPath();
        context.arc( 0, 0, 0.5, 0, PI2, true );
        context.fill();
    }
    for ( var i = 0; i < 200; i++ ) {
        var material = new THREE.SpriteCanvasMaterial( {
            color: Math.random() * 0x808008 + 0x808080,
            program: program
            } );
        particle = new THREE.Sprite( material );
        particle.position.x = Math.random() * 2000 - 1000;
        particle.position.y = Math.random() * 2000 - 1000;
        particle.position.z = Math.random() * 2000 - 1000;
        particle.scale.x = particle.scale.y = Math.random() * 20 + 10;
        group.add( particle );
    }
}

function createRenderers() {
    renderer = new THREE.CanvasRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    cssRenderer = new THREE.CSS2DRenderer();
    cssRenderer.setSize( window.innerWidth, window.innerHeight ); /* MODIF ICI pour placer la boule plus en haut ex!!! */
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    container.appendChild( cssRenderer.domElement );
}

function createScenes() {
    scene = new THREE.Scene();
    sceneCss = new THREE.Scene();
}

function animate() {
    requestID = requestAnimationFrame( animate );
    //document.getElementById('motion').innerText = "requestID" + requestID;
    render();
}

function render() {
    //calculate the visible rectangular region given the camera's field-of-view
    //mettre une bordure rouge pour bien visualiser sur écran

    /* A QUOI CA CORRESPOND ? */
    //camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    //camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
    camera.lookAt( scene.position );
    group.rotation.x += 0.01;
    group.rotation.y += 0.02;
    renderer.render( scene, camera );
    cssRenderer.render( sceneCss, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    cssRenderer.setSize( window.innerWidth, window.innerHeight );
}

var app = {

    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        app.getAcceleration(IPaddress);
    },

    getAcceleration: function(IPaddress) {
        $(function() {
            var deviceID = device.uuid;
            var cnt = 0;
            //var addr = 'ws://192.168.42.1:8081';
            var addr = 'ws://' + IPaddress;
            //document.getElementById('motion2').innerText = "IP in getAcceleration " + addr;

            //document.getElementById('motion').innerText = "urlServer" + urlServer.toString();

            oscPort = new osc.WebSocketPort({
                url: addr // URL to your Web Socket server.
            });
            oscPort.open();

            setTimeout(function() {
                var onSuccess = function (acceleration) {
                    updateAnimation(acceleration);
                    //$('#description').html('Acceleration X: ' + acceleration.x + '<br>' + 'Acceleration Y: ' + acceleration.y + '<br>' + 'Acceleration Z: ' + acceleration.z + '<br>' + 'Timestamp: '      + acceleration.timestamp + '<br>');
                    if (oscPort.readyState === oscPort.OPEN) {
                        oscPort.send({
                            timeTag: osc.timeTag(10),
                            packets: [
                                {
                                    address: "/acceleration/id/x/y/z",
                                    args: [deviceID, acceleration.x, acceleration.y, acceleration.z]
                                }
                            ]
                        });
                        cnt++;
                    } else {
                        delete oscPort;
                        oscPort = new osc.WebSocketPort({
                            url: addr // URL to your Web Socket server.
                        });
                        oscPort.open()
                    }

                };
                watchID = navigator.accelerometer.watchAcceleration(onSuccess, function() {}, { frequency: 20 });
            }, 1000);

        });
    },
    
};

app.initialize();

init();
animate();


/* Move the central sprite around the screen when acceleration values change */
function updateAnimation(acceleration) {

    //il faut récupérer ces données là pour voir si on est en mode portrait ou landscape
    var ball = new Image();
    ball.src = "../img/sprite.png";
    var xRadius = (ball.width)/2;
    var yRadius = (ball.height)/2;
    var W = window.innerWidth;
    var H = window.innerHeight;

    var dx = 0;
    var dy = 0;
    var newxPos = 0;
    var newyPos = 0;

    var oldxPos = cssObject.position.x;
    var oldyPos = cssObject.position.y;
    //document.getElementById('motion').innerText = "Old xPos:" + oldxPos + " Old yPos:" + oldyPos;

    dx = -1*(acceleration.x * 1.5);
    dy = -1*(acceleration.y * 1.5);
    //document.getElementById('motion').innerText = "dx:" + dx + " dy:" + dy;

    if (window.matchMedia("(orientation: portrait)").matches) {
        //on est en mode portrait
        newxPos = oldxPos + dx;
        newyPos = oldyPos + dy;
        if ((Math.abs(newxPos) + xRadius) > W/2) { dx=0; }
            if (newyPos > 0) {
                if ((Math.abs(newyPos) + yRadius) > H/2) { dy=0; }
            } else {
                if ((Math.abs(newyPos) + yRadius) > (3/8)*H) { dy=0; } //H/3=(2/3)*H/2
            }
        //document.getElementById('motion2').innerText = "dx:" + dx + " dy:" + dy;
        cssObject.translateOnAxis( new THREE.Vector3(dx, dy, 0).normalize(), 5 );
        //document.getElementById('motion3').innerText = "New xPos:" + cssObject.position.x + " New yPos:" + cssObject.position.y;

    } else if (window.matchMedia("(orientation: landscape)").matches) {
        //en mode landscape: on inverse les axes
        // newxPos = oldyPos + yRadius + dy;
        // newyPos = - (oldxPos + xRadius + dx);
        // if ((Math.abs(newxPos) + xRadius) > iW/2) { dx=0; }
        // if ((Math.abs(newyPos) + yRadius) > iH/2) { dy=0; }
        // document.getElementById('motion2').innerText = "dx:" + dx + " dy:" + dy;
        // cssObject.translateOnAxis( new THREE.Vector3(-dy, dx, 0).normalize(), 1 );
        // document.getElementById('motion3').innerText = "New xPos:" + cssObject.position.x + " New yPos:" + cssObject.position.y;
    }
}
/* Methods related to pop-up */

function generatePopUp() {
    /* SI ON UTILISE LE WINDOW.PROMPT HTML */
    /*  var IPaddress = prompt("Please enter the new client's IP address", " ");
    if (IPaddress != null) {
        //document.getElementById('motion').innerText ="New IP address " + IPaddress;
    }*/
    popup('popUpDiv');
    //display IP address without port:
    var res = IPaddress.split(":");
    var addressWithoutPort = res[0];
    document.getElementById('currentIPaddress').innerText = "Current IP address : " + addressWithoutPort;
}

socketPort.on("close", function () {
     relay.close();
});

function restartApplication() {
    var newIPaddress = document.getElementById('newIPaddress').value;

    //stop watching acceleration
    if (watchID) {
        navigator.accelerometer.clearWatch(watchID);
    }
    //delete WebSocket
    delete oscPort;
    //put the central ball back to the initial position
    cssObject.position.x = planeMesh.position.x;
    cssObject.position.y = planeMesh.position.y;
    //close pop up
    popup('popUpDiv');
    //reset input to blank
    document.getElementById('newIPaddress').value = "";
    
    if (newIPaddress== null || newIPaddress=="") {
        //getAcceleration with old IP @
        app.getAcceleration(IPaddress);

    } else {
        var port = ':8081';
        IPaddress = newIPaddress + port;
        //getAcceleration with new IP @
        app.getAcceleration(IPaddress);
    }
}

/* Code for the designed and modern pop-up window */

function toggle(div_id) {
    var el = document.getElementById(div_id);
    if ( el.style.display == 'none' ) { el.style.display = 'block';}
    else {el.style.display = 'none';}
}

function popup(windowname) {
    blanket_size(windowname);
    window_pos(windowname);
    toggle('blanket');
    toggle(windowname);     
}

//Les deux fonctions suivantes à revoir!!!
function blanket_size(popUpDivVar) {
    if (typeof window.innerWidth != 'undefined') {
        viewportheight = window.innerHeight;
    } else {
        viewportheight = document.documentElement.clientHeight;
    }
    if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
        blanket_height = viewportheight;
    } else {
        if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
            blanket_height = document.body.parentNode.clientHeight;
        } else {
            blanket_height = document.body.parentNode.scrollHeight;
        }
    }
    var blanket = document.getElementById('blanket');
    blanket.style.height = blanket_height + 'px';
    var popUpDiv = document.getElementById(popUpDivVar);
    popUpDiv_height=blanket_height/2-200;//200 is half popup's height
    popUpDiv.style.top = popUpDiv_height + 'px';
}

function window_pos(popUpDivVar) {
    if (typeof window.innerWidth != 'undefined') {
        viewportwidth = window.innerWidth; //window.innerHeight;
    } else {
        viewportwidth = document.documentElement.clientHeight;
    }
    if ((viewportwidth > document.body.parentNode.scrollWidth) && (viewportwidth > document.body.parentNode.clientWidth)) {
        window_width = viewportwidth;
    } else {
        if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
            window_width = document.body.parentNode.clientWidth;
        } else {
            window_width = document.body.parentNode.scrollWidth;
        }
    }
    var popUpDiv = document.getElementById(popUpDivVar);
    window_width=window_width/2-200;//200 is half popup's width
    popUpDiv.style.left = window_width + 'px';
}


