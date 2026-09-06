const {
  getBenchmarkMaxDays,
  evaluatePocoAnalysis,
} = require("../services/decisions.services");


describe("getBenchmarkMaxDays", () => {

  test('retourne 10 pour une fenêtre Perenual "7-10"', () => {
    expect(
      getBenchmarkMaxDays('"7-10"')
    ).toBe(10);
  });


  test("retourne 7 si la valeur est absente", () => {
    expect(
      getBenchmarkMaxDays(null)
    ).toBe(7);
  });


  test("retourne 7 si la valeur ne contient aucun nombre", () => {
    expect(
      getBenchmarkMaxDays("inconnue")
    ).toBe(7);
  });

});


describe("evaluatePocoAnalysis", () => {

  test("cas nominal : humidité et lumière correctes, eau disponible", () => {
    const result =
      evaluatePocoAnalysis(
        50,
        150,
        true
      );

    expect(result).toEqual({
      soil_status: "correct",
      light_status: "correct",
      water_status: "available",
      watering_needed: false,
      automatic_watering_allowed: false,
      light_needed: false,
    });
  });


  test("valeur limite humidité : 35 % reste correcte", () => {
    const result =
      evaluatePocoAnalysis(
        35,
        150,
        true
      );

    expect(
      result.soil_status
    ).toBe("correct");

    expect(
      result.watering_needed
    ).toBe(false);
  });


  test("juste sous le seuil humidité : 34.99 % devient insuffisante", () => {
    const result =
      evaluatePocoAnalysis(
        34.99,
        150,
        true
      );

    expect(
      result.soil_status
    ).toBe("insufficient");

    expect(
      result.watering_needed
    ).toBe(true);

    expect(
      result.automatic_watering_allowed
    ).toBe(true);
  });


  test("sécurité : arrosage nécessaire mais réservoir indisponible", () => {
    const result =
      evaluatePocoAnalysis(
        20,
        150,
        false
      );

    expect(
      result.soil_status
    ).toBe("insufficient");

    expect(
      result.water_status
    ).toBe("insufficient");

    expect(
      result.watering_needed
    ).toBe(true);

    expect(
      result.automatic_watering_allowed
    ).toBe(false);
  });


  test("luminosité insuffisante sous 100 lux", () => {
    const result =
      evaluatePocoAnalysis(
        50,
        99.99,
        true
      );

    expect(
      result.light_status
    ).toBe("insufficient");

    expect(
      result.light_needed
    ).toBe(true);
  });


  test("valeur limite luminosité : 100 lux reste correcte", () => {
    const result =
      evaluatePocoAnalysis(
        50,
        100,
        true
      );

    expect(
      result.light_status
    ).toBe("correct");

    expect(
      result.light_needed
    ).toBe(false);
  });

});