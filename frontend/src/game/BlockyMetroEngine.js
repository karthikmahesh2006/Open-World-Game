// Complete 3D Open-World Game Engine (Three.js) — Preserves 100% of City, Interiors, Elevators,
// Topmost Helipads, Sky-Hawk Helicopter, Operational Vehicles, 7F Arcade, Rooftop Football & Paintball Arena.
export function initializeBlockyMetroEngine() {
  if (window.__blockyMetroInitialized) return;
  window.__blockyMetroInitialized = true;

      'use strict';

      // ==========================================
      // 1. SYNTHESIZED SOUND ENGINE (Web Audio API)
      // ==========================================
      const SoundFX = {
        ctx: null,
        enabled: true,
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
          osc.type = 'sine';
          osc.frequency.setValueAtTime(190, now);
          osc.frequency.exponentialRampToValueAtTime(480, now + 0.06);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
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
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.55);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);
        },
        playHorn() {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          [380, 475].forEach((freq) => {
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
        playSirenPulse(highTone) {
          if (!this.enabled) return;
          this.init();
          if (!this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(highTone ? 780 : 560, now);
          osc.frequency.linearRampToValueAtTime(highTone ? 640 : 720, now + 0.26);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.28);
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

        const padX = 8;
        const padY = 10;
        const cellW = (c.width - padX * 2) / cols;
        const cellH = (c.height - padY * 2) / rows;

        for (let r = 0; r < rows; r++) {
          for (let col = 0; col < cols; col++) {
            const rand = Math.sin(r * 19.3 + col * 7.7) * 0.5 + 0.5;
            if (rand > 0.28) {
              ctx.fillStyle = rand > 0.65 ? windowLitHex : '#334155';
            } else {
              ctx.fillStyle = '#0f172a';
            }
            ctx.fillRect(
              padX + col * cellW + 3,
              padY + r * cellH + 3,
              cellW - 6,
              cellH - 6
            );
          }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
      }

      function createSignTexture(text, subtext, bgHex, accentHex, textColor) {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 160;
        const ctx = c.getContext('2d');
        ctx.fillStyle = bgHex;
        ctx.fillRect(0, 0, c.width, c.height);

        // Border
        ctx.strokeStyle = accentHex;
        ctx.lineWidth = 10;
        ctx.strokeRect(8, 8, c.width - 16, c.height - 16);

        // Paint splatters on sign
        const colors = ['#ec4899', '#22d3ee', '#a3e635', '#facc15'];
        for (let i = 0; i < 8; i++) {
          ctx.fillStyle = colors[i % colors.length];
          ctx.beginPath();
          ctx.arc(35 + (i * 64) % 450, i % 2 === 0 ? 28 : 132, 12 + (i % 3) * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = textColor || '#ffffff';
        ctx.font = '900 40px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, c.width / 2, subtext ? 64 : 80);

        if (subtext) {
          ctx.fillStyle = accentHex;
          ctx.font = '800 24px Inter, sans-serif';
          ctx.fillText(subtext, c.width / 2, 114);
        }
        return new THREE.CanvasTexture(c);
      }

      function createClockTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 256);

        ctx.beginPath();
        ctx.arc(128, 128, 110, 0, Math.PI * 2);
        ctx.fillStyle = '#fef3c7';
        ctx.fill();
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#d97706';
        ctx.stroke();

        // Hour ticks
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 6;
        for (let i = 0; i < 12; i++) {
          const ang = (i * Math.PI) / 6;
          ctx.beginPath();
          ctx.moveTo(128 + Math.cos(ang) * 82, 128 + Math.sin(ang) * 82);
          ctx.lineTo(128 + Math.cos(ang) * 98, 128 + Math.sin(ang) * 98);
          ctx.stroke();
        }

        // Hands
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
      // 3. THREE.JS SCENE, CAMERA & RENDERER SETUP
      // ==========================================
      const canvas = document.getElementById('webgl-canvas');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x7dd3fc);
      scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0022);

      const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 750);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.68);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 0.45);
      scene.add(hemiLight);

      const sunLight = new THREE.DirectionalLight(0xfffbeb, 0.95);
      sunLight.position.set(95, 160, 85);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
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
      const groundMat = new THREE.MeshLambertMaterial({ color: 0x3f6212 }); // Rich grass on outskirts
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
        // North-South Road
        const nsRoad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.24, 308), roadMat);
        nsRoad.position.set(rc, 0.12, 0);
        nsRoad.receiveShadow = true;
        worldGroup.add(nsRoad);

        // Center dashed line
        const nsLine = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.26, 304), stripeMat);
        nsLine.position.set(rc, 0.13, 0);
        worldGroup.add(nsLine);

        // East-West Road
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

      // ------------------------------------------
      // 4.05 CITY STREETLIGHTS, INDOOR POINT LIGHTS & DAY/NIGHT SYSTEM
      // (Automatic 25-Min Day / 15-Min Night + Manual Switch)
      // ------------------------------------------
      const DAY_DURATION_SEC = 25 * 60;   // 25 minutes (1500 seconds)
      const NIGHT_DURATION_SEC = 15 * 60; // 15 minutes (900 seconds)

      const dayNightState = {
        isNight: false,
        phaseRemainingSec: DAY_DURATION_SEC,
        blend: 0.0, // 0.0 = Day, 1.0 = Night
        lastHudSecond: -1
      };

      // Shared materials for all city streetlights so they switch on/off smoothly
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
        pole.castShadow = true;
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

      // Place Streetlights along the North-South and East-West Avenues
      const slAvenueOffsets = [-138, -82, -24, 24, 82, 138];
      roadCoords.forEach((rc) => {
        slAvenueOffsets.forEach((pos) => {
          // Along North-South avenue (x = rc ± 9.2, z = pos)
          addStreetLight(rc - 9.2, pos, 0);           // West curb pointing East (+X)
          addStreetLight(rc + 9.2, pos, Math.PI);     // East curb pointing West (-X)
          // Along East-West avenue (x = pos, z = rc ± 9.2)
          if (Math.abs(pos - rc) > 14) {
            addStreetLight(pos, rc - 9.2, -Math.PI / 2); // North curb pointing South (+Z)
            addStreetLight(pos, rc + 9.2, Math.PI / 2);  // South curb pointing North (-Z)
          }
        });
      });

      // Place Streetlights around the Central Town Hall Plaza & Outskirts Highway
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

      // Active PointLight Pool for Indoor Building Illumination & Nearest Streetlights
      const indoorPointLightA = new THREE.PointLight(0xfffbeb, 1.35, 42);
      indoorPointLightA.position.set(0, 6.2, -16); // Starts inside Town Hall
      scene.add(indoorPointLightA);

      const indoorPointLightB = new THREE.PointLight(0xfff7ed, 1.15, 36);
      indoorPointLightB.position.set(33, 5.2, 6); // Starts inside Paintball Shop
      scene.add(indoorPointLightB);

      const activeStreetPointLight = new THREE.PointLight(0xfef08a, 0.0, 38);
      activeStreetPointLight.position.set(0, 7.2, 20);
      scene.add(activeStreetPointLight);

      // ------------------------------------------
      // 4A. INTERACTIVE DOORS & MULTI-FLOOR COLLISION HELPERS
      // ------------------------------------------
      const interactiveDoors = [];
      const multiFloorBuildings = [];

      // Creates a 3D Moving Elevator Cab, Shaft, Call Pads, and Walkable Upper Floors for any building
      // ==========================================
      // ONE-WAY BUILDING WALLS (OPAQUE OUTSIDE, SOLID WALL + TRANSPARENT WINDOWS INSIDE)
      // & INTERIOR BUILDING CEILING LIGHTS
      // ==========================================
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
        c.width = 512;
        c.height = 256;
        const ctx = c.getContext('2d');
        const rgb = hexToRgbObj(wallColorHex);

        // 100% Opaque Solid Exterior Cladding
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(0, 0, 512, 256);

        // Architectural horizontal spandrel bands (top & bottom)
        const darkR = Math.max(12, Math.floor(rgb.r * 0.55));
        const darkG = Math.max(16, Math.floor(rgb.g * 0.55));
        const darkB = Math.max(24, Math.floor(rgb.b * 0.55));
        ctx.fillStyle = `rgb(${darkR}, ${darkG}, ${darkB})`;
        ctx.fillRect(0, 0, 512, 44);
        ctx.fillRect(0, 194, 512, 62);

        // Vertical structural mullions
        const paneCenters = [73, 195, 317, 439];
        const paneW = 88;
        const paneH = 132;
        const paneY = 52;

        paneCenters.forEach((cx) => {
          const px = cx - paneW / 2;
          // Opaque dark architectural window frame
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px - 6, paneY - 6, paneW + 12, paneH + 12);

          // Opaque reflective exterior glass (cannot be seen through from outside!)
          const grad = ctx.createLinearGradient(px, paneY, px + paneW, paneY + paneH);
          grad.addColorStop(0, '#1e293b');
          grad.addColorStop(0.45, '#1e3a8a');
          grad.addColorStop(0.55, '#38bdf8');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(px, paneY, paneW, paneH);

          // Opaque window muntin bars
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px, paneY + paneH / 2 - 3, paneW, 6);
          ctx.fillRect(cx - 3, paneY, 6, paneH);
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
        // Blend wallColor with warm bright interior plaster so indoor walls are solid and well-defined
        const inR = Math.min(245, Math.floor(rgb.r * 0.45 + 135));
        const inG = Math.min(245, Math.floor(rgb.g * 0.45 + 140));
        const inB = Math.min(250, Math.floor(rgb.b * 0.45 + 150));

        // 1. Fill entire wall with 100% OPAQUE interior wall surface (alpha = 1.0)
        ctx.fillStyle = `rgba(${inR}, ${inG}, ${inB}, 1.0)`;
        ctx.fillRect(0, 0, 512, 256);

        // 2. Solid opaque interior wainscoting & crown trim
        ctx.fillStyle = 'rgba(30, 41, 59, 1.0)';
        ctx.fillRect(0, 0, 512, 42);
        ctx.fillRect(0, 194, 512, 62);
        ctx.fillStyle = 'rgba(71, 85, 105, 1.0)';
        ctx.fillRect(0, 188, 512, 8);

        // 3. Carve out ONLY the window panes so ONLY windows are transparent from inside!
        const paneCenters = [73, 195, 317, 439];
        const paneW = 88;
        const paneH = 132;
        const paneY = 52;

        paneCenters.forEach((cx) => {
          const px = cx - paneW / 2;
          // Opaque dark window frame around the glass cutout
          ctx.fillStyle = 'rgba(15, 23, 42, 1.0)';
          ctx.fillRect(px - 6, paneY - 6, paneW + 12, paneH + 12);

          // Clear the glass opening and apply subtle clear-glass tint (alpha = 0.15)
          ctx.clearRect(px, paneY, paneW, paneH);
          ctx.fillStyle = 'rgba(186, 230, 253, 0.15)';
          ctx.fillRect(px, paneY, paneW, paneH);

          // Solid opaque window cross-mullions inside the window
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

      // Helper to add a One-Way Window Wall segment:
      // - From OUTSIDE: 100% opaque solid facade (FrontSide facing outward).
      // - From INSIDE: solid interior wall where ONLY the window panes are transparent (FrontSide facing inward).
      function addOneWayWallSegment(targetGroup, lx, ly, lz, sw, sh, sd, wallDir, wallColorHex, recordShootable = true) {
        const extMat = getExteriorFacadeMaterial(wallColorHex);
        const intMat = getInteriorWindowWallMaterial(wallColorHex);

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
          targetGroup.add(intMesh);
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
          targetGroup.add(intMesh);
        }
      }

      // Helper to add 3D Glowing Ceiling Light Fixtures inside every building floor
      function addInteriorCeilingLights(targetGroup, w, d, ceilingY) {
        const offsetsX = w >= 20 ? [-w * 0.24, w * 0.24] : [0];
        const offsetsZ = d >= 20 ? [-d * 0.24, d * 0.24] : [0];

        offsetsX.forEach((ox) => {
          offsetsZ.forEach((oz) => {
            const fixtureGroup = new THREE.Group();
            fixtureGroup.position.set(ox, ceilingY, oz);

            const housing = new THREE.Mesh(interiorCeilingFixtureGeo, interiorCeilingHousingMat);
            fixtureGroup.add(housing);

            const diffuser = new THREE.Mesh(interiorCeilingDiffuserGeo, interiorCeilingDiffuserMat);
            diffuser.position.y = -0.06;
            fixtureGroup.add(diffuser);

            const halo = new THREE.Mesh(interiorLightHaloGeo, interiorLightHaloMat);
            halo.position.y = -0.11;
            halo.rotation.x = Math.PI / 2;
            fixtureGroup.add(halo);

            targetGroup.add(fixtureGroup);
          });
        });
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

        // 1. Glowing Elevator Shaft Pillars & Call Pads on every level
        const shaftGroup = new THREE.Group();
        shaftGroup.position.set(localElevX, 0, localElevZ);
        group.add(shaftGroup);

        const totalElevH = (numLevels - 1) * floorHeight + 4.8;
        const shaftGlass = new THREE.Mesh(
          new THREE.BoxGeometry(4.4, totalElevH, 4.4),
          new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.18 })
        );
        shaftGlass.position.y = totalElevH / 2;
        shaftGroup.add(shaftGlass);

        // Glowing Neon Guide Rails on the 4 corners of the Elevator Shaft
        [[-2.1, -2.1], [2.1, -2.1], [-2.1, 2.1], [2.1, 2.1]].forEach(([rx, rz]) => {
          const rail = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, totalElevH, 0.18),
            new THREE.MeshBasicMaterial({ color: accentColor })
          );
          rail.position.set(rx, totalElevH / 2, rz);
          shaftGroup.add(rail);
        });

        // 2. Build Upper Floor Slabs, Windowed Walls, and Unique Floor Interiors (Levels 1..numLevels-1)
        if (buildFloor1ToN) {
          for (let f = 1; f < numLevels; f++) {
            const fy = f * floorHeight;
            const isTopFloor = f === numLevels - 1;
            const fGroup = new THREE.Group();
            fGroup.position.y = fy;
            group.add(fGroup);

            // Walkable Floor Slab with a clean visual border
            const slab = new THREE.Mesh(
              new THREE.BoxGeometry(w - 0.5, 0.36, d - 0.5),
              new THREE.MeshLambertMaterial({ color: isTopFloor ? 0x1e293b : (floorColor || 0x334155) })
            );
            slab.position.y = 0.18;
            slab.receiveShadow = true;
            fGroup.add(slab);

            // Elevator Landing Call Pad on this floor
            const callPad = new THREE.Mesh(
              new THREE.BoxGeometry(4.2, 0.42, 4.2),
              new THREE.MeshBasicMaterial({ color: accentColor })
            );
            callPad.position.set(localElevX, 0.21, localElevZ);
            fGroup.add(callPad);

            // Perimeter walls on upper floors:
            // - Top floor (Helipad Roof): low safety parapet railing
            // - Indoor floors (2F..7F): 100% opaque from outside, solid wall with transparent windows from inside + ceiling lights!
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
              addOneWayWallSegment(fGroup, 0, wallH / 2, -d / 2, w, wallH, 0.3, 'north', wallColor, false);
              addOneWayWallSegment(fGroup, 0, wallH / 2, d / 2, w, wallH, 0.3, 'south', wallColor, false);
              addOneWayWallSegment(fGroup, -w / 2, wallH / 2, 0, 0.3, wallH, d, 'west', wallColor, false);
              addOneWayWallSegment(fGroup, w / 2, wallH / 2, 0, 0.3, wallH, d, 'east', wallColor, false);
              addInteriorCeilingLights(fGroup, w, d, wallH - 0.22);
            }

            // Neon exterior floor trim band
            const trim = new THREE.Mesh(
              new THREE.BoxGeometry(w + 0.5, 0.28, d + 0.5),
              new THREE.MeshBasicMaterial({ color: accentColor })
            );
            trim.position.set(0, 0.2, 0);
            fGroup.add(trim);

            // Furnish each upper floor distinctly based on floor index f!
            if (isTopFloor && topFloorType === 'swimming_pool') {
              // =========================================================
              // METRO ROYAL HOTEL ALONE: 9F ROOFTOP SWIMMING POOL OASIS
              // (Helipad removed; well-proportioned 12.6m x 8.6m swimming pool!)
              // =========================================================
              const deckOverlay = new THREE.Mesh(
                new THREE.BoxGeometry(w - 1.2, 0.08, d - 1.2),
                new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
              );
              deckOverlay.position.y = 0.38;
              deckOverlay.receiveShadow = true;
              fGroup.add(deckOverlay);

              // Swimming Pool Basin Dimensions (Not too small, not too big: 12.6m x 8.6m on the 28m x 28m roof)
              const poolX = -1.8;
              const poolZ = 1.6;
              const poolW = 12.6;
              const poolD = 8.6;
              const rimThick = 0.48;
              const rimH = 1.12;

              // Deep Azure Tiled Pool Floor
              const poolFloor = new THREE.Mesh(
                new THREE.BoxGeometry(poolW - 0.4, 0.1, poolD - 0.4),
                new THREE.MeshLambertMaterial({ color: 0x0369a1 })
              );
              poolFloor.position.set(poolX, 0.43, poolZ);
              fGroup.add(poolFloor);

              // 3 Swimmer Lane Lines on the Pool Floor
              [-2.2, 0, 2.2].forEach((lz) => {
                const laneLine = new THREE.Mesh(
                  new THREE.BoxGeometry(poolW - 2.2, 0.04, 0.22),
                  new THREE.MeshBasicMaterial({ color: 0x0f172a })
                );
                laneLine.position.set(poolX, 0.49, poolZ + lz);
                fGroup.add(laneLine);

                // Cyan lane end T-markers
                [-1, 1].forEach((endSign) => {
                  const tMark = new THREE.Mesh(
                    new THREE.BoxGeometry(0.22, 0.05, 0.9),
                    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
                  );
                  tMark.position.set(poolX + endSign * (poolW / 2 - 1.1), 0.49, poolZ + lz);
                  fGroup.add(tMark);
                });
              });

              // Raised White Marble Coping Rim & Cyan Mosaic Inner Liner around the Pool
              const copingMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
              const tileLinerMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

              // North & South Pool Walls
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

                // Underwater Glowing LED Strip
                const ledStrip = new THREE.Mesh(
                  new THREE.BoxGeometry(poolW - 1.2, 0.1, 0.12),
                  new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
                );
                ledStrip.position.set(poolX, 0.68, poolZ + zSign * (poolD / 2 - 0.08));
                fGroup.add(ledStrip);
              });

              // West & East Pool Walls
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

              // Translucent Shimmering Turquoise Pool Water Volume (Deep enough for full swimming & treading water!)
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

              // Chrome Pool Entry Ladder & Shallow Steps on the East edge of the pool
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

              // 3 Poolside Resort Sun Loungers & 2 Shade Umbrellas on the West/North Deck
              const loungerFrameMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
              const loungerCushionMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });
              [
                [-10.4, -0.8],
                [-10.4, 2.2],
                [-10.4, 5.2]
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
                [-10.4, 0.7, 0xf43f5e],
                [-10.4, 3.7, 0x06b6d4]
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

              // Illuminated Rooftop Pool Signboard on the North Railing
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

              // Dedicated Turquoise Pool PointLight so the Metro Royal Rooftop Pool glows day & night!
              const poolLight = new THREE.PointLight(0x22d3ee, 1.1, 26);
              poolLight.position.set(poolX, 3.2, poolZ);
              fGroup.add(poolLight);
            } else if (isTopFloor) {
              // Topmost Roof Helipad Deck (Open Sky Above — No Floors Above!)
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

              // Bold White 'H' Helipad Marking
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

              // 4 Corner Helipad Landing Beacons
              [[-4.2, -4.2], [4.2, -4.2], [-4.2, 4.2], [4.2, 4.2]].forEach(([bx, bz]) => {
                const beacon = new THREE.Mesh(
                  new THREE.BoxGeometry(0.45, 0.45, 0.45),
                  new THREE.MeshBasicMaterial({ color: 0x22d3ee })
                );
                beacon.position.set(padCenterX + bx, 0.5, bz);
                fGroup.add(beacon);
              });
            } else if (f % 3 === 1) {
              // Executive Suite & Conference Level
              const confTable = new THREE.Mesh(
                new THREE.BoxGeometry(Math.min(7.5, w * 0.42), 1.05, 3.0),
                new THREE.MeshLambertMaterial({ color: accentColor })
              );
              confTable.position.set(-1.8, 0.72, 0);
              fGroup.add(confTable);

              const holoScreen = new THREE.Mesh(
                new THREE.BoxGeometry(4.5, 2.2, 0.2),
                new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
              );
              holoScreen.position.set(-1.8, 2.5, -d / 2 + 1.2);
              fGroup.add(holoScreen);
            } else if (f % 3 === 2) {
              // Research & Computer Workstations Level
              [-3.2, 3.2].forEach((rz) => {
                const desk = new THREE.Mesh(
                  new THREE.BoxGeometry(5.2, 1.0, 1.8),
                  new THREE.MeshLambertMaterial({ color: 0x1e293b })
                );
                desk.position.set(-2.0, 0.7, rz);
                fGroup.add(desk);

                const monitor = new THREE.Mesh(
                  new THREE.BoxGeometry(3.6, 0.9, 0.2),
                  new THREE.MeshBasicMaterial({ color: accentColor })
                );
                monitor.position.set(-2.0, 1.55, rz);
                fGroup.add(monitor);
              });
            } else {
              // Sky Lounge, Cafe Bar & Relaxation Level
              const sofa = new THREE.Mesh(
                new THREE.BoxGeometry(5.5, 1.0, 2.0),
                new THREE.MeshLambertMaterial({ color: 0xf43f5e })
              );
              sofa.position.set(-2.2, 0.7, -3.2);
              fGroup.add(sofa);

              const loungeTable = new THREE.Mesh(
                new THREE.BoxGeometry(3.2, 0.8, 2.2),
                new THREE.MeshLambertMaterial({ color: 0xfacc15 })
              );
              loungeTable.position.set(-2.2, 0.6, 2.2);
              fGroup.add(loungeTable);
            }
          }
        }

        // Ground Floor (1F) glowing Elevator Call Pad so players clearly see the elevator inside every building
        const groundCallPad = new THREE.Mesh(
          new THREE.BoxGeometry(4.2, 0.38, 4.2),
          new THREE.MeshBasicMaterial({ color: accentColor })
        );
        groundCallPad.position.set(localElevX, 0.2, localElevZ);
        group.add(groundCallPad);

        // 3. Moving 3D Elevator Cab for this building
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
          cabGroup
        };
        multiFloorBuildings.push(bldgRecord);
        return bldgRecord;
      }

      // Add a collider with optional minY support so multi-floor interiors work seamlessly
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

      // Build a hollow walk-in room with a doorway opening on one wall ('south', 'north', 'west', 'east')
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

          // Full-height building wall segments use One-Way Window Walls (opaque outside, window-transparent inside)
          if (!isFenceOnly && sh >= h - 0.15 && wallDir) {
            addOneWayWallSegment(group, lx, minY + ly, lz, sw, sh, sd, wallDir, wallColor, true);
          } else {
            const m = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, sd), wallMat);
            m.position.set(lx, minY + ly, lz);
            m.castShadow = !isFenceOnly;
            m.receiveShadow = true;
            group.add(m);
            shootableMeshes.push(m);
          }
        }

        // Solid corner trim posts so building corners look architectural inside & out
        if (!isFenceOnly) {
          const cornerPostGeo = new THREE.BoxGeometry(0.55, h, 0.55);
          const cornerPostMat = new THREE.MeshLambertMaterial({ color: wallColor });
          [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].forEach(([cx, cz]) => {
            const cp = new THREE.Mesh(cornerPostGeo, cornerPostMat);
            cp.position.set(cx, minY + h / 2, cz);
            group.add(cp);
          });
        }

        // North Wall (z = -d/2)
        if (doorSide === 'north') {
          const leftW = (w / 2 + doorOffset) - doorWidth / 2;
          const rightW = (w / 2 - doorOffset) - doorWidth / 2;
          addWallSegment(-w / 2 + leftW / 2, h / 2, -d / 2, leftW, h, wallThick, 'north');
          addWallSegment(w / 2 - rightW / 2, h / 2, -d / 2, rightW, h, wallThick, 'north');
          addWallSegment(doorOffset, doorHeight + (h - doorHeight) / 2, -d / 2, doorWidth, h - doorHeight, wallThick, null);
        } else {
          addWallSegment(0, h / 2, -d / 2, w, h, wallThick, 'north');
        }

        // South Wall (z = +d/2)
        if (doorSide === 'south') {
          const leftW = (w / 2 + doorOffset) - doorWidth / 2;
          const rightW = (w / 2 - doorOffset) - doorWidth / 2;
          addWallSegment(-w / 2 + leftW / 2, h / 2, d / 2, leftW, h, wallThick, 'south');
          addWallSegment(w / 2 - rightW / 2, h / 2, d / 2, rightW, h, wallThick, 'south');
          addWallSegment(doorOffset, doorHeight + (h - doorHeight) / 2, d / 2, doorWidth, h - doorHeight, wallThick, null);
        } else {
          addWallSegment(0, h / 2, d / 2, w, h, wallThick, 'south');
        }

        // West Wall (x = -w/2)
        if (doorSide === 'west') {
          const leftD = (d / 2 + doorOffset) - doorWidth / 2;
          const rightD = (d / 2 - doorOffset) - doorWidth / 2;
          addWallSegment(-w / 2, h / 2, -d / 2 + leftD / 2, wallThick, h, leftD, 'west');
          addWallSegment(-w / 2, h / 2, d / 2 - rightD / 2, wallThick, h, rightD, 'west');
          addWallSegment(-w / 2, doorHeight + (h - doorHeight) / 2, doorOffset, wallThick, h - doorHeight, doorWidth, null);
        } else {
          addWallSegment(-w / 2, h / 2, 0, wallThick, h, d, 'west');
        }

        // East Wall (x = +w/2)
        if (doorSide === 'east') {
          const leftD = (d / 2 + doorOffset) - doorWidth / 2;
          const rightD = (d / 2 - doorOffset) - doorWidth / 2;
          addWallSegment(w / 2, h / 2, -d / 2 + leftD / 2, wallThick, h, leftD, 'east');
          addWallSegment(w / 2, h / 2, d / 2 - rightD / 2, wallThick, h, rightD, 'east');
          addWallSegment(w / 2, doorHeight + (h - doorHeight) / 2, doorOffset, wallThick, h - doorHeight, doorWidth, null);
        } else {
          addWallSegment(w / 2, h / 2, 0, wallThick, h, d, 'east');
        }

        // Ceiling / Roof Slab
        if (addCeiling) {
          const roof = new THREE.Mesh(
            new THREE.BoxGeometry(w + 0.4, 0.5, d + 0.4),
            new THREE.MeshLambertMaterial({ color: roofColor })
          );
          roof.position.set(0, minY + h + 0.25, 0);
          roof.castShadow = true;
          roof.receiveShadow = true;
          group.add(roof);
        }

        // Interactive Sliding/Swinging Double Door Panels at the Doorway
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
            slideMax: doorWidth * 0.46,
            openAmount: 0
          });
        }
      }

      // ------------------------------------------
      // 4B. CITY CENTER: GRAND TOWN HALL WITH DOOR & WALK-IN INTERIOR (at x: 0, z: -12)
      // ------------------------------------------
      const townHallGroup = new THREE.Group();
      townHallGroup.position.set(0, 0, -12);
      worldGroup.add(townHallGroup);

      // Walk-In Marble Floor & Red Carpet Aisle
      const thFloor = new THREE.Mesh(
        new THREE.BoxGeometry(30, 0.32, 18),
        new THREE.MeshLambertMaterial({ color: 0xf1f5f9 })
      );
      thFloor.position.set(0, 0.16, -1);
      thFloor.receiveShadow = true;
      townHallGroup.add(thFloor);

      const redCarpet = new THREE.Mesh(
        new THREE.BoxGeometry(4.6, 0.36, 26),
        new THREE.MeshBasicMaterial({ color: 0xbe123c })
      );
      redCarpet.position.set(0, 0.18, 4.5);
      townHallGroup.add(redCarpet);

      // Hollow Town Hall Building with Interactive Grand Front Door at (x: 0, z: -2)
      buildHollowBuilding({
        group: townHallGroup,
        worldX: 0,
        worldZ: -13,
        w: 30,
        d: 18,
        h: 5.5,
        minY: 0,
        wallColor: 0xf8fafc,
        roofColor: 0x991b1b,
        doorSide: 'south',
        doorOffset: 0,
        doorWidth: 5.2,
        doorHeight: 4.8,
        doorColor: 0xb45309,
        addCeiling: false,
        tag: 'townhall'
      });
      townHallGroup.children[townHallGroup.children.length - 1].position.z -= 1; // Align with -1 local offset

      // Town Hall Interior Furnishings: Mayor's Podium, Council Benches, Pillars & Displays
      const mayorDais = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.8, 4.5),
        new THREE.MeshLambertMaterial({ color: 0x78350f })
      );
      mayorDais.position.set(0, 0.55, -7.2);
      townHallGroup.add(mayorDais);
      addBoxCollider(0, -19.2, 10, 4.5, 1.5, 'townhall_desk');

      const mayorDesk = new THREE.Mesh(
        new THREE.BoxGeometry(6.5, 1.4, 1.6),
        new THREE.MeshLambertMaterial({ color: 0x451a03 })
      );
      mayorDesk.position.set(0, 1.5, -6.2);
      townHallGroup.add(mayorDesk);

      const mayorBannerTex = createSignTexture('MAYOR OFFICE & COUNCIL', 'WELCOME TO TOWN HALL', '#7f1d1d', '#facc15', '#ffffff');
      const mayorBanner = new THREE.Mesh(
        new THREE.BoxGeometry(12, 3.2, 0.2),
        new THREE.MeshBasicMaterial({ map: mayorBannerTex })
      );
      mayorBanner.position.set(0, 6.5, -9.4);
      townHallGroup.add(mayorBanner);

      // Council Pews / Seating Benches (Left & Right of Red Carpet)
      const benchMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
      [-8.5, 8.5].forEach((bx) => {
        [-2.5, 1.2, 4.8].forEach((bz) => {
          const bench = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.9, 1.4), benchMat);
          bench.position.set(bx, 0.6, bz);
          townHallGroup.add(bench);
          addBoxCollider(bx, -12 + bz, 6.2, 1.4, 1.2, 'bench');
        });
      });

      // Golden City Trophy Pedestals inside Town Hall
      [-12, 12].forEach((tx) => {
        const ped = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 1.8, 1.6),
          new THREE.MeshLambertMaterial({ color: 0xcbd5e1 })
        );
        ped.position.set(tx, 1.0, -6.5);
        townHallGroup.add(ped);
        const trophy = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 1.4, 0.9),
          new THREE.MeshBasicMaterial({ color: 0xfacc15 })
        );
        trophy.position.set(tx, 2.5, -6.5);
        townHallGroup.add(trophy);
      });

      // Classical Front Pillars (6 boxy columns outside front facade)
      const pillarMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
      [-11, -6.6, -3.4, 3.4, 6.6, 11].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 13.5, 1.4), pillarMat);
        pillar.position.set(px, 6.9, 9.2);
        pillar.castShadow = true;
        townHallGroup.add(pillar);
        shootableMeshes.push(pillar);
      });

      // Pediment / Roof Band & Clock Tower
      const thSignTex = createSignTexture('CITY TOWN HALL', 'WALK IN THROUGH FRONT DOORS', '#1e293b', '#facc15', '#ffffff');
      const thSign = new THREE.Mesh(
        new THREE.BoxGeometry(16, 3.2, 0.5),
        new THREE.MeshBasicMaterial({ map: thSignTex })
      );
      thSign.position.set(0, 7.2, 9.2);
      townHallGroup.add(thSign);

      // Clock Face mounted on front pediment below the 4F Helipad Roof so the 4F roof is 100% open at the top!
      const clockTex = createClockTexture();
      const clockFaceFront = new THREE.Mesh(
        new THREE.PlaneGeometry(4.2, 4.2),
        new THREE.MeshBasicMaterial({ map: clockTex })
      );
      clockFaceFront.position.set(0, 12.8, 9.3);
      townHallGroup.add(clockFaceFront);

      addElevatorAndUpperFloors({
        id: 'townhall',
        title: '🏛️ City Town Hall',
        group: townHallGroup,
        worldX: 0,
        worldZ: -13,
        w: 30,
        d: 18,
        floorHeight: 5.5,
        numLevels: 4,
        floorLabels: ['1F Council', '2F Mayor Suite', '3F Archives', '4F Clock Deck'],
        localElevX: 11.2,
        localElevZ: -5.2,
        wallColor: 0xf8fafc,
        accentColor: 0xfacc15,
        floorColor: 0xe2e8f0,
        buildFloor1ToN: true
      });
      mapBuildings.push({ x: 0, z: -12, w: 30, d: 18, color: '#facc15', label: 'Town Hall' });

      // Central Plaza Fountain in front of Town Hall (at x: 0, z: 16)
      const fountainGroup = new THREE.Group();
      fountainGroup.position.set(0, 0.3, 16);
      worldGroup.add(fountainGroup);

      const fBasin = new THREE.Mesh(
        new THREE.BoxGeometry(10, 1.4, 10),
        new THREE.MeshLambertMaterial({ color: 0x64748b })
      );
      fBasin.position.y = 0.7;
      fountainGroup.add(fBasin);

      const fWater = new THREE.Mesh(
        new THREE.BoxGeometry(8.6, 1.1, 8.6),
        new THREE.MeshLambertMaterial({ color: 0x38bdf8 })
      );
      fWater.position.y = 0.85;
      fountainGroup.add(fWater);

      const fCenterPillar = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 4.2, 2.2),
        new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
      );
      fCenterPillar.position.y = 2.1;
      fountainGroup.add(fCenterPillar);
      addBoxCollider(0, 16, 10, 10, 4.5, 'fountain');

      // TAXI STAND NEXT TO THE TOWN HALL (at x: -18, z: 5)
      const taxiStandGroup = new THREE.Group();
      taxiStandGroup.position.set(-18, 0, 5);
      worldGroup.add(taxiStandGroup);

      // Yellow-and-Slate Taxi Stand Curb Pad
      const tsPad = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.36, 13.5),
        new THREE.MeshLambertMaterial({ color: 0x1e293b })
      );
      tsPad.position.set(0, 0.18, 0);
      taxiStandGroup.add(tsPad);

      const tsCurb = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.42, 13.5),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      tsCurb.position.set(1.65, 0.21, 0);
      taxiStandGroup.add(tsCurb);

      // Shelter Pillars & Canopy Roof
      [-4.8, 4.8].forEach((pz) => {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 3.8, 0.4),
          new THREE.MeshLambertMaterial({ color: 0xfacc15 })
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

      // Waiting Bench under the Taxi Stand
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

      // Walk-In Paintball Shop Floor
      const shopFloor = new THREE.Mesh(
        new THREE.BoxGeometry(15, 0.32, 16),
        new THREE.MeshLambertMaterial({ color: 0x312e81 })
      );
      shopFloor.position.set(3, 0.16, 0);
      shopGroup.add(shopFloor);

      // Hollow Paintball Shop Walls & Door (West door at x = 25.5, z = 6 AND Back East door leading to Violet Tower!)
      const shopCenterGroup = new THREE.Group();
      shopCenterGroup.position.set(3, 0, 0);
      shopGroup.add(shopCenterGroup);

      buildHollowBuilding({
        group: shopCenterGroup,
        worldX: SHOP_POS.x + 3,
        worldZ: SHOP_POS.z,
        w: 15,
        d: 16,
        h: 5.0,
        minY: 0,
        wallColor: 0x1e1b4b,
        addCeiling: false,
        roofColor: 0xec4899,
        doorSide: 'west',
        doorOffset: 0,
        doorWidth: 4.6,
        doorHeight: 4.2,
        doorColor: 0x06b6d4,
        tag: 'shop'
      });

      // Shop Interior: Pro Counter Desk, Weapon Display Racks, Paint Crates
      const shopDesk = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.3, 6.5),
        new THREE.MeshLambertMaterial({ color: 0x0f172a })
      );
      shopDesk.position.set(4.2, 0.8, -2.5);
      shopCenterGroup.add(shopDesk);
      addBoxCollider(SHOP_POS.x + 7.2, SHOP_POS.z - 2.5, 2.2, 6.5, 1.5, 'shop_desk');

      const shopRackColors = [0x22d3ee, 0xec4899, 0xa3e635, 0xfacc15];
      for (let r = 0; r < 4; r++) {
        const displayBoard = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 2.4, 0.3),
          new THREE.MeshBasicMaterial({ color: shopRackColors[r] })
        );
        displayBoard.position.set(-3.5 + r * 2.4, 3.2, -7.2);
        shopCenterGroup.add(displayBoard);

        const crate = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 1.4, 1.6),
          new THREE.MeshLambertMaterial({ color: shopRackColors[r] })
        );
        crate.position.set(-3.5 + r * 2.2, 0.85, 5.5);
        shopCenterGroup.add(crate);
      }

      // Shop Billboard Sign
      const shopSignTex = createSignTexture(
        'PAINTBALL PRO SHOP',
        'GATE BUTTON & PRO GEAR INSIDE ▶',
        '#0f172a',
        '#22d3ee',
        '#f472b6'
      );
      const shopSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 3.8, 14),
        new THREE.MeshBasicMaterial({ map: shopSignTex })
      );
      shopSign.position.set(-4.6, 8.2, 0);
      shopGroup.add(shopSign);

      // Entrance Gate Archway in front of the Paintball Shop
      const gateArchGroup = new THREE.Group();
      gateArchGroup.position.set(-7.5, 0, 0);
      shopGroup.add(gateArchGroup);

      const gatePillarMat = new THREE.MeshLambertMaterial({ color: 0x10b981 });
      const leftGatePillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.5, 1.4), gatePillarMat);
      leftGatePillar.position.set(0, 3.25, -4.2);
      leftGatePillar.castShadow = true;
      gateArchGroup.add(leftGatePillar);

      const rightGatePillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.5, 1.4), gatePillarMat);
      rightGatePillar.position.set(0, 3.25, 4.2);
      rightGatePillar.castShadow = true;
      gateArchGroup.add(rightGatePillar);

      const gateHeaderTex = createSignTexture('ARENA GATE ENTRANCE', 'PRESS BUTTON BELOW [E]', '#064e3b', '#34d399', '#ffffff');
      const gateHeader = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 2.0, 10.2),
        new THREE.MeshBasicMaterial({ map: gateHeaderTex })
      );
      gateHeader.position.set(0, 7.1, 0);
      gateArchGroup.add(gateHeader);

      const gateBarrierMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.35
      });
      const gatePortalMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.8, 7.0), gateBarrierMat);
      gatePortalMesh.position.set(0, 3.0, 0);
      gateArchGroup.add(gatePortalMesh);

      // THE INTERACTIVE BUTTON PEDESTAL inside the Shop Gate Entrance
      const pedestalGroup = new THREE.Group();
      pedestalGroup.position.set(-6.5, 0, -2.6);
      shopGroup.add(pedestalGroup);

      const pedStand = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.5, 1.4),
        new THREE.MeshLambertMaterial({ color: 0xf8fafc })
      );
      pedStand.position.y = 0.75;
      pedStand.castShadow = true;
      pedestalGroup.add(pedStand);

      const buttonGlowMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
      const gateButtonMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.45, 0.9),
        buttonGlowMat
      );
      gateButtonMesh.position.y = 1.65;
      pedestalGroup.add(gateButtonMesh);

      const beaconRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.6, 0.22, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xf472b6 })
      );
      beaconRing.rotation.x = Math.PI / 2;
      beaconRing.position.set(GATE_BUTTON_POS.x, 12, GATE_BUTTON_POS.z);
      worldGroup.add(beaconRing);

      addElevatorAndUpperFloors({
        id: 'shop',
        title: '🎯 Paintball Pro Shop',
        group: shopCenterGroup,
        worldX: SHOP_POS.x + 3,
        worldZ: SHOP_POS.z,
        w: 15,
        d: 16,
        floorHeight: 5.0,
        numLevels: 4,
        floorLabels: ['1F Pro Shop', '2F Gear Lockers', '3F Strategy Hall', '4F Roof Target Deck'],
        localElevX: 4.2,
        localElevZ: 4.8,
        wallColor: 0x312e81,
        accentColor: 0xec4899,
        floorColor: 0x1e1b4b,
        buildFloor1ToN: true
      });
      mapBuildings.push({
        x: SHOP_POS.x + 3,
        z: SHOP_POS.z,
        w: 15,
        d: 16,
        color: '#ec4899',
        label: 'Paintball Shop'
      });

      // 2) METRO PLAZA CAFE & LOUNGE (West of Town Hall at x: -30, z: 8)
      const cafeGroup = new THREE.Group();
      cafeGroup.position.set(-30, 0, 8);
      worldGroup.add(cafeGroup);

      const cafeFloor = new THREE.Mesh(
        new THREE.BoxGeometry(16, 0.32, 18),
        new THREE.MeshLambertMaterial({ color: 0xfef3c7 })
      );
      cafeFloor.position.set(0, 0.16, 0);
      cafeGroup.add(cafeFloor);

      buildHollowBuilding({
        group: cafeGroup,
        worldX: -30,
        worldZ: 8,
        w: 16,
        d: 18,
        h: 5.0,
        minY: 0,
        wallColor: 0x0f766e,
        addCeiling: false,
        roofColor: 0x14b8a6,
        doorSide: 'east',
        doorOffset: 0,
        doorWidth: 4.6,
        doorHeight: 4.2,
        doorColor: 0xf59e0b,
        tag: 'cafe'
      });

      const cafeSignTex = createSignTexture('METRO PLAZA CAFE', 'ESPRESSO • LOUNGE • OPEN', '#134e4a', '#2dd4bf', '#ffffff');
      const cafeSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 3.2, 12),
        new THREE.MeshBasicMaterial({ map: cafeSignTex })
      );
      cafeSign.position.set(8.3, 7.6, 0);
      cafeGroup.add(cafeSign);

      // Cafe Interior Counter & Tables
      const cafeCounter = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.3, 8.5),
        new THREE.MeshLambertMaterial({ color: 0x78350f })
      );
      cafeCounter.position.set(-4.5, 0.8, 0);
      cafeGroup.add(cafeCounter);
      addBoxCollider(-34.5, 8, 2.4, 8.5, 1.5, 'cafe_counter');

      [[-1, -5], [-1, 5], [3, -5], [3, 5]].forEach(([tx, tz]) => {
        const tbl = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 1.0, 2.2),
          new THREE.MeshLambertMaterial({ color: 0xd97706 })
        );
        tbl.position.set(tx, 0.65, tz);
        cafeGroup.add(tbl);
      });
      addElevatorAndUpperFloors({
        id: 'cafe',
        title: '☕ Metro Plaza Cafe',
        group: cafeGroup,
        worldX: -30,
        worldZ: 8,
        w: 16,
        d: 18,
        floorHeight: 5.0,
        numLevels: 4,
        floorLabels: ['1F Espresso Bar', '2F Jazz Lounge', '3F Roastery', '4F Sky Dining'],
        localElevX: -4.5,
        localElevZ: 5.8,
        wallColor: 0x0f766e,
        accentColor: 0x2dd4bf,
        floorColor: 0xfef3c7,
        buildFloor1ToN: true
      });
      mapBuildings.push({ x: -30, z: 8, w: 16, d: 18, color: '#14b8a6', label: 'Plaza Cafe' });

      // 3) CIVIC GALLERY & BANK ANNEX (North-West of Town Hall at x: -30, z: -13)
      const galleryGroup = new THREE.Group();
      galleryGroup.position.set(-30, 0, -13);
      worldGroup.add(galleryGroup);

      const galleryFloor = new THREE.Mesh(
        new THREE.BoxGeometry(16, 0.32, 16),
        new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
      );
      galleryFloor.position.set(0, 0.16, 0);
      galleryGroup.add(galleryFloor);

      buildHollowBuilding({
        group: galleryGroup,
        worldX: -30,
        worldZ: -13,
        w: 16,
        d: 16,
        h: 5.2,
        minY: 0,
        wallColor: 0x1e3a8a,
        addCeiling: false,
        roofColor: 0x3b82f6,
        doorSide: 'east',
        doorOffset: 0,
        doorWidth: 4.6,
        doorHeight: 4.2,
        doorColor: 0xeab308,
        tag: 'gallery'
      });

      const galSignTex = createSignTexture('CIVIC ART GALLERY', 'EXHIBITS & VAULT INSIDE', '#172554', '#60a5fa', '#ffffff');
      const galSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 3.2, 12),
        new THREE.MeshBasicMaterial({ map: galSignTex })
      );
      galSign.position.set(8.3, 8.2, 0);
      galleryGroup.add(galSign);

      // Gallery Center Statue & Art Frames
      const statuePed = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 1.4, 2.6),
        new THREE.MeshLambertMaterial({ color: 0x475569 })
      );
      statuePed.position.set(-1.5, 0.85, 0);
      galleryGroup.add(statuePed);
      addBoxCollider(-31.5, -13, 2.6, 2.6, 2.5, 'statue');

      const goldenStatue = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 2.8, 1.4),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      goldenStatue.position.set(-1.5, 2.8, 0);
      galleryGroup.add(goldenStatue);
      addElevatorAndUpperFloors({
        id: 'gallery',
        title: '🖼️ Civic Art Gallery',
        group: galleryGroup,
        worldX: -30,
        worldZ: -13,
        w: 16,
        d: 16,
        floorHeight: 5.2,
        numLevels: 4,
        floorLabels: ['1F Sculpture Hall', '2F Painting Wing', '3F Holo Exhibit', '4F Roof Sculpture Deck'],
        localElevX: -4.5,
        localElevZ: -4.8,
        wallColor: 0x1e3a8a,
        accentColor: 0x60a5fa,
        floorColor: 0xe2e8f0,
        buildFloor1ToN: true
      });
      mapBuildings.push({ x: -30, z: -13, w: 16, d: 16, color: '#3b82f6', label: 'Civic Gallery' });

      // ------------------------------------------
      // 4D. THE VIOLET TOWER BEHIND THE PAINTBALL SHOP
      //     (Centered at x: 74, z: 6 — Elevator to All 7 Floors + 7F Arcade + Terrace Rooftop Football!)
      // ------------------------------------------
      const VIOLET_TOWER = {
        x: 74,
        z: 6,
        w: 32, // x: 58 .. 90
        d: 36, // z: -12 .. 24
        floorHeight: 6.0,
        numFloors: 7, // Floors 1..7 (0..6 * 6.0), plus Terrace at 7 * 6.0 = 42.0!
        terraceY: 42.0,
        elevX: 86.8,
        elevZ: 6.0,
        elevW: 4.8,
        elevD: 5.4
      };

      const violetTowerGroup = new THREE.Group();
      violetTowerGroup.position.set(VIOLET_TOWER.x, 0, VIOLET_TOWER.z);
      worldGroup.add(violetTowerGroup);

      // Violet Promenade Walkway connecting Paintball Shop to Violet Tower Front Door
      const violetWalkway = new THREE.Mesh(
        new THREE.BoxGeometry(20, 0.28, 10),
        new THREE.MeshLambertMaterial({ color: 0x4c1d95 })
      );
      violetWalkway.position.set(49, 0.14, 6);
      worldGroup.add(violetWalkway);

      // Build each of the 7 Floors + Terrace of the Violet Tower
      const floorNames = [
        '1F LOBBY & CONCIERGE',
        '2F VIOLET CORP OFFICES',
        '3F CYBER TECH LAB',
        '4F SKY FITNESS GYM',
        '5F PENTHOUSE SUITES',
        '6F NEON CINEMA HALL',
        '7F RETRO ARCADE ZONE'
      ];

      const arcadeCabinets = []; // Store 7th floor arcade cabinet positions for interactive play!

      for (let f = 0; f < VIOLET_TOWER.numFloors; f++) {
        const fy = f * VIOLET_TOWER.floorHeight;
        const floorGroup = new THREE.Group();
        violetTowerGroup.add(floorGroup);

        // Floor Slab (Leaves a cutout on the East side for the Elevator Shaft: local x in [10.4, 15.2], z in [-2.7, 2.7])
        const mainSlab = new THREE.Mesh(
          new THREE.BoxGeometry(26.4, 0.4, VIOLET_TOWER.d),
          new THREE.MeshLambertMaterial({ color: f === 6 ? 0x1e1b4b : 0x2e1065 })
        );
        mainSlab.position.set(-2.8, fy + 0.2, 0);
        mainSlab.receiveShadow = true;
        floorGroup.add(mainSlab);

        // North & South Side Slabs around the Elevator Shaft
        const sideSlabN = new THREE.Mesh(
          new THREE.BoxGeometry(5.6, 0.4, 15.3),
          new THREE.MeshLambertMaterial({ color: 0x2e1065 })
        );
        sideSlabN.position.set(13.2, fy + 0.2, -10.35);
        floorGroup.add(sideSlabN);

        const sideSlabS = new THREE.Mesh(
          new THREE.BoxGeometry(5.6, 0.4, 15.3),
          new THREE.MeshLambertMaterial({ color: 0x2e1065 })
        );
        sideSlabS.position.set(13.2, fy + 0.2, 10.35);
        floorGroup.add(sideSlabS);

        // Exterior Violet Walls (Ground floor has West Entrance Door at x = 58, z = 6; upper floors have transparent violet glass walls)
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
          transparentWalls: f > 0,
          wallOpacity: f === 6 ? 0.45 : 0.28,
          addCeiling: false,
          tag: 'violet_tower'
        });

        // Glowing Neon Violet Exterior Floor Band
        const neonBand = new THREE.Mesh(
          new THREE.BoxGeometry(VIOLET_TOWER.w + 0.6, 0.35, VIOLET_TOWER.d + 0.6),
          new THREE.MeshBasicMaterial({ color: f === 6 ? 0xf472b6 : 0xa78bfa })
        );
        neonBand.position.set(0, fy + VIOLET_TOWER.floorHeight, 0);
        floorGroup.add(neonBand);

        // Floor Level Sign next to the Elevator Entrance inside each floor
        const fSignTex = createSignTexture(floorNames[f], 'ELEVATOR TO ALL FLOORS ▶', '#1e1b4b', '#c084fc', '#ffffff');
        const fSign = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 1.6, 5.2),
          new THREE.MeshBasicMaterial({ map: fSignTex })
        );
        fSign.position.set(10.2, fy + 4.3, 0);
        floorGroup.add(fSign);

        // Furnishings per floor
        if (f === 0) {
          // 1F Ground Lobby: Reception Desk & Violet Lounge Couches
          const recDesk = new THREE.Mesh(
            new THREE.BoxGeometry(3.0, 1.3, 8.0),
            new THREE.MeshLambertMaterial({ color: 0x581c87 })
          );
          recDesk.position.set(2, fy + 0.85, -8);
          floorGroup.add(recDesk);

          const sofa1 = new THREE.Mesh(
            new THREE.BoxGeometry(6.0, 1.0, 2.4),
            new THREE.MeshLambertMaterial({ color: 0x9333ea })
          );
          sofa1.position.set(-6, fy + 0.7, 10);
          floorGroup.add(sofa1);
        } else if (f === 1) {
          // 2F VIOLET CORP OFFICES: Cubicle Desks, Dual Monitors & Central Conference Table
          const confTable = new THREE.Mesh(
            new THREE.BoxGeometry(8.5, 1.1, 4.0),
            new THREE.MeshLambertMaterial({ color: 0x0284c7 })
          );
          confTable.position.set(-3, fy + 0.75, 0);
          floorGroup.add(confTable);
          [[-9, -10], [-9, 10], [2, -10], [2, 10]].forEach(([dx, dz]) => {
            const desk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 2.2), new THREE.MeshLambertMaterial({ color: 0x334155 }));
            desk.position.set(dx, fy + 0.75, dz);
            floorGroup.add(desk);
            const mon = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 0.2), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
            mon.position.set(dx, fy + 1.65, dz);
            floorGroup.add(mon);
          });
        } else if (f === 2) {
          // 3F CYBER TECH LAB: Glowing Server Racks & Central Holographic City Table
          const holoBase = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.1, 5.5), new THREE.MeshLambertMaterial({ color: 0x0f172a }));
          holoBase.position.set(-3, fy + 0.75, 0);
          floorGroup.add(holoBase);
          const holoCube = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.6), new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true }));
          holoCube.position.set(-3, fy + 2.8, 0);
          floorGroup.add(holoCube);
          [-12, -8, -4, 0, 4].forEach((rx) => {
            const rack = new THREE.Mesh(new THREE.BoxGeometry(2.0, 4.2, 1.8), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
            rack.position.set(rx, fy + 2.3, -12);
            floorGroup.add(rack);
            const led = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.6, 0.1), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
            led.position.set(rx, fy + 2.3, -11.05);
            floorGroup.add(led);
          });
        } else if (f === 3) {
          // 4F SKY FITNESS GYM: Treadmills, Weight Bench & Yoga Mats
          for (let tm = 0; tm < 4; tm++) {
            const base = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 3.6), new THREE.MeshLambertMaterial({ color: 0x1e293b }));
            base.position.set(-10 + tm * 3.8, fy + 0.45, -10);
            floorGroup.add(base);
            const consolePost = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 0.4), new THREE.MeshLambertMaterial({ color: 0x10b981 }));
            consolePost.position.set(-10 + tm * 3.8, fy + 1.35, -11.5);
            floorGroup.add(consolePost);
          }
          const yogaMat = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.08, 6.0), new THREE.MeshBasicMaterial({ color: 0x14b8a6 }));
          yogaMat.position.set(-3, fy + 0.42, 8);
          floorGroup.add(yogaMat);
        } else if (f === 4) {
          // 5F PENTHOUSE SUITES: King Bed, Plush Sofa & Giant Wall TV
          const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.9, 5.5), new THREE.MeshLambertMaterial({ color: 0x78350f }));
          bedFrame.position.set(-8, fy + 0.65, -9);
          floorGroup.add(bedFrame);
          const mattress = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.5, 5.0), new THREE.MeshLambertMaterial({ color: 0xfde047 }));
          mattress.position.set(-8, fy + 1.2, -9);
          floorGroup.add(mattress);
          const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(8.0, 3.4, 0.25), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
          tvScreen.position.set(-2, fy + 2.8, 16.5);
          floorGroup.add(tvScreen);
          const loungeSofa = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.1, 2.4), new THREE.MeshLambertMaterial({ color: 0xf59e0b }));
          loungeSofa.position.set(-2, fy + 0.75, 9);
          floorGroup.add(loungeSofa);
        } else if (f === 5) {
          // 6F NEON CINEMA HALL: Giant Movie Screen & 3 Rows of Red Velvet Theater Seats
          const cinemaScreen = new THREE.Mesh(new THREE.BoxGeometry(16.0, 4.4, 0.3), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
          cinemaScreen.position.set(-3, fy + 2.8, -16.5);
          floorGroup.add(cinemaScreen);
          [-4, 2, 8].forEach((rz) => {
            const seatRow = new THREE.Mesh(new THREE.BoxGeometry(13.0, 1.1, 2.0), new THREE.MeshLambertMaterial({ color: 0xbe123c }));
            seatRow.position.set(-3, fy + 0.75, rz);
            floorGroup.add(seatRow);
          });
        } else if (f === 6) {
          // =========================================================
          // 7TH FLOOR (7F, y = 36.0): NEON ARCADE ZONE WITH ARCADE GAMES!
          // =========================================================
          const arcadeRug = new THREE.Mesh(
            new THREE.BoxGeometry(22, 0.08, 28),
            new THREE.MeshBasicMaterial({ color: 0x311042 })
          );
          arcadeRug.position.set(-3, fy + 0.42, 0);
          floorGroup.add(arcadeRug);

          const arcadeTitles = [
            { title: 'NEON BRICK BREAKER', color: 0xec4899, lx: -11, lz: -13, rot: 0, mode: 'breaker' },
            { title: 'CYBER PONG 2099', color: 0x22d3ee, lx: -5.5, lz: -13, rot: 0, mode: 'pong' },
            { title: 'SPACE BLOCK INVADERS', color: 0xa3e635, lx: 0, lz: -13, rot: 0, mode: 'invaders' },
            { title: 'TURBO PIXEL RACER', color: 0xfacc15, lx: 5.5, lz: -13, rot: 0, mode: 'breaker' },
            { title: 'GALAXY SPLAT DX', color: 0xa855f7, lx: -11, lz: 13, rot: Math.PI, mode: 'invaders' },
            { title: 'HYPER PONG ARENA', color: 0x38bdf8, lx: -5.5, lz: 13, rot: Math.PI, mode: 'pong' },
            { title: 'MEGA BLOCK BUSTER', color: 0xf43f5e, lx: 0, lz: 13, rot: Math.PI, mode: 'breaker' },
            { title: 'NEON CLAW & HOOPS', color: 0x34d399, lx: 5.5, lz: 13, rot: Math.PI, mode: 'pong' }
          ];

          arcadeTitles.forEach((cab) => {
            const cabGroup = new THREE.Group();
            cabGroup.position.set(cab.lx, fy + 0.4, cab.lz);
            cabGroup.rotation.y = cab.rot;
            floorGroup.add(cabGroup);

            // Cabinet Body
            const body = new THREE.Mesh(
              new THREE.BoxGeometry(2.2, 3.4, 1.8),
              new THREE.MeshLambertMaterial({ color: 0x0f172a })
            );
            body.position.y = 1.7;
            cabGroup.add(body);

            // Glowing Trim & Marquee Header
            const marquee = new THREE.Mesh(
              new THREE.BoxGeometry(2.3, 0.55, 2.0),
              new THREE.MeshBasicMaterial({ color: cab.color })
            );
            marquee.position.set(0, 3.25, 0.1);
            cabGroup.add(marquee);

            // Glowing CRT Screen
            const screen = new THREE.Mesh(
              new THREE.BoxGeometry(1.75, 1.25, 0.15),
              new THREE.MeshBasicMaterial({ color: cab.color })
            );
            screen.position.set(0, 2.2, 0.88);
            cabGroup.add(screen);

            // Control Deck + Joysticks
            const deck = new THREE.Mesh(
              new THREE.BoxGeometry(2.0, 0.25, 0.75),
              new THREE.MeshLambertMaterial({ color: 0x334155 })
            );
            deck.position.set(0, 1.4, 1.05);
            cabGroup.add(deck);

            arcadeCabinets.push({
              title: cab.title,
              mode: cab.mode,
              wx: VIOLET_TOWER.x + cab.lx,
              wy: fy,
              wz: VIOLET_TOWER.z + cab.lz
            });
          });

          // Central Air Hockey Table on 7th Floor Arcade
          const airHockeyTable = new THREE.Mesh(
            new THREE.BoxGeometry(5.5, 1.1, 3.2),
            new THREE.MeshLambertMaterial({ color: 0x0284c7 })
          );
          airHockeyTable.position.set(-3.5, fy + 0.95, 0);
          floorGroup.add(airHockeyTable);

          const airHockeyRink = new THREE.Mesh(
            new THREE.BoxGeometry(5.1, 0.08, 2.8),
            new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
          );
          airHockeyRink.position.set(-3.5, fy + 1.52, 0);
          floorGroup.add(airHockeyRink);
        }
      }

      // Violet Tower Exterior Entrance Sign
      const vtSignTex = createSignTexture(
        'VIOLET TOWER',
        'ELEVATOR • 7F ARCADE • ROOFTOP FOOTBALL',
        '#2e1065',
        '#c084fc',
        '#ffffff'
      );
      const vtSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 4.2, 18),
        new THREE.MeshBasicMaterial({ map: vtSignTex })
      );
      vtSign.position.set(-VIOLET_TOWER.w / 2 - 0.4, 8.2, 0);
      violetTowerGroup.add(vtSign);

      // =========================================================
      // TERRACE / ROOFTOP (y = 42.0): ROOFTOP FOOTBALL GROUND!
      // =========================================================
      const terraceY = VIOLET_TOWER.terraceY;
      const terraceGroup = new THREE.Group();
      terraceGroup.position.set(0, terraceY, 0);
      violetTowerGroup.add(terraceGroup);

      // Rooftop Turf Slab (Leaves Elevator arrival corner at East side accessible)
      const roofTurf = new THREE.Mesh(
        new THREE.BoxGeometry(VIOLET_TOWER.w, 0.45, VIOLET_TOWER.d),
        new THREE.MeshLambertMaterial({ color: 0x15803d })
      );
      roofTurf.position.set(0, 0.22, 0);
      roofTurf.receiveShadow = true;
      terraceGroup.add(roofTurf);

      // White Pitch Markings (Touchlines, Halfway Line, Center Spot)
      const pitchX = -2.2; // Shifted slightly west so East Elevator landing has a clear sideline walkway
      const pitchW = 22.0;
      const pitchD = 30.0;
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      // Halfway line
      const halfLine = new THREE.Mesh(new THREE.BoxGeometry(pitchW, 0.06, 0.35), lineMat);
      halfLine.position.set(pitchX, 0.46, 0);
      terraceGroup.add(halfLine);

      // Pitch Boundary Lines
      const westTouch = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, pitchD), lineMat);
      westTouch.position.set(pitchX - pitchW / 2, 0.46, 0);
      terraceGroup.add(westTouch);

      const eastTouch = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, pitchD), lineMat);
      eastTouch.position.set(pitchX + pitchW / 2, 0.46, 0);
      terraceGroup.add(eastTouch);

      const northGoalLine = new THREE.Mesh(new THREE.BoxGeometry(pitchW, 0.06, 0.35), lineMat);
      northGoalLine.position.set(pitchX, 0.46, -pitchD / 2);
      terraceGroup.add(northGoalLine);

      const southGoalLine = new THREE.Mesh(new THREE.BoxGeometry(pitchW, 0.06, 0.35), lineMat);
      southGoalLine.position.set(pitchX, 0.46, pitchD / 2);
      terraceGroup.add(southGoalLine);

      // Center Circle Ring
      const centerCircle = new THREE.Mesh(
        new THREE.RingGeometry(3.2, 3.55, 24),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      centerCircle.rotation.x = -Math.PI / 2;
      centerCircle.position.set(pitchX, 0.47, 0);
      terraceGroup.add(centerCircle);

      // North & South Football Goalposts (at z = -15 and z = +15)
      const goalWidth = 7.4;
      const goalHeight = 3.4;
      const goalDepth = 2.0;
      [-pitchD / 2, pitchD / 2].forEach((gz, gIdx) => {
        const gGroup = new THREE.Group();
        gGroup.position.set(pitchX, 0.45, gz);
        terraceGroup.add(gGroup);

        const postMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
        const netMat = new THREE.MeshBasicMaterial({
          color: gIdx === 0 ? 0xfb7185 : 0x38bdf8,
          transparent: true,
          opacity: 0.35
        });

        const lPost = new THREE.Mesh(new THREE.BoxGeometry(0.3, goalHeight, 0.3), postMat);
        lPost.position.set(-goalWidth / 2, goalHeight / 2, 0);
        gGroup.add(lPost);

        const rPost = new THREE.Mesh(new THREE.BoxGeometry(0.3, goalHeight, 0.3), postMat);
        rPost.position.set(goalWidth / 2, goalHeight / 2, 0);
        gGroup.add(rPost);

        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(goalWidth + 0.3, 0.3, 0.3), postMat);
        crossbar.position.set(0, goalHeight, 0);
        gGroup.add(crossbar);

        const netDir = gIdx === 0 ? -1 : 1;
        const backNet = new THREE.Mesh(new THREE.BoxGeometry(goalWidth, goalHeight, 0.15), netMat);
        backNet.position.set(0, goalHeight / 2, netDir * goalDepth);
        gGroup.add(backNet);
      });

      // Rooftop Safety Glass Fence & Corner Stadium Floodlights
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

      // Elevator Arrival Penthouse Hood on the Terrace
      const elevHood = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 5.2, 6.2),
        new THREE.MeshLambertMaterial({ color: 0x4c1d95, transparent: true, opacity: 0.55 })
      );
      elevHood.position.set(12.8, 2.6, 0);
      terraceGroup.add(elevHood);

      // 3D Interactive Football on the Rooftop Pitch
      const footballGroup = new THREE.Group();
      const ballSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 14, 14),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      ballSphere.castShadow = true;
      footballGroup.add(ballSphere);

      const ballStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 0.78, 0.78),
        new THREE.MeshLambertMaterial({ color: 0x0f172a })
      );
      footballGroup.add(ballStripe);
      scene.add(footballGroup);

      const rooftopFootball = {
        mesh: footballGroup,
        homeX: VIOLET_TOWER.x + pitchX,
        homeY: terraceY + 1.0,
        homeZ: VIOLET_TOWER.z,
        x: VIOLET_TOWER.x + pitchX,
        y: terraceY + 1.0,
        z: VIOLET_TOWER.z,
        vx: 0,
        vy: 0,
        vz: 0,
        scoreBlue: 0,
        scoreRed: 0
      };
      rooftopFootball.mesh.position.set(rooftopFootball.x, rooftopFootball.y, rooftopFootball.z);

      // =========================================================
      // BIGGER STADIUM FOOTBALL GROUND BEHIND SKATE & PARKOUR BUILDING
      // (Skate & Parkour is at x: 135, z: 80; Stadium Ground is right behind it at x: 196, z: 80!)
      // =========================================================
      const STADIUM_PITCH = {
        x: 196,
        z: 80,
        w: 52, // 52m wide x 76m long (Over 6x larger than the rooftop court!)
        d: 76,
        goalW: 11.5,
        goalH: 4.4,
        goalDepth: 3.2
      };

      const stadiumGroup = new THREE.Group();
      stadiumGroup.position.set(STADIUM_PITCH.x, 0, STADIUM_PITCH.z);
      worldGroup.add(stadiumGroup);

      // Connecting Walkway from behind the Skate & Parkour building (x: 148..168, z: 80)
      const stadiumWalkway = new THREE.Mesh(
        new THREE.BoxGeometry(24, 0.26, 12),
        new THREE.MeshLambertMaterial({ color: 0x334155 })
      );
      stadiumWalkway.position.set(158, 0.13, 80);
      worldGroup.add(stadiumWalkway);

      // Lush Striped Stadium Turf Pad
      const stadiumTurf = new THREE.Mesh(
        new THREE.BoxGeometry(STADIUM_PITCH.w + 8, 0.28, STADIUM_PITCH.d + 8),
        new THREE.MeshLambertMaterial({ color: 0x15803d })
      );
      stadiumTurf.position.set(0, 0.14, 0);
      stadiumTurf.receiveShadow = true;
      stadiumGroup.add(stadiumTurf);

      for (let st = -3; st <= 3; st++) {
        const stripeTurf = new THREE.Mesh(
          new THREE.BoxGeometry(STADIUM_PITCH.w, 0.3, 5.2),
          new THREE.MeshLambertMaterial({ color: 0x166534 })
        );
        stripeTurf.position.set(0, 0.15, st * 10.4);
        stripeTurf.receiveShadow = true;
        stadiumGroup.add(stripeTurf);
      }

      // Crisp White Stadium Pitch Markings (Touchlines, Goal Lines, Halfway Line, Penalty Boxes, Center Circle)
      const sLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sHalfLine = new THREE.Mesh(new THREE.BoxGeometry(STADIUM_PITCH.w, 0.06, 0.45), sLineMat);
      sHalfLine.position.set(0, 0.32, 0);
      stadiumGroup.add(sHalfLine);

      const sWestLine = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, STADIUM_PITCH.d), sLineMat);
      sWestLine.position.set(-STADIUM_PITCH.w / 2, 0.32, 0);
      stadiumGroup.add(sWestLine);

      const sEastLine = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, STADIUM_PITCH.d), sLineMat);
      sEastLine.position.set(STADIUM_PITCH.w / 2, 0.32, 0);
      stadiumGroup.add(sEastLine);

      const sNorthLine = new THREE.Mesh(new THREE.BoxGeometry(STADIUM_PITCH.w, 0.06, 0.45), sLineMat);
      sNorthLine.position.set(0, 0.32, -STADIUM_PITCH.d / 2);
      stadiumGroup.add(sNorthLine);

      const sSouthLine = new THREE.Mesh(new THREE.BoxGeometry(STADIUM_PITCH.w, 0.06, 0.45), sLineMat);
      sSouthLine.position.set(0, 0.32, STADIUM_PITCH.d / 2);
      stadiumGroup.add(sSouthLine);

      // Penalty Boxes (North & South)
      [-1, 1].forEach((dir) => {
        const penZ = dir * (STADIUM_PITCH.d / 2 - 11);
        const penFront = new THREE.Mesh(new THREE.BoxGeometry(24, 0.06, 0.4), sLineMat);
        penFront.position.set(0, 0.32, penZ);
        stadiumGroup.add(penFront);

        [-12, 12].forEach((px) => {
          const penSide = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 11), sLineMat);
          penSide.position.set(px, 0.32, dir * (STADIUM_PITCH.d / 2 - 5.5));
          stadiumGroup.add(penSide);
        });
      });

      const sCenterCircle = new THREE.Mesh(
        new THREE.RingGeometry(6.8, 7.3, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      sCenterCircle.rotation.x = -Math.PI / 2;
      sCenterCircle.position.set(0, 0.33, 0);
      stadiumGroup.add(sCenterCircle);

      // Full-Size North & South Stadium Goalposts with Nets
      [-STADIUM_PITCH.d / 2, STADIUM_PITCH.d / 2].forEach((gz, gIdx) => {
        const gGroup = new THREE.Group();
        gGroup.position.set(0, 0.3, gz);
        stadiumGroup.add(gGroup);

        const postMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
        const netMat = new THREE.MeshBasicMaterial({
          color: gIdx === 0 ? 0x38bdf8 : 0xfb7185,
          transparent: true,
          opacity: 0.38
        });

        const lPost = new THREE.Mesh(new THREE.BoxGeometry(0.4, STADIUM_PITCH.goalH, 0.4), postMat);
        lPost.position.set(-STADIUM_PITCH.goalW / 2, STADIUM_PITCH.goalH / 2, 0);
        gGroup.add(lPost);

        const rPost = new THREE.Mesh(new THREE.BoxGeometry(0.4, STADIUM_PITCH.goalH, 0.4), postMat);
        rPost.position.set(STADIUM_PITCH.goalW / 2, STADIUM_PITCH.goalH / 2, 0);
        gGroup.add(rPost);

        const crossbar = new THREE.Mesh(new THREE.BoxGeometry(STADIUM_PITCH.goalW + 0.4, 0.4, 0.4), postMat);
        crossbar.position.set(0, STADIUM_PITCH.goalH, 0);
        gGroup.add(crossbar);

        const netDir = gIdx === 0 ? -1 : 1;
        const backNet = new THREE.Mesh(new THREE.BoxGeometry(STADIUM_PITCH.goalW, STADIUM_PITCH.goalH, 0.2), netMat);
        backNet.position.set(0, STADIUM_PITCH.goalH / 2, netDir * STADIUM_PITCH.goalDepth);
        gGroup.add(backNet);

        [-STADIUM_PITCH.goalW / 2, STADIUM_PITCH.goalW / 2].forEach((nx) => {
          const sideNet = new THREE.Mesh(new THREE.BoxGeometry(0.2, STADIUM_PITCH.goalH, STADIUM_PITCH.goalDepth), netMat);
          sideNet.position.set(nx, STADIUM_PITCH.goalH / 2, (netDir * STADIUM_PITCH.goalDepth) / 2);
          gGroup.add(sideNet);
        });
      });

      // Spectator Grandstand Bleachers on East Side & Stadium Floodlight Towers on 4 Corners
      [1, 2, 3].forEach((tier) => {
        const bleacher = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, tier * 1.4, STADIUM_PITCH.d - 8),
          new THREE.MeshLambertMaterial({ color: tier % 2 === 0 ? 0x0284c7 : 0x1e293b })
        );
        bleacher.position.set(STADIUM_PITCH.w / 2 + 3.5 + tier * 2.2, (tier * 1.4) / 2, 0);
        stadiumGroup.add(bleacher);
      });

      [[-STADIUM_PITCH.w / 2 - 3, -STADIUM_PITCH.d / 2 - 3],
       [STADIUM_PITCH.w / 2 + 3, -STADIUM_PITCH.d / 2 - 3],
       [-STADIUM_PITCH.w / 2 - 3, STADIUM_PITCH.d / 2 + 3],
       [STADIUM_PITCH.w / 2 + 3, STADIUM_PITCH.d / 2 + 3]].forEach(([fx, fz]) => {
        const pole = new THREE.Mesh(new THREE.BoxGeometry(0.8, 18, 0.8), new THREE.MeshLambertMaterial({ color: 0x475569 }));
        pole.position.set(fx, 9, fz);
        stadiumGroup.add(pole);

        const lamp = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 1.2), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
        lamp.position.set(fx, 18.2, fz);
        stadiumGroup.add(lamp);
      });

      // Stadium Entrance Signboard facing the Skate & Parkour Building
      const stadSignTex = createSignTexture(
        'METRO FOOTBALL STADIUM',
        'DRIBBLE & KICK [CLICK / F] TO SCORE GOALS!',
        '#064e3b',
        '#34d399',
        '#ffffff'
      );
      const stadSign = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 3.8, 20),
        new THREE.MeshBasicMaterial({ map: stadSignTex })
      );
      stadSign.position.set(-STADIUM_PITCH.w / 2 - 2.5, 6.5, 0);
      stadiumGroup.add(stadSign);

      // 3D Interactive Football for the Bigger Stadium Ground
      const stadiumBallGroup = new THREE.Group();
      const sBallSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.68, 16, 16),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      sBallSphere.castShadow = true;
      stadiumBallGroup.add(sBallSphere);

      const sBallStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.95, 0.95),
        new THREE.MeshLambertMaterial({ color: 0x0f172a })
      );
      stadiumBallGroup.add(sBallStripe);
      scene.add(stadiumBallGroup);

      const stadiumFootball = {
        mesh: stadiumBallGroup,
        homeX: STADIUM_PITCH.x,
        homeY: 0.95,
        homeZ: STADIUM_PITCH.z,
        x: STADIUM_PITCH.x,
        y: 0.95,
        z: STADIUM_PITCH.z,
        vx: 0,
        vy: 0,
        vz: 0,
        scoreBlue: 0,
        scoreRed: 0
      };
      stadiumFootball.mesh.position.set(stadiumFootball.x, stadiumFootball.y, stadiumFootball.z);

      mapBuildings.push({
        x: STADIUM_PITCH.x,
        z: STADIUM_PITCH.z,
        w: STADIUM_PITCH.w + 8,
        d: STADIUM_PITCH.d + 8,
        color: '#15803d',
        label: 'Football Stadium'
      });

      // =========================================================
      // 3D MOVING ELEVATOR CAB INSIDE THE VIOLET TOWER
      // =========================================================
      const elevatorCabGroup = new THREE.Group();
      const cabPlatform = new THREE.Mesh(
        new THREE.BoxGeometry(4.6, 0.4, 5.0),
        new THREE.MeshLambertMaterial({ color: 0xc084fc })
      );
      cabPlatform.position.y = 0.2;
      elevatorCabGroup.add(cabPlatform);

      const cabCeiling = new THREE.Mesh(
        new THREE.BoxGeometry(4.6, 0.3, 5.0),
        new THREE.MeshBasicMaterial({ color: 0xe879f9 })
      );
      cabCeiling.position.y = 4.5;
      elevatorCabGroup.add(cabCeiling);

      const cabFrameMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.4 });
      const cabBackWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.4, 5.0), cabFrameMat);
      cabBackWall.position.set(2.2, 2.3, 0);
      elevatorCabGroup.add(cabBackWall);

      elevatorCabGroup.position.set(VIOLET_TOWER.elevX, 0, VIOLET_TOWER.elevZ);
      worldGroup.add(elevatorCabGroup);

      const elevatorState = {
        id: 'violet_tower',
        title: '🟣 Violet Tower',
        x: VIOLET_TOWER.x,
        z: VIOLET_TOWER.z,
        w: VIOLET_TOWER.w,
        d: VIOLET_TOWER.d,
        floorHeight: VIOLET_TOWER.floorHeight,
        numLevels: 8,
        floorLabels: ['1F Lobby', '2F Offices', '3F Tech Lab', '4F Sky Gym', '5F Suites', '6F Cinema', '🕹️ 7th Floor', '⚽ Terrace'],
        elevX: VIOLET_TOWER.elevX,
        elevZ: VIOLET_TOWER.elevZ,
        currentY: 0,
        targetY: 0,
        currentFloorIndex: 0,
        speed: 15.5,
        cabGroup: elevatorCabGroup
      };
      multiFloorBuildings.push(elevatorState);

      mapBuildings.push({
        x: VIOLET_TOWER.x,
        z: VIOLET_TOWER.z,
        w: VIOLET_TOWER.w,
        d: VIOLET_TOWER.d,
        color: '#a855f7',
        label: 'Violet Tower'
      });

      // ------------------------------------------
      // 4E. SKYSCRAPERS AROUND THE MAIN CITY
      // ------------------------------------------
      const skyscraperPalettes = [
        { base: '#1e293b', lit: '#38bdf8', roof: 0x0284c7 },
        { base: '#0f172a', lit: '#f472b6', roof: 0xdb2777 },
        { base: '#1e1b4b', lit: '#a78bfa', roof: 0x7c3aed },
        { base: '#172554', lit: '#fde047', roof: 0xeab308 },
        { base: '#111827', lit: '#34d399', roof: 0x059669 }
      ];

      const skyscraperTextures = skyscraperPalettes.map((p) =>
        createSkyscraperTexture(p.base, p.lit, 6, 14)
      );

      // 30 Unique Walk-In Skyscrapers — Every single building has a unique door, sign, and custom interior!
      const skyscraperSpecs = [
        // Inner Ring Blocks (10 Buildings — Hospital is at (80, -80) where Science Planetarium used to be!)
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

        // Outer Ring High-Rise Skyscrapers (20 Buildings)
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
          // Reception Desk + 3 Medical Beds with Red Cross Headboards + IV Stands
          addBox(5.5, 1.3, 2.0, 0x0284c7, 0, 0.85, -7);
          [-7, 0, 7].forEach((bx) => {
            addBox(3.2, 0.9, 5.2, 0xf8fafc, bx, 0.65, 2.5);
            addBox(2.8, 0.35, 1.4, 0x38bdf8, bx, 1.25, 4.2); // Pillow
            addBox(1.4, 1.4, 0.2, 0xef4444, bx, 2.5, 5.0, true); // Medical emblem
          });
        } else if (t === 'police') {
          // Briefing Desk + Holding Cell with Bars
          addBox(6.0, 1.3, 2.2, 0x1d4ed8, -4, 0.85, 0);
          addBox(8.0, 5.5, 0.3, 0x94a3b8, 5, 2.9, -4);
          for (let b = -3; b <= 3; b++) {
            addBox(0.2, 5.5, 0.2, 0xcbd5e1, 5 + b * 1.1, 2.9, 2);
          }
          addBox(4.0, 0.8, 1.8, 0x475569, 6, 0.6, -2); // Cell bench
        } else if (t === 'fire_station') {
          // Big Red Blocky Fire Engine Truck parked inside + Fire Pole
          addBox(5.2, 3.6, 11.0, 0xdc2626, -2, 2.2, 0); // Fire Truck body
          addBox(5.3, 1.4, 2.8, 0xbae6fd, -2, 2.8, 4.4, true); // Windshield
          addBox(1.8, 0.4, 9.5, 0xfef08a, -2, 4.2, -0.5, true); // Roof Ladder
          addBox(0.4, 6.2, 0.4, 0xfacc15, 7, 3.2, -5, true); // Brass Fire Pole
        } else if (t === 'planetarium') {
          // Giant glowing Sun, Saturn with ring, Earth & Observatory Telescope
          const sun = new THREE.Mesh(new THREE.SphereGeometry(2.0, 14, 14), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
          sun.position.set(0, 3.6, 0);
          group.add(sun);
          const saturn = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
          saturn.position.set(-6, 3.8, -4);
          group.add(saturn);
          const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 2.4, 18), new THREE.MeshBasicMaterial({ color: 0xfde68a, side: THREE.DoubleSide }));
          ring.rotation.x = Math.PI / 2.4;
          ring.position.set(-6, 3.8, -4);
          group.add(ring);
          addBox(1.2, 2.2, 3.2, 0x38bdf8, 6, 1.6, 4); // Telescope
        } else if (t === 'library') {
          // 6 Tall Bookshelves + Reading Tables with Green Lamps
          [-7, 0, 7].forEach((bz) => {
            addBox(8.5, 4.6, 1.2, 0x451a03, -4, 2.5, bz);
            addBox(8.2, 3.8, 1.3, 0xf59e0b, -4, 2.5, bz);
          });
          addBox(4.0, 1.1, 6.0, 0x92400e, 5, 0.75, 0);
          addBox(0.8, 0.9, 0.8, 0x22c55e, 5, 1.6, -1.5, true);
          addBox(0.8, 0.9, 0.8, 0x22c55e, 5, 1.6, 1.5, true);
        } else if (t === 'supermarket') {
          // 3 Stocked Grocery Aisles + Checkout Conveyor Counter
          [-6, 0, 6].forEach((az) => {
            addBox(9.0, 3.4, 1.4, 0x16a34a, -3, 1.9, az);
            addBox(8.6, 2.4, 1.5, 0xf97316, -3, 2.0, az);
          });
          addBox(2.2, 1.2, 8.0, 0x0f172a, 6, 0.8, 0);
        } else if (t === 'bowling') {
          // 3 Polished Maple Bowling Lanes + Glowing Pins at North End
          [-6, 0, 6].forEach((lx) => {
            addBox(3.4, 0.15, 16.0, 0xfbbf24, lx, 0.3, -1);
            [-0.8, 0, 0.8].forEach((px) => {
              addBox(0.35, 1.1, 0.35, 0xffffff, lx + px, 0.9, -8, true);
            });
            addBox(3.2, 1.6, 0.25, 0xec4899, lx, 4.2, -9.2, true); // Lane Scoreboard
          });
        } else if (t === 'diner') {
          // Red Diner Booths + Glowing Brick Pizza Oven
          [[-6, -4], [-6, 4], [6, -4], [6, 4]].forEach(([bx, bz]) => {
            addBox(4.2, 1.2, 1.2, 0xef4444, bx, 0.8, bz - 1.4);
            addBox(4.2, 1.2, 1.2, 0xef4444, bx, 0.8, bz + 1.4);
            addBox(4.0, 1.0, 1.4, 0xf8fafc, bx, 0.7, bz);
          });
          addBox(6.5, 4.2, 3.0, 0x7c2d12, 0, 2.3, 8); // Pizza Oven
          addBox(3.2, 1.6, 0.2, 0xf97316, 0, 1.8, 6.4, true); // Oven Fire Glow
        } else if (t === 'car_showroom') {
          // 2 Turntables with Red & Cyan Blocky Sports Cars
          [[-5.5, 0xef4444], [5.5, 0x06b6d4]].forEach(([cx, carCol]) => {
            const pad = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.3, 18), new THREE.MeshBasicMaterial({ color: 0x94a3b8 }));
            pad.position.set(cx, 0.35, 1);
            group.add(pad);
            addBox(3.2, 1.1, 6.2, carCol, cx, 1.1, 1); // Car Chassis
            addBox(2.8, 0.9, 3.0, 0xbae6fd, cx, 1.9, 0.6, true); // Cabin Glass
          });
        } else if (t === 'botanical') {
          // Central Blue Koi Pond + 4 Blossom Trees
          addBox(8.0, 0.4, 8.0, 0x0284c7, 0, 0.4, 0, true);
          [[-7, -7, 0xf472b6], [7, -7, 0x34d399], [-7, 7, 0xa78bfa], [7, 7, 0xfacc15]].forEach(([tx, tz, leafCol]) => {
            addBox(1.0, 3.2, 1.0, 0x78350f, tx, 1.8, tz);
            addBox(3.8, 3.2, 3.8, leafCol, tx, 4.2, tz, true);
          });
        } else if (t === 'pharmacy') {
          // City Pharmacy & Drugstore: Prescription Counter, Green Cross Sign & Medicine Aisles
          addBox(10.0, 1.3, 2.2, 0x059669, 0, 0.85, -7); // Pharmacist Counter
          addBox(2.4, 2.4, 0.3, 0x10b981, 0, 3.6, -9.5, true); // Green Pharmacy Cross Emblem
          [-5.5, 0, 5.5].forEach((ax) => {
            addBox(2.0, 3.2, 7.5, 0xf8fafc, ax, 1.8, 1.5); // Medicine Shelving Aisle
            addBox(2.1, 2.2, 7.2, 0x38bdf8, ax, 1.9, 1.5); // Medicine Bottles & Boxes
          });
        } else if (t === 'post_office') {
          // Metro Post & Logistics HQ: Parcel Sorting Counter, Express Mailboxes & Package Racks
          addBox(10.0, 1.3, 2.2, 0x0284c7, 0, 0.85, -6);
          [-6, -2, 2, 6].forEach((mx, mIdx) => {
            addBox(1.6, 2.4, 1.6, mIdx % 2 === 0 ? 0x1d4ed8 : 0xdc2626, mx, 1.4, 3);
            addBox(2.2, 1.4, 1.8, 0xd97706, mx, 0.9, -2);
          });
        } else if (t === 'concert_hall') {
          // Raised Stage + Glossy Grand Piano + Velvet Seating
          addBox(16.0, 1.0, 7.0, 0x78350f, 0, 0.7, -6);
          addBox(3.6, 1.6, 4.2, 0x090d16, -3, 1.8, -6); // Grand Piano
          addBox(1.2, 2.8, 0.4, 0xfacc15, 4, 2.2, -6, true); // Golden Harp
          [1, 5].forEach((sz) => {
            addBox(14.0, 1.0, 1.8, 0xbe123c, 0, 0.7, sz);
          });
        } else if (t === 'tv_studio') {
          // Green Screen Wall + News Anchor Desk + Studio Cameras
          addBox(16.0, 5.2, 0.4, 0x22c55e, 0, 2.8, -9, true);
          addBox(7.0, 1.3, 2.4, 0x0284c7, 0, 0.85, -4);
          [-4, 4].forEach((cx) => {
            addBox(1.2, 2.4, 1.8, 0x1e293b, cx, 1.4, 3);
          });
        } else if (t === 'gold_bank') {
          // Open Steel Bank Vault + Stacks of Gleaming Gold Bars
          addBox(10.0, 5.0, 6.0, 0x475569, 0, 2.7, -6);
          [-2.5, 0, 2.5].forEach((gx) => {
            addBox(2.0, 1.8, 3.2, 0xfacc15, gx, 1.1, -6, true);
          });
          addBox(14.0, 1.4, 1.6, 0x334155, 0, 0.9, 2);
        } else if (t === 'aquarium') {
          // Giant Glowing Central Water Tank + Colorful Coral & Fish
          addBox(12.0, 5.6, 10.0, 0x06b6d4, 0, 3.0, -1, true);
          [[-3, 0xf97316], [0, 0xfacc15], [3, 0xec4899]].forEach(([fx, fcol]) => {
            addBox(1.4, 0.9, 2.2, fcol, fx, 3.2, -1, true);
          });
        } else if (t === 'dojo') {
          // Tatami Mat Center + 3 Wooden Wing-Chun Dummies + Scroll Banner
          addBox(14.0, 0.15, 16.0, 0xfde047, 0, 0.3, 0);
          [-6, 0, 6].forEach((dz) => {
            addBox(1.0, 3.2, 1.0, 0x78350f, -5, 1.8, dz);
            addBox(2.4, 0.35, 0.35, 0x78350f, -4.4, 2.4, dz);
          });
        } else if (t === 'fashion') {
          // Illuminated Catwalk Runway + 4 Neon Mannequins
          addBox(14.0, 0.6, 4.5, 0xf472b6, -2, 0.5, 0, true);
          [[-6, -6, 0x22d3ee], [2, -6, 0xa855f7], [-6, 6, 0xfacc15], [2, 6, 0x10b981]].forEach(([mx, mz, mcol]) => {
            addBox(1.1, 3.2, 1.1, mcol, mx, 1.8, mz, true);
          });
        } else if (t === 'record_shop') {
          // Vinyl Browsing Bins + Stage with Drum Kit & Amplifiers
          addBox(8.0, 1.0, 6.0, 0x7c3aed, -5, 0.7, -5);
          addBox(2.2, 1.8, 2.2, 0xf43f5e, -5, 1.9, -5, true); // Drum Kit
          [-4, 2].forEach((rz) => {
            addBox(6.0, 1.3, 2.0, 0xd97706, 2, 0.85, rz);
          });
        } else if (t === 'pet_shop') {
          // Fenced Puppy & Kitten Playpen + Cute Mini Blocky Pets
          addBox(10.0, 0.9, 10.0, 0x84cc16, -2, 0.65, 0);
          [[-4, -2, 0xf59e0b], [0, 2, 0xf8fafc], [-2, 3, 0xf472b6], [1, -3, 0x38bdf8]].forEach(([px, pz, pcol]) => {
            addBox(1.1, 1.0, 1.4, pcol, px, 1.3, pz, true);
          });
        } else if (t === 'barber_salon') {
          // Metro Barber & Hair Salon: Barber Pole, 4 Styling Chairs, Lit Mirrors & Waiting Sofa
          addBox(0.8, 3.6, 0.8, 0xef4444, -6, 2.0, -6, true); // Classic Barber Pole
          [-6, -2, 2, 6].forEach((sz) => {
            addBox(1.8, 1.2, 1.8, 0xdc2626, 2, 0.8, sz); // Barber Styling Chair
            addBox(0.3, 2.4, 2.2, 0xbae6fd, 5.5, 2.4, sz, true); // Lit Salon Mirror
            addBox(1.2, 1.0, 2.2, 0x334155, 4.8, 0.7, sz); // Counter Vanity
          });
          addBox(2.2, 1.0, 7.0, 0x78350f, -5, 0.7, 2); // Customer Waiting Bench
        } else if (t === 'ice_cream') {
          // Gelato Counter with Colorful Tubs + Giant Sundae Sculpture
          addBox(3.0, 1.4, 12.0, 0xf472b6, 4, 0.9, 0);
          addBox(2.4, 3.8, 2.4, 0xfde047, -3, 2.1, 0, true);
          addBox(2.8, 1.6, 2.8, 0xec4899, -3, 4.2, 0, true);
        } else if (t === 'esports') {
          // Blue vs Red Gaming Rigs + Championship Trophy Stage
          addBox(10.0, 1.3, 2.2, 0x0284c7, 0, 0.85, -5);
          addBox(10.0, 1.3, 2.2, 0xe11d48, 0, 0.85, 5);
          addBox(2.2, 2.8, 2.2, 0xfacc15, 5, 1.6, 0, true);
        } else if (t === 'skate_park') {
          // Quarter-Pipe Skate Ramps & Central Grind Rail
          addBox(14.0, 2.2, 4.0, 0xd97706, 0, 1.3, -8);
          addBox(14.0, 2.2, 4.0, 0xd97706, 0, 1.3, 8);
          addBox(0.5, 1.1, 10.0, 0x38bdf8, 0, 0.75, 0, true);
        } else if (t === 'hotel') {
          // Indoor Lobby Fountain + Red Carpet + Check-in Desk
          addBox(6.0, 1.2, 6.0, 0x38bdf8, 0, 0.8, 0, true);
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
        const tex = skyscraperTextures[sp.pal];
        const pal = skyscraperPalettes[sp.pal];
        const matWall = new THREE.MeshLambertMaterial({ map: tex });
        const matRoof = new THREE.MeshLambertMaterial({ color: 0x1e293b });

        const groundLobbyH = 6.5;
        const bGroup = new THREE.Group();
        bGroup.position.set(sp.x, 0, sp.z);
        worldGroup.add(bGroup);

        // 1. Custom Walk-In Ground Floor Slab
        const lobbyFloor = new THREE.Mesh(
          new THREE.BoxGeometry(sp.w - 0.4, 0.32, sp.d - 0.4),
          new THREE.MeshLambertMaterial({ color: sp.floorColor || 0x334155 })
        );
        lobbyFloor.position.set(0, 0.16, 0);
        lobbyFloor.receiveShadow = true;
        bGroup.add(lobbyFloor);

        // 2. Hollow Walk-In Ground Floor Walls & Automatic Sliding Door
        buildHollowBuilding({
          group: bGroup,
          worldX: sp.x,
          worldZ: sp.z,
          w: sp.w,
          d: sp.d,
          h: groundLobbyH,
          minY: 0,
          wallColor: 0x1e293b,
          roofColor: 0x0f172a,
          doorSide: sp.door,
          doorOffset: 0,
          doorWidth: 5.2,
          doorHeight: 4.4,
          doorColor: pal.roof,
          addCeiling: false,
          tag: 'skyscraper_lobby_' + idx
        });

        // 3. Populate Unique Themed Interior inside this Skyscraper!
        populateUniqueInterior(bGroup, sp);

        // 4. Exterior Entrance Signboard above the Doorway
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

        // 5. Add Walkable Floors & Working 3D Elevator inside this Skyscraper!
        // Metro Royal Hotel ('hotel') alone gets 1 extra floor (9 levels total: 1F..8F indoor + 9F Rooftop Swimming Pool with NO helipad)
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

        // The 8F Helipad Roof (at y = (skyLevels - 1) * groundLobbyH = 45.5m) is the TOPMOST part of the building!
        // Add a sleek neon architectural cornice around the 8F Helipad Roof perimeter with NOTHING above it!
        const topRoofY = (skyLevels - 1) * groundLobbyH;
        const crown = new THREE.Mesh(
          new THREE.BoxGeometry(sp.w + 0.8, 0.6, sp.d + 0.8),
          new THREE.MeshBasicMaterial({ color: pal.roof })
        );
        crown.position.set(sp.x, topRoofY + 0.1, sp.z);
        worldGroup.add(crown);

        mapBuildings.push({ x: sp.x, z: sp.z, w: sp.w, d: sp.d, color: '#475569', label: sp.title });
      });

      // Blocky Trees around the Town Hall Plaza
      const treeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
      const treeLeafMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });
      const plazaTrees = [
        [-38, -34], [38, -34], [-38, 34], [38, 34],
        [-22, 34], [22, 34]
      ];
      plazaTrees.forEach(([tx, tz]) => {
        const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.6, 1.2), treeTrunkMat);
        trunk.position.set(tx, 1.8, tz);
        trunk.castShadow = true;
        worldGroup.add(trunk);

        const leaves = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.8, 4.4), treeLeafMat);
        leaves.position.set(tx, 5.6, tz);
        leaves.castShadow = true;
        worldGroup.add(leaves);
        shootableMeshes.push(leaves);
        addBoxCollider(tx, tz, 1.6, 1.6, 8, 'tree');
      });

      // ------------------------------------------
      // 4D. OUTSKIRTS PAINTBALL ARENA (Centered at x: 310, z: 0)
      // ------------------------------------------
      const ARENA_CENTER = { x: 310, z: 0 };
      const ARENA_HALF_W = 46; // Total 92 x 92 meters
      const ARENA_HALF_D = 46;

      const arenaGroup = new THREE.Group();
      arenaGroup.position.set(ARENA_CENTER.x, 0, ARENA_CENTER.z);
      worldGroup.add(arenaGroup);

      // Arena Turf Floor with Center Line
      const arenaFloor = new THREE.Mesh(
        new THREE.BoxGeometry(ARENA_HALF_W * 2, 0.3, ARENA_HALF_D * 2),
        new THREE.MeshLambertMaterial({ color: 0x14532d })
      );
      arenaFloor.position.y = 0.15;
      arenaFloor.receiveShadow = true;
      arenaGroup.add(arenaFloor);
      shootableMeshes.push(arenaFloor);

      const centerDivider = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.34, ARENA_HALF_D * 2 - 2),
        new THREE.MeshBasicMaterial({ color: 0xf8fafc })
      );
      centerDivider.position.y = 0.17;
      arenaGroup.add(centerDivider);

      // Perimeter Arena Walls
      const arenaWallMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
      const wallSpecs = [
        { x: 0, z: -ARENA_HALF_D, w: ARENA_HALF_W * 2, d: 2, h: 7 },
        { x: 0, z: ARENA_HALF_D, w: ARENA_HALF_W * 2, d: 2, h: 7 },
        { x: -ARENA_HALF_W, z: 0, w: 2, d: ARENA_HALF_D * 2, h: 7 },
        { x: ARENA_HALF_W, z: 0, w: 2, d: ARENA_HALF_D * 2, h: 7 }
      ];
      wallSpecs.forEach((ws) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(ws.w, ws.h, ws.d), arenaWallMat);
        wall.position.set(ws.x, ws.h / 2, ws.z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        arenaGroup.add(wall);
        shootableMeshes.push(wall);
        addBoxCollider(ARENA_CENTER.x + ws.x, ARENA_CENTER.z + ws.z, ws.w, ws.d, ws.h, 'arena_wall');
      });

      // Arena Banner Sign overhead
      const arenaSignTex = createSignTexture(
        'OUTSKIRTS PAINTBALL ARENA',
        'BLUE SQUAD vs RED BOTS',
        '#0f172a',
        '#22d3ee',
        '#ffffff'
      );
      const arenaBanner = new THREE.Mesh(
        new THREE.BoxGeometry(28, 4.5, 0.8),
        new THREE.MeshBasicMaterial({ map: arenaSignTex })
      );
      arenaBanner.position.set(0, 9.2, -ARENA_HALF_D);
      arenaGroup.add(arenaBanner);

      // Symmetrical Paintball Bunkers, Crates & Cover Blocks inside the Outskirts Arena
      const bunkerConfigs = [
        // Central X-Bunker
        { x: 0, z: 0, w: 6, d: 6, h: 4.2, color: 0xfacc15 },
        { x: 0, z: -16, w: 8, d: 3.2, h: 3.6, color: 0xec4899 },
        { x: 0, z: 16, w: 8, d: 3.2, h: 3.6, color: 0xec4899 },

        // Blue Side (West: negative X relative to arena center)
        { x: -15, z: -10, w: 3.6, d: 7, h: 3.6, color: 0x06b6d4 },
        { x: -15, z: 10, w: 3.6, d: 7, h: 3.6, color: 0x06b6d4 },
        { x: -24, z: 0, w: 4.5, d: 9, h: 4.0, color: 0x22d3ee },
        { x: -28, z: -22, w: 6, d: 5, h: 3.4, color: 0x0284c7 },
        { x: -28, z: 22, w: 6, d: 5, h: 3.4, color: 0x0284c7 },
        // Blue Base Spawn Shield
        { x: -38, z: 0, w: 2.5, d: 14, h: 3.8, color: 0x38bdf8 },

        // Red Side (East: positive X relative to arena center)
        { x: 15, z: -10, w: 3.6, d: 7, h: 3.6, color: 0xf43f5e },
        { x: 15, z: 10, w: 3.6, d: 7, h: 3.6, color: 0xf43f5e },
        { x: 24, z: 0, w: 4.5, d: 9, h: 4.0, color: 0xe11d48 },
        { x: 28, z: -22, w: 6, d: 5, h: 3.4, color: 0xbe123c },
        { x: 28, z: 22, w: 6, d: 5, h: 3.4, color: 0xbe123c },
        // Red Base Spawn Shield
        { x: 38, z: 0, w: 2.5, d: 14, h: 3.8, color: 0xfb7185 }
      ];

      bunkerConfigs.forEach((b) => {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(b.w, b.h, b.d),
          new THREE.MeshLambertMaterial({ color: b.color })
        );
        mesh.position.set(b.x, b.h / 2 + 0.15, b.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        arenaGroup.add(mesh);
        shootableMeshes.push(mesh);
        addBoxCollider(ARENA_CENTER.x + b.x, ARENA_CENTER.z + b.z, b.w, b.d, b.h, 'bunker');
      });

      // Return-to-City Exit Portal Pad in the corner of Blue Base (-41, -38)
      const exitPadMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.4, 0.4, 16),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      exitPadMesh.position.set(-40, 0.35, -38);
      arenaGroup.add(exitPadMesh);

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

        // Materials (cloned per character so paint splatters can tint them!)
        const headMat = new THREE.MeshLambertMaterial({ color: skinColor });
        const torsoMat = new THREE.MeshLambertMaterial({ color: shirtColor });
        const limbMat = new THREE.MeshLambertMaterial({ color: pantsColor });
        const armMat = new THREE.MeshLambertMaterial({ color: shirtColor });

        // Legs (pivoted at hip y = 1.1)
        const leftLegPivot = new THREE.Group();
        leftLegPivot.position.set(-0.28, 1.1, 0);
        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.1, 0.46), limbMat);
        leftLeg.position.y = -0.55;
        leftLeg.castShadow = true;
        leftLegPivot.add(leftLeg);
        root.add(leftLegPivot);

        const rightLegPivot = new THREE.Group();
        rightLegPivot.position.set(0.28, 1.1, 0);
        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.1, 0.46), limbMat);
        rightLeg.position.y = -0.55;
        rightLeg.castShadow = true;
        rightLegPivot.add(rightLeg);
        root.add(rightLegPivot);

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.62), torsoMat);
        torso.position.y = 1.75;
        torso.castShadow = true;
        root.add(torso);

        // Tactical Paintball Vest Stripe
        const vest = new THREE.Mesh(
          new THREE.BoxGeometry(1.14, 0.45, 0.66),
          new THREE.MeshBasicMaterial({ color: visorColor })
        );
        vest.position.y = 1.85;
        root.add(vest);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.92, 0.92), headMat);
        head.position.y = 2.92;
        head.castShadow = true;
        root.add(head);

        // Boxy Goggles / Visor on front of face (+Z is forward for character rig)
        const visor = new THREE.Mesh(
          new THREE.BoxGeometry(0.82, 0.28, 0.14),
          new THREE.MeshBasicMaterial({ color: visorColor })
        );
        visor.position.set(0, 2.98, 0.45);
        root.add(visor);

        // Arms (pivoted at shoulder y = 2.3)
        const leftArmPivot = new THREE.Group();
        leftArmPivot.position.set(-0.78, 2.3, 0);
        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.15, 0.42), armMat);
        leftArm.position.y = -0.5;
        leftArm.castShadow = true;
        leftArmPivot.add(leftArm);
        root.add(leftArmPivot);

        const rightArmPivot = new THREE.Group();
        rightArmPivot.position.set(0.78, 2.3, 0);
        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.15, 0.42), armMat);
        rightArm.position.y = -0.5;
        rightArm.castShadow = true;
        rightArmPivot.add(rightArm);

        // Paintball Marker (Gun + Hopper) attached to Right Arm
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
        rig.root.rotation.x = 0;
        rig.root.rotation.z = 0;
        rig.leftArmPivot.rotation.z = 0;
        rig.rightArmPivot.rotation.z = 0;
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
        worldX: -135 - 1.8, // -136.8
        worldZ: 135 + 1.6,  // 136.6
        halfW: 6.05,        // Inside the 12.6m wide pool basin
        halfD: 4.05,        // Inside the 8.6m deep pool basin
        deckY: 52.4,        // 9F Rooftop deck slab height (8 * 6.5 + 0.4)
        waterSurfaceY: 53.31
      };

      const poolRipples = [];
      const poolDroplets = [];
      const rippleRingGeo = new THREE.RingGeometry(0.28, 0.44, 20);
      const dropletGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
      const dropletMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

      function spawnWaterSplash(wx, wy, wz, dropletCount = 10) {
        // 1. Expanding white/cyan water surface ripple ring
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

        // 2. 3D Water Splash Droplets
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

      function animateSwimmingCharacter(rig, speed, dt, timeSec) {
        if (speed > 0.2) {
          // Prone Freestyle / Crawl Swimming Animation along the water surface
          rig.walkPhase += dt * speed * 1.15;
          const sp = rig.walkPhase;
          rig.root.position.set(player.x, player.y + 0.68, player.z);
          rig.root.rotation.y = player.yaw + Math.PI;
          rig.root.rotation.x = -1.24; // Prone horizontal swimmer body angle
          rig.root.rotation.z = Math.cos(sp) * 0.14; // Swimmer shoulder roll

          // Alternating overhead freestyle arm strokes
          rig.leftArmPivot.rotation.x = Math.sin(sp) * 1.45 - 1.25;
          rig.rightArmPivot.rotation.x = Math.sin(sp + Math.PI) * 1.45 - 1.25;
          rig.leftArmPivot.rotation.z = 0.22;
          rig.rightArmPivot.rotation.z = -0.22;

          // Rapid alternating flutter-kick legs
          rig.leftLegPivot.rotation.x = Math.sin(sp * 2.4) * 0.52;
          rig.rightLegPivot.rotation.x = -Math.sin(sp * 2.4) * 0.52;
        } else {
          // Treading Water Animation (Bobbing in the pool with sculling arms & frog kick)
          const bob = Math.sin(timeSec * 3.2) * 0.08;
          rig.root.position.set(player.x, player.y - 0.42 + bob, player.z);
          rig.root.rotation.y = player.yaw + Math.PI;
          rig.root.rotation.x = -0.18;
          rig.root.rotation.z = Math.sin(timeSec * 2.0) * 0.05;

          rig.leftArmPivot.rotation.x = -0.85 + Math.sin(timeSec * 3.6) * 0.25;
          rig.rightArmPivot.rotation.x = -0.85 + Math.cos(timeSec * 3.6) * 0.25;
          rig.leftArmPivot.rotation.z = 0.48 + Math.sin(timeSec * 3.6) * 0.25;
          rig.rightArmPivot.rotation.z = -0.48 - Math.sin(timeSec * 3.6) * 0.25;

          rig.leftLegPivot.rotation.x = Math.sin(timeSec * 4.2) * 0.35;
          rig.rightLegPivot.rotation.x = -Math.sin(timeSec * 4.2) * 0.35;
        }
      }

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
      scene.add(playerRig.root);

      const player = {
        x: 0,
        y: 0,
        z: 28, // Starts in the City Center Plaza facing Town Hall & Paintball Shop!
        vy: 0,
        yaw: Math.PI, // Facing North toward Town Hall & Shop
        pitch: 0.18,
        radius: 0.9,
        hp: 100,
        maxHp: 100,
        ammo: 30,
        maxAmmo: 30,
        splats: 0,
        inArena: false,
        inHelicopter: false,
        isSwimming: false,
        swimStrokeTimer: 0,
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

        // Landing Skids & Struts
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

        // Main Cabin Fuselage (-Z is forward!)
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
        const trimMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const glassMat = new THREE.MeshLambertMaterial({
          color: 0xbae6fd,
          transparent: true,
          opacity: 0.48
        });

        const cabinBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 4.6), bodyMat);
        cabinBase.position.set(0, 1.35, 0);
        cabinBase.castShadow = true;
        tiltGroup.add(cabinBase);

        const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.86, 0.32, 4.64), trimMat);
        stripe.position.set(0, 1.35, 0);
        tiltGroup.add(stripe);

        const cockpitCanopy = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.35, 2.8), glassMat);
        cockpitCanopy.position.set(0, 2.4, -0.7);
        tiltGroup.add(cockpitCanopy);

        const rearCabin = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.4, 1.8), bodyMat);
        rearCabin.position.set(0, 2.4, 1.4);
        rearCabin.castShadow = true;
        tiltGroup.add(rearCabin);

        // Tail Boom extending toward +Z
        const tailBoom = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 5.2), bodyMat);
        tailBoom.position.set(0, 2.35, 4.6);
        tailBoom.castShadow = true;
        tiltGroup.add(tailBoom);

        const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.8, 1.1), trimMat);
        tailFin.position.set(0, 3.1, 6.8);
        tiltGroup.add(tailFin);

        // Rotor Mast & 4-Blade Main Rotor
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 12), skidMat);
        mast.position.set(0, 3.35, 0.3);
        tiltGroup.add(mast);

        const mainRotor = new THREE.Group();
        mainRotor.position.set(0, 3.68, 0.3);
        const bladeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const bladeTipMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

        const blade1 = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.08, 0.55), bladeMat);
        mainRotor.add(blade1);
        const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 10.6), bladeMat);
        mainRotor.add(blade2);

        [-5.1, 5.1].forEach((bx) => {
          const tip = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.58), bladeTipMat);
          tip.position.set(bx, 0, 0);
          mainRotor.add(tip);
        });
        tiltGroup.add(mainRotor);

        // Spinning Tail Rotor
        const tailRotor = new THREE.Group();
        tailRotor.position.set(0.28, 3.1, 6.85);
        const tBlade1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.1, 0.28), bladeMat);
        const tBlade2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 2.1), bladeMat);
        tailRotor.add(tBlade1);
        tailRotor.add(tBlade2);
        tiltGroup.add(tailRotor);

        return { root, tiltGroup, mainRotor, tailRotor };
      }

      const heliModel = createHelicopterModel();
      scene.add(heliModel.root);

      // Start the Helicopter parked on the Police HQ 8F Helipad Roof (x: -25, z: -80, y: 45.9)
      // AND allow summoning/boarding it from ANY building's topmost Helipad Roof!
      const helicopter = {
        model: heliModel,
        x: -27.2,
        y: 7 * 6.5 + 0.45, // 8F Helipad Roof of Police HQ
        z: -80,
        vx: 0,
        vy: 0,
        vz: 0,
        yaw: 0,
        rotorAngle: 0,
        rotorAudioTimer: 0,
        ascendHeld: false,
        descendHeld: false
      };
      helicopter.model.root.position.set(helicopter.x, helicopter.y, helicopter.z);

      // ==========================================
      // 6C. OPERATIONAL CITY VEHICLES (TAXI, POLICE CAR, AMBULANCE, FIRE ENGINE)
      // ==========================================
      player.activeVehicle = null;
      const driveableVehicles = [];

      function createGroundVehicleModel(type) {
        const root = new THREE.Group();
        const wheels = [];
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
        const rimMat = new THREE.MeshBasicMaterial({ color: 0xcbd5e1 });
        const glassMat = new THREE.MeshLambertMaterial({
          color: 0xbae6fd,
          transparent: true,
          opacity: 0.55
        });
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

        const isHeavy = type === 'fire_engine' || type === 'ambulance';
        const chassisW = isHeavy ? 3.1 : 2.6;
        const chassisL = type === 'fire_engine' ? 8.6 : (type === 'ambulance' ? 6.6 : 5.2);

        // Wheels (-Z is forward!)
        const wheelZPositions = type === 'fire_engine' ? [-2.8, 0.2, 2.8] : [-1.7, 1.7];
        wheelZPositions.forEach((wz) => {
          [-chassisW / 2 - 0.08, chassisW / 2 + 0.08].forEach((wx) => {
            const wGroup = new THREE.Group();
            wGroup.position.set(wx, 0.55, wz);
            const tire = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.95, 0.95), wheelMat);
            wGroup.add(tire);
            const rim = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.45), rimMat);
            wGroup.add(rim);
            root.add(wGroup);
            wheels.push(wGroup);
          });
        });

        let leftBeacon = null;
        let rightBeacon = null;

        if (type === 'taxi') {
          // Yellow Taxi Sedan with Checkered Stripe & glowing TAXI Roof Sign
          const bodyMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
          const lower = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 1.0, chassisL), bodyMat);
          lower.position.set(0, 0.95, 0);
          lower.castShadow = true;
          root.add(lower);

          const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(chassisW + 0.06, 0.22, chassisL + 0.04),
            new THREE.MeshBasicMaterial({ color: 0x0f172a })
          );
          stripe.position.set(0, 1.0, 0);
          root.add(stripe);

          const cabin = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.3, 0.95, 2.7), bodyMat);
          cabin.position.set(0, 1.85, 0.15);
          cabin.castShadow = true;
          root.add(cabin);

          const wind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.22, 0.78, 2.82), glassMat);
          wind.position.set(0, 1.85, 0.15);
          root.add(wind);

          const taxiTop = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.38, 0.55),
            new THREE.MeshBasicMaterial({ color: 0xfef08a })
          );
          taxiTop.position.set(0, 2.5, 0.1);
          root.add(taxiTop);
          leftBeacon = taxiTop;
        } else if (type === 'police') {
          // Black & White Police Interceptor with Push-Bar & Red/Blue Lightbar
          const blackMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
          const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

          const lower = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 1.0, chassisL), blackMat);
          lower.position.set(0, 0.95, 0);
          lower.castShadow = true;
          root.add(lower);

          const doors = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.05, 0.85, 2.5), whiteMat);
          doors.position.set(0, 0.98, 0.1);
          root.add(doors);

          const cabin = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.3, 0.95, 2.7), whiteMat);
          cabin.position.set(0, 1.85, 0.15);
          cabin.castShadow = true;
          root.add(cabin);

          const wind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.22, 0.78, 2.82), glassMat);
          wind.position.set(0, 1.85, 0.15);
          root.add(wind);

          // Front Push Bumper
          const pushBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.75, 0.3), blackMat);
          pushBar.position.set(0, 0.85, -chassisL / 2 - 0.15);
          root.add(pushBar);

          // Red & Blue Lightbar
          leftBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.45), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          leftBeacon.position.set(-0.45, 2.48, 0.1);
          root.add(leftBeacon);

          rightBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.45), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
          rightBeacon.position.set(0.45, 2.48, 0.1);
          root.add(rightBeacon);
        } else if (type === 'ambulance') {
          // White & Red Medical Ambulance Box Van with Red Cross Emblems & Emergency Beacons
          const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
          const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

          // Front Cab
          const cab = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 2.1, 2.2), whiteMat);
          cab.position.set(0, 1.5, -1.9);
          cab.castShadow = true;
          root.add(cab);

          const cabWind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.2, 0.9, 0.25), glassMat);
          cabWind.position.set(0, 1.95, -2.95);
          root.add(cabWind);

          // Rear Medical Box Module
          const medBox = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.2, 2.7, 4.3), whiteMat);
          medBox.position.set(0, 1.85, 1.25);
          medBox.castShadow = true;
          root.add(medBox);

          const medStripe = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.26, 0.45, 4.34), redMat);
          medStripe.position.set(0, 1.35, 1.25);
          root.add(medStripe);

          // Red Cross Emblems on both sides of the Ambulance
          const crossV = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.3, 1.2, 0.4), redMat);
          crossV.position.set(0, 2.3, 1.25);
          root.add(crossV);

          const crossH = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.3, 0.4, 1.2), redMat);
          crossH.position.set(0, 2.3, 1.25);
          root.add(crossH);

          // Emergency Roof Lightbar
          leftBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.32, 0.5), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          leftBeacon.position.set(-0.6, 3.35, -0.5);
          root.add(leftBeacon);

          rightBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.32, 0.5), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
          rightBeacon.position.set(0.6, 3.35, -0.5);
          root.add(rightBeacon);
        } else if (type === 'fire_engine') {
          // Heavy Red Fire Engine with Chrome Trim, Roof Extension Ladder & Flashing Lightbar
          const redMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
          const chromeMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
          const ladderMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

          const body = new THREE.Mesh(new THREE.BoxGeometry(chassisW, 2.5, chassisL), redMat);
          body.position.set(0, 1.75, 0);
          body.castShadow = true;
          root.add(body);

          const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(chassisW + 0.06, 0.35, chassisL + 0.04),
            chromeMat
          );
          stripe.position.set(0, 1.25, 0);
          root.add(stripe);

          const cabWind = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.25, 1.0, 0.3), glassMat);
          cabWind.position.set(0, 2.25, -chassisL / 2 + 0.05);
          root.add(cabWind);

          // Roof White/Yellow Extension Ladder
          const ladder = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, chassisL - 1.4), ladderMat);
          ladder.position.set(0, 3.25, 0.4);
          root.add(ladder);

          leftBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.34, 0.5), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
          leftBeacon.position.set(-0.65, 3.18, -chassisL / 2 + 0.8);
          root.add(leftBeacon);

          rightBeacon = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.34, 0.5), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
          rightBeacon.position.set(0.65, 3.18, -chassisL / 2 + 0.8);
          root.add(rightBeacon);
        }

        // Front Headlights & Rear Taillights
        [-chassisW * 0.34, chassisW * 0.34].forEach((lx) => {
          const hl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.15), headlightMat);
          hl.position.set(lx, 0.95, -chassisL / 2 - 0.04);
          root.add(hl);

          const tl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.15), taillightMat);
          tl.position.set(lx, 0.95, chassisL / 2 + 0.04);
          root.add(tl);
        });

        return { root, wheels, leftBeacon, rightBeacon };
      }

      const vehicleConfigs = [
        {
          id: 'taxi_1',
          name: 'City Taxi Cab #1',
          icon: '🚕',
          type: 'taxi',
          x: -14.2,
          z: 1.5,
          yaw: Math.PI, // Parked at the Taxi Stand next to Town Hall!
          maxSpeed: 29.0,
          mapColor: '#facc15'
        },
        {
          id: 'taxi_2',
          name: 'City Taxi Cab #2',
          icon: '🚕',
          type: 'taxi',
          x: -14.2,
          z: 9.0,
          yaw: Math.PI, // Parked at the Taxi Stand next to Town Hall!
          maxSpeed: 29.0,
          mapColor: '#facc15'
        },
        {
          id: 'police_1',
          name: 'Police Cruiser #1',
          icon: '🚓',
          type: 'police',
          x: -25.0,
          z: -58.5,
          yaw: -Math.PI / 2, // Parked right near the Police Headquarters (-25, -80)!
          maxSpeed: 34.0,
          mapColor: '#38bdf8'
        },
        {
          id: 'fire_1',
          name: 'Fire Engine #1',
          icon: '🚒',
          type: 'fire_engine',
          x: 25.0,
          z: -58.5,
          yaw: -Math.PI / 2, // Parked right near the Fire Station (25, -80)!
          maxSpeed: 26.0,
          mapColor: '#ef4444'
        },
        {
          id: 'ambulance_1',
          name: 'Emergency Ambulance',
          icon: '🚑',
          type: 'ambulance',
          x: 80.0,
          z: -58.5,
          yaw: -Math.PI / 2, // Parked right next to the Metro Central Hospital (80, -80)!
          maxSpeed: 30.0,
          mapColor: '#f8fafc'
        }
      ];

      vehicleConfigs.forEach((vc) => {
        const model = createGroundVehicleModel(vc.type);
        model.root.position.set(vc.x, 0, vc.z);
        model.root.rotation.y = vc.yaw;
        scene.add(model.root);

        driveableVehicles.push({
          ...vc,
          model,
          speed: 0,
          sirenOn: false,
          sirenTimer: 0,
          sirenPhase: false
        });
      });

      // ==========================================
      // 7. AI CHARACTERS: CITY CITIZENS & PAINTBALL BOTS
      // ==========================================
      const cityNPCs = [];
      const citizenConfigs = [
        // Outdoor Strolling Citizens (Plaza & City Sidewalks)
        { x: -12, z: 18, y: 0, shirt: 0x8b5cf6, visor: 0xc4b5fd, patrolRadius: 14 },
        { x: 14, z: 16, y: 0, shirt: 0x10b981, visor: 0x6ee7b7, patrolRadius: 12 },
        { x: 0, z: -50, y: 0, shirt: 0x0284c7, visor: 0x38bdf8, patrolRadius: 24 },
        { x: -4, z: 50, y: 0, shirt: 0xf59e0b, visor: 0xfde047, patrolRadius: 24 },
        { x: -50, z: 4, y: 0, shirt: 0xec4899, visor: 0xf9a8d4, patrolRadius: 22 },
        { x: 48, z: -18, y: 0, shirt: 0x14b8a6, visor: 0x5eead4, patrolRadius: 18 },

        // Stationary Hosts inside Town Hall, Paintball Shop & Cafe
        { x: 0, z: -19.5, y: 0.8, shirt: 0xb91c1c, visor: 0xfacc15, patrolRadius: 0 }, // Mayor inside Town Hall
        { x: 38.5, z: 3.5, y: 0, shirt: 0xec4899, visor: 0x22d3ee, patrolRadius: 0 }, // Shopkeeper inside Paintball Shop
        { x: 20, z: 8, y: 0, shirt: 0x06b6d4, visor: 0x67e8f9, patrolRadius: 0 }, // Paintball Shop Gate Greeter
        { x: -36, z: 8, y: 0, shirt: 0x0d9488, visor: 0xfde047, patrolRadius: 0 }, // Barista inside Metro Cafe

        // Indoor Walking NPCs inside Key City Buildings
        { x: 0, z: -11, y: 0.35, shirt: 0x6366f1, visor: 0xa5b4fc, patrolRadius: 4.5, minX: -4.5, maxX: 4.5, minZ: -16, maxZ: -6 }, // Town Hall Visitor
        { x: -29, z: 8, y: 0.35, shirt: 0xf97316, visor: 0xfed7aa, patrolRadius: 3.5, minX: -32, maxX: -25, minZ: 3, maxZ: 13 }, // Metro Cafe Patron
        { x: 80, z: -81, y: 0.35, shirt: 0x0ea5e9, visor: 0xe0f2fe, patrolRadius: 5.0, minX: 73, maxX: 87, minZ: -85, maxZ: -73 }, // Doctor inside Metro Central Hospital
        { x: -28, z: -80, y: 0.35, shirt: 0x1d4ed8, visor: 0x93c5fd, patrolRadius: 4.5, minX: -34, maxX: -21, minZ: -86, maxZ: -74 }, // Officer inside Police HQ
        { x: -76, z: 24, y: 0.35, shirt: 0x22c55e, visor: 0xbbf7d0, patrolRadius: 4.8, minX: -82, maxX: -72, minZ: 18, maxZ: 30 }, // Shopper inside SuperMart Grocery
        { x: -76, z: -22, y: 0.35, shirt: 0xd97706, visor: 0xfde68a, patrolRadius: 4.8, minX: -81, maxX: -72, minZ: -28, maxZ: -16 }, // Reader inside Central Library
        { x: 68, z: 6, y: 0.4, shirt: 0x9333ea, visor: 0xe9d5ff, patrolRadius: 5.5, minX: 61, maxX: 76, minZ: -3, maxZ: 14 }, // Violet Tower 1F Lobby Visitor
        { x: 66, z: 0, y: 36.4, shirt: 0xa855f7, visor: 0xf472b6, patrolRadius: 5.5, minX: 62, maxX: 77, minZ: -7, maxZ: 9 }, // 7th Floor Arcade Gamer 1
        { x: 74, z: 8, y: 36.4, shirt: 0x3b82f6, visor: 0x22d3ee, patrolRadius: 5.5, minX: 62, maxX: 77, minZ: -7, maxZ: 9 }  // 7th Floor Arcade Gamer 2
      ];

      citizenConfigs.forEach((cfg, idx) => {
        const rig = createBoxCharacter({
          shirtColor: cfg.shirt,
          visorColor: cfg.visor,
          pantsColor: 0x1e293b,
          hasGun: false // Only paintball area players hold guns!
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
          minX: cfg.minX,
          maxX: cfg.maxX,
          minZ: cfg.minZ,
          maxZ: cfg.maxZ,
          targetX: cfg.x + (Math.random() - 0.5) * cfg.patrolRadius,
          targetZ: cfg.z + (Math.random() - 0.5) * cfg.patrolRadius,
          patrolRadius: cfg.patrolRadius,
          speed: 3.2,
          waitTimer: 0
        });
      });

      // No AI bots on the football courts — Player controls the ball directly!
      const footballBots = [];

      // Paintball Arena AI Bots (3 Blue Teammates + 4 Red Opponents = 7 AI Players)
      const arenaBots = [];
      const botSpecs = [
        // Blue Squad Allies (Team 'blue')
        { name: 'Blue-Bot Alpha', team: 'blue', spawnX: ARENA_CENTER.x - 34, spawnZ: ARENA_CENTER.z - 14 },
        { name: 'Blue-Bot Blitz', team: 'blue', spawnX: ARENA_CENTER.x - 34, spawnZ: ARENA_CENTER.z + 0 },
        { name: 'Blue-Bot Nova', team: 'blue', spawnX: ARENA_CENTER.x - 34, spawnZ: ARENA_CENTER.z + 14 },
        // Red Squad Opponents (Team 'red')
        { name: 'Red-Bot Viper', team: 'red', spawnX: ARENA_CENTER.x + 34, spawnZ: ARENA_CENTER.z - 18 },
        { name: 'Red-Bot Blaze', team: 'red', spawnX: ARENA_CENTER.x + 34, spawnZ: ARENA_CENTER.z - 6 },
        { name: 'Red-Bot Striker', team: 'red', spawnX: ARENA_CENTER.x + 34, spawnZ: ARENA_CENTER.z + 6 },
        { name: 'Red-Bot Rex', team: 'red', spawnX: ARENA_CENTER.x + 34, spawnZ: ARENA_CENTER.z + 18 }
      ];

      botSpecs.forEach((bs, idx) => {
        const isBlue = bs.team === 'blue';
        const rig = createBoxCharacter({
          skinColor: 0xfde68a,
          shirtColor: isBlue ? 0x0284c7 : 0xe11d48,
          pantsColor: 0x0f172a,
          visorColor: isBlue ? 0x22d3ee : 0xfb7185,
          hasGun: true
        });
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
          targetX: bs.spawnX,
          targetZ: bs.spawnZ,
          hp: 100,
          speed: 7.2 + (idx % 3) * 0.5,
          shootCooldown: 0.6 + Math.random() * 0.8,
          retargetTimer: 0
        });
      });

      // ==========================================
      // 8. PAINTBALL PROJECTILES & SPLATTER DECALS
      // ==========================================
      const paintballs = [];
      const paintDecals = [];
      const particles = [];
      const MAX_DECALS = 140;

      const paintPalette = [0x22d3ee, 0xec4899, 0xa3e635, 0xfacc15, 0xf43f5e, 0xa855f7];
      const ballGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const decalGeo = new THREE.CircleGeometry(0.55, 10);

      function spawnPaintball(originX, originY, originZ, dirX, dirY, dirZ, team, shooterName) {
        let colorHex;
        if (team === 'blue') {
          colorHex = 0x22d3ee;
        } else if (team === 'red') {
          colorHex = 0xf43f5e;
        } else {
          colorHex = paintPalette[Math.floor(Math.random() * paintPalette.length)];
        }

        const mat = new THREE.MeshBasicMaterial({ color: colorHex });
        const mesh = new THREE.Mesh(ballGeo, mat);
        mesh.position.set(originX, originY, originZ);
        scene.add(mesh);

        const speed = 44;
        paintballs.push({
          mesh,
          vx: dirX * speed,
          vy: dirY * speed,
          vz: dirZ * speed,
          team,
          shooterName,
          colorHex,
          life: 2.2
        });
      }

      function spawnPaintSplat(x, y, z, normal, colorHex) {
        // Splat Decal
        const decalMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          polygonOffset: true,
          polygonOffsetFactor: -1
        });
        const decal = new THREE.Mesh(decalGeo, decalMat);
        decal.position.set(x + normal.x * 0.04, Math.max(0.18, y + normal.y * 0.04), z + normal.z * 0.04);
        decal.lookAt(x + normal.x, y + normal.y, z + normal.z);
        const s = 0.75 + Math.random() * 0.65;
        decal.scale.set(s, s, s);
        scene.add(decal);
        paintDecals.push(decal);

        if (paintDecals.length > MAX_DECALS) {
          const old = paintDecals.shift();
          scene.remove(old);
        }

        // Splat Droplet Particles
        for (let i = 0; i < 6; i++) {
          const pMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.14, 0.14),
            new THREE.MeshBasicMaterial({ color: colorHex })
          );
          pMesh.position.set(x, y, z);
          scene.add(pMesh);
          particles.push({
            mesh: pMesh,
            vx: (Math.random() - 0.5) * 8,
            vy: 2 + Math.random() * 5,
            vz: (Math.random() - 0.5) * 8,
            life: 0.35 + Math.random() * 0.25
          });
        }
      }

      // ==========================================
      // 9. MATCH STATE & UI UPDATES
      // ==========================================
      let scoreBlue = 0;
      let scoreRed = 0;
      let matchTimeRemaining = 120;
      let matchActive = false;
      const WIN_SCORE = 20;

      const elZoneLabel = document.getElementById('zone-label');
      const elZoneDot = document.getElementById('zone-dot');
      const elObjectiveText = document.getElementById('objective-text');
      const elArenaScoreboard = document.getElementById('arena-scoreboard');
      const elScoreBlue = document.getElementById('score-blue');
      const elScoreRed = document.getElementById('score-red');
      const elMatchTimer = document.getElementById('match-timer');
      const elHpValue = document.getElementById('hp-value');
      const elHpBar = document.getElementById('hp-bar');
      const elAmmoValue = document.getElementById('ammo-value');
      const elPlayerSplats = document.getElementById('player-splats');
      const elGatePrompt = document.getElementById('gate-button-prompt');
      const elTeleportOverlay = document.getElementById('teleport-overlay');
      const elTeleportTitle = document.getElementById('teleport-title');
      const elTeleportSubtitle = document.getElementById('teleport-subtitle');
      const elBtnReturnCity = document.getElementById('btn-return-city');
      const elBtnWayfinder = document.getElementById('btn-wayfinder');
      const elWayfinderLabel = document.getElementById('wayfinder-label');
      const elActivityFeed = document.getElementById('activity-feed');
      const elMatchResultModal = document.getElementById('match-result-modal');
      const elMatchResultTitle = document.getElementById('match-result-title');
      const elMatchResultSummary = document.getElementById('match-result-summary');

      function pushFeedMessage(text, colorClass) {
        const item = document.createElement('div');
        item.className = `glass-panel px-2.5 py-1 rounded-lg text-[11px] font-bold shadow border-l-2 ${colorClass || 'border-l-cyan-400 text-slate-100'}`;
        item.textContent = text;
        elActivityFeed.appendChild(item);
        while (elActivityFeed.children.length > 4) {
          elActivityFeed.removeChild(elActivityFeed.firstChild);
        }
        setTimeout(() => {
          if (item.parentNode) item.parentNode.removeChild(item);
        }, 4200);
      }

      const elGunStatusBadge = document.getElementById('gun-status-badge');
      const elPadShoot = document.getElementById('pad-shoot');

      function updateHUD() {
        if (elGunStatusBadge) {
          if (player.inArena) {
            elGunStatusBadge.textContent = 'Equipped (Arena)';
            elGunStatusBadge.className = 'px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
          } else {
            elGunStatusBadge.textContent = 'Holstered (City)';
            elGunStatusBadge.className = 'px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700';
          }
        }
        elHpValue.textContent = `${Math.max(0, Math.round(player.hp))} / ${player.maxHp}`;
        elHpBar.style.width = `${Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100))}%`;
        elAmmoValue.textContent = `${player.ammo} / ${player.maxAmmo}`;
        elPlayerSplats.textContent = String(player.splats);
        elScoreBlue.textContent = String(scoreBlue);
        elScoreRed.textContent = String(scoreRed);

        const mins = Math.floor(matchTimeRemaining / 60);
        const secs = Math.floor(matchTimeRemaining % 60);
        elMatchTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }

      // ==========================================
      // 10. TELEPORTATION BETWEEN CITY SHOP GATE & OUTSKIRTS ARENA
      // ==========================================
      function startPaintballFightTeleport() {
        SoundFX.playTeleport();
        elTeleportTitle.textContent = 'TELEPORTING TO ARENA...';
        elTeleportSubtitle.textContent = 'Outskirts Paintball Ground • Blue Squad vs Red AI Bots';
        elTeleportOverlay.classList.remove('opacity-0');
        elTeleportOverlay.classList.add('opacity-95');

        // Close any open modal
        document.getElementById('full-map-modal').classList.add('hidden');
        document.getElementById('full-map-modal').classList.remove('flex');
        document.getElementById('settings-modal').classList.add('hidden');
        document.getElementById('settings-modal').classList.remove('flex');
        elMatchResultModal.classList.add('hidden');
        elMatchResultModal.classList.remove('flex');

        setTimeout(() => {
          if (player.activeVehicle) exitGroundVehicle();
          if (player.inHelicopter) exitHelicopter();
          player.inArena = true;
          player.x = ARENA_CENTER.x - 36;
          player.y = 0;
          player.z = ARENA_CENTER.z;
          player.vy = 0;
          player.yaw = -Math.PI / 2; // Face East toward Red Base
          player.hp = 100;
          player.ammo = 30;
          playerRig.torsoMat.color.setHex(playerRig.originalShirtColor);

          // Reset match scores & bots
          scoreBlue = 0;
          scoreRed = 0;
          matchTimeRemaining = 120;
          matchActive = true;

          arenaBots.forEach((b) => {
            b.x = b.spawnX;
            b.z = b.spawnZ;
            b.hp = 100;
            b.rig.torsoMat.color.setHex(b.rig.originalShirtColor);
            b.rig.root.position.set(b.x, 0, b.z);
          });

          elZoneLabel.textContent = 'Outskirts Arena';
          elZoneDot.className = 'w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-ping';
          elObjectiveText.innerHTML = 'Tag the <span class="text-rose-400 font-bold">Red AI Bots</span> with paintballs! Step on the gold exit pad or click <span class="text-amber-300 font-bold">Return to City</span> anytime.';
          elArenaScoreboard.classList.remove('hidden');
          elBtnReturnCity.classList.remove('hidden');
          elBtnReturnCity.classList.add('flex');
          elBtnWayfinder.classList.add('hidden');
          elGatePrompt.classList.add('hidden');

          updateHUD();
          pushFeedMessage('🎯 Match Started! Blue Squad vs Red AI Bots!', 'border-l-fuchsia-400 text-fuchsia-200');
        }, 220);

        setTimeout(() => {
          elTeleportOverlay.classList.remove('opacity-95');
          elTeleportOverlay.classList.add('opacity-0');
        }, 620);
      }

      function returnToCityCenter(targetX, targetZ, targetYaw) {
        SoundFX.playTeleport();
        elTeleportTitle.textContent = 'RETURNING TO CITY...';
        elTeleportSubtitle.textContent = 'Downtown Town Hall Plaza & Skyscrapers';
        elTeleportOverlay.classList.remove('opacity-0');
        elTeleportOverlay.classList.add('opacity-95');

        elMatchResultModal.classList.add('hidden');
        elMatchResultModal.classList.remove('flex');
        document.getElementById('full-map-modal').classList.add('hidden');
        document.getElementById('full-map-modal').classList.remove('flex');

        setTimeout(() => {
          player.inArena = false;
          matchActive = false;
          player.x = typeof targetX === 'number' ? targetX : 14;
          player.y = 0;
          player.z = typeof targetZ === 'number' ? targetZ : 10;
          player.vy = 0;
          player.yaw = typeof targetYaw === 'number' ? targetYaw : -Math.PI / 2;
          player.hp = 100;
          player.ammo = 30;
          playerRig.torsoMat.color.setHex(playerRig.originalShirtColor);

          elZoneLabel.textContent = 'Downtown Plaza';
          elZoneDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
          elObjectiveText.innerHTML = 'Explore the City Center &amp; Town Hall, or walk through the <span class="text-fuchsia-300 font-bold">Paintball Shop Gate</span> nearby to press the fight button!';
          elArenaScoreboard.classList.add('hidden');
          elBtnReturnCity.classList.add('hidden');
          elBtnReturnCity.classList.remove('flex');
          elBtnWayfinder.classList.remove('hidden');
          elWayfinderLabel.textContent = 'Go to Shop Gate';

          updateHUD();
          pushFeedMessage('🏙️ Teleported to City Center near Town Hall!', 'border-l-emerald-400 text-emerald-200');
        }, 220);

        setTimeout(() => {
          elTeleportOverlay.classList.remove('opacity-95');
          elTeleportOverlay.classList.add('opacity-0');
        }, 620);
      }

      // ==========================================
      // 11. PLAYER SHOOTING & COLLISION PHYSICS
      // ==========================================
      function isPlayerInVioletTower(px, pz) {
        return (
          px >= VIOLET_TOWER.x - VIOLET_TOWER.w / 2 - 0.5 &&
          px <= VIOLET_TOWER.x + VIOLET_TOWER.w / 2 + 0.5 &&
          pz >= VIOLET_TOWER.z - VIOLET_TOWER.d / 2 - 0.5 &&
          pz <= VIOLET_TOWER.z + VIOLET_TOWER.d / 2 + 0.5
        );
      }

      function isPlayerInStadiumPitch(px, py, pz) {
        return (
          py < 4.0 &&
          px >= STADIUM_PITCH.x - STADIUM_PITCH.w / 2 - 5.0 &&
          px <= STADIUM_PITCH.x + STADIUM_PITCH.w / 2 + 5.0 &&
          pz >= STADIUM_PITCH.z - STADIUM_PITCH.d / 2 - 5.0 &&
          pz <= STADIUM_PITCH.z + STADIUM_PITCH.d / 2 + 5.0
        );
      }

      // Find whichever building's elevator the player is currently standing near (within 4.8m)
      function getNearestElevatorBuilding(px, pz) {
        if (player.inArena) return null;
        let best = null;
        let bestDist = 4.8;
        for (let i = 0; i < multiFloorBuildings.length; i++) {
          const b = multiFloorBuildings[i];
          const d = Math.hypot(px - b.elevX, pz - b.elevZ);
          if (d <= bestDist) {
            bestDist = d;
            best = b;
          }
        }
        return best;
      }

      function isPlayerNearElevator(px, pz) {
        return !!getNearestElevatorBuilding(px, pz);
      }

      // Find which multi-floor building footprint contains (px, pz)
      function getBuildingAtXZ(px, pz) {
        if (player.inArena) return null;
        for (let i = 0; i < multiFloorBuildings.length; i++) {
          const b = multiFloorBuildings[i];
          if (Math.abs(px - b.x) <= b.w / 2 + 0.3 && Math.abs(pz - b.z) <= b.d / 2 + 0.3) {
            return b;
          }
        }
        return null;
      }

      function playerShootPaintball() {
        // Outside the Paintball Arena, the player does NOT hold or shoot the paintball gun!
        if (!player.inArena) {
          // Kick Football when on the Violet Tower Rooftop Football Court OR the Bigger Stadium Football Ground!
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

        // Compute forward aim direction from yaw & pitch
        const forwardX = -Math.sin(player.yaw) * Math.cos(player.pitch);
        const forwardY = Math.sin(player.pitch) + 0.04;
        const forwardZ = -Math.cos(player.yaw) * Math.cos(player.pitch);
        const len = Math.hypot(forwardX, forwardY, forwardZ) || 1;

        const spawnX = player.x - Math.sin(player.yaw) * 0.8 + Math.cos(player.yaw) * 0.45;
        const spawnY = player.y + 2.15;
        const spawnZ = player.z - Math.cos(player.yaw) * 0.8 - Math.sin(player.yaw) * 0.45;

        spawnPaintball(
          spawnX,
          spawnY,
          spawnZ,
          forwardX / len,
          forwardY / len,
          forwardZ / len,
          'blue',
          'You'
        );
        updateHUD();
      }

      function resolveXZCollisions(x, z, radius, yHeight) {
        let nx = x;
        let nz = z;

        for (let i = 0; i < colliders.length; i++) {
          const c = colliders[i];
          const cMinY = c.minY || 0;
          if (yHeight + 2.6 <= cMinY || yHeight >= c.maxY) continue;

          const closestX = Math.max(c.minX, Math.min(nx, c.maxX));
          const closestZ = Math.max(c.minZ, Math.min(nz, c.maxZ));
          const dx = nx - closestX;
          const dz = nz - closestZ;
          const distSq = dx * dx + dz * dz;

          if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const overlap = radius - dist;
              nx += (dx / dist) * overlap;
              nz += (dz / dist) * overlap;
            } else {
              nx += radius;
            }
          }
        }
        return { x: nx, z: nz };
      }

      // ==========================================
      // 12. INPUT HANDLING (KEYBOARD, MOUSE, TOUCH / ON-SCREEN)
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

      window.addEventListener('keydown', (e) => {
        const code = e.code;
        keys[code] = true;

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
            openArcadeModal(nearestArcadeCabinet);
          }
        } else if (code === 'KeyH') {
          if (player.activeVehicle) {
            triggerVehicleSirenOrHorn(player.activeVehicle);
          }
        } else if (code === 'KeyF') {
          playerShootPaintball();
        } else if (code === 'KeyR') {
          player.ammo = player.maxAmmo;
          pushFeedMessage('🔄 Paint Hopper Reloaded!', 'border-l-cyan-400 text-cyan-200');
          updateHUD();
        } else if (code === 'KeyV') {
          toggleCameraMode();
        } else if (code === 'KeyM') {
          toggleFullMapModal();
        }
      });

      window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
      });

      // Mouse Look (Moves upon mouse movement alone without clicking!) & Sensitivity Settings
      let mouseSensitivity = 1.0;
      let invertYAxis = false;
      let requireClickToLook = false;

      try {
        const savedSens = localStorage.getItem('blocky_metro_mouse_sens');
        if (savedSens !== null && !isNaN(parseFloat(savedSens))) {
          mouseSensitivity = Math.max(0.1, Math.min(3.0, parseFloat(savedSens)));
        }
        const savedInvert = localStorage.getItem('blocky_metro_invert_y');
        if (savedInvert === 'true') invertYAxis = true;
        const savedReqClick = localStorage.getItem('blocky_metro_req_click');
        if (savedReqClick === 'true') requireClickToLook = true;
      } catch (err) {
        // Ignore storage errors in sandboxed iframe
      }

      let isDraggingLook = false;
      let dragMovedDistance = 0;
      let lastPointerX = null;
      let lastPointerY = null;

      function isAnyModalOpen() {
        const modals = ['settings-modal', 'help-modal', 'full-map-modal', 'match-result-modal', 'arcade-modal', 'profile-modal'];
        for (let i = 0; i < modals.length; i++) {
          const m = document.getElementById(modals[i]);
          if (m && !m.classList.contains('hidden')) return true;
        }
        return false;
      }

      canvas.addEventListener('pointerenter', (e) => {
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      });

      canvas.addEventListener('pointerleave', () => {
        lastPointerX = null;
        lastPointerY = null;
      });

      canvas.addEventListener('pointerdown', (e) => {
        isDraggingLook = true;
        dragMovedDistance = 0;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        SoundFX.init();
        if (!requireClickToLook && e.button === 0 && !isAnyModalOpen()) {
          playerShootPaintball();
        }
      });

      window.addEventListener('pointermove', (e) => {
        if (isAnyModalOpen()) return;
        if (requireClickToLook && !isDraggingLook) return;
        if (!requireClickToLook && e.target !== canvas && !isDraggingLook) {
          lastPointerX = null;
          lastPointerY = null;
          return;
        }

        if (lastPointerX === null || lastPointerY === null) {
          lastPointerX = e.clientX;
          lastPointerY = e.clientY;
          return;
        }

        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;

        if (isDraggingLook) {
          dragMovedDistance += Math.abs(dx) + Math.abs(dy);
        }

        const ySign = invertYAxis ? -1 : 1;
        player.yaw -= dx * 0.0055 * mouseSensitivity;
        player.pitch = Math.max(
          -0.55,
          Math.min(0.65, player.pitch - dy * 0.004 * mouseSensitivity * ySign)
        );
      });

      window.addEventListener('pointerup', (e) => {
        if (requireClickToLook && isDraggingLook && dragMovedDistance < 8 && e.target === canvas) {
          playerShootPaintball();
        }
        isDraggingLook = false;
      });

      // Bind On-Screen Pad Buttons
      function bindHoldButton(id, prop) {
        const el = document.getElementById(id);
        if (!el) return;
        const start = (e) => {
          e.preventDefault();
          virtualPad[prop] = true;
        };
        const end = (e) => {
          e.preventDefault();
          virtualPad[prop] = false;
        };
        el.addEventListener('pointerdown', start);
        el.addEventListener('pointerup', end);
        el.addEventListener('pointerleave', end);
        el.addEventListener('pointercancel', end);
      }

      bindHoldButton('pad-up', 'up');
      bindHoldButton('pad-down', 'down');
      bindHoldButton('pad-left', 'left');
      bindHoldButton('pad-right', 'right');
      bindHoldButton('pad-turn-left', 'turnLeft');
      bindHoldButton('pad-turn-right', 'turnRight');

      document.getElementById('pad-jump').addEventListener('click', () => {
        if (Math.abs(player.vy) < 0.05) {
          player.vy = 11.5;
          SoundFX.playJump();
        }
      });

      document.getElementById('pad-shoot').addEventListener('click', () => {
        playerShootPaintball();
      });

      // Bind Top & Modal UI Buttons
      function toggleCameraMode() {
        player.firstPerson = !player.firstPerson;
        playerRig.root.visible = !player.firstPerson;
        document.getElementById('camera-mode-label').textContent = player.firstPerson
          ? '1st Person [V]'
          : '3rd Person [V]';
      }

      document.getElementById('btn-camera-view').addEventListener('click', toggleCameraMode);

      document.getElementById('btn-wayfinder').addEventListener('click', () => {
        // Place player right in front of the Paintball Shop Gate Button near Town Hall
        player.inArena = false;
        player.x = 18.5;
        player.y = 0;
        player.z = 6;
        player.yaw = -Math.PI / 2; // Facing East directly into the Shop Gate & Button!
        pushFeedMessage('📍 Arrived at the Paintball Shop Gate near Town Hall!', 'border-l-fuchsia-400 text-fuchsia-200');
      });

      document.getElementById('btn-return-city').addEventListener('click', () => {
        returnToCityCenter(15, 8, -Math.PI / 2);
      });

      document.getElementById('btn-press-gate-start').addEventListener('click', () => {
        startPaintballFightTeleport();
      });

      document.getElementById('btn-reload').addEventListener('click', () => {
        player.ammo = player.maxAmmo;
        pushFeedMessage('🔄 Paint Hopper Reloaded!', 'border-l-cyan-400 text-cyan-200');
        updateHUD();
      });

      document.getElementById('btn-audio-toggle').addEventListener('click', (e) => {
        SoundFX.enabled = !SoundFX.enabled;
        e.currentTarget.textContent = SoundFX.enabled ? '🔊 SFX On' : '🔇 Muted';
      });

      function toggleFullMapModal() {
        const modal = document.getElementById('full-map-modal');
        const isHidden = modal.classList.contains('hidden');
        if (isHidden) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
          drawMapCanvas(document.getElementById('fullmap-canvas'), true);
        } else {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      }

      document.getElementById('btn-open-map').addEventListener('click', toggleFullMapModal);
      document.getElementById('btn-close-map').addEventListener('click', toggleFullMapModal);

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
              btn.innerHTML = '<span>🏊 9F Sky Pool</span><span class="text-[10px] bg-slate-950/25 px-1.5 py-0.5 rounded">Rooftop</span>';
            } else if (fi === 8 && b.id === 'violet_tower') {
              btn.innerHTML = '<span>⚽ Terrace</span><span class="text-[10px] bg-slate-950/25 px-1.5 py-0.5 rounded">Football</span>';
            } else if (fi === 7 && b.id === 'violet_tower') {
              btn.innerHTML = '<span>🕹️ 7th Floor</span><span class="text-[10px] bg-slate-950/30 px-1.5 py-0.5 rounded">Arcade</span>';
            } else {
              btn.textContent = lbl;
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
            // Hop directly into the center of the Metro Royal 9F Swimming Pool!
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
          document.getElementById('full-map-modal').classList.add('hidden');
          pushFeedMessage('🏊 Teleported to the Metro Royal 9F Rooftop Swimming Pool! Use WASD to swim!', 'border-l-cyan-400 text-cyan-200');
          updateHUD();
        });
      }

      document.getElementById('btn-map-tp-townhall').addEventListener('click', () => {
        returnToCityCenter(0, -8, Math.PI);
      });

      document.getElementById('btn-map-tp-shop').addEventListener('click', () => {
        returnToCityCenter(18.5, 6, -Math.PI / 2);
      });

      document.getElementById('btn-map-tp-violet').addEventListener('click', () => {
        returnToCityCenter(54, 6, -Math.PI / 2);
        elevatorState.currentY = 0;
        elevatorState.targetY = 0;
        player.y = 0;
        pushFeedMessage('🟣 Walk inside the Violet Tower and go near the elevator at the back wall to use it!', 'border-l-violet-400 text-violet-200');
      });

      document.getElementById('btn-map-tp-arcade').addEventListener('click', () => {
        document.getElementById('full-map-modal').classList.add('hidden');
        document.getElementById('full-map-modal').classList.remove('flex');
        if (isPlayerNearElevator(player.x, player.z)) {
          rideVioletElevatorToFloor(6);
        } else {
          pushFeedMessage('⚠️ Go near the elevator inside the Violet Tower first to ride to the 7F Arcade!', 'border-l-amber-400 text-amber-200');
        }
      });

      document.getElementById('btn-map-tp-rooftop').addEventListener('click', () => {
        document.getElementById('full-map-modal').classList.add('hidden');
        document.getElementById('full-map-modal').classList.remove('flex');
        if (isPlayerNearElevator(player.x, player.z)) {
          rideVioletElevatorToFloor(7);
        } else {
          pushFeedMessage('⚠️ Go near the elevator inside the Violet Tower first to ride to the Terrace Football Ground!', 'border-l-amber-400 text-amber-200');
        }
      });

      document.getElementById('btn-map-tp-arena').addEventListener('click', () => {
        startPaintballFightTeleport();
      });

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
          // Summon the Helicopter directly onto this building's topmost Helipad!
          const topY = (topBldg.numLevels - 1) * topBldg.floorHeight + 0.45;
          helicopter.x = topBldg.x + (topBldg.elevX > topBldg.x ? -2.2 : 2.2);
          helicopter.y = topY;
          helicopter.z = topBldg.z;
          helicopter.model.root.position.set(helicopter.x, helicopter.y, helicopter.z);
        }
        player.inHelicopter = true;
        player.vy = 0;
        helicopter.yaw = player.yaw;
        player.x = helicopter.x;
        player.y = helicopter.y + 0.5;
        player.z = helicopter.z;

        // Parent playerRig directly inside the helicopter cockpit tiltGroup with a seated pilot pose
        // so the player moves and tilts as one unit with the cockpit and NEVER separates or floats!
        helicopter.model.tiltGroup.add(playerRig.root);
        playerRig.root.scale.set(0.58, 0.50, 0.58);
        playerRig.root.position.set(0, 0.85, -0.65);
        playerRig.root.rotation.set(0, Math.PI, 0);
        applySeatedPoseToPlayerRig();

        SoundFX.playTeleport();
        document.getElementById('heli-prompt').classList.add('hidden');
        document.getElementById('heli-flight-hud').classList.remove('hidden');
        pushFeedMessage('🚁 Boarded Sky-Hawk Helicopter! WASD to fly, Space to Ascend, Shift to Descend, E to Land/Exit.', 'border-l-amber-400 text-amber-200');
      }

      function exitHelicopter() {
        if (!player.inHelicopter) return;
        player.inHelicopter = false;
        helicopter.vx = 0;
        helicopter.vy = 0;
        helicopter.vz = 0;
        helicopter.model.tiltGroup.rotation.set(0, 0, 0);

        // Snap helicopter onto the nearest support floor (e.g. topmost Helipad roof or ground)
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
        player.vy = 0;
        restoreStandingPoseToPlayerRig();
        document.getElementById('heli-flight-hud').classList.add('hidden');
        pushFeedMessage('🛬 Helicopter landed! Press [E] near the chopper anytime to fly again.', 'border-l-cyan-400 text-cyan-200');
      }

      function getNearestGroundVehicle(px, py, pz) {
        if (player.inArena || player.inHelicopter || player.activeVehicle) return null;
        if (py > 3.0) return null;
        let best = null;
        let bestDist = 5.8;
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

      function applySeatedPoseToPlayerRig() {
        playerRig.leftLegPivot.rotation.x = -Math.PI / 2;
        playerRig.rightLegPivot.rotation.x = -Math.PI / 2;
        playerRig.leftArmPivot.rotation.x = -Math.PI / 3;
        playerRig.rightArmPivot.rotation.x = -Math.PI / 3;
      }

      function restoreStandingPoseToPlayerRig() {
        scene.add(playerRig.root);
        playerRig.root.scale.set(1, 1, 1);
        playerRig.root.rotation.set(0, player.yaw + Math.PI, 0);
        playerRig.root.position.set(player.x, player.y, player.z);
        playerRig.leftLegPivot.rotation.x = 0;
        playerRig.rightLegPivot.rotation.x = 0;
        playerRig.leftArmPivot.rotation.x = 0;
        playerRig.rightArmPivot.rotation.x = 0;
      }

      function enterGroundVehicle(veh) {
        if (!veh || player.inArena || player.inHelicopter) return;
        player.activeVehicle = veh;
        veh.speed = 0;
        player.x = veh.x;
        player.y = 0.2;
        player.z = veh.z;
        player.vy = 0;
        player.yaw = veh.yaw;

        // Parent playerRig directly inside the vehicle cabin with a compact seated pose
        // so the player's head stays well below the car roof (y ~ 1.85m vs 2.32m roof) and never protrudes!
        veh.model.root.add(playerRig.root);
        playerRig.root.scale.set(0.54, 0.46, 0.54);
        const seatZ = (veh.type === 'ambulance' || veh.type === 'fire_engine') ? -1.85 : 0.1;
        playerRig.root.position.set(-0.35, 0.22, seatZ);
        playerRig.root.rotation.set(0, Math.PI, 0);
        applySeatedPoseToPlayerRig();

        SoundFX.playHorn();
        document.getElementById('vehicle-prompt').classList.add('hidden');
        document.getElementById('vehicle-drive-hud').classList.remove('hidden');
        document.getElementById('vehicle-hud-icon').textContent = veh.icon;
        document.getElementById('vehicle-hud-name').textContent = `Driving ${veh.name}`;
        pushFeedMessage(`${veh.icon} Driving ${veh.name}! Use WASD to drive, H for Siren/Horn, E to Park & Exit.`, 'border-l-emerald-400 text-emerald-200');
      }

      function exitGroundVehicle() {
        const veh = player.activeVehicle;
        if (!veh) return;
        veh.speed = 0;
        veh.sirenOn = false;
        player.activeVehicle = null;
        player.x = veh.x + Math.cos(veh.yaw) * 2.6;
        player.y = 0;
        player.z = veh.z - Math.sin(veh.yaw) * 2.6;
        player.vy = 0;
        restoreStandingPoseToPlayerRig();
        document.getElementById('vehicle-drive-hud').classList.add('hidden');
        pushFeedMessage(`${veh.icon} Parked ${veh.name}. Press [E] near any vehicle to drive!`, 'border-l-cyan-400 text-cyan-200');
      }

      function triggerVehicleSirenOrHorn(veh) {
        if (!veh) return;
        if (veh.type === 'taxi') {
          SoundFX.playHorn();
          pushFeedMessage('🚕 Beep beep! Taxi Cab ready for passengers!', 'border-l-amber-400 text-amber-200');
        } else {
          veh.sirenOn = !veh.sirenOn;
          if (veh.sirenOn) {
            SoundFX.playSirenPulse(true);
            pushFeedMessage(`🚨 ${veh.name} Emergency Siren & Lightbar ON!`, 'border-l-rose-400 text-rose-200');
          } else {
            pushFeedMessage(`🔇 ${veh.name} Siren OFF.`, 'border-l-slate-400 text-slate-300');
          }
        }
      }

      document.getElementById('btn-enter-vehicle').addEventListener('click', () => {
        const v = getNearestGroundVehicle(player.x, player.y, player.z);
        if (v) enterGroundVehicle(v);
      });
      document.getElementById('btn-exit-vehicle').addEventListener('click', exitGroundVehicle);
      document.getElementById('btn-vehicle-siren').addEventListener('click', () => {
        if (player.activeVehicle) triggerVehicleSirenOrHorn(player.activeVehicle);
      });

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

      document.getElementById('btn-reset-football').addEventListener('click', () => {
        if (isPlayerInStadiumPitch(player.x, player.y, player.z)) {
          stadiumFootball.x = stadiumFootball.homeX;
          stadiumFootball.y = stadiumFootball.homeY;
          stadiumFootball.z = stadiumFootball.homeZ;
          stadiumFootball.vx = 0;
          stadiumFootball.vy = 0;
          stadiumFootball.vz = 0;
        } else {
          rooftopFootball.x = rooftopFootball.homeX;
          rooftopFootball.y = rooftopFootball.homeY;
          rooftopFootball.z = rooftopFootball.homeZ;
          rooftopFootball.vx = 0;
          rooftopFootball.vy = 0;
          rooftopFootball.vz = 0;
        }
      });

      // ==========================================
      // PLAYABLE 7TH FLOOR ARCADE MACHINE ENGINE
      // ==========================================
      let nearestArcadeCabinet = null;
      const arcadeModal = document.getElementById('arcade-modal');
      const arcadeCanvas = document.getElementById('arcade-game-canvas');
      const arcadeCtx = arcadeCanvas.getContext('2d');
      const arcadeScoreVal = document.getElementById('arcade-score-val');
      const arcadeModalHeading = document.getElementById('arcade-modal-heading');

      const arcadeGame = {
        active: false,
        mode: 'breaker', // 'breaker', 'pong', 'invaders'
        score: 0,
        paddleX: 150,
        paddleW: 76,
        ballX: 190,
        ballY: 180,
        ballVX: 3.4,
        ballVY: -3.6,
        aiPaddleX: 150,
        bricks: [],
        lasers: [],
        moveLeft: false,
        moveRight: false
      };

      function initArcadeSubgame(mode) {
        arcadeGame.mode = mode || arcadeGame.mode;
        arcadeGame.score = 0;
        arcadeGame.paddleX = 152;
        arcadeGame.ballX = 190;
        arcadeGame.ballY = 190;
        arcadeGame.ballVX = 3.5 * (Math.random() > 0.5 ? 1 : -1);
        arcadeGame.ballVY = -3.6;
        arcadeGame.lasers = [];
        arcadeGame.bricks = [];

        if (arcadeGame.mode === 'breaker') {
          arcadeModalHeading.textContent = '🧱 Neon Brick Breaker DX';
          const colors = ['#f43f5e', '#facc15', '#22d3ee', '#a855f7'];
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 7; c++) {
              arcadeGame.bricks.push({
                x: 20 + c * 50,
                y: 36 + r * 22,
                w: 44,
                h: 14,
                color: colors[r],
                alive: true
              });
            }
          }
        } else if (arcadeGame.mode === 'pong') {
          arcadeModalHeading.textContent = '🏓 Cyber Pong 2099';
        } else {
          arcadeModalHeading.textContent = '👾 Space Block Invaders';
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 6; c++) {
              arcadeGame.bricks.push({
                x: 35 + c * 52,
                y: 36 + r * 26,
                w: 32,
                h: 18,
                color: r === 0 ? '#ec4899' : '#a3e635',
                alive: true,
                dir: 1
              });
            }
          }
        }
        arcadeScoreVal.textContent = '0';
      }

      function openArcadeModal(cab) {
        arcadeModal.classList.remove('hidden');
        arcadeModal.classList.add('flex');
        arcadeGame.active = true;
        initArcadeSubgame(cab ? cab.mode : 'breaker');
      }

      function closeArcadeModal() {
        arcadeModal.classList.add('hidden');
        arcadeModal.classList.remove('flex');
        arcadeGame.active = false;
      }

      document.getElementById('btn-open-arcade').addEventListener('click', () => {
        openArcadeModal(nearestArcadeCabinet);
      });
      document.getElementById('btn-close-arcade').addEventListener('click', closeArcadeModal);
      document.getElementById('btn-arcade-restart').addEventListener('click', () => initArcadeSubgame(arcadeGame.mode));
      document.getElementById('btn-arcade-game-breaker').addEventListener('click', () => initArcadeSubgame('breaker'));
      document.getElementById('btn-arcade-game-pong').addEventListener('click', () => initArcadeSubgame('pong'));
      document.getElementById('btn-arcade-game-invaders').addEventListener('click', () => initArcadeSubgame('invaders'));

      arcadeCanvas.addEventListener('pointermove', (e) => {
        const rect = arcadeCanvas.getBoundingClientRect();
        const relX = ((e.clientX - rect.left) / rect.width) * arcadeCanvas.width;
        arcadeGame.paddleX = Math.max(8, Math.min(arcadeCanvas.width - arcadeGame.paddleW - 8, relX - arcadeGame.paddleW / 2));
      });

      document.getElementById('btn-arcade-left').addEventListener('click', () => {
        arcadeGame.paddleX = Math.max(8, arcadeGame.paddleX - 28);
      });
      document.getElementById('btn-arcade-right').addEventListener('click', () => {
        arcadeGame.paddleX = Math.min(arcadeCanvas.width - arcadeGame.paddleW - 8, arcadeGame.paddleX + 28);
      });
      document.getElementById('btn-arcade-fire').addEventListener('click', () => {
        if (arcadeGame.mode === 'invaders') {
          arcadeGame.lasers.push({ x: arcadeGame.paddleX + arcadeGame.paddleW / 2, y: 225 });
          SoundFX.playShoot();
        } else {
          arcadeGame.ballVY = -Math.abs(arcadeGame.ballVY);
        }
      });

      function updateAndDrawArcade() {
        if (!arcadeGame.active) return;
        const W = arcadeCanvas.width;
        const H = arcadeCanvas.height;
        arcadeCtx.fillStyle = '#090d16';
        arcadeCtx.fillRect(0, 0, W, H);

        if (keys['ArrowLeft'] || keys['KeyA']) arcadeGame.paddleX = Math.max(8, arcadeGame.paddleX - 5);
        if (keys['ArrowRight'] || keys['KeyD']) arcadeGame.paddleX = Math.min(W - arcadeGame.paddleW - 8, arcadeGame.paddleX + 5);

        // Player Paddle
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
            if (!anyAlive) initArcadeSubgame('breaker');
          } else {
            // Cyber Pong AI Top Paddle
            arcadeGame.aiPaddleX += (arcadeGame.ballX - (arcadeGame.aiPaddleX + 36)) * 0.09;
            arcadeCtx.fillStyle = '#f43f5e';
            arcadeCtx.fillRect(arcadeGame.aiPaddleX, 18, 72, 10);
            if (arcadeGame.ballY < 32 && arcadeGame.ballX >= arcadeGame.aiPaddleX && arcadeGame.ballX <= arcadeGame.aiPaddleX + 72) {
              arcadeGame.ballVY = Math.abs(arcadeGame.ballVY);
            }
          }

          arcadeCtx.fillStyle = '#facc15';
          arcadeCtx.beginPath();
          arcadeCtx.arc(arcadeGame.ballX, arcadeGame.ballY, 6, 0, Math.PI * 2);
          arcadeCtx.fill();
        } else {
          // Space Block Invaders
          if (Math.random() < 0.06) {
            arcadeGame.lasers.push({ x: arcadeGame.paddleX + arcadeGame.paddleW / 2, y: H - 26 });
          }
          for (let i = arcadeGame.lasers.length - 1; i >= 0; i--) {
            const l = arcadeGame.lasers[i];
            l.y -= 6;
            arcadeCtx.fillStyle = '#f472b6';
            arcadeCtx.fillRect(l.x - 2, l.y, 4, 10);
            arcadeGame.bricks.forEach((b) => {
              if (b.alive && l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
                b.alive = false;
                l.y = -20;
                arcadeGame.score += 75;
                arcadeScoreVal.textContent = String(arcadeGame.score);
                SoundFX.playSplat();
              }
            });
            if (l.y < 0) arcadeGame.lasers.splice(i, 1);
          }
          let aliveCount = 0;
          arcadeGame.bricks.forEach((b) => {
            if (!b.alive) return;
            aliveCount++;
            b.x += Math.sin(performance.now() * 0.003) * 0.8;
            arcadeCtx.fillStyle = b.color;
            arcadeCtx.fillRect(b.x, b.y, b.w, b.h);
          });
          if (aliveCount === 0) initArcadeSubgame('invaders');
        }
      }

      // Settings Modal & Sensitivity Controls
      const settingsModal = document.getElementById('settings-modal');
      const sliderSensitivity = document.getElementById('slider-sensitivity');
      const sensitivityValueLabel = document.getElementById('sensitivity-value-label');
      const chkInvertY = document.getElementById('chk-invert-y');
      const chkRequireClick = document.getElementById('chk-require-click');

      function applySensitivity(val) {
        mouseSensitivity = Math.max(0.1, Math.min(3.0, Number(val) || 1.0));
        sliderSensitivity.value = mouseSensitivity.toFixed(2);
        sensitivityValueLabel.textContent = mouseSensitivity.toFixed(2) + 'x';
        try {
          localStorage.setItem('blocky_metro_mouse_sens', String(mouseSensitivity));
        } catch (err) {}
      }

      // Initialize UI controls with saved state
      applySensitivity(mouseSensitivity);
      chkInvertY.checked = invertYAxis;
      chkRequireClick.checked = requireClickToLook;

      sliderSensitivity.addEventListener('input', (e) => {
        applySensitivity(parseFloat(e.target.value));
      });

      document.getElementById('btn-sens-low').addEventListener('click', () => applySensitivity(0.5));
      document.getElementById('btn-sens-med').addEventListener('click', () => applySensitivity(1.0));
      document.getElementById('btn-sens-high').addEventListener('click', () => applySensitivity(1.75));
      document.getElementById('btn-sens-ultra').addEventListener('click', () => applySensitivity(2.5));

      chkInvertY.addEventListener('change', (e) => {
        invertYAxis = !!e.target.checked;
        try {
          localStorage.setItem('blocky_metro_invert_y', String(invertYAxis));
        } catch (err) {}
      });

      chkRequireClick.addEventListener('change', (e) => {
        requireClickToLook = !!e.target.checked;
        try {
          localStorage.setItem('blocky_metro_req_click', String(requireClickToLook));
        } catch (err) {}
      });

      function closeSettingsModal() {
        settingsModal.classList.add('hidden');
        settingsModal.classList.remove('flex');
      }

      const profileModal = document.getElementById('profile-modal');
      const inputProfileUsername = document.getElementById('input-profile-username');
      const profileSaveStatus = document.getElementById('profile-save-status');
      const profileLevelVal = document.getElementById('profile-level-val');
      const profileXpVal = document.getElementById('profile-xp-val');
      const profileCoinsVal = document.getElementById('profile-coins-val');

      function refreshProfileStatsUI() {
        const xp = player.splats * 50 + rooftopFootball.scoreBlue * 100 + arcadeGame.score;
        const lvl = Math.max(1, Math.floor(xp / 250) + 1);
        const coins = 250 + player.splats * 25 + rooftopFootball.scoreBlue * 50;
        profileLevelVal.textContent = String(lvl);
        profileXpVal.textContent = String(xp);
        profileCoinsVal.textContent = String(coins);
      }

      function closeProfileModal() {
        profileModal.classList.add('hidden');
        profileModal.classList.remove('flex');
      }

      document.getElementById('btn-profile-modal').addEventListener('click', () => {
        refreshProfileStatsUI();
        profileModal.classList.remove('hidden');
        profileModal.classList.add('flex');
      });
      document.getElementById('btn-close-profile').addEventListener('click', closeProfileModal);
      document.getElementById('btn-done-profile').addEventListener('click', closeProfileModal);

      document.getElementById('btn-save-cloud-progress').addEventListener('click', () => {
        const uname = (inputProfileUsername.value || 'MetroPilot').trim();
        refreshProfileStatsUI();
        try {
          localStorage.setItem(
            'blocky_metro_cloud_save',
            JSON.stringify({
              username: uname,
              splats: player.splats,
              rooftopGoals: rooftopFootball.scoreBlue,
              arcadeScore: arcadeGame.score,
              position: { x: player.x, y: player.y, z: player.z },
              savedAt: new Date().toISOString()
            })
          );
        } catch (err) {}
        document.getElementById('profile-btn-label').textContent = uname;
        profileSaveStatus.textContent = `✅ Saved progress for ${uname} (Lv.${profileLevelVal.textContent}, ${profileXpVal.textContent} XP)!`;
        profileSaveStatus.className = 'text-[11px] font-bold text-emerald-300';
        pushFeedMessage(`💾 Cloud progress saved for ${uname}!`, 'border-l-emerald-400 text-emerald-200');
      });

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
        if (typeof SoundFX !== 'undefined' && SoundFX.playClick) SoundFX.playClick();
      }

      const dayNightBtnEl = document.getElementById('btn-day-night-toggle');
      if (dayNightBtnEl) {
        dayNightBtnEl.addEventListener('click', () => {
          toggleDayNightManual();
        });
      }

      window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyN' && document.activeElement?.tagName !== 'INPUT') {
          toggleDayNightManual();
        }
      });

      document.getElementById('btn-settings-modal').addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        settingsModal.classList.add('flex');
      });
      document.getElementById('btn-close-settings').addEventListener('click', closeSettingsModal);
      document.getElementById('btn-save-settings').addEventListener('click', closeSettingsModal);

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

      document.getElementById('btn-play-again').addEventListener('click', () => {
        startPaintballFightTeleport();
      });
      document.getElementById('btn-result-city').addEventListener('click', () => {
        returnToCityCenter(16, 6, -Math.PI / 2);
      });

      // ==========================================
      // 13. MINIMAP & FULL WORLD MAP RENDERER
      // ==========================================
      const minimapCanvas = document.getElementById('minimap-canvas');

      function drawMapCanvas(targetCanvas, isFull) {
        if (!targetCanvas) return;
        const ctx = targetCanvas.getContext('2d');
        const W = targetCanvas.width;
        const H = targetCanvas.height;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);

        // World bounds: x in [-170, 380], z in [-170, 170]
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

        // Draw City Base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(toMapX(-155), toMapY(-155), 310 * scaleX, 310 * scaleZ);

        // Draw Town Hall Central Plaza
        ctx.fillStyle = '#334155';
        ctx.fillRect(toMapX(-44), toMapY(-44), 88 * scaleX, 88 * scaleZ);

        // Draw Highway to Outskirts
        ctx.fillStyle = '#475569';
        ctx.fillRect(toMapX(155), toMapY(-8), 110 * scaleX, 16 * scaleZ);

        // Draw Outskirts Paintball Arena
        const ax = toMapX(ARENA_CENTER.x - ARENA_HALF_W);
        const ay = toMapY(ARENA_CENTER.z - ARENA_HALF_D);
        const aw = ARENA_HALF_W * 2 * scaleX;
        const ah = ARENA_HALF_D * 2 * scaleZ;
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(ax, ay, aw, ah);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ax, ay, aw, ah);

        // Draw Buildings (Skyscrapers, Town Hall, Paintball Shop)
        mapBuildings.forEach((b) => {
          ctx.fillStyle = b.color;
          ctx.fillRect(
            toMapX(b.x - b.w / 2),
            toMapY(b.z - b.d / 2),
            Math.max(3, b.w * scaleX),
            Math.max(3, b.d * scaleZ)
          );
        });

        // Highlight Gate Button Pulse
        const gx = toMapX(GATE_BUTTON_POS.x);
        const gy = toMapY(GATE_BUTTON_POS.z);
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(gx, gy, isFull ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Draw Operational Vehicles (Taxis, Police Car, Fire Engine, Ambulance)
        driveableVehicles.forEach((v) => {
          ctx.fillStyle = v.mapColor;
          ctx.fillRect(toMapX(v.x) - (isFull ? 3.5 : 2.2), toMapY(v.z) - (isFull ? 3.5 : 2.2), isFull ? 7 : 4.4, isFull ? 7 : 4.4);
        });

        // Draw AI Citizens in City
        ctx.fillStyle = '#a3e635';
        cityNPCs.forEach((npc) => {
          ctx.fillRect(toMapX(npc.x) - 1.5, toMapY(npc.z) - 1.5, 3, 3);
        });

        // Draw Paintball Bots in Outskirts Arena
        arenaBots.forEach((bot) => {
          ctx.fillStyle = bot.team === 'blue' ? '#38bdf8' : '#fb7185';
          ctx.beginPath();
          ctx.arc(toMapX(bot.x), toMapY(bot.z), isFull ? 3.5 : 2.2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw Player + Direction Cone
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
          ctx.fillText('Outskirts Paintball Ground', toMapX(265), toMapY(-52));
        }
      }

      // ==========================================
      // 14. MAIN GAME LOOP (PLAYER, AI BOTS, PAINTBALLS)
      // ==========================================
      let lastFrameTime = performance.now();

      const daySkyColor = new THREE.Color(0x7dd3fc);
      const nightSkyColor = new THREE.Color(0x060d1f);
      const curSkyColor = new THREE.Color(0x7dd3fc);
      const daySunColor = new THREE.Color(0xfffbeb);
      const nightMoonColor = new THREE.Color(0x60a5fa);
      const curSunColor = new THREE.Color(0xfffbeb);

      function updateDayNightAndLights(dt) {
        // 1. Automatic 25-min Day / 15-min Night countdown
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

        // 2. Smoothly blend Day (0.0) <-> Night (1.0)
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

        // 3. Streetlight bulbs & ground light pools glow at night
        if (b > 0.35) {
          streetLightBulbMat.color.setHex(0xfef08a);
          streetLightGroundHaloMat.opacity = 0.28 * b;
        } else {
          streetLightBulbMat.color.setHex(0xdbeafe);
          streetLightGroundHaloMat.opacity = 0.0;
        }

        // 4. Track whether player is inside any building so indoor lights illuminate the interior!
        let playerInsideBuilding = false;
        let activeCeilingY = player.y + 4.8;
        let buildingCenterX = player.x;
        let buildingCenterZ = player.z;

        for (let i = 0; i < multiFloorBuildings.length; i++) {
          const mb = multiFloorBuildings[i];
          if (
            Math.abs(player.x - mb.worldX) <= mb.w / 2 + 0.5 &&
            Math.abs(player.z - mb.worldZ) <= mb.d / 2 + 0.5 &&
            player.y < (mb.numLevels - 1) * mb.floorHeight - 0.5
          ) {
            playerInsideBuilding = true;
            const flIdx = Math.max(0, Math.floor((player.y + 0.5) / mb.floorHeight));
            activeCeilingY = flIdx * mb.floorHeight + mb.floorHeight - 0.5;
            buildingCenterX = mb.worldX;
            buildingCenterZ = mb.worldZ;
            break;
          }
        }

        // Also check Violet Tower interior (1F..7F below terraceY = 42.0)
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

        // Move dynamic indoor ceiling PointLights to light up the player's current building interior
        indoorPointLightA.position.set(player.x, activeCeilingY, player.z);
        indoorPointLightA.intensity = playerInsideBuilding ? 1.45 : (0.65 * b + 0.35);
        indoorPointLightB.position.set(buildingCenterX, activeCeilingY, buildingCenterZ);
        indoorPointLightB.intensity = playerInsideBuilding ? 1.15 : 0.45;

        // Keep indoor ambient bright when inside a building at night
        const baseNightAmbient = playerInsideBuilding ? 0.58 : 0.30;
        ambientLight.intensity = 0.68 * (1 - b) + baseNightAmbient * b;

        // 5. Move activeStreetPointLight to the streetlight nearest the player at night
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

        // Pulse Shop Gate Button & Floating Beacon + Shimmer Metro Royal 9F Rooftop Swimming Pool Water
        beaconRing.rotation.z = timeSec * 1.5;
        if (window.__metroRoyalPoolWater) {
          window.__metroRoyalPoolWater.position.y = 0.90 + Math.sin(timeSec * 2.6) * 0.03;
        }
        beaconRing.position.y = 11.5 + Math.sin(timeSec * 3) * 0.8;
        gateButtonMesh.position.y = 1.62 + Math.sin(timeSec * 5) * 0.06;

        // 1. Camera Turning via Keyboard Q/E or On-Screen Look Buttons
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

        // 1B. Helicopter Flight Physics & Rotor Animation
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

          const flySpeed = 30.0;
          const targetVX = (fwdX * flyFwd + rgtX * flyRight) * flySpeed;
          const targetVZ = (fwdZ * flyFwd + rgtZ * flyRight) * flySpeed;
          const targetVY = flyUp * 18.0;

          helicopter.vx += (targetVX - helicopter.vx) * Math.min(1, dt * 5.0);
          helicopter.vz += (targetVZ - helicopter.vz) * Math.min(1, dt * 5.0);
          helicopter.vy += (targetVY - helicopter.vy) * Math.min(1, dt * 6.0);

          const oldHeliX = helicopter.x;
          const oldHeliY = helicopter.y;
          const oldHeliZ = helicopter.z;

          let nextHeliX = Math.max(-160, Math.min(365, oldHeliX + helicopter.vx * dt));
          let nextHeliZ = Math.max(-160, Math.min(160, oldHeliZ + helicopter.vz * dt));
          let nextHeliY = Math.max(0.2, Math.min(135, oldHeliY + helicopter.vy * dt));

          // Solid 3D Building Collision for Helicopter (Blocks flying through walls & supports landing on roofs!)
          const heliRadius = 3.5;
          for (let bi = 0; bi < multiFloorBuildings.length; bi++) {
            const b = multiFloorBuildings[bi];
            const bTopY = (b.numLevels - 1) * b.floorHeight + 0.45;
            const bMinX = b.x - b.w / 2 - heliRadius;
            const bMaxX = b.x + b.w / 2 + heliRadius;
            const bMinZ = b.z - b.d / 2 - heliRadius;
            const bMaxZ = b.z + b.d / 2 + heliRadius;

            if (nextHeliX > bMinX && nextHeliX < bMaxX && nextHeliZ > bMinZ && nextHeliZ < bMaxZ) {
              if (oldHeliY >= bTopY - 0.4) {
                // Helicopter is above the building roof: land on top of the roof and never sink into the building
                if (nextHeliY < bTopY) {
                  nextHeliY = bTopY;
                  if (helicopter.vy < 0) helicopter.vy = 0;
                }
              } else if (nextHeliY < bTopY) {
                // Helicopter is below the building roofline: block horizontal entry through the building walls!
                const dLeft = Math.abs(nextHeliX - bMinX);
                const dRight = Math.abs(bMaxX - nextHeliX);
                const dBack = Math.abs(nextHeliZ - bMinZ);
                const dFront = Math.abs(bMaxZ - nextHeliZ);
                const minPen = Math.min(dLeft, dRight, dBack, dFront);

                if (minPen === dLeft) {
                  nextHeliX = bMinX;
                  if (helicopter.vx > 0) helicopter.vx = 0;
                } else if (minPen === dRight) {
                  nextHeliX = bMaxX;
                  if (helicopter.vx < 0) helicopter.vx = 0;
                } else if (minPen === dBack) {
                  nextHeliZ = bMinZ;
                  if (helicopter.vz > 0) helicopter.vz = 0;
                } else {
                  nextHeliZ = bMaxZ;
                  if (helicopter.vz < 0) helicopter.vz = 0;
                }
              }
            }
          }

          helicopter.x = nextHeliX;
          helicopter.y = nextHeliY;
          helicopter.z = nextHeliZ;

          helicopter.model.root.position.set(helicopter.x, helicopter.y, helicopter.z);
          helicopter.model.root.rotation.y = helicopter.yaw;

          // Subtle aerodynamic pitch & roll tilt while flying
          helicopter.model.tiltGroup.rotation.x = -flyFwd * 0.14;
          helicopter.model.tiltGroup.rotation.z = -flyRight * 0.14;

          // Keep player seated inside the helicopter cockpit
          player.x = helicopter.x;
          player.y = helicopter.y + 0.5;
          player.z = helicopter.z;
          player.vy = 0;

          const elAlt = document.getElementById('heli-altitude-label');
          if (elAlt) {
            elAlt.textContent = `Altitude: ${Math.round(helicopter.y)}m • WASD Fly • Space Up • Shift Down`;
          }
        } else {
          // Idle rotor spin deceleration when parked
          helicopter.model.mainRotor.rotation.y += dt * 1.2;
          helicopter.model.tailRotor.rotation.x += dt * 1.2;
        }

        // Show/Hide Helicopter Boarding Prompt when near Helicopter or on any Topmost Helipad Roof!
        const elHeliPrompt = document.getElementById('heli-prompt');
        const elHeliSub = document.getElementById('heli-prompt-subtitle');
        const elBtnBoardHeli = document.getElementById('btn-board-heli');
        if (!player.inArena && !player.inHelicopter) {
          const nearChopper = isPlayerNearHelicopter();
          const onTopPadBldg = isPlayerOnAnyTopHelipad();
          if (nearChopper) {
            elHeliSub.textContent = 'Step into the cockpit and fly across the city!';
            elBtnBoardHeli.textContent = '🚁 PILOT HELICOPTER [E]';
            elHeliPrompt.classList.remove('hidden');
          } else if (onTopPadBldg) {
            elHeliSub.textContent = `${onTopPadBldg.title} Top Helipad`;
            elBtnBoardHeli.textContent = '🚁 SUMMON & PILOT HELICOPTER [E]';
            elHeliPrompt.classList.remove('hidden');
          } else {
            elHeliPrompt.classList.add('hidden');
          }
        } else {
          elHeliPrompt.classList.add('hidden');
        }

        // 1C. Ground Vehicle Driving Physics (Taxis, Police Car, Ambulance, Fire Engine)
        const elVehPrompt = document.getElementById('vehicle-prompt');
        const elVehPromptTitle = document.getElementById('vehicle-prompt-title');
        const elVehPromptBadge = document.getElementById('vehicle-prompt-badge');

        if (player.activeVehicle) {
          elVehPrompt.classList.add('hidden');
          const veh = player.activeVehicle;

          let throttle = 0;
          let steer = 0;
          if (keys['KeyW'] || keys['ArrowUp'] || virtualPad.up) throttle += 1;
          if (keys['KeyS'] || keys['ArrowDown'] || virtualPad.down) throttle -= 1;
          if (keys['KeyA'] || keys['ArrowLeft'] || virtualPad.left) steer += 1;
          if (keys['KeyD'] || keys['ArrowRight'] || virtualPad.right) steer -= 1;

          if (throttle > 0) {
            veh.speed = Math.min(veh.maxSpeed, veh.speed + 26.0 * dt);
          } else if (throttle < 0) {
            veh.speed = Math.max(-14.0, veh.speed - 28.0 * dt);
          } else {
            veh.speed *= Math.pow(0.18, dt);
            if (Math.abs(veh.speed) < 0.15) veh.speed = 0;
          }

          if (Math.abs(veh.speed) > 0.3 && steer !== 0) {
            const dirSign = veh.speed >= 0 ? 1 : -1;
            const turnDelta = steer * dirSign * 1.95 * dt;
            veh.yaw += turnDelta;
            player.yaw += turnDelta;
          }

          const fwdX = -Math.sin(veh.yaw);
          const fwdZ = -Math.cos(veh.yaw);
          const nextVehPos = resolveXZCollisions(
            veh.x + fwdX * veh.speed * dt,
            veh.z + fwdZ * veh.speed * dt,
            1.85,
            0
          );
          veh.x = Math.max(-152, Math.min(365, nextVehPos.x));
          veh.z = Math.max(-152, Math.min(152, nextVehPos.z));

          veh.model.root.position.set(veh.x, 0, veh.z);
          veh.model.root.rotation.y = veh.yaw;

          // Spin all vehicle wheels
          veh.model.wheels.forEach((w) => {
            w.rotation.x -= veh.speed * dt * 0.9;
          });

          // Keep player seated inside the vehicle cabin
          player.x = veh.x;
          player.y = 0.4;
          player.z = veh.z;
          player.vy = 0;

          const kmh = Math.round(Math.abs(veh.speed) * 3.6);
          const elSpeed = document.getElementById('vehicle-speed-label');
          if (elSpeed) {
            elSpeed.textContent = `Speed: ${kmh} km/h • WASD Drive • H Siren/Horn • E Exit`;
          }
        } else if (!player.inArena && !player.inHelicopter) {
          const nearVeh = getNearestGroundVehicle(player.x, player.y, player.z);
          if (nearVeh) {
            elVehPromptBadge.textContent = `${nearVeh.icon} Operational City Vehicle`;
            elVehPromptTitle.textContent = nearVeh.name;
            elVehPrompt.classList.remove('hidden');
          } else {
            elVehPrompt.classList.add('hidden');
          }
        } else {
          elVehPrompt.classList.add('hidden');
        }

        // Animate Emergency Lightbars & Siren Audio on Police Car, Ambulance & Fire Engine
        driveableVehicles.forEach((v) => {
          if (v.sirenOn) {
            v.sirenTimer -= dt;
            if (v.sirenTimer <= 0) {
              v.sirenTimer = 0.28;
              v.sirenPhase = !v.sirenPhase;
              SoundFX.playSirenPulse(v.sirenPhase);
              if (v.model.leftBeacon && v.model.rightBeacon) {
                v.model.leftBeacon.material.color.setHex(v.sirenPhase ? 0xef4444 : 0x1e293b);
                v.model.rightBeacon.material.color.setHex(
                  v.sirenPhase ? 0x1e293b : (v.type === 'police' ? 0x3b82f6 : 0xfef08a)
                );
              }
            }
          }
        });

        // 2. Player Movement Vector
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

        // Capture the building the player is currently on BEFORE stepping so they can NEVER walk off an upper floor or roof!
        const preStepBldg = (!player.inHelicopter && !player.activeVehicle) ? getBuildingAtXZ(player.x, player.z) : null;

        // Apply Horizontal Movement & Resolve Collisions (Only when on foot)
        if (!player.inHelicopter && !player.activeVehicle) {
          const nextPos = resolveXZCollisions(
            player.x + vx * dt,
            player.z + vz * dt,
            player.radius,
            player.y
          );
          player.x = nextPos.x;
          player.z = nextPos.z;

          // Strictly clamp player inside the building perimeter on ALL upper floors AND topmost roofs/helipads/terraces!
          if (preStepBldg && player.y >= 3.0) {
            const minBX = preStepBldg.x - preStepBldg.w / 2 + 1.15;
            const maxBX = preStepBldg.x + preStepBldg.w / 2 - 1.15;
            const minBZ = preStepBldg.z - preStepBldg.d / 2 + 1.15;
            const maxBZ = preStepBldg.z + preStepBldg.d / 2 - 1.15;
            player.x = Math.max(minBX, Math.min(maxBX, player.x));
            player.z = Math.max(minBZ, Math.min(maxBZ, player.z));
          }
        }

        // Clamp within World or Arena Bounds
        if (player.inArena) {
          player.x = Math.max(
            ARENA_CENTER.x - ARENA_HALF_W + 1.8,
            Math.min(ARENA_CENTER.x + ARENA_HALF_W - 1.8, player.x)
          );
          player.z = Math.max(
            ARENA_CENTER.z - ARENA_HALF_D + 1.8,
            Math.min(ARENA_CENTER.z + ARENA_HALF_D - 1.8, player.z)
          );

          // Check if player stepped on the Gold Return-to-City Pad in Blue Base
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

        // Animate Interactive Building Doors when Player Approaches
        interactiveDoors.forEach((d) => {
          const dist = Math.hypot(player.x - d.wx, player.z - d.wz);
          const shouldOpen = dist < 5.5 && Math.abs(player.y - d.wy) < 3.5;
          const targetSlide = shouldOpen ? d.slideMax : 0;
          d.openAmount += (targetSlide - d.openAmount) * Math.min(1, dt * 8);
          d.leftPanel.position.x = -d.openAmount;
          d.rightPanel.position.x = d.openAmount;
        });

        // Animate All Building Elevators & Carry Player if Standing Inside an Active Elevator Cab
        for (let bi = 0; bi < multiFloorBuildings.length; bi++) {
          const b = multiFloorBuildings[bi];
          const inThisShaft =
            !player.inArena &&
            Math.abs(player.x - b.elevX) < 2.4 &&
            Math.abs(player.z - b.elevZ) < 2.4;

          if (Math.abs(b.currentY - b.targetY) > 0.05) {
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

        // Compute Support Floor Height & Upper-Floor Wall Clamping for ANY Building in the City (ONLY when on foot!)
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

          // Keep player safely inside upper-floor and rooftop perimeter walls/railings at all times when above 1F
          if (player.y >= 3.0) {
            const minBX = currentBldg.x - currentBldg.w / 2 + 1.15;
            const maxBX = currentBldg.x + currentBldg.w / 2 - 1.15;
            const minBZ = currentBldg.z - currentBldg.d / 2 + 1.15;
            const maxBZ = currentBldg.z + currentBldg.d / 2 - 1.15;
            player.x = Math.max(minBX, Math.min(maxBX, player.x));
            player.z = Math.max(minBZ, Math.min(maxBZ, player.z));
          }
        }

        // Show/Hide Elevator Control Panel ONLY when the player is on foot near ANY building's elevator!
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

        // Vertical Jump & Gravity onto Support Floor (Only when on foot)
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

        // Ensure Player ONLY holds the Paintball Gun when inside the Paintball Area!
        if (playerRig.gunGroup) {
          playerRig.gunGroup.visible = player.inArena;
        }

        // Check & Update Metro Royal 9F Rooftop Swimming Pool State, Buoyancy & Splash Ripples
        updatePoolParticles(dt);
        const inPoolWaterNow = isPlayerInSwimmingPool(player.x, player.y, player.z);
        if (inPoolWaterNow && !player.isSwimming) {
          player.isSwimming = true;
          SoundFX.playSplash();
          spawnWaterSplash(player.x, METRO_ROYAL_POOL.waterSurfaceY, player.z, 14);
          pushFeedMessage('🏊 Swimming in Metro Royal 9F Sky Pool! WASD to swim, Shift for fast crawl, Space to splash jump!', 'border-l-cyan-400 text-cyan-200');
        } else if (!inPoolWaterNow && player.isSwimming) {
          player.isSwimming = false;
          playerRig.root.rotation.x = 0;
          playerRig.root.rotation.z = 0;
          playerRig.leftArmPivot.rotation.z = 0;
          playerRig.rightArmPivot.rotation.z = 0;
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

        // Update Player Rig Transform & Limb Animation
        if (player.inHelicopter) {
          // Player is parented inside helicopter.model.tiltGroup cockpit seat
          applySeatedPoseToPlayerRig();
        } else if (player.activeVehicle) {
          // Player is parented inside activeVehicle cabin driver seat (head safely inside cabin roof)
          applySeatedPoseToPlayerRig();
        } else if (player.isSwimming) {
          // Player is actively swimming or treading water inside the Metro Royal 9F Rooftop Pool!
          animateSwimmingCharacter(playerRig, horizontalSpeed, dt, timeSec);
        } else {
          playerRig.root.position.set(player.x, player.y, player.z);
          playerRig.root.rotation.y = player.yaw + Math.PI;
          animateBoxCharacter(playerRig, horizontalSpeed, dt, player.inArena);
        }

        // Check 7th Floor Arcade Cabinets & Terrace Rooftop Football Pitch
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
        if (nearestArcadeCabinet && !arcadeGame.active) {
          elArcadeTitle.textContent = nearestArcadeCabinet.title;
          elArcadePrompt.classList.remove('hidden');
        } else {
          elArcadePrompt.classList.add('hidden');
        }
        updateAndDrawArcade();

        // Update Both Football Grounds:
        // 1) Violet Tower Terrace Rooftop Football Court (y = 42.0)
        // 2) Bigger Stadium Football Ground behind Skate & Parkour Building (x: 196, z: 80)
        const onTerrace = !player.inArena && !player.inHelicopter && player.y >= VIOLET_TOWER.terraceY - 0.5 && isPlayerInVioletTower(player.x, player.z);
        const onStadium = !player.inArena && !player.inHelicopter && isPlayerInStadiumPitch(player.x, player.y, player.z);
        const elFootballHud = document.getElementById('rooftop-football-hud');
        const elFootballHudTitle = document.getElementById('football-hud-title');

        if (onTerrace || onStadium) {
          elFootballHud.classList.remove('hidden');
          const activeBall = onStadium ? stadiumFootball : rooftopFootball;
          if (elFootballHudTitle) {
            elFootballHudTitle.textContent = onStadium ? '⚽ Metro Football Stadium' : '⚽ Rooftop Football Court';
          }
          document.getElementById('football-score-blue').textContent = String(activeBall.scoreBlue);
          document.getElementById('football-score-red').textContent = String(activeBall.scoreRed);
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

          const minX = centerX - halfW;
          const maxX = centerX + halfW;
          const minZ = centerZ - halfD;
          const maxZ = centerZ + halfD;

          if (ball.x < minX) { ball.x = minX; ball.vx = Math.abs(ball.vx) * 0.75; }
          if (ball.x > maxX) { ball.x = maxX; ball.vx = -Math.abs(ball.vx) * 0.75; }

          if (ball.z < minZ) {
            if (Math.abs(ball.x - centerX) < goalHalfW) {
              ball.scoreBlue++;
              document.getElementById('football-score-blue').textContent = String(ball.scoreBlue);
              SoundFX.playTeleport();
              spawnPaintSplat(ball.x, groundY + 0.5, minZ, { x: 0, y: 1, z: 0 }, 0x22d3ee);
              pushFeedMessage(`⚽ GOAL in North Net on ${labelName}! (Score: ${ball.scoreBlue} - ${ball.scoreRed})`, 'border-l-cyan-400 text-cyan-200');
              ball.x = ball.homeX;
              ball.y = ball.homeY;
              ball.z = ball.homeZ;
              ball.vx = 0;
              ball.vy = 0;
              ball.vz = 0;
            } else {
              ball.z = minZ;
              ball.vz = Math.abs(ball.vz) * 0.75;
            }
          } else if (ball.z > maxZ) {
            if (Math.abs(ball.x - centerX) < goalHalfW) {
              ball.scoreRed++;
              document.getElementById('football-score-red').textContent = String(ball.scoreRed);
              SoundFX.playTeleport();
              spawnPaintSplat(ball.x, groundY + 0.5, maxZ, { x: 0, y: 1, z: 0 }, 0xf43f5e);
              pushFeedMessage(`⚽ GOAL in South Net on ${labelName}! (Score: ${ball.scoreBlue} - ${ball.scoreRed})`, 'border-l-emerald-400 text-emerald-200');
              ball.x = ball.homeX;
              ball.y = ball.homeY;
              ball.z = ball.homeZ;
              ball.vx = 0;
              ball.vy = 0;
              ball.vz = 0;
            } else {
              ball.z = maxZ;
              ball.vz = -Math.abs(ball.vz) * 0.75;
            }
          }

          ball.mesh.position.set(ball.x, ball.y, ball.z);
          ball.mesh.rotation.x += ball.vz * dt * 1.2;
          ball.mesh.rotation.z -= ball.vx * dt * 1.2;
        }

        // Step Rooftop Football Court (Violet Tower Terrace)
        stepFootballPitch(
          rooftopFootball,
          onTerrace,
          VIOLET_TOWER.x - 2.2,
          VIOLET_TOWER.z,
          11.0,
          15.0,
          3.7,
          VIOLET_TOWER.terraceY + 0.98,
          'Rooftop Football Court'
        );

        // Step Bigger Stadium Football Ground (Behind Skate & Parkour Building)
        stepFootballPitch(
          stadiumFootball,
          onStadium,
          STADIUM_PITCH.x,
          STADIUM_PITCH.z,
          STADIUM_PITCH.w / 2,
          STADIUM_PITCH.d / 2,
          STADIUM_PITCH.goalW / 2,
          0.95,
          'Metro Football Stadium'
        );

        // Check proximity to the Paintball Shop Gate Button near Town Hall
        if (!player.inArena) {
          const distToGate = Math.hypot(
            player.x - GATE_BUTTON_POS.x,
            player.z - GATE_BUTTON_POS.z
          );
          if (distToGate < 7.2) {
            elGatePrompt.classList.remove('hidden');
          } else {
            elGatePrompt.classList.add('hidden');
          }
        }

        // 3. Update Camera Position (Smooth 3rd Person or 1st Person)
        if (player.firstPerson) {
          camera.position.set(player.x, player.y + 2.95, player.z);
          const lookTargetX = player.x - Math.sin(player.yaw) * 20;
          const lookTargetY = player.y + 2.95 + Math.sin(player.pitch) * 20;
          const lookTargetZ = player.z - Math.cos(player.yaw) * 20;
          camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);
        } else {
          let activeIndoorName = null;
          if (!player.inArena && !player.inHelicopter && currentBldg) {
            const curFloorIdx = Math.round(player.y / currentBldg.floorHeight);
            if (curFloorIdx >= currentBldg.numLevels - 1) {
              // Topmost Helipad Roof / Terrace is open sky!
              activeIndoorName = null;
            } else {
              const cleanTitle = currentBldg.title.replace(/^[^a-zA-Z0-9]+\s*/, '');
              activeIndoorName = `${cleanTitle} (${curFloorIdx + 1}F)`;
            }
          }
          if (!player.inArena) {
            if (activeIndoorName) {
              elZoneLabel.textContent = activeIndoorName;
            } else if (isPlayerInVioletTower(player.x, player.z) && player.y >= VIOLET_TOWER.terraceY - 0.5) {
              elZoneLabel.textContent = 'Rooftop Football';
            } else if (isPlayerInStadiumPitch(player.x, player.y, player.z)) {
              elZoneLabel.textContent = 'Football Stadium';
            } else {
              elZoneLabel.textContent = 'Downtown Plaza';
            }
          }
          const inIndoorFloor = !!activeIndoorName;

          const camDist = player.inHelicopter ? 13.5 : (player.activeVehicle ? 11.2 : (inIndoorFloor ? 4.4 : 7.8));
          const rawHeight = (inIndoorFloor ? 3.1 : 4.2) - Math.sin(player.pitch) * (inIndoorFloor ? 1.6 : 3.2);
          const camHeight = inIndoorFloor ? Math.min(4.4, Math.max(1.4, rawHeight)) : rawHeight;
          const shoulderOffset = 0.85;
          const camX =
            player.x +
            Math.sin(player.yaw) * camDist +
            Math.cos(player.yaw) * shoulderOffset;
          const camZ =
            player.z +
            Math.cos(player.yaw) * camDist -
            Math.sin(player.yaw) * shoulderOffset;
          const camY = Math.max(player.y + 1.2, player.y + camHeight);

          camera.position.set(camX, camY, camZ);
          camera.lookAt(
            player.x - Math.sin(player.yaw) * 12,
            player.y + 2.4 + Math.sin(player.pitch) * 8,
            player.z - Math.cos(player.yaw) * 12
          );
        }

        // 4. Update City Citizen AI Characters (Including Mayor in Town Hall, Shopkeeper, Barista & 7F Arcade Gamers)
        cityNPCs.forEach((npc, idx) => {
          if (npc.patrolRadius === 0) {
            const angToPlayer = Math.atan2(player.x - npc.x, player.z - npc.z);
            npc.rig.root.rotation.y = angToPlayer;
            npc.rig.leftArmPivot.rotation.z = Math.sin(timeSec * 4 + idx) * 0.35 + 2.4;
            return;
          }

          if (npc.waitTimer > 0) {
            npc.waitTimer -= dt;
            animateBoxCharacter(npc.rig, 0, dt, false);
            return;
          }

          const dx = npc.targetX - npc.x;
          const dz = npc.targetZ - npc.z;
          const d = Math.hypot(dx, dz);
          if (d < 1.2) {
            npc.waitTimer = 1.0 + Math.random() * 2.0;
            npc.targetX = npc.homeX + (Math.random() - 0.5) * npc.patrolRadius * 2;
            npc.targetZ = npc.homeZ + (Math.random() - 0.5) * npc.patrolRadius * 2;
          } else {
            const stepX = (dx / d) * npc.speed * dt;
            const stepZ = (dz / d) * npc.speed * dt;
            const res = resolveXZCollisions(npc.x + stepX, npc.z + stepZ, 0.75, npc.y || 0);
            npc.x = npc.minX !== undefined ? Math.max(npc.minX, Math.min(npc.maxX, res.x)) : res.x;
            npc.z = npc.minZ !== undefined ? Math.max(npc.minZ, Math.min(npc.maxZ, res.z)) : res.z;
            npc.rig.root.position.set(npc.x, npc.y || 0, npc.z);
            npc.rig.root.rotation.y = Math.atan2(dx, dz);
            animateBoxCharacter(npc.rig, npc.speed, dt, false);
          }
        });

        // 5. Update Outskirts Paintball Arena AI Bots (ONLY play when a match is started by the player!)
        if (player.inArena && matchActive) {
          arenaBots.forEach((bot) => {
            bot.retargetTimer -= dt;
            bot.shootCooldown -= dt;

            // Find closest opposing target (Enemy bots + Player if bot is Red)
            let closestEnemy = null;
            let closestDist = 999;

            if (bot.team === 'red') {
              const dp = Math.hypot(player.x - bot.x, player.z - bot.z);
              if (dp < closestDist) {
                closestDist = dp;
                closestEnemy = { x: player.x, z: player.z, isPlayer: true };
              }
            }

            arenaBots.forEach((other) => {
              if (other.team !== bot.team) {
                const d = Math.hypot(other.x - bot.x, other.z - bot.z);
                if (d < closestDist) {
                  closestDist = d;
                  closestEnemy = other;
                }
              }
            });

            // Pick tactical waypoint inside arena
            if (bot.retargetTimer <= 0 || Math.hypot(bot.targetX - bot.x, bot.targetZ - bot.z) < 1.8) {
              bot.retargetTimer = 1.8 + Math.random() * 2.2;
              const sideBias = bot.team === 'blue' ? -8 : 8;
              bot.targetX = ARENA_CENTER.x + sideBias + (Math.random() - 0.5) * 52;
              bot.targetZ = ARENA_CENTER.z + (Math.random() - 0.5) * 68;
            }

            const mdx = bot.targetX - bot.x;
            const mdz = bot.targetZ - bot.z;
            const md = Math.hypot(mdx, mdz) || 1;
            const nextBotPos = resolveXZCollisions(
              bot.x + (mdx / md) * bot.speed * dt,
              bot.z + (mdz / md) * bot.speed * dt,
              0.85,
              0
            );
            bot.x = Math.max(
              ARENA_CENTER.x - ARENA_HALF_W + 2,
              Math.min(ARENA_CENTER.x + ARENA_HALF_W - 2, nextBotPos.x)
            );
            bot.z = Math.max(
              ARENA_CENTER.z - ARENA_HALF_D + 2,
              Math.min(ARENA_CENTER.z + ARENA_HALF_D - 2, nextBotPos.z)
            );
            bot.rig.root.position.set(bot.x, 0, bot.z);

            // Aim at closest enemy if within sight, otherwise face movement direction
            if (closestEnemy && closestDist < 55) {
              const aimAngle = Math.atan2(closestEnemy.x - bot.x, closestEnemy.z - bot.z);
              bot.rig.root.rotation.y = aimAngle;

              if (bot.shootCooldown <= 0) {
                bot.shootCooldown = 0.75 + Math.random() * 0.95;
                const spreadX = (Math.random() - 0.5) * 0.09;
                const spreadZ = (Math.random() - 0.5) * 0.09;
                const dirX = Math.sin(aimAngle) + spreadX;
                const dirY = 0.04 + (Math.random() - 0.5) * 0.03;
                const dirZ = Math.cos(aimAngle) + spreadZ;
                const norm = Math.hypot(dirX, dirY, dirZ) || 1;

                spawnPaintball(
                  bot.x + Math.sin(aimAngle) * 1.1,
                  2.1,
                  bot.z + Math.cos(aimAngle) * 1.1,
                  dirX / norm,
                  dirY / norm,
                  dirZ / norm,
                  bot.team,
                  bot.name
                );
              }
            } else {
              bot.rig.root.rotation.y = Math.atan2(mdx, mdz);
            }

            animateBoxCharacter(bot.rig, bot.speed, dt, true);
          });
        } else {
          // When no match is started by the player, AI bots stand idle at their base spawns and do not play alone
          arenaBots.forEach((bot) => {
            animateBoxCharacter(bot.rig, 0, dt, false);
          });
        }

        // 6. Update Paintballs (Only active during a player-started Paintball Match)
        if (!player.inArena || !matchActive) {
          for (let i = paintballs.length - 1; i >= 0; i--) {
            scene.remove(paintballs[i].mesh);
          }
          paintballs.length = 0;
        }
        for (let i = paintballs.length - 1; i >= 0; i--) {
          const pb = paintballs[i];
          pb.life -= dt;
          pb.vy -= 9.8 * dt; // Gravity arc

          const nx = pb.mesh.position.x + pb.vx * dt;
          const ny = pb.mesh.position.y + pb.vy * dt;
          const nz = pb.mesh.position.z + pb.vz * dt;

          let hit = false;
          let hitNormal = { x: 0, y: 1, z: 0 };

          // Ground hit
          if (ny <= 0.25) {
            hit = true;
            hitNormal = { x: 0, y: 1, z: 0 };
          }

          // Check hit against Arena Bots
          if (!hit) {
            for (let b = 0; b < arenaBots.length; b++) {
              const bot = arenaBots[b];
              if (bot.team === pb.team) continue;
              if (
                ny > 0.1 &&
                ny < 3.4 &&
                Math.hypot(nx - bot.x, nz - bot.z) < 1.05
              ) {
                hit = true;
                hitNormal = { x: 0, y: 1, z: 0 };
                bot.hp -= 35;
                bot.rig.torsoMat.color.setHex(pb.colorHex);
                SoundFX.playSplat();

                if (bot.hp <= 0) {
                  bot.hp = 100;
                  bot.x = bot.spawnX;
                  bot.z = bot.spawnZ;
                  bot.rig.torsoMat.color.setHex(bot.rig.originalShirtColor);

                  if (pb.team === 'blue') {
                    scoreBlue++;
                    if (pb.shooterName === 'You') {
                      player.splats++;
                      pushFeedMessage(`🎨 You splatted ${bot.name}!`, 'border-l-cyan-400 text-cyan-200');
                    } else {
                      pushFeedMessage(`🟦 ${pb.shooterName} tagged ${bot.name}`, 'border-l-cyan-500 text-slate-200');
                    }
                  } else {
                    scoreRed++;
                    pushFeedMessage(`🟥 ${pb.shooterName} tagged ${bot.name}`, 'border-l-rose-500 text-slate-200');
                  }
                  updateHUD();
                }
                break;
              }
            }
          }

          // Check hit against Player (from Red AI Bots)
          if (!hit && pb.team === 'red' && player.inArena) {
            if (
              ny > player.y &&
              ny < player.y + 3.3 &&
              Math.hypot(nx - player.x, nz - player.z) < 1.0
            ) {
              hit = true;
              player.hp -= 20;
              playerRig.torsoMat.color.setHex(0xf43f5e);
              SoundFX.playSplat();

              if (player.hp <= 0) {
                scoreRed++;
                player.hp = 100;
                player.ammo = 30;
                player.x = ARENA_CENTER.x - 36;
                player.z = ARENA_CENTER.z + (Math.random() - 0.5) * 16;
                playerRig.torsoMat.color.setHex(playerRig.originalShirtColor);
                pushFeedMessage(`💦 Tagged out by ${pb.shooterName}! Respawning at Blue Base...`, 'border-l-rose-400 text-rose-200');
              }
              updateHUD();
            }
          }

          // Check hit against City Citizens (Fun harmless paint tags in the city!)
          if (!hit && !player.inArena) {
            for (let c = 0; c < cityNPCs.length; c++) {
              const npc = cityNPCs[c];
              if (ny > 0.1 && ny < 3.4 && Math.hypot(nx - npc.x, nz - npc.z) < 1.0) {
                hit = true;
                npc.rig.torsoMat.color.setHex(pb.colorHex);
                SoundFX.playSplat();
                break;
              }
            }
          }

          // Check hit against World Colliders (Skyscrapers, Town Hall, Bunkers, Walls)
          if (!hit) {
            for (let c = 0; c < colliders.length; c++) {
              const col = colliders[c];
              if (
                ny <= col.maxY &&
                nx >= col.minX &&
                nx <= col.maxX &&
                nz >= col.minZ &&
                nz <= col.maxZ
              ) {
                hit = true;
                // Determine closest face normal for decal orientation
                const dLeft = Math.abs(nx - col.minX);
                const dRight = Math.abs(col.maxX - nx);
                const dBack = Math.abs(nz - col.minZ);
                const dFront = Math.abs(col.maxZ - nz);
                const minFace = Math.min(dLeft, dRight, dBack, dFront);
                if (minFace === dLeft) hitNormal = { x: -1, y: 0, z: 0 };
                else if (minFace === dRight) hitNormal = { x: 1, y: 0, z: 0 };
                else if (minFace === dBack) hitNormal = { x: 0, y: 0, z: -1 };
                else hitNormal = { x: 0, y: 0, z: 1 };
                break;
              }
            }
          }

          if (hit || pb.life <= 0) {
            if (hit) {
              spawnPaintSplat(nx, Math.max(0.2, ny), nz, hitNormal, pb.colorHex);
            }
            scene.remove(pb.mesh);
            paintballs.splice(i, 1);
          } else {
            pb.mesh.position.set(nx, ny, nz);
          }
        }

        // 7. Update Splat Droplet Particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= dt;
          p.vy -= 18 * dt;
          p.mesh.position.x += p.vx * dt;
          p.mesh.position.y += p.vy * dt;
          p.mesh.position.z += p.vz * dt;
          if (p.life <= 0 || p.mesh.position.y < 0.1) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
          }
        }

        // 8. Match Timer & Victory Check in Arena
        if (player.inArena && matchActive) {
          matchTimeRemaining = Math.max(0, matchTimeRemaining - dt);
          updateHUD();

          if (scoreBlue >= WIN_SCORE || scoreRed >= WIN_SCORE || matchTimeRemaining <= 0) {
            matchActive = false;
            const blueWon = scoreBlue >= scoreRed;
            elMatchResultTitle.textContent = blueWon ? '🏆 BLUE SQUAD WINS!' : '🟥 RED BOTS WIN!';
            elMatchResultSummary.textContent = `Final Score: Blue Squad ${scoreBlue} — Red Bots ${scoreRed} • Your Personal Splats: ${player.splats}`;
            elMatchResultModal.classList.remove('hidden');
            elMatchResultModal.classList.add('flex');
          }
        }

        // 9. Update Live Minimap
        drawMapCanvas(minimapCanvas, false);
      }

      // ==========================================
      // 15. RESIZE HANDLER & ANIMATION LOOP START
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
      if (animFrameId) cancelAnimationFrame(animFrameId);
      lastFrameTime = performance.now();
      animFrameId = requestAnimationFrame(animate);
    
}
