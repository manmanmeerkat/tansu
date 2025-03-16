import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('GET /api/workers - Fetching workers');
    
    const workers = await prisma.worker.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    console.log(`Found ${workers.length} workers`);
    
    return NextResponse.json(workers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/workers - Request body:', body);
    
    if (!body.name) {
      console.log('Error: Name is required');
      return NextResponse.json({ error: '作業者名を入力してください' }, { status: 400 });
    }
    
    const worker = await prisma.worker.create({
      data: {
        name: body.name,
      },
    });
    
    console.log(`Worker created with ID: ${worker.id} and name: ${worker.name}`);
    
    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    console.error('Error creating worker:', error);
    return NextResponse.json({ error: '作業者の作成に失敗しました' }, { status: 500 });
  }
}