import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function notFound(request, response) {
  response.status(404).json({ message: `Route not found: ${request.originalUrl}` });
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ApiError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Validation failed",
      details: error.flatten()
    });
  }

  if (error.name === "ValidationError") {
    return response.status(400).json({ message: error.message });
  }

  if (error.code === 11000) {
    return response.status(409).json({ message: "Duplicate record", fields: error.keyValue });
  }

  console.error(error);
  response.status(error.statusCode ?? 500).json({
    message: error.message ?? "Internal server error"
  });
}
