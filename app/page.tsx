import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Play,
  BookOpen,
  Trophy,
  Users,
  ArrowRight,
  Check,
  Stethoscope,
  Activity,
  BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { DemoVideoPlayer } from "@/components/home/DemoVideoPlayer";

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-bg font-body text-text overflow-x-hidden selection:bg-accent-cyan selection:text-slate-900">

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="neo-card bg-white/90 backdrop-blur-md px-6 py-3 flex items-center justify-between w-full max-w-5xl rounded-full border-2 border-slate-900 shadow-neo mb-4">
          <div className="flex items-center gap-2 font-heading font-bold text-xl text-slate-900">
            <div className="w-10 h-10 bg-accent-cyan border-2 border-slate-900 rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_#0f172a]">
              <Stethoscope size={20} className="text-slate-900" />
            </div>
            <span>Doctor<span className="text-primary">Learning</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-bold hover:bg-slate-100">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button variant="neobrutalism" className="bg-accent-green hover:bg-green-400">
                Đăng ký <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center relative">
        {/* Background blobs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-pink rounded-full blur-3xl opacity-60 animate-pulse" />
        <div className="absolute top-40 right-10 w-40 h-40 bg-accent-cyan rounded-full blur-3xl opacity-60 animate-pulse delay-700" />

        <Badge variant="neobrutalism" className="mb-6 px-4 py-1.5 text-sm bg-accent-purple animate-bounce">
          🎓 Nền tảng học Y khoa tương tác #1
        </Badge>

        <h1 className="font-heading text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-slate-900 max-w-4xl">
          Học Y Khoa <span className="relative inline-block px-4 py-1 mx-2 bg-accent-cyan border-2 border-slate-900 rounded-lg shadow-neo rotate-2 transform hover:rotate-0 transition-transform cursor-default text-white" style={{ textShadow: '2px 2px 0 #000' }}>Tương Tác</span>
          Thông Minh Hơn
        </h1>

        <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl font-medium">
          Biến bài giảng video thụ động thành trải nghiệm chủ động.
          Trả lời quiz ngay trên video, ghi nhớ kiến thức lâm sàng gấp 2 lần.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 z-10">
          <Link href="/register">
            <Button size="lg" variant="neobrutalism" className="text-lg px-8 py-6 bg-accent-pink hover:bg-pink-300">
              🚀 Bắt đầu miễn phí
            </Button>
          </Link>
          <a href="#demo">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white hover:bg-slate-50">
              ▶ Xem Demo
            </Button>
          </a>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {[
            { label: "Bác sĩ tin dùng", val: "2,000+", color: "bg-accent-green" },
            { label: "Bài giảng", val: "500+", color: "bg-accent-cyan" },
            { label: "Quiz tương tác", val: "10k+", color: "bg-accent-purple" },
            { label: "Giờ học", val: "50k+", color: "bg-accent-pink" },
          ].map((stat) => (
            <div key={stat.label} className={`neo-card ${stat.color} p-4 flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform`}>
              <span className="font-heading font-bold text-2xl text-slate-900">{stat.val}</span>
              <span className="text-sm font-bold text-slate-800">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DEMO SECTION ===== */}
      <section id="demo" className="py-20 bg-slate-50 border-y-2 border-slate-900 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 bg-accent-cyan border-2 border-slate-900 rounded-full flex items-center justify-center shadow-neo mb-4">
              <Play size={32} className="text-slate-900 ml-1" />
            </div>
            <h2 className="font-heading text-4xl font-bold text-slate-900 mb-4">Trải nghiệm thực tế</h2>
            <p className="text-lg text-text-secondary">Video sẽ tự động dừng khi đến câu hỏi.</p>
          </div>

          <div className="neo-card bg-white p-2 md:p-4 border-4 shadow-[8px_8px_0px_0px_#0f172a]">
            <div className="rounded-xl overflow-hidden border-2 border-slate-900">
              <DemoVideoPlayer />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-center">
            <Badge variant="neobrutalism" className="w-fit mb-4 bg-accent-green">✨ Tính năng nổi bật</Badge>
            <h2 className="font-heading text-4xl font-bold text-slate-900 mb-6">
              Công cụ học tập <br />
              <span className="text-primary underline decoration-4 decoration-accent-pink underline-offset-4">mạnh mẽ nhất</span>
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Không chỉ là xem video. Đây là hệ thống Learning Management System (LMS) tập trung vào tương tác.
            </p>
            <Button variant="neobrutalism" className="w-fit">Khám phá tất cả tính năng</Button>
          </div>

          {[
            {
              icon: BrainCircuit,
              title: "Quiz thông minh",
              desc: "Video tự động dừng tại các điểm chốt kiến thức. Trả lời đúng mới được xem tiếp.",
              bg: "bg-accent-purple"
            },
            {
              icon: Activity,
              title: "Theo dõi tiến độ",
              desc: "Báo cáo chi tiết từng video, tỷ lệ trả lời đúng/sai để cải thiện lỗ hổng kiến thức.",
              bg: "bg-accent-cyan"
            },
            {
              icon: Users,
              title: "Cộng đồng Y khoa",
              desc: "Thảo luận, hỏi đáp ngay dưới từng tình huống lâm sàng trong bài giảng.",
              bg: "bg-accent-pink"
            },
            {
              icon: Trophy,
              title: "Gamification",
              desc: "Nhận huy hiệu, leo bảng xếp hạng khi hoàn thành các khóa học khó.",
              bg: "bg-accent-green"
            }
          ].map((feat, idx) => (
            <Card key={idx} className="group hover:bg-slate-50">
              <CardContent className="p-8 flex flex-col h-full">
                <div className={`w-14 h-14 ${feat.bg} border-2 border-slate-900 rounded-xl flex items-center justify-center shadow-neo mb-6 group-hover:scale-110 transition-transform`}>
                  <feat.icon size={28} className="text-slate-900" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto neo-card bg-slate-900 text-white p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-pink via-accent-cyan to-accent-green" />

          <div className="relative z-10">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-white">Sẵn sàng nhập cuộc?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Tham gia cùng 2,000+ sinh viên y khoa và bác sĩ đang học tập mỗi ngày.
            </p>
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-xl bg-accent-green text-slate-900 hover:bg-green-400 border-2 border-white shadow-[4px_4px_0px_0px_#ffffff]">
                Đăng ký miễn phí ngay
              </Button>
            </Link>
            <p className="mt-6 text-sm text-slate-400">Không cần thẻ tín dụng • Hủy bất cứ lúc nào</p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t-2 border-slate-900 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-heading font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <span>Doctor<span className="text-primary">Learning</span></span>
          </div>
          <div className="text-text-secondary font-medium">
            © 2026 Interactive Learning Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="font-bold hover:text-primary hover:underline">Điều khoản</a>
            <a href="#" className="font-bold hover:text-primary hover:underline">Bảo mật</a>
            <a href="#" className="font-bold hover:text-primary hover:underline">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
