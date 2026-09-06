/**
 * Scenarios Data for Kids English Practice
 * บทสนทนาเริ่มต้น: At the Grocery Store (ร้านขายของชำ)
 */

export const SCENARIOS = [
  {
    id: 'grocery-store',
    title: 'At the Grocery Store',
    titleTh: 'ที่ร้านขายของชำ 🏪',
    level: 'ประถม 1 - 3',
    category: 'Shopping & Daily Life',
    icon: '🏪',
    description: 'Practice shopping for jam and potato chips at the store!',
    descriptionTh: 'ฝึกซื้อของในร้านค้า ซื้อแยมและมันฝรั่งทอด เลือกเล่นเป็นคนขายหรือลูกค้าได้',
    // Scripted Dialogue Lines
    script: [
      {
        speaker: 'Shopkeeper',
        speakerTh: 'คนขาย',
        avatar: '🧑‍🍳',
        text: "Good afternoon! Can I help you?",
        textTh: "สวัสดีตอนบ่ายครับ! มีอะไรให้ผมช่วยไหมครับ?"
      },
      {
        speaker: 'Customer',
        speakerTh: 'ลูกค้า',
        avatar: '👦',
        text: "Yes! I would like a jar of jam, please?",
        textTh: "ครับ! ขอแยมสักกระปุกหนึ่งได้ไหมครับ?"
      },
      {
        speaker: 'Shopkeeper',
        speakerTh: 'คนขาย',
        avatar: '🧑‍🍳',
        text: "Here they are! Anything else?",
        textTh: "นี่ครับ! รับอะไรเพิ่มอีกไหมครับ?"
      },
      {
        speaker: 'Customer',
        speakerTh: 'ลูกค้า',
        avatar: '👦',
        text: "Yes! And two bags of potato chips.",
        textTh: "ครับ! แล้วก็ขอมันฝรั่งทอดสองถุงด้วยครับ"
      },
      {
        speaker: 'Shopkeeper',
        speakerTh: 'คนขาย',
        avatar: '🧑‍🍳',
        text: "Here they are! Anything else?",
        textTh: "นี่ครับ! รับอะไรเพิ่มอีกไหมครับ?"
      },
      {
        speaker: 'Customer',
        speakerTh: 'ลูกค้า',
        avatar: '👦',
        text: "No thanks! How much is it?",
        textTh: "ไม่แล้วครับ ขอบคุณครับ! ทั้งหมดราคาเท่าไหร่ครับ?"
      },
      {
        speaker: 'Shopkeeper',
        speakerTh: 'คนขาย',
        avatar: '🧑‍🍳',
        text: "That will be ten dollars, please! Thank you very much! Good bye!",
        textTh: "ทั้งหมดสิบดอลลาร์ครับ! ขอบคุณมากๆ ครับ! ลาก่อนนะครับ!"
      },
      {
        speaker: 'Customer',
        speakerTh: 'ลูกค้า',
        avatar: '👦',
        text: "Thank you! Bye!",
        textTh: "ขอบคุณครับ! บ๊ายบาย!"
      }
    ],
    vocabularyList: [
      { word: "Grocery store", phonetic: "/ˈɡroʊ.sɚ.i stɔːr/", th: "ร้านขายของชำ" },
      { word: "Jar of jam", phonetic: "/dʒɑːr əv dʒæm/", th: "แยมหนึ่งกระปุก" },
      { word: "Potato chips", phonetic: "/pəˈteɪ.toʊ tʃɪps/", th: "มันฝรั่งทอดกรอบ" },
      { word: "Anything else?", phonetic: "/ˈen.i.θɪŋ els/", th: "รับอะไรเพิ่มอีกไหม?" },
      { word: "Ten dollars", phonetic: "/ten ˈdɑː.lɚz/", th: "สิบดอลลาร์" }
    ]
  },
  {
    id: 'supermarket-math',
    title: 'Supermarket Math & Shopping',
    titleTh: 'ช้อปปิ้งคิดเลขแสนสนุก 🛒',
    level: 'ประถม 4 - 6',
    category: 'Math & Daily Life',
    icon: '🛒',
    isDynamicMath: true,
    partnerName: 'Cashier Sam',
    partnerRole: 'แคชเชียร์ซูเปอร์มาร์เก็ต',
    partnerAvatar: '🧑‍🍳',
    description: 'Practice buying groceries, calculating totals, and change dynamically with the cashier!',
    descriptionTh: 'ฝึกซื้อของ คำนวณราคารวม และเงินทอนตามตารางราคาสินค้า เลือกตอบอะไรก็ได้ AI จะช่วยคิดเลขให้ทันที!',
    initialMessage: "Good afternoon! Welcome to our supermarket! Look at our price board. What would you like to buy today?",
    initialMessageTh: "สวัสดีตอนบ่ายครับ! ยินดีต้อนรับสู่ซูเปอร์มาร์เก็ต ดูป้ายราคาแล้ว วันนี้อยากซื้ออะไรดีครับ?",
    itemsCatalog: [
      { id: 'rice', name: 'rice', unit: 'bag', unitPhrase: 'a bag of rice', price: 95, emoji: '🌾', th: 'ข้าวสาร (ถุงละ 95฿)' },
      { id: 'icecream', name: 'ice cream', unit: 'box', unitPhrase: 'a box of ice cream', price: 73, emoji: '🍦', th: 'ไอศกรีม (กล่องละ 73฿)' },
      { id: 'eggs', name: 'eggs', unit: 'dozen', unitPhrase: 'a dozen eggs', price: 42, emoji: '🥚', th: 'ไข่ไก่ 1 โหล (42฿)' },
      { id: 'cookies', name: 'cookies', unit: 'can', unitPhrase: 'a can of cookies', price: 50, emoji: '🍪', th: 'คุกกี้ (กระป๋องละ 50฿)' },
      { id: 'jam', name: 'jam', unit: 'jar', unitPhrase: 'a jar of jam', price: 30, emoji: '🍓', th: 'แยม (กระปุกละ 30฿)' },
      { id: 'milk', name: 'milk', unit: 'carton', unitPhrase: 'a carton of milk', price: 25, emoji: '🥛', th: 'นม (กล่องละ 25฿)' },
      { id: 'cake', name: 'cake', unit: 'piece', unitPhrase: 'a cake', price: 85, emoji: '🎂', th: 'เค้ก (ก้อนละ 85฿)' },
      { id: 'softdrink', name: 'soft drink', unit: 'bottle', unitPhrase: 'a bottle of soft drink', price: 32, emoji: '🥤', th: 'น้ำอัดลม (ขวดละ 32฿)' }
    ],
    suggestedPrompts: [
      "I want to buy a carton of milk and a bag of rice. How much will I pay?",
      "Here is 500 baht. How much change will I get?",
      "I would like a dozen eggs, a box of ice cream and two cartons of milk.",
      "A jar of jam, a can of cookies, and a bottle of soft drink, please.",
      "My mother gave me 180 baht to buy rice. I also want a cake!",
      "How much is a carton of milk and a cake?"
    ],
    vocabularyList: [
      { word: "A carton of milk", phonetic: "/ə ˈkɑːr.tən əv mɪlk/", th: "นมหนึ่งกล่อง (25 ฿)" },
      { word: "A bag of rice", phonetic: "/ə bæɡ əv raɪs/", th: "ข้าวสารหนึ่งถุง (95 ฿)" },
      { word: "A dozen eggs", phonetic: "/ə ˈdʌz.ən eɡz/", th: "ไข่ไก่หนึ่งโหล (42 ฿)" },
      { word: "A can of cookies", phonetic: "/ə kæn əv ˈkʊk.iz/", th: "คุกกี้หนึ่งกระป๋อง (50 ฿)" },
      { word: "A jar of jam", phonetic: "/dʒɑːr əv dʒæm/", th: "แยมหนึ่งกระปุก (30 ฿)" },
      { word: "A box of ice cream", phonetic: "/ə bɑːks əv aɪs kriːm/", th: "ไอศกรีมหนึ่งกล่อง (73 ฿)" },
      { word: "A cake", phonetic: "/ə keɪk/", th: "เค้กหนึ่งก้อน (85 ฿)" },
      { word: "A bottle of soft drink", phonetic: "/ə ˈbɑː.t̬əl əv sɑːft drɪŋk/", th: "น้ำอัดลมหนึ่งขวด (32 ฿)" },
      { word: "Change", phonetic: "/tʃeɪndʒ/", th: "เงินทอน" }
    ]
  }
];

