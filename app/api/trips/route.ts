import { getConnection } from '../../../lib/db';
import sql from 'mssql';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Trips ORDER BY Created_At DESC');
    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('GET Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  
  try {
    const { name, destination, startDate, endDate } = await request.json();
    
    console.log('Attempting to insert trip:', { name, destination, startDate, endDate });
    
    if (!name || !destination) {
      return NextResponse.json({ error: 'Name and Destination are required' }, { status: 400 });
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
      }
    }
    
    await transaction.begin();
    
    const result = await transaction.request()
      .input('Name', sql.VarChar(100), name)
      .input('Destination', sql.VarChar(255), destination)
      .input('StartDate', sql.Date, startDate ? new Date(startDate) : null)
      .input('EndDate', sql.Date, endDate ? new Date(endDate) : null)
      .query(`
        INSERT INTO Trips (Name, Destination, Start_Date, End_Date) 
        VALUES (@Name, @Destination, @StartDate, @EndDate);
        SELECT SCOPE_IDENTITY() as TripId;
      `);
    
    await transaction.commit();
    
    console.log('Trip inserted successfully:', result);
    
    return NextResponse.json({ 
      message: 'Trip created successfully',
      tripId: result.recordset[0]?.TripId 
    }, { status: 201 });
  } catch (err) {
    console.error('POST Error:', err);
    
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
    const { id, name, destination, startDate, endDate } = await request.json();
    
    console.log('Attempting to update trip:', { id, name, destination, startDate, endDate });
    
    if (!id) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }
    
    if (!name || !destination) {
      return NextResponse.json({ error: 'Name and Destination are required' }, { status: 400 });
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return NextResponse.json({ error: 'Start date cannot be after end date' }, { status: 400 });
      }
    }
    
    await transaction.begin();
    
    const result = await transaction.request()
      .input('TripId', sql.Int, parseInt(id))
      .input('Name', sql.VarChar(100), name)
      .input('Destination', sql.VarChar(255), destination)
      .input('StartDate', sql.Date, startDate ? new Date(startDate) : null)
      .input('EndDate', sql.Date, endDate ? new Date(endDate) : null)
      .query(`
        UPDATE Trips 
        SET Name = @Name, 
            Destination = @Destination, 
            Start_Date = @StartDate, 
            End_Date = @EndDate 
        WHERE TripId = @TripId
      `);
    
    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    await transaction.commit();
    
    console.log('Trip updated successfully:', { id, rowsAffected: result.rowsAffected[0] });
    
    return NextResponse.json({ message: 'Trip updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('PUT Error:', err);
    
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
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }
    
    console.log('Attempting to delete trip with ID:', id);
    
    await transaction.begin();
    
    const result = await transaction.request()
      .input('TripId', sql.Int, parseInt(id))
      .query('DELETE FROM Trips WHERE TripId = @TripId');
    
    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }
    
    await transaction.commit();
    
    console.log('Trip deleted successfully:', { id, rowsAffected: result.rowsAffected[0] });
    
    return NextResponse.json({ message: 'Trip deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('DELETE Error:', err);
    
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