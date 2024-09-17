import { createRelativeUnits } from '../main';
import { BaseScene } from '../BaseScene';

export class Access extends BaseScene {
    constructor() {
        super('Access');
    }

    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    init() {
        this.scale.resize(window.innerWidth, window.innerHeight);
    }

    createScene() {
        const ru = createRelativeUnits(this);
        
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xFFFFFF).setOrigin(0, 0);
    
        const content = this.createAccessContent();
    
        const scrollablePanel = this.rexUI.add.scrollablePanel({
            x: this.scale.width / 2,
            y: this.scale.height / 2,
            width: this.scale.width,
            height: this.scale.height,
            scrollMode: 'y',
            background: this.rexUI.add.roundRectangle({
                strokeColor: 0xCCCCCC,
                fillColor: 0xFFFFFF,
                strokeWidth: 1,
                radius: 0
            }),
            panel: {
                child: content,
                mask: { padding: 1 },
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            },
            header: this.rexUI.add.label({
                height: ru.toPixels(15),
                orientation: 'horizontal',
                background: this.rexUI.add.roundRectangle({ fillColor: 0xFFFFFF, radius: 0 }),
                text: this.add.text(0, 0, 'アクセス', { fontSize: ru.fontSize.large, fontStyle: 'bold', color: '#000000' })
                    .setPadding(4),
            }),
            space: { left: 10, right: 10, top: 10, bottom: 10, panel: 10, header: 10 }
        }).layout();
    }

    createAccessContent() {
        const ru = createRelativeUnits(this);
        const content = this.add.container();
        let yOffset = 0;

        const panelWidth = this.scale.width - ru.toPixels(8);

        // 会社情報
        const companyInfo = [
            '株式会社サンプル',
            '〒100-0006',
            '東京都千代田区有楽町1-1-1',
            'サンプルビル 10階',
            'TEL: 03-1234-5678',
            'FAX: 03-1234-5679'
        ];

        const infoBox = this.add.rectangle(0, yOffset, panelWidth, ru.toPixels(40), 0xF0F0F0);
        infoBox.setOrigin(0, 0);
        content.add(infoBox);

        companyInfo.forEach((line, index) => {
            const text = this.add.text(ru.toPixels(2), yOffset + ru.toPixels(2 + index * 5), line, {
                fontSize: ru.fontSize.small,
                color: '#000000'
            }).setPadding(4);
            content.add(text);
        });

        yOffset += infoBox.height + ru.toPixels(10);

        // 日比谷線駅一覧
        const hibiStations = [
            'H-01 中目黒', 'H-02 恵比寿', 'H-03 広尾', 'H-04 六本木', 'H-05 神谷町',
            'H-06 虎ノ門ヒルズ', 'H-07 霞ケ関', 'H-08 日比谷', 'H-09 銀座', 'H-10 東銀座',
            'H-11 築地', 'H-12 八丁堀', 'H-13 茅場町', 'H-14 人形町', 'H-15 小伝馬町',
            'H-16 秋葉原', 'H-17 仲御徒町', 'H-18 上野', 'H-19 入谷', 'H-20 三ノ輪',
            'H-21 南千住', 'H-22 北千住'
        ];

        yOffset = this.addStationList(content, '日比谷線駅一覧', hibiStations, yOffset, ru);

        // 銀座線駅一覧
        const ginzaStations = [
            'G-01 渋谷', 'G-02 表参道', 'G-03 外苑前', 'G-04 青山一丁目', 'G-05 赤坂見附',
            'G-06 溜池山王', 'G-07 虎ノ門', 'G-08 新橋', 'G-09 銀座', 'G-10 京橋',
            'G-11 日本橋', 'G-12 三越前', 'G-13 稲荷町', 'G-14 上野', 'G-15 上野広小路',
            'G-16 末広町', 'G-17 神田', 'G-18 三越前', 'G-19 浅草'
        ];

        yOffset = this.addStationList(content, '銀座線駅一覧', ginzaStations, yOffset, ru);

        content.setSize(panelWidth, yOffset);
        return content;
    }

    addStationList(content, title, stations, yOffset, ru) {
        const stationTitle = this.add.text(0, yOffset, title, {
            fontSize: ru.fontSize.medium,
            fontStyle: 'bold',
            color: '#000000'
        }).setPadding(4);
        content.add(stationTitle);
        yOffset += stationTitle.height + ru.toPixels(5);

        stations.forEach((station) => {
            const stationText = this.add.text(0, yOffset, station, {
                fontSize: ru.fontSize.small,
                color: '#000000'
            }).setPadding(4);
            content.add(stationText);
            yOffset += stationText.height + ru.toPixels(2);
        });

        yOffset += ru.toPixels(10); // 次のセクションとの間隔

        return yOffset;
    }
}