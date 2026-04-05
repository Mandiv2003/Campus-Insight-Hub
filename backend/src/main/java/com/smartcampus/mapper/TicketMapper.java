package com.smartcampus.mapper;

import com.smartcampus.dto.ticket.AttachmentResponseDto;
import com.smartcampus.dto.ticket.CommentResponseDto;
import com.smartcampus.model.TicketAttachment;
import com.smartcampus.model.TicketComment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TicketMapper {

    @Mapping(target = "fileUrl",
             expression = "java(\"/api/v1/files/\" + attachment.getTicketId() + \"/\" + attachment.getFileName())")
    AttachmentResponseDto toAttachmentDto(TicketAttachment attachment);

    List<AttachmentResponseDto> toAttachmentDtoList(List<TicketAttachment> attachments);

    CommentResponseDto toCommentDto(TicketComment comment);

    List<CommentResponseDto> toCommentDtoList(List<TicketComment> comments);
}
