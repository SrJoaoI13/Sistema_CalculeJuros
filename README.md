# Sistema de Cálculo de Juros

Aplicação fullstack para cálculo de juros de mora com multa de **2,5% ao dia** sobre o valor de um título em atraso.

## Sobre o projeto

O sistema recebe o valor de um título, sua data de vencimento e (opcionalmente) a data de pagamento, e calcula:

- Quantidade de dias em atraso
- Valor dos juros (valor × 2,5% × dias de atraso)
- Valor total a pagar (valor original + juros)

A aplicação é composta por:

- **Backend**: API REST em Spring Boot (Java)
- **Frontend**: Interface web em React + Vite

Não utiliza banco de dados — o cálculo é feito em memória a cada requisição.

## Tecnologias

- Java 26
- Spring Boot 4.1.1
- Gradle
- React 19
- Vite 8

## Estrutura do projeto

```
Sistema_CalculeJuros/
├── BackEnd/          # API Spring Boot
│   └── src/main/java/BackEnd/demo/
│       ├── controller/   # JurosController (endpoint REST)
│       ├── dto/          # JurosRequest, JurosResponse
│       └── service/      # JurosService (lógica do cálculo)
└── FrontEnd/         # Aplicação React + Vite
    └── src/
        ├── App.jsx       # Interface com formulário e resultado
        ├── App.css       # Estilos
        └── main.jsx
```

## Como rodar

### 1. Backend

No diretório `BackEnd`:

```bash
cd BackEnd
./gradlew.bat bootRun
```

A API sobe em `http://localhost:9090`.

#### Endpoint

```
POST /api/juros/calcular
Content-Type: application/json

{
  "valor": 1000.00,
  "dataVencimento": "2026-10-01",
  "dataPagamento": "2026-10-14"
}
```

Resposta:

```json
{
  "valorOriginal": 1000.00,
  "dataVencimento": "2026-10-01",
  "dataCalculo": "2026-10-14",
  "diasAtraso": 13,
  "taxaDiaria": 0.025,
  "valorJuros": 325.00,
  "valorTotal": 1325.00
}
```

> O campo `dataPagamento` é opcional. Se não for informado, a API usa a data de hoje.

### 2. Frontend

No diretório `FrontEnd`:

```bash
cd FrontEnd
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173` (ou na próxima porta disponível).

O Vite está configurado com um proxy que encaminha as requisições `/api` para `http://localhost:9090`, então não é necessário configurar CORS no navegador.

## Funcionalidades da interface

- Campo de valor com máscara de moeda brasileira (R$ 1.000,00)
- Campos de data com máscara `dd/mm/aaaa` e validação de dia/mês/ano (incluindo anos bissextos)
- Indicação de campos obrigatórios
- Exibição do cálculo passo a passo:
  1. Dias em atraso
  2. Juros diário
  3. Juros total
  4. Valor total a pagar
- Mensagem amigável quando não há atraso

## Observações

- A taxa de juros é fixa em 2,5% ao dia, definida em `JurosService`.
- Se a data de pagamento for anterior ou igual à data de vencimento, os dias de atraso são zero e não há juros.
