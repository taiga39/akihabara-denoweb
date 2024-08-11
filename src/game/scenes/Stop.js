import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Stop extends Scene {
    constructor() {
        super('Stop');
        this.reels = [];
        this.isSpinning = [false, false, false];
        this.symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.currentIndexes = [0, 0, 0];
        this.spinEvents = [];
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

        // スタートボタン
        this.add.text(width * 0.5, height * 0.8, 'START', { fontSize: `${height * 0.05}px`, fill: '#000' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.startAllSpins());

        // リールとストップボタンの作成
        for (let i = 0; i < 3; i++) {
            const x = width * (0.25 + i * 0.25);
            const reelY = height * 0.4;
            
            const reel = this.add.text(x, reelY, this.symbols[this.currentIndexes[i]], { fontSize: `${height * 0.1}px`, fill: '#fff' })
                .setOrigin(0.5);
            this.reels.push(reel);

            this.add.text(x, height * 0.6, 'STOP', { fontSize: `${height * 0.05}px`, fill: '#f00' })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.stopSpin(i));
        }

        EventBus.emit('current-scene-ready', this);
        this.startAllSpins();
    }

    startAllSpins() {
        for (let i = 0; i < this.reels.length; i++) {
            this.startSpin(i);
        }
    }

    startSpin(reelIndex) {
        if (!this.isSpinning[reelIndex]) {
            this.isSpinning[reelIndex] = true;
            if (this.spinEvents[reelIndex]) {
                this.spinEvents[reelIndex].remove();
            }
            this.spinEvents[reelIndex] = this.time.addEvent({
                delay: 50,
                callback: () => this.updateReel(reelIndex),
                loop: true
            });
        }
    }

    updateReel(reelIndex) {
        if (this.isSpinning[reelIndex]) {
            this.currentIndexes[reelIndex] = (this.currentIndexes[reelIndex] + 1) % this.symbols.length;
            this.reels[reelIndex].setText(this.symbols[this.currentIndexes[reelIndex]]);
        }
    }

    stopSpin(reelIndex) {
        if (this.isSpinning[reelIndex]) {
            this.isSpinning[reelIndex] = false;
            if (this.spinEvents[reelIndex]) {
                this.spinEvents[reelIndex].remove();
            }
        }
    }
}