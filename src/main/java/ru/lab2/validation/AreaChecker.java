package ru.lab2.validation;

public class AreaChecker {

    public static boolean checkHit(double x, double y, double r) {
        if (x <= 0 && y >= 0) {
            return y <= (0.5 * x + 0.5 * r);
        }
        if (x <= 0 && y <= 0) {
            return (x * x + y * y) <= Math.pow(r / 2.0, 2);
        }
        if (x >= 0 && y <= 0) {
            return (x <= r / 2.0) && (y >= -r);
        }
        return false;
    }
}
