package org.springframework.http;

/** Versão simplificada do ResponseEntity do Spring (corpo + status HTTP). */
public class ResponseEntity<T> {
    private final T body;
    private final int status;

    public ResponseEntity(HttpStatus status) { this(null, status); }
    public ResponseEntity(T body, HttpStatus status) { this.body = body; this.status = status.value(); }
    private ResponseEntity(T body, int status) { this.body = body; this.status = status; }

    public T getBody() { return body; }
    public boolean hasBody() { return body != null; }
    public HttpStatus getStatusCode() { return HttpStatus.valueOf(status); }
    public int getStatusCodeValue() { return status; }

    public static <T> ResponseEntity<T> ok(T body) { return new ResponseEntity<>(body, 200); }
    public static BodyBuilder ok() { return new Builder(200); }
    public static BodyBuilder status(HttpStatus status) { return new Builder(status.value()); }
    public static BodyBuilder status(int status) { return new Builder(status); }
    public static BodyBuilder badRequest() { return new Builder(400); }
    public static BodyBuilder created(java.net.URI location) { return new Builder(201); }
    public static BodyBuilder accepted() { return new Builder(202); }
    public static BodyBuilder internalServerError() { return new Builder(500); }
    public static HeadersBuilder notFound() { return new Builder(404); }
    public static HeadersBuilder noContent() { return new Builder(204); }

    public interface HeadersBuilder {
        <T> ResponseEntity<T> build();
    }

    public interface BodyBuilder extends HeadersBuilder {
        <T> ResponseEntity<T> body(T body);
    }

    private static class Builder implements BodyBuilder {
        private final int status;
        Builder(int status) { this.status = status; }
        public <T> ResponseEntity<T> body(T body) { return new ResponseEntity<>(body, status); }
        public <T> ResponseEntity<T> build() { return new ResponseEntity<>(null, status); }
    }

    @Override
    public String toString() { return "<" + status + "," + body + ">"; }
}
