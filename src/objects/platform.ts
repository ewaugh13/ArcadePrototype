import * as Phaser from 'phaser';

export class Platform extends Phaser.Physics.Arcade.Sprite {
    public isHitByPlayer: boolean = false;

    constructor(scene: Phaser.Scene, xPosition: number, yPosition: number) {
        super(scene, xPosition, yPosition, 'platformPlank');
        scene.add.existing(this);
    }
}