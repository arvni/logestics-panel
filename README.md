# Logistics Panel

A modern web application for managing biological sample collection requests with real-time temperature monitoring, GPS tracking, and barcode scanning capabilities.

![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
![Inertia.js](https://img.shields.io/badge/Inertia.js-2.0-purple.svg)
![Material-UI](https://img.shields.io/badge/Material--UI-7.3-blue.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Mobile Support](#-mobile-support)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality

- **Collection Request Management**
  - Create, assign, and track biological sample collection requests
  - Real-time status updates (Not Started, In Progress, Completed)
  - Barcode scanning for sample identification
  - Device assignment for temperature monitoring

- **GPS Location Tracking**
  - Automatic capture of starting location when collection begins
  - Automatic capture of ending location when collection ends
  - View locations on Google Maps
  - GPS accuracy tracking

- **Temperature Monitoring**
  - Upload temperature logs from devices (CSV/Excel format)
  - Automatic parsing and storage of temperature data
  - Visual temperature graphs with time-series data
  - Temperature data linked to specific collection periods

- **Referrer Management**
  - Create and manage collection referrer locations
  - GPS coordinates for each referrer
  - Address and contact information
  - Map integration for easy location viewing

- **User Management**
  - Role-based access control (Admin, Operator)
  - User creation and management
  - Assignment of collections to operators

- **Advanced Filtering & Pagination**
  - Filter by date range, referrer, and status
  - Paginated results for better performance
  - Search and filter capabilities

### User Interface

- **Responsive Design**
  - Mobile-first approach
  - Optimized for phones, tablets, and desktops
  - Touch-friendly controls
  - Adaptive layouts

- **Modern UI/UX**
  - Material Design components
  - Intuitive navigation
  - Real-time feedback
  - Loading states and skeletons
  - Smooth animations and transitions

- **Camera & Barcode Scanning**
  - Real-time barcode scanning using device camera
  - Support for multiple barcode formats
  - Manual barcode entry option
  - Multiple barcode support per collection

## 🛠 Tech Stack

### Backend

- **Laravel 12** - PHP framework
- **MySQL** - Database
- **Inertia.js** - Modern monolith architecture
- **Laravel Breeze** - Authentication scaffolding
- **PhpSpreadsheet** - Excel/CSV file processing

### Frontend

- **React 18.2** - UI library
- **Material-UI (MUI) 7.3** - Component library
- **Recharts** - Temperature data visualization
- **React Webcam** - Camera access for barcode scanning
- **ZXing** - Barcode detection library
- **Axios** - HTTP client

### Architecture

- **Domain-Driven Design (DDD)** - Clean separation of concerns
- **Repository Pattern** - Data access abstraction
- **Service Layer** - Business logic encapsulation

## 🏗 Architecture

The project follows Domain-Driven Design (DDD) principles:

```
app/
├── Application/        # Application services
│   ├── Admin/         # Admin-specific services
│   └── Operator/      # Operator-specific services
├── Domain/            # Domain models and interfaces
│   └── CollectRequest/
├── Http/              # Controllers and middleware
│   ├── Controllers/
│   │   ├── Api/
│   │   └── Auth/
│   └── Middleware/
├── Infrastructure/    # Infrastructure implementations
│   └── Repositories/
└── Models/           # Eloquent models
```

## 📦 Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18.x
- npm or yarn
- MySQL >= 8.0
- Git

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd logistics-panel
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### 3. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup

Update your `.env` file with database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=logistics_panel
DB_USERNAME=root
DB_PASSWORD=your_password
```

Run migrations:

```bash
php artisan migrate
```

### 5. Seed Database (Optional)

```bash
# Seed with test data
php artisan db:seed --class=ReferrerSeeder
php artisan db:seed --class=TestDataSeeder
```

### 6. Build Assets

```bash
# Development
npm run dev

# Production
npm run build
```

### 7. Start the Application

```bash
# Using Laravel's built-in server
php artisan serve

# Or using the composer script (includes queue worker and logs)
composer run dev
```

The application will be available at `http://localhost:8000`

## ⚙️ Configuration

### Storage Setup

Create symbolic link for public storage:

```bash
php artisan storage:link
```

### Queue Configuration

The application uses database queues. To process jobs:

```bash
php artisan queue:work
```

For development, the `composer run dev` command includes the queue worker.

## 📖 Usage

### Default Users

After seeding, you can use these default credentials:

**Admin Account:**
- Email: `admin@example.com`
- Password: `password`

**Operator Account:**
- Email: `operator@example.com`
- Password: `password`

### Admin Workflow

1. **Create Referrers**
   - Navigate to Admin → Referrers
   - Add new referrer with location details

2. **Manage Users**
   - Navigate to Admin → Users
   - Create operator accounts

3. **Create Collection Requests**
   - Navigate to Admin → Assignments
   - Assign requests to operators

4. **Monitor Collections**
   - View all active and completed collections
   - Track progress in real-time

### Operator Workflow

1. **View Assigned Collections**
   - See all collections assigned to you
   - Filter by status, date, or referrer

2. **Start Collection**
   - Click "Start Collection"
   - Scan barcodes using camera
   - Location is automatically captured
   - Enter optional server ID

3. **End Collection**
   - Select completed collections
   - Upload temperature log file (CSV/Excel)
   - Location is automatically captured
   - System processes and stores data

4. **View Details**
   - Click "View Details" on any collection
   - See complete timeline
   - View temperature graphs
   - See starting/ending locations on map

## 👥 User Roles

### Admin

- Full system access
- User management
- Referrer management
- Collection request creation and assignment
- View all collections
- Access to analytics dashboard

### Operator

- View assigned collections
- Start and end collections
- Scan barcodes
- Upload temperature logs
- View collection details
- Filter and search assigned collections

## 📡 API Documentation

### Authentication

All API endpoints require authentication using Laravel Sanctum session-based authentication.

### Endpoints

#### Operator Endpoints

```
GET    /api/operator/collect-requests          # List assigned requests
GET    /api/operator/collect-requests/{id}     # Get request details
POST   /api/operator/collect-requests/start    # Start collection
POST   /api/operator/collect-requests/end      # End collection
GET    /api/operator/referrers                 # List all referrers
```

#### Admin Endpoints

```
GET    /api/admin/users                        # List users
POST   /api/admin/users                        # Create user
PUT    /api/admin/users/{id}                   # Update user
DELETE /api/admin/users/{id}                   # Delete user

GET    /api/admin/referrers                    # List referrers
POST   /api/admin/referrers                    # Create referrer
PUT    /api/admin/referrers/{id}               # Update referrer
DELETE /api/admin/referrers/{id}               # Delete referrer

GET    /api/admin/collect-requests             # List all requests
POST   /api/admin/collect-requests             # Create request
POST   /api/admin/collect-requests/assign      # Assign request
DELETE /api/admin/collect-requests/{id}        # Delete request
```

#### Dashboard

```
GET    /api/dashboard/stats                    # Get dashboard statistics
```

### Request Examples

**Start Collection:**

```json
POST /api/operator/collect-requests/start
{
  "request_id": 1,
  "server_id": "SERVER-001",
  "barcodes": ["12345", "67890"],
  "starting_location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10.5
  }
}
```

**End Collection:**

```bash
POST /api/operator/collect-requests/end
Content-Type: multipart/form-data

file: [temperature_log.csv]
collect_request_ids[]: 1
collect_request_ids[]: 2
ending_location[latitude]: 40.7589
ending_location[longitude]: -73.9851
ending_location[accuracy]: 12.3
```

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:

- **Touch-optimized UI** - Large touch targets, swipe gestures
- **Camera Access** - Built-in barcode scanning using device camera
- **GPS Integration** - Automatic location capture on mobile
- **Offline Capability** - Basic functionality works offline (PWA ready)
- **Responsive Charts** - Temperature graphs adapt to screen size
- **Mobile Navigation** - Drawer navigation on small screens
- **Optimized Performance** - Lazy loading and code splitting

### Mobile Browser Requirements

- Modern browsers with:
  - Camera API support
  - Geolocation API support
  - JavaScript enabled
  - Cookies enabled

### Recommended Browsers

- Chrome for Android 90+
- Safari for iOS 14+
- Firefox Mobile 88+
- Samsung Internet 14+

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage
```

## 🔧 Troubleshooting

### Camera Not Working

- Ensure HTTPS is enabled (or localhost)
- Check browser permissions
- Verify Camera API support

### Location Not Captured

- Check browser location permissions
- Ensure GPS is enabled on device
- HTTPS required for geolocation

### File Upload Issues

- Check `php.ini` upload limits
- Verify storage permissions
- Ensure `storage/app/public` is linked

### Database Connection

- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

## 📝 Development

### Code Style

The project follows PSR-12 coding standards:

```bash
# Format PHP code
./vendor/bin/pint

# Format JavaScript/React code
npm run lint
```

### Database Migrations

Create a new migration:

```bash
php artisan make:migration create_table_name
```

### Creating New Features

1. Create domain model in `app/Domain/`
2. Create repository interface and implementation
3. Create service in `app/Application/`
4. Create controller in `app/Http/Controllers/`
5. Add routes in `routes/web.php`
6. Create React components in `resources/js/Pages/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Laravel Framework
- Inertia.js Team
- Material-UI Team
- React Community
- All contributors and users

## 🗺️ Roadmap

- [ ] Real-time notifications
- [ ] Export reports to PDF
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] SMS alerts for critical temperature changes
- [ ] API webhooks for third-party integrations

---

**Built with ❤️ using Laravel, React, and Material-UI**
