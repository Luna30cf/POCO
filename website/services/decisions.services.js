    // Seuils opérationnels POCO
    // Ce ne sont PAS des valeurs fournies directement par Perenual.
    const POCO_SOIL_MIN_PERCENT = 35;
    const POCO_LIGHT_MIN_LUX = 100;


    // Extrait la durée maximale depuis une valeur Perenual
    // Exemple : '"7-10"' → 10
    function getBenchmarkMaxDays(value) {
    if (!value) {
        return 7;
    }

    const numbers = String(value).match(/\d+/g);

    if (!numbers || numbers.length === 0) {
        return 7;
    }

    return Math.max(...numbers.map(Number));
    }


    async function getPlantDecision(
    supabase,
    potId
    ) {

    // 1. Récupérer la plante et ses données Perenual
    const { data: plant, error: plantError } =
        await supabase
        .from("plants")
        .select(`
            id,
            pot_id,
            nickname,
            species:species_id (
            common_name,
            scientific_name,
            watering,
            watering_benchmark_value,
            watering_benchmark_unit,
            sunlight
            )
        `)
        .eq("pot_id", potId)
        .single();


    if (plantError || !plant) {
        throw new Error(
        "Plante introuvable ou accès non autorisé"
        );
    }


    // 2. Déterminer la fenêtre temporelle
    // Exemple Perenual : 7-10 days → on observe au maximum 10 jours
    const benchmarkDays =
        getBenchmarkMaxDays(
        plant.species.watering_benchmark_value
        );


    const since = new Date();

    since.setDate(
        since.getDate() - benchmarkDays
    );


    // 3. Récupérer les mesures récentes
    const {
        data: measurements,
        error: measurementError,
    } = await supabase
        .from("measurements")
        .select(`
        soil_moisture,
        light_lux,
        water_level,
        measured_at
        `)
        .eq("pot_id", potId)
        .gte(
        "measured_at",
        since.toISOString()
        )
        .order(
        "measured_at",
        { ascending: true }
        );


    if (measurementError) {
        throw new Error(
        "Impossible d'analyser les mesures"
        );
    }


    if (
        !measurements ||
        measurements.length === 0
    ) {
        return {
        status: "unknown",
        message:
            "Pas assez de mesures pour évaluer la plante",
        };
    }


    // 4. Calcul humidité moyenne
    const soilValues = measurements
        .map(
        measurement =>
            Number(measurement.soil_moisture)
        )
        .filter(
        value =>
            Number.isFinite(value)
        );


    const averageSoil =
        soilValues.length > 0
        ? soilValues.reduce(
            (sum, value) =>
                sum + value,
            0
            ) / soilValues.length
        : null;


    // 5. Calcul luminosité moyenne
    const lightValues = measurements
        .map(
        measurement =>
            Number(measurement.light_lux)
        )
        .filter(
        value =>
            Number.isFinite(value)
        );


    const averageLight =
        lightValues.length > 0
        ? lightValues.reduce(
            (sum, value) =>
                sum + value,
            0
            ) / lightValues.length
        : null;


    // 6. Dernier niveau d'eau connu
    // Dernier état connu du réservoir.
    // On ne l'obtient pas depuis l'historique utilisé
    // pour calculer les moyennes.
    const {
        data: latestWaterMeasurement,
        error: waterError,
        } = await supabase
        .from("measurements")
        .select("water_level, measured_at")
        .eq("pot_id", potId)
        .not("water_level", "is", null)
        .order("measured_at", {
            ascending: false,
        })
        .limit(1)
        .maybeSingle();

        if (waterError) {
        throw new Error(
            "Impossible de récupérer le niveau d'eau"
        );
        }

    const waterAvailable = latestWaterMeasurement?.water_level === true;


    // 7. États métier POCO
    const soilStatus =
        averageSoil !== null &&
        averageSoil < POCO_SOIL_MIN_PERCENT
        ? "insufficient"
        : "correct";


    const lightStatus =
        averageLight !== null &&
        averageLight < POCO_LIGHT_MIN_LUX
        ? "insufficient"
        : "correct";


    const waterStatus =
        waterAvailable
        ? "available"
        : "insufficient";


    // 8. Décisions
    const wateringNeeded =
        soilStatus === "insufficient";

    const automaticWateringAllowed =
        wateringNeeded &&
        waterAvailable;

    const lightNeeded =
        lightStatus === "insufficient";


    return {
        plant: {
            nickname: plant.nickname,
            common_name:
                plant.species.common_name,
            scientific_name:
                plant.species.scientific_name,
            },

        perenual: {
            watering:
                plant.species.watering,
            benchmark:
                plant.species.watering_benchmark_value,
            benchmark_unit:
                plant.species.watering_benchmark_unit,
            sunlight:
                plant.species.sunlight,
            },

        poco_analysis: {
            analysis_window_days: benchmarkDays,
            measurement_count: measurements.length,

            average_soil_moisture:
                averageSoil !== null
                ? Number(
                    averageSoil.toFixed(2)
                    )
                : null,

            average_light_lux:
                averageLight !== null
                ? Number(
                    averageLight.toFixed(2)
                    )
                : null,

            soil_status:
                soilStatus,

            light_status:
                lightStatus,

            water_status:
                waterStatus,

            watering_needed:
                wateringNeeded,

            automatic_watering_allowed:
                automaticWateringAllowed,

            light_needed:
                lightNeeded,
            },
    };
    }


    module.exports = {
    getPlantDecision,
    };