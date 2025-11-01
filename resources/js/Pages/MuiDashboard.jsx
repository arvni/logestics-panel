import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import MuiAuthenticatedLayout from '@/Layouts/MuiAuthenticatedLayout';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Paper,
    Skeleton,
    useMediaQuery,
    useTheme,
    Container,
    Divider,
    LinearProgress,
    Tooltip,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Person as PersonIcon,
    LocalShipping as ShippingIcon,
    CheckCircle as CheckIcon,
    HourglassBottom as PendingIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';

export default function MuiDashboard() {
    const { auth } = usePage().props;
    const user = auth.user;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Fetch real dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/dashboard/stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statsCards = user.role === 'admin'
        ? [
            {
                title: 'Total Users',
                value: stats?.totalUsers || '0',
                icon: <PersonIcon sx={{ fontSize: 28 }} />,
                color: '#1976d2',
                bgColor: '#e3f2fd',
                subtitle: 'Active users',
            },
            {
                title: 'Total Requests',
                value: stats?.totalRequests || '0',
                icon: <ShippingIcon sx={{ fontSize: 28 }} />,
                color: '#2e7d32',
                bgColor: '#e8f5e9',
                subtitle: 'All time',
            },
            {
                title: 'Active Collections',
                value: stats?.activeCollections || '0',
                icon: <DashboardIcon sx={{ fontSize: 28 }} />,
                color: '#ed6c02',
                bgColor: '#fff3e0',
                subtitle: 'In progress',
            },
        ]
        : [
            {
                title: 'My Collections',
                value: stats?.myCollections || '0',
                icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
                color: '#1976d2',
                bgColor: '#e3f2fd',
                subtitle: 'Assigned to you',
            },
            {
                title: 'Completed Today',
                value: stats?.completedToday || '0',
                icon: <CheckIcon sx={{ fontSize: 28 }} />,
                color: '#2e7d32',
                bgColor: '#e8f5e9',
                subtitle: 'Collections completed',
            },
            {
                title: 'Pending',
                value: stats?.pending || '0',
                icon: <PendingIcon sx={{ fontSize: 28 }} />,
                color: '#ed6c02',
                bgColor: '#fff3e0',
                subtitle: 'Not started yet',
            },
        ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const StatCard = ({ card, index }) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
            <Tooltip title={card.subtitle} placement="top">
                <Card
                    elevation={1}
                    sx={{
                        height: '100%',
                        background: `linear-gradient(135deg, ${card.bgColor} 0%, #ffffff 100%)`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            bgcolor: card.color,
                        },
                        '&:hover': {
                            transform: isMobile ? 'none' : 'translateY(-8px)',
                            boxShadow: theme.shadows[8],
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        },
                        '&:active': {
                            transform: isMobile ? 'scale(0.98)' : 'translateY(-4px)',
                        },
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 } }}>
                        {/* Icon Container */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box
                                sx={{
                                    width: { xs: 48, sm: 56 },
                                    height: { xs: 48, sm: 56 },
                                    borderRadius: '12px',
                                    bgcolor: card.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: `0 4px 20px ${card.color}33`,
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                {card.icon}
                            </Box>
                        </Box>

                        {/* Value */}
                        {loading ? (
                            <Skeleton width="60%" height={40} sx={{ mb: 1 }} />
                        ) : (
                            <Typography
                                variant="h4"
                                component="div"
                                sx={{
                                    fontWeight: 700,
                                    mb: 1,
                                    color: card.color,
                                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                                }}
                            >
                                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                            </Typography>
                        )}

                        {/* Title */}
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                                mb: 0.5,
                            }}
                        >
                            {card.title}
                        </Typography>

                        {/* Subtitle */}
                        {loading ? (
                            <Skeleton width="70%" height={16} />
                        ) : (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.75rem',
                                }}
                            >
                                {card.subtitle}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Tooltip>
        </Grid>
    );

    return (
        <MuiAuthenticatedLayout title="Dashboard">
            <Head title="Dashboard" />

            <Box sx={{ width: '100%', pb: 4 }}>
                {/* Header Section */}
                <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            mb: 0.5,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {getGreeting()}, {user.name.split(' ')[0]}! 👋
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Typography>
                </Box>

                {/* Stats Grid */}
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
                    {statsCards.map((card, index) => (
                        <StatCard key={index} card={card} index={index} />
                    ))}
                </Grid>

                {/* Getting Started Section */}
                <Paper
                    elevation={1}
                    sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.paper} 100%)`,
                        p: { xs: 2.5, sm: 3, md: 4 },
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: theme.shadows[4],
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <DashboardIcon sx={{ color: 'primary.main', fontSize: { xs: 24, sm: 28 } }} />
                        <Typography
                            variant={isMobile ? 'h6' : 'h5'}
                            sx={{
                                fontWeight: 700,
                                color: 'primary.main',
                            }}
                        >
                            Getting Started
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            lineHeight: 1.8,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            mb: 2,
                        }}
                    >
                        {user.role === 'admin'
                            ? 'As an administrator, you have full control over the platform. You can manage users, set up referrer locations, track collection requests, and monitor system performance. Use the navigation menu on the left to access different management sections.'
                            : 'As an operator, you can efficiently manage your assigned collection requests. View your current workload, track completed collections, and monitor pending items. Use the "My Collections" menu to view and manage your tasks.'}
                    </Typography>

                    {/* Quick Tips */}
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            p: 2,
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.divider}`,
                            mt: 2,
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                            💡 Quick Tips:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                            <li>
                                <Typography variant="caption" color="text.secondary">
                                    {user.role === 'admin'
                                        ? 'Review the dashboard regularly to monitor system health and user activity'
                                        : 'Prioritize high-priority collections to improve overall efficiency'}
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="caption" color="text.secondary">
                                    {user.role === 'admin'
                                        ? 'Keep referrer information up to date for accurate location tracking'
                                        : 'Update request statuses in real-time for accurate tracking'}
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="caption" color="text.secondary">
                                    {user.role === 'admin'
                                        ? 'Generate reports periodically to analyze trends and performance'
                                        : 'Contact support if you encounter any issues or need clarification'}
                                </Typography>
                            </li>
                        </ul>
                    </Box>
                </Paper>

                {/* Activity Indicator */}
                {loading && (
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Loading dashboard data...
                        </Typography>
                        <LinearProgress
                            sx={{
                                height: 3,
                                borderRadius: 2,
                                backgroundColor: 'action.disabledBackground',
                            }}
                        />
                    </Box>
                )}
            </Box>
        </MuiAuthenticatedLayout>
    );
}
