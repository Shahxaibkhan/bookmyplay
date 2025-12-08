import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Branch from '@/models/Branch';
import Arena from '@/models/Arena';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    await connectDB();

    const branch = await Branch.findById(params.id);
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // If no session, limit exposure (owner/admin views use GET; public should not hit this route)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow admins to fetch any branch
    if (session.user.role === 'admin') {
      return NextResponse.json({ branch }, { status: 200 });
    }

    // Owners can fetch branches that belong to their arena
    const arena = await Arena.findById(branch.arenaId);
    if (arena && String(arena.ownerId) === String(session.user.id)) {
      return NextResponse.json({ branch }, { status: 200 });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Get branch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch' },
      { status: 500 }
    );
  }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const data = await request.json();

      await connectDB();

      const branch = await Branch.findById(params.id);
      if (!branch) {
        return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
      }

      // Check authorization
      if (session.user.role !== 'admin') {
        const arena = await Arena.findById(branch.arenaId);
        if (!arena || String(arena.ownerId) !== String(session.user.id)) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }

      const updatePayload: Record<string, unknown> = {
        name: data.name,
        address: data.address,
        city: data.city,
        area: data.area,
        whatsappNumber: data.whatsappNumber,
        googleMapLink: data.googleMapLink,
        paymentBankName: data.paymentBankName,
        paymentAccountNumber: data.paymentAccountNumber,
        paymentIban: data.paymentIban,
        paymentAccountTitle: data.paymentAccountTitle,
        paymentOtherMethods: data.paymentOtherMethods,
      };

      Object.keys(updatePayload).forEach((key) => {
        if (typeof updatePayload[key] === 'undefined') {
          delete updatePayload[key];
        }
      });

      const updatedBranch = await Branch.findByIdAndUpdate(
        params.id,
        updatePayload,
        { new: true }
      );

      return NextResponse.json({
        message: 'Branch updated successfully',
        branch: updatedBranch,
      });
    } catch (error) {
      console.error('Branch update error:', error);
      return NextResponse.json(
        { error: 'Failed to update branch' },
        { status: 500 }
      );
    }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { isApproved } = data;

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'isApproved must be a boolean' },
        { status: 400 }
      );
    }

    await connectDB();

    // If rejected (isApproved = false), delete the branch
    if (isApproved === false) {
      const branch = await Branch.findByIdAndDelete(params.id);
      
      if (!branch) {
        return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
      }

      return NextResponse.json({
        message: 'Branch rejected and deleted successfully',
        branch,
      });
    }

    // If approved, update the branch
    const branch = await Branch.findByIdAndUpdate(
      params.id,
      { isApproved: true },
      { new: true }
    );

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Branch approved successfully',
      branch,
    });
  } catch (error) {
    console.error('Branch approval error:', error);
    return NextResponse.json(
      { error: 'Failed to update branch approval' },
      { status: 500 }
    );
  }
}
