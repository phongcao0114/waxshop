package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.http.CacheControl;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(
                            // Local development
                            "http://localhost:4200",
                            "http://localhost:80",
                            "http://localhost:3000",
                            
                            // Docker container names
                            "http://frontend",
                            "http://frontend:80",
                            "http://ecommerce_frontend",
                            "http://ecommerce_frontend:80",
                            
                            // AWS EC2 IP addresses
                            "http://3.104.179.158",
                            "http://3.104.179.158:80",
                            "http://3.104.179.158:4200",
                            "http://3.104.179.158:3000",
                            
                            // AWS EC2 DNS
                            "http://ec2-3-104-179-158.ap-southeast-2.compute.amazonaws.com",
                            "http://ec2-3-104-179-158.ap-southeast-2.compute.amazonaws.com:80",
                            "http://ec2-3-104-179-158.ap-southeast-2.compute.amazonaws.com:4200",
                            "http://ec2-3-104-179-158.ap-southeast-2.compute.amazonaws.com:3000"
                            
                            // For production with domain (when you have one)
                            // "https://yourdomain.com",
                            // "https://www.yourdomain.com"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*", "Authorization")
                        .allowCredentials(true);
            }

            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:/app/uploads/")
                        .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic());
            }
        };
    }
}
