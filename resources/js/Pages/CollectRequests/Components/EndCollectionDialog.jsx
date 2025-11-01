import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    Checkbox,
} from '@mui/material';

export default function EndCollectionDialog({
    open,
    onClose,
    collectRequests,
    selectedRequests,
    onToggleRequest,
    uploadFile,
    onFileChange,
    onEndCollection,
}) {
    const inProgressRequests = collectRequests.filter((req) => req.started_at && !req.ended_at);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>End Collections</DialogTitle>
            <DialogContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Select collections to end and upload temperature data (Excel/CSV).
                </Alert>

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Select Requests to End:
                </Typography>

                <List>
                    {inProgressRequests.map((req) => (
                        <ListItemButton key={req.id} onClick={() => onToggleRequest(req.id)}>
                            <Checkbox
                                checked={selectedRequests.includes(req.id)}
                                tabIndex={-1}
                                disableRipple
                            />
                            <ListItemText
                                primary={`Request #${req.id}`}
                                secondary={`Started: ${new Date(req.started_at).toLocaleString()}`}
                            />
                        </ListItemButton>
                    ))}
                </List>

                {inProgressRequests.length === 0 && (
                    <Alert severity="info">No in-progress collections to end</Alert>
                )}

                <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                    Upload Excel/CSV File
                    <input
                        type="file"
                        hidden
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => onFileChange(e.target.files[0])}
                    />
                </Button>

                {uploadFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Selected: {uploadFile.name}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={onEndCollection}
                    variant="contained"
                    disabled={selectedRequests.length === 0 || !uploadFile}
                >
                    End Collections
                </Button>
            </DialogActions>
        </Dialog>
    );
}
