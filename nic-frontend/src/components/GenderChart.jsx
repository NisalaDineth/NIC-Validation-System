import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d'];

const GenderChart = ({ data }) => {
  return (
    <div className="chart-card">
      <h3>Gender Distribution</h3>
      <PieChart width={300} height={250}>
        <Pie
          data={data}
          dataKey="count"
          nameKey="gender"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default GenderChart;