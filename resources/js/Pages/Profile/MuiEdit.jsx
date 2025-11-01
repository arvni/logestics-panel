import { useState, useRef } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Stack,
    Divider,
} from '@mui/material';
import { Head } from '@inertiajs/react';
import MuiAuthenticatedLayout from '@/Layouts/MuiAuthenticatedLayout';

export default function MuiEdit({ mustVerifyEmail, status }) {
    return (
        <MuiAuthenticatedLayout title="Profile">
            <Head title="Profile" />
            <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
                <UpdateProfileInformation mustVerifyEmail={mustVerifyEmail} status={status} />
                <UpdatePassword />
                <DeleteAccount />
            </Stack>
        </MuiAuthenticatedLayout>
    );
}

function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => setShowSuccess(true),
        });
    };

    const handleResendVerification = () => {
        router.post(route('verification.send'));
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Profile Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Update your account's profile information and email address.
            </Typography>

            <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    <TextField
                        label="Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                        fullWidth
                        autoComplete="name"
                        autoFocus
                    />

                    <TextField
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                        required
                        fullWidth
                        autoComplete="username"
                    />

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <Alert severity="warning" action={
                            <Button color="inherit" size="small" onClick={handleResendVerification}>
                                Resend
                            </Button>
                        }>
                            Your email address is unverified.
                        </Alert>
                    )}

                    {status === 'verification-link-sent' && (
                        <Alert severity="success">
                            A new verification link has been sent to your email address.
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={processing}
                        >
                            Save
                        </Button>
                        {recentlySuccessful && (
                            <Typography variant="body2" color="text.secondary">
                                Saved.
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </form>

            <Snackbar
                open={showSuccess}
                autoHideDuration={3000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setShowSuccess(false)} severity="success">
                    Profile updated successfully!
                </Alert>
            </Snackbar>
        </Paper>
    );
}

function UpdatePassword() {
    const [showSuccess, setShowSuccess] = useState(false);
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowSuccess(true);
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Update Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ensure your account is using a long, random password to stay secure.
            </Typography>

            <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    <TextField
                        label="Current Password"
                        type="password"
                        inputRef={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        error={!!errors.current_password}
                        helperText={errors.current_password}
                        fullWidth
                        autoComplete="current-password"
                    />

                    <TextField
                        label="New Password"
                        type="password"
                        inputRef={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={!!errors.password}
                        helperText={errors.password}
                        fullWidth
                        autoComplete="new-password"
                    />

                    <TextField
                        label="Confirm Password"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation}
                        fullWidth
                        autoComplete="new-password"
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={processing}
                        >
                            Save
                        </Button>
                        {recentlySuccessful && (
                            <Typography variant="body2" color="text.secondary">
                                Saved.
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </form>

            <Snackbar
                open={showSuccess}
                autoHideDuration={3000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setShowSuccess(false)} severity="success">
                    Password updated successfully!
                </Alert>
            </Snackbar>
        </Paper>
    );
}

function DeleteAccount() {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        clearErrors();
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => handleClose(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Delete Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Once your account is deleted, all of its resources and data will be permanently deleted.
                Before deleting your account, please download any data or information that you wish to retain.
            </Typography>

            <Button variant="contained" color="error" onClick={handleOpen}>
                Delete Account
            </Button>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        Are you sure you want to delete your account?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Once your account is deleted, all of its resources and data will be permanently deleted.
                            Please enter your password to confirm you would like to permanently delete your account.
                        </DialogContentText>
                        <TextField
                            label="Password"
                            type="password"
                            inputRef={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                            fullWidth
                            autoFocus
                            placeholder="Password"
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleClose} color="inherit">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="error"
                            disabled={processing}
                        >
                            Delete Account
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Paper>
    );
}
