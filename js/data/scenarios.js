/**
 * Scenarios Data for English Conversation Practice
 * สถานการณ์จำลองสำหรับการฝึกพูดภาษาอังกฤษ
 */

export const SCENARIOS = [
  {
    id: 'cafe-order',
    title: 'Ordering Coffee & Snacks',
    titleTh: 'สั่งกาแฟและของว่างในคาเฟ่',
    level: 'Beginner',
    category: 'Daily Life',
    icon: '☕',
    partnerRole: 'Barista',
    partnerName: 'Alex',
    partnerAvatar: '🧑‍🍳',
    description: 'Practice ordering drinks, customizing your coffee, and asking about pastries.',
    descriptionTh: 'ฝึกสั่งกาแฟ ปรับแต่งระดับความหวาน/ชนิดนม และสั่งขนม',
    initialMessage: "Hi there! Welcome to The Daily Grind. What can I get started for you today?",
    initialMessageTh: "สวัสดีครับ! ยินดีต้อนรับสู่ The Daily Grind วันนี้รับเครื่องดื่มอะไรดีครับ?",
    learningGoals: [
      "Order a coffee with specific preferences (e.g. oat milk, less sweet)",
      "Ask for the price or food recommendations",
      "Choose payment method (cash or card)"
    ],
    suggestedPrompts: [
      "Could I get an iced Americano with no sugar, please?",
      "Can I substitute oat milk for regular milk?",
      "Do you have any fresh croissants left?",
      "How much does that come to? Can I pay by card?"
    ],
    vocabularyList: [
      { word: "Oat milk", phonetic: "/oʊt mɪlk/", th: "นมข้าวโอ๊ต" },
      { word: "Pastry", phonetic: "/ˈpeɪ.stri/", th: "ขนมอบ / เพสตรี้" },
      { word: "Substitute", phonetic: "/ˈsʌb.stɪ.tʃuːt/", th: "ขอเปลี่ยนแทนที่" },
      { word: "Receipt", phonetic: "/rɪˈsiːt/", th: "ใบเสร็จ" },
      { word: "Decaf", phonetic: "/ˈdiː.kæf/", th: "กาแฟไม่มีคาเฟอีน" }
    ]
  },
  {
    id: 'hotel-checkin',
    title: 'Hotel Check-in & Requests',
    titleTh: 'เช็คอินโรงแรมและสอบถามสิ่งอำนวยความสะดวก',
    level: 'Beginner',
    category: 'Travel',
    icon: '🏨',
    partnerRole: 'Front Desk Receptionist',
    partnerName: 'Sophia',
    partnerAvatar: '👩‍💼',
    description: 'Check into your hotel room, ask for amenities, and request a late check-out.',
    descriptionTh: 'แจ้งเช็คอินโรงแรม ขอย้ายชั้น/วิวห้อง และสอบถามเวลาอาหารเช้า',
    initialMessage: "Good afternoon, welcome to Grand Horizon Hotel! How may I assist you today?",
    initialMessageTh: "สวัสดีตอนบ่ายค่ะ ยินดีต้อนรับสู่ Grand Horizon Hotel มีอะไรให้ช่วยไหมคะ?",
    learningGoals: [
      "State your reservation details with booking name",
      "Inquire about breakfast hours and Wi-Fi password",
      "Request a high floor or quiet room"
    ],
    suggestedPrompts: [
      "Hi, I have a reservation under the name of Thanakorn.",
      "Is breakfast included in my stay, and what time does it start?",
      "Could I possibly get a room on a higher floor with a nice view?",
      "What is the Wi-Fi password?"
    ],
    vocabularyList: [
      { word: "Reservation", phonetic: "/ˌrez.ɚˈveɪ.ʃən/", th: "การจอง" },
      { word: "Amenities", phonetic: "/əˈmen.ə.t̬iz/", th: "สิ่งอำนวยความสะดวก" },
      { word: "Luggage", phonetic: "/ˈlʌɡ.ɪdʒ/", th: "กระเป๋าเดินทาง" },
      { word: "Key card", phonetic: "/kiː kɑːrd/", th: "คีย์การ์ดเปิดห้อง" },
      { word: "Complimentary", phonetic: "/ˌkɑːm.pləˈmen.t̬ɚ.i/", th: "บริการฟรี / อภินันทนาการ" }
    ]
  },
  {
    id: 'airport-immigration',
    title: 'Airport Immigration & Customs',
    titleTh: 'ผ่านด่านตรวจคนเข้าเมืองที่สนามบิน',
    level: 'Intermediate',
    category: 'Travel',
    icon: '✈️',
    partnerRole: 'Immigration Officer',
    partnerName: 'Officer Miller',
    partnerAvatar: '👮‍♂️',
    description: 'Answer typical questions from border control regarding your travel purpose and stay duration.',
    descriptionTh: 'ฝึกตอบคำถาม ตม. เกี่ยวกับจุดประสงค์การเดินทางและที่พัก',
    initialMessage: "Good day. Passport and arrival card, please. What is the purpose of your visit?",
    initialMessageTh: "สวัสดีครับ ขอดูหนังสือเดินทางและใบ ตม. ด้วยครับ จุดประสงค์ในการมาเยือนครั้งนี้คืออะไรครับ?",
    learningGoals: [
      "Clearly state the purpose of travel (tourism/vacation/business)",
      "Explain the duration of your stay and where you will stay",
      "Confirm return flight ticket details"
    ],
    suggestedPrompts: [
      "Here is my passport. I'm here for tourism and vacation.",
      "I will be staying for 7 days at the Grand Horizon Hotel.",
      "Yes, I have a return ticket booked for next Sunday.",
      "I am traveling alone / with my family."
    ],
    vocabularyList: [
      { word: "Purpose", phonetic: "/ˈpɝː.pəs/", th: "จุดประสงค์" },
      { word: "Duration", phonetic: "/duːˈreɪ.ʃən/", th: "ระยะเวลา" },
      { word: "Accommodation", phonetic: "/əˌkɑː.məˈdeɪ.ʃən/", th: "ที่พักอาศัย" },
      { word: "Customs declaration", phonetic: "/ˈkʌs.təmz ˌdek.ləˈreɪ.ʃən/", th: "ใบสำแดงสิ่งของต่อศุลกากร" },
      { word: "Return ticket", phonetic: "/rɪˈtɝːn ˈtɪk.ɪt/", th: "ตั๋วเครื่องบินขากลับ" }
    ]
  },
  {
    id: 'job-interview',
    title: 'Job Interview (Self Introduction)',
    titleTh: 'สัมภาษณ์งานภาษาอังกฤษ (แนะนำตัวและจุดแข็ง)',
    level: 'Intermediate',
    category: 'Work & Career',
    icon: '💼',
    partnerRole: 'Hiring Manager',
    partnerName: 'David',
    partnerAvatar: '👨‍💼',
    description: 'Introduce your professional background, strengths, and reason for applying.',
    descriptionTh: 'ฝึกตอบสัมภาษณ์งาน เล่าประวัติการทำงาน จุดเด่น และเหตุผลที่สมัครงานนี้',
    initialMessage: "Welcome! Thank you for taking the time to meet with us today. Could you start by telling me a little bit about yourself and your background?",
    initialMessageTh: "ยินดีต้อนรับครับ! ขอบคุณที่สละเวลามาสัมภาษณ์วันนี้ อยากให้เริ่มจากการแนะนำตัวเองและประสบการณ์คร่าวๆ ครับ",
    learningGoals: [
      "Give a concise, professional elevator pitch",
      "Highlight 1-2 core strengths with real examples",
      "Demonstrate enthusiasm for the company mission"
    ],
    suggestedPrompts: [
      "I have over three years of experience in software development, focusing on frontend and web applications.",
      "One of my greatest strengths is problem-solving and rapid learning.",
      "I'm eager to contribute to your team because I admire your innovative culture.",
      "Could you tell me more about the day-to-day responsibilities of this role?"
    ],
    vocabularyList: [
      { word: "Background", phonetic: "/ˈbæk.ɡraʊnd/", th: "ภูมิหลัง / ประสบการณ์ที่ผ่านมา" },
      { word: "Strengths", phonetic: "/streŋθs/", th: "จุดแข็ง / ความถนัด" },
      { word: "Collaborate", phonetic: "/kəˈlæb.ə.reɪt/", th: "ทำงานร่วมกันเป็นทีม" },
      { word: "Initiative", phonetic: "/ɪˈnɪʃ.ə.t̬ɪv/", th: "ความคิดริเริ่ม / ความกระตือรือร้น" },
      { word: "Accomplishment", phonetic: "/əˈkɑːm.plɪʃ.mənt/", th: "ความสำเร็จ / ผลงานที่โดดเด่น" }
    ]
  },
  {
    id: 'casual-friends',
    title: 'Casual Small Talk & Weekend Plans',
    titleTh: 'ชวนคุยทั่วไปและแผนวันหยุดสุดสัปดาห์',
    level: 'Beginner',
    category: 'Social',
    icon: '🎉',
    partnerRole: 'Colleague / Friend',
    partnerName: 'Emma',
    partnerAvatar: '👩‍🦰',
    description: 'Have a relaxed conversation about hobbies, favorite movies, food, and weekend activities.',
    descriptionTh: 'คุยสบายๆ กับเพื่อนร่วมงาน ถามสารทุกข์สุกดิบ งานอดิเรก และแผนเที่ยววันหยุด',
    initialMessage: "Hey! Long time no see. How have you been holding up lately? Got any exciting plans for this coming weekend?",
    initialMessageTh: "เฮ้! ไม่ได้เจอกันนานเลย ช่วงนี้เป็นยังไงบ้าง? เสาร์-อาทิตย์นี้มีแผนไปเที่ยวไหนน่าตื่นเต้นไหม?",
    learningGoals: [
      "Catch up naturally using casual conversational phrases",
      "Describe hobbies or leisure activities",
      "Ask follow-up questions to keep the conversation going"
    ],
    suggestedPrompts: [
      "I've been pretty busy with work, but doing great! How about you?",
      "I'm thinking of checking out a new Italian restaurant downtown this Saturday.",
      "Have you seen any good movies or series lately on Netflix?",
      "That sounds awesome! Let me know how it goes."
    ],
    vocabularyList: [
      { word: "Holding up", phonetic: "/ˈhoʊl.dɪŋ ʌp/", th: "เป็นอย่างไรบ้าง / รับมือไหวไหม" },
      { word: "Chill out", phonetic: "/tʃɪl aʊt/", th: "พักผ่อนสบายๆ" },
      { word: "Downtown", phonetic: "/ˌdaʊnˈtaʊn/", th: "ใจกลางเมือง" },
      { word: "Binge-watch", phonetic: "/ˈbɪndʒ ˌwɑːtʃ/", th: "ดูซีรีส์ติดต่อกันหลายตอนรวด" },
      { word: "Catch up", phonetic: "/kætʃ ʌp/", th: "พบปะอัปเดตชีวิตกัน" }
    ]
  },
  {
    id: 'doctor-visit',
    title: 'At the Clinic / Doctor Visit',
    titleTh: 'พบแพทย์และอธิบายอาการเจ็บป่วย',
    level: 'Intermediate',
    category: 'Health',
    icon: '🩺',
    partnerRole: 'Doctor',
    partnerName: 'Dr. Evans',
    partnerAvatar: '👨‍⚕️',
    description: 'Describe medical symptoms, pain levels, and ask about prescribed medications.',
    descriptionTh: 'อธิบายอาการเจ็บป่วย ปวดหัว มีไข้ หรือเจ็บคอ และถามวิธีรับประทานยา',
    initialMessage: "Hello. Please take a seat. What seems to be the problem today, and when did your symptoms start?",
    initialMessageTh: "สวัสดีครับ เชิญนั่งครับ วันนี้มีอาการไม่สบายตรงไหน และเริ่มเป็นตั้งแต่เมื่อไหร่ครับ?",
    learningGoals: [
      "Explain specific physical symptoms and duration",
      "Mention any allergies or current medications",
      "Ask about dosages and recovery advice"
    ],
    suggestedPrompts: [
      "I have had a sore throat and a high fever for the past two days.",
      "I also feel dizzy and have a persistent headache.",
      "Should I take this medicine before or after meals?",
      "Do I need to rest for a few days from work?"
    ],
    vocabularyList: [
      { word: "Sore throat", phonetic: "/sɔːr θroʊt/", th: "เจ็บคอ" },
      { word: "Prescription", phonetic: "/prɪˈskrɪp.ʃən/", th: "ใบสั่งยา" },
      { word: "Allergy", phonetic: "/ˈæl.ɚ.dʒi/", th: "อาการแพ้" },
      { word: "Dizziness", phonetic: "/ˈdɪz.i.nəs/", th: "อาการวิงเวียนศีรษะ" },
      { word: "Dosage", phonetic: "/ˈdoʊ.sɪdʒ/", th: "ขนาด/ปริมาณยาที่รับประทาน" }
    ]
  },
  {
    id: 'free-talk',
    title: 'Free Talk AI Practice',
    titleTh: 'สนทนาอิสระกับ AI (คุยได้ทุกเรื่อง)',
    level: 'All Levels',
    category: 'Free Style',
    icon: '💬',
    partnerRole: 'AI English Coach',
    partnerName: 'Nova',
    partnerAvatar: '🤖',
    description: 'Talk about anything under the sun! Ask questions, practice opinions, and get instant suggestions.',
    descriptionTh: 'คุยอิสระได้ทุกหัวข้อ แลกเปลี่ยนความคิดเห็น ฝึกสำนวน พร้อมรับคำแนะนำแกรมม่าทันที',
    initialMessage: "Hello! I'm Nova, your AI English practice partner. What topic would you like to chat about today? We can talk about travel, technology, life goals, or anything you like!",
    initialMessageTh: "สวัสดีครับ! ผม Nova คู่ซ้อมพูดภาษาอังกฤษของคุณ วันนี้อยากคุยเรื่องอะไรดีครับ? ท่องเที่ยว เทคโนโลยี หรือเรื่องอะไรก็ได้เลย!",
    learningGoals: [
      "Practice spontaneous English conversation without scripts",
      "Express personal opinions clearly",
      "Learn alternative vocabulary to sound more natural"
    ],
    suggestedPrompts: [
      "Can you help me practice talking about my favorite hobby?",
      "Let's debate: Do you prefer working from home or from an office?",
      "How do native speakers usually express agreement in casual talks?",
      "Can you correct any grammar mistakes in my sentences as we chat?"
    ],
    vocabularyList: [
      { word: "Spontaneous", phonetic: "/spɑːnˈteɪ.ni.əs/", th: "ที่เกิดขึ้นทันทีโดยไม่ต้องเตรียมตัวล่วงหน้า" },
      { word: "Nuance", phonetic: "/ˈnuː.ɑːns/", th: "ความแตกต่างทางความหมายหรือน้ำเสียงเพียงเล็กน้อย" },
      { word: "Idiom", phonetic: "/ˈɪd.i.əm/", th: "สำนวน" },
      { word: "Fluency", phonetic: "/ˈfluː.ən.si/", th: "ความคล่องแคล่ว" }
    ]
  }
];
