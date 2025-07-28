const axios = require('axios');
const Employee = require('../models/Employee');

class EmployeeScreenshotService {
  constructor() {
    this.EMPLOYEE_APP_PORT = 3003;
  }

  // Take screenshot for a specific employee
  async takeScreenshot(employeeId, timeLogId = null) {
    try {
      // Get employee's IP address from database
      const employee = await Employee.findById(employeeId).select('ipAddress');
      
      if (!employee) {
        console.log(`Employee not found: ${employeeId}`);
        return {
          success: false,
          error: 'Employee not found'
        };
      }
      
      if (!employee.ipAddress) {
        console.log(`No IP address for employee: ${employeeId}`);
        return {
          success: false,
          error: 'Employee IP address not available. Please ask employee to log in again.'
        };
      }
      
      // Use employee's IP address instead of localhost
      const targetURL = `http://${employee.ipAddress}:${this.EMPLOYEE_APP_PORT}/screenshot`;
      
      // console.log(`Taking screenshot from ${targetURL} for employee: ${employeeId}`);
      // console.log(`Employee IP: ${employee.ipAddress}, Port: ${this.EMPLOYEE_APP_PORT}`);
      
      // Take screenshot via HTTP request
      const response = await axios.post(targetURL, {
        employeeId,
        timeLogId,
        adminRequest: true
      }, {
        timeout: 30000 // 30 second timeout
      });
      
      return response.data;
      
    } catch (error) {
      console.error(`Error taking screenshot for employee ${employeeId}:`, error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        response: error.response?.status,
        responseData: error.response?.data
      });
      
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
          error: 'Employee desktop app is not running or not accessible'
        };
      } else if (error.code === 'ENOTFOUND') {
        return {
          success: false,
          error: 'Employee IP address not reachable. Employee may be offline.'
        };
      } else if (error.code === 'ETIMEDOUT') {
        return {
          success: false,
          error: 'Connection timeout. Employee app may be offline or firewall is blocking connection.'
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