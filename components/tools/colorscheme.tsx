/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Copy, Palette, Code, AlertCircle, Check, Loader2, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ColorAnalysisResult as ColorScheme,
  TabType,
  CopiedStates,
  RGB,
  AcceptedFileType,
  FILE_TYPES,
  ColorKeys,
} from '@/types/color';
import Link from 'next/link';

interface TabConfig {
  icon: typeof Palette | typeof Code;
  label: string;
}

const TABS: Record<TabType, TabConfig> = {
  palette: { icon: Palette, label: 'Color Palette' },
  tailwind: { icon: Code, label: 'Tailwind Config' },
  css: { icon: Code, label: 'CSS Variables' }
} as const;

const ColorSchemeExplorer: React.FC = () => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('palette');
  const [copiedStates, setCopiedStates] = useState<CopiedStates>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (!FILE_TYPES.includes(file.type as AcceptedFileType)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP)');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const processImage = async (file: File): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/analyze-colors', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const data = (await response.json()) as ColorScheme;

      if (!data.palette) {
        throw new Error('Invalid color scheme data received');
      }

      setColorScheme(data);
      toast({
        title: "Success",
        description: "Color scheme generated successfully",
      });
    } catch (err) {
      console.error('Error processing image:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (validateFile(file)) {
      await processImage(file);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (validateFile(file)) {
      await processImage(file);
    }
  }, []);

  const copyToClipboard = async (text: string, id: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      toast({
        title: "Copied!",
        description: "Color code copied to clipboard",
      });
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getContrastColor = (rgb: RGB): string => {
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const renderPaletteContent = useCallback(() => {
    if (!colorScheme?.palette) return null;

    return (
      <div className="space-y-4">
        <AnimatePresence>
          {ColorKeys.map((key) => {
            const color = colorScheme.palette[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-4 rounded-lg transition-transform hover:scale-[1.01]"
                style={{ 
                  backgroundColor: color.hex,
                  boxShadow: `0 4px 12px ${color.hex}25`
                }}
              >
                <div>
                  <p 
                    className="font-medium"
                    style={{ color: getContrastColor(color.rgb) }}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                  <p 
                    className="text-sm opacity-90"
                    style={{ color: getContrastColor(color.rgb) }}
                  >
                    {color.name}
                  </p>
                  {color.usage && (
                    <p 
                      className="text-xs opacity-75 mt-1"
                      style={{ color: getContrastColor(color.rgb) }}
                    >
                      {color.usage}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <p style={{ color: getContrastColor(color.rgb) }}>
                    {color.hex}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(color.hex, key)}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {copiedStates[key] ? (
                      <Check 
                        className="w-4 h-4"
                        style={{ color: getContrastColor(color.rgb) }}
                      />
                    ) : (
                      <Copy 
                        className="w-4 h-4"
                        style={{ color: getContrastColor(color.rgb) }}
                      />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }, [colorScheme?.palette, copiedStates]);

  const renderCodeContent = useCallback(() => {
    if (!colorScheme) return null;

    const content = activeTab === 'tailwind' 
      ? colorScheme.tailwindConfig 
      : colorScheme.cssVariables;

    return (
      <div className="relative">
        <pre className="bg-gray-900/60 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm">
          <code>{content}</code>
        </pre>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => copyToClipboard(content, activeTab)}
          className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {copiedStates[activeTab] ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-white" />
          )}
        </motion.button>
      </div>
    );
  }, [colorScheme, activeTab, copiedStates]);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400/20 to-pink-500/20">
                  <Palette className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">Color Scheme Explorer</CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload an image to generate a beautiful color palette for your website
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative overflow-hidden border-2 border-dashed rounded-lg p-8 text-center
                  transition-all duration-300 bg-gray-900/40
                  ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700'}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={FILE_TYPES.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center ${isLoading ? 'cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <Loader2 className="w-12 h-12 text-orange-400 animate-spin mb-4" />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  )}
                  <p className="text-gray-300 mb-2">
                    {isLoading ? 'Processing image...' : 'Drag and drop an image here, or click to select'}
                  </p>
                  {!isLoading && (
                    <p className="text-sm text-gray-500">
                      Supports JPG, PNG, and WebP (max 5MB)
                    </p>
                  )}
                </label>
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive" className="mb-8 bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400">Error</AlertTitle>
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {colorScheme && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Generated Color Scheme</CardTitle>
                  <div className="flex space-x-2">
                    {(Object.entries(TABS) as [TabType, TabConfig][]).map(([key, { icon: Icon, label }]) => (
                      <Button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        variant={activeTab === key ? 'default' : 'ghost'}
                        size="sm"
                        className={`gap-2 ${activeTab === key ? 'bg-gradient-to-r from-orange-400 to-pink-500' : 'hover:text-orange-400'}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden md:inline">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'palette' ? renderPaletteContent() : renderCodeContent()}
              </CardContent>
            </Card>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Usage Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-gray-300">
                      <h3 className="font-medium mb-2">Primary & Secondary Colors</h3>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Use for main gradients and brand elements</li>
                        <li>• Perfect for call-to-action buttons and important UI elements</li>
                        <li>• Combine for gradient backgrounds and hover effects</li>
                      </ul>
                    </div>
                    
                    <div className="text-gray-300">
                      <h3 className="font-medium mb-2">Accent Color</h3>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Highlight important information</li>
                        <li>• Use for interactive elements and hover states</li>
                        <li>• Great for secondary buttons and icons</li>
                      </ul>
                    </div>
                    
                    <div className="text-gray-300">
                      <h3 className="font-medium mb-2">Background & Text Colors</h3>
                      <ul className="space-y-2 text-gray-400">
                        <li>• Background color optimized for dark theme interfaces</li>
                        <li>• Text color ensures optimal readability</li>
                        <li>• Use lighter/darker variants for depth and hierarchy</li>
                      </ul>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                      <p className="text-orange-400 font-medium mb-2">Pro Tip</p>
                      <p className="text-gray-400">
                        Combine the primary and secondary colors in gradients for a cohesive, modern look that matches the DevForge theme. Use the accent color sparingly for maximum impact.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ColorSchemeExplorer;