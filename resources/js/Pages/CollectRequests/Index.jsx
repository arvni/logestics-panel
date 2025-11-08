import {useState, useEffect} from 'react';
import MuiAuthenticatedLayout from '@/Layouts/MuiAuthenticatedLayout';
import {Head, usePage} from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Alert,
    Paper,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Collapse,
    Stack,
    Skeleton,
    useMediaQuery,
    useTheme,
    Drawer,
    TextField,
    Snackbar,
} from '@mui/material';
import {
    Stop as StopIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import axios from 'axios';
import CollectRequestCard from './Components/CollectRequestCard';
import StartCollectionDialog from './Components/StartCollectionDialog';
import EndCollectionDialog from './Components/EndCollectionDialog';

export default function Index({auth}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Helper function to get CSRF token from meta tag
    const getCsrfToken = () => {
        const token = document.head.querySelector('meta[name="csrf-token"]');
        return token ? token.content : null;
    };

    // Helper function to fetch fresh CSRF token from server
    const fetchFreshCsrfToken = async () => {
        try {
            const response = await axios.get('/csrf-token');
            const newToken = response.data.csrf_token;

            // Update meta tag
            const metaTag = document.head.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.content = newToken;
            }

            // Update axios default
            axios.defaults.headers.common['X-CSRF-TOKEN'] = newToken;

            return newToken;
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
            return getCsrfToken();
        }
    };

    // Helper function to ensure CSRF token is set in axios
    const ensureCsrfToken = () => {
        const token = getCsrfToken();
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        }
    };

    const [collectRequests, setCollectRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [endDialogOpen, setEndDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [barcodes, setBarcodes] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'success' | 'error' | 'warning' | 'info'
    });

    // Pagination and filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [referrerId, setReferrerId] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [referrers, setReferrers] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

    useEffect(() => {
        fetchReferrers();
    }, []);

    useEffect(() => {
        fetchCollectRequests();
    }, [page, perPage, dateFrom, dateTo, referrerId, statusFilter]);

    const fetchReferrers = async () => {
        try {
            const response = await axios.get('/api/operator/referrers');
            const data = response.data.data || response.data;
            setReferrers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching referrers:', error);
            setReferrers([]);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const fetchCollectRequests = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: perPage,
            };

            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            if (referrerId) params.referrer_id = referrerId;
            if (statusFilter) params.status = statusFilter;

            const response = await axios.get('/api/operator/collect-requests', {params});
            setCollectRequests(response.data.data);
            setPage(response.data.current_page);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error('Error fetching collect requests:', error);
            showSnackbar('Failed to fetch collect requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setReferrerId('');
        setStatusFilter('');
        setPage(1);
    };

    const handleOpenStartDialog = (request) => {
        setSelectedRequest(request);
        setBarcodes(['']); // Initialize with one empty barcode field
        setStartDialogOpen(true);
    };

    const handleCloseStartDialog = () => {
        setStartDialogOpen(false);
        setSelectedRequest(null);
        setBarcodes(['']); // Reset to initial state with one empty barcode
    };

    const getUserLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    });
                },
                (error) => {
                    console.warn('Location error:', error);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    };

    const handleSelectForCollection = async (request) => {
        try {
            // Fetch fresh CSRF token before making the request
            const freshToken = await fetchFreshCsrfToken();

            await axios.post('/api/operator/collect-requests/select', {
                request_id: request.id,
            }, {
                headers: {
                    'X-CSRF-TOKEN': freshToken,
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            showSnackbar('Request selected successfully. You can now start the collection.', 'success');
            fetchCollectRequests();
        } catch (error) {
            console.error('Error selecting collection:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to select collection';
            showSnackbar(errorMsg, 'error');
        }
    };

    const handleStartCollection = async () => {
        // Filter out empty barcodes
        const validBarcodes = barcodes.filter(barcode => barcode.trim() !== '');

        if (validBarcodes.length === 0) {
            showSnackbar('Please enter or scan at least one barcode', 'warning');
            return;
        }

        try {
            // Fetch fresh CSRF token before making the request
            const freshToken = await fetchFreshCsrfToken();

            const location = await getUserLocation();

            const payload = {
                request_id: selectedRequest.id,
                barcodes: validBarcodes,
            };

            if (location) {
                payload.starting_location = location;
            }

            await axios.post('/api/operator/collect-requests/start', payload, {
                headers: {
                    'X-CSRF-TOKEN': freshToken,
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            handleCloseStartDialog();
            showSnackbar('Collection started successfully', 'success');
            fetchCollectRequests();
        } catch (error) {
            console.error('Error starting collection:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to start collection';
            showSnackbar(errorMsg, 'error');
        }
    };

    const handleEndCollection = async () => {
        if (!uploadFile) {
            showSnackbar('Please select a file to upload', 'warning');
            return;
        }

        const validExtensions = ['xlsx', 'xls', 'csv'];
        const fileExtension = uploadFile.name?.split('.').pop().toLowerCase();
        if (!fileExtension || !validExtensions.includes(fileExtension)) {
            showSnackbar('Please select a valid file type (.xlsx, .xls, or .csv)', 'warning');
            return;
        }

        if (selectedRequests.length === 0) {
            showSnackbar('Please select at least one request to end', 'warning');
            return;
        }

        try {
            // Fetch fresh CSRF token before making the request
            const freshToken = await fetchFreshCsrfToken();

            const location = await getUserLocation();

            const formData = new FormData();
            formData.append('file', uploadFile);
            selectedRequests.forEach((id) => {
                formData.append('collect_request_ids[]', id);
            });

            if (location) {
                formData.append('ending_location[latitude]', location.latitude);
                formData.append('ending_location[longitude]', location.longitude);
                if (location.accuracy) {
                    formData.append('ending_location[accuracy]', location.accuracy);
                }
            }

            await axios.post('/api/operator/collect-requests/end', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-TOKEN': freshToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            setEndDialogOpen(false);
            setSelectedRequests([]);
            setUploadFile(null);
            showSnackbar('Collection ended successfully', 'success');
            fetchCollectRequests();
        } catch (error) {
            console.error('Error ending collection:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to end collection';
            showSnackbar(errorMsg, 'error');
        }
    };

    const toggleRequestSelection = (id) => {
        setSelectedRequests((prev) =>
            prev.includes(id) ? prev.filter((reqId) => reqId !== id) : [...prev, id]
        );
    };

    const openEndDialog = () => {
        const startedRequests = collectRequests.filter(
            (req) => req.status === 'picked_up'
        );
        if (startedRequests.length === 0) {
            showSnackbar('No started collections to end', 'info');
            return;
        }
        setEndDialogOpen(true);
    };

    const handleCloseEndDialog = () => {
        setEndDialogOpen(false);
        setSelectedRequests([]);
        setUploadFile(null);
    };

    const inProgressRequests = collectRequests.filter((req) => req.status === 'picked_up');

    const FiltersContent = () => (
        <Box sx={{p: isMobile ? 2 : 3}}>
            <Typography variant="h6" sx={{mb: 2}}>
                Filters
            </Typography>
            <Stack spacing={2}>
                <TextField
                    label="Date From"
                    type="date"
                    fullWidth
                    size={isSmallMobile ? 'small' : 'medium'}
                    value={dateFrom}
                    onChange={(e) => {
                        setDateFrom(e.target.value);
                        setPage(1);
                    }}
                    InputLabelProps={{shrink: true}}
                />
                <TextField
                    label="Date To"
                    type="date"
                    fullWidth
                    size={isSmallMobile ? 'small' : 'medium'}
                    value={dateTo}
                    onChange={(e) => {
                        setDateTo(e.target.value);
                        setPage(1);
                    }}
                    InputLabelProps={{shrink: true}}
                />
                <FormControl fullWidth size={isSmallMobile ? 'small' : 'medium'}>
                    <InputLabel>Referrer</InputLabel>
                    <Select
                        value={referrerId}
                        label="Referrer"
                        onChange={(e) => {
                            setReferrerId(e.target.value);
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">All Referrers</MenuItem>
                        {referrers.map((referrer) => (
                            <MenuItem key={referrer.id} value={referrer.id}>
                                {referrer.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth size={isSmallMobile ? 'small' : 'medium'}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="not_started">Not Started</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    startIcon={<ClearIcon/>}
                    onClick={handleClearFilters}
                    fullWidth={isMobile}
                >
                    Clear Filters
                </Button>
            </Stack>
        </Box>
    );

    return (
        <MuiAuthenticatedLayout title="My Collection Requests">
            <Head title="My Collection Requests"/>

            <Container maxWidth="lg" sx={{mt: {xs: 2, md: 4}, mb: 4, px: {xs: 2, sm: 3}}}>
                {/* Header */}
                <Stack
                    direction={{xs: 'column', sm: 'row'}}
                    justifyContent="space-between"
                    alignItems={{xs: 'stretch', sm: 'center'}}
                    spacing={2}
                    sx={{mb: 3}}
                >
                    <Typography variant={isSmallMobile ? 'h5' : 'h4'} component="h1">
                        My Collection Requests
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent={{xs: 'flex-end', sm: 'flex-start'}}>
                        {isMobile ? (
                            <IconButton
                                color="primary"
                                onClick={() => setFilterDrawerOpen(true)}
                                sx={{border: 1, borderColor: 'divider'}}
                            >
                                <FilterIcon/>
                            </IconButton>
                        ) : (
                            <Button
                                variant="outlined"
                                startIcon={<FilterIcon/>}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? 'Hide' : 'Filters'}
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="secondary"
                            size={isSmallMobile ? 'small' : 'medium'}
                            startIcon={!isSmallMobile && <StopIcon/>}
                            onClick={openEndDialog}
                            disabled={inProgressRequests.length === 0}
                        >
                            {isSmallMobile ? 'End' : 'End Collection'}
                        </Button>
                        <IconButton onClick={fetchCollectRequests} size={isSmallMobile ? 'small' : 'medium'}>
                            <RefreshIcon/>
                        </IconButton>
                    </Stack>
                </Stack>

                {/* Desktop Filters */}
                {!isMobile && (
                    <Collapse in={showFilters}>
                        <Paper sx={{mb: 3}}>
                            <FiltersContent/>
                        </Paper>
                    </Collapse>
                )}

                {/* Mobile Filters Drawer */}
                <Drawer
                    anchor="right"
                    open={filterDrawerOpen}
                    onClose={() => setFilterDrawerOpen(false)}
                >
                    <Box sx={{width: 300}}>
                        <FiltersContent/>
                    </Box>
                </Drawer>

                {loading ? (
                    <Grid container spacing={{xs: 2, md: 3}}>
                        {[1, 2, 3, 4].map((i) => (
                            <Grid item xs={12} md={6} key={i}>
                                <Card>
                                    <CardContent>
                                        <Skeleton variant="text" width="60%" height={32}/>
                                        <Skeleton variant="text" width="80%"/>
                                        <Skeleton variant="text" width="70%"/>
                                        <Skeleton variant="rectangular" height={40} sx={{mt: 2}}/>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : collectRequests.length === 0 ? (
                    <Alert severity="info" icon={<InfoIcon/>}>
                        No collection requests found matching your filters.
                    </Alert>
                ) : (
                    <>
                        <Grid container spacing={{xs: 2, md: 3}}>
                            {collectRequests.map((request) => (
                                <Grid item xs={12} md={6} key={request.id}>
                                    <CollectRequestCard
                                        request={request}
                                        onSelectForCollection={handleSelectForCollection}
                                        onStartCollection={handleOpenStartDialog}
                                        onShowNotification={showSnackbar}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Pagination */}
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(e, value) => setPage(value)}
                                color="primary"
                                size={isSmallMobile ? 'small' : 'large'}
                                siblingCount={isSmallMobile ? 0 : 1}
                                boundaryCount={isSmallMobile ? 1 : 2}
                            />
                        </Box>
                    </>
                )}

                {/* Start Collection Dialog */}
                {startDialogOpen && <StartCollectionDialog
                    open={startDialogOpen}
                    onClose={handleCloseStartDialog}
                    selectedRequest={selectedRequest}
                    barcodes={barcodes}
                    setBarcodes={setBarcodes}
                    onStartCollection={handleStartCollection}
                />}

                {/* End Collection Dialog */}
                <EndCollectionDialog
                    open={endDialogOpen}
                    onClose={handleCloseEndDialog}
                    collectRequests={collectRequests}
                    selectedRequests={selectedRequests}
                    onToggleRequest={toggleRequestSelection}
                    uploadFile={uploadFile}
                    onFileChange={setUploadFile}
                    onEndCollection={handleEndCollection}
                />

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </MuiAuthenticatedLayout>
    );
}
