# Implementação — Geração e Anexo de Contrato de Locação no Módulo CRM
> ERP de Locação de Equipamentos Industriais  
> Contexto: funcionalidade vinculada à entidade `crm_deals`. Como o deal não contém todos os dados exigidos pelo contrato, o usuário preenche um formulário dedicado cujos dados são persistidos no banco antes de qualquer geração de PDF. O contrato é gerado a partir desses dados salvos, baixado pelo usuário, assinado fisicamente pelo cliente e depois anexado ao deal via upload para o Supabase Storage.  
> Stack: React + TypeScript + Vite + Tailwind CSS + Supabase | Biblioteca de PDF: **@react-pdf/renderer**

---

## 1. Visão geral do fluxo

```
crm_deals (deal aberto)
    │
    ├── [1] Usuário clica em "Preparar Contrato"
    │         └── Abre formulário dedicado de dados do contrato
    │                 └── Campos pré-preenchidos do deal onde possível
    │                 └── Usuário preenche/revisa todos os campos obrigatórios
    │                 └── Dados salvos em crm_deal_contract_forms (rascunho editável)
    │
    ├── [2] Formulário salvo → botão "Gerar PDF" é habilitado
    │         └── Sistema constrói o snapshot a partir de crm_deal_contract_forms
    │         └── PDF gerado no browser via @react-pdf/renderer
    │         └── Registro criado em crm_deal_contracts com o snapshot
    │         └── Usuário faz download do arquivo
    │
    ├── [3] Usuário envia o PDF para o cliente assinar (fora do sistema)
    │
    ├── [4] Usuário recebe o PDF assinado e faz upload no deal
    │         └── Arquivo salvo no Supabase Storage
    │         └── crm_deal_contracts.status → 'Assinado'
    │         └── crm_deals.active_contract_id atualizado
    │
    └── [5] Deal pode ser movido para etapa "Fechado Ganho"
              └── Conversão de lead → client (se aplicável)
```

> **Princípio central:** o formulário (`crm_deal_contract_forms`) é a fonte de verdade dos dados do contrato. O PDF é apenas uma renderização desses dados. O formulário pode ser editado e o PDF regerado quantas vezes forem necessárias antes da assinatura.

---

## 2. Nova tabela: `crm_deal_contract_forms`

Armazena os dados preenchidos pelo usuário no formulário de contrato, vinculados a um deal. É a etapa obrigatória antes da geração do PDF. Um deal tem no máximo um formulário ativo por vez — editar o formulário após uma geração não cria um novo contrato automaticamente; é necessário clicar em "Gerar PDF" novamente.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `deal_id` | UUID | FK → crm_deals(id), NOT NULL, UNIQUE | Deal vinculado (1 formulário por deal) |
| `contract_date` | DATE | NOT NULL | Data do contrato |
| `locatario_company_name` | TEXT | NOT NULL | Razão social do locatário |
| `locatario_cnpj` | TEXT | NOT NULL | CNPJ do locatário |
| `locatario_state_registration` | TEXT | | Inscrição estadual (ou "ISENTO") |
| `locatario_address_full` | TEXT | NOT NULL | Endereço completo formatado |
| `equipment_description` | TEXT | NOT NULL | Descrição do equipamento (ex: "Plataforma Tesoura 14m") |
| `equipment_model` | TEXT | NOT NULL | Modelo (ex: "SJ4740 ou similar") |
| `contract_duration_days` | INTEGER | NOT NULL | Duração do contrato em dias |
| `period_start` | DATE | NOT NULL | Data de início do período |
| `period_end` | DATE | NOT NULL | Data de fim do período (pode ser calculada automaticamente: period_start + contract_duration_days) |
| `cost_rental` | NUMERIC(12,2) | NOT NULL, default 0 | Valor de locação |
| `cost_insurance` | NUMERIC(12,2) | NOT NULL, default 0 | Valor de seguro |
| `cost_freight` | NUMERIC(12,2) | NOT NULL, default 0 | Valor de frete |
| `cost_rcd` | NUMERIC(12,2) | NOT NULL, default 0 | Valor RCD |
| `cost_third_party` | NUMERIC(12,2) | NOT NULL, default 0 | Serviços de terceiros |
| `cost_training` | NUMERIC(12,2) | NOT NULL, default 0 | Treinamento |
| `cost_total` | NUMERIC(12,2) | NOT NULL | Total (calculado e persistido: soma de todos os custos) |
| `billing_interval_days` | INTEGER | NOT NULL | Intervalo de faturamento em dias (ex: 28) |
| `work_site` | TEXT | NOT NULL | Local de uso do equipamento |
| `site_contact_name` | TEXT | | Nome do contato de recebimento na obra |
| `site_contact_phone` | TEXT | | Telefone do contato de recebimento |
| `notes` | TEXT | | Observações internas (não aparecem no PDF) |
| `form_status` | TEXT | NOT NULL, default 'Rascunho' | Status: `Rascunho`, `Pronto para Gerar`, `PDF Gerado` |
| `created_by` | UUID | FK → users_profiles(id), NOT NULL | Usuário que criou o formulário |
| `updated_by` | UUID | FK → users_profiles(id) | Último usuário que editou |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

### 2.1 Regras de negócio do formulário

- `period_end` deve ser calculado automaticamente no frontend como `period_start + contract_duration_days`, mas pode ser editado manualmente pelo usuário.
- `cost_total` deve ser recalculado no frontend sempre que qualquer campo de custo for alterado e persistido junto com o save.
- O formulário pode ser salvo como `Rascunho` quantas vezes o usuário quiser antes de estar completo.
- Quando todos os campos obrigatórios estiverem preenchidos e validados, o `form_status` pode ser promovido para `Pronto para Gerar`, habilitando o botão de geração de PDF.
- Após a primeira geração de PDF bem-sucedida, o `form_status` passa para `PDF Gerado`. O formulário continua editável — editar e salvar volta o status para `Pronto para Gerar`, indicando que o PDF atual pode estar desatualizado.

### 2.2 Colunas adicionadas em `crm_deals`

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `active_contract_id` | UUID | FK → crm_deal_contracts(id) | Referência ao contrato vigente (assinado) |
| `contract_form_id` | UUID | FK → crm_deal_contract_forms(id) | Referência ao formulário de contrato do deal |

---

## 3. Nova tabela: `crm_deal_contracts`

Armazena o histórico de PDFs gerados para um deal. Cada vez que o usuário clica em "Gerar PDF" a partir de um formulário salvo, um novo registro é criado aqui com o snapshot imutável dos dados. Um deal pode ter múltiplas versões geradas.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `deal_id` | UUID | FK → crm_deals(id), NOT NULL | Deal ao qual o contrato pertence |
| `contract_form_id` | UUID | FK → crm_deal_contract_forms(id), NOT NULL | Formulário que originou esta geração |
| `contract_number` | TEXT | NOT NULL, UNIQUE | Número sequencial do contrato (ex: "297") |
| `version` | INTEGER | NOT NULL, default 1 | Versão do contrato (para reemissões do mesmo deal) |
| `status` | TEXT | NOT NULL, default 'Gerado' | Status: `Gerado`, `Enviado ao Cliente`, `Assinado`, `Cancelado` |
| `generated_at` | TIMESTAMPTZ | NOT NULL, default now() | Data/hora de geração do PDF |
| `generated_by` | UUID | FK → users_profiles(id), NOT NULL | Usuário que gerou o contrato |
| `signed_file_url` | TEXT | | URL do PDF assinado no Supabase Storage (preenchido no upload) |
| `signed_uploaded_at` | TIMESTAMPTZ | | Data/hora do upload do PDF assinado |
| `signed_uploaded_by` | UUID | FK → users_profiles(id) | Usuário que fez o upload do arquivo assinado |
| `snapshot` | JSONB | NOT NULL | Snapshot completo dos dados usados na geração (ver seção 5) |
| `notes` | TEXT | | Observações |
| `created_at` | TIMESTAMPTZ | NOT NULL, default now() | Data de criação |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

---

## 4. Nova tabela de configuração: `erp_company_settings`

Armazena os dados da empresa locadora (sua empresa) usados no cabeçalho de todos os contratos. Deve ter apenas um registro ativo.

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | UUID | PK, default gen_random_uuid() | Identificador único |
| `company_name` | TEXT | NOT NULL | Razão social (ex: "Guindaste Marthe Ltda") |
| `cnpj` | TEXT | NOT NULL | CNPJ |
| `state_registration` | TEXT | | Inscrição estadual |
| `address_full` | TEXT | NOT NULL | Endereço completo formatado |
| `logo_url` | TEXT | | URL do logo no Supabase Storage |
| `bank_name` | TEXT | | Nome do banco |
| `bank_code` | TEXT | | Código do banco |
| `bank_agency` | TEXT | | Agência |
| `bank_account` | TEXT | | Conta corrente |
| `bank_pix_key` | TEXT | | Chave PIX |
| `contract_clauses` | JSONB | NOT NULL | Texto das cláusulas contratuais (ver seção 3.1) |
| `active` | BOOLEAN | NOT NULL, default TRUE | Configuração ativa |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default now() | Última atualização |

### 4.1 Estrutura do campo `contract_clauses` (JSONB)

Permite que o admin edite as cláusulas pelo sistema sem necessidade de alterar código.

```json
{
  "rental_period": "Texto completo da cláusula PERÍODO CONTRATADO E RENOVAÇÃO...",
  "billing_conditions": "Texto completo da cláusula FATURAMENTO E CONDIÇÕES DE PAGAMENTO...",
  "equipment_delivery": "Texto completo da cláusula ENTREGA DO(S) EQUIPAMENTO(S) À LOCATÁRIA...",
  "equipment_return": "Texto completo da cláusula DEVOLUÇÃO DO(S) EQUIPAMENTO(S) À LOCADORA E DANOS A RESSARCIR...",
  "maintenance_training": "Texto completo da cláusula MANUTENÇÃO, TREINAMENTO E DESPESAS EXIGÍVEIS...",
  "insurance": "Texto completo da cláusula SEGURO: COBERTURAS E FRANQUIAS...",
  "fuel_note": "Nota sobre combustível dos equipamentos diesel/elétricos..."
}
```

> **Observação para o Gemini:** na primeira execução do sistema, popular `contract_clauses` com os textos integrais das cláusulas do contrato de referência. O admin pode editá-las via tela de Configurações do ERP.

---

## 5. Snapshot JSONB do contrato

Ao gerar o PDF, a aplicação lê os dados de `crm_deal_contract_forms` (já salvos), combina com os dados de `erp_company_settings` e serializa tudo em `crm_deal_contracts.snapshot`. Esse snapshot é imutável após a inserção — representa exatamente o que foi impresso no PDF entregue ao cliente.

```json
{
  "contract_number": "297",
  "contract_date": "2026-05-12",
  "locador": {
    "company_name": "Guindaste Marthe Ltda",
    "cnpj": "95.856.936/0001-25",
    "state_registration": "255.389.31",
    "address_full": "AC. DEPUTADO GENÉSIO TURECK, ACESSO OESTE, 1169, 89288-215, SÃO BENTO DO SUL-SC",
    "logo_url": "https://...",
    "bank_name": "Banco Ailos",
    "bank_code": "085",
    "bank_agency": "0112-0",
    "bank_account": "60325-2",
    "bank_pix_key": "marthe@marthe.com.br"
  },
  "locatario": {
    "company_name": "AL MONT MONTAGEM E MANUTENCAO INDUSTRIAL LTDA",
    "cnpj": "44.012.958/0001-78",
    "state_registration": "ISENTO",
    "address_full": "RUA FRANCISCO CASTELLANO, 638, JARDIM DAS AMERICAS, CURITIBA/PR - CEP: 81540-370"
  },
  "equipment": {
    "description": "Plataforma Tesoura 14m",
    "model": "SJ4740 ou similar"
  },
  "contract_duration_days": 60,
  "period_start": "2026-05-18",
  "period_end": "2026-06-16",
  "costs": {
    "rental": 8900.00,
    "insurance": 599.00,
    "freight": 2000.00,
    "rcd": 0,
    "third_party": 0,
    "training": 0,
    "total": 11499.00
  },
  "billing_interval_days": 28,
  "work_site": "COPASUL - PROCESSADORA DE SOJA NAVIRAI/MS",
  "site_contact_name": "EVERTON",
  "site_contact_phone": "(41) 99284-5513",
  "clauses": { "...snapshot das cláusulas vigentes no momento da geração..." }
}
```

---

## 6. Geração do PDF — estrutura do documento

Usar a biblioteca **@react-pdf/renderer** para gerar o PDF inteiramente no frontend sem depender de backend.

### 6.1 Estrutura de páginas e seções

```
Página 1
├── Cabeçalho
│   ├── Logo da empresa locadora (erp_company_settings.logo_url)
│   ├── Título: "CONTRATO DE LOCAÇÃO - PLATAFORMA ELEVATÓRIA"
│   ├── Data do contrato | Contrato Nº
│   ├── Bloco LOCADOR (dados de erp_company_settings)
│   └── Bloco LOCATÁRIO (dados do cliente/lead)
│
├── Seção: PROPOSTA E VALORES
│   ├── Informações do equipamento
│   ├── Duração do contrato (dias)
│   ├── Período início / Período final
│   ├── Valor da locação + Seguro + Frete = Total (formatado em BRL)
│   ├── Dados bancários
│   ├── Condições de faturamento
│   └── Tabela: Local de uso | Contato de recebimento
│
└── Seção: OBJETO DA PROPOSTA E VALORES (texto jurídico fixo)

Página 2
├── PERÍODO CONTRATADO E RENOVAÇÃO (contract_clauses.rental_period)
└── FATURAMENTO E CONDIÇÕES DE PAGAMENTO (contract_clauses.billing_conditions)
    └── ENTREGA DO(S) EQUIPAMENTO(S) (contract_clauses.equipment_delivery)
    └── DEVOLUÇÃO DO(S) EQUIPAMENTO(S) E DANOS (contract_clauses.equipment_return)

Página 3
├── MANUTENÇÃO, TREINAMENTO E DESPESAS (contract_clauses.maintenance_training)
└── SEGURO: COBERTURAS E FRANQUIAS (contract_clauses.insurance)
    └── Nota sobre combustível (contract_clauses.fuel_note)

Página 4
└── Bloco de Assinaturas
    ├── Coluna esquerda: LOCADOR — nome + linha de assinatura
    └── Coluna direita: LOCATÁRIA — nome + linha de assinatura
```

### 6.2 Componente React sugerido

```tsx
// src/modules/crm/components/ContractPDFDocument.tsx

import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

interface ContractPDFProps {
  snapshot: ContractSnapshot; // tipagem baseada na seção 4
}

export function ContractPDFDocument({ snapshot }: ContractPDFProps) {
  return (
    <Document>
      {/* Página 1 — Cabeçalho + Proposta */}
      <Page size="A4" style={styles.page}>
        <ContractHeader snapshot={snapshot} />
        <LocadorBlock snapshot={snapshot} />
        <LocatarioBlock snapshot={snapshot} />
        <PropostaValoresBlock snapshot={snapshot} />
        <ObjetoPropostaText />
      </Page>

      {/* Página 2 — Cláusulas 1 e 2 */}
      <Page size="A4" style={styles.page}>
        <ClauseBlock title="PERÍODO CONTRATADO E RENOVAÇÃO" text={snapshot.clauses.rental_period} />
        <ClauseBlock title="FATURAMENTO E CONDIÇÕES DE PAGAMENTO" text={snapshot.clauses.billing_conditions} />
        <ClauseBlock title="ENTREGA DO(S) EQUIPAMENTO(S) À LOCATÁRIA" text={snapshot.clauses.equipment_delivery} />
        <ClauseBlock title="DEVOLUÇÃO DO(S) EQUIPAMENTO(S) À LOCADORA E DANOS A RESSARCIR" text={snapshot.clauses.equipment_return} />
      </Page>

      {/* Página 3 — Cláusulas 3 e 4 */}
      <Page size="A4" style={styles.page}>
        <ClauseBlock title="MANUTENÇÃO, TREINAMENTO E DESPESAS EXIGÍVEIS" text={snapshot.clauses.maintenance_training} />
        <ClauseBlock title="SEGURO: COBERTURAS E FRANQUIAS" text={snapshot.clauses.insurance} />
        <FuelNote text={snapshot.clauses.fuel_note} />
      </Page>

      {/* Página 4 — Assinaturas */}
      <Page size="A4" style={styles.page}>
        <SignatureBlock snapshot={snapshot} />
      </Page>
    </Document>
  );
}
```

### 6.3 Função de geração e download

A função lê os dados de `crm_deal_contract_forms` (já persistidos), não de campos voláteis do modal.

```tsx
// src/modules/crm/utils/generateContract.ts

import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { ContractPDFDocument } from '../components/ContractPDFDocument';
import { buildSnapshotFromForm } from './buildSnapshotFromForm';
import { supabase } from '@/lib/supabase';

export async function generateAndDownloadContract(dealId: string, generatedBy: string) {
  // 1. Buscar o formulário salvo do deal
  const { data: form, error: formError } = await supabase
    .from('crm_deal_contract_forms')
    .select('*')
    .eq('deal_id', dealId)
    .single();

  if (formError || !form) throw new Error('Formulário de contrato não encontrado para este deal.');
  if (form.form_status === 'Rascunho') throw new Error('Preencha todos os campos obrigatórios antes de gerar o PDF.');

  // 2. Buscar configurações da empresa locadora
  const { data: settings } = await supabase
    .from('erp_company_settings')
    .select('*')
    .eq('active', true)
    .single();

  // 3. Construir snapshot a partir do formulário + settings
  const snapshot = buildSnapshotFromForm(form, settings);

  // 4. Gerar número sequencial seguro via Database Function
  const { data: contractNumber } = await supabase
    .rpc('get_next_contract_number');

  snapshot.contract_number = contractNumber;

  // 5. Calcular versão (quantos contratos já existem para este deal)
  const { count } = await supabase
    .from('crm_deal_contracts')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', dealId);

  const version = (count ?? 0) + 1;

  // 6. Cancelar contrato anterior do deal (se existir)
  await supabase
    .from('crm_deal_contracts')
    .update({ status: 'Cancelado' })
    .eq('deal_id', dealId)
    .neq('status', 'Assinado'); // nunca cancelar um já assinado

  // 7. Salvar registro do novo contrato
  const { data: contractRecord } = await supabase
    .from('crm_deal_contracts')
    .insert({
      deal_id: dealId,
      contract_form_id: form.id,
      contract_number: contractNumber,
      version,
      status: 'Gerado',
      generated_by: generatedBy,
      snapshot,
    })
    .select()
    .single();

  // 8. Atualizar form_status para 'PDF Gerado'
  await supabase
    .from('crm_deal_contract_forms')
    .update({ form_status: 'PDF Gerado', updated_by: generatedBy })
    .eq('id', form.id);

  // 9. Gerar blob e disparar download
  const blob = await pdf(<ContractPDFDocument snapshot={snapshot} />).toBlob();
  const safeName = form.locatario_company_name.replace(/[^a-zA-Z0-9]/g, '_');
  saveAs(blob, `Contrato_${contractNumber}_${safeName}.pdf`);

  return contractRecord;
}
```
```

---

## 7. Upload do contrato assinado

Após o cliente assinar fisicamente e devolver o PDF, o usuário faz upload no deal.

### 7.1 Bucket no Supabase Storage

```
Bucket: crm-contracts (privado)
Path:   crm-contracts/{deal_id}/{contract_id}/signed.pdf
```

### 7.2 Função de upload

```tsx
// src/modules/crm/utils/uploadSignedContract.ts

import { supabase } from '@/lib/supabase';

export async function uploadSignedContract(
  dealId: string,
  contractId: string,
  file: File,
  uploadedBy: string
) {
  const path = `${dealId}/${contractId}/signed.pdf`;

  // 1. Upload do arquivo no Storage
  const { error: storageError } = await supabase.storage
    .from('crm-contracts')
    .upload(path, file, { upsert: true, contentType: 'application/pdf' });

  if (storageError) throw storageError;

  // 2. Gerar URL assinada de longa duração (10 anos em segundos)
  const { data: urlData } = await supabase.storage
    .from('crm-contracts')
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);

  // 3. Atualizar o registro do contrato
  await supabase
    .from('crm_deal_contracts')
    .update({
      signed_file_url: urlData?.signedUrl,
      signed_uploaded_at: new Date().toISOString(),
      signed_uploaded_by: uploadedBy,
      status: 'Assinado',
    })
    .eq('id', contractId);

  // 4. Atualizar o deal com o contrato ativo
  await supabase
    .from('crm_deals')
    .update({ active_contract_id: contractId })
    .eq('id', dealId);
}
```

---

## 8. Interface no deal — estados da UI

A tela de detalhe do `crm_deal` deve exibir um painel de contrato com os seguintes estados visuais, que refletem tanto o `form_status` de `crm_deal_contract_forms` quanto o `status` de `crm_deal_contracts`:

### Estado 1 — Sem formulário preenchido
```
┌──────────────────────────────────────────────┐
│  📄 Contrato de Locação                       │
│  Nenhum formulário de contrato preenchido.    │
│  [Preencher Dados do Contrato]                │
└──────────────────────────────────────────────┘
```

### Estado 2 — Formulário em rascunho (campos obrigatórios faltando)
```
┌──────────────────────────────────────────────┐
│  📄 Contrato de Locação  •  ✏️ Rascunho       │
│  Formulário incompleto. Preencha todos os     │
│  campos obrigatórios para gerar o PDF.        │
│  [Continuar Preenchimento]                    │
└──────────────────────────────────────────────┘
```

### Estado 3 — Formulário completo, pronto para gerar
```
┌──────────────────────────────────────────────┐
│  📄 Contrato de Locação  •  ✅ Pronto         │
│  Dados preenchidos. PDF ainda não gerado.     │
│  [Editar Formulário]  [Gerar PDF]             │
└──────────────────────────────────────────────┘
```

### Estado 4 — PDF gerado, aguardando assinatura
```
┌──────────────────────────────────────────────┐
│  📄 Contrato Nº 297  •  📥 Gerado            │
│  Gerado em 12/05/2026 por João Silva          │
│  ⚠️ Formulário editado após última geração   │  ← exibir apenas se form foi editado após geração
│  [Baixar PDF]  [Anexar PDF Assinado]          │
│  [Editar Formulário e Regerar]                │
└──────────────────────────────────────────────┘
```

### Estado 5 — Contrato assinado anexado
```
┌──────────────────────────────────────────────┐
│  📄 Contrato Nº 297  •  ✅ Assinado          │
│  Assinado anexado em 15/05/2026               │
│  [Visualizar PDF Assinado]                    │
└──────────────────────────────────────────────┘
```

---

## 9. Formulário de dados do contrato — campos e pré-preenchimento

O formulário é uma página (ou drawer) dedicada acessada a partir do deal. Os campos abaixo devem ser pré-preenchidos automaticamente onde possível, mas todos são editáveis pelo usuário.

| Campo no formulário | Coluna em `crm_deal_contract_forms` | Pré-preenchido de |
|---|---|---|
| Data do contrato | `contract_date` | Data atual |
| Nome do locatário | `locatario_company_name` | `clients.company_name` ou `crm_leads.company_name` |
| CNPJ do locatário | `locatario_cnpj` | `clients.cnpj` ou `crm_leads.cnpj` |
| Inscrição estadual | `locatario_state_registration` | `clients.state_registration` (se existir) |
| Endereço do locatário | `locatario_address_full` | Montado de `clients.address_*` |
| Descrição do equipamento | `equipment_description` | Campo livre — sem pré-preenchimento |
| Modelo do equipamento | `equipment_model` | Campo livre — sem pré-preenchimento |
| Duração do contrato (dias) | `contract_duration_days` | Campo numérico livre |
| Data de início | `period_start` | `crm_deals.expected_close_date` |
| Data de fim | `period_end` | Calculado: `period_start + contract_duration_days` (editável) |
| Valor de locação | `cost_rental` | `crm_deals.value` (editável) |
| Valor de seguro | `cost_insurance` | 0 (editável) |
| Valor de frete | `cost_freight` | 0 (editável) |
| Valor RCD | `cost_rcd` | 0 (editável) |
| Serviços de terceiros | `cost_third_party` | 0 (editável) |
| Treinamento | `cost_training` | 0 (editável) |
| **Total** | `cost_total` | Calculado automaticamente (somente leitura no form) |
| Intervalo de faturamento (dias) | `billing_interval_days` | Campo numérico livre (ex: 28) |
| Local da obra | `work_site` | Campo texto livre |
| Nome do contato na obra | `site_contact_name` | `crm_contacts` primário do deal (se existir) |
| Telefone do contato | `site_contact_phone` | `crm_contacts` primário do deal (se existir) |
| Observações internas | `notes` | Campo texto livre (não aparece no PDF) |

### 9.1 Validações obrigatórias antes de promover para `Pronto para Gerar`

- `locatario_cnpj` preenchido e válido
- `locatario_address_full` preenchido
- `equipment_description` preenchido
- `equipment_model` preenchido
- `period_start` preenchido e anterior a `period_end`
- `contract_duration_days` > 0
- `cost_rental` > 0
- `billing_interval_days` > 0
- `work_site` preenchido

---

## 10. Número sequencial do contrato — regra de negócio

- O número do contrato é gerado automaticamente de forma sequencial global (não por cliente ou deal).
- Formato sugerido: inteiro incremental sem prefixo (ex: 297, 298, 299...) para manter compatibilidade com o modelo de contrato de referência.
- A sequência deve ser controlada consultando o maior `contract_number` existente na tabela `crm_deal_contracts` no momento da geração, somando 1.
- Contratos com `status = 'Cancelado'` **não liberam** o número para reutilização.
- Se dois usuários gerarem contratos simultaneamente, usar uma **Supabase Database Function** com `SELECT MAX` + `INSERT` dentro de uma transação para evitar duplicidade de número.

```sql
-- Função Supabase para geração segura do próximo número de contrato
CREATE OR REPLACE FUNCTION get_next_contract_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(contract_number AS INTEGER)), 0) + 1
  INTO next_num
  FROM crm_deal_contracts;
  RETURN LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;
```

---

## 11. Índices recomendados

```sql
CREATE INDEX idx_deal_contract_forms_deal ON crm_deal_contract_forms(deal_id);
CREATE INDEX idx_deal_contract_forms_status ON crm_deal_contract_forms(form_status);
CREATE INDEX idx_deal_contracts_deal    ON crm_deal_contracts(deal_id);
CREATE INDEX idx_deal_contracts_form    ON crm_deal_contracts(contract_form_id);
CREATE INDEX idx_deal_contracts_status  ON crm_deal_contracts(status);
CREATE INDEX idx_deal_contracts_number  ON crm_deal_contracts(contract_number);
```

---

## 12. RLS — políticas recomendadas

| Operação | Tabela | Quem pode |
|---|---|---|
| SELECT | `crm_deal_contract_forms` | `Admin`, `Gerente`, `Operacional`, `Financeiro` |
| INSERT / UPDATE | `crm_deal_contract_forms` | `Admin`, `Gerente`, `Operacional` |
| DELETE | `crm_deal_contract_forms` | Apenas `Admin` |
| SELECT | `crm_deal_contracts` | `Admin`, `Gerente`, `Operacional`, `Financeiro` |
| INSERT (gerar PDF) | `crm_deal_contracts` | `Admin`, `Gerente`, `Operacional` |
| UPDATE (upload assinado, cancelar) | `crm_deal_contracts` | `Admin`, `Gerente`, `Operacional` |
| DELETE | `crm_deal_contracts` | Apenas `Admin` |
| SELECT / UPDATE | `erp_company_settings` | Apenas `Admin` |

---

## 13. Diagrama de relacionamentos do módulo de contrato

```
crm_deals
    │
    ├── crm_deal_contract_forms (1:1 — um formulário por deal)
    │       ├── form_status: Rascunho → Pronto para Gerar → PDF Gerado
    │       ├── created_by / updated_by → users_profiles
    │       └── todos os campos de dados do contrato
    │
    ├── crm_deal_contracts (1:N — um deal pode ter versões geradas)
    │       ├── contract_form_id → crm_deal_contract_forms (qual form originou)
    │       ├── snapshot (JSONB — dados congelados no momento da geração)
    │       ├── signed_file_url → Supabase Storage: crm-contracts/{deal_id}/{contract_id}/signed.pdf
    │       ├── generated_by → users_profiles
    │       └── signed_uploaded_by → users_profiles
    │
    └── active_contract_id → crm_deal_contracts (FK para o contrato assinado vigente)

erp_company_settings (1 registro ativo)
    └── contract_clauses (JSONB — cláusulas editáveis pelo admin)
    └── logo_url → Supabase Storage
```

---

## 14. Notas de implementação para o Gemini

- **Biblioteca PDF:** instalar `@react-pdf/renderer` e `file-saver`. O PDF é gerado inteiramente no browser, sem chamada a backend ou Edge Function.
- **Fontes:** `@react-pdf/renderer` não usa fontes do sistema. Registrar explicitamente as fontes com `Font.register()` antes de renderizar o documento. Sugestão: usar **Roboto** (disponível via Google Fonts CDN) para corpo de texto e **Roboto Bold** para títulos e campos destacados.
- **Formatação de valores:** usar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` para formatar todos os valores monetários antes de passá-los para o componente PDF.
- **Formulário como fonte de verdade:** o PDF nunca lê dados diretamente do deal, do cliente ou do equipamento. Sempre lê de `crm_deal_contract_forms`. O pré-preenchimento do formulário acontece apenas na criação inicial, no frontend.
- **Snapshot imutável:** após a inserção em `crm_deal_contracts`, o campo `snapshot` nunca deve ser atualizado. Qualquer correção deve editar o formulário e gerar uma nova versão (novo registro com `version + 1`).
- **Aviso de PDF desatualizado:** comparar `crm_deal_contract_forms.updated_at` com `crm_deal_contracts.generated_at` do último contrato gerado. Se o formulário foi atualizado depois da última geração, exibir o aviso de Estado 4 no painel.
- **Storage bucket privado:** o bucket `crm-contracts` deve ser configurado como **privado** no Supabase. O acesso ao PDF assinado deve sempre ocorrer via `createSignedUrl` com expiração, nunca via URL pública.
- **Cancelamento seguro:** a lógica de cancelar contratos anteriores nunca deve cancelar um registro com `status = 'Assinado'`. Se existir um contrato assinado e o usuário tentar gerar um novo, exibir aviso de confirmação.
- **Validação antes de gerar:** o botão "Gerar PDF" só deve ser habilitado quando `form_status = 'Pronto para Gerar'`. Verificar esta condição também no backend antes de aceitar o insert em `crm_deal_contracts`.
