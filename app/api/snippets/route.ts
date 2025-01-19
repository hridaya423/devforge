import { createServerClien } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const sort = searchParams.get('sort') || 'votes';

    const supabase = createServerClien();
    
    let query = supabase
      .from('code_snippets')
      .select('*')
      .eq('status', 'approved');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (language && language !== 'all') {
      query = query.eq('language', language);
    }

    if (sort === 'votes') {
      query = query.order('vote_count', { ascending: false });
    } else if (sort === 'recent') {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching snippets:', error);
    return NextResponse.json({ error: 'Failed to fetch snippets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerClien();

    const { data, error } = await supabase
      .from('code_snippets')
      .insert([{ ...body, status: 'pending', vote_count: 0 }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating snippet:', error);
    return NextResponse.json({ error: 'Failed to create snippet' }, { status: 500 });
  }
}