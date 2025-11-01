import { useEffect } from 'react';
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
import { AppRegistration as RegisterIcon } from '@mui/icons-material';

export default function MuiRegister() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <>
            <Head title="Register" />

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
                                    Create your account
                                </Typography>
                            </Box>

                            <Box component="form" onSubmit={submit} noValidate>
                                <TextField
                                    id="name"
                                    label="Name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    autoComplete="name"
                                    autoFocus
                                    fullWidth
                                    margin="normal"
                                    required
                                />

                                <TextField
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    autoComplete="username"
                                    fullWidth
                                    margin="normal"
                                    required
                                />

                                <TextField
                                    id="password"
                                    label="Password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    autoComplete="new-password"
                                    fullWidth
                                    margin="normal"
                                    required
                                />

                                <TextField
                                    id="password_confirmation"
                                    label="Confirm Password"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    error={!!errors.password_confirmation}
                                    helperText={errors.password_confirmation}
                                    autoComplete="new-password"
                                    fullWidth
                                    margin="normal"
                                    required
                                />

                                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography
                                        component={Link}
                                        href={route('login')}
                                        variant="body2"
                                        sx={{ textDecoration: 'none' }}
                                    >
                                        Already registered?
                                    </Typography>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={processing}
                                        startIcon={<RegisterIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                        }}
                                    >
                                        Register
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
