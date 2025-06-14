import { getConnection } from '../../../lib/db';
import sql from 'mssql';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Organizers ORDER BY Created_At DESC');
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
    const { name, email, phone } = await request.json();
    
    console.log('Attempting to insert organizer:', { name, email, phone });
    
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }
    
    await transaction.begin();
    
    const result = await transaction.request()
      .input('Name', sql.VarChar(100), name)
      .input('Email', sql.VarChar(255), email)
      .input('Phone', sql.VarChar(20), phone || null)
      .query('INSERT INTO Organizers (Name, Email, Phone) VALUES (@Name, @Email, @Phone)');
    
    await transaction.commit();
    
    console.log('Organizer inserted successfully:', result);
    
    return NextResponse.json({ message: 'Organizer created successfully' }, { status: 201 });
  } catch (err) {
    console.error('POST Error:', err);
    
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    
    if (err instanceof Error && err.message.includes('UNIQUE KEY constraint')) {
      return NextResponse.json({ 
        error: 'Email already exists', 
        details: 'An organizer with this email address already exists' 
      }, { status: 409 });
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
    const { id, name, email, phone } = await request.json();
    
    console.log('Attempting to update organizer:', { id, name, email, phone });
    
    if (!id) {
      return NextResponse.json({ error: 'Organizer ID is required' }, { status: 400 });
    }
    
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }
    
    await transaction.begin();
    
    const result = await transaction.request()
      .input('OrganizerId', sql.Int, parseInt(id))
      .input('Name', sql.VarChar(100), name)
      .input('Email', sql.VarChar(255), email)
      .input('Phone', sql.VarChar(20), phone || null)
      .query('UPDATE Organizers SET Name = @Name, Email = @Email, Phone = @Phone WHERE OrganizerId = @OrganizerId');
    
    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }
    
    await transaction.commit();
    
    console.log('Organizer updated successfully:', { id, rowsAffected: result.rowsAffected[0] });
    
    return NextResponse.json({ message: 'Organizer updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('PUT Error:', err);
    
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    
    if (err instanceof Error && err.message.includes('UNIQUE KEY constraint')) {
      return NextResponse.json({ 
        error: 'Email already exists', 
        details: 'Another organizer with this email address already exists' 
      }, { status: 409 });
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
      return NextResponse.json({ error: 'Organizer ID is required' }, { status: 400 });
    }
    
    console.log('Attempting to delete organizer with ID:', id);
    
    await transaction.begin();
    
    const result = await transaction.request()
      .input('OrganizerId', sql.Int, parseInt(id))
      .query('DELETE FROM Organizers WHERE OrganizerId = @OrganizerId');
    
    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }
    
    await transaction.commit();
    
    console.log('Organizer deleted successfully:', { id, rowsAffected: result.rowsAffected[0] });
    
    return NextResponse.json({ message: 'Organizer deleted successfully' }, { status: 200 });
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