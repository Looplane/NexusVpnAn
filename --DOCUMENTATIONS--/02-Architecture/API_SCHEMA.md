
# 🔌 NexusVPN API Schema

**Version:** v1
**Base URL:** `/api` or `http://localhost:3000` (Dev)

This document defines the contract between the React Frontend and NestJS Backend.

---

## 🔐 Auth

### Login
`POST /auth/login`
**Body:** `{ "email": "user@example.com", "password": "...", "code": "123456" (optional) }`
**Response:** `{ "access_token": "JWT...", "user": { ... }, "requires2fa": boolean }`

### Register
`POST /users/register`
**Body:** `{ "email": "...", "password": "...", "fullName": "...", "referralCode": "..." }`
**Response:** User Object (sans password)

### 2FA Setup
`POST /auth/2fa/generate`
**Response:** `{ "secret": "...", "qrCode": "data:image/png..." }`

`POST /auth/2fa/enable`
**Body:** `{ "code": "123456" }`

### Sessions & Security (NEW)
`GET /auth/sessions`
**Response:** `[{ "id": "...", "ipAddress": "...", "device": "...", "lastActive": "...", "isCurrent": boolean }]`

`DELETE /auth/sessions/:id`
**Response:** `{ "success": true }`

`GET /auth/history`
**Response:** `[{ "ip": "...", "location": "...", "timestamp": "...", "status": "success" }]`

---

## 🌍 VPN & Connectivity

### Get Locations
`GET /locations`
**Response:** `[{ "id": "us-east", "city": "New York", "ipv4": "...", "load": 45, "premium": false }]`

### Generate Config
`POST /vpn/config`
**Headers:** `Authorization: Bearer <token>`
**Body:** `{ "locationId": "us-east", "dns": "1.1.1.1" }`
**Response:** `{ "config": "[Interface]\n..." }`

### List Devices
`GET /vpn/devices`
**Response:** `[{ "id": "...", "name": "Device-US", "publicKey": "...", "assignedIp": "10.100.0.5" }]`

### Revoke Device
`DELETE /vpn/devices/:id`

---

## 🛡️ Admin & Infrastructure

### System Stats
`GET /admin/stats`
**Response:** `{ "users": { "total": 120 }, "tunnels": { "total": 45 }, "servers": [...] }`

### Add Server
`POST /admin/servers`
**Body:** `{ "name": "...", "ipv4": "...", "city": "...", "countryCode": "..." }`

### Get Setup Script
`GET /admin/servers/:id/setup-script`
**Response:** `{ "script": "#!/bin/bash..." }`

### Remote Command
`POST /admin/servers/:id/command`
**Body:** `{ "command": "uptime" }`
**Response:** `{ "output": " 14:00 up 10 days..." }`

### Marketing (NEW)
`GET /admin/coupons`
`POST /admin/coupons`
`DELETE /admin/coupons/:id`

---

## 👥 Users & Referrals (NEW)

### Stats
`GET /users/referrals`
**Response:** `{ "totalInvited": 5, "totalEarned": 5000, "referralCode": "XYZ123" }`

### Detailed List
`GET /users/referrals/list`
**Response:** `[{ "email": "j***@gmail.com", "createdAt": "...", "isActive": true }]`

---

## 🔔 Notifications

### List
`GET /notifications`
**Response:** `[{ "id": "...", "title": "Welcome", "message": "...", "isRead": false }]`

### Mark Read
`PATCH /notifications/:id/read`

---

## 💳 Billing

### Checkout
`POST /payments/checkout`
**Body:** `{ "plan": "pro" }`
**Response:** `{ "url": "https://stripe.com/checkout..." }`

### Portal
`POST /payments/portal`
**Response:** `{ "url": "https://billing.stripe.com..." }`
