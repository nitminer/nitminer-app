import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { UserActivity } from '@/models/UserActivity';
import { User } from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const INACTIVITY_TIMEOUT_MINUTES = 180; // 3 hours

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Verify admin role
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters for pagination and filtering
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = searchParams.get('sortBy') || 'lastActive';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const filterOnline = searchParams.get('online');
    const searchEmail = searchParams.get('email');

    // Build filter
    const filter: any = {};
    if (filterOnline === 'true') {
      filter.isOnline = true;
    } else if (filterOnline === 'false') {
      filter.isOnline = false;
    }

    if (searchEmail) {
      filter.email = { $regex: searchEmail, $options: 'i' };
    }

    // Get total count
    const totalUsers = await UserActivity.countDocuments(filter);

    // Get activities with pagination
    const activities = await UserActivity.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        'userId email lastLogin lastActive lastActivityAction lastActivityPage device browser os ipAddress activityCount sessionDuration isOnline'
      )
      .lean();

    // Calculate inactivity for each user
    const currentTime = Date.now();
    const activitiesWithStatus = activities.map((activity: any) => {
      const lastActivityTime = new Date(activity.lastActive).getTime();
      const inactiveMinutes = Math.floor((currentTime - lastActivityTime) / (1000 * 60));
      const isSessionExpired = inactiveMinutes > INACTIVITY_TIMEOUT_MINUTES;

      return {
        ...activity,
        inactiveMinutes,
        isSessionExpired,
        onlineStatus: activity.isOnline && !isSessionExpired ? 'online' : 'offline',
      };
    });

    return NextResponse.json({
      success: true,
      data: activitiesWithStatus,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
