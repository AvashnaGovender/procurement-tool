import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const { prisma } = await import('@/lib/prisma');
    
    // Simple database test
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'NextAuth API is working',
      database: 'Connected',
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('NextAuth test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}






