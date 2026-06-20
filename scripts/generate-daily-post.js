import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve('src/data/post');
const PROMO_TOPICS_JSON = path.resolve('src/data/promo-topics.json');
const AIRPORTS_JSON = path.resolve('src/data/airports.json');

// DeepSeek config
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 1. Scan existing files to check for duplicate slugs
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

// 2. Query DeepSeek to return structured JSON
async function generatePromoPostJSON(topic, featuredAirport) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not set.');
  }

  console.log(`Requesting DeepSeek for topic: "${topic}"...`);
  
  const airportStr = JSON.stringify(featuredAirport, null, 2);

  const prompt = `
你是一名资深的科学上网、翻墙机场测评博主和顶级 SEO 编辑。
今天你需要围绕以下长尾关键词/主题撰写一篇极具商业转化率的深度评测与推荐软文：

【文章主题】：${topic}

在文章中，你必须强烈推荐并详细测评以下这款“机场”（代理服务），引导用户购买：
【机场名称】：${featuredAirport.name}
【机场专属推广链接】：${featuredAirport.affLink}
【机场详细信息】：
${airportStr}

撰写要求：
1. 字数不少于 1500 字，语气要像真实的测评博主（使用诸如“实测”、“晚高峰秒开”、“个人体验”等词汇）。
2. 文章结构必须包含：吸引人的导语、针对主题的技术/痛点剖析、机场的详细测评（必须包含 markdown 表格罗列套餐和价格）、流媒体解锁情况、以及强烈建议购买的结尾总结（CTA）。
3. 在文章开头、中间和结尾，至少三次植入该机场的专属推广链接，使用 Markdown 格式，例如：[👉点击这里立即注册体验 ${featuredAirport.name}](${featuredAirport.affLink}) 。
4. 必须输出严格合法的 JSON 格式。不要包含任何 markdown 代码块标识（如 \`\`\`json ）。

返回的 JSON 必须包含以下字段：
{
  "title": "极具吸引力的标题（需包含长尾词）",
  "excerpt": "两三句极具煽动性的摘要，引导用户阅读",
  "category": "ji-chang-ping-ce", 
  "tags": ["机场推荐", "流媒体解锁", "科学上网", "${featuredAirport.name}"], 
  "slug": "english-lowercase-pinyin-slug-with-hyphens",
  "seo_title": "SEO 网页标题，包含核心转化词",
  "seo_description": "SEO 网页描述信息，80字左右",
  "content": "这里是文章的 Markdown 正文内容..."
}
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
          content: '你是一名顶级机场测评博主。请严格按照要求返回合法的 JSON 对象，确保 JSON 的 key 和结构完全一致。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${text}`);
  }

  const result = await response.json();
  let content = result.choices[0].message.content.trim();
  
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  return JSON.parse(content);
}

// 3. Assemble Markdown with Frontmatter
function assembleMarkdown(postData) {
  const exactPublishDate = new Date().toISOString();
  const tagsStr = JSON.stringify(postData.tags || ['机场推荐', '科学上网', '翻墙教程']);

  return `---
publishDate: ${exactPublishDate}
title: ${JSON.stringify(postData.title)}
excerpt: ${JSON.stringify(postData.excerpt)}
image: "~/assets/images/default.jpg"
category: "${postData.category || 'ji-chang-ping-ce'}"
tags: ${tagsStr}
slug: "${postData.slug}"
metadata:
  title: ${JSON.stringify(postData.seo_title || postData.title)}
  description: ${JSON.stringify(postData.seo_description || postData.excerpt)}
---

${postData.content}
`;
}

// Main execution block
async function main() {
  try {
    // 1. Read Topics
    if (!fs.existsSync(PROMO_TOPICS_JSON)) {
      throw new Error(`Topics file not found at ${PROMO_TOPICS_JSON}`);
    }
    const topics = JSON.parse(fs.readFileSync(PROMO_TOPICS_JSON, 'utf8'));
    if (topics.length === 0) throw new Error("Promo topics list is empty.");
    
    // Pick a random topic
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    // 2. Read Airports
    if (!fs.existsSync(AIRPORTS_JSON)) {
      throw new Error(`Airports file not found at ${AIRPORTS_JSON}`);
    }
    const airports = JSON.parse(fs.readFileSync(AIRPORTS_JSON, 'utf8'));
    if (airports.length === 0) throw new Error("Airports list is empty.");
    
    // Pick a random airport to feature
    const featuredAirport = airports[Math.floor(Math.random() * airports.length)];

    console.log(`Starting generation... Topic: "${randomTopic}" | Airport: "${featuredAirport.name}"`);

    // 3. Generate Article
    const postData = await generatePromoPostJSON(randomTopic, featuredAirport);
    
    const slug = postData.slug;
    if (!slug) {
      throw new Error('Failed to parse slug from JSON.');
    }
    
    // 4. Check Duplicate
    const existingSlugs = getExistingSlugs();
    if (existingSlugs.has(slug)) {
      console.log(`Duplicate slug found: "${slug}". Aborting to prevent duplicates.`);
      return;
    }

    // 5. Save File
    const finalFileContent = assembleMarkdown(postData);
    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true });
    }
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    fs.writeFileSync(filePath, finalFileContent, 'utf8');

    console.log(`Successfully generated and saved new promotional post: "${slug}.md" at ${filePath}`);
  } catch (err) {
    console.error('Error in promo content generator run:', err);
    process.exit(1);
  }
}

main();
