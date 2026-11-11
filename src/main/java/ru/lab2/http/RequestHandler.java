package ru.lab2.http;

import ru.lab2.util.QueryParser;
import ru.lab2.validation.AreaChecker;
import ru.lab2.validation.Validator;

import java.util.Map;

public class RequestHandler {

    public void handle() {
        long startTime = System.nanoTime();
        try {
            process(startTime);
        } catch (IllegalArgumentException e) {
            ResponseSender.sendError(400, e.getMessage());
        } catch (Exception e) {
            ResponseSender.sendError(500, "Внутренняя ошибка сервера: " + e.getMessage());
        }
    }

    private void process(long startTime) {
        String queryString = QueryParser.getQueryString();
        Map<String, Double> params = QueryParser.parse(queryString);

        double x = params.get("x");
        double y = params.get("y");
        double r = params.get("r");

        if (!Validator.validate(x, y, r)) {
            ResponseSender.sendError(422, "Параметры выходят за границы допустимых диапазонов");
            return;
        }

        executeAndRespond(x, y, r, startTime);
    }

    private void executeAndRespond(double x, double y, double r, long startTime) {
        boolean isHit = AreaChecker.checkHit(x, y, r);
        long executionTime = System.nanoTime() - startTime;

        ResponseSender.sendSuccess(x, y, r, isHit, executionTime);
    }
}