"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import jsQR from "jsqr";

interface UseQrScannerOptions {
  onScan: (value: string) => void;
}

export function useQrScanner({ onScan }: UseQrScannerOptions) {
  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    // Toujours afficher le bouton côté client — on gère l'échec au moment du clic
    setCameraSupported(true);
  }, []);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("camera_insecure");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      // videoRef est toujours dans le DOM (caché) — on peut attacher le stream avant d'afficher
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try { await videoRef.current.play(); } catch { /* autoPlay attribute handles it */ }
      }
      streamRef.current = stream;
      scanningRef.current = true;
      setCameraActive(true);

      // Prefer native BarcodeDetector (Chrome/Android) for speed, fallback to jsQR (universal)
      const useNative =
        "BarcodeDetector" in window &&
        typeof (window as unknown as Record<string, unknown>).BarcodeDetector !== "undefined";

      if (useNative) {
        type BD = { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
        const detector = new (window as unknown as {
          BarcodeDetector: new (opts: { formats: string[] }) => BD;
        }).BarcodeDetector({ formats: ["qr_code"] });

        const scanFrame = async () => {
          if (!scanningRef.current || !videoRef.current) return;
          try {
            if (videoRef.current.readyState >= 2) {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0) {
                stopCamera();
                onScanRef.current(codes[0].rawValue);
                return;
              }
            }
          } catch { /* continue */ }
          rafRef.current = requestAnimationFrame(scanFrame);
        };
        rafRef.current = requestAnimationFrame(scanFrame);
      } else {
        // jsQR fallback — works on iOS Safari, Firefox, etc.
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { willReadFrequently: true }) ?? null;

        const scanFrame = () => {
          if (!scanningRef.current || !videoRef.current || !canvas || !ctx) return;
          if (videoRef.current.readyState >= 2) {
            const { videoWidth: w, videoHeight: h } = videoRef.current;
            if (w > 0 && h > 0) {
              canvas.width = w;
              canvas.height = h;
              ctx.drawImage(videoRef.current, 0, 0, w, h);
              const imageData = ctx.getImageData(0, 0, w, h);
              const code = jsQR(imageData.data, w, h, { inversionAttempts: "dontInvert" });
              if (code?.data) {
                stopCamera();
                onScanRef.current(code.data);
                return;
              }
            }
          }
          rafRef.current = requestAnimationFrame(scanFrame);
        };
        rafRef.current = requestAnimationFrame(scanFrame);
      }
    } catch {
      stopCamera();
      throw new Error("camera_denied");
    }
  }, [stopCamera]);

  return { cameraSupported, cameraActive, videoRef, canvasRef, startCamera, stopCamera };
}
