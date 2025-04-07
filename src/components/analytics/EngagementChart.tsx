
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface EngagementChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export const EngagementChart = ({ data }: EngagementChartProps) => {
  const COLORS = ['#19ac91', '#0d8a76', '#3db9a4', '#5bbfb2'];
  
  const config = {
    Courses: {
      label: 'Courses',
      color: COLORS[0]
    },
    Documents: {
      label: 'Documents',
      color: COLORS[1]
    },
    Discussions: {
      label: 'Discussions',
      color: COLORS[2]
    }
  };

  if (!data || data.length === 0) {
    return <div className="h-80 flex items-center justify-center">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartContainer config={config}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#fff"
              />
            ))}
          </Pie>
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <ChartTooltipContent 
                  className="bg-white dark:bg-gray-800"
                  nameKey="name"
                  labelKey="value"
                  payload={payload}
                />
              );
            }}
          />
          <Legend />
        </PieChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
};
