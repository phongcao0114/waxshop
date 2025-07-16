# Dockerfile for Spring Boot Backend

# Use Gradle to build the JAR in a build stage
FROM gradle:8.7.0-jdk17-alpine AS build
WORKDIR /app
COPY . .
RUN echo "[BE] Building Spring Boot JAR (skip tests)..." && gradle build --no-daemon -x test

# Use a lightweight JDK image to run the app
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# Copy uploads folder to ensure initial images are available
COPY uploads/ /app/uploads/

# Expose port 8080
EXPOSE 8080

# Run the application with logging
CMD echo "[BE] Starting Backend container..." \
  && echo "[BE] Running Spring Boot application..." \
  && java -jar app.jar
