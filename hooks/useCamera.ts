import { useRef, useState, useCallback, useEffect } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const healthCheckTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [zoom, setZoomValue] = useState(1);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number } | null>(null);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [reconnectCount, setReconnectCount] = useState(0);

  const stopCamera = useCallback(() => {
    // Clear all timers
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (healthCheckTimer.current) clearInterval(healthCheckTimer.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setIsInitializing(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const getDevices = useCallback(async () => {
    try {
      // Request permission first so device labels are visible
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
      return videoDevices;
    } catch (e) {
      console.error('Error enumerating devices:', e);
      return [];
    }
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    stopCamera();
    setError(null);
    setIsInitializing(true);
    if (deviceId) setCurrentDeviceId(deviceId);

    // Resolution ladder: try highest first, fall back on failure
    const resolutions = [
      { width: 1920, height: 1080 }, // Full HD - ideal for CCTV
      { width: 1280, height: 720  }, // HD
      { width: 640,  height: 480  }, // SD fallback
    ];

    const tryWithResolution = async (w: number, h: number, id?: string): Promise<MediaStream> => {
      const constraints: MediaStreamConstraints = {
        video: {
          width:  { ideal: w },
          height: { ideal: h },
          frameRate: { ideal: 30, min: 10 },
          // CCTV cameras often need these relaxed
          ...(id ? { deviceId: { exact: id } } : {}),
        },
        audio: false,
      };
      return navigator.mediaDevices.getUserMedia(constraints);
    };

    let stream: MediaStream | null = null;

    // Try each resolution with the requested device
    for (const res of resolutions) {
      try {
        stream = await tryWithResolution(res.width, res.height, deviceId);
        break;
      } catch (err: any) {
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          // Device gone - stop trying resolutions
          break;
        }
        // OverconstrainedError or other - try lower resolution
        console.warn(`Resolution ${res.width}x${res.height} failed, trying lower...`);
      }
    }

    // If specific device failed, fall back to any available camera
    if (!stream && deviceId) {
      console.warn('Requested camera unavailable, falling back to default.');
      for (const res of resolutions) {
        try {
          stream = await tryWithResolution(res.width, res.height, undefined);
          break;
        } catch { /* continue */ }
      }
    }

    if (!stream) {
      setIsActive(false);
      setIsInitializing(false);
      setError('Could not access any camera. Check connections and browser permissions.');
      return;
    }

    streamRef.current = stream;

    // Handle stream ending unexpectedly (CCTV disconnect)
    stream.getVideoTracks().forEach(track => {
      track.onended = () => {
        console.warn('Camera stream ended unexpectedly. Attempting reconnect...');
        setIsActive(false);
        setError('Camera disconnected. Reconnecting...');
        // Auto-reconnect after 3 seconds
        reconnectTimer.current = setTimeout(() => {
          setReconnectCount(c => c + 1);
          startCamera(deviceId);
        }, 3000);
      };
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        setIsActive(true);
        setIsInitializing(false);
        setError(null);
        setReconnectCount(0);
      };
      videoRef.current.onerror = () => {
        setError('Video stream error. Check camera connection.');
        setIsActive(false);
      };
      try {
        await videoRef.current.play();
      } catch (playErr) {
        console.warn('Autoplay blocked:', playErr);
      }
    }

    // Re-enumerate to get labels after permission granted
    await getDevices();

    // Check zoom capability (supported on some CCTV/USB cameras)
    const track = stream.getVideoTracks()[0];
    const caps = (track as any).getCapabilities?.() || {};
    if (caps.zoom) {
      setZoomRange({ min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step || 0.1 });
    }

    // Health check: detect frozen/stalled streams every 10s
    let lastTime = -1;
    healthCheckTimer.current = setInterval(() => {
      if (!videoRef.current || !streamRef.current) return;
      const currentTime = videoRef.current.currentTime;
      if (lastTime === currentTime && isActive) {
        console.warn('Stream appears frozen. Reconnecting...');
        setError('Stream frozen. Reconnecting...');
        reconnectTimer.current = setTimeout(() => startCamera(deviceId), 2000);
      }
      lastTime = currentTime;
    }, 10000);

  }, [stopCamera, getDevices]);

  // Listen for device plug/unplug (CCTV connect/disconnect)
  useEffect(() => {
    getDevices();
    const handleDeviceChange = async () => {
      const updated = await getDevices();
      // If current device was unplugged, show warning
      if (currentDeviceId && !updated.find(d => d.deviceId === currentDeviceId)) {
        setError('Camera disconnected. Please select another camera.');
        setIsActive(false);
      }
    };
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      stopCamera();
    };
  }, [getDevices, stopCamera, currentDeviceId]);

  const captureFrame = useCallback((quality = 0.92) => {
    if (!videoRef.current || !isActive) return null;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width  = video.videoWidth  || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', quality);
    } catch (e) {
      console.error('Frame capture failed:', e);
      return null;
    }
  }, [isActive]);

  const setZoom = useCallback(async (val: number) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      try {
        await (track as any).applyConstraints({ advanced: [{ zoom: val }] });
        setZoomValue(val);
      } catch (e) {
        console.warn('Zoom not supported on this camera:', e);
      }
    }
  }, []);

  const switchCamera = useCallback(async (deviceId: string) => {
    setCurrentDeviceId(deviceId);
    localStorage.setItem('kereo_preferred_camera', deviceId);
    await startCamera(deviceId);
  }, [startCamera]);

  return {
    videoRef,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame,
    isActive,
    isInitializing,
    error,
    zoom,
    zoomRange,
    setZoom,
    devices,
    currentDeviceId,
    reconnectCount,
    refreshDevices: getDevices,
  };
};
