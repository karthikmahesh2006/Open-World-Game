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
        activeSirenOsc: null,
        activeSirenGain: null,
        activeSirenType: null,
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
        },
        playShoot() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(75, now + 0.09);
          gain.gain.setValueAtTime(0.22, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.095);
        },
        playSplat() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(190, now);
          osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.13);
        },
        playTeleport() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.38);
          gain.gain.setValueAtTime(0.24, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
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
            gain.gain.setValueAtTime(0.16, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.26);
          });
        },
        playHorn() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          [340, 425].forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.11, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
          });
        },
        startContinuousSiren(vehicleType = 'police') {
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
            // Constant steady volume (0.14) — never decays while siren is switched ON!
            gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            this.activeSirenOsc = osc;
            this.activeSirenGain = gain;
            this.activeSirenType = vehicleType;
          } catch (e) {}
        },
        updateContinuousSiren(timeSec, vehicleType = 'police') {
          if (!this.enabled) {
            this.stopContinuousSiren();
            return;
          }
          if (!this.activeSirenOsc || this.activeSirenType !== vehicleType) {
            this.startContinuousSiren(vehicleType);
          }
          if (!this.activeSirenOsc || !this.ctx) return;

          let targetFreq = 740;
          if (vehicleType === 'fire_engine') {
            // Continuous deep sweeping Fire Engine wail (390Hz <-> 670Hz)
            targetFreq = 530 + Math.sin(timeSec * 4.4) * 140;
          } else if (vehicleType === 'ambulance') {
            // Continuous unbroken Hi-Lo Medical Ambulance siren (550Hz <-> 780Hz)
            targetFreq = Math.sin(timeSec * 7.8) >= 0 ? 780 : 550;
          } else {
            // Continuous unbroken Police Cruiser wail siren (580Hz <-> 920Hz)
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
            try {
              this.activeSirenGain.disconnect();
            } catch (e) {}
            this.activeSirenGain = null;
          }
          this.activeSirenType = null;
        },
        playSirenPulse(highTone, vehicleType = 'police') {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = vehicleType === 'fire_engine' ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(highTone ? 780 : 560, now);
          osc.frequency.linearRampToValueAtTime(highTone ? 600 : 820, now + 0.25);
          gain.gain.setValueAtTime(0.13, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.26);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.27);
        },
        playRotorPulse() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(58, now);
          osc.frequency.exponentialRampToValueAtTime(42, now + 0.07);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        },
        playSplash() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          [220, 310, 440, 180].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.03);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.45, now + idx * 0.03 + 0.16);
            gain.gain.setValueAtTime(0.11, now + idx * 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.03);
            osc.stop(now + idx * 0.03 + 0.19);
          });
        },
        playSwimStroke() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(195, now);
          osc.frequency.exponentialRampToValueAtTime(125, now + 0.14);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
        },
        playJump() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(360, now + 0.12);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.14);
        }
      };

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
      // 3. THREE.JS SCENE, CAMERA & RENDERER SETUP (OPTIMIZED FOR ZERO LAG)
      // ==========================================
      const canvas = document.getElementById('webgl-canvas');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = false;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x7dd3fc);
      scene.fog = new THREE.FogExp2(0x7dd3fc, 0.00085);

      const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 1200);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 0.48);
      scene.add(hemiLight);

      const sunLight = new THREE.DirectionalLight(0xfffbeb, 0.92);
      sunLight.position.set(95, 160, 85);
      sunLight.castShadow = false;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 450;
      const d = 190;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      scene.add(sunLight);

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

      // Base Ground (Covers both Main City and Outskirts)
      const groundGeo = new THREE.PlaneGeometry(900, 600);
      const groundMat = new THREE.MeshLambertMaterial({ color: 0x3f6212 });
      const groundMesh = new THREE.Mesh(groundGeo, groundMat);
      groundMesh.rotation.x = -Math.PI / 2;
      groundMesh.receiveShadow = true;
      worldGroup.add(groundMesh);
      shootableMeshes.push(groundMesh);

      // Main City Concrete Base Pad (-155..155, -155..155)
      const cityPadGeo = new THREE.BoxGeometry(310, 0.2, 310);
      const cityPadMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
      const cityPad = new THREE.Mesh(cityPadGeo, cityPadMat);
      cityPad.position.set(0, 0.1, 0);
      cityPad.receiveShadow = true;
      worldGroup.add(cityPad);
      shootableMeshes.push(cityPad);

      // City Road Network (Grid of Asphalt Roads)
      const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const roadCoords = [-110, -52, 52, 110];

      roadCoords.forEach((rc) => {
        const nsRoad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.24, 308), roadMat);
        nsRoad.position.set(rc, 0.12, 0);
        nsRoad.receiveShadow = true;
        worldGroup.add(nsRoad);

        const nsLine = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.26, 304), stripeMat);
        nsLine.position.set(rc, 0.13, 0);
        worldGroup.add(nsLine);

        const ewRoad = new THREE.Mesh(new THREE.BoxGeometry(308, 0.24, 16), roadMat);
        ewRoad.position.set(0, 0.12, rc);
        ewRoad.receiveShadow = true;
        worldGroup.add(ewRoad);

        const ewLine = new THREE.Mesh(new THREE.BoxGeometry(304, 0.26, 0.4), stripeMat);
        ewLine.position.set(0, 0.13, rc);
        worldGroup.add(ewLine);
      });

      // Connecting Outskirts Highway from East City Gate to Outskirts Paintball Ground
      const highway = new THREE.Mesh(new THREE.BoxGeometry(130, 0.22, 14), roadMat);
      highway.position.set(210, 0.11, 0);
      worldGroup.add(highway);

      // Central Town Hall Plaza (-44..44, -44..44)
      const plazaGeo = new THREE.BoxGeometry(88, 0.3, 88);
      const plazaMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
      const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
      plazaMesh.position.set(0, 0.15, 0);
      plazaMesh.receiveShadow = true;
      worldGroup.add(plazaMesh);
      shootableMeshes.push(plazaMesh);

      // Decorative Plaza Inner Tile Ring
      const innerPlaza = new THREE.Mesh(
        new THREE.BoxGeometry(64, 0.34, 64),
        new THREE.MeshLambertMaterial({ color: 0xcbd5e1 })
      );
      innerPlaza.position.set(0, 0.17, 0);
      innerPlaza.receiveShadow = true;
      worldGroup.add(innerPlaza);

      // Small Ornamental City Centre Fountain in front of Town Hall (Centered at x: 0, z: 7)
      const FOUNTAIN_POS = { x: 0, z: 7 };
      const plazaFountainGroup = new THREE.Group();
      plazaFountainGroup.position.set(FOUNTAIN_POS.x, 0.34, FOUNTAIN_POS.z);
      worldGroup.add(plazaFountainGroup);

      const ftnStoneMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
      const ftnGoldMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
      const ftnWaterMat = new THREE.MeshLambertMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.78
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

      const streetLightPoleMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const streetLightBulbMat = new THREE.MeshBasicMaterial({ color: 0xdbeafe });
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

        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        const mat = new THREE.MeshLambertMaterial({
          map: tex,
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
        topFloorType = 'helipad'
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
                new THREE.MeshLambertMaterial({
                  color: 0x22d3ee,
                  transparent: true,
                  opacity: 0.72
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
            } else if (isTopFloor) {
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
            } else if (f % 3 === 1) {
              const confTable = new THREE.Mesh(
                new THREE.BoxGeometry(Math.min(7.5, w * 0.42), 1.05, 3.0),
                new THREE.MeshLambertMaterial({ color: accentColor })
              );
              confTable.position.set(-1.8, 0.72, 0);
              fInteriorGroup.add(confTable);

              const holoScreen = new THREE.Mesh(
                new THREE.BoxGeometry(4.5, 2.2, 0.2),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
              );
              holoScreen.position.set(-1.8, 2.5, -d / 2 + 1.2);
              fInteriorGroup.add(holoScreen);
            } else if (f % 3 === 2) {
              [-3.2, 3.2].forEach((rz) => {
                const desk = new THREE.Mesh(
                  new THREE.BoxGeometry(5.2, 1.0, 1.8),
                  new THREE.MeshLambertMaterial({ color: 0x1e293b })
                );
                desk.position.set(-2.0, 0.7, rz);
                fInteriorGroup.add(desk);

                const monitor = new THREE.Mesh(
                  new THREE.BoxGeometry(3.6, 0.9, 0.2),
                  new THREE.MeshBasicMaterial({ color: accentColor })
                );
                monitor.position.set(-2.0, 1.55, rz);
                fInteriorGroup.add(monitor);
              });
            } else {
              const sofa = new THREE.Mesh(
                new THREE.BoxGeometry(5.5, 1.0, 2.0),
                new THREE.MeshLambertMaterial({ color: 0xf43f5e })
              );
              sofa.position.set(-2.2, 0.7, -3.2);
              fInteriorGroup.add(sofa);

              const loungeTable = new THREE.Mesh(
                new THREE.BoxGeometry(3.2, 0.8, 2.2),
                new THREE.MeshLambertMaterial({ color: 0xfacc15 })
              );
              loungeTable.position.set(-2.2, 0.6, 2.2);
              fInteriorGroup.add(loungeTable);
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
        floorLabels: ['1F Civic Chamber', '2F Mayor Offices', '3F Council Archive', '4F Helipad Roof'],
        localElevX: 10.2,
        localElevZ: -6.2,
        wallColor: 0x38bdf8,
        accentColor: 0xfacc15,
        floorColor: 0xe2e8f0,
        buildFloor1ToN: true
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
        floorLabels: ['1F Pro Gear Store', '2F Marker Armory', '3F Tactical Lounge', '4F Helipad Roof'],
        localElevX: 4.5,
        localElevZ: -5.0,
        wallColor: 0xc084fc,
        accentColor: 0xe879f9,
        floorColor: 0x312e81,
        buildFloor1ToN: true
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
        floorLabels: ['1F Espresso Bakery', '2F Tea Lounge', '3F Roastery Lab', '4F Helipad Roof'],
        localElevX: -4.8,
        localElevZ: -4.8,
        wallColor: 0x2dd4bf,
        accentColor: 0x5eead4,
        floorColor: 0xfef3c7,
        buildFloor1ToN: true
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
        floorLabels: ['1F Sculpture Hall', '2F Modern Canvas', '3F Digital Media', '4F Helipad Roof'],
        localElevX: 4.8,
        localElevZ: -5.8,
        wallColor: 0x38bdf8,
        accentColor: 0x38bdf8,
        floorColor: 0xf1f5f9,
        buildFloor1ToN: true
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

      const walkwayToViolet = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.28, 8),
        new THREE.MeshLambertMaterial({ color: 0x6d28d9 })
      );
      walkwayToViolet.position.set(51, 0.14, 6);
      worldGroup.add(walkwayToViolet);

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

      const footballGroup = new THREE.Group();
      const ballSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 14, 14),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      footballGroup.add(ballSphere);

      const ballStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 0.78, 0.78),
        new THREE.MeshLambertMaterial({ color: 0x0f172a })
      );
      footballGroup.add(ballStripe);
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
        new THREE.BoxGeometry(36, 0.24, 14),
        new THREE.MeshLambertMaterial({ color: 0x475569 })
      );
      skateToStadiumPath.position.set(162, 0.12, 80);
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
      const stBallSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.75, 16, 16),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      stadiumBallGroup.add(stBallSphere);

      const stBallStripe = new THREE.Mesh(
        new THREE.BoxGeometry(1.06, 1.06, 1.06),
        new THREE.MeshLambertMaterial({ color: 0x0f172a })
      );
      stadiumBallGroup.add(stBallStripe);
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
        { x: -80, z: -80, w: 26, d: 26, h: 68, pal: 0, door: 'south', title: 'METRO POST & LOGISTICS HQ', sub: 'PARCEL SORTING & EXPRESS MAIL', theme: 'post_office', floorColor: 0xe2e8f0 },
        { x: -25, z: -80, w: 28, d: 24, h: 82, pal: 1, door: 'south', title: 'POLICE HEADQUARTERS', sub: 'PRECINCT 1 & HOLDING CELLS', theme: 'police', floorColor: 0x1e293b },
        { x: 25, z: -80, w: 26, d: 24, h: 74, pal: 2, door: 'south', title: 'FIRE STATION #1', sub: 'LADDER TRUCK & RESCUE BAY', theme: 'fire_station', floorColor: 0x7f1d1d },
        { x: 80, z: -80, w: 28, d: 28, h: 64, pal: 0, door: 'south', title: 'METRO CENTRAL HOSPITAL', sub: 'EMERGENCY & MEDICAL CLINIC', theme: 'hospital', floorColor: 0xe0f2fe },

        { x: -80, z: -22, w: 24, d: 28, h: 76, pal: 4, door: 'east', title: 'METRO CENTRAL LIBRARY', sub: 'BOOK STACKS & READING HALL', theme: 'library', floorColor: 0x78350f },
        { x: -80, z: 24, w: 26, d: 26, h: 62, pal: 1, door: 'east', title: 'SUPERMART GROCERY', sub: 'FRESH AISLES & CHECKOUT', theme: 'supermarket', floorColor: 0xfef9c3 },

        { x: -80, z: 80, w: 28, d: 28, h: 72, pal: 3, door: 'north', title: 'STARLIGHT BOWLING ALLEY', sub: '3 PRO LANES & PIN ARCADE', theme: 'bowling', floorColor: 0x451a03 },
        { x: -25, z: 80, w: 26, d: 24, h: 58, pal: 4, door: 'north', title: 'RETRO PIZZA & DINER', sub: 'BRICK OVEN & DINER BOOTHS', theme: 'diner', floorColor: 0x991b1b },
        { x: 25, z: 80, w: 26, d: 24, h: 66, pal: 0, door: 'north', title: 'LUXURY AUTO SHOWROOM', sub: 'SPORTS CARS & ROADSTERS', theme: 'car_showroom', floorColor: 0x334155 },
        { x: 80, z: 80, w: 28, d: 28, h: 84, pal: 1, door: 'north', title: 'BOTANICAL CONSERVATORY', sub: 'INDOOR GARDEN & KOI POND', theme: 'botanical', floorColor: 0x14532d },

        { x: -135, z: -135, w: 28, d: 28, h: 90, pal: 4, door: 'south', title: 'CHANNEL 1 TV STUDIO', sub: 'NEWS DESK & CAMERAS', theme: 'tv_studio', floorColor: 0x0f172a },
        { x: -80, z: -135, w: 26, d: 26, h: 78, pal: 3, door: 'south', title: 'SCIENCE PLANETARIUM', sub: 'SOLAR SYSTEM & TELESCOPE', theme: 'planetarium', floorColor: 0x090d16 },
        { x: -25, z: -135, w: 30, d: 26, h: 105, pal: 3, door: 'south', title: 'SYMPHONY CONCERT HALL', sub: 'GRAND PIANO & STAGE', theme: 'concert_hall', floorColor: 0x4c0519 },
        { x: 25, z: -135, w: 28, d: 26, h: 96, pal: 4, door: 'south', title: 'CITY PHARMACY & DRUGSTORE', sub: 'MEDICINES & DAILY ESSENTIALS', theme: 'pharmacy', floorColor: 0xecfdf5 },
        { x: 80, z: -135, w: 26, d: 26, h: 74, pal: 1, door: 'south', title: 'METRO CITIZENS BANK & ATM', sub: 'SAVINGS • LOANS • ATM LOBBY', theme: 'gold_bank', floorColor: 0xfef08a },
        { x: 135, z: -135, w: 28, d: 28, h: 98, pal: 0, door: 'south', title: 'OCEAN WORLD AQUARIUM', sub: 'CORAL REEF & SHARK TANK', theme: 'aquarium', floorColor: 0x083344 },

        { x: -135, z: -80, w: 26, d: 28, h: 82, pal: 4, door: 'east', title: 'DRAGON MARTIAL ARTS DOJO', sub: 'TATAMI MATS & DUMMIES', theme: 'dojo', floorColor: 0xd97706 },
        { x: -135, z: -22, w: 28, d: 28, h: 94, pal: 1, door: 'east', title: 'CITY CLOTHING & APPAREL', sub: 'EVERYDAY WEAR & TAILORING', theme: 'fashion', floorColor: 0xfdf2f8 },
        { x: -135, z: 24, w: 26, d: 28, h: 86, pal: 2, door: 'east', title: 'VINYL RECORD & MUSIC SHOP', sub: 'GUITAR WALL & DRUM STAGE', theme: 'record_shop', floorColor: 0x311042 },
        { x: -135, z: 80, w: 26, d: 26, h: 72, pal: 3, door: 'east', title: 'HAPPY PAWS PET SANCTUARY', sub: 'PUPPY PLAYPEN & VET CLINIC', theme: 'pet_shop', floorColor: 0xecfccb },

        { x: 135, z: -80, w: 26, d: 26, h: 80, pal: 1, door: 'west', title: 'METRO BARBER & HAIR SALON', sub: 'HAIRCUTS • STYLING • GROOMING', theme: 'barber_salon', floorColor: 0xfef3c7 },
        { x: 135, z: -28, w: 26, d: 24, h: 68, pal: 3, door: 'west', title: 'SWEET SCOOPS ICE CREAM', sub: 'GELATO BAR & SUNDAE BOOTH', theme: 'ice_cream', floorColor: 0xfce7f3 },
        { x: 135, z: 28, w: 26, d: 24, h: 74, pal: 4, door: 'west', title: 'PRO ESPORTS LAN ARENA', sub: 'RGB GAMING RIGS & STAGE', theme: 'esports', floorColor: 0x111827 },
        { x: 135, z: 80, w: 26, d: 26, h: 88, pal: 0, door: 'west', title: 'INDOOR SKATE & PARKOUR', sub: 'HALFPIPE RAMPS & RAILS', theme: 'skate_park', floorColor: 0x475569 },

        { x: -135, z: 135, w: 28, d: 28, h: 98, pal: 1, door: 'north', title: 'METRO ROYAL HOTEL', sub: 'SUITES, LOBBY & 9F SKY POOL', theme: 'hotel', floorColor: 0x7f1d1d },
        { x: -80, z: 135, w: 26, d: 26, h: 76, pal: 2, door: 'north', title: 'METRO SCIENCE ACADEMY', sub: 'LECTURE HALL & CHALKBOARD', theme: 'school', floorColor: 0x78350f },
        { x: -25, z: 135, w: 28, d: 26, h: 98, pal: 0, door: 'north', title: 'SUPREME COURTHOUSE', sub: 'HIGH BENCH & JURY CHAMBER', theme: 'courthouse', floorColor: 0x451a03 },
        { x: 25, z: 135, w: 28, d: 26, h: 86, pal: 3, door: 'north', title: 'CHAMPION BOXING GYM', sub: 'CENTER RING & HEAVY BAGS', theme: 'boxing_gym', floorColor: 0x1e293b },
        { x: 80, z: 135, w: 26, d: 26, h: 78, pal: 4, door: 'north', title: 'NEON PULSE DJ CLUB', sub: 'LIGHT DANCEFLOOR & TURNTABLES', theme: 'dj_club', floorColor: 0x1e1b4b },
        { x: 135, z: 135, w: 28, d: 28, h: 102, pal: 2, door: 'north', title: 'ROYAL DIAMOND EXCHANGE', sub: 'GEMSTONE CASES & CROWNS', theme: 'jewelry', floorColor: 0x0f172a }
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
          // Indoor Reserve Ladder Truck + Brass Fireman Pole + Gear Lockers
          addBox(5.5, 3.8, 12.5, 0xdc2626, -3.5, 2.2, 0);
          addBox(6.2, 0.6, 13.5, 0xf8fafc, -3.5, 4.4, 0);
          addBox(0.8, 6.2, 0.8, 0xfacc15, 6.0, 3.3, -4, true);
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
          // 3 Polished Maple Bowling Lanes + Glowing Pin Decks & Ball Return Racks
          [-5.5, 0, 5.5].forEach((lx) => {
            addBox(3.4, 0.15, 18.0, 0xfbbf24, lx, 0.28, 1);
            addBox(3.6, 2.4, 1.2, 0x1e1b4b, lx, 1.4, -8.2);
            [[-0.6, -7.2], [0, -7.2], [0.6, -7.2], [-0.3, -6.6], [0.3, -6.6], [0, -6.0]].forEach(([px, pz]) => {
              addBox(0.32, 0.95, 0.32, 0xffffff, lx + px, 0.75, pz, true);
            });
          });
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

      skyscraperSpecs.forEach((sp, idx) => {
        const pal = skyscraperPalettes[sp.pal];
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
          wallColor: pal.roof,
          roofColor: 0x0f172a,
          doorSide: sp.door,
          doorOffset: 0,
          doorWidth: 5.2,
          doorHeight: 4.4,
          doorColor: pal.roof,
          addCeiling: false,
          tag: 'skyscraper_lobby_' + idx
        });

        populateUniqueInterior(bGroup, sp);

        const signTex = createSignTexture(sp.title, sp.sub, pal.base, pal.lit, '#ffffff');
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
        const skyLevels = isMetroRoyalHotel ? 9 : 8;
        const skyFloorLabels = isMetroRoyalHotel
          ? [
              '1F Fountain Lobby',
              '2F Grand Ballroom',
              '3F Dining & Spa',
              '4F Executive Rooms',
              '5F Royal Lounge',
              '6F VIP Suites',
              '7F Starlight Suites',
              '8F Penthouse Floor',
              '9F Rooftop Pool'
            ]
          : [
              '1F Main Hall',
              '2F Operations',
              '3F Research Lab',
              '4F Executive',
              '5F Sky Lounge',
              '6F VIP Suites',
              '7F Starlight Deck',
              '8F Helipad Roof'
            ];
        let elevLX = sp.w / 2 - 3.2;
        let elevLZ = sp.d / 2 - 3.2;
        if (sp.door === 'south') { elevLX = sp.w / 2 - 3.2; elevLZ = -sp.d / 2 + 3.2; }
        else if (sp.door === 'north') { elevLX = sp.w / 2 - 3.2; elevLZ = sp.d / 2 - 3.2; }
        else if (sp.door === 'east') { elevLX = -sp.w / 2 + 3.2; elevLZ = sp.d / 2 - 3.2; }
        else if (sp.door === 'west') { elevLX = sp.w / 2 - 3.2; elevLZ = sp.d / 2 - 3.2; }

        addElevatorAndUpperFloors({
          id: 'sky_' + idx,
          title: (isMetroRoyalHotel ? '🏨 ' : '🏢 ') + sp.title,
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
          wallColor: pal.roof,
          accentColor: pal.roof,
          floorColor: sp.floorColor,
          buildFloor1ToN: true,
          topFloorType: isMetroRoyalHotel ? 'swimming_pool' : 'helipad'
        });

        const topRoofY = (skyLevels - 1) * groundLobbyH;
        const crown = new THREE.Mesh(
          new THREE.BoxGeometry(sp.w + 0.8, 0.6, sp.d + 0.8),
          new THREE.MeshBasicMaterial({ color: pal.roof })
        );
        crown.position.set(sp.x, topRoofY + 0.1, sp.z);
        worldGroup.add(crown);

        mapBuildings.push({ x: sp.x, z: sp.z, w: sp.w, d: sp.d, color: '#475569', label: sp.title });
      });

      const treeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
      const treeLeafMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });
      const plazaTrees = [
        [-38, -34], [38, -34], [-38, 34], [38, 34],
        [-22, 34], [22, 34]
      ];
      plazaTrees.forEach(([tx, tz]) => {
        const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 1.2), treeTrunkMat);
        trunk.position.set(tx, 1.8, tz);
        worldGroup.add(trunk);

        const leaves = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.8, 4.4), treeLeafMat);
        leaves.position.set(tx, 5.6, tz);
        worldGroup.add(leaves);
        shootableMeshes.push(leaves);
        addBoxCollider(tx, tz, 1.6, 1.6, 8, 'tree');
      });
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

      bunkerSpecs.forEach((bk) => {
        const bm = new THREE.Mesh(
          new THREE.BoxGeometry(bk.w, bk.h, bk.d),
          new THREE.MeshLambertMaterial({ color: bk.color })
        );
        bm.position.set(bk.x, bk.h / 2 + 0.2, bk.z);
        arenaGroup.add(bm);
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

      // ==========================================
      // 5. ARTICULATED BOX CHARACTER FACTORY
      // ==========================================
      function createBoxCharacter(options) {
        const {
          skinColor = 0xfde68a,
          shirtColor = 0x06b6d4,
          pantsColor = 0x1e293b,
          visorColor = 0x22d3ee,
          hasGun = true
        } = options || {};

        const root = new THREE.Group();

        const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
        const torsoMat = new THREE.MeshLambertMaterial({ color: shirtColor });
        const limbMat = new THREE.MeshLambertMaterial({ color: pantsColor });
        const armMat = new THREE.MeshLambertMaterial({ color: shirtColor });

        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.28, 1.1, 0);
        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.1, 0.46), limbMat);
        leftLeg.position.y = -0.55;
        leftLegPivot.add(leftLeg);
        root.add(leftLegPivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.28, 1.1, 0);
        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.1, 0.46), limbMat);
        rightLeg.position.y = -0.55;
        rightLegPivot.add(rightLeg);
        root.add(rightLegPivot);

        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.62), torsoMat);
        torso.position.y = 1.75;
        root.add(torso);

        const vest = new THREE.Mesh(
          new THREE.BoxGeometry(1.14, 0.45, 0.66),
          new THREE.MeshBasicMaterial({ color: visorColor })
        );
        vest.position.y = 1.85;
        root.add(vest);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.92, 0.92), headMat);
        head.position.y = 2.92;
        root.add(head);

        const visor = new THREE.Mesh(
          new THREE.BoxGeometry(0.82, 0.28, 0.14),
          new THREE.MeshBasicMaterial({ color: visorColor })
        );
        visor.position.set(0, 2.98, 0.45);
        root.add(visor);

        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.78, 2.3, 0);
        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.15, 0.42), armMat);
        leftArm.position.y = -0.5;
        leftArmPivot.add(leftArm);
        root.add(leftArmPivot);

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.78, 2.3, 0);
        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.15, 0.42), armMat);
        rightArm.position.y = -0.5;
        rightArmPivot.add(rightArm);

        let muzzleNode = null;
        let gunGroup = null;
        if (hasGun) {
          rightArmPivot.rotation.x = -Math.PI / 3;
          gunGroup = new THREE.Group();
          gunGroup.position.set(0, -0.95, 0.35);
          gunGroup.rotation.x = Math.PI / 3;

          const gunBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.28, 0.95),
            new THREE.MeshLambertMaterial({ color: 0x0f172a })
          );
          gunGroup.add(gunBody);

          const gunBarrel = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.12, 0.65),
            new THREE.MeshBasicMaterial({ color: visorColor })
          );
          gunBarrel.position.set(0, 0.04, 0.65);
          gunGroup.add(gunBarrel);

          const hopper = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.34, 0.38),
            new THREE.MeshLambertMaterial({ color: 0xfacc15 })
          );
          hopper.position.set(0, 0.3, -0.05);
          gunGroup.add(hopper);

          muzzleNode = new THREE.Object3D();
          muzzleNode.position.set(0, 0.05, 1.05);
          gunGroup.add(muzzleNode);

          rightArmPivot.add(gunGroup);
        }

        root.add(rightArmPivot);

        return {
          root,
          leftLegPivot,
          rightLegPivot,
          leftArmPivot,
          rightArmPivot,
          torso,
          head,
          torsoMat,
          headMat,
          originalShirtColor: shirtColor,
          originalSkinColor: skinColor,
          muzzleNode,
          gunGroup,
          walkPhase: Math.random() * Math.PI * 2
        };
      }

      function animateBoxCharacter(rig, speed, dt, isAiming) {
        rig.root.rotation.order = 'YXZ';
        rig.root.rotation.x = 0;
        rig.root.rotation.z = 0;
        if (rig.head) rig.head.rotation.x = 0;
        rig.leftArmPivot.rotation.z = 0;
        rig.rightArmPivot.rotation.z = 0;
        rig.leftLegPivot.rotation.z = 0;
        rig.rightLegPivot.rotation.z = 0;
        if (speed > 0.2) {
          rig.walkPhase += dt * speed * 1.4;
          const swing = Math.sin(rig.walkPhase) * 0.65;
          rig.leftLegPivot.rotation.x = swing;
          rig.rightLegPivot.rotation.x = -swing;
          rig.leftArmPivot.rotation.x = -swing * 0.8;
          rig.rightArmPivot.rotation.x = isAiming ? -Math.PI / 2.3 + swing * 0.12 : swing * 0.8;
        } else {
          rig.leftLegPivot.rotation.x *= 0.85;
          rig.rightLegPivot.rotation.x *= 0.85;
          rig.leftArmPivot.rotation.x *= 0.85;
          rig.rightArmPivot.rotation.x = isAiming ? -Math.PI / 2.3 : rig.rightArmPivot.rotation.x * 0.85;
        }
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

      function isPlayerInSwimmingPool(px, py, pz) {
        if (player.inArena || player.inHelicopter || player.activeVehicle) return false;
        if (py < METRO_ROYAL_POOL.deckY - 1.2 || py > METRO_ROYAL_POOL.deckY + 4.2) return false;
        return (
          Math.abs(px - METRO_ROYAL_POOL.worldX) <= METRO_ROYAL_POOL.halfW &&
          Math.abs(pz - METRO_ROYAL_POOL.worldZ) <= METRO_ROYAL_POOL.halfD
        );
      }

      function isPlayerOnMetroRoyalPoolRoof(px, py, pz) {
        if (player.inArena || player.inHelicopter || player.activeVehicle) return false;
        return (
          py >= METRO_ROYAL_POOL.deckY - 1.2 &&
          Math.abs(px - METRO_ROYAL_POOL.bldgX) <= 14.2 &&
          Math.abs(pz - METRO_ROYAL_POOL.bldgZ) <= 14.2
        );
      }

      function animateSwimmingCharacterAt(rig, px, py, pz, yaw, speed, dt, timeSec) {
        rig.root.rotation.order = 'YXZ';
        rig.root.rotation.y = yaw + Math.PI;

        const jumpOffset = Math.max(0, py - METRO_ROYAL_POOL.deckY);

        if (speed > 0.2) {
          rig.walkPhase += dt * speed * 0.95;
          const sp = rig.walkPhase;

          const fwdX = -Math.sin(yaw);
          const fwdZ = -Math.cos(yaw);
          const waveBob = Math.sin(timeSec * 3.8) * 0.04;

          rig.root.position.set(
            px - fwdX * 1.15,
            METRO_ROYAL_POOL.waterSurfaceY - 0.52 + waveBob + jumpOffset,
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
            METRO_ROYAL_POOL.waterSurfaceY - 2.22 + bob + jumpOffset,
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
        ammo: 30,
        maxAmmo: 30,
        splats: 0,
        inArena: false,
        inHelicopter: false,
        activeVehicle: null,
        isSwimming: false,
        swimStrokeTimer: 0,
        currentSpeed: 0,
        firstPerson: false,
        lastShotTime: 0
      };

      // ==========================================
      // 6B. WORKING 3D HELICOPTER (SKY-HAWK CHOPPER)
      // ==========================================
      function createHelicopterModel() {
        const root = new THREE.Group();
        const tiltGroup = new THREE.Group();
        root.add(tiltGroup);

        const skidMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
        [-1.35, 1.35].forEach((sx) => {
          const skid = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 5.4), skidMat);
          skid.position.set(sx, 0.15, 0);
          tiltGroup.add(skid);

          [-1.2, 1.2].forEach((sz) => {
            const strut = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.85, 0.2), skidMat);
            strut.position.set(sx, 0.55, sz);
            tiltGroup.add(strut);
          });
        });

        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
        const trimMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const glassMat = new THREE.MeshLambertMaterial({
          color: 0xbae6fd,
          transparent: true,
          opacity: 0.48
        });

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 3.8), bodyMat);
        cabin.position.set(0, 1.65, 0);
        tiltGroup.add(cabin);

        const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.35, 3.85), trimMat);
        stripe.position.set(0, 1.45, 0);
        tiltGroup.add(stripe);

        const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.45, 1.45, 1.65), glassMat);
        windshield.position.set(0, 1.68, -1.75);
        tiltGroup.add(windshield);

        const tailBoom = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 4.6), bodyMat);
        tailBoom.position.set(0, 1.85, 3.8);
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
      function createGroundVehicleModel(type) {
        const root = new THREE.Group();
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
        const glassMat = new THREE.MeshLambertMaterial({
          color: 0xbae6fd,
          transparent: true,
          opacity: 0.6
        });
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

        const isTruck = type === 'fire_engine' || type === 'ambulance';
        const chassisW = isTruck ? 3.2 : 2.6;
        const chassisL = type === 'fire_engine' ? 7.8 : (type === 'ambulance' ? 6.2 : 4.8);

        const wheelZ = chassisL * 0.32;
        const wheelX = chassisW * 0.5;
        [[-wheelX, -wheelZ], [wheelX, -wheelZ], [-wheelX, wheelZ], [wheelX, wheelZ]].forEach(([wx, wz]) => {
          const wMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.38, 12), wheelMat);
          wMesh.rotation.z = Math.PI / 2;
          wMesh.position.set(wx, 0.52, wz);
          root.add(wMesh);
        });

        let sirenLeft = null;
        let sirenRight = null;

        if (type === 'taxi') {
          const yellowMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
          const body = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 1.0, chassisL), yellowMat);
          body.position.y = 0.95;
          root.add(body);

          const cabin = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.3, 0.95, 2.5), yellowMat);
          cabin.position.set(0, 1.85, 0.15);
          root.add(cabin);

          const wind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.2, 0.78, 2.6), glassMat);
          wind.position.set(0, 1.85, 0.15);
          root.add(wind);

          const taxiSign = new THREE.Mesh(
            new THREE.BoxGeometry(0.95, 0.32, 0.42),
            new THREE.MeshBasicMaterial({ color: 0xfef08a })
          );
          taxiSign.position.set(0, 2.45, 0.1);
          root.add(taxiSign);
        } else if (type === 'police') {
          const blackMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
          const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
          const body = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 1.0, chassisL), blackMat);
          body.position.y = 0.95;
          root.add(body);

          const doors = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.06, 0.85, 2.2), whiteMat);
          doors.position.set(0, 0.98, 0);
          root.add(doors);

          const cabin = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.3, 0.95, 2.5), whiteMat);
          cabin.position.set(0, 1.85, 0.15);
          root.add(cabin);

          const wind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.2, 0.78, 2.6), glassMat);
          wind.position.set(0, 1.85, 0.15);
          root.add(wind);

          sirenLeft = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          sirenLeft.position.set(-0.42, 2.45, 0.1);
          root.add(sirenLeft);

          sirenRight = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.25, 0.35), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
          sirenRight.position.set(0.42, 2.45, 0.1);
          root.add(sirenRight);
        } else if (type === 'ambulance') {
          const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
          const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const cab = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 2.1, 2.2), whiteMat);
          cab.position.set(0, 1.45, -1.9);
          root.add(cab);

          const wind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.2, 0.85, 0.2), glassMat);
          wind.position.set(0, 1.85, -3.02);
          root.add(wind);

          const box = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.2, 2.55, 3.9), whiteMat);
          box.position.set(0, 1.7, 1.1);
          root.add(box);

          const stripe = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.28, 0.38, 3.92), redMat);
          stripe.position.set(0, 1.4, 1.1);
          root.add(stripe);

          [-1, 1].forEach((side) => {
            const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.32), redMat);
            vBar.position.set(side * (chassisW / 2 + 0.15), 2.15, 1.1);
            root.add(vBar);
            const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 1.0), redMat);
            hBar.position.set(side * (chassisW / 2 + 0.15), 2.15, 1.1);
            root.add(hBar);
          });

          sirenLeft = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.38), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          sirenLeft.position.set(-0.55, 2.65, -2.2);
          root.add(sirenLeft);

          sirenRight = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.38), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          sirenRight.position.set(0.55, 2.65, -2.2);
          root.add(sirenRight);
        } else if (type === 'fire_engine') {
          const redMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
          const silverMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
          const body = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 2.2, chassisL), redMat);
          body.position.set(0, 1.5, 0);
          root.add(body);

          const wind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.25, 0.9, 0.2), glassMat);
          wind.position.set(0, 1.95, -chassisL / 2 - 0.02);
          root.add(wind);

          const ladder = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 6.2), silverMat);
          ladder.position.set(0, 2.8, 0.5);
          root.add(ladder);

          sirenLeft = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.38), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          sirenLeft.position.set(-0.65, 2.75, -3.1);
          root.add(sirenLeft);

          sirenRight = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.38), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          sirenRight.position.set(0.65, 2.75, -3.1);
          root.add(sirenRight);
        }

        [-chassisW * 0.34, chassisW * 0.34].forEach((lx) => {
          const hl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.12), headlightMat);
          hl.position.set(lx, 0.95, -chassisL / 2 - 0.04);
          root.add(hl);

          const tl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.12), taillightMat);
          tl.position.set(lx, 0.95, chassisL / 2 + 0.04);
          root.add(tl);
        });

        return { root, sirenLeft, sirenRight };
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
        }
      ];

      driveableVehicles.forEach((v) => {
        v.model = createGroundVehicleModel(v.type);
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
        { x: 71, y: 36.4, z: 6, r: 3.5, speed: 2.3, shirt: 0xe879f9, visor: 0xf5d0fe }
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

      function updateHUD() {
        elHpValue.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
        elHpBar.style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;
        elAmmoValue.textContent = `${player.ammo} / ${player.maxAmmo}`;
        elPlayerSplats.textContent = String(player.splats);
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
        if (now - player.lastShotTime < 150) return;
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
              'btn-map-tp-pool'
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

        // 4. Gameplay & Screen Feature Keyboard Shortcuts (No cursor needed!)
        if (code === 'Space') {
          if (player.isSwimming) {
            player.vy = 10.5;
            SoundFX.playSplash();
            spawnWaterSplash(player.x, METRO_ROYAL_POOL.waterSurfaceY, player.z, 12);
          } else if (!player.inHelicopter && Math.abs(player.vy) < 0.05) {
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
          if (!player.inArena && distToGateBtn < 7.5) {
            startPaintballFightTeleport();
          } else if (!player.inArena && getNearestGroundVehicle(player.x, player.y, player.z)) {
            enterGroundVehicle(getNearestGroundVehicle(player.x, player.y, player.z));
          } else if (!player.inArena && canPlayerBoardOrSummonHeli()) {
            boardOrSummonHelicopter();
          } else if (!player.inArena && nearestArcadeCabinet) {
            openArcadeCabinetModal(nearestArcadeCabinet);
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
      btnAudio.addEventListener('click', () => {
        SoundFX.enabled = !SoundFX.enabled;
        if (!SoundFX.enabled) SoundFX.stopContinuousSiren();
        btnAudio.textContent = SoundFX.enabled ? '🔊 SFX On' : '🔇 SFX Muted';
      });

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
          if (player.isSwimming) {
            player.vy = 10.5;
            SoundFX.playSplash();
            spawnWaterSplash(player.x, METRO_ROYAL_POOL.waterSurfaceY, player.z, 14);
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
        playerRig.leftLegPivot.rotation.x = -Math.PI / 2;
        playerRig.rightLegPivot.rotation.x = -Math.PI / 2;
        playerRig.leftArmPivot.rotation.x = -Math.PI / 3;
        playerRig.rightArmPivot.rotation.x = -Math.PI / 3;
        playerRig.leftArmPivot.rotation.z = 0;
        playerRig.rightArmPivot.rotation.z = 0;
      }

      function restoreStandingPlayerRig() {
        scene.add(playerRig.root);
        playerRig.root.scale.set(1, 1, 1);
        playerRig.root.rotation.order = 'YXZ';
        playerRig.root.rotation.set(0, player.yaw + Math.PI, 0);
        playerRig.root.position.set(player.x, player.y, player.z);
        playerRig.leftLegPivot.rotation.x = 0;
        playerRig.rightLegPivot.rotation.x = 0;
        playerRig.leftArmPivot.rotation.x = 0;
        playerRig.rightArmPivot.rotation.x = 0;
      }

      function isPlayerOnAnyTopHelipad() {
        if (player.inArena || player.inHelicopter) return null;
        const b = getBuildingAtXZ(player.x, player.z);
        if (!b || b.id === 'violet_tower' || b.topFloorType === 'swimming_pool') return null;
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
        moveLeft: false,
        moveRight: false
      };

      function initArcadeState(mode) {
        arcadeGame.mode = mode;
        arcadeGame.score = 0;
        arcadeGame.paddleX = 152;
        arcadeGame.ballX = 190;
        arcadeGame.ballY = 190;
        arcadeGame.ballVX = 3.5 * (Math.random() > 0.5 ? 1 : -1);
        arcadeGame.ballVY = -3.7;
        arcadeGame.bricks = [];
        arcadeGame.aliens = [];
        arcadeGame.lasers = [];
        arcadeScoreVal.textContent = '0';

        if (mode === 'breaker') {
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
        } else if (mode === 'invaders') {
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 6; c++) {
              arcadeGame.aliens.push({
                x: 36 + c * 52,
                y: 34 + r * 26,
                w: 28,
                h: 16,
                dir: 1,
                alive: true
              });
            }
          }
        }
      }

      function openArcadeCabinetModal(cab) {
        arcadeGame.open = true;
        document.getElementById('arcade-modal-heading').textContent = cab ? cab.title : 'Neon Brick Breaker DX';
        initArcadeState(cab ? cab.game : 'breaker');
        arcadeModal.classList.remove('hidden');
        arcadeModal.classList.add('flex');
        SoundFX.playFanfare();
      }

      function closeArcadeCabinetModal() {
        arcadeGame.open = false;
        arcadeModal.classList.add('hidden');
        arcadeModal.classList.remove('flex');
      }

      document.getElementById('btn-open-arcade').addEventListener('click', () => {
        openArcadeCabinetModal(nearestArcadeCabinet);
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

      const btnArcL = document.getElementById('btn-arcade-left');
      const btnArcR = document.getElementById('btn-arcade-right');
      btnArcL.addEventListener('pointerdown', () => { arcadeGame.moveLeft = true; });
      btnArcL.addEventListener('pointerup', () => { arcadeGame.moveLeft = false; });
      btnArcR.addEventListener('pointerdown', () => { arcadeGame.moveRight = true; });
      btnArcR.addEventListener('pointerup', () => { arcadeGame.moveRight = false; });

      document.getElementById('btn-arcade-fire').addEventListener('click', () => {
        if (arcadeGame.mode === 'invaders') {
          arcadeGame.lasers.push({ x: arcadeGame.paddleX + arcadeGame.paddleW / 2, y: 225 });
          SoundFX.playShoot();
        } else {
          arcadeGame.ballVY = -Math.abs(arcadeGame.ballVY);
        }
      });

      function updateArcadeMiniGame() {
        if (!arcadeGame.open) return;
        const W = arcadeCanvas.width;
        const H = arcadeCanvas.height;

        if (arcadeGame.moveLeft || keys['ArrowLeft'] || keys['KeyA']) {
          arcadeGame.paddleX = Math.max(8, arcadeGame.paddleX - 5.5);
        }
        if (arcadeGame.moveRight || keys['ArrowRight'] || keys['KeyD']) {
          arcadeGame.paddleX = Math.min(W - arcadeGame.paddleW - 8, arcadeGame.paddleX + 5.5);
        }

        arcadeCtx.fillStyle = '#090d16';
        arcadeCtx.fillRect(0, 0, W, H);

        arcadeCtx.fillStyle = '#22d3ee';
        arcadeCtx.fillRect(arcadeGame.paddleX, H - 22, arcadeGame.paddleW, 10);

        if (arcadeGame.mode === 'breaker' || arcadeGame.mode === 'pong') {
          arcadeGame.ballX += arcadeGame.ballVX;
          arcadeGame.ballY += arcadeGame.ballVY;

          if (arcadeGame.ballX < 8 || arcadeGame.ballX > W - 8) arcadeGame.ballVX *= -1;
          if (arcadeGame.ballY < 12) {
            if (arcadeGame.mode === 'pong') {
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

          if (arcadeGame.mode === 'breaker') {
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
        } else if (arcadeGame.mode === 'invaders') {
          let hitEdge = false;
          arcadeGame.aliens.forEach((al) => {
            if (!al.alive) return;
            al.x += al.dir * 1.1;
            if (al.x < 12 || al.x + al.w > W - 12) hitEdge = true;
            arcadeCtx.fillStyle = '#10b981';
            arcadeCtx.fillRect(al.x, al.y, al.w, al.h);
          });
          if (hitEdge) {
            arcadeGame.aliens.forEach((al) => {
              al.dir *= -1;
              al.y += 6;
            });
          }
          arcadeGame.lasers.forEach((ls) => {
            ls.y -= 6.5;
            arcadeCtx.fillStyle = '#f472b6';
            arcadeCtx.fillRect(ls.x - 2, ls.y, 4, 10);
            arcadeGame.aliens.forEach((al) => {
              if (al.alive && ls.x >= al.x && ls.x <= al.x + al.w && ls.y >= al.y && ls.y <= al.y + al.h) {
                al.alive = false;
                ls.y = -50;
                arcadeGame.score += 75;
                arcadeScoreVal.textContent = String(arcadeGame.score);
                SoundFX.playSplat();
              }
            });
          });
          arcadeGame.lasers = arcadeGame.lasers.filter((l) => l.y > 0);
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

          const lerpFactor = Math.min(1.0, dt * 10.0);
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
        const xp = player.splats * 25 + rooftopFootball.scoreBlue * 90;
        const lvl = Math.floor(xp / 200) + 1;
        const coins = 250 + player.splats * 15 + rooftopFootball.scoreBlue * 50;
        document.getElementById('profile-level-val').textContent = String(lvl);
        document.getElementById('profile-xp-val').textContent = String(xp);
        document.getElementById('profile-coins-val').textContent = String(coins);
        profileModal.classList.remove('hidden');
        profileModal.classList.add('flex');
      });

      function closeProfileModal() {
        profileModal.classList.add('hidden');
        profileModal.classList.remove('flex');
      }
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
        const maxWorldX = 375;
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
          ctx.fillText('Outskirts Paintball Arena', toMapX(ARENA_CENTER.x - 38), toMapY(ARENA_CENTER.z - 50));
        }
      }

      // ==========================================
      // 15. MAIN GAME UPDATE & ANIMATION LOOP (OPTIMIZED FOR 60 FPS)
      // ==========================================
      let lastFrameTime = performance.now();
      let minimapRedrawTimer = 0;

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

        curSunColor.copy(daySunColor).lerp(nightMoonColor, b);
        sunLight.color.copy(curSunColor);
        sunLight.intensity = 0.95 * (1 - b) + 0.24 * b;
        hemiLight.intensity = 0.45 * (1 - b) + 0.22 * b;

        nightSkyGroup.visible = b > 0.12;

        if (b > 0.35) {
          streetLightBulbMat.color.setHex(0xfef08a);
          streetLightGroundHaloMat.opacity = 0.28 * b;
        } else {
          streetLightBulbMat.color.setHex(0xdbeafe);
          streetLightGroundHaloMat.opacity = 0.0;
        }

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

        const baseNightAmbient = playerInsideBuilding ? 0.58 : 0.30;
        ambientLight.intensity = 0.68 * (1 - b) + baseNightAmbient * b;

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
        beaconRing.position.y = 11.5 + Math.sin(timeSec * 3) * 0.8;
        gateButtonMesh.position.y = 1.62 + Math.sin(timeSec * 5) * 0.06;

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

          let nextHeliX = Math.max(-160, Math.min(365, oldHeliX + helicopter.vx * dt));
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
          helicopter.model.tiltGroup.rotation.x = -flyFwd * 0.14;
          helicopter.model.tiltGroup.rotation.z = -flyRight * 0.14;

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
          SoundFX.updateContinuousSiren(timeSec, anySirenActive.type);
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

          const accel = throttle !== 0 ? throttle * 26.0 : 0;
          veh.speed += accel * dt;
          if (throttle === 0) {
            veh.speed *= Math.pow(0.18, dt);
          }
          veh.speed = Math.max(-veh.maxSpeed * 0.45, Math.min(veh.maxSpeed, veh.speed));

          if (Math.abs(veh.speed) > 0.4) {
            const dirSign = veh.speed >= 0 ? 1 : -1;
            veh.yaw += steer * 1.95 * dirSign * dt;
            player.yaw = veh.yaw;
          }

          const vFwdX = -Math.sin(veh.yaw);
          const vFwdZ = -Math.cos(veh.yaw);
          const nextVX = Math.max(-150, Math.min(360, veh.x + vFwdX * veh.speed * dt));
          const nextVZ = Math.max(-150, Math.min(150, veh.z + vFwdZ * veh.speed * dt));
          const resolvedV = resolveXZCollisions(nextVX, nextVZ, 1.75, 0);
          veh.x = resolvedV.x;
          veh.z = resolvedV.z;

          veh.model.root.position.set(veh.x, 0, veh.z);
          veh.model.root.rotation.y = veh.yaw;

          player.x = veh.x;
          player.y = 0.5;
          player.z = veh.z;

          if (elVehicleSpeed) {
            const kmh = Math.round(Math.abs(veh.speed) * 3.2);
            elVehicleSpeed.textContent = `Speed: ${kmh} km/h • WASD Drive • H Siren/Horn • E Exit`;
          }
        } else if (!player.inArena && !player.inHelicopter) {
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
        const moveSpeed = player.isSwimming
          ? (isSprinting ? 10.2 : 7.2)
          : (isSprinting ? 16.5 : 11.5);

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

        if (!player.inHelicopter && !player.activeVehicle) {
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
          player.x = Math.max(-152, Math.min(365, player.x));
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
            if (inThisShaft) {
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
        const currentBldg = (!player.inHelicopter && !player.activeVehicle) ? getBuildingAtXZ(player.x, player.z) : null;
        if (currentBldg) {
          const inShaft =
            Math.abs(player.x - currentBldg.elevX) < 2.4 &&
            Math.abs(player.z - currentBldg.elevZ) < 2.4;
          if (inShaft) {
            supportFloorY = currentBldg.currentY + 0.4;
          } else {
            for (let f = currentBldg.numLevels - 1; f >= 0; f--) {
              const slabY = f * currentBldg.floorHeight + 0.4;
              if (player.y >= slabY - 1.5) {
                supportFloorY = slabY;
                break;
              }
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

        if (!player.inHelicopter && !player.activeVehicle) {
          player.y += player.vy * dt;
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
        }

        if (playerRig.gunGroup) {
          playerRig.gunGroup.visible = player.inArena;
        }

        updatePoolParticles(dt);
        const inPoolWaterNow = isPlayerInSwimmingPool(player.x, player.y, player.z);
        if (inPoolWaterNow && !player.isSwimming) {
          player.isSwimming = true;
          SoundFX.playSplash();
          spawnWaterSplash(player.x, METRO_ROYAL_POOL.waterSurfaceY, player.z, 14);
          pushFeedMessage('🏊 Swimming in Metro Royal 9F Sky Pool! WASD to swim, Shift for fast crawl, Space to splash jump!', 'border-l-cyan-400 text-cyan-200');
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
        const elSwimmingStatus = document.getElementById('swimming-hud-status');
        const elBtnPoolSplash = document.getElementById('btn-pool-splash');
        if (elSwimmingHud) {
          if (player.isSwimming || isPlayerOnMetroRoyalPoolRoof(player.x, player.y, player.z)) {
            elSwimmingHud.classList.remove('hidden');
            if (player.isSwimming) {
              if (elSwimmingStatus) {
                elSwimmingStatus.textContent = horizontalSpeed > 0.2
                  ? '🏊 Freestyle Swimming • Shift Fast Crawl • Space Dolphin Jump'
                  : '💧 Treading Water in 9F Sky Pool • WASD to Swim';
              }
              if (elBtnPoolSplash) elBtnPoolSplash.textContent = '💦 Dolphin Jump [Space]';
            } else {
              if (elSwimmingStatus) {
                elSwimmingStatus.textContent = '🏖️ 9F Poolside Sun Deck • Walk into the Water or Click Dive!';
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
            spawnWaterSplash(player.x, METRO_ROYAL_POOL.waterSurfaceY, player.z, 4);
          }
        }

        if (player.inHelicopter) {
          applySeatedPoseToPlayerRig();
        } else if (player.activeVehicle) {
          applySeatedPoseToPlayerRig();
        } else if (player.isSwimming) {
          animateSwimmingCharacter(playerRig, horizontalSpeed, dt, timeSec);
        } else {
          playerRig.root.position.set(player.x, player.y, player.z);
          playerRig.root.rotation.order = 'YXZ';
          playerRig.root.rotation.y = player.yaw + Math.PI;
          animateBoxCharacter(playerRig, horizontalSpeed, dt, player.inArena);
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
        if (nearestArcadeCabinet && !arcadeGame.open) {
          elArcadePrompt.classList.remove('hidden');
          elArcadeTitle.textContent = nearestArcadeCabinet.title;
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
              SoundFX.playJump();
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
              pushFeedMessage(`⚽ GOAL in North Net on ${labelName}!`, 'border-l-cyan-400 text-cyan-200');
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
          ball.mesh.rotation.x += ball.vz * dt * 0.65;
          ball.mesh.rotation.z -= ball.vx * dt * 0.65;
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
            SoundFX.playSplat();
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
                SoundFX.playSplat();
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
                SoundFX.playSplat();
                addPaintSplatter(bot.x, 0.22, bot.z, 0, 1, 0, pb.colorHex);
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
                      pushFeedMessage(`🎯 You splattered ${bot.name}! (+1 Blue)`, 'border-l-cyan-400 text-cyan-200');
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
