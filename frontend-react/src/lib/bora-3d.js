// Portado de frontend/bora-3d.js. Duas mudanças em relação ao original:
// 1) Three.js vem de import estático (npm), não de CDN via import() dinâmico.
// 2) Os assets do polaroid são buscados em path absoluto (/assets/...), já que
//    agora são servidos por public/assets/ na raiz do site pelo Vite.
import * as THREE from 'three';

(function () {
  if (customElements.get('bora-3d')) return;
  let polaroidGeoP = null, polaroidTexP = null, sharedGrad = null, matCache = null, outlineMat = null;
  function loadPolaroidGeo() {
    if (!polaroidGeoP) polaroidGeoP = fetch('/assets/polaroid-geo.bin').then(r => r.arrayBuffer()).then(buf => {
      const dv = new DataView(buf);
      const n = dv.getUint32(0, true);
      const pos = new Float32Array(buf, 4, n * 3);
      const nor = new Float32Array(buf, 4 + n * 12, n * 3);
      const uv = new Float32Array(buf, 4 + n * 24, n * 2);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      return geo;
    });
    return polaroidGeoP;
  }
  function loadPolaroidTex() {
    if (!polaroidTexP) {
      const loader = new THREE.TextureLoader();
      const load = url => new Promise(res => loader.load(url, t => res(t), undefined, () => res(null)));
      polaroidTexP = Promise.all([load('/assets/polaroid-basecolor.jpg'), load('/assets/polaroid-roughness.jpg')]);
    }
    return polaroidTexP;
  }
  class Bora3D extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      if (!this.style.display) this.style.display = 'block';
      this.style.width = '100%'; this.style.height = '100%';
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;height:100%;display:block';
      this.appendChild(canvas);
      this._setup(canvas);
    }
    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      if (this._io) this._io.disconnect();
      if (this._renderer) this._renderer.dispose();
    }
    _setup(canvas) {
      const renderer = this._renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
      scene.add(new THREE.AmbientLight(0xffffff, 1.05));
      const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(3, 5, 4); scene.add(key);
      const rim = new THREE.DirectionalLight(0x86c4e2, 0.9); rim.position.set(-4, 2, -3); scene.add(rim);
      if (!sharedGrad) {
        const gd = new Uint8Array([110, 110, 110, 255, 255, 255, 255, 255]);
        sharedGrad = new THREE.DataTexture(gd, 2, 1, THREE.RGBAFormat);
        sharedGrad.needsUpdate = true; sharedGrad.minFilter = sharedGrad.magFilter = THREE.NearestFilter;
        matCache = new Map();
        outlineMat = new THREE.MeshBasicMaterial({ color: 0x181c30, side: THREE.BackSide });
      }
      const grad = sharedGrad;
      const M = c => { if (!matCache.has(c)) matCache.set(c, new THREE.MeshToonMaterial({ color: c, gradientMap: grad })); return matCache.get(c); };
      const group = new THREE.Group();
      const add = (geo, color, p, r, os) => {
        const m = new THREE.Mesh(geo, M(color));
        if (p) m.position.set(p[0], p[1], p[2]);
        if (r) m.rotation.set(r[0], r[1], r[2]);
        group.add(m);
        const o = new THREE.Mesh(geo, outlineMat);
        o.position.copy(m.position); o.rotation.copy(m.rotation); o.scale.setScalar(os ? os + 0.02 : 1.07);
        group.add(o);
        return m;
      };
      const starGeo = (R, r, depth) => {
        const s = new THREE.Shape();
        for (let i = 0; i < 10; i++) {
          const a = Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R;
          i ? s.lineTo(Math.cos(a) * rad, Math.sin(a) * rad) : s.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        s.closePath();
        return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
      };
      const kind = this.getAttribute('model') || 'camera';
      let tilt = 0.06;
      if (kind === 'camera') {
        tilt = 0.12;
        add(new THREE.BoxGeometry(3, 1.9, 1.1), 0xf6f0de, [0, 0.1, 0], null, 1.03);
        add(new THREE.BoxGeometry(3.04, 0.55, 1.14), 0x2f323b, [0, -0.62, 0], null, 1.03);
        add(new THREE.CylinderGeometry(0.6, 0.6, 0.55, 40), 0x26262a, [0, 0.18, 0.72], [Math.PI / 2, 0, 0]);
        add(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 40), 0x586c96, [0, 0.18, 1.02], [Math.PI / 2, 0, 0], 1.09);
        add(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 30), 0x161c2c, [0, 0.18, 1.08], [Math.PI / 2, 0, 0], 1.12);
        add(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 26), 0xf05246, [-1.05, -0.2, 0.6], [Math.PI / 2, 0, 0], 1.1);
        add(new THREE.BoxGeometry(0.62, 0.42, 0.14), 0x1e2028, [0.98, 0.55, 0.56], null, 1.08);
        add(new THREE.BoxGeometry(0.44, 0.26, 0.06), 0x9db8e8, [0.98, 0.55, 0.65], null, 1.1);
        add(new THREE.BoxGeometry(0.56, 0.36, 0.1), 0x30323a, [-0.98, 0.55, 0.56], null, 1.08);
        add(new THREE.BoxGeometry(0.4, 0.22, 0.06), 0xd6e4ff, [-0.98, 0.55, 0.63], null, 1.1);
        add(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 22), 0xff007f, [1.15, 1.0, 0], null, 1.12);
      } else if (kind === 'trophy') {
        add(new THREE.CylinderGeometry(0.78, 0.5, 1.05, 36), 0xf2c14e, [0, 0.6, 0]);
        add(new THREE.TorusGeometry(0.76, 0.07, 14, 40), 0xf2c14e, [0, 1.12, 0], [Math.PI / 2, 0, 0]);
        add(new THREE.TorusGeometry(0.42, 0.08, 14, 28, Math.PI), 0xd99e2b, [-0.78, 0.62, 0], [0, 0, Math.PI / 2], 1.08);
        add(new THREE.TorusGeometry(0.42, 0.08, 14, 28, Math.PI), 0xd99e2b, [0.78, 0.62, 0], [0, 0, -Math.PI / 2], 1.08);
        add(new THREE.CylinderGeometry(0.16, 0.24, 0.42, 24), 0xd99e2b, [0, -0.12, 0], null, 1.09);
        add(new THREE.CylinderGeometry(0.5, 0.56, 0.16, 28), 0xd99e2b, [0, -0.4, 0], null, 1.07);
        add(new THREE.BoxGeometry(1.15, 0.34, 1.15), 0x283fb1, [0, -0.66, 0], null, 1.05);
      } else if (kind === 'medal') {
        add(new THREE.CylinderGeometry(0.72, 0.72, 0.16, 44), 0xf2c14e, [0, -0.25, 0], [Math.PI / 2, 0, 0]);
        add(new THREE.TorusGeometry(0.68, 0.08, 14, 44), 0xd99e2b, [0, -0.25, 0.06], null, 1.06);
        add(starGeo(0.38, 0.16, 0.09), 0xff007f, [0, -0.25, 0.08], null, 1.1);
        add(new THREE.BoxGeometry(0.34, 0.8, 0.08), 0xff007f, [-0.22, 0.55, -0.06], [0, 0, 0.4], 1.07);
        add(new THREE.BoxGeometry(0.34, 0.8, 0.08), 0x3384aa, [0.22, 0.55, -0.06], [0, 0, -0.4], 1.07);
      }
      const finish = () => {
      scene.add(group);
      const box = new THREE.Box3().setFromObject(group);
      const ctr = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const baseY = -ctr.y;
      group.position.y = baseY;
      const maxDim = Math.max(size.x, size.y, size.z);
      const dist = (maxDim / 2) / Math.tan(cam.fov * Math.PI / 360) * 1.28;
      cam.position.set(0, maxDim * 0.12, dist);
      cam.lookAt(0, 0, 0);
      const resize = () => {
        const w = this.clientWidth || 100, h = this.clientHeight || 100;
        renderer.setSize(w, h, false);
        cam.aspect = w / h; cam.updateProjectionMatrix();
        if (this._staticFrame) renderer.render(scene, cam);
      };
      this._ro = new ResizeObserver(resize);
      this._ro.observe(this);
      resize();
      this._visible = true;
      this._io = new IntersectionObserver(entries => { this._visible = entries[0].isIntersecting; }, { threshold: 0.01 });
      this._io.observe(this);
      const sway = this.hasAttribute('sway');
      const front = this.hasAttribute('front');
      const yaw = parseFloat(this.getAttribute('yaw') || '0');
      const speed = parseFloat(this.getAttribute('spin') || '0.55');
      if (front) {
        group.rotation.y = yaw; group.rotation.x = tilt; group.position.y = baseY;
        renderer.render(scene, cam);
        this._staticFrame = true;
        this.dispatchEvent(new CustomEvent('bora3d-ready', { bubbles: true, composed: true }));
        return;
      }
      const loop = t => {
        this._raf = requestAnimationFrame(loop);
        if (document.hidden || !this._visible) return;
        const e = t / 1000;
        group.rotation.y = sway ? Math.sin(e * 1.2) * 0.55 : e * speed;
        group.rotation.x = tilt + Math.sin(e * 1.5) * 0.02;
        group.position.y = baseY + Math.sin(e * 1.7) * (size.y * 0.03);
        renderer.render(scene, cam);
      };
      this._raf = requestAnimationFrame(loop);
      this.dispatchEvent(new CustomEvent('bora3d-ready', { bubbles: true, composed: true }));
      };
      if (kind === 'polaroid') {
        Promise.all([loadPolaroidGeo(), loadPolaroidTex()]).then(([geo, [map, rough]]) => {
          if (!this.isConnected) return;
          if (!map) { console.error('bora-3d: falha ao carregar textura'); add(geo, 0xf6f0de, null, null, 1.02); finish(); return; }
          map.colorSpace = THREE.SRGBColorSpace;
          map.anisotropy = 4;
          const matOpts = { map, roughness: 1, metalness: 0.06, envMapIntensity: 1 };
          if (rough) { rough.anisotropy = 2; matOpts.roughnessMap = rough; }
          const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial(matOpts));
          group.add(mesh);
          const o = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x181c30, side: THREE.BackSide }));
          o.scale.setScalar(1.02); group.add(o);
          finish();
        });
      } else {
        finish();
      }
    }
  }
  customElements.define('bora-3d', Bora3D);
})();
