import { useState, useEffect } from 'react';
import MuiAuthenticatedLayout from '@/Layouts/MuiAuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Paper,
    Alert,
    Button,
    Divider,
    Stack,
    Skeleton,
    useMediaQuery,
    useTheme,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    LocationOn as LocationIcon,
    DeviceThermostat as ThermostatIcon,
    Schedule as ScheduleIcon,
    QrCode as BarcodeIcon,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

export default function Show({ auth, id }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [collectRequest, setCollectRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCollectRequest();
    }, [id]);

    const fetchCollectRequest = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/operator/collect-requests/${id}`);
            setCollectRequest(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching collect request:', error);
            setError('Failed to load collect request details');
        } finally {
            setLoading(false);
        }
    };

    const formatTemperatureData = (temperatureLogs) => {
        if (!temperatureLogs || temperatureLogs.length === 0) return [];

        return temperatureLogs.map((log) => ({
            timestamp: new Date(log.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
            temperature: parseFloat(log.value),
            fullTimestamp: new Date(log.timestamp).toLocaleString(),
        }));
    };

    const getStatusChip = (request) => {
        if (request.ended_at) {
            return <Chip label="Completed" color="success" size="medium" />;
        } else if (request.started_at) {
            return <Chip label="In Progress" color="primary" size="medium" />;
        } else {
            return <Chip label="Not Started" color="warning" size="medium" />;
        }
    };

    if (loading) {
        return (
            <MuiAuthenticatedLayout title="Collection Request Details">
                <Head title="Collection Request Details" />
                <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
                    <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {[1, 2, 3, 4].map((i) => (
                            <Grid item xs={12} md={6} key={i}>
                                <Card>
                                    <CardContent>
                                        <Skeleton variant="text" width="60%" height={32} />
                                        <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
                                        <Skeleton variant="text" width="70%" sx={{ mt: 1 }} />
                                        <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </MuiAuthenticatedLayout>
        );
    }

    if (error || !collectRequest) {
        return (
            <MuiAuthenticatedLayout title="Collection Request Details">
                <Head title="Collection Request Details" />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Alert severity="error">{error || 'Collection request not found'}</Alert>
                    <Button
                        component={Link}
                        href="/collect-requests"
                        startIcon={<ArrowBackIcon />}
                        sx={{ mt: 2 }}
                    >
                        Back to Collection Requests
                    </Button>
                </Container>
            </MuiAuthenticatedLayout>
        );
    }

    const temperatureData = formatTemperatureData(collectRequest.temperature_logs);
    const hasTemperatureData = temperatureData.length > 0;

    return (
        <MuiAuthenticatedLayout title={`Collection Request #${collectRequest.id}`}>
            <Head title={`Collection Request #${collectRequest.id}`} />

            <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 2, sm: 3 } }}>
                <Stack spacing={2} sx={{ mb: 3 }}>
                    <Button
                        component={Link}
                        href="/collect-requests"
                        startIcon={<ArrowBackIcon />}
                        size={isSmallMobile ? 'small' : 'medium'}
                        sx={{ alignSelf: 'flex-start' }}
                    >
                        Back
                    </Button>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                    >
                        <Typography variant={isSmallMobile ? 'h5' : 'h4'} component="h1">
                            Request #{collectRequest.id}
                        </Typography>
                        {getStatusChip(collectRequest)}
                    </Stack>
                </Stack>

                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {/* Request Details */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <ScheduleIcon color="primary" />
                                    <Typography variant={isSmallMobile ? 'subtitle1' : 'h6'} fontWeight="bold">
                                        Timeline
                                    </Typography>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />

                                <Stack spacing={1.5}>
                                    {collectRequest.started_at && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                Started
                                            </Typography>
                                            <Typography variant="body2">
                                                {new Date(collectRequest.started_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    )}

                                    {collectRequest.ended_at && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                Ended
                                            </Typography>
                                            <Typography variant="body2">
                                                {new Date(collectRequest.ended_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    )}

                                    {collectRequest.started_at && collectRequest.ended_at && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                Duration
                                            </Typography>
                                            <Typography variant="body2">
                                                {(() => {
                                                    const duration =
                                                        new Date(collectRequest.ended_at) -
                                                        new Date(collectRequest.started_at);
                                                    const hours = Math.floor(duration / (1000 * 60 * 60));
                                                    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
                                                    return `${hours}h ${minutes}m`;
                                                })()}
                                            </Typography>
                                        </Box>
                                    )}

                                    {collectRequest.server_id && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                Server ID
                                            </Typography>
                                            <Typography variant="body2">{collectRequest.server_id}</Typography>
                                        </Box>
                                    )}

                                    {collectRequest.device && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                Device MAC
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                {collectRequest.device.mac}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Referrer Location */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <LocationIcon color="primary" />
                                    <Typography variant={isSmallMobile ? 'subtitle1' : 'h6'} fontWeight="bold">
                                        Referrer Location
                                    </Typography>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />

                                {collectRequest.referrer ? (
                                    <Stack spacing={1.5}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                Name
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {collectRequest.referrer.name}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                Address
                                            </Typography>
                                            <Typography variant="body2">
                                                {collectRequest.referrer.address}
                                            </Typography>
                                        </Box>

                                        {collectRequest.referrer.latitude && collectRequest.referrer.longitude && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                    Coordinates
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mb: 1 }}>
                                                    {collectRequest.referrer.latitude}, {collectRequest.referrer.longitude}
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<LocationIcon />}
                                                    href={`https://www.google.com/maps?q=${collectRequest.referrer.latitude},${collectRequest.referrer.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    fullWidth={isSmallMobile}
                                                >
                                                    View on Maps
                                                </Button>
                                            </Box>
                                        )}
                                    </Stack>
                                ) : (
                                    <Alert severity="info">No referrer assigned</Alert>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Starting Location */}
                    {collectRequest.extra_information?.starting_location && (
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <LocationIcon color="success" />
                                        <Typography variant={isSmallMobile ? 'subtitle1' : 'h6'} fontWeight="bold">
                                            Starting Location
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ mb: 2 }} />

                                    <Stack spacing={1.5}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                Coordinates
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                {collectRequest.extra_information.starting_location.latitude},{' '}
                                                {collectRequest.extra_information.starting_location.longitude}
                                            </Typography>
                                        </Box>

                                        {collectRequest.extra_information.starting_location.accuracy && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                    Accuracy
                                                </Typography>
                                                <Typography variant="body2">
                                                    ±{Math.round(collectRequest.extra_information.starting_location.accuracy)}m
                                                </Typography>
                                            </Box>
                                        )}

                                        {collectRequest.extra_information.starting_location.timestamp && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                    Captured At
                                                </Typography>
                                                <Typography variant="body2">
                                                    {new Date(collectRequest.extra_information.starting_location.timestamp).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="success"
                                            startIcon={<LocationIcon />}
                                            href={`https://www.google.com/maps?q=${collectRequest.extra_information.starting_location.latitude},${collectRequest.extra_information.starting_location.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            fullWidth={isSmallMobile}
                                        >
                                            View Starting Point
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Ending Location */}
                    {collectRequest.extra_information?.ending_location && (
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <LocationIcon color="error" />
                                        <Typography variant={isSmallMobile ? 'subtitle1' : 'h6'} fontWeight="bold">
                                            Ending Location
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ mb: 2 }} />

                                    <Stack spacing={1.5}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                Coordinates
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                {collectRequest.extra_information.ending_location.latitude},{' '}
                                                {collectRequest.extra_information.ending_location.longitude}
                                            </Typography>
                                        </Box>

                                        {collectRequest.extra_information.ending_location.accuracy && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                    Accuracy
                                                </Typography>
                                                <Typography variant="body2">
                                                    ±{Math.round(collectRequest.extra_information.ending_location.accuracy)}m
                                                </Typography>
                                            </Box>
                                        )}

                                        {collectRequest.extra_information.ending_location.timestamp && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                    Captured At
                                                </Typography>
                                                <Typography variant="body2">
                                                    {new Date(collectRequest.extra_information.ending_location.timestamp).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<LocationIcon />}
                                            href={`https://www.google.com/maps?q=${collectRequest.extra_information.ending_location.latitude},${collectRequest.extra_information.ending_location.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            fullWidth={isSmallMobile}
                                        >
                                            View Ending Point
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Barcodes */}
                    {collectRequest.barcodes && collectRequest.barcodes.length > 0 && (
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <BarcodeIcon color="primary" />
                                        <Typography variant={isSmallMobile ? 'subtitle1' : 'h6'} fontWeight="bold">
                                            Barcodes ({collectRequest.barcodes.length})
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {collectRequest.barcodes.map((barcode, index) => (
                                            <Chip
                                                key={index}
                                                label={barcode}
                                                variant="outlined"
                                                size={isSmallMobile ? 'small' : 'medium'}
                                                sx={{ fontFamily: 'monospace', fontSize: isSmallMobile ? '0.75rem' : '0.875rem' }}
                                            />
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Temperature Graph */}
                    {collectRequest.ended_at && (
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                        <ThermostatIcon color="primary" />
                                        <Typography variant={isSmallMobile ? 'subtitle1' : 'h6'} fontWeight="bold">
                                            Temperature Over Time
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ mb: 3 }} />

                                    {hasTemperatureData ? (
                                        <>
                                            <Stack spacing={0.5} sx={{ mb: 2 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    From: {new Date(collectRequest.started_at).toLocaleString()}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    To: {new Date(collectRequest.ended_at).toLocaleString()}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" fontWeight="500">
                                                    Total readings: {temperatureData.length}
                                                </Typography>
                                            </Stack>

                                            <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                                                <LineChart
                                                    data={temperatureData}
                                                    margin={{
                                                        top: 5,
                                                        right: isMobile ? 10 : 30,
                                                        left: isMobile ? 0 : 20,
                                                        bottom: isMobile ? 60 : 5
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis
                                                        dataKey="timestamp"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={isMobile ? 80 : 100}
                                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                                    />
                                                    <YAxis
                                                        label={!isMobile ? { value: 'Temperature (°C)', angle: -90, position: 'insideLeft' } : undefined}
                                                        domain={['auto', 'auto']}
                                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                                    />
                                                    <Tooltip
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                return (
                                                                    <Paper sx={{ p: 1.5 }}>
                                                                        <Typography variant="body2">
                                                                            {payload[0].payload.fullTimestamp}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body1"
                                                                            fontWeight="bold"
                                                                            color="primary"
                                                                        >
                                                                            {payload[0].value}°C
                                                                        </Typography>
                                                                    </Paper>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="temperature"
                                                        stroke="#1976d2"
                                                        strokeWidth={2}
                                                        dot={{ r: 3 }}
                                                        activeDot={{ r: 5 }}
                                                        name="Temperature (°C)"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </>
                                    ) : (
                                        <Alert severity="info">
                                            No temperature data available for this collection period. Temperature
                                            logs may not have been uploaded or there were no readings during the
                                            collection time.
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {!collectRequest.ended_at && (
                        <Grid item xs={12}>
                            <Alert severity="warning">
                                This collection is still in progress. Temperature data will be available once the
                                collection is ended and temperature logs are uploaded.
                            </Alert>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </MuiAuthenticatedLayout>
    );
}
