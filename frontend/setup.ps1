# IoT SOC Dashboard - Frontend Setup Script (Windows PowerShell)
# This script installs all required dependencies and sets up the project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IoT SOC Dashboard - Frontend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the frontend directory." -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Installing base dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install base dependencies." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Installing core dependencies..." -ForegroundColor Yellow
npm install react-router-dom axios react-chartjs-2 chart.js chartjs-adapter-date-fns date-fns

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install core dependencies." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Installing dev dependencies..." -ForegroundColor Yellow
npm install -D tailwindcss @tailwindcss/vite

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dev dependencies." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Open: http://localhost:5173" -ForegroundColor White
Write-Host ""
