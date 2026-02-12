"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Stethoscope } from "lucide-react";

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}

function RegisterForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Đăng ký thất bại");
                return;
            }

            router.push("/login?registered=true");
        } catch {
            setError("Đã xảy ra lỗi. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="h-12 w-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-200 group-hover:scale-110 transition-transform">
                            <Stethoscope size={28} />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
                            Doctor Learning
                        </span>
                    </Link>
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Tham gia cộng đồng!</h2>
                    <p className="mt-2 text-sm text-slate-500">Bắt đầu hành trình chia sẻ và tiếp nhận kiến thức Y khoa.</p>
                </div>

                <Card className="border-0 shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100 overflow-hidden">
                    <CardHeader className="space-y-1 pb-6 pt-8 text-center bg-white">
                        <CardTitle className="text-2xl font-bold">Tạo tài khoản</CardTitle>
                        <CardDescription>Điền thông tin để bắt đầu ngay</CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white px-8 pb-8 pt-0">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700">
                                <span className="mt-0.5">⚠️</span>
                                <div className="text-sm font-medium">{error}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} method="POST" className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-bold text-slate-700 ml-1">Họ và tên</label>
                                <Input id="name" name="name" type="text" placeholder="BS. Nguyễn Văn A" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email</label>
                                <Input id="email" name="email" type="email" placeholder="name@hospital.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-bold text-slate-700 ml-1">Mật khẩu</label>
                                <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required className="h-12 rounded-xl" />
                            </div>
                            <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-teal-100 rounded-xl bg-teal-600 hover:bg-teal-700" isLoading={loading}>
                                Đăng ký ngay
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-500">
                                Đã có tài khoản?{" "}
                                <Link href="/login" className="font-bold text-teal-600 hover:text-teal-500 transition-colors">Đăng nhập</Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-400">
                    Bằng cách đăng ký, bạn đồng ý với Điều khoản và Chính sách của chúng tôi.
                </p>
            </div>
        </div>
    );
}
