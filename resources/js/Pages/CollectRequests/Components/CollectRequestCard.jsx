import {
    Card,
    CardContent,
    Stack,
    Box,
    Typography,
    Chip,
    Divider,
    Button,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    PlayArrow as StartIcon,
    Visibility as ViewIcon,
    CheckCircle as SelectIcon,
    Directions as DirectionsIcon,
} from '@mui/icons-material';

export default function CollectRequestCard({ request, onSelectForCollection, onStartCollection, onShowNotification }) {
    const theme = useTheme();
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleGetDirections = () => {
        if (request.referrer && request.referrer.latitude && request.referrer.longitude) {
            const lat = request.referrer.latitude;
            const lng = request.referrer.longitude;

            // Try to open in Google Maps app on mobile, otherwise open in browser
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            window.open(googleMapsUrl, '_blank');
        } else {
            if (onShowNotification) {
                onShowNotification('Location information is not available for this referrer', 'warning');
            }
        }
    };

    const getStatusChip = (request) => {
        // Use status field for display
        if (request.status === 'received') {
            return <Chip label="Received" color="success" size="small" />;
        } else if (request.status === 'picked_up') {
            return <Chip label="Picked Up" color="info" size="small" />;
        } else if (request.status === 'sample_collector_on_the_way') {
            return <Chip label="On The Way" color="primary" size="small" />;
        } else if (request.status === 'waiting_for_assign') {
            return <Chip label="Waiting for Assignment" color="warning" size="small" />;
        } else if (request.status === 'pending') {
            return <Chip label="Pending" color="default" size="small" />;
        }

        // Fallback to old logic for backwards compatibility
        if (request.ended_at) {
            return <Chip label="Completed" color="success" size="small" />;
        } else if (request.started_at) {
            return <Chip label="In Progress" color="primary" size="small" />;
        } else {
            return <Chip label="Assigned - Not Started" color="warning" size="small" />;
        }
    };

    return (
        <Card
            sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                },
            }}
        >
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant={isSmallMobile ? 'subtitle1' : 'h6'} fontWeight="bold">
                            Request #{request.id}
                        </Typography>
                        {getStatusChip(request)}
                    </Box>

                    <Divider />

                    <Stack spacing={1}>
                        {request.referrer && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    Referrer:
                                </Typography>
                                <Typography variant="body2">
                                    {request.referrer.name}
                                </Typography>
                            </Box>
                        )}

                        {request.server_id && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    Server:
                                </Typography>
                                <Typography variant="body2">
                                    {request.server_id}
                                </Typography>
                            </Box>
                        )}

                        {request.device && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    Device:
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                    {request.device.mac}
                                </Typography>
                            </Box>
                        )}

                        {request.started_at && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    Started:
                                </Typography>
                                <Typography variant="body2">
                                    {new Date(request.started_at).toLocaleString()}
                                </Typography>
                            </Box>
                        )}

                        {request.ended_at && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    Ended:
                                </Typography>
                                <Typography variant="body2">
                                    {new Date(request.ended_at).toLocaleString()}
                                </Typography>
                            </Box>
                        )}
                    </Stack>

                    {request.barcodes && request.barcodes.length > 0 && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                                Barcodes ({request.barcodes.length}):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {request.barcodes.slice(0, isSmallMobile ? 3 : 5).map((barcode, index) => (
                                    <Chip
                                        key={index}
                                        label={barcode}
                                        size="small"
                                        sx={{ fontSize: '0.75rem' }}
                                    />
                                ))}
                                {request.barcodes.length > (isSmallMobile ? 3 : 5) && (
                                    <Chip
                                        label={`+${request.barcodes.length - (isSmallMobile ? 3 : 5)} more`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        </Box>
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        {/* Show Select button for pending or waiting_for_assign status */}
                        {(request.status === 'pending' || request.status === 'waiting_for_assign') && (
                            <Button
                                variant="contained"
                                color="primary"
                                size={isSmallMobile ? 'small' : 'medium'}
                                startIcon={<SelectIcon />}
                                onClick={() => onSelectForCollection(request)}
                                fullWidth
                            >
                                Select for Collection
                            </Button>
                        )}

                        {/* Show Direction and Start buttons for sample_collector_on_the_way status */}
                        {request.status === 'sample_collector_on_the_way' && (
                            <>
                                <Button
                                    variant="outlined"
                                    color="info"
                                    size={isSmallMobile ? 'small' : 'medium'}
                                    startIcon={<DirectionsIcon />}
                                    onClick={handleGetDirections}
                                    fullWidth
                                >
                                    Get Directions
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size={isSmallMobile ? 'small' : 'medium'}
                                    startIcon={<StartIcon />}
                                    onClick={() => onStartCollection(request)}
                                    fullWidth
                                >
                                    Start Collection
                                </Button>
                            </>
                        )}

                        {/* Show View Details for completed requests */}
                        {request.status === 'received' && (
                            <Button
                                variant="outlined"
                                size={isSmallMobile ? 'small' : 'medium'}
                                startIcon={<ViewIcon />}
                                href={`/collect-requests/${request.id}`}
                                fullWidth
                            >
                                View Details
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
