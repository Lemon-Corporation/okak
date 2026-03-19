import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Footer } from "@/components/ember/footer"

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-[#0038FF] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
        </div>
      </nav>

      <div className="flex-1 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              Пользовательское соглашение
            </h1>
            <p className="text-gray-500 mb-8">Действует с: 19 марта 2026 г.</p>

            <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
              <p>
                Пожалуйста, внимательно прочитайте настоящие Условия использования перед использованием приложения OKAK, управляемого ООО "ЛЕМОН КОРП".
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Принятие условий</h2>
              <p>
                Получая доступ к нашему сервису или используя его, вы соглашаетесь соблюдать настоящие Условия. Если вы не согласны с какой-либо частью условий, вы не имеете права получать доступ к сервису.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Лицензия на использование</h2>
              <p>
                Мы предоставляем вам ограниченную, неисключительную, непередаваемую и отзывную лицензию на использование нашего программного обеспечения для ваших личных или внутренних деловых целей в соответствии с выбранным тарифным планом.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Ограничения</h2>
              <p>
                Вы соглашаетесь не:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Модифицировать, переводить или создавать производные работы на основе сервиса;</li>
                <li>Пытаться извлечь исходный код сервиса;</li>
                <li>Использовать сервис для любых незаконных целей.</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Отказ от гарантий</h2>
              <p>
                Сервис предоставляется на условиях «как есть» и «как доступно» без каких-либо гарантий, явных или подразумеваемых. Мы не гарантируем, что сервис будет работать бесперебойно или без ошибок.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Реквизиты компании</h2>
              <p>
                ООО "ЛЕМОН КОРП"
                <br />
                ИНН: 9726087431
                <br />
                ОГРН: 1247700713446
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}