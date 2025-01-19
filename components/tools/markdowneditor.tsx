/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, Copy, Download, Upload, Save, Undo, Redo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion } from 'framer-motion';

const getDefaultMarkdown = () => `# Welcome to the Enhanced Markdown Editor

## Features
- **Live Preview** with GFM support
- *Auto-save* functionality
- Keyboard shortcuts (Ctrl/⌘ + S to save)
- File upload/download
- Undo/Redo support
- Secure HTML rendering
- Responsive design

### Example Code Block:
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> Try out different markdown features!

1. First ordered list item
2. Second item
   - Unordered sub-list
   - Another item

Visit the [documentation](https://docs.example.com) for more details.`;

const MarkdownEditor = () => {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [markdown, setMarkdown] = useState(getDefaultMarkdown());
  const [history, setHistory] = useState([{ content: getDefaultMarkdown(), timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastSavedDisplay, setLastSavedDisplay] = useState('Not saved yet');
  const [renderedContent, setRenderedContent] = useState('');

useEffect(() => {
  const updateRenderedContent = async () => {
    const rendered = await renderMarkdown(markdown);
    setRenderedContent(rendered);
  };
  updateRenderedContent();
}, [markdown]);

  useEffect(() => {
    setIsClient(true);
    const savedContent = localStorage.getItem('markdown-content');
    if (savedContent) {
      setMarkdown(savedContent);
      setHistory([{ content: savedContent, timestamp: Date.now() }]);
      updateLastSavedTime();
    }
  }, []);

  const updateLastSavedTime = () => {
    const now = new Date();
    setLastSavedDisplay(now.toLocaleTimeString());
  };

  const handleSave = () => {
    localStorage.setItem('markdown-content', markdown);
    updateLastSavedTime();
    toast({
      title: "Saved Successfully",
      description: "Your markdown content has been saved.",
    });
  };

  useHotkeys('mod+s', (e) => {
    e.preventDefault();
    handleSave();
  }, { enabled: isClient });

  useHotkeys('mod+z', (e) => {
    e.preventDefault();
    handleUndo();
  }, { enabled: isClient });

  useHotkeys('mod+shift+z', (e) => {
    e.preventDefault();
    handleRedo();
  }, { enabled: isClient });

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setMarkdown(history[historyIndex - 1].content);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setMarkdown(history[historyIndex + 1].content);
    }
  };

  const handleMarkdownChange = (e: any) => {
    const newContent = e.target.value;
    setMarkdown(newContent);
    if (newContent !== history[historyIndex]?.content) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ content: newContent, timestamp: Date.now() });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `document-${timestamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Download Started",
      description: "Your markdown file is being downloaded.",
    });
  };

  const handleUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      setMarkdown(text);
      const newHistory = [...history, { content: text, timestamp: Date.now() }];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      localStorage.setItem('markdown-content', text);
      updateLastSavedTime();
      toast({
        title: "File Uploaded",
        description: "Your markdown file has been loaded successfully.",
      });
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(markdown);
    toast({
      title: "Copied",
      description: "Content copied to clipboard.",
    });
  };

  const renderMarkdown = async (text: string): Promise<string> => {
    if (!isClient) return '';
    try {
      const rawHtml = await Promise.resolve(marked(text));
      return DOMPurify.sanitize(rawHtml);
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return '';
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="relative max-w-7xl mx-auto p-4 md:p-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-orange-400 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                    Markdown Editor
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Create and preview Markdown documents with live formatting
                  </CardDescription>
                </div>
                <div className="text-sm text-gray-400">
                  Last saved: {lastSavedDisplay}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save (⌘/Ctrl + S)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download MD
                </motion.button>
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload MD
                  <input
                    type="file"
                    accept=".md,.markdown,.txt"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </motion.label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="flex items-center px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                  className="flex items-center px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Undo className="w-4 h-4 mr-2" />
                  Undo (⌘/Ctrl + Z)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRedo}
                  disabled={historyIndex === history.length - 1}
                  className="flex items-center px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Redo className="w-4 h-4 mr-2" />
                  Redo (⌘/Ctrl + ⇧ + Z)
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[calc(100vh-400px)]">
                  <textarea
                    value={markdown}
                    onChange={handleMarkdownChange}
                    className="w-full h-full p-4 rounded-lg bg-gray-900/60 border-gray-800/50 focus:border-orange-500/50 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Type your markdown here..."
                    spellCheck="false"
                  />
                </div>
                <div 
  className="h-[calc(100vh-400px)] overflow-auto p-4 rounded-lg bg-gray-900/60 border border-gray-800/50 prose prose-invert prose-sm max-w-none"
  dangerouslySetInnerHTML={{ __html: renderedContent }}
/>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;