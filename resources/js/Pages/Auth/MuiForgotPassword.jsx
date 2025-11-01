import { Head, Link, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Typography,
    Alert,
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';

export default function MuiForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />

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
                                    Reset your password
                                </Typography>
                            </Box>

                            <Alert severity="info" sx={{ mb: 3 }}>
                                Forgot your password? No problem. Just let us know your email
                                address and we will email you a password reset link that will
                                allow you to choose a new one.
                            </Alert>

                            {status && (
                                <Alert severity="success" sx={{ mb: 3 }}>
                                    {status}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={submit} noValidate>
                                <TextField
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    autoComplete="username"
                                    autoFocus
                                    fullWidth
                                    margin="normal"
                                    required
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={processing}
                                    startIcon={<EmailIcon />}
                                    sx={{
                                        mt: 3,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    {processing ? 'Sending...' : 'Email Password Reset Link'}
                                </Button>

                                <Box sx={{ textAlign: 'center', mt: 3 }}>
                                    <Typography
                                        component={Link}
                                        href={route('login')}
                                        variant="body2"
                                        sx={{ textDecoration: 'none' }}
                                    >
                                        Back to login
                                    </Typography>
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
