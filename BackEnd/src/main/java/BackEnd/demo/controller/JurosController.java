package BackEnd.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import BackEnd.demo.dto.JurosRequest;
import BackEnd.demo.dto.JurosResponse;
import BackEnd.demo.service.JurosService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/juros")
@CrossOrigin(origins = "*")
public class JurosController {

    private final JurosService jurosService;

    public JurosController(JurosService jurosService) {
        this.jurosService = jurosService;
    }

    @PostMapping("/calcular")
    public ResponseEntity<JurosResponse> calcular(@Valid @RequestBody JurosRequest request) {
        JurosResponse response = jurosService.calcular(request);
        return ResponseEntity.ok(response);
    }
}
