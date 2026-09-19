import { useParams } from "react-router-dom";
import { Diagnosis, EntryWithoutId, Patient } from "../../types";
import { useEffect, useState } from "react";
import { Alert, Container, DialogContent, Typography } from "@mui/material";
import { Woman } from "@mui/icons-material";
import { Man } from "@mui/icons-material";
import patientService from "../../services/patients";
import EntryInfo from "./EntryInfo";
import EntryForm from "./EntryForm";

interface PatientProps {
  diagnoses: Diagnosis[];
}

const PatientPage = ({ diagnoses }: PatientProps) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string>();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      patientService
        .getPatient(params.id)
        .then((result) => {
          setPatient(result);
        })
        .catch((error) => {
          console.log(error);
          error.response.data.error
            ? setError(error.response.data.error)
            : setError("unknown error");
          setTimeout(() => setError(undefined), 10000);
        });
    }
  }, [params.id]);

  const addEntry = (entry: EntryWithoutId) => {
    if (patient) {
      patientService
        .createEntry(patient?.id, entry)
        .then((result) => {
          setPatient({ ...patient, entries: [...patient.entries, result] });
        })
        .catch((error) => {
          console.log(error);
          error.response.data.error
            ? setError(error.response.data.error)
            : setError("unknown error");
          setTimeout(() => setError(undefined), 10000);
        });
    }
  };

  return (
    <div>
      {patient ? (
        <Container style={{ marginTop: "1em" }}>
          <Typography variant="h4" style={{ marginBottom: "0.5em" }}>
            {patient.name}
          </Typography>
          {patient.gender === "female" ? <Woman /> : <Man />}
          <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
            ssn: {patient.ssn}
          </Typography>
          <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
            occupation: {patient.occupation}
          </Typography>
          <DialogContent>
            {error && <Alert severity="error">{error}</Alert>}
          </DialogContent>
          <EntryForm addEntry={addEntry} diagnoses={diagnoses} />
          <Typography
            variant="h4"
            style={{ marginBottom: "0.5em", marginTop: "0.5em" }}
          >
            Entries
          </Typography>
          <>
            {patient.entries.map((entry, index) => (
              <EntryInfo key={index} entry={entry} diagnoses={diagnoses} />
            ))}
          </>
        </Container>
      ) : (
        <p>No patient selected</p>
      )}
    </div>
  );
};

export default PatientPage;
