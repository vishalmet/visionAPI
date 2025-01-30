import React, { useState } from "react";
import "./index.css";

const App = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // ... (keeping the same handlers as before)
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImage(reader.result);
      };
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(e.dataTransfer.files[0]);
      reader.onloadend = () => {
        setImage(reader.result);
      };
    }
  };

  const extractText = async () => {
    if (!image) return;
    setLoading(true);

    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const requestBody = {
      requests: [
        {
          image: { content: image.split(",")[1] },
          features: [{ type: "TEXT_DETECTION" }],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      setText(data.responses[0]?.fullTextAnnotation?.text || "No text found");
    } catch (error) {
      console.error("Error extracting text:", error);
      setText("Error extracting text");
    }

    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="content-container">
        <h1>Image to Text Converter</h1>
        
        <div className="glass-card upload-card">
          <div 
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="drop-zone-label">
              <div className="upload-icon"></div>
              <div className="drop-zone-text">
                Drop your image here
              </div>
              <div className="drop-zone-subtext">
                or click to browse
              </div>
            </label>
          </div>

          {image && (
            <div className="image-preview-container">
              <div className="image-preview">
                <img src={image} alt="Uploaded" />
              </div>
            </div>
          )}

          <button
            onClick={extractText}
            disabled={!image || loading}
            className={`extract-button ${loading ? 'loading' : ''}`}
          >
            <span className="button-content">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="button-icon">⚡</span>
                  Extract Text
                </>
              )}
            </span>
          </button>
        </div>

        {text && (
          <div className="glass-card result-card">
            <div className="result-header">
              <h2>Extracted Text</h2>
              <div className="pill">AI Processed</div>
            </div>
            <div className="extracted-text">
              {text}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;