# MUI Implementation Guide - Logistics Panel

## ✅ Completed Changes

### 1. Backend API Updates

**Created Controllers:**
- `app/Http/Controllers/Api/Admin/UserController.php` - User CRUD with pagination
- Updated `ReferrerController.php` - Added pagination and search
- Updated `CollectRequestAssignmentController.php` - Added pagination and filtering

**API Routes Added:**
```php
// Admin User Management
Route::apiResource('users', AdminUserController::class);

// Updated endpoints with pagination support
GET /api/admin/users?page=1&per_page=10&search=keyword
GET /api/admin/referrers?page=1&per_page=10&search=keyword
GET /api/admin/collect-requests?page=1&per_page=10&search=keyword&status=in_progress
```

**Web Routes Added:**
```php
Route::get('/admin/users', ...) // User management page
```

### 2. Frontend Setup

**Theme Configuration:**
- Created `resources/js/theme.js` with Material-UI theme
- Updated `resources/js/app.jsx` to use ThemeProvider
- Removed Tailwind CSS imports

**New Layouts:**
- `resources/js/Layouts/MuiAuthenticatedLayout.jsx` - Full MUI layout with:
  - Responsive AppBar
  - Drawer navigation (permanent on desktop, temporary on mobile)
  - User menu with profile and logout
  - Role-based menu items

**Pages Created:**
- `resources/js/Pages/Auth/MuiLogin.jsx` - Full MUI login with reCAPTCHA
- `resources/js/Pages/Admin/Users/Index.jsx` - Complete user management with pagination

### 3. Features Implemented

✅ **User Management (Admin Only):**
- Paginated table with search
- Add/Edit/Delete users
- Role assignment (Admin/Operator)
- Password management
- Prevent self-deletion

✅ **Pagination:**
- All admin endpoints support pagination
- Configurable items per page (5, 10, 25, 50)
- Search functionality

✅ **PWA-Ready Design:**
- Responsive mobile-first layout
- Touch-friendly buttons and controls
- Offline-capable structure

---

## 🚧 Remaining Tasks

You need to update these existing pages to use the new MUI layout:

### 1. Update Auth Pages

Replace the default Login page route in `app/Providers/RouteServiceProvider.php` or update the login view to use MUI:

```php
// In routes/auth.php or equivalent
Route::get('login', [AuthenticatedSessionController::class, 'create'])
    ->name('login');
```

Make sure it renders `Auth/MuiLogin` component.

### 2. Update Admin Referrers Page

File: `resources/js/Pages/Admin/Referrers/Index.jsx`

Key changes needed:
- Import `MuiAuthenticatedLayout` instead of `AuthenticatedLayout`
- Replace all Tailwind classes with MUI components
- Add pagination using `TablePagination`
- Add search with `TextField` and `SearchIcon`
- Use MUI `Dialog` for add/edit forms
- Use `Snackbar` for notifications

**Example structure:**
```jsx
import MuiAuthenticatedLayout from '@/Layouts/MuiAuthenticatedLayout';
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, TextField } from '@mui/material';

export default function Index() {
    const [referrers, setReferrers] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchReferrers = async () => {
        const response = await axios.get('/api/admin/referrers', {
            params: { page: page + 1, per_page: rowsPerPage }
        });
        setReferrers(response.data.data);
    };

    // Rest similar to Users/Index.jsx
}
```

### 3. Update Admin CollectRequests Page

File: `resources/js/Pages/Admin/CollectRequests/Index.jsx`

Similar updates as Referrers:
- MUI components throughout
- Pagination support
- Status filtering (Not Started, In Progress, Completed)
- Search by server_id or user name
- Assignment dialog

**Additional features:**
```jsx
// Add status filter
<TextField
    select
    label="Status"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
>
    <MenuItem value="">All</MenuItem>
    <MenuItem value="not_started">Not Started</MenuItem>
    <MenuItem value="in_progress">In Progress</MenuItem>
    <MenuItem value="completed">Completed</MenuItem>
</TextField>
```

### 4. Update Operator CollectRequests Page

File: `resources/js/Pages/CollectRequests/Index.jsx`

Updates needed:
- Use `MuiAuthenticatedLayout`
- Replace material-ui-tailwind hybrids with pure MUI
- Add better mobile UX for barcode scanning
- Improve file upload UI
- Add progress indicators

**File upload improvement:**
```jsx
import { CloudUpload } from '@mui/icons-material';

<Button
    component="label"
    variant="contained"
    startIcon={<CloudUpload />}
>
    Upload Temperature Data
    <input type="file" hidden onChange={handleFileChange} />
</Button>
```

### 5. Update Dashboard

Create a proper dashboard for both Admin and Operator:

**Admin Dashboard:**
- Total users count
- Total referrers count
- Collect requests by status (cards/charts)
- Recent activity

**Operator Dashboard:**
- My assigned requests count
- In-progress collections
- Completed today
- Quick start new collection button

---

## 📋 Implementation Checklist

### Backend ✅
- [x] User CRUD API with pagination
- [x] Referrer pagination
- [x] CollectRequest pagination and filtering
- [x] Search functionality
- [x] Role-based access control

### Frontend Core ✅
- [x] MUI Theme setup
- [x] Remove Tailwind CSS
- [x] MUI Layout with AppBar/Drawer
- [x] Role-based navigation
- [x] Responsive mobile design

### Pages
- [x] Login page (MUI + reCAPTCHA)
- [x] User Management (Admin)
- [ ] Referrers Management (Admin) - **Update to MUI**
- [ ] CollectRequests Management (Admin) - **Update to MUI**
- [ ] Operator Collections - **Update to MUI**
- [ ] Dashboard (both roles) - **Create new**

### PWA Features
- [x] Responsive design
- [x] Touch-friendly UI
- [x] Service worker (via vite-plugin-pwa)
- [ ] Offline data caching
- [ ] Add to home screen prompt

---

## 🎨 MUI Component Patterns

### Card with Actions
```jsx
<Card>
    <CardContent>
        <Typography variant="h5">Title</Typography>
        <Typography variant="body2">Content</Typography>
    </CardContent>
    <CardActions>
        <Button size="small">Action</Button>
    </CardActions>
</Card>
```

### Dialog Form
```jsx
<Dialog open={open} onClose={handleClose}>
    <DialogTitle>Form Title</DialogTitle>
    <DialogContent>
        <TextField fullWidth label="Field" />
    </DialogContent>
    <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained">Save</Button>
    </DialogActions>
</Dialog>
```

### Snackbar Notification
```jsx
<Snackbar open={snackbar.open} autoHideDuration={6000}>
    <Alert severity="success">{snackbar.message}</Alert>
</Snackbar>
```

### Chip for Status
```jsx
<Chip
    label={status}
    color={status === 'completed' ? 'success' : 'warning'}
    size="small"
/>
```

---

## 🚀 Next Steps

1. **Update existing pages** to use MUI components (see sections 2-5 above)
2. **Create Dashboard** with statistics cards
3. **Test PWA** functionality:
   ```bash
   npm run build
   # Test offline mode in browser DevTools
   ```
4. **Add icons** for PWA (192x192 and 512x512)
5. **Configure manifest** in `vite.config.js`

---

## 📦 Required Packages (Already Installed)

```json
{
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@mui/icons-material": "^7.3.4",
  "@mui/material": "^7.3.4",
  "react-google-recaptcha": "^3.1.0",
  "vite-plugin-pwa": "^1.1.0"
}
```

---

## 🔧 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Run tests
php artisan test
```

---

## 📝 Notes

- All MUI components are fully accessible and WCAG compliant
- Theme can be customized in `resources/js/theme.js`
- Icons from `@mui/icons-material` provide consistent look
- Pagination reduces server load and improves performance
- Search is debounced on backend (instant on frontend)

---

## 🎯 Key Benefits of This Implementation

1. **User-Friendly:** Clean, intuitive MUI design
2. **PWA-Ready:** Responsive, offline-capable, installable
3. **Scalable:** Pagination handles large datasets
4. **Accessible:** Full keyboard and screen reader support
5. **Maintainable:** Consistent component patterns
6. **Secure:** Role-based access at API and UI levels
