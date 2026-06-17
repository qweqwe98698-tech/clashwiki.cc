import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: '客户端下载',
      href: getPermalink('/download'),
    },
    {
      text: '机场评测',
      href: getPermalink('/airports'),
    },
    {
      text: '使用教程',
      links: [
        {
          text: '所有教程',
          href: getBlogPermalink(),
        },
        {
          text: 'Windows 教程',
          href: getPermalink('windows', 'tag'),
        },
        {
          text: 'macOS 教程',
          href: getPermalink('macos', 'tag'),
        },
        {
          text: 'Clash 客户端',
          href: getPermalink('clash', 'tag'),
        },
        {
          text: '订阅转换指引',
          href: getPermalink('订阅转换', 'tag'),
        },
        {
          text: '专线中转科普',
          href: getPermalink('documentation', 'category'),
        },
      ],
    },
    {
      text: '常见问题',
      href: getPermalink('/faqs'),
    },
    {
      text: '关于我们',
      href: getPermalink('/about'),
    },
  ],
  actions: [{ text: 'Wiki 知识库', href: getBlogPermalink(), target: '_self' }],
};

export const footerData = {
  links: [
    {
      title: '客户端下载',
      links: [
        { text: 'Windows - Clash Verge', href: getPermalink('/download') },
        { text: 'macOS - Mihomo Party', href: getPermalink('/download') },
        { text: 'Android - Sing-box', href: getPermalink('/download') },
        { text: 'iOS - Shadowrocket', href: getPermalink('/download') },
      ],
    },
    {
      title: 'Wiki 教程',
      links: [
        { text: 'Windows 基础配置', href: getPermalink('windows', 'tag') },
        { text: 'macOS 基础配置', href: getPermalink('macos', 'tag') },
        { text: '订阅链接转换指引', href: getPermalink('订阅转换', 'tag') },
        { text: '专线中转区别科普', href: getPermalink('documentation', 'category') },
      ],
    },
    {
      title: '服务与评测',
      links: [
        { text: '精品专线机场评测', href: getPermalink('/airports') },
        { text: '性价比中转机场评测', href: getPermalink('/airports') },
        { text: '备用低预算机场推荐', href: getPermalink('/airports') },
      ],
    },
    {
      title: '条款与政策',
      links: [
        { text: '使用条款', href: getPermalink('/terms') },
        { text: '隐私政策', href: getPermalink('/privacy') },
        { text: '免责声明', href: getPermalink('/about') },
      ],
    },
  ],
  secondaryLinks: [
    { text: '使用条款', href: getPermalink('/terms') },
    { text: '隐私政策', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
    { ariaLabel: 'Telegram', icon: 'tabler:brand-telegram', href: 'https://t.me/XXFF555333' },
  ],
  footNote: `
    © 2026 ClashWiki.cc. 所有内容均开源且仅作网络安全学术交流。
  `,
};
