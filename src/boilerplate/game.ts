import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class GameScene extends Phaser.Scene {
  //private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private player;
  constructor() {
    super(sceneConfig);
  }

  public preload(){
    
    this.load.image('background','src/boilerplate/assets/Ship.png');
    this.load.spritesheet('player', 
    'assets/scottpilgrim_multiple.png',
    { frameWidth: 128, frameHeight: 128 });
  }
  public create() {
    this.add.image(0,-3240,'background').setOrigin(0,0);
  }
 
  public update() {
    //const cursorKeys = this.input.keyboard.createCursorKeys();
    
  //   if (cursorKeys.up.isDown) {
  //     this.player.x
  //     this.player.body.setVelocityY(-500);
  //   } else if (cursorKeys.down.isDown) {
  //     this.player.body.setVelocityY(500);
  //   } else {
  //     this.player.body.setVelocityY(0);
  //   }
     
  //   if (cursorKeys.right.isDown) {
  //     this.player.body.setVelocityX(500);
  //   } else if (cursorKeys.left.isDown) {
  //     this.player.body.setVelocityX(-500);
  //   } else {
  //     this.player.body.setVelocityX(0);
  //   }
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
      debug: true,
    },
  },
  scene : GameScene,
  parent: 'game',
  backgroundColor: '#000000',
};
 
export const game = new Phaser.Game(gameConfig);
