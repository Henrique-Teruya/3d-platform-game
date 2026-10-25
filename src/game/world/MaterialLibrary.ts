import * as THREE from 'three';

export interface BiomePalette {
  name: string;
  skyTop: string;
  skyHorizon: string;
  skyBottom: string;
  sunColor: string;
  sunDirection: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  fogColor: string;
  fogDensity: number;
  primaryConcrete: string;
  secondaryConcrete: string;
  darkTrim: string;
  accentColor: string;
  wallRunColor: string;
  slideRampColor: string;
}

export const BIOME_PALETTES: Record<'awakening' | 'monoliths' | 'ascension', BiomePalette> = {
  awakening: {
    name: 'Limestone Dawn',
    skyTop: '#243B55',
    skyHorizon: '#E8C59E',
    skyBottom: '#8C7A6B',
    sunColor: '#FFF2DC',
    sunDirection: [95, 130, -85],
    hemiSky: '#DCE6F2',
    hemiGround: '#6B6057',
    fogColor: '#DFC3A4',
    fogDensity: 0.0024,
    primaryConcrete: '#D8D2C7',
    secondaryConcrete: '#A8A096',
    darkTrim: '#33363B',
    accentColor: '#E08E45',
    wallRunColor: '#2B3440',
    slideRampColor: '#C47D3E',
  },
  monoliths: {
    name: 'Basalt & Sand Meridian',
    skyTop: '#1A2634',
    skyHorizon: '#D4B483',
    skyBottom: '#4A3F35',
    sunColor: '#FFE8B8',
    sunDirection: [-110, 145, -70],
    hemiSky: '#C8D6E5',
    hemiGround: '#594E42',
    fogColor: '#C9AE86',
    fogDensity: 0.0026,
    primaryConcrete: '#C7BBA8',
    secondaryConcrete: '#5E646B',
    darkTrim: '#1E2226',
    accentColor: '#38B2AC',
    wallRunColor: '#222831',
    slideRampColor: '#D07A32',
  },
  ascension: {
    name: 'Violet Ecliptic Dusk',
    skyTop: '#141124',
    skyHorizon: '#E07A5F',
    skyBottom: '#1F1A30',
    sunColor: '#FFB085',
    sunDirection: [75, 95, -140],
    hemiSky: '#9A8C98',
    hemiGround: '#2B253A',
    fogColor: '#6B526B',
    fogDensity: 0.0025,
    primaryConcrete: '#B8B2C2',
    secondaryConcrete: '#4A4458',
    darkTrim: '#191724',
    accentColor: '#F4A261',
    wallRunColor: '#231F32',
    slideRampColor: '#E76F51',
  },
};

export class MaterialLibrary {
  public readonly concretePrimary: THREE.MeshStandardMaterial;
  public readonly concreteSecondary: THREE.MeshStandardMaterial;
  public readonly trimDark: THREE.MeshStandardMaterial;
  public readonly wallRunSurface: THREE.MeshStandardMaterial;
  public readonly slideRampSurface: THREE.MeshStandardMaterial;
  public readonly movingPlatformSurface: THREE.MeshStandardMaterial;
  public readonly monolithDistant: THREE.MeshStandardMaterial;
  public readonly guideInlay: THREE.MeshStandardMaterial;
  public readonly checkpointInactive: THREE.MeshStandardMaterial;
  public readonly checkpointActive: THREE.MeshStandardMaterial;
  public readonly portalEmissive: THREE.MeshStandardMaterial;
  public readonly gauntletArmor: THREE.MeshStandardMaterial;
  public readonly gauntletTrim: THREE.MeshStandardMaterial;

  private readonly textures: THREE.Texture[] = [];
  private readonly materials: THREE.Material[] = [];

  constructor(palette: BiomePalette) {
    const concreteTex = this.createConcretePanelTexture('#FFFFFF', '#D2D0CC', '#9E9B95');
    const wallRunTex = this.createWallRunGripTexture();
    const slideTex = this.createSlideChevronTexture();

    this.concretePrimary = new THREE.MeshStandardMaterial({
      color: palette.primaryConcrete,
      map: concreteTex,
      bumpMap: concreteTex,
      bumpScale: 0.04,
      roughness: 0.82,
      metalness: 0.04,
    });

    this.concreteSecondary = new THREE.MeshStandardMaterial({
      color: palette.secondaryConcrete,
      map: concreteTex,
      bumpMap: concreteTex,
      bumpScale: 0.05,
      roughness: 0.78,
      metalness: 0.08,
    });

    this.trimDark = new THREE.MeshStandardMaterial({
      color: palette.darkTrim,
      roughness: 0.55,
      metalness: 0.25,
    });

    this.wallRunSurface = new THREE.MeshStandardMaterial({
      color: palette.wallRunColor,
      map: wallRunTex,
      bumpMap: wallRunTex,
      bumpScale: 0.08,
      roughness: 0.45,
      metalness: 0.18,
    });

    this.slideRampSurface = new THREE.MeshStandardMaterial({
      color: palette.slideRampColor,
      map: slideTex,
      roughness: 0.36,
      metalness: 0.12,
    });

    this.movingPlatformSurface = new THREE.MeshStandardMaterial({
      color: '#3B424C',
      map: concreteTex,
      roughness: 0.42,
      metalness: 0.45,
    });

    this.monolithDistant = new THREE.MeshStandardMaterial({
      color: palette.secondaryConcrete,
      map: concreteTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.guideInlay = new THREE.MeshStandardMaterial({
      color: palette.accentColor,
      emissive: palette.accentColor,
      emissiveIntensity: 0.35,
      roughness: 0.4,
      metalness: 0.2,
    });

    this.checkpointInactive = new THREE.MeshStandardMaterial({
      color: '#E09F3E',
      emissive: '#E09F3E',
      emissiveIntensity: 0.65,
      roughness: 0.3,
      metalness: 0.2,
    });

    this.checkpointActive = new THREE.MeshStandardMaterial({
      color: '#4ECDC4',
      emissive: '#4ECDC4',
      emissiveIntensity: 1.2,
      roughness: 0.25,
      metalness: 0.3,
    });

    this.portalEmissive = new THREE.MeshStandardMaterial({
      color: '#FFF3B0',
      emissive: palette.accentColor,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.1,
    });

    this.gauntletArmor = new THREE.MeshStandardMaterial({
      color: '#2B2D34',
      roughness: 0.4,
      metalness: 0.35,
    });

    this.gauntletTrim = new THREE.MeshStandardMaterial({
      color: palette.accentColor,
      emissive: palette.accentColor,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.2,
    });

    this.materials.push(
      this.concretePrimary,
      this.concreteSecondary,
      this.trimDark,
      this.wallRunSurface,
      this.slideRampSurface,
      this.movingPlatformSurface,
      this.monolithDistant,
      this.guideInlay,
      this.checkpointInactive,
      this.checkpointActive,
      this.portalEmissive,
      this.gauntletArmor,
      this.gauntletTrim,
    );
  }

  public applyPalette(palette: BiomePalette): void {
    this.concretePrimary.color.set(palette.primaryConcrete);
    this.concreteSecondary.color.set(palette.secondaryConcrete);
    this.trimDark.color.set(palette.darkTrim);
    this.wallRunSurface.color.set(palette.wallRunColor);
    this.slideRampSurface.color.set(palette.slideRampColor);
    this.monolithDistant.color.set(palette.secondaryConcrete);
    this.guideInlay.color.set(palette.accentColor);
    this.guideInlay.emissive.set(palette.accentColor);
    this.portalEmissive.emissive.set(palette.accentColor);
    this.gauntletTrim.color.set(palette.accentColor);
    this.gauntletTrim.emissive.set(palette.accentColor);
  }

  private createConcretePanelTexture(
    baseHex: string,
    lineHex: string,
    tieHoleHex: string,
  ): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, size, size);

    // Subtle architectural cast-concrete grain (deterministic pattern)
    for (let y = 0; y < size; y += 8) {
      for (let x = 0; x < size; x += 8) {
        const hash = ((x * 73856093) ^ (y * 19349663)) & 255;
        const shade = 230 + (hash % 24);
        ctx.fillStyle = `rgb(${shade}, ${shade - 1}, ${shade - 3})`;
        ctx.fillRect(x, y, 8, 8);
      }
    }

    // Formwork panel seams
    ctx.strokeStyle = lineHex;
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, size - 4, size - 4);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.stroke();

    // Tadao Ando style formwork tie-rod holes
    ctx.fillStyle = tieHoleHex;
    const holes = [
      [32, 32],
      [size / 2 - 32, 32],
      [size / 2 + 32, 32],
      [size - 32, 32],
      [32, size / 2 - 32],
      [size / 2 - 32, size / 2 - 32],
      [size / 2 + 32, size / 2 - 32],
      [size - 32, size / 2 - 32],
      [32, size - 32],
      [size / 2 - 32, size - 32],
      [size / 2 + 32, size - 32],
      [size - 32, size - 32],
    ];
    for (const [hx, hy] of holes) {
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(tex);
    return tex;
  }

  private createWallRunGripTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#D0D4DC';
    ctx.fillRect(0, 0, size, size);

    // Horizontal architectural grip channels
    ctx.fillStyle = '#8C96A6';
    for (let y = 12; y < size; y += 24) {
      ctx.fillRect(0, y, size, 8);
    }

    // Diagonal momentum chevrons
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    for (let x = 16; x < size; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, size * 0.35);
      ctx.lineTo(x + 24, size * 0.5);
      ctx.lineTo(x, size * 0.65);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(tex);
    return tex;
  }

  private createSlideChevronTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#D8D4CC';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    for (let y = 32; y < size; y += 64) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(size / 2, y + 36);
      ctx.lineTo(size - 40, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(tex);
    return tex;
  }

  public dispose(): void {
    for (const m of this.materials) m.dispose();
    for (const t of this.textures) t.dispose();
  }
}
