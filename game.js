// Game Logic, State Management, Items, Promocodes, and Daily Rewards

const ITEM_TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    HELMET: 'helmet',
    CAPE: 'cape',
    RELIC: 'relic',
    CONSUMABLE: 'consumable'
};

const RARITY = {
    COMMON: { name: 'Oddiy', color: '#9e9e9e', bg: 'rgba(158,158,158,0.15)' },
    RARE: { name: 'Noyob', color: '#2196f3', bg: 'rgba(33,150,243,0.15)' },
    EPIC: { name: 'Epik', color: '#9c27b0', bg: 'rgba(156,39,176,0.15)' },
    LEGENDARY: { name: 'Afsonaviy', color: '#ff9800', bg: 'rgba(255,152,0,0.15)' },
    MYTHIC: { name: 'Mifologik', color: '#e91e63', bg: 'rgba(233,30,99,0.15)' },
    VIP: { name: '👑 VIP IMPERATOR', color: '#ffd700', bg: 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,87,34,0.3))' }
};

// Master Items Database
const ITEMS_DATABASE = {
    // Weapons
    'w_iron_sword': {
        id: 'w_iron_sword',
        name: 'Temir Qilich',
        type: ITEM_TYPES.WEAPON,
        rarity: RARITY.COMMON,
        atk: 25,
        crit: 3,
        price: 200,
        gemPrice: 0,
        desc: 'Sayohatchilarning oddiy, ammo mustahkam temir qilichi.',
        icon: '🗡️'
    },
    'w_golden_blade': {
        id: 'w_golden_blade',
        name: 'Oltin Qilich',
        type: ITEM_TYPES.WEAPON,
        rarity: RARITY.RARE,
        atk: 60,
        crit: 6,
        price: 1500,
        gemPrice: 0,
        desc: 'Zarhallangan, chaqqon zarba beruvchi o\'tkir qilich.',
        icon: '⚔️'
    },
    'w_wind_saber': {
        id: 'w_wind_saber',
        name: 'Shamol Shamshiri',
        type: ITEM_TYPES.WEAPON,
        rarity: RARITY.EPIC,
        atk: 140,
        crit: 12,
        speed: 2,
        price: 8000,
        gemPrice: 50,
        desc: 'Shamol tezligida harakatlanib, dushmanni tilka-pora qiladi.',
        icon: '🌪️'
    },
    'w_flame_spear': {
        id: 'w_flame_spear',
        name: 'Olovli Nayza',
        type: ITEM_TYPES.WEAPON,
        rarity: RARITY.EPIC,
        atk: 220,
        crit: 15,
        magic: 50,
        price: 25000,
        gemPrice: 150,
        desc: 'Olov alangalari bilan yonib turuvchi sehrli nayza.',
        icon: '🔥'
    },
    'w_dragon_slayer': {
        id: 'w_dragon_slayer',
        name: 'Ajdarho Qilichi',
        type: ITEM_TYPES.WEAPON,
        rarity: RARITY.LEGENDARY,
        atk: 650,
        crit: 25,
        magic: 180,
        price: 120000,
        gemPrice: 800,
        desc: 'Qadimgi qizil ajdarho suyagidan yasalgan dahshatli qurol!',
        icon: '🐉'
    },
    'w_diyorbek_doom': {
        id: 'w_diyorbek_doom',
        name: 'Diyorbek Qiyomat Qilichi',
        type: ITEM_TYPES.WEAPON,
        rarity: RARITY.VIP,
        atk: 9999,
        crit: 70,
        magic: 5000,
        price: 99999999,
        gemPrice: 99999,
        desc: '👑 Hukmdor Diyorbekning maxsus yaratilgan qiyomat qilichi! Bitta zarbada dushmanlar tor-mor bo\'ladi!',
        icon: '👑'
    },

    // Armors
    'a_cloth_tunic': {
        id: 'a_cloth_tunic',
        name: 'Sayohatchi Nimchasi',
        type: ITEM_TYPES.ARMOR,
        rarity: RARITY.COMMON,
        def: 15,
        hp: 100,
        price: 150,
        gemPrice: 0,
        desc: 'Yengil charm va matodan tikilgan sayohat kiyimi.',
        icon: '🥋'
    },
    'a_iron_plate': {
        id: 'a_iron_plate',
        name: 'Po\'lat Ritsar Sovuti',
        type: ITEM_TYPES.ARMOR,
        rarity: RARITY.RARE,
        def: 50,
        hp: 350,
        price: 1800,
        gemPrice: 0,
        desc: 'Og\'ir po\'lat sovut, zarbalarni yaxshi qaytaradi.',
        icon: '🛡️'
    },
    'a_dark_knight': {
        id: 'a_dark_knight',
        name: 'Qora Tungi Sovut',
        type: ITEM_TYPES.ARMOR,
        rarity: RARITY.EPIC,
        def: 130,
        hp: 1200,
        price: 15000,
        gemPrice: 80,
        desc: 'Qora ritsarlar kiyimi, dushman hujumini sindiradi.',
        icon: '🖤'
    },
    'a_dragon_plate': {
        id: 'a_dragon_plate',
        name: 'Ajdarho Po\'lat Sovuti',
        type: ITEM_TYPES.ARMOR,
        rarity: RARITY.LEGENDARY,
        def: 450,
        hp: 4500,
        price: 150000,
        gemPrice: 900,
        desc: 'Ajdarho terisidan ishlangan yengilmas olovga chidamli sovut.',
        icon: '🐲'
    },
    'a_diyorbek_emperor': {
        id: 'a_diyorbek_emperor',
        name: 'Diyorbek Imperator VIP Sovuti',
        type: ITEM_TYPES.ARMOR,
        rarity: RARITY.VIP,
        def: 8888,
        hp: 50000,
        price: 99999999,
        gemPrice: 99999,
        desc: '👑 VIP Hukmdor libosi! Egasi hech qachon yengilmaydi va doimiy oltin ziyo bilan porlaydi!',
        icon: '✨'
    },

    // Helmets
    'h_leather_band': {
        id: 'h_leather_band',
        name: 'Charm Bog\'ich',
        type: ITEM_TYPES.HELMET,
        rarity: RARITY.COMMON,
        def: 8,
        hp: 50,
        price: 100,
        gemPrice: 0,
        desc: 'Oddiy jangovar peshana bog\'ichi.',
        icon: '🪖'
    },
    'h_knight_helm': {
        id: 'h_knight_helm',
        name: 'Ritsar Dubulg\'asi',
        type: ITEM_TYPES.HELMET,
        rarity: RARITY.RARE,
        def: 35,
        hp: 200,
        price: 1200,
        gemPrice: 0,
        desc: 'Yuzni himoya qiluvchi ritsar dubulg\'asi.',
        icon: '⛑️'
    },
    'h_dragon_crown': {
        id: 'h_dragon_crown',
        name: 'Ajdarho Toji',
        type: ITEM_TYPES.HELMET,
        rarity: RARITY.LEGENDARY,
        def: 280,
        hp: 2500,
        crit: 10,
        price: 80000,
        gemPrice: 500,
        desc: 'Qadimiy qon bilan sug\'orilgan sehrli ajdarho toji.',
        icon: '👑'
    },
    'h_diyorbek_crown': {
        id: 'h_diyorbek_crown',
        name: 'VIP Imperator Toji',
        type: ITEM_TYPES.HELMET,
        rarity: RARITY.VIP,
        def: 4000,
        hp: 25000,
        crit: 30,
        price: 99999999,
        gemPrice: 99999,
        desc: '👑 Oltin va olmoslar bilan bezatilgan shohona VIP toji.',
        icon: '💎'
    },

    // Capes & Wings
    'c_traveler_cloak': {
        id: 'c_traveler_cloak',
        name: 'Sayohatchi Plashi',
        type: ITEM_TYPES.CAPE,
        rarity: RARITY.COMMON,
        speed: 1,
        hp: 40,
        price: 120,
        gemPrice: 0,
        desc: 'Shamol va yomg\'irdan himoyalovchi plash.',
        icon: '🧣'
    },
    'c_hero_cape': {
        id: 'c_hero_cape',
        name: 'Qizil Qahramon Plashi',
        type: ITEM_TYPES.CAPE,
        rarity: RARITY.RARE,
        atk: 25,
        speed: 1.5,
        price: 2500,
        gemPrice: 0,
        desc: 'Qahramonona yaltirab turuvchi qizil plash.',
        icon: '🦸'
    },
    'c_flame_wings': {
        id: 'c_flame_wings',
        name: 'Olovli Qanotlar',
        type: ITEM_TYPES.CAPE,
        rarity: RARITY.LEGENDARY,
        atk: 200,
        magic: 150,
        speed: 3,
        price: 110000,
        gemPrice: 650,
        desc: 'Egasi orqasida haqiqiy olovli qanotlar namoyon bo\'ladi!',
        icon: '🪽'
    },
    'c_diyorbek_wings': {
        id: 'c_diyorbek_wings',
        name: 'VIP Oltin Astral Qanotlar',
        type: ITEM_TYPES.CAPE,
        rarity: RARITY.VIP,
        atk: 3500,
        magic: 3000,
        speed: 5,
        price: 99999999,
        gemPrice: 99999,
        desc: '👑 Qudratli oltin nur taratuvchi ilohiy qanotlar!',
        icon: '✨'
    },

    // Relics & Amulets
    'r_health_amulet': {
        id: 'r_health_amulet',
        name: 'Shifo Tumori',
        type: ITEM_TYPES.RELIC,
        rarity: RARITY.RARE,
        hp: 500,
        price: 3000,
        gemPrice: 20,
        desc: 'Jangchining salomatligini oshiruvchi tumor.',
        icon: '📿'
    },
    'r_dragon_heart': {
        id: 'r_dragon_heart',
        name: 'Ajdarho Yuragi',
        type: ITEM_TYPES.RELIC,
        rarity: RARITY.LEGENDARY,
        hp: 4000,
        atk: 300,
        magic: 250,
        price: 140000,
        gemPrice: 750,
        desc: 'Hali ham urib turgan ajdarho yuragi qudrati!',
        icon: '❤️‍🔥'
    },
    'r_diyorbek_infinity': {
        id: 'r_diyorbek_infinity',
        name: 'Diyorbek Abadiyat Toshi',
        type: ITEM_TYPES.RELIC,
        rarity: RARITY.VIP,
        hp: 30000,
        atk: 5000,
        magic: 5000,
        crit: 35,
        price: 99999999,
        gemPrice: 99999,
        desc: '👑 Olamning barcha energiyasini jamlagan abadiyat toshi.',
        icon: '💠'
    },

    // Consumables
    'p_hp_potion': {
        id: 'p_hp_potion',
        name: 'Katta Jon Eliksiri',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITY.RARE,
        restoreHp: 1000,
        price: 150,
        gemPrice: 0,
        desc: 'Darhol 1000 HP salomatlikni tiklaydi.',
        icon: '🧪'
    },
    'p_mana_potion': {
        id: 'p_mana_potion',
        name: 'Sehr Eliksiri',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITY.RARE,
        restoreMana: 300,
        price: 150,
        gemPrice: 0,
        desc: 'Darhol 300 Sehr (Mana) tiklaydi.',
        icon: '🔮'
    },
    'p_exp_book': {
        id: 'p_exp_book',
        name: 'Qahramon EXP Kitobi',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITY.EPIC,
        exp: 2500,
        price: 5000,
        gemPrice: 15,
        desc: 'O\'qilganda darhol 2500 Tajriba (EXP) beradi.',
        icon: '📖'
    },
    'p_exp_spirit': {
        id: 'p_exp_spirit',
        name: 'Tajriba Ruhi',
        type: ITEM_TYPES.CONSUMABLE,
        rarity: RARITY.LEGENDARY,
        exp: 15000,
        price: 25000,
        gemPrice: 60,
        desc: 'Ulkan sehrli quvvat: 15,000 Tajriba (EXP)!',
        icon: '🌟'
    }
};

class GameState {
    constructor() {
        this.saveKey = 'dota_2d_save_v1';
        this.initDefaultState();
        this.load();
    }

    initDefaultState() {
        this.player = {
            name: 'Diyorbek',
            level: 1,
            exp: 0,
            maxExp: 100,
            baseHp: 650,
            maxHp: 650,
            hp: 650,
            baseMana: 200,
            maxMana: 200,
            mana: 200,
            baseAtk: 35,
            atk: 35,
            baseDef: 15,
            def: 15,
            critRate: 10, // percent
            critDmg: 1.8,
            speed: 5.5,
            magicPower: 50,
            gold: 1500,
            gems: 50,
            vip: false,
            vipRank: 0,
            usedPromocodes: [],
            dailyDay: 1,
            lastDailyClaim: 0, // timestamp
            statPoints: 0
        };

        this.equipment = {
            weapon: 'w_iron_sword',
            armor: 'a_cloth_tunic',
            helmet: 'h_leather_band',
            cape: 'c_traveler_cloak',
            relic: null
        };

        this.inventory = [
            { itemId: 'w_iron_sword', count: 1 },
            { itemId: 'a_cloth_tunic', count: 1 },
            { itemId: 'h_leather_band', count: 1 },
            { itemId: 'c_traveler_cloak', count: 1 },
            { itemId: 'p_hp_potion', count: 5 },
            { itemId: 'p_mana_potion', count: 3 }
        ];

        this.recalculateStats();
    }

    save() {
        try {
            const data = {
                player: this.player,
                equipment: this.equipment,
                inventory: this.inventory
            };
            localStorage.setItem(this.saveKey, JSON.stringify(data));
        } catch (e) {
            console.error('Save error:', e);
        }
    }

    load() {
        try {
            const raw = localStorage.getItem(this.saveKey);
            if (raw) {
                const data = JSON.parse(raw);
                if (data.player) Object.assign(this.player, data.player);
                if (data.equipment) Object.assign(this.equipment, data.equipment);
                if (data.inventory) this.inventory = data.inventory;
            }
        } catch (e) {
            console.error('Load error:', e);
        }
        this.recalculateStats();
    }

    reset() {
        localStorage.removeItem(this.saveKey);
        this.initDefaultState();
        this.recalculateStats();
    }

    recalculateStats() {
        const p = this.player;

        // Base stats calculation from Level
        const lvl = p.level;
        p.maxExp = Math.floor(100 * Math.pow(1.15, lvl - 1));
        
        let calcHp = 600 + (lvl * 150);
        let calcMana = 200 + (lvl * 35);
        let calcAtk = 30 + (lvl * 18);
        let calcDef = 12 + (lvl * 10);
        let calcMagic = 40 + (lvl * 15);
        let calcCrit = 10;
        let calcSpeed = 5.5;

        // Add equipment stats
        for (const slot in this.equipment) {
            const itemId = this.equipment[slot];
            if (itemId && ITEMS_DATABASE[itemId]) {
                const it = ITEMS_DATABASE[itemId];
                if (it.atk) calcAtk += it.atk;
                if (it.def) calcDef += it.def;
                if (it.hp) calcHp += it.hp;
                if (it.crit) calcCrit += it.crit;
                if (it.speed) calcSpeed += it.speed;
                if (it.magic) calcMagic += it.magic;
            }
        }

        // VIP bonuses
        if (p.vip) {
            calcHp = Math.floor(calcHp * 1.5) + 15000;
            calcAtk = Math.floor(calcAtk * 1.5) + 3000;
            calcDef = Math.floor(calcDef * 1.5) + 2000;
            calcMagic = Math.floor(calcMagic * 1.5) + 2500;
            calcCrit += 25;
            calcSpeed += 1.5;
        }

        p.maxHp = calcHp;
        p.maxMana = calcMana;
        p.atk = calcAtk;
        p.def = calcDef;
        p.magicPower = calcMagic;
        p.critRate = Math.min(95, calcCrit);
        p.speed = Math.min(12, calcSpeed);

        if (p.hp > p.maxHp) p.hp = p.maxHp;
        if (p.mana > p.maxMana) p.mana = p.maxMana;
    }

    addExp(amount) {
        this.player.exp += amount;
        let leveledUp = false;
        while (this.player.exp >= this.player.maxExp) {
            this.player.exp -= this.player.maxExp;
            this.player.level++;
            leveledUp = true;
        }
        if (leveledUp) {
            this.recalculateStats();
            this.player.hp = this.player.maxHp;
            this.player.mana = this.player.maxMana;
            if (window.sounds) window.sounds.playLevelUp();
            this.save();
        }
        return leveledUp;
    }

    levelUpManual() {
        this.player.level++;
        this.recalculateStats();
        this.player.hp = this.player.maxHp;
        this.player.mana = this.player.maxMana;
        if (window.sounds) window.sounds.playLevelUp();
        this.save();
    }

    addItem(itemId, count = 1) {
        if (!ITEMS_DATABASE[itemId]) return;
        const existing = this.inventory.find(i => i.itemId === itemId);
        if (existing) {
            existing.count += count;
        } else {
            this.inventory.push({ itemId, count });
        }
        this.save();
    }

    removeItem(itemId, count = 1) {
        const idx = this.inventory.findIndex(i => i.itemId === itemId);
        if (idx !== -1) {
            this.inventory[idx].count -= count;
            if (this.inventory[idx].count <= 0) {
                this.inventory.splice(idx, 1);
            }
            this.save();
            return true;
        }
        return false;
    }

    equipItem(itemId) {
        const item = ITEMS_DATABASE[itemId];
        if (!item) return false;

        const slot = item.type;
        if (this.equipment.hasOwnProperty(slot)) {
            this.equipment[slot] = itemId;
            this.recalculateStats();
            this.save();
            return true;
        }
        return false;
    }

    unequipItem(slot) {
        if (this.equipment.hasOwnProperty(slot) && this.equipment[slot]) {
            this.equipment[slot] = null;
            this.recalculateStats();
            this.save();
            return true;
        }
        return false;
    }

    useConsumable(itemId) {
        const item = ITEMS_DATABASE[itemId];
        if (!item || item.type !== ITEM_TYPES.CONSUMABLE) return false;

        const hasItem = this.inventory.find(i => i.itemId === itemId && i.count > 0);
        if (!hasItem) return false;

        let used = false;
        if (item.restoreHp) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + item.restoreHp);
            used = true;
        }
        if (item.restoreMana) {
            this.player.mana = Math.min(this.player.maxMana, this.player.mana + item.restoreMana);
            used = true;
        }
        if (item.exp) {
            this.addExp(item.exp);
            used = true;
        }

        if (used) {
            this.removeItem(itemId, 1);
            return true;
        }
        return false;
    }

    buyItem(itemId) {
        const item = ITEMS_DATABASE[itemId];
        if (!item) return { success: false, msg: 'Buyum topilmadi!' };

        if (item.price > 0 && this.player.gold < item.price) {
            return { success: false, msg: 'Oltin yetarli emas!' };
        }
        if (item.gemPrice > 0 && this.player.gems < item.gemPrice) {
            return { success: false, msg: 'Olmos yetarli emas!' };
        }

        // Deduct
        this.player.gold -= item.price;
        this.player.gems -= item.gemPrice;

        this.addItem(itemId, 1);
        if (window.sounds) window.sounds.playCoin();
        this.save();

        return { success: true, msg: `${item.name} muvaffaqiyatli sotib olindi!` };
    }

    // Promocode handler
    redeemPromocode(code) {
        const cleanCode = (code || '').trim().toUpperCase();
        if (!cleanCode) {
            return { success: false, msg: 'Iltimos, promokodni kiriting!' };
        }

        if (cleanCode === 'DIYORBEK') {
            // Promocode DIYORBEK: +100 Level, VIP Status, 999,999,999 Gold, 99,999 Gems, All VIP Divine sets!
            this.player.level += 100;
            this.player.vip = true;
            this.player.vipRank = 99;
            this.player.gold = 999999999;
            this.player.gems = 999999;

            // Add VIP God Items
            this.addItem('w_diyorbek_doom', 1);
            this.addItem('a_diyorbek_emperor', 1);
            this.addItem('h_diyorbek_crown', 1);
            this.addItem('c_diyorbek_wings', 1);
            this.addItem('r_diyorbek_infinity', 1);
            this.addItem('p_hp_potion', 99);
            this.addItem('p_mana_potion', 99);
            this.addItem('p_exp_spirit', 50);

            // Auto equip VIP gear
            this.equipItem('w_diyorbek_doom');
            this.equipItem('a_diyorbek_emperor');
            this.equipItem('h_diyorbek_crown');
            this.equipItem('c_diyorbek_wings');
            this.equipItem('r_diyorbek_infinity');

            this.recalculateStats();
            this.player.hp = this.player.maxHp;
            this.player.mana = this.player.maxMana;

            if (window.sounds) window.sounds.playVipFanfare();
            this.save();

            return {
                success: true,
                vip: true,
                msg: `👑 QOYILMAQOM! 'DIYORBEK' PROMOKODI ISHLADI!\n\n` +
                     `✨ DARAJA: +100 GA KO'TARILDI!\n` +
                     `💰 PULINGIZ: VIP 999,999,999 OLTIN (CHEKSIZ BOYLIK)!\n` +
                     `💎 OLMOS: 999,999 OLMOS!\n` +
                     `🛡️ DIYORBEK IMPERATOR VIP SOVUTI & QIYOMAT QILICHI KIYILDI!\n` +
                     `👑 VIP HUKMDOR STATUSI FAOLLASHTIRILDI!`
            };
        } else if (cleanCode === 'AJDARHO') {
            // Promocode AJDARHO: +100 Level, Dragon gear, 500k gold, 20k gems
            this.player.level += 100;
            this.player.gold += 500000;
            this.player.gems += 20000;

            this.addItem('w_dragon_slayer', 1);
            this.addItem('a_dragon_plate', 1);
            this.addItem('h_dragon_crown', 1);
            this.addItem('c_flame_wings', 1);
            this.addItem('r_dragon_heart', 1);
            this.addItem('p_hp_potion', 50);
            this.addItem('p_mana_potion', 50);
            this.addItem('p_exp_spirit', 25);

            // Auto equip dragon gear
            this.equipItem('w_dragon_slayer');
            this.equipItem('a_dragon_plate');
            this.equipItem('h_dragon_crown');
            this.equipItem('c_flame_wings');
            this.equipItem('r_dragon_heart');

            this.recalculateStats();
            this.player.hp = this.player.maxHp;
            this.player.mana = this.player.maxMana;

            if (window.sounds) window.sounds.playDragonUlt();
            this.save();

            return {
                success: true,
                msg: `🐉 DAHSHATLI AJDARHO QUDARTI!\n\n` +
                     `🔥 DARAJA: +100 GA OSHIRILDI!\n` +
                     `💰 OLTIN: +500,000 OLTIN!\n` +
                     `💎 OLMOS: +20,000 OLMOS!\n` +
                     `🗡️ AFSONAVIY AJDARHO QILICHI VA OLOVLI SOVUTLAR KIYILDI!`
            };
        } else {
            return {
                success: false,
                msg: `❌ Noto'g'ri promokod! 'DIYORBEK' yoki 'AJDARHO' kodlarini sinab ko'ring.`
            };
        }
    }

    // Daily rewards system (1 kunda 1 marta beriladigan sovg'alar)
    getDailyRewardInfo() {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const lastClaim = this.player.lastDailyClaim || 0;
        const timePassed = now - lastClaim;
        const canClaim = timePassed >= oneDayMs || lastClaim === 0;

        const streak = this.player.dailyDay || 1;
        const remainingMs = Math.max(0, oneDayMs - timePassed);

        return {
            canClaim,
            streak,
            remainingMs,
            rewardsList: [
                { day: 1, gold: 5000, gems: 100, item: 'p_hp_potion', count: 5, label: '5,000 Oltin + 100 Olmos + 5x Shifo' },
                { day: 2, gold: 12000, gems: 250, item: 'w_golden_blade', count: 1, label: '12,000 Oltin + 250 Olmos + Oltin Qilich' },
                { day: 3, gold: 25000, gems: 500, item: 'a_iron_plate', count: 1, label: '25,000 Oltin + 500 Olmos + Po\'lat Sovut' },
                { day: 4, gold: 50000, gems: 1000, item: 'w_wind_saber', count: 1, label: '50,000 Oltin + 1,000 Olmos + Shamol Shamshiri' },
                { day: 5, gold: 100000, gems: 2000, item: 'a_dark_knight', count: 1, label: '100,000 Oltin + 2,000 Olmos + Qora Sovut' },
                { day: 6, gold: 200000, gems: 3500, item: 'c_flame_wings', count: 1, label: '200,000 Oltin + 3,500 Olmos + Olovli Qanotlar' },
                { day: 7, gold: 500000, gems: 10000, item: 'w_dragon_slayer', count: 1, label: '500,000 Oltin + 10,000 Olmos + AFSONAVIY AJDARHO QILICHI!' }
            ]
        };
    }

    claimDailyReward() {
        const info = this.getDailyRewardInfo();
        if (!info.canClaim) {
            const hours = Math.floor(info.remainingMs / (1000 * 60 * 60));
            const mins = Math.floor((info.remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            return {
                success: false,
                msg: `Bugungi sovg'a olingan! Keyingi sovg'a ${hours} soat ${mins} daqiqadan keyin ochiladi.`
            };
        }

        const currentDayIndex = ((info.streak - 1) % 7);
        const reward = info.rewardsList[currentDayIndex];

        this.player.gold += reward.gold;
        this.player.gems += reward.gems;
        if (reward.item) {
            this.addItem(reward.item, reward.count || 1);
        }

        this.player.lastDailyClaim = Date.now();
        this.player.dailyDay = (info.streak % 7) + 1;

        if (window.sounds) window.sounds.playCoin();
        this.save();

        return {
            success: true,
            msg: `🎉 ${currentDayIndex + 1}-KUN SOVG'ASI QABUL QILINDI!\n\n` +
                 `💰 +${reward.gold.toLocaleString()} Oltin\n` +
                 `💎 +${reward.gems.toLocaleString()} Olmos\n` +
                 `🎁 Sovg'a: ${reward.label}`
        };
    }
}

window.gameState = new GameState();

