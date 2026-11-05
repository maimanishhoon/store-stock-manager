# ==========================================
# 🪔 Diwali Shop Manager - Backend Dockerfile
# Multi-stage build for Spring Boot 3 + Java 21
# ==========================================

# Stage 1: Build Application Jar
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lightweight Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root system user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy jar from builder
COPY --from=builder /app/target/*.jar app.jar

# Setup uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R spring:spring /app

USER spring:spring

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
