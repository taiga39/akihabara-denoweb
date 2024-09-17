import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Stop } from './scenes/Stop';
import { Pinch } from './scenes/Pinch';
import { CrossWord } from './scenes/CrossWord';
import { Login } from './scenes/Login';
import { Faq } from './scenes/Faq';
import { Block } from './scenes/Block';
import { Mario } from './scenes/Mario';
import { KeyBoard } from './scenes/KeyBoard';
import { Kanda } from './scenes/Kanda';
import { Math } from './scenes/Math';
import { MenuScene } from './scenes/MenuScene';
import { Access } from './scenes/Access';

import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';

const RELATIVE_WIDTH = 100;

// 画面の幅を取得し、9分割して16倍した値を高さに設定する関数
function calculateGameHeight() {
    const screenWidth = window.innerWidth;
    // 画面の幅を9分割して16倍した値を高さに設定
    return (screenWidth / 9) * 16;
}

// 画面の幅を取得する関数
function calculateGameWidth() {
    return window.innerWidth;
}

// 相対単位からピクセルに変換する関数
function toPixels(units, game) {
    return units * (game.config.width / RELATIVE_WIDTH);
}

// ピクセルから相対単位に変換する関数
function toRelativeUnits(pixels, game) {
    return pixels / (game.config.width / RELATIVE_WIDTH);
}
// Phaser の設定
const config = {
    type: Phaser.AUTO,
    width: calculateGameWidth(),  // 幅はそのまま
    height: calculateGameHeight(), // 高さを9:16の比率に設定
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        GameOver,
        Login,
        Faq,
        CrossWord,
        Pinch,
        KeyBoard,
        Stop,
        Kanda,
        Math,
        Block,
        Mario,
        MenuScene,
        Access
    ],
    input: {
        activePointers: 3 // ここで最大3つのタッチを同時に処理可能に設定
    },
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    resolution: window.devicePixelRatio,  // デバイスのピクセル密度に基づいた解像度
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
    }

};

export function createRelativeUnits(scene) {
    const scaleFactor = scene.scale.width / RELATIVE_WIDTH;

    return {
        toPixels: (units) => units * scaleFactor,
        toRelativeUnits: (pixels) => pixels / scaleFactor,
        fontSize: {
            small: scene.scale.width * 0.04,
            medium: scene.scale.width * 0.06,
            large: scene.scale.width * 0.08,
            extraLarge: scene.scale.width * 0.1
        }
    };
}

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
}

export default StartGame;
