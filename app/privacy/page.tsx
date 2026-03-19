import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Footer } from "@/components/ember/footer"

export default function PrivacyPolicy() {
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
              Политика конфиденциальности
            </h1>
            <p className="text-gray-500 mb-8">Последнее обновление: 19 марта 2026 г.</p>

            <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
              <p>
                Настоящая Политика конфиденциальности описывает, как ООО "ЛЕМОН КОРП" ("мы", "наш" или "нас") собирает, использует и раскрывает вашу информацию при использовании приложения OKAK.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Сбор информации</h2>
              <p>
                Мы собираем информацию, которую вы предоставляете нам напрямую, когда вы создаете аккаунт, обновляете свой профиль, используете интерактивные функции сервиса, участвуете в опросах или обращаетесь в службу поддержки.
              </p>
              
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Использование данных</h2>
              <p>
                Вся ваша личная информация (заметки, файлы, базы данных) хранится локально на вашем устройстве или в зашифрованном виде, если вы используете функцию синхронизации. Мы не имеем доступа к содержанию ваших заметок.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Использование AI</h2>
              <p>
                Для работы голосового агента и обработки естественного языка мы можем использовать сторонние API (например, OpenAI). В таких случаях передаются только те фрагменты текста или голоса, которые непосредственно требуются для выполнения вашей команды. Эти данные не используются для обучения публичных моделей.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Контактная информация</h2>
              <p>
                Если у вас есть вопросы о настоящей Политике конфиденциальности, пожалуйста, свяжитесь с нами:
                <br />
                ООО "ЛЕМОН КОРП"
                <br />
                ИНН: 9726087431 | ОГРН: 1247700713446
                <br />
                Email: privacy@lemoncorp.ru
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}