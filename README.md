# JavaQuest — treino prático para Lab Prog II

Plataforma 100% prática: **cada fase é um exercício de código** com testes automáticos,
baseado nas aulas (Java, Java Web/Spring, SQL, HTML5, CSS3 e JavaScript).

## Como abrir
1. Precisa do **JDK 17+** (o mesmo usado na disciplina).
2. Dê dois cliques em `iniciar.bat` (Windows) — ou rode `java JavaQuest.java` nesta pasta.
3. O navegador abre em http://localhost:5517.

O servidor compila e executa o seu código Java localmente (só aceita conexões da própria máquina).
Sem o servidor, abrindo o `index.html` direto, as fases de HTML/CSS/JS e SQL continuam funcionando.

## Para os colegas: baixar e rodar
```bash
git clone https://github.com/VitorRamos77/javaquest-labprog2.git
cd javaquest-labprog2
java JavaQuest.java
```
Ou baixe o ZIP pelo botão **Code → Download ZIP** no GitHub, extraia e dê dois cliques em `iniciar.bat`.
Seu progresso e seu código ficam salvos só no seu navegador.

> Material de estudo feito por alunos com base nas aulas de Laboratório de Programação II.
> Não é material oficial da disciplina.

## Trilhas (38 fases)
- **Java (20):** Olá Mundo, Scanner, if/else, laços, fatorial, Fibonacci com memoização, Strings,
  arrays, ArrayList, HashMap, HashSet, classes (Product/ShoppingCart), herança, interfaces, generics,
  arquivos e CSV.
- **Java Web (5):** APIs Spring Boot (`@RestController`, `@GetMapping`, `@PathVariable`, `@RequestParam`),
  `ApiResponse<T>`, SQL (CRUD) e CRUD com JPA/Hibernate (`@Entity`, `CrudRepository`, `@Autowired`).
  O Spring e o banco são **simulados** (runtime/MiniSpring.java), então não precisa de Gradle nem MySQL.
- **Front-end (8):** página HTML, formulário, seletores/box model, flexbox, Fibonacci em JS, eventos/DOM,
  carrinho de compras e validação de CPF.
- **Projeto Spring: Sistema de Biblioteca (5):** um projeto maior em pacotes
  (`src/main/java/com/ime/biblioteca/{model,repository,service,controller,dto,exception,config}`),
  praticando `package`/`import` entre pastas. Cada fase evolui o mesmo sistema: pacotes → entidade e
  repositório → service com regras e exceção própria → controller REST → carga inicial, busca e estatísticas.
  O explorador de arquivos permite criar novos arquivos (o `package` é preenchido pela pasta).

## Na fase
- **▶ Executar** roda seu `main` (com a entrada da aba ⌨ Entrada) ou envia requisições à sua API (aba 📮).
- **✔ Testar** (`Ctrl+Enter`) corrige. Passou em tudo → fase concluída e a próxima é liberada.
- **📋 Cola** retrátil à direita (`Alt+C`), já filtrada no assunto da fase.
- Dicas e solução disponíveis (reduzem as estrelas). O código é salvo automaticamente no navegador.

## Estrutura
- `JavaQuest.java` — servidor (arquivos estáticos + compila/executa Java)
- `runtime/` — `QT.java` (biblioteca de testes), `MiniSpring.java` (Spring/JPA simulado) e stubs das anotações
- `data/fases-java.js`, `data/fases-web.js`, `data/fases-projeto.js` — as fases (enunciado, código inicial, testes e solução)
- `data/cola.js` — conteúdo da cola
