import { NextResponse } from 'next/server';
import axios from 'axios';

interface TechnologyIndicator {
  name: string;
  category: string;
  patterns: {
    html?: string[];
    scripts?: string[];
    meta?: string[];
    headers?: string[];
  };
}
const technologyPatterns: TechnologyIndicator[] = [
  {
    name: 'React',
    category: 'Frontend',
    patterns: {
      html: ['react', 'data-reactroot', 'data-reactid'],
      scripts: ['react.', 'react-dom'],
    }
  },
  {
    name: 'Next.js',
    category: 'Frontend',
    patterns: {
      html: ['__NEXT_DATA__'],
      headers: ['x-powered-by: Next.js']
    }
  },
  {
    name: 'Vue.js',
    category: 'Frontend',
    patterns: {
      html: ['data-v-', 'vue'],
      scripts: ['vue.', 'vue.min.js']
    }
  },
  {
    name: 'Angular',
    category: 'Frontend',
    patterns: {
      html: ['ng-', 'angular'],
      scripts: ['angular.js', 'angular.min.js']
    }
  },
  {
    name: 'WordPress',
    category: 'CMS',
    patterns: {
      html: ['wp-content', 'wp-includes'],
      meta: ['generator.*wordpress']
    }
  },
  {
    name: 'Google Analytics',
    category: 'Analytics',
    patterns: {
      scripts: ['google-analytics.com', 'ga.js', 'analytics.js', 'gtag']
    }
  },
  {
    name: 'Bootstrap',
    category: 'Frontend',
    patterns: {
      html: ['class="[^"]*navbar', 'class="[^"]*container'],
      scripts: ['bootstrap.']
    }
  },
  {
    name: 'Tailwind CSS',
    category: 'Frontend',
    patterns: {
      html: ['class="[^"]*text-', 'class="[^"]*bg-'],
    }
  },
  {
    name: 'jQuery',
    category: 'Frontend',
    patterns: {
      scripts: ['jquery.', 'jquery.min.js']
    }
  },
  {
    name: 'Node.js',
    category: 'Backend',
    patterns: {
      headers: ['x-powered-by: Express']
    }
  }
];

function calculateConfidence(matches: number): number {
  const baseConfidence = 70;
  const additionalConfidence = Math.min(matches * 10, 30);
  return Math.min(baseConfidence + additionalConfidence, 100);
}

function detectTechnologies(html: string, headers: Record<string, string>): Array<{ name: string; category: string; confidence: number }> {
  const results: Array<{ name: string; category: string; confidence: number }> = [];
  const lowercaseHtml = html.toLowerCase();
  const lowercaseHeaders = Object.entries(headers).reduce((acc, [key, value]) => {
    const headerValue = value != null ? String(value) : '';
    acc[key.toLowerCase()] = headerValue.toLowerCase();
    return acc;
  }, {} as Record<string, string>);

  for (const tech of technologyPatterns) {
    let matches = 0;
    if (tech.patterns.html) {
      for (const pattern of tech.patterns.html) {
        if (lowercaseHtml.includes(pattern.toLowerCase())) {
          matches++;
        }
      }
    }
    if (tech.patterns.scripts) {
      for (const pattern of tech.patterns.scripts) {
        if (lowercaseHtml.includes(pattern.toLowerCase())) {
          matches++;
        }
      }
    }
    if (tech.patterns.meta) {
      for (const pattern of tech.patterns.meta) {
        const regex = new RegExp(pattern, 'i');
        if (lowercaseHtml.match(regex)) {
          matches++;
        }
      }
    }
    if (tech.patterns.headers) {
      for (const pattern of tech.patterns.headers) {
        const [headerName, headerValue] = pattern.split(': ').map(s => s.toLowerCase());
        const actualValue = lowercaseHeaders[headerName];
        if (actualValue && actualValue.includes(headerValue)) {
          matches++;
        }
      }
    }

    if (matches > 0) {
      results.push({
        name: tech.name,
        category: tech.category,
        confidence: calculateConfidence(matches)
      });
    }
  }

  return results;
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    const html = typeof response.data === 'string' ? response.data : '';
    const headers = Object.entries(response.headers).reduce((acc, [key, value]) => {
      acc[key] = value != null ? String(value) : '';
      return acc;
    }, {} as Record<string, string>);

    const technologies = detectTechnologies(html, headers);

    const results = {
      technologies: technologies.sort((a, b) => b.confidence - a.confidence),
      headers: headers,
      meta: {
        totalTechnologies: technologies.length,
        scanDuration: ((Date.now() - startTime) / 1000).toFixed(1)
      }
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan website' },
      { status: 500 }
    );
  }
}