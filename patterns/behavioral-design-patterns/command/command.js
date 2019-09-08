"use strict";
/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2019 Digitsensitive
 * @description  Design patterns: Behavioral design pattern - Command
 *               This is a basic setup handling input in browser games.
 * @license      Digitsensitive
 */
Object.defineProperty(exports, "__esModule", { value: true });
class PauseCommand {
    constructor(scene) {
        this.currentScene = scene;
    }
    execute() {
        this.currentScene.scene.pause();
        this.currentScene.scene.launch("PauseScene");
    }
}
exports.PauseCommand = PauseCommand;
class PointerMovedCommand {
    constructor(scene, layer, actor) {
        this.actor = actor;
        this.layer = layer;
        this.currentScene = scene;
    }
    execute() {
        let tile = this.layer.getTileAtWorldXY(this.currentScene.input.activePointer.worldX, this.currentScene.input.activePointer.worldY);
        this.actor.updatePosition(tile);
    }
}
exports.PointerMovedCommand = PointerMovedCommand;
class ShootingCommand {
    constructor(actor) {
        this.actor = actor;
    }
    execute() {
        this.actor.shoot();
    }
}
exports.ShootingCommand = ShootingCommand;
//# sourceMappingURL=command.js.map