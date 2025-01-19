import { createServerClien } from '@/lib/supabase/server';
import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface Props {
  params: {
    id: string;
  };
}

export async function GET(
  _request: NextRequest,
  props: Props
) {
  try {
    const supabase = createServerClien();
    
    const { data, error } = await supabase
      .from('resource_reviews')
      .select('*')
      .eq('resource_id', props.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: Props
) {
  try {
    const body = await request.json();
    const supabase = createServerClien();

    const { data, error } = await supabase
      .from('resource_reviews')
      .insert([{
        ...body,
        resource_id: props.params.id
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