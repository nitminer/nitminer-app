import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';

const getModels = async () => {
  await mongoose.connect(process.env.MONGODB_URI || '');
  
  const userSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    role: String,
  });

  const userActivitySchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    email: String,
    lastLogin: Date,
    lastActive: Date,
    lastActivityAction: String,
    lastActivityPage: String,
    activityCount: Number,
    isOnline: Boolean,
    device: String,
    browser: String,
    ipAddress: String,
    activities: [
      {
        action: String,
        page: String,
        timestamp: Date,
      },
    ],
    createdAt: Date,
  });

  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const UserActivity =
    mongoose.models.UserActivity ||
    mongoose.model('UserActivity', userActivitySchema);

  return { User, UserActivity };
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'lastActive';
    const order = searchParams.get('order') || 'desc';
    const filterOnline = searchParams.get('online');
    const searchEmail = searchParams.get('search');

    const { User, UserActivity } = await getModels();

    // Build filter
    const filter: any = {};
    if (filterOnline === 'true') filter.isOnline = true;
    if (filterOnline === 'false') filter.isOnline = false;
    if (searchEmail) {
      filter.email = { $regex: searchEmail, $options: 'i' };
    }

    // Build sort
    const sortObj: any = {};
    sortObj[sortBy] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const activities = await UserActivity.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const total = await UserActivity.countDocuments(filter);

    // Enhance with user info
    const enrichedActivities = await Promise.all(
      activities.map(async (activity: any) => {
        const user = await User.findById(activity.userId).lean().exec();
        return {
          ...activity,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          userEmail: activity.email,
          lastLoginFormatted: new Date(activity.lastLogin).toLocaleString(),
          lastActiveFormatted: new Date(activity.lastActive).toLocaleString(),
          inactiveMinutes: Math.floor(
            (Date.now() - new Date(activity.lastActive).getTime()) / (1000 * 60)
          ),
          recentActivities: activity.activities
            ? activity.activities.slice(-5).reverse()
            : [],
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activities' },
      { status: 500 }
    );
  }
}
