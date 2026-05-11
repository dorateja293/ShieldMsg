import { scanUploadedFile } from "../services/fileScanner.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadAndScan = asyncHandler(async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ message: "File is required" });
  }

  const scan = await scanUploadedFile(request.file);
  response.status(201).json({
    file: {
      originalName: request.file.originalname,
      fileName: request.file.filename,
      fileUrl: scan.status === "dangerous" ? "" : `/uploads/${request.file.filename}`,
      mimeType: request.file.mimetype,
      size: request.file.size
    },
    scan,
    blocked: scan.status === "dangerous"
  });
});
