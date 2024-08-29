import { Scene } from 'phaser';

export class Mario extends Scene {
    constructor() {
        super('Mario');
    }

    init() {
        console.log('Mario scene initialized');
        this.cameraLerpFactor = 0.1;
        this.jumpPressed = false;
        this.jumpCooldown = 0;
        this.autoMove = 0; // -1: 左、0: 停止、1: 右
    }

    preload() {
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
    
        this.mario = this.add.rectangle(100, this.scale.height - 200, 20, 20, 0xFF0000);
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
    
        // 移動ボタン
        this.createMoveButtons();

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

    createMoveButtons() {
        const buttonStyle = {
            fontSize: '20px',
            backgroundColor: '#4a4a4a',
            padding: { x: 10, y: 10 },
            fixedWidth: this.scale.width / 4 - 10,
            align: 'center'
        };
    
        const buttonY = this.scale.height - 80;
    
        const leftButton = this.add.text(5, buttonY, '←', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.autoMove = -0.5);
    
        const stopButton = this.add.text(this.scale.width / 4 + 5, buttonY, '■', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.autoMove = 0);
    
        const rightButton = this.add.text(this.scale.width / 2 + 5, buttonY, '→', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.autoMove = 0.5);
    
        const jumpButton = this.add.text(this.scale.width * 3 / 4 + 5, buttonY, 'Jump', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.jumpPressed = true)
            .on('pointerup', () => this.jumpPressed = false);
    }
    
    moveMario() {
        const moveSpeed = 200;
        this.mario.body.setVelocityX(this.autoMove * moveSpeed);
    }

    jumpMario() {
        if ((this.mario.body.touching.down || this.mario.body.blocked.down) && this.jumpCooldown <= 0) {
            this.mario.body.setVelocityY(-250);
            this.jumpCooldown = 300;
        }
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    update(time, delta) {
        this.moveMario();
    
        if (this.jumpPressed) {
            this.jumpMario();
        } else {
            this.jumpCooldown = 0;
        }
    
        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= delta;
        }
    
        // カメラの追従ロジック
        const screenCenterX = this.cameras.main.scrollX + this.scale.width / 2;
        
        if (!this.cameraFollowing && this.mario.x >= screenCenterX) {
            // マリオが画面中央に到達したらカメラの追従を開始
            this.cameraFollowing = true;
            this.cameras.main.startFollow(this.mario, true, 1, 1);
        }
    
        if (this.cameraFollowing) {
            // カメラの位置が範囲外にならないようにクランプ
            this.cameras.main.scrollX = Phaser.Math.Clamp(
                this.cameras.main.scrollX,
                this.cameras.main.getBounds().x,
                this.cameras.main.getBounds().right - this.cameras.main.width
            );
        }
    }
}