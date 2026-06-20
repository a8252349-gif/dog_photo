import { getPublishedStories } from "@/lib/story-service";
import { SITE, absoluteUrl } from "@/lib/site";
import { escapeXml } from "@/lib/xml";

export const dynamic = "force-dynamic";
export async function GET() {
  const stories = await getPublishedStories(50);
  const items = stories.map((story) => `
    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${escapeXml(absoluteUrl(`/story/${story.slug}`))}</link>
      <guid isPermaLink="true">${escapeXml(absoluteUrl(`/story/${story.slug}`))}</guid>
      <description>${escapeXml(story.summary)}</description>
      <pubDate>${new Date(story.publishedAt || story.createdAt).toUTCString()}</pubDate>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"><channel>
<title>${escapeXml(`${SITE.name} 이야기`)}</title>
<link>${escapeXml(SITE.url)}</link>
<description>${escapeXml(SITE.description)}</description>
<language>ko-KR</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
${items}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}
