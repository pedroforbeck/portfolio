/* ═══════════════════════════════
   Cursor
═══════════════════════════════ */
const cur  = document.getElementById('cur');
const ring = document.getElementById('cur-ring');
let mx = -300, my = -300, rx = -300, ry = -300;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});

(function tickRing() {
  rx += (mx - rx) * .11;
  ry += (my - ry) * .11;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(tickRing);
})();


/* ═══════════════════════════════
   Shaders (inline GLSL strings)
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
   WebGL setup
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

const waveProg   = mkProg(VERT_SRC, WAVE_FRAG_SRC);
const ditherProg = mkProg(VERT_SRC, DITHER_FRAG_SRC);

/* fullscreen quad */
const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);
gl.bufferData(gl.ARRAY_BUFFER,
  new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
  gl.STATIC_DRAW);

function bindQuad(prog) {
  const loc = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
}

/* framebuffer for pass 1 */
let fbo, fboTex;
function buildFBO() {
  if (fbo)    gl.deleteFramebuffer(fbo);
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

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  buildFBO();
}
resize();
window.addEventListener('resize', resize);

/* uniform locations */
const wU = {
  resolution: gl.getUniformLocation(waveProg, 'resolution'),
  time:       gl.getUniformLocation(waveProg, 'time'),
  waveSpeed:  gl.getUniformLocation(waveProg, 'waveSpeed'),
  waveFreq:   gl.getUniformLocation(waveProg, 'waveFrequency'),
  waveAmp:    gl.getUniformLocation(waveProg, 'waveAmplitude'),
  mousePos:   gl.getUniformLocation(waveProg, 'mousePos'),
  mouseRad:   gl.getUniformLocation(waveProg, 'mouseRadius'),
  scrollFade: gl.getUniformLocation(waveProg, 'scrollFade'),
};
const dU = {
  resolution: gl.getUniformLocation(ditherProg, 'resolution'),
  input:      gl.getUniformLocation(ditherProg, 'inputBuffer'),
  colorNum:   gl.getUniformLocation(ditherProg, 'colorNum'),
  pixelSize:  gl.getUniformLocation(ditherProg, 'pixelSize'),
};

let mouseX = -9999, mouseY = -9999, scrollFadeVal = 1;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
window.addEventListener('scroll', () => {
  scrollFadeVal = Math.max(0, 1 - window.scrollY / (window.innerHeight * .7));
});


/* ═══════════════════════════════
   Render loop
═══════════════════════════════ */
function render(nowMs) {
  const t = nowMs * 0.001;

  /* Pass 1: wave → FBO */
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(waveProg);
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  bindQuad(waveProg);
  gl.uniform2f(wU.resolution, canvas.width, canvas.height);
  gl.uniform1f(wU.time,       t);
  gl.uniform1f(wU.waveSpeed,  0.05);
  gl.uniform1f(wU.waveFreq,   3.0);
  gl.uniform1f(wU.waveAmp,    0.3);
  gl.uniform2f(wU.mousePos,   mouseX, mouseY);
  gl.uniform1f(wU.mouseRad,   0.28);
  gl.uniform1f(wU.scrollFade, scrollFadeVal);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  /* Pass 2: dither → screen */
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(ditherProg);
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  bindQuad(ditherProg);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, fboTex);
  gl.uniform1i(dU.input,      0);
  gl.uniform2f(dU.resolution, canvas.width, canvas.height);
  gl.uniform1f(dU.colorNum,   4.0);
  gl.uniform1f(dU.pixelSize,  2.0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);


/* ═══════════════════════════════
   Scroll reveal
═══════════════════════════════ */
const revealEls = document.querySelectorAll('.about-inner, #work .label, .work-item');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .12 });
revealEls.forEach(el => io.observe(el));
