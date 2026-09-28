// Gerado por scripts/generate.mjs a partir dos JSON Schemas do ai-core.
// Não edite à mão: rode `pnpm build` (ou `node scripts/generate.mjs`).

/**
 * Modos de aprovação suportados (ver :class:`ai_core.policies.ApprovalPolicy`).
 * 
 * Vive em ``models`` para que os modelos (ex.: ``ApprovalRecord``) não dependam
 * da camada de políticas.
 */
export type ApprovalMode = "ALWAYS_REQUIRED" | "REQUIRED_FOR_EXTERNAL_ACTION" | "AUTO_APPROVED" | "MANUAL_ONLY";
/**
 * Define quando uma ação exige aprovação explícita.
 * 
 * O padrão do ecossistema é ``ALWAYS_REQUIRED``: por padrão nenhuma ação
 * externa ocorre sem aprovação humana.
 * 
 * - ``ALWAYS_REQUIRED``: toda ação exige aprovação.
 * - ``REQUIRED_FOR_EXTERNAL_ACTION``: só ações externas exigem aprovação.
 * - ``AUTO_APPROVED``: execução automática permitida.
 * - ``MANUAL_ONLY``: toda ação exige aprovação de uma pessoa identificada
 *   (``ApprovalRecord.approved_by``); fluxos automáticos nunca aprovam.
 */
export interface ApprovalPolicy {
  /**
   * @default "ALWAYS_REQUIRED"
   */
  mode?: ApprovalMode
}
/**
 * Registro factual da aprovação humana (ou automática) de uma proposta.
 * 
 * Em ``MANUAL_ONLY`` uma aprovação precisa identificar a pessoa (``approved_by``).
 */
export interface ApprovalRecord {
  approved: boolean
  /**
   * @default null
   */
  approved_by?: string | null
  decided_at?: string
  mode: ApprovalMode
}
/**
 * Entrada de ``approve_task``.
 */
export interface ApproveTaskRequest {
  /**
   * @default true
   */
  approved?: boolean
  /**
   * @default null
   */
  approved_by?: string | null
  /**
   * @default null
   */
  destination?: DestinationRef | null
  proposal_id: string
  workspace_id: string
}
/**
 * Saída de ``approve_task``.
 */
export interface ApproveTaskResponse {
  proposal: TaskProposal
}
/**
 * Registro auditável de uma operação relevante (incluindo ações externas).
 * 
 * Nunca deve conter secrets (tokens, senhas, credenciais).
 */
export interface AuditEvent {
  action: string
  /**
   * @default null
   */
  actor?: string | null
  /**
   * @default null
   */
  approval?: string | null
  /**
   * @default null
   */
  destination?: string | null
  evidence_ids?: Array<string>
  /**
   * @default null
   */
  execution?: string | null
  /**
   * @default null
   */
  external_id?: string | null
  id?: string
  metadata?: Record<string, unknown>
  /**
   * @default null
   */
  model?: string | null
  /**
   * @default null
   */
  proposal_id?: string | null
  /**
   * @default null
   */
  provider?: string | null
  retrieved_source_ids?: Array<string>
  timestamp?: string
  workspace_id: string
}
/**
 * Item de contexto recuperado, com justificativa descritiva da relevância.
 * 
 * Não expõe raciocínio interno privado do modelo.
 */
export interface ContextReference {
  /**
   * @default null
   */
  excerpt?: string | null
  /**
   * @default null
   */
  relevance?: string | null
  source: Source
}
/**
 * Referência neutra a um destino externo de tarefa.
 * 
 * Nem todos os campos se aplicam a todos os providers (ex.: GitHub não possui
 * ``issue_type``; ClickUp usa uma hierarquia diferente).
 */
export interface DestinationRef {
  /**
   * @default null
   */
  connection_id?: string | null
  /**
   * @default null
   */
  default_priority?: TaskPriority | null
  /**
   * @default true
   */
  enabled?: boolean
  /**
   * @default null
   */
  external_container_id?: string | null
  /**
   * @default null
   */
  external_project_id?: string | null
  /**
   * @default null
   */
  external_workspace_id?: string | null
  id?: string
  /**
   * @default null
   */
  issue_type?: string | null
  provider: string
}
/**
 * Vetor de embedding associado a um texto de origem.
 * 
 * Quando ``dimension`` é informada e o vetor não está vazio, ambos precisam
 * concordar; isso detecta cedo um provider mal configurado.
 */
export interface Embedding {
  /**
   * @default null
   */
  dimension?: number | null
  /**
   * @default null
   */
  model?: string | null
  text: string
  vector?: Array<number>
}
/**
 * Evidência multimodal associada a um workspace.
 * 
 * O ai-core fornece apenas o modelo comum; o processamento específico de cada
 * formato é responsabilidade das aplicações.
 */
export interface Evidence {
  /**
   * @default null
   */
  content?: string | null
  created_at?: string
  id?: string
  metadata?: Record<string, unknown>
  /**
   * @default null
   */
  mime_type?: string | null
  source_name: string
  source_type: EvidenceType
  workspace_id: string
}
/**
 * Tipos de evidência aceitos pelo ecossistema.
 */
export type EvidenceType = "TEXT" | "TRANSCRIPT" | "AUDIO" | "VIDEO" | "IMAGE" | "SCREENSHOT" | "LOG" | "ERROR" | "PDF" | "DOCUMENT" | "URL" | "CODE" | "DIFF";
/**
 * Resultado da execução de uma proposta em um destino externo.
 */
export interface ExecutionResult {
  /**
   * @default null
   */
  error?: string | null
  executed_at?: string
  /**
   * @default null
   */
  external_id?: string | null
  /**
   * @default null
   */
  external_url?: string | null
  /**
   * @default null
   */
  provider?: string | null
  success: boolean
}
/**
 * Entrada de ``generate_task`` (gera proposta, não cria tarefa externa).
 */
export interface GenerateTaskRequest {
  evidence_ids?: Array<string>
  /**
   * @default null
   */
  instructions?: string | null
  workspace_id: string
}
/**
 * Saída de ``generate_task``.
 */
export interface GenerateTaskResponse {
  proposal: TaskProposal
}
/**
 * Entrada de ``get_knowledge``.
 */
export interface GetKnowledgeRequest {
  document_id: string
  workspace_id: string
}
/**
 * Saída de ``get_knowledge``.
 */
export interface GetKnowledgeResponse {
  /**
   * @default null
   */
  document?: KnowledgeDocument | null
}
/**
 * Fragmento de um documento, unidade básica de indexação e busca.
 * 
 * O core não armazena obrigatoriamente o vetor; ``embedding_reference`` é a
 * abstração que liga o chunk ao armazenamento vetorial concreto.
 */
export interface KnowledgeChunk {
  content: string
  document_id: string
  /**
   * @default null
   */
  embedding_reference?: string | null
  id?: string
  metadata?: Record<string, unknown>
  /**
   * @default 0
   */
  position?: number
  workspace_id: string
}
/**
 * Documento de conhecimento pertencente a um workspace.
 */
export interface KnowledgeDocument {
  content: string
  created_at?: string
  id?: string
  metadata?: Record<string, unknown>
  /**
   * @default null
   */
  source_id?: string | null
  title: string
  workspace_id: string
}
/**
 * Entrada de ``list_task_proposals``.
 */
export interface ListTaskProposalsRequest {
  /**
   * @default 50
   */
  limit?: number
  /**
   * @default 0
   */
  offset?: number
  /**
   * @default null
   */
  status?: ProposalStatus | null
  workspace_id: string
}
/**
 * Saída de ``list_task_proposals``.
 */
export interface ListTaskProposalsResponse {
  proposals?: Array<TaskProposal>
  /**
   * @default null
   */
  total?: number | null
}
/**
 * Parâmetros de uma chamada de geração.
 */
export interface LLMRequest {
  context?: Array<string>
  /**
   * @default null
   */
  max_tokens?: number | null
  metadata?: Record<string, unknown>
  /**
   * @default null
   */
  model?: string | null
  /**
   * @default false
   */
  requires_vision?: boolean
  /**
   * @default null
   */
  system_prompt?: string | null
  /**
   * @default 0
   */
  temperature?: number
  user_prompt: string
}
/**
 * Resultado de uma chamada de geração.
 */
export interface LLMResponse {
  /**
   * @default null
   */
  duration_ms?: number | null
  metadata?: Record<string, unknown>
  /**
   * @default null
   */
  model?: string | null
  /**
   * @default null
   */
  provider?: string | null
  text: string
  usage?: LLMUsage
}
/**
 * Contagem de tokens reportada pelo provider, quando disponível.
 */
export interface LLMUsage {
  /**
   * @default null
   */
  completion_tokens?: number | null
  /**
   * @default null
   */
  prompt_tokens?: number | null
  /**
   * @default null
   */
  total_tokens?: number | null
}
/**
 * Modos de privacidade suportados.
 */
export type PrivacyMode = "LOCAL_ONLY" | "LOCAL_FIRST" | "ALLOW_CLOUD";
/**
 * Regras aplicáveis ao :class:`ai_core.llm.router.ModelRouter` e afins.
 * 
 * - ``LOCAL_ONLY``: nunca envia conteúdo para provider cloud.
 * - ``LOCAL_FIRST``: prefere local; cloud exige configuração/confirmação explícita.
 * - ``ALLOW_CLOUD``: cloud é permitido sem confirmação adicional.
 * 
 * As comparações usam ``==`` (e não ``is``) para que localizações recebidas como
 * string (ex.: vindas de configuração/JSON) sejam avaliadas corretamente.
 */
export interface PrivacyPolicy {
  /**
   * @default "LOCAL_FIRST"
   */
  mode?: PrivacyMode
}
/**
 * Estados do ciclo de vida de uma proposta de tarefa.
 */
export type ProposalStatus = "DRAFT" | "NEEDS_REVIEW" | "APPROVED" | "REJECTED" | "CREATED" | "FAILED";
/**
 * Conjunto de regras de roteamento e destino padrão de um workspace.
 * 
 * Hierarquia de resolução (da mais para a menos prioritária):
 * 
 * 1. destino escolhido manualmente na aprovação;
 * 2. regra mais específica que casar;
 * 3. destino padrão do workspace;
 * 4. nenhum destino (não executar ação externa).
 * 
 * Em empate de especificidade vence a regra declarada primeiro em ``rules``.
 */
export interface RoutingPolicy {
  /**
   * @default null
   */
  default_destination?: DestinationRef | null
  rules?: Array<RoutingRule>
}
/**
 * Regra do workspace que associa condições de uma tarefa a um destino.
 * 
 * Cada condição preenchida deve casar com a tarefa. Quanto mais condições,
 * mais específica a regra (e maior a prioridade na resolução).
 */
export interface RoutingRule {
  destination: DestinationRef
  labels?: Array<string>
  metadata?: Record<string, unknown>
  /**
   * @default null
   */
  name?: string | null
  /**
   * @default null
   */
  priority?: TaskPriority | null
  /**
   * @default null
   */
  source_kind?: SourceKind | null
  /**
   * @default null
   */
  task_type?: TaskType | null
}
/**
 * Entrada de ``search_knowledge``.
 */
export interface SearchKnowledgeRequest {
  filters?: Record<string, unknown>
  /**
   * @default 10
   */
  limit?: number
  query: string
  workspace_id: string
}
/**
 * Saída de ``search_knowledge``.
 */
export interface SearchKnowledgeResponse {
  results?: Array<SearchResult>
}
/**
 * Pedido de busca. Toda busca é obrigatoriamente escopada a um workspace.
 */
export interface SearchRequest {
  filters?: Record<string, unknown>
  /**
   * @default 10
   */
  limit?: number
  query: string
  workspace_id: string
}
/**
 * Resultado de busca com o chunk, a pontuação e a origem verificável.
 */
export interface SearchResult {
  chunk: KnowledgeChunk
  metadata?: Record<string, unknown>
  score: number
  /**
   * @default null
   */
  source?: Source | null
}
/**
 * Entrada de ``search_tasks``.
 */
export interface SearchTasksRequest {
  filters?: Record<string, unknown>
  /**
   * @default 10
   */
  limit?: number
  /**
   * @default 0
   */
  offset?: number
  /**
   * @default null
   */
  query?: string | null
  workspace_id: string
}
/**
 * Saída de ``search_tasks``.
 */
export interface SearchTasksResponse {
  tasks?: Array<Task>
  /**
   * @default null
   */
  total?: number | null
}
/**
 * Referência navegável para a origem de um trecho de conhecimento ou tarefa.
 */
export interface Source {
  /**
   * @default null
   */
  evidence_id?: string | null
  id?: string
  /**
   * @default null
   */
  location?: string | null
  metadata?: Record<string, unknown>
  /**
   * @default null
   */
  title?: string | null
  type: SourceKind
}
/**
 * Natureza da origem de uma informação.
 */
export type SourceKind = "FILE" | "TRANSCRIPT" | "TIMESTAMP" | "LOG_LINE" | "URL" | "ISSUE" | "COMMIT" | "SCREENSHOT" | "OTHER";
/**
 * Tarefa neutra. Não contém campos específicos de Jira/GitHub/ClickUp/Linear.
 */
export interface Task {
  acceptance_criteria?: Array<string>
  created_at?: string
  /**
   * @default null
   */
  description?: string | null
  id?: string
  labels?: Array<string>
  metadata?: Record<string, unknown>
  /**
   * @default "MEDIUM"
   */
  priority?: TaskPriority
  related_entities?: Array<string>
  sources?: Array<Source>
  title: string
  type: TaskType
  workspace_id: string
}
/**
 * Resumo factual e auditável de como uma tarefa foi proposta.
 * 
 * Propositalmente não armazena chain-of-thought privado do modelo: apenas
 * evidências, contexto, justificativas resumidas e o resultado observável.
 */
export interface TaskExplanation {
  /**
   * @default null
   */
  analysis_summary?: string | null
  /**
   * @default null
   */
  approval?: ApprovalRecord | null
  created_at?: string
  decisions?: Array<string>
  /**
   * @default null
   */
  destination?: DestinationRef | null
  /**
   * @default null
   */
  execution_result?: ExecutionResult | null
  field_justifications?: Record<string, unknown>
  /**
   * @default null
   */
  reasoning_summary?: string | null
  rejected_alternatives?: Array<string>
  retrieved_context?: Array<ContextReference>
  /**
   * @default null
   */
  routing_decision?: string | null
  sources?: Array<Source>
}
/**
 * Prioridades neutras utilizadas pelo ecossistema.
 */
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
/**
 * Tarefa proposta, ainda não executada, com fontes e explicação auditáveis.
 * 
 * ``status`` não pode ser atribuído diretamente: use :meth:`transition_to`, que
 * valida o grafo :data:`ALLOWED_TRANSITIONS` e atualiza ``updated_at``.
 */
export interface TaskProposal {
  created_at?: string
  /**
   * @default null
   */
  destination_reference?: DestinationRef | null
  /**
   * @default null
   */
  explanation?: TaskExplanation | null
  id?: string
  metadata?: Record<string, unknown>
  sources?: Array<Source>
  /**
   * @default "DRAFT"
   */
  status?: ProposalStatus
  /**
   * @default null
   */
  task?: Task | null
  updated_at?: string
  workspace_id: string
}
/**
 * Categorias neutras de trabalho reconhecidas pelo Task Engine.
 */
export type TaskType = "BUG" | "TASK" | "FEATURE" | "IMPROVEMENT" | "TECH_DEBT" | "QUESTION" | "INVESTIGATION" | "DOCUMENTATION";
/**
 * Contexto lógico que isola conhecimento, evidências, tarefas e políticas.
 * 
 * Um workspace não representa diretamente um projeto Jira ou um repositório
 * GitHub; esses são apenas destinos externos que podem ser associados a ele.
 */
export interface Workspace {
  created_at?: string
  /**
   * @default null
   */
  description?: string | null
  id?: string
  metadata?: Record<string, unknown>
  name: string
  slug: string
  /**
   * @default "ACTIVE"
   */
  status?: WorkspaceStatus
  updated_at?: string
}
/**
 * Estado de ciclo de vida de um workspace.
 */
export type WorkspaceStatus = "ACTIVE" | "ARCHIVED" | "DISABLED";
