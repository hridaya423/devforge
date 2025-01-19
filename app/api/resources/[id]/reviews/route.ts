import { createServerClien } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: { id: string };
}

export const GET = async (
  _req: NextRequest,
  { params }: Params
) => {
  try {
    const supabase = createServerClien();
    
    const { data, error } = await supabase
      .from('resource_reviews')
      .select('*')
      .eq('resource_id', params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export const POST = async (
  request: NextRequest,
  { params }: Params
) => {
  try {
    const body = await request.json();
    const supabase = createServerClien();

    const { data, error } = await supabase
      .from('resource_reviews')
      .insert([{
        ...body,
        resource_id: params.id
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
