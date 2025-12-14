Write-Host "Starting NexusVPN Stack..."

# Start Backend
Write-Host "Starting Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev"

# Start Frontend
Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# Start Mobile
Write-Host "Starting Mobile..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mobile; npm start"

Write-Host "All services started!"
