//my main
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, scale) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    var scaleBy = this.scale || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
	return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
	return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game) {
	Entity.call(this, game, 0, 0); 
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
	ctx.drawImage(AM.getAsset("img/map.png"), 0, 0); //map
	Entity.prototype.draw.call(this);
}

function RobotTier1(game, taskAsset) { //spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, scale
	var spriteSheet = AM.getAsset("img/robotSpriteSheet1.png"); 
	this.upAnimation = new Animation(spriteSheet, 0, 512, 64, 64, 0.1, 8, true, false, 0.75);
	this.downAnimation = new Animation(spriteSheet, 0, 0, 64, 64, 0.1, 8, true, false, 0.75);
	this.rightAnimation = new Animation(spriteSheet, 0, 1152, 64, 64, 0.1, 11, true, false, 0.75);
	this.leftAnimation = new Animation(spriteSheet, 0, 1088, 64, 64, 0.1, 11, true, false, 0.75);
	
	this.up = false;
	this.down = true;
	this.left = false;
	this.right = false;
	
	this.repairUpAnimation = new Animation(spriteSheet, 512, 640, 64, 64, 0.1, 4, true, false, 0.75);
	this.repairDownAnimation = new Animation(spriteSheet, 256, 512, 64, 64, 0.1, 4, true, false, 0.75);
	this.repairRightAnimation = new Animation(spriteSheet, 0, 192, 64, 64, 0.1, 4, true, false, 0.75);
	this.repairLeftAnimation = new Animation(spriteSheet, 512, 704, 64, 64, 0.1, 4, true, false, 0.75);
	
	this.repair = false;
	
	this.gatherBerryUpAnimation = new Animation(spriteSheet, 256, 640, 64, 64, 0.1, 4, true, false, 0.75);
	this.gatherBerryDownAnimation = new Animation(spriteSheet, 0, 704, 64, 64, 0.1, 4, true, false, 0.75);
	this.gatherBerryRightAnimation = new Animation(spriteSheet, 512, 320, 64, 64, 0.1, 4, true, false, 0.75);
	this.gatherBerryLeftAnimation = new Animation(spriteSheet, 512, 384, 64, 64, 0.1, 4, true, false, 0.75);
	
	this.gatherBerry = false;
	
	this.gatherScrapUpAnimation = new Animation(spriteSheet, 512, 448, 64, 64, 0.1, 4, true, false, 0.75);
	this.gatherScrapDownAnimation = new Animation(spriteSheet, 0, 512, 64, 64, 0.1, 4, true, false, 0.75);
	this.gatherScrapRightAnimation = new Animation(spriteSheet, 512, 192, 64, 64, 0.1, 4, true, false, 0.75);
	this.gatherScrapLeftAnimation = new Animation(spriteSheet, 512, 512, 64, 64, 0.1, 4, true, false, 0.75);
	
	this.gatherScrap = false;
	//add rest
	
	this.taskAsset = taskAsset;
	
	this.taskAsset.x = 250;
	this.taskAsset.y = 250;
	
	this.dead = false; 
	this.life = 200; //robots life?

	this.speed = 75;
	this.angle = 2 *Math.PI;
	this.dy = 0;
	this.dx = 0;
	this.distance = 0;
	this.game = game;
	this.ctx = game.ctx; 
	
	Entity.call(this, game, Math.floor(this.game.width / 2), Math.floor(this.game.height / 2));
}

RobotTier1.prototype = new Entity();
RobotTier1.prototype.constructor = RobotTier1;

RobotTier1.prototype.update = function(){
	

	this.game.moveTo(this, this.taskAsset);
	if(Math.floor(this.distance) < 32){
		this.repair = true;
	} else {  
		this.repair = false; 
				
		this.x += this.dx * this.game.clockTick * this.speed;
		this.y += this.dy * this.game.clockTick * this.speed;

		this.dx = Math.floor(this.dx);
		this.dy = Math.floor(this.dy);
		
		//console.log(this.dx + ", " + this.dy + ", " + this.up + ", " + this.left);

		if(this.dx ===this.dy) { 
			if(this.dx < 0) {
				this.left = true;
				this.right = false; 
				this.up = false;
				this.down = false;
			} else {
				this.left = false;
				this.right = true;
				this.up = false;
				this.down = false;
			} 
		} else if (this.dx > this.dy) {	 
			if(this.dx < 0) {
				this.down = true;
				this.up = false;
				this.left = false;
				this.right = false; 
			} else {
				this.down = false;
				this.up = true;
				this.left = false;
				this.right = false; 
			} 
		} else { 
			if(this.dy < 0) {
				this.down = false;
				this.up = true;
				this.left = false;
				this.right = false; 
			} else {
				this.down = true;
				this.up = false;
				this.left = false;
				this.right = false; 
			} 
		}
	} 
	Entity.prototype.update.call(this);  
}

RobotTier1.prototype.draw = function(){
	
	if(this.gatherBerry){
		if(this.down){
			this.gatherBerryDownAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
		} else if(this.left){
			this.gatherBerryLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);		
		} else if(this.right){
			this.gatherBerryRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);		
		}else{
			this.gatherBerryUpAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);		
		}
	} else if( this.repair){
		if(this.down){
			this.repairDownAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
		} else if(this.left){
			this.repairLeftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);		
		} else if(this.right){
			this.repairRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);		
		}else{
			this.repairUpAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);		
		}
	} else if (this.down) {
		this.downAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
	} else if (this.left) {
		this.leftAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
	} else if (this.right) {
		this.rightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
	} else {
		this.upAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);  
	} 
	
	Entity.prototype.draw.call(this);
}

function Bush(game){
	this.name = "bush";
	Entity.call(this, game, 50, 50);
}

Bush.prototype = new Entity();
Bush.prototype.constructor = Bush;

Bush.prototype.update = function(){
}

Bush.prototype.draw = function (ctx) {
	ctx.drawImage(AM.getAsset("img/bush.png"), 450, 250);
	Entity.prototype.draw.call(this);
}

function Tree(game){
	this.name = "tree";
	Entity.call(this, game, 50, 50);
}

Tree.prototype = new Entity();
Tree.prototype.constructor = Tree;

Tree.prototype.update = function(){
}

Tree.prototype.draw = function (ctx) {
	ctx.drawImage(AM.getAsset("img/tree attempt 1.png"), 180, 160);
	Entity.prototype.draw.call(this);
}

function Spaceship(game){
	this.name = "spaceship";
	Entity.call(this, game, 200, 200);
}

Spaceship.prototype = new Entity();
Spaceship.prototype.constructor = Spaceship;

Spaceship.prototype.update = function(){
}

Spaceship.prototype.draw = function (ctx){
	ctx.drawImage(AM.getAsset("img/spaceship.png"), 200, 200);
	Entity.prototype.draw.call(this);
}

var AM = new AssetManager(); 

AM.queueDownload("img/robotSpriteSheet1.png"); 
AM.queueDownload("img/map.png"); //map!
AM.queueDownload("img/bush.png");
AM.queueDownload("img/tree attempt 1.png");
AM.queueDownload("img/spaceship.png");

AM.downloadAll(function () {
	var canvas = document.getElementById("gameWorld");
	var ctx = canvas.getContext("2d");

	var gameEngine = new GameEngine(); 

	gameEngine.init(ctx);
	gameEngine.start();


	var map = new Background(gameEngine);
	var bush = new Bush(gameEngine);
	var tree = new Tree(gameEngine);
	var spaceship = new Spaceship(gameEngine);
	var robot = new RobotTier1(gameEngine, Bush);

	gameEngine.addEntity(map);  
	gameEngine.addEntity(bush);
	gameEngine.addEntity(tree);
	gameEngine.addEntity(spaceship);
	gameEngine.addEntity(robot);
	console.log("All Done!");
});