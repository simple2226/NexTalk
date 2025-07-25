# NexTalk 💬

**NexTalk** is a real-time chat application built with **Node.js**, **Socket.IO**, **MongoDB**, and **Express**, providing a fast, interactive messaging experience with user authentication, dynamic rooms, and more.

![NexTalk UI](https://github.com/simple2226/NexTalk/assets/preview-image.png) <!-- Replace with a real screenshot if available -->

---

## 🚀 Features

- 🔐 **Secure Login/Signup** with hashed passwords (bcrypt)
- 🧑‍🤝‍🧑 **One-to-one chat** and private messaging
- 💬 **Real-time communication** using Socket.IO
- 📁 **MongoDB-backed** message and user storage
- 🟢 **Online status tracking**
- 📜 **Chat history** persistence
- ✨ Responsive and intuitive UI (Handlebars-based)

---

## 🛠️ Tech Stack

| Layer         | Technology            |
|---------------|------------------------|
| Frontend      | HTML, CSS, JS, Handlebars |
| Backend       | Node.js, Express       |
| Real-time     | Socket.IO              |
| Database      | MongoDB with Mongoose  |
| Authentication| Bcrypt                 |
| Templating    | Handlebars             |
| Utilities     | Express-session, Connect-mongo |

---

## 📁 Project Structure

```
NexTalk/
├───backend/                # seperate backend maintained
│   ├───auth/               # cookie-ops, acc/ref token generation functions
│   ├───config/             # all the database connections variables
│   ├───controller/         # functions for different API routes
│   ├───middleware/         # authorisation/authentication middlewares
│   ├───model/              # MongoDB Document models
│   └───routes/             # route.js -> defining all the API routes
│
└───frontend/               # seperate backend maintained
    ├───public/             # favicon, etc...
    └───src/                # all the .jsx and .css files
        └───assets/         # images, svgs, etc...
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repo**

```bash
git clone https://github.com/simple2226/NexTalk.git
cd NexTalk
```

2. **Install dependencies**

From the `root` directory, run the following commands:

```bash
cd \backend npm install
cd ..\frontend npm install
```

3. **Set environment variables**

Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nextalk
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_account_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. **Run the application**

From the `root` directory, run the following commands:

```bash
cd \backend npm run dev
cd ..\frontend npm run dev
```

5. **Visit**

```
http://localhost:3000
```

---

## 🔐 Authentication Flow

- Users can register or login using their credentials.
- Passwords are securely hashed using `bcrypt`.
- Access and Refresh tokens are stored securely in Domain Cookies.

---

## 💬 Real-time Messaging

- Uses **Socket.IO** for instant message delivery.
- Tracks online/offline users.
- Tracks wether the user is currently on your chat or not
- Messages are stored and retrieved using MongoDB.
- Users can chat with any online/offline user.

---

## 📸 Screenshots

<!-- Add actual screenshots if available -->
- Login Page
- Signup Page
- Chat UI with real-time messaging
- Online users list

---

## 🙌 Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 🧠 Future Improvements

- Group chats and channels
- Message reactions and emojis
- File sharing support
- User profile customization
- Notifications

---

## 🧑‍💻 Author

- **Kunal Khallar** – [GitHub](https://github.com/simple2226)