'use client'
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, Copy, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const GradientGenerator = () => {
  const [colors, setColors] = useState([
    { color: '#f97316', position: 0 },
    { color: '#ec4899', position: 100 }
  ]);
  const [gradientType, setGradientType] = useState('linear');
  const [angle, setAngle] = useState(90);

  const generateGradientCSS = () => {
    const sortedColors = [...colors].sort((a, b) => a.position - b.position);
    const colorStops = sortedColors
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');
    
    return gradientType === 'linear'
      ? `background: linear-gradient(${angle}deg, ${colorStops});`
      : `background: radial-gradient(circle, ${colorStops});`;
  };

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index].color = newColor;
    setColors(newColors);
  };

  const handlePositionChange = (index: number, newPosition: number) => {
    const newColors = [...colors];
    newColors[index].position = Math.min(100, Math.max(0, newPosition));
    setColors(newColors);
  };

  const addColor = () => {
    if (colors.length < 5) {
      setColors([...colors, { color: '#9333ea', position: 50 }]);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateGradientCSS());
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/" 
            className="flex items-center text-gray-400 hover:text-orange-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-8">
          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white">CSS Gradient Generator</CardTitle>
              <CardDescription className="text-gray-400">
                Create beautiful CSS gradients for your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="w-full h-48 rounded-lg mb-8"
                style={{ [generateGradientCSS().split(': ')[0]]: generateGradientCSS().split(': ')[1].slice(0, -1) }}
              />

              <div className="grid gap-6">
                <div className="flex gap-4">
                  <select
                    value={gradientType}
                    onChange={(e) => setGradientType(e.target.value)}
                    className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                  >
                    <option value="linear">Linear Gradient</option>
                    <option value="radial">Radial Gradient</option>
                  </select>

                  {gradientType === 'linear' && (
                    <input
                      type="number"
                      value={angle}
                      onChange={(e) => setAngle(Number(e.target.value))}
                      min="0"
                      max="360"
                      className="w-24 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      placeholder="Angle"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  {colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="color"
                        value={color.color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="w-12 h-12 p-1 rounded cursor-pointer bg-gray-800 border border-gray-700"
                      />
                      <input
                        type="number"
                        value={color.position}
                        onChange={(e) => handlePositionChange(index, Number(e.target.value))}
                        min="0"
                        max="100"
                        className="w-24 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg 
                                 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                      />
                      {colors.length > 2 && (
                        <button
                          onClick={() => removeColor(index)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  {colors.length < 5 && (
                    <button
                      onClick={addColor}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 
                               text-white rounded-lg hover:from-orange-500 hover:to-pink-600 
                               transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Color
                    </button>
                  )}
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg 
                             hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy CSS
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-white">Generated CSS</h3>
                  <pre className="p-4 bg-gray-800 text-gray-300 rounded-lg overflow-x-auto">
                    {generateGradientCSS()}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GradientGenerator;