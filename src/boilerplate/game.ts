import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  
  private player;
  
  constructor() {
    super(sceneConfig);
  }

  public preload(){
    
    this.load.image('background','src/boilerplate/assets/Ship.png');
    this.load.spritesheet('dude', 
    'src/boilerplate/assets/dude.png',
    { frameWidth: 32, frameHeight: 48 });
    this.load.image('platformPlank','src/boilerplate/assets/plank.png');
    
  }

  public create() {
    var platforms;
    //var player;
    this.add.image(0,-3240,'background').setOrigin(0,0);
    platforms = this.physics.add.staticGroup()
    
    //Platform Generation
    var i;
    var j; 
    var k;
    for(i=0; i<10 ; i++){
     var seed = 353+Math.random()*1213;  //left wall: 353, width till right wall: 1213(1566-352)
      for(j=0; j<7; j++){
        if(i==9){
          for(k=0; k<37; k++)
            platforms.create(353+(k*32) ,32+(i*100),'platformPlank')
        }
        else
          platforms.create(seed+(j*32),32+(i*100),'platformPlank'); 
      }
    }

    //Player Creation
    this.player = this.physics.add.sprite(500, 150, 'dude');
    //this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);
  
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
  }
 
  public update() {
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown)
{
    this.player.setVelocityX(-160);

    this.player.anims.play('left', true);
}
else if (cursors.right.isDown)
{
    this.player.setVelocityX(160);

    this.player.anims.play('right', true);
}
else
{
    this.player.setVelocityX(0);

    this.player.anims.play('turn');
}

if (cursors.up.isDown && this.player.body.touching.down)
{
    this.player.setVelocityY(-330);
}  
  
  }
  
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',
 
  type: Phaser.AUTO,
 
  width: window.innerWidth,
  height: window.innerHeight,
 
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 300},
      debug: false,
    },
  },
  scene : GameScene,
  parent: 'game',
  backgroundColor: '#000000',
};
 
export const game = new Phaser.Game(gameConfig);
