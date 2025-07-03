import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/App.css'
 
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Removed Service Worker registration to prevent caching issues
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('Service Worker registered successfully:', registration.scope);
//         
//         // Check for updates
//         registration.addEventListener('updatefound', () => {
//           const newWorker = registration.installing;
//           console.log('New Service Worker found, installing...');
//           
//           newWorker.addEventListener('statechange', () => {
//             if (newWorker.state === 'installed') {
//               if (navigator.serviceWorker.controller) {
//                 console.log('New Service Worker installed, ready for activation');
//                 // Optionally show update notification to user
//               } else {
//                 console.log('Service Worker installed for the first time');
//               }
//             }
//           });
//         });
//       })
//       .catch((error) => {
//         console.error('Service Worker registration failed:', error);
//       });
//   });
// } 