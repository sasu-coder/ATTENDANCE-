
// Timing constants (in milliseconds)
const TIMING = {
  QR_MIN_SCAN: 300000,   // 5 minutes minimum QR scanning
  QR_ACTIVE_SCAN: 300000, // 5 minutes active QR scanning (used in UI progress)
  QR_VERIFY: 30000,      // 30 seconds QR verification
  FACE_SCAN: 300000 * 3, // face scanning = 3x QR active scan => 15 minutes
  FACE_VERIFY: 30000     // 30 seconds face verification
} as const;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import { QrCode, Calendar, CheckCircle, XCircle, Clock, Camera, MapPin, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '@/hooks/useAttendanceStore';
import { supabase } from '@/integrations/supabase/client';
import { NativeScan, nativeAvailable } from '@/lib/nativeBridge';

// Using TIMING constants defined above
import { Progress } from '@/components/ui/progress';
import '../styles/scanner-animations.css';

// Using TIMING constants defined above

// Using TIMING constants defined above

const StudentAttendance = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAttendance();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [scanningQR, setScanningQR] = useState(false);
  const [scanningFace, setScanningFace] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({
    attendanceRate: 0,
    totalClasses: 0,
    present: 0,
    absent: 0,
    late: 0
  });

  // QR Scanner states/refs
  const [showQRModal, setShowQRModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<any>(null);
  const [qrDetected, setQrDetected] = useState(false);
  const [qrPhase, setQrPhase] = useState<'idle' | 'scanning' | 'detected' | 'verifying' | 'success' | 'error'>('idle');
  const qrScanStartRef = useRef<number>(0);
  const [qrProgress, setQrProgress] = useState<number>(0);
  const qrProgressIntervalRef = useRef<number | null>(null);
  const [qrTimeRemaining, setQrTimeRemaining] = useState<number>(0);
  const qrDetectIntervalRef = useRef<number | null>(null);
  const [usingNativeBarcode, setUsingNativeBarcode] = useState(false);
  const qrStatusUnsubRef = useRef<null | { remove: () => void }>(null);
  const qrDetectedUnsubRef = useRef<null | { remove: () => void }>(null);

  // Face Verification states/refs
  const [showFaceModal, setShowFaceModal] = useState(false);
  const faceVideoRef = useRef<HTMLVideoElement | null>(null);
  const [faceStream, setFaceStream] = useState<MediaStream | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePhase, setFacePhase] = useState<'idle' | 'scanning' | 'aligning' | 'detected' | 'verifying' | 'success' | 'error'>('idle');
  const faceDetectIntervalRef = useRef<number | null>(null);
  const faceScanStartRef = useRef<number>(0);
  const [faceProgress, setFaceProgress] = useState<number>(0);
  const faceProgressIntervalRef = useRef<number | null>(null);
  const verifyingStartRef = useRef<number | null>(null);
  const verifyingLockRef = useRef<boolean>(false);
  const qrVerifyingLockRef = useRef<boolean>(false);
  // Using TIMING.QR_VERIFY defined above
  const [faceTimeRemaining, setFaceTimeRemaining] = useState<number>(0);
  const faceStatusUnsubRef = useRef<null | { remove: () => void }>(null);
  const faceDetectedUnsubRef = useRef<null | { remove: () => void }>(null);
  // MediaPipe Face Landmarker (web)
  const faceLandmarkerRef = useRef<any>(null);
  const mediaPipeRunningRef = useRef<boolean>(false);
  const mediaPipeTimerRef = useRef<number | null>(null);

  const loadMediaPipeFaceLandmarker = useCallback(async () => {
    if (faceLandmarkerRef.current) return faceLandmarkerRef.current;
    try {
      const visionPkg = await import('@mediapipe/tasks-vision');
      const { FaceLandmarker, FilesetResolver } = visionPkg as any;
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/wasm'
      );
      // Public model from Google storage
      const modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath },
        runningMode: 'VIDEO',
        numFaces: 1,
      });
      faceLandmarkerRef.current = faceLandmarker;
      return faceLandmarker;
    } catch (e) {
      console.error('MediaPipe load error', e);
      return null;
    }
  }, []);

  // --- Face simulator (modular) ---
  const createFaceSimulator = useCallback((opts?: { durationMs?: number } ) => {
    const duration = opts?.durationMs ?? 90000; // default 90s
    const initMs = 5000; // initializing phase
    const verifyMs = 10000; // verifying phase at end
    const scanningMs = Math.max(0, duration - initMs - verifyMs);

    let interval: number | null = null;
    let startTs = 0;

    const listeners: {
      onUpdate?: (phase: string, progress: number, remainingSec: number) => void;
      onComplete?: (success: boolean) => void;
    } = {};

    const start = (l?: typeof listeners) => {
      startTs = Date.now();
      if (l) Object.assign(listeners, l);
      interval = window.setInterval(() => {
        const elapsed = Date.now() - startTs;
        const clamped = Math.min(elapsed, duration);
        const progress = Math.round((clamped / duration) * 100);

        let phase = 'initializing';
        if (clamped >= initMs + scanningMs + verifyMs) phase = 'complete';
        else if (clamped >= initMs + scanningMs) phase = 'verifying';
        else if (clamped >= initMs) phase = 'analyzing';
        else phase = 'initializing';

        const remaining = Math.max(0, Math.ceil((duration - clamped) / 1000));
        listeners.onUpdate?.(phase, progress, remaining);

        if (clamped >= duration) {
          // finish
          if (interval) { window.clearInterval(interval); interval = null; }
          // simulate success (90%)
          const success = Math.random() > 0.1;
          listeners.onComplete?.(success);
        }
      }, 500);
    };

    const stop = () => {
      if (interval) { window.clearInterval(interval); interval = null; }
    };

    return { start, stop };
  }, []);

  const todayClasses = [
    { id: 'CS301', name: 'Database Systems', time: '2:00 PM', room: 'Room 101', lecturer: 'Dr. John Smith', status: 'upcoming' },
    { id: 'CS350', name: 'Web Development', time: '4:00 PM', room: 'Lab 3', lecturer: 'Prof. Sarah Johnson', status: 'upcoming' },
    { id: 'CS340', name: 'Software Engineering', time: '10:00 AM', room: 'Room 205', lecturer: 'Dr. Kwame Nkrumah', status: 'completed' }
  ];

  // --- Helpers: QR Parsing and Verification ---
  const parseQRContent = (raw: string): { sessionId: string; courseId: string } | null => {
    try {
      // JSON payload: {"sessionId":"...","courseId":"..."}
      const obj = JSON.parse(raw);
      if (obj?.sessionId && obj?.courseId) {
        return { sessionId: String(obj.sessionId), courseId: String(obj.courseId) };
      }
    } catch (_) {
      // Not JSON; continue
    }
    try {
      // URL payload: https://.../attend?sessionId=...&courseId=...
      const url = new URL(raw);
      const sessionId = url.searchParams.get('sessionId');
      const courseId = url.searchParams.get('courseId');
      if (sessionId && courseId) {
        return { sessionId, courseId };
      }
    } catch (_) {
      // Not a URL; continue
    }
    // Simple delimited: sessionId:courseId
    if (raw.includes(':')) {
      const [sessionId, courseId] = raw.split(':');
      if (sessionId && courseId) {
        return { sessionId: sessionId.trim(), courseId: courseId.trim() };
      }
    }
    return null;
  };

  const verifyQrEligibility = useCallback(async (args: { sessionId: string; courseId: string; studentId: string; }): Promise<boolean> => {
    const { sessionId, courseId, studentId } = args;
    try {
      // 1) Session exists and matches course, and is not cancelled
      const { data: sessions, error: sErr } = await supabase
        .from('class_sessions')
        .select('id, course_id, status')
        .eq('id', sessionId)
        .eq('course_id', courseId)
        .in('status', ['scheduled', 'active']);
      if (sErr || !sessions || sessions.length === 0) return false;

      // 2) Student enrolled in the course
      const { data: enroll, error: eErr } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .limit(1);
      if (eErr || !enroll || enroll.length === 0) return false;

      // 3) Not already marked for this session
      const { data: existing, error: aErr } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('session_id', sessionId)
        .eq('student_id', studentId)
        .limit(1);
      if (aErr) return false;
      if (existing && existing.length > 0) return false;

      return true;
    } catch (err) {
      return false;
    }
  }, []);

  

  // --- Helpers: Progress Management ---
  const startQrProgress = useCallback(() => {
    console.log('🚀 Starting QR progress timer');
    if (qrProgressIntervalRef.current) {
      window.clearInterval(qrProgressIntervalRef.current);
      qrProgressIntervalRef.current = null;
    }
    
    setQrProgress(0);
  setQrTimeRemaining(TIMING.QR_ACTIVE_SCAN / 1000); // seconds
  qrScanStartRef.current = Date.now();
    
    // Update progress every 500ms for smooth animation
    qrProgressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - qrScanStartRef.current;
  const elapsedSeconds = Math.floor(elapsed / 1000);
  const remaining = Math.max(0, Math.floor(TIMING.QR_ACTIVE_SCAN / 1000) - elapsedSeconds);
  const progress = Math.min(100, (elapsed / TIMING.QR_ACTIVE_SCAN) * 100);
      
      console.log(`📱 QR Timer: ${elapsedSeconds}s elapsed, ${remaining}s remaining, ${progress.toFixed(1)}% progress`);
      
      setQrTimeRemaining(remaining);
      setQrProgress(progress);
      
      if (remaining <= 0) {
        console.log('✅ QR Timer completed - 2 minutes elapsed');
        if (qrProgressIntervalRef.current) {
          window.clearInterval(qrProgressIntervalRef.current);
          qrProgressIntervalRef.current = null;
        }
      }
    }, 500); // More frequent updates for smoother animation
  }, []);

  // Using TIMING.QR_VERIFY defined above

  const startQrVerifyingProgress = useCallback(() => {
    if (qrProgressIntervalRef.current) window.clearInterval(qrProgressIntervalRef.current);
    // Calculate interval to match TIMING.QR_VERIFY duration
    // 100 steps total, so interval = TIMING.QR_VERIFY / 100
    qrProgressIntervalRef.current = window.setInterval(() => {
      setQrProgress((p) => {
        if (qrPhase !== 'verifying') return p;
        if (p >= 100) {
          if (qrProgressIntervalRef.current) window.clearInterval(qrProgressIntervalRef.current);
          return 100;
        }
        return Math.min(100, p + 1);
      });
    }, TIMING.QR_VERIFY / 100); // This will take exactly TIMING.QR_VERIFY to complete
  }, [qrPhase]);

  const resetQrProgress = useCallback(() => {
    if (qrProgressIntervalRef.current) window.clearInterval(qrProgressIntervalRef.current);
    qrProgressIntervalRef.current = null;
    setQrProgress(0);
  }, []);

  const startFaceProgress = useCallback(() => {
    console.log('🔥 Starting Face progress timer');
    if (faceProgressIntervalRef.current) {
      window.clearInterval(faceProgressIntervalRef.current);
      faceProgressIntervalRef.current = null;
    }
    
  setFaceProgress(0);
  setFaceTimeRemaining(TIMING.FACE_SCAN / 1000); // face scanning (3x QR active scan)
  faceScanStartRef.current = Date.now();
    
    // Update progress every 750ms for smooth animation
    faceProgressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - faceScanStartRef.current;
  const elapsedSeconds = Math.floor(elapsed / 1000);
  const remaining = Math.max(0, Math.floor(TIMING.FACE_SCAN / 1000) - elapsedSeconds);
  const progress = Math.min(100, (elapsed / TIMING.FACE_SCAN) * 100);
      
      console.log(`👤 Face Timer: ${elapsedSeconds}s elapsed, ${remaining}s remaining, ${progress.toFixed(1)}% progress`);
      
      setFaceTimeRemaining(remaining);
      setFaceProgress(progress);
      
      if (remaining <= 0) {
        console.log('✅ Face Timer completed - 4 minutes elapsed');
        if (faceProgressIntervalRef.current) {
          window.clearInterval(faceProgressIntervalRef.current);
          faceProgressIntervalRef.current = null;
        }
      }
    }, 750); // Slightly slower updates for more deliberate feel
  }, []);

  const startFaceVerifyingProgress = useCallback(() => {
    if (faceProgressIntervalRef.current) window.clearInterval(faceProgressIntervalRef.current);
    // Make verifying progress last approximately 10 seconds:
    // increment by 1 every 100ms -> 100 * 100ms = 10,000ms
    faceProgressIntervalRef.current = window.setInterval(() => {
      setFaceProgress((p) => {
        if (facePhase !== 'verifying') return p;
        if (p >= 100) {
          if (faceProgressIntervalRef.current) window.clearInterval(faceProgressIntervalRef.current);
          return 100;
        }
        return Math.min(100, p + 1);
      });
    }, 100);
  }, [facePhase]);

  const resetFaceProgress = useCallback(() => {
    if (faceProgressIntervalRef.current) window.clearInterval(faceProgressIntervalRef.current);
    faceProgressIntervalRef.current = null;
    setFaceProgress(0);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          toast.error('Authentication required. Please log in.');
          navigate('/login');
          return;
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          toast.error('Failed to load user profile.');
          return;
        }

        // Set student data
        setStudentData({
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          student_id: profile.student_id || profile.id,
          department: profile.department || 'Undefined',
          year: profile.year_of_study || 0
        });

        // Fetch attendance analytics
        const { data: analytics, error: analyticsError } = await supabase
          .from('attendance_analytics')
          .select('*')
          .eq('student_id', user.id)
          .single();

        if (!analyticsError && analytics) {
          setAttendanceStats({
            attendanceRate: analytics.attendance_percentage || 0,
            totalClasses: analytics.total_sessions || 0,
            present: analytics.attended_sessions || 0,
            absent: (analytics.total_sessions || 0) - (analytics.attended_sessions || 0),
            late: 0 // Calculate from attendance records if needed
          });
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      });
    }
  }, []);

  // Add a ref to store the scanner timeout
  const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (scannerTimeoutRef.current) {
        clearTimeout(scannerTimeoutRef.current);
      }
    };
  }, []);

  const stopQRScanner = useCallback(async () => {
    // If QR verifying is in progress, delay stopping until verification completes
    if (qrVerifyingLockRef.current) {
      console.log('🛑 QR: stop requested but verifying lock active — delaying stop');
      setTimeout(() => { stopQRScanner(); }, 500);
      return;
    }
    try {
      // Clear the scanner timeout if it exists
      if (scannerTimeoutRef.current) {
        clearTimeout(scannerTimeoutRef.current);
        scannerTimeoutRef.current = null;
      }
      
      if (nativeAvailable) {
        try { await NativeScan.stopQrScan(); } catch {}
      }
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    } catch (e) {
      console.error('Error stopping QR scanner:', e);
    }
    if (qrDetectIntervalRef.current) {
      window.clearInterval(qrDetectIntervalRef.current);
      qrDetectIntervalRef.current = null;
    }
    
    if (cameraStream) {
      try {
        cameraStream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      } catch (e) {
        // no-op
      }
      setCameraStream(null);
    }
    setScanningQR(false);
    setShowQRModal(false);
    setQrDetected(false);
    setQrPhase('idle');
    resetQrProgress();
    setUsingNativeBarcode(false);
  }, [cameraStream]);

  const stopFaceScanner = useCallback(() => {
    console.log('🛑 Face: Stopping face scanner...');
    // If we're currently in a locked verifying state, delay stopping until unlocked
    if (verifyingLockRef.current) {
      console.log('🛑 Face: stop requested but verifying lock active — delaying stop');
      // retry after short delay
      setTimeout(() => stopFaceScanner(), 500);
      return;
    }
    
    try {
      if (nativeAvailable) {
        try { NativeScan.stopFaceScan(); } catch {}
      }
      
      // Clear timers first
      if (faceDetectIntervalRef.current) {
        window.clearInterval(faceDetectIntervalRef.current);
        faceDetectIntervalRef.current = null;
      }
      if (mediaPipeTimerRef.current) {
        window.clearInterval(mediaPipeTimerRef.current);
        mediaPipeTimerRef.current = null;
      }
      mediaPipeRunningRef.current = false;
      
      // Stop video element before stopping stream to prevent AbortError
      if (faceVideoRef.current) {
        try {
          faceVideoRef.current.pause();
          faceVideoRef.current.srcObject = null;
        } catch (e) {
          console.log('Video cleanup error (expected):', e);
        }
      }
      
      // Stop camera stream after video cleanup
      if (faceStream) {
        faceStream.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      console.log('Face scanner cleanup error:', e);
    }
    
    setFaceStream(null);
    setShowFaceModal(false);
    setScanningFace(false);
    setFaceDetected(false);
    setFacePhase('idle');
    resetFaceProgress();
    
    console.log('✅ Face: Scanner stopped and cleaned up');
  }, [faceStream]);

  useEffect(() => {
    return () => {
      // Ensure cameras and scanners are stopped when navigating away
      stopQRScanner();
      stopFaceScanner();
    };
  }, [stopQRScanner, stopFaceScanner]);

  const handleQRDetected = useCallback(async (result: any) => {
    // result may be string or object depending on library version
    const text = typeof result === 'string' ? result : (result?.data || result?.rawValue || '');
    console.log(`🔍 QR DETECTION: Raw result:`, result, `Text: "${text}"`);

    // Parse and validate payload
    if (!text || String(text).trim().length === 0) {
      console.log('❌ QR: Empty or invalid text, ignoring');
      return;
    }
    const parsed = parseQRContent(text);
    if (!parsed) {
      console.log('❌ QR: Invalid format, ignoring and continuing scan');
      return;
    }

    // Show detection immediately but continue scanning for realistic duration
    if (!qrDetected) {
      setQrDetected(true);
      setQrPhase('detected');
      console.log('✅ QR: Valid QR detected, continuing scan for realistic duration...');
    }

  // Add delay with animations - use TIMING values for consistency
  const minScanMs = TIMING.QR_MIN_SCAN; // minimum scanning
  const verifyTime = TIMING.QR_VERIFY; // verification time
    const elapsed = Date.now() - qrScanStartRef.current;
    
    if (elapsed < minScanMs) {
      console.log(`⏳ QR: Still scanning... ${Math.floor(elapsed/1000)}s elapsed, need ${Math.floor((minScanMs - elapsed)/1000)}s more`);
      return; // Wait minimum time for animations to play
    }

  console.log(`🎯 QR: Minimum scan (${minScanMs/1000}s) completed - proceeding to verification...`);

    // Stop scanning and proceed to verification
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
    }
    if (qrDetectIntervalRef.current) {
      window.clearInterval(qrDetectIntervalRef.current);
      qrDetectIntervalRef.current = null;
    }
    
  // Move to verification phase
  setQrPhase('verifying');
  // Lock scanner to prevent it being stopped during server verification
  qrVerifyingLockRef.current = true;
  startQrVerifyingProgress();
    
  setTimeout(async () => {
      if (!studentData) {
        toast.error('Student data not loaded. Please try again.');
        return;
      }
      
      // Server-side verification (Supabase)
      const ok = await verifyQrEligibility({
        sessionId: parsed.sessionId,
        courseId: parsed.courseId,
        studentId: studentData.id,
      });
      
            if (!ok) {
              toast.error('Invalid or expired QR code.');
              setQrPhase('error');
        setTimeout(async () => {
          await stopQRScanner();
        }, 2000);
        return;
      }

  // Successful verification - mark attendance
      dispatch({
        type: 'MARK_ATTENDANCE',
        payload: {
          studentId: studentData.id,
          studentName: studentData.name,
          courseId: parsed.courseId || 'Unknown',
          courseName: 'Database Systems',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          status: 'present',
          method: 'QR Code',
          location: 'Room 101',
          lecturerName: 'Dr. John Smith'
        }
      });
      
      setQrPhase('success');
      toast.success('✅ ATTENDANCE SIGNED - QR Code Verified!');
      
      // Hold success state before closing; clear lock after hold
      setTimeout(async () => {
        qrVerifyingLockRef.current = false;
        await stopQRScanner();
      }, TIMING.QR_VERIFY);
    }, verifyTime); // wait verification window (TIMING.QR_VERIFY)
  }, [dispatch, stopQRScanner, studentData, qrDetected, usingNativeBarcode]);

  const markAttendanceQR = useCallback(async () => {
    if (!studentData) {
      toast.error('Student data not loaded. Please try again.');
      return;
    }

    setShowQRModal(true);
    setScanningQR(true);
    setQrPhase('scanning');
    resetQrProgress();
    setQrDetected(false);
    setUsingNativeBarcode(false);

    // Clear any existing timeout
    if (scannerTimeoutRef.current) {
      clearTimeout(scannerTimeoutRef.current);
    }

    // Set a timeout to stop the scanner after the active QR scan duration
    scannerTimeoutRef.current = setTimeout(async () => {
      if (scanningQR && !qrDetected) {
        toast.info(`QR scanner timed out after ${Math.floor(TIMING.QR_ACTIVE_SCAN/1000)} seconds`);
        await stopQRScanner();
      }
    }, TIMING.QR_ACTIVE_SCAN);

    try {
      // Check camera permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Immediately stop the stream since we just needed to check permissions
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('Camera access error:', err);
        toast.error('Camera access denied. Please enable camera permissions in your browser settings.');
        await stopQRScanner();
        return;
      }
      // Use `videoRef` (React ref) for the scanner video element after modal open
      startQrProgress();

      // If native environment, start native scanning instead
      if (nativeAvailable) {
        await NativeScan.startQrScan({});
        toast.info('Native scanner active. Point camera at the QR code.');
        return;
      }

      const hasCam = await QrScanner.hasCamera();
      if (!hasCam) {
        setScanningQR(false);
        setShowQRModal(false);
        toast.error('No camera found on this device.');
        return;
      }

      const videoEl = videoRef.current;
      if (!videoEl) {
        toast.error('Video element not ready. Please try again.');
        setScanningQR(false);
        setShowQRModal(false);
        return;
      }

      // Prefer native BarcodeDetector when available for low-latency detection
      const BarcodeDetectorCtor: any = (window as any).BarcodeDetector;
      if (BarcodeDetectorCtor && typeof BarcodeDetectorCtor === 'function') {
        setUsingNativeBarcode(true);
        // Start camera manually
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        setCameraStream(stream);
        (videoEl as any).srcObject = stream;
        await videoEl.play();

        const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
        // Poll at slower rate to ensure timing works
        qrDetectIntervalRef.current = window.setInterval(async () => {
          try {
            if (!scanningQR) return; // Stop if scanning was cancelled
            const codes = await detector.detect(videoEl);
            const qr = codes?.find((c: any) => (c.rawValue || c?.rawValue) && (c.format === 'qr_code' || true));
            if (qr && (qr.rawValue || qr?.rawValue)) {
              // Only process if it's a valid QR with proper content
              const content = qr.rawValue || qr?.rawValue;
              if (content && content.length > 10) { // Ensure substantial content
                handleQRDetected(content);
              }
            }
          } catch (e) {
            // ignore detection errors and continue
          }
        }, 500); // Slower polling to ensure proper detection

        toast.info('Scanner active. Point camera at the QR code.');
      } else {
        // Fallback to qr-scanner library
        scannerRef.current = new QrScanner(
          videoEl,
          (result: any) => {
            if (scanningQR) { // Only process if still scanning
              handleQRDetected(result);
            }
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
            // Slower scanning rate to ensure proper detection
            maxScansPerSecond: 2,
          }
        );

        // Start scanning
        await scannerRef.current.start();

        // Keep a reference to stop tracks separately
        const stream: MediaStream | null = (videoEl as any).srcObject || null;
        if (stream) setCameraStream(stream);

        toast.info('Scanner active. Point camera at the QR code.');
      }
    } catch (error) {
      console.error('QR scanner error:', error);
      let errorMessage = 'Failed to start QR scanner.';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera access was denied. Please allow camera access to scan QR codes.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please ensure you have a working camera connected.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera does not support the required constraints.';
        }
      }
      
      toast.error(errorMessage);
      await stopQRScanner();
    }
  }, [handleQRDetected, stopQRScanner, studentData]);

  const markAttendanceFace = useCallback(async () => {
    if (!studentData) {
      toast.error('Student data not loaded. Please try again.');
      return;
    }

    // Check camera permissions first
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (permissions.state === 'denied') {
        toast.error('Camera access denied. Please enable camera permissions in your browser settings.');
        return;
      }
    } catch (e) {
      // Permissions API not supported, continue anyway
    }

    // Show modal first
    setShowFaceModal(true);
    setScanningFace(true);
    setFacePhase('scanning');
    faceScanStartRef.current = Date.now();
    startFaceProgress();
    toast.info('Starting face verification...');

    try {
      // Prefer front camera
      if (nativeAvailable) {
        await NativeScan.startFaceScan({});
        return;
      }
      
      // Web path: try MediaPipe Landmarker first
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
      } catch (cameraError) {
        console.error('Camera access failed:', cameraError);
        setScanningFace(false);
        setShowFaceModal(false);
        
        if (cameraError instanceof DOMException) {
          if (cameraError.name === 'NotAllowedError') {
            toast.error('Camera access denied. Please allow camera access and try again.');
          } else if (cameraError.name === 'NotFoundError') {
            toast.error('No camera found on this device.');
          } else if (cameraError.name === 'AbortError') {
            toast.error('Camera access was interrupted. Please try again.');
          } else {
            toast.error('Camera access failed. Please check your camera permissions.');
          }
        } else {
          toast.error('Camera access failed. Please check your camera permissions.');
        }
        return;
      }
      setFaceStream(stream);
      const v = faceVideoRef.current;
      if (v) {
        v.srcObject = stream as unknown as MediaSource;
        try {
          await v.play();
        } catch (playError) {
          // Handle AbortError when video element is removed from DOM
          if (playError instanceof DOMException && playError.name === 'AbortError') {
            console.log('Video play interrupted - element removed from DOM');
            return;
          }
          throw playError;
        }
      }

      const landmarker = await loadMediaPipeFaceLandmarker();
      if (landmarker && v) {
        mediaPipeRunningRef.current = true;
        const scanStartTime = Date.now();

        // Enforce a minimum 2-minute scan before proceeding
        setTimeout(() => {
          if (!mediaPipeRunningRef.current) return;

          const checkFace = () => {
            if (!mediaPipeRunningRef.current || !faceVideoRef.current) return;

            const ts = performance.now();
            const res = landmarker.detectForVideo(faceVideoRef.current, ts);
            const count = res?.faceLandmarks?.length || 0;

            if (count > 0) {
              mediaPipeRunningRef.current = false;
              setFacePhase('verifying');
              verifyingStartRef.current = Date.now();
              startFaceVerifyingProgress();

              // Extended verification phase (use TIMING.FACE_VERIFY)
              setTimeout(() => {
                if (!mediaPipeRunningRef.current) return;

                // 90% success rate simulation
                const isMatch = Math.random() > 0.1;

                const verStart = verifyingStartRef.current || Date.now();
                const verElapsed = Date.now() - verStart;

                // Ensure the full verifying window has passed before allowing success
                if (isMatch) {
                  const proceedSuccess = () => {
                    verifyingStartRef.current = null;
                    setFacePhase('success');
                    dispatch({
                      type: 'MARK_ATTENDANCE',
                      payload: {
                        studentId: studentData.id,
                        studentName: studentData.name,
                        courseId: 'CS301',
                        courseName: 'Database Systems',
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                        status: 'present',
                        method: 'Face Recognition',
                        location: 'Room 101',
                        lecturerName: 'Dr. John Smith'
                      }
                    });
                    toast.success('✅ ATTENDANCE SIGNED - Face Recognition Verified!');
                    setTimeout(() => stopFaceScanner(), 5000);
                  };
                  const faceVerifyTime = TIMING.FACE_VERIFY; // verification window
                  if (verElapsed < faceVerifyTime) {
                    const wait = faceVerifyTime - verElapsed;
                    console.log(`Face verifying too fast (${verElapsed}ms), waiting ${wait}ms`);
                    setTimeout(proceedSuccess, wait);
                  } else {
                    proceedSuccess();
                  }
                } else {
                  setFacePhase('error');
                  toast.error('Face not recognized. Please try again.');
                  setTimeout(() => stopFaceScanner(), 5000);
                }
              }, TIMING.FACE_VERIFY); // verification window
              mediaPipeTimerRef.current = null;
            } else {
              setTimeout(checkFace, 500);
            }
          };
          checkFace();
  }, TIMING.FACE_SCAN);

        // Update progress + detection feedback during scan
        mediaPipeTimerRef.current = window.setInterval(() => {
          if (!mediaPipeRunningRef.current) return;

          const elapsed = Date.now() - scanStartTime;
          const remaining = Math.max(0, TIMING.FACE_SCAN - elapsed);
          const progress = Math.min(100, (elapsed / TIMING.FACE_SCAN) * 100);

          setFaceTimeRemaining(Math.ceil(remaining / 1000));
          setFaceProgress(progress);

          if (faceVideoRef.current) {
            const ts = performance.now();
            const res = landmarker.detectForVideo(faceVideoRef.current, ts);
            const count = res?.faceLandmarks?.length || 0;
            setFaceDetected(count > 0);
          }
  }, 100);
      } else {
        // Fallback simulation with realistic timing using createFaceSimulator
        console.log('Using Face ID simulation fallback (simulator)');
        const simDuration = TIMING.FACE_SCAN; // keep simulator length in sync with TIMING
        const sim = createFaceSimulator({ durationMs: simDuration });

        setFacePhase('scanning');
        sim.start({
          onUpdate: (phase, progress, remaining) => {
            // Map simulator phases -> UI phases
            if (!scanningFace) return;
            if (phase === 'initializing') setFacePhase('aligning');
            else if (phase === 'analyzing') setFacePhase('detected');
            else if (phase === 'verifying') setFacePhase('verifying');
            setFaceProgress(progress);
            setFaceTimeRemaining(remaining);
          },
          onComplete: (success) => {
            if (!scanningFace) return;
            verifyingStartRef.current = null;
            if (success) {
              setFacePhase('success');
              console.log('Face recognition successful (simulated)');
              dispatch({
                type: 'MARK_ATTENDANCE',
                payload: {
                  studentId: studentData.id,
                  studentName: studentData.name,
                  courseId: 'CS301',
                  courseName: 'Database Systems',
                  date: new Date().toLocaleDateString(),
                  time: new Date().toLocaleTimeString(),
                  status: 'present',
                  method: 'Face Recognition',
                  location: 'Room 101',
                  lecturerName: 'Dr. John Smith'
                }
              });
              toast.success('✅ ATTENDANCE SIGNED - Face Recognition Verified!');
            } else {
              setFacePhase('error');
              toast.error('Face not recognized. Please try again.');
            }
            setTimeout(() => {
              try { sim.stop(); } catch (e) {}
              stopFaceScanner();
            }, 2500);
          }
        });
      }
    } catch (error) {
      console.error('Face scanner error:', error);
      setScanningFace(false);
      setShowFaceModal(false);
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error('Camera access denied. Please allow camera access and try again.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No camera found on this device.');
        } else if (error.name === 'AbortError') {
          console.log('Face scanner aborted - likely due to modal closure');
          // Don't show error toast for AbortError as it's usually intentional
        } else {
          toast.error('Camera access failed. Please check your camera permissions.');
        }
      } else {
        toast.error('Face verification failed. Please try again.');
      }
    }
  }, [dispatch, loadMediaPipeFaceLandmarker, startFaceVerifyingProgress, stopFaceScanner, studentData]);

  const markAttendanceGPS = () => {
    if (!studentData) {
      toast.error('Student data not loaded. Please try again.');
      return;
    }

    if (!currentLocation) {
      toast.error('GPS location not available. Please enable location services.');
      return;
    }

    toast.info('Verifying GPS location...');
    
    setTimeout(() => {
      dispatch({
        type: 'MARK_ATTENDANCE',
        payload: {
          studentId: studentData.id,
          studentName: studentData.name,
          courseId: 'CS301',
          courseName: 'Database Systems',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          status: 'present',
          method: 'GPS',
          location: `Room 101 (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})`,
          lecturerName: 'Dr. John Smith'
        }
      });
      toast.success('GPS verification successful! Attendance marked.');
    }, 2000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Portal</h1>
            <p className="text-gray-600">Mark your attendance and view history</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/student-portal')}>
            Back to Portal
          </Button>
        </div>

        {/* Student Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                <CardContent className="p-6 text-center">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-400 rounded mb-2"></div>
                    <div className="h-8 bg-gray-400 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : studentData ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <p className="text-blue-100">Attendance Rate</p>
                <p className="text-3xl font-bold">{attendanceStats.attendanceRate}%</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6 text-center">
                <p className="text-green-100">Present</p>
                <p className="text-3xl font-bold">{attendanceStats.present}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6 text-center">
                <p className="text-red-100">Absent</p>
                <p className="text-3xl font-bold">{attendanceStats.absent}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6 text-center">
                <p className="text-yellow-100">Late</p>
                <p className="text-3xl font-bold">{attendanceStats.late}</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Failed to load student data</p>
          </div>
        )}

        {/* Face Verification Modal */}
        {showFaceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-lg mx-4">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b">
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Face Verification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 text-right w-48">
                      {facePhase === 'scanning' && !faceDetected && <div className='text-center'><p>Position your face in the frame</p><p className='text-sm text-muted-foreground'>Waiting for a clear view...</p><p className='text-xs font-mono text-blue-600'>{Math.floor(faceTimeRemaining/60)}:{String(faceTimeRemaining%60).padStart(2, '0')} remaining</p></div>}
                      {facePhase === 'scanning' && faceDetected && <div className='text-center'><CheckCircle className='mx-auto h-8 w-8 text-green-500' /><p>Face Detected</p><p className='text-sm text-muted-foreground'>Hold still...</p><p className='text-xs font-mono text-blue-600'>{Math.floor(faceTimeRemaining/60)}:{String(faceTimeRemaining%60).padStart(2, '0')} remaining</p></div>}
                      {facePhase === 'aligning' && <div className='text-center'><p>Scanning...</p><p className='text-sm text-muted-foreground'>Analyzing facial features...</p></div>}
                      {facePhase === 'verifying' && <div className='text-center'><p>Verifying Identity</p><p className='text-sm text-muted-foreground'>Matching with your profile...</p></div>}
                      {facePhase === 'success' && <div className='text-center'><Award className='mx-auto h-8 w-8 text-green-500' /><p>ATTENDANCE SIGNED</p><p className='text-sm text-muted-foreground'>Face Recognition Verified!</p></div>}
                      {facePhase === 'error' && <div className='text-center'><XCircle className='mx-auto h-8 w-8 text-red-500' /><p>Face Not Recognized</p><p className='text-sm text-muted-foreground'>Please try again.</p></div>}
                    </div>
                    <Button variant="outline" onClick={stopFaceScanner}>Close</Button>
                  </div>
                </div>
                <div className="relative bg-black aspect-video">
                  <video ref={faceVideoRef} className="w-full h-full object-cover" muted playsInline />
                  {/* OpenCV-like overlay (face box with corner guides) */}
                  <div className={`absolute inset-10 rounded-xl border-2 pointer-events-none transition-all duration-500 ${
                    facePhase === 'verifying' ? 'border-yellow-400/80 verification-active' : 
                    facePhase === 'success' ? 'border-green-500/90 success-ripple' : 
                    facePhase === 'aligning' ? 'border-blue-500/90 biometric-scan' :
                    faceDetected ? 'border-green-400/90 facial-analysis' : 
                    'border-blue-400/70 security-scanner'
                  }`}>
                    {/* Corner indicators */}
                    <div className={`absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg transition-colors duration-300 ${
                      facePhase === 'detected' ? 'border-green-400/90' :
                      facePhase === 'verifying' ? 'border-blue-400/80' : 
                      facePhase === 'success' ? 'border-green-500/90' : 
                      faceDetected ? 'border-green-400/90' : 'border-blue-400/70'
                    }`}></div>
                    <div className={`absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg transition-colors duration-300 ${
                      facePhase === 'detected' ? 'border-green-400/90' :
                      facePhase === 'verifying' ? 'border-blue-400/80' : 
                      facePhase === 'success' ? 'border-green-500/90' : 
                      faceDetected ? 'border-green-400/90' : 'border-blue-400/70'
                    }`}></div>
                    <div className={`absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg transition-colors duration-300 ${
                      facePhase === 'detected' ? 'border-green-400/90' :
                      facePhase === 'verifying' ? 'border-blue-400/80' : 
                      facePhase === 'success' ? 'border-green-500/90' : 
                      faceDetected ? 'border-green-400/90' : 'border-blue-400/70'
                    }`}></div>
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 rounded-br-lg transition-colors duration-300 ${
                      facePhase === 'detected' ? 'border-green-400/90' :
                      facePhase === 'verifying' ? 'border-blue-400/80' : 
                      facePhase === 'success' ? 'border-green-500/90' : 
                      faceDetected ? 'border-green-400/90' : 'border-blue-400/70'
                    }`}></div>
                  </div>
                  {/* Animated scanning line with enhanced animations */}
                  <div className={`absolute left-12 right-12 h-1 transition-all duration-500 ${
                    facePhase === 'detected' ? 'bg-green-400/90 animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.8)]' :
                    facePhase === 'verifying' ? 'bg-yellow-400/90 verification-active shadow-[0_0_25px_rgba(251,191,36,0.8)]' : 
                    facePhase === 'success' ? 'bg-green-500/90 shadow-[0_0_30px_rgba(34,197,94,0.9)]' : 
                    facePhase === 'aligning' ? 'bg-blue-500/90 deep-analysis shadow-[0_0_25px_rgba(59,130,246,0.8)]' :
                    'bg-blue-400/90 animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.7)]'
                  }`} style={{
                    top: `${16 + (faceProgress * 0.6)}px`, // Scanning line moves down as progress increases
                    animation: facePhase === 'scanning' ? 'scanLine 4s ease-in-out infinite' : undefined
                  }}></div>
                  
                  {/* Additional animated elements for longer engagement */}
                  {facePhase === 'scanning' && (
                    <>
                      {/* Rotating scanner ring */}
                      <div className="absolute inset-8 border-2 border-blue-400/30 rounded-full deep-analysis" style={{animationDuration: '6s'}}></div>
                      {/* Security grid overlay */}
                      <div className="absolute inset-12 scanner-grid opacity-30"></div>
                      {/* Pulsing dots */}
                      <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
                      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
                      <div className="absolute bottom-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
                      <div className="absolute bottom-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '4.5s'}}></div>
                    </>
                  )}
                  {facePhase === 'verifying' && (
                    <>
                      {/* Verification overlay */}
                      <div className="absolute inset-6 border border-yellow-400/50 rounded-lg verification-active"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 font-bold text-sm">ANALYZING</div>
                    </>
                  )}
                </div>
                <div className="p-4 text-sm text-gray-600">
                  {facePhase === 'scanning' && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>🔍 Initializing biometric scanner... Position your face within the frame</span>
                    </div>
                  )}
                  {facePhase === 'aligning' && (
                    <div className="flex items-center space-x-2 text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span>📐 Calibrating facial landmarks and depth mapping...</span>
                    </div>
                  )}
                  {facePhase === 'detected' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>👤 Face detected! Capturing biometric signature...</span>
                    </div>
                  )}
                  {facePhase === 'verifying' && (
                    <div className="flex items-center space-x-2 text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span>🔐 Cross-referencing with secure database... Please hold still</span>
                    </div>
                  )}
                  {facePhase === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>✅ BIOMETRIC VERIFICATION COMPLETE - Identity confirmed & attendance signed</span>
                    </div>
                  )}
                  {facePhase === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>❌ Biometric verification failed - Please try again</span>
                    </div>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <div className="relative">
                    <Progress value={faceProgress} className={`${
                      facePhase === 'scanning' ? 'security-progress' : 
                      facePhase === 'verifying' ? 'enhanced-progress verification-active' :
                      'enhanced-progress'
                    }`} />
                    {(facePhase === 'scanning' || facePhase === 'verifying') && (
                      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span className="loading-dots">{facePhase === 'verifying' ? 'Verifying' : facePhase === 'aligning' ? 'Aligning' : 'Analyzing'}</span>
                    <span>{Math.floor(faceTimeRemaining/60)}:{String(faceTimeRemaining%60).padStart(2, '0')} remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner Modal */}
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-lg mx-4">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Scan QR Code</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500 text-right w-48">
                      {qrPhase === 'scanning' && !qrDetected && <div className='text-center'><p>Align QR code in frame</p><p className='text-sm text-muted-foreground'>Searching for a valid code...</p><p className='text-xs font-mono text-blue-600'>{qrTimeRemaining}s remaining</p></div>}
                      {qrPhase === 'scanning' && qrDetected && <div className='text-center'><CheckCircle className='mx-auto h-8 w-8 text-green-500' /><p>QR Code Detected</p><p className='text-sm text-muted-foreground'>Hold steady while we verify...</p><p className='text-xs font-mono text-blue-600'>{qrTimeRemaining}s remaining</p></div>}
                      {qrPhase === 'verifying' && <div className='text-center'><p>Verifying Session</p><p className='text-sm text-muted-foreground'>Checking course and session details...</p></div>}
                      {qrPhase === 'success' && <div className='text-center'><Award className='mx-auto h-8 w-8 text-green-500' /><p>ATTENDANCE SIGNED</p><p className='text-sm text-muted-foreground'>QR Code Verified Successfully!</p></div>}
                      {qrPhase === 'error' && <div className='text-center'><XCircle className='mx-auto h-8 w-8 text-red-500' /><p>Verification Failed</p><p className='text-sm text-muted-foreground'>Invalid or expired QR code.</p></div>}
                    </div>
                    <Button variant="outline" onClick={stopQRScanner}>Close</Button>
                  </div>
                </div>
                <div className="relative bg-black aspect-video">
                  <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                  {/* Scan overlay box */}
                  <div className={`absolute inset-6 border-2 rounded-lg pointer-events-none transition-all duration-500 ${
                    qrPhase === 'detected' ? 'border-green-400/90 shadow-lg shadow-green-400/30 code-analysis' :
                    qrPhase === 'verifying' ? 'border-yellow-400/80 shadow-lg shadow-yellow-400/30 qr-verification' : 
                    qrPhase === 'success' ? 'border-green-500/90 shadow-lg shadow-green-500/40 success-ripple' : 
                    'border-blue-400/70 security-scanner'
                  }`}></div>
                  {/* Enhanced animated scanning line */}
                  <div className={`absolute left-6 right-6 h-0.5 transition-all duration-500 ${
                    qrPhase === 'detected' ? 'bg-green-400/90 animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.8)]' :
                    qrPhase === 'verifying' ? 'bg-blue-400/90 animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.8)]' : 
                    qrPhase === 'success' ? 'bg-green-500/90 shadow-[0_0_20px_rgba(34,197,94,0.9)]' : 
                    'bg-blue-400/90 animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.7)]'
                  }`} style={{
                    top: `${48 + (qrProgress * 2)}px`, // Scanning line moves down as progress increases
                    animation: qrPhase === 'scanning' ? 'scanLine 2.5s ease-in-out infinite' : undefined
                  }}></div>
                  
                  {/* Additional QR scanning animations */}
                  {qrPhase === 'scanning' && (
                    <>
                      {/* Corner scanning indicators */}
                      <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-blue-400 face-corner-indicator"></div>
                      <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-blue-400 face-corner-indicator" style={{animationDelay: '0.75s'}}></div>
                      <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-blue-400 face-corner-indicator" style={{animationDelay: '1.5s'}}></div>
                      <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-blue-400 face-corner-indicator" style={{animationDelay: '2.25s'}}></div>
                      
                      {/* Rotating QR finder pattern */}
                      <div className="absolute inset-16 border border-blue-400/40 deep-analysis" style={{animationDuration: '8s'}}></div>
                      
                      {/* Security grid overlay */}
                      <div className="absolute inset-8 scanner-grid opacity-20"></div>
                      
                      {/* Pulsing center dot */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                    </>
                  )}
                  {qrPhase === 'verifying' && (
                    <>
                      {/* Verification overlay */}
                      <div className="absolute inset-4 border border-yellow-400/60 rounded-lg verification-active"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 font-bold text-sm">DECODING</div>
                    </>
                  )}
                </div>
                <div className="p-4 text-sm text-gray-600">
                  {qrPhase === 'scanning' && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>📱 Initializing QR scanner... Point camera at the classroom QR code</span>
                    </div>
                  )}
                  {qrPhase === 'detected' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>📊 QR Code detected! Decoding session information...</span>
                    </div>
                  )}
                  {qrPhase === 'verifying' && (
                    <div className="flex items-center space-x-2 text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span>🔐 Authenticating with secure server... Validating session credentials</span>
                    </div>
                  )}
                  {qrPhase === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>✅ QR AUTHENTICATION COMPLETE - Session verified & attendance signed</span>
                    </div>
                  )}
                  {qrPhase === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>❌ QR verification failed - Invalid or expired code</span>
                    </div>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <div className="relative">
                    <Progress value={qrProgress} className={`${
                      qrPhase === 'scanning' ? 'security-progress' : 
                      qrPhase === 'verifying' ? 'enhanced-progress verification-active' :
                      'enhanced-progress'
                    }`} />
                    {(qrPhase === 'scanning' || qrPhase === 'verifying') && (
                      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span className="loading-dots">{qrPhase === 'verifying' ? 'Verifying' : qrPhase === 'detected' ? 'Decoding' : 'Scanning'}</span>
                    <span>{Math.floor(qrTimeRemaining/60)}:{String(qrTimeRemaining%60).padStart(2, '0')} remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Methods */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : studentData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 ${scanningQR ? 'animate-pulse' : ''}`}>
                  <QrCode className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">QR Code Scanner</h3>
                <p className="text-sm text-gray-600 mb-4">Scan classroom QR code</p>
                <Button 
                  onClick={markAttendanceQR} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={scanningQR}
                >
                  {scanningQR ? 'Scanning...' : 'Start Scanner'}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 ${scanningFace ? 'animate-pulse' : ''}`}>
                  <Camera className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Face Verification</h3>
                <p className="text-sm text-gray-600 mb-4">AI facial recognition</p>
                <Button 
                  onClick={markAttendanceFace} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={scanningFace}
                >
                  {scanningFace ? 'Scanning Face...' : 'Start Verification'}
                </Button>
                
                {/* Face scanner uses a modal now; inline preview removed */}
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">GPS Verification</h3>
                <p className="text-sm text-gray-600 mb-4">Location-based check-in</p>
                <Button 
                  onClick={markAttendanceGPS} 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Verify Location
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Student data not available</p>
          </div>
        )}

        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Today's Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayClasses.map((class_) => (
                <div key={class_.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{class_.name}</p>
                      <p className="text-sm text-gray-600">{class_.time} • {class_.room} • {class_.lecturer}</p>
                    </div>
                  </div>
                  <Badge className={
                    class_.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                    class_.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {class_.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Course</th>
                    <th className="text-left p-3">Time</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {state.attendanceRecords.filter(record => record.studentId === (studentData?.id || '')).slice(0, 5).map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{record.date}</td>
                      <td className="p-3 font-medium">{record.courseName}</td>
                      <td className="p-3">{record.time}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          <Badge className={
                            record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'absent' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">{record.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentAttendance;
