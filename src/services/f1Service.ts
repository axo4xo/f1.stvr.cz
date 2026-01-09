import { useState, useEffect } from "react";

// Types for F1 data
export interface Race {
    season: string;
    round: string;
    url: string;
    raceName: string;
    Circuit: {
        circuitId: string;
        url: string;
        circuitName: string;
        Location: {
            lat: string;
            long: string;
            locality: string;
            country: string;
        };
    };
    date: string;
    time: string;
    FirstPractice?: { date: string; time: string };
    SecondPractice?: { date: string; time: string };
    ThirdPractice?: { date: string; time: string };
    Qualifying?: { date: string; time: string };
    Sprint?: { date: string; time: string };
    SprintQualifying?: { date: string; time: string };
}

export interface RaceSchedule {
    season: string;
    races: Race[];
}

export interface Driver {
    driverId: string;
    permanentNumber: string;
    code: string;
    url: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
}

export interface Constructor {
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
}

export interface DriverStanding {
    position: string;
    positionText: string;
    points: string;
    wins: string;
    Driver: Driver;
    Constructors: Constructor[];
}

export interface ConstructorStanding {
    position: string;
    positionText: string;
    points: string;
    wins: string;
    Constructor: Constructor;
}

export interface DriverStandingsResponse {
    season: string;
    round: string;
    DriverStandings: DriverStanding[];
}

export interface ConstructorStandingsResponse {
    season: string;
    round: string;
    ConstructorStandings: ConstructorStanding[];
}

export interface SessionResult {
    position: string;
    Driver: {
        code: string;
        givenName: string;
        familyName: string;
    };
    Constructor: {
        name: string;
    };
    Time: {
        time: string;
    };
    laps: string;
    gap: string;
    interval: string;
}

// Base URL for Jolpica API (Ergast successor)
const JOLPICA_BASE_URL = "https://api.jolpi.ca/ergast/f1";
const CURRENT_YEAR = "2026";

// Fetch the current season's race schedule
export const useRaceSchedule = () => {
    const [schedule, setSchedule] = useState<Race[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                setLoading(true);

                // Fetch race schedule from Jolpica API
                const response = await fetch(
                    `${JOLPICA_BASE_URL}/${CURRENT_YEAR}.json`
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch race schedule: ${response.status}`
                    );
                }

                const data = await response.json();

                if (
                    !data ||
                    !data.MRData ||
                    !data.MRData.RaceTable ||
                    !data.MRData.RaceTable.Races ||
                    data.MRData.RaceTable.Races.length === 0
                ) {
                    throw new Error(
                        "No race data available for the selected season"
                    );
                }

                setSchedule(data.MRData.RaceTable.Races);
                setLoading(false);
                setError(null);
            } catch (err: unknown) {
                console.error("Error fetching schedule:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch race schedule"
                );
                setSchedule([]);
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    return { schedule, loading, error };
};

// Fetch driver standings
export const useDriverStandings = () => {
    const [standings, setStandings] = useState<DriverStanding[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDriverStandings = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `${JOLPICA_BASE_URL}/${CURRENT_YEAR}/driverstandings.json`
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch driver standings: ${response.status}`
                    );
                }

                const data = await response.json();

                if (
                    !data ||
                    !data.MRData ||
                    !data.MRData.StandingsTable ||
                    !data.MRData.StandingsTable.StandingsLists ||
                    data.MRData.StandingsTable.StandingsLists.length === 0
                ) {
                    throw new Error("No driver standings available");
                }

                const driverStandings =
                    data.MRData.StandingsTable.StandingsLists[0]
                        .DriverStandings;
                setStandings(driverStandings);
                setLoading(false);
                setError(null);
            } catch (err: unknown) {
                console.error("Error fetching driver standings:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch driver standings"
                );
                setStandings([]);
                setLoading(false);
            }
        };

        fetchDriverStandings();
    }, []);

    return { standings, loading, error };
};

// Fetch constructor standings
export const useConstructorStandings = () => {
    const [standings, setStandings] = useState<ConstructorStanding[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConstructorStandings = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `${JOLPICA_BASE_URL}/${CURRENT_YEAR}/constructorstandings.json`
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch constructor standings: ${response.status}`
                    );
                }

                const data = await response.json();

                if (
                    !data ||
                    !data.MRData ||
                    !data.MRData.StandingsTable ||
                    !data.MRData.StandingsTable.StandingsLists ||
                    data.MRData.StandingsTable.StandingsLists.length === 0
                ) {
                    throw new Error("No constructor standings available");
                }

                const constructorStandings =
                    data.MRData.StandingsTable.StandingsLists[0]
                        .ConstructorStandings;
                setStandings(constructorStandings);
                setLoading(false);
                setError(null);
            } catch (err: unknown) {
                console.error("Error fetching constructor standings:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch constructor standings"
                );
                setStandings([]);
                setLoading(false);
            }
        };

        fetchConstructorStandings();
    }, []);

    return { standings, loading, error };
};

// Helper function to get race results for a specific round
export const fetchRaceResults = async (season: string, round: string) => {
    try {
        const response = await fetch(
            `${JOLPICA_BASE_URL}/${season}/${round}/results.json`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch race results: ${response.status}`);
        }

        const data = await response.json();

        if (
            !data ||
            !data.MRData ||
            !data.MRData.RaceTable ||
            !data.MRData.RaceTable.Races ||
            data.MRData.RaceTable.Races.length === 0
        ) {
            throw new Error("No race results available");
        }

        return data.MRData.RaceTable.Races[0];
    } catch (err) {
        console.error("Error fetching race results:", err);
        throw err;
    }
};
