/**
 * Scenarios Data for Kids English Practice (ประถม ป.1 - ป.6)
 * สถานการณ์จำลองสำหรับการฝึกพูดภาษาอังกฤษสำหรับเด็กประถม
 */

export const SCENARIOS = [
  {
    id: 'ice-cream-shop',
    title: 'Ice Cream & Sweet Shop',
    titleTh: 'ร้านไอศกรีมแสนอร่อย 🍦',
    level: 'ประถม 1 - 3',
    category: 'Food & Sweets',
    icon: '🍦',
    partnerRole: 'Ice Cream Maker',
    partnerName: 'Mimi',
    partnerAvatar: '🐻',
    description: 'Order your favorite ice cream flavors, cones, and yummy toppings!',
    descriptionTh: 'ฝึกสั่งไอศกรีมรสโปรด เลือกรสช็อกโกแลต วานิลลา หรือสตรอว์เบอร์รี พร้อมท็อปปิ้ง',
    initialMessage: "Yummy! Welcome to Sweet Bear Ice Cream! What flavor would you like today?",
    initialMessageTh: "ยินดีต้อนรับสู่ร้านไอศกรีมพี่หมีมีมี่จ้า! วันนี้อยากทานไอศกรีมรสอะไรดีเอ่ย?",
    learningGoals: [
      "Say favorite ice cream flavors (Chocolate, Vanilla, Strawberry)",
      "Choose a cup or a cone",
      "Ask for toppings like sprinkles or chocolate sauce"
    ],
    suggestedPrompts: [
      "I want chocolate ice cream, please!",
      "Can I have strawberry in a waffle cone?",
      "Please add rainbow sprinkles on top!",
      "Thank you, it looks super delicious!"
    ],
    vocabularyList: [
      { word: "Flavor", phonetic: "/ˈfleɪ.vɚ/", th: "รสชาติ" },
      { word: "Cone", phonetic: "/koʊn/", th: "โคนไอศกรีม" },
      { word: "Sprinkles", phonetic: "/ˈsprɪŋ.kəlz/", th: "เกล็ดน้ำตาลสายรุ้ง" },
      { word: "Delicious", phonetic: "/dɪˈlɪʃ.əs/", th: "อร่อยมากๆ" }
    ]
  },
  {
    id: 'cute-puppy',
    title: 'Play with Buddy the Puppy',
    titleTh: 'เล่นกับน้องหมาบัดดี้ 🐶',
    level: 'ประถม 1 - 3',
    category: 'Pets & Animals',
    icon: '🐶',
    partnerRole: 'Playful Dog',
    partnerName: 'Buddy',
    partnerAvatar: '🐶',
    description: 'Talk with Buddy, play fetch, and learn how to describe animals and pets.',
    descriptionTh: 'คุยเล่นกับเจ้าตูบบัดดี้ ชวนเล่นลูกบอล และบอกสิ่งที่ชอบทำกับสัตว์เลี้ยง',
    initialMessage: "Woof woof! Hello friend! My name is Buddy. Do you want to play with my red ball?",
    initialMessageTh: "โฮ่งๆ! สวัสดีครับเพื่อนใหม่! ผมชื่อบัดดี้ อยากมาเล่นลูกบอลสีแดงด้วยกันไหม?",
    learningGoals: [
      "Say greetings and introduce yourself to a pet",
      "Describe actions like throw the ball, run, and jump",
      "Express love for pets"
    ],
    suggestedPrompts: [
      "Hello Buddy! You are such a good boy!",
      "Catch the ball, Buddy!",
      "I love dogs and cute puppies!",
      "Let's run around the garden together!"
    ],
    vocabularyList: [
      { word: "Puppy", phonetic: "/ˈpʌp.i/", th: "ลูกสุนัข" },
      { word: "Fetch", phonetic: "/fetʃ/", th: "คาบของกลับมา" },
      { word: "Tail", phonetic: "/teɪl/", th: "หาง" },
      { word: "Catch", phonetic: "/kætʃ/", th: "จับ / รับลูกบอล" }
    ]
  },
  {
    id: 'school-friends',
    title: 'Fun in the Classroom',
    titleTh: 'ห้องเรียนแสนสนุกกับเพื่อนๆ 🏫',
    level: 'ประถม 1 - 3',
    category: 'School & Friends',
    icon: '🏫',
    partnerRole: 'Classmate',
    partnerName: 'Leo',
    partnerAvatar: '🦁',
    description: 'Chat with your classmate about favorite colors, coloring, and fun school subjects.',
    descriptionTh: 'คุยกับเพื่อนร่วมชั้นเรื่องวิชาที่ชอบ สีโปรด และการวาดรูประบายสี',
    initialMessage: "Hi there! I am drawing a big rainbow. What is your favorite color?",
    initialMessageTh: "สวัสดีจ้า! เรากำลังวาดรูปสายรุ้งอันใหญ่อยู่ เธอชอบสีอะไรที่สุดเหรอ?",
    learningGoals: [
      "Name basic colors (Blue, Pink, Green, Yellow)",
      "Talk about favorite subjects like Art, Music, English",
      "Share coloring pencils with friends"
    ],
    suggestedPrompts: [
      "My favorite color is bright blue!",
      "I really love art and drawing animals.",
      "Can I borrow your yellow crayon, please?",
      "Your drawing looks so pretty!"
    ],
    vocabularyList: [
      { word: "Rainbow", phonetic: "/ˈreɪn.boʊ/", th: "สายรุ้ง" },
      { word: "Crayon", phonetic: "/ˈkreɪ.ɑːn/", th: "สีเทียน" },
      { word: "Borrow", phonetic: "/ˈbɑːr.oʊ/", th: "ขอยืม" },
      { word: "Subject", phonetic: "/ˈsʌb.dʒɪkt/", th: "วิชาเรียน" }
    ]
  },
  {
    id: 'space-adventure',
    title: 'Space Adventure with Robi',
    titleTh: 'ท่องอวกาศกับหุ่นยนต์โรบี้ 🚀',
    level: 'ประถม 4 - 6',
    category: 'Science & Fantasy',
    icon: '🚀',
    partnerRole: 'Space Robot',
    partnerName: 'Robi',
    partnerAvatar: '🤖',
    description: 'Fly a rocket ship, explore planets, and count the shining stars in space.',
    descriptionTh: 'ขับยานอวกาศ สำรวจดวงจันทร์และดวงดาวไปกับหุ่นยนต์โรบี้',
    initialMessage: "Beep-boop! Astronaut, welcome aboard Rocket-99! Which planet shall we visit first today?",
    initialMessageTh: "บี๊บ-บู๊บ! ยินดีต้อนรับนักบินอวกาศขึ้นสู่ยานร็อคเก็ต-99! วันนี้เราจะบินไปสำรวจดาวดวงไหนดีครับ?",
    learningGoals: [
      "Learn space vocabulary: Planet, Moon, Stars, Rocket",
      "Practice directions and flying commands",
      "Describe what you see in the sky"
    ],
    suggestedPrompts: [
      "Let's fly to the Moon and see the craters!",
      "Look at that shining shooting star!",
      "Is that planet Mars? It is so red!",
      "Full speed ahead, Robi!"
    ],
    vocabularyList: [
      { word: "Astronaut", phonetic: "/ˈæs.trə.nɑːt/", th: "นักบินอวกาศ" },
      { word: "Planet", phonetic: "/ˈplæn.ɪt/", th: "ดาวเคราะห์" },
      { word: "Rocket", phonetic: "/ˈrɑː.kɪt/", th: "จรวด / ยานอวกาศ" },
      { word: "Crater", phonetic: "/ˈkreɪ.t̬ɚ/", th: "หลุมอุกกาบาต" }
    ]
  },
  {
    id: 'zoo-animals',
    title: 'Safari Zoo Explorer',
    titleTh: 'สำรวจสวนสัตว์และสัตว์ป่าน่ารัก 🦁',
    level: 'ประถม 1 - 3',
    category: 'Nature & Wildlife',
    icon: '🦁',
    partnerRole: 'Zoo Guide',
    partnerName: 'Zookeeper Dan',
    partnerAvatar: '🦒',
    description: 'Meet friendly giraffes, roaring lions, and playful monkeys at the safari zoo.',
    descriptionTh: 'พบกับพี่ยีราฟคอยาว เจ้าลิงจอมซน และสิงโตเจ้าป่า พร้อมฝึกบอกชื่อสัตว์',
    initialMessage: "Welcome to the Safari Zoo! Look to your left, there is a giant giraffe eating green leaves. Can you see it?",
    initialMessageTh: "ยินดีต้อนรับสู่สวนสัตว์ซาฟารีครับ! มองไปทางซ้ายสิ มียีราฟตัวใหญ่กำลังกินใบไม้อยู่ เห็นไหมครับ?",
    learningGoals: [
      "Identify common animals (Giraffe, Monkey, Elephant, Lion)",
      "Describe animal sizes and colors",
      "Learn simple animal action words (jump, eat, roar)"
    ],
    suggestedPrompts: [
      "Yes! The giraffe has such a long neck!",
      "Where are the funny monkeys?",
      "Can we go see the baby elephant next?",
      "The lion is roaring so loud!"
    ],
    vocabularyList: [
      { word: "Giraffe", phonetic: "/dʒɪˈræf/", th: "ยีราฟ" },
      { word: "Elephant", phonetic: "/ˈel.ə.fənt/", th: "ช้าง" },
      { word: "Roar", phonetic: "/rɔːr/", th: "คำราม" },
      { word: "Zookeeper", phonetic: "/ˈzuːˌkiː.pɚ/", th: "เจ้าหน้าที่ดูแลสวนสัตว์" }
    ]
  },
  {
    id: 'pizza-party',
    title: 'Pizza Party with Friends',
    titleTh: 'ปาร์ตี้พิซซ่าถาดโปรด 🍕',
    level: 'ประถม 1 - 3',
    category: 'Food & Fun',
    icon: '🍕',
    partnerRole: 'Chef Panda',
    partnerName: 'Chef Po',
    partnerAvatar: '🐼',
    description: 'Make your dream pizza with extra cheese, sausages, and mushrooms.',
    descriptionTh: 'เลือกหน้าพิซซ่า เพิ่มชีส ไส้กรอก และเห็ด สำหรับปาร์ตี้กับเพื่อนๆ',
    initialMessage: "Hello little chef! I'm Chef Po. Let's make a giant pizza together! What toppings do you want on our pizza?",
    initialMessageTh: "สวัสดีเชฟตัวน้อย! ลุงเชฟโปเอง มาช่วยกันแต่งหน้าพิซซ่ายักษ์กัน อยากใส่หน้าอะไรลงไปดีจ๊ะ?",
    learningGoals: [
      "Name favorite foods and toppings (Cheese, Sausage, Tomato, Mushroom)",
      "Ask for more toppings (extra cheese, please!)",
      "Count pizza slices (1, 2, 3, 4 slices)"
    ],
    suggestedPrompts: [
      "Lots of extra melted cheese, please!",
      "Can we put tasty sausages and mushrooms?",
      "Let's cut the pizza into 8 slices!",
      "I cannot wait to eat it with my friends!"
    ],
    vocabularyList: [
      { word: "Cheese", phonetic: "/tʃiːz/", th: "ชีส" },
      { word: "Slice", phonetic: "/slaɪs/", th: "ชิ้น (พิซซ่า)" },
      { word: "Topping", phonetic: "/ˈtɑː.pɪŋ/", th: "เครื่องหน้าพิซซ่า" },
      { word: "Melted", phonetic: "/ˈmel.t̬ɪd/", th: "ที่ละลายเยิ้มๆ" }
    ]
  },
  {
    id: 'free-talk',
    title: 'Chat with Nova (Friendly AI)',
    titleTh: 'คุยอิสระกับพี่หุ่นยนต์โนวา 🤖',
    level: 'ทุกระดับชั้น',
    category: 'Free Style',
    icon: '💬',
    partnerRole: 'Friendly AI Robot',
    partnerName: 'Nova',
    partnerAvatar: '🤖',
    description: 'Talk freely about school, favorite cartoons, superheroes, or your hobbies!',
    descriptionTh: 'คุยอะไรก็ได้ตามใจชอบ เล่าเรื่องการ์ตูนโปรด ซูเปอร์ฮีโร่ หรือของเล่นที่ชอบ',
    initialMessage: "Hello superstar! I'm Nova, your friendly English buddy. What exciting things did you do today?",
    initialMessageTh: "สวัสดีจ้าคนเก่ง! พี่โนวาเอง วันนี้มีเรื่องสนุกๆ อะไรมาเล่าให้ฟังบ้างเอ่ย?",
    learningGoals: [
      "Express feelings (happy, excited, proud)",
      "Talk about favorite toys, games, and cartoons",
      "Practice speaking full sentences with confidence"
    ],
    suggestedPrompts: [
      "I played games with my friends today!",
      "My favorite superhero is Spider-Man!",
      "Can you teach me a cool English word?",
      "I am so happy to practice English with you!"
    ],
    vocabularyList: [
      { word: "Superstar", phonetic: "/ˈsuː.pɚ.stɑːr/", th: "คนเก่ง / ซูเปอร์สตาร์" },
      { word: "Exciting", phonetic: "/ɪkˈsaɪ.t̬ɪŋ/", th: "น่าตื่นเต้น" },
      { word: "Superhero", phonetic: "/ˈsuː.pɚˌhɪr.oʊ/", th: "ซูเปอร์ฮีโร่" },
      { word: "Practice", phonetic: "/ˈpræk.tɪs/", th: "ฝึกฝน" }
    ]
  }
];
