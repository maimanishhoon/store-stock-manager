package com.diwali.shop.repository;

import com.diwali.shop.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();

    @Query("SELECT n FROM Notification n WHERE n.targetRole = 'ALL' OR n.targetRole = :role ORDER BY n.createdAt DESC")
    List<Notification> findByTargetRole(@Param("role") String role);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.targetRole = 'ALL' OR n.targetRole = :role) AND n.isRead = false")
    long countUnreadByTargetRole(@Param("role") String role);
}
