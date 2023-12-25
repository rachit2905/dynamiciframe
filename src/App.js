

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css';

const ResponsiveGridLayout = WidthProvider(Responsive);
const extractElementsData1 = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const elementsData = [];

  Array.from(doc.body.childNodes).forEach((node, index) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const openingTag = node.outerHTML.split('>')[0] + '>'; // Store the complete opening tag
      const closingTag = `</${node.tagName.toLowerCase()}>`; // Store the complete closing tag
      const label = `${node.tagName.toLowerCase()}-${index}`;
      const value = node.innerHTML; // Store the content inside the HTML tags
      elementsData.push({ label, openingTag, closingTag, value }); // Store both opening and closing tags
    }
  });

  return elementsData;
};


const extractElementsData = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const elementsData = [];

  Array.from(doc.body.childNodes).forEach((node, index) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      let value;
      // Check if the node is an input or textarea, use value, otherwise use textContent
      if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
        value = node.value;
      } else {
        value = node.textContent;
      }
      const label = `${tag}-${index}`;
      elementsData.push({ label, value });
    }
  });

  return elementsData;
};

const IframeEditForm = ({ iframe, onSave, onClose }) => {
  // Use the extractElementsData function to set the initial elements data
  const [elementsData, setElementsData] = useState(extractElementsData1(iframe.srcDoc));

  useEffect(() => {
    // Update the elements data when the iframe's source document changes
    setElementsData(extractElementsData1(iframe.srcDoc));
  }, [iframe.srcDoc]);

  const handleChange = (index, newValue) => {
    // Decode the HTML entities to proper HTML


    // Update the content of the element at the given index
    const updatedElementsData = [...elementsData];
    updatedElementsData[index].value = newValue;
    setElementsData(updatedElementsData);

  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Get the original iframe content
    const originalContent = iframe.srcDoc;

    // Create a copy of the original content for updates
    let updatedContent = originalContent;

    // Loop through elementsData and replace corresponding content in updatedContent
    elementsData.forEach((el) => {
      const openingTag = el.openingTag;
      const closingTag = el.closingTag;
      const value = el.value;
      console.log(openingTag, closingTag, value);
      // Find the indices of the opening and closing tags
      const startIndex = updatedContent.indexOf(openingTag);
      const endIndex = updatedContent.indexOf(closingTag, startIndex);
      console.log(startIndex, endIndex);
      if (startIndex !== -1 && endIndex !== -1) {
        // Extract the content between the tags
        //const contentBetweenTags = updatedContent.substring(startIndex + openingTag.length, endIndex);

        // Replace the content between the tags with the new 'value'
        updatedContent = updatedContent.substring(0, startIndex + openingTag.length) +
          value +
          updatedContent.substring(endIndex);
      }
    });

    // Update the iframe's srcDoc with the updated content
    iframe.srcDoc = updatedContent;

    // Call onSave with the updated iframe content
    onSave(iframe.id, updatedContent, iframe.title);

    // Close the edit form
    onClose();
  };





  return (
    <form onSubmit={handleSubmit} style={{ backgroundColor: '#f7f7f7', padding: '20px', borderRadius: '8px' }}>
      {elementsData.map((el, index) => (
        <div key={el.label} style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{el.label}</label>
          <textarea
            style={{ width: '100%', height: '50px', padding: '10px' }}
            value={el.value}
            onChange={(e) => handleChange(index, e.target.value)} // Ensure that this line is correct// Use defaultValue to set the initial content
          />

        </div>
      ))}
      <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Save Changes
      </button>
      <button
        type="button"
        onClick={onClose} // Call onClose when the button is clicked
        style={{
          padding: '10px 15px',
          backgroundColor: 'red', // Customize the color as needed
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px', // Add margin to separate it from the Save button
        }}
      >
        Close
      </button>
    </form>
  );
};




const App = () => {
  const subcomponentTypes = useMemo(() => [
    'textField', 'div', 'button', 'paragraph', 'image', 'link',
    'list', 'table', 'form', 'video', 'audio', 'svg', 'canvas',
    'checkbox', 'radio', 'select', 'customElement',
  ], []);

  const [iframeContents, setIframeContents] = useState({});
  const updateIframeContentsMapping = useCallback((iframeId, htmlContent) => {
    setIframeContents((prevContents) => {
      const updatedContents = {
        ...prevContents,
        [iframeId]: extractElementsData(htmlContent),
      };

      return updatedContents;
    });
  }, []);
  useEffect(() => { console.log(iframeContents); }, [iframeContents]);

  const [queriedContent, setQueriedContent] = useState(null);
  const [queryValue, setQueryValue] = useState("");
  const fetchContentByQuery = (query, iframeContents) => {
    const [iframeId, elementId] = query.split('.');
    const iframeContent = iframeContents[iframeId];
    if (!iframeContent) {
      return null;
    }

    const element = iframeContent.find((el) => el.label === elementId);
    return element ? element.value : null;
  };
  const handleContentQuery = (query) => {
    const content = fetchContentByQuery(query, iframeContents);
    setQueriedContent(content); // Update state with the queried content
  };
  const handleQueryButtonClick = () => {
    // Get the value from the input field (assuming you have a state variable for query)
    const query = queryValue; // Replace with the actual state variable where you store the query.

    // Call the function to handle the content query
    handleContentQuery(query);
  };
  const [autofillSuggestions, setAutofillSuggestions] = useState([]);


  // Function to generate random HTML content for iframes
  const generateRandomHtml = useCallback(() => {
    const randomComponents = [];
    const numberOfComponents = Math.floor(Math.random() * 10) + 1;

    for (let i = 0; i < numberOfComponents; i++) {
      const typeIndex = Math.floor(Math.random() * subcomponentTypes.length);
      const type = subcomponentTypes[typeIndex];

      switch (type) {
        case 'textField':
          randomComponents.push(`<input type="text" placeholder="TextField ${i}" readonly />`);
          break;
        case 'div':
          randomComponents.push(`<div>Div content ${i}</div>`);
          break;
        case 'button':
          randomComponents.push(`<button>Button ${i}</button>`);
          break;
        case 'paragraph':
          randomComponents.push(`<p>Paragraph ${i}</p>`);
          break;
        case 'image':
          randomComponents.push(`<img src="https://via.placeholder.com/150?text=Image+${i}" alt="Image ${i}" />`);
          break;
        case 'link':
          randomComponents.push(`<a href="https://example.com">Link ${i}</a>`);
          break;
        case 'list':
          randomComponents.push(`<ul><li>List item ${i}a</li><li>List item ${i}b</li></ul>`);
          break;
        case 'table':
          randomComponents.push(`<table><tr><td>Table ${i} Row 1</td></tr><tr><td>Table ${i} Row 2</td></tr></table>`);
          break;
        case 'form':
          randomComponents.push(`<form><input type="text" placeholder="Form ${i}" /><button>Submit</button></form>`);
          break;
        case 'video':
          randomComponents.push(`<video controls><source src="movie${i}.mp4" type="video/mp4">Your browser does not support the video tag.</video>`);
          break;
        case 'audio':
          randomComponents.push(`<audio controls><source src="audio${i}.mp3" type="audio/mpeg">Your browser does not support the audio element.</audio>`);
          break;
        case 'svg':
          randomComponents.push(`<svg height="100" width="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>`);
          break;
        case 'canvas':
          randomComponents.push(`<canvas id="canvas${i}" width="100" height="100"></canvas>`);
          break;
        case 'checkbox':
          randomComponents.push(`<input type="checkbox" id="checkbox${i}"><label for="checkbox${i}">Checkbox ${i}</label>`);
          break;
        case 'radio':
          randomComponents.push(`<input type="radio" id="radio${i}" name="radio" value="radio${i}"><label for="radio${i}">Radio ${i}</label>`);
          break;
        case 'select':
          randomComponents.push(`<select><option value="option1">Option ${i}1</option><option value="option2">Option ${i}2</option></select>`);
          break;
        case 'customElement':
          randomComponents.push(`<div class="custom-element">Custom Element ${i}</div>`);
          break;
        // Add more types as needed...
        default:
          randomComponents.push(`<div>Unknown component ${i}</div>`);
          break;
      }
    }

    return randomComponents.join('');
  }, [subcomponentTypes]);

  const [iframeData, setIframeData] = useState([
    {
      url: "https://example.com",
      title: "Iframe 1",
      width: 2,
      height: 2,
      id: 'iframe_1',
      srcDoc: generateRandomHtml(),
    }
  ]);

  const [layouts, setLayouts] = useState({ lg: [] });
  const iframeRefs = useRef({});
  const iframeIndex = useRef(2);
  const [selectedIframe, setSelectedIframe] = useState(null);
  const [iframesOnCanvas, setIframesOnCanvas] = useState([]);
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
  const [editFormKey, setEditFormKey] = useState(null);

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

    // Add the dropped iframe to the new state variable
    setIframesOnCanvas((prevIframes) => [...prevIframes, iframe]);

    // Update the layouts and remove the iframe from iframeData
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
        srcDoc: iframe.srcDoc,
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
    const iframeContent = iframeData.find(i => i.title === title)?.srcDoc;

    if (iframeContent) {
      updateIframeContentsMapping(title, iframeContent);
    }
  }, [iframeData, checkAndAdjustIframeSize, updateIframeContentsMapping]);
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


  const addNewIframe = useCallback(async () => {
    const newIframeId = `iframe_${iframeIndex.current}`;
    const newIframe = {
      url: "https://example.com",
      title: `Iframe ${iframeIndex.current}`,
      width: 2,
      height: 2,
      id: newIframeId,
      srcDoc: generateRandomHtml(),
    };

    // Use a Promise to delay the addition of the new iframe
    await new Promise((resolve) => {
      setTimeout(() => {
        setIframeData((prevIframeData) => [...prevIframeData, newIframe]);
        iframeIndex.current++;
        resolve();
      }, 1000); // 5000 milliseconds (5 seconds) delay
    });
  }, [generateRandomHtml]);

  useEffect(() => {
    // Periodically add new iframes
    const intervalId = setInterval(addNewIframe, 5000);

    return () => clearInterval(intervalId);
  }, [addNewIframe]);


  const [isEditFormVisible, setEditFormVisible] = useState(false);

  // Function to open the edit form
  const openEditForm = (iframeTitle) => {
    const selected = iframesOnCanvas.find((iframe) => iframe.title === iframeTitle);
    if (selected) {
      // Force re-render by setting a new key based on the iframe title
      setEditFormKey(Date.now());
      setSelectedIframe(selected);
      setEditFormVisible(true);
    }
  };


  // Function to render iframe elements on the canvas

  // Function to close the edit form
  const closeEditForm = () => {
    setSelectedIframe(null);
    setEditFormVisible(false);
  };


  const handleSaveIframeContent = useCallback((iframeId, newContent, iframeTitle) => {
    console.log("Saving content for iframe:", iframeId, "Content:", newContent);

    setIframeData(prevIframeData =>
      prevIframeData.map(iframe =>
        iframe.id === iframeId ? { ...iframe, srcDoc: newContent } : iframe
      )
    );

    setIframeContents(prevContents => ({
      ...prevContents,
      [iframeTitle]: extractElementsData(newContent),
    }));

    if (iframeRefs.current[iframeId]) {
      console.log("Updating iframe in DOM");
      iframeRefs.current[iframeId].srcdoc = newContent;
    }

    setSelectedIframe(null);
    setEditFormVisible(false);
  }, [iframeRefs]);

  const handleQueryInputChange = (e) => {
    const query = e.target.value;
    setQueryValue(query); // Update queryValue state

    // Split the query into parts
    const parts = query.split('.');

    if (query === '') {
      // Clear suggestions when the query is empty
      setQueriedContent(null);
      setAutofillSuggestions([]);
    } else if (parts.length === 1) {
      // Autofill iframe titles if only one part is present
      const iframeSuggestions = iframesOnCanvas
        .filter((iframe) => iframe.title.toLowerCase().startsWith(parts[0].toLowerCase()))
        .map((iframe) => iframe.title);
      setAutofillSuggestions(iframeSuggestions);
    } else if (parts.length === 2) {
      // Autofill element IDs when two parts are present (iframe.title.elementId)
      const [iframeTitle] = parts;
      const iframe = iframesOnCanvas.find((i) => i.title === iframeTitle);
      if (iframe) {
        const elementSuggestions = iframeContents[iframe.title]
          .filter((element) => element.label.toLowerCase().startsWith(parts[1].toLowerCase()))
          .map((element) => element.label);
        setAutofillSuggestions(elementSuggestions);
      }
    } else {
      // Clear suggestions when more than two parts are present
      setAutofillSuggestions([]);
    }

    // Debugging: Log the current query and suggestions

  };


  const handleAutofillSuggestionClick = (suggestion) => {
    const parts = queryValue.split('.');
    if (parts.length === 1) {
      // If there's only one part in the query, append the suggestion directly
      setQueryValue(suggestion);
    } else if (parts.length === 2) {
      // If there are already two parts (iframe.title), append the suggestion to the second part
      const newQuery = `${parts[0]}.${suggestion}`;
      setQueryValue(newQuery);
    }
    setAutofillSuggestions([]); // Clear suggestions
    handleContentQuery(queryValue); // Execute the query
  };
  return (
    <div className="App">

      <div className="iframe-list-container">
        <h2>Draggable Iframes</h2>
        <ul className="iframe-list">{renderIframesInList()}</ul>
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
          {layouts.lg.map((layoutItem) => {
            const iframeItem = iframesOnCanvas.find(iframe => iframe.title === layoutItem.i);

            return (
              <div
                key={layoutItem.i}
                className="iframe-wrapper"
                data-grid={layoutItem}
                style={{
                  position: 'relative', // Position relative for absolute positioning of drag handle and edit button
                  padding: '20px', // Padding to prevent content from being obscured
                  boxSizing: 'border-box', // Ensure padding doesn't affect overall dimensions
                }}
              >
                <div
                  className="drag-handle"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10, // Higher z-index to be on top
                    background: 'rgba(255,255,255,0.9)', // Semi-transparent background
                    padding: '5px',
                    cursor: 'move',
                  }}
                >
                  Drag Me
                </div>
                <iframe
                  ref={el => iframeRefs.current[iframeItem.id] = el}
                  title={layoutItem.i}
                  style={{ width: '100%', height: '100%' }}
                  frameBorder="0"
                  srcDoc={iframeItem ? iframeItem.srcDoc : 'about:blank'}
                />
                <button
                  className="edit-button"
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 10, // Higher z-index to be on top
                  }}
                  onClick={() => openEditForm(layoutItem.i)}
                >
                  Edit
                </button>
              </div>
            );

          })}
        </ResponsiveGridLayout>
      </div>

      <div className="box-container">
        <h2>Query Fetcher</h2>
        <div className="query-fetcher">
          <input
            type="text"
            placeholder="Enter query (e.g., iframe1.div1)"
            value={queryValue}
            onChange={handleQueryInputChange}
          />
          <button
            onClick={handleQueryButtonClick}
            className="query-button"
          >
            Execute Query
          </button>
          {/* Display autofill suggestions */}
          {autofillSuggestions.length > 0 && (
            <ul className="autofill-suggestions">
              {autofillSuggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleAutofillSuggestionClick(suggestion)}>
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Queried Content */}
        {queriedContent !== null && (
          <div className="queried-content">
            <h3>Queried Content:</h3>
            <div className="content">{queriedContent}</div>
          </div>
        )}
      </div>

      {/* Edit Form Container */}
      {isEditFormVisible && selectedIframe && (
        <div className="box-container">
          <h2>Edit Iframe Content</h2>
          <IframeEditForm
            key={editFormKey}
            iframe={selectedIframe}
            onSave={handleSaveIframeContent}
            onClose={closeEditForm}
          />
        </div>
      )}

    </div>
  );
};
export default App;