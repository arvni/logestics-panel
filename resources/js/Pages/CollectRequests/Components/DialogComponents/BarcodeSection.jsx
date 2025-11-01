import { Alert, Box, Typography } from '@mui/material';
import BarcodeScanner from '../BarcodeScanner';

export function BarcodeSection({
                                   validBarcodes,
                                   barcodes,
                                   onBarcodesChange,
                                   isEmpty,
                               }) {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Barcodes ({validBarcodes.length} valid):
            </Typography>

            <BarcodeScanner
                barcodes={barcodes}
                onBarcodesChange={onBarcodesChange}
            />

            {isEmpty && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    You must enter or scan at least one barcode to start the
                    collection.
                </Alert>
            )}
        </Box>
    );
}
