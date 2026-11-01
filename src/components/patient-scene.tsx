'use client'
import type { RefObject } from 'react'
import { SphereGallery, type SphereGalleryApi, type SphereGalleryItem } from './sphere-gallery/sphere-gallery'
import { WebglProvider } from './webgl-provider/webgl-provider'
export default function PatientScene({items,apiRef,reduced,lowPower,onReady,onActiveChange,onHover}:{items:SphereGalleryItem[];apiRef:RefObject<SphereGalleryApi|null>;reduced:boolean;lowPower:boolean;onReady:()=>void;onActiveChange:(i:number|null)=>void;onHover:(i:number|null)=>void}) {
    return <WebglProvider dpr={lowPower ? 1 : [1,1.5]} gl={{antialias:!lowPower,powerPreference:'low-power'}} fallback={<p>WebGL недоступен. Выберите историю ниже.</p>}>
        <SphereGallery items={items} apiRef={apiRef} className="patient-sphere" rows={5} columns={10} tileColor="#064b3e" sphereColor="#035444" lensBlur={lowPower || reduced ? 0 : 0.1} inertia={!reduced} mouseParallax={reduced ? 0 : 0.06} revealDuration={reduced ? 0.01 : 1.5} focusDuration={reduced ? 0.01 : 0.6} onReady={onReady} onActiveChange={onActiveChange} onHover={onHover}/>
    </WebglProvider>
}
