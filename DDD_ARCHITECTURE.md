# Bion Logistics - DDD Architecture

## Overview
This application follows Domain-Driven Design (DDD) principles with role-based access control for Admin and Operator users.

## Architecture Layers

### 1. Domain Layer (`app/Domain/`)
Contains business logic and domain entities.

- **Domain/Shared/Location.php** - Value object for GPS coordinates (latitude/longitude)
- **Domain/Referrer/ReferrerRepositoryInterface.php** - Repository contract for Referrer
- **Domain/CollectRequest/CollectRequestRepositoryInterface.php** - Repository contract for CollectRequest

### 2. Application Layer (`app/Application/`)
Contains application services that orchestrate domain logic.

#### Admin Services:
- **Application/Admin/ReferrerManagementService.php** - CRUD operations for referrers
- **Application/Admin/CollectRequestAssignmentService.php** - Assign collect requests to operators

#### Operator Services:
- **Application/Operator/CollectRequestOperationService.php** - Start/end collection operations

### 3. Infrastructure Layer (`app/Infrastructure/`)
Contains technical implementations.

- **Infrastructure/Repositories/ReferrerRepository.php** - Eloquent implementation for Referrer
- **Infrastructure/Repositories/CollectRequestRepository.php** - Eloquent implementation for CollectRequest

### 4. Presentation Layer (`app/Http/Controllers/`)
RESTful API controllers.

#### Admin Controllers:
- **Api/Admin/ReferrerController.php** - Referrer management endpoints
- **Api/Admin/CollectRequestAssignmentController.php** - Assignment and creation endpoints

#### Operator Controllers:
- **Api/Operator/CollectRequestController.php** - Collection operation endpoints

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User name
- `email` - Email (unique)
- `password` - Hashed password
- **`role`** - Enum: 'admin' or 'operator'
- `created_at`, `updated_at`

### Referrers Table
- `id` - Primary key
- `name` - Referrer name
- `address` - Physical address (nullable)
- `latitude` - GPS latitude (nullable, decimal 10,8)
- `longitude` - GPS longitude (nullable, decimal 11,8)
- `created_at`, `updated_at`

### Devices Table
- `id` - Primary key
- `mac` - MAC address (unique)
- `created_at`, `updated_at`

### Collect Requests Table
- `id` - Primary key
- `user_id` - Foreign key to users (assigned operator)
- **`referrer_id`** - Foreign key to referrers (nullable)
- `server_id` - Server identifier (nullable)
- `device_id` - Foreign key to devices (nullable)
- `started_at` - Collection start timestamp (nullable)
- `ended_at` - Collection end timestamp (nullable)
- `barcodes` - JSON array of scanned barcodes
- `created_at`, `updated_at`

### Temperature Logs Table
- `id` - Primary key
- `device_id` - Foreign key to devices
- `value` - Temperature value (decimal 8,2)
- `timestamp` - Temperature reading timestamp
- `created_at`, `updated_at`

## API Endpoints

### Admin Routes (prefix: `/api/admin`, middleware: `auth:sanctum`, `role:admin`)

#### Referrer Management
- `GET /api/admin/referrers` - List all referrers
- `POST /api/admin/referrers` - Create referrer
- `GET /api/admin/referrers/{id}` - Get referrer details
- `PUT /api/admin/referrers/{id}` - Update referrer
- `DELETE /api/admin/referrers/{id}` - Delete referrer

#### Collect Request Management
- `GET /api/admin/collect-requests` - View all collect requests
- `POST /api/admin/collect-requests` - Create collect request
- `DELETE /api/admin/collect-requests/{id}` - Delete collect request
- `GET /api/admin/operators` - Get list of operators
- `POST /api/admin/collect-requests/assign` - Assign request to operator

### Operator Routes (prefix: `/api/operator`, middleware: `auth:sanctum`, `role:operator`)

- `GET /api/operator/collect-requests` - View assigned requests only
- `POST /api/operator/collect-requests/start` - Start collection (scan barcodes)
- `POST /api/operator/collect-requests/end` - End collection (upload temperature data)

## Role-Based Permissions

### Admin Can:
✅ Create, update, delete referrers with location data
✅ View all collect requests across all operators
✅ Create collect requests
✅ Assign collect requests to operators
✅ Delete any collect request

### Operator Can:
✅ View only their assigned collect requests
✅ Start new collections (scan barcodes)
✅ End collections (upload Excel/CSV with temperature data)
❌ Cannot view other operators' requests
❌ Cannot manage referrers
❌ Cannot assign requests

## Temperature Data Upload Format

**Excel/CSV File Structure:**
- **Cell D1**: Device MAC address
- **Column A**: Date/Time (starting from row 2)
- **Column B**: Temperature Value (starting from row 2)
- **Row 1**: Headers

**Example:**
```
| A (DateTime)        | B (Value) | C | D (MAC Address) |
|---------------------|-----------|---|-----------------|
| Date/Time           | Temp      |   | AA:BB:CC:DD:EE |
| 2025-10-22 10:00:00 | 23.5      |   |                 |
| 2025-10-22 10:05:00 | 23.8      |   |                 |
```

## Middleware

**EnsureUserHasRole** - Validates user has required role(s)
- Usage: `->middleware(['role:admin'])`
- Usage: `->middleware(['role:operator'])`
- Usage: `->middleware(['role:admin,operator'])` (multiple roles)

## Service Provider

**RepositoryServiceProvider** - Binds repository interfaces to implementations
- Registered in `bootstrap/providers.php`

## Next Steps

1. ✅ Complete Admin UI for referrer management
2. ✅ Complete Admin UI for collect request assignment
3. ✅ Update Operator UI to use new role-based endpoints
4. ✅ Add role-based navigation in React layout
