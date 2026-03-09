import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';

const getModels = async () => {
  await mongoose.connect(process.env.MONGODB_URI || '');

  const userActivitySchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    email: String,
    lastLogin: Date,
    lastActive: Date,
    lastActivityAction: String,
    isOnline: Boolean,
    activityCount: Number,
  });

  const UserActivity =
    mongoose.models.UserActivity ||
    mongoose.model('UserActivity', userActivitySchema);

  return { UserActivity };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    // Verify admin access
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h'; // 24h, 7d, 30d

    const { UserActivity } = await getModels();

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setHours(startDate.getHours() - 24);
    }

    // Get statistics
    const stats = await UserActivity.aggregate([
      {
        $facet: {
          // Online users right now
          onlineUsers: [
            {
              $match: {
                isOnline: true,
                lastActive: { $gte: startDate },
              },
            },
            { $count: 'count' },
          ],

          // Total active users in time range
          activeUsers: [
            {
              $match: {
                lastActive: { $gte: startDate },
              },
            },
            { $count: 'count' },
          ],

          // Most active users
          mostActiveUsers: [
            {
              $match: {
                lastActive: { $gte: startDate },
              },
            },
            {
              $sort: { activityCount: -1 },
            },
            {
              $limit: 5,
            },
            {
              $project: {
                email: 1,
                activityCount: 1,
                lastActivityAction: 1,
              },
            },
          ],

          // Activity by action
          activitiesByAction: [
            {
              $match: {
                lastActive: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: '$lastActivityAction',
                count: { $sum: 1 },
              },
            },
            {
              $sort: { count: -1 },
            },
          ],

          // Average activity count
          avgActivityMetrics: [
            {
              $match: {
                lastActive: { $gte: startDate },
              },
            },
            {
              $group: {
                _id: null,
                avgActivityCount: { $avg: '$activityCount' },
                totalActivityCount: { $sum: '$activityCount' },
                userCount: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const result = {
      timeRange,
      stats: {
        onlineUsers: stats[0].onlineUsers[0]?.count || 0,
        activeUsers: stats[0].activeUsers[0]?.count || 0,
        mostActiveUsers: stats[0].mostActiveUsers || [],
        activitiesByAction: stats[0].activitiesByAction || [],
        avgActivityCount:
          Math.round(
            (stats[0].avgActivityMetrics[0]?.avgActivityCount || 0) * 100
          ) / 100,
        totalActivityCount: stats[0].avgActivityMetrics[0]?.totalActivityCount || 0,
        uniqueUsers: stats[0].avgActivityMetrics[0]?.userCount || 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity statistics' },
      { status: 500 }
    );
  }
}
