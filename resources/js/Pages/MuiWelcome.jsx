import { Head, Link } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Stack
} from '@mui/material';
import { Login as LoginIcon, AppRegistration as RegisterIcon } from '@mui/icons-material';

export default function MuiWelcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <Box
                    component="header"
                    sx={{
                        py: 2,
                        px: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: 'white',
                        }}
                    >
                        Logistics Panel
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        {auth.user ? (
                            <Button
                                component={Link}
                                href={route('dashboard')}
                                variant="contained"
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'grey.100',
                                    },
                                }}
                            >
                                Dashboard
                            </Button>
                        ) : (
                            <>
                                <Button
                                    component={Link}
                                    href={route('login')}
                                    startIcon={<LoginIcon />}
                                    variant="outlined"
                                    sx={{
                                        color: 'white',
                                        borderColor: 'white',
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    Log in
                                </Button>
                                <Button
                                    component={Link}
                                    href={route('register')}
                                    startIcon={<RegisterIcon />}
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        '&:hover': {
                                            bgcolor: 'grey.100',
                                        },
                                    }}
                                >
                                    Register
                                </Button>
                            </>
                        )}
                    </Stack>
                </Box>

                {/* Main Content */}
                <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 8 }}>
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Typography
                                variant="h2"
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontWeight: 800,
                                    color: 'white',
                                    mb: 2,
                                }}
                            >
                                Welcome to Logistics Panel
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontWeight: 300,
                                }}
                            >
                                Temperature-Controlled Sample Collection & Management System
                            </Typography>
                        </Box>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4}>
                                <Card
                                    elevation={8}
                                    sx={{
                                        height: '100%',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography
                                            variant="h5"
                                            component="h2"
                                            gutterBottom
                                            sx={{ fontWeight: 600, color: 'primary.main' }}
                                        >
                                            Real-Time Monitoring
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Track temperature and location of samples in real-time during
                                            collection and transport with our advanced monitoring system.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Card
                                    elevation={8}
                                    sx={{
                                        height: '100%',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography
                                            variant="h5"
                                            component="h2"
                                            gutterBottom
                                            sx={{ fontWeight: 600, color: 'primary.main' }}
                                        >
                                            Request Management
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Efficiently manage collection requests from multiple referrers
                                            with automated assignment and tracking capabilities.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Card
                                    elevation={8}
                                    sx={{
                                        height: '100%',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography
                                            variant="h5"
                                            component="h2"
                                            gutterBottom
                                            sx={{ fontWeight: 600, color: 'primary.main' }}
                                        >
                                            Compliance & Reporting
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Maintain complete audit trails and generate comprehensive
                                            reports for regulatory compliance and quality assurance.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>

                {/* Footer */}
                <Box
                    component="footer"
                    sx={{
                        py: 3,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        © {new Date().getFullYear()} Logistics Panel. All rights reserved.
                    </Typography>
                </Box>
            </Box>
        </>
    );
}
