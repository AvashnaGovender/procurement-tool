import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic database connection
    await prisma.$connect()
    console.log('Database connected successfully')
    
    // Test if we can query users table
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    
    // Test if we can query the new tables
    try {
      const initiationCount = await prisma.supplierInitiation.count()
      console.log('Supplier initiation count:', initiationCount)
    } catch (error) {
      console.log('Supplier initiation table not found or accessible:', error)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({ 
      error: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}







