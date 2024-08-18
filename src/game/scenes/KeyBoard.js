import { Scene } from 'phaser';
import { createRelativeUnits } from '../main';

export class KeyBoard extends Scene {
    constructor() {
        super('KeyBoard');
    }

    preload() {
        this.load.plugin('rexinputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js', true);
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        const adjustedStyle = { ...style };
        if (adjustedStyle.fontSize) {
            adjustedStyle.fontSize *= highResScale;
        }
        const textObject = this.add.text(x, y, text, adjustedStyle);
        textObject.setScale(1 / highResScale);
        return textObject;
    }
    
    create() {
        const ru = createRelativeUnits(this);
        
        // 背景
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xeeeeee).setOrigin(0, 0);
    
        // 入力フォーム
        this.inputText = this.add.rexInputText(ru.toPixels(50), ru.toPixels(40), ru.toPixels(80), ru.toPixels(15), {
            type: 'text',
            text: '',
            placeholder: 'ひらがなで回答してください',
            fontSize: `${ru.toPixels(0.3)}rem`,
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            borderThickness: 2
        });
    
        // 回答ボタン
        const answerButton = this.createHighQualityText(ru.toPixels(50), ru.toPixels(60), '回答する', {
            fontSize: ru.fontSize.medium,
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: ru.toPixels(4), y: ru.toPixels(2) }
        })
        .setOrigin(0.5)
        .setInteractive();
    
        answerButton.on('pointerdown', () => {
            const userInput = this.inputText.text.trim().toLowerCase();
            const correctAnswer = this.getYesterday();
            
            if (userInput === correctAnswer) {
                console.log('正解です！');
                // ここに正解時の処理を追加できます（例：スコア加算、次の問題への移動など）
            } else {
                console.log('不正解です。正解は ' + correctAnswer + ' でした。');
                // ここに不正解時の処理を追加できます
            }
            
            console.log('入力されたテキスト:', userInput);
            console.log('正解の曜日:', correctAnswer);
        });
    
        // 初期実行
        this.getYesterday();
    }

    getYesterday() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        const daysOfWeek = ["にちようび", "げつようび", "かようび", "すいようび", "もくようび", "きんようび", "どようび"];
        const yesterdayDayOfWeek = daysOfWeek[yesterday.getDay()];
        
        return yesterdayDayOfWeek;
    }
}