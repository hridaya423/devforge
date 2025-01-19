/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Globe, Palette, Share2, Star, Code, GitPullRequest, FileText, 
         Database, Activity, Search, Paintbrush, File, Chrome, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Tool {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  category: string;
}

interface TiltedScrollProps {
  tools: Tool[];
}

interface ToolsShowcaseProps {
  tools: Tool[];
}

const TiltedScroll: React.FC<TiltedScrollProps> = ({ tools }) => {
  const doubledTools = [...tools, ...tools];

  return (
    <div className="flex items-center justify-center w-full">
      <div className="relative w-[450px] h-[500px] overflow-hidden">
        <div className="relative w-full h-full [transform-style:preserve-3d] [transform:rotateX(20deg)_rotateZ(-20deg)_skewX(20deg)]">
          <div className="absolute w-full animate-skew-scroll">
            {doubledTools.map((tool, index) => (
              <a href={tool.path} key={`${tool.path}-${index}`}>
              <div
                key={`${tool.path}-${index}`}
                className="flex items-center gap-3 p-4 mb-4 backdrop-blur-xl 
                         border border-white/5 rounded-lg
                         hover:border-orange-500/50 hover:bg-white/5
                         transition-all duration-300 transform 
                         hover:scale-105 hover:-translate-y-1 cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-400/20 to-pink-500/20">
                  {React.createElement(tool.icon, {
                    className: "h-5 w-5 text-orange-400"
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{tool.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{tool.description}</p>
                </div>
              </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolsShowcase: React.FC<ToolsShowcaseProps> = ({ tools }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
      {tools.map((tool, index) => (
        <motion.div
          key={tool.path}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 
                         transition-all duration-500 hover:transform hover:-translate-y-2">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400/20 to-pink-500/20">
                  {React.createElement(tool.icon, {
                    className: "h-6 w-6 text-orange-400"
                  })}
                </div>
                <div>
                  <div className="text-sm font-medium text-orange-400 mb-1">
                    {tool.category}
                  </div>
                  <CardTitle className="text-lg text-white">
                    {tool.title}
                  </CardTitle>
                  <p className="text-sm text-gray-400 mt-2">
                    {tool.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <a href={tool.path}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-orange-400/10 to-pink-500/10 
                         hover:from-orange-400 hover:to-pink-500 rounded-lg text-white text-sm font-medium 
                         transition-all duration-300"
              >
                Launch Tool
              </motion.button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const toolsGridRef = useRef<HTMLDivElement>(null);

  const scrollToTools = () => {
    toolsGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const tools: Tool[] = [
    {
      title: "Dead Link Detector",
      description: "Find and report broken links and images across your website",
      icon: Globe,
      path: "/tools/dead-link-detector",
      category: "SEO"
    },
    {
      title: "Color Scheme Explorer",
      description: "Generate website color palettes from image uploads",
      icon: Palette,
      path: "/tools/color-scheme",
      category: "Design"
    },
    {
      title: "Dev Resource Rater",
      description: "Rate and review development tools with code examples",
      icon: Star,
      path: "/tools/resource-rater",
      category: "Development"
    },
    {
      title: "Code Snippet Battle",
      description: "Submit and vote on coding challenge solutions",
      icon: Code,
      path: "/tools/snippet-battle",
      category: "Development"
    },
    {
      title: "PR Quality Scorer",
      description: "Analyze and score GitHub pull requests",
      icon: GitPullRequest,
      path: "/tools/pr-scorer",
      category: "Development"
    },
    {
      title: "Tech Stack Visualizer",
      description: "Discover technologies powering any website",
      icon: Database,
      path: "/tools/tech-stack",
      category: "Analytics"
    },
    {
      title: "API Performance Monitor",
      description: "Monitor API health, response times, and uptime",
      icon: Activity,
      path: "/tools/api-monitor",
      category: "Development"
    },
    {
      title: "Regex Tester",
      description: "Test and debug regular expressions with real-time feedback",
      icon: Code,
      path: "/tools/regex-tester",
      category: "Development"
    },
    {
      title: "JSON Formatter & Validator",
      description: "Beautify, validate, and edit JSON files for APIs",
      icon: FileText,
      path: "/tools/json-formatter",
      category: "Development"
    },
    {
      title: "CSS Gradient Generator",
      description: "Design and export CSS gradients with multiple colors",
      icon: Paintbrush,
      path: "/tools/gradient-generator",
      category: "Design"
    },
    {
      title: "Markdown Editor",
      description: "Create and preview Markdown files with live formatting",
      icon: File,
      path: "/tools/markdown-editor",
      category: "Content"
    },
    {
      title: "Cross Browser Tester",
      description: "Test your website across various browsers and versions",
      icon: Chrome,
      path: "/tools/crossbrowser-tester",
      category: "Testing"
    },
    {
      title: "Cron Job Generator",
      description: "Create and validate cron job expressions with an intuitive interface",
      icon: Clock,
      path: "/tools/cronjob-generator",
      category: "Development"
    },
    {
      title: "SEO Analyzer",
      description: "Analyze website's SEO performance and structure",
      icon: Search,
      path: "/tools/seo-analyzer",
      category: "SEO"
    },
    {
      title: "Social Bio Hub",
      description: "Create a beautiful unified page for all your social profiles",
      icon: Share2,
      path: "/tools/social-bio",
      category: "Social"
    },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0B0B11]">
        <div className="absolute inset-0 overflow-hidden">
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
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-orange-500/10"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center gap-16">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-orange-400/20 to-pink-500/20 blur-xl"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <img src="/logo.png" alt="DevTools Logo" className="relative text-8xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl text-gray-300/90 max-w-2xl font-light"
            >
              Craft exceptional developer experiences with our premium toolset
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
            style={{
              perspective: "2000px",
            }}
          >
            <TiltedScroll tools={tools.slice(0, 8)} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTools}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-orange-400 to-pink-500 text-white font-medium
                       shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
            >
              Explore Tools
            </motion.button>
            <a href="https://github.com/hridaya423/devforge">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-lg bg-white/5 text-white font-medium
                       hover:bg-white/10 transition-colors duration-200 backdrop-blur-sm
                       border border-white/10"
            >
              Learn More
            </motion.button>
            </a>
          </motion.div>
        </div>
        <div className="absolute bottom-0 w-full overflow-hidden pointer-events-none">
          <div className="relative h-px w-full">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scaleX: [0.9, 1.1, 0.9]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>
      </div>
      <div ref={toolsGridRef} className="py-20 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Developer Tools Suite
            </span>
          </h2>
          <ToolsShowcase tools={tools} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;