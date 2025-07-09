# 🔍 FRS — FaceRecognitionSystem (Real-Time Face Recognition Web App)

**FRS** is a full-featured real-time face recognition system built as a modern web application using **React**, **Vite**, **face-api.js**, and **Supabase**. It allows users to register, recognize, and manage face data through a responsive and intuitive UI.

---

## 🚀 Features

- 📸 Real-Time Face Detection using `face-api.js` via webcam  
- 🧠 Face Recognition with automatic name display or "Unknown" tag  
- 🗂️ Face Registration Panel — add new faces with name & descriptors  
- 🗑️ Face Management — delete or refresh face data stored in Supabase  
- 🌐 Network Access with HTTPS (via self-signed cert for webcam compatibility)  
- ⚡ Built with Vite, React, TailwindCSS, and ShadCN UI  
- ☁️ Cloud-integrated via Supabase (PostgreSQL backend + storage)  

---

## 📁 Project Structure

```

src/
├── components/         # Face detection, webcam, and UI components
├── pages/              # Main routes and app layout
├── integrations/       # Supabase config
├── hooks/              # Reusable utilities (e.g., toast handler)
public/models/          # face-api.js model files (must be downloaded)

````

---

## 🧑‍💻 Technologies Used

| Tool            | Purpose                             |
|-----------------|--------------------------------------|
| React + Vite    | Frontend framework and dev server    |
| face-api.js     | Face detection and recognition       |
| Supabase        | Face data storage (PostgreSQL)       |
| Tailwind CSS    | Utility-first styling                |
| ShadCN UI       | Clean pre-styled UI components       |
| TypeScript      | Static typing                        |

---

## 📦 Getting Started

### 1. Clone the repo:
```bash
git clone https://github.com/NRJ900/FRS-FaceRecognitionSystem.git
cd FRS-FaceRecognitionSystem
````

### 2. Install dependencies:

```bash
npm install --save-dev @vitejs/plugin-basic-ssl@1.0.1 --legacy-peer-deps
```

### 3. Download face-api.js models:
(Already installed just in case)
You must include the following model folders inside `public/models/`:

* `tiny_face_detector_model`
* `face_landmark_68_model`
* `face_recognition_model`

📁 Download them from:
[https://github.com/justadudewhohacks/face-api.js-models](https://github.com/justadudewhohacks/face-api.js-models)

### 4. Start the development server (with HTTPS):

```bash
npm run dev
```

### 5. Open in browser:

```
https://localhost:8080
```

You can also open it via your LAN IP, for example:
`https://192.168.150.115:8080` (must accept browser warning)

---

## 🔐 Note on HTTPS & Webcam Access

Modern browsers block webcam access on non-secure origins (except `localhost`).
This project uses a **self-signed HTTPS certificate** via `@vitejs/plugin-basic-ssl`.

To allow webcam access:

* Access via `https://localhost:8080` or `https://your-lan-ip:8080`
* Accept the browser's **"Your connection is not private"** warning

---
## Note on changing supabase api

## 🧠 Future Improvements

* 🔁 Face recognition history & logging
* 🧪 Better recognition by allowing multiple samples per person
* 🔒 Secure login/authentication + role-based face management(under developement/planning)
* ☁️ Production deployment with trusted HTTPS (Vercel / Firebase / Netlify)

---

## 🤝 Credits

* [face-api.js](https://github.com/justadudewhohacks/face-api.js)
* [Supabase](https://supabase.com)
* [ShadCN UI](https://ui.shadcn.com)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).


