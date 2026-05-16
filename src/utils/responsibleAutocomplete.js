const RESPONSIBLE_ID_KEYS = [
  "id",
  "idCollaborator",
  "idResponsible",
  "id_responsible",
  "responsibleId",
  "value",
];

const RESPONSIBLE_LABEL_KEYS = [
  "nome",
  "name",
  "fullName",
  "displayName",
  "label",
  "email",
];

const RESPONSIBLE_SEARCH_KEYS = [
  ...RESPONSIBLE_LABEL_KEYS,
  "code",
  "role",
  "occupation",
];

const normalizeSearchText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const pickFirstValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
};

const pickFirstText = (source, keys) => {
  const value = pickFirstValue(source, keys);
  return value === null ? "" : String(value).trim();
};

export const getResponsibleOptionId = (option) =>
  pickFirstValue(option, RESPONSIBLE_ID_KEYS);

export const getResponsibleOptionKey = (option) => {
  if (option?.id === "all") return "all";

  const id = getResponsibleOptionId(option);
  if (id) return String(id);

  return [
    getResponsibleOptionLabel(option),
    option?.email,
    option?.code,
    option?.role,
  ]
    .filter(Boolean)
    .join("|");
};

export const getResponsibleOptionLabel = (option) => {
  if (!option) return "";
  if (typeof option === "string") return option;

  return pickFirstText(option, RESPONSIBLE_LABEL_KEYS);
};

export const getResponsibleOptionDetail = (option) => {
  if (!option || option?.id === "all") return "";

  return (
    option.responsibleOptionDetail ||
    [option.email, option.code, option.role, option.active === false ? "Inativo" : ""]
      .filter(Boolean)
      .join(" | ")
  );
};

export const mapResponsibleOption = (option) => {
  const id = getResponsibleOptionId(option);
  const nome = getResponsibleOptionLabel(option);

  return {
    ...option,
    id,
    nome,
    label: option?.label || nome,
  };
};

export const mapResponsibleOptions = (options = []) => {
  const mappedOptions = (Array.isArray(options) ? options : []).map(
    mapResponsibleOption,
  );
  const labelCounts = mappedOptions.reduce((counts, option) => {
    const label = normalizeSearchText(getResponsibleOptionLabel(option));
    if (!label) return counts;

    counts.set(label, (counts.get(label) || 0) + 1);
    return counts;
  }, new Map());

  return mappedOptions.map((option) => {
    const normalizedLabel = normalizeSearchText(getResponsibleOptionLabel(option));
    const isDuplicateLabel = labelCounts.get(normalizedLabel) > 1;
    const detailParts = [
      option.email,
      option.code,
      option.role,
      option.active === false ? "Inativo" : "",
      isDuplicateLabel && option.id ? `ID ${String(option.id).slice(0, 8)}` : "",
    ].filter(Boolean);

    return {
      ...option,
      responsibleOptionDetail: detailParts.join(" | "),
    };
  });
};

const hasEveryTerm = (value, searchTerms) => {
  const normalizedValue = normalizeSearchText(value);
  return searchTerms.every((term) => normalizedValue.includes(term));
};

const getResponsibleSearchText = (option) => {
  if (typeof option === "string") return option;

  return RESPONSIBLE_SEARCH_KEYS.map((key) => option?.[key])
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map(String)
    .join(" ");
};

export const filterResponsibleOptions = (options, { inputValue }) => {
  const searchTerms = normalizeSearchText(inputValue)
    .split(/\s+/)
    .filter(Boolean);

  if (searchTerms.length === 0) return options;

  const labelMatchedOptions = options.filter(
    (option) =>
      option?.id !== "all" &&
      hasEveryTerm(getResponsibleOptionLabel(option), searchTerms),
  );

  if (labelMatchedOptions.length > 0) {
    return options.filter(
      (option) =>
        option?.id === "all" ||
        hasEveryTerm(getResponsibleOptionLabel(option), searchTerms),
    );
  }

  return options.filter(
    (option) =>
      option?.id === "all" ||
      hasEveryTerm(getResponsibleSearchText(option), searchTerms),
  );
};
