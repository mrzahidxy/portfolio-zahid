import { XMLParser, XMLValidator } from "fast-xml-parser";

const MEDIUM_FEED_URL = "https://medium.com/feed/@mrzahidxy";
const parser = new XMLParser({ ignoreAttributes: true, trimValues: true });

type RawMediumItem = {
  title?: unknown;
  link?: unknown;
  pubDate?: unknown;
  category?: unknown;
  description?: unknown;
  "content:encoded"?: unknown;
};

type MediumFeedResponse = {
  rss?: {
    channel?: {
      item?: RawMediumItem | RawMediumItem[];
    };
  };
};

export interface MediumArticle {
  title: string;
  link: string;
  publishedAt: string;
  excerpt: string;
  categories: string[];
}

const getString = (value: unknown) =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : "";

const decodeCodePoint = (value: string, radix: number) => {
  const codePoint = parseInt(value, radix);
  return codePoint <= 0x10ffff && (codePoint < 0xd800 || codePoint > 0xdfff)
    ? String.fromCodePoint(codePoint)
    : "\uFFFD";
};

const getTextExcerpt = (html: string) => {
  const text = html
    .replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, " ")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, value: string) => decodeCodePoint(value, 10))
    .replace(/&#x([\da-f]+);/gi, (_, value: string) => decodeCodePoint(value, 16))
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 190 ? `${text.slice(0, 187).trimEnd()}…` : text;
};

export async function getRecentMediumArticles(): Promise<MediumArticle[]> {
  const response = await fetch(MEDIUM_FEED_URL, {
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`Medium RSS request failed with status ${response.status}.`);
  }

  const xml = await response.text();
  if (XMLValidator.validate(xml) !== true) {
    throw new Error("Medium returned an invalid RSS feed.");
  }

  const feed = parser.parse(xml) as MediumFeedResponse;
  const rawItems = feed.rss?.channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  return items
    .map((item): MediumArticle | null => {
      const title = getString(item.title).trim();
      const link = getString(item.link).trim();
      const publishedAt = new Date(getString(item.pubDate));
      const content = getString(item["content:encoded"] ?? item.description);

      if (!title || !content || !Number.isFinite(publishedAt.getTime())) {
        return null;
      }

      try {
        if (new URL(link).protocol !== "https:") return null;
      } catch {
        return null;
      }

      const rawCategories = Array.isArray(item.category)
        ? item.category
        : item.category
          ? [item.category]
          : [];

      return {
        title,
        link,
        publishedAt: publishedAt.toISOString(),
        excerpt: getTextExcerpt(content),
        categories: rawCategories
          .map((category) => getString(category).trim())
          .filter(Boolean)
          .slice(0, 2),
      };
    })
    .filter((item): item is MediumArticle => item !== null)
    .sort(
      (first, second) =>
        new Date(second.publishedAt).getTime() -
        new Date(first.publishedAt).getTime()
    )
    .slice(0, 3);
}
