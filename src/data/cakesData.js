export const BUSINESS_INFO = {
  name: "Lany Cake Shop",
  legalName: "CJ Cakes & Confectionery",
  tagline: "Good food For your all day good mood",
  subtagline: "Your Go-To Cake Shop in Nairobi for Stunning Custom Cakes & Sweet Treats",
  phone: "+254758582215",
  phoneFormatted: "+254 758 582 215",
  phoneLocal: "0758 582 215",
  email: "hello@lanycakes.co.ke",
  inquiriesEmail: "inquiries@lanycakes.co.ke",
  address: "Kamakis, Eastern Bypass, Ruiru, Kenya",
  city: "Nairobi",
  country: "Kenya",
  openingHours: "10:00 AM - 9:00 PM (Monday - Sunday)",
  whatsapp: "254758582215",
  whatsappUrl: "https://wa.me/254758582215?text=Hello%20Lany%20Cakes%2C%20I%20would%20like%20to%20order%20a%20cake",
  ceo: {
    name: "Carol Jenny",
    title: "Founder & Creative Director",
    image: "/images/lany/cj-cakes.webp",
    signature: "/images/lany/signature.png",
    bio: "The journey of CJ Cakes began with a passionate lady who believes baking is more than just a skill, it is an art. What started as a simple love for creating cakes soon grew into a mission to bring joy and beauty to every celebration in Nairobi and beyond."
  },
  stats: [
    { label: "Years of Crafting Joy", value: "5+" },
    { label: "Cake Variations & Designs", value: "500+" },
    { label: "Verified Client Rating", value: "4.9 / 5" },
    { label: "Fresh Daily Bakes", value: "100%" }
  ],
  socials: {
    instagram: "https://instagram.com/lanycakeshop",
    facebook: "https://facebook.com/lanycakeshop",
    twitter: "https://x.com/lanycakeshop",
    tiktok: "https://tiktok.com/@lanycakeshop"
  }
};

export const CAKE_FLAVORS = [
  { id: "vanilla", name: "Classic Vanilla Velvet", desc: "Light, fluffy sponge infused with pure Madagascar vanilla extract." },
  { id: "chocolate", name: "Decadent Belgian Chocolate Fudge", desc: "Rich moist chocolate cake layered with silky dark chocolate ganache." },
  { id: "red-velvet", name: "Royal Red Velvet", desc: "Classic cocoa hint with tangy, rich cream cheese frosting." },
  { id: "passion", name: "Tropical Passion Fruit", desc: "Zesty Kenyan passion fruit curd paired with sweet buttercream." },
  { id: "black-forest", name: "Authentic Black Forest", desc: "Kirsch-scented chocolate sponge, sweet cherries, and whipped cream." },
  { id: "salted-caramel", name: "Salted Caramel Butterscotch", desc: "Caramel sponge drizzled with handcrafted sea-salt caramel sauce." },
  { id: "blueberry", name: "Lemon Blueberry Dream", desc: "Bright citrus sponge folded with sweet whole blueberries." },
  { id: "carrot-walnut", name: "Spiced Carrot & Toasted Walnut", desc: "Tender spiced sponge with freshly grated carrots and cream cheese frosting." }
];

export const CAKE_FILLINGS = [
  { id: "swiss-buttercream", name: "Silky Swiss Meringue Buttercream", desc: "Light, velvety, and balanced sweetness." },
  { id: "belgian-ganache", name: "Belgian Couverture Chocolate Ganache", desc: "Intense, decadent molten dark chocolate." },
  { id: "passion-curd", name: "Tangy Kenyan Passion Curd", desc: "Fresh zesty tropical brightness." },
  { id: "salted-caramel", name: "Artisanal Sea-Salt Caramel", desc: "Rich golden butterscotch swirl." },
  { id: "raspberry-compote", name: "Wild Raspberry Compote", desc: "Slow-simmered whole berry preserve." }
];

export const CAKE_DESIGNS = [
  { id: "signature", name: "Signature Bakery Design (As Pictured)", desc: "Handcrafted exactly as displayed in the artisanal bakery collection." },
  { id: "smooth-buttercream", name: "Silky Smooth Buttercream Finish", desc: "Modern sharp edges and velvety finish." },
  { id: "textured-ruffles", name: "Textured Ribbons & Ruffles", desc: "Artistic palette knife sculptured strokes." },
  { id: "semi-naked", name: "Rustic Semi-Naked Crumb", desc: "Subtle glimpse of inner golden sponge." },
  { id: "royal-fondant", name: "Flawless Rolled Fondant", desc: "Smooth porcelain-like luxury drape." },
  { id: "floral-berries", name: "Fresh Floral & Berries Accent", desc: "Decorated with edible flowers and fresh berries." }
];

export const CAKE_ICINGS = CAKE_DESIGNS;

export const CAKE_EXTRAS = [
  { id: "candles", key: "candles", name: "Sparkler Birthday Candles (Pack of 2)", price: 200 },
  { id: "acrylicTopper", key: "acrylicTopper", name: "Mirror Gold Acrylic Cake Topper", price: 500 },
  { id: "goldLeaf", key: "goldLeaf", name: "24K Edible Gold Leaf Accents", price: 300 },
  { id: "berryCrown", key: "berryCrown", name: "Fresh Seasonal Berry & Herb Crown", price: 400 },
  { id: "luxuryPackaging", key: "luxuryPackaging", name: "Luxury Keepsake Gift Box & Ribbon", price: 400 }
];

export const DELIVERY_ZONES = [
  { id: "pickup", name: "Studio Collection (Lany Studio, Kamakis Eastern Bypass)", fee: 0, tag: "Free Pickup" },
  { id: "ruiru", name: "Ruiru / Kamakis / Membley", fee: 300, tag: "KSh 300" },
  { id: "thika_road", name: "Thika Road / Roysambu / Kasarani", fee: 300, tag: "KSh 300" },
  { id: "cbd", name: "Nairobi CBD & Upper Hill", fee: 300, tag: "KSh 300" },
  { id: "westlands_kilimani", name: "Westlands / Kilimani / Lavington", fee: 350, tag: "KSh 350" },
  { id: "karen_langata", name: "Karen / Lang'ata / Hardy", fee: 500, tag: "KSh 500" },
  { id: "runda_muthaiga", name: "Runda / Muthaiga / Gigiri / Nyari", fee: 450, tag: "KSh 450" },
  { id: "other_nairobi", name: "Other Nairobi Estates & Environs", fee: 400, tag: "KSh 400" }
];

export const DELIVERY_SLOTS = [
  { id: "morning", label: "Morning Slot (9:00 AM – 12:00 PM)" },
  { id: "afternoon", label: "Afternoon Slot (1:00 PM – 4:00 PM)" },
  { id: "evening", label: "Evening Slot (5:00 PM – 8:00 PM)" }
];


export const CAKE_CATEGORIES = [
  {
    id: "bento",
    slug: "bento-cakes",
    name: "Bento Cakes",
    description: "Cute Korean-style lunchbox & bento cakes starting from KSh 1,500. Perfect for intimate surprises, roommate celebrations, and sweet personal treats.",
    image: "/images/collection/birthday.jpg",
    count: 14
  },
  {
    id: "birthday",
    slug: "birthday-cakes",
    name: "Birthday Cakes",
    description: "From sleek minimalist Bento cakes to multi-tier festive showstoppers that light up every milestone.",
    image: "/images/lany/birthday-cakes.webp",
    count: 16
  },
  {
    id: "boys-birthday",
    slug: "birthday-cake-for-boys",
    name: "Birthday Cakes for Boys",
    description: "Spider-Man, Paw Patrol, dinosaurs, football, and superhero themed cakes with balanced sweetness kids love.",
    image: "/images/lany/birthday-cakes.webp",
    count: 8
  },
  {
    id: "wedding",
    slug: "wedding-cakes",
    name: "Wedding & Bridal Cakes",
    description: "Bespoke multi-tiered masterpieces, handcrafted sugar blossoms, and rustic elegance for your big day.",
    image: "/images/lany/bridal-cakes.webp",
    count: 8
  },
  {
    id: "graduation",
    slug: "graduation-cakes",
    name: "Graduation Cakes",
    description: "Honor academic triumph with custom cap-and-scroll designs, degree insignia, and congratulatory plaques.",
    image: "/images/lany/graduation-cakes.webp",
    count: 6
  },
  {
    id: "baby-shower",
    slug: "baby-shower-cakes",
    name: "Baby Shower Cakes",
    description: "Pastel teddy bears, gender reveal surprises, and tender confectionery welcoming the newest arrival.",
    image: "/images/lany/cakes-1.webp",
    count: 7
  },
  {
    id: "cupcakes",
    slug: "cupcakes",
    name: "Artisan Cupcakes",
    description: "Gourmet cupcake sets in boxes of 6, 12, or 24 with custom buttercream rosettes and themed toppers.",
    image: "/images/lany/cupcakes.webp",
    count: 9
  },
  {
    id: "brownies",
    slug: "chocolate-brownie-cake",
    name: "Chocolate Brownie Cakes",
    description: "Rich Belgian chocolate brownie celebration cakes, biscuit cake layers, and gooey cocoa bars.",
    image: "/images/home/cta-card-2.jpg",
    count: 5
  },
  {
    id: "fondant",
    slug: "fondant-cakes",
    name: "Custom Fondant Cakes",
    description: "Hand-sculpted 3D figurines, luxury themed sugarcraft, and bespoke novelty cakes designed to your imagination.",
    image: "/images/lany/custom-cakes.webp",
    count: 8
  },
  {
    id: "custom",
    slug: "custom-cakes",
    name: "Custom & Corporate",
    description: "Corporate logo cakes, 3D sculptured cakes, product launches, and themed custom art designed to your brief.",
    image: "/images/lany/custom-cakes.webp",
    count: 10
  }
];

export const CAKES_CATALOG = [
  {
    id: "sofia-the-first-princess-cake",
    slug: "sofia-the-first-cake",
    aliases: [
      "sofia-the-first-princess-birthday-cake",
      "princess-sofia-cake",
      "princess-cake",
      "princess-cake-nairobi",
      "princess-birthday-cake-girls"
    ],
    name: "Sofia the First Princess Cake",
    category: "birthday",
    categoryName: "Birthday Cakes",
    subCategory: "girls-birthday",
    pricingModel: "dynamic",
    theme: "purple",
    watermarkText: "PRINCESS",
    kickerNumber: "01 / BESTSELLER",
    featured: true,
    bestseller: true,
    price: 2950,
    priceFormatted: "KSh 2,950",
    image: "/images/cakes/sofia-the-first-birthday-cake.webp",
    gallery: [
      "/images/cakes/sofia-the-first-birthday-cake.webp",
      "/images/cakes/sofia-the-first-birthday-cake.jpg"
    ],
    alt: "Sofia the First Princess Cake with ribbed lilac buttercream, castle toppers, and Elliana name banner in Nairobi",
    shortDesc: "Enchanting Sofia the First princess cake featuring soft lilac ribbed buttercream, flutter butterfly accents, and 3D royal castle toppers with personalized name plaque.",
    description: "Make your little girl's birthday royal and unforgettable! Our handcrafted Sofia the First Princess Cake is frosted with silky lilac and pastel white ribbed buttercream, decorated with flying butterfly accents, and topped with 3D royal castle figures, Princess Sofia, and her companions. Made fresh from scratch using 100% pure butter sponge with your choice of Belgian chocolate fudge or vanilla velvet, complete with your daughter's personalized name banner.",
    servings: "Serves 8 - 12 people (1 kg)",
    defaultWeight: "1 kg",
    availableWeights: [
      { weight: "1 kg", price: 2950, servings: "Up to 12 people" },
      { weight: "1.5 kg", price: 3500, servings: "Up to 18 people" },
      { weight: "2 kg", price: 4050, servings: "Up to 26 people (+KSh 1,100)" },
      { weight: "3 kg", price: 5150, servings: "Up to 38 people" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Trending Princess Pick"
  },
  {
    id: "chocolate-cake-artisanal-drip",
    slug: "chocolate-cake",
    aliases: [
      "chocolate-cake-nairobi",
      "chocolate-birthday-cake",
      "chocolate-drip-cake",
      "chocolate-fudge-cake",
      "chocolate-drip-birthday-cake"
    ],
    name: "Decadent Chocolate Cake",
    category: "birthday",
    categoryName: "Birthday Cakes",
    subCategory: "chocolate-cakes",
    pricingModel: "dynamic",
    theme: "dark",
    watermarkText: "CHOCOLATE",
    kickerNumber: "02 / BESTSELLER",
    featured: true,
    bestseller: true,
    price: 2600,
    priceFormatted: "KSh 2,600",
    image: "/images/cakes/chocolate-drip-birthday-cake.webp",
    gallery: [
      "/images/cakes/chocolate-drip-birthday-cake.webp",
      "/images/cakes/chocolate-drip-birthday-cake.jpg"
    ],
    alt: "Decadent Chocolate Birthday Cake with mocha ribbed buttercream, dark chocolate ganache drip, piped rosettes, and silver pearls in Nairobi",
    shortDesc: "Rich handcrafted chocolate cake featuring silky mocha buttercream, cascading dark chocolate ganache drip, and rosette piping with silver dragée pearls.",
    description: "Indulge in pure chocolate perfection! Our handcrafted chocolate cake is layered with rich Belgian chocolate sponge and velvety mocha buttercream, drizzled with luxurious cascading dark chocolate ganache drip, and finished with delicate rosette piping, silver sugar pearls, and a chocolate cross-hatch crown. Made fresh to order in Kamakis, Ruiru with delivery across Nairobi.",
    servings: "Serves 8 - 12 people (1 kg)",
    defaultWeight: "1 kg",
    availableWeights: [
      { weight: "1 kg", price: 2600, servings: "Up to 12 people" },
      { weight: "1.5 kg", price: 3150, servings: "Up to 18 people" },
      { weight: "2 kg", price: 3700, servings: "Up to 26 people (+KSh 1,100)" },
      { weight: "3 kg", price: 4800, servings: "Up to 38 people" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Top Chocolate Choice"
  },
  {
    id: "graduation-cake-congrats-grad-her",
    slug: "graduation-cake",
    aliases: [
      "graduation-cakes",
      "graduation-cake-designs",
      "congrats-grad-cake",
      "graduation-cakes-nairobi",
      "graduation-cake-for-her",
      "custom-graduation-cake"
    ],
    name: "Personalized Graduation Cake",
    category: "celebration",
    categoryName: "Celebration Cakes",
    subCategory: "graduation-cakes",
    pricingModel: "dynamic",
    theme: "pink",
    watermarkText: "GRADUATION",
    kickerNumber: "03 / BESTSELLER",
    featured: true,
    bestseller: true,
    price: 2750,
    priceFormatted: "KSh 2,750",
    image: "/images/cakes/graduation-cake-for-her.webp",
    gallery: [
      "/images/cakes/graduation-cake-for-her.webp",
      "/images/cakes/graduation-cake-for-her.jpg"
    ],
    alt: "Personalized Graduation Cake for Her with Congrats Grad Susan topper, academic mortarboard cap, and diploma in Nairobi",
    shortDesc: "Celebrate academic achievement with our custom graduation cake featuring blush buttercream, laser-cut 'Congrats Grad' topper, academic cap, diploma, and cascading pearls.",
    description: "Mark milestone academic success with a centerpiece cake as inspiring as the graduate herself! Frosted in silky pastel blush buttercream, decorated with cascading iridescent sugar pearls, and crowned with a 3D academic mortarboard cap with shimmering gold ribbon, diploma scroll, and your graduate's custom name topper. Handcrafted fresh in Kamakis, Ruiru with prompt delivery across Nairobi.",
    servings: "Serves 8 - 12 people (1 kg)",
    defaultWeight: "1 kg",
    availableWeights: [
      { weight: "1 kg", price: 2750, servings: "Up to 12 people" },
      { weight: "1.5 kg", price: 3300, servings: "Up to 18 people" },
      { weight: "2 kg", price: 3850, servings: "Up to 26 people (+KSh 1,100)" },
      { weight: "3 kg", price: 4950, servings: "Up to 38 people" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Graduation Best Pick"
  },
  {
    id: "birthday-cake-for-mom-gold-butterfly",
    slug: "birthday-cake-for-mom",
    aliases: [
      "mom-birthday-cake",
      "mothers-day-cake",
      "birthday-cake-for-mother",
      "happy-birthday-mom-cake",
      "cake-for-mom",
      "butterfly-cake-mom"
    ],
    name: "Elegant Birthday Cake for Mom",
    category: "birthday",
    categoryName: "Birthday Cakes",
    subCategory: "women-celebration",
    pricingModel: "dynamic",
    theme: "pink",
    watermarkText: "MOM",
    kickerNumber: "04 / BESTSELLER",
    featured: true,
    bestseller: true,
    price: 1750,
    priceFormatted: "KSh 1,750",
    image: "/images/cakes/birthday-cake-for-mom.webp",
    gallery: [
      "/images/cakes/birthday-cake-for-mom.webp",
      "/images/cakes/birthday-cake-for-mom.jpg"
    ],
    alt: "Elegant Birthday Cake for Mom with gold Happy Birthday and Mommy toppers, pink bubbles, and gold butterfly in Nairobi",
    shortDesc: "Show Mom your heartfelt love with our two-tone white and ribbed pink celebration cake crowned with gold 'Happy Birthday' and 'Mommy' toppers, pink bubbles, and a gold butterfly.",
    description: "Make Mom feel truly cherished on her special day! Handcrafted with smooth vanilla or rich chocolate sponge, layered with silky vanilla cream, and frosted in a modern two-tone style—crisp porcelain white on top and delicate ribbed pastel pink around the base. Adorned with mirror-finish gold 'Happy Birthday' and 'Mommy' acrylic toppers, floating pink bubble spheres, and a shimmering laser-cut gold butterfly. Freshly baked in Kamakis, Ruiru with delivery across Nairobi.",
    servings: "Serves 8 - 12 people (1 kg)",
    defaultWeight: "1 kg",
    availableWeights: [
      { weight: "1 kg", price: 1750, servings: "Up to 12 people" },
      { weight: "1.5 kg", price: 2300, servings: "Up to 18 people" },
      { weight: "2 kg", price: 2850, servings: "Up to 26 people (+KSh 1,100)" },
      { weight: "3 kg", price: 3950, servings: "Up to 38 people" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Mom's Favorite"
  },
  {
    id: "paw-patrol-birthday-cake-2-tier",
    slug: "paw-patrol-cake",
    aliases: [
      "paw-patrol-birthday-cake",
      "paw-patrol-cake-design",
      "paw-patrol-cake-designs",
      "paw-patrol-cakes",
      "2-tier-birthday-cake",
      "paw-patrol-2nd-birthday-cake"
    ],
    name: "Paw Patrol 2-Tier Birthday Cake",
    category: "boys-birthday",
    categoryName: "Boys Birthday Cakes",
    subCategory: "kids-character",
    pricingModel: "dynamic",
    theme: "blue",
    watermarkText: "PAW PATROL",
    kickerNumber: "05 / KIDS HERO",
    featured: true,
    bestseller: true,
    price: 3700,
    priceFormatted: "KSh 3,700",
    image: "/images/cakes/paw-patrol-birthday-cake.webp",
    gallery: [
      "/images/cakes/paw-patrol-birthday-cake.webp",
      "/images/cakes/paw-patrol-birthday-cake.jpg"
    ],
    alt: "Paw Patrol 2-Tier Birthday Cake with Ryder, Chase, Marshall, Everest, Rubble, and Lookout Tower banner in Nairobi and Ruiru",
    shortDesc: "Vibrant 2-tier Paw Patrol celebration cake frosted in sky blue ribbed buttercream with piped cloud borders, featuring Chase, Marshall, Ryder, Everest, Rubble & custom Lookout Tower name banner.",
    description: "No job is too big, no pup is too small! Make your little hero's birthday unforgettable with this spectacular 2-tier Paw Patrol centerpiece. Handcrafted with moist vanilla or rich Belgian chocolate sponge, frosted in textured sky-blue buttercream with fluffy white cloud borders, and decorated with the full Adventure Bay rescue team: Chase, Marshall, Everest, Rocky, Rubble, and Ryder. Complete with a personalized Lookout Tower birthday banner and paw print accents. Freshly baked in Kamakis, Ruiru with delivery across Nairobi metro.",
    servings: "Serves 18 - 25 people (2-tier base)",
    defaultWeight: "2 kg (2-Tier)",
    availableWeights: [
      { weight: "2 kg (2-Tier)", price: 3700, servings: "Up to 25 kids & adults" },
      { weight: "3 kg (2-Tier)", price: 4800, servings: "Up to 38 people (+KSh 1,100)" },
      { weight: "4 kg (2-Tier)", price: 5900, servings: "Up to 50 people" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Kids #1 Hero"
  },
  {
    id: "kindergarten-grade-1-graduation-cake",
    slug: "kindergarten-graduation-cake",
    aliases: [
      "grade-1-cake",
      "first-grade-cake",
      "pp2-graduation-cake",
      "preschool-graduation-cake",
      "school-graduation-cake",
      "first-grade-graduation-cake"
    ],
    name: "Kindergarten & Grade 1 Graduation Cake",
    category: "graduation",
    categoryName: "Graduation Cakes",
    subCategory: "kids-graduation",
    pricingModel: "dynamic",
    theme: "green",
    watermarkText: "GRADUATION",
    kickerNumber: "06 / SCHOOL MILESTONE",
    featured: true,
    bestseller: true,
    price: 2850,
    priceFormatted: "KSh 2,850",
    image: "/images/cakes/kindergarten-graduation-cake.webp",
    gallery: [
      "/images/cakes/kindergarten-graduation-cake.webp",
      "/images/cakes/kindergarten-graduation-cake.jpg"
    ],
    alt: "Kindergarten and Grade 1 Graduation Cake with rainbow pencils, books, apple, and 1-2-3 blocks in Nairobi",
    shortDesc: "Celebrate your child's PP2, Kindergarten, or Grade 1 milestone with this vibrant celebration cake topped with 3D colorful pencils, book stack, apple, wooden blocks, and custom name plaque.",
    description: "Celebrate the huge milestone of graduating PP2/Kindergarten and stepping proudly into Grade 1! Handcrafted with moist vanilla velvet or rich Belgian chocolate sponge, frosted with white wave-textured buttercream and edible golden pearls, and crowned with playful 3D school toppers: a pencil holder filled with rainbow colored pencils, a stack of study books with a shiny red apple, and colorful 1-2-3 alphabet blocks. Features a bold 'hello FIRST GRADE' centerpiece and a personalized 'CONGRATULATIONS [NAME]' board plaque. Freshly baked in Kamakis, Ruiru with delivery across Nairobi metro.",
    servings: "Serves 8 - 12 people (1 kg)",
    defaultWeight: "1 kg",
    availableWeights: [
      { weight: "1 kg", price: 2850, servings: "Up to 12 people" },
      { weight: "1.5 kg", price: 3400, servings: "Up to 18 people" },
      { weight: "2 kg", price: 3950, servings: "Up to 26 people (+KSh 1,100)" },
      { weight: "3 kg", price: 5050, servings: "Up to 38 people" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "School Milestone Pick"
  },
  {
    id: "bento-cupcake-combo",
    slug: "bento-cake-cupcake-combo-nairobi",
    aliases: [
      "bento-cupcake-combo",
      "bento-combo",
      "bento-cake-and-cupcakes",
      "bento-cake-with-cupcakes"
    ],
    name: "Bento Cake & 5-Cupcake Celebration Box",
    category: "bento",
    categoryName: "Bento Cakes",
    pricingModel: "fixed",
    theme: "yellow",
    watermarkText: "COMBO",
    kickerNumber: "07 / VIRAL CELEBRATION SET",
    featured: true,
    bestseller: true,
    price: 2400,
    priceFormatted: "KSh 2,400",
    image: "/images/cakes/bento-cake-cupcake-combo.webp",
    gallery: [
      "/images/cakes/bento-cake-cupcake-combo.webp",
      "/images/cakes/bento-cake-cupcake-combo.jpg"
    ],
    alt: "Bento Cake & 5-Cupcake Celebration Box with Happy Birthday calligraphy and butterfly cupcakes in Nairobi and Ruiru",
    shortDesc: "One adorable 4-inch bento cake paired with 5 matching decorated cupcakes in a luxury gift box with ribbon.",
    description: "Featured in Chege James's 5-star Google review! The ultimate 24-hr notice surprise delivery set. Combines a custom-piped personal bento cake with 5 artisanal cupcakes in complementary flavors and festive color palette.",
    servings: "6 - 8 people",
    defaultWeight: "Bento + 5 Cupcakes",
    availableWeights: [
      { weight: "Bento + 5 Cupcakes", price: 2400, servings: "6-8 servings" },
      { weight: "Bento + 8 Cupcakes (Deluxe)", price: 3200, servings: "8-10 servings" }
    ],
    dietaryOptions: ["Standard Dairy", "Eggless Available"],
    leadTime: "Same-Day or 24-hr Delivery",
    badge: "Viral Combo"
  },
  {
    id: "salted-caramel-naked-birthday-cake",
    slug: "salted-caramel-cake",
    aliases: [
      "caramel-cake",
      "caramel-birthday-cake",
      "salted-caramel-birthday-cake",
      "chocolate-caramel-cake",
      "caramel-cakes",
      "naked-caramel-cake",
      "naked-birthday-cake"
    ],
    name: "Salted Caramel Naked Birthday Cake",
    category: "birthday",
    categoryName: "Birthday Cakes",
    subCategory: "caramel-cakes",
    pricingModel: "dynamic",
    theme: "warm",
    watermarkText: "CARAMEL",
    kickerNumber: "08 / ARTISAN CARAMEL",
    featured: true,
    bestseller: true,
    price: 6000,
    priceFormatted: "KSh 6,000",
    image: "/images/cakes/salted-caramel-birthday-cake.webp",
    gallery: [
      "/images/cakes/salted-caramel-birthday-cake.webp",
      "/images/cakes/salted-caramel-birthday-cake-black.webp",
      "/images/cakes/salted-caramel-birthday-cake.jpg"
    ],
    alt: "Salted Caramel Naked Birthday Cake with golden caramel mirror glaze, exposed chocolate crumb, and cream rosettes in Nairobi",
    shortDesc: "Handcrafted 2kg naked celebration cake featuring rich alternating chocolate and sponge crumb layers, molten salted caramel glaze mirror, delicate buttercream rosettes, and custom birthday lettering.",
    description: "Indulge in our signature Salted Caramel Naked Birthday Cake, expertly handcrafted at our Kamakis studio along the Eastern Bypass. Designed with stunning exposed naked-crumb layers of rich Belgian chocolate sponge and tender golden vanilla velvet, crowned with a glossy amber pool of artisanal salted caramel glaze that glistens in the light. Finished with seven hand-piped vanilla buttercream rosettes and bespoke celebratory script piped in pristine white icing. Delivered fresh across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves 16 - 24 people (2 kg)",
    defaultWeight: "2 kg",
    availableWeights: [
      { weight: "1.5 kg", price: 4900, servings: "Up to 16 people" },
      { weight: "2 kg", price: 6000, servings: "Up to 24 people (Signature Size)" },
      { weight: "3 kg", price: 7100, servings: "Up to 36 people (+KSh 1,100)" },
      { weight: "4 kg", price: 8200, servings: "Up to 48 people (+KSh 2,200)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Chef's Signature"
  },
  {
    id: "minecraft-birthday-cake-2-tier",
    slug: "minecraft-cake",
    aliases: [
      "minecraft-birthday-cake",
      "minecraft-cakes",
      "minecraft-cake-design",
      "minecraft-cake-designs",
      "2-tier-minecraft-cake",
      "davids-baptism-cake",
      "baptism-cake-minecraft"
    ],
    name: "Minecraft 2-Tier Celebration Cake",
    category: "boys-birthday",
    categoryName: "Birthday Cakes for Boys",
    subCategory: "minecraft-cakes",
    pricingModel: "dynamic",
    theme: "green",
    watermarkText: "MINECRAFT",
    kickerNumber: "09 / 2-TIER ADVENTURE",
    featured: true,
    bestseller: true,
    price: 3850,
    priceFormatted: "KSh 3,850",
    image: "/images/cakes/minecraft-birthday-cake-2-tier.webp",
    gallery: [
      "/images/cakes/minecraft-birthday-cake-2-tier.webp",
      "/images/cakes/minecraft-birthday-cake-2-tier-black.webp",
      "/images/cakes/minecraft-birthday-cake-2-tier.jpg"
    ],
    alt: "Minecraft 2-Tier Birthday and Baptism Celebration Cake with Steve, Alex, TNT, and Diamond Pickaxe in Nairobi",
    shortDesc: "Grand 2-tier Minecraft adventure cake frosted in vibrant grass-green buttercream with textured grass piping, obsidian drip, 3D Minecraft logo, Steve, Alex, wolf, TNT block, and custom celebratory banner.",
    description: "Unleash the ultimate gamer celebration with our handcrafted 2-Tier Minecraft Celebration Cake! Perfectly baked for birthdays, gaming parties, or milestone occasions like David's Baptism Day. Built with two grand tiers of moist vanilla velvet or rich Belgian chocolate sponge, frosted with vibrant Minecraft Creeper-green buttercream, realistic textured grass piping borders, and dramatic obsidian drip accents. Adorned with authentic blocky character toppers including Steve wielding his diamond pickaxe, Alex with her sword, the faithful Minecraft wolf, TNT explosive cubes, dirt grass blocks, and custom lettering. Freshly handcrafted at our Kamakis studio along Eastern Bypass with delivery across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves 12 - 16 people (1.5 kg)",
    defaultWeight: "1.5 kg",
    availableWeights: [
      { weight: "1.5 kg", price: 3850, servings: "Up to 16 people (Base 2-Tier)" },
      { weight: "2 kg", price: 4950, servings: "Up to 24 people (+KSh 1,100)" },
      { weight: "3 kg", price: 6050, servings: "Up to 34 people (+KSh 2,200)" },
      { weight: "4 kg", price: 7150, servings: "Up to 46 people (+KSh 3,300)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Gamer Favorite"
  },
  {
    id: "like-nastya-rainbow-birthday-cake",
    slug: "rainbow-cake",
    aliases: [
      "rainbow-cakes",
      "rainbow-birthday-cake",
      "rainbow-cake-nairobi",
      "like-nastya-cake",
      "like-nastya-birthday-cake",
      "rainbow-birthday-cake-girls",
      "girls-birthday-cake-rainbow",
      "2-tier-girls-birthday-cake",
      "nastya-cake",
      "butterfly-birthday-cake"
    ],
    name: "Like Nastya 2-Tier Rainbow Birthday Cake",
    category: "birthday",
    categoryName: "Birthday Cakes for Girls",
    subCategory: "girls-birthday",
    pricingModel: "dynamic",
    theme: "pink",
    watermarkText: "NASTYA",
    kickerNumber: "10 / 2-TIER GIRLS THEME",
    featured: true,
    bestseller: true,
    price: 3800,
    priceFormatted: "KSh 3,800",
    image: "/images/cakes/like-nastya-rainbow-birthday-cake.webp",
    gallery: [
      "/images/cakes/like-nastya-rainbow-birthday-cake.webp",
      "/images/cakes/like-nastya-rainbow-birthday-cake-black.webp",
      "/images/cakes/like-nastya-rainbow-birthday-cake.jpg"
    ],
    alt: "Like Nastya 2-Tier Rainbow Birthday Cake for Girls with 3D Rainbow topper, butterflies, and daisy flowers in Nairobi",
    shortDesc: "Delightful 2-tier pastel baby pink celebration cake crowned with vibrant 3D rainbow topper, personalized banner, Like Nastya centerpiece, magenta butterflies, and delicate buttercream swirls.",
    description: "Turn your little girl's birthday into a vibrant fairytale celebration with our handcrafted Like Nastya 2-Tier Rainbow Birthday Cake! Handcrafted across two grand tiers in delicate pastel baby pink combed buttercream, lavishly trimmed with cascading piped buttercream swirl rosettes and dusted with edible silver pearls. Topped with a colorful 3D rainbow arch and customizable celebratory banner (e.g. 'Happy 6th Birthday Liz Wanja'), featuring Like Nastya with her signature cat ears, shimmering magenta and violet 3D butterfly decals, and cheerful daisy blossoms. Baked fresh at our Kamakis studio along Eastern Bypass with delivery across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves 12 - 16 people (1.5 kg)",
    defaultWeight: "1.5 kg",
    availableWeights: [
      { weight: "1.5 kg", price: 3800, servings: "Up to 16 people (Base 2-Tier)" },
      { weight: "2 kg", price: 4900, servings: "Up to 24 people (+KSh 1,100)" },
      { weight: "3 kg", price: 6000, servings: "Up to 34 people (+KSh 2,200)" },
      { weight: "4 kg", price: 7100, servings: "Up to 46 people (+KSh 3,300)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Girls Favorite"
  },
  {
    id: "spiderman-superhero-birthday-cake",
    slug: "spiderman-cake",
    aliases: [
      "spiderman-birthday-cake",
      "spider-man-cake",
      "birthday-cake-for-boys-spiderman",
      "spiderman-cakes",
      "spiderman-cake-design",
      "boys-spiderman-cake"
    ],
    name: "Spider-Man Superhero Boys Birthday Cake",
    category: "boys-birthday",
    categoryName: "Birthday Cakes for Boys",
    subCategory: "superhero-cakes",
    pricingModel: "dynamic",
    theme: "blue",
    watermarkText: "SPIDER",
    kickerNumber: "11 / SUPERHERO ICON",
    featured: true,
    bestseller: true,
    price: 2700,
    priceFormatted: "KSh 2,700",
    image: "/images/cakes/spiderman-superhero-birthday-cake.webp",
    gallery: [
      "/images/cakes/spiderman-superhero-birthday-cake.webp",
      "/images/cakes/spiderman-superhero-birthday-cake-black.webp",
      "/images/cakes/spiderman-superhero-birthday-cake.jpg"
    ],
    alt: "Spider-Man Superhero Birthday Cake with red banner, 3D mask, web slinger, and comic BAM badge in Nairobi",
    shortDesc: "Exciting Marvel Spider-Man birthday cake in sky-blue wave buttercream with 3D mask topper, web-slinging Spidey, red personalized banner, and comic action accents.",
    description: "Bring thrilling Marvel superhero action to your little boy's special day with our handcrafted Spider-Man Birthday Cake! Frosted in vibrant sky-blue combed buttercream with rich royal blue wave swirls and dusted with metallic silver pearls. Crowned with a bold red arch banner (e.g. 'Happy 4th Birthday Ragnar'), a large 3D Spider-Man mask, blue numeral '4' with spiderwebs, and a retro comic 'BAM!' burst. Features a dynamic web-slinging Spider-Man centerpiece and emblem decals on a blue-ribboned white cake board. Freshly handcrafted at our Kamakis studio along Eastern Bypass with delivery across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves 8 - 12 people (1 kg)",
    defaultWeight: "1 kg",
    availableWeights: [
      { weight: "1 kg", price: 2700, servings: "Up to 12 people (1 kg)" },
      { weight: "1.5 kg", price: 3250, servings: "Up to 16 people" },
      { weight: "2 kg", price: 3800, servings: "Up to 24 people (+KSh 1,100)" },
      { weight: "3 kg", price: 4900, servings: "Up to 34 people (+KSh 2,200)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Boys Bestseller"
  },
  {
    id: "half-and-half-baby-birthday-cake",
    slug: "half-and-half-cake",
    aliases: [
      "half-and-half-birthday-cake",
      "split-birthday-cake",
      "two-tone-birthday-cake",
      "baby-birthday-cake-nairobi",
      "baby-lucy-birthday-cake",
      "pink-and-yellow-cake"
    ],
    name: "Half and Half Dual-Tone Baby Birthday Cake",
    category: "birthday",
    categoryName: "Baby & 1st Birthday Cakes",
    subCategory: "dual-tone-cakes",
    pricingModel: "dynamic",
    theme: "pink",
    watermarkText: "DUAL TONE",
    kickerNumber: "12 / TWO-TONE SPLIT",
    featured: true,
    bestseller: true,
    price: 3400,
    priceFormatted: "KSh 3,400",
    image: "/images/cakes/half-and-half-baby-birthday-cake.webp",
    gallery: [
      "/images/cakes/half-and-half-baby-birthday-cake.webp",
      "/images/cakes/half-and-half-baby-birthday-cake-black.webp",
      "/images/cakes/half-and-half-baby-birthday-cake.jpg"
    ],
    alt: "Half and Half Dual-Tone Baby Birthday Cake in pastel yellow and pink with gold pearls and Happy Birthday Baby Lucy script in Nairobi",
    shortDesc: "Charming two-tone split celebration cake in pastel butter-yellow and delicate baby pink combed buttercream, heart-shaped dividing border, metallic gold pearls, and custom calligraphy.",
    description: "Celebrate baby milestones and intimate birthdays with our enchanting Half and Half Dual-Tone Celebration Cake! Artfully handcrafted with a vertical split design featuring pastel butter-yellow on one side and sweet baby pink on the other, united with a continuous horizontal comb texture. The top tier features a piped heart border dividing the two colors with hand-piped black cursive script (e.g. 'Happy Birthday' on the yellow half, 'Baby Lucy' on the pink half), accented with delicate buttercream rosettes and shimmering edible golden dragee pearls. Freshly baked at our Kamakis bakery along Eastern Bypass with delivery across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves 12 - 16 people (1.5 kg)",
    defaultWeight: "1.5 kg",
    availableWeights: [
      { weight: "1.5 kg", price: 3400, servings: "Up to 16 people (Base)" },
      { weight: "2 kg", price: 4500, servings: "Up to 24 people (+KSh 1,100)" },
      { weight: "3 kg", price: 5600, servings: "Up to 34 people (+KSh 2,200)" },
      { weight: "4 kg", price: 6700, servings: "Up to 46 people (+KSh 3,300)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Trending Design"
  },
  {
    id: "spiderman-comic-city-birthday-cake",
    slug: "spiderman-comic-city-cake",
    aliases: [
      "spiderman-theme-cake",
      "spiderman-11th-birthday-cake",
      "superhero-birthday-cake",
      "spiderman-comic-cake",
      "boys-superhero-cake-nairobi",
      "spiderman-action-cake"
    ],
    name: "Spider-Man Comic City Skyline Birthday Cake",
    category: "birthday",
    categoryName: "Boys & Superhero Cakes",
    subCategory: "superhero-cakes",
    pricingModel: "dynamic",
    theme: "blue",
    watermarkText: "SPIDER-MAN",
    kickerNumber: "13 / COMIC HERO",
    featured: true,
    bestseller: true,
    price: 2700,
    priceFormatted: "KSh 2,700",
    image: "/images/cakes/spiderman-comic-city-birthday-cake.webp",
    gallery: [
      "/images/cakes/spiderman-comic-city-birthday-cake.webp",
      "/images/cakes/spiderman-comic-city-birthday-cake-black.webp",
      "/images/cakes/spiderman-comic-city-direct.webp"
    ],
    alt: "Spider-Man Comic City Skyline Birthday Cake with James @ 11 banner, Spidey action figurines, and KAPOW speech bubbles in Nairobi",
    shortDesc: "Vibrant Spider-Man comic city cake featuring combed sky-blue buttercream, personalized banner ('James @ 11'), 3 standing Spidey action figures, comic KAPOW! & BANG! callouts, and colorful city skyline base.",
    description: "Unleash ultimate superhero excitement with our handcrafted Spider-Man Comic City Skyline Birthday Cake! Featuring a tall cylinder frosted in combed sky-blue buttercream, accented with edible silver pearls. Topped with a custom crimson ribbon banner (e.g. 'James @ 11'), a dynamic Spider-Man web shield topper, and three standing Spidey character figures in action poses. The cylinder is decorated with retro comic 'KAPOW!' and 'BANG!' bursts, a crouching Spider-Man centerpiece figure, and a colorful skyscraper city skyline around the base. Baked fresh daily at Lany Cake Shop, Kamakis Eastern Bypass with delivery across Ruiru, Juja, Nairobi, and Kiambu.",
    servings: "Serves 8 - 12 people (1 kg)",
    defaultWeight: "1 kg",
    availableWeights: [
      { weight: "1 kg", price: 2700, servings: "Up to 12 people (1 kg Base)" },
      { weight: "1.5 kg", price: 3250, servings: "Up to 16 people" },
      { weight: "2 kg", price: 3800, servings: "Up to 24 people (+KSh 1,100)" },
      { weight: "3 kg", price: 4900, servings: "Up to 34 people (+KSh 2,200)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Trending Superhero"
  },
  {
    id: "holy-spirit-baptism-cake",
    slug: "holy-spirit-baptism-cake",
    aliases: [
      "baptism-cake",
      "baptism-cake-nairobi",
      "christening-cake",
      "baby-dedication-cake",
      "first-communion-cake",
      "rosary-cross-cake",
      "girls-baptism-cake",
      "god-bless-baby-cake"
    ],
    name: "Holy Spirit Dove & Rosary Baptism Cake",
    category: "birthday",
    categoryName: "Baptism & Dedication Cakes",
    subCategory: "baptism-cakes",
    pricingModel: "dynamic",
    theme: "pink",
    watermarkText: "BAPTISM",
    kickerNumber: "14 / SACRED BLESSING",
    featured: true,
    bestseller: true,
    price: 3800,
    priceFormatted: "KSh 3,800",
    image: "/images/cakes/holy-spirit-baptism-cake.webp",
    gallery: [
      "/images/cakes/holy-spirit-baptism-cake.webp",
      "/images/cakes/holy-spirit-baptism-cake-black.webp",
      "/images/cakes/holy-spirit-baptism-cake-direct.webp"
    ],
    alt: "Holy Spirit Dove and Rosary Baptism Cake in white and blush pink ombre with golden crucifix and God Bless Talya Gianna Wangeci calligraphy in Nairobi",
    shortDesc: "Sacred baptism and dedication cake in delicate white-to-blush-pink ombre combed buttercream, pure white Holy Spirit Dove with golden sunburst rays, edible pearl rosary with golden crucifix, and bespoke calligraphy.",
    description: "Celebrate sacred beginnings with our handcrafted Holy Spirit Dove & Rosary Baptism Cake. Featuring an elegant white-to-pastel blush pink ombre buttercream cylinder with circular comb texturing, accented with shimmering gold and white edible pearls. Topped with a pure white Holy Spirit Dove crowned with golden sunburst rays, and draped with a delicate edible pearl rosary leading to an intricate golden crucifix cross. Presented on a custom inscribed cake board (e.g. 'God Bless Talya Gianna Wangeci'). Baked fresh at Lany Cake Shop, Kamakis Eastern Bypass with prompt delivery across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves 12 - 16 people (1.5 kg Base)",
    defaultWeight: "1.5 kg",
    availableWeights: [
      { weight: "1.5 kg", price: 3800, servings: "Up to 16 people (Base)" },
      { weight: "2 kg", price: 4900, servings: "Up to 24 people (+KSh 1,100)" },
      { weight: "3 kg", price: 6000, servings: "Up to 34 people (+KSh 2,200)" },
      { weight: "4 kg", price: 7100, servings: "Up to 46 people (+KSh 3,300)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Sacred Milestone"
  },
  {
    id: "farewell-doctor-bento-cupcake-combo",
    slug: "farewell-bento-cupcake-combo",
    aliases: [
      "farewell-cake",
      "doctor-farewell-cake",
      "goodbye-cake",
      "bento-cupcake-farewell",
      "dr-njogu-farewell-cake"
    ],
    name: "Farewell Bento Cake & 5-Cupcake Celebration Box",
    category: "bento",
    categoryName: "Bento & Cupcake Sets",
    subCategory: "bento-combos",
    pricingModel: "dynamic",
    theme: "purple",
    watermarkText: "FAREWELL BENTO",
    kickerNumber: "15 / GIFT BOX",
    featured: true,
    bestseller: true,
    price: 2400,
    priceFormatted: "KSh 2,400",
    image: "/images/cakes/farewell-doctor-bento-cupcake-combo.webp",
    gallery: [
      "/images/cakes/farewell-doctor-bento-cupcake-combo.webp",
      "/images/cakes/farewell-doctor-bento-cupcake-combo-black.webp",
      "/images/cakes/farewell-doctor-bento-cupcake-combo-direct.webp"
    ],
    alt: "Farewell Bento Cake and 5 Cupcake Box with Bye Bye Dr. Njogu inscription and lilac floral cupcakes in Nairobi",
    shortDesc: "Thoughtful farewell gift box featuring a mini bento cake with custom meme inscription and lilac rosette border, paired with 5 artisanal floral cupcakes in a luxury white window box.",
    description: "Send off a valued colleague or doctor with love, laughter, and sweetness! Our Farewell Bento Cake & 5-Cupcake Box features a mini celebration cake frosted in white with lilac buttercream rosettes, edible silver pearls, and a hand-piped Flork meme character with custom inscription (e.g. 'Bye Bye Dr. Njogu / We'll miss you alot!'). Accompanied by 5 freshly piped matching cupcakes in delicate white and lilac blossoms with silver sugar pearls. Baked fresh at Lany Cake Shop, Kamakis Eastern Bypass with prompt delivery across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves 6 - 8 people (Standard Box)",
    defaultWeight: "Standard Box",
    availableWeights: [
      { weight: "Standard Box (Bento + 5 Cupcakes)", price: 2400, servings: "Serves 6 - 8 people" },
      { weight: "Deluxe Box (Bento + 8 Cupcakes)", price: 3200, servings: "Serves 8 - 10 people" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Colleague Favorite"
  },
  {
    id: "kpop-demon-hunters-birthday-cake",
    slug: "kpop-demon-hunters-cake",
    aliases: [
      "kpop-cake",
      "k-pop-birthday-cake",
      "anime-2-tier-cake",
      "demon-hunters-cake",
      "happy-birthday-paccy-cake",
      "2-tier-kpop-cake"
    ],
    name: "K-Pop Demon Hunters 2-Tier Birthday Cake",
    category: "birthday",
    categoryName: "2-Tier & Anime Cakes",
    subCategory: "tiered-cakes",
    pricingModel: "dynamic",
    theme: "purple",
    watermarkText: "K-POP HEROES",
    kickerNumber: "16 / 2-TIER SHOWCASE",
    featured: true,
    bestseller: true,
    price: 3800,
    priceFormatted: "KSh 3,800",
    image: "/images/cakes/kpop-demon-hunters-birthday-cake.webp",
    gallery: [
      "/images/cakes/kpop-demon-hunters-birthday-cake.webp",
      "/images/cakes/kpop-demon-hunters-birthday-cake-black.webp",
      "/images/cakes/kpop-demon-hunters-birthday-cake-direct.webp"
    ],
    alt: "K-Pop Demon Hunters 2-Tier Birthday Cake in lilac and cyan ombre with Happy Birthday Paccy inscription in Nairobi",
    shortDesc: "Vibrant 2-tier showstopper in lilac and cyan ombre combed buttercream, purple wave rosettes, 3D K-Pop Demon Hunters anime figures, and custom board inscription.",
    description: "Ignite the celebration with our stunning K-Pop Demon Hunters 2-Tier Birthday Cake! Designed with two tiers of textured combed buttercream blending soft lilac and electric cyan. Crowned with dynamic 3D acrylic character cutouts of the Demon Hunters idol squad, glowing K-Pop logo shield, and wave rosette shell borders dotted with pearls. Presented on a personalized royal purple cake board (e.g. 'Happy Birthday Paccy'). Handcrafted daily at Lany Cake Shop, Kamakis Eastern Bypass with delivery across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves 18 - 24 people (2 kg Base)",
    defaultWeight: "2 kg",
    availableWeights: [
      { weight: "2 kg (2-Tier Base)", price: 3800, servings: "Up to 24 people (2-Tier Base)" },
      { weight: "3 kg (2-Tier)", price: 4900, servings: "Up to 34 people (+KSh 1,100)" },
      { weight: "4 kg (2-Tier)", price: 6000, servings: "Up to 46 people (+KSh 2,200)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "2-Tier Bestseller"
  },
  {
    id: "barbie-princess-tiara-birthday-cake",
    slug: "barbie-princess-cake",
    aliases: [
      "barbie-cake",
      "barbie-birthday-cake",
      "barbie-cake-nairobi",
      "princess-tiara-cake",
      "natalie-9-barbie-cake",
      "pink-barbie-birthday-cake"
    ],
    name: "Barbie Princess Tiara Birthday Cake",
    category: "birthday",
    categoryName: "Girls & Princess Cakes",
    subCategory: "character-cakes",
    pricingModel: "dynamic",
    theme: "pink",
    watermarkText: "BARBIE PRINCESS",
    kickerNumber: "17 / PRINCESS TIARA",
    featured: true,
    bestseller: true,
    price: 2700,
    priceFormatted: "KSh 2,700",
    image: "/images/cakes/barbie-princess-tiara-birthday-cake.webp",
    gallery: [
      "/images/cakes/barbie-princess-tiara-birthday-cake.webp",
      "/images/cakes/barbie-princess-tiara-birthday-cake-black.webp",
      "/images/cakes/barbie-princess-tiara-birthday-cake-direct.webp"
    ],
    alt: "Barbie Princess Tiara Birthday Cake in pink combed buttercream with Natalie @ 9 crown topper in Nairobi",
    shortDesc: "Dazzling Barbie princess cake frosted in combed candy-pink buttercream, gold sugar rods, sparkling tiara crown topper with 'Natalie @ 9', Barbie silhouette, and iconic crowned Barbie portrait.",
    description: "Make every little girl's royal dreams come true with our Barbie Princess Tiara Birthday Cake! Frosted in tall cylinder pink combed buttercream, framed with shell rosettes and metallic gold sugar rods. Crowned with an oversized glittering pink tiara banner (e.g. 'Natalie @ 9'), Barbie profile silhouette, standing Barbie fashion figures, and a crowned Barbie face portrait on the front. Freshly handcrafted at Lany Cake Shop, Kamakis Eastern Bypass with prompt delivery across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves 8 - 12 people (1 kg Base)",
    defaultWeight: "1 kg",
    availableWeights: [
      { weight: "1 kg", price: 2700, servings: "Up to 12 people (1 kg Base)" },
      { weight: "1.5 kg", price: 3250, servings: "Up to 16 people" },
      { weight: "2 kg", price: 3800, servings: "Up to 24 people (+KSh 1,100)" },
      { weight: "3 kg", price: 4900, servings: "Up to 34 people (+KSh 2,200)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Girls #1 Favorite"
  },
  {
    id: "ocean-azure-blue-birthday-cake",
    slug: "ocean-azure-blue-cake",
    aliases: [
      "blue-birthday-cake",
      "blue-cake-nairobi",
      "birthday-cake-for-men",
      "simple-blue-birthday-cake",
      "elegant-blue-cake"
    ],
    name: "Ocean Azure Blue Combed Buttercream Birthday Cake",
    category: "birthday",
    categoryName: "Classic & Modern Cakes",
    subCategory: "classic-cakes",
    pricingModel: "dynamic",
    theme: "blue",
    watermarkText: "AZURE BLUE",
    kickerNumber: "18 / TIMELESS ELEGANCE",
    featured: true,
    bestseller: true,
    price: 2500,
    priceFormatted: "KSh 2,500",
    image: "/images/cakes/ocean-azure-blue-birthday-cake.webp",
    gallery: [
      "/images/cakes/ocean-azure-blue-birthday-cake.webp",
      "/images/cakes/ocean-azure-blue-birthday-cake-black.webp",
      "/images/cakes/ocean-azure-blue-birthday-cake-direct.webp"
    ],
    alt: "Ocean Azure Blue Combed Buttercream Birthday Cake with Happy Birthday calligraphy and silver drum in Nairobi",
    shortDesc: "Vibrant ocean azure blue combed buttercream cylinder with wave swirl borders, hand-piped black cursive 'Happy Birthday' calligraphy, scattered white pearls, and round silver drum.",
    description: "Sophisticated and vibrant, our Ocean Azure Blue Birthday Cake is a perennial bestseller for men, boys, and milestone celebrations! Features a cylinder cake in textured combed azure blue buttercream, accented with top and bottom shell wave rosettes and shimmering white edible pearls. Topped with elegant hand-piped black cursive 'Happy Birthday' calligraphy on a round silver drum. Freshly baked at Lany Cake Shop, Kamakis Eastern Bypass with fast delivery in Nairobi and Ruiru.",
    servings: "Serves 8 - 12 people (1 kg Base)",
    defaultWeight: "1 kg",
    availableWeights: [
      { weight: "1 kg", price: 2500, servings: "Up to 12 people (1 kg Base)" },
      { weight: "1.5 kg", price: 3050, servings: "Up to 16 people" },
      { weight: "2 kg", price: 3600, servings: "Up to 24 people (+KSh 1,100)" },
      { weight: "3 kg", price: 4700, servings: "Up to 34 people (+KSh 2,200)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "Same-Day / 24 Hours Notice (Rush orders via WhatsApp)",
    badge: "Men & Boys Choice"
  },
  {
    id: "sofia-fairytale-princess-first-birthday-cake",
    slug: "sofia-first-birthday-cake",
    aliases: [
      "sofia-the-first-cake-chloe",
      "chloe-turns-one-cake",
      "sofia-princess-1st-birthday-cake",
      "sofia-cake-pink"
    ],
    name: "Sofia the First Fairytale 1st Birthday Cake",
    category: "birthday",
    categoryName: "Baby & 1st Birthday Cakes",
    subCategory: "character-cakes",
    pricingModel: "dynamic",
    theme: "pink",
    watermarkText: "SOFIA PRINCESS",
    kickerNumber: "19 / 1ST BIRTHDAY",
    featured: true,
    bestseller: true,
    price: 2200,
    priceFormatted: "KSh 2,200",
    image: "/images/cakes/sofia-fairytale-princess-first-birthday-cake.webp",
    gallery: [
      "/images/cakes/sofia-fairytale-princess-first-birthday-cake.webp",
      "/images/cakes/sofia-fairytale-princess-first-birthday-cake-black.webp",
      "/images/cakes/sofia-fairytale-princess-first-birthday-cake-direct.webp"
    ],
    alt: "Sofia the First Fairytale 1st Birthday Cake in pink with fairytale castle and Chloe Turns One banner in Nairobi",
    shortDesc: "Delightful first birthday celebration cake in pastel baby pink combed buttercream, 3D fairytale castle topper, gold plaque ('Chloe Turns One'), Princess Sofia, Clover bunny, and flying butterflies.",
    description: "Celebrate baby's glorious first birthday milestone with our Sofia the First Fairytale 1st Birthday Cake! Handcrafted in soft baby pink combed buttercream with delicate wave swirls and edible gold pearls. Features a stunning 3D pink and royal blue fairytale castle, royal tiara portrait, custom gold-rimmed plaque (e.g. 'Chloe Turns One'), Clover the bunny, Whatnaught the squirrel, and flying butterflies. Baked fresh daily at Lany Cake Shop, Kamakis Eastern Bypass with prompt delivery across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves 4 - 6 people (750g Smash / Baby Base)",
    defaultWeight: "750g",
    availableWeights: [
      { weight: "750g", price: 2200, servings: "Up to 6 people (Baby / Smash Base)" },
      { weight: "1 kg", price: 2750, servings: "Up to 12 people" },
      { weight: "1.5 kg", price: 3300, servings: "Up to 16 people" },
      { weight: "2 kg", price: 3850, servings: "Up to 24 people (+KSh 1,100)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "1st Birthday Special"
  },
  {
    id: "mothers-day-butterfly-gift-cake",
    slug: "mothers-day-butterfly-cake",
    aliases: [
      "mothers-day-cake",
      "mother-day-cake-nairobi",
      "mom-birthday-cake",
      "birthday-cake-for-mom",
      "butterfly-mothers-day-cake",
      "gift-box-cake"
    ],
    name: "Happy Mother's Day Butterfly Celebration Cake in Window Gift Box",
    category: "birthday",
    categoryName: "Mother's Day & Special Occasion Cakes",
    subCategory: "gift-box-cakes",
    pricingModel: "dynamic",
    theme: "pink",
    watermarkText: "MOTHERS DAY",
    kickerNumber: "20 / GIFT BOX SHOWCASE",
    featured: true,
    bestseller: true,
    price: 1250,
    priceFormatted: "KSh 1,250",
    image: "/images/cakes/mothers-day-butterfly-gift-cake.webp",
    gallery: [
      "/images/cakes/mothers-day-butterfly-gift-cake.webp",
      "/images/cakes/mothers-day-butterfly-gift-cake-black.webp",
      "/images/cakes/mothers-day-butterfly-gift-cake-direct.webp"
    ],
    alt: "Happy Mother's Day Butterfly Celebration Cake with floral plaque in window gift box in Nairobi",
    shortDesc: "Tender pastel-pink swirl celebration cake with gold dragees, 3D purple & gold butterfly, and Happy Mother's Day floral plaque, presented in a luxury kraft window box.",
    description: "Express your deepest love and gratitude to mom with our Happy Mother's Day Butterfly Celebration Cake! Frosted in silky pastel pink buttercream swirls accented with shimmering edible gold pearls. Features a stunning 3D purple and gold-foil butterfly topper and a floral centerpiece plaque reading 'Happy Mother's Day' with a sweet red heart. Beautifully presented in a natural kraft bakery window box on a round silver drum. Freshly handcrafted at Lany Cake Shop, Kamakis Eastern Bypass with doorstep delivery across Nairobi, Ruiru, and Kiambu.",
    servings: "Serves up to 8 people (500g Base)",
    defaultWeight: "500g",
    availableWeights: [
      { weight: "500g (1/2 kg)", price: 1250, servings: "Serves up to 8 people (Base)" },
      { weight: "750g (3/4 kg)", price: 1600, servings: "Serves up to 10 people" },
      { weight: "1 kg", price: 1950, servings: "Serves up to 15 people" },
      { weight: "1.5 kg", price: 2500, servings: "Serves up to 20 people" },
      { weight: "2 kg", price: 3050, servings: "Serves up to 25 people (+KSh 1,100)" }
    ],
    dietaryOptions: ["Standard Dairy", "100% Eggless Available", "Nut-Free Recipe"],
    leadTime: "Same-Day / 24 Hours Notice (Rush orders available via WhatsApp)",
    badge: "Mother's Day Special"
  }
];


export const TREATS_AND_SNACKS = [
  {
    id: "fudge-brownie-bites",
    name: "Chewy Belgian Chocolate Brownie Box",
    price: 1800,
    priceFormatted: "KSh 1,800",
    image: "/images/lany/cupcakes-image.webp",
    category: "Sweet Snacks",
    servings: "12 Generous Squares",
    description: "Ultra-dense, fudgy dark chocolate brownies with crackly tops and melting chocolate chunks throughout."
  },
  {
    id: "french-macaron-collection",
    name: "Pastel French Macaron Assortment",
    price: 2200,
    priceFormatted: "KSh 2,200",
    image: "/images/lany/birthday-cakes.webp",
    category: "Sweet Snacks",
    servings: "Box of 10 Macarons",
    description: "Delicate almond flour meringue shells filled with dark chocolate ganache, pistachio cream, raspberry, and passion fruit curd."
  },
  {
    id: "gourmet-cake-pops",
    name: "Hand-Dipped Celebration Cake Pops",
    price: 1600,
    priceFormatted: "KSh 1,600",
    image: "/images/lany/custom-cakes.webp",
    category: "Event Treats",
    servings: "10 Dipped Cake Pops",
    description: "Moist chocolate and vanilla cake crumbled, rolled, dipped in colored Belgian chocolate, and tied with silk ribbons."
  },
  {
    id: "savory-cocktail-samosas",
    name: "Artisan Savory Meat & Veggie Pastry Platter",
    price: 2500,
    priceFormatted: "KSh 2,500",
    image: "/images/lany/cakes-1.webp",
    category: "Savory Treats",
    servings: "30 Cocktail Bites",
    description: "Crispy golden spiced beef, chicken, and aromatic vegetable pastries prepared fresh for cocktail parties and gatherings."
  }
];

export const RECIPES_AND_POSTS = [
  {
    id: "how-to-choose-wedding-cake-nairobi",
    slug: "how-to-choose-the-perfect-wedding-cake-in-nairobi",
    title: "How to Choose the Perfect Wedding Cake in Nairobi (A Baker's Guide)",
    excerpt: "From guest counts to handling Nairobi's midday climate and pairing tropical flavors, here is what every couple should consider before ordering.",
    category: "Wedding Guides",
    readTime: "4 min read",
    date: "November 2026",
    image: "/images/lany/bridal-cakes.webp",
    author: "Carol Jenny",
    content: [
      "Planning a wedding in Kenya is an exhilarating journey filled with vibrant traditions, family gatherings, and unforgettable hospitality. Amidst venue hunting and attire selection, your wedding cake stands as one of the sweetest focal points of the entire reception.",
      "Consider your guest count carefully: A 3-tier cake (typically 8 to 10 kg) comfortably serves 80 to 100 seated guests with generous portions. If you have 250+ guests, combine a dramatic 3-tier display cake with freshly sliced kitchen sheet cakes to keep costs balanced while ensuring everyone gets their slice.",
      "Watch Nairobi's temperature: If your reception is outdoors at a garden venue in Karen, Runda, or Tigoni, high midday temperatures can soften delicate whipped buttercreams. We recommend fondant finishes or stable Swiss meringue buttercream with sturdy dowels.",
      "Do not be afraid of flavor diversity! At Lany Cakes, we love creating multi-tier wedding cakes where each layer has a distinct taste—for instance, Belgian chocolate fudge on the foundational bottom tier, tropical passion curd in the center, and red velvet on top."
    ]
  },
  {
    id: "cake-flavor-combinations-that-delight",
    slug: "top-5-cake-flavor-combinations-that-kenyan-guests-love",
    title: "Top 5 Cake Flavor Combinations That Kenyan Guests Love",
    excerpt: "Move beyond plain vanilla: discover why passion fruit curd, Belgian chocolate fudge, and spiced carrot are topping Nairobi birthday requests.",
    category: "Baking Tips",
    readTime: "3 min read",
    date: "October 2026",
    image: "/images/lany/birthday-cake.webp",
    author: "Carol Jenny",
    content: [
      "Every celebration deserves a cake that tastes just as memorable as it looks. At Lany Cake Shop, we spend months perfecting recipes that highlight both rich international chocolates and zesty local Kenyan ingredients.",
      "1. Passion Fruit Tang & Sweet Cream: There is nothing quite like fresh highland passion fruit pulp boiled down into a silky tart curd and layered between tender sponge cake.",
      "2. Decadent Belgian Dark Chocolate Fudge: Made with melted premium cocoa solids and layered with rich ganache, this satisfies the most dedicated chocoholics.",
      "3. Royal Red Velvet with Real Cream Cheese: Soft cocoa crumb with that velvety ruby hue, finished with authentic tangy cream cheese frosting.",
      "4. Salted Caramel Crunch: House-made caramel sauce cooked to a deep golden amber, balanced with fine sea salt flakes and layered between fluffy butter sponge."
    ]
  },
  {
    id: "how-to-keep-your-cake-fresh",
    slug: "how-to-store-and-transport-your-cake-in-nairobi",
    title: "How to Store and Transport Your Cake in Nairobi Traffic",
    excerpt: "Essential tips on preserving your cake's shape, temperature, and fresh taste until candle-blowing time.",
    category: "Care Tips",
    readTime: "3 min read",
    date: "October 2026",
    image: "/images/lany/cupcakes.webp",
    author: "Carol Jenny",
    content: [
      "If you're picking up your cake or receiving delivery, proper handling ensures the frosting remains pristine.",
      "Always transport cakes on a flat, level surface—ideally the vehicle floorboard with air conditioning running, never on an angled car seat or in a warm boot.",
      "Keep refrigerated until 1 to 2 hours before serving. Buttercream cakes taste best when served slightly at room temperature, allowing the rich butter to melt smoothly on the palate."
    ]
  }
];

export const CLIENT_TESTIMONIALS = [
  {
    id: 1,
    name: "Wanjiku Mwangi",
    location: "Kilimani, Nairobi",
    occasion: "30th Birthday Party",
    rating: 5,
    quote: "Lany Cakes made my 30th birthday minimalist cake and it was absolute perfection! Not only was the design straight out of Pinterest, but the chocolate fudge flavor was so moist and rich. Everyone at dinner kept asking where I ordered it.",
    date: "2 weeks ago"
  },
  {
    id: 2,
    name: "David & Sharon Ochieng",
    location: "Karen, Nairobi",
    occasion: "Garden Wedding (3-Tier Cake)",
    rating: 5,
    quote: "Carol Jenny and her team created our 3-tier wedding cake and delivered it directly to our venue in Karen. It arrived in immaculate condition despite Nairobi traffic. The passion fruit and red velvet tiers were an enormous hit!",
    date: "Last month"
  },
  {
    id: 3,
    name: "Dr. Mercy Kiprop",
    location: "Ruiru / Thika Road",
    occasion: "Master's Graduation Celebration",
    rating: 5,
    quote: "The graduation cake was so detailed! They matched my university colors down to the exact shade and the diploma scroll looked realistic. Fast delivery and super easy to order via WhatsApp.",
    date: "3 weeks ago"
  },
  {
    id: 4,
    name: "Faith Njeri",
    location: "Westlands, Nairobi",
    occasion: "Baby Shower Party",
    rating: 5,
    quote: "We ordered the pastel baby shower cake with matching cupcakes for 25 people. The cake was fresh, not overly sweet, and the gender reveal surprise inside brought tears of joy. Highly recommend Lany Cake Shop!",
    date: "1 month ago"
  }
];

export const FAQS = [
  {
    q: "How early in advance should I place my cake order?",
    a: "For standard birthday cakes and cupcakes, we recommend ordering 24 to 48 hours in advance. For same-day deliveries, please place your order before 11:00 AM via WhatsApp (+254 758 582 215). For elaborate multi-tier wedding cakes or custom sculpted builds, please give us 3 to 7 days notice."
  },
  {
    q: "Do you deliver cakes across Nairobi and surrounding towns?",
    a: "Yes! We provide safe, temperature-controlled doorstep delivery across Nairobi (Westlands, Kilimani, Karen, CBD, South C, Lang'ata), Ruiru, Kiambu, Thika Road, Juja, and surrounding areas. Delivery fees depend on your specific neighborhood."
  },
  {
    q: "Can I customize the cake flavors, writing, and design?",
    a: "Absolutely. Every cake can be personalized with your chosen inscription, preferred color scheme, and flavor (Classic Vanilla, Belgian Chocolate Fudge, Red Velvet, Tropical Passion, Black Forest, Salted Caramel). You can also send us reference photos on WhatsApp!"
  },
  {
    q: "Do you offer eggless or dietary-specific cakes?",
    a: "Yes, we bake delicious eggless cakes, dairy-free options, and gluten-conscious bakes upon request. Simply select or mention your dietary preference when ordering."
  },
  {
    q: "How do I make payment?",
    a: "We accept M-Pesa (Buy Goods Till / Paybill) as well as direct card payments and bank transfers. For custom builds and wedding orders, a 50% deposit confirms the date, with the balance cleared prior to or upon delivery."
  }
];
