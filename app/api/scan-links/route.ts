import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';
import axios from 'axios';
import type { ScanRequest, ScanResults } from '@/types/scan';

const CONFIG = {
  MAX_PAGES: 100,
  MAX_LINKS: 1000,
  MAX_DEPTH: 3,
  SCAN_TIMEOUT: 5 * 60 * 1000,
  REQUEST_TIMEOUT: 10000,
  CONCURRENT_REQUESTS: 5,
  DELAY_BETWEEN_REQUESTS: 100,
};

const isValidUrl = (string: string): boolean => {
  try {
    const url = new URL(string);
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') || 
        hostname.endsWith('.local')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const normalizeUrl = (url: string, base: string): string | null => {
  try {
    const normalized = new URL(url, base).href;
    return normalized.split('#')[0];
  } catch {
    return null;
  }
};

const isInternalUrl = (url: string, baseUrl: string): boolean => {
  try {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseUrl);
    return urlObj.hostname === baseUrlObj.hostname;
  } catch {
    return false;
  }
};

class ScanManager {
  private scannedUrls: Set<string>;
  private queue: Array<{ url: string; depth: number }>;
  private processing: boolean;
  private startTime: number;
  private results: ScanResults;
  private activeRequests: number;

  constructor(private baseUrl: string) {
    this.scannedUrls = new Set();
    this.queue = [];
    this.processing = false;
    this.startTime = Date.now();
    this.activeRequests = 0;
    this.results = {
      brokenLinks: [],
      brokenImages: [],
      totalPages: 0,
      totalLinks: 0,
      scanDuration: '0'
    };
  }

  private async checkUrl(url: string): Promise<number> {
    try {
      const response = await axios.head(url, {
        timeout: CONFIG.REQUEST_TIMEOUT,
        maxRedirects: 5,
        validateStatus: null,
        headers: {
          'User-Agent': 'DevForge Link Checker/1.0'
        }
      });
      return response.status;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          return 404;
        }
        return error.response?.status || 0;
      }
      return 0;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      if (this.results.totalPages >= CONFIG.MAX_PAGES ||
          this.results.totalLinks >= CONFIG.MAX_LINKS ||
          Date.now() - this.startTime >= CONFIG.SCAN_TIMEOUT) {
        break;
      }
      const batch = this.queue.splice(0, CONFIG.CONCURRENT_REQUESTS);
      const promises = batch.map(item => this.scanPage(item.url, item.depth));
      
      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_REQUESTS));
    }

    this.processing = false;
  }

  private async scanPage(pageUrl: string, depth: number): Promise<void> {
    if (this.scannedUrls.has(pageUrl) || depth > CONFIG.MAX_DEPTH) {
      return;
    }

    this.scannedUrls.add(pageUrl);
    this.results.totalPages++;

    try {
      const response = await axios.get(pageUrl, {
        timeout: CONFIG.REQUEST_TIMEOUT,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'DevForge Link Checker/1.0'
        }
      });
      
      const root = parse(response.data);
      const links = root.querySelectorAll('a');
      for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) continue;

        const absoluteUrl = normalizeUrl(href, pageUrl);
        if (!absoluteUrl) continue;

        this.results.totalLinks++;

        if (isInternalUrl(absoluteUrl, this.baseUrl)) {
          const status = await this.checkUrl(absoluteUrl);
          if (status >= 400 || status === 0) {
            this.results.brokenLinks.push({
              url: absoluteUrl,
              foundOn: pageUrl,
              statusCode: status
            });
          } else if (!this.scannedUrls.has(absoluteUrl)) {
            this.queue.push({ url: absoluteUrl, depth: depth + 1 });
          }
        }
      }
      const images = root.querySelectorAll('img');
      for (const img of images) {
        const src = img.getAttribute('src');
        if (!src) continue;

        const absoluteUrl = normalizeUrl(src, pageUrl);
        if (!absoluteUrl) continue;

        this.results.totalLinks++;

        const status = await this.checkUrl(absoluteUrl);
        if (status >= 400 || status === 0) {
          this.results.brokenImages.push({
            src: absoluteUrl,
            foundOn: pageUrl,
            statusCode: status
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning ${pageUrl}:`, error);
      if (!this.results.brokenLinks.some(link => link.url === pageUrl)) {
        this.results.brokenLinks.push({
          url: pageUrl,
          foundOn: pageUrl,
          statusCode: 0
        });
      }
    }
  }

  async scan(): Promise<ScanResults> {
    this.queue.push({ url: this.baseUrl, depth: 0 });
    await this.processQueue();
    
    this.results.scanDuration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    return this.results;
  }
}

export async function POST(request: Request) {
  try {
    const body: ScanRequest = await request.json();
    const { url } = body;

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    const scanner = new ScanManager(url);
    const results = await scanner.scan();

    return NextResponse.json(results);
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Failed to scan website' },
      { status: 500 }
    );
  }
}