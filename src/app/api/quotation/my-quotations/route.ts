import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Quotation } from '@/models/Quotation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('[My-Quotations API] Session received:', {
      hasSession: !!session,
      email: session?.user?.email,
      role: session?.user?.role,
    });

    if (!session?.user?.email) {
      console.log('[My-Quotations API] No valid session/email');
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Query quotations by email
    const quotations = await Quotation.find({
      userEmail: session.user.email,
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log('[My-Quotations API] Fetched user quotations:', {
      userEmail: session.user.email,
      count: quotations.length,
    });

    return NextResponse.json(
      {
        data: quotations.map((q: any) => ({
          _id: q._id,
          planName: q.planName,
          planDuration: q.planDuration,
          numberOfTools: q.numberOfTools,
          estimatedPrice: q.estimatedPrice,
          status: q.status,
          quotationPdfUrl: q.quotationPdfUrl,
          quotationFileName: q.quotationFileName,
          adminNotes: q.adminNotes,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotations' },
      { status: 500 }
    );
  }
}
