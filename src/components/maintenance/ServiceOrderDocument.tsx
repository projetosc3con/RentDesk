import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ServiceOrder, ServiceOrderLabor } from '../../types';

interface OSPartItem {
  part_id: string;
  description: string;
  internal_code: string;
  quantity_used: number;
  unit_value_at_use: number;
  subtotal: number;
  was_used: boolean;
}

interface ServiceOrderDocumentProps {
  data: ServiceOrder;
  parts: OSPartItem[];
  labor: ServiceOrderLabor[];
}

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#2D3748',
  },
  headerContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#1A365D',
    paddingBottom: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1A365D',
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: 8,
    color: '#4A5568',
    marginTop: 1,
    fontFamily: 'Helvetica-Bold',
  },
  headerTextContainer: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1A365D',
  },
  subtitle: {
    fontSize: 8,
    color: '#718096',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    backgroundColor: '#1A365D',
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 8,
    marginBottom: 0,
    textTransform: 'uppercase',
  },
  gridRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomWidth: 0,
  },
  gridRowLast: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridCol: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  gridColLast: {
    flex: 1,
    padding: 4,
  },
  label: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: '#718096',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomWidth: 0,
  },
  tableHeaderCol: {
    padding: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#4A5568',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomWidth: 0,
  },
  tableRowLast: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableCol: {
    padding: 4,
    fontSize: 7.5,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#A0AEC0',
    paddingTop: 4,
  },
  signatureLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#4A5568',
    textAlign: 'center',
  },
  signatureValue: {
    fontSize: 8,
    marginTop: 2,
    textAlign: 'center',
  },
  booleanBadgeOk: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#2F855A',
  },
  booleanBadgeNotOk: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#C53030',
  },
});

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const ServiceOrderDocument: React.FC<ServiceOrderDocumentProps> = ({ data, parts, labor }) => {
  const isExterna = data.order_type === 'Externa';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CABEÇALHO */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>RENTDESK</Text>
            <Text style={styles.logoSubtitle}>SOLUÇÕES EM LOCAÇÃO</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>ORDEM DE SERVIÇO - MANUTENÇÃO {data.order_type?.toUpperCase()}</Text>
            <Text style={styles.subtitle}>Nº OS: {data.os_number || 'Nova'} | Data Abertura: {formatDate(data.execution_date)}</Text>
          </View>
        </View>

        {/* IDENTIFICAÇÃO / CABEÇALHO DA OS */}
        <View style={styles.sectionTitle}>
          <Text>Identificação do Equipamento e Cliente</Text>
        </View>
        
        <View style={styles.gridRow}>
          <View style={[styles.gridCol, { flex: 1.5 }]}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{data.client_name || '-'}</Text>
          </View>
          <View style={[styles.gridCol, { flex: 1 }]}>
            <Text style={styles.label}>Patrimônio / Asset</Text>
            <Text style={styles.value}>{data.equipment_asset_number || '-'}</Text>
          </View>
          <View style={[styles.gridColLast, { flex: 1 }]}>
            <Text style={styles.label}>Modelo</Text>
            <Text style={styles.value}>{data.equipment_model || '-'}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.gridCol, { flex: 1.5 }]}>
            <Text style={styles.label}>Endereço de Atendimento</Text>
            <Text style={styles.value}>{data.client_address || '-'}</Text>
          </View>
          <View style={[styles.gridCol, { flex: 1 }]}>
            <Text style={styles.label}>Nº Série</Text>
            <Text style={styles.value}>{data.equipment_serial_number || '-'}</Text>
          </View>
          <View style={[styles.gridColLast, { flex: 1 }]}>
            <Text style={styles.label}>Local de Execução</Text>
            <Text style={styles.value}>{data.execution_location || '-'}</Text>
          </View>
        </View>

        <View style={styles.gridRowLast}>
          <View style={[styles.gridCol, { flex: 1.5 }]}>
            <Text style={styles.label}>Contato no Cliente / Telefone</Text>
            <Text style={styles.value}>
              {data.client_contact_name || '-'} {data.client_phone ? `| ${data.client_phone}` : ''}
            </Text>
          </View>
          <View style={[styles.gridCol, { flex: 1 }]}>
            <Text style={styles.label}>Horímetro Anterior</Text>
            <Text style={styles.value}>{data.hour_meter_before !== null && data.hour_meter_before !== undefined ? data.hour_meter_before : '-'}</Text>
          </View>
          <View style={[styles.gridColLast, { flex: 1 }]}>
            <Text style={styles.label}>Horímetro Atual</Text>
            <Text style={styles.value}>{data.hour_meter_after !== null && data.hour_meter_after !== undefined ? data.hour_meter_after : '-'}</Text>
          </View>
        </View>

        {/* DIAGNÓSTICO E FALHA */}
        <View style={styles.sectionTitle}>
          <Text>Diagnóstico e Descrição dos Serviços</Text>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridColLast}>
            <Text style={styles.label}>Solicitação do Cliente (Falha Relatada)</Text>
            <Text style={styles.value}>{data.client_request || '-'}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridColLast}>
            <Text style={styles.label}>Diagnóstico Técnico (Causa da Falha)</Text>
            <Text style={styles.value}>{data.diagnosis || '-'}</Text>
          </View>
        </View>

        <View style={styles.gridRowLast}>
          <View style={styles.gridColLast}>
            <Text style={styles.label}>Serviços Executados (Ação Corretiva/Preventiva)</Text>
            <Text style={styles.value}>{data.services_executed || '-'}</Text>
          </View>
        </View>

        {/* TABELA DE PEÇAS */}
        <View style={styles.sectionTitle}>
          <Text>Peças e Insumos Utilizados</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCol, { width: '15%' }]}>Código</Text>
          <Text style={[styles.tableHeaderCol, { width: '45%' }]}>Descrição da Peça</Text>
          <Text style={[styles.tableHeaderCol, { width: '15%', textAlign: 'center' }]}>Qtd</Text>
          <Text style={[styles.tableHeaderCol, { width: '15%', textAlign: 'right' }]}>Valor Unit.</Text>
          <Text style={[styles.tableHeaderCol, { width: '10%', textAlign: 'center', borderRightWidth: 0 }]}>Utilizado?</Text>
        </View>

        {parts.length > 0 ? (
          parts.map((p, idx) => {
            const isLast = idx === parts.length - 1;
            return (
              <View key={p.part_id} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <Text style={[styles.tableCol, { width: '15%' }]}>{p.internal_code}</Text>
                <Text style={[styles.tableCol, { width: '45%' }]}>{p.description}</Text>
                <Text style={[styles.tableCol, { width: '15%', textAlign: 'center' }]}>{p.quantity_used}</Text>
                <Text style={[styles.tableCol, { width: '15%', textAlign: 'right' }]}>{formatCurrency(p.unit_value_at_use)}</Text>
                <Text style={[styles.tableCol, { width: '10%', textAlign: 'center', borderRightWidth: 0 }]}>
                  {p.was_used ? <Text style={styles.booleanBadgeOk}>SIM</Text> : <Text style={styles.booleanBadgeNotOk}>NÃO</Text>}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.tableRowLast}>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'center', color: '#718096', paddingVertical: 8 }]}>
              Nenhuma peça ou insumo utilizado nesta ordem de serviço.
            </Text>
          </View>
        )}

        {/* MÃO DE OBRA */}
        <View style={styles.sectionTitle}>
          <Text>Mão de Obra e Tempos de Execução</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCol, { width: '40%' }]}>Técnico</Text>
          <Text style={[styles.tableHeaderCol, { width: '20%', textAlign: 'center' }]}>Data</Text>
          <Text style={[styles.tableHeaderCol, { width: '15%', textAlign: 'center' }]}>Hora Início</Text>
          <Text style={[styles.tableHeaderCol, { width: '15%', textAlign: 'center' }]}>Hora Fim</Text>
          <Text style={[styles.tableHeaderCol, { width: '10%', textAlign: 'center', borderRightWidth: 0 }]}>Tipo</Text>
        </View>

        {labor.length > 0 ? (
          labor.map((l, idx) => {
            const isLast = idx === labor.length - 1;
            const typeLabel = l.labor_type === 'V' ? 'Viagem' : l.labor_type === 'I' ? 'Intervalo' : 'Trabalho';
            return (
              <View key={idx} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <Text style={[styles.tableCol, { width: '40%' }]}>{l.technician_name}</Text>
                <Text style={[styles.tableCol, { width: '20%', textAlign: 'center' }]}>{formatDate(l.labor_date)}</Text>
                <Text style={[styles.tableCol, { width: '15%', textAlign: 'center' }]}>{l.start_time || '-'}</Text>
                <Text style={[styles.tableCol, { width: '15%', textAlign: 'center' }]}>{l.end_time || '-'}</Text>
                <Text style={[styles.tableCol, { width: '10%', textAlign: 'center', borderRightWidth: 0 }]}>{typeLabel}</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.tableRowLast}>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'center', color: '#718096', paddingVertical: 8 }]}>
              Nenhum registro de mão de obra inserido.
            </Text>
          </View>
        )}

        {/* OBSERVAÇÕES E CHECKLISTS */}
        <View style={styles.sectionTitle}>
          <Text>Observações Gerais e Controles</Text>
        </View>

        <View style={styles.gridRow}>
          <View style={[styles.gridCol, { flex: 2 }]}>
            <Text style={styles.label}>Observações Técnicas</Text>
            <Text style={styles.value}>{data.tech_observation || '-'}</Text>
          </View>
          <View style={[styles.gridColLast, { flex: 1 }]}>
            <Text style={styles.label}>Status dos Controles Técnicos</Text>
            <Text style={styles.value}>
              Obs. Técnicas OK: {data.tech_observation_ok ? <Text style={styles.booleanBadgeOk}>SIM</Text> : <Text style={styles.booleanBadgeNotOk}>NÃO</Text>}
              {'\n'}
              Equipamento Funcional: {data.equipment_functional ? <Text style={styles.booleanBadgeOk}>SIM</Text> : <Text style={styles.booleanBadgeNotOk}>NÃO</Text>}
              {!isExterna && (
                <>
                  {'\n'}
                  Pendência de Peças: {data.parts_pending ? <Text style={styles.booleanBadgeNotOk}>SIM</Text> : <Text style={styles.booleanBadgeOk}>NÃO</Text>}
                </>
              )}
            </Text>
          </View>
        </View>

        {isExterna && (
          <>
            <View style={styles.gridRow}>
              <View style={[styles.gridCol, { flex: 2 }]}>
                <Text style={styles.label}>Observações do Cliente</Text>
                <Text style={styles.value}>{data.client_observation || '-'}</Text>
              </View>
              <View style={[styles.gridColLast, { flex: 1 }]}>
                <Text style={styles.label}>Avaliação do Cliente</Text>
                <Text style={styles.value}>
                  Observações OK: {data.client_observation_ok ? <Text style={styles.booleanBadgeOk}>SIM</Text> : <Text style={styles.booleanBadgeNotOk}>NÃO</Text>}
                </Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={[styles.gridCol, { flex: 2 }]}>
                <Text style={styles.label}>Checklist de Atendimento (Avaliação do Cliente)</Text>
                <Text style={[styles.value, { fontSize: 7, lineHeight: 1.2 }]}>
                  • O equipamento ficou em boas condições de uso? {data.checklist_equipment_conditions ? 'Sim' : 'Não'}
                  {'\n'}
                  • Havia condições seguras de trabalho para o técnico? {data.checklist_safe_work ? 'Sim' : 'Não'}
                  {'\n'}
                  • O técnico utilizou todos os EPIs necessários? {data.checklist_epi ? 'Sim' : 'Não'}
                  {'\n'}
                  • O ambiente de trabalho era adequado para a operação? {data.checklist_adequate_environment ? 'Sim' : 'Não'}
                  {'\n'}
                  • O atendimento prestado foi satisfatório? {data.checklist_well_served ? 'Sim' : 'Não'}
                </Text>
              </View>
              <View style={[styles.gridColLast, { flex: 1 }]}>
                <Text style={styles.label}>Dados de Deslocamento (Veículo)</Text>
                <Text style={styles.value}>
                  Placa: {data.vehicle_plate || '-'}
                  {'\n'}
                  KM Inicial: {data.vehicle_km_start !== null && data.vehicle_km_start !== undefined ? data.vehicle_km_start : '-'}
                  {'\n'}
                  KM Final: {data.vehicle_km_end !== null && data.vehicle_km_end !== undefined ? data.vehicle_km_end : '-'}
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.gridRowLast}>
          <View style={[styles.gridCol, { flex: 2 }]}>
            <Text style={styles.label}>Análise Crítica do Gestor</Text>
            <Text style={styles.value}>{data.critical_analysis || '-'}</Text>
          </View>
          <View style={[styles.gridColLast, { flex: 1 }]}>
            <Text style={styles.label}>Custos e Pendências</Text>
            <Text style={styles.value}>
              {isExterna ? 'Custo CLM (Empresa): ' : 'Custo M (Manutenção): '}{formatCurrency(data.cost_company)}
              {'\n'}
              {isExterna ? 'Custo Cliente: ' : 'Custo C (Compras): '}{formatCurrency(data.cost_client)}
              {'\n'}
              Tem pendência geral? {data.has_pending ? <Text style={styles.booleanBadgeNotOk}>SIM</Text> : <Text style={styles.booleanBadgeOk}>NÃO</Text>}
            </Text>
          </View>
        </View>

        {/* DETALHES DO RELATÓRIO */}
        {data.description && (
          <>
            <View style={styles.sectionTitle}>
              <Text>Relatório Técnico Detalhado</Text>
            </View>
            <View style={styles.gridRowLast}>
              <View style={styles.gridColLast}>
                <Text style={styles.value}>{data.description}</Text>
              </View>
            </View>
          </>
        )}

        {/* ASSINATURAS */}
        <View style={styles.signatureContainer}>
          {isExterna ? (
            <>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureLabel}>ASSINATURA DO CLIENTE</Text>
                <Text style={styles.signatureValue}>{data.signer_client_name || '___________________________'}</Text>
                <Text style={{ fontSize: 6, color: '#718096', marginTop: 1 }}>
                  {data.signer_client_role ? `Função: ${data.signer_client_role}` : ''} {data.signer_client_rg ? `| RG: ${data.signer_client_rg}` : ''}
                </Text>
              </View>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureLabel}>ASSINATURA DO TÉCNICO</Text>
                <Text style={styles.signatureValue}>{data.signer_tech_name || '___________________________'}</Text>
                <Text style={{ fontSize: 6, color: '#718096', marginTop: 1 }}>
                  {data.signer_tech_role ? `Função: ${data.signer_tech_role}` : 'Técnico de Manutenção'}
                </Text>
              </View>
            </>
          ) : (
            <View style={[styles.signatureBox, { width: '100%', borderTopWidth: 0, alignItems: 'center', marginTop: 10 }]}>
              <View style={{ width: '45%', borderTopWidth: 1, borderTopColor: '#A0AEC0', paddingTop: 4, alignItems: 'center' }}>
                <Text style={styles.signatureLabel}>TÉCNICO RESPONSÁVEL</Text>
                <Text style={styles.signatureValue}>{data.signer_tech_name || '___________________________'}</Text>
                <Text style={{ fontSize: 6, color: '#718096', marginTop: 1 }}>
                  {data.signer_tech_role ? `Função: ${data.signer_tech_role}` : 'Técnico de Manutenção'}
                </Text>
              </View>
            </View>
          )}
        </View>

      </Page>
    </Document>
  );
};

export default ServiceOrderDocument;
