import { DialogActions, Button } from '@mui/material';

export function DialogFooter({
                                 onClose,
                                 onStartCollection,
                                 isDisabled,
                             }) {
    return (
        <DialogActions>
            <Button onClick={onClose}>
                Cancel
            </Button>

            <Button
                variant="contained"
                onClick={onStartCollection}
                disabled={isDisabled}
            >
                Start Collection
            </Button>
        </DialogActions>
    );
}
