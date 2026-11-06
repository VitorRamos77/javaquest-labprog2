/* =========================================================
   TRILHA 1 — JAVA (baseado em "5 - LabProg II - Java.pdf")
   Cada fase é um exercício de código.
   kind: 'java'
   files:    arquivos que o aluno edita [{name, code}]
   run:      { main, stdin }  -> botão "Executar"
   test:     corpo do main da classe Teste (usa a biblioteca QT de runtime/QT.java)
   solution: arquivos com a solução de referência
   ========================================================= */
window.PHASES = window.PHASES || [];

const MAIN_STARTER = `public class Main {
    public static void main(String[] args) {
        // escreva seu código aqui

    }
}
`;

PHASES.push({
  id: 'j01', track: 'java', icon: '👋', level: 1, kind: 'java',
  title: 'Olá, Mundo!', subtitle: 'Seu primeiro programa: classe, main e println',
  cola: ['exec'],
  theory: [
    'Todo programa Java começa no método `public static void main(String[] args)` dentro de uma classe.',
    'O arquivo deve ter o **mesmo nome da classe pública**: `Main.java` → `public class Main`.',
    '`System.out.println(...)` imprime e pula linha; `System.out.print(...)` imprime sem pular.',
  ],
  task: 'Faça o programa imprimir exatamente estas duas linhas:',
  example: { output: 'Olá, Mundo!\nBem-vindo ao Lab Prog II' },
  files: [{ name: 'Main.java', code: MAIN_STARTER }],
  run: { main: 'Main', stdin: '' },
  hints: ['Use `System.out.println("...")` duas vezes, uma para cada linha.', 'Atenção a maiúsculas, acentos e pontuação: a saída deve ser idêntica.'],
  test: `
QT.test("1ª linha: Olá, Mundo!", () -> {
    String[] l = QT.norm(QT.out("Main", "")).split("\\n");
    QT.eq("Olá, Mundo!", l[0]);
});
QT.test("2ª linha: Bem-vindo ao Lab Prog II", () -> {
    String[] l = QT.norm(QT.out("Main", "")).split("\\n");
    QT.isTrue(l.length >= 2, "Faltou a segunda linha.");
    QT.eq("Bem-vindo ao Lab Prog II", l[1]);
});`,
  solution: [{ name: 'Main.java', code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Olá, Mundo!");
        System.out.println("Bem-vindo ao Lab Prog II");
    }
}
` }],
});

PHASES.push({
  id: 'j02', track: 'java', icon: '⌨️', level: 1, kind: 'java',
  title: 'Soma com Scanner', subtitle: 'Entrada do teclado e variáveis int',
  cola: ['io', 'tipos'],
  theory: [
    'Importe o Scanner: `import java.util.Scanner;` e crie com `new Scanner(System.in)`.',
    '`nextInt()` lê um inteiro; `nextDouble()` um real; `next()` uma palavra; `nextLine()` a linha toda.',
    'Feche o Scanner no final com `input.close()`.',
  ],
  task: 'Leia **dois números inteiros** e imprima a soma no formato `Sum is X` (como no exemplo da aula). Você pode imprimir mensagens pedindo os números antes.',
  example: { input: '4\n6', output: 'Enter the first integer: Enter the second integer: Sum is 10' },
  files: [{ name: 'Main.java', code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // leia os dois números e imprima a soma

        input.close();
    }
}
` }],
  run: { main: 'Main', stdin: '4\n6\n' },
  hints: ['`int number1 = input.nextInt();`', 'Use `System.out.printf("Sum is %d\\n", sum);` ou `println("Sum is " + sum)`.'],
  test: `
QT.test("4 + 6 → Sum is 10", () -> QT.linesInOrder(QT.out("Main", "4\\n6\\n"), "Sum is 10"));
QT.test("-3 + 8 → Sum is 5", () -> QT.linesInOrder(QT.out("Main", "-3 8\\n"), "Sum is 5"));
QT.test("1000 + 2345 → Sum is 3345", () -> QT.linesInOrder(QT.out("Main", "1000\\n2345\\n"), "Sum is 3345"));`,
  solution: [{ name: 'Main.java', code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter the first integer: ");
        int number1 = input.nextInt();
        System.out.print("Enter the second integer: ");
        int number2 = input.nextInt();
        int sum = number1 + number2;
        System.out.printf("Sum is %d\\n", sum);
        input.close();
    }
}
` }],
});

PHASES.push({
  id: 'j03', track: 'java', icon: '🎓', level: 1, kind: 'java',
  title: 'Média e Situação', subtitle: 'double, printf e if / else if / else',
  cola: ['io', 'fluxo'],
  theory: [
    '`double` guarda números com casas decimais. Leia com `nextDouble()` (use ponto: `7.5`).',
    '`printf("%.2f", x)` imprime com 2 casas decimais.',
    'Encadeie condições com `if (...) { } else if (...) { } else { }`.',
  ],
  task: 'Leia **3 notas** (double), calcule a média e imprima:\n1. `Média: X.XX` (2 casas decimais)\n2. Na linha seguinte, a situação: `APROVADO` (média ≥ 7), `RECUPERAÇÃO` (média ≥ 5) ou `REPROVADO`.',
  example: { input: '8 7 7.5', output: 'Média: 7.50\nAPROVADO' },
  files: [{ name: 'Main.java', code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        input.close();
    }
}
` }],
  run: { main: 'Main', stdin: '8 7 7.5\n' },
  hints: ['`double media = (n1 + n2 + n3) / 3;`', '`System.out.printf("Média: %.2f%n", media);`', 'Teste primeiro a condição maior (≥ 7), depois ≥ 5.'],
  test: `
QT.test("8, 7, 7.5 → Média: 7.50 e APROVADO", () -> QT.linesInOrder(QT.out("Main", "8 7 7.5\\n"), "Média: 7.50", "APROVADO"));
QT.test("5, 6, 4 → Média: 5.00 e RECUPERAÇÃO", () -> QT.linesInOrder(QT.out("Main", "5\\n6\\n4\\n"), "Média: 5.00", "RECUPERAÇÃO"));
QT.test("2, 3.5, 4 → Média: 3.17 e REPROVADO", () -> QT.linesInOrder(QT.out("Main", "2 3.5 4\\n"), "Média: 3.17", "REPROVADO"));
QT.test("7, 7, 7 → limite exato: APROVADO", () -> QT.linesInOrder(QT.out("Main", "7 7 7\\n"), "Média: 7.00", "APROVADO"));`,
  solution: [{ name: 'Main.java', code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        double n1 = input.nextDouble();
        double n2 = input.nextDouble();
        double n3 = input.nextDouble();
        double media = (n1 + n2 + n3) / 3;
        System.out.printf("Média: %.2f%n", media);
        if (media >= 7) {
            System.out.println("APROVADO");
        } else if (media >= 5) {
            System.out.println("RECUPERAÇÃO");
        } else {
            System.out.println("REPROVADO");
        }
        input.close();
    }
}
` }],
});

PHASES.push({
  id: 'j04', track: 'java', icon: '✖️', level: 1, kind: 'java',
  title: 'Tabuada', subtitle: 'Laço for',
  cola: ['fluxo'],
  theory: [
    '`for (int i = 1; i <= 10; i++) { ... }` repete o bloco com `i` de 1 até 10.',
    'Concatene textos e números com `+`: `n + " x " + i + " = " + (n * i)`.',
  ],
  task: 'Leia um inteiro `n` e imprima a tabuada de `n` de 1 a 10, uma linha por multiplicação, no formato `n x i = resultado`.',
  example: { input: '7', output: '7 x 1 = 7\n7 x 2 = 14\n...\n7 x 10 = 70' },
  files: [{ name: 'Main.java', code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();

        input.close();
    }
}
` }],
  run: { main: 'Main', stdin: '7\n' },
  hints: ['Coloque os parênteses em `(n * i)` para multiplicar antes de concatenar.'],
  test: `
QT.test("Tabuada do 7 completa", () -> {
    String o = QT.out("Main", "7\\n");
    String[] exp = new String[10];
    for (int i = 1; i <= 10; i++) exp[i - 1] = "7 x " + i + " = " + (7 * i);
    QT.linesInOrder(o, exp);
});
QT.test("Tabuada do 3 termina em 3 x 10 = 30", () -> QT.linesInOrder(QT.out("Main", "3\\n"), "3 x 1 = 3", "3 x 10 = 30"));
QT.test("Exatamente 10 linhas de multiplicação", () -> {
    long c = QT.norm(QT.out("Main", "5\\n")).lines().filter(l -> l.matches(".*\\\\d+ x \\\\d+ = \\\\d+.*")).count();
    QT.eq(10L, c);
});`,
  solution: [{ name: 'Main.java', code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        for (int i = 1; i <= 10; i++) {
            System.out.println(n + " x " + i + " = " + (n * i));
        }
        input.close();
    }
}
` }],
});

PHASES.push({
  id: 'j05', track: 'java', icon: '🔁', level: 2, kind: 'java',
  title: 'Maior, Menor e Quantidade', subtitle: 'Laço while com sentinela',
  cola: ['fluxo', 'io'],
  theory: [
    '`while (condicao) { ... }` repete enquanto a condição for verdadeira.',
    'Um valor **sentinela** (aqui, o 0) indica o fim da entrada.',
    'Inicialize maior/menor com o primeiro valor lido (ou com `Integer.MIN_VALUE` / `Integer.MAX_VALUE`).',
  ],
  task: 'Leia inteiros até o usuário digitar **0** (o 0 não conta). Depois imprima:\n`Maior: X`\n`Menor: Y`\n`Quantidade: N`\nSe o primeiro número já for 0, imprima apenas `Nenhum número`.',
  example: { input: '5 -2 9 3 0', output: 'Maior: 9\nMenor: -2\nQuantidade: 4' },
  files: [{ name: 'Main.java', code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        input.close();
    }
}
` }],
  run: { main: 'Main', stdin: '5 -2 9 3 0\n' },
  hints: ['Leia o primeiro número antes do laço; dentro do laço, processe e leia o próximo.', '`if (n > maior) maior = n;`'],
  test: `
QT.test("5 -2 9 3 0 → Maior 9, Menor -2, Quantidade 4", () -> QT.linesInOrder(QT.out("Main", "5 -2 9 3 0\\n"), "Maior: 9", "Menor: -2", "Quantidade: 4"));
QT.test("Só negativos: -5 -1 -9 0", () -> QT.linesInOrder(QT.out("Main", "-5\\n-1\\n-9\\n0\\n"), "Maior: -1", "Menor: -9", "Quantidade: 3"));
QT.test("Um número só: 42 0", () -> QT.linesInOrder(QT.out("Main", "42 0\\n"), "Maior: 42", "Menor: 42", "Quantidade: 1"));
QT.test("Entrada vazia (0) → Nenhum número", () -> {
    String o = QT.out("Main", "0\\n");
    QT.linesInOrder(o, "Nenhum número");
    QT.isTrue(!o.contains("Maior"), "Não deveria imprimir Maior quando não há números.");
});`,
  solution: [{ name: 'Main.java', code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        if (n == 0) {
            System.out.println("Nenhum número");
        } else {
            int maior = n, menor = n, qtd = 0;
            while (n != 0) {
                if (n > maior) maior = n;
                if (n < menor) menor = n;
                qtd++;
                n = input.nextInt();
            }
            System.out.println("Maior: " + maior);
            System.out.println("Menor: " + menor);
            System.out.println("Quantidade: " + qtd);
        }
        input.close();
    }
}
` }],
});

PHASES.push({
  id: 'j06', track: 'java', icon: '❗', level: 2, kind: 'java',
  title: 'Fatorial', subtitle: 'Métodos static: iterativo e recursivo',
  cola: ['fluxo', 'tipos'],
  theory: [
    'Métodos `static` pertencem à classe: chamados como `Fatorial.fatIt(5)`.',
    'Iterativo: acumule `rv = rv * i` num laço. Recursivo: `n * fatRec(n - 1)` com **caso base** `n <= 1`.',
    '`int` estoura a partir de 13! — por isso use `long` (vai até 20!).',
  ],
  task: 'Na classe `Fatorial`, implemente:\n- `public static long fatIt(int n)` — versão **iterativa**\n- `public static long fatRec(int n)` — versão **recursiva**\n\nAmbos com `0! = 1`.',
  files: [{ name: 'Fatorial.java', code: `public class Fatorial {

    public static long fatIt(int n) {
        // versão com laço
        return 0;
    }

    public static long fatRec(int n) {
        // versão recursiva
        return 0;
    }

    public static void main(String[] args) {
        for (int i = 0; i <= 20; i++) {
            System.out.println(i + "! = " + fatIt(i) + " | " + fatRec(i));
        }
    }
}
` }],
  run: { main: 'Fatorial', stdin: '' },
  hints: ['Iterativo: `long rv = 1; for (int i = 1; i <= n; i++) rv = rv * i; return rv;`', 'Recursivo: `if (n <= 1) return 1; return n * fatRec(n - 1);`'],
  test: `
QT.test("fatIt(0) == 1", () -> QT.eq(1L, QT.call("Fatorial", "fatIt", 0)));
QT.test("fatIt(5) == 120", () -> QT.eq(120L, QT.call("Fatorial", "fatIt", 5)));
QT.test("fatIt(20) == 2432902008176640000", () -> QT.eq(2432902008176640000L, QT.call("Fatorial", "fatIt", 20)));
QT.test("fatRec(0) == 1", () -> QT.eq(1L, QT.call("Fatorial", "fatRec", 0)));
QT.test("fatRec(6) == 720", () -> QT.eq(720L, QT.call("Fatorial", "fatRec", 6)));
QT.test("fatRec(20) == 2432902008176640000", () -> QT.eq(2432902008176640000L, QT.call("Fatorial", "fatRec", 20)));`,
  solution: [{ name: 'Fatorial.java', code: `public class Fatorial {

    public static long fatIt(int n) {
        long rv = 1;
        for (int i = 1; i <= n; i++) {
            rv = rv * i;
        }
        return rv;
    }

    public static long fatRec(int n) {
        if (n <= 1) return 1;
        return n * fatRec(n - 1);
    }

    public static void main(String[] args) {
        for (int i = 0; i <= 20; i++) {
            System.out.println(i + "! = " + fatIt(i) + " | " + fatRec(i));
        }
    }
}
` }],
});

PHASES.push({
  id: 'j07', track: 'java', icon: '🐚', level: 2, kind: 'java',
  title: 'Fibonacci com Memoização', subtitle: 'Recursão + array global de valores calculados',
  cola: ['array', 'fluxo'],
  theory: [
    'Fibonacci: `fib(1) = fib(2) = 1` e `fib(n) = fib(n-1) + fib(n-2)`.',
    'A recursão ingênua recalcula os mesmos valores milhões de vezes (fib(50) leva minutos!).',
    '**Memoização**: guarde cada resultado num array `static` e reutilize — exercício 6 da aula.',
  ],
  task: 'Na classe `Fibonacci`, implemente `public static long fib(int n)` **recursivo com memoização** usando um array global (`static long[] memo`). O teste calcula `fib(90)` e exige menos de 500 ms.',
  files: [{ name: 'Fibonacci.java', code: `public class Fibonacci {
    static long[] memo = new long[100];

    public static long fib(int n) {
        // seu código aqui
        return 0;
    }

    public static void main(String[] args) {
        long ini = System.nanoTime();
        System.out.println("fib(50) = " + fib(50));
        System.out.println("Tempo: " + (System.nanoTime() - ini) / 1_000_000 + " ms");
    }
}
` }],
  run: { main: 'Fibonacci', stdin: '' },
  hints: ['Caso base: `if (n <= 2) return 1;`', 'Antes de calcular: `if (memo[n] != 0) return memo[n];`', 'Depois: `memo[n] = fib(n - 1) + fib(n - 2); return memo[n];`'],
  test: `
QT.test("fib(1) == 1 e fib(2) == 1", () -> { QT.eq(1L, QT.call("Fibonacci", "fib", 1)); QT.eq(1L, QT.call("Fibonacci", "fib", 2)); });
QT.test("fib(10) == 55", () -> QT.eq(55L, QT.call("Fibonacci", "fib", 10)));
QT.testTimeout("fib(50) == 12586269025 (rápido)", 500, () -> QT.eq(12586269025L, QT.call("Fibonacci", "fib", 50)));
QT.testTimeout("fib(90) == 2880067194370816120 em < 500 ms", 500, () -> QT.eq(2880067194370816120L, QT.call("Fibonacci", "fib", 90)));`,
  solution: [{ name: 'Fibonacci.java', code: `public class Fibonacci {
    static long[] memo = new long[100];

    public static long fib(int n) {
        if (n <= 2) return 1;
        if (memo[n] != 0) return memo[n];
        memo[n] = fib(n - 1) + fib(n - 2);
        return memo[n];
    }

    public static void main(String[] args) {
        long ini = System.nanoTime();
        System.out.println("fib(50) = " + fib(50));
        System.out.println("Tempo: " + (System.nanoTime() - ini) / 1_000_000 + " ms");
    }
}
` }],
});

PHASES.push({
  id: 'j08', track: 'java', icon: '📧', level: 2, kind: 'java',
  title: 'Validador de E-mail', subtitle: 'Métodos de String: contains, endsWith, indexOf',
  cola: ['string'],
  theory: [
    '`s.contains("@")`, `s.startsWith("x")`, `s.endsWith(".com")` retornam `boolean`.',
    '`s.indexOf("@")` e `s.lastIndexOf("@")` dão a posição (ou -1). Se forem diferentes, há mais de um `@`.',
    'Strings são **imutáveis** e comparadas com `equals`, nunca `==`.',
  ],
  task: 'Implemente `public static boolean valido(String email)` na classe `Email` (exercício 2 da aula). O e-mail é válido se:\n1. contém **exatamente um** `@`, que **não** é o primeiro caractere;\n2. termina com `.com` ou `.br`;\n3. não contém espaços.',
  files: [{ name: 'Email.java', code: `import java.util.Scanner;

public class Email {

    public static boolean valido(String email) {
        // seu código aqui
        return false;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Digite um e-mail: ");
        String email = input.nextLine();
        System.out.println(valido(email) ? "Válido" : "Inválido");
        input.close();
    }
}
` }],
  run: { main: 'Email', stdin: 'aluno@ime.eb.br\n' },
  hints: ['`int pos = email.indexOf("@");` — precisa ser `> 0` e igual a `email.lastIndexOf("@")`.', '`email.endsWith(".com") || email.endsWith(".br")`', '`!email.contains(" ")`'],
  test: `
QT.test("aluno@ime.eb.br é válido", () -> QT.eq(true, QT.call("Email", "valido", "aluno@ime.eb.br")));
QT.test("john@gmail.com é válido", () -> QT.eq(true, QT.call("Email", "valido", "john@gmail.com")));
QT.test("alunoime.eb.br (sem @) é inválido", () -> QT.eq(false, QT.call("Email", "valido", "alunoime.eb.br")));
QT.test("@ime.eb.br (@ no início) é inválido", () -> QT.eq(false, QT.call("Email", "valido", "@ime.eb.br")));
QT.test("a@b@c.com (dois @) é inválido", () -> QT.eq(false, QT.call("Email", "valido", "a@b@c.com")));
QT.test("joao@site.org (termina errado) é inválido", () -> QT.eq(false, QT.call("Email", "valido", "joao@site.org")));
QT.test("jo ao@site.com (com espaço) é inválido", () -> QT.eq(false, QT.call("Email", "valido", "jo ao@site.com")));`,
  solution: [{ name: 'Email.java', code: `import java.util.Scanner;

public class Email {

    public static boolean valido(String email) {
        int pos = email.indexOf("@");
        if (pos <= 0 || pos != email.lastIndexOf("@")) return false;
        if (email.contains(" ")) return false;
        return email.endsWith(".com") || email.endsWith(".br");
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Digite um e-mail: ");
        String email = input.nextLine();
        System.out.println(valido(email) ? "Válido" : "Inválido");
        input.close();
    }
}
` }],
});

PHASES.push({
  id: 'j09', track: 'java', icon: '💬', level: 2, kind: 'java',
  title: 'Link do WhatsApp', subtitle: 'Limpar dígitos e codificar URL',
  cola: ['string'],
  theory: [
    'Percorra a String com `for (char c : s.toCharArray())` e use `Character.isDigit(c)`, ou use `s.replaceAll("\\\\D", "")`.',
    '`StringBuilder` monta Strings de forma eficiente: `sb.append(c)`.',
    '`URLEncoder.encode(msg, StandardCharsets.UTF_8)` codifica para URL, mas troca espaço por `+` — substitua por `%20`.',
  ],
  task: 'Na classe `WhatsApp`, crie `public static String gerarLink(String telefone, String mensagem)` (exercício 4 da aula):\n- mantenha **apenas os dígitos** do telefone;\n- se não começar com `55`, adicione `55` na frente;\n- codifique a mensagem (espaços viram `%20`).\n\nFormato: `https://wa.me/5521999999999?text=Ol%C3%A1%20mundo`',
  files: [{ name: 'WhatsApp.java', code: `import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class WhatsApp {

    public static String gerarLink(String telefone, String mensagem) {
        // seu código aqui
        return "";
    }

    public static void main(String[] args) {
        System.out.println(gerarLink("(21) 99999-9999", "Olá mundo"));
    }
}
` }],
  run: { main: 'WhatsApp', stdin: '' },
  hints: ['`String digitos = telefone.replaceAll("\\\\D", "");` remove tudo que não é dígito.', '`if (!digitos.startsWith("55")) digitos = "55" + digitos;`', '`URLEncoder.encode(mensagem, StandardCharsets.UTF_8).replace("+", "%20")`'],
  test: `
QT.test("Telefone com máscara e acento na mensagem", () -> QT.eq("https://wa.me/5521999999999?text=Ol%C3%A1%20mundo", QT.call("WhatsApp", "gerarLink", "(21) 99999-9999", "Olá mundo")));
QT.test("Telefone já com +55", () -> QT.eq("https://wa.me/5521988887777?text=Oi", QT.call("WhatsApp", "gerarLink", "+55 21 98888-7777", "Oi")));
QT.test("Vários espaços na mensagem", () -> QT.eq("https://wa.me/5511912345678?text=Prova%20de%20Lab%20Prog", QT.call("WhatsApp", "gerarLink", "11912345678", "Prova de Lab Prog")));`,
  solution: [{ name: 'WhatsApp.java', code: `import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class WhatsApp {

    public static String gerarLink(String telefone, String mensagem) {
        StringBuilder sb = new StringBuilder();
        for (char c : telefone.toCharArray()) {
            if (Character.isDigit(c)) sb.append(c);
        }
        String digitos = sb.toString();
        if (!digitos.startsWith("55")) digitos = "55" + digitos;
        String texto = URLEncoder.encode(mensagem, StandardCharsets.UTF_8).replace("+", "%20");
        return "https://wa.me/" + digitos + "?text=" + texto;
    }

    public static void main(String[] args) {
        System.out.println(gerarLink("(21) 99999-9999", "Olá mundo"));
    }
}
` }],
});

PHASES.push({
  id: 'j10', track: 'java', icon: '📊', level: 2, kind: 'java',
  title: 'Estatísticas de Vetor', subtitle: 'Arrays, length, for-each e a classe Arrays',
  cola: ['array'],
  theory: [
    'Arrays têm tamanho fixo: `int[] v = new int[5];` ou `int[] v = {5, 2, 9};`. Tamanho: `v.length`.',
    '`Arrays.copyOf(v, v.length)` cria uma cópia; `Arrays.sort(copia)` ordena **no lugar**.',
    'Para devolver um array de tamanho desconhecido, conte primeiro e depois crie o array.',
  ],
  task: 'Na classe `Vetor`, implemente:\n- `static int[] ordenado(int[] v)` — retorna uma **cópia** ordenada (o original **não** pode mudar);\n- `static double media(int[] v)` — média dos elementos (0 se vazio);\n- `static int[] pares(int[] v)` — novo array só com os números pares, na ordem original.',
  files: [{ name: 'Vetor.java', code: `import java.util.Arrays;

public class Vetor {

    public static int[] ordenado(int[] v) {
        return null;
    }

    public static double media(int[] v) {
        return 0;
    }

    public static int[] pares(int[] v) {
        return null;
    }

    public static void main(String[] args) {
        int[] numeros = {5, 2, 9, 1, 4, 8};
        System.out.println(Arrays.toString(ordenado(numeros)));
        System.out.println(Arrays.toString(numeros)); // deve continuar igual
        System.out.println(media(numeros));
        System.out.println(Arrays.toString(pares(numeros)));
    }
}
` }],
  run: { main: 'Vetor', stdin: '' },
  hints: ['`int[] c = Arrays.copyOf(v, v.length); Arrays.sort(c); return c;`', 'Em `pares`: um laço para contar, crie `new int[qtd]`, outro laço para preencher.'],
  test: `
QT.test("ordenado({5,2,9,1,4,8}) == [1, 2, 4, 5, 8, 9]", () -> QT.eq(new int[]{1, 2, 4, 5, 8, 9}, QT.call("Vetor", "ordenado", (Object) new int[]{5, 2, 9, 1, 4, 8})));
QT.test("ordenado não altera o array original", () -> {
    int[] v = {3, 1, 2};
    QT.call("Vetor", "ordenado", (Object) v);
    QT.eq(new int[]{3, 1, 2}, v);
});
QT.test("media({5,2,9,1,4,8}) == 4.833…", () -> QT.eq(29.0 / 6, QT.call("Vetor", "media", (Object) new int[]{5, 2, 9, 1, 4, 8})));
QT.test("media({}) == 0", () -> QT.eq(0.0, QT.call("Vetor", "media", (Object) new int[]{})));
QT.test("pares({5,2,9,1,4,8}) == [2, 4, 8]", () -> QT.eq(new int[]{2, 4, 8}, QT.call("Vetor", "pares", (Object) new int[]{5, 2, 9, 1, 4, 8})));
QT.test("pares de negativos: {-4,-3,0} == [-4, 0]", () -> QT.eq(new int[]{-4, 0}, QT.call("Vetor", "pares", (Object) new int[]{-4, -3, 0})));`,
  solution: [{ name: 'Vetor.java', code: `import java.util.Arrays;

public class Vetor {

    public static int[] ordenado(int[] v) {
        int[] c = Arrays.copyOf(v, v.length);
        Arrays.sort(c);
        return c;
    }

    public static double media(int[] v) {
        if (v.length == 0) return 0;
        double soma = 0;
        for (int x : v) soma += x;
        return soma / v.length;
    }

    public static int[] pares(int[] v) {
        int qtd = 0;
        for (int x : v) if (x % 2 == 0) qtd++;
        int[] r = new int[qtd];
        int k = 0;
        for (int x : v) if (x % 2 == 0) r[k++] = x;
        return r;
    }

    public static void main(String[] args) {
        int[] numeros = {5, 2, 9, 1, 4, 8};
        System.out.println(Arrays.toString(ordenado(numeros)));
        System.out.println(Arrays.toString(numeros));
        System.out.println(media(numeros));
        System.out.println(Arrays.toString(pares(numeros)));
    }
}
` }],
});

PHASES.push({
  id: 'j11', track: 'java', icon: '🔀', level: 3, kind: 'java',
  title: 'Números Permutados', subtitle: 'Dígitos, char[] e Arrays.equals',
  cola: ['array', 'string'],
  theory: [
    '`String.valueOf(n)` ou `Integer.toString(n)` transforma o número em texto; `toCharArray()` dá os dígitos.',
    'Duas sequências são permutações se, **ordenadas**, ficam iguais: `Arrays.sort` + `Arrays.equals`.',
    'Pelo exemplo da aula, zeros à esquerda valem: `42` = `042` é permutação de `204`. Ou seja: **ignore os zeros**.',
  ],
  task: 'Implemente `public static boolean ehPermutacao(int a, int b)` na classe `Permutacao` (exercício 3 da aula). Retorne `false` se algum número for negativo. Exemplos: `431`/`143` → true · `42`/`204` → true · `1211`/`1112` → true · `123`/`124` → false.',
  files: [{ name: 'Permutacao.java', code: `import java.util.Arrays;

public class Permutacao {

    public static boolean ehPermutacao(int a, int b) {
        // seu código aqui
        return false;
    }

    public static void main(String[] args) {
        System.out.println(ehPermutacao(431, 143));
        System.out.println(ehPermutacao(42, 204));
        System.out.println(ehPermutacao(123, 124));
    }
}
` }],
  run: { main: 'Permutacao', stdin: '' },
  hints: ['Crie um método auxiliar que devolve os dígitos sem zeros e ordenados: `String.valueOf(n).replace("0", "").toCharArray()` + `Arrays.sort`.'],
  test: `
QT.test("431 e 143 → true", () -> QT.eq(true, QT.call("Permutacao", "ehPermutacao", 431, 143)));
QT.test("42 e 204 → true (zero à esquerda)", () -> QT.eq(true, QT.call("Permutacao", "ehPermutacao", 42, 204)));
QT.test("1211 e 1112 → true", () -> QT.eq(true, QT.call("Permutacao", "ehPermutacao", 1211, 1112)));
QT.test("123 e 124 → false", () -> QT.eq(false, QT.call("Permutacao", "ehPermutacao", 123, 124)));
QT.test("11 e 1 → false (quantidade de dígitos importa)", () -> QT.eq(false, QT.call("Permutacao", "ehPermutacao", 11, 1)));
QT.test("negativos → false", () -> QT.eq(false, QT.call("Permutacao", "ehPermutacao", -12, 21)));`,
  solution: [{ name: 'Permutacao.java', code: `import java.util.Arrays;

public class Permutacao {

    static char[] digitos(int n) {
        char[] d = String.valueOf(n).replace("0", "").toCharArray();
        Arrays.sort(d);
        return d;
    }

    public static boolean ehPermutacao(int a, int b) {
        if (a < 0 || b < 0) return false;
        return Arrays.equals(digitos(a), digitos(b));
    }

    public static void main(String[] args) {
        System.out.println(ehPermutacao(431, 143));
        System.out.println(ehPermutacao(42, 204));
        System.out.println(ehPermutacao(123, 124));
    }
}
` }],
});

PHASES.push({
  id: 'j12', track: 'java', icon: '🛒', level: 3, kind: 'java',
  title: 'Lista de Compras', subtitle: 'ArrayList + menu com switch',
  cola: ['colecoes', 'fluxo', 'io'],
  theory: [
    '`ArrayList<String> lista = new ArrayList<>();` cresce sozinho: `add`, `remove`, `contains`, `size`.',
    '`lista.remove("ovo")` (com objeto) remove pelo **valor** e retorna `true` se removeu.',
    'Um menu é um `while` que lê a opção e decide com `switch`.',
  ],
  task: 'Implemente o menu da lista de compras (exercício 1 de Tipos Compostos). Leia opções até ler `0`:\n- `1` → leia um item (uma palavra, `next()`), adicione e imprima `Adicionado: ITEM`\n- `2` → imprima `Lista: [a, b, c]` (use o `toString` do ArrayList)\n- `3` → leia um item e remova; imprima `Removido: ITEM` ou `Item não encontrado`\n- `0` → imprima `Até logo!` e termine\n\nPode imprimir o menu como quiser.',
  example: { input: '1 arroz\n1 feijao\n2\n3 arroz\n2\n0', output: 'Adicionado: arroz\nAdicionado: feijao\nLista: [arroz, feijao]\nRemovido: arroz\nLista: [feijao]\nAté logo!' },
  files: [{ name: 'Main.java', code: `import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        ArrayList<String> lista = new ArrayList<>();

        input.close();
    }
}
` }],
  run: { main: 'Main', stdin: '1 arroz\n1 feijao\n2\n3 arroz\n2\n0\n' },
  hints: ['`int op = input.nextInt();` dentro de um `while (true)` ou `do { } while (op != 0)`.', '`case 3: String it = input.next(); if (lista.remove(it)) ... else ...; break;`'],
  test: `
QT.test("Adicionar e listar", () -> QT.linesInOrder(QT.out("Main", "1 arroz\\n1 feijao\\n2\\n0\\n"), "Adicionado: arroz", "Adicionado: feijao", "Lista: [arroz, feijao]", "Até logo!"));
QT.test("Remover item existente", () -> QT.linesInOrder(QT.out("Main", "1 arroz\\n1 feijao\\n3 arroz\\n2\\n0\\n"), "Removido: arroz", "Lista: [feijao]"));
QT.test("Remover item inexistente", () -> QT.linesInOrder(QT.out("Main", "1 leite\\n3 pao\\n2\\n0\\n"), "Item não encontrado", "Lista: [leite]"));
QT.test("Lista vazia", () -> QT.linesInOrder(QT.out("Main", "2\\n0\\n"), "Lista: []", "Até logo!"));`,
  solution: [{ name: 'Main.java', code: `import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        ArrayList<String> lista = new ArrayList<>();
        int op;
        do {
            System.out.println("1 - Adicionar | 2 - Imprimir | 3 - Remover | 0 - Sair");
            op = input.nextInt();
            switch (op) {
                case 1:
                    String item = input.next();
                    lista.add(item);
                    System.out.println("Adicionado: " + item);
                    break;
                case 2:
                    System.out.println("Lista: " + lista);
                    break;
                case 3:
                    String rem = input.next();
                    if (lista.remove(rem)) System.out.println("Removido: " + rem);
                    else System.out.println("Item não encontrado");
                    break;
                case 0:
                    System.out.println("Até logo!");
                    break;
                default:
                    System.out.println("Opção inválida");
            }
        } while (op != 0);
        input.close();
    }
}
` }],
});

PHASES.push({
  id: 'j13', track: 'java', icon: '📒', level: 3, kind: 'java',
  title: 'Boletim de Notas', subtitle: 'HashMap aninhado (aluno → disciplina → nota)',
  cola: ['colecoes'],
  theory: [
    '`HashMap<K, V>`: `put(chave, valor)`, `get(chave)` (null se não existe), `containsKey`, `keySet()`, `values()`.',
    'Mapa aninhado: `HashMap<String, HashMap<String, Double>>` — o valor do mapa externo é outro mapa.',
    'Antes de usar o mapa interno, crie-o se ainda não existir (`putIfAbsent` ou `if (!containsKey)`).',
  ],
  task: 'Complete a classe `Boletim` (exercício 3 de Tipos Compostos):\n- `void adicionarNota(String aluno, String disciplina, double nota)` (nota repetida na mesma disciplina **substitui** a anterior)\n- `Double getNota(String aluno, String disciplina)` → `null` se não existir\n- `double media(String aluno)` → 0 se o aluno não existir\n- `int totalAlunos()`',
  files: [{ name: 'Boletim.java', code: `import java.util.HashMap;

public class Boletim {
    private HashMap<String, HashMap<String, Double>> notas = new HashMap<>();

    public void adicionarNota(String aluno, String disciplina, double nota) {
    }

    public Double getNota(String aluno, String disciplina) {
        return null;
    }

    public double media(String aluno) {
        return 0;
    }

    public int totalAlunos() {
        return 0;
    }

    public static void main(String[] args) {
        Boletim b = new Boletim();
        b.adicionarNota("Ana", "Java", 9.5);
        b.adicionarNota("Ana", "Cálculo", 7.0);
        b.adicionarNota("Bruno", "Java", 6.0);
        System.out.println(b.notas);
        System.out.println("Média da Ana: " + b.media("Ana"));
    }
}
` }],
  run: { main: 'Boletim', stdin: '' },
  hints: ['`notas.putIfAbsent(aluno, new HashMap<>()); notas.get(aluno).put(disciplina, nota);`', 'Em getNota, cuidado: se o aluno não existe, `notas.get(aluno)` é `null`.', 'Média: percorra `notas.get(aluno).values()`.'],
  test: `
QT.test("Adicionar e consultar nota", () -> {
    Object b = QT.make("Boletim");
    QT.callM(b, "adicionarNota", "Ana", "Java", 9.5);
    QT.eq(9.5, QT.callM(b, "getNota", "Ana", "Java"));
});
QT.test("Nota inexistente → null (aluno e disciplina)", () -> {
    Object b = QT.make("Boletim");
    QT.callM(b, "adicionarNota", "Ana", "Java", 9.5);
    QT.eq(null, QT.callM(b, "getNota", "Ana", "Física"));
    QT.eq(null, QT.callM(b, "getNota", "Zé", "Java"));
});
QT.test("Nota repetida substitui", () -> {
    Object b = QT.make("Boletim");
    QT.callM(b, "adicionarNota", "Ana", "Java", 5.0);
    QT.callM(b, "adicionarNota", "Ana", "Java", 8.0);
    QT.eq(8.0, QT.callM(b, "getNota", "Ana", "Java"));
});
QT.test("Média por aluno", () -> {
    Object b = QT.make("Boletim");
    QT.callM(b, "adicionarNota", "Ana", "Java", 9.0);
    QT.callM(b, "adicionarNota", "Ana", "Cálculo", 6.0);
    QT.callM(b, "adicionarNota", "Bruno", "Java", 4.0);
    QT.eq(7.5, QT.callM(b, "media", "Ana"));
    QT.eq(4.0, QT.callM(b, "media", "Bruno"));
    QT.eq(0.0, QT.callM(b, "media", "Carla"));
});
QT.test("totalAlunos conta alunos distintos", () -> {
    Object b = QT.make("Boletim");
    QT.callM(b, "adicionarNota", "Ana", "Java", 9.0);
    QT.callM(b, "adicionarNota", "Ana", "Cálculo", 6.0);
    QT.callM(b, "adicionarNota", "Bruno", "Java", 4.0);
    QT.eq(2, QT.callM(b, "totalAlunos"));
});`,
  solution: [{ name: 'Boletim.java', code: `import java.util.HashMap;

public class Boletim {
    private HashMap<String, HashMap<String, Double>> notas = new HashMap<>();

    public void adicionarNota(String aluno, String disciplina, double nota) {
        notas.putIfAbsent(aluno, new HashMap<>());
        notas.get(aluno).put(disciplina, nota);
    }

    public Double getNota(String aluno, String disciplina) {
        if (!notas.containsKey(aluno)) return null;
        return notas.get(aluno).get(disciplina);
    }

    public double media(String aluno) {
        if (!notas.containsKey(aluno) || notas.get(aluno).isEmpty()) return 0;
        double soma = 0;
        for (double n : notas.get(aluno).values()) soma += n;
        return soma / notas.get(aluno).size();
    }

    public int totalAlunos() {
        return notas.size();
    }

    public static void main(String[] args) {
        Boletim b = new Boletim();
        b.adicionarNota("Ana", "Java", 9.5);
        b.adicionarNota("Ana", "Cálculo", 7.0);
        b.adicionarNota("Bruno", "Java", 6.0);
        System.out.println(b.notas);
        System.out.println("Média da Ana: " + b.media("Ana"));
    }
}
` }],
});

PHASES.push({
  id: 'j14', track: 'java', icon: '🔤', level: 3, kind: 'java',
  title: 'Contador de Palavras', subtitle: 'HashSet e HashMap de frequências',
  cola: ['colecoes', 'string'],
  theory: [
    '`HashSet` não guarda repetidos: ótimo para contar elementos **distintos**.',
    'Frequência: `mapa.put(p, mapa.getOrDefault(p, 0) + 1);`',
    '`texto.toLowerCase().trim().split("\\\\s+")` separa as palavras por espaços.',
  ],
  task: 'Na classe `Palavras`, implemente (ignore maiúsculas/minúsculas; texto vazio não tem palavras):\n- `static int distintas(String texto)` — quantidade de palavras diferentes\n- `static HashMap<String, Integer> frequencia(String texto)` — palavra → quantidade\n- `static String maisFrequente(String texto)` — a palavra que mais aparece (empate: tanto faz; vazio: `null`)',
  files: [{ name: 'Palavras.java', code: `import java.util.HashMap;
import java.util.HashSet;

public class Palavras {

    public static int distintas(String texto) {
        return 0;
    }

    public static HashMap<String, Integer> frequencia(String texto) {
        return new HashMap<>();
    }

    public static String maisFrequente(String texto) {
        return null;
    }

    public static void main(String[] args) {
        String t = "O rato roeu a roupa do rei de Roma e o rei riu";
        System.out.println(distintas(t));
        System.out.println(frequencia(t));
        System.out.println(maisFrequente(t));
    }
}
` }],
  run: { main: 'Palavras', stdin: '' },
  hints: ['Trate o caso `texto.trim().isEmpty()` primeiro.', 'Reaproveite: `distintas` pode ser `frequencia(texto).size()`.'],
  test: `
QT.test("distintas: \\"a b a c\\" → 3", () -> QT.eq(3, QT.call("Palavras", "distintas", "a b a c")));
QT.test("distintas ignora maiúsculas: \\"Java java JAVA web\\" → 2", () -> QT.eq(2, QT.call("Palavras", "distintas", "Java java JAVA web")));
QT.test("distintas com espaços extras: \\"  oi   oi  \\" → 1", () -> QT.eq(1, QT.call("Palavras", "distintas", "  oi   oi  ")));
QT.test("texto vazio → 0 palavras", () -> QT.eq(0, QT.call("Palavras", "distintas", "   ")));
QT.test("frequencia(\\"o rei e o Rei\\")", () -> {
    java.util.Map<?, ?> m = (java.util.Map<?, ?>) QT.call("Palavras", "frequencia", "o rei e o Rei");
    QT.eq(3, m.size()); QT.eq(2, m.get("o")); QT.eq(2, m.get("rei")); QT.eq(1, m.get("e"));
});
QT.test("maisFrequente", () -> {
    QT.eq("rei", QT.call("Palavras", "maisFrequente", "o rei riu e o REI rei chorou"));
    QT.eq(null, QT.call("Palavras", "maisFrequente", ""));
});`,
  solution: [{ name: 'Palavras.java', code: `import java.util.HashMap;
import java.util.HashSet;

public class Palavras {

    public static int distintas(String texto) {
        HashSet<String> set = new HashSet<>(frequencia(texto).keySet());
        return set.size();
    }

    public static HashMap<String, Integer> frequencia(String texto) {
        HashMap<String, Integer> m = new HashMap<>();
        if (texto.trim().isEmpty()) return m;
        for (String p : texto.toLowerCase().trim().split("\\\\s+")) {
            m.put(p, m.getOrDefault(p, 0) + 1);
        }
        return m;
    }

    public static String maisFrequente(String texto) {
        String melhor = null;
        int max = 0;
        HashMap<String, Integer> m = frequencia(texto);
        for (String p : m.keySet()) {
            if (m.get(p) > max) { max = m.get(p); melhor = p; }
        }
        return melhor;
    }

    public static void main(String[] args) {
        String t = "O rato roeu a roupa do rei de Roma e o rei riu";
        System.out.println(distintas(t));
        System.out.println(frequencia(t));
        System.out.println(maisFrequente(t));
    }
}
` }],
});

PHASES.push({
  id: 'j15', track: 'java', icon: '🏷️', level: 3, kind: 'java',
  title: 'Carrinho de Compras', subtitle: 'Classes, encapsulamento, equals e hashCode',
  cola: ['poo', 'colecoes'],
  theory: [
    'Atributos `private` + getters públicos = **encapsulamento**. O construtor inicializa o objeto com `this.campo = campo`.',
    '`toString()` define como o objeto aparece no `println`.',
    'Para usar um objeto como **chave de HashMap**, sobrescreva `equals` **e** `hashCode` (dois produtos com o mesmo id são "iguais").',
  ],
  task: 'Implemente o exercício do e-commerce da aula em dois arquivos:\n\n**Product**: atributos privados `productId` (Integer), `name` (String), `price` (double); construtor com os 3; getters; `toString()` no formato `Product{id=1, name=\'Caneta\', price=2.5}`; `equals`/`hashCode` usando **apenas** o `productId`.\n\n**ShoppingCart**: `private Map<Product, Integer> products`; `addProduct(Product p, int qtd)` (se já existe, **soma** a quantidade); `removeProduct(Product p)`; `int getQuantidade(Product p)` (0 se não tem); `double getTotal()`; `int getTotalItens()`.',
  files: [
    { name: 'Product.java', code: `import java.util.Objects;

public class Product {
    // atributos privados

    // construtor

    // getters

    // toString, equals e hashCode
}
` },
    { name: 'ShoppingCart.java', code: `import java.util.HashMap;
import java.util.Map;

public class ShoppingCart {
    private Map<Product, Integer> products = new HashMap<>();

    public void addProduct(Product p, int qtd) {
    }

    public void removeProduct(Product p) {
    }

    public int getQuantidade(Product p) {
        return 0;
    }

    public double getTotal() {
        return 0;
    }

    public int getTotalItens() {
        return 0;
    }

    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();
        Product caneta = new Product(1, "Caneta", 2.5);
        cart.addProduct(caneta, 3);
        cart.addProduct(new Product(2, "Caderno", 15.0), 1);
        System.out.println(caneta);
        System.out.println("Total: " + cart.getTotal());
    }
}
` },
  ],
  run: { main: 'ShoppingCart', stdin: '' },
  hints: ['`@Override public boolean equals(Object obj) { if (this == obj) return true; if (obj == null || getClass() != obj.getClass()) return false; Product p = (Product) obj; return Objects.equals(productId, p.productId); }`', '`@Override public int hashCode() { return Objects.hash(productId); }`', 'Total: percorra `products.keySet()` somando `p.getPrice() * products.get(p)`.'],
  test: `
QT.test("Atributos de Product são private", () -> QT.allPrivate("Product"));
QT.test("Getters de Product", () -> {
    Object p = QT.make("Product", 1, "Caneta", 2.5);
    QT.eq(1, QT.callM(p, "getProductId")); QT.eq("Caneta", QT.callM(p, "getName")); QT.eq(2.5, QT.callM(p, "getPrice"));
});
QT.test("toString de Product", () -> QT.eq("Product{id=1, name='Caneta', price=2.5}", QT.make("Product", 1, "Caneta", 2.5).toString()));
QT.test("equals e hashCode pelo productId", () -> {
    Object a = QT.make("Product", 7, "Caneta", 2.5), b = QT.make("Product", 7, "Caneta azul", 3.0), c = QT.make("Product", 8, "Caneta", 2.5);
    QT.isTrue(a.equals(b), "Produtos com o mesmo id deveriam ser iguais (equals)");
    QT.isTrue(!a.equals(c), "Produtos com ids diferentes não deveriam ser iguais");
    QT.isTrue(a.hashCode() == b.hashCode(), "Objetos iguais devem ter o mesmo hashCode");
});
QT.test("addProduct soma quantidades do mesmo produto", () -> {
    Object cart = QT.make("ShoppingCart");
    QT.callM(cart, "addProduct", QT.make("Product", 1, "Caneta", 2.5), 2);
    QT.callM(cart, "addProduct", QT.make("Product", 1, "Caneta", 2.5), 3);
    QT.eq(5, QT.callM(cart, "getQuantidade", QT.make("Product", 1, "Caneta", 2.5)));
    QT.eq(5, QT.callM(cart, "getTotalItens"));
});
QT.test("getTotal", () -> {
    Object cart = QT.make("ShoppingCart");
    QT.callM(cart, "addProduct", QT.make("Product", 1, "Caneta", 2.5), 4);
    QT.callM(cart, "addProduct", QT.make("Product", 2, "Caderno", 15.0), 2);
    QT.eq(40.0, QT.callM(cart, "getTotal"));
});
QT.test("removeProduct", () -> {
    Object cart = QT.make("ShoppingCart");
    Object p = QT.make("Product", 1, "Caneta", 2.5);
    QT.callM(cart, "addProduct", p, 4);
    QT.callM(cart, "removeProduct", p);
    QT.eq(0, QT.callM(cart, "getQuantidade", p));
    QT.eq(0.0, QT.callM(cart, "getTotal"));
});`,
  solution: [
    { name: 'Product.java', code: `import java.util.Objects;

public class Product {
    private Integer productId;
    private String name;
    private double price;

    public Product(Integer productId, String name, double price) {
        this.productId = productId;
        this.name = name;
        this.price = price;
    }

    public Integer getProductId() { return productId; }
    public String getName() { return name; }
    public double getPrice() { return price; }

    @Override
    public String toString() {
        return "Product{id=" + productId + ", name='" + name + "', price=" + price + "}";
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
    }
}
` },
    { name: 'ShoppingCart.java', code: `import java.util.HashMap;
import java.util.Map;

public class ShoppingCart {
    private Map<Product, Integer> products = new HashMap<>();

    public void addProduct(Product p, int qtd) {
        products.put(p, products.getOrDefault(p, 0) + qtd);
    }

    public void removeProduct(Product p) {
        products.remove(p);
    }

    public int getQuantidade(Product p) {
        return products.getOrDefault(p, 0);
    }

    public double getTotal() {
        double total = 0;
        for (Product p : products.keySet()) total += p.getPrice() * products.get(p);
        return total;
    }

    public int getTotalItens() {
        int n = 0;
        for (int q : products.values()) n += q;
        return n;
    }

    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();
        Product caneta = new Product(1, "Caneta", 2.5);
        cart.addProduct(caneta, 3);
        cart.addProduct(new Product(2, "Caderno", 15.0), 1);
        System.out.println(caneta);
        System.out.println("Total: " + cart.getTotal());
    }
}
` },
  ],
});

PHASES.push({
  id: 'j16', track: 'java', icon: '🧬', level: 4, kind: 'java',
  title: 'Usuários da Instituição', subtitle: 'Herança: extends, super e @Override',
  cola: ['heranca'],
  theory: [
    '`class Professor extends Usuario` herda atributos e métodos (não privados) da superclasse.',
    'O construtor da filha chama o do pai com `super(...)` na **primeira linha**.',
    'Sobrescreva com `@Override` e reaproveite o comportamento do pai com `super.metodo()`.',
  ],
  task: 'Implemente o sistema de usuários (exercício de Herança da aula):\n\n**Usuario**(email, nome, sobrenome): `getNomeCompleto()` → `"Ana Souza"`; `exibirInfo()` → `"Ana Souza <ana@ime.eb.br>"`.\n\n**Professor** extends Usuario: lista `disciplinas`; `addDisciplina(String)`; `getDisciplinas()`; `exibirInfo()` → info do pai + ` | Professor de [LabProg, Cálculo]`.\n\n**Aluno** extends Usuario: construtor `(email, nome, sobrenome, matricula)`; `getMatricula()`; `exibirInfo()` → info do pai + ` | Aluno 2025001`.',
  files: [
    { name: 'Usuario.java', code: `public class Usuario {
    protected String email;
    protected String nome;
    protected String sobrenome;

    public Usuario(String email, String nome, String sobrenome) {
    }

    public String getNomeCompleto() {
        return "";
    }

    public String exibirInfo() {
        return "";
    }
}
` },
    { name: 'Professor.java', code: `import java.util.ArrayList;
import java.util.List;

public class Professor {

}
` },
    { name: 'Aluno.java', code: `public class Aluno {

}
` },
    { name: 'Main.java', code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Professor p = new Professor("vanzan@ime.eb.br", "Matheus", "Vanzan");
        p.addDisciplina("LabProg");
        Aluno a = new Aluno("ana@ime.eb.br", "Ana", "Souza", "2025001");

        List<Usuario> usuarios = new ArrayList<>();
        usuarios.add(p);
        usuarios.add(a);
        for (Usuario u : usuarios) {
            System.out.println(u.exibirInfo());   // polimorfismo
        }
    }
}
` },
  ],
  run: { main: 'Main', stdin: '' },
  hints: ['`public class Professor extends Usuario { private List<String> disciplinas = new ArrayList<>(); public Professor(String e, String n, String s) { super(e, n, s); } }`', '`@Override public String exibirInfo() { return super.exibirInfo() + " | Professor de " + disciplinas; }`'],
  test: `
QT.test("Usuario: getNomeCompleto e exibirInfo", () -> {
    Object u = QT.make("Usuario", "ana@ime.eb.br", "Ana", "Souza");
    QT.eq("Ana Souza", QT.callM(u, "getNomeCompleto"));
    QT.eq("Ana Souza <ana@ime.eb.br>", QT.callM(u, "exibirInfo"));
});
QT.test("Professor estende Usuario", () -> QT.eq("Usuario", QT.cls("Professor").getSuperclass().getSimpleName()));
QT.test("Aluno estende Usuario", () -> QT.eq("Usuario", QT.cls("Aluno").getSuperclass().getSimpleName()));
QT.test("Professor.exibirInfo com disciplinas", () -> {
    Object p = QT.make("Professor", "vanzan@ime.eb.br", "Matheus", "Vanzan");
    QT.callM(p, "addDisciplina", "LabProg");
    QT.callM(p, "addDisciplina", "Cálculo");
    QT.eq("Matheus Vanzan <vanzan@ime.eb.br> | Professor de [LabProg, Cálculo]", QT.callM(p, "exibirInfo"));
    QT.eq(2, ((java.util.List<?>) QT.callM(p, "getDisciplinas")).size());
});
QT.test("Aluno.exibirInfo com matrícula", () -> {
    Object a = QT.make("Aluno", "ana@ime.eb.br", "Ana", "Souza", "2025001");
    QT.eq("2025001", QT.callM(a, "getMatricula"));
    QT.eq("Ana Souza <ana@ime.eb.br> | Aluno 2025001", QT.callM(a, "exibirInfo"));
});
QT.test("Herdou getNomeCompleto (sem reescrever)", () -> {
    Object a = QT.make("Aluno", "b@ime.eb.br", "Bruno", "Lima", "1");
    QT.eq("Bruno Lima", QT.callM(a, "getNomeCompleto"));
});`,
  solution: [
    { name: 'Usuario.java', code: `public class Usuario {
    protected String email;
    protected String nome;
    protected String sobrenome;

    public Usuario(String email, String nome, String sobrenome) {
        this.email = email;
        this.nome = nome;
        this.sobrenome = sobrenome;
    }

    public String getNomeCompleto() {
        return nome + " " + sobrenome;
    }

    public String exibirInfo() {
        return getNomeCompleto() + " <" + email + ">";
    }
}
` },
    { name: 'Professor.java', code: `import java.util.ArrayList;
import java.util.List;

public class Professor extends Usuario {
    private List<String> disciplinas = new ArrayList<>();

    public Professor(String email, String nome, String sobrenome) {
        super(email, nome, sobrenome);
    }

    public void addDisciplina(String d) { disciplinas.add(d); }
    public List<String> getDisciplinas() { return disciplinas; }

    @Override
    public String exibirInfo() {
        return super.exibirInfo() + " | Professor de " + disciplinas;
    }
}
` },
    { name: 'Aluno.java', code: `public class Aluno extends Usuario {
    private String matricula;

    public Aluno(String email, String nome, String sobrenome, String matricula) {
        super(email, nome, sobrenome);
        this.matricula = matricula;
    }

    public String getMatricula() { return matricula; }

    @Override
    public String exibirInfo() {
        return super.exibirInfo() + " | Aluno " + matricula;
    }
}
` },
    { name: 'Main.java', code: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Professor p = new Professor("vanzan@ime.eb.br", "Matheus", "Vanzan");
        p.addDisciplina("LabProg");
        Aluno a = new Aluno("ana@ime.eb.br", "Ana", "Souza", "2025001");

        List<Usuario> usuarios = new ArrayList<>();
        usuarios.add(p);
        usuarios.add(a);
        for (Usuario u : usuarios) {
            System.out.println(u.exibirInfo());
        }
    }
}
` },
  ],
});

PHASES.push({
  id: 'j17', track: 'java', icon: '🔷', level: 4, kind: 'java',
  title: 'Formas Geométricas', subtitle: 'Interface, implements e polimorfismo',
  cola: ['heranca'],
  theory: [
    'Uma **interface** é um contrato: métodos sem corpo, `public abstract` por padrão.',
    '`class Circulo implements Forma` precisa implementar **todos** os métodos da interface.',
    'Com polimorfismo, uma `List<Forma>` guarda círculos e retângulos e chama `area()` de cada um.',
  ],
  task: 'Crie:\n- interface **Forma** com `double area()`, `double perimetro()` e `String nome()`;\n- **Retangulo**(largura, altura) implements Forma — nome `"Retângulo"`;\n- **Circulo**(raio) implements Forma — nome `"Círculo"` (use `Math.PI`);\n- **Quadrado**(lado) **extends Retangulo** — nome `"Quadrado"`;\n- **Formas**: `static double areaTotal(List<Forma> lista)` e `static Forma maior(List<Forma> lista)` (maior área).',
  files: [
    { name: 'Forma.java', code: `public interface Forma {

}
` },
    { name: 'Retangulo.java', code: `public class Retangulo {

}
` },
    { name: 'Circulo.java', code: `public class Circulo {

}
` },
    { name: 'Quadrado.java', code: `public class Quadrado {

}
` },
    { name: 'Formas.java', code: `import java.util.ArrayList;
import java.util.List;

public class Formas {

    public static double areaTotal(List<Forma> lista) {
        return 0;
    }

    public static Forma maior(List<Forma> lista) {
        return null;
    }

    public static void main(String[] args) {
        List<Forma> l = new ArrayList<>();
        l.add(new Retangulo(2, 3));
        l.add(new Circulo(1));
        l.add(new Quadrado(4));
        for (Forma f : l) System.out.printf("%s: área %.2f%n", f.nome(), f.area());
        System.out.println("Total: " + areaTotal(l));
        System.out.println("Maior: " + maior(l).nome());
    }
}
` },
  ],
  run: { main: 'Formas', stdin: '' },
  hints: ['`public class Quadrado extends Retangulo { public Quadrado(double lado) { super(lado, lado); } @Override public String nome() { return "Quadrado"; } }`', 'Área do círculo: `Math.PI * raio * raio`; perímetro: `2 * Math.PI * raio`.'],
  test: `
QT.test("Forma é uma interface", () -> QT.isTrue(QT.cls("Forma").isInterface(), "Forma deveria ser declarada com 'interface'"));
QT.test("Retangulo e Circulo implementam Forma", () -> {
    QT.isTrue(QT.cls("Forma").isAssignableFrom(QT.cls("Retangulo")), "Retangulo deve implementar Forma");
    QT.isTrue(QT.cls("Forma").isAssignableFrom(QT.cls("Circulo")), "Circulo deve implementar Forma");
});
QT.test("Quadrado estende Retangulo", () -> QT.eq("Retangulo", QT.cls("Quadrado").getSuperclass().getSimpleName()));
QT.test("Retangulo(2,3): área 6, perímetro 10", () -> {
    Object r = QT.make("Retangulo", 2.0, 3.0);
    QT.eq(6.0, QT.callM(r, "area")); QT.eq(10.0, QT.callM(r, "perimetro")); QT.eq("Retângulo", QT.callM(r, "nome"));
});
QT.test("Circulo(1): área π, perímetro 2π", () -> {
    Object c = QT.make("Circulo", 1.0);
    QT.eq(Math.PI, QT.callM(c, "area")); QT.eq(2 * Math.PI, QT.callM(c, "perimetro")); QT.eq("Círculo", QT.callM(c, "nome"));
});
QT.test("Quadrado(4): área 16 e nome Quadrado", () -> {
    Object q = QT.make("Quadrado", 4.0);
    QT.eq(16.0, QT.callM(q, "area")); QT.eq(16.0, QT.callM(q, "perimetro")); QT.eq("Quadrado", QT.callM(q, "nome"));
});
QT.test("areaTotal e maior", () -> {
    java.util.List<Object> l = new java.util.ArrayList<>();
    l.add(QT.make("Retangulo", 2.0, 3.0)); l.add(QT.make("Circulo", 1.0)); l.add(QT.make("Quadrado", 4.0));
    QT.eq(22 + Math.PI, QT.call("Formas", "areaTotal", l));
    QT.eq("Quadrado", QT.callM(QT.call("Formas", "maior", l), "nome"));
});`,
  solution: [
    { name: 'Forma.java', code: `public interface Forma {
    double area();
    double perimetro();
    String nome();
}
` },
    { name: 'Retangulo.java', code: `public class Retangulo implements Forma {
    private double largura, altura;

    public Retangulo(double largura, double altura) {
        this.largura = largura;
        this.altura = altura;
    }

    @Override public double area() { return largura * altura; }
    @Override public double perimetro() { return 2 * (largura + altura); }
    @Override public String nome() { return "Retângulo"; }
}
` },
    { name: 'Circulo.java', code: `public class Circulo implements Forma {
    private double raio;

    public Circulo(double raio) { this.raio = raio; }

    @Override public double area() { return Math.PI * raio * raio; }
    @Override public double perimetro() { return 2 * Math.PI * raio; }
    @Override public String nome() { return "Círculo"; }
}
` },
    { name: 'Quadrado.java', code: `public class Quadrado extends Retangulo {
    public Quadrado(double lado) { super(lado, lado); }

    @Override public String nome() { return "Quadrado"; }
}
` },
    { name: 'Formas.java', code: `import java.util.ArrayList;
import java.util.List;

public class Formas {

    public static double areaTotal(List<Forma> lista) {
        double t = 0;
        for (Forma f : lista) t += f.area();
        return t;
    }

    public static Forma maior(List<Forma> lista) {
        Forma m = null;
        for (Forma f : lista) if (m == null || f.area() > m.area()) m = f;
        return m;
    }

    public static void main(String[] args) {
        List<Forma> l = new ArrayList<>();
        l.add(new Retangulo(2, 3));
        l.add(new Circulo(1));
        l.add(new Quadrado(4));
        for (Forma f : l) System.out.printf("%s: área %.2f%n", f.nome(), f.area());
        System.out.println("Total: " + areaTotal(l));
        System.out.println("Maior: " + maior(l).nome());
    }
}
` },
  ],
});

PHASES.push({
  id: 'j18', track: 'java', icon: '🧪', level: 4, kind: 'java',
  title: 'Bubble Sort Genérico', subtitle: 'Generics: <T extends Comparable<T>> e classe Caixa<T>',
  cola: ['generics'],
  theory: [
    'Generics evitam duplicar código para cada tipo: `class Caixa<T> { private T conteudo; }`.',
    'Método genérico: `public static <T extends Comparable<T>> void bubbleSort(T[] v)` — o `extends Comparable` garante o `compareTo`.',
    '`a.compareTo(b)` é > 0 se `a` vem depois de `b`. Generics só aceitam objetos: `Integer[]`, não `int[]`.',
  ],
  task: 'Na classe `Ordenador`, implemente o **bubble sort genérico** (exercício de Generics da aula) e `maximo`. Crie também a classe genérica `Caixa<T>` com `guardar(T item)`, `T abrir()` e `boolean estaVazia()`.',
  files: [
    { name: 'Ordenador.java', code: `import java.util.Arrays;
import java.util.List;

public class Ordenador {

    public static <T extends Comparable<T>> void bubbleSort(T[] v) {
        // ordene v em ordem crescente
    }

    public static <T extends Comparable<T>> T maximo(List<T> lista) {
        return null;
    }

    public static void main(String[] args) {
        Integer[] nums = {5, 2, 9, 1, 3};
        String[] nomes = {"Java", "CSS", "HTML", "Spring"};
        bubbleSort(nums);
        bubbleSort(nomes);
        System.out.println(Arrays.toString(nums));
        System.out.println(Arrays.toString(nomes));
        System.out.println(maximo(List.of(3, 8, 1)));
    }
}
` },
    { name: 'Caixa.java', code: `public class Caixa<T> {

}
` },
  ],
  run: { main: 'Ordenador', stdin: '' },
  hints: ['Dois laços: `for i` de 0 a `v.length - 1`, `for j` de 0 a `v.length - 1 - i`; se `v[j].compareTo(v[j+1]) > 0`, troque.', 'Caixa: `private T conteudo; public void guardar(T item) { conteudo = item; } public T abrir() { return conteudo; } public boolean estaVazia() { return conteudo == null; }`'],
  test: `
QT.test("bubbleSort(Integer[])", () -> { Integer[] v = {5, 2, 9, 1, 3}; QT.call("Ordenador", "bubbleSort", (Object) v); QT.eq(new Integer[]{1, 2, 3, 5, 9}, v); });
QT.test("bubbleSort(String[])", () -> { String[] v = {"Java", "CSS", "HTML", "Spring"}; QT.call("Ordenador", "bubbleSort", (Object) v); QT.eq(new String[]{"CSS", "HTML", "Java", "Spring"}, v); });
QT.test("bubbleSort com repetidos e já ordenado", () -> {
    Integer[] v = {3, 1, 3, 1}; QT.call("Ordenador", "bubbleSort", (Object) v); QT.eq(new Integer[]{1, 1, 3, 3}, v);
    Integer[] w = {1, 2, 3}; QT.call("Ordenador", "bubbleSort", (Object) w); QT.eq(new Integer[]{1, 2, 3}, w);
});
QT.test("maximo(List)", () -> {
    QT.eq(8, QT.call("Ordenador", "maximo", java.util.List.of(3, 8, 1)));
    QT.eq("web", QT.call("Ordenador", "maximo", java.util.List.of("java", "web", "css")));
});
QT.test("Caixa é genérica (Caixa<T>)", () -> QT.eq(1, QT.cls("Caixa").getTypeParameters().length));
QT.test("Caixa guarda e abre", () -> {
    Object c = QT.make("Caixa");
    QT.eq(true, QT.callM(c, "estaVazia"));
    QT.callM(c, "guardar", "segredo");
    QT.eq("segredo", QT.callM(c, "abrir"));
    QT.eq(false, QT.callM(c, "estaVazia"));
});`,
  solution: [
    { name: 'Ordenador.java', code: `import java.util.Arrays;
import java.util.List;

public class Ordenador {

    public static <T extends Comparable<T>> void bubbleSort(T[] v) {
        for (int i = 0; i < v.length - 1; i++) {
            for (int j = 0; j < v.length - 1 - i; j++) {
                if (v[j].compareTo(v[j + 1]) > 0) {
                    T tmp = v[j];
                    v[j] = v[j + 1];
                    v[j + 1] = tmp;
                }
            }
        }
    }

    public static <T extends Comparable<T>> T maximo(List<T> lista) {
        T m = null;
        for (T x : lista) if (m == null || x.compareTo(m) > 0) m = x;
        return m;
    }

    public static void main(String[] args) {
        Integer[] nums = {5, 2, 9, 1, 3};
        String[] nomes = {"Java", "CSS", "HTML", "Spring"};
        bubbleSort(nums);
        bubbleSort(nomes);
        System.out.println(Arrays.toString(nums));
        System.out.println(Arrays.toString(nomes));
        System.out.println(maximo(List.of(3, 8, 1)));
    }
}
` },
    { name: 'Caixa.java', code: `public class Caixa<T> {
    private T conteudo;

    public void guardar(T item) { conteudo = item; }
    public T abrir() { return conteudo; }
    public boolean estaVazia() { return conteudo == null; }
}
` },
  ],
});

PHASES.push({
  id: 'j19', track: 'java', icon: '💾', level: 4, kind: 'java',
  title: 'Agenda em Arquivo', subtitle: 'FileWriter, BufferedReader e IOException',
  cola: ['arquivos'],
  theory: [
    'Escrever: `new BufferedWriter(new FileWriter(caminho, append))` → `write`, `newLine`, `close`.',
    'Ler: `new BufferedReader(new FileReader(caminho))` → `readLine()` até retornar `null`.',
    'E/S lança `IOException`: trate com `try { } catch (IOException e) { }`.',
  ],
  task: 'Na classe `Arquivo`, implemente:\n- `static void salvar(String caminho, List<String> linhas)` — **sobrescreve** o arquivo, uma linha por item;\n- `static void adicionar(String caminho, String linha)` — acrescenta no final (**append**);\n- `static List<String> ler(String caminho)` — devolve as linhas; se o arquivo não existir, devolve lista **vazia** (sem lançar exceção).',
  files: [{ name: 'Arquivo.java', code: `import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class Arquivo {

    public static void salvar(String caminho, List<String> linhas) {
    }

    public static void adicionar(String caminho, String linha) {
    }

    public static List<String> ler(String caminho) {
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        salvar("agenda.txt", List.of("Prova de Lab Prog", "Entregar relatório"));
        adicionar("agenda.txt", "Estudar Spring");
        System.out.println(ler("agenda.txt"));
    }
}
` }],
  run: { main: 'Arquivo', stdin: '' },
  hints: ['`FileWriter(caminho, false)` sobrescreve; `FileWriter(caminho, true)` acrescenta.', 'No `ler`, coloque o laço `while ((line = br.readLine()) != null)` dentro do `try` e retorne a lista mesmo no `catch`.'],
  test: `
QT.test("salvar + ler", () -> {
    QT.call("Arquivo", "salvar", "t1.txt", java.util.List.of("a", "b", "c"));
    QT.eq(java.util.List.of("a", "b", "c"), QT.call("Arquivo", "ler", "t1.txt"));
});
QT.test("salvar sobrescreve o conteúdo anterior", () -> {
    QT.call("Arquivo", "salvar", "t2.txt", java.util.List.of("velho1", "velho2"));
    QT.call("Arquivo", "salvar", "t2.txt", java.util.List.of("novo"));
    QT.eq(java.util.List.of("novo"), QT.call("Arquivo", "ler", "t2.txt"));
});
QT.test("adicionar acrescenta no final", () -> {
    QT.call("Arquivo", "salvar", "t3.txt", java.util.List.of("um"));
    QT.call("Arquivo", "adicionar", "t3.txt", "dois");
    QT.call("Arquivo", "adicionar", "t3.txt", "três");
    QT.eq(java.util.List.of("um", "dois", "três"), QT.call("Arquivo", "ler", "t3.txt"));
});
QT.test("adicionar cria o arquivo se não existir", () -> {
    QT.call("Arquivo", "adicionar", "t4.txt", "primeira");
    QT.eq(java.util.List.of("primeira"), QT.call("Arquivo", "ler", "t4.txt"));
});
QT.test("ler arquivo inexistente → lista vazia", () -> {
    Object r = QT.call("Arquivo", "ler", "nao_existe.txt");
    QT.isTrue(r != null, "Retornou null em vez de lista vazia");
    QT.eq(0, ((java.util.List<?>) r).size());
});`,
  solution: [{ name: 'Arquivo.java', code: `import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class Arquivo {

    public static void salvar(String caminho, List<String> linhas) {
        try {
            BufferedWriter bw = new BufferedWriter(new FileWriter(caminho, false));
            for (String l : linhas) {
                bw.write(l);
                bw.newLine();
            }
            bw.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void adicionar(String caminho, String linha) {
        try {
            BufferedWriter bw = new BufferedWriter(new FileWriter(caminho, true));
            bw.write(linha);
            bw.newLine();
            bw.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static List<String> ler(String caminho) {
        List<String> linhas = new ArrayList<>();
        try {
            BufferedReader br = new BufferedReader(new FileReader(caminho));
            String line;
            while ((line = br.readLine()) != null) {
                linhas.add(line);
            }
            br.close();
        } catch (IOException e) {
            // arquivo não existe: devolve lista vazia
        }
        return linhas;
    }

    public static void main(String[] args) {
        salvar("agenda.txt", List.of("Prova de Lab Prog", "Entregar relatório"));
        adicionar("agenda.txt", "Estudar Spring");
        System.out.println(ler("agenda.txt"));
    }
}
` }],
});

PHASES.push({
  id: 'j20', track: 'java', icon: '📑', level: 4, kind: 'java',
  title: 'Usuários do CSV', subtitle: 'Ler CSV, split e objetos (o UserManager da aula)',
  cola: ['arquivos', 'colecoes'],
  theory: [
    'Cada linha do CSV vira um objeto: `String[] values = line.split(",");`',
    'Pule a primeira linha (cabeçalho). Converta texto em número com `Integer.parseInt(values[0])`.',
    'Compare `Integer` com `equals` (não com `==`): `u.getId().equals(id)`.',
  ],
  task: 'O arquivo `users.csv` (colunas `id,email,firstName,lastName`) já existe na pasta. A classe `User` está pronta. Complete o `UserManager` (o mesmo da aula de Java Web):\n- o **construtor** lê `users.csv` e cria a lista de usuários (pulando o cabeçalho);\n- `ArrayList<User> getAll()`;\n- `User getUserById(Integer id)` → `null` se não existir;\n- `ArrayList<User> buscarPorNome(String trecho)` → usuários cujo `firstName + " " + lastName` contém o trecho (ignorando maiúsculas).',
  extraFiles: { 'users.csv': 'id,email,firstName,lastName\n1,george.bluth@reqres.in,George,Bluth\n2,janet.weaver@reqres.in,Janet,Weaver\n3,emma.wong@reqres.in,Emma,Wong\n4,eve.holt@reqres.in,Eve,Holt\n5,charles.morris@reqres.in,Charles,Morris\n' },
  files: [
    { name: 'UserManager.java', code: `import java.io.*;
import java.util.ArrayList;

public class UserManager {
    private ArrayList<User> users = new ArrayList<>();

    public UserManager() {
        // leia "users.csv" e preencha a lista
    }

    public ArrayList<User> getAll() {
        return users;
    }

    public User getUserById(Integer id) {
        return null;
    }

    public ArrayList<User> buscarPorNome(String trecho) {
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        UserManager m = new UserManager();
        System.out.println(m.getAll());
        System.out.println(m.getUserById(2));
        System.out.println(m.buscarPorNome("mo"));
    }
}
` },
    { name: 'User.java', readonly: true, code: `public class User {
    private Integer id;
    private String email;
    private String firstName;
    private String lastName;

    public User(Integer id, String email, String firstName, String lastName) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public Integer getId() { return id; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }

    @Override
    public String toString() {
        return "User{id=" + id + ", " + firstName + " " + lastName + "}";
    }
}
` },
  ],
  run: { main: 'UserManager', stdin: '' },
  hints: ['Use `BufferedReader` + `readLine()`; uma variável `boolean primeira = true` ajuda a pular o cabeçalho.', '`new User(Integer.parseInt(v[0]), v[1], v[2], v[3])`', 'Busca: `(u.getFirstName() + " " + u.getLastName()).toLowerCase().contains(trecho.toLowerCase())`'],
  test: `
QT.test("Lê os 5 usuários (sem o cabeçalho)", () -> QT.eq(5, ((java.util.List<?>) QT.callM(QT.make("UserManager"), "getAll")).size()));
QT.test("Primeiro usuário é George Bluth com id 1", () -> {
    Object u = ((java.util.List<?>) QT.callM(QT.make("UserManager"), "getAll")).get(0);
    QT.eq(1, QT.callM(u, "getId")); QT.eq("George", QT.callM(u, "getFirstName")); QT.eq("george.bluth@reqres.in", QT.callM(u, "getEmail"));
});
QT.test("getUserById(3) → Emma", () -> QT.eq("Emma", QT.callM(QT.callM(QT.make("UserManager"), "getUserById", 3), "getFirstName")));
QT.test("getUserById(200) → null", () -> QT.eq(null, QT.callM(QT.make("UserManager"), "getUserById", 200)));
QT.test("getUserById(4) → Eve", () -> QT.eq("Eve", QT.callM(QT.callM(QT.make("UserManager"), "getUserById", 4), "getFirstName")));
QT.test("buscarPorNome(\\"mo\\") → Charles Morris", () -> {
    java.util.List<?> r = (java.util.List<?>) QT.callM(QT.make("UserManager"), "buscarPorNome", "mo");
    QT.eq(1, r.size()); QT.eq("Morris", QT.callM(r.get(0), "getLastName"));
});
QT.test("buscarPorNome ignora maiúsculas: \\"E\\" encontra 5", () -> QT.eq(5, ((java.util.List<?>) QT.callM(QT.make("UserManager"), "buscarPorNome", "E")).size()));`,
  solution: [
    { name: 'UserManager.java', code: `import java.io.*;
import java.util.ArrayList;

public class UserManager {
    private ArrayList<User> users = new ArrayList<>();

    public UserManager() {
        try {
            BufferedReader br = new BufferedReader(new FileReader("users.csv"));
            String line;
            boolean primeira = true;
            while ((line = br.readLine()) != null) {
                if (primeira) { primeira = false; continue; }
                String[] v = line.split(",");
                users.add(new User(Integer.parseInt(v[0]), v[1], v[2], v[3]));
            }
            br.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public ArrayList<User> getAll() {
        return users;
    }

    public User getUserById(Integer id) {
        for (User u : users) {
            if (u.getId().equals(id)) return u;
        }
        return null;
    }

    public ArrayList<User> buscarPorNome(String trecho) {
        ArrayList<User> r = new ArrayList<>();
        for (User u : users) {
            String nome = (u.getFirstName() + " " + u.getLastName()).toLowerCase();
            if (nome.contains(trecho.toLowerCase())) r.add(u);
        }
        return r;
    }

    public static void main(String[] args) {
        UserManager m = new UserManager();
        System.out.println(m.getAll());
        System.out.println(m.getUserById(2));
        System.out.println(m.buscarPorNome("mo"));
    }
}
` },
  ],
});
