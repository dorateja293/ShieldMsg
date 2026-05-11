import { Post } from "../models/Post.js";
import { extractLinks } from "../utils/extractLinks.js";
import { combineThreatResults } from "../utils/threatScore.js";
import { scanLink } from "../services/linkScanner.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPost = asyncHandler(async (request, response) => {
  const detectedLinks = extractLinks(request.body.body);
  const results = await Promise.all(detectedLinks.map(scanLink));
  const combined = combineThreatResults(results);
  const post = await Post.create({
    authorId: request.user._id,
    body: combined.status === "dangerous" ? "[dangerous content hidden]" : request.body.body,
    mediaUrl: request.body.mediaUrl ?? "",
    detectedLinks,
    safetyStatus: combined.status,
    threatScore: combined.score
  });

  response.status(201).json({ post });
});

export const getFeed = asyncHandler(async (_request, response) => {
  const posts = await Post.find().populate("authorId", "username profilePicture").sort({ createdAt: -1 }).limit(50);
  response.json({ posts });
});
