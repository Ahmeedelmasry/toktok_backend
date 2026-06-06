const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { pipeline } = require("stream/promises");
const { Readable } = require("stream");

const uploadFile = async (
  req,
  res,
  folderName,
  mediaType = "image",
  multiple = false
) => {
  const MAX_DIMENSION = 16383; // WebP maximum dimension limit

  if (!multiple) {
    const imgFile = req.files.file;
    let ext = null;
    if (imgFile.mimetype.split("/")[1] === "gif") {
      ext = "gif";
    } else {
      mediaType === "image" ? (ext = "webp") : (ext = "mp4");
    }

    const editedImgTitle = "file";
    const imgFullName = `${editedImgTitle}-${Date.now()}.${ext}`;
    const filePath = path.join(__dirname, `../${folderName}`, imgFullName);

    try {
      if (mediaType === "image" && imgFile.mimetype === "image/gif") {
        // Directly write the GIF file to the target directory
        const readableStream = Readable.from(imgFile.data);
        await pipeline(readableStream, fs.createWriteStream(filePath));
        return imgFullName;
      } else if (mediaType === "image") {
        const metadata = await sharp(imgFile.data).metadata();

        if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
          throw new Error(
            `Image dimensions exceed the WebP limit of ${MAX_DIMENSION}px`
          );
        }

        // Compress the image using Sharp
        await sharp(imgFile.data)
          .resize({ width: Math.min(metadata.width, 1920) }) // Ensure resizing fits within limits
          .webp({ quality: 80 }) // Set WebP quality to 80
          .toFile(filePath);

        return imgFullName;
      } else {
        const readableStream = Readable.from(imgFile.data);
        await pipeline(readableStream, fs.createWriteStream(filePath));
        return imgFullName;
      }
    } catch (err) {
      console.error("Error processing file:", err.message);
      throw new Error(err.message);
    }
  } else {
    const urls = [];
    let increment = 1;

    for (const val of Object.entries(req.files)) {
      const imgFile = val[1];

      let ext = null;
      if (imgFile.mimetype.split("/")[1] === "gif") {
        ext = "gif";
      } else {
        mediaType === "image" ? (ext = "webp") : (ext = "mp4");
      }

      const editedImgTitle = "file";
      const imgFullName = `${editedImgTitle}-${
        Date.now() + increment * 10
      }.${ext}`;
      const filePath = path.join(__dirname, `../${folderName}`, imgFullName);

      try {
        if (mediaType === "image" && imgFile.mimetype === "image/gif") {
          // Directly write the GIF file to the target directory
          const readableStream = Readable.from(imgFile.data);
          await pipeline(readableStream, fs.createWriteStream(filePath));
          urls.push(imgFullName);
        } else if (mediaType === "image") {
          const metadata = await sharp(imgFile.data).metadata();

          if (
            metadata.width > MAX_DIMENSION ||
            metadata.height > MAX_DIMENSION
          ) {
            throw new Error(
              `Image dimensions exceed the WebP limit of ${MAX_DIMENSION}px`
            );
          }

          // Compress the image using Sharp
          await sharp(imgFile.data)
            .resize({ width: Math.min(metadata.width, 1920) })
            .webp({ quality: 80 })
            .toFile(filePath);

          urls.push(imgFullName);
        } else {
          const readableStream = Readable.from(imgFile.data);
          await pipeline(readableStream, fs.createWriteStream(filePath));
          urls.push(imgFullName);
        }
      } catch (err) {
        console.error(`Error processing file ${imgFullName}:`, err.message);
        throw new Error(`Failed to process file: ${imgFullName}`);
      }

      increment++;
    }
    return urls;
  }
};

const delFile = (filePathToDelete) => {
  fs.access(filePathToDelete, fs.constants.F_OK, (err) => {
    if (err) {
      return false;
    }

    // File exists, so we can proceed with deletion
    fs.unlink(filePathToDelete, (err) => {
      if (err) {
        return false;
      }
    });
    return true;
  });
};

module.exports = { uploadFile, delFile };
