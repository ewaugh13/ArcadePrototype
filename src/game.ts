import * as Phaser from 'phaser';
import { Octopus } from './objects/octopus'
import { OctopusColor } from './objects/octopus'
import { Platform } from './objects/platform'
import { Player } from './objects/player'
import { WSAEINTR } from 'constants';
import { Cannon } from './objects/cannons';
import { CannonBall } from './objects/cannonBall';
import { MainMenu } from './mainMenu';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

//Platform Gen Variables
var NUMBEROFLEVELS = 11;
var PLATFORMLENGTH = 20;
var PLATFORMWIDTH = 32;
var LEVELGAP = 250;
var STARTOFFSET = 1500;
var WALLSTART = 365;
var WALLEND = 1575;
//Level Y pos
var BASE = 4140;
var LEVEL1_Y = 3965;
var LEVEL2_Y = 3790;
var LEVEL3_Y = 3825;
var LEVEL4_Y = 3600;
var LEVEL5_Y = 3460;
var LEVEL6_Y = 3428;
var LEVEL7_Y = 3253;
var LEVEL8_Y = 3113;
var LEVEL9_Y = 3078;
var LEVEL10_Y = 2903;
var LEVEL11_Y = 2763;
var LEVEL12_Y = 2731;
var LEVEL13_Y = 2556;
var LEVEL14_Y = 2416;
var LEVEL15_Y = 2384;
var LEVEL16_Y = 2209;
var LEVEL17_Y = 2069;
var LEVEL18_Y = 2037;
var LEVEL19_Y = 1862;
var LEVEL20_Y = 1722;
var LEVEL21_Y = 1690;
var LEVEL22_Y = 1515;
var LEVEL23_Y = 1350;
var LEVEL24_Y = 1175;
var LEVEL25_Y = 1000;
var LEVEL26_Y = 825;
var LEVEL27_Y = 650;
var LEVEL28_Y = 475;
var LEVEL29_Y = 300;




//Gameplay variables
var PLAYERSPEED = 300;
var ENEMYSPEED = 100;
var CANNONSPEED = 300;
//var CANNONLIFE = -1;
var CLOUDSPEED = 0.5;
var WATERRISESPEED = -35;
var WATERDRAINSPEED = 100;
var enemyVel: number;
var liveCount: number;
// var OCTOPUSXBOUNCE: number = 50;
// var OCTOPUSYBOUNCE: number = 20;
var JUMPAMOUNT = -800;
var inAir = false;
var isTurnedLeft = false;
var ifPow: boolean = false;

var prevPosX;
var prevPosY
var camPrevPosY;
var score;
//Time
var timer: Phaser.Time.TimerEvent;
//SFX
var bgm: Phaser.Sound.BaseSound;
var collectSound: Phaser.Sound.BaseSound;           //Globals.. need to rescope these
var jumpSound: Phaser.Sound.BaseSound;
var deathSound: Phaser.Sound.BaseSound;
var cannonSound: Phaser.Sound.BaseSound;

export class GameScene extends Phaser.Scene {
  private sky: Phaser.GameObjects.Image;
  private clouds: Phaser.GameObjects.Image;
  private background: Phaser.GameObjects.Image;
  private player: Player;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private gems: Array<Phaser.Physics.Arcade.Sprite>;
  private scoreText: Phaser.GameObjects.Text;
  private enemies: Array<Phaser.Physics.Arcade.Sprite>;
  private cannons: Array<Cannon>;
  private cannonBall: CannonBall;
  private pipes: Phaser.Physics.Arcade.StaticGroup;
  private water: Phaser.Physics.Arcade.Sprite;
  private playerHit: boolean;
  private powEnemy: Array<Phaser.Physics.Arcade.Sprite>;
  private gameOverSprite: Phaser.GameObjects.Sprite;
  private winSprite: Phaser.GameObjects.Sprite;
  private winFlag: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super(sceneConfig);
  }

  public preload() {
    this.load.image('sky', 'src/assets/Sky_Layer.png');
    this.load.image('clouds', 'src/assets/Cloud_Layer.png')
    this.load.image('background', 'src/assets/Ship4.png');

    this.load.spritesheet('dude',
      'src/assets/player.png',
      { frameWidth: 83, frameHeight: 131, spacing: 2 });
    this.load.spritesheet('platformPlank',
      'src/assets/planksquash2_SpriteSheet.png',
      { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('cannonBall',
      'src/assets/CannonballAnimation_SpriteSheet2.png',
      { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('WinFlag',
      'src/assets/flagSpriteSheet.png',
      { frameWidth: 150, frameHeight: 150 });
    this.load.spritesheet('respawnPlatform', 'src/assets/PlatformSprites.png',
      { frameWidth: 83, frameHeight: 12, spacing: 2 });
    this.load.spritesheet('water', 'src/assets/waterSpritesheet.png',
      { frameWidth: 512, frameHeight: 256, spacing: 0 });
    this.load.spritesheet('chest', 'src/assets/ChestSprites.png',
      { frameWidth: 64, frameHeight: 61, spacing: 1 });

    this.load.spritesheet('octopusPink', 'src/assets/OctoSpritePink.png',
      { frameWidth: 64, frameHeight: 64, spacing: 2 });
    this.load.spritesheet('octopusTeal', 'src/assets/OctoSpriteTeal.png',
      { frameWidth: 64, frameHeight: 64, spacing: 2 });
    this.load.spritesheet('octopusYellow', 'src/assets/OctoSpriteYellow.png',
      { frameWidth: 64, frameHeight: 64, spacing: 2 });

    this.load.spritesheet('octopusPink', 'src/assets/OctoSpritePink.png',
      { frameWidth: 64, frameHeight: 64, spacing: 2 });
    this.load.image('playerIcon', 'src/assets/PlayerIcon.png');
    this.load.image('gem', 'src/assets/Gem.png');
    this.load.image('octopus', 'src/assets/Octopus01.png');
    this.load.image('cannon', 'src/assets/cannon.png');
    this.load.image('pipe', 'src/assets/Pipes.png');
    this.load.image('pow', 'src/assets/POW.png');
    this.load.image('gameOver', 'src/assets/GameOver.png');
    this.load.image('win', 'src/assets/Scurvy_Win.png');

    this.load.audio('bgm', 'src/assets/SFX/Music/Gameplay.wav');
    this.load.audio('collect', 'src/assets/SFX/Ruby.wav');
    this.load.audio('jump', 'src/assets/SFX/Jump or swim.wav');
    this.load.audio('death', 'src/assets/SFX/death-sound.wav');
    this.load.audio('cannonFire', 'src/assets/SFX/Howitzer_Cannon_Fire.mp3');
  }

  public create() {
    liveCount = 5;
    //Adding the SFX
    bgm = this.sound.add('bgm', { loop: true });
    bgm.play();
    collectSound = this.sound.add('collect');
    jumpSound = this.sound.add('jump');
    deathSound = this.sound.add('death');
    cannonSound = this.sound.add('cannonFire');
    this.physics.world.setBounds(330, 0, 1250, 4320);
    //Sky
    this.sky = this.add.image(0, 0, 'sky');
    this.sky.setOrigin(0, 0);
    //Clouds
    this.clouds = this.add.image(0, 0, 'clouds');
    this.clouds.setScale(0.5, 1);
    this.clouds.setOrigin(0, 0);
    //Background
    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0);

    //Init ScoreSystem
    score = 0;
    this.scoreText = this.add.text(50, 3250, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    // load all anims
    this.loadAnims();

    //Level Creation
    this.platforms = this.physics.add.staticGroup();


    // // creation of pipes
    // this.pipes = this.physics.add.staticGroup();
    // this.pipes.create(0, BASE - 50, 'pipe');
    // this.pipes.create(1920, BASE - 50, 'pipe');
    // this.pipes.create(0, LEVEL1_Y - 65, 'pipe');
    // this.pipes.create(1920, LEVEL1_Y - 65, 'pipe');

    //Platform Generation

    //OCTOPI
    this.enemies = new Array();
    //Winnning Flag
    this.winFlag = this.physics.add.sprite(1100, 100, 'WinFlag');
    this.winFlag.setScale(1.5);
    var flagBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>this.winFlag.body;
    flagBody.setAllowGravity(false);
    this.winFlag.anims.play('FlagAnim');
    //Pow enemey
    this.powEnemy = new Array();
    this.gems = new Array();
    //CANNONS and CANNONBALLS
    this.cannons = new Array();
    LevelGen(this, this.platforms, this.enemies, this.gems, this.powEnemy, this.cannons);
    //GenPlatforms(this.platforms); //Generates procedural platforms

    for (var i = 0; i < this.enemies.length; ++i) {
      this.enemies[i].setGravity(0, 1000);
    }

    //Water Init
    this.water = this.physics.add.sprite(950, 4800, 'water');
    this.water.anims.play('waterWaves', true);
    this.water.setAlpha(0.75);
    this.water.setScale(3.75, 3.75);
    var waterBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>this.water.body;
    waterBody.setAllowGravity(false);

    //Player Creation
    this.player = new Player(this, 500, BASE - 100);
    this.player.setScale(0.75);
    prevPosX = this.player.x;
    prevPosY = this.player.y;
    this.player.setGravity(0, 1500);
    this.playerHit = false;

    //this.player.setCollideWorldBounds(true); // (if uncommented comment out wrap in update())

    this.player.lastXPosition = this.player.body.position.x;
    this.player.lastYPosition = this.player.body.position.y;

    // player icon creation
    for (var i = 0; i < liveCount; i++) {
      var playerIconSprite: Phaser.GameObjects.Sprite = this.add.sprite(1700 + i * 40, 3265, 'playerIcon');
      this.player.playerLives.push(playerIconSprite);
    }

    //Collider to win
    this.physics.add.overlap(this.player, this.winFlag, this.ClearLevel, null, this);

    // collider between gems and platforms
    this.physics.add.overlap(this.player, this.gems, collectGem, null, this);
    this.physics.add.collider(this.gems, this.platforms);
    for (var i = 0; i < this.cannons.length; ++i)
      this.physics.add.collider(this.player, this.cannons[i].cannonBall, hitBall, null, this);

    // collider between play and platforms
    this.physics.add.collider(this.player, this.platforms, moveWall, null, this);
    //collider between player and enemyPow
    this.physics.add.collider(this.player, this.powEnemy, this.powEnemyFunc, null, this);
    // collider between player and water
    this.physics.add.overlap(this.player, this.water, hitWater, null, this);

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

    // gameover sprite
    this.gameOverSprite = this.add.sprite(this.player.body.position.x + 400, this.player.body.position.y - 150, 'gameOver');
    this.gameOverSprite.visible = false;

    // Win Sprite
    this.winSprite = this.add.sprite(this.player.body.position.x + 400, this.player.body.position.y + 150, 'win');
    this.winSprite.visible = false;

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
        enemy.setOctopusSpeed();
      }
    }

    //Camera Creation
    this.cameras.main.setBounds(0, 0, this.background.width, this.background.height);
    this.cameras.main.setViewport(0, 0, 1920, 1080);
    this.cameras.main.startFollow(this.player);
    camPrevPosY = this.cameras.main.worldView.y;
  }

  public update() {
    if (liveCount < 0) {
      bgm.stop();
      this.gameOverSprite.visible = true;
      var args: any[] = [this.scene];
      this.time.delayedCall(5000, waitForGameOver, args, null);
    }
    else if (liveCount > 0) {
      if (this.player.y > LEVEL19_Y) {
        this.physics.world.wrap(this.player);
        this.player.setCollideWorldBounds(false);
      }
      else {
        this.player.setCollideWorldBounds(true);
      }
      //Make water rise faster near the end
      if(this.water.y < LEVEL22_Y){
        WATERRISESPEED = -50;
      }
      //Move gameover and Win UI
      this.gameOverSprite.y = this.player.body.position.y - 150;
      this.winSprite.y = this.player.body.position.y + 150;
      //Move Clouds Up
      this.clouds.y -= CLOUDSPEED;
      //Cannon Mechanics
      CannonUpdate(this.cannons, this.player);

      //Keep score on the screen
      if (this.cameras.main.worldView.y - camPrevPosY < 100) {
        MoveUI(this.scoreText, this.cameras);
        for (var i = 0; i < this.player.playerLives.length; ++i)
          MoveUI(this.player.playerLives[i], this.cameras);
      }
      //Make water rise
      if (!ifPow) {
        this.water.setVelocityY(WATERRISESPEED);
      }
      else {
        // if (this.water.y > 4300) {
        //   this.chest.play('chestClosed', true);
        //   ifPow = false;
        // }
        // this.water.setVelocityY(WATERDRAINSPEED);
      }
      //this.physics.world.wrap(this.player);
      this.physics.world.wrap(this.enemies);
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
      if (liveCount >= 0) {
        playerMovement(this.input.keyboard.createCursorKeys(), this.player, this.playerHit);
      }
      if (!this.playerHit) {
        this.player.lastXPosition = this.player.x;
        this.player.lastYPosition = this.player.y;
        prevPosX = this.player.x;
        prevPosY = this.player.y;
      }
      camPrevPosY = this.cameras.main.worldView.y;
    }
  }

  private powEnemyFunc(player: Phaser.Physics.Arcade.Sprite, pow: Phaser.Physics.Arcade.Sprite) {
    if (pow.body.touching.down && player.body.touching.up) {
      var enemy: Octopus;
      pow.destroy();
      var i: number;
      for (i = 0; i < this.enemies.length; i++) {
        enemy = <Octopus>this.enemies[i];
        if ((enemy.y < pow.y + 540) && (enemy.y > pow.y - 540)) {
          if (enemy.body.wasTouching.down) {
            if (enemy.octopusVulnerable) {
              resetEnemy(enemy);
              //enemy.velocityX = enemy.previousVelocityX;
            }
            else {
              flipEnemy(enemy);
            }
          }
        }
      }
    }
  }

  private loadAnims() {
    // platform anims
    this.anims.create({
      key: 'deform',
      frames: this.anims.generateFrameNumbers('platformPlank', { start: 0, end: 6 }),
      frameRate: 30
    });

    // respawn anims
    this.anims.create({
      key: 'respawnPlatformCreate',
      frames: this.anims.generateFrameNumbers('respawnPlatform', { start: 0, end: 2 }),
      frameRate: .66
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
      frameRate: 20,
      repeat: -1
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 20,
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

    this.anims.create({
      key: 'playerDie',
      frames: [{ key: 'dude', frame: 10 }],
      delay: 5000,
      frameRate: 20,
    });

    this.anims.create({
      key: 'playerWin',
      frames: [{ key: 'dude', frame: 11 }],
      delay: 5000,
      frameRate: 10,
    });
    // canonBall anims
    this.anims.create({
      key: 'rotate',
      frames: this.anims.generateFrameNumbers('cannonBall', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    // chest anims
    this.anims.create({
      key: 'chestOpen',
      frames: this.anims.generateFrameNumbers('chest', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'chestClosed',
      frames: this.anims.generateFrameNumbers('chest', { start: 1, end: 0 }),
      frameRate: 10,
      repeat: 0
    });

    // water anims
    this.anims.create({
      key: 'waterWaves',
      frames: this.anims.generateFrameNumbers('water', { start: 0, end: 8 }),
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
    //Flag anims
    this.anims.create({
      key: 'FlagAnim',
      frames: this.anims.generateFrameNumbers('WinFlag', { start: 0, end: 17 }),
      frameRate: 10,
      repeat: -1
    });
  }

  private async ClearLevel(player, winFlag) {
    bgm.stop();
    this.winSprite.visible = true;
    player.body.enable = false;
    player.anims.play('playerWin');
    var args: any[] = [this.scene];
    this.time.delayedCall(6000, waitForGameOver, args, null);
  }
}



async function waitForGameOver(scene: Phaser.Scenes.ScenePlugin) {
  scene.start("MainMenu");
}

async function CannonUpdate(cannons: Array<Cannon>, player: Player) {
  for (var i = 0; i < cannons.length; ++i) {
    var theta1 = Math.atan((player.y - cannons[i].getCenter().y) / (player.x - cannons[i].getCenter().x));
    var theta2 = Math.atan((prevPosY - cannons[i].getCenter().y) / (prevPosX - cannons[i].getCenter().x));
    var deltaT = Math.min(Math.max(((theta1 - theta2) * (180 / Math.PI)), -1), 1);
    if (cannons[i].angle < -90)
      cannons[i].angle = -90;
    else if (cannons[i].angle > 90)
      cannons[i].angle = 90;
    else
      cannons[i].angle += deltaT;

    if (cannons[i].cannonBall.cannonLife > 0) {
      cannons[i].cannonBall.cannonLife -= 1;
    }
    if (cannons[i].cannonBall.cannonLife == 0) {
      cannons[i].cannonBall.setVisible(false);
      cannons[i].cannonBall.body.enable = false;
      cannons[i].cannonBall.x = 0;
      cannons[i].cannonBall.y = 0;
    }

    //Cannon shoot logic
    if ((player.y > cannons[i].y - 500) && (player.y < cannons[i].y + 500)) {
      if (cannons[i].cannonBall.cannonLife == 0 || cannons[i].cannonBall.cannonLife == -1) {
        cannons[i].cannonBall.cannonLife = 1000;
        await delay(3000);
        cannons[i].setTint(0xff0000);
        await delay(1000);
        cannons[i].setTint(0xffffff);
        cannonSound.play();
        cannons[i].cannonBall.body.enable = true;
        cannons[i].cannonBall.setVisible(true);
        cannons[i].cannonBall.x = cannons[i].getRightCenter().x;
        cannons[i].cannonBall.y = cannons[i].getRightCenter().y;
        cannons[i].cannonBall.setVelocityX(CANNONSPEED);
        //cannonBall.setVelocityY(cannonBall.velocityY);
        // cannonBall.setVelocityX((player.x/(Math.sqrt(Math.pow(player.x,2) + Math.pow(player.y,2)))) * CANNONSPEED);
        // cannonBall.setVelocityY((player.y/(Math.sqrt(Math.pow(player.x,2) + Math.pow(player.y,2)))) * CANNONSPEED);
      }
    }
  }
}

function LevelGen(scene: Phaser.Scene, platforms: Phaser.Physics.Arcade.StaticGroup, enemies: Array<Phaser.Physics.Arcade.Sprite>,
  gems: Array<Phaser.Physics.Arcade.Sprite>, powEnemy: Array<Phaser.Physics.Arcade.Sprite>, cannons: Array<Cannon>) {

  // octopus goes 44 pixels above the platform height
  // its max x is 32 minus platform end x
  // its min x is 32 minus platform start x

  var octopusXDiff: number = 32;
  var octopusYDiff: number = 44;
  var gemYDiff: number = 28;

  cannons.push(new Cannon(scene, 300, 3000, 90));

  //Base
  for (var i = 0; i < 38; ++i) {
    platforms.create(365 + i * 32, BASE, 'platformPlank');
  }

  //Level 1 left side wide
  for (var i = 0; i < 16; i++) {
    platforms.create(370 + i * 32, LEVEL1_Y, 'platformPlank');
  }

  var octopusLevel1_1: Octopus = new Octopus(scene, 400, LEVEL1_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel1_1.setXRange(338, 818);
  enemies.push(octopusLevel1_1);

  //Level 1 right side wide
  for (var i = 0; i < 16; i++) {
    platforms.create(1072 + i * 32, LEVEL1_Y, 'platformPlank');
  }

  var octopusLevel1_3: Octopus = new Octopus(scene, 1100, LEVEL1_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel1_3.setXRange(1040, 1520);
  // var octopusLevel1_4: Octopus = new Octopus(scene, 1300, 3956, 0);
  // octopusLevel1_4.setXRange(1148, 1340);
  enemies.push(octopusLevel1_3);

  // level 2 center side
  for (var i = 0; i < 17; i++) {
    platforms.create(704 + i * 32, LEVEL2_Y, 'platformPlank');
  }

  var octopusLevel2_1: Octopus = new Octopus(scene, 750, LEVEL2_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel2_1.setXRange(672, 1184);
  enemies.push(octopusLevel2_1);

  // level 2 right side
  for (var i = 0; i < 5; i++) {
    platforms.create(1423 + i * 32, LEVEL3_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(1521, LEVEL3_Y - gemYDiff, 'gem'));
  // level 2 left side
  for (var i = 0; i < 5; i++) {
    platforms.create(370 + i * 32, LEVEL3_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(400, LEVEL3_Y - gemYDiff, 'gem'));


  // POW 1
  var pow1 = scene.physics.add.sprite(960, LEVEL3_Y + 10, 'pow');
  powEnemy.push(pow1);

  // level 3 left side
  for (var i = 0; i < 14; i++) {
    platforms.create(370 + i * 32, LEVEL4_Y, 'platformPlank');
  }

  var octopusLevel3_1: Octopus = new Octopus(scene, 400, LEVEL4_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel3_1.setXRange(338, 754);
  var octopusLevel3_2: Octopus = new Octopus(scene, 600, LEVEL4_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel3_2.setXRange(338, 754);
  enemies.push(octopusLevel3_1);
  enemies.push(octopusLevel3_2);

  // level 3 right side
  for (var i = 0; i < 14; i++) {
    platforms.create(1133 + i * 32, LEVEL4_Y, 'platformPlank');
  }

  var octopusLevel3_3: Octopus = new Octopus(scene, 1200, LEVEL4_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel3_3.setXRange(1101, 1517);
  //var octopusLevel3_4: Octopus = new Octopus(scene, 1400, LEVEL4_Y - octopusYDiff, 0);
  //octopusLevel3_4.setXRange(1101, 1517);
  enemies.push(octopusLevel3_3);
  //enemies.push(octopusLevel3_4);

  //level 4 left side
  for (var i = 0; i < 5; i++) {
    platforms.create(370 + i * 32, LEVEL5_Y, 'platformPlank');
  }

  gems.push(scene.physics.add.sprite(400, LEVEL5_Y - gemYDiff, 'gem'));

  // level 4 right side
  for (var i = 0; i < 5; i++) {
    platforms.create(1423 + i * 32, LEVEL5_Y, 'platformPlank');
  }
  //level 4 center side
  for (var i = 0; i < 17; i++) {
    platforms.create(704 + i * 32, LEVEL6_Y, 'platformPlank');
  }

  var octopusLevel4_1: Octopus = new Octopus(scene, 900, LEVEL6_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel4_1.setXRange(672, 1184);
  enemies.push(octopusLevel4_1);

  //level 5 left side
  for (var i = 0; i < 16; i++) {
    platforms.create(370 + i * 32, LEVEL7_Y, 'platformPlank');
  }
  //level 5 right side
  for (var i = 0; i < 16; i++) {
    platforms.create(1072 + i * 32, LEVEL7_Y, 'platformPlank');
  }
  //level 6 left side little
  for (var i = 0; i < 5; i++) {
    platforms.create(370 + i * 32, LEVEL8_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(380, LEVEL8_Y - gemYDiff, 'gem'));
  gems.push(scene.physics.add.sprite(420, LEVEL8_Y - gemYDiff, 'gem'));
  //level 6 right side little
  for (var i = 0; i < 5; i++) {
    platforms.create(1423 + i * 32, LEVEL8_Y, 'platformPlank');
  }
  //level 6 center side
  for (var i = 0; i < 17; i++) {
    platforms.create(704 + i * 32, LEVEL9_Y, 'platformPlank');
  }

  var octopusLevel6_1: Octopus = new Octopus(scene, 800, LEVEL9_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel6_1.setXRange(672, 1184);
  enemies.push(octopusLevel6_1);

  var octopusLevel6_2: Octopus = new Octopus(scene, 1200, LEVEL9_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel6_2.setXRange(672, 1184);
  enemies.push(octopusLevel6_2);

  //level 7 left side wide
  for (var i = 0; i < 16; i++) {
    platforms.create(370 + i * 32, LEVEL10_Y, 'platformPlank');
  }
  //Level 7 right side wide
  for (var i = 0; i < 16; i++) {
    platforms.create(1072 + i * 32, LEVEL10_Y, 'platformPlank');
  }

  // POW 2
  var pow2 = scene.physics.add.sprite(960, LEVEL10_Y - 20, 'pow');
  powEnemy.push(pow2);

  //level 8 left side little
  for (var i = 0; i < 5; i++) {
    platforms.create(370 + i * 32, LEVEL11_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(400, LEVEL11_Y - gemYDiff, 'gem'));
  //level 8 right side little
  for (var i = 0; i < 5; i++) {
    platforms.create(1423 + i * 32, LEVEL11_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(1521, LEVEL11_Y - gemYDiff, 'gem'));
  //level 8 center side
  for (var i = 0; i < 17; i++) {
    platforms.create(704 + i * 32, LEVEL12_Y, 'platformPlank');
  }

  var octopusLevel8_1: Octopus = new Octopus(scene, 800, LEVEL12_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel8_1.setXRange(672, 1184);
  enemies.push(octopusLevel8_1);

  var octopusLevel8_2: Octopus = new Octopus(scene, 950, LEVEL12_Y - octopusYDiff, 0, OctopusColor.Teal);
  octopusLevel8_2.setXRange(672, 1184);
  enemies.push(octopusLevel8_2);

  var octopusLevel8_3: Octopus = new Octopus(scene, 1100, LEVEL12_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel8_3.setXRange(672, 1184);
  enemies.push(octopusLevel8_3);

  //level 9 left side wide
  for (var i = 0; i < 16; i++) {
    platforms.create(370 + i * 32, LEVEL13_Y, 'platformPlank');
  }
  //Level 9 right side wide
  for (var i = 0; i < 16; i++) {
    platforms.create(1072 + i * 32, LEVEL13_Y, 'platformPlank');
  }

  //level 10 left side little
  for (var i = 0; i < 5; i++) {
    platforms.create(370 + i * 32, LEVEL14_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(380, LEVEL14_Y - gemYDiff, 'gem'));
  gems.push(scene.physics.add.sprite(480, LEVEL14_Y - gemYDiff, 'gem'));

  var octopusLevel14_1: Octopus = new Octopus(scene, 450, LEVEL14_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel14_1.setXRange(338, 466);
  enemies.push(octopusLevel14_1);

  //level 10 right side little
  for (var i = 0; i < 5; i++) {
    platforms.create(1423 + i * 32, LEVEL14_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(1431, LEVEL14_Y - gemYDiff, 'gem'));
  gems.push(scene.physics.add.sprite(1531, LEVEL14_Y - gemYDiff, 'gem'));

  var octopusLevel14_2: Octopus = new Octopus(scene, 1501, LEVEL14_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel14_2.setXRange(1391, 1519);
  enemies.push(octopusLevel14_2);

  //level 10 center side
  for (var i = 0; i < 17; i++) {
    platforms.create(704 + i * 32, LEVEL15_Y, 'platformPlank');
  }

  var octopusLevel15_1: Octopus = new Octopus(scene, 900, LEVEL15_Y - octopusYDiff, 0, OctopusColor.Teal);
  octopusLevel15_1.setXRange(672, 1184);
  enemies.push(octopusLevel15_1);

  var octopusLevel15_2: Octopus = new Octopus(scene, 1200, LEVEL15_Y - octopusYDiff, 0, OctopusColor.Teal);
  octopusLevel15_2.setXRange(672, 1184);
  enemies.push(octopusLevel15_2);

  //level 11 left side wide
  for (var i = 0; i < 16; i++) {
    platforms.create(370 + i * 32, LEVEL16_Y, 'platformPlank');
  }

  var octopusLevel16_1: Octopus = new Octopus(scene, 550, LEVEL16_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel16_1.setXRange(338, 818);
  enemies.push(octopusLevel16_1);

  //Level 11 right side wide
  for (var i = 0; i < 16; i++) {
    platforms.create(1072 + i * 32, LEVEL16_Y, 'platformPlank');
  }

  var octopusLevel16_2: Octopus = new Octopus(scene, 1202, LEVEL16_Y - octopusYDiff, 0, OctopusColor.Teal);
  octopusLevel16_2.setXRange(1040, 1520);
  enemies.push(octopusLevel16_2);

  var octopusLevel16_3: Octopus = new Octopus(scene, 1502, LEVEL16_Y - octopusYDiff, 0, OctopusColor.Yellow);
  octopusLevel16_3.setXRange(1040, 1520);
  enemies.push(octopusLevel16_3);


  //level 12 left side little
  for (var i = 0; i < 5; i++) {
    platforms.create(370 + i * 32, LEVEL17_Y, 'platformPlank');
  }
  //level 12 right side little
  for (var i = 0; i < 5; i++) {
    platforms.create(1423 + i * 32, LEVEL17_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(1521, LEVEL17_Y - gemYDiff, 'gem'));


  // POW 3
  var pow3 = scene.physics.add.sprite(1500, LEVEL17_Y - 160, 'pow');
  powEnemy.push(pow3);

  //level 12 center side
  for (var i = 0; i < 17; i++) {
    platforms.create(704 + i * 32, LEVEL18_Y, 'platformPlank');
  }

  var octopusLevel18_1: Octopus = new Octopus(scene, 800, LEVEL18_Y - octopusYDiff, 0, OctopusColor.Yellow);
  octopusLevel18_1.setXRange(672, 1184);
  enemies.push(octopusLevel18_1);

  var octopusLevel18_2: Octopus = new Octopus(scene, 1202, LEVEL18_Y - octopusYDiff, 0, OctopusColor.Yellow);
  octopusLevel18_2.setXRange(672, 1184);
  enemies.push(octopusLevel18_2);

  //level 13 left side wide
  for (var i = 0; i < 15; i++) {
    platforms.create(390 + i * 32, LEVEL19_Y, 'platformPlank');
  }
  //Level 13 right side wide
  for (var i = 0; i < 15; i++) {
    platforms.create(1072 + i * 32, LEVEL19_Y, 'platformPlank');
  }
  //level 14 left side little
  for (var i = 0; i < 4; i++) {
    platforms.create(450 + i * 32, LEVEL20_Y, 'platformPlank');
  }
  //level 14 right side little
  for (var i = 0; i < 4; i++) {
    platforms.create(1373 + i * 32, LEVEL20_Y, 'platformPlank');
  }
  //level 14 center side
  for (var i = 0; i < 15; i++) {
    platforms.create(736 + i * 32, LEVEL21_Y, 'platformPlank');
  }

  var octopusLevel21_1: Octopus = new Octopus(scene, 800, LEVEL21_Y - octopusYDiff, 0, OctopusColor.Teal);
  octopusLevel21_1.setXRange(704, 1152);
  enemies.push(octopusLevel21_1);

  var octopusLevel21_2: Octopus = new Octopus(scene, 900, LEVEL21_Y - octopusYDiff, 0, OctopusColor.Yellow);
  octopusLevel21_2.setXRange(704, 1152);
  enemies.push(octopusLevel21_2);

  var octopusLevel21_3: Octopus = new Octopus(scene, 1000, LEVEL21_Y - octopusYDiff, 0, OctopusColor.Yellow);
  octopusLevel21_3.setXRange(704, 1152);
  enemies.push(octopusLevel21_3);

  var octopusLevel21_4: Octopus = new Octopus(scene, 1100, LEVEL21_Y - octopusYDiff, 0, OctopusColor.Pink);
  octopusLevel21_4.setXRange(704, 1152);
  enemies.push(octopusLevel21_4);

  cannons.push(new Cannon(scene, 350, LEVEL18_Y, 90));
  cannons.push(new Cannon(scene, 500, LEVEL22_Y - 20, 90));

  console.log(cannons);


  //level 15 left side wide
  for (var i = 0; i < 7; i++) {
    platforms.create(585 + i * 32, LEVEL22_Y, 'platformPlank');
  }
  //Level 15 right side wide
  for (var i = 0; i < 7; i++) {
    platforms.create(1120 + i * 32, LEVEL22_Y, 'platformPlank');
  }
  //Level 15 center
  for (var i = 0; i < 10; i++) {
    platforms.create(825 + i * 32, LEVEL23_Y, 'platformPlank');
  }

  var octopusLevel23_1: Octopus = new Octopus(scene, 900, LEVEL23_Y - octopusYDiff, 0, OctopusColor.Yellow);
  octopusLevel23_1.setXRange(793, 1081);
  enemies.push(octopusLevel23_1);

  //Level 16 right side wide
  for (var i = 0; i < 6; i++) {
    platforms.create(885 + i * 32, LEVEL24_Y, 'platformPlank');
  }

  var octopusLevel24_1: Octopus = new Octopus(scene, 900, LEVEL24_Y - octopusYDiff, 0, OctopusColor.Yellow);
  octopusLevel24_1.setXRange(853, 1013);
  enemies.push(octopusLevel24_1);

  //Level 17 Center
  for (var i = 0; i < 3; i++) {
    platforms.create(929 + i * 32, LEVEL25_Y, 'platformPlank');
  }
  //level 18 left side wide
  for (var i = 0; i < 3; i++) {
    platforms.create(833 + i * 32, LEVEL26_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(850, LEVEL26_Y - gemYDiff, 'gem'));
  //Level 18 right side wide
  for (var i = 0; i < 3; i++) {
    platforms.create(1025 + i * 32, LEVEL26_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(1072, LEVEL26_Y - gemYDiff, 'gem'));

  //Level 19 Center
  for (var i = 0; i < 3; i++) {
    platforms.create(929 + i * 32, LEVEL27_Y, 'platformPlank');
  }
  //level 20 left side wide
  for (var i = 0; i < 3; i++) {
    platforms.create(835 + i * 32, LEVEL28_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(850, LEVEL28_Y - gemYDiff, 'gem'));
  //Level 20 right side wide
  for (var i = 0; i < 3; i++) {
    platforms.create(1020 + i * 32, LEVEL28_Y, 'platformPlank');
  }
  gems.push(scene.physics.add.sprite(1072, LEVEL28_Y - gemYDiff, 'gem'));

  //Level 21 Center
  for (var i = 0; i < 3; i++) {
    platforms.create(929 + i * 32, LEVEL29_Y, 'platformPlank');
  }


  //To be done at the end of this method after pushing all POW blocks
  for (var i = 0; i < powEnemy.length; ++i) {
    powEnemy[i].setScale(2);
    var powEnemyBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>powEnemy[i].body;
    powEnemyBody.setAllowGravity(false);
    powEnemyBody.immovable = true;
  }

  for (var i = 0; i < cannons.length; ++i) {
    var cannonBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>cannons[i].body;
    cannonBody.setAllowGravity(false);
    cannons[i].angle = cannons[i].startAngle;
    cannons[i].cannonBall = new CannonBall(scene, 0, 0, CANNONSPEED, 0);
    cannons[i].cannonBall.anims.play('rotate');
    cannons[i].cannonBall.setCollideWorldBounds(true);
    cannons[i].cannonBall.setGravity(0, 300);

    cannons[i].cannonBall.setBounce(1);
    cannons[i].cannonBall.setVisible(false);
    cannons[i].cannonBall.body.enable = false;
    scene.physics.add.collider(platforms, cannons[i].cannonBall, ChangeVel, null, scene);
  }

}

function GenPlatforms(platforms: Phaser.Physics.Arcade.StaticGroup) {
  //Loop Variables
  var i: number;
  var j: number;
  var k: number;
  for (i = 0; i < NUMBEROFLEVELS; i++) {
    var seed = WALLSTART + Math.random() * ((WALLEND - WALLSTART) - (PLATFORMLENGTH * PLATFORMWIDTH));  //left wall: 353, width till right wall: 1203(1566-353-platformlength)
    for (j = 0; j < PLATFORMLENGTH; j++) {
      if (i == 9) {
        for (k = 0; k < ((WALLEND - WALLSTART) / PLATFORMWIDTH); k++) {
          var x = WALLSTART + (k * PLATFORMWIDTH);
          var y = STARTOFFSET + (i * LEVELGAP);
          platforms.create(WALLSTART + (j * PLATFORMWIDTH), STARTOFFSET + (i * LEVELGAP), 'platformPlank');
        }
      }
      else
        platforms.create(seed + (j * PLATFORMWIDTH), STARTOFFSET + (i * LEVELGAP), 'platformPlank');
    }
  }
}

function chestFunc(player: Phaser.Physics.Arcade.Sprite, chest: Phaser.Physics.Arcade.Sprite) {
  if (ifPow == false)
    ifPow = true;
  chest.anims.play('chestOpen', true);
}

function playerMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys, player: Player, playerHit: boolean) {
  if (!player.body.enable && (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown)) {
    var playerBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>player.body;
    if (player.respawnPlatform !== undefined) {
      player.respawnPlatform.destroy();
    }

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
    if (inAir) {
      if ((player.y - player.lastYPosition) > 0) {
        // inAir =false;
        // player.setVelocityY(-JUMPAMOUNT/2);
      }
    }
  }
  else {
    player.anims.play('playerDie');
    player.y += 5;
  }
}

function MoveUI(element, camera) {
  element.y += camera.main.worldView.y - camPrevPosY;
}

function collectGem(player: Player, gem) {
  collectSound.play();
  gem.disableBody(true, true);
  score += 10;
  this.scoreText.setText('Score: ' + score);
}

function ChangeVel(platforms, cannonBall: CannonBall) {

  if (platforms.body.touching.up || platforms.body.touching.down) {
    cannonBall.velocityY = -cannonBall.velocityY;
    //cannonBall.setVelocityY(cannonBall.velocityY);
  }
  else if (platforms.body.touching.left || platforms.body.touching.right) {
    cannonBall.velocityX = -cannonBall.velocityX;
    //cannonBall.setVelocityY(cannonBall.velocityX);
  }
}

async function moveWall(player: Phaser.Physics.Arcade.Sprite, platform: Platform) {

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
  else {
    inAir = false;
  }
}

async function hitWater(player: Player, water: Phaser.Physics.Arcade.Sprite) {
  if (!this.playerHit && player.body.position.y + 65.5 > water.body.position.y) {
    deathSound.play();
    this.playerHit = true;
    player.setTint(0xff0000);
    player.anims.pause();
    player.body.stop();
    player.body.enable = false;

    await delay(500);
    killAndRespawnPlayerWater(player, water);
    player.setTint(0xffffff);
    this.physics.resume();
    this.playerHit = false;
  }
}

async function hitBall(player: Player, ball: CannonBall) {
  if (!this.playerHit) {
    deathSound.play();
    this.playerHit = true;
    player.setTint(0xff0000);
    player.anims.pause();
    player.body.stop();
    player.body.enable = false;

    await delay(500);

    ball.cannonLife = 0;
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
    if (enemey.octopusColor == OctopusColor.Pink)
      score += 2;
    else if (enemey.octopusColor == OctopusColor.Teal)
      score += 4;
    else if (enemey.octopusColor == OctopusColor.Yellow)
      score += 6;
    this.scoreText.setText('Score: ' + score);
  }
}

async function octopusPlatformCollide(enemy1: Octopus, platform: Platform) {
  if (platform.isHitByPlayer && !enemy1.octopusVulnerable) {
    flipEnemy(enemy1);
  }
  else if (platform.isHitByPlayer && enemy1.octopusVulnerable) {
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
  enemy1.velocityX = 0;
  enemy1.y -= 50;
  if (enemy1.previousVelocityX > 0) {
    enemy1.anims.play(enemy1.texture.key + 'RightStun', true);
  }
  else {
    enemy1.anims.play(enemy1.texture.key + 'LeftStun', true);
  }

  await delay(3000);

  if (enemy1.octopusVulnerable) {
    enemy1.octopusVulnerable = false;
    resetEnemy(enemy1);
  }
}

async function resetEnemy(enemy1: Octopus) {
  if (enemy1 !== undefined && enemy1 != undefined) {
    if (enemy1.previousVelocityX > 0) {
      enemy1.anims.playReverse(enemy1.texture.key + 'RightStun');
    }
    else {
      enemy1.anims.playReverse(enemy1.texture.key + 'LeftStun');
    }
  }

  await delay(1500);

  if (enemy1.velocityX === 0 && !enemy1.octopusVulnerable) {
    enemy1.updateOctopusSpeed();
  }
  else {
    enemy1.velocityX = enemy1.previousVelocityX;
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

    player.setPosition(player.lastXPosition, player.lastYPosition - 50);
    player.setVisible(true);
    player.body.enable = false;
    var playerBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>player.body;
    playerBody.allowGravity = false;

    player.respawnPlatform = player.playerScene.add.sprite(player.lastXPosition, player.lastYPosition + 4, 'respawnPlatform');
    player.respawnPlatform.anims.play('respawnPlatformCreate', true);

    await delay(5000);
    player.respawnPlatform.destroy();
    if (player !== null) {
      player.body.enable = true;
      playerBody.allowGravity = true;
    }
  }
  else {
    player.destroy();
  }
}

async function killAndRespawnPlayerWater(player: Player, water: Phaser.Physics.Arcade.Sprite) {
  player.setVisible(false);
  player.anims.play('left', true);
  player.anims.stop();
  player.body.stop();

  liveCount--;
  // remove head sprite
  var playerIconToRemove: Phaser.GameObjects.Sprite = player.playerLives[player.playerLives.length - 1];
  playerIconToRemove.destroy();
  player.playerLives.splice(player.playerLives.length - 1);
  if (liveCount > 0) {

    player.setPosition(player.lastXPosition, water.body.position.y - 100);
    player.setVisible(true);
    player.body.enable = false;
    var playerBody: Phaser.Physics.Arcade.Body = <Phaser.Physics.Arcade.Body>player.body;
    playerBody.allowGravity = false;

    player.respawnPlatform = player.playerScene.add.sprite(player.lastXPosition, water.body.position.y - 100 + 54, 'respawnPlatform');
    player.respawnPlatform.anims.play('respawnPlatformCreate', true);

    await delay(5000);
    player.respawnPlatform.destroy();
    if (player !== null) {
      player.body.enable = true;
      playerBody.allowGravity = true;
    }
  }
  else {
    liveCount = -1;
    player.destroy();
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',

  type: Phaser.AUTO,

  width: 1920,
  height: 4320,

  physics: {
    default: 'arcade',
    arcade: {
      //gravity: { y: 1000 },
      debug: false
    },
  },
  scene: [MainMenu, GameScene],
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