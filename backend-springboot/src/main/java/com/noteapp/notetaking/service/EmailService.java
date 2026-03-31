package com.noteapp.notetaking.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public void sendCollaborationEmail(String to, String inviterName, String noteTitle, String role, String noteUrl) throws MessagingException {
        Context context = new Context();
        context.setVariable("inviterName", inviterName);
        context.setVariable("noteTitle", noteTitle);
        context.setVariable("role", role);
        context.setVariable("noteUrl", noteUrl);

        String html = templateEngine.process("collaboration-email", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        mimeMessageHelper.setTo(to);
        mimeMessageHelper.setSubject("You have been added to a note");
        mimeMessageHelper.setText(html, true);

        mailSender.send(mimeMessage);
    }

    public void sendInvitationEmail(String to, String inviterName, String noteTitle, String role, String registerUrl) throws MessagingException {
        Context context = new Context();
        context.setVariable("inviterName", inviterName);
        context.setVariable("noteTitle", noteTitle);
        context.setVariable("role", role);
        context.setVariable("registerUrl", registerUrl);

        String html = templateEngine.process("invitation-email", context);

        MimeMessage mimeMessage = mailSender.createMimeMessage();

        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        mimeMessageHelper.setTo(to);
        mimeMessageHelper.setSubject("You've been invited to join JotPool");
        mimeMessageHelper.setText(html, true);

        mailSender.send(mimeMessage);
    }

}
