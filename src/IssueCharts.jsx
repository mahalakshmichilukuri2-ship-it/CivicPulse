
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function IssueCharts({ issues = [] }) {
  const statusCounts = useMemo(() => {
    const counts = {
      Reported: 0,
      'In Progress': 0,
      Resolved: 0,
    };

    issues.forEach((issue) => {
      const status = issue.status || 'Reported';

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [issues]);

  const categoryCounts = useMemo(() => {
    const counts = {
      'Road Damage': 0,
      Garbage: 0,
      Streetlight: 0,
      Water: 0,
      Other: 0,
    };

    issues.forEach((issue) => {
      const category = issue.category || 'Other';

      if (Object.prototype.hasOwnProperty.call(counts, category)) {
        counts[category] += 1;
      } else {
        counts.Other += 1;
      }
    });

    return counts;
  }, [issues]);

  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Number of Issues',
        data: Object.values(statusCounts),
        backgroundColor: [
          '#f0ad4e',
          '#0dcaf0',
          '#198754',
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: 'Number of Issues',
        data: Object.values(categoryCounts),
        backgroundColor: [
          '#0d6efd',
          '#dc3545',
          '#ffc107',
          '#0dcaf0',
          '#6c757d',
        ],
        borderWidth: 1,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const barOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <section className="container pb-5" id="analytics">
      <div className="text-center mb-4">
        <h2>Community Analytics</h2>
        <p className="text-muted">
          Understand the status and categories of community reports.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title text-center mb-4">
                Issues by Status
              </h5>

              <div
                style={{
                  position: 'relative',
                  height: '300px',
                }}
              >
                <Doughnut
                  data={statusData}
                  options={commonOptions}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title text-center mb-4">
                Issues by Category
              </h5>

              <div
                style={{
                  position: 'relative',
                  height: '300px',
                }}
              >
                <Bar
                  data={categoryData}
                  options={barOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default IssueCharts;
