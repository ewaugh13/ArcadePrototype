import * as Phaser from 'phaser';
import { Octopus } from './objects/octopus'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

var PLAYERSPEED = 300;
var ENEMYSPEED = 100;
var LEVEL1_Y = 150;
var LEVEL2_Y = 450;
var LEVEL3_Y = 750;
var BASE = 900;
var enemyVel;
var liveCount: number = 0;
var OCTOPUSXBOUNCE: number = 50;
var OCTOPUSYBOUNCE: number = 20;
var JUMPAMOUNT = -450;
//SFX
var bgm: Phaser.Sound.BaseSound;
var collectSound: Phaser.Sound.BaseSound;           //Globals.. need to rescope these
var jumpSound: Phaser.Sound.BaseSound;
var deathSound: Phaser.Sound.BaseSound;

export class GameScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private gems: Phaser.GameObjects.Group;
  private score: number;
  private scoreText: Phaser.GameObjects.Text;
  private enemies: Array<Phaser.Physics.Arcade.Sprite>;
  private pipes: Phaser.Physics.Arcade.StaticGroup;
  private isTurned: boolean;
  private playerHit: boolean;

  constructor() {
    super(sceneConfig);
  }

  public preload() {

    this.load.image('background', 'src/assets/Ship.png');
    this.load.spritesheet('dude',
      'src/assets/player.png',
      { frameWidth: 83, frameHeight: 131 });
    this.load.image('platformPlank', 'src/assets/plank.png');
    this.load.image('gem', 'src/assets/Gem.png');
    this.load.image('octopus', 'src/assets/Octopus01.png');
    this.load.image('pipe', 'src/assets/Pipes.png')
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

    //Level Creation
    this.platforms = this.physics.add.staticGroup();
    //Level 1
    for (var i = 0; i < 30; ++i) {
      this.platforms.create(i * 32, LEVEL1_Y, 'platformPlank');
    }
    for (var i = 0; i < 30; ++i) {
      this.platforms.create(1100 + i * 32, LEVEL1_Y, 'platformPlank');
    }

    //Level 2
    for (var i = 0; i < 12; ++i) {
      this.platforms.create(i * 32, LEVEL2_Y, 'platformPlank');
    }

    for (var i = 0; i < 20; ++i) {
      this.platforms.create(700 + i * 32, LEVEL2_Y, 'platformPlank');
    }

    for (var i = 0; i < 12; ++i) {
      this.platforms.create(1650 + i * 32, LEVEL2_Y, 'platformPlank');
    }

    //Level 3
    for (var i = 0; i < 25; ++i) {
      this.platforms.create(i * 32, LEVEL3_Y, 'platformPlank');
    }
    for (var i = 0; i < 25; ++i) {
      this.platforms.create(1200 + i * 32, LEVEL3_Y, 'platformPlank');
    }

    //Base
    for (var i = 0; i < 65; ++i) {
      this.platforms.create(i * 32, BASE, 'platformPlank');
    }

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

    //Gems Creation
    this.gems = this.physics.add.group({
      key: 'gem',
      repeat: 11,
      setXY: { x: 502, y: 400, stepX: 70 }
    });

    this.physics.add.collider(this.gems, this.platforms);


    //Player Creation
    this.player = this.physics.add.sprite(500, 800, 'dude');
    this.player.setScale(0.75);
    this.playerHit = false;
    this.player.setCollideWorldBounds(true);
    this.isTurned = false;
    this.physics.add.collider(this.player, this.platforms, moveWall, null, this);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 0 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: [{ key: 'dude', frame: 4 }],
      delay: 5000
      //frameRate: 20,
    });

    this.physics.add.overlap(this.player, this.gems, collectGem, null, this);

    // create enemies
    this.enemies = new Array();
    this.enemies.push(new Octopus(this, 1000, 100, 0));
    this.enemies.push(new Octopus(this, 700, 100, 0));


    // collision of enemies and platforms
    this.enemies.forEach(enemy => {
      this.physics.add.collider(enemy, this.platforms);
    });

    // collision of enemies with each other
    var i: number;
    var j: number;
    for (i = 0; i < this.enemies.length; i++) {
      for (j = i + 1; j < this.enemies.length; j++) {
        var enemy1: Phaser.Physics.Arcade.Sprite = this.enemies[i];
        var enemy2: Phaser.Physics.Arcade.Sprite = this.enemies[j];
        this.physics.add.collider(enemy1, enemy2, enemiesCollide, null, this);
      }
    }
    // collision of enemies and player
    this.enemies.forEach(enemy => {
      this.physics.add.collider(this.player, enemy, hitEnemy, null, this);
    });

    // pipes collision
    this.physics.add.collider(this.enemies, this.pipes, transportToTop, null, this);

    // setting the enemies to go left or right randomly
    if (Math.random() * 2 < 0.5) {
      enemyVel = ENEMYSPEED;
    }
    else {
      enemyVel = -ENEMYSPEED;
    }

    // set enemy speed
    for (i = 0; i < this.enemies.length; i++) {
      var octopus: Octopus = <Octopus>this.enemies[i];
      octopus.setVelocityX(enemyVel);
      octopus.velocityX = enemyVel;
      enemyVel *= -1;
    }
  }

  public update() {
    // set enemy speed
    this.physics.world.wrap(this.player);
    this.physics.world.wrap(this.enemies);
    if (liveCount >= 0) {
      var i: number;
      for (i = 0; i < this.enemies.length; i++) {
        var octopus: Octopus = <Octopus>this.enemies[i];
        octopus.setVelocityX(octopus.velocityX);
      }

      playerMovement(this.input.keyboard.createCursorKeys(), this.player, this.playerHit);
    }
  }
}

function playerMovement(cursors: Phaser.Types.Input.Keyboard.CursorKeys, player: Phaser.Physics.Arcade.Sprite, playerHit: boolean) {
  if (!playerHit) {
    if (cursors.left.isDown) {
      player.anims.play('left', true);
      if (player.body.touching.down) {
        player.setVelocityX(-PLAYERSPEED);
      }
      else {
        player.anims.stop();
        player.setVelocityX(-PLAYERSPEED / 1.5);
      }
    }
    else if (cursors.right.isDown) {
      player.anims.play('right', true);
      if (player.body.touching.down) {
        player.setVelocityX(PLAYERSPEED);
      }
      else {
        player.anims.stop();
        player.setVelocityX(PLAYERSPEED / 1.5);
      }
    }
    else {
      player.setVelocityX(0);
      player.anims.stop();
    }

    if (cursors.up.isDown && player.body.touching.down) {
      jumpSound.play();
      player.anims.play('jump');
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

async function moveWall(player, platform: Phaser.Physics.Arcade.Sprite) {
  if (platform.body.touching.down) {
    deathSound.play();
    var initPos = platform.y;
    console.log(initPos);
    platform.setY(platform.y - 5);
    await delay(100);
    platform.body.touching.down = false;
    platform.setY(initPos);
  }
}

async function hitEnemy(player: Phaser.Physics.Arcade.Sprite, enemey: Phaser.Physics.Arcade.Sprite) {
  if (!this.playerHit) {
    deathSound.play();
    this.playerHit = true;
    player.setTint(0xff0000);
    player.anims.pause();

    await delay(500);
    killAndRespawnPlayer(player);
    player.setTint(0xffffff);
    this.physics.resume();
    this.playerHit = false;
  }
}

async function enemiesCollide(enemy1: Phaser.Physics.Arcade.Sprite, enemy2: Phaser.Physics.Arcade.Sprite) {
  var octopus1: Octopus = <Octopus>enemy1;
  var octopus2: Octopus = <Octopus>enemy2;

  octopus1.velocityX *= -1;
  octopus2.velocityX *= -1;

  console.log(octopus1);
  console.log(octopus2);
  if (octopus1.y < octopus2.y) {
    octopus1.y -= OCTOPUSYBOUNCE * 2;
    if (octopus1.x > octopus2.x) {
      octopus1.x += OCTOPUSXBOUNCE;
      octopus2.x -= OCTOPUSXBOUNCE;
    }
    else {
      octopus1.x -= OCTOPUSXBOUNCE;
      octopus2.x += OCTOPUSXBOUNCE;
    }
  }
  else if (octopus1.y > octopus2.y) {
    octopus2.y -= OCTOPUSYBOUNCE * 2;
    if (octopus1.x > octopus2.x) {
      octopus1.x += OCTOPUSXBOUNCE;
      octopus2.x -= OCTOPUSXBOUNCE;
    }
    else {
      octopus1.x -= OCTOPUSXBOUNCE;
      octopus2.x += OCTOPUSXBOUNCE;
    }
  }
}

function killAndRespawnPlayer(player: Phaser.Physics.Arcade.Sprite) {
  player.setVisible(false);
  liveCount--;
  if (liveCount >= 0) {
    player.setPosition(1000, 200);
    player.setVisible(true);
  }
  else {
    player.destroy();
  }
}

function transportToTop(enemey: Phaser.Physics.Arcade.Sprite, pipe) {
  enemey.y = LEVEL1_Y - 70;
  var octopus:Octopus = <Octopus> enemey;
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
      gravity: { y: 300 },
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
