/* =========================================================
   SIMULADOS DE PROVA — no formato da P1 (cenário, classe modelo,
   "banco" mockado e endpoints), valendo 10 pontos em 50 minutos.
   Cada teste começa com "[x]", onde x é o item (a…g) que ele corrige.
   O item só pontua se TODOS os seus testes passarem.
   ========================================================= */
window.PHASES = window.PHASES || [];

(function () {
  const J = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const N = (s) => s.replace(/"/g, '\\"');
  const eqJson = (name, call, expected) => `QT.test("${N(name)}", () -> QT.eq("${J(expected)}", ${call}.json));`;
  const eqStatus = (name, call, status, expected) => expected === undefined
    ? `QT.test("${N(name)}", () -> { MiniSpring.Response r = ${call}; QT.eq(${status}, r.status); });`
    : `QT.test("${N(name)}", () -> { MiniSpring.Response r = ${call}; QT.eq(${status}, r.status); QT.eq("${J(expected)}", r.json); });`;
  const toMapJson = (name, make, expected) => `QT.test("${N(name)}", () -> QT.eq("${J(expected)}", MiniSpring.json(QT.callM(${make}, "toMap"))));`;

  /* =================================================================
     SIMULADO 1 — PAINEL DE VOOS (versão Java/Spring da P1)
     ================================================================= */
  const VOO_START = `import java.util.HashMap;
import java.util.Map;

public class Voo {
    private String cia;
    private int numero;
    private String origem;
    private String destino;
    private String status;

    public Voo(String cia, int numero, String origem, String destino, String status) {
        // TODO: item a
    }

    @Override
    public String toString() {
        return ""; // TODO: item b
    }

    public boolean estaAtrasado() {
        return false; // TODO: item c
    }

    public Map<String, Object> toMap() {
        return null; // TODO: item d
    }
}
`;
  const VOO_SOL = `import java.util.HashMap;
import java.util.Map;

public class Voo {
    private String cia;
    private int numero;
    private String origem;
    private String destino;
    private String status;

    public Voo(String cia, int numero, String origem, String destino, String status) {
        this.cia = cia;
        this.numero = numero;
        this.origem = origem;
        this.destino = destino;
        this.status = status;
    }

    public int getNumero() { return numero; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "<Voo cia=" + cia + " numero=" + numero + ">";
    }

    public boolean estaAtrasado() {
        return status.equals("ATRASADO");
    }

    public Map<String, Object> toMap() {
        Map<String, Object> m = new HashMap<>();
        m.put("cia", cia);
        m.put("numero", numero);
        m.put("origem", origem);
        m.put("destino", destino);
        m.put("status", status);
        m.put("atrasado", estaAtrasado());
        return m;
    }
}
`;
  const BANCO_VOOS = `import java.util.ArrayList;
import java.util.List;

/** Fonte de dados (mock). Alterações nos objetos retornados são "persistidas". */
public class Banco {
    private static final List<Voo> voos = new ArrayList<>(List.of(
        new Voo("G3", 1234, "GIG", "BSB", "EMBARQUE"),
        new Voo("LA", 4567, "GIG", "GRU", "ATRASADO"),
        new Voo("AD", 8901, "SDU", "CNF", "PREVISTO"),
        new Voo("G3", 9876, "GIG", "SSA", "EMBARCADO")
    ));

    public static List<Voo> buscarVoosBanco() {
        return voos;
    }
}
`;
  const CTRL_VOOS_HEAD = `import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class VooController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        try {
            List<Voo> voos = Banco.buscarVoosBanco();
            return ResponseEntity.ok(Map.of("status", "ok", "voos_cadastrados", voos.size()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "erro ao acessar os voos"));
        }
    }
`;
  const CTRL_VOOS_START = CTRL_VOOS_HEAD + `
    // TODO: item e

    // TODO: item f

    // TODO: item g
}
`;
  const CTRL_VOOS_SOL = CTRL_VOOS_HEAD + `
    private Voo buscar(int numero) {
        for (Voo v : Banco.buscarVoosBanco()) {
            if (v.getNumero() == numero) return v;
        }
        return null;
    }

    // item e
    @GetMapping("/voos")
    public List<Map<String, Object>> listar() {
        List<Map<String, Object>> r = new ArrayList<>();
        for (Voo v : Banco.buscarVoosBanco()) {
            if (!v.getStatus().equals("EMBARCADO")) r.add(v.toMap());
        }
        return r;
    }

    // item f
    @GetMapping("/voos/{numero}")
    public ResponseEntity<Map<String, Object>> porNumero(@PathVariable("numero") int numero) {
        Voo v = buscar(numero);
        if (v == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", "Voo não encontrado"));
        return ResponseEntity.ok(v.toMap());
    }

    // item g
    @PostMapping("/voos/{numero}")
    public ResponseEntity<Map<String, Object>> atualizar(@PathVariable("numero") int numero,
                                                         @RequestBody Map<String, String> corpo) {
        Voo v = buscar(numero);
        if (v == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", "Voo não encontrado"));
        v.setStatus(corpo.get("status"));
        return ResponseEntity.ok(v.toMap());
    }
}
`;
  const APP = (n) => ({ name: n + '.java', readonly: true, code: `import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${n} {
    public static void main(String[] args) {
        SpringApplication.run(${n}.class, args);
    }
}
` });
  const V = (cia, num, o, d, st) => `{"atrasado":${st === 'ATRASADO'},"cia":"${cia}","destino":"${d}","numero":${num},"origem":"${o}","status":"${st}"}`;

  PHASES.push({
    id: 'x01', track: 'simulado', icon: '✈️', level: 3, kind: 'spring',
    title: 'Simulado 1 — Painel de Voos', subtitle: 'A P1 de Python, agora em Java + Spring Boot',
    cola: ['spring', 'poo', 'colecoes'],
    theory: [],
    exam: {
      duracao: 50,
      cenario: 'Você é um desenvolvedor de software e foi contratado para desenvolver um sistema de informações para um aeroporto. O sistema exibirá, em tempo real, os voos programados para o dia, com seu status atual. Sua tarefa é implementar a **API** que fornecerá esses dados para o front-end (um painel de partidas).\n\nO sistema deve fornecer os dados por meio de uma API RESTful com os endpoints:\n- `GET /health` — saúde da API (**já implementado**)\n- `GET /voos` — todos os voos do dia, **exceto os que já embarcaram**\n- `GET /voos/{numero}` — dados do voo com o número informado\n- `POST /voos/{numero}` — atualiza o status do voo com o número informado',
      classe: 'Voo',
      attrs: [['cia', 'String', 'Código da companhia aérea', '"G3"'], ['numero', 'int', 'Número do voo', '1234'], ['origem', 'String', 'Aeroporto de origem', '"GIG"'], ['destino', 'String', 'Aeroporto de destino', '"BSB"'], ['status', 'String', 'Situação atual do voo', '"EMBARQUE"']],
      obs: 'Possíveis valores de `status`: `PREVISTO`, `EMBARQUE`, `ATRASADO`, `EMBARCADO`.',
      dados: 'Considere que `Banco.buscarVoosBanco()` (arquivo `Banco.java`) já está implementado, e que alterações feitas nos objetos retornados são **automaticamente persistidas**.',
      itens: [
        { id: 'a', pts: 0.5, txt: 'Implemente o **construtor** da classe `Voo` com os cinco atributos obrigatórios.' },
        { id: 'b', pts: 1.0, txt: 'Implemente o `toString()` da classe `Voo`, no formato `<Voo cia=XX numero=YYYY>` (ex.: `<Voo cia=G3 numero=1234>`).' },
        { id: 'c', pts: 1.0, txt: 'Implemente `boolean estaAtrasado()`: `true` quando o status for `"ATRASADO"`, `false` nos demais casos.' },
        { id: 'd', pts: 1.0, txt: 'Implemente `Map<String, Object> toMap()`, a representação usada nas respostas JSON:\n`{"cia": "LA", "numero": 4567, "origem": "GIG", "destino": "GRU", "status": "ATRASADO", "atrasado": true}`' },
        { id: 'e', pts: 2.0, txt: 'Implemente `GET /voos`: retorna, em JSON, uma lista com a representação (item d) de todos os voos que **ainda não embarcaram**.' },
        { id: 'f', pts: 2.0, txt: 'Implemente `GET /voos/{numero}` (`numero` inteiro). Se existir, retorna a representação do voo com status **200**. Senão, `{"erro": "Voo não encontrado"}` com status **404**.' },
        { id: 'g', pts: 2.5, txt: 'Implemente `POST /voos/{numero}`. O corpo é um JSON com a chave `status` (o novo status). Se o voo existir, atualiza o status e retorna sua representação com **200**. Senão, `{"erro": "Voo não encontrado"}` com **404**. Não é necessário validar o valor de `status`.' },
      ],
      exemplo: `GET  /voos
→ 200 [{"cia":"G3","numero":1234,"origem":"GIG","destino":"BSB","status":"EMBARQUE","atrasado":false}, ...]

GET  /voos/4567
→ 200 {"cia":"LA","numero":4567,"origem":"GIG","destino":"GRU","status":"ATRASADO","atrasado":true}

POST /voos/8901   corpo: {"status": "ATRASADO"}
→ 200 {"cia":"AD","numero":8901,"origem":"SDU","destino":"CNF","status":"ATRASADO","atrasado":true}`,
    },
    task: '',
    files: [
      { name: 'Voo.java', code: VOO_START },
      { name: 'VooController.java', code: CTRL_VOOS_START },
      { name: 'Banco.java', readonly: true, code: BANCO_VOOS },
      APP('AeroportoApplication'),
    ],
    requests: 'GET /health\nGET /voos\nGET /voos/4567\nGET /voos/1111\nPOST /voos/8901 {"status": "ATRASADO"}\nGET /voos/8901',
    hints: [],
    test: `
QT.test("[a] Construtor guarda os 5 atributos", () -> {
    Object v = QT.make("Voo", "G3", 1234, "GIG", "BSB", "EMBARQUE");
    QT.eq("G3", QT.field(v, "cia")); QT.eq(1234, QT.field(v, "numero")); QT.eq("GIG", QT.field(v, "origem"));
    QT.eq("BSB", QT.field(v, "destino")); QT.eq("EMBARQUE", QT.field(v, "status"));
});
QT.test("[b] toString() → <Voo cia=G3 numero=1234>", () -> QT.eq("<Voo cia=G3 numero=1234>", QT.make("Voo", "G3", 1234, "GIG", "BSB", "EMBARQUE").toString()));
QT.test("[b] toString() de outro voo", () -> QT.eq("<Voo cia=LA numero=4567>", QT.make("Voo", "LA", 4567, "GIG", "GRU", "ATRASADO").toString()));
QT.test("[c] estaAtrasado() com ATRASADO → true", () -> QT.eq(true, QT.callM(QT.make("Voo", "LA", 4567, "GIG", "GRU", "ATRASADO"), "estaAtrasado")));
QT.test("[c] estaAtrasado() nos outros status → false", () -> {
    for (String s : new String[]{"PREVISTO", "EMBARQUE", "EMBARCADO"})
        QT.eq(false, QT.callM(QT.make("Voo", "G3", 1, "GIG", "BSB", s), "estaAtrasado"));
});
${toMapJson('[d] toMap() de um voo atrasado', 'QT.make("Voo", "LA", 4567, "GIG", "GRU", "ATRASADO")', V('LA', 4567, 'GIG', 'GRU', 'ATRASADO'))}
${toMapJson('[d] toMap() de um voo no horário', 'QT.make("Voo", "G3", 1234, "GIG", "BSB", "EMBARQUE")', V('G3', 1234, 'GIG', 'BSB', 'EMBARQUE'))}
${eqStatus('[-] GET /health continua funcionando', 'MiniSpring.get("/health")', 200, '{"status":"ok","voos_cadastrados":4}')}
${eqStatus('[e] GET /voos → os 3 voos que não embarcaram', 'MiniSpring.get("/voos")', 200, '[' + V('G3', 1234, 'GIG', 'BSB', 'EMBARQUE') + ',' + V('LA', 4567, 'GIG', 'GRU', 'ATRASADO') + ',' + V('AD', 8901, 'SDU', 'CNF', 'PREVISTO') + ']')}
${eqStatus('[f] GET /voos/4567 → 200', 'MiniSpring.get("/voos/4567")', 200, V('LA', 4567, 'GIG', 'GRU', 'ATRASADO'))}
${eqStatus('[f] GET /voos/1111 → 404', 'MiniSpring.get("/voos/1111")', 404, '{"erro":"Voo não encontrado"}')}
${eqStatus('[g] POST /voos/8901 {"status":"ATRASADO"} → 200', 'MiniSpring.postJson("/voos/8901", "{\\"status\\": \\"ATRASADO\\"}")', 200, V('AD', 8901, 'SDU', 'CNF', 'ATRASADO'))}
${eqStatus('[g] A alteração fica salva (GET /voos/8901)', 'MiniSpring.get("/voos/8901")', 200, V('AD', 8901, 'SDU', 'CNF', 'ATRASADO'))}
${eqStatus('[g] POST /voos/1111 → 404', 'MiniSpring.postJson("/voos/1111", "{\\"status\\": \\"PREVISTO\\"}")', 404, '{"erro":"Voo não encontrado"}')}
QT.test("[g] Voo que passa a EMBARCADO some de GET /voos", () -> {
    MiniSpring.postJson("/voos/1234", "{\\"status\\": \\"EMBARCADO\\"}");
    QT.isTrue(!MiniSpring.get("/voos").json.contains("1234"), "O voo 1234 deveria ter saído da lista");
});`,
    solution: [
      { name: 'Voo.java', code: VOO_SOL },
      { name: 'VooController.java', code: CTRL_VOOS_SOL },
      { name: 'Banco.java', readonly: true, code: BANCO_VOOS },
      APP('AeroportoApplication'),
    ],
  });

  /* =================================================================
     SIMULADO 2 — CINEMA
     ================================================================= */
  const SESSAO_START = `import java.util.HashMap;
import java.util.Map;

public class Sessao {
    private int id;
    private String filme;
    private int sala;
    private String horario;
    private int capacidade;
    private int vendidos;

    public Sessao(int id, String filme, int sala, String horario, int capacidade, int vendidos) {
        // TODO: item a
    }

    @Override
    public String toString() {
        return ""; // TODO: item b
    }

    public int disponiveis() {
        return 0; // TODO: item c
    }

    public boolean estaLotada() {
        return false; // TODO: item c
    }

    public Map<String, Object> toMap() {
        return null; // TODO: item d
    }
}
`;
  const SESSAO_SOL = `import java.util.HashMap;
import java.util.Map;

public class Sessao {
    private int id;
    private String filme;
    private int sala;
    private String horario;
    private int capacidade;
    private int vendidos;

    public Sessao(int id, String filme, int sala, String horario, int capacidade, int vendidos) {
        this.id = id;
        this.filme = filme;
        this.sala = sala;
        this.horario = horario;
        this.capacidade = capacidade;
        this.vendidos = vendidos;
    }

    public int getId() { return id; }
    public String getFilme() { return filme; }
    public void vender(int quantidade) { vendidos += quantidade; }

    @Override
    public String toString() {
        return "<Sessao id=" + id + " filme=" + filme + ">";
    }

    public int disponiveis() {
        return capacidade - vendidos;
    }

    public boolean estaLotada() {
        return disponiveis() <= 0;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> m = new HashMap<>();
        m.put("id", id);
        m.put("filme", filme);
        m.put("sala", sala);
        m.put("horario", horario);
        m.put("disponiveis", disponiveis());
        m.put("lotada", estaLotada());
        return m;
    }
}
`;
  const BANCO_CINE = `import java.util.ArrayList;
import java.util.List;

/** Fonte de dados (mock). Alterações nos objetos retornados são "persistidas". */
public class Banco {
    private static final List<Sessao> sessoes = new ArrayList<>(List.of(
        new Sessao(1, "Duna: Parte Dois", 1, "14:00", 100, 100),
        new Sessao(2, "Duna: Parte Dois", 1, "19:30", 100, 97),
        new Sessao(3, "Divertida Mente 2", 2, "15:00", 80, 20),
        new Sessao(4, "Oppenheimer", 3, "21:00", 120, 60)
    ));

    public static List<Sessao> buscarSessoesBanco() {
        return sessoes;
    }
}
`;
  const CTRL_CINE_HEAD = `import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class SessaoController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "sessoes_cadastradas", Banco.buscarSessoesBanco().size());
    }
`;
  const CTRL_CINE_SOL = CTRL_CINE_HEAD + `
    private Sessao buscar(int id) {
        for (Sessao s : Banco.buscarSessoesBanco()) if (s.getId() == id) return s;
        return null;
    }

    private ResponseEntity<Map<String, Object>> erro(HttpStatus st, String msg) {
        Map<String, Object> m = new HashMap<>();
        m.put("erro", msg);
        return ResponseEntity.status(st).body(m);
    }

    // item e
    @GetMapping("/sessoes")
    public List<Map<String, Object>> listar(@RequestParam(required = false) String filme) {
        List<Map<String, Object>> r = new ArrayList<>();
        for (Sessao s : Banco.buscarSessoesBanco()) {
            if (s.estaLotada()) continue;
            if (filme != null && !s.getFilme().toLowerCase().contains(filme.toLowerCase())) continue;
            r.add(s.toMap());
        }
        return r;
    }

    // item f
    @GetMapping("/sessoes/{id}")
    public ResponseEntity<Map<String, Object>> porId(@PathVariable("id") int id) {
        Sessao s = buscar(id);
        if (s == null) return erro(HttpStatus.NOT_FOUND, "Sessão não encontrada");
        return ResponseEntity.ok(s.toMap());
    }

    // item g
    @PostMapping("/sessoes/{id}/ingressos")
    public ResponseEntity<Map<String, Object>> comprar(@PathVariable("id") int id, @RequestBody Map<String, Object> corpo) {
        Sessao s = buscar(id);
        if (s == null) return erro(HttpStatus.NOT_FOUND, "Sessão não encontrada");
        int qtd = ((Number) corpo.get("quantidade")).intValue();
        if (qtd <= 0) return erro(HttpStatus.BAD_REQUEST, "Quantidade inválida");
        if (qtd > s.disponiveis()) return erro(HttpStatus.BAD_REQUEST, "Lugares insuficientes");
        s.vender(qtd);
        return ResponseEntity.ok(s.toMap());
    }
}
`;
  const S = (id, f, sala, h, disp) => `{"disponiveis":${disp},"filme":"${f}","horario":"${h}","id":${id},"lotada":${disp <= 0},"sala":${sala}}`;
  PHASES.push({
    id: 'x02', track: 'simulado', icon: '🎬', level: 3, kind: 'spring',
    title: 'Simulado 2 — Cinema', subtitle: 'Sessões, lotação e venda de ingressos',
    cola: ['spring', 'poo', 'colecoes'],
    theory: [],
    exam: {
      duracao: 50,
      cenario: 'Uma rede de cinemas quer mostrar no site as sessões do dia e vender ingressos online. Implemente a **API REST** que o site vai consumir:\n- `GET /health` — saúde da API (**já implementado**)\n- `GET /sessoes` — sessões que **ainda têm lugares**, com filtro opcional por filme\n- `GET /sessoes/{id}` — dados de uma sessão\n- `POST /sessoes/{id}/ingressos` — compra de ingressos',
      classe: 'Sessao',
      attrs: [['id', 'int', 'Identificador da sessão', '2'], ['filme', 'String', 'Título do filme', '"Duna: Parte Dois"'], ['sala', 'int', 'Número da sala', '1'], ['horario', 'String', 'Horário de início', '"19:30"'], ['capacidade', 'int', 'Total de lugares da sala', '100'], ['vendidos', 'int', 'Ingressos já vendidos', '97']],
      obs: '',
      dados: 'Considere que `Banco.buscarSessoesBanco()` (arquivo `Banco.java`) já está implementado e que alterações nos objetos retornados são **automaticamente persistidas**.',
      itens: [
        { id: 'a', pts: 0.5, txt: 'Implemente o **construtor** da classe `Sessao` com os seis atributos.' },
        { id: 'b', pts: 1.0, txt: 'Implemente `toString()` no formato `<Sessao id=2 filme=Duna: Parte Dois>`.' },
        { id: 'c', pts: 1.0, txt: 'Implemente `int disponiveis()` (capacidade − vendidos) e `boolean estaLotada()` (`true` quando não houver lugares disponíveis).' },
        { id: 'd', pts: 1.0, txt: 'Implemente `Map<String, Object> toMap()` no formato:\n`{"id": 2, "filme": "Duna: Parte Dois", "sala": 1, "horario": "19:30", "disponiveis": 3, "lotada": false}`' },
        { id: 'e', pts: 2.0, txt: 'Implemente `GET /sessoes`: lista (formato do item d) das sessões **não lotadas**. Com o parâmetro **opcional** `?filme=`, retorna só as sessões cujo título **contém** o texto, ignorando maiúsculas/minúsculas.' },
        { id: 'f', pts: 2.0, txt: 'Implemente `GET /sessoes/{id}`: **200** com a sessão, ou **404** com `{"erro": "Sessão não encontrada"}`.' },
        { id: 'g', pts: 2.5, txt: 'Implemente `POST /sessoes/{id}/ingressos` com corpo `{"quantidade": N}`:\n- sessão inexistente → **404** `{"erro": "Sessão não encontrada"}`\n- N ≤ 0 → **400** `{"erro": "Quantidade inválida"}`\n- N maior que os lugares disponíveis → **400** `{"erro": "Lugares insuficientes"}`\n- senão, registra a venda e retorna a sessão atualizada com **200**.' },
      ],
      exemplo: `GET  /sessoes?filme=duna
→ 200 [{"id":2,"filme":"Duna: Parte Dois","sala":1,"horario":"19:30","disponiveis":3,"lotada":false}]

POST /sessoes/2/ingressos   corpo: {"quantidade": 3}
→ 200 {"id":2,"filme":"Duna: Parte Dois","sala":1,"horario":"19:30","disponiveis":0,"lotada":true}

POST /sessoes/4/ingressos   corpo: {"quantidade": 500}
→ 400 {"erro":"Lugares insuficientes"}`,
    },
    task: '',
    files: [
      { name: 'Sessao.java', code: SESSAO_START },
      { name: 'SessaoController.java', code: CTRL_CINE_HEAD + `
    // TODO: item e

    // TODO: item f

    // TODO: item g
}
` },
      { name: 'Banco.java', readonly: true, code: BANCO_CINE },
      APP('CinemaApplication'),
    ],
    requests: 'GET /sessoes\nGET /sessoes?filme=duna\nGET /sessoes/1\nPOST /sessoes/2/ingressos {"quantidade": 3}\nPOST /sessoes/4/ingressos {"quantidade": 500}\nGET /sessoes',
    hints: [],
    test: `
QT.test("[a] Construtor guarda os 6 atributos", () -> {
    Object s = QT.make("Sessao", 2, "Duna: Parte Dois", 1, "19:30", 100, 97);
    QT.eq(2, QT.field(s, "id")); QT.eq("Duna: Parte Dois", QT.field(s, "filme")); QT.eq(1, QT.field(s, "sala"));
    QT.eq("19:30", QT.field(s, "horario")); QT.eq(100, QT.field(s, "capacidade")); QT.eq(97, QT.field(s, "vendidos"));
});
QT.test("[b] toString()", () -> QT.eq("<Sessao id=2 filme=Duna: Parte Dois>", QT.make("Sessao", 2, "Duna: Parte Dois", 1, "19:30", 100, 97).toString()));
QT.test("[c] disponiveis() e estaLotada() com lugares", () -> {
    Object s = QT.make("Sessao", 2, "Duna: Parte Dois", 1, "19:30", 100, 97);
    QT.eq(3, QT.callM(s, "disponiveis")); QT.eq(false, QT.callM(s, "estaLotada"));
});
QT.test("[c] estaLotada() sem lugares", () -> QT.eq(true, QT.callM(QT.make("Sessao", 1, "X", 1, "14:00", 100, 100), "estaLotada")));
${toMapJson('[d] toMap()', 'QT.make("Sessao", 2, "Duna: Parte Dois", 1, "19:30", 100, 97)', S(2, 'Duna: Parte Dois', 1, '19:30', 3))}
${toMapJson('[d] toMap() de sessão lotada', 'QT.make("Sessao", 1, "Duna: Parte Dois", 1, "14:00", 100, 100)', S(1, 'Duna: Parte Dois', 1, '14:00', 0))}
${eqStatus('[e] GET /sessoes → só as não lotadas (2, 3, 4)', 'MiniSpring.get("/sessoes")', 200, '[' + S(2, 'Duna: Parte Dois', 1, '19:30', 3) + ',' + S(3, 'Divertida Mente 2', 2, '15:00', 60) + ',' + S(4, 'Oppenheimer', 3, '21:00', 60) + ']')}
${eqStatus('[e] GET /sessoes?filme=DUNA (ignora maiúsculas)', 'MiniSpring.get("/sessoes?filme=DUNA")', 200, '[' + S(2, 'Duna: Parte Dois', 1, '19:30', 3) + ']')}
${eqStatus('[e] GET /sessoes?filme=mente', 'MiniSpring.get("/sessoes?filme=mente")', 200, '[' + S(3, 'Divertida Mente 2', 2, '15:00', 60) + ']')}
${eqStatus('[f] GET /sessoes/1 (lotada também aparece aqui) → 200', 'MiniSpring.get("/sessoes/1")', 200, S(1, 'Duna: Parte Dois', 1, '14:00', 0))}
${eqStatus('[f] GET /sessoes/99 → 404', 'MiniSpring.get("/sessoes/99")', 404, '{"erro":"Sessão não encontrada"}')}
${eqStatus('[g] Comprar 5 na sessão 2 (só há 3) → 400', 'MiniSpring.postJson("/sessoes/2/ingressos", "{\\"quantidade\\": 5}")', 400, '{"erro":"Lugares insuficientes"}')}
${eqStatus('[g] Comprar 0 → 400', 'MiniSpring.postJson("/sessoes/3/ingressos", "{\\"quantidade\\": 0}")', 400, '{"erro":"Quantidade inválida"}')}
${eqStatus('[g] Comprar 3 na sessão 2 → 200 e lota', 'MiniSpring.postJson("/sessoes/2/ingressos", "{\\"quantidade\\": 3}")', 200, S(2, 'Duna: Parte Dois', 1, '19:30', 0))}
${eqStatus('[g] Sessão inexistente → 404', 'MiniSpring.postJson("/sessoes/99/ingressos", "{\\"quantidade\\": 1}")', 404, '{"erro":"Sessão não encontrada"}')}
QT.test("[g] A venda fica salva: sessão 2 sai de GET /sessoes", () -> QT.eq(java.util.List.of(3, 4), QT.pluck(MiniSpring.get("/sessoes").body, "get", "id")));`,
    solution: [
      { name: 'Sessao.java', code: SESSAO_SOL },
      { name: 'SessaoController.java', code: CTRL_CINE_SOL },
      { name: 'Banco.java', readonly: true, code: BANCO_CINE },
      APP('CinemaApplication'),
    ],
  });

  /* =================================================================
     SIMULADO 3 — ESTACIONAMENTO
     ================================================================= */
  const VEIC_START = `import java.util.HashMap;
import java.util.Map;

public class Veiculo {
    private String placa;
    private String modelo;
    private String tipo;
    private int entrada;   // minutos desde 00:00 (ex.: 08:05 = 485)

    public Veiculo(String placa, String modelo, String tipo, int entrada) {
        // TODO: item a
    }

    @Override
    public String toString() {
        return ""; // TODO: item b
    }

    public double calcularValor(int saida) {
        return 0; // TODO: item c
    }

    public Map<String, Object> toMap() {
        return null; // TODO: item d
    }
}
`;
  const VEIC_SOL = `import java.util.HashMap;
import java.util.Map;

public class Veiculo {
    private String placa;
    private String modelo;
    private String tipo;
    private int entrada;   // minutos desde 00:00 (ex.: 08:05 = 485)

    public Veiculo() { }   // usado pelo @RequestBody

    public Veiculo(String placa, String modelo, String tipo, int entrada) {
        this.placa = placa;
        this.modelo = modelo;
        this.tipo = tipo;
        this.entrada = entrada;
    }

    public String getPlaca() { return placa; }
    public String getTipo() { return tipo; }
    public int getEntrada() { return entrada; }

    @Override
    public String toString() {
        return "<Veiculo placa=" + placa + " tipo=" + tipo + ">";
    }

    public double calcularValor(int saida) {
        int minutos = saida - entrada;
        if (minutos <= 15) return 0.0;
        int horas = (int) Math.ceil(minutos / 60.0);
        double precoHora = tipo.equals("MOTO") ? 5.0 : 10.0;
        return horas * precoHora;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> m = new HashMap<>();
        m.put("placa", placa);
        m.put("modelo", modelo);
        m.put("tipo", tipo);
        m.put("entrada", String.format("%02d:%02d", entrada / 60, entrada % 60));
        return m;
    }
}
`;
  const BANCO_EST = `import java.util.ArrayList;
import java.util.List;

/** Fonte de dados (mock). Alterações na lista retornada são "persistidas". */
public class Banco {
    private static final List<Veiculo> veiculos = new ArrayList<>(List.of(
        new Veiculo("ABC1D23", "Onix", "CARRO", 480),
        new Veiculo("BRA2E19", "CG 160", "MOTO", 510),
        new Veiculo("RIO4F56", "HB20", "CARRO", 555)
    ));

    public static List<Veiculo> buscarVeiculosBanco() {
        return veiculos;
    }
}
`;
  const CTRL_EST_HEAD = `import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class EstacionamentoController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "veiculos_no_patio", Banco.buscarVeiculosBanco().size());
    }
`;
  const CTRL_EST_SOL = CTRL_EST_HEAD + `
    private Veiculo buscar(String placa) {
        for (Veiculo v : Banco.buscarVeiculosBanco()) if (v.getPlaca().equals(placa)) return v;
        return null;
    }

    private ResponseEntity<Map<String, Object>> erro(HttpStatus st, String msg) {
        Map<String, Object> m = new HashMap<>();
        m.put("erro", msg);
        return ResponseEntity.status(st).body(m);
    }

    // item e
    @GetMapping("/veiculos")
    public List<Map<String, Object>> listar(@RequestParam(required = false) String tipo) {
        List<Map<String, Object>> r = new ArrayList<>();
        for (Veiculo v : Banco.buscarVeiculosBanco()) {
            if (tipo == null || v.getTipo().equals(tipo)) r.add(v.toMap());
        }
        return r;
    }

    // item f
    @PostMapping("/veiculos")
    public ResponseEntity<Map<String, Object>> entrar(@RequestBody Veiculo novo) {
        if (!"CARRO".equals(novo.getTipo()) && !"MOTO".equals(novo.getTipo())) return erro(HttpStatus.BAD_REQUEST, "Tipo inválido");
        if (buscar(novo.getPlaca()) != null) return erro(HttpStatus.CONFLICT, "Veículo já está no estacionamento");
        Banco.buscarVeiculosBanco().add(novo);
        return ResponseEntity.status(HttpStatus.CREATED).body(novo.toMap());
    }

    // item g
    @DeleteMapping("/veiculos/{placa}")
    public ResponseEntity<Map<String, Object>> sair(@PathVariable("placa") String placa, @RequestParam int saida) {
        Veiculo v = buscar(placa);
        if (v == null) return erro(HttpStatus.NOT_FOUND, "Veículo não encontrado");
        Banco.buscarVeiculosBanco().remove(v);
        Map<String, Object> m = new HashMap<>();
        m.put("placa", placa);
        m.put("permanencia", saida - v.getEntrada());
        m.put("valor", v.calcularValor(saida));
        return ResponseEntity.ok(m);
    }
}
`;
  const VH = (p, m, t, e) => `{"entrada":"${e}","modelo":"${m}","placa":"${p}","tipo":"${t}"}`;
  PHASES.push({
    id: 'x03', track: 'simulado', icon: '🅿️', level: 4, kind: 'spring',
    title: 'Simulado 3 — Estacionamento', subtitle: 'Entrada, saída e cobrança por hora',
    cola: ['spring', 'poo', 'string'],
    theory: [],
    exam: {
      duracao: 50,
      cenario: 'Um estacionamento quer controlar os veículos no pátio e calcular automaticamente o valor a pagar na saída. Implemente a **API REST** do sistema:\n- `GET /health` — saúde da API (**já implementado**)\n- `GET /veiculos` — veículos no pátio (filtro opcional por tipo)\n- `POST /veiculos` — registra a entrada de um veículo\n- `DELETE /veiculos/{placa}?saida=HHMM` — registra a saída e calcula o valor\n\n**Tabela de preços:** `CARRO` R$ 10,00 por hora; `MOTO` R$ 5,00 por hora. Fração de hora conta como hora cheia. Até **15 minutos** de permanência é grátis.',
      classe: 'Veiculo',
      attrs: [['placa', 'String', 'Placa do veículo', '"ABC1D23"'], ['modelo', 'String', 'Modelo', '"Onix"'], ['tipo', 'String', '"CARRO" ou "MOTO"', '"CARRO"'], ['entrada', 'int', 'Horário de entrada em minutos desde 00:00', '480 (08:00)']],
      obs: 'Horários são guardados em **minutos desde a meia-noite**: 08:05 = 8 × 60 + 5 = 485.',
      dados: 'Considere que `Banco.buscarVeiculosBanco()` (arquivo `Banco.java`) já está implementado e retorna uma lista **mutável**: adicionar ou remover dela é **automaticamente persistido**.',
      itens: [
        { id: 'a', pts: 0.5, txt: 'Implemente o **construtor** da classe `Veiculo` com os quatro atributos.' },
        { id: 'b', pts: 1.0, txt: 'Implemente `toString()` no formato `<Veiculo placa=ABC1D23 tipo=CARRO>`.' },
        { id: 'c', pts: 1.5, txt: 'Implemente `double calcularValor(int saida)` seguindo a tabela de preços (até 15 min = 0; fração de hora = hora cheia). Ex.: carro das 08:00 às 10:10 (130 min) → 3 h → `30.0`.' },
        { id: 'd', pts: 1.0, txt: 'Implemente `Map<String, Object> toMap()`, com a entrada formatada como `HH:MM`:\n`{"placa": "ABC1D23", "modelo": "Onix", "tipo": "CARRO", "entrada": "08:00"}`' },
        { id: 'e', pts: 1.5, txt: 'Implemente `GET /veiculos`: lista (formato do item d) dos veículos no pátio. Com o parâmetro **opcional** `?tipo=MOTO` (ou `CARRO`), filtra pelo tipo.' },
        { id: 'f', pts: 2.0, txt: 'Implemente `POST /veiculos` com corpo JSON `{"placa": ..., "modelo": ..., "tipo": ..., "entrada": 540}`:\n- tipo diferente de `CARRO`/`MOTO` → **400** `{"erro": "Tipo inválido"}`\n- placa já no pátio → **409** `{"erro": "Veículo já está no estacionamento"}`\n- senão, adiciona e retorna o veículo (item d) com **201**.\n(Receba o corpo com `@RequestBody Veiculo` — a classe precisa de um construtor vazio — ou com `@RequestBody Map<String, Object>`.)' },
        { id: 'g', pts: 2.5, txt: 'Implemente `DELETE /veiculos/{placa}?saida=MINUTOS`: se a placa não estiver no pátio → **404** `{"erro": "Veículo não encontrado"}`. Senão, remove o veículo e retorna **200** com `{"placa": ..., "permanencia": minutos, "valor": valor}`.' },
      ],
      exemplo: `GET    /veiculos?tipo=MOTO
→ 200 [{"placa":"BRA2E19","modelo":"CG 160","tipo":"MOTO","entrada":"08:30"}]

POST   /veiculos   corpo: {"placa":"XYZ9A87","modelo":"Fan 160","tipo":"MOTO","entrada":545}
→ 201 {"placa":"XYZ9A87","modelo":"Fan 160","tipo":"MOTO","entrada":"09:05"}

DELETE /veiculos/ABC1D23?saida=610
→ 200 {"placa":"ABC1D23","permanencia":130,"valor":30.0}`,
    },
    task: '',
    files: [
      { name: 'Veiculo.java', code: VEIC_START },
      { name: 'EstacionamentoController.java', code: CTRL_EST_HEAD + `
    // TODO: item e

    // TODO: item f

    // TODO: item g
}
` },
      { name: 'Banco.java', readonly: true, code: BANCO_EST },
      APP('EstacionamentoApplication'),
    ],
    requests: 'GET /veiculos\nGET /veiculos?tipo=MOTO\nPOST /veiculos {"placa":"XYZ9A87","modelo":"Fan 160","tipo":"MOTO","entrada":545}\nPOST /veiculos {"placa":"ABC1D23","modelo":"Onix","tipo":"CARRO","entrada":600}\nDELETE /veiculos/ABC1D23?saida=610\nDELETE /veiculos/ABC1D23?saida=700',
    hints: [],
    test: `
QT.test("[a] Construtor guarda os 4 atributos", () -> {
    Object v = QT.make("Veiculo", "ABC1D23", "Onix", "CARRO", 480);
    QT.eq("ABC1D23", QT.field(v, "placa")); QT.eq("Onix", QT.field(v, "modelo")); QT.eq("CARRO", QT.field(v, "tipo")); QT.eq(480, QT.field(v, "entrada"));
});
QT.test("[b] toString()", () -> QT.eq("<Veiculo placa=BRA2E19 tipo=MOTO>", QT.make("Veiculo", "BRA2E19", "CG 160", "MOTO", 510).toString()));
QT.test("[c] Carro 2h exatas (480 → 600) → 20.0", () -> QT.eq(20.0, QT.callM(QT.make("Veiculo", "A", "X", "CARRO", 480), "calcularValor", 600)));
QT.test("[c] Carro 130 min → 3 h → 30.0", () -> QT.eq(30.0, QT.callM(QT.make("Veiculo", "A", "X", "CARRO", 480), "calcularValor", 610)));
QT.test("[c] Moto 90 min → 2 h → 10.0", () -> QT.eq(10.0, QT.callM(QT.make("Veiculo", "B", "X", "MOTO", 510), "calcularValor", 600)));
QT.test("[c] Até 15 min é grátis; 16 min já cobra 1 h", () -> {
    QT.eq(0.0, QT.callM(QT.make("Veiculo", "B", "X", "MOTO", 510), "calcularValor", 525));
    QT.eq(10.0, QT.callM(QT.make("Veiculo", "A", "X", "CARRO", 480), "calcularValor", 496));
});
${toMapJson('[d] toMap() com entrada 08:00', 'QT.make("Veiculo", "ABC1D23", "Onix", "CARRO", 480)', VH('ABC1D23', 'Onix', 'CARRO', '08:00'))}
${toMapJson('[d] toMap() com entrada 09:05 (zero à esquerda)', 'QT.make("Veiculo", "XYZ9A87", "Fan 160", "MOTO", 545)', VH('XYZ9A87', 'Fan 160', 'MOTO', '09:05'))}
${eqStatus('[e] GET /veiculos → os 3 do pátio', 'MiniSpring.get("/veiculos")', 200, '[' + VH('ABC1D23', 'Onix', 'CARRO', '08:00') + ',' + VH('BRA2E19', 'CG 160', 'MOTO', '08:30') + ',' + VH('RIO4F56', 'HB20', 'CARRO', '09:15') + ']')}
${eqStatus('[e] GET /veiculos?tipo=MOTO', 'MiniSpring.get("/veiculos?tipo=MOTO")', 200, '[' + VH('BRA2E19', 'CG 160', 'MOTO', '08:30') + ']')}
${eqStatus('[f] POST tipo inválido → 400', 'MiniSpring.postJson("/veiculos", "{\\"placa\\":\\"AAA0A00\\",\\"modelo\\":\\"Kombi\\",\\"tipo\\":\\"VAN\\",\\"entrada\\":600}")', 400, '{"erro":"Tipo inválido"}')}
${eqStatus('[f] POST placa repetida → 409', 'MiniSpring.postJson("/veiculos", "{\\"placa\\":\\"ABC1D23\\",\\"modelo\\":\\"Onix\\",\\"tipo\\":\\"CARRO\\",\\"entrada\\":600}")', 409, '{"erro":"Veículo já está no estacionamento"}')}
${eqStatus('[f] POST válido → 201', 'MiniSpring.postJson("/veiculos", "{\\"placa\\":\\"XYZ9A87\\",\\"modelo\\":\\"Fan 160\\",\\"tipo\\":\\"MOTO\\",\\"entrada\\":545}")', 201, VH('XYZ9A87', 'Fan 160', 'MOTO', '09:05'))}
QT.test("[f] O veículo novo aparece em GET /veiculos?tipo=MOTO", () -> QT.isTrue(MiniSpring.get("/veiculos?tipo=MOTO").json.contains("XYZ9A87"), "O veículo cadastrado não apareceu na lista"));
${eqStatus('[g] DELETE /veiculos/ABC1D23?saida=610 → 200', 'MiniSpring.delete("/veiculos/ABC1D23?saida=610")', 200, '{"permanencia":130,"placa":"ABC1D23","valor":30.0}')}
${eqStatus('[g] Sair de novo → 404', 'MiniSpring.delete("/veiculos/ABC1D23?saida=700")', 404, '{"erro":"Veículo não encontrado"}')}
${eqStatus('[g] Moto que ficou 10 min não paga', 'MiniSpring.delete("/veiculos/BRA2E19?saida=520")', 200, '{"permanencia":10,"placa":"BRA2E19","valor":0.0}')}
QT.test("[g] Os que saíram somem do pátio", () -> QT.eq(java.util.List.of("RIO4F56", "XYZ9A87"), QT.pluck(MiniSpring.get("/veiculos").body, "get", "placa")));`,
    solution: [
      { name: 'Veiculo.java', code: VEIC_SOL },
      { name: 'EstacionamentoController.java', code: CTRL_EST_SOL },
      { name: 'Banco.java', readonly: true, code: BANCO_EST },
      APP('EstacionamentoApplication'),
    ],
  });

  /* =================================================================
     SIMULADO 4 — CONTROLE DE NOTAS (Java puro, sem Spring)
     ================================================================= */
  const ALUNO_START = `import java.util.ArrayList;
import java.util.List;

public class Aluno {
    private String matricula;
    private String nome;
    private List<Double> notas;

    public Aluno(String matricula, String nome) {
        // TODO: item a
    }

    public String getMatricula() { return matricula; }
    public String getNome() { return nome; }
    public List<Double> getNotas() { return notas; }

    @Override
    public String toString() {
        return ""; // TODO: item b
    }

    public void adicionarNota(double nota) {
        // TODO: item c
    }

    public double media() {
        return 0; // TODO: item c
    }

    public String situacao() {
        return ""; // TODO: item d
    }
}
`;
  const ALUNO_SOL = `import java.util.ArrayList;
import java.util.List;

public class Aluno {
    private String matricula;
    private String nome;
    private List<Double> notas;

    public Aluno(String matricula, String nome) {
        this.matricula = matricula;
        this.nome = nome;
        this.notas = new ArrayList<>();
    }

    public String getMatricula() { return matricula; }
    public String getNome() { return nome; }
    public List<Double> getNotas() { return notas; }

    @Override
    public String toString() {
        return "<Aluno matricula=" + matricula + " nome=" + nome + ">";
    }

    public void adicionarNota(double nota) {
        if (nota < 0 || nota > 10) throw new IllegalArgumentException("Nota inválida: " + nota);
        notas.add(nota);
    }

    public double media() {
        if (notas.isEmpty()) return 0;
        double soma = 0;
        for (double n : notas) soma += n;
        return soma / notas.size();
    }

    public String situacao() {
        if (notas.isEmpty()) return "SEM NOTAS";
        double m = media();
        if (m >= 7) return "APROVADO";
        if (m >= 5) return "RECUPERACAO";
        return "REPROVADO";
    }
}
`;
  const TURMA_START = `import java.util.*;

public class Turma {
    private Map<String, Aluno> alunos = new LinkedHashMap<>();   // matrícula -> aluno

    public boolean adicionar(Aluno aluno) {
        return false; // TODO: item e
    }

    public Aluno buscar(String matricula) {
        return null; // TODO: item e
    }

    public int total() {
        return 0; // TODO: item e
    }

    public List<Aluno> aprovados() {
        return null; // TODO: item f
    }

    public double mediaGeral() {
        return 0; // TODO: item f
    }

    public Map<String, Integer> relatorio() {
        return null; // TODO: item g
    }

    public List<Aluno> ranking(int n) {
        return null; // TODO: item g
    }
}
`;
  const TURMA_SOL = `import java.util.*;

public class Turma {
    private Map<String, Aluno> alunos = new LinkedHashMap<>();   // matrícula -> aluno

    public boolean adicionar(Aluno aluno) {
        if (alunos.containsKey(aluno.getMatricula())) return false;
        alunos.put(aluno.getMatricula(), aluno);
        return true;
    }

    public Aluno buscar(String matricula) {
        return alunos.get(matricula);
    }

    public int total() {
        return alunos.size();
    }

    public List<Aluno> aprovados() {
        List<Aluno> r = new ArrayList<>();
        for (Aluno a : alunos.values()) if (a.situacao().equals("APROVADO")) r.add(a);
        r.sort(Comparator.comparing(Aluno::getNome));
        return r;
    }

    public double mediaGeral() {
        double soma = 0;
        int qtd = 0;
        for (Aluno a : alunos.values()) {
            if (!a.getNotas().isEmpty()) { soma += a.media(); qtd++; }
        }
        return qtd == 0 ? 0 : soma / qtd;
    }

    public Map<String, Integer> relatorio() {
        Map<String, Integer> r = new TreeMap<>();
        for (Aluno a : alunos.values()) r.put(a.situacao(), r.getOrDefault(a.situacao(), 0) + 1);
        return r;
    }

    public List<Aluno> ranking(int n) {
        List<Aluno> r = new ArrayList<>();
        for (Aluno a : alunos.values()) if (!a.getNotas().isEmpty()) r.add(a);
        r.sort((x, y) -> Double.compare(y.media(), x.media()));
        return r.subList(0, Math.min(n, r.size()));
    }
}
`;
  const MAIN_NOTAS = `public class Main {
    public static void main(String[] args) {
        Turma t = new Turma();
        Aluno ana = new Aluno("2025001", "Ana");
        ana.adicionarNota(9.0);
        ana.adicionarNota(8.0);
        t.adicionar(ana);

        Aluno bruno = new Aluno("2025002", "Bruno");
        bruno.adicionarNota(5.0);
        bruno.adicionarNota(6.0);
        t.adicionar(bruno);

        System.out.println(ana + " -> " + ana.media() + " " + ana.situacao());
        System.out.println("Aprovados: " + t.aprovados());
        System.out.println("Relatório: " + t.relatorio());
        System.out.println("Ranking: " + t.ranking(2));
    }
}
`;
  const TURMA_SETUP = `Object t = QT.make("Turma");
    Object ana = QT.make("Aluno", "2025001", "Ana"); QT.callM(ana, "adicionarNota", 9.0); QT.callM(ana, "adicionarNota", 8.0);
    Object bruno = QT.make("Aluno", "2025002", "Bruno"); QT.callM(bruno, "adicionarNota", 5.0); QT.callM(bruno, "adicionarNota", 6.0);
    Object carla = QT.make("Aluno", "2025003", "Carla"); QT.callM(carla, "adicionarNota", 7.0); QT.callM(carla, "adicionarNota", 10.0);
    Object davi = QT.make("Aluno", "2025004", "Davi"); QT.callM(davi, "adicionarNota", 2.0);
    Object elisa = QT.make("Aluno", "2025005", "Elisa");
    for (Object a : new Object[]{davi, carla, ana, bruno, elisa}) QT.callM(t, "adicionar", a);`;
  PHASES.push({
    id: 'x04', track: 'simulado', icon: '📒', level: 3, kind: 'java',
    title: 'Simulado 4 — Controle de Notas', subtitle: 'Java puro: classes, coleções e regras de negócio',
    cola: ['poo', 'colecoes', 'heranca'],
    theory: [],
    exam: {
      duracao: 50,
      cenario: 'A coordenação do curso precisa de um módulo em **Java (sem Spring)** para controlar as notas das turmas. Você vai implementar duas classes: `Aluno`, que guarda as notas de um aluno, e `Turma`, que reúne os alunos e gera relatórios.\n\nO arquivo `Main.java` mostra um exemplo de uso; ele não vale nota.',
      classe: 'Aluno',
      attrs: [['matricula', 'String', 'Matrícula do aluno', '"2025001"'], ['nome', 'String', 'Nome do aluno', '"Ana"'], ['notas', 'List<Double>', 'Notas lançadas (começa vazia)', '[9.0, 8.0]']],
      obs: 'Situação pela média: **≥ 7** `APROVADO`; **≥ 5** `RECUPERACAO`; abaixo disso `REPROVADO`; sem notas: `SEM NOTAS`.',
      dados: 'A `Turma` guarda os alunos num `Map<String, Aluno>` (matrícula → aluno), já declarado.',
      itens: [
        { id: 'a', pts: 0.5, txt: 'Implemente o **construtor** de `Aluno` (a lista de notas começa **vazia**).' },
        { id: 'b', pts: 1.0, txt: 'Implemente `toString()` de `Aluno` no formato `<Aluno matricula=2025001 nome=Ana>`.' },
        { id: 'c', pts: 1.0, txt: 'Implemente `adicionarNota(double)` (nota fora de 0 a 10 → lança `IllegalArgumentException`) e `double media()` (0 se não houver notas).' },
        { id: 'd', pts: 1.0, txt: 'Implemente `String situacao()` conforme a regra acima.' },
        { id: 'e', pts: 2.0, txt: 'Em `Turma`, implemente `boolean adicionar(Aluno)` (matrícula repetida → não adiciona e retorna `false`), `Aluno buscar(String matricula)` (`null` se não existir) e `int total()`.' },
        { id: 'f', pts: 2.0, txt: 'Implemente `List<Aluno> aprovados()` (em **ordem alfabética** de nome) e `double mediaGeral()` (média das médias dos alunos **que têm notas**; 0 se nenhum).' },
        { id: 'g', pts: 2.5, txt: 'Implemente `Map<String, Integer> relatorio()` (quantos alunos em cada situação, ex.: `{APROVADO=2, RECUPERACAO=1, ...}`) e `List<Aluno> ranking(int n)` (os `n` alunos com notas de **maior média**, em ordem decrescente).' },
      ],
      exemplo: `Aluno ana = new Aluno("2025001", "Ana");
ana.adicionarNota(9.0);
ana.adicionarNota(8.0);
ana.toString()   →  "<Aluno matricula=2025001 nome=Ana>"
ana.media()      →  8.5
ana.situacao()   →  "APROVADO"
ana.adicionarNota(11)  →  IllegalArgumentException`,
    },
    task: '',
    files: [
      { name: 'Aluno.java', code: ALUNO_START },
      { name: 'Turma.java', code: TURMA_START },
      { name: 'Main.java', code: MAIN_NOTAS },
    ],
    run: { main: 'Main', stdin: '' },
    hints: [],
    test: `
QT.test("[a] Construtor e lista de notas vazia", () -> {
    Object a = QT.make("Aluno", "2025001", "Ana");
    QT.eq("2025001", QT.field(a, "matricula")); QT.eq("Ana", QT.field(a, "nome"));
    Object notas = QT.field(a, "notas");
    QT.isTrue(notas != null, "A lista de notas não foi criada (está null)");
    QT.eq(0, ((java.util.List<?>) notas).size());
});
QT.test("[b] toString()", () -> QT.eq("<Aluno matricula=2025001 nome=Ana>", QT.make("Aluno", "2025001", "Ana").toString()));
QT.test("[c] adicionarNota e media", () -> {
    Object a = QT.make("Aluno", "1", "Ana");
    QT.callM(a, "adicionarNota", 9.0); QT.callM(a, "adicionarNota", 8.0);
    QT.eq(8.5, QT.callM(a, "media"));
});
QT.test("[c] media sem notas → 0", () -> QT.eq(0.0, QT.callM(QT.make("Aluno", "1", "Ana"), "media")));
QT.test("[c] Nota fora de 0..10 → IllegalArgumentException", () -> {
    Object a = QT.make("Aluno", "1", "Ana");
    QT.expectThrows("IllegalArgumentException", () -> QT.callM(a, "adicionarNota", 11.0));
    QT.expectThrows("IllegalArgumentException", () -> QT.callM(a, "adicionarNota", -1.0));
    QT.eq(0, ((java.util.List<?>) QT.field(a, "notas")).size());
});
QT.test("[d] situacao() nas 4 faixas", () -> {
    Object a = QT.make("Aluno", "1", "A"); QT.eq("SEM NOTAS", QT.callM(a, "situacao"));
    QT.callM(a, "adicionarNota", 7.0); QT.eq("APROVADO", QT.callM(a, "situacao"));
    Object b = QT.make("Aluno", "2", "B"); QT.callM(b, "adicionarNota", 5.0); QT.eq("RECUPERACAO", QT.callM(b, "situacao"));
    Object c = QT.make("Aluno", "3", "C"); QT.callM(c, "adicionarNota", 4.9); QT.eq("REPROVADO", QT.callM(c, "situacao"));
});
QT.test("[e] adicionar, buscar e total", () -> {
    ${TURMA_SETUP}
    QT.eq(5, QT.callM(t, "total"));
    QT.eq("Carla", QT.callM(QT.callM(t, "buscar", "2025003"), "getNome"));
    QT.eq(null, QT.callM(t, "buscar", "9999999"));
});
QT.test("[e] Matrícula repetida não entra", () -> {
    Object t = QT.make("Turma");
    QT.eq(true, QT.callM(t, "adicionar", QT.make("Aluno", "1", "Ana")));
    QT.eq(false, QT.callM(t, "adicionar", QT.make("Aluno", "1", "Outra Ana")));
    QT.eq(1, QT.callM(t, "total"));
    QT.eq("Ana", QT.callM(QT.callM(t, "buscar", "1"), "getNome"));
});
QT.test("[f] aprovados() em ordem alfabética", () -> {
    ${TURMA_SETUP}
    QT.eq(java.util.List.of("Ana", "Carla"), QT.pluck(QT.callM(t, "aprovados"), "getNome"));
});
QT.test("[f] mediaGeral() ignora quem não tem notas", () -> {
    ${TURMA_SETUP}
    QT.eq((8.5 + 5.5 + 8.5 + 2.0) / 4, QT.callM(t, "mediaGeral"));
    QT.eq(0.0, QT.callM(QT.make("Turma"), "mediaGeral"));
});
QT.test("[g] relatorio()", () -> {
    ${TURMA_SETUP}
    QT.eq("{APROVADO=2, RECUPERACAO=1, REPROVADO=1, SEM NOTAS=1}", String.valueOf(new java.util.TreeMap<>((java.util.Map<?, ?>) QT.callM(t, "relatorio"))));
});
QT.test("[g] ranking(3) por maior média", () -> {
    ${TURMA_SETUP}
    java.util.List<Object> nomes = QT.pluck(QT.callM(t, "ranking", 3), "getNome");
    QT.eq(3, nomes.size());
    QT.isTrue(nomes.subList(0, 2).containsAll(java.util.List.of("Ana", "Carla")), "Os dois primeiros deveriam ser Ana e Carla (média 8.5). Obtido: " + nomes);
    QT.eq("Bruno", nomes.get(2));
});
QT.test("[g] ranking(n) maior que a turma não quebra e ignora sem notas", () -> {
    ${TURMA_SETUP}
    QT.eq(4, QT.pluck(QT.callM(t, "ranking", 10), "getNome").size());
});`,
    solution: [
      { name: 'Aluno.java', code: ALUNO_SOL },
      { name: 'Turma.java', code: TURMA_SOL },
      { name: 'Main.java', code: MAIN_NOTAS },
    ],
  });
})();
