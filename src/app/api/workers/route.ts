import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
      console.log('GET /api/workers - Fetching workers');
      
      await prisma.$connect();
      console.log('Database connection successful');
      
      const workers = await prisma.worker.findMany({
        orderBy: { name: 'asc' },
      });
      
      console.log(`Found ${workers.length} workers`);
      return NextResponse.json(workers);
    } catch (error) {
      console.error('Error fetching workers:', error);
      // より詳細なエラー情報を返す
      return NextResponse.json({ 
        error: 'Failed to fetch workers', 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }