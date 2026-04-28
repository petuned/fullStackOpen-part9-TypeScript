import { useParams } from "react-router-dom";
import { Diagnosis, EntryWithoutId, Patient } from "../../types";
import { useEffect, useState } from "react";
import {
  Container,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from "@mui/material";
import FemaleIcon from "@mui/icons-material/Female";
import MaleIcon from "@mui/icons-material/Male";
import patientService from "../../services/patients";
import EntryInfo from "./EntryInfo";
import EntryForm from "./EntryForm";

interface PatientProps {
  diagnoses: Diagnosis[];
}

const PatientPage = ({ diagnoses }: PatientProps) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [entryType, setEntryType] = useState("");
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      patientService
        .getPatient(params.id)
        .then((result) => {
          setPatient(result);
        })
        .catch((error) => console.log(error));
    }
  }, [params.id]);

  const handleEntryChange = (e: SelectChangeEvent<string>) => {
    e.preventDefault();
    setEntryType(e.target.value);
  };

  const addEntry = (entry: EntryWithoutId) => {
    if (patient) {
      patientService.createEntry(patient?.id, entry).then((result) => {
        console.log("Saatu vastaus ku lähetettii entry: ", result);
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
          {patient.gender === "female" ? <FemaleIcon /> : <MaleIcon />}
          <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
            ssn: {patient.ssn}
          </Typography>
          <Typography variant="body1" style={{ marginBottom: "0.5em" }}>
            occupation: {patient.occupation}
          </Typography>
          <InputLabel id="entry-type-select">Entry type</InputLabel>
          <Select
            value={entryType}
            onChange={handleEntryChange}
            style={{ minWidth: "20%" }}
            required
          >
            <MenuItem value={"hospital"}>Hospital</MenuItem>
            <MenuItem value={"occupational"}>Occupational</MenuItem>
            <MenuItem value={"healthCheck"}>Health check</MenuItem>
          </Select>
          <EntryForm entryType={entryType} addEntry={addEntry} />
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
