"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingMakeButton() {
  const pathname = usePathname();

  if (pathname === "/make" || pathname.startsWith("/make/")) {
    return null;
  }

  return (
    <Link
      href="/make"
      className="floating-make-button"
      aria-label="증멍사진 만들기 페이지로 이동"
    >
      <span className="floating-make-button__icon" aria-hidden="true">🐾</span>
      <span>증멍사진 만들기</span>
    </Link>
  );
}
