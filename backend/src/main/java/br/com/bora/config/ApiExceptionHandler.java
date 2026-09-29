package br.com.bora.config;

import jakarta.validation.ConstraintViolationException;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/** Parâmetro inválido (raio fora da faixa, id não numérico, param faltando) vira 400, não 500. */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler({
        ConstraintViolationException.class,
        MethodArgumentTypeMismatchException.class,
        MissingServletRequestParameterException.class
    })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> parametroInvalido(Exception e) {
        return Map.of("erro", "Parâmetro inválido", "detalhe", e.getMessage() == null ? "" : e.getMessage());
    }
}
