import { type NextRequest, NextResponse } from 'next/server';
import { ColorAnalyzer } from '@/utils/colorAnalyzer';
import { type ColorAnalysisResult } from '@/types/color';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest): Promise<NextResponse<ColorAnalysisResult | { error: string }>> {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPG, PNG, or WebP image' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const colorScheme = await ColorAnalyzer.analyzeImage(buffer);

    return NextResponse.json(colorScheme);
  } catch (error) {
    console.error('Color analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image colors' },
      { status: 500 }
    );
  }
}