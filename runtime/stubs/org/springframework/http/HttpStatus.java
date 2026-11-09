package org.springframework.http;

public enum HttpStatus {
    OK(200), CREATED(201), ACCEPTED(202), NO_CONTENT(204),
    MOVED_PERMANENTLY(301), FOUND(302),
    BAD_REQUEST(400), UNAUTHORIZED(401), FORBIDDEN(403), NOT_FOUND(404), METHOD_NOT_ALLOWED(405),
    CONFLICT(409), UNPROCESSABLE_ENTITY(422), INTERNAL_SERVER_ERROR(500);

    private final int value;
    HttpStatus(int value) { this.value = value; }
    public int value() { return value; }
    public boolean is2xxSuccessful() { return value >= 200 && value < 300; }
    public boolean is4xxClientError() { return value >= 400 && value < 500; }
    public static HttpStatus valueOf(int code) {
        for (HttpStatus s : values()) if (s.value == code) return s;
        throw new IllegalArgumentException("Status desconhecido: " + code);
    }
}
