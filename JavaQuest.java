/*
 * JavaQuest — servidor local que serve a plataforma e compila/executa
 * o código Java dos alunos usando o JDK instalado.
 *
 * Como usar (dentro desta pasta):
 *     java JavaQuest.java
 * e abra http://localhost:5517 no navegador.
 *
 * Requer JDK 17 ou superior. Só aceita conexões da própria máquina.
 */
import com.sun.net.httpserver.*;
import javax.tools.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class JavaQuest {
    static int PORT = Integer.parseInt(System.getProperty("port", "5517"));
    static final int TIMEOUT_MS = 10_000;
    static final int MAX_OUT = 200_000;
    static Path BASE;
    static Path RUNTIME_CLASSES;
    static String TOKEN;
    static String JAVA_EXE;

    public static void main(String[] args) throws Exception {
        BASE = Paths.get(args.length > 0 ? args[0] : System.getProperty("user.dir")).toAbsolutePath().normalize();
        if (!Files.exists(BASE.resolve("index.html"))) {
            System.err.println("Não encontrei index.html em " + BASE + ". Rode o comando dentro da pasta da plataforma.");
            System.exit(1);
        }
        if (ToolProvider.getSystemJavaCompiler() == null) {
            System.err.println("Compilador Java não encontrado. Instale um JDK (não apenas o JRE).");
            System.exit(1);
        }
        byte[] rnd = new byte[18];
        new SecureRandom().nextBytes(rnd);
        TOKEN = Base64.getUrlEncoder().withoutPadding().encodeToString(rnd);
        JAVA_EXE = Paths.get(System.getProperty("java.home"), "bin", isWindows() ? "java.exe" : "java").toString();

        compileRuntime();

        HttpServer server = openServer();
        server.createContext("/api/token", JavaQuest::handleToken);
        server.createContext("/api/run", JavaQuest::handleRun);
        server.createContext("/", JavaQuest::handleStatic);
        server.setExecutor(Executors.newFixedThreadPool(4));
        server.start();
        String url = "http://localhost:" + PORT;
        System.out.println("==============================================");
        System.out.println("  ☕ JavaQuest rodando em " + url);
        System.out.println("  Java " + System.getProperty("java.version") + " — Ctrl+C para encerrar");
        System.out.println("==============================================");
        try {
            if (java.awt.Desktop.isDesktopSupported()) java.awt.Desktop.getDesktop().browse(new URI(url));
        } catch (Throwable ignored) { }
    }

    /** Abre o servidor na porta padrão; se estiver ocupada, explica o motivo e usa a próxima porta livre. */
    static HttpServer openServer() throws IOException {
        int wanted = PORT;
        for (int p = wanted; p < wanted + 10; p++) {
            try {
                HttpServer s = HttpServer.create(new InetSocketAddress(InetAddress.getLoopbackAddress(), p), 0);
                if (p != wanted) {
                    System.out.println("  → Usando a porta " + p + " no lugar da " + wanted + ".");
                    System.out.println("    (O progresso salvo no navegador é separado por porta: ao voltar a usar a " + wanted + ", ele reaparece.)");
                    System.out.println();
                }
                PORT = p;
                return s;
            } catch (BindException e) {
                if (p == wanted) {
                    System.out.println();
                    if (isJavaQuest(wanted)) {
                        System.out.println("⚠ Já existe um JavaQuest aberto na porta " + wanted + ".");
                        System.out.println("  Provavelmente é outra janela do iniciar.bat / terminal — talvez com uma versão antiga.");
                        System.out.println("  Feche aquela janela (ou pressione Ctrl+C nela) e rode este de novo para usar a porta " + wanted + ".");
                    } else {
                        System.out.println("⚠ A porta " + wanted + " está sendo usada por outro programa.");
                    }
                }
            }
        }
        throw new IOException("Nenhuma porta livre entre " + wanted + " e " + (wanted + 9) + ". Feche outros servidores ou use: java -Dport=NUMERO JavaQuest.java");
    }

    /** Verifica se quem está na porta é um JavaQuest (responde em /api/token). */
    static boolean isJavaQuest(int port) {
        try {
            HttpURLConnection c = (HttpURLConnection) URI.create("http://127.0.0.1:" + port + "/api/token").toURL().openConnection();
            c.setConnectTimeout(1500);
            c.setReadTimeout(1500);
            if (c.getResponseCode() != 200) return false;
            String body = new String(c.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            return body.contains("\"token\"");
        } catch (IOException e) {
            return false;
        }
    }

    static boolean isWindows() { return System.getProperty("os.name").toLowerCase().contains("win"); }

    /* ---------- compila runtime/ (QT, MiniSpring e stubs do Spring/JPA) ---------- */
    static void compileRuntime() throws IOException {
        Path src = BASE.resolve("runtime");
        RUNTIME_CLASSES = Files.createTempDirectory("jq-runtime");
        List<File> files;
        try (Stream<Path> s = Files.walk(src)) {
            files = s.filter(p -> p.toString().endsWith(".java")).map(Path::toFile).collect(Collectors.toList());
        }
        JavaCompiler jc = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diag = new DiagnosticCollector<>();
        try (StandardJavaFileManager fm = jc.getStandardFileManager(diag, Locale.getDefault(), StandardCharsets.UTF_8)) {
            List<String> opts = List.of("-d", RUNTIME_CLASSES.toString(), "-encoding", "UTF-8", "-parameters", "-nowarn", "-proc:none");
            boolean ok = jc.getTask(null, fm, diag, opts, null, fm.getJavaFileObjectsFromFiles(files)).call();
            if (!ok) {
                diag.getDiagnostics().forEach(d -> System.err.println(d));
                throw new IllegalStateException("Falha ao compilar runtime/");
            }
        }
    }

    /* ---------- /api/token ---------- */
    static void handleToken(HttpExchange ex) throws IOException {
        if (!sameOrigin(ex)) { send(ex, 403, "text/plain", "forbidden"); return; }
        send(ex, 200, "application/json", "{\"token\":\"" + TOKEN + "\",\"java\":\"" + System.getProperty("java.version") + "\"}");
    }

    static boolean sameOrigin(HttpExchange ex) {
        String origin = ex.getRequestHeaders().getFirst("Origin");
        if (origin == null) return true; // GET same-origin sem Origin
        return origin.equals("http://localhost:" + PORT) || origin.equals("http://127.0.0.1:" + PORT);
    }

    /* ---------- /api/run ---------- */
    @SuppressWarnings("unchecked")
    static void handleRun(HttpExchange ex) throws IOException {
        if (!"POST".equals(ex.getRequestMethod()) || !sameOrigin(ex)
                || !TOKEN.equals(ex.getRequestHeaders().getFirst("X-JQ-Token"))) {
            send(ex, 403, "application/json", "{\"error\":\"forbidden\"}");
            return;
        }
        String body = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        Map<String, Object> req;
        try { req = (Map<String, Object>) new Json(body).parse(); }
        catch (Exception e) { send(ex, 400, "application/json", "{\"error\":\"json inválido\"}"); return; }
        Map<String, Object> resp;
        try { resp = run(req); }
        catch (Exception e) { resp = new LinkedHashMap<>(); resp.put("error", String.valueOf(e)); }
        send(ex, 200, "application/json", Json.stringify(resp));
    }

    @SuppressWarnings("unchecked")
    static Map<String, Object> run(Map<String, Object> req) throws Exception {
        Map<String, Object> files = (Map<String, Object>) req.getOrDefault("files", Map.of());
        String mainClass = (String) req.get("main");
        String stdin = (String) req.getOrDefault("stdin", "");
        List<Object> args = (List<Object>) req.getOrDefault("args", List.of());
        Map<String, Object> extra = (Map<String, Object>) req.getOrDefault("extraFiles", Map.of()); // arquivos de dados

        Path dir = Files.createTempDirectory("jq-run");
        Path classes = Files.createDirectories(dir.resolve("classes"));
        Path work = Files.createDirectories(dir.resolve("work"));
        Map<String, Object> out = new LinkedHashMap<>();
        try {
            for (Map.Entry<String, Object> e : extra.entrySet()) {
                Path p = work.resolve(e.getKey()).normalize();
                if (!p.startsWith(work)) continue;
                Files.createDirectories(p.getParent());
                Files.writeString(p, String.valueOf(e.getValue()), StandardCharsets.UTF_8);
            }
            // ---- compilação ----
            JavaCompiler jc = ToolProvider.getSystemJavaCompiler();
            DiagnosticCollector<JavaFileObject> diag = new DiagnosticCollector<>();
            List<JavaFileObject> units = new ArrayList<>();
            for (Map.Entry<String, Object> e : files.entrySet()) units.add(new Src(e.getKey(), String.valueOf(e.getValue())));
            List<Map<String, Object>> errors = new ArrayList<>();
            try (StandardJavaFileManager fm = jc.getStandardFileManager(diag, Locale.getDefault(), StandardCharsets.UTF_8)) {
                List<String> opts = List.of("-d", classes.toString(), "-cp", RUNTIME_CLASSES.toString(),
                        "-encoding", "UTF-8", "-parameters", "-Xlint:none", "-nowarn", "-proc:none", "-implicit:none");
                boolean ok = jc.getTask(null, fm, diag, opts, null, units).call();
                for (Diagnostic<? extends JavaFileObject> d : diag.getDiagnostics()) {
                    if (d.getKind() != Diagnostic.Kind.ERROR) continue;
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("file", d.getSource() == null ? "" : ((Src) d.getSource()).fileName);
                    m.put("line", d.getLineNumber());
                    m.put("col", d.getColumnNumber());
                    m.put("msg", d.getMessage(Locale.getDefault()));
                    errors.add(m);
                }
                if (!ok) {
                    out.put("stage", "compile");
                    out.put("errors", errors);
                    return out;
                }
            }
            // ---- execução em processo separado ----
            List<String> cmd = new ArrayList<>(List.of(JAVA_EXE,
                    "-cp", classes + File.pathSeparator + RUNTIME_CLASSES,
                    "-Xmx256m", "-Xss8m",
                    "-Dfile.encoding=UTF-8", "-Dstdout.encoding=UTF-8", "-Dstderr.encoding=UTF-8",
                    "-Dqt.classes=" + classes,
                    "-Duser.language=en", "-Duser.country=US", // ponto decimal no Scanner/printf
                    mainClass));
            for (Object a : args) cmd.add(String.valueOf(a));
            ProcessBuilder pb = new ProcessBuilder(cmd).directory(work.toFile());
            long t0 = System.nanoTime();
            Process p = pb.start();
            ExecutorService ioPool = Executors.newFixedThreadPool(2);
            Future<String> so = ioPool.submit(() -> readLimited(p.getInputStream()));
            Future<String> se = ioPool.submit(() -> readLimited(p.getErrorStream()));
            try (OutputStream os = p.getOutputStream()) {
                os.write(stdin.getBytes(StandardCharsets.UTF_8));
            } catch (IOException ignored) { }
            boolean finished = p.waitFor(TIMEOUT_MS, TimeUnit.MILLISECONDS);
            if (!finished) p.destroyForcibly();
            out.put("stage", "run");
            out.put("timeout", !finished);
            out.put("exitCode", finished ? p.exitValue() : -1);
            out.put("stdout", so.get(3, TimeUnit.SECONDS));
            out.put("stderr", se.get(3, TimeUnit.SECONDS));
            out.put("ms", (System.nanoTime() - t0) / 1_000_000);
            ioPool.shutdownNow();
            return out;
        } finally {
            deleteTree(dir);
        }
    }

    static String readLimited(InputStream in) throws IOException {
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        int n;
        while ((n = in.read(buf)) != -1) {
            if (bo.size() < MAX_OUT) bo.write(buf, 0, Math.min(n, MAX_OUT - bo.size()));
        }
        String s = bo.toString(StandardCharsets.UTF_8);
        return bo.size() >= MAX_OUT ? s + "\n... (saída cortada)" : s;
    }

    static void deleteTree(Path dir) {
        try (Stream<Path> s = Files.walk(dir)) {
            s.sorted(Comparator.reverseOrder()).forEach(p -> { try { Files.delete(p); } catch (IOException ignored) { } });
        } catch (IOException ignored) { }
    }

    static class Src extends SimpleJavaFileObject {
        final String code, fileName;
        Src(String fileName, String code) {
            super(URI.create("string:///" + fileName.replace(' ', '_')), Kind.SOURCE);
            this.fileName = fileName;
            this.code = code;
        }
        @Override public CharSequence getCharContent(boolean ignore) { return code; }
    }

    /* ---------- arquivos estáticos ---------- */
    static final Map<String, String> MIME = Map.of(
            "html", "text/html; charset=utf-8", "css", "text/css; charset=utf-8",
            "js", "application/javascript; charset=utf-8", "json", "application/json",
            "png", "image/png", "svg", "image/svg+xml", "ico", "image/x-icon", "md", "text/plain; charset=utf-8");

    static void handleStatic(HttpExchange ex) throws IOException {
        String path = URLDecoder.decode(ex.getRequestURI().getPath(), StandardCharsets.UTF_8);
        if (path.equals("/")) path = "/index.html";
        Path file = BASE.resolve(path.substring(1)).normalize();
        if (!file.startsWith(BASE) || !Files.isRegularFile(file) || path.contains("/.")) {
            send(ex, 404, "text/plain", "404");
            return;
        }
        String name = file.getFileName().toString();
        String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1) : "";
        ex.getResponseHeaders().set("Cache-Control", "no-cache");
        sendBytes(ex, 200, MIME.getOrDefault(ext, "application/octet-stream"), Files.readAllBytes(file));
    }

    static void send(HttpExchange ex, int code, String type, String body) throws IOException {
        sendBytes(ex, code, type.contains("charset") ? type : type + "; charset=utf-8", body.getBytes(StandardCharsets.UTF_8));
    }

    static void sendBytes(HttpExchange ex, int code, String type, byte[] b) throws IOException {
        ex.getResponseHeaders().set("Content-Type", type);
        ex.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        ex.sendResponseHeaders(code, b.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(b); }
    }

    /* ---------- JSON mínimo ---------- */
    static class Json {
        final String s; int i = 0;
        Json(String s) { this.s = s; }
        Object parse() { ws(); Object v = val(); ws(); return v; }
        void ws() { while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++; }
        Object val() {
            ws();
            char c = s.charAt(i);
            if (c == '{') {
                i++; Map<String, Object> m = new LinkedHashMap<>(); ws();
                if (s.charAt(i) == '}') { i++; return m; }
                while (true) { ws(); String k = str(); ws(); i++; m.put(k, val()); ws(); if (s.charAt(i++) == '}') return m; }
            }
            if (c == '[') {
                i++; List<Object> l = new ArrayList<>(); ws();
                if (s.charAt(i) == ']') { i++; return l; }
                while (true) { l.add(val()); ws(); if (s.charAt(i++) == ']') return l; }
            }
            if (c == '"') return str();
            if (s.startsWith("true", i)) { i += 4; return true; }
            if (s.startsWith("false", i)) { i += 5; return false; }
            if (s.startsWith("null", i)) { i += 4; return null; }
            int st = i; while (i < s.length() && "+-0123456789.eE".indexOf(s.charAt(i)) >= 0) i++;
            return Double.parseDouble(s.substring(st, i));
        }
        String str() {
            StringBuilder b = new StringBuilder(); i++;
            while (true) {
                char c = s.charAt(i++);
                if (c == '"') return b.toString();
                if (c == '\\') {
                    char e = s.charAt(i++);
                    switch (e) {
                        case 'n': b.append('\n'); break; case 't': b.append('\t'); break;
                        case 'r': b.append('\r'); break; case 'b': b.append('\b'); break; case 'f': b.append('\f'); break;
                        case 'u': b.append((char) Integer.parseInt(s.substring(i, i + 4), 16)); i += 4; break;
                        default: b.append(e);
                    }
                } else b.append(c);
            }
        }
        static String stringify(Object o) {
            if (o == null) return "null";
            if (o instanceof String) return quote((String) o);
            if (o instanceof Number || o instanceof Boolean) return String.valueOf(o);
            if (o instanceof Map) {
                return ((Map<?, ?>) o).entrySet().stream().map(e -> quote(String.valueOf(e.getKey())) + ":" + stringify(e.getValue()))
                        .collect(Collectors.joining(",", "{", "}"));
            }
            if (o instanceof Collection) return ((Collection<?>) o).stream().map(Json::stringify).collect(Collectors.joining(",", "[", "]"));
            return quote(String.valueOf(o));
        }
        static String quote(String s) {
            StringBuilder b = new StringBuilder("\"");
            for (char c : s.toCharArray()) {
                switch (c) {
                    case '"': b.append("\\\""); break; case '\\': b.append("\\\\"); break;
                    case '\n': b.append("\\n"); break; case '\r': b.append("\\r"); break; case '\t': b.append("\\t"); break;
                    default: if (c < 0x20) b.append(String.format("\\u%04x", (int) c)); else b.append(c);
                }
            }
            return b.append('"').toString();
        }
    }
}
