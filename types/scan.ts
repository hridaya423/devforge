export interface BrokenLink {
    url: string;
    foundOn: string;
    statusCode: number;
  }
  
  export interface BrokenImage {
    src: string;
    foundOn: string;
    statusCode: number;
  }
  
  export interface ScanResults {
    brokenLinks: BrokenLink[];
    brokenImages: BrokenImage[];
    totalPages: number;
    totalLinks: number;
    scanDuration: string;
  }
  
  export interface ScanRequest {
    url: string;
  }