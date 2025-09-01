"use client";
import { useRef } from "react";
import Vapi from "@vapi-ai/web";
import pkg from '@vapi-ai/web/package.json';
console.log("Vapi SDK version at runtime:", pkg.version);

<<<<<<< HEAD
=======

// If you want type safety and the SDK exports a type, import it like this:
// import type { Vapi as VapiType } from "@vapi-ai/web";
// const vapiRef = useRef<VapiType | null>(null);

// Otherwise, you can use `any` for a quick test:

>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
export default function VapiTest() {
  const vapiRef = useRef<any>(null);

  const handleStart = async () => {
<<<<<<< HEAD
    vapiRef.current = new Vapi("4b3fb521-9ad5-439a-8224-cdb78e2e78e8");

=======
    // Create a new Vapi instance (usually you'd do this once in your app)
    vapiRef.current = new Vapi("4b3fb521-9ad5-439a-8224-cdb78e2e78e8");

    // Start the call with the correct signature
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
    const call = await vapiRef.current.start({
      assistantId: "9295e1aa-6e41-4334-9dc4-030954c7274a",
      variableValues: { report_id: "140" },
    });

    console.log("Call object returned:", call);

<<<<<<< HEAD
    if (call && typeof call.on === "function") {
      alert("Call object is valid! Check the console for details.");
=======
    // Check if .on is a function (should be true if correct call object)
    if (call && typeof call.on === "function") {
      alert("Call object is valid! Check the console for details.");
      // Optional: demonstrate ending the call after 5 seconds for testing
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
      setTimeout(() => {
        if (typeof call.end === "function") {
          call.end();
          alert("Call ended after 5 seconds!");
        } else {
          alert("call.end() not found.");
        }
      }, 5000);
    } else {
      alert("Call object is invalid. Check the console log.");
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <button
        onClick={handleStart}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-lg shadow hover:opacity-90"
=======
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button
        onClick={handleStart}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg shadow hover:bg-blue-700"
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
      >
        Test Vapi
      </button>
    </div>
  );
}
