const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3001;

// Multer storage configuration
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    cb(null, `${Date.now()}${extname}`);
  },
});

const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));

// Create a folder for collections
const collectionPath = "collections/";
if (!fs.existsSync(collectionPath)) {
  fs.mkdirSync(collectionPath);
}

// Routes for CRUD operations
app.use(express.json());

// Create - Upload an image
app.post("/upload", upload.single("image"), (req, res) => {
  // Access uploaded file details through req.file
  res.json({ message: "Image uploaded successfully" });
});

// Read - Get a list of uploaded images
app.get("/images", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      let uploadedImages = files.map((file) => {
        return `http://localhost:${port}/uploads/${file}`;
      });
      res.json(uploadedImages);
    }
  });
});

// Add - Add an image to the collection
app.post("/collection/add/:filename", (req, res) => {
  const { filename } = req.params;
  const sourceFilePath = path.join("uploads", filename);
  const destFilePath = path.join(collectionPath, filename);

  fs.copyFile(sourceFilePath, destFilePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json({ message: "Image added to the collection successfully" });
    }
  });
});

// List - Get a list of images in the collection
app.get("/collection/images", (req, res) => {
  fs.readdir(collectionPath, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      let collectionImages = files.map((file) => {
        return `http://localhost:${port}/collections/${file}`;
      });
      res.json(collectionImages);
    }
  });
});

// Delete - Delete an image by filename
app.delete("/images/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join("uploads", filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json({ message: "Image deleted successfully" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});