import {
  filterResponsibleOptions,
  getResponsibleOptionDetail,
  getResponsibleOptionKey,
  getResponsibleOptionLabel,
  mapResponsibleOption,
  mapResponsibleOptions,
} from "./responsibleAutocomplete";

describe("responsibleAutocomplete", () => {
  it("normalizes id and label from collaborator payloads", () => {
    const option = mapResponsibleOption({
      idCollaborator: "abc-123",
      name: "Joao Silva",
    });

    expect(option).toMatchObject({
      id: "abc-123",
      nome: "Joao Silva",
      label: "Joao Silva",
    });
    expect(getResponsibleOptionLabel(option)).toBe("Joao Silva");
    expect(getResponsibleOptionKey(option)).toBe("abc-123");
  });

  it("filters by name ignoring accents and term order", () => {
    const options = [
      { id: "1", nome: "José da Silva" },
      { id: "2", nome: "Maria Souza" },
    ];

    const filtered = filterResponsibleOptions(options, {
      inputValue: "silva jose",
    });

    expect(filtered).toEqual([options[0]]);
  });

  it("prioritizes name matches before falling back to email or code", () => {
    const options = [
      {
        id: "1",
        nome: "Eduardo I",
        email: "eduardo.marinho@e-xyon.com.br",
      },
      {
        id: "2",
        nome: "Eduardo Marinho",
        email: "edufmarinho995@gmail.com",
      },
    ];

    const filtered = filterResponsibleOptions(options, {
      inputValue: "Eduardo Marinho",
    });

    expect(filtered).toEqual([options[1]]);
  });

  it("filters by email when the user searches for login data", () => {
    const options = [
      { id: "1", nome: "Carlos Lima", email: "carlos.lima@empresa.com" },
      { id: "2", nome: "Ana Rocha", email: "ana.rocha@empresa.com" },
    ];

    const filtered = filterResponsibleOptions(options, {
      inputValue: "ana.rocha",
    });

    expect(filtered).toEqual([options[1]]);
  });

  it("adds details to duplicated names so users can distinguish records", () => {
    const options = mapResponsibleOptions([
      {
        idCollaborator: "5c670556-2e6d-4f6d-953c-0a73a0497256",
        code: "USER002",
        name: "Amanda Hazan",
        email: "amandahazan@gmail.com",
      },
      {
        idCollaborator: "0d26993b-f2c3-4271-82c8-aa4e43ceef61",
        code: "USER001",
        name: "Amanda Hazan",
        email: "amandahazan@gmail.com",
      },
    ]);

    expect(getResponsibleOptionDetail(options[0])).toContain("ID 5c670556");
    expect(getResponsibleOptionDetail(options[1])).toContain("ID 0d26993b");
  });
});
