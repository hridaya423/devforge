import { NextResponse } from 'next/server';
import axios from 'axios';

import { load } from 'cheerio';
import * as https from 'https';

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ 
    rejectUnauthorized: false,
    timeout: 30000 
  }),
  headers: {
    'User-Agent': 'SEOAnalyzer/1.0'
  }
});

async function getPageSpeed(url: string) {
  try {
    const API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY;
    const response = await axios.get(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}`
    );
    return {
      score: Math.round(response.data.lighthouseResult.categories.performance.score * 100),
      loadTime: response.data.lighthouseResult.audits['interactive'].displayValue,
      firstContentfulPaint: response.data.lighthouseResult.audits['first-contentful-paint'].displayValue,
    };
  } catch (error) {
    console.error('PageSpeed API error:', error);
    return {
      score: 0,
      loadTime: 'N/A',
      firstContentfulPaint: 'N/A',
    };
  }
}

async function analyzePage(url: string) {
  try {
    const response = await axiosInstance.get(url);
    const html = response.data;
    const $ = load(html);
    const title = $('title').text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
    const headings = {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length,
    };
    const images = {
      total: $('img').length,
      withAlt: $('img[alt]').length,
      withoutAlt: $('img:not([alt])').length,
    };

    const links = {
      internal: $(`a[href^="/"], a[href^="${url}"]`).length,
      external: $('a[href^="http"]').filter((_, el) => !$(el).attr('href')?.startsWith(url)).length,
    };
    const pageSpeedData = await getPageSpeed(url);
    const issues = [];

    if (!title) {
      issues.push({
        type: 'error',
        message: 'Missing page title',
        details: 'Every page should have a unique and descriptive title tag',
      });
    } else if (title.length < 30 || title.length > 60) {
      issues.push({
        type: 'warning',
        message: 'Title length not optimal',
        details: `Current length: ${title.length} characters. Recommended: 30-60 characters`,
      });
    }

    if (!metaDescription) {
      issues.push({
        type: 'error',
        message: 'Missing meta description',
        details: 'Each page should have a unique meta description',
      });
    }

    if (headings.h1 === 0) {
      issues.push({
        type: 'error',
        message: 'Missing H1 heading',
        details: 'Each page should have exactly one H1 heading',
      });
    }

    if (images.withoutAlt > 0) {
      issues.push({
        type: 'warning',
        message: 'Images missing alt text',
        details: `${images.withoutAlt} images found without alt text`,
      });
    }

    return {
      url,
      analyzedAt: new Date().toISOString(),
      title,
      description: metaDescription,
      keywords: metaKeywords.split(',').map(k => k.trim()).filter(Boolean),
      headings,
      images,
      links,
      issues,
      performance: {
        score: pageSpeedData.score,
        loadTime: pageSpeedData.loadTime,
        firstContentfulPaint: pageSpeedData.firstContentfulPaint,
      }
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze website');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const results = await analyzePage(url);
    return NextResponse.json(results);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    );
  }
}