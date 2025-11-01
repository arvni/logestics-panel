import { Box, TextField, IconButton } from '@mui/material';
import { memo } from 'react';
import {
    CameraAlt as CameraIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

/**
 * BarcodeRow Component
 *
 * A lightweight, presentational component for a single barcode input row.
 * Memoized to prevent unnecessary re-renders when other rows change.
 *
 * Props:
 * - barcode: string - The barcode value
 * - index: number - The row index for display
 * - onUpdate: function - Callback when barcode value changes
 * - onRemove: function - Callback when remove button is clicked
 * - isDisabled: boolean - Whether to disable all inputs
 * - onOpenScanner: function - Callback to open the camera scanner
 */
const BarcodeRow = memo(function BarcodeRow({
                                                barcode,
                                                index,
                                                onUpdate,
                                                onRemove,
                                                isDisabled,
                                                onOpenScanner,
                                            }) {
    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            {/* Barcode Input Field */}
            <TextField
                fullWidth
                label={`Barcode ${index + 1}`}
                value={barcode}
                onChange={(e) => onUpdate(e.target.value)}
                disabled={isDisabled}
                size="medium"
                placeholder="Enter barcode or scan"
            />

            {/* Camera Scanner Button */}
            <IconButton
                onClick={onOpenScanner}
                disabled={isDisabled}
                sx={{
                    mt:1,
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    }
                }}
                title="Open camera to scan barcode"
            >
                <CameraIcon />
            </IconButton>

            {/* Remove Button */}
            <IconButton
                color="error"
                onClick={onRemove}
                disabled={isDisabled}
                sx={{
                    mt: 1,
                    '&:hover': {
                        backgroundColor: 'error.lighter',
                    }
                }}
                title="Delete this barcode"
            >
                <DeleteIcon />
            </IconButton>
        </Box>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for memo
    // Return true if props are equal (skip re-render)
    return (
        prevProps.barcode === nextProps.barcode &&
        prevProps.index === nextProps.index &&
        prevProps.isDisabled === nextProps.isDisabled
    );
});

BarcodeRow.displayName = 'BarcodeRow';

export default BarcodeRow;
