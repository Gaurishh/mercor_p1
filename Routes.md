# API Endpoints Documentation

This document outlines the available API endpoints, their functionalities, and expected request/response formats.

---

## 1. Authentication Routes (`/api/auth`)

These endpoints handle user authentication, account management, and password recovery.

### `POST /api/auth/signup`

* **Purpose:** Creates a new employee account, hashes the password, sends a verification email, and returns employee data without sensitive information.
* **Data Passed:**
    ```json
    {
        "firstName": "string",
        "lastName": "string",
        "gender": "string",
        "email": "string",
        "password": "string",
        "isAdmin": "boolean (optional)",
        "isActive": "boolean (optional)"
    }
    ```
* **Returns:**
    ```json
    {
        "message": "string",
        "employee": {
            "_id": "string",
            "firstName": "string",
            "lastName": "string",
            "email": "string",
            "isAdmin": "boolean",
            "isActive": "boolean",
            "emailVerified": "boolean"
        }
    }
    ```

### `POST /api/auth/signin`

* **Purpose:** Authenticates employee login, validates credentials, and checks account status and email verification.
* **Data Passed:**
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
* **Returns:**
    ```json
    {
        "message": "string",
        "employee": {
            "_id": "string",
            "firstName": "string",
            "lastName": "string",
            "email": "string",
            "isAdmin": "boolean",
            "isActive": "boolean",
            "emailVerified": "boolean"
        }
    }
    ```

### `GET /api/auth/verify-email/:token`

* **Purpose:** Verifies an email address using a token, updates employee verification status, and deletes the used token.
* **Data Passed:** `token` (URL parameter)
* **Returns:**
    ```json
    {
        "message": "string",
        "employee": {
            "_id": "string",
            "firstName": "string",
            "lastName": "string",
            "email": "string",
            "isAdmin": "boolean",
            "isActive": "boolean",
            "emailVerified": "boolean"
        }
    }
    ```

### `POST /api/auth/forgot-password`

* **Purpose:** Initiates the password reset process, generates a secure token, and sends a reset email.
* **Data Passed:**
    ```json
    {
        "email": "string"
    }
    ```
* **Returns:**
    ```json
    {
        "message": "string"
    }
    ```
    *(Note: Always returns the same message for security reasons, regardless of email existence.)*

### `POST /api/auth/reset-password/:token`

* **Purpose:** Resets the password using a token, validates password match, and hashes the new password.
* **Data Passed:**
    ```json
    {
        "newPassword": "string",
        "confirmPassword": "string"
    }
    ```
    (plus `token` as a URL parameter)
* **Returns:**
    ```json
    {
        "message": "string"
    }
    ```

### `POST /api/auth/send-activation-email`

* **Purpose:** Sends an activation email to invited employees with a custom token.
* **Data Passed:**
    ```json
    {
        "email": "string",
        "fullName": "string",
        "token": "string"
    }
    ```
* **Returns:**
    ```json
    {
        "message": "string"
    }
    ```

### `GET /api/auth/verify-activation-token/:token`

* **Purpose:** Validates an activation token and returns the associated email/name if valid.
* **Data Passed:** `token` (URL parameter)
* **Returns:**
    ```json
    {
        "valid": "boolean",
        "email": "string (optional)",
        "fullName": "string (optional)"
    }
    ```

### `POST /api/auth/activate-account/:token`

* **Purpose:** Completes account activation, creating/updating an employee with the provided password and gender.
* **Data Passed:**
    ```json
    {
        "password": "string",
        "gender": "string"
    }
    ```
    (plus `token` as a URL parameter)
* **Returns:**
    ```json
    {
        "message": "string",
        "employee": {
            "_id": "string",
            "firstName": "string",
            "lastName": "string",
            "email": "string",
            "isAdmin": "boolean",
            "isActive": "boolean",
            "emailVerified": "boolean"
        }
    }
    ```

---

## 2. Employee Routes (`/api/employees`)

These endpoints manage employee records and related actions.

### `POST /api/employees`

* **Purpose:** Creates a new employee account with a hashed password.
* **Data Passed:**
    ```json
    {
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "gender": "string",
        "password": "string"
    }
    ```
* **Returns:** Employee object (without password hash)

### `GET /api/employees`

* **Purpose:** Retrieves all employee records for the admin dashboard.
* **Data Passed:** None
* **Returns:** Array of all employees (without password hashes)

### `GET /api/employees/working-status`

* **Purpose:** Returns real-time working status for all employees based on active time logs.
* **Data Passed:** None
* **Returns:**
    ```json
    {
        "employeeId": "boolean" // mapping of employee ID to working status
    }
    ```

### `GET /api/employees/test-working`

* **Purpose:** Debug endpoint to check time log data.
* **Data Passed:** None
* **Returns:**
    ```json
    {
        "allTimeLogs": "array",
        "activeTimeLogs": "array",
        "activeTimeLogsData": "array"
    }
    ```

### `GET /api/employees/:_id`

* **Purpose:** Retrieves a specific employee by ID.
* **Data Passed:** `_id` (URL parameter)
* **Returns:** Single employee object (without password hash)

### `PUT /api/employees/:_id`

* **Purpose:** Updates employee information, handling password hashing if a new password is included.
* **Data Passed:** Employee update fields (e.g., `firstName`, `lastName`, `email`, `password` - optional) + `_id` (URL parameter)
* **Returns:** Updated employee object

### `PATCH /api/employees/:_id/add-task/:taskId`

* **Purpose:** Adds a task assignment to an employee.
* **Data Passed:** `_id` and `taskId` (URL parameters)
* **Returns:** Updated employee object

### `PATCH /api/employees/:_id/remove-task/:taskId`

* **Purpose:** Removes a task assignment from an employee.
* **Data Passed:** `_id` and `taskId` (URL parameters)
* **Returns:** Updated employee object

### `GET /api/employees/:_id/tasks`

* **Purpose:** Retrieves all tasks assigned to a specific employee.
* **Data Passed:** `_id` (URL parameter)
* **Returns:** Array of tasks with project information

### `GET /api/employees/:_id/screenshots`

* **Purpose:** Retrieves all screenshots taken by a specific employee.
* **Data Passed:** `_id` (URL parameter)
* **Returns:** Array of screenshots for the employee

### `PATCH /api/employees/:_id/toggle-status`

* **Purpose:** Toggles an employee's active/inactive status.
* **Data Passed:** `_id` (URL parameter)
* **Returns:** Updated employee object

### `POST /api/employees/update-ip`

* **Purpose:** Updates an employee's IP address and MAC address for tracking.
* **Data Passed:**
    ```json
    {
        "employeeId": "string",
        "ipAddress": "string",
        "macAddress": "string (optional)"
    }
    ```
* **Returns:**
    ```json
    {
        "success": "boolean",
        "employee": "object",
        "message": "string"
    }
    ```

### `GET /api/employees/test-ip/:employeeId`

* **Purpose:** Debug endpoint to check employee IP/MAC data.
* **Data Passed:** `employeeId` (URL parameter)
* **Returns:**
    ```json
    {
        "employeeId": "string",
        "ipAddress": "string",
        "macAddress": "string",
        "lastLoginAt": "datetime",
        "hasIP": "boolean",
        "hasMAC": "boolean"
    }
    ```

### `PATCH /api/employees/toggle-self-status`

* **Purpose:** Allows an employee to toggle their own active status.
* **Data Passed:**
    ```json
    {
        "employeeId": "string"
    }
    ```
* **Returns:**
    ```json
    {
        "success": "boolean",
        "employee": "object",
        "message": "string"
    }
    ```

---

## 3. Project Routes (`/api/projects`)

These endpoints manage project records.

### `GET /api/projects`

* **Purpose:** Retrieves all project records.
* **Data Passed:** None
* **Returns:** Array of all projects

### `POST /api/projects`

* **Purpose:** Creates a new project with optional task assignments.
* **Data Passed:**
    ```json
    {
        "name": "string",
        "description": "string",
        "taskIds": "array of strings (optional)"
    }
    ```
* **Returns:** Created project object

### `PUT /api/projects/:_id`

* **Purpose:** Updates project name and description.
* **Data Passed:**
    ```json
    {
        "name": "string",
        "description": "string"
    }
    ```
    (plus `_id` as a URL parameter)
* **Returns:** Updated project object

### `DELETE /api/projects/:_id`

* **Purpose:** Deletes a project and all associated tasks.
* **Data Passed:** `_id` (URL parameter)
* **Returns:**
    ```json
    {
        "message": "string"
    }
    ```

---

## 4. Task Routes (`/api/tasks`)

These endpoints manage task records and assignments.

### `GET /api/tasks`

* **Purpose:** Retrieves all task records.
* **Data Passed:** None
* **Returns:** Array of all tasks

### `POST /api/tasks`

* **Purpose:** Creates a new task and adds it to the specified project.
* **Data Passed:**
    ```json
    {
        "projectId": "string",
        "name": "string",
        "description": "string",
        "employeeIds": "array of strings (optional)"
    }
    ```
* **Returns:** Created task object

### `PUT /api/tasks/:_id`

* **Purpose:** Updates task details and synchronizes employee assignments.
* **Data Passed:**
    ```json
    {
        "name": "string (optional)",
        "description": "string (optional)",
        "projectId": "string (optional)",
        "employeeIds": "array of strings (optional)"
    }
    ```
    (plus `_id` as a URL parameter)
* **Returns:** Updated task object

### `DELETE /api/tasks/:_id`

* **Purpose:** Deletes a task and removes it from its project.
* **Data Passed:** `_id` (URL parameter)
* **Returns:**
    ```json
    {
        "message": "string"
    }
    ```

### `PATCH /api/tasks/:_id/assign-employee`

* **Purpose:** Adds an employee to a task's worked-on list.
* **Data Passed:**
    ```json
    {
        "employeeId": "string"
    }
    ```
    (plus `_id` as a URL parameter)
* **Returns:** Updated task object

### `PATCH /api/tasks/:_id/complete`

* **Purpose:** Marks a task as completed by the specified employee.
* **Data Passed:**
    ```json
    {
        "employeeId": "string"
    }
    ```
    (plus `_id` as a URL parameter)
* **Returns:** Updated task object

### `PATCH /api/tasks/:_id/uncomplete`

* **Purpose:** Marks a task as incomplete (only by the employee who completed it).
* **Data Passed:**
    ```json
    {
        "employeeId": "string"
    }
    ```
    (plus `_id` as a URL parameter)
* **Returns:** Updated task object

---

## 5. Screenshot Routes (`/api/screenshots`)

These endpoints manage screenshot capture and storage.

### `GET /api/screenshots`

* **Purpose:** Retrieves all screenshots for a specific employee.
* **Data Passed:** `employeeId` (query parameter)
* **Returns:** Array of screenshots for the employee

### `POST /api/screenshots/remote-take`

* **Purpose:** Takes a screenshot remotely via the employee's Electron app and uploads it to Cloudinary.
* **Data Passed:**
    ```json
    {
        "employeeId": "string",
        "timeLogId": "string (optional)"
    }
    ```
* **Returns:**
    ```json
    {
        "success": "boolean",
        "screenshot": "object",
        "originalSize": "number",
        "compressedSize": "number",
        "compressionRatio": "number"
    }
    ```

### `POST /api/screenshots/upload`

* **Purpose:** Uploads an existing screenshot file to Cloudinary.
* **Data Passed:**
    ```json
    {
        "filePath": "string",
        "employeeId": "string",
        "filename": "string"
    }
    ```
* **Returns:**
    ```json
    {
        "success": "boolean",
        "url": "string",
        "publicId": "string",
        "size": "number",
        "width": "number",
        "height": "number",
        "format": "string"
    }
    ```

### `POST /api/screenshots`

* **Purpose:** Saves screenshot metadata to the database.
* **Data Passed:** Screenshot metadata object (details not specified, but likely includes `url`, `publicId`, `employeeId`, `timeLogId`, etc.)
* **Returns:** Created screenshot object

### `POST /api/screenshots/permission-denied`

* **Purpose:** Records when screenshot permission is denied by Windows.
* **Data Passed:**
    ```json
    {
        "employeeId": "string",
        "timeLogId": "string (optional)"
    }
    ```
* **Returns:**
    ```json
    {
        "success": "boolean",
        "message": "string"
    }
    ```

---

## 6. Time Log Routes (`/api/timelogs`)

These endpoints manage employee time tracking.

### `GET /api/timelogs`

* **Purpose:** Retrieves all time logs for a specific employee.
* **Data Passed:** `employeeId` (query parameter)
* **Returns:** Array of time logs for the employee

### `POST /api/timelogs`

* **Purpose:** Creates a new time log entry (clock-in) for an employee.
* **Data Passed:**
    ```json
    {
        "employeeId": "string",
        "taskIds": "array of strings (optional)"
    }
    ```
* **Returns:**
    ```json
    {
        "_id": "string"
    }
    ```

### `PATCH /api/timelogs/:_id/clockout`

* **Purpose:** Updates a time log with a clock-out timestamp.
* **Data Passed:** `_id` (URL parameter)
* **Returns:** Updated time log object
