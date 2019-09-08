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

    init(): void {}

    create(): void {
        this.cameras.main.startFollow(this.player);
        // this needs to be updated
        this.cameras.main.setBounds(
            0,
            0,
            this.map.widthInPixels,
            this.map.heightInPixels
        );
    }
}