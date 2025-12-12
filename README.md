# Customs Connect API 🚢

## Overview
Customs Connect API is a robust backend solution built with **TypeScript**, **Node.js**, and **Express.js**, leveraging **Mongoose** for MongoDB interactions. It facilitates real-time shipment tracking, communication, document management, and integrates with payment gateways and AI-driven compliance checks to streamline customs clearance processes.

## Features
-   **Shipment Lifecycle Management**: 📦 Full CRUD operations for shipments, including associated items and documents, tracking various stages from draft to clearance.
-   **Secure Authentication & Authorization**: 🔐 User registration and login utilizing JWT for secure access to API resources.
-   **Real-time Communication**: 💬 Integrated Socket.io for instant messaging, status updates, and notifications within shipment contexts, powered by Redis for scalability.
-   **Document Handling**: 📄 Secure upload and retrieval of critical customs documents to and from AWS S3, linked directly to shipments.
-   **Payment Gateway Integration**: 💳 Seamless integration with Paystack for initiating and verifying payments, such as import duties.
-   **AI Compliance Pre-checks (Mock)**: 🤖 Automated analysis of shipment data for potential compliance issues, providing proactive alerts and insights.
-   **Blockchain Anchoring (Mock)**: 🔗 Immutable record-keeping for key shipment data using Merkle trees, ensuring data integrity and verifiability.
-   **Comprehensive Audit Logging**: 📝 Detailed logs of all significant actions, enhancing transparency and accountability.
-   **Dynamic Dashboard Statistics**: 📊 Aggregated real-time metrics and insights on shipment statuses, compliance scores, and financial data for quick overview.

## Getting Started
To get this project up and running on your local machine, follow these steps.

### Installation
🚀 Clone the repository and install the dependencies:

```bash
git clone https://github.com/shemigam1/customs-connect-server.git
cd customs-connect-server
npm install
```

### Environment Variables
⚙️ Create a `.env` file in the project root based on the `.env.example` file and populate it with your specific configurations.

| Variable Name           | Example Value                                       | Description                                     |
| :---------------------- | :-------------------------------------------------- | :---------------------------------------------- |
| `PORT`                  | `3000`                                              | Port the Express server will listen on.         |
| `FRONTEND_URL`          | `http://localhost:5173`                             | URL of the frontend application for CORS.       |
| `DATABASE_URL`          | `mongodb://localhost:27017/customs-connect`         | MongoDB connection string.                      |
| `JWT_SECRET`            | `your_jwt_secret_key_change_in_production`        | Secret key for signing and verifying JWTs.      |
| `PAYSTACK_SECRET_KEY`   | `sk_test_...`                                     | Your Paystack secret key for API calls.         |
| `PAYSTACK_URL`          | `https://api.paystack.co`                           | Base URL for the Paystack API.                  |
| `AWS_ACCESS_KEY_ID`     | `AKIA...`                                         | AWS Access Key ID for S3 bucket access.         |
| `AWS_SECRET_ACCESS_KEY` | `secret...`                                       | AWS Secret Access Key for S3 bucket access.     |
| `AWS_REGION`            | `us-east-1`                                         | AWS region where your S3 bucket is located.     |
| `S3_BUCKET`             | `customs-connect-uploads`                           | Name of the S3 bucket for file uploads.         |
| `REDIS_URL`             | `redis://localhost:6379`                            | URL for Redis server (optional, for Socket.io adapter). |

## Usage
Once the server is running, you can interact with the API using a tool like Postman, Insomnia, or by integrating with a frontend application.

To start the development server:
```bash
npm run dev
```
The API documentation will be available at `http://localhost:3000/docs`.

## API Documentation

### Base URL
`http://localhost:[PORT]` (e.g., `http://localhost:3000`)

### Endpoints

#### GET /health
Responds if the application is up and running.

**Request**:
No payload.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2023-10-27T10:00:00.000Z"
}
```

**Errors**:
-   `500 Internal Server Error`: Generic server error.

#### POST /auth/login
Authenticates a user and returns a JWT token.

**Request**:
```json
{
  "email": "jane.doe@example.com",
  "password": "stringPassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "login successful",
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "651a029c3d4e5f6g7h8i9j0k",
      "email": "jane.doe@example.com",
      "name": "Jane Doe"
    }
  }
}
```

**Errors**:
-   `400 Bad Request`: Invalid email or password.
-   `422 Unprocessable Entity`: Token generation failed.
-   `500 Internal Server Error`: Something went wrong on the server.

#### POST /auth/signup
Registers a new user account.

**Request**:
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "stringPassword123",
  "phoneNumber": "+1234567890",
  "role": "admin",
  "orgId": "org-123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "signup successful",
  "code": 201,
  "data": {
    "_id": "651a029c3d4e5f6g7h8i9j0k",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phoneNumber": "+1234567890",
    "role": "admin",
    "orgId": "org-123",
    "createdAt": "2023-10-27T10:00:00.000Z",
    "updatedAt": "2023-10-27T10:00:00.000Z"
  }
}
```

**Errors**:
-   `400 Bad Request`: Missing required fields or user already exists.
-   `500 Internal Server Error`: Something went wrong on the server.

#### POST /payments/init
Initializes a Paystack transaction.

**Request**:
```json
{
  "email": "jane.doe@example.com",
  "amount": 1000
}
```

**Response**:
```json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "reference": "T1234567890"
  }
}
```

**Errors**:
-   `400 Bad Request`: Invalid amount (must be 1000 NGN).
-   `500 Internal Server Error`: Failed to initialize transaction.

#### POST /payments/verify
Verifies a Paystack transaction reference.

**Request**:
```json
{
  "reference": "T1234567890"
}
```

**Response**:
```json
{
  "status": true,
  "message": "Verification successful",
  "data": {
    "status": "success",
    "reference": "T1234567890",
    "amount": 100000,
    "currency": "NGN",
    "channel": "card",
    "gateway_response": "Successful"
  }
}
```

**Errors**:
-   `400 Bad Request`: Invalid transaction or missing reference.
-   `500 Internal Server Error`: Failed to verify transaction.

#### POST /shipments
Creates a new shipment. Requires authentication.

**Request**:
```json
{
  "bl_number": "BL-0012345",
  "form_m_no": "FORM-M-9876",
  "containers": ["CONT-001", "CONT-002"],
  "origin_country": "China",
  "destination_port": "Lagos",
  "items": [
    {
      "name": "Electronics Components",
      "quantity": 500,
      "weight": 250.5,
      "description": "Assorted electronic parts for assembly"
    },
    {
      "name": "Textile Fabrics",
      "quantity": 1000,
      "weight": 150.0,
      "description": "Various textile materials"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "shipment created",
  "code": 201,
  "data": {
    "bl_number": "BL-0012345",
    "form_m_no": "FORM-M-9876",
    "containers": ["CONT-001", "CONT-002"],
    "origin_country": "China",
    "destination_port": "Lagos",
    "items": [
      "651a029c3d4e5f6g7h8i9j0k",
      "651a029c3d4e5f6g7h8i9j0l"
    ],
    "status": "DRAFT",
    "_id": "651a029c3d4e5f6g7h8i9j0m",
    "createdAt": "2023-10-27T10:00:00.000Z",
    "updatedAt": "2023-10-27T10:00:00.000Z",
    "__v": 0
  }
}
```

**Errors**:
-   `400 Bad Request`: Shipment must contain at least one item.
-   `401 Unauthorized`: Missing or invalid authentication token.
-   `500 Internal Server Error`: Failed to create shipment.

#### GET /shipments/{id}
Retrieves details for a specific shipment. Requires authentication.

**Request**:
No payload.
`id`: Shipment ID (e.g., `651a029c3d4e5f6g7h8i9j0m`)

**Response**:
```json
{
  "success": true,
  "message": "shipment retrieved",
  "code": 200,
  "data": {
    "_id": "651a029c3d4e5f6g7h8i9j0m",
    "bl_number": "BL-0012345",
    "form_m_no": "FORM-M-9876",
    "containers": ["CONT-001", "CONT-002"],
    "origin_country": "China",
    "destination_port": "Lagos",
    "status": "DRAFT",
    "items": [
      {
        "_id": "651a029c3d4e5f6g7h8i9j0k",
        "shipmentId": "651a029c3d4e5f6g7h8i9j0m",
        "name": "Electronics Components",
        "quantity": 500,
        "weight": 250.5,
        "description": "Assorted electronic parts for assembly",
        "__v": 0
      }
    ],
    "createdAt": "2023-10-27T10:00:00.000Z",
    "updatedAt": "2023-10-27T10:00:00.000Z"
  }
}
```

**Errors**:
-   `404 Not Found`: Shipment not found.
-   `401 Unauthorized`: Missing or invalid authentication token.
-   `500 Internal Server Error`: Failed to retrieve shipment.

#### PUT /shipments/{id}/assign
Assigns officers to a specific shipment. Requires authentication.

**Request**:
`id`: Shipment ID (e.g., `651a029c3d4e5f6g7h8i9j0m`)
```json
{
  "officerIds": ["651a029c3d4e5f6g7h8i9j0p", "651a029c3d4e5f6g7h8i9j0q"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "officers assigned",
  "code": 200,
  "data": {
    "_id": "651a029c3d4e5f6g7h8i9j0m",
    "bl_number": "BL-0012345",
    "officersAssigned": [
      "651a029c3d4e5f6g7h8i9j0p",
      "651a029c3d4e5f6g7h8i9j0q"
    ],
    "status": "DRAFT",
    "createdAt": "2023-10-27T10:00:00.000Z",
    "updatedAt": "2023-10-27T10:05:00.000Z"
  }
}
```

**Errors**:
-   `400 Bad Request`: Officer IDs array is required and must not be empty.
-   `404 Not Found`: Shipment not found.
-   `401 Unauthorized`: Missing or invalid authentication token.
-   `500 Internal Server Error`: Failed to assign officers.

#### POST /shipments/{id}/documents
Uploads a document for a shipment. Requires authentication.

**Request**:
`id`: Shipment ID (e.g., `651a029c3d4e5f6g7h8i9j0m`)
```json
{
  "documentType": "proforma_invoice",
  "documentUrl": "https://s3.aws.com/customs-connect/doc-123.pdf"
}
```

**Response**:
```json
{
  "success": true,
  "message": "shipment document created",
  "code": 201,
  "data": {
    "shipmentId": "651a029c3d4e5f6g7h8i9j0m",
    "userId": "651a029c3d4e5f6g7h8i9j0p",
    "documentType": "proforma_invoice",
    "documentUrl": "https://s3.aws.com/customs-connect/doc-123.pdf",
    "uploadedAt": "2023-10-27T10:00:00.000Z",
    "status": "pending",
    "_id": "651a029c3d4e5f6g7h8i9j0r",
    "__v": 0
  }
}
```

**Errors**:
-   `400 Bad Request`: Document type and URL are required, or invalid document type.
-   `404 Not Found`: Shipment not found.
-   `401 Unauthorized`: Missing or invalid authentication token.
-   `500 Internal Server Error`: Failed to create shipment document.

#### GET /shipments/{id}/documents/{docId}
Retrieves a specific document for a shipment. Requires authentication.

**Request**:
No payload.
`id`: Shipment ID (e.g., `651a029c3d4e5f6g7h8i9j0m`)
`docId`: Document ID (e.g., `651a029c3d4e5f6g7h8i9j0r`)

**Response**:
```json
{
  "success": true,
  "message": "document retrieved",
  "code": 200,
  "data": {
    "_id": "651a029c3d4e5f6g7h8i9j0r",
    "shipmentId": "651a029c3d4e5f6g7h8i9j0m",
    "userId": {
      "_id": "651a029c3d4e5f6g7h8i9j0p",
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    },
    "documentType": "proforma_invoice",
    "documentUrl": "https://s3.aws.com/customs-connect/doc-123.pdf",
    "uploadedAt": "2023-10-27T10:00:00.000Z",
    "status": "pending",
    "__v": 0
  }
}
```

**Errors**:
-   `403 Forbidden`: Document does not belong to this shipment.
-   `404 Not Found`: Shipment or document not found.
-   `401 Unauthorized`: Missing or invalid authentication token.
-   `500 Internal Server Error`: Failed to retrieve document.

#### GET /shipments/{id}/documents
Lists all documents associated with a specific shipment. Requires authentication.

**Request**:
No payload.
`id`: Shipment ID (e.g., `651a029c3d4e5f6g7h8i9j0m`)

**Response**:
```json
{
  "success": true,
  "message": "documents retrieved",
  "code": 200,
  "data": [
    {
      "_id": "651a029c3d4e5f6g7h8i9j0r",
      "shipmentId": "651a029c3d4e5f6g7h8i9j0m",
      "userId": {
        "_id": "651a029c3d4e5f6g7h8i9j0p",
        "name": "Jane Doe"
      },
      "documentType": "proforma_invoice",
      "documentUrl": "https://s3.aws.com/customs-connect/doc-123.pdf",
      "uploadedAt": "2023-10-27T10:00:00.000Z",
      "status": "pending",
      "__v": 0
    }
  ]
}
```

**Errors**:
-   `500 Internal Server Error`: Failed to retrieve documents.

#### GET /shipments/{id}/anchor
Retrieves the latest blockchain anchor verification details for a shipment. Requires authentication.

**Request**:
No payload.
`id`: Shipment ID (e.g., `651a029c3d4e5f6g7h8i9j0m`)

**Response**:
```json
{
  "success": true,
  "message": "anchor retrieved",
  "code": 200,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "merkle_root": "0xabc123def456...",
    "chain_tx_hash": "0xghj789klm012...",
    "chain": "POLYGON_AMOY",
    "anchored_at": "2023-10-27T10:30:00.000Z",
    "publisher": "CustomsConnect_Oracle"
  }
}
```

**Errors**:
-   `404 Not Found`: Shipment not found.
-   `401 Unauthorized`: Missing or invalid authentication token.
-   `500 Internal Server Error`: Failed to retrieve anchor.

#### GET /shipments/verify/{bl_number}
Provides public verification data for a shipment using its Bill of Lading (BL) number.

**Request**:
No payload.
`bl_number`: Bill of Lading Number (e.g., `BL-0012345`)

**Response**:
```json
{
  "success": true,
  "message": "verification data",
  "code": 200,
  "data": {
    "verified": true,
    "anchor": {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "merkle_root": "0xabc123def456...",
      "chain_tx_hash": "0xghj789klm012...",
      "chain": "POLYGON_AMOY",
      "anchored_at": "2023-10-27T10:30:00.000Z",
      "publisher": "CustomsConnect_Oracle"
    },
    "shipmentId": "651a029c3d4e5f6g7h8i9j0m"
  }
}
```

**Errors**:
-   `404 Not Found`: Shipment not found.
-   `500 Internal Server Error`: Verification failed.

#### GET /shipments/{id}/messages
Retrieves messages for a specific shipment. Requires authentication.

**Request**:
No payload.
`id`: Shipment ID (e.g., `651a029c3d4e5f6g7h8i9j0m`)
**Query Parameters**:
-   `limit`: (Optional) Max number of messages to return (default: 50).
-   `before_timestamp`: (Optional) Retrieve messages sent before this timestamp.
-   `thread_id`: (Optional) Filter messages by a specific thread ID.

**Response**:
```json
{
  "messages": [
    {
      "id": "msg-001",
      "shipment_id": "651a029c3d4e5f6g7h8i9j0m",
      "sender_id": "user-abc",
      "sender_name": "John Doe",
      "sender_role": "user",
      "body": "Is the SGD submitted yet?",
      "attachments": [],
      "priority": "normal",
      "message_type": "user",
      "seen_by": [
        { "user_id": "user-abc", "seen_at": "2023-10-27T11:00:00.000Z" }
      ],
      "sent_at": "2023-10-27T11:00:00.000Z"
    }
  ],
  "has_more": false
}
```

**Errors**:
-   `401 Unauthorized`: Missing or invalid authentication token.
-   `403 Forbidden`: Access denied to this shipment.
-   `500 Internal Server Error`: Failed to fetch messages.

#### POST /shipments/{id}/messages/upload
Uploads an attachment for a message in a shipment. Requires authentication.

**Request**:
`id`: Shipment ID (e.g., `651a029c3d4e5f6g7h8i9j0m`)
`Content-Type`: `multipart/form-data`
`file`: Binary file data.

**Response**:
```json
{
  "attachment": {
    "file_id": "file-xyz-123",
    "filename": "document.pdf",
    "file_type": "application/pdf",
    "size": 102400,
    "s3_key": "shipments/651a029c3d4e5f6g7h8i9j0m/messages/uuid-document.pdf",
    "uploaded_at": "2023-10-27T11:30:00.000Z"
  }
}
```

**Errors**:
-   `400 Bad Request`: No file provided.
-   `401 Unauthorized`: Missing or invalid authentication token.
-   `403 Forbidden`: Access denied to this shipment.
-   `500 Internal Server Error`: Failed to upload file.

#### GET /messages/unread
Retrieves unread message counts for the authenticated user across all accessible shipments. Requires authentication.

**Request**:
No payload.

**Response**:
```json
{
  "total_unread": 5,
  "by_shipment": [
    {
      "shipment_id": "651a029c3d4e5f6g7h8i9j0m",
      "bl_number": "BL-0012345",
      "unread_count": 3,
      "last_message_at": "2023-10-27T11:15:00.000Z"
    },
    {
      "shipment_id": "651a029c3d4e5f6g7h8i9j0n",
      "bl_number": "BL-0012346",
      "unread_count": 2,
      "last_message_at": "2023-10-27T11:20:00.000Z"
    }
  ]
}
```

**Errors**:
-   `401 Unauthorized`: Missing or invalid authentication token.
-   `500 Internal Server Error`: Failed to fetch unread counts.

#### GET /dashboard/stats
Retrieves dashboard statistics for the authenticated user. Requires authentication.

**Request**:
No payload.

**Response**:
```json
{
  "success": true,
  "message": "stats retrieved",
  "code": 200,
  "data": {
    "avgClearanceTime": "3.2 Days",
    "pendingAlerts": 4,
    "clearedCount": 128,
    "demurrageSaved": "₦ 2.4M",
    "recentActivity": [
      {
        "text": "Shipment #BL-0012345 Updated",
        "time": "2h ago"
      }
    ],
    "aiInsights": [
      {
        "type": "warning",
        "text": "Potential HS Code Mismatch on #SH-002"
      }
    ]
  }
}
```

**Errors**:
-   `500 Internal Server Error`: Failed to get stats.

## Technologies Used
This project harnesses a modern tech stack to deliver a scalable and robust solution.

| Technology          | Category           | Description                                                        | Version (Approx.) |
| :------------------ | :----------------- | :----------------------------------------------------------------- | :---------------- |
| **Node.js**         | Runtime            | Server-side JavaScript runtime.                                    | v24.10.1          |
| **TypeScript**      | Language           | Statically typed superset of JavaScript.                           | v5.9.3            |
| **Express.js**      | Web Framework      | Fast, unopinionated, minimalist web framework.                     | v5.1.0            |
| **Mongoose**        | ODM                | MongoDB object data modeling for Node.js.                          | v8.0.0            |
| **MongoDB**         | Database           | NoSQL document database.                                           | 7.0.0+            |
| **Socket.io**       | Real-time Engine   | Enables real-time, bidirectional communication.                    | v4.8.1            |
| **Redis**           | Cache/Message Broker | Used with Socket.io adapter for horizontal scaling of real-time events. | Latest            |
| **AWS S3 SDK**      | Cloud Storage      | For managing document uploads and storage.                         | v2.1693.0         |
| **Paystack**        | Payment Gateway    | Integration for handling online payments.                          | API Integration   |
| **bcrypt**          | Security           | Hashing passwords for secure authentication.                       | v6.0.0            |
| **jsonwebtoken**    | Security           | For creating and verifying JSON Web Tokens.                        | v9.0.2            |
| **swagger-jsdoc**   | Documentation      | Generates OpenAPI (Swagger) definitions from JSDoc comments.       | v6.2.8            |
| **swagger-ui-express** | Documentation   | Serves auto-generated API documentation.                           | v5.0.1            |
| **Axios**           | HTTP Client        | Promise-based HTTP client for the browser and Node.js.             | v1.13.2           |
| **Multer**          | Middleware         | For handling `multipart/form-data`, primarily file uploads.        | v2.0.2            |
| **sanitize-html**   | Security           | Sanitizes HTML to prevent XSS attacks in messages.                 | v2.17.0           |
| **uuid**            | Utility            | Generates RFC-compliant UUIDs.                                     | v13.0.0           |
| **ts-node-dev**     | Development Tool   | Restarts Node.js server on file changes for TypeScript projects.   | v2.0.0            |
| **cors**            | Middleware         | Provides a Connect/Express middleware that can be used to enable CORS. | v2.8.5            |

## Contributing
We welcome contributions to enhance this project! If you're looking to contribute, please follow these guidelines:

✨ **Fork the repository.**
🌿 **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/fix-description`.
💻 **Implement your changes**, ensuring they adhere to the project's coding standards.
🧪 **Write and run tests** for your changes.
📝 **Update documentation** as needed, especially if you introduce new features or modify existing ones.
🚀 **Commit your changes** with clear and concise messages.
⬆️ **Push your branch** to your forked repository.
📬 **Open a pull request** to the main repository, detailing your changes and the problem they solve.

## License
This project is licensed under the ISC License.

## Author Info
**[Your Name Here]**
-   **LinkedIn**: [Your LinkedIn Profile]
-   **Twitter**: [Your Twitter Handle]
-   **Portfolio**: [Your Personal Website/Portfolio]

---
[![Node.js](https://img.shields.io/badge/Node.js-24.10.1-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.1.0-orange?logo=express&logoColor=white)](https://expressjs.com/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.0.0-red?logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-black?logo=socket.io&logoColor=white)](https://socket.io/)
[![AWS S3](https://img.shields.io/badge/AWS_S3-Storage-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/s3/)
[![Paystack](https://img.shields.io/badge/Paystack-Payments-00C3F7?logo=paystack&logoColor=white)](https://paystack.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Repo Size](https://img.shields.io/github/repo-size/shemigam1/customs-connect-server?color=purple)](https://github.com/shemigam1/customs-connect-server)
[![Last Commit](https://img.shields.io/github/last-commit/shemigam1/customs-connect-server?color=yellow)](https://github.com/shemigam1/customs-connect-server/commits/main)

---
[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
