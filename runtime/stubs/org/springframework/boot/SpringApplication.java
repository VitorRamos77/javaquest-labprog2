package org.springframework.boot;
/** Versão simulada: apenas registra que a aplicação "subiu". Use o painel de requisições para testar. */
public class SpringApplication {
    public static Object run(Class<?> primarySource, String... args) {
        System.out.println("  .   ____          _            (Spring Boot simulado pelo JavaQuest)");
        System.out.println("Started " + primarySource.getSimpleName() + " — Tomcat (simulado) na porta 8080");
        return null;
    }
}
