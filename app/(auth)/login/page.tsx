"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Stethoscope } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Email hoặc mật khẩu không đúng");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
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
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Chào mừng trở lại!</h2>
                    <p className="mt-2 text-sm text-slate-500">Đăng nhập để tiếp tục hành trình học tập Y khoa.</p>
                </div>

                <Card className="border-0 shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100 overflow-hidden">
                    <CardHeader className="space-y-1 pb-6 pt-8 text-center bg-white">
                        <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
                        <CardDescription>Nhập thông tin tài khoản của bạn</CardDescription>
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
                                <label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email</label>
                                <Input id="email" name="email" type="email" placeholder="name@hospital.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label htmlFor="password" className="text-sm font-bold text-slate-700">Mật khẩu</label>
                                    <Link href="#" className="text-xs font-semibold text-teal-600 hover:text-teal-500">Quên mật khẩu?</Link>
                                </div>
                                <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl" />
                            </div>
                            <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-teal-100 rounded-xl bg-teal-600 hover:bg-teal-700" isLoading={loading}>
                                Đăng nhập
                            </Button>
                        </form>
                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-500">
                                Chưa có tài khoản?{" "}
                                <Link href="/register" className="font-bold text-teal-600 hover:text-teal-500 transition-colors">Đăng ký ngay</Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-400">
                    &copy; 2026 Doctor Learning. Bảo lưu mọi quyền.
                </p>
            </div>
        </div>
    );
}
