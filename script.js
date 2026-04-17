/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Magnetic cursor for interactive elements
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const magneticEls = document.querySelectorAll('.magnetic');

magneticEls.forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Scroll progress bar
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;
  document.documentElement.style.setProperty('--scroll', progress.toFixed(4));
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   About â€” char-by-char reveal on scroll
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ASCII TEXT EFFECT â€” Ported from React/Three.js component
   Original: https://codepen.io/JuanFuentes/pen/eYEeoyE
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

Math.map = function (n, start, stop, start2, stop2) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
};

const PX_RATIO = window.devicePixelRatio || 1;

/* â”€â”€ ASCII Filter â”€â”€ */
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

/* â”€â”€ Canvas Text Renderer â€” supports multiline via \n â”€â”€ */
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

/* â”€â”€ Three.js shaders â”€â”€ */
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

/* â”€â”€ Main ASCII Scene Controller â”€â”€ */
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
    this.onClick = this.onClick.bind(this);
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
    this.container.addEventListener('click', this.onClick);
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

  onClick() {
    this.enableWaves = !this.enableWaves;
    if (this.mesh && this.mesh.material) {
      this.mesh.material.uniforms.uEnableWaves.value = this.enableWaves ? 1.0 : 0.0;
    }
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
    const y = Math.map(this.mouse.x, 0, this.width, -0.3, 0.3);
    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
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
    this.container.removeEventListener('click', this.onClick);
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


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Initialize ASCII text instances
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

const viewportWidth = window.innerWidth;
const isSmallMobile = viewportWidth <= 430;
const isMobile = viewportWidth <= 768;
const responsiveAsciiSize = isSmallMobile ? 2 : (isMobile ? 3 : 7);
const heroTextFontSize = isSmallMobile ? 170 : 280;
const heroPlaneBaseHeight = isSmallMobile ? 13 : 18;

// Hero: "Pedro\nForbeck" on two lines â€” massive, with waves
initAsciiInstance('ascii-hero', {
  text: 'Pedro\nForbeck',
  asciiFontSize: responsiveAsciiSize,
  textFontSize: heroTextFontSize,
  textColor: '#fdf9f3',
  planeBaseHeight: heroPlaneBaseHeight,
  enableWaves: false
});

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   Enhanced scroll reveal (IntersectionObserver)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

/* 
   Theme Toggle (Light/Dark Mode)
 */
const themeToggle = document.getElementById('theme-toggle');

// Check for saved user preference, if any, on load of the website
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

themeToggle.addEventListener('click', () => {
  let theme = document.documentElement.getAttribute('data-theme');

  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
});

// Also add magnetic behaviour for the theme button since it was not caught by the original querySelectorAll
themeToggle.addEventListener('mousemove', e => {
  const rect = themeToggle.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  themeToggle.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
});
themeToggle.addEventListener('mouseleave', () => {
  themeToggle.style.transform = '';
});