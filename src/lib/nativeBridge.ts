import { Capacitor, registerPlugin } from '@capacitor/core';

export type QrStatusEvent = { phase: 'scanning' | 'verifying' | 'success' | string; progress?: number };
export type QrDetectedEvent = { text: string };
export type FaceStatusEvent = { phase: 'scanning' | 'verifying' | 'success' | string; progress?: number };
export type FaceDetectedEvent = { stable?: boolean };

export interface NativeScanPlugin {
  startQrScan(options?: Record<string, any>): Promise<void>;
  stopQrScan(): Promise<void>;
  startFaceScan(options?: Record<string, any>): Promise<void>;
  stopFaceScan(): Promise<void>;
  addListener(
    eventName: 'qrStatus',
    listenerFunc: (state: QrStatusEvent) => void,
  ): Promise<{ remove: () => void }>;
  addListener(
    eventName: 'qrDetected',
    listenerFunc: (state: QrDetectedEvent) => void,
  ): Promise<{ remove: () => void }>;
  addListener(
    eventName: 'faceStatus',
    listenerFunc: (state: FaceStatusEvent) => void,
  ): Promise<{ remove: () => void }>;
  addListener(
    eventName: 'faceDetected',
    listenerFunc: (state: FaceDetectedEvent) => void,
  ): Promise<{ remove: () => void }>;
}

export const NativeScan = registerPlugin<NativeScanPlugin>('NativeScan');
export const nativeAvailable = Capacitor.isNativePlatform();
