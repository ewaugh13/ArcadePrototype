import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

var PLAYERSPEED =300;
var ENEMYSPEED = 100;
var LEVEL1_Y= 150;
var LEVEL2_Y= 450;
var LEVEL3_Y= 750; 
var BASE = 900;
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
  private pipes: Phaser.Physics.Arcade.StaticGroup;
  private isTurned: boolean;
  //private enemies: Phaser.GameObjects.Group;
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
    this.load.image('pipe','src/assets/Pipes.png')
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
    for(var i=0; i<30; ++i){
      this.platforms.create(i*32,LEVEL1_Y,'platformPlank');
    }
    for(var i=0; i<30; ++i){
      this.platforms.create(1100+i*32,LEVEL1_Y,'platformPlank');
    }

    //Level 2
    for(var i=0; i<12; ++i){
      this.platforms.create(i*32,LEVEL2_Y,'platformPlank');
    }
    
    for(var i=0; i<20; ++i){
      this.platforms.create(700+i*32,LEVEL2_Y,'platformPlank');
    }
    
    for(var i=0; i<12; ++i){
      this.platforms.create(1650 +i*32,LEVEL2_Y,'platformPlank');
    }
  
    //Level 3
    for(var i=0; i<25; ++i){
      this.platforms.create(i*32,LEVEL3_Y,'platformPlank');
    }
    for(var i=0; i<25; ++i){
      this.platforms.create(1200+i*32,LEVEL3_Y,'platformPlank');
    }
    
    //Base
    for(var i=0; i<65; ++i){
      this.platforms.create(i*32,BASE,'platformPlank');
    }
    
    this.pipes = this.physics.add.staticGroup();
    this.pipes.create(0,BASE-50,'pipe');
    this.pipes.create(1920,BASE-50,'pipe');
    this.pipes.create(0,LEVEL1_Y-65,'pipe');
    this.pipes.create(1920,LEVEL1_Y-65,'pipe');
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
    this.player.setCollideWorldBounds(true);
    this.isTurned = false;
    this.physics.add.collider(this.player, this.platforms,moveWall,null,this);
    
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
      frames: [{key:'dude', frame: 4}],
      delay: 5000
      //frameRate: 20,
    });

    this.physics.add.overlap(this.player, this.gems, collectGem, null, this);


    // create enemies
    //this.enemies = this.physics.add.group();
    //this.enemies.create(900, 300, 'octopus');
    this.enemies = this.physics.add.sprite(1000, 100, 'octopus');
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.player, this.enemies, hitEnemy, null, this);
    this.physics.add.collider(this.enemies,this.pipes,transportToTop,null,this);
    if(Math.random()*2 < 0.5)
      enemyVel = ENEMYSPEED;
    else
      enemyVel = -ENEMYSPEED;
  
  }

  public update() {
    this.physics.world.wrap(this.player);
    this.physics.world.wrap(this.enemies);

    this.enemies.setVelocityX(enemyVel);
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.player.setVelocityX(-PLAYERSPEED);
      if(!this.isTurned){
        this.isTurned=true;
        this.player.scaleX*=-1;
      }
      this.player.anims.play('right', true);
    }
    else if (cursors.right.isDown) {
      if(this.isTurned){
        this.isTurned= false;
        this.player.scaleX*=-1;
      }
      this.player.setVelocityX(PLAYERSPEED);
      this.player.anims.play('right', true);
    }
    else {
      this.player.setVelocityX(0);

      this.player.anims.play('turn');
    }

    if (cursors.up.isDown && this.player.body.touching.down) {
      this.player.anims.play('jump');
      jumpSound.play();
      this.player.setVelocityY(-450);
    }
  }
}


function collectGem(player, gem) {
  collectSound.play();
  gem.disableBody(true, true);
  this.score += 10;
  this.scoreText.setText('Score: ' + this.score);
}
async function moveWall(player,platform:Phaser.Physics.Arcade.Sprite){
  if(platform.body.touching.down){ 
    deathSound.play();
    var initPos = platform.y; 
    console.log(initPos);
    platform.setY(platform.y-5);
    await delay(100);
    platform.body.touching.down = false;
    platform.setY(initPos);
  }
}



async function hitEnemy(player, enemey) {
  if (!this.playerHit) {
    deathSound.play();
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

function transportToTop(octopus:Phaser.Physics.Arcade.Sprite,pipe){
  octopus.y = LEVEL1_Y - 70;
  enemyVel= - enemyVel;
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
