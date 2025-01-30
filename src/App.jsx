import React, { useState } from "react";

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Image to Text Converter</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && <img src={image} alt="Uploaded" style={{ width: "200px", margin: "10px" }} />}
      <br />
      <button onClick={extractText} disabled={!image || loading}>
        {loading ? "Processing..." : "Extract Text"}
      </button>
      <h3>Extracted Text:</h3>
      <p>{text}</p>
    </div>
  );
}

export default App;