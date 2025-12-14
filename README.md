# NexusVPN

NexusVPN is a self-hosted/hybrid VPN management dashboard utilizing WireGuard®. It aims to provide a "SaaS-in-a-box" experience.

## Project Structure

*   **Root**: React + Vite Frontend
*   **backend**: NestJS API
*   **mobile**: React Native (Expo) App

## Prerequisites

*   Node.js (v18+ recommended)
*   PostgreSQL (for the backend)

## Quick Start

1.  **Setup Environment**:
    *   The `backend/.env` file has been created with default local settings.
    *   Ensure you have a PostgreSQL database named `nexusvpn` running on `localhost:5432` with user `postgres` and password `postgres`. You can change these in `backend/.env`.

2.  **Install Dependencies**:
    *   Run `npm install` in the root directory.
    *   Run `npm install` in `backend/`.
    *   Run `npm install` in `mobile/`.
    *   *(Or just wait for the initial setup to complete if the agent is doing it)*

3.  **Run the Application**:
    *   Execute the startup script:
        ```powershell
        ./start-all.ps1
        ```
    *   This will open separate terminal windows for the Backend, Frontend, and Mobile app.

## Manual Startup

*   **Frontend**: `npm run dev` (http://localhost:5173)
*   **Backend**: `cd backend && npm run start:dev` (http://localhost:3000)
*   **Mobile**: `cd mobile && npm start`

## Documentation

See the `--DOCUMENTATIONS--` folder for detailed planning and architecture documents.
