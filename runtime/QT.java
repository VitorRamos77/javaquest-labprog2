import java.io.*;
import java.lang.reflect.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Biblioteca de testes da plataforma JavaQuest.
 * Usa reflexão para que o teste compile mesmo que o aluno ainda não tenha
 * criado a classe/método — e assim mostrar uma mensagem amigável.
 * Protocolo de saída:  @@QT|PASS|nome   ou   @@QT|FAIL|nome|mensagem
 */
public class QT {
    public interface Body { void run() throws Throwable; }
    public static class Fail extends RuntimeException { public Fail(String m) { super(m); } }

    static final PrintStream REAL_OUT = System.out;
    static final InputStream REAL_IN = System.in;

    /* ------------------------------------------------------------ */
    public static void test(String name, Body body) {
        try {
            body.run();
            REAL_OUT.println("@@QT|PASS|" + clean(name));
        } catch (Throwable t) {
            restoreIO();
            REAL_OUT.println("@@QT|FAIL|" + clean(name) + "|" + clean(describe(t)));
        }
        REAL_OUT.flush();
    }

    /** Igual a test(), mas falha se demorar mais que ms milissegundos (ex: recursão sem memoização). */
    public static void testTimeout(String name, long ms, Body body) {
        final Throwable[] err = {null};
        Thread t = new Thread(() -> { try { body.run(); } catch (Throwable x) { err[0] = x; } });
        t.setDaemon(true);
        t.start();
        try { t.join(ms); } catch (InterruptedException ignored) { }
        if (t.isAlive()) {
            REAL_OUT.println("@@QT|FAIL|" + clean(name) + "|" + clean("Demorou mais de " + ms + " ms — seu algoritmo está lento demais (use memoização / evite recalcular)."));
        } else if (err[0] != null) {
            REAL_OUT.println("@@QT|FAIL|" + clean(name) + "|" + clean(describe(err[0])));
        } else {
            REAL_OUT.println("@@QT|PASS|" + clean(name));
        }
        REAL_OUT.flush();
    }

    public static void end() { REAL_OUT.println("@@QT|END"); REAL_OUT.flush(); }

    static String clean(String s) { return String.valueOf(s).replace("\r", "").replace("\n", "⏎").replace("|", "¦"); }

    static String describe(Throwable t) {
        while ((t instanceof InvocationTargetException || t instanceof UndeclaredThrowableException) && t.getCause() != null) t = t.getCause();
        if (t instanceof Fail) return t.getMessage();
        if (t instanceof StackOverflowError) return "StackOverflowError — recursão sem caso base (ou infinita)?";
        if (t instanceof OutOfMemoryError) return "OutOfMemoryError — laço infinito adicionando elementos?";
        String where = "";
        for (StackTraceElement e : t.getStackTrace()) {
            String c = e.getClassName();
            if (!c.startsWith("java.") && !c.startsWith("jdk.") && !c.startsWith("sun.") && !c.equals("QT") && !c.startsWith("QT$")
                    && !c.startsWith("MiniSpring") && !c.startsWith("Teste")) {
                where = " (em " + e.getClassName() + "." + e.getMethodName() + ", linha " + e.getLineNumber() + ")";
                break;
            }
        }
        return "Seu código lançou " + t.getClass().getSimpleName() + (t.getMessage() != null ? ": " + t.getMessage() : "") + where;
    }

    /* ------------------------------------------------------------ asserções */
    public static void eq(Object expected, Object actual) {
        if (!same(expected, actual)) throw new Fail("esperado: " + show(expected) + " · obtido: " + show(actual));
    }

    public static void isTrue(boolean cond, String msg) { if (!cond) throw new Fail(msg); }

    /** Exige que o corpo lance uma exceção cujo nome simples seja um dos informados (ex: "IllegalStateException"). */
    public static Throwable expectThrows(String exNames, Body body) {
        try {
            body.run();
        } catch (Fail f) {
            throw f;
        } catch (Throwable t) {
            while ((t instanceof InvocationTargetException || t instanceof UndeclaredThrowableException) && t.getCause() != null) t = t.getCause();
            for (String n : exNames.split("\\|")) {
                for (Class<?> k = t.getClass(); k != null; k = k.getSuperclass())
                    if (k.getSimpleName().equals(n.trim())) return t;
            }
            throw new Fail("Esperava " + exNames.replace("|", " ou ") + ", mas foi lançada " + t.getClass().getSimpleName() + (t.getMessage() != null ? ": " + t.getMessage() : ""));
        }
        throw new Fail("Esperava que lançasse " + exNames.replace("|", " ou ") + ", mas nenhuma exceção foi lançada.");
    }

    /** Extrai um getter de cada elemento: QT.pluck(lista, "getNome") → ["Caneta", "Mouse"] */
    public static List<Object> pluck(Object iterable, String getter, Object... args) throws Throwable {
        if (iterable == null) throw new Fail("A resposta foi null (esperava uma lista).");
        if (!(iterable instanceof Iterable)) throw new Fail("Esperava uma lista, mas a resposta foi " + show(iterable));
        List<Object> r = new ArrayList<>();
        for (Object o : (Iterable<?>) iterable) r.add(callM(o, getter, args));
        return r;
    }

    /** Verifica se a classe está no pacote certo e é public. */
    public static void inPackage(String fqn) {
        Class<?> c;
        try { c = Class.forName(fqn); }
        catch (ClassNotFoundException e) {
            String simple = fqn.substring(fqn.lastIndexOf('.') + 1);
            throw new Fail("Não encontrei " + fqn + ". O arquivo " + simple + ".java começa com \"package " + fqn.substring(0, Math.max(0, fqn.lastIndexOf('.'))) + ";\"?");
        }
        if (!Modifier.isPublic(c.getModifiers())) throw new Fail(c.getSimpleName() + " precisa ser public para ser usada por classes de outros pacotes.");
    }

    public static void fail(String msg) { throw new Fail(msg); }

    static boolean same(Object a, Object b) {
        if (a == null || b == null) return a == b;
        if (a instanceof Number && b instanceof Number) {
            Number x = (Number) a, y = (Number) b;
            boolean fx = a instanceof Double || a instanceof Float, fy = b instanceof Double || b instanceof Float;
            if (fx || fy) return Math.abs(x.doubleValue() - y.doubleValue()) < 1e-6;
            return x.longValue() == y.longValue();
        }
        if (a instanceof Character && b instanceof String || a instanceof String && b instanceof Character) return a.toString().equals(b.toString());
        if (a.getClass().isArray() && b.getClass().isArray()) return show(a).equals(show(b));
        if (a instanceof Collection && b instanceof Collection && !(a instanceof Set) && !(b instanceof Set)) {
            Iterator<?> i = ((Collection<?>) a).iterator(), j = ((Collection<?>) b).iterator();
            while (i.hasNext() && j.hasNext()) if (!same(i.next(), j.next())) return false;
            return !i.hasNext() && !j.hasNext();
        }
        return a.equals(b);
    }

    public static String show(Object o) {
        if (o == null) return "null";
        if (o instanceof String) return "\"" + o + "\"";
        if (o instanceof Character) return "'" + o + "'";
        if (o.getClass().isArray()) {
            int n = Array.getLength(o);
            StringBuilder b = new StringBuilder("[");
            for (int i = 0; i < n; i++) { if (i > 0) b.append(", "); b.append(show(Array.get(o, i))); }
            return b.append("]").toString();
        }
        return String.valueOf(o);
    }

    /* ------------------------------------------------------------ saída/entrada padrão */
    /** Executa o main da classe com a entrada dada e devolve tudo que foi impresso. */
    public static String out(String className, String stdin, String... args) throws Throwable {
        Class<?> c = cls(className);
        Method m;
        try { m = c.getMethod("main", String[].class); }
        catch (NoSuchMethodException e) { throw new Fail("A classe " + className + " não tem o método public static void main(String[] args)"); }
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        PrintStream ps = new PrintStream(bo, true, StandardCharsets.UTF_8);
        System.setOut(ps);
        System.setIn(new ByteArrayInputStream(stdin.getBytes(StandardCharsets.UTF_8)));
        try {
            m.invoke(null, (Object) args);
        } catch (InvocationTargetException e) {
            Throwable t = e.getCause();
            if (t instanceof NoSuchElementException)
                throw new Fail("O programa tentou ler mais entradas do que existem (NoSuchElementException). Saída até ali: " + norm(bo.toString(StandardCharsets.UTF_8)));
            throw t;
        } finally {
            restoreIO();
        }
        return bo.toString(StandardCharsets.UTF_8);
    }

    static void restoreIO() { System.setOut(REAL_OUT); System.setIn(REAL_IN); }

    /** Normaliza quebras de linha e espaços no fim das linhas. */
    public static String norm(String s) {
        String[] lines = s.replace("\r\n", "\n").replace('\r', '\n').split("\n", -1);
        StringBuilder b = new StringBuilder();
        for (String l : lines) b.append(l.replaceAll("\\s+$", "")).append("\n");
        return b.toString().replaceAll("\\n+$", "");
    }

    public static void eqOut(String expected, String actual) {
        String e = norm(expected), a = norm(actual);
        if (!e.equals(a)) throw new Fail("saída esperada: " + show(e) + " · saída obtida: " + show(a));
    }

    /** Verifica se as linhas esperadas aparecem, nessa ordem, na saída (pode haver outras linhas entre elas). */
    public static void linesInOrder(String actual, String... expected) {
        List<String> lines = new ArrayList<>();
        for (String l : norm(actual).split("\n")) lines.add(l.trim());
        int k = 0;
        for (String l : lines) if (k < expected.length && l.contains(expected[k])) k++;
        if (k < expected.length) throw new Fail("não encontrei a linha " + show(expected[k]) + " na saída (na ordem esperada). Saída: " + show(norm(actual)));
    }

    /* ------------------------------------------------------------ reflexão */
    public static Class<?> cls(String name) {
        try { return Class.forName(name); }
        catch (ClassNotFoundException e) { throw new Fail("Classe " + name + " não encontrada. Verifique o nome da classe."); }
    }

    /** Chama um método estático: QT.call("Fatorial", "fatIt", 5) */
    public static Object call(String className, String method, Object... args) throws Throwable {
        return invoke(cls(className), null, method, args);
    }

    /** Chama um método de instância. */
    public static Object callM(Object obj, String method, Object... args) throws Throwable {
        return invoke(obj.getClass(), obj, method, args);
    }

    /** Cria um objeto: QT.make("Product", 1, "Caneta", 2.5) */
    public static Object make(String className, Object... args) throws Throwable {
        Class<?> c = cls(className);
        for (Constructor<?> k : c.getDeclaredConstructors()) {
            Object[] conv = convertAll(k.getParameterTypes(), args);
            if (conv != null) {
                k.setAccessible(true);
                try { return k.newInstance(conv); }
                catch (InvocationTargetException e) { throw e.getCause(); }
            }
        }
        throw new Fail("Construtor " + className + "(" + types(args) + ") não encontrado.");
    }

    static Object invoke(Class<?> c, Object target, String name, Object[] args) throws Throwable {
        for (Class<?> k = c; k != null; k = k.getSuperclass()) {
            for (Method m : k.getDeclaredMethods()) {
                if (!m.getName().equals(name)) continue;
                if (target == null && !Modifier.isStatic(m.getModifiers())) continue;
                Object[] conv = convertAll(m.getParameterTypes(), args);
                if (conv == null) continue;
                m.setAccessible(true);
                try { return m.invoke(target, conv); }
                catch (InvocationTargetException e) { throw e.getCause(); }
            }
        }
        // procura também em interfaces (métodos default)
        for (Method m : c.getMethods()) {
            if (m.getName().equals(name)) {
                Object[] conv = convertAll(m.getParameterTypes(), args);
                if (conv != null) {
                    try { return m.invoke(target, conv); }
                    catch (InvocationTargetException e) { throw e.getCause(); }
                }
            }
        }
        throw new Fail("Método " + (target == null ? "static " : "") + name + "(" + types(args) + ") não encontrado em " + c.getSimpleName() + ".");
    }

    static String types(Object[] args) {
        StringJoiner j = new StringJoiner(", ");
        for (Object a : args) j.add(a == null ? "null" : a.getClass().getSimpleName());
        return j.toString();
    }

    static Object[] convertAll(Class<?>[] pt, Object[] args) {
        if (pt.length != args.length) return null;
        Object[] r = new Object[args.length];
        for (int i = 0; i < pt.length; i++) {
            Object v = convert(pt[i], args[i]);
            if (v == NO) return null;
            r[i] = v;
        }
        return r;
    }

    static final Object NO = new Object();

    static Object convert(Class<?> t, Object v) {
        if (v == null) return t.isPrimitive() ? NO : null;
        Class<?> w = wrap(t);
        if (w.isInstance(v)) return v;
        if (v instanceof Number && Number.class.isAssignableFrom(w)) {
            Number n = (Number) v;
            boolean integral = !(v instanceof Double || v instanceof Float);
            if (w == Long.class && integral) return n.longValue();
            if (w == Integer.class && integral && (v instanceof Short || v instanceof Byte)) return n.intValue();
            if (w == Double.class) return n.doubleValue();
            if (w == Float.class) return n.floatValue();
        }
        return NO;
    }

    static Class<?> wrap(Class<?> t) {
        if (!t.isPrimitive()) return t;
        if (t == int.class) return Integer.class; if (t == long.class) return Long.class;
        if (t == double.class) return Double.class; if (t == float.class) return Float.class;
        if (t == boolean.class) return Boolean.class; if (t == char.class) return Character.class;
        if (t == short.class) return Short.class; if (t == byte.class) return Byte.class;
        return Void.class;
    }

    /** Lê um campo (mesmo privado). */
    public static Object field(Object obj, String name) throws Exception {
        for (Class<?> k = obj.getClass(); k != null; k = k.getSuperclass()) {
            try { Field f = k.getDeclaredField(name); f.setAccessible(true); return f.get(obj); }
            catch (NoSuchFieldException ignored) { }
        }
        throw new Fail("Atributo " + name + " não encontrado em " + obj.getClass().getSimpleName());
    }

    /** Verifica se todos os atributos declarados na classe são private. */
    public static void allPrivate(String className) {
        for (Field f : cls(className).getDeclaredFields()) {
            if (Modifier.isStatic(f.getModifiers()) || f.isSynthetic()) continue;
            if (!Modifier.isPrivate(f.getModifiers()))
                throw new Fail("O atributo " + f.getName() + " de " + className + " deveria ser private (encapsulamento).");
        }
    }

    public static long millis(Body b) throws Throwable {
        long t = System.nanoTime(); b.run(); return (System.nanoTime() - t) / 1_000_000;
    }
}
