import {useState} from 'react';
import {
    Box,
    Button,
    Alert,
    Stack,
} from '@mui/material';
import {
    Add as AddIcon,
} from '@mui/icons-material';
import CameraScanner from './CameraScanner';
import BarcodeRow from './BarcodeRow';

/**
 * BarcodeScanner Component
 *
 * Main container component that manages:
 * - The barcode list state
 * - Single shared CameraScanner instance
 * - Communication between BarcodeRow components and CameraScanner
 *
 * Props:
 * - barcodes: array - Array of barcode strings
 * - onBarcodesChange: function - Callback when barcodes list changes
 */
export default function BarcodeScanner({barcodes = [], onBarcodesChange}) {
    const [scannerOpen, setScannerOpen] = useState(false);
    const [activeScanIndex, setActiveScanIndex] = useState(null);

    /**
     * Update a specific barcode value
     */
    const updateBarcode = (index, value) => {
        const updated = [...barcodes];
        updated[index] = value;
        onBarcodesChange(updated);
    };

    /**
     * Remove a barcode from the list
     */
    const removeBarcode = (index) => {
        const updated = barcodes.filter((_, i) => i !== index);
        onBarcodesChange(updated);
    };

    /**
     * Add a new empty barcode to the list
     */
    const addBarcode = () => {
        onBarcodesChange([...barcodes, '']);
    };

    /**
     * Open scanner for a specific barcode row
     */
    const handleOpenScanner = (index) => {
        setActiveScanIndex(index);
        setScannerOpen(true);
    };

    /**
     * Close the scanner
     */
    const handleCloseScanner = () => {
        setScannerOpen(false);
        setActiveScanIndex(null);
    };

    /**
     * Handle barcode scanned result
     */
    const handleBarcodeScanned = (barcode) => {
        if (activeScanIndex !== null) {
            updateBarcode(activeScanIndex, barcode);
        }
        handleCloseScanner();
    };

    return (
        <Box>
            {/*
                Single Shared CameraScanner
                Efficient: Only one instance for all rows
                Opens fullscreen dialog when needed
            */}
            {scannerOpen && <CameraScanner
                open={scannerOpen}
                barcodeIndex={activeScanIndex !== null ? activeScanIndex + 1 : 1}
                onBarcodeScanned={handleBarcodeScanned}
                onClose={handleCloseScanner}
            />}

            {/* Barcode Input Fields Stack */}
            <Stack spacing={2}>
                {barcodes.length === 0 ? (
                    // Empty state
                    <Alert severity="info">
                        Click "Add Barcode" to start adding barcodes
                    </Alert>
                ) : (
                    // Barcode rows
                    barcodes.map((barcode, index) => (
                        <BarcodeRow
                            key={index}
                            barcode={barcode}
                            index={index}
                            onUpdate={(value) => updateBarcode(index, value)}
                            onRemove={() => removeBarcode(index)}
                            isDisabled={scannerOpen}
                            onOpenScanner={() => handleOpenScanner(index)}
                        />
                    ))
                )}

                {/* Add Barcode Button */}
                <Button
                    variant="outlined"
                    startIcon={<AddIcon/>}
                    onClick={addBarcode}
                    disabled={scannerOpen}
                    fullWidth
                >
                    Add Barcode
                </Button>
            </Stack>
        </Box>
    );
}
