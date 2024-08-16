import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

import { createRelativeUnits } from '../main';
import SpeechBubble from '../component/SpeechBubble';

export class Stop extends Scene {
    constructor() {
        super('Stop');
        this.reels = [];
        this.isSpinning = [false, false, false];
        this.symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.currentIndexes = [0, 0, 0];
        this.spinEvents = [];
        this.selectBoxes = [];
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const ru = createRelativeUnits(this);

        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

        // STARTボタン（赤い丸に白文字）
        const startButton = this.add.circle(width * 0.5, height * 0.8, ru.toPixels(10), 0xff0000);
        const startText = this.add.text(width * 0.5, height * 0.8, 'START', { 
            fontSize: `${ru.fontSize.medium}px`, 
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        startButton.setInteractive()
            .on('pointerdown', () => this.startAllSpins());

        // リールとSTOPボタンの作成
        for (let i = 0; i < 3; i++) {
            const x = width * (0.25 + i * 0.25);
            const reelY = height * 0.4;
            
            // 背景の白い四角形を追加
            const background = this.add.rectangle(x, reelY, width * 0.15, height * 0.15, 0xffffff);
            background.setOrigin(0.5);

            // リールのテキストを更新
            const reel = this.add.text(x, reelY, this.symbols[this.currentIndexes[i]], { 
                fontSize: `${height * 0.15}px`, 
                fill: '#000',
                fontStyle: 'bold'
            })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.onReelClick(i));
            this.reels.push(reel);

            // STOPボタン（黄色い丸に黒文字）
            const stopButton = this.add.circle(x, height * 0.6, ru.toPixels(8), 0xffff00);
            const stopText = this.add.text(x, height * 0.6, 'STOP', { 
                fontSize: `${ru.fontSize.small}px`, 
                fill: '#000',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            stopButton.setInteractive()
                .on('pointerdown', () => this.stopSpin(i));

            // 各リールの下にセレクトボックスを作成
            this.createSelectBox(i, x, height * 0.8);
        }

        EventBus.emit('current-scene-ready', this);
        this.startAllSpins();

        const bubbleWidth = ru.toPixels(60);
        const bubbleHeight = ru.toPixels(30);
        const bubbleX = this.scale.width - bubbleWidth - ru.toPixels(5);
        const bubbleY = this.scale.height - bubbleHeight - ru.toPixels(30);
    
        const speechBubble = new SpeechBubble(
            this,
            bubbleX,
            bubbleY,
            bubbleWidth,
            bubbleHeight,
            "こんにちは！@これは@吹き出しです。"
        );
    
        // SpeechBubble を最前面に表示
        this.children.bringToTop(speechBubble);
    }

    createSelectBox(index, x, y) {
        const selectBox = document.createElement('select');
        selectBox.style.position = 'absolute';
        selectBox.style.left = `${x}px`;
        selectBox.style.top = `${y}px`;
        selectBox.style.transform = 'translate(-50%, 0)';
        selectBox.style.fontSize = '20px';
        selectBox.style.padding = '5px';
        selectBox.style.width = '80px';
        selectBox.style.display = 'none';
        selectBox.style.backgroundColor = '#f0f0f0';
        selectBox.style.border = '2px solid #333';
        selectBox.style.borderRadius = '5px';
        selectBox.style.appearance = 'none';
        selectBox.style.backgroundImage = 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")';
        selectBox.style.backgroundRepeat = 'no-repeat';
        selectBox.style.backgroundPosition = 'right .5em top 50%, 0 0';
        selectBox.style.backgroundSize = '.65em auto, 100%';

        this.symbols.forEach((symbol) => {
            const option = document.createElement('option');
            option.value = symbol;
            option.text = symbol;
            selectBox.appendChild(option);
        });

        document.body.appendChild(selectBox);
        this.selectBoxes[index] = selectBox;

        selectBox.addEventListener('change', () => {
            const selectedValue = selectBox.value;
            this.updateReel(index, selectedValue);
            this.hideSelectBox(index);
        });
    }

    onReelClick(reelIndex) {
        if (!this.isSpinning[reelIndex]) {
            this.showSelectBox(reelIndex);
        }
    }

    showSelectBox(reelIndex) {
        this.selectBoxes[reelIndex].style.display = 'block';
        this.selectBoxes[reelIndex].value = this.symbols[this.currentIndexes[reelIndex]];
        this.scene.pause();
    }

    hideSelectBox(reelIndex) {
        this.selectBoxes[reelIndex].style.display = 'none';
        this.scene.resume();
    }

    updateReel(reelIndex, value) {
        this.currentIndexes[reelIndex] = this.symbols.indexOf(value);
        this.reels[reelIndex].setText(value);
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
                callback: () => this.updateReelSpin(reelIndex),
                loop: true
            });
        }
    }

    updateReelSpin(reelIndex) {
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