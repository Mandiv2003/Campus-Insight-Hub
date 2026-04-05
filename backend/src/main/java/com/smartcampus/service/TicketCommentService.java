package com.smartcampus.service;

import com.smartcampus.dto.ticket.CommentDto;
import com.smartcampus.dto.ticket.CommentResponseDto;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.TicketMapper;
import com.smartcampus.model.IncidentTicket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final IncidentTicketService ticketService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TicketMapper ticketMapper;

    // ── Add comment ───────────────────────────────────────────────────────
    public CommentResponseDto addComment(String ticketId, CommentDto dto, String authorId) {
        IncidentTicket ticket = ticketService.findOrThrow(ticketId);
        User author = findUserOrThrow(authorId);

        TicketComment comment = TicketComment.builder()
                .ticketId(ticketId)
                .authorId(author.getId())
                .authorName(author.getFullName())
                .authorAvatarUrl(author.getAvatarUrl())
                .body(dto.body())
                .build();

        CommentResponseDto saved = ticketMapper.toCommentDto(commentRepository.save(comment));

        notificationService.notifyNewComment(
                ticket.getReportedById(), authorId, ticket.getTitle(), ticket.getId());

        return saved;
    }

    // ── Edit comment (author only) ─────────────────────────────────────────
    public CommentResponseDto editComment(String ticketId, String commentId,
                                          CommentDto dto, String requestingUserId) {
        TicketComment comment = findCommentOrThrow(ticketId, commentId);

        if (!comment.getAuthorId().equals(requestingUserId)) {
            throw new ForbiddenException("You can only edit your own comments");
        }

        comment.setBody(dto.body());
        comment.setEdited(true);
        comment.setUpdatedAt(LocalDateTime.now());

        return ticketMapper.toCommentDto(commentRepository.save(comment));
    }

    // ── Delete comment (author or admin) ──────────────────────────────────
    public void deleteComment(String ticketId, String commentId,
                               String requestingUserId, boolean isAdmin) {
        TicketComment comment = findCommentOrThrow(ticketId, commentId);

        if (!isAdmin && !comment.getAuthorId().equals(requestingUserId)) {
            throw new ForbiddenException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    // ── Get all comments for a ticket ─────────────────────────────────────
    public List<CommentResponseDto> getComments(String ticketId) {
        ticketService.findOrThrow(ticketId);   // ensure ticket exists
        return ticketMapper.toCommentDtoList(
                commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId));
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private TicketComment findCommentOrThrow(String ticketId, String commentId) {
        return commentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
    }

    private User findUserOrThrow(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
