"use client";
import { useRef } from "react";
import Vapi from "@vapi-ai/web";
import pkg from '@vapi-ai/web/package.json';
console.log("Vapi SDK version at runtime:", pkg.version);

export default function VapiTest() {
  const vapiRef = useRef<any>(null);

  const handleStart = async () => {
    vapiRef.current = new Vapi("4b3fb521-9ad5-439a-8224-cdb78e2e78e8");

    const call = await vapiRef.current.start({
      assistantId: "9295e1aa-6e41-4334-9dc4-030954c7274a",
      variableValues: { report_id: "140" },
    });

    console.log("Call object returned:", call);

    if (call && typeof call.on === "function") {
      alert("Call object is valid! Check the console for details.");
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
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <button
        onClick={handleStart}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-lg shadow hover:opacity-90"
      >
        Test Vapi
      </button>
    </div>
  );
}
