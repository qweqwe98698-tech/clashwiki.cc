import fs from 'fs';
import path from 'path';

// Load site config to read site base path if needed
const POSTS_DIR = path.resolve('src/data/post');
const AIRPORTS_JSON = path.resolve('src/data/airports.json');

// DeepSeek config
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Custom User-Agent to avoid getting blocked by Weibo
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://weibo.com/'
};

// 1. Fetch Weibo Hot Searches
async function fetchWeiboHot() {
  console.log('Fetching Weibo Hot Searches...');
  try {
    const res = await fetch('https://weibo.com/ajax/side/hotSearch', { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.ok === 1 && data.data && data.data.realtime) {
      return data.data.realtime
        .slice(0, 15)
        .map(item => item.word)
        .filter(word => !word.includes('广告') && word.length > 2);
    }
  } catch (err) {
    console.error('Failed to fetch Weibo Hot searches, trying backup RSS...', err.message);
  }
  return [];
}

// 2. Fetch IT Home Tech RSS as fallback/complement
async function fetchTechNews() {
  console.log('Fetching IT Home Tech RSS...');
  try {
    const res = await fetch('https://www.ithome.com/rss/', { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const xml = await res.text();
    // Simple regex parsing of RSS titles to avoid importing xml2js
    const matches = xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g);
    const titles = [];
    for (const match of matches) {
      if (match[1] && match[1].length > 5 && !match[1].includes('IT之家')) {
        titles.push(match[1]);
      }
    }
    return titles.slice(0, 15);
  } catch (err) {
    console.error('Failed to fetch Tech RSS:', err.message);
  }
  return [];
}

// 3. Scan existing files to check for duplicate slugs
function getExistingSlugs() {
  if (!fs.existsSync(POSTS_DIR)) {
    return new Set();
  }
  const files = fs.readdirSync(POSTS_DIR);
  const slugs = new Set();
  for (const file of files) {
    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const slugMatch = content.match(/slug:\s*['"]?([a-zA-Z0-9-]+)['"]?/);
      if (slugMatch) {
        slugs.add(slugMatch[1]);
      } else {
        slugs.add(file.replace(/\.mdx?$/, ''));
      }
    }
  }
  return slugs;
}

// 4. Generate dynamic internal link map (SEO Spider Web)
function buildInternalLinks(text) {
  // Read airports database to auto-link matching airport reviews
  let airports = [];
  try {
    if (fs.existsSync(AIRPORTS_JSON)) {
      airports = JSON.parse(fs.readFileSync(AIRPORTS_JSON, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load airports.json:', e);
  }

  // Pre-defined key tags and their paths
  const keywordLinks = [
    { name: '订阅转换', url: 'https://clashwiki.cc/tag/ding4-yue4-zhuan3-huan4' },
    { name: 'Clash', url: 'https://clashwiki.cc/tag/clash' },
    { name: 'Windows 教程', url: 'https://clashwiki.cc/tag/windows' },
    { name: 'macOS 教程', url: 'https://clashwiki.cc/tag/macos' },
    { name: 'IEPL专线', url: 'https://clashwiki.cc/iepl-vs-bgp-transit' },
    { name: 'IPLC专线', url: 'https://clashwiki.cc/iepl-vs-bgp-transit' },
    { name: 'BGP中转', url: 'https://clashwiki.cc/iepl-vs-bgp-transit' },
  ];

  // Add top picks to the link list
  for (const ap of airports) {
    // Generate their review slugs
    // Same pinyin mapping logic as getSlug in AirportDirectory.astro
    const pinyinSlug = ap.name
      .replace(/飞猫云/g, 'fei-mao-yun')
      .replace(/光速云/g, 'guang-su-yun')
      .replace(/唯兔云/g, 'wei-tu-yun');
    
    let slug = '';
    if (pinyinSlug.includes('fei-mao-yun')) slug = 'fei-mao-yun-review';
    else if (pinyinSlug.includes('guang-su-yun')) slug = 'guang-su-yun-review';
    else if (pinyinSlug.includes('wei-tu-yun')) slug = 'wei-tu-yun-review';

    if (slug) {
      keywordLinks.push({ name: ap.name, url: `https://clashwiki.cc/${slug}` });
    }
  }

  // Replace ONLY the first occurrence of each keyword to avoid keyword stuffing
  let processedText = text;
  for (const { name, url } of keywordLinks) {
    const regex = new RegExp(name, 'i');
    const match = processedText.match(regex);
    if (match) {
      // Don't replace if it's already inside a markdown link [name](url) or a header
      const index = match.index;
      const beforeStr = processedText.substring(Math.max(0, index - 20), index);
      const afterStr = processedText.substring(index + name.length, index + name.length + 20);
      
      const isAlreadyLinked = beforeStr.includes('[') || afterStr.includes('](') || beforeStr.includes('#');
      if (!isAlreadyLinked) {
        processedText = processedText.replace(regex, `[${name}](${url})`);
      }
    }
  }

  return processedText;
}

// 5. Query DeepSeek to write the post
async function generatePost(topics) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not set.');
  }

  console.log('Requesting DeepSeek to write article based on topics...');
  const prompt = `
今日热搜与科技动态列表：
${topics.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}

当前北京时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

任务要求：
1. 从列表中挑选一个与网络速度、稳定性、AI（如 ChatGPT/Claude）、海外流媒体（如 Netflix/Disney+）、网络安全、个人隐私或跨国远程工作相关的热搜词。
2. 撰写一篇不少于 1000 字的深度评测/科普/教程类差异化文章。
3. 巧妙融合该热搜话题与网络代理、科学上网、Clash/Shadowrocket 配置、或者优质机场推荐（如“飞猫云”、“光速云”、“唯兔云”）。
4. 保证文章结构清晰，必须包含：导语、技术剖析、配置指南、客观评测对比、以及总结避坑建议。
5. 必须输出标准的 Markdown 格式，最开头包含 YAML Frontmatter。
6. Frontmatter 结构格式：
---
publishDate: YYYY-MM-DD
title: "吸引人的标题（需包含该热搜词与代理工具）"
excerpt: "一两句吸引人的简述摘要"
image: "~/assets/images/default.jpg"
category: "tutorials"  # 填 tutorials (教程) 或 documentation (科普)
tags: ['热点科普', '科学上网', 'Clash', '机场推荐'] # 至少 4 个
slug: "weibo-hot-topic-lowercase-pinyin-slug" # 必须是全英文小写和连字符组成的独立唯一 slug
metadata:
  title: "SEO 网页标题"
  description: "SEO 网页描述信息，80字左右"
---

正文内容...

注意：
- 不要输出 \`\`\`yaml 或者是包裹 Frontmatter 的额外反斜杠。
- 请直接输出以 "---" 开头的正文，不要有任何 Markdown 包裹说明。
`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一名擅长网络安全、Clash代理配置、机场评测推荐的顶级 SEO 编辑。你写出的文章逻辑严密，重点突出，段落有理有据，完全避开AI生成体，具有极强的可读性，并且符合 Google SEO 排名规范。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.75
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${text}`);
  }

  const result = await response.json();
  return result.choices[0].message.content.trim();
}

// Main execution block
async function main() {
  try {
    const weiboTopics = await fetchWeiboHot();
    const techTopics = await fetchTechNews();
    const allTopics = [...weiboTopics, ...techTopics];

    if (allTopics.length === 0) {
      console.log('No hot topics found, using fallbacks.');
      allTopics.push(
        '2026年最新科学上网安全防范',
        '全球多地区网络丢包率检测与优化',
        '人工智能办公工具本地网络提速指引'
      );
    }

    // Get article content from DeepSeek
    const rawArticle = await generatePost(allTopics);
    
    // Parse the slug from the generated frontmatter
    const slugMatch = rawArticle.match(/slug:\s*['"]?([a-zA-Z0-9-]+)['"]?/);
    if (!slugMatch) {
      throw new Error('Failed to find unique slug in generated article.');
    }
    const slug = slugMatch[1];
    
    // Check for duplicate slugs
    const existingSlugs = getExistingSlugs();
    if (existingSlugs.has(slug)) {
      console.log(`Duplicate slug found: "${slug}". Aborting to prevent duplicates.`);
      return;
    }

    // Process internal links (SEO spider web)
    const linkedArticle = buildInternalLinks(rawArticle);

    // Save the post
    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true });
    }
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    fs.writeFileSync(filePath, linkedArticle, 'utf8');

    console.log(`Successfully generated and saved new daily post: "${slug}.md" at ${filePath}`);
  } catch (err) {
    console.error('Error in daily content generator run:', err);
    process.exit(1);
  }
}

main();
