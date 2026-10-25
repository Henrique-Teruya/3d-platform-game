import * as THREE from 'three';
import type { GraphicsPreset } from '../../config/graphicsConfig';
import type { BiomePalette } from './MaterialLibrary';

const SKY_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const SKY_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uTopColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uBottomColor;
  uniform vec3 uSunColor;
  uniform vec3 uSunDirection;
  varying vec3 vWorldPosition;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float y = dir.y;

    // Smooth vertical sky gradient
    vec3 skyColor;
    if (y >= 0.0) {
      float t = pow(y, 0.55);
      skyColor = mix(uHorizonColor, uTopColor, t);
    } else {
      float t = pow( clamp(-y, 0.0, 1.0), 0.6 );
      skyColor = mix(uHorizonColor, uBottomColor, t);
    }

    // Subtle horizon glow band
    float horizonGlow = exp(-abs(y) * 9.0);
    skyColor += uSunColor * horizonGlow * 0.14;

    // Solar disc & corona
    vec3 sunDir = normalize(uSunDirection);
    float sunDot = max(0.0, dot(dir, sunDir));
    float sunCorona = pow(sunDot, 24.0) * 0.35;
    float sunDisc = smoothstep(0.9965, 0.9988, sunDot) * 1.1;
    skyColor += uSunColor * (sunCorona + sunDisc);

    gl_FragColor = vec4(skyColor, 1.0);
  }
`;

export class SkyAndAtmosphere {
  public readonly group = new THREE.Group();
  public readonly sunLight: THREE.DirectionalLight;
  public readonly hemiLight: THREE.HemisphereLight;
  public readonly skyMesh: THREE.Mesh;
  public readonly fog: THREE.FogExp2;

  private readonly skyUniforms: {
    uTopColor: { value: THREE.Color };
    uHorizonColor: { value: THREE.Color };
    uBottomColor: { value: THREE.Color };
    uSunColor: { value: THREE.Color };
    uSunDirection: { value: THREE.Vector3 };
  };

  private readonly sunOffset = new THREE.Vector3(95, 130, -85);

  constructor(palette: BiomePalette, preset: GraphicsPreset) {
    this.fog = new THREE.FogExp2(palette.fogColor, palette.fogDensity * preset.fogMultiplier);

    this.hemiLight = new THREE.HemisphereLight(palette.hemiSky, palette.hemiGround, 0.85);
    this.group.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(palette.sunColor, 2.2);
    this.sunOffset.set(...palette.sunDirection);
    this.sunLight.position.copy(this.sunOffset);
    this.sunLight.castShadow = preset.shadowsEnabled;
    this.sunLight.shadow.mapSize.set(preset.shadowMapSize, preset.shadowMapSize);
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 340;
    const d = preset.shadowDistance;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.group.add(this.sunLight);
    this.group.add(this.sunLight.target);

    this.skyUniforms = {
      uTopColor: { value: new THREE.Color(palette.skyTop) },
      uHorizonColor: { value: new THREE.Color(palette.skyHorizon) },
      uBottomColor: { value: new THREE.Color(palette.skyBottom) },
      uSunColor: { value: new THREE.Color(palette.sunColor) },
      uSunDirection: { value: this.sunOffset.clone().normalize() },
    };

    const skyGeo = new THREE.SphereGeometry(720, 32, 20);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERTEX_SHADER,
      fragmentShader: SKY_FRAGMENT_SHADER,
      uniforms: this.skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.group.add(this.skyMesh);
  }

  public applyPalette(palette: BiomePalette, preset: GraphicsPreset): void {
    this.fog.color.set(palette.fogColor);
    this.fog.density = palette.fogDensity * preset.fogMultiplier;

    this.hemiLight.color.set(palette.hemiSky);
    this.hemiLight.groundColor.set(palette.hemiGround);

    this.sunLight.color.set(palette.sunColor);
    this.sunOffset.set(...palette.sunDirection);

    this.skyUniforms.uTopColor.value.set(palette.skyTop);
    this.skyUniforms.uHorizonColor.value.set(palette.skyHorizon);
    this.skyUniforms.uBottomColor.value.set(palette.skyBottom);
    this.skyUniforms.uSunColor.value.set(palette.sunColor);
    this.skyUniforms.uSunDirection.value.copy(this.sunOffset).normalize();
  }

  public applyGraphicsPreset(preset: GraphicsPreset, palette: BiomePalette): void {
    this.fog.density = palette.fogDensity * preset.fogMultiplier;
    this.sunLight.castShadow = preset.shadowsEnabled;
    const d = preset.shadowDistance;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.camera.updateProjectionMatrix();

    if (
      this.sunLight.shadow.mapSize.width !== preset.shadowMapSize ||
      this.sunLight.shadow.mapSize.height !== preset.shadowMapSize
    ) {
      this.sunLight.shadow.mapSize.set(preset.shadowMapSize, preset.shadowMapSize);
      this.sunLight.shadow.map?.dispose();
      this.sunLight.shadow.map = null;
    }
  }

  /**
   * Centers the sky dome and directional shadow frustum on the player position.
   * Quantizes shadow target to 2-meter grid steps to prevent shadow edge shimmering.
   */
  public followPlayer(playerPos: THREE.Vector3): void {
    this.skyMesh.position.copy(playerPos);

    const snapX = Math.round(playerPos.x / 2) * 2;
    const snapY = Math.round(playerPos.y / 2) * 2;
    const snapZ = Math.round(playerPos.z / 2) * 2;

    this.sunLight.target.position.set(snapX, snapY, snapZ);
    this.sunLight.position.set(
      snapX + this.sunOffset.x,
      snapY + this.sunOffset.y,
      snapZ + this.sunOffset.z,
    );
  }

  public dispose(): void {
    this.skyMesh.geometry.dispose();
    (this.skyMesh.material as THREE.Material).dispose();
    this.sunLight.shadow.map?.dispose();
  }
}
