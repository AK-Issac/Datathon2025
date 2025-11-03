// components/landing-page.tsx

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, Bot, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-semibold">S3rpent</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/workspace" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Go to Workspace
          </Link>
          <Button asChild>
            <Link href="/workspace">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    AI-Powered Regulatory Intelligence
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Transform complex regulatory documents into actionable insights. Aura uses advanced AI to analyze, score, and predict the impact on your portfolio.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/workspace">Go to Workspace</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                  <Bot className="h-48 w-48 text-primary/30" />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Work Smarter, Not Harder</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides the tools you need to stay ahead of regulatory changes and make informed decisions.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <Zap className="h-8 w-8 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Instant Analysis</h3>
                <p className="text-muted-foreground">Upload any document and get a comprehensive impact report in minutes.</p>
              </div>
              <div className="grid gap-1 text-center">
                <ShieldCheck className="h-8 w-8 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Data-Driven Insights</h3>
                <p className="text-muted-foreground">Identify affected companies, sectors, and quantify the risk with our scoring engine.</p>
              </div>
              <div className="grid gap-1 text-center">
                <Bot className="h-8 w-8 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Interactive AI Chat</h3>
                <p className="text-muted-foreground">Ask questions in plain English and get cited answers directly from source documents.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Aura Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}