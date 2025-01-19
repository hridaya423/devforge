/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
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

  return NextResponse.json(mockReviews);
}

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json();

    const mockResponse = {
      id: Date.now(),
      resource_id: params.id,
      ...body,
      created_at: new Date().toISOString()
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
