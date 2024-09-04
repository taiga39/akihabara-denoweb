import Phaser from 'phaser';
import { loadGameState, saveGameState, getNextScene } from './hooks/gameState';
import HamburgerMenu from './component/HamburgerMenu';

export class BaseScene extends Phaser.Scene {
    create() {
        const gameState = loadGameState();
        
        // answer_sceneに含まれていない場合のみcurrent_sceneを更新
        if (!gameState.answer_scene.includes(this.scene.key)) {
            gameState.current_scene = this.scene.key;
            saveGameState(gameState);
        }

        this.createScene();
        new HamburgerMenu(this);
    }

    startNextScene() {
        const gameState = loadGameState();
        const nextScene = getNextScene(this.scene.key);
        
        gameState.current_scene = nextScene;
        if (!gameState.answer_scene.includes(this.scene.key)) {
            gameState.answer_scene.push(this.scene.key);
        }
        
        saveGameState(gameState);
        this.scene.start(nextScene);
    }

    recordAnswer() {
        const gameState = loadGameState();
        if (!gameState.answer_scene.includes(this.scene.key)) {
            gameState.answer_scene.push(this.scene.key);
            saveGameState(gameState);
        }
    }

    createScene() {
        // 各シーンでオーバーライド
    }
}