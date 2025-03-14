// App.js
import React, { useState } from 'react';

// A reusable neon-styled button component
const NeonButton = ({ label, onClick, extraClasses = "" }) => {
    return (
      <button
        onClick={onClick}
        className={`p-3 m-1 rounded transition duration-200 shadow-lg border-2 border-cyan-400 bg-gray-900 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 ${extraClasses}`}
      >
        {label}
      </button>
    );
  };

function GAmeboy() {
  // State to track toggle status of each button
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

  // State to show last action on the "screen"
  const [screenMessage, setScreenMessage] = useState('Welcome to Neon Game Boy!');

  // Toggle handler for buttons—updates button state and sets screen message accordingly.
  const handleToggle = (buttonLabel) => {
    // Predefined integer arrays for different buttons
    const buttonServoAngles = {
      up: [0, 45, 90],
      down: [90, 45, 0],
      left: [30, 60, 90],
      right: [90, 120, 150],
      A: [10, 80, 160],
      B: [160, 80, 10],
      start: [90],
      select: [45, 135]
    };
  
    // Check if the button has predefined angles
    const angles = buttonServoAngles[buttonLabel] || [90]; // Default to [90] if undefined
  
    // Send angles to ESP32
    fetch("http://192.168.46.134/servo", {  // Replace <ESP_IP> with your ESP32's IP
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(angles),
    })
      .then(response => response.text())
      .then(data => console.log("Response:", data))
      .catch(error => console.error("Error:", error));
  
    // Update UI
    setButtonsState((prevState) => {
      const newState = { ...prevState, [buttonLabel]: !prevState[buttonLabel] };
      const statusText = newState[buttonLabel] ? "activated" : "deactivated";
      setScreenMessage(`${buttonLabel.toUpperCase()} ${statusText}`);
      return newState;
    });
  };
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-gray-900 border-4 border-cyan-400 rounded-xl p-6 shadow-2xl shadow-cyan-400">
        {/* Game Screen */}
        <div className="w-full h-40 bg-gray-800 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-mono text-lg mb-6 shadow-inner shadow-cyan-400">
          {screenMessage}
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 md:space-x-12">
          {/* D-Pad (Up, Down, Left, Right) */}
          <div className="flex flex-col items-center">
            <NeonButton
              label="↑"
              onClick={() => handleToggle('up')}
              extraClasses="w-12 h-12"
            />
            <div className="flex">
              <NeonButton
                label="←"
                onClick={() => handleToggle('left')}
                extraClasses="w-12 h-12"
              />
              <NeonButton
                label="↓"
                onClick={() => handleToggle('down')}
                extraClasses="w-12 h-12"
              />
              <NeonButton
                label="→"
                onClick={() => handleToggle('right')}
                extraClasses="w-12 h-12"
              />
            </div>
          </div>

          {/* Action Buttons (A & B) */}
          <div className="flex flex-col items-center">
            <NeonButton
              label="A"
              onClick={() => handleToggle('A')}
              extraClasses="w-16 h-16 rounded-full"
            />
            <NeonButton
              label="B"
              onClick={() => handleToggle('B')}
              extraClasses="w-16 h-16 rounded-full"
            />
          </div>
        </div>

        {/* Start and Select Buttons */}
        <div className="flex justify-center mt-6 space-x-8">
          <NeonButton
            label="Start"
            onClick={() => handleToggle('start')}
            extraClasses="px-6 py-2"
          />
          <NeonButton
            label="Select"
            onClick={() => handleToggle('select')}
            extraClasses="px-6 py-2"
          />
        </div>
      </div>
    </div>
  );
}

export default GAmeboy;