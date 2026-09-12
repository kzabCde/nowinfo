import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'NowInfo — มองโลกให้เชื่อมโยง',description:'ศูนย์รวมข่าวโลก เศรษฐกิจ เทคโนโลยี พลังงาน และสิ่งแวดล้อม พร้อมแหล่งอ้างอิงและประเด็นที่ควรติดตาม',icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="th"><body>{children}</body></html>;}
