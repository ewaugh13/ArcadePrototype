import * as Phaser from 'phaser';
import { Octopus } from './objects/octopus'
import { Platform } from './objects/platform'
import { Player } from './objects/player'
import { WSAEINTR } from 'constants';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

var PLAYERSPEED = 300;
var ENEMYSPEED = 100;
var CANNONSPEEDX = 200;
var CANNONSPEEDY = -200;
var LEVEL1_Y = 150;
var LEVEL2_Y = 400;
var LEVEL3_Y = 650;
var BASE = 900;
var enemyVel: number;
var liveCount: number = 3;
// var OCTOPUSXBOUNCE: number = 50;
// var OCTOPUSYBOUNCE: number = 20;
var JUMPAMOUNT = -600;
var inAir = false;
var isTurnedLeft = false;
var ifPow: boolean = false;
//SFX
var bgm: Phaser.Sound.BaseSound;
var collectSound: Phaser.Sound.BaseSound;           //Globals.. need to rescope these
var jumpSound: Phaser.Sound.BaseSound;
var deathSound: Phaser.Sound.BaseSound;

export class GameScene extends Phaser.Scene {
  private player: Player;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private gems: Phaser.GameObjects.Group;
  private score: number;
  private scoreText: Phaser.GameObjects.Text;
  private enemies: Array<Phaser.Physics.Arcade.Sprite>;
  private cannonBall: Phaser.Physics.Arcade.Sprite;
  private pipes: Phaser.Physics.Arcade.StaticGroup;
  private water: Phaser.Physics.Arcade.Sprite;
  private playerHit: boolean;
  private pow: Phaser.Physics.Arcade.Sprite;
  private powEnemy: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super(sceneConfig);
  }

  public preload() {

    this.load.image('background', 'src/assets/Ship.png');
    this.load.spritesheet('dude',
      'src/assets/player.png',
      { frameWidth: 83, frameHeight: 131, spacing: 2 });
    this.load.spritesheet('platformPlank',
      'src/assets/planksquash_SpriteSheet.png',
      { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('cannonBall',
      'src/assets/CannonballSpriteSheet.png',
      { frameWidth: 32, frameHeight: 32 });

    this.load.spritesheet('octopusPink', 'src/assets/OctoSpritePink.png',
      { frameWidth: 64, frameHeight: 64, spacing: 2 });
    this.load.spritesheet('octopusTeal', 'src/assets/OctoSpriteTeal.png',
      { frameWidth: 64, frameHeight: 64, spacing: 2 });
    this.load.spritesheet('octopusYellow', 'src/assets/OctoSpriteYellow.png',
      { frameWidth: 64, frameHeight: 64, spacing: 2 });

    this.load.image('playerIcon', 'src/assets/PlayerIcon.png');
    this.load.image('gem', 'src/assets/Gem.png');
    this.load.image('pipe', 'src/assets/Pipes.png')
    this.load.image('water', 'src/assets/Water.png');
    this.load.image('pow', 'src/assets/POW.png');

    this.load.audio('bgm', 'src/assets/SFX/Music/bgm.wav');
    this.load.audio('collect', 'src/assets/SFX/Ruby.wav');
    this.load.audio('jump', 'src/assets/SFX/Jump or swim.wav');
    this.load.audio('death', 'src/assets/SFX/death-sound.wav');
  }

  public create() {
    //Adding the SFX
    bgm = this.sound.add('bgm', { loop: true });
    //bgm.play();
    collectSound = this.sound.add('collect');
    jumpSound = this.sound.add('jump');
    deathSound = this.sound.add('death');
    //Background
    //this.add.image(0, -3240, 'background').setOrigin(0, 0);

    //Init ScoreSystem
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    // load all anims
    this.loadAnims();

    //Level Creation
    this.platforms = this.physics.add.staticGroup();
    //Level 1
    for (var i = 0; i < 26; ++i) {
      var platform: Platform = new Platform(this, i * 32, LEVEL1_Y);
      this.platforms.add(platform);
    }
    for (var i = 0; i < 26; ++i) {
      var platform: Platform = new Platform(this, 1100 + i * 32, LEVEL1_Y);
      this.platforms.add(platform);
    }

    //Level 2
    for (var i = 0; i < 12; ++i) {
      var platform: Platform = new Platform(this, i * 32, LEVEL2_Y);
      this.platforms.add(platform);
    }
    for (var i = 0; i < 20; ++i) {
      var platform: Platform = new Platform(this, 700 + i * 32, LEVEL2_Y);
      this.platforms.add(platform);
    }
    for (var i = 0; i < 12; ++i) {
      var platform: Platform = new Platform(this, 1650 + i * 32, LEVEL2_Y);
      this.platforms.add(platform);
    }

    //Level 3
    for (var i = 0; i < 25; ++i) {
      var platform: Platform = new Platform(this, i * 32, LEVEL3_Y);
      this.platforms.add(platform);
    }
    for (var i = 0; i < 25; ++i) {
      var platform: Platform = new Platform(this, 1200 + i * 32, LEVEL3_Y);
      this.platforms.add(platform);
    }

    //Base
    for (var i = 0; i < 65; ++i) {
      var platform: Platform = new Platform(this, i * 32, BASE);
      this.platforms.add(platform);
    }

    // creation of pipes
    this.pipes = this.physics.add.staticGroup();
    this.pipes.create(0, BASE - 50, 'pipe');
    this.pipes.create(1920, BASE - 50, 'pipe');
    this.pipes.create(0, LEVEL1_Y - 65, 'pipe');
    this.pipes.create(1920, LEVEL1_Y - 65, 'pipe');

    // //Platform Generation
    // this.platforms = this.physics.add.staticGroup();
    // //Platform Gen Variables
    // var NUMBEROFLEVELS = 10;
    // var PLATFORMLENGTH = 10;
    // var PLATFORMWIDTH = 32;
    // var LEVELGAP = 100;
    // var STARTOFFSET = 32;
    // var WALLSTART = 365;
    // var WALLEND = 1575;
    // //Loop Variables
    // var i: number;
    // var j: number;
    // var k: number;
    // for (i = 0; i < NUMBEROFLEVELS; i++) {
    //   var seed = WALLSTART + Math.random() * ((WALLEND - WALLSTART) - (PLATFORMLENGTH * PLATFORMWIDTH));  //left wall: 353, width till right wall: 1203(1566-353-platformlength)
    //   for (j = 0; j < PLATFORMLENGTH; j++) {
    //     if (i == 9) {
    //       for (k = 0; k < ((WALLEND - WALLSTART) / PLATFORMWIDTH); k++) {
    //         var x = WALLSTART + (k * PLATFORMWIDTH);
    //         var y = STARTOFFSET + (i * LEVELGAP);
    //         this.platforms.create(WALLSTART + (j * PLATFORMWIDTH), STARTOFFSET + (i * LEVELGAP), 'platformPlank');
    //       }
    //     }
    //     else
    //     this.platforms.create(seed + (j * PLATFORMWIDTH), STARTOFFSET + (i * LEVELGAP), 'platformPlank');
    //   }
    // }

    //Water Init
    this.water = this.physics.add.sprite(1000, 1750, 'water');
    this.water.setAlpha(0.5);
    this.water.setScale(15, 10);
    var waterBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>this.water.body;
    waterBody.setAllowGravity(false);

    //Pow water
    this.pow = this.physics.add.sprite(200, LEVEL1_Y - 40, 'pow');
    this.pow.setScale(2);
    var powBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>this.pow.body;
    powBody.setAllowGravity(false);
    this.pow.body.immovable = true;

    //Pow enemey
    this.powEnemy = this.physics.add.sprite(1000, LEVEL3_Y - 40, 'pow');
    this.powEnemy.setScale(2);
    var powEnemyBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>this.powEnemy.body;
    powEnemyBody.setAllowGravity(false);
    powEnemyBody.immovable = true;

    //Gems Creation
    this.gems = this.physics.add.group({
      key: 'gem',
      repeat: 11,
      setXY: { x: 502, y: 400, stepX: 70 }
    });

    // collider between gems and platforms
    this.physics.add.collider(this.gems, this.platforms);

    //Player Creation
    this.player = new Player(this, 500, 800);
    this.player.setScale(0.75);
    this.playerHit = false;

    // player icon creation
    for (var i = 0; i < liveCount; i++) {
      var playerIconSprite: Phaser.GameObjects.Sprite = this.add.sprite(25 + i * 40, 25, 'playerIcon');
      this.player.playerLives.push(playerIconSprite);
    }

    // collider between play and platforms
    this.physics.add.collider(this.player, this.platforms, moveWall, null, this);
    //collider between player and pow
    this.physics.add.collider(this.player, this.pow, powFunc, null, this);
    //collider between player and enemyPow
    this.physics.add.collider(this.player, this.powEnemy, this.powEnemyFunc, null, this);
    // collider between player and gems and water
    this.physics.add.overlap(this.player, this.gems, collectGem, null, this);
    this.physics.add.overlap(this.player, this.water, hitWater, null, this);

    //CANNONBALL
    this.cannonBall = this.physics.add.sprite(100, 30, 'cannonBall');
    this.physics.add.collider(this.player, this.cannonBall, hitBall, null, this);
    this.physics.add.collider(this.platforms, this.cannonBall);

    this.cannonBall.anims.play('rotate');
    this.cannonBall.setCollideWorldBounds(true);
    this.cannonBall.setVelocityX(CANNONSPEEDX);
    this.cannonBall.setVelocityY(CANNONSPEEDY);
    this.cannonBall.setBounce(1);

    //OCTOPI
    this.enemies = new Array();

    var octopus1: Octopus = new Octopus(this, 1000, 300, 0);
    octopus1.setXRange(668, 1276);

    var octopus2: Octopus = new Octopus(this, 800, 300, 0);
    octopus2.setXRange(668, 1276);

    this.enemies.push(octopus1);
    this.enemies.push(octopus2);


    // collision of this.enemies and platforms
    this.enemies.forEach(enemy => {
      this.physics.add.collider(enemy, this.platforms, octopusPlatformCollide, null, this);
    });

    // collision of this.enemies with each other
    var i: number;
    var j: number;
    for (i = 0; i < this.enemies.length; i++) {
      for (j = i + 1; j < this.enemies.length; j++) {
        var enemy1: Phaser.Physics.Arcade.Sprite = this.enemies[i];
        var enemy2: Phaser.Physics.Arcade.Sprite = this.enemies[j];
        this.physics.add.collider(enemy1, enemy2, enemiesCollide, null, this);
      }
    }

    // collision of this.enemies and player
    this.enemies.forEach(enemy => {
      this.physics.add.collider(this.player, enemy, hitEnemy, null, this);
    });

    // pipes collision
    this.physics.add.collider(this.enemies, this.pipes, transportToTop, null, this);

    // setting the this.enemies to go left or right randomly
    if (Math.random() * 2 < 0.5) {
      enemyVel = ENEMYSPEED;
    }
    else {
      enemyVel = -ENEMYSPEED;
    }

    // set enemy speed
    var enemy: Octopus;
    for (i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i] instanceof (Octopus)) {
        enemy = <Octopus>this.enemies[i];
        enemy.setVelocityX(enemyVel);
        enemy.velocityX = enemyVel;
        enemy.startVelocityX = enemyVel;
        enemyVel *= -1;
      }
    }
  }

  public update() {
    //Make water rise
    if (!ifPow) {
      this.water.setVelocityY(-10);
    }
    else {
      if (this.water.y > 1800) {
        ifPow = false;
      }
      this.water.setVelocityY(100);
    }
    //this.physics.world.wrap(this.player);
    this.physics.world.wrap(this.enemies);
    if (liveCount >= 0) {
      var i: number;
      var octopus: Octopus;
      for (i = 0; i < this.enemies.length; i++) {
        octopus = <Octopus>this.enemies[i];
        if (!octopus.active) {
          this.enemies.splice(i, 1);
          continue;
        }
        octopus.xPositionConstraint();
        octopus.setVelocityX(octopus.velocityX);
        if (octopus.velocityX > 0) {
          octopus.anims.play(octopus.texture.key + 'RightWalk', true);
        }
        else if (octopus.velocityX < 0) {
          octopus.anims.play(octopus.texture.key + 'LeftWalk', true);
        }
      }
      playerMovement(this.input.keyboard.createCursorKeys(), this.player, this.playerHit);
    }
  }

  private powEnemyFunc(player: Phaser.Physics.Arcade.Sprite, pow: Phaser.Physics.Arcade.Sprite) {
    var enemy: Octopus;

    var i: number;
    for (i = 0; i < this.enemies.length; i++) {
      enemy = <Octopus>this.enemies[i];
      if (enemy.body.wasTouching.down) {
        if (enemy.octopusVulnerable) {
          resetEnemy(enemy);
          enemy.velocityX = enemy.previousVelocityX;
        }
        else {
          flipEnemy(enemy);
        }
      }
    }
  }

  private loadAnims() {
    // platform anims
    this.anims.create({
      key: 'deform',
      frames: this.anims.generateFrameNumbers('platformPlank', { start: 0, end: 4 }),
      frameRate: 30
    });

    // player anims
    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 0 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'leftJump',
      frames: [{ key: 'dude', frame: 9 }],
      delay: 5000,
      frameRate: 20,
    });

    this.anims.create({
      key: 'rightJump',
      frames: [{ key: 'dude', frame: 4 }],
      delay: 5000,
      frameRate: 20,
    });

    // canonBall anims
    this.anims.create({
      key: 'rotate',
      frames: this.anims.generateFrameNumbers('cannonBall', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    // octopus anims
    this.anims.create({
      key: 'octopusPinkLeftWalk',
      frames: this.anims.generateFrameNumbers('octopusPink', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'octopusPinkLeftStun',
      frames: this.anims.generateFrameNumbers('octopusPink', { start: 4, end: 6 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusPinkLeftDie',
      frames: this.anims.generateFrameNumbers('octopusPink', { start: 7, end: 9 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusPinkRightWalk',
      frames: this.anims.generateFrameNumbers('octopusPink', { start: 10, end: 13 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'octopusPinkRightStun',
      frames: this.anims.generateFrameNumbers('octopusPink', { start: 14, end: 16 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusPinkRightDie',
      frames: this.anims.generateFrameNumbers('octopusPink', { start: 17, end: 19 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusTealLeftWalk',
      frames: this.anims.generateFrameNumbers('octopusTeal', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'octopusTealLeftStun',
      frames: this.anims.generateFrameNumbers('octopusTeal', { start: 4, end: 6 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusTealLeftDie',
      frames: this.anims.generateFrameNumbers('octopusTeal', { start: 7, end: 9 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusTealRightWalk',
      frames: this.anims.generateFrameNumbers('octopusTeal', { start: 10, end: 13 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'octopusTealRightStun',
      frames: this.anims.generateFrameNumbers('octopusTeal', { start: 14, end: 16 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusTealRightDie',
      frames: this.anims.generateFrameNumbers('octopusTeal', { start: 17, end: 19 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusYellowLeftWalk',
      frames: this.anims.generateFrameNumbers('octopusYellow', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'octopusYellowLeftStun',
      frames: this.anims.generateFrameNumbers('octopusYellow', { start: 4, end: 6 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusYellowLeftDie',
      frames: this.anims.generateFrameNumbers('octopusYellow', { start: 7, end: 9 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusYellowRightWalk',
      frames: this.anims.generateFrameNumbers('octopusYellow', { start: 10, end: 13 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'octopusYellowRightStun',
      frames: this.anims.generateFrameNumbers('octopusYellow', { start: 14, end: 16 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'octopusYellowRightDie',
      frames: this.anims.generateFrameNumbers('octopusYellow', { start: 17, end: 19 }),
      frameRate: 10,
      repeat: 0
    });
  }
}

function powFunc(player: Phaser.Physics.Arcade.Sprite, pow: Phaser.Physics.Arcade.Sprite) {
  if (ifPow == false)
    ifPow = true;
}

function playerMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys, player: Phaser.Physics.Arcade.Sprite, playerHit: boolean) {
  if (!player.body.enable && (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown)) {
    var playerBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>player.body;

    player.body.enable = true;
    playerBody.allowGravity = true;
  }
  if (!playerHit) {
    if (cursors.left.isDown) {
      isTurnedLeft = true;
      if (!inAir && player.body.touching.down)
        player.anims.play('left', true);
      else
        player.anims.play('leftJump');
      player.setVelocityX(-PLAYERSPEED);
    }
    else if (cursors.right.isDown) {
      isTurnedLeft = false;
      if (!inAir && player.body.touching.down)
        player.anims.play('right', true);
      else
        player.anims.play('rightJump');
      player.setVelocityX(PLAYERSPEED);
    }
    else if (player.body.touching.down) {
      if (isTurnedLeft) {
        player.anims.play('left', true);
      }
      else {
        player.anims.play('right', true);
      }
      player.setVelocityX(0);
      player.anims.stop();
    }

    if (cursors.up.isDown && player.body.touching.down) {
      inAir = true;
      jumpSound.play();
      if (isTurnedLeft)
        player.anims.play('leftJump');
      else
        player.anims.play('rightJump');
      player.setVelocityY(JUMPAMOUNT);
      player.anims.stop();
    }
  }
}

function collectGem(player, gem) {
  collectSound.play();
  gem.disableBody(true, true);
  this.score += 10;
  this.scoreText.setText('Score: ' + this.score);
}

async function moveWall(player: Phaser.Physics.Arcade.Sprite, platform: Platform) {
  inAir = false;
  if (platform.body.touching.down && player.body.touching.up) {
    platform.isHitByPlayer = true;

    deathSound.play();
    var initPos = platform.y;
    platform.anims.play('deform');

    await delay(100);

    platform.body.touching.down = false;
    platform.body.touching.up = false;
    platform.setY(initPos);

    platform.isHitByPlayer = false;
  }
}

async function hitWater(player: Player, ball: Phaser.Physics.Arcade.Sprite) {
  if (!this.playerHit) {
    deathSound.play();
    this.playerHit = true;
    player.setTint(0xff0000);
    player.anims.pause();
    player.body.stop();
    player.body.enable = false;

    await delay(500);
    killAndRespawnPlayer(player);
    player.setTint(0xffffff);
    this.physics.resume();
    this.playerHit = false;
  }
}

async function hitBall(player: Player, ball: Phaser.Physics.Arcade.Sprite) {
  if (!this.playerHit) {
    deathSound.play();
    this.playerHit = true;
    player.setTint(0xff0000);
    player.anims.pause();
    player.body.stop();
    player.body.enable = false;

    await delay(500);

    ball.destroy();
    killAndRespawnPlayer(player);
    player.setTint(0xffffff);
    this.physics.resume();
    this.playerHit = false;
  }
}

async function hitEnemy(player: Player, enemey: Octopus) {
  if (!this.playerHit && !enemey.octopusVulnerable) {
    deathSound.play();
    this.playerHit = true;
    player.setTint(0xff0000);
    player.anims.pause();
    player.body.stop();
    player.body.enable = false;

    await delay(500);

    killAndRespawnPlayer(player);
    player.setTint(0xffffff);
    this.physics.resume();
    this.playerHit = false;
  }
  else if (enemey.octopusVulnerable) {
    if (enemey.previousVelocityX > 0) {
      enemey.anims.play(enemey.texture.key + 'RightDie', true);
    }
    else if (enemey.previousVelocityX < 0) {
      enemey.anims.play(enemey.texture.key + 'LeftDie', true);
    }
    enemey.disableBody();
    await delay(1000);
    enemey.destroy();
  }
}

async function octopusPlatformCollide(enemy1: Octopus, platform: Platform) {
  if (platform.isHitByPlayer && !enemy1.octopusVulnerable) {
    console.log("flipping enemy");
    console.log(enemy1);
    flipEnemy(enemy1);
  }
  else if (platform.isHitByPlayer && enemy1.octopusVulnerable) {
    console.log("player reseting enemy");
    resetEnemy(enemy1);

    await delay(1500);

    enemy1.velocityX = enemy1.previousVelocityX;
  }
}

async function flipEnemy(enemy1: Octopus) {
  if (enemy1.velocityX !== 0) {
    enemy1.previousVelocityX = enemy1.velocityX;
  }
  enemy1.octopusVulnerable = true;
  console.log("after flip");
  console.log(enemy1);
  enemy1.velocityX = 0;
  enemy1.y -= 50;
  if (enemy1.previousVelocityX > 0) {
    enemy1.anims.play(enemy1.texture.key + 'RightStun', true);
  }
  else {
    enemy1.anims.play(enemy1.texture.key + 'LeftStun', true);
  }

  await delay(5000);

  console.log(enemy1.octopusVulnerable);
  if (enemy1.octopusVulnerable) {
    console.log("enemy reseting");
    resetEnemy(enemy1);

    await delay(1500);
    //if (enemy1.octopusVulnerable) {
    console.log("updating speed");
    if (enemy1.velocityX === 0) {
      enemy1.updateOctopusSpeed();
    }
  }
}

function resetEnemy(enemy1: Octopus) {
  if (enemy1.previousVelocityX > 0) {
    enemy1.anims.playReverse(enemy1.texture.key + 'RightStun');
  }
  else {
    enemy1.anims.playReverse(enemy1.texture.key + 'LeftStun');
  }

  enemy1.octopusVulnerable = false;
}

async function enemiesCollide(enemy1: Phaser.Physics.Arcade.Sprite, enemy2: Phaser.Physics.Arcade.Sprite) {
  var octopus1: Octopus = <Octopus>enemy1;
  var octopus2: Octopus = <Octopus>enemy2;

  if (octopus1.velocityX != 0) {
    octopus1.velocityX *= -1;
  }
  if (octopus2.velocityX != 0) {
    octopus2.velocityX *= -1;
  }

  // not needed anymore if octopi stay on platforms
  // if (octopus1.y < octopus2.y) {
  //   octopus1.y -= OCTOPUSYBOUNCE * 2;
  //   if (octopus1.x > octopus2.x) {
  //     octopus1.x += OCTOPUSXBOUNCE;
  //     octopus2.x -= OCTOPUSXBOUNCE;
  //   }
  //   else {
  //     octopus1.x -= OCTOPUSXBOUNCE;
  //     octopus2.x += OCTOPUSXBOUNCE;
  //   }
  // }
  // else if (octopus1.y > octopus2.y) {
  //   octopus2.y -= OCTOPUSYBOUNCE * 2;
  //   if (octopus1.x > octopus2.x) {
  //     octopus1.x += OCTOPUSXBOUNCE;
  //     octopus2.x -= OCTOPUSXBOUNCE;
  //   }
  //   else {
  //     octopus1.x -= OCTOPUSXBOUNCE;
  //     octopus2.x += OCTOPUSXBOUNCE;
  //   }
  // }
}

async function killAndRespawnPlayer(player: Player) {
  player.setVisible(false);
  player.anims.play('left', true);
  player.anims.stop();
  player.body.stop();

  liveCount--;
  if (liveCount >= 0) {
    // remove head sprite
    var playerIconToRemove: Phaser.GameObjects.Sprite = player.playerLives[player.playerLives.length - 1];
    playerIconToRemove.destroy();
    player.playerLives.splice(player.playerLives.length - 1);

    player.setPosition(1000, 100);
    player.setVisible(true);
    player.body.enable = false;
    var playerBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>player.body;
    playerBody.allowGravity = false;

    await delay(5000);
    if (player !== null) {
      player.body.enable = true;
      playerBody.allowGravity = true;
    }
  }
  else {
    player.destroy();
  }
}

function transportToTop(enemey: Phaser.Physics.Arcade.Sprite, pipe) {
  enemey.y = LEVEL1_Y - 70;
  var octopus: Octopus = <Octopus>enemey;
  octopus.velocityX *= -1;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',

  type: Phaser.AUTO,

  width: 1860,
  height: 980,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false,
    },
  },
  scene: GameScene,
  parent: 'game',
  backgroundColor: '#000000',
};

class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener("load", () => {
  var game = new Game(gameConfig);
  this.game = game;
  this.game.scale.scaleMode = Phaser.Scale.ScaleModes.FIT;
});

window.addEventListener('resize', () => {
  this.game.scale.refresh();
});

// ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "msfullscreenchange"].forEach(
//   eventType => window.addEventListener(eventType, this.game.scale.refresh(), false)
// );
