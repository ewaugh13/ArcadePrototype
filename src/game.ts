import * as Phaser from 'phaser';
import { Octopus } from './objects/octopus'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

var PLAYERSPEED = 200;
var ENEMYSPEED = 50;
var OCTOPUSXBOUNCE: number = 50;
var OCTOPUSYBOUNCE: number = 20;
var JUMPAMOUNT = -275;
var enemyVel: number;
var liveCount: number = 0;
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
  // Octopus is a Phaser.Physics.Arcade.Sprite
  private enemies: Array<Phaser.Physics.Arcade.Sprite>;
  private playerHit: boolean;

  constructor() {
    super(sceneConfig);
  }

  public preload() {

    this.load.image('background', 'src/assets/Ship.png');
    this.load.spritesheet('dude',
      'src/assets/dude.png',
      { frameWidth: 32, frameHeight: 48 });
    this.load.image('platformPlank', 'src/assets/plank.png');
    this.load.image('gem', 'src/assets/Gem.png');
    this.load.image('octopus', 'src/assets/Octopus01.png')
    this.load.audio('bgm', 'src/assets/SFX/Music/bgm.wav');
    this.load.audio('collect', 'src/assets/SFX/Ruby.wav');
    this.load.audio('jump', 'src/assets/SFX/Jump or swim.wav');
    this.load.audio('jump', 'src/assets/SFX/death-sound.wav');
  }

  public create() {
    //Adding the SFX
    bgm = this.sound.add('bgm', { loop: true });
    bgm.play();
    collectSound = this.sound.add('collect');
    jumpSound = this.sound.add('jump');
    deathSound = this.sound.add('death');
    //Background
    this.add.image(0, -3240, 'background').setOrigin(0, 0);
    this.platforms = this.physics.add.staticGroup()

    //Init ScoreSystem
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //Platform Generation

    //Platform Gen Variables
    var NUMBEROFLEVELS = 10;
    var PLATFORMLENGTH = 10;
    var PLATFORMWIDTH = 32;
    var LEVELGAP = 100;
    var STARTOFFSET = 32;
    var WALLSTART = 365;
    var WALLEND = 1575;

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
            this.platforms.create(x, y, 'platformPlank')
          }
        }
        else
          this.platforms.create(seed + (j * PLATFORMWIDTH), STARTOFFSET + (i * LEVELGAP), 'platformPlank');
      }
    }

    //Gems Creation
    this.gems = this.physics.add.group({
      key: 'gem',
      repeat: 11,
      setXY: { x: 502, y: 400, stepX: 70 }
    });

    this.physics.add.collider(this.gems, this.platforms);

    //Player Creation
    this.player = this.physics.add.sprite(500, 800, 'dude');
    this.playerHit = false;
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
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

async function hitEnemy(player: Phaser.Physics.Arcade.Sprite, enemey: Phaser.Physics.Arcade.Sprite) {
  if (!this.playerHit) {
    //deathSound.play();
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
