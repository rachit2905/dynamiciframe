import React from "react";

const IframeList = ({ iframeData }) => {
  return (
    <div className="iframe-list-container">
      <h2>Draggable Iframes</h2>
      <ul className="iframe-list">
        {iframeData.map((iframe) => (
          <li
            key={iframe.title}
            draggable="true"
            onDragStart={(e) => e.dataTransfer.setData("text", iframe.title)}
            className="iframe-item"
          >
            {iframe.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IframeList;
