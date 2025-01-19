/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, AlertCircle, Copy,  Check, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import Ajv from 'ajv';
import yaml from 'js-yaml';
import { diffJson } from 'diff';
import JSONPath from 'jsonpath';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';

const JsonFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mode, setMode] = useState<'format' | 'diff' | 'schema' | 'path' | 'yaml'>('format');
  const [secondInput, setSecondInput] = useState('');
  const [jsonPath, setJsonPath] = useState('$..');
  const [schema, setSchema] = useState('');
  useEffect(() => {
    const savedState = localStorage.getItem('jsonFormatterState');
    if (savedState) {
      const { input, schema, jsonPath, theme } = JSON.parse(savedState);
      setInput(input || '');
      setSchema(schema || '');
      setJsonPath(jsonPath || '$..');
      setTheme(theme || 'light');
    }
  }, []);
  useEffect(() => {
    const state = { input, schema, jsonPath, theme };
    localStorage.setItem('jsonFormatterState', JSON.stringify(state));
  }, [input, schema, jsonPath, theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const formatJSON = () => {
    if (!input.trim()) {
      setError('Please enter JSON to format');
      setOutput('');
      return;
    }

    try {
      const parsedJSON = JSON.parse(input);
      const formattedJSON = JSON.stringify(parsedJSON, null, indentSize);
      setOutput(Prism.highlight(formattedJSON, Prism.languages.json, 'json'));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const validateSchema = () => {
    if (!input.trim() || !schema.trim()) {
      setError('Please enter both JSON and schema');
      setOutput('');
      return;
    }

    try {
      const ajv = new Ajv();
      const parsedSchema = JSON.parse(schema);
      const parsedJSON = JSON.parse(input);
      const validate = ajv.compile(parsedSchema);
      const valid = validate(parsedJSON);

      if (valid) {
        setOutput('JSON is valid according to the schema');
        setError(null);
      } else {
        setError(validate.errors?.map(err => `${err.instancePath} ${err.message}`).join('\n') || '');
        setOutput('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON or schema');
      setOutput('');
    }
  };

  const compareJSON = () => {
    if (!input.trim() || !secondInput.trim()) {
      setError('Please enter both JSON documents to compare');
      setOutput('');
      return;
    }

    try {
      const json1 = JSON.parse(input);
      const json2 = JSON.parse(secondInput);
      const differences = diffJson(json1, json2);
      
      const diffOutput = differences.map((part: { added: any; removed: any; value: any; }) => {
        const color = part.added ? 'text-green-600' : part.removed ? 'text-red-600' : 'text-gray-600';
        return `<span class="${color}">${part.value}</span>`;
      }).join('');
      
      setOutput(diffOutput);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const queryJSONPath = () => {
    if (!input.trim() || !jsonPath.trim()) {
      setError('Please enter both JSON and JSONPath query');
      setOutput('');
      return;
    }

    try {
      const parsedJSON = JSON.parse(input);
      const result = JSONPath.query(parsedJSON, jsonPath);
      setOutput(JSON.stringify(result, null, indentSize));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON or JSONPath query');
      setOutput('');
    }
  };

  const convertToYAML = () => {
    if (!input.trim()) {
      setError('Please enter JSON to convert');
      setOutput('');
      return;
    }

    try {
      const parsedJSON = JSON.parse(input);
      const yamlOutput = yaml.dump(parsedJSON);
      setOutput(Prism.highlight(yamlOutput, Prism.languages.yaml, 'yaml'));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const convertFromYAML = () => {
    if (!input.trim()) {
      setError('Please enter YAML to convert');
      setOutput('');
      return;
    }

    try {
      const parsedYAML = yaml.load(input);
      const jsonOutput = JSON.stringify(parsedYAML, null, indentSize);
      setOutput(Prism.highlight(jsonOutput, Prism.languages.json, 'json'));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid YAML');
      setOutput('');
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadJSON = () => {
    if (output) {
      const blob = new Blob([output], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  };

  return (
<div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center text-gray-400 hover:text-orange-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-white">JSON Toolkit</CardTitle>
            <CardDescription className="text-gray-400">
              Format, validate, compare, and convert JSON data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="format" onValueChange={(value) => setMode(value as any)}>
              <TabsList className="bg-gray-900/60 border-b border-gray-800/50">
                {['format', 'diff', 'schema', 'path', 'yaml'].map(tab => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 
                             data-[state=active]:to-pink-500 data-[state=active]:text-white text-gray-400"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="space-y-6 mt-6">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="file"
                    accept=".json,.yaml,.yml"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 
                             text-white rounded-lg hover:from-orange-500 hover:to-pink-600 cursor-pointer
                             transition-all duration-300 shadow-lg shadow-orange-500/20"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </label>

                  <Select 
                    value={String(indentSize)} 
                    onValueChange={(value) => setIndentSize(Number(value))}
                  >
                    <SelectTrigger className="w-32 bg-gray-900/40 border-gray-800/50 text-gray-300
                                          focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20">
                      <SelectValue placeholder="Indent Size" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {[2, 4, 8].map(size => (
                        <SelectItem key={size} value={String(size)} className="text-gray-300 focus:bg-gray-800">
                          {size} spaces
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <TabsContent value="format" className="space-y-4">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste your JSON here..."
                    className="w-full px-4 py-2 rounded-lg bg-gray-900/40 border border-gray-800/50 
                             text-gray-300 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 
                             focus:outline-none font-mono h-64"
                  />
                  <button
                    onClick={formatJSON}
                    className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white 
                             rounded-lg hover:from-orange-500 hover:to-pink-600 transition-all duration-300"
                  >
                    Format JSON
                  </button>
                </TabsContent>

                <TabsContent value="diff" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[input, secondInput].map((value, index) => (
                      <textarea
                        key={index}
                        value={value}
                        onChange={(e) => index === 0 ? setInput(e.target.value) : setSecondInput(e.target.value)}
                        placeholder={`${index === 0 ? 'First' : 'Second'} JSON document...`}
                        className="w-full px-4 py-2 rounded-lg bg-gray-900/40 border border-gray-800/50 
                                 text-gray-300 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 
                                 focus:outline-none font-mono h-64"
                      />
                    ))}
                  </div>
                  <button
                    onClick={compareJSON}
                    className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white 
                             rounded-lg hover:from-orange-500 hover:to-pink-600 transition-all duration-300"
                  >
                    Compare JSON
                  </button>
                </TabsContent>

                <TabsContent value="schema" className="space-y-4">
                  {[
                    { value: input, onChange: setInput, placeholder: 'JSON to validate...' },
                    { value: schema, onChange: setSchema, placeholder: 'JSON Schema...' }
                  ].map((field, index) => (
                    <textarea
                      key={index}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2 rounded-lg bg-gray-900/40 border border-gray-800/50 
                               text-gray-300 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 
                               focus:outline-none font-mono h-64"
                    />
                  ))}
                  <button
                    onClick={validateSchema}
                    className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white 
                             rounded-lg hover:from-orange-500 hover:to-pink-600 transition-all duration-300"
                  >
                    Validate Schema
                  </button>
                </TabsContent>
                <TabsContent value="path" className="space-y-4">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="JSON to query..."
                    className="w-full px-4 py-2 rounded-lg bg-gray-900/40 border border-gray-800/50 
                             text-gray-300 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 
                             focus:outline-none font-mono h-64"
                  />
                  <input
                    value={jsonPath}
                    onChange={(e) => setJsonPath(e.target.value)}
                    placeholder="JSONPath query (e.g., $.store.book[*].author)"
                    className="w-full px-4 py-2 rounded-lg bg-gray-900/40 border border-gray-800/50 
                             text-gray-300 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 
                             focus:outline-none font-mono"
                  />
                  <button
                    onClick={queryJSONPath}
                    className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white 
                             rounded-lg hover:from-orange-500 hover:to-pink-600 transition-all duration-300"
                  >
                    Execute Query
                  </button>
                </TabsContent>
                <TabsContent value="yaml" className="space-y-4">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'yaml' ? "Enter JSON or YAML..." : "Paste your JSON here..."}
                    className="w-full px-4 py-2 rounded-lg bg-gray-900/40 border border-gray-800/50 
                             text-gray-300 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 
                             focus:outline-none font-mono h-64"
                  />
                  <div className="flex gap-2">
                    {[
                      { label: 'JSON to YAML', onClick: convertToYAML },
                      { label: 'YAML to JSON', onClick: convertFromYAML }
                    ].map((button, index) => (
                      <button
                        key={index}
                        onClick={button.onClick}
                        className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white 
                                 rounded-lg hover:from-orange-500 hover:to-pink-600 transition-all duration-300"
                      >
                        {button.label}
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-8 bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {output && (
          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Output</CardTitle>
                <div className="flex gap-2">
                  {[
                    { icon: copied ? Check : Copy, label: copied ? 'Copied!' : 'Copy', onClick: copyToClipboard },
                    { icon: Download, label: 'Download', onClick: downloadJSON }
                  ].map((button, index) => (
                    <button
                      key={index}
                      onClick={button.onClick}
                      className="flex items-center px-3 py-2 bg-gray-800 text-gray-300 
                               rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      <button.icon className="w-4 h-4 mr-2" />
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre
                className="bg-gray-900 p-4 rounded-lg overflow-x-auto font-mono text-sm text-gray-300"
                dangerouslySetInnerHTML={{ __html: output }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JsonFormatter;