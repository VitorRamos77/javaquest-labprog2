/* =========================================================
   TRILHA 2 (extra) — @RestController a fundo
   s05 CRUD com todos os métodos HTTP
   s06 @RequestParam opcional (required=false, defaultValue)
   s07 Rotas aninhadas com várias @PathVariable
   s08 ResponseEntity e códigos de status HTTP
   s09 @RequestBody com JSON
   s10 Desafio: encurtador de links
   ========================================================= */
window.PHASES = window.PHASES || [];

(function () {
  // helpers para montar os testes em Java -------------------------------
  const J = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');          // texto -> literal Java
  const N = (s) => s.replace(/"/g, '\\"');                                   // nome de teste
  const eqJson = (name, call, expected) => `QT.test("${N(name)}", () -> QT.eq("${J(expected)}", ${call}.json));`;
  const eqStatus = (name, call, status, expected) => expected === undefined
    ? `QT.test("${N(name)}", () -> { MiniSpring.Response r = ${call}; QT.eq(${status}, r.status); });`
    : `QT.test("${N(name)}", () -> { MiniSpring.Response r = ${call}; QT.eq(${status}, r.status); QT.eq("${J(expected)}", r.json); });`;
  const P = (...kv) => 'MiniSpring.params(' + kv.map((x) => '"' + J(String(x)) + '"').join(', ') + ')';

  const APP = (name) => ({ name: name + '.java', readonly: true, code: `import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${name} {
    public static void main(String[] args) {
        SpringApplication.run(${name}.class, args);
    }
}
` });

  /* ============================================================ s05 */
  const TAREFA = `public class Tarefa {
    private Integer id;
    private String titulo;
    private boolean concluida;

    public Tarefa(Integer id, String titulo) {
        this.id = id;
        this.titulo = titulo;
    }

    public Integer getId() { return id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public boolean isConcluida() { return concluida; }
    public void setConcluida(boolean concluida) { this.concluida = concluida; }
}
`;
  const T = (id, titulo, c) => `{"concluida":${c},"id":${id},"titulo":"${titulo}"}`;
  PHASES.push({
    id: 's05', track: 'web', icon: '✅', level: 3, kind: 'spring',
    title: 'CRUD de Tarefas', subtitle: 'GET, POST, PUT, PATCH e DELETE no mesmo @RestController',
    cola: ['spring', 'http'],
    theory: [
      '`@RequestMapping("/tarefas")` na classe define o prefixo; cada método usa `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping` ou `@DeleteMapping`.',
      'A **mesma URL** pode ter métodos HTTP diferentes: `GET /tarefas/1` lê, `PUT /tarefas/1` substitui, `DELETE /tarefas/1` apaga.',
      '**PUT** atualiza o recurso inteiro; **PATCH** altera só uma parte (aqui: marcar como concluída).',
      'Um contador (`proximoId`) gera ids crescentes para os novos objetos.',
    ],
    task: 'No `TarefaController` (prefixo `/tarefas`), guarde as tarefas num `ArrayList` e implemente:\n- `GET /tarefas` → todas\n- `GET /tarefas/{id}` → a tarefa, ou `null`\n- `POST /tarefas` (param `titulo`) → cria com id 1, 2, 3… e retorna a nova tarefa\n- `PUT /tarefas/{id}` (params `titulo` e `concluida`) → atualiza e retorna, ou `null`\n- `PATCH /tarefas/{id}/concluir` → marca como concluída e retorna, ou `null`\n- `DELETE /tarefas/{id}` → `true` se apagou, `false` se não existia',
    files: [
      { name: 'TarefaController.java', code: `import java.util.ArrayList;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tarefas")
public class TarefaController {
    private ArrayList<Tarefa> tarefas = new ArrayList<>();
    private int proximoId = 1;

    // GET /tarefas

    // GET /tarefas/{id}

    // POST /tarefas

    // PUT /tarefas/{id}

    // PATCH /tarefas/{id}/concluir

    // DELETE /tarefas/{id}
}
` },
      { name: 'Tarefa.java', readonly: true, code: TAREFA },
      APP('TarefasApplication'),
    ],
    requests: 'POST /tarefas titulo=Estudar Spring\nPOST /tarefas titulo=Fazer a lista\nGET /tarefas\nPATCH /tarefas/1/concluir\nPUT /tarefas/2 titulo=Fazer a lista de Java&concluida=false\nDELETE /tarefas/2\nGET /tarefas',
    hints: [
      'Crie um método auxiliar `private Tarefa buscar(Integer id)` que percorre a lista e devolve a tarefa (ou `null`).',
      '`@PostMapping public Tarefa criar(@RequestParam String titulo) { Tarefa t = new Tarefa(proximoId++, titulo); tarefas.add(t); return t; }`',
      '`@PatchMapping("/{id}/concluir")` e `@DeleteMapping("/{id}")` com `@PathVariable("id") Integer id`. Para apagar: `tarefas.remove(t)`.',
    ],
    test: `
${eqJson('POST /tarefas cria a tarefa 1', `MiniSpring.post("/tarefas", ${P('titulo', 'Estudar Spring')})`, T(1, 'Estudar Spring', false))}
${eqJson('POST /tarefas cria a tarefa 2', `MiniSpring.post("/tarefas", ${P('titulo', 'Fazer a lista')})`, T(2, 'Fazer a lista', false))}
${eqJson('GET /tarefas lista as duas', 'MiniSpring.get("/tarefas")', '[' + T(1, 'Estudar Spring', false) + ',' + T(2, 'Fazer a lista', false) + ']')}
${eqJson('GET /tarefas/2', 'MiniSpring.get("/tarefas/2")', T(2, 'Fazer a lista', false))}
${eqJson('GET /tarefas/99 → null', 'MiniSpring.get("/tarefas/99")', 'null')}
${eqJson('PATCH /tarefas/1/concluir', 'MiniSpring.patch("/tarefas/1/concluir")', T(1, 'Estudar Spring', true))}
${eqJson('PUT /tarefas/2 atualiza título e status', `MiniSpring.put("/tarefas/2", ${P('titulo', 'Lista de Java', 'concluida', 'true')})`, T(2, 'Lista de Java', true))}
${eqJson('PUT /tarefas/99 → null', `MiniSpring.put("/tarefas/99", ${P('titulo', 'X', 'concluida', 'false')})`, 'null')}
QT.test("DELETE /tarefas/2 → true, de novo → false", () -> {
    QT.eq(true, MiniSpring.delete("/tarefas/2").body);
    QT.eq(false, MiniSpring.delete("/tarefas/2").body);
});
${eqJson('Depois de apagar, sobra só a tarefa 1', 'MiniSpring.get("/tarefas")', '[' + T(1, 'Estudar Spring', true) + ']')}
${eqJson('Ids não se repetem depois de apagar (próxima é 3)', `MiniSpring.post("/tarefas", ${P('titulo', 'Nova')})`, T(3, 'Nova', false))}`,
    solution: [
      { name: 'TarefaController.java', code: `import java.util.ArrayList;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tarefas")
public class TarefaController {
    private ArrayList<Tarefa> tarefas = new ArrayList<>();
    private int proximoId = 1;

    private Tarefa buscar(Integer id) {
        for (Tarefa t : tarefas) {
            if (t.getId().equals(id)) return t;
        }
        return null;
    }

    @GetMapping
    public ArrayList<Tarefa> listar() {
        return tarefas;
    }

    @GetMapping("/{id}")
    public Tarefa porId(@PathVariable("id") Integer id) {
        return buscar(id);
    }

    @PostMapping
    public Tarefa criar(@RequestParam String titulo) {
        Tarefa t = new Tarefa(proximoId++, titulo);
        tarefas.add(t);
        return t;
    }

    @PutMapping("/{id}")
    public Tarefa atualizar(@PathVariable("id") Integer id, @RequestParam String titulo, @RequestParam boolean concluida) {
        Tarefa t = buscar(id);
        if (t == null) return null;
        t.setTitulo(titulo);
        t.setConcluida(concluida);
        return t;
    }

    @PatchMapping("/{id}/concluir")
    public Tarefa concluir(@PathVariable("id") Integer id) {
        Tarefa t = buscar(id);
        if (t != null) t.setConcluida(true);
        return t;
    }

    @DeleteMapping("/{id}")
    public boolean apagar(@PathVariable("id") Integer id) {
        Tarefa t = buscar(id);
        if (t == null) return false;
        tarefas.remove(t);
        return true;
    }
}
` },
      { name: 'Tarefa.java', readonly: true, code: TAREFA },
      APP('TarefasApplication'),
    ],
  });

  /* ============================================================ s06 */
  const PRODUTO = `public class Produto {
    private Integer id;
    private String nome;
    private String categoria;
    private double preco;

    public Produto(Integer id, String nome, String categoria, double preco) {
        this.id = id;
        this.nome = nome;
        this.categoria = categoria;
        this.preco = preco;
    }

    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public String getCategoria() { return categoria; }
    public double getPreco() { return preco; }
}
`;
  const nomes = (url, list) => `QT.test("${N('GET ' + url + ' → ' + list.join(', '))}", () -> QT.eq(java.util.List.of(${list.map((x) => '"' + x + '"').join(', ')}), QT.pluck(MiniSpring.get("${J(url)}").body, "getNome")));`;
  PHASES.push({
    id: 's06', track: 'web', icon: '🔎', level: 3, kind: 'spring',
    title: 'Filtros com @RequestParam', subtitle: 'Parâmetros opcionais: required = false e defaultValue',
    cola: ['spring'],
    theory: [
      'Por padrão, `@RequestParam` é **obrigatório**: sem ele, a resposta é `400 Bad Request`.',
      '`@RequestParam(required = false) String categoria` → se não vier na URL, vale `null`.',
      '`@RequestParam(defaultValue = "nome") String ordem` → se não vier, vale `"nome"`.',
      'Combine vários filtros na mesma URL: `/produtos?categoria=informatica&ordem=preco`.',
      'Para ordenar: `lista.sort(Comparator.comparing(Produto::getNome))` ou `comparingDouble(Produto::getPreco)`.',
    ],
    task: 'O `ProdutoController` já tem 5 produtos. Implemente:\n- `GET /produtos` com filtros **opcionais**: `categoria` (texto), `precoMax` (Double) e `ordem` (padrão `"nome"`; pode ser `"preco"`). Sem filtros, devolve todos ordenados por nome.\n- `GET /produtos/contagem` → `HashMap<String, Integer>` com a quantidade de produtos por categoria.\n\nNão altere a lista original ao filtrar/ordenar (crie uma nova).',
    files: [
      { name: 'ProdutoController.java', code: `import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {
    private List<Produto> produtos = new ArrayList<>();

    public ProdutoController() {
        produtos.add(new Produto(1, "Caneta", "papelaria", 2.5));
        produtos.add(new Produto(2, "Caderno", "papelaria", 15.0));
        produtos.add(new Produto(3, "Mouse", "informatica", 49.9));
        produtos.add(new Produto(4, "Teclado", "informatica", 89.9));
        produtos.add(new Produto(5, "Pendrive", "informatica", 29.9));
    }

    // GET /produtos?categoria=...&precoMax=...&ordem=...

    // GET /produtos/contagem
}
` },
      { name: 'Produto.java', readonly: true, code: PRODUTO },
      APP('LojaApplication'),
    ],
    requests: 'GET /produtos\nGET /produtos?categoria=informatica\nGET /produtos?precoMax=30&ordem=preco\nGET /produtos/contagem',
    hints: [
      '`@GetMapping public List<Produto> listar(@RequestParam(required = false) String categoria, @RequestParam(required = false) Double precoMax, @RequestParam(defaultValue = "nome") String ordem)`',
      'Filtre num laço: `if (categoria != null && !p.getCategoria().equals(categoria)) continue;` (o mesmo para `precoMax`).',
      'Ordene: `if (ordem.equals("preco")) r.sort(Comparator.comparingDouble(Produto::getPreco)); else r.sort(Comparator.comparing(Produto::getNome));`',
    ],
    test: `
${nomes('/produtos', ['Caderno', 'Caneta', 'Mouse', 'Pendrive', 'Teclado'])}
${nomes('/produtos?categoria=informatica', ['Mouse', 'Pendrive', 'Teclado'])}
${nomes('/produtos?precoMax=30', ['Caderno', 'Caneta', 'Pendrive'])}
${nomes('/produtos?categoria=informatica&ordem=preco', ['Pendrive', 'Mouse', 'Teclado'])}
${nomes('/produtos?precoMax=20&ordem=preco', ['Caneta', 'Caderno'])}
${nomes('/produtos?categoria=moveis', [])}
${eqJson('GET /produtos/contagem', 'MiniSpring.get("/produtos/contagem")', '{"informatica":3,"papelaria":2}')}
QT.test("A lista original não foi alterada pelos filtros", () -> {
    MiniSpring.get("/produtos?categoria=papelaria&ordem=preco");
    QT.eq(5, ((java.util.List<?>) MiniSpring.get("/produtos").body).size());
});`,
    solution: [
      { name: 'ProdutoController.java', code: `import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {
    private List<Produto> produtos = new ArrayList<>();

    public ProdutoController() {
        produtos.add(new Produto(1, "Caneta", "papelaria", 2.5));
        produtos.add(new Produto(2, "Caderno", "papelaria", 15.0));
        produtos.add(new Produto(3, "Mouse", "informatica", 49.9));
        produtos.add(new Produto(4, "Teclado", "informatica", 89.9));
        produtos.add(new Produto(5, "Pendrive", "informatica", 29.9));
    }

    @GetMapping
    public List<Produto> listar(@RequestParam(required = false) String categoria,
                                @RequestParam(required = false) Double precoMax,
                                @RequestParam(defaultValue = "nome") String ordem) {
        List<Produto> r = new ArrayList<>();
        for (Produto p : produtos) {
            if (categoria != null && !p.getCategoria().equals(categoria)) continue;
            if (precoMax != null && p.getPreco() > precoMax) continue;
            r.add(p);
        }
        if (ordem.equals("preco")) r.sort(Comparator.comparingDouble(Produto::getPreco));
        else r.sort(Comparator.comparing(Produto::getNome));
        return r;
    }

    @GetMapping("/contagem")
    public HashMap<String, Integer> contagem() {
        HashMap<String, Integer> m = new HashMap<>();
        for (Produto p : produtos) {
            m.put(p.getCategoria(), m.getOrDefault(p.getCategoria(), 0) + 1);
        }
        return m;
    }
}
` },
      { name: 'Produto.java', readonly: true, code: PRODUTO },
      APP('LojaApplication'),
    ],
  });

  /* ============================================================ s07 */
  PHASES.push({
    id: 's07', track: 'web', icon: '🏫', level: 3, kind: 'spring',
    title: 'Rotas Aninhadas', subtitle: 'Várias @PathVariable: /turmas/{turma}/alunos/{nome}/notas',
    cola: ['spring', 'colecoes'],
    theory: [
      'URLs REST costumam ser **hierárquicas**: um aluno pertence a uma turma → `/turmas/{turma}/alunos/{nome}`.',
      'Um método pode ter várias `@PathVariable`: `(@PathVariable("turma") String turma, @PathVariable("nome") String nome)`.',
      'Estrutura de dados: `HashMap<String, HashMap<String, ArrayList<Double>>>` → turma → aluno → notas.',
      '`new ArrayList<>(new TreeSet<>(mapa.keySet()))` devolve as chaves em ordem alfabética.',
    ],
    task: 'Implemente o `TurmaController` (dados em memória: turma → aluno → lista de notas):\n- `GET /turmas` → nomes das turmas em ordem alfabética\n- `POST /turmas/{turma}/alunos` (param `nome`) → cria a turma se preciso, adiciona o aluno e retorna os alunos da turma em ordem alfabética\n- `GET /turmas/{turma}/alunos` → alunos em ordem alfabética (turma inexistente → lista vazia)\n- `POST /turmas/{turma}/alunos/{nome}/notas` (param `nota`) → adiciona a nota e retorna a lista de notas do aluno\n- `GET /turmas/{turma}/alunos/{nome}/media` → `{"turma": ..., "aluno": ..., "media": ...}` (sem notas → `0.0`)',
    files: [
      { name: 'TurmaController.java', code: `import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/turmas")
public class TurmaController {
    // turma -> (aluno -> notas)
    private HashMap<String, HashMap<String, ArrayList<Double>>> dados = new HashMap<>();

}
` },
      APP('EscolaApplication'),
    ],
    requests: 'POST /turmas/SE9/alunos nome=Ana\nPOST /turmas/SE9/alunos nome=Bruno\nPOST /turmas/SE9/alunos/Ana/notas nota=8\nPOST /turmas/SE9/alunos/Ana/notas nota=6.5\nGET /turmas/SE9/alunos/Ana/media\nGET /turmas',
    hints: [
      '`@PostMapping("/{turma}/alunos") public List<String> addAluno(@PathVariable("turma") String turma, @RequestParam String nome) { dados.putIfAbsent(turma, new HashMap<>()); dados.get(turma).putIfAbsent(nome, new ArrayList<>()); ... }`',
      'Para listar em ordem: `new ArrayList<>(new TreeSet<>(dados.get(turma).keySet()))`.',
      'Média: retorne um `HashMap<String, Object>` com `turma`, `aluno` e `media`.',
    ],
    test: `
${eqJson('POST /turmas/SE9/alunos nome=Bruno', `MiniSpring.post("/turmas/SE9/alunos", ${P('nome', 'Bruno')})`, '["Bruno"]')}
${eqJson('POST /turmas/SE9/alunos nome=Ana (ordem alfabética)', `MiniSpring.post("/turmas/SE9/alunos", ${P('nome', 'Ana')})`, '["Ana","Bruno"]')}
${eqJson('GET /turmas/SE9/alunos', 'MiniSpring.get("/turmas/SE9/alunos")', '["Ana","Bruno"]')}
${eqJson('GET /turmas/XX/alunos → []', 'MiniSpring.get("/turmas/XX/alunos")', '[]')}
${eqJson('POST nota 8 para Ana', `MiniSpring.post("/turmas/SE9/alunos/Ana/notas", ${P('nota', '8')})`, '[8.0]')}
${eqJson('POST nota 6.5 para Ana', `MiniSpring.post("/turmas/SE9/alunos/Ana/notas", ${P('nota', '6.5')})`, '[8.0,6.5]')}
${eqJson('GET média da Ana', 'MiniSpring.get("/turmas/SE9/alunos/Ana/media")', '{"aluno":"Ana","media":7.25,"turma":"SE9"}')}
${eqJson('GET média do Bruno (sem notas)', 'MiniSpring.get("/turmas/SE9/alunos/Bruno/media")', '{"aluno":"Bruno","media":0.0,"turma":"SE9"}')}
QT.test("GET /turmas em ordem alfabética", () -> {
    MiniSpring.post("/turmas/SE8/alunos", ${P('nome', 'Carla')});
    QT.eq("${J('["SE8","SE9"]')}", MiniSpring.get("/turmas").json);
});
${eqJson('Turmas são independentes', 'MiniSpring.get("/turmas/SE8/alunos")', '["Carla"]')}`,
    solution: [
      { name: 'TurmaController.java', code: `import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/turmas")
public class TurmaController {
    // turma -> (aluno -> notas)
    private HashMap<String, HashMap<String, ArrayList<Double>>> dados = new HashMap<>();

    @GetMapping
    public List<String> turmas() {
        return new ArrayList<>(new TreeSet<>(dados.keySet()));
    }

    @PostMapping("/{turma}/alunos")
    public List<String> addAluno(@PathVariable("turma") String turma, @RequestParam String nome) {
        dados.putIfAbsent(turma, new HashMap<>());
        dados.get(turma).putIfAbsent(nome, new ArrayList<>());
        return alunos(turma);
    }

    @GetMapping("/{turma}/alunos")
    public List<String> alunos(@PathVariable("turma") String turma) {
        if (!dados.containsKey(turma)) return new ArrayList<>();
        return new ArrayList<>(new TreeSet<>(dados.get(turma).keySet()));
    }

    @PostMapping("/{turma}/alunos/{nome}/notas")
    public List<Double> addNota(@PathVariable("turma") String turma, @PathVariable("nome") String nome,
                                @RequestParam double nota) {
        dados.putIfAbsent(turma, new HashMap<>());
        dados.get(turma).putIfAbsent(nome, new ArrayList<>());
        dados.get(turma).get(nome).add(nota);
        return dados.get(turma).get(nome);
    }

    @GetMapping("/{turma}/alunos/{nome}/media")
    public HashMap<String, Object> media(@PathVariable("turma") String turma, @PathVariable("nome") String nome) {
        double soma = 0;
        int qtd = 0;
        if (dados.containsKey(turma) && dados.get(turma).containsKey(nome)) {
            for (double n : dados.get(turma).get(nome)) { soma += n; qtd++; }
        }
        HashMap<String, Object> r = new HashMap<>();
        r.put("turma", turma);
        r.put("aluno", nome);
        r.put("media", qtd == 0 ? 0.0 : soma / qtd);
        return r;
    }
}
` },
      APP('EscolaApplication'),
    ],
  });

  /* ============================================================ s08 */
  const CONTATO = `public class Contato {
    private Integer id;
    private String nome;
    private String telefone;

    public Contato(Integer id, String nome, String telefone) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
    }

    public Integer getId() { return id; }
    public String getNome() { return nome; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
}
`;
  const C = (id, nome, tel) => `{"id":${id},"nome":"${nome}","telefone":"${tel}"}`;
  PHASES.push({
    id: 's08', track: 'web', icon: '🚦', level: 4, kind: 'spring',
    title: 'ResponseEntity e Status HTTP', subtitle: '200, 201, 204, 400 e 404 do jeito certo',
    cola: ['spring', 'http'],
    theory: [
      'Uma API REST comunica o resultado pelo **código de status**: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`.',
      '`ResponseEntity<T>` permite escolher o status e o corpo: `ResponseEntity.ok(obj)`, `ResponseEntity.status(HttpStatus.CREATED).body(obj)`.',
      'Sem corpo: `ResponseEntity.notFound().build()` e `ResponseEntity.noContent().build()`.',
      'Erro com mensagem: `ResponseEntity.badRequest().body("Nome é obrigatório")`.',
      'Importe de `org.springframework.http`: `ResponseEntity` e `HttpStatus`.',
    ],
    task: 'Agenda de contatos (`/contatos`) usando `ResponseEntity` em todos os métodos:\n- `GET /contatos` → `200` com a lista\n- `GET /contatos/{id}` → `200` com o contato, ou `404` sem corpo\n- `POST /contatos` (params `nome`, `telefone`) → `201` com o contato criado (ids 1, 2, 3…). Se o nome estiver vazio → `400` com `"Nome é obrigatório"`; se o telefone tiver menos de 8 dígitos (ignore traços/espaços) → `400` com `"Telefone inválido"`\n- `PUT /contatos/{id}` (param `telefone`) → `200` com o contato atualizado, ou `404`\n- `DELETE /contatos/{id}` → `204` sem corpo, ou `404`',
    files: [
      { name: 'ContatoController.java', code: `import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contatos")
public class ContatoController {
    private List<Contato> contatos = new ArrayList<>();
    private int proximoId = 1;

}
` },
      { name: 'Contato.java', readonly: true, code: CONTATO },
      APP('AgendaApplication'),
    ],
    requests: 'POST /contatos nome=Ana&telefone=21 99999-0000\nPOST /contatos nome=&telefone=123456789\nPOST /contatos nome=Zé&telefone=123\nGET /contatos/1\nGET /contatos/42\nDELETE /contatos/1\nDELETE /contatos/1',
    hints: [
      '`@GetMapping("/{id}") public ResponseEntity<Contato> porId(@PathVariable("id") Integer id) { ... if (c == null) return ResponseEntity.notFound().build(); return ResponseEntity.ok(c); }`',
      'Como o POST pode devolver um Contato ou uma mensagem, use `ResponseEntity<Object>` (ou `ResponseEntity<?>`).',
      'Dígitos do telefone: `telefone.replaceAll("\\\\D", "").length() < 8`. Criado: `return ResponseEntity.status(HttpStatus.CREATED).body(c);`',
    ],
    test: `
${eqStatus('POST /contatos → 201 Created', `MiniSpring.post("/contatos", ${P('nome', 'Ana', 'telefone', '21 99999-0000')})`, 201, C(1, 'Ana', '21 99999-0000'))}
${eqStatus('POST sem nome → 400 "Nome é obrigatório"', `MiniSpring.post("/contatos", ${P('nome', '  ', 'telefone', '21999990000')})`, 400, '"Nome é obrigatório"')}
${eqStatus('POST com telefone curto → 400 "Telefone inválido"', `MiniSpring.post("/contatos", ${P('nome', 'Zé', 'telefone', '12-34')})`, 400, '"Telefone inválido"')}
${eqStatus('POST válido seguinte recebe id 2', `MiniSpring.post("/contatos", ${P('nome', 'Bruno', 'telefone', '3333-4444')})`, 201, C(2, 'Bruno', '3333-4444'))}
${eqStatus('GET /contatos → 200 com 2 contatos', 'MiniSpring.get("/contatos")', 200, '[' + C(1, 'Ana', '21 99999-0000') + ',' + C(2, 'Bruno', '3333-4444') + ']')}
${eqStatus('GET /contatos/2 → 200', 'MiniSpring.get("/contatos/2")', 200, C(2, 'Bruno', '3333-4444'))}
${eqStatus('GET /contatos/42 → 404 sem corpo', 'MiniSpring.get("/contatos/42")', 404, '')}
${eqStatus('PUT /contatos/1 → 200 com telefone novo', `MiniSpring.put("/contatos/1", ${P('telefone', '21 98888-1111')})`, 200, C(1, 'Ana', '21 98888-1111'))}
${eqStatus('PUT /contatos/42 → 404', `MiniSpring.put("/contatos/42", ${P('telefone', '21 98888-1111')})`, 404)}
${eqStatus('DELETE /contatos/1 → 204 sem corpo', 'MiniSpring.delete("/contatos/1")', 204, '')}
${eqStatus('DELETE /contatos/1 de novo → 404', 'MiniSpring.delete("/contatos/1")', 404)}`,
    solution: [
      { name: 'ContatoController.java', code: `import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contatos")
public class ContatoController {
    private List<Contato> contatos = new ArrayList<>();
    private int proximoId = 1;

    private Contato buscar(Integer id) {
        for (Contato c : contatos) if (c.getId().equals(id)) return c;
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Contato>> listar() {
        return ResponseEntity.ok(contatos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contato> porId(@PathVariable("id") Integer id) {
        Contato c = buscar(id);
        if (c == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(c);
    }

    @PostMapping
    public ResponseEntity<Object> criar(@RequestParam String nome, @RequestParam String telefone) {
        if (nome.isBlank()) return ResponseEntity.badRequest().body("Nome é obrigatório");
        if (telefone.replaceAll("\\\\D", "").length() < 8) return ResponseEntity.badRequest().body("Telefone inválido");
        Contato c = new Contato(proximoId++, nome, telefone);
        contatos.add(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(c);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contato> atualizar(@PathVariable("id") Integer id, @RequestParam String telefone) {
        Contato c = buscar(id);
        if (c == null) return ResponseEntity.notFound().build();
        c.setTelefone(telefone);
        return ResponseEntity.ok(c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> apagar(@PathVariable("id") Integer id) {
        Contato c = buscar(id);
        if (c == null) return ResponseEntity.notFound().build();
        contatos.remove(c);
        return ResponseEntity.noContent().build();
    }
}
` },
      { name: 'Contato.java', readonly: true, code: CONTATO },
      APP('AgendaApplication'),
    ],
  });

  /* ============================================================ s09 */
  const ITEM = `public class ItemPedido {
    private String produto;
    private int quantidade;
    private double precoUnitario;

    public ItemPedido() { }   // construtor vazio: necessário para o @RequestBody

    public String getProduto() { return produto; }
    public void setProduto(String produto) { this.produto = produto; }
    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    public double getPrecoUnitario() { return precoUnitario; }
    public void setPrecoUnitario(double precoUnitario) { this.precoUnitario = precoUnitario; }
}
`;
  const BODY1 = '{"cliente":"Ana","itens":[{"produto":"Caneta","quantidade":3,"precoUnitario":2.5},{"produto":"Caderno","quantidade":1,"precoUnitario":25.0}]}';
  const PED1 = '{"cliente":"Ana","id":1,"itens":[{"precoUnitario":2.5,"produto":"Caneta","quantidade":3},{"precoUnitario":25.0,"produto":"Caderno","quantidade":1}],"total":32.5}';
  PHASES.push({
    id: 's09', track: 'web', icon: '📨', level: 4, kind: 'spring',
    title: '@RequestBody com JSON', subtitle: 'Recebendo objetos inteiros (e listas) no corpo da requisição',
    cola: ['spring'],
    theory: [
      'Com `@RequestBody Pedido pedido`, o Spring converte o **JSON do corpo** da requisição num objeto Java.',
      'O JSON `{"cliente": "Ana", "itens": [...]}` preenche os atributos de mesmo nome — inclusive listas de outros objetos.',
      'A classe precisa de **construtor vazio** e de getters/setters.',
      'Na volta, os getters viram JSON — um método `getTotal()` aparece como `"total"` mesmo sem atributo.',
      'No painel 📮, envie JSON assim: `POST /pedidos {"cliente":"Ana","itens":[...]}`.',
    ],
    task: '1. Complete a classe `Pedido`: atributos `id` (Integer), `cliente` (String) e `itens` (`List<ItemPedido>`), construtor vazio, getters/setters e `double getTotal()` (soma de quantidade × preço).\n2. No `PedidoController` (`/pedidos`):\n- `POST /pedidos` com `@RequestBody Pedido` → se o cliente estiver vazio ou não houver itens: `400` com `{"erro": "Pedido inválido"}`. Senão, atribui o id (1, 2…), guarda e devolve `201` com `{"id": ..., "cliente": ..., "total": ..., "quantidadeItens": ...}` (soma das quantidades).\n- `GET /pedidos/{id}` → `200` com o pedido completo, ou `404`.\n- `GET /pedidos/cliente/{nome}` → `200` com a lista de pedidos do cliente.',
    files: [
      { name: 'Pedido.java', code: `import java.util.ArrayList;
import java.util.List;

public class Pedido {

}
` },
      { name: 'PedidoController.java', code: `import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {
    private List<Pedido> pedidos = new ArrayList<>();

}
` },
      { name: 'ItemPedido.java', readonly: true, code: ITEM },
      APP('PedidosApplication'),
    ],
    requests: 'POST /pedidos ' + BODY1 + '\nPOST /pedidos {"cliente":"","itens":[]}\nGET /pedidos/1\nGET /pedidos/cliente/Ana',
    hints: [
      'Em `Pedido`: `public double getTotal() { double t = 0; for (ItemPedido i : itens) t += i.getQuantidade() * i.getPrecoUnitario(); return t; }` — inicialize `itens = new ArrayList<>()`.',
      '`@PostMapping public ResponseEntity<Object> criar(@RequestBody Pedido pedido)`',
      'Resposta do POST: `HashMap<String, Object> r = new HashMap<>(); r.put("id", pedido.getId()); r.put("total", pedido.getTotal()); ...`',
    ],
    test: `
QT.test("Pedido tem construtor vazio e getTotal()", () -> {
    Object p = QT.make("Pedido");
    QT.eq(0.0, QT.callM(p, "getTotal"));
});
${eqStatus('POST /pedidos → 201 com resumo', `MiniSpring.postJson("/pedidos", "${J(BODY1)}")`, 201, '{"cliente":"Ana","id":1,"quantidadeItens":4,"total":32.5}')}
${eqStatus('GET /pedidos/1 → pedido completo (itens e total)', 'MiniSpring.get("/pedidos/1")', 200, PED1)}
${eqStatus('POST com cliente vazio → 400', `MiniSpring.postJson("/pedidos", "${J('{"cliente":"","itens":[{"produto":"X","quantidade":1,"precoUnitario":1.0}]}')}")`, 400, '{"erro":"Pedido inválido"}')}
${eqStatus('POST sem itens → 400', `MiniSpring.postJson("/pedidos", "${J('{"cliente":"Bruno","itens":[]}')}")`, 400, '{"erro":"Pedido inválido"}')}
${eqStatus('POST sem o campo itens → 400 (sem NullPointerException)', `MiniSpring.postJson("/pedidos", "${J('{"cliente":"Bruno"}')}")`, 400, '{"erro":"Pedido inválido"}')}
${eqStatus('Segundo pedido válido recebe id 2', `MiniSpring.postJson("/pedidos", "${J('{"cliente":"Bruno","itens":[{"produto":"Mouse","quantidade":2,"precoUnitario":50.0}]}')}")`, 201, '{"cliente":"Bruno","id":2,"quantidadeItens":2,"total":100.0}')}
${eqStatus('GET /pedidos/9 → 404', 'MiniSpring.get("/pedidos/9")', 404)}
QT.test("GET /pedidos/cliente/Ana → 1 pedido", () -> {
    MiniSpring.Response r = MiniSpring.get("/pedidos/cliente/Ana");
    QT.eq(200, r.status);
    QT.eq(java.util.List.of(1), QT.pluck(r.body, "getId"));
});`,
    solution: [
      { name: 'Pedido.java', code: `import java.util.ArrayList;
import java.util.List;

public class Pedido {
    private Integer id;
    private String cliente;
    private List<ItemPedido> itens = new ArrayList<>();

    public Pedido() { }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }
    public List<ItemPedido> getItens() { return itens; }
    public void setItens(List<ItemPedido> itens) { this.itens = itens; }

    public double getTotal() {
        double t = 0;
        if (itens != null) {
            for (ItemPedido i : itens) t += i.getQuantidade() * i.getPrecoUnitario();
        }
        return t;
    }
}
` },
      { name: 'PedidoController.java', code: `import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {
    private List<Pedido> pedidos = new ArrayList<>();

    @PostMapping
    public ResponseEntity<Object> criar(@RequestBody Pedido pedido) {
        if (pedido.getCliente() == null || pedido.getCliente().isBlank()
                || pedido.getItens() == null || pedido.getItens().isEmpty()) {
            HashMap<String, String> erro = new HashMap<>();
            erro.put("erro", "Pedido inválido");
            return ResponseEntity.badRequest().body(erro);
        }
        pedido.setId(pedidos.size() + 1);
        pedidos.add(pedido);

        int qtd = 0;
        for (ItemPedido i : pedido.getItens()) qtd += i.getQuantidade();
        HashMap<String, Object> r = new HashMap<>();
        r.put("id", pedido.getId());
        r.put("cliente", pedido.getCliente());
        r.put("total", pedido.getTotal());
        r.put("quantidadeItens", qtd);
        return ResponseEntity.status(HttpStatus.CREATED).body(r);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> porId(@PathVariable("id") Integer id) {
        for (Pedido p : pedidos) {
            if (p.getId().equals(id)) return ResponseEntity.ok(p);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/cliente/{nome}")
    public ResponseEntity<List<Pedido>> porCliente(@PathVariable("nome") String nome) {
        List<Pedido> r = new ArrayList<>();
        for (Pedido p : pedidos) if (p.getCliente().equals(nome)) r.add(p);
        return ResponseEntity.ok(r);
    }
}
` },
      { name: 'ItemPedido.java', readonly: true, code: ITEM },
      APP('PedidosApplication'),
    ],
  });

  /* ============================================================ s10 */
  const LK = (c, url, a) => `{"acessos":${a},"codigo":"${c}","url":"${url}"}`;
  const U1 = 'https://www.ime.eb.br', U2 = 'https://spring.io/guides', U3 = 'http://localhost:8080/users';
  PHASES.push({
    id: 's10', track: 'web', icon: '🔗', level: 5, kind: 'spring',
    title: 'Desafio: Encurtador de Links', subtitle: 'Tudo junto: @RequestBody, ResponseEntity, filtros e PATCH',
    cola: ['spring', 'http', 'colecoes'],
    theory: [
      'Este desafio junta tudo de `@RestController`: rotas, métodos HTTP, `@PathVariable`, `@RequestParam` opcional, `@RequestBody` e `ResponseEntity`.',
      'Planeje a estrutura antes: uma classe `Link` (codigo, url, acessos) e um `LinkedHashMap<String, Link>` (código → link) mantém a ordem de inserção.',
      'Códigos gerados em sequência: `"L" + contador` (L1, L2, L3…).',
      'Para corpo JSON simples, `@RequestBody Map<String, String> corpo` e depois `corpo.get("url")` também funciona.',
    ],
    task: 'Crie a classe `Link` (`codigo`, `url`, `acessos`, com getters) e o `LinkController` (`/links`):\n- `POST /links` com corpo `{"url": "..."}` → se a URL não começar com `http://` ou `https://`: `400` com `{"erro": "URL inválida"}`; se a mesma URL já existir: `409` com o link existente; senão `201` com o link novo (códigos `L1`, `L2`…, `acessos` = 0).\n- `GET /links/{codigo}` → `200` com o link **e soma 1 em acessos** (antes de responder); código inexistente → `404`.\n- `GET /links` → `200` com todos, na ordem de criação; com `?ordem=acessos`, do mais acessado para o menos.\n- `PATCH /links/{codigo}/zerar` → zera os acessos: `200` com o link, ou `404`.\n- `DELETE /links/{codigo}` → `204`, ou `404`.',
    files: [
      { name: 'Link.java', code: `public class Link {

}
` },
      { name: 'LinkController.java', code: `import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/links")
public class LinkController {
    private LinkedHashMap<String, Link> links = new LinkedHashMap<>();
    private int contador = 0;

}
` },
      APP('EncurtadorApplication'),
    ],
    requests: `POST /links {"url":"${U1}"}\nPOST /links {"url":"${U2}"}\nPOST /links {"url":"ftp://arquivo"}\nGET /links/L2\nGET /links/L2\nGET /links?ordem=acessos\nDELETE /links/L1\nGET /links`,
    hints: [
      '`Link`: atributos `codigo`, `url`, `acessos` (int); construtor `(codigo, url)`; getters e um `void registrarAcesso() { acessos++; }`.',
      '`@PostMapping public ResponseEntity<Object> criar(@RequestBody Map<String, String> corpo) { String url = corpo.get("url"); ... }` — cheque `url == null` também.',
      'Ordenar por acessos: `List<Link> l = new ArrayList<>(links.values()); l.sort((a, b) -> b.getAcessos() - a.getAcessos());`',
    ],
    test: `
${eqStatus('POST /links → 201 com código L1', `MiniSpring.postJson("/links", "${J('{"url":"' + U1 + '"}')}")`, 201, LK('L1', U1, 0))}
${eqStatus('POST segundo link → L2', `MiniSpring.postJson("/links", "${J('{"url":"' + U2 + '"}')}")`, 201, LK('L2', U2, 0))}
${eqStatus('POST URL sem http → 400', `MiniSpring.postJson("/links", "${J('{"url":"ftp://arquivo.zip"}')}")`, 400, '{"erro":"URL inválida"}')}
${eqStatus('POST sem campo url → 400', `MiniSpring.postJson("/links", "{}")`, 400, '{"erro":"URL inválida"}')}
${eqStatus('POST URL repetida → 409 com o link existente', `MiniSpring.postJson("/links", "${J('{"url":"' + U1 + '"}')}")`, 409, LK('L1', U1, 0))}
${eqStatus('GET /links/L2 → 200 e conta o acesso', 'MiniSpring.get("/links/L2")', 200, LK('L2', U2, 1))}
${eqStatus('GET /links/L2 de novo → acessos 2', 'MiniSpring.get("/links/L2")', 200, LK('L2', U2, 2))}
${eqStatus('GET /links/L9 → 404', 'MiniSpring.get("/links/L9")', 404)}
QT.test("POST terceiro link (http://) → L3", () -> { MiniSpring.Response r = MiniSpring.postJson("/links", "${J('{"url":"' + U3 + '"}')}"); QT.eq(201, r.status); QT.eq("L3", QT.callM(r.body, "getCodigo")); MiniSpring.get("/links/L3"); });
QT.test("GET /links → ordem de criação", () -> QT.eq(java.util.List.of("L1", "L2", "L3"), QT.pluck(MiniSpring.get("/links").body, "getCodigo")));
QT.test("GET /links?ordem=acessos → L2 (2), L3 (1), L1 (0)", () -> QT.eq(java.util.List.of("L2", "L3", "L1"), QT.pluck(MiniSpring.get("/links?ordem=acessos").body, "getCodigo")));
${eqStatus('PATCH /links/L2/zerar → acessos 0', 'MiniSpring.patch("/links/L2/zerar")', 200, LK('L2', U2, 0))}
${eqStatus('PATCH /links/L9/zerar → 404', 'MiniSpring.patch("/links/L9/zerar")', 404)}
${eqStatus('DELETE /links/L1 → 204', 'MiniSpring.delete("/links/L1")', 204, '')}
QT.test("Depois do DELETE: 404 e lista sem L1", () -> {
    QT.eq(404, MiniSpring.delete("/links/L1").status);
    QT.eq(java.util.List.of("L2", "L3"), QT.pluck(MiniSpring.get("/links").body, "getCodigo"));
});`,
    solution: [
      { name: 'Link.java', code: `public class Link {
    private String codigo;
    private String url;
    private int acessos;

    public Link(String codigo, String url) {
        this.codigo = codigo;
        this.url = url;
    }

    public String getCodigo() { return codigo; }
    public String getUrl() { return url; }
    public int getAcessos() { return acessos; }

    public void registrarAcesso() { acessos++; }
    public void zerar() { acessos = 0; }
}
` },
      { name: 'LinkController.java', code: `import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/links")
public class LinkController {
    private LinkedHashMap<String, Link> links = new LinkedHashMap<>();
    private int contador = 0;

    @PostMapping
    public ResponseEntity<Object> criar(@RequestBody Map<String, String> corpo) {
        String url = corpo.get("url");
        if (url == null || !(url.startsWith("http://") || url.startsWith("https://"))) {
            return ResponseEntity.badRequest().body(Map.of("erro", "URL inválida"));
        }
        for (Link l : links.values()) {
            if (l.getUrl().equals(url)) return ResponseEntity.status(HttpStatus.CONFLICT).body(l);
        }
        contador++;
        Link novo = new Link("L" + contador, url);
        links.put(novo.getCodigo(), novo);
        return ResponseEntity.status(HttpStatus.CREATED).body(novo);
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<Link> abrir(@PathVariable("codigo") String codigo) {
        Link l = links.get(codigo);
        if (l == null) return ResponseEntity.notFound().build();
        l.registrarAcesso();
        return ResponseEntity.ok(l);
    }

    @GetMapping
    public ResponseEntity<List<Link>> listar(@RequestParam(required = false) String ordem) {
        List<Link> r = new ArrayList<>(links.values());
        if ("acessos".equals(ordem)) r.sort((a, b) -> b.getAcessos() - a.getAcessos());
        return ResponseEntity.ok(r);
    }

    @PatchMapping("/{codigo}/zerar")
    public ResponseEntity<Link> zerar(@PathVariable("codigo") String codigo) {
        Link l = links.get(codigo);
        if (l == null) return ResponseEntity.notFound().build();
        l.zerar();
        return ResponseEntity.ok(l);
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<Void> apagar(@PathVariable("codigo") String codigo) {
        if (links.remove(codigo) == null) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
` },
      APP('EncurtadorApplication'),
    ],
  });
})();
