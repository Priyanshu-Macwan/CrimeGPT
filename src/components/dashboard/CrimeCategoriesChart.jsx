import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * CrimeCategoriesChart — Donut chart showing crime category breakdown.
 * Uses Recharts PieChart with a brutalist color palette derived from
 * the navy (#071525) at varying opacities to maintain the monochrome aesthetic.
 */

const chartData = [
  { name: 'Theft', value: 45, fill: '#071525' },
  { name: 'Assault', value: 30, fill: '#3a5068' },
  { name: 'Fraud', value: 15, fill: '#6d8599' },
  { name: 'Other', value: 10, fill: '#b0c4d4' },
];

/* Legend swatch patterns matching the reference screenshot */
const legendItems = [
  { label: 'Theft (45%)', style: 'bg-bureau-navy' },
  {
    label: 'Assault (30%)',
    patternStyle: {
      background: 'repeating-linear-gradient(45deg, #071525, #071525 2px, transparent 2px, transparent 4px)',
    },
  },
  {
    label: 'Fraud (15%)',
    patternStyle: {
      background: 'repeating-linear-gradient(-45deg, #071525, #071525 2px, transparent 2px, transparent 4px)',
    },
  },
  { label: 'Other (10%)', style: 'bg-transparent' },
];

/** Custom tooltip styled to match the brutalist theme */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bureau-bg border border-bureau-navy px-3 py-2 shadow-[2px_2px_0px_#071525]">
        <p className="font-label-md text-label-md text-bureau-navy font-bold uppercase">
          {payload[0].name}
        </p>
        <p className="font-body-md text-body-md text-bureau-navy">
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const CrimeCategoriesChart = () => {
  return (
    <div className="bg-bureau-bg border border-bureau-navy p-md flex flex-col h-80">
      <h2 className="text-headline-md font-headline-md text-bureau-navy mb-4 border-b border-bureau-navy pb-2 font-bold">
        Crime Categories Breakdown
      </h2>
      <div className="flex-1 flex items-center justify-center relative">
        {/* Recharts Donut */}
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                stroke="#071525"
                strokeWidth={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="block text-display font-display text-bureau-navy leading-none font-bold">
                47
              </span>
              <span className="text-label-sm font-label-sm text-bureau-navy font-bold uppercase">
                Total
              </span>
            </div>
          </div>
        </div>

        {/* Legend panel */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2 border border-bureau-navy p-3 bg-bureau-bg">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center space-x-2 text-label-sm font-label-sm text-bureau-navy font-bold uppercase"
            >
              <div
                className={`w-3 h-3 border border-bureau-navy ${item.style || ''}`}
                style={item.patternStyle || {}}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrimeCategoriesChart;
