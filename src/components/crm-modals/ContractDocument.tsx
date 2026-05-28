import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoC3Loc from '../../assets/logo-completo.png';
import signatureImg from '../../assets/signature.png';

// Create basic styles #edebe0
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: '#333',
    lineHeight: 1.5,
  },
  headerContainer: {
    marginBottom: 20,
  },
  logosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 50,
    objectFit: 'contain',
  },
  logo2: {
    marginTop: -10,
    width: 120,
    height: 50,
    objectFit: 'contain',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoCell: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#c5d9f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    width: 160,
  },
  infoText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    width: 100,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  value: {
    flex: 1,
    fontSize: 9,
  },
  value_client: {
    fontSize: 9,
    flex: 1,
    backgroundColor: '#edebe0',
  }
  ,
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  signatureBox: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#000',
    textAlign: 'center',
    paddingTop: 5,
  },
  propost_section: {
    border: 'none',
    paddingVertical: 10,
  },
  propost_title: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  propost_label: {
    fontWeight: 'bold',
    fontSize: 9,
  },
  location_div: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    border: '1px solid #000',
  },
  location_left_cell: {
    width: '30%',
    paddingLeft: 8,
    paddingBottom: 8,
    paddingTop: 8,
    fontSize: '10px!important',
  },
  location_right_cell: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: '#edebe0',
    textAlign: 'center',
  },
  location_value: {
    fontSize: 10,
    textAlign: 'center',
  },
  clauseSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  clauseTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    padding: 3,
  },
  clauseText: {
    fontSize: 9,
    color: '#333',
    marginBottom: 4,
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: 'bold',
  }
});

interface ContractDocumentProps {
  data: any;
  generatedAt?: string;
}

const ContractDocument: React.FC<ContractDocumentProps> = ({ data, generatedAt }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const buildCostsText = () => {
    const items = [
      { value: data.costs?.rental, label: 'Locação' },
      { value: data.costs?.insurance, label: 'Seguro' },
      { value: data.costs?.freight, label: 'Frete' },
      { value: data.costs?.rcd, label: 'RCD' },
      { value: data.costs?.third_party, label: 'Terceiros' },
      { value: data.costs?.training, label: 'Treinamento' },
    ];

    const parts = items
      .filter(item => item.value !== undefined && item.value !== null && Number(item.value) > 0)
      .map(item => `${item.label}: ${formatCurrency(Number(item.value))}`);

    return `${parts.join(' + ')} = ${formatCurrency(Number(data.costs?.total || 0))}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.logosRow}>
            {data.locador?.logo_url ? (
              <Image style={styles.logo} src={data.locador.logo_url} />
            ) : <View style={styles.logo} />}
            <Image style={styles.logo2} src={logoC3Loc} />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <Text style={styles.infoText}>Data: {formatDate(generatedAt?.split('T')[0] || data.contract_date)}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoText}>Contrato Nº: {data.contract_number}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOCADOR</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{data.locador?.company_name || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>{data.locador?.address_full || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CNPJ:</Text>
            <Text style={styles.value}>{data.locador?.cnpj || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>I.E.:</Text>
            <Text style={styles.value}>{data.locador?.state_registration !== "" ? data.locador?.state_registration : "ISENTO"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOCATÁRIO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value_client}>{data.locatario?.company_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value_client}>{data.locatario?.address_full}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CNPJ:</Text>
            <Text style={styles.value_client}>{data.locatario?.cnpj}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>I.E.:</Text>
            <Text style={styles.value_client}>{data.locatario?.state_registration !== "" ? data.locatario?.state_registration : "ISENTO"}</Text>
          </View>
        </View>

        <View style={styles.propost_section}>
          <Text style={styles.propost_title}>Proposta e Valores</Text>
          <View style={styles.row}>
            <Text style={styles.propost_label}>Informações do equipamento: </Text>
            <Text style={styles.value}>{data.equipment?.description} | {data.equipment?.model || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.propost_label}>Duração do contrato: </Text>
            <Text style={styles.value}>{data.contract_duration_days ? `${data.contract_duration_days} dias` : 'Indeterminado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.propost_label}>Período início: </Text>
            <Text style={styles.value}>{formatDate(data.period_start)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.propost_label}>Período final: </Text>
            <Text style={styles.value}>{data.period_end ? formatDate(data.period_end) : 'Indefinido'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.propost_label}>Valor da locação: </Text>
            <Text style={styles.value}>{buildCostsText()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.propost_label}>Dados bancarios: </Text>
            <Text style={styles.value}>{data.locador?.bank_name + ': ' + data.locador?.bank_code + ' Agência: ' + data.locador?.bank_agency + ' C/C: ' + data.locador?.bank_account + ' (Chave pix: ' + data.locador?.bank_pix_key + ')'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.propost_label}>Condições de faturamento: </Text>
            <Text style={styles.bold}><Text style={styles.value}>{data.billing_interval_days} dias</Text></Text>
          </View>
        </View>

        <View style={styles.location_div}>
          <View style={styles.location_left_cell}>
            <Text style={styles.value}>Local de uso do equipamento:</Text>
            <Text style={styles.value}>Contato de recebimento:</Text>
          </View>
          <View style={styles.location_right_cell}>
            <Text style={styles.location_value}>{data.work_site}</Text>
            <Text style={styles.location_value}>{data.site_contact_name} | {data.site_contact_phone}</Text>
          </View>
        </View>

        <View style={styles.clauseSection}>
          <Text style={styles.clauseTitle}>OBJETO DA PROPOSTA E VALORES</Text>
          <Text style={styles.clauseText}>
            Ao assinar a presente Proposta, a LOCATÁRIA declara total ciência da seção <Text style={styles.bold}>"OBJETO DA PROPOSTA E VALORES”</Text>
          </Text>
          <Text style={styles.clauseText}>
            Descritivo do(s) <Text style={styles.bold}>Equipamento(s)</Text> que serão locados e sua(s) <Text style={styles.bold}>Quantidade(s)</Text>, confirmando que o(s) mesmo(s) cumprem a finalidade para o qual se destinam;
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>Período Contratado</Text>, <Text style={styles.bold}>Intervalo de Faturamento</Text>, Valores de Locação (unitários e total), Valores de Proteção (unitários e total), complementos devidamente discriminados, <Text style={styles.bold}>Total Contratado</Text>, Número de Parcelas e Valor Parcelas;
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>CONTRATO DE LOCAÇÃO DE BENS MÓVEIS E VALIDADE DA PROPOSTA.</Text> A locação será regida pelas cláusulas constantes nesta Proposta, como se aqui estivesse transcrito. A LOCATÁRIA declara que conhece, compreende e aceita o seu conteúdo sem ressalvas, incluindo, mas sem restringir, as regras da Lei Geral de Proteção de Dados, ficando ajustado que a aplicação, de todo os conteúdos mencionados, à presente locação representa premissa de negócio. O referido Contrato pode ser solicitado através de qualquer dos nossos canais de atendimento. Havendo divergência entre os documentos que compõem a presente contratação, prevalecerá o disposto na Proposta.
          </Text>
          <Text style={styles.clauseText}>
            A presente Proposta se aperfeiçoa com o “De acordo” da LOCATÁRIA e sua imediata devolução assinada à LOCADORA até o prazo de validade contido no cabeçalho de cada página implicando na aceitação dos termos aqui estabelecidos. Ultrapassado o período de validade, esta Proposta não gerará mais efeitos, estando sujeita à disponibilidade dos equipamentos na data em que efetivamente houver o envio do seu “aceite” à LOCADORA. A presente Proposta também perderá seus efeitos, ainda que devidamente assinada, na hipótese de reprovação da análise de crédito da LOCATÁRIA pelo departamento financeiro da LOCADORA.
          </Text>

          <Text style={styles.clauseTitle}>PERÍODO CONTRATADO E RENOVAÇÃO</Text>
          <Text style={styles.clauseText}>
            O período mínimo do contrato corresponde ao Período Contratado da seção “OBJETO DA PROPOSTA E VALORES ” e se inicia, automaticamente, na saída do(s) Bem(ns) Móvel(is) do depósito da LOCADORA.
          </Text>
          <Text style={styles.clauseText}>
            O término do Período contratado ocorrerá na data da efetiva devolução do(s) Equipamento(s) no depósito da LOCADORA, acompanhado da devida documentação fiscal a ser emitida e enviada pela LOCATÁRIA, exceto no caso de devolução do(s) Equipamento(s) antes do término do Período Contratado caso em que não haverá redução no valor da locação, que será aquele correspondente ao Período Contratado inteiro.
          </Text>
          <Text style={styles.clauseText}>
            Caso não haja qualquer manifestação em contrário de qualquer das partes, operar-se-á a renovação da locação, pelo mesmo Período Contratado e nas mesmas condições contidas nesta Proposta, observado o reajuste anual. Renovada a locação após o primeiro Período Contratado, qualquer das Partes poderá optar pela devolução antecipada do(s) Equipamento(s), seja total ou parcial, sem aplicação de qualquer penalidade específica, devendo a LOCATÁRIA arcar com o valor da locação, observado o reajuste anual, até sua efetiva devolução.
          </Text>

          <Text style={styles.clauseTitle}>FATURAMENTO E CONDIÇÕES DE PAGAMENTO</Text>
          <Text style={styles.clauseText}>
            As faturas serão sempre enviadas no início de cada intervalo de faturamento, mesmo nos casos de renovação após o primeiro período Contratado. A primeira fatura será enviada no dia da saída do(s) Bem(ns) Móvel(is) do depósito da LOCADORA.
          </Text>
          <Text style={styles.clauseText}>
            Cada Fatura corresponderá a 1 (um) intervalo de faturamento sendo devido na primeira fatura também os complementos de locação.
          </Text>
          <Text style={styles.clauseText}>
            O vencimento das faturas ocorrerá conforme acordo aplicado nas CONDIÇÕES DE PAGAMENTO, a partir da data de sua emissão.
          </Text>
          <Text style={styles.clauseText}>
            Para períodos contratados superiores a 30 (trinta) dias, no caso de devolução antecipada, os valores devidos pelo saldo remanescente serão cobrados em uma única fatura, a ser enviada após a devolução do(s) Equipamento(s).
          </Text>
          <Text style={styles.clauseText}>
            Após a devolução do(s) Equipamento(s), a LOCADORA avaliará se existe algum saldo (locação, danos, despesas, multas etc.) a ser cobrado da LOCATÁRIA, na forma do Contrato de Locação de Bens Móveis, vide Cláusula 2, e procederá com a cobrança em uma única fatura.
          </Text>
          <Text style={styles.clauseText}>
            A LOCATÁRIA, autoriza a LOCADORA a emitir NOTA DE DÉBITO referente ao ressarcimento de prejuízos nos termos do procedimento, acompanhado do respectivo boleto bancário para cobrança e, na hipótese de não pagamento, como também de qualquer débito relativo à Proposta e Contrato, fica autorizado e ciente que os títulos serão encaminhados a protesto, além das medidas judiciais necessárias.
          </Text>

          <Text style={styles.clauseTitle}>ENTREGA DO(S) EQUIPAMENTO(S) À LOCATÁRIA</Text>
          <Text style={styles.clauseText}>
            No momento da entrega do(s) equipamento(s) o preposto da LOCATÁRIA, assinará o “Termo de entrega”, documento que reflete as condições do(s) equipamento(s), caracterizando assim o aceite do(s) mesmo(s) e declarando que se encontra(m) in perfeita(s) condição(ões) de uso, conservação, funcionamento e segurança, com níveis de combustíveis, lubrificantes, água e demais componentes necessários à sua utilização, não podendo a LOCATÁRIA, posteriormente, reclamar a existência de quaisquer inconformidades.
          </Text>
          <Text style={styles.clauseText}>
            A LOCATÁRIA obriga-se a credenciar um preposto apto a conferir o(s) Equipamento(s). No silêncio da LOCATÁRIA quanto ao credenciamento, será considerado seu preposto, para os fins da Proposta e Contrato, a pessoa que receber o(s) equipamento(s), sendo ele transportador ou não, e esse acompanhará as vistorias e firmará os documentos, os quais serão tidos como válidos entre as partes.
          </Text>

          <Text style={styles.clauseTitle}><Text style={styles.bold}>DEVOLUÇÃO DO(S) EQUIPAMENTO(S) À LOCADORA E DANOS A RESSARCIR</Text></Text>
          <Text style={styles.clauseText}>
            No momento da devolução o preposto da LOCATÁRIA, assinará o <Text style={styles.bold}>“Termo de devolução”</Text>, documento que reflete as condições do(s) equipamento(s), onde será possível constatar a existência de danos, avarias, modificações, adaptações ou desgastes excessivos de peças e partes.
          </Text>
          <Text style={styles.clauseText}>
            A <Text style={styles.bold}>LOCATÁRIA</Text> obriga-se a credenciar um preposto apto a conferir o(s) Equipamento(s) devolvido(s). No silêncio da <Text style={styles.bold}>LOCATÁRIA</Text> quanto ao credenciamento, será considerado seu preposto, para os fins da Proposta e Contrato, a pessoa que acompanhar presencialmente a devolução ou o transportador que recolher o(s) Equipamento(s) e esse acompanhará as vistorias e firmará os documentos, os quais serão tidos como válidos entre as partes. <Text style={styles.bold}>A falta de representante da LOCATÁRIA no momento da devolução não a exime das responsabilidades decorrentes de qualquer dano(s) eventualmente causado(s) ao(s) equipamento(s), que serão apurados.</Text>
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>
              Havendo danos de constatação imediata ou que sejam identificados somente após desmontagem ou análise mais detalhada dos equipamentos, a <Text style={styles.bold}>LOCATÁRIA</Text> será notificada de sua existência em até 5 (cinco) dias úteis. Após a notificação será emitido um relatório completo com as avarias e orçamento. A <Text style={styles.bold}>LOCATÁRIA</Text> terá 5 (cinco) dias úteis para se manifestar acerca del relatório enviado. Após esse prazo, não havendo manifestação da <Text style={styles.bold}>LOCATÁRIA</Text>, os reparos serão realizados e levados à cobrança mediante emissão de NOTA DE DÉBITO e seu respectivo boleto bancário. Todas as comunicações serão realizadas pelo e-mail fornecido pela <Text style={styles.bold}>LOCATÁRIA</Text> no ato da contratação.
            </Text>
          </Text>
          <Text style={styles.clauseText}>
            Em caso de necessidade de reparos no(s) equipamento(s) constatado(s) na devolução, ou no caso de acidentes, a locação será contada na forma prevista nesta cláusula até o momento em que o(s) equipamento(s) esteja(m) reparado(s) e em condições de locação a novos clientes. Em caso de roubo ou furto dos equipamentos, a locação será contada até seu efetivo pagamento ou reposição independentemente da contratação da proteção.
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>
              Nos casos em que a devolução venha a ser realizada através da LOCADORA, é responsabilidade exclusiva da LOCATÁRIA manifestar formalmente a LOCADORA, através de nossos canais de atendimento, o interesse acerca do término da locação, informando a data na qual o(s) equipamento(s) deverá(ão) ser devolvido(s). A falta de manifestação dentro do Período Contratado acarretará a renovação automática da locação que só termina com a efetiva devolução do(s) equipamento(s) no deposito da LOCADORA que o(s) locou, após a devida análise da documentação fiscal a ser produzida e enviada pela LOCATARIA, sem prejuízo da apuração de responsabilidade acerca de danos ou avarias no(s) equipamento(s), na forma da Proposta e Contrato.
            </Text>
          </Text>

          <Text style={styles.clauseTitle}>MANUTENÇÃO, TREINAMENTO E DESPESAS EXIGÍVEIS</Text>
          <Text style={styles.clauseText}>
            Para fins de realização de Manutenção Preventiva, Treinamentos ou ainda Manutenção Corretiva causada por mau uso, dolo ou culpa da LOCATÁRIA , a LOCATÁRIA concorda que serão cobradas as seguintes despesas, envolvendo o deslocamento do técnico, incluindo, mas não se limitando a:
          </Text>
          <Text style={styles.clauseText}><Text style={styles.bold}>(I)</Text> Combustível; (R$ 2,50 por Km);</Text>
          <Text style={styles.clauseText}><Text style={styles.bold}>(II)</Text> Pedágio(s);</Text>
          <Text style={styles.clauseText}><Text style={styles.bold}>(III)</Text> Passagem(ns) aérea(s) (se for o caso) de ida e volta;</Text>
          <Text style={styles.clauseText}><Text style={styles.bold}>(IV)</Text> Hospedagem; (R$ 250,00 por dia);</Text>
          <Text style={styles.clauseText}><Text style={styles.bold}>(V)</Text> Refeições; (R$ 100,00 por dia);</Text>
          <Text style={styles.clauseText}><Text style={styles.bold}>(VI)</Text> O custo da hora trabalhada e de deslocamento (valor por hora), (R$ 250,00 por hora);</Text>
          <Text style={styles.clauseText}><Text style={styles.bold}>(VII)</Text> O custo das peças e óleo nos casos de Manutenção Preventiva.</Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>Acesso do Técnico.</Text> Independentemente do tipo de manutenção (preventiva ou corretiva) a ser realizada é obrigação da LOCATÁRIA oferecer todos os meios necessários para que os técnicos da LOCADORA possam ir e retornar entre a recepção de pessoal é onde o(s) Equipamento(s) estiver(em) situado(s). Caberá a LOCATÁRIA providenciar integração, além todos os recursos necessários para que o técnico chegue o mais rápido possível ao local onde o Equipamento(s) estiverem situado(s), ainda que o Local seja gerenciado, por terceiro ou de difícil acesso, permitindo o efetivo atendimento e assumindo eventuais despesas que sobrevierem, mesmo que por culpa de terceiros. A demora entre a chegada do técnico e o efetivo acesso ao(s) Equipamento(s) poderá ensejar a cobrança de despesas extraordinárias.
          </Text>

          <Text style={styles.clauseTitle}><Text style={styles.bold}>SEGURO: COBERTURAS E FRANQUIAS</Text></Text>
          <Text style={styles.clauseText}>
            A contratação da proteção se dará pelo pagamento concomitante a locação decrito com (Seguro), Caso contratada a proteção, a Locatária formaliza sua opção em, ocorrendo algum sinistro com o equipamento ora locado, obter o seguro mantido pelo Locador junto a seguradora.
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>1.</Text> Caso não contratada a cobertura, a Locatária se responsabiliza integralmente pela guarda e conservação do(s) equipamento(s) ora locado(s). Estando ciente que, findo prazo contratual, os equipamentos deverão ser devolvidos no mesmo estado de conservação que se encontravam no momento da entrega, exceto por desgastes naturais. Caso ocorra sinistro será totalmente assumido pela Locatária, conforme Proposta e Contrato de Locação de Bens Móveis.
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>2.</Text> Em caso de sinistro envolvendo o(s) equipamento(s) locado(s), deverá a LOCATÁRIA informar imediatamente os fatos à LOCADORA e tomar as medidas cabíveis e necessárias para minimização dos danos ao equipamento e/ou à terceiros.
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>3.</Text> Ocorrendo o sinistro, todos os danos ou despesas havidas pela LOCADORA, diretos ou indiretos, não indenizados pela seguradora serão de inteira e única responsabilidade da LOCATÁRIA, sejam eles para reparação do(s) equipamento(s), resgate, transporte ou indenização de terceiros.
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>4.</Text> A LOCATÁRIA também pagará o valor da franquia do seguro existente. Em caso de perda total, extravio, furto ou roubo do equipamento, o valor de indenização do equipamento será o descrito na coluna Equipamento da seção “OBJETO DA PROPOSTA E VALORES, devendo ser complementado pela LOCATÁRIA se o valor pago pela seguradora for insuficiente.
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>5.</Text> Em caso de sinistro será cobrado a franquia, e o valor de locação, desde o momento do evento até a reparação completa dos equipamentos, ou indenização de seu valor integral em caso de perda total, extravio, furto ou roubo. Também será cobrada a locação em caso de retenção do(s) equipamento(s) por autoridade ou por terceiro prejudicado até a sua restituição ou indenização.
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>6.</Text> A LOCATÁRIA se compromete a respeitar as limitações, capacidades e usos especificados pelo fabricante e instruir os operadores, para que possam as necessárias e suficientes instruções e documentação para operar o(s) equipamento(s) de forma segura, respeitando suas características de operação, manutenção diária, usos e cuidados.
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>7. COBERTURAS.</Text> As coberturas terão limites estabelecidos na apólice e cobrem os seguintes eventos: Incendio, explosão, tombamento, colisão, queda, transporte, roubo, furto qualificado e eventos climaticos (vendaval, granizo, tornado, raio.).
          </Text>
          <Text style={styles.clauseText}>
            <Text style={styles.bold}>8. EXCLUSÕES DE COBERTURA:</Text>
          </Text>
          <Text style={styles.clauseText}>I. Negligência ou dolo.</Text>
          <Text style={styles.clauseText}>II. Extravio, desaparecimento misterioso, furto simples, estelionato e apropriação indébita.</Text>
          <Text style={styles.clauseText}>III. Roubo parcial ou de partes e/ou acessórios dos equipamentos.</Text>
          <Text style={styles.clauseText}>IV. Danos causados por má estiva durante o transporte.</Text>
          <Text style={styles.clauseText}>V. Operações sobre a água ou sobre cais, docas, pontes, comportas, piers, balsas, pontões, embarcações, plataformas fixas e flutuantes.</Text>
          <Text style={styles.clauseText}>VI. Danos e/ou perdas decorrentes dos bens quando o transporte é feito por via aérea, marítima ou fluvial.</Text>
          <Text style={styles.clauseText}>VII. Equipamentos operando embaixo da terra, em obras subterrâneas ou em escavações de túneis.</Text>
          <Text style={styles.clauseText}>VIII. Eventos decorrentes de rompimento de barragem.</Text>
          <Text style={styles.clauseText}>IX. Responsabilidade contratual assumida pela Locatária sob qualquer contrato ou acordo de execução da mesma, ou por falha ou atraso.</Text>
          <Text style={styles.clauseText}>X. Interrupção de Negócios / Perda de receita / Lucros Cessantes.</Text>
          <Text style={styles.clauseText}>XI. Atos de autoridade e/ou confiscos realizados por qualquer autoridade governamental.</Text>
          <Text style={styles.clauseText}>XII. Danos/Perdas onde não há evidência física de dano.</Text>
          <Text style={styles.clauseText}>XIII. Pandemia, endemia, quarentenas sanitárias decretadas por órgãos governamentais e contaminações por qualquer tipo de vírus incluindo o SARS COVID-19.</Text>
          <Text style={styles.clauseText}>XIV. Falha, erro ou mau funcionamento de qualquer software de computador ou qualquer outro sistema eletrônico, ou operação, como meio de infligir danos, de qualquer software de computador, código malicioso, vírus ou processo de computador ou qualquer outro sistema eletrônico</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>
            <Text style={styles.clauseText}>
              OS EQUIPAMENTOS DIESEL SERÃO ENVIADOS COM A QUANTIDADE PARA CARGA E DESCARGA DO CAMINHÃO, DEVENDO SER ABASTECIDO PELO
              USUARIO DO EQUIPAMENTO, EM CASO DOS EQUIPAMENTOS ELÉTRICOS O MESMO SERÁ ENVIADO COM CARGA COMPLETA PARA UTILIZAÇÃO, DA
              MESMA FORMA TERÁ QUE SER DEVOLVIDO QUANDO ACIONADO A COLETA DO MESMO.</Text>
          </Text>
        </View>

        <View style={styles.signatureBox}>
          <View style={{ alignItems: 'center', width: 200 }}>
            <Image style={{ width: 100, height: 40, marginBottom: 5 }} src={signatureImg} />
            <Text style={styles.signatureLine}>LOCADOR</Text>
            <Text style={{ fontSize: 9, marginTop: 3, textAlign: 'center' }}>{data.locador?.company_name || ''}</Text>
          </View>
          <View style={{ alignItems: 'center', width: 200 }}>
            <View style={{ height: 45 }} />
            <Text style={styles.signatureLine}>LOCATÁRIO</Text>
            <Text style={{ fontSize: 9, marginTop: 3, textAlign: 'center' }}>{data.locatario?.company_name || ''}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Documento gerado em {formatDateTime(generatedAt || data.contract_date)} • C3Loc
        </Text>
      </Page>
    </Document>
  );
};

export default ContractDocument;
