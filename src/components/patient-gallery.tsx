'use client'
import dynamic from 'next/dynamic'
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SphereGalleryApi } from './sphere-gallery/sphere-gallery'
import { BASE_PATH } from '@/constants'

type Story = {id:string; title:string; date:string; category:string; paragraphs:string[]; images:string[]; patient?:string; summary?:string}
const Scene = dynamic(() => import('./patient-scene'), {ssr:false})
class WebglBoundary extends Component<{children:ReactNode; onFail:()=>void}, {failed:boolean}> {
    state = {failed:false}
    static getDerivedStateFromError() {return {failed:true}}
    componentDidCatch() {this.props.onFail()}
    render() {return this.state.failed ? null : this.props.children}
}
export function PatientGallery({stories}:{stories:Story[]}) {
    const pilot = useMemo(() => ['Рич','Чупа','Сэм','Дайкири'].map(name => stories.find(s => s.patient===name)!), [stories])
    const items = useMemo(() => pilot.map(s => ({src:`${BASE_PATH}/${s.images[0]}`, alt:`${s.patient} — ${s.summary}`})), [pilot])
    const api = useRef<SphereGalleryApi>(null)
    const dialog = useRef<HTMLDialogElement>(null)
    const returnFocus = useRef<HTMLElement | null>(null)
    const [active, setActive] = useState<Story|null>(null)
    const [hover, setHover] = useState<number|null>(null)
    const [enabled, setEnabled] = useState(false)
    const [ready, setReady] = useState(false)
    const [failed, setFailed] = useState(false)
    const [reduced, setReduced] = useState(false)
    const [lowPower, setLowPower] = useState(false)
    const markFailed = useCallback(() => {setFailed(true); setEnabled(false)}, [])
    const markReady = useCallback(() => setReady(true), [])
    useEffect(() => {
        const media = matchMedia('(prefers-reduced-motion: reduce)')
        const update = () => setReduced(media.matches)
        update(); media.addEventListener('change', update)
        setLowPower(navigator.hardwareConcurrency <= 4 || matchMedia('(max-width: 700px)').matches)
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl2')
        if (!gl) setFailed(true)
        else {gl.getExtension('WEBGL_lose_context')?.loseContext(); setEnabled(true)}
        return () => media.removeEventListener('change', update)
    }, [])
    useEffect(() => {
        if (!enabled || ready) return
        const timer = setTimeout(markFailed, 25000)
        return () => clearTimeout(timer)
    }, [enabled,ready,markFailed])
    const openStory = useCallback((story:Story) => {
        returnFocus.current = document.activeElement as HTMLElement
        setActive(story)
    }, [])
    const onActiveChange = useCallback((index:number|null) => {
        if (index!==null) openStory(pilot[index])
    }, [openStory,pilot])
    const close = useCallback(() => {
        dialog.current?.close(); api.current?.dismiss(); setActive(null)
        returnFocus.current?.focus()
    }, [])
    useEffect(() => {
        if (!active) return
        const timer = setTimeout(() => dialog.current?.showModal(), reduced ? 0 : 650)
        return () => clearTimeout(timer)
    }, [active,reduced])
    const select = (story:Story) => {
        const index = pilot.indexOf(story)
        if (ready && index>=0) api.current?.select(index)
        openStory(story)
    }
    return <>
        <header className="site-header"><a className="brand" href="https://dolittle24.ru/" aria-label="Dr Dolittle — главная">Dr Dolittle<span>Ветеринарная клиника · 24/7</span></a><nav aria-label="Навигация клиники"><a href="https://dolittle24.ru/services.html">Услуги</a><a href="https://dolittle24.ru/index.html#doctors">Врачи</a><a href="#archive">Все истории ↗</a></nav></header>
        <main><section className="gallery-section" aria-labelledby="gallery-title">
            <div className="gallery-heading"><p className="eyebrow">Dr Dolittle 24 / Дневник клиники</p><h1 id="gallery-title">Истории наших пациентов</h1><p>Каждый пациент — отдельная история.<br className="mobile-break"/> Узнайте, как мы помогаем животным</p></div>
            <div className="sphere-wrap" data-ready={ready}>
                {enabled && <WebglBoundary onFail={markFailed}><Suspense fallback={null}><Scene items={items} apiRef={api} reduced={reduced} lowPower={lowPower} onReady={markReady} onActiveChange={onActiveChange} onHover={setHover}/></Suspense></WebglBoundary>}
                {!ready && <p className="loading" role="status">{failed ? '3D-галерея недоступна. Все истории можно прочитать ниже.' : 'Загружаем галерею пациентов…'}</p>}
                <noscript><p className="loading">Для 3D-галереи нужен JavaScript. Полные истории доступны ниже.</p></noscript>
                <div className="hover-caption" aria-live="polite">{hover!==null && <><strong>{pilot[hover].patient}</strong><span>{pilot[hover].summary}</span></>}</div>
                <div className="sphere-instructions"><span>Потяните, чтобы вращать</span><span>Колесо / + − — масштаб</span></div>
            </div>
            <div className="patient-shortcuts" aria-label="Выбрать пациента">{pilot.map(s => <button key={s.id} onClick={() => select(s)}><span>{s.patient}</span><small>{s.summary}</small><b aria-hidden="true">↗</b></button>)}</div>
            <p className="test-note">Тестовая галерея · 4 истории · Оригинальный SphereGallery / Atelier UI</p>
        </section>
        <section className="archive" id="archive" aria-labelledby="archive-title"><div className="archive-heading"><div><p className="eyebrow">Дневник клиники</p><h2 id="archive-title">Все публикации</h2></div><span>{stories.length} история</span></div><p className="archive-intro">Полные тексты и даты из блога клиники. Истории доступны и без 3D-галереи.</p>
            {stories.map(s => <details key={s.id} id={s.id}><summary><time dateTime={s.date}>{s.date.split('-').reverse().join('.')}</time><span>{s.patient ? `${s.patient} — ${s.summary}` : s.title}</span><b aria-hidden="true">+</b></summary><article><h3>{s.title}</h3><p className="category">{s.category}</p><div className="archive-images">{s.images.map(src => <img key={src} src={`${BASE_PATH}/${src}`} alt={s.patient || s.title} loading="lazy"/>)}</div>{s.paragraphs.map((p,i) => <p key={i}>{p}</p>)}</article></details>)}
        </section></main>
        <footer className="site-footer"><a className="brand" href="https://dolittle24.ru/">Dr Dolittle</a><p>Красногорск, Авангардная, 3<br/>Круглосуточно, без выходных</p><a href="tel:+79932501818">+7 (993) 250-18-18</a></footer>
        <dialog ref={dialog} className="story-dialog" aria-labelledby="patient-title" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget)close()}}>
            {active && <div className="story-panel"><button className="close-story" onClick={close} autoFocus aria-label="Закрыть историю">Закрыть ×</button><div className="story-copy"><p className="eyebrow">{active.category} / <time dateTime={active.date}>{active.date.split('-').reverse().join('.')}</time></p><h2 id="patient-title">{active.patient || active.title}</h2>{active.summary && <p className="story-summary">{active.summary}</p>}<div className="story-images">{active.images.map(src=><img key={src} src={`${BASE_PATH}/${src}`} alt={active.patient || active.title} loading="lazy"/>)}</div><h3>{active.title}</h3>{active.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</div></div>}
        </dialog>
    </>
}
