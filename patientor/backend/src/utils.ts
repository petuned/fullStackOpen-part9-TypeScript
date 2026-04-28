import { Diagnosis, EntryWithoutId, Gender, HealthCheckRating } from "./types";
import { z } from "zod";

const newPatientSchema = z.object({
  name: z.string().trim().min(1),
  dateOfBirth: z.iso.date(),
  ssn: z.string().trim().min(10),
  gender: z.enum(Gender),
  occupation: z.string()
});

export const parseEntry = (object: unknown): EntryWithoutId => {
  if (!object || typeof object !== "object") {
    throw new Error("Incorrect or missing data");
  }

  if (
    "type" in object &&
    "description" in object &&
    "date" in object &&
    "specialist" in object
  ) {
    const newEntry = {
      description: parseString(object.description),
      date: parseString(object.date),
      specialist: parseString(object.specialist),
      diagnosisCodes: parseDiagnosisCodes(object)
    };
    switch (object.type) {
      case "HealthCheck":
        if (!("healthCheckRating" in object)) {
          throw new Error("Incorrect data: health check rating missing from entry");
        }
        return {
          ...newEntry,
          type: object.type,
          healthCheckRating: parseHealthCheck(object.healthCheckRating)
        };
      case "OccupationalHealthcare": {
        if (!("employerName" in object) || object.employerName === "") {
          throw new Error("Incorrect data: employer name missing from entry");
        }
        const tempObj = {
          ...newEntry,
          type: object.type,
          employerName: parseString(object.employerName)
        };
        if ("sickLeave" in object) {
          return {
            ...tempObj,
            sickLeave: parseSickLeave(object.sickLeave)
          };
        }
        return tempObj;
      }
      case "Hospital":
        if (!("discharge" in object)) {
          throw new Error("Incorrect data: discharge missing from entry");
        }
        return {
          ...newEntry,
          type: object.type,
          discharge: parseDischarge(object.discharge)
        };
      default:
        throw new Error("Entry type missing");
    }
  }
  throw new Error("Incorrect data: a field missing");
};

const isString = (text: unknown): text is string => {
  return typeof text === "string" || text instanceof String;
};

const parseString = (value: unknown): string => {
  if (!isString(value)) {
    throw new Error(`Value '${value}' is not a string`);
  }
  if (value === "") {
    throw new Error("Empty value");
  }
  return value;
};

const isDate = (date: string): boolean => {
  return Boolean(Date.parse(date));
};

const parseDate = (date: unknown): string => {
  if (!date || !isString(date) || !isDate(date)) {
    throw new Error("Incorrect or missing date: " + date);
  }
  return date;
};

const parseDiagnosisCodes = (object: unknown): Array<Diagnosis["code"]> => {
  if (!object || typeof object !== "object" || !("diagnosisCodes" in object)) {
    return [] as Array<Diagnosis["code"]>;
  }
  return object.diagnosisCodes as Array<Diagnosis["code"]>;
};

const parseHealthCheck = (rating: unknown): HealthCheckRating => {
  if (typeof rating !== "number" || rating < 0 || rating > 3) {
    throw new Error("Incorrect or missing health check rating: " + rating);
  }
  return rating;
};

const parseSickLeave = (sickLeave: unknown): object => {
  if (!sickLeave || typeof sickLeave !== "object") {
    throw new Error("Incorrect or missing sick leave: " + sickLeave);
  }
  if (!("startDate" in sickLeave) || !("endDate" in sickLeave)) {
    throw new Error("Incorrect or missing sick leave: start or end date missing");
  }
  return {
    startDate: parseDate(sickLeave.startDate),
    endDate: parseDate(sickLeave.endDate)
  };
};

const parseDischarge = (discharge: unknown): object => {
  if (!discharge || typeof discharge !== "object") {
    throw new Error("Discharge missing or not an object: " + discharge);
  }
  if (
    !("date" in discharge) ||
    !("criteria" in discharge) ||
    discharge.criteria === ""
  ) {
    throw new Error("Incorrect discharge: date or criteria value missing");
  }
  return {
    date: parseDate(discharge.date),
    criteria: parseString(discharge.criteria)
  };
};

export default newPatientSchema;
