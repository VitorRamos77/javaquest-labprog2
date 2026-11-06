import java.util.*;

/**
 * Executado pelo botão "Enviar requisição" nas fases de Spring.
 * Argumentos: linhas no formato  "MÉTODO /url k=v&k=v"
 * Todas as requisições rodam na mesma "aplicação" (o estado é mantido entre elas).
 */
public class SpringConsole {
    public static void main(String[] args) {
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
            if (p.length > 2) {
                for (String kv : p[2].split("&")) {
                    String[] x = kv.split("=", 2);
                    if (!x[0].isEmpty()) params.put(x[0].trim(), x.length > 1 ? x[1].trim() : "");
                }
            }
            MiniSpring.Response r = MiniSpring.request(method, url, params);
            System.out.println("> " + method + " " + url + (params.isEmpty() ? "" : "  " + params));
            System.out.println("< " + r.status + "  " + r.json);
            System.out.println();
        }
    }
}
