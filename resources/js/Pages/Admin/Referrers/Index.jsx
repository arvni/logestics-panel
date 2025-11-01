import {useState, useEffect, useCallback} from 'react';
import MuiAuthenticatedLayout from '@/Layouts/MuiAuthenticatedLayout';
import {Head} from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    LocationOn as LocationIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {Map, Marker} from 'pigeon-maps';
import {ErrorBoundary} from 'react-error-boundary';

// Error Boundary for Map
const MapErrorBoundary = ({children}) => (
    <ErrorBoundary
        fallback={<Typography color="error">Error loading map</Typography>}
        onError={(error) => console.error('Map error:', error)}
    >
        {children}
    </ErrorBoundary>
);

// Custom hook for map state and click handling
function useMapState({formData, onLocationSelect}) {
    const [center, setCenter] = useState([
        formData.latitude ? parseFloat(formData.latitude) : 51.505,
        formData.longitude ? parseFloat(formData.longitude) : -0.09,
    ]);
    const [zoom, setZoom] = useState(13);

    const handleMapClick = useCallback(
        ({latLng}) => {
            onLocationSelect(latLng[0], latLng[1]);
            setCenter([latLng[0], latLng[1]]);
        },
        [onLocationSelect]
    );

    const handleZoomIn = useCallback(() => {
        setZoom((prev) => Math.min(prev + 1, 18)); // Max zoom level: 18
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((prev) => Math.max(prev - 1, 1)); // Min zoom level: 1
    }, []);

    const handleCurrentLocation = useCallback(
        (onLocationSelect) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const {latitude, longitude} = position.coords;
                        setCenter([latitude, longitude]);
                        setZoom(15); // Zoom closer for current location
                        onLocationSelect(latitude, longitude);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        alert('Unable to retrieve your location. Please ensure location services are enabled.');
                    },
                    {enableHighAccuracy: true}
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        },
        [onLocationSelect]
    );

    return {center, zoom, handleMapClick, handleZoomIn, handleZoomOut, handleCurrentLocation};
}

export default function Index({auth}) {
    const [referrers, setReferrers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [mapDialogOpen, setMapDialogOpen] = useState(false);
    const [editingReferrer, setEditingReferrer] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
    });

    useEffect(() => {
        fetchReferrers();
    }, [page, rowsPerPage]);

    const fetchReferrers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/referrers', {
                params: {
                    page: page + 1,
                    per_page: rowsPerPage,
                },
            });
            setReferrers(response.data.data || []);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error('Error fetching referrers:', error);
            alert('Failed to fetch referrers');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (referrer = null) => {
        if (referrer) {
            setEditingReferrer(referrer);
            setFormData({
                name: referrer.name,
                address: referrer.address || '',
                latitude: referrer.latitude || '',
                longitude: referrer.longitude || '',
            });
        } else {
            setEditingReferrer(null);
            setFormData({
                name: '',
                address: '',
                latitude: '',
                longitude: '',
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingReferrer(null);
    };

    const handleOpenMapDialog = () => {
        setMapDialogOpen(true);
    };

    const handleCloseMapDialog = () => {
        setMapDialogOpen(false);
        setSearchQuery('');
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                name: formData.name,
                address: formData.address || null,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            };

            if (editingReferrer) {
                await axios.put(`/api/admin/referrers/${editingReferrer.id}`, payload);
            } else {
                await axios.post('/api/admin/referrers', payload);
            }

            handleCloseDialog();
            fetchReferrers();
        } catch (error) {
            console.error('Error saving referrer:', error);
            alert(error.response?.data?.message || 'Failed to save referrer');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this referrer?')) {
            return;
        }

        try {
            await axios.delete(`/api/admin/referrers/${id}`);
            fetchReferrers();
        } catch (error) {
            console.error('Error deleting referrer:', error);
            alert('Failed to delete referrer');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleMap = (lat, lng) => {
        setFormData((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
        }));
        setMapDialogOpen(false);
    };

    const handleSearchAddress = async () => {
        if (!searchQuery) return;
        try {
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: searchQuery,
                    format: 'json',
                    limit: 1,
                },
                headers: {'User-Agent': 'ReferrerManagementApp'},
            });
            if (response.data && response.data.length > 0) {
                const {lat, lon} = response.data[0];
                setFormData((prev) => ({
                    ...prev,
                    latitude: parseFloat(lat).toFixed(6),
                    longitude: parseFloat(lon).toFixed(6),
                    address: searchQuery,
                }));
            } else {
                alert('No results found for the address');
            }
        } catch (error) {
            console.error('Error searching address:', error);
            alert('Failed to search address');
        }
    };

    // Map state hook
    const {center, zoom, handleMapClick, handleZoomIn, handleZoomOut, handleCurrentLocation} = useMapState({
        formData,
        onLocationSelect: handleMap,
    });

    return (
        <MuiAuthenticatedLayout title="Referrer Management">
            <Head title="Referrer Management"/>

            <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 3}}>
                    <Typography variant="h4" component="h1">
                        Referrer Management
                    </Typography>
                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={() => handleOpenDialog()}
                            sx={{mr: 1}}
                        >
                            Add Referrer
                        </Button>
                        <IconButton onClick={fetchReferrers}>
                            <RefreshIcon/>
                        </IconButton>
                    </Box>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {referrers.map((referrer) => (
                                <TableRow key={referrer.id}>
                                    <TableCell>{referrer.id}</TableCell>
                                    <TableCell>{referrer.name}</TableCell>
                                    <TableCell>{referrer.address || '-'}</TableCell>
                                    <TableCell>
                                        {referrer.latitude && referrer.longitude ? (
                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                <LocationIcon fontSize="small" sx={{mr: 0.5}}/>
                                                {referrer.latitude}, {referrer.longitude}
                                            </Box>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(referrer)}
                                            color="primary"
                                        >
                                            <EditIcon/>
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(referrer.id)}
                                            color="error"
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />

                {/* Add/Edit Dialog */}
                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {editingReferrer ? 'Edit Referrer' : 'Add New Referrer'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Name"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Address"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                        <Grid container spacing={2} sx={{mt: 1}}>
                            <Grid item xs={5}>
                                <TextField
                                    label="Latitude"
                                    fullWidth
                                    type="number"
                                    inputProps={{step: 'any', min: -90, max: 90}}
                                    value={formData.latitude}
                                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    label="Longitude"
                                    fullWidth
                                    type="number"
                                    inputProps={{step: 'any', min: -180, max: 180}}
                                    value={formData.longitude}
                                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <IconButton onClick={handleOpenMapDialog} color="primary">
                                    <LocationIcon/>
                                </IconButton>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={!formData.name}
                        >
                            {editingReferrer ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Map Dialog */}
                <Dialog open={mapDialogOpen} onClose={handleCloseMapDialog} maxWidth="md" fullWidth>
                    <DialogTitle>Select Location</DialogTitle>
                    <DialogContent>
                        <Box sx={{mb: 2}}>
                            <TextField
                                label="Search Address"
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSearchAddress}
                                sx={{mt: 1}}
                            >
                                Search
                            </Button>
                        </Box>
                        <Box sx={{height: '400px', width: '100%', position: 'relative'}}>
                            <MapErrorBoundary>
                                <Map
                                    center={center}
                                    zoom={zoom}
                                    width="100%"
                                    height={400}
                                    provider={(x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`}
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    onClick={handleMapClick}
                                >
                                    {formData.latitude && formData.longitude && (
                                        <Marker
                                            anchor={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                                            width={30}
                                            height={30}
                                        />
                                    )}
                                </Map>
                            </MapErrorBoundary>
                            <Box sx={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                zIndex: 1000,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}>
                                <IconButton
                                    onClick={handleZoomIn}
                                    color="primary"
                                    sx={{bgcolor: 'white', '&:hover': {bgcolor: 'grey.100'}}}
                                    title="Zoom In"
                                >
                                    <ZoomInIcon/>
                                </IconButton>
                                <IconButton
                                    onClick={handleZoomOut}
                                    color="primary"
                                    sx={{bgcolor: 'white', '&:hover': {bgcolor: 'grey.100'}}}
                                    title="Zoom Out"
                                >
                                    <ZoomOutIcon/>
                                </IconButton>
                                <IconButton
                                    onClick={() => handleCurrentLocation(handleMapClick)}
                                    color="primary"
                                    sx={{bgcolor: 'white', '&:hover': {bgcolor: 'grey.100'}}}
                                    title="Use Current Location"
                                >
                                    <MyLocationIcon/>
                                </IconButton>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseMapDialog}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </MuiAuthenticatedLayout>
    );
}
