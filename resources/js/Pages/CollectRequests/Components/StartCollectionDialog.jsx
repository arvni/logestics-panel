import { useMemo, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
} from '@mui/material';
import { DialogHeader } from './DialogComponents/DialogHeader';
import { BarcodeSection } from './DialogComponents/BarcodeSection';
import { DialogFooter } from './DialogComponents/DialogFooter';

export default function StartCollectionDialog({
                                                  open,
                                                  onClose,
                                                  selectedRequest,
                                                  barcodes,
                                                  setBarcodes,
                                                  onStartCollection,
                                              }) {
    // Memoize valid barcodes calculation
    const validBarcodes = useMemo(
        () => barcodes.filter(barcode => barcode.trim() !== ''),
        [barcodes]
    );

    // Memoize handler to prevent unnecessary re-renders
    const handleStartCollection = useCallback(() => {
        onStartCollection();
    }, [onStartCollection]);

    const isEmpty = validBarcodes.length === 0;
    const referrerName = selectedRequest?.referrer?.name || 'Unknown';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogHeader referrerName={referrerName} />

            <DialogContent>
                <BarcodeSection
                    validBarcodes={validBarcodes}
                    barcodes={barcodes}
                    onBarcodesChange={setBarcodes}
                    isEmpty={isEmpty}
                />
            </DialogContent>

            <DialogFooter
                onClose={onClose}
                onStartCollection={handleStartCollection}
                isDisabled={isEmpty}
            />
        </Dialog>
    );
}
