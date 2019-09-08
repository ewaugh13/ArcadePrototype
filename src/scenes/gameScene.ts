import { Pirate } from "../objects/pirate";

export class GameScene extends Phaser.Scene {
    // tilemap (ignore for now I think)
    private map: Phaser.Tilemaps.Tilemap;
    private tileset: Phaser.Tilemaps.Tileset;
    private backgroundLayer: Phaser.Tilemaps.StaticTilemapLayer;
    private foregroundLayer: Phaser.Tilemaps.StaticTilemapLayer;

    private player: Pirate; 
    private enemies: Phaser.GameObjects.Group;
    private platforms: Phaser.GameObjects.Group;
    private collectibles: Phaser.GameObjects.Group;

    constructor() {
        super({
            key: "GameScene"
        });
    }

    public preload(){
    
        this.load.image('background','src/boilerplate/assets/Ship.png');
        this.load.spritesheet('player', 
        'assets/scottpilgrim_multiple.png',
        { frameWidth: 128, frameHeight: 128 });
    }

    init(): void {}

    create(): void {
        this.add.image(0,-3240,'background').setOrigin(0,0);
        this.cameras.main.startFollow(this.player);
        // this needs to be updated
        this.cameras.main.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );
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