package ru.lab2.validation;

import java.util.Arrays;
import java.util.List;

public class Validator {

    private static final List<Double> VALID_X = Arrays.asList(-5.0, -4.0, -3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0);
    private static final List<Double> VALID_R = Arrays.asList(1.0, 2.0, 3.0, 4.0, 5.0);

    public static boolean validate(double x, double y, double r) {
        boolean isXValid = VALID_X.contains(x);
        boolean isYValid = (y > -5.0 && y < 5.0);
        boolean isRValid = VALID_R.contains(r);

        return isXValid && isYValid && isRValid;
    }
}
