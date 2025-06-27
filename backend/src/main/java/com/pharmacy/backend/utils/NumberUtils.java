package com.pharmacy.backend.utils;

public class NumberUtils {
    public static String toPriceChangeType(Long priceDifferent) {
        if (priceDifferent == null) {
            return "NO_CHANGE";
        }
        if (priceDifferent > 0) {
            return "INCREASE";
        } else if (priceDifferent < 0) {
            return "DECREASE";
        } else {
            return "NO_CHANGE";
        }
    }
}
