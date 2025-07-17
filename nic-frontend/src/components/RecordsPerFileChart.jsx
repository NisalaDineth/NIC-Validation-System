import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const RecordsPerFileChart = ({ data }) => {
  // Take only the latest 8 files
  const latestData = data.slice(0, 8);

  return (
    <div className="chart-card">
      <h3>Records per File (Latest 8)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={latestData} margin={{ top: 10, right: 30, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="filename" angle={-45} textAnchor="end" interval={0} height={100} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="record_count" fill="#8884d8" name="Records" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RecordsPerFileChart;
