/**
 * DarkVeil Background Effect
 * Ported from ReactBits (https://reactbits.dev/backgrounds/dark-veil)
 * Uses OGL for lightweight WebGL rendering (~24KB vs Three.js ~150KB)
 */

import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';

export interface DarkVeilConfig {
  hueShift?: number;    // Default: 0 (green/teal aurora feel for Midnight Evergreen)
  noise?: number;       // Default: 0.1
  scan?: number;        // Default: 0.3
  scanFreq?: number;    // Default: 5.0
  warp?: number;        // Default: 0.3
}

const vertex = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = `
#ifdef GL_ES
precision lowp float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;

#define iTime uTime
#define iResolution uResolution

vec4 buf[8];

float rand(vec2 c) {
  return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453);
}

mat3 rgb2yiq = mat3(
  0.299, 0.587, 0.114,
  0.596, -0.274, -0.322,
  0.211, -0.523, 0.312
);

mat3 yiq2rgb = mat3(
  1.0, 0.956, 0.621,
  1.0, -0.272, -0.647,
  1.0, -1.106, 1.703
);

vec3 hueShiftRGB(vec3 col, float deg) {
  vec3 yiq = rgb2yiq * col;
  float rad = radians(deg);
  float cosh = cos(rad), sinh = sin(rad);
  vec3 yiqShift = vec3(yiq.x, yiq.y * cosh - yiq.z * sinh, yiq.y * sinh + yiq.z * cosh);
  return clamp(yiq2rgb * yiqShift, 0.0, 1.0);
}

vec4 sigmoid(vec4 x) {
  return 1.0 / (1.0 + exp(-x));
}

vec4 cppn_fn(vec2 coordinate, float in0, float in1, float in2) {
  buf[6] = vec4(coordinate.x, coordinate.y, 0.3948333106474662 + in0, 0.36 + in1);
  buf[7] = vec4(0.14 + in2, sqrt(coordinate.x * coordinate.x + coordinate.y * coordinate.y), 0.0, 0.0);

  buf[0] = mat4(
    vec4(6.5404263, -3.6126034, 0.7590882, -1.13613),
    vec4(2.4582713, 3.1660357, 1.2219609, 0.06276096),
    vec4(-5.478085, -6.159632, 1.8701609, -4.7742867),
    vec4(6.039214, -5.542865, -0.90925294, 3.251348)
  ) * buf[6] + mat4(
    vec4(4.2889442, 0.3310852, -0.14545858, -2.9568007),
    vec4(-3.8456728, 1.6846775, 4.4567056, 2.5948365),
    vec4(-2.0069776, 4.6727157, -8.023987, -4.1855674),
    vec4(0.062032037, -2.5133026, 0.17197812, 3.6685874)
  ) * buf[7];
  buf[0] = sin(buf[0]);

  buf[1] = mat4(
    vec4(-0.16754247, -1.8379664, 0.0039082994, 2.0055532),
    vec4(-1.5693796, -1.8168135, 0.59915364, 1.0228647),
    vec4(-0.08325331, 0.008097728, 0.72915924, 0.92693573),
    vec4(0.8262943, -1.9418, -3.6207952, -1.0491166)
  ) * buf[0] + vec4(1.7461591, 0.5491239, 0.8912326, -0.5936028);
  buf[1] = sigmoid(buf[1]);

  buf[2] = mat4(
    vec4(-0.029888863, -0.77436644, 0.65792465, -0.4686315),
    vec4(-0.15579931, 0.3621302, -0.3082951, -0.56832933),
    vec4(0.86407495, 0.37903503, 0.32389298, 0.2536851),
    vec4(-0.92178375, 0.8078376, -1.2261697, -1.0167812)
  ) * buf[1] + vec4(0.0, 0.0, 0.0, 0.0);
  buf[2] = sin(buf[2]);

  buf[3] = mat4(
    vec4(0.70685256, -0.02867091, -0.7199096, 0.47266704),
    vec4(-0.77632165, -0.44209537, -0.082629755, -0.9152625),
    vec4(0.35866624, -0.04739556, 0.44098064, 0.41033334),
    vec4(-0.3073994, 0.35131097, 0.18301772, 0.33327252)
  ) * buf[2] + vec4(0.0, 0.0, 0.0, 0.0);
  buf[3] = sigmoid(buf[3]);

  buf[4] = mat4(
    vec4(0.0, 0.0, 0.0, 0.0),
    vec4(0.0, 0.0, 0.0, 0.0),
    vec4(0.0, 0.0, 0.0, 0.0),
    vec4(-1.0, -1.0, -1.0, 1.0)
  ) * buf[1] + mat4(
    vec4(0.0, 0.0, 0.0, 0.0),
    vec4(0.0, 0.0, 0.0, 0.0),
    vec4(0.0, 0.0, 0.0, 0.0),
    vec4(-0.15628055, 0.117261104, 0.35813412, -0.15628055)
  ) * buf[2] + mat4(
    vec4(-0.19152942, -0.029785605, 0.1932728, 0.5571667),
    vec4(-0.5469188, -0.42406455, 0.04880728, -0.048413567),
    vec4(0.1772896, 0.37556326, -0.44227257, 0.11892656),
    vec4(0.44066605, 0.11490389, -0.060232334, 0.10024506)
  ) * buf[3] + vec4(-1.8094354, -0.9688591, 0.90606785, 1.7152925);
  buf[4] = sigmoid(buf[4]);

  return buf[4];
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;

  // Apply warp effect
  float warpAmount = uWarp * 0.1;
  uv.x += sin(uv.y * 10.0 + iTime * 0.5) * warpAmount;
  uv.y += cos(uv.x * 10.0 + iTime * 0.3) * warpAmount;

  vec2 coord = (uv * 2.0 - 1.0) * vec2(aspect, 1.0);

  float t = iTime * 0.1;
  vec4 result = cppn_fn(coord, sin(t), cos(t * 0.7), sin(t * 0.3));

  vec3 col = result.rgb;

  // Apply hue shift for aurora effect
  col = hueShiftRGB(col, uHueShift);

  // Add noise
  float noiseVal = rand(uv + iTime * 0.01) * uNoise;
  col += noiseVal;

  // Add scan lines
  float scan = sin(uv.y * uResolution.y * uScanFreq + iTime * 2.0) * uScan * 0.1;
  col += scan;

  // Vignette effect
  float vignette = 1.0 - length(uv - 0.5) * 0.8;
  col *= vignette;

  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Mount the Dark Veil effect into a container element
 * Returns a cleanup function to dispose of resources
 */
export function mountDarkVeil(
  container: HTMLElement,
  config: DarkVeilConfig = {}
): () => void {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {};
  }

  const {
    hueShift = 120,  // Green/teal shift for Midnight Evergreen aurora
    noise = 0.08,
    scan = 0.15,
    scanFreq = 3.0,
    warp = 0.2,
  } = config;

  const renderer = new Renderer({
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  });

  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const canvas = gl.canvas as HTMLCanvasElement;
  canvas.className = 'darkveil-canvas';
  container.appendChild(canvas);

  const resolution = new Vec2(container.offsetWidth, container.offsetHeight);

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uResolution: { value: resolution },
      uTime: { value: 0 },
      uHueShift: { value: hueShift },
      uNoise: { value: noise },
      uScan: { value: scan },
      uScanFreq: { value: scanFreq },
      uWarp: { value: warp },
    },
  });

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  let animationId: number;
  let isDisposed = false;

  function resize() {
    if (isDisposed) return;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    renderer.setSize(width, height);
    resolution.set(width, height);
  }

  function animate(time: number) {
    if (isDisposed) return;
    program.uniforms.uTime.value = time * 0.001;
    renderer.render({ scene: mesh });
    animationId = requestAnimationFrame(animate);
  }

  // Initial setup
  resize();
  animationId = requestAnimationFrame(animate);

  // Handle resize
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // Return cleanup function
  return () => {
    isDisposed = true;
    cancelAnimationFrame(animationId);
    resizeObserver.disconnect();
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
