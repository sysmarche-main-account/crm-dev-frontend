// import React, { useRef, useEffect } from "react";

// const Widget1 = () => {
//   const iframeRef = useRef(null);

//   // Send command to play, pause, or stop the YouTube video
//   const sendCommandToIframe = (command) => {
//     const iframe = iframeRef.current;
//     if (iframe) {
//       iframe.contentWindow.postMessage(
//         JSON.stringify({ event: "command", command }),
//         "*"
//       );
//     }
//   };

//   useEffect(() => {
//     // Listener to handle responses from iframe (YouTube API)
//     const messageHandler = (event) => {
//       if (event.origin === "https://www.youtube.com") {
//         // YouTube's domain for security
//         const data = JSON.parse(event.data);
//         if (data.event === "onStateChange") {
//           console.log("Player state change:", data.info);
//         }
//       }
//     };

//     window.addEventListener("message", messageHandler);

//     return () => {
//       window.removeEventListener("message", messageHandler);
//     };
//   }, []);

//   return (
//     <div style={styles.container}>
//       <iframe
//         ref={iframeRef}
//         width="100%"
//         height="100%"
//         src="https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1"
//         frameBorder="0"
//         title="YouTube Video"
//         allow="autoplay; encrypted-media"
//       ></iframe>
//     </div>
//   );
// };

// export default Widget1;

import React from "react";

const Widget1 = ({ id }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>Widget{id}</div>
    </div>
  );
};

const styles = {
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "yellow",
    border: "2px solid red",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    color: "white",
    fontSize: "20px",
    fontWeight: "bold",
  },
};

export default Widget1;
