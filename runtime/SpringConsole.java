import java.util.*;

/**
 * Executado pelo botão "Enviar requisição" nas fases de Spring.
 * Requisições (uma por linha) chegam pela entrada padrão — ou pelos argumentos:
 *   MÉTODO /url k=v&k=v      ou      MÉTODO /url {"json": "no corpo"}
 * Todas as requisições rodam na mesma "aplicação" (o estado é mantido entre elas).
 * (A entrada padrão evita que o Windows remova as aspas do JSON nos argumentos.)
 */
public class SpringConsole {
    public static void main(String[] args) {
        if (args.length == 0) {
            List<String> lines = new ArrayList<>();
            Scanner in = new Scanner(System.in, java.nio.charset.StandardCharsets.UTF_8);
            while (in.hasNextLine()) lines.add(in.nextLine());
            args = lines.toArray(new String[0]);
        }
        MiniSpring.start();
        List<String> rs = MiniSpring.routes();
        if (rs.isEmpty()) {
            System.out.println("⚠ Nenhuma rota encontrada. Você anotou a classe com @RestController e os métodos com @GetMapping/@PostMapping...?");
            return;
        }
        System.out.println("Rotas mapeadas: " + rs);
        System.out.println();
        for (String line : args) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith("#")) continue;
            String[] p = line.split("\\s+", 3);
            String method = p[0].toUpperCase();
            String url = p.length > 1 ? p[1] : "/";
            Map<String, String> params = new LinkedHashMap<>();
            String body = null;
            if (p.length > 2) {
                String rest = p[2].trim();
                if (rest.startsWith("{") || rest.startsWith("[")) {
                    body = rest; // corpo JSON para @RequestBody
                } else {
                    for (String kv : rest.split("&")) {
                        String[] x = kv.split("=", 2);
                        if (!x[0].isEmpty()) params.put(x[0].trim(), x.length > 1 ? x[1].trim() : "");
                    }
                }
            }
            MiniSpring.Response r = MiniSpring.request(method, url, params, body);
            System.out.println("> " + method + " " + url + (params.isEmpty() ? "" : "  " + params) + (body == null ? "" : "  corpo: " + body));
            System.out.println("< " + r.status + " " + statusText(r.status) + "  " + (r.json.isEmpty() ? "(sem corpo)" : r.json));
            System.out.println();
        }
    }

    static String statusText(int s) {
        switch (s) {
            case 200: return "OK"; case 201: return "Created"; case 204: return "No Content";
            case 400: return "Bad Request"; case 404: return "Not Found"; case 405: return "Method Not Allowed";
            case 409: return "Conflict"; case 500: return "Internal Server Error";
            default: return "";
        }
    }
}
