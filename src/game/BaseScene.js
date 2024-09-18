import Phaser from 'phaser';
import { loadGameState, saveGameState, getNextScene } from './hooks/gameState';
import HamburgerMenu from './component/HamburgerMenu';

const SCENE_ORDER = [
    'Login',
    'Unsubscribe',
    'CrossWord',
    'Pinch',
    'KeyBoard',
    'Stop',
    'Kanda',
    'Math',
    'Block',
    'Mario'
];

export class BaseScene extends Phaser.Scene {
    create() {
        const gameState = loadGameState();
        
        // SCENE_ORDERに含まれる場合のみcurrent_sceneを更新
        if (SCENE_ORDER.includes(this.scene.key) && !gameState.answer_scene.includes(this.scene.key)) {
            gameState.current_scene = this.scene.key;
            saveGameState(gameState);
        }

        this.createScene();
        // if (this.scene.key !== 'Login') {
            new HamburgerMenu(this);
        // }
    }

    startNextScene() {
        const gameState = loadGameState();
        const nextScene = getNextScene(this.scene.key);
        
        gameState.current_scene = nextScene;
        if (SCENE_ORDER.includes(this.scene.key) && !gameState.answer_scene.includes(this.scene.key)) {
            gameState.answer_scene.push(this.scene.key);
        }
        
        saveGameState(gameState);
        this.scene.start(nextScene);
    }

    recordAnswer() {
        const gameState = loadGameState();
        if (SCENE_ORDER.includes(this.scene.key) && !gameState.answer_scene.includes(this.scene.key)) {
            gameState.answer_scene.push(this.scene.key);
            saveGameState(gameState);
        }
    }

    createScene() {
        // 各シーンでオーバーライド
    }
}