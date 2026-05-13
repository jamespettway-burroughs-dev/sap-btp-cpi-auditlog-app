const express = require('express');
const router = express.Router();
const auditLogService = require('../services/auditlogService');

/**
 * GET /api/auditlog/logs
 * Retrieve audit logs with filters
 */
router.get('/logs', async (req, res) => {
  try {
    const { userId, startDate, endDate, object, action, result } = req.query;

    // Validate required parameters
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'userId, startDate, and endDate are required'
      });
    }

    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)'
      });
    }

    if (start > end) {
      return res.status(400).json({
        error: 'Invalid date range',
        message: 'startDate must be before endDate'
      });
    }

    // Build filter object
    const filters = {
      userId,
      startDate: start,
      endDate: end
    };

    if (object) filters.object = object;
    if (action) filters.action = action;
    if (result) filters.result = result;

    // Fetch audit logs
    const logs = await auditLogService.getFilteredAuditLogs(filters);

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve audit logs',
      message: error.message
    });
  }
});

/**
 * POST /api/auditlog/search
 * Search audit logs with form data
 */
router.post('/search', async (req, res) => {
  try {
    const { userId, startDate, startTime, endDate, endTime, object, action, result } = req.body;

    // Validate required fields
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'userId, startDate, and endDate are required'
      });
    }

    // Combine date and time
    const startDateTime = `${startDate}T${startTime || '00:00:00'}`;
    const endDateTime = `${endDate}T${endTime || '23:59:59'}`;

    const filters = {
      userId,
      startDate: startDateTime,
      endDate: endDateTime
    };

    if (object) filters.object = object;
    if (action) filters.action = action;
    if (result) filters.result = result;

    // Fetch audit logs
    const logs = await auditLogService.getFilteredAuditLogs(filters);

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auditlog/export
 * Export audit logs as CSV
 */
router.post('/export', async (req, res) => {
  try {
    const { userId, startDate, endDate, object, action, result } = req.body;

    const filters = {
      userId,
      startDate,
      endDate
    };

    if (object) filters.object = object;
    if (action) filters.action = action;
    if (result) filters.result = result;

    const logs = await auditLogService.getFilteredAuditLogs(filters);
    const csv = auditLogService.formatAsCSV(logs);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      error: 'Export failed',
      message: error.message
    });
  }
});

module.exports = router;
