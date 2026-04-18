package com.smartcampus.service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.smartcampus.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final AppProperties appProperties;

    // ── Public send methods (all @Async so they never block the HTTP thread) ──

    @Async("emailExecutor")
    public void sendWelcome(String toEmail, String fullName) {
        String body = """
                <h2 style="margin:0 0 16px;color:#0f172a;">Welcome to Campus Hub!</h2>
                <p style="color:#475569;margin:0 0 12px;">Hi %s,</p>
                <p style="color:#475569;margin:0 0 24px;">
                  Your account is ready. You can now book facilities, report incidents,
                  and track their progress — all in one place.
                </p>
                <a href="%s" style="%s">Open Campus Hub</a>
                """.formatted(fullName, appProperties.resend().baseUrl(), btnStyle());
        send(toEmail, "Welcome to Campus Hub, " + firstName(fullName) + "!", wrap(body));
    }

    @Async("emailExecutor")
    public void sendBookingApproved(String toEmail, String fullName,
                                    String bookingTitle, String bookingId) {
        String link = appProperties.resend().baseUrl() + "/bookings/" + bookingId;
        String body = """
                <h2 style="margin:0 0 16px;color:#0f172a;">Booking Approved</h2>
                <p style="color:#475569;margin:0 0 12px;">Hi %s,</p>
                <p style="color:#475569;margin:0 0 8px;">
                  Great news — your booking has been approved:
                </p>
                <p style="color:#1e40af;font-weight:600;margin:0 0 24px;">%s</p>
                <a href="%s" style="%s">View Booking</a>
                """.formatted(firstName(fullName), bookingTitle, link, btnStyle());
        send(toEmail, "Booking approved — " + bookingTitle, wrap(body));
    }

    @Async("emailExecutor")
    public void sendBookingRejected(String toEmail, String fullName, String bookingTitle) {
        String link = appProperties.resend().baseUrl() + "/bookings";
        String body = """
                <h2 style="margin:0 0 16px;color:#0f172a;">Booking Not Approved</h2>
                <p style="color:#475569;margin:0 0 12px;">Hi %s,</p>
                <p style="color:#475569;margin:0 0 8px;">
                  Unfortunately your booking was not approved:
                </p>
                <p style="color:#1e40af;font-weight:600;margin:0 0 12px;">%s</p>
                <p style="color:#475569;margin:0 0 24px;">
                  Please contact the facility manager or submit a new request if needed.
                </p>
                <a href="%s" style="%s">View My Bookings</a>
                """.formatted(firstName(fullName), bookingTitle, link, btnStyle());
        send(toEmail, "Booking not approved — " + bookingTitle, wrap(body));
    }

    @Async("emailExecutor")
    public void sendBookingCancelled(String toEmail, String fullName, String bookingTitle) {
        String link = appProperties.resend().baseUrl() + "/bookings";
        String body = """
                <h2 style="margin:0 0 16px;color:#0f172a;">Booking Cancelled</h2>
                <p style="color:#475569;margin:0 0 12px;">Hi %s,</p>
                <p style="color:#475569;margin:0 0 8px;">
                  Your booking has been cancelled by an administrator:
                </p>
                <p style="color:#1e40af;font-weight:600;margin:0 0 24px;">%s</p>
                <a href="%s" style="%s">View My Bookings</a>
                """.formatted(firstName(fullName), bookingTitle, link, btnStyle());
        send(toEmail, "Booking cancelled — " + bookingTitle, wrap(body));
    }

    @Async("emailExecutor")
    public void sendTicketStatusChanged(String toEmail, String fullName,
                                        String ticketTitle, String newStatus, String ticketId) {
        String link = appProperties.resend().baseUrl() + "/tickets/" + ticketId;
        String humanStatus = newStatus.replace("_", " ");
        String body = """
                <h2 style="margin:0 0 16px;color:#0f172a;">Ticket Status Updated</h2>
                <p style="color:#475569;margin:0 0 12px;">Hi %s,</p>
                <p style="color:#475569;margin:0 0 8px;">Your incident ticket has been updated:</p>
                <p style="color:#1e40af;font-weight:600;margin:0 0 8px;">%s</p>
                <p style="color:#475569;margin:0 0 24px;">
                  New status: <strong>%s</strong>
                </p>
                <a href="%s" style="%s">View Ticket</a>
                """.formatted(firstName(fullName), ticketTitle, humanStatus, link, btnStyle());
        send(toEmail, "Ticket update: " + ticketTitle + " → " + humanStatus, wrap(body));
    }

    @Async("emailExecutor")
    public void sendTechnicianAssigned(String toEmail, String fullName,
                                       String ticketTitle, String ticketId) {
        String link = appProperties.resend().baseUrl() + "/tickets/" + ticketId;
        String body = """
                <h2 style="margin:0 0 16px;color:#0f172a;">New Ticket Assigned</h2>
                <p style="color:#475569;margin:0 0 12px;">Hi %s,</p>
                <p style="color:#475569;margin:0 0 8px;">
                  You have been assigned to the following incident ticket:
                </p>
                <p style="color:#1e40af;font-weight:600;margin:0 0 24px;">%s</p>
                <a href="%s" style="%s">View Ticket</a>
                """.formatted(firstName(fullName), ticketTitle, link, btnStyle());
        send(toEmail, "Ticket assigned to you — " + ticketTitle, wrap(body));
    }

    @Async("emailExecutor")
    public void sendNewComment(String toEmail, String fullName,
                               String ticketTitle, String ticketId) {
        String link = appProperties.resend().baseUrl() + "/tickets/" + ticketId;
        String body = """
                <h2 style="margin:0 0 16px;color:#0f172a;">New Comment on Your Ticket</h2>
                <p style="color:#475569;margin:0 0 12px;">Hi %s,</p>
                <p style="color:#475569;margin:0 0 8px;">
                  Someone left a comment on your incident ticket:
                </p>
                <p style="color:#1e40af;font-weight:600;margin:0 0 24px;">%s</p>
                <a href="%s" style="%s">View Comment</a>
                """.formatted(firstName(fullName), ticketTitle, link, btnStyle());
        send(toEmail, "New comment on: " + ticketTitle, wrap(body));
    }

    // ── Internal helpers ─────────────────────────────────────────────────────

    private void send(String to, String subject, String html) {
        String apiKey = appProperties.resend().apiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("RESEND_API_KEY not configured — skipping email to {}", to);
            return;
        }
        try {
            Resend resend = new Resend(apiKey);
            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(appProperties.resend().from())
                    .to(to)
                    .subject(subject)
                    .html(html)
                    .build();
            resend.emails().send(options);
            log.info("Email sent | to={} subject={}", to, subject);
        } catch (Exception e) {
            log.error("Email delivery failed | to={} subject={} error={}", to, subject, e.getMessage());
        }
    }

    private String wrap(String content) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
                <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr><td align="center" style="padding:40px 16px;">
                      <table width="560" cellpadding="0" cellspacing="0" role="presentation"
                             style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12);">
                        <tr>
                          <td style="background:#1e40af;padding:24px 32px;">
                            <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">
                              Campus Hub
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:32px;">
                            %s
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#f8fafc;padding:16px 32px;font-size:12px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;">
                            Smart Campus Operations Hub &middot; SLIIT &middot; IT3030 PAF 2026
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(content);
    }

    private String btnStyle() {
        return "display:inline-block;padding:12px 24px;background:#1e40af;color:#ffffff;" +
               "border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;";
    }

    private String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) return "there";
        return fullName.split("\\s+")[0];
    }
}
