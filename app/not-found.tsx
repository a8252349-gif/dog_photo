import Link from "next/link";
export default function NotFound() {
  return <section className="simple-page"><div className="shell narrow center"><span className="eyebrow">404</span><h1>페이지를 찾지 못했습니다.</h1><p>주소가 변경되었거나 삭제된 페이지일 수 있습니다.</p><Link className="button" href="/">홈으로 돌아가기</Link></div></section>;
}
