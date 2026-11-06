import java.io.File;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.time.temporal.Temporal;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;

/**
 * Simulador mínimo do Spring MVC + Spring Data para o JavaQuest.
 * - encontra as classes @RestController/@Controller compiladas do aluno
 * - mapeia @RequestMapping/@GetMapping/@PostMapping/... com {variáveis}
 * - injeta @Autowired (repositórios CrudRepository viram implementações em memória)
 * - serializa o retorno como JSON (chaves ordenadas)
 */
public class MiniSpring {
    public static class Response {
        public final int status; public final Object body; public final String json;
        Response(int s, Object b, String j) { status = s; body = b; json = j; }
        public String toString() { return status + " " + json; }
    }

    static List<Class<?>> userClasses;
    static final Map<Class<?>, Object> beans = new HashMap<>();
    static final List<Route> routes = new ArrayList<>();
    static boolean started = false;

    static class Route {
        String httpMethod; String pattern; Method method; Object controller;
        public String toString() { return httpMethod + " " + pattern; }
    }

    /* ------------------------------------------------------------ inicialização */
    public static synchronized void start() {
        if (started) return;
        started = true;
        userClasses = new ArrayList<>();
        String dir = System.getProperty("qt.classes");
        if (dir != null) scan(new File(dir), "");
        userClasses.removeIf(c -> c.getName().equals("Teste"));
        for (Class<?> c : userClasses) {
            if (c.isAnnotationPresent(RestController.class) || c.isAnnotationPresent(Controller.class)
                    || c.isAnnotationPresent(org.springframework.stereotype.Controller.class)) {
                Object ctrl = bean(c);
                String base = "";
                RequestMapping rm = c.getAnnotation(RequestMapping.class);
                if (rm != null) base = first(rm.value(), rm.path());
                for (Method m : c.getDeclaredMethods()) {
                    String[] hm = mapping(m);
                    if (hm == null) continue;
                    Route r = new Route();
                    r.httpMethod = hm[0];
                    r.pattern = join(base, hm[1]);
                    r.method = m; r.controller = ctrl;
                    m.setAccessible(true);
                    routes.add(r);
                }
            }
        }
        // Executa CommandLineRunner / ApplicationRunner anotados com @Component (como o Spring faz ao subir)
        for (Class<?> c : userClasses) {
            if (c.isInterface() || Modifier.isAbstract(c.getModifiers())) continue;
            boolean comp = c.isAnnotationPresent(org.springframework.stereotype.Component.class)
                    || c.isAnnotationPresent(org.springframework.stereotype.Service.class);
            if (!comp) continue;
            try {
                if (org.springframework.boot.CommandLineRunner.class.isAssignableFrom(c)) {
                    ((org.springframework.boot.CommandLineRunner) bean(c)).run();
                } else if (org.springframework.boot.ApplicationRunner.class.isAssignableFrom(c)) {
                    ((org.springframework.boot.ApplicationRunner) bean(c)).run(new Args());
                }
            } catch (QT.Fail f) {
                throw f;
            } catch (Exception e) {
                throw new QT.Fail("O " + c.getSimpleName() + ".run() lançou " + QT.describe(e));
            }
        }
    }

    static void scan(File dir, String pkg) {
        File[] fs = dir.listFiles();
        if (fs == null) return;
        for (File f : fs) {
            String n = f.getName();
            if (f.isDirectory()) { scan(f, pkg + n + "."); continue; }
            if (!n.endsWith(".class") || n.contains("$")) continue;
            try { userClasses.add(Class.forName(pkg + n.substring(0, n.length() - 6))); } catch (Throwable ignored) { }
        }
    }

    static class Args implements org.springframework.boot.ApplicationArguments {
        public String[] getSourceArgs() { return new String[0]; }
        public Set<String> getOptionNames() { return Set.of(); }
        public boolean containsOption(String name) { return false; }
        public List<String> getOptionValues(String name) { return null; }
        public List<String> getNonOptionArgs() { return List.of(); }
    }

    public static List<String> routes() { start(); List<String> l = new ArrayList<>(); for (Route r : routes) l.add(r.toString()); return l; }

    public static boolean hasController() { start(); return !routes.isEmpty(); }

    static String first(String[] a, String[] b) { return a.length > 0 ? a[0] : b.length > 0 ? b[0] : ""; }

    static String[] mapping(Method m) {
        GetMapping g = m.getAnnotation(GetMapping.class); if (g != null) return new String[]{"GET", first(g.value(), g.path())};
        PostMapping p = m.getAnnotation(PostMapping.class); if (p != null) return new String[]{"POST", first(p.value(), p.path())};
        PutMapping u = m.getAnnotation(PutMapping.class); if (u != null) return new String[]{"PUT", first(u.value(), u.path())};
        DeleteMapping d = m.getAnnotation(DeleteMapping.class); if (d != null) return new String[]{"DELETE", first(d.value(), d.path())};
        PatchMapping pa = m.getAnnotation(PatchMapping.class); if (pa != null) return new String[]{"PATCH", first(pa.value(), pa.path())};
        RequestMapping r = m.getAnnotation(RequestMapping.class); if (r != null) return new String[]{"*", first(r.value(), r.path())};
        return null;
    }

    static String join(String a, String b) {
        String s = ("/" + a + "/" + b).replaceAll("/+", "/");
        if (s.length() > 1 && s.endsWith("/")) s = s.substring(0, s.length() - 1);
        return s;
    }

    /* ------------------------------------------------------------ beans e injeção */
    @SuppressWarnings("unchecked")
    public static synchronized <T> T bean(Class<T> c) {
        if (beans.containsKey(c)) return (T) beans.get(c);
        Object o;
        if (c.isInterface() && CrudRepository.class.isAssignableFrom(c)) {
            o = Proxy.newProxyInstance(c.getClassLoader(), new Class<?>[]{c}, new Repo(c));
        } else if (c.isInterface()) {
            Class<?> impl = null;
            for (Class<?> k : userClasses) if (!k.isInterface() && c.isAssignableFrom(k)) impl = k;
            if (impl == null) throw new QT.Fail("Não há classe que implemente " + c.getSimpleName() + " para injetar.");
            o = bean(impl);
        } else {
            try {
                Constructor<?> k = null;
                for (Constructor<?> x : c.getDeclaredConstructors()) if (k == null || x.getParameterCount() < k.getParameterCount()) k = x;
                k.setAccessible(true);
                Object[] a = new Object[k.getParameterCount()];
                for (int i = 0; i < a.length; i++) a[i] = bean(k.getParameterTypes()[i]);
                o = k.newInstance(a);
            } catch (InvocationTargetException e) {
                throw new RuntimeException(e.getCause());
            } catch (ReflectiveOperationException e) {
                throw new QT.Fail("Não consegui criar " + c.getSimpleName() + ": " + e);
            }
        }
        beans.put(c, o);
        if (!(o instanceof Proxy)) inject(o);
        return (T) o;
    }

    static void inject(Object o) {
        for (Class<?> k = o.getClass(); k != null && k != Object.class; k = k.getSuperclass()) {
            for (Field f : k.getDeclaredFields()) {
                if (!f.isAnnotationPresent(Autowired.class)) continue;
                try { f.setAccessible(true); f.set(o, bean(f.getType())); }
                catch (IllegalAccessException e) { throw new RuntimeException(e); }
            }
        }
    }

    /* ------------------------------------------------------------ requisições */
    public static Response get(String url) { return request("GET", url, Map.of()); }
    public static Response delete(String url) { return request("DELETE", url, Map.of()); }
    public static Response post(String url, Map<String, String> params) { return request("POST", url, params); }
    public static Response put(String url, Map<String, String> params) { return request("PUT", url, params); }
    public static Response patch(String url, Map<String, String> params) { return request("PATCH", url, params); }

    /** Monta um mapa de parâmetros: params("username", "ana", "email", "a@b.com") */
    public static Map<String, String> params(String... kv) {
        Map<String, String> m = new LinkedHashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) m.put(kv[i], kv[i + 1]);
        return m;
    }

    public static Response request(String httpMethod, String url, Map<String, String> params) {
        start();
        Map<String, String> all = new LinkedHashMap<>();
        String path = url;
        int q = url.indexOf('?');
        if (q >= 0) {
            path = url.substring(0, q);
            for (String kv : url.substring(q + 1).split("&")) {
                if (kv.isEmpty()) continue;
                String[] p = kv.split("=", 2);
                all.put(dec(p[0]), p.length > 1 ? dec(p[1]) : "");
            }
        }
        if (params != null) all.putAll(params);
        path = join(path, "");
        boolean pathExists = false;
        // como no Spring: caminhos literais (/livros/disponiveis) têm prioridade sobre variáveis (/livros/{id})
        List<Route> ordered = new ArrayList<>(routes);
        ordered.sort(Comparator.comparingInt(r -> r.pattern.split("\\{", -1).length));
        for (Route r : ordered) {
            Map<String, String> vars = match(r.pattern, path);
            if (vars == null) continue;
            pathExists = true;
            if (!r.httpMethod.equals("*") && !r.httpMethod.equals(httpMethod)) continue;
            Object[] args;
            try { args = bind(r.method, vars, all); }
            catch (QT.Fail e) { return new Response(400, e.getMessage(), json(e.getMessage())); }
            try {
                Object body = r.method.invoke(r.controller, args);
                return new Response(200, body, json(body));
            } catch (InvocationTargetException e) {
                Throwable t = e.getCause();
                return new Response(500, t, json("500 Internal Server Error — " + QT.describe(t)));
            } catch (IllegalAccessException e) {
                throw new RuntimeException(e);
            }
        }
        if (pathExists) return new Response(405, null, "\"405 Method Not Allowed\"");
        return new Response(404, null, "\"404 Not Found\"");
    }

    static String dec(String s) { return java.net.URLDecoder.decode(s, java.nio.charset.StandardCharsets.UTF_8); }

    static Map<String, String> match(String pattern, String path) {
        String[] a = pattern.split("/"), b = path.split("/");
        if (a.length != b.length) return null;
        Map<String, String> vars = new HashMap<>();
        for (int i = 0; i < a.length; i++) {
            if (a[i].startsWith("{") && a[i].endsWith("}")) vars.put(a[i].substring(1, a[i].length() - 1), dec(b[i]));
            else if (!a[i].equals(b[i])) return null;
        }
        return vars;
    }

    static Object[] bind(Method m, Map<String, String> vars, Map<String, String> params) {
        Parameter[] ps = m.getParameters();
        Object[] args = new Object[ps.length];
        for (int i = 0; i < ps.length; i++) {
            Parameter p = ps[i];
            PathVariable pv = p.getAnnotation(PathVariable.class);
            RequestParam rp = p.getAnnotation(RequestParam.class);
            String raw;
            if (pv != null) {
                String name = !pv.value().isEmpty() ? pv.value() : !pv.name().isEmpty() ? pv.name() : p.getName();
                if (!vars.containsKey(name)) throw new QT.Fail("@PathVariable \"" + name + "\" não existe na URL mapeada.");
                raw = vars.get(name);
            } else if (rp != null) {
                String name = !rp.value().isEmpty() ? rp.value() : !rp.name().isEmpty() ? rp.name() : p.getName();
                raw = params.get(name);
                if (raw == null && !rp.defaultValue().equals("__NONE__")) raw = rp.defaultValue();
                if (raw == null && rp.required()) throw new QT.Fail("400 Bad Request — parâmetro obrigatório \"" + name + "\" ausente");
            } else {
                throw new QT.Fail("O parâmetro \"" + p.getName() + "\" de " + m.getName() + " precisa de @PathVariable ou @RequestParam.");
            }
            try { args[i] = conv(raw, p.getType()); }
            catch (NumberFormatException e) { throw new QT.Fail("400 Bad Request — \"" + raw + "\" não é um " + p.getType().getSimpleName()); }
        }
        return args;
    }

    static Object conv(String raw, Class<?> t) {
        if (raw == null) return t.isPrimitive() ? (t == boolean.class ? (Object) false : (Object) 0) : null;
        if (t == String.class || t == Object.class) return raw;
        if (t == int.class || t == Integer.class) return Integer.parseInt(raw.trim());
        if (t == long.class || t == Long.class) return Long.parseLong(raw.trim());
        if (t == double.class || t == Double.class) return Double.parseDouble(raw.trim());
        if (t == float.class || t == Float.class) return Float.parseFloat(raw.trim());
        if (t == boolean.class || t == Boolean.class) return Boolean.parseBoolean(raw.trim());
        return raw;
    }

    /* ------------------------------------------------------------ JSON */
    public static String json(Object o) {
        StringBuilder b = new StringBuilder();
        json(o, b, 0);
        return b.toString();
    }

    static void json(Object o, StringBuilder b, int depth) {
        if (depth > 12) { b.append("\"...\""); return; }
        if (o == null) { b.append("null"); return; }
        if (o instanceof Optional) { json(((Optional<?>) o).orElse(null), b, depth); return; }
        if (o instanceof String || o instanceof Character || o instanceof Enum || o instanceof Temporal || o instanceof UUID) {
            b.append(quote(o instanceof Enum ? ((Enum<?>) o).name() : o.toString())); return;
        }
        if (o instanceof Double || o instanceof Float) {
            double d = ((Number) o).doubleValue();
            b.append(d == Math.rint(d) && !Double.isInfinite(d) ? String.valueOf((long) d) + ".0" : String.valueOf(d));
            return;
        }
        if (o instanceof Number || o instanceof Boolean) { b.append(o); return; }
        if (o instanceof Map) {
            TreeMap<String, Object> sorted = new TreeMap<>();
            for (Map.Entry<?, ?> e : ((Map<?, ?>) o).entrySet()) sorted.put(String.valueOf(e.getKey()), e.getValue());
            b.append('{'); boolean f = true;
            for (Map.Entry<String, Object> e : sorted.entrySet()) {
                if (!f) b.append(','); f = false;
                b.append(quote(e.getKey())).append(':'); json(e.getValue(), b, depth + 1);
            }
            b.append('}'); return;
        }
        if (o instanceof Iterable || o.getClass().isArray()) {
            List<Object> l = new ArrayList<>();
            if (o instanceof Iterable) for (Object x : (Iterable<?>) o) l.add(x);
            else for (int i = 0; i < Array.getLength(o); i++) l.add(Array.get(o, i));
            b.append('['); for (int i = 0; i < l.size(); i++) { if (i > 0) b.append(','); json(l.get(i), b, depth + 1); } b.append(']');
            return;
        }
        if (o instanceof Throwable) { b.append(quote(o.toString())); return; }
        // bean: getters públicos
        TreeMap<String, Object> props = new TreeMap<>();
        for (Method m : o.getClass().getMethods()) {
            if (Modifier.isStatic(m.getModifiers()) || m.getParameterCount() != 0 || m.getDeclaringClass() == Object.class) continue;
            String n = m.getName(), prop = null;
            if (n.startsWith("get") && n.length() > 3 && m.getReturnType() != void.class) prop = n.substring(3);
            else if (n.startsWith("is") && n.length() > 2 && (m.getReturnType() == boolean.class || m.getReturnType() == Boolean.class)) prop = n.substring(2);
            if (prop == null) continue;
            prop = Character.toLowerCase(prop.charAt(0)) + prop.substring(1);
            try { m.setAccessible(true); props.put(prop, m.invoke(o)); } catch (Exception ignored) { }
        }
        json(props, b, depth);
    }

    static String quote(String s) {
        StringBuilder b = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            if (c == '"' || c == '\\') b.append('\\').append(c);
            else if (c == '\n') b.append("\\n");
            else if (c < 0x20) b.append(String.format("\\u%04x", (int) c));
            else b.append(c);
        }
        return b.append('"').toString();
    }

    /* ------------------------------------------------------------ repositório em memória */
    static class Repo implements InvocationHandler {
        final Class<?> iface; Class<?> entity; Field idField; boolean generated;
        final LinkedHashMap<String, Object> data = new LinkedHashMap<>();
        long seq = 0;

        Repo(Class<?> iface) {
            this.iface = iface;
            entity = findEntity(iface);
            if (entity != null) {
                for (Class<?> k = entity; k != null && k != Object.class; k = k.getSuperclass())
                    for (Field f : k.getDeclaredFields())
                        for (Annotation a : f.getAnnotations()) {
                            String n = a.annotationType().getSimpleName();
                            if (n.equals("Id") && idField == null) { idField = f; f.setAccessible(true); }
                        }
                if (idField != null) for (Annotation a : idField.getAnnotations())
                    if (a.annotationType().getSimpleName().equals("GeneratedValue")) generated = true;
            }
        }

        static Class<?> findEntity(Class<?> c) {
            for (Type t : c.getGenericInterfaces()) {
                if (t instanceof ParameterizedType) {
                    ParameterizedType pt = (ParameterizedType) t;
                    if (pt.getActualTypeArguments()[0] instanceof Class) return (Class<?>) pt.getActualTypeArguments()[0];
                } else if (t instanceof Class) {
                    Class<?> r = findEntity((Class<?>) t);
                    if (r != null) return r;
                }
            }
            return null;
        }

        Object id(Object e) {
            if (idField == null) throw new QT.Fail("A entidade " + (entity == null ? "?" : entity.getSimpleName()) + " não tem um atributo com @Id.");
            try { return idField.get(e); } catch (IllegalAccessException x) { throw new RuntimeException(x); }
        }

        Object save(Object e) throws Exception {
            Object id = id(e);
            if (id == null) {
                if (!generated) throw new QT.Fail("Salvando entidade sem id e sem @GeneratedValue.");
                seq++;
                Class<?> t = idField.getType();
                id = (t == Long.class || t == long.class) ? (Object) seq : t == String.class ? (Object) String.valueOf(seq) : (Object) (int) seq;
                idField.set(e, id);
            } else if (generated && id instanceof Number) {
                seq = Math.max(seq, ((Number) id).longValue());
            }
            data.put(String.valueOf(id), e);
            return e;
        }

        @Override
        public Object invoke(Object proxy, Method m, Object[] a) throws Throwable {
            String n = m.getName();
            if (m.getDeclaringClass() == Object.class) {
                if (n.equals("toString")) return iface.getSimpleName() + "(em memória)";
                if (n.equals("hashCode")) return System.identityHashCode(proxy);
                if (n.equals("equals")) return proxy == a[0];
            }
            switch (n) {
                case "save": return save(a[0]);
                case "saveAll": { List<Object> l = new ArrayList<>(); for (Object o : (Iterable<?>) a[0]) l.add(save(o)); return l; }
                case "findById": return Optional.ofNullable(data.get(String.valueOf(a[0])));
                case "existsById": return data.containsKey(String.valueOf(a[0]));
                case "findAll": return new ArrayList<>(data.values());
                case "count": return (long) data.size();
                case "deleteById": data.remove(String.valueOf(a[0])); return null;
                case "delete": data.remove(String.valueOf(id(a[0]))); return null;
                case "deleteAll": data.clear(); return null;
            }
            return derived(m, a);
        }

        Object derived(Method m, Object[] a) throws Exception {
            String n = m.getName();
            String[] prefixes = {"findAllBy", "findBy", "countDistinctBy", "countBy", "existsBy", "deleteBy", "removeBy", "getBy", "readBy"};
            String prefix = null;
            for (String p : prefixes) if (n.startsWith(p)) { prefix = p; break; }
            if (prefix == null) throw new UnsupportedOperationException("Método " + n + " não é suportado pelo repositório simulado.");
            String expr = n.substring(prefix.length());
            String orderBy = null; boolean desc = false;
            int ob = expr.indexOf("OrderBy");
            if (ob >= 0) {
                orderBy = expr.substring(ob + 7); expr = expr.substring(0, ob);
                if (orderBy.endsWith("Desc")) { desc = true; orderBy = orderBy.substring(0, orderBy.length() - 4); }
                else if (orderBy.endsWith("Asc")) orderBy = orderBy.substring(0, orderBy.length() - 3);
            }
            String[] ors = expr.split("Or(?=[A-Z])");
            List<Object> result = new ArrayList<>();
            int argBase;
            for (Object e : data.values()) {
                argBase = 0;
                boolean anyOr = false;
                for (String orPart : ors) {
                    boolean all = true;
                    for (String cond : orPart.split("And(?=[A-Z])")) {
                        int[] used = {0};
                        if (!test(e, cond, a, argBase, used)) all = false;
                        argBase += used[0];
                    }
                    if (all) anyOr = true;
                }
                if (anyOr) result.add(e);
            }
            if (orderBy != null) {
                final String ofield = lc(orderBy); final boolean fdesc = desc;
                result.sort((x, y) -> {
                    int c = cmp(prop(x, ofield), prop(y, ofield));
                    return fdesc ? -c : c;
                });
            }
            if (prefix.startsWith("count")) {
                if (prefix.equals("countDistinctBy")) result = new ArrayList<>(new LinkedHashSet<>(result));
                long c = result.size();
                Class<?> rt = m.getReturnType();
                return (rt == int.class || rt == Integer.class) ? (Object) (int) c : (Object) c;
            }
            if (prefix.equals("existsBy")) return !result.isEmpty();
            if (prefix.equals("deleteBy") || prefix.equals("removeBy")) {
                for (Object e : result) data.remove(String.valueOf(id(e)));
                return m.getReturnType() == void.class ? null : result;
            }
            Class<?> rt = m.getReturnType();
            if (rt == Optional.class) return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
            if (Iterable.class.isAssignableFrom(rt)) return result;
            return result.isEmpty() ? null : result.get(0);
        }

        static final String[] OPS = {"IgnoreCase", "Containing", "StartingWith", "StartsWith", "EndingWith", "GreaterThanEqual", "LessThanEqual",
                "GreaterThan", "LessThan", "IsTrue", "True", "IsFalse", "False", "IsNull", "IsNotNull", "Not", "Is", "Equals"};

        boolean test(Object e, String cond, Object[] a, int argIdx, int[] used) throws Exception {
            boolean ignoreCase = false;
            String op = "Equals";
            String field = cond;
            boolean changed = true;
            while (changed) {
                changed = false;
                for (String o : OPS) {
                    if (field.endsWith(o) && field.length() > o.length()) {
                        field = field.substring(0, field.length() - o.length());
                        if (o.equals("IgnoreCase")) ignoreCase = true;
                        else if (!o.equals("Is") && !o.equals("Equals")) op = o;
                        changed = true;
                        break;
                    }
                }
            }
            Object v = prop(e, lc(field));
            switch (op) {
                case "IsTrue": case "True": return Boolean.TRUE.equals(v);
                case "IsFalse": case "False": return Boolean.FALSE.equals(v);
                case "IsNull": return v == null;
                case "IsNotNull": return v != null;
            }
            used[0] = 1;
            Object arg = a == null || argIdx >= a.length ? null : a[argIdx];
            String sv = v == null ? null : v.toString(), sa = arg == null ? null : arg.toString();
            if (ignoreCase && sv != null && sa != null) { sv = sv.toLowerCase(); sa = sa.toLowerCase(); }
            switch (op) {
                case "Containing": return sv != null && sa != null && sv.contains(sa);
                case "StartingWith": case "StartsWith": return sv != null && sa != null && sv.startsWith(sa);
                case "EndingWith": return sv != null && sa != null && sv.endsWith(sa);
                case "GreaterThan": return cmp(v, arg) > 0;
                case "LessThan": return cmp(v, arg) < 0;
                case "GreaterThanEqual": return cmp(v, arg) >= 0;
                case "LessThanEqual": return cmp(v, arg) <= 0;
                case "Not": return !Objects.equals(sv, sa);
                default: return ignoreCase ? Objects.equals(sv, sa) : QT.same(v, arg);
            }
        }

        static String lc(String s) { return s.isEmpty() ? s : Character.toLowerCase(s.charAt(0)) + s.substring(1); }

        @SuppressWarnings({"unchecked", "rawtypes"})
        static int cmp(Object x, Object y) {
            if (x == null || y == null) return x == y ? 0 : x == null ? -1 : 1;
            if (x instanceof Number && y instanceof Number) return Double.compare(((Number) x).doubleValue(), ((Number) y).doubleValue());
            if (x instanceof Comparable) return ((Comparable) x).compareTo(y);
            return x.toString().compareTo(y.toString());
        }

        Object prop(Object e, String name) {
            try { return propX(e, name); } catch (IllegalAccessException x) { throw new RuntimeException(x); }
        }

        Object propX(Object e, String name) throws IllegalAccessException {
            for (Class<?> k = e.getClass(); k != null && k != Object.class; k = k.getSuperclass()) {
                for (Field f : k.getDeclaredFields()) {
                    if (f.getName().equalsIgnoreCase(name)) { f.setAccessible(true); return f.get(e); }
                }
            }
            throw new QT.Fail("A entidade " + e.getClass().getSimpleName() + " não tem o atributo \"" + name + "\" usado no método do repositório.");
        }
    }
}
