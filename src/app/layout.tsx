import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
 title: 'Истории наших пациентов — Dr Dolittle 24',
 description: 'Реальные истории пациентов ветеринарной клиники Dr Dolittle. Интерактивная галерея и полный архив публикаций.',
 robots: {index:false, follow:false},
}
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="ru"><body>{children}</body></html>
}
