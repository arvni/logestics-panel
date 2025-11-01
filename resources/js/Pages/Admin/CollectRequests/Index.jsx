import { useState, useEffect } from 'react';
import MuiAuthenticatedLayout from '@/Layouts/MuiAuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Assignment as AssignmentIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';

export default function Index({ auth }) {
    const [collectRequests, setCollectRequests] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [operators, setOperators] = useState([]);
    const [referrers, setReferrers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedOperator, setSelectedOperator] = useState('');
    const [createFormData, setCreateFormData] = useState({
        user_id: '',
        referrer_id: '',
        server_id: '',
    });

    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [requestsRes, operatorsRes, referrersRes] = await Promise.all([
                axios.get('/api/admin/collect-requests', {
                    params: {
                        page: page + 1,
                        per_page: rowsPerPage,
                    },
                }),
                axios.get('/api/admin/operators'),
                axios.get('/api/admin/referrers'),
            ]);
            setCollectRequests(requestsRes.data.data || []);
            setTotal(requestsRes.data.total || 0);
            setOperators(operatorsRes.data);
            setReferrers(referrersRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssignDialog = (request) => {
        setSelectedRequest(request);
        setSelectedOperator(request.user_id || '');
        setAssignDialogOpen(true);
    };

    const handleCloseAssignDialog = () => {
        setAssignDialogOpen(false);
        setSelectedRequest(null);
        setSelectedOperator('');
    };

    const handleAssign = async () => {
        if (!selectedOperator) {
            alert('Please select an operator');
            return;
        }

        try {
            await axios.post('/api/admin/collect-requests/assign', {
                request_id: selectedRequest.id,
                operator_id: selectedOperator,
            });
            handleCloseAssignDialog();
            fetchData();
        } catch (error) {
            console.error('Error assigning request:', error);
            alert(error.response?.data?.message || 'Failed to assign request');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this collect request?')) {
            return;
        }

        try {
            await axios.delete(`/api/admin/collect-requests/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('Failed to delete request');
        }
    };

    const handleOpenCreateDialog = () => {
        setCreateFormData({
            user_id: '',
            referrer_id: '',
            server_id: '',
        });
        setCreateDialogOpen(true);
    };

    const handleCloseCreateDialog = () => {
        setCreateDialogOpen(false);
    };

    const handleCreateRequest = async () => {
        if (!createFormData.user_id) {
            alert('Please select an operator');
            return;
        }

        try {
            await axios.post('/api/admin/collect-requests', {
                user_id: createFormData.user_id,
                referrer_id: createFormData.referrer_id || null,
                server_id: createFormData.server_id || null,
            });
            handleCloseCreateDialog();
            fetchData();
        } catch (error) {
            console.error('Error creating request:', error);
            alert(error.response?.data?.message || 'Failed to create request');
        }
    };

    const getStatusChip = (request) => {
        if (request.ended_at) {
            return <Chip label="Completed" color="success" size="small" />;
        } else if (request.started_at) {
            return <Chip label="In Progress" color="primary" size="small" />;
        } else {
            return <Chip label="Not Started" color="default" size="small" />;
        }
    };

    return (
        <MuiAuthenticatedLayout title="Collect Request Management">
            <Head title="Collect Request Management" />

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Collect Request Management
                    </Typography>
                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreateDialog}
                            sx={{ mr: 1 }}
                        >
                            Create Request
                        </Button>
                        <IconButton onClick={fetchData}>
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Operator</TableCell>
                                <TableCell>Referrer</TableCell>
                                <TableCell>Server ID</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Started At</TableCell>
                                <TableCell>Ended At</TableCell>
                                <TableCell>Barcodes</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {collectRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.id}</TableCell>
                                    <TableCell>
                                        {request.user ? request.user.name : 'Unassigned'}
                                    </TableCell>
                                    <TableCell>
                                        {request.referrer ? request.referrer.name : '-'}
                                    </TableCell>
                                    <TableCell>{request.server_id || '-'}</TableCell>
                                    <TableCell>{getStatusChip(request)}</TableCell>
                                    <TableCell>
                                        {request.started_at
                                            ? new Date(request.started_at).toLocaleString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {request.ended_at
                                            ? new Date(request.ended_at).toLocaleString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {request.barcodes && request.barcodes.length > 0
                                            ? request.barcodes.length
                                            : 0}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenAssignDialog(request)}
                                            color="primary"
                                            title="Assign to Operator"
                                        >
                                            <AssignmentIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(request.id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />

                {/* Assign Dialog */}
                <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Assign to Operator</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Request ID: {selectedRequest?.id}
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Select Operator</InputLabel>
                            <Select
                                value={selectedOperator}
                                label="Select Operator"
                                onChange={(e) => setSelectedOperator(e.target.value)}
                            >
                                {operators.map((operator) => (
                                    <MenuItem key={operator.id} value={operator.id}>
                                        {operator.name} ({operator.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAssignDialog}>Cancel</Button>
                        <Button
                            onClick={handleAssign}
                            variant="contained"
                            disabled={!selectedOperator}
                        >
                            Assign
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Create Request Dialog */}
                <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Create New Collection Request</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Select Operator *</InputLabel>
                            <Select
                                value={createFormData.user_id}
                                label="Select Operator *"
                                onChange={(e) => setCreateFormData({ ...createFormData, user_id: e.target.value })}
                            >
                                {operators.map((operator) => (
                                    <MenuItem key={operator.id} value={operator.id}>
                                        {operator.name} ({operator.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Select Referrer (Optional)</InputLabel>
                            <Select
                                value={createFormData.referrer_id}
                                label="Select Referrer (Optional)"
                                onChange={(e) => setCreateFormData({ ...createFormData, referrer_id: e.target.value })}
                            >
                                <MenuItem value="">None</MenuItem>
                                {referrers.map((referrer) => (
                                    <MenuItem key={referrer.id} value={referrer.id}>
                                        {referrer.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Server ID (Optional)"
                            fullWidth
                            value={createFormData.server_id}
                            onChange={(e) => setCreateFormData({ ...createFormData, server_id: e.target.value })}
                            sx={{ mt: 2 }}
                        />

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Note: The operator will scan barcodes when they start the collection.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCreateDialog}>Cancel</Button>
                        <Button
                            onClick={handleCreateRequest}
                            variant="contained"
                            disabled={!createFormData.user_id}
                        >
                            Create Request
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </MuiAuthenticatedLayout>
    );
}
