import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-brand-navy-950 text-slate-300 py-12 px-4 transition-colors duration-300 dark:bg-brand-navy-950 border-t-2 border-transparent" style={{ borderImage: 'linear-gradient(to left, transparent, #c9931d, #daa830, transparent) 1' }} dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-brand-navy-800">
          
          {/* Column 1: Brand details */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img src="/abanob-icon.png" alt="القديس أبانوب" className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-gold-400/40" />
              <span className="text-md font-bold text-white tracking-wider">
                دوري القديس أبانوب الممتاز
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
             المنصة الرسمية لإدارة وإحصائيات مسابقات كنيسة السيدة العذراء بارض الشركة / خورس القديس ابانوب. 
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-white tracking-wider">روابط سريعة</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link to="/" className="hover:text-brand-gold-300 transition-colors">الرئيسية</Link>
              <Link to="/standings" className="hover:text-brand-gold-300 transition-colors">جدول الترتيب</Link>
              <Link to="/members" className="hover:text-brand-gold-300 transition-colors">ترتيب الأفراد</Link>
              <Link to="/live" className="hover:text-brand-gold-300 transition-colors">مباشر</Link>
              <Link to="/hall-of-fame" className="hover:text-brand-gold-300 transition-colors">لوحة الشرف</Link>
              <Link to="/analytics" className="hover:text-brand-gold-300 transition-colors">التحليلات</Link>
              <Link to="/login" className="hover:text-brand-gold-300 transition-colors">دخول الإدارة</Link>
            </div>
          </div>

          {/* Column 3: Contact/About */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold text-white tracking-wider">رسالة المنصة</span>
            <p className="text-xs leading-relaxed text-slate-400">
              "وَلَكِنْ قَبْلَ كُلِّ شَيْءٍ، لِتَكُنْ مَحَبَّتُكُمْ بَعْضِكُمْ لِبَعْضٍ شَدِيدَةً، لِأَنَّ ٱلْمَحَبَّةَ تَسْتُرُ كَثْرَةً مِنَ ٱلْخَطَايَا.
 " (بُطْرُسَ ٱلْأُولَى ٤:٨)
              <br />
هدفنا إننا نتعلم حاجات جديدة ونكبر روحيًا وطقسيًا مع بعض، ونشجع بعض من خلال منافسة حلوة تخلينا نطلع أحسن ما عندنا. لكن في الآخر الأهم من أي نقاط أو ترتيب هو إن المحبة والاحترام يفضلوا موجودين بيننا دايمًا.            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-1.5">
            <span>© ٢٠٢٦ دوري القديس أبانوب. جميع الحقوق محفوظة.</span>
          </div>
          <div className="flex items-center gap-1">
            <span>صُنع بحب وشغف لخدمة كنيستنا المجيدة</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
          </div>
        </div>

      </div>
    </footer>
  );
};
