// prisma/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('データベース接続を確認中...');
    
    // 接続テスト
    await prisma.$connect();
    console.log('データベースに接続しました！');
    
    // ダミーの作業者データ
    const dummyWorkers = [
      { name: '山田 太郎' },
      { name: '鈴木 一郎' },
      { name: '佐藤 次郎' },
      { name: '田中 三郎' },
      { name: '高橋 花子' }
    ];

    console.log('ダミー作業者データを追加中...');

    // 作業者データの挿入と作成された作業者のIDを保持
    const createdWorkerIds = [];
    
    for (const worker of dummyWorkers) {
      console.log(`作業者追加処理: ${worker.name}`);
      
      try {
        // すでに同じ名前の作業者が存在するかチェック
        const existingWorker = await prisma.worker.findFirst({
          where: {
            name: worker.name
          }
        });

        if (!existingWorker) {
          const newWorker = await prisma.worker.create({
            data: worker
          });
          console.log(`✅ 作業者を追加しました: ${worker.name} (ID: ${newWorker.id})`);
          createdWorkerIds.push(newWorker.id);
        } else {
          console.log(`⚠️ 作業者は既に存在します: ${worker.name} (ID: ${existingWorker.id})`);
          createdWorkerIds.push(existingWorker.id);
        }
      } catch (err) {
        console.error(`作業者 ${worker.name} の追加中にエラーが発生しました:`, err);
      }
    }
    
    // ダミーの日報データを作成（最初の作業者用）
    if (createdWorkerIds.length > 0) {
      const firstWorkerId = createdWorkerIds[0];
      console.log(`作業者ID: ${firstWorkerId} の日報を作成します`);
      
      // ダミーの日報データ
      const dummyReports = [
        {
          productCode: 'A-1001',
          boxType: 'B',
          currentFraction: 2,
          previousFraction: 1,
          totalFraction: 3,
          lotNumber: 'LOT-2023-001',
          workerId: firstWorkerId
        },
        {
          productCode: 'B-2002',
          boxType: 'C',
          currentFraction: 3,
          previousFraction: 1,
          totalFraction: 4,
          lotNumber: 'LOT-2023-002',
          workerId: firstWorkerId
        },
        {
          productCode: 'C-3003',
          boxType: 'G',
          currentFraction: 1,
          previousFraction: 2,
          totalFraction: 3,
          lotNumber: null,
          workerId: firstWorkerId
        }
      ];
      
      console.log('ダミー日報データを追加中...');
      
      for (const report of dummyReports) {
        try {
          await prisma.report.create({
            data: report
          });
          console.log(`✅ 日報を追加しました: ${report.productCode}`);
        } catch (err) {
          console.error(`日報 ${report.productCode} の追加中にエラーが発生しました:`, err);
        }
      }
    }
  } catch (error) {
    console.error('処理中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
    console.log('データベース接続を終了しました');
  }
}

main()
  .catch((e) => {
    console.error('シードデータの追加中にエラーが発生しました:', e);
    process.exit(1);
  });