## Basic Structure

```json
{
  "status": [
    {
      "id": "any-id-you-want",
      "title": "Status Title",
      "message": "Status message description",
      "type": "maintenance",
      "severity": "medium",
      "services": ["Service 1", "Service 2"],
      "startTime": "Tonight at 2:00 AM",
      "endTime": "4:00 AM EST",
      "active": true
    }
  ],
  "updated": 42
}
```

## Required Fields

- **id**: Any unique string (e.g. maint-1, server-down, update-123)
- **title**
- **message**

## Optional Fields

- **type**: Status type (`maintenance`, `outage`, `degraded`, `resolved`, `info`)
- **severity**: Severity level (`low`, `medium`, `high`, `critical`)
- **services**: Array of affected services
- **startTime**: Any string
- **endTime**: Any string
- **active**: Boolean showwing if the status is currently active

## Special Features

### Version Number
The `updated` field is now just a number that can be incremented each time the update the status (e.g., 1, 2, 3, 42, etc.)

## Status Types

- **maintenance**
- **outage**
- **degraded**
- **resolved**
- **info**

## Severity Levels

- **low**
- **medium**
- **high**
- **critical**

## Example Statuses

### All Systems Operational
```json
{
  "id": "all-good",
  "title": "All Systems Operational",
  "message": "All services are running smoothly.",
  "type": "info",
  "severity": "low",
  "active": true
}
```

### Maintenance Window
```json
{
  "id": "maint-tonight",
  "title": "Scheduled Server Maintenance",
  "message": "Routine maintenance to improve performance and security.",
  "type": "maintenance",
  "severity": "medium",
  "services": ["Game Server"],
  "startTime": "Tonight at 2:00 AM",
  "endTime": "4:00 AM EST",
  "active": true
}
```

### Service Outage
```json
{
  "id": "auth-down",
  "title": "Authentication Service Down",
  "message": "Login services are temporarily unavailable.",
  "type": "outage",
  "severity": "critical",
  "services": ["Authentication"],
  "startTime": "10:30 AM",
  "active": true
}
```

### Resolved Issue
```json
{
  "id": "connection-fixed",
  "title": "Connection Issues Resolved",
  "message": "All connection problems have been fixed.",
  "type": "resolved",
  "severity": "low",
  "services": ["Game Server"],
  "startTime": "Yesterday 9:00 AM",
  "endTime": "11:30 AM",
  "active": false
}
```
