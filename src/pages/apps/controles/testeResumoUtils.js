export const TEST_STATUS_META = {
  1: { label: "Não Iniciado", color: "#9ca3af" },
  2: { label: "Em Teste", color: "#2563eb" },
  3: { label: "Em Revisão", color: "#f59e0b" },
  4: { label: "Concluído", color: "#16a34a" },
  5: { label: "Revisado", color: "#7c3aed" },
};

const COMPLETED_TEST_STATUS = 4;

export const TEST_CONCLUSION_META = {
  1: { label: "Efetivo", color: "#16a34a" },
  2: { label: "Inefetivo", color: "#dc2626" },
};

export const getTestDate = (test) => test?.baseDate || test?.date || null;

export const getCompletionDate = (test) =>
  test?.completionDate || test?.completitionDate || null;

export const getSummaryDate = (test) => getCompletionDate(test) || getTestDate(test);

export const getCompletionDescription = (test) => {
  const value = test?.descriptionTestCompletion;
  return typeof value === "string" && value.trim() ? value.trim() : "-";
};

const normalizeNumericValue = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const getTestConclusionValue = (test) =>
  normalizeNumericValue(test?.testConclusionRecent ?? test?.testConclusion);

export const getTestConclusionMeta = (test) =>
  TEST_CONCLUSION_META[getTestConclusionValue(test)] || null;

export const getTestConclusionLabel = (test) =>
  getTestConclusionMeta(test)?.label || "-";

export const getTestStatusValue = (test) =>
  normalizeNumericValue(test?.testStatus);

export const getTestStatusMeta = (test) => {
  const statusMeta = TEST_STATUS_META[getTestStatusValue(test)];

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

const getDateTimestamp = (value) => {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const formatTestDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
};

export const buildLatestCompletedTestSummary = (tests = []) => {
  const latestCompletedTest = [...tests]
    .filter(
      (test) =>
        test?.active !== false &&
        getTestStatusValue(test) === COMPLETED_TEST_STATUS &&
        (Boolean(getSummaryDate(test)) ||
          getTestConclusionValue(test) !== null),
    )
    .sort((testA, testB) => {
      const completionDateDiff =
        getDateTimestamp(getSummaryDate(testB)) -
        getDateTimestamp(getSummaryDate(testA));

      if (completionDateDiff !== 0) return completionDateDiff;

      return getDateTimestamp(getTestDate(testB)) -
        getDateTimestamp(getTestDate(testA));
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
