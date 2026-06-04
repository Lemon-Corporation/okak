import asyncio
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from email.utils import formataddr

from app.config.settings import EmailSettings
from app.exceptions.base import ServerAppError


def _verification_email_html(*, display_name: str, code: str, ttl_minutes: int) -> str:
    return f"""
    <div style="margin:0;padding:32px;background:#f4f7ff;font-family:Inter,Segoe UI,Arial,sans-serif;color:#162033;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 18px 60px rgba(44,73,255,0.12);">
        <div style="padding:32px 32px 24px;background:linear-gradient(135deg,#4d3bff,#2a42cb);color:#ffffff;">
          <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,0.14);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">ОКАК</div>
          <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.1;">Подтвердите регистрацию</h1>
          <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.85);">
            {display_name}, осталось подтвердить вашу почту и можно продолжать работу.
          </p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">
            Введите этот код на сайте, чтобы завершить регистрацию:
          </p>
          <div style="margin:0 0 24px;padding:18px 20px;border-radius:22px;background:#eef2ff;text-align:center;">
            <span style="font-size:32px;font-weight:800;letter-spacing:.28em;color:#2c49ff;">{code}</span>
          </div>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#5a6780;">
            Код действует {ttl_minutes} минут. Если вы не регистрировались в ОКАК, просто проигнорируйте это письмо.
          </p>
          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5ebff;font-size:13px;color:#7d88a1;">
            ОКАК · заметки, задачи, проекты и голосовой помощник
          </div>
        </div>
      </div>
    </div>
    """


def _password_reset_email_html(*, code: str, ttl_minutes: int) -> str:
    return f"""
    <div style="margin:0;padding:32px;background:#f4f7ff;font-family:Inter,Segoe UI,Arial,sans-serif;color:#162033;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 18px 60px rgba(44,73,255,0.12);">
        <div style="padding:32px 32px 24px;background:linear-gradient(135deg,#4d3bff,#2a42cb);color:#ffffff;">
          <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,0.14);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">ОКАК</div>
          <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.1;">Сброс пароля</h1>
          <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.85);">
            Мы получили запрос на смену пароля для вашего аккаунта.
          </p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">
            Введите этот код на сайте, чтобы задать новый пароль:
          </p>
          <div style="margin:0 0 24px;padding:18px 20px;border-radius:22px;background:#eef2ff;text-align:center;">
            <span style="font-size:32px;font-weight:800;letter-spacing:.28em;color:#2c49ff;">{code}</span>
          </div>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#5a6780;">
            Код действует {ttl_minutes} минут. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
          </p>
          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5ebff;font-size:13px;color:#7d88a1;">
            ОКАК · безопасный доступ к вашему рабочему пространству
          </div>
        </div>
      </div>
    </div>
    """


@dataclass(slots=True, kw_only=True)
class EmailService:
    settings: EmailSettings

    async def send_verification_code(self, *, to_email: str, display_name: str, code: str, ttl_minutes: int) -> None:
        await self._send(
            to_email=to_email,
            subject="ОКАК · подтверждение регистрации",
            html=_verification_email_html(display_name=display_name, code=code, ttl_minutes=ttl_minutes),
        )

    async def send_password_reset_code(self, *, to_email: str, code: str, ttl_minutes: int) -> None:
        await self._send(
            to_email=to_email,
            subject="ОКАК · код для смены пароля",
            html=_password_reset_email_html(code=code, ttl_minutes=ttl_minutes),
        )

    async def _send(self, *, to_email: str, subject: str, html: str) -> None:
        if not self.settings.enabled:
            raise ServerAppError(code="email_disabled", message="Email delivery is disabled")

        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = formataddr((self.settings.from_name, self.settings.from_email))
        message["To"] = to_email
        message.set_content("Откройте письмо в HTML-совместимом клиенте.")
        message.add_alternative(html, subtype="html")

        await asyncio.to_thread(self._send_sync, message)

    def _send_sync(self, message: EmailMessage) -> None:
        try:
            if self.settings.use_ssl:
                server = smtplib.SMTP_SSL(self.settings.host, self.settings.port, timeout=20)
            else:
                server = smtplib.SMTP(self.settings.host, self.settings.port, timeout=20)

            with server:
                if self.settings.use_starttls and not self.settings.use_ssl:
                    server.starttls()
                if self.settings.username:
                    server.login(self.settings.username, self.settings.password)
                server.send_message(message)
        except Exception as error:  # pragma: no cover - network path
            raise ServerAppError(code="email_send_failed", message="Failed to send email") from error
