# 🚀 Lead Control Management (LCM) - AI & WhatsApp Automation System

Achieve your lead management goals with **Lead Control Management (LCM)**. Yeh ek comprehensive SaaS platform aur real-time application hai jo WhatsApp Lead Management & Automation ke liye design ki gayi hai. Is project mein ek powerful **Python AI Agent** include kiya gaya hai jo automatically customers se baat karta hai aur leads extract karta hai.

---

## 🌟 Current Progress & Key Modules

### 1️⃣ Communication Module (WhatsApp Layer)
WhatsApp webhook ka integration fully working hai aur tumhara system directly WhatsApp se connected hai.
- ✅ Incoming aur Outgoing WhatsApp messages seamlessly handle ho rahe hain.
- ✅ Conversations beautifully track ho rahi hain frontend pe.
- ✅ Webhook proper payloads receive aur parse kar raha hai.

### 2️⃣ AI Agent Module (The Brain - Python 🐍)
System ka core **AI Agent** hai jo ke Python mein develop (in `python_files/`) kiya gaya hai. Yeh independently customer conversations handle karta hai.
- 🧠 **Context Understanding:** Customer messages ko effectively samajhta hai.
- 🎯 **Data Extraction:** Messages mein se automatically lead data extract karta hai.
- 💬 **Smart Replies:** Context-aware aur natural replies generate kar ke forward karta hai.
- 📊 **Lead Scoring:** Lead ki quality (Hot, Warm, Cold) determine karta hai aur follow-ups auto-schedule karta hai.
👉 *Tumhara system ab naturally aur automatically customers se baat kar sakta hai bina manual intervention ke.*

### 3️⃣ Lead Storage (CRM Base / MongoDB)
AI jo data extract karta hai wo dynamically **MongoDB** mein store hota hai. Tumhare paas ek solid aur modern **CRM Base** ready hai.
Structured data fields jo automatically collect aur save hote hain:
- `Name`
- `Budget`
- `Area` & `Property type`
- `Size`
- `Lead status` (hot/warm/cold) & `Lead score`
- `Follow-up flag`

### 4️⃣ Complete Flow Working
Platform ki **End-to-End Pipeline Working** aur verified hai. Iska operational flow yahan design kiya gaya hai:
*`Customer Message` ➡️ `WhatsApp` ➡️ `Webhook` ➡️ `AI Agent (Python)` ➡️ `Extracts Data` ➡️ `Storage (MongoDB)`*

### 5️⃣ Modern Platform UI & Features
- **Landing Page (Basic UI):** Product ka entry point tayar hai jismein modern Header (login/signup), Hero section aur ek zabardast SaaS structure mojood hai.
- **📊 Dashboard:** Central hub for analytics, charts, aur system view.
- **🏢 Workspace Creation:** Multi-tenant support for managing different teams or branches.
- **💬 Real-Time Conversations Chat:** Socket.io k through built-in real-time WhatsApp-like messaging web view.
- **⚙️ WhatsApp Settings:** Directly app se hi webhooks aur api keys handle karne ka interface.

---

## 💻 Tech Stack

Yeh application highly modern, fast aur scalable technologies pe based hai:
- **Frontend & App Framework:** [Next.js 16](https://nextjs.org/) (App Router), React 19
- **Design:** [TailwindCSS v4](https://tailwindcss.com/) & modern SaaS aesthetics.
- **State Management:** Redux Toolkit (Data persist across refreshes).
- **Backend & Database:** Node.js, MongoDB (Mongoose), aur [Supabase](https://supabase.com/).
- **AI Backend / Brain:** Python 3 (Flask/FastAPI module for the AI Agent).
- **Real-Time Communication:** [Socket.io](https://socket.io/)

---

## 🛠 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)  
- API Keys: MongoDB, Supabase, WhatsApp Cloud API, AI Provider (e.g. OpenAI).

### Next.js Client & Server Setup
1. Repository clone karo.
2. Root directory mein `npm install` run karo dependencies k liye.
3. `.env` file ko copy karke `.env.local` bana lo aur usme credentials daal lo.
4. Next.js app ko run karo:
   ```bash
   npm run dev
   ```

### Python AI Agent Setup
1. Terminal ko `python_files/` directory mein le aao (`cd python_files`).
2. Virtual environment create karo aur activate karo:
   ```bash
   python -m venv venv
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   ```
3. Requirements install karo:
   ```bash
   pip install -r requirements.txt
   ```
4. Agent app run karo:
   ```bash
   python app.py
   ```

*Developed & Maintained by LCM Team.* 🚀
