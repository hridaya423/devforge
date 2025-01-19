/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import type { Endpoint, EndpointResponse, HealthCheckResponse } from '@/types/monitor';
async function checkEndpoint(url: string): Promise<{
  status: 'up' | 'down';
  responseTime: number | null;
  statusCode: number | null;
  error?: string;
  timestamp: string;
}> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    
    return {
      status: response.ok ? 'up' : 'down',
      responseTime: endTime - startTime,
      statusCode: response.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      status: 'down',
      responseTime: null,
      statusCode: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const endpointsParam = searchParams.get('endpoints');
    
    if (!endpointsParam) {
      return NextResponse.json({
        success: false,
        error: 'No endpoints provided'
      } as HealthCheckResponse, { status: 400 });
    }

    const endpoints: Endpoint[] = JSON.parse(endpointsParam);

    if (!Array.isArray(endpoints)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid endpoints format'
      } as HealthCheckResponse, { status: 400 });
    }

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        const health = await checkEndpoint(endpoint.url);
        return {
          ...endpoint,
          ...health,
          lastChecked: health.timestamp
        };
      })
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    } as HealthCheckResponse);
  } catch (error) {
    console.error('Error in GET /api/monitor:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as HealthCheckResponse, { status: 500 });
  }
}
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { url, name } = body;

    if (!url || !name) {
      return NextResponse.json({
        success: false,
        error: 'URL and name are required'
      } as EndpointResponse, { status: 400 });
    }
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format'
      } as EndpointResponse, { status: 400 });
    }
    const health = await checkEndpoint(url);

    const newEndpoint: Endpoint = {
      id: Date.now(),
      url,
      name,
      status: health.status,
      responseTime: health.responseTime ?? undefined,
      statusCode: health.statusCode ?? undefined,
      error: health.error,
      lastChecked: health.timestamp
    };

    return NextResponse.json({
      success: true,
      endpoint: newEndpoint
    } as EndpointResponse);
  } catch (error) {
    console.error('Error in POST /api/monitor:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as EndpointResponse, { status: 500 });
  }
}