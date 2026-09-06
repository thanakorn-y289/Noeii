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
  }
];
