import { createCanvas, loadImage, type Canvas } from 'canvas';
import { 
  type ColorAnalysisResult, 
  type Color, 
  type RGB, 
  type RGBTuple, 
  type LABColor,
  ColorNames
} from '@/types/color';

type NodeCanvasImageData = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

export class ColorAnalyzer {
  private static readonly DEFAULT_OPTIONS = {
    maxColors: 5,
    quality: 10,
    maxIterations: 20
  };

  private static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b]
      .map(x => Math.round(x).toString(16).padStart(2, '0'))
      .join('');
  }

  private static async setupCanvas(buffer: Buffer): Promise<[Canvas, NodeCanvasImageData]> {
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return [canvas, imageData];
  }

  private static getPixelArray(imageData: Uint8ClampedArray): number[][] {
    const pixels: number[][] = [];
    for (let i = 0; i < imageData.length; i += 4) {
      pixels.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
    }
    return pixels;
  }
  private static quantizeColors(pixels: number[][], maxColors: number): number[][] {
    let centroids = pixels.slice(0, maxColors);
    const iterations = this.DEFAULT_OPTIONS.maxIterations;

    for (let i = 0; i < iterations; i++) {
      const clusters: number[][][] = Array(maxColors).fill(0).map(() => []);
      
      pixels.forEach(pixel => {
        let minDistance = Infinity;
        let closestCentroidIndex = 0;

        centroids.forEach((centroid, index) => {
          const distance = this.getColorDistance(
            pixel as RGBTuple,
            centroid as RGBTuple
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestCentroidIndex = index;
          }
        });

        clusters[closestCentroidIndex].push(pixel);
      });

      centroids = clusters.map(cluster => {
        if (cluster.length === 0) return [0, 0, 0];
        const sum = cluster.reduce((acc, pixel) => [
          acc[0] + pixel[0],
          acc[1] + pixel[1],
          acc[2] + pixel[2]
        ]);
        return [
          Math.round(sum[0] / cluster.length),
          Math.round(sum[1] / cluster.length),
          Math.round(sum[2] / cluster.length)
        ];
      });
    }

    return centroids;
  }

  private static rgbToLab(r: number, g: number, b: number): LABColor {
    let rr = r / 255;
    let gg = g / 255;
    let bb = b / 255;

    rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
    gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
    bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;

    const x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) * 100;
    const y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) * 100;
    const z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) * 100;

    return this.xyzToLab(x, y, z);
  }

  private static xyzToLab(x: number, y: number, z: number): LABColor {
    const xn = 95.047;
    const yn = 100.000;
    const zn = 108.883;

    const l = 116 * this.labF(y / yn) - 16;
    const a = 500 * (this.labF(x / xn) - this.labF(y / yn));
    const b = 200 * (this.labF(y / yn) - this.labF(z / zn));

    return [l, a, b];
  }

  private static labF(t: number): number {
    return t > Math.pow(6 / 29, 3)
      ? Math.pow(t, 1 / 3)
      : (1 / 3) * Math.pow(29 / 6, 2) * t + 4 / 29;
  }

  private static getColorDistance(color1: RGBTuple, color2: RGBTuple): number {
    const [r1, g1, b1] = color1;
    const [r2, g2, b2] = color2;
    
    const [l1, a1, b1Lab] = this.rgbToLab(r1, g1, b1);
    const [l2, a2, b2Lab] = this.rgbToLab(r2, g2, b2);
    
    return Math.sqrt(
      Math.pow(l2 - l1, 2) +
      Math.pow(a2 - a1, 2) +
      Math.pow(b2Lab - b1Lab, 2)
    );
  }

  private static getColorName(rgb: RGB): string {
    let closestColorName = '';
    let minDistance = Infinity;

    Object.entries(ColorNames).forEach(([name, value]) => {
      const distance = this.getColorDistance(
        [rgb.r, rgb.g, rgb.b],
        value
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestColorName = name;
      }
    });

    return closestColorName;
  }

  private static lightenColor(rgb: RGB, amount: number = 0.2): string {
    return this.rgbToHex(
      Math.min(255, Math.round(rgb.r * (1 + amount))),
      Math.min(255, Math.round(rgb.g * (1 + amount))),
      Math.min(255, Math.round(rgb.b * (1 + amount)))
    );
  }

  private static darkenColor(rgb: RGB, amount: number = 0.2): string {
    return this.rgbToHex(
      Math.round(rgb.r * (1 - amount)),
      Math.round(rgb.g * (1 - amount)),
      Math.round(rgb.b * (1 - amount))
    );
  }

  private static convertToColor(rgb: number[]): Color {
    const [r, g, b] = rgb;
    const rgbObj = { r, g, b };
    const hex = this.rgbToHex(r, g, b);
    const name = this.getColorName(rgbObj);

    return {
      hex,
      rgb: rgbObj,
      name
    };
  }

  private static adjustColorForBackground(color: Color): Color {
    const { r, g, b } = color.rgb;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    if (brightness > 128) {
      const darkFactor = 0.15;
      const newRgb = {
        r: Math.round(r * (1 - darkFactor)),
        g: Math.round(g * (1 - darkFactor)),
        b: Math.round(b * (1 - darkFactor))
      };
      return {
        ...color,
        rgb: newRgb,
        hex: this.rgbToHex(newRgb.r, newRgb.g, newRgb.b)
      };
    }
    return color;
  }

  private static adjustColorForText(color: Color): Color {
    const { r, g, b } = color.rgb;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    if (brightness < 128) {
      const lightFactor = 0.9;
      const newRgb = {
        r: Math.round(r + (255 - r) * lightFactor),
        g: Math.round(g + (255 - g) * lightFactor),
        b: Math.round(b + (255 - b) * lightFactor)
      };
      return {
        ...color,
        rgb: newRgb,
        hex: this.rgbToHex(newRgb.r, newRgb.g, newRgb.b)
      };
    }
    return color;
  }

  private static generateTailwindConfig(colors: Color[]): string {
    return `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${colors[0].hex}',
          light: '${this.lightenColor(colors[0].rgb)}',
          dark: '${this.darkenColor(colors[0].rgb)}'
        },
        secondary: {
          DEFAULT: '${colors[1].hex}',
          light: '${this.lightenColor(colors[1].rgb)}',
          dark: '${this.darkenColor(colors[1].rgb)}'
        },
        accent: {
          DEFAULT: '${colors[2].hex}',
          light: '${this.lightenColor(colors[2].rgb)}',
          dark: '${this.darkenColor(colors[2].rgb)}'
        },
        background: {
          DEFAULT: '${colors[3].hex}',
          darker: '${this.darkenColor(colors[3].rgb)}',
          lighter: '${this.lightenColor(colors[3].rgb)}'
        },
        content: {
          DEFAULT: '${colors[4].hex}',
          muted: '${this.adjustColorForText(colors[4]).hex}'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, ${colors[0].hex}, ${colors[1].hex})',
        'gradient-accent': 'linear-gradient(to right, ${colors[2].hex}, ${colors[1].hex})'
      }
    }
  }
}`;
  }

  private static generateCSSVariables(colors: Color[]): string {
    return `:root {
  /* Base colors */
  --color-primary: ${colors[0].hex};
  --color-primary-light: ${this.lightenColor(colors[0].rgb)};
  --color-primary-dark: ${this.darkenColor(colors[0].rgb)};
  
  --color-secondary: ${colors[1].hex};
  --color-secondary-light: ${this.lightenColor(colors[1].rgb)};
  --color-secondary-dark: ${this.darkenColor(colors[1].rgb)};
  
  --color-accent: ${colors[2].hex};
  --color-accent-light: ${this.lightenColor(colors[2].rgb)};
  --color-accent-dark: ${this.darkenColor(colors[2].rgb)};
  
  --color-background: ${colors[3].hex};
  --color-background-darker: ${this.darkenColor(colors[3].rgb)};
  --color-background-lighter: ${this.lightenColor(colors[3].rgb)};
  
  --color-content: ${colors[4].hex};
  --color-content-muted: ${this.adjustColorForText(colors[4]).hex};

  /* Gradients */
  --gradient-primary: linear-gradient(to right, var(--color-primary), var(--color-secondary));
  --gradient-accent: linear-gradient(to right, var(--color-accent), var(--color-secondary));

  /* Component variables */
  --color-button-primary: var(--gradient-primary);
  --color-button-secondary: var(--gradient-accent);
  --color-card-background: var(--color-background-darker);
  --color-card-border: var(--color-background-lighter);
  --color-text-primary: var(--color-content);
  --color-text-muted: var(--color-content-muted);
}`;
  }

  public static async analyzeImage(buffer: Buffer): Promise<ColorAnalysisResult> {
    const [, imageData] = await this.setupCanvas(buffer);
    const pixels = this.getPixelArray(imageData.data);
    const dominantColors = this.quantizeColors(pixels, 5);
    const colors = dominantColors.map(this.convertToColor.bind(this));

    const colorScheme = {
      palette: {
        primary: {
          ...colors[0],
          usage: 'Primary brand color, gradient starts'
        },
        secondary: {
          ...colors[1],
          usage: 'Secondary color, gradient ends'
        },
        accent: {
          ...colors[2],
          usage: 'Accents and highlights'
        },
        background: {
          ...this.adjustColorForBackground(colors[3]),
          usage: 'Page and card backgrounds'
        },
        text: {
          ...this.adjustColorForText(colors[4]),
          usage: 'Typography and content'
        }
      },
      tailwindConfig: this.generateTailwindConfig(colors),
      cssVariables: this.generateCSSVariables(colors)
    };

    return colorScheme;
  }
}

export default ColorAnalyzer;
