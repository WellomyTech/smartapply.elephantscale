// "use client";
// import { useEffect } from "react";

// export default function ClientVapiProvider() {
//   useEffect(() => {
//     // Add widget script
//     if (!document.getElementById("vapi-widget-script")) {
//       const script = document.createElement("script");
//       script.id = "vapi-widget-script";
//       script.src = "https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js";
//       script.async = true;
//       script.onload = () => {
//         // Add widget after script loads
//         if (!document.querySelector("vapi-widget")) {
//           const widget = document.createElement("vapi-widget");
//           widget.setAttribute("assistant-id", "ff17e75d-7c3a-457b-8957-e6943152a02f");
//           widget.setAttribute("public-key", "4b3fb521-9ad5-439a-8224-cdb78e2e78e8");
//           // widget.style.display = "none"; // Hide if you want voice-only
//           document.body.appendChild(widget);
//         }
//       };
//       document.body.appendChild(script);
//     } else {
//       // Script present, widget may need to be added
//       if (!document.querySelector("vapi-widget")) {
//         const widget = document.createElement("vapi-widget");
//         widget.setAttribute("assistant-id", "ff17e75d-7c3a-457b-8957-e6943152a02f");
//         widget.setAttribute("public-key", "4b3fb521-9ad5-439a-8224-cdb78e2e78e8");
//         // widget.style.display = "none";
//         document.body.appendChild(widget);
//       }
//     }
//   }, []);
//   return null; // No visible UI
// }
