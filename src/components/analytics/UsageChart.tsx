
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface UsageChartProps {
  data: any[];
  dataKeys: string[];
  colors?: string[];
}

export const UsageChart = ({ data, dataKeys, colors = ['#19ac91', '#3db9a4'] }: UsageChartProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const config = {
    activeUsers: {
      label: 'Active Users',
      color: colors[0]
    },
    pageViews: {
      label: 'Page Views',
      color: colors[1]
    },
    documentAccess: {
      label: 'Document Views',
      color: '#0d8a76'
    },
    courseProgress: {
      label: 'Course Progress',
      color: '#5bbfb2'
    }
  };

  if (!data || data.length === 0) {
    return <div className="h-80 flex items-center justify-center">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ChartContainer config={config}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
            minTickGap={15}
          />
          <YAxis />
          <ChartTooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <ChartTooltipContent 
                  className="bg-white dark:bg-gray-800"
                  nameKey="dataKey"
                  labelKey="value"
                  label={formatDate(label)}
                  payload={payload.map((entry) => ({
                    ...entry,
                    name: config[entry.dataKey as keyof typeof config]?.label || entry.dataKey,
                  }))}
                />
              );
            }}
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={config[key as keyof typeof config]?.label || key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
};
