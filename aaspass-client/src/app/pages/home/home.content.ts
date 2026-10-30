/** Static copy for the Home landing page. Icon values are @ng-icons/lucide export names. */

export interface HomeCategory { name: string; icon: string; description: string; }
export interface SellerBenefit { title: string; description: string; icon: string; }
export interface ExampleSeller { label: string; category: string; }
export interface ContentStep { title: string; description: string; }
export interface Comparison { problem: string; issue: string; aaspass: string; }
export interface ContentPoint { title: string; description: string; icon: string; }
export interface Faq { question: string; answer: string; }

/** Names must equal StoreService.categories minus 'All'. */
export const HOME_CATEGORIES: readonly HomeCategory[] = [
  { name: 'Video & Editing', icon: 'lucideClapperboard', description: 'Video and short reels editing' },
  { name: 'Web & Tech', icon: 'lucideCode', description: 'Web, app and tech development' },
  { name: 'Photography', icon: 'lucideCamera', description: 'Event and product photography' },
  { name: 'Tutoring & Education', icon: 'lucideGraduationCap', description: 'Tutoring and mentorship' },
  { name: 'Graphics & Design', icon: 'lucidePalette', description: 'Graphics, logos and brand design' },
  { name: 'Tech Support & Hardware', icon: 'lucideWrench', description: 'Tech support, PC builds and hardware setup' },
  { name: 'Astrology & Spiritual', icon: 'lucideSparkles', description: 'Astrology and spiritual guidance' },
  { name: 'Driving & Transport', icon: 'lucideCar', description: 'Car drivers and local transport' },
  { name: 'Fitness & Self-Defense', icon: 'lucideDumbbell', description: 'Self-defense and fitness coaching' },
  { name: 'Art, Music & Hobbies', icon: 'lucideMusic', description: 'Drawing and music classes' },
  { name: 'Home & Personal Services', icon: 'lucideHouse', description: 'Household help, errands and personal services' },
  { name: 'Event Management', icon: 'lucidePartyPopper', description: 'Weddings, parties and event planning' },
  { name: 'Interior Design & Planning', icon: 'lucideSofa', description: 'Interior design, space planning and decor' },
  { name: 'Mehendi Design', icon: 'lucideHand', description: 'Bridal and festive mehendi artists' },
  { name: 'Pandit & Puja Services', icon: 'lucideFlame', description: 'Pandits for puja, havan and ceremonies' },
  { name: 'Decoration & Florist', icon: 'lucideFlower2', description: 'Flower, balloon and venue decoration' },
  { name: 'Beauty, Makeup & Salon', icon: 'lucideScissors', description: 'Makeup artists, hair and salon at home' },
  { name: 'Catering & Home Cooking', icon: 'lucideChefHat', description: 'Home cooks, tiffin and event catering' },
  { name: 'Tailoring & Fashion', icon: 'lucideShirt', description: 'Tailors, alterations and fashion styling' },
  { name: 'Electrician & Plumbing', icon: 'lucideZap', description: 'Electrical, plumbing and fitting work' },
  { name: 'Carpentry & Painting', icon: 'lucideHammer', description: 'Carpenters, furniture fixes and painters' },
  { name: 'Appliance Repair', icon: 'lucideRefrigerator', description: 'AC, fridge, washing machine and appliance repair' },
  { name: 'Cleaning & Pest Control', icon: 'lucideSprayCan', description: 'Home cleaning and pest control' },
  { name: 'Pet Care', icon: 'lucidePawPrint', description: 'Pet sitting, walking and grooming' },
  { name: 'Babysitting & Elder Care', icon: 'lucideBaby', description: 'Babysitters, nannies and elder care' },
  { name: 'Packers & Movers', icon: 'lucideTruck', description: 'Packing, shifting and local moving' },
  { name: 'Health & Wellness', icon: 'lucideHeartPulse', description: 'Physiotherapy, nutrition and massage' },
  { name: 'Legal, Tax & Accounting', icon: 'lucideScale', description: 'Lawyers, CAs, tax filing and bookkeeping' },
  { name: 'Marketing & Social Media', icon: 'lucideMegaphone', description: 'Social media, ads and local promotion' },
  { name: 'Writing & Translation', icon: 'lucidePenLine', description: 'Content writing, resumes and translation' },
  { name: 'DJ & Live Entertainment', icon: 'lucideSpeaker', description: 'DJs, anchors and live performers' }
];

export const SELLER_COPY = {
  heading: "Your skill is a store waiting to open",
  intro: "Anyone can open a store on AasPass. Whether you're a pandit, an astrologer, a car driver, a teacher, a self-defense coach or someone who loves to draw — if people around you would value what you know, there's a place for you here.",
  ctaBody: "No office, no commission, no years of reviews needed. List your skill, set your price and start getting gigs from people within walking distance."
} as const;

export const SELLER_BENEFITS: readonly SellerBenefit[] = [
  { title: 'Zero commission', icon: 'lucidePercent', description: 'What your customers pay is what you keep. AasPass takes no commission on your earnings.' },
  { title: 'We grow your network', icon: 'lucideUsers', description: 'Your store is shown to neighbors searching nearby, so new clients can find you without ads or cold calls.' },
  { title: 'Earn on your schedule', icon: 'lucideCalendarClock', description: 'Keep your job or studies. Take gigs when it suits you and build a steady side income.' },
  { title: 'Scroll time into earning time', icon: 'lucideSmartphone', description: 'Have a spare hour? Instead of scrolling reels, spend it on a gig and turn free time into real income.' }
];

export const EXAMPLE_SELLERS: readonly ExampleSeller[] = [
  { label: 'Pandit & puja services', category: 'Pandit & Puja Services' },
  { label: 'Astrologer', category: 'Astrology & Spiritual' },
  { label: 'Car driver', category: 'Driving & Transport' },
  { label: 'Home tutor / teacher', category: 'Tutoring & Education' },
  { label: 'Self-defense coach', category: 'Fitness & Self-Defense' },
  { label: 'Drawing & art teacher', category: 'Art, Music & Hobbies' },
  { label: 'Music teacher', category: 'Art, Music & Hobbies' },
  { label: 'Yoga trainer', category: 'Fitness & Self-Defense' },
  { label: 'Reel editor', category: 'Video & Editing' },
  { label: 'Photographer', category: 'Photography' },
  { label: 'Web developer', category: 'Web & Tech' },
  { label: 'Home cook', category: 'Catering & Home Cooking' },
  { label: 'Tailor', category: 'Tailoring & Fashion' },
  { label: 'Mehendi artist', category: 'Mehendi Design' }
];

export const HIRE_STEPS: readonly ContentStep[] = [
  { title: 'Search nearby', description: 'Find talent in your city, filtered by category.' },
  { title: 'View storefront & packages', description: 'See the bio, experience, hourly rate, service packages with turnaround times and verified social links.' },
  { title: 'Book or request a callback', description: 'Send a one-click service booking request or ask for a callback.' }
];

export const EARN_STEPS: readonly ContentStep[] = [
  { title: 'Sign up', description: 'Every user can hire and earn with a single, unified account.' },
  { title: 'Open your store with live preview', description: 'Add your store identity, category, hourly rates and neighborhood radius, and see your store card as neighbors will in real time.' },
  { title: 'Receive neighborhood gigs', description: 'Get booking and callback requests from people near you, and switch between Open for gigs and Paused anytime.' }
];

export const COMPARISONS: readonly Comparison[] = [
  { problem: 'Global freelance sites', issue: 'Highly saturated, with steep 20% commission fees, and impossible for newcomers to win clients without hundreds of past reviews.', aaspass: 'Zero commission, and neighbors find newcomers nearby without years of reviews.' },
  { problem: 'Service directories', issue: 'Strictly standardized for manual household repairs, ignoring creative, digital and professional skills.', aaspass: 'Creative, digital and professional skills get their own storefronts.' },
  { problem: 'Google Maps', issue: 'Only caters to brick-and-mortar storefronts, so a student editing reels cannot list a shop without exposing their private home.', aaspass: 'A neighborhood skill storefront with no physical shop and no home address exposed.' },
  { problem: 'Apartment / society groups', issue: 'Local demand hides in unorganized WhatsApp and society groups where requests get buried in chat streams.', aaspass: 'Organized, searchable stores and direct booking requests instead of buried chats.' }
];

export const VALUE_PROPS: readonly ContentPoint[] = [
  { title: 'Physical proximity & trust', icon: 'lucideMapPin', description: 'Hire someone 1–3 km away whom you can meet at a local cafe or collaborate with in person.' },
  { title: 'Low barrier for newcomers', icon: 'lucideStore', description: 'Tailored for students and individuals new to a city wanting flexible side income without needing a physical commercial shop.' },
  { title: 'Fast turnaround', icon: 'lucideClock', description: 'Direct, neighborhood-speed execution for same-day video edits, tutoring, photography, web fixes or event support.' }
];

export const TRUST_POINTS: readonly ContentPoint[] = [
  { title: 'Encrypted ID data', icon: 'lucideLock', description: 'Aadhaar and PAN are stored AES-256-GCM encrypted and only ever shown masked.' },
  { title: 'Secure sessions', icon: 'lucideShieldCheck', description: 'Sessions live in HttpOnly cookies, so tokens are never exposed to JavaScript.' },
  { title: 'Verified social links', icon: 'lucideBadgeCheck', description: 'Stores link to Instagram, LinkedIn, GitHub and external portfolios.' },
  { title: 'Neighbor reviews', icon: 'lucideMessageSquare', description: 'Read reviews from neighbors on each store before you book.' }
];

export const FAQS: readonly Faq[] = [
  { question: 'Does AasPass take a commission?', answer: 'No. AasPass takes zero commission — everything your customer pays for your service is yours.' },
  { question: 'What kind of store can I open?', answer: 'Almost anything people nearby need: puja and astrology, event management, interior design, mehendi, beauty and makeup, home repairs, driving, tutoring, self-defense and fitness, drawing and music classes, cooking, tailoring, video editing, photography, web development and much more.' },
  { question: 'Do I need a shop?', answer: 'No. AasPass is tailored for students and individuals who want flexible side income without needing a physical commercial shop, and you never have to expose your private home.' },
  { question: 'How close are providers?', answer: 'Providers are in your immediate vicinity, typically 2 to 10 km away.' },
  { question: 'Is my ID data safe?', answer: 'Aadhaar and PAN are stored AES-256-GCM encrypted and only ever shown masked. Sessions use HttpOnly cookies, so tokens are never exposed to JavaScript.' },
  { question: 'Can I both hire and earn?', answer: 'Yes. AasPass uses a single, unified account: every user can hire local providers, and can open a store at any time to start receiving gigs.' }
];

export const CONTACT_COPY = {
  heading: 'Have a doubt?',
  body: 'Questions about a store, your account, or how AasPass works? Send us a message and our team will contact you.',
  cta: 'Contact us'
} as const;
