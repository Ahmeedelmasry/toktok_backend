const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const directoryPath = path.join(__dirname, "works_media"); // Path to your works_media directory

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error("Error reading the directory:", err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);

    // Skip non-image files
    if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) {
      console.log(`Skipping non-image file: ${file}`);
      return;
    }

    sharp(filePath)
      .resize({ width: 1920 }) // Resize with aspect ratio maintained
      .webp({ quality: 80 }) // Set WebP quality to 80
      .toFile(filePath + ".tmp") // Write resized image to a temporary file
      .then(() => {
        // Replace the original file with the resized one
        fs.rename(filePath + ".tmp", filePath, (renameErr) => {
          if (renameErr) {
            console.error("Error replacing the file:", renameErr);
          } else {
            console.log(`Resized: ${file}`);
          }
        });
      })
      .catch((resizeErr) => {
        console.error(`Error resizing the file ${file}:`, resizeErr);
      });
  });
});
