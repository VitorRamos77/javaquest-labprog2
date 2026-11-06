/* =========================================================
   TRILHA 2 — JAVA WEB (Spring Boot, Banco de Dados, HTML, CSS, JS)
   kind: 'spring' -> Java com Spring/JPA simulados (runtime/MiniSpring.java)
         'sql'    -> SQLite no navegador (sql.js)
         'html' | 'css' | 'js' -> iframe com testes no DOM
   ========================================================= */
window.PHASES = window.PHASES || [];

/* ------------------------------------------------------------------ SPRING */

PHASES.push({
  id: 's01', track: 'web', icon: '🌱', level: 3, kind: 'spring',
  title: 'Primeira API Spring', subtitle: '@RestController, @GetMapping, @RequestParam e @PathVariable',
  cola: ['spring'],
  theory: [
    '`@SpringBootApplication` marca a classe principal; o `main` chama `SpringApplication.run(...)`.',
    '`@RestController` transforma a classe num controlador REST: o retorno dos métodos vira a resposta HTTP.',
    '`@GetMapping("/home")` liga a URL ao método (o nome do método não importa).',
    '`@RequestParam String nome` lê `?nome=Ana`; `@PathVariable("a") int a` lê `/soma/{a}/{b}`.',
  ],
  task: 'Crie o `HomeController` com três endpoints GET:\n- `/home` → `"Welcome home!"`\n- `/saudacao?nome=Ana` → `"Olá, Ana!"`\n- `/soma/{a}/{b}` → a soma dos dois inteiros (ex: `/soma/2/3` → `5`)\n\nUse o painel **Requisições** para testar sua API como faria no navegador/Postman.',
  files: [
    { name: 'HomeController.java', code: `import org.springframework.web.bind.annotation.*;

// anote a classe e crie os métodos
public class HomeController {

}
` },
    { name: 'OnepageApplication.java', code: `import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OnepageApplication {
    public static void main(String[] args) {
        SpringApplication.run(OnepageApplication.class, args);
    }
}
` },
  ],
  requests: 'GET /home\nGET /saudacao?nome=Ana\nGET /soma/2/3',
  hints: ['`@RestController public class HomeController { @GetMapping("/home") public String home() { return "Welcome home!"; } }`', '`@GetMapping("/saudacao") public String saudacao(@RequestParam String nome) { ... }`', '`@GetMapping("/soma/{a}/{b}") public int soma(@PathVariable("a") int a, @PathVariable("b") int b)`'],
  test: `
QT.test("Existe um @RestController com rotas", () -> QT.isTrue(MiniSpring.hasController(), "Nenhuma rota encontrada: anote a classe com @RestController e os métodos com @GetMapping."));
QT.test("GET /home → \\"Welcome home!\\"", () -> { MiniSpring.Response r = MiniSpring.get("/home"); QT.eq(200, r.status); QT.eq("Welcome home!", r.body); });
QT.test("GET /saudacao?nome=Ana → \\"Olá, Ana!\\"", () -> QT.eq("Olá, Ana!", MiniSpring.get("/saudacao?nome=Ana").body));
QT.test("GET /saudacao?nome=Vanzan → \\"Olá, Vanzan!\\"", () -> QT.eq("Olá, Vanzan!", MiniSpring.get("/saudacao?nome=Vanzan").body));
QT.test("GET /saudacao sem nome → 400 (parâmetro obrigatório)", () -> QT.eq(400, MiniSpring.get("/saudacao").status));
QT.test("GET /soma/2/3 → 5", () -> QT.eq(5, MiniSpring.get("/soma/2/3").body));
QT.test("GET /soma/-10/4 → -6", () -> QT.eq(-6, MiniSpring.get("/soma/-10/4").body));
QT.test("POST /home → 405 (só GET)", () -> QT.eq(405, MiniSpring.post("/home", MiniSpring.params()).status));`,
  solution: [
    { name: 'HomeController.java', code: `import org.springframework.web.bind.annotation.*;

@RestController
public class HomeController {

    @GetMapping("/home")
    public String home() {
        return "Welcome home!";
    }

    @GetMapping("/saudacao")
    public String saudacao(@RequestParam String nome) {
        return "Olá, " + nome + "!";
    }

    @GetMapping("/soma/{a}/{b}")
    public int soma(@PathVariable("a") int a, @PathVariable("b") int b) {
        return a + b;
    }
}
` },
    { name: 'OnepageApplication.java', code: `import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OnepageApplication {
    public static void main(String[] args) {
        SpringApplication.run(OnepageApplication.class, args);
    }
}
` },
  ],
});

PHASES.push({
  id: 's02', track: 'web', icon: '🧮', level: 3, kind: 'spring',
  title: 'API de Fatorial', subtitle: 'Retornando JSON com HashMap',
  cola: ['spring'],
  theory: [
    'O Spring **serializa** o retorno: um `HashMap` vira um objeto JSON.',
    'Exercício resolvido da aula: `/fatorial/5` → `{"number": 5, "fatNumber": 120}`.',
    'Use `HashMap<String, Object>` quando os valores tiverem tipos diferentes (número ou texto de erro).',
  ],
  task: 'Crie o `FatorialController` com `GET /fatorial/{number}` que retorna um JSON com `number` e `fatNumber` (use `long`, até 20!).\nSe o número for **negativo**, retorne `{"erro": "Número negativo"}`.',
  files: [
    { name: 'FatorialController.java', code: `import java.util.HashMap;
import org.springframework.web.bind.annotation.*;

@RestController
public class FatorialController {

}
` },
  ],
  requests: 'GET /fatorial/5\nGET /fatorial/20\nGET /fatorial/-1',
  hints: ['`@GetMapping("/fatorial/{number}") public HashMap<String, Object> fatorial(@PathVariable("number") Integer number)`', '`HashMap<String, Object> r = new HashMap<>(); r.put("number", number); r.put("fatNumber", fat); return r;`'],
  test: `
QT.test("GET /fatorial/5 → {fatNumber: 120, number: 5}", () -> QT.eq("{\\"fatNumber\\":120,\\"number\\":5}", MiniSpring.get("/fatorial/5").json));
QT.test("GET /fatorial/0 → fatNumber 1", () -> QT.eq("{\\"fatNumber\\":1,\\"number\\":0}", MiniSpring.get("/fatorial/0").json));
QT.test("GET /fatorial/20 → 2432902008176640000 (long)", () -> QT.eq("{\\"fatNumber\\":2432902008176640000,\\"number\\":20}", MiniSpring.get("/fatorial/20").json));
QT.test("GET /fatorial/-3 → {erro: Número negativo}", () -> QT.eq("{\\"erro\\":\\"Número negativo\\"}", MiniSpring.get("/fatorial/-3").json));
QT.test("GET /fatorial/abc → 400", () -> QT.eq(400, MiniSpring.get("/fatorial/abc").status));`,
  solution: [
    { name: 'FatorialController.java', code: `import java.util.HashMap;
import org.springframework.web.bind.annotation.*;

@RestController
public class FatorialController {

    @GetMapping("/fatorial/{number}")
    public HashMap<String, Object> fatorial(@PathVariable("number") Integer number) {
        HashMap<String, Object> r = new HashMap<>();
        if (number < 0) {
            r.put("erro", "Número negativo");
            return r;
        }
        long fat = 1;
        for (int i = 2; i <= number; i++) fat *= i;
        r.put("number", number);
        r.put("fatNumber", fat);
        return r;
    }
}
` },
  ],
});

PHASES.push({
  id: 's03', track: 'web', icon: '👥', level: 4, kind: 'spring',
  title: 'API de Usuários + ApiResponse<T>', subtitle: '@RequestMapping, POST e classe genérica de resposta',
  cola: ['spring', 'generics'],
  theory: [
    '`@RequestMapping("/users")` na classe é **prefixo** de todas as rotas do controller.',
    'Objetos com getters viram JSON: `new User(1, "admin", ...)` → `{"id":1,"username":"admin",...}`.',
    'Exercício da aula: uma classe genérica `ApiResponse<T>` com `message` e `data` padroniza as respostas.',
    '`@PostMapping("/create")` + `@RequestParam` recebe os campos de um formulário.',
  ],
  task: '1. Crie `ApiResponse<T>` com atributos privados `message` (String) e `data` (T), construtor `(message, data)` e getters.\n2. Em `UserController` (prefixo `/users`), mantenha um `ArrayList<User>` iniciado com `User(1, "admin", "admin@app.com")` e `User(2, "vanzan", "vanzan@ime.eb.br")`:\n- `GET /users` → `ApiResponse("sucesso", lista)`\n- `GET /users/{id}` → `ApiResponse("sucesso", user)` ou `ApiResponse("Usuário não encontrado", null)`\n- `POST /users/create` (params `username`, `email`) → cria com id = tamanho da lista + 1 e retorna `ApiResponse("Usuário criado", novo)`',
  files: [
    { name: 'ApiResponse.java', code: `public class ApiResponse<T> {

}
` },
    { name: 'UserController.java', code: `import java.util.ArrayList;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private ArrayList<User> users = new ArrayList<>();

    public UserController() {
        users.add(new User(1, "admin", "admin@app.com"));
        users.add(new User(2, "vanzan", "vanzan@ime.eb.br"));
    }

    // crie os endpoints aqui
}
` },
    { name: 'User.java', readonly: true, code: `public class User {
    private Integer id;
    private String username;
    private String email;

    public User(Integer id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public Integer getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
}
` },
  ],
  requests: 'GET /users\nGET /users/2\nPOST /users/create username=ana&email=ana@ime.eb.br\nGET /users/3\nGET /users/99',
  hints: ['`@GetMapping("/{id}") public ApiResponse<User> byId(@PathVariable("id") Integer id)`', 'Para o "todos": `@GetMapping` sem caminho (ou `@GetMapping("")`).', 'Compare ids com `u.getId().equals(id)`.'],
  test: `
QT.test("ApiResponse é genérica e tem getters", () -> {
    QT.eq(1, QT.cls("ApiResponse").getTypeParameters().length);
    Object r = QT.make("ApiResponse", "ok", (Object) "x");
    QT.eq("ok", QT.callM(r, "getMessage")); QT.eq("x", QT.callM(r, "getData"));
});
QT.test("GET /users → 2 usuários com message sucesso", () -> QT.eq("{\\"data\\":[{\\"email\\":\\"admin@app.com\\",\\"id\\":1,\\"username\\":\\"admin\\"},{\\"email\\":\\"vanzan@ime.eb.br\\",\\"id\\":2,\\"username\\":\\"vanzan\\"}],\\"message\\":\\"sucesso\\"}", MiniSpring.get("/users").json));
QT.test("GET /users/2 → vanzan", () -> QT.eq("{\\"data\\":{\\"email\\":\\"vanzan@ime.eb.br\\",\\"id\\":2,\\"username\\":\\"vanzan\\"},\\"message\\":\\"sucesso\\"}", MiniSpring.get("/users/2").json));
QT.test("GET /users/99 → Usuário não encontrado", () -> QT.eq("{\\"data\\":null,\\"message\\":\\"Usuário não encontrado\\"}", MiniSpring.get("/users/99").json));
QT.test("POST /users/create cria o usuário 3", () -> QT.eq("{\\"data\\":{\\"email\\":\\"ana@ime.eb.br\\",\\"id\\":3,\\"username\\":\\"ana\\"},\\"message\\":\\"Usuário criado\\"}", MiniSpring.post("/users/create", MiniSpring.params("username", "ana", "email", "ana@ime.eb.br")).json));
QT.test("Depois do POST, GET /users/3 encontra ana", () -> QT.eq("{\\"data\\":{\\"email\\":\\"ana@ime.eb.br\\",\\"id\\":3,\\"username\\":\\"ana\\"},\\"message\\":\\"sucesso\\"}", MiniSpring.get("/users/3").json));
QT.test("POST sem email → 400", () -> QT.eq(400, MiniSpring.post("/users/create", MiniSpring.params("username", "x")).status));`,
  solution: [
    { name: 'ApiResponse.java', code: `public class ApiResponse<T> {
    private String message;
    private T data;

    public ApiResponse(String message, T data) {
        this.message = message;
        this.data = data;
    }

    public String getMessage() { return message; }
    public T getData() { return data; }
}
` },
    { name: 'UserController.java', code: `import java.util.ArrayList;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private ArrayList<User> users = new ArrayList<>();

    public UserController() {
        users.add(new User(1, "admin", "admin@app.com"));
        users.add(new User(2, "vanzan", "vanzan@ime.eb.br"));
    }

    @GetMapping
    public ApiResponse<ArrayList<User>> all() {
        return new ApiResponse<>("sucesso", users);
    }

    @GetMapping("/{id}")
    public ApiResponse<User> byId(@PathVariable("id") Integer id) {
        for (User u : users) {
            if (u.getId().equals(id)) return new ApiResponse<>("sucesso", u);
        }
        return new ApiResponse<>("Usuário não encontrado", null);
    }

    @PostMapping("/create")
    public ApiResponse<User> create(@RequestParam String username, @RequestParam String email) {
        User u = new User(users.size() + 1, username, email);
        users.add(u);
        return new ApiResponse<>("Usuário criado", u);
    }
}
` },
    { name: 'User.java', readonly: true, code: `public class User {
    private Integer id;
    private String username;
    private String email;

    public User(Integer id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public Integer getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
}
` },
  ],
});

PHASES.push({
  id: 's04', track: 'web', icon: '🗄️', level: 5, kind: 'spring',
  title: 'CRUD com JPA/Hibernate', subtitle: '@Entity, CrudRepository, @Autowired e Optional',
  cola: ['jpa', 'spring', 'http'],
  theory: [
    '`@Entity` + `@Id` + `@GeneratedValue` transformam a classe numa tabela (o Hibernate gera o id).',
    '`interface UserRepository extends CrudRepository<User, Integer>` — o Spring implementa sozinho `save`, `findAll`, `findById`, `delete`… e métodos pelo nome, como `findByUsername`.',
    '`@Autowired private UserRepository userRepository;` — injeção de dependência.',
    '`findById` retorna `Optional<User>`: use `isPresent()` e `get()`.',
    'Aqui o banco é **simulado em memória**, mas o código é o mesmo que roda com MySQL.',
  ],
  task: 'Monte o CRUD da aula (prefixo `/users`):\n1. Em `User`, adicione as anotações de entidade e chave gerada.\n2. Crie `UserRepository` com `Iterable<User> findByUsername(String username)`.\n3. No `MainController`:\n- `POST /users/create` (username, email, firstName, lastName) → `{"status": "ok", "message": "User created"}`\n- `GET /users/all` → todos\n- `GET /users/search/{username}` → `findByUsername`\n- `PUT /users/update/{id}` (firstName, lastName) → usuário atualizado, ou `new User()` se não existir\n- `DELETE /users/delete/{id}` → `true` se apagou, `false` se não existia',
  files: [
    { name: 'User.java', code: `import jakarta.persistence.*;

// anote a entidade
public class User {
    // anote a chave primária gerada automaticamente
    private Integer id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
}
` },
    { name: 'UserRepository.java', code: `import org.springframework.data.repository.CrudRepository;

public interface UserRepository {

}
` },
    { name: 'MainController.java', code: `import java.util.HashMap;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/users")
public class MainController {

    @Autowired
    private UserRepository userRepository;

    // C - CREATE - POST

    // R - READ - GET

    // U - UPDATE - PUT

    // D - DELETE - DELETE
}
` },
  ],
  requests: 'POST /users/create username=john_doe&email=john@example.com&firstName=John&lastName=Doe\nPOST /users/create username=vanzan&email=vanzan@ime.eb.br&firstName=Matheus&lastName=Vanzan\nGET /users/all\nGET /users/search/john_doe\nPUT /users/update/1 firstName=Johnny&lastName=D\nDELETE /users/delete/2\nGET /users/all',
  hints: ['`@Entity public class User { @Id @GeneratedValue(strategy = GenerationType.AUTO) private Integer id; ... }`', '`public interface UserRepository extends CrudRepository<User, Integer> { Iterable<User> findByUsername(String username); }`', 'Update: `Optional<User> opt = userRepository.findById(id); if (opt.isPresent()) { User u = opt.get(); u.setFirstName(firstName); ... userRepository.save(u); return u; } return new User();`'],
  test: `
QT.test("User tem @Entity e @Id", () -> {
    Class<?> u = QT.cls("User");
    QT.isTrue(u.isAnnotationPresent(jakarta.persistence.Entity.class) || u.isAnnotationPresent(javax.persistence.Entity.class), "Falta @Entity na classe User");
    boolean id = false;
    for (java.lang.reflect.Field f : u.getDeclaredFields()) if (f.isAnnotationPresent(jakarta.persistence.Id.class) || f.isAnnotationPresent(javax.persistence.Id.class)) id = true;
    QT.isTrue(id, "Falta @Id no atributo id");
});
QT.test("UserRepository estende CrudRepository<User, Integer>", () -> QT.isTrue(org.springframework.data.repository.CrudRepository.class.isAssignableFrom(QT.cls("UserRepository")), "UserRepository deve estender CrudRepository<User, Integer>"));
QT.test("POST /users/create → status ok", () -> {
    MiniSpring.Response r = MiniSpring.post("/users/create", MiniSpring.params("username", "john_doe", "email", "john@example.com", "firstName", "John", "lastName", "Doe"));
    QT.eq("{\\"message\\":\\"User created\\",\\"status\\":\\"ok\\"}", r.json);
    MiniSpring.post("/users/create", MiniSpring.params("username", "vanzan", "email", "vanzan@ime.eb.br", "firstName", "Matheus", "lastName", "Vanzan"));
});
QT.test("GET /users/all → 2 usuários com ids 1 e 2", () -> QT.eq("[{\\"email\\":\\"john@example.com\\",\\"firstName\\":\\"John\\",\\"id\\":1,\\"lastName\\":\\"Doe\\",\\"username\\":\\"john_doe\\"},{\\"email\\":\\"vanzan@ime.eb.br\\",\\"firstName\\":\\"Matheus\\",\\"id\\":2,\\"lastName\\":\\"Vanzan\\",\\"username\\":\\"vanzan\\"}]", MiniSpring.get("/users/all").json));
QT.test("GET /users/search/vanzan → só o vanzan", () -> QT.eq("[{\\"email\\":\\"vanzan@ime.eb.br\\",\\"firstName\\":\\"Matheus\\",\\"id\\":2,\\"lastName\\":\\"Vanzan\\",\\"username\\":\\"vanzan\\"}]", MiniSpring.get("/users/search/vanzan").json));
QT.test("PUT /users/update/1 altera nome", () -> {
    MiniSpring.Response r = MiniSpring.put("/users/update/1", MiniSpring.params("firstName", "Johnny", "lastName", "D"));
    QT.eq("{\\"email\\":\\"john@example.com\\",\\"firstName\\":\\"Johnny\\",\\"id\\":1,\\"lastName\\":\\"D\\",\\"username\\":\\"john_doe\\"}", r.json);
    QT.isTrue(MiniSpring.get("/users/all").json.contains("Johnny"), "A alteração não foi salva no repositório (faltou save?)");
});
QT.test("PUT em id inexistente → User vazio", () -> QT.eq("{\\"email\\":null,\\"firstName\\":null,\\"id\\":null,\\"lastName\\":null,\\"username\\":null}", MiniSpring.put("/users/update/99", MiniSpring.params("firstName", "X", "lastName", "Y")).json));
QT.test("DELETE /users/delete/2 → true, depois false", () -> {
    QT.eq(true, MiniSpring.delete("/users/delete/2").body);
    QT.eq(false, MiniSpring.delete("/users/delete/2").body);
    QT.isTrue(!MiniSpring.get("/users/all").json.contains("vanzan"), "O usuário 2 ainda aparece em /users/all");
});`,
  solution: [
    { name: 'User.java', code: `import jakarta.persistence.*;

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
}
` },
    { name: 'UserRepository.java', code: `import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, Integer> {
    Iterable<User> findByUsername(String username);
}
` },
    { name: 'MainController.java', code: `import java.util.HashMap;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/users")
public class MainController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping(path = "/create")
    public HashMap<String, String> addNewUser(@RequestParam String username, @RequestParam String email,
                                              @RequestParam String firstName, @RequestParam String lastName) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setFirstName(firstName);
        u.setLastName(lastName);
        userRepository.save(u);
        HashMap<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "User created");
        return response;
    }

    @GetMapping(path = "/all")
    public Iterable<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping(path = "/search/{username}")
    public Iterable<User> search(@PathVariable("username") String username) {
        return userRepository.findByUsername(username);
    }

    @PutMapping(path = "/update/{id}")
    public User update(@PathVariable("id") Integer id, @RequestParam String firstName, @RequestParam String lastName) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isPresent()) {
            User u = opt.get();
            u.setFirstName(firstName);
            u.setLastName(lastName);
            userRepository.save(u);
            return u;
        }
        return new User();
    }

    @DeleteMapping(path = "/delete/{id}")
    public Boolean delete(@PathVariable("id") Integer id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isPresent()) {
            userRepository.delete(opt.get());
            return true;
        }
        return false;
    }
}
` },
  ],
});

/* ------------------------------------------------------------------ SQL */

PHASES.push({
  id: 'q01', track: 'web', icon: '🐬', level: 3, kind: 'sql',
  title: 'CRUD em SQL', subtitle: 'INSERT, UPDATE, DELETE e SELECT',
  cola: ['sql'],
  theory: [
    '`INSERT INTO tabela (colunas) VALUES (valores);`',
    '`UPDATE tabela SET coluna = valor WHERE condição;` — **sem WHERE altera todas as linhas!**',
    '`DELETE FROM tabela WHERE condição;`',
    '`SELECT colunas FROM tabela WHERE condição ORDER BY coluna;`',
    'Aqui roda um SQLite no navegador; booleanos são `1`/`0` (ou `true`/`false`).',
  ],
  task: 'A tabela `users` já existe (veja os dados na aba **Tabela**). Escreva, em ordem:\n1. **INSERT** do usuário `john_doe`, email `john.doe@example.com`, `first_name` John, `last_name` Doe, ativo (`is_active = 1`);\n2. **UPDATE** desativando (`is_active = 0`) o usuário `old_user`;\n3. **DELETE** do usuário `spam_bot`;\n4. **SELECT** de `username` e `email` dos usuários **ativos**, em ordem alfabética de `username`.',
  setup: `CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  is_active INTEGER DEFAULT 1
);
INSERT INTO users (username, email, first_name, last_name, is_active) VALUES
 ('vanzan', 'vanzan@ime.eb.br', 'Matheus', 'Vanzan', 1),
 ('old_user', 'old@example.com', 'Old', 'User', 1),
 ('spam_bot', 'spam@bot.com', 'Spam', 'Bot', 1),
 ('ana', 'ana@ime.eb.br', 'Ana', 'Souza', 1),
 ('zeca', 'zeca@example.com', 'Zeca', 'Pagodinho', 0);`,
  files: [{ name: 'script.sql', code: `-- 1. INSERT

-- 2. UPDATE

-- 3. DELETE

-- 4. SELECT
` }],
  hints: ['`INSERT INTO users (username, email, first_name, last_name, is_active) VALUES (\'john_doe\', \'john.doe@example.com\', \'John\', \'Doe\', 1);`', '`UPDATE users SET is_active = 0 WHERE username = \'old_user\';`', '`SELECT username, email FROM users WHERE is_active = 1 ORDER BY username;`'],
  tests: [
    { d: 'john_doe foi inserido com o e-mail certo e ativo', t: (q) => { const r = q("SELECT email, first_name, last_name, is_active FROM users WHERE username = 'john_doe'"); return r.length === 1 && r[0][0] === 'john.doe@example.com' && r[0][1] === 'John' && r[0][2] === 'Doe' && r[0][3] == 1; } },
    { d: 'old_user está inativo', t: (q) => { const r = q("SELECT is_active FROM users WHERE username = 'old_user'"); return r.length === 1 && r[0][0] == 0; } },
    { d: 'spam_bot foi apagado', t: (q) => q("SELECT * FROM users WHERE username = 'spam_bot'").length === 0 },
    { d: 'Nenhum outro usuário foi alterado/apagado (WHERE correto)', t: (q) => { const r = q("SELECT username, is_active FROM users ORDER BY username"); return JSON.stringify(r) === JSON.stringify([['ana', 1], ['john_doe', 1], ['old_user', 0], ['vanzan', 1], ['zeca', 0]]); } },
    { d: 'O último comando é o SELECT dos ativos (username, email) em ordem', t: (q, last) => !!last && JSON.stringify(last.values) === JSON.stringify([['ana', 'ana@ime.eb.br'], ['john_doe', 'john.doe@example.com'], ['vanzan', 'vanzan@ime.eb.br']]) },
  ],
  solution: [{ name: 'script.sql', code: `-- 1. INSERT
INSERT INTO users (username, email, first_name, last_name, is_active)
VALUES ('john_doe', 'john.doe@example.com', 'John', 'Doe', 1);

-- 2. UPDATE
UPDATE users SET is_active = 0 WHERE username = 'old_user';

-- 3. DELETE
DELETE FROM users WHERE username = 'spam_bot';

-- 4. SELECT
SELECT username, email FROM users WHERE is_active = 1 ORDER BY username;
` }],
});

/* ------------------------------------------------------------------ HTML */

PHASES.push({
  id: 'h01', track: 'web', icon: '📄', level: 1, kind: 'html',
  title: 'Página HTML Básica', subtitle: 'Estrutura, títulos, listas, imagem, link e tabela',
  cola: ['html'],
  theory: [
    'Estrutura: `<!DOCTYPE html>` → `<html lang="pt-br">` → `<head>` (metadados, `<title>`) + `<body>` (conteúdo).',
    'Use **um único** `<h1>`. Listas: `<ul>`/`<ol>` + `<li>`. Tabela: `<table>`, `<tr>`, `<th>`, `<td>`.',
    '`<img>` exige `src` e `alt`. Links: `<a href="...">`, inclusive `mailto:`.',
  ],
  task: 'Crie uma página com: `<title>` preenchido, **exatamente um** `<h1>`, uma `<ul>` com **3 itens**, uma `<img>` com `src` e `alt`, um link `mailto:` e uma tabela com cabeçalho (`<th>`) e pelo menos **2 linhas** de dados.',
  files: [{ name: 'index.html', code: `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>

</body>
</html>
` }],
  hints: ['`<table><tr><th>Disciplina</th><th>Nota</th></tr><tr><td>Java</td><td>9</td></tr>...</table>`', '`<a href="mailto:aluno@ime.eb.br">Contato</a>`'],
  tests: [
    { d: '<title> preenchido', t: () => document.title.trim().length > 0 },
    { d: 'Exatamente um <h1>', t: () => document.querySelectorAll('h1').length === 1 },
    { d: '<ul> com 3 ou mais <li>', t: () => [...document.querySelectorAll('ul')].some(u => u.querySelectorAll(':scope > li').length >= 3) },
    { d: '<img> com src e alt', t: () => [...document.images].some(i => i.getAttribute('src') && i.getAttribute('alt')) },
    { d: 'Link mailto:', t: () => !!document.querySelector('a[href^="mailto:"]') },
    { d: '<table> com <th> e 2+ linhas com <td>', t: () => { const t = document.querySelector('table'); return !!t && !!t.querySelector('th') && [...t.querySelectorAll('tr')].filter(r => r.querySelector('td')).length >= 2; } },
  ],
  solution: [{ name: 'index.html', code: `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Minha página</title>
</head>
<body>
  <h1>Lab Prog II</h1>
  <ul>
    <li>Java</li>
    <li>Spring</li>
    <li>HTML</li>
  </ul>
  <img src="logo.png" alt="Logo do IME" width="120" height="120">
  <p><a href="mailto:aluno@ime.eb.br">Fale comigo</a></p>
  <table>
    <tr><th>Disciplina</th><th>Nota</th></tr>
    <tr><td>Java</td><td>9.0</td></tr>
    <tr><td>CSS</td><td>8.5</td></tr>
  </table>
</body>
</html>
` }],
});

PHASES.push({
  id: 'h02', track: 'web', icon: '📝', level: 2, kind: 'html',
  title: 'Formulário de Cadastro', subtitle: 'form, input, label, select e radio',
  cola: ['html'],
  theory: [
    '`<form action="url" method="POST">` envia os dados para o backend (o Spring).',
    'O atributo `name` é a **chave** enviada (é o que o `@RequestParam` lê). O `id` liga o `<label for="...">`.',
    'Tipos: `text`, `email`, `password`, `date`, `radio` (mesmo `name` = escolha única), `checkbox`. Também `<select>`/`<option>` e `required`.',
  ],
  task: 'Crie o formulário de cadastro que envia por **POST** para `http://localhost:8080/users/create` com:\n- `username` (texto, obrigatório, com `<label for>`);\n- `email` (type `email`, obrigatório);\n- `password` (type `password`);\n- um `<select name="perfil">` com as opções `aluno` e `professor`;\n- dois **radios** `name="turno"` com valores `manha` e `tarde`;\n- botão de envio.',
  files: [{ name: 'create.html', code: `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Create User</title>
</head>
<body>
  <h2>Create User</h2>
  <!-- crie o formulário aqui -->

</body>
</html>
` }],
  hints: ['`<label for="username">Username:</label> <input type="text" id="username" name="username" required>`', '`<input type="radio" id="t1" name="turno" value="manha"> <label for="t1">Manhã</label>`'],
  tests: [
    { d: '<form> com action correta', t: () => { const f = document.querySelector('form'); return !!f && f.getAttribute('action') === 'http://localhost:8080/users/create'; } },
    { d: 'method POST', t: () => { const f = document.querySelector('form'); return !!f && f.method === 'post'; } },
    { d: 'username: text, required e com <label for>', t: () => { const i = document.querySelector('form input[name="username"]'); return !!i && i.type === 'text' && i.required && !!i.id && !!document.querySelector('label[for="' + i.id + '"]'); } },
    { d: 'email: type email e required', t: () => { const i = document.querySelector('form input[name="email"]'); return !!i && i.type === 'email' && i.required; } },
    { d: 'password: type password', t: () => { const i = document.querySelector('form input[name="password"]'); return !!i && i.type === 'password'; } },
    { d: 'select perfil com aluno e professor', t: () => { const s = document.querySelector('form select[name="perfil"]'); if (!s) return false; const v = [...s.options].map(o => o.value); return v.includes('aluno') && v.includes('professor'); } },
    { d: 'radios turno (manha e tarde)', t: () => { const r = [...document.querySelectorAll('form input[type="radio"][name="turno"]')].map(x => x.value); return r.includes('manha') && r.includes('tarde'); } },
    { d: 'botão de envio', t: () => !!document.querySelector('form input[type="submit"], form button:not([type="button"]):not([type="reset"])') },
  ],
  solution: [{ name: 'create.html', code: `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Create User</title>
</head>
<body>
  <h2>Create User</h2>
  <form action="http://localhost:8080/users/create" method="POST">
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required><br><br>

    <label for="email">E-mail:</label>
    <input type="email" id="email" name="email" placeholder="name@domain.com" required><br><br>

    <label for="password">Password:</label>
    <input type="password" id="password" name="password"><br><br>

    <label for="perfil">Perfil:</label>
    <select id="perfil" name="perfil">
      <option value="aluno">Aluno</option>
      <option value="professor">Professor</option>
    </select><br><br>

    <input type="radio" id="t1" name="turno" value="manha"> <label for="t1">Manhã</label>
    <input type="radio" id="t2" name="turno" value="tarde"> <label for="t2">Tarde</label><br><br>

    <input type="submit" value="Create">
  </form>
</body>
</html>
` }],
});

/* ------------------------------------------------------------------ CSS */

PHASES.push({
  id: 'c01', track: 'web', icon: '🎨', level: 2, kind: 'css',
  title: 'Seletores e Box Model', subtitle: 'id, classe, tag, padding, border e margin',
  cola: ['css'],
  theory: [
    'Seletores: `#id`, `.classe`, `tag`. Especificidade: inline > id > classe > tag.',
    'Box model: largura visível = `width` + `padding` × 2 + `border` × 2 (com `box-sizing: content-box`).',
    '`display: flex` coloca os filhos lado a lado.',
  ],
  task: 'Escreva o CSS para: (1) `#titulo` com `font-size: 32px`; (2) `.destaque` vermelho (`red`) e em negrito; (3) `.caixa` com `width: 200px`, `padding: 10px` e `border: 2px solid` (largura visível = 224px); (4) `.caixa` com margem superior de `20px`; (5) o `<nav>` com `display: flex`.',
  html: `<h1 id="titulo">Notícias</h1>
<p class="destaque">Importante!</p>
<p>Texto normal</p>
<div class="caixa">Caixa</div>
<nav><a href="#">Home</a> <a href="#">Sobre</a> <a href="#">Contato</a></nav>`,
  files: [{ name: 'style.css', code: `/* escreva seu CSS aqui */
#titulo {

}
` }],
  hints: ['`.destaque { color: red; font-weight: bold; }`', '`.caixa { width: 200px; padding: 10px; border: 2px solid #333; margin-top: 20px; }`'],
  tests: [
    { d: '#titulo com font-size 32px', t: () => getComputedStyle(document.getElementById('titulo')).fontSize === '32px' },
    { d: '.destaque vermelho', t: () => getComputedStyle(document.querySelector('.destaque')).color === 'rgb(255, 0, 0)' },
    { d: '.destaque em negrito', t: () => parseInt(getComputedStyle(document.querySelector('.destaque')).fontWeight) >= 700 },
    { d: 'O parágrafo comum NÃO ficou vermelho', t: () => getComputedStyle(document.querySelectorAll('p')[1]).color !== 'rgb(255, 0, 0)' },
    { d: '.caixa com largura visível de 224px', t: () => { const s = getComputedStyle(document.querySelector('.caixa')); const w = ['width', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce((a, k) => a + parseFloat(s[k]), 0); return s.boxSizing === 'border-box' ? Math.abs(parseFloat(s.width) - 224) < 1.5 : Math.abs(w - 224) < 1.5; } },
    { d: '.caixa com margin-top 20px', t: () => getComputedStyle(document.querySelector('.caixa')).marginTop === '20px' },
    { d: '<nav> com display flex', t: () => getComputedStyle(document.querySelector('nav')).display === 'flex' },
  ],
  solution: [{ name: 'style.css', code: `#titulo {
  font-size: 32px;
}
.destaque {
  color: red;
  font-weight: bold;
}
.caixa {
  width: 200px;
  padding: 10px;
  border: 2px solid #333;
  margin: 20px 0;
}
nav {
  display: flex;
  gap: 12px;
}
` }],
});

const STORY_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f89820'/%3E%3C/svg%3E";
PHASES.push({
  id: 'c02', track: 'web', icon: '📸', level: 3, kind: 'css',
  title: 'Feed estilo Rede Social', subtitle: 'Flexbox, border-radius e imagens responsivas',
  cola: ['css'],
  theory: [
    '`display: flex` + `gap` alinha itens em linha; `flex-direction: column` empilha; `align-items: center` centraliza no eixo cruzado.',
    '`border-radius: 50%` transforma um quadrado em círculo (os stories do exercício 5 da aula).',
    '`width: 100%` faz a imagem ocupar toda a largura do elemento pai.',
  ],
  task: 'Estilize o feed:\n1. `.stories` com `display: flex` e `gap` de pelo menos 8px;\n2. cada `.story` em coluna (`flex-direction: column`) e centralizada (`align-items: center`);\n3. as imagens de `.story img` com 64×64px, **redondas** e com borda de pelo menos 2px;\n4. `.avatar` redondo;\n5. `.foto` ocupando 100% da largura do `.post`.',
  html: `<div class="stories">
  <div class="story"><img src="${STORY_IMG}" alt=""><span>ana</span></div>
  <div class="story"><img src="${STORY_IMG}" alt=""><span>bruno</span></div>
  <div class="story"><img src="${STORY_IMG}" alt=""><span>carla</span></div>
  <div class="story"><img src="${STORY_IMG}" alt=""><span>vanzan</span></div>
</div>
<div class="post">
  <div class="post-header"><img class="avatar" src="${STORY_IMG}" alt="" width="32" height="32"> <b>vanzan</b></div>
  <img class="foto" src="${STORY_IMG}" alt="foto">
  <p class="legenda">Prova de Lab Prog chegando! ☕</p>
</div>`,
  files: [{ name: 'style.css', code: `body { font-family: sans-serif; max-width: 360px; }

.stories {

}
` }],
  hints: ['`.story img { width: 64px; height: 64px; border-radius: 50%; border: 3px solid #e1306c; }`', '`.story { display: flex; flex-direction: column; align-items: center; }`', '`.foto { width: 100%; display: block; }`'],
  tests: [
    { d: '.stories com display flex', t: () => getComputedStyle(document.querySelector('.stories')).display === 'flex' },
    { d: '.stories com gap ≥ 8px', t: () => parseFloat(getComputedStyle(document.querySelector('.stories')).columnGap) >= 8 },
    { d: '.story em coluna e centralizada', t: () => { const s = getComputedStyle(document.querySelector('.story')); return s.display.includes('flex') && s.flexDirection === 'column' && s.alignItems === 'center'; } },
    { d: '.story img com 64×64px', t: () => { const r = document.querySelector('.story img').getBoundingClientRect(); const s = getComputedStyle(document.querySelector('.story img')); return Math.abs(parseFloat(s.width) - 64) < 1 && Math.abs(parseFloat(s.height) - 64) < 1 || Math.abs(r.width - 64) < 1 && Math.abs(r.height - 64) < 1; } },
    { d: '.story img redonda (border-radius 50%)', t: () => { const v = getComputedStyle(document.querySelector('.story img')).borderTopLeftRadius; return v === '50%' || parseFloat(v) >= 32; } },
    { d: '.story img com borda ≥ 2px', t: () => parseFloat(getComputedStyle(document.querySelector('.story img')).borderTopWidth) >= 1.5 },
    { d: '.avatar redondo', t: () => { const v = getComputedStyle(document.querySelector('.avatar')).borderTopLeftRadius; return v === '50%' || parseFloat(v) >= 16; } },
    { d: '.foto com 100% da largura do .post', t: () => Math.abs(document.querySelector('.foto').getBoundingClientRect().width - document.querySelector('.post').clientWidth) < 2 },
  ],
  solution: [{ name: 'style.css', code: `body { font-family: sans-serif; max-width: 360px; }

.stories {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}
.story {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
}
.story img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid #e1306c;
}
.avatar {
  border-radius: 50%;
}
.post-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.foto {
  width: 100%;
  display: block;
}
` }],
});

/* ------------------------------------------------------------------ JS */

PHASES.push({
  id: 'js1', track: 'web', icon: '🐚', level: 2, kind: 'js',
  title: 'Fibonacci em JavaScript', subtitle: 'Funções, recursão e Array global',
  cola: ['js'],
  theory: [
    'Funções: `function fib(n) { ... }`. Variáveis: `var`, `let`, `const`.',
    'Arrays crescem sozinhos em JS: `memo[n] = valor`. Posição vazia vale `undefined`.',
    'Exercício 2 da aula: guarde os valores já calculados num Array global.',
  ],
  task: 'Implemente `function fib(n)` com `fib(1) = fib(2) = 1`, usando um **Array global** `memo` para memoização. O teste exige `fib(40)` em menos de 50 ms.',
  html: `<p>Abra o console do navegador (F12) ou rode os testes.</p>`,
  files: [{ name: 'script.js', code: `var memo = [];

function fib(n) {
  // seu código aqui
}

console.log(fib(10));
` }],
  hints: ['`if (n <= 2) return 1;`', '`if (memo[n] !== undefined) return memo[n];`', '`memo[n] = fib(n - 1) + fib(n - 2); return memo[n];`'],
  tests: [
    { d: 'fib é uma função', t: () => typeof fib === 'function' },
    { d: 'fib(1) === 1 e fib(2) === 1', t: () => fib(1) === 1 && fib(2) === 1 },
    { d: 'fib(10) === 55', t: () => fib(10) === 55 },
    { d: 'fib(40) === 102334155 em < 50 ms', t: () => { const s = performance.now(); const r = fib(40); return r === 102334155 && performance.now() - s < 50; } },
  ],
  solution: [{ name: 'script.js', code: `var memo = [];

function fib(n) {
  if (n <= 2) return 1;
  if (memo[n] !== undefined) return memo[n];
  memo[n] = fib(n - 1) + fib(n - 2);
  return memo[n];
}

console.log(fib(10));
` }],
});

PHASES.push({
  id: 'js2', track: 'web', icon: '🖱️', level: 2, kind: 'js',
  title: 'Eventos e DOM', subtitle: 'getElementById, addEventListener e textContent',
  cola: ['js'],
  theory: [
    'O **DOM** é a árvore de objetos da página. `document.getElementById("x")` pega um elemento.',
    '`elemento.addEventListener("click", function () { ... })` reage a eventos.',
    'Leia inputs com `.value`; escreva texto com `.textContent`.',
  ],
  task: 'Ao clicar no botão `#btn`, escreva `Olá, NOME!` no parágrafo `#saida`, onde NOME é o valor do input `#nome`. Se o nome estiver vazio, escreva `Digite seu nome`. Use **`addEventListener`**.',
  html: `<input id="nome" placeholder="Seu nome">
<button id="btn">Saudar</button>
<p id="saida"></p>`,
  files: [{ name: 'script.js', code: `// seu código aqui
` }],
  hints: ['`document.getElementById("btn").addEventListener("click", function () { ... });`', '`var nome = document.getElementById("nome").value.trim();`'],
  tests: [
    { d: '"Ana" → "Olá, Ana!"', t: () => { document.getElementById('nome').value = 'Ana'; document.getElementById('btn').click(); return document.getElementById('saida').textContent.trim() === 'Olá, Ana!'; } },
    { d: '"Vanzan" → "Olá, Vanzan!"', t: () => { document.getElementById('nome').value = 'Vanzan'; document.getElementById('btn').click(); return document.getElementById('saida').textContent.trim() === 'Olá, Vanzan!'; } },
    { d: 'Vazio → "Digite seu nome"', t: () => { document.getElementById('nome').value = '  '; document.getElementById('btn').click(); return document.getElementById('saida').textContent.trim() === 'Digite seu nome'; } },
    { d: 'Usou addEventListener (sem onclick)', t: () => { const b = document.getElementById('btn'); return !b.hasAttribute('onclick') && b.onclick === null; } },
  ],
  solution: [{ name: 'script.js', code: `var btn = document.getElementById("btn");
btn.addEventListener("click", function () {
  var nome = document.getElementById("nome").value.trim();
  var saida = document.getElementById("saida");
  if (nome === "") {
    saida.textContent = "Digite seu nome";
  } else {
    saida.textContent = "Olá, " + nome + "!";
  }
});
` }],
});

PHASES.push({
  id: 'js3', track: 'web', icon: '🛍️', level: 3, kind: 'js',
  title: 'Carrinho de Compras', subtitle: 'createElement, appendChild, remove e Array',
  cola: ['js'],
  theory: [
    'Crie elementos com `document.createElement("li")` e insira com `lista.appendChild(li)`.',
    'Remova com `li.remove()`. Guarde os dados num Array para recalcular o total.',
    '`parseFloat("2.5")` converte texto em número; `x.toFixed(2)` formata com 2 casas.',
  ],
  task: 'Exercício 4 da aula. Ao clicar em `#add`:\n- se o nome estiver vazio ou o preço inválido (≤ 0 ou não numérico), **não** faça nada;\n- senão, adicione um `<li>` em `#lista` com o texto `NOME - R$ 0.00` e um `<button class="remover">x</button>` dentro;\n- atualize `#total` para `R$ 0.00` (soma) e **limpe** os dois inputs.\n\nO botão `.remover` apaga o item e atualiza o total.',
  html: `<input id="produto" placeholder="Produto">
<input id="preco" type="number" step="0.01" placeholder="Preço">
<button id="add">Adicionar</button>
<ul id="lista"></ul>
<p>Total: <span id="total">R$ 0.00</span></p>`,
  files: [{ name: 'script.js', code: `var itens = [];

// seu código aqui
` }],
  hints: ['Crie uma função `atualizarTotal()` que soma os preços de `itens` e escreve em `#total`.', 'Dentro do clique de "x": remova o item do array (`itens.splice(itens.indexOf(item), 1)`) e `li.remove()`.'],
  tests: [
    { d: 'Adicionar "Caneta" 2.5 → li "Caneta - R$ 2.50"', t: () => { document.getElementById('produto').value = 'Caneta'; document.getElementById('preco').value = '2.5'; document.getElementById('add').click(); const li = document.querySelectorAll('#lista li'); return li.length === 1 && li[0].textContent.includes('Caneta - R$ 2.50'); } },
    { d: 'Inputs limpos após adicionar', t: () => document.getElementById('produto').value === '' && document.getElementById('preco').value === '' },
    { d: 'Adicionar "Caderno" 15 → total R$ 17.50', t: () => { document.getElementById('produto').value = 'Caderno'; document.getElementById('preco').value = '15'; document.getElementById('add').click(); return document.querySelectorAll('#lista li').length === 2 && document.getElementById('total').textContent.trim() === 'R$ 17.50'; } },
    { d: 'Nome vazio é ignorado', t: () => { document.getElementById('produto').value = ''; document.getElementById('preco').value = '3'; document.getElementById('add').click(); return document.querySelectorAll('#lista li').length === 2; } },
    { d: 'Preço inválido é ignorado', t: () => { document.getElementById('produto').value = 'Lápis'; document.getElementById('preco').value = '0'; document.getElementById('add').click(); return document.querySelectorAll('#lista li').length === 2; } },
    { d: 'Cada li tem um botão .remover', t: () => [...document.querySelectorAll('#lista li')].every(li => li.querySelector('button.remover')) },
    { d: 'Remover a Caneta → total R$ 15.00', t: () => { document.querySelector('#lista li .remover').click(); return document.querySelectorAll('#lista li').length === 1 && document.getElementById('total').textContent.trim() === 'R$ 15.00'; } },
  ],
  solution: [{ name: 'script.js', code: `var itens = [];

function atualizarTotal() {
  var total = 0;
  for (var i = 0; i < itens.length; i++) total += itens[i].preco;
  document.getElementById("total").textContent = "R$ " + total.toFixed(2);
}

document.getElementById("add").addEventListener("click", function () {
  var nomeInput = document.getElementById("produto");
  var precoInput = document.getElementById("preco");
  var nome = nomeInput.value.trim();
  var preco = parseFloat(precoInput.value);
  if (nome === "" || isNaN(preco) || preco <= 0) return;

  var item = { nome: nome, preco: preco };
  itens.push(item);

  var li = document.createElement("li");
  li.textContent = nome + " - R$ " + preco.toFixed(2) + " ";
  var btn = document.createElement("button");
  btn.className = "remover";
  btn.textContent = "x";
  btn.addEventListener("click", function () {
    itens.splice(itens.indexOf(item), 1);
    li.remove();
    atualizarTotal();
  });
  li.appendChild(btn);
  document.getElementById("lista").appendChild(li);

  nomeInput.value = "";
  precoInput.value = "";
  atualizarTotal();
});
` }],
});

PHASES.push({
  id: 'js4', track: 'web', icon: '🪪', level: 4, kind: 'js',
  title: 'Validação de CPF', subtitle: 'Strings, laços e dígitos verificadores',
  cola: ['js'],
  theory: [
    '`cpf.replace(/\\D/g, "")` remove tudo que não é dígito.',
    '1º dígito: soma dos 9 primeiros com pesos 10..2; 2º: soma dos 10 primeiros com pesos 11..2.',
    'Dígito = `(soma * 10) % 11`; se der 10, vira 0. CPFs com todos os dígitos iguais são inválidos.',
  ],
  task: 'Exercício 5 da aula. Implemente `function validaCPF(cpf)` que retorna `true`/`false`, aceitando com ou sem pontuação. Depois, ligue ao formulário: ao enviar `#form`, mostre `CPF válido` ou `CPF inválido` em `#msg` (sem recarregar a página: `e.preventDefault()`).',
  html: `<form id="form">
  <input id="cpf" placeholder="000.000.000-00">
  <button type="submit">Validar</button>
</form>
<p id="msg"></p>`,
  files: [{ name: 'script.js', code: `function validaCPF(cpf) {
  var d = cpf.replace(/\\D/g, ""); // só dígitos
  // seu código aqui
}
` }],
  hints: ['`if (d.length !== 11 || /^(\\d)\\1+$/.test(d)) return false;`', 'Crie uma função interna `digito(qtd)` que soma `parseInt(d[i]) * (qtd + 1 - i)` para i de 0 a qtd-1.', '`document.getElementById("form").addEventListener("submit", function (e) { e.preventDefault(); ... });`'],
  tests: [
    { d: '"529.982.247-25" é válido', t: () => validaCPF('529.982.247-25') === true },
    { d: '"52998224725" (sem pontuação) é válido', t: () => validaCPF('52998224725') === true },
    { d: '"529.982.247-24" é inválido (2º dígito)', t: () => validaCPF('529.982.247-24') === false },
    { d: '"529.982.247-15" é inválido (1º dígito)', t: () => validaCPF('529.982.247-15') === false },
    { d: '"123" é inválido (tamanho)', t: () => validaCPF('123') === false },
    { d: '"111.111.111-11" é inválido (repetido)', t: () => validaCPF('111.111.111-11') === false },
    { d: 'Enviar o formulário mostra "CPF válido"/"CPF inválido"', t: () => { const f = document.getElementById('form'); document.getElementById('cpf').value = '529.982.247-25'; f.requestSubmit(); const a = document.getElementById('msg').textContent.trim(); document.getElementById('cpf').value = '123'; f.requestSubmit(); const b = document.getElementById('msg').textContent.trim(); return a === 'CPF válido' && b === 'CPF inválido'; } },
  ],
  solution: [{ name: 'script.js', code: `function validaCPF(cpf) {
  var d = cpf.replace(/\\D/g, "");
  if (d.length !== 11 || /^(\\d)\\1+$/.test(d)) return false;

  function digito(qtd) {
    var soma = 0;
    for (var i = 0; i < qtd; i++) {
      soma += parseInt(d[i]) * (qtd + 1 - i);
    }
    var r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  }
  return digito(9) === parseInt(d[9]) && digito(10) === parseInt(d[10]);
}

document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();
  var ok = validaCPF(document.getElementById("cpf").value);
  document.getElementById("msg").textContent = ok ? "CPF válido" : "CPF inválido";
});
` }],
});
