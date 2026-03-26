/* ═══════════════════════════════
   Cursor — dot + ring with magnetic hover
═══════════════════════════════ */
const cur = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx = -300, my = -300, rx = -300, ry = -300;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top = my + 'px';
});

(function tickRing() {
  rx += (mx - rx) * .11;
  ry += (my - ry) * .11;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(tickRing);
})();


/* ═══════════════════════════════
   Magnetic cursor for interactive elements
═══════════════════════════════ */
const magneticEls = document.querySelectorAll('.magnetic');

magneticEls.forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    cur.classList.add('hover-active');
    ring.classList.add('hover-active');
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
    cur.classList.remove('hover-active');
    ring.classList.remove('hover-active');
  });
});

// Sticky invert ball on ALL interactive elements (a, button, nav links, cards)
document.addEventListener('mouseover', e => {
  const target = e.target.closest('a, button, .card-spotlight, nav a, .social-link');
  if (target) {
    cur.classList.add('hover-active');
    ring.classList.add('hover-active');
  }
});
document.addEventListener('mouseout', e => {
  const target = e.target.closest('a, button, .card-spotlight, nav a, .social-link');
  if (target) {
    cur.classList.remove('hover-active');
    ring.classList.remove('hover-active');
  }
});


/* ═══════════════════════════════
   SpotlightCard — mouse-following light
═══════════════════════════════ */
document.querySelectorAll('.card-spotlight').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.setProperty('--spotlight-color', 'rgba(255, 255, 255, 0.06)');
  });
});


/* ═══════════════════════════════
   Scroll progress bar
═══════════════════════════════ */
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  document.documentElement.style.setProperty('--scroll', progress.toFixed(4));
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });


/* ═══════════════════════════════
   About — char-by-char reveal on scroll
═══════════════════════════════ */
function prepareCharReveal(el) {
  const nodes = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(textNode => {
    const parent = textNode.parentNode;
    const frag = document.createDocumentFragment();
    const text = textNode.textContent;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === ' ' || ch === '\n') {
        frag.appendChild(document.createTextNode(ch));
      } else {
        const span = document.createElement('span');
        span.className = 'char-wrap';
        span.textContent = ch;
        frag.appendChild(span);
      }
    }
    parent.replaceChild(frag, textNode);
  });
}

document.querySelectorAll('[data-char-reveal]').forEach(prepareCharReveal);


/* ═══════════════════════════════════════════════════════
   ASCII TEXT EFFECT — Ported from React/Three.js component
   Original: https://codepen.io/JuanFuentes/pen/eYEeoyE
═══════════════════════════════════════════════════════ */

Math.map = function (n, start, stop, start2, stop2) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
};

const PX_RATIO = window.devicePixelRatio || 1;

/* ── ASCII Filter ── */
class AsciiFilter {
  constructor(renderer, { fontSize, fontFamily, charset, invert } = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement('div');
    this.domElement.style.position = 'absolute';
    this.domElement.style.top = '0';
    this.domElement.style.left = '0';
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';

    this.pre = document.createElement('pre');
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.domElement.appendChild(this.canvas);

    this.deg = 0;
    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "'Courier New', monospace";
    this.charset = charset ?? ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;

    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();
    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const charWidth = this.context.measureText('A').width;
    this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
    this.rows = Math.floor(this.height / this.fontSize);
    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    this.pre.style.fontFamily = this.fontFamily;
    this.pre.style.fontSize = `${this.fontSize}px`;
    this.pre.style.margin = '0';
    this.pre.style.padding = '0';
    this.pre.style.lineHeight = '1em';
    this.pre.style.position = 'absolute';
    this.pre.style.left = '0';
    this.pre.style.top = '0';
    this.pre.style.zIndex = '9';
    this.pre.style.backgroundAttachment = 'fixed';
    this.pre.style.mixBlendMode = 'difference';
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    if (this.context && w && h) {
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
    }
    this.asciify(this.context, w, h);
    this.hue();
  }

  onMouseMove(e) {
    this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
  }

  get dx() { return this.mouse.x - this.center.x; }
  get dy() { return this.mouse.y - this.center.y; }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(ctx, w, h) {
    if (w && h) {
      const imgData = ctx.getImageData(0, 0, w, h).data;
      let str = '';
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = x * 4 + y * 4 * w;
          const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];
          if (a === 0) { str += ' '; continue; }
          let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
          let idx = Math.floor((1 - gray) * (this.charset.length - 1));
          if (this.invert) idx = this.charset.length - idx - 1;
          str += this.charset[idx];
        }
        str += '\n';
      }
      this.pre.innerHTML = str;
    }
  }

  dispose() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}

/* ── Canvas Text Renderer — supports multiline via \n ── */
class CanvasTxt {
  constructor(txt, { fontSize = 200, fontFamily = 'Arial', color = '#fdf9f3' } = {}) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.txt = txt;
    this.lines = txt.split('\n');
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;
    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    this.context.font = this.font;

    // Measure widest line
    let maxWidth = 0;
    this.lines.forEach(line => {
      const w = this.context.measureText(line).width;
      if (w > maxWidth) maxWidth = w;
    });

    const metrics = this.context.measureText(this.lines[0]);
    const lineHeight = this.fontSize * 1.15;
    const totalHeight = lineHeight * this.lines.length;

    this.canvas.width = Math.ceil(maxWidth) + 20;
    this.canvas.height = Math.ceil(totalHeight) + 20;
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;

    const lineHeight = this.fontSize * 1.15;
    this.lines.forEach((line, i) => {
      const metrics = this.context.measureText(line);
      const yPos = 10 + metrics.actualBoundingBoxAscent + i * lineHeight;
      // Center each line
      const lineWidth = metrics.width;
      const xPos = (this.canvas.width - lineWidth) / 2;
      this.context.fillText(line, xPos, yPos);
    });
  }

  get width() { return this.canvas.width; }
  get height() { return this.canvas.height; }
  get texture() { return this.canvas; }
}

/* ── Three.js shaders ── */
const asciiVertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;
    float waveFactor = uEnableWaves;
    vec3 transformed = position;
    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const asciiFragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

/* ── Main ASCII Scene Controller ── */
class CanvAscii {
  constructor({ text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves }, container, width, height) {
    this.textString = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = container;
    this.width = width;
    this.height = height;
    this.enableWaves = enableWaves;

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 30;
    this.scene = new THREE.Scene();
    this.mouse = { x: this.width / 2, y: this.height / 2 };
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  async init() {
    try {
      await document.fonts.load('600 200px "IBM Plex Mono"');
      await document.fonts.load('500 12px "IBM Plex Mono"');
    } catch (e) { /* fallback */ }
    await document.fonts.ready;
    this.setMesh();
    this.setRenderer();
  }

  setMesh() {
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: 'IBM Plex Mono',
      color: this.textColor
    });
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;

    const textAspect = this.textCanvas.width / this.textCanvas.height;
    const baseH = this.planeBaseHeight;
    const planeW = baseH * textAspect;
    const planeH = baseH;

    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
    this.material = new THREE.ShaderMaterial({
      vertexShader: asciiVertexShader,
      fragmentShader: asciiFragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 }
      }
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: 'IBM Plex Mono',
      fontSize: this.asciiFontSize,
      invert: true
    });

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);

    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('touchmove', this.onMouseMove);
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.filter.setSize(w, h);
    this.center = { x: w / 2, y: h / 2 };
  }

  load() { this.animate(); }

  onMouseMove(evt) {
    const e = evt.touches ? evt.touches[0] : evt;
    const bounds = this.container.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    this.mouse = { x, y };
  }

  animate() {
    const animateFrame = () => {
      this.animationFrameId = requestAnimationFrame(animateFrame);
      this.render();
    };
    animateFrame();
  }

  render() {
    const time = new Date().getTime() * 0.001;
    this.textCanvas.render();
    this.texture.needsUpdate = true;
    this.mesh.material.uniforms.uTime.value = Math.sin(time);
    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateRotation() {
    const x = Math.map(this.mouse.y, 0, this.height, 0.3, -0.3);
    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
    // Y rotation locked — no side-to-side tilt
    this.mesh.rotation.y += (0 - this.mesh.rotation.y) * 0.05;
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.filter) {
      this.filter.dispose();
      if (this.filter.domElement.parentNode) {
        this.container.removeChild(this.filter.domElement);
      }
    }
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('touchmove', this.onMouseMove);
    this.scene.traverse(obj => {
      if (obj.isMesh && obj.material) {
        Object.keys(obj.material).forEach(key => {
          const prop = obj.material[key];
          if (prop && typeof prop === 'object' && typeof prop.dispose === 'function') prop.dispose();
        });
        obj.material.dispose();
        obj.geometry.dispose();
      }
    });
    this.scene.clear();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}


/* ═══════════════════════════════
   Initialize ASCII text instances
═══════════════════════════════ */
async function initAsciiInstance(containerId, config) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const { width, height } = container.getBoundingClientRect();

  if (width === 0 || height === 0) {
    return new Promise(resolve => {
      const observer = new IntersectionObserver(async ([entry]) => {
        if (entry.isIntersecting && entry.boundingClientRect.width > 0) {
          observer.disconnect();
          const { width: w, height: h } = entry.boundingClientRect;
          const instance = new CanvAscii(config, container, w, h);
          await instance.init();
          instance.load();
          new ResizeObserver(entries => {
            const { width: rw, height: rh } = entries[0].contentRect;
            if (rw > 0 && rh > 0) instance.setSize(rw, rh);
          }).observe(container);
          resolve(instance);
        }
      }, { threshold: 0.1 });
      observer.observe(container);
    });
  }

  const instance = new CanvAscii(config, container, width, height);
  await instance.init();
  instance.load();
  new ResizeObserver(entries => {
    const { width: rw, height: rh } = entries[0].contentRect;
    if (rw > 0 && rh > 0) instance.setSize(rw, rh);
  }).observe(container);
  return instance;
}

// Hero: "Pedro\nForbeck" on two lines — massive, with waves
initAsciiInstance('ascii-hero', {
  text: 'Pedro\nForbeck',
  asciiFontSize: 10,
  textFontSize: 280,
  textColor: '#fdf9f3',
  planeBaseHeight: 18,
  enableWaves: true
});

// Projects heading: "PROJECTS" — large and readable, no waves
initAsciiInstance('ascii-projects', {
  text: 'PROJECTS',
  asciiFontSize: 12,
  textFontSize: 240,
  textColor: '#fdf9f3',
  planeBaseHeight: 10,
  enableWaves: false
});


/* ═══════════════════════════════
   WebGL Fog Shaders (original)
═══════════════════════════════ */
const VERT_SRC = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const WAVE_FRAG_SRC = `
precision highp float;
uniform vec2  resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec2  mousePos;
uniform float mouseRadius;
uniform float scrollFade;

vec4 mod289v(vec4 x) { return x - floor(x*(1./289.))*289.; }
vec4 permute(vec4 x) { return mod289v(((x*34.)+1.)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }
vec2 fade2(vec2 t){ return t*t*t*(t*(t*6.-15.)+10.); }

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy)+vec4(0,0,1,1);
  vec4 Pf = fract(P.xyxy)-vec4(0,0,1,1);
  Pi = mod289v(Pi);
  vec4 ix=Pi.xzxz, iy=Pi.yyww, fx=Pf.xzxz, fy=Pf.yyww;
  vec4 i = permute(permute(ix)+iy);
  vec4 gx = fract(i*(1./41.))*2.-1.;
  vec4 gy = abs(gx)-.5;
  vec4 tx = floor(gx+.5); gx-=tx;
  vec2 g00=vec2(gx.x,gy.x), g10=vec2(gx.y,gy.y);
  vec2 g01=vec2(gx.z,gy.z), g11=vec2(gx.w,gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11)));
  g00*=norm.x; g01*=norm.y; g10*=norm.z; g11*=norm.w;
  float n00=dot(g00,vec2(fx.x,fy.x));
  float n10=dot(g10,vec2(fx.y,fy.y));
  float n01=dot(g01,vec2(fx.z,fy.z));
  float n11=dot(g11,vec2(fx.w,fy.w));
  vec2 fxy=fade2(Pf.xy);
  vec2 nx=mix(vec2(n00,n01),vec2(n10,n11),fxy.x);
  return 2.3*mix(nx.x,nx.y,fxy.y);
}

float fbm(vec2 p){
  float v=0., amp=1., freq=waveFrequency;
  for(int i=0;i<4;i++){ v+=amp*abs(cnoise(p)); p*=freq; amp*=waveAmplitude; }
  return v;
}

float pattern(vec2 p){
  vec2 p2 = p - time*waveSpeed;
  return fbm(p + fbm(p2));
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  uv -= .5;
  uv.x *= resolution.x/resolution.y;
  float f = pattern(uv);
  vec2 mNDC = (mousePos/resolution - .5)*vec2(1.,-1.);
  mNDC.x *= resolution.x/resolution.y;
  float dist = length(uv - mNDC);
  float effect = 1. - smoothstep(0., mouseRadius, dist);
  f -= 0.5 * effect;
  f *= scrollFade;
  float c = clamp(f, 0., 1.);
  gl_FragColor = vec4(vec3(c), 1.0);
}
`;

const DITHER_FRAG_SRC = `
precision highp float;
uniform sampler2D inputBuffer;
uniform vec2  resolution;
uniform float colorNum;
uniform float pixelSize;

float bayer(int idx){
  float m[64];
  m[0]=0./64.;  m[1]=48./64.; m[2]=12./64.; m[3]=60./64.;
  m[4]=3./64.;  m[5]=51./64.; m[6]=15./64.; m[7]=63./64.;
  m[8]=32./64.; m[9]=16./64.; m[10]=44./64.;m[11]=28./64.;
  m[12]=35./64.;m[13]=19./64.;m[14]=47./64.;m[15]=31./64.;
  m[16]=8./64.; m[17]=56./64.;m[18]=4./64.; m[19]=52./64.;
  m[20]=11./64.;m[21]=59./64.;m[22]=7./64.; m[23]=55./64.;
  m[24]=40./64.;m[25]=24./64.;m[26]=36./64.;m[27]=20./64.;
  m[28]=43./64.;m[29]=27./64.;m[30]=39./64.;m[31]=23./64.;
  m[32]=2./64.; m[33]=50./64.;m[34]=14./64.;m[35]=62./64.;
  m[36]=1./64.; m[37]=49./64.;m[38]=13./64.;m[39]=61./64.;
  m[40]=34./64.;m[41]=18./64.;m[42]=46./64.;m[43]=30./64.;
  m[44]=33./64.;m[45]=17./64.;m[46]=45./64.;m[47]=29./64.;
  m[48]=10./64.;m[49]=58./64.;m[50]=6./64.; m[51]=54./64.;
  m[52]=9./64.; m[53]=57./64.;m[54]=5./64.; m[55]=53./64.;
  m[56]=42./64.;m[57]=26./64.;m[58]=38./64.;m[59]=22./64.;
  m[60]=41./64.;m[61]=25./64.;m[62]=37./64.;m[63]=21./64.;
  float val=0.;
  for(int i=0;i<64;i++) if(i==idx) val=m[i];
  return val;
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 pixUV = floor(uv * resolution / pixelSize) * pixelSize / resolution;
  vec3 color = texture2D(inputBuffer, pixUV).rgb;
  vec2 coord = floor(uv * resolution / pixelSize);
  int x = int(mod(coord.x, 8.));
  int y = int(mod(coord.y, 8.));
  float threshold = bayer(y*8+x) - 0.25;
  float step_ = 1. / (colorNum - 1.);
  color += threshold * step_;
  color = clamp(color - 0.2, 0., 1.);
  color = floor(color*(colorNum-1.)+.5)/(colorNum-1.);
  gl_FragColor = vec4(color, 1.0);
}
`;


/* ═══════════════════════════════
   WebGL setup (original fog)
═══════════════════════════════ */
const canvas = document.getElementById('fog-canvas');
const gl = canvas.getContext('webgl');

function mkShader(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    console.error(gl.getShaderInfoLog(s));
  return s;
}

function mkProg(vSrc, fSrc) {
  const p = gl.createProgram();
  gl.attachShader(p, mkShader(gl.VERTEX_SHADER, vSrc));
  gl.attachShader(p, mkShader(gl.FRAGMENT_SHADER, fSrc));
  gl.linkProgram(p);
  return p;
}

const waveProg = mkProg(VERT_SRC, WAVE_FRAG_SRC);
const ditherProg = mkProg(VERT_SRC, DITHER_FRAG_SRC);

const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);
gl.bufferData(gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
  gl.STATIC_DRAW);

function bindQuad(prog) {
  const loc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
}

let fbo, fboTex;
function buildFBO() {
  if (fbo) gl.deleteFramebuffer(fbo);
  if (fboTex) gl.deleteTexture(fboTex);
  fboTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, fboTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function fogResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  buildFBO();
}
fogResize();
window.addEventListener('resize', fogResize);

const wU = {
  resolution: gl.getUniformLocation(waveProg, 'resolution'),
  time: gl.getUniformLocation(waveProg, 'time'),
  waveSpeed: gl.getUniformLocation(waveProg, 'waveSpeed'),
  waveFreq: gl.getUniformLocation(waveProg, 'waveFrequency'),
  waveAmp: gl.getUniformLocation(waveProg, 'waveAmplitude'),
  mousePos: gl.getUniformLocation(waveProg, 'mousePos'),
  mouseRad: gl.getUniformLocation(waveProg, 'mouseRadius'),
  scrollFade: gl.getUniformLocation(waveProg, 'scrollFade'),
};
const dU = {
  resolution: gl.getUniformLocation(ditherProg, 'resolution'),
  input: gl.getUniformLocation(ditherProg, 'inputBuffer'),
  colorNum: gl.getUniformLocation(ditherProg, 'colorNum'),
  pixelSize: gl.getUniformLocation(ditherProg, 'pixelSize'),
};

let fogMouseX = -9999, fogMouseY = -9999, scrollFadeVal = 1;
document.addEventListener('mousemove', e => { fogMouseX = e.clientX; fogMouseY = e.clientY; });
window.addEventListener('scroll', () => {
  scrollFadeVal = Math.max(0, 1 - window.scrollY / (window.innerHeight * .7));
}, { passive: true });

function renderFog(nowMs) {
  const t = nowMs * 0.001;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(waveProg);
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  bindQuad(waveProg);
  gl.uniform2f(wU.resolution, canvas.width, canvas.height);
  gl.uniform1f(wU.time, t);
  gl.uniform1f(wU.waveSpeed, 0.05);
  gl.uniform1f(wU.waveFreq, 3.0);
  gl.uniform1f(wU.waveAmp, 0.3);
  gl.uniform2f(wU.mousePos, fogMouseX, fogMouseY);
  gl.uniform1f(wU.mouseRad, 0.28);
  gl.uniform1f(wU.scrollFade, scrollFadeVal);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(ditherProg);
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  bindQuad(ditherProg);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, fboTex);
  gl.uniform1i(dU.input, 0);
  gl.uniform2f(dU.resolution, canvas.width, canvas.height);
  gl.uniform1f(dU.colorNum, 4.0);
  gl.uniform1f(dU.pixelSize, 2.0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(renderFog);
}
requestAnimationFrame(renderFog);


/* ═══════════════════════════════
   Enhanced scroll reveal (IntersectionObserver)
═══════════════════════════════ */
const aboutInner = document.querySelector('.about-inner');
const workItems = document.querySelectorAll('.work-item');
const dividers = document.querySelectorAll('.section-divider');
const footer = document.querySelector('footer');

// About section
const aboutObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      const chars = e.target.querySelectorAll('.char-wrap');
      chars.forEach((ch, i) => {
        ch.style.transitionDelay = `${0.3 + i * 0.015}s`;
        requestAnimationFrame(() => ch.classList.add('revealed'));
      });
    }
  });
}, { threshold: 0.15 });

if (aboutInner) aboutObserver.observe(aboutInner);

// Work items
const workObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

workItems.forEach((item, i) => {
  item.style.transitionDelay = `${i * 0.15}s`;
  workObserver.observe(item);
});

// Dividers
const dividerObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.3 });
dividers.forEach(d => dividerObserver.observe(d));

// Footer
const footerObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.2 });
if (footer) footerObserver.observe(footer);
