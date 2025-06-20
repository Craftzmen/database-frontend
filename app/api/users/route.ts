import { getConnection } from '../../../lib/db';
import sql from 'mssql';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Users');
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
    const { name, email } = await request.json();
    
    console.log('Attempting to insert user:', { name, email });
    
    await transaction.begin();
    
    const result = await transaction.request()
      .input('Name', sql.NVarChar(255), name)
      .input('Email', sql.NVarChar(255), email)
      .query('INSERT INTO Users (Name, Email) VALUES (@Name, @Email)');
    
    await transaction.commit();
    
    console.log('User inserted successfully:', result);
    
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
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
    const { id, name, email } = await request.json();
    
    console.log('Attempting to update user:', { id, name, email });
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }
    
    await transaction.begin();
    
    const result = await transaction.request()
      .input('UserId', sql.Int, parseInt(id))
      .input('Name', sql.NVarChar(255), name)
      .input('Email', sql.NVarChar(255), email)
      .query('UPDATE Users SET Name = @Name, Email = @Email WHERE UserId = @UserId');
    
    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    await transaction.commit();
    
    console.log('User updated successfully:', { id, rowsAffected: result.rowsAffected[0] });
    
    return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });
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
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log('Attempting to delete user with ID:', id);
    
    await transaction.begin();
    
    const result = await transaction.request()
      .input('UserId', sql.Int, parseInt(id))
      .query('DELETE FROM Users WHERE UserId = @UserId');
    
    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    await transaction.commit();
    
    console.log('User deleted successfully:', { id, rowsAffected: result.rowsAffected[0] });
    
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
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