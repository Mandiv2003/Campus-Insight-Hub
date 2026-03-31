package com.smartcampus.incident;

import com.smartcampus.common.exception.ForbiddenException;
import com.smartcampus.common.exception.ResourceNotFoundException;
import com.smartcampus.incident.dto.CommentDto;
import com.smartcampus.incident.dto.CommentResponseDto;
import com.smartcampus.notification.NotificationService;
import com.smartcampus.user.User;
import com.smartcampus.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final IncidentTicketService ticketService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ── Add comment ───────────────────────────────────────────────────────
    @Transactional
    public CommentResponseDto addComment(UUID ticketId, CommentDto dto, UUID authorId) {
        IncidentTicket ticket = ticketService.findOrThrow(ticketId);
        User author = findUserOrThrow(authorId);

        TicketComment comment = TicketComment.builder()
            .ticket(ticket)
            .author(author)
            .body(dto.body())
            .build();

        CommentResponseDto saved = CommentResponseDto.from(commentRepository.save(comment));

        // Notify the reporter — but not if they are the commenter
        UUID reporterId = ticket.getReportedBy().getId();
        if (!authorId.equals(reporterId)) {
            notificationService.notifyNewComment(
                reporterId,
                authorId,
                ticket.getTitle(),
                ticket.getId()
            );
        }

        return saved;
    }

    // ── Edit comment (author only) ─────────────────────────────────────────
    @Transactional
    public CommentResponseDto editComment(UUID ticketId, UUID commentId,
                                          CommentDto dto, UUID requestingUserId) {
        TicketComment comment = findCommentOrThrow(ticketId, commentId);

        if (!comment.getAuthor().getId().equals(requestingUserId)) {
            throw new ForbiddenException("You can only edit your own comments");
        }

        comment.setBody(dto.body());
        comment.setEdited(true);
        comment.setUpdatedAt(LocalDateTime.now());

        return CommentResponseDto.from(commentRepository.save(comment));
    }

    // ── Delete comment (author or admin) ──────────────────────────────────
    @Transactional
    public void deleteComment(UUID ticketId, UUID commentId,
                              UUID requestingUserId, boolean isAdmin) {
        TicketComment comment = findCommentOrThrow(ticketId, commentId);

        boolean isAuthor = comment.getAuthor().getId().equals(requestingUserId);
        if (!isAdmin && !isAuthor) {
            throw new ForbiddenException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    // ── Get all comments for a ticket ─────────────────────────────────────
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getComments(UUID ticketId) {
        ticketService.findOrThrow(ticketId);   // ensure ticket exists
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
            .stream().map(CommentResponseDto::from).toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private TicketComment findCommentOrThrow(UUID ticketId, UUID commentId) {
        return commentRepository.findByIdAndTicketId(commentId, ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
    }

    private User findUserOrThrow(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
