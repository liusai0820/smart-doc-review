#!/bin/bash

# 创建新目录
mkdir -p src/components/batch-review
mkdir -p src/components/dashboard
mkdir -p src/components/dialogs
mkdir -p src/components/ui

# 创建新文件
touch src/components/batch-review/BatchReview.tsx
touch src/components/dashboard/ReviewDashboard.tsx
touch src/components/dialogs/TemplateSelectionDialog.tsx
touch src/components/document-viewer/ChangesComparisonView.tsx
touch src/components/ui/ExportButton.tsx
touch src/components/ui/checkbox.tsx
touch src/components/ui/dropdown-menu.tsx
touch src/components/ui/label.tsx
touch src/components/ui/radio-group.tsx
touch src/lib/document-export.ts
touch src/lib/review-templates.ts

echo "所有目录和文件创建完成！"