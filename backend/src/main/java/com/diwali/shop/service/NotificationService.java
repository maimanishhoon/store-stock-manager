package com.diwali.shop.service;

import com.diwali.shop.entity.Notification;
import com.diwali.shop.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Notification sendNotification(String title, String message, String type, Long referenceId, String targetRole) {
        Notification notification = new Notification(title, message, type, referenceId, targetRole);
        Notification saved = notificationRepository.save(notification);

        try {
            // Broadcast notification to WebSocket subscribers
            messagingTemplate.convertAndSend("/topic/notifications", saved);
        } catch (Exception e) {
            log.warn("WebSocket notification broadcast failed: {}", e.getMessage());
        }

        return saved;
    }

    public void broadcastOrderUpdate(Object orderData) {
        try {
            messagingTemplate.convertAndSend("/topic/orders", orderData);
        } catch (Exception e) {
            log.warn("WebSocket order update broadcast failed: {}", e.getMessage());
        }
    }

    public List<Notification> getNotificationsForRole(String role) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return notificationRepository.findAllByOrderByCreatedAtDesc();
        }
        return notificationRepository.findByTargetRole(role);
    }

    public long getUnreadCount(String role) {
        return notificationRepository.countUnreadByTargetRole(role);
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String role) {
        List<Notification> list = getNotificationsForRole(role);
        for (Notification n : list) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
