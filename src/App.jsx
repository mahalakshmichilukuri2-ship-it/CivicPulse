import './App.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState, useEffect } from 'react';
import ReportIssue from './ReportIssue';
import IssueCharts from './IssueCharts';
import Login from './Login';

const ITEMS_PER_PAGE = 6;

function App() {
  const [issues, setIssues] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpulse-issues');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading reports:', error);
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpulse-notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    localStorage.setItem('civicpulse-issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem(
      'civicpulse-notifications',
      JSON.stringify(notifications)
    );
  }, [notifications]);

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  function markNotificationAsRead(notificationId) {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  function markAllNotificationsAsRead() {
    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, read: true }))
    );
  }

  function handleLogout() {
    setCurrentUser(null);
    setShowReportForm(false);
    setSelectedIssue(null);
    setSuccessMessage('');
    clearFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goHome() {
    setShowReportForm(false);
    setSelectedIssue(null);
  }

  function openReportForm() {
    setShowReportForm(true);
    setSelectedIssue(null);
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleReportSubmit(newIssue) {
    setIssues((previous) => [newIssue, ...previous]);
    setShowReportForm(false);
    setSelectedIssue(null);
    setCurrentPage(1);
    setSuccessMessage('Your report has been submitted successfully!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDelete(issueId) {
    if (!isAdmin) return;

    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    setIssues((previous) =>
      previous.filter((issue) => issue.id !== issueId)
    );

    setSelectedIssue(null);
    setSuccessMessage('Report deleted successfully!');
  }

  function handleStatusChange(issueId, newStatus) {
    if (!isAdmin) return;

    const existingIssue = issues.find((issue) => issue.id === issueId);
    const oldStatus = existingIssue?.status || 'Reported';

    if (!existingIssue || oldStatus === newStatus) return;

    setIssues((previous) =>
      previous.map((issue) =>
        issue.id === issueId
          ? { ...issue, status: newStatus }
          : issue
      )
    );

    setSelectedIssue((previous) =>
      previous?.id === issueId
        ? { ...previous, status: newStatus }
        : previous
    );

    // Save a notification for the Citizen when Admin changes a report status.
    const notificationMessages = {
      'In Progress': `Your report "${existingIssue.title}" is now In Progress.`,
      Resolved: `Your report "${existingIssue.title}" has been resolved.`,
      Reported: `The status of your report "${existingIssue.title}" was changed to Reported.`
    };

    const newNotification = {
      id: `${Date.now()}-${issueId}`,
      issueId,
      title: newStatus === 'Resolved'
        ? 'Issue Resolved'
        : newStatus === 'In Progress'
          ? 'Issue In Progress'
          : 'Issue Status Updated',
      message: notificationMessages[newStatus] ||
        `The status of your report "${existingIssue.title}" has been updated to ${newStatus}.`,
      status: newStatus,
      createdAt: new Date().toISOString(),
      read: false
    };

    setNotifications((previous) => [newNotification, ...previous]);
    setSuccessMessage(`Report status changed to ${newStatus}.`);
  }

  function handleEdit(issue) {
    if (!isAdmin) return;

    const title = window.prompt('Enter report title:', issue.title);
    if (title === null) return;

    if (!title.trim()) {
      setSuccessMessage('Report title cannot be empty.');
      return;
    }

    const location = window.prompt('Enter location:', issue.location);
    if (location === null) return;

    if (!location.trim()) {
      setSuccessMessage('Location cannot be empty.');
      return;
    }

    const description = window.prompt(
      'Enter description:',
      issue.description
    );
    if (description === null) return;

    if (!description.trim()) {
      setSuccessMessage('Description cannot be empty.');
      return;
    }

    const updatedIssue = {
      ...issue,
      title: title.trim(),
      location: location.trim(),
      description: description.trim(),
    };

    setIssues((previous) =>
      previous.map((item) =>
        item.id === issue.id ? updatedIssue : item
      )
    );

    setSelectedIssue((previous) =>
      previous?.id === issue.id ? updatedIssue : previous
    );

    setSuccessMessage('Report updated successfully!');
  }

  function handleExportCSV() {
    if (!isAdmin) return;

    if (issues.length === 0) {
      setSuccessMessage('There are no reports to export.');
      return;
    }

    const headers = [
      'ID',
      'Title',
      'Category',
      'Location',
      'Description',
      'Status',
    ];

    function escapeCSV(value) {
      return `"${String(value ?? '').replace(/"/g, '""')}"`;
    }

    const rows = issues.map((issue) =>
      [
        issue.id,
        issue.title,
        issue.category,
        issue.location,
        issue.description,
        issue.status || 'Reported',
      ]
        .map(escapeCSV)
        .join(',')
    );

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows,
    ].join('\r\n');

    const blob = new Blob(['\uFEFF', csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'civicpulse-reports.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setSuccessMessage('Reports exported successfully!');
  }

  function clearFilters() {
    setSearchTerm('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setSortOrder('newest');
    setCurrentPage(1);
  }

  const filteredIssues = issues.filter((issue) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (issue.title || '').toLowerCase().includes(search) ||
      (issue.location || '').toLowerCase().includes(search) ||
      (issue.description || '').toLowerCase().includes(search);

    const matchesCategory =
      categoryFilter === 'All' ||
      issue.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (issue.status || 'Reported') === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortOrder === 'oldest') {
      return Number(a.id) - Number(b.id);
    }

    if (sortOrder === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }

    return Number(b.id) - Number(a.id);
  });

  const totalPages = Math.ceil(sortedIssues.length / ITEMS_PER_PAGE);

  const safePage = Math.min(
    Math.max(currentPage, 1),
    Math.max(totalPages, 1)
  );

  const paginatedIssues = sortedIssues.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const totalIssues = issues.length;

  const reportedCount = issues.filter(
    (issue) => (issue.status || 'Reported') === 'Reported'
  ).length;

  const inProgressCount = issues.filter(
    (issue) => issue.status === 'In Progress'
  ).length;

  const resolvedCount = issues.filter(
    (issue) => issue.status === 'Resolved'
  ).length;

  function getStatusClass(status) {
    if (status === 'Resolved') return 'status-resolved';
    if (status === 'In Progress') return 'status-in-progress';
    return 'status-reported';
  }

  function ReportCard({ issue }) {
    const status = issue.status || 'Reported';
    const description = issue.description || '';

    return (
      <div className="col-12 col-md-6 col-xl-4 mb-4 issue-card-column" key={issue.id}>
        <article className="card issue-card h-100">
          {issue.image && (
            <img
              src={issue.image}
              className="card-img-top issue-card-image"
              alt={issue.title || 'Reported issue'}
              loading="lazy"
            />
          )}

          <div className="card-body issue-card-body d-flex flex-column">
            <div className="issue-card-meta">
              <span className="badge issue-category-badge">
                {issue.category || 'Other'}
              </span>

              <span className={`badge status-badge ${getStatusClass(status)}`}>
                {status}
              </span>
            </div>

            <h5 className="card-title issue-card-title">
              {issue.title || 'Untitled issue'}
            </h5>

            <p className="issue-card-location">
              <i className="bi bi-geo-alt-fill me-2" aria-hidden="true"></i>
              <span>{issue.location || 'Location not provided'}</span>
            </p>

            <p className="card-text issue-card-description">
              {description.length > 110
                ? `${description.slice(0, 110).trimEnd()}...`
                : description || 'No description provided.'}
            </p>

            {isAdmin && (
              <div className="issue-card-status-control">
                <label
                  className="form-label small fw-semibold"
                  htmlFor={`status-${issue.id}`}
                >
                  Update status
                </label>

                <select
                  id={`status-${issue.id}`}
                  className="form-select form-select-sm"
                  value={status}
                  onChange={(event) =>
                    handleStatusChange(issue.id, event.target.value)
                  }
                >
                  <option value="Reported">Reported</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            )}

            <div className="issue-card-actions d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSelectedIssue(issue);
                  setShowReportForm(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <i className="bi bi-eye me-1" aria-hidden="true"></i>
                View Details
              </button>

              {isAdmin && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleEdit(issue)}
                  >
                    <i className="bi bi-pencil me-1" aria-hidden="true"></i>
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(issue.id)}
                  >
                    <i className="bi bi-trash me-1" aria-hidden="true"></i>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Show the login screen before the main application
  if (!currentUser) {
    return (
      <>
        <Login onLogin={setCurrentUser} />

        <footer className="bg-dark text-white text-center py-3">
          <small>CivicPulse — Community Reporting Demo</small>
        </footer>
      </>
    );
  }

  return (
    <>
      {/* Original Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <div className="container">
          <a
            className="navbar-brand fw-bold"
            href="#home"
            onClick={goHome}
          >
            <i className="bi bi-geo-alt-fill me-2"></i>
            CivicPulse
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item">
                <a className="nav-link" href="#home" onClick={goHome}>
                  Home
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#dashboard"
                  onClick={goHome}
                >
                  Dashboard
                </a>
              </li>

              {currentUser.role === 'Citizen' && (
                <li className="nav-item">
                  <button
                    className="btn btn-primary mx-lg-2 my-2 my-lg-0"
                    onClick={openReportForm}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Report Issue
                  </button>
                </li>
              )}

              <li className="nav-item">
                <a className="nav-link" href="#about" onClick={goHome}>
                  About
                </a>
              </li>

              {currentUser.role === 'Citizen' && (
                <li className="nav-item notification-nav-item">
                  <button
                    type="button"
                    className="btn btn-outline-light notification-bell my-2 my-lg-0"
                    aria-label={`Notifications, ${unreadNotificationCount} unread`}
                    aria-expanded={showNotifications}
                    onClick={() => setShowNotifications((previous) => !previous)}
                  >
                    <i className="bi bi-bell"></i>
                    {unreadNotificationCount > 0 && (
                      <span className="notification-count">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="notification-dropdown">
                      <div className="notification-header">
                        <strong>Notifications</strong>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0"
                          onClick={markAllNotificationsAsRead}
                          disabled={unreadNotificationCount === 0}
                        >
                          Mark all as read
                        </button>
                      </div>

                      {notifications.length > 0 ? (
                        <div className="notification-list">
                          {notifications.map((notification) => (
                            <div
                              className={`notification-item ${
                                notification.read ? 'notification-read' : 'notification-unread'
                              }`}
                              key={notification.id}
                            >
                              <div className="d-flex align-items-start gap-2">
                                <i
                                  className={`bi ${
                                    notification.status === 'Resolved'
                                      ? 'bi-check-circle-fill text-success'
                                      : notification.status === 'In Progress'
                                        ? 'bi-tools text-primary'
                                        : 'bi-info-circle text-secondary'
                                  } notification-item-icon`}
                                ></i>
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between gap-2">
                                    <strong>{notification.title}</strong>
                                    {!notification.read && (
                                      <span className="notification-new-dot" title="Unread"></span>
                                    )}
                                  </div>
                                  <p className="mb-1">{notification.message}</p>
                                  <small className="text-muted">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </small>
                                  {!notification.read && (
                                    <button
                                      type="button"
                                      className="btn btn-link btn-sm p-0 d-block mt-1"
                                      onClick={() => markNotificationAsRead(notification.id)}
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="notification-empty">
                          <i className="bi bi-bell-slash fs-3 text-muted"></i>
                          <p className="mb-0 mt-2">No notifications yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )}

              <li className="nav-item">
                <span className="nav-link text-white">
                  {currentUser.name} ({currentUser.role === 'Admin' ? 'Admin Demo' : 'Citizen'})
                </span>
              </li>

              <li className="nav-item">
                <button
                  className="btn btn-outline-light btn-sm ms-lg-2 my-2 my-lg-0"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main>
        {successMessage && (
          <div className="container mt-3">
            <div
              className="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              {successMessage}

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setSuccessMessage('')}
              ></button>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="container mt-3">
            <div className="alert alert-info mb-0">
              <strong>Admin Demo:</strong> You can edit reports, delete
              reports, update statuses, and export reports.
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="container mt-3">
            <div className="alert alert-primary mb-0">
              <strong>Citizen Dashboard:</strong> You can submit reports
              and view community reports.
            </div>
          </div>
        )}

        {showReportForm && !isAdmin ? (
          <section className="container py-5">
            <ReportIssue
              onReportSubmit={handleReportSubmit}
              onCancel={() => setShowReportForm(false)}
            />
          </section>
        ) : selectedIssue ? (
          <section className="container py-5">
            <button
              className="btn btn-outline-secondary mb-4"
              onClick={() => setSelectedIssue(null)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Reports
            </button>

            <div className="card shadow-sm">
              {selectedIssue.image && (
                <img
                  src={selectedIssue.image}
                  alt={selectedIssue.title || 'Reported issue'}
                  className="card-img-top"
                  style={{ maxHeight: '400px', objectFit: 'cover' }}
                />
              )}

              <div className="card-body p-4">
                <span className="badge bg-secondary mb-2">
                  {selectedIssue.category || 'Other'}
                </span>

                <h2>{selectedIssue.title}</h2>

                <p>
                  <strong>Location:</strong> {selectedIssue.location}
                </p>

                <p>
                  <strong>Description:</strong>
                </p>

                <p className="text-break">{selectedIssue.description}</p>

                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`badge status-badge ${getStatusClass(
                      selectedIssue.status || 'Reported'
                    )}`}
                  >
                    {selectedIssue.status || 'Reported'}
                  </span>
                </p>

                {isAdmin && (
                  <>
                    <label className="form-label" htmlFor="detailStatus">
                      Change status
                    </label>

                    <select
                      id="detailStatus"
                      className="form-select mb-3"
                      value={selectedIssue.status || 'Reported'}
                      onChange={(event) =>
                        handleStatusChange(
                          selectedIssue.id,
                          event.target.value
                        )
                      }
                    >
                      <option value="Reported">Reported</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleEdit(selectedIssue)}
                      >
                        Edit Report
                      </button>

                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(selectedIssue.id)}
                      >
                        Delete Report
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Hero */}
            <section id="home" className="py-5 bg-light text-center">
              <div className="container py-4">
                <h1 className="display-5 fw-bold">
                  Build a Better Community with CivicPulse
                </h1>

                <p className="lead mt-3">
                  Report local problems, track their progress, and help
                  make your community a better place.
                </p>

                {currentUser.role === 'Citizen' && (
                  <button
                    className="btn btn-primary btn-lg mt-3"
                    onClick={openReportForm}
                  >
                    <i className="bi bi-megaphone me-2"></i>
                    Report a Problem
                  </button>
                )}
              </div>
            </section>

            {/* Dashboard */}
            <section id="dashboard" className="container py-5">
              <div className="text-center mb-4">
                <h2>Community Dashboard</h2>
                <p className="text-muted">
                  Overview of community problems
                </p>
              </div>

              <div className="row g-4">
                <div className="col-6 col-lg-3">
                  <div className="card shadow-sm h-100 text-center">
                    <div className="card-body">
                      <i className="bi bi-clipboard-data fs-2 text-primary"></i>
                      <h3 className="mt-2">{totalIssues}</h3>
                      <p className="text-muted mb-0">Total Issues</p>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-lg-3">
                  <div className="card shadow-sm h-100 text-center">
                    <div className="card-body">
                      <i className="bi bi-exclamation-circle fs-2 text-warning"></i>
                      <h3 className="mt-2">{reportedCount}</h3>
                      <p className="text-muted mb-0">Reported</p>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-lg-3">
                  <div className="card shadow-sm h-100 text-center">
                    <div className="card-body">
                      <i className="bi bi-hourglass-split fs-2 text-info"></i>
                      <h3 className="mt-2">{inProgressCount}</h3>
                      <p className="text-muted mb-0">In Progress</p>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-lg-3">
                  <div className="card shadow-sm h-100 text-center">
                    <div className="card-body">
                      <i className="bi bi-check-circle fs-2 text-success"></i>
                      <h3 className="mt-2">{resolvedCount}</h3>
                      <p className="text-muted mb-0">Resolved</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Charts */}
            <IssueCharts issues={issues} />

            {/* Common Community Issues */}
            <section className="container pb-5">
              <div className="text-center mb-4">
                <h2>Common Community Issues</h2>
                <p className="text-muted">
                  Help bring attention to problems in your area.
                </p>
              </div>

              <div className="row g-4">
                {[
                  {
                    icon: 'bi-cone-striped',
                    title: 'Road Damage',
                    description: 'Report potholes and damaged roads.',
                  },
                  {
                    icon: 'bi-trash',
                    title: 'Garbage',
                    description: 'Report overflowing bins and waste.',
                  },
                  {
                    icon: 'bi-lightbulb',
                    title: 'Streetlight',
                    description: 'Report broken streetlights.',
                  },
                  {
                    icon: 'bi-droplet',
                    title: 'Water',
                    description: 'Report leaks and water supply problems.',
                  },
                ].map((item) => (
                  <div className="col-sm-6 col-lg-3" key={item.title}>
                    <div className="card h-100 text-center shadow-sm">
                      <div className="card-body">
                        <i className={`bi ${item.icon} fs-1 text-primary`}></i>
                        <h5 className="mt-3">{item.title}</h5>
                        <p className="text-muted">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Community Reports */}
            <section id="reports" className="container py-5">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <h2 className="mb-1">Community Reports</h2>
                  <p className="text-muted mb-0">
                    Browse and manage reported issues.
                  </p>
                </div>

                {isAdmin && (
                  <button
                    className="btn btn-success"
                    onClick={handleExportCSV}
                    disabled={issues.length === 0}
                  >
                    <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                    Export All Reports (CSV)
                  </button>
                )}
              </div>

              {/* Search and filters */}
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6 col-lg-3">
                      <label className="form-label" htmlFor="searchReports">
                        Search reports
                      </label>
                      <input
                        id="searchReports"
                        type="search"
                        className="form-control"
                        placeholder="Search title, location..."
                        value={searchTerm}
                        onChange={(event) => {
                          setSearchTerm(event.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    <div className="col-md-6 col-lg-3">
                      <label className="form-label" htmlFor="categoryFilter">
                        Category
                      </label>
                      <select
                        id="categoryFilter"
                        className="form-select"
                        value={categoryFilter}
                        onChange={(event) => {
                          setCategoryFilter(event.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="All">All Categories</option>
                        <option value="Road Damage">Road Damage</option>
                        <option value="Garbage">Garbage</option>
                        <option value="Streetlight">Streetlight</option>
                        <option value="Water">Water</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6 col-lg-3">
                      <label className="form-label" htmlFor="statusFilter">
                        Status
                      </label>
                      <select
                        id="statusFilter"
                        className="form-select"
                        value={statusFilter}
                        onChange={(event) => {
                          setStatusFilter(event.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="All">All Statuses</option>
                        <option value="Reported">Reported</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="col-md-6 col-lg-3">
                      <label className="form-label" htmlFor="sortOrder">
                        Sort by
                      </label>
                      <select
                        id="sortOrder"
                        className="form-select"
                        value={sortOrder}
                        onChange={(event) => {
                          setSortOrder(event.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="title">Title A–Z</option>
                      </select>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
                    <p className="text-muted mb-0">
                      Showing {sortedIssues.length} of {totalIssues} reports
                    </p>

                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {paginatedIssues.length > 0 ? (
                <>
                  <div className="row">
                    {paginatedIssues.map((issue) => (
                      <ReportCard key={issue.id} issue={issue} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <nav className="mt-4" aria-label="Report pagination">
                      <ul className="pagination justify-content-center flex-wrap">
                        <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            disabled={safePage === 1}
                            onClick={() => {
                              setCurrentPage(safePage - 1);
                              document.getElementById('reports')?.scrollIntoView({
                                behavior: 'smooth',
                              });
                            }}
                          >
                            Previous
                          </button>
                        </li>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (page) => (
                            <li
                              key={page}
                              className={`page-item ${safePage === page ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => {
                                  setCurrentPage(page);
                                  document.getElementById('reports')?.scrollIntoView({
                                    behavior: 'smooth',
                                  });
                                }}
                              >
                                {page}
                              </button>
                            </li>
                          )
                        )}

                        <li className={`page-item ${safePage === totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            disabled={safePage === totalPages}
                            onClick={() => {
                              setCurrentPage(safePage + 1);
                              document.getElementById('reports')?.scrollIntoView({
                                behavior: 'smooth',
                              });
                            }}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <h4 className="mt-3">No reports found</h4>
                  <p className="text-muted">
                    {issues.length === 0
                      ? 'No issues have been reported yet.'
                      : 'Try changing your search or filters.'}
                  </p>

                  {issues.length > 0 ? (
                    <button className="btn btn-outline-primary" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  ) : currentUser.role === 'Citizen' ? (
                    <button className="btn btn-primary" onClick={openReportForm}>
                      Report First Issue
                    </button>
                  ) : null}
                </div>
              )}
            </section>

            {/* About */}
            <section id="about" className="bg-light py-5">
              <div className="container text-center">
                <h2>About CivicPulse</h2>
                <p className="lead mt-3 mx-auto">
                  CivicPulse helps communities report local problems
                  and monitor their progress. Our goal is to make
                  community problem reporting simple, transparent,
                  and accessible.
                </p>

                {currentUser.role === 'Citizen' && (
                  <button className="btn btn-primary mt-2" onClick={openReportForm}>
                    Help Your Community
                  </button>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          <h5 className="fw-bold">CivicPulse</h5>
          <p className="mb-2">
            Together, we can build a better community.
          </p>
          <small className="text-white-50">
            © {new Date().getFullYear()} CivicPulse. All rights reserved.
          </small>
        </div>
      </footer>
    </>
  );
}

export default App;
