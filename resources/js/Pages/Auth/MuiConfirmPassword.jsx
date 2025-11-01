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
    Alert,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOpen as ConfirmIcon } from '@mui/icons-material';

export default function MuiConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <>
            <Head title="Confirm Password" />

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
                                    Confirm your password
                                </Typography>
                            </Box>

                            <Alert severity="info" sx={{ mb: 3 }}>
                                This is a secure area of the application. Please confirm your
                                password before continuing.
                            </Alert>

                            <Box component="form" onSubmit={submit} noValidate>
                                <TextField
                                    id="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    autoComplete="current-password"
                                    autoFocus
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

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={processing}
                                    startIcon={<ConfirmIcon />}
                                    sx={{
                                        mt: 3,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    {processing ? 'Confirming...' : 'Confirm'}
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
