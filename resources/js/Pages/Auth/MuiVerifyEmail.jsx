import { Head, Link, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Typography,
    Alert,
} from '@mui/material';
import { Email as EmailIcon, Logout as LogoutIcon } from '@mui/icons-material';

export default function MuiVerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Email Verification" />

            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: 2,
                }}
            >
                <Container maxWidth="sm">
                    <Card elevation={10} sx={{ borderRadius: 4 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Typography
                                    variant="h4"
                                    component="h1"
                                    gutterBottom
                                    sx={{ fontWeight: 700, color: 'primary.main' }}
                                >
                                    Logistics Panel
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Verify your email address
                                </Typography>
                            </Box>

                            <Alert severity="info" sx={{ mb: 3 }}>
                                Thanks for signing up! Before getting started, could you verify
                                your email address by clicking on the link we just emailed to
                                you? If you didn't receive the email, we will gladly send you
                                another.
                            </Alert>

                            {status === 'verification-link-sent' && (
                                <Alert severity="success" sx={{ mb: 3 }}>
                                    A new verification link has been sent to the email address
                                    you provided during registration.
                                </Alert>
                            )}

                            <Box component="form" onSubmit={submit} noValidate>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={processing}
                                    startIcon={<EmailIcon />}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    {processing ? 'Sending...' : 'Resend Verification Email'}
                                </Button>

                                <Box sx={{ textAlign: 'center', mt: 3 }}>
                                    <Button
                                        component={Link}
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        variant="text"
                                        startIcon={<LogoutIcon />}
                                        sx={{
                                            textTransform: 'none',
                                        }}
                                    >
                                        Log Out
                                    </Button>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ mt: 3, color: 'white' }}
                    >
                        © {new Date().getFullYear()} Logistics Panel. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </>
    );
}
