import { createServerClien } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerClien();
    
    const { data, error } = await supabase
      .from('code_snippets')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching pending snippets:', error);
    return NextResponse.json({ error: 'Failed to fetch pending snippets' }, { status: 500 });
  }
}