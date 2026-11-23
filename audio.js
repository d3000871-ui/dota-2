// Authentic 8-Bit NES / Super Mario Audio Synthesizer via Web Audio API
// Runs 100% offline without external audio files!

class MarioAudio {
    constructor() {
        this.ctx = null;
        this.musicPlaying = false;
        this.muted = false;
        this.bgmTimer = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted && this.musicPlaying) {
            this.stopBGM();
        }
        return this.muted;
    }

    playTone(freq, duration, type = 'square', startDelay = 0, vol = 0.25) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = this.ctx.currentTime + startDelay;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
    }

    playJump(isSuper = false) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime;

        osc.type = 'square';
        if (isSuper) {
            osc.frequency.setValueAtTime(160, t);
            osc.frequency.exponentialRampToValueAtTime(620, t + 0.18);
        } else {
            osc.frequency.setValueAtTime(140, t);
            osc.frequency.exponentialRampToValueAtTime(460, t + 0.14);
        }

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.18);
    }

    playCoin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        this.playTone(987.77, 0.08, 'square', 0, 0.35); // B5
        this.playTone(1318.51, 0.35, 'square', 0.08, 0.35); // E6
    }

    playStomp() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.14);
    }

    playBlockBump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.12);
    }

    playBrickBreak() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const bufferSize = this.ctx.sampleRate * 0.18;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.18);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    playPowerupSprout() {
        if (this.muted) return;
        const notes = [330, 392, 659, 523, 587, 784];
        notes.forEach((f, idx) => {
            this.playTone(f, 0.06, 'triangle', idx * 0.05, 0.3);
        });
    }

    playPowerup() {
        if (this.muted) return;
        const notes = [330, 392, 659, 523, 587, 784, 880, 1046];
        notes.forEach((f, idx) => {
            this.playTone(f, 0.07, 'square', idx * 0.05, 0.3);
        });
    }

    playPipe() {
        if (this.muted) return;
        const notes = [400, 350, 300, 250, 200];
        notes.forEach((f, idx) => {
            this.playTone(f, 0.08, 'triangle', idx * 0.07, 0.35);
        });
    }

    playFireball() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.09);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.1);
    }

    playFlagpole() {
        if (this.muted) return;
        const notes = [587, 659, 698, 784, 880, 987, 1046, 1174];
        notes.forEach((f, idx) => {
            this.playTone(f, 0.1, 'triangle', idx * 0.08, 0.35);
        });
    }

    playStageClear() {
        if (this.muted) return;
        const melody = [
            { f: 523, d: 0.12, s: 0 },
            { f: 659, d: 0.12, s: 0.14 },
            { f: 784, d: 0.12, s: 0.28 },
            { f: 1046, d: 0.22, s: 0.42 },
            { f: 880, d: 0.14, s: 0.68 },
            { f: 1046, d: 0.45, s: 0.85 }
        ];
        melody.forEach(n => {
            this.playTone(n.f, n.d, 'square', n.s, 0.35);
        });
    }

    playGameOver() {
        if (this.muted) return;
        const notes = [
            { f: 523, s: 0 },
            { f: 392, s: 0.25 },
            { f: 330, s: 0.5 },
            { f: 440, s: 0.75 },
            { f: 494, s: 1.0 },
            { f: 440, s: 1.25 },
            { f: 415, s: 1.5 },
            { f: 440, s: 1.75 },
            { f: 392, s: 2.1 }
        ];
        notes.forEach(n => {
            this.playTone(n.f, 0.22, 'triangle', n.s, 0.35);
        });
    }

    // Classic Mario BGM Loop
    startBGM() {
        if (this.musicPlaying || this.muted) return;
        this.musicPlaying = true;
        this.loopBGM();
    }

    stopBGM() {
        this.musicPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    loopBGM() {
        if (!this.musicPlaying || this.muted) return;
        this.init();

        // Mario theme intro motif
        const notes = [
            { f: 659.25, d: 0.1, t: 0 },     // E5
            { f: 659.25, d: 0.1, t: 0.15 },  // E5
            { f: 659.25, d: 0.1, t: 0.35 },  // E5
            { f: 523.25, d: 0.1, t: 0.5 },   // C5
            { f: 659.25, d: 0.12, t: 0.65 }, // E5
            { f: 783.99, d: 0.2, t: 0.85 },  // G5
            { f: 392.00, d: 0.25, t: 1.2 },  // G4

            { f: 523.25, d: 0.15, t: 1.6 },  // C5
            { f: 392.00, d: 0.15, t: 1.9 },  // G4
            { f: 329.63, d: 0.15, t: 2.2 },  // E4
            { f: 440.00, d: 0.15, t: 2.5 },  // A4
            { f: 493.88, d: 0.15, t: 2.75 }, // B4
            { f: 466.16, d: 0.12, t: 3.0 },  // Bb4
            { f: 440.00, d: 0.18, t: 3.25 }, // A4

            { f: 392.00, d: 0.12, t: 3.55 }, // G4
            { f: 659.25, d: 0.15, t: 3.75 }, // E5
            { f: 783.99, d: 0.15, t: 3.95 }, // G5
            { f: 880.00, d: 0.18, t: 4.15 }, // A5
            { f: 698.46, d: 0.12, t: 4.45 }, // F5
            { f: 783.99, d: 0.15, t: 4.65 }, // G5
            { f: 659.25, d: 0.18, t: 4.95 }  // E5
        ];

        notes.forEach(n => {
            this.playTone(n.f, n.d, 'square', n.t, 0.12);
        });

        this.bgmTimer = setTimeout(() => {
            if (this.musicPlaying) this.loopBGM();
        }, 5400);
    }
}

window.marioAudio = new MarioAudio();
