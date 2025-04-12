# URL Shortener

A scalable URL shortening service built with Node.js, following the system design principles outlined in [Skilled Coder's X post](https://x.com/theskilledcoder/status/1910539344395317472). This project allows users to shorten long URLs into compact short codes and redirect users to the original URL when the short code is accessed. It includes caching for performance, persistent storage, and is designed with scalability in mind to handle millions of URLs.

## Features
- **URL Shortening**: Convert long URLs into short codes using a counter-based approach with base62 encoding.
- **Redirection**: Redirect users from a short code to the original URL.
- **Caching**: Uses Redis to cache frequently accessed URLs, reducing database load.
- **Persistence**: Stores URL mappings in MongoDB for reliable storage.
- **Scalability**: Implements caching and provides notes on sharding for massive scale.
- **Error Handling**: Gracefully handles failures (e.g., Redis connection issues) to ensure core functionality works.
- **API**: Provides RESTful endpoints for shortening and redirecting URLs.

## System Design Overview
This implementation is based on the system design provided by Skilled Coder on X, which outlines the following components:

### Core Workflow
1. **Shortening**:
   - A user submits a long URL via a `POST /shorten` request.
   - The system generates a unique short code using a counter-based approach.
   - The counter is encoded into a base62 string (`a-z`, `A-Z`, `0-9`) for compact representation.
   - The mapping (short code to long URL) is stored in MongoDB.
   - The mapping is cached in Redis for faster lookups.
2. **Redirection**:
   - A user accesses the short URL (e.g., `http://localhost:3000/a`).
   - The system checks Redis for the cached mapping.
   - If not in Redis, it retrieves the original URL from MongoDB and caches it.
   - The user is redirected to the original URL.
3. **Caching**:
   - Redis caches short code-to-URL mappings with a TTL of 1 hour to reduce database load.

### Scalability Considerations
- **Caching**: Redis reduces database load by caching frequently accessed URLs.
- **Sharding**: The design suggests sharding to handle massive scale (e.g., millions of URLs) by distributing short codes across multiple database shards.
- **Short Code Generation**:
  - **Counter-Based**: Ensures uniqueness but is predictable.
  - **Random (Not Implemented)**: Less predictable but risks collisions, requiring uniqueness checks.
- **Capacity**: With base62 encoding, a 5-character short code can represent 916,132,832 unique URLs (62^5), and a 6-character code can handle ~56.8 billion URLs.

### System Design Diagram
Below is a placeholder for the system design diagram (you can create one using tools like draw.io or Lucidchart and add it to the `assets/` folder):
![Image description](https://pbs.twimg.com/media/GoOZWQhWEAApKQe?format=jpg&name=large)

## Tech Stack
- **Node.js**: Backend runtime.
- **Express**: Web framework for building the API.
- **MongoDB**: Database for storing URL mappings.
- **Redis**: In-memory caching for performance.
- **Mongoose**: ODM for MongoDB.
- **Base62 Encoding**: Custom implementation for generating short codes.
- **dotenv**: For managing environment variables.

## Prerequisites
Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org) (v16.x or later recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or via a cloud service like MongoDB Atlas)
- [Redis](https://redis.io/download) (running locally or via a cloud service)
- [Git](https://git-scm.com/downloads) (for cloning the repository)
- [curl](https://curl.se/download.html) or [Postman](https://www.postman.com/downloads/) (for testing the API)

## Installation

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/ckabuya/url-shortener.git](https://github.com/ckabuya/url-shortener.git)
    cd url-shortener
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```
    This installs the required packages: express, mongoose, redis, dotenv, and nanoid.

3.  **Set Up Environment Variables**:
    Create a `.env` file in the project root and add the following:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/url-shortener
    REDIS_URL=redis://127.0.0.1:6379
    BASE_URL=http://localhost:3000
    ```
    * `PORT`: The port for the Express server.
    * `MONGO_URI`: Your MongoDB connection string.
    * `REDIS_URL`: Your Redis connection string.
    * `BASE_URL`: The base URL for shortened links (e.g., `http://yourdomain.com` in production).

4.  **Start MongoDB and Redis**:
    Ensure MongoDB and Redis are running on your system:

    **MongoDB**:
    * On Linux: `sudo systemctl start mongod`
    * On macOS: `brew services start mongodb-community`
    * On Windows: Run `mongod.exe` (if installed locally).
    * Or use [MongoDB Atlas](https://www.mongodb.com/atlas/database) for a cloud database.

    **Redis**:
    * On Linux: `sudo systemctl start redis-server`
    * On macOS: `brew services start redis`
    * On Windows: Run `redis-server.exe` (if using an unofficial Redis port).
    * **Test Redis**: `redis-cli ping` (should return `PONG`).

5.  **Run the Application**:
    ```bash
    node server.js
    ```
    The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Documentation

The API provides two main endpoints for shortening and redirecting URLs.

### 1. Shorten a URL

* **Endpoint**: `POST /shorten`
* **Description**: Shortens a long URL into a short code.
* **Request Body**:
    ```json
    {
      "originalUrl": "[https://www.example.com](https://www.example.com)"
    }
    ```
* **Response**:
    * **Status**: `200 OK`
    * **Body**:
        ```json
        {
          "shortUrl": "http://localhost:3000/a"
        }
        ```
    * **Error** (e.g., invalid URL):
        * **Status**: `400 Bad Request`
        * **Body**:
            ```json
            {
              "error": "Invalid URL"
            }
            ```
* **Example**:
    ```bash
    curl -X POST http://localhost:3000/shorten -H "Content-Type: application/json" -d '{"originalUrl": "[https://www.example.com](https://www.example.com)"}'
    ```

### 2. Redirect to Original URL

* **Endpoint**: `GET /:shortCode`
* **Description**: Redirects the user to the original URL associated with the short code.
* **Response**:
    * **Status**: `302 Found` (redirects to the original URL)
    * **Error** (e.g., short code not found):
        * **Status**: `404 Not Found`
        * **Body**:
            ```json
            {
              "error": "URL not found"
            }
            ```
* **Example**:
    Open in a browser: `http://localhost:3000/a`
    Redirects to: `https://www.example.com`

## Usage

### Shorten a URL

Send a `POST` request to `/shorten` with the long URL:

```bash
curl -X POST http://localhost:3000/shorten -H "Content-Type: application/json" -d '{"originalUrl": "[https://www.example.com](https://www.example.com)"}'
```

**Response**:

```json
{
  "shortUrl": "http://localhost:3000/a"
}
```

### Access the Shortened URL

Open the short URL in a browser:

`http://localhost:3000/a`

This will redirect you to `https://www.example.com`.

## Testing

To test the application, you can use `curl`, Postman, or write automated tests.

### Manual Testing

**Shorten a URL**:

```bash
curl -X POST http://localhost:3000/shorten -H "Content-Type: application/json" -d '{"originalUrl": "[https://www.example.com](https://www.example.com)"}'
```

Verify the response contains a short URL (e.g., `http://localhost:3000/a`).

**Access the Short URL**:

Open the short URL in a browser or use `curl`:

```bash
curl -L http://localhost:3000/a
```

The `-L` flag follows redirects. You should see the content of `https://www.example.com`.

**Test Invalid URL**:

```bash
curl -X POST http://localhost:3000/shorten -H "Content-Type: application/json" -d '{"originalUrl": "invalid-url"}'
```

Should return a `400` error with `{"error": "Invalid URL"}`.

**Test Non-Existent Short Code**:

```bash
curl http://localhost:3000/nonexistent
```

Should return a `404` error with `{"error": "URL not found"}`.

### Automated Testing (Future Work)

Automated tests are not yet implemented but can be added using a testing framework like Mocha or Jest. Example test cases:

* Test successful URL shortening.
* Test redirection with a valid short code.
* Test error handling for invalid URLs.
* Test Redis caching behavior.

## Project Structure

```
url-shortener/
├── assets/             # Static assets (e.g., system design diagram)
│   └── system-design.png
├── config/
│   └── db.js           # MongoDB and Redis connection setup
├── models/
│   └── Url.js          # MongoDB schema for URL mappings
├── routes/
│   └── url.js          # API routes for shortening and redirecting
├── .env                # Environment variables
├── .gitignore          # Git ignore file (ignores node_modules/)
├── LICENSE             # License file (MIT License)
├── package.json        # Project dependencies and scripts
├── README.md           # Project documentation
└── server.js           # Main server file
```

## Scalability Notes

This implementation includes basic scalability features:

* **Caching**: Redis caches URL mappings to reduce database load, with a TTL of 1 hour.
* **Counter-Based Short Codes**: Ensures uniqueness without collision risks, using base62 encoding.
    * A 5-character short code can handle 916,132,832 URLs (62^5).
    * A 6-character short code can handle \~56.8 billion URLs (62^6).

### Future Improvements:

* **Sharding**: Distribute short codes across multiple database shards for massive scale (e.g., shard by counter ranges).
* **Minimum Length**: Enforce a minimum short code length (e.g., 5 characters) for better security and readability.
* **Custom Short Codes**: Allow users to specify custom short codes (requires uniqueness checks).
* **Rate Limiting**: Prevent abuse by limiting the number of requests per user.

## Limitations and Future Work

* **Predictability**: Counter-based short codes are predictable (e.g., a, b, c, ...), which could be a security concern.
* **Minimum Length**: Short codes can be as short as 1 character (e.g., a), which might be too short for production use.
* **Authentication**: No user authentication; could be added for private URL shortening.
* **Analytics**: Does not track click statistics (e.g., number of redirects, user locations).
* **Custom Short Codes**: Not implemented but could be added with a uniqueness check.
* **Redis Dependency**: If Redis is unavailable, the app falls back to database lookups, which may impact performance.
* **Testing**: Automated tests are not yet implemented.

## Troubleshooting

### Redis Connection Error (ECONNREFUSED):

* Ensure Redis is running: `redis-cli ping` should return `PONG`.
* Check your `.env` file: `REDIS_URL` should match your Redis host/port.
* **Start Redis**:
    * Linux: `sudo systemctl start redis-server`
    * macOS: `brew services start redis`
    * Windows: Run `redis-server.exe`

### MongoDB Connection Error:

* Ensure MongoDB is running: `mongo` should connect to your database.
* Check your `.env` file: `MONGO_URI` should match your MongoDB connection string.

### Short Code Length:

The current implementation allows 1-character short codes. To enforce a minimum length, modify the `base62` function in `routes/url.js`.

## Contributing

Contributions are welcome! To contribute:

1.  Fork the repository.
2.  Create a new branch: `git checkout -b feature/your-feature`.
3.  Make your changes and commit: `git commit -m "Add your feature"`.
4.  Push to your branch: `git push origin feature/your-feature`.
5.  Open a pull request.

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). See the `LICENSE` file for details.

## Acknowledgments

* System design inspired by Skilled Coder's X post.
* Thanks to the open-source community for tools like Node.js, Express, MongoDB, and Redis.
* Base62 encoding implementation adapted from common practices in URL shortening services.
