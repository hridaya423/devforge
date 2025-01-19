/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, Copy, Download, Upload, Save, Undo, Redo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion } from 'framer-motion';

const getDefaultMarkdown = () => `# Welcome to the Simple Markdown Editor

## Features
- **Bold text** and *italic text*
- Basic code blocks
- Links and images
- Lists and quotes

### Example Code Block:
\`\`\`
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> This is a blockquote

1. First ordered list item
2. Second item
   - Unordered sub-list
   - Another item

[Visit our website](https://example.com)`;

const parseMarkdown = (markdown: string): string => {
  let html = markdown
  html = html.replace(/[&<>"']/g, (match) => {
    const entities: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[match];
  });
  html = html.replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
  html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  html = html.replace(/^(\s*)-\s+(.+)$/gm, (match, indent, content) => {
    const level = indent.length;
    return `${'\t'.repeat(level)}<li>${content}</li>`;
  });

  html = html.replace(/^(\s*)\d+\.\s+(.+)$/gm, (match, indent, content) => {
    const level = indent.length;
    return `${'\t'.repeat(level)}<li>${content}</li>`;
  });

  const convertListHierarchy = (html: string): string => {
    const lines = html.split('\n');
    const stack: string[] = [];
    let result = '';
    let currentLevel = 0;

    lines.forEach((line) => {
      if (line.includes('<li>')) {
        const level = (line.match(/^\t*/)?.[0] || '').length;
        const content = line.replace(/^\t*/, '');
        while (currentLevel > level) {
          result += `</${stack.pop()}>\n`;
          currentLevel--;
        }
        while (currentLevel < level) {
          const listType = content.startsWith('<li>1.') ? 'ol' : 'ul';
          stack.push(listType);
          result += `<${listType}>\n`;
          currentLevel++;
        }

        result += content + '\n';
      } else {
        while (currentLevel > 0) {
          result += `</${stack.pop()}>\n`;
          currentLevel--;
        }
        result += line + '\n';
      }
    });

    while (stack.length > 0) {
      result += `</${stack.pop()}>\n`;
    }

    return result;
  };

  html = convertListHierarchy(html);

  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  html = html.replace(/!\[([^\]]+)\]\(([^\)]+)\)/g, (match, alt, src) => {
    return `<img src="${src}" alt="${alt}" onerror="this.src='/api/placeholder/400/300';this.onerror=null;">`;
  });

  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
};

const MarkdownEditor = () => {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [markdown, setMarkdown] = useState(getDefaultMarkdown());
  const [history, setHistory] = useState([{ content: getDefaultMarkdown(), timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lastSavedDisplay, setLastSavedDisplay] = useState('Not saved yet');
  const [renderedContent, setRenderedContent] = useState('');

  useEffect(() => {
    setRenderedContent(parseMarkdown(markdown));
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
                    Simple Markdown Editor
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
                    className="w-full h-full p-4 rounded-lg bg-gray-900/60 border border-gray-800/50 focus:border-orange-500/50 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Type your markdown here..."
                    spellCheck="false"
                  />
                </div>
                <div 
                  className="markdown-preview h-[calc(100vh-400px)] overflow-auto p-4 rounded-lg bg-gray-900/60 border border-gray-800/50 text-gray-300"
                  dangerouslySetInnerHTML={{ __html: renderedContent }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .markdown-preview {
          line-height: 1.6;
        }
        .markdown-preview h1 {
          font-size: 2em;
          margin: 0.67em 0;
          color: #fff;
        }
        .markdown-preview h2 {
          font-size: 1.5em;
          margin: 0.83em 0;
          color: #fff;
        }
        .markdown-preview h3 {
          font-size: 1.17em;
          margin: 1em 0;
          color: #fff;
        }
        .markdown-preview strong {
          font-weight: bold;
          color: #fff;
        }
        .markdown-preview em {
          font-style: italic;
        }
        .markdown-preview code {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }
        .markdown-preview pre {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
        }
        .markdown-preview pre code {
          background-color: transparent;
          padding: 0;
          border-radius: 0;
          color: #e2e8f0;
        }
        .markdown-preview blockquote {
          border-left: 4px solid #ed8936;
          margin: 1em 0;
          padding-left: 1em;
          color: #a0aec0;
        }
        .markdown-preview ul, .markdown-preview ol {
          margin: 1em 0;
          padding-left: 2em;
          list-style-position: outside;
        }
        .markdown-preview ul {
          list-style-type: disc;
        }
        .markdown-preview ul ul {
          list-style-type: circle;
        }
        .markdown-preview ul ul ul {
          list-style-type: square;
        }
        .markdown-preview ol {
          list-style-type: decimal;
        }
        .markdown-preview ol ol {
          list-style-type: lower-alpha;
        }
        .markdown-preview ol ol ol {
          list-style-type: lower-roman;
        }
        .markdown-preview li {
          margin: 0.5em 0;
          display: list-item;
        }
        .markdown-preview ul ul, 
        .markdown-preview ul ol, 
        .markdown-preview ol ul, 
        .markdown-preview ol ol {
          margin: 0.5em 0 0.5em 2em;
        }
        .markdown-preview a {
          color: #ed8936;
          text-decoration: none;
        }
        .markdown-preview a:hover {
          text-decoration: underline;
        }
        .markdown-preview p {
          margin: 1em 0;
        }
        .markdown-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;
