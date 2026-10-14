import { useState } from 'react'
import './App.css'

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data + 'T00:00:00'))
}

// Máscara de moeda brasileira: R$ 1.000,00
function mascaraMoeda(valor) {
  const apenasNumeros = String(valor).replace(/\D/g, '')
  const numero = Number(apenasNumeros) / 100
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

// Extrai o valor numérico de uma string formatada como moeda brasileira
function moedaParaNumero(valor) {
  return Number(valor.replace(/[^\d,]/g, '').replace(',', '.'))
}

// Retorna o número de dias de um mês/ano (considera ano bissexto)
function diasNoMes(mes, ano) {
  return new Date(ano, mes, 0).getDate()
}

// Máscara de data brasileira: dd/mm/aaaa com validação de dia/mês/ano
function mascaraData(valor) {
  let apenasNumeros = String(valor).replace(/\D/g, '').slice(0, 8)
  let dia = ''
  let mes = ''
  let ano = ''

  if (apenasNumeros.length >= 2) {
    dia = apenasNumeros.slice(0, 2)
    let d = parseInt(dia, 10)
    if (d > 31) {
      dia = '31'
      apenasNumeros = '31' + apenasNumeros.slice(2)
    } else if (d === 0) {
      dia = '01'
    }
  } else {
    dia = apenasNumeros
  }

  if (apenasNumeros.length >= 4) {
    mes = apenasNumeros.slice(2, 4)
    let m = parseInt(mes, 10)
    if (m > 12) {
      mes = '12'
    } else if (m === 0 && apenasNumeros[2] !== undefined) {
      mes = '01'
    }
  } else if (apenasNumeros.length > 2) {
    mes = apenasNumeros.slice(2)
  }

  if (apenasNumeros.length >= 5) {
    ano = apenasNumeros.slice(4, 8)
  }

  // Valida o dia máximo conforme o mês (se ano e mês estiverem completos)
  if (dia.length === 2 && mes.length === 2 && ano.length === 4) {
    const m = parseInt(mes, 10)
    const a = parseInt(ano, 10)
    const maxDias = diasNoMes(m, a)
    const d = parseInt(dia, 10)
    if (d > maxDias) {
      dia = String(maxDias).padStart(2, '0')
    }
  }

  let resultado = dia
  if (mes) resultado += '/' + mes
  if (ano) resultado += '/' + ano
  return resultado
}

// Converte data dd/mm/aaaa para aaaa-mm-dd
function dataParaISO(data) {
  const partes = data.split('/')
  if (partes.length !== 3) return null
  const [dia, mes, ano] = partes
  return `${ano}-${mes}-${dia}`
}

// Valida se a data dd/mm/aaaa é válida
function dataValida(data) {
  const partes = data.split('/')
  if (partes.length !== 3) return false
  const [dia, mes, ano] = partes.map(Number)
  const dataObj = new Date(ano, mes - 1, dia)
  return (
    dataObj.getFullYear() === ano &&
    dataObj.getMonth() === mes - 1 &&
    dataObj.getDate() === dia
  )
}

function App() {
  const [valor, setValor] = useState('')
  const [dataVencimento, setDataVencimento] = useState('')
  const [dataPagamento, setDataPagamento] = useState('')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setResultado(null)

    if (!valor || !dataVencimento) {
      setErro('Preencha o valor e a data de vencimento.')
      return
    }

    const valorNumerico = moedaParaNumero(valor)
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro('Informe um valor válido maior que zero.')
      return
    }

    if (!dataValida(dataVencimento)) {
      setErro('Informe uma data de vencimento válida (dd/mm/aaaa).')
      return
    }

    if (dataPagamento && !dataValida(dataPagamento)) {
      setErro('Informe uma data de pagamento válida (dd/mm/aaaa).')
      return
    }

    setCarregando(true)
    try {
      const corpo = {
        valor: valorNumerico,
        dataVencimento: dataParaISO(dataVencimento),
      }
      if (dataPagamento) {
        corpo.dataPagamento = dataParaISO(dataPagamento)
      }

      const resposta = await fetch('/api/juros/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      })

      if (!resposta.ok) {
        throw new Error('Erro ao calcular juros.')
      }

      const dados = await resposta.json()
      setResultado(dados)
    } catch (err) {
      setErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <header className="header">
          <h1>Calculadora de Juros</h1>
          <p className="subtitle">Multa de <strong>2,5% ao dia</strong> sobre o valor em atraso</p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="valor">Valor do título <span className="obrigatorio">*</span></label>
            <input
              id="valor"
              type="text"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={valor}
              onChange={(e) => setValor(mascaraMoeda(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="dataVencimento">Data de vencimento <span className="obrigatorio">*</span></label>
            <input
              id="dataVencimento"
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              value={dataVencimento}
              onChange={(e) => setDataVencimento(mascaraData(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="dataPagamento">Data de pagamento <span className="opcional">(opcional)</span></label>
            <input
              id="dataPagamento"
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              value={dataPagamento}
              onChange={(e) => setDataPagamento(mascaraData(e.target.value))}
            />
          </div>

          <button type="submit" className="btn" disabled={carregando}>
            {carregando ? 'Calculando...' : 'Calcular Juros'}
          </button>
        </form>

        {erro && <div className="erro">{erro}</div>}

        {resultado && (
          <div className="resultado">
            <h2>Resultado</h2>
            <div className="linha">
              <span>Valor original</span>
              <strong>{formatarMoeda(resultado.valorOriginal)}</strong>
            </div>
            <div className="linha">
              <span>Vencimento</span>
              <strong>{formatarData(resultado.dataVencimento)}</strong>
            </div>
            <div className="linha">
              <span>Data de pagamento</span>
              <strong>{formatarData(resultado.dataCalculo)}</strong>
            </div>
            <div className="linha">
              <span>Dias em atraso</span>
              <strong className={resultado.diasAtraso > 0 ? 'atraso' : ''}>
                {resultado.diasAtraso} dia(s)
              </strong>
            </div>

            {resultado.diasAtraso > 0 && (
              <div className="calculo">
                <h3>Como foi calculado</h3>

                <div className="etapa">
                  <span className="etapa-num">1</span>
                  <div className="etapa-conteudo">
                    <span className="etapa-titulo">Dias em atraso</span>
                    <span className="etapa-valor">{formatarData(resultado.dataVencimento)} → {formatarData(resultado.dataCalculo)}</span>
                    <span className="etapa-resultado">{resultado.diasAtraso} dias</span>
                  </div>
                </div>

                <div className="etapa">
                  <span className="etapa-num">2</span>
                  <div className="etapa-conteudo">
                    <span className="etapa-titulo">Juros diário</span>
                    <span className="etapa-valor">{formatarMoeda(resultado.valorOriginal)} × 2,5%</span>
                    <span className="etapa-resultado">{formatarMoeda(resultado.valorOriginal * resultado.taxaDiaria)} por dia</span>
                  </div>
                </div>

                <div className="etapa">
                  <span className="etapa-num">3</span>
                  <div className="etapa-conteudo">
                    <span className="etapa-titulo">Juros total</span>
                    <span className="etapa-valor">{formatarMoeda(resultado.valorOriginal * resultado.taxaDiaria)} × {resultado.diasAtraso} dias</span>
                    <span className="etapa-resultado">{formatarMoeda(resultado.valorJuros)}</span>
                  </div>
                </div>

                <div className="etapa final">
                  <span className="etapa-num">4</span>
                  <div className="etapa-conteudo">
                    <span className="etapa-titulo">Valor total</span>
                    <span className="etapa-valor">{formatarMoeda(resultado.valorOriginal)} + {formatarMoeda(resultado.valorJuros)}</span>
                    <span className="etapa-resultado">{formatarMoeda(resultado.valorTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {resultado.diasAtraso === 0 && (
              <div className="sem-atraso">
                O título não está em atraso na data de pagamento informada.
              </div>
            )}

            <div className="linha destaque">
              <span>Juros</span>
              <strong>{formatarMoeda(resultado.valorJuros)}</strong>
            </div>
            <div className="linha total">
              <span>Valor total a pagar</span>
              <strong>{formatarMoeda(resultado.valorTotal)}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
