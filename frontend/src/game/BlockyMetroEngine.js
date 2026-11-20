// Complete 3D Open-World Game Engine (Three.js) — Preserves 100% of City, Interiors, Elevators,
// Topmost Helipads, Sky-Hawk Helicopter, Operational Vehicles, 7F Arcade, Rooftop Football,
// Metro Royal 9F Swimming Pool, Day/Night Cycle, Streetlights, Name Tags & Real-Time Multiplayer.
export function initializeBlockyMetroEngine() {
  if (window.__blockyMetroInitialized) return;
  window.__blockyMetroInitialized = true;

      // ==========================================
      // 1. SYNTHESIZED SOUND ENGINE (Web Audio API)
      // ==========================================
      const SoundFX = {
        ctx: null,
        enabled: true,
        masterVolume: 0.75,
        masterGain: null,
        limiter: null,
        contextFilter: null,
        sfxBus: null,
        ambienceBus: null,
        whiteNoiseBuf: null,
        pinkNoiseBuf: null,
        activeVoices: 0,
        MAX_VOICES: 16,
        ambienceStarted: false,
        windGain: null,
        windFilter: null,
        cityHumGain: null,
        fountainGain: null,
        fountainPanner: null,
        playerEngineOsc: null,
        playerEngineSub: null,
        playerEngineFilter: null,
        playerEngineGain: null,
        aiEngineOsc: null,
        aiEngineFilter: null,
        aiEngineGain: null,
        aiEnginePanner: null,
        activeSirenOsc: null,
        activeSirenGain: null,
        activeSirenPanner: null,
        activeSirenType: null,
        _camDir: new THREE.Vector3(),

        _rand(spread = 0.08) {
          return 1 + (Math.random() * 2 - 1) * spread;
        },

        _claimVoice(durationSec = 0.25) {
          if (this.activeVoices >= this.MAX_VOICES) return false;
          this.activeVoices++;
          setTimeout(() => {
            this.activeVoices = Math.max(0, this.activeVoices - 1);
          }, Math.max(60, Math.ceil(durationSec * 1000) + 40));
          return true;
        },

        _buildNoiseBuffers() {
          if (!this.ctx || this.whiteNoiseBuf) return;
          const sr = this.ctx.sampleRate;
          // 2-second white noise buffer
          const wLen = Math.floor(sr * 2.0);
          const wBuf = this.ctx.createBuffer(1, wLen, sr);
          const wData = wBuf.getChannelData(0);
          for (let i = 0; i < wLen; i++) wData[i] = Math.random() * 2 - 1;
          this.whiteNoiseBuf = wBuf;

          // 3-second Paul Kellet pink noise buffer (warm, non-fatiguing ambience)
          const pLen = Math.floor(sr * 3.0);
          const pBuf = this.ctx.createBuffer(1, pLen, sr);
          const pData = pBuf.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < pLen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            pData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
            b6 = white * 0.115926;
          }
          this.pinkNoiseBuf = pBuf;
        },

        init() {
          if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
              this.ctx = new AudioCtx();
              this.masterGain = this.ctx.createGain();
              this.masterGain.gain.value = this.enabled ? this.masterVolume : 0.0;

              this.limiter = this.ctx.createDynamicsCompressor();
              this.limiter.threshold.value = -10;
              this.limiter.knee.value = 12;
              this.limiter.ratio.value = 12;
              this.limiter.attack.value = 0.003;
              this.limiter.release.value = 0.14;

              this.contextFilter = this.ctx.createBiquadFilter();
              this.contextFilter.type = 'lowpass';
              this.contextFilter.frequency.value = 18000;
              this.contextFilter.Q.value = 0.65;

              this.sfxBus = this.ctx.createGain();
              this.sfxBus.gain.value = 0.92;

              this.ambienceBus = this.ctx.createGain();
              this.ambienceBus.gain.value = 0.65;

              this.sfxBus.connect(this.contextFilter);
              this.ambienceBus.connect(this.contextFilter);
              this.contextFilter.connect(this.limiter);
              this.limiter.connect(this.masterGain);
              this.masterGain.connect(this.ctx.destination);

              this._buildNoiseBuffers();
              this._initAmbienceBeds();
            }
          }
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
          this.applyMasterGain();
        },

        applyMasterGain() {
          if (!this.ctx || !this.masterGain) return;
          const target = this.enabled ? this.masterVolume : 0.0;
          this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.03);
        },

        setMasterVolume(vol01) {
          this.masterVolume = Math.max(0, Math.min(1, vol01));
          this.applyMasterGain();
        },

        setMuted(isMuted) {
          this.enabled = !isMuted;
          if (!this.enabled) this.stopContinuousSiren();
          this.applyMasterGain();
        },

        _initAmbienceBeds() {
          if (!this.ctx || this.ambienceStarted || !this.pinkNoiseBuf) return;
          this.ambienceStarted = true;
          try {
            // Layer 1: Seamless soft wind bed (bandpass pink noise)
            const windSrc = this.ctx.createBufferSource();
            windSrc.buffer = this.pinkNoiseBuf;
            windSrc.loop = true;
            this.windFilter = this.ctx.createBiquadFilter();
            this.windFilter.type = 'bandpass';
            this.windFilter.frequency.value = 340;
            this.windFilter.Q.value = 0.7;
            this.windGain = this.ctx.createGain();
            this.windGain.gain.value = 0.045;
            windSrc.connect(this.windFilter);
            this.windFilter.connect(this.windGain);
            this.windGain.connect(this.ambienceBus);
            windSrc.start();

            // Layer 2: Distant low city air bed
            const humSrc = this.ctx.createBufferSource();
            humSrc.buffer = this.pinkNoiseBuf;
            humSrc.loop = true;
            const humFilter = this.ctx.createBiquadFilter();
            humFilter.type = 'lowpass';
            humFilter.frequency.value = 145;
            this.cityHumGain = this.ctx.createGain();
            this.cityHumGain.gain.value = 0.055;
            humSrc.connect(humFilter);
            humFilter.connect(this.cityHumGain);
            this.cityHumGain.connect(this.ambienceBus);
            humSrc.start();

            // Layer 3: 3D Positional Central Plaza Fountain Water Shimmer (0, 1.8, 0)
            const fSrc = this.ctx.createBufferSource();
            fSrc.buffer = this.whiteNoiseBuf;
            fSrc.loop = true;
            const fFilter = this.ctx.createBiquadFilter();
            fFilter.type = 'bandpass';
            fFilter.frequency.value = 1450;
            fFilter.Q.value = 0.85;
            this.fountainGain = this.ctx.createGain();
            this.fountainGain.gain.value = 0.055;
            this.fountainPanner = this._makePanner(0, 1.8, 0, 4.5, 42, 1.45);
            fSrc.connect(fFilter);
            fFilter.connect(this.fountainGain);
            if (this.fountainPanner) {
              this.fountainGain.connect(this.fountainPanner);
              this.fountainPanner.connect(this.ambienceBus);
            } else {
              this.fountainGain.connect(this.ambienceBus);
            }
            fSrc.start();
          } catch (e) {}
        },

        _makePanner(x, y, z, refDist = 6, maxDist = 110, rolloff = 1.15) {
          if (!this.ctx || !this.ctx.createPanner) return null;
          try {
            const p = this.ctx.createPanner();
            p.panningModel = 'HRTF';
            p.distanceModel = 'inverse';
            p.refDistance = refDist;
            p.maxDistance = maxDist;
            p.rolloffFactor = rolloff;
            this._setPannerPos(p, x, y, z);
            return p;
          } catch (e) {
            return null;
          }
        },

        _setPannerPos(panner, x, y, z) {
          if (!panner || !this.ctx) return;
          const now = this.ctx.currentTime;
          if (panner.positionX) {
            panner.positionX.setTargetAtTime(x, now, 0.02);
            panner.positionY.setTargetAtTime(y, now, 0.02);
            panner.positionZ.setTargetAtTime(z, now, 0.02);
          } else if (panner.setPosition) {
            panner.setPosition(x, y, z);
          }
        },

        _destNode(wx, wy, wz, refDist = 6, maxDist = 110) {
          if (!this.ctx) return null;
          if (typeof wx === 'number' && typeof wy === 'number' && typeof wz === 'number') {
            const p = this._makePanner(wx, wy, wz, refDist, maxDist, 1.2);
            if (p) {
              p.connect(this.sfxBus);
              return p;
            }
          }
          return this.sfxBus || this.ctx.destination;
        },

        updateListener(cam) {
          if (!this.ctx || !cam || this.ctx.state !== 'running') return;
          const l = this.ctx.listener;
          if (!l) return;
          const now = this.ctx.currentTime;
          const px = cam.position.x, py = cam.position.y, pz = cam.position.z;
          cam.getWorldDirection(this._camDir);
          const fx = this._camDir.x, fy = this._camDir.y, fz = this._camDir.z;
          const ux = cam.up.x, uy = cam.up.y, uz = cam.up.z;
          try {
            if (l.positionX) {
              l.positionX.setTargetAtTime(px, now, 0.015);
              l.positionY.setTargetAtTime(py, now, 0.015);
              l.positionZ.setTargetAtTime(pz, now, 0.015);
              l.forwardX.setTargetAtTime(fx, now, 0.015);
              l.forwardY.setTargetAtTime(fy, now, 0.015);
              l.forwardZ.setTargetAtTime(fz, now, 0.015);
              l.upX.setTargetAtTime(ux, now, 0.015);
              l.upY.setTargetAtTime(uy, now, 0.015);
              l.upZ.setTargetAtTime(uz, now, 0.015);
            } else if (l.setPosition) {
              l.setPosition(px, py, pz);
              if (l.setOrientation) l.setOrientation(fx, fy, fz, ux, uy, uz);
            }
          } catch (e) {}
        },

        updateAmbience(speed, altitude, isIndoors, isSwimming, isNight) {
          if (!this.ctx || !this.ambienceStarted || this.ctx.state !== 'running') return;
          const now = this.ctx.currentTime;
          const spdNorm = Math.min(1, Math.abs(speed) / 36);
          const altNorm = Math.min(1, Math.max(0, altitude - 4) / 55);
          const targetWindGain = isIndoors ? 0.012 : (0.032 + spdNorm * 0.075 + altNorm * 0.065);
          const targetWindFreq = isIndoors ? 220 : (300 + spdNorm * 580 + altNorm * 420);
          if (this.windGain) this.windGain.gain.setTargetAtTime(targetWindGain, now, 0.12);
          if (this.windFilter) this.windFilter.frequency.setTargetAtTime(targetWindFreq, now, 0.12);
          if (this.cityHumGain) {
            const humTarget = isIndoors ? 0.02 : (isNight ? 0.032 : 0.052);
            this.cityHumGain.gain.setTargetAtTime(humTarget, now, 0.25);
          }
          if (this.contextFilter) {
            const cutoff = isSwimming ? 620 : (isIndoors ? 2400 : 18000);
            this.contextFilter.frequency.setTargetAtTime(cutoff, now, 0.09);
          }
        },

        _makeDriveCurve(amount = 14) {
          const n = 256;
          const curve = new Float32Array(n);
          for (let i = 0; i < n; i++) {
            const x = (i * 2) / n - 1;
            curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
          }
          return curve;
        },

        updatePlayerEngine(active, speed, isBuggy = false, isTurbo = false, throttle = 0, surface = 'asphalt') {
          if (!this.ctx || this.ctx.state !== 'running') return;
          const now = this.ctx.currentTime;
          if (!active || !this.enabled) {
            if (this.playerEngineGain) this.playerEngineGain.gain.setTargetAtTime(0.0001, now, 0.09);
            if (this.playerRoadGain) this.playerRoadGain.gain.setTargetAtTime(0.0001, now, 0.09);
            return;
          }
          if (!this.playerEngineOsc) {
            try {
              // Layer 1 & 2: Sub-bass rumble + Wave-shaped mid combustion harmonic
              const sub = this.ctx.createOscillator();
              const mid = this.ctx.createOscillator();
              const shaper = this.ctx.createWaveShaper();
              shaper.curve = this._makeDriveCurve(12);
              shaper.oversample = '2x';
              const subGain = this.ctx.createGain();
              const midGain = this.ctx.createGain();
              const filt = this.ctx.createBiquadFilter();
              const masterEngGain = this.ctx.createGain();

              sub.type = 'triangle';
              mid.type = 'sawtooth';
              subGain.gain.value = 0.72;
              midGain.gain.value = 0.48;
              filt.type = 'lowpass';
              filt.frequency.value = 210;
              filt.Q.value = 1.4;
              masterEngGain.gain.value = 0.0001;

              sub.connect(subGain);
              mid.connect(shaper);
              shaper.connect(midGain);
              subGain.connect(filt);
              midGain.connect(filt);
              filt.connect(masterEngGain);
              masterEngGain.connect(this.sfxBus);
              sub.start();
              mid.start();

              this.playerEngineSub = sub;
              this.playerEngineOsc = mid;
              this.playerEngineFilter = filt;
              this.playerEngineGain = masterEngGain;

              // Layer 3: Speed-scaled Tire / Road Friction bed (filtered pink noise)
              if (this.pinkNoiseBuf) {
                const roadSrc = this.ctx.createBufferSource();
                roadSrc.buffer = this.pinkNoiseBuf;
                roadSrc.loop = true;
                const roadFilt = this.ctx.createBiquadFilter();
                roadFilt.type = 'bandpass';
                roadFilt.frequency.value = 680;
                roadFilt.Q.value = 0.9;
                const roadGain = this.ctx.createGain();
                roadGain.gain.value = 0.0001;
                roadSrc.connect(roadFilt);
                roadFilt.connect(roadGain);
                roadGain.connect(this.sfxBus);
                roadSrc.start();
                this.playerRoadFilter = roadFilt;
                this.playerRoadGain = roadGain;
              }
            } catch (e) { return; }
          }

          const spd = Math.abs(speed);
          const maxRef = isBuggy ? 38 : 30;
          const normSpd = Math.min(1.15, spd / maxRef);
          const onThrottle = Math.abs(throttle) > 0.1;

          // Simulated 4-speed gear RPM curve (smooth climbs + natural upshift pitch dips)
          const gearBreaks = [0.0, 0.27, 0.54, 0.80, 1.25];
          let gearIdx = 0;
          for (let g = 0; g < 4; g++) {
            if (normSpd >= gearBreaks[g]) gearIdx = g;
          }
          const gearSpan = gearBreaks[gearIdx + 1] - gearBreaks[gearIdx];
          const gearFrac = Math.max(0, Math.min(1, (normSpd - gearBreaks[gearIdx]) / gearSpan));
          // Idle purr at standstill; smooth saw-like RPM band per gear
          const idleBase = isBuggy ? 48 : 38;
          const rpmCurve = spd < 0.8
            ? 0
            : (0.28 + gearFrac * 0.72 + gearIdx * 0.09);
          const midFreq = idleBase + rpmCurve * (isBuggy ? 118 : 88) + (isTurbo ? 28 : 0);
          const subFreq = Math.max(30, midFreq * 0.48);

          // Smoother coasting/deceleration tone when off throttle
          const cutoff = spd < 0.8
            ? 145
            : (onThrottle ? (210 + rpmCurve * 560 + (isTurbo ? 260 : 0)) : (155 + rpmCurve * 260));
          const engVol = spd < 0.8
            ? 0.032
            : Math.min(0.115, (onThrottle ? 0.048 : 0.034) + rpmCurve * 0.052 + (isTurbo ? 0.015 : 0));

          this.playerEngineOsc.frequency.setTargetAtTime(midFreq, now, 0.065);
          this.playerEngineSub.frequency.setTargetAtTime(subFreq, now, 0.065);
          this.playerEngineFilter.frequency.setTargetAtTime(cutoff, now, 0.075);
          this.playerEngineGain.gain.setTargetAtTime(engVol, now, 0.07);

          // Update road / tire friction layer
          if (this.playerRoadGain && this.playerRoadFilter) {
            const roadFreq = surface === 'dirt' ? (360 + normSpd * 340) : (640 + normSpd * 520);
            const roadVol = spd < 1.2 ? 0.0001 : Math.min(0.085, normSpd * (surface === 'dirt' ? 0.078 : 0.056));
            this.playerRoadFilter.frequency.setTargetAtTime(roadFreq, now, 0.08);
            this.playerRoadGain.gain.setTargetAtTime(roadVol, now, 0.08);
          }
        },

        playTireSkid(wx, wy, wz, intensity = 0.65, surface = 'asphalt') {
          if (!this.enabled || !this.ctx || this.ctx.state !== 'running' || !this.whiteNoiseBuf) return;
          if (!this._claimVoice(0.18)) return;
          const now = this.ctx.currentTime;
          const s = Math.max(0.25, Math.min(1.0, intensity));
          const r = this._rand(0.08);
          const dest = this._destNode(wx, wy, wz, 6, 75);

          const src = this.ctx.createBufferSource();
          src.buffer = this.whiteNoiseBuf;
          const filt = this.ctx.createBiquadFilter();
          filt.type = 'bandpass';
          // High-Q rubber chirp on asphalt; gritty gravel slide on dirt
          filt.frequency.setValueAtTime((surface === 'dirt' ? 680 : 1480) * r, now);
          filt.Q.value = surface === 'dirt' ? 1.4 : 5.2;
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime((surface === 'dirt' ? 0.095 : 0.072) * s, now + 0.025);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.16);
          src.connect(filt);
          filt.connect(gain);
          gain.connect(dest);
          src.start(now, Math.random() * 1.4, 0.17);
        },

        updateAIEngine(active, x, z, speed) {
          if (!this.ctx || this.ctx.state !== 'running') return;
          const now = this.ctx.currentTime;
          if (!active || !this.enabled) {
            if (this.aiEngineGain) this.aiEngineGain.gain.setTargetAtTime(0.0001, now, 0.08);
            return;
          }
          if (!this.aiEngineOsc) {
            try {
              const osc = this.ctx.createOscillator();
              const filt = this.ctx.createBiquadFilter();
              const gain = this.ctx.createGain();
              const panner = this._makePanner(x, 0.9, z, 6, 95, 1.3);
              osc.type = 'sawtooth';
              filt.type = 'lowpass';
              filt.frequency.value = 320;
              gain.gain.value = 0.0001;
              osc.connect(filt);
              filt.connect(gain);
              if (panner) {
                gain.connect(panner);
                panner.connect(this.sfxBus);
              } else {
                gain.connect(this.sfxBus);
              }
              osc.start();
              this.aiEngineOsc = osc;
              this.aiEngineFilter = filt;
              this.aiEngineGain = gain;
              this.aiEnginePanner = panner;
            } catch (e) { return; }
          }
          this._setPannerPos(this.aiEnginePanner, x, 0.9, z);
          const spd = Math.abs(speed);
          this.aiEngineOsc.frequency.setTargetAtTime(58 + spd * 2.5, now, 0.05);
          this.aiEngineFilter.frequency.setTargetAtTime(220 + spd * 12, now, 0.06);
          this.aiEngineGain.gain.setTargetAtTime(Math.min(0.08, 0.02 + (spd / 42) * 0.05), now, 0.06);
        },

        playFootstep(surface = 'asphalt', speed = 10, wx, wy, wz) {
          if (!this.enabled || !this.ctx || this.ctx.state !== 'running' || !this.whiteNoiseBuf) return;
          if (!this._claimVoice(0.11)) return;
          const now = this.ctx.currentTime;
          const r = this._rand(0.09);
          const volScale = Math.max(0.35, Math.min(1.0, speed / 15));
          const dest = this._destNode(wx, wy, wz, 4, 35);

          const src = this.ctx.createBufferSource();
          src.buffer = this.whiteNoiseBuf;
          const filt = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          let dur = 0.065;
          let peak = 0.075 * volScale * this._rand(0.08);
          if (surface === 'puddle') {
            filt.type = 'bandpass';
            filt.frequency.setValueAtTime(2400 * r, now);
            filt.Q.value = 1.6;
            dur = 0.095;
            peak = 0.11 * volScale;
          } else if (surface === 'grass') {
            filt.type = 'lowpass';
            filt.frequency.setValueAtTime(620 * r, now);
            dur = 0.08;
            peak = 0.06 * volScale;
          } else if (surface === 'dirt') {
            filt.type = 'bandpass';
            filt.frequency.setValueAtTime(980 * r, now);
            filt.Q.value = 0.9;
            dur = 0.075;
            peak = 0.085 * volScale;
          } else {
            // asphalt / indoor concrete
            filt.type = 'bandpass';
            filt.frequency.setValueAtTime((surface === 'indoor' ? 2100 : 1650) * r, now);
            filt.Q.value = 1.2;
            dur = 0.055;
            peak = 0.078 * volScale;
          }

          gain.gain.setValueAtTime(peak, now);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);
          src.connect(filt);
          filt.connect(gain);
          gain.connect(dest);
          src.start(now, Math.random() * 1.4, dur + 0.01);
        },

        playLanding(surface = 'asphalt', impactSpeed = 10, wx, wy, wz) {
          if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
          const intensity = Math.max(0.18, Math.min(1.0, Math.abs(impactSpeed) / 19));
          const decay = 0.11 + intensity * 0.15;
          if (!this._claimVoice(decay + 0.04)) return;
          const now = this.ctx.currentTime;
          const r = this._rand(0.07);
          const dest = this._destNode(wx, wy, wz, 5, 50);

          // Weighted low-frequency impact thud (deeper & longer on higher drops)
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          const startHz = (surface === 'grass' || surface === 'dirt' ? 88 : 114) * (1.12 - intensity * 0.25) * r;
          const endHz = Math.max(26, 42 - intensity * 14);
          osc.frequency.setValueAtTime(startHz, now);
          osc.frequency.exponentialRampToValueAtTime(endHz, now + decay);
          gain.gain.setValueAtTime((0.12 + intensity * 0.26) * this._rand(0.06), now);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + decay + 0.01);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + decay + 0.02);

          // Surface-aware contact impact texture
          if (this.whiteNoiseBuf) {
            const nSrc = this.ctx.createBufferSource();
            nSrc.buffer = this.whiteNoiseBuf;
            const nFilt = this.ctx.createBiquadFilter();
            if (surface === 'puddle') {
              nFilt.type = 'bandpass';
              nFilt.frequency.setValueAtTime(2450 * r, now);
              nFilt.Q.value = 1.4;
            } else if (surface === 'grass') {
              nFilt.type = 'lowpass';
              nFilt.frequency.setValueAtTime(580 * r, now);
            } else if (surface === 'dirt') {
              nFilt.type = 'bandpass';
              nFilt.frequency.setValueAtTime(980 * r, now);
              nFilt.Q.value = 0.8;
            } else {
              // concrete / asphalt / indoor tile — crisper brightness
              nFilt.type = 'bandpass';
              nFilt.frequency.setValueAtTime((surface === 'indoor' ? 2100 : 1750) * r, now);
              nFilt.Q.value = 0.9;
            }
            const nGain = this.ctx.createGain();
            const nDur = 0.07 + intensity * 0.10;
            nGain.gain.setValueAtTime((0.06 + intensity * 0.13) * this._rand(0.07), now);
            nGain.gain.exponentialRampToValueAtTime(0.0008, now + nDur);
            nSrc.connect(nFilt);
            nFilt.connect(nGain);
            nGain.connect(dest);
            nSrc.start(now, Math.random() * 1.2, nDur + 0.01);
          }
        },

        playImpact(wx, wy, wz, strength = 0.7, material = 'metal') {
          if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
          if (!this._claimVoice(0.22)) return;
          const now = this.ctx.currentTime;
          const s = Math.max(0.2, Math.min(1.0, strength));
          const r = this._rand(0.09);
          const dest = this._destNode(wx, wy, wz, 6, 85);

          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = material === 'metal' ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime((material === 'metal' ? 185 : 135) * r, now);
          osc.frequency.exponentialRampToValueAtTime(42, now + 0.17);
          gain.gain.setValueAtTime(0.24 * s, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.19);

          if (this.whiteNoiseBuf) {
            const nSrc = this.ctx.createBufferSource();
            nSrc.buffer = this.whiteNoiseBuf;
            const filt = this.ctx.createBiquadFilter();
            filt.type = 'bandpass';
            filt.frequency.setValueAtTime((material === 'metal' ? 2400 : 900) * r, now);
            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.14 * s, now);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            nSrc.connect(filt);
            filt.connect(nGain);
            nGain.connect(dest);
            nSrc.start(now, Math.random() * 1.2, 0.13);
          }
        },

        playBallBounce(wx, wy, wz, strength = 0.6) {
          if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
          if (!this._claimVoice(0.14)) return;
          const now = this.ctx.currentTime;
          const s = Math.max(0.18, Math.min(1.0, strength));
          const r = this._rand(0.08);
          const dest = this._destNode(wx, wy, wz, 5, 65);
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(165 * r, now);
          osc.frequency.exponentialRampToValueAtTime(64 * r, now + 0.11);
          gain.gain.setValueAtTime(0.18 * s, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.13);
        },

        playShoot(wx, wy, wz) {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx || !this._claimVoice(0.11)) return;
          const now = this.ctx.currentTime;
          const r = this._rand(0.07);
          const dest = this._destNode(wx, wy, wz, 6, 85);
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320 * r, now);
          osc.frequency.exponentialRampToValueAtTime(75 * r, now + 0.09);
          gain.gain.setValueAtTime(0.22 * this._rand(0.06), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.095);
        },
        playSplat(wx, wy, wz) {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx || !this._claimVoice(0.14)) return;
          const now = this.ctx.currentTime;
          const r = this._rand(0.09);
          const dest = this._destNode(wx, wy, wz, 6, 95);
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(190 * r, now);
          osc.frequency.exponentialRampToValueAtTime(55 * r, now + 0.12);
          gain.gain.setValueAtTime(0.18 * this._rand(0.08), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.13);
        },
        playTeleport() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx || !this._claimVoice(0.42)) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.38);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(this.sfxBus);
          osc.start(now);
          osc.stop(now + 0.42);
        },
        playFanfare() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.1;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain);
            gain.connect(this.sfxBus);
            osc.start(now);
            osc.stop(now + 0.26);
          });
        },
        playHorn(wx, wy, wz) {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx || !this._claimVoice(0.26)) return;
          const now = this.ctx.currentTime;
          const dest = this._destNode(wx, wy, wz, 8, 120);
          [340, 425].forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq * this._rand(0.02), now);
            gain.gain.setValueAtTime(0.11, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
            osc.connect(gain);
            gain.connect(dest);
            osc.start(now);
            osc.stop(now + 0.25);
          });
        },
        startContinuousSiren(vehicleType = 'police', wx, wy, wz) {
          if (!this.enabled) {
            this.stopContinuousSiren();
            return;
          }
          this.init();
          if (!this.ctx) return;
          if (this.activeSirenOsc && this.activeSirenType === vehicleType) {
            return;
          }
          this.stopContinuousSiren();
          try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = vehicleType === 'fire_engine' ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(640, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
            osc.connect(gain);
            const panner = (typeof wx === 'number') ? this._makePanner(wx, wy || 1.8, wz || 0, 10, 140, 1.0) : null;
            if (panner) {
              gain.connect(panner);
              panner.connect(this.sfxBus);
            } else {
              gain.connect(this.sfxBus);
            }
            osc.start();
            this.activeSirenOsc = osc;
            this.activeSirenGain = gain;
            this.activeSirenPanner = panner;
            this.activeSirenType = vehicleType;
          } catch (e) {}
        },
        updateContinuousSiren(timeSec, vehicleType = 'police', wx, wy, wz) {
          if (!this.enabled) {
            this.stopContinuousSiren();
            return;
          }
          if (!this.activeSirenOsc || this.activeSirenType !== vehicleType) {
            this.startContinuousSiren(vehicleType, wx, wy, wz);
          }
          if (!this.activeSirenOsc || !this.ctx) return;
          if (this.activeSirenPanner && typeof wx === 'number') {
            this._setPannerPos(this.activeSirenPanner, wx, wy || 1.8, wz || 0);
          }

          let targetFreq = 740;
          if (vehicleType === 'fire_engine') {
            targetFreq = 530 + Math.sin(timeSec * 4.4) * 140;
          } else if (vehicleType === 'ambulance') {
            targetFreq = Math.sin(timeSec * 7.8) >= 0 ? 780 : 550;
          } else {
            targetFreq = 750 + Math.sin(timeSec * 6.8) * 170;
          }
          this.activeSirenOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.015);
        },
        stopContinuousSiren() {
          if (this.activeSirenOsc) {
            try {
              this.activeSirenOsc.stop();
              this.activeSirenOsc.disconnect();
            } catch (e) {}
            this.activeSirenOsc = null;
          }
          if (this.activeSirenGain) {
            try { this.activeSirenGain.disconnect(); } catch (e) {}
            this.activeSirenGain = null;
          }
          if (this.activeSirenPanner) {
            try { this.activeSirenPanner.disconnect(); } catch (e) {}
            this.activeSirenPanner = null;
          }
          this.activeSirenType = null;
        },
        playSirenPulse(highTone, vehicleType = 'police') {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx || !this._claimVoice(0.28)) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = vehicleType === 'fire_engine' ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(highTone ? 780 : 560, now);
          osc.frequency.linearRampToValueAtTime(highTone ? 600 : 820, now + 0.25);
          gain.gain.setValueAtTime(0.13, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.26);
          osc.connect(gain);
          gain.connect(this.sfxBus);
          osc.start(now);
          osc.stop(now + 0.27);
        },
        playRotorPulse() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx || !this._claimVoice(0.09)) return;
          const now = this.ctx.currentTime;
          const r = this._rand(0.05);
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(58 * r, now);
          osc.frequency.exponentialRampToValueAtTime(42 * r, now + 0.07);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
          osc.connect(gain);
          gain.connect(this.sfxBus);
          osc.start(now);
          osc.stop(now + 0.08);
        },
        playSplash(wx, wy, wz) {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx || !this._claimVoice(0.26)) return;
          const now = this.ctx.currentTime;
          const dest = this._destNode(wx, wy, wz, 6, 70);
          [220, 310, 440, 180].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const r = this._rand(0.07);
            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq * r, now + idx * 0.03);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.45 * r, now + idx * 0.03 + 0.16);
            gain.gain.setValueAtTime(0.11, now + idx * 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.18);
            osc.connect(gain);
            gain.connect(dest);
            osc.start(now + idx * 0.03);
            osc.stop(now + idx * 0.03 + 0.19);
          });
        },
        playSwimStroke() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx || !this._claimVoice(0.16)) return;
          const now = this.ctx.currentTime;
          const r = this._rand(0.08);
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(195 * r, now);
          osc.frequency.exponentialRampToValueAtTime(125 * r, now + 0.14);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(this.sfxBus);
          osc.start(now);
          osc.stop(now + 0.16);
        },
        playJump(surface = 'asphalt') {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx || !this._claimVoice(0.14)) return;
          const now = this.ctx.currentTime;
          const r = this._rand(0.075);

          // 1. Short grounded push-off thump (no cartoonish boing!)
          const osc = this.ctx.createOscillator();
          const g1 = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(112 * r, now);
          osc.frequency.exponentialRampToValueAtTime(62 * r, now + 0.065);
          g1.gain.setValueAtTime(0.105 * this._rand(0.06), now);
          g1.gain.exponentialRampToValueAtTime(0.0008, now + 0.07);
          osc.connect(g1);
          g1.connect(this.sfxBus);
          osc.start(now);
          osc.stop(now + 0.075);

          // 2. Brief foot/surface push-off scrape + subtle upward air/cloth rustle
          if (this.whiteNoiseBuf) {
            const src = this.ctx.createBufferSource();
            src.buffer = this.whiteNoiseBuf;
            const filt = this.ctx.createBiquadFilter();
            filt.type = 'bandpass';
            const baseF = surface === 'grass' ? 680 : (surface === 'dirt' ? 980 : 1320);
            filt.frequency.setValueAtTime(baseF * r, now);
            filt.frequency.exponentialRampToValueAtTime(baseF * 1.42 * r, now + 0.095);
            filt.Q.value = 1.15;
            const g2 = this.ctx.createGain();
            g2.gain.setValueAtTime(0.001, now);
            g2.gain.linearRampToValueAtTime(0.078 * this._rand(0.07), now + 0.014);
            g2.gain.exponentialRampToValueAtTime(0.0008, now + 0.105);
            src.connect(filt);
            filt.connect(g2);
            g2.connect(this.sfxBus);
            src.start(now, Math.random() * 1.4, 0.115);
          }
        }
      };

      // Clean browser autoplay unlock on first user interaction
      (function bindAudioAutoplayUnlock() {
        const unlockOnce = () => {
          SoundFX.init();
          window.removeEventListener('pointerdown', unlockOnce);
          window.removeEventListener('keydown', unlockOnce);
        };
        window.addEventListener('pointerdown', unlockOnce, { passive: true });
        window.addEventListener('keydown', unlockOnce, { passive: true });
      })();

      // ==========================================
      // 2. PROCEDURAL CANVAS TEXTURES
      // ==========================================
      function createSkyscraperTexture(baseHex, windowLitHex, cols, rows) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 512;
        const ctx = c.getContext('2d');
        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, c.width, c.height);

        const padX = 14;
        const padY = 18;
        const cellW = (c.width - padX * 2) / cols;
        const cellH = (c.height - padY * 2) / rows;

        for (let r = 0; r < rows; r++) {
          for (let col = 0; col < cols; col++) {
            const lit = Math.random() > 0.28;
            ctx.fillStyle = lit ? windowLitHex : '#0f172a';
            ctx.fillRect(
              padX + col * cellW + 4,
              padY + r * cellH + 4,
              cellW - 8,
              cellH - 8
            );
          }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
      }

      function createSignTexture(title, subtitle, bgHex, borderHex, textHex) {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 160;
        const ctx = c.getContext('2d');

        ctx.fillStyle = bgHex;
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.strokeStyle = borderHex;
        ctx.lineWidth = 10;
        ctx.strokeRect(8, 8, c.width - 16, c.height - 16);

        ctx.fillStyle = textHex;
        ctx.font = '900 42px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, c.width / 2, 62);

        ctx.fillStyle = borderHex;
        ctx.font = '700 24px Inter, sans-serif';
        ctx.fillText(subtitle, c.width / 2, 115);

        return new THREE.CanvasTexture(c);
      }

      function createClockTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, 256, 256);

        ctx.beginPath();
        ctx.arc(128, 128, 110, 0, Math.PI * 2);
        ctx.fillStyle = '#fef3c7';
        ctx.fill();
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#d97706';
        ctx.stroke();

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 6;
        for (let i = 0; i < 12; i++) {
          const ang = (i * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(128 + Math.cos(ang) * 82, 128 + Math.sin(ang) * 82);
          ctx.lineTo(128 + Math.cos(ang) * 98, 128 + Math.sin(ang) * 98);
          ctx.stroke();
        }

        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(128, 128);
        ctx.lineTo(128, 62);
        ctx.stroke();

        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(128, 128);
        ctx.lineTo(178, 128);
        ctx.stroke();

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(128, 128, 10, 0, Math.PI * 2);
        ctx.fill();

        return new THREE.CanvasTexture(c);
      }

      // ==========================================
      // 3. THREE.JS SCENE, CAMERA & PBR RENDERER SETUP (ACES FILMIC + SOFT SHADOWS + SKY DOME)
      // ==========================================
      const canvas = document.getElementById('webgl-canvas');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
      const MAX_TEX_ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 4);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.06;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x88c9f2);
      scene.fog = new THREE.FogExp2(0x9bd3f5, 0.00072);

      const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 1200);

      // Procedural Equirectangular Environment Map via PMREMGenerator for PBR reflections
      (function setupProceduralEnvironment() {
        try {
          const envCanvas = document.createElement('canvas');
          envCanvas.width = 256;
          envCanvas.height = 128;
          const ectx = envCanvas.getContext('2d');
          const grad = ectx.createLinearGradient(0, 0, 0, 128);
          grad.addColorStop(0.0, '#1d4ed8');
          grad.addColorStop(0.38, '#60a5fa');
          grad.addColorStop(0.50, '#fef3c7');
          grad.addColorStop(0.54, '#64748b');
          grad.addColorStop(1.0, '#1e293b');
          ectx.fillStyle = grad;
          ectx.fillRect(0, 0, 256, 128);
          // Warm sun specular highlight spot
          const sGrad = ectx.createRadialGradient(185, 36, 2, 185, 36, 24);
          sGrad.addColorStop(0, 'rgba(255, 251, 235, 1.0)');
          sGrad.addColorStop(1, 'rgba(255, 251, 235, 0.0)');
          ectx.fillStyle = sGrad;
          ectx.fillRect(150, 8, 70, 60);

          const envTex = new THREE.CanvasTexture(envCanvas);
          envTex.mapping = THREE.EquirectangularReflectionMapping;
          envTex.encoding = THREE.sRGBEncoding;
          const pmrem = new THREE.PMREMGenerator(renderer);
          pmrem.compileEquirectangularShader();
          const rt = pmrem.fromEquirectangular(envTex);
          scene.environment = rt.texture;
          envTex.dispose();
          pmrem.dispose();
        } catch (err) {}
      })();

      // Procedural Atmospheric Sky Dome (Smooth Day/Horizon/Sun -> Night Indigo Gradient)
      const skyUniforms = {
        uTopColor: { value: new THREE.Color(0x1d6fd8) },
        uHorizonColor: { value: new THREE.Color(0xcbe8fb) },
        uBottomColor: { value: new THREE.Color(0x475569) },
        uSunDir: { value: new THREE.Vector3(95, 160, 85).normalize() },
        uSunColor: { value: new THREE.Color(0xfffbeb) },
        uNightBlend: { value: 0.0 }
      };
      const skyDome = new THREE.Mesh(
        new THREE.SphereGeometry(760, 24, 16),
        new THREE.ShaderMaterial({
          uniforms: skyUniforms,
          side: THREE.BackSide,
          depthWrite: false,
          fog: false,
          vertexShader: `
            varying vec3 vWorldDir;
            void main() {
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vWorldDir = normalize(position);
              gl_Position = projectionMatrix * viewMatrix * wp;
            }
          `,
          fragmentShader: `
            uniform vec3 uTopColor;
            uniform vec3 uHorizonColor;
            uniform vec3 uBottomColor;
            uniform vec3 uSunDir;
            uniform vec3 uSunColor;
            uniform float uNightBlend;
            varying vec3 vWorldDir;
            void main() {
              vec3 dir = normalize(vWorldDir);
              float h = dir.y;
              vec3 col = h >= 0.0
                ? mix(uHorizonColor, uTopColor, pow(clamp(h, 0.0, 1.0), 0.55))
                : mix(uHorizonColor, uBottomColor, pow(clamp(-h, 0.0, 1.0), 0.5));
              float sunAmt = max(dot(dir, normalize(uSunDir)), 0.0);
              float sunHalo = pow(sunAmt, 24.0) * 0.45 * (1.0 - uNightBlend);
              float sunDisc = smoothstep(0.9965, 0.9988, sunAmt) * (1.0 - uNightBlend);
              col += uSunColor * (sunHalo + sunDisc * 1.4);
              gl_FragColor = vec4(col, 1.0);
            }
          `
        })
      );
      scene.add(skyDome);

      // Procedural Tiled Surface Texture & Bump Factory (Cached once at startup — zero runtime cost)
      function createProceduralSurfaceTextures(kind, baseHex, repeatX = 1, repeatY = 1) {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');
        const bC = document.createElement('canvas');
        bC.width = 256;
        bC.height = 256;
        const bctx = bC.getContext('2d');

        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 256, 256);
        bctx.fillStyle = '#808080';
        bctx.fillRect(0, 0, 256, 256);

        if (kind === 'asphalt') {
          for (let i = 0; i < 2400; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const v = 22 + Math.floor(Math.random() * 28);
            ctx.fillStyle = `rgba(${v},${v + 4},${v + 12},0.45)`;
            ctx.fillRect(x, y, 2, 2);
            const bv = 96 + Math.floor(Math.random() * 64);
            bctx.fillStyle = `rgb(${bv},${bv},${bv})`;
            bctx.fillRect(x, y, 2, 2);
          }
        } else if (kind === 'plaza_tile') {
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.22)';
          ctx.lineWidth = 3;
          bctx.strokeStyle = '#404040';
          bctx.lineWidth = 4;
          for (let g = 0; g <= 256; g += 64) {
            ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, 256); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(256, g); ctx.stroke();
            bctx.beginPath(); bctx.moveTo(g, 0); bctx.lineTo(g, 256); bctx.stroke();
            bctx.beginPath(); bctx.moveTo(0, g); bctx.lineTo(256, g); bctx.stroke();
          }
          for (let i = 0; i < 900; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)';
            ctx.fillRect(x, y, 3, 3);
          }
        } else if (kind === 'grass') {
          for (let i = 0; i < 2200; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(101,163,13,0.32)' : 'rgba(22,101,52,0.28)';
            ctx.fillRect(x, y, 3, 3);
            const bv = 100 + Math.floor(Math.random() * 55);
            bctx.fillStyle = `rgb(${bv},${bv},${bv})`;
            bctx.fillRect(x, y, 2, 2);
          }
        } else if (kind === 'dirt') {
          for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(120,53,15,0.28)' : 'rgba(217,119,6,0.24)';
            ctx.fillRect(x, y, 4, 2);
            const bv = 85 + Math.floor(Math.random() * 80);
            bctx.fillStyle = `rgb(${bv},${bv},${bv})`;
            bctx.fillRect(x, y, 3, 2);
          }
        }

        const rC = document.createElement('canvas');
        rC.width = 256;
        rC.height = 256;
        const rctx = rC.getContext('2d');
        const baseRough = kind === 'asphalt' ? 210 : (kind === 'plaza_tile' ? 168 : (kind === 'dirt' ? 232 : 220));
        rctx.fillStyle = `rgb(${baseRough},${baseRough},${baseRough})`;
        rctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1400; i++) {
          const rx = Math.random() * 256;
          const ry = Math.random() * 256;
          const rv = Math.max(95, Math.min(250, baseRough + Math.floor((Math.random() - 0.5) * 68)));
          rctx.fillStyle = `rgb(${rv},${rv},${rv})`;
          rctx.fillRect(rx, ry, kind === 'asphalt' ? 3 : 4, kind === 'asphalt' ? 3 : 4);
        }

        const map = new THREE.CanvasTexture(c);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(repeatX, repeatY);
        map.encoding = THREE.sRGBEncoding;
        map.anisotropy = MAX_TEX_ANISO;

        const bumpMap = new THREE.CanvasTexture(bC);
        bumpMap.wrapS = THREE.RepeatWrapping;
        bumpMap.wrapT = THREE.RepeatWrapping;
        bumpMap.repeat.set(repeatX, repeatY);
        bumpMap.anisotropy = MAX_TEX_ANISO;

        const roughnessMap = new THREE.CanvasTexture(rC);
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        roughnessMap.repeat.set(repeatX, repeatY);
        roughnessMap.anisotropy = MAX_TEX_ANISO;

        return { map, bumpMap, roughnessMap };
      }

      // Soft Additive Radial Glow Texture (Zero-Lag Bloom Alternative for Streetlights & Beacons)
      const softGlowTexture = (function createSoftGlowTex() {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
        g.addColorStop(0.0, 'rgba(255, 251, 235, 0.95)');
        g.addColorStop(0.35, 'rgba(254, 240, 138, 0.45)');
        g.addColorStop(1.0, 'rgba(254, 240, 138, 0.0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      })();

      // Shared Soft Radial Contact AO Shadow Texture (Eliminates "floating object" look at zero GPU cost)
      const contactShadowTexture = (function createContactShadowTex() {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 128;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(64, 64, 12, 64, 64, 62);
        g.addColorStop(0.0, 'rgba(5, 10, 20, 0.56)');
        g.addColorStop(0.55, 'rgba(5, 10, 20, 0.28)');
        g.addColorStop(1.0, 'rgba(5, 10, 20, 0.0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
      })();

      const contactShadowMat = new THREE.MeshBasicMaterial({
        map: contactShadowTexture,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1
      });

      const vehicleHeadlightGlowMat = new THREE.SpriteMaterial({
        map: softGlowTexture,
        color: 0xfffbeb,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const vehicleTaillightGlowMat = new THREE.SpriteMaterial({
        map: softGlowTexture,
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      // Realistic 3-Point Environmental Lighting + Player-Tracking Soft Shadows
      const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.28);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xcbe8fb, 0x475569, 0.65);
      scene.add(hemiLight);

      const sunLight = new THREE.DirectionalLight(0xfff5e0, 1.25);
      sunLight.position.set(95, 160, 85);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 20;
      sunLight.shadow.camera.far = 360;
      const d = 66;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.00035;
      sunLight.shadow.normalBias = 0.032;
      scene.add(sunLight);
      scene.add(sunLight.target);

      // Subtle cool rim fill light (non-shadow-casting) for sharper vehicle & architectural silhouettes
      const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.32);
      rimLight.position.set(-110, 75, -95);
      scene.add(rimLight);

      // Single lightweight active-vehicle forward headlight SpotLight (dusk/night road illumination)
      const vehicleHeadlightBeam = new THREE.SpotLight(0xfffbeb, 0.0, 48, Math.PI / 5.2, 0.55, 1.4);
      vehicleHeadlightBeam.castShadow = false;
      scene.add(vehicleHeadlightBeam);
      scene.add(vehicleHeadlightBeam.target);

      // World Collision Boxes (Array of { minX, maxX, minZ, maxZ, maxY, tag })
      const colliders = [];
      const shootableMeshes = [];
      const mapBuildings = []; // For minimap rendering

      function addBoxCollider(cx, cz, sx, sz, sy, tag) {
        colliders.push({
          minX: cx - sx / 2,
          maxX: cx + sx / 2,
          minZ: cz - sz / 2,
          maxZ: cz + sz / 2,
          maxY: sy,
          tag: tag || 'solid'
        });
      }

      // ==========================================
      // 4. WORLD ARCHITECTURE: CITY, TOWN HALL, SHOP GATE & OUTSKIRTS ARENA
      // ==========================================
      const worldGroup = new THREE.Group();
      scene.add(worldGroup);

      // Base Ground (Covers both Main City and Outskirts — Procedural Grass PBR)
      const grassTexPack = createProceduralSurfaceTextures('grass', '#466818', 36, 24);
      const groundGeo = new THREE.PlaneGeometry(900, 600);
      const groundMat = new THREE.MeshStandardMaterial({
        map: grassTexPack.map,
        bumpMap: grassTexPack.bumpMap,
        bumpScale: 0.18,
        roughness: 0.92,
        metalness: 0.02
      });
      const groundMesh = new THREE.Mesh(groundGeo, groundMat);
      groundMesh.rotation.x = -Math.PI / 2;
      groundMesh.receiveShadow = true;
      worldGroup.add(groundMesh);
      shootableMeshes.push(groundMesh);

      // Main City Concrete Base Pad (-155..155, -155..155 — Textured Concrete PBR)
      const concreteTexPack = createProceduralSurfaceTextures('plaza_tile', '#3b495e', 24, 24);
      const cityPadGeo = new THREE.BoxGeometry(310, 0.2, 310);
      const cityPadMat = new THREE.MeshStandardMaterial({
        map: concreteTexPack.map,
        bumpMap: concreteTexPack.bumpMap,
        bumpScale: 0.08,
        roughness: 0.84,
        metalness: 0.04
      });
      const cityPad = new THREE.Mesh(cityPadGeo, cityPadMat);
      cityPad.position.set(0, 0.1, 0);
      cityPad.receiveShadow = true;
      worldGroup.add(cityPad);
      shootableMeshes.push(cityPad);

      // City Road Network (Grid of Textured Asphalt PBR Roads with Properly Oriented N-S & E-W UVs + Roughness Maps)
      const asphaltTexPack = createProceduralSurfaceTextures('asphalt', '#1e2736', 2, 26);
      const roadMat = new THREE.MeshStandardMaterial({
        map: asphaltTexPack.map,
        bumpMap: asphaltTexPack.bumpMap,
        bumpScale: 0.16,
        roughnessMap: asphaltTexPack.roughnessMap,
        roughness: 0.92,
        metalness: 0.06
      });
      const ewAsphaltTexPack = createProceduralSurfaceTextures('asphalt', '#1e2736', 26, 2);
      const ewRoadMat = new THREE.MeshStandardMaterial({
        map: ewAsphaltTexPack.map,
        bumpMap: ewAsphaltTexPack.bumpMap,
        bumpScale: 0.16,
        roughnessMap: ewAsphaltTexPack.roughnessMap,
        roughness: 0.92,
        metalness: 0.06
      });
      const stripeMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xca8a04,
        emissiveIntensity: 0.24,
        roughness: 0.52
      });
      const roadCoords = [-110, -52, 52, 110];

      roadCoords.forEach((rc) => {
        const nsRoad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.24, 308), roadMat);
        nsRoad.position.set(rc, 0.12, 0);
        nsRoad.receiveShadow = true;
        worldGroup.add(nsRoad);

        const nsLine = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.26, 304), stripeMat);
        nsLine.position.set(rc, 0.13, 0);
        worldGroup.add(nsLine);

        const ewRoad = new THREE.Mesh(new THREE.BoxGeometry(308, 0.24, 16), ewRoadMat);
        ewRoad.position.set(0, 0.126, rc);
        ewRoad.receiveShadow = true;
        worldGroup.add(ewRoad);

        const ewLine = new THREE.Mesh(new THREE.BoxGeometry(304, 0.26, 0.4), stripeMat);
        ewLine.position.set(0, 0.136, rc);
        worldGroup.add(ewLine);
      });

      // Connecting Outskirts Highway from East City Gate to Outskirts Paintball Ground
      const highway = new THREE.Mesh(new THREE.BoxGeometry(108, 0.22, 14), ewRoadMat);
      highway.position.set(209, 0.12, 0);
      highway.receiveShadow = true;
      worldGroup.add(highway);

      // Cosmetic Surface Imperfections: Zebra Crosswalks + Reflective Rainwater Puddles (No Colliders!)
      (function addCosmeticRoadDetails() {
        const crosswalkMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.78,
          metalness: 0.02
        });
        const crosswalkStripeGeo = new THREE.BoxGeometry(1.1, 0.03, 3.6);
        // Place zebra crosswalks at the 4 central Plaza avenue crossings
        [
          { x: 0, z: -45.5, rot: 0 },
          { x: 0, z: 45.5, rot: 0 },
          { x: -45.5, z: 0, rot: Math.PI / 2 },
          { x: 45.5, z: 0, rot: Math.PI / 2 }
        ].forEach((cw) => {
          const grp = new THREE.Group();
          grp.position.set(cw.x, 0.25, cw.z);
          grp.rotation.y = cw.rot;
          for (let s = -5; s <= 5; s++) {
            const bar = new THREE.Mesh(crosswalkStripeGeo, crosswalkMat);
            bar.position.set(s * 2.1, 0, 0);
            bar.receiveShadow = true;
            grp.add(bar);
          }
          worldGroup.add(grp);
        });

        // Subtle Reflective Rainwater Puddles (Mirror the Sky Dome & Streetlights!)
        const puddleMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.04,
          metalness: 0.88,
          envMapIntensity: 1.9,
          transparent: true,
          opacity: 0.68,
          depthWrite: false
        });
        const puddleSpecs = window.__worldPuddles = [
          [-22, 18, 2.8, 1.9], [16, -28, 3.2, 2.1], [-48, -14, 3.6, 2.2],
          [56, 22, 3.4, 2.0], [-56, 46, 3.0, 2.4], [48, -56, 3.5, 2.1],
          [14, 48, 2.9, 1.8], [176, 4.5, 3.8, 2.2], [-104, -18, 3.4, 2.5],
          [104, 18, 3.2, 2.1], [-18, -32, 2.6, 1.8], [32, 28, 2.9, 2.0]
        ];
        const puddleGeo = new THREE.CircleGeometry(1, 16);
        puddleSpecs.forEach(([px, pz, sx, sz]) => {
          const pMesh = new THREE.Mesh(puddleGeo, puddleMat);
          pMesh.rotation.x = -Math.PI / 2;
          pMesh.scale.set(sx, sz, 1);
          pMesh.position.set(px, 0.265, pz);
          pMesh.receiveShadow = true;
          worldGroup.add(pMesh);
        });
      })();

      // Central Town Hall Plaza (-44..44, -44..44 — Travertine Stone Tile PBR)
      const plazaTileTex = createProceduralSurfaceTextures('plaza_tile', '#94a3b8', 10, 10);
      const plazaGeo = new THREE.BoxGeometry(88, 0.3, 88);
      const plazaMat = new THREE.MeshStandardMaterial({
        map: plazaTileTex.map,
        bumpMap: plazaTileTex.bumpMap,
        bumpScale: 0.08,
        roughness: 0.68,
        metalness: 0.05
      });
      const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
      plazaMesh.position.set(0, 0.15, 0);
      plazaMesh.receiveShadow = true;
      worldGroup.add(plazaMesh);
      shootableMeshes.push(plazaMesh);

      // Decorative Plaza Inner Tile Ring
      const innerPlazaTileTex = createProceduralSurfaceTextures('plaza_tile', '#cbd5e1', 8, 8);
      const innerPlaza = new THREE.Mesh(
        new THREE.BoxGeometry(64, 0.34, 64),
        new THREE.MeshStandardMaterial({
          map: innerPlazaTileTex.map,
          bumpMap: innerPlazaTileTex.bumpMap,
          bumpScale: 0.06,
          roughness: 0.58,
          metalness: 0.06
        })
      );
      innerPlaza.position.set(0, 0.17, 0);
      innerPlaza.receiveShadow = true;
      worldGroup.add(innerPlaza);

      // Small Ornamental City Centre Fountain in front of Town Hall (Centered at x: 0, z: 7)
      const FOUNTAIN_POS = { x: 0, z: 7 };
      const plazaFountainGroup = new THREE.Group();
      plazaFountainGroup.position.set(FOUNTAIN_POS.x, 0.34, FOUNTAIN_POS.z);
      worldGroup.add(plazaFountainGroup);

      const ftnStoneMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45, metalness: 0.08 });
      const ftnGoldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.24, metalness: 0.85 });
      const ftnWaterMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.10,
        metalness: 0.22,
        transparent: true,
        opacity: 0.80
      });

      // Outer Marble Basin & Gold Coping Rim (Small 3.3m radius so players easily walk around it)
      const ftnBasin = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.6, 0.82, 18), ftnStoneMat);
      ftnBasin.position.y = 0.41;
      plazaFountainGroup.add(ftnBasin);

      const ftnRim = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.14, 10, 24), ftnGoldMat);
      ftnRim.rotation.x = Math.PI / 2;
      ftnRim.position.y = 0.82;
      plazaFountainGroup.add(ftnRim);

      // Lower Basin Shimmering Water Pool
      const ftnWaterPool = new THREE.Mesh(new THREE.CylinderGeometry(3.05, 3.05, 0.68, 18), ftnWaterMat);
      ftnWaterPool.position.y = 0.42;
      plazaFountainGroup.add(ftnWaterPool);

      // Central Tiered Pedestal & Upper Bowl
      const ftnPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.78, 2.1, 12), ftnStoneMat);
      ftnPillar.position.y = 1.15;
      plazaFountainGroup.add(ftnPillar);

      const ftnUpperBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 0.55, 0.42, 16), ftnStoneMat);
      ftnUpperBowl.position.y = 2.15;
      plazaFountainGroup.add(ftnUpperBowl);

      const ftnUpperWater = new THREE.Mesh(
        new THREE.CylinderGeometry(1.28, 1.28, 0.12, 16),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
      );
      ftnUpperWater.position.y = 2.34;
      plazaFountainGroup.add(ftnUpperWater);

      const ftnSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.55, 10), ftnGoldMat);
      ftnSpout.position.y = 2.62;
      plazaFountainGroup.add(ftnSpout);

      // 8 Animated Water Jet Droplets arcing from the top spout into the fountain basin
      const fountainJetDrops = [];
      const ftnDropGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
      const ftnDropMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
      for (let i = 0; i < 8; i++) {
        const dropMesh = new THREE.Mesh(ftnDropGeo, ftnDropMat);
        plazaFountainGroup.add(dropMesh);
        fountainJetDrops.push({
          mesh: dropMesh,
          angle: (i * Math.PI * 2) / 8,
          phase: i / 8
        });
      }

      addBoxCollider(FOUNTAIN_POS.x, FOUNTAIN_POS.z, 6.4, 6.4, 2.8, 'plaza_fountain');
      mapBuildings.push({ x: FOUNTAIN_POS.x, z: FOUNTAIN_POS.z, w: 6.4, d: 6.4, color: '#22d3ee', label: 'Plaza Fountain' });

      // ------------------------------------------
      // 4.05 CITY STREETLIGHTS, INDOOR POINT LIGHTS & DAY/NIGHT SYSTEM
      // (Automatic 25-Min Day / 15-Min Night + Manual Switch)
      // ------------------------------------------
      const DAY_DURATION_SEC = 25 * 60;   // 25 minutes (1500 seconds)
      const NIGHT_DURATION_SEC = 15 * 60; // 15 minutes (900 seconds)

      const dayNightState = {
        isNight: false,
        phaseRemainingSec: DAY_DURATION_SEC,
        blend: 0.0,
        lastHudSecond: -1
      };

      const streetLightPoleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42, metalness: 0.72 });
      const streetLightBulbMat = new THREE.MeshBasicMaterial({ color: 0xdbeafe });
      const streetLightGlowSpriteMat = new THREE.SpriteMaterial({
        map: softGlowTexture,
        color: 0xfef08a,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const streetLightGroundHaloMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      });

      const streetLightPositions = [];
      const streetLightsGroup = new THREE.Group();
      worldGroup.add(streetLightsGroup);

      const slBaseGeo = new THREE.CylinderGeometry(0.38, 0.52, 0.85, 8);
      const slPoleGeo = new THREE.CylinderGeometry(0.14, 0.2, 7.4, 8);
      const slArmGeo = new THREE.BoxGeometry(1.75, 0.16, 0.16);
      const slHoodGeo = new THREE.BoxGeometry(0.72, 0.2, 0.52);
      const slBulbGeo = new THREE.SphereGeometry(0.3, 10, 10);
      const slHaloGeo = new THREE.CircleGeometry(5.6, 18);

      function addStreetLight(x, z, armAngleY = 0) {
        streetLightPositions.push({ x, z });
        const g = new THREE.Group();
        g.position.set(x, 0, z);
        g.rotation.y = armAngleY;

        const base = new THREE.Mesh(slBaseGeo, streetLightPoleMat);
        base.position.y = 0.42;
        g.add(base);

        const pole = new THREE.Mesh(slPoleGeo, streetLightPoleMat);
        pole.position.y = 4.1;
        g.add(pole);

        const arm = new THREE.Mesh(slArmGeo, streetLightPoleMat);
        arm.position.set(0.75, 7.65, 0);
        g.add(arm);

        const hood = new THREE.Mesh(slHoodGeo, streetLightPoleMat);
        hood.position.set(1.45, 7.58, 0);
        g.add(hood);

        const bulb = new THREE.Mesh(slBulbGeo, streetLightBulbMat);
        bulb.position.set(1.45, 7.36, 0);
        g.add(bulb);

        const bulbGlow = new THREE.Sprite(streetLightGlowSpriteMat);
        bulbGlow.position.set(1.45, 7.36, 0);
        bulbGlow.scale.set(3.8, 3.8, 1);
        g.add(bulbGlow);

        const halo = new THREE.Mesh(slHaloGeo, streetLightGroundHaloMat);
        halo.position.set(1.45, 0.27, 0);
        halo.rotation.x = -Math.PI / 2;
        g.add(halo);

        streetLightsGroup.add(g);
        addBoxCollider(x, z, 0.9, 0.9, 7.8, 'streetlight');
      }

      const slAvenueOffsets = [-132, -68, 0, 68, 132];
      roadCoords.forEach((rc) => {
        slAvenueOffsets.forEach((pos) => {
          addStreetLight(rc - 9.2, pos, 0);
          addStreetLight(rc + 9.2, pos, Math.PI);
          if (Math.abs(pos - rc) > 14) {
            addStreetLight(pos, rc - 9.2, -Math.PI / 2);
            addStreetLight(pos, rc + 9.2, Math.PI / 2);
          }
        });
      });

      [
        [-38, -38, -Math.PI / 4], [38, -38, -3 * Math.PI / 4],
        [-38, 38, Math.PI / 4],   [38, 38, 3 * Math.PI / 4],
        [-18, 38, Math.PI / 2],   [18, 38, Math.PI / 2],
        [168, -8.5, -Math.PI / 2],[168, 8.5, Math.PI / 2],
        [205, -8.5, -Math.PI / 2],[205, 8.5, Math.PI / 2]
      ].forEach(([sx, sz, sang]) => addStreetLight(sx, sz, sang));

      // Night Sky Starfield & Moon Group
      const nightSkyGroup = new THREE.Group();
      nightSkyGroup.visible = false;
      scene.add(nightSkyGroup);

      const moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(14, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0xfef9c3 })
      );
      moonMesh.position.set(-140, 210, -160);
      nightSkyGroup.add(moonMesh);

      const starGeo = new THREE.BufferGeometry();
      const starPositions = new Float32Array(360 * 3);
      for (let i = 0; i < 360; i++) {
        const theta = Math.random() * Math.PI * 2;
        const y = 95 + Math.random() * 190;
        const rad = 180 + Math.random() * 180;
        starPositions[i * 3] = Math.cos(theta) * rad;
        starPositions[i * 3 + 1] = y;
        starPositions[i * 3 + 2] = Math.sin(theta) * rad;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starPoints = new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, sizeAttenuation: false })
      );
      nightSkyGroup.add(starPoints);

      const indoorPointLightA = new THREE.PointLight(0xfffbeb, 1.35, 42);
      indoorPointLightA.position.set(0, 6.2, -16);
      scene.add(indoorPointLightA);

      const indoorPointLightB = new THREE.PointLight(0xfff7ed, 1.15, 36);
      indoorPointLightB.position.set(33, 5.2, 6);
      scene.add(indoorPointLightB);

      const activeStreetPointLight = new THREE.PointLight(0xfef08a, 0.0, 38);
      activeStreetPointLight.position.set(0, 7.2, 20);
      scene.add(activeStreetPointLight);

      // ------------------------------------------
      // 4A. INTERACTIVE DOORS, ONE-WAY WINDOW WALLS & MULTI-FLOOR HELPERS
      // ------------------------------------------
      const interactiveDoors = [];
      const multiFloorBuildings = [];

      const exteriorFacadeMatCache = {};
      const interiorWindowMatCache = {};
      const interiorCeilingFixtureGeo = new THREE.BoxGeometry(2.6, 0.14, 1.1);
      const interiorCeilingHousingMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      const interiorCeilingDiffuserGeo = new THREE.BoxGeometry(2.3, 0.08, 0.85);
      const interiorCeilingDiffuserMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
      const interiorLightHaloGeo = new THREE.PlaneGeometry(3.4, 1.8);
      const interiorLightHaloMat = new THREE.MeshBasicMaterial({
        color: 0xfef3c7,
        transparent: true,
        opacity: 0.24,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      function hexToRgbObj(hexVal) {
        const num = typeof hexVal === 'number' ? hexVal : parseInt(String(hexVal).replace('#', ''), 16) || 0x334155;
        return {
          r: (num >> 16) & 255,
          g: (num >> 8) & 255,
          b: num & 255
        };
      }

      function getExteriorFacadeMaterial(wallColorHex) {
        const key = String(wallColorHex);
        if (exteriorFacadeMatCache[key]) return exteriorFacadeMatCache[key];

        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 128;
        const ctx = c.getContext('2d');
        const rgb = hexToRgbObj(wallColorHex);

        // Bright architectural cladding base
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(0, 0, 256, 128);

        // Crisp spandrel bands (top & bottom)
        const darkR = Math.max(18, Math.floor(rgb.r * 0.62));
        const darkG = Math.max(22, Math.floor(rgb.g * 0.62));
        const darkB = Math.max(34, Math.floor(rgb.b * 0.62));
        ctx.fillStyle = `rgb(${darkR}, ${darkG}, ${darkB})`;
        ctx.fillRect(0, 0, 256, 20);
        ctx.fillRect(0, 98, 256, 30);

        // 4 Reflective Skyscraper Windows (100% opaque from outside)
        const paneCenters = [36, 98, 158, 220];
        const paneW = 44;
        const paneH = 66;
        const paneY = 26;

        paneCenters.forEach((cx) => {
          const px = cx - paneW / 2;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px - 3, paneY - 3, paneW + 6, paneH + 6);

          const grad = ctx.createLinearGradient(px, paneY, px + paneW, paneY + paneH);
          grad.addColorStop(0, '#1e3a8a');
          grad.addColorStop(0.5, '#38bdf8');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(px, paneY, paneW, paneH);

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px, paneY + paneH / 2 - 1, paneW, 3);
          ctx.fillRect(cx - 1, paneY, 3, paneH);
        });

        // Subtle urban base-grime gradient along bottom edge of cladding
        const grimeGrad = ctx.createLinearGradient(0, 96, 0, 128);
        grimeGrad.addColorStop(0, 'rgba(15, 23, 42, 0.0)');
        grimeGrad.addColorStop(1, 'rgba(15, 23, 42, 0.34)');
        ctx.fillStyle = grimeGrad;
        ctx.fillRect(0, 96, 256, 32);

        // Matching roughnessMap (glossy glass vs matte cladding) + warm nighttime window emissiveMap!
        const rC = document.createElement('canvas');
        rC.width = 256;
        rC.height = 128;
        const rctx = rC.getContext('2d');
        rctx.fillStyle = '#cfcfcf';
        rctx.fillRect(0, 0, 256, 128);

        const eC = document.createElement('canvas');
        eC.width = 256;
        eC.height = 128;
        const ectx = eC.getContext('2d');
        ectx.fillStyle = '#000000';
        ectx.fillRect(0, 0, 256, 128);

        rctx.fillStyle = '#262626';
        paneCenters.forEach((cx, pIdx) => {
          rctx.fillRect(cx - paneW / 2, paneY, paneW, paneH);
          // 3 out of 4 panes softly glow warm amber/cyan at night
          if ((pIdx + rgb.r) % 4 !== 0) {
            ectx.fillStyle = (pIdx % 2 === 0) ? '#fde68a' : '#bae6fd';
            ectx.fillRect(cx - paneW / 2 + 2, paneY + 2, paneW - 4, paneH - 4);
          }
        });

        const tex = new THREE.CanvasTexture(c);
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        const roughTex = new THREE.CanvasTexture(rC);
        roughTex.needsUpdate = true;
        const emisTex = new THREE.CanvasTexture(eC);
        emisTex.encoding = THREE.sRGBEncoding;
        emisTex.needsUpdate = true;

        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughnessMap: roughTex,
          emissive: new THREE.Color(0xffffff),
          emissiveMap: emisTex,
          emissiveIntensity: 0.0,
          roughness: 1.0,
          metalness: 0.28,
          side: THREE.FrontSide,
          transparent: false,
          opacity: 1.0
        });
        exteriorFacadeMatCache[key] = mat;
        return mat;
      }

      function getInteriorWindowWallMaterial(wallColorHex) {
        const key = String(wallColorHex);
        if (interiorWindowMatCache[key]) return interiorWindowMatCache[key];

        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 256;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, 512, 256);

        const rgb = hexToRgbObj(wallColorHex);
        const inR = Math.min(245, Math.floor(rgb.r * 0.45 + 135));
        const inG = Math.min(245, Math.floor(rgb.g * 0.45 + 140));
        const inB = Math.min(250, Math.floor(rgb.b * 0.45 + 150));

        ctx.fillStyle = `rgba(${inR}, ${inG}, ${inB}, 1.0)`;
        ctx.fillRect(0, 0, 512, 256);

        ctx.fillStyle = 'rgba(30, 41, 59, 1.0)';
        ctx.fillRect(0, 0, 512, 42);
        ctx.fillRect(0, 194, 512, 62);
        ctx.fillStyle = 'rgba(71, 85, 105, 1.0)';
        ctx.fillRect(0, 188, 512, 8);

        const paneCenters = [73, 195, 317, 439];
        const paneW = 88;
        const paneH = 132;
        const paneY = 52;

        paneCenters.forEach((cx) => {
          const px = cx - paneW / 2;
          ctx.fillStyle = 'rgba(15, 23, 42, 1.0)';
          ctx.fillRect(px - 6, paneY - 6, paneW + 12, paneH + 12);

          ctx.clearRect(px, paneY, paneW, paneH);
          ctx.fillStyle = 'rgba(186, 230, 253, 0.15)';
          ctx.fillRect(px, paneY, paneW, paneH);

          ctx.fillStyle = 'rgba(15, 23, 42, 1.0)';
          ctx.fillRect(px, paneY + paneH / 2 - 2, paneW, 4);
          ctx.fillRect(cx - 2, paneY, 4, paneH);
        });

        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
          side: THREE.FrontSide,
          transparent: true,
          depthWrite: false
        });
        interiorWindowMatCache[key] = mat;
        return mat;
      }

      function addOneWayWallSegment(targetGroup, lx, ly, lz, sw, sh, sd, wallDir, wallColorHex, recordShootable = true, interiorTargetGroup = null) {
        const extMat = getExteriorFacadeMaterial(wallColorHex);
        const intMat = getInteriorWindowWallMaterial(wallColorHex);
        const inGrp = interiorTargetGroup || targetGroup;

        if (wallDir === 'south' || wallDir === 'north') {
          const planeGeo = new THREE.PlaneGeometry(sw, sh);
          const outSign = wallDir === 'south' ? 1 : -1;
          const outRotY = wallDir === 'south' ? 0 : Math.PI;
          const inRotY = wallDir === 'south' ? Math.PI : 0;

          const extMesh = new THREE.Mesh(planeGeo, extMat);
          extMesh.position.set(lx, ly, lz + outSign * 0.08);
          extMesh.rotation.y = outRotY;
          extMesh.castShadow = true;
          extMesh.receiveShadow = true;
          targetGroup.add(extMesh);
          if (recordShootable) shootableMeshes.push(extMesh);

          const intMesh = new THREE.Mesh(planeGeo, intMat);
          intMesh.position.set(lx, ly, lz - outSign * 0.08);
          intMesh.rotation.y = inRotY;
          inGrp.add(intMesh);
        } else if (wallDir === 'east' || wallDir === 'west') {
          const planeGeo = new THREE.PlaneGeometry(sd, sh);
          const outSign = wallDir === 'east' ? 1 : -1;
          const outRotY = wallDir === 'east' ? Math.PI / 2 : -Math.PI / 2;
          const inRotY = wallDir === 'east' ? -Math.PI / 2 : Math.PI / 2;

          const extMesh = new THREE.Mesh(planeGeo, extMat);
          extMesh.position.set(lx + outSign * 0.08, ly, lz);
          extMesh.rotation.y = outRotY;
          extMesh.castShadow = true;
          extMesh.receiveShadow = true;
          targetGroup.add(extMesh);
          if (recordShootable) shootableMeshes.push(extMesh);

          const intMesh = new THREE.Mesh(planeGeo, intMat);
          intMesh.position.set(lx - outSign * 0.08, ly, lz);
          intMesh.rotation.y = inRotY;
          inGrp.add(intMesh);
        }
      }

      const singleCeilingPanelGeo = new THREE.BoxGeometry(6.8, 0.14, 3.6);
      function addInteriorCeilingLights(targetGroup, w, d, ceilingY) {
        // Single merged glowing ceiling light panel per floor to keep WebGL draw calls ultra-low!
        const lightPanel = new THREE.Mesh(singleCeilingPanelGeo, interiorCeilingDiffuserMat);
        lightPanel.position.set(0, ceilingY, 0);
        targetGroup.add(lightPanel);
      }

      function populateThemedUpperFloor(fInteriorGroup, theme, f, w, d, accentColor) {
        const addItem = (bw, bh, bd, col, lx, ly, lz, basic) => {
          const mat = basic
            ? new THREE.MeshBasicMaterial({ color: col })
            : new THREE.MeshLambertMaterial({ color: col });
          const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat);
          m.position.set(lx, ly, lz);
          fInteriorGroup.add(m);
          return m;
        };

        if (theme === 'fire_station') {
          // Brass Fireman's Pole Hatch Ring & Safety Guard at local (6.0, -4.0) on floors 2F..5F!
          const hatchRing = new THREE.Mesh(
            new THREE.RingGeometry(0.55, 1.45, 24),
            new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
          );
          hatchRing.rotation.x = -Math.PI / 2;
          hatchRing.position.set(6.0, 0.42, -4.0);
          fInteriorGroup.add(hatchRing);

          const innerHole = new THREE.Mesh(
            new THREE.CircleGeometry(0.55, 20),
            new THREE.MeshBasicMaterial({ color: 0x090d16, side: THREE.DoubleSide })
          );
          innerHole.rotation.x = -Math.PI / 2;
          innerHole.position.set(6.0, 0.41, -4.0);
          fInteriorGroup.add(innerHole);
        }

        // Central decorative rug/runner on each upper floor
        addItem(Math.min(10.5, w * 0.52), 0.05, Math.min(8.5, d * 0.46), accentColor, -1.5, 0.39, 0, false);

        if (theme === 'esports' || theme === 'paintball_shop') {
          // Pro Gaming Pods, Dual Neon Streamer Screens & Trophy Showcase
          [-3.2, 3.2].forEach((rz, idx) => {
            addItem(6.8, 1.0, 1.8, 0x0f172a, -1.8, 0.72, rz, false);
            addItem(5.8, 1.15, 0.22, idx === 0 ? 0x22d3ee : 0xf43f5e, -1.8, 1.65, rz, true);
            [-2.0, 0, 2.0].forEach((cx) => {
              addItem(0.95, 1.25, 0.95, idx === 0 ? 0x0284c7 : 0xe11d48, -1.8 + cx, 0.85, rz + (idx === 0 ? -1.35 : 1.35), false);
            });
          });
          addItem(2.2, 2.2, 1.2, 0xa855f7, -w / 2 + 2.4, 1.3, 0, true);
        } else if (theme === 'diner' || theme === 'ice_cream' || theme === 'plaza_cafe' || theme === 'supermarket') {
          // Lively Upper-Floor Dining Lounge, Dessert Bar & Espresso Counter
          addItem(6.5, 1.2, 1.8, 0x78350f, -1.8, 0.82, -d / 2 + 2.4, false);
          addItem(6.1, 0.3, 1.5, accentColor, -1.8, 1.5, -d / 2 + 2.4, true);
          [[-4.2, 1.8], [0.8, 1.8]].forEach(([tx, tz]) => {
            addItem(2.6, 0.88, 2.2, 0xfef08a, tx, 0.66, tz, false);
            addItem(2.8, 0.95, 0.8, 0xef4444, tx, 0.7, tz - 1.5, false);
            addItem(2.8, 0.95, 0.8, 0xef4444, tx, 0.7, tz + 1.5, false);
          });
        } else if (theme === 'hospital' || theme === 'pharmacy') {
          // Upper-Floor Medical Suite, Diagnostic Scanner & Recovery Beds
          [[-3.8, -2.6], [-3.8, 2.6]].forEach(([bx, bz]) => {
            addItem(4.0, 0.85, 2.0, 0xf8fafc, bx, 0.65, bz, false);
            addItem(2.8, 0.16, 1.9, 0x38bdf8, bx + 0.4, 1.12, bz, false);
            addItem(0.7, 1.7, 0.7, 0x10b981, bx - 2.2, 1.05, bz, true);
          });
          addItem(3.6, 1.2, 1.8, 0x0284c7, 2.2, 0.8, 0, false);
        } else if (theme === 'bowling' || theme === 'skate_park' || theme === 'boxing_gym' || theme === 'dojo') {
          // Upper-Floor VIP Sports Lounge, Practice Mats & Trophy Wall
          addItem(7.2, 0.22, 5.4, 0xfacc15, -1.8, 0.44, 0, false);
          addItem(5.4, 1.0, 1.8, 0x1e293b, -1.8, 0.72, -d / 2 + 2.3, false);
          addItem(4.4, 1.8, 0.22, accentColor, -1.8, 2.2, -d / 2 + 1.2, true);
        } else if (theme === 'concert_hall' || theme === 'dj_club' || theme === 'record_shop') {
          // Upper-Floor Recording Studio, Mixing Console & Acoustic Stage
          addItem(6.4, 0.7, 4.2, 0x311042, -1.8, 0.55, -2.0, false);
          addItem(4.2, 1.15, 1.4, 0x0f172a, -1.8, 1.2, -2.0, false);
          addItem(3.8, 0.25, 1.1, 0xec4899, -1.8, 1.85, -2.0, true);
          addItem(5.2, 0.9, 1.6, 0xf43f5e, -1.8, 0.68, 3.0, false);
        } else if (theme === 'hotel') {
          // Luxury Hotel Suite: King Bed, Golden Headboard, Lounge Sofa & Balcony View
          addItem(4.6, 0.95, 3.8, 0xf8fafc, -2.8, 0.68, -2.2, false);
          addItem(4.4, 0.22, 2.6, 0xbe123c, -2.8, 1.22, -1.7, false);
          addItem(4.8, 2.1, 0.35, 0xd97706, -2.8, 1.25, -4.1, false);
          addItem(4.2, 0.95, 1.8, 0x1e293b, -1.8, 0.68, 3.2, false);
        } else {
          // Custom Civic / Science / Fashion / Gallery / Executive Floor
          if (f % 2 === 1) {
            addItem(Math.min(7.2, w * 0.42), 1.05, 2.8, accentColor, -1.8, 0.72, 0, false);
            addItem(4.6, 2.1, 0.22, 0x38bdf8, -1.8, 2.45, -d / 2 + 1.2, true);
          } else {
            [-3.0, 3.0].forEach((rz) => {
              addItem(5.0, 1.0, 1.7, 0x1e293b, -2.0, 0.7, rz, false);
              addItem(3.4, 0.9, 0.22, accentColor, -2.0, 1.55, rz, true);
            });
          }
        }
      }

      function addElevatorAndUpperFloors({
        id,
        title,
        group,
        worldX,
        worldZ,
        w,
        d,
        floorHeight,
        numLevels,
        floorLabels,
        localElevX,
        localElevZ,
        wallColor,
        accentColor,
        floorColor,
        buildFloor1ToN = true,
        topFloorType = 'sky_terrace',
        theme = 'generic'
      }) {
        const elevWorldX = worldX + localElevX;
        const elevWorldZ = worldZ + localElevZ;

        const interiorCullGroup = new THREE.Group();
        group.add(interiorCullGroup);

        const shaftGroup = new THREE.Group();
        shaftGroup.position.set(localElevX, 0, localElevZ);
        interiorCullGroup.add(shaftGroup);

        const totalElevH = (numLevels - 1) * floorHeight + 4.8;
        const shaftGlass = new THREE.Mesh(
          new THREE.BoxGeometry(4.4, totalElevH, 4.4),
          new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.18 })
        );
        shaftGlass.position.y = totalElevH / 2;
        shaftGroup.add(shaftGlass);

        [[-2.1, -2.1], [2.1, -2.1], [-2.1, 2.1], [2.1, 2.1]].forEach(([rx, rz]) => {
          const rail = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, totalElevH, 0.18),
            new THREE.MeshBasicMaterial({ color: accentColor })
          );
          rail.position.set(rx, totalElevH / 2, rz);
          shaftGroup.add(rail);
        });

        if (buildFloor1ToN) {
          for (let f = 1; f < numLevels; f++) {
            const fy = f * floorHeight;
            const isTopFloor = f === numLevels - 1;
            const fGroup = new THREE.Group();
            fGroup.position.y = fy;
            group.add(fGroup);

            const fInteriorGroup = new THREE.Group();
            fInteriorGroup.position.y = fy;
            interiorCullGroup.add(fInteriorGroup);

            const slab = new THREE.Mesh(
              new THREE.BoxGeometry(w - 0.5, 0.36, d - 0.5),
              new THREE.MeshLambertMaterial({ color: isTopFloor ? 0x1e293b : (floorColor || 0x334155) })
            );
            slab.position.y = 0.18;
            if (isTopFloor) {
              fGroup.add(slab);
            } else {
              fInteriorGroup.add(slab);
            }

            const callPad = new THREE.Mesh(
              new THREE.BoxGeometry(4.2, 0.42, 4.2),
              new THREE.MeshBasicMaterial({ color: accentColor })
            );
            callPad.position.set(localElevX, 0.21, localElevZ);
            if (isTopFloor) {
              fGroup.add(callPad);
            } else {
              fInteriorGroup.add(callPad);
            }

            const wallH = isTopFloor ? 2.4 : floorHeight;
            if (isTopFloor) {
              const railMat = new THREE.MeshLambertMaterial({
                color: wallColor,
                transparent: true,
                opacity: 0.42
              });
              const nWall = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, 0.3), railMat);
              nWall.position.set(0, wallH / 2, -d / 2);
              fGroup.add(nWall);

              const sWall = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, 0.3), railMat);
              sWall.position.set(0, wallH / 2, d / 2);
              fGroup.add(sWall);

              const wWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH, d), railMat);
              wWall.position.set(-w / 2, wallH / 2, 0);
              fGroup.add(wWall);

              const eWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH, d), railMat);
              eWall.position.set(w / 2, wallH / 2, 0);
              fGroup.add(eWall);
            } else {
              addOneWayWallSegment(fGroup, 0, wallH / 2, -d / 2, w, wallH, 0.3, 'north', wallColor, false, fInteriorGroup);
              addOneWayWallSegment(fGroup, 0, wallH / 2, d / 2, w, wallH, 0.3, 'south', wallColor, false, fInteriorGroup);
              addOneWayWallSegment(fGroup, -w / 2, wallH / 2, 0, 0.3, wallH, d, 'west', wallColor, false, fInteriorGroup);
              addOneWayWallSegment(fGroup, w / 2, wallH / 2, 0, 0.3, wallH, d, 'east', wallColor, false, fInteriorGroup);
              addInteriorCeilingLights(fInteriorGroup, w, d, wallH - 0.22);
            }

            const trim = new THREE.Mesh(
              new THREE.BoxGeometry(w + 0.5, 0.28, d + 0.5),
              new THREE.MeshBasicMaterial({ color: accentColor })
            );
            trim.position.set(0, 0.2, 0);
            fGroup.add(trim);

            if (isTopFloor && topFloorType === 'swimming_pool') {
              // =========================================================
              // METRO ROYAL HOTEL ALONE: 9F ROOFTOP SWIMMING POOL OASIS
              // (Helipad removed; spacious 16.8m x 12.4m 4-lane resort pool!)
              // =========================================================
              const deckOverlay = new THREE.Mesh(
                new THREE.BoxGeometry(w - 1.2, 0.08, d - 1.2),
                new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
              );
              deckOverlay.position.y = 0.38;
              fGroup.add(deckOverlay);

              const poolX = -2.2;
              const poolZ = 2.0;
              const poolW = 16.8;
              const poolD = 12.4;
              const rimThick = 0.48;
              const rimH = 1.12;

              const poolFloor = new THREE.Mesh(
                new THREE.BoxGeometry(poolW - 0.4, 0.1, poolD - 0.4),
                new THREE.MeshLambertMaterial({ color: 0x0369a1 })
              );
              poolFloor.position.set(poolX, 0.43, poolZ);
              fGroup.add(poolFloor);

              [-3.9, -1.3, 1.3, 3.9].forEach((lz) => {
                const laneLine = new THREE.Mesh(
                  new THREE.BoxGeometry(poolW - 2.2, 0.04, 0.22),
                  new THREE.MeshBasicMaterial({ color: 0x0f172a })
                );
                laneLine.position.set(poolX, 0.49, poolZ + lz);
                fGroup.add(laneLine);

                [-1, 1].forEach((endSign) => {
                  const tMark = new THREE.Mesh(
                    new THREE.BoxGeometry(0.22, 0.05, 0.9),
                    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
                  );
                  tMark.position.set(poolX + endSign * (poolW / 2 - 1.1), 0.49, poolZ + lz);
                  fGroup.add(tMark);
                });
              });

              const copingMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
              const tileLinerMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

              [-1, 1].forEach((zSign) => {
                const rimNS = new THREE.Mesh(
                  new THREE.BoxGeometry(poolW + rimThick * 2, rimH, rimThick),
                  copingMat
                );
                rimNS.position.set(poolX, 0.36 + rimH / 2, poolZ + zSign * (poolD / 2 + rimThick / 2));
                fGroup.add(rimNS);

                const linerNS = new THREE.Mesh(
                  new THREE.BoxGeometry(poolW, rimH - 0.1, 0.08),
                  tileLinerMat
                );
                linerNS.position.set(poolX, 0.36 + rimH / 2, poolZ + zSign * (poolD / 2 - 0.04));
                fGroup.add(linerNS);

                const ledStrip = new THREE.Mesh(
                  new THREE.BoxGeometry(poolW - 1.2, 0.1, 0.12),
                  new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
                );
                ledStrip.position.set(poolX, 0.68, poolZ + zSign * (poolD / 2 - 0.08));
                fGroup.add(ledStrip);
              });

              [-1, 1].forEach((xSign) => {
                const rimWE = new THREE.Mesh(
                  new THREE.BoxGeometry(rimThick, rimH, poolD),
                  copingMat
                );
                rimWE.position.set(poolX + xSign * (poolW / 2 + rimThick / 2), 0.36 + rimH / 2, poolZ);
                fGroup.add(rimWE);

                const linerWE = new THREE.Mesh(
                  new THREE.BoxGeometry(0.08, rimH - 0.1, poolD),
                  tileLinerMat
                );
                linerWE.position.set(poolX + xSign * (poolW / 2 - 0.04), 0.36 + rimH / 2, poolZ);
                fGroup.add(linerWE);
              });

              const poolWater = new THREE.Mesh(
                new THREE.BoxGeometry(poolW - 0.1, 0.82, poolD - 0.1),
                new THREE.MeshStandardMaterial({
                  color: 0x06b6d4,
                  roughness: 0.08,
                  metalness: 0.25,
                  transparent: true,
                  opacity: 0.76
                })
              );
              poolWater.position.set(poolX, 0.90, poolZ);
              fGroup.add(poolWater);
              window.__metroRoyalPoolWater = poolWater;

              const ladderMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
              [-0.45, 0.45].forEach((lzOff) => {
                const railPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.35, 8), ladderMat);
                railPost.position.set(poolX + poolW / 2 + 0.15, 1.05, poolZ + lzOff);
                fGroup.add(railPost);
              });
              [0.65, 0.92, 1.18].forEach((ry) => {
                const rung = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.92), ladderMat);
                rung.position.set(poolX + poolW / 2 + 0.05, ry, poolZ);
                fGroup.add(rung);
              });

              const loungerFrameMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
              const loungerCushionMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });
              [
                [-8.5, -8.2],
                [-3.5, -8.2],
                [1.5, -8.2]
              ].forEach(([lx, lz]) => {
                const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.32, 1.0), loungerFrameMat);
                base.position.set(lx, 0.56, lz);
                fGroup.add(base);

                const matCush = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.12, 0.9), loungerCushionMat);
                matCush.position.set(lx, 0.76, lz);
                fGroup.add(matCush);

                const headRest = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.9), loungerCushionMat);
                headRest.position.set(lx - 0.75, 0.98, lz);
                headRest.rotation.z = -0.35;
                fGroup.add(headRest);
              });

              [
                [-6.0, -8.2, 0xf43f5e],
                [-1.0, -8.2, 0x06b6d4]
              ].forEach(([ux, uz, uCol]) => {
                const uPole = new THREE.Mesh(
                  new THREE.CylinderGeometry(0.08, 0.1, 2.8, 8),
                  loungerFrameMat
                );
                uPole.position.set(ux, 1.75, uz);
                fGroup.add(uPole);

                const uCanopy = new THREE.Mesh(
                  new THREE.ConeGeometry(1.85, 0.65, 10),
                  new THREE.MeshLambertMaterial({ color: uCol })
                );
                uCanopy.position.set(ux, 3.15, uz);
                fGroup.add(uCanopy);
              });

              // 9F Sky Pool Diving Post & Springboard at South Edge of Pool (local x: -2.2, z: 9.0)
              const skyDivePost = new THREE.Mesh(
                new THREE.BoxGeometry(2.4, 2.6, 2.0),
                new THREE.MeshLambertMaterial({ color: 0x0284c7 })
              );
              skyDivePost.position.set(poolX, 1.65, poolZ + poolD / 2 + 1.1);
              fGroup.add(skyDivePost);

              const skySpringBoard = new THREE.Mesh(
                new THREE.BoxGeometry(1.3, 0.18, 3.8),
                new THREE.MeshBasicMaterial({ color: 0xfacc15 })
              );
              skySpringBoard.position.set(poolX, 3.0, poolZ + poolD / 2 - 0.5);
              fGroup.add(skySpringBoard);
              window.__skyPoolSpringBoardMesh = skySpringBoard;

              const poolSignTex = createSignTexture(
                'METRO ROYAL SKY POOL',
                '9F ROOFTOP SWIMMING POOL & SUN DECK',
                '#083344',
                '#22d3ee',
                '#ffffff'
              );
              const poolSign = new THREE.Mesh(
                new THREE.BoxGeometry(8.8, 1.5, 0.25),
                new THREE.MeshBasicMaterial({ map: poolSignTex })
              );
              poolSign.position.set(-2.0, 2.1, -d / 2 + 0.35);
              fGroup.add(poolSign);
            } else if (isTopFloor && topFloorType === 'helipad') {
              // ONLY emergency, civic, broadcast & high-security buildings get a Helipad!
              const padCenterX = localElevX > 0 ? -2.2 : 2.2;
              const helipadBase = new THREE.Mesh(
                new THREE.CylinderGeometry(5.2, 5.6, 0.24, 24),
                new THREE.MeshLambertMaterial({ color: 0x334155 })
              );
              helipadBase.position.set(padCenterX, 0.32, 0);
              fGroup.add(helipadBase);

              const helipadRing = new THREE.Mesh(
                new THREE.RingGeometry(3.8, 4.4, 24),
                new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
              );
              helipadRing.rotation.x = -Math.PI / 2;
              helipadRing.position.set(padCenterX, 0.46, 0);
              fGroup.add(helipadRing);

              const hMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
              const hLeft = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 3.8), hMat);
              hLeft.position.set(padCenterX - 1.3, 0.46, 0);
              fGroup.add(hLeft);

              const hRight = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 3.8), hMat);
              hRight.position.set(padCenterX + 1.3, 0.46, 0);
              fGroup.add(hRight);

              const hCross = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.06, 0.65), hMat);
              hCross.position.set(padCenterX, 0.46, 0);
              fGroup.add(hCross);

              [[-4.2, -4.2], [4.2, -4.2], [-4.2, 4.2], [4.2, 4.2]].forEach(([bx, bz]) => {
                const beacon = new THREE.Mesh(
                  new THREE.BoxGeometry(0.45, 0.45, 0.45),
                  new THREE.MeshBasicMaterial({ color: 0x22d3ee })
                );
                beacon.position.set(padCenterX + bx, 0.5, bz);
                fGroup.add(beacon);
              });
            } else if (isTopFloor) {
              // =========================================================
              // NON-HELIPAD BUILDINGS: LIVELY ROOFTOP SKY TERRACE, BISTRO
              // PATIO, NEON LOUNGE OR OBSERVATORY GARDEN (NO HELIPAD!)
              // =========================================================
              const centerX = localElevX > 0 ? -2.0 : 2.0;
              const turfDeck = new THREE.Mesh(
                new THREE.BoxGeometry(w - 2.2, 0.1, d - 2.2),
                new THREE.MeshLambertMaterial({
                  color: (theme === 'esports' || theme === 'dj_club' || theme === 'bowling' || theme === 'record_shop')
                    ? 0x1e1b4b
                    : 0x14532d
                })
              );
              turfDeck.position.set(0, 0.39, 0);
              fGroup.add(turfDeck);

              // Corner planter boxes with glowing ornamental shrubs
              const planterMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
              const shrubMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
              [
                [-w / 2 + 2.2, -d / 2 + 2.2],
                [w / 2 - 2.2, -d / 2 + 2.2],
                [-w / 2 + 2.2, d / 2 - 2.2]
              ].forEach(([px, pz]) => {
                if (Math.hypot(px - localElevX, pz - localElevZ) < 4.5) return;
                const pBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 2.4), planterMat);
                pBox.position.set(px, 0.72, pz);
                fGroup.add(pBox);
                const bush = new THREE.Mesh(new THREE.SphereGeometry(1.15, 10, 10), shrubMat);
                bush.position.set(px, 1.55, pz);
                fGroup.add(bush);
              });

              if (theme === 'planetarium' || theme === 'school' || theme === 'library' || theme === 'courthouse') {
                // Rooftop Observatory Dome & Starlight Viewing Terrace
                const dome = new THREE.Mesh(
                  new THREE.SphereGeometry(Math.min(4.6, w * 0.22), 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                  new THREE.MeshLambertMaterial({ color: accentColor, transparent: true, opacity: 0.78 })
                );
                dome.position.set(centerX, 0.42, 0);
                fGroup.add(dome);
              } else if (theme === 'esports' || theme === 'dj_club' || theme === 'bowling' || theme === 'record_shop' || theme === 'paintball_shop') {
                // Neon Cyber Lounge Pergola & Holo Stage on the Roof
                const stage = new THREE.Mesh(
                  new THREE.BoxGeometry(6.8, 0.36, 5.2),
                  new THREE.MeshLambertMaterial({ color: 0x0f172a })
                );
                stage.position.set(centerX, 0.56, 0);
                fGroup.add(stage);

                const neonArch = new THREE.Mesh(
                  new THREE.TorusGeometry(2.8, 0.22, 10, 24, Math.PI),
                  new THREE.MeshBasicMaterial({ color: accentColor })
                );
                neonArch.position.set(centerX, 0.7, -2.2);
                fGroup.add(neonArch);
              } else {
                // Open-Air Bistro Patio Tables & Colorful Sun Umbrellas
                const poleMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
                [
                  [centerX - 2.4, -2.2, 0xf43f5e],
                  [centerX + 2.2, 2.2, 0x38bdf8]
                ].forEach(([ux, uz, uCol]) => {
                  const tbl = new THREE.Mesh(
                    new THREE.CylinderGeometry(1.35, 1.35, 0.82, 12),
                    new THREE.MeshLambertMaterial({ color: 0xfef08a })
                  );
                  tbl.position.set(ux, 0.8, uz);
                  fGroup.add(tbl);

                  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), poleMat);
                  pole.position.set(ux, 1.7, uz);
                  fGroup.add(pole);

                  const canopy = new THREE.Mesh(
                    new THREE.ConeGeometry(1.9, 0.7, 10),
                    new THREE.MeshLambertMaterial({ color: uCol })
                  );
                  canopy.position.set(ux, 3.05, uz);
                  fGroup.add(canopy);
                });
              }
            } else {
              populateThemedUpperFloor(fInteriorGroup, theme, f, w, d, accentColor);
            }
          }
        }

        const groundCallPad = new THREE.Mesh(
          new THREE.BoxGeometry(4.2, 0.38, 4.2),
          new THREE.MeshBasicMaterial({ color: accentColor })
        );
        groundCallPad.position.set(localElevX, 0.2, localElevZ);
        group.add(groundCallPad);

        const cabGroup = new THREE.Group();
        const cabPlatform = new THREE.Mesh(
          new THREE.BoxGeometry(4.0, 0.36, 4.0),
          new THREE.MeshLambertMaterial({ color: accentColor })
        );
        cabPlatform.position.y = 0.18;
        cabGroup.add(cabPlatform);

        const cabRoof = new THREE.Mesh(
          new THREE.BoxGeometry(4.0, 0.25, 4.0),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        cabRoof.position.y = 4.2;
        cabGroup.add(cabRoof);

        cabGroup.position.set(elevWorldX, 0, elevWorldZ);
        worldGroup.add(cabGroup);

        const bldgRecord = {
          id,
          title,
          theme,
          x: worldX,
          z: worldZ,
          w,
          d,
          floorHeight,
          numLevels,
          floorLabels,
          topFloorType,
          elevX: elevWorldX,
          elevZ: elevWorldZ,
          currentY: 0,
          targetY: 0,
          currentFloorIndex: 0,
          speed: 15.5,
          cabGroup,
          interiorCullGroup
        };
        multiFloorBuildings.push(bldgRecord);
        return bldgRecord;
      }

      function addBoxCollider3D(cx, cz, sx, sz, minY, maxY, tag) {
        colliders.push({
          minX: cx - sx / 2,
          maxX: cx + sx / 2,
          minZ: cz - sz / 2,
          maxZ: cz + sz / 2,
          minY: minY || 0,
          maxY: maxY,
          tag: tag || 'solid'
        });
      }

      function buildHollowBuilding({
        group,
        worldX,
        worldZ,
        w,
        d,
        h,
        minY = 0,
        wallColor = 0xf8fafc,
        roofColor = 0x1e293b,
        doorSide = 'south',
        doorOffset = 0,
        doorWidth = 4.6,
        doorHeight = 4.2,
        doorColor = 0xd97706,
        transparentWalls = false,
        wallOpacity = 1.0,
        addCeiling = true,
        tag = 'building'
      }) {
        const wallThick = 0.8;
        const isFenceOnly = tag === 'rooftop_fence';
        const wallMat = new THREE.MeshLambertMaterial({
          color: wallColor,
          transparent: isFenceOnly ? true : false,
          opacity: isFenceOnly ? wallOpacity : 1.0
        });

        if (!isFenceOnly) {
          addInteriorCeilingLights(group, w, d, minY + h - 0.24);
        }

        function addWallSegment(lx, ly, lz, sw, sh, sd, wallDir) {
          if (sw <= 0.05 || sh <= 0.05 || sd <= 0.05) return;
          addBoxCollider3D(worldX + lx, worldZ + lz, sw, sd, minY + ly - sh / 2, minY + ly + sh / 2, tag);

          if (!isFenceOnly && sh >= h - 0.15 && wallDir) {
            addOneWayWallSegment(group, lx, minY + ly, lz, sw, sh, sd, wallDir, wallColor, true);
          } else {
            const m = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, sd), wallMat);
            m.position.set(lx, minY + ly, lz);
            group.add(m);
            shootableMeshes.push(m);
          }
        }

        if (!isFenceOnly) {
          const cornerPostGeo = new THREE.BoxGeometry(0.55, h, 0.55);
          const cornerPostMat = new THREE.MeshLambertMaterial({ color: wallColor });
          [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].forEach(([cx, cz]) => {
            const cp = new THREE.Mesh(cornerPostGeo, cornerPostMat);
            cp.position.set(cx, minY + h / 2, cz);
            group.add(cp);
          });
        }

        if (doorSide === 'north') {
          const leftW = (w / 2 + doorOffset) - doorWidth / 2;
          const rightW = (w / 2 - doorOffset) - doorWidth / 2;
          addWallSegment(-w / 2 + leftW / 2, h / 2, -d / 2, leftW, h, wallThick, 'north');
          addWallSegment(w / 2 - rightW / 2, h / 2, -d / 2, rightW, h, wallThick, 'north');
          addWallSegment(doorOffset, doorHeight + (h - doorHeight) / 2, -d / 2, doorWidth, h - doorHeight, wallThick, null);
        } else {
          addWallSegment(0, h / 2, -d / 2, w, h, wallThick, 'north');
        }

        if (doorSide === 'south') {
          const leftW = (w / 2 + doorOffset) - doorWidth / 2;
          const rightW = (w / 2 - doorOffset) - doorWidth / 2;
          addWallSegment(-w / 2 + leftW / 2, h / 2, d / 2, leftW, h, wallThick, 'south');
          addWallSegment(w / 2 - rightW / 2, h / 2, d / 2, rightW, h, wallThick, 'south');
          addWallSegment(doorOffset, doorHeight + (h - doorHeight) / 2, d / 2, doorWidth, h - doorHeight, wallThick, null);
        } else {
          addWallSegment(0, h / 2, d / 2, w, h, wallThick, 'south');
        }

        if (doorSide === 'west') {
          const leftD = (d / 2 + doorOffset) - doorWidth / 2;
          const rightD = (d / 2 - doorOffset) - doorWidth / 2;
          addWallSegment(-w / 2, h / 2, -d / 2 + leftD / 2, wallThick, h, leftD, 'west');
          addWallSegment(-w / 2, h / 2, d / 2 - rightD / 2, wallThick, h, rightD, 'west');
          addWallSegment(-w / 2, doorHeight + (h - doorHeight) / 2, doorOffset, wallThick, h - doorHeight, doorWidth, null);
        } else {
          addWallSegment(-w / 2, h / 2, 0, wallThick, h, d, 'west');
        }

        if (doorSide === 'east') {
          const leftD = (d / 2 + doorOffset) - doorWidth / 2;
          const rightD = (d / 2 - doorOffset) - doorWidth / 2;
          addWallSegment(w / 2, h / 2, -d / 2 + leftD / 2, wallThick, h, leftD, 'east');
          addWallSegment(w / 2, h / 2, d / 2 - rightD / 2, wallThick, h, rightD, 'east');
          addWallSegment(w / 2, doorHeight + (h - doorHeight) / 2, doorOffset, wallThick, h - doorHeight, doorWidth, null);
        } else {
          addWallSegment(w / 2, h / 2, 0, wallThick, h, d, 'east');
        }

        if (addCeiling) {
          const roof = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.4, 0.5, d + 0.4),
            new THREE.MeshLambertMaterial({ color: roofColor })
          );
          roof.position.set(0, minY + h + 0.25, 0);
          group.add(roof);
        }

        if (doorSide !== 'none') {
          const doorPivot = new THREE.Group();
          let dx = 0;
          let dz = 0;
          if (doorSide === 'south') { dx = doorOffset; dz = d / 2; }
          if (doorSide === 'north') { dx = doorOffset; dz = -d / 2; }
          if (doorSide === 'west') { dx = -w / 2; dz = doorOffset; }
          if (doorSide === 'east') { dx = w / 2; dz = doorOffset; }

          doorPivot.position.set(dx, minY, dz);
          if (doorSide === 'west' || doorSide === 'east') {
            doorPivot.rotation.y = Math.PI / 2;
          }
          group.add(doorPivot);

          const panelMat = new THREE.MeshLambertMaterial({ color: doorColor });
          const glassMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.55 });
          const leftPanel = new THREE.Group();
          const rightPanel = new THREE.Group();

          const lpMesh = new THREE.Mesh(new THREE.BoxGeometry(doorWidth / 2 - 0.1, doorHeight, 0.28), panelMat);
          lpMesh.position.set(-doorWidth / 4, doorHeight / 2, 0);
          leftPanel.add(lpMesh);

          const lpGlass = new THREE.Mesh(new THREE.BoxGeometry(doorWidth / 3, doorHeight * 0.55, 0.32), glassMat);
          lpGlass.position.set(-doorWidth / 4, doorHeight * 0.58, 0);
          leftPanel.add(lpGlass);

          const rpMesh = new THREE.Mesh(new THREE.BoxGeometry(doorWidth / 2 - 0.1, doorHeight, 0.28), panelMat);
          rpMesh.position.set(doorWidth / 4, doorHeight / 2, 0);
          rightPanel.add(rpMesh);

          const rpGlass = new THREE.Mesh(new THREE.BoxGeometry(doorWidth / 3, doorHeight * 0.55, 0.32), glassMat);
          rpGlass.position.set(doorWidth / 4, doorHeight * 0.58, 0);
          rightPanel.add(rpGlass);

          doorPivot.add(leftPanel);
          doorPivot.add(rightPanel);

          interactiveDoors.push({
            wx: worldX + dx,
            wy: minY,
            wz: worldZ + dz,
            leftPanel,
            rightPanel,
            openAmount: 0,
            slideMax: doorWidth * 0.46
          });
        }
      }
      // ------------------------------------------
      // 4B. TOWN HALL IN THE CITY CENTER (x: 0, z: -18)
      // ------------------------------------------
      const townHallGroup = new THREE.Group();
      townHallGroup.position.set(0, 0, -18);
      worldGroup.add(townHallGroup);

      const thFloor = new THREE.Mesh(
        new THREE.BoxGeometry(27.6, 0.35, 19.6),
        new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
      );
      thFloor.position.set(0, 0.18, 0);
      townHallGroup.add(thFloor);

      const thCarpet = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 0.38, 15.5),
        new THREE.MeshLambertMaterial({ color: 0xbe123c })
      );
      thCarpet.position.set(0, 0.19, 1.2);
      townHallGroup.add(thCarpet);

      const thDesk = new THREE.Mesh(
        new THREE.BoxGeometry(9.5, 1.35, 2.4),
        new THREE.MeshLambertMaterial({ color: 0x78350f })
      );
      thDesk.position.set(0, 0.85, -4.8);
      townHallGroup.add(thDesk);
      addBoxCollider3D(0, -22.8, 9.5, 2.4, 0, 2.2, 'town_hall_desk');

      [-8.5, 8.5].forEach((bx) => {
        const bench = new THREE.Mesh(
          new THREE.BoxGeometry(5.2, 0.85, 1.8),
          new THREE.MeshLambertMaterial({ color: 0xb45309 })
        );
        bench.position.set(bx, 0.6, 2.5);
        townHallGroup.add(bench);
      });

      buildHollowBuilding({
        group: townHallGroup,
        worldX: 0,
        worldZ: -18,
        w: 28,
        d: 20,
        h: 7.5,
        minY: 0,
        wallColor: 0xf8fafc,
        roofColor: 0x334155,
        doorSide: 'south',
        doorOffset: 0,
        doorWidth: 5.4,
        doorHeight: 4.5,
        doorColor: 0xb45309,
        addCeiling: false,
        tag: 'town_hall'
      });

      const pillarMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      [-10.5, -5.8, 5.8, 10.5].forEach((px) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 7.5, 12), pillarMat);
        col.position.set(px, 3.75, 10.8);
        townHallGroup.add(col);
      });

      const pediment = new THREE.Mesh(
        new THREE.BoxGeometry(28.8, 2.2, 3.2),
        new THREE.MeshLambertMaterial({ color: 0xd97706 })
      );
      pediment.position.set(0, 7.8, 9.8);
      townHallGroup.add(pediment);

      const clockFace = new THREE.Mesh(
        new THREE.PlaneGeometry(3.8, 3.8),
        new THREE.MeshBasicMaterial({ map: createClockTexture(), transparent: true })
      );
      clockFace.position.set(0, 7.8, 11.45);
      townHallGroup.add(clockFace);

      const thSignTex = createSignTexture('TOWN HALL', 'BLOCKY METRO CIVIC CENTER', '#1e293b', '#facc15', '#ffffff');
      const thSign = new THREE.Mesh(
        new THREE.BoxGeometry(15, 2.6, 0.4),
        new THREE.MeshBasicMaterial({ map: thSignTex })
      );
      thSign.position.set(0, 5.8, 10.6);
      townHallGroup.add(thSign);

      addElevatorAndUpperFloors({
        id: 'town_hall',
        title: '🏛️ Town Hall',
        group: townHallGroup,
        worldX: 0,
        worldZ: -18,
        w: 28,
        d: 20,
        floorHeight: 7.5,
        numLevels: 4,
        floorLabels: ['1F Civic Chamber', '2F Mayor Offices', '3F Council Archive', '4F Civic Helipad'],
        localElevX: 10.2,
        localElevZ: -6.2,
        wallColor: 0x38bdf8,
        accentColor: 0xfacc15,
        floorColor: 0xe2e8f0,
        buildFloor1ToN: true,
        topFloorType: 'helipad',
        theme: 'town_hall'
      });

      mapBuildings.push({ x: 0, z: -18, w: 28, d: 20, color: '#facc15', label: 'Town Hall' });

      // ------------------------------------------
      // 4B-2. TAXI STAND NEXT TO THE TOWN HALL (West of Town Hall at x: -18, z: 5)
      // ------------------------------------------
      const taxiStandGroup = new THREE.Group();
      taxiStandGroup.position.set(-18, 0, 5);
      worldGroup.add(taxiStandGroup);

      const tsCurb = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, 0.32, 13.5),
        new THREE.MeshLambertMaterial({ color: 0xfacc15 })
      );
      tsCurb.position.set(0, 0.16, 0);
      taxiStandGroup.add(tsCurb);

      [-4.8, 4.8].forEach((pz) => {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.25, 3.8, 10),
          new THREE.MeshLambertMaterial({ color: 0x0f172a })
        );
        post.position.set(-1.1, 1.9, pz);
        taxiStandGroup.add(post);
      });

      const tsCanopy = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.45, 11.5),
        new THREE.MeshLambertMaterial({ color: 0xfacc15 })
      );
      tsCanopy.position.set(-0.2, 3.9, 0);
      taxiStandGroup.add(tsCanopy);

      const tsSignTex = createSignTexture('TAXI STAND', 'OPERATIONAL CABS • PRESS [E]', '#0f172a', '#facc15', '#ffffff');
      const tsSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 1.8, 9.5),
        new THREE.MeshBasicMaterial({ map: tsSignTex })
      );
      tsSign.position.set(1.4, 4.9, 0);
      taxiStandGroup.add(tsSign);

      const tsBench = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 6.0),
        new THREE.MeshLambertMaterial({ color: 0x334155 })
      );
      tsBench.position.set(-0.6, 0.55, 0);
      taxiStandGroup.add(tsBench);
      addBoxCollider(-18.6, 5, 1.8, 10.5, 4.2, 'taxi_stand');

      // ------------------------------------------
      // 4C. BUILDINGS NEXT TO THE TOWN HALL (WALK-IN DOORS & INTERIORS!)
      // ------------------------------------------
      // 1) PAINTBALL PRO SHOP (East of Town Hall at x: 30, z: 6)
      const SHOP_POS = { x: 30, z: 6 };
      const GATE_BUTTON_POS = { x: 23.5, y: 1.5, z: 6 };

      const shopGroup = new THREE.Group();
      shopGroup.position.set(SHOP_POS.x, 0, SHOP_POS.z);
      worldGroup.add(shopGroup);

      const shopFloor = new THREE.Mesh(
        new THREE.BoxGeometry(15, 0.32, 16),
        new THREE.MeshLambertMaterial({ color: 0x312e81 })
      );
      shopFloor.position.set(3, 0.16, 0);
      shopGroup.add(shopFloor);

      const shopCenterGroup = new THREE.Group();
      shopCenterGroup.position.set(3, 0, 0);
      shopGroup.add(shopCenterGroup);

      buildHollowBuilding({
        group: shopCenterGroup,
        worldX: SHOP_POS.x + 3,
        worldZ: SHOP_POS.z,
        w: 15,
        d: 16,
        h: 7.0,
        minY: 0,
        wallColor: 0x4c1d95,
        roofColor: 0x1e1b4b,
        doorSide: 'west',
        doorOffset: 0,
        doorWidth: 5.0,
        doorHeight: 4.4,
        doorColor: 0xe879f9,
        addCeiling: false,
        tag: 'paintball_shop'
      });

      const shopCounter = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.3, 8.5),
        new THREE.MeshLambertMaterial({ color: 0x22d3ee })
      );
      shopCounter.position.set(3.2, 0.8, 0);
      shopCenterGroup.add(shopCounter);
      addBoxCollider3D(SHOP_POS.x + 6.2, SHOP_POS.z, 2.2, 8.5, 0, 2.0, 'shop_counter');

      [-5.5, 5.5].forEach((rz) => {
        const rack = new THREE.Mesh(
          new THREE.BoxGeometry(6.0, 2.4, 1.2),
          new THREE.MeshLambertMaterial({ color: 0xf43f5e })
        );
        rack.position.set(0, 1.35, rz);
        shopCenterGroup.add(rack);
      });

      const shopSignTex = createSignTexture(
        'PAINTBALL PRO SHOP',
        'WALK INSIDE OR PRESS GATE BUTTON ▶',
        '#2e1065',
        '#f472b6',
        '#ffffff'
      );
      const shopSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 2.8, 13.5),
        new THREE.MeshBasicMaterial({ map: shopSignTex })
      );
      shopSign.position.set(-4.8, 6.2, 0);
      shopGroup.add(shopSign);

      const gateArchGroup = new THREE.Group();
      gateArchGroup.position.set(-6.5, 0, 0);
      shopGroup.add(gateArchGroup);

      const archMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
      const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      const neonPinkMat = new THREE.MeshBasicMaterial({ color: 0xe879f9 });

      [-3.4, 3.4].forEach((pz) => {
        const gPost = new THREE.Mesh(new THREE.BoxGeometry(1.3, 6.2, 1.3), archMat);
        gPost.position.set(0, 3.1, pz);
        gateArchGroup.add(gPost);

        const strip = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.6, 0.3), neonCyanMat);
        strip.position.set(0, 3.1, pz);
        gateArchGroup.add(strip);
      });

      const archHeader = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 8.4), archMat);
      archHeader.position.set(0, 6.5, 0);
      gateArchGroup.add(archHeader);

      const archNeonTop = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 8.6), neonPinkMat);
      archNeonTop.position.set(0, 7.3, 0);
      gateArchGroup.add(archNeonTop);

      const pedBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 1.05, 1.3, 16),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      pedBase.position.set(GATE_BUTTON_POS.x, 0.65, GATE_BUTTON_POS.z);
      worldGroup.add(pedBase);

      const gateButtonMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 0.35, 16),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      gateButtonMesh.position.set(GATE_BUTTON_POS.x, 1.55, GATE_BUTTON_POS.z);
      worldGroup.add(gateButtonMesh);

      const beaconRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.16, 12, 32),
        new THREE.MeshBasicMaterial({ color: 0xe879f9 })
      );
      beaconRing.rotation.x = Math.PI / 2;
      beaconRing.position.set(GATE_BUTTON_POS.x, 11.5, GATE_BUTTON_POS.z);
      worldGroup.add(beaconRing);

      addElevatorAndUpperFloors({
        id: 'paintball_shop',
        title: '🎯 Paintball Pro Shop',
        group: shopCenterGroup,
        worldX: SHOP_POS.x + 3,
        worldZ: SHOP_POS.z,
        w: 15,
        d: 16,
        floorHeight: 7.0,
        numLevels: 4,
        floorLabels: ['1F Pro Gear Store', '2F Marker Armory', '3F Tactical Lounge', '4F Neon Sky Deck'],
        localElevX: 4.5,
        localElevZ: -5.0,
        wallColor: 0xc084fc,
        accentColor: 0xe879f9,
        floorColor: 0x312e81,
        buildFloor1ToN: true,
        topFloorType: 'sky_terrace',
        theme: 'paintball_shop'
      });

      mapBuildings.push({ x: SHOP_POS.x + 3, z: SHOP_POS.z, w: 15, d: 16, color: '#e879f9', label: 'Paintball Shop' });

      // 2) METRO PLAZA CAFE & BAKERY (West of Town Hall at x: -30, z: 6)
      const cafeGroup = new THREE.Group();
      cafeGroup.position.set(-30, 0, 6);
      worldGroup.add(cafeGroup);

      const cafeFloor = new THREE.Mesh(
        new THREE.BoxGeometry(15.6, 0.32, 15.6),
        new THREE.MeshLambertMaterial({ color: 0xfef3c7 })
      );
      cafeFloor.position.set(0, 0.16, 0);
      cafeGroup.add(cafeFloor);

      buildHollowBuilding({
        group: cafeGroup,
        worldX: -30,
        worldZ: 6,
        w: 16,
        d: 16,
        h: 7.5,
        minY: 0,
        wallColor: 0x0d9488,
        roofColor: 0x115e59,
        doorSide: 'east',
        doorOffset: 0,
        doorWidth: 4.8,
        doorHeight: 4.2,
        doorColor: 0xf59e0b,
        addCeiling: false,
        tag: 'plaza_cafe'
      });

      const cafeBar = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.3, 9.0),
        new THREE.MeshLambertMaterial({ color: 0x78350f })
      );
      cafeBar.position.set(-4.2, 0.8, 0);
      cafeGroup.add(cafeBar);
      addBoxCollider3D(-34.2, 6, 2.2, 9.0, 0, 2.0, 'cafe_bar');

      [[-1, -3.5], [-1, 3.5]].forEach(([tx, tz]) => {
        const tbl = new THREE.Mesh(
          new THREE.CylinderGeometry(1.4, 1.4, 0.9, 12),
          new THREE.MeshLambertMaterial({ color: 0xfacc15 })
        );
        tbl.position.set(tx, 0.6, tz);
        cafeGroup.add(tbl);
      });

      const cafeSignTex = createSignTexture('METRO PLAZA CAFE', 'ESPRESSO • PASTRIES • LOUNGE', '#134e4a', '#5eead4', '#ffffff');
      const cafeSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 2.4, 12.0),
        new THREE.MeshBasicMaterial({ map: cafeSignTex })
      );
      cafeSign.position.set(8.2, 5.6, 0);
      cafeGroup.add(cafeSign);

      addElevatorAndUpperFloors({
        id: 'plaza_cafe',
        title: '☕ Metro Plaza Cafe',
        group: cafeGroup,
        worldX: -30,
        worldZ: 6,
        w: 16,
        d: 16,
        floorHeight: 7.5,
        numLevels: 4,
        floorLabels: ['1F Espresso Bakery', '2F Tea Lounge', '3F Roastery Lab', '4F Rooftop Bistro Patio'],
        localElevX: -4.8,
        localElevZ: -4.8,
        wallColor: 0x2dd4bf,
        accentColor: 0x5eead4,
        floorColor: 0xfef3c7,
        buildFloor1ToN: true,
        topFloorType: 'sky_terrace',
        theme: 'plaza_cafe'
      });

      mapBuildings.push({ x: -30, z: 6, w: 16, d: 16, color: '#14b8a6', label: 'Plaza Cafe' });

      // 3) CIVIC ART GALLERY & MUSEUM (East of Town Hall at x: 30, z: -18)
      const galleryGroup = new THREE.Group();
      galleryGroup.position.set(30, 0, -18);
      worldGroup.add(galleryGroup);

      const galFloor = new THREE.Mesh(
        new THREE.BoxGeometry(15.6, 0.32, 17.6),
        new THREE.MeshLambertMaterial({ color: 0xf1f5f9 })
      );
      galFloor.position.set(0, 0.16, 0);
      galleryGroup.add(galFloor);

      buildHollowBuilding({
        group: galleryGroup,
        worldX: 30,
        worldZ: -18,
        w: 16,
        d: 18,
        h: 8.5,
        minY: 0,
        wallColor: 0x0284c7,
        roofColor: 0x0c4a6e,
        doorSide: 'south',
        doorOffset: 0,
        doorWidth: 4.8,
        doorHeight: 4.2,
        doorColor: 0x38bdf8,
        addCeiling: false,
        tag: 'art_gallery'
      });

      [[-3.5, -2, 0xf43f5e], [3.5, -2, 0xa855f7], [0, -5, 0xfacc15]].forEach(([sx, sz, col]) => {
        const ped = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 1.8), new THREE.MeshLambertMaterial({ color: 0x334155 }));
        ped.position.set(sx, 0.85, sz);
        galleryGroup.add(ped);
        const art = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.6, 1.1), new THREE.MeshBasicMaterial({ color: col }));
        art.position.set(sx, 2.35, sz);
        art.rotation.y = Math.PI / 4;
        galleryGroup.add(art);
      });

      const galSignTex = createSignTexture('CIVIC ART GALLERY', 'MODERN SCULPTURES & EXHIBITS', '#0c4a6e', '#38bdf8', '#ffffff');
      const galSign = new THREE.Mesh(
        new THREE.BoxGeometry(12.0, 2.4, 0.4),
        new THREE.MeshBasicMaterial({ map: galSignTex })
      );
      galSign.position.set(0, 5.8, 9.2);
      galleryGroup.add(galSign);

      addElevatorAndUpperFloors({
        id: 'art_gallery',
        title: '🎨 Civic Art Gallery',
        group: galleryGroup,
        worldX: 30,
        worldZ: -18,
        w: 16,
        d: 18,
        floorHeight: 8.5,
        numLevels: 4,
        floorLabels: ['1F Sculpture Hall', '2F Modern Canvas', '3F Digital Media', '4F Sculpture Sky Garden'],
        localElevX: 4.8,
        localElevZ: -5.8,
        wallColor: 0x38bdf8,
        accentColor: 0x38bdf8,
        floorColor: 0xf1f5f9,
        buildFloor1ToN: true,
        topFloorType: 'sky_terrace',
        theme: 'art_gallery'
      });

      mapBuildings.push({ x: 30, z: -18, w: 16, d: 18, color: '#38bdf8', label: 'Art Gallery' });

      // ------------------------------------------
      // 4D. THE VIOLET TOWER BEHIND THE PAINTBALL SHOP
      // (Centered at x: 74, z: 6 — 7 Walkable Floors + 7th Floor Playable Arcade + Rooftop Football Pitch + Working Elevator!)
      // ------------------------------------------
      const VIOLET_TOWER = {
        x: 74,
        z: 6,
        w: 32,
        d: 26,
        floorHeight: 6.0,
        numFloors: 7,
        terraceY: 42.0,
        elevX: 86.8,
        elevZ: 6.0
      };

      const violetTowerGroup = new THREE.Group();
      violetTowerGroup.position.set(VIOLET_TOWER.x, 0, VIOLET_TOWER.z);
      worldGroup.add(violetTowerGroup);

      // Clean Violet Tower Entrance Apron & Road Crosswalk (keeps the x=52 avenue continuous with zero road clipping/Z-fighting!)
      (function buildVioletTowerEntranceCrossing() {
        const violetStoneMat = new THREE.MeshStandardMaterial({
          color: 0x6d28d9,
          roughness: 0.62,
          metalness: 0.12
        });
        const crossingStripeMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.72,
          metalness: 0.04
        });
        const violetBorderMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          emissive: 0x581c87,
          emissiveIntensity: 0.28,
          roughness: 0.45
        });

        // Flush entrance mat strictly between road east edge (x=58) and Violet Tower lobby
        const lobbyApron = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 7.6), violetStoneMat);
        lobbyApron.position.set(59.3, 0.262, 6);
        lobbyApron.receiveShadow = true;
        worldGroup.add(lobbyApron);

        // Clean West Plaza curb transition (x=43.8, flush with Plaza edge x=44)
        const plazaCurb = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 7.6), violetStoneMat);
        plazaCurb.position.set(43.8, 0.275, 6);
        plazaCurb.receiveShadow = true;
        worldGroup.add(plazaCurb);

        // Crisp zebra crosswalk across x=52 avenue at z=6 (clear of road y=0.24 & yellow stripe y=0.26)
        [-2.4, -1.2, 0, 1.2, 2.4].forEach((dz) => {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.025, 0.68), crossingStripeMat);
          bar.position.set(51.4, 0.266, 6 + dz);
          bar.receiveShadow = true;
          worldGroup.add(bar);
        });
        [-3.45, 3.45].forEach((dz) => {
          const border = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.024, 0.26), violetBorderMat);
          border.position.set(51.4, 0.265, 6 + dz);
          border.receiveShadow = true;
          worldGroup.add(border);
        });
      })();

      const arcadeCabinets = [];
      const floorNames = [
        '1F GRAND VIOLET LOBBY',
        '2F CREATIVE OFFICES',
        '3F CYBER TECH LAB',
        '4F SKY FITNESS GYM',
        '5F VIOLET LOUNGE SUITES',
        '6F STARLIGHT CINEMA',
        '7F NEON ARCADE HALL'
      ];

      for (let f = 0; f < VIOLET_TOWER.numFloors; f++) {
        const fy = f * VIOLET_TOWER.floorHeight;
        const floorGroup = new THREE.Group();
        violetTowerGroup.add(floorGroup);

        const mainSlab = new THREE.Mesh(
          new THREE.BoxGeometry(26.4, 0.4, VIOLET_TOWER.d - 0.6),
          new THREE.MeshLambertMaterial({ color: f === 6 ? 0x1e1b4b : 0x2e1065 })
        );
        mainSlab.position.set(-2.5, fy + 0.2, 0);
        floorGroup.add(mainSlab);

        const sideSlabN = new THREE.Mesh(
          new THREE.BoxGeometry(4.8, 0.4, 9.6),
          new THREE.MeshLambertMaterial({ color: 0x4c1d95 })
        );
        sideSlabN.position.set(13.2, fy + 0.2, -7.6);
        floorGroup.add(sideSlabN);

        const sideSlabS = new THREE.Mesh(
          new THREE.BoxGeometry(4.8, 0.4, 4.6),
          new THREE.MeshLambertMaterial({ color: 0x4c1d95 })
        );
        sideSlabS.position.set(13.2, fy + 0.2, 10.35);
        floorGroup.add(sideSlabS);

        buildHollowBuilding({
          group: floorGroup,
          worldX: VIOLET_TOWER.x,
          worldZ: VIOLET_TOWER.z,
          w: VIOLET_TOWER.w,
          d: VIOLET_TOWER.d,
          h: VIOLET_TOWER.floorHeight,
          minY: fy,
          wallColor: f === 0 ? 0x4c1d95 : 0x6d28d9,
          roofColor: 0x3b0764,
          doorSide: f === 0 ? 'west' : 'none',
          doorOffset: 0,
          doorWidth: 5.6,
          doorHeight: 4.5,
          doorColor: 0xa855f7,
          transparentWalls: false,
          wallOpacity: 1.0,
          addCeiling: false,
          tag: 'violet_tower'
        });

        const neonBand = new THREE.Mesh(
          new THREE.BoxGeometry(VIOLET_TOWER.w + 0.6, 0.35, VIOLET_TOWER.d + 0.6),
          new THREE.MeshBasicMaterial({ color: f === 6 ? 0xf472b6 : 0xa78bfa })
        );
        neonBand.position.set(0, fy + VIOLET_TOWER.floorHeight, 0);
        floorGroup.add(neonBand);

        const fSignTex = createSignTexture(floorNames[f], 'ELEVATOR TO ALL FLOORS ▶', '#1e1b4b', '#c084fc', '#ffffff');
        const fSign = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1.6, 5.2),
          new THREE.MeshBasicMaterial({ map: fSignTex })
        );
        fSign.position.set(10.2, fy + 4.3, 0);
        floorGroup.add(fSign);

        if (f === 0) {
          const vDesk = new THREE.Mesh(
            new THREE.BoxGeometry(3.0, 1.3, 8.0),
            new THREE.MeshLambertMaterial({ color: 0xc084fc })
          );
          vDesk.position.set(2.0, fy + 0.85, 0);
          floorGroup.add(vDesk);

          [[-6, -7], [-6, 7]].forEach(([cx, cz]) => {
            const sofa = new THREE.Mesh(
              new THREE.BoxGeometry(6.0, 1.0, 2.2),
              new THREE.MeshLambertMaterial({ color: 0x9333ea })
            );
            sofa.position.set(cx, fy + 0.7, cz);
            floorGroup.add(sofa);
          });
        } else if (f === 1) {
          // 2F Creative Offices: Workstations & Glowing Monitors
          [[-7, -5], [-7, 5], [1, -5], [1, 5]].forEach(([tx, tz]) => {
            const desk = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.0, 2.0), new THREE.MeshLambertMaterial({ color: 0x334155 }));
            desk.position.set(tx, fy + 0.7, tz);
            floorGroup.add(desk);
            const mon = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.2), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
            mon.position.set(tx, fy + 1.55, tz);
            floorGroup.add(mon);
          });
        } else if (f === 2) {
          // 3F Cyber Tech Lab: Glowing Hologram Core & Server Racks
          const holoCore = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 3.6, 16), new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.65 }));
          holoCore.position.set(-3, fy + 2.1, 0);
          floorGroup.add(holoCore);
          [[-9, -7], [-9, 7], [3, -7], [3, 7]].forEach(([rx, rz]) => {
            const rack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.8, 1.6), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
            rack.position.set(rx, fy + 2.1, rz);
            floorGroup.add(rack);
          });
        } else if (f === 3) {
          // 4F Sky Fitness Gym: Treadmills, Workout Mats & Weight Racks
          [-7, -2, 3].forEach((gx) => {
            const mat = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 6.0), new THREE.MeshLambertMaterial({ color: 0x10b981 }));
            mat.position.set(gx, fy + 0.45, -4);
            floorGroup.add(mat);
            const tread = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 3.0), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
            tread.position.set(gx, fy + 1.0, 5.5);
            floorGroup.add(tread);
          });
        } else if (f === 4) {
          // 5F Violet Lounge Suites: Luxury Beds, Tables & Velvet Couches
          [[-7, -5], [2, -5]].forEach(([bx, bz]) => {
            const bed = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.9, 5.2), new THREE.MeshLambertMaterial({ color: 0xf43f5e }));
            bed.position.set(bx, fy + 0.65, bz);
            floorGroup.add(bed);
          });
          const loungeSofa = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.0, 2.2), new THREE.MeshLambertMaterial({ color: 0xa855f7 }));
          loungeSofa.position.set(-2.5, fy + 0.7, 6.5);
          floorGroup.add(loungeSofa);
        } else if (f === 5) {
          // 6F Starlight Cinema: Giant Movie Screen & Tiered Theater Seating
          const movieScreen = new THREE.Mesh(new THREE.BoxGeometry(16.0, 4.2, 0.25), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
          movieScreen.position.set(-3.0, fy + 2.8, -11.8);
          floorGroup.add(movieScreen);
          [-4, 1, 6].forEach((rz, rIdx) => {
            const rowSeat = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.9 + rIdx * 0.25, 1.8), new THREE.MeshLambertMaterial({ color: 0xbe123c }));
            rowSeat.position.set(-3.0, fy + 0.65 + rIdx * 0.12, rz);
            floorGroup.add(rowSeat);
          });
        } else if (f === 6) {
          const arcadeFloorGrid = new THREE.Mesh(
            new THREE.BoxGeometry(22, 0.08, 20),
            new THREE.MeshBasicMaterial({ color: 0x3b0764 })
          );
          arcadeFloorGrid.position.set(-3, fy + 0.42, 0);
          floorGroup.add(arcadeFloorGrid);

          const cabSpecs = [
            { lx: -9, lz: -8, rot: 0, title: 'Neon Brick Breaker DX', game: 'breaker', color: 0xe879f9 },
            { lx: -3, lz: -8, rot: 0, title: 'Cyber Pong 2099', game: 'pong', color: 0x22d3ee },
            { lx: 3, lz: -8, rot: 0, title: 'Space Block Invaders', game: 'invaders', color: 0x10b981 },
            { lx: -9, lz: 8, rot: Math.PI, title: 'Turbo Brick Smasher', game: 'breaker', color: 0xfacc15 },
            { lx: -3, lz: 8, rot: Math.PI, title: 'Hyper Neon Pong', game: 'pong', color: 0xf43f5e },
            { lx: 3, lz: 8, rot: Math.PI, title: 'Galaxy Defender Pro', game: 'invaders', color: 0xa855f7 }
          ];

          cabSpecs.forEach((cs) => {
            const cabGroup = new THREE.Group();
            cabGroup.position.set(cs.lx, fy + 0.4, cs.lz);
            cabGroup.rotation.y = cs.rot;

            const body = new THREE.Mesh(
              new THREE.BoxGeometry(2.0, 3.2, 1.6),
              new THREE.MeshLambertMaterial({ color: 0x0f172a })
            );
            body.position.y = 1.6;
            cabGroup.add(body);

            const sideTrim = new THREE.Mesh(
              new THREE.BoxGeometry(2.1, 3.3, 1.3),
              new THREE.MeshBasicMaterial({ color: cs.color })
            );
            sideTrim.position.y = 1.65;
            cabGroup.add(sideTrim);

            const screen = new THREE.Mesh(
              new THREE.BoxGeometry(1.6, 1.1, 0.15),
              new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
            );
            screen.position.set(0, 2.1, 0.82);
            screen.rotation.x = -0.2;
            cabGroup.add(screen);

            const deck = new THREE.Mesh(
              new THREE.BoxGeometry(1.8, 0.25, 0.7),
              new THREE.MeshLambertMaterial({ color: 0x1e293b })
            );
            deck.position.set(0, 1.35, 0.95);
            cabGroup.add(deck);

            const joy = new THREE.Mesh(
              new THREE.SphereGeometry(0.14, 8, 8),
              new THREE.MeshBasicMaterial({ color: 0xef4444 })
            );
            joy.position.set(-0.4, 1.55, 1.0);
            cabGroup.add(joy);

            floorGroup.add(cabGroup);
            arcadeCabinets.push({
              wx: VIOLET_TOWER.x + cs.lx,
              wy: fy + 0.4,
              wz: VIOLET_TOWER.z + cs.lz,
              title: cs.title,
              game: cs.game
            });
          });
        }
      }

      const vtSignTex = createSignTexture(
        'VIOLET TOWER',
        '7F NEON ARCADE • ROOFTOP FOOTBALL • ELEVATOR',
        '#2e1065',
        '#c084fc',
        '#ffffff'
      );
      const vtSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 3.2, 18.0),
        new THREE.MeshBasicMaterial({ map: vtSignTex })
      );
      vtSign.position.set(-VIOLET_TOWER.w / 2 - 0.3, 5.8, 0);
      violetTowerGroup.add(vtSign);

      // ==========================================
      // TERRACE ROOFTOP FOOTBALL PITCH (y = 42.0) — NO AI BOTS!
      // ==========================================
      const terraceY = VIOLET_TOWER.terraceY;
      const terraceGroup = new THREE.Group();
      terraceGroup.position.set(0, terraceY, 0);
      violetTowerGroup.add(terraceGroup);

      const turfMain = new THREE.Mesh(
        new THREE.BoxGeometry(26.4, 0.4, VIOLET_TOWER.d - 0.6),
        new THREE.MeshLambertMaterial({ color: 0x15803d })
      );
      turfMain.position.set(-2.5, 0.2, 0);
      terraceGroup.add(turfMain);

      const turfSideN = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 0.4, 9.6),
        new THREE.MeshLambertMaterial({ color: 0x166534 })
      );
      turfSideN.position.set(13.2, 0.2, -7.6);
      terraceGroup.add(turfSideN);

      const turfSideS = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 0.4, 4.6),
        new THREE.MeshLambertMaterial({ color: 0x166534 })
      );
      turfSideS.position.set(13.2, 0.2, 10.35);
      terraceGroup.add(turfSideS);

      const lineWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const midLine = new THREE.Mesh(new THREE.BoxGeometry(19.0, 0.06, 0.25), lineWhiteMat);
      midLine.position.set(-3.0, 0.43, 0);
      terraceGroup.add(midLine);

      const centerCircle = new THREE.Mesh(
        new THREE.RingGeometry(2.6, 2.85, 24),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      centerCircle.rotation.x = -Math.PI / 2;
      centerCircle.position.set(-3.0, 0.44, 0);
      terraceGroup.add(centerCircle);

      [
        { gz: -10.8, color: 0x22d3ee },
        { gz: 10.8, color: 0xf43f5e }
      ].forEach((gSpec) => {
        const goalGroup = new THREE.Group();
        goalGroup.position.set(-3.0, 0.4, gSpec.gz);
        const postMat = new THREE.MeshBasicMaterial({ color: gSpec.color });

        [-3.4, 3.4].forEach((px) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 3.0, 8), postMat);
          post.position.set(px, 1.5, 0);
          goalGroup.add(post);
        });
        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.24, 0.24), postMat);
        crossbar.position.set(0, 3.0, 0);
        goalGroup.add(crossbar);

        const netMesh = new THREE.Mesh(
          new THREE.BoxGeometry(6.8, 2.9, 1.4),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 })
        );
        netMesh.position.set(0, 1.45, gSpec.gz < 0 ? -0.7 : 0.7);
        goalGroup.add(netMesh);

        terraceGroup.add(goalGroup);
      });

      buildHollowBuilding({
        group: terraceGroup,
        worldX: VIOLET_TOWER.x,
        worldZ: VIOLET_TOWER.z,
        w: VIOLET_TOWER.w,
        d: VIOLET_TOWER.d,
        h: 3.2,
        minY: terraceY,
        wallColor: 0x38bdf8,
        roofColor: 0x38bdf8,
        doorSide: 'none',
        transparentWalls: true,
        wallOpacity: 0.25,
        addCeiling: false,
        tag: 'rooftop_fence'
      });

      const elevHood = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 5.2, 6.2),
        new THREE.MeshLambertMaterial({ color: 0x4c1d95, transparent: true, opacity: 0.55 })
      );
      elevHood.position.set(12.8, 2.6, 0);
      terraceGroup.add(elevHood);

      const soccerBallTexture = (function createSoccerBallTex() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = '#0f172a';
        for (let r = 0; r < 4; r++) {
          for (let col = 0; col < 8; col++) {
            const cx = col * 32 + (r % 2 === 0 ? 16 : 0);
            const cy = r * 32 + 16;
            ctx.beginPath();
            for (let k = 0; k < 5; k++) {
              const a = (k * Math.PI * 2) / 5 - Math.PI / 2;
              const px = cx + Math.cos(a) * 9.5;
              const py = cy + Math.sin(a) * 9.5;
              if (k === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
          }
        }
        const t = new THREE.CanvasTexture(c);
        t.encoding = THREE.sRGBEncoding;
        return t;
      })();

      const soccerBallPbrMat = new THREE.MeshStandardMaterial({
        map: soccerBallTexture,
        roughness: 0.38,
        metalness: 0.05
      });

      const footballGroup = new THREE.Group();
      const ballGeoSmooth = new THREE.SphereGeometry(0.55, 20, 16);
      ballGeoSmooth.computeVertexNormals();
      const ballSphere = new THREE.Mesh(ballGeoSmooth, soccerBallPbrMat);
      ballSphere.castShadow = true;
      ballSphere.receiveShadow = true;
      footballGroup.add(ballSphere);
      scene.add(footballGroup);

      const rooftopFootball = {
        mesh: footballGroup,
        x: VIOLET_TOWER.x - 3.0,
        y: terraceY + 0.95,
        z: VIOLET_TOWER.z,
        vx: 0,
        vy: 0,
        vz: 0,
        scoreBlue: 0,
        scoreRed: 0
      };
      footballGroup.position.set(rooftopFootball.x, rooftopFootball.y, rooftopFootball.z);

      function resetRooftopFootball() {
        rooftopFootball.x = VIOLET_TOWER.x - 3.0;
        rooftopFootball.y = terraceY + 1.2;
        rooftopFootball.z = VIOLET_TOWER.z;
        rooftopFootball.vx = 0;
        rooftopFootball.vy = 0;
        rooftopFootball.vz = 0;
        footballGroup.position.set(rooftopFootball.x, rooftopFootball.y, rooftopFootball.z);
      }

      // ------------------------------------------
      // 4D-2. BIGGER GROUND-LEVEL FOOTBALL STADIUM BEHIND INDOOR SKATE & PARKOUR
      // (Centered at x: 196, z: 80 — Directly East/Behind Skate & Parkour at x: 135, z: 80!)
      // ------------------------------------------
      const STADIUM_PITCH = {
        x: 196,
        z: 80,
        w: 52,
        d: 76,
        halfW: 24,
        halfD: 35,
        goalHalfW: 5.8
      };

      const stadiumGroup = new THREE.Group();
      stadiumGroup.position.set(STADIUM_PITCH.x, 0, STADIUM_PITCH.z);
      worldGroup.add(stadiumGroup);

      const skateToStadiumPath = new THREE.Mesh(
        new THREE.BoxGeometry(36, 0.21, 14),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 })
      );
      skateToStadiumPath.position.set(162, 0.105, 80);
      worldGroup.add(skateToStadiumPath);

      const stadiumTurf = new THREE.Mesh(
        new THREE.BoxGeometry(STADIUM_PITCH.w, 0.3, STADIUM_PITCH.d),
        new THREE.MeshLambertMaterial({ color: 0x15803d })
      );
      stadiumTurf.position.set(0, 0.15, 0);
      stadiumGroup.add(stadiumTurf);
      shootableMeshes.push(stadiumTurf);

      for (let st = -3; st <= 3; st++) {
        if (st % 2 === 0) continue;
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(STADIUM_PITCH.w - 4, 0.32, 8.5),
          new THREE.MeshLambertMaterial({ color: 0x166534 })
        );
        stripe.position.set(0, 0.16, st * 9.2);
        stadiumGroup.add(stripe);
      }

      const stMidLine = new THREE.Mesh(new THREE.BoxGeometry(STADIUM_PITCH.w - 4, 0.06, 0.35), lineWhiteMat);
      stMidLine.position.set(0, 0.34, 0);
      stadiumGroup.add(stMidLine);

      const stCenterCircle = new THREE.Mesh(
        new THREE.RingGeometry(5.5, 5.9, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      stCenterCircle.rotation.x = -Math.PI / 2;
      stCenterCircle.position.set(0, 0.35, 0);
      stadiumGroup.add(stCenterCircle);

      [
        { gz: -STADIUM_PITCH.halfD, color: 0x22d3ee },
        { gz: STADIUM_PITCH.halfD, color: 0xf43f5e }
      ].forEach((gSpec) => {
        const gGrp = new THREE.Group();
        gGrp.position.set(0, 0.3, gSpec.gz);
        const pMat = new THREE.MeshBasicMaterial({ color: gSpec.color });

        [-STADIUM_PITCH.goalHalfW, STADIUM_PITCH.goalHalfW].forEach((px) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 4.2, 10), pMat);
          post.position.set(px, 2.1, 0);
          gGrp.add(post);
        });

        const bar = new THREE.Mesh(new THREE.BoxGeometry(STADIUM_PITCH.goalHalfW * 2 + 0.4, 0.32, 0.32), pMat);
        bar.position.set(0, 4.2, 0);
        gGrp.add(bar);

        const net = new THREE.Mesh(
          new THREE.BoxGeometry(STADIUM_PITCH.goalHalfW * 2, 4.1, 2.6),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.24 })
        );
        net.position.set(0, 2.05, gSpec.gz < 0 ? -1.3 : 1.3);
        gGrp.add(net);

        stadiumGroup.add(gGrp);
      });

      [1, 2, 3].forEach((tier) => {
        const bleacher = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, tier * 1.1, STADIUM_PITCH.d - 8),
          new THREE.MeshLambertMaterial({ color: tier % 2 === 0 ? 0x38bdf8 : 0x1e293b })
        );
        bleacher.position.set(STADIUM_PITCH.w / 2 + tier * 2.3, (tier * 1.1) / 2, 0);
        stadiumGroup.add(bleacher);
      });

      const stSignTex = createSignTexture(
        'METRO FOOTBALL STADIUM',
        'CHAMPIONSHIP PITCH BEHIND SKATE & PARKOUR',
        '#064e3b',
        '#34d399',
        '#ffffff'
      );
      const stSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 3.4, 22.0),
        new THREE.MeshBasicMaterial({ map: stSignTex })
      );
      stSign.position.set(-STADIUM_PITCH.w / 2 - 0.5, 5.2, 0);
      stadiumGroup.add(stSign);

      const stadiumBallGroup = new THREE.Group();
      const stBallGeoSmooth = new THREE.SphereGeometry(0.75, 22, 18);
      stBallGeoSmooth.computeVertexNormals();
      const stBallSphere = new THREE.Mesh(stBallGeoSmooth, soccerBallPbrMat);
      stBallSphere.castShadow = true;
      stBallSphere.receiveShadow = true;
      stadiumBallGroup.add(stBallSphere);
      scene.add(stadiumBallGroup);

      const stadiumFootball = {
        mesh: stadiumBallGroup,
        x: STADIUM_PITCH.x,
        y: 1.05,
        z: STADIUM_PITCH.z,
        vx: 0,
        vy: 0,
        vz: 0
      };
      stadiumBallGroup.position.set(stadiumFootball.x, stadiumFootball.y, stadiumFootball.z);

      function resetStadiumFootball() {
        stadiumFootball.x = STADIUM_PITCH.x;
        stadiumFootball.y = 1.4;
        stadiumFootball.z = STADIUM_PITCH.z;
        stadiumFootball.vx = 0;
        stadiumFootball.vy = 0;
        stadiumFootball.vz = 0;
        stadiumBallGroup.position.set(stadiumFootball.x, stadiumFootball.y, stadiumFootball.z);
      }

      mapBuildings.push({
        x: STADIUM_PITCH.x,
        z: STADIUM_PITCH.z,
        w: STADIUM_PITCH.w,
        d: STADIUM_PITCH.d,
        color: '#16a34a',
        label: 'Football Stadium'
      });

      // ------------------------------------------
      // 4D-3. GRAND INDOOR SWIMMING POOL & AQUATIC CENTER
      // (Located at x: 196, z: -80 — Directly Behind Metro Barber & Hair Salon at x: 135, z: -80,
      //  and connected via the East Sports Boulevard to the Outside Football Ground at x: 196, z: 80!)
      // ------------------------------------------
      const INDOOR_POOL_CENTER = {
        x: 196,
        z: -80,
        w: 50,
        d: 60,
        h: 11.5,
        poolW: 32.0,
        poolD: 40.0,
        halfW: 15.6,
        halfD: 19.6,
        deckY: 0.36,
        waterSurfaceY: 1.28
      };

      // Paved walkway connecting behind the Barber (x: 135, z: -80) to the Indoor Pool (x: 196, z: -80)
      const barberToPoolPath = new THREE.Mesh(
        new THREE.BoxGeometry(36, 0.21, 16),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 })
      );
      barberToPoolPath.position.set(162, 0.105, -80);
      worldGroup.add(barberToPoolPath);

      // Paved Sports Boulevard connecting the Outside Football Ground (x: 196, z: 80) to the Indoor Pool (x: 196, z: -80)
      const stadiumToPoolBoulevard = new THREE.Mesh(
        new THREE.BoxGeometry(18, 0.19, 100),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.86 })
      );
      stadiumToPoolBoulevard.position.set(196, 0.095, 0);
      worldGroup.add(stadiumToPoolBoulevard);

      const indoorPoolGroup = new THREE.Group();
      indoorPoolGroup.position.set(INDOOR_POOL_CENTER.x, 0, INDOOR_POOL_CENTER.z);
      worldGroup.add(indoorPoolGroup);

      // Tiled Surrounding Pool Deck (North, South, East, West walkways around the sunken water basin)
      const ipDeckMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
      [
        [0, 0.18, -25.0, INDOOR_POOL_CENTER.w - 0.6, 0.36, 9.6],
        [0, 0.18, 25.0, INDOOR_POOL_CENTER.w - 0.6, 0.36, 9.6],
        [-20.2, 0.18, 0, 8.8, 0.36, 40.4],
        [20.2, 0.18, 0, 8.8, 0.36, 40.4]
      ].forEach(([dx, dy, dz, dw, dh, dd]) => {
        const dSeg = new THREE.Mesh(new THREE.BoxGeometry(dw, dh, dd), ipDeckMat);
        dSeg.position.set(dx, dy, dz);
        indoorPoolGroup.add(dSeg);
      });

      // Sunken Olympic Pool Floor & 6 Racing Lanes
      const ipBasinFloor = new THREE.Mesh(
        new THREE.BoxGeometry(INDOOR_POOL_CENTER.poolW, 0.16, INDOOR_POOL_CENTER.poolD),
        new THREE.MeshLambertMaterial({ color: 0x0369a1 })
      );
      ipBasinFloor.position.set(0, 0.14, 0);
      indoorPoolGroup.add(ipBasinFloor);

      [-12.5, -7.5, -2.5, 2.5, 7.5, 12.5].forEach((lx) => {
        const lLine = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.05, INDOOR_POOL_CENTER.poolD - 3.0),
          new THREE.MeshBasicMaterial({ color: 0x0f172a })
        );
        lLine.position.set(lx, 0.25, 0);
        indoorPoolGroup.add(lLine);

        // Floating lane rope buoys
        const rope = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.12, INDOOR_POOL_CENTER.poolD - 1.0),
          new THREE.MeshBasicMaterial({ color: lx === -2.5 || lx === 2.5 ? 0xfacc15 : 0x38bdf8 })
        );
        rope.position.set(lx + 2.5, 1.28, 0);
        indoorPoolGroup.add(rope);

        // Starting dive blocks at the North end
        const block = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 0.75, 1.4),
          new THREE.MeshLambertMaterial({ color: 0xf8fafc })
        );
        block.position.set(lx, 0.75, -INDOOR_POOL_CENTER.poolD / 2 - 0.9);
        indoorPoolGroup.add(block);
      });

      // Marble Pool Coping Rims & Glowing Underwater LED Strips
      const ipCopingMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const ipLedMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
      [-1, 1].forEach((zSign) => {
        const rimNS = new THREE.Mesh(
          new THREE.BoxGeometry(INDOOR_POOL_CENTER.poolW + 1.2, 0.95, 0.6),
          ipCopingMat
        );
        rimNS.position.set(0, 0.65, zSign * (INDOOR_POOL_CENTER.poolD / 2 + 0.3));
        indoorPoolGroup.add(rimNS);

        const ledNS = new THREE.Mesh(
          new THREE.BoxGeometry(INDOOR_POOL_CENTER.poolW - 1.0, 0.14, 0.14),
          ipLedMat
        );
        ledNS.position.set(0, 0.95, zSign * (INDOOR_POOL_CENTER.poolD / 2 - 0.08));
        indoorPoolGroup.add(ledNS);
      });

      [-1, 1].forEach((xSign) => {
        const rimWE = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.95, INDOOR_POOL_CENTER.poolD),
          ipCopingMat
        );
        rimWE.position.set(xSign * (INDOOR_POOL_CENTER.poolW / 2 + 0.3), 0.65, 0);
        indoorPoolGroup.add(rimWE);
      });

      // Translucent Animated Olympic Pool Water Volume
      const indoorPoolWater = new THREE.Mesh(
        new THREE.BoxGeometry(INDOOR_POOL_CENTER.poolW - 0.2, 1.05, INDOOR_POOL_CENTER.poolD - 0.2),
        new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          roughness: 0.08,
          metalness: 0.25,
          transparent: true,
          opacity: 0.76
        })
      );
      indoorPoolWater.position.set(0, 0.78, 0);
      indoorPoolGroup.add(indoorPoolWater);
      window.__indoorOlympicPoolWater = indoorPoolWater;

      // 3m & 5m Diving Post & Springboard at the South End of the Indoor Pool (world x: 196, z: -57.6)
      const diveTower = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 4.2, 2.6),
        new THREE.MeshLambertMaterial({ color: 0x0284c7 })
      );
      diveTower.position.set(0, 2.2, INDOOR_POOL_CENTER.poolD / 2 + 2.4);
      indoorPoolGroup.add(diveTower);

      // Glowing Call Pad at the Diving Post so player knows where to press [E]
      const divePostPad = new THREE.Mesh(
        new THREE.RingGeometry(1.5, 2.3, 24),
        new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide })
      );
      divePostPad.rotation.x = -Math.PI / 2;
      divePostPad.position.set(0, 0.42, INDOOR_POOL_CENTER.poolD / 2 + 2.4);
      indoorPoolGroup.add(divePostPad);

      const springBoard = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.22, 5.2),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      springBoard.position.set(0, 4.35, INDOOR_POOL_CENTER.poolD / 2 - 0.1);
      indoorPoolGroup.add(springBoard);
      window.__indoorSpringBoardMesh = springBoard;

      // East Deck Spectator Bleachers & West Deck Smoothie/Snack Bar (+Hunger & +HP!)
      [1, 2].forEach((tier) => {
        const bench = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, tier * 0.85, 28.0),
          new THREE.MeshLambertMaterial({ color: tier === 1 ? 0x0284c7 : 0x38bdf8 })
        );
        bench.position.set(19.5 + tier * 1.9, (tier * 0.85) / 2 + 0.36, 0);
        indoorPoolGroup.add(bench);
      });

      const poolSnackBar = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.35, 10.0),
        new THREE.MeshLambertMaterial({ color: 0xec4899 })
      );
      poolSnackBar.position.set(-21.2, 1.0, -14.0);
      indoorPoolGroup.add(poolSnackBar);

      // Walk-in Hollow Building Enclosure with West Entrance (facing Barber) & South Entrance (facing Football Stadium)
      buildHollowBuilding({
        group: indoorPoolGroup,
        worldX: INDOOR_POOL_CENTER.x,
        worldZ: INDOOR_POOL_CENTER.z,
        w: INDOOR_POOL_CENTER.w,
        d: INDOOR_POOL_CENTER.d,
        h: INDOOR_POOL_CENTER.h,
        minY: 0,
        wallColor: 0x0284c7,
        roofColor: 0x0c4a6e,
        doorSide: 'west',
        doorOffset: 0,
        doorWidth: 7.2,
        doorHeight: 5.2,
        doorColor: 0x22d3ee,
        addCeiling: true,
        tag: 'indoor_swimming_pool'
      });

      // Skylight Roof Trusses & Exterior Neon Signage
      const ipSignTex = createSignTexture(
        'GRAND INDOOR SWIMMING POOL',
        'OLYMPIC 6-LANE POOL • DIVING BOARD • SMOOTHIE BAR',
        '#083344',
        '#22d3ee',
        '#ffffff'
      );
      const ipSignWest = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 3.2, 22.0),
        new THREE.MeshBasicMaterial({ map: ipSignTex })
      );
      ipSignWest.position.set(-INDOOR_POOL_CENTER.w / 2 - 0.4, 7.6, 0);
      indoorPoolGroup.add(ipSignWest);

      const ipSignSouth = new THREE.Mesh(
        new THREE.BoxGeometry(22.0, 3.2, 0.5),
        new THREE.MeshBasicMaterial({ map: ipSignTex })
      );
      ipSignSouth.position.set(0, 7.6, INDOOR_POOL_CENTER.d / 2 + 0.4);
      indoorPoolGroup.add(ipSignSouth);

      // Register in multiFloorBuildings so indoor lighting, getBuildingAtXZ, and [E] Pool Activity work inside!
      multiFloorBuildings.push({
        id: 'indoor_aquatic_center',
        title: '🏊 GRAND INDOOR SWIMMING POOL',
        theme: 'indoor_pool',
        x: INDOOR_POOL_CENTER.x,
        z: INDOOR_POOL_CENTER.z,
        w: INDOOR_POOL_CENTER.w,
        d: INDOOR_POOL_CENTER.d,
        floorHeight: INDOOR_POOL_CENTER.h,
        numLevels: 1,
        floorLabels: ['1F Olympic Indoor Pool & Smoothie Bar'],
        topFloorType: 'sky_terrace',
        elevX: INDOOR_POOL_CENTER.x - 22,
        elevZ: INDOOR_POOL_CENTER.z - 25,
        currentY: 0,
        targetY: 0,
        currentFloorIndex: 0,
        speed: 15.5,
        cabGroup: null,
        interiorCullGroup: null
      });

      mapBuildings.push({
        x: INDOOR_POOL_CENTER.x,
        z: INDOOR_POOL_CENTER.z,
        w: INDOOR_POOL_CENTER.w,
        d: INDOOR_POOL_CENTER.d,
        color: '#06b6d4',
        label: 'Indoor Pool'
      });

      const elevatorState = addElevatorAndUpperFloors({
        id: 'violet_tower',
        title: '🟣 Violet Tower',
        group: violetTowerGroup,
        worldX: VIOLET_TOWER.x,
        worldZ: VIOLET_TOWER.z,
        w: VIOLET_TOWER.w,
        d: VIOLET_TOWER.d,
        floorHeight: VIOLET_TOWER.floorHeight,
        numLevels: 8,
        floorLabels: [
          '1F Lobby',
          '2F Offices',
          '3F Tech Lab',
          '4F Sky Gym',
          '5F Suites',
          '6F Cinema',
          '7F Arcade',
          '⚽ Terrace'
        ],
        localElevX: 12.8,
        localElevZ: 0,
        wallColor: 0x6d28d9,
        accentColor: 0xc084fc,
        floorColor: 0x2e1065,
        buildFloor1ToN: false
      });

      mapBuildings.push({
        x: VIOLET_TOWER.x,
        z: VIOLET_TOWER.z,
        w: VIOLET_TOWER.w,
        d: VIOLET_TOWER.d,
        color: '#8b5cf6',
        label: 'Violet Tower'
      });

      // ------------------------------------------
      // 4E. 30 SKYSCRAPERS WITH UNIQUE INTERIORS & ELEVATORS
      // ------------------------------------------
      const skyscraperPalettes = [
        { base: '#1e293b', lit: '#38bdf8', roof: 0x0ea5e9 },
        { base: '#1e1b4b', lit: '#a78bfa', roof: 0x8b5cf6 },
        { base: '#0f172a', lit: '#34d399', roof: 0x10b981 },
        { base: '#27272a', lit: '#fbbf24', roof: 0xf59e0b },
        { base: '#311042', lit: '#f472b6', roof: 0xec4899 }
      ];

      const skyscraperTextures = skyscraperPalettes.map((p) =>
        createSkyscraperTexture(p.base, p.lit, 4, 8)
      );

      const skyscraperSpecs = [
        { x: -80, z: -80, w: 26, d: 26, levels: 5, pal: 0, wallHex: 0x2563eb, accentHex: 0x60a5fa, door: 'south', title: 'METRO POST & LOGISTICS HQ', sub: 'PARCEL SORTING & EXPRESS MAIL', theme: 'post_office', floorColor: 0xe2e8f0, hasHelipad: false, icon: '📮' },
        { x: -25, z: -80, w: 28, d: 24, levels: 8, pal: 1, wallHex: 0x1d4ed8, accentHex: 0x38bdf8, door: 'south', title: 'POLICE HEADQUARTERS', sub: 'PRECINCT 1 & TACTICAL HELIPAD', theme: 'police', floorColor: 0x1e293b, hasHelipad: true, icon: '🚓' },
        { x: 25, z: -80, w: 26, d: 24, levels: 6, pal: 2, wallHex: 0xdc2626, accentHex: 0xfbbf24, door: 'south', title: 'FIRE STATION #1', sub: 'RESCUE BAY & AIR WATCH HELIPAD', theme: 'fire_station', floorColor: 0x7f1d1d, hasHelipad: true, icon: '🚒' },
        { x: 80, z: -80, w: 28, d: 28, levels: 7, pal: 0, wallHex: 0x0284c7, accentHex: 0xef4444, door: 'south', title: 'METRO CENTRAL HOSPITAL', sub: 'EMERGENCY & MEDEVAC HELIPAD', theme: 'hospital', floorColor: 0xe0f2fe, hasHelipad: true, icon: '🏥' },

        { x: -80, z: -22, w: 24, d: 28, levels: 5, pal: 4, wallHex: 0xb45309, accentHex: 0xfde047, door: 'east', title: 'METRO CENTRAL LIBRARY', sub: 'BOOK STACKS & READING DOME', theme: 'library', floorColor: 0x78350f, hasHelipad: false, icon: '📚' },
        { x: -80, z: 24, w: 26, d: 26, levels: 4, pal: 1, wallHex: 0x16a34a, accentHex: 0xfacc15, door: 'east', title: 'SUPERMART GROCERY', sub: 'FRESH AISLES & ORGANIC CAFE', theme: 'supermarket', floorColor: 0xfef9c3, hasHelipad: false, icon: '🛒' },

        { x: -80, z: 80, w: 28, d: 28, levels: 4, pal: 3, wallHex: 0x7c3aed, accentHex: 0xf43f5e, door: 'north', title: 'STARLIGHT BOWLING ALLEY', sub: 'PRO LANES, PIN ARCADE & LOUNGE', theme: 'bowling', floorColor: 0x451a03, hasHelipad: false, icon: '🎳' },
        { x: -25, z: 80, w: 26, d: 24, levels: 3, pal: 4, wallHex: 0xe11d48, accentHex: 0xfde047, door: 'north', title: 'RETRO PIZZA & DINER', sub: 'BRICK OVEN, BOOTHS & PATIO', theme: 'diner', floorColor: 0x991b1b, hasHelipad: false, icon: '🍕' },
        { x: 25, z: 80, w: 26, d: 24, levels: 5, pal: 0, wallHex: 0x0f766e, accentHex: 0x2dd4bf, door: 'north', title: 'LUXURY AUTO SHOWROOM', sub: 'SPORTS CARS & ROADSTER GALLERY', theme: 'car_showroom', floorColor: 0x334155, hasHelipad: false, icon: '🏎️' },
        { x: 80, z: 80, w: 28, d: 28, levels: 4, pal: 1, wallHex: 0x15803d, accentHex: 0x86efac, door: 'north', title: 'BOTANICAL CONSERVATORY', sub: 'INDOOR GARDEN & KOI ATRIUM', theme: 'botanical', floorColor: 0x14532d, hasHelipad: false, icon: '🌿' },

        { x: -135, z: -135, w: 28, d: 28, levels: 8, pal: 4, wallHex: 0x4338ca, accentHex: 0x38bdf8, door: 'south', title: 'CHANNEL 1 TV STUDIO', sub: 'LIVE NEWS DESK & CHOPPER PAD', theme: 'tv_studio', floorColor: 0x0f172a, hasHelipad: true, icon: '📺' },
        { x: -80, z: -135, w: 26, d: 26, levels: 5, pal: 3, wallHex: 0x312e81, accentHex: 0xc084fc, door: 'south', title: 'SCIENCE PLANETARIUM', sub: 'SOLAR SYSTEM & STAR DOME', theme: 'planetarium', floorColor: 0x090d16, hasHelipad: false, icon: '🔭' },
        { x: -25, z: -135, w: 30, d: 26, levels: 6, pal: 3, wallHex: 0x9f1239, accentHex: 0xfbbf24, door: 'south', title: 'SYMPHONY CONCERT HALL', sub: 'GRAND PIANO & ROYAL AUDITORIUM', theme: 'concert_hall', floorColor: 0x4c0519, hasHelipad: false, icon: '🎹' },
        { x: 25, z: -135, w: 28, d: 26, levels: 4, pal: 4, wallHex: 0x059669, accentHex: 0x6ee7b7, door: 'south', title: 'CITY PHARMACY & DRUGSTORE', sub: 'MEDICINES & WELLNESS CLINIC', theme: 'pharmacy', floorColor: 0xecfdf5, hasHelipad: false, icon: '💊' },
        { x: 80, z: -135, w: 26, d: 26, levels: 7, pal: 1, wallHex: 0xb45309, accentHex: 0xfacc15, door: 'south', title: 'METRO CITIZENS BANK & ATM', sub: 'GOLD VAULT & ARMORED HELIPAD', theme: 'gold_bank', floorColor: 0xfef08a, hasHelipad: true, icon: '🏦' },
        { x: 135, z: -135, w: 28, d: 28, levels: 5, pal: 0, wallHex: 0x0369a1, accentHex: 0x22d3ee, door: 'south', title: 'OCEAN WORLD AQUARIUM', sub: 'CORAL REEF & SHARK LAGOON', theme: 'aquarium', floorColor: 0x083344, hasHelipad: false, icon: '🦈' },

        { x: -135, z: -80, w: 26, d: 28, levels: 4, pal: 4, wallHex: 0x9a3412, accentHex: 0xfbbf24, door: 'east', title: 'DRAGON MARTIAL ARTS DOJO', sub: 'TATAMI MATS & ZEN GARDEN', theme: 'dojo', floorColor: 0xd97706, hasHelipad: false, icon: '🥋' },
        { x: -135, z: -22, w: 28, d: 28, levels: 6, pal: 1, wallHex: 0xdb2777, accentHex: 0xf9a8d4, door: 'east', title: 'CITY CLOTHING & APPAREL', sub: 'RUNWAY SHOWROOM & TAILORING', theme: 'fashion', floorColor: 0xfdf2f8, hasHelipad: false, icon: '👗' },
        { x: -135, z: 24, w: 26, d: 28, levels: 4, pal: 2, wallHex: 0x6d28d9, accentHex: 0xe879f9, door: 'east', title: 'VINYL RECORD & MUSIC SHOP', sub: 'GUITAR WALL & LIVE JAM STAGE', theme: 'record_shop', floorColor: 0x311042, hasHelipad: false, icon: '🎸' },
        { x: -135, z: 80, w: 26, d: 26, levels: 3, pal: 3, wallHex: 0x65a30d, accentHex: 0xbef264, door: 'east', title: 'HAPPY PAWS PET SANCTUARY', sub: 'PUPPY PLAYPEN & CARE CLINIC', theme: 'pet_shop', floorColor: 0xecfccb, hasHelipad: false, icon: '🐾' },

        { x: 135, z: -80, w: 26, d: 26, levels: 3, pal: 1, wallHex: 0xb91c1c, accentHex: 0x93c5fd, door: 'west', title: 'METRO BARBER & HAIR SALON', sub: 'HAIRCUTS • STYLING • GROOMING', theme: 'barber_salon', floorColor: 0xfef3c7, hasHelipad: false, icon: '💈' },
        { x: 135, z: -28, w: 26, d: 24, levels: 3, pal: 3, wallHex: 0xec4899, accentHex: 0x67e8f9, door: 'west', title: 'SWEET SCOOPS ICE CREAM', sub: 'GELATO PARLOR & SUNDAE TERRACE', theme: 'ice_cream', floorColor: 0xfce7f3, hasHelipad: false, icon: '🍨' },
        { x: 135, z: 28, w: 26, d: 24, levels: 5, pal: 4, wallHex: 0x4f46e5, accentHex: 0x22d3ee, door: 'west', title: 'PRO ESPORTS LAN ARENA', sub: 'RGB GAMING RIGS & VR LOUNGE', theme: 'esports', floorColor: 0x111827, hasHelipad: false, icon: '🎮' },
        { x: 135, z: 80, w: 26, d: 26, levels: 4, pal: 0, wallHex: 0xd97706, accentHex: 0x38bdf8, door: 'west', title: 'INDOOR SKATE & PARKOUR', sub: 'HALFPIPE RAMPS & GRIND RAILS', theme: 'skate_park', floorColor: 0x475569, hasHelipad: false, icon: '🛹' },

        { x: -135, z: 135, w: 28, d: 28, levels: 9, pal: 1, wallHex: 0x0e7490, accentHex: 0xfacc15, door: 'north', title: 'METRO ROYAL HOTEL', sub: 'SUITES, LOBBY & 9F SKY POOL', theme: 'hotel', floorColor: 0x7f1d1d, hasHelipad: false, icon: '🏨' },
        { x: -80, z: 135, w: 26, d: 26, levels: 5, pal: 2, wallHex: 0xb45309, accentHex: 0xfcd34d, door: 'north', title: 'METRO SCIENCE ACADEMY', sub: 'LECTURE HALL & ROBOTICS LAB', theme: 'school', floorColor: 0x78350f, hasHelipad: false, icon: '🎓' },
        { x: -25, z: 135, w: 28, d: 26, levels: 6, pal: 0, wallHex: 0x475569, accentHex: 0xfde047, door: 'north', title: 'SUPREME COURTHOUSE', sub: 'HIGH BENCH & JUSTICE ROTUNDA', theme: 'courthouse', floorColor: 0x451a03, hasHelipad: false, icon: '⚖️' },
        { x: 25, z: 135, w: 28, d: 26, levels: 4, pal: 3, wallHex: 0xbe123c, accentHex: 0x38bdf8, door: 'north', title: 'CHAMPION BOXING GYM', sub: 'CENTER RING & HEAVY BAGS', theme: 'boxing_gym', floorColor: 0x1e293b, hasHelipad: false, icon: '🥊' },
        { x: 80, z: 135, w: 26, d: 26, levels: 5, pal: 4, wallHex: 0x701a75, accentHex: 0x22d3ee, door: 'north', title: 'NEON PULSE DJ CLUB', sub: 'LIGHT DANCEFLOOR & VIP LOUNGE', theme: 'dj_club', floorColor: 0x1e1b4b, hasHelipad: false, icon: '🎧' },
        { x: 135, z: 135, w: 28, d: 28, levels: 7, pal: 2, wallHex: 0x1e293b, accentHex: 0x38bdf8, door: 'north', title: 'ROYAL DIAMOND EXCHANGE', sub: 'GEMSTONE CASES & CROWN GALLERY', theme: 'jewelry', floorColor: 0x0f172a, hasHelipad: false, icon: '💎' }
      ];

      function populateUniqueInterior(group, sp) {
        const t = sp.theme;
        const addBox = (w, h, d, color, x, y, z, basic) => {
          const mat = basic
            ? new THREE.MeshBasicMaterial({ color })
            : new THREE.MeshLambertMaterial({ color });
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
          m.position.set(x, y, z);
          group.add(m);
          return m;
        };

        if (t === 'hospital') {
          // Emergency Reception Desk, Glowing Red Cross Emblem, 4 Patient Beds with Pillows & Medical Monitors
          addBox(9.0, 1.3, 2.2, 0x0284c7, 0, 0.85, -8.5);
          addBox(0.8, 2.6, 0.3, 0xef4444, 0, 4.2, -11.5, true);
          addBox(2.6, 0.8, 0.3, 0xef4444, 0, 4.2, -11.5, true);
          // Exterior Red Cross above Hospital Entrance
          addBox(1.0, 3.2, 0.4, 0xef4444, 0, 9.2, sp.d / 2 + 0.3, true);
          addBox(3.2, 1.0, 0.4, 0xef4444, 0, 9.2, sp.d / 2 + 0.3, true);
          [[-6.5, -2], [-6.5, 4], [6.5, -2], [6.5, 4]].forEach(([bx, bz]) => {
            addBox(4.4, 0.9, 2.2, 0xf8fafc, bx, 0.65, bz);
            addBox(3.2, 0.16, 2.1, 0x38bdf8, bx + (bx < 0 ? 0.5 : -0.5), 1.15, bz);
            addBox(1.1, 0.35, 1.8, 0xffffff, bx + (bx < 0 ? -1.4 : 1.4), 1.25, bz);
            addBox(0.6, 1.8, 0.6, 0x10b981, bx + (bx < 0 ? -2.6 : 2.6), 1.1, bz, true);
          });
        } else if (t === 'post_office') {
          // Blue Sorting Counter + 6 Parcel Conveyors & Mailboxes
          addBox(12.0, 1.3, 2.0, 0x1d4ed8, 0, 0.85, -6);
          addBox(11.6, 0.25, 1.8, 0x38bdf8, 0, 1.55, -6, true);
          [[-6, 3], [0, 3], [6, 3], [-6, -1], [6, -1]].forEach(([px, pz]) => {
            addBox(3.2, 1.8, 2.4, 0xd97706, px, 1.1, pz);
            addBox(1.4, 0.9, 1.4, 0xfef08a, px, 2.3, pz);
          });
        } else if (t === 'police') {
          // Precinct Sergeant Desk + 2 Holding Cells with Bars & Benches
          addBox(10.0, 1.4, 2.4, 0x1d4ed8, 0, 0.9, 2);
          addBox(2.4, 1.6, 0.25, 0xfacc15, 0, 3.8, -10.5, true);
          addBox(8.0, 4.5, 0.3, 0x94a3b8, -5.5, 2.4, -5);
          addBox(8.0, 4.5, 0.3, 0x94a3b8, 5.5, 2.4, -5);
          addBox(3.6, 0.7, 1.4, 0x475569, -6, 0.55, -8.5);
          addBox(3.6, 0.7, 1.4, 0x475569, 6, 0.55, -8.5);
        } else if (t === 'fire_station') {
          // Indoor Reserve Ladder Truck + Full-Height 5-Story Brass Fireman Pole (1F to 5F Chief Command!) + Gear Lockers
          addBox(5.5, 3.8, 12.5, 0xdc2626, -3.5, 2.2, 0);
          addBox(6.2, 0.6, 13.5, 0xf8fafc, -3.5, 4.4, 0);
          const brassPole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.34, 0.34, 31.2, 16),
            new THREE.MeshBasicMaterial({ color: 0xfacc15 })
          );
          brassPole.position.set(6.0, 15.6, -4.0);
          group.add(brassPole);

          const poleLandingMat = new THREE.Mesh(
            new THREE.CylinderGeometry(1.45, 1.55, 0.18, 24),
            new THREE.MeshBasicMaterial({ color: 0xef4444 })
          );
          poleLandingMat.position.set(6.0, 0.35, -4.0);
          group.add(poleLandingMat);

          [-6, -2, 2, 6].forEach((lz) => {
            addBox(1.4, 3.2, 2.2, 0x991b1b, 9.5, 1.8, lz);
          });
        } else if (t === 'planetarium') {
          // Glowing Solar System Orrery (Sun + 4 Planets + Saturn Ring) + Giant Observatory Telescope
          const sun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          sun.position.set(0, 3.8, -1);
          group.add(sun);
          [[4.2, 0x38bdf8, 0.85, 0], [6.8, 0xf43f5e, 0.7, 2.1], [9.4, 0xa855f7, 1.1, 4.2]].forEach(([rad, col, sz, ang]) => {
            const p = new THREE.Mesh(new THREE.SphereGeometry(sz, 12, 12), new THREE.MeshBasicMaterial({ color: col }));
            p.position.set(Math.cos(ang) * rad, 3.8, -1 + Math.sin(ang) * rad);
            group.add(p);
          });
          addBox(1.6, 2.6, 5.2, 0xe2e8f0, -6.5, 2.2, 5);
        } else if (t === 'library') {
          // 4 Tall Mahogany Book Stacks + Reading Tables & Green Lamps
          [-6, -2, 2, 6].forEach((rz) => {
            addBox(10.0, 3.8, 1.2, 0x92400e, -2, 2.1, rz);
            addBox(9.6, 2.8, 1.3, 0x38bdf8, -2, 2.2, rz);
          });
          addBox(3.2, 1.1, 6.5, 0x78350f, 6.5, 0.75, 0);
          addBox(0.8, 0.6, 0.8, 0x22c55e, 6.5, 1.5, -1.5, true);
        } else if (t === 'supermarket') {
          // 3 Fresh Produce Aisles + 2 Checkout Conveyor Counters
          [-5, 0, 5].forEach((az) => {
            addBox(9.5, 2.4, 1.4, 0x16a34a, -2, 1.4, az);
            addBox(9.2, 0.8, 1.5, 0xfef08a, -2, 2.2, az);
          });
          [-4, 4].forEach((cz) => {
            addBox(2.2, 1.2, 4.2, 0x0f172a, 6.5, 0.8, cz);
            addBox(0.8, 0.8, 0.8, 0x22d3ee, 6.5, 1.6, cz - 1.2, true);
          });
        } else if (t === 'bowling') {
          // 3 Polished Maple Bowling Lanes + Glowing Pin Decks, Interactive 3D Pins & 3D Rolling Bowling Ball!
          window.__bowling3DPins = [];
          [-5.5, 0, 5.5].forEach((lx) => {
            addBox(3.4, 0.15, 18.0, 0xfbbf24, lx, 0.28, 1);
            addBox(3.6, 2.4, 1.2, 0x1e1b4b, lx, 1.4, -8.2);
            [[-0.6, -7.2], [0, -7.2], [0.6, -7.2], [-0.3, -6.6], [0.3, -6.6], [0, -6.0]].forEach(([px, pz]) => {
              const pinM = addBox(0.32, 0.95, 0.32, 0xffffff, lx + px, 0.75, pz, true);
              if (lx === 0) {
                window.__bowling3DPins.push({ mesh: pinM, homeX: lx + px, homeY: 0.75, homeZ: pz });
              }
            });
          });
          const ball3D = new THREE.Mesh(
            new THREE.SphereGeometry(0.48, 14, 14),
            new THREE.MeshBasicMaterial({ color: 0xf43f5e })
          );
          ball3D.position.set(0, 0.72, 8.2);
          group.add(ball3D);
          window.__bowling3DBall = { mesh: ball3D, z: 8.2, vz: 0, active: false, resetTimer: 0 };
        } else if (t === 'diner') {
          // Red Vinyl Diner Booths, Checkered Counter, Neon Jukebox & Brick Pizza Oven
          [[-6, -3], [-6, 4], [6, -3], [6, 4]].forEach(([bx, bz]) => {
            addBox(4.2, 1.1, 1.6, 0xef4444, bx, 0.75, bz);
            addBox(3.8, 0.9, 1.8, 0xfef08a, bx, 0.65, bz + 1.8);
          });
          addBox(4.5, 3.6, 3.2, 0xb45309, 0, 2.0, -7.5);
          addBox(2.2, 2.8, 1.4, 0xe879f9, -8.5, 1.6, -7.5, true);
        } else if (t === 'car_showroom') {
          // 2 Luxury Sports Roadsters on Turntables + Glass Sales Desk
          [[-5.5, 1, 0xef4444], [5.5, 1, 0x22d3ee]].forEach(([cx, cz, ccol]) => {
            addBox(5.6, 0.4, 9.0, 0x1e293b, cx, 0.38, cz);
            addBox(3.4, 1.2, 6.8, ccol, cx, 1.15, cz);
            addBox(2.8, 0.75, 2.8, 0xbae6fd, cx, 1.95, cz - 0.3, true);
          });
          addBox(8.0, 1.2, 2.0, 0xf8fafc, 0, 0.8, -7.5);
        } else if (t === 'botanical') {
          // Indoor Koi Pond + Arched Wooden Footbridge + 4 Lush Tropical Trees & Flowerbeds
          addBox(10.5, 0.42, 8.5, 0x0284c7, 0, 0.35, 1, true);
          addBox(3.2, 1.1, 9.2, 0xb45309, 0, 0.85, 1);
          [[-7.5, -5.5], [7.5, -5.5], [-7.5, 6.5], [7.5, 6.5]].forEach(([tx, tz]) => {
            addBox(1.2, 3.5, 1.2, 0x78350f, tx, 1.9, tz);
            addBox(4.4, 2.8, 4.4, 0x22c55e, tx, 4.2, tz);
          });
        } else if (t === 'tv_studio') {
          // Channel 1 News Anchor Desk + Green Screen Cyclorama + 2 Studio Cameras on Tripods
          addBox(12.0, 1.4, 2.8, 0x2563eb, 0, 0.9, -6);
          addBox(14.5, 4.4, 0.4, 0x22c55e, 0, 2.6, -10.5, true);
          [[-4.5, 1], [4.5, 1]].forEach(([cx, cz]) => {
            addBox(0.8, 1.8, 0.8, 0x334155, cx, 1.1, cz);
            addBox(1.2, 0.9, 1.8, 0x0f172a, cx, 2.2, cz);
          });
        } else if (t === 'pharmacy') {
          // Prescription Counter + Glowing Green Pharmacy Cross + 3 Stocked Medicine Gondolas
          addBox(10.0, 1.35, 2.2, 0x10b981, 0, 0.85, -7.0);
          addBox(0.8, 2.4, 0.3, 0x22c55e, 0, 4.0, -10.5, true);
          addBox(2.4, 0.8, 0.3, 0x22c55e, 0, 4.0, -10.5, true);
          [-6.5, 0, 6.5].forEach((rx) => {
            addBox(2.2, 2.4, 8.5, 0xf8fafc, rx, 1.4, 1.5);
            addBox(2.3, 0.45, 8.3, 0x34d399, rx, 2.5, 1.5, true);
          });
        } else if (t === 'concert_hall') {
          // Raised Stage + Grand Piano + Red Velvet Auditorium Seating Rows
          addBox(16.0, 1.2, 7.0, 0x78350f, 0, 0.8, -6);
          addBox(3.8, 1.8, 4.2, 0x090d16, 0, 2.1, -6);
          [1, 5].forEach((rz) => {
            addBox(14.0, 1.0, 1.8, 0xbe123c, 0, 0.7, rz);
          });
        } else if (t === 'gold_bank') {
          // Marble Teller Counter + Walk-In Gold Bullion Vault & Steel Vault Door
          addBox(11.0, 2.4, 2.0, 0xb45309, 0, 1.4, -1.5);
          addBox(7.5, 2.4, 5.0, 0xfacc15, 0, 1.4, -8, true);
          const vaultDoor = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.6, 16), new THREE.MeshLambertMaterial({ color: 0x94a3b8 }));
          vaultDoor.rotation.x = Math.PI / 2;
          vaultDoor.position.set(-4.5, 2.4, -5.0);
          group.add(vaultDoor);
        } else if (t === 'aquarium') {
          // Giant Glowing Coral Reef & Shark Tank + Viewing Bench
          addBox(15.0, 4.8, 8.0, 0x06b6d4, 0, 2.6, -3, true);
          [[-4, 2.2, 0xf97316], [0, 3.4, 0xfacc15], [4, 1.8, 0xf43f5e]].forEach(([fx, fy, fcol]) => {
            addBox(1.8, 0.8, 0.9, fcol, fx, fy, -3, true);
          });
          addBox(8.0, 0.8, 1.8, 0x1e293b, 0, 0.6, 4.5);
        } else if (t === 'dojo') {
          // Golden Tatami Mat Floor + 4 Wooden Wing Chun Training Dummies & Scroll Wall
          addBox(15.0, 0.25, 17.0, 0xfef08a, 0, 0.3, 0);
          [[-5, -5], [5, -5], [-5, 5], [5, 5]].forEach(([dx, dz]) => {
            addBox(0.9, 2.6, 0.9, 0x78350f, dx, 1.5, dz);
            addBox(2.2, 0.3, 0.3, 0x92400e, dx, 2.1, dz);
          });
        } else if (t === 'fashion') {
          // Illuminated Pink Fashion Runway + Display Mannequins & Tailoring Racks
          addBox(5.0, 0.85, 16.0, 0xf472b6, -2, 0.62, 0, true);
          [[-7.5, -4], [-7.5, 4], [5.5, -4], [5.5, 4]].forEach(([mx, mz]) => {
            addBox(1.2, 2.8, 1.2, 0x38bdf8, mx, 1.6, mz);
          });
        } else if (t === 'record_shop') {
          // 3 Vinyl Record Browsing Bins + Raised Neon Drum & Guitar Stage
          [-5, 0, 5].forEach((bz) => {
            addBox(8.5, 1.3, 2.0, 0xa855f7, -3, 0.85, bz);
          });
          addBox(5.0, 0.8, 8.0, 0x1e1b4b, 6.5, 0.6, 0);
          addBox(1.8, 1.4, 1.8, 0xfacc15, 6.5, 1.5, 0, true);
        } else if (t === 'pet_shop') {
          // Green Turf Puppy Playpen + Agility Tunnel & Vet Care Counter
          addBox(11.0, 1.0, 11.0, 0x84cc16, -2, 0.65, 0);
          addBox(2.4, 1.6, 4.5, 0x38bdf8, -2, 1.6, 0, true);
          addBox(2.2, 1.3, 8.0, 0xf8fafc, 7.5, 0.85, 0);
        } else if (t === 'barber_salon') {
          // Spinning Red/White/Blue Barber Pole + 3 Styling Chairs & Lighted Wall Mirrors
          addBox(0.9, 3.2, 0.9, 0xef4444, -8.5, 1.8, -6, true);
          [-5.0, 0, 5.0].forEach((cz) => {
            addBox(2.2, 1.2, 2.2, 0xdc2626, 2.5, 0.8, cz);
            addBox(0.3, 2.4, 2.6, 0xbae6fd, 8.5, 2.4, cz, true);
          });
        } else if (t === 'ice_cream') {
          // Pink Gelato Freezer Case + Pastel Flavors & Sundae Booths
          addBox(3.0, 1.4, 12.0, 0xf472b6, 3.5, 0.9, 0);
          addBox(2.6, 0.4, 11.4, 0x67e8f9, 3.5, 1.7, 0, true);
          [[-5, -4], [-5, 4]].forEach(([bx, bz]) => {
            addBox(3.8, 1.0, 2.2, 0xfef08a, bx, 0.7, bz);
          });
        } else if (t === 'esports') {
          // Pro LAN Gaming Desks (Blue vs Red RGB Rigs) + Golden Championship Trophy Pedestal
          [[-5, -4, 0x22d3ee], [-5, 4, 0xf43f5e]].forEach(([gx, gz, gcol]) => {
            addBox(8.0, 1.1, 2.2, 0x1e293b, gx, 0.75, gz);
            addBox(7.2, 1.0, 0.3, gcol, gx, 1.65, gz, true);
          });
          addBox(2.2, 2.8, 2.2, 0xfacc15, 5.5, 1.6, 0, true);
        } else if (t === 'skate_park') {
          // Quarter-Pipe Skate Ramps & Central Grind Rail
          addBox(14.0, 2.2, 4.0, 0xd97706, 0, 1.3, -8);
          addBox(14.0, 2.2, 4.0, 0xd97706, 0, 1.3, 8);
          addBox(0.5, 1.1, 10.0, 0x38bdf8, 0, 0.75, 0, true);
        } else if (t === 'hotel') {
          // Indoor Lobby Fountain + Red Carpet + Check-in Concierge Desk
          addBox(6.0, 1.2, 6.0, 0x38bdf8, 0, 0.8, 0, true);
          addBox(4.0, 0.1, 10.0, 0xbe123c, 0, 0.36, -6);
          addBox(12.0, 1.4, 2.2, 0xb45309, 0, 0.9, 8);
        } else if (t === 'school') {
          // Green Chalkboard + Teacher Desk + 6 Student Desks
          addBox(14.0, 3.6, 0.3, 0x14532d, 0, 2.8, 10);
          addBox(5.0, 1.2, 2.0, 0x92400e, 0, 0.8, 6);
          [[-5, -1], [0, -1], [5, -1], [-5, -5], [0, -5], [5, -5]].forEach(([sx, sz]) => {
            addBox(2.8, 1.0, 1.8, 0xd97706, sx, 0.7, sz);
          });
        } else if (t === 'courthouse') {
          // High Judge's Bench + Jury Box + Counsel Tables
          addBox(10.0, 2.2, 3.2, 0x451a03, 0, 1.3, 8);
          addBox(4.5, 1.1, 2.4, 0x78350f, -5, 0.75, 1);
          addBox(4.5, 1.1, 2.4, 0x78350f, 5, 0.75, 1);
        } else if (t === 'boxing_gym') {
          // Elevated Square Boxing Ring in the Center with Corner Posts & Ropes!
          addBox(11.0, 1.0, 11.0, 0x1d4ed8, 0, 0.7, 1);
          [[-5, -4, 0xef4444], [5, -4, 0xffffff], [-5, 6, 0xffffff], [5, 6, 0x38bdf8]].forEach(([px, pz, pcol]) => {
            addBox(0.6, 2.8, 0.6, pcol, px, 2.2, pz, true);
          });
          addBox(10.4, 0.2, 10.4, 0xf8fafc, 0, 2.4, 1, true);
        } else if (t === 'dj_club') {
          // Multi-Color Illuminated Dance Floor Grid + Raised DJ Booth
          const cols = [0xec4899, 0x22d3ee, 0xa855f7, 0xa3e635, 0xfacc15];
          for (let gx = -2; gx <= 2; gx++) {
            for (let gz = -2; gz <= 2; gz++) {
              addBox(2.4, 0.15, 2.4, cols[Math.abs(gx + gz) % cols.length], gx * 2.6, 0.32, gz * 2.6 - 1, true);
            }
          }
          addBox(8.0, 1.8, 3.0, 0x0f172a, 0, 1.1, 8);
        } else if (t === 'jewelry') {
          // 5 Glowing Gemstone Display Pedestals (Diamond, Emerald, Ruby, Sapphire, Gold Crown)
          [[0, 0, 0x22d3ee], [-6, -5, 0x10b981], [6, -5, 0xf43f5e], [-6, 5, 0xa855f7], [6, 5, 0xfacc15]].forEach(([jx, jz, jcol]) => {
            addBox(2.2, 1.5, 2.2, 0x334155, jx, 0.95, jz);
            addBox(1.3, 1.3, 1.3, jcol, jx, 2.4, jz, true);
          });
        }
      }

      const THEME_FLOOR_LABELS = {
        post_office: ['1F Express Mail Hall', '2F Parcel Sorting', '3F Air Freight Hub', '4F Logistics Center', '5F Sky Garden Terrace'],
        police: ['1F Precinct Desk & Cells', '2F Detective Bureau', '3F Forensics Lab', '4F Cyber Crime Unit', '5F Dispatch Center', '6F Tactical Armory', '7F Commissioner Floor', '8F Police Helipad'],
        fire_station: ['1F Engine & Rescue Bay', '2F Firefighter Quarters', '3F Hazmat Training', '4F Dispatch & Radar', '5F Chief Command', '6F Rescue Helipad'],
        hospital: ['1F Emergency Triage', '2F Radiology & Scans', '3F Surgical Suites', '4F Maternity & Pediatrics', '5F Cardiology Ward', '6F Recovery Lounge', '7F Medevac Helipad'],
        library: ['1F Mahogany Book Hall', '2F Rare Manuscripts', '3F Digital Archive', '4F Quiet Study Carrels', '5F Observatory Reading Deck'],
        supermarket: ['1F Fresh Produce & Deli', '2F Bakery & Artisanal Cheese', '3F Home & Kitchen Loft', '4F Rooftop Organic Patio'],
        bowling: ['1F Pro Bowling Lanes', '2F Neon Arcade Mezzanine', '3F Billiards & Darts Club', '4F Starlight Sky Lounge'],
        diner: ['1F Brick Oven & Booths', '2F Milkshake & Jukebox Loft', '3F Rooftop Pizza Patio'],
        car_showroom: ['1F Supercar Turntables', '2F Electric Concept Hall', '3F Custom Tuning Studio', '4F VIP Buyers Lounge', '5F Rooftop Test Terrace'],
        botanical: ['1F Koi Pond & Palms', '2F Orchid Greenhouse', '3F Butterfly Atrium', '4F Canopy Sky Garden'],
        tv_studio: ['1F Live News Broadcast', '2F Talk Show Soundstage', '3F Weather & CGI Lab', '4F Control Room A', '5F Editing Suites', '6F Executive Network', '7F Green Room Lounge', '8F News Chopper Helipad'],
        planetarium: ['1F Solar System Orrery', '2F Deep Space Theater', '3F Astrobiology Exhibit', '4F Meteorite Vault', '5F Telescope Dome Deck'],
        concert_hall: ['1F Grand Piano Stage', '2F Dress Circle Balcony', '3F Symphony Rehearsal', '4F Opera Costume Loft', '5F Maestro Salon', '6F Starlight Roof Terrace'],
        pharmacy: ['1F Prescription & Wellness', '2F Vitamin & Herbal Bar', '3F Optometry & Dental', '4F Zen Wellness Terrace'],
        gold_bank: ['1F Marble Teller & Vault', '2F Safe Deposit Reserve', '3F Foreign Exchange', '4F Wealth Management', '5F Gold Bullion Audit', '6F Boardroom Suite', '7F Armored Helipad'],
        aquarium: ['1F Shark & Coral Reef Tank', '2F Jellyfish Glow Tunnel', '3F Penguin Ice Cove', '4F Marine Biology Lab', '5F Ocean View Terrace'],
        dojo: ['1F Tatami & Wing Chun Hall', '2F Kendo & Bo Staff Loft', '3F Meditation Tea Room', '4F Bamboo Zen Roof'],
        fashion: ['1F Illuminated Runway', '2F Haute Couture Atelier', '3F Bespoke Tailoring', '4F Accessory & Shoe Salon', '5F Photo Studio Loft', '6F Fashion Sky Lounge'],
        record_shop: ['1F Vinyl Bins & Drum Stage', '2F Electric Guitar Vault', '3F Recording Booths', '4F Rooftop Acoustic Deck'],
        pet_shop: ['1F Puppy Playpen & Vet', '2F Kitty Cafe & Grooming', '3F Sunny Pet Garden Roof'],
        barber_salon: ['1F Classic Barber Chairs', '2F Hair Coloring & Spa', '3F Grooming Sky Patio'],
        ice_cream: ['1F Gelato Bar & Sundaes', '2F Waffle Cone Kitchen', '3F Pastel Sundae Roof Patio'],
        esports: ['1F Pro LAN Stage & Trophy', '2F VR Battle Arena Pods', '3F Streamer Broadcast Booths', '4F Retro Console Lounge', '5F Cyber Neon Sky Deck'],
        skate_park: ['1F Halfpipe & Grind Rails', '2F Parkour Obstacle Course', '3F Custom Deck Workshop', '4F Street Art Roof Terrace'],
        hotel: ['1F Fountain Lobby', '2F Grand Ballroom', '3F Dining & Spa', '4F Executive Rooms', '5F Royal Lounge', '6F VIP Suites', '7F Starlight Suites', '8F Penthouse Floor', '9F Rooftop Pool'],
        school: ['1F Lecture Hall & Chalkboard', '2F Chemistry & Physics Lab', '3F Robotics & AI Workshop', '4F Campus Library', '5F Astronomy Roof Deck'],
        courthouse: ['1F Supreme Courtroom', '2F Jury Deliberation', '3F Law Library', '4F Chambers of Justice', '5F Appellate Hall', '6F Rotunda Sky Terrace'],
        boxing_gym: ['1F Championship Ring', '2F Heavy Bag & Cardio Loft', '3F Pro Locker & Sauna', '4F Contender Sky Deck'],
        dj_club: ['1F LED Dancefloor & Booth', '2F VIP Bottle Mezzanine', '3F Laser Synth Lounge', '4F Chillout Bass Loft', '5F Starlight Club Roof'],
        jewelry: ['1F Diamond & Crown Cases', '2F Master Gem Cutter Lab', '3F Swiss Watch Horology', '4F Royal Tiara Gallery', '5F Private Auction Salon', '6F High-Security Vault', '7F Crystal Crown Terrace']
      };

      function addUniqueExteriorFeatures(bGroup, sp, topRoofY) {
        const wCol = sp.wallHex || 0x38bdf8;
        const aCol = sp.accentHex || 0xfacc15;
        const awningMat = new THREE.MeshLambertMaterial({ color: wCol });
        const trimMat = new THREE.MeshBasicMaterial({ color: aCol });

        // 1. Custom Entrance Canopy / Awning over the front door
        const canopyW = 7.4;
        const canopyD = 2.4;
        const canopyMesh = new THREE.Mesh(new THREE.BoxGeometry(canopyW, 0.45, canopyD), awningMat);
        const canopyTrim = new THREE.Mesh(new THREE.BoxGeometry(canopyW + 0.2, 0.2, canopyD + 0.2), trimMat);
        if (sp.door === 'south') {
          canopyMesh.position.set(0, 4.5, sp.d / 2 + canopyD / 2);
          canopyTrim.position.set(0, 4.75, sp.d / 2 + canopyD / 2);
        } else if (sp.door === 'north') {
          canopyMesh.position.set(0, 4.5, -sp.d / 2 - canopyD / 2);
          canopyTrim.position.set(0, 4.75, -sp.d / 2 - canopyD / 2);
        } else if (sp.door === 'east') {
          canopyMesh.rotation.y = Math.PI / 2;
          canopyTrim.rotation.y = Math.PI / 2;
          canopyMesh.position.set(sp.w / 2 + canopyD / 2, 4.5, 0);
          canopyTrim.position.set(sp.w / 2 + canopyD / 2, 4.75, 0);
        } else if (sp.door === 'west') {
          canopyMesh.rotation.y = Math.PI / 2;
          canopyTrim.rotation.y = Math.PI / 2;
          canopyMesh.position.set(-sp.w / 2 - canopyD / 2, 4.5, 0);
          canopyTrim.position.set(-sp.w / 2 - canopyD / 2, 4.75, 0);
        }
        bGroup.add(canopyMesh);
        bGroup.add(canopyTrim);

        // 2. Vertical Architectural Corner Pillars (gives distinct 3D relief to each building)
        [[-sp.w / 2, -sp.d / 2], [sp.w / 2, -sp.d / 2], [-sp.w / 2, sp.d / 2], [sp.w / 2, sp.d / 2]].forEach(([cx, cz]) => {
          const pil = new THREE.Mesh(
            new THREE.BoxGeometry(0.95, topRoofY + 2.6, 0.95),
            awningMat
          );
          pil.position.set(cx, (topRoofY + 2.6) / 2, cz);
          bGroup.add(pil);
        });

        // 3. Theme-Specific Iconic 3D Exterior Emblems & Rooftop Architectural Silhouettes
        const t = sp.theme;
        if (t === 'ice_cream') {
          // Giant 3D Pastel Ice Cream Cone Statue on the Front Canopy
          const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 12), new THREE.MeshLambertMaterial({ color: 0xd97706 }));
          cone.rotation.x = Math.PI;
          cone.position.set(-sp.w / 2 - 1.2, 6.2, 3.8);
          bGroup.add(cone);
          const scoop1 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0xf472b6 }));
          scoop1.position.set(-sp.w / 2 - 1.2, 7.7, 3.8);
          bGroup.add(scoop1);
          const scoop2 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 12), new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
          scoop2.position.set(-sp.w / 2 - 1.2, 8.9, 3.8);
          bGroup.add(scoop2);
        } else if (t === 'diner') {
          // Giant Glowing Neon Pizza Emblem & Checkered Marquee Band
          const pizzaDisk = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.35, 18), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          pizzaDisk.rotation.x = Math.PI / 2;
          pizzaDisk.position.set(0, 8.6, -sp.d / 2 - 0.35);
          bGroup.add(pizzaDisk);
        } else if (t === 'bowling') {
          // Giant 3D Bowling Pin & Golden Bowling Ball above Entrance
          const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 3.4, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          pin.position.set(-4.2, 6.5, -sp.d / 2 - 1.2);
          bGroup.add(pin);
          const ball = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 14), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
          ball.position.set(4.2, 5.8, -sp.d / 2 - 1.2);
          bGroup.add(ball);
        } else if (t === 'esports') {
          // Glowing RGB Cyber Blades on Facade
          [-6.5, 6.5].forEach((fz) => {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.45, topRoofY, 0.65), new THREE.MeshBasicMaterial({ color: fz < 0 ? 0x22d3ee : 0xf43f5e }));
            blade.position.set(-sp.w / 2 - 0.35, topRoofY / 2, fz);
            bGroup.add(blade);
          });
        } else if (t === 'tv_studio') {
          // Broadcast Communications Spire on Corner of Roof
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.55, 11.0, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          mast.position.set(-sp.w / 2 + 2.5, topRoofY + 5.5, -sp.d / 2 + 2.5);
          bGroup.add(mast);
        } else if (t === 'jewelry') {
          // Floating Glowing Diamond Crystal Crown on Corner Pedestal
          const gem = new THREE.Mesh(new THREE.OctahedronGeometry(1.8, 0), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
          gem.position.set(0, 8.6, -sp.d / 2 - 0.8);
          bGroup.add(gem);
        }
      }

      skyscraperSpecs.forEach((sp, idx) => {
        const pal = skyscraperPalettes[sp.pal];
        const wallHex = sp.wallHex || pal.roof;
        const accentHex = sp.accentHex || pal.roof;
        const groundLobbyH = 6.5;
        const bGroup = new THREE.Group();
        bGroup.position.set(sp.x, 0, sp.z);
        worldGroup.add(bGroup);

        const lobbyFloor = new THREE.Mesh(
          new THREE.BoxGeometry(sp.w - 0.4, 0.32, sp.d - 0.4),
          new THREE.MeshLambertMaterial({ color: sp.floorColor || 0x334155 })
        );
        lobbyFloor.position.set(0, 0.16, 0);
        bGroup.add(lobbyFloor);

        buildHollowBuilding({
          group: bGroup,
          worldX: sp.x,
          worldZ: sp.z,
          w: sp.w,
          d: sp.d,
          h: groundLobbyH,
          minY: 0,
          wallColor: wallHex,
          roofColor: 0x0f172a,
          doorSide: sp.door,
          doorOffset: 0,
          doorWidth: 5.2,
          doorHeight: 4.4,
          doorColor: accentHex,
          addCeiling: false,
          tag: 'skyscraper_lobby_' + idx
        });

        populateUniqueInterior(bGroup, sp);

        const signHexBg = '#' + wallHex.toString(16).padStart(6, '0');
        const signHexBorder = '#' + accentHex.toString(16).padStart(6, '0');
        const signTex = createSignTexture(sp.title, sp.sub, signHexBg, signHexBorder, '#ffffff');
        const signMesh = new THREE.Mesh(
          new THREE.BoxGeometry(12, 2.4, 0.4),
          new THREE.MeshBasicMaterial({ map: signTex })
        );
        if (sp.door === 'south') {
          signMesh.position.set(0, 5.6, sp.d / 2 + 0.3);
        } else if (sp.door === 'north') {
          signMesh.position.set(0, 5.6, -sp.d / 2 - 0.3);
          signMesh.rotation.y = Math.PI;
        } else if (sp.door === 'east') {
          signMesh.position.set(sp.w / 2 + 0.3, 5.6, 0);
          signMesh.rotation.y = Math.PI / 2;
        } else if (sp.door === 'west') {
          signMesh.position.set(-sp.w / 2 - 0.3, 5.6, 0);
          signMesh.rotation.y = -Math.PI / 2;
        }
        bGroup.add(signMesh);

        const isMetroRoyalHotel = sp.theme === 'hotel';
        const skyLevels = sp.levels || (isMetroRoyalHotel ? 9 : 5);
        const skyFloorLabels = THEME_FLOOR_LABELS[sp.theme] || [
          '1F Main Hall',
          '2F Operations',
          '3F Lounge',
          '4F Sky Terrace'
        ];
        const topType = isMetroRoyalHotel
          ? 'swimming_pool'
          : (sp.hasHelipad ? 'helipad' : 'sky_terrace');

        let elevLX = sp.w / 2 - 3.2;
        let elevLZ = sp.d / 2 - 3.2;
        if (sp.door === 'south') { elevLX = sp.w / 2 - 3.2; elevLZ = -sp.d / 2 + 3.2; }
        else if (sp.door === 'north') { elevLX = sp.w / 2 - 3.2; elevLZ = sp.d / 2 - 3.2; }
        else if (sp.door === 'east') { elevLX = -sp.w / 2 + 3.2; elevLZ = sp.d / 2 - 3.2; }
        else if (sp.door === 'west') { elevLX = sp.w / 2 - 3.2; elevLZ = sp.d / 2 - 3.2; }

        addElevatorAndUpperFloors({
          id: 'sky_' + idx,
          title: (sp.icon ? sp.icon + ' ' : '🏢 ') + sp.title,
          group: bGroup,
          worldX: sp.x,
          worldZ: sp.z,
          w: sp.w,
          d: sp.d,
          floorHeight: groundLobbyH,
          numLevels: skyLevels,
          floorLabels: skyFloorLabels,
          localElevX: elevLX,
          localElevZ: elevLZ,
          wallColor: wallHex,
          accentColor: accentHex,
          floorColor: sp.floorColor,
          buildFloor1ToN: true,
          topFloorType: topType,
          theme: sp.theme
        });

        const topRoofY = (skyLevels - 1) * groundLobbyH;
        addUniqueExteriorFeatures(bGroup, sp, topRoofY);

        // Layered Architectural Stepped Cornice & Chamfered Roof Overhang (visual only)
        const corniceMat = new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.62, metalness: 0.18 });
        const crownTrimMat = new THREE.MeshStandardMaterial({
          color: accentHex,
          emissive: accentHex,
          emissiveIntensity: 0.22,
          roughness: 0.35,
          metalness: 0.45
        });
        const crownUnder = new THREE.Mesh(new THREE.BoxGeometry(sp.w + 0.5, 0.45, sp.d + 0.5), corniceMat);
        crownUnder.position.set(sp.x, topRoofY - 0.12, sp.z);
        crownUnder.castShadow = true;
        worldGroup.add(crownUnder);

        const crown = new THREE.Mesh(new THREE.BoxGeometry(sp.w + 1.15, 0.42, sp.d + 1.15), crownTrimMat);
        crown.position.set(sp.x, topRoofY + 0.22, sp.z);
        crown.castShadow = true;
        worldGroup.add(crown);

        // Grounding Contact AO Shadow Apron beneath skyscraper footprint (cosmetic only)
        const bldgAo = new THREE.Mesh(
          new THREE.PlaneGeometry(sp.w + 5.5, sp.d + 5.5),
          contactShadowMat
        );
        bldgAo.rotation.x = -Math.PI / 2;
        bldgAo.position.set(sp.x, 0.23, sp.z);
        worldGroup.add(bldgAo);

        mapBuildings.push({ x: sp.x, z: sp.z, w: sp.w, d: sp.d, color: signHexBorder, label: sp.title });
      });

      const treeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
      const treeLeafMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });
      const plazaTrees = [
        [-38, -34], [38, -34], [-38, 34], [38, 34],
        [-22, 34], [22, 34]
      ];
      // Organic vertex-displaced foliage cluster geometry (smooth normals)
      function createOrganicFoliageGeo(radius, seedOffset) {
        const g = new THREE.IcosahedronGeometry(radius, 1);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vy = pos.getY(i);
          const vz = pos.getZ(i);
          const n = 1.0 + 0.14 * Math.sin(vx * 2.3 + seedOffset) * Math.cos(vz * 2.1 - seedOffset) + 0.08 * Math.sin(vy * 3.1);
          pos.setXYZ(i, vx * n, vy * n * 0.92, vz * n);
        }
        g.computeVertexNormals();
        return g;
      }

      const organicTrunkMat = new THREE.MeshStandardMaterial({ color: 0x6b3a19, roughness: 0.92, metalness: 0.02 });
      const organicLeafMatA = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.84, metalness: 0.02 });
      const organicLeafMatB = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.80, metalness: 0.02 });
      const sharedFoliageMainGeo = createOrganicFoliageGeo(2.35, 1.1);
      const sharedFoliageSubGeo = createOrganicFoliageGeo(1.55, 2.7);
      const sharedTrunkGeo = new THREE.CylinderGeometry(0.42, 0.72, 3.8, 10);
      sharedTrunkGeo.computeVertexNormals();

      const swayingTreeCanopies = [];
      plazaTrees.forEach(([tx, tz], tIdx) => {
        const treeAo = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 6.8), contactShadowMat);
        treeAo.rotation.x = -Math.PI / 2;
        treeAo.position.set(tx, 0.36, tz);
        worldGroup.add(treeAo);

        const trunk = new THREE.Mesh(sharedTrunkGeo, organicTrunkMat);
        trunk.position.set(tx, 1.9, tz);
        trunk.rotation.y = tIdx * 0.9;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        worldGroup.add(trunk);

        const canopyGrp = new THREE.Group();
        canopyGrp.position.set(tx, 5.2, tz);
        const scaleVar = 0.92 + (tIdx % 3) * 0.08;
        canopyGrp.scale.setScalar(scaleVar);
        canopyGrp.rotation.y = tIdx * 1.25;

        const mainCrown = new THREE.Mesh(sharedFoliageMainGeo, organicLeafMatA);
        mainCrown.position.set(0, 0.45, 0);
        mainCrown.castShadow = true;
        mainCrown.receiveShadow = true;
        canopyGrp.add(mainCrown);

        [[1.35, -0.25, 0.65], [-1.25, -0.15, 0.75], [0.15, -0.2, -1.35], [0, 1.55, 0.1]].forEach(([ox, oy, oz], cIdx) => {
          const lobe = new THREE.Mesh(sharedFoliageSubGeo, cIdx % 2 === 0 ? organicLeafMatB : organicLeafMatA);
          lobe.position.set(ox, oy, oz);
          lobe.castShadow = true;
          lobe.receiveShadow = true;
          canopyGrp.add(lobe);
        });

        worldGroup.add(canopyGrp);
        swayingTreeCanopies.push({ mesh: canopyGrp, phase: tIdx * 1.15, x: tx, z: tz, gustX: 0, gustZ: 0 });
        shootableMeshes.push(mainCrown);
        addBoxCollider(tx, tz, 1.6, 1.6, 8, 'tree');
      });

      // InstancedMesh of Decorative Sculpted Outskirts Boulders (Non-collidable, 1 draw call!)
      (function addInstancedOutskirtsBoulders() {
        const rockGeo = createOrganicFoliageGeo(1.35, 4.2);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.92, metalness: 0.04 });
        const boulderCoords = [
          [218, -28], [220, 26], [228, -92], [268, -94], [322, -94], [372, -93],
          [406, -54], [407, 12], [406, 62], [358, 94], [296, 94], [238, 93],
          [172, -32], [174, 28], [254, -56], [364, 54], [256, 56], [364, -56]
        ];
        const instRocks = new THREE.InstancedMesh(rockGeo, rockMat, boulderCoords.length);
        instRocks.castShadow = true;
        instRocks.receiveShadow = true;
        const dummy = new THREE.Object3D();
        boulderCoords.forEach(([rx, rz], i) => {
          dummy.position.set(rx, 0.55, rz);
          dummy.rotation.set((i * 0.7) % 1.2, i * 1.4, (i * 0.4) % 0.8);
          dummy.scale.set(0.85 + (i % 4) * 0.28, 0.55 + (i % 3) * 0.22, 0.85 + ((i + 1) % 4) * 0.25);
          dummy.updateMatrix();
          instRocks.setMatrixAt(i, dummy.matrix);
        });
        instRocks.instanceMatrix.needsUpdate = true;
        worldGroup.add(instRocks);
      })();
      // ------------------------------------------
      // 4F. OUTSKIRTS PAINTBALL ARENA (Centered at x: 310, z: 0)
      // ------------------------------------------
      const ARENA_CENTER = { x: 310, z: 0 };
      const ARENA_HALF_W = 50;
      const ARENA_HALF_D = 46;

      const arenaGroup = new THREE.Group();
      arenaGroup.position.set(ARENA_CENTER.x, 0, ARENA_CENTER.z);
      worldGroup.add(arenaGroup);

      const arenaTurf = new THREE.Mesh(
        new THREE.BoxGeometry(ARENA_HALF_W * 2, 0.3, ARENA_HALF_D * 2),
        new THREE.MeshLambertMaterial({ color: 0x064e3b })
      );
      arenaTurf.position.set(0, 0.15, 0);
      arenaGroup.add(arenaTurf);
      shootableMeshes.push(arenaTurf);

      const wallFenceMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      [
        { x: 0, z: -ARENA_HALF_D, w: ARENA_HALF_W * 2, d: 1.4 },
        { x: 0, z: ARENA_HALF_D, w: ARENA_HALF_W * 2, d: 1.4 },
        { x: -ARENA_HALF_W, z: 0, w: 1.4, d: ARENA_HALF_D * 2 },
        { x: ARENA_HALF_W, z: 0, w: 1.4, d: ARENA_HALF_D * 2 }
      ].forEach((fw) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(fw.w, 5.2, fw.d), wallFenceMat);
        m.position.set(fw.x, 2.6, fw.z);
        arenaGroup.add(m);
        shootableMeshes.push(m);
        addBoxCollider(ARENA_CENTER.x + fw.x, ARENA_CENTER.z + fw.z, fw.w, fw.d, 5.5, 'arena_wall');
      });

      const bunkerSpecs = [
        { x: 0, z: 0, w: 7, h: 4.2, d: 7, color: 0xfacc15 },
        { x: -18, z: -14, w: 5.5, h: 3.4, d: 3.5, color: 0x22d3ee },
        { x: -18, z: 14, w: 5.5, h: 3.4, d: 3.5, color: 0x22d3ee },
        { x: 18, z: -14, w: 5.5, h: 3.4, d: 3.5, color: 0xf43f5e },
        { x: 18, z: 14, w: 5.5, h: 3.4, d: 3.5, color: 0xf43f5e },
        { x: 0, z: -22, w: 8.5, h: 3.2, d: 3.0, color: 0xa855f7 },
        { x: 0, z: 22, w: 8.5, h: 3.2, d: 3.0, color: 0x10b981 },
        { x: -30, z: 0, w: 3.5, h: 3.6, d: 9.0, color: 0x38bdf8 },
        { x: 30, z: 0, w: 3.5, h: 3.6, d: 9.0, color: 0xfb7185 }
      ];

      const bunkerTrimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65, metalness: 0.35 });
      bunkerSpecs.forEach((bk) => {
        const bkMat = new THREE.MeshStandardMaterial({ color: bk.color, roughness: 0.48, metalness: 0.15 });
        const bm = new THREE.Mesh(new THREE.BoxGeometry(bk.w, bk.h - 0.35, bk.d), bkMat);
        bm.position.set(bk.x, (bk.h - 0.35) / 2 + 0.2, bk.z);
        bm.castShadow = true;
        bm.receiveShadow = true;
        arenaGroup.add(bm);

        // Beveled/stepped tactical top cap & ribbed base bumper (fits strictly inside existing hitbox)
        const cap = new THREE.Mesh(new THREE.BoxGeometry(bk.w - 0.45, 0.38, bk.d - 0.45), bkMat);
        cap.position.set(bk.x, bk.h + 0.02, bk.z);
        cap.castShadow = true;
        arenaGroup.add(cap);

        const baseSkirt = new THREE.Mesh(new THREE.BoxGeometry(bk.w + 0.14, 0.32, bk.d + 0.14), bunkerTrimMat);
        baseSkirt.position.set(bk.x, 0.36, bk.z);
        arenaGroup.add(baseSkirt);

        shootableMeshes.push(bm);
        addBoxCollider(ARENA_CENTER.x + bk.x, ARENA_CENTER.z + bk.z, bk.w, bk.d, bk.h + 0.5, 'bunker');
      });

      const exitPadMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.4, 0.4, 16),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      exitPadMesh.position.set(-40, 0.35, -38);
      arenaGroup.add(exitPadMesh);

      const exitPortalSignTex = createSignTexture('RETURN TO CITY', 'STEP ON GOLD PAD', '#0f172a', '#facc15', '#ffffff');
      const exitPortalSign = new THREE.Mesh(
        new THREE.BoxGeometry(6.5, 1.5, 0.3),
        new THREE.MeshBasicMaterial({ map: exitPortalSignTex })
      );
      exitPortalSign.position.set(-40, 3.4, -41.2);
      arenaGroup.add(exitPortalSign);

      // Blue Squad & Red Squad Spawn Base Canopies inside Outskirts Paintball Arena
      [
        { bx: -38, color: 0x0284c7, title: 'BLUE SQUAD BASE' },
        { bx: 38, color: 0xe11d48, title: 'RED BOTS BASE' }
      ].forEach((baseSpec) => {
        const canopy = new THREE.Mesh(
          new THREE.BoxGeometry(8.5, 0.45, 28.0),
          new THREE.MeshLambertMaterial({ color: baseSpec.color })
        );
        canopy.position.set(baseSpec.bx, 4.6, 0);
        arenaGroup.add(canopy);
        [-12, 12].forEach((pz) => {
          const post = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 4.6, 0.6),
            new THREE.MeshLambertMaterial({ color: 0x1e293b })
          );
          post.position.set(baseSpec.bx, 2.3, pz);
          arenaGroup.add(post);
        });
      });

      // ------------------------------------------
      // 4G. OUTSKIRTS GO-KART & BUGGY DIRT TRACK (WRAPPING AROUND PAINTBALL ARENA)
      //     Circuit bounds: x = 232..396 (164m wide), z = -84..84 (168m deep), 18m wide dirt track!
      // ------------------------------------------
      const KART_TRACK = {
        westX: 241,
        eastX: 387,
        northZ: -75,
        southZ: 75,
        roadW: 18,
        startLineZ: -22,
        boostPads: [
          { x: 241, z: -52, yaw: 0 },
          { x: 314, z: -75, yaw: -Math.PI / 2 },
          { x: 387, z: -26, yaw: Math.PI },
          { x: 387, z: 32, yaw: Math.PI },
          { x: 314, z: 75, yaw: Math.PI / 2 },
          { x: 241, z: 34, yaw: 0 }
        ],
        checkpoints: [
          { x: 314, z: -75, r: 14, name: 'North Straight' },
          { x: 387, z: 0, r: 14, name: 'East Backstretch' },
          { x: 314, z: 75, r: 14, name: 'South Hairpin' },
          { x: 241, z: 26, r: 14, name: 'West Pit Approach' }
        ]
      };

      const kartTrackGroup = new THREE.Group();
      worldGroup.add(kartTrackGroup);

      const dirtTexPack = createProceduralSurfaceTextures('dirt', '#9a5b2c', 6, 16);
      const dirtMat = new THREE.MeshStandardMaterial({
        map: dirtTexPack.map,
        bumpMap: dirtTexPack.bumpMap,
        bumpScale: 0.16,
        roughness: 0.94,
        metalness: 0.02
      });
      const dirtCenterMat = new THREE.MeshStandardMaterial({
        map: dirtTexPack.map,
        color: 0xd98a4a,
        bumpMap: dirtTexPack.bumpMap,
        bumpScale: 0.12,
        roughness: 0.90,
        metalness: 0.02
      });
      const curbRedMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
      const curbWhiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
      const tireWallMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

      // 4 Wide Compacted Dirt Straights (Non-overlapping corners to eliminate Z-fighting!)
      [
        { x: KART_TRACK.westX, z: 0, w: KART_TRACK.roadW, d: 168, gw: KART_TRACK.roadW - 6, gd: 156 },
        { x: KART_TRACK.eastX, z: 0, w: KART_TRACK.roadW, d: 168, gw: KART_TRACK.roadW - 6, gd: 156 },
        { x: 314, z: KART_TRACK.northZ, w: 128, d: KART_TRACK.roadW, gw: 134, gd: KART_TRACK.roadW - 6 },
        { x: 314, z: KART_TRACK.southZ, w: 128, d: KART_TRACK.roadW, gw: 134, gd: KART_TRACK.roadW - 6 }
      ].forEach((seg, sIdx) => {
        const road = new THREE.Mesh(new THREE.BoxGeometry(seg.w, 0.24, seg.d), dirtMat);
        road.position.set(seg.x, 0.125, seg.z);
        road.receiveShadow = true;
        kartTrackGroup.add(road);

        const groove = new THREE.Mesh(
          new THREE.BoxGeometry(seg.gw, 0.26, seg.gd),
          dirtCenterMat
        );
        groove.position.set(seg.x, 0.135 + (sIdx >= 2 ? 0.004 : 0), seg.z);
        groove.receiveShadow = true;
        kartTrackGroup.add(groove);
      });

      // Connecting Dirt Pit Apron from East Highway to West Pit Straight (cleanly layered, zero Z-fighting)
      const pitConnector = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.20, 20),
        dirtMat
      );
      pitConnector.position.set(221, 0.10, 0);
      pitConnector.receiveShadow = true;
      kartTrackGroup.add(pitConnector);

      // Alternating Red/White Racing Curbs along Outer & Inner Edges
      for (let i = 0; i < 16; i++) {
        const cMat = i % 2 === 0 ? curbRedMat : curbWhiteMat;
        const cx = 238 + i * 10;
        const nCurb = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.32, 1.2), cMat);
        nCurb.position.set(cx, 0.16, -84.6);
        kartTrackGroup.add(nCurb);

        const sCurb = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.32, 1.2), cMat);
        sCurb.position.set(cx, 0.16, 84.6);
        kartTrackGroup.add(sCurb);

        const cz = -78 + i * 10.4;
        const eCurb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 10.0), cMat);
        eCurb.position.set(396.6, 0.16, cz);
        kartTrackGroup.add(eCurb);

        if (Math.abs(cz) > 12) {
          const wCurb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 10.0), cMat);
          wCurb.position.set(231.4, 0.16, cz);
          kartTrackGroup.add(wCurb);
        }
      }

      // Outer Safety Tire Barriers (visual + colliders on North, South, East edges)
      [
        { x: 314, z: -86.2, w: 168, d: 1.8 },
        { x: 314, z: 86.2, w: 168, d: 1.8 },
        { x: 398.2, z: 0, w: 1.8, d: 174 }
      ].forEach((bar) => {
        const bm = new THREE.Mesh(new THREE.BoxGeometry(bar.w, 1.35, bar.d), tireWallMat);
        bm.position.set(bar.x, 0.68, bar.z);
        kartTrackGroup.add(bm);
        addBoxCollider(bar.x, bar.z, bar.w, bar.d, 2.2, 'kart_barrier');
      });

      // InstancedMesh of Sculpted Stacked Tires along Dirt Track Outer Barriers (1 draw call, cosmetic)
      (function addInstancedTrackTires() {
        const tireGeo = new THREE.TorusGeometry(0.62, 0.26, 8, 14);
        tireGeo.computeVertexNormals();
        const tireInstMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.92, metalness: 0.05 });
        const tireSpots = [];
        for (let x = 236; x <= 394; x += 14) {
          tireSpots.push([x, -85.2], [x, 85.2]);
        }
        for (let z = -76; z <= 76; z += 14) {
          tireSpots.push([397.2, z]);
        }
        const instTires = new THREE.InstancedMesh(tireGeo, tireInstMat, tireSpots.length * 2);
        const dummy = new THREE.Object3D();
        let idx = 0;
        tireSpots.forEach(([tx, tz]) => {
          [0.45, 0.95].forEach((ty) => {
            dummy.position.set(tx, ty, tz);
            dummy.rotation.set(Math.PI / 2, 0, 0);
            dummy.updateMatrix();
            instTires.setMatrixAt(idx++, dummy.matrix);
          });
        });
        instTires.instanceMatrix.needsUpdate = true;
        kartTrackGroup.add(instTires);
      })();

      // Start / Finish Checkered Gantry Arch over the West Pit Straight (x: 241, z: -22)
      [-9.5, 9.5].forEach((px) => {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 8.6, 1.4),
          new THREE.MeshLambertMaterial({ color: 0x0f172a })
        );
        post.position.set(KART_TRACK.westX + px, 4.3, KART_TRACK.startLineZ);
        kartTrackGroup.add(post);
      });
      const gantryBannerTex = createSignTexture(
        'OUTSKIRTS GO-KART & BUGGY TRACK',
        'START / FINISH • BOOST PADS • LAP TIMER',
        '#1e1b4b',
        '#facc15',
        '#ffffff'
      );
      const gantryHeader = new THREE.Mesh(
        new THREE.BoxGeometry(20.6, 2.6, 1.4),
        new THREE.MeshBasicMaterial({ map: gantryBannerTex })
      );
      gantryHeader.position.set(KART_TRACK.westX, 8.6, KART_TRACK.startLineZ);
      kartTrackGroup.add(gantryHeader);

      // Checkered Start Line Strip on the Dirt
      for (let cs = 0; cs < 9; cs++) {
        const sq = new THREE.Mesh(
          new THREE.BoxGeometry(1.9, 0.28, 2.4),
          cs % 2 === 0 ? curbWhiteMat : tireWallMat
        );
        sq.position.set(KART_TRACK.westX - 7.6 + cs * 1.9, 0.14, KART_TRACK.startLineZ);
        kartTrackGroup.add(sq);
      }

      // 6 Glowing Neon Turbo Boost Pads around the Circuit
      const boostPadMeshes = [];
      KART_TRACK.boostPads.forEach((bp) => {
        const padGroup = new THREE.Group();
        padGroup.position.set(bp.x, 0.28, bp.z);
        padGroup.rotation.y = bp.yaw;

        const base = new THREE.Mesh(
          new THREE.BoxGeometry(6.8, 0.12, 5.2),
          new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })
        );
        padGroup.add(base);

        const chevron = new THREE.Mesh(
          new THREE.BoxGeometry(4.4, 0.16, 1.6),
          new THREE.MeshBasicMaterial({ color: 0xfacc15 })
        );
        chevron.position.set(0, 0.04, -0.8);
        padGroup.add(chevron);

        const chevron2 = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.16, 1.2),
          new THREE.MeshBasicMaterial({ color: 0x4ade80 })
        );
        chevron2.position.set(0, 0.04, 1.2);
        padGroup.add(chevron2);

        kartTrackGroup.add(padGroup);
        boostPadMeshes.push(padGroup);
      });

      // 4 Glowing Checkpoint Markers (overhead arch lights)
      KART_TRACK.checkpoints.forEach((cp, idx) => {
        const beacon = new THREE.Mesh(
          new THREE.TorusGeometry(4.2, 0.24, 10, 24),
          new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0x22d3ee : 0xf472b6 })
        );
        beacon.position.set(cp.x, 4.6, cp.z);
        if (idx === 0 || idx === 2) beacon.rotation.y = Math.PI / 2;
        kartTrackGroup.add(beacon);
      });

      // Physical Trackside "RACE VS AI" Button Pedestal next to the Start/Finish Line (x: 230.5, z: -15)
      const AI_RACE_BTN_POS = { x: 230.5, y: 1.5, z: -15 };
      const aiBtnPedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 1.15, 1.35, 16),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      aiBtnPedestal.position.set(AI_RACE_BTN_POS.x, 0.68, AI_RACE_BTN_POS.z);
      kartTrackGroup.add(aiBtnPedestal);

      const aiRaceButtonMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 0.38, 16),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      aiRaceButtonMesh.position.set(AI_RACE_BTN_POS.x, 1.55, AI_RACE_BTN_POS.z);
      kartTrackGroup.add(aiRaceButtonMesh);

      const aiBtnRing = new THREE.Mesh(
        new THREE.RingGeometry(1.3, 1.9, 24),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide })
      );
      aiBtnRing.rotation.x = -Math.PI / 2;
      aiBtnRing.position.set(AI_RACE_BTN_POS.x, 0.22, AI_RACE_BTN_POS.z);
      kartTrackGroup.add(aiBtnRing);

      const aiBtnSignTex = createSignTexture(
        'RACE VS AI BUGGY',
        'PRESS BUTTON [E] OR CLICK',
        '#0f172a',
        '#f59e0b',
        '#ffffff'
      );
      const aiBtnSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 1.9, 6.2),
        new THREE.MeshBasicMaterial({ map: aiBtnSignTex })
      );
      aiBtnSign.position.set(AI_RACE_BTN_POS.x - 0.6, 3.6, AI_RACE_BTN_POS.z);
      kartTrackGroup.add(aiBtnSign);

      // ==========================================
      // 5. ARTICULATED BOX CHARACTER FACTORY
      // ==========================================
      // Shared Smooth Humanoid Geometry Cache (Three.js r128-safe Lathe capsules — zero leaks across players/NPCs/bots)
      const CHAR_GEOS = (function buildSharedCharacterGeos() {
        function makeCapsule(radius, cylinderLen, radialSegs = 14, capSegs = 6) {
          const pts = [];
          const half = cylinderLen * 0.5;
          for (let i = 0; i <= capSegs; i++) {
            const a = -Math.PI / 2 + (i / capSegs) * (Math.PI / 2);
            pts.push(new THREE.Vector2(Math.max(0.001, Math.cos(a) * radius), -half + Math.sin(a) * radius));
          }
          for (let i = 0; i <= capSegs; i++) {
            const a = (i / capSegs) * (Math.PI / 2);
            pts.push(new THREE.Vector2(Math.max(0.001, Math.cos(a) * radius), half + Math.sin(a) * radius));
          }
          const g = new THREE.LatheGeometry(pts, radialSegs);
          g.computeVertexNormals();
          return g;
        }

        const pelvis = makeCapsule(0.36, 0.14, 14, 5);
        pelvis.scale(1.12, 0.72, 0.78);
        pelvis.computeVertexNormals();

        const belt = new THREE.CylinderGeometry(0.41, 0.41, 0.12, 14);
        belt.scale(1.06, 1.0, 0.74);
        belt.computeVertexNormals();

        // Sculpted athletic jacket torso (tapered waist -> broad chest -> rounded shoulders)
        const torsoPts = [
          new THREE.Vector2(0.01, 0.0),
          new THREE.Vector2(0.37, 0.03),
          new THREE.Vector2(0.41, 0.24),
          new THREE.Vector2(0.49, 0.62),
          new THREE.Vector2(0.55, 0.92),
          new THREE.Vector2(0.46, 1.08),
          new THREE.Vector2(0.24, 1.15),
          new THREE.Vector2(0.01, 1.17)
        ];
        const torso = new THREE.LatheGeometry(torsoPts, 16);
        torso.scale(1.05, 1.0, 0.66);
        torso.computeVertexNormals();

        const vest = new THREE.CylinderGeometry(0.55, 0.45, 0.56, 14);
        vest.scale(1.07, 1.0, 0.70);
        vest.computeVertexNormals();

        const collar = new THREE.TorusGeometry(0.22, 0.065, 8, 16);
        collar.rotateX(Math.PI / 2);
        collar.computeVertexNormals();

        const backpack = makeCapsule(0.26, 0.36, 12, 5);
        backpack.scale(1.18, 1.0, 0.58);
        backpack.computeVertexNormals();

        const neck = new THREE.CylinderGeometry(0.14, 0.16, 0.24, 12);
        neck.computeVertexNormals();

        const head = new THREE.SphereGeometry(0.46, 18, 16);
        head.scale(0.94, 1.06, 0.97);
        head.computeVertexNormals();

        const hairCap = new THREE.SphereGeometry(0.485, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56);
        hairCap.scale(0.95, 1.04, 0.99);
        hairCap.computeVertexNormals();

        const visor = new THREE.CylinderGeometry(0.465, 0.465, 0.21, 16, 1, false, -0.92, 1.84);
        visor.computeVertexNormals();

        const shoulder = new THREE.SphereGeometry(0.165, 12, 10);
        const upperArm = makeCapsule(0.135, 0.30, 12, 5);
        const elbow = new THREE.SphereGeometry(0.125, 10, 8);
        const forearm = makeCapsule(0.115, 0.28, 12, 5);
        const hand = new THREE.SphereGeometry(0.13, 10, 8);
        hand.scale(0.92, 1.08, 0.85);

        const thigh = makeCapsule(0.165, 0.34, 12, 5);
        const knee = new THREE.SphereGeometry(0.15, 10, 8);
        const shin = makeCapsule(0.138, 0.34, 12, 5);

        const shoeUpper = makeCapsule(0.135, 0.20, 12, 5);
        shoeUpper.rotateX(Math.PI / 2);
        shoeUpper.scale(1.06, 0.78, 1.08);
        shoeUpper.computeVertexNormals();

        const shoeSole = new THREE.BoxGeometry(0.30, 0.075, 0.48);

        const gunBody = new THREE.CylinderGeometry(0.12, 0.13, 0.88, 10);
        gunBody.rotateX(Math.PI / 2);
        const gunBarrel = new THREE.CylinderGeometry(0.06, 0.06, 0.66, 10);
        gunBarrel.rotateX(Math.PI / 2);
        const hopper = new THREE.SphereGeometry(0.20, 12, 10);
        hopper.scale(0.95, 0.9, 1.15);

        const aoPlane = new THREE.PlaneGeometry(2.1, 2.1);

        return {
          pelvis, belt, torso, vest, collar, backpack, neck, head, hairCap, visor,
          shoulder, upperArm, elbow, forearm, hand,
          thigh, knee, shin, shoeUpper, shoeSole,
          gunBody, gunBarrel, hopper, aoPlane
        };
      })();

      function createBoxCharacter(options) {
        const {
          skinColor = 0xfde68a,
          shirtColor = 0x06b6d4,
          pantsColor = 0x1e293b,
          visorColor = 0x22d3ee,
          hasGun = true
        } = options || {};

        const root = new THREE.Group();
        const visualRoot = new THREE.Group();
        root.add(visualRoot);

        // Distinct PBR Materials (matte fabric, warm skin, semi-gloss sneakers & clearcoat visor)
        const headMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.62, metalness: 0.02 });
        const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.72, metalness: 0.06 });
        const limbMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.80, metalness: 0.04 });
        const armMat = torsoMat; // Jacket sleeves automatically match outfit changes & paintball splat flash
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.78, metalness: 0.05 });
        const packMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.68, metalness: 0.14 });
        const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.36, metalness: 0.18 });
        const soleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85, metalness: 0.02 });
        const vestMat = new THREE.MeshPhysicalMaterial({
          color: visorColor,
          emissive: visorColor,
          emissiveIntensity: 0.22,
          roughness: 0.14,
          metalness: 0.32,
          clearcoat: 0.9,
          clearcoatRoughness: 0.1
        });

        // 1. Pelvis / Hips (base y = 1.24 so sneaker soles rest cleanly on y = 0.0)
        const PELVIS_BASE_Y = 1.24;
        const pelvis = new THREE.Group();
        pelvis.position.set(0, PELVIS_BASE_Y, 0);
        visualRoot.add(pelvis);

        const pelvisMesh = new THREE.Mesh(CHAR_GEOS.pelvis, limbMat);
        pelvisMesh.castShadow = true;
        pelvisMesh.receiveShadow = true;
        pelvis.add(pelvisMesh);

        const beltMesh = new THREE.Mesh(CHAR_GEOS.belt, bootMat);
        beltMesh.position.y = 0.12;
        pelvis.add(beltMesh);

        // 2. Articulated Legs: pelvis -> hip (leftLegPivot/rightLegPivot) -> thigh -> knee -> shin -> sneaker
        function buildLeg(sideSign) {
          const hipPivot = new THREE.Group();
          hipPivot.position.set(sideSign * 0.24, -0.04, 0);

          // Children[0] uses limbMat so cyclePlayer3DOutfit() updates pants cleanly
          const thighMesh = new THREE.Mesh(CHAR_GEOS.thigh, limbMat);
          thighMesh.position.y = -0.30;
          thighMesh.castShadow = true;
          thighMesh.receiveShadow = true;
          hipPivot.add(thighMesh);

          const kneePivot = new THREE.Group();
          kneePivot.position.set(0, -0.58, 0);
          hipPivot.add(kneePivot);

          const kneeCap = new THREE.Mesh(CHAR_GEOS.knee, limbMat);
          kneeCap.castShadow = true;
          kneePivot.add(kneeCap);

          const shinMesh = new THREE.Mesh(CHAR_GEOS.shin, limbMat);
          shinMesh.position.y = -0.28;
          shinMesh.castShadow = true;
          shinMesh.receiveShadow = true;
          kneePivot.add(shinMesh);

          const footGroup = new THREE.Group();
          footGroup.position.set(0, -0.56, 0.07);
          const upper = new THREE.Mesh(CHAR_GEOS.shoeUpper, bootMat);
          upper.position.y = 0.02;
          upper.castShadow = true;
          footGroup.add(upper);
          const sole = new THREE.Mesh(CHAR_GEOS.shoeSole, soleMat);
          sole.position.set(0, -0.025, 0.0);
          sole.receiveShadow = true;
          footGroup.add(sole);
          kneePivot.add(footGroup);

          pelvis.add(hipPivot);
          return { hipPivot, kneePivot, footGroup };
        }

        const leftLegRig = buildLeg(-1);
        const rightLegRig = buildLeg(1);
        const leftLegPivot = leftLegRig.hipPivot;
        const rightLegPivot = rightLegRig.hipPivot;
        const leftKnee = leftLegRig.kneePivot;
        const rightKnee = rightLegRig.kneePivot;

        // 3. Articulated Torso -> Collar / Vest / Backpack -> Neck -> Head
        const torsoPivot = new THREE.Group();
        torsoPivot.position.set(0, 0.06, 0);
        pelvis.add(torsoPivot);

        const torso = new THREE.Mesh(CHAR_GEOS.torso, torsoMat);
        torso.castShadow = true;
        torso.receiveShadow = true;
        torsoPivot.add(torso);

        const vest = new THREE.Mesh(CHAR_GEOS.vest, vestMat);
        vest.position.y = 0.62;
        vest.castShadow = true;
        torsoPivot.add(vest);

        const collar = new THREE.Mesh(CHAR_GEOS.collar, packMat);
        collar.position.y = 1.13;
        torsoPivot.add(collar);

        const backpack = new THREE.Mesh(CHAR_GEOS.backpack, packMat);
        backpack.position.set(0, 0.65, -0.34);
        backpack.castShadow = true;
        torsoPivot.add(backpack);

        const neckPivot = new THREE.Group();
        neckPivot.position.set(0, 1.15, 0);
        torsoPivot.add(neckPivot);

        const neckMesh = new THREE.Mesh(CHAR_GEOS.neck, headMat);
        neckMesh.position.y = 0.11;
        neckPivot.add(neckMesh);

        const head = new THREE.Group();
        head.position.set(0, 0.45, 0);
        neckPivot.add(head);

        const cranium = new THREE.Mesh(CHAR_GEOS.head, headMat);
        cranium.castShadow = true;
        cranium.receiveShadow = true;
        head.add(cranium);

        const hair = new THREE.Mesh(CHAR_GEOS.hairCap, hairMat);
        hair.position.set(0, 0.04, -0.02);
        hair.castShadow = true;
        head.add(hair);

        const visor = new THREE.Mesh(CHAR_GEOS.visor, vestMat);
        visor.position.set(0, 0.04, 0.03);
        head.add(visor);

        // 4. Articulated Arms: torsoPivot -> shoulder (leftArmPivot/rightArmPivot) -> upperArm -> elbow -> forearm -> hand
        function buildArm(sideSign) {
          const shoulderPivot = new THREE.Group();
          shoulderPivot.position.set(sideSign * 0.63, 1.00, 0);

          const shBall = new THREE.Mesh(CHAR_GEOS.shoulder, armMat);
          shBall.castShadow = true;
          shoulderPivot.add(shBall);

          const upperArm = new THREE.Mesh(CHAR_GEOS.upperArm, armMat);
          upperArm.position.y = -0.25;
          upperArm.castShadow = true;
          upperArm.receiveShadow = true;
          shoulderPivot.add(upperArm);

          const elbowPivot = new THREE.Group();
          elbowPivot.position.set(0, -0.49, 0);
          shoulderPivot.add(elbowPivot);

          const elBall = new THREE.Mesh(CHAR_GEOS.elbow, armMat);
          elbowPivot.add(elBall);

          const forearm = new THREE.Mesh(CHAR_GEOS.forearm, armMat);
          forearm.position.y = -0.23;
          forearm.castShadow = true;
          forearm.receiveShadow = true;
          elbowPivot.add(forearm);

          const hand = new THREE.Mesh(CHAR_GEOS.hand, headMat);
          hand.position.set(0, -0.47, 0.02);
          hand.castShadow = true;
          elbowPivot.add(hand);

          torsoPivot.add(shoulderPivot);
          return { shoulderPivot, elbowPivot, hand };
        }

        const leftArmRig = buildArm(-1);
        const rightArmRig = buildArm(1);
        const leftArmPivot = leftArmRig.shoulderPivot;
        const rightArmPivot = rightArmRig.shoulderPivot;
        const leftElbow = leftArmRig.elbowPivot;
        const rightElbow = rightArmRig.elbowPivot;

        let muzzleNode = null;
        let gunGroup = null;
        if (hasGun) {
          rightArmPivot.rotation.x = -Math.PI / 3;
          gunGroup = new THREE.Group();
          gunGroup.position.set(0, -0.45, 0.30);
          gunGroup.rotation.x = Math.PI / 2.2;

          const gunBody = new THREE.Mesh(
            CHAR_GEOS.gunBody,
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.38, metalness: 0.68 })
          );
          gunGroup.add(gunBody);

          const gunBarrel = new THREE.Mesh(CHAR_GEOS.gunBarrel, vestMat);
          gunBarrel.position.set(0, 0.04, 0.62);
          gunGroup.add(gunBarrel);

          const hopper = new THREE.Mesh(
            CHAR_GEOS.hopper,
            new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.32, metalness: 0.28 })
          );
          hopper.position.set(0, 0.28, -0.05);
          gunGroup.add(hopper);

          muzzleNode = new THREE.Object3D();
          muzzleNode.position.set(0, 0.05, 1.02);
          gunGroup.add(muzzleNode);

          rightElbow.add(gunGroup);
        }

        // Soft Contact AO Shadow underneath every character rig (stays flat on physics root)
        const charContactShadow = new THREE.Mesh(CHAR_GEOS.aoPlane, contactShadowMat);
        charContactShadow.rotation.x = -Math.PI / 2;
        charContactShadow.position.set(0, 0.05, 0);
        root.add(charContactShadow);

        return {
          root,
          visualRoot,
          pelvis,
          pelvisBaseY: PELVIS_BASE_Y,
          torsoPivot,
          neckPivot,
          leftLegPivot,
          rightLegPivot,
          leftKnee,
          rightKnee,
          leftArmPivot,
          rightArmPivot,
          leftElbow,
          rightElbow,
          torso,
          head,
          torsoMat,
          pantsMat: limbMat,
          headMat,
          originalShirtColor: shirtColor,
          originalSkinColor: skinColor,
          muzzleNode,
          gunGroup,
          walkPhase: Math.random() * Math.PI * 2,
          _landCompression: 0,
          _visYawOffset: 0
        };
      }

      function animateBoxCharacter(rig, speed, dt, isAiming, vy = 0, isGrounded = true, moveYawOffset = 0) {
        rig.root.rotation.order = 'YXZ';
        rig.root.rotation.x = 0;
        rig.root.rotation.z = 0;

        const dampFast = 1.0 - Math.exp(-13.0 * dt);
        const dampMed = 1.0 - Math.exp(-9.5 * dt);
        rig._idlePhase = (rig._idlePhase || (rig.walkPhase * 0.7)) + dt * 2.2;
        const breath = Math.sin(rig._idlePhase);

        // Decay landing impact compression smoothly
        if (rig._landCompression && rig._landCompression > 0.002) {
          rig._landCompression *= Math.exp(-10.5 * dt);
        } else {
          rig._landCompression = 0;
        }
        const landDip = rig._landCompression || 0;

        // Smooth visual facing rotation toward movement direction (never alters physics yaw/camera)
        if (rig.visualRoot) {
          const targetVisYaw = isAiming ? 0 : moveYawOffset;
          let dy = targetVisYaw - (rig._visYawOffset || 0);
          while (dy > Math.PI) dy -= Math.PI * 2;
          while (dy < -Math.PI) dy += Math.PI * 2;
          rig._visYawOffset = (rig._visYawOffset || 0) + dy * (1.0 - Math.exp(-11.0 * dt));
          rig.visualRoot.rotation.y = rig._visYawOffset;
        }

        // Target joint poses computed from read-only velocity & grounded state
        let lHipX = 0, rHipX = 0, lKneeX = 0, rKneeX = 0;
        let lShX = 0, rShX = 0, lShZ = 0.06, rShZ = -0.06;
        let lElbX = -0.16, rElbX = -0.16;
        let torsoX = 0, torsoY = 0, torsoZ = 0;
        let pelvisY = rig.pelvisBaseY || 1.24;
        let pelvisX = 0, pelvisZ = 0;
        let headX = 0, headY = 0;

        if (!isGrounded) {
          // AIRBORNE STATE: Takeoff/Rising vs Falling
          if (vy > 1.2) {
            // Takeoff / Rising: tuck knees slightly & raise arms naturally
            const riseNorm = Math.min(1, vy / 12);
            lHipX = -0.42 * riseNorm;
            rHipX = -0.22 * riseNorm;
            lKneeX = 0.78 * riseNorm;
            rKneeX = 0.45 * riseNorm;
            lShX = -0.65 * riseNorm;
            rShX = isAiming ? -1.15 : -0.52 * riseNorm;
            lShZ = 0.22;
            rShZ = isAiming ? -0.05 : -0.22;
            lElbX = -0.55;
            rElbX = isAiming ? -0.35 : -0.50;
            torsoX = 0.08 * riseNorm;
          } else {
            // Falling: subtle downward reach & arms out for balance
            const fallNorm = Math.min(1, Math.abs(vy) / 14);
            lHipX = -0.16 * fallNorm;
            rHipX = 0.14 * fallNorm;
            lKneeX = 0.28 + 0.18 * fallNorm;
            rKneeX = 0.18 + 0.14 * fallNorm;
            lShX = -0.35;
            rShX = isAiming ? -1.15 : -0.35;
            lShZ = 0.34 + 0.18 * fallNorm;
            rShZ = isAiming ? -0.05 : -(0.34 + 0.18 * fallNorm);
            lElbX = -0.38;
            rElbX = isAiming ? -0.35 : -0.38;
            torsoX = 0.05;
          }
        } else if (speed > 0.25) {
          // WALK & RUN CYCLE (velocity-proportional stride, knee bend, elbow swing, torso twist & hip bob)
          const runFactor = Math.max(0, Math.min(1, (speed - 6.0) / 10.5));
          const freqScale = 1.15 + runFactor * 0.22;
          rig.walkPhase += dt * Math.max(3.2, speed * freqScale);
          const ph = rig.walkPhase;
          const s = Math.sin(ph);
          const c = Math.cos(ph);

          const strideAmp = 0.42 + runFactor * 0.44;
          lHipX = s * strideAmp;
          rHipX = -s * strideAmp;

          // Dynamic knee flexion: bend knee while leg swings forward/back, straighten on plant
          const lLift = Math.max(0, -c);
          const rLift = Math.max(0, c);
          lKneeX = 0.12 + lLift * (0.58 + runFactor * 0.52) + Math.max(0, s) * 0.16;
          rKneeX = 0.12 + rLift * (0.58 + runFactor * 0.52) + Math.max(0, -s) * 0.16;

          // Counter-swinging arms with natural elbow flexion
          const armAmp = 0.38 + runFactor * 0.46;
          lShX = -s * armAmp;
          rShX = isAiming ? (-1.22 + s * 0.08) : (s * armAmp);
          lShZ = 0.08 + runFactor * 0.06;
          rShZ = isAiming ? -0.04 : -(0.08 + runFactor * 0.06);
          lElbX = -(0.28 + runFactor * 0.52 + Math.max(0, -s) * 0.32);
          rElbX = isAiming ? -0.32 : -(0.28 + runFactor * 0.52 + Math.max(0, s) * 0.32);

          // Torso forward sprint lean, counter-rotation twist & pelvis vertical stride bob
          torsoX = 0.05 + runFactor * 0.14;
          torsoY = -s * (0.08 + runFactor * 0.08);
          torsoZ = -s * 0.035;
          pelvisY = (rig.pelvisBaseY || 1.24) + Math.abs(c) * (0.045 + runFactor * 0.055);
          pelvisZ = s * 0.03;
          headX = -torsoX * 0.65;
          headY = -torsoY * 0.55;
        } else {
          // IDLE STATE: gentle breathing, subtle weight shift, relaxed arm sway
          const shift = Math.sin(rig._idlePhase * 0.5);
          pelvisY = (rig.pelvisBaseY || 1.24) + breath * 0.015;
          pelvisX = shift * 0.028;
          torsoZ = -shift * 0.022;
          lShZ = 0.06 + breath * 0.022;
          rShZ = isAiming ? -0.04 : -(0.06 + breath * 0.022);
          rShX = isAiming ? -1.22 : 0;
          lElbX = -0.18 - breath * 0.03;
          rElbX = isAiming ? -0.32 : (-0.18 - breath * 0.03);
          headY = Math.sin(rig._idlePhase * 0.35) * 0.06;
          if (rig.torso) {
            rig.torso.scale.set(1 + breath * 0.012, 1 + breath * 0.015, 1 + breath * 0.012);
          }
        }

        // Apply landing compression overlay (knee bend + pelvis/torso dip scaled by impact velocity)
        if (landDip > 0.005) {
          pelvisY -= landDip * 0.24;
          lHipX -= landDip * 0.38;
          rHipX -= landDip * 0.38;
          lKneeX += landDip * 0.72;
          rKneeX += landDip * 0.72;
          torsoX += landDip * 0.20;
        }

        if (speed > 0.25 && rig.torso) {
          rig.torso.scale.set(1, 1, 1);
        }

        // Smoothly damp every joint toward its target pose
        if (rig.pelvis) {
          rig.pelvis.position.y += (pelvisY - rig.pelvis.position.y) * dampFast;
          rig.pelvis.position.x += (pelvisX - rig.pelvis.position.x) * dampMed;
          rig.pelvis.rotation.z += (pelvisZ - rig.pelvis.rotation.z) * dampMed;
        }
        if (rig.torsoPivot) {
          rig.torsoPivot.rotation.x += (torsoX - rig.torsoPivot.rotation.x) * dampMed;
          rig.torsoPivot.rotation.y += (torsoY - rig.torsoPivot.rotation.y) * dampFast;
          rig.torsoPivot.rotation.z += (torsoZ - rig.torsoPivot.rotation.z) * dampMed;
        }
        if (rig.head) {
          rig.head.rotation.x += (headX - rig.head.rotation.x) * dampMed;
          rig.head.rotation.y += (headY - rig.head.rotation.y) * dampMed;
        }
        rig.leftLegPivot.rotation.x += (lHipX - rig.leftLegPivot.rotation.x) * dampFast;
        rig.rightLegPivot.rotation.x += (rHipX - rig.rightLegPivot.rotation.x) * dampFast;
        rig.leftLegPivot.rotation.z += (0 - rig.leftLegPivot.rotation.z) * dampFast;
        rig.rightLegPivot.rotation.z += (0 - rig.rightLegPivot.rotation.z) * dampFast;
        if (rig.leftKnee) rig.leftKnee.rotation.x += (lKneeX - rig.leftKnee.rotation.x) * dampFast;
        if (rig.rightKnee) rig.rightKnee.rotation.x += (rKneeX - rig.rightKnee.rotation.x) * dampFast;

        rig.leftArmPivot.rotation.x += (lShX - rig.leftArmPivot.rotation.x) * dampFast;
        rig.rightArmPivot.rotation.x += (rShX - rig.rightArmPivot.rotation.x) * dampFast;
        rig.leftArmPivot.rotation.z += (lShZ - rig.leftArmPivot.rotation.z) * dampMed;
        rig.rightArmPivot.rotation.z += (rShZ - rig.rightArmPivot.rotation.z) * dampMed;
        if (rig.leftElbow) rig.leftElbow.rotation.x += (lElbX - rig.leftElbow.rotation.x) * dampFast;
        if (rig.rightElbow) rig.rightElbow.rotation.x += (rElbX - rig.rightElbow.rotation.x) * dampFast;
      }

      // ==========================================
      // 5B. METRO ROYAL 9F ROOFTOP SWIMMING POOL PHYSICS, ANIMATION & WATER SPLASHES
      // ==========================================
      const METRO_ROYAL_POOL = {
        bldgX: -135,
        bldgZ: 135,
        worldX: -135 - 2.2, // -137.2 (Center of bigger 16.8m x 12.4m pool)
        worldZ: 135 + 2.0,  // 137.0
        halfW: 8.15,        // Inside the bigger 16.8m wide pool basin
        halfD: 5.95,        // Inside the bigger 12.4m deep pool basin
        deckY: 52.4,        // 9F Rooftop deck slab height (8 * 6.5 + 0.4)
        waterSurfaceY: 53.31
      };

      const poolRipples = [];
      const poolDroplets = [];
      const rippleRingGeo = new THREE.RingGeometry(0.28, 0.44, 20);
      const dropletGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
      const dropletMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

      function spawnWaterSplash(wx, wy, wz, dropletCount = 10) {
        const rMat = new THREE.MeshBasicMaterial({
          color: 0xe0f2fe,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          depthWrite: false
        });
        const ring = new THREE.Mesh(rippleRingGeo, rMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(wx, wy + 0.03, wz);
        scene.add(ring);
        poolRipples.push({ mesh: ring, mat: rMat, age: 0, maxAge: 0.95 });

        for (let i = 0; i < dropletCount; i++) {
          const dMesh = new THREE.Mesh(dropletGeo, dropletMat);
          const ang = Math.random() * Math.PI * 2;
          const spd = 1.4 + Math.random() * 3.2;
          dMesh.position.set(
            wx + Math.cos(ang) * 0.35,
            wy + 0.1,
            wz + Math.sin(ang) * 0.35
          );
          scene.add(dMesh);
          poolDroplets.push({
            mesh: dMesh,
            vx: Math.cos(ang) * spd,
            vy: 3.2 + Math.random() * 4.2,
            vz: Math.sin(ang) * spd,
            age: 0,
            maxAge: 0.65
          });
        }
      }

      function updatePoolParticles(dt) {
        for (let i = poolRipples.length - 1; i >= 0; i--) {
          const r = poolRipples[i];
          r.age += dt;
          if (r.age >= r.maxAge) {
            scene.remove(r.mesh);
            r.mat.dispose();
            poolRipples.splice(i, 1);
          } else {
            const p = r.age / r.maxAge;
            const s = 1.0 + p * 5.2;
            r.mesh.scale.set(s, s, 1);
            r.mat.opacity = 0.85 * (1 - p);
          }
        }

        for (let i = poolDroplets.length - 1; i >= 0; i--) {
          const d = poolDroplets[i];
          d.age += dt;
          if (d.age >= d.maxAge) {
            scene.remove(d.mesh);
            poolDroplets.splice(i, 1);
          } else {
            d.vy -= 16.0 * dt;
            d.mesh.position.x += d.vx * dt;
            d.mesh.position.y += d.vy * dt;
            d.mesh.position.z += d.vz * dt;
          }
        }
      }

      function getActivePoolSpecAt(px, py, pz) {
        if (
          py >= METRO_ROYAL_POOL.deckY - 1.2 &&
          py <= METRO_ROYAL_POOL.deckY + 4.5 &&
          Math.abs(px - METRO_ROYAL_POOL.worldX) <= METRO_ROYAL_POOL.halfW &&
          Math.abs(pz - METRO_ROYAL_POOL.worldZ) <= METRO_ROYAL_POOL.halfD
        ) {
          return {
            id: 'sky_pool',
            title: '🏨 Metro Royal 9F Sky Pool',
            worldX: METRO_ROYAL_POOL.worldX,
            worldZ: METRO_ROYAL_POOL.worldZ,
            deckY: METRO_ROYAL_POOL.deckY,
            waterSurfaceY: METRO_ROYAL_POOL.waterSurfaceY
          };
        }
        if (
          typeof INDOOR_POOL_CENTER !== 'undefined' &&
          py <= 4.2 &&
          Math.abs(px - INDOOR_POOL_CENTER.x) <= INDOOR_POOL_CENTER.halfW &&
          Math.abs(pz - INDOOR_POOL_CENTER.z) <= INDOOR_POOL_CENTER.halfD
        ) {
          return {
            id: 'indoor_pool',
            title: '🏊 Grand Indoor Olympic Pool',
            worldX: INDOOR_POOL_CENTER.x,
            worldZ: INDOOR_POOL_CENTER.z,
            deckY: INDOOR_POOL_CENTER.deckY,
            waterSurfaceY: INDOOR_POOL_CENTER.waterSurfaceY
          };
        }
        return null;
      }

      function getCurrentWaterSurfaceY(px, py, pz) {
        const spec = getActivePoolSpecAt(px, py, pz);
        if (spec) return spec.waterSurfaceY;
        return py > 25 ? METRO_ROYAL_POOL.waterSurfaceY : 1.28;
      }

      function isPlayerInSwimmingPool(px, py, pz) {
        if (player.inArena || player.inHelicopter || player.activeVehicle) return false;
        return !!getActivePoolSpecAt(px, py, pz);
      }

      function isPlayerOnMetroRoyalPoolRoof(px, py, pz) {
        if (player.inArena || player.inHelicopter || player.activeVehicle) return false;
        const onRoyalRoof =
          py >= METRO_ROYAL_POOL.deckY - 1.2 &&
          Math.abs(px - METRO_ROYAL_POOL.bldgX) <= 14.2 &&
          Math.abs(pz - METRO_ROYAL_POOL.bldgZ) <= 14.2;
        const inIndoorAquaticHall =
          typeof INDOOR_POOL_CENTER !== 'undefined' &&
          py <= 4.5 &&
          Math.abs(px - INDOOR_POOL_CENTER.x) <= INDOOR_POOL_CENTER.w / 2 &&
          Math.abs(pz - INDOOR_POOL_CENTER.z) <= INDOOR_POOL_CENTER.d / 2;
        return onRoyalRoof || inIndoorAquaticHall;
      }

      function animateSwimmingCharacterAt(rig, px, py, pz, yaw, speed, dt, timeSec) {
        if (rig.visualRoot) rig.visualRoot.rotation.set(0, 0, 0);
        if (rig.pelvis) {
          rig.pelvis.position.set(0, rig.pelvisBaseY || 1.24, 0);
          rig.pelvis.rotation.set(0, 0, 0);
        }
        if (rig.torsoPivot) rig.torsoPivot.rotation.set(0, 0, 0);
        if (rig.leftKnee) rig.leftKnee.rotation.x = 0.25;
        if (rig.rightKnee) rig.rightKnee.rotation.x = 0.25;
        if (rig.leftElbow) rig.leftElbow.rotation.x = -0.35;
        if (rig.rightElbow) rig.rightElbow.rotation.x = -0.35;
        rig.root.rotation.order = 'YXZ';
        rig.root.rotation.y = yaw + Math.PI;

        const poolSpec = getActivePoolSpecAt(px, py, pz);
        const curDeckY = poolSpec ? poolSpec.deckY : (py > 25 ? METRO_ROYAL_POOL.deckY : 0.36);
        const curWaterY = poolSpec ? poolSpec.waterSurfaceY : (py > 25 ? METRO_ROYAL_POOL.waterSurfaceY : 1.28);
        const jumpOffset = Math.max(0, py - curDeckY);

        if (speed > 0.2) {
          rig.walkPhase += dt * speed * 0.95;
          const sp = rig.walkPhase;

          const fwdX = -Math.sin(yaw);
          const fwdZ = -Math.cos(yaw);
          const waveBob = Math.sin(timeSec * 3.8) * 0.04;

          rig.root.position.set(
            px - fwdX * 1.15,
            curWaterY - 0.52 + waveBob + jumpOffset,
            pz - fwdZ * 1.15
          );

          rig.root.rotation.x = 1.32;
          rig.root.rotation.z = Math.sin(sp) * 0.12;

          if (rig.head) {
            rig.head.rotation.x = -0.82 + Math.sin(sp) * 0.08;
          }

          const leftPhase = sp;
          const rightPhase = sp + Math.PI;
          rig.leftArmPivot.rotation.x = Math.PI + Math.sin(leftPhase) * 1.05;
          rig.rightArmPivot.rotation.x = Math.PI + Math.sin(rightPhase) * 1.05;
          rig.leftArmPivot.rotation.z = 0.25 + Math.max(0, Math.cos(leftPhase)) * 0.32;
          rig.rightArmPivot.rotation.z = -0.25 - Math.max(0, Math.cos(rightPhase)) * 0.32;

          rig.leftLegPivot.rotation.x = Math.sin(sp * 2.6) * 0.42;
          rig.rightLegPivot.rotation.x = -Math.sin(sp * 2.6) * 0.42;
          rig.leftLegPivot.rotation.z = 0.06;
          rig.rightLegPivot.rotation.z = -0.06;
        } else {
          const bob = Math.sin(timeSec * 3.0) * 0.06;
          rig.root.position.set(
            px,
            curWaterY - 2.22 + bob + jumpOffset,
            pz
          );
          rig.root.rotation.x = 0.14;
          rig.root.rotation.z = Math.sin(timeSec * 2.0) * 0.04;

          if (rig.head) {
            rig.head.rotation.x = -0.1;
          }

          rig.leftArmPivot.rotation.x = -1.15 + Math.sin(timeSec * 3.4) * 0.22;
          rig.rightArmPivot.rotation.x = -1.15 + Math.cos(timeSec * 3.4) * 0.22;
          rig.leftArmPivot.rotation.z = 0.48 + Math.sin(timeSec * 3.4) * 0.26;
          rig.rightArmPivot.rotation.z = -0.48 - Math.sin(timeSec * 3.4) * 0.26;

          rig.leftLegPivot.rotation.x = Math.sin(timeSec * 4.0) * 0.32;
          rig.rightLegPivot.rotation.x = -Math.sin(timeSec * 4.0) * 0.32;
          rig.leftLegPivot.rotation.z = 0.12;
          rig.rightLegPivot.rotation.z = -0.12;
        }
      }

      function animateSwimmingCharacter(rig, speed, dt, timeSec) {
        animateSwimmingCharacterAt(rig, player.x, player.y, player.z, player.yaw, speed, dt, timeSec);
      }

      // ==========================================
      // 6A. 3D FLOATING PLAYER NAME TAG SPRITE GENERATOR
      // ==========================================
      function drawNameTagCanvas(canvas, playerName, badgeText, borderHex = '#22d3ee', hpPercent = 100) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = borderHex;
        ctx.lineWidth = 5;
        const r = 22;
        ctx.beginPath();
        ctx.moveTo(10 + r, 8);
        ctx.lineTo(W - 10 - r, 8);
        ctx.quadraticCurveTo(W - 10, 8, W - 10, 8 + r);
        ctx.lineTo(W - 10, H - 8 - r);
        ctx.quadraticCurveTo(W - 10, H - 8, W - 10 - r, H - 8);
        ctx.lineTo(10 + r, H - 8);
        ctx.quadraticCurveTo(10, H - 8, 10, H - 8 - r);
        ctx.lineTo(10, 8 + r);
        ctx.quadraticCurveTo(10, 8, 10 + r, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(38, 44, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 28px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const displayStr = String(playerName || 'Player').slice(0, 18);
        ctx.fillText(displayStr, W / 2 + 10, 40);

        ctx.fillStyle = borderHex;
        ctx.font = '700 16px Inter, system-ui, sans-serif';
        ctx.fillText(badgeText || 'ONLINE PLAYER', W / 2, 72);

        const barW = W - 80;
        const barX = 40;
        const barY = 88;
        ctx.fillStyle = 'rgba(51, 65, 85, 0.9)';
        ctx.fillRect(barX, barY, barW, 8);
        ctx.fillStyle = hpPercent > 40 ? '#10b981' : '#f43f5e';
        ctx.fillRect(barX, barY, Math.max(0, Math.min(1, hpPercent / 100)) * barW, 8);
      }

      function createPlayerNameTagSprite(playerName, badgeText, borderHex = '#22d3ee', isLocalPlayer = false) {
        const c = document.createElement('canvas');
        c.width = 384;
        c.height = 112;
        drawNameTagCanvas(c, playerName, badgeText, borderHex, 100);
        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          opacity: isLocalPlayer ? 0.78 : 0.92,
          depthTest: true
        });
        const sprite = new THREE.Sprite(mat);
        if (isLocalPlayer) {
          sprite.scale.set(1.75, 0.50, 1);
          sprite.position.set(0, 3.72, 0);
        } else {
          sprite.scale.set(2.35, 0.68, 1);
          sprite.position.set(0, 3.85, 0);
        }
        sprite.userData = { canvas: c, texture: tex, lastKey: '' };
        return sprite;
      }

      function updatePlayerNameTagSprite(sprite, playerName, badgeText, borderHex = '#22d3ee', hpPercent = 100) {
        if (!sprite || !sprite.userData || !sprite.userData.canvas) return;
        const key = `${playerName}|${badgeText}|${borderHex}|${Math.round(hpPercent)}`;
        if (sprite.userData.lastKey === key) return;
        sprite.userData.lastKey = key;
        drawNameTagCanvas(sprite.userData.canvas, playerName, badgeText, borderHex, hpPercent);
        sprite.userData.texture.needsUpdate = true;
      }

      let savedMpName = `Player_${Math.floor(100 + Math.random() * 899)}`;
      try {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('blocky_metro_player_name')) {
          savedMpName = localStorage.getItem('blocky_metro_player_name');
        }
      } catch (e) {}

      // ==========================================
      // 6. PLAYER STATE & SETUP
      // ==========================================
      const playerRig = createBoxCharacter({
        skinColor: 0xfde68a,
        shirtColor: 0x0284c7,
        pantsColor: 0x0f172a,
        visorColor: 0x22d3ee,
        hasGun: true
      });
      if (playerRig.gunGroup) playerRig.gunGroup.visible = false;
      playerRig.rightArmPivot.rotation.x = 0;

      const localPlayerNameTag = createPlayerNameTagSprite(savedMpName, 'YOU • ONLINE', '#38bdf8', true);
      playerRig.root.add(localPlayerNameTag);

      scene.add(playerRig.root);

      const player = {
        x: 0,
        y: 0,
        z: 28,
        vy: 0,
        yaw: Math.PI,
        pitch: 0.18,
        radius: 0.9,
        hp: 100,
        maxHp: 100,
        hunger: 100,
        maxHunger: 100,
        hungerWarnTimer: 0,
        ammo: 30,
        maxAmmo: 30,
        splats: 0,
        inArena: false,
        inHelicopter: false,
        activeVehicle: null,
        isSwimming: false,
        swimStrokeTimer: 0,
        slidingFirePole: false,
        divingBoardState: null,
        actionSpinTimer: 0,
        currentSpeed: 0,
        firstPerson: false,
        lastShotTime: 0,
        coins: 250,
        xp: 0,
        level: 1,
        upgrades: {
          xpBooster: 0,
          rapidMarker: 0,
          megaHopper: 0,
          speedBoots: 0,
          kartTurbo: 0,
          vipStyle: 0
        }
      };

      const kartRaceState = {
        active: false,
        mode: 'solo', // 'solo' | 'ai' | 'pvp'
        totalLaps: 2,
        lap: 1,
        lapTime: 0,
        bestLap: null,
        nextCheckpointIdx: 0,
        countdown: 0,
        pvpRaceId: null,
        pvpOpponentId: null,
        pvpOpponentName: ''
      };

      // Autonomous AI Rival Buggy (identical size & shape, Crimson Red color)
      const AI_TRACK_WAYPOINTS = [
        { x: 244, z: -75 },
        { x: 314, z: -75 },
        { x: 387, z: -75 },
        { x: 387, z: 0 },
        { x: 387, z: 75 },
        { x: 314, z: 75 },
        { x: 244, z: 75 },
        { x: 244, z: -22 }
      ];

      const aiRivalModel = createGroundVehicleModel('buggy', { primary: 0xdc2626, accent: 0xf87171 });
      const aiRivalDriver = createBoxCharacter({
        skinColor: 0xfde68a,
        shirtColor: 0xef4444,
        pantsColor: 0x0f172a,
        visorColor: 0xfacc15,
        hasGun: false
      });
      aiRivalDriver.root.scale.set(0.54, 0.46, 0.54);
      aiRivalDriver.root.position.set(-0.25, 0.22, 0.1);
      aiRivalDriver.root.rotation.set(0, Math.PI, 0);
      const aiRivalTag = createPlayerNameTagSprite('AI RIVAL', 'CRIMSON BUGGY', '#ef4444');
      aiRivalTag.position.set(0, 4.4, 0);
      aiRivalModel.root.add(aiRivalDriver.root);
      aiRivalModel.root.add(aiRivalTag);
      aiRivalModel.root.visible = false;
      scene.add(aiRivalModel.root);

      const AI_DIFFICULTY_SPECS = {
        easy:   { label: 'Easy',   maxSpeed: 34.5, accel: 21.0, winCoins: 150, winXp: 160, badge: 'EASY AI' },
        medium: { label: 'Medium', maxSpeed: 40.5, accel: 26.0, winCoins: 220, winXp: 240, badge: 'MEDIUM AI' },
        hard:   { label: 'Hard',   maxSpeed: 46.5, accel: 32.0, winCoins: 320, winXp: 350, badge: 'HARD AI' },
        pro:    { label: 'Pro',    maxSpeed: 52.0, accel: 38.0, winCoins: 450, winXp: 500, badge: 'PRO AI' }
      };

      const aiRaceConfig = {
        difficulty: 'medium',
        laps: 2
      };

      const aiRivalBuggy = {
        active: false,
        model: aiRivalModel,
        difficulty: 'medium',
        x: 244.5,
        z: -15,
        yaw: 0,
        speed: 0,
        maxSpeed: 40.5,
        accel: 26.0,
        wpIdx: 0,
        lap: 1,
        finished: false
      };

      function setAiRaceDifficulty(diffKey) {
        if (!AI_DIFFICULTY_SPECS[diffKey]) return;
        aiRaceConfig.difficulty = diffKey;
        document.querySelectorAll('.ai-diff-btn').forEach((btn) => {
          const isSel = btn.dataset.diff === diffKey;
          btn.className = isSel
            ? 'ai-diff-btn py-2 px-3 rounded-xl bg-amber-500/25 text-amber-200 border-2 border-amber-400 transition text-left'
            : 'ai-diff-btn py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition text-left';
        });
      }

      function setAiRaceLaps(n) {
        const clamped = Math.max(1, Math.min(15, parseInt(n, 10) || 2));
        aiRaceConfig.laps = clamped;
        const disp = document.getElementById('ai-laps-display');
        if (disp) disp.textContent = String(clamped);
        document.querySelectorAll('.ai-lap-preset').forEach((btn) => {
          const isSel = parseInt(btn.dataset.laps, 10) === clamped;
          btn.className = isSel
            ? 'ai-lap-preset py-1 rounded-lg bg-amber-400 text-slate-950 font-black border border-amber-300'
            : 'ai-lap-preset py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600';
        });
      }

      function openAiRaceModal() {
        const m = document.getElementById('ai-race-modal');
        if (!m) return;
        setAiRaceDifficulty(aiRaceConfig.difficulty);
        setAiRaceLaps(aiRaceConfig.laps);
        m.classList.remove('hidden');
        m.classList.add('flex');
        syncCursorAndPointerLock();
      }

      function closeAiRaceModal() {
        const m = document.getElementById('ai-race-modal');
        if (!m) return;
        m.classList.add('hidden');
        m.classList.remove('flex');
        syncCursorAndPointerLock();
      }

      function startAIRivalBuggyRace(diffKey = aiRaceConfig.difficulty, numLaps = aiRaceConfig.laps) {
        const spec = AI_DIFFICULTY_SPECS[diffKey] || AI_DIFFICULTY_SPECS.medium;
        const totalLaps = Math.max(1, Math.min(15, parseInt(numLaps, 10) || 2));

        if (player.inArena) returnToCityCenter(237.5, -15, 0);
        if (player.inHelicopter) exitHelicopter();
        if (!player.activeVehicle || !player.activeVehicle.isBuggy) {
          if (player.activeVehicle) exitGroundVehicle();
          const buggy = driveableVehicles.find((v) => v.isBuggy);
          if (buggy) enterGroundVehicle(buggy);
        }
        const pVeh = player.activeVehicle;
        if (!pVeh) return;

        pVeh.x = 237.5;
        pVeh.z = -15;
        pVeh.yaw = 0;
        pVeh.speed = 0;
        pVeh.turboTimer = 0;
        pVeh.model.root.position.set(pVeh.x, 0, pVeh.z);
        pVeh.model.root.rotation.y = 0;
        player.x = pVeh.x;
        player.z = pVeh.z;
        player.yaw = 0;

        aiRivalBuggy.active = true;
        aiRivalBuggy.difficulty = diffKey;
        aiRivalBuggy.maxSpeed = spec.maxSpeed;
        aiRivalBuggy.accel = spec.accel;
        aiRivalBuggy.x = 244.5;
        aiRivalBuggy.z = -15;
        aiRivalBuggy.yaw = 0;
        aiRivalBuggy.speed = 0;
        aiRivalBuggy.wpIdx = 0;
        aiRivalBuggy.lap = 1;
        aiRivalBuggy.finished = false;
        aiRivalBuggy.model.root.position.set(aiRivalBuggy.x, 0, aiRivalBuggy.z);
        aiRivalBuggy.model.root.rotation.y = 0;
        aiRivalBuggy.model.root.visible = true;
        updatePlayerNameTagSprite(aiRivalTag, `AI (${spec.label.toUpperCase()})`, spec.badge, '#ef4444', 100);

        kartRaceState.active = true;
        kartRaceState.mode = 'ai';
        kartRaceState.totalLaps = totalLaps;
        kartRaceState.lap = 1;
        kartRaceState.lapTime = 0;
        kartRaceState.nextCheckpointIdx = 0;
        kartRaceState.countdown = 3.0;

        SoundFX.playFanfare();
        pushFeedMessage(`🏁 ${totalLaps}-LAP RACE vs ${spec.label.toUpperCase()} AI STARTED! 3... 2... 1... GO!`, 'border-l-amber-400 text-amber-200');
      }

      // Multiplayer PvP Buggy Race Invitation State (Real Players Only — Never NPCs!)
      const mpBuggyRace = {
        selectedLaps: 2,
        sentToId: null,
        sentRaceId: null,
        sentLaps: 2,
        acceptedRaceId: null,
        finishedRaceId: null,
        activeRaceId: null
      };

      function startMultiplayerBuggyRace(raceId, opponentId, opponentName, isHost, numLaps = 2) {
        const totalLaps = Math.max(1, Math.min(10, parseInt(numLaps, 10) || 2));
        if (player.inArena) returnToCityCenter(241, -15, 0);
        if (player.inHelicopter) exitHelicopter();
        if (!player.activeVehicle || !player.activeVehicle.isBuggy) {
          if (player.activeVehicle) exitGroundVehicle();
          const buggy = driveableVehicles.find((v) => v.isBuggy);
          if (buggy) enterGroundVehicle(buggy);
        }
        const pVeh = player.activeVehicle;
        if (!pVeh) return;

        aiRivalBuggy.active = false;
        aiRivalBuggy.model.root.visible = false;

        pVeh.x = isHost ? 237.5 : 244.5;
        pVeh.z = -15;
        pVeh.yaw = 0;
        pVeh.speed = 0;
        pVeh.turboTimer = 0;
        pVeh.model.root.position.set(pVeh.x, 0, pVeh.z);
        pVeh.model.root.rotation.y = 0;
        player.x = pVeh.x;
        player.z = pVeh.z;
        player.yaw = 0;

        mpBuggyRace.activeRaceId = raceId;
        mpBuggyRace.finishedRaceId = null;

        kartRaceState.active = true;
        kartRaceState.mode = 'pvp';
        kartRaceState.totalLaps = totalLaps;
        kartRaceState.lap = 1;
        kartRaceState.lapTime = 0;
        kartRaceState.nextCheckpointIdx = 0;
        kartRaceState.countdown = 3.0;
        kartRaceState.pvpRaceId = raceId;
        kartRaceState.pvpOpponentId = opponentId;
        kartRaceState.pvpOpponentName = opponentName;

        SoundFX.playFanfare();
        pushFeedMessage(`🏁 ${totalLaps}-LAP MULTIPLAYER BUGGY RACE vs ${opponentName}! 3... 2... 1... GO!`, 'border-l-emerald-400 text-emerald-200');
      }

      try {
        const savedEco = localStorage.getItem('blocky_metro_economy_v1');
        if (savedEco) {
          const parsed = JSON.parse(savedEco);
          if (typeof parsed.coins === 'number') player.coins = parsed.coins;
          if (typeof parsed.xp === 'number') player.xp = parsed.xp;
          if (typeof parsed.level === 'number') player.level = parsed.level;
          if (parsed.upgrades) Object.assign(player.upgrades, parsed.upgrades);
        }
      } catch (e) {}

      function applyEconomyUpgradesToPlayer() {
        const hopperLevels = [30, 45, 60, 80];
        player.maxAmmo = hopperLevels[Math.min(3, player.upgrades.megaHopper || 0)];
        if (player.ammo > player.maxAmmo) player.ammo = player.maxAmmo;
      }
      applyEconomyUpgradesToPlayer();

      function saveEconomyLocal() {
        try {
          localStorage.setItem('blocky_metro_economy_v1', JSON.stringify({
            coins: player.coins,
            xp: player.xp,
            level: player.level,
            upgrades: player.upgrades
          }));
        } catch (e) {}
      }

      function getXpMultiplier() {
        return 1.0 + (player.upgrades.xpBooster || 0) * 0.5;
      }

      function awardCoinsAndXP(coinGain, baseXpGain, reasonText) {
        const mult = getXpMultiplier();
        const xpGain = Math.round((baseXpGain || 0) * mult);
        player.coins += Math.round(coinGain || 0);
        player.xp += xpGain;
        const newLevel = Math.floor(player.xp / 200) + 1;
        if (newLevel > player.level) {
          const levelsGained = newLevel - player.level;
          player.level = newLevel;
          const bonus = levelsGained * 50;
          player.coins += bonus;
          SoundFX.playFanfare();
          pushFeedMessage(`🎉 LEVEL UP! Reached Level ${player.level}! (+${bonus} Bonus Coins)`, 'border-l-amber-400 text-amber-200');
        } else if (reasonText) {
          pushFeedMessage(`${reasonText} (+${coinGain}🪙, +${xpGain} XP)`, 'border-l-amber-400 text-amber-200');
        }
        saveEconomyLocal();
        updateHUD();
      }

      // ==========================================
      // 6B. WORKING 3D HELICOPTER (SKY-HAWK CHOPPER)
      // ==========================================
      function createHelicopterModel() {
        const root = new THREE.Group();
        const tiltGroup = new THREE.Group();
        root.add(tiltGroup);

        const skidMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.72 });
        [-1.35, 1.35].forEach((sx) => {
          const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 5.4, 10), skidMat);
          skid.rotation.x = Math.PI / 2;
          skid.position.set(sx, 0.15, 0);
          tiltGroup.add(skid);

          const skidTip = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.10, 8, 12, Math.PI / 2), skidMat);
          skidTip.rotation.y = Math.PI / 2;
          skidTip.position.set(sx, 0.50, -2.7);
          tiltGroup.add(skidTip);

          [-1.2, 1.2].forEach((sz) => {
            const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.92, 8), skidMat);
            strut.position.set(sx, 0.55, sz);
            tiltGroup.add(strut);
          });
        });

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.28, metalness: 0.52 });
        const trimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.30, metalness: 0.55 });
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0xbae6fd,
          roughness: 0.08,
          metalness: 0.72,
          transparent: true,
          opacity: 0.58
        });

        // Sculpted rounded fuselage + aerodynamic nose cone
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.75, 3.4), bodyMat);
        cabin.position.set(0, 1.65, 0.15);
        cabin.castShadow = true;
        tiltGroup.add(cabin);

        const noseBubbleGeo = new THREE.SphereGeometry(1.26, 16, 12);
        noseBubbleGeo.scale(1.0, 0.72, 1.18);
        noseBubbleGeo.computeVertexNormals();
        const windshield = new THREE.Mesh(noseBubbleGeo, glassMat);
        windshield.position.set(0, 1.62, -1.55);
        tiltGroup.add(windshield);

        const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.32, 3.46), trimMat);
        stripe.position.set(0, 1.45, 0.15);
        tiltGroup.add(stripe);

        // Tapered cylindrical tail boom
        const tailBoomGeo = new THREE.CylinderGeometry(0.18, 0.42, 4.7, 12);
        tailBoomGeo.computeVertexNormals();
        const tailBoom = new THREE.Mesh(tailBoomGeo, bodyMat);
        tailBoom.rotation.x = Math.PI / 2;
        tailBoom.position.set(0, 1.85, 3.85);
        tailBoom.castShadow = true;
        tiltGroup.add(tailBoom);

        const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.45, 1.1), trimMat);
        tailFin.position.set(0, 2.4, 5.8);
        tiltGroup.add(tailFin);

        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.65, 12), skidMat);
        mast.position.set(0, 2.8, 0);
        tiltGroup.add(mast);

        const mainRotor = new THREE.Group();
        mainRotor.position.set(0, 3.1, 0);
        const bladeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const blade1 = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.08, 0.45), bladeMat);
        const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 9.6), bladeMat);
        mainRotor.add(blade1);
        mainRotor.add(blade2);
        tiltGroup.add(mainRotor);

        const tailRotor = new THREE.Group();
        tailRotor.position.set(0.28, 2.4, 5.85);
        const tBlade1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.22), bladeMat);
        const tBlade2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 1.8), bladeMat);
        tailRotor.add(tBlade1);
        tailRotor.add(tBlade2);
        tiltGroup.add(tailRotor);

        return { root, tiltGroup, mainRotor, tailRotor };
      }

      const heliModel = createHelicopterModel();
      scene.add(heliModel.root);

      const helicopter = {
        model: heliModel,
        x: -25 - 2.2,
        y: 7 * 6.5 + 0.45,
        z: -80,
        vx: 0,
        vy: 0,
        vz: 0,
        yaw: 0,
        rotorAngle: 0,
        ascendHeld: false,
        descendHeld: false,
        rotorAudioTimer: 0
      };
      helicopter.model.root.position.set(helicopter.x, helicopter.y, helicopter.z);

      // ==========================================
      // 6C. OPERATIONAL CITY GROUND VEHICLES (2 TAXIS, POLICE CAR, FIRE ENGINE, AMBULANCE)
      // ==========================================
      function createGroundVehicleModel(type, customColors = null) {
        const root = new THREE.Group();
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95, metalness: 0.04 });
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0x0f172a,
          roughness: 0.05,
          metalness: 0.25,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          envMapIntensity: 1.85,
          transparent: true,
          opacity: 0.78
        });
        const headlightMat = new THREE.MeshStandardMaterial({
          color: 0xfef9c3,
          emissive: 0xfef08a,
          emissiveIntensity: 2.2,
          roughness: 0.15
        });
        const taillightMat = new THREE.MeshStandardMaterial({
          color: 0xfca5a5,
          emissive: 0xef4444,
          emissiveIntensity: 1.85,
          roughness: 0.2
        });

        const isTruck = type === 'fire_engine' || type === 'ambulance';
        const chassisW = isTruck ? 3.2 : 2.6;
        const chassisL = type === 'fire_engine' ? 7.8 : (type === 'ambulance' ? 6.2 : 4.8);

        const chassisPivot = new THREE.Group();
        root.add(chassisPivot);
        const wheels = [];
        const headlightSprites = [];

        const wheelZ = chassisL * 0.32;
        const wheelX = chassisW * 0.5;
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.22, metalness: 0.88 });
        const spokeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 });
        [[-wheelX, -wheelZ], [wheelX, -wheelZ], [-wheelX, wheelZ], [wheelX, wheelZ]].forEach(([wx, wz]) => {
          const steerPivot = new THREE.Group();
          steerPivot.position.set(wx, 0.52, wz);
          root.add(steerPivot);

          const spinGroup = new THREE.Group();
          steerPivot.add(spinGroup);

          const wMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.40, 16), wheelMat);
          wMesh.rotation.z = Math.PI / 2;
          spinGroup.add(wMesh);

          const rimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.43, 12), rimMat);
          rimMesh.rotation.z = Math.PI / 2;
          spinGroup.add(rimMesh);

          const spokeBar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.48, 0.09), spokeMat);
          spinGroup.add(spokeBar);

          wheels.push({ steerPivot, spinGroup, isFront: wz < 0, radius: 0.52 });
        });

        let sirenLeft = null;
        let sirenRight = null;

        if (type === 'taxi') {
          const yellowMat = new THREE.MeshPhysicalMaterial({ color: 0xfacc15 , roughness: 0.28, metalness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.12, envMapIntensity: 1.35 });
          const body = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 1.0, chassisL), yellowMat);
          body.position.y = 0.95;
          chassisPivot.add(body);

          const cabin = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.3, 0.95, 2.5), yellowMat);
          cabin.position.set(0, 1.85, 0.15);
          chassisPivot.add(cabin);

          const wind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.2, 0.78, 2.6), glassMat);
          wind.position.set(0, 1.85, 0.15);
          chassisPivot.add(wind);

          const taxiSign = new THREE.Mesh(
            new THREE.BoxGeometry(0.95, 0.32, 0.42),
            new THREE.MeshBasicMaterial({ color: 0xfef08a })
          );
          taxiSign.position.set(0, 2.45, 0.1);
          chassisPivot.add(taxiSign);
        } else if (type === 'police') {
          const blackMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a , roughness: 0.28, metalness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.12, envMapIntensity: 1.35 });
          const whiteMat = new THREE.MeshPhysicalMaterial({ color: 0xf8fafc , roughness: 0.28, metalness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.12, envMapIntensity: 1.35 });
          const body = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 1.0, chassisL), blackMat);
          body.position.y = 0.95;
          chassisPivot.add(body);

          const doors = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.06, 0.85, 2.2), whiteMat);
          doors.position.set(0, 0.98, 0);
          chassisPivot.add(doors);

          const cabin = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.3, 0.95, 2.5), whiteMat);
          cabin.position.set(0, 1.85, 0.15);
          chassisPivot.add(cabin);

          const wind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.2, 0.78, 2.6), glassMat);
          wind.position.set(0, 1.85, 0.15);
          chassisPivot.add(wind);

          sirenLeft = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          sirenLeft.position.set(-0.42, 2.45, 0.1);
          chassisPivot.add(sirenLeft);

          sirenRight = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
          sirenRight.position.set(0.42, 2.45, 0.1);
          chassisPivot.add(sirenRight);
        } else if (type === 'ambulance') {
          const whiteMat = new THREE.MeshPhysicalMaterial({ color: 0xf8fafc , roughness: 0.28, metalness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.12, envMapIntensity: 1.35 });
          const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const cab = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 2.1, 2.2), whiteMat);
          cab.position.set(0, 1.45, -1.9);
          chassisPivot.add(cab);

          const wind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.2, 0.85, 0.2), glassMat);
          wind.position.set(0, 1.85, -3.02);
          chassisPivot.add(wind);

          const box = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.2, 2.55, 3.9), whiteMat);
          box.position.set(0, 1.7, 1.1);
          chassisPivot.add(box);

          const stripe = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.28, 0.38, 3.92), redMat);
          stripe.position.set(0, 1.4, 1.1);
          chassisPivot.add(stripe);

          [-1, 1].forEach((side) => {
            const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.32), redMat);
            vBar.position.set(side * (chassisW / 2 + 0.15), 2.15, 1.1);
            chassisPivot.add(vBar);
            const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 1.0), redMat);
            hBar.position.set(side * (chassisW / 2 + 0.15), 2.15, 1.1);
            chassisPivot.add(hBar);
          });

          sirenLeft = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.38), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          sirenLeft.position.set(-0.55, 2.65, -2.2);
          chassisPivot.add(sirenLeft);

          sirenRight = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.38), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          sirenRight.position.set(0.55, 2.65, -2.2);
          chassisPivot.add(sirenRight);
        } else if (type === 'fire_engine') {
          const redMat = new THREE.MeshPhysicalMaterial({ color: 0xdc2626 , roughness: 0.28, metalness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.12, envMapIntensity: 1.35 });
          const silverMat = new THREE.MeshPhysicalMaterial({ color: 0xe2e8f0 , roughness: 0.28, metalness: 0.34, clearcoat: 0.85, clearcoatRoughness: 0.12, envMapIntensity: 1.35 });
          const body = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 2.2, chassisL), redMat);
          body.position.set(0, 1.5, 0);
          chassisPivot.add(body);

          const wind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.25, 0.9, 0.2), glassMat);
          wind.position.set(0, 1.95, -chassisL / 2 - 0.02);
          chassisPivot.add(wind);

          const ladder = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 6.2), silverMat);
          ladder.position.set(0, 2.8, 0.5);
          chassisPivot.add(ladder);

          sirenLeft = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.38), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          sirenLeft.position.set(-0.65, 2.75, -3.1);
          chassisPivot.add(sirenLeft);

          sirenRight = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.38), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          sirenRight.position.set(0.65, 2.75, -3.1);
          chassisPivot.add(sirenRight);
        } else if (type === 'buggy' || type === 'gokart') {
          // ALL buggies share the EXACT same size & shape — varying ONLY by color!
          const primaryCol = (customColors && customColors.primary) || 0x06b6d4;
          const accentCol = (customColors && customColors.accent) || 0x22d3ee;
          const bodyMat = new THREE.MeshStandardMaterial({ color: primaryCol, roughness: 0.28, metalness: 0.45 });
          const accentMat = new THREE.MeshStandardMaterial({ color: accentCol, roughness: 0.25, metalness: 0.55 });
          const splatColors = [0xf43f5e, 0xa3e635, 0x22d3ee, 0xe879f9, 0xfacc15];

          // Uniform Buggy Chassis (2.5m x 0.56m x 4.2m)
          const deck = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.56, 4.2), bodyMat);
          deck.position.set(0, 0.66, 0);
          chassisPivot.add(deck);

          // Uniform Front Nosecone & Bumper
          const nose = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.48, 1.15), accentMat);
          nose.position.set(0, 0.72, -1.95);
          chassisPivot.add(nose);

          // Uniform Rear Racing Wing / Spoiler
          const wing = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.16, 0.65), new THREE.MeshBasicMaterial({ color: accentCol }));
          wing.position.set(0, 1.82, 1.82);
          chassisPivot.add(wing);

          [-0.85, 0.85].forEach((sx) => {
            const strut = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.9, 0.18), wheelMat);
            strut.position.set(sx, 1.2, 1.75);
            chassisPivot.add(strut);
          });

          // Uniform Cylindrical Tubular Roll Cage & Twin Exhausts on EVERY Buggy
          const cageMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28, metalness: 0.82 });
          [-1.05, 1.05].forEach((cx) => {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1.38, 10), cageMat);
            bar.position.set(cx, 1.45, 0.45);
            chassisPivot.add(bar);

            const frontPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.55, 10), cageMat);
            frontPillar.position.set(cx, 1.42, -0.58);
            frontPillar.rotation.x = 0.48;
            chassisPivot.add(frontPillar);

            const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.65, 10), rimMat);
            exhaust.rotation.x = Math.PI / 2;
            exhaust.position.set(cx * 0.55, 0.72, 2.18);
            chassisPivot.add(exhaust);
          });
          [-0.25, 0.45].forEach((tz) => {
            const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.18, 10), cageMat);
            crossBar.rotation.z = Math.PI / 2;
            crossBar.position.set(0, 2.12, tz);
            chassisPivot.add(crossBar);
          });

          // Paint-splatter decals across the hood & sidepods
          [[-0.75, 0.96, -0.8], [0.68, 0.96, -0.4], [-0.55, 0.96, 0.9], [0.85, 0.75, 0.3], [-0.95, 0.75, -0.2]].forEach(([px, py, pz], sIdx) => {
            const splat = new THREE.Mesh(
              new THREE.BoxGeometry(0.42, 0.12, 0.42),
              new THREE.MeshBasicMaterial({ color: splatColors[sIdx % splatColors.length] })
            );
            splat.position.set(px, py, pz);
            chassisPivot.add(splat);
          });
        }

        [-chassisW * 0.34, chassisW * 0.34].forEach((lx) => {
          const hl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.12), headlightMat);
          hl.position.set(lx, 0.95, -chassisL / 2 - 0.04);
          chassisPivot.add(hl);

          const hlGlow = new THREE.Sprite(vehicleHeadlightGlowMat);
          hlGlow.position.set(lx, 0.95, -chassisL / 2 - 0.22);
          hlGlow.scale.set(2.2, 2.2, 1);
          chassisPivot.add(hlGlow);
          headlightSprites.push(hlGlow);

          const tl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.12), taillightMat);
          tl.position.set(lx, 0.95, chassisL / 2 + 0.04);
          chassisPivot.add(tl);

          const tlGlow = new THREE.Sprite(vehicleTaillightGlowMat);
          tlGlow.position.set(lx, 0.95, chassisL / 2 + 0.18);
          tlGlow.scale.set(1.5, 1.5, 1);
          chassisPivot.add(tlGlow);
        });

        // Undercarriage Contact AO Shadow (grounds vehicle tires cleanly on asphalt & dirt)
        const vehAo = new THREE.Mesh(
          new THREE.PlaneGeometry(chassisW + 1.4, chassisL + 1.5),
          contactShadowMat
        );
        vehAo.rotation.x = -Math.PI / 2;
        vehAo.position.set(0, 0.06, 0);
        root.add(vehAo);

        root.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        return { root, chassisPivot, wheels, headlightSprites, sirenLeft, sirenRight };
      }

      function updateVehicleCosmeticMotion(model, speed, prevSpeed, steerInput, dt, timeSec, impactFlickerTimer) {
        if (!model || !model.chassisPivot) return;
        const absSpd = Math.abs(speed);
        const damp = 1.0 - Math.exp(-9.5 * dt);

        // Velocity-proportional wheel rotation & front-wheel steering
        if (model.wheels) {
          const targetSteer = steerInput * 0.36;
          for (let i = 0; i < model.wheels.length; i++) {
            const w = model.wheels[i];
            w.spinGroup.rotation.x -= (speed * dt) / w.radius;
            if (w.isFront) {
              w.steerPivot.rotation.y += (targetSteer - w.steerPivot.rotation.y) * Math.min(1, dt * 12);
            }
          }
        }

        // Cosmetic suspension pitch (acceleration squat / braking dive) + cornering body roll + engine idle vibration
        const accelEst = dt > 0.0001 ? Math.max(-40, Math.min(40, (speed - prevSpeed) / dt)) : 0;
        const targetPitch = Math.max(-0.075, Math.min(0.075, accelEst * 0.0018));
        const targetRoll = Math.max(-0.11, Math.min(0.11, -steerInput * Math.min(1, absSpd / 20) * 0.095));
        model.chassisPivot.rotation.x += (targetPitch - model.chassisPivot.rotation.x) * damp;
        model.chassisPivot.rotation.z += (targetRoll - model.chassisPivot.rotation.z) * damp;
        const idleVib = absSpd > 0.5 ? Math.sin(timeSec * 36) * 0.012 : Math.sin(timeSec * 22) * 0.004;
        model.chassisPivot.position.y = idleVib;

        // Cosmetic headlight halo flicker on sudden impact
        if (model.headlightSprites && model.headlightSprites.length > 0) {
          const flickScale = impactFlickerTimer > 0
            ? (Math.sin(timeSec * 75) > 0 ? 2.6 : 0.7)
            : 2.2;
          for (let i = 0; i < model.headlightSprites.length; i++) {
            model.headlightSprites[i].scale.set(flickScale, flickScale, 1);
          }
        }
      }

      const driveableVehicles = [
        {
          id: 'taxi_1',
          name: 'Metro Yellow Cab #1',
          badge: '🚕 Town Hall Taxi Stand',
          icon: '🚕',
          type: 'taxi',
          x: -14.2,
          z: 2.0,
          yaw: 0,
          speed: 0,
          maxSpeed: 29,
          sirenOn: false,
          hasSiren: false,
          mapColor: '#facc15'
        },
        {
          id: 'taxi_2',
          name: 'Metro Yellow Cab #2',
          badge: '🚕 Town Hall Taxi Stand',
          icon: '🚕',
          type: 'taxi',
          x: -14.2,
          z: 8.5,
          yaw: 0,
          speed: 0,
          maxSpeed: 29,
          sirenOn: false,
          hasSiren: false,
          mapColor: '#facc15'
        },
        {
          id: 'police_1',
          name: 'Police Interceptor #1',
          badge: '🚓 Police Headquarters Fleet',
          icon: '🚓',
          type: 'police',
          x: -25,
          z: -58.5,
          yaw: Math.PI / 2,
          speed: 0,
          maxSpeed: 34,
          sirenOn: false,
          hasSiren: true,
          mapColor: '#38bdf8'
        },
        {
          id: 'fire_engine_1',
          name: 'Fire Engine Ladder #1',
          badge: '🚒 Fire Station #1 Fleet',
          icon: '🚒',
          type: 'fire_engine',
          x: 25,
          z: -58.5,
          yaw: Math.PI / 2,
          speed: 0,
          maxSpeed: 27,
          sirenOn: false,
          hasSiren: true,
          mapColor: '#ef4444'
        },
        {
          id: 'ambulance_1',
          name: 'Emergency Ambulance #1',
          badge: '🚑 Metro Central Hospital Fleet',
          icon: '🚑',
          type: 'ambulance',
          x: 80,
          z: -58.5,
          yaw: -Math.PI / 2,
          speed: 0,
          maxSpeed: 31,
          sirenOn: false,
          hasSiren: true,
          mapColor: '#f8fafc'
        },
        {
          id: 'buggy_cyan',
          name: 'Cyan Splatter Buggy #1',
          badge: '🏎️ Outskirts Dirt Circuit',
          icon: '🏎️',
          type: 'buggy',
          isRaceKart: true,
          isBuggy: true,
          customColors: { primary: 0x06b6d4, accent: 0x22d3ee },
          x: 237.5,
          z: -10,
          yaw: 0,
          speed: 0,
          maxSpeed: 43,
          turboTimer: 0,
          sirenOn: false,
          hasSiren: false,
          mapColor: '#22d3ee'
        },
        {
          id: 'buggy_magenta',
          name: 'Magenta Splatter Buggy #2',
          badge: '🏎️ Outskirts Dirt Circuit',
          icon: '🏎️',
          type: 'buggy',
          isRaceKart: true,
          isBuggy: true,
          customColors: { primary: 0xdb2777, accent: 0xf472b6 },
          x: 244.5,
          z: -10,
          yaw: 0,
          speed: 0,
          maxSpeed: 43,
          turboTimer: 0,
          sirenOn: false,
          hasSiren: false,
          mapColor: '#f472b6'
        },
        {
          id: 'buggy_gold',
          name: 'Gold Splatter Buggy #3',
          badge: '🏎️ Outskirts Dirt Circuit',
          icon: '🏎️',
          type: 'buggy',
          isRaceKart: true,
          isBuggy: true,
          customColors: { primary: 0xf59e0b, accent: 0xfacc15 },
          x: 241.0,
          z: -2,
          yaw: 0,
          speed: 0,
          maxSpeed: 43,
          turboTimer: 0,
          sirenOn: false,
          hasSiren: false,
          mapColor: '#f59e0b'
        }
      ];

      driveableVehicles.forEach((v) => {
        v.model = createGroundVehicleModel(v.type, v.customColors || null);
        v.model.root.position.set(v.x, 0, v.z);
        v.model.root.rotation.y = v.yaw;
        scene.add(v.model.root);
      });

      // ==========================================
      // 7. CITY WALKING NPCs & ARENA AI PAINTBALL BOTS
      // ==========================================
      const cityNPCs = [];
      const arenaBots = [];

      const cityCitizenConfigs = [
        { x: -12, z: 16, r: 9, speed: 3.4, shirt: 0xec4899, visor: 0xf9a8d4 },
        { x: 14, z: 18, r: 8, speed: 3.1, shirt: 0xeab308, visor: 0xfef08a },
        { x: -65, z: -52, r: 14, speed: 3.8, shirt: 0x8b5cf6, visor: 0xc4b5fd },
        { x: 65, z: -52, r: 14, speed: 3.6, shirt: 0x10b981, visor: 0x6ee7b7 },
        { x: -52, z: 62, r: 12, speed: 3.5, shirt: 0x3b82f6, visor: 0x93c5fd },
        { x: 52, z: 62, r: 12, speed: 3.5, shirt: 0xf97316, visor: 0xfdba74 },
        { x: 0, z: -16, r: 4.0, speed: 2.2, shirt: 0x0ea5e9, visor: 0xbae6fd },
        { x: 80, z: -78, r: 3.8, speed: 2.1, shirt: 0x14b8a6, visor: 0x99f6e4 },
        { x: -80, z: 24, r: 3.5, speed: 2.0, shirt: 0x22c55e, visor: 0x86efac },
        { x: -30, z: 6, r: 2.6, speed: 1.9, shirt: 0xf59e0b, visor: 0xfde047 },
        { x: 71, y: 0.4, z: 6, r: 3.5, speed: 2.1, shirt: 0xa855f7, visor: 0xd8b4fe },
        { x: 71, y: 36.4, z: 6, r: 3.5, speed: 2.3, shirt: 0xe879f9, visor: 0xf5d0fe },
        { x: -25, y: 0.4, z: 80, r: 2.8, speed: 1.9, shirt: 0xef4444, visor: 0xfef08a },
        { x: 135, y: 0.4, z: 28, r: 2.8, speed: 2.2, shirt: 0x4f46e5, visor: 0x22d3ee },
        { x: -80, y: 0.4, z: 80, r: 2.8, speed: 2.0, shirt: 0x7c3aed, visor: 0xf43f5e },
        { x: 135, y: 0.4, z: -28, r: 2.6, speed: 1.8, shirt: 0xec4899, visor: 0x67e8f9 },
        { x: 80, y: 0.4, z: 135, r: 3.0, speed: 2.4, shirt: 0xc026d3, visor: 0x22d3ee },
        { x: -135, y: 0.4, z: 135, r: 3.2, speed: 1.9, shirt: 0x0e7490, visor: 0xfacc15 }
      ];

      cityCitizenConfigs.forEach((cfg, idx) => {
        const rig = createBoxCharacter({
          shirtColor: cfg.shirt,
          visorColor: cfg.visor,
          pantsColor: 0x1e293b,
          hasGun: false
        });
        rig.root.position.set(cfg.x, cfg.y || 0, cfg.z);
        scene.add(rig.root);

        cityNPCs.push({
          id: 'citizen_' + idx,
          rig,
          homeX: cfg.x,
          homeY: cfg.y || 0,
          homeZ: cfg.z,
          x: cfg.x,
          y: cfg.y || 0,
          z: cfg.z,
          radius: cfg.r,
          angle: idx * 1.1,
          speed: cfg.speed
        });
      });

      const botTeamSpecs = [
        { name: 'Dash (Ally)', team: 'blue', spawnX: ARENA_CENTER.x - 32, spawnZ: ARENA_CENTER.z - 16 },
        { name: 'Nova (Ally)', team: 'blue', spawnX: ARENA_CENTER.x - 32, spawnZ: ARENA_CENTER.z },
        { name: 'Echo (Ally)', team: 'blue', spawnX: ARENA_CENTER.x - 32, spawnZ: ARENA_CENTER.z + 16 },
        { name: 'Blaze (Bot)', team: 'red', spawnX: ARENA_CENTER.x + 32, spawnZ: ARENA_CENTER.z - 21 },
        { name: 'Viper (Bot)', team: 'red', spawnX: ARENA_CENTER.x + 32, spawnZ: ARENA_CENTER.z - 7 },
        { name: 'Pyro (Bot)', team: 'red', spawnX: ARENA_CENTER.x + 32, spawnZ: ARENA_CENTER.z + 7 },
        { name: 'Havoc (Bot)', team: 'red', spawnX: ARENA_CENTER.x + 32, spawnZ: ARENA_CENTER.z + 21 }
      ];

      botTeamSpecs.forEach((bs, idx) => {
        const isBlue = bs.team === 'blue';
        const rig = createBoxCharacter({
          skinColor: 0xfde68a,
          shirtColor: isBlue ? 0x0284c7 : 0xe11d48,
          pantsColor: 0x0f172a,
          visorColor: isBlue ? 0x22d3ee : 0xfb7185,
          hasGun: true
        });
        const botNameTag = createPlayerNameTagSprite(
          bs.name,
          isBlue ? 'BLUE SQUAD' : 'RED SQUAD',
          isBlue ? '#38bdf8' : '#fb7185'
        );
        rig.root.add(botNameTag);
        rig.root.position.set(bs.spawnX, 0, bs.spawnZ);
        scene.add(rig.root);

        arenaBots.push({
          id: 'bot_' + idx,
          name: bs.name,
          team: bs.team,
          rig,
          x: bs.spawnX,
          y: 0,
          z: bs.spawnZ,
          spawnX: bs.spawnX,
          spawnZ: bs.spawnZ,
          yaw: isBlue ? -Math.PI / 2 : Math.PI / 2,
          hp: 100,
          targetX: ARENA_CENTER.x + (Math.random() - 0.5) * 40,
          targetZ: ARENA_CENTER.z + (Math.random() - 0.5) * 44,
          retargetTimer: 1.5 + Math.random() * 2,
          shootCooldown: 0.9 + Math.random() * 1.2,
          splatFlashTimer: 0
        });
      });

      // ==========================================
      // 8. PAINTBALL PROJECTILES & SPLATTER DECALS
      // ==========================================
      const PAINT_COLORS = [0xe879f9, 0x22d3ee, 0xa3e635, 0xfacc15, 0xfb7185, 0xc084fc];
      const paintballs = [];
      const splatters = [];
      const MAX_SPLATTERS = 140;

      const ballGeo = new THREE.SphereGeometry(0.24, 10, 10);
      const splatGeo = new THREE.CircleGeometry(0.58, 12);

      function spawnPaintball(originX, originY, originZ, dirX, dirY, dirZ, team, ownerName, colorHex) {
        const mat = new THREE.MeshBasicMaterial({ color: colorHex });
        const mesh = new THREE.Mesh(ballGeo, mat);
        mesh.position.set(originX, originY, originZ);
        scene.add(mesh);

        const speed = 58;
        paintballs.push({
          mesh,
          x: originX,
          y: originY,
          z: originZ,
          vx: dirX * speed,
          vy: dirY * speed,
          vz: dirZ * speed,
          team,
          ownerName,
          colorHex,
          age: 0
        });
      }

      function addPaintSplatter(x, y, z, normalX, normalY, normalZ, colorHex) {
        const mat = new THREE.MeshBasicMaterial({
          color: colorHex,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -2
        });
        const decal = new THREE.Mesh(splatGeo, mat);
        decal.position.set(
          x + normalX * 0.04,
          Math.max(0.16, y + normalY * 0.04),
          z + normalZ * 0.04
        );
        const target = new THREE.Vector3(
          decal.position.x + normalX,
          decal.position.y + normalY,
          decal.position.z + normalZ
        );
        decal.lookAt(target);
        const s = 0.7 + Math.random() * 0.75;
        decal.scale.set(s, s, s);
        scene.add(decal);
        splatters.push(decal);

        if (splatters.length > MAX_SPLATTERS) {
          const old = splatters.shift();
          scene.remove(old);
          old.material.dispose();
        }
      }

      // ==========================================
      // 9. MATCH STATE, TELEPORTATION & HUD UPDATES
      // ==========================================
      const matchState = {
        active: false,
        scoreBlue: 0,
        scoreRed: 0,
        targetScore: 20,
        timeRemaining: 120,
        lastTick: performance.now()
      };

      const elZoneLabel = document.getElementById('zone-label');
      const elZoneDot = document.getElementById('zone-dot');
      const elObjectiveText = document.getElementById('objective-text');
      const elScoreboard = document.getElementById('arena-scoreboard');
      const elScoreBlue = document.getElementById('score-blue');
      const elScoreRed = document.getElementById('score-red');
      const elMatchTimer = document.getElementById('match-timer');
      const elHpValue = document.getElementById('hp-value');
      const elHpBar = document.getElementById('hp-bar');
      const elAmmoValue = document.getElementById('ammo-value');
      const elPlayerSplats = document.getElementById('player-splats');
      const elWayfinderLabel = document.getElementById('wayfinder-label');
      const elBtnReturnCity = document.getElementById('btn-return-city');
      const elGatePrompt = document.getElementById('gate-button-prompt');
      const elActivityFeed = document.getElementById('activity-feed');
      const elTeleportOverlay = document.getElementById('teleport-overlay');
      const elTeleportTitle = document.getElementById('teleport-title');
      const elTeleportSubtitle = document.getElementById('teleport-subtitle');
      const elMatchResultModal = document.getElementById('match-result-modal');
      const elMatchResultTitle = document.getElementById('match-result-title');
      const elMatchResultSummary = document.getElementById('match-result-summary');

      function pushFeedMessage(text, colorClass = 'border-l-cyan-400 text-cyan-200') {
        const item = document.createElement('div');
        item.className = `glass-panel px-2.5 py-1 rounded-lg text-[11px] font-bold border-l-4 ${colorClass} shadow transition-opacity duration-300`;
        item.textContent = text;
        elActivityFeed.prepend(item);
        while (elActivityFeed.children.length > 4) {
          elActivityFeed.lastChild.remove();
        }
        setTimeout(() => {
          item.style.opacity = '0';
          setTimeout(() => item.remove(), 320);
        }, 3800);
      }

      const elHungerValue = document.getElementById('hunger-value');
      const elHungerBar = document.getElementById('hunger-bar');

      function replenishPlayerHunger(hungerGain, hpGain = 15, itemName = 'Fresh Meal') {
        player.hunger = Math.min(player.maxHunger, player.hunger + hungerGain);
        player.hp = Math.min(player.maxHp, player.hp + hpGain);
        updateHUD();
        if (itemName) {
          pushFeedMessage(`🍔 Consumed ${itemName}! Hunger: ${Math.round(player.hunger)}/100 • HP: ${Math.round(player.hp)}/100`, 'border-l-amber-400 text-amber-200');
        }
      }

      function updateHUD() {
        elHpValue.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
        elHpBar.style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;
        if (elHungerValue && elHungerBar) {
          const hVal = Math.max(0, Math.min(player.maxHunger, player.hunger));
          elHungerValue.textContent = `${Math.ceil(hVal)} / ${player.maxHunger}`;
          elHungerBar.style.width = `${(hVal / player.maxHunger) * 100}%`;
          if (hVal <= 25) {
            elHungerBar.className = 'h-full bg-gradient-to-r from-rose-600 to-amber-500 animate-pulse transition-all duration-150';
          } else {
            elHungerBar.className = 'h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 transition-all duration-150';
          }
        }
        elAmmoValue.textContent = `${player.ammo} / ${player.maxAmmo}`;
        elPlayerSplats.textContent = String(player.splats);
        const elHudCoins = document.getElementById('hud-coins-val');
        const elHudLvl = document.getElementById('hud-level-val');
        const elHudMult = document.getElementById('hud-xp-mult');
        if (elHudCoins) elHudCoins.textContent = String(player.coins);
        if (elHudLvl) elHudLvl.textContent = String(player.level);
        if (elHudMult) elHudMult.textContent = `(${getXpMultiplier().toFixed(1)}x XP)`;
        elScoreBlue.textContent = String(matchState.scoreBlue);
        elScoreRed.textContent = String(matchState.scoreRed);

        const elGunBadge = document.getElementById('gun-status-badge');
        if (elGunBadge) {
          if (player.inArena) {
            elGunBadge.textContent = 'Equipped (Arena)';
            elGunBadge.className = 'px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40';
          } else {
            elGunBadge.textContent = 'Holstered (City)';
            elGunBadge.className = 'px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700';
          }
        }

        const mins = Math.floor(Math.max(0, matchState.timeRemaining) / 60);
        const secs = Math.floor(Math.max(0, matchState.timeRemaining) % 60);
        elMatchTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }

      function triggerTeleportOverlay(title, subtitle) {
        elTeleportTitle.textContent = title;
        elTeleportSubtitle.textContent = subtitle;
        elTeleportOverlay.style.opacity = '0.92';
        setTimeout(() => {
          elTeleportOverlay.style.opacity = '0';
        }, 480);
      }

      function startPaintballFightTeleport() {
        if (player.inHelicopter) exitHelicopter();
        if (player.activeVehicle) exitGroundVehicle();
        SoundFX.playTeleport();
        triggerTeleportOverlay('ENTERING PAINTBALL ARENA!', 'Teleporting from Town Hall Shop Gate to Outskirts Ground...');

        player.inArena = true;
        player.isSwimming = false;
        player.x = ARENA_CENTER.x - 36;
        player.y = 0;
        player.z = ARENA_CENTER.z;
        player.yaw = -Math.PI / 2;
        player.hp = 100;
        player.ammo = 30;

        matchState.active = true;
        matchState.scoreBlue = 0;
        matchState.scoreRed = 0;
        matchState.timeRemaining = 120;
        elMatchResultModal.classList.add('hidden');
        elMatchResultModal.classList.remove('flex');

        arenaBots.forEach((b) => {
          b.x = b.spawnX;
          b.z = b.spawnZ;
          b.hp = 100;
          b.rig.torsoMat.color.setHex(b.rig.originalShirtColor);
        });

        elZoneLabel.textContent = 'Outskirts Paintball Arena';
        elZoneDot.className = 'w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-ping';
        elObjectiveText.innerHTML =
          '<strong>PAINTBALL MATCH LIVE!</strong> Splatter the <span class="text-rose-400 font-bold">Red Bots</span>! Step on the Gold Exit Pad or click <strong>Return to City</strong> anytime.';
        elScoreboard.classList.remove('hidden');
        elBtnReturnCity.classList.remove('hidden');
        elBtnReturnCity.classList.add('flex');
        elWayfinderLabel.textContent = 'Town Hall Plaza';
        elGatePrompt.classList.add('hidden');

        pushFeedMessage('🚀 Teleported to the Outskirts Paintball Ground! Splat on!', 'border-l-fuchsia-400 text-fuchsia-200');
        updateHUD();
      }

      function returnToCityCenter(customX = 0, customZ = 22, customYaw = Math.PI) {
        if (player.inHelicopter) exitHelicopter();
        if (player.activeVehicle) exitGroundVehicle();
        SoundFX.playTeleport();
        triggerTeleportOverlay('RETURNING TO BLOCKY METRO', 'Back at Town Hall Plaza & Paintball Pro Shop...');

        player.inArena = false;
        player.isSwimming = false;
        matchState.active = false;
        player.x = customX;
        player.y = 0;
        player.z = customZ;
        player.yaw = customYaw;
        player.hp = 100;
        player.ammo = 30;

        elMatchResultModal.classList.add('hidden');
        elMatchResultModal.classList.remove('flex');

        elZoneLabel.textContent = 'Downtown Plaza';
        elZoneDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
        elObjectiveText.innerHTML =
          'Explore the City Center &amp; Town Hall, then visit the <span class="text-emerald-300 font-bold">Paintball Shop Gate</span> nearby to press the fight button!';
        elScoreboard.classList.add('hidden');
        elBtnReturnCity.classList.add('hidden');
        elBtnReturnCity.classList.remove('flex');
        elWayfinderLabel.textContent = 'Go to Shop Gate';

        pushFeedMessage('🏙️ Returned to City Center near the Town Hall.', 'border-l-emerald-400 text-emerald-200');
        updateHUD();
      }

      function finishPaintballMatch(reasonText) {
        matchState.active = false;
        SoundFX.playFanfare();
        const blueWon = matchState.scoreBlue >= matchState.scoreRed;
        awardCoinsAndXP(blueWon ? 150 : 60, blueWon ? 200 : 80, blueWon ? '🏆 Paintball Victory Bonus!' : '🎯 Paintball Match Reward!');
        elMatchResultTitle.textContent = blueWon ? '🏆 BLUE SQUAD VICTORY!' : '🔥 RED BOTS WIN!';
        elMatchResultSummary.textContent = `${reasonText} • Final Score: Blue ${matchState.scoreBlue} — Red ${matchState.scoreRed} (Your Splats: ${player.splats})`;
        elMatchResultModal.classList.remove('hidden');
        elMatchResultModal.classList.add('flex');
      }

      // ==========================================
      // 10. SHOOTING LOGIC (PLAYER & AI BOTS)
      // ==========================================
      function playerShootPaintball() {
        if (!player.inArena) {
          if (player.y >= VIOLET_TOWER.terraceY - 1.0 && isPlayerInVioletTower(player.x, player.z)) {
            const distBall = Math.hypot(player.x - rooftopFootball.x, player.z - rooftopFootball.z);
            if (distBall < 6.0) {
              const fx = -Math.sin(player.yaw);
              const fz = -Math.cos(player.yaw);
              rooftopFootball.vx = fx * 25;
              rooftopFootball.vy = 6.2;
              rooftopFootball.vz = fz * 25;
              SoundFX.playJump();
              pushFeedMessage('⚽ Power kick on the Rooftop Football Court!', 'border-l-emerald-400 text-emerald-200');
            }
          } else if (isPlayerInStadiumPitch(player.x, player.y, player.z)) {
            const distBall = Math.hypot(player.x - stadiumFootball.x, player.z - stadiumFootball.z);
            if (distBall < 6.8) {
              const fx = -Math.sin(player.yaw);
              const fz = -Math.cos(player.yaw);
              stadiumFootball.vx = fx * 30;
              stadiumFootball.vy = 7.0;
              stadiumFootball.vz = fz * 30;
              SoundFX.playJump();
              pushFeedMessage('⚽ Power shot on the Metro Stadium Football Ground!', 'border-l-emerald-400 text-emerald-200');
            }
          }
          return;
        }
        const now = performance.now();
        const fireCooldownMs = [150, 115, 85, 60][Math.min(3, player.upgrades.rapidMarker || 0)];
        if (now - player.lastShotTime < fireCooldownMs) return;
        if (player.ammo <= 0) {
          player.ammo = player.maxAmmo;
          pushFeedMessage('🔄 Paint Hopper Refilled!', 'border-l-cyan-400 text-cyan-200');
          updateHUD();
          return;
        }
        player.lastShotTime = now;
        player.ammo--;
        SoundFX.playShoot();

        const forwardX = -Math.sin(player.yaw) * Math.cos(player.pitch);
        const forwardY = Math.sin(player.pitch) + 0.04;
        const forwardZ = -Math.cos(player.yaw) * Math.cos(player.pitch);
        const len = Math.hypot(forwardX, forwardY, forwardZ) || 1;

        const rightX = Math.cos(player.yaw);
        const rightZ = -Math.sin(player.yaw);
        const spawnX = player.x + rightX * 0.55 + (forwardX / len) * 1.1;
        const spawnY = player.y + 2.15;
        const spawnZ = player.z + rightZ * 0.55 + (forwardZ / len) * 1.1;

        const colorHex = PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)];
        spawnPaintball(
          spawnX,
          spawnY,
          spawnZ,
          forwardX / len,
          forwardY / len,
          forwardZ / len,
          'blue',
          'You',
          colorHex
        );
        updateHUD();
      }
      // ==========================================
      // 11. INPUT CONTROLS (KEYBOARD, MOUSE LOOK, TOUCH D-PAD & SETTINGS)
      // ==========================================
      const keys = {};
      const virtualPad = {
        up: false,
        down: false,
        left: false,
        right: false,
        turnLeft: false,
        turnRight: false
      };

      const cameraSettings = {
        sensitivity: 1.0,
        invertY: false,
        requireClickHold: false
      };

      let isMouseLooking = false;
      let lastMouseX = null;
      let lastMouseY = null;

      function isAnyModalOpen() {
        const modalIds = [
          'full-map-modal',
          'help-modal',
          'settings-modal',
          'profile-modal',
          'arcade-modal',
          'upgrade-shop-modal',
          'ai-race-modal',
          'match-result-modal'
        ];
        return modalIds.some((id) => {
          const el = document.getElementById(id);
          return el && !el.classList.contains('hidden');
        });
      }

      let pointerLockExitedProgrammatically = false;

      function syncCursorAndPointerLock() {
        const modalOpen = isAnyModalOpen();
        if (modalOpen) {
          document.body.classList.remove('gameplay-cursor-hidden');
          if (document.pointerLockElement === canvas) {
            pointerLockExitedProgrammatically = true;
            try { document.exitPointerLock(); } catch (e) {}
          }
        } else {
          document.body.classList.add('gameplay-cursor-hidden');
        }
      }

      function requestGamePointerLock() {
        if (isAnyModalOpen()) return;
        document.body.classList.add('gameplay-cursor-hidden');
        if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
          try {
            const p = canvas.requestPointerLock();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } catch (e) {}
        }
      }

      document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement !== canvas) {
          if (pointerLockExitedProgrammatically) {
            pointerLockExitedProgrammatically = false;
          } else if (!isAnyModalOpen()) {
            // Browser exited Pointer Lock because the player pressed [Esc] -> Open Settings Modal!
            openSettingsModal();
          }
        }
      });

      function openSettingsModal() {
        const sm = document.getElementById('settings-modal');
        if (!sm) return;
        sm.classList.remove('hidden');
        sm.classList.add('flex');
        syncCursorAndPointerLock();
      }

      function toggleSettingsModal() {
        const sm = document.getElementById('settings-modal');
        if (!sm) return;
        const isHidden = sm.classList.contains('hidden');
        if (isHidden) {
          openSettingsModal();
        } else {
          closeSettingsModal();
        }
      }

      function toggleProfileModal() {
        const pm = document.getElementById('profile-modal');
        if (!pm) return;
        const isHidden = pm.classList.contains('hidden');
        if (isHidden) {
          document.getElementById('btn-profile-modal').click();
          syncCursorAndPointerLock();
        } else {
          closeProfileModal();
          requestGamePointerLock();
        }
      }

      function toggleHelpModal() {
        const hm = document.getElementById('help-modal');
        if (!hm) return;
        const isHidden = hm.classList.contains('hidden');
        if (isHidden) {
          hm.classList.remove('hidden');
          hm.classList.add('flex');
          syncCursorAndPointerLock();
        } else {
          hm.classList.add('hidden');
          hm.classList.remove('flex');
          requestGamePointerLock();
        }
      }

      window.addEventListener('keydown', (e) => {
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
          if (e.code === 'Escape') {
            document.activeElement.blur();
            requestGamePointerLock();
          }
          return;
        }
        SoundFX.init();
        const code = e.code;
        keys[code] = true;

        // 1. [Esc] Key: Close any open non-settings modal, or toggle the Settings Modal!
        if (code === 'Escape') {
          e.preventDefault();
          const sm = document.getElementById('settings-modal');
          const fm = document.getElementById('full-map-modal');
          const pm = document.getElementById('profile-modal');
          const hm = document.getElementById('help-modal');
          const am = document.getElementById('arcade-modal');

          const arm = document.getElementById('ai-race-modal');
          if (arm && !arm.classList.contains('hidden')) {
            closeAiRaceModal();
            requestGamePointerLock();
            return;
          }
          const usm = document.getElementById('upgrade-shop-modal');
          if (usm && !usm.classList.contains('hidden')) {
            closeUpgradeShopModal();
            requestGamePointerLock();
            return;
          }
          if (am && !am.classList.contains('hidden')) {
            closeArcadeCabinetModal();
            requestGamePointerLock();
            return;
          }
          if (fm && !fm.classList.contains('hidden')) {
            toggleFullMapModal();
            requestGamePointerLock();
            return;
          }
          if (pm && !pm.classList.contains('hidden')) {
            closeProfileModal();
            requestGamePointerLock();
            return;
          }
          if (hm && !hm.classList.contains('hidden')) {
            hm.classList.add('hidden');
            hm.classList.remove('flex');
            requestGamePointerLock();
            return;
          }
          if (sm && !sm.classList.contains('hidden')) {
            closeSettingsModal();
            requestGamePointerLock();
            return;
          }
          openSettingsModal();
          return;
        }

        // 1B. When AI Race Setup Modal is open: Enter starts race, 1-4 picks difficulty, -/+ adjusts laps
        const aiRaceModalEl = document.getElementById('ai-race-modal');
        if (aiRaceModalEl && !aiRaceModalEl.classList.contains('hidden')) {
          if (code === 'Enter') {
            e.preventDefault();
            closeAiRaceModal();
            startAIRivalBuggyRace(aiRaceConfig.difficulty, aiRaceConfig.laps);
            requestGamePointerLock();
          } else if (code === 'Digit1' || code === 'Numpad1') setAiRaceDifficulty('easy');
          else if (code === 'Digit2' || code === 'Numpad2') setAiRaceDifficulty('medium');
          else if (code === 'Digit3' || code === 'Numpad3') setAiRaceDifficulty('hard');
          else if (code === 'Digit4' || code === 'Numpad4') setAiRaceDifficulty('pro');
          else if (code === 'Minus' || code === 'ArrowLeft') setAiRaceLaps(aiRaceConfig.laps - 1);
          else if (code === 'Equal' || code === 'ArrowRight') setAiRaceLaps(aiRaceConfig.laps + 1);
          return;
        }

        // 2. When Settings Modal is open: Keyboard controls for Sensitivity (1-4, -/+, I, Enter)
        const smOpen = !document.getElementById('settings-modal').classList.contains('hidden');
        if (smOpen) {
          if (code === 'Digit1' || code === 'Numpad1') applySensitivityValue(0.5);
          else if (code === 'Digit2' || code === 'Numpad2') applySensitivityValue(1.0);
          else if (code === 'Digit3' || code === 'Numpad3') applySensitivityValue(1.75);
          else if (code === 'Digit4' || code === 'Numpad4') applySensitivityValue(2.5);
          else if (code === 'Minus' || code === 'BracketLeft' || code === 'ArrowLeft') {
            applySensitivityValue(cameraSettings.sensitivity - 0.1);
          } else if (code === 'Equal' || code === 'BracketRight' || code === 'ArrowRight') {
            applySensitivityValue(cameraSettings.sensitivity + 0.1);
          } else if (code === 'KeyI') {
            const chk = document.getElementById('chk-invert-y');
            chk.checked = !chk.checked;
            cameraSettings.invertY = chk.checked;
          } else if (code === 'Enter') {
            closeSettingsModal();
            requestGamePointerLock();
          }
          return;
        }

        // 3. Number Keys [1] - [9] (Digit1..Digit9 / Numpad1..Numpad9):
        //    - When Full World Map (M) is open: Quick-teleport to Map locations 1-7!
        //    - When near ANY Building Lift / Elevator: Ride the lift to Floor 1F-9F!
        const digitMatch = code.match(/^(?:Digit|Numpad)([1-9])$/);
        if (digitMatch) {
          const num = parseInt(digitMatch[1], 10);
          const fmOpen = !document.getElementById('full-map-modal').classList.contains('hidden');
          if (fmOpen) {
            const mapBtnIds = [
              'btn-map-tp-townhall',
              'btn-map-tp-shop',
              'btn-map-tp-violet',
              'btn-map-tp-arcade',
              'btn-map-tp-rooftop',
              'btn-map-tp-arena',
              'btn-map-tp-pool',
              'btn-map-tp-kart'
            ];
            if (num >= 1 && num <= mapBtnIds.length) {
              const bEl = document.getElementById(mapBtnIds[num - 1]);
              if (bEl) bEl.click();
              requestGamePointerLock();
            }
            return;
          }

          const nearBldg = (!player.inHelicopter && !player.activeVehicle)
            ? getNearestElevatorBuilding(player.x, player.z)
            : null;
          if (nearBldg && num <= nearBldg.numLevels) {
            rideVioletElevatorToFloor(num - 1);
            return;
          }
        }

        // 3B. When Playable Building Activity / Arcade Modal is open: Space/Enter triggers Action!
        if (arcadeGame.open) {
          if (code === 'Space' || code === 'Enter' || code === 'KeyF') {
            e.preventDefault();
            triggerArcadeAction();
            return;
          }
          if (code === 'KeyR') {
            initArcadeState(arcadeGame.mode);
            return;
          }
        }

        // 4. Gameplay & Screen Feature Keyboard Shortcuts (No cursor needed!)
        if (code === 'Space') {
          if (player.isSwimming) {
            player.vy = 10.5;
            SoundFX.playSplash();
            spawnWaterSplash(player.x, getCurrentWaterSurfaceY(player.x, player.y, player.z), player.z, 12);
          } else if (!player.inHelicopter && !player.slidingFirePole && !player.divingBoardState && Math.abs(player.vy) < 0.25) {
            player.vy = 11.5;
            SoundFX.playJump();
          }
        } else if (code === 'KeyE') {
          if (player.inHelicopter) {
            exitHelicopter();
            return;
          }
          if (player.activeVehicle) {
            exitGroundVehicle();
            return;
          }
          const distToGateBtn = Math.hypot(player.x - GATE_BUTTON_POS.x, player.z - GATE_BUTTON_POS.z);
          const distToAiRaceBtn = Math.hypot(player.x - AI_RACE_BTN_POS.x, player.z - AI_RACE_BTN_POS.z);
          if (!player.inArena && distToGateBtn < 7.5) {
            startPaintballFightTeleport();
          } else if (!player.inArena && distToAiRaceBtn < 6.5 && player.y < 3.0) {
            openAiRaceModal();
          } else if (!player.inArena && getNearestGroundVehicle(player.x, player.y, player.z)) {
            enterGroundVehicle(getNearestGroundVehicle(player.x, player.y, player.z));
          } else if (!player.inArena && canPlayerBoardOrSummonHeli()) {
            boardOrSummonHelicopter();
          } else if (!player.inArena && nearestArcadeCabinet) {
            openArcadeCabinetModal(nearestArcadeCabinet);
          } else if (!player.inArena && triggerIndoorBuildingActivity()) {
            return;
          }
        } else if (code === 'KeyH') {
          if (player.activeVehicle) {
            toggleVehicleSirenOrHorn();
          }
        } else if (code === 'KeyF') {
          playerShootPaintball();
        } else if (code === 'KeyR') {
          if (arcadeGame.open) {
            initArcadeState(arcadeGame.mode);
          } else {
            player.ammo = player.maxAmmo;
            pushFeedMessage('🔄 Paint Hopper Reloaded (30/30)!', 'border-l-cyan-400 text-cyan-200');
            updateHUD();
          }
        } else if (code === 'KeyV') {
          toggleCameraMode();
        } else if (code === 'KeyM') {
          toggleFullMapModal();
          syncCursorAndPointerLock();
        } else if (code === 'KeyN') {
          toggleDayNightManual();
        } else if (code === 'KeyG') {
          document.getElementById('btn-wayfinder').click();
        } else if (code === 'KeyT') {
          document.getElementById('btn-tp-violet').click();
        } else if (code === 'KeyB') {
          if (player.inArena) returnToCityCenter(0, 22, Math.PI);
        } else if (code === 'KeyU') {
          document.getElementById('btn-audio-toggle').click();
        } else if (code === 'KeyP') {
          toggleProfileModal();
        } else if (code === 'KeyK' || code === 'Slash') {
          toggleHelpModal();
        } else if (code === 'KeyC') {
          if (isPlayerOnMetroFootballPitch()) {
            document.getElementById('btn-reset-football').click();
          } else if (player.isSwimming || isPlayerOnMetroRoyalPoolRoof(player.x, player.y, player.z)) {
            document.getElementById('btn-pool-splash').click();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
      });

      // Keep movement responsive even if cursor leaves/enters the window
      document.addEventListener('mouseleave', () => {
        lastMouseX = null;
        lastMouseY = null;
      });
      document.addEventListener('mouseenter', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      });

      canvas.addEventListener('mousedown', (e) => {
        SoundFX.init();
        requestGamePointerLock();
        isMouseLooking = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        if (e.button === 0 && (player.inArena || isPlayerOnMetroFootballPitch())) {
          playerShootPaintball();
        }
      });

      window.addEventListener('mouseup', () => {
        isMouseLooking = false;
      });

      window.addEventListener('mousemove', (e) => {
        if (isAnyModalOpen()) {
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
          return;
        }
        document.body.classList.add('gameplay-cursor-hidden');
        if (cameraSettings.requireClickHold && !isMouseLooking && document.pointerLockElement !== canvas) {
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;
          return;
        }

        let dx = 0;
        let dy = 0;
        if (document.pointerLockElement === canvas || typeof e.movementX === 'number') {
          dx = e.movementX || 0;
          dy = e.movementY || 0;
          if (dx === 0 && dy === 0 && document.pointerLockElement !== canvas && lastMouseX !== null && lastMouseY !== null) {
            dx = e.clientX - lastMouseX;
            dy = e.clientY - lastMouseY;
          }
        } else if (lastMouseX !== null && lastMouseY !== null) {
          dx = e.clientX - lastMouseX;
          dy = e.clientY - lastMouseY;
        }
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        const baseSpeed = 0.0046 * cameraSettings.sensitivity;
        player.yaw -= dx * baseSpeed;
        const ySign = cameraSettings.invertY ? 1 : -1;
        player.pitch = Math.max(
          -0.65,
          Math.min(0.75, player.pitch + dy * (baseSpeed * 0.78) * ySign)
        );
      });

      function bindHoldButton(btnId, padKey) {
        const el = document.getElementById(btnId);
        if (!el) return;
        const start = (ev) => {
          ev.preventDefault();
          SoundFX.init();
          virtualPad[padKey] = true;
        };
        const end = (ev) => {
          ev.preventDefault();
          virtualPad[padKey] = false;
        };
        el.addEventListener('mousedown', start);
        el.addEventListener('mouseup', end);
        el.addEventListener('mouseleave', end);
        el.addEventListener('touchstart', start, { passive: false });
        el.addEventListener('touchend', end, { passive: false });
      }

      bindHoldButton('pad-up', 'up');
      bindHoldButton('pad-down', 'down');
      bindHoldButton('pad-left', 'left');
      bindHoldButton('pad-right', 'right');
      bindHoldButton('pad-turn-left', 'turnLeft');
      bindHoldButton('pad-turn-right', 'turnRight');

      document.getElementById('pad-jump').addEventListener('click', () => {
        if (player.isSwimming) {
          player.vy = 10.5;
          SoundFX.playSplash();
          spawnWaterSplash(player.x, METRO_ROYAL_POOL.waterSurfaceY, player.z, 12);
        } else if (Math.abs(player.vy) < 0.05) {
          player.vy = 11.5;
          SoundFX.playJump();
        }
      });

      document.getElementById('pad-shoot').addEventListener('click', () => {
        playerShootPaintball();
      });

      function toggleCameraMode() {
        player.firstPerson = !player.firstPerson;
        playerRig.root.visible = !player.firstPerson;
        document.getElementById('camera-mode-label').textContent = player.firstPerson
          ? '1st Person [V]'
          : '3rd Person [V]';
      }

      document.getElementById('btn-camera-view').addEventListener('click', toggleCameraMode);

      document.getElementById('btn-reload').addEventListener('click', () => {
        player.ammo = player.maxAmmo;
        updateHUD();
      });

      document.getElementById('btn-wayfinder').addEventListener('click', () => {
        if (player.inArena) {
          returnToCityCenter(0, 22, Math.PI);
        } else {
          player.x = 18.5;
          player.y = 0;
          player.z = 6;
          player.yaw = -Math.PI / 2;
          SoundFX.playTeleport();
          pushFeedMessage('📍 Moved right in front of the Paintball Shop Gate Button! Press [E] to fight!', 'border-l-fuchsia-400 text-fuchsia-200');
        }
      });

      document.getElementById('btn-return-city').addEventListener('click', () => {
        returnToCityCenter(0, 22, Math.PI);
      });

      document.getElementById('btn-press-gate-start').addEventListener('click', () => {
        startPaintballFightTeleport();
      });

      document.getElementById('btn-play-again').addEventListener('click', () => {
        startPaintballFightTeleport();
      });

      document.getElementById('btn-result-city').addEventListener('click', () => {
        returnToCityCenter(0, 22, Math.PI);
      });

      const btnAudio = document.getElementById('btn-audio-toggle');
      const sliderMasterVol = document.getElementById('slider-master-volume');
      const lblMasterVol = document.getElementById('master-volume-label');
      const chkAudioMuted = document.getElementById('chk-audio-muted');

      function syncAudioControlsUI() {
        const pct = Math.round(SoundFX.masterVolume * 100);
        if (sliderMasterVol) sliderMasterVol.value = String(pct);
        if (lblMasterVol) lblMasterVol.textContent = `${pct}%`;
        if (chkAudioMuted) chkAudioMuted.checked = !SoundFX.enabled;
        if (btnAudio) btnAudio.textContent = SoundFX.enabled ? `🔊 Audio ${pct}%` : '🔇 Muted';
      }

      try {
        const savedVol = parseFloat(localStorage.getItem('blockyMetroAudioVolume'));
        if (!Number.isNaN(savedVol) && savedVol >= 0 && savedVol <= 1) SoundFX.masterVolume = savedVol;
        const savedMute = localStorage.getItem('blockyMetroAudioMuted');
        if (savedMute === 'true') SoundFX.enabled = false;
      } catch (e) {}
      syncAudioControlsUI();

      btnAudio.addEventListener('click', () => {
        SoundFX.init();
        SoundFX.setMuted(SoundFX.enabled);
        try { localStorage.setItem('blockyMetroAudioMuted', String(!SoundFX.enabled)); } catch (e) {}
        syncAudioControlsUI();
      });
      if (sliderMasterVol) {
        sliderMasterVol.addEventListener('input', () => {
          SoundFX.init();
          const v = Math.max(0, Math.min(100, parseInt(sliderMasterVol.value, 10) || 0)) / 100;
          SoundFX.setMasterVolume(v);
          if (v > 0 && !SoundFX.enabled) SoundFX.setMuted(false);
          try {
            localStorage.setItem('blockyMetroAudioVolume', String(v));
            localStorage.setItem('blockyMetroAudioMuted', String(!SoundFX.enabled));
          } catch (e) {}
          syncAudioControlsUI();
        });
      }
      if (chkAudioMuted) {
        chkAudioMuted.addEventListener('change', () => {
          SoundFX.init();
          SoundFX.setMuted(chkAudioMuted.checked);
          try { localStorage.setItem('blockyMetroAudioMuted', String(chkAudioMuted.checked)); } catch (e) {}
          syncAudioControlsUI();
        });
      }

      const fullMapModal = document.getElementById('full-map-modal');
      function toggleFullMapModal() {
        const isHidden = fullMapModal.classList.contains('hidden');
        if (isHidden) {
          fullMapModal.classList.remove('hidden');
          fullMapModal.classList.add('flex');
          drawMapCanvas(document.getElementById('fullmap-canvas'), true);
        } else {
          fullMapModal.classList.add('hidden');
          fullMapModal.classList.remove('flex');
        }
      }

      document.getElementById('btn-open-map').addEventListener('click', toggleFullMapModal);
      document.getElementById('btn-close-map').addEventListener('click', toggleFullMapModal);

      function getBuildingAtXZ(px, pz) {
        for (let i = 0; i < multiFloorBuildings.length; i++) {
          const b = multiFloorBuildings[i];
          if (Math.abs(px - b.x) <= b.w / 2 + 0.5 && Math.abs(pz - b.z) <= b.d / 2 + 0.5) {
            return b;
          }
        }
        return null;
      }

      function getNearestElevatorBuilding(px, pz) {
        let best = null;
        let bestDist = 7.2;
        for (let i = 0; i < multiFloorBuildings.length; i++) {
          const b = multiFloorBuildings[i];
          const d = Math.hypot(px - b.elevX, pz - b.elevZ);
          if (d < bestDist) {
            bestDist = d;
            best = b;
          }
        }
        return best;
      }

      function isPlayerInVioletTower(px, pz) {
        return (
          Math.abs(px - VIOLET_TOWER.x) <= VIOLET_TOWER.w / 2 + 0.5 &&
          Math.abs(pz - VIOLET_TOWER.z) <= VIOLET_TOWER.d / 2 + 0.5
        );
      }

      function isPlayerInStadiumPitch(px, py, pz) {
        return (
          py < 4.5 &&
          Math.abs(px - STADIUM_PITCH.x) <= STADIUM_PITCH.w / 2 + 2.0 &&
          Math.abs(pz - STADIUM_PITCH.z) <= STADIUM_PITCH.d / 2 + 2.0
        );
      }

      function isPlayerOnMetroFootballPitch() {
        const onTerrace = !player.inArena && player.y >= VIOLET_TOWER.terraceY - 0.8 && isPlayerInVioletTower(player.x, player.z);
        const onStadium = !player.inArena && isPlayerInStadiumPitch(player.x, player.y, player.z);
        return onTerrace || onStadium;
      }

      let lastActiveElevBuildingId = null;

      function updateElevatorPanelForBuilding(b) {
        const elBldgName = document.getElementById('elevator-building-name');
        if (elBldgName && b) {
          elBldgName.textContent = b.title;
        }
        for (let fi = 1; fi <= 9; fi++) {
          const btn = document.getElementById('btn-elev-' + fi);
          if (!btn) continue;
          if (fi <= b.numLevels) {
            btn.classList.remove('hidden');
            const lbl = b.floorLabels[fi - 1] || `${fi}F`;
            if (fi === 9 && b.topFloorType === 'swimming_pool') {
              btn.innerHTML = '<span>[9] 🏊 9F Sky Pool</span><span class="text-[10px] bg-slate-950/25 px-1.5 py-0.5 rounded">Key 9</span>';
            } else if (fi === 8 && b.id === 'violet_tower') {
              btn.innerHTML = '<span>[8] ⚽ Terrace</span><span class="text-[10px] bg-slate-950/25 px-1.5 py-0.5 rounded">Key 8</span>';
            } else if (fi === 7 && b.id === 'violet_tower') {
              btn.innerHTML = '<span>[7] 🕹️ 7th Floor</span><span class="text-[10px] bg-slate-950/30 px-1.5 py-0.5 rounded">Key 7</span>';
            } else {
              btn.textContent = `[${fi}] ${lbl}`;
            }
          } else {
            btn.classList.add('hidden');
          }
        }
      }

      function rideVioletElevatorToFloor(floorIndex) {
        const b = getNearestElevatorBuilding(player.x, player.z);
        if (!b) {
          pushFeedMessage('⚠️ Walk near a building elevator first to use it!', 'border-l-amber-400 text-amber-200');
          return;
        }
        if (floorIndex >= b.numLevels) return;

        const playerFloorY = Math.round(player.y / b.floorHeight) * b.floorHeight;
        if (Math.abs(b.currentY - playerFloorY) > 1.0 && Math.abs(b.currentY - b.targetY) < 0.1) {
          b.currentY = playerFloorY;
        }
        b.currentFloorIndex = floorIndex;
        b.targetY = floorIndex * b.floorHeight;
        SoundFX.playTeleport();

        player.inArena = false;
        player.isSwimming = false;
        player.x = b.elevX;
        player.z = b.elevZ;
        const floorName = b.floorLabels[floorIndex] || `${floorIndex + 1}F`;
        pushFeedMessage(`🛗 ${b.title} Elevator moving to ${floorName}...`, 'border-l-violet-400 text-violet-200');
      }

      for (let fi = 1; fi <= 9; fi++) {
        const btn = document.getElementById('btn-elev-' + fi);
        if (btn) {
          btn.addEventListener('click', () => rideVioletElevatorToFloor(fi - 1));
        }
      }

      document.getElementById('btn-tp-violet').addEventListener('click', () => {
        returnToCityCenter(54, 6, -Math.PI / 2);
        pushFeedMessage('🟣 Arrived at the Violet Tower Entrance behind the Paintball Shop!', 'border-l-violet-400 text-violet-200');
      });

      const btnPoolSplash = document.getElementById('btn-pool-splash');
      if (btnPoolSplash) {
        btnPoolSplash.addEventListener('click', () => {
          const isNearIndoor = player.y < 15 && Math.hypot(player.x - INDOOR_POOL_CENTER.x, player.z - INDOOR_POOL_CENTER.z) < 40;
          const targetSurfY = isNearIndoor ? INDOOR_POOL_CENTER.waterSurfaceY : METRO_ROYAL_POOL.waterSurfaceY;
          if (player.isSwimming) {
            player.vy = 10.5;
            SoundFX.playSplash();
            spawnWaterSplash(player.x, targetSurfY, player.z, 14);
          } else if (isNearIndoor) {
            player.x = INDOOR_POOL_CENTER.x;
            player.z = INDOOR_POOL_CENTER.z;
            player.y = INDOOR_POOL_CENTER.deckY + 0.1;
            player.vy = 0;
            SoundFX.playSplash();
            spawnWaterSplash(player.x, targetSurfY, player.z, 16);
          } else {
            player.x = METRO_ROYAL_POOL.worldX;
            player.z = METRO_ROYAL_POOL.worldZ;
            player.y = METRO_ROYAL_POOL.deckY + 0.1;
            player.vy = 0;
            SoundFX.playSplash();
            spawnWaterSplash(player.x, METRO_ROYAL_POOL.waterSurfaceY, player.z, 16);
          }
        });
      }

      const btnMapTpKart = document.getElementById('btn-map-tp-kart');
      if (btnMapTpKart) {
        btnMapTpKart.addEventListener('click', () => {
          returnToCityCenter(241, -16, 0);
          fullMapModal.classList.add('hidden');
          fullMapModal.classList.remove('flex');
          pushFeedMessage('🏎️ Teleported to Outskirts Go-Kart & Buggy Dirt Track! Press [E] near any Kart or Buggy to race!', 'border-l-amber-400 text-amber-200');
        });
      }

      const btnMapTpPool = document.getElementById('btn-map-tp-pool');
      if (btnMapTpPool) {
        btnMapTpPool.addEventListener('click', () => {
          player.inArena = false;
          if (player.inHelicopter) exitHelicopter();
          if (player.activeVehicle) exitGroundVehicle();
          player.x = METRO_ROYAL_POOL.worldX;
          player.z = METRO_ROYAL_POOL.worldZ;
          player.y = METRO_ROYAL_POOL.deckY + 0.1;
          player.vy = 0;
          SoundFX.playSplash();
          spawnWaterSplash(player.x, METRO_ROYAL_POOL.waterSurfaceY, player.z, 16);
          fullMapModal.classList.add('hidden');
          fullMapModal.classList.remove('flex');
          pushFeedMessage('🏊 Teleported to the Metro Royal 9F Rooftop Swimming Pool! Use WASD to swim!', 'border-l-cyan-400 text-cyan-200');
          updateHUD();
        });
      }

      document.getElementById('btn-map-tp-townhall').addEventListener('click', () => {
        returnToCityCenter(0, -8, Math.PI);
        fullMapModal.classList.add('hidden');
        fullMapModal.classList.remove('flex');
      });

      document.getElementById('btn-map-tp-shop').addEventListener('click', () => {
        returnToCityCenter(18.5, 6, -Math.PI / 2);
        fullMapModal.classList.add('hidden');
        fullMapModal.classList.remove('flex');
      });

      document.getElementById('btn-map-tp-violet').addEventListener('click', () => {
        returnToCityCenter(54, 6, -Math.PI / 2);
        elevatorState.currentY = 0;
        elevatorState.targetY = 0;
        player.y = 0;
        fullMapModal.classList.add('hidden');
        fullMapModal.classList.remove('flex');
        pushFeedMessage('🟣 Walk inside the Violet Tower and go near the elevator at the back wall to use it!', 'border-l-violet-400 text-violet-200');
      });

      document.getElementById('btn-map-tp-arcade').addEventListener('click', () => {
        player.inArena = false;
        player.isSwimming = false;
        player.x = VIOLET_TOWER.x - 2;
        player.z = VIOLET_TOWER.z;
        player.y = 6 * VIOLET_TOWER.floorHeight + 0.4;
        elevatorState.currentY = 6 * VIOLET_TOWER.floorHeight;
        elevatorState.targetY = 6 * VIOLET_TOWER.floorHeight;
        fullMapModal.classList.add('hidden');
        fullMapModal.classList.remove('flex');
        SoundFX.playTeleport();
        pushFeedMessage('🕹️ Teleported to 7th Floor Neon Arcade in the Violet Tower!', 'border-l-fuchsia-400 text-fuchsia-200');
      });

      document.getElementById('btn-map-tp-rooftop').addEventListener('click', () => {
        player.inArena = false;
        player.isSwimming = false;
        player.x = VIOLET_TOWER.x - 3;
        player.z = VIOLET_TOWER.z + 5;
        player.y = VIOLET_TOWER.terraceY + 0.4;
        elevatorState.currentY = VIOLET_TOWER.terraceY;
        elevatorState.targetY = VIOLET_TOWER.terraceY;
        fullMapModal.classList.add('hidden');
        fullMapModal.classList.remove('flex');
        SoundFX.playTeleport();
        pushFeedMessage('⚽ Teleported to Violet Tower Terrace Rooftop Football Pitch!', 'border-l-emerald-400 text-emerald-200');
      });

      document.getElementById('btn-map-tp-arena').addEventListener('click', () => {
        fullMapModal.classList.add('hidden');
        fullMapModal.classList.remove('flex');
        startPaintballFightTeleport();
      });

      document.getElementById('btn-reset-football').addEventListener('click', () => {
        if (isPlayerInStadiumPitch(player.x, player.y, player.z)) {
          resetStadiumFootball();
          pushFeedMessage('⚽ Stadium football reset to center circle!', 'border-l-emerald-400 text-emerald-200');
        } else {
          resetRooftopFootball();
          pushFeedMessage('⚽ Rooftop football reset to center spot!', 'border-l-emerald-400 text-emerald-200');
        }
      });

      // ==========================================
      // 11B. HELICOPTER & GROUND VEHICLE BOARDING / EXITING
      // ==========================================
      function applySeatedPoseToPlayerRig() {
        playerRig.root.rotation.order = 'YXZ';
        if (playerRig.visualRoot) playerRig.visualRoot.rotation.set(0, 0, 0);
        if (playerRig.pelvis) {
          playerRig.pelvis.position.set(0, playerRig.pelvisBaseY || 1.24, 0);
          playerRig.pelvis.rotation.set(0, 0, 0);
        }
        if (playerRig.torsoPivot) playerRig.torsoPivot.rotation.set(0.06, 0, 0);
        if (playerRig.head) playerRig.head.rotation.set(0, 0, 0);
        playerRig.leftLegPivot.rotation.set(-Math.PI / 2.1, 0, 0);
        playerRig.rightLegPivot.rotation.set(-Math.PI / 2.1, 0, 0);
        if (playerRig.leftKnee) playerRig.leftKnee.rotation.x = Math.PI / 2.2;
        if (playerRig.rightKnee) playerRig.rightKnee.rotation.x = Math.PI / 2.2;
        playerRig.leftArmPivot.rotation.set(-Math.PI / 3.1, 0, 0.05);
        playerRig.rightArmPivot.rotation.set(-Math.PI / 3.1, 0, -0.05);
        if (playerRig.leftElbow) playerRig.leftElbow.rotation.x = -0.52;
        if (playerRig.rightElbow) playerRig.rightElbow.rotation.x = -0.52;
      }

      function restoreStandingPlayerRig() {
        scene.add(playerRig.root);
        playerRig.root.scale.set(1, 1, 1);
        playerRig.root.rotation.order = 'YXZ';
        playerRig.root.rotation.set(0, player.yaw + Math.PI, 0);
        playerRig.root.position.set(player.x, player.y, player.z);
        if (playerRig.visualRoot) playerRig.visualRoot.rotation.set(0, 0, 0);
        if (playerRig.pelvis) {
          playerRig.pelvis.position.set(0, playerRig.pelvisBaseY || 1.24, 0);
          playerRig.pelvis.rotation.set(0, 0, 0);
        }
        if (playerRig.torsoPivot) playerRig.torsoPivot.rotation.set(0, 0, 0);
        playerRig.leftLegPivot.rotation.set(0, 0, 0);
        playerRig.rightLegPivot.rotation.set(0, 0, 0);
        if (playerRig.leftKnee) playerRig.leftKnee.rotation.x = 0;
        if (playerRig.rightKnee) playerRig.rightKnee.rotation.x = 0;
        playerRig.leftArmPivot.rotation.set(0, 0, 0);
        playerRig.rightArmPivot.rotation.set(0, 0, 0);
        if (playerRig.leftElbow) playerRig.leftElbow.rotation.x = 0;
        if (playerRig.rightElbow) playerRig.rightElbow.rotation.x = 0;
      }

      // =========================================================
      // FIRE STATION BRASS POLE & POOL DIVING BOARD 3D MECHANICS
      // =========================================================
      const FIRE_STATION_POLE = {
        bldgX: 25,
        bldgZ: -80,
        poleX: 25 + 6.0,   // 31.0
        poleZ: -80 - 4.0,  // -84.0
        topIndoorFloorIdx: 4, // 5F Chief Command (the floor right below 6F Helipad!)
        topIndoorY: 4 * 6.5 + 0.4, // 26.4
        groundY: 0.4
      };

      const POOL_DIVING_POSTS = [
        {
          id: 'indoor_pool_dive',
          title: '🏊 Indoor Olympic Pool Diving Board',
          postX: 196,
          postZ: -80 + 22.4, // -57.6
          deckY: 0.36,
          boardTipX: 196,
          boardY: 4.55,
          boardTipZ: -80 + 17.5, // -62.5
          waterTargetZ: -80 + 8.5, // -71.5
          waterSurfaceY: 1.28,
          launchVy: 13.8,
          fwdSpeed: 8.2,
          yaw: 0, // facing North (-Z) into the pool
          fwdX: 0,
          fwdZ: -1,
          getBoardMesh: () => window.__indoorSpringBoardMesh
        },
        {
          id: 'sky_pool_dive',
          title: '🏨 9F Sky Pool Diving Board',
          postX: -135 - 2.2, // -137.2
          postZ: 135 + 2.0 + 6.2 + 1.1, // 144.3
          deckY: 52.4,
          boardTipX: -137.2,
          boardY: 52.4 + 3.15,
          boardTipZ: 135 + 2.0 + 4.2, // 141.2
          waterTargetZ: 135 + 2.0, // 137.0
          waterSurfaceY: 53.31,
          launchVy: 8.2,
          fwdSpeed: 3.8,
          yaw: 0, // facing North (-Z) into the pool
          fwdX: 0,
          fwdZ: -1,
          getBoardMesh: () => window.__skyPoolSpringBoardMesh
        }
      ];

      function getNearestDivingPost(px, py, pz) {
        if (player.inArena || player.inHelicopter || player.activeVehicle || player.divingBoardState) return null;
        for (let i = 0; i < POOL_DIVING_POSTS.length; i++) {
          const dp = POOL_DIVING_POSTS[i];
          const dXZ = Math.hypot(px - dp.postX, pz - dp.postZ);
          const dY = Math.abs(py - dp.deckY);
          if (dXZ < 7.2 && dY < 3.5) {
            return dp;
          }
        }
        return null;
      }

      function startDivingBoardJump(dp) {
        if (!dp) return false;
        player.isSwimming = false;
        player.x = dp.boardTipX;
        player.y = dp.boardY;
        player.z = dp.boardTipZ;
        player.vx = 0;
        player.vy = 0;
        player.vz = 0;
        player.yaw = dp.yaw;
        player.divingBoardState = {
          spec: dp,
          phase: 'bounce',
          timer: 0.36,
          flipAngle: 0
        };
        SoundFX.playJump();
        pushFeedMessage(`🤿 Climbed onto ${dp.title}! Bouncing & diving into the pool!`, 'border-l-cyan-400 text-cyan-200');
        return true;
      }

      function canUseFireStationPole() {
        if (player.inArena || player.inHelicopter || player.activeVehicle || player.slidingFirePole) return false;
        // Player must be inside Fire Station #1 (x: 25, z: -80) on the floor below the helipad (5F Chief Command, f=4, or upper indoor floors 2F-5F)
        const inFireStationXZ =
          Math.abs(player.x - FIRE_STATION_POLE.bldgX) <= 13.0 &&
          Math.abs(player.z - FIRE_STATION_POLE.bldgZ) <= 12.0;
        if (!inFireStationXZ) return false;
        // Must be on an upper indoor floor (2F to 5F Chief Command, NOT 1F and NOT 6F Helipad roof)
        if (player.y < 5.0 || player.y > FIRE_STATION_POLE.topIndoorY + 2.2) return false;
        const distToPole = Math.hypot(player.x - FIRE_STATION_POLE.poleX, player.z - FIRE_STATION_POLE.poleZ);
        // Allow using the pole from anywhere on 5F Chief Command (within 11m) or near the pole hatch on 2F-4F
        return distToPole < 11.5;
      }

      function startFireStationPoleSlide() {
        if (!canUseFireStationPole()) return false;
        player.slidingFirePole = true;
        player.x = FIRE_STATION_POLE.poleX;
        player.z = FIRE_STATION_POLE.poleZ;
        player.vy = 0;
        SoundFX.playTeleport();
        pushFeedMessage('🚒 Grabbed the Fire Station Brass Pole! Sliding down to 1F Engine & Rescue Bay!', 'border-l-amber-400 text-amber-200');
        return true;
      }

      // NOTE: Hospital ('hospital') and Library ('library') intentionally have NO games or popups!
      // Only 'bowling' and 'esports' open the playable 2D mini-game modal; all other active buildings perform
      // real 3D physical in-world actions (eating/replenishing hunger, 3D outfit styling, 3D jumps/dances, etc.)!
      const BUILDING_ACTIVITIES = {
        bowling: {
          label: '🎳 Play 10-Pin Bowling Alley [E]',
          type: 'modal_game',
          game: 'bowling',
          title: '🎳 Starlight 10-Pin Bowling Alley',
          statusHint: 'Aim: Mouse or A/D • Roll Ball: Space or 🔥 Action'
        },
        esports: {
          label: '🎮 Play Pro Esports LAN Arcade [E]',
          type: 'modal_game',
          game: 'breaker',
          title: '🎮 Pro Esports LAN Championship',
          statusHint: 'Move Paddle: Mouse or A/D • Switch Game Above'
        },
        diner: {
          label: '🍕 Eat Wood-Fired Pizza & Shake (+45 Hunger) [E]',
          type: 'consume_3d',
          foodGain: 45,
          hpGain: 25,
          itemName: 'Brick-Oven Pepperoni Pizza & Retro Shake'
        },
        ice_cream: {
          label: '🍨 Eat Triple-Scoop Gelato Sundae (+40 Hunger) [E]',
          type: 'consume_3d',
          foodGain: 40,
          hpGain: 20,
          itemName: 'Sweet Scoops Triple-Berry Gelato Sundae'
        },
        plaza_cafe: {
          label: '☕ Drink Artisan Espresso & Croissant (+40 Hunger) [E]',
          type: 'consume_3d',
          foodGain: 40,
          hpGain: 20,
          itemName: 'Double Espresso & Warm Butter Croissant'
        },
        supermarket: {
          label: '🛒 Grab Organic Fruit & Smoothie (+45 Hunger) [E]',
          type: 'consume_3d',
          foodGain: 45,
          hpGain: 25,
          itemName: 'Supermart Organic Fruit & Berry Smoothie'
        },
        pharmacy: {
          label: '💊 Take Vitamin & First-Aid Pack (+100% HP & +25 Hunger) [E]',
          type: 'consume_3d',
          foodGain: 25,
          hpGain: 100,
          itemName: 'City Pharmacy Wellness & First-Aid Kit'
        },
        hotel: {
          label: '🏨 Enjoy Royal Suite Buffet (+50 Hunger & Full HP) [E]',
          type: 'consume_3d',
          foodGain: 50,
          hpGain: 100,
          itemName: 'Metro Royal Hotel Presidential Buffet'
        },
        paintball_shop: {
          label: '🪙 Open Paintball Pro Upgrade Shop [E]',
          type: 'upgrade_shop',
          shopTitle: '🎯 Paintball Pro Shop — Economy Upgrades'
        },
        fashion: {
          label: '👗 Open City Clothing & VIP Level Shop [E]',
          type: 'upgrade_shop',
          shopTitle: '👗 City Clothing & Apparel — VIP Level Upgrades'
        },
        barber_salon: {
          label: '💈 Fresh 3D Haircut & Visor Tint [E]',
          type: 'style_3d'
        },
        skate_park: {
          label: '🛹 Launch 3D Halfpipe 360° Aerial Jump [E]',
          type: 'jump_3d',
          vy: 9.5,
          msg: '🛹 Launched a high-air 360° flip off the Indoor Skate Halfpipe!'
        },
        boxing_gym: {
          label: '🥊 Perform 3D Ring Sparring Combo [E]',
          type: 'jump_3d',
          vy: 8.2,
          msg: '🥊 Landed a championship 3-hit uppercut combo in the Boxing Ring!'
        },
        dojo: {
          label: '🥋 Perform 3D Black-Belt Flying Kick [E]',
          type: 'jump_3d',
          vy: 8.8,
          msg: '🥋 Executed a flying spinning kick on the Dragon Dojo tatami mats!'
        },
        concert_hall: {
          label: '🎹 Play Live Grand Piano Chord & Bow [E]',
          type: 'music_3d',
          msg: '🎹 Played a resonant concerto chord on the Symphony Grand Piano!'
        },
        dj_club: {
          label: '🎧 Drop Live Synthwave Bass & Dance [E]',
          type: 'music_3d',
          msg: '🎧 Dropped a booming neon bass beat on the DJ Club turntables!'
        },
        record_shop: {
          label: '🎸 Strum Electric Guitar Riff on Stage [E]',
          type: 'music_3d',
          msg: '🎸 Rocked an electric guitar power chord on the Vinyl Record Shop stage!'
        }
      };

      const CUSTOM_OUTFIT_PALETTES = [
        { shirt: 0x0284c7, visor: 0x22d3ee, pants: 0x0f172a, hex: '#22d3ee', name: 'Cyber Cyan' },
        { shirt: 0xe11d48, visor: 0xfda4af, pants: 0x1e1b4b, hex: '#f43f5e', name: 'Crimson Blaze' },
        { shirt: 0x10b981, visor: 0x6ee7b7, pants: 0x064e3b, hex: '#10b981', name: 'Emerald Viper' },
        { shirt: 0x7c3aed, visor: 0xd8b4fe, pants: 0x2e1065, hex: '#a855f7', name: 'Royal Violet' },
        { shirt: 0xf59e0b, visor: 0xfef08a, pants: 0x451a03, hex: '#facc15', name: 'Solar Gold' },
        { shirt: 0xec4899, visor: 0xf9a8d4, pants: 0x500724, hex: '#ec4899', name: 'Neon Magenta' },
        { shirt: 0x2563eb, visor: 0x93c5fd, pants: 0x0f172a, hex: '#60a5fa', name: 'Sapphire Pro' },
        { shirt: 0xffffff, visor: 0x38bdf8, pants: 0x334155, hex: '#f8fafc', name: 'Arctic Ghost' }
      ];
      let currentOutfitIdx = 0;

      function cyclePlayer3DOutfit() {
        currentOutfitIdx = (currentOutfitIdx + 1) % CUSTOM_OUTFIT_PALETTES.length;
        const pal = CUSTOM_OUTFIT_PALETTES[currentOutfitIdx];
        if (playerRig && playerRig.torsoMat) {
          playerRig.torsoMat.color.setHex(pal.shirt);
          playerRig.originalShirtColor = pal.shirt;
        }
        if (playerRig && playerRig.leftLegPivot && playerRig.leftLegPivot.children[0]) {
          playerRig.leftLegPivot.children[0].material.color.setHex(pal.pants);
        }
        player.actionSpinTimer = 0.65;
        SoundFX.playFanfare();
        pushFeedMessage(`👗 Restyled 3D Character Outfit: "${pal.name}"!`, 'border-l-fuchsia-400 text-fuchsia-200');
        return pal;
      }

      function launch3DBowlingBallRoll() {
        if (window.__bowling3DBall) {
          window.__bowling3DBall.z = 8.2;
          window.__bowling3DBall.vz = -22.0;
          window.__bowling3DBall.active = true;
          window.__bowling3DBall.resetTimer = 2.8;
          if (window.__bowling3DPins) {
            window.__bowling3DPins.forEach((p) => {
              p.mesh.position.set(p.homeX, p.homeY, p.homeZ);
              p.mesh.rotation.set(0, 0, 0);
            });
          }
        }
      }

      function getActiveIndoorBuildingWithActivity() {
        if (player.inArena || player.inHelicopter || player.activeVehicle || player.slidingFirePole || player.divingBoardState) return null;

        // 1. Check if near a Pool Diving Board Post (Indoor Pool or 9F Sky Pool)
        const nearDivePost = getNearestDivingPost(player.x, player.y, player.z);
        if (nearDivePost) {
          return {
            building: { title: nearDivePost.title, theme: 'diving_board' },
            activity: {
              label: '🤿 Jump from Diving Board into Pool [E]',
              type: 'diving_board',
              diveSpec: nearDivePost
            }
          };
        }

        // 2. Check if on Fire Station #1 upper indoor floor (especially 5F Chief Command, below the 6F Helipad)
        if (canUseFireStationPole()) {
          const flNum = Math.round(player.y / 6.5) + 1;
          return {
            building: { title: `🚒 Fire Station #1 (${flNum}F Brass Pole)`, theme: 'fire_pole' },
            activity: {
              label: '🚒 Slide Down Brass Fire Pole to 1F [E]',
              type: 'fire_pole'
            }
          };
        }

        if (player.isSwimming) return null;

        // 3. Check if near the Indoor Pool Smoothie Bar (west deck of Grand Indoor Pool)
        if (
          typeof INDOOR_POOL_CENTER !== 'undefined' &&
          player.y < 4.0 &&
          Math.hypot(player.x - (INDOOR_POOL_CENTER.x - 21.2), player.z - (INDOOR_POOL_CENTER.z - 14.0)) < 6.5
        ) {
          return {
            building: { title: '🥤 Indoor Pool Smoothie Bar', theme: 'indoor_pool_bar' },
            activity: {
              label: '🥤 Drink Tropical Mango Smoothie (+35 Hunger) [E]',
              type: 'consume_3d',
              foodGain: 35,
              hpGain: 20,
              itemName: 'Poolside Mango Smoothie'
            }
          };
        }

        const b = getBuildingAtXZ(player.x, player.z);
        if (!b || !b.theme || !BUILDING_ACTIVITIES[b.theme]) return null;
        // All standard building activities (dojo karate kick, skate halfpipe, dining, bowling, etc.)
        // are located on 1F (ground floor) only — never on upper floors or rooftops!
        if (player.y >= 3.2) return null;
        const insideX = Math.abs(player.x - b.x) < b.w / 2 - 1.0;
        const insideZ = Math.abs(player.z - b.z) < b.d / 2 - 1.0;
        if (!insideX || !insideZ) return null;
        return { building: b, activity: BUILDING_ACTIVITIES[b.theme] };
      }

      function triggerIndoorBuildingActivity() {
        const info = getActiveIndoorBuildingWithActivity();
        if (!info) return false;
        const { building, activity } = info;

        if (activity.type === 'diving_board') {
          return startDivingBoardJump(activity.diveSpec);
        }
        if (activity.type === 'fire_pole') {
          return startFireStationPoleSlide();
        }
        if (activity.type === 'consume_3d') {
          replenishPlayerHunger(activity.foodGain || 35, activity.hpGain || 20, activity.itemName || 'Fresh Meal');
          player.vy = 5.5;
          SoundFX.playFanfare();
          return true;
        }
        if (activity.type === 'upgrade_shop') {
          openUpgradeShopModal(activity.shopTitle);
          return true;
        }
        if (activity.type === 'style_3d') {
          cyclePlayer3DOutfit();
          return true;
        }
        if (activity.type === 'jump_3d') {
          if (Math.abs(player.vy) > 0.25) return true;
          player.vy = activity.vy || 8.8;
          player.actionSpinTimer = 0.75;
          SoundFX.playJump();
          pushFeedMessage(activity.msg, 'border-l-cyan-400 text-cyan-200');
          return true;
        }
        if (activity.type === 'music_3d') {
          if (Math.abs(player.vy) > 0.25) return true;
          player.vy = 6.5;
          player.actionSpinTimer = 0.65;
          SoundFX.playFanfare();
          pushFeedMessage(activity.msg, 'border-l-fuchsia-400 text-fuchsia-200');
          return true;
        }
        if (activity.type === 'modal_game') {
          if (building.theme === 'bowling') {
            launch3DBowlingBallRoll();
          }
          openArcadeCabinetModal({
            title: activity.title || building.title,
            game: activity.game || 'bowling',
            statusHint: activity.statusHint || 'Move: Mouse or A/D • Action: Space or Click',
            buildingTheme: building.theme
          });
          return true;
        }
        return false;
      }

      function isPlayerOnAnyTopHelipad() {
        if (player.inArena || player.inHelicopter) return null;
        const b = getBuildingAtXZ(player.x, player.z);
        if (!b || b.topFloorType !== 'helipad') return null;
        const topFloorY = (b.numLevels - 1) * b.floorHeight + 0.4;
        if (Math.abs(player.y - topFloorY) < 1.8) {
          return b;
        }
        return null;
      }

      function isPlayerNearHelicopter() {
        if (player.inArena || player.inHelicopter) return false;
        const dXZ = Math.hypot(player.x - helicopter.x, player.z - helicopter.z);
        const dY = Math.abs(player.y - helicopter.y);
        return dXZ < 6.5 && dY < 3.5;
      }

      function canPlayerBoardOrSummonHeli() {
        return isPlayerNearHelicopter() || !!isPlayerOnAnyTopHelipad();
      }

      function boardOrSummonHelicopter() {
        if (player.inArena) return;
        if (player.activeVehicle) exitGroundVehicle();
        const topBldg = isPlayerOnAnyTopHelipad();
        if (!isPlayerNearHelicopter() && topBldg) {
          const topY = (topBldg.numLevels - 1) * topBldg.floorHeight + 0.45;
          helicopter.x = topBldg.x + (topBldg.elevX > topBldg.x ? -2.2 : 2.2);
          helicopter.y = topY;
          helicopter.z = topBldg.z;
          helicopter.model.root.position.set(helicopter.x, helicopter.y, helicopter.z);
        }
        player.inHelicopter = true;
        player.isSwimming = false;
        helicopter.yaw = player.yaw;
        player.x = helicopter.x;
        player.y = helicopter.y + 0.5;
        player.z = helicopter.z;

        helicopter.model.tiltGroup.add(playerRig.root);
        playerRig.root.scale.set(0.58, 0.50, 0.58);
        playerRig.root.position.set(0, 0.85, -0.65);
        playerRig.root.rotation.set(0, Math.PI, 0);
        applySeatedPoseToPlayerRig();

        document.getElementById('heli-prompt').classList.add('hidden');
        document.getElementById('heli-flight-hud').classList.remove('hidden');
        SoundFX.playTeleport();
        pushFeedMessage('🚁 Boarded Sky-Hawk Helicopter! WASD to fly, Space to Ascend, Shift to Descend, E to Land/Exit.', 'border-l-amber-400 text-amber-200');
      }

      function exitHelicopter() {
        if (!player.inHelicopter) return;
        player.inHelicopter = false;
        helicopter.vx = 0;
        helicopter.vy = 0;
        helicopter.vz = 0;
        helicopter.model.tiltGroup.rotation.set(0, 0, 0);

        const b = getBuildingAtXZ(helicopter.x, helicopter.z);
        let landY = 0;
        if (b) {
          const topY = (b.numLevels - 1) * b.floorHeight + 0.45;
          if (helicopter.y >= topY - 4.0) {
            landY = topY;
          }
        }
        helicopter.y = Math.max(landY, helicopter.y);
        helicopter.model.root.position.set(helicopter.x, helicopter.y, helicopter.z);

        player.x = helicopter.x + 2.8;
        player.y = helicopter.y;
        player.z = helicopter.z;
        if (b && helicopter.y >= 3.0) {
          player.x = Math.max(b.x - b.w / 2 + 1.5, Math.min(b.x + b.w / 2 - 1.5, player.x));
          player.z = Math.max(b.z - b.d / 2 + 1.5, Math.min(b.z + b.d / 2 - 1.5, player.z));
        }

        restoreStandingPlayerRig();
        document.getElementById('heli-flight-hud').classList.add('hidden');
        pushFeedMessage('🛬 Helicopter landed! Press [E] near the chopper anytime to fly again.', 'border-l-cyan-400 text-cyan-200');
      }

      function getNearestGroundVehicle(px, py, pz) {
        if (player.inArena || player.inHelicopter || player.activeVehicle) return null;
        if (py > 2.5) return null;
        let best = null;
        let bestDist = 6.2;
        for (let i = 0; i < driveableVehicles.length; i++) {
          const v = driveableVehicles[i];
          const d = Math.hypot(px - v.x, pz - v.z);
          if (d < bestDist) {
            bestDist = d;
            best = v;
          }
        }
        return best;
      }

      function syncVehicleSirenButtonLabel(veh) {
        const btnSiren = document.getElementById('btn-vehicle-siren');
        if (!btnSiren || !veh) return;
        if (veh.hasSiren) {
          btnSiren.textContent = veh.sirenOn ? '🚨 Siren: ON [H]' : '🚨 Siren: OFF [H]';
        } else {
          btnSiren.textContent = '🚕 Honk Horn [H]';
        }
      }

      function enterGroundVehicle(veh) {
        if (!veh || player.inArena || player.inHelicopter) return;
        player.activeVehicle = veh;
        player.isSwimming = false;
        player.yaw = veh.yaw;
        player.x = veh.x;
        player.y = 0.5;
        player.z = veh.z;

        const seatZ = veh.type === 'fire_engine' ? -2.4 : (veh.type === 'ambulance' ? -1.8 : 0.1);
        veh.model.root.add(playerRig.root);
        playerRig.root.scale.set(0.54, 0.46, 0.54);
        playerRig.root.position.set(-0.35, 0.22, seatZ);
        playerRig.root.rotation.set(0, Math.PI, 0);
        applySeatedPoseToPlayerRig();

        document.getElementById('vehicle-prompt').classList.add('hidden');
        document.getElementById('vehicle-drive-hud').classList.remove('hidden');
        document.getElementById('vehicle-hud-icon').textContent = veh.icon;
        document.getElementById('vehicle-hud-name').textContent = `Driving ${veh.name}`;

        if (veh.hasSiren) {
          // Emergency vehicles (Police, Ambulance, Fire Engine) use Sirens — NEVER a taxi horn!
          veh.sirenTimer = 0;
          veh.sirenPhase = true;
          SoundFX.playSirenPulse(true, veh.type);
          syncVehicleSirenButtonLabel(veh);
          pushFeedMessage(`${veh.icon} Driving ${veh.name}! Press [H] to toggle continuous Emergency Siren, [E] to Park & Exit.`, 'border-l-emerald-400 text-emerald-200');
        } else {
          // Only Yellow Taxis use the Horn!
          SoundFX.playHorn();
          syncVehicleSirenButtonLabel(veh);
          pushFeedMessage(`${veh.icon} Driving ${veh.name}! Press [H] to Honk Taxi Horn, [E] to Park & Exit.`, 'border-l-amber-400 text-amber-200');
        }
      }

      function exitGroundVehicle() {
        const veh = player.activeVehicle;
        if (!veh) return;
        veh.speed = 0;
        veh.sirenOn = false;
        SoundFX.stopContinuousSiren();
        if (veh.model.sirenLeft && veh.model.sirenRight) {
          veh.model.sirenLeft.scale.setScalar(1.0);
          veh.model.sirenRight.scale.setScalar(1.0);
        }
        player.activeVehicle = null;

        const rightX = Math.cos(veh.yaw);
        const rightZ = -Math.sin(veh.yaw);
        const exitPos = resolveXZCollisions(veh.x + rightX * 3.0, veh.z + rightZ * 3.0, player.radius, 0);
        player.x = exitPos.x;
        player.y = 0;
        player.z = exitPos.z;

        restoreStandingPlayerRig();
        document.getElementById('vehicle-drive-hud').classList.add('hidden');
        pushFeedMessage(`🅿️ Parked ${veh.name}. Press [E] near any vehicle to drive again!`, 'border-l-cyan-400 text-cyan-200');
      }

      function toggleVehicleSirenOrHorn() {
        const veh = player.activeVehicle;
        if (!veh) return;
        if (veh.hasSiren) {
          veh.sirenOn = !veh.sirenOn;
          if (veh.sirenOn) {
            SoundFX.startContinuousSiren(veh.type);
          } else {
            SoundFX.stopContinuousSiren();
            if (veh.model.sirenLeft && veh.model.sirenRight) {
              veh.model.sirenLeft.scale.setScalar(1.0);
              veh.model.sirenRight.scale.setScalar(1.0);
            }
          }
          syncVehicleSirenButtonLabel(veh);
          pushFeedMessage(
            veh.sirenOn ? `🚨 ${veh.name} Continuous Emergency Siren ON!` : `🔕 ${veh.name} Emergency Siren OFF.`,
            'border-l-amber-400 text-amber-200'
          );
        } else {
          SoundFX.playHorn();
          pushFeedMessage('🚕 Beep beep! Yellow Cab Horn!', 'border-l-amber-400 text-amber-200');
        }
      }

      document.getElementById('btn-enter-vehicle').addEventListener('click', () => {
        const v = getNearestGroundVehicle(player.x, player.y, player.z);
        if (v) enterGroundVehicle(v);
      });
      document.getElementById('btn-exit-vehicle').addEventListener('click', exitGroundVehicle);
      document.getElementById('btn-vehicle-siren').addEventListener('click', toggleVehicleSirenOrHorn);

      document.getElementById('btn-board-heli').addEventListener('click', boardOrSummonHelicopter);
      document.getElementById('btn-exit-heli').addEventListener('click', exitHelicopter);

      const btnHeliUp = document.getElementById('btn-heli-up');
      const btnHeliDown = document.getElementById('btn-heli-down');
      btnHeliUp.addEventListener('pointerdown', (e) => { e.preventDefault(); helicopter.ascendHeld = true; });
      btnHeliUp.addEventListener('pointerup', () => { helicopter.ascendHeld = false; });
      btnHeliUp.addEventListener('pointerleave', () => { helicopter.ascendHeld = false; });
      btnHeliDown.addEventListener('pointerdown', (e) => { e.preventDefault(); helicopter.descendHeld = true; });
      btnHeliDown.addEventListener('pointerup', () => { helicopter.descendHeld = false; });
      btnHeliDown.addEventListener('pointerleave', () => { helicopter.descendHeld = false; });

      // ==========================================
      // 12. 7TH FLOOR PLAYABLE ARCADE CABINET MINI-GAMES
      // ==========================================
      let nearestArcadeCabinet = null;
      const arcadeModal = document.getElementById('arcade-modal');
      const arcadeCanvas = document.getElementById('arcade-game-canvas');
      const arcadeCtx = arcadeCanvas.getContext('2d');
      const arcadeScoreVal = document.getElementById('arcade-score-val');

      const arcadeGame = {
        open: false,
        mode: 'breaker',
        buildingTheme: 'esports',
        score: 0,
        paddleX: 150,
        paddleW: 76,
        ballX: 190,
        ballY: 180,
        ballVX: 3.4,
        ballVY: -3.6,
        bricks: [],
        aliens: [],
        lasers: [],
        items: [],
        pins: [],
        bowlState: 'aim',
        bowlFrame: 1,
        bowlRollInFrame: 1,
        bowlAimAngle: 0,
        bowlBanner: '',
        bowlBannerTimer: 0,
        dialAngle: 0,
        spawnTimer: 0,
        combo: 0,
        moveLeft: false,
        moveRight: false
      };

      function setupBowlingPins() {
        arcadeGame.pins = [];
        const rows = [
          [0],
          [-16, 16],
          [-32, 0, 32],
          [-48, -16, 16, 48]
        ];
        rows.forEach((rOffsets, rIdx) => {
          rOffsets.forEach((ox) => {
            arcadeGame.pins.push({
              x: 190 + ox,
              y: 78 - rIdx * 15,
              vx: 0,
              vy: 0,
              standing: true,
              hit: false
            });
          });
        });
      }

      function initArcadeState(mode) {
        arcadeGame.mode = mode || 'breaker';
        arcadeGame.score = 0;
        arcadeGame.paddleX = 152;
        arcadeGame.paddleW = 76;
        arcadeGame.ballX = 190;
        arcadeGame.ballY = 222;
        arcadeGame.ballVX = 3.5 * (Math.random() > 0.5 ? 1 : -1);
        arcadeGame.ballVY = -3.7;
        arcadeGame.bricks = [];
        arcadeGame.aliens = [];
        arcadeGame.lasers = [];
        arcadeGame.items = [];
        arcadeGame.combo = 0;
        arcadeGame.spawnTimer = 0;
        arcadeGame.dialAngle = 0;
        arcadeScoreVal.textContent = '0';

        if (mode === 'bowling') {
          setupBowlingPins();
          arcadeGame.bowlState = 'aim';
          arcadeGame.bowlFrame = 1;
          arcadeGame.bowlRollInFrame = 1;
          arcadeGame.ballX = 190;
          arcadeGame.ballY = 228;
          arcadeGame.ballVX = 0;
          arcadeGame.ballVY = 0;
          arcadeGame.bowlBanner = 'AIM & PRESS [SPACE] / CLICK TO ROLL!';
          arcadeGame.bowlBannerTimer = 90;
        } else if (mode === 'breaker') {
          arcadeGame.ballY = 190;
          const colors = ['#f472b6', '#22d3ee', '#a3e635', '#facc15'];
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 7; c++) {
              arcadeGame.bricks.push({
                x: 18 + c * 50,
                y: 32 + r * 20,
                w: 44,
                h: 14,
                color: colors[r],
                alive: true
              });
            }
          }
        } else if (mode === 'invaders' || mode === 'cosmos_tracker') {
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 6; c++) {
              arcadeGame.aliens.push({
                x: 36 + c * 52,
                y: 34 + r * 26,
                w: 28,
                h: 16,
                dir: 1,
                color: mode === 'cosmos_tracker' ? ['#38bdf8', '#facc15', '#c084fc'][r] : '#10b981',
                alive: true
              });
            }
          }
        } else if (mode === 'aqua_feeder') {
          for (let i = 0; i < 6; i++) {
            arcadeGame.aliens.push({
              x: 40 + i * 52,
              y: 95 + (i % 3) * 42,
              w: 30,
              h: 16,
              dir: i % 2 === 0 ? 1.3 : -1.3,
              color: i === 2 ? '#f43f5e' : (i % 2 === 0 ? '#22d3ee' : '#facc15'),
              isShark: i === 2,
              alive: true
            });
          }
        }
      }

      function triggerArcadeAction() {
        if (!arcadeGame.open) return;
        const m = arcadeGame.mode;
        if (m === 'bowling') {
          if (arcadeGame.bowlState === 'aim') {
            arcadeGame.bowlState = 'roll';
            arcadeGame.ballX = arcadeGame.paddleX + arcadeGame.paddleW / 2;
            arcadeGame.ballY = 226;
            arcadeGame.ballVX = Math.sin(arcadeGame.bowlAimAngle) * 2.4;
            arcadeGame.ballVY = -5.8;
            SoundFX.playJump();
            launch3DBowlingBallRoll();
          }
        } else if (m === 'invaders' || m === 'cosmos_tracker' || m === 'med_clinic' || m === 'turbo_racer') {
          arcadeGame.lasers.push({ x: arcadeGame.paddleX + arcadeGame.paddleW / 2, y: 222, vy: -6.8 });
          SoundFX.playShoot();
        } else if (m === 'aqua_feeder') {
          arcadeGame.lasers.push({ x: arcadeGame.paddleX + arcadeGame.paddleW / 2, y: 36, vy: 3.8 });
          SoundFX.playSplash();
        } else if (m === 'style_studio') {
          const pal = cyclePlayer3DOutfit();
          arcadeGame.score += 100;
          arcadeScoreVal.textContent = String(arcadeGame.score);
          arcadeGame.bowlBanner = `NEW STYLE: ${pal.name.toUpperCase()}!`;
          arcadeGame.bowlBannerTimer = 60;
        } else if (m === 'vault_matcher') {
          const norm = ((arcadeGame.dialAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          if (norm < 0.65 || norm > Math.PI * 2 - 0.65) {
            arcadeGame.score += 250;
            arcadeScoreVal.textContent = String(arcadeGame.score);
            arcadeGame.bowlBanner = '🔓 VAULT UNLOCKED! +250 JACKPOT!';
            arcadeGame.bowlBannerTimer = 65;
            SoundFX.playFanfare();
          } else {
            SoundFX.playJump();
          }
        } else if (m === 'rhythm_music') {
          SoundFX.playFanfare();
          arcadeGame.score += 50;
          arcadeScoreVal.textContent = String(arcadeGame.score);
        } else if (m === 'food_catcher') {
          replenishPlayerHunger(8, 5, null);
          SoundFX.playJump();
        } else {
          arcadeGame.ballVY = -Math.abs(arcadeGame.ballVY);
          SoundFX.playJump();
        }
      }

      function openArcadeCabinetModal(cab) {
        arcadeGame.open = true;
        arcadeGame.buildingTheme = (cab && cab.buildingTheme) || 'esports';
        document.getElementById('arcade-modal-heading').textContent = cab ? cab.title : 'Neon Brick Breaker DX';
        const statusEl = document.getElementById('arcade-status-val');
        if (statusEl) {
          statusEl.textContent = (cab && cab.statusHint) || 'Move: Mouse or A/D • Action: Space / Click';
        }
        initArcadeState(cab ? cab.game : 'breaker');
        arcadeModal.classList.remove('hidden');
        arcadeModal.classList.add('flex');
        syncCursorAndPointerLock();
        SoundFX.playFanfare();
      }

      function closeArcadeCabinetModal() {
        arcadeGame.open = false;
        arcadeModal.classList.add('hidden');
        arcadeModal.classList.remove('flex');
        syncCursorAndPointerLock();
      }

      document.getElementById('btn-open-arcade').addEventListener('click', () => {
        if (nearestArcadeCabinet) {
          openArcadeCabinetModal(nearestArcadeCabinet);
        } else {
          triggerIndoorBuildingActivity();
        }
      });
      document.getElementById('btn-close-arcade').addEventListener('click', closeArcadeCabinetModal);
      document.getElementById('btn-arcade-restart').addEventListener('click', () => initArcadeState(arcadeGame.mode));
      document.getElementById('btn-arcade-game-breaker').addEventListener('click', () => initArcadeState('breaker'));
      document.getElementById('btn-arcade-game-pong').addEventListener('click', () => initArcadeState('pong'));
      document.getElementById('btn-arcade-game-invaders').addEventListener('click', () => initArcadeState('invaders'));

      arcadeCanvas.addEventListener('mousemove', (e) => {
        const rect = arcadeCanvas.getBoundingClientRect();
        const scaleX = arcadeCanvas.width / rect.width;
        arcadeGame.paddleX = Math.max(8, Math.min(arcadeCanvas.width - arcadeGame.paddleW - 8, (e.clientX - rect.left) * scaleX - arcadeGame.paddleW / 2));
      });
      arcadeCanvas.addEventListener('click', () => {
        triggerArcadeAction();
      });

      const btnArcL = document.getElementById('btn-arcade-left');
      const btnArcR = document.getElementById('btn-arcade-right');
      btnArcL.addEventListener('pointerdown', () => { arcadeGame.moveLeft = true; });
      btnArcL.addEventListener('pointerup', () => { arcadeGame.moveLeft = false; });
      btnArcR.addEventListener('pointerdown', () => { arcadeGame.moveRight = true; });
      btnArcR.addEventListener('pointerup', () => { arcadeGame.moveRight = false; });

      document.getElementById('btn-arcade-fire').addEventListener('click', triggerArcadeAction);

      function updateArcadeMiniGame() {
        if (!arcadeGame.open) return;
        const W = arcadeCanvas.width;
        const H = arcadeCanvas.height;
        const m = arcadeGame.mode;

        if (arcadeGame.moveLeft || keys['ArrowLeft'] || keys['KeyA']) {
          arcadeGame.paddleX = Math.max(8, arcadeGame.paddleX - 5.5);
        }
        if (arcadeGame.moveRight || keys['ArrowRight'] || keys['KeyD']) {
          arcadeGame.paddleX = Math.min(W - arcadeGame.paddleW - 8, arcadeGame.paddleX + 5.5);
        }

        arcadeCtx.fillStyle = '#090d16';
        arcadeCtx.fillRect(0, 0, W, H);

        // =========================================================
        // MODE 1: PLAYABLE 10-PIN BOWLING ALLEY (m === 'bowling')
        // =========================================================
        if (m === 'bowling') {
          // Draw gutters & maple hardwood bowling lane
          arcadeCtx.fillStyle = '#1e293b';
          arcadeCtx.fillRect(72, 0, 18, H);
          arcadeCtx.fillRect(W - 90, 0, 18, H);

          arcadeCtx.fillStyle = '#d97706';
          arcadeCtx.fillRect(90, 0, W - 180, H);

          // Lane planks & arrows
          arcadeCtx.strokeStyle = 'rgba(254, 240, 138, 0.22)';
          arcadeCtx.lineWidth = 1;
          for (let lx = 110; lx < W - 90; lx += 20) {
            arcadeCtx.beginPath();
            arcadeCtx.moveTo(lx, 0);
            arcadeCtx.lineTo(lx, H);
            arcadeCtx.stroke();
          }

          // Foul line
          arcadeCtx.fillStyle = '#ef4444';
          arcadeCtx.fillRect(90, 206, W - 180, 3);

          // Frame & Roll HUD inside lane
          arcadeCtx.fillStyle = '#fde047';
          arcadeCtx.font = 'bold 11px Inter, monospace';
          arcadeCtx.fillText(`FRAME ${arcadeGame.bowlFrame} • ROLL ${arcadeGame.bowlRollInFrame}`, 12, 46);

          if (arcadeGame.bowlState === 'aim') {
            arcadeGame.bowlAimAngle = Math.sin(performance.now() * 0.004) * 0.55;
            const startX = Math.max(102, Math.min(W - 102, arcadeGame.paddleX + arcadeGame.paddleW / 2));
            arcadeGame.ballX = startX;
            arcadeGame.ballY = 226;

            // Aim guide line
            arcadeCtx.strokeStyle = '#22d3ee';
            arcadeCtx.lineWidth = 2;
            arcadeCtx.beginPath();
            arcadeCtx.moveTo(startX, 226);
            arcadeCtx.lineTo(startX + Math.sin(arcadeGame.bowlAimAngle) * 58, 155);
            arcadeCtx.stroke();
          } else if (arcadeGame.bowlState === 'roll') {
            arcadeGame.ballX += arcadeGame.ballVX;
            arcadeGame.ballY += arcadeGame.ballVY;

            // Gutter check
            if (arcadeGame.ballX < 96) {
              arcadeGame.ballX = 81;
              arcadeGame.ballVX = 0;
            } else if (arcadeGame.ballX > W - 96) {
              arcadeGame.ballX = W - 81;
              arcadeGame.ballVX = 0;
            }

            // Collide ball with standing pins
            arcadeGame.pins.forEach((p) => {
              if (!p.standing) return;
              const dx = p.x - arcadeGame.ballX;
              const dy = p.y - arcadeGame.ballY;
              const dist = Math.hypot(dx, dy);
              if (dist < 17) {
                p.standing = false;
                p.hit = true;
                p.vx = (dx / (dist || 1)) * 4.5 + (Math.random() - 0.5) * 2.5;
                p.vy = -3.8 - Math.random() * 2.0;
                arcadeGame.score += 15;
                arcadeScoreVal.textContent = String(arcadeGame.score);
                SoundFX.playSplat();
              }
            });

            // Pin-to-pin chain scatter physics
            arcadeGame.pins.forEach((p) => {
              if (!p.hit) return;
              p.x += p.vx;
              p.y += p.vy;
              p.vx *= 0.92;
              p.vy *= 0.92;
              arcadeGame.pins.forEach((other) => {
                if (!other.standing) return;
                const d = Math.hypot(other.x - p.x, other.y - p.y);
                if (d < 15) {
                  other.standing = false;
                  other.hit = true;
                  other.vx = p.vx * 0.9 + (Math.random() - 0.5) * 3.0;
                  other.vy = -3.2;
                  arcadeGame.score += 15;
                  arcadeScoreVal.textContent = String(arcadeGame.score);
                  SoundFX.playSplat();
                }
              });
            });

            if (arcadeGame.ballY < 14) {
              const standingCount = arcadeGame.pins.filter((p) => p.standing).length;
              const knocked = 10 - standingCount;
              if (standingCount === 0) {
                if (arcadeGame.bowlRollInFrame === 1) {
                  arcadeGame.bowlBanner = '🎳 STRIKE! (X) +100 COINS & +120 XP!';
                  arcadeGame.score += 100;
                  awardCoinsAndXP(100, 120, '🎳 Bowling Strike!');
                } else {
                  arcadeGame.bowlBanner = '🎳 SPARE! (/) +50 COINS & +60 XP!';
                  arcadeGame.score += 50;
                  awardCoinsAndXP(50, 60, '🎳 Bowling Spare!');
                }
                arcadeScoreVal.textContent = String(arcadeGame.score);
                SoundFX.playFanfare();
                setupBowlingPins();
                arcadeGame.bowlFrame = (arcadeGame.bowlFrame % 10) + 1;
                arcadeGame.bowlRollInFrame = 1;
              } else if (arcadeGame.bowlRollInFrame === 1) {
                arcadeGame.bowlBanner = `${knocked} PINS DOWN! ROLL 2 FOR SPARE!`;
                arcadeGame.bowlRollInFrame = 2;
              } else {
                arcadeGame.bowlBanner = `FRAME COMPLETE (${knocked}/10 PINS)!`;
                setupBowlingPins();
                arcadeGame.bowlFrame = (arcadeGame.bowlFrame % 10) + 1;
                arcadeGame.bowlRollInFrame = 1;
              }
              arcadeGame.bowlBannerTimer = 85;
              arcadeGame.bowlState = 'aim';
            }
          }

          // Draw 10 Bowling Pins
          arcadeGame.pins.forEach((p) => {
            if (p.standing) {
              arcadeCtx.fillStyle = '#ffffff';
              arcadeCtx.beginPath();
              arcadeCtx.arc(p.x, p.y, 6.5, 0, Math.PI * 2);
              arcadeCtx.fill();
              arcadeCtx.strokeStyle = '#ef4444';
              arcadeCtx.lineWidth = 2;
              arcadeCtx.stroke();
            } else if (p.y > 4 && p.y < 140) {
              arcadeCtx.fillStyle = '#94a3b8';
              arcadeCtx.fillRect(p.x - 5, p.y - 2, 10, 4);
            }
          });

          // Draw Bowling Ball
          arcadeCtx.fillStyle = '#f43f5e';
          arcadeCtx.beginPath();
          arcadeCtx.arc(arcadeGame.ballX, arcadeGame.ballY, 10, 0, Math.PI * 2);
          arcadeCtx.fill();
          arcadeCtx.fillStyle = '#0f172a';
          arcadeCtx.fillRect(arcadeGame.ballX - 3, arcadeGame.ballY - 4, 2, 2);
          arcadeCtx.fillRect(arcadeGame.ballX + 2, arcadeGame.ballY - 4, 2, 2);
          arcadeCtx.fillRect(arcadeGame.ballX, arcadeGame.ballY + 1, 2, 2);

          if (arcadeGame.bowlBannerTimer > 0) {
            arcadeGame.bowlBannerTimer--;
            arcadeCtx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            arcadeCtx.fillRect(35, 118, W - 70, 32);
            arcadeCtx.strokeStyle = '#facc15';
            arcadeCtx.strokeRect(35, 118, W - 70, 32);
            arcadeCtx.fillStyle = '#fef08a';
            arcadeCtx.font = 'bold 12px Inter, sans-serif';
            arcadeCtx.fillText(arcadeGame.bowlBanner, 48, 138);
          }
          return;
        }

        // =========================================================
        // MODE 2: PLAYABLE FOOD CATCHER / RHYTHM / SPORTS / CLINIC / VAULT / STYLE
        // =========================================================
        if (
          m === 'food_catcher' ||
          m === 'rhythm_music' ||
          m === 'sports_challenge' ||
          m === 'turbo_racer' ||
          m === 'med_clinic' ||
          m === 'vault_matcher' ||
          m === 'style_studio'
        ) {
          if (m === 'turbo_racer') {
            // 3-lane highway background
            arcadeCtx.fillStyle = '#1e293b';
            arcadeCtx.fillRect(70, 0, W - 140, H);
            arcadeCtx.strokeStyle = '#facc15';
            arcadeCtx.setLineDash([14, 14]);
            arcadeCtx.beginPath();
            arcadeCtx.moveTo(150, 0);
            arcadeCtx.lineTo(150, H);
            arcadeCtx.moveTo(230, 0);
            arcadeCtx.lineTo(230, H);
            arcadeCtx.stroke();
            arcadeCtx.setLineDash([]);
          } else if (m === 'rhythm_music') {
            // 4 musical synth lanes
            [75, 145, 215, 285].forEach((lx, i) => {
              arcadeCtx.strokeStyle = ['#ec4899', '#22d3ee', '#a855f7', '#facc15'][i];
              arcadeCtx.beginPath();
              arcadeCtx.moveTo(lx, 24);
              arcadeCtx.lineTo(lx, H - 22);
              arcadeCtx.stroke();
            });
          } else if (m === 'vault_matcher') {
            // Rotating vault lock dial in center-top
            arcadeGame.dialAngle += 0.045;
            arcadeCtx.strokeStyle = '#334155';
            arcadeCtx.lineWidth = 5;
            arcadeCtx.beginPath();
            arcadeCtx.arc(W / 2, 68, 26, 0, Math.PI * 2);
            arcadeCtx.stroke();
            arcadeCtx.strokeStyle = '#10b981';
            arcadeCtx.beginPath();
            arcadeCtx.arc(W / 2, 68, 26, -0.5, 0.5);
            arcadeCtx.stroke();
            const nx = W / 2 + Math.cos(arcadeGame.dialAngle) * 24;
            const ny = 68 + Math.sin(arcadeGame.dialAngle) * 24;
            arcadeCtx.strokeStyle = '#facc15';
            arcadeCtx.beginPath();
            arcadeCtx.moveTo(W / 2, 68);
            arcadeCtx.lineTo(nx, ny);
            arcadeCtx.stroke();
          } else if (m === 'style_studio') {
            const pal = CUSTOM_OUTFIT_PALETTES[currentOutfitIdx];
            arcadeCtx.fillStyle = pal.hex;
            arcadeCtx.fillRect(W / 2 - 22, 52, 44, 52);
            arcadeCtx.fillStyle = '#fde68a';
            arcadeCtx.fillRect(W / 2 - 14, 28, 28, 24);
            arcadeCtx.fillStyle = '#ffffff';
            arcadeCtx.font = 'bold 11px Inter, sans-serif';
            arcadeCtx.fillText(`CURRENT 3D OUTFIT: ${pal.name.toUpperCase()} [SPACE TO CYCLE]`, 45, 122);
          }

          // Spawn falling items/notes/targets/traffic
          arcadeGame.spawnTimer--;
          if (arcadeGame.spawnTimer <= 0) {
            arcadeGame.spawnTimer = m === 'rhythm_music' ? 18 : 22;
            const isHazard = m !== 'rhythm_music' && Math.random() < 0.22;
            const laneX = m === 'rhythm_music'
              ? [65, 135, 205, 275][Math.floor(Math.random() * 4)]
              : 24 + Math.random() * (W - 68);
            arcadeGame.items.push({
              x: laneX,
              y: 26,
              vy: 2.6 + Math.random() * 1.6,
              isHazard,
              color: isHazard ? '#ef4444' : ['#facc15', '#22d3ee', '#4ade80', '#f472b6'][Math.floor(Math.random() * 4)]
            });
          }

          // Draw player catcher / vehicle / fighter pad
          arcadeCtx.fillStyle = m === 'food_catcher' ? '#f59e0b' : (m === 'med_clinic' ? '#10b981' : '#22d3ee');
          arcadeCtx.fillRect(arcadeGame.paddleX, H - 24, arcadeGame.paddleW, 12);

          // Update & draw falling items
          for (let i = arcadeGame.items.length - 1; i >= 0; i--) {
            const it = arcadeGame.items[i];
            it.y += it.vy;
            arcadeCtx.fillStyle = it.color;
            if (it.isHazard) {
              arcadeCtx.fillRect(it.x - 8, it.y - 8, 16, 16);
            } else {
              arcadeCtx.beginPath();
              arcadeCtx.arc(it.x, it.y, 8, 0, Math.PI * 2);
              arcadeCtx.fill();
            }

            // Laser hit on hazard
            for (let l = arcadeGame.lasers.length - 1; l >= 0; l--) {
              const ls = arcadeGame.lasers[l];
              if (Math.hypot(ls.x - it.x, ls.y - it.y) < 15) {
                arcadeGame.items.splice(i, 1);
                arcadeGame.lasers.splice(l, 1);
                arcadeGame.score += 50;
                arcadeScoreVal.textContent = String(arcadeGame.score);
                SoundFX.playSplat();
                break;
              }
            }

            if (!arcadeGame.items[i]) continue;

            // Catch check with player paddle
            if (
              it.y >= H - 28 &&
              it.y <= H - 8 &&
              it.x >= arcadeGame.paddleX - 8 &&
              it.x <= arcadeGame.paddleX + arcadeGame.paddleW + 8
            ) {
              if (it.isHazard) {
                arcadeGame.score = Math.max(0, arcadeGame.score - 25);
                SoundFX.playSplat();
              } else {
                arcadeGame.score += 40;
                SoundFX.playJump();
                if (m === 'food_catcher' || m === 'med_clinic' || m === 'style_studio') {
                  player.hunger = Math.min(player.maxHunger, player.hunger + 10);
                  player.hp = Math.min(player.maxHp, player.hp + 8);
                  updateHUD();
                }
              }
              arcadeScoreVal.textContent = String(arcadeGame.score);
              arcadeGame.items.splice(i, 1);
            } else if (it.y > H) {
              arcadeGame.items.splice(i, 1);
            }
          }

          // Update lasers if any
          arcadeGame.lasers.forEach((ls) => {
            ls.y += ls.vy;
            arcadeCtx.fillStyle = '#38bdf8';
            arcadeCtx.fillRect(ls.x - 2, ls.y, 4, 10);
          });
          arcadeGame.lasers = arcadeGame.lasers.filter((l) => l.y > 0 && l.y < H);

          // Live Hunger Bar indicator inside food_catcher / med_clinic
          if (m === 'food_catcher' || m === 'med_clinic') {
            arcadeCtx.fillStyle = '#fde047';
            arcadeCtx.font = 'bold 11px Inter, monospace';
            arcadeCtx.fillText(`🍔 HUNGER: ${Math.round(player.hunger)}/100 • ❤️ HP: ${Math.round(player.hp)}/100`, 12, H - 34);
          }

          if (arcadeGame.bowlBannerTimer > 0) {
            arcadeGame.bowlBannerTimer--;
            arcadeCtx.fillStyle = '#fef08a';
            arcadeCtx.font = 'bold 12px Inter, sans-serif';
            arcadeCtx.fillText(arcadeGame.bowlBanner, 55, 148);
          }
          return;
        }

        // =========================================================
        // MODE 3: BRICK BREAKER, CYBER PONG, SPACE BLOCKS, COSMOS TRACKER & AQUA FEEDER
        // =========================================================
        arcadeCtx.fillStyle = '#22d3ee';
        arcadeCtx.fillRect(arcadeGame.paddleX, m === 'aqua_feeder' ? 26 : H - 22, arcadeGame.paddleW, 10);

        if (m === 'breaker' || m === 'pong') {
          arcadeGame.ballX += arcadeGame.ballVX;
          arcadeGame.ballY += arcadeGame.ballVY;

          if (arcadeGame.ballX < 8 || arcadeGame.ballX > W - 8) arcadeGame.ballVX *= -1;
          if (arcadeGame.ballY < 12) {
            if (m === 'pong') {
              arcadeGame.score += 100;
              arcadeScoreVal.textContent = String(arcadeGame.score);
              SoundFX.playSplat();
            }
            arcadeGame.ballVY = Math.abs(arcadeGame.ballVY);
          }
          if (arcadeGame.ballY > H - 28 && arcadeGame.ballX >= arcadeGame.paddleX - 6 && arcadeGame.ballX <= arcadeGame.paddleX + arcadeGame.paddleW + 6) {
            arcadeGame.ballVY = -Math.abs(arcadeGame.ballVY);
            SoundFX.playJump();
          }
          if (arcadeGame.ballY > H) {
            arcadeGame.ballX = W / 2;
            arcadeGame.ballY = H / 2;
            arcadeGame.ballVY = -3.6;
          }

          if (m === 'breaker') {
            let anyAlive = false;
            arcadeGame.bricks.forEach((b) => {
              if (!b.alive) return;
              anyAlive = true;
              arcadeCtx.fillStyle = b.color;
              arcadeCtx.fillRect(b.x, b.y, b.w, b.h);
              if (
                arcadeGame.ballX >= b.x &&
                arcadeGame.ballX <= b.x + b.w &&
                arcadeGame.ballY >= b.y &&
                arcadeGame.ballY <= b.y + b.h
              ) {
                b.alive = false;
                arcadeGame.ballVY *= -1;
                arcadeGame.score += 50;
                arcadeScoreVal.textContent = String(arcadeGame.score);
                SoundFX.playSplat();
              }
            });
            if (!anyAlive) initArcadeState('breaker');
          } else {
            const aiX = Math.max(8, Math.min(W - 76, arcadeGame.ballX - 38));
            arcadeCtx.fillStyle = '#f43f5e';
            arcadeCtx.fillRect(aiX, 12, 76, 8);
          }

          arcadeCtx.fillStyle = '#facc15';
          arcadeCtx.beginPath();
          arcadeCtx.arc(arcadeGame.ballX, arcadeGame.ballY, 6, 0, Math.PI * 2);
          arcadeCtx.fill();
        } else if (m === 'invaders' || m === 'cosmos_tracker' || m === 'aqua_feeder') {
          let hitEdge = false;
          let anyAlive = false;
          arcadeGame.aliens.forEach((al) => {
            if (!al.alive) return;
            anyAlive = true;
            al.x += al.dir * 1.2;
            if (al.x < 12 || al.x + al.w > W - 12) hitEdge = true;
            arcadeCtx.fillStyle = al.color || '#10b981';
            arcadeCtx.fillRect(al.x, al.y, al.w, al.h);
          });
          if (!anyAlive) initArcadeState(m);
          if (hitEdge) {
            arcadeGame.aliens.forEach((al) => {
              al.dir *= -1;
              if (m === 'invaders') al.y += 6;
            });
          }
          arcadeGame.lasers.forEach((ls) => {
            ls.y += ls.vy || -6.5;
            arcadeCtx.fillStyle = m === 'aqua_feeder' ? '#fde047' : '#f472b6';
            arcadeCtx.fillRect(ls.x - 3, ls.y, 6, 8);
            arcadeGame.aliens.forEach((al) => {
              if (al.alive && ls.x >= al.x && ls.x <= al.x + al.w && ls.y >= al.y && ls.y <= al.y + al.h) {
                if (m !== 'aqua_feeder') al.alive = false;
                ls.y = -999;
                arcadeGame.score += 75;
                arcadeScoreVal.textContent = String(arcadeGame.score);
                if (m === 'aqua_feeder') {
                  player.hunger = Math.min(player.maxHunger, player.hunger + 6);
                  updateHUD();
                }
                SoundFX.playSplat();
              }
            });
          });
          arcadeGame.lasers = arcadeGame.lasers.filter((l) => l.y > 0 && l.y < H);
        }
      }

      // ==========================================
      // 13. DAY/NIGHT MANUAL TOGGLE, MULTIPLAYER ENGINE & MODALS
      // ==========================================
      function formatCycleTimer(sec) {
        const total = Math.max(0, Math.ceil(sec));
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }

      function syncDayNightButtonUI() {
        const btn = document.getElementById('btn-day-night-toggle');
        const iconEl = document.getElementById('day-night-icon');
        const labelEl = document.getElementById('day-night-label');
        if (!btn || !iconEl || !labelEl) return;
        const timeStr = formatCycleTimer(dayNightState.phaseRemainingSec);
        if (dayNightState.isNight) {
          iconEl.textContent = '🌙';
          labelEl.textContent = `Night ${timeStr}`;
          btn.className = 'px-2.5 py-1.5 rounded-xl bg-indigo-950/95 hover:bg-indigo-900 text-xs font-extrabold text-amber-300 border border-indigo-400/80 transition flex items-center gap-1 shadow';
        } else {
          iconEl.textContent = '☀️';
          labelEl.textContent = `Day ${timeStr}`;
          btn.className = 'px-2.5 py-1.5 rounded-xl bg-amber-500/90 hover:bg-amber-400 text-xs font-extrabold text-slate-950 border border-amber-300/80 transition flex items-center gap-1 shadow';
        }
      }

      function toggleDayNightManual() {
        dayNightState.isNight = !dayNightState.isNight;
        dayNightState.phaseRemainingSec = dayNightState.isNight ? NIGHT_DURATION_SEC : DAY_DURATION_SEC;
        dayNightState.lastHudSecond = -1;
        syncDayNightButtonUI();
      }

      const dayNightBtnEl = document.getElementById('btn-day-night-toggle');
      if (dayNightBtnEl) {
        dayNightBtnEl.addEventListener('click', toggleDayNightManual);
      }

      // ==========================================
      // 13B. REAL-TIME MULTIPLAYER ENGINE (REST /api/multiplayer/sync + BroadcastChannel)
      // ==========================================
      let MP_CLIENT_ID = `mp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      try {
        if (typeof sessionStorage !== 'undefined') {
          const existingId = sessionStorage.getItem('blocky_metro_mp_id');
          if (existingId) {
            MP_CLIENT_ID = existingId;
          } else {
            sessionStorage.setItem('blocky_metro_mp_id', MP_CLIENT_ID);
          }
        }
      } catch (e) {}

      const MP_COLOR_PALETTES = [
        { shirt: 0x10b981, visor: 0x6ee7b7, hex: '#10b981' },
        { shirt: 0xf59e0b, visor: 0xfde047, hex: '#f59e0b' },
        { shirt: 0xa855f7, visor: 0xd8b4fe, hex: '#a855f7' },
        { shirt: 0xec4899, visor: 0xf9a8d4, hex: '#ec4899' },
        { shirt: 0x06b6d4, visor: 0x67e8f9, hex: '#06b6d4' },
        { shirt: 0xef4444, visor: 0xfca5a5, hex: '#ef4444' }
      ];
      const myPaletteIdx = Math.abs(
        MP_CLIENT_ID.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
      ) % MP_COLOR_PALETTES.length;
      const myMpPalette = MP_COLOR_PALETTES[myPaletteIdx];

      const multiplayerState = {
        playerName: savedMpName,
        remotePlayers: new Map(),
        syncTimer: 0,
        syncInFlight: false,
        bc: typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('blocky_metro_mp_v2') : null,
        lastPeerListHtml: ''
      };

      const mpNameInputEl = document.getElementById('input-mp-nametag');
      const profileNameInputEl = document.getElementById('input-profile-username');
      if (mpNameInputEl) mpNameInputEl.value = multiplayerState.playerName;
      if (profileNameInputEl && !profileNameInputEl.value) profileNameInputEl.value = multiplayerState.playerName;

      function setLocalPlayerNameTag(newName) {
        const cleaned = String(newName || '').trim().slice(0, 16) || 'Player';
        multiplayerState.playerName = cleaned;
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('blocky_metro_player_name', cleaned);
          }
        } catch (e) {}
        if (mpNameInputEl && mpNameInputEl.value !== cleaned) mpNameInputEl.value = cleaned;
        if (profileNameInputEl && profileNameInputEl.value !== cleaned) profileNameInputEl.value = cleaned;
        updatePlayerNameTagSprite(localPlayerNameTag, cleaned, 'YOU • ONLINE', '#38bdf8', player.hp);
        broadcastLocalPlayerState();
      }

      const btnSaveNameTag = document.getElementById('btn-save-nametag');
      if (btnSaveNameTag && mpNameInputEl) {
        btnSaveNameTag.addEventListener('click', () => {
          setLocalPlayerNameTag(mpNameInputEl.value);
          pushFeedMessage(`🏷️ Name Tag updated to "${multiplayerState.playerName}"!`, 'border-l-emerald-400 text-emerald-200');
        });
        mpNameInputEl.addEventListener('keydown', (e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            setLocalPlayerNameTag(mpNameInputEl.value);
            mpNameInputEl.blur();
            pushFeedMessage(`🏷️ Name Tag updated to "${multiplayerState.playerName}"!`, 'border-l-emerald-400 text-emerald-200');
          }
        });
      }

      if (profileNameInputEl) {
        profileNameInputEl.addEventListener('change', () => {
          if (profileNameInputEl.value.trim()) {
            setLocalPlayerNameTag(profileNameInputEl.value.trim());
          }
        });
      }

      function getLocalPlayerZoneLabel() {
        if (player.inArena) return 'Paintball Arena';
        if (player.inHelicopter) return 'Piloting Chopper';
        if (player.isSwimming) return '9F Sky Pool';
        if (player.activeVehicle) return player.activeVehicle.name;
        if (player.y >= 35) return 'Skyscraper Roof';
        if (player.y >= 5) return 'Building Interior';
        return 'Metro City';
      }

      function getLocalPlayerSnapshot() {
        return {
          id: MP_CLIENT_ID,
          name: multiplayerState.playerName,
          shirtColor: myMpPalette.shirt,
          visorColor: myMpPalette.visor,
          colorHex: myMpPalette.hex,
          x: Number(player.x.toFixed(2)),
          y: Number(player.y.toFixed(2)),
          z: Number(player.z.toFixed(2)),
          yaw: Number(player.yaw.toFixed(3)),
          speed: Number((player.currentSpeed || 0).toFixed(2)),
          isSwimming: !!player.isSwimming,
          inHelicopter: !!player.inHelicopter,
          activeVehicleId: player.activeVehicle ? player.activeVehicle.id : null,
          inArena: !!player.inArena,
          hp: player.hp,
          splats: player.splats,
          zone: getLocalPlayerZoneLabel(),
          raceInviteTo: mpBuggyRace.sentToId || null,
          raceInviteId: mpBuggyRace.sentRaceId || null,
          raceInviteLaps: mpBuggyRace.sentLaps || 2,
          raceAcceptedId: mpBuggyRace.acceptedRaceId || null,
          raceFinishedId: mpBuggyRace.finishedRaceId || null,
          ts: Date.now()
        };
      }

      function upsertRemotePlayer(snap) {
        if (!snap || !snap.id || snap.id === MP_CLIENT_ID) return;
        let rp = multiplayerState.remotePlayers.get(snap.id);
        if (!rp) {
          const rig = createBoxCharacter({
            skinColor: 0xfde68a,
            shirtColor: snap.shirtColor || 0x10b981,
            pantsColor: 0x0f172a,
            visorColor: snap.visorColor || 0x6ee7b7,
            hasGun: true
          });
          const nameTag = createPlayerNameTagSprite(
            snap.name || 'Player',
            snap.zone || 'ONLINE',
            snap.colorHex || '#10b981'
          );
          rig.root.add(nameTag);
          rig.root.position.set(snap.x || 0, snap.y || 0, snap.z || 25);
          scene.add(rig.root);

          rp = {
            id: snap.id,
            name: snap.name || 'Player',
            rig,
            nameTag,
            x: snap.x || 0,
            y: snap.y || 0,
            z: snap.z || 25,
            targetX: snap.x || 0,
            targetY: snap.y || 0,
            targetZ: snap.z || 25,
            yaw: snap.yaw || 0,
            targetYaw: snap.yaw || 0,
            speed: snap.speed || 0,
            isSwimming: !!snap.isSwimming,
            inHelicopter: !!snap.inHelicopter,
            activeVehicleId: snap.activeVehicleId || null,
            inArena: !!snap.inArena,
            hp: snap.hp ?? 100,
            zone: snap.zone || 'Metro City',
            colorHex: snap.colorHex || '#10b981',
            raceInviteTo: snap.raceInviteTo || null,
            raceInviteId: snap.raceInviteId || null,
            raceInviteLaps: Number(snap.raceInviteLaps) || 2,
            raceAcceptedId: snap.raceAcceptedId || null,
            raceFinishedId: snap.raceFinishedId || null,
            lastSeen: performance.now()
          };
          multiplayerState.remotePlayers.set(snap.id, rp);
          pushFeedMessage(`🌐 ${rp.name} joined Blocky Metro!`, 'border-l-emerald-400 text-emerald-200');
        } else {
          rp.name = snap.name || rp.name;
          rp.targetX = snap.x ?? rp.targetX;
          rp.targetY = snap.y ?? rp.targetY;
          rp.targetZ = snap.z ?? rp.targetZ;
          rp.targetYaw = snap.yaw ?? rp.targetYaw;
          rp.speed = snap.speed ?? 0;
          rp.isSwimming = !!snap.isSwimming;
          rp.inHelicopter = !!snap.inHelicopter;
          rp.activeVehicleId = snap.activeVehicleId || null;
          rp.inArena = !!snap.inArena;
          rp.hp = snap.hp ?? 100;
          rp.zone = snap.zone || 'Metro City';
          rp.colorHex = snap.colorHex || rp.colorHex;
          rp.raceInviteTo = snap.raceInviteTo || null;
          rp.raceInviteId = snap.raceInviteId || null;
          rp.raceInviteLaps = Number(snap.raceInviteLaps) || 2;
          rp.raceAcceptedId = snap.raceAcceptedId || null;
          rp.raceFinishedId = snap.raceFinishedId || null;
          rp.lastSeen = performance.now();
          updatePlayerNameTagSprite(rp.nameTag, rp.name, rp.zone, rp.colorHex, rp.hp);
        }
      }

      function removeRemotePlayer(peerId) {
        const rp = multiplayerState.remotePlayers.get(peerId);
        if (!rp) return;
        scene.remove(rp.rig.root);
        multiplayerState.remotePlayers.delete(peerId);
      }

      if (multiplayerState.bc) {
        multiplayerState.bc.onmessage = (ev) => {
          const data = ev.data;
          if (!data) return;
          if (data.type === 'player_sync' && data.player) {
            upsertRemotePlayer(data.player);
          } else if (data.type === 'player_leave' && data.id) {
            removeRemotePlayer(data.id);
          }
        };
      }

      async function broadcastLocalPlayerState() {
        const snap = getLocalPlayerSnapshot();
        if (multiplayerState.bc) {
          try {
            multiplayerState.bc.postMessage({ type: 'player_sync', player: snap });
          } catch (err) {}
        }

        if (!window.location.protocol.startsWith('http')) return;
        if (multiplayerState.syncInFlight) return;
        multiplayerState.syncInFlight = true;
        try {
          const mpEndpoint = (window.__BLOCKY_API_BASE || window.location.origin) + ['', 'api', 'multiplayer', 'sync'].join('/');
          const resp = await fetch(mpEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(snap)
          });
          if (resp.ok) {
            const payload = await resp.json();
            if (payload && Array.isArray(payload.players)) {
              payload.players.forEach((p) => upsertRemotePlayer(p));
            }
          }
        } catch (err) {
          // Transient network error or standalone mode
        } finally {
          multiplayerState.syncInFlight = false;
        }
      }

      window.addEventListener('beforeunload', () => {
        if (multiplayerState.bc) {
          try {
            multiplayerState.bc.postMessage({ type: 'player_leave', id: MP_CLIENT_ID });
          } catch (e) {}
        }
        if (window.location.protocol.startsWith('http') && navigator.sendBeacon) {
          const leaveUrl = (window.__BLOCKY_API_BASE || window.location.origin) + ['', 'api', 'multiplayer', 'leave'].join('/');
          const blob = new Blob([JSON.stringify({ id: MP_CLIENT_ID })], { type: 'application/json' });
          navigator.sendBeacon(leaveUrl, blob);
        }
      });

      window.__teleportToMultiplayerPeer = function (peerId) {
        const rp = multiplayerState.remotePlayers.get(peerId);
        if (!rp) return;
        if (player.inHelicopter) exitHelicopter();
        if (player.activeVehicle) exitGroundVehicle();
        player.inArena = rp.inArena;
        player.x = rp.x + 2.2;
        player.y = rp.y;
        player.z = rp.z + 2.2;
        player.vy = 0;
        SoundFX.playTeleport();
        pushFeedMessage(`🌐 Teleported to ${rp.name} (${rp.zone})!`, 'border-l-emerald-400 text-emerald-200');
        updateHUD();
      };

      function updateMultiplayerPeers(dt, timeSec) {
        // Hide local player's overhead name tag during Paintball Arena matches (and in 1st-person/vehicles)
        // so it never blocks the aiming crosshair or view!
        localPlayerNameTag.visible = !player.firstPerson && !player.inArena && !player.inHelicopter && !player.activeVehicle;
        updatePlayerNameTagSprite(localPlayerNameTag, multiplayerState.playerName, 'YOU • ONLINE', '#38bdf8', player.hp);

        multiplayerState.syncTimer -= dt;
        if (multiplayerState.syncTimer <= 0) {
          multiplayerState.syncTimer = 0.22;
          broadcastLocalPlayerState();
        }

        const nowMs = performance.now();
        multiplayerState.remotePlayers.forEach((rp, peerId) => {
          if (nowMs - rp.lastSeen > 12000) {
            removeRemotePlayer(peerId);
            return;
          }

          const lerpFactor = 1.0 - Math.exp(-12.0 * dt);
          rp.x += (rp.targetX - rp.x) * lerpFactor;
          rp.y += (rp.targetY - rp.y) * lerpFactor;
          rp.z += (rp.targetZ - rp.z) * lerpFactor;

          let yawDiff = rp.targetYaw - rp.yaw;
          while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
          while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
          rp.yaw += yawDiff * lerpFactor;

          if (rp.rig.gunGroup) {
            rp.rig.gunGroup.visible = rp.inArena;
          }

          if (rp.isSwimming) {
            animateSwimmingCharacterAt(rp.rig, rp.x, rp.y, rp.z, rp.yaw, rp.speed, dt, timeSec);
          } else {
            rp.rig.root.position.set(rp.x, rp.y, rp.z);
            rp.rig.root.rotation.order = 'YXZ';
            rp.rig.root.rotation.set(0, rp.yaw + Math.PI, 0);
            animateBoxCharacter(rp.rig, rp.speed, dt, rp.inArena);
          }
        });

        const onlineCount = 1 + multiplayerState.remotePlayers.size;
        const badgeEl = document.getElementById('mp-online-badge');
        if (badgeEl) {
          badgeEl.textContent = `${onlineCount} Online`;
        }
        const listEl = document.getElementById('mp-peers-list');
        if (listEl) {
          let htmlStr = '';
          if (multiplayerState.remotePlayers.size === 0) {
            htmlStr = `<div class="text-slate-400">🟢 <strong class="text-cyan-300">${multiplayerState.playerName}</strong> (You) — Waiting for others to join...</div>`;
          } else {
            multiplayerState.remotePlayers.forEach((rp) => {
              htmlStr += `<div class="flex items-center justify-between bg-slate-900/85 px-2 py-1 rounded border border-slate-700/80">
                <span class="truncate"><strong style="color:${rp.colorHex}">● ${rp.name}</strong> <span class="text-slate-400">(${rp.zone})</span></span>
                <button type="button" onclick="window.__teleportToMultiplayerPeer('${rp.id}')" class="ml-1.5 px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 font-bold text-[9px] border border-cyan-400/40 shrink-0">Go To</button>
              </div>`;
            });
          }
          if (htmlStr !== multiplayerState.lastPeerListHtml) {
            multiplayerState.lastPeerListHtml = htmlStr;
            listEl.innerHTML = htmlStr;
          }
        }

        // Multiplayer Buggy Race Button below Multiplayer Info Box (Real Players in Buggies Only!)
        const localInBuggy = !!(player.activeVehicle && player.activeVehicle.isBuggy);
        let buggyPeer = null;
        let incomingInvitePeer = null;

        multiplayerState.remotePlayers.forEach((rp) => {
          const peerInBuggy = !!(rp.activeVehicleId && String(rp.activeVehicleId).startsWith('buggy_'));
          if (peerInBuggy) {
            if (!buggyPeer) buggyPeer = rp;
            if (rp.raceInviteTo === MP_CLIENT_ID && rp.raceInviteId) {
              incomingInvitePeer = rp;
            }
          }
          // If WE sent an invite and the peer accepted it, launch the PvP race!
          if (
            mpBuggyRace.sentRaceId &&
            rp.raceAcceptedId === mpBuggyRace.sentRaceId &&
            mpBuggyRace.activeRaceId !== mpBuggyRace.sentRaceId
          ) {
            startMultiplayerBuggyRace(mpBuggyRace.sentRaceId, rp.id, rp.name, true, mpBuggyRace.sentLaps);
          }
          // If opponent finished our active PvP race before us
          if (
            kartRaceState.active &&
            kartRaceState.mode === 'pvp' &&
            kartRaceState.pvpRaceId &&
            rp.raceFinishedId === kartRaceState.pvpRaceId
          ) {
            kartRaceState.active = false;
            kartRaceState.mode = 'solo';
            mpBuggyRace.sentToId = null;
            mpBuggyRace.sentRaceId = null;
            mpBuggyRace.acceptedRaceId = null;
            mpBuggyRace.activeRaceId = null;
            awardCoinsAndXP(90, 100, `🥈 ${rp.name} won the Buggy Race! Great run!`);
          }
        });

        const raceCardEl = document.getElementById('mp-buggy-race-card');
        const raceStatusEl = document.getElementById('mp-buggy-race-status');
        const raceBtnEl = document.getElementById('btn-mp-buggy-race');
        const raceDeclineEl = document.getElementById('btn-mp-buggy-decline');

        if (raceCardEl && raceStatusEl && raceBtnEl) {
          if (localInBuggy && buggyPeer && kartRaceState.mode !== 'pvp') {
            raceCardEl.classList.remove('hidden');
            const lapsRowEl = document.getElementById('mp-buggy-laps-row');
            if (incomingInvitePeer) {
              const incLaps = incomingInvitePeer.raceInviteLaps || 2;
              raceStatusEl.textContent = `🏁 ${incomingInvitePeer.name} invited you (${incLaps} ${incLaps === 1 ? 'Lap' : 'Laps'})!`;
              raceBtnEl.textContent = `✅ Accept ${incLaps}-Lap Race`;
              raceBtnEl.dataset.action = 'accept';
              raceBtnEl.dataset.peerId = incomingInvitePeer.id;
              raceBtnEl.dataset.peerName = incomingInvitePeer.name;
              raceBtnEl.dataset.raceId = incomingInvitePeer.raceInviteId;
              raceBtnEl.dataset.raceLaps = String(incLaps);
              if (lapsRowEl) lapsRowEl.classList.add('hidden');
              if (raceDeclineEl) raceDeclineEl.classList.remove('hidden');
            } else if (mpBuggyRace.sentRaceId && mpBuggyRace.sentToId === buggyPeer.id) {
              raceStatusEl.textContent = `⏳ Waiting for ${buggyPeer.name} (${mpBuggyRace.sentLaps} Laps)...`;
              raceBtnEl.textContent = '❌ Cancel Race Invite';
              raceBtnEl.dataset.action = 'cancel';
              if (lapsRowEl) lapsRowEl.classList.add('hidden');
              if (raceDeclineEl) raceDeclineEl.classList.add('hidden');
            } else {
              raceStatusEl.textContent = `🏎️ ${buggyPeer.name} is also in a Buggy!`;
              raceBtnEl.textContent = `🏁 Invite ${buggyPeer.name} (${mpBuggyRace.selectedLaps}L)`;
              raceBtnEl.dataset.action = 'invite';
              raceBtnEl.dataset.peerId = buggyPeer.id;
              raceBtnEl.dataset.peerName = buggyPeer.name;
              if (lapsRowEl) lapsRowEl.classList.remove('hidden');
              if (raceDeclineEl) raceDeclineEl.classList.add('hidden');
            }
          } else {
            raceCardEl.classList.add('hidden');
          }
        }
      }

      const btnMpBuggyRace = document.getElementById('btn-mp-buggy-race');
      if (btnMpBuggyRace) {
        btnMpBuggyRace.addEventListener('click', () => {
          const action = btnMpBuggyRace.dataset.action;
          const peerId = btnMpBuggyRace.dataset.peerId;
          const peerName = btnMpBuggyRace.dataset.peerName || 'Rival';
          const raceId = btnMpBuggyRace.dataset.raceId;
          if (action === 'invite' && peerId) {
            mpBuggyRace.sentToId = peerId;
            mpBuggyRace.sentRaceId = `race_${Date.now().toString(36)}`;
            mpBuggyRace.sentLaps = mpBuggyRace.selectedLaps || 2;
            mpBuggyRace.acceptedRaceId = null;
            SoundFX.playJump();
            pushFeedMessage(`📨 Sent ${mpBuggyRace.sentLaps}-Lap Buggy Race invite to ${peerName}!`, 'border-l-amber-400 text-amber-200');
            broadcastLocalPlayerState();
          } else if (action === 'accept' && peerId && raceId) {
            const agreedLaps = parseInt(btnMpBuggyRace.dataset.raceLaps, 10) || 2;
            mpBuggyRace.acceptedRaceId = raceId;
            mpBuggyRace.sentToId = null;
            mpBuggyRace.sentRaceId = null;
            broadcastLocalPlayerState();
            startMultiplayerBuggyRace(raceId, peerId, peerName, false, agreedLaps);
          } else if (action === 'cancel') {
            mpBuggyRace.sentToId = null;
            mpBuggyRace.sentRaceId = null;
            broadcastLocalPlayerState();
            pushFeedMessage('🚫 Cancelled Buggy Race invitation.', 'border-l-slate-400 text-slate-300');
          }
        });
      }
      const btnMpBuggyDecline = document.getElementById('btn-mp-buggy-decline');
      if (btnMpBuggyDecline) {
        btnMpBuggyDecline.addEventListener('click', () => {
          mpBuggyRace.acceptedRaceId = null;
          pushFeedMessage('🚫 Declined Buggy Race invitation.', 'border-l-slate-400 text-slate-300');
        });
      }
      const btnStartAiRace = document.getElementById('btn-start-ai-race');
      if (btnStartAiRace) {
        btnStartAiRace.addEventListener('click', openAiRaceModal);
      }
      document.getElementById('btn-close-ai-race-modal').addEventListener('click', closeAiRaceModal);
      document.getElementById('btn-confirm-start-ai-race').addEventListener('click', () => {
        closeAiRaceModal();
        startAIRivalBuggyRace(aiRaceConfig.difficulty, aiRaceConfig.laps);
      });
      document.querySelectorAll('.ai-diff-btn').forEach((btn) => {
        btn.addEventListener('click', () => setAiRaceDifficulty(btn.dataset.diff));
      });
      document.querySelectorAll('.ai-lap-preset').forEach((btn) => {
        btn.addEventListener('click', () => setAiRaceLaps(btn.dataset.laps));
      });
      document.getElementById('btn-ai-laps-minus').addEventListener('click', () => setAiRaceLaps(aiRaceConfig.laps - 1));
      document.getElementById('btn-ai-laps-plus').addEventListener('click', () => setAiRaceLaps(aiRaceConfig.laps + 1));

      const mpLapsValEl = document.getElementById('mp-laps-val');
      const btnMpLapsMinus = document.getElementById('btn-mp-laps-minus');
      const btnMpLapsPlus = document.getElementById('btn-mp-laps-plus');
      if (btnMpLapsMinus && btnMpLapsPlus && mpLapsValEl) {
        btnMpLapsMinus.addEventListener('click', () => {
          mpBuggyRace.selectedLaps = Math.max(1, mpBuggyRace.selectedLaps - 1);
          mpLapsValEl.textContent = String(mpBuggyRace.selectedLaps);
        });
        btnMpLapsPlus.addEventListener('click', () => {
          mpBuggyRace.selectedLaps = Math.min(10, mpBuggyRace.selectedLaps + 1);
          mpLapsValEl.textContent = String(mpBuggyRace.selectedLaps);
        });
      }

      const settingsModal = document.getElementById('settings-modal');
      const sliderSensitivity = document.getElementById('slider-sensitivity');
      const sensitivityValueLabel = document.getElementById('sensitivity-value-label');
      const chkInvertY = document.getElementById('chk-invert-y');
      const chkRequireClick = document.getElementById('chk-require-click');

      function applySensitivityValue(val) {
        const clamped = Math.max(0.1, Math.min(3.0, parseFloat(val) || 1.0));
        cameraSettings.sensitivity = clamped;
        sliderSensitivity.value = clamped.toFixed(2);
        sensitivityValueLabel.textContent = `${clamped.toFixed(2)}x`;
      }

      document.getElementById('btn-settings-modal').addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        settingsModal.classList.add('flex');
      });

      function closeSettingsModal() {
        settingsModal.classList.add('hidden');
        settingsModal.classList.remove('flex');
        syncCursorAndPointerLock();
      }

      document.getElementById('btn-close-settings').addEventListener('click', closeSettingsModal);
      document.getElementById('btn-save-settings').addEventListener('click', closeSettingsModal);

      sliderSensitivity.addEventListener('input', (e) => applySensitivityValue(e.target.value));
      document.getElementById('btn-sens-low').addEventListener('click', () => applySensitivityValue(0.5));
      document.getElementById('btn-sens-med').addEventListener('click', () => applySensitivityValue(1.0));
      document.getElementById('btn-sens-high').addEventListener('click', () => applySensitivityValue(1.75));
      document.getElementById('btn-sens-ultra').addEventListener('click', () => applySensitivityValue(2.5));

      chkInvertY.addEventListener('change', (e) => {
        cameraSettings.invertY = e.target.checked;
      });
      chkRequireClick.addEventListener('change', (e) => {
        cameraSettings.requireClickHold = e.target.checked;
      });

      const profileModal = document.getElementById('profile-modal');
      document.getElementById('btn-profile-modal').addEventListener('click', () => {
        document.getElementById('profile-level-val').textContent = String(player.level);
        document.getElementById('profile-xp-val').textContent = String(player.xp);
        document.getElementById('profile-coins-val').textContent = String(player.coins);
        profileModal.classList.remove('hidden');
        profileModal.classList.add('flex');
      });

      function closeProfileModal() {
        profileModal.classList.add('hidden');
        profileModal.classList.remove('flex');
      }

      const SHOP_UPGRADE_CATALOG = [
        {
          key: 'xpBooster',
          icon: '⚡',
          name: 'XP Accelerator',
          desc: '+50% XP from all matches, races & games (faster leveling!)',
          costs: [150, 300, 500],
          bonusXp: 80
        },
        {
          key: 'rapidMarker',
          icon: '🎯',
          name: 'Rapid-Fire Paint Marker',
          desc: 'Faster Paintball Arena fire rate (up to 2.5x speed)',
          costs: [120, 250, 450],
          bonusXp: 50
        },
        {
          key: 'megaHopper',
          icon: '🟣',
          name: 'Mega Paint Hopper',
          desc: 'Expands paintball ammo capacity (30 → 45 → 60 → 80)',
          costs: [100, 220, 400],
          bonusXp: 50
        },
        {
          key: 'speedBoots',
          icon: '👟',
          name: 'Turbo Sprint Sneakers',
          desc: '+12% faster walking & sprinting across Blocky Metro',
          costs: [120, 240, 420],
          bonusXp: 50
        },
        {
          key: 'kartTurbo',
          icon: '🏎️',
          name: 'Kart & Buggy Nitro Tuner',
          desc: '+15% higher Go-Kart & Buggy top speed on Dirt Track',
          costs: [150, 280, 480],
          bonusXp: 60
        },
        {
          key: 'vipStyle',
          icon: '👑',
          name: 'VIP Prestige Style Pack',
          desc: 'Instant +180 XP Level Burst + Fresh 3D Designer Outfit!',
          costs: [180, 350, 600],
          bonusXp: 180
        }
      ];

      const upgradeShopModal = document.getElementById('upgrade-shop-modal');

      function renderUpgradeShopGrid() {
        const grid = document.getElementById('shop-upgrades-grid');
        if (!grid) return;
        document.getElementById('shop-coins-val').textContent = String(player.coins);
        document.getElementById('shop-level-val').textContent = `Lv. ${player.level}`;
        document.getElementById('shop-xpmult-val').textContent = `${getXpMultiplier().toFixed(1)}x`;

        grid.innerHTML = '';
        SHOP_UPGRADE_CATALOG.forEach((item) => {
          const curLvl = player.upgrades[item.key] || 0;
          const isMax = curLvl >= 3;
          const nextCost = isMax ? 0 : item.costs[curLvl];
          const canAfford = !isMax && player.coins >= nextCost;

          const card = document.createElement('div');
          card.className = 'p-3 rounded-2xl bg-slate-900/90 border border-slate-700/90 flex flex-col justify-between gap-2';
          card.innerHTML = `
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-black text-white">${item.icon} ${item.name}</span>
                <span class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-cyan-300 border border-slate-600">Lv ${curLvl}/3</span>
              </div>
              <p class="text-[11px] text-slate-300 leading-snug">${item.desc}</p>
            </div>
            <button type="button" data-upgrade-key="${item.key}" class="w-full py-1.5 px-3 rounded-xl text-xs font-black transition ${
              isMax
                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 cursor-default'
                : canAfford
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }">
              ${isMax ? '✅ MAXED OUT' : `🪙 Buy Lv.${curLvl + 1} (${nextCost} Coins)`}
            </button>
          `;
          const btn = card.querySelector('button');
          if (!isMax) {
            btn.addEventListener('click', () => buyShopUpgrade(item.key));
          }
          grid.appendChild(card);
        });
      }

      function buyShopUpgrade(key) {
        const item = SHOP_UPGRADE_CATALOG.find((u) => u.key === key);
        if (!item) return;
        const curLvl = player.upgrades[key] || 0;
        if (curLvl >= 3) return;
        const cost = item.costs[curLvl];
        if (player.coins < cost) {
          pushFeedMessage(`🪙 Need ${cost} Coins for ${item.name}! Earn coins in Paintball, Go-Kart Races, Bowling & Football!`, 'border-l-rose-400 text-rose-200');
          return;
        }
        player.coins -= cost;
        player.upgrades[key] = curLvl + 1;
        applyEconomyUpgradesToPlayer();
        if (key === 'megaHopper') {
          player.ammo = player.maxAmmo;
        }
        if (key === 'vipStyle') {
          cyclePlayer3DOutfit();
        }
        SoundFX.playFanfare();
        awardCoinsAndXP(0, item.bonusXp, `${item.icon} Upgraded ${item.name} to Lv.${curLvl + 1}!`);
        renderUpgradeShopGrid();
      }

      function openUpgradeShopModal(customTitle) {
        if (!upgradeShopModal) return;
        if (customTitle) {
          document.getElementById('shop-modal-title').textContent = customTitle;
        }
        renderUpgradeShopGrid();
        upgradeShopModal.classList.remove('hidden');
        upgradeShopModal.classList.add('flex');
        syncCursorAndPointerLock();
      }

      function closeUpgradeShopModal() {
        if (!upgradeShopModal) return;
        upgradeShopModal.classList.add('hidden');
        upgradeShopModal.classList.remove('flex');
        syncCursorAndPointerLock();
      }

      document.getElementById('btn-close-upgrade-shop').addEventListener('click', closeUpgradeShopModal);
      document.getElementById('btn-done-upgrade-shop').addEventListener('click', closeUpgradeShopModal);
      document.getElementById('btn-shop-cycle-outfit').addEventListener('click', () => {
        cyclePlayer3DOutfit();
      });
      document.getElementById('btn-close-profile').addEventListener('click', closeProfileModal);
      document.getElementById('btn-done-profile').addEventListener('click', closeProfileModal);

      document.getElementById('btn-save-cloud-progress').addEventListener('click', () => {
        const uname = (document.getElementById('input-profile-username').value || '').trim() || multiplayerState.playerName;
        setLocalPlayerNameTag(uname);
        const statusEl = document.getElementById('profile-save-status');
        statusEl.textContent = `✅ Saved profile & progress for "${uname}"!`;
        statusEl.className = 'text-[11px] font-bold text-emerald-400';
        SoundFX.playFanfare();
      });

      const helpModal = document.getElementById('help-modal');
      document.getElementById('btn-help-modal').addEventListener('click', () => {
        helpModal.classList.remove('hidden');
        helpModal.classList.add('flex');
      });
      document.getElementById('btn-close-help').addEventListener('click', () => {
        helpModal.classList.add('hidden');
        helpModal.classList.remove('flex');
      });
      document.getElementById('btn-got-it').addEventListener('click', () => {
        helpModal.classList.add('hidden');
        helpModal.classList.remove('flex');
      });

      // ==========================================
      // 14. COLLISION RESOLUTION & MINIMAP RENDERING
      // ==========================================
      function resolveXZCollisions(nextX, nextZ, radius, currentY = 0) {
        let rx = nextX;
        let rz = nextZ;

        for (let i = 0; i < colliders.length; i++) {
          const c = colliders[i];
          const minY = c.minY || 0;
          if (currentY + 2.4 <= minY || currentY >= c.maxY - 0.25) continue;

          const closestX = Math.max(c.minX, Math.min(rx, c.maxX));
          const closestZ = Math.max(c.minZ, Math.min(rz, c.maxZ));
          const dx = rx - closestX;
          const dz = rz - closestZ;
          const distSq = dx * dx + dz * dz;

          if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq) || 0.001;
            const overlap = radius - dist;
            rx += (dx / dist) * overlap;
            rz += (dz / dist) * overlap;
          }
        }
        return { x: rx, z: rz };
      }

      const minimapCanvas = document.getElementById('minimap-canvas');

      function drawMapCanvas(targetCanvas, isFull) {
        if (!targetCanvas) return;
        const ctx = targetCanvas.getContext('2d');
        const W = targetCanvas.width;
        const H = targetCanvas.height;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);

        const minWorldX = -170;
        const maxWorldX = 415;
        const minWorldZ = -170;
        const maxWorldZ = 170;

        function toMapX(wx) {
          return ((wx - minWorldX) / (maxWorldX - minWorldX)) * (W - 16) + 8;
        }
        function toMapY(wz) {
          return ((wz - minWorldZ) / (maxWorldZ - minWorldZ)) * (H - 16) + 8;
        }
        const scaleX = (W - 16) / (maxWorldX - minWorldX);
        const scaleZ = (H - 16) / (maxWorldZ - minWorldZ);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(toMapX(-155), toMapY(-155), 310 * scaleX, 310 * scaleZ);

        ctx.fillStyle = '#334155';
        ctx.fillRect(toMapX(-44), toMapY(-44), 88 * scaleX, 88 * scaleZ);

        ctx.fillStyle = '#475569';
        ctx.fillRect(toMapX(155), toMapY(-8), 110 * scaleX, 16 * scaleZ);

        // Outskirts Go-Kart & Buggy Dirt Track wrapping around the Paintball Arena
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = isFull ? 9 : 5;
        ctx.strokeRect(
          toMapX(241),
          toMapY(-75),
          (387 - 241) * scaleX,
          150 * scaleZ
        );

        const ax = toMapX(ARENA_CENTER.x - ARENA_HALF_W);
        const ay = toMapY(ARENA_CENTER.z - ARENA_HALF_D);
        const aw = ARENA_HALF_W * 2 * scaleX;
        const ah = ARENA_HALF_D * 2 * scaleZ;
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(ax, ay, aw, ah);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ax, ay, aw, ah);

        mapBuildings.forEach((b) => {
          ctx.fillStyle = b.color;
          ctx.fillRect(
            toMapX(b.x - b.w / 2),
            toMapY(b.z - b.d / 2),
            Math.max(3, b.w * scaleX),
            Math.max(3, b.d * scaleZ)
          );
        });

        const gx = toMapX(GATE_BUTTON_POS.x);
        const gy = toMapY(GATE_BUTTON_POS.z);
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(gx, gy, isFull ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        driveableVehicles.forEach((v) => {
          ctx.fillStyle = v.mapColor;
          ctx.fillRect(toMapX(v.x) - (isFull ? 3.5 : 2.2), toMapY(v.z) - (isFull ? 3.5 : 2.2), isFull ? 7 : 4.4, isFull ? 7 : 4.4);
        });

        ctx.fillStyle = '#a3e635';
        cityNPCs.forEach((npc) => {
          ctx.fillRect(toMapX(npc.x) - 1.5, toMapY(npc.z) - 1.5, 3, 3);
        });

        arenaBots.forEach((bot) => {
          ctx.fillStyle = bot.team === 'blue' ? '#38bdf8' : '#fb7185';
          ctx.beginPath();
          ctx.arc(toMapX(bot.x), toMapY(bot.z), isFull ? 3.5 : 2.2, 0, Math.PI * 2);
          ctx.fill();
        });

        if (typeof multiplayerState !== 'undefined' && multiplayerState.remotePlayers) {
          multiplayerState.remotePlayers.forEach((rp) => {
            const rpx = toMapX(rp.x);
            const rpy = toMapY(rp.z);
            ctx.fillStyle = rp.colorHex || '#10b981';
            ctx.beginPath();
            ctx.arc(rpx, rpy, isFull ? 5.5 : 3.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = isFull ? 'bold 11px Inter, sans-serif' : 'bold 8px Inter, sans-serif';
            ctx.fillText(rp.name, rpx + (isFull ? 7 : 4), rpy + 3);
          });
        }

        const px = toMapX(player.x);
        const py = toMapY(player.z);
        const lookDirX = -Math.sin(player.yaw);
        const lookDirZ = -Math.cos(player.yaw);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + lookDirX * (isFull ? 14 : 9), py + lookDirZ * (isFull ? 14 : 9));
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, isFull ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (isFull) {
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('Town Hall', toMapX(-18), toMapY(-16));
          ctx.fillStyle = '#f472b6';
          ctx.fillText('Shop Gate [Button]', toMapX(14), toMapY(22));
          ctx.fillStyle = '#22d3ee';
          ctx.fillText('Paintball Arena', toMapX(ARENA_CENTER.x - 34), toMapY(ARENA_CENTER.z - 32));
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('Go-Kart Dirt Track', toMapX(265), toMapY(-88));
        }
      }

      // ==========================================
      // 15. MAIN GAME UPDATE & ANIMATION LOOP (OPTIMIZED FOR 60 FPS)
      // ==========================================
      let lastFrameTime = performance.now();
      let minimapRedrawTimer = 0;

      // ==========================================
      // 14B. LIGHTWEIGHT COSMETIC AMBIENT PARTICLES (DUST MOTES -> NIGHT FIREFLIES)
      //      & BUGGY DIRT PUFF POOL (Zero Per-Frame Allocations)
      // ==========================================
      const AMBIENT_PARTICLE_COUNT = 220;
      const ambientParticleGeo = new THREE.BufferGeometry();
      const ambientParticlePositions = new Float32Array(AMBIENT_PARTICLE_COUNT * 3);
      const ambientParticleOffsets = new Float32Array(AMBIENT_PARTICLE_COUNT * 3);
      for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
        ambientParticleOffsets[i * 3] = (Math.random() - 0.5) * 90;
        ambientParticleOffsets[i * 3 + 1] = 0.8 + Math.random() * 24;
        ambientParticleOffsets[i * 3 + 2] = (Math.random() - 0.5) * 90;
      }
      ambientParticleGeo.setAttribute('position', new THREE.BufferAttribute(ambientParticlePositions, 3));
      const ambientParticleMat = new THREE.PointsMaterial({
        map: softGlowTexture,
        color: 0xfffbeb,
        size: 0.65,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ambientParticles = new THREE.Points(ambientParticleGeo, ambientParticleMat);
      ambientParticles.frustumCulled = false;
      scene.add(ambientParticles);

      // Pooled Buggy Dirt-Track Dust Puffs (18 reusable sprites — zero GC churn)
      const dirtDustPool = [];
      const dirtDustMat = new THREE.SpriteMaterial({
        map: softGlowTexture,
        color: 0xd99b66,
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      });
      for (let i = 0; i < 18; i++) {
        const sp = new THREE.Sprite(dirtDustMat.clone());
        sp.visible = false;
        scene.add(sp);
        dirtDustPool.push({ sprite: sp, age: 99, maxAge: 0.55, vx: 0, vy: 0, vz: 0 });
      }
      let dirtDustCursor = 0;
      let dirtDustSpawnTimer = 0;

      function spawnBuggyDirtPuff(wx, wz) {
        const p = dirtDustPool[dirtDustCursor];
        dirtDustCursor = (dirtDustCursor + 1) % dirtDustPool.length;
        p.age = 0;
        p.sprite.visible = true;
        p.sprite.position.set(wx + (Math.random() - 0.5) * 1.4, 0.55, wz + (Math.random() - 0.5) * 1.4);
        p.sprite.scale.set(1.2, 1.2, 1);
        p.sprite.material.opacity = 0.55;
        p.vx = (Math.random() - 0.5) * 1.8;
        p.vy = 1.6 + Math.random() * 1.2;
        p.vz = (Math.random() - 0.5) * 1.8;
      }

      // ==========================================
      // 14C. PHASE 4 POOLED COSMETIC MICRO-VFX (Zero GC Churn, Strictly Non-Collidable)
      //      Surface-Aware Puffs, Impact Sparks & Rainwater Puddle Ripples
      // ==========================================
      const microPuffPool = [];
      for (let i = 0; i < 28; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({
          map: softGlowTexture,
          color: 0xd6d3d1,
          transparent: true,
          opacity: 0,
          depthWrite: false
        }));
        sp.visible = false;
        scene.add(sp);
        microPuffPool.push({ sprite: sp, age: 99, maxAge: 0.45, vx: 0, vy: 0, vz: 0, baseScale: 0.7, maxOpacity: 0.45 });
      }
      let microPuffCursor = 0;

      const impactSparkPool = [];
      for (let i = 0; i < 24; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({
          map: softGlowTexture,
          color: 0xfef08a,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        }));
        sp.visible = false;
        scene.add(sp);
        impactSparkPool.push({ sprite: sp, age: 99, maxAge: 0.28, vx: 0, vy: 0, vz: 0 });
      }
      let impactSparkCursor = 0;

      const surfaceRipplePool = [];
      const surfaceRippleGeo = new THREE.RingGeometry(0.18, 0.30, 18);
      for (let i = 0; i < 14; i++) {
        const m = new THREE.Mesh(surfaceRippleGeo, new THREE.MeshBasicMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthWrite: false
        }));
        m.rotation.x = -Math.PI / 2;
        m.visible = false;
        scene.add(m);
        surfaceRipplePool.push({ mesh: m, age: 99, maxAge: 0.55 });
      }
      let surfaceRippleCursor = 0;

      function getSurfaceTintAt(x, z) {
        if (x >= 226 && x <= 404 && Math.abs(z) <= 88) return 0xd99b66; // Outskirts dirt track ochre
        if ((x >= 165 && x <= 226 && z >= 38 && z <= 122) || (Math.abs(x) < 160 && Math.abs(z) > 135)) return 0x86efac; // Stadium/park grass
        return 0xcbd5e1; // Urban asphalt/concrete dust
      }

      function isInRainPuddle(x, z) {
        const puddles = window.__worldPuddles;
        if (!puddles) return false;
        for (let i = 0; i < puddles.length; i++) {
          const [px, pz, sx, sz] = puddles[i];
          const nx = (x - px) / sx;
          const nz = (z - pz) / sz;
          if (nx * nx + nz * nz <= 1.0) return true;
        }
        return false;
      }

      function spawnMicroPuff(x, y, z, colorHex = 0xcbd5e1, baseScale = 0.75, upSpeed = 1.2, maxOpacity = 0.42) {
        const p = microPuffPool[microPuffCursor];
        microPuffCursor = (microPuffCursor + 1) % microPuffPool.length;
        p.age = 0;
        p.maxAge = 0.38 + Math.random() * 0.16;
        p.baseScale = baseScale;
        p.maxOpacity = maxOpacity;
        p.sprite.material.color.setHex(colorHex);
        p.sprite.material.opacity = maxOpacity;
        p.sprite.position.set(x + (Math.random() - 0.5) * 0.4, y, z + (Math.random() - 0.5) * 0.4);
        p.sprite.scale.set(baseScale, baseScale, 1);
        p.sprite.visible = true;
        p.vx = (Math.random() - 0.5) * 1.4;
        p.vy = upSpeed + Math.random() * 0.7;
        p.vz = (Math.random() - 0.5) * 1.4;
      }

      function spawnImpactSparks(x, y, z, colorHex = 0xfef08a, count = 5) {
        for (let i = 0; i < count; i++) {
          const s = impactSparkPool[impactSparkCursor];
          impactSparkCursor = (impactSparkCursor + 1) % impactSparkPool.length;
          s.age = 0;
          s.maxAge = 0.22 + Math.random() * 0.14;
          s.sprite.material.color.setHex(colorHex);
          s.sprite.material.opacity = 0.92;
          s.sprite.position.set(x, y, z);
          s.sprite.scale.set(0.45, 0.45, 1);
          s.sprite.visible = true;
          const ang = Math.random() * Math.PI * 2;
          const spd = 2.5 + Math.random() * 5.2;
          s.vx = Math.cos(ang) * spd;
          s.vy = 2.2 + Math.random() * 3.8;
          s.vz = Math.sin(ang) * spd;
        }
      }

      function spawnSurfaceRipple(x, y, z) {
        const r = surfaceRipplePool[surfaceRippleCursor];
        surfaceRippleCursor = (surfaceRippleCursor + 1) % surfaceRipplePool.length;
        r.age = 0;
        r.mesh.position.set(x, y, z);
        r.mesh.scale.set(0.6, 0.6, 1);
        r.mesh.material.opacity = 0.55;
        r.mesh.visible = true;
      }

      function updatePhase4VFX(dt) {
        for (let i = 0; i < microPuffPool.length; i++) {
          const p = microPuffPool[i];
          if (p.age < p.maxAge) {
            p.age += dt;
            const prog = p.age / p.maxAge;
            p.sprite.position.x += p.vx * dt;
            p.sprite.position.y += p.vy * dt;
            p.sprite.position.z += p.vz * dt;
            const sc = p.baseScale + prog * p.baseScale * 1.7;
            p.sprite.scale.set(sc, sc, 1);
            p.sprite.material.opacity = p.maxOpacity * (1 - prog);
            if (p.age >= p.maxAge) p.sprite.visible = false;
          }
        }
        for (let i = 0; i < impactSparkPool.length; i++) {
          const s = impactSparkPool[i];
          if (s.age < s.maxAge) {
            s.age += dt;
            const prog = s.age / s.maxAge;
            s.vy -= 14.0 * dt;
            s.sprite.position.x += s.vx * dt;
            s.sprite.position.y += s.vy * dt;
            s.sprite.position.z += s.vz * dt;
            const sc = 0.45 * (1 - prog * 0.65);
            s.sprite.scale.set(sc, sc, 1);
            s.sprite.material.opacity = 0.92 * (1 - prog);
            if (s.age >= s.maxAge) s.sprite.visible = false;
          }
        }
        for (let i = 0; i < surfaceRipplePool.length; i++) {
          const r = surfaceRipplePool[i];
          if (r.age < r.maxAge) {
            r.age += dt;
            const prog = r.age / r.maxAge;
            const sc = 0.6 + prog * 3.2;
            r.mesh.scale.set(sc, sc, 1);
            r.mesh.material.opacity = 0.55 * (1 - prog);
            if (r.age >= r.maxAge) r.mesh.visible = false;
          }
        }
      }

      let playerFootstepFxTimer = 0;
      let vehicleSkidFxTimer = 0;

      const daySkyColor = new THREE.Color(0x7dd3fc);
      const nightSkyColor = new THREE.Color(0x060d1f);
      const curSkyColor = new THREE.Color(0x7dd3fc);
      const daySunColor = new THREE.Color(0xfffbeb);
      const nightMoonColor = new THREE.Color(0x60a5fa);
      const curSunColor = new THREE.Color(0xfffbeb);

      function updateDayNightAndLights(dt) {
        dayNightState.phaseRemainingSec -= dt;
        if (dayNightState.phaseRemainingSec <= 0) {
          dayNightState.isNight = !dayNightState.isNight;
          dayNightState.phaseRemainingSec = dayNightState.isNight ? NIGHT_DURATION_SEC : DAY_DURATION_SEC;
          dayNightState.lastHudSecond = -1;
        }

        const curWholeSec = Math.ceil(dayNightState.phaseRemainingSec);
        if (curWholeSec !== dayNightState.lastHudSecond) {
          dayNightState.lastHudSecond = curWholeSec;
          syncDayNightButtonUI();
        }

        const targetBlend = dayNightState.isNight ? 1.0 : 0.0;
        dayNightState.blend += (targetBlend - dayNightState.blend) * Math.min(1.0, dt * 3.2);
        const b = dayNightState.blend;

        curSkyColor.copy(daySkyColor).lerp(nightSkyColor, b);
        scene.background.copy(curSkyColor);
        scene.fog.color.copy(curSkyColor);
        scene.fog.density = 0.00072 * (1 - b) + 0.00112 * b;

        // Update Procedural Sky Dome colors & keep centered on player
        skyDome.position.set(player.x, 0, player.z);
        skyUniforms.uTopColor.value.setHex(0x1d6fd8).lerp(new THREE.Color(0x020617), b);
        skyUniforms.uHorizonColor.value.setHex(0xcbe8fb).lerp(new THREE.Color(0x0f172a), b);
        skyUniforms.uBottomColor.value.setHex(0x475569).lerp(new THREE.Color(0x020617), b);
        skyUniforms.uNightBlend.value = b;

        // Player-tracking directional sunlight shadow frustum (texel-snapped to eliminate shadow shimmer)
        const snapX = Math.round(player.x / 2) * 2;
        const snapZ = Math.round(player.z / 2) * 2;
        sunLight.target.position.set(snapX, 0, snapZ);
        sunLight.position.set(snapX + 85, 145, snapZ + 75);
        sunLight.target.updateMatrixWorld();

        curSunColor.copy(daySunColor).lerp(nightMoonColor, b);
        sunLight.color.copy(curSunColor);
        sunLight.intensity = 1.25 * (1 - b) + 0.26 * b;
        hemiLight.intensity = 0.65 * (1 - b) + 0.22 * b;
        renderer.toneMappingExposure = 1.08 * (1 - b) + 0.98 * b;
        if (typeof vehicleHeadlightBeam !== 'undefined') {
          if (player.activeVehicle && b > 0.15) {
            const av = player.activeVehicle;
            const fx = -Math.sin(av.yaw);
            const fz = -Math.cos(av.yaw);
            vehicleHeadlightBeam.intensity = 2.4 * b;
            vehicleHeadlightBeam.position.set(av.x + fx * 2.2, 1.15, av.z + fz * 2.2);
            vehicleHeadlightBeam.target.position.set(av.x + fx * 26.0, 0.2, av.z + fz * 26.0);
            vehicleHeadlightBeam.target.updateMatrixWorld();
          } else {
            vehicleHeadlightBeam.intensity = 0;
          }
        }

        nightSkyGroup.visible = b > 0.12;

        if (b > 0.35) {
          streetLightBulbMat.color.setHex(0xfef08a);
          streetLightGroundHaloMat.opacity = 0.32 * b;
          streetLightGlowSpriteMat.opacity = 0.78 * b;
        } else {
          streetLightBulbMat.color.setHex(0xdbeafe);
          streetLightGroundHaloMat.opacity = 0.0;
          streetLightGlowSpriteMat.opacity = 0.0;
        }

        // Smoothly ramp nighttime warm window emissive glow & vehicle headlight halos
        const winEmis = b * 0.78;
        for (const k in exteriorFacadeMatCache) {
          exteriorFacadeMatCache[k].emissiveIntensity = winEmis;
        }
        vehicleHeadlightGlowMat.opacity = 0.25 + 0.65 * b;
        vehicleTaillightGlowMat.opacity = 0.30 + 0.55 * b;
        ambientParticleMat.color.setHex(0xfffbeb).lerp(new THREE.Color(0xfef08a), b);
        ambientParticleMat.opacity = 0.32 * (1 - b) + 0.65 * b;
        ambientParticleMat.size = 0.55 * (1 - b) + 0.85 * b;

        let playerInsideBuilding = false;
        let activeCeilingY = player.y + 4.8;
        let buildingCenterX = player.x;
        let buildingCenterZ = player.z;

        for (let i = 0; i < multiFloorBuildings.length; i++) {
          const mb = multiFloorBuildings[i];
          if (
            Math.abs(player.x - mb.x) <= mb.w / 2 + 0.5 &&
            Math.abs(player.z - mb.z) <= mb.d / 2 + 0.5 &&
            player.y < (mb.numLevels - 1) * mb.floorHeight - 0.5
          ) {
            playerInsideBuilding = true;
            const flIdx = Math.max(0, Math.floor((player.y + 0.5) / mb.floorHeight));
            activeCeilingY = flIdx * mb.floorHeight + mb.floorHeight - 0.5;
            buildingCenterX = mb.x;
            buildingCenterZ = mb.z;
            break;
          }
        }

        if (
          !playerInsideBuilding &&
          Math.abs(player.x - VIOLET_TOWER.x) <= VIOLET_TOWER.w / 2 + 0.5 &&
          Math.abs(player.z - VIOLET_TOWER.z) <= VIOLET_TOWER.d / 2 + 0.5 &&
          player.y < VIOLET_TOWER.numFloors * VIOLET_TOWER.floorHeight - 0.5
        ) {
          playerInsideBuilding = true;
          const vFl = Math.max(0, Math.floor((player.y + 0.5) / VIOLET_TOWER.floorHeight));
          activeCeilingY = vFl * VIOLET_TOWER.floorHeight + VIOLET_TOWER.floorHeight - 0.5;
          buildingCenterX = VIOLET_TOWER.x;
          buildingCenterZ = VIOLET_TOWER.z;
        }

        indoorPointLightA.position.set(player.x, activeCeilingY, player.z);
        indoorPointLightA.intensity = playerInsideBuilding ? 1.45 : (0.65 * b + 0.35);
        indoorPointLightB.position.set(buildingCenterX, activeCeilingY, buildingCenterZ);
        indoorPointLightB.intensity = playerInsideBuilding ? 1.15 : 0.45;

        const baseNightAmbient = playerInsideBuilding ? 0.42 : 0.16;
        const baseDayAmbient = playerInsideBuilding ? 0.46 : 0.28;
        ambientLight.intensity = baseDayAmbient * (1 - b) + baseNightAmbient * b;

        if (b > 0.15 && streetLightPositions.length > 0) {
          let bestDistSq = Infinity;
          let bestSL = streetLightPositions[0];
          for (let i = 0; i < streetLightPositions.length; i++) {
            const sl = streetLightPositions[i];
            const dx = sl.x - player.x;
            const dz = sl.z - player.z;
            const dsq = dx * dx + dz * dz;
            if (dsq < bestDistSq) {
              bestDistSq = dsq;
              bestSL = sl;
            }
          }
          activeStreetPointLight.position.set(bestSL.x, 7.1, bestSL.z);
          activeStreetPointLight.intensity = 1.35 * b;
        } else {
          activeStreetPointLight.intensity = 0.0;
        }
      }

      function updateGame(dt) {
        const timeSec = performance.now() * 0.001;
        updateDayNightAndLights(dt);

        beaconRing.rotation.z = timeSec * 1.5;

        // Cosmetic Ambient Wind-Swaying Foliage + Proximity Entity Gust Reactivity
        const gustSrcX = player.inHelicopter ? helicopter.x : (player.activeVehicle ? player.activeVehicle.x : player.x);
        const gustSrcZ = player.inHelicopter ? helicopter.z : (player.activeVehicle ? player.activeVehicle.z : player.z);
        const gustStrength = player.inHelicopter
          ? (Math.hypot(helicopter.vx, helicopter.vz) + 14) * 0.008
          : (player.activeVehicle ? Math.abs(player.activeVehicle.speed) * 0.007 : 0.04);
        const gustRadius = player.inHelicopter ? 18.0 : 9.5;
        const gustDecay = Math.exp(-4.5 * dt);
        for (let i = 0; i < swayingTreeCanopies.length; i++) {
          const tc = swayingTreeCanopies[i];
          if (tc.x !== undefined) {
            const dxT = tc.x - gustSrcX;
            const dzT = tc.z - gustSrcZ;
            const dSq = dxT * dxT + dzT * dzT;
            if (dSq < gustRadius * gustRadius && dSq > 0.01 && gustStrength > 0.01) {
              const dT = Math.sqrt(dSq);
              const push = (1 - dT / gustRadius) * gustStrength;
              tc.gustZ = Math.max(-0.22, Math.min(0.22, tc.gustZ - (dxT / dT) * push));
              tc.gustX = Math.max(-0.22, Math.min(0.22, tc.gustX + (dzT / dT) * push));
            }
            tc.gustX *= gustDecay;
            tc.gustZ *= gustDecay;
          }
          tc.mesh.rotation.z = Math.sin(timeSec * 1.45 + tc.phase) * 0.045 + (tc.gustZ || 0);
          tc.mesh.rotation.x = Math.cos(timeSec * 1.15 + tc.phase) * 0.035 + (tc.gustX || 0);
        }
        updatePhase4VFX(dt);

        // Cosmetic Boost Pad Subtle Pulse
        const bpPulse = 1.0 + Math.sin(timeSec * 6.0) * 0.06;
        for (let i = 0; i < boostPadMeshes.length; i++) {
          boostPadMeshes[i].scale.set(bpPulse, 1, bpPulse);
        }

        // Cosmetic Ambient Dust Motes / Night Fireflies wrapped around Player
        const apPos = ambientParticleGeo.attributes.position.array;
        for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
          const ox = ambientParticleOffsets[i * 3];
          const oy = ambientParticleOffsets[i * 3 + 1];
          const oz = ambientParticleOffsets[i * 3 + 2];
          apPos[i * 3] = player.x + ox + Math.sin(timeSec * 0.55 + i) * 1.4;
          apPos[i * 3 + 1] = oy + Math.sin(timeSec * 0.9 + i * 0.7) * 0.8;
          apPos[i * 3 + 2] = player.z + oz + Math.cos(timeSec * 0.48 + i) * 1.4;
        }
        ambientParticleGeo.attributes.position.needsUpdate = true;

        // Cosmetic Buggy Dirt Dust Trail on Outskirts Dirt Track
        if (player.activeVehicle && player.activeVehicle.isBuggy && Math.abs(player.activeVehicle.speed) > 8 && player.activeVehicle.x > 224) {
          dirtDustSpawnTimer -= dt;
          if (dirtDustSpawnTimer <= 0) {
            dirtDustSpawnTimer = 0.065;
            const bVeh = player.activeVehicle;
            spawnBuggyDirtPuff(bVeh.x + Math.sin(bVeh.yaw) * 2.1, bVeh.z + Math.cos(bVeh.yaw) * 2.1);
          }
        }
        for (let i = 0; i < dirtDustPool.length; i++) {
          const dp = dirtDustPool[i];
          if (dp.age < dp.maxAge) {
            dp.age += dt;
            const prog = dp.age / dp.maxAge;
            dp.sprite.position.x += dp.vx * dt;
            dp.sprite.position.y += dp.vy * dt;
            dp.sprite.position.z += dp.vz * dt;
            const sc = 1.2 + prog * 2.4;
            dp.sprite.scale.set(sc, sc, 1);
            dp.sprite.material.opacity = 0.52 * (1 - prog);
            if (dp.age >= dp.maxAge) dp.sprite.visible = false;
          }
        }
        for (let i = 0; i < fountainJetDrops.length; i++) {
          const fd = fountainJetDrops[i];
          const t = (timeSec * 1.35 + fd.phase) % 1.0;
          const r = 0.2 + t * 2.35;
          const y = 2.85 + Math.sin(t * Math.PI) * 1.05 - t * t * 2.1;
          fd.mesh.position.set(Math.cos(fd.angle) * r, y, Math.sin(fd.angle) * r);
        }
        if (window.__metroRoyalPoolWater) {
          window.__metroRoyalPoolWater.position.y = 0.90 + Math.sin(timeSec * 2.6) * 0.03;
        }
        if (window.__indoorOlympicPoolWater) {
          window.__indoorOlympicPoolWater.position.y = 0.78 + Math.sin(timeSec * 2.4) * 0.035;
        }
        if (window.__bowling3DBall && window.__bowling3DBall.active) {
          const b3 = window.__bowling3DBall;
          b3.z += b3.vz * dt;
          b3.mesh.position.z = b3.z;
          b3.mesh.rotation.x -= dt * 14.0;
          if (b3.z <= -6.2 && window.__bowling3DPins) {
            window.__bowling3DPins.forEach((p, idx) => {
              p.mesh.rotation.x = 1.35;
              p.mesh.rotation.z = (idx % 2 === 0 ? 1 : -1) * 0.8;
              p.mesh.position.y = 0.35;
            });
          }
          if (b3.z <= -8.0) {
            b3.vz = 0;
            b3.resetTimer -= dt;
            if (b3.resetTimer <= 0) {
              b3.active = false;
              b3.z = 8.2;
              b3.mesh.position.z = 8.2;
              if (window.__bowling3DPins) {
                window.__bowling3DPins.forEach((p) => {
                  p.mesh.position.set(p.homeX, p.homeY, p.homeZ);
                  p.mesh.rotation.set(0, 0, 0);
                });
              }
            }
          }
        }
        beaconRing.position.y = 11.5 + Math.sin(timeSec * 3) * 0.8;
        gateButtonMesh.position.y = 1.62 + Math.sin(timeSec * 5) * 0.06;
        if (typeof aiRaceButtonMesh !== 'undefined') {
          aiRaceButtonMesh.position.y = 1.56 + Math.sin(timeSec * 5.2) * 0.06;
        }

        // Physical Trackside AI Race Button Prompt visibility
        const elAiRacePrompt = document.getElementById('ai-race-prompt');
        if (elAiRacePrompt) {
          const distAiBtn = Math.hypot(player.x - AI_RACE_BTN_POS.x, player.z - AI_RACE_BTN_POS.z);
          if (!player.inArena && !player.inHelicopter && distAiBtn < 6.5 && player.y < 3.0 && kartRaceState.mode !== 'ai') {
            elAiRacePrompt.classList.remove('hidden');
          } else {
            elAiRacePrompt.classList.add('hidden');
          }
        }

        // Race Countdown & Autonomous AI Rival Buggy Update
        if (kartRaceState.countdown > 0) {
          kartRaceState.countdown = Math.max(0, kartRaceState.countdown - dt);
        }
        if (!aiRivalBuggy.active || aiRivalBuggy.finished || kartRaceState.countdown > 0) {
          SoundFX.updateAIEngine(false, 0, 0, 0);
        }
        if (aiRivalBuggy.active && !aiRivalBuggy.finished && kartRaceState.countdown <= 0) {
          const wp = AI_TRACK_WAYPOINTS[aiRivalBuggy.wpIdx];
          const dx = wp.x - aiRivalBuggy.x;
          const dz = wp.z - aiRivalBuggy.z;
          const dist = Math.hypot(dx, dz);
          const targetYaw = Math.atan2(-dx, -dz);
          let yDiff = targetYaw - aiRivalBuggy.yaw;
          while (yDiff > Math.PI) yDiff -= Math.PI * 2;
          while (yDiff < -Math.PI) yDiff += Math.PI * 2;
          aiRivalBuggy.yaw += yDiff * Math.min(1, dt * 6.5);

          const aiPrevSpd = aiRivalBuggy.speed;
          aiRivalBuggy.speed = Math.min(aiRivalBuggy.maxSpeed, aiRivalBuggy.speed + (aiRivalBuggy.accel || 26.0) * dt);
          aiRivalBuggy.x += -Math.sin(aiRivalBuggy.yaw) * aiRivalBuggy.speed * dt;
          aiRivalBuggy.z += -Math.cos(aiRivalBuggy.yaw) * aiRivalBuggy.speed * dt;
          aiRivalBuggy.model.root.position.set(aiRivalBuggy.x, 0, aiRivalBuggy.z);
          aiRivalBuggy.model.root.rotation.y = aiRivalBuggy.yaw;
          const aiSteerVis = Math.max(-1, Math.min(1, yDiff * 2.4));
          updateVehicleCosmeticMotion(aiRivalBuggy.model, aiRivalBuggy.speed, aiPrevSpd, aiSteerVis, dt, timeSec, 0);
          SoundFX.updateAIEngine(true, aiRivalBuggy.x, aiRivalBuggy.z, aiRivalBuggy.speed);
          if (aiRivalBuggy.speed > 10 && Math.random() < dt * 8.0) {
            spawnBuggyDirtPuff(aiRivalBuggy.x + Math.sin(aiRivalBuggy.yaw) * 2.1, aiRivalBuggy.z + Math.cos(aiRivalBuggy.yaw) * 2.1);
          }

          if (dist < 10.0) {
            aiRivalBuggy.wpIdx++;
            if (aiRivalBuggy.wpIdx >= AI_TRACK_WAYPOINTS.length) {
              aiRivalBuggy.wpIdx = 0;
              aiRivalBuggy.lap++;
              if (aiRivalBuggy.lap > kartRaceState.totalLaps) {
                aiRivalBuggy.finished = true;
                aiRivalBuggy.active = false;
                if (kartRaceState.mode === 'ai') {
                  kartRaceState.mode = 'solo';
                  awardCoinsAndXP(80, 100, '🥈 AI Rival finished first! Good race!');
                }
              }
            }
          }
        }

        const turnSpeed = 2.1;
        if (keys['KeyQ'] || virtualPad.turnLeft) {
          player.yaw += turnSpeed * dt;
        }
        if (keys['KeyE'] && player.inArena) {
          player.yaw -= turnSpeed * dt;
        }
        if (virtualPad.turnRight) {
          player.yaw -= turnSpeed * dt;
        }

        // Helicopter Flight Physics & Rotor Animation
        if (player.inHelicopter) {
          helicopter.rotorAngle += dt * 28.0;
          helicopter.model.mainRotor.rotation.y = helicopter.rotorAngle;
          helicopter.model.tailRotor.rotation.x = helicopter.rotorAngle * 1.4;

          helicopter.rotorAudioTimer -= dt;
          if (helicopter.rotorAudioTimer <= 0) {
            helicopter.rotorAudioTimer = 0.11;
            SoundFX.playRotorPulse();
          }

          let flyFwd = 0;
          let flyRight = 0;
          if (keys['KeyW'] || keys['ArrowUp'] || virtualPad.up) flyFwd += 1;
          if (keys['KeyS'] || keys['ArrowDown'] || virtualPad.down) flyFwd -= 1;
          if (keys['KeyD'] || keys['ArrowRight'] || virtualPad.right) flyRight += 1;
          if (keys['KeyA'] || keys['ArrowLeft'] || virtualPad.left) flyRight -= 1;

          let flyUp = 0;
          if (keys['Space'] || helicopter.ascendHeld) flyUp += 1;
          if (keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyC'] || helicopter.descendHeld) flyUp -= 1;

          helicopter.yaw = player.yaw;
          const fwdX = -Math.sin(helicopter.yaw);
          const fwdZ = -Math.cos(helicopter.yaw);
          const rgtX = Math.cos(helicopter.yaw);
          const rgtZ = -Math.sin(helicopter.yaw);

          const flySpeed = 36.0;
          const climbSpeed = 19.0;
          const targetVX = (fwdX * flyFwd + rgtX * flyRight) * flySpeed;
          const targetVZ = (fwdZ * flyFwd + rgtZ * flyRight) * flySpeed;
          const targetVY = flyUp * climbSpeed;

          helicopter.vx += (targetVX - helicopter.vx) * Math.min(1, dt * 5.0);
          helicopter.vz += (targetVZ - helicopter.vz) * Math.min(1, dt * 5.0);
          helicopter.vy += (targetVY - helicopter.vy) * Math.min(1, dt * 6.0);

          const oldHeliX = helicopter.x;
          const oldHeliY = helicopter.y;
          const oldHeliZ = helicopter.z;

          let nextHeliX = Math.max(-160, Math.min(406, oldHeliX + helicopter.vx * dt));
          let nextHeliZ = Math.max(-160, Math.min(160, oldHeliZ + helicopter.vz * dt));
          let nextHeliY = Math.max(0.2, Math.min(135, oldHeliY + helicopter.vy * dt));

          const heliRadius = 2.9;
          for (let i = 0; i < multiFloorBuildings.length; i++) {
            const b = multiFloorBuildings[i];
            const bTopY = (b.numLevels - 1) * b.floorHeight + 0.45;
            const halfW = b.w / 2 + heliRadius;
            const halfD = b.d / 2 + heliRadius;

            if (Math.abs(nextHeliX - b.x) < halfW && Math.abs(nextHeliZ - b.z) < halfD) {
              if (oldHeliY >= bTopY - 0.85) {
                if (nextHeliY < bTopY) {
                  nextHeliY = bTopY;
                  if (helicopter.vy < 0) helicopter.vy = 0;
                }
              } else if (nextHeliY < bTopY) {
                const wasInsideX = Math.abs(oldHeliX - b.x) < halfW;
                const wasInsideZ = Math.abs(oldHeliZ - b.z) < halfD;
                if (!wasInsideX && wasInsideZ) {
                  nextHeliX = oldHeliX < b.x ? b.x - halfW : b.x + halfW;
                  helicopter.vx = 0;
                } else if (wasInsideX && !wasInsideZ) {
                  nextHeliZ = oldHeliZ < b.z ? b.z - halfD : b.z + halfD;
                  helicopter.vz = 0;
                } else {
                  const penX = halfW - Math.abs(nextHeliX - b.x);
                  const penZ = halfD - Math.abs(nextHeliZ - b.z);
                  if (penX < penZ) {
                    nextHeliX = nextHeliX < b.x ? b.x - halfW : b.x + halfW;
                    helicopter.vx = 0;
                  } else {
                    nextHeliZ = nextHeliZ < b.z ? b.z - halfD : b.z + halfD;
                    helicopter.vz = 0;
                  }
                }
              }
            }
          }

          helicopter.x = nextHeliX;
          helicopter.y = nextHeliY;
          helicopter.z = nextHeliZ;

          helicopter.model.root.position.set(helicopter.x, helicopter.y, helicopter.z);
          helicopter.model.root.rotation.y = helicopter.yaw;
          const heliTiltDamp = 1.0 - Math.exp(-7.5 * dt);
          helicopter.model.tiltGroup.rotation.x += (-flyFwd * 0.16 - helicopter.model.tiltGroup.rotation.x) * heliTiltDamp;
          helicopter.model.tiltGroup.rotation.z += (-flyRight * 0.16 - helicopter.model.tiltGroup.rotation.z) * heliTiltDamp;
          helicopter.model.tiltGroup.position.y = helicopter.y > 2.5 ? Math.sin(timeSec * 3.1) * 0.12 : 0;

          player.x = helicopter.x;
          player.y = helicopter.y + 0.5;
          player.z = helicopter.z;

          const elAlt = document.getElementById('heli-altitude-label');
          if (elAlt) {
            elAlt.textContent = `Altitude: ${Math.round(helicopter.y)}m • WASD Fly • Space Up • Shift Down`;
          }
        } else {
          helicopter.model.mainRotor.rotation.y += dt * 1.2;
          helicopter.model.tailRotor.rotation.x += dt * 1.2;
        }

        const elHeliPrompt = document.getElementById('heli-prompt');
        const elHeliSub = document.getElementById('heli-prompt-subtitle');
        const elBtnBoardHeli = document.getElementById('btn-board-heli');
        if (!player.inArena && !player.inHelicopter) {
          const nearChopper = isPlayerNearHelicopter();
          const onTopPadBldg = isPlayerOnAnyTopHelipad();
          if (nearChopper) {
            elHeliPrompt.classList.remove('hidden');
            elHeliSub.textContent = 'Sky-Hawk Chopper Ready for Takeoff!';
            elBtnBoardHeli.textContent = '🚁 PILOT HELICOPTER [E]';
          } else if (onTopPadBldg) {
            elHeliPrompt.classList.remove('hidden');
            elHeliSub.textContent = `${onTopPadBldg.title} Top Helipad`;
            elBtnBoardHeli.textContent = '🚁 SUMMON & PILOT HELICOPTER [E]';
          } else {
            elHeliPrompt.classList.add('hidden');
          }
        } else {
          elHeliPrompt.classList.add('hidden');
        }

        // Ground Vehicle Driving Physics, Constant Unbroken Emergency Siren Oscillator & Lightbar Flash
        let anySirenActive = null;
        driveableVehicles.forEach((v) => {
          if (v.hasSiren && v.sirenOn) {
            anySirenActive = v;
            if (v.model.sirenLeft && v.model.sirenRight) {
              const flash = Math.floor(timeSec * 8) % 2 === 0;
              v.model.sirenLeft.scale.setScalar(flash ? 1.35 : 0.85);
              v.model.sirenRight.scale.setScalar(flash ? 0.85 : 1.35);
            }
          }
        });
        if (anySirenActive) {
          SoundFX.updateContinuousSiren(timeSec, anySirenActive.type, anySirenActive.x, 1.8, anySirenActive.z);
        } else if (SoundFX.activeSirenOsc) {
          SoundFX.stopContinuousSiren();
        }

        const elVehiclePrompt = document.getElementById('vehicle-prompt');
        const elVehicleBadge = document.getElementById('vehicle-prompt-badge');
        const elVehicleTitle = document.getElementById('vehicle-prompt-title');
        const elVehicleSpeed = document.getElementById('vehicle-speed-label');

        if (player.activeVehicle) {
          const veh = player.activeVehicle;
          elVehiclePrompt.classList.add('hidden');

          let throttle = 0;
          let steer = 0;
          if (keys['KeyW'] || keys['ArrowUp'] || virtualPad.up) throttle += 1;
          if (keys['KeyS'] || keys['ArrowDown'] || virtualPad.down) throttle -= 1;
          if (keys['KeyA'] || keys['ArrowLeft'] || virtualPad.left) steer += 1;
          if (keys['KeyD'] || keys['ArrowRight'] || virtualPad.right) steer -= 1;

          if (veh.turboTimer && veh.turboTimer > 0) {
            veh.turboTimer = Math.max(0, veh.turboTimer - dt);
          }
          const kartUpgradeMult = veh.isRaceKart ? (1.0 + (player.upgrades.kartTurbo || 0) * 0.15) : 1.0;
          const turboMult = (veh.turboTimer && veh.turboTimer > 0) ? 1.38 : 1.0;
          const effectiveMaxSpeed = veh.maxSpeed * kartUpgradeMult * turboMult;

          const prevVehSpeed = veh.speed;
          veh._lastThrottle = throttle;
          const accel = throttle !== 0 ? throttle * (veh.isRaceKart ? 36.0 : 26.0) * kartUpgradeMult : 0;
          veh.speed += accel * dt;
          if (throttle === 0) {
            veh.speed *= Math.pow(0.22, dt);
          }
          veh.speed = Math.max(-effectiveMaxSpeed * 0.45, Math.min(effectiveMaxSpeed, veh.speed));

          if (Math.abs(veh.speed) > 0.4) {
            const dirSign = veh.speed >= 0 ? 1 : -1;
            const turnRate = veh.isRaceKart ? 2.45 : 1.95;
            veh.yaw += steer * turnRate * dirSign * dt;
            player.yaw = veh.yaw;
          }

          const vFwdX = -Math.sin(veh.yaw);
          const vFwdZ = -Math.cos(veh.yaw);
          const prevVZ = veh.z;
          const nextVX = Math.max(-150, Math.min(406, veh.x + vFwdX * veh.speed * dt));
          const nextVZ = Math.max(-150, Math.min(150, veh.z + vFwdZ * veh.speed * dt));

          // Check Go-Kart Dirt Track Boost Pads
          for (let bpIdx = 0; bpIdx < KART_TRACK.boostPads.length; bpIdx++) {
            const bp = KART_TRACK.boostPads[bpIdx];
            if (Math.hypot(nextVX - bp.x, nextVZ - bp.z) < 4.5 && (!veh.turboTimer || veh.turboTimer < 0.8)) {
              veh.turboTimer = 1.85;
              veh.speed = Math.max(veh.speed, effectiveMaxSpeed * 1.2);
              SoundFX.playTeleport();
              pushFeedMessage('⚡ TURBO BOOST PAD! Full speed ahead!', 'border-l-cyan-400 text-cyan-200');
            }
          }

          // Update Outskirts Dirt Circuit Lap Timer & Checkpoints
          const onKartCircuit = nextVX >= 228 && nextVX <= 404 && Math.abs(nextVZ) <= 88;
          const elKartHud = document.getElementById('kart-race-hud');
          if (onKartCircuit && (veh.isRaceKart || kartRaceState.active)) {
            kartRaceState.active = true;
            kartRaceState.lapTime += dt;
            if (elKartHud) elKartHud.classList.remove('hidden');

            const cp = KART_TRACK.checkpoints[kartRaceState.nextCheckpointIdx];
            if (cp && Math.hypot(nextVX - cp.x, nextVZ - cp.z) < cp.r) {
              kartRaceState.nextCheckpointIdx++;
              SoundFX.playJump();
              pushFeedMessage(`🏁 Checkpoint ${kartRaceState.nextCheckpointIdx}/4 (${cp.name})!`, 'border-l-amber-400 text-amber-200');
            }

            // Hold vehicle at start line during 3-2-1 countdown
            if (kartRaceState.countdown > 0) {
              veh.speed = 0;
            }

            // Cross Start/Finish line heading North on West Straight after all 4 checkpoints!
            if (
              kartRaceState.nextCheckpointIdx >= KART_TRACK.checkpoints.length &&
              Math.abs(nextVX - KART_TRACK.westX) < 11.5 &&
              prevVZ >= KART_TRACK.startLineZ &&
              nextVZ < KART_TRACK.startLineZ
            ) {
              const finishedTime = kartRaceState.lapTime;
              const isNewBest = kartRaceState.bestLap === null || finishedTime < kartRaceState.bestLap;
              if (isNewBest) kartRaceState.bestLap = finishedTime;
              SoundFX.playFanfare();

              if (kartRaceState.mode === 'ai' && kartRaceState.lap >= kartRaceState.totalLaps) {
                const diffSpec = AI_DIFFICULTY_SPECS[aiRivalBuggy.difficulty] || AI_DIFFICULTY_SPECS.medium;
                const lapBonusMult = 1 + Math.max(0, kartRaceState.totalLaps - 1) * 0.25;
                aiRivalBuggy.active = false;
                aiRivalBuggy.model.root.visible = false;
                kartRaceState.mode = 'solo';
                kartRaceState.lap = 1;
                kartRaceState.lapTime = 0;
                kartRaceState.nextCheckpointIdx = 0;
                awardCoinsAndXP(
                  Math.round(diffSpec.winCoins * lapBonusMult),
                  Math.round(diffSpec.winXp * lapBonusMult),
                  `🏆 YOU BEAT THE ${diffSpec.label.toUpperCase()} AI RIVAL!`
                );
              } else if (kartRaceState.mode === 'pvp' && kartRaceState.lap >= kartRaceState.totalLaps) {
                mpBuggyRace.finishedRaceId = kartRaceState.pvpRaceId;
                mpBuggyRace.sentToId = null;
                mpBuggyRace.sentRaceId = null;
                mpBuggyRace.acceptedRaceId = null;
                mpBuggyRace.activeRaceId = null;
                broadcastLocalPlayerState();
                const oppName = kartRaceState.pvpOpponentName || 'Rival';
                kartRaceState.mode = 'solo';
                kartRaceState.lap = 1;
                kartRaceState.lapTime = 0;
                kartRaceState.nextCheckpointIdx = 0;
                awardCoinsAndXP(250, 250, `🏆 YOU WON THE MULTIPLAYER RACE vs ${oppName}!`);
              } else {
                awardCoinsAndXP(
                  isNewBest ? 180 : 120,
                  150,
                  `🏁 Lap ${kartRaceState.lap} Complete (${finishedTime.toFixed(1)}s)${isNewBest ? ' — NEW BEST!' : ''}!`
                );
                kartRaceState.lap++;
                kartRaceState.lapTime = 0;
                kartRaceState.nextCheckpointIdx = 0;
              }
            }

            const elLapLbl = document.getElementById('kart-lap-label');
            const elBestLbl = document.getElementById('kart-best-label');
            if (elLapLbl) {
              if (kartRaceState.countdown > 0) {
                elLapLbl.textContent = `🚦 GET READY... ${Math.ceil(kartRaceState.countdown)}!`;
              } else {
                const lapTxt = kartRaceState.mode === 'solo' ? `LAP ${kartRaceState.lap}` : `LAP ${kartRaceState.lap}/${kartRaceState.totalLaps}`;
                elLapLbl.textContent = `${lapTxt} • CP ${kartRaceState.nextCheckpointIdx}/4 • ${kartRaceState.lapTime.toFixed(1)}s${veh.turboTimer > 0 ? ' ⚡TURBO!' : ''}`;
              }
            }
            if (elBestLbl) {
              if (kartRaceState.mode === 'ai') {
                elBestLbl.textContent = `AI: Lap ${aiRivalBuggy.lap}/${kartRaceState.totalLaps}`;
              } else if (kartRaceState.mode === 'pvp') {
                elBestLbl.textContent = `VS ${kartRaceState.pvpOpponentName || 'RIVAL'}`;
              } else {
                elBestLbl.textContent = kartRaceState.bestLap !== null ? `${kartRaceState.bestLap.toFixed(1)}s` : '--.-s';
              }
            }
          } else if (elKartHud) {
            elKartHud.classList.add('hidden');
          }
          const resolvedV = resolveXZCollisions(nextVX, nextVZ, 1.75, 0);
          const wallBumpDist = Math.hypot(resolvedV.x - nextVX, resolvedV.z - nextVZ);
          if (wallBumpDist > 0.08 && Math.abs(veh.speed) > 6.5) {
            spawnImpactSparks(resolvedV.x, 0.9, resolvedV.z, 0xfef08a, 6);
            SoundFX.playImpact(resolvedV.x, 0.9, resolvedV.z, Math.min(1, Math.abs(veh.speed) / 28), 'metal');
            veh._impactFlicker = 0.34;
          }
          if (veh._impactFlicker > 0) veh._impactFlicker = Math.max(0, veh._impactFlicker - dt);
          veh.x = resolvedV.x;
          veh.z = resolvedV.z;

          veh.model.root.position.set(veh.x, 0, veh.z);
          veh.model.root.rotation.y = veh.yaw;
          updateVehicleCosmeticMotion(veh.model, veh.speed, prevVehSpeed, steer, dt, timeSec, veh._impactFlicker || 0);

          // Surface-aware sharp-turn skid puffs & downtown puddle ripples
          if (Math.abs(veh.speed) > 8.0) {
            vehicleSkidFxTimer -= dt;
            if (vehicleSkidFxTimer <= 0) {
              if (isInRainPuddle(veh.x, veh.z)) {
                vehicleSkidFxTimer = 0.14;
                spawnSurfaceRipple(veh.x, 0.28, veh.z);
              } else if ((Math.abs(steer) > 0.5 && Math.abs(veh.speed) > 13.5) || (throttle * veh.speed < -5.0 && Math.abs(veh.speed) > 10.0)) {
                vehicleSkidFxTimer = 0.11;
                const rearX = veh.x + Math.sin(veh.yaw) * 1.9;
                const rearZ = veh.z + Math.cos(veh.yaw) * 1.9;
                const vehSurf = (rearX >= 226 && rearX <= 404 && Math.abs(rearZ) <= 88) ? 'dirt' : 'asphalt';
                spawnMicroPuff(rearX, 0.35, rearZ, getSurfaceTintAt(rearX, rearZ), 0.95, 1.1, 0.44);
                SoundFX.playTireSkid(rearX, 0.35, rearZ, Math.min(1, Math.abs(veh.speed) / 28), vehSurf);
              }
            }
          }

          player.x = veh.x;
          player.y = 0.5;
          player.z = veh.z;

          if (elVehicleSpeed) {
            const kmh = Math.round(Math.abs(veh.speed) * 3.2);
            elVehicleSpeed.textContent = `Speed: ${kmh} km/h • WASD Drive • H Siren/Horn • E Exit`;
          }
        } else if (!player.inArena && !player.inHelicopter) {
          const elKartHudOff = document.getElementById('kart-race-hud');
          if (elKartHudOff) elKartHudOff.classList.add('hidden');
          const nearVeh = getNearestGroundVehicle(player.x, player.y, player.z);
          if (nearVeh) {
            elVehiclePrompt.classList.remove('hidden');
            elVehicleBadge.textContent = nearVeh.badge;
            elVehicleTitle.textContent = `${nearVeh.icon} ${nearVeh.name}`;
          } else {
            elVehiclePrompt.classList.add('hidden');
          }
        } else {
          elVehiclePrompt.classList.add('hidden');
        }

        // Player Movement (W/A/S/D or Virtual D-Pad)
        let moveForward = 0;
        let moveRight = 0;
        if (keys['KeyW'] || keys['ArrowUp'] || virtualPad.up) moveForward += 1;
        if (keys['KeyS'] || keys['ArrowDown'] || virtualPad.down) moveForward -= 1;
        if (keys['KeyD'] || keys['ArrowRight'] || virtualPad.right) moveRight += 1;
        if (keys['KeyA'] || keys['ArrowLeft'] || virtualPad.left) moveRight -= 1;

        const isSprinting = keys['ShiftLeft'] || keys['ShiftRight'];
        const bootsMult = 1.0 + (player.upgrades.speedBoots || 0) * 0.12;
        const moveSpeed = player.isSwimming
          ? (isSprinting ? 10.2 : 7.2)
          : (isSprinting ? 16.5 : 11.5) * bootsMult;

        const forwardX = -Math.sin(player.yaw);
        const forwardZ = -Math.cos(player.yaw);
        const rightX = Math.cos(player.yaw);
        const rightZ = -Math.sin(player.yaw);

        let vx = forwardX * moveForward + rightX * moveRight;
        let vz = forwardZ * moveForward + rightZ * moveRight;
        const mag = Math.hypot(vx, vz);
        let horizontalSpeed = 0;
        if (mag > 0.001) {
          vx = (vx / mag) * moveSpeed;
          vz = (vz / mag) * moveSpeed;
          horizontalSpeed = moveSpeed;
        }

        const preStepBldg = (!player.inHelicopter && !player.activeVehicle) ? getBuildingAtXZ(player.x, player.z) : null;

        if (!player.inHelicopter && !player.activeVehicle && !player.slidingFirePole && !player.divingBoardState) {
          const nextPos = resolveXZCollisions(
            player.x + vx * dt,
            player.z + vz * dt,
            player.radius,
            player.y
          );
          player.x = nextPos.x;
          player.z = nextPos.z;

          if (preStepBldg && player.y >= 3.0) {
            const minBX = preStepBldg.x - preStepBldg.w / 2 + 1.15;
            const maxBX = preStepBldg.x + preStepBldg.w / 2 - 1.15;
            const minBZ = preStepBldg.z - preStepBldg.d / 2 + 1.15;
            const maxBZ = preStepBldg.z + preStepBldg.d / 2 - 1.15;
            player.x = Math.max(minBX, Math.min(maxBX, player.x));
            player.z = Math.max(minBZ, Math.min(maxBZ, player.z));
          }
        }

        if (player.inArena) {
          player.x = Math.max(
            ARENA_CENTER.x - ARENA_HALF_W + 1.8,
            Math.min(ARENA_CENTER.x + ARENA_HALF_W - 1.8, player.x)
          );
          player.z = Math.max(
            ARENA_CENTER.z - ARENA_HALF_D + 1.8,
            Math.min(ARENA_CENTER.z + ARENA_HALF_D - 1.8, player.z)
          );

          const distToExitPad = Math.hypot(
            player.x - (ARENA_CENTER.x - 40),
            player.z - (ARENA_CENTER.z - 38)
          );
          if (distToExitPad < 2.3) {
            returnToCityCenter(16, 6, -Math.PI / 2);
          }
        } else {
          player.x = Math.max(-152, Math.min(406, player.x));
          player.z = Math.max(-152, Math.min(152, player.z));
        }

        interactiveDoors.forEach((d) => {
          const dist = Math.hypot(player.x - d.wx, player.z - d.wz);
          const shouldOpen = dist < 5.5 && Math.abs(player.y - d.wy) < 3.5;
          const targetSlide = shouldOpen ? d.slideMax : 0;
          d.openAmount += (targetSlide - d.openAmount) * Math.min(1, dt * 8);
          d.leftPanel.position.x = -d.openAmount;
          d.rightPanel.position.x = d.openAmount;
        });

        for (let i = 0; i < multiFloorBuildings.length; i++) {
          const b = multiFloorBuildings[i];
          // Distance-cull indoor upper-floor furniture & interior window planes when player is > 52m away
          // (Since exterior walls are 100% opaque from the outside, distant indoor details are invisible anyway!)
          if (b.interiorCullGroup) {
            const distBldg = Math.hypot(player.x - b.x, player.z - b.z);
            const nearThisBldg = distBldg < 85;
            b.interiorCullGroup.visible = nearThisBldg;
            if (b.cabGroup) b.cabGroup.visible = nearThisBldg;
          }
          const inThisShaft =
            Math.abs(player.x - b.elevX) < 2.4 &&
            Math.abs(player.z - b.elevZ) < 2.4;

          if (Math.abs(b.currentY - b.targetY) > 0.04) {
            const dir = b.targetY > b.currentY ? 1 : -1;
            const step = Math.min(Math.abs(b.targetY - b.currentY), b.speed * dt);
            b.currentY += dir * step;
            if (inThisShaft && player.vy <= 0 && player.y <= b.currentY + 1.2) {
              player.y = b.currentY + 0.4;
              player.vy = 0;
            }
          } else {
            b.currentY = b.targetY;
          }
          if (b.cabGroup) {
            b.cabGroup.position.y = b.currentY;
          }
        }

        let supportFloorY = 0;
        let indoorCeilingMaxY = null;
        const currentBldg = (!player.inHelicopter && !player.activeVehicle) ? getBuildingAtXZ(player.x, player.z) : null;
        if (currentBldg) {
          const inShaft =
            Math.abs(player.x - currentBldg.elevX) < 2.4 &&
            Math.abs(player.z - currentBldg.elevZ) < 2.4;
          const isMovingCab = Math.abs(currentBldg.currentY - currentBldg.targetY) > 0.04;
          if (inShaft) {
            if (!isMovingCab && Math.abs(currentBldg.currentY + 0.4 - player.y) > 2.8 && player.vy <= 0) {
              // Player walked onto the lift pad on a floor while cab was parked elsewhere: sync cab to this floor
              const snapFloorIdx = Math.max(0, Math.min(currentBldg.numLevels - 1, Math.floor((player.y + 1.2) / currentBldg.floorHeight)));
              currentBldg.currentY = snapFloorIdx * currentBldg.floorHeight;
              currentBldg.targetY = currentBldg.currentY;
              if (currentBldg.cabGroup) currentBldg.cabGroup.position.y = currentBldg.currentY;
            }
            supportFloorY = currentBldg.currentY + 0.4;
          } else {
            // Use current floor index (without allowing a jump to snap up through a solid ceiling slab!)
            const floorIdx = Math.max(
              0,
              Math.min(
                currentBldg.numLevels - 1,
                Math.floor((player.y + 0.35) / currentBldg.floorHeight)
              )
            );
            supportFloorY = floorIdx * currentBldg.floorHeight + 0.4;
            if (floorIdx < currentBldg.numLevels - 1) {
              indoorCeilingMaxY = (floorIdx + 1) * currentBldg.floorHeight - 3.35;
            }
          }

          if (player.y >= 3.0) {
            const minBX = currentBldg.x - currentBldg.w / 2 + 1.15;
            const maxBX = currentBldg.x + currentBldg.w / 2 - 1.15;
            const minBZ = currentBldg.z - currentBldg.d / 2 + 1.15;
            const maxBZ = currentBldg.z + currentBldg.d / 2 - 1.15;
            player.x = Math.max(minBX, Math.min(maxBX, player.x));
            player.z = Math.max(minBZ, Math.min(maxBZ, player.z));
          }
        }

        const elElevatorPanel = document.getElementById('elevator-panel');
        const elElevatorFloorDisp = document.getElementById('elevator-floor-display');
        const nearElevBldg = (!player.inHelicopter && !player.activeVehicle) ? getNearestElevatorBuilding(player.x, player.z) : null;
        if (nearElevBldg) {
          if (lastActiveElevBuildingId !== nearElevBldg.id) {
            lastActiveElevBuildingId = nearElevBldg.id;
            updateElevatorPanelForBuilding(nearElevBldg);
          }
          elElevatorPanel.classList.remove('hidden');
          const curF = Math.round(player.y / nearElevBldg.floorHeight);
          elElevatorFloorDisp.textContent =
            curF >= nearElevBldg.numLevels - 1 && nearElevBldg.id === 'violet_tower'
              ? 'ROOF'
              : `${curF + 1}F`;
        } else {
          elElevatorPanel.classList.add('hidden');
        }

        if (player.slidingFirePole) {
          // Smooth, fast 3D slide down the Fire Station Brass Pole to 1F (ignores upper floor slabs!)
          player.x = FIRE_STATION_POLE.poleX;
          player.z = FIRE_STATION_POLE.poleZ;
          player.y -= 19.5 * dt;
          player.yaw += 7.5 * dt;
          if (player.y <= FIRE_STATION_POLE.groundY + 0.05) {
            player.y = FIRE_STATION_POLE.groundY;
            player.slidingFirePole = false;
            player.x = FIRE_STATION_POLE.poleX;
            player.z = FIRE_STATION_POLE.poleZ + 1.8;
            SoundFX.playJump();
            pushFeedMessage('🚒 Landed on 1F Engine & Rescue Bay!', 'border-l-emerald-400 text-emerald-200');
          }
        } else if (player.divingBoardState) {
          const dbs = player.divingBoardState;
          const dp = dbs.spec;
          const boardMesh = dp.getBoardMesh ? dp.getBoardMesh() : null;
          if (dbs.phase === 'bounce') {
            dbs.timer -= dt;
            player.x = dp.boardTipX;
            player.z = dp.boardTipZ;
            const bounceOffset = Math.sin((0.36 - dbs.timer) * 26.0) * 0.28;
            player.y = dp.boardY + Math.max(-0.18, bounceOffset);
            if (boardMesh) {
              boardMesh.rotation.x = -Math.abs(bounceOffset) * 0.35;
            }
            if (dbs.timer <= 0) {
              if (boardMesh) boardMesh.rotation.x = 0;
              dbs.phase = 'air_dive';
              player.vy = dp.launchVy || 13.8;
              SoundFX.playJump();
            }
          } else if (dbs.phase === 'air_dive') {
            const diveFwd = dp.fwdSpeed || 8.2;
            player.x += dp.fwdX * diveFwd * dt;
            player.z += dp.fwdZ * diveFwd * dt;
            player.y += player.vy * dt;
            player.vy -= 25.0 * dt;
            dbs.flipAngle += dt * 9.5;
            if (player.y <= dp.waterSurfaceY) {
              player.y = dp.deckY + 0.1;
              player.vy = 0;
              player.divingBoardState = null;
              player.isSwimming = true;
              SoundFX.playSplash();
              spawnWaterSplash(player.x, dp.waterSurfaceY, player.z, 24);
              pushFeedMessage('💦 Perfect 10/10 Somersault Dive into the Pool!', 'border-l-cyan-400 text-cyan-200');
            }
          }
        } else if (!player.inHelicopter && !player.activeVehicle) {
          const preLandVy = player.vy;
          const wasAirborne = player.y > supportFloorY + 0.15;
          player.y += player.vy * dt;
          if (indoorCeilingMaxY !== null && player.y > indoorCeilingMaxY) {
            player.y = indoorCeilingMaxY;
            if (player.vy > 0) player.vy = 0;
          }
          if (player.y > supportFloorY) {
            player.vy -= 28 * dt;
            if (player.y < supportFloorY) {
              player.y = supportFloorY;
              player.vy = 0;
            }
          } else {
            player.y = supportFloorY;
            player.vy = 0;
          }
          // Cosmetic touchdown dust puff or puddle ripple on hard landings (strictly read-only)
          const curSurfType = (player.y < 1.0 && isInRainPuddle(player.x, player.z))
            ? 'puddle'
            : (currentBldg ? 'indoor' : (player.x >= 226 && player.x <= 404 && Math.abs(player.z) <= 88 ? 'dirt' : ((player.x >= 165 && player.x <= 226 && player.z >= 38 && player.z <= 122) ? 'grass' : 'asphalt')));
          if (wasAirborne && player.y <= supportFloorY + 0.02 && preLandVy < -3.8 && !player.isSwimming) {
            playerRig._landCompression = Math.min(1.0, Math.abs(preLandVy) / 17.5);
            SoundFX.playLanding(curSurfType, Math.abs(preLandVy), player.x, player.y, player.z);
            if (preLandVy < -7.5) {
            if (curSurfType === 'puddle') {
              spawnSurfaceRipple(player.x, 0.28, player.z);
              spawnMicroPuff(player.x, 0.35, player.z, 0xe0f2fe, 0.75, 1.5, 0.48);
            } else {
              const tint = getSurfaceTintAt(player.x, player.z);
              for (let k = 0; k < 3; k++) {
                spawnMicroPuff(player.x, player.y + 0.2, player.z, tint, 0.72, 1.15, 0.42);
              }
            }
            }
          }
          // Subtle surface-aware footstep scuffs, puddle ripples & spatial footsteps
          if (!player.isSwimming && horizontalSpeed > 3.2 && player.y <= supportFloorY + 0.12) {
            playerFootstepFxTimer -= dt;
            if (playerFootstepFxTimer <= 0) {
              playerFootstepFxTimer = isSprinting ? 0.21 : 0.34;
              SoundFX.playFootstep(curSurfType, horizontalSpeed, player.x, player.y, player.z);
              if (curSurfType === 'puddle') {
                spawnSurfaceRipple(player.x, 0.28, player.z);
              } else if (isSprinting || (player.x > 226 && player.y < 1.0)) {
                spawnMicroPuff(player.x, player.y + 0.18, player.z, getSurfaceTintAt(player.x, player.z), 0.48, 0.75, 0.30);
              }
            }
          }
        }

        if (playerRig.gunGroup) {
          playerRig.gunGroup.visible = player.inArena;
        }

        // Hunger Bar slow, realistic depletion over time (~28 mins idle/walk, ~15 mins continuous sprinting/swimming)
        const hungerDrainRate = isAnyModalOpen()
          ? 0.0
          : ((isSprinting && horizontalSpeed > 0.2) || player.isSwimming ? 0.11 : (horizontalSpeed > 0.2 ? 0.065 : 0.035));
        player.hunger = Math.max(0, player.hunger - hungerDrainRate * dt);
        if (player.hunger <= 20) {
          player.hungerWarnTimer -= dt;
          if (player.hungerWarnTimer <= 0) {
            player.hungerWarnTimer = 60.0;
            pushFeedMessage('🍔 Getting hungry! Visit Retro Diner, Sweet Scoops, Plaza Cafe, Supermart, or Indoor Pool Bar to eat!', 'border-l-amber-400 text-amber-200');
          }
          if (player.hunger <= 0 && player.hp > 25) {
            player.hp = Math.max(25, player.hp - 0.18 * dt);
          }
        }
        updateHUD();

        updatePoolParticles(dt);
        const activePoolNow = getActivePoolSpecAt(player.x, player.y, player.z);
        const inPoolWaterNow = !!activePoolNow;
        const curWaterSurfY = activePoolNow ? activePoolNow.waterSurfaceY : getCurrentWaterSurfaceY(player.x, player.y, player.z);
        if (inPoolWaterNow && !player.isSwimming) {
          player.isSwimming = true;
          SoundFX.playSplash();
          spawnWaterSplash(player.x, curWaterSurfY, player.z, 14);
          pushFeedMessage(`🏊 Swimming in ${activePoolNow.title}! WASD to swim, Shift for fast crawl, Space to splash jump!`, 'border-l-cyan-400 text-cyan-200');
        } else if (!inPoolWaterNow && player.isSwimming) {
          player.isSwimming = false;
          playerRig.root.rotation.order = 'YXZ';
          playerRig.root.rotation.x = 0;
          playerRig.root.rotation.z = 0;
          if (playerRig.head) playerRig.head.rotation.x = 0;
          playerRig.leftArmPivot.rotation.z = 0;
          playerRig.rightArmPivot.rotation.z = 0;
          playerRig.leftLegPivot.rotation.z = 0;
          playerRig.rightLegPivot.rotation.z = 0;
          SoundFX.playSwimStroke();
        }

        const elSwimmingHud = document.getElementById('swimming-hud');
        const elSwimmingTitle = document.getElementById('swimming-hud-title');
        const elSwimmingStatus = document.getElementById('swimming-hud-status');
        const elBtnPoolSplash = document.getElementById('btn-pool-splash');
        if (elSwimmingHud) {
          if (player.isSwimming || isPlayerOnMetroRoyalPoolRoof(player.x, player.y, player.z)) {
            elSwimmingHud.classList.remove('hidden');
            const isIndoorAquatic = player.y < 15;
            if (elSwimmingTitle) {
              elSwimmingTitle.textContent = isIndoorAquatic
                ? '🏊 Grand Indoor Olympic Swimming Pool'
                : '🏨 Metro Royal 9F Sky Pool';
            }
            if (player.isSwimming) {
              if (elSwimmingStatus) {
                elSwimmingStatus.textContent = horizontalSpeed > 0.2
                  ? '🏊 Freestyle Swimming • Shift Fast Crawl • Space Dolphin Jump'
                  : '💧 Treading Water • WASD to Swim • [E] Pool Smoothie Bar';
              }
              if (elBtnPoolSplash) elBtnPoolSplash.textContent = '💦 Dolphin Jump [Space]';
            } else {
              if (elSwimmingStatus) {
                elSwimmingStatus.textContent = isIndoorAquatic
                  ? '🏊 Olympic Pool Deck • Walk into Water, Dive, or Press [E] for Smoothies!'
                  : '🏖️ 9F Poolside Sun Deck • Walk into the Water or Click Dive!';
              }
              if (elBtnPoolSplash) elBtnPoolSplash.textContent = '🏊 Dive into Pool';
            }
          } else {
            elSwimmingHud.classList.add('hidden');
          }
        }

        if (player.isSwimming && horizontalSpeed > 0.2) {
          player.swimStrokeTimer -= dt;
          if (player.swimStrokeTimer <= 0) {
            player.swimStrokeTimer = isSprinting ? 0.24 : 0.36;
            SoundFX.playSwimStroke();
            spawnWaterSplash(player.x, curWaterSurfY, player.z, 4);
          }
        }

        if (player.actionSpinTimer > 0) {
          player.actionSpinTimer = Math.max(0, player.actionSpinTimer - dt);
        }

        if (player.inHelicopter) {
          applySeatedPoseToPlayerRig();
        } else if (player.activeVehicle) {
          applySeatedPoseToPlayerRig();
        } else if (player.slidingFirePole) {
          playerRig.root.position.set(player.x, player.y, player.z);
          playerRig.root.rotation.order = 'YXZ';
          playerRig.root.rotation.set(0, player.yaw + Math.PI, 0);
          playerRig.leftArmPivot.rotation.x = -Math.PI / 2.2;
          playerRig.rightArmPivot.rotation.x = -Math.PI / 2.2;
          playerRig.leftLegPivot.rotation.x = -0.35;
          playerRig.rightLegPivot.rotation.x = -0.35;
        } else if (player.divingBoardState && player.divingBoardState.phase === 'air_dive') {
          playerRig.root.position.set(player.x, player.y, player.z);
          playerRig.root.rotation.order = 'YXZ';
          playerRig.root.rotation.y = player.yaw + Math.PI;
          playerRig.root.rotation.x = player.divingBoardState.flipAngle;
          playerRig.leftArmPivot.rotation.x = Math.PI;
          playerRig.rightArmPivot.rotation.x = Math.PI;
        } else if (player.isSwimming) {
          animateSwimmingCharacter(playerRig, horizontalSpeed, dt, timeSec);
        } else {
          playerRig.root.position.set(player.x, player.y, player.z);
          playerRig.root.rotation.order = 'YXZ';
          const spinAdd = player.actionSpinTimer > 0 ? (player.actionSpinTimer / 0.75) * Math.PI * 2 : 0;
          playerRig.root.rotation.y = player.yaw + Math.PI + spinAdd;
          const isPlayerGrounded = player.y <= supportFloorY + 0.14;
          const moveYawOff = (horizontalSpeed > 0.3 && (moveForward !== 0 || moveRight !== 0))
            ? Math.atan2(-moveRight, moveForward)
            : 0;
          animateBoxCharacter(playerRig, horizontalSpeed, dt, player.inArena, player.vy, isPlayerGrounded, moveYawOff);
        }

        nearestArcadeCabinet = null;
        const elArcadePrompt = document.getElementById('arcade-prompt');
        const elArcadeTitle = document.getElementById('arcade-machine-title');
        if (!player.inArena && Math.abs(player.y - 36.4) < 2.2 && isPlayerInVioletTower(player.x, player.z)) {
          let bestDist = 3.8;
          arcadeCabinets.forEach((cab) => {
            const d = Math.hypot(player.x - cab.wx, player.z - cab.wz);
            if (d < bestDist) {
              bestDist = d;
              nearestArcadeCabinet = cab;
            }
          });
        }
        const activeIndoorInfo = (!nearestArcadeCabinet && !arcadeGame.open) ? getActiveIndoorBuildingWithActivity() : null;
        if (nearestArcadeCabinet && !arcadeGame.open) {
          elArcadePrompt.classList.remove('hidden');
          elArcadeTitle.textContent = nearestArcadeCabinet.title;
          document.getElementById('btn-open-arcade').textContent = '🕹️ PLAY MINI-GAME [E]';
        } else if (activeIndoorInfo) {
          elArcadePrompt.classList.remove('hidden');
          elArcadeTitle.textContent = activeIndoorInfo.building.title;
          document.getElementById('btn-open-arcade').textContent = activeIndoorInfo.activity.label;
        } else {
          elArcadePrompt.classList.add('hidden');
        }

        updateArcadeMiniGame();

        const elFootballHud = document.getElementById('rooftop-football-hud');
        const elFootballTitle = document.getElementById('football-hud-title');
        const onTerrace = !player.inArena && !player.inHelicopter && player.y >= VIOLET_TOWER.terraceY - 0.5 && isPlayerInVioletTower(player.x, player.z);
        const onStadium = !player.inArena && !player.inHelicopter && isPlayerInStadiumPitch(player.x, player.y, player.z);
        if (onTerrace || onStadium) {
          elFootballHud.classList.remove('hidden');
          if (elFootballTitle) {
            elFootballTitle.textContent = onStadium ? '⚽ Metro Football Stadium' : '⚽ Rooftop Football';
          }
        } else {
          elFootballHud.classList.add('hidden');
        }

        function stepFootballPitch(ball, isPlayerOnPitch, centerX, centerZ, halfW, halfD, goalHalfW, groundY, labelName) {
          if (isPlayerOnPitch) {
            const dxBall = ball.x - player.x;
            const dzBall = ball.z - player.z;
            const distBall = Math.hypot(dxBall, dzBall);
            if (distBall < 2.0 && distBall > 0.001) {
              const pushSpeed = Math.max(15.5, horizontalSpeed * 1.35);
              ball.vx = (dxBall / distBall) * pushSpeed;
              ball.vz = (dzBall / distBall) * pushSpeed;
              ball.vy = Math.max(ball.vy, 2.8);
              ball._squash = 0.26;
              spawnMicroPuff(ball.x, groundY + 0.15, ball.z, 0x86efac, 0.65, 1.2, 0.38);
              SoundFX.playBallBounce(ball.x, ball.y, ball.z, Math.min(1, pushSpeed / 22));
            }
          }

          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;
          ball.z += ball.vz * dt;
          ball.vx *= Math.pow(0.48, dt);
          ball.vz *= Math.pow(0.48, dt);

          if (ball.y > groundY) {
            ball.vy -= 22 * dt;
          } else {
            ball.y = groundY;
            if (Math.abs(ball.vy) > 1.4) {
              ball.vy = -ball.vy * 0.45;
              ball._squash = Math.min(0.24, Math.abs(ball.vy) * 0.045);
              SoundFX.playBallBounce(ball.x, ball.y, ball.z, Math.min(0.8, Math.abs(ball.vy) / 10));
            } else {
              ball.vy = 0;
            }
          }

          const minFX = centerX - halfW;
          const maxFX = centerX + halfW;
          const minFZ = centerZ - halfD;
          const maxFZ = centerZ + halfD;

          if (ball.x < minFX) { ball.x = minFX; ball.vx *= -0.75; }
          if (ball.x > maxFX) { ball.x = maxFX; ball.vx *= -0.75; }

          if (ball.z < minFZ) {
            if (Math.abs(ball.x - centerX) < goalHalfW) {
              rooftopFootball.scoreBlue++;
              document.getElementById('football-score-blue').textContent = String(rooftopFootball.scoreBlue);
              SoundFX.playFanfare();
              awardCoinsAndXP(60, 90, `⚽ GOAL on ${labelName}!`);
              ball.x = centerX;
              ball.y = groundY + 0.5;
              ball.z = centerZ;
              ball.vx = 0; ball.vy = 0; ball.vz = 0;
            } else {
              ball.z = minFZ;
              ball.vz *= -0.75;
            }
          } else if (ball.z > maxFZ) {
            if (Math.abs(ball.x - centerX) < goalHalfW) {
              rooftopFootball.scoreRed++;
              document.getElementById('football-score-red').textContent = String(rooftopFootball.scoreRed);
              SoundFX.playFanfare();
              pushFeedMessage(`⚽ GOAL in South Net on ${labelName}!`, 'border-l-rose-400 text-rose-200');
              ball.x = centerX;
              ball.y = groundY + 0.5;
              ball.z = centerZ;
              ball.vx = 0; ball.vy = 0; ball.vz = 0;
            } else {
              ball.z = maxFZ;
              ball.vz *= -0.75;
            }
          }

          ball.mesh.position.set(ball.x, ball.y, ball.z);
          // True velocity-proportional rolling-axis quaternion rotation (radius ~0.62)
          const fbHorizSpd = Math.hypot(ball.vx, ball.vz);
          if (fbHorizSpd > 0.05) {
            const rollAxis = new THREE.Vector3(ball.vz / fbHorizSpd, 0, -ball.vx / fbHorizSpd);
            const rollAngle = (fbHorizSpd * dt) / 0.62;
            const dq = new THREE.Quaternion().setFromAxisAngle(rollAxis, rollAngle);
            ball.mesh.quaternion.premultiply(dq);
          }
          if (ball._squash && ball._squash > 0.002) {
            ball._squash *= Math.exp(-14.0 * dt);
            const sy = 1.0 - ball._squash;
            const sxz = 1.0 + ball._squash * 0.55;
            ball.mesh.scale.set(sxz, sy, sxz);
          } else {
            ball.mesh.scale.set(1, 1, 1);
          }
        }

        stepFootballPitch(
          rooftopFootball,
          onTerrace,
          VIOLET_TOWER.x - 3.0,
          VIOLET_TOWER.z,
          12.0,
          10.8,
          3.4,
          terraceY + 0.95,
          'Rooftop Football Court'
        );

        stepFootballPitch(
          stadiumFootball,
          onStadium,
          STADIUM_PITCH.x,
          STADIUM_PITCH.z,
          STADIUM_PITCH.halfW - 1.5,
          STADIUM_PITCH.halfD,
          STADIUM_PITCH.goalHalfW,
          1.05,
          'Metro Football Stadium'
        );

        let inIndoorFloor = false;
        if (!player.inArena && !player.inHelicopter && currentBldg) {
          const curFloorIdx = Math.round(player.y / currentBldg.floorHeight);
          if (curFloorIdx >= currentBldg.numLevels - 1) {
            inIndoorFloor = false;
          } else if (curFloorIdx >= 1) {
            inIndoorFloor = true;
          } else {
            inIndoorFloor =
              Math.abs(player.x - currentBldg.x) < currentBldg.w / 2 - 1.2 &&
              Math.abs(player.z - currentBldg.z) < currentBldg.d / 2 - 1.2;
          }
        }

        if (player.firstPerson) {
          camera.position.set(
            player.x - Math.sin(player.yaw) * 0.35,
            player.y + 2.85,
            player.z - Math.cos(player.yaw) * 0.35
          );
          const lookX = camera.position.x - Math.sin(player.yaw) * 20 * Math.cos(player.pitch);
          const lookY = camera.position.y + Math.sin(player.pitch) * 20;
          const lookZ = camera.position.z - Math.cos(player.yaw) * 20 * Math.cos(player.pitch);
          camera.lookAt(lookX, lookY, lookZ);
        } else {
          const camDist = player.inHelicopter ? 13.5 : (player.activeVehicle ? 11.2 : (inIndoorFloor ? 4.4 : 7.8));
          const camHeight = player.inHelicopter ? 5.2 : (player.activeVehicle ? 4.2 : (inIndoorFloor ? 3.5 : 4.3));
          const camX = player.x + Math.sin(player.yaw) * camDist;
          const camY = Math.max(1.2, player.y + camHeight - Math.sin(player.pitch) * (inIndoorFloor ? 2.2 : 4.0));
          const camZ = player.z + Math.cos(player.yaw) * camDist;
          camera.position.set(camX, camY, camZ);

          const targetX = player.x - Math.sin(player.yaw) * 8;
          const targetY = player.y + 2.3 + Math.sin(player.pitch) * 6;
          const targetZ = player.z - Math.cos(player.yaw) * 8;
          camera.lookAt(targetX, targetY, targetZ);
        }

        // Phase 5: Sync 3D AudioListener, Context-Modulated Ambience & Vehicle Engine (Read-Only)
        SoundFX.updateListener(camera);
        const listenerSpeed = player.inHelicopter
          ? Math.hypot(helicopter.vx, helicopter.vz)
          : (player.activeVehicle ? Math.abs(player.activeVehicle.speed) : horizontalSpeed);
        SoundFX.updateAmbience(listenerSpeed, player.y, !!inIndoorFloor, !!player.isSwimming, !!dayNightState.isNight);
        SoundFX.updatePlayerEngine(
          !!player.activeVehicle,
          player.activeVehicle ? player.activeVehicle.speed : 0,
          !!(player.activeVehicle && player.activeVehicle.isBuggy),
          !!(player.activeVehicle && player.activeVehicle.turboTimer > 0),
          player.activeVehicle ? (player.activeVehicle._lastThrottle || 0) : 0,
          (player.activeVehicle && player.activeVehicle.x >= 226 && player.activeVehicle.x <= 404 && Math.abs(player.activeVehicle.z) <= 88) ? 'dirt' : 'asphalt'
        );

        if (!player.inArena) {
          const distGate = Math.hypot(player.x - GATE_BUTTON_POS.x, player.z - GATE_BUTTON_POS.z);
          if (distGate < 7.5 && player.y < 3.0) {
            elGatePrompt.classList.remove('hidden');
          } else {
            elGatePrompt.classList.add('hidden');
          }
        } else {
          elGatePrompt.classList.add('hidden');
        }

        cityNPCs.forEach((npc) => {
          npc.angle += (npc.speed / npc.radius) * dt * 0.45;
          const prevX = npc.x;
          const prevZ = npc.z;
          npc.x = npc.homeX + Math.cos(npc.angle) * npc.radius;
          npc.z = npc.homeZ + Math.sin(npc.angle) * npc.radius;
          const yaw = Math.atan2(npc.x - prevX, npc.z - prevZ);
          npc.rig.root.position.set(npc.x, npc.y || 0, npc.z);
          npc.rig.root.rotation.y = yaw;
          animateBoxCharacter(npc.rig, npc.speed, dt, false);
        });

        arenaBots.forEach((bot) => {
          if (bot.splatFlashTimer > 0) {
            bot.splatFlashTimer -= dt;
            if (bot.splatFlashTimer <= 0) {
              bot.rig.torsoMat.color.setHex(bot.rig.originalShirtColor);
            }
          }

          if (!matchState.active) {
            bot.rig.root.position.set(bot.x, 0, bot.z);
            bot.rig.root.rotation.y = bot.yaw + Math.PI;
            animateBoxCharacter(bot.rig, 0, dt, false);
            return;
          }

          bot.retargetTimer -= dt;
          if (bot.retargetTimer <= 0) {
            bot.retargetTimer = 1.6 + Math.random() * 2.2;
            const zoneBias = bot.team === 'blue' ? -10 : 10;
            bot.targetX = ARENA_CENTER.x + zoneBias + (Math.random() - 0.5) * 56;
            bot.targetZ = ARENA_CENTER.z + (Math.random() - 0.5) * 64;
          }

          const dxT = bot.targetX - bot.x;
          const dzT = bot.targetZ - bot.z;
          const distT = Math.hypot(dxT, dzT);
          let bSpeed = 0;
          if (distT > 1.2) {
            bSpeed = 7.8;
            const stepX = (dxT / distT) * bSpeed * dt;
            const stepZ = (dzT / distT) * bSpeed * dt;
            const res = resolveXZCollisions(bot.x + stepX, bot.z + stepZ, 0.85, 0);
            bot.x = Math.max(ARENA_CENTER.x - ARENA_HALF_W + 2, Math.min(ARENA_CENTER.x + ARENA_HALF_W - 2, res.x));
            bot.z = Math.max(ARENA_CENTER.z - ARENA_HALF_D + 2, Math.min(ARENA_CENTER.z + ARENA_HALF_D - 2, res.z));
          }

          let enemyX = null;
          let enemyZ = null;
          let bestDist = 999;

          if (bot.team === 'red' && player.inArena) {
            const dPlayer = Math.hypot(player.x - bot.x, player.z - bot.z);
            if (dPlayer < bestDist) {
              bestDist = dPlayer;
              enemyX = player.x;
              enemyZ = player.z;
            }
          }

          arenaBots.forEach((other) => {
            if (other.team !== bot.team) {
              const d = Math.hypot(other.x - bot.x, other.z - bot.z);
              if (d < bestDist) {
                bestDist = d;
                enemyX = other.x;
                enemyZ = other.z;
              }
            }
          });

          if (enemyX !== null) {
            bot.yaw = Math.atan2(-(enemyX - bot.x), -(enemyZ - bot.z));
          }

          bot.rig.root.position.set(bot.x, 0, bot.z);
          bot.rig.root.rotation.y = bot.yaw + Math.PI;
          animateBoxCharacter(bot.rig, bSpeed, dt, true);

          bot.shootCooldown -= dt;
          if (bot.shootCooldown <= 0 && enemyX !== null && bestDist < 48) {
            bot.shootCooldown = 0.85 + Math.random() * 1.1;
            if (player.inArena) {
              const aimSpread = (Math.random() - 0.5) * 0.14;
              const dirX = -Math.sin(bot.yaw + aimSpread);
              const dirZ = -Math.cos(bot.yaw + aimSpread);
              const dirY = 0.03 + (Math.random() - 0.5) * 0.04;
              const col = bot.team === 'blue' ? 0x22d3ee : 0xf43f5e;
              spawnPaintball(bot.x, 2.1, bot.z, dirX, dirY, dirZ, bot.team, bot.name, col);
            }
          }
        });

        for (let i = paintballs.length - 1; i >= 0; i--) {
          const pb = paintballs[i];
          pb.age += dt;
          pb.vy -= 9.8 * dt;
          pb.x += pb.vx * dt;
          pb.y += pb.vy * dt;
          pb.z += pb.vz * dt;
          pb.mesh.position.set(pb.x, pb.y, pb.z);

          let hit = false;

          if (pb.y <= 0.25) {
            addPaintSplatter(pb.x, 0.2, pb.z, 0, 1, 0, pb.colorHex);
            spawnImpactSparks(pb.x, 0.35, pb.z, pb.colorHex, 4);
            SoundFX.playSplat(pb.x, 0.2, pb.z);
            hit = true;
          }

          if (!hit) {
            for (let c = 0; c < colliders.length; c++) {
              const box = colliders[c];
              if (
                pb.x >= box.minX &&
                pb.x <= box.maxX &&
                pb.z >= box.minZ &&
                pb.z <= box.maxZ &&
                pb.y <= box.maxY
              ) {
                addPaintSplatter(pb.x, Math.max(0.5, pb.y), pb.z, 0, 1, 0, pb.colorHex);
                spawnImpactSparks(pb.x, Math.max(0.5, pb.y), pb.z, pb.colorHex, 5);
                SoundFX.playSplat(pb.x, Math.max(0.5, pb.y), pb.z);
                hit = true;
                break;
              }
            }
          }

          if (!hit) {
            for (let b = 0; b < arenaBots.length; b++) {
              const bot = arenaBots[b];
              if (bot.team === pb.team) continue;
              const dXZ = Math.hypot(pb.x - bot.x, pb.z - bot.z);
              if (dXZ < 1.05 && pb.y >= 0.2 && pb.y <= 3.3) {
                hit = true;
                SoundFX.playSplat(pb.x, pb.y, pb.z);
                addPaintSplatter(bot.x, 0.22, bot.z, 0, 1, 0, pb.colorHex);
                spawnImpactSparks(pb.x, pb.y, pb.z, pb.colorHex, 6);
                bot.hp -= 35;
                bot.rig.torsoMat.color.setHex(pb.colorHex);
                bot.splatFlashTimer = 0.45;

                if (bot.hp <= 0) {
                  bot.hp = 100;
                  bot.x = bot.spawnX;
                  bot.z = bot.spawnZ;
                  if (pb.team === 'blue') {
                    matchState.scoreBlue++;
                    if (pb.ownerName === 'You') {
                      player.splats++;
                      awardCoinsAndXP(20, 30, `🎯 Splattered ${bot.name}!`);
                    } else {
                      pushFeedMessage(`💙 ${pb.ownerName} tagged ${bot.name}!`, 'border-l-cyan-400 text-cyan-200');
                    }
                  } else {
                    matchState.scoreRed++;
                    pushFeedMessage(`❤️ ${pb.ownerName} tagged ${bot.name}!`, 'border-l-rose-400 text-rose-200');
                  }
                  updateHUD();
                }
                break;
              }
            }
          }

          if (!hit && player.inArena && pb.team === 'red') {
            const dPlayer = Math.hypot(pb.x - player.x, pb.z - player.z);
            if (dPlayer < 1.05 && pb.y >= player.y && pb.y <= player.y + 3.2) {
              hit = true;
              SoundFX.playSplat();
              player.hp = Math.max(0, player.hp - 20);
              playerRig.torsoMat.color.setHex(pb.colorHex);

              if (player.hp <= 0) {
                player.hp = 100;
                player.x = ARENA_CENTER.x - 36;
                player.z = ARENA_CENTER.z;
                matchState.scoreRed++;
                playerRig.torsoMat.color.setHex(playerRig.originalShirtColor);
                pushFeedMessage(`💥 Tagged out by ${pb.ownerName}! Respawned at Blue Base.`, 'border-l-rose-400 text-rose-200');
              }
              updateHUD();
            }
          }

          if (hit || pb.age > 3.0) {
            scene.remove(pb.mesh);
            pb.mesh.material.dispose();
            paintballs.splice(i, 1);
          }
        }

        if (matchState.active) {
          matchState.timeRemaining -= dt;
          if (matchState.scoreBlue >= matchState.targetScore) {
            finishPaintballMatch('Target Score 20 Reached!');
          } else if (matchState.scoreRed >= matchState.targetScore) {
            finishPaintballMatch('Red Team Reached 20 Points!');
          } else if (matchState.timeRemaining <= 0) {
            matchState.timeRemaining = 0;
            finishPaintballMatch('Match Time Expired!');
          }
          updateHUD();
        }

        player.currentSpeed = horizontalSpeed;
        updateMultiplayerPeers(dt, timeSec);

        // Throttled Minimap Redraw (10 FPS instead of 60 FPS to eliminate 2D Canvas CPU lag!)
        minimapRedrawTimer -= dt;
        if (minimapRedrawTimer <= 0) {
          minimapRedrawTimer = 0.10;
          drawMapCanvas(minimapCanvas, false);
        }
      }

      // ==========================================
      // 16. RESIZE HANDLER & ANIMATION LOOP START
      // ==========================================
      function handleResize() {
        const container = document.getElementById('game-container');
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }

      window.addEventListener('resize', handleResize);

      let animFrameId = null;
      function animate(now) {
        animFrameId = requestAnimationFrame(animate);
        const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
        lastFrameTime = now;
        updateGame(dt);
        renderer.render(scene, camera);
      }

      handleResize();
      updateHUD();
      drawMapCanvas(minimapCanvas, false);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      lastFrameTime = performance.now();
      animFrameId = requestAnimationFrame(animate);
    
}
