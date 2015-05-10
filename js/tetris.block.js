window.Tetris = window.Tetris || {};

window.Tetris2 = window.Tetris2 || {};

Tetris.Utils = {};

Tetris.Utils.cloneVector = function (v) {
    return {x:v.x, y:v.y, z:v.z};
};

Tetris.Block = {};

Tetris.Block.shapes = [
    [
        {x:0, y:0, z:0},
        {x:1, y:0, z:0},
        {x:1, y:1, z:0},
        {x:1, y:2, z:0}
    ],
    [
        {x:0, y:0, z:0},
        {x:0, y:1, z:0},
        {x:0, y:2, z:0},
    ],
    [
        {x:0, y:0, z:0},
        {x:0, y:1, z:0},
        {x:1, y:0, z:0},
        {x:1, y:1, z:0}
    ],
    [
        {x:0, y:0, z:0},
        {x:0, y:1, z:0},
        {x:0, y:2, z:0},
        {x:1, y:1, z:0}
    ],
    [
        {x:0, y:0, z:0},
        {x:0, y:1, z:0},
        {x:1, y:1, z:0},
        {x:1, y:2, z:0}
    ]
];

Tetris.Block.position = {};

Tetris.Block.future = {};

var nextPiece = -1;
var firstRun = true;

/**
 * Calls methods for creating tetris piece and for creating
 * next tetris piece (one that is being used to show next piece)
 */
Tetris.Block.generate = function () {
    if (nextPiece == -1) {
        nextPiece = Math.floor(Math.random() * (Tetris.Block.shapes.length));

        Tetris.Block.generateCurrent();

        nextPiece = Math.floor(Math.random() * (Tetris.Block.shapes.length));

        Tetris.Block.generateFuture();
    } else {
        Tetris.Block.generateCurrent();

        nextPiece = Math.floor(Math.random() * (Tetris.Block.shapes.length));

        Tetris.Block.generateFuture();
    }


}


/**
 * creates tetris piece and adds it to scene
 */
Tetris.Block.generateCurrent = function () {
    var pieceHeight = Tetris.Board.checkHeight();
    Tetris.setPieceHeight(pieceHeight);

    var geometry, tmpGeometry, i;

    var type = nextPiece;
    this.blockType = type;

    Tetris.Block.shape = [];
    for (i = 0; i < Tetris.Block.shapes[type].length; i++) {
        Tetris.Block.shape[i] = Tetris.Utils.cloneVector(Tetris.Block.shapes[type][i]);
    }

	var piece = new THREE.Geometry();
    geometry = new THREE.BoxGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize);
    piece.merge(geometry, geometry.matrix);
    for (i = 1; i < Tetris.Block.shape.length; i++) {
        tmpGeometry = new THREE.Mesh(new THREE.BoxGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize));
        tmpGeometry.position.x = Tetris.blockSize * Tetris.Block.shape[i].x;
        tmpGeometry.position.y = Tetris.blockSize * Tetris.Block.shape[i].y;
        tmpGeometry.updateMatrix();
        piece.merge(tmpGeometry.geometry, tmpGeometry.matrix);
    }

    Tetris.Block.mesh = new THREE.Mesh(piece,
        new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.2, side: THREE.DoubleSide})
    );

    // initial position
    Tetris.Block.position = {x:Math.floor(Tetris.boundingBoxConfig.splitX / 2) - 1, y:Math.floor(Tetris.boundingBoxConfig.splitY / 2) - 1, z:15};

    if (Tetris.Board.testCollision(true) === Tetris.Board.COLLISION.GROUND) {
        Tetris.gameOver = true;
        Tetris.pointsDOM.text("GAME OVER");

        $('#play_game').show();
        $('#okvir_kontrola').hide();
        $('#game_over').show();
        $('#overal_score').text("Vaši bodovi: " + Tetris.currentPoints);
    }

    Tetris.Block.mesh.position.x = (Tetris.Block.position.x - Tetris.boundingBoxConfig.splitX / 2) * Tetris.blockSize / 2;
    Tetris.Block.mesh.position.y = (Tetris.Block.position.y - Tetris.boundingBoxConfig.splitY / 2) * Tetris.blockSize / 2;
    Tetris.Block.mesh.position.z = (Tetris.Block.position.z - Tetris.boundingBoxConfig.splitZ / 2) * Tetris.blockSize + Tetris.blockSize / 2;
    Tetris.Block.mesh.rotation = {x:0, y:0, z:0};
    Tetris.Block.mesh.overdraw = true;

    Tetris.scene.add(Tetris.Block.mesh);

    Tetris.Block.edge = new THREE.EdgesHelper( Tetris.Block.mesh, 0xffffff);
    Tetris.Block.edge.material.linewidth = 2;

    Tetris.scene.add(Tetris.Block.edge);
};

/**
 * creates future tetris piece and adds it to the small
 * canvas that is showing next piece
 */
Tetris.Block.generateFuture = function () {
    if (!firstRun) {
        Tetris2.scene.remove(Tetris.Block.future.mesh);
        Tetris2.scene.remove(Tetris.Block.future.edge);
    }

    firstRun = false;

    var geometry, tmpGeometry, i;

    var type = nextPiece;

    Tetris.Block.future.shape = [];
    for (i = 0; i < Tetris.Block.shapes[type].length; i++) {
        Tetris.Block.future.shape[i] = Tetris.Utils.cloneVector(Tetris.Block.shapes[type][i]);
    }

    var piece = new THREE.Geometry();
    geometry = new THREE.BoxGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize);
    piece.merge(geometry, geometry.matrix);
    for (i = 1; i < Tetris.Block.future.shape.length; i++) {
        tmpGeometry = new THREE.Mesh(new THREE.BoxGeometry(Tetris.blockSize, Tetris.blockSize, Tetris.blockSize));
        tmpGeometry.position.x = Tetris.blockSize * Tetris.Block.future.shape[i].x;
        tmpGeometry.position.y = Tetris.blockSize * Tetris.Block.future.shape[i].y;
        tmpGeometry.updateMatrix();
        piece.merge(tmpGeometry.geometry, tmpGeometry.matrix);
    }

    Tetris.Block.future.mesh = new THREE.Mesh(piece,
        new THREE.MeshBasicMaterial({color:0xff0000})
    );

    Tetris.Block.future.position = {x:Math.floor(Tetris.boundingBoxConfig.splitX / 2) - 1, y:Math.floor(Tetris.boundingBoxConfig.splitY / 2) - 1, z:15};

    Tetris.Block.future.mesh.position.x = (Tetris.Block.future.position.x - Tetris.boundingBoxConfig.splitX / 2) * Tetris.blockSize / 2;
    Tetris.Block.future.mesh.position.y = (Tetris.Block.future.position.y - Tetris.boundingBoxConfig.splitY / 2) * Tetris.blockSize / 2;
    Tetris.Block.future.mesh.position.z = (Tetris.Block.future.position.z - Tetris.boundingBoxConfig.splitZ / 2) * Tetris.blockSize + Tetris.blockSize / 2;
    Tetris.Block.future.mesh.rotation = {x:0, y:0, z:0};
    Tetris.Block.future.mesh.overdraw = true;

    Tetris2.scene.add(Tetris.Block.future.mesh);

    Tetris.Block.future.edge = new THREE.EdgesHelper( Tetris.Block.future.mesh, 0xffffff);
    Tetris.Block.future.edge.material.linewidth = 2;

    Tetris2.scene.add(Tetris.Block.future.edge);

    Tetris2.renderer.render(Tetris2.scene, Tetris2.camera);
};

Tetris.Utils.roundVector = function(v) {
    v.x = Math.round(v.x);
    v.y = Math.round(v.y);
    v.z = Math.round(v.z);
};

/**
 * Rotation of the piece
 * We have to use projection matrix to save the rotation state for later use
 * @param x
 * @param y
 * @param z
 */
Tetris.Block.rotate = function (x, y, z) {
    Tetris.Block.mesh.rotation.x += x * Math.PI / 180;
    Tetris.Block.mesh.rotation.y += y * Math.PI / 180;
    Tetris.Block.mesh.rotation.z += z * Math.PI / 180;

    var rotationMatrix = new THREE.Matrix4();
	
	rotationMatrix.makeRotationFromEuler(Tetris.Block.mesh.rotation);
	
	for (var i = 0; i < Tetris.Block.shape.length; i++) {
        var vector = Tetris.Block.shapes[this.blockType][i];
        Tetris.Block.shape[i] = new THREE.Vector3(vector.x, vector.y, vector.z);
        Tetris.Block.shape[i].applyProjection(rotationMatrix);
        Tetris.Utils.roundVector(Tetris.Block.shape[i]);
    }

    if (Tetris.Board.testCollision(false) === Tetris.Board.COLLISION.WALL) {
        Tetris.Block.rotate(-x, -y, -z);
    }
};

/**
 * Moving tetris piece with arrows
 * @param x
 * @param y
 * @param z
 */
Tetris.Block.move = function (x, y, z) {
    Tetris.Block.mesh.position.x += x * Tetris.blockSize;
    Tetris.Block.position.x += x;

    Tetris.Block.mesh.position.y += y * Tetris.blockSize;
    Tetris.Block.position.y += y;

    Tetris.Block.mesh.position.z += z * Tetris.blockSize;
    Tetris.Block.position.z += z;

    var collision = Tetris.Board.testCollision((z != 0));

    if (collision === Tetris.Board.COLLISION.WALL) {
        Tetris.Block.move(-x, -y, 0);
    }
    if (collision === Tetris.Board.COLLISION.GROUND) {
        Tetris.Block.hitBottom();
		Tetris.Board.checkCompleted();		
    }
};

/**
 * call when hits the floor and should be transformed to static blocks
 */
Tetris.Block.petrify = function () {
    var shape = Tetris.Block.shape;
    for (var i = 0; i < shape.length; i++) {
        Tetris.addStaticBlock(Tetris.Block.position.x + shape[i].x, Tetris.Block.position.y + shape[i].y, Tetris.Block.position.z + shape[i].z);
        Tetris.Board.fields[Tetris.Block.position.x + shape[i].x][Tetris.Block.position.y + shape[i].y][Tetris.Block.position.z + shape[i].z] = Tetris.Board.FIELD.PETRIFIED;
    }
};

Tetris.Block.hitBottom = function () {
    Tetris.Block.petrify();
    Tetris.scene.remove(Tetris.Block.mesh);
	Tetris.scene.remove(Tetris.Block.edge);
    Tetris.Block.generate();
};
