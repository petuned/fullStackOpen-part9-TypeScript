import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import patientService from "../services/patientService";
import { NonSensitivePatient, NewPatient, Patient } from "../types";
import newPatientSchema, { parseEntry } from "../utils";

const router = express.Router();

router.get("/", (_req, res: Response<NonSensitivePatient[]>) => {
  const data = patientService.getNonSensitivePatients();
  res.json(data);
});

const newPatientParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    newPatientSchema.parse(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof z.ZodError) {
    res.status(400).send({ error: error.issues[0].message });
  } else {
    next(error);
  }
};

router.get("/:id", (req, res: Response<Patient>) => {
  const data = patientService.getPatient(req.params.id);
  res.json(data);
});

router.post("/", newPatientParser, (req: Request<NewPatient>, res: Response) => {
  try {
    const patient = newPatientSchema.parse(req.body);
    const savedPatient = patientService.addNewPatient(patient);
    res.json(savedPatient);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).send({ error: error.issues });
    } else {
      res.status(400).send({ error: "unknown error" });
    }
  }
});

router.post("/:id/entries", (req, res: Response) => {
  try {
    const entry = parseEntry(req.body);
    const savedEntry = patientService.addNewEntry(req.params.id, entry);
    res.json(savedEntry);
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof Error) {
      res.status(400).send({ error: error.message });
    } else {
      res.status(400).send({ error: "Unknown error" });
    }
  }
});

router.use(errorMiddleware);

export default router;
