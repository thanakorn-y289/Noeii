/**
 * AI Dialogue & Feedback Engine
 * จัดการการโต้ตอบบทสนทนา ตรวจไวยากรณ์ คำแนะนำ และการแปล
 * (รองรับทั้ง Built-in Scenario Engine และเชื่อมต่อ Gemini API เสริม)
 */

class AIService {
  constructor() {
    this.geminiApiKey = localStorage.getItem('eng_practice_gemini_api_key') || '';
  }

  setGeminiApiKey(key) {
    this.geminiApiKey = (key || '').trim();
    if (this.geminiApiKey) {
      localStorage.setItem('eng_practice_gemini_api_key', this.geminiApiKey);
    } else {
      localStorage.removeItem('eng_practice_gemini_api_key');
    }
  }

  getGeminiApiKey() {
    return this.geminiApiKey;
  }

  /**
   * แปลประโยคภาษาอังกฤษเป็นภาษาไทยสำหรับบทสนทนาเด็กประถม
   */
  async translateToThai(englishText) {
    if (!englishText || !englishText.trim()) return "";
    const cleanText = englishText.trim();

    // 1. ลองใช้ Gemini API หากมี Key
    if (this.geminiApiKey) {
      try {
        const prompt = `Translate this English sentence to natural, polite Thai suitable for a primary school student dialogue (keep it friendly, e.g. ครับ/ค่ะ). Output ONLY the Thai translation text, nothing else:\n"${cleanText}"`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (translated) {
          return translated.trim().replace(/^"|"$/g, '');
        }
      } catch (e) {
        console.warn('Gemini translate error, falling back to public translation:', e);
      }
    }

    // 2. ใช้งาน MyMemory Translation API (ฟรี รวดเร็ว แม่นยำ)
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|th`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        return data.responseData.translatedText.trim();
      }
    } catch (e) {
      console.warn('MyMemory translate error:', e);
    }

    return "";
  }

  /**
   * ส่งข้อความของผู้ใช้และรับคำตอบของคู่สนทนา พร้อมคำแนะนำไวยากรณ์และการแปล
   */
  async generateReply(scenario, messageHistory, userMessage) {
    // หากมี Gemini API Key ให้ลองเรียกใช้ Gemini ก่อน
    if (this.geminiApiKey) {
      try {
        const geminiResult = await this.callGeminiApi(scenario, messageHistory, userMessage);
        if (geminiResult) return geminiResult;
      } catch (e) {
        console.warn('Gemini API call failed, falling back to built-in dialogue engine:', e);
      }
    }

    // Built-in Smart Dialogue Engine
    return this.generateBuiltinReply(scenario, messageHistory, userMessage);
  }

  /**
   * Built-in Dialogue Engine (ไม่ต้องใช้ API Key รันได้ทันทีและออฟไลน์)
   */
  generateBuiltinReply(scenario, history, userText) {
    const lower = userText.toLowerCase().trim();
    const turnCount = history.filter(m => m.sender === 'user').length;

    let partnerReply = "";
    let partnerReplyTh = "";
    let grammarFeedback = null;
    let suggestions = [];

    // ตรวจไวยากรณ์เบื้องต้น
    grammarFeedback = this.analyzeGrammar(userText);

    // ตรวจสอบว่าเป็น Custom Scenario ของคุณครู/ผู้ปกครอง หรือไม่
    if (scenario.isCustom) {
      const prompts = scenario.suggestedPrompts || [];
      const randPrompt = prompts.length > 0 ? prompts[Math.floor(Math.random() * prompts.length)] : "Tell me more!";
      partnerReply = `Yay! That is wonderful, superstar! ⭐ ${scenario.partnerName} loves talking with you! What would you like to say next?`;
      partnerReplyTh = `เย้! ยอดเยี่ยมมากคนเก่ง! ⭐ ${scenario.partnerName} ชอบคุยกับหนูมากเลย อยากพูดอะไรต่อดีจ๊ะ?`;
      suggestions = prompts.slice(0, 3);
      return { replyText: partnerReply, replyTextTh: partnerReplyTh, grammarFeedback, suggestedPrompts: suggestions };
    }

    // Scenario-specific contextual logic
    switch (scenario.id) {
      case 'cafe-order': {
        if (lower.includes('latte') || lower.includes('americano') || lower.includes('coffee') || lower.includes('tea') || lower.includes('cappuccino')) {
          if (lower.includes('oat') || lower.includes('sugar') || lower.includes('ice') || lower.includes('hot')) {
            partnerReply = "Got it! That sounds delicious. Would you like to pair that with any freshly baked croissants or muffins today?";
            partnerReplyTh = "รับทราบครับ! เครื่องดื่มน่าทานมากเลย วันนี้รับครัวซองต์หรือมัฟฟินอบสดใหม่ทานคู่กันไหมครับ?";
            suggestions = ["No thank you, just the drink.", "A chocolate croissant would be great!", "How much does that come to?"];
          } else {
            partnerReply = "Sure thing! What size would you prefer: small, medium, or large? And would you like that hot or iced?";
            partnerReplyTh = "ได้เลยครับ! รับขนาดไหนดีครับ เล็ก กลาง หรือใหญ่? และรับเป็นร้อนหรือเย็นดีครับ?";
            suggestions = ["Medium iced, please.", "Large hot with oat milk, please.", "Just a small hot one."];
          }
        } else if (lower.includes('croissant') || lower.includes('muffin') || lower.includes('pastry') || lower.includes('cake')) {
          partnerReply = "Excellent choice, I will heat that up for you right away. That will be $7.50 in total. How would you like to pay today?";
          partnerReplyTh = "เลือกได้เยี่ยมเลยครับ เดี๋ยวผมอุ่นร้อนให้นะครับ ทั้งหมด 7.50 ดอลลาร์ วันนี้ชำระเงินแบบไหนดีครับ?";
          suggestions = ["Can I pay with credit card / Apple Pay?", "Here is cash, keep the change.", "Do you take contactless payment?"];
        } else if (lower.includes('card') || lower.includes('cash') || lower.includes('pay') || lower.includes('apple pay') || lower.includes('dollar')) {
          partnerReply = "Payment approved! Here is your receipt. Your drink will be ready at the counter on your left in about two minutes. Have a wonderful day!";
          partnerReplyTh = "ชำระเงินเรียบร้อยครับ! นี่ใบเสร็จครับ เครื่องดื่มจะพร้อมที่เคาน์เตอร์ด้านซ้ายในอีก 2 นาที ขอให้เป็นวันที่ดีนะครับ!";
          suggestions = ["Thank you so much! Have a great day.", "Thanks Alex, see you next time!"];
        } else {
          partnerReply = "Certainly! Is there anything else I can add to your order, or are you ready for the total?";
          partnerReplyTh = "ยินดีครับ! มีอะไรรับเพิ่มอีกไหมครับ หรือพร้อมชำระเงินเลย?";
          suggestions = ["That will be all, thank you.", "Can I also get a bottle of water?", "Could I have the receipt, please?"];
        }
        break;
      }

      case 'hotel-checkin': {
        if (lower.includes('reservation') || lower.includes('book') || lower.includes('name')) {
          partnerReply = "Thank you! I found your booking. May I please see your ID or passport, and a credit card for the incidental deposit?";
          partnerReplyTh = "ขอบคุณค่ะ! พบข้อมูลการจองแล้ว ขออนุญาตขอดูบัตรประชาชนหรือพาสปอร์ต และบัตรเครดิตสำหรับมัดจำความเสียหายค่ะ";
          suggestions = ["Sure, here is my passport and credit card.", "Here you go.", "How much is the incidental deposit?"];
        } else if (lower.includes('view') || lower.includes('floor') || lower.includes('quiet') || lower.includes('upgrade')) {
          partnerReply = "I have a lovely quiet room on the 18th floor with a scenic city view! Breakfast is served from 6:30 to 10:00 AM on the 2nd floor. Here are your key cards.";
          partnerReplyTh = "ได้ห้องชั้น 18 เงียบสงบพร้อมวิวเมืองสวยงามค่ะ! อาหารเช้าเปิด 6:30 ถึง 10:00 น. ชั้น 2 นี่คีย์การ์ดค่ะ";
          suggestions = ["Thank you so much! What is the Wi-Fi password?", "Where is the elevator located?", "Can I request a late check-out?"];
        } else if (lower.includes('wifi') || lower.includes('internet') || lower.includes('password') || lower.includes('elevator')) {
          partnerReply = "The elevators are just past the lounge on your right. The Wi-Fi is free and the network name is 'HorizonGuest' with no password needed. Enjoy your stay!";
          partnerReplyTh = "ลิฟต์อยู่ถัดจากเลานจ์ด้านขวามือค่ะ ไวไฟฟรีใช้ชื่อ HorizonGuest ได้เลยโดยไม่ต้องใส่รหัสผ่าน ขอให้พักผ่อนอย่างมีความสุขนะคะ!";
          suggestions = ["Thank you for your help!", "Have a wonderful day."];
        } else {
          partnerReply = "Certainly! We also have a 24-hour gym and rooftop swimming pool on the top floor. Is there anything else you'd like to know?";
          partnerReplyTh = "ยินดีค่ะ ทางเรามีฟิตเนส 24 ชม. และสระว่ายน้ำบนดาดฟ้าชั้นบนสุดด้วยนะคะ มีอะไรสอบถามเพิ่มเติมไหมคะ?";
          suggestions = ["That's all for now, thank you!", "What time is checkout tomorrow?"];
        }
        break;
      }

      case 'airport-immigration': {
        if (lower.includes('tourist') || lower.includes('tourism') || lower.includes('vacation') || lower.includes('holiday') || lower.includes('visit')) {
          partnerReply = "Welcome. How long do you plan to stay in the country, and where will you be staying?";
          partnerReplyTh = "ยินดีต้อนรับครับ วางแผนจะพำนักอยู่ในประเทศนานแค่ไหน และจะพักที่ไหนครับ?";
          suggestions = ["I will be staying for 7 days at the Grand Horizon Hotel.", "Just for two weeks in Bangkok and Chiang Mai.", "I have a hotel booking confirmed."];
        } else if (lower.includes('day') || lower.includes('week') || lower.includes('hotel') || lower.includes('stay')) {
          partnerReply = "Do you have a confirmed return flight ticket back home? And do you have anything to declare to customs?";
          partnerReplyTh = "มีตั๋วเครื่องบินขากลับที่ยืนยันแล้วไหมครับ? และมีสิ่งของที่ต้องสำแดงต่อศุลกากรหรือไม่?";
          suggestions = ["Yes, here is my return ticket for next Sunday.", "No, I have nothing to declare.", "I have some gifts, but nothing taxable."];
        } else {
          partnerReply = "Everything looks in order. Please place your right thumb on the fingerprint scanner and look directly into the camera... Done! Enjoy your visit.";
          partnerReplyTh = "เอกสารเรียบร้อยครับ กรุณาวางนิ้วโป้งขวาบนเครื่องสแกนและมองกล้องครับ... เรียบร้อยครับ ขอให้เที่ยวให้สนุกครับ!";
          suggestions = ["Thank you very much, officer!", "Have a good day."];
        }
        break;
      }

      case 'job-interview': {
        if (lower.includes('experience') || lower.includes('background') || lower.includes('work') || lower.includes('degree') || lower.includes('years')) {
          partnerReply = "That's impressive experience. What would you say is your greatest technical or teamwork strength, and could you give a quick example?";
          partnerReplyTh = "เป็นประสบการณ์ที่น่าประทับใจครับ คุณคิดว่าอะไรคือจุดแข็งที่สุดด้านเทคนิคหรือการทำงานเป็นทีม และช่วยยกตัวอย่างสั้นๆ ได้ไหมครับ?";
          suggestions = ["My strength is problem-solving under tight deadlines.", "I excel at cross-functional communication and modern web technologies.", "I love mentoring junior colleagues."];
        } else if (lower.includes('strength') || lower.includes('problem') || lower.includes('learn') || lower.includes('team')) {
          partnerReply = "That's a very valuable skill for our team. Why are you interested in joining our company specifically?";
          partnerReplyTh = "นั่นเป็นทักษะที่มีค่ามากสำหรับทีมเราเลยครับ แล้วอะไรทำให้คุณสนใจอยากมาร่วมงานกับบริษัทเราโดยเฉพาะครับ?";
          suggestions = ["I really admire your commitment to user-centric innovation.", "Your company culture and rapid growth really resonate with my career goals.", "I want to take on new challenges with top-tier engineers."];
        } else {
          partnerReply = "Thank you for sharing your thoughts so clearly. Do you have any questions for me about the role, team, or our company culture?";
          partnerReplyTh = "ขอบคุณที่แบ่งปันมุมมองอย่างชัดเจนครับ คุณมีคำถามอะไรจะถามผมเกี่ยวกับตำแหน่งงาน ทีม หรือวัฒนธรรมองค์กรไหมครับ?";
          suggestions = ["What does a typical day look like in this role?", "What are the opportunities for career growth?", "How does the team handle new challenges?"];
        }
        break;
      }

      case 'casual-friends': {
        if (lower.includes('busy') || lower.includes('good') || lower.includes('great') || lower.includes('fine') || lower.includes('work')) {
          partnerReply = "I know the feeling! Work has been pretty hectic on my end too. Did you manage to catch any good shows or try any good food recently?";
          partnerReplyTh = "เข้าใจเลย! ทางนี้งานก็ยุ่งพอกันเลย ช่วงนี้ได้ดูซีรีส์เรื่องไหนสนุกๆ หรือไปลองกินอะไรอร่อยๆ มาบ้างไหม?";
          suggestions = ["I tried a great Thai restaurant downtown last week!", "I watched an awesome sci-fi movie over the weekend.", "Not much, just resting at home."];
        } else if (lower.includes('food') || lower.includes('restaurant') || lower.includes('movie') || lower.includes('weekend') || lower.includes('travel')) {
          partnerReply = "Oh that sounds fantastic! We should definitely plan a hangout together soon. Are you free next weekend for coffee or brunch?";
          partnerReplyTh = "โอ้ ฟังดูเยี่ยมมากเลย! เราน่าจะนัดเจอกันเร็วๆ นี้นะ วันหยุดสุดสัปดาห์หน้าว่างไปกินกาแฟหรือบรันช์ด้วยกันไหม?";
          suggestions = ["Sounds like a plan! Saturday morning works great for me.", "I'd love that, let's keep in touch!", "Let me check my calendar and text you."];
        } else {
          partnerReply = "Haha, totally agree with you! It's always so nice catching up with you. Let's make sure we chat more often!";
          partnerReplyTh = "ฮ่าๆ เห็นด้วยเลย! ได้คุยอัปเดตกันแบบนี้ดีจัง ไว้คุยกันบ่อยๆ นะ!";
          suggestions = ["Definitely! Take care and talk soon.", "Same here, enjoy the rest of your day!"];
        }
        break;
      }

      case 'doctor-visit': {
        if (lower.includes('throat') || lower.includes('fever') || lower.includes('headache') || lower.includes('pain') || lower.includes('cough')) {
          partnerReply = "I see. Let me check your temperature and have a look at your throat. Have you taken any over-the-counter medicine yet, or do you have any drug allergies?";
          partnerReplyTh = "เข้าใจแล้วครับ ขอวัดไข้และตรวจดูในลำคอหน่อยนะครับ ก่อนหน้านี้ได้ทานยาอะไรมาบ้างหรือยัง และมีประวัติแพ้ยาไหมครับ?";
          suggestions = ["I took some paracetamol yesterday.", "No known drug allergies.", "I haven't taken any medicine yet."];
        } else {
          partnerReply = "It appears to be a mild viral infection. I will prescribe some fever reducers and throat lozenges. Drink plenty of warm water, get lots of rest, and you should feel better in 2-3 days.";
          partnerReplyTh = "ดูเหมือนจะเป็นการติดเชื้อไวรัสไข้หวัดทั่วไปครับ หมอจะสั่งยาลดไข้และยาอมแก้เจ็บคอให้ ดื่มน้ำอุ่นมากๆ พักผ่อนให้เพียงพอ อาการจะดีขึ้นใน 2-3 วันครับ";
          suggestions = ["Thank you, doctor! Should I take them after meals?", "Do I need a medical certificate for work?", "Thank you for the advice."];
        }
        break;
      }

      case 'ice-cream-shop': {
        if (lower.includes('chocolate') || lower.includes('vanilla') || lower.includes('strawberry') || lower.includes('flavor')) {
          partnerReply = "Yum! That is my favorite too! Would you like that in a crunchy waffle cone or a little cup?";
          partnerReplyTh = "ว้าว! รสนั้นอร่อยที่สุดเลย! อยากใส่โคนวาฟเฟิลกรุบกรอบ หรือใส่ถ้วยน่ารักๆ ดีจ๊ะ?";
          suggestions = ["In a waffle cone, please!", "In a cup with a spoon, please!", "Can I get two scoops?"];
        } else if (lower.includes('cone') || lower.includes('cup') || lower.includes('scoop')) {
          partnerReply = "Great choice! Do you want rainbow sprinkles, chocolate chips, or sweet cherries on top?";
          partnerReplyTh = "เลือกได้ยอดเยี่ยมมาก! อยากโรยเกล็ดน้ำตาลสายรุ้ง ช็อกโกแลตชิป หรือเชอร์รีหวานๆ ด้านบนไหมเอ่ย?";
          suggestions = ["Rainbow sprinkles, please!", "Lots of chocolate chips!", "Extra cherries on top!"];
        } else {
          partnerReply = "Here is your super yummy ice cream! Enjoy your sweet treat, superstar!";
          partnerReplyTh = "นี่จ้าไอศกรีมแสนอร่อย ทานให้อร่อยนะคนเก่ง!";
          suggestions = ["Thank you so much!", "It looks so delicious!", "Yum yum, thank you!"];
        }
        break;
      }

      case 'cute-puppy': {
        if (lower.includes('ball') || lower.includes('fetch') || lower.includes('catch') || lower.includes('throw')) {
          partnerReply = "Woof! Woof! *wags tail happily* I caught the ball! Throw it high into the sky again!";
          partnerReplyTh = "โฮ่งๆ! *กระดิกหางอย่างร่าเริง* บัดดี้คาบลูกบอลได้แล้ว! ปาขึ้นไปบนฟ้าสูงๆ อีกรอบสิ!";
          suggestions = ["Good boy, Buddy!", "Catch it again!", "Run fast, Buddy!"];
        } else if (lower.includes('good boy') || lower.includes('cute') || lower.includes('love') || lower.includes('hug')) {
          partnerReply = "*happy barking* Buddy loves you so much! Can we run around the green grass together?";
          partnerReplyTh = "*เห่าเสียงใส* บัดดี้ก็รักเธอเหมือนกัน! ไปวิ่งเล่นรอบสนามหญ้าสีเขียวด้วยกันไหม?";
          suggestions = ["Yes, let's run together!", "You are my best furry friend!", "Sit down, Buddy!"];
        } else {
          partnerReply = "Woof! Playing with you is the most fun ever! Let's do it again!";
          partnerReplyTh = "โฮ่ง! เล่นกับเธอสนุกที่สุดในโลกเลย! ไว้มาเล่นกันอีกนะ!";
          suggestions = ["Bye bye, Buddy! See you tomorrow!", "You are the best puppy!"];
        }
        break;
      }

      case 'school-friends': {
        if (lower.includes('blue') || lower.includes('pink') || lower.includes('yellow') || lower.includes('green') || lower.includes('color')) {
          partnerReply = "Oh, that is such a pretty color! Let's color this big cute elephant together. What subject do you like most at school?";
          partnerReplyTh = "โอ้โห สีสวยจังเลย! มาระบายสีน้องช้างตัวใหญ่ด้วยกันนะ แล้วที่โรงเรียนชอบเรียนวิชาอะไรที่สุดเหรอ?";
          suggestions = ["I love Art and drawing!", "I like English and singing songs!", "My favorite is PE and sports!"];
        } else if (lower.includes('art') || lower.includes('english') || lower.includes('math') || lower.includes('music')) {
          partnerReply = "That is so cool! You are super smart! Can we share coloring pencils during recess?";
          partnerReplyTh = "เจ๋งสุดๆ ไปเลย! เธอเก่งมากๆ เลยนะเนี่ย! ตอนพักเที่ยงเรามาแบ่งสีไม้กันระบายนะ?";
          suggestions = ["Yes! Here is my yellow pencil.", "Let's draw together!", "You are a great friend!"];
        } else {
          partnerReply = "School is so much fun when we learn and play together! High five, friend!";
          partnerReplyTh = "ไปโรงเรียนสนุกจังเลยเวลาได้เรียนและเล่นด้วยกัน แปะมือกันหน่อยเพื่อนรัก!";
          suggestions = ["High five!", "See you in class!"];
        }
        break;
      }

      case 'space-adventure': {
        if (lower.includes('moon') || lower.includes('mars') || lower.includes('planet') || lower.includes('star')) {
          partnerReply = "Beep-boop! Engines ready! 3... 2... 1... Blast off! Look out the window, what do you see floating in space?";
          partnerReplyTh = "บี๊บ-บู๊บ! เครื่องยนต์พร้อม! 3... 2... 1... พุ่งตัวสู่ยาน! มองออกไปนอกหน้าต่างสิ เห็นอะไรลอยอยู่ในอวกาศบ้าง?";
          suggestions = ["I see the bright shining Moon!", "Look at that colorful nebula!", "There is a funny alien waving at us!"];
        } else if (lower.includes('alien') || lower.includes('rocket') || lower.includes('fly')) {
          partnerReply = "Beep! That is an alien saying hello from planet Zog! Should we wave our hands back and say hi?";
          partnerReplyTh = "บี๊บ! นั่นคือเอเลี่ยนกำลังโบกมือทักทายจากดาวซ็อก! เราโบกมือและกล่าวทักทายเขากลับดีไหม?";
          suggestions = ["Hello friendly alien!", "We come in peace!", "Welcome to our rocket!"];
        } else {
          partnerReply = "Mission accomplished, brave Astronaut! We explored the galaxy together. Ready to head back to Earth?";
          partnerReplyTh = "ภารกิจสำเร็จแล้ว นักบินอวกาศผู้กล้าหาญ! เราสำรวจดาราจักรด้วยกัน พร้อมบินกลับสู่โลกหรือยัง?";
          suggestions = ["Yes, let's fly back home!", "That was an epic adventure, Robi!"];
        }
        break;
      }

      case 'zoo-animals': {
        if (lower.includes('giraffe') || lower.includes('lion') || lower.includes('elephant') || lower.includes('monkey') || lower.includes('animal')) {
          partnerReply = "Look at them! Did you hear that sound? The baby elephant is splashing water with its long trunk! Isn't that funny?";
          partnerReplyTh = "ดูนั่นสิ! ได้ยินเสียงนั้นไหม? ลูกช้างกำลังพ่นน้ำเล่นด้วยงวงยาวๆ น่ารักและตลกจังเลยเนอะ?";
          suggestions = ["Haha! That is so funny!", "Look at the playful monkeys jumping!", "Can we feed the giraffes?"];
        } else {
          partnerReply = "The animals love visiting with you today! Which animal was your absolute favorite?";
          partnerReplyTh = "พวกสัตว์ทั้งหลายดีใจมากเลยที่ได้เจอเธอวันนี้! ชอบสัตว์ตัวไหนมากที่สุดเอ่ย?";
          suggestions = ["My favorite is the tall giraffe!", "I loved the cute baby elephant!", "The roaring lion was amazing!"];
        }
        break;
      }

      case 'pizza-party': {
        if (lower.includes('cheese') || lower.includes('sausage') || lower.includes('mushroom') || lower.includes('pepperoni')) {
          partnerReply = "Mmm! Chef Po is tossing the dough into the air! Wooosh! Let's put our pizza into the hot oven. How many slices should we cut?";
          partnerReplyTh = "อื้มมม! เชฟโปกำลังโยนแป้งพิซซ่าขึ้นฟ้า ฟิ้ววว! เอาพิซซ่าเข้าเตาอบกันดีกว่า จะตัดแบ่งเป็นกี่ชิ้นดีเอ่ย?";
          suggestions = ["Please cut it into 8 slices!", "4 big slices for us!", "Can I have the biggest slice?"];
        } else {
          partnerReply = "Ding! The pizza is golden, hot, and melted! Time for our pizza party! Dig in, little chef!";
          partnerReplyTh = "ปิ๊ง! พิซซ่าอบเสร็จแล้ว หอมกรุ่น ชีสยืดเยิ้ม! ได้เวลาปาร์ตี้พิซซ่าแล้ว ลุยเลยเชฟตัวน้อย!";
          suggestions = ["This is the best pizza ever!", "Thank you Chef Po!", "Delicious!"];
        }
        break;
      }

      default: { // Free talk
        partnerReply = `That's an interesting point! You mentioned "${userText.slice(0, 35)}...". Could you elaborate a bit more on what inspired your perspective?`;
        partnerReplyTh = `เป็นประเด็นที่น่าสนใจครับ! คุณกล่าวถึงเรื่องนี้ อยากให้ลองอธิบายขยายความเพิ่มเติมอีกนิดได้ไหมครับ?`;
        suggestions = ["Let me explain in more detail...", "What do you think about that?", "In my opinion, it makes a big difference."];
        break;
      }
    }

    return {
      replyText: partnerReply,
      replyTextTh: partnerReplyTh,
      grammarFeedback,
      suggestedPrompts: suggestions
    };
  }

  /**
   * ตรวจสอบไวยากรณ์และให้คำแนะนำแบบ Real-time
   */
  analyzeGrammar(text) {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const lower = trimmed.toLowerCase();
    const suggestions = [];

    // Simple common mistake detectors for Thai English learners
    if (/\bi go to\b/i.test(trimmed) && (lower.includes('yesterday') || lower.includes('last week') || lower.includes('ago'))) {
      suggestions.push({
        issue: "Past tense used with present verb",
        original: "I go to...",
        better: "I went to...",
        explanation: "เมื่อพูดถึงเหตุการณ์ในอดีต (yesterday/last week) ให้เปลี่ยนกริยาเป็นรูป Past Simple (went)"
      });
    }

    if (/\bi am agree\b/i.test(trimmed)) {
      suggestions.push({
        issue: "Common error: 'I am agree'",
        original: "I am agree",
        better: "I agree",
        explanation: "'agree' เป็นคำกริยา (Verb) อยู่แล้ว ไม่ต้องใส่ Verb to be (am) ข้างหน้า"
      });
    }

    if (/\bdelicious much\b/i.test(trimmed) || /\bvery much delicious\b/i.test(trimmed)) {
      suggestions.push({
        issue: "Word order",
        original: "delicious much",
        better: "very delicious / so delicious",
        explanation: "ใช้ 'very delicious' หรือ 'really delicious' แทน"
      });
    }

    if (/\bhe don't\b/i.test(trimmed) || /\bshe don't\b/i.test(trimmed) || /\bit don't\b/i.test(trimmed)) {
      suggestions.push({
        issue: "Subject-verb agreement",
        original: "he/she don't",
        better: "he/she doesn't",
        explanation: "ประธานเอกพจน์ (He/She/It) ต้องใช้กริยาปฏิเสธเป็น 'doesn't'"
      });
    }

    if (suggestions.length > 0) {
      return {
        status: 'has_suggestion',
        items: suggestions
      };
    }

    // Positive reinforcement if no glaring mistakes
    if (trimmed.split(' ').length >= 4) {
      return {
        status: 'great',
        items: [{
          issue: "Natural sentence structure!",
          original: trimmed,
          better: trimmed,
          explanation: "รูปประโยคชัดเจน สื่อสารได้คล่องแคล่วและเป็นธรรมชาติมากครับ"
        }]
      };
    }

    return null;
  }

  /**
   * เรียก Google Gemini API (ถ้าผู้ใช้ใส่ API Key ไว้)
   */
  async callGeminiApi(scenario, history, userText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

    const systemPrompt = `You are playing the role of ${scenario.partnerName}, a ${scenario.partnerRole} in an English conversation practice app for English learners.
Scenario: ${scenario.title}.
Your goal: Help the user practice natural English speaking. Respond conversationally in natural English (keep responses concise, around 2-3 sentences), ask engaging follow-ups, and provide a Thai translation of your response.
Also analyze the user's sentence for grammar improvements or more natural native phrasings.

Output must strictly be valid JSON format matching this schema:
{
  "replyText": "your English response here",
  "replyTextTh": "คำแปลไทยของคำตอบของคุณ",
  "grammarTip": "คำแนะนำสั้นๆ ถ้าประโยคของผู้ใช้สามารถพูดให้เป็นธรรมชาติขึ้นได้ หรือคำชมถ้าดีอยู่แล้ว",
  "suggestedPrompts": ["ทางเลือกประโยคที่ผู้เรียนสามารถพูดตอบกลับได้ 1", "ทางเลือก 2", "ทางเลือก 3"]
}`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] }
    ];

    // History
    history.slice(-6).forEach(m => {
      contents.push({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      });
    });

    contents.push({
      role: 'user',
      parts: [{ text: userText }]
    });

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      })
    });

    if (!resp.ok) {
      throw new Error(`Gemini API error: ${resp.status}`);
    }

    const data = await resp.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed = JSON.parse(rawText);
      return {
        replyText: parsed.replyText,
        replyTextTh: parsed.replyTextTh,
        grammarFeedback: parsed.grammarTip ? {
          status: 'has_suggestion',
          items: [{
            issue: 'AI Coach Feedback',
            original: userText,
            better: '',
            explanation: parsed.grammarTip
          }]
        } : null,
        suggestedPrompts: parsed.suggestedPrompts || []
      };
    }
    return null;
  }
}

export const aiService = new AIService();
