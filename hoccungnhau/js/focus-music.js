/* ==========================================================================
   HỌC CÙNG NHAU - FOCUS MUSIC & AMBIENT LOFI SOUND ENGINE
   ========================================================================== */

const FocusMusicService = {
    audioCtx: null,
    isPlaying: false,
    mode: 'lofi', // 'lofi', 'piano', 'rain', 'custom'
    masterGain: null,
    customAudio: null,

    init: function() {
        this.bindWidget();
    },

    bindWidget: function() {
        const btn = document.getElementById('focus-music-toggle-btn');
        const popover = document.getElementById('focus-music-popover');
        const playBtn = document.getElementById('fm-play-btn');
        const modeSelect = document.getElementById('fm-mode-select');
        const volSlider = document.getElementById('fm-volume-slider');
        const customGroup = document.getElementById('fm-custom-group');
        const fileInput = document.getElementById('fm-file-input');
        const urlInput = document.getElementById('fm-url-input');

        if (btn && popover) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                popover.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!popover.contains(e.target) && e.target !== btn) {
                    popover.classList.remove('active');
                }
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.togglePlay();
            });
        }

        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                this.mode = e.target.value;
                if (customGroup) {
                    customGroup.style.display = (this.mode === 'custom') ? 'block' : 'none';
                }
                if (this.isPlaying) {
                    this.stopSound();
                    this.playSound();
                }
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const audioUrl = URL.createObjectURL(file);
                    this.setCustomAudioSource(audioUrl);
                }
            });
        }

        if (urlInput) {
            urlInput.addEventListener('change', (e) => {
                const url = e.target.value.trim();
                if (url) {
                    this.setCustomAudioSource(url);
                }
            });
        }

        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                const vol = parseFloat(e.target.value);
                if (this.masterGain && this.audioCtx) {
                    this.masterGain.gain.setTargetAtTime(vol, this.audioCtx.currentTime, 0.05);
                }
                if (this.customAudio) {
                    this.customAudio.volume = vol;
                }
            });
        }
    },

    setCustomAudioSource: function(src) {
        if (this.customAudio) {
            this.customAudio.pause();
            this.customAudio = null;
        }
        this.customAudio = new Audio(src);
        this.customAudio.loop = true;
        const volSlider = document.getElementById('fm-volume-slider');
        if (volSlider) {
            this.customAudio.volume = parseFloat(volSlider.value);
        }
        if (this.isPlaying && this.mode === 'custom') {
            this.customAudio.play().catch(() => {});
        }
    },

    initAudioContext: function() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
                this.masterGain = this.audioCtx.createGain();
                this.masterGain.gain.value = 0.3;
                this.masterGain.connect(this.audioCtx.destination);
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    togglePlay: function() {
        if (this.isPlaying) {
            this.stopSound();
            this.updateUI(false);
        } else {
            this.initAudioContext();
            this.playSound();
            this.updateUI(true);
        }
    },

    updateUI: function(playing) {
        this.isPlaying = playing;
        const playBtn = document.getElementById('fm-play-btn');
        const badge = document.getElementById('fm-status-badge');
        if (playBtn) {
            playBtn.textContent = playing ? '⏸️ Tạm Dừng' : '▶️ Bật Nhạc';
        }
        if (badge) {
            badge.textContent = playing ? '🟢 Đang Phát' : '⚪ Đang Tắt';
            badge.style.color = playing ? 'var(--accent-cyan)' : 'var(--text-muted)';
        }
    },

    playSound: function() {
        if (this.mode === 'custom') {
            if (!this.customAudio) {
                const urlInput = document.getElementById('fm-url-input');
                if (urlInput && urlInput.value.trim()) {
                    this.setCustomAudioSource(urlInput.value.trim());
                } else {
                    alert('⚠️ Vui lòng chọn tệp MP3 hoặc dán đường dẫn link nhạc!');
                    this.updateUI(false);
                    return;
                }
            }
            if (this.customAudio) {
                this.customAudio.play().catch(err => {
                    alert('❌ Không thể phát file nhạc. Vui lòng kiểm tra định dạng tệp hoặc link URL!');
                    this.updateUI(false);
                });
            }
            return;
        }

        if (!this.audioCtx) return;

        if (this.mode === 'rain') {
            this.playRainNoise();
        } else if (this.mode === 'piano') {
            this.playAmbientChords([261.63, 329.63, 392.00, 493.88]); // Cmaj7
        } else {
            this.playAmbientChords([220.00, 261.63, 329.63, 392.00]); // Am7 Lofi
        }
    },

    playRainNoise: function() {
        const bufferSize = 2 * this.audioCtx.sampleRate;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        whiteNoise.connect(filter);
        filter.connect(this.masterGain);
        whiteNoise.start();
        this.activeNoiseNode = whiteNoise;
    },

    playAmbientChords: function(freqs) {
        this.activeOscs = [];
        freqs.forEach(freq => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.value = 0.08;

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start();
            this.activeOscs.push(osc);
        });
    },

    stopSound: function() {
        if (this.customAudio) {
            try { this.customAudio.pause(); } catch(e) {}
        }
        if (this.activeNoiseNode) {
            try { this.activeNoiseNode.stop(); } catch(e) {}
            this.activeNoiseNode = null;
        }
        if (this.activeOscs) {
            this.activeOscs.forEach(osc => {
                try { osc.stop(); } catch(e) {}
            });
            this.activeOscs = [];
        }
        this.isPlaying = false;
    },

    playVictorySound: function() {
        try {
            this.initAudioContext();
            if (!this.audioCtx) return;
            const now = this.audioCtx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.35);
            });
        } catch(e) {}
    }
};

document.addEventListener("DOMContentLoaded", () => FocusMusicService.init());
