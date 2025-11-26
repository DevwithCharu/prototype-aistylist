import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

/**
 * ARTryOn component
 * - Live camera via getUserMedia
 * - Upload image fallback
 * - Clothing thumbnails — click to apply overlay
 * - Simple overlay controls: left, top, scale, rotate, opacity
 *
 * Put this file at: src/components/ARTryOn.jsx
 * Import: import ARTryOn from "@/components/ARTryOn";
 */

const CLOTHES = [
  {
    id: 1,
    name: "White T-Shirt",
    image:
      "./clothes/whiteshirt.png",
  },
  {
    id: 2,
    name: "Black Hoodie",
    image:
      "./clothes/sweatshirt.png",
  },
  {
    id: 3,
    name: "Blue Denim Jacket",
    image:
      "./clothes/denimjacket.png",
  },
  {
    id: 4,
    name: "Formal Shirt",
    image:
      "./clothes/pinktshirt.png",
  },
];

function ARTryOn() {
  const [open, setOpen] = useState(false);

  // Camera states
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // user / upload image
  const [userImage, setUserImage] = useState(null); // object URL
  const fileInputRef = useRef(null);

  // overlay clothing
  const [overlay, setOverlay] = useState(null); // clothing image url

  // overlay transform controls
  const [left, setLeft] = useState(50); // percent center
  const [top, setTop] = useState(38); // percent
  const [scale, setScale] = useState(1.0);
  const [rotate, setRotate] = useState(0);
  const [opacity, setOpacity] = useState(0.95);

  // Start camera
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      // clear any uploaded user image because camera is live
      setUserImage(null);
    } catch (err) {
      console.error("Camera start failed", err);
      alert("Could not access camera. Make sure permissions are allowed and you're on https or localhost.");
    }
  }

  // Stop camera & cleanup
  function stopCamera() {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.warn("Error stopping camera", err);
    }
    setCameraOn(false);
  }

  // Upload a user image instead of camera
  function handleUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    // revoke previous if exists
    if (userImage) URL.revokeObjectURL(userImage);
    const url = URL.createObjectURL(f);
    setUserImage(url);
    // when uploading image we should stop camera if running
    if (cameraOn) stopCamera();
  }

  // Clean up object URLs and tracks when component is unmounted or modal closed
  useEffect(() => {
    return () => {
      if (userImage) URL.revokeObjectURL(userImage);
      stopCamera();
    };
    // eslint-disable-next-line
  }, []);

  // When modal closes, cleanup streams and urls
  useEffect(() => {
    if (!open) {
      stopCamera();
      if (userImage) {
        URL.revokeObjectURL(userImage);
        setUserImage(null);
      }
      setOverlay(null);
      // reset overlay controls
      setLeft(50);
      setTop(38);
      setScale(1);
      setRotate(0);
      setOpacity(0.95);
    }
    // eslint-disable-next-line
  }, [open]);

  // Render preview background: prefer camera if running, else uploaded image, else placeholder
  const renderBackground = () => {
    if (cameraOn) {
      return (
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-md"
          playsInline
          muted
        />
      );
    }
    if (userImage) {
      return (
        <img
          src={userImage}
          alt="uploaded"
          className="w-full h-full object-contain rounded-md"
          style={{ maxHeight: "520px" }}
        />
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Upload a photo or start the camera to preview.
      </div>
    );
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Try Clothes in AR</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl overflow-hidden max-h-[92vh]">
            <div className="flex items-start justify-between p-4 border-b">
              <div>
                <h3 className="text-xl font-bold">AR Try-On</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a clothing item, start camera or upload a photo, then adjust overlay.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Camera controls */}
                {!cameraOn ? (
                  <Button onClick={startCamera} className="mr-2">
                    Start Camera
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="destructive" className="mr-2">
                    Stop Camera
                  </Button>
                )}

                {/* Upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  id="user-upload"
                  onChange={handleUpload}
                  className="hidden"
                />
                <label htmlFor="user-upload">
                  <Button asChild>
                    <span onClick={() => fileInputRef.current?.click()}>Upload Photo</span>
                  </Button>
                </label>

                <button
                  className="p-1 rounded hover:bg-slate-100"
                  onClick={() => setOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left: thumbnails */}
              <div className="md:col-span-1 space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {CLOTHES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setOverlay(c.image)}
                      className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border hover:ring-2"
                      title={c.name}
                    >
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-semibold mb-2">Overlay Controls</h4>

                  <label className="text-xs">Left ({left}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={left}
                    onChange={(e) => setLeft(Number(e.target.value))}
                    className="w-full"
                  />

                  <label className="text-xs mt-2">Top ({top}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={top}
                    onChange={(e) => setTop(Number(e.target.value))}
                    className="w-full"
                  />

                  <label className="text-xs mt-2">Scale ({scale.toFixed(2)}x)</label>
                  <input
                    type="range"
                    min="0.4"
                    max="2.4"
                    step="0.01"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full"
                  />

                  <label className="text-xs mt-2">Rotate ({rotate}°)</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotate}
                    onChange={(e) => setRotate(Number(e.target.value))}
                    className="w-full"
                  />

                  <label className="text-xs mt-2">Opacity ({Math.round(opacity * 100)}%)</label>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.01"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="pt-3">
                  <Button onClick={() => {
                    // Reset overlay controls
                    setLeft(50); setTop(38); setScale(1); setRotate(0); setOpacity(0.95);
                  }}>Reset Overlay</Button>
                </div>
              </div>

              {/* Middle + Right: preview (spans 2 cols on md) */}
              <div className="md:col-span-2">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden w-full h-[520px] flex items-center justify-center">
                  {/* Background: video or image */}
                  <div className="absolute inset-0">
                    {renderBackground()}
                  </div>

                  {/* Overlay clothing */}
                  {overlay && (cameraOn || userImage) && (
                    <img
                      src={overlay}
                      alt="overlay"
                      style={{
                        position: "absolute",
                        left: `${left}%`,
                        top: `${top}%`,
                        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
                        opacity: opacity,
                        maxWidth: "60%",
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {/* If no background active, show placeholder */}
                  {!cameraOn && !userImage && (
                    <div className="text-center text-gray-500">
                      <p className="mb-2">No camera or uploaded photo.</p>
                      <p className="text-xs">Start camera or upload a photo to preview.</p>
                    </div>
                  )}
                </div>
              </div>
            </div> {/* end control grid */}
          </div>
        </div>
      )}
    </>
  );
}

export default ARTryOn;