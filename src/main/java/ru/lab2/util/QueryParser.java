package ru.lab2.util;

import java.util.HashMap;
import java.util.Map;

public class QueryParser {

    private static final String[] REQUIRED_PARAMS = { "x", "y", "r" };

    public static String getQueryString() {
        String qs = System.getProperties().getProperty("QUERY_STRING");
        return (qs != null && !qs.isEmpty()) ? qs : System.getenv("QUERY_STRING");
    }

    public static Map<String, Double> parse(String queryString) {
        validateNotEmpty(queryString);
        Map<String, String> rawParams = extractRawParams(queryString);
        checkRequiredParams(rawParams);
        return convertToCoordinates(rawParams);
    }

    private static void validateNotEmpty(String queryString) {
        if (queryString == null || queryString.trim().isEmpty()) {
            throw new IllegalArgumentException("Строка запроса пуста");
        }
    }

    private static Map<String, String> extractRawParams(String queryString) {
        Map<String, String> map = new HashMap<>();
        for (String pair : queryString.split("&")) {
            String[] kv = pair.split("=");
            if (kv.length == 2) {
                map.put(kv[0].trim().toLowerCase(), kv[1].trim());
            }
        }
        return map;
    }

    private static void checkRequiredParams(Map<String, String> rawParams) {
        for (String param : REQUIRED_PARAMS) {
            if (!rawParams.containsKey(param)) {
                throw new IllegalArgumentException("Отсутствует обязательный параметр: " + param);
            }
        }
    }

    private static Map<String, Double> convertToCoordinates(Map<String, String> rawParams) {
        try {
            Map<String, Double> coordinates = new HashMap<>();
            coordinates.put("x", parseSafeDouble(rawParams.get("x")));
            coordinates.put("y", parseSafeDouble(rawParams.get("y")));
            coordinates.put("r", parseSafeDouble(rawParams.get("r")));
            return coordinates;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Координаты x, y и радиус r должны быть числами");
        }
    }

    private static double parseSafeDouble(String raw) {
        String val = raw.trim().replace(',', '.');
        if (val.contains(".")) {
            String[] parts = val.split("\\.");
            if (parts.length == 2 && parts[1].length() > 15) {
                val = parts[0] + "." + parts[1].substring(0, 10);
            }
        }
        return Double.parseDouble(val);
    }
}