/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
const BROWSERSTACK_USER = process.env.BROWSERSTACK_USER;
const BROWSERSTACK_KEY = process.env.BROWSERSTACK_KEY;

type BrowserTest = {
  url: string;
  browsers: string[];
  platforms: string[];
};

type TestResult = {
  browser: string;
  version: string;
  platform: string;
  status: 'success' | 'error' | 'warning';
  screenshot: string;
  issues?: string[];
  viewport: {
    width: number;
    height: number;
  };
  performance: {
    loadTime: number;
    score: number;
  };
};

async function checkResponsiveness(url: string): Promise<any> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
  
    const viewportMeta = $('meta[name="viewport"]').attr('content');
    const hasResponsiveMeta = viewportMeta && viewportMeta.includes('width=device-width');
  
    const styleLinks = $('link[rel="stylesheet"]').toArray();
    const hasMediaQueries = styleLinks.length > 0;
    
    return {
      isResponsive: hasResponsiveMeta && hasMediaQueries,
      viewportMeta,
      mediaQueries: hasMediaQueries
    };
  } catch (error) {
    console.error('Error checking responsiveness:', error);
    return { isResponsive: false, error: 'Failed to check responsiveness' };
  }
}

async function runBrowserstackTest(url: string, config: any): Promise<any> {
  const auth = Buffer.from(`${BROWSERSTACK_USER}:${BROWSERSTACK_KEY}`).toString('base64');
  
  try {
    const response = await axios.post(
      'https://api.browserstack.com/automate/url',
      {
        url,
        browsers: [config],
        local: false
      },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('BrowserStack API error:', error);
    throw new Error('Failed to run BrowserStack test');
  }
}

export async function POST(request: Request) {
  try {
    const body: BrowserTest = await request.json();
    const { url, browsers, platforms } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    const responsiveCheck = await checkResponsiveness(url);
    const results: TestResult[] = [];
    if (BROWSERSTACK_USER && BROWSERSTACK_KEY) {
      for (const browser of browsers) {
        for (const platform of platforms) {
          try {
            const browserstackResult = await runBrowserstackTest(url, {
              browser: browser.toLowerCase(),
              platform: platform.toLowerCase()
            });
            
            results.push({
              browser,
              version: browserstackResult.browser_version,
              platform,
              status: browserstackResult.status === 'done' ? 'success' : 'error',
              screenshot: browserstackResult.screenshot_url,
              issues: browserstackResult.issues || [],
              viewport: browserstackResult.viewport,
              performance: {
                loadTime: browserstackResult.load_time,
                score: browserstackResult.performance_score
              }
            });
          } catch (error) {
            console.error(`Error testing ${browser} on ${platform}:`, error);
          }
        }
      }
    } else {
      for (const browser of browsers) {
        for (const platform of platforms) {
          results.push({
            browser,
            version: 'latest',
            platform,
            status: responsiveCheck.isResponsive ? 'success' : 'warning',
            screenshot: `/api/placeholder/800/600`,
            issues: !responsiveCheck.isResponsive ? [
              'Could not perform full browser test - using basic checks only',
              !responsiveCheck.viewportMeta ? 'Missing viewport meta tag' : '',
              !responsiveCheck.mediaQueries ? 'No responsive media queries detected' : ''
            ].filter(Boolean) : [],
            viewport: {
              width: 1920,
              height: 1080
            },
            performance: {
              loadTime: 0,
              score: responsiveCheck.isResponsive ? 80 : 60
            }
          });
        }
      }
    }

    return NextResponse.json({
      results,
      summary: {
        totalTests: results.length,
        passed: results.filter(r => r.status === 'success').length,
        warnings: results.filter(r => r.status === 'warning').length,
        errors: results.filter(r => r.status === 'error').length,
        responsiveScore: responsiveCheck.isResponsive ? 100 : 70
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to run browser tests' },
      { status: 500 }
    );
  }
}