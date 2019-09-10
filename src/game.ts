import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

var PLAYERSPEED =300;
var ENEMYSPEED = 50;
var enemyVel;
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
  private enemies: Phaser.Physics.Arcade.Sprite;
  //private enemies: Phaser.GameObjects.Group;
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
    //this.enemies = this.physics.add.group();
    //this.enemies.create(900, 300, 'octopus');
    this.enemies = this.physics.add.sprite(1000, 100, 'octopus');
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.player, this.enemies, hitEnemy, null, this);
    if(Math.random()*2 < 0.5)
      enemyVel = ENEMYSPEED;
    else
      enemyVel = -ENEMYSPEED;
  
  }

  public update() {
    
    this.enemies.setVelocityX(enemyVel);

    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.player.setVelocityX(-PLAYERSPEED);

      this.player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
      this.player.setVelocityX(PLAYERSPEED);

      this.player.anims.play('right', true);
    }
    else {
      this.player.setVelocityX(0);

      this.player.anims.play('turn');
    }

    if (cursors.up.isDown && this.player.body.touching.down) {
      jumpSound.play();
      this.player.setVelocityY(-330);
    }
  }
}


function collectGem(player, gem) {
  collectSound.play();
  gem.disableBody(true, true);
  this.score += 10;
  this.scoreText.setText('Score: ' + this.score);
}

async function hitEnemy(player, enemey) {
  if (!this.playerHit) {
    //deathSound.play();
    this.playerHit = true;
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    
    await delay(500);
    player.setTint(0xffffff);
    this.physics.resume();
    enemey.setVelocityX(0);
    enemey.setVelocityY(0);

    this.playerHit = false;

    //TODO set gameover at some point
    // gameOver = true;
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',

  type: Phaser.AUTO,

  width: window.innerWidth,
  height: window.innerHeight,

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

export const game = new Phaser.Game(gameConfig);
