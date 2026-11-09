/* =========================================================
   COLA — referência rápida exibida na gaveta retrátil
   group: java | web | front
   item: { t: título, d?: descrição, c?: código, lang? }
   ========================================================= */
window.COLA = [
  { id: 'exec', group: 'java', title: 'Estrutura e Execução', items: [
    { t: 'Compilar e executar', c: `$ javac Arquivo.java     # gera Arquivo.class (bytecode)
$ java Arquivo           # executa na JVM (sem .class)
$ java MyClass a b       # args[0]="a", args[1]="b", args.length=2`, lang: 'sh' },
    { t: 'Esqueleto de um programa', c: `import java.util.Scanner;   // caminho completo do pacote

public class OlaMundo {      // arquivo: OlaMundo.java
    public static void main(String[] args) {
        System.out.println("Olá, Mundo!");
    }
}` },
    { t: 'Comentários', c: `// linha única
/* várias
   linhas */
/** Javadoc */` },
    { t: 'Convenções', d: 'Classes em **PascalCase** (`ContaBancaria`); variáveis e métodos em **camelCase** (`saldoTotal`); constantes em `MAIUSCULAS`. Identificadores: letras, números, `_` e `$`, sem começar por número.' },
  ]},
  { id: 'pacotes', group: 'java', title: 'Pacotes, Imports e Projeto em Camadas', items: [
    { t: 'Pasta = pacote', d: 'O arquivo `src/main/java/com/ime/biblioteca/model/Livro.java` começa com `package com.ime.biblioteca.model;`. Os `import` vêm logo depois do `package` e antes da classe.' },
    { t: 'package e import', c: `package com.ime.biblioteca.service;          // 1ª linha: o pacote deste arquivo

import com.ime.biblioteca.model.Livro;        // uma classe de outro pacote
import com.ime.biblioteca.repository.*;       // todas as classes do pacote
import java.util.List;                        // classes da biblioteca Java
import org.springframework.stereotype.Service;

@Service
public class LivroService { ... }             // public: visível fora do pacote` },
    { t: 'Quando NÃO precisa de import', d: 'Classes do **mesmo pacote** e de `java.lang` (`String`, `Math`, `Integer`, `System`…). Sem `public`, a classe só é visível dentro do próprio pacote.' },
    { t: 'Estrutura de um projeto Spring', c: `src/main/java/com/ime/biblioteca/
├── BibliotecaApplication.java    @SpringBootApplication (main)
├── config/DataLoader.java        @Component + CommandLineRunner
├── controller/LivroController    @RestController  → recebe HTTP
├── dto/ApiResponse.java          objetos de resposta
├── exception/...Exception.java   extends RuntimeException
├── model/Livro.java              @Entity          → tabela
├── repository/LivroRepository   extends CrudRepository
└── service/LivroService.java     @Service         → regras de negócio`, lang: 'txt' },
    { t: 'Exceção própria e tratamento no controller', c: `public class LivroNaoEncontradoException extends RuntimeException {
    public LivroNaoEncontradoException(Long id) {
        super("Livro " + id + " não encontrado");
    }
}

// no service
if (opt.isEmpty()) throw new LivroNaoEncontradoException(id);

// no controller
try {
    return new ApiResponse<>("ok", service.buscar(id));
} catch (RuntimeException e) {
    return new ApiResponse<>(e.getMessage(), null);
}` },
    { t: 'Carga inicial (CommandLineRunner)', c: `@Component
public class DataLoader implements CommandLineRunner {
    @Autowired
    private LivroRepository repository;

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            repository.save(new Livro("Java: Como Programar", "Deitel", 2017));
        }
    }
}` },
    { t: 'Consultas derivadas do nome', c: `List<Livro> findByAutor(String autor);
List<Livro> findByDisponivelTrue();
List<Livro> findByTituloContainingIgnoreCase(String trecho);
List<Livro> findByAnoGreaterThan(Integer ano);
long countByDisponivel(boolean disponivel);
boolean existsByTitulo(String titulo);` },
  ]},
  { id: 'tipos', group: 'java', title: 'Tipos e Operadores', items: [
    { t: 'Primitivos (bits)', d: '`boolean` · `byte` 8 · `short` 16 · `char` 16 · `int` 32 · `long` 64 · `float` 32 · `double` 64' },
    { t: 'Declarações', c: `int n = 5;
long big = 3000000000L;
float f = 5.99f;          // precisa do f
double d = 5.99;
char c = 'D';             // aspas simples
boolean ok = true;
String s = "Hello";       // NÃO é primitivo` },
    { t: 'Incremento', c: `int a = 5;
int b = a++;   // b=5, a=6  (pós: usa e depois soma)
int c = ++a;   // a=7, c=7  (pré: soma e depois usa)` },
    { t: 'Aritmética e lógica', c: `7 / 2    // 3   (int / int = int)
7 % 2    // 1   (resto)
7 / 2.0  // 3.5
&& || !  == != > < >= <=` },
    { t: 'Ternário', c: `int r = x > 20 ? 10 : 30;` },
    { t: 'Conversões', c: `int i = Integer.parseInt("42");
double d = Double.parseDouble("3.5");
String s = Integer.toString(42);   // ou String.valueOf(42)
int t = (int) 3.9;                 // cast -> 3` },
    { t: 'final e static', c: `final int MAX = 10;          // constante: não muda
static int total = 0;        // da classe: compartilhado
static final double PI = 3.14159;` },
  ]},
  { id: 'fluxo', group: 'java', title: 'Controle de Fluxo', items: [
    { t: 'if / else', c: `if (cond1) {
    ...
} else if (cond2) {
    ...
} else {
    ...
}` },
    { t: 'switch', c: `switch (opcao) {
    case 1: adicionar(); break;
    case 2: imprimir();  break;
    default: sair();     break;
}   // sem break: "cai" no próximo case` },
    { t: 'Laços', c: `for (int i = 0; i < 10; i++) { ... }
for (String c : cars) { ... }          // for-each
while (cond) { ... }
do { ... } while (cond);               // roda ao menos 1 vez` },
    { t: 'break / continue', d: '`break` sai do laço; `continue` pula para a próxima iteração.' },
  ]},
  { id: 'io', group: 'java', title: 'Entrada e Saída', items: [
    { t: 'Saída', c: `System.out.print("sem quebra");
System.out.println("com quebra");
System.out.printf("Soma: %d%n", soma);` },
    { t: 'Formatos do printf', d: '`%d` inteiro · `%f` real · `%.2f` 2 casas · `%s` String · `%c` char · `%b` boolean · `%n` ou `\\n` quebra de linha' },
    { t: 'Scanner', c: `Scanner input = new Scanner(System.in);
int n = input.nextInt();
double d = input.nextDouble();
String palavra = input.next();
String linha = input.nextLine();
input.close();` },
    { t: 'Varargs', c: `public static double average(double... numbers) {
    double total = 0.0;
    for (double d : numbers) total += d;
    return total / numbers.length;   // numbers é um array
}` },
    { t: 'Medir tempo', c: `long ini = System.nanoTime();
// ...
long ms = (System.nanoTime() - ini) / 1_000_000;
long agora = System.currentTimeMillis();` },
  ]},
  { id: 'string', group: 'java', title: 'String', items: [
    { t: 'Imutável!', d: 'Métodos retornam uma **nova** String. Use `s = s.toUpperCase();`. Compare com `equals`, nunca `==`.' },
    { t: 'Métodos principais', c: `String s = "Java Web";
s.length()              // 8
s.charAt(0)             // 'J'
s.substring(0, 4)       // "Java" (fim exclusivo)
s.substring(5)          // "Web"
s.indexOf("W")          // 5   (-1 se não achar)
s.lastIndexOf("a")      // 3
s.contains("Web")       // true
s.startsWith("Ja")      // true
s.endsWith(".com")      // false
s.toUpperCase()         // "JAVA WEB"
s.toLowerCase()         // "java web"
s.replace("Web", "EE")  // "Java EE"
s.trim()                // remove espaços das pontas
s.split(" ")            // ["Java", "Web"]
s.equals("java web")    // false
s.equalsIgnoreCase("java web") // true
s.isEmpty()             // false
String.join("-", "a", "b")     // "a-b"` },
    { t: 'Caracteres', c: `char c = s.charAt(i);
Character.isDigit(c);  Character.isLetter(c);
char[] arr = s.toCharArray();
for (char ch : s.toCharArray()) { ... }` },
    { t: 'URL encode (WhatsApp)', c: `String msg = URLEncoder.encode("Olá mundo", StandardCharsets.UTF_8)
                        .replace("+", "%20");
String url = "https://wa.me/" + tel + "?text=" + msg;` },
  ]},
  { id: 'array', group: 'java', title: 'Arrays', items: [
    { t: 'Declaração e acesso', c: `int[] numeros = {5, 2, 9, 1, 3};
int[] vazio = new int[5];          // [0, 0, 0, 0, 0]
numeros.length                     // 5 (sem parênteses)
numeros[0]                         // 5
numeros[numeros.length - 1]        // 3 (último)
int[][] m = new int[3][4];         // matriz` },
    { t: 'java.util.Arrays', c: `Arrays.sort(numeros);                  // [1, 2, 3, 5, 9]
Arrays.binarySearch(numeros, 3);       // 2 (ordenado!)
Arrays.fill(vazio, 7);                 // [7, 7, 7, 7, 7]
int[] copia = Arrays.copyOf(numeros, 3); // [1, 2, 3]
Arrays.equals(numeros, copia);         // false
Arrays.toString(numeros);              // "[1, 2, 3, 5, 9]"` },
    { t: 'Atenção', d: '`println(vetor)` imprime `[I@6504e3b2`. Tamanho é **fixo**. Índice inválido → `ArrayIndexOutOfBoundsException`.' },
  ]},
  { id: 'colecoes', group: 'java', title: 'Coleções', items: [
    { t: 'Imports', c: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.*;   // tudo` },
    { t: 'ArrayList', c: `ArrayList<Integer> l = new ArrayList<>();
l.add(10);            // [10]
l.add(0, 5);          // [5, 10] insere no índice
l.get(0);             // 5
l.set(0, 7);          // [7, 10]
l.remove(0);          // remove ÍNDICE 0 -> [10]
l.remove(Integer.valueOf(10)); // remove o VALOR 10
l.size();  l.contains(7);  l.indexOf(7);
l.isEmpty();  l.clear();
Collections.sort(l);` },
    { t: 'HashMap (chave → valor)', c: `HashMap<String, Integer> m = new HashMap<>();
m.put("John", 32);         // chave repetida sobrescreve
m.get("John");             // 32 (null se não existir)
m.getOrDefault("X", 0);    // 0
m.containsKey("John");     // true
m.remove("John");
m.size();
m.keySet();   m.values();
for (String k : m.keySet()) {
    System.out.println(k + " = " + m.get(k));
}` },
    { t: 'HashMap aninhado', c: `HashMap<String, HashMap<String, Double>> notas = new HashMap<>();
notas.put("Ana", new HashMap<>());
notas.get("Ana").put("Cálculo", 9.5);
notas.get("Ana").get("Cálculo");   // 9.5` },
    { t: 'HashSet (sem repetição)', c: `HashSet<String> s = new HashSet<>();
s.add("BMW"); s.add("BMW");   // ignora repetido
s.size();          // 1
s.contains("BMW"); // true
s.remove("BMW");` },
    { t: 'Wrappers', d: 'Coleções só guardam objetos: `Integer`, `Double`, `Character`, `Boolean`, `Long`… (não `int`, `double`).' },
  ]},
  { id: 'poo', group: 'java', title: 'Classes e Objetos', items: [
    { t: 'Classe completa', c: `public class Product {
    private Integer productId;
    private String name;
    private double price;

    public Product() { }                        // construtor padrão
    public Product(Integer id, String name, double price) {
        this.productId = id;
        this.name = name;
        this.price = price;
    }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}` },
    { t: 'Criar e usar', c: `Product p = new Product(1, "Caneta", 2.5);
p.setName("Lápis");
System.out.println(p.getName());` },
    { t: 'toString / equals / hashCode', c: `@Override
public String toString() {
    return "Product{name='" + name + "', price=" + price + "}";
}
@Override
public boolean equals(Object obj) {
    if (this == obj) return true;
    if (obj == null || getClass() != obj.getClass()) return false;
    Product p = (Product) obj;
    return Objects.equals(productId, p.productId);
}
@Override
public int hashCode() {
    return Objects.hash(productId);
}` },
    { t: 'Regras', d: 'Construtor: mesmo nome da classe, **sem retorno**. Sobrecarga: mesmo nome, parâmetros diferentes (compilação). `==` compara referência; `equals` compara conteúdo. GC libera objetos sem referência.' },
  ]},
  { id: 'heranca', group: 'java', title: 'Herança e Interfaces', items: [
    { t: 'Herança', c: `class Pessoa {
    protected String nome;
    Pessoa(String nome) { this.nome = nome; }
    void exibirInfo() { System.out.println(nome); }
}
class Aluno extends Pessoa {
    int matricula;
    Aluno(String nome, int matricula) {
        super(nome);              // 1ª linha!
        this.matricula = matricula;
    }
    @Override
    void exibirInfo() {
        super.exibirInfo();
        System.out.println(matricula);
    }
}` },
    { t: 'Interface', c: `interface User {
    void login();               // public abstract
    String getRole();
}
class AdminUser implements User {
    @Override public void login() { ... }
    @Override public String getRole() { return "Admin"; }
}` },
    { t: 'Polimorfismo e cast', c: `List<User> users = new ArrayList<>();
users.add(new AdminUser("admin1"));
for (User u : users) {
    u.login();
    if (u instanceof AdminUser) ((AdminUser) u).manageSystem();
}` },
    { t: 'Visibilidade', d: '`public` → todos · `protected` → pacote + subclasses · *(nenhum)* → só o pacote · `private` → só a classe. Sem herança múltipla de classes; várias interfaces OK.' },
  ]},
  { id: 'arquivos', group: 'java', title: 'Arquivos e Exceções', items: [
    { t: 'Escrever', c: `try {
    FileWriter writer = new FileWriter("MyFile.txt", true); // true = append
    BufferedWriter bw = new BufferedWriter(writer);
    for (String item : items) {
        bw.write(item);
        bw.newLine();
    }
    bw.close();
} catch (IOException e) {
    e.printStackTrace();
}` },
    { t: 'Ler', c: `ArrayList<String> items = new ArrayList<>();
try {
    BufferedReader br = new BufferedReader(new FileReader("MyFile.txt"));
    String line;
    while ((line = br.readLine()) != null) {
        items.add(line);
    }
    br.close();
} catch (IOException e) {
    e.printStackTrace();
}` },
    { t: 'CSV manual', c: `String[] values = line.split(",");
int id = Integer.parseInt(values[0]);` },
    { t: 'OpenCSV', c: `import com.opencsv.*;

CSVWriter writer = new CSVWriter(new FileWriter("MyFile.csv"));
writer.writeNext(new String[] {"Name", "Turma", "Nota"});
writer.close();

CSVReader reader = new CSVReader(new FileReader("MyFile.csv"));
String[] nextLine;
while ((nextLine = reader.readNext()) != null) {
    System.out.println(Arrays.toString(nextLine));
}
reader.close();` },
    { t: 'try / catch / finally', c: `try {
    ...
} catch (NumberFormatException e) {
    ...
} finally {
    // sempre executa
}` },
  ]},
  { id: 'generics', group: 'java', title: 'Generics', items: [
    { t: 'Classe genérica', c: `public class PrinterGen<T> {
    public void print(T[] vetor) {
        for (T e : vetor) System.out.println(e);
    }
}
PrinterGen<Integer> p = new PrinterGen<>();
p.print(new Integer[] {1, 2, 3});   // Integer[], não int[]` },
    { t: 'Método genérico + Comparable', c: `public static <T extends Comparable<T>> void bubbleSort(T[] v) {
    for (int i = 0; i < v.length - 1; i++)
        for (int j = 0; j < v.length - 1 - i; j++)
            if (v[j].compareTo(v[j + 1]) > 0) {
                T tmp = v[j]; v[j] = v[j + 1]; v[j + 1] = tmp;
            }
}` },
    { t: 'Resposta genérica de API', c: `public class ApiResponse<T> {
    private String message;
    private T data;
    public ApiResponse(String message, T data) {
        this.message = message; this.data = data;
    }
    // getters...
}` },
  ]},
  { id: 'gradle', group: 'java', title: 'Gradle', items: [
    { t: 'Comandos', c: `$ gradle init           # cria o projeto
$ ./gradlew run         # executa
$ ./gradlew build       # compila e testa
$ ./gradlew clean       # limpa
$ ./gradlew bootRun     # Spring Boot`, lang: 'sh' },
    { t: 'build.gradle.kts', c: `plugins { application }
repositories { mavenCentral() }
dependencies {
    implementation("com.opencsv:opencsv:3.7")
}`, lang: 'kts' },
  ]},
  { id: 'http', group: 'web', title: 'HTTP, MVC e CRUD', items: [
    { t: 'Métodos HTTP', d: '**GET** obter · **POST** criar · **PUT** substituir tudo · **PATCH** alterar parte · **DELETE** remover' },
    { t: 'CRUD', d: 'Create → POST → `INSERT` · Read → GET → `SELECT` · Update → PUT/PATCH → `UPDATE` · Delete → DELETE → `DELETE`' },
    { t: 'MVC', d: '**Model**: dados (Java/BD) · **View**: apresentação (HTML/CSS/JS) · **Controller**: trata requisições e valida (Spring)' },
    { t: 'Portas', d: 'Apache 80/443 · MySQL 3306 · Spring Boot 8080. `C:/xampp/htdocs/x.html` → `http://localhost/x.html`. Origem diferente (porta/domínio) → CORS.' },
  ]},
  { id: 'spring', group: 'web', title: 'Spring Boot', items: [
    { t: 'Aplicação mínima', c: `@SpringBootApplication
@RestController
public class OnepageApplication {
    public static void main(String[] args) {
        SpringApplication.run(OnepageApplication.class, args);
    }
    @GetMapping("/home")
    public String home() { return "Welcome home!"; }
}` },
    { t: 'Anotações', d: '`@SpringBootApplication` classe principal · `@RestController` = `@Controller` + `@ResponseBody` · `@RequestMapping(path="/x")` prefixo · `@GetMapping` `@PostMapping` `@PutMapping` `@DeleteMapping` `@PatchMapping` · `@PathVariable` parâmetro na URL · `@RequestParam` variável GET/POST · `@Autowired` injeção · `@Component` componente' },
    { t: 'PathVariable e RequestParam', c: `@GetMapping("/users/{id}")             // /users/2
public User byId(@PathVariable("id") Integer id) { ... }

@GetMapping("/busca")                   // /busca?nome=Ana
public String busca(@RequestParam String nome) { ... }

@PostMapping("/create")                 // campos do <form>
public HashMap<String, String> create(@RequestParam String username) { ... }` },
    { t: 'Retorno JSON', c: `@GetMapping("/fatorial/{number}")
public HashMap<String, Integer> fat(@PathVariable("number") Integer n) {
    HashMap<String, Integer> r = new HashMap<>();
    r.put("number", n);
    r.put("fatNumber", fatorial(n));
    return r;   // {"number": 5, "fatNumber": 120}
}` },
    { t: 'CRUD completo num controller', c: `@RestController
@RequestMapping("/tarefas")
public class TarefaController {
    @GetMapping                    // GET    /tarefas
    public List<Tarefa> listar() { ... }

    @GetMapping("/{id}")           // GET    /tarefas/1
    public Tarefa porId(@PathVariable("id") Integer id) { ... }

    @PostMapping                   // POST   /tarefas   (titulo=...)
    public Tarefa criar(@RequestParam String titulo) { ... }

    @PutMapping("/{id}")           // PUT    /tarefas/1 (substitui)
    public Tarefa atualizar(@PathVariable("id") Integer id, @RequestParam String titulo) { ... }

    @PatchMapping("/{id}/concluir")// PATCH  /tarefas/1/concluir (parcial)
    public Tarefa concluir(@PathVariable("id") Integer id) { ... }

    @DeleteMapping("/{id}")        // DELETE /tarefas/1
    public boolean apagar(@PathVariable("id") Integer id) { ... }
}` },
    { t: '@RequestParam opcional', c: `@GetMapping("/produtos")       // /produtos?categoria=x&ordem=preco
public List<Produto> listar(
        @RequestParam(required = false) String categoria,   // ausente = null
        @RequestParam(required = false) Double precoMax,    // use Double, não double
        @RequestParam(defaultValue = "nome") String ordem) { ... }` },
    { t: 'Várias @PathVariable', c: `@GetMapping("/turmas/{turma}/alunos/{nome}/media")
public HashMap<String, Object> media(@PathVariable("turma") String turma,
                                     @PathVariable("nome") String nome) { ... }` },
    { t: 'ResponseEntity e status HTTP', c: `import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

return ResponseEntity.ok(obj);                                  // 200
return ResponseEntity.status(HttpStatus.CREATED).body(obj);     // 201
return ResponseEntity.noContent().build();                      // 204 sem corpo
return ResponseEntity.badRequest().body("Nome é obrigatório");  // 400
return ResponseEntity.notFound().build();                       // 404 sem corpo
return ResponseEntity.status(HttpStatus.CONFLICT).body(obj);    // 409

// tipo de retorno: ResponseEntity<Contato>, ResponseEntity<Void> (sem corpo)
// ou ResponseEntity<Object> quando pode voltar objeto OU mensagem` },
    { t: '@RequestBody (JSON no corpo)', c: `// POST /pedidos   corpo: {"cliente":"Ana","itens":[{"produto":"Caneta","quantidade":3}]}
@PostMapping("/pedidos")
public ResponseEntity<Object> criar(@RequestBody Pedido pedido) {
    pedido.getCliente();   // "Ana"
    pedido.getItens();     // List<ItemPedido> já preenchida
    ...
}
// Pedido precisa de construtor vazio + getters/setters
// JSON simples também pode virar Map:
public ResponseEntity<Object> criar(@RequestBody Map<String, String> corpo) {
    String url = corpo.get("url");
}` },
    { t: 'Códigos de status mais usados', d: '**200** OK · **201** Created (criou) · **204** No Content (apagou) · **400** Bad Request (dados inválidos) · **404** Not Found · **405** Method Not Allowed · **409** Conflict (já existe) · **500** erro no servidor' },
    { t: 'Executar', c: `$ ./gradlew bootRun
$ ./gradlew bootRun --args='--server.port=8090'
# build.gradle:  bootRun { args = ['--server.port=8090'] }`, lang: 'sh' },
    { t: 'ApplicationRunner', c: `@Component
public class CrudRunner implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (args.containsOption("createdb")) {
            String v = args.getOptionValues("createdb").get(0);
        }
    }
}` },
  ]},
  { id: 'sql', group: 'web', title: 'SQL (CRUD)', items: [
    { t: 'CREATE', c: `INSERT INTO users (username, email, is_active)
VALUES ('john_doe', 'john@example.com', true);`, lang: 'sql' },
    { t: 'READ', c: `SELECT * FROM users WHERE is_active = true;
SELECT username, email FROM users ORDER BY username;`, lang: 'sql' },
    { t: 'UPDATE', c: `UPDATE users SET last_login = '2024-08-24 12:30:00'
WHERE username = 'john_doe';`, lang: 'sql' },
    { t: 'DELETE', c: `DELETE FROM users WHERE username = 'john_doe';
-- sem WHERE apaga TODAS as linhas!`, lang: 'sql' },
  ]},
  { id: 'jpa', group: 'web', title: 'JPA / Hibernate', items: [
    { t: 'application.properties', c: `spring.datasource.url=jdbc:mysql://localhost:3306/NOME_DB
spring.datasource.username=USERNAME
spring.datasource.password=SENHA
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true`, lang: 'sh' },
    { t: 'Entidade', c: `@Entity
public class User {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Integer id;
    private String username;
    // getters e setters
}` },
    { t: 'Repositório', c: `public interface UserRepository extends CrudRepository<User, Integer> {
    // findAll(), findById(), save(), delete() já existem
    Iterable<User> findByUsername(String username);
    Integer countDistinctByUsername(String username);
}` },
    { t: 'Controller CRUD', c: `@RestController
@RequestMapping(path="/users")
public class MainController {
    @Autowired
    private UserRepository userRepository;

    @PostMapping(path="/create")
    public User create(@RequestParam String username) {
        User u = new User(); u.setUsername(username);
        return userRepository.save(u);
    }
    @GetMapping(path="/all")
    public Iterable<User> all() { return userRepository.findAll(); }

    @PutMapping(path="/update/{id}")
    public User update(@PathVariable("id") Integer id, @RequestParam String firstName) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isPresent()) {
            User u = opt.get(); u.setFirstName(firstName);
            return userRepository.save(u);
        }
        return new User();
    }
    @DeleteMapping(path="/delete/{id}")
    public Boolean delete(@PathVariable("id") Integer id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isPresent()) { userRepository.delete(opt.get()); return true; }
        return false;
    }
}` },
    { t: 'Camadas e dependências', d: 'Controller → Service (opcional) → Repository → Entity → BD. Dependências: **Spring Web**, **Spring Data JPA**, **MySQL Driver**. `CommandLineRunner` roda código ao iniciar (ex: criar usuários).' },
  ]},
  { id: 'html', group: 'front', title: 'HTML5', items: [
    { t: 'Estrutura base', c: `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="estilo.css">
  <title>Título (obrigatório)</title>
</head>
<body>
  <!-- conteúdo -->
  <script src="js/app.js"></script>
</body>
</html>`, lang: 'html' },
    { t: 'Texto', c: `<h1>Título principal (só 1)</h1>  <h2>…</h2> … <h6>
<p>Parágrafo</p>  <br>  <hr>
<strong>ênfase</strong> <b>negrito</b> <i>itálico</i> <u>sublinhado</u>
<small>menor</small> H<sub>2</sub>O  x<sup>2</sup>
<!-- comentário -->`, lang: 'html' },
    { t: 'Links e imagens', c: `<a href="https://www.google.com">Link</a>
<a href="mailto:deitel@deitel.com">E-mail</a>
<img src="img/foto.jpg" alt="descrição" width="120" height="90">`, lang: 'html' },
    { t: 'Listas e tabelas', c: `<ul><li>item</li></ul>     <ol><li>1º</li></ol>
<table>
  <caption>Notas</caption>
  <thead><tr><th>Nome</th><th>Nota</th></tr></thead>
  <tbody><tr><td>Ana</td><td>9</td></tr></tbody>
</table>`, lang: 'html' },
    { t: 'Formulário', c: `<form action="http://localhost:8080/users/create" method="POST">
  <label for="nome">Nome:</label>
  <input type="text" id="nome" name="nome" required>
  <input type="email" name="email" placeholder="name@domain.com">
  <input type="password" name="senha">
  <input type="date" name="nascimento">
  <input type="tel" name="telefone">
  <input type="number" name="idade" min="0">
  <textarea name="obs" rows="4" cols="50"></textarea>

  <input type="checkbox" id="op1" name="op-design" value="design">
  <label for="op1">Design</label>

  <input type="radio" id="r1" name="origem" value="busca">
  <label for="r1">Busca</label>
  <input type="radio" id="r2" name="origem" value="amigo">
  <label for="r2">Amigo</label>

  <select name="nota" id="nota">
    <option value="10">10</option>
    <option value="9">9</option>
  </select>
  <input type="submit" value="Enviar">
</form>`, lang: 'html' },
    { t: 'Lembretes', d: '`name` = chave enviada ao servidor · `id` = ligação com `label for`, CSS e JS · radios do mesmo grupo têm o mesmo `name` · `<img>` exige `src` e `alt`.' },
  ]},
  { id: 'css', group: 'front', title: 'CSS3', items: [
    { t: 'Vínculo', c: `<h2 style="font-size: 24pt;">Inline</h2>
<style> h2 { font-size: 18pt; } </style>          <!-- embutido -->
<link rel="stylesheet" href="style.css">          <!-- externo -->`, lang: 'html' },
    { t: 'Seletores', c: `p { }            /* tag */
#navbar { }      /* id */
.test { }        /* classe */
a[target] { }    /* atributo */
a:hover { }      /* pseudo-classe */
p::before { }    /* pseudo-elemento */
div p { }        /* descendente */
div > h2 { }     /* filho direto */
h3 + p { }       /* próximo irmão */
h3 ~ p { }       /* irmãos seguintes */
h1, h2 { }       /* grupo */` },
    { t: 'Especificidade', d: '`!important` > inline > **#id** > **.classe / :pseudo / [atributo]** > **elemento / ::pseudo-elemento**. Empate → a **última** regra vence. Herdam: cor, fonte, texto, listas. Não herdam: layout, tamanho, borda, background, espaçamento (use `inherit` para forçar).' },
    { t: 'Box model', c: `.caixa {
  width: 200px;              /* conteúdo */
  padding: 10px;             /* interno */
  border: 2px solid #333;    /* borda */
  margin: 20px;              /* externo */
}  /* largura visível = 200 + 2*10 + 2*2 = 224px */
* { box-sizing: border-box; }  /* width passa a incluir padding+borda */` },
    { t: 'TRBL', c: `margin: 10px;                  /* todos */
margin: 10px 20px;             /* vertical | horizontal */
margin: 10px 20px 30px;        /* top | laterais | bottom */
margin: 10px 20px 30px 40px;   /* top right bottom left */
margin: 0 auto;                /* centraliza bloco */` },
    { t: 'Cores e unidades', c: `color: red;  color: #FF0000;  color: rgb(255, 0, 0);
color: rgba(255, 0, 0, 0.5);  color: hsl(0, 100%, 50%);
/* px | em (fonte do elemento) | rem (fonte da raiz)
   %  (do pai) | vw / vh (1% da janela) */` },
    { t: 'Texto, fundo e borda', c: `font-family: Arial, sans-serif;  font-size: 16px;
font-weight: bold;  font-style: italic;
text-align: center;  text-decoration: none;  line-height: 1.5;
background: white url(img/bg.gif) no-repeat;
background-position: 300px 60px;
border-radius: 50%;   /* círculo (stories do Instagram) */
overflow: hidden | scroll | auto | visible;` },
    { t: 'Layout', c: `display: block | inline | inline-block | none | flex | grid;
float: left | right | none;
position: static | relative | absolute | fixed;  z-index: 10;

.flex { display: flex; justify-content: space-between;
        align-items: center; gap: 10px; flex-wrap: wrap; }
.grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }` },
    { t: 'Responsivo', c: `@media (max-width: 600px) {     /* celular */
  .coluna { width: 100%; }
}
@media (min-width: 601px) and (max-width: 1024px) { /* tablet */ }` },
  ]},
  { id: 'js', group: 'front', title: 'JavaScript', items: [
    { t: 'Vínculo', c: `<script src="js/arquivo.js"></script>          <!-- externo -->
<script> console.log("embutido"); </script>
<input type="button" value="clickMe" onClick='alert("Olá!")'>  <!-- inline -->`, lang: 'html' },
    { t: 'Variáveis e tipos', c: `var i = 5;  let x = 1;  const PI = 3.14;
typeof "a"        // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof {}         // "object"
typeof []         // "object"
typeof function(){} // "function"
var y;  // undefined` },
    { t: 'Operadores', c: `"5" + 3    // "53"  (concatena)
"5" - 3    // 2
5 == "5"   // true  (converte)
5 === "5"  // false (valor e tipo)
parseInt("42");  parseFloat("3.5");  Number("7");` },
    { t: 'Funções e controle', c: `function soma(a, b) { return a + b; }
const dobro = (n) => n * 2;
for (let i = 0; i < 10; i++) { }
for (const item of lista) { }
if (a > b) { } else { }` },
    { t: 'Arrays', c: `var v = [10, 9, 1];
v.push(4);  v.pop();  v.length;
v.sort((a, b) => a - b);   // numérico! (sort() puro ordena como texto)
v.indexOf(9);  v.includes(9);  v.join(", ");
v.map(x => x * 2);  v.filter(x => x > 5);  v.splice(i, 1); // remove` },
    { t: 'Strings e Math', c: `s.length  s.toUpperCase()  s.indexOf("a")  s.slice(0, 3)
s.replace(/\\D/g, "")   // só dígitos
s.split(",")  s.trim()  s.includes("x")
Math.random()  Math.floor(x)  Math.round(x)  Math.max(a, b)` },
    { t: 'Pop-ups', c: `alert("Mensagem");
var ok = confirm("Tem certeza?");
var nome = prompt("Seu nome:");` },
    { t: 'DOM', c: `var el = document.getElementById("saida");
var p  = document.querySelector(".classe");
var ps = document.querySelectorAll("li");
el.textContent = "texto";
el.innerHTML = "<b>html</b>";
el.style.color = "red";
el.classList.add("ativo");
var input = document.getElementById("nome").value;
var li = document.createElement("li");
lista.appendChild(li);  li.remove();` },
    { t: 'Eventos', c: `btn.addEventListener("click", function (e) { ... });
form.addEventListener("submit", function (e) {
  e.preventDefault();   // não recarrega a página
});
// outros: "change", "input", "keyup", "mouseover", "load"` },
    { t: 'jQuery', c: `<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>
$(document).ready(function () {
  $("button").click(function () {
    $(".frt").add(".br").addClass("selected");
  });
  $("#minha-lista").css("color", "blue");
  $("#minha-lista").html("<span>Tabela</span>");
  var t = $("body").text();
  $.each(myArray, function (index, value) {
    $("#minha-lista").append("<div>" + value + "</div>");
  });
});`, lang: 'js' },
  ]},
];
