import React, { useRef, useEffect } from "react";

const iframeColor = "#808080";

const Iframe = ({
  title,
  width,
  height,
  layouts,
  checkAndAdjustIframeSize,
}) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    checkAndAdjustIframeSize(title, iframeRef, layouts);
  }, [title, iframeRef, layouts, checkAndAdjustIframeSize]);

  return (
    <div className="iframe-wrapper" data-grid={{ w: width, h: height }}>
      <div className="drag-handle">Drag Me</div>
      <iframe
        title={title}
        style={{ width: "100%", height: "100%" }}
        frameBorder="0"
        ref={iframeRef}
        srcDoc={`
          <html>
            <body style="background-color: ${iframeColor}; padding: 10px;">
              <h3>Random Component</h3>
              <p>Some content</p>
              <button style="background-color: ${iframeColor};">Button</button>
              <input type="checkbox" />
            </body>
          </html>
        `}
      />
    </div>
  );
};

export default Iframe;
