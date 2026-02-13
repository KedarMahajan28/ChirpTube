# ChirpTube 🎬

A full-featured YouTube-like REST API backend built with Node.js, Express, and MongoDB. ChirpTube supports video uploads, user channels, subscriptions, playlists, comments, likes, and even a Twitter-like tweet feature — all backed by JWT authentication and Cloudinary media storage.

---

## Features

- **User Accounts** — Register with avatar and cover image, login, update profile details, and view watch history
- **Videos** — Upload, update, delete, and toggle publish status; browse all videos with pagination
- **Playlists** — Create and manage personal playlists, add/remove videos
- **Comments** — Comment on videos, edit and delete your own comments
- **Likes** — Toggle likes on videos, comments, and tweets; view all liked videos
- **Subscriptions** — Subscribe/unsubscribe from channels, view your subscriptions and subscriber counts
- **Tweets** — Post short-form text content (tweets) tied to your channel
- **JWT Auth** — Access tokens + refresh tokens with secure cookie handling
- **Cloudinary Integration** — Avatar, cover image, video, and thumbnail uploads via Cloudinary
- **Aggregation & Pagination** — Efficient MongoDB aggregation pipelines with `mongoose-aggregate-paginate-v2`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express v5 |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (JWT) |
| File Uploads | Multer + Cloudinary |
| Password Hashing | bcrypt |
| Dev Server | Nodemon |

---

## Project Structure

```
src/
├── controllers/        # Route handler logic
│   ├── user.controller.js
│   ├── video.controller.js
│   ├── comment.controller.js
│   ├── like.controller.js
│   ├── playlist.controller.js
│   ├── subscriptions.controller.js
│   └── tweet.controller.js
├── models/             # Mongoose schemas
│   ├── user.model.js
│   ├── video.model.js
│   ├── comment.model.js
│   ├── like.model.js
│   ├── playlist.model.js
│   ├── subscription.model.js
│   └── tweet.model.js
├── routes/             # Express routers
├── middlewares/
│   ├── auth.middleware.js    # JWT verification
│   └── multer.middleware.js  # File upload handling
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   └── cloudinary.js        # Upload & delete helpers
├── db/
│   └── index.js             # MongoDB connection
├── constants.js
└── app.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local instance or MongoDB Atlas URI)
- A [Cloudinary](https://cloudinary.com/) account

### Installation

```bash
git clone https://github.com/your-username/ChirpTube.git
cd ChirpTube
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following:

```env
PORT=8000
MONGODB_URL=mongodb://localhost:27017
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Running the Server

```bash
# Development (with auto-reload)
npm run dev
```

The server will start on `http://localhost:8000` (or the port set in `.env`).

---

## API Reference

All routes are prefixed with `/api/v1`. Routes marked with 🔒 require a valid JWT access token via cookie or `Authorization: Bearer <token>` header.

### Users — `/api/v1/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register with avatar & cover image |
| POST | `/login` | — | Login and receive tokens |
| POST | `/refresh-token` | — | Refresh access token |
| POST | `/logout` | 🔒 | Logout current user |
| POST | `/change-password` | 🔒 | Update password |
| GET | `/me` | 🔒 | Get current user profile |
| PATCH | `/update-account` | 🔒 | Update name/email |
| PATCH | `/update-avatar` | 🔒 | Upload new avatar |
| PATCH | `/update-coverImage` | 🔒 | Upload new cover image |
| GET | `/c/:channel` | 🔒 | Get channel profile |
| GET | `/history` | 🔒 | Get watch history |

### Videos — `/api/v1/videos`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/getvideos` | — | Get all videos (paginated) |
| GET | `/getvideobyid/:id` | — | Get a single video |
| POST | `/uploadvideo` | 🔒 | Upload video + thumbnail |
| PATCH | `/updatevideo/:videoId` | 🔒 | Update title/description/thumbnail |
| DELETE | `/deletevideo/:videoId` | 🔒 | Delete a video |
| PATCH | `/toggle-status/:videoId` | 🔒 | Toggle published/unpublished |

### Playlists — `/api/v1/playlists`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/myplaylists` | 🔒 | Get user's playlists |
| POST | `/create` | 🔒 | Create a playlist |
| PATCH | `/add-video` | 🔒 | Add video to playlist |
| PATCH | `/remove-video` | 🔒 | Remove video from playlist |
| GET | `/:playlistId` | 🔒 | Get playlist by ID |
| PATCH | `/:playlistId` | 🔒 | Update playlist details |
| DELETE | `/:playlistId` | 🔒 | Delete a playlist |

### Comments — `/api/v1/comments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/video/:videoId` | — | Get all comments on a video |
| POST | `/video/:videoId` | 🔒 | Add a comment |
| PATCH | `/:commentId` | 🔒 | Update a comment |
| DELETE | `/:commentId` | 🔒 | Delete a comment |

### Likes — `/api/v1/likes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PATCH | `/video/:videoId` | 🔒 | Toggle like on a video |
| PATCH | `/comment/:commentId` | 🔒 | Toggle like on a comment |
| PATCH | `/tweet/:tweetId` | 🔒 | Toggle like on a tweet |
| GET | `/videos` | 🔒 | Get all liked videos |

### Subscriptions — `/api/v1/subscribes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/me` | 🔒 | Get channels you subscribe to |
| GET | `/channel/:channelId` | — | Get subscribers of a channel |
| PATCH | `/:channelId` | 🔒 | Toggle subscribe/unsubscribe |

### Tweets — `/api/v1/tweets`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | 🔒 | Create a tweet |
| GET | `/me` | 🔒 | Get your tweets |
| PATCH | `/:tweetId` | 🔒 | Update a tweet |
| DELETE | `/:tweetId` | 🔒 | Delete a tweet |

---

## Author

**Kedar Mahajan**

---

## License

ISC
