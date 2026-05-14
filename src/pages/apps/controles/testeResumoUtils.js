export const TEST_STATUS_META = {
  1: { label: "Nao Iniciado", color: "#9ca3af" },
  2: { label: "Em Teste", color: "#2563eb" },
  3: { label: "Em Teste", color: "#2563eb" },
  4: { label: "Concluido", color: "#16a34a" },
  5: { label: "Concluido", color: "#16a34a" },
};

export const TEST_CONCLUSION_META = {
  1: { label: "Efetivo", color: "#16a34a" },
  2: { label: "Inefetivo", color: "#dc2626" },
};

export const getTestDate = (test) => test?.baseDate || test?.date || null;

export const getCompletionDate = (test) =>
  test?.completionDate || test?.completitionDate || null;

export const getSummaryDate = (test) =>
  getCompletionDate(test) || getTestDate(test);

export const getCompletionDescription = (test) => {
  const value = test?.descriptionTestCompletion;
  return typeof value === "string" && value.trim() ? value.trim() : "-";
};

const normalizeNumericValue = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const getTestStatusValue = (test) =>
  normalizeNumericValue(test?.testStatus);

export const isCompletedTest = (test) => Boolean(getCompletionDate(test));

export const getTestConclusionValue = (test) =>
  isCompletedTest(test)
    ? normalizeNumericValue(test?.testConclusion ?? test?.testConclusionRecent)
    : null;

export const getTestConclusionMeta = (test) =>
  TEST_CONCLUSION_META[getTestConclusionValue(test)] || null;

export const getTestConclusionLabel = (test) =>
  getTestConclusionMeta(test)?.label || "-";

const getDisplayTestStatusValue = (test) => {
  const status = getTestStatusValue(test);

  if (status === 3) return 2;
  if ((status === 4 || status === 5) && !isCompletedTest(test)) return 2;
  if (status === 5) return 4;

  return status;
};

export const getTestStatusMeta = (test) => {
  const statusMeta = TEST_STATUS_META[getDisplayTestStatusValue(test)];

  if (statusMeta) {
    if (test?.active === false) {
      return {
        label: `${statusMeta.label} (Inativo)`,
        color: "#dc2626",
      };
    }

    return statusMeta;
  }

  return test?.active === false
    ? { label: "Inativo", color: "#dc2626" }
    : { label: "Ativo", color: "#16a34a" };
};

export const getTestStatusLabel = (test) => getTestStatusMeta(test).label;

const parseTestDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === "string") {
    const ymdMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);

    if (ymdMatch) {
      const [, year, month, day] = ymdMatch;
      const parsed = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDateTimestamp = (value) => {
  if (!value) return 0;

  const timestamp = parseTestDate(value)?.getTime() || 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const formatTestDate = (value) => {
  if (!value) return "-";

  const date = parseTestDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
};

export const buildLatestCompletedTestSummary = (tests = []) => {
  const latestCompletedTest = [...tests]
    .filter(
      (test) =>
        test?.active !== false &&
        isCompletedTest(test) &&
        (Boolean(getSummaryDate(test)) ||
          getTestConclusionValue(test) !== null),
    )
    .sort((testA, testB) => {
      const completionDateDiff =
        getDateTimestamp(getSummaryDate(testB)) -
        getDateTimestamp(getSummaryDate(testA));

      if (completionDateDiff !== 0) return completionDateDiff;

      return (
        getDateTimestamp(getTestDate(testB)) -
        getDateTimestamp(getTestDate(testA))
      );
    })[0];

  if (!latestCompletedTest) return null;

  return {
    conclusionLabel: getTestConclusionLabel(latestCompletedTest),
    conclusionColor: getTestConclusionMeta(latestCompletedTest)?.color,
    completionDateLabel: formatTestDate(getSummaryDate(latestCompletedTest)),
    completionDescription:
      getCompletionDescription(latestCompletedTest) !== "-"
        ? getCompletionDescription(latestCompletedTest)
        : null,
  };
};
