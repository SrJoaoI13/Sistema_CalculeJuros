package BackEnd.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record JurosResponse(
        BigDecimal valorOriginal,
        LocalDate dataVencimento,
        LocalDate dataCalculo,
        long diasAtraso,
        BigDecimal taxaDiaria,
        BigDecimal valorJuros,
        BigDecimal valorTotal
) {
}
