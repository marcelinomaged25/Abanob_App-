import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface RadarChartProps {
  data: Array<{
    subject: string;
    A: number;
    fullMark: number;
  }>;
  teamName: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, teamName }) => {
  return (
    <div className="w-full h-80 flex items-center justify-center bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-2xl p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" className="dark:stroke-brand-navy-800" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#94a3b8', fontSize: 9 }}
          />
          <Radar
            name={teamName}
            dataKey="A"
            stroke="#d4af37"
            fill="#d4af37"
            fillOpacity={0.35}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
};
