FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Layer cache: only re-downloads deps when pom.xml changes
COPY pom.xml .
RUN mvn dependency:resolve -B -q

COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=builder /app/target/*.jar app.jar

RUN mkdir -p /app/uploads && chown -R spring:spring /app

USER spring:spring

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
