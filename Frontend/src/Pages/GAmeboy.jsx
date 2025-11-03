import React, { useMemo, useState, useEffect, useCallback } from "react";

/* Minimal cn helper */
function cn(...args) {
  const out = [];
  for (const a of args) {
    if (!a) continue;
    if (typeof a === "string") out.push(a);
    else if (typeof a === "object") for (const [k, v] of Object.entries(a)) if (v) out.push(k);
  }
  return out.join(" ");
}

/* Hex → rgba helper for neon glows */
function hexToRgba(hex = "#22d3ee", alpha = 1) {
  const h = hex.replace(/^#/, "");
  let r = 0, g = 0, b = 0, a = alpha;
  if ([3, 4].includes(h.length)) {
    r = parseInt(h + h, 16);
    g = parseInt(h[11] + h[11], 16);
    b = parseInt(h[12] + h[12], 16);
    if (h[13]) a = (parseInt(h[13] + h[13], 16) / 255) || alpha;
  } else if ([6, 8].includes(h.length)) {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
    if (h.slice(6, 8)) a = (parseInt(h.slice(6, 8), 16) / 255) || alpha;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/* Spring-like toggle: drag/click left=OFF, right=ON, auto-centers */
const SpringToggle = ({ onToggleLeft, onToggleRight, isActive = null, className, neon = "#22d3ee" }) => {
  const [position, setPosition] = useState("center"); // 'center' | 'left' | 'right'
  const [isDragging, setIsDragging] = useState(false);

  // Precompute glow colors from neon
  const glow1 = hexToRgba(neon, 0.65);
  const glow2 = hexToRgba(neon, 0.40);
  const glowDot = hexToRgba(neon, 0.9);

  useEffect(() => {
    if (position !== "center") {
      const t = setTimeout(() => setPosition("center"), 200);
      return () => clearTimeout(t);
    }
  }, [position]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;
    const threshold = 30;
    if (mouseX < centerX - threshold) setPosition("left");
    else if (mouseX > centerX + threshold) setPosition("right");
    else setPosition("center");
  };

  const handleMouseUp = () => {
    if (isDragging) {
      if (position === "left") onToggleLeft();
      else if (position === "right") onToggleRight();
      setIsDragging(false);
    }
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const clickX = e.clientX;
    const threshold = rect.width / 3;
    if (clickX < centerX - threshold / 2) {
      setPosition("left");
      onToggleLeft();
    } else if (clickX > centerX + threshold / 2) {
      setPosition("right");
      onToggleRight();
    }
  };

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      onMouseLeave={handleMouseUp}
    >
      {/* Side labels aligned with track centerline, tinted with neon */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full mr-2 text-[10px] font-semibold pointer-events-none select-none"
        style={{ color: neon, textShadow: `0 0 6px ${glow1}` }}
      >
        OFF
      </div>
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-2 text-[10px] font-semibold pointer-events-none select-none"
        style={{ color: neon, textShadow: `0 0 6px ${glow1}` }}
      >
        ON
      </div>

      {/* Track (neon glow) */}
      <div
        className={cn(
          "relative w-24 h-10 rounded-full cursor-pointer select-none transition-all duration-300",
          "bg-[rgba(2,6,23,0.45)] border backdrop-blur-[1px]"
        )}
        style={{
          borderColor: hexToRgba(neon, 0.55),
          boxShadow: `0 0 10px ${glow1}, 0 0 20px ${glow2}`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        role="button"
        aria-label="Toggle servo"
      >
        {/* End dots for visual thresholds */}
        <div
          className="absolute left-1.5 top-1/2 w-2.5 h-2.5 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: neon, boxShadow: `0 0 6px ${glowDot}` }}
        />
        <div
          className="absolute right-1.5 top-1/2 w-2.5 h-2.5 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: neon, boxShadow: `0 0 6px ${glowDot}` }}
        />

        {/* Knob */}
        <div
          className={cn(
            "absolute w-8 h-8 rounded-full transition-all duration-200 transform",
            "top-1/2 -translate-y-1/2",
            { "left-1/2 -translate-x-1/2": position === "center",
              "left-1.5 translate-x-0": position === "left",
              "right-1.5 translate-x-0": position === "right",
              "scale-110": isDragging }
          )}
          style={{
            backgroundImage: `linear-gradient(135deg, ${hexToRgba(neon,0.9)}, ${hexToRgba(neon,0.6)} 60%, ${hexToRgba(neon,0.85)})`,
            border: `1px solid ${hexToRgba(neon,0.7)}`,
            boxShadow: `0 0 8px ${glow1}, 0 0 16px ${glow2}`,
          }}
        >
          <div
            className={cn("absolute inset-0 rounded-full transition-all duration-300 mix-blend-screen")}
            style={{ backgroundColor: hexToRgba(neon, isActive === "on" ? 0.45 : isActive === "off" ? 0.35 : 0.3) }}
          />
        </div>
      </div>
    </div>
  );
};

const KeyboardController = () => {
  const [screenMessage, setScreenMessage] = useState("Servo Controller Ready");
  const [activeStates, setActiveStates] = useState({}); // { [switchNumber]: 'on' | 'off' | null }
  const [neon, setNeon] = useState("#22d3ee"); // default cyan
  const [layout, setLayout] = useState("strip"); // 'strip' (1D) or 'grid' (2D)
  const ESP_IP = "http://192.168.81.215";

  // Derived glow for headings/containers
  const glow1 = hexToRgba(neon, 0.6);
  const glow2 = hexToRgba(neon, 0.25);

  // 1..16 numbering
  const SERVOS = useMemo(() => Array.from({ length: 16 }, (_, i) => i + 1), []);

  // POST { switch, state } with a 4s timeout
  const postSwitch = async (sw, state) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(`${ESP_IP}/servo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ switch: sw, state }),
        signal: controller.signal,
      });
      const text = await res.text().catch(() => "");
      if (!res.ok) throw new Error(`HTTP ${res.status} ${text || ""}`.trim());
      return text || "OK";
    } finally {
      clearTimeout(timer);
    }
  };

  const handleOn = async (sw) => {
    setScreenMessage(`Switch ${sw} → ON`);
    setActiveStates((prev) => ({ ...prev, [sw]: "on" }));
    try {
      await postSwitch(sw, 1);
      setScreenMessage(`Switch ${sw} activated successfully`);
    } catch (e) {
      setScreenMessage(`ON failed (${sw}): ${String(e).slice(0, 100)}`);
      setActiveStates((prev) => ({ ...prev, [sw]: null }));
    }
  };

  const handleOff = async (sw) => {
    setScreenMessage(`Switch ${sw} → OFF`);
    setActiveStates((prev) => ({ ...prev, [sw]: "off" }));
    try {
      await postSwitch(sw, 0);
      setScreenMessage(`Switch ${sw} deactivated successfully`);
    } catch (e) {
      setScreenMessage(`OFF failed (Switch ${sw}): ${String(e).slice(0, 100)}`);
      setActiveStates((prev) => ({ ...prev, [sw]: null }));
    }
  };

  // Tile component shared by both layouts
  const Tile = ({ servo }) => (
    <div
      className={cn(
        "rounded-lg p-4 border transition-all duration-300 min-w-[220px]"
      )}
      style={{
        background: "rgba(2,6,23,0.55)",
        borderColor: hexToRgba(neon, 0.35),
        boxShadow: `0 0 12px ${glow2}`,
      }}
    >
      <div className="text-center mb-4">
        <h3 className="font-semibold" style={{ color: neon, textShadow: `0 0 6px ${glow1}` }}>
          Switch {servo}
        </h3>
        <div className="text-xs mt-1" style={{ color: hexToRgba(neon, 0.7) }}>
          Status:{" "}
          <span className="font-medium">
            {activeStates[servo] || "idle"}
          </span>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <SpringToggle
          onToggleLeft={() => handleOff(servo)}
          onToggleRight={() => handleOn(servo)}
          isActive={activeStates[servo]}
          neon={neon}
        />
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "min-h-screen p-6 flex items-center justify-center"
      )}
      style={{
        backgroundImage: `linear-gradient(to bottom, #020617, ${hexToRgba(neon, 0.12)} 40%, #020617)`,
      }}
    >
      <div className="w-full max-w-6xl">
        {/* Header + controls */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-4xl font-extrabold text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(to right, ${hexToRgba(neon,0.95)}, ${hexToRgba(neon,0.65)})`,
                textShadow: `0 0 12px ${glow1}`,
              }}
            >
              Servo Controller
            </h1>
            <p className="mt-1 text-sm" style={{ color: hexToRgba(neon, 0.75) }}>
              Neon color and 1D meter layout
            </p>
          </div>

          {/* Controls: color + layout */}
          <div className="flex items-center gap-3">
            <label className="text-sm" style={{ color: hexToRgba(neon, 0.8) }}>
              Neon color
            </label>
            <input
              type="color"
              value={neon}
              onChange={(e) => setNeon(e.target.value)}
              className="h-8 w-10 rounded border"
              style={{
                borderColor: hexToRgba(neon, 0.5),
                boxShadow: `0 0 10px ${glow1}`,
                background: neon,
              }}
              aria-label="Pick neon color"
            />
            <div className="ml-4 flex rounded overflow-hidden border" style={{ borderColor: hexToRgba(neon, 0.4) }}>
              <button
                type="button"
                onClick={() => setLayout("strip")}
                className={cn("px-3 py-1 text-sm", layout === "strip" ? "font-semibold" : "")}
                style={{ color: layout === "strip" ? neon : hexToRgba(neon, 0.7), textShadow: layout === "strip" ? `0 0 6px ${glow1}` : "none" }}
                aria-pressed={layout === "strip"}
              >
                1D strip
              </button>
              <button
                type="button"
                onClick={() => setLayout("grid")}
                className={cn("px-3 py-1 text-sm", layout === "grid" ? "font-semibold" : "")}
                style={{ color: layout === "grid" ? neon : hexToRgba(neon, 0.7), textShadow: layout === "grid" ? `0 0 6px ${glow1}` : "none" }}
                aria-pressed={layout === "grid"}
              >
                2D grid
              </button>
            </div>
          </div>
        </div>

        {/* Display */}
        <div
          className="rounded-lg p-6 mb-6 relative overflow-hidden"
          style={{
            background: "rgba(2,6,23,0.55)",
            border: `2px solid ${hexToRgba(neon, 0.4)}`,
            boxShadow: `inset 0 0 20px ${hexToRgba(neon, 0.2)}`,
          }}
        >
          <div className="relative font-mono text-sm text-center" style={{ color: hexToRgba(neon, 0.8), textShadow: `0 0 8px ${glow1}` }}>
            {screenMessage}
          </div>
        </div>

        {/* Meter layout: 1D strip or 2D grid */}
        {layout === "strip" ? (
          <div className="overflow-x-auto py-2">
            <div className="inline-flex gap-4 min-w-max">
              {SERVOS.map((servo) => (
                <Tile key={servo} servo={servo} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVOS.map((servo) => (
              <Tile key={servo} servo={servo} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs" style={{ color: hexToRgba(neon, 0.7), textShadow: `0 0 4px ${glow2}` }}>
          Connected to: {ESP_IP}
        </div>
      </div>
    </div>
  );
};

export default KeyboardController;
