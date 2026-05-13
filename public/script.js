let currentLogs = [];

const form = document.getElementById('auditLogForm');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultsTable = document.getElementById('resultsTable');
const exportBtn = document.getElementById('exportBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await searchAuditLogs();
});

exportBtn.addEventListener('click', async () => {
  await exportAsCSV();
});

async function searchAuditLogs() {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  // Validate dates
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (startDate > endDate) {
    showError('Start date must be before end date');
    return;
  }

  showLoading(true);
  hideError();
  resultsDiv.style.display = 'none';

  try {
    const response = await fetch('/api/auditlog/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to retrieve audit logs');
    }

    currentLogs = result.data;
    displayResults(result.data, result.count);
    exportBtn.disabled = false;
  } catch (error) {
    showError(error.message);
    exportBtn.disabled = true;
  } finally {
    showLoading(false);
  }
}

function displayResults(logs, count) {
  const tbody = document.getElementById('resultsBody');
  tbody.innerHTML = '';

  logs.forEach(log => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(log.time).toLocaleString()}</td>
      <td>${log.user || '-'}</td>
      <td>${log.object || '-'}</td>
      <td>${log.action || '-'}</td>
      <td>
        <span class="status ${log.result ? log.result.toLowerCase() : ''}">
          ${log.result || '-'}
        </span>
      </td>
      <td>${log.message || '-'}</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('resultCount').textContent = count;
  resultsDiv.style.display = 'block';
}

async function exportAsCSV() {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch('/api/auditlog/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    showError('Failed to export audit logs');
  }
}

function showLoading(show) {
  loadingDiv.style.display = show ? 'block' : 'none';
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  errorDiv.style.display = 'block';
}

function hideError() {
  errorDiv.style.display = 'none';
}
