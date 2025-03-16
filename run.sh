#!/bin/bash

# 端数合わせ作業日報アプリケーション実行スクリプト

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 関数: 成功メッセージ
success() {
    echo -e "${GREEN}$1${NC}"
}

# 関数: 警告メッセージ
warning() {
    echo -e "${YELLOW}$1${NC}"
}

# 関数: エラーメッセージ
error() {
    echo -e "${RED}$1${NC}"
}

# カレントディレクトリをチェック
if [ ! -f "package.json" ]; then
    error "Error: package.jsonが見つかりません。"
    warning "このスクリプトはプロジェクトのルートディレクトリで実行してください。"
    exit 1
fi

# 環境変数ファイルのチェック
if [ ! -f ".env" ]; then
    error "Error: .envファイルが見つかりません。"
    warning "Supabaseの設定に従って.envファイルを作成してください。"
    exit 1
fi

# 依存関係のインストール
echo "依存関係をインストールしています..."
npm install

if [ $? -ne 0 ]; then
    error "依存関係のインストールに失敗しました。"
    exit 1
fi
success "依存関係のインストールが完了しました。"

# データベースのマイグレーションとシードデータ投入
echo "データベースをセットアップしています..."
npm run db:push

if [ $? -ne 0 ]; then
    error "データベースのセットアップに失敗しました。"
    warning ".envファイルのDATABASE_URLが正しく設定されているか確認してください。"
    exit 1
fi
success "データベースのセットアップが完了しました。"

echo "ダミーデータを追加しています..."
npm run db:seed

if [ $? -ne 0 ]; then
    warning "ダミーデータの追加に失敗しましたが、続行します。"
else
    success "ダミーデータの追加が完了しました。"
fi

# アプリケーションの起動
echo "アプリケーションを起動しています..."
success "アプリケーションは http://localhost:3000 で実行されます。"
warning "終了するには Ctrl+C を押してください。"
npm run dev