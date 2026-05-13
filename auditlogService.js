const axios = require('axios');
const qs = require('qs');

class AuditLogService {
  constructor() {
    this.baseURL = `https://${process.env.AUDITLOG_API_HOST}${process.env.AUDITLOG_API_PATH}`;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Authenticate with BTP and get access token
   */
  async authenticate() {
    try {
      // Check if token is still valid
      if (this.accessToken && this.tokenExpiry > Date.now()) {
        return this.accessToken;
      }

      const authUrl = `https://${process.env.BTP_HOST}/oauth/token`;
      
      const response = await axios.post(
        authUrl,
        qs.stringify({
          grant_type: 'password',
          client_id: 'sb-clone-auditlog-xsuaa-app!b123|auditlog-xsuaa!b123',
          client_secret: process.env.BTP_PASSWORD,
          username: process.env.BTP_USERNAME,
          password: process.env.BTP_PASSWORD
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Authentication failed:', error.message);
      throw new Error('Failed to authenticate with SAP BTP');
    }
  }

  /**
   * Retrieve audit logs for a specific user and date range
   */
  async getAuditLogs(userId, startDate, endDate) {
    try {
      const token = await this.authenticate();

      // Convert dates to ISO format if needed
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate).toISOString();

      const config = {
        method: 'get',
        url: `${this.baseURL}/auditlog/logs`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          'user': userId,
          'time_from': start,
          'time_to': end
        }
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error.message);
      throw error;
    }
  }

  /**
   * Retrieve filtered audit logs with additional parameters
   */
  async getFilteredAuditLogs(filters) {
    try {
      const token = await this.authenticate();

      // Build query parameters
      const params = {};
      
      if (filters.userId) params.user = filters.userId;
      if (filters.startDate) params.time_from = new Date(filters.startDate).toISOString();
      if (filters.endDate) params.time_to = new Date(filters.endDate).toISOString();
      if (filters.object) params.object = filters.object;
      if (filters.action) params.action = filters.action;
      if (filters.result) params.result = filters.result;

      const config = {
        method: 'get',
        url: `${this.baseURL}/auditlog/logs`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: params
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered audit logs:', error.message);
      throw error;
    }
  }

  /**
   * Export audit logs to CSV format
   */
  formatAsCSV(logs) {
    if (!logs || logs.length === 0) {
      return 'No audit logs found';
    }

    const headers = ['Timestamp', 'User', 'Object', 'Action', 'Result', 'Message'];
    const rows = logs.map(log => [
      log.time,
      log.user,
      log.object,
      log.action,
      log.result,
      log.message || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }
}

module.exports = new AuditLogService();
