'use client';
import {useEffect, useRef, useState} from 'react';
import {headlineTranslations} from '@/lib/translation-client.mjs';

type Props = {title: string; lang: 'th' | 'en'; className?: string; as?: 'span' | 'button' | 'a'; href?: string; onClick?: () => void};
type Translation = {text: string; persisted: boolean};

export default function TranslatedHeadline(props: Props) {
  return <Headline key={`${props.lang}:${props.title}`} {...props}/>;
}

function Headline({title, lang, className, as = 'span', href, onClick}: Props) {
  const container = useRef<HTMLSpanElement>(null);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'failed' | 'done'>('idle');
  const [original, setOriginal] = useState(false);
  useEffect(() => {
    if (lang !== 'th' || !container.current) return;
    let active = true, started = false;
    const start = () => {
      if (started || !active) return;
      started = true;
      setStatus('loading');
      headlineTranslations.request(title, () => active).then((result: Translation | null) => {
        if (!active) return;
        setTranslation(result);
        setStatus(result ? 'done' : 'failed');
      });
    };
    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { start(); observer?.disconnect(); }
    }) : null;
    if (observer) observer.observe(container.current); else start();
    return () => { active = false; observer?.disconnect(); };
  }, [title, lang]);
  const content = translation && !original ? translation.text : title;
  return <span className="translated-headline" ref={container}>
    {as === 'button' ? <button type="button" className={className} onClick={onClick}>{content}</button>
      : as === 'a' ? <a className={className} href={href} onClick={onClick} target="_blank" rel="noopener noreferrer">{content}</a>
        : <span className={className}>{content}</span>}
    {lang === 'th' && <span className="translation-controls">
      {translation ? <><span>{original ? 'ต้นฉบับ' : 'แปลอัตโนมัติ · Google'}</span><button type="button" aria-pressed={original} onClick={() => setOriginal(value => !value)}>{original ? 'ดูคำแปลไทย' : 'ดูต้นฉบับ'}</button>{!translation.persisted && <span>บันทึกคำแปลในเครื่องไม่ได้</span>}</>
        : status === 'loading' ? <span>กำลังแปล · แสดงต้นฉบับ</span>
          : status === 'failed' ? <span>แสดงต้นฉบับ · คำแปลยังไม่พร้อม</span> : null}
    </span>}
  </span>;
}
