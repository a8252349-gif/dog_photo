# 네이버·구글 검색 노출 반영 내역

이 프로젝트는 검색 순위를 보장하는 방식이 아니라, 검색로봇이 페이지를 발견·수집·이해하기 쉬운 기술 구조를 갖추는 데 초점을 맞춥니다.

## 네이버 서치어드바이저 반영

- 공개 페이지마다 고유한 `<title>`과 `meta description`
- 서버에서 바로 읽을 수 있는 본문과 일반 링크
- `/robots.txt`, `/sitemap.xml`, `/rss.xml`
- 네이버 사이트 소유 확인 메타태그 환경변수
- canonical URL과 Open Graph 메타데이터
- WebSite, Organization, Product, Article, FAQ, Breadcrumb JSON-LD
- 스마트스토어를 Organization `sameAs` 채널로 연결
- 관리자·쿠폰 제작·결과 페이지 noindex 및 robots 차단
- 게시글 발행 시 RSS와 사이트맵에 자동 반영

공식 참고:
- https://searchadvisor.naver.com/guide/seo-help
- https://searchadvisor.naver.com/guide/request-feed
- https://searchadvisor.naver.com/guide/report-seo
- https://searchadvisor.naver.com/guide/structured-data-intro
- https://searchadvisor.naver.com/guide/structured-data-channel

## Google Search 반영

- 페이지별 canonical, title, description, Open Graph
- 모바일 반응형 레이아웃
- XML sitemap과 robots
- Product, Article, Breadcrumb, Organization 구조화 데이터
- 이미지 대체텍스트
- 공개 콘텐츠와 개인정보성 페이지의 index 정책 분리
- SSR/정적 렌더링 본문 및 crawl 가능한 내부 링크

공식 참고:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/fundamentals/get-started-developers
- https://developers.google.com/search/docs/advanced/sitemaps/overview
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing

## 배포 후 제출 주소

```text
https://실제도메인/sitemap.xml
https://실제도메인/rss.xml
https://실제도메인/robots.txt
```

`NEXT_PUBLIC_SITE_URL`에는 마지막 `/` 없이 실제 대표 도메인을 입력해야 canonical, RSS, 사이트맵 주소가 올바르게 생성됩니다.
