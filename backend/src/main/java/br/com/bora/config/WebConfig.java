package br.com.bora.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Em dev o front (Vite, :5173) fala com a API via proxy /api -> :8080,
        // então nem precisa de CORS. Isto libera só os origins locais para o
        // caso de alguém abrir a API direto de outra porta.
        // SUBSTITUIR EM PRODUÇÃO: restringir ao domínio real do front.
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173")
            .allowedMethods("GET");
    }
}
