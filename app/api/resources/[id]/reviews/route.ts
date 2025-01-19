/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: { id: string };
}

const mockReviews = [
  {
    id: 1,
    resource_id: "123",
    rating: 5,
    comment: "Great resource!",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    resource_id: "123",
    rating: 4,
    comment: "Very helpful",
    created_at: new Date().toISOString()
  }
];

export const GET = async (
  _req: NextRequest,
  { params }: Params
) => {
  try {
    // Comment out Supabase code for now
    // const supabase = createServerClien();
    // const { data, error } = await supabase
    //   .from('resource_reviews')
    //   .select('*')
    //   .eq('resource_id', params.id)
    //   .order('created_at', { ascending: false });
    return NextResponse.json(mockReviews);
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
    // const supabase = createServerClien();
    // const { data, error } = await supabase
    //   .from('resource_reviews')
    //   .insert([{
    //     ...body,
    //     resource_id: params.id
    //   }])
    //   .select()
    //   .single();

    const mockResponse = {
      id: Date.now(),
      resource_id: params.id,
      ...body,
      created_at: new Date().toISOString()
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
