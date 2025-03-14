import React, { useState } from "react";

export default function NeonGameBoy() {
  const [acOn, setAcOn] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      {/* GameBoy Body */}
      <div className="bg-gray-900 border-4 border-pink-600 rounded-3xl p-6 w-72 h-96 flex flex-col items-center shadow-2xl">
        {/* Screen */}
        <div
          className="w-56 h-32 bg-black border-4 border-green-500 rounded-lg flex items-center justify-center font-mono text-2xl text-green-500"
          style={{ textShadow: "0 0 8px #0f0, 0 0 10px #0f0" }}
        >
          {acOn ? "AC is ON" : "Press +"}
        </div>

        {/* Button Section */}
        <div className="mt-8">
          <button
            className="w-12 h-12 bg-blue-500 rounded-full shadow-xl text-white text-2xl hover:bg-blue-400 active:scale-95 transition transform"
            onClick={() => setAcOn(true)}
            style={{ boxShadow: "0 0 8px #00f, 0 0 10px #00f" }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
