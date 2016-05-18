var Ground = function(game, x, y, width, height) {
    Phaser.TileSprite.call(this, game, x, y, width, height, 'ground');

    this.autoScroll(-300, 0);
    this.game.physics.p2.enableBody(this);
    this.body.static = true;
};

Ground.prototype = Object.create(Phaser.TileSprite.prototype);
Ground.prototype.constructor = Ground;
Ground.prototype.update = function() {};

var Plane = function(game, x, y, frame) {
    // The super call to Phaser.Sprite
    Phaser.Sprite.call(this, game, x, y, 'plane', frame);

    // set the sprite's anchor to the center
    this.anchor.setTo(0.5, 0.5);

    // add and play animations
    this.animations.add('fly');
    this.animations.play('fly', 12, true);

    this.game.physics.p2.enableBody(this);
    this.physicsEnabled = true;
};
Plane.prototype = Object.create(Phaser.Sprite.prototype);
Plane.prototype.constructor = Plane;
Plane.prototype.update = function() {
    if(this.body.angle < 15) {
        this.body.angle += 1;
    }
};
Plane.prototype.fly = function() {
    this.body.velocity.y = -400;
    this.game.add.tween(this.body).to({angle: -15}, 100).start();
};

var RockGroup = function(game, parent, collisionGroup, collidesWith) {
    Phaser.Group.call(this, game, parent);

    this.velocityX = -300;

    // this.topRock = new Rock(this.game, 0, 0, 1);
    // this.add(this.topRock);

    // this.bottomRock = new Rock(this.game, 0, this.topRock.height + (70 * 3), 0);
    // this.add(this.bottomRock);
    this.collisionGroup = collisionGroup;
    this.collidesWith = collidesWith;

    /*this.topRock = this.create(this.game.width, 0, 'rockDown');
    this.bottomRock = this.create(this.game.width, this.topRock.height + (70 * 3), 'rockUp');*/

    this.topRock = this.game.add.sprite(this.game.width, 0, 'rockDown');
    this.bottomRock = this.game.add.sprite(this.game.width, this.topRock.height + (70 * 3), 'rockUp');

    this.game.physics.p2.enableBody(this.topRock);
    this.game.physics.p2.enableBody(this.bottomRock);

    this.topRock.physicsEnabled = true;
    this.topRock.body.kinematic = true;
    this.bottomRock.physicsEnabled = true;
    this.bottomRock.body.kinematic = true;

    this.add(this.topRock);
    this.add(this.bottomRock);

    this.topRock.body.clearShapes();
    this.bottomRock.body.clearShapes();

    this.topRock.body.loadPolygon('physicsData', 'rockDown');
    this.bottomRock.body.loadPolygon('physicsData', 'rockUp');

    this.hasScored = false;
};
RockGroup.prototype = Object.create(Phaser.Group.prototype);
RockGroup.prototype.constructor = RockGroup;
RockGroup.prototype.reset = function(x, y) {
    this.topRock.reset(this.game.width, y);
    this.bottomRock.reset(this.game.width, y + this.topRock.height + (70 * 3));

    this.topRock.body.setCollisionGroup(this.collisionGroup);
    this.topRock.body.collides(this.collidesWith);
    this.bottomRock.body.setCollisionGroup(this.collisionGroup);
    this.bottomRock.body.collides(this.collidesWith);

    this.setAll('body.velocity.x', this.velocityX);
    this.hasScored = false;
    this.exists = true;
};
RockGroup.prototype.checkWorldBounds = function() {  
    if(!this.topRock.inWorld) {
        this.exists = false;
    }
};
RockGroup.prototype.update = function() {  
    this.checkWorldBounds(); 
};

function Boot() {}
Boot.prototype = {
    preload: function() {
        this.load.image('preloader', 'assets/images/preloader.gif');
    },
    create: function() {
        this.game.input.maxPointers = 1;
        this.game.state.start('preload');
    }
};

function Preload() {
    this.asset = null;
    this.ready = false;
}
Preload.prototype = {
    preload: function() {
        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.asset = this.add.sprite(this.width/2, this.height/2, 'preloader');
        this.asset.anchor.setTo(0.5, 0.5);
        this.load.setPreloadSprite(this.asset);

        this.load.image('background', 'assets/images/background.png'); // 800x480
        this.load.image('ground', 'assets/images/ground.png');
        this.load.image('title', 'assets/images/title.png');
        this.load.image('startButton', 'assets/images/start-button.png');

        this.load.image('rockUp', 'assets/images/rockUp.png');
        this.load.image('rockDown', 'assets/images/rockDown.png');

        this.load.spritesheet('plane', 'assets/images/yellow-plane.png', 86, 73, 3);
        //this.load.spritesheet('rock', 'assets/images/rock.png', 108, 239, 2);

        this.load.physics('physicsData', 'assets/physics/rock.json');
    },
    create: function() {
        this.asset.cropEnabled = false;
    },
    update: function() {
        if(!!this.ready) {
            this.game.state.start('menu');
        }
    },
    onLoadComplete: function() {
        this.ready = true;
    }
};

function Menu() {}
Menu.prototype = {
    preload: function() {
    },
    create: function() {
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.background.autoScroll(-40, 0);


        var ground_height = 71;
        this.ground = this.game.add.tileSprite(0, this.game.height - ground_height, this.game.width, ground_height, 'ground');
        this.ground.autoScroll(-300, 0);


        this.title = this.game.add.sprite(0, 15, 'title');
        this.plane = this.game.add.sprite(this.title.width/2, this.title.height + 20, 'plane');
        this.plane.anchor.setTo(0.5, 0);
        this.plane.animations.add('fly');
        this.plane.animations.play('fly', 15, true);

        this.titleGroup = this.game.add.group();
        this.titleGroup.add(this.title);
        this.titleGroup.add(this.plane);
        this.titleGroup.x = this.game.world.centerX - (this.title.width / 2);
        this.titleGroup.y = this.game.world.centerY / 3;

        // create an oscillating animation tween for the group
        this.game.add.tween(this.titleGroup).to({y:(this.titleGroup.y - 30)}, 350, Phaser.Easing.Linear.NONE, true, 0, -1, true);

        this.startButton = this.game.add.button(this.game.width/2, this.game.height - 2 * ground_height, 'startButton', this.startClick, this);
        this.startButton.anchor.setTo(0.5, 0.5);
    },
    update: function() {
        if (isFire) {
            isFire = false;
            this.game.state.start('play');
        }
    },
    startClick: function() {  
        this.game.state.start('play');
    }
};

function Play() {}
Play.prototype = {
    create: function() {
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.gravity.y = 1200;
        this.game.physics.p2.setImpactEvents(true); //  Turn on impact events for the world, without this we get no collision callbacks

        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.background.autoScroll(-40, 0);

        // Create a new plane object
        this.planeCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.plane = new Plane(this.game, 100, this.game.height/2);
        this.plane.body.setCollisionGroup(this.planeCollisionGroup);
        this.game.add.existing(this.plane);


        this.rocksCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.rocks = this.game.add.group();

        /* Ground */
        var ground_height = 71;
        this.groundCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.ground = new Ground(this.game, 400, 459, 800, 71);
        this.ground.body.setCollisionGroup(this.groundCollisionGroup);
        /*this.ground.body.clearShapes();
        this.ground.body.loadPolygon('physicsData', 'ground');*/
        this.game.add.existing(this.ground);


        // keep the spacebar from propogating up to the browser
        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
        var flapKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        flapKey.onDown.add(this.plane.fly, this.plane);
        this.input.onDown.add(this.plane.fly, this.plane); // add mouse/touch controls

        // add a timer
        this.rockGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.25, this.generateRocks, this);
        this.rockGenerator.timer.start();

        this.ground.body.collides([this.planeCollisionGroup]);

        this.plane.body.collides(this.rocksCollisionGroup, this.deathHandler, this);
        this.plane.body.collides(this.groundCollisionGroup, this.deathHandler, this);
    },
    update: function() {
        if (isFire) {
            isFire = false;
            this.plane.fly();
        }
    },
    generateRocks: function() {
        var rockY = this.game.rnd.integerInRange(-100, 100);
        var rockGroup = this.rocks.getFirstExists(false);
        if(!rockGroup) {
            rockGroup = new RockGroup(this.game, this.rocks, this.rocksCollisionGroup, [this.planeCollisionGroup]);
        }
        rockGroup.reset(this.game.width + rockGroup.width/2, rockY);
        //console.log("Number of group: " + this.rocks.length);
    },
    deathHandler: function() {
        this.game.state.start('gameover');
    },
    shutdown: function() {
        this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
        this.plane.destroy();
        this.ground.destroy();
        this.rocks.destroy();
    }
};

function GameOver() {}
GameOver.prototype = {
    preload: function () {},
    create: function () {
        var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
        this.titleText = this.game.add.text(this.game.world.centerX,100, 'Game Over!', style);
        this.titleText.anchor.setTo(0.5, 0.5);

        this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', { font: '16px Arial', fill: '#ffffff', align: 'center'});
        this.instructionText.anchor.setTo(0.5, 0.5);
    },
    update: function () {
        if(this.game.input.activePointer.justPressed() || isFire) {
            isFire = false;
            this.game.state.start('play');
        }
    }
};
