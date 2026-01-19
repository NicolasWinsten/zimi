import { Noto_Serif_SC, Ma_Shan_Zheng } from 'next/font/google';

const NotoSerifChinese = Noto_Serif_SC({
  weight: ['200', '400', '700'],
  subsets: ['latin', 'chinese_simplified'],
  display: 'swap',
});

const MaShanZheng = Ma_Shan_Zheng({
  weight: ['400'],
  subsets: ['latin', 'chinese_simplified'],
  display: 'swap',
});

export { NotoSerifChinese, MaShanZheng };
