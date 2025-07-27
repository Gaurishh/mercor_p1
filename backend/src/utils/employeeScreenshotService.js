const axios = require('axios');

class EmployeeScreenshotService {
  constructor() {
    this.EMPLOYEE_APP_PORT = 3003; // Fixed port for all employee apps
  }

  // Take screenshot for a specific employee
  async takeScreenshot(employeeId, timeLogId = null) {
    try {
      // Take screenshot via HTTP request directly
      const response = await axios.post(`http://localhost:${this.EMPLOYEE_APP_PORT}/screenshot`, {
        employeeId,
        timeLogId,
        adminRequest: true
      }, {
        timeout: 30000 // 30 second timeout
      });
      
      return response.data;
      
    } catch (error) {
      console.error(`Error taking screenshot for employee ${employeeId}:`, error);
      
      if (error.response?.status === 400 && error.response?.data?.error === 'Employee ID mismatch') {
        return {
          success: false,
          error: 'Employee app is running but logged in as different employee'
        };
      } else if (error.response?.status === 400 && error.response?.data?.error === 'No employee logged in') {
        return {
          success: false,
          error: 'Employee desktop app is not logged in'
        };
      } else if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'Employee desktop app is not running'
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Screenshot permission denied by employee app'
        };
      } else {
        return {
          success: false,
          error: error.message || 'Failed to take screenshot'
        };
      }
    }
  }

  // Take screenshots for multiple employees
  async takeScreenshotsForEmployees(employeeIds, timeLogId = null) {
    const results = [];
    
    for (const employeeId of employeeIds) {
      try {
        const result = await this.takeScreenshot(employeeId, timeLogId);
        results.push({
          employeeId,
          ...result
        });
      } catch (error) {
        results.push({
          employeeId,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      results,
      summary: {
        total: employeeIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    };
  }
}

module.exports = EmployeeScreenshotService; 