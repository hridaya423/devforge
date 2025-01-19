import { createServerClien } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

type Props = {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function GET(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
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
): Promise<NextResponse> {
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
