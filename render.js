// 2D Rendering Engine: Parallax Scenic Backgrounds, Paper-Doll Hero Customization, Monsters & VFX

class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animTime = 0;

        // Load background images from assets
        this.bgImages = {
            scenicDay: new Image(),
            combatNight: new Image(),
            inventoryArt: new Image(),
            heroFace: new Image()
        };

        this.bgImages.scenicDay.src = 'assets/0x0.webp';
        this.bgImages.combatNight.src = 'assets/images.jpg';
        this.bgImages.inventoryArt.src = 'assets/shopping.webp';
        this.bgImages.heroFace.src = 'assets/hero_face.jpg';

        this.imagesLoaded = {
            scenicDay: false,
            combatNight: false,
            inventoryArt: false,
            heroFace: false
        };

        this.bgImages.scenicDay.onload = () => { this.imagesLoaded.scenicDay = true; };
        this.bgImages.combatNight.onload = () => { this.imagesLoaded.combatNight = true; };
        this.bgImages.inventoryArt.onload = () => { this.imagesLoaded.inventoryArt = true; };
        this.bgImages.heroFace.onload = () => { this.imagesLoaded.heroFace = true; };
    }

    render(combat, state, dt) {
        this.animTime += dt;
        const ctx = this.ctx;
        const camX = combat.cameraX;

        ctx.save();

        // Apply screen shake
        if (combat.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * combat.screenShake;
            const shakeY = (Math.random() - 0.5) * combat.screenShake;
            ctx.translate(shakeX, shakeY);
        }

        // 1. Draw Parallax Background
        this.drawBackground(camX);

        // 2. Draw Blood Stains and Ground Particles
        combat.particles.draw(ctx, camX);

        // 3. Draw Collectible Drops
        this.drawDrops(combat.drops, camX);

        // 4. Draw Monsters
        for (const m of combat.monsters) {
            this.drawMonster(m, camX);
        }

        // 5. Draw Hero (Paper-Doll with equipped armor, helmet, cape, weapon)
        this.drawHero(combat.playerCombat, state, camX);

        // 6. Draw Projectiles & Spell FX
        this.drawProjectiles(combat.projectiles, camX);

        // 7. Draw Foreground Atmosphere (floating embers / fog)
        this.drawAtmosphere(camX);

        ctx.restore();
    }

    drawBackground(camX) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Gradient Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#101728');
        skyGrad.addColorStop(0.4, '#1e2942');
        skyGrad.addColorStop(0.7, '#2b3956');
        skyGrad.addColorStop(1, '#1b2434');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Draw scenic background art if loaded (Parallax 0.15)
        if (this.imagesLoaded.scenicDay) {
            ctx.save();
            ctx.globalAlpha = 0.45;
            const bgW = 900;
            const bgH = 450;
            const scroll = (camX * 0.15) % bgW;
            ctx.drawImage(this.bgImages.scenicDay, -scroll, 30, bgW, bgH);
            ctx.drawImage(this.bgImages.scenicDay, bgW - scroll, 30, bgW, bgH);
            ctx.restore();
        }

        // Distant Mountains Layer (Parallax 0.3)
        ctx.save();
        ctx.fillStyle = '#182439';
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w + 100; x += 120) {
            const worldX = x + camX * 0.3;
            const peakY = 240 + Math.sin(worldX * 0.005) * 50 + Math.cos(worldX * 0.01) * 30;
            ctx.lineTo(x, peakY);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Mid-ground Hill and Trees Layer (Parallax 0.6)
        ctx.save();
        ctx.fillStyle = '#1c2e3d';
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w + 60; x += 60) {
            const worldX = x + camX * 0.6;
            const hillY = 360 + Math.sin(worldX * 0.012) * 35;
            ctx.lineTo(x, hillY);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Ground Platform / Cobblestone Road (Parallax 1.0)
        const groundY = 430;
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
        groundGrad.addColorStop(0, '#2e3a29'); // Lush moss / grass edge
        groundGrad.addColorStop(0.1, '#3b2f21'); // Earth
        groundGrad.addColorStop(0.4, '#241b12');
        groundGrad.addColorStop(1, '#110c08');

        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, w, h - groundY);

        // Cobblestone stones on the road
        ctx.save();
        ctx.fillStyle = '#4a5543';
        const startTile = Math.floor(camX / 40);
        for (let i = 0; i < (w / 40) + 2; i++) {
            const tileIdx = startTile + i;
            const stoneX = (tileIdx * 40) - camX;
            ctx.fillRect(stoneX + 4, groundY + 8, 30, 8);
            ctx.fillRect(stoneX + 18, groundY + 22, 28, 7);
        }
        // Top glowing grass line
        ctx.fillStyle = '#558b2f';
        ctx.fillRect(0, groundY - 2, w, 4);
        ctx.restore();
    }

    drawHero(pc, state, camX, customCtx = null) {
        const ctx = customCtx || this.ctx;
        const hx = pc.x - camX;
        const hy = pc.y;
        const facing = pc.facing;
        const eq = state.equipment;
        const p = state.player;

        ctx.save();
        ctx.translate(hx, hy);
        ctx.scale(facing, 1);

        // Flash white if invincible/hit
        if (pc.invulnerable && Math.floor(this.animTime * 20) % 2 === 0) {
            ctx.filter = 'brightness(2.2)';
        }

        // Running / Idling bounce
        const isRunning = Math.abs(pc.vx) > 0.5;
        const bob = isRunning ? Math.sin(this.animTime * 14) * 3 : Math.sin(this.animTime * 3) * 1.5;
        const legSwing = isRunning ? Math.sin(this.animTime * 14) * 15 : 0;

        // 1. VIP Radiant Aura & Orbiting Spheres
        if (p.vip) {
            ctx.save();
            const auraGrad = ctx.createRadialGradient(0, -35, 10, 0, -35, 65);
            auraGrad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
            auraGrad.addColorStop(0.7, 'rgba(255, 152, 0, 0.2)');
            auraGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(0, -35, 65, 0, Math.PI * 2);
            ctx.fill();

            // Orbiting VIP stars
            for (let i = 0; i < 3; i++) {
                const angle = this.animTime * 3 + (i * (Math.PI * 2 / 3));
                const starX = Math.cos(angle) * 45;
                const starY = -35 + Math.sin(angle) * 18;
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ff9800';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(starX, starY, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // 2. Cape / Wings (Behind Body)
        this.drawHeroCape(ctx, eq.cape, bob, isRunning, p.vip);

        // 3. Legs / Boots
        ctx.fillStyle = '#1a1a24';
        // Left Leg
        ctx.save();
        ctx.translate(-8, -12);
        ctx.rotate((-legSwing * Math.PI) / 180);
        ctx.fillRect(-4, 0, 8, 14);
        // Boot tip
        ctx.fillStyle = '#37474f';
        ctx.fillRect(-4, 10, 11, 4);
        ctx.restore();

        // Right Leg
        ctx.save();
        ctx.translate(8, -12);
        ctx.rotate((legSwing * Math.PI) / 180);
        ctx.fillStyle = '#1a1a24';
        ctx.fillRect(-4, 0, 8, 14);
        ctx.fillStyle = '#37474f';
        ctx.fillRect(-4, 10, 11, 4);
        ctx.restore();

        // 4. Armor / Torso / Body
        this.drawHeroArmor(ctx, eq.armor, bob, p.vip);

        // 5. Head, Hair, & Helmet
        this.drawHeroHead(ctx, eq.helmet, bob, p.vip);

        // 6. Weapon & Attack Animation
        this.drawHeroWeapon(ctx, eq.weapon, pc, bob, p.vip);

        // 7. Speech Bubble ("Nima gap botam!")
        if (combat && combat.speechBubbleTimer > 0) {
            this.drawSpeechBubble(ctx, combat.speechBubbleText || "Nima gap botam! 😎", 0, -78 + bob);
        }

        ctx.restore();
    }

    drawSpeechBubble(ctx, text, x, y) {
        ctx.save();
        ctx.font = 'bold 12px Montserrat, sans-serif';
        const metrics = ctx.measureText(text);
        const textW = metrics.width;
        const padX = 14;
        const bubbleW = textW + padX * 2;
        const bubbleH = 26;
        const bx = x - bubbleW / 2;
        const by = y - bubbleH;

        // Background box
        ctx.fillStyle = 'rgba(13, 17, 23, 0.95)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(bx, by, bubbleW, bubbleH, 8);
        } else {
            ctx.rect(bx, by, bubbleW, bubbleH);
        }
        ctx.fill();
        ctx.stroke();

        // Speech bubble triangle tail
        ctx.beginPath();
        ctx.moveTo(x - 5, by + bubbleH);
        ctx.lineTo(x, by + bubbleH + 6);
        ctx.lineTo(x + 5, by + bubbleH);
        ctx.closePath();
        ctx.fillStyle = '#ffd700';
        ctx.fill();

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, by + bubbleH / 2);

        ctx.restore();
    }

    drawHeroCape(ctx, capeId, bob, isRunning, isVip) {
        ctx.save();
        const wave = Math.sin(this.animTime * 8) * 8;

        if (capeId === 'c_diyorbek_wings' || isVip) {
            // Massive Golden Astral Wings!
            const wingFlap = Math.sin(this.animTime * 7) * 0.25;
            ctx.save();
            ctx.translate(-10, -42 + bob);
            ctx.rotate(-0.3 + wingFlap);

            const wingGrad = ctx.createLinearGradient(-70, -50, 0, 20);
            wingGrad.addColorStop(0, '#fff9c4');
            wingGrad.addColorStop(0.5, '#ffd700');
            wingGrad.addColorStop(1, '#ff6f00');
            ctx.fillStyle = wingGrad;
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-50, -60, -90, -40);
            ctx.quadraticCurveTo(-70, -10, -85, 20);
            ctx.quadraticCurveTo(-45, 10, 0, 0);
            ctx.fill();
            ctx.restore();
        } else if (capeId === 'c_flame_wings') {
            // Fiery Wings
            const flap = Math.sin(this.animTime * 9) * 0.2;
            ctx.save();
            ctx.translate(-8, -40 + bob);
            ctx.rotate(-0.2 + flap);
            ctx.fillStyle = '#ff3d00';
            ctx.shadowColor = '#ff9100';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-40, -45, -70, -25);
            ctx.quadraticCurveTo(-50, 0, -65, 20);
            ctx.quadraticCurveTo(-30, 10, 0, 0);
            ctx.fill();
            ctx.restore();
        } else {
            // Flowing Cloak
            let capeColor = '#b71c1c'; // Red
            if (capeId === 'c_traveler_cloak') capeColor = '#4e342e';
            ctx.fillStyle = capeColor;
            ctx.beginPath();
            ctx.moveTo(-6, -38 + bob);
            ctx.lineTo(-24 - wave, -10 + bob);
            ctx.lineTo(-20 - wave, 5 + bob);
            ctx.lineTo(-4, -20 + bob);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    drawHeroArmor(ctx, armorId, bob, isVip) {
        ctx.save();
        ctx.translate(0, -32 + bob);

        if (armorId === 'a_diyorbek_emperor' || isVip) {
            // VIP Emperor Robe / Armor (White & Royal Gold)
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(-10, 0, 20, 22);

            // Golden filigree and crest
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(-12, -2, 24, 6); // Golden pauldrons
            ctx.fillRect(-4, 4, 8, 14); // Royal emblem

            // Crimson royal belt
            ctx.fillStyle = '#d50000';
            ctx.fillRect(-10, 15, 20, 4);
        } else if (armorId === 'a_dragon_plate') {
            // Fiery dragon plate
            ctx.fillStyle = '#b71c1c';
            ctx.fillRect(-10, 0, 20, 22);
            ctx.fillStyle = '#ff6f00';
            ctx.fillRect(-12, -1, 24, 5); // Spiked shoulders
            ctx.fillStyle = '#212121';
            ctx.fillRect(-8, 6, 16, 10);
        } else if (armorId === 'a_dark_knight') {
            // Gothic dark plate
            ctx.fillStyle = '#212121';
            ctx.fillRect(-10, 0, 20, 22);
            ctx.fillStyle = '#7b1fa2';
            ctx.fillRect(-11, -1, 22, 5);
        } else if (armorId === 'a_iron_plate') {
            // Steel knight plate
            ctx.fillStyle = '#78909c';
            ctx.fillRect(-10, 0, 20, 22);
            ctx.fillStyle = '#b0bec5';
            ctx.fillRect(-12, -2, 24, 5);
        } else {
            // Traveler Cloth Tunic
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(-9, 0, 18, 22);
            ctx.fillStyle = '#d7ccc8';
            ctx.fillRect(-6, 2, 12, 10);
        }

        ctx.restore();
    }

    drawHeroHead(ctx, helmId, bob, isVip) {
        ctx.save();
        ctx.translate(0, -46 + bob);

        if (this.imagesLoaded.heroFace) {
            // Real User's Face from hero_face.jpg
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, 11, 0, Math.PI * 2);
            ctx.clip();
            // Source is 768x1024, face box centered around x:160, y:120, w:448, h:480
            ctx.drawImage(this.bgImages.heroFace, 160, 120, 448, 480, -11, -11, 22, 22);
            ctx.restore();

            // Face contour border
            ctx.strokeStyle = isVip ? '#ffd700' : 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 11, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Fallback Face & Skin
            ctx.fillStyle = '#ffe0b2';
            ctx.beginPath();
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.fill();

            // Eye (Bright Anime Eye)
            ctx.fillStyle = isVip ? '#ffd700' : '#00e5ff';
            ctx.beginPath();
            ctx.arc(4, -1, 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Hair
            ctx.fillStyle = '#eceff1';
            ctx.beginPath();
            ctx.moveTo(-10, 2);
            ctx.quadraticCurveTo(-15, -12, 0, -12);
            ctx.quadraticCurveTo(12, -12, 10, 4);
            ctx.lineTo(6, -2);
            ctx.lineTo(2, 6);
            ctx.lineTo(-2, -3);
            ctx.lineTo(-6, 4);
            ctx.closePath();
            ctx.fill();
        }

        // Helmet / Crown
        if (helmId === 'h_diyorbek_crown' || isVip) {
            // VIP Emperor Crown
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(-9, -10);
            ctx.lineTo(-12, -20);
            ctx.lineTo(-4, -14);
            ctx.lineTo(0, -24); // Center tallest peak
            ctx.lineTo(4, -14);
            ctx.lineTo(12, -20);
            ctx.lineTo(9, -10);
            ctx.closePath();
            ctx.fill();

            // Crown jewels
            ctx.fillStyle = '#00e5ff';
            ctx.beginPath();
            ctx.arc(0, -14, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (helmId === 'h_dragon_crown') {
            // Dragon Horns
            ctx.fillStyle = '#d50000';
            ctx.beginPath();
            ctx.moveTo(-6, -10);
            ctx.quadraticCurveTo(-16, -20, -12, -26);
            ctx.lineTo(-8, -14);
            ctx.moveTo(6, -10);
            ctx.quadraticCurveTo(16, -20, 12, -26);
            ctx.lineTo(8, -14);
            ctx.fill();
        } else if (helmId === 'h_knight_helm') {
            ctx.fillStyle = '#90a4ae';
            ctx.fillRect(-10, -14, 20, 8);
            ctx.fillStyle = '#263238';
            ctx.fillRect(-8, -10, 16, 2);
        } else {
            // Headband
            ctx.fillStyle = '#d32f2f';
            ctx.fillRect(-9, -7, 18, 3);
        }

        ctx.restore();
    }

    drawHeroWeapon(ctx, wepId, pc, bob, isVip) {
        ctx.save();
        ctx.translate(6, -22 + bob);

        let swingAngle = 0.4;
        let bladeLength = 48;

        if (pc.isAttacking) {
            if (pc.attackType === 'spin') {
                swingAngle = (this.animTime * 35) % (Math.PI * 2);
                bladeLength = 55;
            } else {
                swingAngle = Math.PI * 0.7 - (pc.attackCooldown * 8);
            }
        }

        ctx.rotate(swingAngle);

        // Blade styling based on weapon item
        if (wepId === 'w_diyorbek_doom' || isVip) {
            // Divine VIP Doom Blade (Golden & Rainbow Glow)
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 18;

            // Handle
            ctx.fillStyle = '#424242';
            ctx.fillRect(-2, 0, 4, 14);
            // Golden Guard
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(-12, -3, 24, 6);

            // Radiant Blade
            const bladeGrad = ctx.createLinearGradient(0, -bladeLength, 0, 0);
            bladeGrad.addColorStop(0, '#ffffff');
            bladeGrad.addColorStop(0.3, '#fff176');
            bladeGrad.addColorStop(0.7, '#ffd700');
            bladeGrad.addColorStop(1, '#ff6f00');
            ctx.fillStyle = bladeGrad;

            ctx.beginPath();
            ctx.moveTo(-5, -3);
            ctx.lineTo(-6, -bladeLength + 8);
            ctx.lineTo(0, -bladeLength - 6);
            ctx.lineTo(6, -bladeLength + 8);
            ctx.lineTo(5, -3);
            ctx.closePath();
            ctx.fill();
        } else if (wepId === 'w_dragon_slayer') {
            // Giant Dragon Tooth Greatsword
            ctx.shadowColor = '#ff1744';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#37474f';
            ctx.fillRect(-2, 0, 4, 14);
            ctx.fillStyle = '#b71c1c';
            ctx.fillRect(-10, -2, 20, 5);

            ctx.fillStyle = '#d50000';
            ctx.beginPath();
            ctx.moveTo(-5, -2);
            ctx.lineTo(-7, -46);
            ctx.lineTo(0, -54);
            ctx.lineTo(7, -46);
            ctx.lineTo(5, -2);
            ctx.closePath();
            ctx.fill();
        } else if (wepId === 'w_wind_saber') {
            ctx.fillStyle = '#00e5ff';
            ctx.fillRect(-3, -40, 6, 40);
        } else if (wepId === 'w_flame_spear') {
            ctx.fillStyle = '#ff5722';
            ctx.fillRect(-2, -55, 4, 65);
        } else {
            // Steel sword
            ctx.fillStyle = '#546e7a';
            ctx.fillRect(-1.5, 0, 3, 10);
            ctx.fillStyle = '#37474f';
            ctx.fillRect(-7, -2, 14, 4);
            ctx.fillStyle = '#cfd8dc';
            ctx.fillRect(-3, -36, 6, 36);
        }

        ctx.restore();
    }

    drawMonster(m, camX) {
        const ctx = this.ctx;
        const mx = m.x - camX;
        const my = m.y;

        if (mx < -150 || mx > this.canvas.width + 150) return;

        ctx.save();
        ctx.translate(mx, my);
        ctx.scale(m.facing, 1);

        if (m.hitStun > 0) {
            ctx.filter = 'brightness(2.0)';
        }

        if (m.type === 'goblin') {
            // Goblin
            const legSwing = Math.sin(this.animTime * 12) * 8;
            ctx.fillStyle = '#388e3c'; // Green skin
            // Torso
            ctx.fillRect(-12, -40, 24, 25);
            // Head
            ctx.beginPath();
            ctx.arc(0, -48, 12, 0, Math.PI * 2);
            ctx.fill();
            // Pointy Ears
            ctx.beginPath();
            ctx.moveTo(-10, -48);
            ctx.lineTo(-22, -54);
            ctx.lineTo(-8, -42);
            ctx.fill();
            // Red eyes
            ctx.fillStyle = '#d50000';
            ctx.fillRect(4, -50, 4, 3);
            // Dagger
            ctx.fillStyle = '#9e9e9e';
            ctx.fillRect(10, -32, 16, 4);
        } else if (m.type === 'wolf') {
            // Shadow Wolf
            ctx.fillStyle = '#283593';
            // Body
            ctx.beginPath();
            ctx.ellipse(0, -22, 28, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head
            ctx.beginPath();
            ctx.moveTo(18, -25);
            ctx.lineTo(34, -20);
            ctx.lineTo(24, -34);
            ctx.closePath();
            ctx.fill();
            // Glowing eyes
            ctx.fillStyle = '#ff1744';
            ctx.fillRect(24, -26, 3, 3);
            // Tail
            ctx.strokeStyle = '#1a237e';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(-25, -24);
            ctx.quadraticCurveTo(-38, -35, -42, -18);
            ctx.stroke();
        } else if (m.type === 'mage') {
            // Dark Mage
            const floatBob = Math.sin(this.animTime * 4) * 6;
            ctx.translate(0, floatBob);
            ctx.fillStyle = '#4a148c'; // Dark purple robe
            ctx.beginPath();
            ctx.moveTo(-16, -5);
            ctx.lineTo(-12, -50);
            ctx.lineTo(12, -50);
            ctx.lineTo(16, -5);
            ctx.closePath();
            ctx.fill();

            // Hood
            ctx.fillStyle = '#311b92';
            ctx.beginPath();
            ctx.arc(0, -56, 14, 0, Math.PI * 2);
            ctx.fill();
            // Glowing occult eyes
            ctx.fillStyle = '#e040fb';
            ctx.fillRect(3, -56, 4, 3);

            // Magic Staff
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(16, -65, 5, 60);
            ctx.fillStyle = '#ea80fc';
            ctx.shadowColor = '#ea80fc';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(18, -68, 8, 0, Math.PI * 2);
            ctx.fill();
        } else if (m.type === 'golem') {
            // Stone Golem
            ctx.fillStyle = '#4e342e';
            // Heavy rocky torso
            ctx.fillRect(-28, -75, 56, 50);
            // Shoulders & Head
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(-35, -82, 70, 16);
            ctx.fillRect(-15, -92, 30, 18);
            // Core cracks glowing
            ctx.fillStyle = '#ff6d00';
            ctx.shadowColor = '#ff6d00';
            ctx.shadowBlur = 8;
            ctx.fillRect(-12, -60, 24, 6);
            ctx.fillRect(-2, -70, 5, 20);
        } else if (m.type === 'dragon') {
            // Ancient Flame Dragon (BOSS)
            const wingFlap = Math.sin(this.animTime * 6) * 0.35;
            ctx.save();
            ctx.shadowColor = '#ff3d00';
            ctx.shadowBlur = 18;

            // Wings
            ctx.save();
            ctx.translate(-20, -70);
            ctx.rotate(-0.2 + wingFlap);
            ctx.fillStyle = '#bf360c';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-80, -70);
            ctx.lineTo(-40, -10);
            ctx.lineTo(-90, 10);
            ctx.lineTo(0, 20);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Massive Body
            ctx.fillStyle = '#b71c1c';
            ctx.beginPath();
            ctx.ellipse(0, -50, 60, 32, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head & Neck
            ctx.beginPath();
            ctx.moveTo(40, -55);
            ctx.lineTo(75, -85);
            ctx.lineTo(105, -70);
            ctx.lineTo(60, -35);
            ctx.closePath();
            ctx.fill();

            // Dragon Horns
            ctx.fillStyle = '#ffd54f';
            ctx.beginPath();
            ctx.moveTo(80, -85);
            ctx.lineTo(95, -115);
            ctx.lineTo(88, -80);
            ctx.fill();

            // Glowing Throat & Eye
            ctx.fillStyle = '#ffea00';
            ctx.shadowBlur = 12;
            ctx.fillRect(85, -75, 6, 6); // Eye
            ctx.fillRect(60, -65, 12, 10); // Glowing fire throat
            ctx.restore();
        }

        ctx.restore();

        // Monster Health Bar
        const barW = m.isBoss ? 120 : 50;
        const barH = m.isBoss ? 8 : 5;
        const barX = mx - barW * 0.5;
        const barY = my - m.height - 18;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

        const hpPct = Math.max(0, m.hp / m.maxHp);
        ctx.fillStyle = m.isBoss ? '#ff1744' : '#e53935';
        ctx.fillRect(barX, barY, barW * hpPct, barH);

        // Monster name / Boss Title
        ctx.font = m.isBoss ? 'bold 14px Montserrat, sans-serif' : '11px Montserrat, sans-serif';
        ctx.fillStyle = m.isBoss ? '#ffd700' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(m.name, mx, barY - 5);
    }

    drawDrops(drops, camX) {
        const ctx = this.ctx;
        for (const d of drops) {
            const dx = d.x - camX;
            if (dx < -20 || dx > this.canvas.width + 20) continue;

            ctx.save();
            ctx.translate(dx, d.y);

            if (d.type === 'coin') {
                // Gold coin
                const spin = Math.sin(this.animTime * 10);
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ff9800';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.ellipse(0, 0, Math.abs(spin) * 7 + 2, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Cyan Gem
                ctx.fillStyle = '#00e5ff';
                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(0, -9);
                ctx.lineTo(7, 0);
                ctx.lineTo(0, 9);
                ctx.lineTo(-7, 0);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    drawProjectiles(projectiles, camX) {
        const ctx = this.ctx;

        for (const p of projectiles) {
            const px = p.x - camX;
            if (px < -100 || px > this.canvas.width + 100) continue;

            ctx.save();
            ctx.translate(px, p.y);

            if (p.type === 'fireball') {
                ctx.shadowColor = '#ff3d00';
                ctx.shadowBlur = 15;
                const fireGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, p.radius);
                fireGrad.addColorStop(0, '#fff9c4');
                fireGrad.addColorStop(0.5, '#ff9800');
                fireGrad.addColorStop(1, '#ff3d00');
                ctx.fillStyle = fireGrad;
                ctx.beginPath();
                ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'vortex') {
                // Swirling Void Vortex
                ctx.rotate(this.animTime * 8);
                ctx.shadowColor = '#e040fb';
                ctx.shadowBlur = 18;
                const vortGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, p.radius);
                vortGrad.addColorStop(0, '#000000');
                vortGrad.addColorStop(0.6, '#7b1fa2');
                vortGrad.addColorStop(1, 'rgba(224, 64, 251, 0)');
                ctx.fillStyle = vortGrad;
                ctx.beginPath();
                ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'dragon_ult') {
                // Giant Astral Dragon Burst!
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 25;

                const grad = ctx.createLinearGradient(0, -p.height * 0.5, 0, p.height * 0.5);
                grad.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
                grad.addColorStop(0.5, 'rgba(255, 87, 34, 0.85)');
                grad.addColorStop(1, 'rgba(213, 0, 0, 0.7)');
                ctx.fillStyle = grad;

                ctx.beginPath();
                ctx.moveTo(80, 0);
                ctx.quadraticCurveTo(0, -90, -120, -50);
                ctx.quadraticCurveTo(-60, 0, -140, 50);
                ctx.quadraticCurveTo(0, 90, 80, 0);
                ctx.fill();

                // Eyes of the Astral Dragon
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(50, -20, 6, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Enemy orbs & breath
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    drawAtmosphere(camX) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        // Floating glowing dust / magical embers
        for (let i = 0; i < 20; i++) {
            const seed = (i * 97 + Math.floor(this.animTime * 30)) % 1000;
            const emberX = (seed * 1.5 - (camX * 0.5)) % w;
            const emberY = 150 + Math.sin(this.animTime * 2 + i) * 150;
            ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
            ctx.fillRect((emberX + w) % w, emberY, 2, 2);
        }
    }
}

window.GameRenderer = GameRenderer;
