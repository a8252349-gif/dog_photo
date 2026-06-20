import type { Metadata } from "next";
import { ResultViewer } from "@/components/ResultViewer";

export const metadata: Metadata = { title: "완성사진 받기", robots: { index: false, follow: false, nocache: true } };
export default async function ResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <div className="result-page"><div className="container result-page__inner"><ResultViewer token={token} /></div></div>;
}
