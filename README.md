# 🎈 EngSpeak Kids — เว็บแอพฝึกพูดภาษาอังกฤษสำหรับเด็กประถม

เว็บแอพพลิเคชันสำหรับฝึกพูดและสนทนาภาษาอังกฤษแสนสนุกสำหรับเด็กระดับประถมศึกษา (ป.1 - ป.6) โต้ตอบด้วยเสียงพูดแบบ Real-time, ระบบสะสมดาวความเก่ง ⭐, สถานการณ์จำลองน่ารัก (สั่งไอศกรีม 🍦, คุยกับน้องหมาบัดดี้ 🐶, ห้องเรียน 🏫, ท่องอวกาศ 🚀, สวนสัตว์ 🦁, ปาร์ตี้พิซซ่า 🍕), พร้อม **ระบบสร้างบทสนทนาตามใจชอบ (Custom Scenario Builder)** สำหรับคุณครูและผู้ปกครอง เชื่อมต่อกับ **Firebase (Cloud Firestore)** และระบบเข้าสู่ระบบด้วย **Google Sign-In** พร้อมโฮสต์บน **GitHub Pages** ได้ทันที

---

## ✨ ฟีเจอร์เด่น (Key Features)

1. **🎙️ ฝึกสนทนาโต้ตอบผ่านเสียงพูด (Voice & Speech Interactive)**
   - **Speech-to-Text**: กดไมโครโฟนขนาดใหญ่แล้วพูดภาษาอังกฤษ แปลงเสียงเป็นข้อความทันที
   - **Text-to-Speech**: คู่สนทนาออกเสียงตอบกลับด้วยสำเนียงธรรมชาติ (ปรับระดับความเร็วและเลือกสำเนียง US/UK ได้)
   - **⭐ ระบบสะสมดาวความเก่ง (Star Rewards)**: ได้รับดาวสะสมทุกครั้งที่ฝึกพูด และโบนัส +3 ดาวเมื่อผ่านแต่ละด่าน
   - **Thai Translation & Prompts**: ปุ่มดูคำแปลไทย และแถบกดเลือกประโยคแนะนำให้เด็กๆ พูดตามได้ง่าย

2. **🎨 ระบบ Custom บทสนทนา (สำหรับคุณครู & ผู้ปกครอง)**
   - มีปุ่มสร้างด่านใหม่ผ่านหน้าเว็บได้ทันที
   - กำหนดชื่อด่าน, คำแปลไทย, ระดับชั้น (ป.1-ป.3 หรือ ป.4-ป.6)
   - เลือกมาสคอตน่ารัก (🐻, 🐶, 🐱, 🐰, 🐼, 🦁, 🦄, 🤖, 🍦, 🍕, 🚀, 🎨)
   - บันทึกข้อมูลขึ้น **Cloud Firestore** ทันที เพื่อให้เด็กๆ ทุกคนเข้าเรียนด่านใหม่ได้พร้อมกัน
   - มีปุ่มลบ/จัดการด่านที่สร้างเองได้สะดวก

3. **🎭 สถานการณ์จำลองสำหรับเด็กประถม (Kids Scenarios)**
   - 🍦 **Ice Cream & Sweet Shop**: สั่งไอศกรีมรสช็อกโกแลต วานิลลา สตรอว์เบอร์รี
   - 🐶 **Play with Buddy the Puppy**: เล่นขว้างบอลกับน้องหมาบัดดี้แสนรู้
   - 🏫 **Fun in the Classroom**: คุยกับเพื่อนเรื่องระบายสีและวิชาที่ชอบ
   - 🚀 **Space Adventure with Robi**: ขับยานอวกาศท่องดวงจันทร์และดวงดาวกับหุ่นยนต์โรบี้
   - 🦁 **Safari Zoo Explorer**: ทายชื่อสัตว์และชมพี่ยีราฟ ช้าง และสิงโต
   - 🍕 **Pizza Party with Friends**: แต่งหน้าพิซซ่ากับเชฟโป
   - 🤖 **Chat with Nova**: คุยอิสระกับพี่หุ่นยนต์โนวา

4. **🔥 ระบบเชื่อมต่อ Firebase & Google Login**
   - เข้าสู่ระบบด้วย **Google Account** ในคลิกเดียว
   - บันทึกประวัติและดาวสะสมขึ้น **Cloud Firestore**
   - **Word Bank**: สมุดจดคำศัพท์พร้อมปุ่มกดฟังเสียงอ่าน
   - **โหมด Guest**: ใช้งานได้ทันทีแม้ยังไม่ได้ล็อกอิน

5. **🚀 โฮสต์บน GitHub Pages ได้ 100%**
   - พัฒนาด้วย **Modern Vanilla JavaScript (ES Modules)**
   - รันได้ทันทีทั้งบนเครื่องและบน GitHub Pages โดยไม่ต้องคอมไพล์
---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```
English/
├── index.html                  # หน้าเว็บหลัก Single Page Application
├── 404.html                    # สำหรับรองรับ Routing บน GitHub Pages
├── css/
│   ├── main.css                # ดีไซน์ระบบ, Variables, Dark/Light Theme, Layout
│   ├── chat.css                # หน้าจอห้องสนทนา, Bubble แชท, คลื่นเสียงไมโครโฟน
│   └── components.css          # การ์ดสถานการณ์, คลังคำศัพท์, สถิติ, Popups
├── js/
│   ├── app.js                  # Entry point และ Event listeners
│   ├── config/
│   │   └── firebase-config.js  # จัดการ Firebase Config และ LocalStorage
│   ├── services/
│   │   ├── auth-service.js     # Google Sign-In & Auth State Management
│   │   ├── db-service.js       # Cloud Firestore & LocalStorage Sync
│   │   ├── speech-service.js   # Web Speech API (STT & TTS)
│   │   └── ai-service.js       # ระบบประมวลผลบทสนทนา, แกรมม่า และ Gemini API
│   ├── data/
│   │   └── scenarios.js        # ข้อมูลสถานการณ์จำลอง, คำศัพท์, บทสนทนาเริ่มต้น
│   └── ui/
│       ├── ui-controller.js    # ควบคุมการแสดงผล สลับหน้าจอ และแชทสด
│       └── modal-controller.js # จัดการ Popups และ Toast Notifications
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions สำหรับ Deploy ไปยัง GitHub Pages อัตโนมัติ
├── .gitignore
└── README.md
```

---

## 💻 วิธีเปิดใช้งานบนเครื่องของคุณ (Local Run)

คุณสามารถเปิดเซิร์ฟเวอร์จำลองเพื่อทดสอบบนเครื่องได้ง่ายๆ ผ่าน Terminal:

```bash
# เข้าไปยังโฟลเดอร์โปรเจกต์
cd /Users/thanakorn/Documents/App/English

# รัน Local Server ด้วย Python 3 (มีติดมากับ macOS อยู่แล้ว)
python3 -m http.server 8080
```

จากนั้นเปิดเบราว์เซอร์ (แนะนำ Google Chrome) แล้วไปที่:
👉 **`http://localhost:8080`**

*(หมายเหตุ: ฟังก์ชันไมโครโฟน Web Speech API ทำงานได้ดีที่สุดบน `localhost` หรือโดเมนที่มี HTTPS)*

---

## 🔥 วิธีการตั้งค่า Firebase (Google Login + Firestore)

เพื่อให้ระบบบันทึกข้อมูลและเข้าสู่ระบบด้วย Google ทำงานได้เต็มรูปแบบ ให้ทำตามขั้นตอนง่ายๆ ดังนี้ครับ:

### ขั้นตอนที่ 1: สร้าง Firebase Project
1. ไปที่ [Firebase Console](https://console.firebase.google.com/) แล้วล็อกอินด้วย Google Account
2. คลิก **"Add project"** (เพิ่มโปรเจกต์)
3. ตั้งชื่อโปรเจกต์ (เช่น `engspeak-ai`) แล้วคลิก Continue จนเสร็จสิ้น

### ขั้นตอนที่ 2: เปิดใช้งาน Google Sign-In
1. ในเมนูด้านซ้าย เลือก **Build > Authentication**
2. คลิกปุ่ม **Get started**
3. ในแท็บ **Sign-in method** ให้เลือก **Google**
4. กดสวิตช์ **Enable**, เลือกอีเมลผู้ดูแลโปรเจกต์ แล้วกด **Save**

### ขั้นตอนที่ 3: เปิดใช้งาน Cloud Firestore
1. ในเมนูด้านซ้าย เลือก **Build > Firestore Database**
2. คลิกปุ่ม **Create database**
3. เลือก Location ใกล้เคียง (เช่น `asia-southeast1` หรือ Default)
4. เลือกรหัสความปลอดภัยเริ่มต้นเป็น **Start in test mode** (หรือ Production mode) แล้วกด Create

### ขั้นตอนที่ 4: คัดลอก Firebase Config
1. คลิกที่ไอคอนรูปฟันเฟือง ⚙️ (Project settings) ข้างเมนู Project Overview
2. เลื่อนลงมาด้านล่างสุดที่หัวข้อ **Your apps** คลิกไอคอนเว็บ `</>`
3. ตั้งชื่อ App Nickname (เช่น `EngSpeak Web`) แล้วกด **Register app**
4. คัดลอกชุดข้อมูล `firebaseConfig` เช่น:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### ขั้นตอนที่ 5: นำ Config มาใส่ในเว็บแอพ
คุณทำได้ 2 วิธี:
- **วิธีที่ 1 (สะดวกที่สุด):** เปิดหน้าเว็บแอพ คลิกที่ปุ่มแถบ **"Setup Firebase"** สีส้มด้านบนขวา จะมีหน้าต่างขึ้นมาให้วางค่า Config แล้วกด **"บันทึกการตั้งค่า"** ได้ทันที
- **วิธีที่ 2:** เปิดไฟล์ `js/config/firebase-config.js` แล้วนำค่าไปวางแทนที่ในออบเจกต์ `DEFAULT_FIREBASE_CONFIG`

---

## 🌐 วิธีนำขึ้น GitHub และเปิดใช้งาน GitHub Pages

เมื่อพร้อมนำขึ้นอินเทอร์เน็ต สามารถนำขึ้น GitHub ได้ตามขั้นตอนดังนี้:

### 1. สร้าง Repository บน GitHub
1. ไปที่ [GitHub.com](https://github.com/) แล้วคลิก **"New repository"**
2. ตั้งชื่อ เช่น `english-practice-app`
3. เลือกระดับเป็น **Public**
4. **ไม่ต้อง** ติ๊กเครื่องหมายถูกที่ Add README หรือ .gitignore (เพราะเรามีในเครื่องแล้ว) แล้วกด **Create repository**

### 2. Push โค้ดจากเครื่องขึ้น GitHub
เปิด Terminal ในโฟลเดอร์นี้ แล้วรันคำสั่ง:

```bash
cd /Users/thanakorn/Documents/App/English

# ตรวจสอบและ commit โค้ด
git init
git add .
git commit -m "Initial commit: EngSpeak AI web application"

# ตั้งชื่อ branch หลักเป็น main
git branch -M main

# เชื่อมต่อไปยัง GitHub ของคุณ (เปลี่ยน <YOUR-USERNAME> และ <YOUR-REPO> เป็นชื่อของคุณ)
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO>.git

# Push โค้ดขึ้น GitHub
git push -u origin main
```

### 3. เปิดใช้งาน GitHub Pages
1. ไปที่หน้า Repository ของคุณบน GitHub
2. คลิกแท็บ **Settings** > เมนูด้านซ้ายเลือก **Pages**
3. ในหัวข้อ **Build and deployment > Source**:
   - **ตัวเลือก A (แนะนำ):** เลือก **GitHub Actions** (ระบบจะรันไฟล์ `.github/workflows/deploy.yml` ให้อัตโนมัติใน 1-2 นาที)
   - หรือ **ตัวเลือก B:** เลือก **Deploy from a branch** > เลือก Branch `main` และโฟลเดอร์ `/ (root)` แล้วกด Save
4. คุณจะได้รับ URL สำหรับเปิดเว็บ เช่น:
   👉 `https://<YOUR-USERNAME>.github.io/<YOUR-REPO>/`

---

## ⚠️ ขั้นตอนสำคัญ: เพิ่ม Authorized Domain ใน Firebase

เมื่อคุณนำเว็บขึ้น GitHub Pages แล้ว เพื่อให้ Google Sign-In ใช้งานได้บนลิงก์ของ GitHub:
1. ไปที่ **Firebase Console > Authentication > Settings (แท็บการตั้งค่า)**
2. คลิกแท็บ **Authorized domains**
3. คลิก **Add domain**
4. กรอกโดเมน GitHub ของคุณ เช่น:
   `username.github.io` (ไม่ต้องใส่ https:// หรือ path ด้านหลัง)
5. กด **Done** เพียงเท่านี้ก็จะสามารถล็อกอินด้วย Google บน GitHub Pages ได้อย่างสมบูรณ์แบบ! 🎉

---

## 🛠️ การตั้งค่าเพิ่มเติม (Optional)

- **โหมดมืด/สว่าง (Dark/Light Mode):** คลิกปุ่ม 🌙/☀️ บนแถบเมนูเพื่อสลับตามต้องการ
- **Google Gemini API Key:** หากต้องการให้ AI โต้ตอบแบบไม่มีขีดจำกัดด้วยโมเดล Gemini 1.5 Flash สามารถกดปุ่ม ⚙️ (Settings) แล้วใส่ Gemini API Key ได้ฟรีจาก [Google AI Studio](https://aistudio.google.com/)
