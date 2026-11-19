// Combat Engine: Monster AI, Blood Physics, Spells, Combos, and Particles

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.bloodSplats = []; // Persistent blood on the ground (capped at 100 for performance)
        this.floatingTexts = [];
    }

    addBlood(x, y, count = 15, direction = 0) {
        for (let i = 0; i < count; i++) {
            const angle = direction + (Math.random() - 0.5) * 1.5;
            const speed = 3 + Math.random() * 8;
            this.particles.push({
                type: 'blood',
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - Math.random() * 3,
                radius: 2 + Math.random() * 3.5,
                color: Math.random() > 0.3 ? '#b71c1c' : '#d32f2f',
                alpha: 1,
                life: 1,
                decay: 0.02 + Math.random() * 0.03,
                gravity: 0.35,
                groundY: 480 + Math.random() * 20
            });
        }
    }

    addSparks(x, y, count = 10, color = '#ffd700') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            this.particles.push({
                type: 'spark',
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1.5 + Math.random() * 2,
                color,
                alpha: 1,
                life: 1,
                decay: 0.04 + Math.random() * 0.05
            });
        }
    }

    addMagicParticles(x, y, count = 8, color = '#9c27b0') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            this.particles.push({
                type: 'magic',
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                radius: 2 + Math.random() * 3,
                color,
                alpha: 1,
                life: 1,
                decay: 0.025 + Math.random() * 0.03
            });
        }
    }

    addFloatingText(text, x, y, color = '#ffffff', isCrit = false) {
        this.floatingTexts.push({
            text,
            x,
            y,
            vy: -2.5,
            color,
            isCrit,
            alpha: 1,
            life: 1,
            decay: 0.02
        });
    }

    update(dt) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.type === 'blood') {
                p.vy += p.gravity;
                if (p.y >= p.groundY) {
                    p.y = p.groundY;
                    p.vx *= 0.3;
                    p.vy = 0;
                    // Leave ground stain
                    if (this.bloodSplats.length < 120 && Math.random() > 0.4) {
                        this.bloodSplats.push({
                            x: p.x,
                            y: p.y,
                            radius: p.radius * (1.2 + Math.random() * 0.8),
                            color: p.color,
                            alpha: 0.75
                        });
                    }
                    this.particles.splice(i, 1);
                    continue;
                }
            } else if (p.type === 'magic') {
                p.vy += 0.05;
            }

            p.life -= p.decay;
            p.alpha = Math.max(0, p.life);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.life -= t.decay;
            t.alpha = Math.max(0, t.life);
            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    draw(ctx, cameraX) {
        // Draw blood stains on ground
        for (const s of this.bloodSplats) {
            const sx = s.x - cameraX;
            if (sx < -50 || sx > ctx.canvas.width + 50) continue;
            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.ellipse(sx, s.y, s.radius * 1.5, s.radius * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw flying particles
        for (const p of this.particles) {
            const px = p.x - cameraX;
            if (px < -50 || px > ctx.canvas.width + 50) continue;
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(px, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw floating combat numbers
        for (const t of this.floatingTexts) {
            const tx = t.x - cameraX;
            ctx.save();
            ctx.globalAlpha = t.alpha;
            ctx.font = t.isCrit ? 'bold 24px Montserrat, sans-serif' : 'bold 16px Montserrat, sans-serif';
            ctx.fillStyle = t.color;
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 6;
            ctx.fillText(t.text, tx, t.y);
            ctx.restore();
        }
    }
}

class CombatEngine {
    constructor() {
        this.particles = new ParticleSystem();
        this.monsters = [];
        this.projectiles = [];
        this.drops = [];
        this.cameraX = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.screenShake = 0;
        this.spawnTimer = 0;
        this.worldDistance = 0;
        this.bossActive = false;
        this.speechBubbleTimer = 8;
        this.speechBubbleText = "Nima gap botam! 😎";

        // Player Combat State
        this.playerCombat = {
            x: 200,
            y: 430,
            groundY: 430,
            vx: 0,
            vy: 0,
            facing: 1, // 1: right, -1: left
            isAttacking: false,
            attackType: null,
            attackFrame: 0,
            attackCooldown: 0,
            isDashing: false,
            dashTime: 0,
            dashCooldown: 0,
            spellCooldowns: { q: 0, w: 0, e: 0, r: 0 },
            spellMaxCooldowns: { q: 4, w: 7, e: 10, r: 18 },
            invulnerable: false,
            invulnTime: 0
        };
    }

    reset() {
        this.monsters = [];
        this.projectiles = [];
        this.drops = [];
        this.combo = 0;
        this.comboTimer = 0;
        this.screenShake = 0;
        this.worldDistance = 0;
        this.bossActive = false;
        this.playerCombat.x = 200;
        this.playerCombat.y = 430;
        this.playerCombat.vx = 0;
        this.playerCombat.vy = 0;
    }

    showSpeech(text, duration = 4) {
        this.speechBubbleText = text;
        this.speechBubbleTimer = duration;
    }

    addScreenShake(amount = 8) {
        this.screenShake = Math.max(this.screenShake, amount);
    }

    triggerHitStop() {
        // Subtle micro-pause for juicy impact
    }

    spawnMonster(type, x) {
        const pLvl = window.gameState.player.level;
        let m = {
            id: 'm_' + Math.random().toString(36).substr(2, 9),
            type,
            x,
            y: 430,
            groundY: 430,
            vx: 0,
            vy: 0,
            facing: -1,
            state: 'patrol', // patrol, chase, attack, hit, dead
            attackTimer: 0,
            hitStun: 0,
            animTimer: 0
        };

        if (type === 'goblin') {
            m.name = 'Qonxo\'r Goblin';
            m.maxHp = 250 + (pLvl * 85);
            m.hp = m.maxHp;
            m.atk = 22 + (pLvl * 7);
            m.def = 8 + (pLvl * 3);
            m.speed = 3.2;
            m.range = 55;
            m.width = 42;
            m.height = 55;
            m.exp = 45 + (pLvl * 15);
            m.gold = 35 + (pLvl * 12);
            m.color = '#4caf50';
        } else if (type === 'wolf') {
            m.name = 'Soya Bo\'risi';
            m.maxHp = 380 + (pLvl * 110);
            m.hp = m.maxHp;
            m.atk = 32 + (pLvl * 10);
            m.def = 14 + (pLvl * 4);
            m.speed = 4.5;
            m.range = 65;
            m.width = 60;
            m.height = 45;
            m.exp = 70 + (pLvl * 22);
            m.gold = 60 + (pLvl * 18);
            m.color = '#3f51b5';
        } else if (type === 'mage') {
            m.name = 'Qora Sehrgar';
            m.maxHp = 450 + (pLvl * 130);
            m.hp = m.maxHp;
            m.atk = 45 + (pLvl * 14);
            m.def = 10 + (pLvl * 3);
            m.speed = 2.0;
            m.range = 280;
            m.width = 44;
            m.height = 68;
            m.exp = 120 + (pLvl * 35);
            m.gold = 100 + (pLvl * 25);
            m.color = '#9c27b0';
        } else if (type === 'golem') {
            m.name = 'Tosh Bahodir Golem';
            m.maxHp = 1200 + (pLvl * 350);
            m.hp = m.maxHp;
            m.atk = 65 + (pLvl * 22);
            m.def = 40 + (pLvl * 12);
            m.speed = 1.8;
            m.range = 75;
            m.width = 75;
            m.height = 95;
            m.exp = 300 + (pLvl * 90);
            m.gold = 250 + (pLvl * 60);
            m.color = '#795548';
        } else if (type === 'dragon') {
            m.name = 'Qadimgi Olov Ajdarhosi (BOSS)';
            m.isBoss = true;
            m.maxHp = 6000 + (pLvl * 1500);
            m.hp = m.maxHp;
            m.atk = 120 + (pLvl * 40);
            m.def = 80 + (pLvl * 25);
            m.speed = 2.6;
            m.range = 140;
            m.width = 140;
            m.height = 120;
            m.exp = 2500 + (pLvl * 600);
            m.gold = 3000 + (pLvl * 800);
            m.color = '#d32f2f';
            this.bossActive = true;
        }

        this.monsters.push(m);
    }

    update(dt, input) {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        // Decrement cooldowns
        if (pc.attackCooldown > 0) pc.attackCooldown -= dt;
        if (pc.dashCooldown > 0) pc.dashCooldown -= dt;
        if (this.speechBubbleTimer > 0) this.speechBubbleTimer -= dt;
        if (pc.invulnTime > 0) {
            pc.invulnTime -= dt;
            if (pc.invulnTime <= 0) pc.invulnerable = false;
        }

        for (const k in pc.spellCooldowns) {
            if (pc.spellCooldowns[k] > 0) {
                pc.spellCooldowns[k] = Math.max(0, pc.spellCooldowns[k] - dt);
            }
        }

        // Combo timer
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        // Screen shake decay
        if (this.screenShake > 0) {
            this.screenShake = Math.max(0, this.screenShake - dt * 25);
        }

        // Dash movement
        if (pc.isDashing) {
            pc.dashTime -= dt;
            pc.vx = pc.facing * (player.speed * 2.8);
            this.particles.addMagicParticles(pc.x, pc.y - 25, 2, '#64b5f6');
            if (pc.dashTime <= 0) {
                pc.isDashing = false;
            }
        } else {
            // Normal horizontal movement
            let moveX = 0;
            if (input.left) moveX -= 1;
            if (input.right) moveX += 1;

            if (moveX !== 0) {
                pc.facing = moveX;
                pc.vx = moveX * player.speed;
            } else {
                pc.vx *= 0.6;
            }

            // Jump
            if (input.jump && pc.y >= pc.groundY) {
                pc.vy = -12;
            }
        }

        // Gravity & vertical
        pc.vy += 0.65;
        pc.x += pc.vx;
        pc.y += pc.vy;

        if (pc.y >= pc.groundY) {
            pc.y = pc.groundY;
            pc.vy = 0;
        }

        // Keep player on positive world travel
        if (pc.x < 100) pc.x = 100;
        this.worldDistance = Math.max(this.worldDistance, pc.x);

        // Smooth Camera Follow
        const targetCamX = pc.x - 300;
        this.cameraX += (targetCamX - this.cameraX) * 0.12;
        if (this.cameraX < 0) this.cameraX = 0;

        // Player Actions
        this.handlePlayerActions(input);

        // Monster Spawner
        this.spawnTimer += dt;
        if (this.spawnTimer > 4.5 && this.monsters.length < 7) {
            this.spawnTimer = 0;
            const spawnX = pc.x + 600 + Math.random() * 200;
            const rand = Math.random();
            if (this.worldDistance > 2500 && !this.bossActive && Math.random() < 0.25) {
                this.spawnMonster('dragon', spawnX + 100);
            } else if (rand < 0.4) {
                this.spawnMonster('goblin', spawnX);
            } else if (rand < 0.7) {
                this.spawnMonster('wolf', spawnX);
            } else if (rand < 0.9) {
                this.spawnMonster('mage', spawnX);
            } else {
                this.spawnMonster('golem', spawnX);
            }
        }

        // Update Monsters
        this.updateMonsters(dt);

        // Update Projectiles
        this.updateProjectiles(dt);

        // Update Drops
        this.updateDrops(dt);

        // Update Particles
        this.particles.update(dt);
    }

    handlePlayerActions(input) {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        // Dash action (Shift / Space)
        if (input.dash && pc.dashCooldown <= 0 && !pc.isDashing) {
            pc.isDashing = true;
            pc.dashTime = 0.22;
            pc.dashCooldown = 0.85;
            pc.invulnerable = true;
            pc.invulnTime = 0.28;
            if (window.sounds) window.sounds.playSlash();
            input.dash = false;
        }

        // Normal combo attack (Z / Click)
        if (input.attack && pc.attackCooldown <= 0) {
            pc.isAttacking = true;
            pc.attackType = 'combo';
            pc.attackFrame = 0;
            pc.attackCooldown = 0.28;

            this.performMeleeAttack('combo');
            if (window.sounds) window.sounds.playSlash();
            input.attack = false;
        }

        // Heavy Spin Attack (X)
        if (input.heavy && pc.attackCooldown <= 0) {
            pc.isAttacking = true;
            pc.attackType = 'spin';
            pc.attackCooldown = 0.45;

            this.performMeleeAttack('spin');
            if (window.sounds) window.sounds.playSlash();
            input.heavy = false;
        }

        // Spell 1: Fireball (Q)
        if (input.spellQ && pc.spellCooldowns.q <= 0 && player.mana >= 25) {
            player.mana -= 25;
            pc.spellCooldowns.q = pc.spellMaxCooldowns.q;
            this.castFireball();
            input.spellQ = false;
        }

        // Spell 2: Chaqmoq Bo'roni (W)
        if (input.spellW && pc.spellCooldowns.w <= 0 && player.mana >= 45) {
            player.mana -= 45;
            pc.spellCooldowns.w = pc.spellMaxCooldowns.w;
            this.castLightning();
            input.spellW = false;
        }

        // Spell 3: Qora Girdob / Vortex (E)
        if (input.spellE && pc.spellCooldowns.e <= 0 && player.mana >= 60) {
            player.mana -= 60;
            pc.spellCooldowns.e = pc.spellMaxCooldowns.e;
            this.castVoidVortex();
            input.spellE = false;
        }

        // Spell 4: Ajdarho Qudrati (R - Ultimate)
        if (input.spellR && pc.spellCooldowns.r <= 0 && player.mana >= 100) {
            player.mana -= 100;
            pc.spellCooldowns.r = pc.spellMaxCooldowns.r;
            this.castDragonUltimate();
            input.spellR = false;
        }
    }

    performMeleeAttack(type) {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        const reach = type === 'spin' ? 110 : 85;
        const hitX = type === 'spin' ? pc.x : pc.x + (pc.facing * (reach * 0.5));
        const hitRadius = reach;

        let hitAny = false;

        for (const m of this.monsters) {
            if (m.hp <= 0) continue;

            const dist = Math.hypot(m.x - hitX, m.y - pc.y);
            if (dist < hitRadius + m.width * 0.5) {
                // Calculate damage
                const isCrit = Math.random() * 100 < player.critRate;
                let rawDmg = player.atk * (type === 'spin' ? 1.6 : 1.2);
                if (isCrit) rawDmg *= player.critDmg;

                // Defense reduction
                const finalDmg = Math.max(5, Math.floor(rawDmg - (m.def * 0.4)));

                m.hp -= finalDmg;
                m.hitStun = 0.25;
                m.vx = pc.facing * 5; // Knockback

                // Particles & Sound
                this.particles.addBlood(m.x, m.y - m.height * 0.5, isCrit ? 25 : 12, pc.facing === 1 ? 0 : Math.PI);
                this.particles.addSparks(m.x, m.y - m.height * 0.5, 8, isCrit ? '#ffeb3b' : '#ff9800');
                this.particles.addFloatingText(`${finalDmg}${isCrit ? '!' : ''}`, m.x, m.y - m.height, isCrit ? '#ffd700' : '#ffffff', isCrit);

                if (isCrit) {
                    this.addScreenShake(7);
                    if (window.sounds) window.sounds.playCrit();
                } else {
                    this.addScreenShake(3);
                    if (window.sounds) window.sounds.playHit();
                }

                this.registerCombo();
                hitAny = true;
            }
        }
    }

    castFireball() {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        if (window.sounds) window.sounds.playFireball();
        this.addScreenShake(4);

        for (let i = -1; i <= 1; i++) {
            this.projectiles.push({
                type: 'fireball',
                x: pc.x + pc.facing * 25,
                y: pc.y - 30 + (i * 12),
                vx: pc.facing * (10 + Math.abs(i)),
                vy: i * 1.5,
                radius: 14,
                dmg: Math.floor(player.magicPower * 1.8 + player.atk * 0.5),
                color: '#ff5722',
                life: 1.8,
                piercing: false
            });
        }
    }

    castLightning() {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        if (window.sounds) window.sounds.playLightning();
        this.addScreenShake(8);

        // Strike 3 nearest monsters or positions ahead
        let targets = this.monsters.filter(m => m.hp > 0 && Math.abs(m.x - pc.x) < 450);
        if (targets.length === 0) {
            // Visual zap ahead
            this.particles.addMagicParticles(pc.x + pc.facing * 200, 300, 25, '#00e5ff');
            return;
        }

        targets.slice(0, 4).forEach(m => {
            const dmg = Math.floor(player.magicPower * 2.5 + player.atk * 0.8);
            m.hp -= dmg;
            m.hitStun = 0.4;
            this.particles.addMagicParticles(m.x, m.y - m.height * 0.5, 30, '#00e5ff');
            this.particles.addBlood(m.x, m.y - m.height * 0.5, 18, -Math.PI / 2);
            this.particles.addFloatingText(`⚡ ${dmg}!`, m.x, m.y - m.height - 20, '#00e5ff', true);
            this.registerCombo();
        });
    }

    castVoidVortex() {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        if (window.sounds) window.sounds.playFireball();
        this.addScreenShake(6);

        this.projectiles.push({
            type: 'vortex',
            x: pc.x + pc.facing * 180,
            y: pc.y - 25,
            radius: 80,
            dmgPerTick: Math.floor(player.magicPower * 0.6),
            tickTimer: 0,
            duration: 3.5,
            color: '#7b1fa2'
        });
    }

    castDragonUltimate() {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        if (window.sounds) window.sounds.playDragonUlt();
        this.addScreenShake(18);

        // Giant dragon wave across the screen!
        this.projectiles.push({
            type: 'dragon_ult',
            x: pc.x - 150,
            y: pc.y - 100,
            vx: pc.facing * 14,
            width: 280,
            height: 180,
            dmg: Math.floor(player.magicPower * 6.5 + player.atk * 4.5),
            life: 2.5,
            hitMonsters: new Set()
        });

        this.particles.addMagicParticles(pc.x, pc.y - 40, 50, '#ffd700');
    }

    registerCombo() {
        this.combo++;
        this.comboTimer = 3.5;
    }

    updateMonsters(dt) {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const m = this.monsters[i];

            // Hit stun
            if (m.hitStun > 0) {
                m.hitStun -= dt;
                m.x += m.vx;
                m.vx *= 0.8;
                continue;
            }

            // Check if dead
            if (m.hp <= 0) {
                // Monster Death!
                this.particles.addBlood(m.x, m.y - m.height * 0.5, 30, 0);
                this.particles.addSparks(m.x, m.y - m.height * 0.5, 15, '#ff5722');

                // Award Exp & Gold
                player.gold += m.gold;
                window.gameState.addExp(m.exp);
                if (window.sounds) window.sounds.playCoin();

                this.particles.addFloatingText(`+${m.gold} 💰`, m.x, m.y - 30, '#ffd700');
                this.particles.addFloatingText(`+${m.exp} EXP`, m.x, m.y - 50, '#69f0ae');

                // Random drops
                this.spawnDrop(m.x, m.y, m.isBoss);

                if (m.isBoss) {
                    this.bossActive = false;
                    this.addScreenShake(15);
                    this.particles.addFloatingText(`🔥 AJDARHO MAG'LUB ETILDI! 🔥`, pc.x, pc.y - 120, '#ff1744', true);
                }

                this.monsters.splice(i, 1);
                continue;
            }

            // AI Logic
            const dx = pc.x - m.x;
            const dist = Math.abs(dx);
            m.facing = dx > 0 ? 1 : -1;

            if (dist > m.range) {
                // Chase
                m.vx = m.facing * m.speed;
                m.x += m.vx;
            } else {
                // Attack
                m.vx = 0;
                m.attackTimer += dt;
                const attackSpeed = m.type === 'mage' ? 2.5 : 1.2;

                if (m.attackTimer >= attackSpeed) {
                    m.attackTimer = 0;
                    this.monsterAttack(m);
                }
            }
        }
    }

    monsterAttack(m) {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        if (m.type === 'mage') {
            // Shoot dark orb
            this.projectiles.push({
                type: 'dark_orb',
                x: m.x,
                y: m.y - 35,
                vx: m.facing * 6,
                vy: 0,
                radius: 12,
                dmg: m.atk,
                color: '#8e24aa',
                isEnemy: true,
                life: 3
            });
            return;
        }

        if (m.type === 'dragon') {
            // Dragon breath
            this.addScreenShake(6);
            for (let i = 0; i < 4; i++) {
                this.projectiles.push({
                    type: 'dragon_breath',
                    x: m.x + m.facing * 60,
                    y: m.y - 50 + (i * 10),
                    vx: m.facing * (8 + i),
                    vy: (Math.random() - 0.5) * 2,
                    radius: 20,
                    dmg: Math.floor(m.atk * 0.8),
                    color: '#ff3d00',
                    isEnemy: true,
                    life: 1.5
                });
            }
            return;
        }

        // Melee hit on player
        const dist = Math.hypot(pc.x - m.x, pc.y - m.y);
        if (dist < m.range + 25 && !pc.invulnerable) {
            const rawDmg = m.atk;
            const finalDmg = Math.max(3, Math.floor(rawDmg - (player.def * 0.35)));

            player.hp -= finalDmg;
            pc.invulnerable = true;
            pc.invulnTime = 0.4;
            pc.vx = m.facing * 4;

            this.particles.addBlood(pc.x, pc.y - 30, 15, m.facing === 1 ? 0 : Math.PI);
            this.particles.addFloatingText(`-${finalDmg}`, pc.x, pc.y - 50, '#ff1744', false);
            this.addScreenShake(5);
            if (window.sounds) window.sounds.playHit();

            if (player.hp <= 0) {
                player.hp = 0;
                this.onPlayerDefeat();
            }
        }
    }

    onPlayerDefeat() {
        const player = window.gameState.player;
        this.addScreenShake(12);
        this.particles.addFloatingText('QAHRAMON YIQILDI! (Tiriklanish...)', this.playerCombat.x, this.playerCombat.y - 80, '#ff1744', true);
        
        setTimeout(() => {
            player.hp = player.maxHp;
            player.mana = player.maxMana;
            this.playerCombat.x = Math.max(100, this.playerCombat.x - 300);
            this.monsters = [];
            window.gameState.save();
        }, 1500);
    }

    updateProjectiles(dt) {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];

            if (proj.type === 'vortex') {
                proj.duration -= dt;
                proj.tickTimer += dt;

                // Pull enemies towards center & tick damage
                this.particles.addMagicParticles(proj.x, proj.y, 4, '#ba68c8');
                for (const m of this.monsters) {
                    if (m.hp <= 0) continue;
                    const dist = Math.hypot(m.x - proj.x, m.y - proj.y);
                    if (dist < proj.radius * 1.5) {
                        m.x += (proj.x - m.x) * 0.08;
                        if (proj.tickTimer >= 0.35) {
                            m.hp -= proj.dmgPerTick;
                            this.particles.addBlood(m.x, m.y - 20, 6, 0);
                            this.particles.addFloatingText(`${proj.dmgPerTick}`, m.x, m.y - 40, '#e040fb');
                            this.registerCombo();
                        }
                    }
                }
                if (proj.tickTimer >= 0.35) proj.tickTimer = 0;

                if (proj.duration <= 0) {
                    this.projectiles.splice(i, 1);
                }
                continue;
            }

            if (proj.type === 'dragon_ult') {
                proj.x += proj.vx;
                proj.life -= dt;
                this.particles.addMagicParticles(proj.x, proj.y + 60, 10, '#ffd700');

                // Check collision with all monsters
                for (const m of this.monsters) {
                    if (m.hp <= 0 || proj.hitMonsters.has(m.id)) continue;
                    if (Math.abs(m.x - proj.x) < 120) {
                        proj.hitMonsters.add(m.id);
                        m.hp -= proj.dmg;
                        m.hitStun = 0.5;
                        this.particles.addBlood(m.x, m.y - m.height * 0.5, 40, 0);
                        this.particles.addSparks(m.x, m.y - m.height * 0.5, 25, '#ffd700');
                        this.particles.addFloatingText(`💥 ${proj.dmg}!!`, m.x, m.y - m.height - 20, '#ffd700', true);
                        this.registerCombo();
                    }
                }

                if (proj.life <= 0) {
                    this.projectiles.splice(i, 1);
                }
                continue;
            }

            // Normal projectiles (fireball, dark orb, breath)
            proj.x += proj.vx;
            proj.y += (proj.vy || 0);
            proj.life -= dt;

            // Visual trail
            if (proj.type === 'fireball') {
                this.particles.addMagicParticles(proj.x, proj.y, 2, '#ff9800');
            } else if (proj.isEnemy) {
                this.particles.addMagicParticles(proj.x, proj.y, 2, proj.color);
            }

            // Collision check
            if (proj.isEnemy) {
                const distToPlayer = Math.hypot(pc.x - proj.x, (pc.y - 30) - proj.y);
                if (distToPlayer < proj.radius + 20 && !pc.invulnerable) {
                    const finalDmg = Math.max(3, Math.floor(proj.dmg - (player.def * 0.3)));
                    player.hp -= finalDmg;
                    pc.invulnerable = true;
                    pc.invulnTime = 0.35;
                    this.particles.addBlood(pc.x, pc.y - 30, 14, 0);
                    this.particles.addFloatingText(`-${finalDmg}`, pc.x, pc.y - 50, '#ff1744');
                    this.addScreenShake(4);
                    this.projectiles.splice(i, 1);
                    continue;
                }
            } else {
                // Hero projectile vs monsters
                for (const m of this.monsters) {
                    if (m.hp <= 0) continue;
                    const dist = Math.hypot(m.x - proj.x, (m.y - 30) - proj.y);
                    if (dist < proj.radius + m.width * 0.5) {
                        m.hp -= proj.dmg;
                        m.hitStun = 0.2;
                        this.particles.addBlood(m.x, m.y - 20, 18, 0);
                        this.particles.addSparks(m.x, m.y - 20, 12, '#ff5722');
                        this.particles.addFloatingText(`${proj.dmg}`, m.x, m.y - m.height, '#ff5722');
                        this.registerCombo();

                        if (!proj.piercing) {
                            this.projectiles.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            if (proj.life <= 0) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    spawnDrop(x, y, isBoss = false) {
        const count = isBoss ? 5 : (Math.random() < 0.6 ? 1 : 0);
        if (count === 0) return;

        for (let i = 0; i < count; i++) {
            const isGem = Math.random() < (isBoss ? 0.8 : 0.25);
            this.drops.push({
                type: isGem ? 'gem' : 'coin',
                x: x + (Math.random() - 0.5) * 40,
                y: y - 20,
                vx: (Math.random() - 0.5) * 4,
                vy: -4 - Math.random() * 3,
                value: isGem ? Math.floor(5 + Math.random() * 20) : Math.floor(50 + Math.random() * 150),
                collected: false
            });
        }
    }

    updateDrops(dt) {
        const pc = this.playerCombat;
        const player = window.gameState.player;

        for (let i = this.drops.length - 1; i >= 0; i--) {
            const d = this.drops[i];
            d.vy += 0.35;
            d.x += d.vx;
            d.y += d.vy;
            if (d.y >= 445) {
                d.y = 445;
                d.vx *= 0.8;
                d.vy = 0;
            }

            // Magnetic collect towards player
            const dist = Math.hypot(pc.x - d.x, (pc.y - 30) - d.y);
            if (dist < 120) {
                d.x += (pc.x - d.x) * 0.18;
                d.y += ((pc.y - 30) - d.y) * 0.18;
            }

            if (dist < 35 && !d.collected) {
                d.collected = true;
                if (d.type === 'coin') {
                    player.gold += d.value;
                    this.particles.addFloatingText(`+${d.value} 🪙`, pc.x, pc.y - 45, '#ffd700');
                } else {
                    player.gems += d.value;
                    this.particles.addFloatingText(`+${d.value} 💎`, pc.x, pc.y - 65, '#00e5ff');
                }
                if (window.sounds) window.sounds.playCoin();
                this.drops.splice(i, 1);
            }
        }
    }
}

window.combat = new CombatEngine();

