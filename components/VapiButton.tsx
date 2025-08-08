// 'use client';

// import { useEffect, useState } from 'react';

// interface VapiButtonProps {
//   reportId: number | string | null;
// }

// export default function VapiButton({ reportId }: VapiButtonProps) {
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     const scriptId = 'vapi-widget-script';
//     if (document.getElementById(scriptId)) {
//       // If already present, just wait for SDK global
//       const int = setInterval(() => {
//         if ((window as any).vapiSDK) {
//           clearInterval(int);
//           setReady(true);
//         }
//       }, 100);
//       return () => clearInterval(int);
//     }
//     // Else inject
//     const script = document.createElement('script');
//     script.id = scriptId;
//     script.src =
//       'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js';
//     script.async = true;
//     script.onload = () => {
//       const int = setInterval(() => {
//         if ((window as any).vapiSDK) {
//           clearInterval(int);
//           setReady(true);
//         }
//       }, 100);
//     };
//     document.body.appendChild(script);
//   }, []);

//   const handleClick = () => {
//     if (!(window as any).vapiSDK) {
//       console.error('Vapi SDK not loaded');
//       return;
//     }
//     (window as any).vapiSDK.run({
//       assistant: '9295e1aa-6e41-4334-9dc4-030954c7274a', // your assistant id
//       apiKey: '4b3fb521-9ad5-439a-8224-cdb78e2e78e8', // your public key
//       assistantOverrides: {
//         variableValues: {
//           report_id: reportId, // Passes report_id to the agent
//         },
//       },
//     });
//     console.log('Vapi Assistant started with assistantOverrides.variableValues:', { report_id: reportId });
//   };

//   return (
//     <button
//       disabled={!ready || !reportId}
//       onClick={handleClick}
//       className={`px-4 py-2 rounded transition font-medium shadow
//         ${ready && reportId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-white cursor-not-allowed'}
//       `}
//     >
//       {ready ? 'Start Interview' : 'Loading…'}
//     </button>
//   );
// }
