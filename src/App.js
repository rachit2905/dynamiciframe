import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const iframeColor = '#808080';

const App = () => {
  const [iframeData, setIframeData] = useState([
    {
      url: "https://example.com",
      title: "Site 1",
      width: 2,
      height: 2,
      id: 'iframe_1',
    }
  ]);

  const [layouts, setLayouts] = useState({ lg: [] });
  const iframeRefs = useRef({});
  const iframeIndex = useRef(2);

  const checkAndAdjustIframeSize = useCallback((title) => {
    const iframeRef = iframeRefs.current[title];
    if (!iframeRef) return;

    if (iframeRef.parentElement) {
      const container = iframeRef.parentElement;
      const canvas = container.parentElement;
      const maxWidth = canvas.clientWidth / 12;
      const maxHeight = canvas.clientHeight / 10;
      const layoutItem = layouts.lg.find((item) => item.i === title);

      if (layoutItem) {
        const newWidth = Math.min(layoutItem.w, maxWidth);
        const newHeight = Math.min(layoutItem.h, maxHeight);
        iframeRef.width = newWidth * 30;
        iframeRef.height = newHeight * 30;
      }
    }
  }, [layouts]);

  const onLayoutChange = useCallback((newLayout) => {
    // Clear the older layout before setting the new one

  }, []);

  const onResizeStop = useCallback((layout, oldItem, newItem) => {
    const updatedLayouts = layouts.lg.map(item => {
      if (item.i === newItem.i) {
        return { ...item, w: newItem.w, h: newItem.h };
      }
      return item;
    });
    setLayouts({ lg: updatedLayouts });
    checkAndAdjustIframeSize(newItem.i);
  }, [layouts, checkAndAdjustIframeSize]);

  const onDrop = useCallback((layout, item, e) => {
    const title = e.dataTransfer.getData('text');
    const iframe = iframeData.find((i) => i.title === title);
    if (!iframe) return;

    setLayouts((prevLayouts) => {
      if (prevLayouts.lg.find((l) => l.i === title)) {
        return prevLayouts;
      }
      const newLayoutItem = {
        i: title,
        x: Math.round(item.x),
        y: Math.round(item.y),
        w: iframe.width,
        h: iframe.height,
      };
      return {
        ...prevLayouts,
        lg: [...prevLayouts.lg, newLayoutItem],
      };
    });

    setIframeData((prevIframeData) =>
      prevIframeData.filter((i) => i.title !== title)
    );

    checkAndAdjustIframeSize(title);
  }, [iframeData, checkAndAdjustIframeSize]);

  useEffect(() => {
    const renderIframesInList = () => {
      return iframeData.map((iframe) => (
        <li
          key={iframe.title}
          draggable="true"
          onDragStart={(e) => e.dataTransfer.setData('text', iframe.title)}
          className="iframe-item"
        >
          {iframe.title}
        </li>
      ));
    };

    renderIframesInList();
  }, [iframeData]);

  useEffect(() => {
    const addNewIframe = () => {
      const newIframeId = `iframe_${iframeIndex.current}`;
      const newIframe = {
        url: "https://example.com",
        title: `Site ${iframeIndex.current}`,
        width: 2,
        height: 2,
        id: newIframeId,
      };
      setIframeData((prevIframeData) => [...prevIframeData, newIframe]);
      iframeIndex.current++;
    };

    const intervalId = setInterval(addNewIframe, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      <div className="iframe-list-container">
        <h2>Draggable Iframes</h2>
        <ul className="iframe-list">
          {iframeData.map((iframe) => (
            <li
              key={iframe.title}
              draggable="true"
              onDragStart={(e) => e.dataTransfer.setData('text', iframe.title)}
              className="iframe-item"
            >
              {iframe.title}
            </li>
          ))}
        </ul>
      </div>
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
          style={{ height: '500px' }}
        >
          {layouts.lg.map((layoutItem) => (
            <div key={layoutItem.i} className="iframe-wrapper" data-grid={layoutItem}>
              <div className="drag-handle">Drag Me</div>
              <iframe
                key={layoutItem.i}
                title={layoutItem.i}
                style={{ width: '100%', height: '100%' }}
                frameBorder="0"
                ref={(ref) => (iframeRefs.current[layoutItem.i] = ref)}
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
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default App;
