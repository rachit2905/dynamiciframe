import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Iframe from "./IFrame";

const ResponsiveGridLayout = WidthProvider(Responsive);

const Canvas = ({
  layouts,
  onLayoutChange,
  onResizeStop,
  onDrop,
  checkAndAdjustIframeSize,
}) => {
  return (
    <div className="canvas-container">
      <h2>Droppable Canvas</h2>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={onLayoutChange}
        onResizeStop={onResizeStop}
        onDrop={onDrop}
        isDroppable={true}
        isDraggable={true}
        isResizable={true}
        preventCollision={true}
        draggableHandle=".drag-handle"
        style={{ height: "500px" }}
      >
        {layouts.lg.map((layoutItem) => (
          <Iframe
            key={layoutItem.i}
            title={layoutItem.i}
            width={layoutItem.w}
            height={layoutItem.h}
            layouts={layouts}
            checkAndAdjustIframeSize={checkAndAdjustIframeSize}
          />
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default Canvas;
