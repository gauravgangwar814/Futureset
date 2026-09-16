import { Package, CourseModule } from '../types';

export const PACKAGES: Package[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 249,
    tagline: 'Ideal kickoff for digital beginners to master online foundation skills.',
    badge: 'Beginner',
    color: 'from-blue-600 to-cyan-500',
    accentBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderColor: 'border-blue-500/30 hover:border-blue-400',
    coursesCount: 2,
    lessonsCount: 14,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    skills: [
      'Social Media Foundation & Growth',
      'Canva Graphic Design Fundamentals',
      'Organic Lead Generation Basics',
      'WhatsApp Business Automation',
      'Mindset & Productivity Systems'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 599,
    tagline: 'Boost your personal branding and start creating viral short-form content.',
    badge: 'Popular',
    color: 'from-emerald-600 to-teal-500',
    accentBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400',
    coursesCount: 4,
    lessonsCount: 28,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    skills: [
      'Instagram Reels & Viral Hook Mastery',
      'Video Editing with CapCut & VN Editor',
      'Copywriting for High-Converting Posts',
      'Organic Sales Closing on Chat',
      'Personal Branding in 30 Days'
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 1012,
    tagline: 'Accelerate conversions with sales funnels and automated client acquisition.',
    badge: 'Most Value',
    color: 'from-amber-500 to-yellow-400',
    accentBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    coursesCount: 6,
    lessonsCount: 42,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    skills: [
      'High-Converting Landing Pages & Funnels',
      'Affiliate Sales Strategy & Psychology',
      'Advanced Canva Pro & UI Graphics',
      'Email Marketing & Lead Nurturing',
      'Objection Handling & Call Closing'
    ]
  },
  {
    id: 'diamond',
    name: 'Diamond',
    price: 2299,
    tagline: 'Scale with paid traffic and high-ticket client acquisition mastery.',
    badge: 'High Impact',
    color: 'from-purple-600 to-indigo-500',
    accentBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    coursesCount: 9,
    lessonsCount: 65,
    rating: 4.95,
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    skills: [
      'Meta (Facebook & Instagram) Paid Ads Mastery',
      'High-Ticket B2B & Freelance Selling',
      'Audience Retargeting & Custom Audiences',
      'Client Onboarding & Retention Systems',
      'Public Speaking & Live Webinar Selling'
    ]
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 4299,
    tagline: 'Advanced wealth creation, stock market basics, and scalable systems.',
    badge: 'Executive',
    color: 'from-rose-600 to-orange-500',
    accentBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    coursesCount: 12,
    lessonsCount: 90,
    rating: 4.98,
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
    skills: [
      'Stock Market & Fundamental Analysis',
      'AI Tools & Workflow Automation (ChatGPT, Midjourney)',
      'Agency Scalability & Team Delegation',
      'Google Ads & Search Engine Mastery',
      'Brand Sponsorships & Influencer Deals'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 7299,
    tagline: 'The ultimate all-inclusive masterclass ecosystem with mentorship access.',
    badge: 'Ultimate VIP',
    color: 'from-yellow-400 via-amber-300 to-orange-500',
    accentBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    borderColor: 'border-yellow-500/60 hover:border-yellow-300 shadow-yellow-500/10',
    coursesCount: 16,
    lessonsCount: 128,
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    skills: [
      'Complete Access to All 6 Packages',
      '1-on-1 VIP Mentorship Sessions & Blueprints',
      'Full-Stack Digital Business Architecture',
      'Wealth Management & Investment Frameworks',
      'Lifetime Course Updates & Live Q&A Masterclasses'
    ]
  }
];

export const COURSE_MODULES: Record<string, CourseModule[]> = {
  starter: [
    {
      id: 'm1',
      packageId: 'starter',
      title: 'Digital Marketing & Social Media Fundamentals',
      level: 'Beginner',
      instructor: 'Vikram Malhotra',
      description: 'Master the core digital landscape, understand audience psychology, and establish an authoritative profile on Instagram, YouTube, and LinkedIn.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
      lessons: [
        {
          id: 'l1',
          title: 'Introduction to FutureSet Digital Ecosystem',
          duration: '14:20',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
          description: 'Overview of modern high-income digital skills and setting up your growth roadmap for success.',
          keyTakeaways: ['Understanding platform mechanics', 'Setting realistic monthly income goals', 'Optimizing profile bio and aesthetic']
        },
        {
          id: 'l2',
          title: 'Profile Optimization & Bio Blueprint',
          duration: '18:45',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
          description: 'Step-by-step audit to convert casual profile visitors into high-intent inbound connections.',
          keyTakeaways: ['High-converting bio formula', 'Clear call to action placement', 'Story highlights that build authority']
        },
        {
          id: 'l3',
          title: 'Canva Graphic Design for Beginners',
          duration: '22:10',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&auto=format&fit=crop&q=80',
          description: 'Design eye-catching carousels, thumbnails, and quotes without prior design background.',
          keyTakeaways: ['Typography and color palettes', 'Hierarchy in social creatives', 'Exporting crisp 1080p formats']
        }
      ]
    },
    {
      id: 'm2',
      packageId: 'starter',
      title: 'WhatsApp Business & Lead Management',
      level: 'Beginner to Intermediate',
      instructor: 'Ananya Roy',
      description: 'Turn your WhatsApp into a customer acquisition hub using catalogs, labels, and auto-replies.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&auto=format&fit=crop&q=80',
      lessons: [
        {
          id: 'l4',
          title: 'Setting up WhatsApp Business like a Pro',
          duration: '16:30',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?w=600&auto=format&fit=crop&q=80',
          description: 'Quick-replies, business profile verification, and automated away messages setup.',
          keyTakeaways: ['Greeting templates', 'Customer sorting with labels', 'Broadcast hygiene rules']
        }
      ]
    }
  ],
  basic: [
    {
      id: 'm3',
      packageId: 'basic',
      title: 'Short-Form Content & Viral Reels Mastery',
      level: 'Intermediate',
      instructor: 'Kabir Singhania',
      description: 'Learn scriptwriting hooks, seamless pacing, B-roll selection, and editing using CapCut.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
      lessons: [
        {
          id: 'l5',
          title: 'The 3-Second Visual & Audio Hook Formula',
          duration: '21:15',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&auto=format&fit=crop&q=80',
          description: 'How to capture attention instantly and keep retention above 80% to trigger platform algorithms.',
          keyTakeaways: ['Pattern interrupts', 'Trending audio selection', 'Captions formatting with high contrast']
        },
        {
          id: 'l6',
          title: 'Mobile Video Editing with CapCut & VN',
          duration: '29:40',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
          description: 'Hands-on live editing workflow: transitions, sound effects, keyframes, and color grading.',
          keyTakeaways: ['J-cuts and L-cuts', 'Dynamic zoom effects', 'Audio balancing for crystal clear voice']
        }
      ]
    }
  ],
  gold: [
    {
      id: 'm4',
      packageId: 'gold',
      title: 'High-Converting Sales Funnels & Email Systems',
      level: 'Advanced',
      instructor: 'Rohan Verma',
      description: 'Build automated lead funnels that nurture prospects 24/7 and close sales on autopilot.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
      lessons: [
        {
          id: 'l7',
          title: 'Anatomy of a ₹10 Lakh Sales Funnel',
          duration: '31:50',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
          description: 'Deconstructing top performing landing pages, VSL (video sales letters), and thank-you sequences.',
          keyTakeaways: ['Headline psychology', 'Social proof stacking', 'Urgency and scarcity triggers']
        },
        {
          id: 'l8',
          title: 'Consultative Chat & Call Closing',
          duration: '26:00',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=600&auto=format&fit=crop&q=80',
          description: 'How to ask diagnostic questions and overcome price resistance with confidence.',
          keyTakeaways: ['5-step closing framework', 'Turning "I will think about it" into immediate actions', 'Follow-up cadences']
        }
      ]
    }
  ],
  diamond: [
    {
      id: 'm5',
      packageId: 'diamond',
      title: 'Meta Ads (Facebook & Instagram) Scaling Engine',
      level: 'Expert',
      instructor: 'Devansh Mehra',
      description: 'Deploy profitable paid ad campaigns with laser-targeted custom audiences and ROAS above 4x.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&auto=format&fit=crop&q=80',
      lessons: [
        {
          id: 'l9',
          title: 'Ads Manager Setup & Pixel Tracking',
          duration: '34:10',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
          description: 'Setting up Business Portfolio, CAPI (Conversions API), and domain verification.',
          keyTakeaways: ['Event setup tool', 'Custom audience creation', 'Lookalike audience strategies']
        },
        {
          id: 'l10',
          title: 'Ad Creatives & Copy Testing Matrix',
          duration: '28:40',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
          description: 'A/B testing hooks, headlines, and thumbnail variants without burning ad budget.',
          keyTakeaways: ['Dynamic creative testing', 'Kill & scale benchmarks', 'Budget allocation for profitability']
        }
      ]
    }
  ],
  elite: [
    {
      id: 'm6',
      packageId: 'elite',
      title: 'AI Workflows, Automation & Agency Systems',
      level: 'Master',
      instructor: 'Arjun Kapoor & Team',
      description: 'Leverage generative AI to multiply your output by 10x and build a remote agency.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
      lessons: [
        {
          id: 'l11',
          title: 'Prompt Engineering & AI Content Engines',
          duration: '38:20',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
          description: 'Mastering AI tools for scripting, high-end visual design, voice cloning, and workflow automation.',
          keyTakeaways: ['Custom GPT building', 'Automated zapier pipelines', 'High-speed content production']
        },
        {
          id: 'l12',
          title: 'Stock Market & Long-Term Wealth Accumulation',
          duration: '42:15',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
          description: 'Fundamental investing principles to grow and protect your online profits in index & growth stocks.',
          keyTakeaways: ['Compound interest calculator in action', 'Risk management & portfolio diversification', 'Tax efficient structures']
        }
      ]
    }
  ],
  pro: [
    {
      id: 'm7',
      packageId: 'pro',
      title: 'Pro VIP Elite Mastermind & Complete Business Blueprint',
      level: 'VIP Mastermind',
      instructor: 'Chief Mentors & Industry Leaders',
      description: 'Access the complete vault of FutureSet courses across all 6 packages with 1-on-1 growth blueprints.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      lessons: [
        {
          id: 'l13',
          title: 'The ₹1 Crore Digital Business Roadmap',
          duration: '54:00',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
          description: 'Holistic architectural masterclass tying organic brand building, paid ad flywheels, and team management.',
          keyTakeaways: ['Scale bottlenecks & fixes', 'High-margin product packaging', 'Community-driven recurring revenue']
        },
        {
          id: 'l14',
          title: 'VIP Mastermind Case Studies & Private Q&A',
          duration: '49:30',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
          description: 'Breakdown of real affiliate earners, campaign setups, ad creative copies, and live audit sessions.',
          keyTakeaways: ['Real funnel review', 'Optimizing conversion drops', 'Direct mentor contact strategies']
        }
      ]
    }
  ]
};

// Package tier order: lower tier index means smaller package
export const PACKAGE_TIERS = ['starter', 'basic', 'gold', 'diamond', 'elite', 'pro'];

// Helper to get all unlocked package IDs for a registered package tier (includes current & all lower packages)
export function getUnlockedPackageIds(packageId?: string): string[] {
  if (!packageId) return ['starter'];
  const userTierIndex = PACKAGE_TIERS.indexOf(packageId.toLowerCase().trim());
  if (userTierIndex === -1) {
    return ['starter'];
  }
  return PACKAGE_TIERS.slice(0, userTierIndex + 1);
}

// Helper to check if a target package's content is accessible with user's registered package
export function isPackageAccessible(userPackageId?: string, targetPackageId?: string): boolean {
  if (!userPackageId || !targetPackageId) return false;
  const userIndex = PACKAGE_TIERS.indexOf(userPackageId.toLowerCase().trim());
  const targetIndex = PACKAGE_TIERS.indexOf(targetPackageId.toLowerCase().trim());
  if (userIndex === -1 || targetIndex === -1) return false;
  return targetIndex <= userIndex;
}

// Helper to get all unlocked modules for a package tier (current package + all smaller packages)
export function getUnlockedModulesForPackage(packageId: string): CourseModule[] {
  const userTierIndex = PACKAGE_TIERS.indexOf(packageId?.toLowerCase()?.trim() || '');
  if (userTierIndex === -1) {
    return COURSE_MODULES['starter'] || [];
  }

  const unlocked: CourseModule[] = [];
  for (let i = 0; i <= userTierIndex; i++) {
    const tier = PACKAGE_TIERS[i];
    if (COURSE_MODULES[tier]) {
      unlocked.push(...COURSE_MODULES[tier]);
    }
  }
  return unlocked;
}
