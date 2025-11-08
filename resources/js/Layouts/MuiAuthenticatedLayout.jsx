import { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    AppBar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Menu,
    MenuItem,
    Avatar,
    Divider,
    useMediaQuery,
    useTheme,
    Tooltip,
    Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CollectionsIcon from '@mui/icons-material/Collections';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const DRAWER_WIDTH = 260;
const MOBILE_DRAWER_WIDTH = 240;

export default function MuiAuthenticatedLayout({ children, title }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    // Memoized handlers for better performance
    const handleDrawerToggle = useCallback(() => {
        setMobileOpen((prev) => !prev);
    }, []);

    const handleMenuOpen = useCallback((event) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleLogout = useCallback(() => {
        router.post(route('logout'), {}, {
            preserveState: false,
            preserveScroll: false,
            onError: (errors) => {
                console.error('Logout error:', errors);
                // Force logout even if there's an error
                window.location.href = '/login';
            },
            onFinish: () => {
                // Clear any cached data
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => {
                            caches.delete(name);
                        });
                    });
                }
            }
        });
    }, []);

    const handleNavigation = useCallback((routeName) => {
        router.visit(route(routeName));
        if (isMobile) setMobileOpen(false);
    }, [isMobile]);

    const menuItems = user.role === 'admin'
        ? [
            { text: 'Dashboard', icon: <DashboardIcon />, route: 'dashboard' },
            { text: 'Users', icon: <PeopleIcon />, route: 'admin.users.index' },
            { text: 'Referrers', icon: <LocationOnIcon />, route: 'admin.referrers.index' },
            { text: 'Collect Requests', icon: <AssignmentIcon />, route: 'admin.collect-requests.index' },
        ]
        : [
            { text: 'Dashboard', icon: <DashboardIcon />, route: 'dashboard' },
            { text: 'My Collections', icon: <CollectionsIcon />, route: 'collect-requests.index' },
        ];

    const drawer = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: 'background.paper',
            }}
        >
            {/* Drawer Header */}
            <Box
                sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ fontWeight: 700, letterSpacing: 0.5 }}
                    >
                        Logistics Panel
                    </Typography>
                    {isMobile && (
                        <IconButton
                            onClick={handleDrawerToggle}
                            size="small"
                            sx={{ color: 'inherit' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Logistics Management
                </Typography>
            </Box>
            <Divider />

            {/* Navigation Items */}
            <List sx={{ flex: 1, py: 1 }}>
                {menuItems.map((item) => {
                    const isActive = route().current(item.route);
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={isActive}
                                onClick={() => handleNavigation(item.route)}
                                sx={{
                                    mx: 1,
                                    borderRadius: 1,
                                    transition: 'all 0.3s ease',
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.light',
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                        },
                                    },
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? 'primary.main' : 'inherit',
                                        minWidth: 40,
                                        transition: 'color 0.3s ease',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        '& .MuiListItemText-primary': {
                                            fontWeight: isActive ? 600 : 500,
                                        },
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* User Info at Bottom */}
            <Divider />
            <Box
                sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'primary.main',
                            fontSize: '0.9rem',
                        }}
                    >
                        {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {user.name}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {user.email}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                elevation={2}
                sx={{
                    width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
                    bgcolor: 'primary.main',
                    borderTopRightRadius:0,
                    borderTopLeftRadius:0,
                }}
            >
                <Toolbar
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        minHeight: { xs: 56, sm: 64 },
                        px: { xs: 1, sm: 2, md: 3 },
                    }}
                >
                    {/* Mobile Menu Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Toggle menu">
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ display: { md: 'none' } }}
                                size="medium"
                            >
                                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Title */}
                    <Typography
                        variant={isSmallMobile ? 'body1' : 'h6'}
                        noWrap
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 600,
                            textAlign: 'center',
                            px: 1,
                        }}
                    >
                        {title}
                    </Typography>

                    {/* User Menu Button */}
                    <Tooltip title="Account menu">
                        <IconButton
                            onClick={handleMenuOpen}
                            size="small"
                            aria-controls="account-menu"
                            aria-haspopup="true"
                            aria-expanded={menuOpen ? 'true' : undefined}
                            sx={{
                                p: 0.5,
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                },
                                borderRadius: '50%',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: { xs: 32, sm: 40 },
                                    height: { xs: 32, sm: 40 },
                                    bgcolor: 'secondary.main',
                                    fontSize: { xs: '0.75rem', sm: '1rem' },
                                    fontWeight: 700,
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                }}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    {/* Account Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={menuOpen}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        sx={{
                            mt: 1,
                            '& .MuiPaper-root': {
                                minWidth: 240,
                            },
                        }}
                    >
                        <MenuItem disabled sx={{ py: 1.5 }}>
                            <ListItemIcon>
                                <AccountCircleIcon fontSize="small" />
                            </ListItemIcon>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {user.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {user.email}
                                </Typography>
                            </Box>
                        </MenuItem>
                        <Divider />
                        <MenuItem
                            onClick={() => {
                                handleMenuClose();
                                router.visit(route('profile.edit'));
                            }}
                            sx={{
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                        >
                            <ListItemIcon>
                                <AccountCircleIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2">Profile</Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'error.light',
                                    color: 'error.main',
                                },
                            }}
                        >
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" sx={{ color: 'inherit' }} />
                            </ListItemIcon>
                            <Typography variant="body2">Logout</Typography>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Side Navigation */}
            <Box
                component="nav"
                sx={{
                    width: { xs: 0, md: DRAWER_WIDTH },
                    flexShrink: { md: 0 },
                }}
                aria-label="mailbox folders"
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: MOBILE_DRAWER_WIDTH,
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            mt: '64px',
                            height: 'calc(100vh - 64px)',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 2, md: 3 },
                    width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: { xs: 7, sm: 8 },
                    minHeight: 'calc(100vh - 64px)',
                    bgcolor: 'background.default',
                }}
            >
                <Container
                    maxWidth="lg"
                    disableGutters
                    sx={{
                        '@media (max-width: 600px)': {
                            px: 0,
                        },
                    }}
                >
                    {children}
                </Container>
            </Box>
        </Box>
    );
}
