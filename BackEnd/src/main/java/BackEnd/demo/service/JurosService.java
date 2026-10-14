package BackEnd.demo.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;

import BackEnd.demo.dto.JurosRequest;
import BackEnd.demo.dto.JurosResponse;

@Service
public class JurosService {

    private static final BigDecimal TAXA_DIARIA = new BigDecimal("0.025"); // 2,5% ao dia

    public JurosResponse calcular(JurosRequest request) {
        LocalDate dataPagamento = request.dataPagamento() != null
                ? request.dataPagamento()
                : LocalDate.now();

        LocalDate vencimento = request.dataVencimento();

        long diasAtraso = ChronoUnit.DAYS.between(vencimento, dataPagamento);
        if (diasAtraso < 0) {
            diasAtraso = 0;
        }

        BigDecimal valorOriginal = request.valor();
        BigDecimal valorJuros = valorOriginal
                .multiply(TAXA_DIARIA)
                .multiply(BigDecimal.valueOf(diasAtraso))
                .setScale(2, RoundingMode.HALF_EVEN);

        BigDecimal valorTotal = valorOriginal.add(valorJuros).setScale(2, RoundingMode.HALF_EVEN);

        return new JurosResponse(
                valorOriginal.setScale(2, RoundingMode.HALF_EVEN),
                vencimento,
                dataPagamento,
                diasAtraso,
                TAXA_DIARIA,
                valorJuros,
                valorTotal
        );
    }
}
