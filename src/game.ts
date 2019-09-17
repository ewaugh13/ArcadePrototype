import * as Phaser from 'phaser';
import { Octopus } from './objects/octopus'
import { Platform } from './objects/platform'
import { Player } from './objects/player'
import { WSAEINTR } from 'constants';
import { CannonBall } from './objects/cannonBall';

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

var PLAYERSPEED = 300;
var ENEMYSPEED = 100;
var CANNONSPEED = 1000;
var CANNONLIFE = -1;
var LEVEL1_Y = 3240 + 150;
var LEVEL2_Y = 3240 + 400;
var LEVEL3_Y = 3240 + 650;
var LEVEL4_Y = 3240 + 150;
var LEVEL5_Y = 3240 + 400;
var LEVEL6_Y = 3240 + 650;
var LEVEL7_Y = 3240 + 150;
var LEVEL8_Y = 3240 + 400;
var LEVEL9_Y = 3240 + 650;
var BASE = 3240 + 900;
var enemyVel: number;
var liveCount: number = 3;
// var OCTOPUSXBOUNCE: number = 50;
// var OCTOPUSYBOUNCE: number = 20;
var JUMPAMOUNT = -600;
var inAir = false;
var isTurnedLeft = false;
var ifPow: boolean = false;
var prevPosX;
var prevPosY
var camPrevPosY;
//Time
var timer: Phaser.Time.TimerEvent;
//SFX
var bgm: Phaser.Sound.BaseSound;
var collectSound: Phaser.Sound.BaseSound;           //Globals.. need to rescope these
var jumpSound: Phaser.Sound.BaseSound;
var deathSound: Phaser.Sound.BaseSound;
var cannonSound: Phaser.Sound.BaseSound;
export class GameScene extends Phaser.Scene {
  private background: Phaser.GameObjects.Image;
  private player: Player;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private gems: Phaser.GameObjects.Group;
  private score: number;
  private scoreText: Phaser.GameObjects.Text;
  private enemies: Array<Phaser.Physics.Arcade.Sprite>;
  private cannons;
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
    this.load.image('octopus', 'src/assets/Octopus01.png');
    this.load.image('cannon', 'src/assets/cannon.png');
    this.load.image('pipe', 'src/assets/Pipes.png');
    this.load.image('water', 'src/assets/Water.png');
    this.load.image('pow', 'src/assets/POW.png');

    this.load.audio('bgm', 'src/assets/SFX/Music/bgm.wav');
    this.load.audio('collect', 'src/assets/SFX/Ruby.wav');
    this.load.audio('jump', 'src/assets/SFX/Jump or swim.wav');
    this.load.audio('death', 'src/assets/SFX/death-sound.wav');
    this.load.audio('cannonFire', 'src/assets/SFX/Howitzer_Cannon_Fire.mp3');
  }

  public create() {
    //Adding the SFX
    bgm = this.sound.add('bgm', { loop: true });
    bgm.play();
    collectSound = this.sound.add('collect');
    jumpSound = this.sound.add('jump');
    deathSound = this.sound.add('death');
    cannonSound = this.sound.add('cannonFire');

    //Background
    this.background = this.add.image(0, 0, 'background');
    this.background.setOrigin(0, 0);

    //Init ScoreSystem
    this.score = 0;
    this.scoreText = this.add.text(100, 3250, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // load all anims
    this.loadAnims();

    //Level Creation
    this.platforms = this.physics.add.staticGroup();

    //Base
    for (var i = 0; i < 38; ++i) {
      var platform: Platform = new Platform(this, 365 + i * 32, BASE);
      this.platforms.add(platform);
    }

    // // creation of pipes
    // this.pipes = this.physics.add.staticGroup();
    // this.pipes.create(0, BASE - 50, 'pipe');
    // this.pipes.create(1920, BASE - 50, 'pipe');
    // this.pipes.create(0, LEVEL1_Y - 65, 'pipe');
    // this.pipes.create(1920, LEVEL1_Y - 65, 'pipe');

    //Platform Generation

    LevelGen(this.platforms);
    //GenPlatforms(this.platforms);


    //Water Init
    this.water = this.physics.add.sprite(1000, 4300, 'water');
    this.water.setY(this.water.y + this.water.width * 5);
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
    this.player = new Player(this, 500, BASE - 100);
    this.player.setScale(0.75);
    prevPosX = this.player.x;
    prevPosY = this.player.y;
    this.playerHit = false;
    this.player.setCollideWorldBounds(true); // (if uncommented comment out wrap in update())

    // player icon creation
    for (var i = 0; i < liveCount; i++) {
      var playerIconSprite: Phaser.GameObjects.Sprite = this.add.sprite(1700 + i * 40, 3265, 'playerIcon');
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

    //CANNONS and CANNONBALLS
    this.cannons = this.physics.add.sprite(300, 3000, 'cannon');
    this.cannons.body.setAllowGravity(false);
    this.cannons.angle = 90;
    this.cannonBall = this.physics.add.sprite(0,0, 'cannonBall');
    this.cannonBall.anims.play('rotate');
    this.cannonBall.setCollideWorldBounds(true);
    this.cannonBall.setBounce(1);
    this.cannonBall.setVisible(false);
    this.cannonBall.body.enable = false;
    this.physics.add.collider(this.player, this.cannonBall, hitBall, null, this);
    this.physics.add.collider(this.platforms, this.cannonBall);

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
    // this.physics.add.collider(this.enemies, this.pipes, transportToTop, null, this);

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

    //Camera Creation
    this.cameras.main.setBounds(0, 0, this.background.width, this.background.height);
    this.cameras.main.setViewport(0, 0, 1920, 1080);
    this.cameras.main.startFollow(this.player);
    camPrevPosY = this.cameras.main.worldView.y;
  }

  public update() {

    //Cannon Mechanics
    CannonUpdate(this.cannons, this.cannonBall, this.player);
    
    //Keep score on the screen
    //console.log();
    if(this.cameras.main.worldView.y - camPrevPosY < 100){
      MoveUI(this.scoreText,this.cameras);
      for(var i =0; i< this.player.playerLives.length; ++i)
        MoveUI(this.player.playerLives[i],this.cameras);
    }
    //Make water rise
    if (!ifPow) {
      this.water.setVelocityY(-10);
    }
    else {
      if (this.water.y > 4300) {
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
    prevPosX = this.player.x;
    prevPosY = this.player.y;
    camPrevPosY = this.cameras.main.worldView.y;
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

async function CannonUpdate(cannons, cannonBall, player) {
  //Cannon follow player
  var theta1 = Math.atan((player.y - cannons.getCenter().y) / (player.x - cannons.getCenter().x));
  var theta2 = Math.atan((prevPosY - cannons.getCenter().y) / (prevPosX - cannons.getCenter().x));
  var deltaT = Math.min(Math.max(((theta1 - theta2) * (180 / Math.PI)), -1), 1);
  if (cannons.angle < -90)
    cannons.angle = -90;
  else if (cannons.angle > 90)
    cannons.angle = 90;
  else
    cannons.angle += deltaT;

  if (CANNONLIFE > 0) {
    CANNONLIFE = CANNONLIFE - 1;
  }
  if (CANNONLIFE == 0) {
    cannonBall.setVisible(false);
    cannonBall.body.enable = false;
    cannonBall.x = 0;
    cannonBall.y = 0;
  }

  //Cannon shoot logic
  if ((player.y > cannons.y - 500) && (player.y < cannons.y + 500)) {
    if (CANNONLIFE == 0 || CANNONLIFE == -1) {
        CANNONLIFE = 1000;
        await delay(3000);
        cannons.setTint(0xff0000);
        await delay(1000);
        cannons.setTint(0xffffff);
        cannonSound.play();
        cannonBall.body.enable = true;
        cannonBall.setVisible(true);
        cannonBall.x = cannons.getRightCenter().x;
        cannonBall.y = cannons.getRightCenter().y;
        cannonBall.setVelocityX(CANNONSPEED);
        // cannonBall.setVelocityX((player.x/(Math.sqrt(Math.pow(player.x,2) + Math.pow(player.y,2)))) * CANNONSPEED);
        // cannonBall.setVelocityY((player.y/(Math.sqrt(Math.pow(player.x,2) + Math.pow(player.y,2)))) * CANNONSPEED);
    }
  }

  //Cannon Kill Logic

}

function LevelGen(platforms: Phaser.Physics.Arcade.StaticGroup) {
  // //Level 1 
  for (var i = 0; i < 10; i++) {
    platforms.create(450 + i * 32, 4000, 'platformPlank');
  }
  for (var i = 0; i < 10; i++) {
    platforms.create(750 + i * 32, 3800, 'platformPlank');
  }
  for (var i = 0; i < 7; i++) {
    platforms.create(1300 + i * 32, 3800, 'platformPlank');
  }
  for (var i = 0; i < 10; i++) {
    platforms.create(450 + i * 32, 4000, 'platformPlank');
  }
  for (var i = 0; i < 10; i++) {
    platforms.create(450 + i * 32, 3500, 'platformPlank');
  }
  for (var i = 0; i < 10; i++) {
    platforms.create(450 + i * 32, 4000, 'platformPlank');
  }
  for (var i = 0; i < 5; i++) {
    platforms.create(1150 + i * 32, 3500, 'platformPlank');
  }
  for (var i = 0; i < 4; i++) {
    platforms.create(1450 + i * 32, 3500, 'platformPlank');
  }
  for (var i = 0; i < 7; i++) {
    platforms.create(1300 + i * 32, 3250, 'platformPlank');
  }
  for (var i = 0; i < 9; i++) {
    platforms.create(800 + i * 32, 3250, 'platformPlank');
  }
  for (var i = 0; i < 4; i++) {
    platforms.create(370 + i * 32, 3250, 'platformPlank');
  }
  for (var i = 0; i < 10; i++) {
    platforms.create(480 + i * 32, 3050, 'platformPlank');
  }
  for (var i = 0; i < 7; i++) {
    platforms.create(1180 + i * 32, 4000, 'platformPlank');
  }
  for (var i = 0; i < 4; i++) {
    platforms.create(370 + i * 32, 3720, 'platformPlank');
  }
  for (var i = 0; i < 14; i++) {
    platforms.create(770 + i * 32, 3050, 'platformPlank');
  }
  for (var i = 0; i < 4; i++) {
    platforms.create(1350 + i * 32, 3050, 'platformPlank');
  }
  for (var i = 0; i < 7; i++) {
    platforms.create(970 + i * 32, 3670, 'platformPlank');
  }
  for (var i = 0; i < 9; i++) {
    platforms.create(590 + i * 32, 2850, 'platformPlank');
  }
  for (var i = 0; i < 9; i++) {
    platforms.create(1060 + i * 32, 2850, 'platformPlank');
  }
  //Chest
  for (var i = 0; i < 4; i++) {
    platforms.create(1420 + i * 32, 2400, 'platformPlank');
  }
  for (var i = 0; i < 7; i++) {
    platforms.create(870 + i * 32, 2000, 'platformPlank');
  }
  for (var i = 0; i < 7; i++) {
    platforms.create(570 + i * 32, 2600, 'platformPlank');
  }
  for (var i = 0; i < 5; i++) {
    platforms.create(370 + i * 32, 2300, 'platformPlank');
  }
  for (var i = 0; i < 5; i++) {
    platforms.create(770 + i * 32, 2300, 'platformPlank');
  }
  for (var i = 0; i < 5; i++) {
    platforms.create(370 + i * 32, 2300, 'platformPlank');
  }
  for (var i = 0; i < 7; i++) {
    platforms.create(500 + i * 32, 2000, 'platformPlank');
  }
  for (var i = 0; i < 7; i++) {
    platforms.create(1360 + i * 32, 2000, 'platformPlank');
  }
  for (var i = 0; i < 5; i++) {
    platforms.create(1000 + i * 32, 1500, 'platformPlank');
  }
  for (var i = 0; i < 5; i++) {
    platforms.create(500 + i * 32, 1680, 'platformPlank');
  }
  for (var i = 0; i < 4; i++) {
    platforms.create(910 + i * 32, 1060, 'platformPlank');
  }
  // for (var i = 0; i < 3; i++) {
  //   platforms.create(929 + i * 32, 945, 'platformPlank');
  // }
  //Ruby
  for (var i = 0; i < 3; i++) {
    platforms.create(929 + i * 32, 829, 'platformPlank');
  }
  // for (var i = 0; i < 3; i++) {
  //   platforms.create(929 + i * 32, 710, 'platformPlank');
  // }
  for (var i = 0; i < 3; i++) {
    platforms.create(929 + i * 32, 590, 'platformPlank');
  }
  for (var i = 0; i < 5; i++) {
    platforms.create(800 + i * 32, 1350, 'platformPlank');

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

function MoveUI(element,camera){
element.y += camera.main.worldView.y - camPrevPosY;
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

    CANNONLIFE=0;
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

    player.setPosition(prevPosX, prevPosY -100);
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
