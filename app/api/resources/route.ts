/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClien } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'rating';

    const supabase = createServerClien();
    let query = supabase
      .from('dev_resources')
      .select(`
        *,
        resource_reviews (
          rating
        )
      `)
      .eq('status', 'approved');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    const processedData = data.map(resource => ({
      ...resource,
      average_rating: resource.resource_reviews.length > 0 
        ? resource.resource_reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / resource.resource_reviews.length 
        : 0,
      review_count: resource.resource_reviews.length,
      resource_reviews: undefined
    }));

    if (sort === 'rating') {
      processedData.sort((a, b) => b.average_rating - a.average_rating);
    } else if (sort === 'recent') {
      processedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerClien();

    const { data, error } = await supabase
      .from('dev_resources')
      .insert([{ 
        ...body, 
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}