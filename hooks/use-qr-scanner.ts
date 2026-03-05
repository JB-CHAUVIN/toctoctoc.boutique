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
    setCameraSupported(true);
  }, []);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Quand cameraActive passe à true, le <video> devient visible dans le DOM.
  // On attache le stream, on attend que la vidéo ait des données, puis on lance le scan.
  const pendingStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!cameraActive || !pendingStreamRef.current) return;
    const stream = pendingStreamRef.current;
    pendingStreamRef.current = null;
    let cancelled = false;

    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;

    const beginScanning = async () => {
      // Attendre que la vidéo ait reçu des frames avant de jouer
      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          const handler = () => { video.removeEventListener("loadeddata", handler); resolve(); };
          video.addEventListener("loadeddata", handler);
        });
      }
      if (cancelled) return;

      // Lancer la lecture — MediaStream est exempt de la politique autoplay
      try { await video.play(); } catch { /* autoPlay attribute en fallback */ }
      if (cancelled) return;

      // Prefer native BarcodeDetector (Chrome/Android) for speed, fallback to jsQR
      const useNative =
        "BarcodeDetector" in window &&
        typeof (window as unknown as Record<string, unknown>).BarcodeDetector !== "undefined";

      if (useNative) {
        type BD = { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
        const detector = new (window as unknown as {
          BarcodeDetector: new (opts: { formats: string[] }) => BD;
        }).BarcodeDetector({ formats: ["qr_code"] });

        const scanFrame = async () => {
          if (cancelled || !scanningRef.current || !videoRef.current) return;
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
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { willReadFrequently: true }) ?? null;

        const scanFrame = () => {
          if (cancelled || !scanningRef.current || !videoRef.current || !canvas || !ctx) return;
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
    };

    beginScanning();

    return () => { cancelled = true; };
  }, [cameraActive, stopCamera]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("camera_insecure");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      scanningRef.current = true;
      pendingStreamRef.current = stream;
      setCameraActive(true);
    } catch {
      stopCamera();
      throw new Error("camera_denied");
    }
  }, [stopCamera]);

  return { cameraSupported, cameraActive, videoRef, canvasRef, startCamera, stopCamera };
}
