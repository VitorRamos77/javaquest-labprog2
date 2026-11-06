/* =========================================================
   TRILHA 4 — PROJETO SPRING: SISTEMA DE BIBLIOTECA
   Um projeto maior, organizado em pacotes (como um projeto real do
   start.spring.io). Cada fase evolui o mesmo projeto: o código inicial
   de uma fase é a solução da anterior + os arquivos novos.
   Os arquivos ficam em src/main/java/com/ime/biblioteca/...
   ========================================================= */
window.PHASES = window.PHASES || [];

(function () {
  const R = 'src/main/java/com/ime/biblioteca/';
  const f = (path, code, extra) => Object.assign({ name: R + path, code }, extra || {});

  /* ------------------------------------------------ arquivos por etapa */
  const APP = `package com.ime.biblioteca;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BibliotecaApplication {
    public static void main(String[] args) {
        SpringApplication.run(BibliotecaApplication.class, args);
    }
}
`;

  const LIVRO_POJO = `package com.ime.biblioteca.model;

public class Livro {
    private String titulo;
    private String autor;
    private Integer ano;

    public Livro(String titulo, String autor, Integer ano) {
        this.titulo = titulo;
        this.autor = autor;
        this.ano = ano;
    }

    public String getTitulo() { return titulo; }
    public String getAutor() { return autor; }
    public Integer getAno() { return ano; }

    @Override
    public String toString() {
        return "Livro{" + titulo + ", " + autor + ", " + ano + "}";
    }
}
`;

  const FORMATADOR = `package com.ime.biblioteca.util;

import com.ime.biblioteca.model.Livro;

public class Formatador {

    public static String citacao(Livro livro) {
        return livro.getAutor() + " (" + livro.getAno() + "). " + livro.getTitulo() + ".";
    }
}
`;

  const LIVRO_ENTITY = `package com.ime.biblioteca.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Livro {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String titulo;
    private String autor;
    private Integer ano;
    private boolean disponivel = true;

    public Livro() { }

    public Livro(String titulo, String autor, Integer ano) {
        this.titulo = titulo;
        this.autor = autor;
        this.ano = ano;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }
    public boolean isDisponivel() { return disponivel; }
    public void setDisponivel(boolean disponivel) { this.disponivel = disponivel; }

    @Override
    public String toString() {
        return "Livro{" + id + ", " + titulo + ", " + autor + ", " + ano + (disponivel ? "" : ", emprestado") + "}";
    }
}
`;

  const REPO2 = `package com.ime.biblioteca.repository;

import com.ime.biblioteca.model.Livro;
import java.util.List;
import org.springframework.data.repository.CrudRepository;

public interface LivroRepository extends CrudRepository<Livro, Long> {
    List<Livro> findByAutor(String autor);
    List<Livro> findByDisponivelTrue();
}
`;

  const REPO5 = `package com.ime.biblioteca.repository;

import com.ime.biblioteca.model.Livro;
import java.util.List;
import org.springframework.data.repository.CrudRepository;

public interface LivroRepository extends CrudRepository<Livro, Long> {
    List<Livro> findByAutor(String autor);
    List<Livro> findByDisponivelTrue();
    List<Livro> findByTituloContainingIgnoreCase(String trecho);
    long countByDisponivel(boolean disponivel);
}
`;

  const EXC = `package com.ime.biblioteca.exception;

public class LivroNaoEncontradoException extends RuntimeException {
    public LivroNaoEncontradoException(Long id) {
        super("Livro " + id + " não encontrado");
    }
}
`;

  const SERVICE3_BODY = `
    @Autowired
    private LivroRepository repository;

    public Livro cadastrar(String titulo, String autor, Integer ano) {
        if (titulo == null || titulo.isBlank() || autor == null || autor.isBlank()) {
            throw new IllegalArgumentException("Título e autor são obrigatórios");
        }
        return repository.save(new Livro(titulo, autor, ano));
    }

    public List<Livro> listarTodos() {
        List<Livro> lista = new ArrayList<>();
        for (Livro l : repository.findAll()) lista.add(l);
        return lista;
    }

    public Livro buscar(Long id) {
        Optional<Livro> opt = repository.findById(id);
        if (opt.isEmpty()) throw new LivroNaoEncontradoException(id);
        return opt.get();
    }

    public Livro emprestar(Long id) {
        Livro l = buscar(id);
        if (!l.isDisponivel()) throw new IllegalStateException("Livro já está emprestado");
        l.setDisponivel(false);
        return repository.save(l);
    }

    public Livro devolver(Long id) {
        Livro l = buscar(id);
        if (l.isDisponivel()) throw new IllegalStateException("Livro não está emprestado");
        l.setDisponivel(true);
        return repository.save(l);
    }

    public List<Livro> disponiveis() {
        return repository.findByDisponivelTrue();
    }`;

  const SERVICE_HEAD = `package com.ime.biblioteca.service;

import com.ime.biblioteca.exception.LivroNaoEncontradoException;
import com.ime.biblioteca.model.Livro;
import com.ime.biblioteca.repository.LivroRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LivroService {
`;

  const SERVICE3 = SERVICE_HEAD + SERVICE3_BODY + '\n}\n';

  const SERVICE5 = SERVICE_HEAD + SERVICE3_BODY + `

    public List<Livro> buscarPorTitulo(String trecho) {
        return repository.findByTituloContainingIgnoreCase(trecho);
    }

    public List<Livro> porAutor(String autor) {
        return repository.findByAutor(autor);
    }

    public HashMap<String, Long> estatisticas() {
        HashMap<String, Long> m = new HashMap<>();
        m.put("total", repository.count());
        m.put("disponiveis", repository.countByDisponivel(true));
        m.put("emprestados", repository.countByDisponivel(false));
        return m;
    }
}
`;

  const API = `package com.ime.biblioteca.dto;

public class ApiResponse<T> {
    private String message;
    private T data;

    public ApiResponse(String message, T data) {
        this.message = message;
        this.data = data;
    }

    public String getMessage() { return message; }
    public T getData() { return data; }
}
`;

  const CTRL_HEAD = `package com.ime.biblioteca.controller;

import com.ime.biblioteca.dto.ApiResponse;
import com.ime.biblioteca.model.Livro;
import com.ime.biblioteca.service.LivroService;
import java.util.HashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/livros")
public class LivroController {

    @Autowired
    private LivroService service;
`;
  const CTRL4_BODY = `
    @GetMapping
    public ApiResponse<List<Livro>> listar() {
        return new ApiResponse<>("ok", service.listarTodos());
    }

    @GetMapping("/{id}")
    public ApiResponse<Livro> buscar(@PathVariable("id") Long id) {
        try {
            return new ApiResponse<>("ok", service.buscar(id));
        } catch (RuntimeException e) {
            return new ApiResponse<>(e.getMessage(), null);
        }
    }

    @PostMapping
    public ApiResponse<Livro> cadastrar(@RequestParam String titulo, @RequestParam String autor, @RequestParam Integer ano) {
        try {
            return new ApiResponse<>("Livro cadastrado", service.cadastrar(titulo, autor, ano));
        } catch (IllegalArgumentException e) {
            return new ApiResponse<>(e.getMessage(), null);
        }
    }

    @PutMapping("/{id}/emprestar")
    public ApiResponse<Livro> emprestar(@PathVariable("id") Long id) {
        try {
            return new ApiResponse<>("Empréstimo realizado", service.emprestar(id));
        } catch (RuntimeException e) {
            return new ApiResponse<>(e.getMessage(), null);
        }
    }

    @PutMapping("/{id}/devolver")
    public ApiResponse<Livro> devolver(@PathVariable("id") Long id) {
        try {
            return new ApiResponse<>("Devolução realizada", service.devolver(id));
        } catch (RuntimeException e) {
            return new ApiResponse<>(e.getMessage(), null);
        }
    }

    @GetMapping("/disponiveis")
    public ApiResponse<List<Livro>> disponiveis() {
        return new ApiResponse<>("ok", service.disponiveis());
    }`;
  const CTRL4 = CTRL_HEAD + CTRL4_BODY + '\n}\n';
  const CTRL5 = CTRL_HEAD + CTRL4_BODY + `

    @GetMapping("/busca")
    public ApiResponse<List<Livro>> busca(@RequestParam String titulo) {
        return new ApiResponse<>("ok", service.buscarPorTitulo(titulo));
    }

    @GetMapping("/autor/{autor}")
    public ApiResponse<List<Livro>> porAutor(@PathVariable("autor") String autor) {
        return new ApiResponse<>("ok", service.porAutor(autor));
    }

    @GetMapping("/estatisticas")
    public HashMap<String, Long> estatisticas() {
        return service.estatisticas();
    }
}
`;

  const LOADER = `package com.ime.biblioteca.config;

import com.ime.biblioteca.model.Livro;
import com.ime.biblioteca.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private LivroRepository repository;

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            repository.save(new Livro("Java: Como Programar", "Deitel", 2017));
            repository.save(new Livro("Use a Cabeça! Java", "Sierra", 2005));
            repository.save(new Livro("Spring Boot em Ação", "Walls", 2016));
            System.out.println("Carga inicial: 3 livros criados");
        }
    }
}
`;

  // helpers de teste (Java) ----------------------------------------
  const PKG = 'com.ime.biblioteca.';
  const json = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const L = (id, titulo, autor, ano, disp) => `{"ano":${ano},"autor":"${autor}","disponivel":${disp},"id":${id},"titulo":"${titulo}"}`;
  const eqJson = (name, call, expected) => `QT.test("${name.replace(/"/g, '\\"')}", () -> QT.eq("${json(expected)}", ${call}.json));`;

  /* ================================================================ FASE 1 */
  PHASES.push({
    id: 'p01', track: 'projeto', icon: '📦', level: 2, kind: 'java',
    title: 'Pacotes e Imports', subtitle: 'Organizando o projeto em pastas: package, import e public',
    cola: ['pacotes'],
    theory: [
      'Em projetos reais o código fica em **pacotes** (pastas): `src/main/java/com/ime/biblioteca/model/Livro.java`.',
      'A 1ª linha do arquivo declara o pacote, que deve seguir a pasta: `package com.ime.biblioteca.model;`',
      'Para usar uma classe de **outro pacote**, importe-a: `import com.ime.biblioteca.model.Livro;` (logo após o `package`).',
      'Classes do mesmo pacote e de `java.lang` (String, Math…) não precisam de import.',
      'Só classes `public` podem ser usadas fora do próprio pacote (sem modificador = visível apenas no pacote).',
    ],
    task: 'O projeto da biblioteca está espalhado em pastas, mas faltam as declarações. Use o **explorador de arquivos** à esquerda do editor:\n1. Em `model/Livro.java`, declare o pacote `com.ime.biblioteca.model` e torne a classe `public`.\n2. Em `util/Formatador.java`, declare o pacote `com.ime.biblioteca.util`, importe `Livro` e implemente `citacao(livro)` → `Deitel (2017). Java: Como Programar.`\n3. Em `App.java` (pacote `com.ime.biblioteca`), faça os **imports** que faltam para compilar.',
    example: { output: 'Deitel (2017). Java: Como Programar.\nSierra (2005). Use a Cabeça! Java.' },
    files: [
      f('App.java', `package com.ime.biblioteca;

// importe aqui as classes dos outros pacotes

import java.util.ArrayList;
import java.util.List;

public class App {
    public static void main(String[] args) {
        List<Livro> livros = new ArrayList<>();
        livros.add(new Livro("Java: Como Programar", "Deitel", 2017));
        livros.add(new Livro("Use a Cabeça! Java", "Sierra", 2005));

        for (Livro l : livros) {
            System.out.println(Formatador.citacao(l));
        }
    }
}
`),
      f('model/Livro.java', `// declare o pacote (este arquivo está em com/ime/biblioteca/model)

class Livro {
    private String titulo;
    private String autor;
    private Integer ano;

    public Livro(String titulo, String autor, Integer ano) {
        this.titulo = titulo;
        this.autor = autor;
        this.ano = ano;
    }

    public String getTitulo() { return titulo; }
    public String getAutor() { return autor; }
    public Integer getAno() { return ano; }

    @Override
    public String toString() {
        return "Livro{" + titulo + ", " + autor + ", " + ano + "}";
    }
}
`),
      f('util/Formatador.java', `// declare o pacote e importe o que precisar

public class Formatador {

    public static String citacao(Livro livro) {
        // "AUTOR (ANO). TITULO."
        return "";
    }
}
`),
    ],
    run: { main: PKG + 'App', stdin: '' },
    hints: ['Primeira linha de `Livro.java`: `package com.ime.biblioteca.model;` e troque `class Livro` por `public class Livro`.', '`Formatador.java` começa com `package com.ime.biblioteca.util;` e depois `import com.ime.biblioteca.model.Livro;`', 'Em `App.java`: `import com.ime.biblioteca.model.Livro;` e `import com.ime.biblioteca.util.Formatador;`'],
    test: `
QT.test("Livro está em com.ime.biblioteca.model e é public", () -> QT.inPackage("${PKG}model.Livro"));
QT.test("Formatador está em com.ime.biblioteca.util e é public", () -> QT.inPackage("${PKG}util.Formatador"));
QT.test("App está em com.ime.biblioteca", () -> QT.inPackage("${PKG}App"));
QT.test("citacao(Livro) no formato AUTOR (ANO). TITULO.", () -> {
    Object l = QT.make("${PKG}model.Livro", "Spring Boot em Ação", "Walls", 2016);
    QT.eq("Walls (2016). Spring Boot em Ação.", QT.call("${PKG}util.Formatador", "citacao", l));
});
QT.test("App imprime as duas citações", () -> QT.linesInOrder(QT.out("${PKG}App", ""), "Deitel (2017). Java: Como Programar.", "Sierra (2005). Use a Cabeça! Java."));`,
    solution: [
      f('App.java', `package com.ime.biblioteca;

import com.ime.biblioteca.model.Livro;
import com.ime.biblioteca.util.Formatador;

import java.util.ArrayList;
import java.util.List;

public class App {
    public static void main(String[] args) {
        List<Livro> livros = new ArrayList<>();
        livros.add(new Livro("Java: Como Programar", "Deitel", 2017));
        livros.add(new Livro("Use a Cabeça! Java", "Sierra", 2005));

        for (Livro l : livros) {
            System.out.println(Formatador.citacao(l));
        }
    }
}
`),
      f('model/Livro.java', LIVRO_POJO),
      f('util/Formatador.java', FORMATADOR),
    ],
  });

  /* ================================================================ FASE 2 */
  PHASES.push({
    id: 'p02', track: 'projeto', icon: '🗃️', level: 3, kind: 'spring',
    title: 'Entidade e Repositório', subtitle: '@Entity no pacote model e CrudRepository no pacote repository',
    cola: ['pacotes', 'jpa'],
    theory: [
      'Num projeto Spring, cada camada fica num pacote: `model` (entidades), `repository`, `service`, `controller`, `dto`…',
      'A entidade vira tabela com `@Entity`, `@Id` e `@GeneratedValue`; o JPA exige um **construtor vazio**.',
      'O repositório é uma interface: `extends CrudRepository<Livro, Long>`. Métodos derivados pelo nome: `findByAutor`, `findByDisponivelTrue`…',
      'Repare nos imports entre pacotes: o repositório importa `com.ime.biblioteca.model.Livro`.',
    ],
    task: 'Transforme o projeto num projeto Spring:\n1. Em `model/Livro.java`: torne `Livro` uma entidade com `Long id` gerado, mantenha `titulo`, `autor`, `ano` e adicione `boolean disponivel` (começa `true`), com `isDisponivel()`/`setDisponivel()`, getters/setters e **construtor vazio**.\n2. Crie `repository/LivroRepository.java` (pacote `com.ime.biblioteca.repository`) estendendo `CrudRepository<Livro, Long>` com `List<Livro> findByAutor(String autor)` e `List<Livro> findByDisponivelTrue()`.\n\nO `App.java` virou `BibliotecaApplication.java` (já pronto).',
    files: [
      f('BibliotecaApplication.java', APP, { readonly: true }),
      f('model/Livro.java', LIVRO_POJO),
      f('repository/LivroRepository.java', `package com.ime.biblioteca.repository;

// imports

public interface LivroRepository {

}
`),
      f('util/Formatador.java', FORMATADOR),
    ],
    requests: '# Nesta fase ainda não há controller.\n# Rode ✔ Testar para verificar a entidade e o repositório.',
    hints: ['`@Entity public class Livro { @Id @GeneratedValue(strategy = GenerationType.AUTO) private Long id; ... private boolean disponivel = true; public Livro() { } ... }`', 'Imports da entidade: `import jakarta.persistence.*;`', '`public interface LivroRepository extends CrudRepository<Livro, Long> { List<Livro> findByAutor(String autor); List<Livro> findByDisponivelTrue(); }` — importe `Livro`, `List` e `CrudRepository`.'],
    test: `
QT.test("Livro é @Entity com @Id", () -> {
    Class<?> c = QT.cls("${PKG}model.Livro");
    QT.isTrue(c.isAnnotationPresent(jakarta.persistence.Entity.class) || c.isAnnotationPresent(javax.persistence.Entity.class), "Falta @Entity em Livro");
    boolean id = false;
    for (java.lang.reflect.Field fl : c.getDeclaredFields()) if (fl.isAnnotationPresent(jakarta.persistence.Id.class) || fl.isAnnotationPresent(javax.persistence.Id.class)) id = true;
    QT.isTrue(id, "Falta @Id no atributo id");
});
QT.test("Livro tem construtor vazio e começa disponível", () -> {
    Object l = QT.make("${PKG}model.Livro");
    QT.eq(true, QT.callM(l, "isDisponivel"));
});
QT.test("LivroRepository está em com.ime.biblioteca.repository e estende CrudRepository", () -> {
    QT.inPackage("${PKG}repository.LivroRepository");
    QT.isTrue(org.springframework.data.repository.CrudRepository.class.isAssignableFrom(QT.cls("${PKG}repository.LivroRepository")), "Deve estender CrudRepository<Livro, Long>");
});
QT.test("save gera ids 1, 2, 3 (Long)", () -> {
    Object repo = MiniSpring.bean(QT.cls("${PKG}repository.LivroRepository"));
    Object a = QT.callM(repo, "save", QT.make("${PKG}model.Livro", "Java: Como Programar", "Deitel", 2017));
    QT.callM(repo, "save", QT.make("${PKG}model.Livro", "Java para Iniciantes", "Deitel", 2020));
    QT.callM(repo, "save", QT.make("${PKG}model.Livro", "Use a Cabeça! Java", "Sierra", 2005));
    QT.eq(1L, QT.callM(a, "getId"));
    QT.eq(3L, QT.callM(repo, "count"));
});
QT.test("findByAutor(\\"Deitel\\") → 2 livros", () -> {
    Object repo = MiniSpring.bean(QT.cls("${PKG}repository.LivroRepository"));
    QT.eq(2, ((java.util.List<?>) QT.callM(repo, "findByAutor", "Deitel")).size());
});
QT.test("findByDisponivelTrue ignora emprestados", () -> {
    Object repo = MiniSpring.bean(QT.cls("${PKG}repository.LivroRepository"));
    Object l = ((java.util.Optional<?>) QT.callM(repo, "findById", 1L)).get();
    QT.callM(l, "setDisponivel", false);
    QT.callM(repo, "save", l);
    QT.eq(2, ((java.util.List<?>) QT.callM(repo, "findByDisponivelTrue")).size());
});`,
    solution: [
      f('BibliotecaApplication.java', APP, { readonly: true }),
      f('model/Livro.java', LIVRO_ENTITY),
      f('repository/LivroRepository.java', REPO2),
      f('util/Formatador.java', FORMATADOR),
    ],
  });

  /* ================================================================ FASE 3 */
  PHASES.push({
    id: 'p03', track: 'projeto', icon: '⚙️', level: 4, kind: 'spring',
    title: 'Camada de Serviço', subtitle: '@Service, regras de negócio e exceção própria',
    cola: ['pacotes', 'jpa', 'spring'],
    theory: [
      'A camada **Service** (opcional na aula, mas comum) concentra as **regras de negócio**; o controller só recebe a requisição.',
      '`@Service` marca a classe; o repositório entra com `@Autowired`.',
      'Crie suas próprias exceções estendendo `RuntimeException` (pacote `exception`) e lance com `throw new ...`.',
      '`findById` devolve `Optional`: `opt.isEmpty()` / `opt.get()`.',
    ],
    task: '1. Crie `exception/LivroNaoEncontradoException` (estende `RuntimeException`, construtor recebe o `Long id`, mensagem `Livro ID não encontrado`).\n2. Crie `service/LivroService` com `@Service` e o repositório via `@Autowired`:\n- `cadastrar(titulo, autor, ano)` → salva; título ou autor vazios → `IllegalArgumentException`\n- `listarTodos()` → `List<Livro>`\n- `buscar(Long id)` → o livro ou lança `LivroNaoEncontradoException`\n- `emprestar(Long id)` → marca indisponível; se já emprestado → `IllegalStateException`\n- `devolver(Long id)` → marca disponível; se não estava emprestado → `IllegalStateException`\n- `disponiveis()` → livros disponíveis',
    files: [
      f('BibliotecaApplication.java', APP, { readonly: true }),
      f('model/Livro.java', LIVRO_ENTITY),
      f('repository/LivroRepository.java', REPO2),
      f('exception/LivroNaoEncontradoException.java', `package com.ime.biblioteca.exception;

public class LivroNaoEncontradoException {

}
`),
      f('service/LivroService.java', `package com.ime.biblioteca.service;

// imports: Livro, LivroRepository, a exceção, List/ArrayList/Optional, Autowired e Service

public class LivroService {

}
`),
      f('util/Formatador.java', FORMATADOR),
    ],
    requests: '# Ainda não há controller. Use ✔ Testar.',
    hints: ['`public class LivroNaoEncontradoException extends RuntimeException { public LivroNaoEncontradoException(Long id) { super("Livro " + id + " não encontrado"); } }`', '`@Service public class LivroService { @Autowired private LivroRepository repository; ... }`', 'Emprestar: `Livro l = buscar(id); if (!l.isDisponivel()) throw new IllegalStateException("Livro já está emprestado"); l.setDisponivel(false); return repository.save(l);`'],
    test: `
QT.test("LivroService está em com.ime.biblioteca.service e tem @Service", () -> {
    QT.inPackage("${PKG}service.LivroService");
    QT.isTrue(QT.cls("${PKG}service.LivroService").isAnnotationPresent(org.springframework.stereotype.Service.class), "Falta @Service");
});
QT.test("LivroNaoEncontradoException estende RuntimeException", () -> {
    QT.inPackage("${PKG}exception.LivroNaoEncontradoException");
    QT.isTrue(RuntimeException.class.isAssignableFrom(QT.cls("${PKG}exception.LivroNaoEncontradoException")), "Deve estender RuntimeException");
});
QT.test("cadastrar salva e gera id", () -> {
    Object s = MiniSpring.bean(QT.cls("${PKG}service.LivroService"));
    Object l = QT.callM(s, "cadastrar", "Java: Como Programar", "Deitel", 2017);
    QT.eq(1L, QT.callM(l, "getId"));
    QT.callM(s, "cadastrar", "Use a Cabeça! Java", "Sierra", 2005);
    QT.eq(2, ((java.util.List<?>) QT.callM(s, "listarTodos")).size());
});
QT.test("cadastrar sem título → IllegalArgumentException", () -> {
    Object s = MiniSpring.bean(QT.cls("${PKG}service.LivroService"));
    QT.expectThrows("IllegalArgumentException", () -> QT.callM(s, "cadastrar", "  ", "Alguém", 2000));
});
QT.test("buscar(99) → LivroNaoEncontradoException", () -> {
    Object s = MiniSpring.bean(QT.cls("${PKG}service.LivroService"));
    Throwable t = QT.expectThrows("LivroNaoEncontradoException", () -> QT.callM(s, "buscar", 99L));
    QT.eq("Livro 99 não encontrado", t.getMessage());
});
QT.test("emprestar marca indisponível e não deixa emprestar de novo", () -> {
    Object s = MiniSpring.bean(QT.cls("${PKG}service.LivroService"));
    Object l = QT.callM(s, "emprestar", 1L);
    QT.eq(false, QT.callM(l, "isDisponivel"));
    QT.expectThrows("IllegalStateException", () -> QT.callM(s, "emprestar", 1L));
    QT.eq(1, ((java.util.List<?>) QT.callM(s, "disponiveis")).size());
});
QT.test("devolver volta a ficar disponível; devolver de novo → IllegalStateException", () -> {
    Object s = MiniSpring.bean(QT.cls("${PKG}service.LivroService"));
    QT.eq(true, QT.callM(QT.callM(s, "devolver", 1L), "isDisponivel"));
    QT.expectThrows("IllegalStateException", () -> QT.callM(s, "devolver", 1L));
});`,
    solution: [
      f('BibliotecaApplication.java', APP, { readonly: true }),
      f('model/Livro.java', LIVRO_ENTITY),
      f('repository/LivroRepository.java', REPO2),
      f('exception/LivroNaoEncontradoException.java', EXC),
      f('service/LivroService.java', SERVICE3),
      f('util/Formatador.java', FORMATADOR),
    ],
  });

  /* ================================================================ FASE 4 */
  const BOOK1 = L(1, 'Java: Como Programar', 'Deitel', 2017, true);
  PHASES.push({
    id: 'p04', track: 'projeto', icon: '🎮', level: 4, kind: 'spring',
    title: 'Controller REST', subtitle: 'Endpoints que usam o Service e respondem com ApiResponse<T>',
    cola: ['pacotes', 'spring', 'http'],
    theory: [
      'O **controller** recebe a requisição HTTP, chama o **service** e devolve a resposta — sem regra de negócio.',
      'Injete o service com `@Autowired private LivroService service;` (importe de `com.ime.biblioteca.service`).',
      'Capture as exceções do service com `try/catch` e devolva uma resposta amigável (`e.getMessage()`).',
      'Respostas padronizadas com o DTO genérico `ApiResponse<T>` (pacote `dto`).',
    ],
    task: '1. Crie `dto/ApiResponse<T>` (message + data, construtor e getters).\n2. Crie `controller/LivroController` com `@RequestMapping("/livros")`:\n- `GET /livros` → `("ok", todos)`\n- `GET /livros/{id}` → `("ok", livro)` ou `(mensagem da exceção, null)`\n- `POST /livros` (params `titulo`, `autor`, `ano`) → `("Livro cadastrado", livro)` ou `(mensagem, null)`\n- `PUT /livros/{id}/emprestar` → `("Empréstimo realizado", livro)` ou `(mensagem, null)`\n- `PUT /livros/{id}/devolver` → `("Devolução realizada", livro)` ou `(mensagem, null)`\n- `GET /livros/disponiveis` → `("ok", lista)`',
    files: [
      f('BibliotecaApplication.java', APP, { readonly: true }),
      f('controller/LivroController.java', `package com.ime.biblioteca.controller;

// imports

public class LivroController {

}
`),
      f('dto/ApiResponse.java', `package com.ime.biblioteca.dto;

public class ApiResponse<T> {

}
`),
      f('exception/LivroNaoEncontradoException.java', EXC),
      f('model/Livro.java', LIVRO_ENTITY),
      f('repository/LivroRepository.java', REPO2),
      f('service/LivroService.java', SERVICE3),
      f('util/Formatador.java', FORMATADOR),
    ],
    requests: 'POST /livros titulo=Java: Como Programar&autor=Deitel&ano=2017\nPOST /livros titulo=Use a Cabeça! Java&autor=Sierra&ano=2005\nGET /livros\nPUT /livros/1/emprestar\nPUT /livros/1/emprestar\nGET /livros/disponiveis\nGET /livros/42',
    hints: ['`@RestController @RequestMapping("/livros") public class LivroController { @Autowired private LivroService service; ... }`', '`@PostMapping public ApiResponse<Livro> cadastrar(@RequestParam String titulo, @RequestParam String autor, @RequestParam Integer ano)`', '`@PutMapping("/{id}/emprestar") ... try { return new ApiResponse<>("Empréstimo realizado", service.emprestar(id)); } catch (RuntimeException e) { return new ApiResponse<>(e.getMessage(), null); }`'],
    test: `
QT.test("LivroController em com.ime.biblioteca.controller, ApiResponse em com.ime.biblioteca.dto", () -> { QT.inPackage("${PKG}controller.LivroController"); QT.inPackage("${PKG}dto.ApiResponse"); });
${eqJson('POST /livros cadastra', 'MiniSpring.post("/livros", MiniSpring.params("titulo", "Java: Como Programar", "autor", "Deitel", "ano", "2017"))', '{"data":' + BOOK1 + ',"message":"Livro cadastrado"}')}
${eqJson('POST /livros sem título → mensagem de erro', 'MiniSpring.post("/livros", MiniSpring.params("titulo", "", "autor", "X", "ano", "2000"))', '{"data":null,"message":"Título e autor são obrigatórios"}')}
QT.test("GET /livros lista 2 livros", () -> {
    MiniSpring.post("/livros", MiniSpring.params("titulo", "Use a Cabeça! Java", "autor", "Sierra", "ano", "2005"));
    QT.eq("${json('{"data":[' + BOOK1 + ',' + L(2, 'Use a Cabeça! Java', 'Sierra', 2005, true) + '],"message":"ok"}')}", MiniSpring.get("/livros").json);
});
${eqJson('GET /livros/1', 'MiniSpring.get("/livros/1")', '{"data":' + BOOK1 + ',"message":"ok"}')}
${eqJson('GET /livros/42 → não encontrado', 'MiniSpring.get("/livros/42")', '{"data":null,"message":"Livro 42 não encontrado"}')}
${eqJson('PUT /livros/1/emprestar', 'MiniSpring.put("/livros/1/emprestar", MiniSpring.params())', '{"data":' + L(1, 'Java: Como Programar', 'Deitel', 2017, false) + ',"message":"Empréstimo realizado"}')}
${eqJson('PUT /livros/1/emprestar de novo → erro', 'MiniSpring.put("/livros/1/emprestar", MiniSpring.params())', '{"data":null,"message":"Livro já está emprestado"}')}
${eqJson('GET /livros/disponiveis → só o 2', 'MiniSpring.get("/livros/disponiveis")', '{"data":[' + L(2, 'Use a Cabeça! Java', 'Sierra', 2005, true) + '],"message":"ok"}')}
${eqJson('PUT /livros/1/devolver', 'MiniSpring.put("/livros/1/devolver", MiniSpring.params())', '{"data":' + BOOK1 + ',"message":"Devolução realizada"}')}`,
    solution: [
      f('BibliotecaApplication.java', APP, { readonly: true }),
      f('controller/LivroController.java', CTRL4),
      f('dto/ApiResponse.java', API),
      f('exception/LivroNaoEncontradoException.java', EXC),
      f('model/Livro.java', LIVRO_ENTITY),
      f('repository/LivroRepository.java', REPO2),
      f('service/LivroService.java', SERVICE3),
      f('util/Formatador.java', FORMATADOR),
    ],
  });

  /* ================================================================ FASE 5 */
  PHASES.push({
    id: 'p05', track: 'projeto', icon: '🚀', level: 5, kind: 'spring',
    title: 'Carga Inicial, Busca e Estatísticas', subtitle: 'CommandLineRunner, consultas derivadas e o projeto completo',
    cola: ['pacotes', 'jpa', 'spring'],
    theory: [
      'Um `@Component` que implementa `CommandLineRunner` roda ao iniciar a aplicação — como o `CrudRunner` da aula, que cria usuários.',
      'Consultas derivadas mais ricas: `findByTituloContainingIgnoreCase(String)` (contém, ignorando maiúsculas) e `countByDisponivel(boolean)`.',
      'Agora o projeto tem as camadas completas: **controller → service → repository → model**, mais `dto`, `exception` e `config`.',
    ],
    task: '1. Crie `config/DataLoader` (`@Component`, implementa `CommandLineRunner`): se o repositório estiver vazio, salve:\n   `("Java: Como Programar", "Deitel", 2017)`, `("Use a Cabeça! Java", "Sierra", 2005)`, `("Spring Boot em Ação", "Walls", 2016)`.\n2. No `LivroRepository`, adicione `findByTituloContainingIgnoreCase(String trecho)` e `long countByDisponivel(boolean disponivel)`.\n3. No `LivroService`: `buscarPorTitulo(trecho)`, `porAutor(autor)` e `estatisticas()` → `HashMap<String, Long>` com `total`, `disponiveis` e `emprestados`.\n4. No `LivroController`:\n- `GET /livros/busca?titulo=...` → `("ok", lista)`\n- `GET /livros/autor/{autor}` → `("ok", lista)`\n- `GET /livros/estatisticas` → o mapa de estatísticas',
    files: [
      f('BibliotecaApplication.java', APP, { readonly: true }),
      f('config/DataLoader.java', `package com.ime.biblioteca.config;

// imports

public class DataLoader {

}
`),
      f('controller/LivroController.java', CTRL4),
      f('dto/ApiResponse.java', API),
      f('exception/LivroNaoEncontradoException.java', EXC),
      f('model/Livro.java', LIVRO_ENTITY),
      f('repository/LivroRepository.java', REPO2),
      f('service/LivroService.java', SERVICE3),
      f('util/Formatador.java', FORMATADOR),
    ],
    requests: 'GET /livros\nGET /livros/busca?titulo=java\nGET /livros/autor/Walls\nPUT /livros/3/emprestar\nGET /livros/estatisticas',
    hints: ['`@Component public class DataLoader implements CommandLineRunner { @Autowired private LivroRepository repository; @Override public void run(String... args) { if (repository.count() == 0) { ... } } }`', 'Repositório: `List<Livro> findByTituloContainingIgnoreCase(String trecho); long countByDisponivel(boolean disponivel);`', 'Estatísticas: `m.put("total", repository.count()); m.put("disponiveis", repository.countByDisponivel(true)); ...`'],
    test: `
QT.test("DataLoader em com.ime.biblioteca.config é @Component e CommandLineRunner", () -> {
    QT.inPackage("${PKG}config.DataLoader");
    Class<?> c = QT.cls("${PKG}config.DataLoader");
    QT.isTrue(c.isAnnotationPresent(org.springframework.stereotype.Component.class), "Falta @Component");
    QT.isTrue(org.springframework.boot.CommandLineRunner.class.isAssignableFrom(c), "Deve implementar CommandLineRunner");
});
QT.test("Ao subir, há 3 livros carregados", () -> QT.eq("${json('{"data":[' + BOOK1 + ',' + L(2, 'Use a Cabeça! Java', 'Sierra', 2005, true) + ',' + L(3, 'Spring Boot em Ação', 'Walls', 2016, true) + '],"message":"ok"}')}", MiniSpring.get("/livros").json));
${eqJson('GET /livros/busca?titulo=java → 2 livros (ignora maiúsculas)', 'MiniSpring.get("/livros/busca?titulo=java")', '{"data":[' + BOOK1 + ',' + L(2, 'Use a Cabeça! Java', 'Sierra', 2005, true) + '],"message":"ok"}')}
${eqJson('GET /livros/busca?titulo=SPRING → 1 livro', 'MiniSpring.get("/livros/busca?titulo=SPRING")', '{"data":[' + L(3, 'Spring Boot em Ação', 'Walls', 2016, true) + '],"message":"ok"}')}
${eqJson('GET /livros/autor/Sierra', 'MiniSpring.get("/livros/autor/Sierra")', '{"data":[' + L(2, 'Use a Cabeça! Java', 'Sierra', 2005, true) + '],"message":"ok"}')}
${eqJson('GET /livros/estatisticas (tudo disponível)', 'MiniSpring.get("/livros/estatisticas")', '{"disponiveis":3,"emprestados":0,"total":3}')}
QT.test("Estatísticas após um empréstimo", () -> {
    MiniSpring.put("/livros/3/emprestar", MiniSpring.params());
    QT.eq("${json('{"disponiveis":2,"emprestados":1,"total":3}')}", MiniSpring.get("/livros/estatisticas").json);
});
QT.test("Os endpoints da fase anterior continuam funcionando", () -> {
    QT.eq("${json('{"data":null,"message":"Livro já está emprestado"}')}", MiniSpring.put("/livros/3/emprestar", MiniSpring.params()).json);
    QT.eq(2, ((java.util.List<?>) QT.callM(MiniSpring.get("/livros/disponiveis").body, "getData")).size());
});`,
    solution: [
      f('BibliotecaApplication.java', APP, { readonly: true }),
      f('config/DataLoader.java', LOADER),
      f('controller/LivroController.java', CTRL5),
      f('dto/ApiResponse.java', API),
      f('exception/LivroNaoEncontradoException.java', EXC),
      f('model/Livro.java', LIVRO_ENTITY),
      f('repository/LivroRepository.java', REPO5),
      f('service/LivroService.java', SERVICE5),
      f('util/Formatador.java', FORMATADOR),
    ],
  });
})();
