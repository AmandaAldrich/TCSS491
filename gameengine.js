
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

/** Game Engine **/
function GameEngine() {
    this.entities = [];
    this.ctx = null;
    this.width = null;
    this.height = null;
    this.click = null;
    this.mouse = null;
    this.keys = {
        up: false,
        down: false,
        left: false,
        right: false
    };
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.width = this.ctx.canvas.width;
    this.height = this.ctx.canvas.height;
    this.keyListener();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.keyListener = function() {
    var that = this;
    this.ctx.canvas.addEventListener("keydown", function(e) {
        var keyPressed = String.fromCharCode(e.which); 
        if(keyPressed === 'W' || e.which === 38) that.keys.up = true;
        if(keyPressed === 'A' || e.which === 37) that.keys.left = true;  
        if(keyPressed === 'D' || e.which === 39) that.keys.right = true;  
        if(keyPressed === 'S' || e.which === 40) that.keys.down = true; 
        if(keyPressed === ' ') that.keys.attack = true; 
        e.preventDefault(); 
    }, false);  

    this.ctx.canvas.addEventListener("keyup", function(e) {
        var keyReleased = String.fromCharCode(e.which); 
        if(keyReleased === 'W' || e.which === 38) that.keys.up = false;
        if(keyReleased === 'A' || e.which === 37) that.keys.left = false;  
        if(keyReleased === 'D' || e.which === 39) that.keys.right = false;  
        if(keyReleased === 'S' || e.which === 40) that.keys.down = false; 
        if(keyReleased === ' ') that.keys.attack = false; 
        e.preventDefault(); 
    }, false);  

}


GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw(); 
}

/**
    Moves the given entity to the target. 
    The target and the entity must have a x and y coordinates. 
**/
GameEngine.prototype.moveTo = function(entity, target) {
    var dx = target.x - entity.x;
    var dy = target.y - entity.y; 
    var distance = Math.sqrt(dx * dx + dy * dy);
     
    if(distance) {  
        dx /= distance;
        dy /= distance;
    } 
    entity.dx = dx;
    entity.dy = dy; 
    entity.distance = distance;  
}

/** Timer **/
function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

/** Entity **/
function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    return offscreenCanvas;
}