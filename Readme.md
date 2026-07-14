# VIDNDIA Backend

VIDNDIA is a backend-focused video-sharing platform inspired by modern media applications such as YouTube. It provides REST APIs for video publishing, authentication, user channels, subscriptions, likes, comments, playlists, watch history, tweets, and creator analytics.

The project focuses on building scalable backend workflows for media management and user engagement using Node.js, Express.js, MongoDB, and Cloudinary.

## Features

### Authentication and User Management

- User registration and login
- JWT-based authentication
- Short-lived access tokens and refresh token rotation
- HTTP-only refresh token cookies
- Automatic access token renewal
- Password change functionality
- Avatar and cover image management
- User profile and channel information

### Video Management

- Upload videos and thumbnails
- Large video uploads using Cloudinary chunked upload workflows
- Publish and unpublish videos
- Update video title, description, and thumbnail
- Delete videos and associated resources
- Video search using title and description
- Pagination and dynamic sorting
- View tracking
- User watch history

### Likes and Engagement

Users can toggle likes on:

- Videos
- Comments
- Tweets

Like state is stored using dedicated MongoDB documents and calculated dynamically.

### Subscription System

- Subscribe to channels
- Unsubscribe from channels
- Fetch channel subscribers
- Fetch channels subscribed to by a user
- Subscriber count tracking
- Prevention of self-subscription

### Comments

- Add comments to videos
- Fetch paginated video comments
- Update comments
- Delete comments
- Like comments

### Playlist Management

- Create playlists
- Update playlist information
- Delete playlists
- Add videos to playlists
- Remove videos from playlists
- Fetch user playlists
- Fetch playlist details

### Tweet System

VIDNDIA also provides a lightweight text-post system.

- Create tweets
- Update tweets
- Delete tweets
- Fetch user tweets
- Like and unlike tweets

### Creator Dashboard and Analytics

MongoDB aggregation pipelines are used to calculate channel statistics including:

- Total video views
- Total videos
- Total subscribers
- Total subscribed channels
- Total video likes
- Total tweet likes

Analytics are calculated using aggregation stages such as `$match`, `$lookup`, `$addFields`, `$group`, and `$project`.

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication

- JSON Web Tokens
- Access Tokens
- Refresh Tokens
- HTTP-only Cookies

### Media Storage

- Cloudinary
- Multer
- Chunked large-file video uploads

### Development

- JavaScript
- REST API architecture
- MongoDB Aggregation Pipelines

## Backend Architecture

The project follows a modular backend architecture.

```text
Backend/
│
├── src/
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   ├── subscription.controller.js
│   │   ├── playlist.controller.js
│   │   ├── tweet.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── subscription.model.js
│   │   ├── playlist.model.js
│   │   └── tweet.model.js
│   │
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   ├── subscription.routes.js
│   │   ├── playlist.routes.js
│   │   ├── tweet.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── middlewares/
│   │   ├── Auth.middleware.js
│   │   └── multer.middleware.js
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   │
│   └── app.js
│
└── package.json
```

## Authentication Flow

VIDNDIA uses an access-token and refresh-token authentication architecture.

1. The user logs in or registers.
2. The server generates an access token and refresh token.
3. The access token is returned to the client.
4. The refresh token is stored in an HTTP-only cookie.
5. Protected routes verify the access token using authentication middleware.
6. When the access token expires, the refresh-token endpoint generates a new access token.
7. Logout removes the stored refresh token and clears the cookie.

This approach limits direct JavaScript access to refresh tokens while supporting persistent authenticated sessions.

## Media Upload Workflow

Video uploads use Multer for temporary local file handling and Cloudinary for cloud media storage.

```text
Client
   |
   v
Multer Middleware
   |
   v
Temporary Local File
   |
   v
Cloudinary Chunked Upload
   |
   v
Cloud Media Storage
   |
   v
MongoDB Metadata
```

Large video files are uploaded using Cloudinary's chunked upload workflow instead of standard single-request uploads.

## API Modules

| Module | Functionality |
|---|---|
| Users | Authentication and profile management |
| Videos | Video upload and management |
| Comments | Video discussion system |
| Likes | Video, comment, and tweet likes |
| Subscriptions | Channel subscription system |
| Playlists | Video collection management |
| Tweets | Text-based posts |
| Dashboard | Creator analytics |
| History | User watch history |

## Environment Variables

Create a `.env` file in the backend directory.

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=your_access_token_expiry

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Do not commit the `.env` file to version control.

## Installation

Clone the repository.

```bash
git clone <repository-url>
```

Navigate to the backend directory.

```bash
cd Backend
```

Install dependencies.

```bash
npm install
```

Configure the environment variables.

Run the development server.

```bash
npm run dev
```

The API server will run on:

```text
http://localhost:8000
```

## Key Backend Concepts Implemented

- REST API design
- JWT authentication
- Access and refresh token workflows
- HTTP-only cookies
- Authentication middleware
- MongoDB data modelling
- MongoDB aggregation pipelines
- Pagination
- Dynamic filtering and sorting
- Cloud media storage
- Chunked video uploads
- Resource ownership authorization
- Cascading resource cleanup
- Centralized API responses
- Custom API error handling
- Async controller wrappers
- Modular MVC-style architecture

## Future Improvements

- Redis caching
- Rate limiting
- Video transcoding and adaptive streaming
- Background job queues
- Recommendation system
- Full-text search
- API documentation using Swagger/OpenAPI
- Automated integration testing
- Docker-based deployment

## Author

**Harsh Sankhla**

Backend Developer | MERN Stack | Data Structures and Algorithms

## License

This project is intended for educational and portfolio purposes.
