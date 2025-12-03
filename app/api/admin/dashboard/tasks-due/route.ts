import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";
import { isAuthorizedAdmin } from "@/lib/admin-authorized-emails";

const BOOKINGS_COLLECTION = "bookings";
const VEHICLES_COLLECTION = "vehicles";

/**
 * GET /api/admin/dashboard/tasks-due
 * Fetch tasks that require attention (overdue bookings, maintenance, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.replace('Bearer ', '');
    
    if (!adminAuth) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userEmail = decodedToken.email;

    if (!userEmail || !(await isAuthorizedAdmin(userEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!adminFirestore) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tasks: Array<{
      id: string;
      type: 'overdue_return' | 'pending_approval' | 'maintenance_due' | 'payment_issue';
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      due_date?: string;
      vehicle_id?: string;
      booking_id?: string;
      vehicle?: any;
    }> = [];

    // 1. Check for overdue returns (bookings that should have been returned)
    const bookingsSnapshot = await adminFirestore
      .collection(BOOKINGS_COLLECTION)
      .where('status', 'in', ['confirmed', 'approved', 'active'])
      .get();

    bookingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const endDate = data.end_date ? new Date(data.end_date) : null;
      
      if (endDate && endDate < today) {
        tasks.push({
          id: `overdue-${doc.id}`,
          type: 'overdue_return',
          title: 'Overdue Vehicle Return',
          description: `Vehicle should have been returned on ${endDate.toLocaleDateString()}`,
          priority: 'high',
          due_date: endDate.toISOString(),
          vehicle_id: data.vehicle_id,
          booking_id: doc.id,
        });
      }
    });

    // 2. Check for pending approvals
    const pendingBookingsSnapshot = await adminFirestore
      .collection(BOOKINGS_COLLECTION)
      .where('status', '==', 'pending')
      .get();

    pendingBookingsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      tasks.push({
        id: `pending-${doc.id}`,
        type: 'pending_approval',
        title: 'Booking Pending Approval',
        description: `Booking requires review and approval`,
        priority: 'medium',
        vehicle_id: data.vehicle_id,
        booking_id: doc.id,
      });
    });

    // 3. Fetch vehicle details for tasks
    const vehiclesSnapshot = await adminFirestore.collection(VEHICLES_COLLECTION).get();
    const vehiclesMap = new Map();
    vehiclesSnapshot.docs.forEach(doc => {
      vehiclesMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Add vehicle info to tasks
    const tasksWithVehicles = tasks.map(task => ({
      ...task,
      vehicle: task.vehicle_id && vehiclesMap.get(task.vehicle_id) ? {
        make: vehiclesMap.get(task.vehicle_id).make,
        model: vehiclesMap.get(task.vehicle_id).model,
        year: vehiclesMap.get(task.vehicle_id).year,
      } : null,
    }));

    return NextResponse.json({
      tasks: tasksWithVehicles,
      count: tasksWithVehicles.length,
    });
  } catch (error: any) {
    console.error('Error fetching tasks due:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks due', message: error.message },
      { status: 500 }
    );
  }
}

