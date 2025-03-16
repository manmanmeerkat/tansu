// src/app/api/db-test/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();
    return NextResponse.json({ 
      success: true, 
      message: 'データベース接続成功',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}