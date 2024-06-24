import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Stop } from './scenes/Stop';
import { Pinch } from './scenes/Pinch';
import { CrossWord } from './scenes/CrossWord';
import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';

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
        Stop,
        Pinch,
        CrossWord
    ]
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
}

export default StartGame;
