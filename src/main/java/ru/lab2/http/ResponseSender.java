package ru.lab2.http;

import java.time.Instant;

import ru.lab2.util.JsonBuilder;

public class ResponseSender {

    public static void sendSuccess(double x, double y, double r, boolean isHit, long executionTimeNs) {
        String httpResponse = new ResponseBuilder()
                .status(200)
                .body(new JsonBuilder()
                        .add("x", x)
                        .add("y", y)
                        .add("r", r)
                        .add("hit", isHit)
                        .add("timestamp", Instant.now().toEpochMilli())
                        .add("executionTime", executionTimeNs))
                .build();

        send(httpResponse);
    }

    public static void sendError(int statusCode, String message) {
        String httpResponse = new ResponseBuilder()
                .status(statusCode)
                .body(JsonBuilder.error(message))
                .build();

        send(httpResponse);
    }

    private static void send(String fullResponse) {
        System.out.print(fullResponse);
        System.out.flush();
    }
}