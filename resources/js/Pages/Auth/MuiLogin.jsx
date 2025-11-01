import { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Typography,
    Link,
    Alert,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import ReCAPTCHA from 'react-google-recaptcha';

export default function MuiLogin({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const [recaptchaValue, setRecaptchaValue] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        // In production, verify recaptchaValue exists
        post(route('login'));
    };

    return (
        <>
            <Head title="Log in" />

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
                                    Sign in to your account
                                </Typography>
                            </Box>

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

                                <TextField
                                    id="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    autoComplete="current-password"
                                    fullWidth
                                    margin="normal"
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {canResetPassword && (
                                    <Box sx={{ textAlign: 'right', mt: 1 }}>
                                        <Link
                                            href={route('password.request')}
                                            underline="hover"
                                            variant="body2"
                                        >
                                            Forgot your password?
                                        </Link>
                                    </Box>
                                )}

                                <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center' }}>
                                    <ReCAPTCHA
                                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                                        onChange={setRecaptchaValue}
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={processing}
                                    startIcon={<LoginIcon />}
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    {processing ? 'Signing in...' : 'Sign In'}
                                </Button>
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
