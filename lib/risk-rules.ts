import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";
import type { AuthUser } from "@/lib/api";
import {
  AUDIT_ACTION,
  RISK_ALERT_STATUS_ENUM,
  INTERVENTION_STATUS_ENUM
} from "@/constants/enums";

type Comparator = "<" | "<=" | ">" | ">=" | "=";

type RiskCondition = {
  metric: "average" | "attendance" | "occurrences";
  comparator: Comparator;
  threshold: number;
  windowDays?: number;
  period?: string;
  severity?: number;
  summary?: string;
};

type RiskRuleDefinition = {
  matchMode?: "ANY" | "ALL";
  conditions: RiskCondition[];
};

type RunParams = {
  prisma: PrismaClient;
  schoolId: string;
  actor: AuthUser;
};

export async function runRiskRules({ prisma, schoolId, actor }: RunParams) {
  const rules = await prisma.riskRuleConfig.findMany({
    where: { schoolId, isActive: true }
  });

  if (!rules.length) {
    return { rulesEvaluated: 0, processedStudents: 0, alertsCreated: 0, alertsResolved: 0 };
  }

  const students = await prisma.student.findMany({
    where: { schoolId, status: "ACTIVE" },
    include: {
      metrics: { orderBy: { lastComputedAt: "desc" } }
    }
  });

  const maxWindow = Math.max(
    30,
    ...rules.flatMap((rule) => {
      const definition = parseDefinition(rule.definition);
      return definition.conditions.map((condition) => condition.windowDays ?? 30);
    })
  );

  const occurrencesWindow = subDays(new Date(), maxWindow);
  const occurrences = await prisma.occurrence.findMany({
    where: {
      schoolId,
      happenedAt: { gte: occurrencesWindow }
    },
    select: {
      studentId: true,
      severity: true,
      happenedAt: true
    }
  });

  const occurrencesMap = new Map<string, typeof occurrences>();
  for (const occurrence of occurrences) {
    const list = occurrencesMap.get(occurrence.studentId) ?? [];
    list.push(occurrence);
    occurrencesMap.set(occurrence.studentId, list);
  }

  let alertsCreated = 0;
  let alertsResolved = 0;

  for (const rule of rules) {
    const definition = parseDefinition(rule.definition);
    const matchMode = definition.matchMode ?? "ANY";

    for (const student of students) {
      const metrics = student.metrics[0];
      const conditionResults = definition.conditions.map((condition) =>
        evaluateCondition(condition, metrics, occurrencesMap.get(student.id))
      );

      const matched =
        matchMode === "ALL" ? conditionResults.every(Boolean) : conditionResults.some(Boolean);

      if (!matched) {
        const openAlert = await prisma.riskAlert.findFirst({
          where: {
            schoolId,
            studentId: student.id,
            ruleId: rule.id,
            status: RISK_ALERT_STATUS_ENUM.OPEN
          }
        });

        if (openAlert) {
          await prisma.riskAlert.update({
            where: { id: openAlert.id },
            data: {
              status: RISK_ALERT_STATUS_ENUM.RESOLVED,
              resolvedAt: new Date()
            }
          });
          alertsResolved += 1;
        }

        continue;
      }

      const summary =
        definition.conditions
          .map((condition) => condition.summary)
          .filter(Boolean)
          .join("; ") || `Alerta gerado por ${rule.name}`;

      const severity =
        definition.conditions.reduce((max, condition) => Math.max(max, condition.severity ?? 3), 3);

      const existingAlert = await prisma.riskAlert.findFirst({
        where: {
          schoolId,
          studentId: student.id,
          ruleId: rule.id,
          status: RISK_ALERT_STATUS_ENUM.OPEN
        }
      });

      if (existingAlert) {
        await prisma.riskAlert.update({
          where: { id: existingAlert.id },
          data: {
            severity,
            updatedAt: new Date()
          }
        });
        continue;
      }

      const intervention = await prisma.intervention.create({
        data: {
          schoolId,
          studentId: student.id,
          classId: student.classId,
          createdById: actor.id,
          status: INTERVENTION_STATUS_ENUM.OPEN,
          title: `Alerta pedagogico - ${student.name}`,
          summary,
          plan: "Definir plano de acao inicial (TODO Fase2: automatizar recomendacoes)."
        }
      });

      await prisma.riskAlert.create({
        data: {
          schoolId,
          studentId: student.id,
          ruleId: rule.id,
          status: RISK_ALERT_STATUS_ENUM.OPEN,
          severity,
          summary,
          details: JSON.stringify(definition),
          interventionId: intervention.id
        }
      });

      await prisma.auditLog.create({
        data: {
          schoolId,
          action: AUDIT_ACTION.RUN_RISK_RULES,
          actorId: actor.id,
          target: student.id,
          summary: `Risk rule "${rule.name}" gerou intervencao`,
          payload: JSON.stringify({
            ruleId: rule.id,
            interventionId: intervention.id,
            severity
          })
        }
      });

      alertsCreated += 1;
    }
  }

  return {
    rulesEvaluated: rules.length,
    processedStudents: students.length,
    alertsCreated,
    alertsResolved
  };
}

function evaluateCondition(
  condition: RiskCondition,
  metrics: { average?: number | null; attendance?: number | null } | undefined,
  occurrences: { severity: number; happenedAt: Date }[] | undefined
) {
  switch (condition.metric) {
    case "average": {
      if (metrics?.average === undefined || metrics.average === null) return false;
      return compare(metrics.average, condition.comparator, condition.threshold);
    }
    case "attendance": {
      if (metrics?.attendance === undefined || metrics.attendance === null) return false;
      return compare(metrics.attendance, condition.comparator, condition.threshold);
    }
    case "occurrences": {
      const windowDays = condition.windowDays ?? 30;
      const from = subDays(new Date(), windowDays);
      const severeCount =
        occurrences?.filter(
          (occurrence) => occurrence.happenedAt >= from && occurrence.severity >= 4
        ).length ?? 0;
      return compare(severeCount, condition.comparator, condition.threshold);
    }
    default:
      return false;
  }
}

function compare(value: number, comparator: Comparator, threshold: number) {
  switch (comparator) {
    case "<":
      return value < threshold;
    case "<=":
      return value <= threshold;
    case ">":
      return value > threshold;
    case ">=":
      return value >= threshold;
    case "=":
      return value === threshold;
    default:
      return false;
  }
}

function parseDefinition(input: unknown): RiskRuleDefinition {
  if (!input) {
    return { matchMode: "ANY", conditions: [] };
  }
  try {
    const parsed =
      typeof input === "string" ? (JSON.parse(input) as RiskRuleDefinition) : (input as RiskRuleDefinition);
    return {
      matchMode: parsed.matchMode ?? "ANY",
      conditions: Array.isArray(parsed.conditions) ? parsed.conditions : []
    };
  } catch {
    return { matchMode: "ANY", conditions: [] };
  }
}
