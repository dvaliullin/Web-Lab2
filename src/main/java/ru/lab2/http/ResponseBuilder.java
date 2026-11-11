package ru.lab2.http;

public class ResponseBuilder {

    private int statusCode = HttpStatus.OK.getCode();
    private String statusText = HttpStatus.OK.getMessage();
    private String contentType = "application/json; charset=UTF-8";
    private String body = "";

    public <T> ResponseBuilder status(T status) {
        this.statusCode = StatusCodeParser.parse(status);
        this.statusText = StatusCodeParser.extractStatusText(status, this.statusCode);
        return this;
    }

    public <T> ResponseBuilder body(T body) {
        this.body = (body != null) ? body.toString() : "";
        return this;
    }

    public String build() {
        return HttpResponseFormatter.format(statusCode, statusText, contentType, body);
    }
}