import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Chart({ labels, data, label }) {
  const chartData = {
    labels,
    datasets: [{
      label,
      data,
      backgroundColor: 'rgba(37, 99, 235, 0.6)',
      borderRadius: 6,
    }],
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <Bar data={chartData} />
    </div>
  );
}