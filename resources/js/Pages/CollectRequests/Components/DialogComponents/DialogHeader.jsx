import { DialogTitle } from '@mui/material';

export function DialogHeader({ referrerName }) {
    return (
        <DialogTitle>
            Start Collection - {referrerName}
        </DialogTitle>
    );
}
