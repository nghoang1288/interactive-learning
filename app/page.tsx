import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { PlusCircle, Video, MessageSquare, TrendingUp, BarChart3, CheckCircle2, Stethoscope } from "lucide-react";
import { DemoVideoPlayer } from "@/components/home/DemoVideoPlayer";

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative py-24 md:py-36 overflow-hidden bg-white dark:bg-slate-950 w-full flex justify-center">
        <div className="absolute -top-24 right-0 w-[30rem] h-[30rem] bg-teal-50/70 dark:bg-teal-900/20 rounded-full blur-[80px] opacity-60" />
        <div className="absolute -bottom-24 left-0 w-[30rem] h-[30rem] bg-cyan-50/70 dark:bg-cyan-900/20 rounded-full blur-[80px] opacity-60" />

        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="primary" className="mb-8 px-5 py-1.5 shadow-sm">🩺 Nền tảng học Y khoa thế hệ mới</Badge>
            <h1 className="text-4xl md:text-7xl font-extrabold mb-8 tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Học Y khoa <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">tương tác</span><br />
              thông minh hơn
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Biến bài giảng video thành trải nghiệm học tập chủ động.
              Tạo Quiz tích hợp — nắm vững kiến thức Y khoa ngay khi đang xem.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/register" className="w-full sm:w-auto btn btn-primary btn-lg rounded-2xl shadow-2xl shadow-teal-200/50 px-10 py-4.5 text-base font-bold bg-teal-600 border-0 hover:bg-black transition-all">
                🚀 Bắt đầu miễn phí
              </Link>
              <a href="#demo" className="w-full sm:w-auto btn btn-secondary btn-lg rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 px-10 py-4.5 text-base font-semibold transition-all">
                ▶ Xem Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DEMO VIDEO SECTION ===== */}
      <section id="demo" className="py-24 bg-slate-50/60 dark:bg-slate-900/60 border-y border-slate-100/80 dark:border-slate-800/80 w-full flex flex-col items-center">
        <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">🎬 Trải nghiệm thực tế</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Mô phỏng hiển thị Quiz tương tác trên trình phát video.</p>
          </div>
          <DemoVideoPlayer />
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Upload", desc: "Tải lên video bài giảng" },
              { step: "2", title: "Tạo Quiz", desc: "Đặt câu hỏi tại mốc giờ" },
              { step: "3", title: "Tương tác", desc: "Dừng video để trả lời" },
              { step: "4", title: "Kết quả", desc: "Đúng mới được xem tiếp" },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white font-bold text-base mb-5 shadow-xl shadow-teal-100 group-hover:bg-black group-hover:scale-110 transition-all duration-300">
                  {item.step}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">{item.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-28 bg-white dark:bg-slate-950 w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">✨ Tại sao chọn Doctor Learning?</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">Công cụ giúp chia sẻ và tiếp nhận kiến thức Y khoa hiệu quả hơn.</p>
            </div>
            <Link href="/register" className="group text-teal-600 font-bold hover:text-black flex items-center gap-2 transition-colors">
              Khám phá tất cả <PlusCircle size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: PlusCircle, title: "Quản lý bài giảng", desc: "Tạo, chỉnh sửa và chia sẻ video bài giảng Y khoa của bạn.", color: "text-teal-600", bg: "bg-teal-50" },
              { icon: MessageSquare, title: "Quiz thông minh", desc: "Người xem phải trả lời đúng mới có thể xem tiếp — đảm bảo nắm vững kiến thức.", color: "text-cyan-600", bg: "bg-cyan-50" },
              { icon: BarChart3, title: "Báo cáo Insight", desc: "Xem chi tiết tiến độ học tập, biết được phần nào hay trả lời sai nhất.", color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((feature) => (
              <div key={feature.title} className="group p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-2xl hover:shadow-teal-100/30 dark:hover:shadow-teal-900/10 transition-all duration-500 hover:-translate-y-2">
                <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:rotate-6", feature.bg)}>
                  <feature.icon className={cn("h-8 w-8", feature.color)} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[4rem] p-10 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[40rem] h-[40rem] bg-teal-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[40rem] h-[40rem] bg-cyan-600/10 rounded-full blur-[120px]" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">Sẵn sàng nâng tầm kiến thức?</h2>
              <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto">Cùng xây dựng cộng đồng chia sẻ kiến thức Y khoa chất lượng cao.</p>
              <Link href="/register" className="btn bg-teal-600 text-white hover:bg-teal-700 rounded-2xl px-12 py-4 font-extrabold shadow-lg border-0 transition-all inline-block">
                🩺 Tham gia ngay — Miễn phí
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-20 border-t border-slate-100 dark:border-slate-800 w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400 text-base">
          <div className="flex items-center justify-center gap-2 text-slate-900 dark:text-white font-bold mb-6">
            <Stethoscope className="text-teal-600 dark:text-teal-400" size={24} />
            <span className="text-xl tracking-tight">Doctor <span className="text-teal-600 dark:text-teal-400">Learning</span></span>
          </div>
          <p>© 2026 Doctor Learning. Nền tảng học Y khoa tương tác.</p>
        </div>
      </footer>
    </div>
  );
}

function Badge({ variant, className, children }: any) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full text-xs font-semibold tracking-wide uppercase",
      variant === "primary" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600",
      className
    )}>
      {children}
    </span>
  );
}
