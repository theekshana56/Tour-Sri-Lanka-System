package com.tsl.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.tsl.dto.request.CallSignalRequest;
import com.tsl.dto.request.SendTripMessageRequest;
import com.tsl.dto.response.CallSignalResponse;
import com.tsl.dto.response.TripCallSessionResponse;
import com.tsl.dto.response.TripConversationResponse;
import com.tsl.dto.response.TripMessageResponse;
import com.tsl.exception.BadRequestException;
import com.tsl.exception.UnauthorizedException;
import com.tsl.exception.ResourceNotFoundException;
import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;
import com.tsl.model.CallSignal;
import com.tsl.model.CallStatus;
import com.tsl.model.ConversationStatus;
import com.tsl.model.MessageType;
import com.tsl.model.Role;
import com.tsl.model.TripCallSession;
import com.tsl.model.TripConversation;
import com.tsl.model.TripMessage;
import com.tsl.model.User;
import com.tsl.repository.BookingRepository;
import com.tsl.repository.CallSignalRepository;
import com.tsl.repository.TripCallSessionRepository;
import com.tsl.repository.TripConversationRepository;
import com.tsl.repository.TripMessageRepository;
import com.tsl.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripCommunicationService {

    private static final List<BookingStatus> CHAT_ALLOWED_STATUSES = List.of(
            BookingStatus.APPROVED, BookingStatus.COMPLETED);

    private final TripConversationRepository conversationRepository;
    private final TripMessageRepository messageRepository;
    private final TripCallSessionRepository callSessionRepository;
    private final CallSignalRepository callSignalRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public TripConversation ensureConversationForBooking(Booking booking) {
        return conversationRepository.findByBookingId(booking.getId())
                .orElseGet(() -> createConversation(booking));
    }

    public TripConversation createConversation(Booking booking) {
        if (booking.getAssignedDriverId() == null) {
            throw new BadRequestException("Driver must be assigned before opening a conversation");
        }
        TripConversation conversation = TripConversation.builder()
                .bookingId(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .customerId(booking.getCustomerId())
                .customerName(booking.getCustomerName())
                .driverId(booking.getAssignedDriverId())
                .driverName(booking.getAssignedDriverName())
                .status(ConversationStatus.ACTIVE)
                .lastMessageAt(LocalDateTime.now())
                .build();
        TripConversation saved = conversationRepository.save(conversation);
        saveSystemMessage(saved,
                "Secure TSL chat is active. Contact stays on-platform — personal numbers are not shared.");
        return saved;
    }

    public List<TripConversationResponse> listMyConversations(String userId, Role role) {
        List<TripConversation> conversations = switch (role) {
            case CUSTOMER -> conversationRepository.findByCustomerIdOrderByLastMessageAtDesc(userId);
            case DRIVER -> conversationRepository.findByDriverIdOrderByLastMessageAtDesc(userId);
            default -> throw new UnauthorizedException("Role cannot access trip conversations");
        };
        return conversations.stream()
                .map(c -> TripConversationResponse.from(c, 0))
                .toList();
    }

    public List<TripConversationResponse> listAllForAdmin() {
        return conversationRepository.findAll().stream()
                .sorted((a, b) -> {
                    LocalDateTime la = a.getLastMessageAt() != null ? a.getLastMessageAt() : a.getCreatedAt();
                    LocalDateTime lb = b.getLastMessageAt() != null ? b.getLastMessageAt() : b.getCreatedAt();
                    return lb.compareTo(la);
                })
                .map(c -> TripConversationResponse.from(c, 0))
                .toList();
    }

    public TripConversationResponse getConversation(String conversationId, String userId, Role role) {
        TripConversation conversation = requireConversation(conversationId);
        assertCanAccess(conversation, userId, role);
        return TripConversationResponse.from(conversation, 0);
    }

    public TripConversationResponse getByBookingId(String bookingId, String userId, Role role) {
        Booking booking = requireBooking(bookingId);
        assertBookingParticipant(booking, userId, role);
        if (!CHAT_ALLOWED_STATUSES.contains(booking.getStatus())) {
            throw new BadRequestException("Chat is available after your booking is approved");
        }
        TripConversation conversation = ensureConversationForBooking(booking);
        return TripConversationResponse.from(conversation, 0);
    }

    public String findConversationIdForBooking(String bookingId) {
        return conversationRepository.findByBookingId(bookingId).map(TripConversation::getId).orElse(null);
    }

    public List<TripMessageResponse> getMessages(
            String conversationId, String userId, Role role, LocalDateTime since) {
        TripConversation conversation = requireConversation(conversationId);
        assertCanAccess(conversation, userId, role);
        if (since != null) {
            return messageRepository
                    .findByConversationIdAndCreatedAtAfterOrderByCreatedAtAsc(conversationId, since)
                    .stream()
                    .map(TripMessageResponse::from)
                    .toList();
        }
        Pageable pageable = PageRequest.of(0, 200);
        Page<TripMessage> page = messageRepository.findByConversationIdOrderByCreatedAtAsc(
                conversationId, pageable);
        return page.getContent().stream().map(TripMessageResponse::from).toList();
    }

    public TripMessageResponse sendMessage(
            String conversationId,
            String userId,
            Role role,
            SendTripMessageRequest request) {
        TripConversation conversation = requireConversation(conversationId);
        assertCanParticipate(conversation, userId, role);
        validateMessageBody(request.getBody());

        Booking booking = requireBooking(conversation.getBookingId());
        if (!CHAT_ALLOWED_STATUSES.contains(booking.getStatus())) {
            throw new BadRequestException("Messaging is closed for this booking status");
        }

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TripMessage message = TripMessage.builder()
                .conversationId(conversationId)
                .bookingId(conversation.getBookingId())
                .senderId(userId)
                .senderRole(role)
                .senderDisplayName(displayNameForRole(sender, role, conversation))
                .body(request.getBody().trim())
                .type(MessageType.TEXT)
                .build();
        TripMessage saved = messageRepository.save(message);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return TripMessageResponse.from(saved);
    }

    public TripCallSessionResponse initiateCall(String conversationId, String userId, Role role) {
        TripConversation conversation = requireConversation(conversationId);
        assertCanParticipate(conversation, userId, role);

        callSessionRepository
                .findByConversationIdAndStatusIn(
                        conversationId, List.of(CallStatus.RINGING, CallStatus.ACTIVE))
                .ifPresent(existing -> {
                    throw new BadRequestException("A call is already in progress for this trip");
                });

        TripCallSession session = TripCallSession.builder()
                .conversationId(conversationId)
                .bookingId(conversation.getBookingId())
                .initiatorId(userId)
                .initiatorRole(role)
                .status(CallStatus.RINGING)
                .build();
        TripCallSession saved = callSessionRepository.save(session);
        saveSystemMessage(conversation,
                "Secure voice call started — connect in the TSL app. Personal numbers are not shared.");
        return TripCallSessionResponse.from(saved);
    }

    public TripCallSessionResponse getActiveCall(String conversationId, String userId, Role role) {
        TripConversation conversation = requireConversation(conversationId);
        assertCanAccess(conversation, userId, role);
        return callSessionRepository
                .findByConversationIdAndStatusIn(
                        conversationId, List.of(CallStatus.RINGING, CallStatus.ACTIVE))
                .map(TripCallSessionResponse::from)
                .orElse(null);
    }

    public TripCallSessionResponse acceptCall(String callId, String userId, Role role) {
        TripCallSession session = requireCall(callId);
        TripConversation conversation = requireConversation(session.getConversationId());
        assertCanParticipate(conversation, userId, role);
        if (session.getInitiatorId().equals(userId)) {
            throw new BadRequestException("Cannot accept your own call");
        }
        if (session.getStatus() != CallStatus.RINGING) {
            throw new BadRequestException("Call is not ringing");
        }
        session.setStatus(CallStatus.ACTIVE);
        session.setAnsweredAt(LocalDateTime.now());
        return TripCallSessionResponse.from(callSessionRepository.save(session));
    }

    public TripCallSessionResponse declineCall(String callId, String userId, Role role) {
        TripCallSession session = requireCall(callId);
        TripConversation conversation = requireConversation(session.getConversationId());
        assertCanParticipate(conversation, userId, role);
        if (session.getStatus() != CallStatus.RINGING) {
            throw new BadRequestException("Call is not ringing");
        }
        session.setStatus(session.getInitiatorId().equals(userId) ? CallStatus.ENDED : CallStatus.DECLINED);
        session.setEndedAt(LocalDateTime.now());
        return TripCallSessionResponse.from(callSessionRepository.save(session));
    }

    public TripCallSessionResponse endCall(String callId, String userId, Role role) {
        TripCallSession session = requireCall(callId);
        TripConversation conversation = requireConversation(session.getConversationId());
        assertCanParticipate(conversation, userId, role);
        if (session.getStatus() == CallStatus.ENDED || session.getStatus() == CallStatus.DECLINED
                || session.getStatus() == CallStatus.MISSED) {
            return TripCallSessionResponse.from(session);
        }
        LocalDateTime ended = LocalDateTime.now();
        session.setEndedAt(ended);
        if (session.getAnsweredAt() != null) {
            session.setDurationSeconds(
                    (int) ChronoUnit.SECONDS.between(session.getAnsweredAt(), ended));
        }
        session.setStatus(CallStatus.ENDED);
        return TripCallSessionResponse.from(callSessionRepository.save(session));
    }

    public CallSignalResponse postSignal(
            String callId, String userId, Role role, CallSignalRequest request) {
        TripCallSession session = requireCall(callId);
        TripConversation conversation = requireConversation(session.getConversationId());
        assertCanParticipate(conversation, userId, role);
        if (session.getStatus() != CallStatus.RINGING && session.getStatus() != CallStatus.ACTIVE) {
            throw new BadRequestException("Call is not active");
        }
        CallSignal signal = CallSignal.builder()
                .callSessionId(callId)
                .fromUserId(userId)
                .signalType(request.getSignalType())
                .payload(request.getPayload())
                .build();
        return CallSignalResponse.from(callSignalRepository.save(signal));
    }

    public List<CallSignalResponse> getSignals(
            String callId, String userId, Role role, LocalDateTime after) {
        TripCallSession session = requireCall(callId);
        TripConversation conversation = requireConversation(session.getConversationId());
        assertCanAccess(conversation, userId, role);
        LocalDateTime since = after != null ? after : LocalDateTime.of(1970, 1, 1, 0, 0);
        return callSignalRepository
                .findByCallSessionIdAndCreatedAtAfterOrderByCreatedAtAsc(callId, since)
                .stream()
                .map(CallSignalResponse::from)
                .toList();
    }

    public List<TripCallSessionResponse> listCallHistoryForAdmin(String conversationId) {
        if (conversationId != null) {
            return callSessionRepository.findByConversationIdOrderByCreatedAtDesc(conversationId)
                    .stream()
                    .map(TripCallSessionResponse::from)
                    .toList();
        }
        return callSessionRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(100)
                .map(TripCallSessionResponse::from)
                .toList();
    }

    private void saveSystemMessage(TripConversation conversation, String body) {
        messageRepository.save(TripMessage.builder()
                .conversationId(conversation.getId())
                .bookingId(conversation.getBookingId())
                .senderId("system")
                .senderRole(Role.ADMIN)
                .senderDisplayName("TSL")
                .body(body)
                .type(MessageType.SYSTEM)
                .build());
    }

    private void validateMessageBody(String body) {
        if (!StringUtils.hasText(body)) {
            throw new BadRequestException("Message cannot be empty");
        }
        String lower = body.toLowerCase();
        if (lower.matches(".*\\b(\\+?94|0)?7[0-9]{8}\\b.*")
                || lower.contains("wa.me/")
                || lower.contains("whatsapp")) {
            throw new BadRequestException(
                    "Please do not share phone numbers or WhatsApp links. Use TSL secure chat and calls.");
        }
    }

    private String displayNameForRole(User sender, Role role, TripConversation conversation) {
        if (role == Role.DRIVER) {
            return conversation.getDriverName();
        }
        if (role == Role.CUSTOMER) {
            return conversation.getCustomerName();
        }
        return sender.getFullName();
    }

    private TripConversation requireConversation(String id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
    }

    private TripCallSession requireCall(String id) {
        return callSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Call session not found"));
    }

    private Booking requireBooking(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    private void assertCanAccess(TripConversation conversation, String userId, Role role) {
        if (role == Role.ADMIN || role == Role.MANAGER) {
            return;
        }
        assertCanParticipate(conversation, userId, role);
    }

    private void assertCanParticipate(TripConversation conversation, String userId, Role role) {
        if (role == Role.CUSTOMER && userId.equals(conversation.getCustomerId())) {
            return;
        }
        if (role == Role.DRIVER && userId.equals(conversation.getDriverId())) {
            return;
        }
        if (role == Role.ADMIN || role == Role.MANAGER) {
            return;
        }
        throw new UnauthorizedException("You cannot access this conversation");
    }

    private void assertBookingParticipant(Booking booking, String userId, Role role) {
        if (role == Role.ADMIN || role == Role.MANAGER) {
            return;
        }
        if (role == Role.CUSTOMER && userId.equals(booking.getCustomerId())) {
            return;
        }
        if (role == Role.DRIVER && userId.equals(booking.getAssignedDriverId())) {
            return;
        }
        throw new UnauthorizedException("You cannot access this booking conversation");
    }
}
