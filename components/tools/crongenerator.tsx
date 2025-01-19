'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Copy, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type ValidationResponse = { 
  isValid: boolean;
  nextExecutions: string[];
  error?: string;
  schedule: {
    minutes: string;
    hours: string;
    daysOfMonth: string;
    months: string;
    daysOfWeek: string;
  };
  humanReadable: string;
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const CronGenerator = () => {
  const [cronExpression, setCronExpression] = useState('* * * * *');
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'simple' | 'advanced'>('simple');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [humanReadable, setHumanReadable] = useState<string>('');
  const [schedule, setSchedule] = useState({
    minutes: '*',
    hours: '*',
    daysOfMonth: '*',
    months: '*',
    daysOfWeek: '*'
  });
  const [copied, setCopied] = useState(false);
  const presets = [
    { name: 'Every Minute', expression: '* * * * *', description: 'Run every minute of every day' },
    { name: 'Every Hour', expression: '0 * * * *', description: 'Run at the beginning of every hour' },
    { name: 'Every Day at Midnight', expression: '0 0 * * *', description: 'Run once a day at 12:00 AM' },
    { name: 'Every Sunday', expression: '0 0 * * 0', description: 'Run once a week on Sunday at 12:00 AM' },
    { name: 'Every Month', expression: '0 0 1 * *', description: 'Run once a month on the 1st at 12:00 AM' },
    { name: 'Weekdays at 9am', expression: '0 9 * * 1-5', description: 'Run Monday through Friday at 9:00 AM' },
    { name: 'Every 30 Minutes', expression: '*/30 * * * *', description: 'Run every 30 minutes' },
    { name: 'Every 4 Hours', expression: '0 */4 * * *', description: 'Run every 4 hours' },
    { name: 'Twice Daily', expression: '0 0,12 * * *', description: 'Run at 12:00 AM and 12:00 PM' },
    { name: 'Weekend Maintenance', expression: '0 0 * * 6,0', description: 'Run at 12:00 AM on weekends' }
  ];

  const timeUnits = [
    {
      name: 'Minutes',
      field: 'minutes' as const,
      options: [
        { value: '*', label: 'Every minute' },
        { value: '*/5', label: 'Every 5 minutes' },
        { value: '*/10', label: 'Every 10 minutes' },
        { value: '*/15', label: 'Every 15 minutes' },
        { value: '*/30', label: 'Every 30 minutes' },
        { value: '0', label: 'At minute 0' },
        { value: '15', label: 'At minute 15' },
        { value: '30', label: 'At minute 30' },
        { value: '45', label: 'At minute 45' }
      ]
    },
    {
      name: 'Hours',
      field: 'hours' as const,
      options: [
        { value: '*', label: 'Every hour' },
        { value: '*/2', label: 'Every 2 hours' },
        { value: '*/3', label: 'Every 3 hours' },
        { value: '*/4', label: 'Every 4 hours' },
        { value: '*/6', label: 'Every 6 hours' },
        { value: '*/12', label: 'Every 12 hours' },
        ...Array.from({ length: 24 }, (_, i) => ({
          value: i.toString(),
          label: `At ${i.toString().padStart(2, '0')}:00`
        }))
      ]
    },
    {
      name: 'Day of Month',
      field: 'daysOfMonth' as const,
      options: [
        { value: '*', label: 'Every day' },
        ...Array.from({ length: 31 }, (_, i) => ({
          value: (i + 1).toString(),
          label: `On day ${i + 1}`
        }))
      ]
    },
    {
      name: 'Month',
      field: 'months' as const,
      options: [
        { value: '*', label: 'Every month' },
        ...Array.from({ length: 12 }, (_, i) => ({
          value: (i + 1).toString(),
          label: monthNames[i]
        }))
      ]
    },
    {
      name: 'Day of Week',
      field: 'daysOfWeek' as const,
      options: [
        { value: '*', label: 'Every day' },
        { value: '1-5', label: 'Monday to Friday' },
        { value: '6,0', label: 'Weekends' },
        ...Array.from({ length: 7 }, (_, i) => ({
          value: i.toString(),
          label: dayNames[i]
        }))
      ]
    }
  ];

  const validateCronExpression = async (expression: string) => {
    try {
      const response = await fetch('/api/validate-cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate expression');
      }

      const data: ValidationResponse = await response.json();
      
      setIsValid(data.isValid);
      setError(data.error || null);
      setNextExecutions(data.nextExecutions || []);
      setHumanReadable(data.humanReadable || '');
      
      if (data.schedule) {
        setSchedule(data.schedule);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsValid(false);
    }
  };

  useEffect(() => {
    validateCronExpression(cronExpression);
  }, [cronExpression]);

  const handleScheduleChange = (field: keyof typeof schedule, value: string) => {
    const newSchedule = { ...schedule, [field]: value };
    setSchedule(newSchedule);
    const newExpression = `${newSchedule.minutes} ${newSchedule.hours} ${newSchedule.daysOfMonth} ${newSchedule.months} ${newSchedule.daysOfWeek}`;
    setCronExpression(newExpression);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/" 
          className="flex items-center text-gray-400 hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <Card className="mb-8 bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Cron Job Generator</CardTitle>
          <CardDescription className="text-gray-400">
            Create and validate cron expressions with an intuitive interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setSelectedTab('simple')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedTab === 'simple' 
                    ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                Simple Mode
              </button>
              <button
                onClick={() => setSelectedTab('advanced')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedTab === 'advanced' 
                    ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                Advanced Mode
              </button>
            </div>
            {selectedTab === 'simple' && (
              <div className="space-y-6">
                <div className="grid gap-6">
                  {timeUnits.map((unit) => (
                    <div key={unit.name} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {unit.name}
                      </label>
                      <select
                        value={schedule[unit.field]}
                        onChange={(e) => handleScheduleChange(unit.field, e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300
                                 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                      >
                        {unit.options.map((option) => (
                          <option key={option.value} value={option.value} className="bg-gray-800">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedTab === 'advanced' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Cron Expression
                  </label>
                  <input
                    type="text"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-300
                             focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 font-mono"
                    placeholder="* * * * *"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Common Presets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setCronExpression(preset.expression)}
                        className="p-4 text-left bg-gray-800/50 rounded-lg border border-gray-700/50
                                 hover:border-orange-500/50 hover:bg-gray-700/50 transition-all duration-300"
                      >
                        <div className="font-medium text-gray-300">{preset.name}</div>
                        <div className="text-sm text-orange-400 font-mono mt-1">{preset.expression}</div>
                        <div className="text-sm text-gray-400 mt-1">{preset.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="font-mono text-gray-300">{cronExpression}</div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 text-sm rounded-lg bg-gradient-to-r from-orange-400 to-pink-500
                           text-white hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            {isValid && humanReadable && (
              <Alert className="bg-gray-800/50 border-orange-500/50">
                <Clock className="h-4 w-4 text-orange-400" />
                <AlertTitle className="text-gray-300">Schedule</AlertTitle>
                <AlertDescription className="text-gray-400">
                  This cron job will run {humanReadable}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-red-400">Error</AlertTitle>
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}
            {isValid && nextExecutions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Next 10 Executions</h3>
                <div className="space-y-2">
                  {nextExecutions.map((dateString, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                    >
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{formatDateTime(dateString)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Alert className="bg-gray-800/50 border-gray-700/50">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <AlertTitle className="text-gray-300">Cron Expression Format</AlertTitle>
              <AlertDescription className="text-gray-400">
                <pre className="mt-2 p-4 bg-gray-900/50 rounded-lg overflow-x-auto font-mono text-sm text-gray-300">
                  * * * * *
                  ┬ ┬ ┬ ┬ ┬
                  │ │ │ │ └── Day of Week (0-6) (Sunday=0)
                  │ │ │ └──── Month (1-12)
                  │ │ └────── Day of Month (1-31)
                  │ └──────── Hour (0-23)
                  └────────── Minute (0-59)
                </pre>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-300">Special Characters:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li><code className="bg-gray-900/50 px-1 text-orange-400">*</code> - Any value</li>
                    <li><code className="bg-gray-900/50 px-1 text-orange-400">,</code> - Value list separator (e.g., &quot;1,3,5&quot;)</li>
                    <li><code className="bg-gray-900/50 px-1 text-orange-400">-</code> - Range of values (e.g., &quot;1-5&quot;)</li>
                    <li><code className="bg-gray-900/50 px-1 text-orange-400">/</code> - Step values (e.g., &quot;*/5&quot;)</li>
                  </ul>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-300">Examples:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li><code className="bg-gray-900/50 px-1 text-orange-400">0 0 * * *</code> - Every day at midnight</li>
                    <li><code className="bg-gray-900/50 px-1 text-orange-400">*/15 * * * *</code> - Every 15 minutes</li>
                    <li><code className="bg-gray-900/50 px-1 text-orange-400">0 9-17 * * 1-5</code> - Every hour from 9 AM to 5 PM on weekdays</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default CronGenerator;