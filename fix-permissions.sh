#!/bin/bash

echo "Windows環境の権限問題を修正しています..."

if [ -d ".next" ]; then
  echo ".nextディレクトリを削除しています..."
  rm -rf .next
  echo ".nextディレクトリを削除しました"
fi

echo "完了しました。"
echo "npm run dev または npm run setup を実行してアプリケーションを開始してください。"