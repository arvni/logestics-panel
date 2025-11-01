import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    Alert,
    IconButton,
    Dialog,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Scanner, useDevices } from '@yudiel/react-qr-scanner';


export default function CameraScanner({
                                          open,
                                          onBarcodeScanned,
                                          onClose,
                                          barcodeIndex = 1,
                                      }) {
    const [scanned, setScanned] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [torchOn, setTorchOn] = useState(false);
    const scanningTimeoutRef = useRef(null);
    const scannerRef = useRef(null);

    // Optional: List available devices
    const devices = useDevices();
    const hasMultipleCameras = devices.length > 1;

    // Beep sound (base64 encoded short beep)
    const beepSound =
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXzzn0vBSh+zPLaizsKFFm16+mjTxEKRp/g8rpwIAUtgM3y2Ik3CBhku+zooVARC0yl4fG5ZRwFNo3V885+LwUofszy2os7ChRZtevpo08RC0af4PK6cCAFLYDN8tmJNwgYZLvs6KFQEQtMpeHxuWUcBTaN1fPOfi8FKH7M8tqLOwoUWbXr6aNPEQtGn+DyunAgBSh+zPLaizsKFFm16+mjTxELRp/g8rpwIAUtgM3y2Ik3CBhku+zooVARC0yl4fG5ZRwFNo3V885+LwUofszy2os7ChRZtevpo08RC0af4PK6cCAFLYDN8tmJNwgYZLvs6KFQEQtMpeHxuWUcBTaN1fPOfi8FKH7M8tqLOwoUWbXr6aNPEQtGn+Dy';

    const stopScanner = () => {
        setScanned(false);
        setZoom(1);
        setTorchOn(false);
        if (scanningTimeoutRef.current) {
            clearTimeout(scanningTimeoutRef.current);
        }
        onClose();
    };

    const handleScan = (detectedCodes) => {
        if (scanned || detectedCodes.length === 0) return;

        const result = detectedCodes[0];
        console.log('Scanned:', result.rawValue);

        setScanned(true);
        onBarcodeScanned(result.rawValue);

        // Prevent multiple scans
        scanningTimeoutRef.current = setTimeout(() => {
            setScanned(false);
        }, 2000);
    };

    const handleError = (error) => {
        console.error('Scanner error:', error);
    };

    // Custom tracker: draw green box + red corners
    const tracker = (detectedCodes) => {
        detectedCodes.forEach((code) => {
            const { boundingBox, cornerPoints } = code;

            // Draw bounding box
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 4;
            ctx.strokeRect(
                boundingBox.x,
                boundingBox.y,
                boundingBox.width,
                boundingBox.height
            );

            // Draw corner dots
            ctx.fillStyle = '#FF0000';
            cornerPoints.forEach((point) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
                ctx.fill();
            });
        });
    };

    // Zoom handler from Scanner's built-in zoom control
    const handleZoomChange = (newZoom) => {
        setZoom(newZoom);
    };

    // Torch toggle
    const handleTorchToggle = () => {
        setTorchOn((prev) => !prev);
    };

    useEffect(() => {
        return () => {
            if (scanningTimeoutRef.current) {
                clearTimeout(scanningTimeoutRef.current);
            }
        };
    }, []);

    if (!open) return null;

    return (
        <Dialog
            open={open}
            fullScreen
            onClose={stopScanner}
            slotProps={{
                paper: { sx: { bgcolor: 'black', m: 0 } },
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'black',
                    overflow: 'hidden',
                }}
            >
                {/* Close Button */}
                <IconButton
                    onClick={stopScanner}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 10,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                    }}
                >
                    <CloseIcon fontSize="large" />
                </IconButton>

                {/* Info Alert */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                        maxWidth: '80%',
                    }}
                >
                    <Alert severity="info" sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
                        Scanning barcode #{barcodeIndex}. Align inside the green box!
                    </Alert>
                </Box>

                {/* QR Scanner */}
                <Box sx={{ flex: 1, position: 'relative', bgcolor: 'black' }}>
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        paused={scanned}
                        scanDelay={100}
                        constraints={{
                            facingMode: 'environment',
                            // Optional: advanced constraints
                            // width: { ideal: 1920 },
                            // height: { ideal: 1080 },
                        }}
                        components={{
                            tracker,
                            audio: true, // Use custom sound below
                            torch: true,
                            zoom: true,
                            finder: true,
                            onOff: false,
                        }}
                        sound={beepSound}
                        styles={{
                            container: { width: '100%', height: '100%' },
                            video: { objectFit: 'cover' },
                        }}
                        // Forward ref if needed for advanced control
                        ref={scannerRef}
                        formats={['code_128']}
                    />

                    {/* Custom Zoom Display (optional overlay) */}
                    {zoom > 1 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 80,
                                right: 16,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                zIndex: 5,
                            }}
                        >
                            {zoom.toFixed(1)}x
                        </Box>
                    )}
                </Box>

                {/* Bottom Controls (Optional Manual Torch/Zoom) */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 3,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        zIndex: 10,
                    }}
                >
                    {/* Torch Button */}
                    <Button
                        variant="contained"
                        color={torchOn ? 'success' : 'inherit'}
                        onClick={handleTorchToggle}
                        sx={{ minWidth: 100 }}
                    >
                        {torchOn ? 'Torch ON' : 'Torch OFF'}
                    </Button>

                    {/* Camera Switch (if multiple) */}
                    {hasMultipleCameras && (
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => {
                                // Toggle between first two cameras
                                const nextDevice = devices.find(
                                    (d) => d.deviceId !== scannerRef.current?.getActiveTrack()?.getSettings()?.deviceId
                                );
                                if (nextDevice && scannerRef.current?.switchCamera) {
                                    scannerRef.current.switchCamera(nextDevice.deviceId);
                                }
                            }}
                        >
                            Switch Camera
                        </Button>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
}
