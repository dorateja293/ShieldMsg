# SentinelChat API

Base URL: `/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## Users And Friends

- `GET /users`
- `GET /users/:id`
- `PATCH /users/me/profile`
- `POST /friends/:userId/request`
- `PATCH /friends/requests/:id`
- `DELETE /friends/:userId`
- `GET /friends/requests`

## Messaging

- `POST /messages`
- `GET /messages/conversation/:userId`
- `GET /messages/group/:groupId`
- `PATCH /messages/conversation/:userId/read`

`POST /messages` accepts multipart form data:

- `receiverId`
- `groupId`
- `messageText`
- `file`

## Uploads

- `POST /uploads`

Uploads are validated with Multer and scanned before download links are returned.

## Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`

## Admin

- `GET /admin/security`

Requires an authenticated user with `role: "admin"`.

## Socket Events

Client emits:

- `message:send`
- `typing:start`
- `typing:stop`

Server emits:

- `message:receive`
- `typing:start`
- `typing:stop`
- `presence:update`
