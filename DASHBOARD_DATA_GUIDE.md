# Dashboard KPI Data Guide

This guide explains where the dashboard KPI cards pull their data from and how to add test data.

## KPI Cards Overview

The dashboard has three KPI cards that now pull **real data** from Firestore:

1. **Active Bookings Today** - Shows bookings that are active today
2. **Vehicles Out** - Shows vehicles currently rented out
3. **Tasks Due** - Shows tasks requiring attention (overdue returns, pending approvals)

## Data Sources

### 1. Active Bookings Today

**API Endpoint:** `/api/admin/dashboard/active-bookings`

**Data Source:** Firestore `bookings` collection

**Filter Criteria:**
- Status must be: `confirmed`, `approved`, or `active`
- Start date <= today
- End date >= today

**To Add Test Data:**
1. Go to Firestore Console
2. Navigate to `bookings` collection
3. Create a new document with:
   ```json
   {
     "vehicle_id": "your-vehicle-id",
     "start_date": "2024-12-15",  // Today or earlier
     "end_date": "2024-12-20",    // Today or later
     "status": "confirmed",
     "total_price": 500,
     "customer_name": "John Doe",
     "customer_email": "john@example.com",
     "created_at": "2024-12-10T10:00:00Z"
   }
   ```

### 2. Vehicles Out

**API Endpoint:** `/api/admin/dashboard/vehicles-out`

**Data Source:** Firestore `bookings` and `vehicles` collections

**Filter Criteria:**
- Bookings with status: `confirmed`, `approved`, or `active`
- Booking dates overlap with today (start <= today <= end)

**To Add Test Data:**
1. Create a vehicle in `vehicles` collection:
   ```json
   {
     "make": "Toyota",
     "model": "Camry",
     "year": 2023,
     "price_per_day": 50,
     "available": false
   }
   ```
2. Create a booking for that vehicle (see Active Bookings section above)

### 3. Tasks Due

**API Endpoint:** `/api/admin/dashboard/tasks-due`

**Data Source:** Firestore `bookings` collection

**Task Types:**
- **Overdue Returns:** Bookings where `end_date` < today and status is `confirmed`/`approved`/`active`
- **Pending Approvals:** Bookings with status `pending`

**To Add Test Data:**

**For Overdue Returns:**
```json
{
  "vehicle_id": "your-vehicle-id",
  "start_date": "2024-12-01",
  "end_date": "2024-12-10",  // Past date
  "status": "confirmed",
  "total_price": 500,
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com"
}
```

**For Pending Approvals:**
```json
{
  "vehicle_id": "your-vehicle-id",
  "start_date": "2024-12-20",
  "end_date": "2024-12-25",
  "status": "pending",  // This creates a pending approval task
  "total_price": 500,
  "customer_name": "Bob Johnson",
  "customer_email": "bob@example.com"
}
```

## Quick Test Data Setup

### Option 1: Use Admin Dashboard
1. Go to `/admin/add-vehicle` and add a vehicle
2. Go to `/admin/bookings` and create a booking with:
   - Start date: Today or earlier
   - End date: Today or later
   - Status: `confirmed` or `pending`

### Option 2: Direct Firestore Entry
1. Open Firebase Console
2. Navigate to Firestore
3. Add documents to `bookings` collection with the structure above

## Real-Time Updates

The KPI cards automatically refresh when:
- You click on a card (opens modal with latest data)
- Page is refreshed
- Data is updated in Firestore (if you implement real-time listeners)

## Troubleshooting

**Cards show 0 or "..."**
- Check that Firestore API is enabled
- Verify you have bookings/vehicles in Firestore
- Check browser console for API errors
- Ensure dates are in correct format (ISO string or Firestore Timestamp)

**Modal shows "No data"**
- Verify the filter criteria match your data
- Check that booking statuses match (`confirmed`, `approved`, `active`, or `pending`)
- Ensure dates overlap with today for active bookings

**Data not updating**
- Refresh the page
- Check Firestore for recent changes
- Verify API endpoints are returning data (check Network tab in browser dev tools)

