import { Scene } from 'phaser';

export class Mario extends Scene {
    constructor() {
        super('Mario');
    }

    init() {
        console.log('Mario scene initialized');
        this.cameraLerpFactor = 0.1;
        this.jumpPressed = false;
        this.jumpCooldown = 0.2;
    }

    preload() {
        this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
        this.load.image('world_tileset', 'assets/world_tileset.png');
        this.load.image('platforms', 'assets/platforms.png');
        this.load.tilemapTiledJSON('map', 'assets/map2.json');
    }

    create() {
        console.log('Create method started');
    
        this.createGradientBackground();
        
        // タイルマップの作成
        const map = this.make.tilemap({ key: 'map' });
        console.log('Tilemap created:', map);
    
        // タイルセットの追加
        const worldTileset = map.addTilesetImage('world_tileset', 'world_tileset');
        const platformsTileset = map.addTilesetImage('platforms', 'platforms');
        console.log('Tilesets:', worldTileset, platformsTileset);
        
        // レイヤーの作成
        const mainLayer = map.createLayer('platforms', [worldTileset, platformsTileset], -450, 350);
        console.log('Main layer:', mainLayer);
        
        // 衝突の設定（すべてのタイルに対して衝突を設定）
        mainLayer.setCollisionByExclusion([-1]);
        console.log('Collision set');
    
        // マリオの初期位置を設定（マップの上部から少し下の位置）
        const marioStartX = 100;
        const marioStartY = map.heightInPixels - mainLayer.tilemap.tileHeight * 5; // マップの下から5タイル分上
        this.mario = this.add.rectangle(marioStartX, marioStartY, 20, 20, 0xFF0000);
        this.physics.add.existing(this.mario);
        this.mario.body.setCollideWorldBounds(false);
        this.mario.body.setGravityY(300);
    
        // マリオとメインレイヤーの衝突設定
        this.physics.add.collider(this.mario, mainLayer);
    
        // カメラの設定
        this.cameras.main.setBounds(-400, 0, map.widthInPixels + 800, map.heightInPixels);
        this.cameras.main.scrollX = 0; // カメラの初期位置を左端に設定
    
        // カメラの追従フラグを追加
        this.cameraFollowing = false;
    
        // ジョイスティックの作成
        this.joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: 100,
            y: this.scale.height - 100,
            radius: 50,
            base: this.add.circle(0, 0, 50, 0x888888),
            thumb: this.add.circle(0, 0, 25, 0xcccccc),
            dir: '8dir'
        });
        this.joystick.base.setScrollFactor(0);
        this.joystick.thumb.setScrollFactor(0);
        
        // 四角形のジャンプボタンの作成
        const buttonWidth = 100;
        const buttonHeight = 50;
        const jumpButtonX = this.scale.width - buttonWidth - 20;
        const jumpButtonY = this.scale.height - buttonHeight - 60;
    
        this.jumpButton = this.add.rectangle(jumpButtonX, jumpButtonY, buttonWidth, buttonHeight, 0x888888)
            .setOrigin(0, 0)
            .setInteractive()
            .setScrollFactor(0) // スクロールに影響されないように設定
            .on('pointerdown', () => this.jumpPressed = true)
            .on('pointerup', () => this.jumpPressed = false);
    
        // ジャンプボタンのテキスト作成
        this.jumpButtonText = this.add.text(jumpButtonX + buttonWidth / 2, jumpButtonY + buttonHeight / 2, 'Jump', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5)
          .setScrollFactor(0); // スクロールに影響されないように設定
    
        // マリオの物理ボディを調整
        this.mario.body.setSize(20, 20);
    }
    
    
    
    createGradientBackground() {
        const width = 1024;
        const height = this.scale.height;
        const texture = this.textures.createCanvas('skyGradient', width, height);
        const context = texture.getContext();
    
        const gradient = context.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(0.5, '#f0f0f0');
        gradient.addColorStop(1, '#e74c3c');
    
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
    
        texture.refresh();
    
        this.background = this.add.tileSprite(0, 0, this.scale.width * 20, height, 'skyGradient');
        this.background.setOrigin(0, 0);
    }

    update(time, delta) {
        // ジョイスティックの方向と力に基づいてマリオを移動
        const maxSpeed = 150;
        const cursorKeys = this.joystick.createCursorKeys();
    
        let speed = maxSpeed;
    
        if (cursorKeys.left.isDown) {
            this.mario.body.setVelocityX(-speed);
        } else if (cursorKeys.right.isDown) {
            this.mario.body.setVelocityX(speed);
        } else {
            this.mario.body.setVelocityX(0);
        }
    
        // ジャンプ処理
        if (this.jumpPressed && (this.mario.body.touching.down || this.mario.body.blocked.down) && this.jumpCooldown <= 0) {
            this.mario.body.setVelocityY(-200);
            this.jumpCooldown = 300;
        }

        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= delta;
        }
    
        // カメラの追従ロジック
        const screenCenterX = this.cameras.main.scrollX + this.scale.width / 2;
    
        if (!this.cameraFollowing && this.mario.x >= screenCenterX) {
            this.cameraFollowing = true;
            this.cameras.main.startFollow(this.mario, true, 1, 1);
        }
    
        if (this.cameraFollowing) {
            this.cameras.main.scrollX = Phaser.Math.Clamp(
                this.cameras.main.scrollX,
                this.cameras.main.getBounds().x,
                this.cameras.main.getBounds().right - this.cameras.main.width
            );
        }
    }
}
