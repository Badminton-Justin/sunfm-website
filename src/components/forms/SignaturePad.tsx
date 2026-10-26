"use client";

import { useCallback, useEffect, useRef } from "react";

interface SignaturePadProps {
  // Called with a PNG data URL after each stroke, or null once cleared.
  onChange: (signature: string | null) => void;
}

// Kept at 3:1 so the PDF can place it at a fixed size without distortion.
const ASPECT = 3;

export default function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);

  const reset = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    canvas.width = width * ratio;
    canvas.height = (width / ASPECT) * ratio;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, width / ASPECT);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111111";
    hasInk.current = false;
    onChange(null);
  }, [onChange]);

  useEffect(() => {
    reset();
    // Resizing wipes a canvas, so start over rather than keep a stretched copy.
    // Mobile browsers fire resize when the address bar hides on scroll, so
    // only a change in width counts — otherwise scrolling erases the signature.
    let width = canvasRef.current?.clientWidth;
    function onResize() {
      const next = canvasRef.current?.clientWidth;
      if (next !== width) {
        width = next;
        reset();
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [reset]);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = e.currentTarget.getContext("2d")!;
    const { x, y } = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // A tap alone should leave a dot.
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    hasInk.current = true;
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d")!;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasInk.current) onChange(e.currentTarget.toDataURL("image/png"));
  }

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          aria-label="Signature pad: draw your signature with your finger or mouse"
          className="w-full aspect-[3/1] bg-white border border-gray-300 rounded-lg cursor-crosshair touch-none"
        />
        <span className="pointer-events-none absolute left-4 right-4 bottom-[22%] border-b border-dashed border-gray-300" />
      </div>
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-xs text-gray-500">Sign with your finger or mouse</span>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-gray-600 hover:text-[#CB4538] underline underline-offset-2 py-2 px-1"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
