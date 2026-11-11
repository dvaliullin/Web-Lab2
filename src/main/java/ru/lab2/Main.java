package ru.lab2;

import com.fastcgi.FCGIInterface;

import ru.lab2.http.RequestHandler;

public class Main {

    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();
        RequestHandler requestHandler = new RequestHandler();

        while (fcgi.FCGIaccept() >= 0) {
            requestHandler.handle();
        }
    }
}