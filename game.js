// Super Mario / Super Diyorbek 2D Platformer Engine
// Full NES Physics, Blocks, Enemies, Power-ups, Boss & Level Systems

const TILE_SIZE = 32;

// Block Types
const BLOCK = {
    EMPTY: 0,
    GROUND: 1,
    BRICK: 2,
    QUESTION_COIN: 3,
    QUESTION_MUSHROOM: 4,
    QUESTION_FIRE: 5,
    EMPTY_BLOCK: 6,
    PIPE_TOP_LEFT: 7,
    PIPE_TOP_RIGHT: 8,
    PIPE_BODY_LEFT: 9,
    PIPE_BODY_RIGHT: 10,
    FLAGPOLE: 11,
    FLAG_TOP: 12,
    CASTLE: 13,
    STAIR_BLOCK: 14
};

class SuperMarioGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.state = 'loading'; // loading, intro, playing, dead, stage_clear, game_over
        this.score = 0;
        this.coins = 0;
        this.world = '1-1';
        this.time = 400;
        this.lives = 3;
        this.timerAccumulator = 0;

        this.cameraX = 0;

        // Input
        this.keys = {
            left: false,
            right: false,
            down: false,
            jump: false,
            run: false
        };

        this.particles = [];
        this.floatingTexts = [];
        this.enemies = [];
        this.items = [];
        this.fireballs = [];

        this.initPlayer();
        this.buildLevel();
    }

    initPlayer() {
        this.mario = {
            x: 64,
            y: 350,
            vx: 0,
            vy: 0,
            width: 24,
            height: 30,
            facing: 1, // 1: right, -1: left
            isGrounded: false,
            isJumping: false,
            state: 'small', // small, super, fire
            isStar: false,
            starTimer: 0,
            invulnerable: false,
            invulnTimer: 0,
            animFrame: 0,
            isDead: false,
            flagSliding: false
        };
    }

    buildLevel() {
        // 200 tiles wide world (6400 pixels)
        this.levelWidth = 210;
        this.levelHeight = 15;
        this.map = Array(this.levelHeight).fill(0).map(() => Array(this.levelWidth).fill(BLOCK.EMPTY));

        // Ground floor
        for (let x = 0; x < this.levelWidth; x++) {
            // Pits/Gaps at x = 68-71 and x = 86-89
            if ((x >= 68 && x <= 71) || (x >= 86 && x <= 89) || (x >= 152 && x <= 155)) {
                continue;
            }
            this.map[13][x] = BLOCK.GROUND;
            this.map[14][x] = BLOCK.GROUND;
        }

        // Question & Brick blocks
        this.map[9][16] = BLOCK.QUESTION_COIN;
        this.map[9][20] = BLOCK.BRICK;
        this.map[9][21] = BLOCK.QUESTION_MUSHROOM;
        this.map[9][22] = BLOCK.BRICK;
        this.map[9][23] = BLOCK.QUESTION_COIN;
        this.map[9][24] = BLOCK.BRICK;
        this.map[5][22] = BLOCK.QUESTION_FIRE;

        // Pipe 1 (height 2) at x = 28
        this.createPipe(28, 2);
        // Pipe 2 (height 3) at x = 38
        this.createPipe(38, 3);
        // Pipe 3 (height 4) at x = 46
        this.createPipe(46, 4);

        // Blocks formation 2
        this.map[9][64] = BLOCK.QUESTION_COIN;
        this.map[9][77] = BLOCK.BRICK;
        this.map[9][78] = BLOCK.QUESTION_MUSHROOM;
        this.map[9][79] = BLOCK.BRICK;
        this.map[5][80] = BLOCK.BRICK;
        this.map[5][81] = BLOCK.BRICK;
        this.map[5][82] = BLOCK.BRICK;
        this.map[5][83] = BLOCK.BRICK;
        this.map[5][84] = BLOCK.QUESTION_COIN;

        // Pipe 4 at x = 96
        this.createPipe(96, 3);

        // Stairs at x = 134 to 142
        for (let i = 0; i < 6; i++) {
            for (let h = 0; h <= i; h++) {
                this.map[12 - h][134 + i] = BLOCK.STAIR_BLOCK;
            }
        }
        // Flagpole stairs at x = 170 to 178
        for (let i = 0; i < 8; i++) {
            for (let h = 0; h <= i; h++) {
                this.map[12 - h][170 + i] = BLOCK.STAIR_BLOCK;
            }
        }

        // Flagpole at x = 186
        for (let y = 3; y <= 12; y++) {
            this.map[y][186] = BLOCK.FLAGPOLE;
        }
        this.map[2][186] = BLOCK.FLAG_TOP;

        // Castle at x = 194 to 199
        this.castleX = 194 * TILE_SIZE;

        // Spawn Enemies (Goombas and Koopas)
        this.enemies = [
            { type: 'goomba', x: 22 * TILE_SIZE, y: 380, vx: -1.2, vy: 0, width: 26, height: 26, state: 'walk', flatTimer: 0 },
            { type: 'goomba', x: 34 * TILE_SIZE, y: 380, vx: -1.2, vy: 0, width: 26, height: 26, state: 'walk', flatTimer: 0 },
            { type: 'koopa',  x: 42 * TILE_SIZE, y: 380, vx: -1.2, vy: 0, width: 26, height: 32, state: 'walk', isShell: false },
            { type: 'goomba', x: 52 * TILE_SIZE, y: 380, vx: -1.2, vy: 0, width: 26, height: 26, state: 'walk', flatTimer: 0 },
            { type: 'goomba', x: 54 * TILE_SIZE, y: 380, vx: -1.2, vy: 0, width: 26, height: 26, state: 'walk', flatTimer: 0 },
            { type: 'koopa',  x: 75 * TILE_SIZE, y: 380, vx: -1.2, vy: 0, width: 26, height: 32, state: 'walk', isShell: false },
            { type: 'goomba', x: 104 * TILE_SIZE, y: 380, vx: -1.2, vy: 0, width: 26, height: 26, state: 'walk', flatTimer: 0 },
            { type: 'goomba', x: 120 * TILE_SIZE, y: 380, vx: -1.2, vy: 0, width: 26, height: 26, state: 'walk', flatTimer: 0 }
        ];

        this.flagY = 3 * TILE_SIZE;
    }

    createPipe(startX, pipeHeight) {
        const topY = 13 - pipeHeight;
        this.map[topY][startX] = BLOCK.PIPE_TOP_LEFT;
        this.map[topY][startX + 1] = BLOCK.PIPE_TOP_RIGHT;
        for (let y = topY + 1; y < 13; y++) {
            this.map[y][startX] = BLOCK.PIPE_BODY_LEFT;
            this.map[y][startX + 1] = BLOCK.PIPE_BODY_RIGHT;
        }
    }

    update(dt) {
        if (this.state !== 'playing' && this.state !== 'stage_clear') return;

        // Timer Countdown
        if (this.state === 'playing') {
            this.timerAccumulator += dt;
            if (this.timerAccumulator >= 1.0) {
                this.timerAccumulator = 0;
                this.time--;
                if (this.time <= 0) {
                    this.killMario();
                }
            }
        }

        // Mario invulnerability decay
        if (this.mario.invulnerable) {
            this.mario.invulnTimer -= dt;
            if (this.mario.invulnTimer <= 0) {
                this.mario.invulnerable = false;
            }
        }

        // Flagpole celebration sequence
        if (this.mario.flagSliding) {
            this.mario.y += 3;
            this.flagY = Math.min(12 * TILE_SIZE - 20, this.flagY + 3);
            if (this.mario.y >= 12 * TILE_SIZE) {
                this.mario.y = 12 * TILE_SIZE;
                this.mario.flagSliding = false;
                this.mario.vx = 2.5; // Walk towards castle!
                if (window.marioAudio) window.marioAudio.playStageClear();
            }
            return;
        }

        if (this.state === 'stage_clear') {
            this.mario.x += this.mario.vx;
            if (this.mario.x >= this.castleX + 40) {
                this.mario.vx = 0;
                // Add celebration text
                if (this.floatingTexts.length === 0) {
                    this.addFloatingText("BOSQICH YENGILDI! NIMA GAP BOTAM! 👑", this.mario.x, this.mario.y - 40, '#ffd700');
                }
            }
            this.updateParticles(dt);
            return;
        }

        // Mario movement physics
        const m = this.mario;
        const maxSpeed = this.keys.run ? 5.5 : 3.8;
        const accel = 0.35;
        const friction = 0.82;

        if (this.keys.left) {
            m.vx -= accel;
            m.facing = -1;
        } else if (this.keys.right) {
            m.vx += accel;
            m.facing = 1;
        } else {
            m.vx *= friction;
            if (Math.abs(m.vx) < 0.1) m.vx = 0;
        }

        m.vx = Math.max(-maxSpeed, Math.min(maxSpeed, m.vx));

        // Jump physics
        if (this.keys.jump && m.isGrounded && !m.isJumping) {
            m.vy = m.state === 'small' ? -10.5 : -11.8;
            m.isGrounded = false;
            m.isJumping = true;
            if (window.marioAudio) window.marioAudio.playJump(m.state !== 'small');
        }

        // Variable jump height
        if (!this.keys.jump && m.vy < -4) {
            m.vy = -4;
        }

        // Gravity
        m.vy += 0.52;
        if (m.vy > 12) m.vy = 12;

        // Move Mario X and check tile collisions
        m.x += m.vx;
        this.checkCollisionsX(m);

        // Move Mario Y and check tile collisions
        m.y += m.vy;
        m.isGrounded = false;
        this.checkCollisionsY(m);

        // Check falling into pit
        if (m.y > this.height + 50) {
            this.killMario();
        }

        // Smooth Camera Follow
        const targetCamX = m.x - 220;
        if (targetCamX > this.cameraX) {
            this.cameraX += (targetCamX - this.cameraX) * 0.12;
        }
        if (m.x < this.cameraX) {
            m.x = this.cameraX; // Cannot go backwards past screen edge
            m.vx = 0;
        }

        // Update Enemies
        this.updateEnemies(dt);

        // Update Items (Mushrooms, Fire Flowers, Coins)
        this.updateItems(dt);

        // Update Fireballs
        this.updateFireballs(dt);

        // Update Particles & Floating Text
        this.updateParticles(dt);
    }

    checkCollisionsX(m) {
        const leftTile = Math.floor(m.x / TILE_SIZE);
        const rightTile = Math.floor((m.x + m.width) / TILE_SIZE);
        const topTile = Math.floor(m.y / TILE_SIZE);
        const bottomTile = Math.floor((m.y + m.height - 1) / TILE_SIZE);

        for (let ty = topTile; ty <= bottomTile; ty++) {
            if (ty < 0 || ty >= this.levelHeight) continue;

            if (m.vx > 0) { // Moving Right
                const block = this.map[ty][rightTile];
                if (this.isSolidBlock(block)) {
                    m.x = rightTile * TILE_SIZE - m.width - 0.01;
                    m.vx = 0;
                    break;
                }
                // Check Flagpole hit!
                if (block === BLOCK.FLAGPOLE || block === BLOCK.FLAG_TOP) {
                    this.reachFlagpole();
                    break;
                }
            } else if (m.vx < 0) { // Moving Left
                const block = this.map[ty][leftTile];
                if (this.isSolidBlock(block)) {
                    m.x = (leftTile + 1) * TILE_SIZE + 0.01;
                    m.vx = 0;
                    break;
                }
            }
        }
    }

    checkCollisionsY(m) {
        const leftTile = Math.floor(m.x / TILE_SIZE);
        const rightTile = Math.floor((m.x + m.width) / TILE_SIZE);
        const topTile = Math.floor(m.y / TILE_SIZE);
        const bottomTile = Math.floor((m.y + m.height) / TILE_SIZE);

        for (let tx = leftTile; tx <= rightTile; tx++) {
            if (tx < 0 || tx >= this.levelWidth) continue;

            if (m.vy > 0) { // Moving Down (Landing)
                if (bottomTile < this.levelHeight && this.isSolidBlock(this.map[bottomTile][tx])) {
                    m.y = bottomTile * TILE_SIZE - m.height;
                    m.vy = 0;
                    m.isGrounded = true;
                    m.isJumping = false;
                    break;
                }
            } else if (m.vy < 0) { // Moving Up (Head bump block)
                if (topTile >= 0 && this.isSolidBlock(this.map[topTile][tx])) {
                    m.y = (topTile + 1) * TILE_SIZE;
                    m.vy = 0;
                    this.bumpBlock(tx, topTile);
                    break;
                }
            }
        }
    }

    isSolidBlock(block) {
        return block === BLOCK.GROUND ||
               block === BLOCK.BRICK ||
               block === BLOCK.QUESTION_COIN ||
               block === BLOCK.QUESTION_MUSHROOM ||
               block === BLOCK.QUESTION_FIRE ||
               block === BLOCK.EMPTY_BLOCK ||
               block === BLOCK.PIPE_TOP_LEFT ||
               block === BLOCK.PIPE_TOP_RIGHT ||
               block === BLOCK.PIPE_BODY_LEFT ||
               block === BLOCK.PIPE_BODY_RIGHT ||
               block === BLOCK.STAIR_BLOCK;
    }

    bumpBlock(tx, ty) {
        const block = this.map[ty][tx];

        if (block === BLOCK.QUESTION_COIN) {
            this.map[ty][tx] = BLOCK.EMPTY_BLOCK;
            this.coins++;
            this.score += 200;
            this.addPoppingCoin(tx * TILE_SIZE + 8, ty * TILE_SIZE - 20);
            if (window.marioAudio) window.marioAudio.playCoin();
        } else if (block === BLOCK.QUESTION_MUSHROOM) {
            this.map[ty][tx] = BLOCK.EMPTY_BLOCK;
            this.spawnItem('mushroom', tx * TILE_SIZE, (ty - 1) * TILE_SIZE);
            if (window.marioAudio) window.marioAudio.playPowerupSprout();
        } else if (block === BLOCK.QUESTION_FIRE) {
            this.map[ty][tx] = BLOCK.EMPTY_BLOCK;
            this.spawnItem('flower', tx * TILE_SIZE, (ty - 1) * TILE_SIZE);
            if (window.marioAudio) window.marioAudio.playPowerupSprout();
        } else if (block === BLOCK.BRICK) {
            if (this.mario.state !== 'small') {
                // Shatter brick!
                this.map[ty][tx] = BLOCK.EMPTY;
                this.score += 50;
                this.shatterBrick(tx * TILE_SIZE, ty * TILE_SIZE);
                if (window.marioAudio) window.marioAudio.playBrickBreak();
            } else {
                if (window.marioAudio) window.marioAudio.playBlockBump();
            }
        }
    }

    spawnItem(type, x, y) {
        this.items.push({
            type,
            x: x + 4,
            y: y + 10,
            vx: 1.5,
            vy: -2,
            width: 24,
            height: 24
        });
    }

    shatterBrick(x, y) {
        const dirs = [
            { vx: -2.5, vy: -6 },
            { vx: 2.5, vy: -6 },
            { vx: -1.8, vy: -3 },
            { vx: 1.8, vy: -3 }
        ];
        dirs.forEach(d => {
            this.particles.push({
                x, y,
                vx: d.vx, vy: d.vy,
                color: '#b24700',
                size: 8,
                life: 0.8
            });
        });
    }

    addPoppingCoin(x, y) {
        this.particles.push({
            type: 'coin',
            x, y,
            vx: 0,
            vy: -5,
            life: 0.6
        });
        this.addFloatingText("+200", x, y - 10, '#ffd700');
    }

    addFloatingText(text, x, y, color = '#ffffff') {
        this.floatingTexts.push({
            text, x, y,
            vy: -1.2,
            life: 0.8,
            color
        });
    }

    reachFlagpole() {
        if (this.mario.flagSliding || this.state === 'stage_clear') return;
        this.mario.flagSliding = true;
        this.mario.vx = 0;
        this.mario.vy = 0;
        this.score += 5000;
        this.state = 'stage_clear';
        if (window.marioAudio) {
            window.marioAudio.stopBGM();
            window.marioAudio.playFlagpole();
        }
    }

    killMario() {
        if (this.mario.isDead) return;
        this.mario.isDead = true;
        this.mario.vy = -11;
        this.mario.vx = 0;
        this.lives--;
        this.state = 'dead';
        if (window.marioAudio) {
            window.marioAudio.stopBGM();
            window.marioAudio.playGameOver();
        }

        setTimeout(() => {
            if (this.lives > 0) {
                this.initPlayer();
                this.cameraX = 0;
                this.time = 400;
                this.state = 'playing';
                if (window.marioAudio) window.marioAudio.startBGM();
            } else {
                this.state = 'game_over';
            }
        }, 3000);
    }

    shootFireball() {
        if (this.mario.state !== 'fire' || this.fireballs.length >= 2) return;
        this.fireballs.push({
            x: this.mario.x + (this.mario.facing === 1 ? this.mario.width : -10),
            y: this.mario.y + 10,
            vx: this.mario.facing * 7,
            vy: 2,
            radius: 6
        });
        if (window.marioAudio) window.marioAudio.playFireball();
    }

    updateFireballs(dt) {
        for (let i = this.fireballs.length - 1; i >= 0; i--) {
            const fb = this.fireballs[i];
            fb.x += fb.vx;
            fb.y += fb.vy;
            fb.vy += 0.35; // gravity bounce

            // Check tile bounce
            const tx = Math.floor(fb.x / TILE_SIZE);
            const ty = Math.floor(fb.y / TILE_SIZE);
            if (ty < this.levelHeight && this.isSolidBlock(this.map[ty][tx])) {
                fb.y = ty * TILE_SIZE - fb.radius;
                fb.vy = -4.5; // bounce up
            }

            // Check enemy hit
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const e = this.enemies[j];
                if (e.state === 'dead' || e.state === 'flat') continue;
                if (Math.abs(fb.x - (e.x + e.width / 2)) < 16 && Math.abs(fb.y - (e.y + e.height / 2)) < 16) {
                    e.state = 'dead';
                    e.vy = -6;
                    this.score += 100;
                    this.addFloatingText("+100", e.x, e.y, '#ffd700');
                    if (window.marioAudio) window.marioAudio.playStomp();
                    this.fireballs.splice(i, 1);
                    break;
                }
            }

            // Remove out of bounds
            if (fb.x > this.cameraX + this.width + 50 || fb.y > this.height) {
                this.fireballs.splice(i, 1);
            }
        }
    }

    updateEnemies(dt) {
        const m = this.mario;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];

            // Squashed flat goomba
            if (e.state === 'flat') {
                e.flatTimer -= dt;
                if (e.flatTimer <= 0) {
                    this.enemies.splice(i, 1);
                }
                continue;
            }

            // Flipped dead enemy
            if (e.state === 'dead') {
                e.y += e.vy;
                e.vy += 0.4;
                if (e.y > this.height + 50) this.enemies.splice(i, 1);
                continue;
            }

            // Move only when close to camera
            if (e.x > this.cameraX + this.width + 100) continue;

            e.x += e.vx;
            e.y += e.vy;
            e.vy += 0.45;

            // Simple ground/wall check
            const tx = Math.floor((e.vx > 0 ? e.x + e.width : e.x) / TILE_SIZE);
            const bottomTile = Math.floor((e.y + e.height) / TILE_SIZE);

            if (bottomTile < this.levelHeight && this.isSolidBlock(this.map[bottomTile][tx])) {
                e.y = bottomTile * TILE_SIZE - e.height;
                e.vy = 0;
            }

            // Wall turn around
            const midTileY = Math.floor((e.y + e.height / 2) / TILE_SIZE);
            if (this.isSolidBlock(this.map[midTileY][tx])) {
                e.vx *= -1;
            }

            // Collision with Mario
            if (!m.isDead && !m.invulnerable) {
                if (m.x < e.x + e.width && m.x + m.width > e.x &&
                    m.y < e.y + e.height && m.y + m.height > e.y) {

                    // Check if stomping from above
                    if (m.vy > 0 && m.y + m.height - m.vy <= e.y + 12) {
                        m.vy = -8.5; // Mario bounce up
                        this.score += 200;
                        this.addFloatingText("+200", e.x, e.y, '#ffffff');

                        if (e.type === 'goomba') {
                            e.state = 'flat';
                            e.flatTimer = 0.4;
                            if (window.marioAudio) window.marioAudio.playStomp();
                        } else if (e.type === 'koopa') {
                            if (!e.isShell) {
                                e.isShell = true;
                                e.vx = 0;
                                e.height = 20;
                                if (window.marioAudio) window.marioAudio.playStomp();
                            } else {
                                // Kick shell!
                                e.vx = m.facing * 7;
                                if (window.marioAudio) window.marioAudio.playStomp();
                            }
                        }
                    } else {
                        // Shell kicking when stationary
                        if (e.isShell && e.vx === 0) {
                            e.vx = m.facing * 7;
                            m.invulnerable = true;
                            m.invulnTimer = 0.3;
                            if (window.marioAudio) window.marioAudio.playStomp();
                        } else {
                            // Mario takes damage
                            this.marioTakeDamage();
                        }
                    }
                }
            }
        }
    }

    marioTakeDamage() {
        if (this.mario.state === 'fire') {
            this.mario.state = 'super';
            this.mario.invulnerable = true;
            this.mario.invulnTimer = 1.8;
            if (window.marioAudio) window.marioAudio.playPipe();
        } else if (this.mario.state === 'super') {
            this.mario.state = 'small';
            this.mario.height = 30;
            this.mario.invulnerable = true;
            this.mario.invulnTimer = 1.8;
            if (window.marioAudio) window.marioAudio.playPipe();
        } else {
            this.killMario();
        }
    }

    updateItems(dt) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            it.x += it.vx;
            it.y += it.vy;
            it.vy += 0.35;

            // Ground collision
            const tx = Math.floor(it.x / TILE_SIZE);
            const ty = Math.floor((it.y + it.height) / TILE_SIZE);
            if (ty < this.levelHeight && this.isSolidBlock(this.map[ty][tx])) {
                it.y = ty * TILE_SIZE - it.height;
                it.vy = 0;
            }

            // Wall bounce
            const midY = Math.floor((it.y + it.height / 2) / TILE_SIZE);
            const frontX = Math.floor((it.vx > 0 ? it.x + it.width : it.x) / TILE_SIZE);
            if (this.isSolidBlock(this.map[midY][frontX])) {
                it.vx *= -1;
            }

            // Mario collects item
            const m = this.mario;
            if (m.x < it.x + it.width && m.x + m.width > it.x &&
                m.y < it.y + it.height && m.y + m.height > it.y) {

                if (it.type === 'mushroom') {
                    if (m.state === 'small') {
                        m.state = 'super';
                        m.height = 42;
                    }
                    this.score += 1000;
                    this.addFloatingText("SUPER! +1000", it.x, it.y - 10, '#00e676');
                    if (window.marioAudio) window.marioAudio.playPowerup();
                } else if (it.type === 'flower') {
                    m.state = 'fire';
                    m.height = 42;
                    this.score += 1000;
                    this.addFloatingText("FIRE! +1000", it.x, it.y - 10, '#ff3d00');
                    if (window.marioAudio) window.marioAudio.playPowerup();
                }
                this.items.splice(i, 1);
            }
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.4;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.life -= dt;
            if (t.life <= 0) this.floatingTexts.splice(i, 1);
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Classic Mario Blue Sky
        ctx.fillStyle = '#6b8cff';
        ctx.fillRect(0, 0, this.width, this.height);

        // 2. Fluffy Clouds & Hills (Parallax)
        this.drawBackgroundScenery(ctx);

        // 3. Render Level Map Tiles
        this.drawMap(ctx);

        // 4. Render Items
        this.drawItems(ctx);

        // 5. Render Enemies
        this.drawEnemies(ctx);

        // 6. Render Fireballs
        this.drawFireballs(ctx);

        // 7. Render Mario / Diyorbek
        this.drawMario(ctx);

        // 8. Render Particles & Floating Numbers
        this.drawParticles(ctx);
    }

    drawBackgroundScenery(ctx) {
        ctx.save();
        // Fluffy clouds with cute eyes
        const clouds = [80, 260, 480, 720, 1050, 1400, 1800, 2200, 2600, 3100];
        clouds.forEach(cx => {
            const screenX = cx - (this.cameraX * 0.4);
            if (screenX > -150 && screenX < this.width + 150) {
                this.drawCuteCloud(ctx, screenX, 70);
            }
        });

        // Green Rolling Hills
        const hills = [40, 360, 800, 1300, 1900, 2500, 3200];
        hills.forEach(hx => {
            const screenX = hx - (this.cameraX * 0.7);
            if (screenX > -200 && screenX < this.width + 200) {
                ctx.fillStyle = '#00a800';
                ctx.beginPath();
                ctx.arc(screenX, 420, 90, Math.PI, 0);
                ctx.fill();
                // Hill shading
                ctx.fillStyle = '#008000';
                ctx.beginPath();
                ctx.arc(screenX, 420, 70, Math.PI, 0);
                ctx.fill();
            }
        });
        ctx.restore();
    }

    drawCuteCloud(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, Math.PI * 2);
        ctx.arc(x + 22, y - 6, 26, 0, Math.PI * 2);
        ctx.arc(x + 46, y, 22, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 18, y - 4, 3, 7);
        ctx.fillRect(x + 28, y - 4, 3, 7);
        ctx.restore();
    }

    drawMap(ctx) {
        const startCol = Math.max(0, Math.floor(this.cameraX / TILE_SIZE));
        const endCol = Math.min(this.levelWidth - 1, startCol + Math.ceil(this.width / TILE_SIZE) + 1);

        for (let y = 0; y < this.levelHeight; y++) {
            for (let x = startCol; x <= endCol; x++) {
                const block = this.map[y][x];
                if (block === BLOCK.EMPTY) continue;

                const screenX = x * TILE_SIZE - this.cameraX;
                const screenY = y * TILE_SIZE;

                this.drawBlock(ctx, block, screenX, screenY);
            }
        }

        // Draw Flag on Flagpole
        if (this.state === 'stage_clear' || this.mario.flagSliding) {
            const flagScreenX = 186 * TILE_SIZE - this.cameraX;
            ctx.fillStyle = '#00e676';
            ctx.beginPath();
            ctx.moveTo(flagScreenX, this.flagY);
            ctx.lineTo(flagScreenX - 28, this.flagY + 12);
            ctx.lineTo(flagScreenX, this.flagY + 24);
            ctx.closePath();
            ctx.fill();
        }

        // Draw Castle at end
        const castleScreenX = this.castleX - this.cameraX;
        if (castleScreenX > -150 && castleScreenX < this.width + 150) {
            this.drawCastle(ctx, castleScreenX, 13 * TILE_SIZE - 120);
        }
    }

    drawBlock(ctx, type, x, y) {
        if (type === BLOCK.GROUND) {
            // Earth block with green top
            ctx.fillStyle = '#c84c0c';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#fc9838';
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 4);
            ctx.fillStyle = '#000000';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        } else if (type === BLOCK.BRICK) {
            ctx.fillStyle = '#b84418';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#000000';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillRect(x, y + 10, TILE_SIZE, 2);
            ctx.fillRect(x, y + 20, TILE_SIZE, 2);
            ctx.fillRect(x + 15, y, 2, 10);
            ctx.fillRect(x + 8, y + 11, 2, 9);
            ctx.fillRect(x + 22, y + 11, 2, 9);
        } else if (type === BLOCK.QUESTION_COIN || type === BLOCK.QUESTION_MUSHROOM || type === BLOCK.QUESTION_FIRE) {
            // Golden Question Block [?]
            ctx.fillStyle = '#fc9838';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#000000';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            // Black studs
            ctx.fillRect(x + 2, y + 2, 2, 2);
            ctx.fillRect(x + TILE_SIZE - 4, y + 2, 2, 2);
            ctx.fillRect(x + 2, y + TILE_SIZE - 4, 2, 2);
            ctx.fillRect(x + TILE_SIZE - 4, y + TILE_SIZE - 4, 2, 2);
            // '?' mark
            ctx.font = 'bold 20px "Press Start 2P", monospace, sans-serif';
            ctx.fillStyle = '#802b00';
            ctx.fillText('?', x + 9, y + 24);
        } else if (type === BLOCK.EMPTY_BLOCK) {
            ctx.fillStyle = '#885838';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#000000';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        } else if (type === BLOCK.PIPE_TOP_LEFT) {
            ctx.fillStyle = '#00a800';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#80d010';
            ctx.fillRect(x + 4, y, 6, TILE_SIZE);
        } else if (type === BLOCK.PIPE_TOP_RIGHT) {
            ctx.fillStyle = '#008000';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        } else if (type === BLOCK.PIPE_BODY_LEFT) {
            ctx.fillStyle = '#00a800';
            ctx.fillRect(x + 4, y, TILE_SIZE - 4, TILE_SIZE);
            ctx.fillStyle = '#80d010';
            ctx.fillRect(x + 6, y, 6, TILE_SIZE);
        } else if (type === BLOCK.PIPE_BODY_RIGHT) {
            ctx.fillStyle = '#008000';
            ctx.fillRect(x, y, TILE_SIZE - 4, TILE_SIZE);
        } else if (type === BLOCK.STAIR_BLOCK) {
            ctx.fillStyle = '#c84c0c';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#000000';
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        } else if (type === BLOCK.FLAGPOLE) {
            ctx.fillStyle = '#00a800';
            ctx.fillRect(x + 14, y, 4, TILE_SIZE);
        } else if (type === BLOCK.FLAG_TOP) {
            ctx.fillStyle = '#00a800';
            ctx.fillRect(x + 14, y, 4, TILE_SIZE);
            ctx.fillStyle = '#fc9838';
            ctx.beginPath();
            ctx.arc(x + 16, y + 8, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawCastle(ctx, x, y) {
        ctx.fillStyle = '#9c9c9c';
        // Base
        ctx.fillRect(x, y + 40, 110, 80);
        // Tower left, center, right
        ctx.fillRect(x + 10, y, 25, 40);
        ctx.fillRect(x + 45, y - 20, 25, 60);
        ctx.fillRect(x + 80, y, 25, 40);
        // Door
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + 55, y + 90, 18, Math.PI, 0);
        ctx.fillRect(x + 37, y + 90, 36, 30);
        ctx.fill();
    }

    drawMario(ctx) {
        const m = this.mario;
        const screenX = m.x - this.cameraX;
        const screenY = m.y;

        ctx.save();
        ctx.translate(screenX + m.width / 2, screenY + m.height);
        ctx.scale(m.facing, 1);

        // Invulnerability flicker
        if (m.invulnerable && Math.floor(Date.now() / 60) % 2 === 0) {
            ctx.filter = 'brightness(2.5)';
        }

        const isSuper = m.state !== 'small';
        const shirtColor = m.state === 'fire' ? '#ffffff' : '#d82800';
        const overallsColor = m.state === 'fire' ? '#d82800' : '#0028d8';
        const skinColor = '#fc9838';
        const hairColor = '#684000';

        const isRunning = Math.abs(m.vx) > 0.2;
        const animStep = Math.floor((m.x / 14) % 3);

        if (m.isDead) {
            // Death frame
            ctx.fillStyle = shirtColor;
            ctx.fillRect(-8, -26, 16, 12);
            ctx.fillStyle = overallsColor;
            ctx.fillRect(-6, -14, 12, 10);
            ctx.fillStyle = skinColor;
            ctx.fillRect(-6, -34, 12, 8);
            ctx.fillStyle = shirtColor;
            ctx.fillRect(-8, -38, 16, 6);
            ctx.restore();
            return;
        }

        if (!m.isGrounded) {
            // Jump pose: one arm raised, legs split
            ctx.fillStyle = overallsColor;
            ctx.fillRect(-9, isSuper ? -18 : -14, 8, 8);
            ctx.fillRect(2, isSuper ? -14 : -10, 8, 6);
            ctx.fillStyle = hairColor;
            ctx.fillRect(-11, -8, 8, 6);
            ctx.fillRect(4, -4, 8, 6);

            // Body
            ctx.fillStyle = overallsColor;
            ctx.fillRect(-8, isSuper ? -26 : -18, 16, isSuper ? 14 : 10);
            ctx.fillStyle = shirtColor;
            ctx.fillRect(-8, isSuper ? -34 : -24, 16, isSuper ? 10 : 8);

            // Arm raised
            ctx.fillRect(4, isSuper ? -44 : -32, 7, 10);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(4, isSuper ? -47 : -35, 7, 5); // White glove

            // Head & Cap (Authentic 8-Bit Mario)
            ctx.fillStyle = skinColor;
            ctx.fillRect(-6, isSuper ? -46 : -34, 12, 12);
            ctx.fillStyle = '#000000';
            ctx.fillRect(2, isSuper ? -42 : -30, 3, 4); // Eye
            ctx.fillRect(1, isSuper ? -38 : -26, 8, 4); // Mustache
            ctx.fillStyle = hairColor;
            ctx.fillRect(-6, isSuper ? -44 : -32, 3, 6); // Sideburn

            // Red Cap
            ctx.fillStyle = shirtColor;
            ctx.fillRect(-8, isSuper ? -54 : -42, 16, 8);
            ctx.fillRect(1, isSuper ? -48 : -36, 10, 3); // Visor
        } else if (isRunning) {
            // Running animation cycle
            ctx.fillStyle = overallsColor;
            if (animStep === 0) {
                ctx.fillRect(-8, isSuper ? -18 : -14, 8, 12);
                ctx.fillRect(2, isSuper ? -16 : -12, 8, 8);
                ctx.fillStyle = hairColor;
                ctx.fillRect(-10, -6, 8, 6);
                ctx.fillRect(4, -4, 8, 6);
            } else if (animStep === 1) {
                ctx.fillRect(-6, isSuper ? -18 : -14, 12, 10);
                ctx.fillStyle = hairColor;
                ctx.fillRect(-6, -6, 12, 6);
            } else {
                ctx.fillRect(-8, isSuper ? -16 : -12, 8, 8);
                ctx.fillRect(2, isSuper ? -18 : -14, 8, 12);
                ctx.fillStyle = hairColor;
                ctx.fillRect(-6, -4, 8, 6);
                ctx.fillRect(2, -6, 8, 6);
            }

            // Torso & Overalls
            ctx.fillStyle = overallsColor;
            ctx.fillRect(-8, isSuper ? -26 : -18, 16, isSuper ? 12 : 10);
            ctx.fillStyle = '#fce000'; // Yellow overall button
            ctx.fillRect(-2, isSuper ? -22 : -15, 2, 2);

            ctx.fillStyle = shirtColor;
            ctx.fillRect(-8, isSuper ? -34 : -24, 16, isSuper ? 10 : 8);

            // Head & Cap
            ctx.fillStyle = skinColor;
            ctx.fillRect(-6, isSuper ? -46 : -34, 12, 12);
            ctx.fillStyle = '#000000';
            ctx.fillRect(2, isSuper ? -42 : -30, 3, 4); // Eye
            ctx.fillRect(1, isSuper ? -38 : -26, 8, 4); // Mustache
            ctx.fillStyle = hairColor;
            ctx.fillRect(-6, isSuper ? -44 : -32, 3, 6); // Sideburn

            // Red Cap
            ctx.fillStyle = shirtColor;
            ctx.fillRect(-8, isSuper ? -54 : -42, 16, 8);
            ctx.fillRect(1, isSuper ? -48 : -36, 10, 3); // Visor
        } else {
            // Standing Idle Pose
            ctx.fillStyle = overallsColor;
            ctx.fillRect(-7, isSuper ? -18 : -14, 6, 10);
            ctx.fillRect(1, isSuper ? -18 : -14, 6, 10);
            ctx.fillStyle = hairColor;
            ctx.fillRect(-9, -6, 8, 6);
            ctx.fillRect(1, -6, 8, 6);

            // Torso & Overalls
            ctx.fillStyle = overallsColor;
            ctx.fillRect(-8, isSuper ? -26 : -18, 16, isSuper ? 12 : 10);
            ctx.fillStyle = '#fce000';
            ctx.fillRect(-2, isSuper ? -22 : -15, 2, 2);

            ctx.fillStyle = shirtColor;
            ctx.fillRect(-8, isSuper ? -34 : -24, 16, isSuper ? 10 : 8);

            // Head & Cap
            ctx.fillStyle = skinColor;
            ctx.fillRect(-6, isSuper ? -46 : -34, 12, 12);
            ctx.fillStyle = '#000000';
            ctx.fillRect(2, isSuper ? -42 : -30, 3, 4); // Eye
            ctx.fillRect(1, isSuper ? -38 : -26, 8, 4); // Mustache
            ctx.fillStyle = hairColor;
            ctx.fillRect(-6, isSuper ? -44 : -32, 3, 6); // Sideburn

            // Red Cap
            ctx.fillStyle = shirtColor;
            ctx.fillRect(-8, isSuper ? -54 : -42, 16, 8);
            ctx.fillRect(1, isSuper ? -48 : -36, 10, 3); // Visor
        }

        ctx.restore();
    }

    drawEnemies(ctx) {
        this.enemies.forEach(e => {
            const sx = e.x - this.cameraX;
            if (sx < -50 || sx > this.width + 50) return;

            ctx.save();
            ctx.translate(sx, e.y);

            if (e.type === 'goomba') {
                if (e.state === 'flat') {
                    // Squashed Goomba
                    ctx.fillStyle = '#9c4a00';
                    ctx.fillRect(0, 18, 26, 8);
                    ctx.fillStyle = '#fc9838';
                    ctx.fillRect(4, 20, 18, 4);
                } else {
                    // Walking Goomba
                    ctx.fillStyle = '#9c4a00';
                    ctx.beginPath();
                    ctx.ellipse(13, 10, 12, 10, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Stem & Face
                    ctx.fillStyle = '#fc9838';
                    ctx.fillRect(5, 14, 16, 8);
                    // Angry eyes
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(6, 14, 4, 6);
                    ctx.fillRect(16, 14, 4, 6);
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(8, 15, 2, 4);
                    ctx.fillRect(16, 15, 2, 4);
                    // Black feet
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(1, 22, 9, 4);
                    ctx.fillRect(16, 22, 9, 4);
                }
            } else if (e.type === 'koopa') {
                if (e.isShell) {
                    // Koopa Green Shell
                    ctx.fillStyle = '#00a800';
                    ctx.beginPath();
                    ctx.ellipse(13, 10, 12, 10, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeRect(4, 3, 18, 14);
                } else {
                    // Green Koopa Troopa
                    ctx.fillStyle = '#00a800';
                    ctx.fillRect(4, 10, 18, 16);
                    // Yellow head
                    ctx.fillStyle = '#fcb040';
                    ctx.beginPath();
                    ctx.arc(8, 6, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(5, 4, 3, 4);
                    // Yellow shoes
                    ctx.fillStyle = '#fcb040';
                    ctx.fillRect(2, 26, 8, 6);
                    ctx.fillRect(16, 26, 8, 6);
                }
            }
            ctx.restore();
        });
    }

    drawItems(ctx) {
        this.items.forEach(it => {
            const sx = it.x - this.cameraX;
            ctx.save();
            ctx.translate(sx, it.y);

            if (it.type === 'mushroom') {
                // Red Super Mushroom
                ctx.fillStyle = '#d82800';
                ctx.beginPath();
                ctx.arc(12, 10, 11, Math.PI, 0);
                ctx.fill();
                // White spots
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(12, 6, 4, 0, Math.PI * 2);
                ctx.arc(5, 9, 3, 0, Math.PI * 2);
                ctx.arc(19, 9, 3, 0, Math.PI * 2);
                ctx.fill();
                // Stem
                ctx.fillStyle = '#fc9838';
                ctx.fillRect(6, 10, 12, 12);
                ctx.fillStyle = '#000000';
                ctx.fillRect(8, 13, 2, 4);
                ctx.fillRect(14, 13, 2, 4);
            } else if (it.type === 'flower') {
                // Fire Flower
                ctx.fillStyle = '#fc3800';
                ctx.beginPath();
                ctx.arc(12, 10, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fce000';
                ctx.beginPath();
                ctx.arc(12, 10, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(12, 10, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
    }

    drawFireballs(ctx) {
        this.fireballs.forEach(fb => {
            const sx = fb.x - this.cameraX;
            ctx.save();
            ctx.fillStyle = '#fc3800';
            ctx.beginPath();
            ctx.arc(sx, fb.y, fb.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fce000';
            ctx.beginPath();
            ctx.arc(sx, fb.y, fb.radius - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    drawParticles(ctx) {
        this.particles.forEach(p => {
            const sx = p.x - this.cameraX;
            ctx.save();
            if (p.type === 'coin') {
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.ellipse(sx, p.y, 6, 9, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = p.color;
                ctx.fillRect(sx, p.y, p.size, p.size);
            }
            ctx.restore();
        });

        this.floatingTexts.forEach(t => {
            const sx = t.x - this.cameraX;
            ctx.save();
            ctx.font = 'bold 12px "Press Start 2P", monospace, sans-serif';
            ctx.fillStyle = t.color;
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 4;
            ctx.fillText(t.text, sx, t.y);
            ctx.restore();
        });
    }
}

window.SuperMarioGame = SuperMarioGame;
