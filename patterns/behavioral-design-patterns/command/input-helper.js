"use strict";
/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2019 Digitsensitive
 * @description  Design patterns: Behavioral design pattern - Command
 *               Input Helper
 * @license      Digitsensitive
 */
Object.defineProperty(exports, "__esModule", { value: true });
class InputHelper {
    constructor(scene) {
        this.currentScene = scene;
    }
    /**
     * Set the pause scene command
     * @param command
     */
    setPauseSceneCommand(command) {
        this.pauseScene = command;
    }
    /**
     * Set the pointer moved command
     * @param command
     */
    setPointerMovedCommand(command) {
        this.pointerMoved = command;
    }
    /**
     * Set the shooting command
     * @param command
     */
    setShootingCommand(command) {
        this.shooting = command;
    }
    /**
     * Main function of the input helper
     * Returns commands if corresponding key is pressed
     * It can't execute the commands immediately, because it doesn't know what
     * receiver (= actor) to pass in
     */
    handleInput() {
        if (Phaser.Input.Keyboard.JustDown(this.currentScene.input.keyboard.addKey("P"))) {
            return this.pauseScene;
        }
        else if (this.currentScene.input.activePointer.prevPosition.x !==
            this.currentScene.input.activePointer.position.x ||
            this.currentScene.input.activePointer.prevPosition.y !==
                this.currentScene.input.activePointer.position.y) {
            return this.pointerMoved;
        }
        else if (Phaser.Input.Keyboard.JustDown(this.currentScene.input.keyboard.addKey("SPACE"))) {
            return this.shooting;
        }
        return null;
    }
}
exports.InputHelper = InputHelper;
//# sourceMappingURL=input-helper.js.map