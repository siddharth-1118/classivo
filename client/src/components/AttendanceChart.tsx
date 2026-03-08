import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface AttendanceChartProps {
  labels: string[];
  data: number[];
  type?: 'bar' | 'line';
  title?: string;
  color?: string;
}

export default function AttendanceChart({ labels, data, type = 'bar', title, color = '#74c0fc' }: AttendanceChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
        color: '#cdd6f4',
        font: { size: 16, weight: 'bold' as const }
      },
      tooltip: {
        backgroundColor: '#1e1e2e',
        titleColor: '#cdd6f4',
        bodyColor: '#bac2de',
        borderColor: '#313244',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#7f849c', font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#7f849c', font: { size: 11 } }
      }
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Attendance %',
        data,
        backgroundColor: `${color}80`,
        borderColor: color,
        borderWidth: 2,
        borderRadius: 6,
        fill: type === 'line',
        tension: 0.4
      }
    ]
  };

  return (
    <div style={{ width: '100%', height: '300px', padding: '20px' }} className="card">
      {type === 'bar' ? (
        <Bar options={options} data={chartData} />
      ) : (
        <Line options={options} data={chartData} />
      )}
    </div>
  );
}
