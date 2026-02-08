import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Quotation } from '@/models/Quotation';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    // Check admin role
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const quotations = await Quotation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log('Admin fetched quotations:', {
      count: quotations.length,
      status: status || 'all',
    });

    return NextResponse.json(
      {
        data: quotations.map((q: any) => ({
          _id: q._id,
          userEmail: q.userEmail,
          customerName: q.customerName,
          planName: q.planName,
          planDuration: q.planDuration,
          numberOfTools: q.numberOfTools,
          estimatedPrice: q.estimatedPrice,
          additionalRequirements: q.additionalRequirements,
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
