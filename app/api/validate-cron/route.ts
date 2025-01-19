import { NextResponse } from 'next/server';
import parser from 'cron-parser';
import * as cronValidator from 'cron-validator';

type ValidationRequest = {
  expression: string;
};

type ScheduleInfo = {
  nextExecutions: string[];
  isValid: boolean;
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
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

function getHumanReadableSchedule(expression: string): string {
  try {
    const parts = expression.split(' ');
    const [minutes, hours, daysOfMonth, months, daysOfWeek] = parts;

    const descriptions: string[] = [];
    if (minutes === '*') {
      descriptions.push('every minute');
    } else if (minutes.includes('/')) {
      const [, step] = minutes.split('/');
      descriptions.push(`every ${step} minutes`);
    } else {
      descriptions.push(`at minute ${minutes}`);
    }
    if (hours === '*') {
      descriptions.push('of every hour');
    } else if (hours.includes('/')) {
      const [, step] = hours.split('/');
      descriptions.push(`every ${step} hours`);
    } else {
      descriptions.push(`at ${hours}:00`);
    }
    if (daysOfMonth !== '*') {
      descriptions.push(`on day ${daysOfMonth} of the month`);
    }
    if (months !== '*') {
      const monthNumbers = months.split(',');
      const monthLabels = monthNumbers.map(num => MONTH_NAMES[parseInt(num) - 1]);
      descriptions.push(`in ${monthLabels.join(', ')}`);
    }
    if (daysOfWeek !== '*') {
      if (daysOfWeek === '1-5') {
        descriptions.push('on weekdays');
      } else if (daysOfWeek === '0,6' || daysOfWeek === '6,0') {
        descriptions.push('on weekends');
      } else {
        const dayNumbers = daysOfWeek.split(',');
        const days = dayNumbers.map(num => DAY_NAMES[parseInt(num)]);
        descriptions.push(`on ${days.join(', ')}`);
      }
    }

    return descriptions.join(' ');
  } catch (error) {
    console.error('Error generating human readable schedule:', error);
    return 'according to the specified schedule';
  }
}

export async function POST(request: Request) {
  try {
    const body: ValidationRequest = await request.json();
    const { expression } = body;

    if (!expression) {
      return NextResponse.json(
        { 
          isValid: false,
          error: 'Cron expression is required',
          nextExecutions: [],
          schedule: {
            minutes: '*',
            hours: '*',
            daysOfMonth: '*',
            months: '*',
            daysOfWeek: '*'
          },
          humanReadable: ''
        },
        { status: 400 }
      );
    }

    const isValid = cronValidator.isValidCron(expression);

    if (!isValid) {
      return NextResponse.json({
        isValid: false,
        error: 'Invalid cron expression',
        nextExecutions: [],
        schedule: {
          minutes: '*',
          hours: '*',
          daysOfMonth: '*',
          months: '*',
          daysOfWeek: '*'
        },
        humanReadable: ''
      });
    }

    const interval = parser.parseExpression(expression);
    const nextExecutions = [];
    
    for (let i = 0; i < 10; i++) {
      nextExecutions.push(interval.next().toDate().toISOString());
    }

    const parts = expression.split(' ');
    const schedule = {
      minutes: parts[0],
      hours: parts[1],
      daysOfMonth: parts[2],
      months: parts[3],
      daysOfWeek: parts[4]
    };

    const response: ScheduleInfo = {
      isValid: true,
      nextExecutions,
      schedule,
      humanReadable: getHumanReadableSchedule(expression)
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Validation error:', error);
    
    return NextResponse.json({
      isValid: false,
      error: 'Failed to validate cron expression',
      nextExecutions: [],
      schedule: {
        minutes: '*',
        hours: '*',
        daysOfMonth: '*',
        months: '*',
        daysOfWeek: '*'
      },
      humanReadable: ''
    }, { status: 500 });
  }
}