import { Scene } from 'phaser';
import { loadGameState } from '../hooks/gameState';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        // 既存のコード
        this.add.image(512, 384, 'background');

        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        this.load.on('progress', (progress) => {
            bar.width = 4 + (460 * progress);
        });
    }

    preload ()
    {
        // 既存のコード
        this.load.setPath('assets');
        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    create ()
    {
        // ゲームの状態をロード（非同期の場合に対応）
        Promise.resolve(loadGameState()).then(gameState => {
            // 保存された状態に基づいて適切なシーンを開始
            if (gameState && gameState.current_scene) {
                this.scene.start(gameState.current_scene);
            } else {
                // 保存された状態がない場合は、デフォルトで Login シーンを開始
                this.scene.start('Login');
            }
        }).catch(error => {
            console.error('Failed to load game state:', error);
            // エラーが発生した場合もデフォルトで Login シーンを開始
            this.scene.start('Login');
        });
    }
}