# Kinna API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: multipart/form-data

Fields:
- username: string (required, 3-50 chars, alphanumeric + underscore)
- email: string (required, valid email)
- password: string (required, min 8 chars)
- name: string (required)
- age: integer (required, min 13)
- gender: string (optional)
- profile_picture: file (optional, image only)
- preferences: JSON array (genre/author preferences)

Response: { user, token }
```

#### Login
```http
POST /auth/login

Body:
{
  "login": "email or username",
  "password": "password"
}

Response: { user, token }
```

#### Check Username
```http
GET /auth/check-username/:username

Response: { available: boolean }
```

### Users

#### Get Profile
```http
GET /users/:username

Response: { user }
```

#### Update Profile
```http
PUT /users/profile
Authorization: Required
Content-Type: multipart/form-data

Fields:
- name: string
- bio: string
- age: integer
- gender: string
- profile_picture: file

Response: { user }
```

#### Follow User
```http
POST /users/:userId/follow
Authorization: Required

Response: { success: true, message }
```

#### Unfollow User
```http
DELETE /users/:userId/follow
Authorization: Required

Response: { success: true, message }
```

#### Get Followers
```http
GET /users/:userId/followers?page=1

Response: { followers, page, limit }
```

#### Get Following
```http
GET /users/:userId/following?page=1

Response: { following, page, limit }
```

#### Get Privacy Settings
```http
GET /users/settings/privacy
Authorization: Required

Response: { settings }
```

#### Update Privacy Settings
```http
PUT /users/settings/privacy
Authorization: Required

Body:
{
  "profile_visibility": "public|friends|private",
  "show_email": boolean,
  "show_age": boolean,
  "allow_messages": "everyone|following|none",
  "allow_tags": boolean,
  "show_activity": boolean
}

Response: { settings }
```

### Posts

#### Create Post
```http
POST /posts
Authorization: Required
Content-Type: multipart/form-data

Fields:
- title: string (optional)
- content: string (required)
- forum_id: UUID (optional)
- media: file[] (optional, up to 5 images)

Response: { post }
```

#### Get Feed
```http
GET /posts/feed?page=1
Authorization: Required

Response: { posts, page, limit }
```

#### Get Explore
```http
GET /posts/explore?page=1

Response: { posts, page, limit }
```

#### Get Post
```http
GET /posts/:postId

Response: { post }
```

#### Like Post
```http
POST /posts/:postId/like
Authorization: Required

Response: { success: true }
```

#### Unlike Post
```http
DELETE /posts/:postId/like
Authorization: Required

Response: { success: true }
```

#### Add Comment
```http
POST /posts/:postId/comments
Authorization: Required

Body:
{
  "content": "comment text",
  "parent_comment_id": "UUID" (optional)
}

Response: { comment }
```

#### Get Comments
```http
GET /posts/:postId/comments

Response: { comments }
```

#### Delete Post
```http
DELETE /posts/:postId
Authorization: Required

Response: { success: true }
```

### Forums

#### Create Forum
```http
POST /forums
Authorization: Required
Content-Type: multipart/form-data

Fields:
- name: string (required)
- description: string (required)
- book_id: UUID (optional)
- cover_image: file (optional)

Response: { forum }
```

#### Get All Forums
```http
GET /forums?page=1&search=query

Response: { forums, page, limit }
```

#### Get Forum
```http
GET /forums/:forumId

Response: { forum }
```

#### Join Forum
```http
POST /forums/:forumId/join
Authorization: Required

Response: { success: true }
```

#### Leave Forum
```http
POST /forums/:forumId/leave
Authorization: Required

Response: { success: true }
```

#### Get Forum Posts
```http
GET /forums/:forumId/posts?page=1

Response: { posts, page, limit }
```

#### Get Forum Members
```http
GET /forums/:forumId/members?page=1

Response: { members, page, limit }
```

#### Update Member Role
```http
PUT /forums/:forumId/members/:userId/role
Authorization: Required (moderator/owner only)

Body:
{
  "role": "member|moderator|owner"
}

Response: { success: true }
```

### Search

#### Universal Search
```http
GET /search?q=query&type=all&page=1

Types: all, users, posts, forums, books

Response: { results: { users, posts, forums, books }, query, page, limit }
```

#### Get Recommendations
```http
GET /search/recommendations

Response: { posts }
```

### Notifications

#### Get Notifications
```http
GET /notifications?page=1
Authorization: Required

Response: { notifications, page, limit }
```

#### Mark as Read
```http
PUT /notifications/:notificationId/read
Authorization: Required

Response: { success: true }
```

#### Mark All as Read
```http
PUT /notifications/read/all
Authorization: Required

Response: { success: true }
```

#### Get Unread Count
```http
GET /notifications/unread/count
Authorization: Required

Response: { count: number }
```

## Error Responses

All endpoints may return these error formats:

```json
{
  "error": {
    "message": "Error description"
  }
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (e.g., username taken)
- 500: Internal Server Error
