import { getConnection } from '../../../lib/db';
import sql from 'mssql';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');
    const organizerId = searchParams.get('organizerId');
    const bookingId = searchParams.get('bookingId');

    const pool = await getConnection();
    let query = `
      SELECT 
        b.BookingId,
        b.TripId,
        b.OrganizerId,
        b.Type,
        b.Provider_Name,
        b.Booking_Ref,
        b.Start_Date,
        b.End_Date,
        t.Name as TripName,
        t.Destination as TripDestination,
        o.Name as OrganizerName,
        o.Email as OrganizerEmail,
        o.Phone as OrganizerPhone
      FROM Bookings b
      INNER JOIN Trips t ON b.TripId = t.TripId
      INNER JOIN Organizers o ON b.OrganizerId = o.OrganizerId
    `;

    const request_query = pool.request();
    const conditions = [];

    if (bookingId) {
      conditions.push('b.BookingId = @BookingId');
      request_query.input('BookingId', sql.Int, parseInt(bookingId));
    }

    if (tripId) {
      conditions.push('b.TripId = @TripId');
      request_query.input('TripId', sql.Int, parseInt(tripId));
    }

    if (organizerId) {
      conditions.push('b.OrganizerId = @OrganizerId');
      request_query.input('OrganizerId', sql.Int, parseInt(organizerId));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY b.Start_Date DESC, b.BookingId DESC';

    const result = await request_query.query(query);

    if (bookingId && result.recordset.length > 0) {
      const usersResult = await pool.request()
        .input('BookingId', sql.Int, parseInt(bookingId))
        .query(`
          SELECT u.UserId, u.Name, u.Email
          FROM BookingUsers bu
          INNER JOIN Users u ON bu.UserId = u.UserId
          WHERE bu.BookingId = @BookingId
        `);
      
      result.recordset[0].Users = usersResult.recordset;
    }

    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('GET Bookings Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  
  try {
    const { 
      tripId, 
      organizerId, 
      type, 
      providerName, 
      bookingRef, 
      startDate, 
      endDate,
      userIds = [] 
    } = await request.json();
    
    console.log('Attempting to create booking:', { 
      tripId, organizerId, type, providerName, bookingRef, startDate, endDate, userIds 
    });
    
    if (!tripId || !organizerId || !type) {
      return NextResponse.json({ 
        error: 'Trip ID, Organizer ID, and Type are required' 
      }, { status: 400 });
    }

    const validTypes = ['Hotel', 'Flight', 'Train', 'Other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: 'Type must be one of: Hotel, Flight, Train, Other' 
      }, { status: 400 });
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return NextResponse.json({ 
          error: 'Start date cannot be after end date' 
        }, { status: 400 });
      }
    }
    
    await transaction.begin();
    
    const tripCheck = await transaction.request()
      .input('TripId', sql.Int, parseInt(tripId))
      .query('SELECT TripId FROM Trips WHERE TripId = @TripId');
    
    if (tripCheck.recordset.length === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const organizerCheck = await transaction.request()
      .input('OrganizerId', sql.Int, parseInt(organizerId))
      .query('SELECT OrganizerId FROM Organizers WHERE OrganizerId = @OrganizerId');
    
    if (organizerCheck.recordset.length === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }
    
    const bookingResult = await transaction.request()
      .input('TripId', sql.Int, parseInt(tripId))
      .input('OrganizerId', sql.Int, parseInt(organizerId))
      .input('Type', sql.VarChar(50), type)
      .input('ProviderName', sql.VarChar(255), providerName || null)
      .input('BookingRef', sql.VarChar(100), bookingRef || null)
      .input('StartDate', sql.Date, startDate ? new Date(startDate) : null)
      .input('EndDate', sql.Date, endDate ? new Date(endDate) : null)
      .query(`
        INSERT INTO Bookings (TripId, OrganizerId, Type, Provider_Name, Booking_Ref, Start_Date, End_Date) 
        VALUES (@TripId, @OrganizerId, @Type, @ProviderName, @BookingRef, @StartDate, @EndDate);
        SELECT SCOPE_IDENTITY() as BookingId;
      `);
    
    const bookingId = bookingResult.recordset[0]?.BookingId;
    
    if (userIds && userIds.length > 0) {
      for (const userId of userIds) {
        const userCheck = await transaction.request()
          .input('UserId', sql.Int, parseInt(userId))
          .query('SELECT UserId FROM Users WHERE UserId = @UserId');
        
        if (userCheck.recordset.length === 0) {
          await transaction.rollback();
          return NextResponse.json({ 
            error: `User with ID ${userId} not found` 
          }, { status: 404 });
        }

        await transaction.request()
          .input('BookingId', sql.Int, bookingId)
          .input('UserId', sql.Int, parseInt(userId))
          .query('INSERT INTO BookingUsers (BookingId, UserId) VALUES (@BookingId, @UserId)');
      }
    }
    
    await transaction.commit();
    
    console.log('Booking created successfully:', { bookingId });
    
    return NextResponse.json({ 
      message: 'Booking created successfully',
      bookingId: bookingId 
    }, { status: 201 });
  } catch (err) {
    console.error('POST Booking Error:', err);
    
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  
  try {
    const { 
      id,
      tripId, 
      organizerId, 
      type, 
      providerName, 
      bookingRef, 
      startDate, 
      endDate,
      userIds = [] 
    } = await request.json();
    
    console.log('Attempting to update booking:', { 
      id, tripId, organizerId, type, providerName, bookingRef, startDate, endDate, userIds 
    });
    
    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    if (!tripId || !organizerId || !type) {
      return NextResponse.json({ 
        error: 'Trip ID, Organizer ID, and Type are required' 
      }, { status: 400 });
    }

    const validTypes = ['Hotel', 'Flight', 'Train', 'Other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: 'Type must be one of: Hotel, Flight, Train, Other' 
      }, { status: 400 });
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return NextResponse.json({ 
          error: 'Start date cannot be after end date' 
        }, { status: 400 });
      }
    }
    
    await transaction.begin();
    
    const bookingCheck = await transaction.request()
      .input('BookingId', sql.Int, parseInt(id))
      .query('SELECT BookingId FROM Bookings WHERE BookingId = @BookingId');
    
    if (bookingCheck.recordset.length === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const tripCheck = await transaction.request()
      .input('TripId', sql.Int, parseInt(tripId))
      .query('SELECT TripId FROM Trips WHERE TripId = @TripId');
    
    if (tripCheck.recordset.length === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const organizerCheck = await transaction.request()
      .input('OrganizerId', sql.Int, parseInt(organizerId))
      .query('SELECT OrganizerId FROM Organizers WHERE OrganizerId = @OrganizerId');
    
    if (organizerCheck.recordset.length === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }
    
    const result = await transaction.request()
      .input('BookingId', sql.Int, parseInt(id))
      .input('TripId', sql.Int, parseInt(tripId))
      .input('OrganizerId', sql.Int, parseInt(organizerId))
      .input('Type', sql.VarChar(50), type)
      .input('ProviderName', sql.VarChar(255), providerName || null)
      .input('BookingRef', sql.VarChar(100), bookingRef || null)
      .input('StartDate', sql.Date, startDate ? new Date(startDate) : null)
      .input('EndDate', sql.Date, endDate ? new Date(endDate) : null)
      .query(`
        UPDATE Bookings 
        SET TripId = @TripId,
            OrganizerId = @OrganizerId,
            Type = @Type, 
            Provider_Name = @ProviderName, 
            Booking_Ref = @BookingRef, 
            Start_Date = @StartDate, 
            End_Date = @EndDate 
        WHERE BookingId = @BookingId
      `);
    
    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    await transaction.request()
      .input('BookingId', sql.Int, parseInt(id))
      .query('DELETE FROM BookingUsers WHERE BookingId = @BookingId');
    
    if (userIds && userIds.length > 0) {
      for (const userId of userIds) {
        const userCheck = await transaction.request()
          .input('UserId', sql.Int, parseInt(userId))
          .query('SELECT UserId FROM Users WHERE UserId = @UserId');
        
        if (userCheck.recordset.length === 0) {
          await transaction.rollback();
          return NextResponse.json({ 
            error: `User with ID ${userId} not found` 
          }, { status: 404 });
        }

        await transaction.request()
          .input('BookingId', sql.Int, parseInt(id))
          .input('UserId', sql.Int, parseInt(userId))
          .query('INSERT INTO BookingUsers (BookingId, UserId) VALUES (@BookingId, @UserId)');
      }
    }
    
    await transaction.commit();
    
    console.log('Booking updated successfully:', { id, rowsAffected: result.rowsAffected[0] });
    
    return NextResponse.json({ message: 'Booking updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('PUT Booking Error:', err);
    
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('DELETE request received. SearchParams:', Object.fromEntries(searchParams.entries()));
    console.log('Extracted ID:', id);
    
    if (!id || id.trim() === '') {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    console.log('Attempting to delete booking with ID:', id);
    
    await transaction.begin();
    
    await transaction.request()
      .input('BookingId', sql.Int, parseInt(id))
      .query('DELETE FROM BookingUsers WHERE BookingId = @BookingId');
    
    const result = await transaction.request()
      .input('BookingId', sql.Int, parseInt(id))
      .query('DELETE FROM Bookings WHERE BookingId = @BookingId');
    
    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    await transaction.commit();
    
    console.log('Booking deleted successfully:', { id, rowsAffected: result.rowsAffected[0] });
    
    return NextResponse.json({ message: 'Booking deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('DELETE Booking Error:', err);
    
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}