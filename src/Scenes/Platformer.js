class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.jumpMult = 1;
        this.powerUpCooldown = 0;
        this.score = 0;
        this.coinAnim = {coin: [151,152]};
        this.animationFreq = 500;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // DONE
        // -T-O-D-O-: Add createFromObjects here
        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.powerUps = this.map.createFromObjects("Objects", {
            name: "powerup",
            key: "tilemap_sheet",
            frame: 67
        });

        // DONE
        // -T-O-D-O-: Add turn into Arcade Physics here
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.powerUps, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.PUGroup = this.add.group(this.powerUps);

        for(let coin of this.coinGroup.children.entries){
            coin.anims.play("coinSpin");
        }

        // set up player avatar
        this.playerSpawn = this.map.findObject("Objects", obj => obj.name === "player");
        my.sprite.player = this.physics.add.sprite(this.playerSpawn.x, this.playerSpawn.y, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // DONE
        // -T-O-D-O-: Add coin collision handler
        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            //my.vfx.coinCollect.x = obj2.x;
            //my.vfx.coinCollect.y = obj2.y;
            //my.vfx.coinCollect.start();
            //For some reason when this is first ran, the game lags a bit. idk why? sorry about that
            this.score += 1;
            my.text.score.text = `Coins: ${ this.score }`;
            console.log(my.sprite.player.y);
            this.add.particles(obj2.x, obj2.y, "kenny-particles", {
                frame: ['star_01.png', 'star_02.png', 'star_03.png', 'star_03.png'],
                scale: {start: 0.03, end: 0.1},
                lifespan: 500,
                alpha: {start: 1, end: 0.1}, 
                quantity: 5,
                stopAfter: 5 //spawns 5 instantly, then stops
            });
            obj2.destroy(); // remove coin on overlap
        });
        this.physics.add.overlap(my.sprite.player, this.PUGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.jumpMult = 2;
            this.powerUpCooldown = 10000;
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // DONE
        // -T-O-D-O-: Add movement vfx here
        // movement vfx

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // -T-O-D-O-: Try: add random: true
            //random: true, //Effect currently seems to be bugged, according to TA. will return to later if the reason is found
            scale: {start: 0.03, end: 0.1},
            // -T-O-D-O-: Try: maxAliveParticles: 8,
            //maxAliveParticles: 8, //Maxes out visible particles at 8. currently results in sudden bursts
            lifespan: 350,
            // -T-O-D-O-: Try: gravityY: -400,
            //gravityY: -400, //Causes particles to rise up in the air after spawning
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        /*
        //coin collect vfx
        my.vfx.coinCollect = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_01.png', 'star_02.png', 'star_03.png', 'star_03.png'],
            // -T-O-D-O-: Try: add random: true
            //random: true, //Effect currently seems to be bugged, according to TA. will return to later if the reason is found
            scale: {start: 0.03, end: 0.1},
            // -T-O-D-O-: Try: maxAliveParticles: 8,
            //maxAliveParticles: 8, //Maxes out visible particles at 8. currently results in sudden bursts
            lifespan: 500,
            // -T-O-D-O-: Try: gravityY: -400,
            //gravityY: -400, //Causes particles to rise up in the air after spawning
            alpha: {start: 1, end: 0.1}, 
            //duration: 300,
            quantity: 5,
            stopAfter: 5 //spawns 5 instantly, then stops
        });

        my.vfx.coinCollect.stop();
        */

        // DONE
        // -T-O-D-O-: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        //text/score display
        //For some reason the text spawned in a really wierd place? I think it might ahve to do with the scale of the world but idk
        //Hence the weird math for spawning. Will probably not work with other maps
        my.text.score = this.add.text(this.map.widthInPixels / 2 - 32, this.map.heightInPixels / 2 + 16, `Coins: ${ this.score }`, { 
            fontFamily: "rocketSquare",
            fontSize: '32px',
            backgroundColor: '#000000' 
        }).setScrollFactor(0)
    }

    update(time, delta) {

        //powerup cooldown
        this.powerUpCooldown -= delta;
        if(this.powerUpCooldown <= 0){
            this.jumpMult = 1;
        }

        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // DONE
            // -T-O-D-O-: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // DONE
            // -T-O-D-O-: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, -my.sprite.player.displayWidth/2+10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // DONE
            // -T-O-D-O-: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY * this.jumpMult);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}