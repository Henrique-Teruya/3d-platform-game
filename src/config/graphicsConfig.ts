export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GraphicsPreset {
  quality: GraphicsQuality;
  maxDpr: number;
  shadowMapSize: number;
  shadowDistance: number;
  shadowsEnabled: boolean;
  antialias: boolean;
  fogMultiplier: number;
  exposure: number;
}

export const GRAPHICS_PRESETS: Record<GraphicsQuality, GraphicsPreset> = {
  low: {
    quality: 'low',
    maxDpr: 1.0,
    shadowMapSize: 1024,
    shadowDistance: 45,
    shadowsEnabled: false,
    antialias: false,
    fogMultiplier: 1.15,
    exposure: 1.08,
  },
  medium: {
    quality: 'medium',
    maxDpr: 1.5,
    shadowMapSize: 1024,
    shadowDistance: 65,
    shadowsEnabled: true,
    antialias: true,
    fogMultiplier: 1.0,
    exposure: 1.08,
  },
  high: {
    quality: 'high',
    maxDpr: 2.0,
    shadowMapSize: 2048,
    shadowDistance: 90,
    shadowsEnabled: true,
    antialias: true,
    fogMultiplier: 0.95,
    exposure: 1.1,
  },
};
