export interface Package {
  id: string;
  name: string;
  price: number;
  tagline: string;
  badge?: string;
  color: string;
  accentBg: string;
  borderColor: string;
  coursesCount: number;
  lessonsCount: number;
  rating: number;
  skills: string[];
  imageUrl?: string;
}

export interface UserKYC {
  name: string;
  bankName: string;
  accountNumber?: string;
  ifscCode: string;
  upiId: string;
  isCompleted: boolean;
  updatedAt?: string;
}

export interface UserEarnings {
  today: number;
  last7Days: number;
  last30Days: number;
  allTime: number;
  passiveIncome: number;
}

export interface EarningTransaction {
  id: string;
  userId: string;
  type?: 'direct' | 'passive';
  amount: number;
  packageId: string;
  packageName: string;
  packagePrice: number;
  fromUserId?: string;
  fromUserName?: string;
  fromUserEmail?: string;
  directReferrerName?: string;
  timestamp: string;
  note?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  password?: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  referralCode: string;
  referredByCode?: string;
  avatarUrl: string;
  status: 'pending' | 'active';
  createdAt: string;
  paymentScreenshot?: string;
  paymentUpiTxId?: string;
  kyc: UserKYC;
  earnings: UserEarnings;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userWhatsapp?: string;
  amount: number;
  upiId: string;
  bankName: string;
  accountNumber?: string;
  ifscCode?: string;
  status: 'pending' | 'processed' | 'approved';
  requestedAt: string;
  approvedAt?: string;
}

export interface UpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userWhatsapp?: string;
  currentPackageId: string;
  currentPackageName: string;
  currentPackagePrice: number;
  targetPackageId: string;
  targetPackageName: string;
  targetPackagePrice: number;
  amount: number;
  paymentScreenshot: string;
  paymentUpiTxId?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  keyTakeaways: string[];
}

export interface CourseModule {
  id: string;
  packageId: string;
  title: string;
  level: string;
  description: string;
  instructor: string;
  thumbnailUrl: string;
  lessons: CourseLesson[];
}

export type ActiveView = 
  | 'home'
  | 'checkout_registration'
  | 'checkout_payment'
  | 'login'
  | 'profile_initial'
  | 'profile_edit'
  | 'courses'
  | 'affiliate_dashboard'
  | 'affiliate_link'
  | 'upgrade_package'
  | 'kyc'
  | 'withdrawal'
  | 'leaderboard'
  | 'admin_login'
  | 'admin_dashboard';
