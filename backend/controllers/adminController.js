import { ThreatLog } from "../models/ThreatLog.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSecurityAnalytics = asyncHandler(async (_request, response) => {
  const [totalUsers, totalMessages, totalScans, dangerousLinks, malwareFiles, threatsPerDay, topDomains, dangerousFileTypes] =
    await Promise.all([
      User.countDocuments(),
      Message.countDocuments(),
      ThreatLog.countDocuments(),
      ThreatLog.countDocuments({ targetType: "url", status: "dangerous" }),
      ThreatLog.countDocuments({ targetType: "file", status: "dangerous" }),
      ThreatLog.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, threats: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      ThreatLog.aggregate([
        { $match: { domain: { $ne: "" }, status: { $in: ["suspicious", "dangerous"] } } },
        { $group: { _id: "$domain", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      ThreatLog.aggregate([
        { $match: { targetType: "file", status: "dangerous" } },
        { $group: { _id: "$fileType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ])
    ]);

  response.json({
    totals: {
      totalUsers,
      totalMessages,
      totalScans,
      dangerousLinks,
      malwareFiles
    },
    threatsPerDay,
    topDomains,
    dangerousFileTypes,
    suspiciousUsers: []
  });
});
