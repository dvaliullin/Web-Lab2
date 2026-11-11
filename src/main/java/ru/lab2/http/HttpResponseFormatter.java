package ru.lab2.http;

import java.nio.charset.StandardCharsets;

public class HttpResponseFormatter {

    private static final String CRLF = "\r\n";

    private static final String RESPONSE_TEMPLATE = "HTTP/1.1 %d %s" + CRLF +
            "Content-Type: %s" + CRLF +
            "Content-Length: %d" + CRLF +
            "Access-Control-Allow-Origin: *" + CRLF +
            CRLF +
            "%s";

    public static String format(int statusCode, String statusText, String contentType, String body) {
        String safeBody = (body != null) ? body : "";
        byte[] bodyBytes = safeBody.getBytes(StandardCharsets.UTF_8);

        return String.format(
                RESPONSE_TEMPLATE,
                statusCode,
                statusText,
                contentType,
                bodyBytes.length,
                safeBody);
    }

    public static String getDefaultStatusText(int code) {
        for (HttpStatus status : HttpStatus.values()) {
            if (status.getCode() == code) {
                return status.getMessage();
            }
        }
        return (code >= 200 && code < 400) ? "OK" : "Error";
    }
}
