import Layout from '../../components/Layout';
import Chart from '../../components/Chart';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios.get('/api/admin/analytics').then(res => {
      setStats(res.data);
      // For attendance analytics per class or department
      setChartData({
        labels: res.data.attendancePerClass.map(c => c.className),
        data: res.data.attendancePerClass.map(c => c.count),
      });
    });
  }, []);

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-6">Analytics Dashboard</h1>
      {!stats ? (
        <div>Not enough data to display analytics yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded shadow p-4 flex flex-col items-center">
              <span className="font-bold text-lg">Total Students</span>
              <span className="text-2xl">{stats.students}</span>
            </div>
            <div className="bg-white rounded shadow p-4 flex flex-col items-center">
              <span className="font-bold text-lg">Active Volunteers</span>
              <span className="text-2xl">{stats.volunteers}</span>
            </div>
            <div className="bg-white rounded shadow p-4 flex flex-col items-center">
              <span className="font-bold text-lg">Files Uploaded</span>
              <span className="text-2xl">{stats.files}</span>
            </div>
            <div className="bg-white rounded shadow p-4 flex flex-col items-center">
              <span className="font-bold text-lg">Attendance Entries</span>
              <span className="text-2xl">{stats.attendance}</span>
            </div>
          </div>
          {chartData && <Chart labels={chartData.labels} data={chartData.data} label="Attendance Records per Class" />}
        </>
      )}
    </Layout>
  );
}