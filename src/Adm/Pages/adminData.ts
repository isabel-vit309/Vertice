export type AuditRecord = {
  id: number;
  action: string;
  target: string;
  actor: string;
  date: string;
};

const AUDIT_STORAGE_KEY = "adm-audit-records";

const initialAudit: AuditRecord[] = [
  { id: 1, action: "Cadastro aprovado", target: "PrinceHub", actor: "admin@vertice.com", date: "Hoje, 08:02" },
  { id: 2, action: "Conteúdo revisado", target: "Pitch deck NeonCard", actor: "admin@vertice.com", date: "Ontem, 17:45" },
  { id: 3, action: "Usuário suspenso", target: "conta temporária", actor: "admin@vertice.com", date: "Ontem, 15:20" },
];

export function getAuditRecords() {
  try {
    const stored = sessionStorage.getItem(AUDIT_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AuditRecord[]) : initialAudit;
  } catch {
    return initialAudit;
  }
}

export function addAuditRecord(record: AuditRecord) {
  sessionStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([record, ...getAuditRecords()]));
}
