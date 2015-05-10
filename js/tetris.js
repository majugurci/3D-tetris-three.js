/**
 * Created by Mario on 13.1.2015..
 */
 

window.Tetris = window.Tetris || {};

window.Tetris2 = window.Tetris2 || {};

window.addEventListener("load", init);

// time in ms, how long it takes for piece to move
// TODO as time in game passes it is being shortened
Tetris.gameStepTime = 1000;
// time in ms, how long it passes from one call to requestAnimationFrame to another
Tetris.frameTime = 0;   // ms
// time in ms, sum of frameTimes, when it reaches gameStepTime it is being reset and piece is being moved
Tetris.cumulatedFrameTime = 0;  // ms
// timestamp, for storing time of last call to requestAnimationFrame
Tetris._lastFrameTime = 0;  // timestamp
// time in ms, sum of frameTimes, when it reaches changeSpeedTime it is being reset and speed is increasing
Tetris.cumulatedSpeedTime = 0;
// time in ms, how long before the speed is increased
Tetris.gameSpeedtime = 60000;

Tetris.gameOver = false;

Tetris.pause = false;

/**
 * Initialization of main values used in program
 * Canvases are created
 */
function init() {

    $('#play_button').click(function () {
        $('html, body').animate({scrollTop: $('#game_container').offset().top}, 'slow');
        start();
    });

    Tetris.setPieceHeight(0);

    var threeContainer = $('#three-container');

    // width and height of div containing tetris game
    var WIDTH = threeContainer.width(),
        HEIGHT = $(window).height() - 100;

    // camera
    var VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;

    // creating the main canvas object
    Tetris.renderer = new THREE.WebGLRenderer();
    Tetris.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    Tetris.scene = new THREE.Scene();

    Tetris.camera.position.z = 800;
    Tetris.scene.add(Tetris.camera);

    Tetris.renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    threeContainer.append(Tetris.renderer.domElement);


    // creating small canvas object for showing next piece
    var threeContainerNext = $('#three-container-iduci');
    var WIDTH_NEXT = threeContainerNext.width(),
        HEIGHT_NEXT = WIDTH_NEXT;

    Tetris2.renderer = new THREE.WebGLRenderer();
    Tetris2.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, WIDTH_NEXT / HEIGHT_NEXT, NEAR, FAR);
    Tetris2.scene = new THREE.Scene();
    Tetris2.camera.position.z = 800;
    Tetris2.scene.add(Tetris2.camera);

    Tetris2.renderer.setSize(WIDTH_NEXT, HEIGHT_NEXT);
    threeContainerNext.append(Tetris2.renderer.domElement);
    Tetris2.renderer.render(Tetris2.scene, Tetris2.camera);


    var BC = new boxConfig();
    setTerrain(BC);

};

/**
 * Making of a boundingBox object and applying it to scene
 * @param BC
 */
function setTerrain(BC) {
    Tetris.boundingBoxConfig = BC;
    Tetris.blockSize = BC.width / BC.splitX;

    Tetris.Board.init(BC.splitX, BC.splitY, BC.splitZ);

    var texture1 = THREE.ImageUtils.loadTexture('images/plocica.png', {}, function () {
        Tetris.renderer.render(Tetris.scene, Tetris.camera);
    });

    var texture2 = THREE.ImageUtils.loadTexture('images/plocica.png', {}, function () {
        Tetris.renderer.render(Tetris.scene, Tetris.camera);
    });

    var texture3 = THREE.ImageUtils.loadTexture('images/plocica.png', {}, function () {
        Tetris.renderer.render(Tetris.scene, Tetris.camera);
    });


    texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
    texture1.repeat.set(BC.splitX, BC.splitX);
    texture1.needsUpdate = true;

    texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
    texture2.repeat.set(BC.splitX, 20);
    texture2.needsUpdate = true;

    texture3.wrapS = texture3.wrapT = THREE.RepeatWrapping;
    texture3.repeat.set(20, BC.splitX);
    texture3.needsUpdate = true;

    texture1.anisotropy = Tetris.renderer.getMaxAnisotropy();
    texture2.anisotropy = Tetris.renderer.getMaxAnisotropy();
    texture3.anisotropy = Tetris.renderer.getMaxAnisotropy();


    var materials = [
        new THREE.MeshBasicMaterial({map: texture3, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: texture3, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: texture2, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: texture2, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: texture1, side: THREE.BackSide}),
        new THREE.MeshBasicMaterial({map: texture1, side: THREE.BackSide})

    ];

    var boundingBox = new THREE.Mesh(
        new THREE.BoxGeometry(BC.width, BC.height, BC.depth, BC.splitX, BC.splitY, BC.splitZ),
        new THREE.MeshFaceMaterial(materials)
    );

    Tetris.scene.add(boundingBox);
    Tetris.boundingBox = boundingBox;
}


/**
 * Object for defining main box in which tetris is played
 * @param w width
 * @param h height
 * @param d depth
 * @param x number of slices on x
 * @param y number of slices on y
 * @param z number of slices on z
 */
var boxConfig = function (w, h, d, x, y, z) {
    this.width = w || 360;
    this.height = h || 360;
    this.depth = d || 1200;
    this.splitX = x || 6;
    this.splitY = y || 6;
    this.splitZ = z || 20;
}


/**
 * After everything is initialised we can start the game loop
 */
function start() {

    Tetris.pointsDOM = $('#points');

    var number = $('input:radio[name=boardSize]:checked').val();

    // if input is not equal to default 6 create new terain
    if (number != 6) {
        Tetris.scene.remove(Tetris.boundingBox);
        var BC = new boxConfig(number * 60, number * 60, null, number, number, null);
        setTerrain(BC);
    }



    $('#play_game').hide();


    window.setTimeout(continueAfterCoffe, 100);
};

/**
 * For some reason (possibly because of a use of textures to create bounding box - asynchronous calls)
 * program wont work properly unless short pause is provided (therefore name of a function)
 */
function continueAfterCoffe() {
    Tetris.Block.generate();
    Tetris._lastFrameTime = Date.now();
    animate();
}

/**
 * Loading of images for setting a "status bar" next to a main game
 * These images are used to indicate on which slice is highest piece located
 * @param n
 */
Tetris.setPieceHeight = function (n) {

    var width = $('#pieces-height').width();
    var height = $(window).height() - 100;

    $("#pieces-height").width(width).height(height);

    var imgName = "images/pieceHeight/pic" + n + ".png";

    $('#pieces-height').css('background-image', 'url(' + imgName + ')');

    var size = width + "px " + height + "px";

    $('#pieces-height').css({
        'background-size': size
    });
}

/**
 * recursive function for measuring elapsed time and lowering piece step by step
 */
var count = 1;
function animate() {
    if (!Tetris.pause) {
        var time = Date.now();
        Tetris.frameTime = time - Tetris._lastFrameTime;
        Tetris._lastFrameTime = time;

        Tetris.cumulatedFrameTime += Tetris.frameTime;
        Tetris.cumulatedSpeedTime += Tetris.frameTime;


         if (Tetris.cumulatedFrameTime > Tetris.gameStepTime) {
             Tetris.cumulatedFrameTime = 0;
             Tetris.Block.move(0, 0, -1);
         }

        // if there is available speed (1-10) and it has passed enough time, increase speed
        if (count < 10 && Tetris.cumulatedSpeedTime > Tetris.gameSpeedtime) {
            Tetris.cumulatedSpeedTime = 0;
            Tetris.gameStepTime -= 100;
            count++;
            $('#speed').text("Speed: " + count);
        }

        Tetris.renderer.render(Tetris.scene, Tetris.camera);
    }


    if (!Tetris.gameOver) window.requestAnimationFrame(animate);
};

Tetris.staticBlocks = [];
Tetris.staticBlocksEdges = [];
Tetris.zColors = [
    0x6666ff, 0x66ffff, 0xcc68EE, 0x666633, 0x66ff66, 0x9966ff, 0x00ff66, 0x66EE33, 0x003399,
    0x330099, 0xFFA500, 0x99ff00, 0xee1289, 0x71C671, 0x00BFFF, 0x666633, 0x669966, 0x9966ff
];

/**
 * After piece is lowered to the bottom it is being separated into small cubes
 * @param x
 * @param y
 * @param z
 */
Tetris.addStaticBlock = function (x, y, z) {
    if (Tetris.staticBlocks[x] === undefined) {
        Tetris.staticBlocks[x] = [];
        Tetris.staticBlocksEdges[x] = [];
    }
    if (Tetris.staticBlocks[x][y] === undefined) {
        Tetris.staticBlocks[x][y] = [];
        Tetris.staticBlocksEdges[x][y] = [];
    }

    var mesh = new THREE.Mesh(new THREE.BoxGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize),
        new THREE.MeshBasicMaterial({color: Tetris.zColors[z]})
    )

    mesh.position.x = (x - Tetris.boundingBoxConfig.splitX / 2) * Tetris.blockSize + Tetris.blockSize / 2;
    mesh.position.y = (y - Tetris.boundingBoxConfig.splitY / 2) * Tetris.blockSize + Tetris.blockSize / 2;
    mesh.position.z = (z - Tetris.boundingBoxConfig.splitZ / 2) * Tetris.blockSize + Tetris.blockSize / 2;

    Tetris.scene.add(mesh);
    Tetris.staticBlocks[x][y][z] = mesh;

    var edge = new THREE.EdgesHelper(mesh, 0x000000);
    //var edge = new THREE.EdgesHelper( mesh, 0xffffff);
    edge.material.linewidth = 2;

    Tetris.scene.add(edge);
    Tetris.staticBlocksEdges[x][y][z] = edge;
};


Tetris.currentPoints = 0;
Tetris.addPoints = function (n) {
    Tetris.currentPoints += n;
    Tetris.pointsDOM.text("POINTS: " + Tetris.currentPoints);
};


window.addEventListener('keydown', function (event) {
    var key = event.which ? event.which : event.keyCode;

    switch (key) {
        case 38: // up (arrow)
            event.preventDefault();
            Tetris.Block.move(0, 1, 0);
            break;
        case 40: // down (arrow)
            event.preventDefault();
            Tetris.Block.move(0, -1, 0);
            break;
        case 37: // left(arrow)
            event.preventDefault();
            Tetris.Block.move(-1, 0, 0);
            break;
        case 39: // right (arrow)
            event.preventDefault();
            Tetris.Block.move(1, 0, 0);
            break;
        case 32: // space
            event.preventDefault();
            if (!Tetris.gameOver) {
                Tetris.Block.move(0, 0, -1);
                break;
            }


        case 87: // up (w)
            Tetris.Block.rotate(-90, 0, 0);
            break;
        case 83: // down (s)
            Tetris.Block.rotate(90, 0, 0);
            break;

        case 65: // left(a)
            Tetris.Block.rotate(0, 0, 90);
            break;
        case 68: // right (d)
            Tetris.Block.rotate(0, 0, -90);
            break;

        case 81: // (q)
            Tetris.Block.rotate(0, -90, 0);
            break;
        case 69: // (e)
            Tetris.Block.rotate(0, 90, 0);
            break;

        case 80: // (p)
            if (Tetris.pause) {
                Tetris.pause = false;
                $('#whiteOverlay').hide();
            } else {
                Tetris.pause = true;
                $('#whiteOverlay').show();
            }
            break;
    }
}, false);

