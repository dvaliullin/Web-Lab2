package ru.lab2.http;

public class StatusCodeParser {

    private static final int DEFAULT_STATUS_CODE = HttpStatus.OK.getCode();

    public static <T> int parse(T status) {
        if (status == null) {
            return DEFAULT_STATUS_CODE;
        }
        if (status instanceof Number num) {
            return num.intValue();
        }
        return parseFromString(status.toString());
    }

    public static <T> String extractStatusText(T status, int currentCode) {
        if (status instanceof String str && str.contains(" ")) {
            return str.substring(str.indexOf(' ') + 1).trim();
        }
        return HttpResponseFormatter.getDefaultStatusText(currentCode);
    }

    private static int parseFromString(String statusStr) {
        String numericPart = extractNumericPart(statusStr);
        return parseIntegerSafely(numericPart, DEFAULT_STATUS_CODE);
    }

    private static String extractNumericPart(String statusStr) {
        String trimmed = statusStr.trim();
        int spaceIndex = trimmed.indexOf(' ');
        return (spaceIndex > 0) ? trimmed.substring(0, spaceIndex) : trimmed;
    }

    private static int parseIntegerSafely(String str, int defaultVal) {
        try {
            return Integer.parseInt(str);
        } catch (NumberFormatException ignored) {
            return defaultVal;
        }
    }
}