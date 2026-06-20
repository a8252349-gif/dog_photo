import type { MetadataRoute } from "next";
import { getPublishedStories } from "@/lib/story-service";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: Array<[string, MetadataRoute.Sitemap[number]["changeFrequency"], number]> = [
    ["/", "weekly", 1], ["/products", "monthly", .9], ["/dog-id-photo", "monthly", .9], ["/cat-id-photo", "monthly", .9],
    ["/guide/photo-selection", "monthly", .8], ["/guide/background-colors", "monthly", .8], ["/guide/print-frame", "monthly", .75],
    ["/story", "weekly", .8], ["/faq", "monthly", .7], ["/about", "yearly", .5],
    ["/policy/privacy", "yearly", .2], ["/policy/terms", "yearly", .2], ["/policy/refund", "yearly", .2],
  ];
  const stories = await getPublishedStories();
  return [
    ...staticPages.map(([path, changeFrequency, priority]) => ({ url: absoluteUrl(path), lastModified: now, changeFrequency, priority })),
    ...stories.map((story) => ({ url: absoluteUrl(`/story/${story.slug}`), lastModified: new Date(story.updatedAt || story.publishedAt || now), changeFrequency: "monthly" as const, priority: .65 })),
  ];
}
