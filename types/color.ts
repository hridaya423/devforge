export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type RGBTuple = [number, number, number];

export type LABColor = [number, number, number];

export type Color = {
  hex: string;
  rgb: RGB;
  name: string;
  usage?: string;
};

export type ColorPalette = {
  primary: Color;
  secondary: Color;
  accent: Color;
  background: Color;
  text: Color;
};

export type ColorAnalysisResult = {
  palette: ColorPalette;
  tailwindConfig: string;
  cssVariables: string;
};

export type TabType = 'palette' | 'tailwind' | 'css';

export type CopiedStates = {
  [key: string]: boolean;
};

export type AcceptedFileType = 'image/jpeg' | 'image/png' | 'image/webp';

export const FILE_TYPES: AcceptedFileType[] = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

export const ColorKeys = ['primary', 'secondary', 'accent', 'background', 'text'] as const;

export type ColorKey = typeof ColorKeys[number];

export const ColorNames: Record<string, RGBTuple> = {
  'Red': [255, 0, 0],
  'Green': [0, 255, 0],
  'Blue': [0, 0, 255],
  'Yellow': [255, 255, 0],
  'Cyan': [0, 255, 255],
  'Magenta': [255, 0, 255],
  'White': [255, 255, 255],
  'Black': [0, 0, 0],
  'Gray': [128, 128, 128],
  'Orange': [255, 165, 0],
  'Purple': [128, 0, 128],
  'Brown': [165, 42, 42],
  'Pink': [255, 192, 203],
  'Navy': [0, 0, 128],
  'Teal': [0, 128, 128],
  'Maroon': [128, 0, 0],
  'Olive': [128, 128, 0],
  'Silver': [192, 192, 192],
  'Gold': [255, 215, 0],
  'Indigo': [75, 0, 130],
  'Violet': [238, 130, 238],
  'Beige': [245, 245, 220],
  'Coral': [255, 127, 80],
  'Crimson': [220, 20, 60]
};