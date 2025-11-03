import React, { useState } from "react";

// 🔹 A reusable neon-styled button component
const NeonButton = ({ label, onClick, extraClasses = "", selectedColor }) => {
  return (
    <button
      onClick={onClick}
      className={`p-3 m-1 rounded transition duration-200 shadow-lg border-2 bg-gray-900 hover:bg-white hover:text-gray-900 ${extraClasses}`}
      style={{
        borderColor: selectedColor,
        color: selectedColor,
        boxShadow: `0 0 10px ${selectedColor}`,
      }}
    >
      {label}
    </button>
  );
};

function GameBoy() {
  const [buttonsState, setButtonsState] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    A: false,
    B: false,
    start: false,
    select: false,
  });

  const [screenMessage, setScreenMessage] = useState("Welcome to Neon Game Boy!");
  const [selectedColor, setSelectedColor] = useState("#00ffff"); // Default cyan
  const ESP_IP = "http://192.168.81.215";

  const buttonServoAngles = {
    up: [0, 45, 90],
    down: [90, 45, 0],
    left: [30, 60, 90],
    right: [90, 120, 150],
    A: [0, 1, 0],
    B: [0, 0, 0],
    start: [90],
    select: [45, 135],
  };

  const handleToggle = async (buttonLabel) => {
    const angles = buttonServoAngles[buttonLabel] || [90];

    try {
      const response = await fetch(`${ESP_IP}/servo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(angles),
      });

      const result = await response.text();
      console.log("ESP32 Response:", result);

      setButtonsState((prevState) => {
        const newState = { ...prevState, [buttonLabel]: !prevState[buttonLabel] };
        const statusText = newState[buttonLabel] ? "activated" : "deactivated";
        setScreenMessage(`${buttonLabel.toUpperCase()} ${statusText}`);
        return newState;
      });
    } catch (error) {
      console.error("Error sending data to ESP32:", error);
      setScreenMessage("Error: ESP32 Not Responding");
    }
  };

  const handleAC = async (buttonLabel) => {
    const angles = buttonServoAngles[buttonLabel] || [90];

    try {
      const response = await fetch(`${ESP_IP}/servo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(angles),
      });

      const result = await response.text();
      console.log("ESP32 Response:", result);

      const statusText = buttonLabel === "A" ? "AC is turned off" : "AC is turned on";
      setScreenMessage(statusText);
    } catch (error) {
      console.error("Error sending data to ESP32:", error);
      setScreenMessage("Error: ESP32 Not Responding");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: "black", color: selectedColor }}
    >
      {/* 🔹 Color Picker */}
      <input
  type="color"
  value={selectedColor}
  onChange={(e) => setSelectedColor(e.target.value)}
  className="mb-4 w-14 h-14 cursor-pointer rounded-full p-0 border-none"
  style={{
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    border: `1px solid ${selectedColor}`,
    boxShadow: `0 0 10px ${selectedColor}`,
  }}
/>


      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "#111",
          border: `4px solid ${selectedColor}`,
          boxShadow: `0 0 30px ${selectedColor}`,
        }}
      >
        {/* 🔹 Game Screen */}
        <div
          className="w-full h-40 flex items-center justify-center font-mono text-lg mb-6 shadow-inner"
          style={{
            backgroundColor: "#222",
            border: `2px solid ${selectedColor}`,
            color: selectedColor,
            boxShadow: `inset 0 0 15px ${selectedColor}`,
          }}
        >
          {screenMessage}
        </div>

        {/* 🔹 Controls Section */}
        <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 md:space-x-12">
          {/* 🎮 D-Pad */}
          <div className="flex flex-col items-center">
            <NeonButton label="↑" onClick={() => handleToggle("up")} extraClasses="w-12 h-12" selectedColor={selectedColor} />
            <div className="flex">
              <NeonButton label="←" onClick={() => handleToggle("left")} extraClasses="w-12 h-12" selectedColor={selectedColor} />
              <NeonButton label="↓" onClick={() => handleToggle("down")} extraClasses="w-12 h-12" selectedColor={selectedColor} />
              <NeonButton label="→" onClick={() => handleToggle("right")} extraClasses="w-12 h-12" selectedColor={selectedColor} />
            </div>
          </div>

          {/* 🔴 Action Buttons */}
          <div className="flex flex-col items-center">
            <NeonButton label="A" onClick={() => handleAC("A")} extraClasses="w-16 h-16 rounded-full" selectedColor={selectedColor} />
            <NeonButton label="B" onClick={() => handleAC("B")} extraClasses="w-16 h-16 rounded-full" selectedColor={selectedColor} />
          </div>
        </div>

        {/* 🔹 Start and Select Buttons */}
        <div className="flex justify-center mt-6 space-x-8">
          <NeonButton label="Start" onClick={() => handleToggle("start")} extraClasses="px-6 py-2" selectedColor={selectedColor} />
          <NeonButton label="Select" onClick={() => handleToggle("select")} extraClasses="px-6 py-2" selectedColor={selectedColor} />
        </div>
      </div>
    </div>
  );
}

export default GameBoy;
