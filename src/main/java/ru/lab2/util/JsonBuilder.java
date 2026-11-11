package ru.lab2.util;

import java.util.Locale;

public class JsonBuilder {

    private final StringBuilder sb = new StringBuilder("{");
    private boolean firstField = true;

    public <T> JsonBuilder add(String key, T value) {
        appendSeparator();
        sb.append("\"").append(escape(key)).append("\":").append(formatValue(value));
        return this;
    }

    private <T> String formatValue(T value) {
        if (value == null) {
            return "null";
        }
        if (value instanceof Double || value instanceof Float) {
            return String.format(Locale.US, "%.3f", ((Number) value).doubleValue());
        }
        if (value instanceof Number || value instanceof Boolean) {
            return value.toString();
        }
        return "\"" + escape(value.toString()) + "\"";
    }

    private void appendSeparator() {
        if (!firstField) {
            sb.append(",");
        }
        firstField = false;
    }

    private String escape(String s) {
        return s == null ? "" : s.replace("\"", "\\\"");
    }

    public String build() {
        return sb.append("}").toString();
    }

    @Override
    public String toString() {
        return build();
    }

    public static String error(String message) {
        return new JsonBuilder().add("error", message).build();
    }
}