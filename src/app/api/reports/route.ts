import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // requestパラメータを明示的に使用
    const url = request.url;
    const { searchParams } = new URL(url);
    const workerId = searchParams.get('workerId');

    console.log(`GET /api/reports - workerId: ${workerId}`);
    
    if (!workerId) {
      console.log('Error: workerId is required');
      return NextResponse.json({ error: '作業者IDが必要です' }, { status: 400 });
    }
    
    console.log(`Fetching reports for workerId: ${workerId}`);
    
    // データベース接続を確認
    await prisma.$connect();
    console.log('Database connection established');
    
    const reports = await prisma.report.findMany({
      where: {
        workerId: workerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        worker: true,
      },
    });
    
    console.log(`Found ${reports.length} reports`);
    
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: '日報の取得に失敗しました', details: error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/reports - Request body:', body);
    
    if (!body.productCode || !body.boxType || !body.workerId) {
      console.log('Error: Required fields are missing');
      return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 });
    }
    
    // 入力値を整数に変換して計算
    const currentFraction = parseInt(body.currentFraction) || 0;
    const previousFraction = parseInt(body.previousFraction) || 0;
    const totalFraction = currentFraction + previousFraction;
    const workingTimeSeconds = body.workingTimeSeconds || 0;
    
    console.log(`Creating report for workerId: ${body.workerId}`);
    console.log(`Product: ${body.productCode}, Box: ${body.boxType}`);
    console.log(`Current: ${currentFraction}, Previous: ${previousFraction}, Total: ${totalFraction}`);
    console.log(`Working time: ${workingTimeSeconds} seconds`);
    
    // データベース接続を確認
    await prisma.$connect();
    console.log('Database connection established');
    
    const report = await prisma.report.create({
      data: {
        productCode: body.productCode,
        boxType: body.boxType,
        currentFraction: currentFraction,
        previousFraction: previousFraction,
        totalFraction: totalFraction,
        lotNumber: body.lotNumber || null,
        workingTimeSeconds: workingTimeSeconds,
        workerId: body.workerId,
      },
    });
    
    console.log(`Report created with ID: ${report.id}`);
    
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: '日報の作成に失敗しました', details: error }, { status: 500 });
  }
}