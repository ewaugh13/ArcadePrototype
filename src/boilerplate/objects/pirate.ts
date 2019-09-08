

export class Pirate extends Phaser.GameObjects.Sprite {
    // private member variables
    private currentScene: Phaser.Scene;
    private pirateSize: string;
    private acceleration: number;
    private isJumping: boolean;

    // input
    private keys: Map<string, Phaser.Input.Keyboard.Key>;

    public getKeys(): Map<string, Phaser.Input.Keyboard.Key> {
        return this.keys;
    }

    constructor(params: { scene: Phaser.Scene; x: number; y: number; key: string; frame: string | number; }) {
        super(params.scene, params.x, params.y, params.key, params.frame);

        this.currentScene = params.scene;
        this.initSprite();
        this.currentScene.add.existing(this);
    }

    private initSprite() {
        // input
        this.keys = new Map([
            ["LEFT", this.addKey("LEFT")],
            ["RIGHT", this.addKey("RIGHT")],
            ["DOWN", this.addKey("DOWN")],
            ["JUMP", this.addKey("SPACE")],
            ["A", this.addKey("A")],
            ["W", this.addKey("W")],
            ["D", this.addKey("D")],
            ["S", this.addKey("S")]
        ]);
    }

    private addKey(key: string): Phaser.Input.Keyboard.Key {
        return this.currentScene.input.keyboard.addKey(key);
    }
}